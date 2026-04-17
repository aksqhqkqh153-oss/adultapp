# PortOne 기반 PASS 통합 연동 메모

## 1차 운영 정책
- 1차는 PortOne 기반 PASS 통합 연동으로 시작
- 카카오는 로그인 편의 수단으로만 사용
- 운영 안정화 후 NICE/Danal 직접 전환 검토

## 실제 운영 전 입력 필요 값
- `ADULT_VERIFICATION_CLIENT_ID`
- `ADULT_VERIFICATION_CLIENT_SECRET`
- `ADULT_VERIFICATION_PORTONE_STORE_ID`
- `ADULT_VERIFICATION_PORTONE_CHANNEL_KEY`
- `ADULT_VERIFICATION_WEBHOOK_SECRET`
- callback/webhook URL

## 서버 구현 포함 범위
- 시작 API
- callback/webhook signature 검증 골격
- tx_id 저장
- 미성년/성인 결과 반영
- 오류코드 맵 설정

## 운영 전 최종 확인
- 실연동 테스트
- callback 서명 검증
- 서버 저장 확인
- 장애 알림 채널 확인
- 운영 점검표 확인
