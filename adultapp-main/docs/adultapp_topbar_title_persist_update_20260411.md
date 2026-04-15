# adultapp 상단바 제목/아이콘/HTML요소 유지 업데이트

## 반영 내용
- 설정 아이콘을 검색 아이콘과 같은 계열의 일반적인 무채색 톱니형 SVG로 교체
- 상단 화면 제목을 검색 버튼 바로 좌측에 고정 배치
- 검색 오버레이 진입 시 제목을 `검색`, 설정 오버레이 진입 시 제목을 `설정`으로 표시
- 상단 좌측 하위 카테고리 버튼을 감싸던 1차 래퍼 레이아웃 제거
- HTML요소 ON 상태를 localStorage(`adultapp_html_inspector_enabled`)에 저장해 화면 전환 후에도 유지

## 수정 파일
- frontend/src/App.tsx
- frontend/src/styles.css

## 빌드 점검
- `npm run build` 성공
- 생성 산출물:
  - `dist/assets/index-WpubJAe2.css`
  - `dist/assets/index-DiXa9XZr.js`
