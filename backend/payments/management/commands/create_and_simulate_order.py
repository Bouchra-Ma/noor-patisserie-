from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory
import json
from catalog.models import Product
from orders.models import Order, OrderItem
from payments import views


class Command(BaseCommand):
    help = 'Create a test order (using first available product) and simulate a checkout.session.completed webhook for it.'

    def handle(self, *args, **options):
        # Ensure a user exists
        user = User.objects.filter(is_superuser=True).first()
        if not user:
            user, created = User.objects.get_or_create(
                username='testuser',
                defaults={'email': 'testuser@example.com'}
            )
            if created:
                user.set_password('testpass')
                user.save()

        # Pick first product with stock > 0
        product = Product.objects.filter(stock__gt=0).first()
        if not product:
            self.stdout.write(self.style.ERROR('No product with stock > 0 found.'))
            return

        quantity = 1
        total = product.price * quantity

        order = Order.objects.create(
            user=user,
            total_amount=total,
            status='pending'
        )

        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=quantity,
            price=product.price,
        )

        self.stdout.write(self.style.SUCCESS(f'Created test order {order.id} for user {user.email}'))

        # Simulate webhook event
        event = {
            'id': f'evt_simulated_{order.id}',
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'id': f'cs_test_sim_{order.id}',
                    'metadata': {'order_id': str(order.id)},
                    'payment_intent': f'pi_test_sim_{order.id}'
                }
            }
        }

        factory = APIRequestFactory()
        request = factory.post('/api/payments/webhook/', data=json.dumps(event), content_type='application/json')
        request.META['HTTP_STRIPE_SIGNATURE'] = ''

        response = views.stripe_webhook(request)
        status = getattr(response, 'status_code', None)
        self.stdout.write(self.style.SUCCESS(f'Simulated webhook for order {order.id}, response status: {status}'))
