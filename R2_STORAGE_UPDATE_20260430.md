# R2 이미지 저장소 연동 업데이트

## 적용 내용
- FastAPI `/api/upload`가 Cloudflare R2 설정값이 존재하면 R2 버킷으로 파일을 저장합니다.
- R2가 설정되지 않았고 `LOCAL_UPLOADS_ALLOWED=false`이면 로컬 저장 대신 500 오류를 반환해 운영 저장소 누락을 방지합니다.
- 프론트 피드/스토리/소통 작성 화면은 게시 시 첨부 파일을 `/api/upload`로 업로드하고 반환된 `public_url`을 화면 표시 URL로 사용합니다.

## Railway 필수 환경변수
```env
R2_ACCOUNT_ID=5a3db2754f05d52f6f8b56a1729dbee7
R2_ACCESS_KEY=발급받은_Access_Key
R2_SECRET_KEY=발급받은_Secret_Key
R2_BUCKET_NAME=adultapp-images
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
R2_UPLOAD_PREFIX=uploads
R2_ENABLED=true
LOCAL_UPLOADS_ALLOWED=false
```

## 확인 방법
1. Railway 재배포 후 로그인 상태에서 앱의 피드/스토리/소통 작성 화면에서 이미지를 첨부합니다.
2. 게시하면 R2 `adultapp-images` 버킷의 `uploads/YYYY/MM/DD/` 경로에 파일이 생성됩니다.
3. 앱 화면에는 R2 Public URL 기반 이미지가 표시됩니다.
