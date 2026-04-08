# adultapp starter v4

성인용품 거래소 플랫폼의 웹 우선 MVP + 앱 래퍼 준비용 프로젝트입니다.

## 이번 보완 범위
- 실 PG 연동 준비용 merchant/api/webhook secret 바인딩 구조 추가
- 실 PASS/NICE 성인인증 준비용 provider / callback / status API 보강
- 세무증빙 자동화 준비용 tax dashboard / 발급사 env / 월마감 구조 보강
- JWT 로그인 / RBAC / 관리자 TOTP 2FA API 및 프론트 테스트 화면 추가
- 이중승인 queue / 보안 제어 / 앱 심사용 안전모드 UI 정리
- 앱/웹 공용 일반 커머스형 프론트 UI에 실연동 버튼/레이아웃 추가

## 샘플 로그인
- 관리자: `admin@example.com / admin1234`
- 사업자: `seller@example.com / seller1234`
- 고객: `customer@example.com / customer1234`

## 빠른 실행
### backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### frontend
```bash
cd frontend
npm install
npm run dev
```

## 실키 바인딩 위치
- `backend/app/config.py` : JWT / PG / PASS/NICE / 세무 / 2FA env 키
- `backend/app/routers/api.py` : 로그인 / RBAC / 2FA / integration overview API
- `frontend/src/App.tsx` : 관리자 로그인, OTP 검증, 바인딩 상태, 승인 큐 UI
- `infra/*.env.example` : Railway / Cloudflare / PG / 성인인증 / 보안 변수 예시

## 바로 이어서 해야 할 일
1. 실제 PG 공급사 SDK/서명 검증 모듈 분리
2. PASS/NICE 실 callback 결과를 계정활성화 플로우와 연결
3. 현금영수증/세금계산서 실제 발급사 연동 및 재시도 큐 구현
4. 관리자 2FA 백업코드, 분실복구, 감사로그 해시체인 저장 추가


## 테스트 계정

- 관리자: `admin@example.com` / `admin1234`
- 사업자: `seller@example.com` / `seller1234`
- 소비자: `customer@example.com` / `customer1234`
- 일반회원: `general@example.com` / `general1234`

## Cloudflare Pages 수동 배포
```bash
cd frontend
npm install
npx wrangler login
npx wrangler whoami
```

```bash
cd frontend
VITE_API_BASE_URL=https://your-railway-domain.up.railway.app/api npm run cf:build
npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true
```

Windows PowerShell helper:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\cloudflare_manual_deploy.ps1 -BackendApiBaseUrl "https://your-railway-domain.up.railway.app/api" -PagesProjectName "adultapp"
```
