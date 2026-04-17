# adultapp 성인인증 도입 방향 및 결정 항목 (2026-04-11)

## 이번 반영 요약
- 상단 설정 아이콘을 더 일반적인 톱니바퀴 형태로 교체
- 상단 검색/설정 아이콘 버튼의 외곽 테두리 제거 및 아이콘 두께 소폭 증가
- 프론트에 가입 전 본인확인/로그인/성인인증/실패/차단/모달 흐름 데모 추가
- 홈/쇼핑은 성인인증 완료 전 접근 차단, 홈 또는 쇼핑 한 번 인증되면 둘 다 접근 허용 구조 반영
- 실패횟수 5회 기준 1시간 쿨타임 데모 반영
- 프로필 화면에 현재 성인인증 상태 데모 패널 추가

## 현재 코드 기준 구현 상태
- 프론트 데모 상태 저장: localStorage
  - adultapp_identity_verified
  - adultapp_adult_verified
  - adultapp_adult_fail_count
  - adultapp_adult_cooldown_until
  - adultapp_demo_login_provider
- 관리자 계정은 우회 처리
- 일반 계정은 미인증 상태면 로그인/본인확인 안내 화면 노출
- 홈/쇼핑 접근 시 성인인증 안내 화면 및 모달 노출

## 실제 운영 시 권장 인증 구조
### 1안 (가장 권장)
- 회원가입 전: PASS 또는 휴대폰 본인확인
- 회원가입 후: 성인영역 진입 전 1회 추가 성인인증
- 로그인: 이메일/비밀번호 또는 카카오 로그인
- 서버 검증 완료 후: adult_verified = true

### 2안
- 카카오 로그인
- 첫 성인영역 진입 시 PASS/휴대폰 본인확인 추가
- 카카오는 로그인 수단, 성인인증 대체수단으로 쓰지 않음

## 반드시 구현해야 할 백엔드 항목
- User 필드 추가
  - adult_verified_at
  - adult_verification_method
  - adult_verification_provider
  - adult_verification_tx_id
  - adult_verification_status
  - adult_verification_fail_count
  - adult_verification_cooldown_until
- API 추가
  - POST /auth/identity/start
  - POST /auth/identity/callback
  - POST /auth/adult/start
  - POST /auth/adult/callback
  - GET /auth/adult/status
- 서버 검증
  - 프론트 성공 결과만 믿지 않고 서버에서 인증결과 직접 조회

## 운영자가 결심해야 하는 항목
1. 회원가입 전 본인확인을 필수로 할지, 가입 후 성인영역 진입 시점에만 할지
2. 로그인 기본 수단을 이메일 중심으로 갈지, 카카오 중심으로 갈지
3. 성인인증 실패횟수/쿨타임 기준을 5회/1시간으로 고정할지
4. 미성년 판정 시 계정 전체 차단인지, 성인영역만 차단인지
5. 홈을 완전 성인영역으로 볼지, 안전모드 홈과 성인 홈을 분리할지
6. 쇼핑 상세/장바구니/주문 중 어느 단계부터 성인인증을 강제할지
7. PASS 직접계약, 포트원/중계사 경유 중 무엇으로 갈지
8. 인증 로그 보관기간과 감사로그 범위를 어떻게 정할지

## 권장 다음 작업 순서
1. 백엔드 User/Schema/API 확장
2. 프론트 인증상태를 실제 API 연동 상태로 교체
3. 홈/쇼핑 외 채팅/소통/프로필 성인영역 세부 차단 범위 확정
4. 약관/개인정보/성인서비스 이용 고지 문안 추가
5. 실제 PASS/휴대폰 본인확인 공급사 연동

## 주의
- 현재 반영본은 데모 흐름이며 실제 본인확인 공급사 연동은 미포함
- localStorage 기반 상태는 테스트용이며 운영 환경에서는 서버 세션/토큰 기준으로 바꿔야 함
