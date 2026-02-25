import logging
import os

from django.core.management import call_command

logger = logging.getLogger(__name__)


def run_startup_tasks() -> None:
    """
    Run database migrations and seed the Ramadan catalog on startup.

    This is used on Render free instances where we don't have Shell / pre-deploy
    commands. It is safe to run multiple times:
    - `migrate` is idempotent
    - `seed_ramadan_catalog` command was written to be idempotent
    """

    # Only run when explicitly enabled via environment variable.
    if os.environ.get("RUN_STARTUP_TASKS") != "1":
        return

    try:
        logger.info("Running startup tasks: migrate + seed_ramadan_catalog")
        call_command("migrate", interactive=False)
        call_command("seed_ramadan_catalog")
        logger.info("Startup tasks completed successfully.")
    except Exception:
        # We log the exception but do not prevent the app from starting.
        logger.exception("Startup tasks failed.")

