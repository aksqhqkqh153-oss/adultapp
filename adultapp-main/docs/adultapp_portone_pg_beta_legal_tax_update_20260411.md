# adultapp PortOne/PG/법적·세무 보강 업데이트

## 이번 반영 요약
- PortOne 기반 PASS 통합 연동 설정값 확장
- 인증 callback/webhook 검증 골격 보강
- PG webhook 승인/취소/환불 골격 추가
- 베타 기간 사업자 표시정보 DB override API 추가
- 지역 선택형/거리 대역형 정책 문구 보강
- 미성년 차단 계정 1년 보관 후 파기 배치 스크립트 추가
- 국내 출시 법적·세무 재검토 문서 추가

## 핵심 파일
- `backend/app/config.py`
- `backend/app/routers/api.py`
- `backend/.env.example`
- `frontend/src/App.tsx`
- `docs/legal_templates/*.md`
- `scripts/maintenance/purge_minor_blocked_accounts.py`
- `docs/ops_minor_block_purge.md`
- `docs/portone_pass_integration_notes.md`
- `docs/pg_integration_preflight.md`
- `docs/adultapp_legal_tax_recheck_20260411.md`

## 아직 남은 핵심
- PortOne 실제 운영키/채널키/secret 입력
- PG 운영 merchant/webhook 실연동
- 사업자 표시정보 실제값 교체
- 관리자 예외 승인 전용 백오피스 UI
- 판매자/상품 승인 운영 백오피스 고도화
