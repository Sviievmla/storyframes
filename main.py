try:
    from fastapi import FastAPI
except ModuleNotFoundError:
    class FastAPI:
        def __init__(self):
            self.routes = {}

        def post(self, path):
            def decorator(func):
                self.routes[path] = func
                return func

            return decorator


app = FastAPI()


def capture_paypal_order(order_id: str):
    if not order_id or not str(order_id).strip():
        return {"error": "Order ID is required"}
    return {"order_id": order_id}


@app.post("/pay/paypal/capture")
def paypal_capture(order_id: str):
    return capture_paypal_order(order_id)
