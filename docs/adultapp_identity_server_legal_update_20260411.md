# adultapp 본인확인/성인인증/법정문서 보강 내역

## 반영 항목
- PASS/휴대폰 본인확인 공급사 설정값 분리
- 테스트/운영 모드 분리용 환경변수 추가
- 본인확인/성인인증 callback signature 검증 골격 추가
- 인증사 정보 조회 API(`/api/auth/verification/providers`) 추가
- 법정 문서 고정 링크 API(`/api/legal/public-links`) 추가
- 개인정보처리방침/이용약관/청소년보호정책 운영 반영본 초안 보강
- 프론트 하단 고정 법정 문서 링크 추가
- 판단 필요 항목 문서(`docs/adultapp_identity_legal_decisions_20260411.md`) 추가

## 아직 남는 실제 운영 작업
- 인증사 계약 및 운영키 발급
- 콜백 URL 실도메인 확정
- 인증사 응답코드/실패코드 매핑
- 운영용 webhook secret 반영
- 법무 최종 검토 후 문구 확정
