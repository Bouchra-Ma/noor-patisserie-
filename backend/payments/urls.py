from django.urls import path
from . import views

urlpatterns = [
    path('create-checkout-session/', views.create_checkout_session, name='create-checkout-session'),
    path('confirm-checkout-session/', views.confirm_checkout_session, name='confirm-checkout-session'),
    path('webhook/', views.stripe_webhook, name='stripe-webhook'),
]
