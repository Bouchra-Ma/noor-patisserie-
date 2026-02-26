import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from orders.models import Order, OrderItem
from catalog.models import Product

logger = logging.getLogger('payments.webhook')


def _fulfill_paid_order(order: Order, payment_intent_id: str | None):
    """
    Mark order as paid (idempotent), decrement stock, and send email.
    """
    if order.status == "paid":
        return

    order.status = "paid"
    order.stripe_payment_intent_id = payment_intent_id
    order.save()
    logger.info("Order %s marked as paid (payment_intent=%s)", order.id, payment_intent_id)

    # Decrement stock with logging
    for item in order.items.all():
        product = item.product
        old_stock = product.stock
        new_stock = max(0, old_stock - item.quantity)
        product.stock = new_stock
        product.save()
        logger.info(
            "Decremented stock for product %s (%s): %s -> %s",
            product.id,
            product.name,
            old_stock,
            new_stock,
        )

    # Send confirmation email (console backend in dev)
    try:
        send_mail(
            subject=f"Commande #{order.id} confirmée",
            message=(
                f"Merci pour votre commande #{order.id}.\n\n"
                f"Montant: {order.total_amount} €\n\n"
                "Nous préparons votre livraison."
            ),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com"),
            recipient_list=[order.user.email],
        )
        logger.info("Confirmation email sent for order %s to %s", order.id, order.user.email)
    except Exception:
        logger.exception("Failed to send confirmation email for order %s", order.id)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    """
    Create a Stripe Checkout session for authenticated users.
    Expects items: [{ id, name, price, quantity }]
    """
    try:
        stripe_secret = getattr(settings, "STRIPE_SECRET_KEY", "") or ""
        if not stripe_secret.strip():
            # Debug message to help understand configuration issues
            return Response(
                {
                    "error": "Stripe is not configured (missing STRIPE_SECRET_KEY).",
                    "debug_stripe_secret_present": bool(stripe_secret),
                    "debug_env_value_prefix": (stripe_secret[:8] if stripe_secret else ""),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        stripe.api_key = stripe_secret

        items_data = request.data.get('items', [])
        
        if not items_data:
            return Response(
                {'error': 'No items provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate total and create line items for Stripe
        total_amount = 0
        line_items = []
        order_items = []

        for item_data in items_data:
            product_id = item_data.get('id')
            quantity = item_data.get('quantity', 1)
            price = item_data.get('price')

            # Fetch product from DB to validate
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response(
                    {'error': f'Product {product_id} not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check stock
            if product.stock < quantity:
                return Response(
                    {'error': f'Insufficient stock for {product.name}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            item_total = price * quantity
            total_amount += item_total

            # Prepare for Stripe
            line_items.append({
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': product.name,
                        'description': product.description,
                    },
                    'unit_amount': int(price * 100),  # Stripe uses cents
                },
                'quantity': quantity,
            })

            order_items.append({
                'product': product,
                'quantity': quantity,
                'price': price,
            })

        # Create Order in DB
        order = Order.objects.create(
            user=request.user,
            total_amount=total_amount,
            status='pending'
        )

        logger.info("Created Order %s for user %s (pending) total=%s", order.id, request.user.email, total_amount)

        # Create OrderItems
        for item_info in order_items:
            OrderItem.objects.create(
                order=order,
                product=item_info['product'],
                quantity=item_info['quantity'],
                price=item_info['price'],
            )

        frontend_url = getattr(settings, "FRONTEND_URL", "http://127.0.0.1:3000").rstrip("/")
        default_success_url = f"{frontend_url}/success?order_id={order.id}&session_id={{CHECKOUT_SESSION_ID}}"
        default_cancel_url = f"{frontend_url}/cart"

        success_url_param = request.query_params.get("success_url", "").strip().rstrip("/")
        if success_url_param:
            success_url = f"{success_url_param}?order_id={order.id}&session_id={{CHECKOUT_SESSION_ID}}"
        else:
            success_url = request.query_params.get("success_url") or default_success_url
        cancel_url = request.query_params.get("cancel_url") or default_cancel_url

        # Create Stripe Checkout Session
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=request.user.email,
            metadata={'order_id': order.id},
        )

        # Store session ID in order
        order.stripe_session_id = session.id
        order.save()

        logger.info("Created Stripe session %s for order %s", session.id, order.id)

        return Response(
            {'url': session.url},
            status=status.HTTP_200_OK
        )

    except stripe.error.StripeError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_checkout_session(request):
    """
    Fallback confirmation endpoint (useful in local dev without webhooks).
    Expects: { session_id: "cs_test_..." }
    Retrieves the Stripe Checkout Session and marks the related Order as paid if payment_status == "paid".
    """
    session_id = (request.data or {}).get("session_id")
    if not session_id:
        return Response({"error": "session_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    if not getattr(settings, "STRIPE_SECRET_KEY", ""):
        return Response(
            {"error": "Stripe is not configured (missing STRIPE_SECRET_KEY)."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    stripe.api_key = settings.STRIPE_SECRET_KEY

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except stripe.error.StripeError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    metadata = session.get("metadata", {}) or {}
    order_id = metadata.get("order_id")
    payment_status = session.get("payment_status")
    payment_intent_id = session.get("payment_intent")

    if not order_id:
        # Fallback: try to find by stored session id
        order = Order.objects.filter(user=request.user, stripe_session_id=session_id).first()
        if not order:
            return Response({"error": "Order not found for this session"}, status=status.HTTP_404_NOT_FOUND)
    else:
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    # Only fulfill when Stripe says it's paid
    if payment_status == "paid":
        _fulfill_paid_order(order, payment_intent_id)
    else:
        logger.info(
            "confirm_checkout_session: session_id=%s order_id=%s payment_status=%s",
            session_id,
            order.id,
            payment_status,
        )

    return Response(
        {
            "order_id": order.id,
            "status": order.status,
            "payment_status": payment_status,
        },
        status=status.HTTP_200_OK,
    )



@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """Handle Stripe webhook events: mark order paid, decrement stock, send email."""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
    webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')

    if not getattr(settings, "STRIPE_SECRET_KEY", ""):
        logger.error("Stripe webhook called but STRIPE_SECRET_KEY is missing")
        return Response(status=500)
    stripe.api_key = settings.STRIPE_SECRET_KEY

    # In production, require a signed webhook
    if not getattr(settings, "DEBUG", True) and not webhook_secret:
        logger.error("STRIPE_WEBHOOK_SECRET is required in production")
        return Response(status=500)

    logger.debug('Received Stripe webhook: payload_size=%s sig_header=%s webhook_secret_set=%s',
                 len(payload) if payload is not None else 0,
                 bool(sig_header),
                 bool(webhook_secret))

    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        else:
            # Fallback for testing without a webhook secret (less secure)
            event = stripe.Event.construct_from(request.data, stripe.api_key)
    except ValueError as e:
        logger.error('Invalid payload for Stripe webhook: %s', e)
        return Response(status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error('Invalid Stripe signature: %s', e)
        return Response(status=400)

    logger.info('Stripe event received: id=%s type=%s', event.get('id'), event.get('type'))

    # Handle the checkout session completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get('metadata', {}) or {}
        order_id = metadata.get('order_id')
        payment_intent = session.get('payment_intent')

        logger.info('Processing checkout.session.completed: session_id=%s order_id=%s payment_intent=%s',
                    session.get('id'), order_id, payment_intent)

        if order_id:
            try:
                order = Order.objects.get(id=order_id)
            except Order.DoesNotExist:
                logger.warning('Order %s not found for webhook session %s', order_id, session.get('id'))
                return Response(status=200)

            logger.debug('Order %s current status=%s', order.id, order.status)

            if order.status == 'paid':
                logger.info('Order %s already marked as paid; ignoring duplicate webhook', order.id)
                return Response(status=200)

            try:
                _fulfill_paid_order(order, payment_intent)
            except Exception:
                logger.exception('Failed processing order %s in webhook', order.id)

    else:
        logger.debug('Unhandled Stripe event type: %s', event['type'])

    return Response(status=200)
