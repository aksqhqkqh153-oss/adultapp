
# implementation_ready_v3

## 이번 보완
- PG provider / webhook sample / 결제분기 구조 API 추가
- 성인인증 provider / status placeholder API 추가
- 세무증빙 자동화 준비 dashboard / jobs / month close 구조 추가
- 관리자 2FA / IP allowlist / 이중승인 queue 구조 추가
- 앱 제출용 placeholder PNG 자산 추가
- 일반 커머스형 웹/앱 UI로 프론트 재구성

## 다음 실제 구현 순서
1. PostgreSQL 마이그레이션 적용
2. JWT 로그인 + RBAC + 관리자 2FA
3. PASS/NICE 실성인인증 callback 연결
4. PG 테스트키 연동 + webhook 검증
5. 현금영수증 / 세금계산서 실큐 연동
6. 이중승인 저장소 및 승인로그 DB화
7. Capacitor 빌드 및 스토어 제출 캡처 자동화
