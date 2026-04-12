# UPDATE GUIDE 2026-04-12 v8

- 테스트 계정 로그인은 DB가 불안정해도 즉시 로그인되도록 백엔드 데모 토큰 fallback 추가
- `/api/auth/me`는 데모 토큰이면 DB 조회 없이 사용자 정보를 반환
- `ensure_test_accounts` NameError 수정
- 일반 계정 로그인 로직은 유지하되, 테스트 계정은 DB timeout 영향 없이 홈 진입 가능
