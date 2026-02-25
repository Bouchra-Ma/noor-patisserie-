from django.core.management.base import BaseCommand
from rest_framework.test import APIRequestFactory
import json
from payments import views


class Command(BaseCommand):
    help = 'Simulate a Stripe webhook event for a given order id (checkout.session.completed)'

    def add_arguments(self, parser):
        parser.add_argument('order_id', type=int, help='Order ID to simulate the webhook for')

    def handle(self, *args, **options):
        order_id = options['order_id']

        event = {
            'id': f'evt_simulated_{order_id}',
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'id': f'cs_test_sim_{order_id}',
                    'metadata': {'order_id': str(order_id)},
                    'payment_intent': f'pi_test_sim_{order_id}'
                }
            }
        }

        factory = APIRequestFactory()
        request = factory.post('/api/payments/webhook/', data=json.dumps(event), content_type='application/json')
        # No signature header; the view will use the fallback when STRIPE_WEBHOOK_SECRET is not set
        request.META['HTTP_STRIPE_SIGNATURE'] = ''

        response = views.stripe_webhook(request)
        status = getattr(response, 'status_code', None)
        self.stdout.write(self.style.SUCCESS(f'Simulated webhook for order {order_id}, response status: {status}'))
