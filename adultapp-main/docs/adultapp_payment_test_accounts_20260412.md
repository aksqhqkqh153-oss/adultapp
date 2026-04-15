# adultapp payment test accounts 2026-04-12

## 기본 시드 테스트 계정
- 관리자: `admin@example.com` / `admin1234`
- 회원: `customer@example.com` / `customer1234`
- 판매자: `seller@example.com` / `seller1234`
- 일반회원(성인인증 미완료 확인용): `general@example.com` / `general1234`

## 앱 내 테스트 경로
1. 프로필 > 가입/로그인 영역에서 테스트 계정 버튼 클릭
2. 쇼핑 > 목록에서 상품을 장바구니에 담기
3. 쇼핑 > 바구니에서 주문 생성
4. 쇼핑 > 주문에서 결제승인 / 전체취소 / 부분취소 / 전체환불 / 부분환불 / webhook 점검 실행

## 점검 포인트
- 로그아웃 후 프로필 로그인 화면으로 즉시 복귀
- 회원 계정에서 주문 생성 및 결제 승인 가능
- 관리자 계정에서 전체 주문 목록 확인 가능
- 부분취소/부분환불은 입력 금액 기준으로 상태 전이 확인
- webhook 점검 버튼으로 서명 점검 API 호출 확인
