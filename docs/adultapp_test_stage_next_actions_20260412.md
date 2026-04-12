# adultapp 테스트 단계 추가 적용 기준 (2026-04-12)

## 이번에 고정한 판단

- PortOne 공식 SDK는 지금 바로 설치해서 테스트 채널부터 사용합니다.
- test/live 값은 완전 분리하고, live 값은 운영 MID 발급 직전까지 넣지 않습니다.
- SKU는 PG 사전상담 전까지 보수적으로 유지합니다.
- 프리미엄 배송 문구는 운영 안정화 전까지 목표형/안내형만 사용합니다.
- 판매자 필수 입력값 누락 시 상품 등록/공개/주문 수락을 차단하고, 테스트 관리자만 override를 허용합니다.

## 지금 바로 해야 할 것

1. PortOne 테스트 webhook secret, Store ID, channel key, API Secret 발급
2. backend/.env에 test 값만 먼저 입력
3. 결제/취소/부분취소/환불/webhook 재전송 테스트
4. 판매자 필수 입력값 누락 차단 동작 확인
5. 허용 SKU만 노출한 상태로 PG 사전상담 진행
6. 운영 MID / merchant 실제값은 마지막 단계에서 반영

## 아직 미루는 것

- live webhook secret / live merchant 실제값 입력
- 프리미엄 배송 보장형 문구 전환
- SKU 확장 공개
- 관리자 override 비활성화
