# Launch Safety Patch 2026-04-28

- Demo login disabled by default.
- Password reset token removed from API response.
- /api/seed restricted to admin.
- Seller product publish now routes to pending_review.
- Orders require approved/visible product and sufficient stock.
- Paid status requires provider requery or signed webhook.
- Stock decrements once after paid state.
- Security headers and CSP added.
- Release readiness detects review mode, default JWT secret, demo login, client-only payment confirm, and storage risks.
