# 미성년 차단 계정 자동 파기 배치

- 정책: 미성년 차단 계정은 최소 식별값과 차단 이력만 1년 보관 후 파기
- 기본 cron: `0 4 * * *`
- 배치 스크립트: `python scripts/maintenance/purge_minor_blocked_accounts.py`
- 실행 전 확인
  - DB 백업
  - 최근 30일 수동 검토 필요 계정 제외
  - 운영 알림 채널(Slack/운영 메일) 확인
- 파기 방식
  - 이메일/이름/본인확인 토큰/프로필/위치 정보 제거
  - 상태를 `minor_blocked_purged`로 전환
  - 차단 이력과 최소 식별 흔적만 유지
