# 어른플랫폼 테스트 단계에서 실운영 전환에 가장 적합한 적용 방식

## 지금 먼저 할 것
1. PortOne 테스트 webhook secret / Store ID / channel key / API Secret 발급
2. backend/.env에 test 값만 먼저 입력
3. 결제 성공 / 취소 / 부분취소 / 환불 / webhook 재전송 / 중복수신 테스트
4. 판매자 필수 입력값 누락 차단 확인
5. 허용 SKU만 공개한 상태로 PG 사전상담 진행

## 마지막에 할 것
1. 운영 MID / live merchant 입력
2. live webhook secret 입력
3. live callback URL 등록
4. 프리미엄 배송 SLA 보장형 전환 검토

## 유지할 기본값
- PortOne SDK 사용
- test/live 완전 분리
- SKU 보수 운영
- 프리미엄 배송 목표형 유지
- 관리자 override 기본 비활성화
