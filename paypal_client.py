import os

from paypalcheckoutsdk.core import LiveEnvironment, PayPalHttpClient, SandboxEnvironment


class PayPalClient:
    def __init__(self):
        client_id = os.environ.get("PAYPAL_CLIENT_ID")
        client_secret = os.environ.get("PAYPAL_CLIENT_SECRET")
        if not client_id or not client_secret:
            raise ValueError("PayPal credentials not configured")

        api_base = os.environ.get("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com")
        if "sandbox" in api_base:
            environment = SandboxEnvironment(client_id=client_id, client_secret=client_secret)
        else:
            environment = LiveEnvironment(client_id=client_id, client_secret=client_secret)

        self.client = PayPalHttpClient(environment)

    def get_client(self):
        return self.client
