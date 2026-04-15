# adultapp 내부 결제/운영 자체 점검 메모

## 이번 자체 점검에서 실제로 검증한 것
- PortOne SDK import 가능 여부
- 결제 상태머신 매핑
- 판매자 필수 입력값 누락 검증
- SKU 자동 분기(허용/보류/금지)
- TEST/LIVE 환경값 placeholder 상태 점검

## 이번 자체 점검에서 검증할 수 없는 것
- PortOne 콘솔에서 발급한 실제 TEST webhook secret / Store ID / channel key / API Secret 없이는 외부 결제망 테스트 불가
- 실제 결제/취소/부분취소/환불/webhook 재전송은 PortOne 테스트 채널 연결 후 재확인 필요
- LIVE merchant / LIVE webhook secret 입력은 마지막 단계에서만 수행 권장

## 권장 순서
1. PortOne TEST 값 발급
2. backend/.env에 TEST 값만 입력
3. `/api/payments/self-test-report` 확인
4. 테스트 결제/취소/부분취소/환불/webhook 재전송 검증
5. 판매자 필수 입력값 누락 차단 확인
6. 허용 SKU만 노출한 상태로 PG 사전상담 진행
