try:
    from fastapi import Body, FastAPI, HTTPException
except ModuleNotFoundError:
    def Body(default=..., **_kwargs):
        return None if default is ... else default

    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str):
            super().__init__(detail)
            self.status_code = status_code
            self.detail = detail

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
    if not order_id or not order_id.strip():
        raise HTTPException(status_code=400, detail="Order ID is required")
    return {"order_id": order_id}


@app.post("/pay/paypal/capture")
def paypal_capture(order_id: str = Body(..., embed=True)):
    return capture_paypal_order(order_id)
