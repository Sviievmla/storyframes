try:
    from fastapi import FastAPI
except ModuleNotFoundError:
    class FastAPI:
        def post(self, _path):
            def decorator(func):
                return func

            return decorator


app = FastAPI()


def capture_paypal_order(order_id: str):
    return {"order_id": order_id}


@app.post("/pay/paypal/capture")
def paypal_capture(order_id: str):
    return capture_paypal_order(order_id)
