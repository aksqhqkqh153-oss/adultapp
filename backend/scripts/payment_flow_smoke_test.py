from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.database import engine
from app.main import app
from app.models import Order, Product


REPORT_PATH = Path(__file__).resolve().parents[2] / "BUILD_CHECK_20260412_v31.txt"


def _login(client: TestClient) -> str:
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "admin1234", "device_name": "smoke-test"},
    )
    response.raise_for_status()
    data = response.json()
    token = data.get("access_token")
    assert token, data
    return token


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _json(response) -> dict[str, Any]:
    payload = response.json()
    assert isinstance(payload, dict), payload
    return payload


def _first_product_id() -> int:
    with Session(engine) as session:
        product = session.exec(select(Product).where(Product.status == "published")).first()
        assert product and product.id, "published product not found"
        return int(product.id)


def _order_status(order_no: str) -> str:
    with Session(engine) as session:
        order = session.exec(select(Order).where(Order.order_no == order_no)).first()
        assert order is not None, order_no
        return str(order.order_status)


def main() -> None:
    lines: list[str] = []
    with TestClient(app) as client:
        token = _login(client)
        headers = _auth_headers(token)
        product_id = _first_product_id()

        provider_status = _json(client.get("/api/provider-status"))
        self_test = _json(client.get("/api/self-test"))
        frontend_env = _json(client.get("/api/payments/frontend-env-check"))

        assert provider_status["test_env_ready"] is True, provider_status
        assert self_test["summary"]["failed"] == 0, self_test
        assert frontend_env["resolved_checkout"]["mode"] == "test", frontend_env
        lines.append("provider-status OK")
        lines.append("self-test OK")
        lines.append("frontend-env-check OK")

        created = _json(client.post("/api/orders", json={"product_id": product_id, "qty": 1}, headers=headers))
        order_no = created["order_no"]
        checkout = _json(client.get(f"/api/payments/orders/{order_no}/checkout-config", headers=headers))
        assert checkout["checkout"]["mode"] == "test", checkout

        confirmed = _json(
            client.post(
                "/api/payments/confirm",
                json={"order_no": order_no, "payment_id": f"pay_{order_no}", "amount": created["total_amount"]},
                headers=headers,
            )
        )
        assert confirmed["status"] == "paid", confirmed
        assert _order_status(order_no) == "paid"
        lines.append(f"confirm OK: {order_no}")

        partial = _json(
            client.post(
                f"/api/payments/orders/{order_no}/cancel",
                json={"amount": 1000, "reason": "partial_cancel_test", "idempotency_key": f"partial-{order_no}"},
                headers=headers,
            )
        )
        assert partial["status"] == "partial_cancelled", partial
        duplicate_partial = _json(
            client.post(
                f"/api/payments/orders/{order_no}/cancel",
                json={"amount": 1000, "reason": "partial_cancel_test", "idempotency_key": f"partial-{order_no}"},
                headers=headers,
            )
        )
        assert duplicate_partial["deduplicated"] is True, duplicate_partial
        mismatch = client.post(
            f"/api/payments/orders/{order_no}/cancel",
            json={"amount": created["total_amount"] + 999999, "reason": "too_much"},
            headers=headers,
        )
        assert mismatch.status_code == 400, mismatch.text
        lines.append(f"partial-cancel OK: {order_no}")

        created2 = _json(client.post("/api/orders", json={"product_id": product_id, "qty": 1}, headers=headers))
        order_no2 = created2["order_no"]
        _json(
            client.post(
                "/api/payments/confirm",
                json={"order_no": order_no2, "payment_id": f"pay_{order_no2}", "amount": created2["total_amount"]},
                headers=headers,
            )
        )
        full_cancel = _json(
            client.post(
                f"/api/payments/orders/{order_no2}/cancel",
                json={"reason": "full_cancel_test"},
                headers=headers,
            )
        )
        assert full_cancel["status"] == "cancelled", full_cancel
        lines.append(f"full-cancel OK: {order_no2}")

        created3 = _json(client.post("/api/orders", json={"product_id": product_id, "qty": 1}, headers=headers))
        order_no3 = created3["order_no"]
        _json(
            client.post(
                "/api/payments/confirm",
                json={"order_no": order_no3, "payment_id": f"pay_{order_no3}", "amount": created3["total_amount"]},
                headers=headers,
            )
        )
        partial_refund = _json(
            client.post(
                f"/api/payments/orders/{order_no3}/refund",
                json={"amount": 2000, "reason": "partial_refund_test", "idempotency_key": f"refund-{order_no3}"},
                headers=headers,
            )
        )
        assert partial_refund["status"] == "partial_cancelled", partial_refund
        duplicate_refund = _json(
            client.post(
                f"/api/payments/orders/{order_no3}/refund",
                json={"amount": 2000, "reason": "partial_refund_test", "idempotency_key": f"refund-{order_no3}"},
                headers=headers,
            )
        )
        assert duplicate_refund["deduplicated"] is True, duplicate_refund
        refund_mismatch = client.post(
            f"/api/payments/orders/{order_no3}/refund",
            json={"amount": created3["total_amount"] + 999999, "reason": "too_much"},
            headers=headers,
        )
        assert refund_mismatch.status_code == 400, refund_mismatch.text
        lines.append(f"partial-refund OK: {order_no3}")

        created4 = _json(client.post("/api/orders", json={"product_id": product_id, "qty": 1}, headers=headers))
        order_no4 = created4["order_no"]
        _json(
            client.post(
                "/api/payments/confirm",
                json={"order_no": order_no4, "payment_id": f"pay_{order_no4}", "amount": created4["total_amount"]},
                headers=headers,
            )
        )
        full_refund = _json(
            client.post(
                f"/api/payments/orders/{order_no4}/refund",
                json={"reason": "full_refund_test"},
                headers=headers,
            )
        )
        assert full_refund["status"] == "refunded", full_refund
        lines.append(f"full-refund OK: {order_no4}")

    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"ok": True, "checks": lines, "report": str(REPORT_PATH)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
