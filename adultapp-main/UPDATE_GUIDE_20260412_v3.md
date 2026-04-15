# adultapp 로그인/로그아웃/테스트계정 업데이트 v3

## 반영 내용
- 로그인 화면 상단 설명 문구 제거
- 로그인 화면 `앱으로 돌아가기` 버튼 제거
- `회원가입 화면으로` 문구를 `회원가입`으로 변경
- 테스트 계정 버튼 클릭 시 즉시 로그인 동작으로 변경
- 설정 > 로그아웃 시 확인창 없이 로그아웃 후 로그인 화면으로 이동
- 시드 로직을 보강해 기본 테스트 계정 4종(admin/customer/seller/general)을 기존 DB에도 다시 맞춰 넣도록 수정
- 관리자 계정의 2FA 상태를 테스트용으로 초기화하도록 보정

## 운영 반영 순서
1. ZIP 덮어쓰기
2. git add / commit / push
3. Railway 백엔드 재배포
4. Railway 환경변수로 현재 DB를 대상으로 `python scripts/init_runtime_db.py` 1회 실행
5. 프론트 build 후 Cloudflare Pages 수동 배포

## 핵심 주의
- 관리자 계정이 지금 로그인 안 되는 가장 가능성 높은 원인은 운영 DB에 기존 admin 계정 상태가 남아 있는 경우입니다.
- 이번 수정본만 덮어쓰고 배포해도, 기존 DB 내부 계정 상태는 자동으로 즉시 바뀌지 않을 수 있으므로 `railway run python scripts/init_runtime_db.py` 1회 실행이 필요합니다.
