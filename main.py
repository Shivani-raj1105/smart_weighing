from fastapi import FastAPI
from services.device_manager import start_machine_safe
from services.machine_registry import get_machine
from services.mqtt_service import start_mqtt_service

app = FastAPI()

@app.on_event("startup")
def start_mqtt():
    start_mqtt_service()

# -----------------------------
# 1️⃣ Machine Status Endpoint
# -----------------------------
@app.get("/machine/{machine_id}/status")
def machine_status(machine_id: str):

    machine = get_machine(machine_id)

    if machine:
        return {
            "machine_id": machine_id,
            "status": machine["state"]
        }

    return {
        "machine_id": machine_id,
        "status": "unknown"
    }


# -----------------------------
# 2️⃣ Create Payment Order
# -----------------------------
@app.post("/create-order")
def create_payment_order(machine_id: str, amount: int):

    return {
        "success": True,
        "machine_id": machine_id,
        "amount": amount,
        "order_id": "demo_order_123"
    }


# -----------------------------
# 3️⃣ Payment Webhook
# -----------------------------
@app.post("/payment-webhook")
def payment_webhook(payment_id: str, machine_id: str):

    result = start_machine_safe(machine_id, 10)

    return {
        "payment_id": payment_id,
        "machine_id": machine_id,
        "machine_started": result
    }


# -----------------------------
# 4️⃣ Activate Machine (Testing)
# -----------------------------
@app.post("/activate-machine")
def activate_machine(machine_id: str, duration: int = 10):

    result = start_machine_safe(machine_id, duration)

    return result


# -----------------------------
# 5️⃣ Transaction Status
# -----------------------------
@app.get("/transaction/{transaction_id}")
def transaction_status(transaction_id: str):

    return {
        "transaction_id": transaction_id,
        "status": "completed"
    }