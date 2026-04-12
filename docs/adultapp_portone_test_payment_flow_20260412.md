# PortOne TEST 결제 흐름 점검 가이드

## 1. Railway TEST 환경변수
- PG_PORTONE_STORE_ID_TEST
- PG_PORTONE_CHANNEL_KEY_TEST
- PG_PRIMARY_MERCHANT_ID_TEST
- PORTONE_API_SECRET
- PORTONE_WEBHOOK_SECRET_TEST
- TOSS_MID_TEST
- TOSS_CLIENT_KEY_TEST
- TOSS_SECRET_KEY_TEST

## 2. Cloudflare Pages 프론트 환경변수
- VITE_API_BASE_URL
- VITE_API_BASE_FALLBACKS
- VITE_PORTONE_STORE_ID
- VITE_TOSS_CLIENT_KEY

## 3. 로컬/배포 확인 API
- GET /api/provider-status
- GET /api/self-test
- GET /api/launch-priority
- GET /api/payments/frontend-env-check
- GET /api/payments/orders/{order_no}/checkout-config

## 4. 테스트 흐름
1. 로그인
2. 주문 생성
3. checkout-config 조회
4. /api/payments/confirm
5. /api/payments/orders/{order_no}/cancel (전체/부분)
6. /api/payments/orders/{order_no}/refund
7. webhook pg/refund 테스트

## 5. 주의
- Cloudflare에는 secret 값 금지
- Railway에만 API secret / webhook secret / toss secret key 입력
- test/live 혼용 금지
