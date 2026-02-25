from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create a non-superuser test account (username: test2, password: testpass2)'

    def handle(self, *args, **options):
        username = 'test2'
        email = 'test2@example.com'
        password = 'testpass2'

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User {username} already exists'))
            return

        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        self.stdout.write(self.style.SUCCESS(f'Created user {username} with password {password}'))
