# PG 연동 사전 준비 문서

## 현재 구현 범위
- 주문 생성 시 payment_pending 상태 저장
- PG webhook 승인/취소/환불 수신 골격 추가
- 정산 기준 메모와 운영 정책 문서화

## 운영 전 입력 필요 값
- `PG_PORTONE_STORE_ID`
- `PG_PORTONE_CHANNEL_KEY`
- `PG_PRIMARY_MERCHANT_ID`
- `PG_PRIMARY_API_KEY`
- `PG_PRIMARY_WEBHOOK_SECRET`
- 운영 merchant / webhook URL / 환불 webhook URL

## 출시 전 체크
- 카드 승인/취소/환불 샌드박스 테스트
- 정산 기준 검증
- 주문/환불 상태머신 확인
- 세금계산서/현금영수증/정산증빙 운영 절차 확인
