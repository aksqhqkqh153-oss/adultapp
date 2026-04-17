# adultapp login cors/auth fix 2026-04-12

- 프론트 로그인 전 단계에서 products/auth 호출 중 500이 나도 CORS 헤더가 유지되도록 백엔드 예외 응답을 JSON으로 고정했습니다.
- 테스트 계정 로그인 시 seed 보정이 실패해도 전체 로그인 요청이 500으로 죽지 않도록 예외를 흡수했습니다.
- 디바이스 세션/리프레시 토큰 저장이 실패하면 access token만으로라도 로그인 흐름이 이어지도록 fallback을 추가했습니다.
- products 목록 조회가 실패하면 빈 배열을 반환하도록 완화했습니다.
- login 시 SellerProfile까지 만지는 강한 보정을 제거하고 User 중심 보정으로 바꿨습니다.
