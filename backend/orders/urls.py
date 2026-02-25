from django.urls import path
from . import views

urlpatterns = [
    path("", views.OrderListView.as_view(), name="order-list"),
    path("by-checkout-session/", views.order_by_checkout_session, name="order-by-checkout-session"),
    path("<int:pk>/", views.OrderDetailView.as_view(), name="order-detail"),
]
