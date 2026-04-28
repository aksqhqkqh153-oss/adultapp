from datetime import datetime
from sqlmodel import Session, select

from .auth import hash_password
from .models import (
    AdminActionLog,
    AppAsset,
    CommunityPost,
    ContentItem,
    FeedPost,
    DirectMessage,
    DirectMessageThread,
    LaunchGate,
    SellerPenalty,
    MemberGrade,
    ModerationReport,
    Order,
    OrderItem,
    Product,
    ProductMedia,
    ProfileQuestion,
    RandomChatRule,
    StoryItem,
    UserBlock,
    RefundCase,
    RefundStatus,
    SellerOnboardingStatus,
    SellerProfile,
    User,
)




TEST_ACCOUNT_PRESETS = {
    "admin@example.com": {
        "name": "관리자",
        "password": "admin1234",
        "grade": MemberGrade.ADMIN,
        "adult_verified": True,
        "identity_verified": True,
        "seller_onboarding_status": SellerOnboardingStatus.ACTIVE,
        "member_status": "active",
        "gender": "남성",
        "age_band": "30대",
        "region_code": "서울",
    },
    "seller@example.com": {
        "name": "사업자A",
        "password": "seller1234",
        "grade": MemberGrade.SELLER,
        "adult_verified": True,
        "identity_verified": True,
        "seller_onboarding_status": SellerOnboardingStatus.ACTIVE,
        "member_status": "active",
        "gender": "여성",
        "age_band": "30대",
        "region_code": "경기",
    },
    "customer@example.com": {
        "name": "고객A",
        "password": "customer1234",
        "grade": MemberGrade.CUSTOMER,
        "adult_verified": True,
        "identity_verified": True,
        "seller_onboarding_status": None,
        "member_status": "active",
        "gender": "남성",
        "age_band": "20대",
        "region_code": "서울",
    },
    "general@example.com": {
        "name": "일반회원A",
        "password": "general1234",
        "grade": MemberGrade.GENERAL,
        "adult_verified": False,
        "identity_verified": False,
        "seller_onboarding_status": None,
        "member_status": "pending_adult_verification",
        "gender": "여성",
        "age_band": "20대",
        "region_code": "인천",
    },
}

LAUNCH_ADMIN_ACCOUNT_PRESETS = {
    "aksqhqkqh3@naver.com": {
        "name": "관리자1",
        "password_hash": "$argon2id$v=19$m=65536,t=2,p=2$W/6nRx6RLGLR+HLuxQ1rTQ$NRISUW11ZqU2ty5GFY4qyBovYFvCNUNhJcdXtnGgBYo",
        "grade": MemberGrade.ADMIN,
        "adult_verified": True,
        "identity_verified": True,
        "seller_onboarding_status": SellerOnboardingStatus.ACTIVE,
        "member_status": "active",
        "gender": None,
        "age_band": None,
        "region_code": None,
    },
}


def ensure_launch_admin_accounts(session: Session) -> None:
    """Ensure required production admin accounts exist without exposing plaintext passwords."""
    now = datetime.utcnow()
    for email, preset in LAUNCH_ADMIN_ACCOUNT_PRESETS.items():
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            user = User(email=email, name=preset["name"], password_hash=preset["password_hash"])
        else:
            user.name = preset["name"]
            user.password_hash = preset["password_hash"]

        user.grade = preset["grade"]
        user.adult_verified = preset["adult_verified"]
        user.identity_verified = preset["identity_verified"]
        user.member_status = preset["member_status"]
        user.seller_onboarding_status = preset["seller_onboarding_status"]
        user.gender = preset["gender"]
        user.age_band = preset["age_band"]
        user.region_code = preset["region_code"]
        user.login_provider = "email"
        user.identity_verification_method = "admin_seed"
        user.identity_verification_token = f"seed_admin_{email}"
        user.identity_verified_at = user.identity_verified_at or now
        user.adult_verified_at = user.adult_verified_at or now
        user.adult_verification_status = "verified_adult"
        user.adult_verification_provider = "admin_seed"
        user.adult_verification_tx_id = user.adult_verification_tx_id or f"admin_seed_{email}"
        user.adult_verification_fail_count = 0
        user.adult_verification_locked_until = None
        user.failed_login_count = 0
        user.locked_until = None
        user.last_failed_login_at = None
        user.reset_required = False
        user.admin_2fa_secret = None
        user.admin_2fa_confirmed = False
        user.admin_backup_codes = None
        user.password_changed_at = user.password_changed_at or now
        session.add(user)
        session.commit()
        session.refresh(user)



def ensure_test_accounts(session: Session) -> None:
    for email, preset in TEST_ACCOUNT_PRESETS.items():
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            user = User(email=email, name=preset["name"], password_hash=hash_password(preset["password"]))
        else:
            user.password_hash = hash_password(preset["password"])
            user.name = preset["name"]
        user.grade = preset["grade"]
        user.adult_verified = preset["adult_verified"]
        user.identity_verified = preset["identity_verified"]
        user.member_status = preset["member_status"]
        user.seller_onboarding_status = preset["seller_onboarding_status"]
        user.gender = preset["gender"]
        user.age_band = preset["age_band"]
        user.region_code = preset["region_code"]
        user.login_provider = "email"
        user.identity_verification_method = "휴대폰" if preset["identity_verified"] else None
        user.identity_verification_token = f"seed_{email}" if preset["identity_verified"] else None
        user.adult_verification_status = "verified_adult" if preset["adult_verified"] else "pending"
        user.failed_login_count = 0
        user.locked_until = None
        user.last_failed_login_at = None
        user.reset_required = False
        if email == "admin@example.com":
            user.admin_2fa_secret = None
            user.admin_2fa_confirmed = False
            user.admin_backup_codes = None
        session.add(user)
        session.commit()
        session.refresh(user)

        # 로그인 경로에서는 User 레코드만 안전하게 보정한다.
        # SellerProfile/기타 운영 테이블은 시드 전용 단계에서만 생성한다.

    ensure_launch_admin_accounts(session)


def seed_database(session: Session) -> None:
    ensure_test_accounts(session)
    existing = session.exec(select(User)).first()
    if existing:
        existing_seller = session.exec(select(User).where(User.grade == MemberGrade.SELLER)).first()
        if existing_seller:
            seed_operational_tables(session, existing_seller.id)
        seed_community_tables(session)
        seed_social_chat_tables(session)
        return

    admin = User(email="admin@example.com", name="관리자", password_hash=hash_password("admin1234"), grade=MemberGrade.ADMIN, adult_verified=True, identity_verified=True, seller_onboarding_status=SellerOnboardingStatus.ACTIVE, gender="남성", age_band="30대", region_code="서울")
    seller_user = User(
        email="seller@example.com",
        name="사업자A",
        password_hash=hash_password("seller1234"),
        grade=MemberGrade.SELLER,
        adult_verified=True,
        seller_onboarding_status=SellerOnboardingStatus.ACTIVE,
        gender="여성",
        age_band="30대",
        region_code="경기",
    )
    customer = User(email="customer@example.com", name="고객A", password_hash=hash_password("customer1234"), grade=MemberGrade.CUSTOMER, adult_verified=True, gender="남성", age_band="20대", region_code="서울")
    general_user = User(email="general@example.com", name="일반회원A", password_hash=hash_password("general1234"), grade=MemberGrade.GENERAL, adult_verified=False, gender="여성", age_band="20대", region_code="인천", member_status="pending_adult_verification")
    session.add(admin)
    session.add(seller_user)
    session.add(customer)
    session.add(general_user)
    session.commit()
    session.refresh(seller_user)
    session.refresh(customer)
    session.refresh(general_user)
    session.refresh(admin)

    session.add(SellerProfile(user_id=admin.id, business_number="999-99-99999", settlement_account_verified=True, return_address="서울시 관리자구 관리자로 1", cs_contact="02-111-1111", seller_contract_agreed=True))
    session.add(SellerProfile(user_id=seller_user.id, business_number="123-45-67890", settlement_account_verified=True, return_address="서울시 예시구 예시로 1", cs_contact="02-000-0000", seller_contract_agreed=True))

    products = [
        Product(seller_id=seller_user.id, name="프리미엄 실리콘 케어 파우치", sku_code="CARE-001", category="위생/보관", description="성인용품 전용 보관용 파우치와 세척 보조 구성을 포함한 기본 패키지", price=18900, stock_qty=24, risk_grade="A", display_scope="app_web", payment_scope="card_transfer", status="published", thumbnail_url="/media/20260411152622528140.png"),
        Product(seller_id=seller_user.id, name="중립 포장 세척 스타터 키트", sku_code="CARE-002", category="세척/케어", description="중립 포장으로 출고되는 세척 전용 스타터 키트", price=24900, stock_qty=18, risk_grade="A", display_scope="app_web", payment_scope="card_transfer", status="published", thumbnail_url="/media/20260411152622528140.png"),
        Product(seller_id=seller_user.id, name="보호 보관 하드 케이스", sku_code="CARE-003", category="위생/보관", description="성인용품 보관을 위한 잠금형 하드 케이스", price=32900, stock_qty=10, risk_grade="A", display_scope="app_web", payment_scope="card_transfer", status="published", thumbnail_url="/media/20260411152622528140.png"),
    ]
    for product in products:
        session.add(product)
    session.commit()
    product = session.exec(select(Product).where(Product.sku_code == "CARE-001")).first()
    if product:
        session.add(ProductMedia(product_id=product.id, media_type="image", file_name="product-care-001.png", file_url="/media/20260411152622528140.png", sort_order=1))

    content = ContentItem(author_id=admin.id, category="가이드", title="앱 심사 안전모드 운영 가이드", body="공개 홈/영상은 비노골적 정보성 콘텐츠만 노출합니다.", visibility="safe", status="published")
    session.add(content)

    post1 = CommunityPost(author_id=admin.id, author_grade="1", category="운영공지", title="커뮤니티 운영 원칙", body="이 커뮤니티는 정보 교류와 제품 사용 경험 공유를 위한 공간입니다. 연락처 공유, 오프라인 만남 유도, 성매매 연상 표현은 금지됩니다.", visibility="safe", purpose="정보교류", allow_dm=True, status="published")
    post2 = CommunityPost(author_id=customer.id, author_grade="5", category="사용후기", title="익명포장 확인 후기", body="포장 외부에 품목 노출이 없었고 배송문의는 판매자 DM으로 해결했습니다.", visibility="auth_only", purpose="제품문의", allow_dm=True, status="published")
    session.add(post1)
    session.add(post2)
    session.commit()
    session.refresh(post1)
    session.refresh(post2)

    dm_thread = DirectMessageThread(thread_type="product_inquiry", subject="배송/상품 문의", purpose_code="PRODUCT_QA", created_by=customer.id, participant_a_id=customer.id, participant_b_id=seller_user.id, related_post_id=post2.id, related_product_id=product.id, status="open")
    session.add(dm_thread)
    session.commit()
    session.refresh(dm_thread)
    session.add(DirectMessage(thread_id=dm_thread.id, sender_id=customer.id, receiver_id=seller_user.id, purpose_code="PRODUCT_QA", message="배송 상태와 보관 방법을 문의드립니다."))
    session.add(DirectMessage(thread_id=dm_thread.id, sender_id=seller_user.id, receiver_id=customer.id, purpose_code="PRODUCT_QA", message="보관은 직사광선을 피하고 주문 탭에서 배송 상태를 확인하시면 됩니다."))

    order = Order(order_no="ORD-20260407-0001", member_id=customer.id, seller_id=seller_user.id, order_status="paid", payment_method="card", payment_pg="demo-pg", approved_at=datetime.utcnow(), supply_amount=10000, vat_amount=1000, total_amount=11000, fee_rate=0.1, settlement_status="open")
    session.add(order)
    session.commit()
    session.refresh(order)

    order_item = OrderItem(order_id=order.id, product_id=product.id, sku_code=product.sku_code, qty=1, unit_price=11000, supply_amount=10000, vat_amount=1000, fee_rate=0.1, coupon_burden_owner="platform", refund_status="requested")
    session.add(order_item)
    session.commit()
    session.refresh(order_item)

    session.add(RefundCase(order_id=order.id, order_item_id=order_item.id, seller_id=seller_user.id, status=RefundStatus.REQUESTED, reason_code="customer_change_mind", neutral_label_name="RETURN-BOX-01"))
    session.add(ModerationReport(reporter_id=customer.id, target_type="product", target_id=product.id, reason_code="keyword_review", priority="normal", status="queued"))
    session.add(AdminActionLog(admin_id=admin.id, admin_grade="1", action_type="seed_init", target_type="system", target_id="bootstrap", reason="initial seed", after_state="seeded", ip="127.0.0.1", device="local"))
    session.commit()
    seed_operational_tables(session, seller_user.id)
    seed_community_tables(session)
    seed_social_chat_tables(session)


def seed_operational_tables(session: Session, seller_id: int) -> None:
    if not session.exec(select(LaunchGate)).first():
        for gate, cond, evidence, owner, verdict in [
            ("법무", "약관·정책 전문 검토 완료", "버전관리 문서 세트", "대표/법무", "오픈 필수"),
            ("PG", "최소 1개 승인 또는 대체안 확정", "승인 메일/매핑표", "운영/재무", "오픈 필수"),
            ("세무", "증빙 자동화 테스트 통과", "배치 로그/샘플", "재무/개발", "오픈 필수"),
            ("운영", "감사로그/이중승인/백오피스 가동", "권한 테스트 결과", "운영/개발", "오픈 필수"),
        ]:
            session.add(LaunchGate(gate=gate, complete_condition=cond, evidence=evidence, owner=owner, verdict=verdict))
    if not session.exec(select(AppAsset)).first():
        for store, asset_name, asset_type, status, note in [
            ("Android", "공개용 설명문", "metadata", "draft", "CMS 저장"),
            ("Android", "심사용 설명문", "metadata", "draft", "심사 대응용"),
            ("Android", "스크린샷-홈", "screenshot", "todo", "심사모드 캡처"),
            ("Android", "스토어 제출 체크리스트", "ops", "draft", "버전 잠금 전 확인"),
            ("iOS", "공개용 설명문", "metadata", "draft", "4+ 수준 톤 유지"),
            ("iOS", "스크린샷-쇼핑", "screenshot", "todo", "심사모드 캡처"),
            ("Common", "App Preview 컷리스트", "video", "todo", "15~30초 스토리보드"),
        ]:
            session.add(AppAsset(store=store, asset_name=asset_name, asset_type=asset_type, status=status, note=note))
    if not session.exec(select(SellerPenalty)).first():
        for metric_name, base_score, weighted_score, action_status, recovery_condition in [
            ("환불 SLA 초과", 2, 3, "warning", "30일 무위반"),
            ("허위광고 분쟁", 3, 3, "review", "재심 승인"),
            ("반품 미이행", 4, 6, "hold", "미이행 해소"),
        ]:
            session.add(SellerPenalty(seller_id=seller_id, metric_name=metric_name, base_score=base_score, weighted_score=weighted_score, action_status=action_status, recovery_condition=recovery_condition))
    session.commit()


def seed_community_tables(session: Session) -> None:
    admin = session.exec(select(User).where(User.grade == MemberGrade.ADMIN)).first()
    seller_user = session.exec(select(User).where(User.grade == MemberGrade.SELLER)).first()
    customer = session.exec(select(User).where(User.grade == MemberGrade.CUSTOMER)).first()
    product = session.exec(select(Product)).first()
    if admin and not session.exec(select(CommunityPost)).first():
        post1 = CommunityPost(author_id=admin.id, author_grade="1", category="운영공지", title="커뮤니티 운영 원칙", body="이 커뮤니티는 정보 교류와 제품 사용 경험 공유를 위한 공간입니다. 연락처 공유, 오프라인 만남 유도, 성매매 연상 표현은 금지됩니다.", visibility="safe", purpose="정보교류", allow_dm=True, status="published")
        session.add(post1)
        if customer:
            post2 = CommunityPost(author_id=customer.id, author_grade="5", category="사용후기", title="익명포장 확인 후기", body="포장 외부에 품목 노출이 없었고 배송문의는 판매자 DM으로 해결했습니다.", visibility="auth_only", purpose="제품문의", allow_dm=True, status="published")
            session.add(post2)
        session.commit()
    if customer and seller_user and product and not session.exec(select(DirectMessageThread)).first():
        first_post = session.exec(select(CommunityPost).order_by(CommunityPost.id)).first()
        dm_thread = DirectMessageThread(thread_type="product_inquiry", subject="배송/상품 문의", purpose_code="PRODUCT_QA", created_by=customer.id, participant_a_id=customer.id, participant_b_id=seller_user.id, related_post_id=(first_post.id if first_post else None), related_product_id=product.id, status="open")
        session.add(dm_thread)
        session.commit()
        session.refresh(dm_thread)
        session.add(DirectMessage(thread_id=dm_thread.id, sender_id=customer.id, receiver_id=seller_user.id, purpose_code="PRODUCT_QA", message="배송 상태와 보관 방법을 문의드립니다."))
        session.add(DirectMessage(thread_id=dm_thread.id, sender_id=seller_user.id, receiver_id=customer.id, purpose_code="PRODUCT_QA", message="보관은 직사광선을 피하고 주문 탭에서 배송 상태를 확인하시면 됩니다."))
        session.commit()



def seed_social_chat_tables(session: Session) -> None:
    admin = session.exec(select(User).where(User.grade == MemberGrade.ADMIN)).first()
    seller_user = session.exec(select(User).where(User.grade == MemberGrade.SELLER)).first()
    customer = session.exec(select(User).where(User.grade == MemberGrade.CUSTOMER)).first()
    general_user = session.exec(select(User).where(User.grade == MemberGrade.GENERAL)).first()
    if admin and not session.exec(select(RandomChatRule)).first():
        session.add(RandomChatRule(rule_name="default", region_unit="시", distance_score_mode="band_bonus", allow_unblock=True, unblock_roles="user,admin", unblock_log_mode="always_admin_log", delete_display_mode="masked_deleted_label_admin_archive", admin_restore_only=True, admin_message_access_scope="admin_archive_all_threads", permanent_ban_keep_threads=True, age_match_mode="exact_then_adjacent", adjacent_age_pairs="30대:40대,40대:30대", false_report_policy="3:warn,5:3d,8:7d,15:admin_review", random_chat_only_sanction_enabled=True, random_chat_only_sanction_policy="3:24h,5:72h,8:7d,15:admin_review", permanent_ban_rejoin_after_days=365, report_result_notice_mode="silent", blocked_thread_visibility="hard_hidden", unblock_rematch_mode="immediate", match_retry_limit=4, match_search_timeout_seconds=300, contact_exchange_detection_mode="terms_only", contact_exchange_warning_mode="none", media_message_mode="text_only", thread_view_audit_enabled=True, self_message_delete_window_minutes=30, message_delete_scope="delete_for_both_masked_archive", male_rematch_min_seconds=20, male_rematch_max_seconds=40, female_rematch_min_seconds=5, female_rematch_max_seconds=10))
    if admin and not session.exec(select(StoryItem)).first():
        session.add(StoryItem(author_id=admin.id or 0, title="운영 스토리", image_url="/media/sample-story.png", visibility="safe"))
    if seller_user and not session.exec(select(FeedPost)).first():
        session.add(FeedPost(author_id=seller_user.id or 0, category="정보공유", title="익명포장 실사용 팁", body="포장 상태, 보관, 사용 전 확인 포인트를 정리했습니다.", image_url="/media/sample-feed.png", allow_questions=True, visibility="safe"))
    session.commit()
    feed = session.exec(select(FeedPost)).first()
    if customer and seller_user and feed and not session.exec(select(ProfileQuestion)).first():
        session.add(ProfileQuestion(questioner_id=customer.id or 0, target_user_id=seller_user.id or 0, feed_post_id=feed.id, question_text="익명포장 흔적은 없나요?", answer_text="외부 박스에는 품목이 노출되지 않습니다.", status="answered", is_anonymous=True))
    if customer and general_user and not session.exec(select(UserBlock)).first():
        session.add(UserBlock(blocker_id=customer.id or 0, blocked_id=general_user.id or 0, reason_code="seed_block", is_active=True))
    session.commit()
