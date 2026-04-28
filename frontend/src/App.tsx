import { CSSProperties, PointerEvent, memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent, TouchEvent as ReactTouchEvent, UIEvent as ReactUIEvent } from "react";
import { clearTokens, ensureAuthSession, getApiBase, getJson, getRefreshToken, hasAuthToken, postJson, setAuthToken, setRefreshToken } from "./lib/api";

type FeedItem = {
  id: number;
  type: "image" | "video";
  category: string;
  title: string;
  caption: string;
  author: string;
  likes: number;
  comments: number;
  accent: string;
  views?: number;
  reposts?: number;
  postedAt?: string;
  repostLabel?: string;
  quoteText?: string;
  quotedFeed?: { id: number; author: string; caption: string; title: string };
  videoUrl?: string;
  mediaUrl?: string;
  mediaName?: string;
};

type FeedCommentEntry = {
  id: number;
  author: string;
  text: string;
  meta: string;
  imageUrl?: string;
  imageName?: string;
};

type FeedCommentAttachment = {
  name: string;
  dataUrl: string;
  size: number;
  type: string;
};

type FeedComposerAttachment = {
  name: string;
  previewUrl: string;
  size: number;
  type: string;
  durationSec?: number;
  optimized?: boolean;
};

type FeedComposeMode = "피드게시" | "사진피드" | "쇼츠게시" | "스토리게시";
type HomeFeedFilter = "일반" | "추천" | "팔로잉";
type ShopHomeSort = "신규" | "인기" | "판매량" | "추천" | "리뷰";

const HOME_FEED_BATCH_SIZE = 5;
const HOME_FEED_PULL_MAX = 78;
const HOME_FEED_PULL_TRIGGER = 54;
const HOME_FEED_REFRESH_BATCH_SIZE = 3;
const CHAT_LIST_BASE_ROWS = 10;
const HOME_FEED_STATE_KEY = "adultapp_home_feed_state";
const HOME_FEED_RESET_MS = 30 * 60 * 1000;

type HomeFeedPersistedState = {
  visibleCount?: number;
  scrollTop?: number;
  lastInactiveAt?: number;
};

function readHomeFeedPersistedState(): HomeFeedPersistedState {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(HOME_FEED_STATE_KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

function isHomeFeedStateExpired(state: HomeFeedPersistedState) {
  return Boolean(state.lastInactiveAt && Date.now() - state.lastInactiveAt >= HOME_FEED_RESET_MS);
}

function getFeedComposeModeMeta(mode: FeedComposeMode) {
  switch (mode) {
    case "사진피드":
      return {
        title: "사진피드",
        description: "사진 중심 피드를 등록합니다.",
        accept: "image/*",
        attachLabel: "사진 첨부",
        helper: "최대 1개 첨부 · 사진 전용 등록 · 권장 JPG / PNG / WEBP",
      } as const;
    case "쇼츠게시":
      return {
        title: "쇼츠게시",
        description: "짧은 세로형 영상을 등록합니다.",
        accept: "video/*",
        attachLabel: "쇼츠 영상 첨부",
        helper: "최대 1개 첨부 · 쇼츠 영상은 최대 20초 / 30MB · 권장 MP4(H.264) 또는 WEBM",
      } as const;
    case "스토리게시":
      return {
        title: "스토리게시",
        description: "24시간 동안 보여줄 스토리를 등록합니다.",
        accept: "image/*,video/*",
        attachLabel: "스토리 사진/영상 첨부",
        helper: "최대 1개 첨부 · 스토리/맵토리 동시 게시 가능 · 위치는 시/구 단위로만 표시",
      } as const;
    default:
      return {
        title: "피드게시",
        description: "일반 피드를 등록합니다.",
        accept: "image/*,video/*",
        attachLabel: "사진/영상 첨부",
        helper: "최대 1개 첨부 · 영상은 최대 20초 / 30MB · 권장 MP4(H.264) 또는 WEBM",
      } as const;
  }
}

type ShortOption = "공유" | "보관함저장" | "관심없음" | "채널 추천 안함" | "신고";

type StoryItem = {
  id: number;
  name: string;
  role: string;
  accent: string;
  caption?: string;
  postedAt?: string;
  mapEnabled?: boolean;
  avatarUrl?: string;
};

type AskProfile = {
  id: number;
  name: string;
  headline: string;
  intro: string;
  highlight: string;
};

type ProfileSection = "게시물" | "질문" | "쇼츠" | "사진" | "태그됨" | "상품보기";
type ProfileFollowListMode = "팔로잉" | "팔로워" | null;

type ShopCategory = {
  group: string;
  icon: string;
  items: { name: string; count: number }[];
};

type ProductCard = {
  id: number;
  category: string;
  name: string;
  subtitle: string;
  price: string;
  badge: string;
  reviewCount?: number;
  stock_qty?: number;
  thumbnailUrl?: string | null;
  orderCount?: number;
  repurchaseCount?: number;
  isPremium?: boolean;
  createdAt?: string;
};

type CommunityPost = {
  id: number;
  category: string;
  title: string;
  summary: string;
  meta: string;
  audience?: string;
  sortScore?: number;
  board?: "커뮤" | "포럼" | "후기" | "이벤트";
  path?: string;
  detailTitle?: string;
  detailBody?: string[];
  pinned?: boolean;
  contentType?: "standard" | "test";
};


type NotificationItem = {
  id: number;
  section: "공지" | "이벤트" | "주문" | "소통";
  category: string;
  title: string;
  body: string;
  meta: string;
  postedAt: string;
  unread?: boolean;
  ctaLabel?: string;
  author?: string;
};

type ThreadItem = {
  id: number;
  name: string;
  purpose: string;
  preview: string;
  time: string;
  unread: number;
  avatar: string;
  avatarUrl?: string;
  kind: "개인" | "단체";
  favorite?: boolean;
  status?: string;
};

type ChatRequestItem = {
  id: number;
  name: string;
  purpose: string;
  preview: string;
  requestText: string;
  time: string;
  avatar: string;
  avatarUrl?: string;
};

type ChatDiscoveryCategory = "최근" | "추천" | "자유";

type ChatDiscoveryCandidate = {
  id: string;
  name: string;
  kind: "피드" | "쇼츠" | "소통" | "질문";
  description: string;
  sourceTitle: string;
  avatarUrl?: string;
};

type ChatRoomReactionKey = "heart" | "like" | "check" | "smile" | "surprised" | "sad";
type ChatPickerMode = "이모티콘" | "스티커" | "GIF";

type ChatRoomMessage = {
  id: number;
  threadId: number;
  author: string;
  text: string;
  meta: string;
  mine?: boolean;
  system?: boolean;
  createdAt?: number;
  reaction?: ChatRoomReactionKey | null;
  replyTo?: {
    id: number;
    author: string;
    text: string;
  } | null;
  contentKind?: "text" | "emoji" | "sticker" | "gif";
  edited?: boolean;
};

type ForumStarterUser = {
  id: number;
  name: string;
  role: string;
  topic: string;
  intro: string;
  followsMe?: boolean;
};

type ForumRoom = {
  id: number;
  category: string;
  title: string;
  summary: string;
  starter: string;
  participants: number;
  latestAt: string;
  introMessage: string;
};

type ForumRoomMessage = {
  id: number;
  author: string;
  text: string;
  meta: string;
  kind: "system" | "member";
};

type RandomRoom = {
  id: number;
  title: string;
  category: string;
  maxPeople: number;
  currentPeople: number;
  password: string;
  latestMessage: string;
  anonymous?: boolean;
  kind?: "group" | "random_1to1";
  partnerName?: string;
  partnerNickname?: string;
  expiresAt?: number;
  ageMin?: number;
  ageMax?: number;
  distanceMinKm?: number;
  distanceMaxKm?: number;
  genderOption?: string;
  regionOption?: string;
  status?: "active" | "ended";
  endedAt?: number;
};

type QuestionCard = {
  id: number;
  author: string;
  question: string;
  answer: string;
  meta: string;
  likes: number;
  comments: number;
};

type CartItem = {
  id: number;
  name: string;
  qty: number;
  price: string;
  option: string;
};

type ProfileItem = {
  label: string;
  value: string;
};

type ProgressItem = {
  category: string;
  percent: number;
  status: string;
  gaps: string[];
};

type ProjectStatus = {
  overall?: { percent: number; status: string; gaps: string[] };
  items?: ProgressItem[];
  recommended_updates?: string[];
};

type DeployGuide = {
  project_name?: string;
  build_command?: string;
  output_directory?: string;
  windows_script?: string;
  pages_cli?: string;
  notes?: string[];
};

type RandomRuleSnapshot = {
  report_result_notice_mode?: string;
  blocked_thread_visibility?: string;
  match_retry_limit?: number;
  match_search_timeout_seconds?: number;
  media_message_mode?: string;
  thread_view_audit_enabled?: boolean;
  message_delete_scope?: string;
  self_message_delete_window_minutes?: number;
  random_chat_only_sanction_enabled?: boolean;
  random_chat_only_sanction_policy?: string;
  permanent_ban_rejoin_after_days?: number;
  admin_message_access_scope?: string;
};


type LegalDocumentItem = {
  version: string;
  content: string;
  path: string;
};

type LegalDocumentsResponse = {
  items: Record<string, LegalDocumentItem>;
  required_signup_consents: string[];
};

type AdminLegalDocumentsResponse = {
  items?: Record<string, { content?: string; version?: string; label?: string; required?: string }>;
  source?: string;
};

type AdminLegalDocumentsSaveResponse = {
  ok?: boolean;
  items?: Record<string, { content?: string; version?: string; label?: string; required?: string }>;
};

type BusinessInfoResponse = {
  business_info: Record<string, string>;
  placeholder_fields: string[];
  complete: boolean;
  source?: string;
  beta_db_override_enabled?: boolean;
};

type PaymentProviderStatusResponse = {
  primary_provider?: string;
  secondary_provider?: string;
  portone_store_id_configured?: boolean;
  portone_channel_key_configured?: boolean;
  primary_merchant_configured?: boolean;
  secondary_merchant_configured?: boolean;
  portone_store_id_test_configured?: boolean;
  portone_store_id_live_configured?: boolean;
  portone_channel_key_test_configured?: boolean;
  portone_channel_key_live_configured?: boolean;
  primary_merchant_test_configured?: boolean;
  primary_merchant_live_configured?: boolean;
  portone_api_secret_configured?: boolean;
  portone_webhook_test_configured?: boolean;
  portone_webhook_live_configured?: boolean;
  portone_sdk_enabled?: boolean;
  portone_sdk_installed?: boolean;
  payments_env_split_enabled?: boolean;
  test_env_ready?: boolean;
  live_env_ready?: boolean;
  recommended_now?: string[];
  webhook_paths?: Record<string, string>;
  settlement_basis_note?: string;
};

type MinorPurgePreview = {
  retention_days?: number;
  cron?: string;
  enabled?: boolean;
  candidate_count?: number;
};

type UiCategoryGroupResponse = {
  items?: Array<{ group: string; items: string[] }>;
};

type SkuPolicyResponse = {
  payment_method_mapping?: Array<{ risk_grade: string; payment_scope: string; display_scope: string }>;
  forbidden_product_rules?: Array<{ rule: string; action: string }>;
  refund_reject_codes?: Array<{ code: string; description: string }>;
};

type ReleaseReadinessResponse = {
  status: "blocked" | "warning" | "ready" | string;
  blockers: { key: string; title: string; action: string }[];
  warnings: { key: string; title: string; action: string }[];
  ready_items: { key: string; title: string }[];
  decisions: {
    adult_verification_provider?: string;
    reconsent_mode?: string;
    minor_retention_days?: number;
    ops_alert_channels?: string[];
  };
};

type AuthSummary = {
  adult_verified?: boolean;
  identity_verified?: boolean;
  reconsent_required?: boolean;
  member_status?: string;
  reconsent_enforcement_mode?: "limited_access" | "login_block" | string;
  consent_status?: { reconsent_required?: boolean; next_reconsent_deadline?: string | null; grace_period_days?: number };
  random_chat_profile_ready?: boolean;
};

type AuthStandaloneScreen = "login" | "signup";
type CheckoutStage = "cart" | "order_form" | "payment_request" | "payment_complete" | "order_confirm";

type AuthMeResponse = AuthSummary & {
  id?: number;
  email?: string;
  name?: string;
  grade?: string;
};

type ApiProduct = {
  id: number;
  seller_id?: number;
  category: string;
  name: string;
  description?: string;
  price: number;
  shipping_fee?: number;
  status?: string;
  sku_code?: string;
  stock_qty?: number;
  thumbnail_url?: string | null;
  review_count?: number;
};

type ProductDetailResponse = {
  product: ApiProduct;
  media?: Array<{ id?: number; file_url?: string; media_type?: string; sort_order?: number }>;
  policy?: Record<string, unknown>;
  site_ready?: {
    adult_only_label?: string;
    illegal_goods_blocked?: boolean;
    price_visible?: boolean;
    purchase_button_visible?: boolean;
    customer_center_visible?: boolean;
    minimum_refund_window_days?: number;
  };
  seller_contact?: {
    name?: string;
    business_name?: string;
    business_registration_no?: string;
    business_address?: string;
    cs_contact?: string;
    return_address?: string;
    support_email?: string;
  };
};

type AdultGateStatusResponse = {
  adult_verified?: boolean;
  identity_verified?: boolean;
  member_status?: string;
  allowed_to_shop?: boolean;
  latest_audit?: { provider?: string | null; outcome?: string | null; fail_reason?: string | null; created_at?: string | null };
  policy?: { adult_only_label?: string; minor_access_blocked?: boolean; verification_methods?: string[] };
};

type VerotelStartResponse = {
  ok?: boolean;
  provider?: string;
  order_no?: string;
  action_url?: string;
  method?: string;
  form_fields?: Record<string, string | number>;
};

type ApiOrder = {
  id: number;
  order_no: string;
  member_id: number;
  seller_id: number;
  status: string;
  payment_method: string;
  payment_pg: string;
  total_amount: number;
  settlement_status: string;
  item_count: number;
  amount_snapshot?: {
    order_total: number;
    paid_amount: number;
    cancelled_amount: number;
    refunded_amount: number;
    remaining: number;
  };
};

type ApiOrderDetail = {
  order: ApiOrder & { supply_amount?: number; vat_amount?: number; approved_at?: string | null };
  items: Array<{ product_id: number; sku_code?: string; qty: number; unit_price: number; supply_amount?: number; vat_amount?: number; refund_status?: string | null }>;
  payment_record?: {
    confirmed?: boolean;
    payment_id?: string;
    provider?: string;
    method?: string;
    paid_amount?: number;
    cancelled_amount?: number;
    refunded_amount?: number;
    latest_status?: string;
    history?: Array<Record<string, unknown>>;
  };
  amount_snapshot?: {
    order_total: number;
    paid_amount: number;
    cancelled_amount: number;
    refunded_amount: number;
    remaining: number;
  };
  checkout?: { mode?: string; store_id?: string; channel_key?: string; client_key?: string; mid?: string };
};

type SellerVerificationState = {
  companyName: string;
  representativeName: string;
  businessNumber: string;
  ecommerceNumber: string;
  businessAddress: string;
  csContact: string;
  returnAddress: string;
  youthProtectionOfficer: string;
  businessDocumentUrl: string;
  settlementBank: string;
  settlementAccountNumber: string;
  settlementAccountHolder: string;
  handledCategories: string;
  status: "draft" | "pending" | "approved";
};

type SellerVerificationStatusResponse = {
  seller_onboarding_status?: string | null;
  eligible_for_product_registration?: boolean;
  reason?: string;
  profile?: Record<string, unknown>;
};


type SellerApprovalItem = {
  user_id: number;
  email: string;
  name: string;
  status: string;
  business_number?: string;
  settlement_account_verified?: boolean;
  return_address?: string;
  cs_contact?: string;
  seller_contract_agreed?: boolean;
  submission_complete?: boolean;
  submitted_at?: string;
};

type ProductApprovalItem = {
  id: number;
  seller_id: number;
  name: string;
  sku_code: string;
  category: string;
  status: string;
  price: number;
  stock_qty: number;
  updated_at?: string;
};

type SellerProductItem = ProductApprovalItem & { description?: string; thumbnail_url?: string };

type SettlementPreviewResponse = {
  items?: Array<{ order_no: string; product: string; seller_receivable: number; platform_fee: number; pg_fee: number }>;
  summary?: { count?: number; gross_amount?: number; seller_receivable_total?: number };
  policy?: { settlement_cycle?: string; tax_invoice_direct?: string; tax_invoice_marketplace?: string; cash_receipt_direct?: string; cash_receipt_marketplace?: string };
};

type PaymentReviewReadyResponse = {
  mode?: {
    model?: string;
    catalog_mode?: string;
    checkout_mode?: string;
    checkout_label?: string;
    payout_method?: string;
    settlement_clause?: string;
    restricted_categories?: string[];
    risk_controls?: string[];
  };
  required_components?: {
    ledger_tables?: string[];
    webhook?: { path?: string; signature?: string; idempotent?: boolean };
    refund_flow?: string;
    compliance?: string[];
  };
};

type LedgerOverviewResponse = {
  mode?: PaymentReviewReadyResponse["mode"];
  orders?: { count?: number; gross?: number };
  transactions?: { count?: number; paid?: number; refund?: number };
  settlements?: { count?: number; gross?: number; fee?: number; net?: number };
  webhook?: { path?: string; signature?: string; idempotent?: boolean };
};

type ProductRegistrationDraft = {
  category: string;
  name: string;
  imageUrls: string[];
  description: string;
  price: string;
  stockQty: string;
  skuCode: string;
};
type AdminDbManage = {
  rule?: RandomRuleSnapshot;
  report?: {
    total?: number;
    status_counts?: Record<string, number>;
    reason_counts?: Record<string, number>;
    recent?: Array<{ id: number; reporter_id: number; target_id: number; reason_code: string; status: string; priority: string; created_at: string }>;
  };
  chat?: {
    total_threads?: number;
    status_counts?: Record<string, number>;
    hidden_policy?: string;
    delete_scope?: string;
    match_retry_limit?: number;
    match_search_timeout_seconds?: number;
    recent?: Array<{ id: number; subject: string; status: string; participant_a_id: number; participant_b_id: number; created_at: string; updated_at: string }>;
  };
  other?: {
    audit_enabled?: boolean;
    admin_access_scope?: string;
    random_chat_only_sanction_enabled?: boolean;
    random_chat_only_sanction_policy?: string;
    permanent_ban_rejoin_after_days?: number;
    recent_logs?: Array<{ id: number; action_type: string; target_type: string; target_id: string; reason: string; admin_id: number; created_at: string }>;
  };
};

const mobileTabs = ["홈", "쇼핑", "소통", "채팅", "프로필"] as const;
const legacyMenu = ["운영현황", "주문관리", "보안", "앱심사", "포럼 분리 정책", "배포가이드"] as const;
const homeTabs = ["피드", "쇼츠", "스토리", "보관함"] as const;
const shoppingTabs = ["홈", "목록", "상품", "주문", "바구니", "사업자인증", "상품등록", "일반거래"] as const;
const communityTabs = ["커뮤", "포럼", "후기", "이벤트"] as const;
const chatTabs = ["채팅", "질문"] as const;
const chatDiscoveryCategories = ["최근", "추천", "자유"] as const;
const chatTabLabels: Record<ChatTab, string> = { "채팅": "채팅", "질문": "질문" };
const profileTabs = ["내정보"] as const;
const settingsCategories = ["일반", "계정설정", "알림", "보안", "배포", "운영", "관리자모드", "DB관리", "신고", "채팅", "기타", "HTML요소"] as const;
const randomRoomCategories = ["전체", "관계역할/고민", "동의/경계설정", "안전수칙", "일상/취미", "자유대화"] as const;
const forumBoardCategories = ["자유대화", "일상/취미", "고민", "관계/역할", "안전수칙", "동의/합의/계약"] as const;
const chatCategories = ["전체", "즐겨찾기", "개인", "단체", "쇼핑"] as const;
const oneToOneRandomCategories = ["고민상담", "자유수다", "아무말대잔치", "도파민수다"] as const;
const randomGenderOptions = ["무관", "남", "여", "기타"] as const;
const randomRegionOptions = ["무관", "같은 지역 우선", "거리기반"] as const;
const randomEntryTabs = ["시작", "목록"] as const;
const adminModeTabs = ["계정관리", "운영현황", "계정권한", "문서", "승인", "정산", "DB관리", "신고", "채팅", "기타"] as const;
const adminLegalDocumentDefinitions = [
  { key: "terms_of_service", label: "이용약관", required: "회원가입, 계정정지, 금지행위, 탈퇴, 책임 제한" },
  { key: "privacy_policy", label: "개인정보처리방침", required: "수집항목, 목적, 보관기간, 제3자 제공, 위탁사" },
  { key: "youth_policy", label: "청소년보호정책", required: "성인인증, 청소년 접근 차단, 책임자 정보" },
  { key: "commerce_terms", label: "전자상거래 약관", required: "주문, 결제, 배송, 취소, 환불, 교환" },
  { key: "seller_terms", label: "판매자 이용약관", required: "사업자 전환, 상품등록, 정산, 금지상품" },
  { key: "community_policy", label: "커뮤니티 운영정책", required: "신고, 차단, 제재, 금지 콘텐츠" },
  { key: "location_ads_notice", label: "위치/광고/알림 동의", required: "해당 기능 사용 시 별도 동의" },
] as const;
type AdminLegalDocumentKey = (typeof adminLegalDocumentDefinitions)[number]["key"];
type AdminLegalDocumentDrafts = Record<AdminLegalDocumentKey, string>;
const createDefaultAdminDocumentDrafts = (): AdminLegalDocumentDrafts => adminLegalDocumentDefinitions.reduce((acc, item) => {
  acc[item.key] = `# ${item.label}\n\n필수 내용: ${item.required}\n\n- `;
  return acc;
}, {} as AdminLegalDocumentDrafts);
const consentVersionMap = { terms: "terms_v1", privacy: "privacy_v1", adultNotice: "adult_notice_v1", identityNotice: "identity_notice_v1", marketing: "marketing_v1", profileOptional: "profile_optional_v1" } as const;
const requiredConsentKeys: ConsentKey[] = ["terms", "privacy", "adultNotice", "identityNotice"];
const profileGenderOptions = ["", "남성", "여성", "기타", "응답 안 함"] as const;
const profileAgeBandOptions = ["", "20대", "30대", "40대", "50대", "60대+"] as const;
const profileRegionOptions = ["", "서울", "경기", "인천", "강원", "충청", "전라", "경상", "제주"] as const;
const interestCategoryOptions = ["뷰티", "케어", "건강", "커뮤니티", "브랜드", "이벤트"] as const;

const defaultHeaderFavorites: HeaderFavoriteMap = {
  "홈": ["피드", "쇼츠", "스토리", "보관함"],
  "쇼핑": ["홈", "주문", "바구니"],
  "소통": ["커뮤", "포럼", "후기"],
  "채팅": ["채팅", "질문"],
  "프로필": ["내정보"],
};

const defaultSignupConsents: SignupConsentState = { terms: false, privacy: false, adultNotice: false, identityNotice: false, marketing: false, profileOptional: false };
const defaultSignupForm: SignupFormState = { email: "", password: "", displayName: "", loginMethod: "이메일" };
const defaultDemoProfile: DemoProfileState = {
  gender: "",
  ageBand: "",
  regionCode: "",
  interests: [],
  marketingOptIn: false,
  displayName: "",
  bio: "",
  hashtags: "",
  avatarUrl: "",
};

const PROFILE_KEYWORD_TAG_LIMIT = 20;
const normalizeProfileKeywordTags = (value: string | null | undefined) => String(value ?? "")
  .split(/[\n,\s#]+/)
  .map((item) => item.trim())
  .filter(Boolean)
  .slice(0, PROFILE_KEYWORD_TAG_LIMIT);
const sanitizeDemoProfileState = (value: Partial<DemoProfileState> | null | undefined): DemoProfileState => ({
  ...defaultDemoProfile,
  ...(value ?? {}),
  gender: typeof value?.gender === "string" ? value.gender : defaultDemoProfile.gender,
  ageBand: typeof value?.ageBand === "string" ? value.ageBand : defaultDemoProfile.ageBand,
  regionCode: typeof value?.regionCode === "string" ? value.regionCode : defaultDemoProfile.regionCode,
  interests: Array.isArray(value?.interests) ? value.interests.filter((item): item is string => typeof item === "string") : [],
  marketingOptIn: Boolean(value?.marketingOptIn),
  displayName: typeof value?.displayName === "string" ? value.displayName : "",
  bio: typeof value?.bio === "string" ? value.bio : "",
  hashtags: typeof value?.hashtags === "string" ? value.hashtags : "",
  avatarUrl: typeof value?.avatarUrl === "string" ? value.avatarUrl : "",
});

const defaultSellerVerification: SellerVerificationState = {
  companyName: "",
  representativeName: "",
  businessNumber: "",
  ecommerceNumber: "",
  businessAddress: "",
  csContact: "",
  returnAddress: "",
  youthProtectionOfficer: "",
  businessDocumentUrl: "",
  settlementBank: "",
  settlementAccountNumber: "",
  settlementAccountHolder: "",
  handledCategories: "",
  status: "draft",
};


type MobileTab = (typeof mobileTabs)[number];
type LegacyTab = (typeof legacyMenu)[number];
type HomeTab = (typeof homeTabs)[number];
type ShoppingTab = (typeof shoppingTabs)[number];
type CommunityTab = (typeof communityTabs)[number];
type ChatTab = (typeof chatTabs)[number];
type HeaderFavoriteMap = Record<MobileTab, string[]>;
type ProfileTab = (typeof profileTabs)[number];
type SettingsCategory = (typeof settingsCategories)[number];
type CommunityExplorerStage = "list" | "detail" | "test_intro" | "test_run" | "test_result";
type TestAxisKey = "lead" | "follow" | "service" | "sensation" | "structure" | "restraint" | "playful" | "care" | "intimacy" | "switch";
type TestQuestion = {
  id: number;
  prompt: string;
  helper: string;
  weights: Partial<Record<TestAxisKey, number>>;
};
type DesktopSearchGroup = "홈" | "쇼핑" | "소통" | "채팅" | "프로필" | "알림" | "테스트";
type DesktopGlobalSearchItem = {
  id: string;
  group: DesktopSearchGroup;
  category: string;
  title: string;
  summary: string;
  path: string;
  keywords: string;
  openTab: MobileTab;
};
type RandomRoomCategory = (typeof randomRoomCategories)[number];
type ForumBoardCategory = (typeof forumBoardCategories)[number];
type ChatCategory = (typeof chatCategories)[number];
type OneToOneRandomCategory = (typeof oneToOneRandomCategories)[number];
type RandomGenderOption = (typeof randomGenderOptions)[number];
type RandomRegionOption = (typeof randomRegionOptions)[number];
type RandomEntryTab = (typeof randomEntryTabs)[number];
type AdminModeTab = (typeof adminModeTabs)[number];
type OverlayMode = "search" | "settings" | "notifications" | "menu" | "reconsent_info" | null;
type NotificationSectionKey = "notices" | "events" | "orders" | "community";
type DemoLoginProvider = "PASS" | "휴대폰" | "카카오";
type AdultGateView = "intro" | "success" | "failed" | "minor";
type SignupStep = "consent" | "account" | "profile";
type LoginMethod = "이메일" | "카카오";
type ConsentKey = "terms" | "privacy" | "adultNotice" | "identityNotice" | "marketing" | "profileOptional";
type SignupConsentState = Record<ConsentKey, boolean>;
type SignupFormState = { email: string; password: string; displayName: string; loginMethod: LoginMethod; };
type DemoProfileState = {
  gender: string;
  ageBand: string;
  regionCode: string;
  interests: string[];
  marketingOptIn: boolean;
  displayName: string;
  bio: string;
  hashtags: string;
  avatarUrl: string;
};

type DesktopPaneSlot = "left" | "right";
type DesktopBusinessViewId =
  | "product_crud"
  | "orders"
  | "shipping"
  | "returns"
  | "settlement"
  | "reviews"
  | "chat"
  | "user_notifications"
  | "auto_messages"
  | "ops_alerts"
  | "support"
  | "ads_app"
  | "ads_message"
  | "ads_notice";
type DesktopPaneSelection = { mode: "tab"; tab: MobileTab } | { mode: "business"; viewId: DesktopBusinessViewId };
type DesktopPaneEmbedContext = { desktopPane: DesktopPaneSlot; initialTab: MobileTab; businessViewId?: DesktopBusinessViewId | null; };
type DesktopBusinessMenuItem = { label: string; viewId: DesktopBusinessViewId; fallbackTab: MobileTab; summary: string; children?: string[] };
type DesktopBusinessMenuSection = { title: string; items: DesktopBusinessMenuItem[] };
type DesktopOrderProgressFilter = "전체" | "주문접수" | "상품준비중" | "배송지시" | "배송중" | "배송완료";
type DesktopOrderDeliveryFilter = "전체" | "결제완료" | "상품준비중" | "배송지시" | "배송중" | "배송완료" | "업체 직접 배송";
type DesktopOrderSearchField = "주문번호" | "주문자명" | "수취인명";
type DesktopSettlementPeriod = "1년" | "반기" | "분기" | "월";
type DesktopOrderAdminRow = {
  id: string;
  orderedAt: string;
  orderedDateIso: string;
  orderNo: string;
  productName: string;
  productCode: string;
  quantity: number;
  ordererLabel: string;
  receiverLabel: string;
  address: string;
  deliveryStatus: Exclude<DesktopOrderDeliveryFilter, "전체">;
  progressStatus: "주문접수대기" | "상품준비중" | "배송지시" | "배송중" | "배송완료";
};
type DesktopShippingAdminRow = {
  id: string;
  orderedAt: string;
  orderNo: string;
  ordererName: string;
  productSummary: string;
  receiverSummary: string;
  expectedShipDate: string;
  deliveryStatus: Exclude<DesktopOrderDeliveryFilter, "전체">;
  delayNotice: string;
  courier: string;
  trackingNo: string;
};

const desktopBusinessViewMeta: Record<DesktopBusinessViewId, { title: string; description: string; fallbackTab: MobileTab; section: string }> = {
  product_crud: { title: "상품 조회/등록/수정/삭제", description: "판매자센터 기본형 CRUD 화면입니다.", fallbackTab: "쇼핑", section: "상품" },
  orders: { title: "주문 관리", description: "주문 접수/결제 상태/진행 흐름을 확인합니다.", fallbackTab: "쇼핑", section: "상품" },
  shipping: { title: "배송 관리", description: "출고와 배송 처리 대상을 점검합니다.", fallbackTab: "쇼핑", section: "상품" },
  returns: { title: "환불/취소/반품/교환", description: "CS 처리 대상 주문을 모아봅니다.", fallbackTab: "쇼핑", section: "상품" },
  settlement: { title: "정산", description: "정산 예정, 수수료, 세금성 항목을 확인합니다.", fallbackTab: "쇼핑", section: "상품" },
  reviews: { title: "후기/상품평", description: "상품 리뷰와 평가 지표를 확인합니다.", fallbackTab: "소통", section: "상품" },
  chat: { title: "채팅", description: "최근 대화 목록과 상담 흐름을 확인합니다.", fallbackTab: "채팅", section: "메시지" },
  user_notifications: { title: "사용자 알림", description: "사용자에게 노출되는 알림을 관리합니다.", fallbackTab: "프로필", section: "메시지" },
  auto_messages: { title: "자동발송멘트", description: "주문/문의/안내 자동 문구를 확인합니다.", fallbackTab: "채팅", section: "메시지" },
  ops_alerts: { title: "운영 알림", description: "운영자용 상태 알림과 점검 메시지를 봅니다.", fallbackTab: "프로필", section: "알림" },
  support: { title: "고객문의", description: "고객센터/문의성 게시글 흐름을 모아봅니다.", fallbackTab: "소통", section: "고객센터" },
  ads_app: { title: "광고 · 앱", description: "앱 내부 광고 슬롯과 배너 운영 현황입니다.", fallbackTab: "홈", section: "광고" },
  ads_message: { title: "광고 · 메세지", description: "메세지형 광고 발송 대상을 관리합니다.", fallbackTab: "채팅", section: "광고" },
  ads_notice: { title: "광고 · 알림", description: "푸시/알림형 광고 공지를 관리합니다.", fallbackTab: "프로필", section: "광고" },
};

const desktopBusinessMenuSections: DesktopBusinessMenuSection[] = [
  { title: "상품", items: [
    { label: "조회/등록/수정/삭제", viewId: "product_crud", fallbackTab: "쇼핑", summary: "상품 기본 CRUD" },
    { label: "주문", viewId: "orders", fallbackTab: "쇼핑", summary: "주문 확인 및 상태 관리" },
    { label: "배송", viewId: "shipping", fallbackTab: "쇼핑", summary: "출고/배송 대상 확인" },
    { label: "환불/취소/반품/교환", viewId: "returns", fallbackTab: "쇼핑", summary: "취소/교환 처리" },
    { label: "정산", viewId: "settlement", fallbackTab: "쇼핑", summary: "정산/세금 정보", children: ["매출/순이익", "부가세", "세금계산서"] },
    { label: "후기/상품평", viewId: "reviews", fallbackTab: "소통", summary: "리뷰/평점 확인" },
  ] },
  { title: "메시지", items: [
    { label: "채팅", viewId: "chat", fallbackTab: "채팅", summary: "최근 채팅 및 상담" },
    { label: "사용자 알림", viewId: "user_notifications", fallbackTab: "프로필", summary: "알림 발송 목록" },
    { label: "자동발송멘트", viewId: "auto_messages", fallbackTab: "채팅", summary: "자동 응답/안내 문구" },
  ] },
  { title: "알림", items: [{ label: "운영 알림", viewId: "ops_alerts", fallbackTab: "프로필", summary: "운영 공지/알림" }] },
  { title: "고객센터", items: [{ label: "고객문의", viewId: "support", fallbackTab: "소통", summary: "고객 문의/지원" }] },
  { title: "광고", items: [
    { label: "앱", viewId: "ads_app", fallbackTab: "홈", summary: "앱 배너/슬롯", children: ["배너"] },
    { label: "메세지", viewId: "ads_message", fallbackTab: "채팅", summary: "메세지형 광고" },
    { label: "알림", viewId: "ads_notice", fallbackTab: "프로필", summary: "알림형 광고" },
  ] },
];

function isDesktopBusinessViewId(value: string | null | undefined): value is DesktopBusinessViewId {
  if (!value) return false;
  return Object.prototype.hasOwnProperty.call(desktopBusinessViewMeta, value);
}

function getDesktopPaneSelectionLabel(selection: DesktopPaneSelection) {
  return selection.mode === "tab" ? selection.tab : desktopBusinessViewMeta[selection.viewId].title;
}

function readDesktopPaneContext(): { embedded: boolean; slot: DesktopPaneSlot | null; initialTab: MobileTab; businessViewId: DesktopBusinessViewId | null } {
  if (typeof window === "undefined") return { embedded: false, slot: null, initialTab: "홈", businessViewId: null };
  const embeddedContext = (window as Window & { __ADULTAPP_EMBED_CONTEXT__?: DesktopPaneEmbedContext }).__ADULTAPP_EMBED_CONTEXT__;
  if (embeddedContext && (embeddedContext.desktopPane === "left" || embeddedContext.desktopPane === "right")) {
    return {
      embedded: true,
      slot: embeddedContext.desktopPane,
      initialTab: mobileTabs.includes(embeddedContext.initialTab) ? embeddedContext.initialTab : "홈",
      businessViewId: isDesktopBusinessViewId(embeddedContext.businessViewId ?? null) ? embeddedContext.businessViewId ?? null : null,
    };
  }
  const params = new URLSearchParams(window.location.search);
  const desktopPane = params.get("desktopPane");
  const initialTabParam = params.get("initialTab");
  const businessViewIdParam = params.get("businessViewId");
  const initialTab = mobileTabs.includes(initialTabParam as MobileTab) ? (initialTabParam as MobileTab) : "홈";
  if (desktopPane === "left" || desktopPane === "right") return { embedded: true, slot: desktopPane, initialTab, businessViewId: isDesktopBusinessViewId(businessViewIdParam) ? businessViewIdParam : null };
  return { embedded: false, slot: null, initialTab, businessViewId: null };
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildDesktopPaneFrameUrl(slot: DesktopPaneSlot, selection: DesktopPaneSelection) {
  if (typeof window === "undefined") return "";
  const nextUrl = new URL("/index.html", window.location.href);
  nextUrl.hash = "";
  nextUrl.search = "";
  nextUrl.searchParams.set("desktopPane", slot);
  nextUrl.searchParams.set("initialTab", selection.mode === "tab" ? selection.tab : desktopBusinessViewMeta[selection.viewId].fallbackTab);
  nextUrl.searchParams.set("desktopFrameMode", "app");
  nextUrl.searchParams.set("paneKey", selection.mode === "tab" ? `${slot}-${selection.tab}` : `${slot}-${selection.viewId}`);
  if (selection.mode === "business") {
    nextUrl.searchParams.set("businessViewId", selection.viewId);
  }
  const pathWithQuery = `${nextUrl.pathname}${nextUrl.search}`;
  return pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
}

function formatDesktopOrderShortDate(value: Date) {
  const year = String(value.getFullYear()).slice(2);
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function formatDesktopOrderIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDesktopOrderDateLabelFromOrderNo(orderNo: string, fallbackIndex = 0) {
  const compact = orderNo.replace(/[^0-9]/g, "").slice(0, 8);
  if (compact.length >= 6) {
    const yy = compact.slice(0, 2);
    const mm = compact.slice(2, 4);
    const dd = compact.slice(4, 6);
    return `20${yy}-${mm}-${dd}`;
  }
  const date = new Date();
  date.setDate(date.getDate() - fallbackIndex);
  return formatDesktopOrderIsoDate(date);
}

function formatDesktopSellerOrderNoParts(orderedDateIso: string, sellerId: number, sellerDailySequence: number) {
  const compactDate = orderedDateIso.replace(/-/g, "").slice(2);
  const sellerKey = String(Math.max(1, Number(sellerId || 1))).padStart(4, "0").slice(-4);
  const dailySequence = String(Math.max(1, Number(sellerDailySequence || 1))).padStart(3, "0").slice(-3);
  return `${compactDate}${sellerKey}${dailySequence}`;
}

function mapDesktopOrderStatuses(status: string, index: number) {
  if (status === "shipped") return { deliveryStatus: "배송중" as const, progressStatus: "배송중" as const };
  if (status === "delivered") return { deliveryStatus: "배송완료" as const, progressStatus: "배송완료" as const };
  if (status === "ready_to_ship") return { deliveryStatus: "배송지시" as const, progressStatus: "배송지시" as const };
  if (status === "preparing") return { deliveryStatus: "상품준비중" as const, progressStatus: "상품준비중" as const };
  if (status === "seller_direct") return { deliveryStatus: "업체 직접 배송" as const, progressStatus: "배송지시" as const };
  if (status === "paid") return { deliveryStatus: "결제완료" as const, progressStatus: "주문접수대기" as const };
  const fallbackCycle = [
    { deliveryStatus: "결제완료" as const, progressStatus: "주문접수대기" as const },
    { deliveryStatus: "상품준비중" as const, progressStatus: "상품준비중" as const },
    { deliveryStatus: "배송지시" as const, progressStatus: "배송지시" as const },
    { deliveryStatus: "배송중" as const, progressStatus: "배송중" as const },
    { deliveryStatus: "배송완료" as const, progressStatus: "배송완료" as const },
    { deliveryStatus: "업체 직접 배송" as const, progressStatus: "배송지시" as const },
  ];
  return fallbackCycle[index % fallbackCycle.length];
}

function buildDesktopShippingAdminRows(rows: DesktopOrderAdminRow[]): DesktopShippingAdminRow[] {
  const optionLabels = ["기본형", "대형", "프리미엄", "익명포장", "선물포장", "단품"];
  const courierByStatus: Record<DesktopShippingAdminRow["deliveryStatus"], string> = {
    "결제완료": "출고대기",
    "상품준비중": "로젠택배",
    "배송지시": "CJ대한통운",
    "배송중": "우체국택배",
    "배송완료": "한진택배",
    "업체 직접 배송": "업체 직접 배송",
  };
  const delayNoticeByStatus: Record<DesktopShippingAdminRow["deliveryStatus"], string> = {
    "결제완료": "출고 준비 중",
    "상품준비중": "정상 출고 예정",
    "배송지시": "집하 요청 완료",
    "배송중": "지연 없음",
    "배송완료": "배송 완료",
    "업체 직접 배송": "판매자 직접 조율",
  };

  return rows.map((item, index) => {
    const shipDate = new Date(`${item.orderedDateIso}T09:00:00`);
    shipDate.setDate(shipDate.getDate() + (item.deliveryStatus === "결제완료" ? 1 : item.deliveryStatus === "상품준비중" ? 1 : 0));
    const expectedShipDate = formatDesktopOrderIsoDate(shipDate);
    const ordererName = item.ordererLabel.split(" /")[0] ?? item.ordererLabel;
    const optionLabel = optionLabels[index % optionLabels.length];
    const receiverName = item.receiverLabel.split(" /")[0] ?? item.receiverLabel;
    const receiverPhone = item.receiverLabel.split(" /")[1] ?? "연락처 미기입";
    const delayNotice = delayNoticeByStatus[item.deliveryStatus];
    const courier = courierByStatus[item.deliveryStatus];
    const trackingNo = item.deliveryStatus === "결제완료"
      ? "출고 후 입력"
      : item.deliveryStatus === "업체 직접 배송"
        ? "직접 배송"
        : `${String(6100 + index).padStart(4, "0")}-${String(32000000 + index * 73).padStart(8, "0")}`;

    return {
      id: `shipping-${item.id}`,
      orderedAt: item.orderedAt,
      orderNo: item.orderNo,
      ordererName,
      productSummary: `${item.productName} / ${optionLabel} / ${item.quantity}개`,
      receiverSummary: `${receiverName} / ${receiverPhone} / ${item.address}`,
      expectedShipDate,
      deliveryStatus: item.deliveryStatus,
      delayNotice,
      courier,
      trackingNo,
    } satisfies DesktopShippingAdminRow;
  });
}

function buildDesktopOrderAdminRows(orders: ApiOrder[], sellerProducts: SellerProductItem[]) {
  const ordererNames = ["민트고양이", "로즈캣", "블랙벨", "은하수", "달빛노트", "소프트문"];
  const receiverNames = ["김수취", "박받는", "이도착", "최안심", "정포장", "윤비밀"];
  const addressSamples = [
    "서울 강남구 테헤란로 101",
    "경기 성남시 분당구 판교역로 235",
    "인천 연수구 센트럴로 123",
    "부산 해운대구 센텀남대로 35",
    "대전 유성구 대학로 99",
    "광주 서구 상무중앙로 57",
  ];
  const sellerDailyCounters = new Map<string, number>();

  if (orders.length) {
    return orders.slice().reverse().map((order, index) => {
      const linkedProduct = sellerProducts.length ? sellerProducts[index % sellerProducts.length] : null;
      const orderedDateIso = formatDesktopOrderDateLabelFromOrderNo(order.order_no, index);
      const sellerId = Math.max(1, Number(order.seller_id || linkedProduct?.seller_id || 1));
      const counterKey = `${orderedDateIso}:${sellerId}`;
      const nextSequence = (sellerDailyCounters.get(counterKey) ?? 0) + 1;
      sellerDailyCounters.set(counterKey, nextSequence);
      const orderNo = formatDesktopSellerOrderNoParts(orderedDateIso, sellerId, nextSequence);
      const orderedDate = new Date(`${orderedDateIso}T09:00:00`);
      const statusInfo = mapDesktopOrderStatuses(order.status, index);
      const ordererName = ordererNames[index % ordererNames.length];
      const receiverName = receiverNames[index % receiverNames.length];
      const phoneTail = String(1200 + index * 37).padStart(4, "0");
      return {
        id: `desktop-order-${order.order_no}`,
        orderedAt: formatDesktopOrderShortDate(orderedDate),
        orderedDateIso,
        orderNo,
        productName: linkedProduct?.name ?? `주문 상품 ${index + 1}`,
        productCode: linkedProduct?.sku_code ?? `SKU-${String(index + 1).padStart(4, "0")}`,
        quantity: Math.max(1, Number(order.item_count ?? 1)),
        ordererLabel: `${ordererName} / buyer${order.member_id}`,
        receiverLabel: `${receiverName} / 010-48${String(index).padStart(2, "0")}-${phoneTail}`,
        address: addressSamples[index % addressSamples.length],
        deliveryStatus: statusInfo.deliveryStatus,
        progressStatus: statusInfo.progressStatus,
      } satisfies DesktopOrderAdminRow;
    });
  }

  return sellerProducts.slice(0, 8).map((product, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const orderedDateIso = formatDesktopOrderIsoDate(date);
    const statusInfo = mapDesktopOrderStatuses("", index);
    const sellerId = Math.max(1, Number(product.seller_id || 1));
    const counterKey = `${orderedDateIso}:${sellerId}`;
    const nextSequence = (sellerDailyCounters.get(counterKey) ?? 0) + 1;
    sellerDailyCounters.set(counterKey, nextSequence);
    const ordererName = ordererNames[index % ordererNames.length];
    const receiverName = receiverNames[index % receiverNames.length];
    const phoneTail = String(1400 + index * 51).padStart(4, "0");
    return {
      id: `desktop-order-fallback-${product.id}`,
      orderedAt: formatDesktopOrderShortDate(date),
      orderedDateIso,
      orderNo: formatDesktopSellerOrderNoParts(orderedDateIso, sellerId, nextSequence),
      productName: product.name,
      productCode: product.sku_code,
      quantity: Math.max(1, (index % 3) + 1),
      ordererLabel: `${ordererName} / buyer${300 + index}`,
      receiverLabel: `${receiverName} / 010-57${String(index).padStart(2, "0")}-${phoneTail}`,
      address: addressSamples[index % addressSamples.length],
      deliveryStatus: statusInfo.deliveryStatus,
      progressStatus: statusInfo.progressStatus,
    } satisfies DesktopOrderAdminRow;
  });
}


function shiftDesktopOrderIsoMonth(orderedDateIso: string, deltaMonths: number) {
  const [year, month, day] = orderedDateIso.split("-").map((item) => Number(item));
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setMonth(date.getMonth() + deltaMonths);
  return formatDesktopOrderIsoDate(date);
}

function formatDesktopSettlementMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  return `${year}.${month}`;
}

function DesktopSplitShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leftSelection, setLeftSelection] = useState<DesktopPaneSelection>({ mode: "tab", tab: "홈" });
  const [rightSelection, setRightSelection] = useState<DesktopPaneSelection>({ mode: "tab", tab: "쇼핑" });
  const [desktopOverlayMode, setDesktopOverlayMode] = useState<"search" | "notifications" | "settings" | null>(null);
  const [desktopSearchKeyword, setDesktopSearchKeyword] = useState("");
  const [desktopSearchGroup, setDesktopSearchGroup] = useState<DesktopSearchGroup | "전체">("전체");

  const leftFrameUrl = useMemo(() => buildDesktopPaneFrameUrl("left", leftSelection), [leftSelection]);
  const rightFrameUrl = useMemo(() => buildDesktopPaneFrameUrl("right", rightSelection), [rightSelection]);
  const iframeReady = Boolean(leftFrameUrl && rightFrameUrl);
  const desktopSearchIndex = useMemo(() => buildDesktopGlobalSearchIndex(), []);
  const unreadDesktopNotificationCount = useMemo(() => notificationSeed.filter((item) => item.unread).length, []);
  const desktopCurrentRole = useMemo(() => (typeof window === "undefined" ? "GUEST" : (window.localStorage.getItem("adultapp_demo_role") ?? "GUEST").toUpperCase()), []);
  const desktopIsAdmin = ["ADMIN", "1", "GRADE_1"].includes(desktopCurrentRole);

  const selectPaneTab = useCallback((slot: DesktopPaneSlot, tab: MobileTab) => {
    const nextSelection: DesktopPaneSelection = { mode: "tab", tab };
    if (slot === "left") {
      setLeftSelection(nextSelection);
      return;
    }
    setRightSelection(nextSelection);
  }, []);

  const desktopTopControls: Array<{ slot: DesktopPaneSlot; title: string; currentTab: MobileTab; currentLabel: string; onSelect: (tab: MobileTab) => void }> = [
    {
      slot: "left",
      title: "좌측 화면 메뉴",
      currentTab: leftSelection.mode === "tab" ? leftSelection.tab : desktopBusinessViewMeta[leftSelection.viewId].fallbackTab,
      currentLabel: getDesktopPaneSelectionLabel(leftSelection),
      onSelect: (tab) => selectPaneTab("left", tab),
    },
    {
      slot: "right",
      title: "우측 화면 메뉴",
      currentTab: rightSelection.mode === "tab" ? rightSelection.tab : desktopBusinessViewMeta[rightSelection.viewId].fallbackTab,
      currentLabel: getDesktopPaneSelectionLabel(rightSelection),
      onSelect: (tab) => selectPaneTab("right", tab),
    },
  ];

  const desktopSearchGroups: Array<DesktopSearchGroup | "전체"> = ["전체", "홈", "쇼핑", "소통", "채팅", "프로필", "알림", "테스트"];
  const desktopSearchResults = useMemo(() => {
    const keyword = desktopSearchKeyword.trim().toLowerCase();
    const filtered = desktopSearchIndex.filter((item) => {
      const groupMatch = desktopSearchGroup === "전체" || item.group === desktopSearchGroup;
      const keywordMatch = !keyword || `${item.title} ${item.summary} ${item.keywords} ${item.path} ${item.category}`.toLowerCase().includes(keyword);
      return groupMatch && keywordMatch;
    });

    return filtered
      .sort((a, b) => {
        const aExact = keyword && a.title.toLowerCase().includes(keyword) ? 1 : 0;
        const bExact = keyword && b.title.toLowerCase().includes(keyword) ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        return a.path.localeCompare(b.path, "ko");
      })
      .slice(0, 80);
  }, [desktopSearchGroup, desktopSearchIndex, desktopSearchKeyword]);

  const desktopNotificationSections = useMemo(
    () => ({
      notices: notificationSeed.filter((item) => item.section === "공지"),
      orders: notificationSeed.filter((item) => item.section === "주문"),
      community: notificationSeed.filter((item) => item.section === "소통"),
      events: notificationSeed.filter((item) => item.section === "이벤트"),
    }),
    [],
  );

  const handleDesktopResultOpen = useCallback((item: DesktopGlobalSearchItem) => {
    selectPaneTab("right", item.openTab);
    setDesktopOverlayMode(null);
  }, [selectPaneTab]);

  const openBusinessPane = useCallback((slot: DesktopPaneSlot, viewId: DesktopBusinessViewId) => {
    const nextSelection: DesktopPaneSelection = { mode: "business", viewId };
    if (slot === "left") {
      setLeftSelection(nextSelection);
      return;
    }
    setRightSelection(nextSelection);
  }, []);

  const toggleLabel = sidebarOpen ? "‹ 메뉴 접기" : "› 메뉴 펼치기";

  return (
    <div className={`desktop-split-shell ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="desktop-split-layout">
        <aside className={`desktop-side-menu ${sidebarOpen ? "open" : "closed"}`} aria-label="PC 분할 메뉴">
          <button
            type="button"
            className="desktop-side-menu-toggle"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-expanded={sidebarOpen}
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            <span className="desktop-side-menu-toggle-arrow" aria-hidden="true">{sidebarOpen ? "‹" : "›"}</span>
            <span className="desktop-side-menu-toggle-label">{sidebarOpen ? "메뉴 접기" : "메뉴 펼치기"}</span>
          </button>

          <div className="desktop-side-menu-scroll">
            {desktopBusinessMenuSections.map((section) => (
              <div key={section.title} className="desktop-side-menu-section desktop-side-menu-section-business">
                <div className="desktop-side-menu-section-head">
                  <strong>{section.title}</strong>
                </div>
                <ul className="desktop-side-menu-list">
                  {section.items.map((item) => (
                    <li key={item.viewId} className="desktop-side-menu-list-item">
                      <div className="desktop-side-menu-item-main">
                        <div className="desktop-side-menu-item-title-row">
                          <span>{item.label}</span>
                          <small>{item.summary}</small>
                        </div>
                        <div className="desktop-side-menu-item-actions">
                          <button type="button" className="desktop-side-menu-open-btn" onClick={() => openBusinessPane("left", item.viewId)}>좌</button>
                          <button type="button" className="desktop-side-menu-open-btn" onClick={() => openBusinessPane("right", item.viewId)}>우</button>
                        </div>
                      </div>
                      {item.children ? (
                        <ul className="desktop-side-menu-sublist">
                          {item.children.map((child) => (
                            <li key={child}>{child}</li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <div className="desktop-split-main">
          <div className="desktop-shell-top-stack">
            <div className="desktop-shell-header desktop-shell-header-actions-only">
              <div className="desktop-shell-header-actions">
                <button
                  type="button"
                  className={`desktop-header-action-btn ${desktopOverlayMode === "search" ? "active" : ""}`}
                  onClick={() => setDesktopOverlayMode((prev) => (prev === "search" ? null : "search"))}
                  aria-label="통합 검색"
                  title="통합 검색"
                >
                  <SearchIcon />
                </button>
                <button
                  type="button"
                  className={`desktop-header-action-btn desktop-header-action-btn-bell ${desktopOverlayMode === "notifications" ? "active" : ""}`}
                  onClick={() => setDesktopOverlayMode((prev) => (prev === "notifications" ? null : "notifications"))}
                  aria-label="알림"
                  title="알림"
                >
                  <BellIcon />
                  {unreadDesktopNotificationCount > 0 ? <span className="desktop-header-badge">{unreadDesktopNotificationCount > 9 ? "9+" : unreadDesktopNotificationCount}</span> : null}
                </button>
                <button
                  type="button"
                  className={`desktop-header-action-btn ${desktopOverlayMode === "settings" ? "active" : ""}`}
                  onClick={() => setDesktopOverlayMode((prev) => (prev === "settings" ? null : "settings"))}
                  aria-label="설정"
                  title="설정"
                >
                  <SettingsIcon />
                </button>
              </div>
            </div>

            <div className="desktop-split-toolbar">
              {desktopTopControls.map((section) => (
                <section key={section.slot} className="desktop-top-control-card">
                  <div className="desktop-top-control-head">
                    <strong>{section.title}</strong>
                    <span>{section.currentLabel}</span>
                  </div>
                  <div className="desktop-top-control-grid">
                    {mobileTabs.map((tab) => (
                      <button
                        key={`${section.slot}-toolbar-${tab}`}
                        type="button"
                        className={`desktop-side-menu-tab-btn ${section.currentTab === tab ? "active" : ""}`}
                        onClick={() => section.onSelect(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          {desktopOverlayMode ? (
            <div className="desktop-utility-overlay-shell">
              <div className="desktop-utility-overlay-head">
                <strong>{desktopOverlayMode === "search" ? "통합 검색" : desktopOverlayMode === "notifications" ? "알림 센터" : "설정"}</strong>
                <button type="button" className="ghost-btn" onClick={() => setDesktopOverlayMode(null)}>닫기</button>
              </div>

              {desktopOverlayMode === "search" ? (
                <div className="desktop-utility-overlay-body">
                  <div className="desktop-utility-search-toolbar">
                    <input
                      value={desktopSearchKeyword}
                      onChange={(event) => setDesktopSearchKeyword(event.target.value)}
                      placeholder="PC/모바일 전체 키워드 검색"
                      className="desktop-utility-search-input"
                      autoFocus
                    />
                    <button type="button" className="ghost-btn" onClick={() => setDesktopSearchKeyword("")}>검색어 초기화</button>
                  </div>
                  <div className="desktop-utility-chip-row">
                    {desktopSearchGroups.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`desktop-utility-chip ${desktopSearchGroup === item ? "active" : ""}`}
                        onClick={() => setDesktopSearchGroup(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="desktop-utility-result-summary">분류 {desktopSearchGroup} · 결과 {desktopSearchResults.length}건</div>
                  <div className="desktop-utility-result-list">
                    {desktopSearchResults.length ? (
                      desktopSearchResults.map((item) => (
                        <button key={item.id} type="button" className="desktop-search-result-card" onClick={() => handleDesktopResultOpen(item)}>
                          <div className="desktop-search-result-top">
                            <span className="desktop-search-result-badge">{item.group}</span>
                            <span className="desktop-search-result-category">{item.category}</span>
                          </div>
                          <strong>{item.title}</strong>
                          <p>{item.summary}</p>
                          <div className="desktop-search-result-path">경로: {item.path}</div>
                        </button>
                      ))
                    ) : (
                      <div className="desktop-utility-empty">연관 검색 결과가 없습니다.</div>
                    )}
                  </div>
                </div>
              ) : null}

              {desktopOverlayMode === "notifications" ? (
                <div className="desktop-utility-overlay-body desktop-notification-panel">
                  <div className="desktop-notification-summary-grid">
                    <div className="desktop-notification-summary-card">
                      <strong>공지사항</strong>
                      <span>{desktopNotificationSections.notices.length}건</span>
                    </div>
                    <div className="desktop-notification-summary-card">
                      <strong>주문/배송/환불</strong>
                      <span>{desktopNotificationSections.orders.length}건</span>
                    </div>
                    <div className="desktop-notification-summary-card">
                      <strong>메세지/소통</strong>
                      <span>{desktopNotificationSections.community.length}건</span>
                    </div>
                    <div className="desktop-notification-summary-card">
                      <strong>이벤트</strong>
                      <span>{desktopNotificationSections.events.length}건</span>
                    </div>
                  </div>
                  <div className="desktop-utility-result-list">
                    {notificationSeed.map((item) => (
                      <article key={`desktop-noti-${item.id}`} className="desktop-notification-card">
                        <div className="desktop-search-result-top">
                          <span className="desktop-search-result-badge">{item.section}</span>
                          <span className="desktop-search-result-category">{item.category}</span>
                        </div>
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                        <div className="desktop-search-result-path">{item.meta} · {item.postedAt}{item.unread ? " · 읽지 않음" : ""}</div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {desktopOverlayMode === "settings" ? (
                <div className="desktop-utility-overlay-body desktop-settings-placeholder">
                  {desktopIsAdmin ? (
                    <>
                      <div className="desktop-settings-placeholder-card settings-admin-mode-entry">
                        <strong>관리자모드</strong>
                        <p>관리자 계정에서만 표시됩니다. 모바일 프로필/홈/쇼핑/소통/채팅 화면의 우측 상단 설정에서도 동일하게 접근할 수 있습니다.</p>
                        <div className="desktop-utility-chip-row">
                          <span className="desktop-placeholder-pill">계정관리</span>
                          <span className="desktop-placeholder-pill">운영현황</span>
                          <span className="desktop-placeholder-pill">계정권한</span>
                          <span className="desktop-placeholder-pill">문서</span>
                        </div>
                      </div>
                      <div className="desktop-settings-placeholder-card">
                        <strong>문서 관리</strong>
                        <p>계정권한 하위의 문서 탭에서 이용약관, 개인정보처리방침, 청소년보호정책, 전자상거래 약관, 판매자 이용약관, 커뮤니티 운영정책, 위치/광고/알림 동의를 작성합니다.</p>
                      </div>
                    </>
                  ) : (
                    <div className="desktop-settings-placeholder-card">
                      <strong>설정</strong>
                      <p>관리자모드는 관리자 계정에서만 표시됩니다.</p>
                      <div className="desktop-utility-chip-row">
                        <span className="desktop-placeholder-pill">계정</span>
                        <span className="desktop-placeholder-pill">알림</span>
                        <span className="desktop-placeholder-pill">보안</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="desktop-split-grid">
            <section className="desktop-split-pane">
              <div className="desktop-split-device-frame">
                {iframeReady ? <iframe key={leftFrameUrl} className="desktop-split-iframe" src={leftFrameUrl} title="adultapp-left-pane" loading="eager" /> : <div className="desktop-split-fallback">화면을 준비 중입니다.</div>}
              </div>
            </section>

            <section className="desktop-split-pane">
              <div className="desktop-split-device-frame">
                {iframeReady ? <iframe key={rightFrameUrl} className="desktop-split-iframe" src={rightFrameUrl} title="adultapp-right-pane" loading="eager" /> : <div className="desktop-split-fallback">화면을 준비 중입니다.</div>}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

type HtmlInspectorInfo = {
  selector: string;
  tagName: string;
  id: string;
  className: string;
  text: string;
  html: string;
  cssText: string;
  modalStyle?: CSSProperties;
};

type AppNavigationSnapshot = {
  activeTab: MobileTab;
  homeTab: HomeTab;
  shoppingTab: ShoppingTab;
  communityTab: CommunityTab;
  chatTab: ChatTab;
  profileTab: ProfileTab;
  settingsCategory: SettingsCategory;
  overlayMode: OverlayMode;
  notificationView: { view: "list" | "section" | "detail"; section: NotificationSectionKey | null; item: NotificationItem | null };
  activeRandomRoomId: number | null;
  randomEntryTab: RandomEntryTab;
  roomModalOpen: boolean;
  selectedAskProfile: AskProfile | null;
  productDetail: ProductDetailResponse | null;
  selectedProductId: number | null;
  openFeedCommentItem: FeedItem | null;
  feedComposeOpen: boolean;
  viewedProfileAuthor: string | null;
  profileSection: ProfileSection;
  authStandaloneScreen: AuthStandaloneScreen | null;
  adultPromptOpen: boolean;
  checkoutStage: CheckoutStage;
  companyMailPreviewOpen: boolean;
  randomSettingsOpen: boolean;
  shortsMoreItem: FeedItem | null;
  shortsViewerItemId: number | null;
  savedShortsViewerItemId: number | null;
  savedTab: "피드" | "쇼츠";
};

type NativeAppListenerHandle = {
  remove?: () => void | Promise<void>;
};

type NativeAppPlugin = {
  addListener?: (eventName: "backButton", listener: () => void) => NativeAppListenerHandle | Promise<NativeAppListenerHandle>;
  minimizeApp?: () => void | Promise<void>;
};

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      Plugins?: {
        App?: NativeAppPlugin;
      };
    };
  }
}

type HeaderNavItem = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

const APP_BACK_MINIMIZE_WINDOW_MS = 1800;
const APP_NAVIGATION_HISTORY_LIMIT = 120;
const APP_BROWSER_HISTORY_STATE_KEY = "__adultapp_nav_index";

const cloneNavigationSnapshot = (snapshot: AppNavigationSnapshot): AppNavigationSnapshot => JSON.parse(JSON.stringify(snapshot)) as AppNavigationSnapshot;

const getNativeAppPlugin = (): NativeAppPlugin | null => {
  if (typeof window === "undefined") return null;
  return window.Capacitor?.Plugins?.App ?? null;
};

function SearchIcon() {

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M16 16L21 21" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M19.14 12.94a7.4 7.4 0 0 0 .05-.94 7.4 7.4 0 0 0-.05-.94l2.03-1.58a.6.6 0 0 0 .15-.77l-1.92-3.32a.6.6 0 0 0-.73-.26l-2.39.96a7.78 7.78 0 0 0-1.63-.94l-.36-2.54a.6.6 0 0 0-.59-.51H10.3a.6.6 0 0 0-.59.51l-.36 2.54c-.58.22-1.13.54-1.63.94l-2.39-.96a.6.6 0 0 0-.73.26L2.68 8.71a.6.6 0 0 0 .15.77l2.03 1.58a7.4 7.4 0 0 0-.05.94c0 .32.02.63.05.94L2.83 14.52a.6.6 0 0 0-.15.77l1.92 3.32c.16.28.49.39.79.26l2.39-.96c.5.4 1.05.72 1.63.94l.36 2.54c.05.29.3.51.59.51h3.4c.3 0 .55-.22.59-.51l.36-2.54c.58-.22 1.13-.54 1.63-.94l2.39.96c.3.12.63.01.79-.26l1.92-3.32a.6.6 0 0 0-.15-.77l-2.03-1.58Z" fill="none" stroke="currentColor" strokeWidth="2.05" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" strokeWidth="2.05" />
    </svg>
  );
}


function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3.5a4.2 4.2 0 0 0-4.2 4.2v1.1c0 1.3-.42 2.56-1.2 3.6l-1.18 1.57c-.42.56-.02 1.36.68 1.36h12.84c.7 0 1.1-.8.68-1.36l-1.18-1.57a5.98 5.98 0 0 1-1.2-3.6V7.7A4.2 4.2 0 0 0 12 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/>
      <path d="M9.5 18.5a2.7 2.7 0 0 0 5 0" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3.5 5h2.4l1.45 8.12a1.8 1.8 0 0 0 1.77 1.48h7.78a1.8 1.8 0 0 0 1.75-1.39l1.36-5.81H7.12" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10.2" cy="18.2" r="1.35" fill="currentColor"/>
      <circle cx="17.2" cy="18.2" r="1.35" fill="currentColor"/>
    </svg>
  );
}

function HomeIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4.5 11.2 12 4.8l7.5 6.4V19a1.5 1.5 0 0 1-1.5 1.5h-3.2v-5.6h-5.6v5.6H6A1.5 1.5 0 0 1 4.5 19v-7.8Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ShoppingBagIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.2 8.2h11.6l-.9 10.2a1.7 1.7 0 0 1-1.7 1.5H8.8a1.7 1.7 0 0 1-1.7-1.5L6.2 8.2Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 9V7.8a3 3 0 0 1 6 0V9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CommunityIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4.5 6.8A2.3 2.3 0 0 1 6.8 4.5h10.4a2.3 2.3 0 0 1 2.3 2.3v6.8a2.3 2.3 0 0 1-2.3 2.3h-5.1l-4.6 3.2v-3.2H6.8a2.3 2.3 0 0 1-2.3-2.3V6.8Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 7.2A2.2 2.2 0 0 1 7.2 5h9.6A2.2 2.2 0 0 1 19 7.2v5.6A2.2 2.2 0 0 1 16.8 15H11l-4 3v-3H7.2A2.2 2.2 0 0 1 5 12.8V7.2Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.2 9.8h7.6M8.2 12.2h4.8" fill="none" stroke={filled ? "#000" : "currentColor"} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8.2" r="3.3" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.2 19.3a6.8 6.8 0 0 1 13.6 0" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 4.8h10a1 1 0 0 1 1 1V20l-6-3.6L6 20V5.8a1 1 0 0 1 1-1Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M15.5 5 8.5 12l7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoreDotsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="6" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="18" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 5.2v13.6M5.2 12h13.6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function ShortsCameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4.5" y="7" width="10.5" height="10" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9.75" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 10.1 19.3 8v8L15 13.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function PhotoImageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4.2" y="5.2" width="15.6" height="13.6" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
      <path d="M6.8 16.1 10.3 12.7 12.9 15.2 15.2 12.8 17.8 16.1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PaperDocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 4.5h6.6l3.4 3.5V19a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V6A1.5 1.5 0 0 1 8 4.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14.5 4.8V8h3.1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 11.2h6M9 14.2h6M9 17.2h4.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ThumbUpIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M10 10V5.8c0-1.05.83-1.8 1.55-2.52.65-.64 1.27-1.26 1.45-2.22.06-.34.52-.42.72-.13.84 1.21 1.28 2.76 1.28 4.73V10h4.1c1.04 0 1.84.93 1.68 1.95l-1.23 7.9A2 2 0 0 1 17.58 21H9.7A1.7 1.7 0 0 1 8 19.3V10h2Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M4 10h4v11H5.2A1.2 1.2 0 0 1 4 19.8V10Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbDownIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g transform="translate(24 24) rotate(180)">
        <path
          d="M10 10V5.8c0-1.05.83-1.8 1.55-2.52.65-.64 1.27-1.26 1.45-2.22.06-.34.52-.42.72-.13.84 1.21 1.28 2.76 1.28 4.73V10h4.1c1.04 0 1.84.93 1.68 1.95l-1.23 7.9A2 2 0 0 1 17.58 21H9.7A1.7 1.7 0 0 1 8 19.3V10h2Z"
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M4 10h4v11H5.2A1.2 1.2 0 0 1 4 19.8V10Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function CommentBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 6.5h12A2.5 2.5 0 0 1 20.5 9v6A2.5 2.5 0 0 1 18 17.5H11l-4.5 3v-3H6A2.5 2.5 0 0 1 3.5 15V9A2.5 2.5 0 0 1 6 6.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ShareArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M13 5.5 20 12l-7 6.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.5 12H10a5.5 5.5 0 0 0-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function RepostIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 7.5h9.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14.1 4.6 17 7.5l-2.9 2.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 16.5H7.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.9 13.6 7 16.5l2.9 2.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 7.5H6a2 2 0 0 0-2 2V11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 16.5h1a2 2 0 0 0 2-2V13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20.2 5.7 13.9a4.6 4.6 0 0 1 6.5-6.5L12 8l-.2-.2a4.6 4.6 0 1 1 6.5 6.5L12 20.2Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function QuestionAnswerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4.5 7.4A2.4 2.4 0 0 1 6.9 5h7.6A2.4 2.4 0 0 1 16.9 7.4v3.5a2.4 2.4 0 0 1-2.4 2.4H9.8L6.1 16v-2.7H6.9a2.4 2.4 0 0 1-2.4-2.4V7.4Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8.6a1.4 1.4 0 1 1 2.4 1c-.44.43-.98.77-.98 1.62" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10.4" cy="12.2" r=".8" fill="currentColor" />
      <path d="M11.9 13.2h5.2l2.8 2v-2a2.2 2.2 0 0 0 2.1-2.2V9.4a2.2 2.2 0 0 0-2.2-2.2h-1.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15 9.5h4M15 11.7h2.5" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
    </svg>
  );
}

function ViewCountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.8 12s3.4-5.5 9.2-5.5 9.2 5.5 9.2 5.5-3.4 5.5-9.2 5.5S2.8 12 2.8 12Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

const generatedFeedAuthors = ["adult official", "seller studio", "care lab", "review crew", "brand note", "event pick"] as const;
const generatedFeedCategories = ["추천", "브랜드", "리뷰", "보관팁", "실사용", "이벤트"] as const;
const generatedFeedAccents = ["sunrise", "violet", "teal", "rose"] as const;

const FEED_CARD_PRESENTATION = {
  backgroundColor: "#000000",
  textColor: "#ffffff",
  mutedTextColor: "#d1d5db",
  accentColor: "var(--pink-2)",
} as const;

const FEED_LANDSCAPE_LIBRARY = [
  { id: 10, name: "고요한 호수 풍경" },
  { id: 11, name: "숲길 풍경" },
  { id: 12, name: "산등성이 풍경" },
  { id: 13, name: "계곡 풍경" },
  { id: 14, name: "초원 풍경" },
  { id: 15, name: "노을 호수 풍경" },
  { id: 16, name: "안개 숲 풍경" },
  { id: 17, name: "강변 풍경" },
  { id: 18, name: "절벽 해안 풍경" },
  { id: 19, name: "아침 산맥 풍경" },
  { id: 20, name: "평원 풍경" },
  { id: 21, name: "구릉지 풍경" },
  { id: 22, name: "수목원 풍경" },
  { id: 23, name: "호숫가 오솔길 풍경" },
  { id: 24, name: "들판 풍경" },
  { id: 25, name: "석양 해변 풍경" },
  { id: 26, name: "산책로 풍경" },
  { id: 27, name: "강가 풍경" },
  { id: 28, name: "고원 풍경" },
  { id: 29, name: "자작나무 숲 풍경" },
  { id: 30, name: "푸른 숲 풍경" },
  { id: 31, name: "잔잔한 강 풍경" },
  { id: 32, name: "해안 절경 풍경" },
  { id: 33, name: "수평선 노을 풍경" },
] as const;

function getFeedLandscapeMedia(itemId: number) {
  const landscape = FEED_LANDSCAPE_LIBRARY[itemId % FEED_LANDSCAPE_LIBRARY.length];
  return {
    mediaUrl: `https://picsum.photos/id/${landscape.id}/1200/900`,
    mediaName: landscape.name,
  };
}

function normalizeFeedItemPresentation(item: FeedItem): FeedItem {
  if (item.type !== "image" || item.mediaUrl) return item;
  const landscapeMedia = getFeedLandscapeMedia(item.id);
  return {
    ...item,
    mediaUrl: landscapeMedia.mediaUrl,
    mediaName: landscapeMedia.mediaName,
  };
}

const feedSeed: FeedItem[] = [
  { id: 1, type: "video", category: "브랜드", title: "입문 가이드", caption: "입문용 제품을 안전하게 고르는 기준을 10초 요약 쇼츠로 정리했습니다.", author: "adult official", likes: 428, comments: 31, accent: "sunrise", views: 3200, postedAt: "방금", videoUrl: "/generated/shorts/short_1.mp4" },
  { id: 2, type: "video", category: "추천", title: "오늘의 인기 케어 키트", caption: "관리 루틴과 함께 보기 좋은 인기 케어 키트를 짧게 소개합니다.", author: "seller studio", likes: 391, comments: 28, accent: "violet", views: 2890, postedAt: "3분 전", videoUrl: "/generated/shorts/short_2.mp4" },
  { id: 3, type: "video", category: "보관팁", title: "위생 보관 3단계", caption: "보관 파우치, 세정, 건조 순서를 한 화면으로 확인할 수 있습니다.", author: "care lab", likes: 512, comments: 44, accent: "teal", views: 4100, postedAt: "8분 전", videoUrl: "/generated/shorts/short_3.mp4" },
  { id: 4, type: "video", category: "리뷰", title: "초보자 추천 구성", caption: "리뷰가 많은 스타터 구성과 선택 포인트를 빠르게 보여줍니다.", author: "review crew", likes: 366, comments: 19, accent: "rose", views: 2510, postedAt: "15분 전", videoUrl: "/generated/shorts/short_4.mp4" },
  { id: 5, type: "video", category: "실사용", title: "조용한 사용감 비교", caption: "저소음 위주로 비교한 추천 라인업을 짧게 살펴봅니다.", author: "seller studio", likes: 448, comments: 36, accent: "sunrise", views: 3670, postedAt: "22분 전", videoUrl: "/generated/shorts/short_5.mp4" },
  { id: 6, type: "video", category: "이벤트", title: "이번 주 할인 픽", caption: "행사 중인 제품과 리뷰 수가 높은 상품을 함께 보여줍니다.", author: "event pick", likes: 299, comments: 17, accent: "violet", views: 2190, postedAt: "35분 전", videoUrl: "/generated/shorts/short_6.mp4" },
  { id: 7, type: "video", category: "신상품", title: "신상품 언박싱 컷", caption: "이번 주 새로 올라온 상품의 포장과 구성만 간단히 확인합니다.", author: "adult official", likes: 537, comments: 48, accent: "teal", views: 4620, postedAt: "48분 전", videoUrl: "/generated/shorts/short_7.mp4" },
  { id: 8, type: "video", category: "브랜드", title: "브랜드 큐레이션", caption: "브랜드별 무드와 포지션을 10초 요약으로 보여주는 소개 영상입니다.", author: "brand note", likes: 324, comments: 20, accent: "rose", views: 2430, postedAt: "1시간 전", videoUrl: "/generated/shorts/short_8.mp4" },
  { id: 9, type: "video", category: "추천", title: "리뷰 순위 TOP 제품", caption: "리뷰 수와 재구매율 기준으로 정리한 오늘의 추천 제품입니다.", author: "review crew", likes: 605, comments: 52, accent: "sunrise", views: 5080, postedAt: "2시간 전", videoUrl: "/generated/shorts/short_9.mp4" },
  { id: 10, type: "video", category: "보관팁", title: "세정 루틴 한 컷", caption: "세정 제품과 보관 방법을 아주 짧은 루틴으로 보여줍니다.", author: "care lab", likes: 417, comments: 29, accent: "violet", views: 3010, postedAt: "오늘", videoUrl: "/generated/shorts/short_10.mp4" },
  { id: 11, type: "image", category: "브랜드", title: "무광 블랙 패키지 모음", caption: "패키지 디자인과 무드 중심으로 큐레이션한 브랜드 피드입니다.", author: "adult official", likes: 182, comments: 11, accent: "teal", views: 1280, postedAt: "방금" },
  { id: 12, type: "image", category: "리뷰", title: "리뷰 많은 입문 제품", caption: "초보자 선호도가 높은 제품을 후기 중심으로 정리했습니다.", author: "review crew", likes: 173, comments: 13, accent: "rose", views: 1190, postedAt: "11분 전" },
  { id: 13, type: "image", category: "추천", title: "오늘의 추천 딜도", caption: "형태, 재질, 보관 편의성을 함께 본 추천 카드입니다.", author: "seller studio", likes: 214, comments: 16, accent: "sunrise", views: 1490, postedAt: "18분 전" },
  { id: 14, type: "image", category: "추천", title: "오늘의 추천 바이브", caption: "입문자용 저소음 바이브레이터 추천 모음입니다.", author: "seller studio", likes: 228, comments: 15, accent: "violet", views: 1560, postedAt: "24분 전" },
  { id: 15, type: "image", category: "실사용", title: "사용감 비교 메모", caption: "실사용 후기를 짧게 정리해 제품 선택 시간을 줄여줍니다.", author: "review crew", likes: 201, comments: 14, accent: "teal", views: 1455, postedAt: "29분 전" },
  { id: 16, type: "image", category: "보관팁", title: "보관 파우치 추천", caption: "위생적인 보관을 위한 파우치와 실링 키트를 정리했습니다.", author: "care lab", likes: 194, comments: 9, accent: "rose", views: 1332, postedAt: "38분 전" },
  { id: 17, type: "image", category: "브랜드", title: "국내 브랜드 집중 소개", caption: "국내 브랜드별 대표 라인업을 한 장으로 묶은 카드입니다.", author: "brand note", likes: 166, comments: 8, accent: "sunrise", views: 1201, postedAt: "43분 전" },
  { id: 38, type: "image", category: "브랜드", title: "수입 브랜드 집중 소개", caption: "수입 브랜드 중 반응이 좋은 제품군만 골라 정리했습니다.", author: "brand note", likes: 159, comments: 7, accent: "violet", views: 1172, postedAt: "52분 전" },
  { id: 39, type: "image", category: "이벤트", title: "이번 주 기획전 소식", caption: "행사 중인 인기 카테고리와 재고 상태를 한눈에 보여줍니다.", author: "event pick", likes: 247, comments: 18, accent: "teal", views: 1880, postedAt: "1시간 전" },
  { id: 40, type: "image", category: "신상품", title: "신상품 등록 미리보기", caption: "막 등록된 상품 중 반응이 빠른 제품만 먼저 보여줍니다.", author: "seller studio", likes: 177, comments: 9, accent: "rose", views: 1307, postedAt: "1시간 전" },
  { id: 41, type: "image", category: "실사용", title: "리얼 사용 후기 모음", caption: "자극 강도, 소음, 보관성 중심으로 모은 후기 카드입니다.", author: "review crew", likes: 221, comments: 21, accent: "sunrise", views: 1615, postedAt: "2시간 전" },
  { id: 42, type: "image", category: "리뷰", title: "리뷰 100+ 추천 제품", caption: "리뷰가 누적된 제품만 별도 묶음으로 보여줍니다.", author: "review crew", likes: 239, comments: 17, accent: "violet", views: 1702, postedAt: "2시간 전" },
  { id: 43, type: "image", category: "추천", title: "본디지 테이프 큐레이션", caption: "안전하게 시작하기 좋은 본디지 테이프 위주로 정리했습니다.", author: "seller studio", likes: 187, comments: 12, accent: "teal", views: 1424, postedAt: "3시간 전" },
  { id: 44, type: "image", category: "추천", title: "패들 & 케인 추천", caption: "입문형 패들과 케인을 비교해 보여주는 추천 카드입니다.", author: "seller studio", likes: 175, comments: 10, accent: "rose", views: 1362, postedAt: "3시간 전" },
  { id: 45, type: "image", category: "보관팁", title: "세정제 고르는 기준", caption: "자극도와 성분 기준으로 세정제를 고르는 방법입니다.", author: "care lab", likes: 164, comments: 8, accent: "sunrise", views: 1234, postedAt: "오늘" },
  { id: 46, type: "image", category: "보관팁", title: "보관함 정리 루틴", caption: "사용 후 말림, 보관 순서를 카드형으로 정리했습니다.", author: "care lab", likes: 154, comments: 7, accent: "violet", views: 1150, postedAt: "오늘" },
  { id: 47, type: "image", category: "브랜드", title: "프리미엄 라인 픽", caption: "고급형 라인에서 반응이 좋은 제품만 선별했습니다.", author: "adult official", likes: 208, comments: 11, accent: "teal", views: 1538, postedAt: "어제" },
  { id: 48, type: "image", category: "추천", title: "러브젤 인기 순위", caption: "후기와 재구매 데이터를 기준으로 러브젤을 정리했습니다.", author: "seller studio", likes: 191, comments: 13, accent: "rose", views: 1468, postedAt: "어제" },
  { id: 49, type: "image", category: "신상품", title: "이번 주 신규 입점", caption: "이번 주 입점한 셀러와 신규 상품 정보를 모았습니다.", author: "event pick", likes: 169, comments: 9, accent: "sunrise", views: 1260, postedAt: "어제" },
  { id: 50, type: "image", category: "리뷰", title: "입문자 만족도 상위", caption: "입문자 평점이 높은 구성만 묶은 리뷰 카드입니다.", author: "review crew", likes: 236, comments: 14, accent: "violet", views: 1741, postedAt: "어제" },
  { id: 51, type: "image", category: "추천", title: "홈 피드 테스트 01 · 오늘 많이 저장된 제품", caption: "홈 피드 스크롤 테스트용 카드입니다. 저장 수가 높은 제품과 요약 포인트를 카드형으로 보여줍니다. 실제 운영 화면에서는 본문이 길어질 수 있으므로 첫 화면에서는 3줄까지만 노출하고, 이어지는 설명은 더보기로 펼쳐 보도록 구성했습니다.", author: "adult official", likes: 287, comments: 23, accent: "sunrise", views: 1968, postedAt: "방금" },
  { id: 52, type: "image", category: "리뷰", title: "홈 피드 테스트 02 · 실사용 후기 한눈에", caption: "인스타그램·트위터형 리스트 피드 테스트용 카드입니다. 실제 후기 요약과 반응 포인트를 빠르게 확인할 수 있습니다. 제품별 장점, 사용감, 소음감, 보관성 같은 항목이 길어질 때에도 첫 화면은 짧게 유지하고 상세 문장은 접어서 보여줍니다.", author: "review crew", likes: 264, comments: 19, accent: "teal", views: 1824, postedAt: "2분 전" },
  { id: 53, type: "image", category: "보관팁", title: "홈 피드 테스트 03 · 세정과 보관 루틴", caption: "스크롤 시 다음 피드가 자연스럽게 이어지도록 배치한 테스트 카드입니다. 세정, 건조, 보관 루틴을 한 장에 정리했습니다. 사용 후 세정제를 어떻게 고르고, 어느 정도 건조한 뒤, 어떤 파우치에 넣어두는지까지 순서형으로 설명하는 긴 본문 테스트용 문장입니다.", author: "care lab", likes: 241, comments: 17, accent: "violet", views: 1712, postedAt: "4분 전" },
];


function parseRelativeMinutes(postedAt?: string) {
  if (!postedAt) return 240;
  if (postedAt === "방금") return 1;
  if (postedAt === "오늘") return 180;
  if (postedAt === "어제") return 1440;
  const minuteMatch = postedAt.match(/(\d+)분 전/);
  if (minuteMatch) return Number(minuteMatch[1]);
  const hourMatch = postedAt.match(/(\d+)시간 전/);
  if (hourMatch) return Number(hourMatch[1]) * 60;
  return 240;
}

const FEED_ALGO_FALLBACK_KEYWORDS = ["추천", "인기", "리뷰", "케어"] as const;

function formatShortDateLabel(value?: string) {
  if (!value) return "26.4.18";
  if (/^\d{2}\.\d{1,2}\.\d{1,2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.split("T")[0].split("-");
    return `${year.slice(2)}.${Number(month)}.${Number(day)}`;
  }
  if (value === "어제") return "26.4.18";
  return value;
}

function formatFeedPostedAt(postedAt?: string) {
  const minutes = parseRelativeMinutes(postedAt);
  if (minutes <= 2) return "방금 업데이트";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
  return formatShortDateLabel(postedAt);
}

function formatCommunityPostedAt(postedAt?: string) {
  const minutes = parseRelativeMinutes(postedAt);
  if (minutes < 60) return "1시간 전";
  if (minutes < 1440) return `${Math.max(1, Math.floor(minutes / 60))}시간 전`;
  return formatShortDateLabel(postedAt);
}

function parseCommunityMeta(meta: string) {
  const [authorRaw, postedAtRaw] = meta.split("·").map((item) => item.trim());
  return {
    author: authorRaw || "운영팀",
    postedAt: formatCommunityPostedAt(postedAtRaw || "26.4.18"),
  };
}

function extractInterestTokens(source: string) {
  return source
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function buildKeywordSignalMap({
  shopKeywordSignals,
  shortsKeywordSignals,
  globalKeyword,
  followingUserIds,
  savedFeedIds,
  feedItems,
  forumUsers,
}: {
  shopKeywordSignals: Record<string, number>;
  shortsKeywordSignals: Record<string, number>;
  globalKeyword: string;
  followingUserIds: number[];
  savedFeedIds: number[];
  feedItems: FeedItem[];
  forumUsers: ForumStarterUser[];
}) {
  const signalMap = new Map<string, number>();
  Object.entries(shopKeywordSignals).forEach(([token, score]) => signalMap.set(token.toLowerCase(), (signalMap.get(token.toLowerCase()) ?? 0) + score * 1.4));
  Object.entries(shortsKeywordSignals).forEach(([token, score]) => signalMap.set(token.toLowerCase(), (signalMap.get(token.toLowerCase()) ?? 0) + score * 1.8));
  extractInterestTokens(globalKeyword).forEach((token) => signalMap.set(token, (signalMap.get(token) ?? 0) + 4));

  const followedTopicKeywords = followingUserIds
    .map((id) => forumUsers.find((user) => user.id === id))
    .filter((user): user is ForumStarterUser => Boolean(user))
    .flatMap((user) => extractInterestTokens(`${user.name} ${user.topic} ${user.role}`));
  followedTopicKeywords.forEach((token) => signalMap.set(token, (signalMap.get(token) ?? 0) + 2.5));

  const savedKeywords = feedItems
    .filter((item) => savedFeedIds.includes(item.id))
    .flatMap((item) => extractInterestTokens(`${item.title} ${item.caption} ${item.category} ${item.author}`));
  savedKeywords.forEach((token) => signalMap.set(token, (signalMap.get(token) ?? 0) + 3.5));
  return signalMap;
}

function getTopMatchedKeywords(item: FeedItem, signalMap: Map<string, number>) {
  const content = `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase();
  const rankedSignals = Array.from(signalMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token.toLowerCase())
    .filter((token, index, array) => token && array.indexOf(token) === index);
  const directMatches = rankedSignals.filter((token) => content.includes(token));
  const fallback = rankedSignals.length ? rankedSignals : [...FEED_ALGO_FALLBACK_KEYWORDS];
  return Array.from(new Set([...(directMatches.length ? directMatches : fallback)])).slice(0, 2);
}

function deterministicHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1000003;
  }
  return hash;
}

function withProductMetrics(product: ProductCard, index: number): ProductCard {
  const seedText = `${product.id}-${product.name}-${product.category}-${product.badge}`;
  const reviewCount = product.reviewCount ?? 40 + (deterministicHash(`${seedText}-review`) % 260);
  const orderCount = product.orderCount ?? 20 + (deterministicHash(`${seedText}-order`) % 320);
  const repurchaseCount = product.repurchaseCount ?? 5 + (deterministicHash(`${seedText}-re`) % 140);
  const isPremium = product.isPremium ?? (/프리미엄|premium|고급/.test(`${product.name} ${product.subtitle} ${product.badge}`.toLowerCase()) || (deterministicHash(`${seedText}-premium`) % 100 < 18));
  const month = (deterministicHash(`${seedText}-month`) % 4) + 1;
  const day = (deterministicHash(`${seedText}-day`) % 27) + 1;
  const createdAt = product.createdAt ?? `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return {
    ...product,
    reviewCount,
    orderCount,
    repurchaseCount,
    isPremium,
    createdAt,
    stock_qty: product.stock_qty ?? 12 + (index % 9),
  };
}

function parseIsoDateScore(value?: string) {
  if (!value) return 0;
  const score = Date.parse(value);
  return Number.isNaN(score) ? 0 : score;
}

const SHOP_SEARCH_COLOR_OPTIONS = ["전체", "블랙", "핑크", "퍼플", "실버"] as const;
const SHOP_SEARCH_PURPOSE_OPTIONS = ["전체", "입문", "자극", "케어", "윤활", "보관"] as const;
const SHOP_HOME_SORT_TABS: ShopHomeSort[] = ["신규", "인기", "판매량", "추천", "리뷰"];

function getProductNumericPrice(product: ProductCard) {
  const numeric = Number(String(product.price).replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function getProductColorTag(product: ProductCard) {
  const source = `${product.name} ${product.subtitle} ${product.category}`.toLowerCase();
  if (/블랙|black|흑/.test(source)) return "블랙";
  if (/핑크|pink/.test(source)) return "핑크";
  if (/퍼플|purple|보라/.test(source)) return "퍼플";
  if (/실버|silver|메탈|금속/.test(source)) return "실버";
  const fallbackColors = SHOP_SEARCH_COLOR_OPTIONS.slice(1);
  return fallbackColors[deterministicHash(source || String(product.id)) % fallbackColors.length];
}

function getProductPurposeTag(product: ProductCard) {
  const source = `${product.name} ${product.subtitle} ${product.category}`.toLowerCase();
  if (/젤|윤활|수분|보습/.test(source)) return "윤활";
  if (/케어|세정|세척|클리너|위생/.test(source)) return "케어";
  if (/보관|파우치|케이스/.test(source)) return "보관";
  if (/입문|초보|소형|슬림/.test(source)) return "입문";
  if (/바이브|딜도|플러그|자극|프리미엄/.test(source)) return "자극";
  const fallbackPurposes = SHOP_SEARCH_PURPOSE_OPTIONS.slice(1);
  return fallbackPurposes[deterministicHash(source || String(product.id)) % fallbackPurposes.length];
}

function buildShopHomeRecommendationFeed({
  items,
  keywordSignals,
  visibleCount,
}: {
  items: ProductCard[];
  keywordSignals: Record<string, number>;
  visibleCount: number;
}) {
  const normalizedItems = items.map((item, index) => withProductMetrics(item, index));
  if (!normalizedItems.length) return [] as Array<ProductCard & { feedIndex: number; recommendationBucket: string }>;

  const rankedTokens = Object.entries(keywordSignals)
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token.toLowerCase())
    .filter((token) => token.length >= 2)
    .slice(0, 6);

  const fallbackTokens = normalizedItems
    .flatMap((item) => [item.category, ...extractInterestTokens(`${item.name} ${item.subtitle}`)])
    .map((token) => token.toLowerCase())
    .filter((token, index, arr) => token && arr.indexOf(token) === index)
    .slice(0, 6);

  const interestTokens = rankedTokens.length ? rankedTokens : fallbackTokens;
  const matchesInterest = (item: ProductCard) => {
    const source = `${item.category} ${item.name} ${item.subtitle} ${item.badge}`.toLowerCase();
    return interestTokens.some((token) => source.includes(token));
  };

  const interestPoolBase = normalizedItems.filter(matchesInterest);
  const interestPool = interestPoolBase.length ? interestPoolBase : normalizedItems;
  const nonInterestPoolBase = normalizedItems.filter((item) => !interestPool.some((picked) => picked.id === item.id));
  const nonInterestPool = nonInterestPoolBase.length ? nonInterestPoolBase : normalizedItems;

  const interestTarget = Math.max(1, Math.round(visibleCount * 0.8));
  const nonInterestTarget = Math.max(0, visibleCount - interestTarget);
  const bucketTargets = {
    review: Math.round(interestTarget * 0.30),
    popular: Math.round(interestTarget * 0.20),
    best: Math.round(interestTarget * 0.20),
    newest: Math.round(interestTarget * 0.20),
    premium: 0,
  };
  bucketTargets.premium = Math.max(1, interestTarget - bucketTargets.review - bucketTargets.popular - bucketTargets.best - bucketTargets.newest);

  const sortByStable = (itemsToSort: ProductCard[], valueGetter: (item: ProductCard) => number, salt: string) => (
    [...itemsToSort].sort((a, b) => valueGetter(b) - valueGetter(a) || deterministicHash(`${salt}-${a.id}`) - deterministicHash(`${salt}-${b.id}`))
  );

  const buckets = {
    review: sortByStable(interestPool, (item) => item.reviewCount ?? 0, 'review'),
    popular: sortByStable(interestPool, (item) => item.orderCount ?? 0, 'popular'),
    best: sortByStable(interestPool, (item) => item.repurchaseCount ?? 0, 'best'),
    newest: sortByStable(interestPool, (item) => parseIsoDateScore(item.createdAt), 'newest'),
    premium: sortByStable(interestPool, (item) => (item.isPremium ? 100000 : 0) + (item.reviewCount ?? 0), 'premium'),
  } as const;

  const makeRepeated = (source: ProductCard[], count: number, bucket: string) => Array.from({ length: Math.max(0, count) }, (_, index) => ({
    ...source[index % source.length],
    recommendationBucket: bucket,
  }));

  const preparedBuckets = {
    review: makeRepeated(buckets.review.length ? buckets.review : interestPool, bucketTargets.review, '관심·리뷰다수'),
    popular: makeRepeated(buckets.popular.length ? buckets.popular : interestPool, bucketTargets.popular, '관심·인기'),
    best: makeRepeated(buckets.best.length ? buckets.best : interestPool, bucketTargets.best, '관심·베스트'),
    newest: makeRepeated(buckets.newest.length ? buckets.newest : interestPool, bucketTargets.newest, '관심·신규'),
    premium: makeRepeated(buckets.premium.length ? buckets.premium : interestPool, bucketTargets.premium, '관심·고급화'),
  };

  const randomPool = [...nonInterestPool].sort((a, b) => deterministicHash(`random-${a.id}`) - deterministicHash(`random-${b.id}`));
  const randomSelections = makeRepeated(randomPool.length ? randomPool : normalizedItems, nonInterestTarget, '랜덤');

  const interestSequence: Array<ProductCard & { recommendationBucket: string }> = [];
  const bucketOrder: Array<keyof typeof preparedBuckets> = ['review', 'popular', 'best', 'newest', 'premium'];
  const cursors = { review: 0, popular: 0, best: 0, newest: 0, premium: 0 };
  while (interestSequence.length < interestTarget) {
    let pushed = false;
    for (const bucketKey of bucketOrder) {
      const bucket = preparedBuckets[bucketKey];
      const cursor = cursors[bucketKey];
      if (cursor < bucket.length) {
        interestSequence.push(bucket[cursor]);
        cursors[bucketKey] += 1;
        pushed = true;
        if (interestSequence.length >= interestTarget) break;
      }
    }
    if (!pushed) break;
  }

  const finalItems: Array<ProductCard & { recommendationBucket: string; feedIndex: number }> = [];
  const usedIds = new Set<number>();
  let interestIndex = 0;
  let randomIndex = 0;
  for (let index = 0; index < visibleCount; index += 1) {
    const shouldUseRandom = ((index + 1) % 5 === 0 && randomSelections[randomIndex]) || !interestSequence[interestIndex];
    let picked = shouldUseRandom ? randomSelections[randomIndex++] : interestSequence[interestIndex++];
    while (picked && usedIds.has(picked.id)) {
      picked = shouldUseRandom ? randomSelections[randomIndex++] : interestSequence[interestIndex++];
    }
    if (!picked) break;
    usedIds.add(picked.id);
    finalItems.push({ ...picked, feedIndex: finalItems.length });
  }

  const uniqueFallbackPool = [
    ...interestSequence,
    ...randomSelections,
    ...normalizedItems.map((item) => ({ ...item, recommendationBucket: '기본' })),
  ];

  for (const fallback of uniqueFallbackPool) {
    if (finalItems.length >= visibleCount) break;
    if (usedIds.has(fallback.id)) continue;
    usedIds.add(fallback.id);
    finalItems.push({ ...fallback, feedIndex: finalItems.length });
  }

  return finalItems;
}

type RankedFeedItem = FeedItem & { sortScore?: number };

function rankHomeFeedItems({ items, keywordSignalMap, followedTopicKeywords, savedFeedIds, keyword }: {
  items: FeedItem[];
  keywordSignalMap: Map<string, number>;
  followedTopicKeywords: string[];
  savedFeedIds: number[];
  keyword: string;
}) {
  const loweredKeyword = keyword.trim().toLowerCase();
  const filtered = !loweredKeyword
    ? items
    : items.filter((item) => `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase().includes(loweredKeyword));

  const ranked = filtered.map((item, idx) => {
    const content = `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase();
    const matchedSignalScore = Array.from(keywordSignalMap.entries()).reduce((sum, [token, score]) => sum + (content.includes(token) ? score : 0), 0);
    const freshnessMinutes = parseRelativeMinutes(item.postedAt);
    const freshnessScore = Math.max(0, 34 - Math.min(freshnessMinutes / 15, 34));
    const followScore = followedTopicKeywords.some((token) => content.includes(token)) ? 16 : 0;
    const savedScore = savedFeedIds.includes(item.id) ? 22 : 0;
    const popularityScore = Math.min(24, (item.likes / 28) + (item.comments / 8) + ((item.views ?? 0) / 500));
    const mediaBoost = item.type === "video" ? 6 : 0;
    const nicheBoost = /딜도|바이브|본디지|패들|케인|젤|세정|보관|입문|리뷰|신상품|브랜드|추천/.test(content) ? 5 : 0;
    const explorationScore = deterministicHash(`home-${item.id}-${item.title}`) % 100 < 6 ? 8 : 0;
    const recencyPenalty = freshnessMinutes >= 1440 ? 6 : 0;
    return { ...item, sortScore: matchedSignalScore + freshnessScore + followScore + savedScore + popularityScore + mediaBoost + nicheBoost + explorationScore - recencyPenalty + (filtered.length - idx) * 0.001 };
  });

  ranked.sort((a, b) => (b.sortScore ?? 0) - (a.sortScore ?? 0) || (b.views ?? 0) - (a.views ?? 0) || (b.likes - a.likes));
  return ranked;
}


function buildFreshFeedItemFromTemplate(template: FeedItem, nextId: number, order: number): FeedItem {
  const freshnessLabels = ["방금", "1분 전", "2분 전", "3분 전", "4분 전"] as const;
  const badgeTitles = ["최신 관심 피드", "새 추천 피드", "실시간 관심 카드"] as const;
  const extraCopy = [
    "관심 키워드와 최근 반응을 반영해 새로 추천된 피드입니다.",
    "최근 업로드 흐름과 저장 데이터를 반영한 최신 피드입니다.",
    "지금 보고 있는 관심사와 가까운 항목을 우선 노출한 새 피드입니다.",
  ] as const;
  const nextTitle = `${template.title} · ${badgeTitles[order % badgeTitles.length]}`;
  const nextCaptionBase = template.caption.endsWith('.') || template.caption.endsWith('!') || template.caption.endsWith('?')
    ? template.caption
    : `${template.caption}.`;

  return {
    ...template,
    id: nextId,
    title: nextTitle,
    caption: `${nextCaptionBase} ${extraCopy[order % extraCopy.length]}`,
    likes: template.likes + 12 + order * 7,
    comments: template.comments + 1 + (order % 3),
    reposts: (template.reposts ?? 0) + 1 + order,
    views: typeof template.views === "number" ? template.views + 90 + order * 65 : undefined,
    postedAt: freshnessLabels[order % freshnessLabels.length],
  };
}

const storySeed: StoryItem[] = [
  { id: 1, name: "adult official", role: "브랜드 스토리", accent: "sunrise" },
  { id: 2, name: "seller studio", role: "판매자 소식", accent: "violet" },
  { id: 3, name: "care lab", role: "보관 가이드", accent: "teal" },
  { id: 4, name: "safety note", role: "안전 팁", accent: "rose" },
  { id: 5, name: "review crew", role: "후기 모음", accent: "sunrise" },
  { id: 6, name: "event pick", role: "이벤트", accent: "violet" },
];

const askProfiles: AskProfile[] = [
  { id: 1, name: "adult official", headline: "브랜드/운영 통합 계정", intro: "스토리와 피드를 통해 정보를 공유하고 질문을 받는 홈 프로필입니다.", highlight: "답변이 공개되면 홈 피드 카드로 다시 노출됩니다." },
  { id: 2, name: "seller studio", headline: "상품 큐레이션 셀러", intro: "추천 상품, 사용 팁, 후기형 피드를 올리는 셀러 계정입니다.", highlight: "익명 또는 닉네임 기반 질문을 받을 수 있습니다." },
  { id: 3, name: "care lab", headline: "위생/보관 큐레이터", intro: "보관 루틴, 관리 팁, FAQ를 중심으로 피드를 운영합니다.", highlight: "질문 화면 상단에 프로필 요약과 질문 입력영역이 함께 보입니다." },
];

const storyPreviewText: Record<string, string> = {
  "adult official": "오늘의 브랜드 스토리와 신상품 피드를 확인해보세요.",
  "seller studio": "실사용 후기와 셀러 추천 포인트를 짧게 정리했습니다.",
  "care lab": "보관/위생 루틴을 카드형 숏토리로 모았습니다.",
  "safety note": "안전 가이드를 빠르게 훑어볼 수 있습니다.",
  "review crew": "후기형 피드를 모아 놓은 스토리입니다.",
  "event pick": "진행 중인 이벤트와 공지를 바로 확인해보세요.",
};

const shopCategories: ShopCategory[] = [];

const generatedProductCategories = ["딜도", "바이브레이터", "러브젤", "플러그", "케어 키트", "패들"] as const;
const generatedProductBadges = ["추천", "베스트", "신규", "인기", "테스트", "리뷰다수"] as const;

const productsSeed: ProductCard[] = [
  { id: 1, category: "딜도", name: "슬림 입문 딜도", subtitle: "초보자용 실리콘 라인", price: "₩18,000", badge: "인기", reviewCount: 184, thumbnailUrl: "/generated/shop/dildo.png" },
  { id: 2, category: "바이브레이터", name: "저소음 바이브레이터", subtitle: "데일리 사용감 중심", price: "₩29,000", badge: "베스트", reviewCount: 266, thumbnailUrl: "/generated/shop/vibe.png" },
  { id: 3, category: "본디지 테이프", name: "본디지 테이프 스타터", subtitle: "입문형 패키지", price: "₩14,900", badge: "추천", reviewCount: 113, thumbnailUrl: "/generated/shop/bondage_tape.png" },
  { id: 4, category: "패들", name: "소프트 패들", subtitle: "초보자 선호 라인", price: "₩24,500", badge: "리뷰다수", reviewCount: 98, thumbnailUrl: "/generated/shop/paddle.png" },
  { id: 5, category: "케인", name: "플렉시블 케인", subtitle: "가벼운 탄성 타입", price: "₩32,000", badge: "신규", reviewCount: 76, thumbnailUrl: "/generated/shop/cane.png" },
  { id: 6, category: "러브젤", name: "워터 베이스 러브젤", subtitle: "저자극 케어 라인", price: "₩12,900", badge: "재구매", reviewCount: 241, thumbnailUrl: "/generated/shop/lubricant.png" },
  { id: 7, category: "플러그", name: "실리콘 플러그", subtitle: "보관이 쉬운 구조", price: "₩21,000", badge: "입문", reviewCount: 134, thumbnailUrl: "/generated/shop/plug.png" },
  { id: 8, category: "마사지기", name: "프리미엄 마사지기", subtitle: "조용한 모터 라인", price: "₩39,000", badge: "프리미엄", reviewCount: 157, thumbnailUrl: "/generated/shop/massager.png" },
  { id: 9, category: "케어 키트", name: "세정·보관 케어 키트", subtitle: "위생 루틴 번들", price: "₩17,500", badge: "안전", reviewCount: 203, thumbnailUrl: "/generated/shop/carekit.png" },
  ...Array.from({ length: 30 }, (_, index) => ({
    id: 10 + index,
    category: generatedProductCategories[index % generatedProductCategories.length],
    name: `랜덤 테스트 상품 ${index + 1}`,
    subtitle: `${generatedProductCategories[index % generatedProductCategories.length]} 카테고리 무한 스크롤 테스트용 샘플 버튼`,
    price: `₩${(15900 + index * 1300).toLocaleString()}`,
    badge: generatedProductBadges[index % generatedProductBadges.length],
    reviewCount: 60 + (index * 5),
    thumbnailUrl: null,
  })),
];

const sponsoredFeedProducts = [
  { id: 101, label: '추천노출', title: '피드 사이 추천 상품 01', subtitle: '정보 피드 흐름 안에서 자연스럽게 노출되는 유료 상품 슬롯 예시', price: '₩19,800' },
  { id: 102, label: '추천노출', title: '피드 사이 추천 상품 02', subtitle: '운영 검수 후 홈 피드 카드 사이에 들어가는 스폰서드 상품 카드 예시', price: '₩27,500' },
  { id: 103, label: '추천노출', title: '피드 사이 추천 상품 03', subtitle: '콘텐츠 피드 톤을 유지하면서 클릭 시 상품 상세로 이동하는 구조', price: '₩31,000' },
];

const premiumMemberBenefits = [
  '익명포장 보장 옵션',
  '빠른 출고 옵션',
  '재포장/보호포장 옵션',
  '프리미엄 CS 응답 옵션',
];

const sellerB2BTools = [
  '월별 정산 리포트',
  '반품/환불 이력 리포트',
  '판매자 분쟁 대응 로그',
  '증빙 요청/다운로드 기능',
  '사업자용 대시보드',
  'SKU 승인 상태 리포트',
];

const safeCommunityIdeas = [
  '안전수칙 요약 토론방',
  '동의와 경계설정 체크인',
  '초보 입문 Q&A',
  '익명 고민상담 게시판',
  '일상/취미 라운지',
  '제품 사용/보관 팁 교류',
  '구매 전 질문 스레드',
  '후기형 짧은 댓글 토론',
  '운영진 진행형 AMA',
  '주간 주제 토크방',
];

const groupRoomNoticeItems = [
  '사람 찾기/만남/주선 금지',
  '외부 연락처 교환 금지',
  '사진/영상/파일 전송 금지',
  '금전 거래를 통한 매칭 금지',
  '신고 접수 시 관리자 대화기록 확인 가능',
];

const internalShareSources = [
  '홈 피드',
  '홈 상품',
  '홈 보관함',
  '쇼핑 목록',
  '쇼핑 주문',
  '쇼핑 바구니',
];

const sellerRequiredFields = [
  '상호/법인명',
  '대표자명',
  '사업자등록번호',
  '통신판매업 신고번호',
  '사업장 주소',
  '반품 주소',
  'CS 연락처',
  '청소년보호책임자',
  '정산 은행/계좌/예금주',
  '사업자 등록 인증 자료',
];

const skuPolicySeed = [
  { category: '위생/보관', grade: '허용', note: '보관함, 세척도구, 보호파우치, 커버류 중심으로 시작' },
  { category: '바디/케어', grade: '허용', note: '일반 케어/마사지/관리 용품 중심' },
  { category: '입문 액세서리', grade: '보류', note: '표현 수위와 외형을 검수 후 승인' },
  { category: '역할/취향 소품', grade: '보류', note: '노골적 표현, 폭력 오인, 신체손상 우려 요소는 별도 검수' },
  { category: '촬영/노출 유도 상품', grade: '금지', note: '사진/영상 촬영 유도, 공개 노출 목적 상품은 금지' },
  { category: '대여/숙박/현장서비스', grade: '금지', note: '오프라인 만남·장소·서비스 연결성 높은 품목은 금지' },
  { category: '의료효능 오인 상품', grade: '금지', note: '치료·효능·질병 개선을 표방하는 표현 금지' },
  { category: '미성년 오인/교복/연령 연상 콘셉트', grade: '금지', note: '미성년 연상 요소는 금지' },
];

const premiumSlaSeed = [
  { title: '익명포장 목표형', detail: '적용 가능 판매자에 한해 외부 포장에 상품명·브랜드명·민감 키워드 미기재를 목표로 운영' },
  { title: '빠른 출고 목표', detail: '영업일 기준 당일 또는 익영업일 출고 가능 판매자만 적용' },
  { title: '재포장/보호포장 목표', detail: '파손방지 내포장, 외부 충격 완화재, 이중 포장 기준을 목표형으로 운영' },
  { title: '프리미엄 CS 목표', detail: '운영시간 내 4시간 이내 1차 응답을 목표로 우선 처리' },
];

const storeSafeMetadataGuide = [
  '앱 설명은 성인용품 커머스·정보교류 중심으로 작성',
  '매칭/만남/파트너 찾기/직접 연결 표현 금지',
  '스크린샷은 쇼핑, 주문, 가이드, 신고/차단 화면 위주로 구성',
  '단체 톡방도 정보교류/고민상담용 화면만 노출',
  '사진·영상·외부연락 유도 표현은 메타데이터에서 제외',
];

const pgSubmissionReadiness = [
  '현재는 테스트 단계이므로 PortOne 표준 SDK, test/live 완전 분리, 보수적 SKU 기준을 우선 적용',
  '실운영 신청 전 webhook 검증, 결제 재조회, 취소/환불 상태머신, 정산 기준 문서를 고정해야 함',
  '가맹점/업종 심사 전 금지상품 SKU 정책, 환불정책, 프리미엄 배송 목표형 문구를 첨부 권장',
];

const marketplaceDisclosureItems = ['판매자명', '사업자등록번호', '통신판매업 신고번호', 'CS 연락처', '반품지'];

const pgSubmissionPackageItems = [
  '플랫폼 사업자 정보',
  '서비스 소개서',
  '거래 구조 설명서',
  '상품 카테고리 설명',
  '금지상품/SKU 정책',
  '환불/취소/정산 기준',
  '판매자 입점 시 수집하는 필수 정보',
  '청소년 차단/성인인증 방식',
  '고객센터 정보',
  '약관/개인정보처리방침/청소년보호정책',
];

const refundSettlementPolicySeed = [
  '결제 전 취소는 즉시 취소 가능, 결제 성공 후 서버 검증 전 단계에서는 주문 확정 전 상태 유지',
  '배송 전 취소는 판매자 승인 없이 접수 가능하되 이미 포장/출고 준비에 들어간 경우 상태값으로 구분',
  '배송 후는 단순변심/하자/오배송을 구분해 환불 사유코드와 증빙을 함께 저장',
  '프리미엄 배송 옵션은 실제 미이행 시 옵션금 환불 기준을 별도 문서로 고정',
  '중개형 구조에서 판매자 책임과 플랫폼 중재 책임을 주문/환불 화면에 함께 표시',
];

const pgExecutionSteps = [
  '포트원 콘솔 가입 및 비즈니스 인증',
  '전자결제 신청',
  '테스트 채널 추가',
  'Store ID / V2 API Secret 발급',
  '테스트 결제/취소/환불/webhook 검증',
  '판매자 필수 입력값 서버 검증 추가',
  '금지상품/SKU 표 확정',
  '환불/정산/프리미엄 배송 기준 문서 확정',
  '운영 MID 발급 후 실연동 채널 등록',
  '운영 최종 점검 후 심사 제출',
];

const testStageExtraActions = [
  'PortOne 테스트 webhook secret / Store ID / channel key / API Secret 발급',
  'backend/.env에는 test 값만 먼저 입력',
  '결제/취소/부분취소/환불/webhook 재전송까지 테스트',
  '판매자 필수 입력값 누락 차단 동작 확인',
  '허용 SKU만 노출한 상태로 PG 사전상담 진행',
  '운영 MID / merchant 실제값은 마지막 단계에서 반영',
];

const launchPriorityTop10 = [
  { title: '1순위 · PortOne 테스트 실값 입력', body: '테스트 webhook secret, Store ID, channel key, API Secret을 먼저 넣고 provider status에서 configured 상태를 확인합니다.' },
  { title: '2순위 · 결제/취소/환불/webhook 검증', body: '결제, 취소, 부분취소, 환불, webhook 재전송, 중복수신까지 실제 테스트해 상태머신 전이를 확인합니다.' },
  { title: '3순위 · 판매자 필수 입력 차단 운영', body: '필수값 누락 시 상품 등록·공개·주문 수락이 실제로 막히는지 관리자 화면까지 같이 확인합니다.' },
  { title: '4순위 · 운영자 override 기본 비활성화', body: '출시 준비 기본값은 override를 끄고 내부 QA용으로만 임시 사용합니다.' },
  { title: '5순위 · 허용 SKU만 노출', body: '허용 SKU만 공개하고 보류/금지 카테고리는 관리자 검수 또는 비공개 상태로 유지합니다.' },
  { title: '6순위 · PG 사전상담', body: '허용 SKU, 거래 구조, 환불정책, 통신판매중개 고지 구조를 묶어 PG/포트원 사전상담을 진행합니다.' },
  { title: '7순위 · 고지 화면 최종 점검', body: '푸터, 상품상세, 주문서에 판매자 정보와 통신판매중개 고지 문구가 정확히 표시되는지 확인합니다.' },
  { title: '8순위 · 프리미엄 배송 목표형 유지', body: '운영 안정화 전까지는 목표형/안내형 문구만 사용하고 보장형 SLA는 열지 않습니다.' },
  { title: '9순위 · 성인인증과 결제 흐름 분리 검증', body: '미인증 구매 차단, 인증 만료 차단, 인증 로그 저장, 판매자/구매자 권한 구분을 점검합니다.' },
  { title: '10순위 · 운영 MID는 마지막 입력', body: '실 merchant, 운영 MID, live webhook secret은 마지막 단계에서만 입력해 test/live 혼용을 피합니다.' },
];

const testStageDefaults = [
  { title: 'PortOne 표준 SDK', body: 'requirements.txt 기준으로 공식 SDK를 바로 설치해 테스트 채널부터 공식 webhook 검증 구조로 고정합니다.' },
  { title: '테스트/운영 완전 분리', body: 'webhook secret, Store ID, channel key, merchant ID, callback URL을 test/live로 완전 분리하고 live 값은 운영 MID 발급 직전까지 넣지 않습니다.' },
  { title: 'SKU 보수 기준', body: '허용 SKU만 실제 상품으로 노출하고, 보류 SKU는 관리자 더미 상태, 금지는 공개 차단으로 유지하며 PG 사전상담 전에는 넓히지 않습니다.' },
  { title: '프리미엄 배송 목표형', body: '보장형 대신 적용 가능 판매자 한정 목표형/안내형 문구로만 운영하고, 운영 안정화 이후에만 보장형 전환을 검토합니다.' },
  { title: '판매자 필수값 강제', body: '필수 입력이 모두 완료되기 전까지 상품 등록·공개·주문 수락을 차단하고, 출시 준비 기본값은 관리자 override도 비활성화합니다.' },
];

const marketplaceDirectionCards = [
  { title: '통신판매중개 구조', body: '플랫폼은 통신판매중개자로 고지하고, 판매자별 사업자·CS·반품·정산 책임을 분리 표시합니다.' },
  { title: '판매자 필수 입력 서버검증', body: '상호/법인명, 대표자명, 사업자번호, 통신판매업 신고번호, 주소, CS, 반품지, 정산계좌, 청소년보호책임자, 취급 카테고리를 서버 기준으로 저장·검증합니다.' },
  { title: 'PG 심사 제출 패키지', body: '포트원/PG 심사 시 제출할 사업 정보 묶음, 거래 구조 설명, 금지상품/SKU 정책, 환불/정산 기준을 한 세트로 준비합니다.' },
  { title: '운영 전환 체크', body: '테스트 MID, webhook, 환불 상태머신, 성인인증 분리 검증, 운영 메타데이터 보수화까지 완료 후 운영 전환합니다.' },
];
const goLiveBestFitCards = [
  { title: '1. 테스트값 먼저 입력', body: 'PortOne 테스트 webhook secret, Store ID, channel key, API Secret만 backend/.env에 먼저 입력하고 live 값은 마지막 단계까지 비워둡니다.' },
  { title: '2. 결제 이벤트 전수 테스트', body: '결제 성공, 취소, 부분취소, 환불, webhook 재전송, 중복수신까지 모두 테스트해 상태머신 전이가 맞는지 확인합니다.' },
  { title: '3. 판매자 차단 강제 확인', body: '필수 입력값 누락 판매자는 pending으로 두고 상품 등록·공개·주문 수락이 실제로 막히는지 관리자 화면까지 같이 확인합니다.' },
  { title: '4. 허용 SKU만 공개', body: '허용 SKU만 실제 노출하고 보류/금지는 관리자 검수 또는 비공개를 유지한 상태로 PG 사전상담을 진행합니다.' },
  { title: '5. 운영값은 마지막 입력', body: '운영 MID, live merchant, live webhook secret, live callback URL은 운영 전환 직전 마지막 단계에서만 입력합니다.' },
];
const dmRuleNoticeItems = [
  "오프라인 만남 제안 금지",
  "외부 연락처 교환 금지",
  "사진/영상 전송 금지",
  "반복 접촉 금지",
];

const forumStarterTopics = ["제품 이야기", "경계설정 이야기", "초보 고민", "일상 대화", "역할 고민"] as const;

const forumStarterUsers: ForumStarterUser[] = [
  { id: 301, name: "boundary_note", role: "경계설정 대화", topic: "경계설정 이야기", intro: "그룹방에서 대화하던 내용을 1:1로 차분히 이어가고 싶을 때 요청할 수 있습니다.", followsMe: true },
  { id: 302, name: "starter_helper", role: "초보 고민", topic: "초보 고민", intro: "입문자용 안전 질문과 기본 커뮤니케이션 기준을 함께 정리합니다.", followsMe: false },
  { id: 303, name: "daily_wave", role: "일상 대화", topic: "일상 대화", intro: "취향 이야기보다 일상과 관심사 위주로 대화를 시작하는 예시 계정입니다.", followsMe: true },
  { id: 304, name: "care_lab", role: "제품 이야기", topic: "제품 이야기", intro: "제품 사용/보관/세척 관련 질문을 먼저 나눈 뒤 상호 팔로우 시 DM 요청이 가능합니다.", followsMe: true },
  { id: 305, name: "role_balance", role: "역할 고민", topic: "역할 고민", intro: "역할 고민은 가능하지만, 사람 찾기·만남 제안·연락처 교환·사진 전송은 계속 금지됩니다.", followsMe: false },
];


const communityCategories = ["공지", "정보", "후기", "토론", "이벤트"] as const;
const communityPrimaryFilters = ["전체", "공식", "회원", "운영"] as const;
const communitySecondaryFilters = ["전체", "최신순", "공지우선", "인기순"] as const;

const communitySeed: CommunityPost[] = [
  {
    id: 9001,
    board: "커뮤",
    category: "테스트",
    title: "테스트",
    summary: "스스로에 대해 알아 가는 시간을 가져보세요.",
    meta: "운영팀 · 12분 전",
    audience: "공식",
    sortScore: 200,
    pinned: true,
    path: "소통 > 커뮤 > 테스트",
    detailTitle: "성향 탐색 테스트",
    detailBody: [
      "이 화면은 7점 척도로 답변하는 오리지널 성향 탐색 테스트입니다.",
      "주도/수용, 봉사, 규칙 선호, 감각 자극, 돌봄, 일상 친밀감 같은 축을 함께 확인하도록 구성했습니다.",
      "결과는 의료적 진단이 아니라 자기이해와 대화 정리를 위한 참고용 요약으로 제공합니다.",
    ],
    contentType: "test",
  },
  { id: 1, board: "커뮤", category: "공지", title: "안전모드 기준 및 커뮤니티 운영 원칙", summary: "앱 공개영역에서 허용되는 표현과 금지되는 표현을 한 번에 정리합니다.", meta: "관리자 · 1시간 전", audience: "공식", sortScore: 100, path: "소통 > 커뮤 > 공지" },
  { id: 2, board: "커뮤", category: "정보", title: "익명포장 SOP와 반품 회수 체크포인트", summary: "판매자/고객 모두 확인할 수 있는 실무형 요약 카드입니다.", meta: "운영팀 · 2시간 전", audience: "운영", sortScore: 92, path: "소통 > 커뮤 > 정보" },
  { id: 3, board: "후기", category: "후기", title: "사진 피드형 상품 리뷰 구성 예시", summary: "사진·짧은 영상·요약문이 결합된 소통 공간 예시입니다.", meta: "brand_note · 4시간 전", audience: "회원", sortScore: 88, path: "소통 > 후기 > 상품 후기" },
  { id: 4, board: "포럼", category: "토론", title: "신규 카테고리 승인 대기 상품 현황", summary: "판매자센터에서 확인 중인 상품들을 카테고리별로 묶어서 보여줍니다.", meta: "seller_studio · 26.4.18", audience: "회원", sortScore: 81, path: "소통 > 포럼 > 토론" },
  { id: 5, board: "포럼", category: "이벤트", title: "앱 심사 safe UI 점검 이벤트", summary: "모바일 노출 점검과 신고 흐름 확인용 공지입니다.", meta: "프로덕트팀 · 26.4.18", audience: "공식", sortScore: 90, path: "소통 > 포럼 > 이벤트" },
  { id: 6, board: "커뮤", category: "공지", title: "이용약관 및 개인정보 처리방침 안내", summary: "앱 내 약관, 개인정보 처리방침, 청소년 보호정책, 환불정책은 알림 > 공지사항과 커뮤니티 공지 카테고리에서 확인할 수 있습니다.", meta: "운영공지 · 3시간 전", audience: "공식", sortScore: 99, path: "소통 > 커뮤 > 공지" },
  { id: 7, board: "포럼", category: "공지", title: "청소년 보호정책 및 제한 웹 포럼 운영 기준", summary: "앱 공개영역에서는 랜덤채팅을 열지 않고, 제한 웹 영역에서만 안전·동의·세척/보관 정보 포럼을 승인제로 운영합니다.", meta: "안전운영팀 · 26.4.18", audience: "공식", sortScore: 97, path: "소통 > 포럼 > 공지" },
  { id: 8, board: "커뮤", category: "정보", title: "구매자 활성화를 위한 앱 내 소통 기능 10선", summary: "안전수칙 토론, 초보 Q&A, 익명 고민상담, 주간 토크방처럼 법적 리스크가 낮은 소통 구조를 정리했습니다.", meta: "기획팀 · 14시간 전", audience: "운영", sortScore: 84, path: "소통 > 커뮤 > 정보" },
];

const notificationSeed: NotificationItem[] = [
  { id: 1, section: "공지", category: "정책", title: "앱 공지사항", body: "앱 정책, 필수 문서, 서비스 업데이트 공지를 알림 목록에서 빠르게 확인할 수 있도록 정리했습니다.", meta: "정책 공지", author: "운영팀", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 2, section: "공지", category: "업데이트", title: "채팅 운영기준 업데이트", body: "성향/관심사 그룹대화는 허용하되, 1:1 대화는 상호 수락 이후에만 열리도록 기준을 정리했습니다.", meta: "앱 업데이트", author: "프로덕트팀", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 7, section: "공지", category: "운영", title: "홈 검색 구조 개편 안내", body: "상단 검색 버튼을 누르면 탭별 결과 화면으로 바로 전환되는 구조로 개편되었습니다.", meta: "운영 공지", author: "서비스운영", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
  { id: 10, section: "이벤트", category: "이벤트", title: "이번 주 기획전 오픈", body: "홈과 쇼핑 화면에서 이번 주 기획전 상품과 할인 정보를 바로 확인할 수 있습니다.", meta: "이벤트 소식", author: "이벤트팀", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 11, section: "이벤트", category: "쿠폰", title: "앱 전용 쿠폰 지급", body: "앱 전용 할인 쿠폰이 발급되었습니다. 사용 가능 상품은 쇼핑 홈 추천 영역에서 우선 노출됩니다.", meta: "혜택 안내", author: "혜택운영", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
  { id: 12, section: "이벤트", category: "기획전", title: "브랜드 기획전 종료 임박", body: "관심 키워드와 맞는 브랜드 기획전이 곧 종료됩니다. 마감 전에 상세를 확인하세요.", meta: "기획전 안내", author: "브랜드기획", postedAt: "2026-04-17", ctaLabel: "상세 보기" },
  { id: 3, section: "주문", category: "주문", title: "제품 신청접수 완료", body: "주문번호 A-240412-001 상품 신청이 접수되었고 판매자 확인 단계로 이동했습니다.", meta: "쇼핑 주문", author: "주문시스템", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 4, section: "주문", category: "배송", title: "배송 상태 변경", body: "익명포장 배송 건이 택배사에 인계되었습니다. 상세 추적은 주문 목록에서 확인하세요.", meta: "배송 알림", author: "배송센터", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
  { id: 8, section: "주문", category: "교환/환불", title: "환불 요청 접수", body: "환불 요청이 정상 접수되었으며 판매자 검수 후 처리 상태가 갱신됩니다.", meta: "주문 처리", author: "정산지원", postedAt: "2026-04-17", ctaLabel: "상세 보기" },
  { id: 13, section: "주문", category: "배송", title: "배송 준비 완료", body: "주문번호 A-240412-001 건이 포장 완료되어 출고 대기 상태입니다.", meta: "출고 준비", author: "물류센터", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 14, section: "주문", category: "배송", title: "배송 완료", body: "주문하신 상품 배송이 완료되었습니다. 필요 시 후기/상품평을 남겨주세요.", meta: "배송 완료", author: "배송센터", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
  { id: 15, section: "주문", category: "취소", title: "주문 취소 승인", body: "요청하신 주문 취소가 승인되어 결제 취소 절차가 진행 중입니다.", meta: "주문 처리", author: "주문시스템", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
  { id: 16, section: "주문", category: "반품", title: "반품 회수 접수", body: "반품 회수 요청이 등록되었고 택배사 수거 일정이 배정되었습니다.", meta: "반품 처리", author: "회수지원", postedAt: "2026-04-17", ctaLabel: "상세 보기" },
  { id: 17, section: "주문", category: "교환", title: "교환 재발송 준비중", body: "교환 승인 건의 대체 상품이 재포장 단계에 들어갔습니다.", meta: "교환 처리", author: "물류센터", postedAt: "2026-04-17", ctaLabel: "상세 보기" },
  { id: 5, section: "소통", category: "댓글", title: "커뮤니티 댓글 알림", body: "공지 카테고리 게시글에 새 댓글이 등록되었습니다.", meta: "커뮤니티", author: "커뮤니티봇", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 6, section: "소통", category: "채팅", title: "그룹대화/1:1 운영 안내", body: "앱에서는 성향/관심사 기반 그룹대화를 허용하되, 외부 연락처 교환·오프라인 제안·사진/영상 전송은 금지하고 1:1은 상호 수락 후에만 허용합니다.", meta: "채팅 안내", author: "안전운영팀", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
  { id: 9, section: "소통", category: "질문", title: "질문 답변 등록 완료", body: "질문 카드에 새로운 답변이 등록되어 프로필 질문 탭에서 바로 확인할 수 있습니다.", meta: "질문 알림", author: "Q&A봇", postedAt: "2026-04-17", ctaLabel: "상세 보기" },
  { id: 18, section: "소통", category: "메세지", title: "내 계정으로 새 메세지 도착", body: "상호수락 1:1 대화방에 새 메세지가 도착했습니다.", meta: "메세지 알림", author: "채팅시스템", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 19, section: "소통", category: "후기/상품평", title: "후기 등록 요청", body: "배송 완료 상품에 대해 후기 또는 상품평을 남길 수 있습니다.", meta: "리뷰 알림", author: "리뷰봇", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
];

const threadSeed: ThreadItem[] = [
  { id: 101, name: "match_onyu", purpose: "상호수락 1:1", preview: "오늘 저녁에 이어서 이야기 나눠도 괜찮을까요?", time: "오전 9:41", unread: 2, avatar: "온", kind: "개인", favorite: true, status: "수락완료" },
  { id: 102, name: "soft_wave", purpose: "상호수락 1:1", preview: "서로 편한 시간대부터 맞춰보고 천천히 대화해요.", time: "오전 8:12", unread: 1, avatar: "소", kind: "개인", favorite: true, status: "활성" },
  { id: 103, name: "운영 문의", purpose: "상품/운영 문의", preview: "판매 가능 상품군 검수 기준을 다시 확인 부탁드립니다.", time: "어제", unread: 2, avatar: "운", kind: "개인", favorite: true, status: "고정" },
  { id: 104, name: "구매자 지원", purpose: "구매자 지원", preview: "장바구니에 담긴 옵션 변경이 가능한지 문의드립니다.", time: "어제", unread: 0, avatar: "구", kind: "개인" },
  { id: 105, name: "정산 지원", purpose: "정산/환불", preview: "이번 주 환불 건 정산 반영 일정을 공유드립니다.", time: "4월 8일", unread: 3, avatar: "정", kind: "개인", favorite: true },
  { id: 106, name: "주문센터", purpose: "쇼핑 주문", preview: "주문번호 A-240412-001 건이 오늘 출고 예정입니다.", time: "4월 7일", unread: 0, avatar: "주", kind: "개인" },
  { id: 107, name: "자유대화 라운지", purpose: "단체", preview: "오늘은 각자 루틴 정리 팁을 한 가지씩 공유해 주세요.", time: "4월 6일", unread: 4, avatar: "자", kind: "단체", favorite: true },
  { id: 108, name: "일상/취미 톡", purpose: "단체", preview: "주말에 본 영화나 콘텐츠 추천을 이어서 적어봐요.", time: "4월 5일", unread: 0, avatar: "일", kind: "단체" },
];

const archivedThreadSeed: ThreadItem[] = [
  { id: 109, name: "브랜드 문의", purpose: "상품/운영 문의", preview: "기획전 배너 노출 일정과 적용 범위를 확인해 주세요.", time: "4월 4일", unread: 0, avatar: "브", kind: "개인" },
  { id: 110, name: "배송 알림", purpose: "쇼핑 주문", preview: "주문한 상품이 집하 처리되어 익명포장으로 이동 중입니다.", time: "4월 3일", unread: 0, avatar: "배", kind: "개인" },
  { id: 111, name: "refund check", purpose: "정산/환불", preview: "부분 환불 요청 내역을 다시 확인해 주세요.", time: "4월 2일", unread: 0, avatar: "환", kind: "개인" },
  { id: 112, name: "seller studio", purpose: "구매자 지원", preview: "옵션 구성 변경 여부를 안내드립니다.", time: "4월 1일", unread: 0, avatar: "셀", kind: "개인" },
  { id: 113, name: "daily talk", purpose: "단체", preview: "오늘의 일상/취미 대화방 새 주제가 올라왔습니다.", time: "3월 31일", unread: 0, avatar: "일", kind: "단체" },
  { id: 114, name: "care_lab", purpose: "단체", preview: "세척 루틴 체크리스트를 방 상단 공지에 정리해두었습니다.", time: "3월 30일", unread: 0, avatar: "케", kind: "단체" },
  { id: 115, name: "review crew", purpose: "단체", preview: "이번 주 실사용 후기 묶음을 공유합니다.", time: "3월 29일", unread: 0, avatar: "리", kind: "단체" },
  { id: 116, name: "consent guide", purpose: "상호수락 1:1", preview: "동의/합의 기본 문장을 먼저 맞춰보는 대화입니다.", time: "3월 28일", unread: 0, avatar: "동", kind: "개인" },
  { id: 117, name: "quiet_bridge", purpose: "상호수락 1:1", preview: "대화 속도는 천천히 맞추면서 이어가도 괜찮습니다.", time: "3월 27일", unread: 0, avatar: "브", kind: "개인" },
  { id: 118, name: "포럼 소식", purpose: "단체", preview: "포럼 인기 방 순위가 갱신되었습니다.", time: "3월 26일", unread: 0, avatar: "포", kind: "단체" },
  { id: 119, name: "habit room", purpose: "단체", preview: "취미/일상 주제 대화방은 최근 대화부터 순서대로 보여집니다.", time: "3월 25일", unread: 0, avatar: "취", kind: "단체" },
  { id: 120, name: "archive room", purpose: "단체", preview: "과거 공지 대화가 보관되었습니다.", time: "3월 24일", unread: 0, avatar: "보", kind: "단체" },
  { id: 121, name: "purchase care", purpose: "구매자 지원", preview: "문의 남겨주신 옵션 재입고 일정을 공유드립니다.", time: "3월 23일", unread: 0, avatar: "구", kind: "개인" },
  { id: 122, name: "order sync", purpose: "쇼핑 주문", preview: "주문/환불 동기화 기록이 마무리되었습니다.", time: "3월 22일", unread: 0, avatar: "오", kind: "개인" },
  { id: 123, name: "shop ops", purpose: "상품/운영 문의", preview: "상품 승인 기준 변경안이 적용되었습니다.", time: "3월 21일", unread: 0, avatar: "상", kind: "개인" },
  { id: 124, name: "settlement desk", purpose: "정산/환불", preview: "이번 달 정산 리포트 초안이 등록되었습니다.", time: "3월 20일", unread: 0, avatar: "정", kind: "개인" },
  { id: 125, name: "cozy_loop", purpose: "상호수락 1:1", preview: "대화 규칙을 먼저 확인하고 천천히 이어갈게요.", time: "3월 19일", unread: 0, avatar: "코", kind: "개인" },
  { id: 126, name: "late_sunset", purpose: "상호수락 1:1", preview: "답장 속도는 느려도 괜찮으니 편할 때 이야기 주세요.", time: "3월 18일", unread: 0, avatar: "선", kind: "개인" },
  { id: 127, name: "안전수칙 체크", purpose: "단체", preview: "오늘은 신고 대응 체크리스트를 공유합니다.", time: "3월 17일", unread: 0, avatar: "안", kind: "단체" },
  { id: 128, name: "자유수다 보관", purpose: "단체", preview: "지난주 자유대화 하이라이트를 정리해 두었습니다.", time: "3월 16일", unread: 0, avatar: "자", kind: "단체" },
  { id: 129, name: "구매자 케어", purpose: "구매자 지원", preview: "구매 전 문의 응답시간이 평균 10분대로 단축되었습니다.", time: "3월 15일", unread: 0, avatar: "케", kind: "개인" },
  { id: 130, name: "주문 확인", purpose: "쇼핑 주문", preview: "주문번호 A-240401-002 결제 상태가 완료로 바뀌었습니다.", time: "3월 14일", unread: 0, avatar: "주", kind: "개인" },
  { id: 131, name: "brand concierge", purpose: "상품/운영 문의", preview: "브랜드 페이지 노출 순서를 조정할 예정입니다.", time: "3월 13일", unread: 0, avatar: "브", kind: "개인" },
  { id: 132, name: "refund queue", purpose: "정산/환불", preview: "이번 주 검수 완료 건이 순차적으로 처리됩니다.", time: "3월 12일", unread: 0, avatar: "환", kind: "개인" },
  { id: 133, name: "soft_note", purpose: "상호수락 1:1", preview: "자기소개를 짧게 남겨두었으니 편할 때 읽어주세요.", time: "3월 11일", unread: 0, avatar: "노", kind: "개인" },
  { id: 134, name: "forum helper", purpose: "단체", preview: "포럼방 안내문은 입장 직후 시스템 메시지로 노출됩니다.", time: "3월 10일", unread: 0, avatar: "도", kind: "단체" },
  { id: 135, name: "weekend room", purpose: "단체", preview: "주말 자유대화방의 최근 메시지를 불러왔습니다.", time: "3월 9일", unread: 0, avatar: "주", kind: "단체" },
  { id: 136, name: "member support", purpose: "구매자 지원", preview: "회원 문의에 대한 답변 초안이 저장되었습니다.", time: "3월 8일", unread: 0, avatar: "멤", kind: "개인" },
  { id: 137, name: "warehouse note", purpose: "쇼핑 주문", preview: "재고 동기화 이후 주문 가능 수량이 갱신되었습니다.", time: "3월 7일", unread: 0, avatar: "창", kind: "개인" },
  { id: 138, name: "mutual_check", purpose: "상호수락 1:1", preview: "서로 불편한 주제는 미리 제외하고 이야기해 봐요.", time: "3월 6일", unread: 0, avatar: "체", kind: "개인" },
  { id: 139, name: "role board", purpose: "단체", preview: "관계/역할 포럼의 이번 주 공통 질문이 올라왔습니다.", time: "3월 5일", unread: 0, avatar: "역", kind: "단체" },
  { id: 140, name: "safety digest", purpose: "단체", preview: "안전수칙 요약본이 새로운 버전으로 교체되었습니다.", time: "3월 4일", unread: 0, avatar: "수", kind: "단체" },
];

const incomingChatRequestSeed: ChatRequestItem[] = [
  {
    id: 901,
    name: "velvet_room",
    purpose: "상호수락 1:1",
    preview: "채팅 요청을 보냈습니다. 수락하면 일반 채팅 목록으로 이동합니다.",
    requestText: "관심사가 비슷해서 먼저 인사드려요. 괜찮으시면 수락 후 천천히 이야기 나누고 싶습니다.",
    time: "방금",
    avatar: "벨",
  },
  {
    id: 902,
    name: "calm_signal",
    purpose: "상호수락 1:1",
    preview: "답장은 수락 후에만 가능합니다.",
    requestText: "프로필을 보고 먼저 채팅 요청 남깁니다. 편하실 때 확인 부탁드립니다.",
    time: "오전 10:24",
    avatar: "캄",
  },
  {
    id: 903,
    name: "soft_anchor",
    purpose: "상호수락 1:1",
    preview: "대화 규칙을 확인한 뒤 수락해 주세요.",
    requestText: "상호 존중 기준으로 천천히 대화해 보고 싶어서 요청드립니다.",
    time: "어제",
    avatar: "앵",
  },
];

const createThreadRoomSeed = (thread: ThreadItem): ChatRoomMessage[] => {
  const connectionLead = thread.kind === "단체"
    ? `${thread.name} 방에 연결된 채팅방입니다.`
    : `${thread.name}님과 연결된 채팅방입니다.`;
  const now = Date.now();
  const baseNoticeText = [
    "외부 연락처 교환은 지양하며, 사진 / 영상 전송은 제한됩니다.",
    "금전 거래를 통한 만남, 음란물 유포는 절대금지입니다.",
  ];
  const requestReceivedText = "상대방이 먼저 보낸 요청입니다. 이 방에서 첫 메시지를 보내면 채팅이 수락되고 일반 채팅 목록으로 이동합니다.";
  const noticeMessages: ChatRoomMessage[] = [
    { id: thread.id * 100 + 1, threadId: thread.id, author: "system", text: baseNoticeText.join("\n"), meta: "안내사항", system: true, createdAt: now - 8 * 60000 },
    { id: thread.id * 100 + 2, threadId: thread.id, author: "system", text: connectionLead, meta: "", system: true, createdAt: now - 6 * 60000 },
  ];

  if (thread.status === "요청전송") {
    return [
      ...noticeMessages,
      { id: thread.id * 100 + 4, threadId: thread.id, author: "system", text: "채팅 요청을 먼저 보낸 상태입니다. 상대방이 수락해야 답변이 가능합니다.", meta: "요청 대기", system: true, createdAt: now - 4 * 60000 },
      { id: thread.id * 100 + 5, threadId: thread.id, author: "나", text: thread.preview, meta: thread.time, mine: true, createdAt: now - 2 * 60000, contentKind: "text" },
    ];
  }

  if (thread.status === "요청받음") {
    return [
      { ...noticeMessages[0], text: [...baseNoticeText, requestReceivedText].join("\n") },
      noticeMessages[1],
      { id: thread.id * 100 + 5, threadId: thread.id, author: thread.name, text: thread.preview, meta: thread.time, mine: false, createdAt: now - 2 * 60000, contentKind: "text" },
    ];
  }

  const supportLine = thread.kind === "단체"
    ? `${thread.purpose} 주제로 최근 대화가 상단부터 정렬됩니다.`
    : `${thread.purpose} 기준으로 연결된 채팅방이며, 필요한 경우 답장·공유·공지 기능을 이어서 사용할 수 있습니다.`;

  return [
    ...noticeMessages,
    { id: thread.id * 100 + 4, threadId: thread.id, author: thread.name, text: thread.preview, meta: thread.time, mine: false, createdAt: now - 4 * 60000, contentKind: "text" },
    { id: thread.id * 100 + 5, threadId: thread.id, author: "나", text: supportLine, meta: "지금", mine: true, createdAt: now - 2 * 60000, contentKind: "text" },
  ];
};

const chatAvatarPalette = [
  ["#2b1120", "#ff5ea9"],
  ["#13253f", "#63b3ff"],
  ["#143028", "#5eead4"],
  ["#32180f", "#fbbf24"],
  ["#2c173d", "#c084fc"],
] as const;

const buildChatAvatarDataUri = (seed: string) => {
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [from, to] = chatAvatarPalette[Math.abs(hash) % chatAvatarPalette.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="avatar">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="32" fill="url(#g)" />
      <circle cx="32" cy="24" r="12" fill="rgba(255,255,255,0.96)" />
      <path d="M14 54c2.5-10 10.5-17 18-17s15.5 7 18 17" fill="rgba(255,255,255,0.96)" />
    </svg>
  `.replace(/\s+/g, ' ').trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const CHAT_REACTION_OPTIONS: Array<{ key: ChatRoomReactionKey; label: string; symbol: string; className: string }> = [
  { key: "heart", label: "하트", symbol: "♥", className: "heart" },
  { key: "like", label: "좋아요", symbol: "👍", className: "like" },
  { key: "check", label: "체크", symbol: "✓", className: "check" },
  { key: "smile", label: "웃음", symbol: "☺", className: "smile" },
  { key: "surprised", label: "놀람", symbol: "!", className: "surprised" },
  { key: "sad", label: "슬픔", symbol: "☹", className: "sad" },
];

const CHAT_QUICK_SHARE_ITEMS = [
  { key: 'photo', label: '사진첨부', emoji: '🖼' },
  { key: 'map', label: '지도공유', emoji: '📍' },
  { key: 'file', label: '파일첨부', emoji: '📎' },
  { key: 'profile', label: '프로필공유', emoji: '👤' },
] as const;

const CHAT_PICKER_TABS: ChatPickerMode[] = ["이모티콘", "스티커", "GIF"];
const CHAT_PICKER_LIBRARY: Record<ChatPickerMode, Array<{ key: string; label: string; items: string[] }>> = {
  "이모티콘": [
    { key: "emoji-1", label: "이모티콘1", items: ["😀", "😄", "😊", "😍", "😎", "😉", "🤗", "🥰", "😘", "🤍", "💗", "💜", "🔥", "✨", "🎉", "🙌"] },
    { key: "emoji-2", label: "이모티콘2", items: ["👍", "👌", "✌️", "👏", "🙏", "💯", "✅", "⭐", "🌙", "☀️", "🍀", "🎈", "🎵", "📍", "📎", "💌"] },
    { key: "emoji-3", label: "이모티콘3", items: ["🤔", "😮", "😢", "😭", "😡", "😴", "🤯", "🥺", "😇", "🤝", "🫶", "💋", "💪", "🎁", "🖤", "💫"] },
  ],
  "스티커": [
    { key: "sticker-1", label: "이모티콘1", items: ["러브곰 01", "러브곰 02", "러브곰 03", "러브곰 04", "러브곰 05", "러브곰 06"] },
    { key: "sticker-2", label: "이모티콘2", items: ["야옹이 01", "야옹이 02", "야옹이 03", "야옹이 04", "야옹이 05", "야옹이 06"] },
    { key: "sticker-3", label: "이모티콘3", items: ["말풍선 01", "말풍선 02", "말풍선 03", "말풍선 04", "말풍선 05", "말풍선 06"] },
  ],
  "GIF": [
    { key: "gif-1", label: "이모티콘1", items: ["하트 루프", "박수 루프", "반짝 루프", "체크 루프", "댄스 루프", "손흔들기 루프"] },
    { key: "gif-2", label: "이모티콘2", items: ["놀람 루프", "웃음 루프", "응원 루프", "엄지척 루프", "하이파이브 루프", "축하 루프"] },
    { key: "gif-3", label: "이모티콘3", items: ["달빛 루프", "별빛 루프", "하트빔 루프", "핑크웨이브 루프", "무드라이트 루프", "네온사인 루프"] },
  ],
};
const DEFAULT_CHAT_RECENT_PICKER_ITEMS: Record<ChatPickerMode, string[]> = {
  "이모티콘": ["💗", "✨", "👍", "😊", "🔥", "🎉"],
  "스티커": ["러브곰 01", "야옹이 01", "말풍선 01"],
  "GIF": ["하트 루프", "박수 루프", "네온사인 루프"],
};

function formatChatMessageMeta(createdAt?: number, edited?: boolean) {
  if (!createdAt) return edited ? '방금 수정됨' : '방금';
  const diffMinutes = Math.max(0, Math.round((Date.now() - createdAt) / 60000));
  const base = diffMinutes < 1 ? '방금' : diffMinutes < 60 ? `${diffMinutes}분 전` : `${Math.floor(diffMinutes / 60)}시간 전`;
  return edited ? `${base} · 수정됨` : base;
}

function formatChatMessageClock(createdAt?: number) {
  if (!createdAt) return '지금';
  const date = new Date(createdAt);
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  return `${hour}:${minute}`;
}

const forumRoomNoticeText = `<포럼방 안내사항>
 - 정보교류와 고민상담용이며, 만남/주선은 허용하지 않습니다.
 - 외부 연락처 교환 금지
 - 음란 사진/영상/파일 전송 금지
 - 금전 거래를 통한 만남 금지
 - 신고 접수 시 관리자 대화기록 확인 가능`;

const forumRoomSeed: ForumRoom[] = [
  { id: 501, category: "자유대화", title: "자유대화 라운지", summary: "가벼운 안부와 앱 사용 경험을 부담 없이 나누는 포럼방입니다.", starter: "포럼 운영봇", participants: 18, latestAt: "방금", introMessage: "자유대화 라운지에 오신 것을 환영합니다. 규칙 범위 안에서 편하게 대화를 이어가세요." },
  { id: 502, category: "일상/취미", title: "퇴근 후 일상 메모", summary: "일상 루틴, 취미, 오늘 있었던 소소한 대화를 이어가는 방입니다.", starter: "daily mate", participants: 14, latestAt: "3분 전", introMessage: "오늘 있었던 일이나 취미 이야기를 자유롭게 남겨보세요." },
  { id: 503, category: "고민", title: "초보 고민 상담", summary: "입문 전 궁금했던 점과 조심해야 할 포인트를 차분히 묻고 답하는 방입니다.", starter: "starter helper", participants: 11, latestAt: "8분 전", introMessage: "처음이라 막막했던 고민을 한 문장씩 남겨주시면 함께 정리해드립니다." },
  { id: 504, category: "관계/역할", title: "관계 소통 체크인", summary: "관계 안에서의 기대치와 역할, 대화방식을 정리하는 주제형 포럼입니다.", starter: "role note", participants: 9, latestAt: "11분 전", introMessage: "서로 기대하는 소통 방식이나 경계에 대해 차분히 이야기해보세요." },
  { id: 505, category: "안전수칙", title: "안전수칙 체크포인트", summary: "동의, 위생, 보관, 신고 대응처럼 기본 안전수칙만 모아 공유하는 방입니다.", starter: "care lab", participants: 16, latestAt: "18분 전", introMessage: "기본 수칙과 체크리스트를 중심으로 정보만 정리하는 포럼방입니다." },
  { id: 506, category: "동의/합의/계약", title: "동의/합의 문장 정리", summary: "합의 전 확인해야 할 표현과 기록 방법을 사례형으로 나누는 포럼입니다.", starter: "consent guide", participants: 12, latestAt: "24분 전", introMessage: "동의와 합의는 구체적인 문장으로 남기는 것이 중요합니다. 기준 문장을 함께 정리해보세요." },
  { id: 507, category: "자유대화", title: "오늘의 수다", summary: "짧은 잡담과 앱 안에서 본 흥미로운 내용을 편하게 남기는 방입니다.", starter: "chat mate", participants: 7, latestAt: "41분 전", introMessage: "가벼운 수다도 좋지만, 앱 규칙과 운영 기준은 꼭 지켜주세요." },
  { id: 508, category: "일상/취미", title: "취미 공유 테이블", summary: "취미/루틴/콘텐츠 추천처럼 부담 없는 주제를 정리하는 포럼방입니다.", starter: "hobby note", participants: 10, latestAt: "1시간 전", introMessage: "최근 즐긴 취미나 루틴을 한 줄씩 나눠보세요." },
  { id: 509, category: "고민", title: "관계 고민 익명토크", summary: "상황을 간단히 적고 조언을 받는 고민 전용 포럼입니다.", starter: "mind care", participants: 13, latestAt: "2시간 전", introMessage: "구체적 신상정보 없이 고민 상황만 간단히 적어주세요." },
  { id: 510, category: "안전수칙", title: "보관/세척 정보교류", summary: "세척제, 건조, 보관 파우치 등 관리 루틴을 공유하는 정보방입니다.", starter: "clean mate", participants: 8, latestAt: "오늘", introMessage: "보관과 세척 중심의 정보만 정리하는 포럼방입니다." },
  { id: 511, category: "관계/역할", title: "관계 경계선 대화", summary: "거절 표현, 중단 신호, 서로의 경계선 정리를 돕는 대화방입니다.", starter: "boundary note", participants: 6, latestAt: "오늘", introMessage: "서로 불편하지 않은 선을 어떻게 정리할지 이야기해보세요." },
  { id: 512, category: "동의/합의/계약", title: "기록과 합의 체크", summary: "동의/합의 내용을 기록하는 방식과 주의점을 공유하는 포럼입니다.", starter: "record safe", participants: 5, latestAt: "오늘", introMessage: "중요한 합의일수록 구체적이고 명확한 기록이 필요합니다." },
];

const randomRoomSeed: RandomRoom[] = [
  { id: 2001, title: "관계 역할 고민 라운지", category: "관계역할/고민", maxPeople: 6, currentPeople: 3, password: "", latestMessage: "역할 기대치와 대화 방식 차이를 편하게 나누는 방입니다." },
  { id: 2002, title: "동의/경계설정 오픈룸", category: "동의/경계설정", maxPeople: 8, currentPeople: 5, password: "1234", latestMessage: "동의 문장, 금지선, 사전 체크리스트를 함께 정리합니다." },
  { id: 2003, title: "퇴근 후 일상대화", category: "일상/취미", maxPeople: 5, currentPeople: 2, password: "", latestMessage: "가볍게 하루 있었던 일을 나누는 방입니다." },
  { id: 2004, title: "안전수칙 메모방", category: "안전수칙", maxPeople: 10, currentPeople: 7, password: "", latestMessage: "비동의 금지, 연락처 유도 금지, 외부 이동 금지 기준을 확인해요." },
  { id: 2005, title: "자유대화 라운지", category: "자유대화", maxPeople: 4, currentPeople: 1, password: "5678", latestMessage: "규칙 안에서 취향, 관심사, 일상 주제를 자유롭게 나눕니다." },
  { id: 2006, title: "관계 소통 체크인", category: "관계역할/고민", maxPeople: 6, currentPeople: 4, password: "", latestMessage: "서로 기대하는 커뮤니케이션 방식을 차분히 정리해보세요." },
  { id: 2007, title: "초보 안전 정보공유", category: "안전수칙", maxPeople: 8, currentPeople: 6, password: "", latestMessage: "입문자가 보기 쉬운 안전 기준만 모아둔 방입니다." },
];

const questionSeed: QuestionCard[] = [
  { id: 1, author: "profile_owner", question: "프로필을 꾸밀 때 가장 먼저 신경 쓰는 부분은 무엇인가요?", answer: "처음 들어온 사람이 한눈에 이해할 수 있도록 제목, 요약, 대표 이미지를 먼저 정리합니다. 질문 화면에서는 너무 자극적인 표현보다 신뢰감 있는 설명이 오래 남습니다.", meta: "답변 완료 · 오늘", likes: 28, comments: 6 },
  { id: 2, author: "visitor_204", question: "질문 기능은 어떤 식으로 운영하면 참여율이 높아질까요?", answer: "질문 등록 버튼을 눈에 띄게 두고, 답변 완료된 질문을 카드형으로 계속 노출하면 참여율이 높아집니다. 상단 광고는 콘텐츠 흐름을 끊지 않는 위치에 두는 것이 안전합니다.", meta: "답변 완료 · 2시간 전", likes: 17, comments: 4 },
  { id: 3, author: "community_user", question: "익명 질문과 일반 질문을 같이 운영해도 괜찮나요?", answer: "가능합니다. 다만 신고, 차단, 키워드 필터, 운영정책이 함께 있어야 운영 리스크를 줄일 수 있습니다. 질문 등록 전 가이드 문구도 같이 노출하는 것이 좋습니다.", meta: "답변 완료 · 어제", likes: 21, comments: 3 },
];

const testScaleOptions = [
  { score: -3, label: "전혀 아니다" },
  { score: -2, label: "아니다" },
  { score: -1, label: "조금 아니다" },
  { score: 0, label: "잘 모르겠다" },
  { score: 1, label: "조금 그렇다" },
  { score: 2, label: "그렇다" },
  { score: 3, label: "매우 그렇다" },
] as const;

const testAxisMeta: Record<TestAxisKey, { label: string; summary: string }> = {
  lead: { label: "주도형", summary: "상황의 방향과 흐름을 먼저 설계하려는 경향" },
  follow: { label: "수용형", summary: "상대가 제안한 흐름을 받아들이며 안정감을 얻는 경향" },
  service: { label: "봉사형", summary: "상대를 챙기고 준비하는 역할에서 만족을 느끼는 경향" },
  sensation: { label: "감각자극형", summary: "새로운 감각 자극과 긴장감에 호기심을 보이는 경향" },
  structure: { label: "규칙/구조형", summary: "명확한 약속, 신호, 순서를 선호하는 경향" },
  restraint: { label: "속박호기심형", summary: "제한감이나 고정된 자세 같은 통제 장치에 관심을 보이는 경향" },
  playful: { label: "놀이/도전형", summary: "장난기와 역할 놀이, 밀고 당기기 대화에 흥미를 느끼는 경향" },
  care: { label: "돌봄/안정형", summary: "안심, 돌봄, 정서적 안전장치가 있어야 몰입되는 경향" },
  intimacy: { label: "일상친밀형", summary: "특별한 장치보다 일상적 친밀감과 대화를 더 중시하는 경향" },
  switch: { label: "혼합탐색형", summary: "상황에 따라 주도와 수용이 모두 자연스러운 경향" },
};

const testQuestions: TestQuestion[] = [
  { id: 1, prompt: "관계나 플레이 상황에서 내가 먼저 방향을 잡는 편이 편하다.", helper: "리드와 진행 설계 선호를 확인합니다.", weights: { lead: 1.8, structure: 0.8, switch: 0.4 } },
  { id: 2, prompt: "상대가 제안한 흐름을 따라갈 때 더 안정감을 느낀다.", helper: "수용과 위임의 편안함을 확인합니다.", weights: { follow: 1.8, care: 0.6, switch: 0.4 } },
  { id: 3, prompt: "상대를 위해 준비하고 챙기는 역할에서 만족감이 크다.", helper: "봉사 성향과 배려 역할을 확인합니다.", weights: { service: 1.8, care: 0.7 } },
  { id: 4, prompt: "사전에 규칙, 금지선, 신호를 또렷하게 맞추는 과정이 중요하다.", helper: "규칙/구조 선호를 확인합니다.", weights: { structure: 1.8, care: 0.6 } },
  { id: 5, prompt: "살짝 긴장되는 감각 자극이나 새로운 자극을 탐색해 보고 싶다.", helper: "감각 자극과 탐색 성향을 확인합니다.", weights: { sensation: 1.7, playful: 0.5 } },
  { id: 6, prompt: "움직임이 제한되거나 자세가 고정되는 설정에 호기심이 있다.", helper: "제한감/속박 호기심을 확인합니다.", weights: { restraint: 1.9, structure: 0.5 } },
  { id: 7, prompt: "가벼운 역할 놀이와 밀고 당기기 대화가 재미있다.", helper: "놀이/도전형 반응을 확인합니다.", weights: { playful: 1.8, switch: 0.5 } },
  { id: 8, prompt: "강한 자극보다도 안심시키는 말과 마무리 돌봄이 더 중요하다.", helper: "정서적 안정과 돌봄 기대를 확인합니다.", weights: { care: 1.9, intimacy: 0.6 } },
  { id: 9, prompt: "특별한 장치 없이도 대화와 친밀감만으로 충분히 몰입할 수 있다.", helper: "일상 친밀감 중심 성향을 확인합니다.", weights: { intimacy: 1.9, care: 0.5 } },
  { id: 10, prompt: "상대가 내 반응을 세심하게 읽으며 속도를 조절해 주면 좋다.", helper: "수용형과 돌봄 기대를 함께 확인합니다.", weights: { follow: 1.2, care: 1.0 } },
  { id: 11, prompt: "필요할 때는 내가 규칙과 리듬을 정리해 주는 편이 자연스럽다.", helper: "주도형과 구조형의 결합을 확인합니다.", weights: { lead: 1.3, structure: 1.2 } },
  { id: 12, prompt: "상대의 반응을 보고 준비를 맞춰 주거나 챙겨 주는 일에 보람을 느낀다.", helper: "봉사형과 돌봄형의 결합을 확인합니다.", weights: { service: 1.3, care: 1.0 } },
  { id: 13, prompt: "조금 예측하기 어려운 분위기나 도전적인 제안이 끌릴 때가 있다.", helper: "놀이/감각 탐색 성향을 확인합니다.", weights: { playful: 1.2, sensation: 1.0 } },
  { id: 14, prompt: "준비된 공간, 도구, 합의된 순서가 갖춰져 있을수록 몰입이 쉽다.", helper: "구조와 제한감의 조합을 확인합니다.", weights: { structure: 1.2, restraint: 1.0 } },
  { id: 15, prompt: "그날의 분위기에 따라 주도하거나 따라가는 쪽이 모두 자연스러울 수 있다.", helper: "혼합탐색형 가능성을 확인합니다.", weights: { switch: 1.9, lead: 0.5, follow: 0.5 } },
  { id: 16, prompt: "결국 가장 중요한 것은 서로의 합의와 편안함이라고 생각한다.", helper: "돌봄/친밀/구조 기반을 확인합니다.", weights: { care: 1.2, intimacy: 0.8, structure: 0.6 } },
];

const testQuestionCount = testQuestions.length;
const testMaxScores = testQuestions.reduce((acc, question) => {
  Object.entries(question.weights).forEach(([axis, weight]) => {
    const key = axis as TestAxisKey;
    acc[key] = (acc[key] ?? 0) + Math.abs(weight) * 3;
  });
  return acc;
}, {} as Record<TestAxisKey, number>);

const buildDesktopGlobalSearchIndex = (): DesktopGlobalSearchItem[] => {
  const items: DesktopGlobalSearchItem[] = [];

  feedSeed.forEach((item) => {
    items.push({
      id: `feed-${item.id}`,
      group: "홈",
      category: item.type === "video" ? "쇼츠/영상" : "피드",
      title: item.title,
      summary: item.caption,
      path: item.type === "video" ? "홈 > 쇼츠" : "홈 > 피드",
      keywords: `${item.title} ${item.caption} ${item.author} ${item.category}`,
      openTab: "홈",
    });
  });

  productsSeed.forEach((item) => {
    items.push({
      id: `product-${item.id}`,
      group: "쇼핑",
      category: "상품",
      title: item.name,
      summary: `${item.subtitle} · ${item.price}`,
      path: "쇼핑 > 홈",
      keywords: `${item.name} ${item.subtitle} ${item.category} ${item.badge} ${item.price}`,
      openTab: "쇼핑",
    });
  });

  communitySeed.forEach((item) => {
    items.push({
      id: `community-${item.id}`,
      group: item.contentType === "test" ? "테스트" : "소통",
      category: `${item.board ?? "커뮤"}/${item.category}`,
      title: item.title,
      summary: item.summary,
      path: item.path ?? `소통 > ${item.board ?? "커뮤"}`,
      keywords: `${item.title} ${item.summary} ${item.category} ${item.detailTitle ?? ""} ${(item.detailBody ?? []).join(" ")}`,
      openTab: "소통",
    });
  });

  forumRoomSeed.forEach((item) => {
    items.push({
      id: `forum-${item.id}`,
      group: "소통",
      category: "포럼",
      title: item.title,
      summary: item.summary,
      path: "소통 > 포럼",
      keywords: `${item.title} ${item.summary} ${item.category} ${item.introMessage}`,
      openTab: "소통",
    });
  });

  threadSeed.forEach((item) => {
    items.push({
      id: `thread-${item.id}`,
      group: "채팅",
      category: item.kind,
      title: item.name,
      summary: item.preview,
      path: "채팅 > 채팅",
      keywords: `${item.name} ${item.preview} ${item.purpose} ${item.kind}`,
      openTab: "채팅",
    });
  });

  questionSeed.forEach((item) => {
    items.push({
      id: `question-${item.id}`,
      group: "채팅",
      category: "질문",
      title: item.question,
      summary: item.answer,
      path: "채팅 > 질문",
      keywords: `${item.question} ${item.answer} ${item.author}`,
      openTab: "채팅",
    });
  });

  notificationSeed.forEach((item) => {
    items.push({
      id: `notification-${item.id}`,
      group: "알림",
      category: `${item.section}/${item.category}`,
      title: item.title,
      summary: item.body,
      path: `알림 > ${item.section}`,
      keywords: `${item.title} ${item.body} ${item.category} ${item.section} ${item.meta}`,
      openTab: item.section === "주문" ? "쇼핑" : item.section === "소통" ? "채팅" : "홈",
    });
  });

  testQuestions.forEach((item) => {
    items.push({
      id: `test-question-${item.id}`,
      group: "테스트",
      category: "문항",
      title: `테스트 문항 ${item.id}`,
      summary: item.prompt,
      path: "소통 > 커뮤 > 테스트 > 성향 탐색 테스트",
      keywords: `${item.prompt} ${item.helper}`,
      openTab: "소통",
    });
  });

  Object.entries(testAxisMeta).forEach(([axis, meta]) => {
    items.push({
      id: `test-axis-${axis}`,
      group: "테스트",
      category: "결과축",
      title: meta.label,
      summary: meta.summary,
      path: "소통 > 커뮤 > 테스트 > 결과 리포트",
      keywords: `${meta.label} ${meta.summary}`,
      openTab: "소통",
    });
  });

  return items;
};

const cartSeed: CartItem[] = [
  { id: 1, name: "뉴트럴 케어 파우치", qty: 1, price: "₩18,000", option: "위생/보관" },
  { id: 2, name: "스타터 바디 케어 세트", qty: 2, price: "₩58,000", option: "입문 액세서리" },
  { id: 3, name: "정기 재구매 추천 팩", qty: 1, price: "₩36,500", option: "기획전" },
];

const profileStats: ProfileItem[] = [
  { label: "팔로워", value: "2,184" },
  { label: "팔로잉", value: "318" },
  { label: "피드", value: "94" },
  { label: "상품", value: "26" },
];



function DualRangeSlider({ min, max, valueMin, valueMax, step = 1, leftLabel, rightLabel, onChangeMin, onChangeMax }: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  step?: number;
  leftLabel: string;
  rightLabel: string;
  onChangeMin: (value: number) => void;
  onChangeMax: (value: number) => void;
}) {
  const leftPercent = ((valueMin - min) / (max - min)) * 100;
  const rightPercent = ((valueMax - min) / (max - min)) * 100;

  return (
    <div className="dual-range-box">
      <div className="random-range-values"><b>{leftLabel}</b><b>{rightLabel}</b></div>
      <div className="dual-range-slider">
        <div className="dual-range-track" />
        <div className="dual-range-fill" style={{ left: `${leftPercent}%`, width: `${Math.max(0, rightPercent - leftPercent)}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => onChangeMin(Math.min(Number(e.target.value), valueMax))}
          aria-label={`${leftLabel} 최소값`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => onChangeMax(Math.max(Number(e.target.value), valueMin))}
          aria-label={`${rightLabel} 최대값`}
        />
      </div>
    </div>
  );
}


const FeedCaption = memo(function FeedCaption({ caption, title }: { caption: string; title?: string }) {
  const captionRef = useRef<HTMLParagraphElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [caption]);

  useEffect(() => {
    const measure = () => {
      const element = captionRef.current;
      if (!element) return;
      const isOverflowing = element.scrollHeight > element.clientHeight + 1;
      setShowToggle(isOverflowing || expanded);
    };

    const rafId = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
    };
  }, [caption, expanded]);

  const handleExpand = () => setExpanded(true);
  const handleCollapse = () => setExpanded(false);
  const handleExpandKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleExpand();
    }
  };
  const handleCollapseKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCollapse();
    }
  };

  return (
    <div className={`feed-caption-block${expanded ? " expanded" : ""}${showToggle ? " has-toggle" : ""}`}>
      <div className="feed-caption-body">
        <p ref={captionRef} className={`feed-caption-text${expanded ? " expanded" : ""}`}>
          <span className="feed-caption-text-content">{caption}</span>
          {!expanded && showToggle ? (
            <span className="feed-caption-more-inline" role="button" tabIndex={0} onClick={handleExpand} onKeyDown={handleExpandKeyDown}>더보기</span>
          ) : null}
        </p>
      </div>
      {expanded && showToggle ? (
        <span className="feed-caption-inline-less" role="button" tabIndex={0} onClick={handleCollapse} onKeyDown={handleCollapseKeyDown}>접기</span>
      ) : null}
    </div>
  );
});

const FeedPoster = memo(function FeedPoster({ item, onAsk, saved, liked, reposted, commentsOpen, commentCount, onOpenComments, onToggleLike, onToggleRepost, onToggleSave, onShare, keywordTags = [], onOpenAuthorProfile, onPreviewAuthorAvatar, following, onToggleFollow }: { item: FeedItem; onAsk: (item: FeedItem) => void; saved: boolean; liked: boolean; reposted: boolean; commentsOpen: boolean; commentCount: number; onOpenComments: (item: FeedItem) => void; onToggleLike: (feedId: number) => void; onToggleRepost: (item: FeedItem) => void; onToggleSave: (feedId: number) => void; onShare: (item: FeedItem) => void; keywordTags?: string[]; onOpenAuthorProfile: (author: string) => void; onPreviewAuthorAvatar?: (item: FeedItem) => void; following: boolean; onToggleFollow: (author: string) => void }) {
  const postedLabel = formatFeedPostedAt(item.postedAt);
  const handlePreviewAuthorAvatar = () => {
    onPreviewAuthorAvatar?.(item);
  };
  const likeCount = item.likes + (liked ? 1 : 0);
  const repostCount = (item.reposts ?? Math.max(0, Math.round((item.likes + item.comments) / 7))) + (reposted ? 1 : 0);
  const viewCount = item.views ?? 0;
  return (
    <article
      className={`feed-card history-feed-card feed-card-unified ${item.accent}`}
      style={{
        "--feed-card-bg": FEED_CARD_PRESENTATION.backgroundColor,
        "--feed-card-fg": FEED_CARD_PRESENTATION.textColor,
        "--feed-card-muted": FEED_CARD_PRESENTATION.mutedTextColor,
        "--feed-card-accent": FEED_CARD_PRESENTATION.accentColor,
      } as CSSProperties}
    >
      {item.repostLabel ? <div className="feed-repost-label">↻ {item.repostLabel}</div> : null}
      <div className="history-feed-head">
        <div className="history-feed-profile">
          <button type="button" className="story-mini-avatar-button" onClick={handlePreviewAuthorAvatar} aria-label={`${item.author} 프로필 사진 크게 보기`}>
            <div className="story-mini-avatar">{item.author.slice(0, 1).toUpperCase()}</div>
          </button>
          <div className="history-feed-profile-copy">
            <button type="button" className="feed-author-link" onClick={() => onOpenAuthorProfile(item.author)}>{item.author}</button>
            <div className="feed-author-meta-row">
              <span className="feed-posted-at">{postedLabel}</span>
              <span>팔로워 2,184</span>
              <span>팔로잉 318</span>
            </div>
          </div>
        </div>
        <div className="history-feed-head-actions">
          <button type="button" className={`feed-follow-btn ${following ? "active" : ""}`} onClick={() => onToggleFollow(item.author)}>{following ? "팔로잉" : "팔로우"}</button>
        </div>
      </div>
      <div className="feed-media">
        {item.type === "image" && item.mediaUrl ? (
          <img src={item.mediaUrl} alt={item.mediaName ?? item.title} className="feed-media-preview" loading="lazy" />
        ) : item.type === "video" && item.videoUrl ? (
          <video src={item.videoUrl} className="feed-media-preview" controls playsInline muted preload="metadata" />
        ) : null}
        {keywordTags.length ? (
          <div className="content-keyword-stack content-keyword-stack--feed">
            {keywordTags.slice(0, 2).map((keyword) => (
              <span key={`${item.id}-${keyword}`} className="content-keyword-pill">#{keyword}</span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="feed-copy">
        <div>
          {item.quoteText ? <p className="feed-quote-user-text">{item.quoteText}</p> : null}
          {item.caption ? <FeedCaption caption={item.caption} /> : null}
          {item.quotedFeed ? (
            <div className="feed-quoted-card">
              <strong>@{item.quotedFeed.author}</strong>
              <span>{item.quotedFeed.caption || item.quotedFeed.title}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="history-feed-footer history-feed-footer-icons">
        <button type="button" className={`feed-action-btn feed-action-btn-count ${commentsOpen ? "active" : ""}`} aria-label="댓글" onClick={() => onOpenComments(item)}><span className="feed-action-icon"><CommentBubbleIcon /></span><b className="feed-action-count">{formatCompactSocialCount(commentCount)}</b></button>
        <button type="button" className={`feed-action-btn feed-action-btn-count ${liked ? "active" : ""}`} aria-label="좋아요" onClick={() => onToggleLike(item.id)}><span className="feed-action-icon"><HeartIcon filled={liked} /></span><b className="feed-action-count">{formatCompactSocialCount(likeCount)}</b></button>
        <button type="button" className={`feed-action-btn feed-action-btn-count ${reposted ? "active" : ""}`} aria-label="재게시" onClick={() => onToggleRepost(item)}><span className="feed-action-icon"><RepostIcon /></span><b className="feed-action-count">{formatCompactSocialCount(repostCount)}</b></button>
        <button type="button" className="feed-action-btn feed-action-btn-count" aria-label="조회수"><span className="feed-action-icon"><ViewCountIcon /></span><b className="feed-action-count">{formatCompactSocialCount(viewCount)}</b></button>
        <button type="button" className={`feed-action-btn ${saved ? "active" : ""}`} aria-label="보관함" onClick={() => onToggleSave(item.id)}><span className="feed-action-icon"><BookmarkIcon filled={saved} /></span><b className="feed-action-count feed-action-count-empty" aria-hidden="true">{"\u00A0"}</b></button>
        <button type="button" className="feed-action-btn" aria-label="질문하기" onClick={() => onAsk(item)}><span className="feed-action-icon"><QuestionAnswerIcon /></span><b className="feed-action-count feed-action-count-empty" aria-hidden="true">{"\u00A0"}</b></button>
        <button type="button" className="feed-action-btn" aria-label="공유" onClick={() => onShare(item)}><span className="feed-action-icon"><ShareArrowIcon /></span><b className="feed-action-count feed-action-count-empty" aria-hidden="true">{"\u00A0"}</b></button>
      </div>
    </article>
  );
});

const SponsoredFeedProductCard = memo(function SponsoredFeedProductCard({ item, saved, onToggleSave }: { item: { id: number; label: string; title: string; subtitle: string; price: string }; saved: boolean; onToggleSave: (productId: number) => void }) {
  return (
    <article className="product-card sponsored-feed-product">
      <div className="product-thumb" />
      <span className="product-badge">{item.label}</span>
      <strong>{item.title}</strong>
      <p>{item.subtitle}</p>
      <div className="product-meta"><span>피드 사이 자연노출</span><b>{item.price}</b></div>
      <div className="product-card-actions">
        <button type="button">상품 보기</button>
        <button type="button" className="ghost-btn" onClick={() => onToggleSave(item.id)}>{saved ? "보관해제" : "보관함"}</button>
      </div>
    </article>
  );
});

function StoryStrip({ onOpenStory }: { onOpenStory: (story: StoryItem) => void }) {
  return (
    <section className="home-story-card">
      <div className="story-strip" role="list" aria-label="스토리 목록">
        <button type="button" className="story-chip story-chip-compose" role="listitem">
          <span className="story-chip-ring">
            <span className="story-chip-avatar story-chip-avatar-compose">+</span>
          </span>
          <span className="story-chip-name">피드추가</span>
        </button>
        {storySeed.map((story) => (
          <button key={story.id} type="button" className="story-chip" onClick={() => onOpenStory(story)} role="listitem">
            <span className={`story-chip-ring ${story.accent}`}>
              <span className="story-chip-avatar">{story.name.slice(0, 1).toUpperCase()}</span>
            </span>
            <span className="story-chip-name">{story.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ShortsListCard({ item, onOpenMore, onOpenViewer }: { item: FeedItem; onOpenMore: (item: FeedItem) => void; onOpenViewer: (item: FeedItem) => void }) {
  return (
    <article className="shorts-list-card" onClick={() => onOpenViewer(item)}>
      <button type="button" className={`shorts-video-stage ${item.accent}`} onClick={() => onOpenViewer(item)}>
        <div className="shorts-video-poster-tag">대표 썸네일 · 10초 · 저용량</div>
        <div className="shorts-video-center">쇼츠 포스터</div>
      </button>
      <div className="shorts-list-copy shorts-list-copy-detailed">
        <div className="shorts-detail-identity-row">
          <span className="shorts-profile-avatar" aria-hidden="true">{item.author.slice(0, 1).toUpperCase()}</span>
          <div className="shorts-detail-copy-block">
            <div className="shorts-detail-title-bar">
              <strong>{item.title}</strong>
              <button
                type="button"
                className="shorts-more-btn shorts-more-icon-btn"
                aria-label={`${item.title} 더보기`}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenMore(item);
                }}
              >
                <MoreDotsIcon />
              </button>
            </div>
            <span className="shorts-inline-meta">{item.author} · 조회수 {(item.views ?? 0).toLocaleString()}회 · {item.postedAt ?? "방금"} · 추천수 {item.likes.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ShortsViewer({
  items,
  initialIndex,
  onClose,
  onOpenMore,
  getKeywordTags,
  onOpenAuthorProfile,
  onPreviewAuthorAvatar,
  followedAuthors,
  onToggleFollow,
}: {
  items: FeedItem[];
  initialIndex: number;
  onClose: () => void;
  onOpenMore: (item: FeedItem) => void;
  getKeywordTags: (item: FeedItem) => string[];
  onOpenAuthorProfile: (author: string) => void;
  onPreviewAuthorAvatar: (item: FeedItem) => void;
  followedAuthors: string[];
  onToggleFollow: (author: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [pausedMap, setPausedMap] = useState<Record<number, boolean>>(() => ({ [items[initialIndex]?.id ?? 0]: false }));
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [dislikedIds, setDislikedIds] = useState<number[]>([]);
  const [descriptionItem, setDescriptionItem] = useState<FeedItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [commentOpenItemId, setCommentOpenItemId] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentMap, setCommentMap] = useState<Record<number, string[]>>(() => Object.fromEntries(items.map((item) => [item.id, [`${item.author} 취향 태그 잘 맞아요.`, `${item.title} 관련 추천이 괜찮네요.`]])));
  const hideTimerRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = scrollRef.current?.querySelector<HTMLElement>(`[data-short-index="${initialIndex}"]`);
    target?.scrollIntoView({ block: "start" });
  }, [initialIndex]);

  const activeItem = items[activeIndex] ?? items[0];
  const activeKeywords = getKeywordTags(activeItem).slice(0, 2);

  const restartOverlayTimer = () => {
    setOverlayVisible(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setOverlayVisible(false), 5000);
  };

  useEffect(() => {
    restartOverlayTimer();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [activeIndex]);

  useEffect(() => {
    if (!searchOpen) return;
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return;
    const nextIndex = items.findIndex((item) => `${item.title} ${item.caption} ${item.author} ${item.category}`.toLowerCase().includes(keyword));
    if (nextIndex === -1 || nextIndex === activeIndex) return;
    const target = scrollRef.current?.querySelector<HTMLElement>(`[data-short-index="${nextIndex}"]`);
    target?.scrollIntoView({ block: "start", behavior: "smooth" });
    setActiveIndex(nextIndex);
    restartOverlayTimer();
  }, [activeIndex, items, searchOpen, searchText]);


  const togglePause = (itemId: number) => {
    restartOverlayTimer();
    setPausedMap((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleViewerScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    restartOverlayTimer();
    const container = event.currentTarget;
    const nextIndex = Math.round(container.scrollTop / Math.max(container.clientHeight, 1));
    if (nextIndex !== activeIndex && items[nextIndex]) {
      setActiveIndex(nextIndex);
    }
  };

  const toggleReaction = (kind: "like" | "dislike", itemId: number) => {
    restartOverlayTimer();
    if (kind === "like") {
      setLikedIds((prev) => prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]);
      setDislikedIds((prev) => prev.filter((id) => id !== itemId));
      return;
    }
    setDislikedIds((prev) => prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]);
    setLikedIds((prev) => prev.filter((id) => id !== itemId));
  };

  return (
    <div className="shorts-viewer-overlay" data-active-keywords={activeKeywords.join(",")}>
      <button
        type="button"
        className={`shorts-viewer-close-fab${overlayVisible ? " visible" : ""}`}
        onClick={() => {
          restartOverlayTimer();
          onClose();
        }}
        aria-label="뒤로가기"
      >
        <BackArrowIcon />
      </button>

      <div className={`shorts-viewer-top-actions-floating${overlayVisible ? " visible" : ""}`}>
        <button
          type="button"
          className="shorts-icon-btn"
          onClick={() => {
            restartOverlayTimer();
            setSearchOpen((prev) => !prev);
          }}
          aria-label="쇼츠 검색"
          title="쇼츠 검색"
        >
          <SearchIcon />
        </button>
        <button
          type="button"
          className="shorts-icon-btn"
          onClick={() => {
            restartOverlayTimer();
            onOpenMore(activeItem);
          }}
          aria-label="쇼츠 메뉴"
          title="쇼츠 메뉴"
        >
          <MoreDotsIcon />
        </button>
      </div>

      {searchOpen && overlayVisible ? (
        <div className="shorts-viewer-searchbar">
          <input
            value={searchText}
            onChange={(event) => {
              restartOverlayTimer();
              setSearchText(event.target.value);
            }}
            placeholder="쇼츠 검색"
          />
        </div>
      ) : null}

      <div className="shorts-viewer-scroll" ref={scrollRef} onScroll={handleViewerScroll}>
        {items.map((item, idx) => {
          const paused = !!pausedMap[item.id];
          const liked = likedIds.includes(item.id);
          const disliked = dislikedIds.includes(item.id);
          const following = followedAuthors.includes(item.author);
          return (
            <section key={`viewer-${item.id}`} className={`shorts-viewer-page ${item.accent}${commentOpenItemId === item.id ? " comments-open" : ""}`} data-short-index={idx}>
              <button type="button" className="shorts-viewer-video" onClick={() => togglePause(item.id)} aria-label={paused ? "영상 재생" : "영상 정지"}>
                <div className="shorts-viewer-video-fill">
                  {item.videoUrl ? (
                    <video
                      key={item.videoUrl}
                      className="shorts-viewer-video-asset"
                      src={item.videoUrl}
                      autoPlay={!paused}
                      muted
                      loop
                      playsInline
                    />
                  ) : null}
                  <div className="shorts-viewer-video-poster">10초 · 저용량 데모 클립</div>
                </div>
              </button>

              <div className={`shorts-viewer-side-actions${overlayVisible ? " visible" : ""}`}>
                <button type="button" className={`shorts-viewer-action-btn${liked ? " active" : ""}`} onClick={() => toggleReaction("like", item.id)}><span><ThumbUpIcon filled={liked} /></span><b>{item.likes.toLocaleString()}</b></button>
                <button type="button" className={`shorts-viewer-action-btn${disliked ? " active" : ""}`} onClick={() => toggleReaction("dislike", item.id)}><span><ThumbDownIcon filled={disliked} /></span><b>{Math.max(12, Math.round(item.likes / 11)).toLocaleString()}</b></button>
                <button type="button" className={`shorts-viewer-action-btn${commentOpenItemId === item.id ? " active" : ""}`} onClick={() => { restartOverlayTimer(); setCommentOpenItemId(commentOpenItemId === item.id ? null : item.id); }}><span><CommentBubbleIcon /></span><b>{(commentMap[item.id] ?? []).length.toLocaleString()}</b></button>
                <button type="button" className="shorts-viewer-action-btn" onClick={() => { restartOverlayTimer(); onOpenMore(item); }}><span><ShareArrowIcon /></span><b>공유</b></button>
              </div>

              <div className={`shorts-viewer-bottom${overlayVisible ? " visible" : ""}`}>
                <div className="shorts-viewer-author-row">
                  <button
                    type="button"
                    className="shorts-profile-avatar shorts-profile-avatar-small shorts-profile-avatar-button"
                    onClick={() => {
                      restartOverlayTimer();
                      onPreviewAuthorAvatar(item);
                    }}
                    aria-label={`${item.author} 프로필 사진 크게 보기`}
                  >
                    {item.author.slice(0, 1).toUpperCase()}
                  </button>
                  <button type="button" className="shorts-viewer-author-link" onClick={() => { restartOverlayTimer(); onOpenAuthorProfile(item.author); }}>{item.author}</button>
                  <button type="button" className={`feed-follow-btn shorts-follow-btn ${following ? "active" : ""}`} onClick={() => { restartOverlayTimer(); onToggleFollow(item.author); }}>{following ? "팔로잉" : "팔로우"}</button>
                </div>
                <button type="button" className="shorts-viewer-full-title" onClick={restartOverlayTimer}>풀영상 {item.title}</button>
                <button type="button" className="shorts-viewer-description" onClick={() => { restartOverlayTimer(); setDescriptionItem(item); }}>{item.caption}</button>
              </div>
              {commentOpenItemId === item.id ? (
                <div className="shorts-comments-sheet">
                  <div className="shorts-comments-list">
                    {(commentMap[item.id] ?? []).map((comment, commentIndex) => (
                      <div key={`${item.id}-comment-${commentIndex}`} className="shorts-comment-row"><b>user{commentIndex + 1}</b><span>{comment}</span></div>
                    ))}
                  </div>
                  <div className="shorts-comment-input-row">
                    <input value={commentDraft} onChange={(event) => {
                      restartOverlayTimer();
                      setCommentDraft(event.target.value);
                    }} placeholder="댓글을 입력하세요" />
                    <button type="button" onClick={() => {
                      restartOverlayTimer();
                      if (!commentDraft.trim()) return;
                      setCommentMap((prev) => ({ ...prev, [item.id]: [...(prev[item.id] ?? []), commentDraft.trim()] }));
                      setCommentDraft("");
                    }}>입력</button>
                  </div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {descriptionItem ? (
        <div className="shorts-description-sheet-backdrop" onClick={() => setDescriptionItem(null)}>
          <div className="shorts-description-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="shorts-sheet-handle" />
            <strong>{descriptionItem.title}</strong>
            <p>{descriptionItem.caption}</p>
            <button type="button" className="ghost-btn" onClick={() => setDescriptionItem(null)}>닫기</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AskProfileScreen({ profile, activeTab, onClose, onNavigate, renderBottomTabIcon, onOpenProfile }: { profile: AskProfile; activeTab: MobileTab; onClose: () => void; onNavigate: (tab: MobileTab) => void; renderBottomTabIcon: (tab: MobileTab, filled: boolean) => JSX.Element; onOpenProfile: (author: string) => void }) {
  const storageKey = `adultapp_ask_draft_${profile.id}`;
  const [questionText, setQuestionText] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(storageKey) ?? "";
  });
  const [anonymousQuestion, setAnonymousQuestion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, questionText);
  }, [questionText, storageKey]);

  return (
    <div className="question-overlay">
      <section className="asked-page-head">
        <div className="asked-nav-row">
          <button type="button" className="header-inline-btn header-icon-btn topbar-search-back" onClick={onClose} aria-label="뒤로가기"><BackArrowIcon /></button>
          <div className="asked-page-title">질문</div>
          <span className="modal-spacer" />
        </div>
      </section>
      <section className="asked-question-profile-header">
        <div className="asked-question-profile-card asked-question-profile-card-inline">
          <div className="asked-question-avatar">{profile.name.slice(0, 1).toUpperCase()}</div>
          <div className="asked-question-copy">
            <div className="asked-question-copy-head">
              <div className="asked-question-copy-main">
                <button type="button" className="feed-author-link asked-profile-name-btn" onClick={() => onOpenProfile(profile.name)}>{profile.name}</button>
                <span>{profile.headline}</span>
              </div>
              <div className="asked-question-toolbar asked-question-toolbar-inline">
                <button type="button">팔로우</button>
                <button type="button" className="ghost-btn">공유</button>
              </div>
            </div>
            <p>{profile.intro}</p>
          </div>
        </div>
      </section>

      <section className="asked-question-form">
        <div className="asked-question-form-title-row">
          <label>질문 내용</label>
          <label className="asked-question-anonymous-toggle">
            <input type="checkbox" checked={anonymousQuestion} onChange={(event) => setAnonymousQuestion(event.target.checked)} />
            <span>익명</span>
          </label>
        </div>
        <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="상대에게 남길 질문을 입력하세요." />
        <div className="asked-question-draft-note">작성 중인 질문은 임시저장됩니다.</div>
        <div className="asked-question-form-actions asked-question-form-actions-submit-only">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              if (typeof window !== "undefined") window.localStorage.removeItem(storageKey);
              setQuestionText("");
              window.alert(anonymousQuestion ? "질문이 익명으로 등록되었습니다." : "질문이 등록되었습니다.");
            }}
          >
            질문 등록
          </button>
        </div>
      </section>

      <section className="question-list">
        {questionSeed.map((item) => (
          <div key={`ask-${item.id}`} className="question-feed-stack">
            <article className="question-feed-card">
              <div className="question-feed-top">
                <div>
                  <div className="question-user-line">
                    <span className="community-chip">질문</span>
                    <strong>{item.author}</strong>
                    <span className="community-meta">{item.meta}</span>
                  </div>
                  <div className="question-body">Q. {item.question}</div>
                </div>
              </div>
              <div className="question-answer-box">
                <span className="product-badge">답변</span>
                <div className="question-body">{item.answer}</div>
              </div>
              <div className="question-footer-actions">
                <button type="button" className="question-footer-icon-btn" aria-label="좋아요"><span className="question-footer-icon"><HeartIcon /></span><span>{item.likes}</span></button>
                <button type="button" className="question-footer-icon-btn" aria-label="댓글"><span className="question-footer-icon"><CommentBubbleIcon /></span><span>{item.comments}</span></button>
                <button type="button" className="question-footer-icon-btn" aria-label="공유"><span className="question-footer-icon"><ShareArrowIcon /></span><span>공유</span></button>
              </div>
            </article>
          </div>
        ))}
      </section>
      <nav className="bottom-nav question-overlay-bottom-nav">
        {mobileTabs.map((tab) => {
          const filled = activeTab === tab;
          return (
            <button
              key={`ask-nav-${tab}`}
              type="button"
              className={`bottom-nav-btn ${filled ? "active" : ""}`}
              onClick={() => onNavigate(tab)}
            >
              <span className="bottom-nav-icon">{renderBottomTabIcon(tab, filled)}</span>
              <span className="bottom-nav-label">{tab}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}


type FeedCommentScreenProps = {
  item: FeedItem;
  comments: FeedCommentEntry[];
  draft: string;
  attachment: FeedCommentAttachment | null;
  attachmentBusy: boolean;
  onChangeDraft: (value: string) => void;
  onAttachImage: (file: File | null) => void;
  onClearAttachment: () => void;
  onSubmit: () => void;
  onClose: () => void;
  onGoHome: () => void;
};

function FeedCommentScreen({ item, comments, draft, attachment, attachmentBusy, onChangeDraft, onAttachImage, onClearAttachment, onSubmit, onClose, onGoHome }: FeedCommentScreenProps) {
  const postedLabel = formatFeedPostedAt(item.postedAt);

  return (
    <div className="feed-comment-overlay">
      <section className="asked-page-head feed-comment-head">
        <div className="asked-nav-row">
          <button type="button" className="header-inline-btn header-icon-btn topbar-search-back" onClick={onClose} aria-label="뒤로가기"><BackArrowIcon /></button>
          <div className="asked-page-title">댓글</div>
          <div className="feed-comment-head-actions">
            <button type="button" className="header-inline-btn ghost-btn feed-comment-home-btn" onClick={onGoHome}>홈</button>
            <button type="button" className="header-inline-btn feed-comment-submit-top" onClick={onSubmit}>등록</button>
          </div>
        </div>
      </section>
      <div className="feed-comment-overlay-body">
        <article className={`feed-card history-feed-card feed-comment-focus-card ${item.accent}`}>
          <div className="history-feed-head">
            <div className="history-feed-profile">
              <div className="story-mini-avatar">{item.author.slice(0, 1).toUpperCase()}</div>
              <div className="history-feed-profile-copy">
                <strong>{item.author}</strong>
                <div className="feed-author-meta-row">
                  <span className="feed-posted-at">{postedLabel}</span>
                  <span>팔로워 2,184</span>
                  <span>팔로잉 318</span>
                </div>
              </div>
            </div>
          </div>
          <div className="feed-copy">
            <div>
              <strong>{item.title}</strong>
              <FeedCaption caption={item.caption} />
            </div>
            <div className="feed-meta">
              <span>좋아요 {item.likes}</span>
              <span>댓글 {(comments.length || item.comments).toLocaleString()}</span>
            </div>
          </div>

          <div className="feed-comment-thread-shell">
            <div className="feed-comment-thread-head">
              <strong>댓글 {comments.length.toLocaleString()}</strong>
              <span>다른 사용자가 남긴 대화를 확인해보세요.</span>
            </div>
            <section className="feed-comment-thread">
              {comments.length ? comments.map((comment) => (
                <article key={comment.id} className="feed-comment-row">
                  <div className="feed-comment-avatar">{comment.author.slice(0, 1).toUpperCase()}</div>
                  <div className="feed-comment-copy">
                    <div className="feed-comment-meta"><strong>{comment.author}</strong><span>{comment.meta}</span></div>
                    <p>{comment.text}</p>
                    {comment.imageUrl ? (
                      <div className="feed-comment-image-wrap">
                        <img src={comment.imageUrl} alt={comment.imageName ?? "첨부 이미지"} className="feed-comment-image" loading="lazy" />
                      </div>
                    ) : null}
                  </div>
                </article>
              )) : <div className="legacy-box compact"><p>첫 댓글을 남겨보세요.</p></div>}
            </section>
          </div>
        </article>
      </div>
      <div className="feed-comment-composer">
        <div className="feed-comment-composer-side">
          <div className="feed-comment-composer-avatar">나</div>
          <label className={`feed-comment-attach-btn ${attachmentBusy ? "is-busy" : ""}`}>
            사진
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                onAttachImage(file);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        <div className="feed-comment-composer-box">
          <textarea value={draft} onChange={(event) => onChangeDraft(event.target.value)} placeholder="게시글에 댓글을 남겨보세요." />
          {attachment ? (
            <div className="feed-comment-attachment-preview">
              <img src={attachment.dataUrl} alt={attachment.name} className="feed-comment-attachment-thumb" loading="lazy" />
              <div className="feed-comment-attachment-copy">
                <strong>{attachment.name}</strong>
                <span>{Math.max(1, Math.round(attachment.size / 1024))}KB · 최대 1장</span>
              </div>
              <button type="button" className="ghost-btn" onClick={onClearAttachment}>삭제</button>
            </div>
          ) : null}
          <div className="feed-comment-composer-actions">
            <span>{attachmentBusy ? "이미지 최적화 중" : `${draft.trim().length}/300`}</span>
            <button type="button" onClick={onSubmit}>댓글 달기</button>
          </div>
        </div>
      </div>
    </div>
  );
}


type FeedComposeScreenProps = {
  mode: FeedComposeMode;
  title: string;
  caption: string;
  attachment: FeedComposerAttachment | null;
  busy: boolean;
  helperText: string;
  onChangeTitle: (value: string) => void;
  onChangeCaption: (value: string) => void;
  onAttachFile: (file: File | null) => void;
  onClearAttachment: () => void;
  maptoryEnabled: boolean;
  onChangeMaptoryEnabled: (value: boolean) => void;
  onSubmit: () => void;
  onClose: () => void;
};

function FeedComposeScreen({ mode, title, caption, attachment, busy, helperText, onChangeTitle, onChangeCaption, onAttachFile, onClearAttachment, maptoryEnabled, onChangeMaptoryEnabled, onSubmit, onClose }: FeedComposeScreenProps) {
  const canSubmit = Boolean(caption.trim() || attachment);
  const composeMeta = getFeedComposeModeMeta(mode);
  const isShortsMode = mode === "쇼츠게시";
  const isStoryMode = mode === "스토리게시";
  const isFeedMode = mode === "피드게시";
  const feedMediaInputRef = useRef<HTMLInputElement | null>(null);
  const feedGalleryPlaceholders = [0, 1, 2, 3, 4];

  return (
    <div className={`feed-compose-overlay${isFeedMode ? " feed-compose-overlay-x" : ""}${isShortsMode ? " feed-compose-overlay-shorts" : ""}`}>
      <section className="asked-page-head feed-compose-head">
        <div className="asked-nav-row feed-compose-nav-row">
          <button type="button" className="header-inline-btn header-icon-btn topbar-search-back" onClick={onClose} aria-label="뒤로가기"><BackArrowIcon /></button>
          <div className="asked-page-title">{composeMeta.title}</div>
          <button type="button" className={`header-inline-btn feed-comment-submit-top${isShortsMode ? " feed-compose-submit-pill" : ""}`} onClick={onSubmit} disabled={!canSubmit}>게시하기</button>
        </div>
      </section>
      <div className="feed-compose-overlay-body compact-scroll-list">
        {isFeedMode ? (
          <section className="feed-compose-card feed-compose-card-x">
            <div className="feed-compose-profile-row feed-compose-profile-row-x">
              <div className="feed-compose-x-main">
                <div className="feed-compose-gallery-access">
                  <button
                    type="button"
                    className="feed-compose-gallery-open-btn"
                    aria-label="사진첩 열기"
                    onClick={() => feedMediaInputRef.current?.click()}
                    disabled={busy}
                  >
                    <PhotoImageIcon />
                  </button>
                </div>
                <textarea
                  value={caption}
                  onChange={(event) => onChangeCaption(event.target.value)}
                  className="feed-compose-x-textarea"
                  placeholder="무슨 일이 일어나고 있나요?"
                  maxLength={400}
                />
                <div className="feed-compose-gallery-shell">
                  <div className="feed-compose-gallery-strip" role="list" aria-label="사진 및 영상 선택">
                    <label className={`feed-compose-gallery-tile feed-compose-gallery-picker${busy ? " is-busy" : ""}`} role="listitem">
                      <input
                        ref={feedMediaInputRef}
                        type="file"
                        accept={composeMeta.accept}
                        hidden
                        disabled={busy}
                        onChange={(event) => {
                          onAttachFile(event.target.files?.[0] ?? null);
                          event.currentTarget.value = "";
                        }}
                      />
                      <span className="feed-compose-gallery-picker-icon"><PhotoImageIcon /></span>
                      <b>{busy ? "처리 중" : "사진첩"}</b>
                    </label>
                    {attachment ? (
                      <div className="feed-compose-gallery-tile feed-compose-gallery-selected" role="listitem">
                        {attachment.type.startsWith("image/") ? (
                          <img src={attachment.previewUrl} alt={attachment.name} className="feed-compose-gallery-thumb" loading="lazy" />
                        ) : (
                          <video src={attachment.previewUrl} className="feed-compose-gallery-thumb" playsInline muted preload="metadata" />
                        )}
                        <button type="button" className="feed-compose-gallery-remove" onClick={onClearAttachment} aria-label="선택한 첨부 삭제">삭제</button>
                      </div>
                    ) : null}
                    {feedGalleryPlaceholders.map((index) => (
                      <button
                        key={`feed-gallery-placeholder-${index}`}
                        type="button"
                        className="feed-compose-gallery-tile feed-compose-gallery-placeholder"
                        onClick={() => feedMediaInputRef.current?.click()}
                        aria-label={`첨부 항목 ${index + 1} 선택`}
                      >
                        <span className="feed-compose-gallery-placeholder-fill" />
                      </button>
                    ))}
                  </div>
                  <div className="feed-compose-gallery-meta">
                    <strong>{attachment ? attachment.name : "사진 또는 영상 1개 선택"}</strong>
                    <span>{attachment ? `${attachment.type.startsWith("video/") ? `영상 첨부${attachment.optimized ? " · 최적화" : ""}${attachment.durationSec ? ` · ${attachment.durationSec.toFixed(1)}초` : ""}` : "사진 첨부"} · ${Math.max(1, Math.round(attachment.size / 1024))}KB` : helperText}</span>
                  </div>
                </div>
                <div className="feed-compose-x-privacy">
                  <button type="button" className="feed-compose-privacy-chip">모든 사용자에게 공개</button>
                </div>
              </div>
            </div>
          </section>
        ) : isShortsMode ? (
          <section className="feed-compose-card feed-compose-card-shorts">
            <div className="feed-compose-shorts-hero">
              <div>
                <strong>유튜브 쇼츠 등록 흐름처럼 순서대로 진행</strong>
                <span>영상 선택 → 제목 입력 → 설명 입력 → 업로드 전 확인 순서로 배치했습니다.</span>
              </div>
              <span className="feed-compose-shorts-chip">세로형 쇼츠</span>
            </div>

            <div className="feed-compose-step-card">
              <div className="feed-compose-step-badge">1</div>
              <div className="feed-compose-step-copy">
                <strong>쇼츠 영상 선택</strong>
                <span>{helperText}</span>
              </div>
              <label className={`creator-launch-btn feed-compose-attach-btn${busy ? " is-busy" : ""}`}>
                {busy ? "첨부 최적화 중" : composeMeta.attachLabel}
                <input
                  type="file"
                  accept={composeMeta.accept}
                  hidden
                  disabled={busy}
                  onChange={(event) => {
                    onAttachFile(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>

            {attachment ? (
              <div className="feed-compose-preview-card feed-compose-preview-card-shorts">
                <video src={attachment.previewUrl} className="feed-compose-preview-media" controls playsInline preload="metadata" />
                <div className="feed-compose-preview-copy">
                  <strong>{attachment.name}</strong>
                  <span>{`영상 첨부${attachment.optimized ? " · 최적화" : ""}${attachment.durationSec ? ` · ${attachment.durationSec.toFixed(1)}초` : ""} · ${Math.max(1, Math.round(attachment.size / 1024))}KB`}</span>
                </div>
                <button type="button" className="ghost-btn" onClick={onClearAttachment}>삭제</button>
              </div>
            ) : (
              <div className="feed-compose-empty feed-compose-empty-shorts">선택한 쇼츠 영상이 여기에 미리보기로 표시됩니다.</div>
            )}

            <div className="feed-compose-step-card">
              <div className="feed-compose-step-badge">2</div>
              <div className="feed-compose-step-copy">
                <strong>제목</strong>
                <span>목록과 추천 영역에 노출될 문구입니다.</span>
              </div>
              <input
                value={title}
                onChange={(event) => onChangeTitle(event.target.value)}
                placeholder="쇼츠 제목을 입력하세요"
                maxLength={60}
              />
            </div>

            <div className="feed-compose-step-card">
              <div className="feed-compose-step-badge">3</div>
              <div className="feed-compose-step-copy">
                <strong>설명</strong>
                <span>시청자가 영상과 함께 보게 될 설명입니다.</span>
              </div>
              <textarea
                value={caption}
                onChange={(event) => onChangeCaption(event.target.value)}
                placeholder="쇼츠 설명을 입력하세요"
                maxLength={400}
              />
            </div>

            <div className="feed-compose-step-card feed-compose-step-card-checklist">
              <div className="feed-compose-step-badge">4</div>
              <div className="feed-compose-step-copy">
                <strong>업로드 전 확인</strong>
                <span>실제 업로드 전 검토 항목처럼 정리했습니다.</span>
              </div>
              <ul className="feed-compose-checklist">
                <li>세로형 비율 권장</li>
                <li>20초 이하 영상 권장</li>
                <li>대표 문구는 제목에 간결하게 작성</li>
                <li>등록 후 홈 &gt; 쇼츠 탭에서 확인 가능</li>
              </ul>
            </div>
          </section>
        ) : isStoryMode ? (
          <section className="feed-compose-card feed-compose-card-story">
            <div className="feed-compose-profile-row">
              <div className="feed-comment-composer-avatar" aria-hidden="true">S</div>
              <div>
                <strong>스토리게시</strong>
                <span>인스타 스토리처럼 현재 하고 있는 일을 짧게 공유합니다.</span>
              </div>
            </div>
            <div className="feed-compose-field">
              <span>스토리 내용</span>
              <textarea value={caption} onChange={(event) => onChangeCaption(event.target.value)} placeholder="지금 무엇을 하고 있는지 적어주세요." maxLength={240} />
            </div>
            <label className={`creator-launch-btn feed-compose-attach-btn${busy ? " is-busy" : ""}`}>
              {busy ? "첨부 최적화 중" : composeMeta.attachLabel}
              <input type="file" accept={composeMeta.accept} hidden disabled={busy} onChange={(event) => { onAttachFile(event.target.files?.[0] ?? null); event.currentTarget.value = ""; }} />
            </label>
            {attachment ? (
              <div className="feed-compose-preview-card">
                {attachment.type.startsWith("image/") ? <img src={attachment.previewUrl} alt={attachment.name} className="feed-compose-preview-media" loading="lazy" /> : <video src={attachment.previewUrl} className="feed-compose-preview-media" controls playsInline preload="metadata" />}
                <div className="feed-compose-preview-copy"><strong>{attachment.name}</strong><span>{helperText}</span></div>
                <button type="button" className="ghost-btn" onClick={onClearAttachment}>삭제</button>
              </div>
            ) : null}
            <label className="story-maptory-check-row">
              <input type="checkbox" checked={maptoryEnabled} onChange={(event) => { const checked = event.target.checked; if (checked) window.alert("맵토리는 위치 표시가 됩니다"); onChangeMaptoryEnabled(checked); }} />
              <span><b>맵토리도 게시</b><small>체크하면 위치가 시/구 단위로 지도에 표시됩니다.</small></span>
            </label>
          </section>
        ) : (
          <section className="feed-compose-card">
            <div className="feed-compose-profile-row">
              <div className="feed-comment-composer-avatar" aria-hidden="true" />
              <div>
                <strong>{composeMeta.title}</strong>
                <span>{composeMeta.description}</span>
              </div>
            </div>

            <div className="feed-compose-field">
              <span>제목</span>
              <input
                value={title}
                onChange={(event) => onChangeTitle(event.target.value)}
                placeholder="피드 제목을 입력하세요"
                maxLength={60}
              />
            </div>

            <div className="feed-compose-field">
              <span>내용</span>
              <textarea
                value={caption}
                onChange={(event) => onChangeCaption(event.target.value)}
                placeholder="피드 내용을 입력하세요"
                maxLength={400}
              />
            </div>

            <div className="feed-compose-attach-row">
              <label className={`creator-launch-btn feed-compose-attach-btn${busy ? " is-busy" : ""}`}>
                {busy ? "첨부 최적화 중" : composeMeta.attachLabel}
                <input
                  type="file"
                  accept={composeMeta.accept}
                  hidden
                  disabled={busy}
                  onChange={(event) => {
                    onAttachFile(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <span>{helperText}</span>
            </div>

            {attachment ? (
              <div className="feed-compose-preview-card">
                {attachment.type.startsWith("image/") ? (
                  <img src={attachment.previewUrl} alt={attachment.name} className="feed-compose-preview-media" loading="lazy" />
                ) : (
                  <video src={attachment.previewUrl} className="feed-compose-preview-media" controls playsInline preload="metadata" />
                )}
                <div className="feed-compose-preview-copy">
                  <strong>{attachment.name}</strong>
                  <span>{attachment.type.startsWith("video/") ? `영상 첨부${attachment.optimized ? " · 최적화" : ""}${attachment.durationSec ? ` · ${attachment.durationSec.toFixed(1)}초` : ""}` : "사진 첨부"} · {Math.max(1, Math.round(attachment.size / 1024))}KB</span>
                </div>
                <button type="button" className="ghost-btn" onClick={onClearAttachment}>삭제</button>
              </div>
            ) : (
              <div className="feed-compose-empty">첨부한 사진/영상이 여기에 미리보기로 표시됩니다.</div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function isCompanyMailRouteActive() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  return host.includes("opsmail") || host.includes("corpmail") || host.includes("mailops") || path.startsWith("/__ops/company-mail") || hash === "#corp-mail-admin" || params.get("internal") === "company-mail";
}

function isCompanyMailHostLocked() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host.includes("opsmail") || host.includes("corpmail") || host.includes("mailops");
}

function CompanyMailAdminScreen({
  isAdmin,
  onExit,
  onRequestLogin,
  hostLabel,
}: {
  isAdmin: boolean;
  onExit?: () => void;
  onRequestLogin: () => void;
  hostLabel: string;
}) {
  const folderDefs = [
    { key: "받은편지함", label: "받은편지함" },
    { key: "공지/정책", label: "공지/정책" },
    { key: "주문/정산", label: "주문/정산" },
    { key: "거래처", label: "거래처" },
    { key: "임시보관", label: "임시보관" },
  ] as const;
  type FolderKey = (typeof folderDefs)[number]["key"];
  type CompanyMailMessage = {
    id: number;
    folder: FolderKey;
    category: string;
    subject: string;
    sender: string;
    receivedAt: string;
    preview: string;
    body: string[];
    unread?: boolean;
    priority?: "일반" | "중요" | "긴급";
    tags?: string[];
  };

  const messages = useMemo<CompanyMailMessage[]>(() => ([
    {
      id: 1,
      folder: "받은편지함",
      category: "운영",
      subject: "오늘 오전 관리자 점검 일정 공유",
      sender: "ops@internal.mail",
      receivedAt: "2026.04.20 09:10",
      preview: "운영 점검, 결제 리허설, 공지 반영 상태를 오전 10시에 재확인합니다.",
      body: [
        "관리자 전용 점검 화면입니다.",
        "오늘 오전 10시에 운영 점검, 결제 리허설, 공지 반영 상태를 순서대로 확인합니다.",
        "앱 내 노출 없이 관리자 계정만 접근 가능하도록 유지합니다.",
      ],
      unread: true,
      priority: "중요",
      tags: ["운영", "점검"],
    },
    {
      id: 2,
      folder: "공지/정책",
      category: "정책",
      subject: "청소년 보호정책 문구 최종 검수 요청",
      sender: "policy@internal.mail",
      receivedAt: "2026.04.19 18:45",
      preview: "앱 공지/회원가입/상품 상세에 동일 문구가 반영되었는지 확인해주세요.",
      body: [
        "청소년 보호정책 최종 검수 요청입니다.",
        "회원가입, 알림 공지, 상품 상세의 고지 문구가 동일한지 확인 후 승인 처리해주세요.",
      ],
      priority: "중요",
      tags: ["정책", "문구"],
    },
    {
      id: 3,
      folder: "주문/정산",
      category: "주문",
      subject: "주문 환불 처리 로그 점검",
      sender: "ledger@internal.mail",
      receivedAt: "2026.04.19 14:20",
      preview: "환불 상태 변경 이력과 관리자 사유 로그를 오후 배치 전 확인하세요.",
      body: [
        "환불 처리 로그 점검 안내입니다.",
        "주문 상태 변경 이력, 관리자 사유 기록, 환불 금액 반영값을 오후 배치 전에 검토해주세요.",
      ],
      priority: "일반",
      tags: ["주문", "환불"],
    },
    {
      id: 4,
      folder: "거래처",
      category: "거래처",
      subject: "입점사 노출 상품 검수 요청",
      sender: "sellerdesk@internal.mail",
      receivedAt: "2026.04.18 16:00",
      preview: "신규 입점사 공개 예정 상품 12건의 카테고리/문구 검수가 필요합니다.",
      body: [
        "입점사 검수 요청 건입니다.",
        "신규 등록 예정 상품 12건에 대해 카테고리, 상세 문구, 노출 이미지 검수를 진행해주세요.",
      ],
      unread: true,
      priority: "중요",
      tags: ["판매자", "검수"],
    },
    {
      id: 5,
      folder: "임시보관",
      category: "초안",
      subject: "앰배서더 운영 약정서 보관",
      sender: "docs@internal.mail",
      receivedAt: "2026.04.20 11:40",
      preview: "업로드한 HWP 문서를 DOCX로 변환해 docs/internal/ambassador 폴더에 보관했습니다.",
      body: [
        "문서 보관 완료 안내입니다.",
        "앰배서더 운영 가이드라인 및 참여약정서를 DOCX 형식으로 변환해 프로젝트 내부 문서 폴더에 저장했습니다.",
      ],
      priority: "일반",
      tags: ["문서", "보관"],
    },
  ]), []);

  const [folder, setFolder] = useState<FolderKey>("받은편지함");
  const visibleMessages = useMemo(() => messages.filter((item) => item.folder === folder), [messages, folder]);
  const [selectedId, setSelectedId] = useState<number>(1);
  useEffect(() => {
    if (!visibleMessages.some((item) => item.id === selectedId)) {
      setSelectedId(visibleMessages[0]?.id ?? 0);
    }
  }, [visibleMessages, selectedId]);

  const selectedMessage = visibleMessages.find((item) => item.id === selectedId) ?? visibleMessages[0] ?? null;
  const folderCounts = useMemo(() => {
    return folderDefs.reduce<Record<FolderKey, number>>((acc, item) => {
      acc[item.key] = messages.filter((message) => message.folder === item.key).length;
      return acc;
    }, {
      "받은편지함": 0,
      "공지/정책": 0,
      "주문/정산": 0,
      "거래처": 0,
      "임시보관": 0,
    });
  }, [messages]);

  if (!isAdmin) {
    return (
      <div className="company-mail-shell company-mail-shell--blocked">
        <section className="company-mail-auth-card">
          <div className="company-mail-auth-head">
            <strong>회사메일 관리자 화면</strong>
            <span>{hostLabel}</span>
          </div>
          <div className="legacy-box compact">
            <p>이 화면은 관리자 계정만 접근할 수 있습니다.</p>
            <p>일반 회원 및 판매자 계정에서는 접근이 차단됩니다.</p>
          </div>
          <div className="copy-action-row">
            <button type="button" onClick={onRequestLogin}>로그인 화면으로 이동</button>
            {onExit ? <button type="button" className="ghost-btn" onClick={onExit}>닫기</button> : null}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="company-mail-shell">
      <header className="company-mail-topbar">
        <div className="company-mail-topbar-main">
          {onExit ? (
            <button type="button" className="header-inline-btn header-icon-btn topbar-search-back" onClick={onExit} aria-label="뒤로가기">
              <BackArrowIcon />
            </button>
          ) : <span className="company-mail-topbar-spacer" aria-hidden="true" />}
          <div>
            <strong>회사메일 관리자 화면</strong>
            <span>{hostLabel}</span>
          </div>
        </div>
        <div className="company-mail-topbar-actions">
          <button type="button" className="ghost-btn">새 메일</button>
          <button type="button" className="ghost-btn">보안 로그</button>
        </div>
      </header>

      <main className="company-mail-layout">
        <aside className="company-mail-sidebar">
          <div className="company-mail-sidebar-head">
            <strong>숨김 폴더</strong>
            <span>관리자 전용</span>
          </div>
          <div className="company-mail-folder-list">
            {folderDefs.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`company-mail-folder-btn ${folder === item.key ? "active" : ""}`}
                onClick={() => setFolder(item.key)}
              >
                <span>{item.label}</span>
                <b>{folderCounts[item.key]}</b>
              </button>
            ))}
          </div>
          <div className="company-mail-sidebar-note">
            <strong>보안 주의</strong>
            <p>숨김 경로·숨김 도메인 연결 후 관리자 계정만 접근하도록 유지합니다.</p>
          </div>
        </aside>

        <section className="company-mail-list-pane">
          <div className="company-mail-pane-head">
            <div>
              <strong>{folder}</strong>
              <span>목록 {visibleMessages.length}건</span>
            </div>
            <button type="button" className="ghost-btn ghost-btn-small">새로고침</button>
          </div>
          <div className="company-mail-message-list">
            {visibleMessages.map((message) => (
              <button
                key={message.id}
                type="button"
                className={`company-mail-message-row ${selectedMessage?.id === message.id ? "active" : ""} ${message.unread ? "unread" : ""}`}
                onClick={() => setSelectedId(message.id)}
              >
                <div className="company-mail-message-row-top">
                  <span className="company-mail-chip">{message.category}</span>
                  <strong>{message.subject}</strong>
                </div>
                <div className="company-mail-message-row-meta">
                  <span>{message.sender}</span>
                  <span>{message.receivedAt}</span>
                </div>
                <p>{message.preview}</p>
              </button>
            ))}
          </div>
        </section>

        <article className="company-mail-viewer">
          {selectedMessage ? (
            <>
              <div className="company-mail-viewer-head">
                <div className="company-mail-viewer-title-row">
                  <span className="company-mail-chip strong">{selectedMessage.category}</span>
                  <h2>{selectedMessage.subject}</h2>
                </div>
                <div className="company-mail-viewer-meta">
                  <span><b>보낸사람</b> {selectedMessage.sender}</span>
                  <span><b>수신일</b> {selectedMessage.receivedAt}</span>
                  <span><b>우선순위</b> {selectedMessage.priority ?? "일반"}</span>
                </div>
                {selectedMessage.tags?.length ? (
                  <div className="company-mail-tag-row">
                    {selectedMessage.tags.map((tag) => <span key={tag} className="company-mail-tag">#{tag}</span>)}
                  </div>
                ) : null}
              </div>
              <div className="company-mail-body">
                {selectedMessage.body.map((line, index) => <p key={`${selectedMessage.id}-${index}`}>{line}</p>)}
              </div>
              <div className="company-mail-viewer-actions">
                <button type="button">답장</button>
                <button type="button" className="ghost-btn">전달</button>
                <button type="button" className="ghost-btn">보관</button>
              </div>
            </>
          ) : (
            <div className="legacy-box compact"><p>표시할 메일이 없습니다.</p></div>
          )}
        </article>
      </main>
    </div>
  );
}

function LegacyPanel({ section, projectStatus, deployGuide }: { section: LegacyTab; projectStatus: ProjectStatus | null; deployGuide: DeployGuide | null }) {
  if (section === "운영현황") {
    return (
      <section className="legacy-panel compact-panel">
        <div className="legacy-box">
          <h3>운영 요약</h3>
          <div className="big-progress">{projectStatus?.overall?.percent ?? 0}%</div>
          <p>{projectStatus?.overall?.status ?? "진행도 데이터를 불러오는 중입니다."}</p>
        </div>
        <div className="legacy-box">
          <h3>세부 진행도</h3>
          <div className="progress-list">
            {(projectStatus?.items ?? []).slice(0, 7).map((item) => (
              <div key={item.category} className="progress-row">
                <div>
                  <strong>{item.category}</strong>
                  <span>{item.status}</span>
                </div>
                <div className="progress-bar"><i style={{ width: `${item.percent}%` }} /></div>
                <b>{item.percent}%</b>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section === "주문관리") {
    return (
      <section className="legacy-panel compact-panel">
        <div className="legacy-grid three">
          <div className="legacy-box"><h3>주문 상태</h3><p>신규 주문 18건 · 결제대기 4건 · 출고대기 7건</p></div>
          <div className="legacy-box"><h3>환불/분쟁</h3><p>요청 3건 · 검수중 2건 · SLA 경고 1건</p></div>
          <div className="legacy-box"><h3>정산 미리보기</h3><p>이번 주 플랫폼 수수료 예상 ₩1,420,000</p></div>
        </div>
      </section>
    );
  }

  if (section === "보안") {
    return (
      <section className="legacy-panel compact-panel">
        <div className="legacy-grid three">
          <div className="legacy-box"><h3>관리자 2FA</h3><p>OTP + 백업코드 준비, 실발송 정책만 남음</p></div>
          <div className="legacy-box"><h3>권한체계</h3><p>관리자/사업자/일반회원 역할별 가드 반영</p></div>
          <div className="legacy-box"><h3>감사로그</h3><p>해시체인 고도화 및 운영 내보내기 정책 보완 필요</p></div>
        </div>
      </section>
    );
  }

  if (section === "포럼 분리 정책") {
    return (
      <section className="legacy-panel compact-panel">
        <div className="legacy-grid two">
          <div className="legacy-box"><h3>매칭 규칙</h3><p>같은 카테고리만 매칭 · 성별 조건 선택 가능 · 연령대 선택 가능 · 지역 무관/같은 지역 우선/거리기반 설정</p></div>
          <div className="legacy-box"><h3>대기/재탐색</h3><p>남성 20~40초 / 여성 5~10초 재매칭 쿨다운 · 실패 시 자동 재탐색 · 과거 차단 유저 제외</p></div>
          <div className="legacy-box"><h3>입장/종료</h3><p>매칭 성공 시 1:1 채팅방 자동 생성 · 수동 종료 또는 상대 차단 시 종료</p></div>
          <div className="legacy-box"><h3>보관/로그</h3><p>텍스트 전용 · 메시지 30분 내 전체 삭제 가능(삭제 표기 유지) · 관리자 전체 열람/보관</p></div>
        </div>
        <div className="legacy-box compact">
          <h3>신고 사유 기본안</h3>
          <p>욕설/비하 · 광고/도배 · 불법거래유도 · 성매매유도 · 개인정보요구 · 음란표현과다 · 기타 운영위반</p>
        </div>
      </section>
    );
  }

  if (section === "앱심사") {
    return (
      <section className="legacy-panel compact-panel">
        <div className="legacy-grid two">
          <div className="legacy-box"><h3>Safe 노출 체크</h3><p>고정 상·하단 바, 공개영역 정보성 피드, 민감 상세 분리 구조 유지</p></div>
          <div className="legacy-box"><h3>남은 자산</h3><p>실기기 캡처 · App Preview · 스토어 메타데이터 최종본</p></div>
        </div>
      </section>
    );
  }

  return (
    <section className="legacy-panel compact-panel">
      <div className="legacy-box">
        <h3>Cloudflare 수동 배포 가이드</h3>
        <ul>
          <li>Pages project: {deployGuide?.project_name ?? "adultapp"}</li>
          <li>Build command: {deployGuide?.build_command ?? "npm run cf:build"}</li>
          <li>Output: {deployGuide?.output_directory ?? "dist"}</li>
          <li>Windows script: {deployGuide?.windows_script ?? "scripts/cloudflare_manual_deploy.ps1"}</li>
        </ul>
        <pre>{deployGuide?.pages_cli ?? "npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true"}</pre>
      </div>
    </section>
  );
}

function copyToClipboard(text: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) return;
  navigator.clipboard.writeText(text).catch(() => null);
}

function formatCompactSocialCount(value: number) {
  if (value >= 10000) {
    const compact = Math.floor((value / 10000) * 10) / 10;
    return Number.isInteger(compact) ? `${compact.toFixed(0)}만` : `${compact.toFixed(1)}만`;
  }
  return value.toLocaleString();
}

function buildElementSelector(element: HTMLElement) {
  if (element.id) return `#${element.id}`;
  const classList = Array.from(element.classList).slice(0, 3).join(".");
  const classSelector = classList ? `.${classList}` : "";
  const parent = element.parentElement;
  const siblings = parent ? Array.from(parent.children).filter((item) => item.tagName === element.tagName) : [];
  const index = siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(element) + 1})` : "";
  return `${element.tagName.toLowerCase()}${classSelector}${index}`;
}

function buildElementCssText(element: HTMLElement) {
  const computed = window.getComputedStyle(element);
  const cssKeys = [
    "display", "position", "width", "height", "min-width", "min-height", "max-width", "max-height",
    "margin", "padding", "gap", "grid-template-columns", "grid-template-rows", "flex-direction",
    "justify-content", "align-items", "font-size", "font-weight", "line-height", "color",
    "background", "background-color", "border", "border-radius", "box-shadow", "overflow"
  ];
  return cssKeys.map((key) => `  ${key}: ${computed.getPropertyValue(key)};`).join("\n");
}

function buildInspectorModalStyle(target: HTMLElement): CSSProperties {
  const rect = target.getBoundingClientRect();
  const width = Math.min(window.innerWidth - 24, 360);
  const maxHeight = Math.max(220, Math.round(window.innerHeight * 0.4));
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
  const top = Math.max(12, Math.min(rect.bottom + 10, window.innerHeight - maxHeight - 12));
  return { left: `${left}px`, top: `${top}px`, width: `${width}px`, maxHeight: `${maxHeight}px` };
}

function SettingSection({ category, isAdmin, legacySection, setLegacySection, projectStatus, deployGuide, legalDocuments, adminLegalDocuments, refreshAdminLegalDocuments, authSummary, businessInfo, releaseReadiness, paymentProviderStatus, minorPurgePreview, currentUserRole, adminModeTab, setAdminModeTab, adminDbManage, sellerApprovalQueue, productApprovalQueue, settlementPreview, htmlInspectorEnabled, setHtmlInspectorEnabled, adminDecideSeller, adminDecideProduct, accountPrivate, setAccountPrivate, profileFeedPublic, setProfileFeedPublic, profileShortsPublic, setProfileShortsPublic, profileQuestionPublic, setProfileQuestionPublic, profileTagPublic, setProfileTagPublic, profileProductPublic, setProfileProductPublic }: {
  category: SettingsCategory;
  isAdmin: boolean;
  legacySection: LegacyTab;
  setLegacySection: (section: LegacyTab) => void;
  projectStatus: ProjectStatus | null;
  deployGuide: DeployGuide | null;
  legalDocuments: LegalDocumentsResponse | null;
  adminLegalDocuments: AdminLegalDocumentsResponse | null;
  refreshAdminLegalDocuments: () => void;
  authSummary: AuthSummary | null;
  businessInfo: BusinessInfoResponse | null;
  releaseReadiness: ReleaseReadinessResponse | null;
  paymentProviderStatus: PaymentProviderStatusResponse | null;
  minorPurgePreview: MinorPurgePreview | null;
  currentUserRole: string;
  adminModeTab: AdminModeTab;
  setAdminModeTab: (section: AdminModeTab) => void;
  adminDbManage: AdminDbManage | null;
  sellerApprovalQueue: SellerApprovalItem[];
  productApprovalQueue: ProductApprovalItem[];
  settlementPreview: SettlementPreviewResponse | null;
  htmlInspectorEnabled: boolean;
  setHtmlInspectorEnabled: (value: boolean) => void;
  adminDecideSeller: (userId: number, decision: string) => void;
  adminDecideProduct: (productId: number, decision: string) => void;
  accountPrivate: boolean;
  setAccountPrivate: (value: boolean | ((prev: boolean) => boolean)) => void;
  profileFeedPublic: boolean;
  setProfileFeedPublic: (value: boolean) => void;
  profileShortsPublic: boolean;
  setProfileShortsPublic: (value: boolean) => void;
  profileQuestionPublic: boolean;
  setProfileQuestionPublic: (value: boolean) => void;
  profileTagPublic: boolean;
  setProfileTagPublic: (value: boolean) => void;
  profileProductPublic: boolean;
  setProfileProductPublic: (value: boolean) => void;
}) {
  const [documentDrafts, setDocumentDrafts] = useState<AdminLegalDocumentDrafts>(() => {
    const defaults = createDefaultAdminDocumentDrafts();
    if (typeof window === "undefined") return defaults;
    try {
      const stored = JSON.parse(window.localStorage.getItem("adultapp_admin_legal_document_drafts") ?? "null");
      return { ...defaults, ...(stored && typeof stored === "object" ? stored : {}) };
    } catch {
      return defaults;
    }
  });
  const [documentSaveMessage, setDocumentSaveMessage] = useState("");

  useEffect(() => {
    const serverItems = adminLegalDocuments?.items ?? legalDocuments?.items ?? {};
    setDocumentDrafts((prev) => {
      const defaults = createDefaultAdminDocumentDrafts();
      const next = { ...defaults, ...prev };
      adminLegalDocumentDefinitions.forEach((item) => {
        const serverContent = serverItems[item.key]?.content;
        if (typeof serverContent === "string" && serverContent.trim() && (!prev[item.key] || prev[item.key] === defaults[item.key])) {
          next[item.key] = serverContent;
        }
      });
      return next;
    });
  }, [adminLegalDocuments, legalDocuments]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_admin_legal_document_drafts", JSON.stringify(documentDrafts));
  }, [documentDrafts]);

  const updateDocumentDraft = useCallback((key: AdminLegalDocumentKey, value: string) => {
    setDocumentDrafts((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveAdminDocuments = useCallback(async () => {
    const documents = adminLegalDocumentDefinitions.map((item) => ({
      key: item.key,
      label: item.label,
      required: item.required,
      content: documentDrafts[item.key] ?? "",
    }));
    setDocumentSaveMessage("문서 저장 중...");
    try {
      await postJson<AdminLegalDocumentsSaveResponse>("/admin/legal-documents", { documents });
      setDocumentSaveMessage("문서 저장 완료");
      refreshAdminLegalDocuments();
    } catch (error) {
      setDocumentSaveMessage(error instanceof Error ? `서버 저장 실패 · 임시저장 완료: ${error.message}` : "서버 저장 실패 · 임시저장 완료");
    }
  }, [documentDrafts, refreshAdminLegalDocuments]);

  if (category === "일반") {
    return (
      <div className="settings-common-shell">
        <div className="settings-top-tab-row" aria-label="설정 상단 카테고리">
          {mobileTabs.map((tab) => <span key={`settings-top-${tab}`} className="settings-top-tab-chip">{tab}</span>)}
        </div>
        <div className="settings-common-actions">
          <button type="button" className="settings-common-action danger">로그아웃</button>
          <button type="button" className="settings-common-action">계정전환</button>
        </div>
        <div className="settings-bottom-specific">
          <strong>하단바별 개별설정</strong>
          <p>홈, 쇼핑, 소통, 채팅, 프로필 하단바별로 검색, 알림, 메뉴, 노출 버튼을 따로 설정하는 영역입니다.</p>
        </div>
      </div>
    );
  }
  if (category === "계정설정") {
    const privacyRows = [
      { label: "피드공개", value: profileFeedPublic, setValue: setProfileFeedPublic, text: "피드 공개 범위를 선택합니다." },
      { label: "쇼츠공개", value: profileShortsPublic, setValue: setProfileShortsPublic, text: "쇼츠 공개 범위를 선택합니다." },
      { label: "질문공개", value: profileQuestionPublic, setValue: setProfileQuestionPublic, text: "질문 공개 범위를 선택합니다." },
      { label: "태그공개", value: profileTagPublic, setValue: setProfileTagPublic, text: "태그 공개 범위를 선택합니다." },
      { label: "상품공개", value: profileProductPublic, setValue: setProfileProductPublic, text: "상품 공개 범위를 선택합니다." },
    ];
    return (
      <div className="account-setting-shell">
        <div className="legacy-box compact account-lock-card">
          <div className="split-row">
            <div>
              <h3>계정잠금</h3>
              <p>서로 맞 팔로잉을 한 계정만 나의 프로필(피드, 쇼츠, 상품, 질문 등)을 볼 수 있습니다.</p>
            </div>
            <div className="toggle-row">
              <button type="button" className={`toggle-btn ${accountPrivate ? "active" : ""}`} onClick={() => setAccountPrivate(true)}>ON</button>
              <button type="button" className={`toggle-btn ${!accountPrivate ? "active" : ""}`} onClick={() => setAccountPrivate(false)}>OFF</button>
            </div>
          </div>
        </div>
        <div className="settings-grid settings-two-col">
          {privacyRows.map((row) => (
            <div key={row.label} className="legacy-box compact account-privacy-card">
              <div className="split-row">
                <div>
                  <h3>{row.label}</h3>
                  <p>{row.text} 세부설정으로 공개할 범위를 선택해주세요.</p>
                </div>
                <div className="toggle-row">
                  <button type="button" className={`toggle-btn ${row.value ? "active" : ""}`} onClick={() => row.setValue(true)}>ON</button>
                  <button type="button" className={`toggle-btn ${!row.value ? "active" : ""}`} onClick={() => row.setValue(false)}>OFF</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (category === "알림") {
    return (
      <div className="settings-grid settings-two-col">
        <div className="legacy-box compact"><h3>주문/결제 알림</h3><p>주문상태, 결제대기, 환불 요청을 목록 기준으로 묶어 표시합니다.</p></div>
        <div className="legacy-box compact"><h3>채팅 알림</h3><p>운영문의 채팅, 주문/판매자 응답, 질문응답 알림을 분리해서 보여줍니다.</p></div>
      </div>
    );
  }
  if (category === "보안") {
    return (
      <div className="settings-grid settings-two-col">
        <div className="legacy-box compact"><h3>권한 가드</h3><p>관리자 전용 운영 항목은 관리자 계정일 때만 노출됩니다.</p></div>
        <div className="legacy-box compact"><h3>API 연결</h3><p>Production API timeout/fallback과 재시도를 유지합니다.</p></div>
        <div className="legacy-box compact"><h3>인증 상태</h3><p>본인확인 {authSummary?.identity_verified ? '완료' : '미완료'} · 성인인증 {authSummary?.adult_verified ? '완료' : '미완료'} · 제한 포럼 권한 {authSummary?.adult_verified ? '심사 가능' : '성인인증 필요'}</p></div>
        <div className="legacy-box compact"><h3>운영 보호장치</h3><p>로그인·채팅·신고·주문 API는 서버 기준 rate limit, 감사로그, 성인 가드, 텍스트 필터를 적용하는 방향으로 정리했습니다.</p></div>
        <div className="legacy-box compact"><h3>미성년 차단 파기 배치</h3><p>{minorPurgePreview?.enabled ? '배치 정책 활성' : '배치 정책 비활성'} · cron {minorPurgePreview?.cron ?? '-'}</p><p>현재 파기 후보 {minorPurgePreview?.candidate_count ?? 0}건 · 보관 {minorPurgePreview?.retention_days ?? 365}일</p></div>
      </div>
    );
  }
  if (category === "배포") {
    return (
      <div className="settings-grid settings-two-col">
        <div className="legacy-box compact"><h3>Cloudflare Pages</h3><p>{deployGuide?.project_name ?? "adultapp"} · dist 업로드 기준</p></div>
        <div className="legacy-box compact"><h3>진행도</h3><p>{projectStatus?.overall?.status ?? "진행도 데이터 로딩중"}</p></div>
      </div>
    );
  }
  if (["관리자모드", "DB관리", "신고", "채팅", "기타"].includes(category)) {
    if (!isAdmin) {
      return <div className="legacy-box compact"><h3>{category}</h3><p>관리자 계정에서만 확인할 수 있습니다.</p></div>;
    }
    const normalizedAdminMode = category === "관리자모드" ? adminModeTab : (category as AdminModeTab);
    return (
      <div className="stack-gap">
        <div className="legacy-nav inline">
          {adminModeTabs.map((item) => (
            <button key={item} className={`legacy-nav-btn ${normalizedAdminMode === item ? "active" : ""}`} onClick={() => setAdminModeTab(item)}>{item}</button>
          ))}
        </div>
        {normalizedAdminMode === "계정관리" ? (
          <div className="settings-grid settings-two-col admin-mode-dashboard-grid">
            <div className="legacy-box compact admin-mode-summary-card">
              <h3>계정관리</h3>
              <p>현재 권한: {currentUserRole} · 관리자 접근 {isAdmin ? "허용" : "차단"}</p>
              <p>판매자 승인대기 {sellerApprovalQueue.length}건 · 상품 승인대기 {productApprovalQueue.length}건</p>
            </div>
            <div className="legacy-box compact admin-mode-summary-card">
              <h3>계정 상태 관리</h3>
              <p>회원 정지, 성인인증 상태, 판매자 승인/보류/반려 처리를 한 화면에서 확인하는 관리자용 진입점입니다.</p>
              <div className="compact-scroll-list">
                {sellerApprovalQueue.slice(0, 5).map((item) => (
                  <div key={`account-admin-${item.user_id}`} className="simple-list-row multi-line">
                    <div><b>{item.name}</b><span>{item.email}</span><span>{item.status} · 사업자번호 {item.business_number ?? "미입력"}</span></div>
                  </div>
                ))}
                {!sellerApprovalQueue.length ? <div className="simple-list-row">승인 대기 계정이 없습니다.</div> : null}
              </div>
            </div>
            <div className="legacy-box compact admin-mode-summary-card">
              <h3>계정 처리 항목</h3>
              <p>계정 잠금, 성인인증 재확인, 판매자 권한 회수, 신고 이력 검토를 관리자모드에서 연결합니다.</p>
            </div>
            <div className="legacy-box compact admin-mode-summary-card">
              <h3>최근 관리자 로그</h3>
              <div className="compact-scroll-list">
                {(adminDbManage?.other?.recent_logs ?? []).slice(0, 6).map((item) => (
                  <div key={`account-admin-log-${item.id}`} className="simple-list-row">#{item.id} · {item.action_type} · {item.target_type}:{item.target_id}</div>
                ))}
                {!(adminDbManage?.other?.recent_logs ?? []).length ? <div className="simple-list-row">최근 로그 데이터가 없습니다.</div> : null}
              </div>
            </div>
          </div>
        ) : null}
        {normalizedAdminMode === "운영현황" ? (
          <div className="settings-grid settings-two-col admin-mode-dashboard-grid">
            <div className="legacy-box compact admin-mode-summary-card"><h3>출시 준비 상태</h3><p>{releaseReadiness?.status ?? "데이터 로딩중"}</p><p>차단 항목 {releaseReadiness?.blockers?.length ?? 0}건</p></div>
            <div className="legacy-box compact admin-mode-summary-card"><h3>운영 진행도</h3><p>{projectStatus?.overall?.status ?? "진행도 데이터 로딩중"}</p></div>
            <div className="legacy-box compact admin-mode-summary-card"><h3>결제/PG 상태</h3><p>Primary {paymentProviderStatus?.primary_provider ?? "미설정"} · SDK {paymentProviderStatus?.portone_sdk_enabled ? "활성" : "비활성"}</p></div>
            <div className="legacy-box compact admin-mode-summary-card"><h3>정산 현황</h3><p>주문 {settlementPreview?.summary?.count ?? 0}건 · 예상 정산 {(settlementPreview?.summary?.seller_receivable_total ?? 0).toLocaleString()}원</p></div>
            <div className="legacy-box compact admin-mode-summary-card"><h3>신고/채팅 현황</h3><p>신고 {adminDbManage?.report?.total ?? 0}건 · 채팅 스레드 {adminDbManage?.chat?.total_threads ?? 0}개</p></div>
            <div className="legacy-box compact admin-mode-summary-card"><h3>사업자정보 고지</h3><p>{businessInfo?.complete ? "완료" : "미완료"} · 미입력 {businessInfo?.placeholder_fields?.length ?? 0}개</p></div>
          </div>
        ) : null}
        {normalizedAdminMode === "계정권한" ? (
          <div className="settings-grid settings-two-col admin-mode-dashboard-grid">
            <div className="legacy-box compact admin-mode-summary-card"><h3>관리자 권한</h3><p>현재 계정은 관리자모드 접근 권한을 보유하고 있습니다.</p><p>권한값: {currentUserRole}</p></div>
            <div className="legacy-box compact admin-mode-summary-card"><h3>사업자 권한</h3><p>사업자 상품등록은 서버 승인 상태와 정산계좌/사업자정보 검증을 기준으로 처리합니다.</p></div>
            <div className="legacy-box compact admin-mode-summary-card"><h3>권한별 접근</h3><ul><li>계정관리: 관리자 전용</li><li>운영현황: 관리자 전용</li><li>문서: 관리자 전용 작성/수정</li><li>상품등록: 승인 사업자/관리자</li></ul></div>
            <div className="legacy-box compact admin-mode-summary-card"><h3>문서 관리</h3><p>계정권한 하위 문서 관리 화면에서 필수 약관·정책 문서를 항목별로 작성합니다.</p><button type="button" className="ghost-btn" onClick={() => setAdminModeTab("문서")}>문서 열기</button></div>
          </div>
        ) : null}
        {normalizedAdminMode === "문서" ? (
          <div className="stack-gap admin-document-editor-shell">
            <div className="legacy-box compact admin-document-editor-head">
              <div className="split-row">
                <div><h3>문서 작성/수정</h3><p>계정권한 카테고리 하위 문서입니다. 각 항목별 필수 내용을 기준으로 운영 문서를 작성합니다.</p></div>
                <button type="button" onClick={saveAdminDocuments}>전체 저장</button>
              </div>
              {documentSaveMessage ? <p className="muted-mini">{documentSaveMessage}</p> : null}
            </div>
            {adminLegalDocumentDefinitions.map((item) => (
              <div key={item.key} className="legacy-box compact admin-document-editor-card">
                <div className="admin-document-editor-title-row">
                  <div><h3>{item.label}</h3><p>필수 내용: {item.required}</p></div>
                  <span className="desktop-placeholder-pill">{adminLegalDocuments?.items?.[item.key]?.version ?? legalDocuments?.items?.[item.key]?.version ?? "draft"}</span>
                </div>
                <textarea
                  className="admin-document-textarea"
                  value={documentDrafts[item.key] ?? ""}
                  onChange={(event) => updateDocumentDraft(item.key, event.target.value)}
                  placeholder={`${item.label} 내용을 입력하세요. 필수 내용: ${item.required}`}
                />
              </div>
            ))}
          </div>
        ) : null}
        {normalizedAdminMode === "승인" ? (
          <div className="settings-grid settings-two-col">
            <div className="legacy-box compact">
              <h3>판매자 승인 대기</h3>
              <p>초기 기준: 사업자등록증, 정산계좌 확인, 반품지, CS 연락처, 판매자 약관 동의까지 완료해야 승인합니다.</p>
              <div className="compact-scroll-list">
                {sellerApprovalQueue.map((item) => (
                  <div key={item.user_id} className="simple-list-row multi-line">
                    <div><b>{item.name}</b><span>{item.email}</span><span>{item.business_number ?? '-'} · {item.status}</span></div>
                    <div className="copy-action-row">
                      <button type="button" onClick={() => adminDecideSeller(item.user_id, 'approved')} disabled={!item.submission_complete}>승인</button>
                      <button type="button" className="ghost-btn" onClick={() => adminDecideSeller(item.user_id, 'hold')}>보류</button>
                      <button type="button" className="ghost-btn danger" onClick={() => adminDecideSeller(item.user_id, 'rejected')}>반려</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="legacy-box compact">
              <h3>상품 승인 대기</h3>
              <p>승인 전 상품은 비공개이며, 등록한 사업자만 자신의 계정에서 승인대기 상태를 볼 수 있습니다.</p>
              <div className="compact-scroll-list">
                {productApprovalQueue.map((item) => (
                  <div key={item.id} className="simple-list-row multi-line">
                    <div><b>{item.name}</b><span>{item.category} · {item.sku_code}</span><span>{item.status} · ₩{item.price.toLocaleString()}</span></div>
                    <div className="copy-action-row">
                      <button type="button" onClick={() => adminDecideProduct(item.id, 'approved')}>공개 승인</button>
                      <button type="button" className="ghost-btn" onClick={() => adminDecideProduct(item.id, 'hold')}>보류</button>
                      <button type="button" className="ghost-btn danger" onClick={() => adminDecideProduct(item.id, 'rejected')}>반려</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        {normalizedAdminMode === "정산" ? (
          <div className="settings-grid settings-two-col">
            <div className="legacy-box compact">
              <h3>정산 개요</h3>
              <p>정산 주기: {settlementPreview?.policy?.settlement_cycle ?? '주별 정산 예정'}</p>
              <p>주문 {settlementPreview?.summary?.count ?? 0}건 · 정산 예상 {settlementPreview?.summary?.seller_receivable_total?.toLocaleString?.() ?? 0}원</p>
            </div>
            <div className="legacy-box compact">
              <h3>증빙 발급 책임</h3>
              <p>직접판매 세금계산서: {settlementPreview?.policy?.tax_invoice_direct ?? 'platform'}</p>
              <p>중개판매 세금계산서: {settlementPreview?.policy?.tax_invoice_marketplace ?? 'seller'}</p>
              <p>직접판매 현금영수증: {settlementPreview?.policy?.cash_receipt_direct ?? 'platform'}</p>
              <p>중개판매 현금영수증: {settlementPreview?.policy?.cash_receipt_marketplace ?? 'seller'}</p>
            </div>
          </div>
        ) : null}
        {normalizedAdminMode === "DB관리" ? (
          <div className="settings-grid settings-two-col">
            <div className="legacy-box compact">
              <h3>신고 DB</h3>
              <p>총 {adminDbManage?.report?.total ?? 0}건 · 상태 {Object.entries(adminDbManage?.report?.status_counts ?? {}).map(([k, v]) => `${k}:${v}`).join(' / ') || '데이터 없음'}</p>
            </div>
            <div className="legacy-box compact">
              <h3>채팅 DB</h3>
              <p>총 {adminDbManage?.chat?.total_threads ?? 0}개 스레드 · 상태 {Object.entries(adminDbManage?.chat?.status_counts ?? {}).map(([k, v]) => `${k}:${v}`).join(' / ') || '데이터 없음'}</p>
            </div>
            <div className="legacy-box compact">
              <h3>현재 제재 기준</h3>
              <p>{adminDbManage?.other?.random_chat_only_sanction_enabled ? adminDbManage?.other?.random_chat_only_sanction_policy : '랜덤채팅 전용 제재 비활성'}</p>
            </div>
            <div className="legacy-box compact">
              <h3>관리자 열람/감사</h3>
              <p>{adminDbManage?.other?.admin_access_scope ?? '데이터 없음'} · 감사로그 {adminDbManage?.other?.audit_enabled ? '활성' : '비활성'}</p>
            </div>
          </div>
        ) : null}
        {normalizedAdminMode === "신고" ? (
          <div className="settings-grid settings-two-col">
            <div className="legacy-box compact">
              <h3>신고 정책</h3>
              <p>결과 통지: {adminDbManage?.rule?.report_result_notice_mode ?? 'silent'} · 랜덤채팅 전용 제재: {adminDbManage?.other?.random_chat_only_sanction_policy ?? '데이터 없음'}</p>
              <p>최근 사유 집계: {Object.entries(adminDbManage?.report?.reason_counts ?? {}).map(([k, v]) => `${k}:${v}`).join(' / ') || '데이터 없음'}</p>
            </div>
            <div className="legacy-box compact">
              <h3>최근 신고</h3>
              <div className="compact-scroll-list">
                {(adminDbManage?.report?.recent ?? []).map((item) => (
                  <div key={item.id} className="simple-list-row">#{item.id} · reporter {item.reporter_id} → target {item.target_id} · {item.reason_code} · {item.status}</div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        {normalizedAdminMode === "채팅" ? (
          <div className="settings-grid settings-two-col">
            <div className="legacy-box compact">
              <h3>채팅 정책</h3>
              <p>차단 후 표시: {adminDbManage?.rule?.blocked_thread_visibility ?? 'hard_hidden'} · 삭제 범위: {adminDbManage?.rule?.message_delete_scope ?? 'delete_for_both_masked_archive'}</p>
              <p>재시도 {adminDbManage?.rule?.match_retry_limit ?? 0}회 · 최대 탐색 {adminDbManage?.rule?.match_search_timeout_seconds ?? 0}초 · 미디어 {adminDbManage?.rule?.media_message_mode ?? 'text_only'}</p>
              <p>관리자모드는 현재 조회 전용이며, 실제 수정 기능은 열려 있지 않습니다.</p>
            </div>
            <div className="legacy-box compact">
              <h3>최근 랜덤채팅 스레드</h3>
              <div className="compact-scroll-list">
                {(adminDbManage?.chat?.recent ?? []).map((item) => (
                  <div key={item.id} className="simple-list-row">#{item.id} · {item.subject} · {item.status} · {item.participant_a_id}/{item.participant_b_id}</div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        {normalizedAdminMode === "기타" ? (
          <div className="settings-grid settings-two-col">
            <div className="legacy-box compact">
              <h3>재가입/보존</h3>
              <p>영구정지 재가입 재심사: {adminDbManage?.other?.permanent_ban_rejoin_after_days ?? 365}일 후 가능</p>
              <p>메시지 자가 삭제 허용: {adminDbManage?.rule?.self_message_delete_window_minutes ?? 30}분</p>
            </div>
            <div className="legacy-box compact">
              <h3>최근 관리자 로그</h3>
              <div className="compact-scroll-list">
                {(adminDbManage?.other?.recent_logs ?? []).map((item) => (
                  <div key={item.id} className="simple-list-row">#{item.id} · {item.action_type} · {item.target_type}:{item.target_id} · admin {item.admin_id}</div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
  if (category === "HTML요소") {
    return (
      <div className="settings-grid settings-one-col">
        <div className="legacy-box compact">
          <div className="split-row">
            <h3>HTML 요소 추출</h3>
            <button type="button" className={`toggle-pill ${htmlInspectorEnabled ? "on" : "off"}`} onClick={() => setHtmlInspectorEnabled(!htmlInspectorEnabled)}>
              {htmlInspectorEnabled ? "ON" : "OFF"}
            </button>
          </div>
          <p>ON 상태에서 Ctrl + 마우스 왼쪽 클릭으로 원하는 레이아웃 요소를 선택하면 팝업에서 HTML, selector, 핵심 스타일을 복사할 수 있습니다.</p>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return <div className="legacy-box compact"><h3>운영</h3><p>관리자 계정에서만 확인할 수 있습니다.</p></div>;
  }
  return (
    <>
      <div className="legacy-nav inline">
        {legacyMenu.map((item) => (
          <button key={item} className={`legacy-nav-btn ${legacySection === item ? "active" : ""}`} onClick={() => setLegacySection(item)}>{item}</button>
        ))}
      </div>
      <LegacyPanel section={legacySection} projectStatus={projectStatus} deployGuide={deployGuide} />
    </>
  );
}

export default function App() {
  const desktopPaneContext = readDesktopPaneContext();
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 0));
  const [activeTab, setActiveTab] = useState<MobileTab>(desktopPaneContext.initialTab);
  const [authBootstrapDone, setAuthBootstrapDone] = useState(false);
  const [legacySection, setLegacySection] = useState<LegacyTab>("운영현황");
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(null);
  const [htmlInspectorEnabled, setHtmlInspectorEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_html_inspector_enabled") === "1";
  });
  const [inspectedElement, setInspectedElement] = useState<HtmlInspectorInfo | null>(null);
  const inspectedTargetRef = useRef<HTMLElement | null>(null);
  const [globalKeyword, setGlobalKeyword] = useState("");
  const deferredGlobalKeyword = useDeferredValue(globalKeyword);
  const [searchFilter, setSearchFilter] = useState("전체");
  const [searchSection, setSearchSection] = useState("피드결과");
  const [notificationView, setNotificationView] = useState<{ view: "list" | "section" | "detail"; section: NotificationSectionKey | null; item: NotificationItem | null }>({ view: "list", section: null, item: null });
  const [notificationSectionPage, setNotificationSectionPage] = useState(1);
  const [notificationSectionPageSize, setNotificationSectionPageSize] = useState(8);
  const [notificationItems, setNotificationItems] = useState<NotificationItem[]>(() => {
    if (typeof window === "undefined") return notificationSeed;
    try {
      const stored = JSON.parse(window.localStorage.getItem("adultapp_notification_items") ?? "null");
      return Array.isArray(stored) && stored.length ? stored : notificationSeed;
    } catch {
      return notificationSeed;
    }
  });
  const [homeTab, setHomeTab] = useState<HomeTab>("피드");
  const [shoppingTab, setShoppingTab] = useState<ShoppingTab>("홈");
  const [communityTab, setCommunityTab] = useState<CommunityTab>("커뮤");
  const [chatTab, setChatTab] = useState<ChatTab>("채팅");
  const [chatQuestionDraft, setChatQuestionDraft] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("adultapp_chat_question_draft") ?? "";
  });
  const [chatQuestionAnonymous, setChatQuestionAnonymous] = useState(false);
  const [chatCategory, setChatCategory] = useState<ChatCategory>("전체");
  const [chatVisibleCount, setChatVisibleCount] = useState(30);
  const [activeChatThreadId, setActiveChatThreadId] = useState<number | null>(null);
  const [chatRoomDraft, setChatRoomDraft] = useState("");
  const [chatMessagesByThread, setChatMessagesByThread] = useState<Record<number, ChatRoomMessage[]>>(() => {
    const merged = [...threadSeed, ...archivedThreadSeed];
    return Object.fromEntries(merged.map((thread) => [thread.id, createThreadRoomSeed(thread)]));
  });
  const [chatAttachmentSheetOpen, setChatAttachmentSheetOpen] = useState(false);
  const [chatEmojiSheetOpen, setChatEmojiSheetOpen] = useState(false);
  const [chatEmojiMode, setChatEmojiMode] = useState<ChatPickerMode>("이모티콘");
  const [chatEmojiKeyword, setChatEmojiKeyword] = useState("");
  const [chatEmojiCollectionKey, setChatEmojiCollectionKey] = useState("recent");
  const [chatRecentPickerItems, setChatRecentPickerItems] = useState<Record<ChatPickerMode, string[]>>(() => ({ ...DEFAULT_CHAT_RECENT_PICKER_ITEMS }));
  const [chatReplyTarget, setChatReplyTarget] = useState<ChatRoomMessage | null>(null);
  const [chatContextMessage, setChatContextMessage] = useState<ChatRoomMessage | null>(null);
  const [chatPinnedMessageByThread, setChatPinnedMessageByThread] = useState<Record<number, number | null>>({});
  const [chatEditableMessageId, setChatEditableMessageId] = useState<number | null>(null);
  const [chatSelectableMessageId, setChatSelectableMessageId] = useState<number | null>(null);
  const [chatShareMessage, setChatShareMessage] = useState<ChatRoomMessage | null>(null);
  const [chatShareKeyword, setChatShareKeyword] = useState("");
  const [chatLongPressHint, setChatLongPressHint] = useState("");
  const [chatCopiedSelection, setChatCopiedSelection] = useState("");
  const [selectedForumCategory, setSelectedForumCategory] = useState<ForumBoardCategory>("자유대화");
  const [activeForumRoomId, setActiveForumRoomId] = useState<number | null>(null);
  const [forumRoomMessages, setForumRoomMessages] = useState<Record<number, ForumRoomMessage[]>>({});
  const [profileTab, setProfileTab] = useState<ProfileTab>("내정보");
  const [settingsCategory, setSettingsCategory] = useState<SettingsCategory>("일반");
  const [adminModeTab, setAdminModeTab] = useState<AdminModeTab>("DB관리");
  const [selectedShopCategory, setSelectedShopCategory] = useState("전체");
  const [shopKeywordSignals, setShopKeywordSignals] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("adultapp_shop_keyword_signals") ?? "{}");
    } catch {
      return {};
    }
  });
  const [shortsKeywordSignals, setShortsKeywordSignals] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("adultapp_shorts_keyword_signals") ?? "{}");
    } catch {
      return {};
    }
  });
  const [selectedCommunityCategory, setSelectedCommunityCategory] = useState<string>("전체");
  const [communityPrimaryFilter, setCommunityPrimaryFilter] = useState<string>("전체");
  const [communitySecondaryFilter, setCommunitySecondaryFilter] = useState<string>("전체");
  const [communityExplorerStage, setCommunityExplorerStage] = useState<CommunityExplorerStage>("list");
  const [selectedCommunityPost, setSelectedCommunityPost] = useState<CommunityPost | null>(null);
  const [testProfile, setTestProfile] = useState({ gender: "선택 안 함", ageBand: "20대", focus: "자기이해" });
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [randomRoomCategory, setRandomRoomCategory] = useState<RandomRoomCategory>("전체");
  const [oneToOneCategory, setOneToOneCategory] = useState<OneToOneRandomCategory>("고민상담");
  const [randomGenderOption, setRandomGenderOption] = useState<RandomGenderOption>("무관");
  const [randomAgeMin, setRandomAgeMin] = useState(20);
  const [randomAgeMax, setRandomAgeMax] = useState(39);
  const [randomRegionOption, setRandomRegionOption] = useState<RandomRegionOption>("무관");
  const [randomDistanceMinKm, setRandomDistanceMinKm] = useState(0);
  const [randomDistanceMaxKm, setRandomDistanceMaxKm] = useState(60);
  const [randomEntryTab, setRandomEntryTab] = useState<RandomEntryTab>("시작");
  const [activeRandomRoomId, setActiveRandomRoomId] = useState<number | null>(null);
  const [randomNow, setRandomNow] = useState(() => Date.now());
  const [randomSettingsOpen, setRandomSettingsOpen] = useState(false);
  const [matchingRandom, setMatchingRandom] = useState(false);
  const [matchedRandomUser, setMatchedRandomUser] = useState<{ name: string; category: OneToOneRandomCategory; nickname: string } | null>(null);
  const [randomMatchPhase, setRandomMatchPhase] = useState<"idle" | "queueing" | "matched">("idle");
  const [randomMatchNote, setRandomMatchNote] = useState("앱 공개영역에서는 직접 매칭을 제공하지 않습니다. 민감한 정보교류는 성인인증·승인제 제한 웹 포럼으로만 분리합니다.");
  const randomRoomLifetimeMinutes = 20;
  const [shopKeyword, setShopKeyword] = useState("");
  const [shopSearchVisibleCount, setShopSearchVisibleCount] = useState(12);
  const [shopSearchFilterPanelOpen, setShopSearchFilterPanelOpen] = useState(false);
  const [shopSearchPriceMin, setShopSearchPriceMin] = useState("");
  const [shopSearchPriceMax, setShopSearchPriceMax] = useState("");
  const [shopSearchColor, setShopSearchColor] = useState<(typeof SHOP_SEARCH_COLOR_OPTIONS)[number]>("전체");
  const [shopSearchPurpose, setShopSearchPurpose] = useState<(typeof SHOP_SEARCH_PURPOSE_OPTIONS)[number]>("전체");
  const [shopHomeSort, setShopHomeSort] = useState<ShopHomeSort>("추천");
  const [shopHomeBannerIndex, setShopHomeBannerIndex] = useState(0);
  const [shopHomeBannerDragOffset, setShopHomeBannerDragOffset] = useState(0);
  const shopHomeBannerPointerStartXRef = useRef<number | null>(null);
  const shopHomeBannerPointerActiveRef = useRef(false);
  const shopHomeGridScrollRef = useRef<HTMLDivElement | null>(null);
  const shopHomeGridDragStartYRef = useRef<number | null>(null);
  const shopHomeGridDragStartScrollTopRef = useRef(0);
  const shopHomeGridDraggingRef = useRef(false);
  const shopHomeGridHasDraggedRef = useRef(false);
  const shopHomeGridSuppressClickUntilRef = useRef(0);
  const chatMessageHoldTimerRef = useRef<number | null>(null);
  const chatMessageListRef = useRef<HTMLDivElement | null>(null);
  const [shopHomeGridDragging, setShopHomeGridDragging] = useState(false);
  const [shopHomeVisibleCount, setShopHomeVisibleCount] = useState(9);
  const [communityKeyword, setCommunityKeyword] = useState("");
  const [communityPage, setCommunityPage] = useState(1);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null);
  const [deployGuide, setDeployGuide] = useState<DeployGuide | null>(null);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocumentsResponse | null>(null);
  const [adminLegalDocuments, setAdminLegalDocuments] = useState<AdminLegalDocumentsResponse | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfoResponse | null>(null);
  const [releaseReadiness, setReleaseReadiness] = useState<ReleaseReadinessResponse | null>(null);
  const [paymentProviderStatus, setPaymentProviderStatus] = useState<PaymentProviderStatusResponse | null>(null);
  const [productDetail, setProductDetail] = useState<ProductDetailResponse | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productDetailQuantity, setProductDetailQuantity] = useState(1);
  const [selectedProductOption, setSelectedProductOption] = useState("");
  const [productDetailMediaIndex, setProductDetailMediaIndex] = useState(0);
  const [adultGateStatus, setAdultGateStatus] = useState<AdultGateStatusResponse | null>(null);
  const [adultBirthdate, setAdultBirthdate] = useState("1990-01-01");
  const [minorPurgePreview, setMinorPurgePreview] = useState<MinorPurgePreview | null>(null);
  const [uiCategoryGroups, setUiCategoryGroups] = useState<Array<{ group: string; items: string[] }>>([]);
  const [skuPolicy, setSkuPolicy] = useState<SkuPolicyResponse | null>(null);
  const [authSummary, setAuthSummary] = useState<AuthSummary | null>(null);
  const [adminDbManage, setAdminDbManage] = useState<AdminDbManage | null>(null);
  const [randomRooms, setRandomRooms] = useState<RandomRoom[]>(randomRoomSeed);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [newRoomCategory, setNewRoomCategory] = useState<Exclude<RandomRoomCategory, "전체">>("관계역할/고민");
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const [newRoomAnonymous, setNewRoomAnonymous] = useState(true);
  const [newRoomMaxPeople, setNewRoomMaxPeople] = useState("8");
  const [newRoomPassword, setNewRoomPassword] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState(() => {
    if (typeof window === "undefined") return "GUEST";
    return (window.localStorage.getItem("adultapp_demo_role") ?? "GUEST").toUpperCase();
  });
  const [selectedAskProfile, setSelectedAskProfile] = useState<AskProfile | null>(null);
  const [demoLoginProvider, setDemoLoginProvider] = useState<DemoLoginProvider>(() => {
    if (typeof window === "undefined") return "카카오";
    return (window.localStorage.getItem("adultapp_demo_login_provider") as DemoLoginProvider | null) ?? "카카오";
  });
  const [identityVerified, setIdentityVerified] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_identity_verified") === "1";
  });
  const [adultVerified, setAdultVerified] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_adult_verified") === "1";
  });
  const [groupRoomSuspendedUntil, setGroupRoomSuspendedUntil] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem("adultapp_group_room_suspended_until") ?? "0");
  });
  const [adultGateView, setAdultGateView] = useState<AdultGateView>("intro");
  const [adultFailCount, setAdultFailCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem("adultapp_adult_fail_count") ?? "0");
  });
  const [adultCooldownUntil, setAdultCooldownUntil] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem("adultapp_adult_cooldown_until") ?? "0");
  });
  const [adultPromptOpen, setAdultPromptOpen] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>("consent");
  const [signupLegalOpen, setSignupLegalOpen] = useState<string | null>(null);
  const [signupConsentModal, setSignupConsentModal] = useState<keyof SignupConsentState | null>(null);
  const [identityMethod, setIdentityMethod] = useState<"PASS" | "휴대폰" | "미완료">(() => {
    if (typeof window === "undefined") return "미완료";
    return (window.localStorage.getItem("adultapp_identity_method") as "PASS" | "휴대폰" | "미완료" | null) ?? "미완료";
  });
  const [identityVerificationToken, setIdentityVerificationToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("adultapp_identity_token") ?? "";
  });
  const [signupConsents, setSignupConsents] = useState<SignupConsentState>(() => {
    if (typeof window === "undefined") return defaultSignupConsents;
    const raw = window.localStorage.getItem("adultapp_signup_consents");
    if (!raw) return defaultSignupConsents;
    try { return { ...defaultSignupConsents, ...JSON.parse(raw) }; } catch { return defaultSignupConsents; }
  });
  const [signupForm, setSignupForm] = useState<SignupFormState>(() => {
    if (typeof window === "undefined") return defaultSignupForm;
    const raw = window.localStorage.getItem("adultapp_signup_form");
    if (!raw) return defaultSignupForm;
    try { return { ...defaultSignupForm, ...JSON.parse(raw) }; } catch { return defaultSignupForm; }
  });
  const [demoProfile, setDemoProfile] = useState<DemoProfileState>(() => {
    if (typeof window === "undefined") return defaultDemoProfile;
    const raw = window.localStorage.getItem("adultapp_demo_profile");
    if (!raw) return defaultDemoProfile;
    try { return sanitizeDemoProfileState(JSON.parse(raw)); } catch { return defaultDemoProfile; }
  });
  const [sellerVerification, setSellerVerification] = useState<SellerVerificationState>(() => {
    if (typeof window === "undefined") return defaultSellerVerification;
    const raw = window.localStorage.getItem("adultapp_seller_verification");
    if (!raw) return defaultSellerVerification;
    try { return { ...defaultSellerVerification, ...JSON.parse(raw) }; } catch { return defaultSellerVerification; }
  });
  const [productRegistrationDraft, setProductRegistrationDraft] = useState<ProductRegistrationDraft>(() => ({ category: "", name: "", imageUrls: ["", "", "", "", ""], description: "", price: "", stockQty: "", skuCode: "" }));
  const [desktopProductEditId, setDesktopProductEditId] = useState<number | null>(null);
  const [desktopProductEditorOpen, setDesktopProductEditorOpen] = useState(false);
  const [desktopProductSelectedIds, setDesktopProductSelectedIds] = useState<number[]>([]);
  const [desktopProductCrudMessage, setDesktopProductCrudMessage] = useState("");
  const [desktopProductCrudBusy, setDesktopProductCrudBusy] = useState(false);
  const [desktopOrderStageFilter, setDesktopOrderStageFilter] = useState<DesktopOrderProgressFilter>("전체");
  const [desktopOrderDatePreset, setDesktopOrderDatePreset] = useState<"오늘" | "지난7일" | "지난30일" | "사용자지정" | "전체">("전체");
  const [desktopOrderStartDate, setDesktopOrderStartDate] = useState("");
  const [desktopOrderEndDate, setDesktopOrderEndDate] = useState("");
  const [desktopOrderDeliveryFilter, setDesktopOrderDeliveryFilter] = useState<DesktopOrderDeliveryFilter>("전체");
  const [desktopOrderSearchField, setDesktopOrderSearchField] = useState<DesktopOrderSearchField>("주문번호");
  const [desktopOrderSearchInput, setDesktopOrderSearchInput] = useState("");
  const [desktopOrderSearchKeyword, setDesktopOrderSearchKeyword] = useState("");
  const [desktopOrderSelectedNos, setDesktopOrderSelectedNos] = useState<string[]>([]);
  const [desktopSettlementPeriod, setDesktopSettlementPeriod] = useState<DesktopSettlementPeriod>("월");
  const [submittedProducts, setSubmittedProducts] = useState<ProductRegistrationDraft[]>(() => []);
  const [sellerApprovalQueue, setSellerApprovalQueue] = useState<SellerApprovalItem[]>([]);
  const [productApprovalQueue, setProductApprovalQueue] = useState<ProductApprovalItem[]>([]);
  const [sellerProducts, setSellerProducts] = useState<SellerProductItem[]>([]);
  const [settlementPreview, setSettlementPreview] = useState<SettlementPreviewResponse | null>(null);
  const [paymentReviewReady, setPaymentReviewReady] = useState<PaymentReviewReadyResponse | null>(null);
  const [ledgerOverview, setLedgerOverview] = useState<LedgerOverviewResponse | null>(null);
  const [threadItems, setThreadItems] = useState<ThreadItem[]>([...threadSeed, ...archivedThreadSeed]);
  const [chatListMode, setChatListMode] = useState<"threads" | "requests">("threads");
  const [chatCreateLauncherOpen, setChatCreateLauncherOpen] = useState(false);
  const [chatDiscoveryOpen, setChatDiscoveryOpen] = useState(false);
  const [chatDiscoveryCategory, setChatDiscoveryCategory] = useState<ChatDiscoveryCategory>("최근");
  const [chatRequestItems, setChatRequestItems] = useState<ChatRequestItem[]>(incomingChatRequestSeed);
  const [selectedChatRequestId, setSelectedChatRequestId] = useState<number | null>(incomingChatRequestSeed[0]?.id ?? null);
  const [forumTopic, setForumTopic] = useState<(typeof forumStarterTopics)[number]>("제품 이야기");
  const [followingUserIds, setFollowingUserIds] = useState<number[]>([301, 303, 304]);
  const [followerUserIds] = useState<number[]>(forumStarterUsers.filter((item) => item.followsMe).map((item) => item.id));
  const [pendingDmUser, setPendingDmUser] = useState<ForumStarterUser | null>(null);
  const [dmRuleChecks, setDmRuleChecks] = useState<Record<string, boolean>>({});
  const [accountPrivate, setAccountPrivate] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_account_private") === "1";
  });
  const [profileFeedPublic, setProfileFeedPublic] = useState(true);
  const [profileShortsPublic, setProfileShortsPublic] = useState(true);
  const [profileQuestionPublic, setProfileQuestionPublic] = useState(true);
  const [profileTagPublic, setProfileTagPublic] = useState(true);
  const [profileProductPublic, setProfileProductPublic] = useState(true);
  const [headerFavorites, setHeaderFavorites] = useState<HeaderFavoriteMap>(() => {
    if (typeof window === "undefined") return defaultHeaderFavorites;
    try {
      const raw = window.localStorage.getItem("adultapp_header_favorites");
      if (!raw) return defaultHeaderFavorites;
      const parsed = JSON.parse(raw) as Partial<HeaderFavoriteMap>;
      return {
        "홈": parsed["홈"]?.length ? parsed["홈"] : defaultHeaderFavorites["홈"],
        "쇼핑": parsed["쇼핑"]?.length ? parsed["쇼핑"] : defaultHeaderFavorites["쇼핑"],
        "소통": parsed["소통"]?.length ? parsed["소통"] : defaultHeaderFavorites["소통"],
        "채팅": parsed["채팅"]?.length ? parsed["채팅"] : defaultHeaderFavorites["채팅"],
        "프로필": parsed["프로필"]?.length ? parsed["프로필"] : defaultHeaderFavorites["프로필"],
      };
    } catch {
      return defaultHeaderFavorites;
    }
  });
  const [savedFeedIds, setSavedFeedIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem("adultapp_saved_feed_ids") ?? "[]"); } catch { return []; }
  });
  const [likedFeedIds, setLikedFeedIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem("adultapp_liked_feed_ids") ?? "[]"); } catch { return []; }
  });
  const [repostedFeedIds, setRepostedFeedIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem("adultapp_reposted_feed_ids") ?? "[]"); } catch { return []; }
  });
  const [feedCommentMap, setFeedCommentMap] = useState<Record<number, FeedCommentEntry[]>>(() => {
    const fallback = Object.fromEntries(feedSeed.map((item) => [item.id, [
      { id: item.id * 100 + 1, author: "trend_user", text: `${item.title} 분위기 괜찮네요.`, meta: "방금" },
      { id: item.id * 100 + 2, author: "care_note", text: `${item.category} 기준으로 더 보고 싶어요.`, meta: "3분 전" },
    ]]));
    if (typeof window === "undefined") return fallback;
    try {
      const stored = window.localStorage.getItem("adultapp_feed_comment_map");
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  });
  const [openFeedCommentItem, setOpenFeedCommentItem] = useState<FeedItem | null>(null);
  const [customFeedItems, setCustomFeedItems] = useState<FeedItem[]>([]);
  const [feedComposeOpen, setFeedComposeOpen] = useState(false);
  const [repostMenuItem, setRepostMenuItem] = useState<FeedItem | null>(null);
  const [quoteTargetItem, setQuoteTargetItem] = useState<FeedItem | null>(null);
  const [quoteDraft, setQuoteDraft] = useState("");
  const [feedComposeLauncherOpen, setFeedComposeLauncherOpen] = useState(false);
  const [profilePhotoLauncherOpen, setProfilePhotoLauncherOpen] = useState(false);
  const [shopCreateLauncherOpen, setShopCreateLauncherOpen] = useState(false);
  const [communityCreateLauncherOpen, setCommunityCreateLauncherOpen] = useState(false);
  const [feedComposeMode, setFeedComposeMode] = useState<FeedComposeMode>("피드게시");
  const [homeFeedFilter, setHomeFeedFilter] = useState<HomeFeedFilter>("일반");
  const [feedComposeTitle, setFeedComposeTitle] = useState("");
  const [feedComposeCaption, setFeedComposeCaption] = useState("");
  const [feedComposeAttachment, setFeedComposeAttachment] = useState<FeedComposerAttachment | null>(null);
  const [feedComposeBusy, setFeedComposeBusy] = useState(false);
  const [feedComposeHelperText, setFeedComposeHelperText] = useState("최대 1개 첨부 · 영상은 최대 20초 / 30MB · 권장 MP4(H.264) 또는 WEBM");
  const [feedComposeMaptoryEnabled, setFeedComposeMaptoryEnabled] = useState(false);
  const [customStoryItems, setCustomStoryItems] = useState<StoryItem[]>([]);
  const [activeStoryViewer, setActiveStoryViewer] = useState<StoryItem | null>(null);
  const [activeMaptoryLocationId, setActiveMaptoryLocationId] = useState<number | null>(null);
  const [feedCommentDrafts, setFeedCommentDrafts] = useState<Record<number, string>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(window.localStorage.getItem("adultapp_feed_comment_drafts") ?? "{}"); } catch { return {}; }
  });
  const [feedCommentAttachments, setFeedCommentAttachments] = useState<Record<number, FeedCommentAttachment | null>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(window.localStorage.getItem("adultapp_feed_comment_attachments") ?? "{}"); } catch { return {}; }
  });
  const [feedCommentAttachmentBusyId, setFeedCommentAttachmentBusyId] = useState<number | null>(null);
  const [viewedProfileAuthor, setViewedProfileAuthor] = useState<string | null>(null);
  const [profileSection, setProfileSection] = useState<ProfileSection>("게시물");
  const [profileFollowListMode, setProfileFollowListMode] = useState<ProfileFollowListMode>(null);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileEditDraft, setProfileEditDraft] = useState<DemoProfileState>(defaultDemoProfile);
  const [profileNicknameEditUnlocked, setProfileNicknameEditUnlocked] = useState(false);
  const [followedFeedAuthors, setFollowedFeedAuthors] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["adult official", "seller studio"];
    try { return JSON.parse(window.localStorage.getItem("adultapp_followed_feed_authors") ?? '["adult official","seller studio"]'); } catch { return ["adult official", "seller studio"]; }
  });
  const [savedProductIds, setSavedProductIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem("adultapp_saved_product_ids") ?? "[]"); } catch { return []; }
  });
  const [savedTab, setSavedTab] = useState<"피드" | "쇼츠">("피드");
  const [storyMode, setStoryMode] = useState<"스토리" | "맵토리">("스토리");
  const allStoryItems = useMemo(() => [...customStoryItems, ...storySeed], [customStoryItems]);
  const [shortsVisibleCount, setShortsVisibleCount] = useState(10);
  const [profileShortsVisibleCount, setProfileShortsVisibleCount] = useState(10);
  const [homeFeedVisibleCount, setHomeFeedVisibleCount] = useState(() => {
    if (typeof window === "undefined") return HOME_FEED_BATCH_SIZE;
    const stored = readHomeFeedPersistedState();
    if (isHomeFeedStateExpired(stored)) return HOME_FEED_BATCH_SIZE;
    return Math.max(HOME_FEED_BATCH_SIZE, stored.visibleCount ?? HOME_FEED_BATCH_SIZE);
  });
  const [homeFeedHeaderHidden, setHomeFeedHeaderHidden] = useState(false);
  const [homeFeedRefreshing, setHomeFeedRefreshing] = useState(false);
  const [homeFeedPullDistance, setHomeFeedPullDistance] = useState(0);
  const [feedAvatarPreviewItem, setFeedAvatarPreviewItem] = useState<FeedItem | null>(null);
  const homeFeedScrollRef = useRef<HTMLDivElement | null>(null);
  const homeFeedResetOnNextShowRef = useRef(false);
  const lastHomeFeedScrollTopRef = useRef(0);
  const homeFeedScrollRafRef = useRef<number | null>(null);
  const homeFeedHideThresholdRef = useRef(0);
  const homeFeedShowThresholdRef = useRef(0);
  const homeFeedPullActiveRef = useRef(false);
  const homeFeedPullStartYRef = useRef<number | null>(null);
  const homeFeedViewedIdsRef = useRef<number[]>([]);
  const homeFeedRefreshUsedTemplateIdsRef = useRef<number[]>([]);
  const profileAvatarInputRef = useRef<HTMLInputElement | null>(null);
  const allFeedItems = useMemo(() => [...customFeedItems, ...feedSeed].map((item) => normalizeFeedItemPresentation(item)), [customFeedItems]);
  const [shortsMoreItem, setShortsMoreItem] = useState<FeedItem | null>(null);
  const [shortsViewerItemId, setShortsViewerItemId] = useState<number | null>(null);
  const [savedShortsViewerItemId, setSavedShortsViewerItemId] = useState<number | null>(null);
  const [shortsHeaderHidden, setShortsHeaderHidden] = useState(false);
  const [shortsCategoryVisible, setShortsCategoryVisible] = useState(true);
  const [listEndToast, setListEndToast] = useState<string | null>(null);
  const [selectedShortsCategory, setSelectedShortsCategory] = useState("전체");
  const lastShortsScrollTopRef = useRef(0);
  const shortsScrollRafRef = useRef<number | null>(null);
  const shortsHideThresholdRef = useRef(0);
  const shortsShowThresholdRef = useRef(0);
  const listEndToastTimerRef = useRef<number | null>(null);
  const [authStandaloneScreen, setAuthStandaloneScreen] = useState<AuthStandaloneScreen | null>(null);
  const [homeShopConsentGuideSeen, setHomeShopConsentGuideSeen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_home_shop_consent_guide_seen") === "1";
  });
  const [authEmail, setAuthEmail] = useState("customer@example.com");
  const [authPassword, setAuthPassword] = useState("customer1234");
  const [authMessage, setAuthMessage] = useState("");
  const [authGatePopupOpen, setAuthGatePopupOpen] = useState(false);
  const [apiProductsRaw, setApiProducts] = useState<ApiProduct[] | null>([]);
  const apiProducts = Array.isArray(apiProductsRaw) ? apiProductsRaw : [];
  const [cartItems, setCartItems] = useState<Array<{ productId: number; qty: number }>>([]);
  const [ordersRaw, setOrders] = useState<ApiOrder[] | null>([]);
  const orders = Array.isArray(ordersRaw) ? ordersRaw : [];
  const [selectedOrderNo, setSelectedOrderNo] = useState("");
  const [orderDetail, setOrderDetail] = useState<ApiOrderDetail | null>(null);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderActionAmount, setOrderActionAmount] = useState("5500");
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>("cart");
  const [checkoutDraft, setCheckoutDraft] = useState({
    recipientName: "성인회원",
    phone: "010-0000-0000",
    email: "aksqhqkqh153@gmail.com",
    address: "배송지 입력 필요",
    requestNote: "익명 포장 요청",
  });

  const applyApiProducts = useCallback((rows: ApiProduct[] | null | undefined) => {
    setApiProducts(Array.isArray(rows) ? rows : []);
  }, []);
  const applyOrders = useCallback((rows: ApiOrder[] | null | undefined) => {
    setOrders(Array.isArray(rows) ? rows : []);
  }, []);
  const applySellerProducts = useCallback((rows: SellerProductItem[] | null | undefined) => {
    setSellerProducts(Array.isArray(rows) ? rows : []);
  }, []);

  const isAdmin = ["ADMIN", "1", "GRADE_1"].includes(currentUserRole);
  const refreshAdminLegalDocuments = useCallback(() => {
    getJson<AdminLegalDocumentsResponse>("/admin/legal-documents").then(setAdminLegalDocuments).catch(() => null);
  }, []);
  const companyMailHostLocked = useMemo(() => isCompanyMailHostLocked(), []);
  const [companyMailPreviewOpen, setCompanyMailPreviewOpen] = useState(() => isCompanyMailRouteActive());
  const companyMailMode = companyMailHostLocked || companyMailPreviewOpen;
  const companyMailHostLabel = useMemo(() => {
    if (typeof window === "undefined") return "숨김 경로 미리보기";
    const host = window.location.host;
    const path = window.location.pathname;
    return `${host}${path === "/" ? "" : path}`;
  }, [companyMailMode]);

  const persistHomeFeedState = useCallback((patch: Partial<HomeFeedPersistedState> = {}) => {
    if (typeof window === "undefined") return;
    const previous = readHomeFeedPersistedState();
    const nextState: HomeFeedPersistedState = {
      ...previous,
      visibleCount: patch.visibleCount ?? homeFeedVisibleCount,
      scrollTop: patch.scrollTop ?? homeFeedScrollRef.current?.scrollTop ?? previous.scrollTop ?? 0,
      lastInactiveAt: patch.lastInactiveAt ?? previous.lastInactiveAt ?? 0,
    };
    window.localStorage.setItem(HOME_FEED_STATE_KEY, JSON.stringify(nextState));
  }, [homeFeedVisibleCount]);
  const navigationHistoryRef = useRef<AppNavigationSnapshot[]>([]);
  const navigationSnapshotRef = useRef<AppNavigationSnapshot | null>(null);
  const navigationRestoreRef = useRef(false);
  const browserHistoryReadyRef = useRef(false);
  const browserHistoryIndexRef = useRef(0);
  const suppressBrowserHistoryPushRef = useRef(false);
  const backMinimizeTimerRef = useRef<number | null>(null);
  const lastBackPressAtRef = useRef(0);
  const [backMinimizeHintVisible, setBackMinimizeHintVisible] = useState(false);
  const effectiveProductDetail = productDetail ?? null;
  const effectiveSelectedProductId = effectiveProductDetail ? selectedProductId : null;
  const currentNavigationSnapshot = useMemo<AppNavigationSnapshot>(() => ({
    activeTab,
    homeTab,
    shoppingTab,
    communityTab,
    chatTab,
    profileTab,
    settingsCategory,
    overlayMode,
    notificationView,
    activeRandomRoomId,
    randomEntryTab,
    roomModalOpen,
    selectedAskProfile,
    productDetail: effectiveProductDetail,
    selectedProductId: effectiveSelectedProductId,
    openFeedCommentItem,
    feedComposeOpen,
    viewedProfileAuthor,
    profileSection,
    authStandaloneScreen,
    adultPromptOpen,
    checkoutStage,
    companyMailPreviewOpen,
    randomSettingsOpen,
    shortsMoreItem,
    shortsViewerItemId,
    savedShortsViewerItemId,
    savedTab,
  }), [
    activeTab,
    homeTab,
    shoppingTab,
    communityTab,
    chatTab,
    profileTab,
    settingsCategory,
    overlayMode,
    notificationView,
    activeRandomRoomId,
    randomEntryTab,
    roomModalOpen,
    selectedAskProfile,
    effectiveProductDetail,
    effectiveSelectedProductId,
    openFeedCommentItem,
    feedComposeOpen,
    viewedProfileAuthor,
    profileSection,
    authStandaloneScreen,
    adultPromptOpen,
    checkoutStage,
    companyMailPreviewOpen,
    randomSettingsOpen,
    shortsMoreItem,
    shortsViewerItemId,
    savedShortsViewerItemId,
    savedTab,
  ]);
  const hideBackMinimizeHint = useCallback(() => {
    if (typeof window !== "undefined" && backMinimizeTimerRef.current !== null) {
      window.clearTimeout(backMinimizeTimerRef.current);
      backMinimizeTimerRef.current = null;
    }
    setBackMinimizeHintVisible(false);
  }, []);
  const showBackMinimizeHint = useCallback(() => {
    hideBackMinimizeHint();
    lastBackPressAtRef.current = Date.now();
    setBackMinimizeHintVisible(true);
    if (typeof window !== "undefined") {
      backMinimizeTimerRef.current = window.setTimeout(() => {
        setBackMinimizeHintVisible(false);
        backMinimizeTimerRef.current = null;
      }, APP_BACK_MINIMIZE_WINDOW_MS);
    }
  }, [hideBackMinimizeHint]);
  const isHomeNavigationSnapshot = useCallback((snapshot: AppNavigationSnapshot) => (
    snapshot.activeTab === "홈"
    && snapshot.homeTab === "피드"
    && snapshot.overlayMode === null
    && snapshot.notificationView.view === "list"
    && snapshot.notificationView.section === null
    && snapshot.notificationView.item === null
    && !snapshot.roomModalOpen
    && !snapshot.selectedAskProfile
    && !snapshot.productDetail
    && snapshot.selectedProductId === null
    && !snapshot.openFeedCommentItem
    && !snapshot.feedComposeOpen
    && snapshot.authStandaloneScreen === null
    && !snapshot.adultPromptOpen
    && snapshot.checkoutStage === "cart"
    && !snapshot.companyMailPreviewOpen
    && !snapshot.randomSettingsOpen
    && !snapshot.shortsMoreItem
    && snapshot.shortsViewerItemId === null
    && snapshot.savedShortsViewerItemId === null
  ), []);
  const homeNavigationSnapshot = useMemo<AppNavigationSnapshot>(() => ({
    activeTab: "홈",
    homeTab: "피드",
    shoppingTab: "홈",
    communityTab: "커뮤",
    chatTab: "채팅",
    profileTab: "내정보",
    settingsCategory: "일반",
    overlayMode: null,
    notificationView: { view: "list", section: null, item: null },
    activeRandomRoomId: null,
    randomEntryTab: "시작",
    roomModalOpen: false,
    selectedAskProfile: null,
    productDetail: null,
    selectedProductId: null,
    openFeedCommentItem: null,
    feedComposeOpen: false,
    viewedProfileAuthor: null,
    profileSection: "게시물",
    authStandaloneScreen: null,
    adultPromptOpen: false,
    checkoutStage: "cart",
    companyMailPreviewOpen: false,
    randomSettingsOpen: false,
    shortsMoreItem: null,
    shortsViewerItemId: null,
    savedShortsViewerItemId: null,
    savedTab: "피드",
  }), []);
  const isAtHomeScreen = useMemo(() => isHomeNavigationSnapshot(currentNavigationSnapshot), [currentNavigationSnapshot, isHomeNavigationSnapshot]);
  const shouldManageMobileBrowserBack = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (window.Capacitor?.isNativePlatform?.()) return true;
    if (windowWidth >= 1180) return false;
    const userAgent = window.navigator?.userAgent ?? "";
    return /Android|iPhone|iPad|iPod/i.test(userAgent);
  }, [windowWidth]);
  const restoreNavigationSnapshot = useCallback((snapshot: AppNavigationSnapshot) => {
    navigationRestoreRef.current = true;
    suppressBrowserHistoryPushRef.current = true;
    hideBackMinimizeHint();
    lastBackPressAtRef.current = 0;
    setActiveTab(snapshot.activeTab);
    setHomeTab(snapshot.homeTab);
    setShoppingTab(snapshot.shoppingTab);
    setCommunityTab(snapshot.communityTab);
    setChatTab(snapshot.chatTab);
    setProfileTab(snapshot.profileTab);
    setSettingsCategory(snapshot.settingsCategory);
    setOverlayMode(snapshot.overlayMode);
    setNotificationView(JSON.parse(JSON.stringify(snapshot.notificationView)) as AppNavigationSnapshot["notificationView"]);
    setActiveRandomRoomId(snapshot.activeRandomRoomId);
    setRandomEntryTab(snapshot.randomEntryTab);
    setRoomModalOpen(snapshot.roomModalOpen);
    setSelectedAskProfile(snapshot.selectedAskProfile);
    setProductDetail(snapshot.productDetail);
    setSelectedProductId(snapshot.selectedProductId);
    setOpenFeedCommentItem(snapshot.openFeedCommentItem);
    setFeedComposeOpen(snapshot.feedComposeOpen);
    setViewedProfileAuthor(snapshot.viewedProfileAuthor);
    setProfileSection(snapshot.profileSection);
    setAuthStandaloneScreen(snapshot.authStandaloneScreen);
    setAdultPromptOpen(snapshot.adultPromptOpen);
    setCheckoutStage(snapshot.checkoutStage);
    setCompanyMailPreviewOpen(snapshot.companyMailPreviewOpen);
    setRandomSettingsOpen(snapshot.randomSettingsOpen);
    setShortsMoreItem(snapshot.shortsMoreItem);
    setShortsViewerItemId(snapshot.shortsViewerItemId);
    setSavedShortsViewerItemId(snapshot.savedShortsViewerItemId);
    setSavedTab(snapshot.savedTab);
    if (typeof window !== "undefined") {
      if (snapshot.companyMailPreviewOpen && window.location.hash.toLowerCase() !== "#corp-mail-admin") {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#corp-mail-admin`);
      }
      if (!snapshot.companyMailPreviewOpen && window.location.hash.toLowerCase() === "#corp-mail-admin") {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      }
    }
  }, [hideBackMinimizeHint]);
  const syncBrowserBackBarrier = useCallback((mode: "replace" | "push" = "push") => {
    if (typeof window === "undefined" || !shouldManageMobileBrowserBack) return;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const previousState = window.history.state && typeof window.history.state === "object" ? window.history.state : {};
    const nextIndex = mode === "replace" ? browserHistoryIndexRef.current : browserHistoryIndexRef.current + 1;
    browserHistoryIndexRef.current = nextIndex;
    const nextState = {
      ...previousState,
      [APP_BROWSER_HISTORY_STATE_KEY]: nextIndex,
    };
    if (mode === "replace") {
      window.history.replaceState(nextState, "", currentUrl);
      return;
    }
    window.history.pushState(nextState, "", currentUrl);
  }, [shouldManageMobileBrowserBack]);
  const handleAppBackNavigation = useCallback(async (source: "native" | "history" = "native") => {
    if (!authBootstrapDone) return;
    const previousSnapshot = navigationHistoryRef.current.pop();
    if (previousSnapshot) {
      restoreNavigationSnapshot(previousSnapshot);
      return;
    }
    if (!isAtHomeScreen) {
      restoreNavigationSnapshot(homeNavigationSnapshot);
      return;
    }
    const now = Date.now();
    if (now - lastBackPressAtRef.current <= APP_BACK_MINIMIZE_WINDOW_MS) {
      hideBackMinimizeHint();
      lastBackPressAtRef.current = 0;
      try {
        const nativeAppPlugin = getNativeAppPlugin();
        if (nativeAppPlugin?.minimizeApp) {
          await nativeAppPlugin.minimizeApp();
          return;
        }
      } catch {}
      if (source === "history" && typeof window !== "undefined") {
        window.history.back();
      }
      return;
    }
    showBackMinimizeHint();
    if (source === "history") {
      syncBrowserBackBarrier("push");
    }
  }, [authBootstrapDone, hideBackMinimizeHint, homeNavigationSnapshot, isAtHomeScreen, restoreNavigationSnapshot, showBackMinimizeHint, syncBrowserBackBarrier]);
  const canToggleAccountMode = !isAdmin && currentUserRole !== "GUEST";
  const isBusinessAccountMode = currentUserRole === "SELLER";
  const accountModeToggleLabel = isBusinessAccountMode ? "일반회원 계정전환" : "사업자 계정전환";
  const handleAccountModeToggle = () => {
    if (!canToggleAccountMode) return;
    const nextRole = isBusinessAccountMode ? "MEMBER" : "SELLER";
    setCurrentUserRole(nextRole);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("adultapp_demo_role", nextRole);
    }
  };

  const productCategoryOptions = useMemo(() => {
    const backendCategories = uiCategoryGroups.flatMap((group) => group.items).filter((item) => !["상품등록", "사진/영상 첨부", "SKU 관리", "재고/상태 변경"].includes(item));
    const fallbackCategories = shopCategories.flatMap((group) => group.items.map((item) => item.name));
    return [...new Set([...(backendCategories.length ? backendCategories : fallbackCategories).filter(Boolean), "채팅-이모티콘"])] as string[];
  }, [uiCategoryGroups]);
  const createEmptyProductDraft = useCallback((): ProductRegistrationDraft => ({
    category: "",
    name: "",
    imageUrls: ["", "", "", "", ""],
    description: "",
    price: "",
    stockQty: "",
    skuCode: "",
  }), []);
  const isProductCategorySelected = Boolean(productRegistrationDraft.category.trim());
  const isChatEmoticonCategory = productRegistrationDraft.category === "채팅-이모티콘";
  const productImageInputMeta = isChatEmoticonCategory
    ? [
        { label: "대표 이모티콘 이미지", placeholder: "대표 이모티콘 이미지 URL 입력" },
        { label: "미리보기 이미지 1", placeholder: "미리보기 이미지 1 URL 입력" },
        { label: "미리보기 이미지 2", placeholder: "미리보기 이미지 2 URL 입력" },
      ]
    : [
        { label: "대표 이미지", placeholder: "대표 이미지 URL 입력" },
        { label: "추가 이미지 1", placeholder: "추가 이미지 1 URL 입력" },
        { label: "추가 이미지 2", placeholder: "추가 이미지 2 URL 입력" },
        { label: "추가 이미지 3", placeholder: "추가 이미지 3 URL 입력" },
        { label: "추가 이미지 4", placeholder: "추가 이미지 4 URL 입력" },
      ];
  const productCategorySelectRef = useRef<HTMLSelectElement | null>(null);
  const showProductCategoryRequiredAlert = useCallback(() => {
    window.alert('카테고리 선택을 먼저 진행해주세요');
    window.setTimeout(() => {
      productCategorySelectRef.current?.focus();
    }, 0);
  }, []);
  const guardProductCategoryRequiredInteraction = useCallback((event?: { preventDefault?: () => void }) => {
    if (isProductCategorySelected) {
      return false;
    }
    event?.preventDefault?.();
    showProductCategoryRequiredAlert();
    return true;
  }, [isProductCategorySelected, showProductCategoryRequiredAlert]);
  const handleProductCategoryChange = (nextCategory: string) => {
    setProductRegistrationDraft((prev) => ({ ...prev, category: nextCategory }));
  };
  const handleProductNameChange = (nextName: string) => {
    setProductRegistrationDraft((prev) => ({ ...prev, name: nextName.slice(0, 29) }));
  };
  const handleProductDescriptionChange = (nextDescription: string) => {
    setProductRegistrationDraft((prev) => ({ ...prev, description: nextDescription }));
  };
  const handleProductPriceChange = (nextPrice: string) => {
    setProductRegistrationDraft((prev) => ({ ...prev, price: nextPrice.replace(/[^0-9]/g, "") }));
  };
  const handleProductStockQtyChange = (nextStockQty: string) => {
    setProductRegistrationDraft((prev) => ({ ...prev, stockQty: nextStockQty.replace(/[^0-9]/g, "").slice(0, 4) }));
  };
  const handleProductSkuCodeChange = (nextSkuCode: string) => {
    setProductRegistrationDraft((prev) => ({ ...prev, skuCode: nextSkuCode }));
  };
  useEffect(() => {
    setDesktopProductSelectedIds((prev) => prev.filter((id) => sellerProducts.some((item) => item.id === id)));
  }, [sellerProducts]);
  const mutualFollowIds = useMemo(() => followingUserIds.filter((id) => followerUserIds.includes(id)), [followingUserIds, followerUserIds]);
  const forumVisibleUsers = useMemo(() => forumStarterUsers.filter((item) => item.topic === forumTopic), [forumTopic]);

  const toggleFollowUser = (userId: number) => {
    setFollowingUserIds((prev) => prev.includes(userId) ? prev.filter((item) => item !== userId) : [...prev, userId]);
  };
  const boostShortsSignalsFromText = (source: string, weight = 1) => {
    const tokens = extractInterestTokens(source);
    if (!tokens.length) return;
    setShortsKeywordSignals((prev) => {
      const next = { ...prev };
      tokens.forEach((token) => {
        next[token] = (next[token] ?? 0) + weight;
      });
      return next;
    });
  };

  const openShortsViewer = (item: FeedItem) => {
    boostShortsSignalsFromText(`${item.title} ${item.caption} ${item.category} ${item.author}`, 2);
    setShortsViewerItemId(item.id);
  };


  const openDmRequest = (user: ForumStarterUser) => {
    if (!adultVerified) {
      setAdultPromptOpen(true);
      return;
    }
    if (!mutualFollowIds.includes(user.id)) {
      window.alert("상호 팔로우(팔로잉/팔로우) 상태에서만 1:1 요청이 가능합니다.");
      return;
    }
    setDmRuleChecks(Object.fromEntries(dmRuleNoticeItems.map((item) => [item, false])));
    setPendingDmUser(user);
  };

  const submitDmRequest = () => {
    if (!pendingDmUser) return;
    const allChecked = dmRuleNoticeItems.every((item) => dmRuleChecks[item]);
    if (!allChecked) {
      window.alert("대화 규칙 동의를 모두 체크해야 요청할 수 있습니다.");
      return;
    }
    const existing = threadItems.find((item) => item.name === pendingDmUser.name && item.kind === "개인");
    if (!existing) {
      const newThread: ThreadItem = {
        id: Date.now(),
        name: pendingDmUser.name,
        purpose: `${pendingDmUser.topic} · 상호수락 1:1`,
        preview: `대화 요청이 전송되었습니다. 상대 수락 후 대화가 시작되며, 채팅방 상단에 ${dmRuleNoticeItems.slice(1).join(' · ')} 안내가 고정 표시됩니다.`,
        time: "방금",
        unread: 0,
        avatar: pendingDmUser.name.slice(0,1).toUpperCase(),
        kind: "개인",
        favorite: true,
        status: "요청전송",
      };
      setThreadItems((prev) => [newThread, ...prev]);
      setChatMessagesByThread((prev) => ({ ...prev, [newThread.id]: createThreadRoomSeed(newThread) }));
      setActiveChatThreadId(newThread.id);
    } else {
      setActiveChatThreadId(existing.id);
    }
    setPendingDmUser(null);
    setChatTab("채팅");
    setChatCategory("개인");
  };

  useEffect(() => {
    getJson<ProjectStatus>("/project-status").then(setProjectStatus).catch(() => null);
    getJson<DeployGuide>("/deploy/cloudflare-pages-manual").then(setDeployGuide).catch(() => null);
    getJson<LegalDocumentsResponse>("/legal/documents").then(setLegalDocuments).catch(() => null);
    getJson<BusinessInfoResponse>("/legal/business-info").then(setBusinessInfo).catch(() => null);
    getJson<PaymentProviderStatusResponse>("/payments/provider-status").then(setPaymentProviderStatus).catch(() => null);
    getJson<UiCategoryGroupResponse>("/ui/category-groups").then((res) => setUiCategoryGroups(res.items ?? [])).catch(() => null);
    getJson<SkuPolicyResponse>("/sku-policy").then(setSkuPolicy).catch(() => null);
    getJson<ApiProduct[]>("/products").then(applyApiProducts).catch(() => applyApiProducts([]));

    (async () => {
      try {
        const restored = hasAuthToken() || await ensureAuthSession();
        if (!restored) {
          setAuthSummary(null);
          setCurrentUserRole("GUEST");
          if (typeof window !== "undefined") window.localStorage.setItem("adultapp_demo_role", "GUEST");
          setOrders([]);
          setSellerProducts([]);
          return;
        }

        const me = await getJson<AuthMeResponse>("/auth/me");
        setAuthSummary(me);
        const nextRole = String(me.grade ?? "GUEST").toUpperCase();
        setCurrentUserRole(nextRole);
        if (typeof window !== "undefined") window.localStorage.setItem("adultapp_demo_role", nextRole);
        setIdentityVerified(Boolean(me.identity_verified));
        setAdultVerified(Boolean(me.adult_verified));
        getJson<ApiOrder[]>("/orders").then(applyOrders).catch(() => applyOrders([]));
        getJson<SellerProductItem[]>("/seller/products/mine").then(applySellerProducts).catch(() => applySellerProducts([]));
        getJson<SellerVerificationStatusResponse>("/seller/me/verification-status").then((res) => {
          setSellerVerification((prev) => ({ ...prev, status: res.eligible_for_product_registration ? "approved" : (res.seller_onboarding_status === "pending" ? "pending" : prev.status) }));
        }).catch(() => null);
        if (["ADMIN", "1", "GRADE_1"].includes(nextRole)) {
          getJson<MinorPurgePreview>("/ops/minor-purge/preview").then(setMinorPurgePreview).catch(() => null);
          getJson<{ items: SellerApprovalItem[] }>("/admin/seller-approvals").then((res) => setSellerApprovalQueue(res.items ?? [])).catch(() => null);
          getJson<{ items: ProductApprovalItem[] }>("/admin/product-approvals").then((res) => setProductApprovalQueue(res.items ?? [])).catch(() => null);
          getJson<SettlementPreviewResponse>("/settlements/preview").then(setSettlementPreview).catch(() => null);
          getJson<PaymentReviewReadyResponse>("/payments/review-ready").then(setPaymentReviewReady).catch(() => null);
          getJson<LedgerOverviewResponse>("/ledger/overview").then(setLedgerOverview).catch(() => null);
          refreshAdminLegalDocuments();
        } else {
          setReleaseReadiness(null);
        }
      } catch {
        clearTokens();
        setAuthSummary(null);
        setCurrentUserRole("GUEST");
        if (typeof window !== "undefined") window.localStorage.setItem("adultapp_demo_role", "GUEST");
        setOrders([]);
        setSellerProducts([]);
      } finally {
        setAuthBootstrapDone(true);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setRandomNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_html_inspector_enabled", htmlInspectorEnabled ? "1" : "0");
  }, [htmlInspectorEnabled]);

  useEffect(() => {
    if (!htmlInspectorEnabled && inspectedTargetRef.current) {
      inspectedTargetRef.current.classList.remove("html-inspector-target");
      inspectedTargetRef.current = null;
      setInspectedElement(null);
    }
  }, [htmlInspectorEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_demo_login_provider", demoLoginProvider);
  }, [demoLoginProvider]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_identity_verified", identityVerified ? "1" : "0");
  }, [identityVerified]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_adult_verified", adultVerified ? "1" : "0");
  }, [adultVerified]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_adult_fail_count", String(adultFailCount));
  }, [adultFailCount]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_adult_cooldown_until", String(adultCooldownUntil));
  }, [adultCooldownUntil]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_identity_method", identityMethod);
  }, [identityMethod]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_identity_token", identityVerificationToken);
  }, [identityVerificationToken]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_signup_consents", JSON.stringify(signupConsents));
  }, [signupConsents]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_signup_form", JSON.stringify(signupForm));
  }, [signupForm]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_demo_profile", JSON.stringify(demoProfile));
  }, [demoProfile]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_seller_verification", JSON.stringify(sellerVerification));
  }, [sellerVerification]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_account_private", accountPrivate ? "1" : "0");
  }, [accountPrivate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_home_shop_consent_guide_seen", homeShopConsentGuideSeen ? "1" : "0");
  }, [homeShopConsentGuideSeen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_shop_keyword_signals", JSON.stringify(shopKeywordSignals));
  }, [shopKeywordSignals]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_shorts_keyword_signals", JSON.stringify(shortsKeywordSignals));
  }, [shortsKeywordSignals]);

  const lastTrackedShopSearchRef = useRef("");
  useEffect(() => {
    if (activeTab !== "쇼핑") return;
    const raw = `${shopKeyword} ${globalKeyword}`.trim();
    if (!raw) return;
    const normalized = raw
      .split(/[,#\s/]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2)
      .join("|")
      .toLowerCase();
    if (!normalized || lastTrackedShopSearchRef.current === normalized) return;
    lastTrackedShopSearchRef.current = normalized;
    setShopKeywordSignals((prev) => {
      const next = { ...prev };
      normalized.split("|").forEach((token) => {
        next[token] = (next[token] ?? 0) + 1;
      });
      return next;
    });
  }, [activeTab, shopKeyword, globalKeyword]);

  const lastTrackedShortsSearchRef = useRef("");
  useEffect(() => {
    if (activeTab !== "홈" || homeTab !== "쇼츠") return;
    const normalized = globalKeyword
      .split(/[,#\s/]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2)
      .join("|")
      .toLowerCase();
    if (!normalized || lastTrackedShortsSearchRef.current === normalized) return;
    lastTrackedShortsSearchRef.current = normalized;
    setShortsKeywordSignals((prev) => {
      const next = { ...prev };
      normalized.split("|").forEach((token) => {
        next[token] = (next[token] ?? 0) + 3;
      });
      return next;
    });
  }, [activeTab, homeTab, globalKeyword]);

  useEffect(() => {
    if (!savedFeedIds.length) return;
    const savedShorts = allFeedItems.filter((item) => savedFeedIds.includes(item.id));
    if (!savedShorts.length) return;
    setShortsKeywordSignals((prev) => {
      const next = { ...prev };
      savedShorts.forEach((item) => {
        extractInterestTokens(`${item.title} ${item.caption} ${item.category} ${item.author}`).forEach((token) => {
          next[token] = Math.max(next[token] ?? 0, 2);
        });
      });
      return next;
    });
  }, [savedFeedIds]);
  useEffect(() => {
    if (!selectedOrderNo) return;
    getJson<ApiOrderDetail>(`/orders/${selectedOrderNo}`).then(setOrderDetail).catch(() => setOrderDetail(null));
  }, [selectedOrderNo]);


  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_header_favorites", JSON.stringify(headerFavorites));
  }, [headerFavorites]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_saved_feed_ids", JSON.stringify(savedFeedIds));
  }, [savedFeedIds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_liked_feed_ids", JSON.stringify(likedFeedIds));
  }, [likedFeedIds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_reposted_feed_ids", JSON.stringify(repostedFeedIds));
  }, [repostedFeedIds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_feed_comment_map", JSON.stringify(feedCommentMap));
  }, [feedCommentMap]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_feed_comment_drafts", JSON.stringify(feedCommentDrafts));
  }, [feedCommentDrafts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_feed_comment_attachments", JSON.stringify(feedCommentAttachments));
  }, [feedCommentAttachments]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_notification_items", JSON.stringify(notificationItems));
  }, [notificationItems]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateNotificationPageSize = () => {
      const estimatedRows = Math.floor((window.innerHeight - 220) / 42);
      setNotificationSectionPageSize(Math.max(6, Math.min(12, estimatedRows || 8)));
    };
    updateNotificationPageSize();
    window.addEventListener("resize", updateNotificationPageSize);
    return () => window.removeEventListener("resize", updateNotificationPageSize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_saved_product_ids", JSON.stringify(savedProductIds));
  }, [savedProductIds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_group_room_suspended_until", String(groupRoomSuspendedUntil));
  }, [groupRoomSuspendedUntil]);

  useEffect(() => {
    setRandomRooms((prev) => prev.map((room) => {
      if (room.kind !== "random_1to1" || room.status === "ended" || !room.expiresAt) return room;
      if (room.expiresAt > randomNow) return room;
      return { ...room, status: "ended", endedAt: room.expiresAt, latestMessage: "채팅방 유지시간 20분이 종료되어 최근 종료 목록으로 이동했습니다." };
    }));
  }, [randomNow]);

  const randomRoomRemainMinutes = (room: RandomRoom) => {
    if (!room.expiresAt) return null;
    return Math.max(0, Math.ceil((room.expiresAt - randomNow) / 60000));
  };

  const randomRoomAlertLabel = (room: RandomRoom) => {
    const remain = randomRoomRemainMinutes(room);
    if (room.status === "ended") return "최근 종료";
    if (remain === null) return null;
    if (remain <= 1) return "1분 전 종료 알림";
    if (remain <= 3) return "3분 전 종료 알림";
    return null;
  };

  const activeRandomRoom = useMemo(() => randomRooms.find((room) => room.id === activeRandomRoomId) ?? null, [activeRandomRoomId, randomRooms]);
  const groupRoomSuspendedRemainMinutes = groupRoomSuspendedUntil > Date.now() ? Math.ceil((groupRoomSuspendedUntil - Date.now()) / 60000) : 0;

  const visibleRandomMatchRooms = useMemo(() => randomRooms
    .filter((room) => room.kind === "random_1to1")
    .sort((a, b) => {
      if ((a.status ?? "active") !== (b.status ?? "active")) return (a.status ?? "active") === "active" ? -1 : 1;
      const aTime = a.status === "ended" ? (a.endedAt ?? 0) : (a.expiresAt ?? 0);
      const bTime = b.status === "ended" ? (b.endedAt ?? 0) : (b.expiresAt ?? 0);
      return bTime - aTime;
    }), [randomRooms]);

  const toggleSavedFeed = (feedId: number) => {
    setSavedFeedIds((prev) => prev.includes(feedId) ? prev.filter((item) => item !== feedId) : [feedId, ...prev]);
  };

  const toggleLikedFeed = (feedId: number) => {
    setLikedFeedIds((prev) => prev.includes(feedId) ? prev.filter((item) => item !== feedId) : [feedId, ...prev]);
  };

  const toggleRepostedFeed = (item: FeedItem) => {
    setRepostMenuItem(item);
  };

  const createRepostFeed = (item: FeedItem) => {
    setRepostedFeedIds((prev) => prev.includes(item.id) ? prev : [item.id, ...prev]);
    setCustomFeedItems((prev) => [{
      ...item,
      id: Date.now(),
      repostLabel: "재게시물",
      postedAt: new Date().toISOString(),
      reposts: (item.reposts ?? 0) + 1,
    }, ...prev]);
    setRepostMenuItem(null);
    setHomeTab("피드");
    setHomeFeedFilter("일반");
  };

  const openQuoteComposer = (item: FeedItem) => {
    setQuoteTargetItem(item);
    setQuoteDraft("");
    setRepostMenuItem(null);
  };

  const submitQuoteFeed = () => {
    if (!quoteTargetItem) return;
    const trimmed = quoteDraft.trim();
    if (!trimmed) {
      window.alert("인용 내용을 입력하세요.");
      return;
    }
    setRepostedFeedIds((prev) => prev.includes(quoteTargetItem.id) ? prev : [quoteTargetItem.id, ...prev]);
    setCustomFeedItems((prev) => [{
      ...quoteTargetItem,
      id: Date.now(),
      title: `인용: ${quoteTargetItem.title}`,
      caption: "",
      quoteText: trimmed,
      quotedFeed: { id: quoteTargetItem.id, author: quoteTargetItem.author, caption: quoteTargetItem.caption, title: quoteTargetItem.title },
      repostLabel: "인용 게시물",
      postedAt: new Date().toISOString(),
      reposts: (quoteTargetItem.reposts ?? 0) + 1,
    }, ...prev]);
    setQuoteTargetItem(null);
    setQuoteDraft("");
    setHomeTab("피드");
    setHomeFeedFilter("일반");
  };

  const openFeedComments = (item: FeedItem) => {
    setOpenFeedCommentItem(item);
  };

  const closeFeedComments = () => {
    setOpenFeedCommentItem(null);
  };

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("이미지 변환에 실패했습니다."));
    reader.onerror = () => reject(reader.error ?? new Error("이미지 변환에 실패했습니다."));
    reader.readAsDataURL(file);
  });

  const loadImageElement = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
    image.src = src;
  });

  const optimizeFeedCommentImage = async (file: File): Promise<FeedCommentAttachment> => {
    const maxBytes = 10 * 1024 * 1024;
    if (file.size <= maxBytes) {
      return { name: file.name, dataUrl: await fileToDataUrl(file), size: file.size, type: file.type || "image/jpeg" };
    }
    const sourceUrl = await fileToDataUrl(file);
    const image = await loadImageElement(sourceUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d");
    if (!context) return { name: file.name, dataUrl: sourceUrl, size: file.size, type: file.type || "image/jpeg" };
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const targetTypes = ["image/webp", "image/jpeg"];
    for (const targetType of targetTypes) {
      for (const quality of [0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72]) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, targetType, quality));
        if (!blob) continue;
        if (blob.size <= maxBytes) {
          const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, targetType === "image/webp" ? ".webp" : ".jpg"), { type: targetType });
          return { name: optimizedFile.name, dataUrl: await fileToDataUrl(optimizedFile), size: blob.size, type: targetType };
        }
      }
    }
    return { name: file.name, dataUrl: sourceUrl, size: file.size, type: file.type || "image/jpeg" };
  };

  const attachFeedCommentImage = async (feedId: number, file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("이미지 파일만 첨부할 수 있습니다.");
      return;
    }
    setFeedCommentAttachmentBusyId(feedId);
    try {
      const optimized = await optimizeFeedCommentImage(file);
      setFeedCommentAttachments((prev) => ({ ...prev, [feedId]: optimized }));
    } catch {
      window.alert("이미지를 처리하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setFeedCommentAttachmentBusyId((current) => current === feedId ? null : current);
    }
  };

  const getVideoMetadata = (file: File) => new Promise<{ durationSec: number; width: number; height: number }>((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    video.preload = "metadata";
    video.playsInline = true;
    video.muted = true;
    video.onloadedmetadata = () => {
      const durationSec = Number.isFinite(video.duration) ? video.duration : 0;
      const width = video.videoWidth || 0;
      const height = video.videoHeight || 0;
      URL.revokeObjectURL(objectUrl);
      resolve({ durationSec, width, height });
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("비디오 메타데이터를 불러오지 못했습니다."));
    };
    video.src = objectUrl;
  });

  const optimizeFeedComposeImage = async (file: File): Promise<FeedComposerAttachment> => {
    const maxBytes = 10 * 1024 * 1024;
    if (file.size <= maxBytes) {
      return {
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        size: file.size,
        type: file.type || "image/jpeg",
        optimized: false,
      };
    }
    const sourceUrl = await fileToDataUrl(file);
    const image = await loadImageElement(sourceUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d");
    if (!context) {
      return { name: file.name, previewUrl: URL.createObjectURL(file), size: file.size, type: file.type || "image/jpeg", optimized: false };
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const targetTypes = ["image/webp", "image/jpeg"];
    for (const targetType of targetTypes) {
      for (const quality of [0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72]) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, targetType, quality));
        if (!blob) continue;
        if (blob.size <= maxBytes) {
          const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, targetType === "image/webp" ? ".webp" : ".jpg"), { type: targetType });
          return {
            name: optimizedFile.name,
            previewUrl: URL.createObjectURL(optimizedFile),
            size: optimizedFile.size,
            type: optimizedFile.type,
            optimized: true,
          };
        }
      }
    }
    return { name: file.name, previewUrl: URL.createObjectURL(file), size: file.size, type: file.type || "image/jpeg", optimized: false };
  };

  const optimizeFeedComposeVideo = async (file: File): Promise<FeedComposerAttachment> => {
    const maxBytes = 30 * 1024 * 1024;
    const meta = await getVideoMetadata(file);
    if (meta.durationSec > 20.05) {
      throw new Error("영상은 최대 20초까지만 첨부할 수 있습니다.");
    }
    if (file.size <= maxBytes) {
      return {
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        size: file.size,
        type: file.type || "video/mp4",
        durationSec: meta.durationSec,
        optimized: false,
      };
    }

    const RecorderCtor = typeof window !== "undefined" ? window.MediaRecorder : undefined;
    if (!RecorderCtor) {
      throw new Error("현재 브라우저는 영상 최적화를 지원하지 않습니다. 30MB 이하 MP4(H.264) 또는 WEBM 파일을 사용해 주세요.");
    }

    const previewUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = previewUrl;
    video.crossOrigin = "anonymous";
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("영상을 열지 못했습니다."));
    });

    const captureTarget = video as HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
    const stream = captureTarget.captureStream?.() ?? captureTarget.mozCaptureStream?.();
    if (!stream) {
      URL.revokeObjectURL(previewUrl);
      throw new Error("현재 브라우저는 영상 재인코딩을 지원하지 않습니다. 30MB 이하 MP4(H.264) 또는 WEBM 파일을 사용해 주세요.");
    }

    const mimeCandidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    const selectedMime = mimeCandidates.find((mime) => RecorderCtor.isTypeSupported?.(mime)) ?? "video/webm";
    const maxEdge = 1280;
    const bitrate = Math.min(2_800_000, Math.max(1_600_000, Math.round((maxBytes * 8) / Math.max(meta.durationSec, 1))));
    const chunks: BlobPart[] = [];
    const recorder = new RecorderCtor(stream, { mimeType: selectedMime, videoBitsPerSecond: bitrate });
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data);
    };
    const stopPromise = new Promise<Blob>((resolve, reject) => {
      recorder.onerror = () => reject(new Error("영상 최적화 중 오류가 발생했습니다."));
      recorder.onstop = () => resolve(new Blob(chunks, { type: selectedMime.split(";")[0] }));
    });

    const needsResize = Math.max(meta.width, meta.height) > maxEdge;
    if (needsResize) {
      const canvas = document.createElement("canvas");
      const scale = maxEdge / Math.max(meta.width, meta.height);
      canvas.width = Math.round(meta.width * scale);
      canvas.height = Math.round(meta.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(previewUrl);
        throw new Error("영상 최적화를 시작하지 못했습니다.");
      }
      const canvasStream = canvas.captureStream(30);
      const canvasRecorder = new RecorderCtor(canvasStream, { mimeType: selectedMime, videoBitsPerSecond: bitrate });
      const canvasChunks: BlobPart[] = [];
      canvasRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) canvasChunks.push(event.data);
      };
      const canvasStopPromise = new Promise<Blob>((resolve, reject) => {
        canvasRecorder.onerror = () => reject(new Error("영상 최적화 중 오류가 발생했습니다."));
        canvasRecorder.onstop = () => resolve(new Blob(canvasChunks, { type: selectedMime.split(";")[0] }));
      });
      await video.play();
      canvasRecorder.start(250);
      const drawFrame = () => {
        if (video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
      };
      requestAnimationFrame(drawFrame);
      await new Promise<void>((resolve) => {
        video.onended = () => resolve();
      });
      if (canvasRecorder.state !== "inactive") canvasRecorder.stop();
      const optimizedBlob = await canvasStopPromise;
      URL.revokeObjectURL(previewUrl);
      if (optimizedBlob.size > maxBytes) {
        throw new Error("영상 최적화 후에도 30MB를 초과합니다. 길이를 더 짧게 하거나 원본 해상도를 줄여 주세요.");
      }
      const optimizedFile = new File([optimizedBlob], file.name.replace(/\.[^.]+$/, ".webm"), { type: optimizedBlob.type || "video/webm" });
      return {
        name: optimizedFile.name,
        previewUrl: URL.createObjectURL(optimizedFile),
        size: optimizedFile.size,
        type: optimizedFile.type,
        durationSec: meta.durationSec,
        optimized: true,
      };
    }

    await video.play();
    recorder.start(250);
    await new Promise<void>((resolve) => {
      video.onended = () => resolve();
    });
    if (recorder.state !== "inactive") recorder.stop();
    const optimizedBlob = await stopPromise;
    URL.revokeObjectURL(previewUrl);
    if (optimizedBlob.size > maxBytes) {
      throw new Error("영상 최적화 후에도 30MB를 초과합니다. 길이를 더 짧게 하거나 원본 해상도를 줄여 주세요.");
    }
    const optimizedFile = new File([optimizedBlob], file.name.replace(/\.[^.]+$/, ".webm"), { type: optimizedBlob.type || "video/webm" });
    return {
      name: optimizedFile.name,
      previewUrl: URL.createObjectURL(optimizedFile),
      size: optimizedFile.size,
      type: optimizedFile.type,
      durationSec: meta.durationSec,
      optimized: true,
    };
  };

  const handleFeedComposeAttach = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      window.alert("사진 또는 영상 파일만 첨부할 수 있습니다.");
      return;
    }
    setFeedComposeBusy(true);
    setFeedComposeHelperText(file.type.startsWith("video/") ? "영상 길이/용량을 확인하고 최적화 중입니다." : "이미지를 확인하고 최적화 중입니다.");
    try {
      const nextAttachment = file.type.startsWith("video/")
        ? await optimizeFeedComposeVideo(file)
        : await optimizeFeedComposeImage(file);
      setFeedComposeAttachment((prev) => {
        if (prev?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(prev.previewUrl);
        return nextAttachment;
      });
      setFeedComposeHelperText(
        nextAttachment.type.startsWith("video/")
          ? `최대 1개 첨부 · 영상 ${nextAttachment.durationSec ? nextAttachment.durationSec.toFixed(1) : "0.0"}초 · ${Math.max(1, Math.round(nextAttachment.size / 1024 / 1024))}MB · ${nextAttachment.optimized ? "WEBM 최적화" : "원본 유지"}`
          : `최대 1개 첨부 · 이미지 ${Math.max(1, Math.round(nextAttachment.size / 1024))}KB${nextAttachment.optimized ? " · 최적화 완료" : ""}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "첨부 파일을 처리하지 못했습니다.";
      window.alert(message);
      setFeedComposeHelperText(getFeedComposeModeMeta(feedComposeMode).helper);
    } finally {
      setFeedComposeBusy(false);
    }
  };

  const clearFeedComposeAttachment = () => {
    setFeedComposeAttachment((prev) => {
      if (prev?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setFeedComposeHelperText(getFeedComposeModeMeta(feedComposeMode).helper);
  };

  const openFeedComposeWithMode = useCallback((mode: FeedComposeMode) => {
    setFeedComposeAttachment((prev) => {
      if (prev?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setFeedComposeTitle("");
    setFeedComposeCaption("");
    setFeedComposeBusy(false);
    setFeedComposeMode(mode);
    setFeedComposeMaptoryEnabled(false);
    setFeedComposeHelperText(getFeedComposeModeMeta(mode).helper);
    setFeedComposeLauncherOpen(false);
    setFeedComposeOpen(true);
  }, []);

  const closeFeedCompose = () => {
    setFeedComposeOpen(false);
    setFeedComposeBusy(false);
  };

  const submitFeedCompose = () => {
    const composeMeta = getFeedComposeModeMeta(feedComposeMode);
    if (!feedComposeCaption.trim() && !feedComposeAttachment) {
      window.alert(`${composeMeta.title} 내용 또는 첨부 파일을 입력해 주세요.`);
      return;
    }
    if (feedComposeMode === "쇼츠게시" && !feedComposeAttachment?.type.startsWith("video/")) {
      window.alert("쇼츠게시에는 영상 첨부가 필요합니다.");
      return;
    }
    if (feedComposeMode === "사진피드" && !feedComposeAttachment?.type.startsWith("image/")) {
      window.alert("사진피드에는 사진 첨부가 필요합니다.");
      return;
    }
    if (feedComposeMode === "스토리게시") {
      const nextStory: StoryItem = {
        id: Date.now(),
        name: viewedProfileAuthor ?? currentProfileMeta.name ?? "me",
        role: feedComposeMaptoryEnabled ? "맵토리 스토리" : "일상 스토리",
        accent: "sunrise",
        caption: feedComposeCaption.trim() || feedComposeTitle.trim() || "방금 등록한 스토리입니다.",
        postedAt: "방금 전",
        mapEnabled: feedComposeMaptoryEnabled,
      };
      setCustomStoryItems((prev) => [nextStory, ...prev]);
      setFeedComposeTitle("");
      setFeedComposeCaption("");
      setFeedComposeAttachment(null);
      setFeedComposeMaptoryEnabled(false);
      setFeedComposeBusy(false);
      setFeedComposeHelperText(getFeedComposeModeMeta(feedComposeMode).helper);
      setFeedComposeOpen(false);
      setActiveTab("홈");
      setHomeTab("스토리");
      return;
    }
    const nextId = Math.max(...allFeedItems.map((item) => item.id), 0) + 1;
    const inferredType = feedComposeAttachment?.type.startsWith("video/") ? "video" : "image";
    const type = feedComposeMode === "쇼츠게시" ? "video" : feedComposeMode === "사진피드" ? "image" : inferredType;
    const trimmedTitle = feedComposeTitle.trim();
    const caption = feedComposeCaption.trim();
    const nextItem: FeedItem = {
      id: nextId,
      type,
      category: feedComposeMode === "쇼츠게시" ? "쇼츠" : feedComposeMode === "사진피드" ? "사진피드" : "일반",
      title: trimmedTitle || caption.slice(0, 28) || "새 피드",
      caption,
      author: viewedProfileAuthor ?? currentProfileMeta.name ?? "adult official",
      likes: 0,
      comments: 0,
      accent: "rose",
      views: type === "video" ? 0 : undefined,
      postedAt: "방금",
      videoUrl: type === "video" ? feedComposeAttachment?.previewUrl : undefined,
      mediaUrl: type === "image" ? feedComposeAttachment?.previewUrl : undefined,
      mediaName: feedComposeAttachment?.name,
    };
    setCustomFeedItems((prev) => [nextItem, ...prev]);
    setFeedCommentMap((prev) => ({ ...prev, [nextId]: [] }));
    setFeedComposeTitle("");
    setFeedComposeCaption("");
    setFeedComposeAttachment(null);
    setFeedComposeMaptoryEnabled(false);
    setFeedComposeBusy(false);
    setFeedComposeHelperText(getFeedComposeModeMeta(feedComposeMode).helper);
    setFeedComposeOpen(false);
    setActiveTab("홈");
    setHomeTab("피드");
  };

  const clearFeedCommentAttachment = (feedId: number) => {
    setFeedCommentAttachments((prev) => ({ ...prev, [feedId]: null }));
  };

  const updateFeedCommentDraft = (feedId: number, value: string) => {
    setFeedCommentDrafts((prev) => ({ ...prev, [feedId]: value }));
  };

  const submitFeedComment = (feedId: number) => {
    const draft = (feedCommentDrafts[feedId] ?? "").trim();
    const attachment = feedCommentAttachments[feedId] ?? null;
    if (!draft && !attachment) return;
    setFeedCommentMap((prev) => ({
      ...prev,
      [feedId]: [
        ...(prev[feedId] ?? []),
        { id: Date.now(), author: "my_account", text: draft || "사진을 첨부했습니다.", meta: "방금", imageUrl: attachment?.dataUrl, imageName: attachment?.name },
      ],
    }));
    setFeedCommentDrafts((prev) => ({ ...prev, [feedId]: "" }));
    setFeedCommentAttachments((prev) => ({ ...prev, [feedId]: null }));
  };

  const toggleFollowedFeedAuthor = (author: string) => {
    setFollowedFeedAuthors((prev) => prev.includes(author) ? prev.filter((item) => item !== author) : [...prev, author]);
  };

  const shareFeedItem = async (item: FeedItem) => {
    const shareText = `${item.title} · ${item.caption}`;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: item.title, text: shareText });
        return;
      }
    } catch (error) {
      return;
    }
    copyToClipboard(shareText);
    window.alert("피드 내용이 클립보드에 복사되었습니다.");
  };

  const toggleSavedProduct = (productId: number) => {
    setSavedProductIds((prev) => prev.includes(productId) ? prev.filter((item) => item !== productId) : [productId, ...prev]);
  };

  const savedFeedItems = useMemo(() => allFeedItems.filter((item) => item.type !== "video" && savedFeedIds.includes(item.id)), [savedFeedIds]);

  const openMenuOverlay = () => setOverlayMode("menu");

  const goToSavedBox = () => {
    setActiveTab("홈");
    setHomeTab("보관함");
    setSavedTab("피드");
    setOverlayMode(null);
  };

  const handleLogout = async () => {
    if (typeof window === "undefined") return;

    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await postJson("/auth/logout", { refresh_token: refreshToken });
      }
    } catch {}

    clearTokens();
    [
      "adultapp_demo_role",
      "adultapp_demo_login_provider",
      "adultapp_identity_verified",
      "adultapp_adult_verified",
      "adultapp_adult_fail_count",
      "adultapp_adult_cooldown_until",
      "adultapp_identity_method",
      "adultapp_identity_token",
      "adultapp_signup_consents",
      "adultapp_signup_form",
      "adultapp_demo_profile",
      "adultapp_seller_verification",
      "adultapp_account_private",
    ].forEach((key) => window.localStorage.removeItem(key));

    setCurrentUserRole("GUEST");
    setDemoLoginProvider("카카오");
    setIdentityVerified(false);
    setAdultVerified(false);
    setGroupRoomSuspendedUntil(0);
    setAdultGateView("intro");
    setAdultFailCount(0);
    setAdultCooldownUntil(0);
    setAdultPromptOpen(false);
    setSignupStep("account");
    setIdentityMethod("미완료");
    setIdentityVerificationToken("");
    setSignupConsents(defaultSignupConsents);
    setSignupForm(defaultSignupForm);
    setDemoProfile(defaultDemoProfile);
    setSellerVerification(defaultSellerVerification);
    setAccountPrivate(false);
    setAuthSummary(null);
    setOrders([]);
    setCartItems([]);
    setOrderMessage("");
    setSettingsCategory("일반");
    setOverlayMode(null);
    setActiveTab("프로필");
    setAuthStandaloneScreen("login");
    setHomeTab("피드");
    setProfileTab("내정보");
    setAuthMessage("로그아웃 완료 · 로그인 화면으로 이동했습니다.");
    setHomeShopConsentGuideSeen(false);

  };

  const openFeedAvatarPreview = useCallback((item: FeedItem) => {
    setFeedAvatarPreviewItem(item);
  }, []);

  const closeFeedAvatarPreview = useCallback(() => {
    setFeedAvatarPreviewItem(null);
  }, []);

  const handleShortsScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const currentTop = target.scrollTop;
    const remain = target.scrollHeight - currentTop - target.clientHeight;
    if (remain < 240) {
      setShortsVisibleCount((prev) => Math.min(prev + 10, shortsFeedItems.length));
    }

    if (showAppTabContent && activeTab === "홈" && homeTab === "쇼츠" && shortsFeedItems.length > 0 && remain <= 48 && shortsVisibleCount >= shortsFeedItems.length) {
      showListEndToast("모든 쇼츠를 확인하였습니다");
    }

    if (shortsScrollRafRef.current !== null) {
      window.cancelAnimationFrame(shortsScrollRafRef.current);
    }

    shortsScrollRafRef.current = window.requestAnimationFrame(() => {
      const prevTop = lastShortsScrollTopRef.current;
      const delta = currentTop - prevTop;
      lastShortsScrollTopRef.current = currentTop;

      if (currentTop <= 8) {
        shortsHideThresholdRef.current = 0;
        shortsShowThresholdRef.current = 0;
        setShortsHeaderHidden(false);
        setShortsCategoryVisible(true);
        return;
      }

      if (delta > 2) {
        shortsHideThresholdRef.current += delta;
        shortsShowThresholdRef.current = 0;
      } else if (delta < -2) {
        shortsShowThresholdRef.current += Math.abs(delta);
        shortsHideThresholdRef.current = 0;
      }

      if (!shortsHeaderHidden && shortsHideThresholdRef.current >= 28 && currentTop > 32) {
        shortsHideThresholdRef.current = 0;
        setShortsHeaderHidden(true);
        setShortsCategoryVisible(false);
      } else if (shortsHeaderHidden && shortsShowThresholdRef.current >= 18) {
        shortsShowThresholdRef.current = 0;
        setShortsHeaderHidden(false);
        setShortsCategoryVisible(true);
      }
    });
  };

  const handleProfileShellScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    if (!showAppTabContent || activeTab !== "프로필" || profileSection !== "쇼츠") return;
    const target = event.currentTarget;
    const remain = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (remain <= 48 && profileShortsVisibleCount < profileShortItems.length) {
      setProfileShortsVisibleCount((prev) => Math.min(prev + 10, profileShortItems.length));
    }
  };

  const showListEndToast = useCallback((message: string) => {
    if (listEndToastTimerRef.current !== null) {
      window.clearTimeout(listEndToastTimerRef.current);
    }
    setListEndToast(message);
    listEndToastTimerRef.current = window.setTimeout(() => {
      setListEndToast(null);
      listEndToastTimerRef.current = null;
    }, 1800);
  }, []);

  useEffect(() => () => {
    if (listEndToastTimerRef.current !== null) {
      window.clearTimeout(listEndToastTimerRef.current);
    }
  }, []);

  const homeMenuItems = [
    { label: "피드", onClick: () => { setHomeTab("피드"); setOverlayMode(null); setHomeFeedHeaderHidden(false); lastHomeFeedScrollTopRef.current = 0; homeFeedHideThresholdRef.current = 0; homeFeedShowThresholdRef.current = 0; } },
    { label: "쇼츠", onClick: () => { setHomeTab("쇼츠"); setOverlayMode(null); setShortsHeaderHidden(false); setShortsCategoryVisible(true); setSelectedShortsCategory("전체"); lastShortsScrollTopRef.current = 0; shortsHideThresholdRef.current = 0; shortsShowThresholdRef.current = 0; } },
    { label: "보관함", onClick: goToSavedBox },
  ];


  const shortsCategories = useMemo(() => {
    const fixed = ["전체", "추천", "최신"];
    const dynamic = Array.from(new Set(allFeedItems.filter((item) => item.type === "video").map((item) => item.category))).filter((category) => !fixed.includes(category));
    return [...fixed, ...dynamic];
  }, []);

  const keywordSignalMap = useMemo(() => buildKeywordSignalMap({
    shopKeywordSignals,
    shortsKeywordSignals,
    globalKeyword,
    followingUserIds,
    savedFeedIds,
    feedItems: allFeedItems,
    forumUsers: forumStarterUsers,
  }), [shopKeywordSignals, shortsKeywordSignals, globalKeyword, followingUserIds, savedFeedIds]);

  const followedTopicKeywords = useMemo(() => followingUserIds
    .map((id) => forumStarterUsers.find((user) => user.id === id))
    .filter((user): user is ForumStarterUser => Boolean(user))
    .flatMap((user) => extractInterestTokens(`${user.name} ${user.topic} ${user.role}`)), [followingUserIds]);

  const recommendedHomeFeed = useMemo(() => rankHomeFeedItems({
    items: allFeedItems,
    keywordSignalMap,
    followedTopicKeywords,
    savedFeedIds,
    keyword: deferredGlobalKeyword,
  }), [keywordSignalMap, followedTopicKeywords, savedFeedIds, deferredGlobalKeyword]);

  const chronologicalHomeFeed = useMemo(() => [...allFeedItems].sort((a, b) => b.id - a.id), [allFeedItems]);
  const followingHomeFeed = useMemo(() => chronologicalHomeFeed.filter((item) => followedFeedAuthors.includes(item.author)), [chronologicalHomeFeed, followedFeedAuthors]);
  const activeHomeFeedItems = useMemo(() => {
    if (homeFeedFilter === "추천") return recommendedHomeFeed;
    if (homeFeedFilter === "팔로잉") return followingHomeFeed;
    return chronologicalHomeFeed;
  }, [homeFeedFilter, recommendedHomeFeed, followingHomeFeed, chronologicalHomeFeed]);

  const homeFeedSource = useMemo(() => activeHomeFeedItems.slice(0, homeFeedVisibleCount), [activeHomeFeedItems, homeFeedVisibleCount]);

  useEffect(() => {
    homeFeedViewedIdsRef.current = Array.from(new Set([...homeFeedViewedIdsRef.current, ...homeFeedSource.map((item) => item.id)])).slice(-240);
  }, [homeFeedSource]);

  useEffect(() => {
    setHomeFeedVisibleCount((prev) => {
      if (!activeHomeFeedItems.length) return HOME_FEED_BATCH_SIZE;
      return Math.min(Math.max(prev, HOME_FEED_BATCH_SIZE), activeHomeFeedItems.length);
    });
  }, [activeHomeFeedItems]);

  useEffect(() => {
    persistHomeFeedState({ visibleCount: homeFeedVisibleCount });
  }, [homeFeedVisibleCount, persistHomeFeedState]);


  useEffect(() => {
    if (typeof window === "undefined") return;

    const markInactive = () => {
      persistHomeFeedState({ lastInactiveAt: Date.now() });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        markInactive();
        return;
      }
      const stored = readHomeFeedPersistedState();
      if (!isHomeFeedStateExpired(stored)) return;
      homeFeedResetOnNextShowRef.current = true;
      setHomeFeedVisibleCount(HOME_FEED_BATCH_SIZE);
      persistHomeFeedState({ visibleCount: HOME_FEED_BATCH_SIZE, scrollTop: 0, lastInactiveAt: 0 });
      setHomeFeedHeaderHidden(false);
      lastHomeFeedScrollTopRef.current = 0;
      homeFeedHideThresholdRef.current = 0;
      homeFeedShowThresholdRef.current = 0;
      if (homeFeedScrollRef.current) {
        homeFeedScrollRef.current.scrollTop = 0;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", markInactive);
    window.addEventListener("beforeunload", markInactive);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", markInactive);
      window.removeEventListener("beforeunload", markInactive);
    };
  }, [persistHomeFeedState]);

  useEffect(() => {
    if (homeTab === "피드" && activeTab === "홈") return;
    setHomeFeedHeaderHidden(false);
    lastHomeFeedScrollTopRef.current = 0;
    homeFeedHideThresholdRef.current = 0;
    homeFeedShowThresholdRef.current = 0;
  }, [activeTab, homeTab]);

  useEffect(() => () => {
    if (typeof window !== "undefined" && homeFeedScrollRafRef.current !== null) {
      window.cancelAnimationFrame(homeFeedScrollRafRef.current);
    }
  }, []);

  useEffect(() => () => {
    if (feedComposeAttachment?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(feedComposeAttachment.previewUrl);
    }
  }, [feedComposeAttachment]);

  const getContentKeywordTags = (item: FeedItem) => getTopMatchedKeywords(item, keywordSignalMap);

  const recommendedShorts = useMemo(() => {
    const base = allFeedItems.filter((item) => item.type === "video" || item.category.includes("숏"));
    const ranked = base.map((item, idx) => {
      const content = `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase();
      const matchedSignalScore = Array.from(keywordSignalMap.entries()).reduce((sum, [token, score]) => sum + (content.includes(token) ? score : 0), 0);
      const freshnessMinutes = parseRelativeMinutes(item.postedAt);
      const freshnessScore = Math.max(0, 36 - Math.min(freshnessMinutes / 12, 36));
      const followScore = followedTopicKeywords.some((token) => content.includes(token)) ? 18 : 0;
      const savedScore = savedFeedIds.includes(item.id) ? 28 : 0;
      const popularityScore = Math.min(22, (item.likes / 40) + (item.comments / 12) + ((item.views ?? 0) / 600));
      const nicheBoost = /딜도|바이브|본디지|패들|케인|젤|세정|보관|입문|리뷰/.test(content) ? 6 : 0;
      const explorationScore = deterministicHash(`${item.id}-${item.title}`) % 100 < 2 ? 12 : 0;
      const vintagePopularBoost = freshnessMinutes >= 120 && popularityScore >= 16 && matchedSignalScore > 0 ? 10 : 0;
      const recencyPenalty = freshnessMinutes >= 1440 ? 6 : 0;
      const totalScore = matchedSignalScore + freshnessScore + followScore + savedScore + popularityScore + nicheBoost + explorationScore + vintagePopularBoost - recencyPenalty;
      return {
        ...item,
        id: 1000 + idx,
        views: (item.views ?? 1000) + idx * 91,
        postedAt: item.postedAt ?? ["방금", "9분 전", "26분 전", "1시간 전", "3시간 전", "어제"][idx % 6],
        sortScore: totalScore,
      };
    });

    ranked.sort((a, b) => (b.sortScore ?? 0) - (a.sortScore ?? 0) || (b.likes - a.likes));
    return ranked;
  }, [keywordSignalMap, followedTopicKeywords, savedFeedIds]);
  const savedShortItems = useMemo(() => {
    const source = recommendedShorts.filter((item) => savedFeedIds.includes(item.id));
    return source.sort((a, b) => savedFeedIds.indexOf(a.id) - savedFeedIds.indexOf(b.id));
  }, [recommendedShorts, savedFeedIds]);

  const visibleShorts = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    const baseSource = selectedShortsCategory === "최신"
      ? [...recommendedShorts].sort((a, b) => parseRelativeMinutes(a.postedAt) - parseRelativeMinutes(b.postedAt) || (b.views ?? 0) - (a.views ?? 0))
      : recommendedShorts;

    return baseSource.filter((item) => {
      const categoryMatch = ["전체", "추천", "최신"].includes(selectedShortsCategory) || item.category === selectedShortsCategory;
      const keywordMatch = !keyword || `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });
  }, [recommendedShorts, selectedShortsCategory, globalKeyword]);

  const shortsFeedItems = useMemo(() => visibleShorts.length ? visibleShorts : recommendedShorts, [visibleShorts, recommendedShorts]);

  const pagedShorts = useMemo(() => shortsFeedItems.slice(0, shortsVisibleCount), [shortsFeedItems, shortsVisibleCount]);
  const shortsViewerInitialIndex = useMemo(() => shortsViewerItemId === null ? 0 : Math.max(0, shortsFeedItems.findIndex((item) => item.id === shortsViewerItemId)), [shortsFeedItems, shortsViewerItemId]);
  const savedShortsViewerInitialIndex = useMemo(() => savedShortsViewerItemId === null ? 0 : Math.max(0, savedShortItems.findIndex((item) => item.id === savedShortsViewerItemId)), [savedShortItems, savedShortsViewerItemId]);

  useEffect(() => {
    setShortsVisibleCount(10);
  }, [globalKeyword, selectedShortsCategory]);

  useEffect(() => {
    setProfileShortsVisibleCount(10);
  }, [profileSection, viewedProfileAuthor, shortsFeedItems.length]);

  useEffect(() => () => {
    if (shortsScrollRafRef.current !== null) {
      window.cancelAnimationFrame(shortsScrollRafRef.current);
    }
  }, []);


  const shopCatalogItems = useMemo<ProductCard[]>(() => {
    const source = apiProducts.length
      ? apiProducts
          .filter((item) => ["published", "approved", "active", "판매중"].includes(String(item.status ?? "published")))
          .map((item, index) => withProductMetrics({
            id: item.id,
            category: item.category ?? "기타",
            name: item.name,
            subtitle: item.description ?? "",
            price: `₩${Number(item.price || 0).toLocaleString()}`,
            badge: item.stock_qty && item.stock_qty > 0 ? "판매중" : "재고확인",
            reviewCount: Number((item as { review_count?: number }).review_count ?? 0) || undefined,
            stock_qty: item.stock_qty,
            thumbnailUrl: item.thumbnail_url ?? null,
            isPremium: /프리미엄|premium|고급/.test(`${item.name} ${item.description ?? ""}`.toLowerCase()),
          }, index))
      : productsSeed.map((item, index) => withProductMetrics(item, index));
    return source.filter((product) => selectedShopCategory === "전체" || product.category === selectedShopCategory);
  }, [selectedShopCategory, apiProducts]);

  const allShopItems = useMemo<ProductCard[]>(() => {
    const keyword = shopKeyword.trim().toLowerCase();
    return shopCatalogItems.filter((product) => !keyword || `${product.name} ${product.subtitle} ${product.category}`.toLowerCase().includes(keyword));
  }, [shopCatalogItems, shopKeyword]);

  const shoppingHomeKeywords = useMemo(() => {
    const roleSeedMap: Record<string, string[]> = {
      ADMIN: ["판매자", "신상품", "베스트", "위생", "보관", "케어", "세정", "입문", "브랜드", "기획전"],
      SELLER: ["신상품", "입문", "브랜드", "베스트", "위생", "보관", "케어", "세정", "기획전", "인기"],
      GUEST: ["입문", "위생", "보관", "케어", "세정", "베스트", "브랜드", "기획전", "추천", "인기"],
      MEMBER: ["입문", "위생", "보관", "케어", "세정", "베스트", "브랜드", "기획전", "추천", "인기"],
    };
    const roleSeeds = roleSeedMap[currentUserRole] ?? roleSeedMap.MEMBER;
    const pool = [
      ...Object.entries(shopKeywordSignals)
        .sort((a, b) => b[1] - a[1])
        .map(([token]) => token),
      ...roleSeeds,
      ...shopCatalogItems.flatMap((item) => [item.category, item.name]),
      ...productsSeed.flatMap((item) => [item.category, item.name]),
    ];

    const normalized = pool
      .flatMap((entry) => String(entry).split(/[·,/]/))
      .map((entry) => entry.trim())
      .filter((entry) => entry.length >= 2)
      .filter((entry) => !/^(전체|상품|판매중|재고확인)$/.test(entry));

    const unique: string[] = [];
    for (const item of normalized) {
      if (!unique.includes(item)) unique.push(item);
      if (unique.length >= 32) break;
    }
    while (unique.length < 32) {
      unique.push(`추천 ${unique.length + 1}`);
    }
    return unique.slice(0, 32);
  }, [shopKeywordSignals, currentUserRole, shopCatalogItems]);

  const shopHomeRecommendedItems = useMemo(() => buildShopHomeRecommendationFeed({
    items: shopCatalogItems.length ? shopCatalogItems : productsSeed,
    keywordSignals: shopKeywordSignals,
    visibleCount: shopHomeVisibleCount,
  }), [shopCatalogItems, shopKeywordSignals, shopHomeVisibleCount]);

  const shopHomeSortedBaseItems = useMemo(() => {
    const normalized = (shopCatalogItems.length ? shopCatalogItems : productsSeed.map((item, index) => withProductMetrics(item, index))).map((item, index) => withProductMetrics(item, index));
    if (shopHomeSort === "추천") {
      return buildShopHomeRecommendationFeed({ items: normalized, keywordSignals: shopKeywordSignals, visibleCount: shopHomeVisibleCount });
    }
    const sorted = [...normalized].sort((a, b) => {
      if (shopHomeSort === "신규") return parseIsoDateScore(b.createdAt) - parseIsoDateScore(a.createdAt) || b.id - a.id;
      if (shopHomeSort === "판매량") return (b.orderCount ?? 0) - (a.orderCount ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      if (shopHomeSort === "리뷰") return (b.reviewCount ?? 0) - (a.reviewCount ?? 0) || (b.orderCount ?? 0) - (a.orderCount ?? 0);
      return ((b.orderCount ?? 0) + (b.reviewCount ?? 0) * 2 + (b.repurchaseCount ?? 0) * 3) - ((a.orderCount ?? 0) + (a.reviewCount ?? 0) * 2 + (a.repurchaseCount ?? 0) * 3);
    });
    return sorted.slice(0, shopHomeVisibleCount).map((item, index) => ({ ...item, feedIndex: index, recommendationBucket: shopHomeSort }));
  }, [shopCatalogItems, shopHomeSort, shopKeywordSignals, shopHomeVisibleCount]);

  const shopHomeHeroSlides = useMemo(() => {
    const source = shopHomeSort === "추천" ? shopHomeRecommendedItems : shopHomeSortedBaseItems;
    const base = source.slice(0, 3);
    return base.length ? base : buildShopHomeRecommendationFeed({ items: productsSeed, keywordSignals: shopKeywordSignals, visibleCount: 3 });
  }, [shopHomeSort, shopHomeRecommendedItems, shopHomeSortedBaseItems, shopKeywordSignals]);

  const shopHomeFeedItems = useMemo(() => {
    if (shopHomeSort === "추천") {
      if (shopHomeRecommendedItems.length) return shopHomeRecommendedItems;
      return buildShopHomeRecommendationFeed({ items: productsSeed, keywordSignals: shopKeywordSignals, visibleCount: shopHomeVisibleCount });
    }
    return shopHomeSortedBaseItems;
  }, [shopHomeSort, shopHomeRecommendedItems, shopHomeSortedBaseItems, shopKeywordSignals, shopHomeVisibleCount]);

  const productDetailDisplayItem = useMemo<ProductCard | null>(() => {
    if (!productDetail?.product) return null;
    const targetId = productDetail.product.id;
    const fallback = shopCatalogItems.find((item) => item.id === targetId) ?? productsSeed.find((item) => item.id === targetId) ?? null;
    return {
      id: targetId,
      category: productDetail.product.category ?? fallback?.category ?? "기타",
      name: productDetail.product.name,
      subtitle: productDetail.product.description ?? fallback?.subtitle ?? "",
      price: `₩${Number(productDetail.product.price || 0).toLocaleString()}`,
      badge: fallback?.badge ?? (Number(productDetail.product.stock_qty || 0) > 0 ? "판매중" : "재고확인"),
      reviewCount: Number(productDetail.product.review_count ?? fallback?.reviewCount ?? 0) || 0,
      stock_qty: productDetail.product.stock_qty ?? fallback?.stock_qty,
      thumbnailUrl: productDetail.product.thumbnail_url ?? fallback?.thumbnailUrl ?? null,
      orderCount: fallback?.orderCount,
      repurchaseCount: fallback?.repurchaseCount,
      isPremium: fallback?.isPremium,
      createdAt: fallback?.createdAt,
    };
  }, [productDetail, shopCatalogItems]);

  const productDetailImageUrls = useMemo(() => {
    const urls = [
      ...(productDetail?.media ?? []).map((item) => item.file_url).filter((value): value is string => Boolean(value)),
      productDetail?.product.thumbnail_url ?? undefined,
      productDetailDisplayItem?.thumbnailUrl ?? undefined,
    ].filter((value): value is string => Boolean(value));
    return Array.from(new Set(urls));
  }, [productDetail, productDetailDisplayItem]);

  const productDetailOptionChips = useMemo(() => {
    const category = productDetailDisplayItem?.category ?? "기본";
    const optionMap: Record<string, string[]> = {
      "딜도": ["슬림", "미디엄", "프리미엄 세트"],
      "바이브레이터": ["저소음", "듀얼모드", "프리미엄 세트"],
      "플러그": ["소형", "중형", "케어 세트"],
      "러브젤": ["기본형", "대용량", "세트구성"],
      "케어 키트": ["기본구성", "추가용품 포함", "선물포장"],
    };
    return optionMap[category] ?? ["기본구성", "세트구성", "선물포장"];
  }, [productDetailDisplayItem]);

  const productDetailCurrentImage = productDetailImageUrls[productDetailMediaIndex] ?? "";
  const productDetailPriceValue = Number(productDetail?.product.price || 0);
  const productDetailShippingValue = Number(productDetail?.product.shipping_fee || 3000);
  const productDetailTotalAmount = (productDetailPriceValue * Math.max(1, productDetailQuantity)) + productDetailShippingValue;
  const productDetailRating = useMemo(() => {
    const reviews = Number(productDetailDisplayItem?.reviewCount ?? 0);
    if (!reviews) return 4.7;
    return Math.min(5, 4.6 + ((reviews % 9) * 0.03));
  }, [productDetailDisplayItem]);

  useEffect(() => {
    setProductDetailQuantity(1);
    setProductDetailMediaIndex(0);
    setSelectedProductOption(productDetailOptionChips[0] ?? "");
  }, [productDetail?.product.id, productDetailOptionChips]);

  const currentProfileAuthor = viewedProfileAuthor ?? "adult official";
  const currentProfileAuthorAliases = useMemo(
    () => [...new Set([currentProfileAuthor, demoProfile.displayName.trim()].filter(Boolean))],
    [currentProfileAuthor, demoProfile.displayName],
  );
  const currentProfileMeta = useMemo(() => {
    const askProfile = askProfiles.find((item) => item.name === currentProfileAuthor);
    const authorFeeds = allFeedItems.filter((item) => currentProfileAuthorAliases.includes(item.author));
    const firstFeed = authorFeeds[0];
    const postCount = Math.max(9, authorFeeds.length * 4 || 12);
    const isOwner = viewedProfileAuthor === null;
    const ownerDisplayName = demoProfile.displayName.trim() || signupForm.displayName.trim() || currentProfileAuthor;
    const ownerBio = demoProfile.bio.trim();
    const ownerHashtags = normalizeProfileKeywordTags(demoProfile.hashtags);
    const ownerFollowingCount = followingUserIds.length;
    const ownerFollowerCount = followerUserIds.length;
    const viewedStarter = forumStarterUsers.find((item) => item.name === currentProfileAuthor);
    const viewedFollowingCount = viewedStarter ? forumStarterUsers.filter((item) => item.id !== viewedStarter.id && ((item.id + viewedStarter.id) % 2 === 0)).length : 0;
    const viewedFollowerCount = viewedStarter ? forumStarterUsers.filter((item) => item.id !== viewedStarter.id && (item.followsMe || item.id % 2 === viewedStarter.id % 2)).length : 0;
    return {
      name: isOwner ? ownerDisplayName : currentProfileAuthor,
      avatar: (isOwner ? ownerDisplayName : currentProfileAuthor).slice(0, 1).toUpperCase(),
      avatarUrl: isOwner ? demoProfile.avatarUrl.trim() : (firstFeed?.mediaUrl ?? buildChatAvatarDataUri(currentProfileAuthor)),
      headline: askProfile?.headline ?? firstFeed?.category ?? "프로필",
      bio: isOwner ? ownerBio : (askProfile?.intro ?? firstFeed?.caption ?? "피드와 질문, 쇼핑 정보를 함께 운영하는 계정입니다."),
      hashtags: isOwner && ownerHashtags.length ? ownerHashtags : getContentKeywordTags(firstFeed ?? allFeedItems[0] ?? feedSeed[0]),
      postCount,
      followerCount: isOwner ? ownerFollowerCount : viewedFollowerCount,
      followingCount: isOwner ? ownerFollowingCount : viewedFollowingCount,
      isOwner,
    };
  }, [allFeedItems, askProfiles, currentProfileAuthor, currentProfileAuthorAliases, demoProfile.avatarUrl, demoProfile.bio, demoProfile.hashtags, demoProfile.displayName, followerUserIds, followingUserIds, signupForm.displayName, viewedProfileAuthor]);

  const profileFollowingAccounts = useMemo(() => {
    if (currentProfileMeta.isOwner) return forumStarterUsers.filter((item) => followingUserIds.includes(item.id));
    const viewedStarter = forumStarterUsers.find((item) => item.name === currentProfileAuthor);
    if (!viewedStarter) return [];
    return forumStarterUsers.filter((item) => item.id !== viewedStarter.id && ((item.id + viewedStarter.id) % 2 === 0));
  }, [currentProfileAuthor, currentProfileMeta.isOwner, followingUserIds]);

  const profileFollowerAccounts = useMemo(() => {
    if (currentProfileMeta.isOwner) return forumStarterUsers.filter((item) => followerUserIds.includes(item.id));
    const viewedStarter = forumStarterUsers.find((item) => item.name === currentProfileAuthor);
    if (!viewedStarter) return [];
    return forumStarterUsers.filter((item) => item.id !== viewedStarter.id && (item.followsMe || item.id % 2 === viewedStarter.id % 2));
  }, [currentProfileAuthor, currentProfileMeta.isOwner, followerUserIds]);

  const profileFollowAccounts = profileFollowListMode === "팔로워" ? profileFollowerAccounts : profileFollowingAccounts;

  const openProfileFollowList = useCallback((mode: Exclude<ProfileFollowListMode, null>) => {
    setProfileFollowListMode(mode);
  }, []);

  const openProfileFollowAccount = useCallback((name: string) => {
    setViewedProfileAuthor(name);
    setProfileFollowListMode(null);
    setProfileSection("게시물");
  }, []);

  useEffect(() => {
    setProfileFollowListMode(null);
  }, [currentProfileAuthor]);

  useEffect(() => {
    if (!currentProfileMeta.isOwner) {
      setProfileEditMode(false);
      return;
    }
    setProfileEditDraft((prev) => ({
      ...prev,
      displayName: demoProfile.displayName.trim() || currentProfileMeta.name,
      bio: demoProfile.bio.trim() || currentProfileMeta.bio,
      hashtags: demoProfile.hashtags.trim() || currentProfileMeta.hashtags.join(" "),
      avatarUrl: demoProfile.avatarUrl,
    }));
  }, [currentProfileMeta.bio, currentProfileMeta.hashtags, currentProfileMeta.isOwner, currentProfileMeta.name, demoProfile.avatarUrl, demoProfile.bio, demoProfile.displayName, demoProfile.hashtags]);

  const openProfileEditMode = useCallback(() => {
    if (!currentProfileMeta.isOwner) return;
    setProfileEditDraft({
      ...demoProfile,
      displayName: demoProfile.displayName.trim() || currentProfileMeta.name,
      bio: demoProfile.bio.trim() || currentProfileMeta.bio,
      hashtags: demoProfile.hashtags.trim() || currentProfileMeta.hashtags.join(" "),
      avatarUrl: demoProfile.avatarUrl,
    });
    setProfileNicknameEditUnlocked(false);
    setProfileEditMode(true);
  }, [currentProfileMeta, demoProfile]);

  const cancelProfileEditMode = useCallback(() => {
    setProfileEditDraft((prev) => ({
      ...prev,
      displayName: demoProfile.displayName.trim() || currentProfileMeta.name,
      bio: demoProfile.bio.trim() || currentProfileMeta.bio,
      hashtags: demoProfile.hashtags.trim() || currentProfileMeta.hashtags.join(" "),
      avatarUrl: demoProfile.avatarUrl,
    }));
    setProfileNicknameEditUnlocked(false);
    setProfileEditMode(false);
  }, [currentProfileMeta, demoProfile]);

  const saveProfileEditMode = useCallback(() => {
    const nextDisplayName = profileEditDraft.displayName.trim();
    const currentDisplayName = (demoProfile.displayName.trim() || currentProfileMeta.name).trim();
    if (nextDisplayName && nextDisplayName !== currentDisplayName) {
      const confirmed = window.confirm(`닉네임이 변경되었습니다. 변경된 닉네임으로 사용하시겠습니까?

변경 전 닉네임을 사용시 취소를 누르고, 변경 후 닉네임을 사용시 선택시 네를 눌러주세요`);
      if (!confirmed) return;
    }
    const normalizedKeywordTags = normalizeProfileKeywordTags(profileEditDraft.hashtags).join(" ");
    setDemoProfile((prev) => ({
      ...prev,
      displayName: nextDisplayName,
      bio: profileEditDraft.bio.trim(),
      hashtags: normalizedKeywordTags,
      avatarUrl: profileEditDraft.avatarUrl.trim(),
    }));
    setProfileNicknameEditUnlocked(false);
    setProfileEditMode(false);
  }, [currentProfileMeta.name, demoProfile.displayName, profileEditDraft]);

  const handleProfileNicknameEditUnlock = useCallback(() => {
    if (!profileEditMode || profileNicknameEditUnlocked) return;
    window.alert("닉네임 변경시 1개월간 재변경이 불가능합니다");
    setProfileNicknameEditUnlocked(true);
    window.setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(".profile-ig-edit-username");
      input?.focus();
      input?.select();
    }, 0);
  }, [profileEditMode, profileNicknameEditUnlocked]);

  const handleProfileAvatarFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfileEditDraft((prev) => ({ ...prev, avatarUrl: result }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }, []);

  const currentProfileProducts = useMemo(() => {
    const pool = (shopCatalogItems.length ? shopCatalogItems : productsSeed.map((item, index) => withProductMetrics(item, index))).map((item, index) => withProductMetrics(item, index));
    const ownerSeedName = currentProfileAuthorAliases[0] ?? currentProfileAuthor;
    const ownerIndex = Math.abs(deterministicHash(ownerSeedName)) % 5;
    const picked = pool.filter((item) => Math.abs(deterministicHash(`${ownerSeedName}-${item.id}-${item.name}`)) % 5 === ownerIndex);
    const source = picked.length >= 6 ? picked : pool.slice(ownerIndex * 6, ownerIndex * 6 + 9);
    return [...source].sort((a, b) => ((b.orderCount ?? 0) - (a.orderCount ?? 0)) || ((b.reviewCount ?? 0) - (a.reviewCount ?? 0)) || a.name.localeCompare(b.name));
  }, [shopCatalogItems, currentProfileAuthor, currentProfileAuthorAliases]);

  const profileShortItems = useMemo(() => {
    const authored = shortsFeedItems.filter((item) => item.type === "video" && currentProfileAuthorAliases.includes(item.author));
    if (authored.length) return authored;
    const fallback = shortsFeedItems.filter((item) => item.type === "video");
    return fallback.slice(0, 30);
  }, [shortsFeedItems, currentProfileAuthor, currentProfileAuthorAliases]);

  const pagedProfileShorts = useMemo(() => profileShortItems.slice(0, profileShortsVisibleCount), [profileShortItems, profileShortsVisibleCount]);
  const profileShortsViewerInitialIndex = useMemo(
    () => shortsViewerItemId === null ? 0 : Math.max(0, profileShortItems.findIndex((item) => item.id === shortsViewerItemId)),
    [profileShortItems, shortsViewerItemId]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_chat_question_draft", chatQuestionDraft);
  }, [chatQuestionDraft]);

  useEffect(() => {
    if (activeTab !== "쇼핑" || shoppingTab !== "홈") return;
    setShopHomeVisibleCount(30);
    setShopHomeBannerIndex(0);
    setShopHomeBannerDragOffset(0);
  }, [activeTab, shoppingTab, selectedShopCategory, shopHomeSort]);

  useEffect(() => {
    if (activeTab !== "쇼핑" || shoppingTab !== "홈" || shopHomeHeroSlides.length <= 1 || shopHomeBannerPointerActiveRef.current) return;
    const timer = window.setInterval(() => {
      setShopHomeBannerIndex((prev) => (prev + 1) % shopHomeHeroSlides.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [activeTab, shoppingTab, shopHomeHeroSlides.length, shopHomeBannerIndex]);

  const goPrevShopHomeBanner = () => {
    setShopHomeBannerIndex((prev) => (prev - 1 + shopHomeHeroSlides.length) % shopHomeHeroSlides.length);
  };

  const goNextShopHomeBanner = () => {
    setShopHomeBannerIndex((prev) => (prev + 1) % shopHomeHeroSlides.length);
  };

  const handleShopHomeBannerPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (shopHomeHeroSlides.length <= 1) return;
    shopHomeBannerPointerActiveRef.current = true;
    shopHomeBannerPointerStartXRef.current = event.clientX;
    setShopHomeBannerDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleShopHomeBannerPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!shopHomeBannerPointerActiveRef.current || shopHomeBannerPointerStartXRef.current === null) return;
    setShopHomeBannerDragOffset(event.clientX - shopHomeBannerPointerStartXRef.current);
  };

  const finishShopHomeBannerDrag = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!shopHomeBannerPointerActiveRef.current) return;
    const dragThreshold = 42;
    if (shopHomeBannerDragOffset <= -dragThreshold) {
      goNextShopHomeBanner();
    } else if (shopHomeBannerDragOffset >= dragThreshold) {
      goPrevShopHomeBanner();
    }
    shopHomeBannerPointerActiveRef.current = false;
    shopHomeBannerPointerStartXRef.current = null;
    setShopHomeBannerDragOffset(0);
  };

  const refreshHomeFeedAtTop = useCallback(() => {
    if (homeFeedRefreshing) return;
    setHomeFeedRefreshing(true);

    window.setTimeout(() => {
      const visibleIds = new Set(homeFeedSource.map((item) => item.id));
      const viewedIds = new Set(homeFeedViewedIdsRef.current);
      const usedTemplateIds = new Set(homeFeedRefreshUsedTemplateIdsRef.current);

      const primaryCandidates = recommendedHomeFeed.filter((item) => !visibleIds.has(item.id) && !viewedIds.has(item.id) && !usedTemplateIds.has(item.id));
      const secondaryCandidates = recommendedHomeFeed.filter((item) => !visibleIds.has(item.id) && !usedTemplateIds.has(item.id));
      const fallbackCandidates = chronologicalHomeFeed.filter((item) => !visibleIds.has(item.id) && !usedTemplateIds.has(item.id));
      const selectedTemplates = (primaryCandidates.length ? primaryCandidates : secondaryCandidates.length ? secondaryCandidates : fallbackCandidates)
        .slice(0, HOME_FEED_REFRESH_BATCH_SIZE);

      if (!selectedTemplates.length) {
        setHomeFeedRefreshing(false);
        setHomeFeedPullDistance(0);
        showListEndToast("새로 불러올 관심 피드가 없습니다");
        return;
      }

      const nextStartId = Math.max(...allFeedItems.map((item) => item.id), 0) + 1;
      const freshItems = selectedTemplates.map((item, index) => buildFreshFeedItemFromTemplate(item, nextStartId + index, index));

      setCustomFeedItems((prev) => [...freshItems, ...prev]);
      setFeedCommentMap((prev) => {
        const next = { ...prev };
        freshItems.forEach((item) => {
          if (!next[item.id]) next[item.id] = [];
        });
        return next;
      });

      homeFeedRefreshUsedTemplateIdsRef.current = Array.from(new Set([...homeFeedRefreshUsedTemplateIdsRef.current, ...selectedTemplates.map((item) => item.id)])).slice(-240);
      homeFeedViewedIdsRef.current = Array.from(new Set([...homeFeedViewedIdsRef.current, ...selectedTemplates.map((item) => item.id), ...freshItems.map((item) => item.id)])).slice(-240);

      setHomeFeedVisibleCount((prev) => Math.max(prev, HOME_FEED_BATCH_SIZE));
      setHomeFeedHeaderHidden(false);
      homeFeedHideThresholdRef.current = 0;
      homeFeedShowThresholdRef.current = 0;
      lastHomeFeedScrollTopRef.current = 0;
      const node = homeFeedScrollRef.current;
      if (node) node.scrollTop = 0;
      persistHomeFeedState({ visibleCount: Math.max(homeFeedVisibleCount, HOME_FEED_BATCH_SIZE), scrollTop: 0, lastInactiveAt: 0 });
      setHomeFeedRefreshing(false);
      setHomeFeedPullDistance(0);
    }, 620);
  }, [allFeedItems, chronologicalHomeFeed, homeFeedRefreshing, homeFeedSource, homeFeedVisibleCount, persistHomeFeedState, recommendedHomeFeed, showListEndToast]);

  const handleHomeFeedPullStart = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
    if (homeFeedRefreshing) return;
    const node = homeFeedScrollRef.current;
    if (!node || node.scrollTop > 0) {
      homeFeedPullActiveRef.current = false;
      homeFeedPullStartYRef.current = null;
      return;
    }
    homeFeedPullActiveRef.current = true;
    homeFeedPullStartYRef.current = event.touches[0]?.clientY ?? null;
  }, [homeFeedRefreshing]);

  const handleHomeFeedPullMove = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
    if (!homeFeedPullActiveRef.current || homeFeedRefreshing) return;
    const startY = homeFeedPullStartYRef.current;
    const currentY = event.touches[0]?.clientY ?? null;
    const node = homeFeedScrollRef.current;
    if (startY === null || currentY === null || !node || node.scrollTop > 0) {
      homeFeedPullActiveRef.current = false;
      homeFeedPullStartYRef.current = null;
      setHomeFeedPullDistance(0);
      return;
    }
    const delta = Math.max(0, currentY - startY);
    const nextDistance = Math.min(HOME_FEED_PULL_MAX, Math.round(delta * 0.45));
    setHomeFeedPullDistance(nextDistance);
    if (nextDistance > 0) {
      event.preventDefault();
    }
  }, [homeFeedRefreshing]);

  const handleHomeFeedPullEnd = useCallback(() => {
    if (!homeFeedPullActiveRef.current) return;
    homeFeedPullActiveRef.current = false;
    homeFeedPullStartYRef.current = null;

    if (homeFeedPullDistance >= HOME_FEED_PULL_TRIGGER) {
      setHomeFeedPullDistance(HOME_FEED_PULL_TRIGGER);
      refreshHomeFeedAtTop();
      return;
    }

    setHomeFeedPullDistance(0);
  }, [homeFeedPullDistance, refreshHomeFeedAtTop]);

  const handleHomeFeedScroll = useCallback((event: ReactUIEvent<HTMLDivElement>) => {
    const node = event.currentTarget;
    const currentTop = node.scrollTop;
    const remain = node.scrollHeight - currentTop - node.clientHeight;
    persistHomeFeedState({ scrollTop: currentTop });

    if (node.scrollTop + node.clientHeight >= node.scrollHeight - 160) {
      setHomeFeedVisibleCount((prev) => {
        const next = prev >= activeHomeFeedItems.length ? prev : Math.min(prev + HOME_FEED_BATCH_SIZE, activeHomeFeedItems.length);
        if (next !== prev) {
          persistHomeFeedState({ visibleCount: next, scrollTop: currentTop });
        }
        return next;
      });
    }

    if (activeHomeFeedItems.length > 0 && remain <= 48 && homeFeedVisibleCount >= activeHomeFeedItems.length) {
      showListEndToast("모든 피드를 확인하였습니다");
    }

    if (homeFeedScrollRafRef.current !== null) {
      window.cancelAnimationFrame(homeFeedScrollRafRef.current);
    }

    homeFeedScrollRafRef.current = window.requestAnimationFrame(() => {
      const prevTop = lastHomeFeedScrollTopRef.current;
      const delta = currentTop - prevTop;
      lastHomeFeedScrollTopRef.current = currentTop;

      if (currentTop <= 8) {
        homeFeedHideThresholdRef.current = 0;
        homeFeedShowThresholdRef.current = 0;
        if (homeFeedHeaderHidden) {
          setHomeFeedHeaderHidden(false);
        }
        return;
      }

      if (delta > 2) {
        homeFeedHideThresholdRef.current += delta;
        homeFeedShowThresholdRef.current = 0;
      } else if (delta < -2) {
        homeFeedShowThresholdRef.current += Math.abs(delta);
        homeFeedHideThresholdRef.current = 0;
      }

      if (!homeFeedHeaderHidden && homeFeedHideThresholdRef.current >= 28 && currentTop > 32) {
        homeFeedHideThresholdRef.current = 0;
        setHomeFeedHeaderHidden(true);
      } else if (homeFeedHeaderHidden && homeFeedShowThresholdRef.current >= 18) {
        homeFeedShowThresholdRef.current = 0;
        setHomeFeedHeaderHidden(false);
      }
    });
  }, [activeHomeFeedItems.length, homeFeedHeaderHidden, homeFeedVisibleCount, persistHomeFeedState, showListEndToast]);

  const handleShopHomeScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    const node = event.currentTarget;
    if (node.scrollTop + node.clientHeight < node.scrollHeight - 120) return;
    setShopHomeVisibleCount((prev) => prev + 9);
  };

  const handleShopHomeGridPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    shopHomeGridHasDraggedRef.current = false;
    shopHomeGridDraggingRef.current = true;
    setShopHomeGridDragging(true);
    shopHomeGridDragStartYRef.current = event.clientY;
    shopHomeGridDragStartScrollTopRef.current = event.currentTarget.scrollTop;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleShopHomeGridPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!shopHomeGridDraggingRef.current || shopHomeGridDragStartYRef.current === null) return;
    const deltaY = event.clientY - shopHomeGridDragStartYRef.current;
    if (Math.abs(deltaY) > 4) {
      shopHomeGridHasDraggedRef.current = true;
      shopHomeGridSuppressClickUntilRef.current = Date.now() + 260;
    }
    event.currentTarget.scrollTop = shopHomeGridDragStartScrollTopRef.current - deltaY;
    event.preventDefault();
  };

  const finishShopHomeGridTouchDrag = () => {
    shopHomeGridDraggingRef.current = false;
    setShopHomeGridDragging(false);
    shopHomeGridDragStartYRef.current = null;
  };

  const finishShopHomeGridPointerDrag = (event?: PointerEvent<HTMLDivElement>) => {
    if (event) {
      try {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      } catch {}
    }
    shopHomeGridDraggingRef.current = false;
    setShopHomeGridDragging(false);
    shopHomeGridDragStartYRef.current = null;
  };

  const handleShopHomeProductCardClick = (productId: number) => {
    if (Date.now() < shopHomeGridSuppressClickUntilRef.current) return;
    openProductDetail(productId);
  };

  const filteredCommunity = useMemo(() => {
    const keyword = `${communityKeyword} ${globalKeyword}`.trim().toLowerCase();
    const visiblePosts = communitySeed.filter((post) => {
      const boardMatch = communityTab === "이벤트" ? post.board === "이벤트" : communityTab === "커뮤" ? (post.board === "커뮤" || !post.board) : post.board === communityTab;
      const categoryMatch = selectedCommunityCategory === "전체" || post.category === selectedCommunityCategory;
      const primaryMatch = communityPrimaryFilter === "전체" || post.audience === communityPrimaryFilter;
      const keywordMatch = !keyword || `${post.title} ${post.summary} ${post.category}`.toLowerCase().includes(keyword);
      return boardMatch && categoryMatch && primaryMatch && keywordMatch;
    });

    if (communitySecondaryFilter === "최신순" || communitySecondaryFilter === "전체") {
      return visiblePosts;
    }
    if (communitySecondaryFilter === "공지우선") {
      return [...visiblePosts].sort((a, b) => {
        if (a.category === "공지" && b.category !== "공지") return -1;
        if (a.category !== "공지" && b.category === "공지") return 1;
        return (b.sortScore ?? 0) - (a.sortScore ?? 0);
      });
    }
    if (communitySecondaryFilter === "인기순") {
      return [...visiblePosts].sort((a, b) => (b.sortScore ?? 0) - (a.sortScore ?? 0));
    }
    return visiblePosts;
  }, [communityTab, selectedCommunityCategory, communityKeyword, globalKeyword, communityPrimaryFilter, communitySecondaryFilter]);

  useEffect(() => {
    setCommunityPage(1);
  }, [communityTab, selectedCommunityCategory, communityPrimaryFilter, communitySecondaryFilter, communityKeyword, globalKeyword]);

  const COMMUNITY_PAGE_SIZE = 8;
  const communityPageCount = Math.max(1, Math.ceil(filteredCommunity.length / COMMUNITY_PAGE_SIZE));
  const pagedCommunity = useMemo(() => {
    const start = (communityPage - 1) * COMMUNITY_PAGE_SIZE;
    return filteredCommunity.slice(start, start + COMMUNITY_PAGE_SIZE);
  }, [filteredCommunity, communityPage]);

  const communityDisplayRows = useMemo(() => (
    Array.from({ length: COMMUNITY_PAGE_SIZE }, (_, index) => pagedCommunity[index] ?? null)
  ), [pagedCommunity]);

  useEffect(() => {
    setCommunityExplorerStage("list");
    setSelectedCommunityPost(null);
  }, [communityTab, selectedCommunityCategory, communityPrimaryFilter, communitySecondaryFilter, communityPage]);

  const openCommunityPost = useCallback((post: CommunityPost) => {
    setSelectedCommunityPost(post);
    if (post.contentType === "test") {
      setTestAnswers({});
    }
    setCommunityExplorerStage(post.contentType === "test" ? "test_intro" : "detail");
  }, []);

  const closeCommunityExplorer = useCallback(() => {
    setCommunityExplorerStage("list");
    setSelectedCommunityPost(null);
  }, []);

  const resetCommunityTest = useCallback(() => {
    setTestAnswers({});
    setCommunityExplorerStage(selectedCommunityPost?.contentType === "test" ? "test_intro" : "detail");
  }, [selectedCommunityPost]);

  const testAnsweredCount = useMemo(() => Object.keys(testAnswers).length, [testAnswers]);
  const currentTestQuestionIndex = useMemo(() => {
    const firstEmpty = testQuestions.findIndex((question) => testAnswers[question.id] === undefined);
    return firstEmpty === -1 ? testQuestions.length - 1 : firstEmpty;
  }, [testAnswers]);
  const currentTestQuestion = testQuestions[currentTestQuestionIndex];

  const testResultRows = useMemo(() => {
    const rawScores = testQuestions.reduce((acc, question) => {
      const answer = testAnswers[question.id];
      Object.entries(question.weights).forEach(([axis, weight]) => {
        const key = axis as TestAxisKey;
        acc[key] = (acc[key] ?? 0) + (answer ?? 0) * weight;
      });
      return acc;
    }, {} as Record<TestAxisKey, number>);

    return (Object.keys(testAxisMeta) as TestAxisKey[])
      .map((axis) => {
        const raw = rawScores[axis] ?? 0;
        const max = Math.max(testMaxScores[axis] ?? 1, 1);
        const normalized = Math.round(((raw + max) / (max * 2)) * 100);
        return {
          axis,
          label: testAxisMeta[axis].label,
          summary: testAxisMeta[axis].summary,
          score: Math.max(0, Math.min(100, normalized)),
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [testAnswers]);

  const testTopResults = testResultRows.slice(0, 5);
  const testCanShowResult = testAnsweredCount === testQuestionCount;

  const answerCommunityTestQuestion = useCallback((questionId: number, score: number) => {
    setTestAnswers((prev) => ({ ...prev, [questionId]: score }));
  }, []);

  const filteredThreads = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    return threadItems.filter((thread) => {
      if (thread.status === '요청받음') return false;
      const isOneToOne = thread.purpose.includes("상호수락 1:1");
      const isShoppingThread = ["상품/운영 문의", "정산/환불", "쇼핑 주문", "구매자 지원"].includes(thread.purpose);
      const categoryMatch = chatCategory === "전체"
        || (chatCategory === "즐겨찾기" && !!thread.favorite)
        || (chatCategory === "개인" && isOneToOne)
        || (chatCategory === "단체" && thread.kind === "단체")
        || (chatCategory === "쇼핑" && isShoppingThread);
      const keywordMatch = !keyword || `${thread.name} ${thread.preview} ${thread.purpose}`.toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });
  }, [globalKeyword, chatCategory, threadItems]);

  useEffect(() => {
    setChatVisibleCount(30);
  }, [chatCategory, globalKeyword]);

  const pagedThreads = useMemo(() => filteredThreads.slice(0, chatVisibleCount), [filteredThreads, chatVisibleCount]);
  const chatDisplayRows = useMemo(() => {
    const rowCount = Math.max(CHAT_LIST_BASE_ROWS, pagedThreads.length);
    return Array.from({ length: rowCount }, (_, index) => pagedThreads[index] ?? null);
  }, [pagedThreads]);

  const chatDiscoveryCandidates = useMemo<ChatDiscoveryCandidate[]>(() => {
    const byName = new Map<string, ChatDiscoveryCandidate>();
    const pushCandidate = (candidate: ChatDiscoveryCandidate) => {
      const key = `${candidate.name}-${candidate.kind}-${candidate.sourceTitle}`;
      if (!candidate.name || candidate.name === currentProfileMeta.name || byName.has(key)) return;
      byName.set(key, candidate);
    };

    allFeedItems
      .filter((item) => item.type === "image")
      .slice(0, 8)
      .forEach((item) => pushCandidate({
        id: `feed-${item.id}`,
        name: item.author,
        kind: "피드",
        sourceTitle: item.title,
        description: `${item.title || item.category} 주제로 피드를 올린 회원`,
        avatarUrl: buildChatAvatarDataUri(item.author),
      }));

    shortsFeedItems
      .slice(0, 8)
      .forEach((item) => pushCandidate({
        id: `shorts-${item.id}`,
        name: item.author,
        kind: "쇼츠",
        sourceTitle: item.title,
        description: `${item.title || item.category} 제목으로 쇼츠를 올린 회원`,
        avatarUrl: buildChatAvatarDataUri(item.author),
      }));

    communitySeed
      .slice(0, 8)
      .forEach((item) => {
        const author = (item.meta.split("·")[0] || "community_user").trim();
        pushCandidate({
          id: `community-${item.id}`,
          name: author,
          kind: "소통",
          sourceTitle: item.title,
          description: `${item.title} 게시판 제목으로 올린 회원`,
          avatarUrl: buildChatAvatarDataUri(author),
        });
      });

    questionSeed
      .slice(0, 8)
      .forEach((item) => pushCandidate({
        id: `question-${item.id}`,
        name: item.author,
        kind: "질문",
        sourceTitle: item.question,
        description: `${item.question.slice(0, 22)}${item.question.length > 22 ? "..." : ""} 질문을 나에게 한 회원`,
        avatarUrl: buildChatAvatarDataUri(item.author),
      }));

    const base = Array.from(byName.values());
    if (chatDiscoveryCategory === "추천") {
      return base.filter((item) => item.kind === "피드" || item.kind === "쇼츠").slice(0, 20);
    }
    if (chatDiscoveryCategory === "자유") {
      return base.filter((item) => item.kind === "소통" || item.kind === "질문").slice(0, 20);
    }
    return base.slice(0, 20);
  }, [allFeedItems, chatDiscoveryCategory, currentProfileMeta.name, shortsFeedItems]);

  const activeChatThread = useMemo(() => threadItems.find((item) => item.id === activeChatThreadId) ?? null, [threadItems, activeChatThreadId]);
  const activeChatMessages = activeChatThread ? (chatMessagesByThread[activeChatThread.id] ?? []) : [];
  const activePinnedMessage = useMemo(() => {
    if (!activeChatThread) return null;
    const pinnedId = chatPinnedMessageByThread[activeChatThread.id];
    if (!pinnedId) return null;
    return activeChatMessages.find((message) => message.id === pinnedId) ?? null;
  }, [activeChatMessages, activeChatThread, chatPinnedMessageByThread]);
  const selectedChatRequest = useMemo(() => {
    if (selectedChatRequestId === null) return chatRequestItems[0] ?? null;
    return chatRequestItems.find((item) => item.id === selectedChatRequestId) ?? chatRequestItems[0] ?? null;
  }, [chatRequestItems, selectedChatRequestId]);
  const filteredChatShareTargets = useMemo(() => {
    const keyword = chatShareKeyword.trim().toLowerCase();
    return threadItems.filter((thread) => {
      if (thread.id === activeChatThreadId) return false;
      if (!keyword) return true;
      return `${thread.name} ${thread.purpose} ${thread.preview}`.toLowerCase().includes(keyword);
    });
  }, [activeChatThreadId, chatShareKeyword, threadItems]);

  const chatPickerCollections = useMemo(() => {
    return [
      { key: 'recent', label: '최근사용' },
      { key: 'all', label: '모든' },
      ...CHAT_PICKER_LIBRARY[chatEmojiMode].map((item) => ({ key: item.key, label: item.label })),
    ];
  }, [chatEmojiMode]);
  const chatPickerItems = useMemo(() => {
    const keyword = chatEmojiKeyword.trim().toLowerCase();
    const baseItems = chatEmojiCollectionKey === 'recent'
      ? chatRecentPickerItems[chatEmojiMode]
      : chatEmojiCollectionKey === 'all'
        ? CHAT_PICKER_LIBRARY[chatEmojiMode].flatMap((item) => item.items)
        : CHAT_PICKER_LIBRARY[chatEmojiMode].find((item) => item.key === chatEmojiCollectionKey)?.items ?? [];
    return Array.from(new Set(baseItems)).filter((item) => !keyword || item.toLowerCase().includes(keyword));
  }, [chatEmojiCollectionKey, chatEmojiKeyword, chatEmojiMode, chatRecentPickerItems]);

  const canManageChatMessage = useCallback((message: ChatRoomMessage) => {
    if (!message.mine || message.system) return false;
    return Date.now() - (message.createdAt ?? Date.now()) <= 60 * 60 * 1000;
  }, []);

  const appendOutgoingChatMessage = useCallback((rawText: string, contentKind: ChatRoomMessage["contentKind"] = "text") => {
    if (!activeChatThread) return;
    const trimmed = rawText.trim();
    if (!trimmed) return;
    const now = Date.now();
    const previewText = contentKind === "sticker" ? `[스티커] ${trimmed}` : contentKind === "gif" ? `[GIF] ${trimmed}` : trimmed;
    const myMessage: ChatRoomMessage = {
      id: now,
      threadId: activeChatThread.id,
      author: '나',
      text: trimmed,
      meta: formatChatMessageMeta(now),
      mine: true,
      createdAt: now,
      replyTo: chatReplyTarget ? { id: chatReplyTarget.id, author: chatReplyTarget.author, text: chatReplyTarget.text } : null,
      contentKind,
    };

    if (activeChatThread.status === '요청전송') {
      setChatMessagesByThread((prev) => ({
        ...prev,
        [activeChatThread.id]: [...(prev[activeChatThread.id] ?? []), myMessage],
      }));
      setThreadItems((prev) => prev.map((item) => item.id === activeChatThread.id ? { ...item, preview: previewText, time: '방금', unread: 0, status: '요청전송' } : item));
      setChatReplyTarget(null);
      setChatRoomDraft('');
      setChatAttachmentSheetOpen(false);
      setChatEmojiSheetOpen(false);
      setChatLongPressHint('상대방이 아직 요청을 수락하지 않아 답장은 시작되지 않았습니다.');
      return;
    }

    if (activeChatThread.status === '요청받음') {
      const acceptedSystemMessage: ChatRoomMessage = {
        id: now + 1,
        threadId: activeChatThread.id,
        author: 'system',
        text: '첫 메시지를 보내 채팅 요청을 수락했습니다. 이제 일반 채팅 목록에서 이어서 대화할 수 있습니다.',
        meta: '지금',
        system: true,
        createdAt: now + 1,
      };
      setChatMessagesByThread((prev) => ({
        ...prev,
        [activeChatThread.id]: [...(prev[activeChatThread.id] ?? []), myMessage, acceptedSystemMessage],
      }));
      setThreadItems((prev) => prev.map((item) => item.id === activeChatThread.id ? { ...item, preview: previewText, time: '방금', unread: 0, status: '수락완료' } : item));
      setChatRequestItems((prev) => prev.filter((item) => item.id !== activeChatThread.id));
      setChatReplyTarget(null);
      setChatRoomDraft('');
      setChatAttachmentSheetOpen(false);
      setChatEmojiSheetOpen(false);
      setChatLongPressHint('첫 메시지 전송으로 채팅 요청이 수락되었습니다.');
      return;
    }

    const replyText = activeChatThread.kind === '단체'
      ? '방 주제에 맞는 대화로 이어가 주세요. 최근 메시지 아래에 순서대로 반영했습니다.'
      : '메시지를 확인했습니다. 지금 채팅방에서 바로 이어서 대화를 진행할 수 있습니다.';
    const replyMessage: ChatRoomMessage = {
      id: now + 1,
      threadId: activeChatThread.id,
      author: activeChatThread.name,
      text: replyText,
      meta: formatChatMessageMeta(now + 1),
      mine: false,
      createdAt: now + 1,
      contentKind: 'text',
    };
    setChatMessagesByThread((prev) => ({
      ...prev,
      [activeChatThread.id]: [...(prev[activeChatThread.id] ?? []), myMessage, replyMessage],
    }));
    setThreadItems((prev) => prev.map((item) => item.id === activeChatThread.id ? { ...item, preview: previewText, time: '방금', unread: 0 } : item));
    setChatReplyTarget(null);
    setChatRoomDraft('');
    setChatAttachmentSheetOpen(false);
    setChatEmojiSheetOpen(false);
  }, [activeChatThread, chatReplyTarget]);

  const handleChatEmojiSearch = useCallback(() => {
    setChatEmojiCollectionKey('all');
    setChatLongPressHint(`${chatEmojiMode} 검색 결과 ${chatPickerItems.length}건을 표시합니다.`);
  }, [chatEmojiMode, chatPickerItems.length]);

  const handleChatEmojiStoreOpen = useCallback(() => {
    setChatLongPressHint(`${chatEmojiMode} 상점 화면은 준비 중입니다.`);
  }, [chatEmojiMode]);

  const handleChatPickerSelect = useCallback((item: string) => {
    const contentKind = chatEmojiMode === '이모티콘' ? 'emoji' : chatEmojiMode === '스티커' ? 'sticker' : 'gif';
    setChatRecentPickerItems((prev) => ({
      ...prev,
      [chatEmojiMode]: [item, ...prev[chatEmojiMode].filter((entry) => entry !== item)].slice(0, 12),
    }));
    appendOutgoingChatMessage(item, contentKind);
    setChatLongPressHint(`${chatEmojiMode}이 전송되었습니다.`);
  }, [appendOutgoingChatMessage, chatEmojiMode]);

  const handleChatQuickShareAction = useCallback((label: string) => {
    setChatAttachmentSheetOpen(false);
    setChatEmojiSheetOpen(false);
    setChatLongPressHint(`${label} 메뉴가 열렸습니다.`);
  }, []);

  const openChatMessageMenu = useCallback((message: ChatRoomMessage) => {
    setChatContextMessage(message);
    setChatAttachmentSheetOpen(false);
    setChatEmojiSheetOpen(false);
  }, []);

  const clearChatMessageHold = useCallback(() => {
    if (chatMessageHoldTimerRef.current !== null) {
      window.clearTimeout(chatMessageHoldTimerRef.current);
      chatMessageHoldTimerRef.current = null;
    }
  }, []);

  const startChatMessageHold = useCallback((message: ChatRoomMessage) => {
    clearChatMessageHold();
    chatMessageHoldTimerRef.current = window.setTimeout(() => {
      openChatMessageMenu(message);
      chatMessageHoldTimerRef.current = null;
    }, 420);
  }, [clearChatMessageHold, openChatMessageMenu]);

  useEffect(() => () => {
    if (chatMessageHoldTimerRef.current !== null) {
      window.clearTimeout(chatMessageHoldTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!chatMessageListRef.current) return;
    chatMessageListRef.current.scrollTop = chatMessageListRef.current.scrollHeight;
  }, [activeChatMessages.length, activeChatThreadId]);

  useEffect(() => {
    if (!chatLongPressHint) return;
    const timer = window.setTimeout(() => setChatLongPressHint(''), 2200);
    return () => window.clearTimeout(timer);
  }, [chatLongPressHint]);

  useEffect(() => {
    setChatEmojiCollectionKey('recent');
    setChatEmojiKeyword('');
  }, [chatEmojiMode]);

  useEffect(() => {
    if (!chatRequestItems.length) {
      setSelectedChatRequestId(null);
      return;
    }
    if (selectedChatRequestId !== null && chatRequestItems.some((item) => item.id === selectedChatRequestId)) {
      return;
    }
    setSelectedChatRequestId(chatRequestItems[0].id);
  }, [chatRequestItems, selectedChatRequestId]);

  const openChatThread = useCallback((thread: ThreadItem) => {
    setChatListMode('threads');
    setActiveChatThreadId(thread.id);
    setThreadItems((prev) => prev.map((item) => item.id === thread.id ? { ...item, unread: 0 } : item));
    setChatMessagesByThread((prev) => prev[thread.id] ? prev : { ...prev, [thread.id]: createThreadRoomSeed(thread) });
    setChatAttachmentSheetOpen(false);
    setChatEmojiSheetOpen(false);
    setChatContextMessage(null);
    setChatReplyTarget(null);
    setChatEditableMessageId(null);
    setChatSelectableMessageId(null);
    setChatShareMessage(null);
    setChatShareKeyword('');
  }, []);

  const openIncomingChatRequest = useCallback((request: ChatRequestItem) => {
    const existing = threadItems.find((item) => item.name === request.name && item.purpose === '상호수락 1:1');

    if (existing && existing.status !== '요청받음') {
      openChatThread(existing);
      setChatTab('채팅');
      setActiveTab('채팅');
      return;
    }

    const pendingThread: ThreadItem = existing
      ? { ...existing, preview: request.requestText, time: request.time, unread: 0, favorite: true, status: '요청받음' }
      : {
          id: request.id,
          name: request.name,
          purpose: '상호수락 1:1',
          preview: request.requestText,
          time: request.time,
          unread: 0,
          avatar: request.avatar,
          avatarUrl: request.avatarUrl ?? buildChatAvatarDataUri(request.name),
          kind: '개인',
          favorite: true,
          status: '요청받음',
        };

    setThreadItems((prev) => existing ? prev.map((item) => item.id === existing.id ? pendingThread : item) : [pendingThread, ...prev]);
    setChatMessagesByThread((prev) => prev[pendingThread.id] ? prev : { ...prev, [pendingThread.id]: createThreadRoomSeed(pendingThread) });
    openChatThread(pendingThread);
    setChatTab('채팅');
    setActiveTab('채팅');
  }, [openChatThread, setActiveTab, setChatTab, threadItems]);

  const requestChatFromDiscoveryCandidate = useCallback((candidate: ChatDiscoveryCandidate) => {
    const existing = threadItems.find((item) => item.name === candidate.name && item.purpose === '상호수락 1:1');
    const preview = `${candidate.kind}에서 본 회원에게 채팅 요청을 보냈습니다.`;
    const nextThread: ThreadItem = existing
      ? { ...existing, preview, time: '방금', unread: 0, favorite: true, status: existing.status === '수락완료' ? existing.status : '요청전송' }
      : {
          id: Date.now(),
          name: candidate.name,
          purpose: '상호수락 1:1',
          preview,
          time: '방금',
          unread: 0,
          avatar: candidate.name.slice(0, 1).toUpperCase(),
          avatarUrl: candidate.avatarUrl ?? buildChatAvatarDataUri(candidate.name),
          kind: '개인',
          favorite: true,
          status: '요청전송',
        };

    setThreadItems((prev) => existing ? prev.map((item) => item.id === existing.id ? nextThread : item) : [nextThread, ...prev]);
    setChatMessagesByThread((prev) => prev[nextThread.id] ? prev : { ...prev, [nextThread.id]: createThreadRoomSeed(nextThread) });
    setChatDiscoveryOpen(false);
    setChatCreateLauncherOpen(false);
    setChatTab('채팅');
    setActiveTab('채팅');
    openChatThread(nextThread);
    setChatLongPressHint(`${candidate.name} 님에게 채팅 요청을 보냈습니다.`);
  }, [openChatThread, setActiveTab, setChatTab, threadItems]);

  const deleteChatRequest = useCallback((request: ChatRequestItem) => {
    setChatRequestItems((prev) => prev.filter((item) => item.id !== request.id));
    setThreadItems((prev) => prev.filter((item) => item.id !== request.id));
    setChatMessagesByThread((prev) => {
      if (!(request.id in prev)) return prev;
      const next = { ...prev };
      delete next[request.id];
      return next;
    });
    if (activeChatThreadId === request.id) {
      setActiveChatThreadId(null);
      setChatRoomDraft('');
      setChatAttachmentSheetOpen(false);
      setChatEmojiSheetOpen(false);
      setChatContextMessage(null);
      setChatReplyTarget(null);
      setChatEditableMessageId(null);
      setChatSelectableMessageId(null);
      setChatShareMessage(null);
      setChatShareKeyword('');
      setChatCopiedSelection('');
      setChatListMode('requests');
    }
    setChatLongPressHint(`${request.name} 님 요청을 삭제했습니다.`);
  }, [activeChatThreadId]);

  const openProfileChatRequest = useCallback(() => {
    if (currentProfileMeta.isOwner) return;
    const targetName = currentProfileMeta.name;
    const existing = threadItems.find((item) => item.name === targetName && item.purpose === '상호수락 1:1');
    const acceptedStatuses = new Set(['수락완료', '활성']);

    if (existing) {
      const nextStatus = acceptedStatuses.has(existing.status ?? '') ? existing.status : '요청전송';
      const nextPreview = acceptedStatuses.has(existing.status ?? '')
        ? existing.preview
        : '채팅 요청을 보냈습니다. 상대방 수락 후 답장이 가능합니다.';
      const nextThread = { ...existing, status: nextStatus, preview: nextPreview, time: acceptedStatuses.has(existing.status ?? '') ? existing.time : '방금', unread: 0 };
      setThreadItems((prev) => prev.map((item) => item.id === existing.id ? nextThread : item));
      setChatMessagesByThread((prev) => prev[existing.id] ? prev : { ...prev, [existing.id]: createThreadRoomSeed(nextThread) });
      openChatThread(nextThread);
      setChatTab('채팅');
      setActiveTab('채팅');
      return;
    }

    const newThread: ThreadItem = {
      id: Date.now(),
      name: targetName,
      purpose: '상호수락 1:1',
      preview: '채팅 요청을 보냈습니다. 상대방 수락 후 답장이 가능합니다.',
      time: '방금',
      unread: 0,
      avatar: currentProfileMeta.avatar,
      avatarUrl: buildChatAvatarDataUri(targetName),
      kind: '개인',
      favorite: true,
      status: '요청전송',
    };
    setThreadItems((prev) => [newThread, ...prev]);
    setChatMessagesByThread((prev) => ({ ...prev, [newThread.id]: createThreadRoomSeed(newThread) }));
    openChatThread(newThread);
    setChatTab('채팅');
    setActiveTab('채팅');
  }, [currentProfileMeta, openChatThread, setActiveTab, setChatTab, threadItems]);

  const acceptChatRequest = useCallback((request: ChatRequestItem) => {
    const existing = threadItems.find((item) => item.name === request.name && item.purpose === '상호수락 1:1');
    const acceptedThread: ThreadItem = existing
      ? { ...existing, preview: request.requestText, time: '방금', unread: 0, favorite: true, status: '수락완료' }
      : {
          id: Date.now(),
          name: request.name,
          purpose: '상호수락 1:1',
          preview: request.requestText,
          time: '방금',
          unread: 0,
          avatar: request.avatar,
          avatarUrl: request.avatarUrl ?? buildChatAvatarDataUri(request.name),
          kind: '개인',
          favorite: true,
          status: '수락완료',
        };

    setThreadItems((prev) => existing ? prev.map((item) => item.id === acceptedThread.id ? acceptedThread : item) : [acceptedThread, ...prev]);
    setChatMessagesByThread((prev) => ({
      ...prev,
      [acceptedThread.id]: [
        ...createThreadRoomSeed(acceptedThread),
        {
          id: acceptedThread.id * 100 + 88,
          threadId: acceptedThread.id,
          author: 'system',
          text: '채팅 요청을 수락했습니다. 이제 서로 답장이 가능합니다.',
          meta: '지금',
          system: true,
          createdAt: Date.now() - 60000,
        },
      ],
    }));
    setChatRequestItems((prev) => prev.filter((item) => item.id !== request.id));
    setChatLongPressHint(`${request.name} 님 요청을 수락했습니다.`);
    openChatThread(acceptedThread);
    setChatCategory('전체');
    setChatTab('채팅');
    setActiveTab('채팅');
  }, [openChatThread, setActiveTab, setChatTab, threadItems]);

  const closeActiveChatThread = useCallback(() => {
    setActiveChatThreadId(null);
    setChatRoomDraft('');
    setChatAttachmentSheetOpen(false);
    setChatEmojiSheetOpen(false);
    setChatContextMessage(null);
    setChatReplyTarget(null);
    setChatEditableMessageId(null);
    setChatSelectableMessageId(null);
    setChatShareMessage(null);
    setChatShareKeyword('');
    setChatCopiedSelection('');
  }, []);

  const submitChatRoomMessage = useCallback(() => {
    if (!activeChatThread) return;
    const trimmed = chatRoomDraft.trim();
    if (!trimmed) return;

    if (chatEditableMessageId !== null) {
      setChatMessagesByThread((prev) => ({
        ...prev,
        [activeChatThread.id]: (prev[activeChatThread.id] ?? []).map((message) => (
          message.id === chatEditableMessageId
            ? { ...message, text: trimmed, meta: formatChatMessageMeta(message.createdAt, true), edited: true }
            : message
        )),
      }));
      setThreadItems((prev) => prev.map((item) => item.id === activeChatThread.id ? { ...item, preview: trimmed, time: '방금', unread: 0 } : item));
      setChatEditableMessageId(null);
      setChatReplyTarget(null);
      setChatRoomDraft('');
      setChatLongPressHint('메시지가 수정되었습니다.');
      return;
    }

    appendOutgoingChatMessage(trimmed, 'text');
  }, [activeChatThread, appendOutgoingChatMessage, chatEditableMessageId, chatRoomDraft]);

  const applyChatReaction = useCallback((message: ChatRoomMessage, reaction: ChatRoomReactionKey) => {
    setChatMessagesByThread((prev) => ({
      ...prev,
      [message.threadId]: (prev[message.threadId] ?? []).map((item) => item.id === message.id ? { ...item, reaction } : item),
    }));
    setChatContextMessage(null);
    setChatLongPressHint(`${CHAT_REACTION_OPTIONS.find((item) => item.key === reaction)?.label ?? '이모지'} 반응을 남겼습니다.`);
  }, []);

  const copyChatMessage = useCallback((message: ChatRoomMessage) => {
    copyToClipboard(message.text);
    setChatContextMessage(null);
    setChatLongPressHint('메시지를 복사했습니다.');
  }, []);

  const enableChatSelectionCopy = useCallback((message: ChatRoomMessage) => {
    setChatContextMessage(null);
    setChatSelectableMessageId(message.id);
    setChatCopiedSelection('');
    setChatLongPressHint('메시지 일부를 드래그해 선택한 뒤 복사 버튼을 눌러주세요.');
  }, []);

  const copySelectedChatText = useCallback(() => {
    const selectedText = typeof window !== 'undefined' ? window.getSelection?.()?.toString().trim() ?? '' : '';
    const fallback = activeChatMessages.find((message) => message.id === chatSelectableMessageId)?.text ?? '';
    const nextText = selectedText || fallback;
    if (!nextText) return;
    copyToClipboard(nextText);
    setChatCopiedSelection(nextText);
    setChatLongPressHint('선택한 텍스트를 복사했습니다.');
  }, [activeChatMessages, chatSelectableMessageId]);

  const pinChatMessage = useCallback((message: ChatRoomMessage) => {
    setChatPinnedMessageByThread((prev) => ({ ...prev, [message.threadId]: message.id }));
    setChatContextMessage(null);
    setChatLongPressHint('상단 공지로 고정했습니다.');
  }, []);

  const startChatEdit = useCallback((message: ChatRoomMessage) => {
    if (!canManageChatMessage(message)) return;
    setChatEditableMessageId(message.id);
    setChatRoomDraft(message.text);
    setChatReplyTarget(null);
    setChatContextMessage(null);
    setChatLongPressHint('1시간 이내 메시지 수정 모드입니다.');
  }, [canManageChatMessage]);

  const deleteChatMessage = useCallback((message: ChatRoomMessage) => {
    if (!canManageChatMessage(message)) return;
    setChatMessagesByThread((prev) => ({
      ...prev,
      [message.threadId]: (prev[message.threadId] ?? []).filter((item) => item.id !== message.id),
    }));
    setChatPinnedMessageByThread((prev) => prev[message.threadId] === message.id ? { ...prev, [message.threadId]: null } : prev);
    setChatContextMessage(null);
    setChatLongPressHint('메시지를 삭제했습니다.');
  }, [canManageChatMessage]);

  const openChatShareSheet = useCallback((message: ChatRoomMessage) => {
    setChatContextMessage(null);
    setChatShareMessage(message);
    setChatShareKeyword('');
  }, []);

  const shareChatMessageToThread = useCallback((thread: ThreadItem) => {
    if (!chatShareMessage) return;
    const now = Date.now();
    const sharedText = `[공유] ${chatShareMessage.author}: ${chatShareMessage.text}`;
    const sharedMessage: ChatRoomMessage = {
      id: now,
      threadId: thread.id,
      author: '나',
      text: sharedText,
      meta: formatChatMessageMeta(now),
      mine: true,
      createdAt: now,
    };
    setChatMessagesByThread((prev) => ({
      ...prev,
      [thread.id]: [...(prev[thread.id] ?? createThreadRoomSeed(thread)), sharedMessage],
    }));
    setThreadItems((prev) => prev.map((item) => item.id === thread.id ? { ...item, preview: sharedText, time: '방금', unread: 0 } : item));
    setChatShareMessage(null);
    setChatLongPressHint(`${thread.name} 채팅방으로 공유했습니다.`);
  }, [chatShareMessage]);

  const copyChatShareLink = useCallback(() => {
    if (!chatShareMessage) return;
    copyToClipboard(`adultapp://chat/${chatShareMessage.threadId}/message/${chatShareMessage.id}`);
    setChatLongPressHint('메시지 링크를 복사했습니다.');
  }, [chatShareMessage]);

  const replyChatMessage = useCallback((message: ChatRoomMessage) => {
    setChatReplyTarget(message);
    setChatContextMessage(null);
    setChatLongPressHint(`${message.author} 메시지에 답장합니다.`);
  }, []);

  const filteredForumRooms = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    return forumRoomSeed.filter((room) => {
      const categoryMatch = room.category === selectedForumCategory;
      const keywordMatch = !keyword || `${room.title} ${room.summary} ${room.category} ${room.starter}`.toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });
  }, [globalKeyword, selectedForumCategory]);

  const activeForumRoom = useMemo(() => forumRoomSeed.find((room) => room.id === activeForumRoomId) ?? null, [activeForumRoomId]);
  const activeForumMessages = activeForumRoom ? (forumRoomMessages[activeForumRoom.id] ?? []) : [];

  const filteredQuestions = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    return !keyword
      ? questionSeed
      : questionSeed.filter((item) => `${item.author} ${item.question} ${item.answer}`.toLowerCase().includes(keyword));
  }, [globalKeyword]);

  const filteredRandomRooms = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    return randomRooms.filter((room) => {
      const categoryMatch = randomRoomCategory === "전체" || room.category === randomRoomCategory;
      const keywordMatch = !keyword || `${room.title} ${room.category}`.toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });
  }, [globalKeyword, randomRoomCategory, randomRooms]);

  const homeProducts = useMemo(() => productsSeed.slice(0, 4), []);
  const savedProductItems = useMemo(() => [...productsSeed, ...shopCatalogItems, ...homeProducts.map((item) => ({ ...item, subtitle: item.subtitle ?? "", badge: item.badge ?? "" }))].filter((item, index, arr) => arr.findIndex((row) => row.id === item.id) === index && savedProductIds.includes(item.id)), [savedProductIds, homeProducts, shopCatalogItems]);
  const homeSearchResults = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    const ownerKeywordSource = currentProfileMeta.isOwner ? normalizeProfileKeywordTags(demoProfile.hashtags).join(" ").toLowerCase() : "";
    return allFeedItems.filter((item) => {
      const isOwnerItem = currentProfileMeta.isOwner && currentProfileAuthorAliases.includes(item.author);
      const source = `${item.title} ${item.caption} ${item.author} ${item.category} ${isOwnerItem ? ownerKeywordSource : ""}`.toLowerCase();
      if (searchFilter === "피드") return `${item.title} ${item.caption} ${isOwnerItem ? ownerKeywordSource : ""}`.toLowerCase().includes(keyword);
      if (searchFilter === "작성자") return item.author.toLowerCase().includes(keyword);
      return source.includes(keyword);
    });
  }, [currentProfileAuthorAliases, currentProfileMeta.isOwner, demoProfile.hashtags, globalKeyword, searchFilter]);

  const shopSearchResults = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    const minPrice = Number(shopSearchPriceMin.replace(/[^\d]/g, "")) || 0;
    const maxPrice = Number(shopSearchPriceMax.replace(/[^\d]/g, "")) || 0;
    if (!keyword) return [] as ProductCard[];
    const ownerKeywordSource = normalizeProfileKeywordTags(demoProfile.hashtags).join(" ").toLowerCase();
    return shopCatalogItems.filter((item) => {
      const source = `${item.name} ${item.subtitle} ${item.category} ${ownerKeywordSource}`.toLowerCase();
      const colorTag = getProductColorTag(item);
      const purposeTag = getProductPurposeTag(item);
      const priceValue = getProductNumericPrice(item);
      const matchKeyword = searchFilter === "상품명"
        ? item.name.toLowerCase().includes(keyword)
        : searchFilter === "내용"
          ? item.subtitle.toLowerCase().includes(keyword)
          : searchFilter === "카테고리"
            ? item.category.toLowerCase().includes(keyword)
            : source.includes(keyword);
      const matchMin = !minPrice || priceValue >= minPrice;
      const matchMax = !maxPrice || priceValue <= maxPrice;
      const matchColor = shopSearchColor === "전체" || colorTag === shopSearchColor;
      const matchPurpose = shopSearchPurpose === "전체" || purposeTag === shopSearchPurpose;
      return matchKeyword && matchMin && matchMax && matchColor && matchPurpose;
    });
  }, [demoProfile.hashtags, globalKeyword, searchFilter, shopCatalogItems, shopSearchPriceMin, shopSearchPriceMax, shopSearchColor, shopSearchPurpose]);
  const visibleShopSearchResults = useMemo(() => shopSearchResults.slice(0, shopSearchVisibleCount), [shopSearchResults, shopSearchVisibleCount]);

  const communitySearchResults = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return communitySeed.filter((item) => {
      if (searchFilter === "제목") return item.title.toLowerCase().includes(keyword);
      if (searchFilter === "내용") return item.summary.toLowerCase().includes(keyword);
      if (searchFilter === "카테고리") return item.category.toLowerCase().includes(keyword);
      return `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(keyword);
    });
  }, [globalKeyword, searchFilter]);

  const chatSearchResults = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return threadSeed.filter((item) => {
      if (searchFilter === "제목") return item.name.toLowerCase().includes(keyword);
      if (searchFilter === "내용") return item.preview.toLowerCase().includes(keyword);
      if (searchFilter === "유형") return `${item.kind} ${item.purpose}`.toLowerCase().includes(keyword);
      return `${item.name} ${item.preview} ${item.purpose} ${item.kind}`.toLowerCase().includes(keyword);
    });
  }, [globalKeyword, searchFilter]);

  const openProfileFromAuthor = (author: string) => {
    setViewedProfileAuthor(author);
    setActiveTab("프로필");
    setProfileTab("내정보");
    setProfileSection("게시물");
    setOverlayMode(null);
    setSelectedAskProfile(null);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncCompanyMailRoute = () => {
      setCompanyMailPreviewOpen(isCompanyMailRouteActive());
    };
    window.addEventListener("hashchange", syncCompanyMailRoute);
    window.addEventListener("popstate", syncCompanyMailRoute);
    return () => {
      window.removeEventListener("hashchange", syncCompanyMailRoute);
      window.removeEventListener("popstate", syncCompanyMailRoute);
    };
  }, []);

  useEffect(() => {
    if (!authBootstrapDone) return;
    if (navigationRestoreRef.current) {
      navigationSnapshotRef.current = cloneNavigationSnapshot(currentNavigationSnapshot);
      navigationRestoreRef.current = false;
      return;
    }
    const previousSnapshot = navigationSnapshotRef.current;
    if (!previousSnapshot) {
      navigationSnapshotRef.current = cloneNavigationSnapshot(currentNavigationSnapshot);
      return;
    }
    const previousSnapshotKey = JSON.stringify(previousSnapshot);
    const currentSnapshotKey = JSON.stringify(currentNavigationSnapshot);
    if (previousSnapshotKey === currentSnapshotKey) return;
    navigationHistoryRef.current.push(cloneNavigationSnapshot(previousSnapshot));
    if (navigationHistoryRef.current.length > APP_NAVIGATION_HISTORY_LIMIT) {
      navigationHistoryRef.current = navigationHistoryRef.current.slice(-APP_NAVIGATION_HISTORY_LIMIT);
    }
    navigationSnapshotRef.current = cloneNavigationSnapshot(currentNavigationSnapshot);
    if (!isHomeNavigationSnapshot(currentNavigationSnapshot)) {
      hideBackMinimizeHint();
      lastBackPressAtRef.current = 0;
    }
  }, [authBootstrapDone, currentNavigationSnapshot, hideBackMinimizeHint, isHomeNavigationSnapshot]);

  useEffect(() => {
    if (!authBootstrapDone || typeof window === "undefined" || !shouldManageMobileBrowserBack) return;
    if (browserHistoryReadyRef.current) return;
    browserHistoryReadyRef.current = true;
    browserHistoryIndexRef.current = 0;
    syncBrowserBackBarrier("replace");
    syncBrowserBackBarrier("push");
  }, [authBootstrapDone, shouldManageMobileBrowserBack, syncBrowserBackBarrier]);

  useEffect(() => {
    if (!authBootstrapDone || typeof window === "undefined" || !shouldManageMobileBrowserBack) return;
    if (!browserHistoryReadyRef.current) return;
    if (suppressBrowserHistoryPushRef.current) {
      suppressBrowserHistoryPushRef.current = false;
      return;
    }
    syncBrowserBackBarrier("push");
  }, [authBootstrapDone, currentNavigationSnapshot, shouldManageMobileBrowserBack, syncBrowserBackBarrier]);

  useEffect(() => {
    if (!authBootstrapDone || typeof window === "undefined" || !shouldManageMobileBrowserBack) return;
    const handleBrowserBack = () => {
      suppressBrowserHistoryPushRef.current = true;
      void handleAppBackNavigation("history");
    };
    window.addEventListener("popstate", handleBrowserBack);
    document.addEventListener("backbutton", handleBrowserBack as EventListener, false);
    return () => {
      window.removeEventListener("popstate", handleBrowserBack);
      document.removeEventListener("backbutton", handleBrowserBack as EventListener, false);
    };
  }, [authBootstrapDone, handleAppBackNavigation, shouldManageMobileBrowserBack]);

  useEffect(() => {
    if (!authBootstrapDone) return;
    if (typeof window === "undefined" || !window.Capacitor?.isNativePlatform?.()) return;
    const appPlugin = getNativeAppPlugin();
    if (!appPlugin?.addListener) return;
    let cancelled = false;
    let listenerHandle: NativeAppListenerHandle | null = null;
    void Promise.resolve(appPlugin.addListener("backButton", () => {
      void handleAppBackNavigation();
    })).then((handle) => {
      if (cancelled) {
        try {
          void handle?.remove?.();
        } catch {}
        return;
      }
      listenerHandle = handle ?? null;
    }).catch(() => {});
    return () => {
      cancelled = true;
      try {
        void listenerHandle?.remove?.();
      } catch {}
    };
  }, [authBootstrapDone, handleAppBackNavigation]);

  useEffect(() => () => {
    if (typeof window !== "undefined" && backMinimizeTimerRef.current !== null) {
      window.clearTimeout(backMinimizeTimerRef.current);
    }
  }, []);

  const isDesktopSplitHost = !desktopPaneContext.embedded && windowWidth >= 1180;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openCompanyMailPreview = useCallback(() => {
    setOverlayMode(null);
    setCompanyMailPreviewOpen(true);
    if (typeof window !== "undefined" && window.location.hash.toLowerCase() !== "#corp-mail-admin") {
      const next = `${window.location.pathname}${window.location.search}#corp-mail-admin`;
      window.history.replaceState(null, "", next);
    }
  }, []);

  const closeCompanyMailPreview = useCallback(() => {
    if (companyMailHostLocked) return;
    setCompanyMailPreviewOpen(false);
    if (typeof window !== "undefined" && window.location.hash.toLowerCase() === "#corp-mail-admin") {
      const next = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", next);
    }
  }, [companyMailHostLocked]);

  const requestCompanyMailLogin = useCallback(() => {
    if (!companyMailHostLocked) closeCompanyMailPreview();
    setAuthStandaloneScreen("login");
    setAuthMessage("회사메일은 관리자 계정으로만 접근할 수 있습니다.");
  }, [closeCompanyMailPreview, companyMailHostLocked]);

  const renderBottomTabIcon = (tab: MobileTab, filled: boolean) => ({
    홈: <HomeIcon filled={filled} />,
    쇼핑: <ShoppingBagIcon filled={filled} />,
    소통: <CommunityIcon filled={filled} />,
    채팅: <ChatIcon filled={filled} />,
    프로필: <ProfileIcon filled={filled} />,
  }[tab]);

  const bottomNavIconMap = {
    홈: renderBottomTabIcon("홈", overlayMode === null && activeTab === "홈"),
    쇼핑: renderBottomTabIcon("쇼핑", overlayMode === null && activeTab === "쇼핑"),
    소통: renderBottomTabIcon("소통", overlayMode === null && activeTab === "소통"),
    채팅: renderBottomTabIcon("채팅", overlayMode === null && activeTab === "채팅"),
    프로필: renderBottomTabIcon("프로필", overlayMode === null && activeTab === "프로필"),
  } satisfies Record<typeof mobileTabs[number], JSX.Element>;

  const legalQuickLinks = [
    { key: "terms_of_service", label: "이용약관", href: `${getApiBase()}/legal/terms-of-service` },
    { key: "privacy_policy", label: "개인정보 처리방침", href: `${getApiBase()}/legal/privacy-policy` },
    { key: "refund_policy", label: "환불정책", href: `${getApiBase()}/legal/refund-policy` },
    { key: "age_verification_policy", label: "연령 정책", href: `${getApiBase()}/legal/age-verification-policy` },
  ] as const;

  const disclosedBusinessInfo = useMemo(() => ({
    operatorName: String(businessInfo?.business_info?.operator_legal_name || businessInfo?.business_info?.operator_brand_name || "사업자 정보 등록 필요"),
    representative: String(businessInfo?.business_info?.representative_name || "대표자 정보 등록 필요"),
    registrationNo: String(businessInfo?.business_info?.business_registration_no || "사업자번호 등록 필요"),
    phone: String(businessInfo?.business_info?.support_phone || "연락처 등록 필요"),
    address: String(businessInfo?.business_info?.business_address || "주소 등록 필요"),
    email: "aksqhqkqh153@gmail.com",
    privacyEmail: String(businessInfo?.business_info?.privacy_contact_email || "aksqhqkqh153@gmail.com"),
  }), [businessInfo]);


  const buildFallbackProductDetail = useCallback((productId: number): ProductDetailResponse | null => {
    const fallback = shopCatalogItems.find((item) => item.id === productId)
      ?? productsSeed.find((item) => item.id === productId)
      ?? null;
    if (!fallback) return null;

    const priceValue = Number(String(fallback.price).replace(/[^\d]/g, "")) || 0;
    const shippingFee = fallback.isPremium ? 0 : 3000;
    const sellerName = fallback.isPremium ? "adult premium store" : disclosedBusinessInfo.operatorName;
    const description = fallback.subtitle?.trim() || `${fallback.name} 상품 상세 화면 샘플입니다.`;

    return {
      product: {
        id: fallback.id,
        category: fallback.category,
        name: fallback.name,
        description,
        price: priceValue,
        shipping_fee: shippingFee,
        status: "published",
        sku_code: `SAMPLE-${fallback.id}`,
        stock_qty: fallback.stock_qty ?? 24,
        thumbnail_url: fallback.thumbnailUrl ?? null,
        review_count: Number(fallback.reviewCount ?? 0) || 0,
      },
      media: fallback.thumbnailUrl ? [{ id: 1, file_url: fallback.thumbnailUrl, media_type: "image", sort_order: 1 }] : [],
      site_ready: {
        adult_only_label: "성인용품",
        illegal_goods_blocked: true,
        price_visible: true,
        purchase_button_visible: true,
        customer_center_visible: true,
        minimum_refund_window_days: 7,
      },
      seller_contact: {
        name: sellerName,
        business_name: sellerName,
        business_registration_no: disclosedBusinessInfo.registrationNo,
        business_address: disclosedBusinessInfo.address,
        cs_contact: disclosedBusinessInfo.phone,
        return_address: disclosedBusinessInfo.address,
        support_email: disclosedBusinessInfo.email,
      },
    };
  }, [shopCatalogItems, disclosedBusinessInfo]);

  const checkoutStepMeta: Array<{ key: CheckoutStage; label: string }> = [
    { key: "cart", label: "장바구니" },
    { key: "order_form", label: "주문서 작성" },
    { key: "payment_request", label: "결제 요청" },
    { key: "payment_complete", label: "결제 완료" },
    { key: "order_confirm", label: "주문 확인" },
  ];

  const checkoutStageIndex = checkoutStepMeta.findIndex((item) => item.key === checkoutStage);
  const checkoutSelectedOrder = useMemo(() => {
    if (!orders.length) return null;
    return (selectedOrderNo ? orders.find((item) => item.order_no === selectedOrderNo) : null) ?? [...orders].reverse()[0] ?? null;
  }, [orders, selectedOrderNo]);

  const showBaseTabContent = overlayMode === null;
  const blockedByIdentity = !isAdmin && !identityVerified;
  const requiresAdultGate = !isAdmin && !adultVerified && ["홈", "쇼핑"].includes(activeTab);
  const showAppTabContent = showBaseTabContent && !blockedByIdentity && !requiresAdultGate;
  const shouldForceAuthStandalone = authBootstrapDone && blockedByIdentity;

  useEffect(() => {
    if (!(showAppTabContent && activeTab === "홈" && ["피드", "쇼츠", "스토리"].includes(homeTab)) || feedComposeOpen || openFeedCommentItem || selectedAskProfile) {
      setFeedComposeLauncherOpen(false);
    }
  }, [showAppTabContent, activeTab, homeTab, feedComposeOpen, openFeedCommentItem, selectedAskProfile]);

  useEffect(() => {
    if (!(showAppTabContent && activeTab === "홈" && homeTab === "피드")) return;

    const stored = readHomeFeedPersistedState();
    const shouldReset = homeFeedResetOnNextShowRef.current || isHomeFeedStateExpired(stored);
    const nextVisibleCount = shouldReset
      ? HOME_FEED_BATCH_SIZE
      : Math.max(HOME_FEED_BATCH_SIZE, stored.visibleCount ?? HOME_FEED_BATCH_SIZE);

    if (nextVisibleCount !== homeFeedVisibleCount) {
      setHomeFeedVisibleCount(Math.min(nextVisibleCount, Math.max(activeHomeFeedItems.length, HOME_FEED_BATCH_SIZE)));
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      const node = homeFeedScrollRef.current;
      if (!node) return;
      const targetScrollTop = shouldReset ? 0 : Math.max(0, stored.scrollTop ?? 0);
      node.scrollTop = Math.min(targetScrollTop, Math.max(0, node.scrollHeight - node.clientHeight));
      lastHomeFeedScrollTopRef.current = node.scrollTop;
      homeFeedResetOnNextShowRef.current = false;
      if (shouldReset || node.scrollTop <= 8) {
        setHomeFeedHeaderHidden(false);
      }
      persistHomeFeedState({
        visibleCount: homeFeedVisibleCount,
        scrollTop: node.scrollTop,
        lastInactiveAt: shouldReset ? 0 : stored.lastInactiveAt ?? 0,
      });
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [showAppTabContent, activeTab, homeTab, homeFeedVisibleCount, activeHomeFeedItems.length, persistHomeFeedState]);


  useEffect(() => {
    if (!shouldForceAuthStandalone) return;
    setAuthStandaloneScreen("login");
    setAuthGatePopupOpen(true);
    setAuthMessage("로그인이 필요합니다. 청소년은 이용할 수 없습니다.");
  }, [shouldForceAuthStandalone]);
  const adultCooldownRemainMinutes = adultCooldownUntil > Date.now() ? Math.ceil((adultCooldownUntil - Date.now()) / 60000) : 0;
  const signupConsentMeta: Record<keyof SignupConsentState, {
    title: string;
    summary: string;
    body: string[];
    href?: string;
  }> = {
    terms: {
      title: "[필수] 이용약관 확인",
      summary: "서비스 이용 조건, 회원 의무, 금지 행위, 게시물 운영원칙, 주문/환불 기본 정책을 확인합니다.",
      body: [
        "회원은 성인 전용 서비스 정책과 커뮤니티 운영 원칙을 준수해야 합니다.",
        "불법 행위, 타인 권리 침해, 청소년 관련 위반, 결제 악용, 운영 방해 행위는 제한 대상입니다.",
        "주문·환불·제재·계정 제한과 관련된 기본 기준은 이용약관 및 운영정책에 따릅니다.",
      ],
      href: `${getApiBase()}/legal/terms-of-service`,
    },
    privacy: {
      title: "[필수] 개인정보 처리방침 확인",
      summary: "수집 항목, 이용 목적, 보관 기간, 제3자 제공 및 처리위탁 기준을 확인합니다.",
      body: [
        "회원 식별, 로그인 유지, 본인확인, 성인인증, 고객지원 및 법령상 의무 이행을 위해 필요한 정보를 처리합니다.",
        "법령상 보존이 필요한 정보는 해당 기간 동안 안전하게 보관될 수 있습니다.",
        "처리방침은 변경 시 공지되며, 필수 항목 변경 시 재동의가 요구될 수 있습니다.",
      ],
      href: `${getApiBase()}/legal/privacy-policy`,
    },
    adultNotice: {
      title: "[필수] 만 19세 이상 및 성인 서비스 이용 고지 확인",
      summary: "본 서비스는 만 19세 이상 성인만 이용할 수 있으며, 청소년은 이용할 수 없습니다.",
      body: [
        "회원가입 및 로그인은 만 19세 이상 본인확인 가능자만 진행할 수 있습니다.",
        "청소년 또는 비정상 인증으로 확인되는 경우 서비스 접근이 제한되거나 계정이 차단될 수 있습니다.",
        "성인 전용 영역은 별도 인증 절차 후에만 접근할 수 있습니다.",
      ],
    },
    identityNotice: {
      title: "[필수] 본인확인/성인인증 결과 처리 안내 확인",
      summary: "본인확인 및 성인인증 결과는 계정 생성, 접근 권한 판단, 법적 의무 이행을 위해 처리됩니다.",
      body: [
        "인증 결과값은 회원 상태 판정, 청소년 차단, 성인 영역 접근 제어, 부정 이용 방지에 사용됩니다.",
        "인증 실패, 미완료, 불일치 상태에서는 회원가입 또는 일부 기능 이용이 제한될 수 있습니다.",
        "관련 법령과 내부 보안 기준에 따라 필요한 범위 내에서만 저장·처리됩니다.",
      ],
    },
    marketing: {
      title: "[선택] 마케팅 정보 수신 동의",
      summary: "이벤트, 혜택, 프로모션, 신규 기능 안내를 수신할지 선택합니다.",
      body: [
        "선택 동의이며, 동의하지 않아도 기본 서비스 이용에는 영향이 없습니다.",
        "수신 채널과 항목은 운영정책에 따라 조정될 수 있습니다.",
        "언제든지 설정에서 수신 동의를 변경할 수 있습니다.",
      ],
    },
    profileOptional: {
      title: "[선택] 맞춤 추천을 위한 프로필 정보 수집 동의",
      summary: "성별, 연령대, 지역, 관심 카테고리 등 선택 입력 정보를 추천 품질 향상에 활용할 수 있습니다.",
      body: [
        "선택 동의이며, 동의하지 않아도 기본 서비스 이용에는 영향이 없습니다.",
        "입력한 선택 정보는 맞춤 추천, 제한 영역 심사 참고, 운영 안전성 보조 정보로 사용될 수 있습니다.",
        "언제든지 프로필 또는 설정에서 변경할 수 있습니다.",
      ],
    },
  };

  const openSignupConsentModal = (key: keyof SignupConsentState) => {
    setSignupConsentModal(key);
  };

  const toggleSignupConsent = (key: keyof SignupConsentState, checked: boolean) => {
    setSignupConsents((prev) => ({ ...prev, [key]: checked }));
    if (checked) {
      openSignupConsentModal(key);
    }
  };

  const requiredConsentAccepted = requiredConsentKeys.every((key) => signupConsents[key]);
  const reconsentRequired = Boolean(authSummary?.reconsent_required || authSummary?.consent_status?.reconsent_required);
  const reconsentMode = (authSummary?.reconsent_enforcement_mode as string | undefined) ?? "limited_access";
  const reconsentWriteRestricted = !isAdmin && reconsentRequired && reconsentMode !== "login_block";
  const shouldShowHomeShopConsentGuide = !isAdmin && currentUserRole !== "GUEST" && ["홈", "쇼핑"].includes(activeTab) && !homeShopConsentGuideSeen;
  const signupAccountValid = Boolean(signupForm.email.trim() && signupForm.password.trim() && signupForm.displayName.trim() && identityVerified && identityVerificationToken);
  const randomProfileMissing = [!demoProfile.gender ? "성별" : null, !demoProfile.ageBand ? "연령대" : null, !demoProfile.regionCode ? "지역" : null].filter(Boolean) as string[];
  const randomProfileReady = randomProfileMissing.length === 0;
  const sellerApprovalReady = isAdmin || sellerVerification.status === "approved";
  const openBusinessVerificationTab = () => setShoppingTab("사업자인증");
  const openProductRegistrationTab = () => setShoppingTab(isAdmin || sellerApprovalReady ? "상품등록" : "사업자인증");
  const openGeneralTradeRegistrationTab = () => setShoppingTab("일반거래");
  const sellerApplicationComplete = Boolean(
    sellerVerification.companyName.trim()
    && sellerVerification.representativeName.trim()
    && sellerVerification.businessNumber.trim()
    && sellerVerification.ecommerceNumber.trim()
    && sellerVerification.businessAddress.trim()
    && sellerVerification.csContact.trim()
    && sellerVerification.returnAddress.trim()
    && sellerVerification.youthProtectionOfficer.trim()
    && sellerVerification.businessDocumentUrl.trim()
    && sellerVerification.settlementBank.trim()
    && sellerVerification.settlementAccountNumber.trim()
    && sellerVerification.settlementAccountHolder.trim()
    && sellerVerification.handledCategories.trim()
  );
  const productDraftReady = Boolean(isProductCategorySelected && productRegistrationDraft.name.trim() && productRegistrationDraft.description.trim() && productRegistrationDraft.price.trim() && productRegistrationDraft.stockQty.trim() && productRegistrationDraft.skuCode.trim());
  const consentRecordsPreview = [
    { consent_type: "terms_of_service", agreed: signupConsents.terms, required: true, version: consentVersionMap.terms },
    { consent_type: "privacy_policy", agreed: signupConsents.privacy, required: true, version: consentVersionMap.privacy },
    { consent_type: "adult_service_notice", agreed: signupConsents.adultNotice, required: true, version: consentVersionMap.adultNotice },
    { consent_type: "identity_notice", agreed: signupConsents.identityNotice, required: true, version: consentVersionMap.identityNotice },
    { consent_type: "marketing_opt_in", agreed: signupConsents.marketing, required: false, version: consentVersionMap.marketing },
    { consent_type: "profile_optional_opt_in", agreed: signupConsents.profileOptional, required: false, version: consentVersionMap.profileOptional },
  ];

  const startIdentitySignup = async (provider: DemoLoginProvider) => {
    if (provider === "카카오") {
      setDemoLoginProvider("카카오");
      return;
    }
    try {
      const start = await postJson<{ tx_id: string }>("/auth/identity/start", { provider });
      const confirm = await postJson<{ identity_verification_token: string }>("/auth/identity/confirm", { provider, tx_id: start.tx_id, verification_code: "000000" });
      setIdentityMethod(provider);
      setIdentityVerified(true);
      setIdentityVerificationToken(confirm.identity_verification_token);
    } catch {
      setIdentityMethod(provider);
      setIdentityVerified(true);
      setIdentityVerificationToken(`iv_${provider}_${Date.now()}`);
    }
    setAdultGateView("intro");
    if (["홈", "쇼핑"].includes(activeTab)) {
      setAdultPromptOpen(true);
    }
  };

  const advanceSignupStep = () => {
    if (signupStep === "consent") {
      if (!requiredConsentAccepted) {
        window.alert("필수 체크 항목을 체크 후 다음을 눌러주세요");
        return;
      }
      setSignupStep("account");
      return;
    }
    if (signupStep === "account") {
      if (!signupAccountValid) return;
      setSignupStep("profile");
    }
  };

  const completeSignupFlow = async (skipOptional = false) => {
    if (!requiredConsentAccepted || !signupAccountValid) return;
    const consentPayload = consentRecordsPreview.map((item) => ({ consent_type: item.consent_type, agreed: item.agreed, is_required: item.required, version: item.version }));
    try {
      const response = await postJson<{ access_token?: string; refresh_token?: string }>("/auth/signup", {
        email: signupForm.email,
        password: signupForm.password,
        name: signupForm.displayName,
        login_provider: signupForm.loginMethod === "카카오" ? "kakao" : "email",
        identity_verification_token: identityVerificationToken,
        identity_verification_method: identityMethod === "미완료" ? "휴대폰" : identityMethod,
        adult_verification_status: adultVerified ? "verified_adult" : "pending",
        consents: consentPayload,
      });
      if (response.access_token) setAuthToken(response.access_token);
      if (response.refresh_token) setRefreshToken(response.refresh_token);
    } catch {
      // demo fallback
    }
    setIdentityVerified(true);
    setDemoLoginProvider(signupForm.loginMethod === "카카오" ? "카카오" : identityMethod === "미완료" ? "휴대폰" : identityMethod);
    setAdultGateView("intro");
    if (skipOptional) {
      setDemoProfile((prev) => ({ ...prev, marketingOptIn: signupConsents.marketing }));
    }
    setAuthEmail(signupForm.email);
    setAuthPassword(signupForm.password);
    setAuthMessage("회원가입 입력이 저장되었습니다. 로그인 화면에서 바로 로그인할 수 있습니다.");
    setHomeShopConsentGuideSeen(false);
    setAuthStandaloneScreen("login");
  };

  const toggleInterestCategory = (category: string) => {
    setDemoProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(category) ? prev.interests.filter((item) => item !== category) : [...prev.interests, category],
    }));
  };

  const submitSellerVerification = async () => {
    if (!sellerApplicationComplete) return;
    try {
      await postJson('/seller/verification/apply', {
        company_name: sellerVerification.companyName,
        representative_name: sellerVerification.representativeName,
        business_number: sellerVerification.businessNumber,
        ecommerce_number: sellerVerification.ecommerceNumber,
        business_address: sellerVerification.businessAddress,
        cs_contact: sellerVerification.csContact,
        return_address: sellerVerification.returnAddress,
        youth_protection_officer: sellerVerification.youthProtectionOfficer,
        settlement_bank: sellerVerification.settlementBank,
        settlement_account_number: sellerVerification.settlementAccountNumber,
        settlement_account_holder: sellerVerification.settlementAccountHolder,
        handled_categories: sellerVerification.handledCategories.split(',').map((item) => item.trim()).filter(Boolean),
        seller_contract_agreed: true,
        business_document_url: sellerVerification.businessDocumentUrl,
        approval_note: '사업자 인증 신청',
      });
    } catch {}
    setSellerVerification((prev) => ({ ...prev, status: 'pending' }));
    setShoppingTab('사업자인증');
  };

  const submitProductRegistration = async (submitMode: "draft" | "publish" = "draft") => {
    if (!productDraftReady || !sellerApprovalReady || reconsentWriteRestricted || desktopProductCrudBusy) return;
    const payload = {
      id: desktopProductEditId ?? undefined,
      name: productRegistrationDraft.name,
      sku_code: productRegistrationDraft.skuCode,
      category: productRegistrationDraft.category,
      description: productRegistrationDraft.description,
      price: Number(productRegistrationDraft.price || '0'),
      stock_qty: Number(productRegistrationDraft.stockQty || '0'),
      image_urls: productRegistrationDraft.imageUrls.filter(Boolean),
      status: submitMode === 'publish' ? 'pending_review' : 'draft',
      submit_mode: submitMode,
      payment_scope: 'card_transfer',
      risk_grade: 'A',
    };
    setDesktopProductCrudBusy(true);
    setDesktopProductCrudMessage("");
    try {
      const created = await postJson<SellerProductItem>('/products', payload);
      const publicProduct: ApiProduct = {
        id: created.id,
        seller_id: created.seller_id,
        category: created.category,
        name: created.name,
        description: created.description ?? productRegistrationDraft.description,
        price: Number(created.price ?? payload.price ?? 0),
        shipping_fee: 3000,
        status: created.status ?? (submitMode === 'publish' ? 'pending_review' : 'draft'),
        sku_code: created.sku_code ?? payload.sku_code,
        stock_qty: Number(created.stock_qty ?? payload.stock_qty ?? 0),
        thumbnail_url: created.thumbnail_url ?? productRegistrationDraft.imageUrls.find(Boolean) ?? null,
        review_count: 0,
      };
      setSellerProducts((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
      setApiProducts((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [publicProduct, ...safePrev.filter((item) => item.id !== created.id)];
      });
      getJson<SellerProductItem[]>('/seller/products/mine').then(applySellerProducts).catch(() => applySellerProducts([]));
      getJson<ApiProduct[]>('/products').then((rows) => {
        const safeRows = Array.isArray(rows) ? rows : [];
        setApiProducts((prev) => {
          const merged = [...safeRows];
          if (!merged.some((item) => item.id === publicProduct.id)) merged.unshift(publicProduct);
          return merged.length ? merged : prev;
        });
      }).catch(() => null);
      if (isAdmin) getJson<{ items: ProductApprovalItem[] }>('/admin/product-approvals').then((res) => setProductApprovalQueue(res.items ?? [])).catch(() => null);
      setOrderMessage(`${submitMode === 'publish' ? (desktopProductEditId ? '상품수정 반영' : '상품등록') : (desktopProductEditId ? '상품수정 저장' : '상품 임시저장')} 완료: ${created.name} · ${created.status ?? 'draft'}`);
      setDesktopProductCrudMessage(`${desktopProductEditId ? '상품 수정' : '상품 등록'}이 완료되었습니다.`);
      setSubmittedProducts((prev) => [productRegistrationDraft, ...prev]);
      setProductRegistrationDraft(createEmptyProductDraft());
      setDesktopProductEditId(null);
      setDesktopProductEditorOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : submitMode === 'publish' ? '상품등록 실패' : '상품 임시저장 실패';
      setOrderMessage(message);
      setDesktopProductCrudMessage(message);
      return;
    } finally {
      setDesktopProductCrudBusy(false);
    }
  };

  const submitProductForReview = async (productId: number) => {
    setDesktopProductCrudBusy(true);
    setDesktopProductCrudMessage("");
    try {
      await postJson(`/products/${productId}/submit-review`, { note: '승인대기 제출' });
      getJson<SellerProductItem[]>('/seller/products/mine').then(applySellerProducts).catch(() => applySellerProducts([]));
      if (isAdmin) getJson<{ items: ProductApprovalItem[] }>('/admin/product-approvals').then((res) => setProductApprovalQueue(res.items ?? [])).catch(() => null);
      setDesktopProductCrudMessage('승인대기 상태로 전환했습니다.');
    } catch (error) {
      setDesktopProductCrudMessage(error instanceof Error ? error.message : '승인대기 제출 실패');
    } finally {
      setDesktopProductCrudBusy(false);
    }
  };

  const adminDecideSeller = async (userId: number, decision: string) => {
    try {
      await postJson(`/admin/seller-approvals/${userId}/decision`, { decision, note: `관리자 ${decision}` });
      getJson<{ items: SellerApprovalItem[] }>('/admin/seller-approvals').then((res) => setSellerApprovalQueue(res.items ?? [])).catch(() => null);
    } catch {}
  };

  const adminDecideProduct = async (productId: number, decision: string) => {
    try {
      await postJson(`/admin/product-approvals/${productId}/decision`, { decision, note: `관리자 ${decision}` });
      getJson<{ items: ProductApprovalItem[] }>('/admin/product-approvals').then((res) => setProductApprovalQueue(res.items ?? [])).catch(() => null);
    } catch {}
  };

  const applyLoggedInUser = async () => {
    const me = await getJson<AuthMeResponse>("/auth/me");
    setAuthSummary(me);
    const nextRole = String(me.grade ?? "GUEST").toUpperCase();
    setCurrentUserRole(nextRole);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("adultapp_demo_role", nextRole);
    }
    setIdentityVerified(Boolean(me.identity_verified));
    setAdultVerified(Boolean(me.adult_verified));

    let nextOrders: ApiOrder[] = [];
    try {
      nextOrders = await getJson<ApiOrder[]>("/orders");
      setOrders(nextOrders);
    } catch (error) {
      console.warn("orders_prefetch_failed_after_login", error);
      setOrders([]);
    }

    const firstOrderNo = nextOrders.length ? nextOrders[nextOrders.length - 1].order_no : "";
    setSelectedOrderNo(firstOrderNo);
    if (firstOrderNo) {
      try {
        const detail = await getJson<ApiOrderDetail>(`/orders/${firstOrderNo}`);
        setOrderDetail(detail);
      } catch {
        setOrderDetail(null);
      }
    } else {
      setOrderDetail(null);
    }
    setAuthMessage(`${me.email ?? "계정"} 로그인 완료 · 역할 ${nextRole}`);
  };

  const fillTestAccount = (email: string, password: string) => {
    setAuthEmail(email);
    setAuthPassword(password);
    setAuthMessage(`테스트 계정 입력 완료: ${email}`);
  };

  const loginWithTestAccount = async (email: string, password: string) => {
    clearTokens();
    setAuthEmail(email);
    setAuthPassword(password);
    setAuthMessage(`테스트 계정으로 로그인 중: ${email}`);
    try {
      const response = await postJson<{ access_token: string; refresh_token: string; role: string; two_factor_required?: boolean }>("/auth/login", {
        email: email.trim(),
        password,
        device_name: "web-browser",
      });
      if (response.two_factor_required) {
        setAuthMessage("관리자 테스트 계정은 현재 2차 인증 없이 바로 로그인되도록 서버에서 비활성화하거나 계정을 재시드해야 합니다.");
        return;
      }
      setAuthToken(response.access_token);
      setRefreshToken(response.refresh_token);
      await applyLoggedInUser();
      setAuthStandaloneScreen(null);
      setActiveTab("홈");
      setShoppingTab("목록");
      setAdultGateView("success");
    } catch (error) {
      clearTokens();
      setAuthMessage(error instanceof Error ? error.message : "테스트 계정 로그인에 실패했습니다.");
    }
  };

  const loginWithCredentials = async () => {
    clearTokens();
    try {
      const response = await postJson<{ access_token: string; refresh_token: string; role: string; two_factor_required?: boolean }>("/auth/login", {
        email: authEmail.trim(),
        password: authPassword,
        device_name: "web-browser",
      });
      if (response.two_factor_required) {
        setAuthMessage("관리자 2차 인증이 필요한 계정입니다. 현재 테스트 화면에서는 2FA 완료 계정만 바로 로그인할 수 있습니다.");
        return;
      }
      setAuthToken(response.access_token);
      setRefreshToken(response.refresh_token);
      await applyLoggedInUser();
      setAuthStandaloneScreen(null);
      setActiveTab("홈");
      setShoppingTab("목록");
      setAdultGateView("success");
    } catch (error) {
      clearTokens();
      setAuthMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    }
  };

  const openProductDetail = async (productId: number) => {
    setSelectedProductId(productId);
    setShoppingTab("상품");

    const fallbackDetail = buildFallbackProductDetail(productId);

    try {
      const detail = await getJson<ProductDetailResponse>(`/products/${productId}`);
      setProductDetail({
        ...(fallbackDetail ?? {}),
        ...detail,
        product: {
          ...(fallbackDetail?.product ?? {}),
          ...(detail.product ?? {}),
        },
        media: detail.media?.length ? detail.media : (fallbackDetail?.media ?? []),
        site_ready: {
          ...(fallbackDetail?.site_ready ?? {}),
          ...(detail.site_ready ?? {}),
        },
        seller_contact: {
          ...(fallbackDetail?.seller_contact ?? {}),
          ...(detail.seller_contact ?? {}),
        },
      });
      setOrderMessage("");
    } catch (error) {
      if (fallbackDetail) {
        setProductDetail(fallbackDetail);
        setOrderMessage("샘플 상품 상세 화면으로 표시 중입니다.");
        return;
      }
      setProductDetail(null);
      setOrderMessage(error instanceof Error ? error.message : "상품 상세 조회 실패");
    }
  };

  const verifyAdultSelf = async () => {
    try {
      const result = await postJson<{ adult_verified?: boolean }>("/auth/adult/self-check", { birthdate: adultBirthdate, provider: "self_cert" });
      setAdultVerified(Boolean(result.adult_verified));
      const next = await getJson<AdultGateStatusResponse>("/auth/adult/gate-status");
      setAdultGateStatus(next);
      setOrderMessage("성인 인증이 완료되었습니다. 쇼핑과 결제를 진행할 수 있습니다.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "성인 인증 실패";
      setOrderMessage(message);
      getJson<AdultGateStatusResponse>("/auth/adult/gate-status").then(setAdultGateStatus).catch(() => null);
    }
  };

  const launchVerotelCheckout = async (orderNo?: string) => {
    const targetOrderNo = orderNo || selectedOrderNo || orderDetail?.order?.order_no;
    if (!targetOrderNo) {
      setOrderMessage("먼저 주문을 생성하세요.");
      return;
    }
    try {
      const response = await postJson<VerotelStartResponse>("/payments/verotel/start", { order_no: targetOrderNo, currency: "EUR" });
      const form = document.createElement("form");
      form.method = response.method || "POST";
      form.action = response.action_url || "";
      Object.entries(response.form_fields || {}).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      setOrderMessage(`중립 결제 페이지 이동 준비 완료: ${targetOrderNo}`);
      form.submit();
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "결제창 시작 실패");
    }
  };

  const addSelectedProductToCart = () => {
    const target = productDetail?.product;
    if (!target) {
      setOrderMessage("선택된 상품이 없습니다.");
      return;
    }
    setCartItems((prev) => {
      const found = prev.find((item) => item.productId === target.id);
      if (found) return prev.map((item) => item.productId === target.id ? { ...item, qty: item.qty + Math.max(1, productDetailQuantity) } : item);
      return [...prev, { productId: target.id, qty: Math.max(1, productDetailQuantity) }];
    });
    setCheckoutStage("cart");
    setOrderMessage(`${target.name} · ${Math.max(1, productDetailQuantity)}개가 장바구니에 담겼습니다.`);
  };

  const addToCart = (productId: number) => {
    setCartItems((prev) => {
      const found = prev.find((item) => item.productId === productId);
      if (found) return prev.map((item) => item.productId === productId ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { productId, qty: 1 }];
    });
    setCheckoutStage("cart");
    setShoppingTab("바구니");
  };

  const toggleProductCartFavorite = (productId: number) => {
    setCartItems((prev) => {
      const exists = prev.some((item) => item.productId === productId);
      if (exists) return prev.filter((item) => item.productId !== productId);
      return [...prev, { productId, qty: 1 }];
    });
    setCheckoutStage("cart");
  };

  const addProductToCartFromSearch = (productId: number) => {
    setCartItems((prev) => {
      const found = prev.find((item) => item.productId === productId);
      if (found) return prev.map((item) => item.productId === productId ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { productId, qty: 1 }];
    });
    setCheckoutStage("cart");
    showListEndToast("장바구니에 담았습니다.");
  };

  const cartDetailedItems = useMemo(() => cartItems.map((item) => {
    const product = apiProducts.find((row) => row.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean) as Array<{ productId: number; qty: number; product: ApiProduct }>, [cartItems, apiProducts]);

  const cartTotalAmount = useMemo(() => cartDetailedItems.reduce((sum, item) => sum + (Number(item.product.price || 0) * item.qty), 0), [cartDetailedItems]);

  const refreshOrders = async (preferredOrderNo?: string) => {
    try {
      const nextOrders = await getJson<ApiOrder[]>("/orders");
      setOrders(nextOrders);
      const fallbackOrderNo = preferredOrderNo || selectedOrderNo || nextOrders.length ? nextOrders[nextOrders.length - 1].order_no : "";
      if (fallbackOrderNo) {
        setSelectedOrderNo(fallbackOrderNo);
        try {
          const detail = await getJson<ApiOrderDetail>(`/orders/${fallbackOrderNo}`);
          setOrderDetail(detail);
        } catch {
          setOrderDetail(null);
        }
      } else {
        setOrderDetail(null);
      }
    } catch {
      return null;
    }
    return null;
  };

  const selectOrderForTesting = async (orderNo: string) => {
    setSelectedOrderNo(orderNo);
    try {
      const detail = await getJson<ApiOrderDetail>(`/orders/${orderNo}`);
      setOrderDetail(detail);
      setCheckoutStage("order_confirm");
      setOrderMessage(`테스트 대상 주문 선택: ${orderNo}`);
    } catch (error) {
      setOrderDetail(null);
      setOrderMessage(error instanceof Error ? error.message : "주문 상세 조회 실패");
    }
  };

  const createOrderForSelectedProduct = async () => {
    const target = productDetail?.product;
    if (!target) {
      setOrderMessage("선택된 상품이 없습니다.");
      return;
    }
    try {
      const created = await postJson<{ order_no: string; total_amount: number; payment_init: { mode?: string; webhook_path?: string } }>("/orders", {
        product_id: target.id,
        qty: Math.max(1, productDetailQuantity),
        payment_method: "card",
        payment_pg: "verotel",
      });
      setSelectedOrderNo(created.order_no);
      setCheckoutStage("payment_request");
      setOrderMessage(`상품 주문 생성 완료: ${created.order_no} · ${created.total_amount.toLocaleString()}원`);
      await refreshOrders(created.order_no);
      setShoppingTab("주문");
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "상품 주문 생성 실패");
    }
  };

  const createOrderFromCart = async () => {
    const first = cartDetailedItems[0];
    if (!first) {
      setOrderMessage("바구니가 비어 있습니다.");
      return;
    }
    try {
      const created = await postJson<{ order_no: string; total_amount: number; payment_init: { mode?: string; webhook_path?: string } }>("/orders", {
        product_id: first.product.id,
        qty: first.qty,
        payment_method: "card",
        payment_pg: "demo-pg",
      });
      setCheckoutStage("payment_request");
      setOrderMessage(`주문 생성 완료: ${created.order_no} · ${created.total_amount.toLocaleString()}원 · mode ${created.payment_init?.mode ?? "-"}`);
      await refreshOrders(created.order_no);
      setShoppingTab("주문");
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "주문 생성 실패");
    }
  };

  const confirmSelectedOrder = async () => {
    const target = [...orders].reverse().find((item) => item.status === "payment_pending") ?? orders[orders.length - 1];
    if (!target) {
      setOrderMessage("확인할 주문이 없습니다.");
      return;
    }
    try {
      const result = await postJson<{ status: string }>("/payments/confirm", {
        order_no: target.order_no,
        payment_id: `pay_${Date.now()}`,
        status: "Paid",
        amount: target.total_amount,
        provider: "tosspayments",
        method: "card",
      });
      setCheckoutStage("payment_complete");
      setOrderMessage(`결제 승인 완료: ${target.order_no} → ${result.status}`);
      await refreshOrders(target.order_no);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "결제 승인 실패");
    }
  };

  const cancelSelectedOrder = async (partial = false) => {
    const target = (selectedOrderNo ? orders.find((item) => item.order_no === selectedOrderNo) : null) ?? [...orders].reverse().find((item) => ["paid", "partial_cancelled"].includes(item.status));
    if (!target) {
      setOrderMessage("취소할 결제완료 주문이 없습니다.");
      return;
    }
    const remaining = Number(target.amount_snapshot?.remaining ?? target.total_amount ?? 0);
    if (remaining <= 0) {
      setOrderMessage(`취소 가능한 잔액이 없습니다: ${target.order_no}`);
      return;
    }
    try {
      const requestedAmount = partial ? Number(orderActionAmount || "0") : remaining;
      const amount = Math.min(requestedAmount, remaining);
      const result = await postJson<{ status: string; cancel_amount: number }>(`/payments/orders/${target.order_no}/cancel`, {
        amount,
        reason: partial ? "부분취소 테스트" : "전체취소 테스트",
        idempotency_key: `cancel_${partial ? 'partial' : 'full'}_${Date.now()}`,
      });
      setOrderMessage(`취소 완료: ${target.order_no} · ${result.cancel_amount.toLocaleString()}원 · ${result.status}`);
      await refreshOrders(target.order_no);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "취소 실패");
    }
  };

  const refundSelectedOrder = async (partial = false) => {
    const target = (selectedOrderNo ? orders.find((item) => item.order_no === selectedOrderNo) : null) ?? [...orders].reverse().find((item) => ["paid", "partial_cancelled"].includes(item.status));
    if (!target) {
      setOrderMessage("환불할 결제완료 주문이 없습니다.");
      return;
    }
    const remaining = Number(target.amount_snapshot?.remaining ?? target.total_amount ?? 0);
    if (remaining <= 0) {
      setOrderMessage(`환불 가능한 잔액이 없습니다: ${target.order_no}`);
      return;
    }
    try {
      const requestedAmount = partial ? Number(orderActionAmount || "0") : remaining;
      const amount = Math.min(requestedAmount, remaining);
      const result = await postJson<{ status: string; refund_amount: number }>(`/payments/orders/${target.order_no}/refund`, {
        amount,
        reason: partial ? "부분환불 테스트" : "전체환불 테스트",
        idempotency_key: `refund_${partial ? 'partial' : 'full'}_${Date.now()}`,
      });
      setOrderMessage(`환불 완료: ${target.order_no} · ${result.refund_amount.toLocaleString()}원 · ${result.status}`);
      await refreshOrders(target.order_no);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "환불 실패");
    }
  };

  const runWebhookSignatureTest = async () => {
    try {
      const result = await postJson<{ verified: boolean; mode: string }>("/payments/webhooks/test-signature", { event_type: "Transaction.Paid", data: { paymentId: `pay_${Date.now()}` }, mode: "test" });
      setOrderMessage(`webhook 서명 점검 호출 완료 · verified=${String(result.verified)} · mode=${result.mode}`);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "webhook 점검 실패");
    }
  };

  const resetAdultFlow = () => {
    setDemoLoginProvider("카카오");
    setIdentityMethod("미완료");
    setIdentityVerified(false);
    setIdentityVerificationToken("");
    setAdultVerified(false);
    setAdultFailCount(0);
    setAdultCooldownUntil(0);
    setAdultGateView("intro");
    setAdultPromptOpen(false);
    setSignupStep("consent");
  };

  const attemptAdultVerification = async (mode: "success" | "fail" | "minor") => {
    if (adultCooldownUntil > Date.now()) {
      setAdultGateView("failed");
      return;
    }
    if (mode === "minor") {
      setAdultVerified(false);
      setAdultGateView("minor");
      return;
    }
    try {
      const start = await postJson<{ tx_id: string }>("/auth/adult/start", { provider: identityMethod === "미완료" ? "PASS" : identityMethod });
      const result = await postJson<{ ok: boolean; adult_verified: boolean; adult_verification_fail_count: number; adult_verification_locked_until: string | null }>("/auth/adult/confirm", { tx_id: start.tx_id, verification_code: mode === "success" ? "000000" : "111111" });
      setAdultVerified(Boolean(result.adult_verified));
      setAdultFailCount(result.adult_verification_fail_count ?? 0);
      setAdultCooldownUntil(result.adult_verification_locked_until ? new Date(result.adult_verification_locked_until).getTime() : 0);
      setAdultGateView(result.adult_verified ? "success" : "failed");
      setAdultPromptOpen(!result.adult_verified);
      if (result.adult_verified) return;
    } catch {
      // fallback to local demo flow
    }
    if (mode === "success") {
      setAdultVerified(true);
      setAdultFailCount(0);
      setAdultCooldownUntil(0);
      setAdultGateView("success");
      setAdultPromptOpen(false);
      return;
    }
    const nextFail = adultFailCount + 1;
    setAdultFailCount(nextFail);
    setAdultGateView("failed");
    if (nextFail >= 5) {
      setAdultCooldownUntil(Date.now() + (60 * 60 * 1000));
    }
  };

  useEffect(() => {
    if (!requiresAdultGate) {
      setAdultPromptOpen(false);
      return;
    }
    setAdultPromptOpen(true);
  }, [requiresAdultGate, activeTab]);

  const currentScreenTitle = overlayMode === "search"
    ? `${activeTab}검색`
    : overlayMode === "settings"
      ? `${activeTab}설정`
      : overlayMode === "notifications"
        ? `${activeTab}알림`
        : activeTab === "프로필" && !currentProfileMeta.isOwner
          ? "정보"
          : activeTab;

  const openOverlay = (mode: Exclude<OverlayMode, null>) => {
    setOverlayMode((prev) => (prev === mode ? null : mode));
    setRoomModalOpen(false);
    if (mode === "search") setSearchFilter("전체");
  };

  useEffect(() => {
    setSearchSection(searchSectionsByTab[activeTab][0]);
  }, [activeTab]);

  useEffect(() => {
    if (overlayMode === "search") {
      setSearchSection(searchSectionsByTab[activeTab][0]);
    }
    if (overlayMode === "notifications") {
      setNotificationView({ view: "list", section: null, item: null });
    }
  }, [overlayMode, activeTab]);

  useEffect(() => {
    if (!htmlInspectorEnabled) return undefined;
    const handleCtrlClick = (event: MouseEvent) => {
      if (!event.ctrlKey || event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('.html-inspector-modal') || target.closest('.settings-category-nav')) return;
      event.preventDefault();
      event.stopPropagation();
      if (inspectedTargetRef.current) {
        inspectedTargetRef.current.classList.remove("html-inspector-target");
      }
      target.classList.add("html-inspector-target");
      inspectedTargetRef.current = target;
      const textContent = (target.innerText || target.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 300);
      const html = target.outerHTML.slice(0, 5000);
      setInspectedElement({
        selector: buildElementSelector(target),
        tagName: target.tagName.toLowerCase(),
        id: target.id || '-',
        className: target.className || '-',
        text: textContent || '-',
        html,
        cssText: buildElementCssText(target),
        modalStyle: buildInspectorModalStyle(target),
      });
    };
    document.addEventListener('click', handleCtrlClick, true);
    return () => document.removeEventListener('click', handleCtrlClick, true);
  }, [htmlInspectorEnabled]);

  const startRandomMatch = () => {
    if (matchingRandom) return;
    setRandomSettingsOpen(false);
    setMatchedRandomUser(null);
    setRandomMatchPhase("queueing");
    const distanceLabel = randomRegionOption === "거리기반" ? `거리 ${randomDistanceMinKm}km~${randomDistanceMaxKm}km` : randomRegionOption;
    setRandomMatchNote(`${oneToOneCategory} 카테고리 대기열에 등록되었습니다. 성별 ${randomGenderOption} · 연령 ${randomAgeMin}~${randomAgeMax}세 · 지역 ${distanceLabel} 조건으로 매칭 상대를 찾는 중입니다. 재시도 최대 4회, 탐색 최대 5분 기준입니다.`);
    setMatchingRandom(true);
    window.setTimeout(() => {
      const demoMatches: Record<OneToOneRandomCategory, { name: string; nickname: string }> = {
        고민상담: { name: "익명 상담 사용자", nickname: "달빛고민러" },
        자유수다: { name: "자유수다 메이트", nickname: "수다한잔" },
        아무말대잔치: { name: "아무말 메이트", nickname: "말풍선친구" },
        도파민수다: { name: "도파민 토커", nickname: "텐션부스터" },
      };
      const picked = demoMatches[oneToOneCategory];
      const roomId = Date.now();
      const createdRoom: RandomRoom = {
        id: roomId,
        title: `${oneToOneCategory} · 1:1익명 정보채팅`,
        category: oneToOneCategory,
        maxPeople: 2,
        currentPeople: 2,
        password: "",
        latestMessage: `${picked.nickname} 님과 익명 정보교류 채팅이 연결되었습니다. 목록에서 선택하면 채팅방으로 들어갑니다.`,
        anonymous: true,
        kind: "random_1to1",
        partnerName: picked.name,
        partnerNickname: picked.nickname,
        expiresAt: Date.now() + (randomRoomLifetimeMinutes * 60 * 1000),
        ageMin: randomAgeMin,
        ageMax: randomAgeMax,
        distanceMinKm: randomDistanceMinKm,
        distanceMaxKm: randomDistanceMaxKm,
        genderOption: randomGenderOption,
        regionOption: randomRegionOption,
        status: "active",
      };
      setRandomRooms((prev) => [createdRoom, ...prev]);
      setMatchedRandomUser({ ...picked, category: oneToOneCategory });
      setRandomMatchPhase("matched");
      setRandomMatchNote(`${picked.nickname} 님과 연결되었습니다. 채팅방은 자동 생성되었고, 목록 탭에서 선택해야 입장됩니다. 1:1 채팅방 유지시간은 ${randomRoomLifetimeMinutes}분 고정이며 종료된 방은 최근 종료 목록으로 남습니다.`);
      setRandomEntryTab("목록");
      setMatchingRandom(false);
    }, 1600);
  };

  const cancelRandomMatch = () => {
    setMatchingRandom(false);
    setRandomMatchPhase("idle");
    setMatchedRandomUser(null);
    setRandomMatchNote("익명 정보교류 채팅 대기열에서 빠졌습니다. 텍스트 전용, 신고 즉시 차단·숨김, 재매칭 제한 정책이 함께 적용됩니다.");
  };

  const openRandomRoom = (roomId: number) => {
    const room = randomRooms.find((item) => item.id === roomId);
    if (!room || room.status === "ended") return;
    setActiveRandomRoomId(roomId);
    setRandomEntryTab("목록");
  };

  const leaveRandomRoom = () => {
    setActiveRandomRoomId(null);
  };

  const endRandomRoom = (roomId: number) => {
    setRandomRooms((prev) => prev.map((room) => room.id === roomId ? { ...room, status: "ended", endedAt: Date.now(), latestMessage: "채팅이 종료되어 최근 종료 목록으로 이동했습니다." } : room));
    setActiveRandomRoomId((prev) => (prev === roomId ? null : prev));
  };

  const reportRandomRoom = (room: RandomRoom) => {
    window.alert(`${room.partnerNickname ?? room.title} 채팅에 대한 신고 접수 데모입니다. 실제 운영에서는 결과 비공개, 신고 즉시 차단/숨김 정책과 연동합니다.`);
  };

  const handleChatListScroll = useCallback((event: ReactUIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const remain = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (remain <= 120) {
      setChatVisibleCount((prev) => Math.min(prev + 10, filteredThreads.length));
    }
  }, [filteredThreads.length]);

  const openForumRoom = useCallback((room: ForumRoom) => {
    setActiveForumRoomId(room.id);
    setForumRoomMessages((prev) => {
      if (prev[room.id]) return prev;
      return {
        ...prev,
        [room.id]: [
          { id: room.id * 100 + 1, author: "포럼 안내", text: forumRoomNoticeText, meta: "입장 안내", kind: "system" },
          { id: room.id * 100 + 2, author: room.starter, text: room.introMessage, meta: room.latestAt, kind: "member" },
        ],
      };
    });
  }, []);

  const closeForumRoom = useCallback(() => {
    setActiveForumRoomId(null);
  }, []);

  const openAskFromFeed = (item: FeedItem) => {
    const matched = askProfiles.find((profile) => profile.name.toLowerCase() === item.author.toLowerCase()) ?? askProfiles[0];
    setSelectedAskProfile(matched);
  };

  const createRandomRoom = () => {
    if (!adultVerified) {
      window.alert("성인인증 완료 회원만 단체 톡방을 개설할 수 있습니다.");
      setAdultPromptOpen(true);
      return;
    }
    if (groupRoomSuspendedUntil > Date.now()) {
      window.alert(`현재 계정은 신고/제재 반영으로 ${new Date(groupRoomSuspendedUntil).toLocaleString()}까지 단체 톡방 개설이 제한됩니다.`);
      return;
    }
    const parsedMax = Math.max(2, Math.min(20, Number(newRoomMaxPeople) || 8));
    const safeTitle = newRoomTitle.trim() || `${newRoomCategory} 채팅방`;
    const nextRoom: RandomRoom = {
      id: Date.now(),
      category: newRoomCategory,
      maxPeople: parsedMax,
      currentPeople: 1,
      password: newRoomPassword,
      title: safeTitle,
      anonymous: newRoomAnonymous,
      latestMessage: newRoomAnonymous ? "익명으로 생성된 방입니다. 가이드를 확인하고 입장하세요." : "새로 개설된 방입니다. 첫 대화를 시작해보세요.",
      kind: "group",
      expiresAt: Date.now() + (60 * 60 * 1000),
    };
    setRandomRooms((prev) => [nextRoom, ...prev]);
    setRandomRoomCategory("전체");
    setNewRoomCategory("관계역할/고민");
    setNewRoomTitle("");
    setNewRoomAnonymous(true);
    setNewRoomMaxPeople("8");
    setNewRoomPassword("");
    setRoomModalOpen(false);
  };

  const currentTabMenuItems = useMemo<HeaderNavItem[]>(() => {
    if (activeTab === "홈") {
      return homeTabs.map((tab) => ({ label: tab, active: homeTab === tab, onClick: () => setHomeTab(tab) }));
    }
    if (activeTab === "쇼핑") {
      return [
        { label: "홈", active: shoppingTab === "홈", onClick: () => setShoppingTab("홈") },
        { label: "주문", active: shoppingTab === "주문", onClick: () => setShoppingTab("주문") },
        { label: "바구니", active: shoppingTab === "바구니", onClick: () => setShoppingTab("바구니") },
      ];
    }
    if (activeTab === "소통") {
      return communityTabs.map((tab) => ({ label: tab, active: communityTab === tab, onClick: () => setCommunityTab(tab) }));
    }
    if (activeTab === "채팅") {
      return chatTabs.map((tab) => ({ label: chatTabLabels[tab], active: chatTab === tab, onClick: () => setChatTab(tab) }));
    }
    return profileTabs.map((tab) => ({ label: tab, active: profileTab === tab, onClick: () => setProfileTab(tab) }));
  }, [activeTab, homeTab, shoppingTab, communityTab, chatTab, profileTab]);

  const favoriteCandidates = useMemo(() => currentTabMenuItems.map((item) => item.label), [currentTabMenuItems]);

  const headerNavItems = useMemo<HeaderNavItem[]>(() => {
    const favoriteLabels = headerFavorites[activeTab] ?? [];
    const itemsByLabel = new Map(currentTabMenuItems.map((item) => [item.label, item]));
    const orderedFavorites = favoriteLabels
      .map((label) => itemsByLabel.get(label))
      .filter((item): item is HeaderNavItem => Boolean(item));
    const fallbackItems = currentTabMenuItems.filter((item) => !favoriteLabels.includes(item.label));
    return [...orderedFavorites, ...fallbackItems].slice(0, Math.max(1, orderedFavorites.length || 0));
  }, [activeTab, currentTabMenuItems, headerFavorites]);

  const toggleHeaderFavorite = (label: string) => {
    setHeaderFavorites((prev) => {
      const current = prev[activeTab] ?? [];
      const next = current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label];
      return {
        ...prev,
        [activeTab]: next.length ? next : [label],
      };
    });
  };

  const resetHeaderFavorites = () => {
    setHeaderFavorites((prev) => ({ ...prev, [activeTab]: defaultHeaderFavorites[activeTab] }));
  };

  const openNotificationDetail = useCallback((sectionKey: NotificationSectionKey, item: NotificationItem) => {
    setNotificationItems((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, unread: false } : entry));
    setNotificationView({ view: "detail", section: sectionKey, item: { ...item, unread: false } });
  }, []);
  const openNotificationSection = useCallback((sectionKey: NotificationSectionKey) => {
    setNotificationSectionPage(1);
    setNotificationView({ view: "section", section: sectionKey, item: null });
  }, []);

  const settingsNavItems = useMemo<SettingsCategory[]>(() => settingsCategories.filter((item) => item !== "계정설정" && (!["DB관리", "신고", "채팅", "기타"].includes(item)) && (["운영", "관리자모드"].includes(item) ? isAdmin : true)), [isAdmin]);
  const isAnyShortsViewerOpen = shortsViewerItemId !== null || savedShortsViewerItemId !== null;
  const visibleHeaderNavItems = overlayMode === null ? headerNavItems : [];
  const currentMenuItems = (activeTab === "홈" ? homeMenuItems : currentTabMenuItems.map((item) => ({ label: item.label, onClick: item.onClick }))).map((item) => ({ label: item.label, onClick: () => { item.onClick?.(); setOverlayMode(null); } }));

  const notificationSections = useMemo(() => ({
    notices: notificationItems.filter((item) => item.section === "공지"),
    orders: notificationItems.filter((item) => item.section === "주문"),
    community: notificationItems.filter((item) => item.section === "소통"),
    events: notificationItems.filter((item) => item.section === "이벤트"),
  }), [notificationItems]);
  const notificationSectionMeta: Record<NotificationSectionKey, { title: string; shortTitle: string }> = {
    notices: { title: "앱 공지사항", shortTitle: "공지" },
    events: { title: "이벤트", shortTitle: "이벤트" },
    orders: { title: "쇼핑주문·배송 알림", shortTitle: "쇼핑" },
    community: { title: "소통·채팅·질문·기타 알림", shortTitle: "기타" },
  };
  const notificationSectionOrder: NotificationSectionKey[] = ["notices", "orders", "community", "events"];
  const unreadNotificationCount = useMemo(() => notificationItems.filter((item) => item.unread).length, [notificationItems]);
  const activeNotificationSectionItems = useMemo(() => {
    if (!notificationView.section) return [] as NotificationItem[];
    return notificationSections[notificationView.section];
  }, [notificationSections, notificationView.section]);
  const notificationSectionTotalPages = useMemo(() => {
    if (!notificationView.section) return 1;
    return Math.max(1, Math.ceil(activeNotificationSectionItems.length / notificationSectionPageSize));
  }, [activeNotificationSectionItems.length, notificationSectionPageSize, notificationView.section]);
  const visibleNotificationSectionItems = useMemo(() => {
    if (!notificationView.section) return [] as NotificationItem[];
    const start = (notificationSectionPage - 1) * notificationSectionPageSize;
    return activeNotificationSectionItems.slice(start, start + notificationSectionPageSize);
  }, [activeNotificationSectionItems, notificationSectionPage, notificationSectionPageSize, notificationView.section]);
  useEffect(() => {
    setNotificationSectionPage((prev) => Math.min(prev, notificationSectionTotalPages));
  }, [notificationSectionTotalPages]);
  const searchSectionsByTab: Record<MobileTab, string[]> = {
    홈: ["피드결과", "쇼츠결과", "보관함결과"],
    쇼핑: ["홈"],
    소통: ["커뮤", "포럼", "후기"],
    채팅: ["채팅", "질문"],
    프로필: ["내정보"],
  };
  const currentSearchSections = searchSectionsByTab[activeTab];
  const getNotificationChipTone = (sectionKey: NotificationSectionKey | null) => (sectionKey === "orders" ? "order" : sectionKey === "community" ? "community" : sectionKey === "events" ? "event" : "");
  const notificationDetailAuthor = notificationView.item?.author || notificationView.item?.meta || "운영팀";
  const homeShortSearchResults = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return recommendedShorts.filter((item) => `${item.title} ${item.caption} ${item.author} ${item.category}`.toLowerCase().includes(keyword));
  }, [globalKeyword, recommendedShorts]);
  const homeSavedSearchResults = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [] as Array<{ id: string; title: string; summary: string; meta: string }>;
    const savedFeed = savedFeedItems
      .filter((item) => `${item.title} ${item.caption} ${item.author} ${item.category}`.toLowerCase().includes(keyword))
      .map((item) => ({ id: `feed-${item.id}`, title: item.title, summary: item.caption, meta: `피드 · ${item.author}` }));
    const savedShorts = savedShortItems
      .filter((item) => `${item.title} ${item.caption} ${item.author} ${item.category}`.toLowerCase().includes(keyword))
      .map((item) => ({ id: `short-${item.id}`, title: item.title, summary: item.caption, meta: `쇼츠 · ${item.author}` }));
    return [...savedFeed, ...savedShorts];
  }, [globalKeyword, savedFeedItems, savedShortItems]);
  const communicationOverlayResults = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [] as CommunityPost[];
    return communitySeed.filter((item) => {
      const boardMatch = searchSection === "커뮤" ? (item.board === "커뮤" || !item.board) : item.board === searchSection;
      const primaryMatch = communityPrimaryFilter === "전체" || item.audience === communityPrimaryFilter;
      const keywordMatch = `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(keyword);
      return boardMatch && primaryMatch && keywordMatch;
    });
  }, [globalKeyword, searchSection, communityPrimaryFilter]);
  const questionSearchResults = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return questionSeed.filter((item) => `${item.author} ${item.question} ${item.answer}`.toLowerCase().includes(keyword));
  }, [globalKeyword]);

  const selectBottomTab = (tab: MobileTab) => {
    if (tab === activeTab && overlayMode === null && !roomModalOpen && !selectedAskProfile && !openFeedCommentItem && !feedComposeOpen && !feedComposeLauncherOpen) {
      if (tab === "쇼핑" && shoppingTab !== "홈") {
        setProductDetail(null);
        setSelectedProductId(null);
        setShoppingTab("홈");
      }
      if (tab === "채팅") {
        setActiveChatThreadId(null);
        setChatTab("채팅");
        setChatDiscoveryOpen(false);
        setChatListMode("threads");
      }
      return;
    }
    setSelectedAskProfile(null);
    setOpenFeedCommentItem(null);
    setFeedComposeOpen(false);
    setFeedComposeLauncherOpen(false);
    setActiveTab(tab);
    if (tab === "홈") setHomeTab((prev) => prev || "피드");
    if (tab === "채팅") {
      setActiveChatThreadId(null);
      setChatTab("채팅");
      setChatDiscoveryOpen(false);
      setChatListMode("threads");
    }
    if (tab === "프로필") {
      setViewedProfileAuthor(null);
      setProfileSection("게시물");
    }
    if (overlayMode !== null) setOverlayMode(null);
    if (roomModalOpen) setRoomModalOpen(false);
    if (activeTab === "채팅" && tab !== "채팅") {
      setRandomSettingsOpen(false);
      setMatchingRandom(false);
      setMatchedRandomUser(null);
      setRandomMatchPhase("idle");
      setRandomMatchNote("카테고리를 고른 뒤 익명 정보교류용 텍스트 채팅을 시작할 수 있습니다. 외부연락, 사람 찾기, 만남유도, 사진/영상 교환은 금지됩니다.");
    }
  };

  const searchFilterOptions = activeTab === "홈"
    ? ["전체", "피드", "작성자"]
    : activeTab === "쇼핑"
      ? ["전체", "상품명", "내용", "카테고리"]
      : activeTab === "소통"
        ? ["전체", "제목", "내용", "카테고리"]
        : activeTab === "채팅"
          ? ["전체", "제목", "내용", "유형"]
          : ["전체", "아이디", "피드"];

  useEffect(() => {
    if (activeTab !== "쇼핑" || overlayMode !== "search") return;
    setShopSearchVisibleCount(12);
  }, [activeTab, overlayMode, globalKeyword, searchFilter, shopSearchPriceMin, shopSearchPriceMax, shopSearchColor, shopSearchPurpose]);

  useEffect(() => {
    if (overlayMode === "search" && activeTab === "쇼핑") return;
    setShopSearchFilterPanelOpen(false);
  }, [overlayMode, activeTab]);

  const handleShopSearchResultsScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    if (activeTab !== "쇼핑") return;
    const target = event.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 180) {
      setShopSearchVisibleCount((prev) => Math.min(prev + 12, shopSearchResults.length));
    }
  };

  const openShopSearchFilterPanel = () => {
    if (activeTab !== "쇼핑") return;
    setShopSearchFilterPanelOpen((prev) => !prev);
  };

  const closeShopSearchFilterPanel = () => {
    setShopSearchFilterPanelOpen(false);
  };

  const resetShopSearchFilters = () => {
    setSearchFilter("전체");
    setShopSearchPriceMin("");
    setShopSearchPriceMax("");
    setShopSearchColor("전체");
    setShopSearchPurpose("전체");
  };

  const profileSearchResults = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    const ownerKeywordSource = normalizeProfileKeywordTags(demoProfile.hashtags).join(" ").toLowerCase();
    return allFeedItems.filter((item) => {
      const isOwnerItem = currentProfileMeta.isOwner && currentProfileAuthorAliases.includes(item.author);
      if (searchFilter === "아이디") return item.author.toLowerCase().includes(keyword);
      if (searchFilter === "피드") return `${item.title} ${item.caption} ${isOwnerItem ? ownerKeywordSource : ""}`.toLowerCase().includes(keyword);
      return `${item.author} ${item.title} ${item.caption} ${isOwnerItem ? ownerKeywordSource : ""}`.toLowerCase().includes(keyword);
    });
  }, [currentProfileAuthorAliases, currentProfileMeta.isOwner, demoProfile.hashtags, globalKeyword, searchFilter]);

  if (!authBootstrapDone) {
    return (
      <div className="auth-standalone-shell">
        <main className="auth-standalone-main">
          <section className="auth-standalone-card">
            <div className="auth-standalone-head">
              <div>
                <h1>세션 확인 중</h1>
                <p>저장된 로그인 정보를 먼저 확인하고 있습니다.</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (authStandaloneScreen) {
    return (
      <div className="auth-standalone-shell">
        {authGatePopupOpen ? (
          <div className="modal-backdrop">
            <div className="modal-card adult-auth-modal">
              <div className="modal-header-row">
                <strong>로그인 필요</strong>
                <button className="ghost-btn" onClick={() => setAuthGatePopupOpen(false)}>닫기</button>
              </div>
              <div className="stack-gap">
                <div className="legacy-box compact">
                  <p>로그인 후 이용할 수 있습니다.</p>
                  <p>청소년은 회원가입 및 로그인할 수 없습니다.</p>
                  <p>본인확인 결과에 따라 서비스 접속이 제한될 수 있습니다.</p>
                </div>
                <div className="copy-action-row">
                  <button type="button" onClick={() => setAuthGatePopupOpen(false)}>확인</button>
                  <button type="button" className="ghost-btn" onClick={() => { setAuthGatePopupOpen(false); setSignupStep("consent"); setAuthStandaloneScreen("signup"); }}>회원가입</button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <main className="auth-standalone-main">
          <section className="auth-standalone-card">
            <div className={`auth-standalone-head ${authStandaloneScreen === "signup" ? "auth-standalone-head--signup" : ""}`}>
              {authStandaloneScreen === "signup" ? (
                <div className="auth-standalone-headbar">
                  <button
                    type="button"
                    className="header-inline-btn header-icon-btn auth-back-icon-btn"
                    onClick={() => setAuthStandaloneScreen("login")}
                    aria-label="뒤로가기"
                  >
                    <BackArrowIcon />
                  </button>
                  <h1>회원가입</h1>
                  <span className="auth-standalone-headbar-spacer" aria-hidden="true" />
                </div>
              ) : (
                <div>
                  <h1>로그인</h1>
                </div>
              )}
            </div>
            {authStandaloneScreen === "login" ? (
              <div className="auth-standalone-body stack-gap">
                <div className="signup-form-grid auth-login-grid">
                  <label><span>이메일</span><input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="customer@example.com" /></label>
                  <label><span>비밀번호</span><input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="비밀번호 입력" /></label>
                </div>
                <div className="copy-action-row">
                  <button type="button" onClick={loginWithCredentials}>로그인</button>
                  <button type="button" className="ghost-btn" onClick={() => { setSignupStep("consent"); setAuthStandaloneScreen("signup"); }}>회원가입</button>
                </div>
                <button
                  type="button"
                  className="ghost-btn admin-test-login-btn"
                  onClick={() => loginWithTestAccount("aksqhqkqh3@naver.com", "329tjdrb@2a")}
                >
                  관리자용 계정 테스트 접속
                </button>
                {authMessage ? <p className="auth-message-line">{authMessage}</p> : null}
              </div>
            ) : (
              <div className="auth-standalone-body stack-gap signup-screen-body">
                <div className="signup-step-strip signup-step-strip-mobile">
                  {[
                    ["consent", "1단계 법정 문서 확인"],
                    ["account", "2단계 가입 입력"],
                    ["profile", "3단계 선택 정보 입력"],
                  ].map(([step, label]) => (
                    <button key={step} type="button" className={`signup-step-btn ${signupStep === step ? "active" : ""}`} onClick={() => {
                      if (step === "consent") { setSignupStep("consent"); return; }
                      if (step === "account" && requiredConsentAccepted) { setSignupStep("account"); return; }
                      if (step === "profile" && signupAccountValid) { setSignupStep("profile"); }
                    }}>{label}</button>
                  ))}
                </div>
                {signupStep === "consent" ? (
                  <div className="stack-gap signup-step-panel signup-step-panel-consent">
                    {signupConsentModal ? (
                      <div className="modal-backdrop">
                        <div className="modal-card signup-consent-modal">
                          <div className="modal-header-row">
                            <strong>{signupConsentMeta[signupConsentModal].title}</strong>
                            <button type="button" className="ghost-btn" onClick={() => setSignupConsentModal(null)}>닫기</button>
                          </div>
                          <div className="stack-gap">
                            <div className="legacy-box compact signup-consent-modal-copy">
                              <p>{signupConsentMeta[signupConsentModal].summary}</p>
                              {signupConsentMeta[signupConsentModal].body.map((item) => (
                                <p key={item}>{item}</p>
                              ))}
                            </div>
                            {signupConsentMeta[signupConsentModal].href ? (
                              <div className="legacy-box compact signup-consent-modal-frame">
                                <iframe
                                  title={signupConsentMeta[signupConsentModal].title}
                                  src={signupConsentMeta[signupConsentModal].href}
                                  className="signup-consent-iframe"
                                />
                              </div>
                            ) : null}
                            <div className="copy-action-row signup-consent-modal-actions">
                              <button type="button" onClick={() => setSignupConsentModal(null)}>확인</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div className="legacy-box compact signup-legal-copy signup-panel">
                      <h3>약관 안내</h3>
                    </div>
                    <div className="consent-checklist signup-consent-checklist">
                      <label className={`consent-row ${signupConsents.terms ? "checked" : ""}`}>
                        <input type="checkbox" checked={signupConsents.terms} onChange={(e) => toggleSignupConsent("terms", e.target.checked)} />
                        <span role="button" tabIndex={0} onClick={() => openSignupConsentModal("terms")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSignupConsentModal("terms"); } }}>[필수] 이용약관 확인</span>
                      </label>
                      <label className={`consent-row ${signupConsents.privacy ? "checked" : ""}`}>
                        <input type="checkbox" checked={signupConsents.privacy} onChange={(e) => toggleSignupConsent("privacy", e.target.checked)} />
                        <span role="button" tabIndex={0} onClick={() => openSignupConsentModal("privacy")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSignupConsentModal("privacy"); } }}>[필수] 개인정보 처리방침 확인</span>
                      </label>
                      <label className={`consent-row ${signupConsents.adultNotice ? "checked" : ""}`}>
                        <input type="checkbox" checked={signupConsents.adultNotice} onChange={(e) => toggleSignupConsent("adultNotice", e.target.checked)} />
                        <span role="button" tabIndex={0} onClick={() => openSignupConsentModal("adultNotice")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSignupConsentModal("adultNotice"); } }}>[필수] 만 19세 이상 및 성인 서비스 이용 고지 확인</span>
                      </label>
                      <label className={`consent-row ${signupConsents.identityNotice ? "checked" : ""}`}>
                        <input type="checkbox" checked={signupConsents.identityNotice} onChange={(e) => toggleSignupConsent("identityNotice", e.target.checked)} />
                        <span role="button" tabIndex={0} onClick={() => openSignupConsentModal("identityNotice")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSignupConsentModal("identityNotice"); } }}>[필수] 본인확인/성인인증 결과 처리 안내 확인</span>
                      </label>
                      <label className={`consent-row ${signupConsents.marketing ? "checked" : ""}`}>
                        <input type="checkbox" checked={signupConsents.marketing} onChange={(e) => toggleSignupConsent("marketing", e.target.checked)} />
                        <span role="button" tabIndex={0} onClick={() => openSignupConsentModal("marketing")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSignupConsentModal("marketing"); } }}>[선택] 마케팅 정보 수신 동의</span>
                      </label>
                      <label className={`consent-row ${signupConsents.profileOptional ? "checked" : ""}`}>
                        <input type="checkbox" checked={signupConsents.profileOptional} onChange={(e) => toggleSignupConsent("profileOptional", e.target.checked)} />
                        <span role="button" tabIndex={0} onClick={() => openSignupConsentModal("profileOptional")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSignupConsentModal("profileOptional"); } }}>[선택] 맞춤 추천을 위한 프로필 정보 수집 동의</span>
                      </label>
                    </div>
                    <div className="copy-action-row signup-action-row signup-action-row--single">
                      <button type="button" onClick={advanceSignupStep}>다음</button>
                    </div>
                    <div className="legal-disclosure-card compact">
                      <strong>사업자 정보 및 고객센터</strong>
                      <span>문의 이메일: {disclosedBusinessInfo.email}</span>
                      <span>상호명: {disclosedBusinessInfo.operatorName}</span>
                      <span>대표자: {disclosedBusinessInfo.representative}</span>
                      <span>사업자번호: {disclosedBusinessInfo.registrationNo}</span>
                      <span>연락처: {disclosedBusinessInfo.phone}</span>
                      <span>주소: {disclosedBusinessInfo.address}</span>
                      <div className="notification-policy-links legal-link-row">
                        {legalQuickLinks.map((item) => <a key={item.key} className="ghost-link-btn" href={item.href} target="_blank" rel="noreferrer">{item.label}</a>)}
                      </div>
                    </div>
                  </div>
                ) : null}
{signupStep === "account" ? (
                  <div className="stack-gap signup-step-panel signup-step-panel-account">
                    <div className="signup-form-grid signup-form-grid--account">
                      <label><span>로그인 수단</span><select value={signupForm.loginMethod} onChange={(e) => setSignupForm((prev) => ({ ...prev, loginMethod: e.target.value as LoginMethod }))}><option value="이메일">이메일</option><option value="카카오">카카오</option></select></label>
                      <label><span>이메일</span><input value={signupForm.email} onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="you@example.com" /></label>
                      <label><span>비밀번호</span><input type="password" value={signupForm.password} onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="비밀번호 입력" /></label>
                      <label><span>표시 이름</span><input value={signupForm.displayName} onChange={(e) => setSignupForm((prev) => ({ ...prev, displayName: e.target.value }))} placeholder="앱에서 보일 이름" /></label>
                      <label className="wide"><span>휴대폰 본인확인 결과 토큰</span><input value={identityVerificationToken} readOnly placeholder="PASS/휴대폰 본인확인 완료 시 서버 토큰이 자동 입력됩니다" /></label>
                      <label><span>성인인증 상태</span><input value={adultVerified ? "완료" : "가입 후 홈/쇼핑 진입 시 1회 추가 인증"} readOnly /></label>
                    </div>
                    <div className="legacy-grid three auth-option-grid signup-auth-option-grid">
                      <div className="legacy-box compact"><h3>PASS 인증</h3><p>PASS 기반 본인확인 흐름을 테스트합니다.</p><button type="button" onClick={() => startIdentitySignup("PASS")}>PASS 인증 완료 처리</button></div>
                      <div className="legacy-box compact"><h3>휴대폰 인증</h3><p>휴대폰 인증 흐름을 테스트합니다.</p><button type="button" onClick={() => startIdentitySignup("휴대폰")}>휴대폰 인증 완료 처리</button></div>
                      <div className="legacy-box compact"><h3>카카오 로그인</h3><p>카카오는 로그인 편의 수단으로만 사용합니다.</p><button type="button" className="ghost-btn" onClick={() => setDemoLoginProvider("카카오")}>카카오 로그인 방식 선택</button></div>
                    </div>
                    <div className="copy-action-row signup-action-row">
                      <button type="button" className="ghost-btn" onClick={() => setSignupStep("consent")}>이전</button>
                      <button type="button" onClick={advanceSignupStep} disabled={!signupAccountValid}>다음</button>
                    </div>
                  </div>
                ) : null}
                {signupStep === "profile" ? (
                  <div className="stack-gap signup-step-panel signup-step-panel-profile">
                    <div className="signup-form-grid profile-edit-grid signup-form-grid--profile">
                      <label><span>성별</span><select value={demoProfile.gender} onChange={(e) => setDemoProfile((prev) => ({ ...prev, gender: e.target.value }))}>{profileGenderOptions.map((item) => <option key={item || "blank"} value={item}>{item || "선택 안 함"}</option>)}</select></label>
                      <label><span>연령대</span><select value={demoProfile.ageBand} onChange={(e) => setDemoProfile((prev) => ({ ...prev, ageBand: e.target.value }))}>{profileAgeBandOptions.map((item) => <option key={item || "blank"} value={item}>{item || "선택 안 함"}</option>)}</select></label>
                      <label><span>지역</span><select value={demoProfile.regionCode} onChange={(e) => setDemoProfile((prev) => ({ ...prev, regionCode: e.target.value }))}>{profileRegionOptions.map((item) => <option key={item || "blank"} value={item}>{item || "선택 안 함"}</option>)}</select></label>
                      <label className="wide"><span>관심 카테고리</span><div className="chip-checklist">{interestCategoryOptions.map((item) => <button key={item} type="button" className={`chip-check ${demoProfile.interests.includes(item) ? "active" : ""}`} onClick={() => toggleInterestCategory(item)}>{item}</button>)}</div></label>
                    </div>
                    <div className="copy-action-row signup-action-row signup-action-row--triple">
                      <button type="button" className="ghost-btn" onClick={() => setSignupStep("account")}>이전</button>
                      <button type="button" className="ghost-btn" onClick={() => completeSignupFlow(true)}>선택 정보 없이 가입 완료</button>
                      <button type="button" onClick={() => completeSignupFlow(false)}>회원가입 완료</button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  const loadDesktopProductForEdit = async (productId: number) => {
    setDesktopProductCrudBusy(true);
    setDesktopProductCrudMessage("");
    try {
      const detail = await getJson<ProductDetailResponse>(`/products/${productId}`);
      const product = detail.product;
      const imageUrls = [...(detail.media ?? []).map((item) => item.file_url ?? '').filter(Boolean), ...(product.thumbnail_url ? [product.thumbnail_url] : [])].slice(0, 5);
      while (imageUrls.length < 5) imageUrls.push('');
      setProductRegistrationDraft({
        category: product.category ?? (productCategoryOptions[0] ?? '위생/보관'),
        name: product.name ?? '',
        imageUrls,
        description: product.description ?? '',
        price: String(product.price ?? ''),
        stockQty: String(product.stock_qty ?? ''),
        skuCode: product.sku_code ?? '',
      });
      setDesktopProductEditId(product.id);
      setDesktopProductEditorOpen(true);
      setDesktopProductCrudMessage(`수정 모드: ${product.name}`);
    } catch (error) {
      setDesktopProductCrudMessage(error instanceof Error ? error.message : '상품 정보를 불러오지 못했습니다.');
    } finally {
      setDesktopProductCrudBusy(false);
    }
  };
  const resetDesktopProductDraft = () => {
    setDesktopProductEditId(null);
    setDesktopProductEditorOpen(true);
    setDesktopProductCrudMessage('');
    setProductRegistrationDraft(createEmptyProductDraft());
  };
  const closeDesktopProductEditor = () => {
    setDesktopProductEditorOpen(false);
    setDesktopProductEditId(null);
    setDesktopProductCrudMessage('상품 목록 화면으로 돌아왔습니다.');
    setProductRegistrationDraft(createEmptyProductDraft());
  };
  const deleteDesktopProduct = async (productId: number) => {
    setDesktopProductCrudBusy(true);
    setDesktopProductCrudMessage("");
    try {
      await postJson(`/products/${productId}/delete`, { note: 'desktop delete' });
      getJson<SellerProductItem[]>('/seller/products/mine').then(applySellerProducts).catch(() => applySellerProducts([]));
      getJson<ApiProduct[]>('/products').then(applyApiProducts).catch(() => applyApiProducts([]));
      setDesktopProductSelectedIds((prev) => prev.filter((id) => id !== productId));
      if (desktopProductEditId === productId) {
        setDesktopProductEditId(null);
        setDesktopProductEditorOpen(false);
        setProductRegistrationDraft(createEmptyProductDraft());
      }
      setDesktopProductCrudMessage('상품을 삭제했습니다.');
    } catch (error) {
      setDesktopProductCrudMessage(error instanceof Error ? error.message : '상품 삭제에 실패했습니다.');
    } finally {
      setDesktopProductCrudBusy(false);
    }
  };
  const deleteSelectedDesktopProducts = async () => {
    if (!desktopProductSelectedIds.length || desktopProductCrudBusy) return;
    setDesktopProductCrudBusy(true);
    setDesktopProductCrudMessage("");
    try {
      for (const productId of desktopProductSelectedIds) {
        await postJson(`/products/${productId}/delete`, { note: 'desktop bulk delete' });
      }
      getJson<SellerProductItem[]>('/seller/products/mine').then(applySellerProducts).catch(() => applySellerProducts([]));
      getJson<ApiProduct[]>('/products').then(applyApiProducts).catch(() => applyApiProducts([]));
      if (desktopProductEditId && desktopProductSelectedIds.includes(desktopProductEditId)) {
        setDesktopProductEditId(null);
        setDesktopProductEditorOpen(false);
        setProductRegistrationDraft(createEmptyProductDraft());
      }
      setDesktopProductSelectedIds([]);
      setDesktopProductCrudMessage(`선택한 상품 ${desktopProductSelectedIds.length}건을 삭제했습니다.`);
    } catch (error) {
      setDesktopProductCrudMessage(error instanceof Error ? error.message : '선택 상품 삭제에 실패했습니다.');
    } finally {
      setDesktopProductCrudBusy(false);
    }
  };
  const applyDesktopOrderPreset = (preset: "오늘" | "지난7일" | "지난30일" | "전체") => {
    setDesktopOrderDatePreset(preset);
    if (preset === "전체") {
      setDesktopOrderStartDate("");
      setDesktopOrderEndDate("");
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (preset === "오늘" ? 0 : preset === "지난7일" ? 6 : 29));
    setDesktopOrderStartDate(formatDesktopOrderIsoDate(start));
    setDesktopOrderEndDate(formatDesktopOrderIsoDate(end));
  };

  const resetDesktopOrderFilters = () => {
    setDesktopOrderStageFilter("전체");
    setDesktopOrderDatePreset("전체");
    setDesktopOrderStartDate("");
    setDesktopOrderEndDate("");
    setDesktopOrderDeliveryFilter("전체");
    setDesktopOrderSearchField("주문번호");
    setDesktopOrderSearchInput("");
    setDesktopOrderSearchKeyword("");
    setDesktopOrderSelectedNos([]);
  };

  const applyDesktopOrderSearch = () => {
    setDesktopOrderSearchKeyword(desktopOrderSearchInput.trim());
  };

  const renderDesktopEmbeddedBusinessView = () => {
    const businessViewId = desktopPaneContext.businessViewId;
    if (!businessViewId) return null;
    const meta = desktopBusinessViewMeta[businessViewId];
    const recentOrderRows = [...orders].slice().reverse().slice(0, 6);
    const recentThreadRows = threadItems.slice(0, 6);
    const recentSupportRows = communitySeed.slice(0, 6);
    const recentNotificationRows = notificationItems.slice(0, 6);
    const desktopOrderRows = buildDesktopOrderAdminRows(orders, sellerProducts);
    const filteredDesktopOrderRows = desktopOrderRows.filter((item) => {
      const stageMatch = desktopOrderStageFilter === "전체"
        || (desktopOrderStageFilter === "주문접수" ? item.progressStatus.startsWith("주문접수") : item.progressStatus === desktopOrderStageFilter);
      const deliveryMatch = desktopOrderDeliveryFilter === "전체" || item.deliveryStatus === desktopOrderDeliveryFilter;
      const startMatch = !desktopOrderStartDate || item.orderedDateIso >= desktopOrderStartDate;
      const endMatch = !desktopOrderEndDate || item.orderedDateIso <= desktopOrderEndDate;
      const keyword = desktopOrderSearchKeyword.trim().toLowerCase();
      const searchTarget = desktopOrderSearchField === "주문번호" ? item.orderNo : desktopOrderSearchField === "주문자명" ? item.ordererLabel : item.receiverLabel;
      const keywordMatch = !keyword || searchTarget.toLowerCase().includes(keyword);
      return stageMatch && deliveryMatch && startMatch && endMatch && keywordMatch;
    });
    const allDesktopOrderRowsSelected = filteredDesktopOrderRows.length > 0 && filteredDesktopOrderRows.every((item) => desktopOrderSelectedNos.includes(item.orderNo));
    const productStatusSummary = {
      total: sellerProducts.length,
      approved: sellerProducts.filter((item) => item.status === 'approved').length,
      waiting: sellerProducts.filter((item) => item.status !== 'approved').length,
      lowStock: sellerProducts.filter((item) => Number(item.stock_qty ?? 0) > 0 && Number(item.stock_qty ?? 0) <= 5).length,
    };

    if (businessViewId === 'product_crud') {
      const allProductsSelected = sellerProducts.length > 0 && desktopProductSelectedIds.length === sellerProducts.length;
      const editorTitle = desktopProductEditId ? '상품 수정' : '상품 등록';
      const editorDescription = desktopProductEditId
        ? '선택한 상품 정보를 수정할 수 있습니다.'
        : '신규 상품 정보를 입력할 수 있습니다.';
      const currentStatusLabel = desktopProductEditId
        ? sellerProducts.find((item) => item.id === desktopProductEditId)?.status ?? 'draft'
        : 'new';

      const desktopProductOperationCards = isChatEmoticonCategory
        ? [
            { title: '상품 주요 정보', body: `현재 상태: ${currentStatusLabel} · 상품코드: ${productRegistrationDraft.skuCode || '-'} · 카테고리: ${productRegistrationDraft.category || '-'}` },
            { title: '노출 가이드', body: '대표 이미지와 미리보기 이미지는 채팅 내 미리보기/상점 카드에 맞는 정사각형 비율을 권장합니다.' },
            { title: '사용 범위', body: '채팅-이모티콘은 채팅방 이모티콘 전용 상품으로 가정하고 설명, 썸네일, 가격 정보 중심으로 등록합니다.' },
            { title: '판매 운영', body: '임시저장 후 검토 또는 상품등록 시 즉시 공개 흐름을 유지하고, 필요 시 판매중지/교체 이미지를 후속 반영할 수 있습니다.' },
          ]
        : [
            { title: '상품 주요 정보', body: `현재 상태: ${currentStatusLabel} · 상품코드: ${productRegistrationDraft.skuCode || '-'} · 카테고리: ${productRegistrationDraft.category || '-'}` },
            { title: '상품정보제공고시 / 구비서류', body: '카테고리 확정 후 필수 고시정보와 판매 증빙서류 업로드 영역을 연결할 수 있습니다.' },
            { title: '배송', body: '익명포장, 배송비, 출고리드타임 정책을 연결할 수 있습니다.' },
            { title: '반품/교환', body: '반품지, 교환 기준, 고객센터 안내 문구를 연결할 수 있습니다.' },
          ];

      return (
        <div className="desktop-business-shell">
          {!desktopProductEditorOpen ? (
            <header className="desktop-business-header">
              <div>
                <strong>{meta.title}</strong>
                <p>{meta.description}</p>
              </div>
              <div className="desktop-business-chip-row">
                <span className="desktop-business-chip">전체 {productStatusSummary.total}</span>
                <span className="desktop-business-chip">공개중 {productStatusSummary.approved}</span>
                <span className="desktop-business-chip">검토/임시 {productStatusSummary.waiting}</span>
                <span className="desktop-business-chip">재고주의 {productStatusSummary.lowStock}</span>
              </div>
            </header>
          ) : null}

          {!desktopProductEditorOpen ? (
            <section className="desktop-business-card">
              <div className="desktop-business-section-head">
                <div>
                  <h2>상품 목록</h2>
                  <p>첫 화면은 조회 중심으로 유지하고, 상품 등록/상세 수정은 전체 등록 화면으로 전환되도록 변경했습니다.</p>
                </div>
                <div className="copy-action-row desktop-product-toolbar-actions">
                  <button type="button" className="ghost-btn" onClick={resetDesktopProductDraft} disabled={desktopProductCrudBusy}>상품 등록</button>
                  <button type="button" className="ghost-btn danger" onClick={deleteSelectedDesktopProducts} disabled={desktopProductCrudBusy || !desktopProductSelectedIds.length}>선택 삭제</button>
                </div>
              </div>

              {desktopProductCrudMessage ? <p className="muted-mini">{desktopProductCrudMessage}</p> : null}

              <div className="desktop-product-table-wrap">
                <table className="desktop-product-table desktop-product-table-clickable">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={allProductsSelected}
                          onChange={() => setDesktopProductSelectedIds(allProductsSelected ? [] : sellerProducts.map((item) => item.id))}
                          aria-label="전체 상품 선택"
                        />
                      </th>
                      <th>상품명</th>
                      <th>카테고리</th>
                      <th>상태</th>
                      <th>가격</th>
                      <th>재고</th>
                      <th>수정일</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerProducts.length ? sellerProducts.map((item) => {
                      const checked = desktopProductSelectedIds.includes(item.id);
                      return (
                        <tr key={item.id} className={desktopProductEditId === item.id && desktopProductEditorOpen ? 'active' : ''}>
                          <td>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => setDesktopProductSelectedIds((prev) => prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id])}
                              aria-label={`${item.name} 선택`}
                            />
                          </td>
                          <td>
                            <button type="button" className="desktop-product-row-link" onClick={() => loadDesktopProductForEdit(item.id)} disabled={desktopProductCrudBusy}>
                              <strong>{item.name}</strong>
                              <div className="desktop-product-table-sub">{item.sku_code}</div>
                            </button>
                          </td>
                          <td>{item.category}</td>
                          <td>{item.status}</td>
                          <td>₩{item.price.toLocaleString()}</td>
                          <td>{item.stock_qty}</td>
                          <td>{item.updated_at ?? '-'}</td>
                          <td>
                            <div className="desktop-product-table-actions">
                              <button type="button" className="ghost-btn" onClick={() => loadDesktopProductForEdit(item.id)} disabled={desktopProductCrudBusy}>상세/수정</button>
                              <button type="button" className="ghost-btn" onClick={() => submitProductForReview(item.id)} disabled={desktopProductCrudBusy || item.status === 'approved'}>승인대기</button>
                              <button type="button" className="ghost-btn danger" onClick={() => deleteDesktopProduct(item.id)} disabled={desktopProductCrudBusy}>삭제</button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={8} className="desktop-product-table-empty">등록된 상품이 없습니다. 상단의 상품 등록 버튼으로 새 상품을 추가하세요.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {desktopProductEditorOpen ? (
            <section className="desktop-business-card desktop-product-crud-card desktop-product-detail-card">
              <div className="desktop-product-editor-topbar">
                <button type="button" className="ghost-btn desktop-product-back-btn" onClick={closeDesktopProductEditor}>← 뒤로가기</button>
              </div>

              <div className="desktop-business-section-head desktop-business-section-head-editor">
                <div>
                  <h2>{editorTitle}</h2>
                  <p>{editorDescription}</p>
                </div>
                <div className="copy-action-row desktop-product-toolbar-actions">
                  <button type="button" className="ghost-btn" onClick={resetDesktopProductDraft}>신규 작성</button>
                </div>
              </div>

              {desktopProductCrudMessage ? <p className="muted-mini">{desktopProductCrudMessage}</p> : null}

              <div className="desktop-product-manual-strip">
                <span className="desktop-product-manual-chip">상품 등록 필수항목</span>
                <span className="desktop-product-manual-chip">상품등록 매뉴얼 동영상 가이드</span>
                <span className="desktop-product-manual-chip">복사등록</span>
                <span className="desktop-product-manual-chip">카탈로그 매칭하기</span>
                <span className="desktop-product-manual-chip">도움말</span>
              </div>

              <div className="desktop-product-section-grid">
                <article className="desktop-product-section-card">
                  <div className="desktop-product-section-headline">
                    <strong>기본 정보</strong>
                  </div>
                  <div className="desktop-product-form-grid desktop-product-form-grid-detailed desktop-product-form-grid-labelless">
                    <label>
                      <select ref={productCategorySelectRef} value={productRegistrationDraft.category} onChange={(event) => handleProductCategoryChange(event.target.value)}>
                        <option value="">카테고리 선택</option>
                        {productCategoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>
                    <label>
                      <input value={productRegistrationDraft.name} onChange={(event) => handleProductNameChange(event.target.value)} onMouseDown={guardProductCategoryRequiredInteraction} onFocus={guardProductCategoryRequiredInteraction} placeholder="등록상품명 입력" maxLength={29} readOnly={!isProductCategorySelected} aria-disabled={!isProductCategorySelected} />
                    </label>
                    <label className="wide">
                      <textarea value={productRegistrationDraft.description} onChange={(event) => handleProductDescriptionChange(event.target.value)} onMouseDown={guardProductCategoryRequiredInteraction} onFocus={guardProductCategoryRequiredInteraction} rows={6} placeholder="상세설명 입력" readOnly={!isProductCategorySelected} aria-disabled={!isProductCategorySelected} />
                    </label>
                    <label>
                      <div className={`desktop-product-inline-affix${!isProductCategorySelected ? ' disabled' : ''}`}>
                        <input inputMode="numeric" value={productRegistrationDraft.price} onChange={(event) => handleProductPriceChange(event.target.value)} onMouseDown={guardProductCategoryRequiredInteraction} onFocus={guardProductCategoryRequiredInteraction} placeholder="판매가 입력" readOnly={!isProductCategorySelected} aria-disabled={!isProductCategorySelected} />
                        <span>원</span>
                      </div>
                    </label>
                    <label>
                      <input inputMode="numeric" value={productRegistrationDraft.stockQty} onChange={(event) => handleProductStockQtyChange(event.target.value)} onMouseDown={guardProductCategoryRequiredInteraction} onFocus={guardProductCategoryRequiredInteraction} placeholder="재고수량 입력" readOnly={!isProductCategorySelected} aria-disabled={!isProductCategorySelected} />
                    </label>
                    <label className="wide">
                      <input value={productRegistrationDraft.skuCode} onChange={(event) => handleProductSkuCodeChange(event.target.value)} onMouseDown={guardProductCategoryRequiredInteraction} onFocus={guardProductCategoryRequiredInteraction} placeholder="상품코드 SKU 입력" readOnly={!isProductCategorySelected} aria-disabled={!isProductCategorySelected} />
                    </label>
                  </div>
                </article>

                <article className="desktop-product-section-card">
                  <div className="desktop-product-section-headline">
                    <strong>{isChatEmoticonCategory ? '대표 이미지 / 미리보기 이미지' : '대표 이미지 / 추가 이미지'}</strong>
                  </div>
                  <div className="desktop-product-form-grid desktop-product-photo-grid">
                    {productImageInputMeta.map((meta, index) => (
                      <label key={`product-image-${index}`} className={index === 0 ? 'wide' : undefined}>
                        <input
                          value={productRegistrationDraft.imageUrls[index] ?? ''}
                          onChange={(event) => {
                            const next = [...productRegistrationDraft.imageUrls];
                            next[index] = event.target.value;
                            setProductRegistrationDraft((prev) => ({ ...prev, imageUrls: next }));
                          }}
                          placeholder={meta.placeholder}
                          onMouseDown={guardProductCategoryRequiredInteraction}
                          onFocus={guardProductCategoryRequiredInteraction}
                          readOnly={!isProductCategorySelected}
                          aria-disabled={!isProductCategorySelected}
                        />
                      </label>
                    ))}
                  </div>
                </article>

                <article className="desktop-product-section-card">
                  <div className="desktop-product-section-headline">
                    <strong>상품 운영 정보</strong>
                  </div>
                  <div className="desktop-product-support-grid">
                    {desktopProductOperationCards.map((card) => (
                      <article key={card.title} className="desktop-product-mini-card">
                        <strong>{card.title}</strong>
                        <p>{card.body}</p>
                      </article>
                    ))}
                  </div>
                </article>
              </div>

              {!sellerApprovalReady ? <p className="muted-mini">사업자 인증 승인 후 상품 관리가 가능합니다.</p> : null}
              {!productDraftReady ? <p className="muted-mini">카테고리, 등록상품명, 상세 설명, 판매가, 재고수량을 모두 입력해야 저장할 수 있습니다.</p> : null}

              <div className="copy-action-row desktop-product-submit-actions">
                <button type="button" className="ghost-btn" onClick={closeDesktopProductEditor}>취소</button>
                <button type="button" onClick={() => submitProductRegistration('draft')} disabled={!sellerApprovalReady || !productDraftReady || reconsentWriteRestricted || desktopProductCrudBusy}>{desktopProductEditId ? '임시 저장' : '임시 저장'}</button>
                <button type="button" onClick={() => submitProductRegistration('publish')} disabled={!sellerApprovalReady || !productDraftReady || reconsentWriteRestricted || desktopProductCrudBusy}>{desktopProductEditId ? '상품수정' : '상품등록'}</button>
                <button type="button" className="ghost-btn" onClick={openBusinessVerificationTab}>사업자인증 보기</button>
              </div>
            </section>
          ) : null}
        </div>
      );
    }

    if (businessViewId === 'orders') {
      return (
        <div className="desktop-business-shell">
          <header className="desktop-business-header">
            <div>
              <strong>{meta.title}</strong>
              <p>{meta.description}</p>
            </div>
            <div className="desktop-business-chip-row">
              <span className="desktop-business-chip">전체 주문 {desktopOrderRows.length}</span>
              <span className="desktop-business-chip">조회 결과 {filteredDesktopOrderRows.length}</span>
              <span className="desktop-business-chip">선택 {desktopOrderSelectedNos.length}</span>
            </div>
          </header>

          <section className="desktop-business-card desktop-order-stage-card">
            <div className="desktop-order-stage-row">
              {(["전체", "주문접수", "상품준비중", "배송지시", "배송중", "배송완료"] as DesktopOrderProgressFilter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`desktop-order-stage-btn ${desktopOrderStageFilter === item ? 'active' : ''}`}
                  onClick={() => setDesktopOrderStageFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="desktop-business-card desktop-order-filter-card">
            <div className="desktop-business-section-head">
              <div>
                <h2>주문접수 및 배송처리</h2>
                <p>조회/등록/수정/삭제 화면에 등록된 상품과 연결되는 주문 목록을 검색·필터·상태 흐름 기준으로 볼 수 있게 구성했습니다.</p>
              </div>
            </div>

            <div className="desktop-order-filter-grid">
              <div className="desktop-order-filter-line">
                <strong>기간</strong>
                <div className="desktop-order-period-chip-row">
                  {(["오늘", "지난7일", "지난30일"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`desktop-order-period-chip ${desktopOrderDatePreset === item ? 'active' : ''}`}
                      onClick={() => applyDesktopOrderPreset(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <input type="date" value={desktopOrderStartDate} onChange={(event) => { setDesktopOrderDatePreset("사용자지정"); setDesktopOrderStartDate(event.target.value); }} />
                <span className="desktop-order-date-wave">~</span>
                <input type="date" value={desktopOrderEndDate} onChange={(event) => { setDesktopOrderDatePreset("사용자지정"); setDesktopOrderEndDate(event.target.value); }} />
                <div className="copy-action-row">
                  <button type="button" className="ghost-btn" onClick={resetDesktopOrderFilters}>초기화</button>
                  <button type="button" onClick={applyDesktopOrderSearch}>검색</button>
                </div>
              </div>

              <div className="desktop-order-filter-line">
                <strong>배송상태</strong>
                <select value={desktopOrderDeliveryFilter} onChange={(event) => setDesktopOrderDeliveryFilter(event.target.value as DesktopOrderDeliveryFilter)}>
                  {(["전체", "결제완료", "상품준비중", "배송지시", "배송중", "배송완료", "업체 직접 배송"] as DesktopOrderDeliveryFilter[]).map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <div className="desktop-order-filter-line">
                <strong>상세조건</strong>
                <select value={desktopOrderSearchField} onChange={(event) => setDesktopOrderSearchField(event.target.value as DesktopOrderSearchField)}>
                  {(["주문번호", "주문자명", "수취인명"] as DesktopOrderSearchField[]).map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <input value={desktopOrderSearchInput} onChange={(event) => setDesktopOrderSearchInput(event.target.value)} placeholder="검색어 입력" />
              </div>
            </div>

            <div className="desktop-product-table-wrap">
              <table className="desktop-product-table desktop-order-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={allDesktopOrderRowsSelected}
                        onChange={() => setDesktopOrderSelectedNos(allDesktopOrderRowsSelected ? [] : filteredDesktopOrderRows.map((item) => item.orderNo))}
                        aria-label="전체 주문 선택"
                      />
                    </th>
                    <th>주문일시</th>
                    <th>주문번호</th>
                    <th>상품명</th>
                    <th>상품코드</th>
                    <th>주문개수</th>
                    <th>주문자명/아이디</th>
                    <th>수취인/연락처</th>
                    <th>배송지</th>
                    <th>배송상태</th>
                    <th>진행상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDesktopOrderRows.length ? filteredDesktopOrderRows.map((item) => {
                    const checked = desktopOrderSelectedNos.includes(item.orderNo);
                    return (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setDesktopOrderSelectedNos((prev) => prev.includes(item.orderNo) ? prev.filter((orderNo) => orderNo !== item.orderNo) : [...prev, item.orderNo])}
                            aria-label={`${item.orderNo} 선택`}
                          />
                        </td>
                        <td>{item.orderedAt}</td>
                        <td><strong>{item.orderNo}</strong></td>
                        <td>{item.productName}</td>
                        <td>{item.productCode}</td>
                        <td>{item.quantity}</td>
                        <td>{item.ordererLabel}</td>
                        <td>{item.receiverLabel}</td>
                        <td className="desktop-order-address-cell">{item.address}</td>
                        <td><span className={`desktop-order-status-chip desktop-order-status-chip-${item.deliveryStatus === '업체 직접 배송' ? 'direct' : item.deliveryStatus === '배송완료' ? 'done' : item.deliveryStatus === '배송중' ? 'moving' : item.deliveryStatus === '배송지시' ? 'guide' : item.deliveryStatus === '상품준비중' ? 'prepare' : 'paid'}`}>{item.deliveryStatus}</span></td>
                        <td>{item.progressStatus}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={11} className="desktop-product-table-empty">조건에 맞는 주문이 없습니다. 등록 상품 또는 생성된 주문 데이터가 있으면 이곳에 표시됩니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      );
    }

    if (businessViewId === 'settlement') {
      const priceByCode = new Map(sellerProducts.map((item) => [item.sku_code, Number(item.price ?? 0)]));
      const latestSettlementDateIso = desktopOrderRows.length
        ? desktopOrderRows.reduce((latest, item) => item.orderedDateIso > latest ? item.orderedDateIso : latest, desktopOrderRows[0].orderedDateIso)
        : formatDesktopOrderIsoDate(new Date());
      const settlementRangeStartIso = desktopSettlementPeriod === '1년'
        ? shiftDesktopOrderIsoMonth(latestSettlementDateIso, -11)
        : desktopSettlementPeriod === '반기'
          ? shiftDesktopOrderIsoMonth(latestSettlementDateIso, -5)
          : desktopSettlementPeriod === '분기'
            ? shiftDesktopOrderIsoMonth(latestSettlementDateIso, -2)
            : `${latestSettlementDateIso.slice(0, 7)}-01`;
      const settlementRows = desktopOrderRows
        .filter((item) => item.orderedDateIso >= settlementRangeStartIso && item.orderedDateIso <= latestSettlementDateIso)
        .map((item) => {
          const unitPrice = priceByCode.get(item.productCode) ?? 0;
          const salesAmount = unitPrice * item.quantity;
          return {
            ...item,
            salesAmount,
            monthKey: item.orderedDateIso.slice(0, 7),
          };
        })
        .sort((a, b) => b.orderedDateIso.localeCompare(a.orderedDateIso) || b.orderNo.localeCompare(a.orderNo));
      const monthlyTotals = settlementRows.reduce<Record<string, number>>((acc, item) => {
        acc[item.monthKey] = (acc[item.monthKey] ?? 0) + item.salesAmount;
        return acc;
      }, {});
      const monthKeys = Object.keys(monthlyTotals).sort((a, b) => b.localeCompare(a));
      const latestMonthKey = monthKeys[0] ?? latestSettlementDateIso.slice(0, 7);
      const monthSalesTotal = monthlyTotals[latestMonthKey] ?? 0;
      const grossSalesTotal = settlementRows.reduce((sum, item) => sum + item.salesAmount, 0);
      const totalQuantity = settlementRows.reduce((sum, item) => sum + item.quantity, 0);
      const estimatedNetProfit = Math.round(grossSalesTotal * 0.82);

      return (
        <div className="desktop-business-shell">
          <header className="desktop-business-header">
            <div>
              <strong>{meta.title}</strong>
              <p>기간 선택에 따라 월 총 매출과 판매 상세 내역을 동시에 볼 수 있게 구성했습니다.</p>
            </div>
            <div className="desktop-business-chip-row">
              <span className="desktop-business-chip">기준 기간 {desktopSettlementPeriod}</span>
              <span className="desktop-business-chip">판매 건수 {settlementRows.length}</span>
              <span className="desktop-business-chip">판매 수량 {totalQuantity}</span>
            </div>
          </header>

          <section className="desktop-business-card">
            <div className="desktop-business-section-head">
              <div>
                <h2>매출 / 순이익</h2>
                <p>상단 기간 버튼으로 범위를 바꾸면 월 총 매출과 하단 상세 목록이 함께 갱신됩니다.</p>
              </div>
            </div>

            <div className="desktop-settlement-period-row">
              {(['1년', '반기', '분기', '월'] as DesktopSettlementPeriod[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`desktop-settlement-period-btn ${desktopSettlementPeriod === item ? 'active' : ''}`}
                  onClick={() => setDesktopSettlementPeriod(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="desktop-settlement-summary-grid">
              <article className="desktop-settlement-summary-card">
                <span>월 총 매출</span>
                <strong>{formatDesktopSettlementMonthLabel(latestMonthKey)} · ₩{monthSalesTotal.toLocaleString()}</strong>
              </article>
              <article className="desktop-settlement-summary-card">
                <span>선택 기간 총 매출</span>
                <strong>₩{grossSalesTotal.toLocaleString()}</strong>
              </article>
              <article className="desktop-settlement-summary-card">
                <span>선택 기간 순이익</span>
                <strong>₩{estimatedNetProfit.toLocaleString()}</strong>
              </article>
            </div>

            <div className="desktop-settlement-month-strip">
              {monthKeys.length ? monthKeys.map((item) => (
                <span key={item} className={`desktop-settlement-month-chip ${item === latestMonthKey ? 'active' : ''}`}>
                  {formatDesktopSettlementMonthLabel(item)} · ₩{monthlyTotals[item].toLocaleString()}
                </span>
              )) : <span className="desktop-settlement-month-chip">매출 데이터 없음</span>}
            </div>

            <div className="desktop-product-table-wrap">
              <table className="desktop-product-table desktop-settlement-table">
                <thead>
                  <tr>
                    <th>판매날짜</th>
                    <th>상품명</th>
                    <th>상품개수</th>
                    <th>판매매출</th>
                  </tr>
                </thead>
                <tbody>
                  {settlementRows.length ? settlementRows.map((item) => (
                    <tr key={`settlement-${item.id}`}>
                      <td>{item.orderedDateIso}</td>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>₩{item.salesAmount.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="desktop-product-table-empty">표시할 판매 데이터가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      );
    }

    const shippingTableRows = businessViewId === 'shipping' ? buildDesktopShippingAdminRows(desktopOrderRows) : [];
    const genericRows: Array<{ title: string; meta: string; body: string }> = businessViewId === 'shipping'
      ? recentOrderRows.map((item) => ({ title: item.order_no, meta: `${item.status} · 정산 ${item.settlement_status}`, body: `출고 처리 대상 주문 · 결제 ${item.payment_pg}` }))
        : businessViewId === 'returns'
          ? recentOrderRows.map((item) => ({ title: item.order_no, meta: `${item.status} · 정산 ${item.settlement_status}`, body: `취소/반품 검토 대상 주문 · 결제금액 ₩${Number(item.total_amount ?? 0).toLocaleString()}` }))
          : businessViewId === 'reviews'
              ? shopCatalogItems.slice(0, 6).map((item) => ({ title: item.name, meta: `${item.category} · 리뷰 ${item.reviewCount ?? 0}건`, body: item.subtitle }))
              : businessViewId === 'chat'
                ? recentThreadRows.map((item) => ({ title: item.name, meta: `${item.kind} · ${item.time}`, body: item.preview }))
                : businessViewId === 'support'
                  ? recentSupportRows.map((item) => ({ title: item.title, meta: `${item.category} · ${item.meta}`, body: item.summary }))
                  : recentNotificationRows.map((item) => ({ title: item.title, meta: `${item.section} · ${item.postedAt}`, body: item.body }));
    return (
      <div className="desktop-business-shell">
        <header className="desktop-business-header">
          <div>
            <strong>{meta.title}</strong>
            <p>{meta.description}</p>
          </div>
          <div className="desktop-business-chip-row">
            <span className="desktop-business-chip">분류 {meta.section}</span>
            <span className="desktop-business-chip">기본 탭 {meta.fallbackTab}</span>
            <span className="desktop-business-chip">최근 항목 {genericRows.length}</span>
          </div>
        </header>
        <section className="desktop-business-card">
          <div className="desktop-business-section-head">
            <div>
              <h2>{meta.title} 화면</h2>
              <p>{meta.description}</p>
            </div>
          </div>
          <div className="desktop-business-list">
            {genericRows.length ? genericRows.map((item, index) => (
              <article key={`${businessViewId}-${index}`} className="desktop-business-list-row">
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                </div>
                <p>{item.body}</p>
              </article>
            )) : <div className="desktop-business-empty">표시할 최근 데이터가 없습니다.</div>}
          </div>
        </section>
        {businessViewId === 'shipping' ? (
          <section className="desktop-business-card">
            <div className="desktop-business-section-head">
              <div>
                <h2>배송관리 목록</h2>
                <p>주문 기준으로 출고예정일, 배송상태, 지연안내, 택배사, 운송장번호를 한 번에 확인할 수 있도록 하단 목록을 추가했습니다.</p>
              </div>
            </div>
            <div className="desktop-product-table-wrap">
              <table className="desktop-product-table desktop-order-table">
                <thead>
                  <tr>
                    <th>주문일시</th>
                    <th>주문번호</th>
                    <th>주문자명</th>
                    <th>상품명/옵션/수량</th>
                    <th>수취인/연락처/배송지</th>
                    <th>출고예정일</th>
                    <th>배송상태</th>
                    <th>배송지연안내</th>
                    <th>택배사</th>
                    <th>운송장번호</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingTableRows.length ? shippingTableRows.map((item) => (
                    <tr key={item.id}>
                      <td>{item.orderedAt}</td>
                      <td><strong>{item.orderNo}</strong></td>
                      <td>{item.ordererName}</td>
                      <td>{item.productSummary}</td>
                      <td className="desktop-order-address-cell">{item.receiverSummary}</td>
                      <td>{item.expectedShipDate}</td>
                      <td><span className={`desktop-order-status-chip desktop-order-status-chip-${item.deliveryStatus === '업체 직접 배송' ? 'direct' : item.deliveryStatus === '배송완료' ? 'done' : item.deliveryStatus === '배송중' ? 'moving' : item.deliveryStatus === '배송지시' ? 'guide' : item.deliveryStatus === '상품준비중' ? 'prepare' : 'paid'}`}>{item.deliveryStatus}</span></td>
                      <td>{item.delayNotice}</td>
                      <td>{item.courier}</td>
                      <td>{item.trackingNo}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={10} className="desktop-product-table-empty">표시할 배송 데이터가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    );
  };
  if (desktopPaneContext.embedded && desktopPaneContext.businessViewId) { return renderDesktopEmbeddedBusinessView(); }
  if (companyMailMode) {
    return (
      <CompanyMailAdminScreen
        isAdmin={isAdmin}
        onExit={companyMailHostLocked ? undefined : closeCompanyMailPreview}
        onRequestLogin={requestCompanyMailLogin}
        hostLabel={companyMailHostLocked ? `숨김 도메인 접속 · ${companyMailHostLabel}` : `미리보기 경로 · ${companyMailHostLabel}#corp-mail-admin`}
      />
    );
  }

  if (isDesktopSplitHost) {
    return <DesktopSplitShell />;
  }

  return (
    <div className="mobile-app-shell">
      <header className={`top-header${activeTab === "홈" && (((homeTab === "쇼츠" && shortsHeaderHidden) || (homeTab === "피드" && homeFeedHeaderHidden)) || isAnyShortsViewerOpen) ? " shorts-top-header-hidden" : ""}`}>
        {overlayMode === "search" ? (
          <div className={`topbar-search-row ${activeTab === "쇼핑" ? "topbar-search-row-shop" : ""}`}>
            <button
              type="button"
              className="header-inline-btn header-icon-btn topbar-search-back"
              onClick={() => setOverlayMode(null)}
              aria-label="뒤로가기"
              title="뒤로가기"
            >
              <BackArrowIcon />
            </button>
            {activeTab === "쇼핑" ? (
              <button
                type="button"
                className={`header-inline-btn topbar-search-filter-btn${shopSearchFilterPanelOpen ? " active" : ""}`}
                onClick={openShopSearchFilterPanel}
                aria-label={`필터 ${searchFilter}`}
                title={`필터 ${searchFilter}`}
                aria-expanded={shopSearchFilterPanelOpen}
              >
                필터
              </button>
            ) : null}
            <div className="topbar-search-input-wrap">
              <input
                value={globalKeyword}
                onChange={(e) => setGlobalKeyword(e.target.value)}
                placeholder={`${activeTab} 검색어 입력`}
                className="topbar-search-input"
                autoFocus
              />
            </div>
            <div className="topbar-search-trailing">
              <button className="header-inline-btn header-icon-btn header-toolbar-btn active" onClick={() => openOverlay("search")} aria-label={`${activeTab}검색`} title={`${activeTab}검색`}><SearchIcon /></button>
              <button className="header-inline-btn header-icon-btn header-notification-btn header-toolbar-btn" onClick={() => openOverlay("notifications")} aria-label={`${activeTab}알림`} title={`${activeTab}알림`}><BellIcon />{unreadNotificationCount > 0 ? <span className="header-badge">{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}</span> : null}</button>
              <button className="header-inline-btn header-icon-btn header-toolbar-btn" onClick={() => openOverlay("settings")} aria-label={`${activeTab}설정`} title={`${activeTab}설정`}><SettingsIcon /></button>
            </div>
          </div>
        ) : (
          <div className="topbar-row">
            <div className="topbar-side topbar-left">
              <div className="topbar-inline-actions topbar-inline-actions-left">
                <button className={`header-inline-btn header-icon-btn ${overlayMode === "menu" ? "active" : ""}`} onClick={openMenuOverlay} aria-label="메뉴">
                  <MenuIcon />
                </button>
                {visibleHeaderNavItems.map((item) => (
                  <button key={item.label} type="button" className={`header-inline-btn ${item.active ? "active" : ""} ${item.label === "바구니" ? "header-inline-btn-icon-label" : ""}`} onClick={item.onClick} disabled={!item.onClick} aria-label={item.label}>
                    {item.label === "바구니" ? <CartIcon /> : item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="topbar-side topbar-right">
              <div className="topbar-inline-actions topbar-inline-actions-right">
                <div className="topbar-title-inline" aria-live="polite">{currentScreenTitle}</div>
                <button className="header-inline-btn header-icon-btn header-toolbar-btn" onClick={() => openOverlay("search")} aria-label={`${activeTab}검색`} title={`${activeTab}검색`}><SearchIcon /></button>
                <button className={`header-inline-btn header-icon-btn header-notification-btn header-toolbar-btn ${overlayMode === "notifications" ? "active" : ""}`} onClick={() => openOverlay("notifications")} aria-label={`${activeTab}알림`} title={`${activeTab}알림`}><BellIcon />{unreadNotificationCount > 0 ? <span className="header-badge">{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}</span> : null}</button>
                <button className={`header-inline-btn header-icon-btn header-toolbar-btn ${overlayMode === "settings" ? "active" : ""}`} onClick={() => openOverlay("settings")} aria-label={`${activeTab}설정`} title={`${activeTab}설정`}><SettingsIcon /></button>
              </div>
            </div>
          </div>
        )}
      </header>
      {showBaseTabContent && activeTab === "홈" && homeTab === "쇼츠" && !isAnyShortsViewerOpen ? (
        <div className={`shorts-category-strip${shortsCategoryVisible ? " visible" : ""}`}>
          {shortsCategories.map((category) => (
            <button key={category} type="button" className={`shorts-category-chip${selectedShortsCategory === category ? " active" : ""}`} onClick={() => { setSelectedShortsCategory(category); setShortsHeaderHidden(false); setShortsCategoryVisible(true); lastShortsScrollTopRef.current = 0; shortsHideThresholdRef.current = 0; shortsShowThresholdRef.current = 0; }}>{category}</button>
          ))}
        </div>
      ) : null}

      <main className="mobile-main">
        {showBaseTabContent && reconsentRequired ? (
          <section className="reconsent-banner" role="button" tabIndex={0} onClick={() => { setHomeShopConsentGuideSeen(true); setOverlayMode("reconsent_info"); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setHomeShopConsentGuideSeen(true); setOverlayMode("reconsent_info"); } }}>
            <strong>필수 문서 재동의 필요</strong>
            <p>기존 7일 유예 없이 최신 필수 문서를 바로 다시 확인해야 합니다. 클릭하면 재동의 안내와 약관 화면으로 이동합니다.</p>
          </section>
        ) : null}
        {showBaseTabContent && shouldShowHomeShopConsentGuide ? (
          <section className="reconsent-banner" role="button" tabIndex={0} onClick={() => { setHomeShopConsentGuideSeen(true); setOverlayMode("reconsent_info"); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setHomeShopConsentGuideSeen(true); setOverlayMode("reconsent_info"); } }}>
            <strong>홈/쇼핑 최초 진입 전 필수 문서 확인 안내</strong>
            <p>{reconsentRequired ? "재동의가 필요한 계정입니다. 클릭 후 최신 필수 문서를 확인하고 무엇을 해야 하는지 안내를 먼저 보세요." : "최신 이용약관, 개인정보 처리방침, 청소년 보호정책 확인 방법을 보려면 클릭하세요."}</p>
          </section>
        ) : null}
        {showBaseTabContent && releaseReadiness && releaseReadiness.status !== "ready" ? (
          <section className={`status-banner ${releaseReadiness.status === "blocked" ? "warning" : ""}`}>
            <strong>국내 출시 전 법적/운영 보완 필요</strong>
            <span>{releaseReadiness.status === "blocked" ? `출시 차단 ${releaseReadiness.blockers.length}건 · 주의 ${releaseReadiness.warnings.length}건` : `주의 ${releaseReadiness.warnings.length}건`}</span>
            {(releaseReadiness.blockers[0] || releaseReadiness.warnings[0]) ? <span>우선 조치: {(releaseReadiness.blockers[0] || releaseReadiness.warnings[0]).title} — {(releaseReadiness.blockers[0] || releaseReadiness.warnings[0]).action}</span> : null}
          </section>
        ) : null}
        {overlayMode ? (
          <section className={overlayMode === "notifications" ? "stack-gap notification-overlay-body compact-scroll-list notification-overlay-root" : overlayMode === "search" ? `overlay-search-shell${activeTab === "쇼핑" ? " overlay-search-shell-shop" : ""}` : "overlay-card"}>
            {overlayMode !== "search" && overlayMode !== "notifications" ? (
              <div className="overlay-head">
                <strong>{overlayMode === "menu" ? `${activeTab} 메뉴` : overlayMode === "reconsent_info" ? "필수 문서 재동의 안내" : "설정 카테고리"}</strong>
                <button className="ghost-btn" onClick={() => setOverlayMode(null)}>닫기</button>
              </div>
            ) : null}

            {overlayMode === "search" ? (
              <div className={`overlay-body stack-gap contextual-search-pane search-overlay-pane ${activeTab === "쇼핑" ? `search-overlay-pane-shop${shopSearchFilterPanelOpen ? " filter-open" : " filter-closed"}` : ""}`}>
                <div className="search-overlay-header search-overlay-header-list-only" aria-hidden="true"></div>
                {activeTab !== "쇼핑" ? (
                  <div className="search-scope-row">
                    {currentSearchSections.map((item) => (
                      <button
                        key={`search-section-${item}`}
                        type="button"
                        className={`search-scope-btn ${searchSection === item ? "active" : ""}`}
                        onClick={() => setSearchSection(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
                {activeTab === "쇼핑" ? (
                  <div className={`search-toolbar-actions shop-search-toolbar-actions${shopSearchFilterPanelOpen ? " filter-open" : " filter-closed"}`}>
                    {shopSearchFilterPanelOpen ? (
                      <>
                        <span className="shop-search-filter-status">검색범위 {searchFilter} · 가격 {shopSearchPriceMin || "0"}~{shopSearchPriceMax || "∞"} · 색상 {shopSearchColor} · 용도 {shopSearchPurpose}</span>
                        <button className="ghost-btn search-clear-btn" onClick={() => setGlobalKeyword("")}>검색어 초기화</button>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <div className="search-toolbar-actions">
                    <button className="ghost-btn search-clear-btn" onClick={() => setGlobalKeyword("")}>검색어 초기화</button>
                  </div>
                )}
                {activeTab === "쇼핑" && shopSearchFilterPanelOpen ? (
                  <div className="shop-search-filter-inline-panel">
                    <div className="shop-search-filter-inline-head">
                      <strong>쇼핑 검색 필터</strong>
                      <button type="button" className="ghost-btn shop-search-filter-apply-btn" onClick={closeShopSearchFilterPanel}>적용</button>
                    </div>
                    <div className="stack-gap shop-search-filter-body">
                      <div className="legacy-box compact shop-search-filter-box">
                        <strong>가격 설정</strong>
                        <div className="shop-search-price-range-row">
                          <input value={shopSearchPriceMin} onChange={(event) => setShopSearchPriceMin(event.target.value.replace(/[^\d]/g, ""))} placeholder="최소 입력" inputMode="numeric" />
                          <span>~</span>
                          <input value={shopSearchPriceMax} onChange={(event) => setShopSearchPriceMax(event.target.value.replace(/[^\d]/g, ""))} placeholder="최대 입력" inputMode="numeric" />
                        </div>
                      </div>
                      <div className="legacy-box compact shop-search-filter-box">
                        <strong>색상 설정</strong>
                        <div className="shop-search-filter-chip-row">
                          {SHOP_SEARCH_COLOR_OPTIONS.map((option) => (
                            <button key={`shop-color-${option}`} type="button" className={`shop-search-filter-chip ${shopSearchColor === option ? "active" : ""}`} onClick={() => setShopSearchColor(option)}>{option}</button>
                          ))}
                        </div>
                      </div>
                      <div className="legacy-box compact shop-search-filter-box">
                        <strong>용도 설정</strong>
                        <div className="shop-search-filter-chip-row">
                          {SHOP_SEARCH_PURPOSE_OPTIONS.map((option) => (
                            <button key={`shop-purpose-${option}`} type="button" className={`shop-search-filter-chip ${shopSearchPurpose === option ? "active" : ""}`} onClick={() => setShopSearchPurpose(option)}>{option}</button>
                          ))}
                        </div>
                      </div>
                      <div className="copy-action-row">
                        <button type="button" className="ghost-btn" onClick={resetShopSearchFilters}>초기화</button>
                        <button type="button" onClick={closeShopSearchFilterPanel}>필터 적용</button>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className={`context-search-results compact-scroll-list search-results-list ${activeTab === "쇼핑" ? "shop-search-results-list" : ""}`} onScroll={activeTab === "쇼핑" ? handleShopSearchResultsScroll : undefined}>
                  {!globalKeyword.trim() ? <div className="legacy-box compact search-empty-hint-box"><p>검색어를 입력하면 결과가 표시됩니다.</p></div> : null}

                  {activeTab === "홈" && searchSection === "피드결과" ? homeSearchResults.map((item) => (
                    <article key={`home-feed-${item.id}`} className="legacy-box compact search-result-card search-result-list-card">
                      <div className="split-row"><strong>{item.title}</strong><span>{item.author}</span></div>
                      <FeedCaption caption={item.caption} />
                      <span className="community-meta">{item.category}</span>
                    </article>
                  )) : null}
                  {activeTab === "홈" && searchSection === "쇼츠결과" ? homeShortSearchResults.map((item) => (
                    <article key={`home-short-${item.id}`} className="legacy-box compact search-result-card search-result-list-card">
                      <div className="split-row"><strong>{item.title}</strong><span>{item.author}</span></div>
                      <FeedCaption caption={item.caption} />
                      <span className="community-meta">쇼츠 · {(item.views ?? 0).toLocaleString()}회</span>
                    </article>
                  )) : null}
                  {activeTab === "홈" && searchSection === "보관함결과" ? homeSavedSearchResults.map((item) => (
                    <article key={item.id} className="legacy-box compact search-result-card search-result-list-card">
                      <div className="split-row"><strong>{item.title}</strong><span>{item.meta}</span></div>
                      <p>{item.summary}</p>
                    </article>
                  )) : null}

                  {activeTab === "쇼핑" ? visibleShopSearchResults.map((item) => {
                    const rating = (4.1 + ((item.id % 8) * 0.1)).toFixed(1);
                    const inCart = cartItems.some((cartItem) => cartItem.productId === item.id);
                    const colorTag = getProductColorTag(item);
                    const purposeTag = getProductPurposeTag(item);
                    return (
                      <article
                        key={`shop-${item.id}`}
                        className="shop-search-result-row"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setOverlayMode(null);
                          openProductDetail(item.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setOverlayMode(null);
                            openProductDetail(item.id);
                          }
                        }}
                      >
                        <div className="shop-search-result-thumb">
                          {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.name} className="shop-search-result-thumb-image" /> : null}
                          <div className={`shop-search-result-thumb-placeholder hero-tone-${(item.id % 3) + 1}`} />
                        </div>
                        <div className="shop-search-result-copy">
                          <div className="shop-search-result-topline">
                            <span className="shop-search-result-badge">{item.badge}</span>
                            <span className="shop-search-result-category">{item.category} · {colorTag} · {purposeTag}</span>
                          </div>
                          <strong>{item.name}</strong>
                          <p>{item.subtitle}</p>
                          <div className="shop-search-result-meta">
                            <b>{item.price}</b>
                            <span>★ {rating} ({item.reviewCount ?? 0})</span>
                          </div>
                        </div>
                        <div className="shop-search-result-side">
                          <button
                            type="button"
                            className={`shop-search-result-save ${inCart ? "active" : ""}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              addProductToCartFromSearch(item.id);
                            }}
                            aria-label={inCart ? "장바구니 추가" : "장바구니 담기"}
                          >
                            <HeartIcon filled={inCart} />
                          </button>
                        </div>
                      </article>
                    );
                  }) : null}
                  {activeTab === "쇼핑" && globalKeyword.trim() && visibleShopSearchResults.length > 0 && visibleShopSearchResults.length < shopSearchResults.length ? (
                    <div className="feed-loading-row shop-search-loading-row">상품을 더 불러오는 중</div>
                  ) : null}

                  {activeTab === "소통" ? communicationOverlayResults.map((item) => (
                    <article key={`community-${item.id}`} className="legacy-box compact search-result-card search-result-list-card">
                      <div className="split-row"><strong>{item.title}</strong><span>{item.category}</span></div>
                      <p>{item.summary}</p>
                      <span className="community-meta">{item.meta}</span>
                    </article>
                  )) : null}

                  {activeTab === "채팅" && searchSection === "채팅" ? chatSearchResults.map((item) => (
                    <article key={`chat-${item.id}`} className="legacy-box compact search-result-card search-result-list-card">
                      <div className="split-row"><strong>{item.name}</strong><span>{item.kind}</span></div>
                      <p>{item.preview}</p>
                      <span className="community-meta">{item.purpose} · {item.time}</span>
                    </article>
                  )) : null}
                  {activeTab === "채팅" && searchSection === "질문" ? questionSearchResults.map((item) => (
                    <article key={`question-${item.id}`} className="legacy-box compact search-result-card search-result-list-card">
                      <div className="split-row"><strong>{item.author}</strong><span>{item.meta}</span></div>
                      <p>Q. {item.question}</p>
                      <span className="community-meta">답변 {item.answer}</span>
                    </article>
                  )) : null}

                  {activeTab === "프로필" ? profileSearchResults.map((item) => (
                    <article key={`profile-${item.id}`} className="legacy-box compact search-result-card search-result-list-card">
                      <div className="split-row"><strong>{item.author}</strong><span>{item.category}</span></div>
                      <p>{item.title} · {item.caption}</p>
                    </article>
                  )) : null}

                  {globalKeyword.trim() && ((activeTab === "홈" && ((searchSection === "피드결과" && homeSearchResults.length === 0) || (searchSection === "쇼츠결과" && homeShortSearchResults.length === 0) || (searchSection === "보관함결과" && homeSavedSearchResults.length === 0))) || (activeTab === "쇼핑" && shopSearchResults.length === 0) || (activeTab === "소통" && communicationOverlayResults.length === 0) || (activeTab === "채팅" && ((searchSection === "채팅" && chatSearchResults.length === 0) || (searchSection === "질문" && questionSearchResults.length === 0))) || (activeTab === "프로필" && profileSearchResults.length === 0)) ? (
                    <div className="legacy-box compact"><p>연관 검색 결과가 없습니다.</p></div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {overlayMode === "notifications" ? (
              <>
                {notificationView.view === "list" ? (
                  notificationSectionOrder.map((sectionKey) => {
                    const items = notificationSections[sectionKey];
                    return (
                      <section key={sectionKey} className="notification-section-card notification-summary-card">
                        <div className="notification-section-head notification-summary-head">
                          <strong>{notificationSectionMeta[sectionKey].title}</strong>
                          <button type="button" className="ghost-btn notification-more-btn" onClick={() => openNotificationSection(sectionKey)}>더보기</button>
                        </div>
                        <div className="notification-summary-list">
                          {items.slice(0, 3).map((item) => (
                            <button key={item.id} type="button" className={`notification-summary-row ${item.unread ? "unread" : ""}`} onClick={() => openNotificationDetail(sectionKey, item)}>
                              <span className={`notification-chip ${getNotificationChipTone(sectionKey)}`}>{item.category}</span>
                              <strong>{item.title}</strong>
                              <span>{item.postedAt}</span>
                            </button>
                          ))}
                        </div>
                      </section>
                    );
                  })
                ) : null}

                {overlayMode === "notifications" && notificationView.view === "section" && notificationView.section ? (
                  <section className="notification-section-card notification-detail-shell notification-section-shell">
                    <div className="notification-detail-head">
                      <button type="button" className="header-inline-btn header-icon-btn topbar-search-back" onClick={() => setNotificationView({ view: "list", section: null, item: null })} aria-label="뒤로가기"><BackArrowIcon /></button>
                      <strong>{notificationSectionMeta[notificationView.section].title}</strong>
                    </div>
                    <div className="notification-summary-list notification-summary-list-all notification-section-list-pane">
                      {visibleNotificationSectionItems.map((item) => (
                        <button key={item.id} type="button" className={`notification-summary-row ${item.unread ? "unread" : ""}`} onClick={() => openNotificationDetail(notificationView.section!, item)}>
                          <span className={`notification-chip ${getNotificationChipTone(notificationView.section)}`}>{item.category}</span>
                          <strong>{item.title}</strong>
                          <span>{item.postedAt}</span>
                        </button>
                      ))}
                    </div>
                    <div className="community-simple-pagination notification-section-pagination">
                      <button type="button" className="ghost-btn" onClick={() => setNotificationSectionPage((prev) => Math.max(1, prev - 1))} disabled={notificationSectionPage <= 1}>이전</button>
                      <span>{notificationSectionPage} / {notificationSectionTotalPages}</span>
                      <button type="button" className="ghost-btn" onClick={() => setNotificationSectionPage((prev) => Math.min(notificationSectionTotalPages, prev + 1))} disabled={notificationSectionPage >= notificationSectionTotalPages}>다음</button>
                    </div>
                  </section>
                ) : null}

                {overlayMode === "notifications" && notificationView.view === "detail" && notificationView.item ? (
                  <section className="notification-section-card notification-detail-shell notification-article-shell">
                    <div className="notification-detail-head notification-detail-head-article">
                      <button type="button" className="header-inline-btn header-icon-btn topbar-search-back" onClick={() => setNotificationView({ view: notificationView.section ? "section" : "list", section: notificationView.section, item: null })} aria-label="뒤로가기"><BackArrowIcon /></button>
                    </div>
                    <div className="notification-article-meta-row">
                      <div className="notification-article-title-wrap">
                        <span className={`notification-chip ${getNotificationChipTone(notificationView.section)}`}>{notificationView.item.category}</span>
                        <strong>{notificationView.item.title}</strong>
                      </div>
                      <div className="notification-article-side-meta">
                        <span>{notificationDetailAuthor}</span>
                        <span>{notificationView.item.postedAt}</span>
                      </div>
                    </div>
                    <div className="legacy-box compact notification-detail-card notification-article-content">
                      <p>{notificationView.item.body}</p>
                    </div>
                  </section>
                ) : null}
              </>
            ) : null}

            {overlayMode === "menu" ? (
              <div className="stack-gap">
                <div className="legacy-box compact">
                  <div className="split-row"><h3>상단바 즐겨찾기</h3><button type="button" className="ghost-btn" onClick={resetHeaderFavorites}>기본값</button></div>
                  <p>{activeTab} 화면 상단바에 고정할 버튼을 선택합니다. 선택한 버튼만 상단에 우선 노출됩니다.</p>
                  <div className="copy-action-row wrap-row">
                    {(headerFavorites[activeTab] ?? []).map((label) => (
                      <button key={`fav-${label}`} type="button" className="header-inline-btn active" onClick={() => toggleHeaderFavorite(label)}>{label} ×</button>
                    ))}
                  </div>
                  <div className="copy-action-row wrap-row">
                    {favoriteCandidates.map((label) => {
                      const selected = (headerFavorites[activeTab] ?? []).includes(label);
                      return (
                        <button key={`candidate-${label}`} type="button" className={selected ? "" : "ghost-btn"} onClick={() => toggleHeaderFavorite(label)}>
                          {selected ? `${label} 제거` : `${label} 추가`}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="menu-overlay-list">
                  {currentMenuItems.map((item) => (
                    <button key={item.label} type="button" className="settings-category-btn menu-overlay-btn" onClick={item.onClick}>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
                {activeTab === "홈" ? (
                  <div className="legacy-box compact">
                    <h3>보관함</h3>
                    <p>피드와 상품에서 보관함 버튼을 눌러 저장한 항목을 한곳에서 확인할 수 있습니다.</p>
                    <div className="simple-list-row"><b>저장된 피드</b><span>{savedFeedIds.length}개</span></div>
                    <div className="simple-list-row"><b>저장된 상품</b><span>{savedProductIds.length}개</span></div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {overlayMode === "reconsent_info" ? (
              <div className="stack-gap compact-scroll-list">
                <section className="notification-section-card">
                  <div className="notification-section-head">
                    <div><strong>필수 문서 재동의 안내</strong><p>홈 또는 쇼핑에 처음 들어오면 최신 필수 문서를 다시 확인해야 하는지 먼저 확인합니다.</p></div>
                  </div>
                  <div className="notification-list">
                    <article className="notification-item unread">
                      <div className="notification-item-copy">
                        <div className="notification-item-topline"><span className="notification-chip">안내</span><span>{reconsentRequired ? "즉시 재동의 필요" : "최신 문서 확인 권장"}</span></div>
                        <strong>{reconsentRequired ? "유예기간 없이 최신 필수 문서 재동의가 필요합니다." : "최신 약관·처리방침·청소년 보호정책을 확인해 주세요."}</strong>
                        <p>{reconsentRequired ? "현재 계정은 기존 7일 유예 없이 최신 버전 기준으로 즉시 재동의 상태가 적용됩니다. 재동의를 완료하기 전에는 글쓰기, 채팅, 주문, 문의, 프로필 수정 같은 쓰기 기능이 제한될 수 있습니다." : "회원가입 직후 홈/쇼핑 진입 시 최신 필수 문서를 먼저 확인하고, 변경 공지가 있을 때는 재동의 필요 여부를 여기에서 확인합니다."}</p>
                      </div>
                    </article>
                  </div>
                </section>
                <section className="notification-section-card">
                  <div className="notification-section-head">
                    <div><strong>무엇을 해야 하나요?</strong><p>아래 순서대로 진행하면 됩니다.</p></div>
                  </div>
                  <div className="consent-record-list">
                    <div className="simple-list-row multi-line"><div><b>1단계</b><span>이용약관, 개인정보 처리방침, 청소년 보호정책의 최신 버전을 열어 확인합니다.</span></div></div>
                    <div className="simple-list-row multi-line"><div><b>2단계</b><span>문서가 변경되었고 재동의가 필요하다고 표시되면 최신 버전 기준으로 다시 동의합니다.</span></div></div>
                    <div className="simple-list-row multi-line"><div><b>3단계</b><span>재동의 완료 후 홈, 쇼핑, 주문, 채팅, 문의, 프로필 수정 같은 기능을 계속 진행합니다.</span></div></div>
                    <div className="simple-list-row multi-line"><div><b>관리자 예외</b><span>관리자 계정은 테스트를 위해 성인인증, 필수문서 동의, 사업자인증 없이도 상품등록이 가능합니다.</span></div></div>
                  </div>
                </section>
                <section className="notification-section-card">
                  <div className="notification-section-head">
                    <div><strong>필수 문서 바로가기</strong><p>문서를 열어 최신 버전을 확인합니다.</p></div>
                  </div>
                  <div className="notification-policy-links">
                    <a className="ghost-link-btn" href={`${getApiBase()}/legal/terms-of-service`} target="_blank" rel="noreferrer">이용약관</a>
                    <a className="ghost-link-btn" href={`${getApiBase()}/legal/privacy-policy`} target="_blank" rel="noreferrer">개인정보 처리방침</a>
                    <a className="ghost-link-btn" href={`${getApiBase()}/legal/youth-policy`} target="_blank" rel="noreferrer">청소년 보호정책</a>
                    <a className="ghost-link-btn" href={`${getApiBase()}/legal/refund-policy`} target="_blank" rel="noreferrer">환불정책</a>
                  </div>
                  <div className="legacy-box compact">
                    <h3>현재 동의 상태</h3>
                    <p>{reconsentRequired ? "재동의 필요 상태" : "최신 버전 동의 상태"}</p>
                    <p>적용 방식: {reconsentMode === "login_block" ? "로그인 전 재동의" : "즉시 쓰기 기능 제한"}</p>
                    <p>유예기간: {authSummary?.consent_status?.grace_period_days ?? 0}일</p>
                  </div>
                </section>
                <div className="copy-action-row">
                  <button type="button" onClick={() => { setHomeShopConsentGuideSeen(true); setOverlayMode(null); }}>확인 완료</button>
                  <button type="button" className="ghost-btn" onClick={() => { setOverlayMode("settings"); setSettingsCategory("일반"); }}>설정으로 이동</button>
                </div>
              </div>
            ) : null}

            {overlayMode === "settings" ? (
              <div className="stack-gap">
                <div className="settings-category-nav">
                  <div className="settings-top-tab-row" aria-label="설정 상단 카테고리">
                    {mobileTabs.map((tab) => <button key={`settings-nav-${tab}`} type="button" className={`settings-top-tab-chip ${activeTab === tab ? "active" : ""}`} onClick={() => { setActiveTab(tab); setSettingsCategory("일반"); }}>{tab}</button>)}
                  </div>
                  <button type="button" className="settings-category-btn settings-logout-btn" onClick={handleLogout}>
                    <span>로그아웃</span>
                  </button>
                  {canToggleAccountMode ? (
                    <button type="button" className="settings-category-btn settings-account-toggle-btn" onClick={handleAccountModeToggle}>
                      <span>{accountModeToggleLabel}</span>
                    </button>
                  ) : (
                    <button type="button" className="settings-category-btn settings-account-toggle-btn">
                      <span>계정전환</span>
                    </button>
                  )}
                  {isAdmin ? (
                    <button type="button" className={`settings-category-btn settings-admin-mode-entry ${settingsCategory === "관리자모드" ? "active" : ""}`} onClick={() => { setSettingsCategory("관리자모드"); setAdminModeTab("계정관리"); }}>
                      <span>관리자모드</span>
                      <b>ADMIN</b>
                    </button>
                  ) : null}
                  <div className="settings-individual-title">하단바별 개별설정</div>
                  {activeTab === "프로필" ? (
                    <button type="button" className={`settings-category-btn ${settingsCategory === "계정설정" ? "active" : ""}`} onClick={() => setSettingsCategory("계정설정")}>
                      <span>계정설정</span>
                    </button>
                  ) : null}
                  {settingsNavItems.filter((item) => item !== "관리자모드").map((item) => {
                    const isHtmlToggle = item === "HTML요소";
                    return (
                      <button
                        key={item}
                        className={`settings-category-btn ${settingsCategory === item ? "active" : ""} ${isHtmlToggle && htmlInspectorEnabled ? "inspector-on" : ""}`}
                        onClick={() => {
                          setSettingsCategory(item);
                          if (isHtmlToggle) setHtmlInspectorEnabled((prev) => !prev);
                        }}
                      >
                        <span>{item}</span>
                        {isHtmlToggle ? <b>{htmlInspectorEnabled ? "ON" : "OFF"}</b> : null}
                      </button>
                    );
                  })}
                </div>
                <SettingSection
                  category={settingsCategory}
                  isAdmin={isAdmin}
                  legacySection={legacySection}
                  setLegacySection={setLegacySection}
                  projectStatus={projectStatus}
                  deployGuide={deployGuide}
                  legalDocuments={legalDocuments}
                  adminLegalDocuments={adminLegalDocuments}
                  refreshAdminLegalDocuments={refreshAdminLegalDocuments}
                  authSummary={authSummary}
                  businessInfo={businessInfo}
                  releaseReadiness={releaseReadiness}
                  paymentProviderStatus={paymentProviderStatus}
                  minorPurgePreview={minorPurgePreview}
                  currentUserRole={currentUserRole}
                  adminModeTab={adminModeTab}
                  setAdminModeTab={setAdminModeTab}
                  adminDbManage={adminDbManage}
                  sellerApprovalQueue={sellerApprovalQueue}
                  productApprovalQueue={productApprovalQueue}
                  settlementPreview={settlementPreview}
                  htmlInspectorEnabled={htmlInspectorEnabled}
                  setHtmlInspectorEnabled={setHtmlInspectorEnabled}
                  adminDecideSeller={adminDecideSeller}
                  adminDecideProduct={adminDecideProduct}
                  accountPrivate={accountPrivate}
                  setAccountPrivate={setAccountPrivate}
                  profileFeedPublic={profileFeedPublic}
                  setProfileFeedPublic={setProfileFeedPublic}
                  profileShortsPublic={profileShortsPublic}
                  setProfileShortsPublic={setProfileShortsPublic}
                  profileQuestionPublic={profileQuestionPublic}
                  setProfileQuestionPublic={setProfileQuestionPublic}
                  profileTagPublic={profileTagPublic}
                  setProfileTagPublic={setProfileTagPublic}
                  profileProductPublic={profileProductPublic}
                  setProfileProductPublic={setProfileProductPublic}
                />
                {isAdmin ? (
                  <div className="legacy-box compact company-mail-admin-shortcut">
                    <div className="split-row">
                      <div>
                        <h3>회사메일 숨김 화면</h3>
                        <p>관리자 계정만 열 수 있는 내부 메일 화면 미리보기입니다.</p>
                      </div>
                      <button type="button" onClick={openCompanyMailPreview}>열기</button>
                    </div>
                    <p className="muted-mini">미리보기 경로: <code>#corp-mail-admin</code> · 실제 숨김 도메인은 추후 별도 연결</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {showBaseTabContent && !blockedByIdentity && requiresAdultGate ? (
          <section className="tab-pane fill-pane adult-gate-pane">
            <div className="adult-gate-card stack-gap compact-scroll-list">
              <div className="section-head compact-head">
                <div><h2>성인 인증 필요</h2><p>{activeTab} 화면은 최초 1회 성인 인증 완료 후 지속 이용 가능하도록 설계했습니다. 홈 또는 쇼핑 중 하나에서 인증이 완료되면 두 화면 모두 접근 가능합니다.</p></div>
              </div>
              <div className="legacy-grid three auth-option-grid signup-auth-option-grid">
                <div className="legacy-box compact"><h3>성인 인증 안내</h3><p>회원가입 시 PASS/휴대폰 본인확인 완료 후 계정을 생성하고, 성인 회원은 홈 또는 쇼핑 최초 접근 시 1회 추가 성인인증을 진행합니다. 카카오는 로그인 편의 수단으로만 사용합니다.</p><button type="button" className="ghost-btn" onClick={() => setAdultPromptOpen(true)}>성인인증 필요 모달 보기</button></div>
                <div className="legacy-box compact"><h3>PASS/휴대폰 본인확인 시작</h3><p>실서비스에서는 외부 본인인증 SDK를 호출하고, 현재 데모에서는 흐름만 검증합니다.</p><div className="copy-action-row"><button type="button" onClick={() => attemptAdultVerification("success")}>PASS/휴대폰 인증 성공</button><button type="button" className="ghost-btn" onClick={() => attemptAdultVerification("fail")}>인증 실패</button></div></div>
                <div className="legacy-box compact"><h3>차단 / 재시도 상태</h3><p>실패 {adultFailCount}회 · {adultCooldownRemainMinutes > 0 ? `${adultCooldownRemainMinutes}분 후 재시도 가능` : "현재 재시도 가능"}</p><button type="button" className="ghost-btn" onClick={() => attemptAdultVerification("minor")}>미성년 차단 화면 확인</button></div>
              </div>
              <div className="legacy-box compact auth-summary-box">
                <h3>{adultGateView === "success" ? "인증 완료 화면" : adultGateView === "minor" ? "미성년자 차단 화면" : adultGateView === "failed" ? "인증 실패 / 재시도 화면" : "성인 인증 안내 화면"}</h3>
                {adultGateView === "success" ? <p>성인 인증이 완료되었습니다. 이제 홈과 쇼핑 모두 지속적으로 접근할 수 있습니다.</p> : null}
                {adultGateView === "minor" ? <p>청소년 판정 계정은 로그인 및 서비스 접속이 차단됩니다. 최소 식별값과 차단 이력만 분쟁 대응 범위에서 일정 기간 보관합니다. 본인확인 결과에 따라 이용이 제한될 수 있습니다.</p> : null}
                {adultGateView === "failed" ? <p>성인 인증에 실패했습니다. 1시간 이내 최대 5회 재시도 가능하며, 기준 횟수 초과 시 1시간 단위 쿨타임을 적용합니다.</p> : null}
                {adultGateView === "intro" ? <p>현재 로그인 수단은 {demoLoginProvider}이며, 성인 기능 접근 시 1회 추가 PASS/휴대폰 본인확인을 진행하는 구조입니다.</p> : null}
              </div>
            </div>
          </section>
        ) : null}

        {showAppTabContent && activeTab === "홈" ? (
          <section className={`tab-pane fill-pane home-feed-pane${homeTab === "쇼츠" ? " home-feed-pane-shorts" : ""}${homeTab === "피드" ? " home-feed-pane-feed-scroll" : ""}${homeTab === "피드" && homeFeedHeaderHidden ? " home-feed-pane-feed-scroll-collapsed" : ""}`}>
            {homeTab === "피드" ? (
              <>
                <div className={`chat-toolbar kakao-toolbar compact-only-toolbar feed-compose-launch-toolbar${homeFeedHeaderHidden ? " feed-compose-launch-toolbar-hidden" : ""}`}>
                  <div className="feed-filter-tabs" role="tablist" aria-label="피드 보기 필터">
                    {(["일반", "추천", "팔로잉"] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        className={`feed-filter-tab ${homeFeedFilter === filter ? "active" : ""}`}
                        onClick={() => setHomeFeedFilter(filter)}
                        role="tab"
                        aria-selected={homeFeedFilter === filter}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={`feed-refresh-slot${homeFeedRefreshing ? " refreshing" : ""}${homeFeedPullDistance >= HOME_FEED_PULL_TRIGGER ? " armed" : ""}`} style={homeFeedRefreshing ? undefined : { height: homeFeedPullDistance ? `${homeFeedPullDistance}px` : "0px" }}>
                  <div className="feed-refresh-indicator" aria-live="polite">
                    <span className="feed-refresh-spinner" aria-hidden="true" />
                    <span>{homeFeedRefreshing ? "새 피드를 불러오는 중" : homeFeedPullDistance >= HOME_FEED_PULL_TRIGGER ? "놓으면 새 피드를 불러옵니다" : "당겨서 새 피드 보기"}</span>
                  </div>
                </div>
                <div
                  ref={homeFeedScrollRef}
                  className={`feed-post-list compact-scroll-list feed-post-list-stream${homeFeedHeaderHidden ? " feed-post-list-stream-collapsed" : ""}`}
                  onScroll={handleHomeFeedScroll}
                  onTouchStart={handleHomeFeedPullStart}
                  onTouchMove={handleHomeFeedPullMove}
                  onTouchEnd={handleHomeFeedPullEnd}
                  onTouchCancel={handleHomeFeedPullEnd}
                >
                  {homeFeedSource.map((item) => (
                    <div key={`feed-wrap-${item.id}`} className="feed-stream-item">
                      <FeedPoster
                        item={item}
                        onAsk={openAskFromFeed}
                        saved={savedFeedIds.includes(item.id)}
                        liked={likedFeedIds.includes(item.id)}
                        reposted={repostedFeedIds.includes(item.id)}
                        commentsOpen={openFeedCommentItem?.id === item.id}
                        commentCount={feedCommentMap[item.id]?.length ?? item.comments}
                        onOpenComments={openFeedComments}
                        onToggleLike={toggleLikedFeed}
                        onToggleRepost={toggleRepostedFeed}
                        onToggleSave={toggleSavedFeed}
                        onShare={shareFeedItem}
                        keywordTags={getContentKeywordTags(item)}
                        onOpenAuthorProfile={openProfileFromAuthor}
                        onPreviewAuthorAvatar={openFeedAvatarPreview}
                        following={followedFeedAuthors.includes(item.author)}
                        onToggleFollow={toggleFollowedFeedAuthor}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : homeTab === "쇼츠" ? (
              <>
                <div className="creator-launch-strip creator-launch-strip-shorts">
                  <div>
                    <strong>쇼츠 업로드</strong>
                    <span>즐겨찾기 영역 위에서 바로 쇼츠 영상을 선택할 수 있습니다.</span>
                  </div>
                  <label className="creator-launch-btn">
                    쇼츠 올리기
                    <input type="file" accept="video/*" hidden onChange={(event) => { const fileName = event.target.files?.[0]?.name; if (fileName) window.alert(`쇼츠 업로드 준비: ${fileName}`); event.currentTarget.value = ""; }} />
                  </label>
                </div>
                <div className="shorts-list-wrap compact-scroll-list" onScroll={handleShortsScroll}>
                  {pagedShorts.length ? pagedShorts.map((item) => (
                    <ShortsListCard
                      key={`short-${item.id}`}
                      item={item}
                      onOpenMore={setShortsMoreItem}
                      onOpenViewer={openShortsViewer}
                    />
                  )) : <div className="legacy-box compact"><p>표시할 쇼츠가 없습니다.</p></div>}
                  {pagedShorts.length < shortsFeedItems.length ? <div className="shorts-loading-row">쇼츠 10개 단위로 추가 로딩 중</div> : null}
                </div>
                {shortsViewerItemId !== null ? (
                  <ShortsViewer
                    items={shortsFeedItems}
                    initialIndex={shortsViewerInitialIndex}
                    onClose={() => setShortsViewerItemId(null)}
                    onOpenMore={setShortsMoreItem}
                    getKeywordTags={getContentKeywordTags}
                    onOpenAuthorProfile={openProfileFromAuthor}
                    onPreviewAuthorAvatar={openFeedAvatarPreview}
                    followedAuthors={followedFeedAuthors}
                    onToggleFollow={toggleFollowedFeedAuthor}
                  />
                ) : null}
              </>
            ) : homeTab === "스토리" ? (
              <div className="story-home-pane compact-scroll-list">
                <div className="story-horizontal-section">
                  <div className="story-section-head">
                    <strong>스토리</strong>
                    
                  </div>
                  <div className="story-card-list story-card-list-horizontal" role="list" aria-label="스토리 가로 목록">
                    {allStoryItems.slice(0, 16).map((author, index) => (
                      <button key={`story-${author.id}`} type="button" className="story-card story-card-horizontal" onClick={() => setActiveStoryViewer(author)} role="listitem">
                        <div className={`story-avatar-ring ${author.avatarUrl ? "has-image" : "anonymous-profile-icon"}`}>
                          <span>{author.avatarUrl ? <img src={author.avatarUrl} alt="" loading="lazy" /> : null}</span>
                        </div>
                        <div className="story-card-copy">
                          <strong>{author.name}</strong>
                          <span>{author.postedAt ?? (index < 3 ? "방금 전 새 스토리" : `${index + 1}시간 전`)}</span>
                          <p>{author.caption ?? `${author.role} 계정의 24시간 스토리 미리보기입니다.`}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="maptory-panel story-integrated-maptory">
                  <div className="story-section-head">
                    <strong>맵토리</strong>
                    
                  </div>
                  <div className="maptory-map">
                    <div className="maptory-radar-core">내 주변</div>
                    {allStoryItems.filter((item) => item.mapEnabled !== false).slice(0, 4).map((author, index) => {
                      const locationLabel = `서울 ${index === 0 ? "강서구" : index === 1 ? "마포구" : index === 2 ? "영등포구" : "양천구"}`;
                      const locationVisible = activeMaptoryLocationId === author.id;
                      return (
                        <button
                          key={`maptory-${author.id}`}
                          type="button"
                          className={`maptory-profile-pin maptory-profile-pin-${index + 1} ${locationVisible ? "location-visible" : ""}`}
                          onMouseEnter={() => setActiveMaptoryLocationId(author.id)}
                          onFocus={() => setActiveMaptoryLocationId(author.id)}
                          onClick={() => {
                            if (activeMaptoryLocationId === author.id) {
                              setActiveStoryViewer(author);
                              return;
                            }
                            setActiveMaptoryLocationId(author.id);
                          }}
                          aria-label={`${author.name} 맵토리 위치 보기`}
                        >
                          <span className={`maptory-profile-avatar ${author.avatarUrl ? "has-image" : "anonymous-profile-icon"}`}>{author.avatarUrl ? <img src={author.avatarUrl} alt="" loading="lazy" /> : null}</span>
                          <span className="maptory-speech">{locationLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="saved-home-pane home-feed-pane home-feed-pane-feed-scroll">

                <div className="chat-toolbar kakao-toolbar compact-only-toolbar feed-compose-launch-toolbar saved-home-favorites-toolbar">
                  <div className="chat-category-scroll" role="tablist" aria-label="보관함 보기 필터">
                    {["피드", "쇼츠"].map((tab) => (
                      <button key={tab} type="button" className={`category-chip ${savedTab === tab ? "active" : ""}`} onClick={() => setSavedTab(tab as "피드" | "쇼츠")} role="tab" aria-selected={savedTab === tab}>{tab}</button>
                    ))}
                  </div>
                </div>
                {savedTab === "피드" ? (
                  <div className="feed-post-list compact-scroll-list feed-post-list-stream saved-home-feed-list">
                    {savedFeedItems.length ? savedFeedItems.map((item) => (
                      <div key={`saved-feed-wrap-${item.id}`} className="feed-stream-item">
                        <FeedPoster item={item} onAsk={openAskFromFeed} saved={true} liked={likedFeedIds.includes(item.id)} reposted={repostedFeedIds.includes(item.id)} commentsOpen={openFeedCommentItem?.id === item.id} commentCount={feedCommentMap[item.id]?.length ?? item.comments} onOpenComments={openFeedComments} onToggleLike={toggleLikedFeed} onToggleRepost={toggleRepostedFeed} onToggleSave={toggleSavedFeed} onShare={shareFeedItem} keywordTags={getContentKeywordTags(item)} onOpenAuthorProfile={openProfileFromAuthor} onPreviewAuthorAvatar={openFeedAvatarPreview} following={followedFeedAuthors.includes(item.author)} onToggleFollow={toggleFollowedFeedAuthor} />
                      </div>
                    )) : <div className="legacy-box compact saved-home-empty-box"><p>보관한 피드가 없습니다.</p></div>}
                  </div>
                ) : (
                  <>
                    <div className="shorts-list-wrap compact-scroll-list saved-home-shorts-list" onScroll={handleShortsScroll}>
                      {savedShortItems.length ? savedShortItems.map((item) => (
                        <ShortsListCard
                          key={`saved-short-${item.id}`}
                          item={item}
                          onOpenMore={setShortsMoreItem}
                          onOpenViewer={(target) => setSavedShortsViewerItemId(target.id)}
                        />
                      )) : <div className="legacy-box compact saved-home-empty-box"><p>보관한 쇼츠가 없습니다.</p></div>}
                    </div>
                    {savedShortsViewerItemId !== null ? (
                      <ShortsViewer
                        items={savedShortItems}
                        initialIndex={savedShortsViewerInitialIndex}
                        onClose={() => setSavedShortsViewerItemId(null)}
                        onOpenMore={setShortsMoreItem}
                        getKeywordTags={getContentKeywordTags}
                        onOpenAuthorProfile={openProfileFromAuthor}
                        onPreviewAuthorAvatar={openFeedAvatarPreview}
                        followedAuthors={followedFeedAuthors}
                        onToggleFollow={toggleFollowedFeedAuthor}
                      />
                    ) : null}
                  </>
                )}
              </div>
            )}
          </section>
        ) : null}

        {showAppTabContent && activeTab === "쇼핑" ? (
          <section className={shoppingTab === "홈" ? "compact-scroll-list shop-home-feed-pane shop-home-pane-root" : "tab-pane fill-pane"}>
            {shoppingTab === "홈" ? (
              <div className="shop-home-home-shell">
                <div className="shop-home-top-stack">
                  <div
                  className="shop-home-hero-carousel"
                  aria-label="쇼핑 홈 배너"
                  onPointerDown={handleShopHomeBannerPointerDown}
                  onPointerMove={handleShopHomeBannerPointerMove}
                  onPointerUp={finishShopHomeBannerDrag}
                  onPointerCancel={finishShopHomeBannerDrag}
                  onPointerLeave={finishShopHomeBannerDrag}
                >
                  <div className="shop-home-hero-track" style={{ transform: `translateX(calc(-${shopHomeBannerIndex * 100}% + ${shopHomeBannerDragOffset}px))`, transition: shopHomeBannerPointerActiveRef.current ? "none" : undefined }}>
                    {shopHomeHeroSlides.map((item, index) => (
                      <button
                        key={`hero-${item.id}-${index}`}
                        type="button"
                        className="shop-home-hero-slide"
                        onClick={() => {
                          openProductDetail(item.id);
                        }}
                      >
                        {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.name} className="shop-home-hero-image" /> : null}
                        <div className={`shop-home-hero-placeholder hero-tone-${(index % 3) + 1}`} />
                        <div className="shop-home-hero-copy">
                          <span>{item.category}</span>
                          <strong>{item.name}</strong>
                          <p>{item.subtitle || item.badge}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="shop-home-hero-dots">
                    {shopHomeHeroSlides.map((item, index) => (
                      <button
                        key={`dot-${item.id}-${index}`}
                        type="button"
                        className={`shop-home-hero-dot ${index === shopHomeBannerIndex ? "active" : ""}`}
                        onClick={() => setShopHomeBannerIndex(index)}
                        aria-label={`${index + 1}번 배너 보기`}
                      />
                    ))}
                  </div>
                </div>

                <div className="chat-toolbar kakao-toolbar compact-only-toolbar feed-compose-launch-toolbar shop-home-sort-toolbar">
                  <div className="feed-filter-tabs" role="tablist" aria-label="쇼핑 홈 즐겨찾기 필터">
                    {SHOP_HOME_SORT_TABS.map((filter) => (
                      <button
                        key={`shop-home-sort-${filter}`}
                        type="button"
                        className={`feed-filter-tab ${shopHomeSort === filter ? "active" : ""}`}
                        onClick={() => setShopHomeSort(filter)}
                        role="tab"
                        aria-selected={shopHomeSort === filter}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                </div>

                <div ref={shopHomeGridScrollRef} className={`shop-home-product-grid-scroll compact-scroll-list ${shopHomeGridDragging ? "dragging" : ""}`} onScroll={handleShopHomeScroll} onPointerDown={handleShopHomeGridPointerDown} onPointerMove={handleShopHomeGridPointerMove} onPointerUp={finishShopHomeGridPointerDrag} onPointerCancel={finishShopHomeGridPointerDrag} onPointerLeave={finishShopHomeGridPointerDrag}>
                  <div className="shop-home-product-grid">
                    {shopHomeFeedItems.map((product) => (
                      <article
                        key={`shop-feed-${product.id}-${product.feedIndex}`}
                        className="shop-home-product-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => handleShopHomeProductCardClick(product.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleShopHomeProductCardClick(product.id);
                          }
                        }}
                      >
                        <div className="shop-home-product-thumb">
                          {product.thumbnailUrl ? <img src={product.thumbnailUrl} alt={product.name} className="shop-home-product-thumb-image" /> : null}
                          <div className={`shop-home-product-thumb-placeholder hero-tone-${(product.feedIndex % 3) + 1}`} />
                          <span className="shop-home-product-badge">{product.badge}</span>
                          <button
                            type="button"
                            className={`shop-home-product-heart ${cartItems.some((item) => item.productId === product.id) ? "active" : ""}`}
                            aria-label="장바구니 담기"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              toggleProductCartFavorite(product.id);
                            }}
                          >
                            <HeartIcon filled={cartItems.some((item) => item.productId === product.id)} />
                          </button>
                        </div>
                        <div className="shop-home-product-meta">
                          <strong>{product.name}</strong>
                          <div className="shop-home-product-stats">
                            <span>리뷰 {product.reviewCount ?? 0}</span>
                            <span>구매 {product.orderCount ?? 0}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  <div className="feed-loading-row shop-home-loading-row">상품을 계속 불러오는 중</div>
                </div>
              </div>
            ) : null}

            {shoppingTab === "목록" ? (
              <>
                <div className="section-head compact-head shop-list-head">
                  <div className="section-tools slim-tools">
                    <input value={shopKeyword} onChange={(e) => setShopKeyword(e.target.value)} placeholder="검색" />
                  </div>
                </div>
                {reconsentWriteRestricted ? <div className="legacy-box compact"><p>유예기간 없이 최신 필수 문서 재동의가 필요합니다. 먼저 필수 문서 안내 화면에서 재동의 정보를 확인한 뒤 주문·문의·상품등록 같은 쓰기 기능을 진행하세요.</p><div className="copy-action-row"><button type="button" className="ghost-btn" onClick={() => { setHomeShopConsentGuideSeen(true); setOverlayMode("reconsent_info"); }}>필수 문서 안내 열기</button></div></div> : null}
                <div className="content-grid product-grid compact-scroll-list shop-list-grid-only">
                  {allShopItems.map((product) => (
                    <article key={product.id} className="product-card">
                      <div className="product-thumb" />
                      <span className="product-badge">{product.badge}</span>
                      <strong>{product.name}</strong>
                      <p>{product.subtitle}</p>
                      <div className="product-meta"><span>{product.category}</span><b>{product.price}</b></div>
                      <div className="product-submeta"><span>배송비 ₩3,000</span><span>재고 {product.stock_qty ?? 12}개</span></div>
                      <div className="product-card-actions">
                        <button type="button" onClick={() => addToCart(product.id)}>장바구니 담기</button>
                        <button type="button" className="ghost-btn" onClick={() => openProductDetail(product.id)}>상세보기</button>
                        <button type="button" className="ghost-btn" onClick={() => toggleSavedProduct(product.id)}>{savedProductIds.includes(product.id) ? "보관해제" : "보관함"}</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : null}

            {shoppingTab === "상품" ? (
              <div className="shop-product-detail-page compact-scroll-list">
                {productDetail ? (
                  <>
                    <div className="shop-product-detail-topbar shop-product-detail-topbar-coupang">
                      <button type="button" className="header-inline-btn header-icon-btn topbar-search-back" onClick={() => { setProductDetail(null); setSelectedProductId(null); setShoppingTab("홈"); }} aria-label="뒤로가기"><BackArrowIcon /></button>
                      <div className="shop-product-detail-topbar-title">상품 상세</div>
                      <button type="button" className={`header-inline-btn header-icon-btn ${savedProductIds.includes(productDetail.product.id) ? "active" : ""}`} onClick={() => toggleSavedProduct(productDetail.product.id)} aria-label="보관함">
                        <BookmarkIcon filled={savedProductIds.includes(productDetail.product.id)} />
                      </button>
                    </div>

                    <section className="shop-product-detail-hero">
                      <div className="shop-product-detail-gallery">
                        <div className="shop-product-detail-image-frame">
                          {productDetailCurrentImage ? (
                            <img src={productDetailCurrentImage} alt={productDetail.product.name} className="shop-product-detail-image" />
                          ) : (
                            <div className="shop-product-detail-image-placeholder">
                              <span>{productDetailDisplayItem?.category ?? "SHOP"}</span>
                            </div>
                          )}
                          <div className="shop-product-detail-image-badges">
                            <span className="shop-product-detail-pill accent">{productDetailDisplayItem?.badge ?? "판매중"}</span>
                            <span className="shop-product-detail-pill">성인 전용</span>
                          </div>
                          <div className="shop-product-detail-image-count">{Math.min(productDetailMediaIndex + 1, Math.max(productDetailImageUrls.length, 1))}/{Math.max(productDetailImageUrls.length, 1)}</div>
                        </div>
                        {productDetailImageUrls.length > 1 ? (
                          <div className="shop-product-detail-thumb-row">
                            {productDetailImageUrls.map((imageUrl, index) => (
                              <button
                                key={`${imageUrl}-${index}`}
                                type="button"
                                className={`shop-product-detail-thumb ${index === productDetailMediaIndex ? "active" : ""}`}
                                onClick={() => setProductDetailMediaIndex(index)}
                              >
                                <img src={imageUrl} alt={`${productDetail.product.name} 썸네일 ${index + 1}`} />
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="shop-product-detail-summary">
                        <div className="shop-product-detail-brand-row">
                          <span className="shop-product-detail-brand">{productDetail.seller_contact?.business_name || productDetail.seller_contact?.name || disclosedBusinessInfo.operatorName}</span>
                          <span className="shop-product-detail-rating">★ {productDetailRating.toFixed(1)} ({Number(productDetailDisplayItem?.reviewCount ?? 0).toLocaleString()})</span>
                        </div>
                        <h2>{productDetail.product.name}</h2>
                        <p className="shop-product-detail-subtitle">{productDetail.product.description || productDetailDisplayItem?.subtitle || "상품 상세 설명을 준비 중입니다."}</p>

                        <div className="shop-product-price-panel">
                          <div>
                            <span className="shop-product-price-label">판매가</span>
                            <strong>{`₩${productDetailPriceValue.toLocaleString()}`}</strong>
                          </div>
                          <div className="shop-product-price-side">
                            <span>배송비 {`₩${productDetailShippingValue.toLocaleString()}`}</span>
                            <span>{Number(productDetail.product.stock_qty || 0) > 0 ? `재고 ${Number(productDetail.product.stock_qty || 0)}개` : "품절"}</span>
                          </div>
                        </div>

                        <div className="shop-product-detail-meta-row">
                          <span className="shop-product-detail-meta-chip">카테고리 · {productDetailDisplayItem?.category ?? "기타"}</span>
                          <span className="shop-product-detail-meta-chip">최근 주문 {Number(productDetailDisplayItem?.orderCount ?? 0).toLocaleString()}</span>
                          <span className="shop-product-detail-meta-chip">재구매 {Number(productDetailDisplayItem?.repurchaseCount ?? 0).toLocaleString()}</span>
                        </div>

                        <div className="shop-product-detail-picker-block">
                          <div className="shop-product-detail-section-title-row">
                            <strong>종류 선택</strong>
                            <span>{selectedProductOption || productDetailOptionChips[0]}</span>
                          </div>
                          <div className="shop-product-detail-option-grid">
                            {productDetailOptionChips.map((option) => (
                              <button
                                key={option}
                                type="button"
                                className={`shop-product-detail-option-chip ${selectedProductOption === option ? "active" : ""}`}
                                onClick={() => setSelectedProductOption(option)}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="shop-product-detail-picker-block">
                          <div className="shop-product-detail-section-title-row">
                            <strong>수량 선택</strong>
                            <span>{productDetailQuantity}개</span>
                          </div>
                          <div className="shop-product-qty-row">
                            <button type="button" className="shop-product-qty-btn" onClick={() => setProductDetailQuantity((prev) => Math.max(1, prev - 1))}>-</button>
                            <div className="shop-product-qty-value">{productDetailQuantity}</div>
                            <button type="button" className="shop-product-qty-btn" onClick={() => setProductDetailQuantity((prev) => Math.min(99, prev + 1))}>+</button>
                          </div>
                        </div>

                        <div className="shop-product-detail-total-box">
                          <div>
                            <span>총 상품금액</span>
                            <strong>{`₩${productDetailTotalAmount.toLocaleString()}`}</strong>
                          </div>
                          <p>{selectedProductOption || productDetailOptionChips[0]} / {productDetailQuantity}개 / 배송비 포함</p>
                        </div>

                        <div className="shop-product-detail-cta-row">
                          <button type="button" className="ghost-btn shop-detail-secondary-btn" onClick={() => toggleSavedProduct(productDetail.product.id)}>{savedProductIds.includes(productDetail.product.id) ? "보관해제" : "보관함"}</button>
                          <button type="button" className="ghost-btn shop-detail-secondary-btn" onClick={addSelectedProductToCart}>장바구니</button>
                          <button type="button" className="shop-detail-primary-btn" onClick={createOrderForSelectedProduct}>바로구매</button>
                        </div>
                      </div>
                    </section>

                    <section className="shop-product-detail-content">
                      <article className="shop-product-detail-section-card">
                        <div className="shop-product-detail-section-head">
                          <strong>상품 상세</strong>
                          <span>쿠팡형 본문 영역</span>
                        </div>
                        <div className="shop-product-detail-story-block">
                          <div className="shop-product-detail-story-hero">
                            <span>{productDetailDisplayItem?.category ?? "SHOP"}</span>
                            <strong>{productDetail.product.name}</strong>
                            <p>{productDetail.product.description || "상세 설명 준비중"}</p>
                          </div>
                          <div className="shop-product-detail-story-copy">
                            <p>기본 사용 흐름과 보관 편의성을 중심으로 구성된 상품입니다. 첫 구매자도 이해하기 쉬운 형태로 제품 안내와 주문 동선을 단순화했습니다.</p>
                            <p>상세 화면은 상단 핵심 구매 정보 이후, 상품 설명 · 배송/교환 · 판매자 정보 순으로 이어지도록 구성해 실제 이커머스 상세 구조처럼 보이도록 정리했습니다.</p>
                          </div>
                        </div>
                      </article>

                      <article className="shop-product-detail-section-card">
                        <div className="shop-product-detail-section-head">
                          <strong>기본 정보</strong>
                          <span>필수 구매 정보</span>
                        </div>
                        <div className="shop-product-spec-grid">
                          <div className="shop-product-spec-row"><b>카테고리</b><span>{productDetailDisplayItem?.category ?? "기타"}</span></div>
                          <div className="shop-product-spec-row"><b>옵션</b><span>{selectedProductOption || productDetailOptionChips[0]}</span></div>
                          <div className="shop-product-spec-row"><b>배송비</b><span>{`₩${productDetailShippingValue.toLocaleString()}`}</span></div>
                          <div className="shop-product-spec-row"><b>재고</b><span>{Number(productDetail.product.stock_qty || 0) > 0 ? `${Number(productDetail.product.stock_qty || 0)}개` : "품절"}</span></div>
                          <div className="shop-product-spec-row"><b>접근상태</b><span>{adultGateStatus?.allowed_to_shop ? "쇼핑 가능" : adultGateStatus?.member_status || "미확인"}</span></div>
                          <div className="shop-product-spec-row"><b>후기</b><span>{Number(productDetailDisplayItem?.reviewCount ?? 0).toLocaleString()}개</span></div>
                        </div>
                      </article>

                      <article className="shop-product-detail-section-card">
                        <div className="shop-product-detail-section-head">
                          <strong>배송 / 교환 / 환불</strong>
                          <span>구매 전 안내</span>
                        </div>
                        <div className="shop-product-policy-list">
                          <div className="shop-product-policy-row"><b>배송안내</b><span>결제 완료 후 순차 발송 · 기본 배송비 {`₩${productDetailShippingValue.toLocaleString()}`}</span></div>
                          <div className="shop-product-policy-row"><b>교환/반품</b><span>최소 {productDetail.site_ready?.minimum_refund_window_days || 7}일 정책 적용</span></div>
                          <div className="shop-product-policy-row"><b>상품표시</b><span>{productDetail.site_ready?.adult_only_label || "성인용품"} 명시</span></div>
                          <div className="shop-product-policy-row"><b>구매버튼</b><span>{productDetail.site_ready?.purchase_button_visible ? "노출 중" : "노출 준비중"}</span></div>
                        </div>
                      </article>

                      <article className="shop-product-detail-section-card">
                        <div className="shop-product-detail-section-head">
                          <strong>판매자 정보</strong>
                          <span>고객센터 / 사업자 정보</span>
                        </div>
                        <div className="shop-product-spec-grid">
                          <div className="shop-product-spec-row"><b>상호명</b><span>{productDetail.seller_contact?.business_name || productDetail.seller_contact?.name || disclosedBusinessInfo.operatorName}</span></div>
                          <div className="shop-product-spec-row"><b>사업자번호</b><span>{productDetail.seller_contact?.business_registration_no || disclosedBusinessInfo.registrationNo}</span></div>
                          <div className="shop-product-spec-row"><b>CS 연락처</b><span>{productDetail.seller_contact?.cs_contact || disclosedBusinessInfo.phone}</span></div>
                          <div className="shop-product-spec-row"><b>문의 이메일</b><span>{productDetail.seller_contact?.support_email || disclosedBusinessInfo.email}</span></div>
                          <div className="shop-product-spec-row wide"><b>사업장 주소</b><span>{productDetail.seller_contact?.business_address || disclosedBusinessInfo.address}</span></div>
                          <div className="shop-product-spec-row wide"><b>반품 주소</b><span>{productDetail.seller_contact?.return_address || disclosedBusinessInfo.address}</span></div>
                        </div>
                      </article>

                      <article className="shop-product-detail-section-card">
                        <div className="shop-product-detail-section-head">
                          <strong>주문 / 결제 테스트</strong>
                          <span>현재 프로젝트 기능 유지</span>
                        </div>
                        <div className="shop-product-detail-cta-row shop-product-detail-cta-row-inline">
                          <button type="button" className="ghost-btn shop-detail-secondary-btn" onClick={verifyAdultSelf}>성인인증 진행</button>
                          <button type="button" className="ghost-btn shop-detail-secondary-btn" onClick={() => launchVerotelCheckout()}>중립 결제 테스트</button>
                          <button type="button" className="shop-detail-primary-btn" onClick={() => setShoppingTab("주문")}>주문 탭 열기</button>
                        </div>
                        <p className="muted-mini shop-product-detail-note">미성년자는 쇼핑과 결제가 차단됩니다. PASS 실연동 전에는 자체 성인 확인으로 QA 가능합니다.</p>
                      </article>
                    </section>
                  </>
                ) : (
                  <div className="legacy-box compact">
                    <p>상품을 선택하면 상세 정보가 표시됩니다.</p>
                  </div>
                )}
              </div>
            ) : null}

            {shoppingTab === "주문" ? (
              <div className="shop-order-page compact-scroll-list">
                <div className="shop-order-page-head">
                  <strong>주문 내역</strong>
                  <span>최근 주문과 배송 상태를 확인합니다.</span>
                </div>
                <div className="shop-order-filter-row">
                  <button type="button" className="active">전체</button>
                  <button type="button">배송중</button>
                  <button type="button">배송완료</button>
                  <button type="button">취소/환불</button>
                </div>
                <div className="shop-order-list">
                  {orders.length ? orders.slice().reverse().map((item, index) => (
                    <article key={item.order_no} className="shop-order-card">
                      <div className="shop-order-card-top">
                        <div>
                          <strong>{item.order_no}</strong>
                          <span>주문상품 {item.item_count}건 · {item.payment_method}</span>
                        </div>
                        <b>{item.status === "paid" ? "결제완료" : item.status === "payment_pending" ? "결제대기" : item.status}</b>
                      </div>
                      <div className="shop-order-card-body">
                        <div className={`shop-order-thumb hero-tone-${(index % 3) + 1}`}>{String(index + 1).padStart(2, '0')}</div>
                        <div className="shop-order-info">
                          <strong>{item.item_count > 1 ? `주문 상품 외 ${item.item_count - 1}건` : "주문 상품"}</strong>
                          <span>총 결제금액 ₩{Number(item.total_amount || 0).toLocaleString()}</span>
                          <p>PG {item.payment_pg} · 정산 {item.settlement_status}</p>
                        </div>
                      </div>
                      <div className="shop-order-actions">
                        <button type="button" onClick={() => selectOrderForTesting(item.order_no)}>상세보기</button>
                        <button type="button" className="ghost-btn" onClick={() => setShoppingTab('바구니')}>재구매</button>
                      </div>
                    </article>
                  )) : (
                    <div className="shop-order-empty">
                      <strong>아직 주문한 상품이 없습니다.</strong>
                      <p>쇼핑 홈에서 상품을 장바구니에 담고 주문을 진행하면 이곳에 표시됩니다.</p>
                    </div>
                  )}
                </div>
                {orderDetail ? (
                  <div className="shop-order-detail-card">
                    <strong>선택 주문 상세</strong>
                    <span>{orderDetail.order.order_no} · ₩{Number(orderDetail.order.total_amount || 0).toLocaleString()}</span>
                    <p>품목: {orderDetail.items.map((item) => `${item.sku_code || item.product_id} x${item.qty}`).join(' · ') || '없음'}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {shoppingTab === "바구니" ? (
              <div className="cart-box compact-scroll-list stack-gap">
                <div className="checkout-stepper">
                  {checkoutStepMeta.map((item, index) => <div key={item.key} className={`checkout-step-chip ${index <= checkoutStageIndex ? 'active' : ''}`}>{index + 1}. {item.label}</div>)}
                </div>
                <div className="legacy-box compact legal-disclosure-card">
                  <strong>성인 전용 접근 안내</strong>
                  <span>본 서비스는 만 19세 이상만 이용 가능합니다.</span>
                  <span>인증 방식: PASS / NICE / Danal 등 본인확인 결과 연동 예정</span>
                  <span>인증 미완료 시 상품/결제/채팅/커뮤니티 접근이 차단됩니다.</span>
                </div>
                <div className="legacy-box compact legal-disclosure-card">
                  <strong>플랫폼 결제 및 재정산 안내</strong>
                  <span>결제는 플랫폼이 중립 명칭의 체크아웃 화면에서 수취합니다.</span>
                  <span>판매자 정산은 주문 확정 후 레저 기준으로 계산되어 계좌이체로 분배됩니다.</span>
                  <span>환불 요청 시 플랫폼 PG 환불 후 판매자 정산 금액에서 차감될 수 있습니다.</span>
                </div>
                <div className="legacy-box compact">
                  <h3>1. 장바구니</h3>
                  {cartDetailedItems.length ? cartDetailedItems.map((item) => (
                    <div key={item.productId} className="cart-row"><div><strong>{item.product.name}</strong><span>{item.product.category} · 수량 {item.qty}</span></div><b>₩{(Number(item.product.price || 0) * item.qty).toLocaleString()}</b></div>
                  )) : cartSeed.map((item) => (
                    <div key={item.id} className="cart-row"><div><strong>{item.name}</strong><span>{item.option} · 수량 {item.qty}</span></div><b>{item.price}</b></div>
                  ))}
                  <div className="cart-summary"><span>총 결제 예정</span><strong>{cartDetailedItems.length ? `₩${cartTotalAmount.toLocaleString()}` : '₩112,500'}</strong></div>
                  <div className="product-card-actions">
                    <button type="button" onClick={() => setCheckoutStage('order_form')}>주문서 작성</button>
                    <button type="button" className="ghost-btn" onClick={() => { setCheckoutStage('payment_request'); createOrderFromCart(); }}>주문하기</button>
                  </div>
                </div>
                <div className="legacy-box compact">
                  <h3>2. 주문서 작성</h3>
                  <div className="profile-form-grid">
                    <label><span>수령인</span><input value={checkoutDraft.recipientName} onChange={(e) => setCheckoutDraft((prev) => ({ ...prev, recipientName: e.target.value }))} /></label>
                    <label><span>연락처</span><input value={checkoutDraft.phone} onChange={(e) => setCheckoutDraft((prev) => ({ ...prev, phone: e.target.value }))} /></label>
                    <label className="wide"><span>이메일</span><input value={checkoutDraft.email} onChange={(e) => setCheckoutDraft((prev) => ({ ...prev, email: e.target.value }))} /></label>
                    <label className="wide"><span>주소</span><input value={checkoutDraft.address} onChange={(e) => setCheckoutDraft((prev) => ({ ...prev, address: e.target.value }))} /></label>
                    <label className="wide"><span>배송 요청사항</span><input value={checkoutDraft.requestNote} onChange={(e) => setCheckoutDraft((prev) => ({ ...prev, requestNote: e.target.value }))} /></label>
                  </div>
                  <div className="notification-policy-links legal-link-row">
                    {legalQuickLinks.map((item) => <a key={item.key} className="ghost-link-btn" href={item.href} target="_blank" rel="noreferrer">{item.label}</a>)}
                  </div>
                </div>
                {orderMessage ? <p className="muted-mini">{orderMessage}</p> : null}
              </div>
            ) : null}
          </section>
        ) : null}

            {shoppingTab === "사업자인증" ? (
              <div className="stack-gap compact-scroll-list">
                <div className="section-head compact-head"><div><h2>사업자인증</h2><p>사업자 미인증 계정은 먼저 인증 정보를 등록한 뒤 관리자 승인 또는 관리자 예외 기준에 따라 상품등록으로 이동합니다.</p></div></div>
                <div className="legacy-grid two-col compact-grid">
                  <div className="legacy-box compact"><h3>인증 진행 상태</h3><p>{isAdmin ? '관리자 계정은 사업자 인증 없이도 테스트용 상품등록이 가능합니다.' : sellerVerification.status === 'approved' ? '관리자 승인 완료 · 상품등록 가능' : sellerVerification.status === 'pending' ? '승인 대기 중 · 관리자 승인 후 상품등록 가능' : '신청 전 · 아래 입력칸을 채운 뒤 사업자 인증을 신청해주세요.'}</p><p>필수 입력: 상호/법인명, 대표자명, 사업자번호, 통신판매업 신고번호, CS, 반품지, 정산계좌, 청소년보호책임자, 취급 카테고리</p></div>
                  <div className="legacy-box compact"><h3>진행 안내</h3><div className="consent-record-list"><div className="simple-list-row"><b>1단계</b><span>사업자등록 정보와 정산계좌를 입력합니다.</span></div><div className="simple-list-row"><b>2단계</b><span>사업자 인증 신청을 제출하면 관리자 승인 대기 상태로 전환됩니다.</span></div><div className="simple-list-row"><b>3단계</b><span>승인 완료 후 상단바의 상품등록 탭에서 상품을 등록합니다.</span></div><div className="simple-list-row"><b>관리자</b><span>관리자 계정은 별도 인증 없이 바로 상품등록 테스트가 가능합니다.</span></div></div></div>
                </div>
                <div className="legacy-box compact">
                  <h3>사업자 인증 등록/수정</h3>
                  <div className="profile-form-grid">
                    <label><span>상호/법인명</span><input value={sellerVerification.companyName} onChange={(e) => setSellerVerification((prev) => ({ ...prev, companyName: e.target.value }))} placeholder="상호 또는 법인명" /></label>
                    <label><span>대표자명</span><input value={sellerVerification.representativeName} onChange={(e) => setSellerVerification((prev) => ({ ...prev, representativeName: e.target.value }))} placeholder="대표자명" /></label>
                    <label><span>사업자등록번호</span><input value={sellerVerification.businessNumber} onChange={(e) => setSellerVerification((prev) => ({ ...prev, businessNumber: e.target.value }))} placeholder="123-45-67890" /></label>
                    <label><span>통신판매업 신고번호</span><input value={sellerVerification.ecommerceNumber} onChange={(e) => setSellerVerification((prev) => ({ ...prev, ecommerceNumber: e.target.value }))} placeholder="제 2026-서울-0000호" /></label>
                    <label className="wide"><span>사업장 주소</span><input value={sellerVerification.businessAddress} onChange={(e) => setSellerVerification((prev) => ({ ...prev, businessAddress: e.target.value }))} placeholder="사업장 주소" /></label>
                    <label><span>CS 연락처</span><input value={sellerVerification.csContact} onChange={(e) => setSellerVerification((prev) => ({ ...prev, csContact: e.target.value }))} placeholder="010-0000-0000" /></label>
                    <label className="wide"><span>반품 주소</span><input value={sellerVerification.returnAddress} onChange={(e) => setSellerVerification((prev) => ({ ...prev, returnAddress: e.target.value }))} placeholder="반품 수령 주소" /></label>
                    <label><span>청소년보호책임자</span><input value={sellerVerification.youthProtectionOfficer} onChange={(e) => setSellerVerification((prev) => ({ ...prev, youthProtectionOfficer: e.target.value }))} placeholder="담당자명" /></label>
                    <label><span>정산 은행</span><input value={sellerVerification.settlementBank} onChange={(e) => setSellerVerification((prev) => ({ ...prev, settlementBank: e.target.value }))} placeholder="은행명" /></label>
                    <label><span>정산 계좌번호</span><input value={sellerVerification.settlementAccountNumber} onChange={(e) => setSellerVerification((prev) => ({ ...prev, settlementAccountNumber: e.target.value }))} placeholder="계좌번호" /></label>
                    <label><span>예금주명</span><input value={sellerVerification.settlementAccountHolder} onChange={(e) => setSellerVerification((prev) => ({ ...prev, settlementAccountHolder: e.target.value }))} placeholder="예금주명" /></label>
                    <label className="wide"><span>취급 상품 카테고리</span><input value={sellerVerification.handledCategories} onChange={(e) => setSellerVerification((prev) => ({ ...prev, handledCategories: e.target.value }))} placeholder="위생/보관, 바디/케어, 입문 액세서리" /></label>
                    <label className="wide"><span>사업자 등록 인증 사진 URL</span><input value={sellerVerification.businessDocumentUrl} onChange={(e) => setSellerVerification((prev) => ({ ...prev, businessDocumentUrl: e.target.value }))} placeholder="/media/business-doc.jpg 또는 외부 저장 URL" /></label>
                  </div>
                  <div className="copy-action-row">
                    <button type="button" onClick={submitSellerVerification} disabled={!sellerApplicationComplete || isAdmin}>사업자 인증 신청</button>
                    <button type="button" className="ghost-btn" onClick={() => setSellerVerification((prev) => ({ ...prev, status: 'approved' }))}>데모 승인 반영</button>
                    <button type="button" className="ghost-btn" onClick={openProductRegistrationTab}>상품등록으로 이동</button>
                  </div>
                  {isAdmin ? <p className="muted-mini">관리자 계정은 사업자 인증 제출 없이 바로 상품등록 테스트를 진행할 수 있습니다.</p> : null}
                </div>
              </div>
            ) : null}

            {shoppingTab === "일반거래" ? (
              <div className="stack-gap compact-scroll-list">
                <div className="section-head compact-head"><div><h2>일반거래</h2><p>일반 회원도 중고/간편 거래 등록을 준비할 수 있는 화면입니다.</p></div></div>
                {reconsentWriteRestricted ? <div className="legacy-box compact"><p>최신 필수 문서 재동의가 필요합니다. 먼저 필수 문서 안내 화면에서 재동의 정보를 확인하세요.</p></div> : null}
                <div className="legacy-box compact">
                  <h3>일반거래 등록</h3>
                  <div className="profile-form-grid">
                    <label><span>거래 제목</span><input placeholder="거래 제목 입력" /></label>
                    <label><span>거래 희망가</span><input placeholder="희망가 입력" inputMode="numeric" /></label>
                    <label><span>거래 지역</span><input placeholder="시/구 단위 입력" /></label>
                    <label><span>상품 상태</span><select defaultValue=""><option value="">상태 선택</option><option>미개봉</option><option>새상품급</option><option>사용감 있음</option></select></label>
                    <label className="wide"><span>거래 설명</span><textarea placeholder="상태, 구성품, 거래 조건을 입력하세요" /></label>
                    <label className="wide"><span>사진 URL</span><input placeholder="사진 URL 입력" /></label>
                  </div>
                  <div className="copy-action-row">
                    <button type="button" disabled={reconsentWriteRestricted}>일반거래 등록 준비</button>
                    <button type="button" className="ghost-btn" onClick={() => setShoppingTab("홈")}>쇼핑 홈으로</button>
                  </div>
                  <p className="muted-mini">일반거래는 일반 회원도 접근 가능하며, 실제 등록/노출 정책은 관리자 검수 기준에 맞춰 후속 연결됩니다.</p>
                </div>
              </div>
            ) : null}

            {shoppingTab === "상품등록" ? (
              <div className="stack-gap compact-scroll-list">
                <div className="section-head compact-head"><div><h2>상품등록</h2>{!sellerApprovalReady ? <p>사업자 미인증 계정은 먼저 사업자인증 탭에서 인증 신청과 승인 절차를 완료해야 합니다.</p> : null}</div></div>
                {!sellerApprovalReady ? (
                  <div className="legacy-box compact">
                    <h3>사업자 인증이 먼저 필요합니다</h3>
                    <p>현재 계정은 상품등록 권한이 없습니다. 사업자등록 정보와 정산 정보를 입력한 뒤 사업자인증을 신청해주세요.</p>
                    <div className="copy-action-row">
                      <button type="button" onClick={openBusinessVerificationTab}>사업자인증으로 이동</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="legacy-box compact">
                      <h3>상품 등록 화면</h3>
                      <div className="profile-form-grid">
                        <label><span>카테고리</span><select ref={productCategorySelectRef} value={productRegistrationDraft.category} onChange={(e) => handleProductCategoryChange(e.target.value)}><option value="">카테고리 선택</option>{productCategoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                        <label><span>등록상품명</span><input value={productRegistrationDraft.name} onChange={(e) => handleProductNameChange(e.target.value)} onMouseDown={guardProductCategoryRequiredInteraction} onFocus={guardProductCategoryRequiredInteraction} placeholder="등록상품명 입력" maxLength={29} readOnly={!isProductCategorySelected} aria-disabled={!isProductCategorySelected} /></label>
                        <label><span>판매가</span><input value={productRegistrationDraft.price} onChange={(e) => handleProductPriceChange(e.target.value)} onMouseDown={guardProductCategoryRequiredInteraction} onFocus={guardProductCategoryRequiredInteraction} placeholder="판매가 입력" inputMode="numeric" readOnly={!isProductCategorySelected} aria-disabled={!isProductCategorySelected} /></label>
                        <label><span>재고수량</span><input value={productRegistrationDraft.stockQty} onChange={(e) => handleProductStockQtyChange(e.target.value)} onMouseDown={guardProductCategoryRequiredInteraction} onFocus={guardProductCategoryRequiredInteraction} placeholder="재고수량 입력" inputMode="numeric" readOnly={!isProductCategorySelected} aria-disabled={!isProductCategorySelected} /></label>
                        <label><span>상품코드(SKU)</span><input value={productRegistrationDraft.skuCode} onChange={(e) => handleProductSkuCodeChange(e.target.value)} onMouseDown={guardProductCategoryRequiredInteraction} onFocus={guardProductCategoryRequiredInteraction} placeholder="상품코드 SKU 입력" readOnly={!isProductCategorySelected} aria-disabled={!isProductCategorySelected} /></label>
                        <label className="wide"><span>상세 설명</span><textarea value={productRegistrationDraft.description} onChange={(e) => handleProductDescriptionChange(e.target.value)} onMouseDown={guardProductCategoryRequiredInteraction} onFocus={guardProductCategoryRequiredInteraction} placeholder="상세설명 입력" readOnly={!isProductCategorySelected} aria-disabled={!isProductCategorySelected} /></label>
                        <label className="wide"><span>{isChatEmoticonCategory ? '대표 이미지 / 미리보기 이미지' : '대표 이미지 / 추가 이미지'}</span><div className="photo-url-grid">{productImageInputMeta.map((meta, idx) => <input key={idx} value={productRegistrationDraft.imageUrls[idx] ?? ''} onChange={(e) => setProductRegistrationDraft((prev) => ({ ...prev, imageUrls: prev.imageUrls.map((item, itemIdx) => itemIdx === idx ? e.target.value : item) }))} onMouseDown={guardProductCategoryRequiredInteraction} onFocus={guardProductCategoryRequiredInteraction} placeholder={meta.placeholder} readOnly={!isProductCategorySelected} aria-disabled={!isProductCategorySelected} />)}</div></label>
                      </div>
                      {!productDraftReady ? <p className="muted-mini">카테고리, 상품명, 가격, 개수, 상품 코드, 상품소개를 입력해야 등록할 수 있습니다. 사진 URL은 선택입니다.</p> : null}{reconsentWriteRestricted ? <p className="muted-mini">유예기간 없이 최신 필수 문서 재동의가 필요합니다. 먼저 필수 문서 안내 화면에서 최신 약관과 재동의 절차를 확인하세요.</p> : null}
                      <div className="copy-action-row">
                        <button type="button" onClick={() => submitProductRegistration("draft")} disabled={!sellerApprovalReady || !productDraftReady || reconsentWriteRestricted}>임시저장</button>
                        <button type="button" onClick={() => submitProductRegistration("publish")} disabled={!sellerApprovalReady || !productDraftReady || reconsentWriteRestricted}>상품등록</button>
                        <button type="button" className="ghost-btn" onClick={openBusinessVerificationTab}>사업자인증 수정</button>
                      </div>
                    </div>
                    <div className="legacy-box compact">
                      <h3>현재 상품군 / SKU 반영 기준</h3>
                      <div className="consent-record-list">
                        {uiCategoryGroups.map((group) => (
                          <div key={group.group} className="simple-list-row multi-line">
                            <div><b>{group.group}</b><span>{group.items.join(' · ')}</span></div>
                          </div>
                        ))}
                        {!uiCategoryGroups.length ? <p className="muted-mini">카테고리 그룹 정보를 불러오지 못했습니다.</p> : null}
                      </div>
                      <div className="legacy-grid three compact-grid top-gap-12">
                        {(skuPolicy?.payment_method_mapping ?? []).map((item) => (
                          <div key={`${item.risk_grade}-${item.payment_scope}`} className="legacy-box compact">
                            <h3>등급 {item.risk_grade}</h3>
                            <p>결제: {item.payment_scope}</p>
                            <p>노출: {item.display_scope}</p>
                          </div>
                        ))}
                      </div>
                      <div className="consent-record-list top-gap-12">
                        {skuPolicySeed.map((item) => (
                          <div key={`${item.category}-${item.grade}`} className="simple-list-row multi-line">
                            <div><b>{item.category}</b><span>{item.grade}</span><span>{item.note}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="legacy-box compact">
                      <h3>내 등록 상품 상태</h3>
                      <div className="compact-scroll-list">
                        {sellerProducts.map((item) => (
                          <div key={item.id} className="simple-list-row multi-line">
                            <div><b>{item.name}</b><span>{item.sku_code} · {item.category}</span><span>{item.status} · ₩{item.price.toLocaleString()}</span></div>
                            <div className="copy-action-row">
                              {item.status !== 'approved' ? <button type="button" onClick={() => submitProductForReview(item.id)}>승인대기 제출</button> : <span className="muted-mini">공개중</span>}
                            </div>
                          </div>
                        ))}
                        {!sellerProducts.length ? <p className="muted-mini">등록된 내 상품이 없습니다.</p> : null}
                      </div>
                    </div>
                    {submittedProducts.length ? (
                      <div className="legacy-box compact">
                        <h3>임시 등록 상품</h3>
                        <div className="chat-list">
                          {submittedProducts.map((item, idx) => <article key={`${item.skuCode}-${idx}`} className="chat-row simple-row"><div className="avatar-circle">P</div><div className="chat-copy"><strong>{item.name}</strong><span>{item.category} · {item.skuCode}</span><p>{item.description}</p></div><div className="chat-meta"><span>{item.stockQty}개</span><b>{item.price}원</b></div></article>)}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}

{showAppTabContent && activeTab === "소통" ? (
          <section className="tab-pane fill-pane">
            {communityTab === "포럼" ? (
              <div className="community-simple-board compact-scroll-list forum-board-shell">
                {activeForumRoom ? (
                  <>
                    <div className="forum-room-topbar">
                      <button type="button" className="header-inline-btn header-icon-btn topbar-search-back" onClick={closeForumRoom} aria-label="포럼 목록으로 돌아가기"><BackArrowIcon /></button>
                      <div className="forum-room-title-wrap">
                        <strong>{activeForumRoom.title}</strong>
                        <span>{activeForumRoom.category} · 참여 {activeForumRoom.participants}명</span>
                      </div>
                    </div>
                    <div className="forum-room-message-list compact-scroll-list">
                      {activeForumMessages.map((message) => (
                        <article key={message.id} className={`forum-room-message ${message.kind}`}>
                          <div className="forum-room-message-head">
                            <strong>{message.author}</strong>
                            <span>{message.meta}</span>
                          </div>
                          <p>{message.text}</p>
                        </article>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="community-simple-category-row forum-simple-category-row">
                      {forumBoardCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          className={`community-simple-chip ${selectedForumCategory === category ? "active" : ""}`}
                          onClick={() => setSelectedForumCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="community-simple-list forum-simple-list">
                      {filteredForumRooms.map((room) => (
                        <button key={room.id} type="button" className="community-simple-item community-simple-forum-item" onClick={() => openForumRoom(room)}>
                          <div className="community-simple-head-row">
                            <div className="community-simple-title-wrap">
                              <span className="community-chip">{room.category}</span>
                              <strong title={room.title}>{room.title}</strong>
                            </div>
                            <div className="community-simple-meta-row">
                              <span>{room.starter}</span>
                              <span>{room.latestAt}</span>
                            </div>
                          </div>
                          <p>{room.summary}</p>
                        </button>
                      ))}
                      {!filteredForumRooms.length ? <div className="community-simple-item community-simple-item-empty"><p>선택한 카테고리의 포럼방이 없습니다.</p></div> : null}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {communityExplorerStage === "list" || !selectedCommunityPost ? (
                  <div className="community-simple-board compact-scroll-list">
                    <div className="community-simple-category-row">
                      <button className={`community-simple-chip ${selectedCommunityCategory === "전체" ? "active" : ""}`} onClick={() => setSelectedCommunityCategory("전체")}>전체</button>
                      {communityCategories.map((category) => (
                        <button key={category} className={`community-simple-chip ${selectedCommunityCategory === category ? "active" : ""}`} onClick={() => setSelectedCommunityCategory(category)}>{category}</button>
                      ))}
                    </div>
                    <div className="community-simple-list">
                      {communityDisplayRows.map((post, index) => {
                        if (!post) {
                          return (
                            <article key={`community-empty-${communityPage}-${index}`} className="community-simple-item community-simple-item-empty" aria-hidden="true">
                              <div className="community-simple-head-row">
                                <div className="community-simple-title-wrap">
                                  <span className="community-chip community-chip-placeholder">빈 칸</span>
                                  <strong>{" "}</strong>
                                </div>
                                <div className="community-simple-meta-row">
                                  <span>{" "}</span>
                                  <span>{" "}</span>
                                </div>
                              </div>
                              <p>{" "}</p>
                            </article>
                          );
                        }

                        const parsedMeta = parseCommunityMeta(post.meta);
                        return (
                          <button key={post.id} type="button" className={`community-simple-item community-simple-item-button ${post.pinned ? "community-simple-item-pinned" : ""}`} onClick={() => openCommunityPost(post)}>
                            <div className="community-simple-head-row">
                              <div className="community-simple-title-wrap">
                                <span className="community-chip">{post.category}</span>
                                <strong title={post.title}>{post.title}</strong>
                              </div>
                              <div className="community-simple-meta-row">
                                <span>{parsedMeta.author}</span>
                                <span>{parsedMeta.postedAt}</span>
                              </div>
                            </div>
                            <p>{post.summary}</p>
                            {post.path ? <div className="community-post-path">경로: {post.path}</div> : null}
                          </button>
                        );
                      })}
                    </div>
                    <div className="community-simple-pagination">
                      <button type="button" className="ghost-btn" onClick={() => setCommunityPage((prev) => Math.max(1, prev - 1))} disabled={communityPage <= 1}>이전</button>
                      <span>{communityPage} / {communityPageCount}</span>
                      <button type="button" className="ghost-btn" onClick={() => setCommunityPage((prev) => Math.min(communityPageCount, prev + 1))} disabled={communityPage >= communityPageCount}>다음</button>
                    </div>
                  </div>
                ) : null}

                {communityExplorerStage === "detail" && selectedCommunityPost ? (
                  <div className="community-detail-shell compact-scroll-list">
                    <div className="community-detail-topbar">
                      <button type="button" className="header-inline-btn header-icon-btn topbar-search-back" onClick={closeCommunityExplorer} aria-label="목록으로 돌아가기"><BackArrowIcon /></button>
                      <div className="community-detail-topbar-copy">
                        <strong>{selectedCommunityPost.title}</strong>
                        <span>{selectedCommunityPost.path ?? `소통 > ${selectedCommunityPost.board ?? "커뮤"}`}</span>
                      </div>
                    </div>
                    <article className="community-detail-card">
                      <div className="community-simple-head-row">
                        <div className="community-simple-title-wrap">
                          <span className="community-chip">{selectedCommunityPost.category}</span>
                          <strong>{selectedCommunityPost.detailTitle ?? selectedCommunityPost.title}</strong>
                        </div>
                        <div className="community-simple-meta-row">
                          <span>{parseCommunityMeta(selectedCommunityPost.meta).author}</span>
                          <span>{parseCommunityMeta(selectedCommunityPost.meta).postedAt}</span>
                        </div>
                      </div>
                      <p className="community-detail-summary">{selectedCommunityPost.summary}</p>
                      <div className="community-detail-body">
                        {(selectedCommunityPost.detailBody ?? [selectedCommunityPost.summary]).map((line, index) => <p key={`${selectedCommunityPost.id}-line-${index}`}>{line}</p>)}
                      </div>
                    </article>
                  </div>
                ) : null}

                {communityExplorerStage === "test_intro" && selectedCommunityPost ? (
                  <div className="community-detail-shell compact-scroll-list">
                    <div className="community-detail-topbar">
                      <button type="button" className="header-inline-btn header-icon-btn topbar-search-back" onClick={closeCommunityExplorer} aria-label="목록으로 돌아가기"><BackArrowIcon /></button>
                      <div className="community-detail-topbar-copy">
                        <strong>{selectedCommunityPost.detailTitle ?? selectedCommunityPost.title}</strong>
                        <span>{selectedCommunityPost.path ?? "소통 > 커뮤 > 테스트"}</span>
                      </div>
                    </div>
                    <article className="community-detail-card community-test-intro-card">
                      <div className="community-simple-title-wrap">
                        <span className="community-chip">7점 척도</span>
                        <strong>스스로에 대해 알아 가는 시간을 가져보세요.</strong>
                      </div>
                      <p className="community-detail-summary">합의, 역할, 규칙, 돌봄, 일상 친밀감 같은 축을 함께 확인하는 자기이해형 테스트입니다.</p>
                      <div className="community-test-profile-grid">
                        <label><span>성별</span><select value={testProfile.gender} onChange={(event) => setTestProfile((prev) => ({ ...prev, gender: event.target.value }))}><option>선택 안 함</option><option>여성</option><option>남성</option><option>기타</option></select></label>
                        <label><span>연령대</span><select value={testProfile.ageBand} onChange={(event) => setTestProfile((prev) => ({ ...prev, ageBand: event.target.value }))}><option>10대 후반</option><option>20대</option><option>30대</option><option>40대</option><option>50대 이상</option></select></label>
                        <label><span>테스트 목적</span><select value={testProfile.focus} onChange={(event) => setTestProfile((prev) => ({ ...prev, focus: event.target.value }))}><option>자기이해</option><option>대화준비</option><option>커플체크인</option></select></label>
                      </div>
                      <div className="community-detail-body">
                        <p>기본 {testQuestionCount}문항으로 먼저 진행하며, 각 문항은 전혀 아니다부터 매우 그렇다까지 7단계로 응답합니다.</p>
                        <p>결과는 저장형 진단이 아니라 현재 기준의 성향 탐색 요약으로 보여주며, 민감한 내용은 기본 비공개 흐름으로 설계했습니다.</p>
                      </div>
                      <div className="copy-action-row">
                        <button type="button" onClick={() => setCommunityExplorerStage("test_run")}>테스트 시작</button>
                        <button type="button" className="ghost-btn" onClick={resetCommunityTest}>응답 초기화</button>
                      </div>
                    </article>
                  </div>
                ) : null}

                {communityExplorerStage === "test_run" && selectedCommunityPost ? (
                  <div className="community-detail-shell compact-scroll-list">
                    <div className="community-detail-topbar">
                      <button type="button" className="header-inline-btn header-icon-btn topbar-search-back" onClick={() => setCommunityExplorerStage("test_intro")} aria-label="테스트 소개로 돌아가기"><BackArrowIcon /></button>
                      <div className="community-detail-topbar-copy">
                        <strong>{selectedCommunityPost.detailTitle ?? selectedCommunityPost.title}</strong>
                        <span>진행률 {testAnsweredCount}/{testQuestionCount}</span>
                      </div>
                    </div>
                    <div className="community-test-progress-bar"><span style={{ width: `${(testAnsweredCount / testQuestionCount) * 100}%` }} /></div>
                    <div className="community-test-question-list">
                      {testQuestions.map((question) => (
                        <article key={question.id} className="community-test-question-card">
                          <div className="community-test-question-head">
                            <strong>{question.id}. {question.prompt}</strong>
                            <span>{question.helper}</span>
                          </div>
                          <div className="community-test-option-row">
                            {testScaleOptions.map((option) => (
                              <button key={`${question.id}-${option.score}`} type="button" className={`community-test-scale-btn ${testAnswers[question.id] === option.score ? "active" : ""}`} onClick={() => answerCommunityTestQuestion(question.id, option.score)}>
                                <span>{option.label}</span>
                              </button>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="copy-action-row">
                      <button type="button" onClick={() => setCommunityExplorerStage("test_result")} disabled={!testCanShowResult}>결과 보기</button>
                      <button type="button" className="ghost-btn" onClick={resetCommunityTest}>처음부터 다시</button>
                    </div>
                  </div>
                ) : null}

                {communityExplorerStage === "test_result" && selectedCommunityPost ? (
                  <div className="community-detail-shell compact-scroll-list">
                    <div className="community-detail-topbar">
                      <button type="button" className="header-inline-btn header-icon-btn topbar-search-back" onClick={() => setCommunityExplorerStage("test_run")} aria-label="테스트로 돌아가기"><BackArrowIcon /></button>
                      <div className="community-detail-topbar-copy">
                        <strong>테스트 결과</strong>
                        <span>{testProfile.gender} · {testProfile.ageBand} · {testProfile.focus}</span>
                      </div>
                    </div>
                    <article className="community-detail-card community-test-result-card">
                      <div className="community-simple-title-wrap">
                        <span className="community-chip">TOP 5</span>
                        <strong>현재 응답 기준의 성향 요약</strong>
                      </div>
                      <div className="community-test-top-result-grid">
                        {testTopResults.map((item) => (
                          <div key={item.axis} className="community-test-top-result-item">
                            <div className="community-test-top-result-head">
                              <strong>{item.label}</strong>
                              <span>{item.score}%</span>
                            </div>
                            <div className="community-test-progress-bar small"><span style={{ width: `${item.score}%` }} /></div>
                            <p>{item.summary}</p>
                          </div>
                        ))}
                      </div>
                      <div className="community-detail-body">
                        <p>결과는 현재 응답을 바탕으로 한 참고용 리포트입니다. 강한 항목과 약한 항목을 함께 보면서 경계선, 합의 방식, 대화 우선순위를 정리해 보세요.</p>
                      </div>
                      <div className="community-test-result-list">
                        {testResultRows.map((item) => (
                          <div key={`result-${item.axis}`} className="community-test-result-row">
                            <div>
                              <strong>{item.label}</strong>
                              <span>{item.summary}</span>
                            </div>
                            <b>{item.score}%</b>
                          </div>
                        ))}
                      </div>
                      <div className="copy-action-row">
                        <button type="button" onClick={() => setCommunityExplorerStage("test_run")}>응답 수정</button>
                        <button type="button" className="ghost-btn" onClick={resetCommunityTest}>새로 하기</button>
                      </div>
                    </article>
                  </div>
                ) : null}
              </>
            )}
          </section>
        ) : null}

        {showAppTabContent && activeTab === "채팅" ? (
          <section className={`tab-pane fill-pane chat-tab-pane ${chatTab === "질문" ? "chat-question-pane" : ""}`}>
            {chatTab === "질문" ? (
              <div className="chat-question-pane-body">
                <section className="my-question-status-panel">
                  <div className="my-question-status-head">
                    <strong>내 질문 관리</strong>
                    <span>답변이 필요한 질문을 상태별로 확인합니다.</span>
                  </div>
                  <div className="my-question-status-tabs" role="tablist" aria-label="질문 상태 분류">
                    <button type="button" className="active">답변완료 <b>{filteredQuestions.length}</b></button>
                    <button type="button">미답변 <b>2</b></button>
                    <button type="button">거절 <b>1</b></button>
                  </div>
                </section>

                <section className="question-list">
                  {filteredQuestions.map((item) => (
                    <article key={item.id} className="question-feed-card">
                      <div className="question-feed-top">
                        <div>
                          <div className="question-user-line">
                            <span className="community-chip">질문</span>
                            <strong>{item.author}</strong>
                            <span className="community-meta">{item.meta}</span>
                          </div>
                          <div className="question-body">Q. {item.question}</div>
                        </div>
                      </div>
                      <div className="question-answer-box">
                        <span className="product-badge">답변</span>
                        <div className="question-body">{item.answer}</div>
                      </div>
                      <div className="question-footer-actions">
                        <button type="button" className="question-footer-icon-btn" aria-label="좋아요"><span className="question-footer-icon"><HeartIcon /></span><span>{item.likes}</span></button>
                        <button type="button" className="question-footer-icon-btn" aria-label="댓글"><span className="question-footer-icon"><CommentBubbleIcon /></span><span>{item.comments}</span></button>
                        <button type="button" className="question-footer-icon-btn" aria-label="공유"><span className="question-footer-icon"><ShareArrowIcon /></span><span>공유</span></button>
                      </div>
                    </article>
                  ))}
                </section>
              </div>
            ) : (
              activeChatThread ? (
                <div className="x-chat-room-shell">
                  <div className="x-chat-room-topbar">
                    <button type="button" className="header-inline-btn header-icon-btn" aria-label="뒤로가기" onClick={closeActiveChatThread}>
                      <BackArrowIcon />
                    </button>
                    <div className="x-chat-room-profile">
                      <div className="avatar-circle kakao-avatar x-chat-room-avatar"><img src={activeChatThread.avatarUrl ?? buildChatAvatarDataUri(activeChatThread.name)} alt="" loading="lazy" /></div>
                      <div className="x-chat-room-copy">
                        <strong>{activeChatThread.name}</strong>
                        <span>{activeChatThread.purpose}{activeChatThread.status ? ` · ${activeChatThread.status}` : ""}</span>
                      </div>
                    </div>
                    <button type="button" className={`header-inline-btn header-icon-btn ${activeChatThread.favorite ? "active" : ""}`} aria-label="즐겨찾기">
                      <BookmarkIcon filled={!!activeChatThread.favorite} />
                    </button>
                  </div>
                  <div ref={chatMessageListRef} className="x-chat-room-message-list compact-scroll-list">                    {activePinnedMessage ? (
                      <div className="x-chat-room-pinned-banner">
                        <div>
                          <strong>공지</strong>
                          <p>{activePinnedMessage.text}</p>
                        </div>
                        <button type="button" className="ghost-btn" onClick={() => setChatPinnedMessageByThread((prev) => ({ ...prev, [activeChatThread.id]: null }))}>해제</button>
                      </div>
                    ) : null}
                    {chatLongPressHint ? <div className="x-chat-room-floating-hint">{chatLongPressHint}</div> : null}
                    {activeChatMessages.map((message) => {
                      const reactionMeta = message.reaction ? CHAT_REACTION_OPTIONS.find((item) => item.key === message.reaction) ?? null : null;
                      const isSelectionTarget = chatSelectableMessageId === message.id;
                      const messageClock = formatChatMessageClock(message.createdAt);
                      const contentKind = message.contentKind ?? 'text';
                      return (
                        <article
                          key={message.id}
                          className={`x-chat-room-message${message.mine ? " mine" : ""}${message.system ? " system" : ""}`}
                          onContextMenu={(event) => {
                            event.preventDefault();
                            openChatMessageMenu(message);
                          }}
                          onMouseDown={() => startChatMessageHold(message)}
                          onMouseUp={clearChatMessageHold}
                          onMouseLeave={clearChatMessageHold}
                          onTouchStart={() => startChatMessageHold(message)}
                          onTouchEnd={clearChatMessageHold}
                          onTouchCancel={clearChatMessageHold}
                        >
                          {!message.mine && !message.system ? (
                            <div className="x-chat-room-message-head">
                              <button
                                type="button"
                                className="x-chat-room-message-avatar-btn"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  const avatarUrl = activeChatThread.avatarUrl ?? buildChatAvatarDataUri(message.author);
                                  setFeedAvatarPreviewItem({ id: -910 - message.id, author: message.author, title: message.author, caption: activeChatThread.purpose, category: "채팅", likes: 0, comments: 0, type: "image", accent: "neutral", mediaUrl: avatarUrl } as FeedItem);
                                }}
                                aria-label={`${message.author} 프로필 사진 크게 보기`}
                              >
                                <img src={activeChatThread.avatarUrl ?? buildChatAvatarDataUri(message.author)} alt="" loading="lazy" />
                              </button>
                              <button
                                type="button"
                                className="x-chat-room-message-author"
                                onClick={(event) => { event.stopPropagation(); openProfileFromAuthor(message.author); }}
                              >
                                {message.author}
                              </button>
                            </div>
                          ) : null}
                          {message.replyTo ? (
                            <div className="x-chat-room-message-reply-ref">
                              <strong>{message.replyTo.author}</strong>
                              <span>{message.replyTo.text}</span>
                            </div>
                          ) : null}
                          {message.system ? (
                            <>
                              <div className={`x-chat-room-message-bubble${isSelectionTarget ? " selection-enabled" : ""}`}>{message.text}</div>
                              {message.meta ? <div className="x-chat-room-message-meta">{message.meta}</div> : null}
                            </>
                          ) : (
                            <div className={`x-chat-room-message-row${message.mine ? " mine" : ""}`}>
                              <div className={`x-chat-room-message-bubble kind-${contentKind}${isSelectionTarget ? " selection-enabled" : ""}`}>
                                {contentKind === 'emoji' ? <div className="x-chat-room-emoji-content">{message.text}</div> : null}
                                {contentKind === 'sticker' ? (
                                  <div className="x-chat-room-special-card sticker">
                                    <span className="x-chat-room-special-chip">스티커</span>
                                    <strong>{message.text}</strong>
                                    <small>선택한 스티커가 채팅으로 전송되었습니다.</small>
                                  </div>
                                ) : null}
                                {contentKind === 'gif' ? (
                                  <div className="x-chat-room-special-card gif">
                                    <span className="x-chat-room-special-chip">GIF</span>
                                    <strong>{message.text}</strong>
                                    <small>루프 미리보기 대신 이름형 카드로 표시됩니다.</small>
                                  </div>
                                ) : null}
                                {contentKind === 'text' ? message.text : null}
                              </div>
                              <div className="x-chat-room-message-side-meta">
                                <span className="x-chat-room-message-time">{messageClock}</span>
                                {message.edited ? <span className="x-chat-room-message-edited">수정됨</span> : null}
                              </div>
                            </div>
                          )}
                          {reactionMeta ? <div className={`x-chat-room-message-reaction ${reactionMeta.className}`}>{reactionMeta.symbol}</div> : null}
                        </article>
                      );
                    })}
                  </div>
                  <div className="x-chat-room-composer-wrap">
                    {chatSelectableMessageId !== null ? (
                      <div className="x-chat-room-context-strip selection-mode">
                        <div>
                          <strong>선택 복사</strong>
                          <span>{chatCopiedSelection ? `복사됨: ${chatCopiedSelection}` : '메시지를 드래그해 일부 텍스트를 선택한 뒤 복사하세요.'}</span>
                        </div>
                        <div className="x-chat-room-context-actions">
                          <button type="button" className="ghost-btn" onClick={copySelectedChatText}>선택영역 복사</button>
                          <button type="button" className="ghost-btn" onClick={() => { setChatSelectableMessageId(null); setChatCopiedSelection(''); }}>취소</button>
                        </div>
                      </div>
                    ) : null}
                    {chatReplyTarget ? (
                      <div className="x-chat-room-context-strip">
                        <div>
                          <strong>{chatReplyTarget.author}에게 답장</strong>
                          <span>{chatReplyTarget.text}</span>
                        </div>
                        <button type="button" className="ghost-btn" onClick={() => setChatReplyTarget(null)}>닫기</button>
                      </div>
                    ) : null}
                    {chatEditableMessageId !== null ? (
                      <div className="x-chat-room-context-strip edit-mode">
                        <div>
                          <strong>메시지 수정</strong>
                          <span>보낸 뒤 1시간 이내 메시지만 수정할 수 있습니다.</span>
                        </div>
                        <button type="button" className="ghost-btn" onClick={() => { setChatEditableMessageId(null); setChatRoomDraft(''); }}>취소</button>
                      </div>
                    ) : null}
                    <div className="x-chat-room-composer">
                      <button type="button" className="x-chat-room-plus-btn" aria-label="더보기" onClick={() => {
                        setChatEmojiSheetOpen(false);
                        setChatAttachmentSheetOpen((prev) => !prev);
                      }}>+</button>
                      <div className="x-chat-room-input-shell">
                        <input value={chatRoomDraft} onChange={(event) => setChatRoomDraft(event.target.value)} placeholder="메시지를 입력하세요" onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            submitChatRoomMessage();
                          }
                        }} />
                        <button type="button" className="x-chat-room-emoji-toggle" aria-label="이모티콘 열기" onClick={() => {
                          setChatAttachmentSheetOpen(false);
                          setChatEmojiSheetOpen((prev) => !prev);
                        }}>☺</button>
                      </div>
                      <button type="button" className="ghost-btn x-chat-room-send-btn" onClick={submitChatRoomMessage}>발송</button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {chatDiscoveryOpen ? (
                    <div className="chat-toolbar kakao-toolbar compact-only-toolbar chat-discovery-topbar">
                      <button
                        type="button"
                        className="header-inline-btn header-icon-btn chat-discovery-back-btn"
                        onClick={() => { setChatDiscoveryOpen(false); setChatListMode('threads'); }}
                        aria-label="채팅 목록으로 돌아가기"
                      >
                        <BackArrowIcon />
                      </button>
                      <div className="chat-category-scroll chat-discovery-tab-scroll" role="tablist" aria-label="채팅 상대 추천 분류">
                        {chatDiscoveryCategories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            className={`category-chip ${chatDiscoveryCategory === category ? "active" : ""}`}
                            onClick={() => setChatDiscoveryCategory(category)}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="chat-toolbar kakao-toolbar compact-only-toolbar chat-toolbar-with-request">
                      <button
                        type="button"
                        className={`chat-request-toggle ${chatListMode === 'requests' ? 'active' : ''}`}
                        onClick={() => { setChatDiscoveryOpen(false); setChatListMode('requests'); }}
                      >
                        요청
                        {chatRequestItems.length ? <b>{chatRequestItems.length}</b> : null}
                      </button>
                      <div className="chat-category-scroll">
                        {chatCategories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            className={`category-chip ${chatListMode === 'threads' && chatCategory === category ? "active" : ""}`}
                            onClick={() => {
                              setChatListMode('threads');
                              setChatDiscoveryOpen(false);
                              setChatCategory(category);
                            }}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatDiscoveryOpen ? (
                    <div className="chat-discovery-screen">
                      <div className="chat-discovery-list compact-scroll-list">
                        {chatDiscoveryCandidates.length ? chatDiscoveryCandidates.map((candidate) => (
                          <article key={candidate.id} className="chat-discovery-row">
                            <button
                              type="button"
                              className={`avatar-circle kakao-avatar chat-discovery-avatar${candidate.avatarUrl ? "" : " anonymous-chat-avatar"}`}
                              onClick={() => openProfileFromAuthor(candidate.name)}
                              aria-label={`${candidate.name} 프로필 보기`}
                            >
                              {candidate.avatarUrl ? <img src={candidate.avatarUrl} alt="" loading="lazy" /> : <span className="chat-discovery-anon-profile" aria-hidden="true" />}
                            </button>
                            <div className="chat-discovery-copy">
                              <div className="chat-discovery-head">
                                <button type="button" className="chat-discovery-name" onClick={() => openProfileFromAuthor(candidate.name)}>{candidate.name}</button>
                                <span className={`chat-discovery-kind kind-${candidate.kind}`}>{candidate.kind}</span>
                                <button type="button" className="chat-discovery-request-btn" onClick={() => requestChatFromDiscoveryCandidate(candidate)}>채팅신청</button>
                              </div>
                              <p>{candidate.description}</p>
                            </div>
                          </article>
                        )) : (
                          <div className="legacy-box compact chat-discovery-empty-box">
                            <strong>표시할 추천 계정이 없습니다.</strong>
                            <p>피드, 쇼츠, 소통 게시글, 질문 활동이 쌓이면 최근 목록에 계정이 표시됩니다.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : chatListMode === 'requests' ? (
                    <div className="chat-request-pane compact-scroll-list">
                      {!chatRequestItems.length ? (
                        <div className="legacy-box compact chat-request-empty-box">
                          <strong>받은 채팅 요청이 없습니다.</strong>
                          <p>요청 목록에서 상대를 선택한 뒤, 채팅방에서 첫 메시지를 보내면 일반 채팅으로 전환됩니다.</p>
                        </div>
                      ) : null}
                      <div className="chat-request-list">
                        {chatRequestItems.map((request) => (
                          <article
                            key={request.id}
                            className="chat-request-row"
                            onClick={() => openIncomingChatRequest(request)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                openIncomingChatRequest(request);
                              }
                            }}
                          >
                            <button
                              type="button"
                              className={`avatar-circle kakao-avatar chat-request-profile-trigger${request.avatarUrl ? "" : " anonymous-chat-avatar"}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                openProfileFromAuthor(request.name);
                              }}
                              aria-label={`${request.name} 프로필 보기`}
                            >
                              {request.avatarUrl ? <img src={request.avatarUrl} alt="" loading="lazy" /> : <span className="chat-discovery-anon-profile" aria-hidden="true" />}
                            </button>
                            <div className="chat-request-copy">
                              <div className="chat-request-copy-head">
                                <button
                                  type="button"
                                  className="chat-request-name-link"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openProfileFromAuthor(request.name);
                                  }}
                                >
                                  {request.name}
                                </button>
                                <span>{request.time}</span>
                              </div>
                              <div className="chat-request-message-row">
                                <p>{request.requestText}</p>
                                <button
                                  type="button"
                                  className="ghost-btn chat-request-chat-btn"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openIncomingChatRequest(request);
                                  }}
                                >
                                  채팅
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="chat-list compact-scroll-list kakao-chat-list" onScroll={handleChatListScroll}>
                      {chatDisplayRows.map((thread, index) => thread ? (
                        <article key={thread.id} className="chat-row kakao-chat-row chat-row-openable" onClick={() => openChatThread(thread)} role="button" tabIndex={0} onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openChatThread(thread);
                          }
                        }}>
                          <div className={`avatar-circle kakao-avatar${thread.avatarUrl ? "" : " anonymous-chat-avatar"}`}>{thread.avatarUrl ? <img src={thread.avatarUrl} alt="" loading="lazy" /> : <span className="chat-discovery-anon-profile" aria-hidden="true" />}</div>
                          <div className="chat-copy kakao-chat-copy">
                            <div className="kakao-chat-head">
                              <strong>{thread.name}</strong>
                              <div className="kakao-chat-badges">
                                <span>{thread.purpose}</span>
                                {thread.status ? <em>{thread.status}</em> : null}
                              </div>
                            </div>
                            <p>{thread.preview}</p>{thread.purpose.includes("상호수락 1:1") ? <span className="muted-mini">외부 연락처 교환 금지 · 사진/영상 전송 금지 · 반복 접촉 금지</span> : null}
                          </div>
                          <div className="chat-meta kakao-chat-meta">
                            <span>{thread.time}</span>
                            {thread.unread > 0 ? <b>{thread.unread}</b> : null}
                          </div>
                        </article>
                      ) : (
                        <article key={`chat-empty-${chatCategory}-${index}`} className="chat-row kakao-chat-row kakao-chat-row-empty" aria-hidden="true">
                          <div className="avatar-circle kakao-avatar" />
                          <div className="chat-copy kakao-chat-copy">
                            <div className="kakao-chat-head">
                              <strong>{" "}</strong>
                              <div className="kakao-chat-badges"><span>{" "}</span></div>
                            </div>
                            <p>{" "}</p>
                          </div>
                          <div className="chat-meta kakao-chat-meta"><span>{" "}</span></div>
                        </article>
                      ))}
                      {pagedThreads.length < filteredThreads.length ? <div className="chat-loading-row">채팅 기록 10개 단위로 추가 로딩 중</div> : null}
                    </div>
                  )}
                </>
              )
            )}
          </section>
        ) : null}

                {showAppTabContent && activeTab === "프로필" ? (
          <section className={`tab-pane fill-pane profile-pane-instagram${currentProfileMeta.isOwner ? "" : " external-profile-pane"}`}>
            {!currentProfileMeta.isOwner ? (
              <button type="button" className="profile-external-back-btn" onClick={() => { setActiveTab("채팅"); setChatTab("채팅"); setChatListMode("requests"); setViewedProfileAuthor(null); }} aria-label="채팅 요청으로 돌아가기"><BackArrowIcon /></button>
            ) : null}
            <div className="profile-ig-shell compact-scroll-list" onScroll={handleProfileShellScroll}>
              <div className="profile-ig-header">
                <div className="profile-ig-avatar-wrap">
                  {currentProfileMeta.isOwner && profileEditMode ? (
                    <>
                      <button
                        type="button"
                        className={`profile-ig-avatar profile-ig-avatar-edit-trigger ${profileEditDraft.avatarUrl ? "has-image" : ""}`}
                        onClick={() => profileAvatarInputRef.current?.click()}
                        aria-label="프로필 사진 변경"
                      >
                        {profileEditDraft.avatarUrl ? <img src={profileEditDraft.avatarUrl} alt="프로필" loading="lazy" /> : <span>{(profileEditDraft.displayName.trim() || currentProfileMeta.name).slice(0, 1).toUpperCase()}</span>}
                      </button>
                      <input ref={profileAvatarInputRef} type="file" accept="image/*" className="sr-only" onChange={handleProfileAvatarFileChange} />
                    </>
                  ) : (
                    <button type="button" className={`profile-ig-avatar profile-avatar-preview-trigger ${currentProfileMeta.avatarUrl ? "has-image" : "anonymous-profile-icon"}`} onClick={() => setFeedAvatarPreviewItem({ id: -900, author: currentProfileMeta.name, title: currentProfileMeta.name, caption: currentProfileMeta.bio, category: "프로필", likes: 0, comments: 0, type: "image", accent: "neutral" } as FeedItem)} aria-label="프로필 사진 크게 보기">
                      {currentProfileMeta.avatarUrl ? <img src={currentProfileMeta.avatarUrl} alt="프로필" loading="lazy" /> : null}
                    </button>
                  )}
                </div>
                <div className="profile-ig-main">
                  <div className="profile-ig-topline">
                    {currentProfileMeta.isOwner && profileEditMode ? (
                      <input
                        className="profile-ig-edit-input profile-ig-edit-username"
                        value={profileEditDraft.displayName}
                        onChange={(event) => {
                          if (!profileNicknameEditUnlocked) return;
                          setProfileEditDraft((prev) => ({ ...prev, displayName: event.target.value }));
                        }}
                        onClick={handleProfileNicknameEditUnlock}
                        onFocus={handleProfileNicknameEditUnlock}
                        placeholder="표시 이름"
                        readOnly={!profileNicknameEditUnlocked}
                      />
                    ) : (
                      <strong className="profile-ig-username">{currentProfileMeta.name}</strong>
                    )}
                    {currentProfileMeta.isOwner ? (
                      profileEditMode ? (
                        <div className="profile-inline-actions profile-inline-actions-edit">
                          <button type="button" className="ghost-btn profile-ig-mini-btn" onClick={cancelProfileEditMode}>취소</button>
                          <button type="button" className="feed-follow-btn profile-follow-btn active" onClick={saveProfileEditMode}>저장</button>
                        </div>
                      ) : (
                        <div className="profile-ig-stats profile-ig-stats-inline" aria-label="프로필 팔로워 팔로잉 수">
                          <button type="button" className="profile-ig-stat-button" onClick={() => openProfileFollowList("팔로워")}><b>{currentProfileMeta.followerCount.toLocaleString()}</b><span>팔로워</span></button>
                          <button type="button" className="profile-ig-stat-button" onClick={() => openProfileFollowList("팔로잉")}><b>{currentProfileMeta.followingCount.toLocaleString()}</b><span>팔로잉</span></button>
                        </div>
                      )
                    ) : (
                      <div className="asked-question-toolbar asked-question-toolbar-inline profile-inline-actions profile-text-action-row">
                        <button type="button" className="profile-text-action-btn" onClick={openProfileChatRequest}>채팅</button>
                        <button type="button" className={`profile-text-action-btn ${followedFeedAuthors.includes(currentProfileMeta.name) ? "active" : ""}`} onClick={() => toggleFollowedFeedAuthor(currentProfileMeta.name)}>{followedFeedAuthors.includes(currentProfileMeta.name) ? "팔로잉" : "팔로우"}</button>
                        <button type="button" className="profile-text-action-btn">공유</button>
                      </div>
                    )}
                  </div>
                  {(!currentProfileMeta.isOwner || profileEditMode) ? (
                    <div className="profile-ig-stats profile-ig-stats-follow-only">
                      <button type="button" className="profile-ig-stat-button" onClick={() => openProfileFollowList("팔로워")}><b>{currentProfileMeta.followerCount.toLocaleString()}</b><span>팔로워</span></button>
                      <button type="button" className="profile-ig-stat-button" onClick={() => openProfileFollowList("팔로잉")}><b>{currentProfileMeta.followingCount.toLocaleString()}</b><span>팔로잉</span></button>
                    </div>
                  ) : null}
                  <div className="profile-ig-bio">
                    {currentProfileMeta.isOwner && profileEditMode ? (
                      <>
                        <textarea
                          className="profile-ig-edit-textarea"
                          value={profileEditDraft.bio}
                          onChange={(event) => setProfileEditDraft((prev) => ({ ...prev, bio: event.target.value }))}
                          placeholder="자기소개를 작성하세요"
                          rows={4}
                        />
                        <input
                          className="profile-ig-edit-input"
                          value={profileEditDraft.hashtags}
                          onChange={(event) => setProfileEditDraft((prev) => ({ ...prev, hashtags: normalizeProfileKeywordTags(event.target.value).join(" ") }))}
                          placeholder="태그입력(최대20개)"
                        />
                      </>
                    ) : (
                      <>
                        <p>{currentProfileMeta.bio}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {profileFollowListMode ? (
                <div className="profile-follow-list-screen">
                  <div className="profile-ig-tabbar profile-follow-tabbar" aria-label="팔로잉 팔로워 목록">
                    <button type="button" className={profileFollowListMode === "팔로잉" ? "active" : ""} onClick={() => setProfileFollowListMode("팔로잉")}>팔로잉</button>
                    <button type="button" className={profileFollowListMode === "팔로워" ? "active" : ""} onClick={() => setProfileFollowListMode("팔로워")}>팔로워</button>
                  </div>
                  <div className="profile-follow-list compact-scroll-list">
                    {profileFollowAccounts.length ? profileFollowAccounts.map((account) => (
                      <button type="button" key={`${profileFollowListMode}-${account.id}`} className="profile-follow-list-item" onClick={() => openProfileFollowAccount(account.name)}>
                        <span className="profile-follow-avatar">{account.name.slice(0, 1).toUpperCase()}</span>
                        <span className="profile-follow-body">
                          <strong>{account.name}</strong>
                          <small>{account.role} · {account.topic}</small>
                        </span>
                        <span className="profile-follow-open">프로필</span>
                      </button>
                    )) : (
                      <div className="profile-follow-empty">표시할 {profileFollowListMode} 계정이 없습니다.</div>
                    )}
                  </div>
                </div>
              ) : (
                <>
              <div className="profile-ig-tabbar profile-ig-action-grid" aria-label="프로필 바로가기">
                <button type="button" className={profileSection === "게시물" ? "active" : ""} onClick={() => setProfileSection("게시물")}><span>피드</span><small>{allFeedItems.filter((item) => item.type === "image" && currentProfileAuthorAliases.includes(item.author)).length}</small></button>
                <button type="button" className={profileSection === "쇼츠" ? "active" : ""} onClick={() => setProfileSection("쇼츠")}><span>쇼츠</span><small>{profileShortItems.length}</small></button>
                <button type="button" className={profileSection === "사진" ? "active" : ""} onClick={() => setProfileSection("사진")}><span>사진</span><small>{allFeedItems.filter((item) => item.type === "image" && currentProfileAuthorAliases.includes(item.author)).length}</small></button>
                <button type="button" className={profileSection === "상품보기" ? "active" : ""} onClick={() => setProfileSection("상품보기")}><span>상품</span><small>{currentProfileProducts.length}</small></button>
                <button type="button" className={profileSection === "질문" ? "active" : ""} onClick={() => setProfileSection("질문")}><span>질문</span><small>{questionSeed.length}</small></button>
                <button type="button" className={profileSection === "태그됨" ? "active" : ""} onClick={() => setProfileSection("태그됨")}><span>태그</span><small>{allFeedItems.filter((item) => item.type === "image").slice(12, 21).length}</small></button>
              </div>

              {profileSection === "게시물" ? (
                <div className="profile-ig-grid">
                  {allFeedItems.filter((item) => item.type === "image" && currentProfileAuthorAliases.includes(item.author)).slice(0, 12).map((item) => (
                    <article key={item.id} className={`profile-ig-tile ${item.accent}`}>
                      <div className="profile-ig-tile-media">
                        <span>{item.category}</span>
                      </div>
                      <div className="profile-ig-tile-meta">
                        <strong>{item.title}</strong>
                        <span>♥ {item.likes} · 💬 {item.comments}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              {profileSection === "질문" ? (
                <div className="question-list profile-question-list">
                  {questionSeed.map((item) => (
                    <article key={`profile-question-${item.id}`} className="question-feed-card">
                      <div className="question-feed-top">
                        <div>
                          <div className="question-user-line">
                            <span className="community-chip">질문</span>
                            <button type="button" className="feed-author-link" onClick={() => openProfileFromAuthor(currentProfileAuthor)}>{currentProfileMeta.name}</button>
                            <span className="community-meta">{item.meta}</span>
                          </div>
                          <div className="question-body">Q. {item.question}</div>
                        </div>
                      </div>
                      <div className="question-answer-box">
                        <span className="product-badge">답변</span>
                        <div className="question-body">{item.answer}</div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              {profileSection === "쇼츠" ? (
                <div className="profile-ig-grid profile-ig-grid-shorts">
                  {pagedProfileShorts.length ? pagedProfileShorts.map((item) => (
                    <ShortsListCard
                      key={`profile-short-${item.id}`}
                      item={item}
                      onOpenMore={setShortsMoreItem}
                      onOpenViewer={openShortsViewer}
                    />
                  )) : <div className="legacy-box compact"><p>올린 쇼츠가 없습니다.</p></div>}
                  {pagedProfileShorts.length < profileShortItems.length ? <div className="shorts-loading-row">쇼츠 10개 단위로 추가 로딩 중</div> : null}
                </div>
              ) : null}

              {profileSection === "사진" ? (
                <div className="profile-ig-grid profile-photo-grid">
                  {allFeedItems.filter((item) => item.type === "image" && currentProfileAuthorAliases.includes(item.author)).slice(0, 15).map((item) => (
                    <article key={`profile-photo-${item.id}`} className={`profile-ig-tile ${item.accent}`}>
                      <div className="profile-ig-tile-media profile-photo-tile-media">
                        {item.mediaUrl ? <img src={item.mediaUrl} alt={item.title} loading="lazy" /> : <span>사진</span>}
                      </div>
                      <div className="profile-ig-tile-meta">
                        <strong>{item.title}</strong>
                        <span>{item.postedAt ?? "오늘"} · ♥ {item.likes}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              {profileSection === "태그됨" ? (
                <div className="profile-ig-grid">
                  {allFeedItems.filter((item) => item.type === "image").slice(12, 21).map((item) => (
                    <article key={`tagged-${item.id}`} className={`profile-ig-tile ${item.accent}`}>
                      <div className="profile-ig-tile-media">
                        <span>태그됨</span>
                      </div>
                      <div className="profile-ig-tile-meta">
                        <strong>{item.title}</strong>
                        <span>@{currentProfileMeta.name} · {item.postedAt ?? "오늘"}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              {profileSection === "상품보기" ? (
                <div className="profile-ig-grid">
                  {currentProfileProducts.map((product, index) => (
                    <article key={`profile-product-${product.id}-${index}`} className={`profile-ig-tile profile-product-tile ${(index % 4 === 0) ? "sunrise" : (index % 4 === 1) ? "violet" : (index % 4 === 2) ? "teal" : "rose"}`}>
                      <div className="profile-ig-tile-media profile-product-tile-media">
                        <span>{product.badge}</span>
                      </div>
                      <div className="profile-ig-tile-meta">
                        <strong>{product.name}</strong>
                        <span>판매 {(product.orderCount ?? 0).toLocaleString()} · 리뷰 {(product.reviewCount ?? 0).toLocaleString()}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

                </>
              )}

              {profileSection === "쇼츠" && shortsViewerItemId !== null && profileShortItems.length ? (
                <ShortsViewer
                  items={profileShortItems}
                  initialIndex={profileShortsViewerInitialIndex}
                  onClose={() => setShortsViewerItemId(null)}
                  onOpenMore={setShortsMoreItem}
                  getKeywordTags={getContentKeywordTags}
                  onOpenAuthorProfile={openProfileFromAuthor}
                  onPreviewAuthorAvatar={openFeedAvatarPreview}
                  followedAuthors={followedFeedAuthors}
                  onToggleFollow={toggleFollowedFeedAuthor}
                />
              ) : null}
            </div>
          </section>
        ) : null}

      </main>

      {inspectedElement ? (
        <section className="overlay-card html-inspector-modal" style={inspectedElement.modalStyle}>
          <div className="overlay-head">
            <strong>HTML 요소 복사</strong>
            <button className="ghost-btn" onClick={() => { if (inspectedTargetRef.current) { inspectedTargetRef.current.classList.remove("html-inspector-target"); inspectedTargetRef.current = null; } setInspectedElement(null); }}>닫기</button>
          </div>
          <div className="stack-gap html-inspector-body">
            <div className="legacy-box compact">
              <div className="simple-list-row"><b>selector</b><span>{inspectedElement.selector}</span></div>
              <div className="simple-list-row"><b>tag</b><span>{inspectedElement.tagName}</span></div>
              <div className="simple-list-row"><b>id</b><span>{inspectedElement.id}</span></div>
              <div className="simple-list-row"><b>class</b><span>{inspectedElement.className}</span></div>
              <div className="simple-list-row"><b>text</b><span>{inspectedElement.text}</span></div>
            </div>
            <div className="copy-action-row">
              <button className="ghost-btn" onClick={() => copyToClipboard(inspectedElement.selector)}>selector 복사</button>
              <button className="ghost-btn" onClick={() => copyToClipboard(inspectedElement.cssText)}>style 복사</button>
              <button className="ghost-btn" onClick={() => copyToClipboard(inspectedElement.html)}>html 복사</button>
            </div>
            <div className="legacy-box compact">
              <h3>핵심 스타일</h3>
              <pre>{inspectedElement.cssText}</pre>
            </div>
            <div className="legacy-box compact">
              <h3>선택 요소 HTML</h3>
              <pre>{inspectedElement.html}</pre>
            </div>
          </div>
        </section>
      ) : null}

      {chatAttachmentSheetOpen && activeChatThread ? (
        <div className="chat-sheet-backdrop" onClick={() => setChatAttachmentSheetOpen(false)}>
          <div className="chat-action-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="shorts-sheet-handle" />
            <div className="chat-action-sheet-header">
              <strong>더보기</strong>
              <span>사진첨부 · 지도공유 · 파일첨부 · 프로필공유</span>
            </div>
            <div className="chat-action-grid">
              {CHAT_QUICK_SHARE_ITEMS.map((item) => (
                <button key={item.key} type="button" className="chat-action-grid-btn" onClick={() => handleChatQuickShareAction(item.label)}>
                  <span className="chat-action-grid-icon" aria-hidden="true">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {chatEmojiSheetOpen && activeChatThread ? (
        <div className="chat-sheet-backdrop" onClick={() => setChatEmojiSheetOpen(false)}>
          <div className="chat-emoji-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="shorts-sheet-handle" />
            <div className="chat-emoji-primary-row">
              <div className="chat-emoji-tab-row">
                {CHAT_PICKER_TABS.map((tab) => (
                  <button key={tab} type="button" className={`chat-emoji-mode-btn ${chatEmojiMode === tab ? 'active' : ''}`} onClick={() => setChatEmojiMode(tab)}>{tab}</button>
                ))}
              </div>
              <div className="chat-emoji-search-row">
                <input value={chatEmojiKeyword} onChange={(event) => setChatEmojiKeyword(event.target.value)} placeholder="검색어 입력 텍스트칸" />
                <button type="button" className="ghost-btn" onClick={handleChatEmojiSearch}>검색</button>
                <button type="button" className="ghost-btn" onClick={handleChatEmojiStoreOpen}>상점</button>
              </div>
            </div>
            <div className="chat-emoji-collection-row">
              {chatPickerCollections.map((collection) => (
                <button key={collection.key} type="button" className={`chat-emoji-collection-btn ${chatEmojiCollectionKey === collection.key ? 'active' : ''}`} onClick={() => setChatEmojiCollectionKey(collection.key)}>{collection.label}</button>
              ))}
            </div>
            <div className={`chat-emoji-grid mode-${chatEmojiMode === '이모티콘' ? 'emoji' : chatEmojiMode === '스티커' ? 'sticker' : 'gif'} compact-scroll-list`}>
              {chatPickerItems.length ? chatPickerItems.map((item) => (
                <button key={`${chatEmojiMode}-${item}`} type="button" className={`chat-emoji-item ${chatEmojiMode === '이모티콘' ? 'emoji' : chatEmojiMode === '스티커' ? 'sticker' : 'gif'}`} onClick={() => handleChatPickerSelect(item)}>
                  {chatEmojiMode === '이모티콘' ? <span className="chat-emoji-item-symbol">{item}</span> : null}
                  {chatEmojiMode === '스티커' ? <span className="chat-emoji-item-sticker-mark">🧸</span> : null}
                  {chatEmojiMode === 'GIF' ? <span className="chat-emoji-item-gif-mark">GIF</span> : null}
                  <strong>{item}</strong>
                  <small>{chatEmojiMode === '이모티콘' ? '4열 무한 스크롤' : chatEmojiMode === '스티커' ? '3열 무한 스크롤' : '2열 무한 스크롤'}</small>
                </button>
              )) : <div className="chat-emoji-empty-state">선택한 조건에 맞는 {chatEmojiMode} 항목이 없습니다.</div>}
            </div>
          </div>
        </div>
      ) : null}

      {chatContextMessage ? (
        <div className="modal-backdrop" onClick={() => setChatContextMessage(null)}>
          <div className="modal-card chat-message-modal" onClick={(event) => event.stopPropagation()}>
            <div className="chat-message-emoji-row">
              {CHAT_REACTION_OPTIONS.map((item) => (
                <button key={item.key} type="button" className={`chat-message-emoji-btn ${item.className}`} onClick={() => applyChatReaction(chatContextMessage, item.key)} aria-label={item.label}>
                  {item.symbol}
                </button>
              ))}
            </div>
            <div className="chat-message-menu-list">
              <button type="button" className="chat-message-menu-btn" onClick={() => copyChatMessage(chatContextMessage)}>복사</button>
              <button type="button" className="chat-message-menu-btn" onClick={() => enableChatSelectionCopy(chatContextMessage)}>선택 복사</button>
              <button type="button" className="chat-message-menu-btn" onClick={() => replyChatMessage(chatContextMessage)}>답장</button>
              <button type="button" className="chat-message-menu-btn" onClick={() => openChatShareSheet(chatContextMessage)}>공유</button>
              <button type="button" className="chat-message-menu-btn" onClick={() => pinChatMessage(chatContextMessage)}>공지</button>
              <button type="button" className="chat-message-menu-btn" onClick={() => startChatEdit(chatContextMessage)} disabled={!canManageChatMessage(chatContextMessage)}>수정</button>
              <button type="button" className="chat-message-menu-btn danger" onClick={() => deleteChatMessage(chatContextMessage)} disabled={!canManageChatMessage(chatContextMessage)}>삭제</button>
            </div>
          </div>
        </div>
      ) : null}

      {chatShareMessage ? (
        <div className="chat-sheet-backdrop" onClick={() => setChatShareMessage(null)}>
          <div className="chat-share-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="shorts-sheet-handle" />
            <div className="chat-action-sheet-header">
              <strong>다른 채팅방으로 공유</strong>
              <span>최근 채팅방을 검색하고 링크도 복사할 수 있습니다.</span>
            </div>
            <div className="chat-share-toolbar">
              <input value={chatShareKeyword} onChange={(event) => setChatShareKeyword(event.target.value)} placeholder="최근 채팅방 검색" />
              <button type="button" className="ghost-btn" onClick={copyChatShareLink}>링크 복사</button>
            </div>
            <div className="chat-share-list compact-scroll-list">
              {filteredChatShareTargets.map((thread) => (
                <button key={thread.id} type="button" className="chat-share-row" onClick={() => shareChatMessageToThread(thread)}>
                  <div className="avatar-circle kakao-avatar"><img src={thread.avatarUrl ?? buildChatAvatarDataUri(thread.name)} alt="" loading="lazy" /></div>
                  <div className="chat-share-copy">
                    <strong>{thread.name}</strong>
                    <span>{thread.purpose} · {thread.preview}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

              {shortsMoreItem ? (
          <div className="shorts-sheet-backdrop" onClick={() => setShortsMoreItem(null)}>
            <div className="shorts-sheet" onClick={(event) => event.stopPropagation()}>
              <div className="shorts-sheet-handle" />
              <div className="shorts-sheet-header">
                <strong>{shortsMoreItem.title}</strong>
                <span>{shortsMoreItem.author}</span>
              </div>
              <div className="shorts-sheet-actions">
                {(["공유", "보관함저장", "관심없음", "채널 추천 안함", "신고"] as ShortOption[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="shorts-sheet-btn"
                    onClick={() => {
                      if (option === "보관함저장") toggleSavedFeed(shortsMoreItem.id);
                      setShortsMoreItem(null);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

{adultPromptOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card adult-auth-modal">
            <div className="modal-header-row">
              <strong>성인 인증 필요</strong>
              <button className="ghost-btn" onClick={() => setAdultPromptOpen(false)}>닫기</button>
            </div>
            <div className="stack-gap">
              <div className="legacy-box compact">
                <p>이 기능은 성인 인증 후 이용할 수 있습니다.</p>
                <p>청소년은 이용할 수 없습니다.</p>
                <p>본인확인 결과에 따라 이용이 제한될 수 있습니다.</p>
              </div>
              <div className="copy-action-row">
                <button type="button" onClick={() => attemptAdultVerification("success")}>PASS/휴대폰 인증 완료</button>
                <button type="button" className="ghost-btn" onClick={() => attemptAdultVerification("fail")}>인증 실패</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}


      {backMinimizeHintVisible ? (
        <div className="app-back-hint-toast" role="status" aria-live="polite">뒤로가기 버튼을 한 번 더 누르면 앱이 최소화됩니다.</div>
      ) : null}

      {listEndToast ? (
        <div className="app-back-hint-toast app-list-end-toast" role="status" aria-live="polite">{listEndToast}</div>
      ) : null}

      {showAppTabContent && activeTab === "프로필" && currentProfileMeta.isOwner && profileTab === "내정보" && !profileEditMode && !profileFollowListMode ? (
        <>
          {profilePhotoLauncherOpen ? <button type="button" className="feed-create-backdrop" aria-label="프로필 사진 메뉴 닫기" onClick={() => setProfilePhotoLauncherOpen(false)} /> : null}
          <input ref={profileAvatarInputRef} type="file" accept="image/*" className="sr-only" onChange={handleProfileAvatarFileChange} />
          <div className={`feed-create-dock profile-photo-create-dock${profilePhotoLauncherOpen ? " open" : ""}`}>
            {profilePhotoLauncherOpen ? (
              <div className="feed-create-options" aria-hidden={false}>
                <button type="button" className="feed-create-option" onClick={() => {
                  setProfilePhotoLauncherOpen(false);
                  openProfileEditMode();
                }}>
                  <span className="feed-create-option-label">프로필편집</span>
                  <span className="feed-create-option-icon" aria-hidden="true"><PhotoImageIcon /></span>
                </button>
              </div>
            ) : null}
            <button type="button" className={`feed-create-fab${profilePhotoLauncherOpen ? " open" : ""}`} onClick={() => setProfilePhotoLauncherOpen((prev) => !prev)} aria-label={profilePhotoLauncherOpen ? "프로필 사진 메뉴 닫기" : "프로필 사진 메뉴 열기"}>
              <span className="feed-create-fab-icon"><PlusIcon /></span>
            </button>
          </div>
        </>
      ) : null}

      {showAppTabContent && activeTab === "쇼핑" && shoppingTab === "홈" ? (
        <>
          {shopCreateLauncherOpen ? <button type="button" className="feed-create-backdrop" aria-label="쇼핑 등록 메뉴 닫기" onClick={() => setShopCreateLauncherOpen(false)} /> : null}
          <div className={`feed-create-dock shop-create-dock${shopCreateLauncherOpen ? " open" : ""}`}>
            {shopCreateLauncherOpen ? (
              <div className="feed-create-options" aria-hidden={false}>
                <button type="button" className="feed-create-option" onClick={() => { setShopCreateLauncherOpen(false); openProductRegistrationTab(); }}>
                  <span className="feed-create-option-label">상품등록</span>
                  <span className="feed-create-option-icon" aria-hidden="true"><ShoppingBagIcon /></span>
                </button>
                <button type="button" className="feed-create-option" onClick={() => { setShopCreateLauncherOpen(false); openGeneralTradeRegistrationTab(); }}>
                  <span className="feed-create-option-label">일반거래</span>
                  <span className="feed-create-option-icon" aria-hidden="true"><PaperDocumentIcon /></span>
                </button>
              </div>
            ) : null}
            <button type="button" className={`feed-create-fab${shopCreateLauncherOpen ? " open" : ""}`} onClick={() => setShopCreateLauncherOpen((prev) => !prev)} aria-label={shopCreateLauncherOpen ? "상품등록 메뉴 닫기" : "상품등록 메뉴 열기"}>
              <span className="feed-create-fab-icon"><PlusIcon /></span>
            </button>
          </div>
        </>
      ) : null}

      {showAppTabContent && activeTab === "채팅" && chatTab === "채팅" && !activeChatThread ? (
        <>
          {chatCreateLauncherOpen ? <button type="button" className="feed-create-backdrop" aria-label="채팅 생성 메뉴 닫기" onClick={() => setChatCreateLauncherOpen(false)} /> : null}
          <div className={`feed-create-dock chat-create-dock${chatCreateLauncherOpen ? " open" : ""}`}>
            {chatCreateLauncherOpen ? (
              <div className="feed-create-options" aria-hidden={false}>
                <button type="button" className="feed-create-option" onClick={() => {
                  setChatCreateLauncherOpen(false);
                  setChatDiscoveryOpen(false);
                  setChatListMode('threads');
                  setChatTab('채팅');
                }}>
                  <span className="feed-create-option-label">채팅목록</span>
                  <span className="feed-create-option-icon" aria-hidden="true"><ChatIcon /></span>
                </button>
                <button type="button" className="feed-create-option" onClick={() => {
                  setChatCreateLauncherOpen(false);
                  setChatDiscoveryOpen(false);
                  setChatTab('질문');
                }}>
                  <span className="feed-create-option-label">질문하기</span>
                  <span className="feed-create-option-icon" aria-hidden="true"><CommentBubbleIcon /></span>
                </button>
                <button type="button" className="feed-create-option" onClick={() => {
                  setChatCreateLauncherOpen(false);
                  setChatDiscoveryOpen(true);
                  setChatListMode('threads');
                  setChatTab('채팅');
                }}>
                  <span className="feed-create-option-label">채팅하기</span>
                  <span className="feed-create-option-icon" aria-hidden="true"><ChatIcon /></span>
                </button>
              </div>
            ) : null}
            <button type="button" className={`feed-create-fab${chatCreateLauncherOpen ? " open" : ""}`} onClick={() => setChatCreateLauncherOpen((prev) => !prev)} aria-label={chatCreateLauncherOpen ? "채팅 생성 메뉴 닫기" : "채팅 생성 메뉴 열기"}>
              <span className="feed-create-fab-icon"><PlusIcon /></span>
            </button>
          </div>
        </>
      ) : null}

      {showAppTabContent && activeTab === "소통" && !activeForumRoom && communityExplorerStage === "list" ? (
        <>
          {communityCreateLauncherOpen ? <button type="button" className="feed-create-backdrop" aria-label="소통 작성 메뉴 닫기" onClick={() => setCommunityCreateLauncherOpen(false)} /> : null}
          <div className={`feed-create-dock community-create-dock${communityCreateLauncherOpen ? " open" : ""}`}>
            {communityCreateLauncherOpen ? (
              <div className="feed-create-options" aria-hidden={false}>
                <button type="button" className="feed-create-option" onClick={() => { setCommunityCreateLauncherOpen(false); setCommunityTab("후기"); setCommunityExplorerStage("list"); }}>
                  <span className="feed-create-option-label">후기작성</span>
                  <span className="feed-create-option-icon" aria-hidden="true"><PaperDocumentIcon /></span>
                </button>
                <button type="button" className="feed-create-option" onClick={() => { setCommunityCreateLauncherOpen(false); setCommunityTab("포럼"); setCommunityExplorerStage("list"); }}>
                  <span className="feed-create-option-label">포럼작성</span>
                  <span className="feed-create-option-icon" aria-hidden="true"><ChatIcon /></span>
                </button>
                <button type="button" className="feed-create-option" onClick={() => { setCommunityCreateLauncherOpen(false); setCommunityTab("커뮤"); setCommunityExplorerStage("list"); }}>
                  <span className="feed-create-option-label">게시글작성</span>
                  <span className="feed-create-option-icon" aria-hidden="true"><CommentBubbleIcon /></span>
                </button>
              </div>
            ) : null}
            <button type="button" className={`feed-create-fab${communityCreateLauncherOpen ? " open" : ""}`} onClick={() => setCommunityCreateLauncherOpen((prev) => !prev)} aria-label={communityCreateLauncherOpen ? "소통 작성 메뉴 닫기" : "소통 작성 메뉴 열기"}>
              <span className="feed-create-fab-icon"><PlusIcon /></span>
            </button>
          </div>
        </>
      ) : null}

      {showAppTabContent && activeTab === "홈" && ["피드", "쇼츠", "스토리"].includes(homeTab) && !feedComposeOpen && !openFeedCommentItem && !selectedAskProfile ? (
        <>
          {feedComposeLauncherOpen ? <button type="button" className="feed-create-backdrop" aria-label="피드 작성 메뉴 닫기" onClick={() => setFeedComposeLauncherOpen(false)} /> : null}
          <div className={`feed-create-dock${feedComposeLauncherOpen ? " open" : ""}`}>
            {feedComposeLauncherOpen ? (
              <div className="feed-create-options" aria-hidden={false}>
                {([
                  { mode: "스토리게시" as const, label: "스토리게시", icon: <PhotoImageIcon /> },
                  { mode: "쇼츠게시" as const, label: "쇼츠게시", icon: <ShortsCameraIcon /> },
                  { mode: "피드게시" as const, label: "피드게시", icon: <PaperDocumentIcon /> },
                ]).map((item) => (
                  <button key={item.mode} type="button" className="feed-create-option" onClick={() => openFeedComposeWithMode(item.mode)}>
                    <span className="feed-create-option-label">{item.label}</span>
                    <span className="feed-create-option-icon" aria-hidden="true">{item.icon}</span>
                  </button>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              className={`feed-create-fab${feedComposeLauncherOpen ? " open" : ""}`}
              onClick={() => setFeedComposeLauncherOpen((prev) => !prev)}
              aria-label={feedComposeLauncherOpen ? "피드 작성 메뉴 닫기" : "피드 작성 메뉴 열기"}
            >
              <span className="feed-create-fab-icon"><PlusIcon /></span>
            </button>
          </div>
        </>
      ) : null}

      {!desktopPaneContext.embedded ? (
        <nav className="bottom-nav">{mobileTabs.map((tab) => (
          <button key={tab} className={`bottom-nav-btn ${overlayMode === null && activeTab === tab ? "active" : ""}`} onClick={() => selectBottomTab(tab)}>
            <span className="bottom-nav-icon">{bottomNavIconMap[tab]}</span>
            <span className="bottom-nav-label">{tab}</span>
          </button>
        ))}</nav>
      ) : null}

      {selectedAskProfile ? <AskProfileScreen profile={selectedAskProfile} activeTab={activeTab} onClose={() => setSelectedAskProfile(null)} onNavigate={selectBottomTab} renderBottomTabIcon={renderBottomTabIcon} onOpenProfile={openProfileFromAuthor} /> : null}

      {feedAvatarPreviewItem ? (
        <div className="feed-avatar-preview-backdrop" onClick={closeFeedAvatarPreview}>
          <div className="feed-avatar-preview-sheet" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="프로필 사진 미리보기">
            <div className={`feed-avatar-preview-stage ${feedAvatarPreviewItem.accent}`}>
              <div className="feed-avatar-preview-square">
                {feedAvatarPreviewItem.mediaUrl ? (
                  <img className="feed-avatar-preview-image" src={feedAvatarPreviewItem.mediaUrl} alt={feedAvatarPreviewItem.author} />
                ) : (
                  <div className="feed-avatar-preview-silhouette" aria-hidden="true">
                    <span className="feed-avatar-preview-head" />
                    <span className="feed-avatar-preview-body" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {repostMenuItem ? (
        <div className="feed-repost-choice-backdrop" onClick={() => setRepostMenuItem(null)}>
          <div className="feed-repost-choice-sheet" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => createRepostFeed(repostMenuItem)}>재게시</button>
            <button type="button" onClick={() => openQuoteComposer(repostMenuItem)}>인용</button>
            <button type="button" className="ghost-btn" onClick={() => setRepostMenuItem(null)}>취소</button>
          </div>
        </div>
      ) : null}

      {quoteTargetItem ? (
        <div className="feed-repost-choice-backdrop" onClick={() => setQuoteTargetItem(null)}>
          <div className="feed-quote-compose-sheet" onClick={(event) => event.stopPropagation()}>
            <strong>인용 작성</strong>
            <textarea value={quoteDraft} onChange={(event) => setQuoteDraft(event.target.value)} placeholder="이 게시물에 대한 생각을 작성하세요." />
            <div className="feed-quoted-card"><strong>@{quoteTargetItem.author}</strong><span>{quoteTargetItem.caption || quoteTargetItem.title}</span></div>
            <div className="feed-quote-compose-actions"><button type="button" className="ghost-btn" onClick={() => setQuoteTargetItem(null)}>취소</button><button type="button" onClick={submitQuoteFeed}>인용 게시</button></div>
          </div>
        </div>
      ) : null}


      {activeStoryViewer ? (
        <div className="story-viewer-backdrop" onClick={() => setActiveStoryViewer(null)}>
          <section className="story-viewer-card" onClick={(event) => event.stopPropagation()}>
            <div className="story-viewer-progress"><span /></div>
            <div className="story-viewer-head">
              <div className="story-mini-avatar">{activeStoryViewer.name.slice(0, 1).toUpperCase()}</div>
              <div><strong>{activeStoryViewer.name}</strong><span>{activeStoryViewer.postedAt ?? "방금 전"}</span></div>
              <button type="button" className="ghost-btn" onClick={() => setActiveStoryViewer(null)}>닫기</button>
            </div>
            <div className="story-viewer-body">
              <strong>{activeStoryViewer.role}</strong>
              <p>{activeStoryViewer.caption ?? storyPreviewText[activeStoryViewer.name] ?? "현재 올린 스토리 내용을 확인합니다."}</p>
              {activeStoryViewer.mapEnabled ? <span className="story-viewer-location">맵토리 · 서울 강서구</span> : null}
            </div>
          </section>
        </div>
      ) : null}

      {feedComposeOpen ? (
        <FeedComposeScreen
          mode={feedComposeMode}
          title={feedComposeTitle}
          caption={feedComposeCaption}
          attachment={feedComposeAttachment}
          busy={feedComposeBusy}
          helperText={feedComposeHelperText}
          onChangeTitle={setFeedComposeTitle}
          onChangeCaption={setFeedComposeCaption}
          onAttachFile={handleFeedComposeAttach}
          onClearAttachment={clearFeedComposeAttachment}
          maptoryEnabled={feedComposeMaptoryEnabled}
          onChangeMaptoryEnabled={setFeedComposeMaptoryEnabled}
          onSubmit={submitFeedCompose}
          onClose={closeFeedCompose}
        />
      ) : null}

      {openFeedCommentItem ? (
        <FeedCommentScreen
          item={openFeedCommentItem}
          comments={feedCommentMap[openFeedCommentItem.id] ?? []}
          draft={feedCommentDrafts[openFeedCommentItem.id] ?? ""}
          attachment={feedCommentAttachments[openFeedCommentItem.id] ?? null}
          attachmentBusy={feedCommentAttachmentBusyId === openFeedCommentItem.id}
          onChangeDraft={(value) => updateFeedCommentDraft(openFeedCommentItem.id, value)}
          onAttachImage={(file) => attachFeedCommentImage(openFeedCommentItem.id, file)}
          onClearAttachment={() => clearFeedCommentAttachment(openFeedCommentItem.id)}
          onSubmit={() => submitFeedComment(openFeedCommentItem.id)}
          onClose={closeFeedComments}
          onGoHome={() => { closeFeedComments(); setActiveTab("홈"); setHomeTab("피드"); }}
        />
      ) : null}

      {pendingDmUser ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header-row">
              <strong>1:1 대화 요청</strong>
              <button className="ghost-btn" onClick={() => setPendingDmUser(null)}>닫기</button>
            </div>
            <div className="stack-gap">
              <div className="legacy-box compact">
                <p><b>{pendingDmUser.name}</b> 님에게 <b>{pendingDmUser.topic}</b> 주제로 1:1 대화를 요청합니다.</p>
                <p>요청 전에 아래 대화 규칙 동의가 필요합니다.</p>
              </div>
              <div className="consent-checklist signup-consent-checklist">
                {dmRuleNoticeItems.map((item) => (
                  <label key={item} className="consent-row">
                    <input type="checkbox" checked={!!dmRuleChecks[item]} onChange={(e) => setDmRuleChecks((prev) => ({ ...prev, [item]: e.target.checked }))} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <div className="copy-action-row">
                <button type="button" onClick={submitDmRequest}>규칙 동의 후 요청 전송</button>
                <button type="button" className="ghost-btn" onClick={() => setPendingDmUser(null)}>취소</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {roomModalOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header-row">
              <button className="header-inline-btn modal-back-btn" onClick={() => setRoomModalOpen(false)}>←</button>
              <strong>단체 채팅방 개설</strong>
              <span className="modal-spacer" />
            </div>
            <div className="legacy-box compact"><p>성인인증 완료 회원만 개설할 수 있습니다. 이 공간은 주제형 정보교류/고민상담용이며 사람 찾기, 만남, 주선은 허용하지 않습니다. 사진/영상/파일 전송은 막고, 앱 내부 항목만 공유할 수 있습니다.</p>{groupRoomSuspendedRemainMinutes > 0 ? <p>현재 계정은 신고/제재 반영으로 {groupRoomSuspendedRemainMinutes}분 동안 개설이 제한됩니다.</p> : null}</div>
            <div className="modal-form-grid modal-form-grid-top">
              <select value={newRoomCategory} onChange={(e) => setNewRoomCategory(e.target.value as Exclude<RandomRoomCategory, "전체">)}>
                {randomRoomCategories.filter((item) => item !== "전체").map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <input value={newRoomTitle} onChange={(e) => setNewRoomTitle(e.target.value.slice(0, 24))} placeholder="방제목입력칸" />
            </div>
            <div className="modal-form-grid modal-form-grid-bottom">
              <label className="anonymous-check"><span>익명</span><input type="checkbox" checked={newRoomAnonymous} onChange={(e) => setNewRoomAnonymous(e.target.checked)} /></label>
              <input value={newRoomMaxPeople} onChange={(e) => setNewRoomMaxPeople(e.target.value.replace(/[^0-9]/g, ""))} placeholder="인원수" />
              <input value={newRoomPassword} onChange={(e) => setNewRoomPassword(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))} placeholder="비밀번호입력칸" />
            </div>
            <button className="modal-submit-btn" onClick={createRandomRoom}>채팅방 개설</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

