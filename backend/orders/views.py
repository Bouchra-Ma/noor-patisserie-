from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
import stripe

from .models import Order
from .serializers import OrderListSerializer, OrderSerializer


class OrderListView(ListAPIView):
    """List orders for the current authenticated user."""
    permission_classes = [IsAuthenticated]
    serializer_class = OrderListSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(RetrieveAPIView):
    """Retrieve a single order (only if it belongs to the current user)."""
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


@api_view(["GET"])
@permission_classes([AllowAny])
def order_by_checkout_session(request):
    """
    Return order details for a Stripe Checkout session_id (no auth).
    Used when the user lands on the success page in a different browser context (e.g. mobile)
    where localStorage is empty. We verify the session with Stripe then return the order.
    """
    session_id = request.query_params.get("session_id", "").strip()
    if not session_id:
        return Response({"error": "session_id required"}, status=status.HTTP_400_BAD_REQUEST)

    stripe_key = getattr(settings, "STRIPE_SECRET_KEY", "") or ""
    if not stripe_key:
        return Response(
            {"error": "Stripe not configured"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    stripe.api_key = stripe_key

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except stripe.error.StripeError:
        return Response({"error": "Invalid session"}, status=status.HTTP_400_BAD_REQUEST)

    metadata = session.get("metadata") or {}
    raw_order_id = metadata.get("order_id")
    try:
        order_id = int(raw_order_id) if raw_order_id is not None else None
    except (TypeError, ValueError):
        order_id = None
    if not order_id:
        return Response({"error": "Order not found for this session"}, status=status.HTTP_404_NOT_FOUND)

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    # Only return order if this session is the one stored for this order (and optionally paid)
    if order.stripe_session_id != session_id:
        return Response({"error": "Session does not match order"}, status=status.HTTP_404_NOT_FOUND)

    serializer = OrderListSerializer(order)
    return Response(serializer.data)
