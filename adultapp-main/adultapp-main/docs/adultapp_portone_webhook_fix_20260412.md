# adultapp PortOne webhook fix

- PortOne V2 webhook payload(`data.paymentId`, `data.transactionId`, `data.cancellationId`) 대응 추가
- 테스트 호출 시 서명 헤더가 누락되거나 SDK 검증이 실패해도, PortOne V2 테스트 형식이면 test 모드에서 fail-open 처리 후 PortOne API 재조회 기반으로 상태 동기화
- webhook 처리 상세 로그 추가
- refund webhook도 동일한 구조로 보강
