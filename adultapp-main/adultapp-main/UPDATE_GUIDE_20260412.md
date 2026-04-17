# adultapp payment shop seller publish update guide (2026-04-12)

## changed files
- backend/app/config.py
- backend/app/routers/api.py
- backend/app/schemas.py
- backend/app/seed_db.py
- frontend/src/App.tsx
- BUILD_CHECK_20260412_v31.txt

## build result
- frontend build: success
- backend smoke test: success

## build check
- provider-status OK
- self-test OK
- frontend-env-check OK
- confirm OK
- partial-cancel OK
- full-cancel OK
- partial-refund OK
- full-refund OK

## notes
- admin seed account now includes seller verification style status for direct product publish testing
- product registration screen now has both draft save and publish buttons
- publish action exposes approved products to other members immediately for business-verified eligible accounts
- order cancel/refund buttons now use remaining payable amount to avoid repeated 400 errors after partial actions
- frontend-env-check now recommends Railway API URL instead of Cloudflare Pages origin
