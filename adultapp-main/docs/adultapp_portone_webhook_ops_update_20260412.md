# adultapp PortOne / 통신판매중개 운영 보강 업데이트

## 이번 반영
- PortOne 테스트/운영 webhook secret 분리 설정 추가
- 결제 webhook raw body 기반 서명 검증 helper 추가
- webhook 중복 처리(idempotency)용 event 기록 저장 추가
- webhook 수신 후 paymentId 기준 PortOne 결제 재조회 helper 추가
- 주문 상태를 PortOne 비동기 상태에 맞게 매핑하도록 보강
- 판매자 필수 입력 누락 시 서버에서 신청 거절 및 관리자 화면 누락 필드 노출
- 상품 등록 시 SKU 정책 자동 분기(허용/수동심사/금지) 메타 저장 추가
- 통신판매중개 고지 문구/항목을 쇼핑 등록관리 화면에 추가

## 운영자가 채워야 하는 값
- PG_PORTONE_STORE_ID
- PG_PORTONE_CHANNEL_KEY
- PORTONE_API_SECRET
- PORTONE_WEBHOOK_SECRET_TEST
- PORTONE_WEBHOOK_SECRET_LIVE
- PG_PRIMARY_MERCHANT_ID
- PG_PRIMARY_API_KEY
- PG_PRIMARY_WEBHOOK_SECRET

## 주인님이 판단해야 하는 것
1. 테스트/운영 PortOne 채널을 완전히 분리할지
2. 금지 SKU 기준을 현재보다 더 보수적으로 잡을지
3. 프리미엄 배송 SLA를 보장형으로 공지할지 목표형으로 공지할지
4. 판매자 필수 입력 누락 시 주문 수락도 완전히 막을지
5. 관리자 승인 전 수동심사 상품을 어느 범위까지 허용할지

## 다음 순서
1. PortOne 콘솔 가입 / 비즈니스 인증
2. 전자결제 신청
3. 테스트 채널 추가
4. Store ID / V2 API Secret 발급
5. 테스트 webhook secret 발급 후 .env 반영
6. 테스트 결제/취소/환불/webhook 검증
7. SKU 표 확정
8. 환불/정산/프리미엄 배송 기준 최종 문서화
9. 운영 MID 발급 후 실연동 채널 등록
10. 운영 webhook URL / secret 반영 후 심사 제출
