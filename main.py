from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from paypal_pay import capture_paypal_order, create_paypal_order

app = FastAPI()


class CreateOrderRequest(BaseModel):
    product_id: int


class CaptureOrderRequest(BaseModel):
    order_id: str


@app.post("/api/paypal/create-order")
def create_order(payload: CreateOrderRequest):
    try:
        return create_paypal_order(payload.product_id)
    except StopIteration as exc:
        raise HTTPException(status_code=404, detail="Product not found") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/paypal/capture-order")
def capture_order(payload: CaptureOrderRequest):
    try:
        return capture_paypal_order(payload.order_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
