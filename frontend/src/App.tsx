import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { clearTokens, getApiBase, getJson, getRefreshToken, postJson, setAuthToken, setRefreshToken } from "./lib/api";

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
};

type StoryItem = {
  id: number;
  name: string;
  role: string;
  accent: string;
};

type AskProfile = {
  id: number;
  name: string;
  headline: string;
  intro: string;
  highlight: string;
};

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
};

type CommunityPost = {
  id: number;
  category: string;
  title: string;
  summary: string;
  meta: string;
};


type NotificationItem = {
  id: number;
  section: "공지" | "주문" | "소통";
  title: string;
  body: string;
  meta: string;
  unread?: boolean;
  ctaLabel?: string;
};

type ThreadItem = {
  id: number;
  name: string;
  purpose: string;
  preview: string;
  time: string;
  unread: number;
  avatar: string;
  kind: "개인" | "단체";
  favorite?: boolean;
  status?: string;
};

type ForumStarterUser = {
  id: number;
  name: string;
  role: string;
  topic: string;
  intro: string;
  followsMe?: boolean;
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
  status?: string;
  sku_code?: string;
  stock_qty?: number;
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
const homeTabs = ["피드", "상품", "보관함"] as const;
const shoppingTabs = ["목록", "주문", "바구니", "사업자인증", "상품등록"] as const;
const communityTabs = ["커뮤", "포럼", "후기", "이벤트"] as const;
const chatTabs = ["채팅", "질문"] as const;
const chatTabLabels: Record<ChatTab, string> = { "채팅": "채팅", "질문": "질문" };
const profileTabs = ["내정보"] as const;
const settingsCategories = ["일반", "계정", "알림", "보안", "배포", "운영", "관리자모드", "DB관리", "신고", "채팅", "기타", "HTML요소"] as const;
const randomRoomCategories = ["전체", "관계역할/고민", "동의/경계설정", "안전수칙", "일상/취미", "자유대화"] as const;
const chatCategories = ["전체", "즐겨찾기", "개인", "단체", "쇼핑"] as const;
const oneToOneRandomCategories = ["고민상담", "자유수다", "아무말대잔치", "도파민수다"] as const;
const randomGenderOptions = ["무관", "남", "여", "기타"] as const;
const randomRegionOptions = ["무관", "같은 지역 우선", "거리기반"] as const;
const randomEntryTabs = ["시작", "목록"] as const;
const adminModeTabs = ["승인", "정산", "DB관리", "신고", "채팅", "기타"] as const;
const consentVersionMap = { terms: "terms_v1", privacy: "privacy_v1", adultNotice: "adult_notice_v1", identityNotice: "identity_notice_v1", marketing: "marketing_v1", profileOptional: "profile_optional_v1" } as const;
const requiredConsentKeys: ConsentKey[] = ["terms", "privacy", "adultNotice", "identityNotice"];
const profileGenderOptions = ["", "남성", "여성", "기타", "응답 안 함"] as const;
const profileAgeBandOptions = ["", "20대", "30대", "40대", "50대", "60대+"] as const;
const profileRegionOptions = ["", "서울", "경기", "인천", "강원", "충청", "전라", "경상", "제주"] as const;
const interestCategoryOptions = ["뷰티", "케어", "건강", "커뮤니티", "브랜드", "이벤트"] as const;

const defaultHeaderFavorites: HeaderFavoriteMap = {
  "홈": ["피드", "상품", "보관함"],
  "쇼핑": ["목록", "주문", "바구니", "사업자인증", "상품등록"],
  "소통": ["커뮤", "포럼", "후기"],
  "채팅": ["채팅", "질문"],
  "프로필": ["내정보"],
};

const defaultSignupConsents: SignupConsentState = { terms: false, privacy: false, adultNotice: false, identityNotice: false, marketing: false, profileOptional: false };
const defaultSignupForm: SignupFormState = { email: "", password: "", displayName: "", loginMethod: "이메일" };
const defaultDemoProfile: DemoProfileState = { gender: "", ageBand: "", regionCode: "", interests: [], marketingOptIn: false };
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
type RandomRoomCategory = (typeof randomRoomCategories)[number];
type ChatCategory = (typeof chatCategories)[number];
type OneToOneRandomCategory = (typeof oneToOneRandomCategories)[number];
type RandomGenderOption = (typeof randomGenderOptions)[number];
type RandomRegionOption = (typeof randomRegionOptions)[number];
type RandomEntryTab = (typeof randomEntryTabs)[number];
type AdminModeTab = (typeof adminModeTabs)[number];
type OverlayMode = "search" | "settings" | "notifications" | "menu" | "reconsent_info" | null;
type DemoLoginProvider = "PASS" | "휴대폰" | "카카오";
type AdultGateView = "intro" | "success" | "failed" | "minor";
type SignupStep = "consent" | "account" | "profile";
type LoginMethod = "이메일" | "카카오";
type ConsentKey = "terms" | "privacy" | "adultNotice" | "identityNotice" | "marketing" | "profileOptional";
type SignupConsentState = Record<ConsentKey, boolean>;
type SignupFormState = { email: string; password: string; displayName: string; loginMethod: LoginMethod; };
type DemoProfileState = { gender: string; ageBand: string; regionCode: string; interests: string[]; marketingOptIn: boolean; };

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

type HeaderNavItem = {
  label: string;
  active?: boolean;
  onClick?: () => void;
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

const feedSeed: FeedItem[] = Array.from({ length: 18 }, (_, idx) => ({
  id: idx + 1,
  type: idx % 3 === 0 ? "video" : "image",
  category: idx % 2 === 0 ? "브랜드 피드" : idx % 3 === 0 ? "숏클립" : "안전 가이드",
  title: `추천 피드 ${idx + 1}`,
  caption:
    idx % 3 === 0
      ? "세로형 짧은 영상으로 위생·보관·브랜드 스토리를 확인하는 홈 피드 예시입니다."
      : "사진 카드와 짧은 설명을 묶어 홈에서 빠르게 탐색하도록 구성한 예시입니다.",
  author: idx % 2 === 0 ? "adult official" : "seller studio",
  likes: 160 + idx * 7,
  comments: 12 + (idx % 9),
  accent: ["sunrise", "violet", "teal", "rose"][idx % 4],
}));

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

const shopCategories: ShopCategory[] = [
  { group: "입문/기본", icon: "◎", items: [{ name: "입문 액세서리", count: 18 }, { name: "위생·보관", count: 24 }, { name: "케어/세정", count: 14 }] },
  { group: "브랜드관", icon: "◇", items: [{ name: "국내 브랜드", count: 12 }, { name: "수입 브랜드", count: 21 }, { name: "안전 기획전", count: 9 }] },
  { group: "판매자센터", icon: "▣", items: [{ name: "신규 등록 상품", count: 8 }, { name: "승인 대기", count: 5 }, { name: "재고/상태", count: 11 }] },
];

const productsSeed: ProductCard[] = [
  { id: 1, category: "위생·보관", name: "뉴트럴 케어 파우치", subtitle: "익명 포장/보관 가이드 포함", price: "₩18,000", badge: "안전노출" },
  { id: 2, category: "입문 액세서리", name: "스타터 바디 케어 세트", subtitle: "입문자용 설명 카드 제공", price: "₩29,000", badge: "베스트" },
  { id: 3, category: "브랜드관", name: "브랜드관 샘플 패키지", subtitle: "카드/계좌 이체 허용 SKU", price: "₩43,000", badge: "PG 친화" },
  { id: 4, category: "기획전", name: "정기 재구매 추천 팩", subtitle: "재구매/장바구니 연동 예시", price: "₩36,500", badge: "추천" },
  { id: 5, category: "위생·보관", name: "실링 보관 키트", subtitle: "보관/관리 콘텐츠 연결", price: "₩12,900", badge: "신규" },
  { id: 6, category: "입문 액세서리", name: "안전 가이드 번들", subtitle: "콘텐츠+상품 동시 노출 예시", price: "₩24,000", badge: "콘텐츠 연동" },
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


const communityCategories = ["공지", "정보공유", "후기", "판매자소식", "이벤트"] as const;

const communitySeed: CommunityPost[] = [
  { id: 1, category: "공지", title: "안전모드 기준 및 커뮤니티 운영 원칙", summary: "앱 공개영역에서 허용되는 표현과 금지되는 표현을 한 번에 정리합니다.", meta: "관리자 · 오늘" },
  { id: 2, category: "정보공유", title: "익명포장 SOP와 반품 회수 체크포인트", summary: "판매자/고객 모두 확인할 수 있는 실무형 요약 카드입니다.", meta: "운영팀 · 2시간 전" },
  { id: 3, category: "후기", title: "사진 피드형 상품 리뷰 구성 예시", summary: "사진·짧은 영상·요약문이 결합된 소통 공간 예시입니다.", meta: "brand_note · 4시간 전" },
  { id: 4, category: "판매자소식", title: "신규 카테고리 승인 대기 상품 현황", summary: "판매자센터에서 확인 중인 상품들을 카테고리별로 묶어서 보여줍니다.", meta: "seller_studio · 어제" },
  { id: 5, category: "이벤트", title: "앱 심사 safe UI 점검 이벤트", summary: "모바일 노출 점검과 신고 흐름 확인용 공지입니다.", meta: "프로덕트팀 · 어제" },
  { id: 6, category: "공지", title: "이용약관 및 개인정보 처리방침 안내", summary: "앱 내 약관, 개인정보 처리방침, 청소년 보호정책, 환불정책은 알림 > 공지사항과 커뮤니티 공지 카테고리에서 확인할 수 있습니다.", meta: "운영공지 · 오늘" },
  { id: 7, category: "공지", title: "청소년 보호정책 및 제한 웹 포럼 운영 기준", summary: "앱 공개영역에서는 랜덤채팅을 열지 않고, 제한 웹 영역에서만 안전·동의·세척/보관 정보 포럼을 승인제로 운영합니다.", meta: "안전운영팀 · 오늘" },
  { id: 8, category: "정보공유", title: "구매자 활성화를 위한 앱 내 소통 기능 10선", summary: "안전수칙 토론, 초보 Q&A, 익명 고민상담, 주간 토크방처럼 법적 리스크가 낮은 소통 구조를 정리했습니다.", meta: "기획팀 · 오늘" },
];

const notificationSeed: NotificationItem[] = [
  { id: 1, section: "공지", title: "앱 공지사항", body: "이용약관, 개인정보 처리방침, 청소년 보호정책, 환불정책을 알림에서 바로 확인할 수 있도록 이동했습니다.", meta: "정책 공지 · 오늘", unread: true, ctaLabel: "정책 확인" },
  { id: 2, section: "공지", title: "채팅 운영기준 업데이트", body: "성향/관심사 그룹대화는 허용하되, 1:1 대화는 상호 수락 이후에만 열리도록 기준을 정리했습니다.", meta: "앱 업데이트 · 오늘", unread: true, ctaLabel: "기준 보기" },
  { id: 3, section: "주문", title: "주문한 제품 발송 준비중", body: "주문번호 A-240412-001 상품이 발송 준비 단계로 변경되었습니다.", meta: "쇼핑 주문 · 10분 전", unread: true, ctaLabel: "주문 보기" },
  { id: 4, section: "주문", title: "배송 상태 변경", body: "익명포장 배송 건이 택배사에 인계되었습니다. 상세 추적은 주문 목록에서 확인하세요.", meta: "배송 알림 · 1시간 전", ctaLabel: "배송 조회" },
  { id: 5, section: "소통", title: "커뮤니티 댓글 알림", body: "공지 카테고리 게시글에 새 댓글이 등록되었습니다.", meta: "커뮤니티 · 2시간 전", unread: true, ctaLabel: "댓글 보기" },
  { id: 6, section: "소통", title: "그룹대화/1:1 운영 안내", body: "앱에서는 성향/관심사 기반 그룹대화를 허용하되, 외부 연락처 교환·오프라인 제안·사진/영상 전송은 금지하고 1:1은 상호 수락 후에만 허용합니다.", meta: "채팅 안내 · 오늘", ctaLabel: "운영 기준" },
];

const threadSeed: ThreadItem[] = [
  { id: 101, name: "운영 문의", purpose: "상품/운영 문의", preview: "결제 허용 SKU 범위를 다시 확인 부탁드립니다.", time: "오전 9:41", unread: 2, avatar: "운", kind: "개인", favorite: true, status: "고정" },
  { id: 102, name: "role_talk_guide", purpose: "상호수락 1:1", preview: "그룹대화 참여 후 상호 수락이 완료되어 1:1 대화가 열렸습니다.", time: "오전 8:12", unread: 0, avatar: "R", kind: "개인", favorite: true, status: "수락완료" },
  { id: 103, name: "boundary_note", purpose: "관계/소통 대화", preview: "경계설정 체크리스트를 먼저 맞춰보고 이야기해보면 좋겠습니다.", time: "어제", unread: 1, avatar: "B", kind: "개인" },
  { id: 104, name: "customer demo", purpose: "구매자 지원", preview: "장바구니와 프로필 연동 상태를 확인하고 싶어요.", time: "어제", unread: 0, avatar: "C", kind: "개인" },
  { id: 105, name: "정산 지원", purpose: "정산/환불", preview: "환불 검수 상태를 오늘 안으로 공유드릴게요.", time: "4월 8일", unread: 3, avatar: "정", kind: "개인", favorite: true },
  { id: 106, name: "notice bot", purpose: "시스템 안내", preview: "새로운 공지와 이벤트가 등록되었습니다.", time: "4월 7일", unread: 0, avatar: "N", kind: "단체", status: "알림" },
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

function FeedPoster({ item, onAsk, saved, onToggleSave }: { item: FeedItem; onAsk: (item: FeedItem) => void; saved: boolean; onToggleSave: (feedId: number) => void }) {
  return (
    <article className={`feed-card history-feed-card ${item.accent}`}>
      <div className="history-feed-head">
        <div className="history-feed-profile">
          <div className="story-mini-avatar">{item.author.slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{item.author}</strong>
            <p>{item.category} · 방금 업데이트</p>
          </div>
        </div>
        <button type="button" className="feed-question-btn" onClick={() => onAsk(item)}>질문</button>
      </div>
      <div className="feed-media">
        <div className="feed-badge">{item.type === "video" ? "VIDEO" : "PHOTO"}</div>
        <div className="feed-category">{item.category}</div>
        <div className="feed-visual-copy">{item.title}</div>
      </div>
      <div className="feed-copy">
        <div>
          <strong>{item.title}</strong>
          <p>{item.caption}</p>
        </div>
        <div className="feed-meta">
          <span>@{item.author}</span>
          <span>좋아요 {item.likes}</span>
          <span>댓글 {item.comments}</span>
        </div>
      </div>
      <div className="history-feed-footer">
        <button type="button">좋아요</button>
        <button type="button">댓글</button>
        <button type="button" onClick={() => onAsk(item)}>질문하기</button>
        <button type="button" className="ghost-btn" onClick={() => onToggleSave(item.id)}>{saved ? "보관해제" : "보관함"}</button>
      </div>
    </article>
  );
}

function SponsoredFeedProductCard({ item, saved, onToggleSave }: { item: { id: number; label: string; title: string; subtitle: string; price: string }; saved: boolean; onToggleSave: (productId: number) => void }) {
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
}

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

function AskProfileScreen({ profile, onClose }: { profile: AskProfile; onClose: () => void }) {
  const [questionText, setQuestionText] = useState("");
  return (
    <div className="question-overlay">
      <section className="asked-page-head">
        <div className="asked-nav-row">
          <button type="button" className="header-inline-btn modal-back-btn" onClick={onClose}>←</button>
          <div className="asked-page-title">질문</div>
          <span className="modal-spacer" />
        </div>
      </section>
      <div className="question-overlay-body">
        <section className="asked-question-profile-header">
          <div className="asked-question-profile-card">
            <div className="asked-question-avatar">{profile.name.slice(0, 1).toUpperCase()}</div>
            <div className="asked-question-copy">
              <strong>{profile.name}</strong>
              <span>{profile.headline}</span>
              <p>{profile.intro}</p>
            </div>
          </div>
          <div className="asked-question-toolbar">
            <button type="button">팔로우</button>
            <button type="button" className="ghost-btn">공유</button>
          </div>
        </section>

        <section className="asked-question-form">
          <div className="question-profile-chip-row">
            <span className="question-profile-chip">질문 허용</span>
            <span className="question-profile-chip muted-chip">익명 가능</span>
          </div>
          <label>질문 내용</label>
          <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="상대에게 남길 질문을 입력하세요." />
          <div className="asked-question-form-actions">
            <button type="button">익명으로 질문</button>
            <button type="button" className="ghost-btn">질문 등록</button>
          </div>
        </section>

        <div className="ad-banner ad-banner-top">
          <span>Google AdSense 영역</span>
          <strong>질문 화면 상단 광고</strong>
        </div>

        <section className="question-list">
          {questionSeed.map((item, idx) => (
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
                  <button type="button">좋아요 {item.likes}</button>
                  <button type="button">댓글 {item.comments}</button>
                  <button type="button">공유</button>
                </div>
              </article>
              {idx === 0 ? (
                <div className="ad-banner ad-banner-inline">
                  <span>Google AdSense 영역</span>
                  <strong>질문 피드 중간 광고</strong>
                </div>
              ) : null}
            </div>
          ))}
        </section>

        <section className="asked-question-highlight">
          <strong>질문 화면 안내</strong>
          <p>{profile.highlight}</p>
        </section>
      </div>
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

function SettingSection({ category, isAdmin, legacySection, setLegacySection, projectStatus, deployGuide, legalDocuments, authSummary, businessInfo, releaseReadiness, paymentProviderStatus, minorPurgePreview, currentUserRole, adminModeTab, setAdminModeTab, adminDbManage, sellerApprovalQueue, productApprovalQueue, settlementPreview, htmlInspectorEnabled, setHtmlInspectorEnabled, adminDecideSeller, adminDecideProduct, accountPrivate, setAccountPrivate }: {
  category: SettingsCategory;
  isAdmin: boolean;
  legacySection: LegacyTab;
  setLegacySection: (section: LegacyTab) => void;
  projectStatus: ProjectStatus | null;
  deployGuide: DeployGuide | null;
  legalDocuments: LegalDocumentsResponse | null;
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
}) {
  if (category === "일반") {
    return (
      <div className="settings-grid settings-two-col">
        <div className="legacy-box compact"><h3>레이아웃</h3><p>상단/하단 높이를 축소하고 각 버튼 영역을 분리한 1줄 구조를 유지합니다.</p></div>
        <div className="legacy-box compact"><h3>탭 구조</h3><p>홈/쇼핑/소통/채팅/프로필별 좌측 서브탭과 우측 검색·설정 구조를 통일했습니다.</p></div>
        <div className="legacy-box compact"><h3>법정 문서</h3><p>이용약관 {legalDocuments?.items?.terms_of_service?.version ?? '-'} · 처리방침 {legalDocuments?.items?.privacy_policy?.version ?? '-'} · 청소년 보호 {legalDocuments?.items?.youth_policy?.version ?? '-'}</p><p>회원가입 화면과 고정 링크에서 항상 열람할 수 있도록 유지합니다.</p></div>
        <div className="legacy-box compact"><h3>재동의 상태</h3><p>{authSummary?.reconsent_required || authSummary?.consent_status?.reconsent_required ? '필수 재동의 필요' : '최신 버전 동의 상태'}</p></div>
        <div className="legacy-box compact"><h3>국내 출시 법적 준비</h3><p>{releaseReadiness?.status === 'blocked' ? '출시 차단 항목 존재' : releaseReadiness?.status === 'warning' ? '주의 항목 있음' : '핵심 차단 항목 없음'}</p><p>차단 {releaseReadiness?.blockers?.length ?? 0}건 · 주의 {releaseReadiness?.warnings?.length ?? 0}건</p></div>
        <div className="legacy-box compact"><h3>사업자 표시 정보</h3><p>{businessInfo?.complete ? '사업자 고지 정보 확정' : '사업자/통신판매/청소년보호책임자 정보 보완 필요'}</p><p>누락: {businessInfo?.placeholder_fields?.length ? businessInfo.placeholder_fields.join(', ') : '없음'}</p><p>입력 소스: {businessInfo?.source ?? 'settings'} {businessInfo?.beta_db_override_enabled ? '· 베타 DB 연동 가능' : ''}</p></div>
        <div className="legacy-box compact"><h3>PortOne/PASS 연동</h3><p>{paymentProviderStatus?.test_env_ready ? '테스트 설정 완료' : '테스트 설정 입력 필요'}</p><p>기본 PG: {paymentProviderStatus?.primary_provider ?? '-'} · webhook: {paymentProviderStatus?.webhook_paths?.payment ?? '-'}</p><p>SDK: {paymentProviderStatus?.portone_sdk_installed ? '설치됨' : '미설치'} · env 분리: {paymentProviderStatus?.payments_env_split_enabled ? '활성화' : '비활성화'}</p></div>
      </div>
    );
  }
  if (category === "계정") {
    return (
      <div className="settings-grid settings-two-col">
        <div className="legacy-box compact"><h3>현재 역할</h3><p>{currentUserRole}</p></div>
        <div className="legacy-box compact"><h3>프로필 접근</h3><p>내정보, 작성 글, 업로드 상품, 통계 카드를 확인할 수 있습니다.</p></div>
        <div className="legacy-box compact">
          <h3>계정비공개</h3>
          <p>ON으로 할 경우 상호 팔로잉한 계정 외에는 계정이 비공개됩니다.</p>
          <div className="toggle-row">
            <button type="button" className={`toggle-btn ${accountPrivate ? "active" : ""}`} onClick={() => setAccountPrivate(true)}>ON</button>
            <button type="button" className={`toggle-btn ${!accountPrivate ? "active" : ""}`} onClick={() => setAccountPrivate(false)}>OFF</button>
          </div>
          <p className="muted-mini">현재 상태: {accountPrivate ? "상호 팔로잉 외 비공개" : "공개"}</p>
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
  const [activeTab, setActiveTab] = useState<MobileTab>("홈");
  const [legacySection, setLegacySection] = useState<LegacyTab>("운영현황");
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(null);
  const [htmlInspectorEnabled, setHtmlInspectorEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_html_inspector_enabled") === "1";
  });
  const [inspectedElement, setInspectedElement] = useState<HtmlInspectorInfo | null>(null);
  const inspectedTargetRef = useRef<HTMLElement | null>(null);
  const [globalKeyword, setGlobalKeyword] = useState("");
  const [searchFilter, setSearchFilter] = useState("전체");
  const [homeTab, setHomeTab] = useState<HomeTab>("피드");
  const [shoppingTab, setShoppingTab] = useState<ShoppingTab>("목록");
  const [communityTab, setCommunityTab] = useState<CommunityTab>("커뮤");
  const [chatTab, setChatTab] = useState<ChatTab>("채팅");
  const [chatCategory, setChatCategory] = useState<ChatCategory>("전체");
  const [profileTab, setProfileTab] = useState<ProfileTab>("내정보");
  const [settingsCategory, setSettingsCategory] = useState<SettingsCategory>("일반");
  const [adminModeTab, setAdminModeTab] = useState<AdminModeTab>("DB관리");
  const [selectedShopCategory, setSelectedShopCategory] = useState("전체");
  const [selectedCommunityCategory, setSelectedCommunityCategory] = useState<string>("전체");
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
  const [communityKeyword, setCommunityKeyword] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null);
  const [deployGuide, setDeployGuide] = useState<DeployGuide | null>(null);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocumentsResponse | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfoResponse | null>(null);
  const [releaseReadiness, setReleaseReadiness] = useState<ReleaseReadinessResponse | null>(null);
  const [paymentProviderStatus, setPaymentProviderStatus] = useState<PaymentProviderStatusResponse | null>(null);
  const [minorPurgePreview, setMinorPurgePreview] = useState<MinorPurgePreview | null>(null);
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
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
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
    try { return { ...defaultDemoProfile, ...JSON.parse(raw) }; } catch { return defaultDemoProfile; }
  });
  const [sellerVerification, setSellerVerification] = useState<SellerVerificationState>(() => {
    if (typeof window === "undefined") return defaultSellerVerification;
    const raw = window.localStorage.getItem("adultapp_seller_verification");
    if (!raw) return defaultSellerVerification;
    try { return { ...defaultSellerVerification, ...JSON.parse(raw) }; } catch { return defaultSellerVerification; }
  });
  const [productRegistrationDraft, setProductRegistrationDraft] = useState<ProductRegistrationDraft>(() => ({ category: "뷰티", name: "", imageUrls: ["", "", "", "", ""], description: "", price: "", stockQty: "", skuCode: "" }));
  const [submittedProducts, setSubmittedProducts] = useState<ProductRegistrationDraft[]>(() => []);
  const [sellerApprovalQueue, setSellerApprovalQueue] = useState<SellerApprovalItem[]>([]);
  const [productApprovalQueue, setProductApprovalQueue] = useState<ProductApprovalItem[]>([]);
  const [sellerProducts, setSellerProducts] = useState<SellerProductItem[]>([]);
  const [settlementPreview, setSettlementPreview] = useState<SettlementPreviewResponse | null>(null);
  const [threadItems, setThreadItems] = useState<ThreadItem[]>(threadSeed);
  const [forumTopic, setForumTopic] = useState<(typeof forumStarterTopics)[number]>("제품 이야기");
  const [followingUserIds, setFollowingUserIds] = useState<number[]>([301, 303, 304]);
  const [followerUserIds] = useState<number[]>(forumStarterUsers.filter((item) => item.followsMe).map((item) => item.id));
  const [pendingDmUser, setPendingDmUser] = useState<ForumStarterUser | null>(null);
  const [dmRuleChecks, setDmRuleChecks] = useState<Record<string, boolean>>({});
  const [accountPrivate, setAccountPrivate] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_account_private") === "1";
  });
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
  const [savedProductIds, setSavedProductIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem("adultapp_saved_product_ids") ?? "[]"); } catch { return []; }
  });
  const [savedTab, setSavedTab] = useState<"피드" | "상품">("피드");
  const [authStandaloneScreen, setAuthStandaloneScreen] = useState<AuthStandaloneScreen | null>(null);
  const [homeShopConsentGuideSeen, setHomeShopConsentGuideSeen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_home_shop_consent_guide_seen") === "1";
  });
  const [authEmail, setAuthEmail] = useState("customer@example.com");
  const [authPassword, setAuthPassword] = useState("customer1234");
  const [authMessage, setAuthMessage] = useState("");
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [cartItems, setCartItems] = useState<Array<{ productId: number; qty: number }>>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [selectedOrderNo, setSelectedOrderNo] = useState("");
  const [orderDetail, setOrderDetail] = useState<ApiOrderDetail | null>(null);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderActionAmount, setOrderActionAmount] = useState("5500");

  const isAdmin = ["ADMIN", "1", "GRADE_1"].includes(currentUserRole);
  const mutualFollowIds = useMemo(() => followingUserIds.filter((id) => followerUserIds.includes(id)), [followingUserIds, followerUserIds]);
  const forumVisibleUsers = useMemo(() => forumStarterUsers.filter((item) => item.topic === forumTopic), [forumTopic]);

  const toggleFollowUser = (userId: number) => {
    setFollowingUserIds((prev) => prev.includes(userId) ? prev.filter((item) => item !== userId) : [...prev, userId]);
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
      setThreadItems((prev) => [{
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
      }, ...prev]);
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
    getJson<ReleaseReadinessResponse>("/legal/release-readiness").then(setReleaseReadiness).catch(() => null);
    getJson<PaymentProviderStatusResponse>("/payments/provider-status").then(setPaymentProviderStatus).catch(() => null);
    getJson<ApiProduct[]>("/products").then(setApiProducts).catch(() => null);
    getJson<AuthMeResponse>("/auth/me").then((me) => {
      setAuthSummary(me);
      const nextRole = String(me.grade ?? "GUEST").toUpperCase();
      setCurrentUserRole(nextRole);
      if (typeof window !== "undefined") window.localStorage.setItem("adultapp_demo_role", nextRole);
      setIdentityVerified(Boolean(me.identity_verified));
      setAdultVerified(Boolean(me.adult_verified));
      getJson<ApiOrder[]>("/orders").then(setOrders).catch(() => null);
      getJson<SellerProductItem[]>("/seller/products/mine").then(setSellerProducts).catch(() => null);
      if (["ADMIN", "1", "GRADE_1"].includes(nextRole)) {
        getJson<MinorPurgePreview>("/ops/minor-purge/preview").then(setMinorPurgePreview).catch(() => null);
        getJson<{ items: SellerApprovalItem[] }>("/admin/seller-approvals").then((res) => setSellerApprovalQueue(res.items ?? [])).catch(() => null);
        getJson<{ items: ProductApprovalItem[] }>("/admin/product-approvals").then((res) => setProductApprovalQueue(res.items ?? [])).catch(() => null);
        getJson<SettlementPreviewResponse>("/settlements/preview").then(setSettlementPreview).catch(() => null);
        getJson<AdminDbManage>("/admin/chat-random/db-manage").then(setAdminDbManage).catch(() => null);
      }
    }).catch(() => {
      setAuthSummary(null);
      setCurrentUserRole("GUEST");
      if (typeof window !== "undefined") window.localStorage.setItem("adultapp_demo_role", "GUEST");
      setOrders([]);
      setSellerProducts([]);
    });
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

  const toggleSavedProduct = (productId: number) => {
    setSavedProductIds((prev) => prev.includes(productId) ? prev.filter((item) => item !== productId) : [productId, ...prev]);
  };

  const savedFeedItems = useMemo(() => feedSeed.filter((item) => savedFeedIds.includes(item.id)), [savedFeedIds]);

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

  const homeMenuItems = [
    { label: "피드", onClick: () => { setHomeTab("피드"); setOverlayMode(null); } },
    { label: "상품", onClick: () => { setHomeTab("상품"); setOverlayMode(null); } },
    { label: "보관함", onClick: goToSavedBox },
  ];


  const visibleFeed = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    return !keyword ? feedSeed : feedSeed.filter((item) => `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase().includes(keyword));
  }, [globalKeyword]);

  const allShopItems = useMemo(() => {
    const keyword = `${shopKeyword} ${globalKeyword}`.trim().toLowerCase();
    const source = apiProducts.length
      ? apiProducts.filter((item) => (item.status ?? "published") === "published").map((item) => ({
          id: item.id,
          category: item.category,
          name: item.name,
          subtitle: item.description ?? "",
          price: `₩${Number(item.price || 0).toLocaleString()}`,
          badge: item.stock_qty && item.stock_qty > 0 ? "판매중" : "재고확인",
        }))
      : productsSeed;
    return source.filter((product) => {
      const matchCategory = selectedShopCategory === "전체" || product.category === selectedShopCategory;
      const matchKeyword = !keyword || `${product.name} ${product.subtitle} ${product.category}`.toLowerCase().includes(keyword);
      return matchCategory && matchKeyword;
    });
  }, [selectedShopCategory, shopKeyword, globalKeyword, apiProducts]);

  const filteredCommunity = useMemo(() => {
    const keyword = `${communityKeyword} ${globalKeyword}`.trim().toLowerCase();
    return communitySeed.filter((post) => {
      const tabMatch = communityTab === "커뮤" ? ["공지", "정보공유", "판매자소식"].includes(post.category) : post.category === communityTab;
      const categoryMatch = selectedCommunityCategory === "전체" || post.category === selectedCommunityCategory;
      const keywordMatch = !keyword || `${post.title} ${post.summary}`.toLowerCase().includes(keyword);
      return tabMatch && categoryMatch && keywordMatch;
    });
  }, [selectedCommunityCategory, communityKeyword, globalKeyword, communityTab]);

  const filteredThreads = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    return threadItems.filter((thread) => {
      const categoryMatch = chatCategory === "전체"
        || (chatCategory === "즐겨찾기" && !!thread.favorite)
        || (chatCategory === "개인" && thread.kind === "개인")
        || (chatCategory === "단체" && thread.kind === "단체")
        || (chatCategory === "쇼핑" && /상품|판매자|구매자|주문|운영 문의/.test(`${thread.name} ${thread.purpose}`));
      const keywordMatch = !keyword || `${thread.name} ${thread.preview} ${thread.purpose}`.toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });
  }, [globalKeyword, chatCategory, threadItems]);

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
  const savedProductItems = useMemo(() => [...productsSeed, ...homeProducts.map((item) => ({ ...item, subtitle: item.subtitle ?? "", badge: item.badge ?? "" }))].filter((item, index, arr) => arr.findIndex((row) => row.id === item.id) === index && savedProductIds.includes(item.id)), [savedProductIds, homeProducts]);
  const homeSearchResults = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return feedSeed.filter((item) => {
      const source = `${item.title} ${item.caption} ${item.author} ${item.category}`.toLowerCase();
      if (searchFilter === "피드") return `${item.title} ${item.caption}`.toLowerCase().includes(keyword);
      if (searchFilter === "작성자") return item.author.toLowerCase().includes(keyword);
      return source.includes(keyword);
    });
  }, [globalKeyword, searchFilter]);

  const shopSearchResults = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return productsSeed.filter((item) => {
      if (searchFilter === "상품명") return item.name.toLowerCase().includes(keyword);
      if (searchFilter === "내용") return item.subtitle.toLowerCase().includes(keyword);
      if (searchFilter === "카테고리") return item.category.toLowerCase().includes(keyword);
      return `${item.name} ${item.subtitle} ${item.category}`.toLowerCase().includes(keyword);
    });
  }, [globalKeyword, searchFilter]);

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

  const showBaseTabContent = overlayMode === null;
  const blockedByIdentity = !isAdmin && !identityVerified;
  const requiresAdultGate = !isAdmin && !adultVerified && ["홈", "쇼핑"].includes(activeTab);
  const showAppTabContent = showBaseTabContent && !blockedByIdentity && !requiresAdultGate;
  const adultCooldownRemainMinutes = adultCooldownUntil > Date.now() ? Math.ceil((adultCooldownUntil - Date.now()) / 60000) : 0;
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
  const productDraftReady = Boolean(productRegistrationDraft.category && productRegistrationDraft.name.trim() && productRegistrationDraft.description.trim() && productRegistrationDraft.price.trim() && productRegistrationDraft.stockQty.trim() && productRegistrationDraft.skuCode.trim() && productRegistrationDraft.imageUrls.filter(Boolean).length > 0);
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
      if (!requiredConsentAccepted) return;
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
    if (!productDraftReady || !sellerApprovalReady || reconsentWriteRestricted) return;
    const payload = {
      name: productRegistrationDraft.name,
      sku_code: productRegistrationDraft.skuCode,
      category: productRegistrationDraft.category,
      description: productRegistrationDraft.description,
      price: Number(productRegistrationDraft.price || '0'),
      stock_qty: Number(productRegistrationDraft.stockQty || '0'),
      image_urls: productRegistrationDraft.imageUrls.filter(Boolean),
      status: submitMode === 'publish' ? 'approved' : 'draft',
      submit_mode: submitMode,
      payment_scope: 'card_transfer',
      risk_grade: 'A',
    };
    try {
      const created = await postJson<SellerProductItem>('/products', payload);
      getJson<SellerProductItem[]>('/seller/products/mine').then(setSellerProducts).catch(() => null);
      getJson<ApiProduct[]>('/products').then(setApiProducts).catch(() => null);
      if (isAdmin) getJson<{ items: ProductApprovalItem[] }>('/admin/product-approvals').then((res) => setProductApprovalQueue(res.items ?? [])).catch(() => null);
      setOrderMessage(`${submitMode === 'publish' ? '상품등록' : '상품 임시저장'} 완료: ${created.name} · ${created.status ?? 'draft'}`);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : submitMode === 'publish' ? '상품등록 실패' : '상품 임시저장 실패');
      return;
    }
    setSubmittedProducts((prev) => [productRegistrationDraft, ...prev]);
    setProductRegistrationDraft({ category: '뷰티', name: '', imageUrls: ['', '', '', '', ''], description: '', price: '', stockQty: '', skuCode: '' });
  };

  const submitProductForReview = async (productId: number) => {
    try {
      await postJson(`/products/${productId}/submit-review`, { note: '승인대기 제출' });
      getJson<SellerProductItem[]>('/seller/products/mine').then(setSellerProducts).catch(() => null);
      if (isAdmin) getJson<{ items: ProductApprovalItem[] }>('/admin/product-approvals').then((res) => setProductApprovalQueue(res.items ?? [])).catch(() => null);
    } catch {}
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
    const nextOrders = await getJson<ApiOrder[]>("/orders");
    setOrders(nextOrders);
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
      setActiveTab("쇼핑");
      setShoppingTab("목록");
      setAdultGateView("success");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "테스트 계정 로그인에 실패했습니다.");
    }
  };

  const loginWithCredentials = async () => {
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
      setActiveTab("쇼핑");
      setShoppingTab("목록");
      setAdultGateView("success");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    }
  };

  const addToCart = (productId: number) => {
    setCartItems((prev) => {
      const found = prev.find((item) => item.productId === productId);
      if (found) return prev.map((item) => item.productId === productId ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { productId, qty: 1 }];
    });
    setShoppingTab("바구니");
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
      setOrderMessage(`테스트 대상 주문 선택: ${orderNo}`);
    } catch (error) {
      setOrderDetail(null);
      setOrderMessage(error instanceof Error ? error.message : "주문 상세 조회 실패");
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
      ? "설정"
      : overlayMode === "notifications"
        ? "알림"
        : activeTab;

  const openOverlay = (mode: Exclude<OverlayMode, null>) => {
    setOverlayMode((prev) => (prev === mode ? null : mode));
    setRoomModalOpen(false);
    if (mode === "search") setSearchFilter("전체");
  };

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
      return shoppingTabs.map((tab) => ({
        label: tab,
        active: shoppingTab === tab,
        onClick: () => {
          if (tab === "상품등록") {
            openProductRegistrationTab();
            return;
          }
          if (tab === "사업자인증") {
            openBusinessVerificationTab();
            return;
          }
          setShoppingTab(tab);
        },
      }));
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

  const settingsNavItems = useMemo<SettingsCategory[]>(() => settingsCategories.filter((item) => (["운영", "관리자모드", "DB관리", "신고", "채팅", "기타"].includes(item) ? isAdmin : true)), [isAdmin]);
  const visibleHeaderNavItems = overlayMode === null ? headerNavItems : [];
  const currentMenuItems = (activeTab === "홈" ? homeMenuItems : currentTabMenuItems.map((item) => ({ label: item.label, onClick: item.onClick }))).map((item) => ({ label: item.label, onClick: () => { item.onClick?.(); setOverlayMode(null); } }));

  const notificationSections = useMemo(() => ({
    notices: notificationSeed.filter((item) => item.section === "공지"),
    orders: notificationSeed.filter((item) => item.section === "주문"),
    community: notificationSeed.filter((item) => item.section === "소통"),
  }), []);
  const unreadNotificationCount = useMemo(() => notificationSeed.filter((item) => item.unread).length, []);

  const selectBottomTab = (tab: MobileTab) => {
    setActiveTab(tab);
    setOverlayMode(null);
    setRoomModalOpen(false);
    if (tab !== "홈") setHomeTab("피드");
    if (tab !== "쇼핑") setShoppingTab("목록");
    if (tab !== "소통") setCommunityTab("커뮤");
    if (tab !== "채팅") {
      setChatTab("채팅");
      setChatCategory("전체");
      setRandomSettingsOpen(false);
      setMatchingRandom(false);
      setMatchedRandomUser(null);
      setRandomMatchPhase("idle");
      setRandomMatchNote("카테고리를 고른 뒤 익명 정보교류용 텍스트 채팅을 시작할 수 있습니다. 외부연락, 사람 찾기, 만남유도, 사진/영상 교환은 금지됩니다.");
    }
    if (tab !== "프로필") setProfileTab("내정보");
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

  const profileSearchResults = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return feedSeed.filter((item) => {
      if (searchFilter === "아이디") return item.author.toLowerCase().includes(keyword);
      if (searchFilter === "피드") return `${item.title} ${item.caption}`.toLowerCase().includes(keyword);
      return `${item.author} ${item.title} ${item.caption}`.toLowerCase().includes(keyword);
    });
  }, [globalKeyword, searchFilter]);

  if (authStandaloneScreen) {
    return (
      <div className="auth-standalone-shell">
        <main className="auth-standalone-main">
          <section className="auth-standalone-card">
            <div className="auth-standalone-head">
              <div>
                <h1>{authStandaloneScreen === "login" ? "로그인" : "회원가입"}</h1>
              </div>
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
                <div className="legacy-box compact auth-summary-box">
                  <h3>테스트 계정</h3>
                  <div className="chip-checklist auth-account-chiplist">
                    <button type="button" className="chip-check" onClick={() => loginWithTestAccount("customer@example.com", "customer1234")}>회원</button>
                    <button type="button" className="chip-check" onClick={() => loginWithTestAccount("admin@example.com", "admin1234")}>관리자</button>
                    <button type="button" className="chip-check" onClick={() => loginWithTestAccount("seller@example.com", "seller1234")}>판매자</button>
                    <button type="button" className="chip-check" onClick={() => loginWithTestAccount("general@example.com", "general1234")}>일반회원</button>
                  </div>
                  {authMessage ? <p>{authMessage}</p> : <p>테스트 계정을 누르면 바로 로그인합니다.</p>}
                </div>
              </div>
            ) : (
              <div className="auth-standalone-body stack-gap">
                <div className="signup-step-strip">
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
                  <div className="stack-gap">
                    <div className="legacy-box compact signup-legal-copy">
                      <h3>개인정보 수집·이용 안내</h3>
                      <p>수집·이용 목적 : 회원 식별, 로그인, 본인확인, 성인인증, 고객지원</p>
                      <p>수집 항목 : 이메일, 비밀번호, 이름, 본인확인 결과값</p>
                      <p>보유 및 이용 기간 : 법령상 보존기간까지</p>
                      <p>동의 거부권 및 불이익 : 필수 항목 미동의 시 회원가입이 제한될 수 있음</p>
                      <div className="copy-action-row legal-link-row">
                        <a className="ghost-link-btn" href={`${getApiBase()}/legal/terms-of-service`} target="_blank" rel="noreferrer">이용약관</a>
                        <a className="ghost-link-btn" href={`${getApiBase()}/legal/privacy-policy`} target="_blank" rel="noreferrer">개인정보 처리방침 보기</a>
                        <a className="ghost-link-btn" href={`${getApiBase()}/legal/youth-policy`} target="_blank" rel="noreferrer">청소년 보호정책 보기</a>
                      </div>
                    </div>
                    <div className="consent-checklist">
                      <label className={`consent-row ${signupConsents.terms ? "checked" : ""}`}><input type="checkbox" checked={signupConsents.terms} onChange={(e) => setSignupConsents((prev) => ({ ...prev, terms: e.target.checked }))} /><span>[필수] 이용약관 확인</span></label>
                      <label className={`consent-row ${signupConsents.privacy ? "checked" : ""}`}><input type="checkbox" checked={signupConsents.privacy} onChange={(e) => setSignupConsents((prev) => ({ ...prev, privacy: e.target.checked }))} /><span>[필수] 개인정보 처리방침 확인</span></label>
                      <label className={`consent-row ${signupConsents.adultNotice ? "checked" : ""}`}><input type="checkbox" checked={signupConsents.adultNotice} onChange={(e) => setSignupConsents((prev) => ({ ...prev, adultNotice: e.target.checked }))} /><span>[필수] 만 19세 이상 및 성인 서비스 이용 고지 확인</span></label>
                      <label className={`consent-row ${signupConsents.identityNotice ? "checked" : ""}`}><input type="checkbox" checked={signupConsents.identityNotice} onChange={(e) => setSignupConsents((prev) => ({ ...prev, identityNotice: e.target.checked }))} /><span>[필수] 본인확인/성인인증 결과 처리 안내 확인</span></label>
                      <label className={`consent-row ${signupConsents.marketing ? "checked" : ""}`}><input type="checkbox" checked={signupConsents.marketing} onChange={(e) => setSignupConsents((prev) => ({ ...prev, marketing: e.target.checked }))} /><span>[선택] 마케팅 정보 수신 동의</span></label>
                      <label className={`consent-row ${signupConsents.profileOptional ? "checked" : ""}`}><input type="checkbox" checked={signupConsents.profileOptional} onChange={(e) => setSignupConsents((prev) => ({ ...prev, profileOptional: e.target.checked }))} /><span>[선택] 맞춤 추천을 위한 프로필 정보 수집 동의</span></label>
                    </div>
                    <div className="copy-action-row">
                      <button type="button" onClick={advanceSignupStep} disabled={!requiredConsentAccepted}>다음</button>
                      <button type="button" className="ghost-btn" onClick={() => setAuthStandaloneScreen("login")}>로그인 화면으로</button>
                    </div>
                  </div>
                ) : null}
                {signupStep === "account" ? (
                  <div className="stack-gap">
                    <div className="signup-form-grid">
                      <label><span>로그인 수단</span><select value={signupForm.loginMethod} onChange={(e) => setSignupForm((prev) => ({ ...prev, loginMethod: e.target.value as LoginMethod }))}><option value="이메일">이메일</option><option value="카카오">카카오</option></select></label>
                      <label><span>이메일</span><input value={signupForm.email} onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="you@example.com" /></label>
                      <label><span>비밀번호</span><input type="password" value={signupForm.password} onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="비밀번호 입력" /></label>
                      <label><span>표시 이름</span><input value={signupForm.displayName} onChange={(e) => setSignupForm((prev) => ({ ...prev, displayName: e.target.value }))} placeholder="앱에서 보일 이름" /></label>
                      <label className="wide"><span>휴대폰 본인확인 결과 토큰</span><input value={identityVerificationToken} readOnly placeholder="PASS/휴대폰 본인확인 완료 시 서버 토큰이 자동 입력됩니다" /></label>
                      <label><span>성인인증 상태</span><input value={adultVerified ? "완료" : "가입 후 홈/쇼핑 진입 시 1회 추가 인증"} readOnly /></label>
                    </div>
                    <div className="legacy-grid three auth-option-grid">
                      <div className="legacy-box compact"><h3>PASS 인증</h3><p>PASS 기반 본인확인 흐름을 테스트합니다.</p><button type="button" onClick={() => startIdentitySignup("PASS")}>PASS 인증 완료 처리</button></div>
                      <div className="legacy-box compact"><h3>휴대폰 인증</h3><p>휴대폰 인증 흐름을 테스트합니다.</p><button type="button" onClick={() => startIdentitySignup("휴대폰")}>휴대폰 인증 완료 처리</button></div>
                      <div className="legacy-box compact"><h3>카카오 로그인</h3><p>카카오는 로그인 편의 수단으로만 사용합니다.</p><button type="button" className="ghost-btn" onClick={() => setDemoLoginProvider("카카오")}>카카오 로그인 방식 선택</button></div>
                    </div>
                    <div className="copy-action-row">
                      <button type="button" className="ghost-btn" onClick={() => setSignupStep("consent")}>이전</button>
                      <button type="button" onClick={advanceSignupStep} disabled={!signupAccountValid}>다음</button>
                    </div>
                  </div>
                ) : null}
                {signupStep === "profile" ? (
                  <div className="stack-gap">
                    <div className="signup-form-grid profile-edit-grid">
                      <label><span>성별</span><select value={demoProfile.gender} onChange={(e) => setDemoProfile((prev) => ({ ...prev, gender: e.target.value }))}>{profileGenderOptions.map((item) => <option key={item || "blank"} value={item}>{item || "선택 안 함"}</option>)}</select></label>
                      <label><span>연령대</span><select value={demoProfile.ageBand} onChange={(e) => setDemoProfile((prev) => ({ ...prev, ageBand: e.target.value }))}>{profileAgeBandOptions.map((item) => <option key={item || "blank"} value={item}>{item || "선택 안 함"}</option>)}</select></label>
                      <label><span>지역</span><select value={demoProfile.regionCode} onChange={(e) => setDemoProfile((prev) => ({ ...prev, regionCode: e.target.value }))}>{profileRegionOptions.map((item) => <option key={item || "blank"} value={item}>{item || "선택 안 함"}</option>)}</select></label>
                      <label className="wide"><span>관심 카테고리</span><div className="chip-checklist">{interestCategoryOptions.map((item) => <button key={item} type="button" className={`chip-check ${demoProfile.interests.includes(item) ? "active" : ""}`} onClick={() => toggleInterestCategory(item)}>{item}</button>)}</div></label>
                    </div>
                    <div className="copy-action-row">
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

  return (
    <div className="mobile-app-shell">
      <header className="top-header">
        <div className="topbar-row">
          <div className="topbar-side topbar-left">
            <div className="topbar-inline-actions topbar-inline-actions-left">
              <button className={`header-inline-btn header-icon-btn ${overlayMode === "menu" ? "active" : ""}`} onClick={openMenuOverlay} aria-label="메뉴">
                <MenuIcon />
              </button>
              {visibleHeaderNavItems.map((item) => (
                <button key={item.label} type="button" className={`header-inline-btn ${item.active ? "active" : ""}`} onClick={item.onClick} disabled={!item.onClick}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="topbar-side topbar-right">
            <div className="topbar-inline-actions topbar-inline-actions-right">
              <div className="topbar-title-inline" aria-live="polite">{currentScreenTitle}</div>
              <button className={`header-inline-btn header-icon-btn ${overlayMode === "search" ? "active" : ""}`} onClick={() => openOverlay("search")} aria-label="검색">
                <SearchIcon />
              </button>
              <button className={`header-inline-btn header-icon-btn header-notification-btn ${overlayMode === "notifications" ? "active" : ""}`} onClick={() => openOverlay("notifications")} aria-label="알림">
                <BellIcon />
                {unreadNotificationCount > 0 ? <span className="header-badge">{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}</span> : null}
              </button>
              <button className={`header-inline-btn header-icon-btn ${overlayMode === "settings" ? "active" : ""}`} onClick={() => openOverlay("settings")} aria-label="설정">
                <SettingsIcon />
              </button>
            </div>
          </div>
        </div>
      </header>

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
          <section className="overlay-card">
            <div className="overlay-head">
              <strong>{overlayMode === "search" ? "통합 검색" : overlayMode === "notifications" ? "알림" : overlayMode === "menu" ? `${activeTab} 메뉴` : overlayMode === "reconsent_info" ? "필수 문서 재동의 안내" : "설정 카테고리"}</strong>
              <button className="ghost-btn" onClick={() => setOverlayMode(null)}>닫기</button>
            </div>

            {overlayMode === "search" ? (
              <div className="overlay-body stack-gap contextual-search-pane">
                <div className="search-toolbar-grid">
                  <input value={globalKeyword} onChange={(e) => setGlobalKeyword(e.target.value)} placeholder={`${activeTab} 검색어 입력`} />
                  <select value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}>
                    {searchFilterOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="search-toolbar-actions">
                  <button className="ghost-btn" onClick={() => setGlobalKeyword("")}>검색어 초기화</button>
                </div>
                <div className="context-search-results compact-scroll-list">
                  {activeTab === "홈" ? homeSearchResults.map((item) => (
                    <article key={item.id} className="legacy-box compact search-result-card">
                      <div className="split-row"><strong>{item.title}</strong><span>{item.author}</span></div>
                      <p>{item.caption}</p>
                      <span className="community-meta">{item.category}</span>
                    </article>
                  )) : null}
                  {activeTab === "쇼핑" ? shopSearchResults.map((item) => (
                    <article key={item.id} className="legacy-box compact search-result-card">
                      <div className="split-row"><strong>{item.name}</strong><span>{item.price}</span></div>
                      <p>{item.subtitle}</p>
                      <span className="community-meta">{item.category} · {item.badge}</span>
                    </article>
                  )) : null}
                  {activeTab === "소통" ? communitySearchResults.map((item) => (
                    <article key={item.id} className="legacy-box compact search-result-card">
                      <div className="split-row"><strong>{item.title}</strong><span>{item.category}</span></div>
                      <p>{item.summary}</p>
                      <span className="community-meta">{item.meta}</span>
                    </article>
                  )) : null}
                  {activeTab === "채팅" ? chatSearchResults.map((item) => (
                    <article key={item.id} className="legacy-box compact search-result-card">
                      <div className="split-row"><strong>{item.name}</strong><span>{item.kind}</span></div>
                      <p>{item.preview}</p>
                      <span className="community-meta">{item.purpose} · {item.time}</span>
                    </article>
                  )) : null}
                  {activeTab === "프로필" ? profileSearchResults.map((item) => (
                    <article key={item.id} className="legacy-box compact search-result-card">
                      <div className="split-row"><strong>{item.author}</strong><span>{item.category}</span></div>
                      <p>{item.title} · {item.caption}</p>
                    </article>
                  )) : null}
                  {globalKeyword.trim() && ((activeTab === "홈" && homeSearchResults.length === 0) || (activeTab === "쇼핑" && shopSearchResults.length === 0) || (activeTab === "소통" && communitySearchResults.length === 0) || (activeTab === "채팅" && chatSearchResults.length === 0) || (activeTab === "프로필" && profileSearchResults.length === 0)) ? (
                    <div className="legacy-box compact"><p>연관 검색 결과가 없습니다.</p></div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {overlayMode === "notifications" ? (
              <div className="stack-gap notification-overlay-body compact-scroll-list">
                <section className="notification-section-card">
                  <div className="notification-section-head">
                    <div><strong>앱 공지사항</strong><p>약관/정책/업데이트 공지를 알림에서 확인합니다.</p></div>
                  </div>
                  <div className="notification-list">
                    {notificationSections.notices.map((item) => (
                      <article key={item.id} className={`notification-item ${item.unread ? "unread" : ""}`}>
                        <div className="notification-item-copy">
                          <div className="notification-item-topline"><span className="notification-chip">공지</span><span>{item.meta}</span></div>
                          <strong>{item.title}</strong>
                          <p>{item.body}</p>
                        </div>
                        {item.ctaLabel ? <button type="button" className="ghost-btn">{item.ctaLabel}</button> : null}
                      </article>
                    ))}
                    <div className="notification-policy-links">
                      <a className="ghost-link-btn" href={`${getApiBase()}/legal/terms-of-service`} target="_blank" rel="noreferrer">이용약관</a>
                      <a className="ghost-link-btn" href={`${getApiBase()}/legal/privacy-policy`} target="_blank" rel="noreferrer">개인정보 처리방침</a>
                      <a className="ghost-link-btn" href={`${getApiBase()}/legal/youth-policy`} target="_blank" rel="noreferrer">청소년 보호정책</a>
                      <a className="ghost-link-btn" href={`${getApiBase()}/legal/refund-policy`} target="_blank" rel="noreferrer">환불정책</a>
                    </div>
                  </div>
                </section>
                <section className="notification-section-card">
                  <div className="notification-section-head">
                    <div><strong>쇼핑 주문 · 배송 관련 알림</strong><p>주문한 제품 발송 진행 여부와 배송 상태를 분리해 표시합니다.</p></div>
                  </div>
                  <div className="notification-list">
                    {notificationSections.orders.map((item) => (
                      <article key={item.id} className={`notification-item ${item.unread ? "unread" : ""}`}>
                        <div className="notification-item-copy">
                          <div className="notification-item-topline"><span className="notification-chip order">주문</span><span>{item.meta}</span></div>
                          <strong>{item.title}</strong>
                          <p>{item.body}</p>
                        </div>
                        {item.ctaLabel ? <button type="button" className="ghost-btn">{item.ctaLabel}</button> : null}
                      </article>
                    ))}
                  </div>
                </section>
                <section className="notification-section-card">
                  <div className="notification-section-head">
                    <div><strong>커뮤니티 · 댓글 · 채팅 · 기타</strong><p>댓글, 채팅, 운영기준 공지 등 기타 알림을 하단에 배치합니다.</p></div>
                  </div>
                  <div className="notification-list">
                    {notificationSections.community.map((item) => (
                      <article key={item.id} className={`notification-item ${item.unread ? "unread" : ""}`}>
                        <div className="notification-item-copy">
                          <div className="notification-item-topline"><span className="notification-chip community">소통</span><span>{item.meta}</span></div>
                          <strong>{item.title}</strong>
                          <p>{item.body}</p>
                        </div>
                        {item.ctaLabel ? <button type="button" className="ghost-btn">{item.ctaLabel}</button> : null}
                      </article>
                    ))}
                  </div>
                </section>
              </div>
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
                  <button type="button" className="settings-category-btn settings-logout-btn" onClick={handleLogout}>
                    <span>로그아웃</span>
                  </button>
                  {settingsNavItems.map((item) => {
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
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {showBaseTabContent && blockedByIdentity ? (
          <section className="tab-pane fill-pane auth-gate-pane">
            <div className="auth-gate-card stack-gap compact-scroll-list auth-entry-pane">
              <div className="section-head compact-head">
                <div><h2>로그인 / 회원가입</h2><p>로그인과 회원가입은 상단바·하단바가 없는 별도 화면으로 분리했습니다. 아래 버튼으로 독립 화면으로 이동해 진행할 수 있습니다.</p></div>
              </div>
              <div className="legacy-grid two auth-entry-grid">
                <div className="legacy-box compact auth-entry-card">
                  <h3>로그인 화면</h3>
                  <p>테스트 계정 입력, 일반 로그인, 관리자 로그인 확인을 독립 화면에서 진행합니다.</p>
                  <div className="copy-action-row">
                    <button type="button" onClick={() => setAuthStandaloneScreen("login")}>로그인 화면 열기</button>
                  </div>
                </div>
                <div className="legacy-box compact auth-entry-card">
                  <h3>회원가입 화면</h3>
                  <p>필수 동의 → 가입정보 입력 → 선택 프로필 입력 순서의 별도 회원가입 화면으로 이동합니다.</p>
                  <div className="copy-action-row">
                    <button type="button" className="ghost-btn" onClick={() => { setSignupStep("consent"); setAuthStandaloneScreen("signup"); }}>회원가입 화면 열기</button>
                  </div>
                </div>
              </div>
              <div className="legacy-box compact auth-summary-box">
                <h3>테스트 계정 바로 입력</h3>
                <div className="chip-checklist auth-account-chiplist">
                  <button type="button" className="chip-check" onClick={() => { fillTestAccount("customer@example.com", "customer1234"); setAuthStandaloneScreen("login"); }}>회원 계정</button>
                  <button type="button" className="chip-check" onClick={() => { fillTestAccount("admin@example.com", "admin1234"); setAuthStandaloneScreen("login"); }}>관리자 계정</button>
                  <button type="button" className="chip-check" onClick={() => { fillTestAccount("seller@example.com", "seller1234"); setAuthStandaloneScreen("login"); }}>판매자 계정</button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {showBaseTabContent && !blockedByIdentity && requiresAdultGate ? (
          <section className="tab-pane fill-pane adult-gate-pane">
            <div className="adult-gate-card stack-gap compact-scroll-list">
              <div className="section-head compact-head">
                <div><h2>성인 인증 필요</h2><p>{activeTab} 화면은 최초 1회 성인 인증 완료 후 지속 이용 가능하도록 설계했습니다. 홈 또는 쇼핑 중 하나에서 인증이 완료되면 두 화면 모두 접근 가능합니다.</p></div>
              </div>
              <div className="legacy-grid three auth-option-grid">
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
          <section className="tab-pane fill-pane home-feed-pane">
            {homeTab === "피드" ? (
              <>
                <StoryStrip onOpenStory={setSelectedStory} />
                {selectedStory ? (
                  <section className="legacy-box story-preview-card">
                    <div className="split-row"><strong>{selectedStory.name}</strong><button type="button" className="ghost-btn" onClick={() => setSelectedStory(null)}>닫기</button></div>
                    <p>{storyPreviewText[selectedStory.name] ?? "선택한 스토리의 요약입니다."}</p>
                  </section>
                ) : null}
                <div className="feed-post-list compact-scroll-list">{visibleFeed.map((item, idx) => (<><FeedPoster key={item.id} item={item} onAsk={openAskFromFeed} saved={savedFeedIds.includes(item.id)} onToggleSave={toggleSavedFeed} />{(idx + 1) % 4 === 0 ? <SponsoredFeedProductCard key={`sponsored-${item.id}`} item={sponsoredFeedProducts[Math.floor(idx / 4) % sponsoredFeedProducts.length]} saved={savedProductIds.includes(sponsoredFeedProducts[Math.floor(idx / 4) % sponsoredFeedProducts.length].id)} onToggleSave={toggleSavedProduct} /> : null}</>))}</div>
              </>
            ) : homeTab === "상품" ? (
              <>
                <div className="section-head compact-head"><div><h2>추천 상품</h2><p>홈에서 바로 진입하는 추천 상품 카드 모음입니다.</p></div></div>
                <div className="content-grid product-grid compact-scroll-list">
                  {homeProducts.map((product) => (
                    <article key={product.id} className="product-card">
                      <div className="product-thumb" />
                      <span className="product-badge">{product.badge}</span>
                      <strong>{product.name}</strong>
                      <p>{product.subtitle}</p>
                      <div className="product-meta"><span>{product.category}</span><b>{product.price}</b></div>
                      <div className="product-card-actions">
                        <button type="button" className="ghost-btn" onClick={() => toggleSavedProduct(product.id)}>{savedProductIds.includes(product.id) ? "보관해제" : "보관함"}</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="stack-gap compact-scroll-list">
                <div className="section-head compact-head"><div><h2>보관함</h2><p>피드와 상품에서 보관함 버튼을 눌러 저장한 항목을 구분해서 확인합니다.</p></div></div>
                <div className="legacy-nav inline">
                  {["피드", "상품"].map((tab) => (
                    <button key={tab} type="button" className={`legacy-nav-btn ${savedTab === tab ? "active" : ""}`} onClick={() => setSavedTab(tab as "피드" | "상품")}>{tab}</button>
                  ))}
                </div>
                {savedTab === "피드" ? (
                  <div className="feed-post-list compact-scroll-list">
                    {savedFeedItems.length ? savedFeedItems.map((item) => <FeedPoster key={item.id} item={item} onAsk={openAskFromFeed} saved={true} onToggleSave={toggleSavedFeed} />) : <div className="legacy-box compact"><p>보관한 피드가 없습니다.</p></div>}
                  </div>
                ) : (
                  <div className="content-grid product-grid compact-scroll-list">
                    {savedProductItems.length ? savedProductItems.map((product) => (
                      <article key={product.id} className="product-card">
                        <div className="product-thumb" />
                        <span className="product-badge">{product.badge}</span>
                        <strong>{product.name}</strong>
                        <p>{product.subtitle}</p>
                        <div className="product-meta"><span>{product.category}</span><b>{product.price}</b></div>
                        <div className="product-card-actions">
                          <button type="button" className="ghost-btn" onClick={() => toggleSavedProduct(product.id)}>보관해제</button>
                        </div>
                      </article>
                    )) : <div className="legacy-box compact"><p>보관한 상품이 없습니다.</p></div>}
                  </div>
                )}
              </div>
            )}
          </section>
        ) : null}

        {showAppTabContent && activeTab === "쇼핑" ? (
          <section className="tab-pane fill-pane">
            {shoppingTab === "목록" ? (
              <>
                <div className="section-head compact-head">
                  <div><h2>상품 목록</h2><p>카테고리와 검색을 조합해 한 화면 안에서 탐색합니다.</p></div>
                  <div className="section-tools slim-tools">
                    <input value={shopKeyword} onChange={(e) => setShopKeyword(e.target.value)} placeholder="상품명/설명 검색" />
                    <button type="button" className="ghost-btn" onClick={openProductRegistrationTab}>상품등록</button>
                    <button type="button" className="ghost-btn" onClick={openBusinessVerificationTab}>사업자인증</button>
                  </div>
                </div>
                {reconsentWriteRestricted ? <div className="legacy-box compact"><p>유예기간 없이 최신 필수 문서 재동의가 필요합니다. 먼저 필수 문서 안내 화면에서 재동의 정보를 확인한 뒤 주문·문의·상품등록 같은 쓰기 기능을 진행하세요.</p><div className="copy-action-row"><button type="button" className="ghost-btn" onClick={() => { setHomeShopConsentGuideSeen(true); setOverlayMode("reconsent_info"); }}>필수 문서 안내 열기</button></div></div> : null}
                <div className="legacy-grid three">
                  <div className="legacy-box compact"><h3>추천노출 수익화</h3><p>브랜드관/기획전 대신 홈 피드와 질문 피드 사이에 자연스럽게 제품이 노출되는 추천 슬롯만 운영합니다.</p><p>운영 검수 후 문구·이미지·노출 위치를 통제하는 방식으로 설계합니다.</p></div>
                  <div className="legacy-box compact"><h3>프리미엄 배송 멤버십</h3><p>구매자 회원제 기준으로 익명포장, 빠른 출고, 보호포장, 프리미엄 CS를 묶어 제공합니다.</p><ul className="compact-bullet-list">{premiumMemberBenefits.map((item) => <li key={item}>{item}</li>)}</ul></div>
                  <div className="legacy-box compact"><h3>앱 내 안전 소통 구조</h3><p>사람을 직접 찾게 하기보다 정보교류와 질문 흐름을 강화해 구매자 유입을 만듭니다.</p><ul className="compact-bullet-list">{safeCommunityIdeas.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul></div>
                </div>
                <div className="split-layout mobile-split">
                  <aside className="left-menu always-open">
                    <button className={`left-link ${selectedShopCategory === "전체" ? "active" : ""}`} onClick={() => setSelectedShopCategory("전체")}>전체 보기</button>
                    {shopCategories.map((group) => (
                      <div key={group.group} className="menu-group">
                        <div className="menu-group-title">{group.icon} {group.group}</div>
                        {group.items.map((item) => (
                          <button key={item.name} className={`left-link ${selectedShopCategory === item.name ? "active" : ""}`} onClick={() => setSelectedShopCategory(item.name)}>
                            <span>{item.name}</span>
                            <b>{item.count}</b>
                          </button>
                        ))}
                      </div>
                    ))}
                  </aside>
                  <div className="content-grid product-grid compact-scroll-list">
                    {allShopItems.map((product) => (
                      <article key={product.id} className="product-card">
                        <div className="product-thumb" />
                        <span className="product-badge">{product.badge}</span>
                        <strong>{product.name}</strong>
                        <p>{product.subtitle}</p>
                        <div className="product-meta"><span>{product.category}</span><b>{product.price}</b></div>
                        <div className="product-card-actions">
                          <button type="button" onClick={() => addToCart(product.id)}>장바구니 담기</button>
                          <button type="button" className="ghost-btn" onClick={() => toggleSavedProduct(product.id)}>{savedProductIds.includes(product.id) ? "보관해제" : "보관함"}</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {shoppingTab === "주문" ? (
              <div className="stack-gap compact-scroll-list">
                <div className="legacy-grid three">
                  <div className="legacy-box"><h3>주문 진행</h3><p>주문 {orders.length}건 · 결제대기 {orders.filter((item) => item.status === "payment_pending").length}건 · 결제완료 {orders.filter((item) => item.status === "paid").length}건</p></div>
                  <div className="legacy-box"><h3>취소/환불 검증</h3><p>부분 처리 금액 입력값: ₩{Number(orderActionAmount || "0").toLocaleString()}</p></div>
                  <div className="legacy-box"><h3>webhook 점검</h3><p>서명 점검 API와 주문 상태머신을 한 화면에서 검증합니다.</p></div>
                </div>
                <div className="legacy-box">
                  <h3>결제 테스트 센터</h3>
                  <div className="profile-form-grid">
                    <label><span>부분취소/부분환불 금액</span><input value={orderActionAmount} onChange={(e) => setOrderActionAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="5500" /></label>
                    <label><span>API Base</span><input value={getApiBase()} readOnly /></label>
                  </div>
                  <div className="product-card-actions">
                    <button type="button" onClick={confirmSelectedOrder}>선택 주문 결제승인</button>
                    <button type="button" className="ghost-btn" onClick={() => cancelSelectedOrder(false)}>선택 주문 전체취소</button>
                    <button type="button" className="ghost-btn" onClick={() => cancelSelectedOrder(true)}>선택 주문 부분취소</button>
                    <button type="button" className="ghost-btn" onClick={() => refundSelectedOrder(false)}>선택 주문 전체환불</button>
                    <button type="button" className="ghost-btn" onClick={() => refundSelectedOrder(true)}>선택 주문 부분환불</button>
                    <button type="button" className="ghost-btn" onClick={runWebhookSignatureTest}>webhook 점검</button>
                  </div>
                  {selectedOrderNo ? <p className="muted-mini">현재 테스트 대상 주문: {selectedOrderNo}</p> : <p className="muted-mini">주문 목록에서 테스트할 주문을 먼저 선택하세요.</p>}
                  {orderMessage ? <p className="muted-mini">{orderMessage}</p> : null}
                </div>
                <div className="legacy-box compact">
                  <h3>선택 주문 상세 / 결제 스냅샷</h3>
                  {orderDetail ? (
                    <div className="consent-record-list">
                      <div className="simple-list-row multi-line"><div><b>{orderDetail.order.order_no}</b><span>상태 {orderDetail.order.status} · 결제수단 {orderDetail.order.payment_method} · PG {orderDetail.order.payment_pg}</span><span>총액 ₩{Number(orderDetail.order.total_amount || 0).toLocaleString()} · 공급가 ₩{Number(orderDetail.order.supply_amount || 0).toLocaleString()} · VAT ₩{Number(orderDetail.order.vat_amount || 0).toLocaleString()}</span></div></div>
                      <div className="simple-list-row multi-line"><div><b>금액 스냅샷</b><span>결제 ₩{Number(orderDetail.amount_snapshot?.paid_amount || 0).toLocaleString()} · 취소 ₩{Number(orderDetail.amount_snapshot?.cancelled_amount || 0).toLocaleString()} · 환불 ₩{Number(orderDetail.amount_snapshot?.refunded_amount || 0).toLocaleString()} · 잔액 ₩{Number(orderDetail.amount_snapshot?.remaining || 0).toLocaleString()}</span></div></div>
                      <div className="simple-list-row multi-line"><div><b>결제 레코드</b><span>confirmed {String(Boolean(orderDetail.payment_record?.confirmed))} · payment_id {String(orderDetail.payment_record?.payment_id || '-')} · latest {String(orderDetail.payment_record?.latest_status || '-')}</span></div></div>
                      <div className="simple-list-row multi-line"><div><b>주문 품목</b><span>{orderDetail.items.map((item) => `${item.sku_code || item.product_id} x${item.qty}`).join(' · ') || '없음'}</span></div></div>
                      <div className="simple-list-row multi-line"><div><b>결제 이력</b><span>{(orderDetail.payment_record?.history || []).length ? (orderDetail.payment_record?.history || []).map((item) => String(item.action || '-')).join(' → ') : '이력 없음'}</span></div></div>
                    </div>
                  ) : <p>선택한 주문의 상세 정보가 여기에 표시됩니다.</p>}
                </div>
                <div className="legacy-box">
                  <h3>최근 주문</h3>
                  <div className="chat-list">
                    {orders.length ? orders.slice().reverse().map((item, index) => <article key={item.order_no} className="chat-row simple-row"><div className="avatar-circle">{String(index + 1).padStart(2, '0')}</div><div className="chat-copy"><strong>{item.order_no}</strong><span>총액 ₩{Number(item.total_amount || 0).toLocaleString()} · PG {item.payment_pg}</span><p>상태 {item.status} · 정산 {item.settlement_status} · 품목 {item.item_count}건</p></div><div className="chat-meta"><span>{item.payment_method}</span><b>{item.status}</b><button type="button" className="ghost-btn" onClick={() => selectOrderForTesting(item.order_no)}>주문선택</button></div></article>) : <p>로그인 후 주문을 생성하면 이곳에 표시됩니다.</p>}
                  </div>
                </div>
              </div>
            ) : null}

            {shoppingTab === "바구니" ? (
              <div className="cart-box compact-scroll-list">
                {cartDetailedItems.length ? cartDetailedItems.map((item) => (
                  <div key={item.productId} className="cart-row"><div><strong>{item.product.name}</strong><span>{item.product.category} · 수량 {item.qty}</span></div><b>₩{(Number(item.product.price || 0) * item.qty).toLocaleString()}</b></div>
                )) : cartSeed.map((item) => (
                  <div key={item.id} className="cart-row"><div><strong>{item.name}</strong><span>{item.option} · 수량 {item.qty}</span></div><b>{item.price}</b></div>
                ))}
                <div className="cart-summary"><span>총 결제 예정</span><strong>{cartDetailedItems.length ? `₩${cartTotalAmount.toLocaleString()}` : '₩112,500'}</strong></div>
                <div className="product-card-actions">
                  <button type="button" onClick={createOrderFromCart}>주문 생성</button>
                  <button type="button" className="ghost-btn" onClick={() => setShoppingTab('주문')}>주문 탭 보기</button>
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

            {shoppingTab === "상품등록" ? (
              <div className="stack-gap compact-scroll-list">
                <div className="section-head compact-head"><div><h2>상품등록</h2><p>{sellerApprovalReady ? '테스트용 상품을 등록하고 주문·결제·취소·환불·webhook 흐름 검증에 사용할 수 있습니다.' : '사업자 미인증 계정은 먼저 사업자인증 탭에서 인증 신청과 승인 절차를 완료해야 합니다.'}</p></div></div>
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
                    <div className="legacy-grid two-col compact-grid">
                      <div className="legacy-box compact"><h3>등록 준비 체크</h3><ul className="compact-bullet-list"><li>카테고리, 상품명, 사진등록 5장, 상품소개, 가격, 개수, 상품 코드</li><li>{isAdmin ? '관리자 계정 예외로 즉시 테스트 등록 가능' : '사업자 인증 승인 계정 여부 확인'}</li><li>PG 연동 전 상품 정책/환불정책/금지상품 규칙 확정</li><li>성인 노출 등급 및 결제 가능 범위 지정</li></ul></div>
                      <div className="legacy-box compact"><h3>공개 조건</h3><p>{isAdmin ? '관리자 계정이 등록한 상품은 자동 공개 처리되어 일반 회원 목록에서도 바로 확인할 수 있게 반영됩니다.' : '일반 사업자 계정은 임시저장 후 승인대기 제출을 거쳐 관리자 승인 시 공개됩니다.'}</p><p>이 구조로 주문 생성 후 결제/취소/부분취소/환불/webhook 흐름을 점검할 수 있습니다.</p></div>
                    </div>
                    <div className="legacy-box compact">
                      <h3>상품 등록 화면</h3>
                      <div className="profile-form-grid">
                        <label><span>카테고리</span><select value={productRegistrationDraft.category} onChange={(e) => setProductRegistrationDraft((prev) => ({ ...prev, category: e.target.value }))}>{shopCategories.flatMap((group) => group.items).map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
                        <label><span>상품명</span><input value={productRegistrationDraft.name} onChange={(e) => setProductRegistrationDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="상품명" /></label>
                        <label><span>가격</span><input value={productRegistrationDraft.price} onChange={(e) => setProductRegistrationDraft((prev) => ({ ...prev, price: e.target.value }))} placeholder="10000" /></label>
                        <label><span>개수</span><input value={productRegistrationDraft.stockQty} onChange={(e) => setProductRegistrationDraft((prev) => ({ ...prev, stockQty: e.target.value }))} placeholder="10" /></label>
                        <label><span>상품 코드</span><input value={productRegistrationDraft.skuCode} onChange={(e) => setProductRegistrationDraft((prev) => ({ ...prev, skuCode: e.target.value }))} placeholder="SKU-0001" /></label>
                        <label className="wide"><span>상품소개</span><textarea value={productRegistrationDraft.description} onChange={(e) => setProductRegistrationDraft((prev) => ({ ...prev, description: e.target.value }))} placeholder="상품 소개" /></label>
                        <label className="wide"><span>사진 등록 (최대 5장 URL)</span><div className="photo-url-grid">{productRegistrationDraft.imageUrls.map((value, idx) => <input key={idx} value={value} onChange={(e) => setProductRegistrationDraft((prev) => ({ ...prev, imageUrls: prev.imageUrls.map((item, itemIdx) => itemIdx === idx ? e.target.value : item) }))} placeholder={`사진 ${idx + 1} URL`} />)}</div></label>
                      </div>
                      {reconsentWriteRestricted ? <p className="muted-mini">유예기간 없이 최신 필수 문서 재동의가 필요합니다. 먼저 필수 문서 안내 화면에서 최신 약관과 재동의 절차를 확인하세요.</p> : null}
                      <div className="copy-action-row">
                        <button type="button" onClick={() => submitProductRegistration("draft")} disabled={!sellerApprovalReady || !productDraftReady || reconsentWriteRestricted}>임시저장</button>
                        <button type="button" onClick={() => submitProductRegistration("publish")} disabled={!sellerApprovalReady || !productDraftReady || reconsentWriteRestricted}>상품등록</button>
                        <button type="button" className="ghost-btn" onClick={openBusinessVerificationTab}>사업자인증 수정</button>
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
              <div className="stack-gap compact-scroll-list">
                <div className="section-head compact-head"><div><h2>포럼</h2><p>주제형 그룹방 참여를 시작점으로 정보 교류와 고민 대화를 이어갑니다.</p></div></div>
                <div className="legacy-box compact">
                  <h3>포럼 기반 1:1 시작점</h3>
                  <div className="copy-action-row wrap-row">
                    {forumStarterTopics.map((item) => (
                      <button key={item} type="button" className={forumTopic === item ? "" : "ghost-btn"} onClick={() => setForumTopic(item)}>{item}</button>
                    ))}
                  </div>
                  <div className="consent-record-list">
                    {forumVisibleUsers.map((user) => {
                      const following = followingUserIds.includes(user.id);
                      const mutual = mutualFollowIds.includes(user.id);
                      return (
                        <div key={user.id} className="simple-list-row multi-line">
                          <div>
                            <b>{user.name}</b>
                            <span>{user.role} · {user.topic}</span>
                            <span>{accountPrivate && !mutual ? "이 계정은 상호 팔로잉한 계정 외에는 비공개입니다." : user.intro}</span>
                          </div>
                          <div className="copy-action-row">
                            <button type="button" className={following ? "ghost-btn" : ""} onClick={() => toggleFollowUser(user.id)}>{following ? "팔로잉" : "친구 추가"}</button>
                            <button type="button" className="ghost-btn" onClick={() => openDmRequest(user)} disabled={!mutual}>1:1 요청</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="legacy-box compact">
                  <h3>단체 톡방</h3>
                  <p>성인인증 완료 회원은 가입 유예기간 없이 단체 톡방을 자유롭게 개설할 수 있습니다. 단, 신고 누적으로 정지기간이 반영된 계정은 그 기간 동안 개설이 제한됩니다. 이 공간은 정보 교류와 고민상담용이며 사람 찾기, 만남, 주선은 허용하지 않습니다.</p>
                  <div className="consent-record-list compact-list">
                    {groupRoomNoticeItems.map((item) => <div key={item} className="simple-list-row"><b>안내</b><span>{item}</span></div>)}
                  </div>
                  <div className="legacy-box compact"><h3>앱 내부 공유 허용</h3><p>사진/영상/파일 전송은 막되, 앱 내부의 홈 피드·상품·보관함·쇼핑 목록·주문·바구니 항목은 채팅방으로 공유해 불러올 수 있게 유지합니다.</p><div className="copy-action-row wrap-row">{internalShareSources.map((item) => <span key={item} className="question-profile-chip">{item}</span>)}</div></div>
                  <div className="random-room-toolbar grouped-room-toolbar">
                    <select className="random-room-select" value={randomRoomCategory} onChange={(e) => setRandomRoomCategory(e.target.value as RandomRoomCategory)}>
                      {randomRoomCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                    <button className="random-room-create-btn" onClick={() => setRoomModalOpen(true)}>개설</button>
                  </div>
                  <div className="random-room-list compact-scroll-list">
                    {filteredRandomRooms.map((room) => (
                      <article key={room.id} className="random-room-card grouped-room-card">
                        <div className="random-room-topline">
                          <span className="random-room-category-chip">{room.category}</span>
                          <div className="random-room-occupancy">현원</div>
                        </div>
                        <div className="random-room-middleline grouped-room-title-line">
                          <strong>{room.title}</strong>
                          <b>{room.currentPeople}/{room.maxPeople}</b>
                        </div>
                        <p>{room.latestMessage}{room.password ? " · 비밀번호 있음" : ""}{room.anonymous ? " · 익명방" : ""}</p>
                        <div className="copy-action-row wrap-row">
                          <button type="button" className="ghost-btn" onClick={() => openRandomRoom(room.id)}>입장</button>
                          <button type="button" className="ghost-btn">앱내 공유</button>
                        </div>
                      </article>
                    ))}
                  </div>
                  {activeRandomRoom ? (
                    <div className="legacy-box compact">
                      <div className="split-row"><h3>{activeRandomRoom.title}</h3><span>{activeRandomRoom.category}</span></div>
                      <p>이 방은 정보교류/고민상담용입니다. 사람 찾기, 만남, 주선은 금지되며 사진/영상/파일 전송은 차단됩니다.</p>
                      <div className="copy-action-row wrap-row">
                        {internalShareSources.map((item) => <button key={item} type="button" className="ghost-btn">{item} 공유</button>)}
                      </div>
                      <div className="copy-action-row wrap-row">
                        <button type="button" className="ghost-btn" onClick={() => reportRandomRoom(activeRandomRoom)}>신고</button>
                        <button type="button" className="ghost-btn" onClick={leaveRandomRoom}>나가기</button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <div className="section-head compact-head">
                  <div><h2>소통</h2><p>{communityTab === "커뮤" ? "커뮤니티 글과 공지, 정보공유를 확인합니다." : communityTab === "후기" ? "후기 글 모음을 확인합니다." : "이벤트 공지를 확인합니다."}</p></div>
                  <div className="section-tools slim-tools"><input value={communityKeyword} onChange={(e) => setCommunityKeyword(e.target.value)} placeholder="게시글 검색" /></div>
                </div>
                <div className="legacy-box compact">
                  <h3>앱 내 구매자 활성화용 소통 구조</h3>
                  <div className="consent-record-list">
                    {safeCommunityIdeas.map((item, idx) => <div key={item} className="simple-list-row"><b>{idx + 1}</b><span>{item}</span></div>)}
                  </div>
                </div>
                <div className="split-layout mobile-split">
                  <aside className="left-menu always-open slim-left-menu">
                    <button className={`left-link ${selectedCommunityCategory === "전체" ? "active" : ""}`} onClick={() => setSelectedCommunityCategory("전체")}>전체 글</button>
                    {communityCategories.map((category) => (
                      <button key={category} className={`left-link ${selectedCommunityCategory === category ? "active" : ""}`} onClick={() => setSelectedCommunityCategory(category)}>{category}</button>
                    ))}
                  </aside>
                  <div className="community-list compact-scroll-list">
                    {filteredCommunity.map((post) => (
                      <article key={post.id} className="community-card">
                        <span className="community-chip">{post.category}</span>
                        <strong>{post.title}</strong>
                        <p>{post.summary}</p>
                        <div className="community-meta">{post.meta}</div>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        ) : null}

        {showAppTabContent && activeTab === "채팅" ? (
          <section className="tab-pane fill-pane">
            {chatTab === "질문" ? (
              <div className="question-board compact-scroll-list">
                <div className="section-head compact-head"><div><h2>질문</h2><p>historyprofile 질문 화면 흐름을 참고한 카드형 질문/답변 화면입니다.</p></div></div>
                <div className="question-profile-hero">
                  <div className="question-profile-copy">
                    <span className="question-profile-chip">질문 허용</span>
                    <strong>adult official · 질문 프로필</strong>
                    <p>질문을 받고 답변을 공개 카드로 정리하는 화면 예시입니다. 상단/중간 광고 영역도 함께 배치했습니다.</p>
                  </div>
                  <div className="question-profile-actions">
                    <button>질문하기</button>
                    <button className="ghost-btn">공유</button>
                  </div>
                </div>
                <div className="ad-banner ad-banner-top">
                  <span>Google AdSense 영역</span>
                  <strong>질문 화면 상단 광고</strong>
                </div>
                <div className="question-list">
                  {filteredQuestions.map((item, idx) => (
                    <>
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
                          <button>좋아요 {item.likes}</button>
                          <button>댓글 {item.comments}</button>
                          <button>공유</button>
                          <button>저장</button>
                        </div>
                      </article>
                      {idx === 0 ? (
                        <div className="ad-banner ad-banner-inline" key={`ad-${item.id}`}>
                          <span>Google AdSense 영역</span>
                          <strong>질문 피드 중간 광고</strong>
                        </div>
                      ) : null}
                    </>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="section-head compact-head"><div><h2>채팅</h2><p>요청 → 수락 이후 시작되는 1:1과 운영 문의/주문 문의 채팅을 확인합니다.</p></div></div>
                <div className="chat-toolbar kakao-toolbar">
                  <div className="chat-category-scroll">
                    {chatCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={`category-chip ${chatCategory === category ? "active" : ""}`}
                        onClick={() => setChatCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                {chatCategory === "단체" ? (
                  <div className="legacy-box compact"><p>단체 톡방은 소통 {">"} 포럼으로 이동되었습니다. 상단 메뉴에서 포럼을 열어 주세요.</p></div>
                ) : null}
                <div className="chat-list compact-scroll-list kakao-chat-list">
                  {filteredThreads.map((thread) => (
                    <article key={thread.id} className="chat-row kakao-chat-row">
                      <div className="avatar-circle kakao-avatar">{thread.avatar}</div>
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
                  ))}
                </div>
              </>
            )}
          </section>
        ) : null}

                {showAppTabContent && activeTab === "프로필" ? (
          <section className="tab-pane fill-pane">
            <div className="profile-shell compact-scroll-list profile-shell-single">
              <div className="profile-card">
                <div className="profile-avatar">A</div>
                <strong>adult official</strong>
                <span>운영/브랜드/판매자 통합 프로필 예시</span>
                <div className="profile-stats">
                  {profileStats.map((stat) => (
                    <div key={stat.label}><b>{stat.value}</b><span>{stat.label}</span></div>
                  ))}
                </div>
              </div>
              <div className="profile-card auth-status-card">
                <strong>회원가입 / 인증 상태</strong>
                <span>로그인 수단: {demoLoginProvider} · 가입 전 본인확인: {identityVerified ? `${identityMethod} 완료` : "미완료"} · 성인인증: {adultVerified ? "완료" : "미완료"}</span>
                <div className="profile-stats">
                  <div><b>{adultFailCount}</b><span>실패횟수</span></div>
                  <div><b>{adultCooldownRemainMinutes > 0 ? `${adultCooldownRemainMinutes}분` : "없음"}</b><span>쿨타임</span></div>
                  <div><b>{randomProfileReady ? "완료" : "보완필요"}</b><span>포럼 심사 참고값</span></div>
                </div>
                <div className="copy-action-row">
                  <button type="button" onClick={() => setAuthStandaloneScreen("login")}>로그인 화면</button>
                  <button type="button" className="ghost-btn" onClick={() => { setSignupStep("consent"); setAuthStandaloneScreen("signup"); }}>회원가입 화면</button>
                  <button type="button" className="ghost-btn" onClick={() => startIdentitySignup("PASS")}>PASS 인증</button>
                  <button type="button" className="ghost-btn" onClick={() => setDemoLoginProvider("카카오")}>카카오 로그인</button>
                  <button type="button" onClick={() => attemptAdultVerification("success")}>성인인증 성공</button>
                  <button type="button" className="ghost-btn" onClick={resetAdultFlow}>상태 초기화</button>
                </div>
              </div>
              <div className="profile-card auth-status-card">
                <strong>선택 프로필 / 제한 포럼 심사용 참고값</strong>
                <span>성별, 연령대, 지역은 일반 가입 단계에서는 선택 입력이며, 제한 웹 포럼 운영 시에는 내부 심사/안전 운영 참고 정보로만 사용합니다.</span>
                <div className="signup-form-grid profile-edit-grid">
                  <label><span>성별</span><select value={demoProfile.gender} onChange={(e) => setDemoProfile((prev) => ({ ...prev, gender: e.target.value }))}>{profileGenderOptions.map((item) => <option key={item || "blank"} value={item}>{item || "선택 안 함"}</option>)}</select></label>
                  <label><span>연령대</span><select value={demoProfile.ageBand} onChange={(e) => setDemoProfile((prev) => ({ ...prev, ageBand: e.target.value }))}>{profileAgeBandOptions.map((item) => <option key={item || "blank"} value={item}>{item || "선택 안 함"}</option>)}</select></label>
                  <label><span>지역</span><select value={demoProfile.regionCode} onChange={(e) => setDemoProfile((prev) => ({ ...prev, regionCode: e.target.value }))}>{profileRegionOptions.map((item) => <option key={item || "blank"} value={item}>{item || "선택 안 함"}</option>)}</select></label>
                  <label className="wide"><span>관심 카테고리</span><div className="chip-checklist">{interestCategoryOptions.map((item) => <button key={item} type="button" className={`chip-check ${demoProfile.interests.includes(item) ? "active" : ""}`} onClick={() => toggleInterestCategory(item)}>{item}</button>)}</div></label>
                </div>
                {!randomProfileReady ? <p>미입력 항목: {randomProfileMissing.join(", ")} · 미입력 시에도 앱 공개영역 이용은 가능하지만, 제한 웹 포럼 승인 심사 시 보완 요청이 발생할 수 있습니다.</p> : <p>제한 웹 포럼 심사용 선택 프로필 입력이 완료되었습니다.</p>}
              </div>
              <div className="profile-card auth-status-card">
                <strong>동의 이력 저장 예시</strong>
                <span>필수·선택 동의를 분리 저장하고, 약관/처리방침 버전을 함께 기록하는 구조를 권장합니다.</span>
                <div className="consent-record-list">
                  {consentRecordsPreview.map((item) => (
                    <div key={item.consent_type} className="simple-list-row"><b>{item.consent_type}</b><span>{item.agreed ? "동의" : "미동의"} · {item.required ? "필수" : "선택"} · {item.version}</span></div>
                  ))}
                </div>
              </div>
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

      <nav className="bottom-nav">        {mobileTabs.map((tab) => (
          <button key={tab} className={`bottom-nav-btn ${overlayMode === null && activeTab === tab ? "active" : ""}`} onClick={() => selectBottomTab(tab)}>
            <span>{tab}</span>
          </button>
        ))}
      </nav>

      {selectedAskProfile ? <AskProfileScreen profile={selectedAskProfile} onClose={() => setSelectedAskProfile(null)} /> : null}

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
              <div className="consent-checklist">
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


