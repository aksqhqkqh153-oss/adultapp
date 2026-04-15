# adultapp 회원가입 / 개인정보 동의 / 랜덤채팅 프로필 게이트 업데이트

## 반영 내용
- 회원가입 3단계 흐름 추가
  - 1단계: 법정 문서 확인 및 필수/선택 동의 분리
  - 2단계: 가입 입력(이메일/카카오, 비밀번호, 표시 이름, 본인확인 결과 토큰, 성인인증 상태)
  - 3단계: 선택 정보 입력(성별, 연령대, 지역, 관심 카테고리, 마케팅 수신)
- 선택 동의 미체크만으로 회원가입이 막히지 않도록 처리
- 성별/연령대/지역 미입력 시 불편 안내 문구 추가
- 랜덤채팅은 성별/연령대/지역이 모두 입력돼야 사용 가능하도록 게이트 추가
- 프로필 화면에 동의 이력 저장 예시 및 랜덤채팅 필수 프로필 편집 카드 추가
- 백엔드 모델/스키마에 동의 이력 및 본인확인/성인인증 저장용 필드 초안 추가

## 저장 구조 초안
- User
  - identity_verified
  - login_provider
  - identity_verification_method
  - identity_verification_token
  - identity_verified_at
  - adult_verified_at
  - adult_verification_status
- ConsentRecord
  - user_id
  - consent_type
  - is_required
  - agreed
  - version
  - ip_address
  - user_agent
  - agreed_at

## 주의
- 이번 반영본은 실제 PASS/휴대폰 인증사 API 연동 전 단계의 프론트 흐름/저장 구조 데모 반영본입니다.
- 주민등록번호 원문 저장 로직은 포함하지 않았습니다.
- 실제 운영 전에는 백엔드 API, 인증사 서버 검증, 재동의 판단 로직(auth/me) 연결이 추가되어야 합니다.
