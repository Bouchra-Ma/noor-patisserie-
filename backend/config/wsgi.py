"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_wsgi_application()

# On Render free instances we don't have shell or pre-deploy commands.
# When RUN_STARTUP_TASKS=1 is set in the environment, we run migrations
# and the idempotent seed command automatically at startup.
try:
    from .startup import run_startup_tasks

    run_startup_tasks()
except Exception:
    # If anything goes wrong here, we don't want to stop the app from booting.
    # Detailed errors will be visible in the logs.
    pass
