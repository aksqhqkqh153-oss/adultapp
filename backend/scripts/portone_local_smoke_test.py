from __future__ import annotations

import hashlib
import hmac
import json
from urllib.error import HTTPError
from urllib.request import Request, urlopen

BASE = "http://127.0.0.1:8001/api"
WEBHOOK_SECRET = "whsec_DGtTRx8mhRZU++fgiHvT+xXaVh2YP9eKhWjAJHI7FIk="


def _post(path: str, payload: dict, headers: dict[str, str] | None = None) -> tuple[int, str]:
    body = json.dumps(payload, separators=(",", ":")).encode()
    req = Request(f"{BASE}{path}", data=body, headers={"Content-Type": "application/json", **(headers or {})}, method="POST")
    try:
        with urlopen(req) as response:
            return response.status, response.read().decode()
    except HTTPError as exc:
        return exc.code, exc.read().decode()


def main() -> None:
    payload = {
        "environment": "test",
        "id": "evt_script_smoke_1",
        "type": "payment.updated",
        "paymentId": "pay_script_smoke_1",
        "merchant_uid": "ORD-WEBHOOK-SMOKE",
        "status": "Paid",
    }
    body = json.dumps(payload, separators=(",", ":")).encode()
    signature = hmac.new(WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
    status, text = _post("/payments/webhooks/test-signature", payload, {"x-signature": signature})
    print("signature_check", status, text)


if __name__ == "__main__":
    main()
