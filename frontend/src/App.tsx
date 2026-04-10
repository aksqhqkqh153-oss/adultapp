import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { getJson } from "./lib/api";

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
const legacyMenu = ["운영현황", "주문관리", "보안", "앱심사", "채팅-랜덤 규칙", "배포가이드"] as const;
const homeTabs = ["피드", "상품"] as const;
const shoppingTabs = ["목록", "주문", "바구니"] as const;
const communityTabs = ["커뮤", "후기", "이벤트"] as const;
const chatTabs = ["채팅", "랜덤", "질문"] as const;
const profileTabs = ["내정보"] as const;
const settingsCategories = ["일반", "계정", "알림", "보안", "배포", "운영", "관리자모드", "DB관리", "신고", "채팅", "기타", "HTML요소"] as const;
const randomRoomCategories = ["전체", "고민/상담", "정보공유", "일상대화", "취미/관심사", "자유주제"] as const;
const chatCategories = ["전체", "즐겨찾기", "개인", "단체", "쇼핑"] as const;
const oneToOneRandomCategories = ["고민상담", "자유수다", "아무말대잔치", "도파민수다"] as const;
const randomGenderOptions = ["무관", "남", "여", "기타"] as const;
const randomRegionOptions = ["무관", "같은 지역 우선", "거리기반"] as const;
const randomEntryTabs = ["시작", "목록"] as const;
const adminModeTabs = ["DB관리", "신고", "채팅", "기타"] as const;


type MobileTab = (typeof mobileTabs)[number];
type LegacyTab = (typeof legacyMenu)[number];
type HomeTab = (typeof homeTabs)[number];
type ShoppingTab = (typeof shoppingTabs)[number];
type CommunityTab = (typeof communityTabs)[number];
type ChatTab = (typeof chatTabs)[number];
type ProfileTab = (typeof profileTabs)[number];
type SettingsCategory = (typeof settingsCategories)[number];
type RandomRoomCategory = (typeof randomRoomCategories)[number];
type ChatCategory = (typeof chatCategories)[number];
type OneToOneRandomCategory = (typeof oneToOneRandomCategories)[number];
type RandomGenderOption = (typeof randomGenderOptions)[number];
type RandomRegionOption = (typeof randomRegionOptions)[number];
type RandomEntryTab = (typeof randomEntryTabs)[number];
type AdminModeTab = (typeof adminModeTabs)[number];
type OverlayMode = "search" | "settings" | null;
type DemoLoginProvider = "PASS" | "휴대폰" | "카카오";
type AdultGateView = "intro" | "success" | "failed" | "minor";

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
      <path d="M12 3.2l1.64 1.03 1.92-.25 1.17 1.55 1.85.58.26 1.92 1.55 1.17-.25 1.92L20.8 12l1.03 1.64-.25 1.92-1.55 1.17-.26 1.92-1.85.58-1.17 1.55-1.92-.25L12 20.8l-1.64 1.03-1.92-.25-1.17-1.55-1.85-.58-.26-1.92-1.55-1.17.25-1.92L3.2 12 2.17 10.36l.25-1.92 1.55-1.17.26-1.92 1.85-.58 1.17-1.55 1.92.25L12 3.2Z" fill="none" stroke="currentColor" strokeWidth="1.95" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3.25" fill="none" stroke="currentColor" strokeWidth="2.1" />
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

const communityCategories = ["공지", "정보공유", "후기", "판매자소식", "이벤트"] as const;

const communitySeed: CommunityPost[] = [
  { id: 1, category: "공지", title: "안전모드 기준 및 커뮤니티 운영 원칙", summary: "앱 공개영역에서 허용되는 표현과 금지되는 표현을 한 번에 정리합니다.", meta: "관리자 · 오늘" },
  { id: 2, category: "정보공유", title: "익명포장 SOP와 반품 회수 체크포인트", summary: "판매자/고객 모두 확인할 수 있는 실무형 요약 카드입니다.", meta: "운영팀 · 2시간 전" },
  { id: 3, category: "후기", title: "사진 피드형 상품 리뷰 구성 예시", summary: "사진·짧은 영상·요약문이 결합된 소통 공간 예시입니다.", meta: "brand_note · 4시간 전" },
  { id: 4, category: "판매자소식", title: "신규 카테고리 승인 대기 상품 현황", summary: "판매자센터에서 확인 중인 상품들을 카테고리별로 묶어서 보여줍니다.", meta: "seller_studio · 어제" },
  { id: 5, category: "이벤트", title: "앱 심사 safe UI 점검 이벤트", summary: "모바일 노출 점검과 신고 흐름 확인용 공지입니다.", meta: "프로덕트팀 · 어제" },
];

const threadSeed: ThreadItem[] = [
  { id: 101, name: "운영 문의", purpose: "상품/운영 문의", preview: "결제 허용 SKU 범위를 다시 확인 부탁드립니다.", time: "오전 9:41", unread: 2, avatar: "운", kind: "개인", favorite: true, status: "고정" },
  { id: 102, name: "seller_studio", purpose: "판매자 1:1", preview: "승인 대기 상품 이미지 규격을 수정했습니다.", time: "오전 8:12", unread: 0, avatar: "S", kind: "개인", favorite: true },
  { id: 103, name: "brand_note", purpose: "콘텐츠 응답", preview: "피드형 홈 카드 노출 순서 제안 드립니다.", time: "어제", unread: 1, avatar: "B", kind: "개인" },
  { id: 104, name: "customer demo", purpose: "구매자 지원", preview: "장바구니와 프로필 연동 상태를 확인하고 싶어요.", time: "어제", unread: 0, avatar: "C", kind: "개인" },
  { id: 105, name: "정산 지원", purpose: "정산/환불", preview: "환불 검수 상태를 오늘 안으로 공유드릴게요.", time: "4월 8일", unread: 3, avatar: "정", kind: "개인", favorite: true },
  { id: 106, name: "notice bot", purpose: "시스템 안내", preview: "새로운 공지와 이벤트가 등록되었습니다.", time: "4월 7일", unread: 0, avatar: "N", kind: "단체", status: "알림" },
];

const randomRoomSeed: RandomRoom[] = [
  { id: 2001, title: "고민 나눔방", category: "고민/상담", maxPeople: 6, currentPeople: 3, password: "", latestMessage: "오늘 있었던 일부터 편하게 이야기해요." },
  { id: 2002, title: "정보공유 오픈룸", category: "정보공유", maxPeople: 8, currentPeople: 5, password: "1234", latestMessage: "익명포장, 결제, 보관 팁을 정리해두었습니다." },
  { id: 2003, title: "퇴근 후 일상대화", category: "일상대화", maxPeople: 5, currentPeople: 2, password: "", latestMessage: "가볍게 하루 있었던 일을 나누는 방입니다." },
  { id: 2004, title: "취미/관심사 잡담", category: "취미/관심사", maxPeople: 10, currentPeople: 7, password: "", latestMessage: "취미, 루틴, 관심 주제를 자유롭게 나눠요." },
  { id: 2005, title: "주제 자유 토크", category: "자유주제", maxPeople: 4, currentPeople: 1, password: "5678", latestMessage: "규칙만 지키면 어떤 주제든 이야기 가능합니다." },
  { id: 2006, title: "오늘의 고민", category: "고민/상담", maxPeople: 6, currentPeople: 4, password: "", latestMessage: "익명으로 편하게 고민을 적어주세요." },
  { id: 2007, title: "초보 정보공유", category: "정보공유", maxPeople: 8, currentPeople: 6, password: "", latestMessage: "입문자가 보기 쉬운 정보만 모아두는 방입니다." },
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

function FeedPoster({ item, onAsk }: { item: FeedItem; onAsk: (item: FeedItem) => void }) {
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

  if (section === "채팅-랜덤 규칙") {
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

function SettingSection({ category, isAdmin, legacySection, setLegacySection, projectStatus, deployGuide, currentUserRole, adminModeTab, setAdminModeTab, adminDbManage, htmlInspectorEnabled, setHtmlInspectorEnabled }: {
  category: SettingsCategory;
  isAdmin: boolean;
  legacySection: LegacyTab;
  setLegacySection: (section: LegacyTab) => void;
  projectStatus: ProjectStatus | null;
  deployGuide: DeployGuide | null;
  currentUserRole: string;
  adminModeTab: AdminModeTab;
  setAdminModeTab: (section: AdminModeTab) => void;
  adminDbManage: AdminDbManage | null;
  htmlInspectorEnabled: boolean;
  setHtmlInspectorEnabled: (value: boolean) => void;
}) {
  if (category === "일반") {
    return (
      <div className="settings-grid settings-two-col">
        <div className="legacy-box compact"><h3>레이아웃</h3><p>상단/하단 높이를 축소하고 각 버튼 영역을 분리한 1줄 구조를 유지합니다.</p></div>
        <div className="legacy-box compact"><h3>탭 구조</h3><p>홈/쇼핑/소통/채팅/프로필별 좌측 서브탭과 우측 검색·설정 구조를 통일했습니다.</p></div>
      </div>
    );
  }
  if (category === "계정") {
    return (
      <div className="settings-grid settings-two-col">
        <div className="legacy-box compact"><h3>현재 역할</h3><p>{currentUserRole}</p></div>
        <div className="legacy-box compact"><h3>프로필 접근</h3><p>내정보, 작성 글, 업로드 상품, 통계 카드를 확인할 수 있습니다.</p></div>
      </div>
    );
  }
  if (category === "알림") {
    return (
      <div className="settings-grid settings-two-col">
        <div className="legacy-box compact"><h3>주문/결제 알림</h3><p>주문상태, 결제대기, 환불 요청을 목록 기준으로 묶어 표시합니다.</p></div>
        <div className="legacy-box compact"><h3>채팅 알림</h3><p>채팅 미확인 수, 랜덤방, 질문응답 알림을 분리해서 보여줍니다.</p></div>
      </div>
    );
  }
  if (category === "보안") {
    return (
      <div className="settings-grid settings-two-col">
        <div className="legacy-box compact"><h3>권한 가드</h3><p>관리자 전용 운영 항목은 관리자 계정일 때만 노출됩니다.</p></div>
        <div className="legacy-box compact"><h3>API 연결</h3><p>Production API timeout/fallback과 재시도를 유지합니다.</p></div>
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
  const [randomMatchNote, setRandomMatchNote] = useState("카테고리를 고른 뒤 텍스트 전용 랜덤채팅을 시작할 수 있습니다.");
  const randomRoomLifetimeMinutes = 20;
  const [shopKeyword, setShopKeyword] = useState("");
  const [communityKeyword, setCommunityKeyword] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null);
  const [deployGuide, setDeployGuide] = useState<DeployGuide | null>(null);
  const [adminDbManage, setAdminDbManage] = useState<AdminDbManage | null>(null);
  const [randomRooms, setRandomRooms] = useState<RandomRoom[]>(randomRoomSeed);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [newRoomCategory, setNewRoomCategory] = useState<Exclude<RandomRoomCategory, "전체">>("고민/상담");
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const [newRoomAnonymous, setNewRoomAnonymous] = useState(true);
  const [newRoomMaxPeople, setNewRoomMaxPeople] = useState("8");
  const [newRoomPassword, setNewRoomPassword] = useState("");
  const [currentUserRole] = useState(() => {
    if (typeof window === "undefined") return "ADMIN";
    return (window.localStorage.getItem("adultapp_demo_role") ?? "ADMIN").toUpperCase();
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

  const isAdmin = ["ADMIN", "1", "GRADE_1"].includes(currentUserRole);

  useEffect(() => {
    getJson<ProjectStatus>("/project-status").then(setProjectStatus).catch(() => null);
    getJson<DeployGuide>("/deploy/cloudflare-pages-manual").then(setDeployGuide).catch(() => null);
    if (isAdmin) {
      getJson<AdminDbManage>("/admin/chat-random/db-manage").then(setAdminDbManage).catch(() => null);
    }
  }, [isAdmin]);

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

  const visibleRandomMatchRooms = useMemo(() => randomRooms
    .filter((room) => room.kind === "random_1to1")
    .sort((a, b) => {
      if ((a.status ?? "active") !== (b.status ?? "active")) return (a.status ?? "active") === "active" ? -1 : 1;
      const aTime = a.status === "ended" ? (a.endedAt ?? 0) : (a.expiresAt ?? 0);
      const bTime = b.status === "ended" ? (b.endedAt ?? 0) : (b.expiresAt ?? 0);
      return bTime - aTime;
    }), [randomRooms]);

  const visibleFeed = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    return !keyword ? feedSeed : feedSeed.filter((item) => `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase().includes(keyword));
  }, [globalKeyword]);

  const allShopItems = useMemo(() => {
    const keyword = `${shopKeyword} ${globalKeyword}`.trim().toLowerCase();
    return productsSeed.filter((product) => {
      const matchCategory = selectedShopCategory === "전체" || product.category === selectedShopCategory;
      const matchKeyword = !keyword || `${product.name} ${product.subtitle} ${product.category}`.toLowerCase().includes(keyword);
      return matchCategory && matchKeyword;
    });
  }, [selectedShopCategory, shopKeyword, globalKeyword]);

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
    return threadSeed.filter((thread) => {
      const categoryMatch = chatCategory === "전체"
        || (chatCategory === "즐겨찾기" && !!thread.favorite)
        || (chatCategory === "개인" && thread.kind === "개인")
        || (chatCategory === "단체" && thread.kind === "단체")
        || (chatCategory === "쇼핑" && /상품|판매자|구매자|주문|운영 문의/.test(`${thread.name} ${thread.purpose}`));
      const keywordMatch = !keyword || `${thread.name} ${thread.preview} ${thread.purpose}`.toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });
  }, [globalKeyword, chatCategory]);

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

  const startIdentitySignup = (provider: DemoLoginProvider) => {
    setDemoLoginProvider(provider);
    setIdentityVerified(true);
    setAdultGateView("intro");
    if (["홈", "쇼핑"].includes(activeTab)) {
      setAdultPromptOpen(true);
    }
  };

  const resetAdultFlow = () => {
    setDemoLoginProvider("카카오");
    setIdentityVerified(false);
    setAdultVerified(false);
    setAdultFailCount(0);
    setAdultCooldownUntil(0);
    setAdultGateView("intro");
    setAdultPromptOpen(false);
  };

  const attemptAdultVerification = (mode: "success" | "fail" | "minor") => {
    if (adultCooldownUntil > Date.now()) {
      setAdultGateView("failed");
      return;
    }
    if (mode === "success") {
      setAdultVerified(true);
      setAdultFailCount(0);
      setAdultCooldownUntil(0);
      setAdultGateView("success");
      setAdultPromptOpen(false);
      return;
    }
    if (mode === "minor") {
      setAdultVerified(false);
      setAdultGateView("minor");
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
        고민상담: { name: "익명 상담 파트너", nickname: "달빛고민러" },
        자유수다: { name: "자유수다 메이트", nickname: "수다한잔" },
        아무말대잔치: { name: "아무말 메이트", nickname: "말풍선친구" },
        도파민수다: { name: "도파민 토커", nickname: "텐션부스터" },
      };
      const picked = demoMatches[oneToOneCategory];
      const roomId = Date.now();
      const createdRoom: RandomRoom = {
        id: roomId,
        title: `${oneToOneCategory} · 1:1랜덤채팅`,
        category: oneToOneCategory,
        maxPeople: 2,
        currentPeople: 2,
        password: "",
        latestMessage: `${picked.nickname} 님과 랜덤채팅이 연결되었습니다. 목록에서 선택하면 채팅방으로 들어갑니다.`,
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
    setRandomMatchNote("랜덤채팅 대기열에서 빠졌습니다. 실제 운영 시에는 텍스트 전용, 30분 내 삭제, 신고 즉시 차단·숨김 정책을 함께 연결하면 됩니다.");
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
    setNewRoomCategory("고민/상담");
    setNewRoomTitle("");
    setNewRoomAnonymous(true);
    setNewRoomMaxPeople("8");
    setNewRoomPassword("");
    setRoomModalOpen(false);
  };

  const headerNavItems = useMemo<HeaderNavItem[]>(() => {
    if (activeTab === "홈") {
      return homeTabs.map((tab) => ({ label: tab, active: homeTab === tab, onClick: () => setHomeTab(tab) }));
    }
    if (activeTab === "쇼핑") {
      return shoppingTabs.map((tab) => ({ label: tab, active: shoppingTab === tab, onClick: () => setShoppingTab(tab) }));
    }
    if (activeTab === "소통") {
      return communityTabs.map((tab) => ({ label: tab, active: communityTab === tab, onClick: () => setCommunityTab(tab) }));
    }
    if (activeTab === "채팅") {
      return chatTabs.map((tab) => ({ label: tab, active: chatTab === tab, onClick: () => setChatTab(tab) }));
    }
    return profileTabs.map((tab) => ({ label: tab, active: profileTab === tab, onClick: () => setProfileTab(tab) }));
  }, [activeTab, homeTab, shoppingTab, communityTab, chatTab, profileTab]);

  const settingsNavItems = useMemo<SettingsCategory[]>(() => settingsCategories.filter((item) => (["운영", "관리자모드", "DB관리", "신고", "채팅", "기타"].includes(item) ? isAdmin : true)), [isAdmin]);
  const visibleHeaderNavItems = overlayMode === null ? headerNavItems : [];

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
      setRandomMatchNote("카테고리를 고른 뒤 텍스트 전용 랜덤채팅을 시작할 수 있습니다.");
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

  return (
    <div className="mobile-app-shell">
      <header className="top-header">
        <div className="topbar-row">
          <div className="topbar-side topbar-left">
            <div className="topbar-inline-actions topbar-inline-actions-left">
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
              <button className={`header-inline-btn header-icon-btn ${overlayMode === "settings" ? "active" : ""}`} onClick={() => openOverlay("settings")} aria-label="설정">
                <SettingsIcon />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mobile-main">
        {overlayMode ? (
          <section className="overlay-card">
            <div className="overlay-head">
              <strong>{overlayMode === "search" ? "통합 검색" : "설정 카테고리"}</strong>
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

            {overlayMode === "settings" ? (
              <div className="stack-gap">
                <div className="settings-category-nav">
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
                  currentUserRole={currentUserRole}
                  adminModeTab={adminModeTab}
                  setAdminModeTab={setAdminModeTab}
                  adminDbManage={adminDbManage}
                  htmlInspectorEnabled={htmlInspectorEnabled}
                  setHtmlInspectorEnabled={setHtmlInspectorEnabled}
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {showBaseTabContent && blockedByIdentity ? (
          <section className="tab-pane fill-pane auth-gate-pane">
            <div className="auth-gate-card stack-gap compact-scroll-list">
              <div className="section-head compact-head">
                <div><h2>로그인 / 본인확인 필요</h2><p>미인증 경로로 접근한 계정은 로그인 화면으로 되돌리고, PASS 또는 휴대폰 본인확인 완료 후 가입/로그인 상태를 유지하도록 설계하는 것이 적합합니다.</p></div>
              </div>
              <div className="legacy-grid three auth-option-grid">
                <div className="legacy-box compact"><h3>PASS 인증 후 가입</h3><p>가입 전 본인 명의 휴대폰 기준 인증을 마친 뒤 계정을 생성하는 기본안입니다.</p><button type="button" onClick={() => startIdentitySignup("PASS")}>PASS 인증 후 가입 상태로 전환</button></div>
                <div className="legacy-box compact"><h3>휴대폰 인증 후 가입</h3><p>문자/앱 기반 본인확인 완료 후 회원가입을 진행하는 대체안입니다.</p><button type="button" onClick={() => startIdentitySignup("휴대폰")}>휴대폰 인증 후 가입 상태로 전환</button></div>
                <div className="legacy-box compact"><h3>카카오 로그인</h3><p>카카오 로그인 자체는 편의 로그인용으로 사용하고, 성인인증은 별도 PASS/휴대폰 본인확인을 추가하는 구조를 권장합니다.</p><button type="button" onClick={() => startIdentitySignup("카카오")}>카카오 로그인 상태로 전환</button></div>
              </div>
              <div className="legacy-box compact auth-summary-box">
                <h3>현재 데모 정책</h3>
                <p>로그인 제공방식: {demoLoginProvider} · 가입 전 본인확인: {identityVerified ? "완료" : "미완료"} · 성인인증: {adultVerified ? "완료" : "미완료"}</p>
                <p>불법경로 또는 미인증 계정 로그인 성공 시에는 다시 로그인/본인확인 단계로 보내는 정책을 권장합니다. 관리자 계정은 예외 처리합니다.</p>
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
                <div className="legacy-box compact"><h3>성인 인증 안내</h3><p>PASS/휴대폰 본인확인 팝업 호출 → 서버 검증 성공 시 <code>adult_verified = true</code> 저장 → 홈/쇼핑 접근 허용 흐름을 권장합니다.</p><button type="button" className="ghost-btn" onClick={() => setAdultPromptOpen(true)}>성인인증 필요 모달 보기</button></div>
                <div className="legacy-box compact"><h3>PASS/휴대폰 본인확인 시작</h3><p>실서비스에서는 외부 본인인증 SDK를 호출하고, 현재 데모에서는 흐름만 검증합니다.</p><div className="copy-action-row"><button type="button" onClick={() => attemptAdultVerification("success")}>PASS/휴대폰 인증 성공</button><button type="button" className="ghost-btn" onClick={() => attemptAdultVerification("fail")}>인증 실패</button></div></div>
                <div className="legacy-box compact"><h3>차단 / 재시도 상태</h3><p>실패 {adultFailCount}회 · {adultCooldownRemainMinutes > 0 ? `${adultCooldownRemainMinutes}분 후 재시도 가능` : "현재 재시도 가능"}</p><button type="button" className="ghost-btn" onClick={() => attemptAdultVerification("minor")}>미성년 차단 화면 확인</button></div>
              </div>
              <div className="legacy-box compact auth-summary-box">
                <h3>{adultGateView === "success" ? "인증 완료 화면" : adultGateView === "minor" ? "미성년자 차단 화면" : adultGateView === "failed" ? "인증 실패 / 재시도 화면" : "성인 인증 안내 화면"}</h3>
                {adultGateView === "success" ? <p>성인 인증이 완료되었습니다. 이제 홈과 쇼핑 모두 지속적으로 접근할 수 있습니다.</p> : null}
                {adultGateView === "minor" ? <p>이 기능은 성인 인증 후 이용할 수 있습니다. 청소년은 이용할 수 없습니다. 본인확인 결과에 따라 이용이 제한될 수 있습니다.</p> : null}
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
                <div className="feed-post-list compact-scroll-list">{visibleFeed.map((item) => <FeedPoster key={item.id} item={item} onAsk={openAskFromFeed} />)}</div>
              </>
            ) : (
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
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        ) : null}

        {showAppTabContent && activeTab === "쇼핑" ? (
          <section className="tab-pane fill-pane">
            {shoppingTab === "목록" ? (
              <>
                <div className="section-head compact-head">
                  <div><h2>상품 목록</h2><p>카테고리와 검색을 조합해 한 화면 안에서 탐색합니다.</p></div>
                  <div className="section-tools slim-tools"><input value={shopKeyword} onChange={(e) => setShopKeyword(e.target.value)} placeholder="상품명/설명 검색" /></div>
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
                        <button>장바구니 담기</button>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {shoppingTab === "주문" ? (
              <div className="stack-gap compact-scroll-list">
                <div className="legacy-grid three">
                  <div className="legacy-box"><h3>주문 진행</h3><p>결제대기 4건 · 출고대기 7건 · 배송중 5건</p></div>
                  <div className="legacy-box"><h3>환불 요청</h3><p>검수중 2건 · 반려검토 1건</p></div>
                  <div className="legacy-box"><h3>이번 주 정산</h3><p>예상 정산액 ₩5,820,000</p></div>
                </div>
                <div className="legacy-box">
                  <h3>최근 주문</h3>
                  <div className="chat-list">
                    <article className="chat-row simple-row"><div className="avatar-circle">01</div><div className="chat-copy"><strong>ORD-20260409-001</strong><span>뉴트럴 케어 파우치 외 1건</span><p>결제완료 · 익명포장 요청</p></div><div className="chat-meta"><span>오늘</span><b>정상</b></div></article>
                    <article className="chat-row simple-row"><div className="avatar-circle">02</div><div className="chat-copy"><strong>ORD-20260408-018</strong><span>스타터 바디 케어 세트</span><p>출고대기 · 송장 입력 필요</p></div><div className="chat-meta"><span>어제</span><b>대기</b></div></article>
                  </div>
                </div>
              </div>
            ) : null}

            {shoppingTab === "바구니" ? (
              <div className="cart-box compact-scroll-list">
                {cartSeed.map((item) => (
                  <div key={item.id} className="cart-row"><div><strong>{item.name}</strong><span>{item.option} · 수량 {item.qty}</span></div><b>{item.price}</b></div>
                ))}
                <div className="cart-summary"><span>총 결제 예정</span><strong>₩112,500</strong></div>
                <button>주문/결제 진행</button>
              </div>
            ) : null}
          </section>
        ) : null}

        {showAppTabContent && activeTab === "소통" ? (
          <section className="tab-pane fill-pane">
            <div className="section-head compact-head">
              <div><h2>소통</h2><p>{communityTab === "커뮤" ? "커뮤니티 글과 공지, 정보공유를 확인합니다." : communityTab === "후기" ? "후기 글 모음을 확인합니다." : "이벤트 공지를 확인합니다."}</p></div>
              <div className="section-tools slim-tools"><input value={communityKeyword} onChange={(e) => setCommunityKeyword(e.target.value)} placeholder="게시글 검색" /></div>
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
          </section>
        ) : null}

        {showAppTabContent && activeTab === "채팅" ? (
          <section className="tab-pane fill-pane">
            {chatTab === "랜덤" ? (
              <div className="random-match-pane">
                <div className="chat-category-strip">
                  <div className="chat-category-bar">
                    {randomEntryTabs.map((tab) => (
                      <button key={tab} type="button" className={`chat-category-btn ${randomEntryTab === tab ? "active" : ""}`} onClick={() => setRandomEntryTab(tab)}>
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                {activeRandomRoom ? (
                  <div className="random-chat-room-card">
                    <div className="random-chat-room-head">
                      <div>
                        <span className="random-room-category-chip">{activeRandomRoom.category}</span>
                        <strong>{activeRandomRoom.title}</strong>
                        <p>{activeRandomRoom.partnerNickname ?? "익명 사용자"} 님과 연결됨 · 남은 유지시간 {randomRoomRemainMinutes(activeRandomRoom) ?? 0}분 · 채팅방 유지시간 20분 고정</p>
                      </div>
                      <div className="random-chat-room-head-actions">
                        <button type="button" className="report-mini-btn" onClick={() => reportRandomRoom(activeRandomRoom)}>신고</button>
                        <button type="button" className="ghost-btn" onClick={leaveRandomRoom}>목록으로</button>
                      </div>
                    </div>
                    {randomRoomAlertLabel(activeRandomRoom) ? <div className="random-alert-banner">{randomRoomAlertLabel(activeRandomRoom)}</div> : null}
                    <div className="random-chat-bubble-list">
                      <div className="random-chat-bubble other">안녕하세요. 목록에서 눌러 들어온 1:1 랜덤채팅방입니다.</div>
                      <div className="random-chat-bubble mine">네, 텍스트만 가능한 상태이고 거리 오차 허용범위는 없습니다.</div>
                      <div className="random-chat-bubble system">메시지 삭제는 30분 이내 양측 삭제 표기 유지 · 신고 결과는 비공개 · 종료 시 최근 종료 목록 유지</div>
                    </div>
                    <div className="random-chat-input-row">
                      <input value="" readOnly placeholder="텍스트 입력창 예시 (데모 화면)" />
                      <button type="button">전송</button>
                    </div>
                    <div className="random-room-actions random-room-actions-between">
                      <button type="button" className="ghost-btn" onClick={leaveRandomRoom}>목록만 보기</button>
                      <button type="button" onClick={() => endRandomRoom(activeRandomRoom.id)}>채팅 종료</button>
                    </div>
                  </div>
                ) : null}
                {randomEntryTab === "시작" ? (
                  <>
                    <div className="random-match-toolbar random-match-toolbar-primary">
                      <select className="random-room-select" value={oneToOneCategory} onChange={(e) => setOneToOneCategory(e.target.value as OneToOneRandomCategory)}>
                        {oneToOneRandomCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                      <div className="random-match-settings-wrap">
                        <button className={`random-room-create-btn ${randomSettingsOpen ? "active" : ""}`} onClick={() => setRandomSettingsOpen((prev) => !prev)}>설정</button>
                        {randomSettingsOpen ? (
                          <div className="random-settings-menu">
                            <button type="button" className="random-settings-item">건의(카테고리)</button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="random-filter-grid">
                      <label className="random-filter-field"><span>성별 조건</span><select value={randomGenderOption} onChange={(e) => setRandomGenderOption(e.target.value as RandomGenderOption)}>{randomGenderOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                      <label className="random-filter-field random-range-field"><span>연령 조건</span><div className="random-range-box"><DualRangeSlider min={20} max={99} valueMin={randomAgeMin} valueMax={randomAgeMax} leftLabel={`${randomAgeMin}세`} rightLabel={`${randomAgeMax}세`} onChangeMin={setRandomAgeMin} onChangeMax={setRandomAgeMax} /></div></label>
                      <label className="random-filter-field"><span>지역 조건</span><select value={randomRegionOption} onChange={(e) => setRandomRegionOption(e.target.value as RandomRegionOption)}>{randomRegionOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                    </div>
                    {randomRegionOption === "거리기반" ? (
                      <div className="random-distance-panel">
                        <DualRangeSlider min={0} max={600} valueMin={randomDistanceMinKm} valueMax={randomDistanceMaxKm} leftLabel={`${randomDistanceMinKm}km`} rightLabel={`${randomDistanceMaxKm}km`} onChangeMin={setRandomDistanceMinKm} onChangeMax={setRandomDistanceMaxKm} />
                      </div>
                    ) : null}
                    <div className="random-match-center">
                      <button className={`random-start-btn ${matchingRandom ? "loading" : ""}`} onClick={startRandomMatch}>
                        {matchingRandom ? "랜덤채팅찾는중" : "1:1랜덤채팅"}
                      </button>
                    </div>
                    <div className="random-skeleton-card">
                      <div className="random-skeleton-row">
                        <span className="random-skeleton-label">현재 상태</span>
                        <strong>{randomMatchPhase === "idle" ? "대기 전" : randomMatchPhase === "queueing" ? "대기열 참여중" : "매칭 완료"}</strong>
                      </div>
                      <div className="random-skeleton-row">
                        <span className="random-skeleton-label">선택 카테고리</span>
                        <span>{oneToOneCategory}</span>
                      </div>
                      <p>{randomMatchNote}</p>
                      <div className="random-skeleton-actions">
                        <button type="button" className="ghost-btn" onClick={cancelRandomMatch}>대기취소</button>
                        <button type="button" onClick={() => setRandomEntryTab("목록")}>목록 보기</button>
                      </div>
                    </div>
                    {matchedRandomUser ? (
                      <div className="random-match-result">
                        <span className="random-room-category-chip">{matchedRandomUser.category}</span>
                        <strong>{matchedRandomUser.name}</strong>
                        <p>{matchedRandomUser.nickname} 님과 연결되어 채팅 목록 상단에 새 방이 추가되었습니다. 목록에서 해당 방을 눌러야 채팅방 화면으로 이동합니다.</p>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="random-room-list compact-scroll-list random-match-room-list">
                    {visibleRandomMatchRooms.length === 0 ? (
                      <div className="random-skeleton-card"><p>아직 생성된 1:1 랜덤채팅방이 없습니다. 시작 탭에서 매칭을 진행하면 목록에 채팅이 추가됩니다.</p></div>
                    ) : visibleRandomMatchRooms.map((room) => (
                      <article key={room.id} className={`random-room-card random-match-room-card ${activeRandomRoomId === room.id ? "active" : ""} ${room.status === "ended" ? "ended" : ""}`} onClick={() => openRandomRoom(room.id)}>
                        <div className="random-room-topline">
                          <span className="random-room-category-chip">{room.category}</span>
                          <div className="random-room-topline-actions">
                            {randomRoomAlertLabel(room) ? <span className="random-room-occupancy alert">{randomRoomAlertLabel(room)}</span> : <div className="random-room-occupancy">{room.status === "ended" ? "최근 종료" : `남은 ${randomRoomRemainMinutes(room) ?? 0}분`}</div>}
                            <button type="button" className="report-mini-btn" onClick={(e) => { e.stopPropagation(); reportRandomRoom(room); }}>신고</button>
                          </div>
                        </div>
                        <div className="random-room-middleline grouped-room-title-line">
                          <strong>{room.title}</strong>
                          <b>{room.currentPeople}/{room.maxPeople}</b>
                        </div>
                        <p>{room.partnerNickname ?? "익명 사용자"} · 성별 {room.genderOption ?? "무관"} · 나이 {room.ageMin ?? 20}~{room.ageMax ?? 99}세{room.regionOption === "거리기반" ? ` · 거리 ${room.distanceMinKm ?? 0}~${room.distanceMaxKm ?? 600}km` : ""}</p>
                        <div className="random-room-actions"><button type="button" onClick={(e) => { e.stopPropagation(); openRandomRoom(room.id); }} disabled={room.status === "ended"}>입장</button></div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : chatTab === "질문" ? (
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
                <div className="chat-category-strip">
                  <div className="chat-category-bar">
                    {chatCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={`chat-category-btn ${chatCategory === category ? "active" : ""}`}
                        onClick={() => setChatCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                {chatCategory === "단체" ? (
                  <>
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
                        </article>
                      ))}
                    </div>
                  </>
                ) : (
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
                          <p>{thread.preview}</p>
                        </div>
                        <div className="chat-meta kakao-chat-meta">
                          <span>{thread.time}</span>
                          {thread.unread > 0 ? <b>{thread.unread}</b> : null}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
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
                <strong>성인인증 구현 상태</strong>
                <span>로그인 수단: {demoLoginProvider} · 가입 전 본인확인: {identityVerified ? "완료" : "미완료"} · 성인인증: {adultVerified ? "완료" : "미완료"}</span>
                <div className="profile-stats">
                  <div><b>{adultFailCount}</b><span>실패횟수</span></div>
                  <div><b>{adultCooldownRemainMinutes > 0 ? `${adultCooldownRemainMinutes}분` : "없음"}</b><span>쿨타임</span></div>
                  <div><b>{isAdmin ? "예외" : "일반"}</b><span>정책대상</span></div>
                </div>
                <div className="copy-action-row">
                  <button type="button" className="ghost-btn" onClick={() => startIdentitySignup("PASS")}>PASS 가입상태</button>
                  <button type="button" className="ghost-btn" onClick={() => startIdentitySignup("카카오")}>카카오 로그인</button>
                  <button type="button" onClick={() => attemptAdultVerification("success")}>성인인증 성공</button>
                  <button type="button" className="ghost-btn" onClick={resetAdultFlow}>상태 초기화</button>
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

      <nav className="bottom-nav">
        {mobileTabs.map((tab) => (
          <button key={tab} className={`bottom-nav-btn ${overlayMode === null && activeTab === tab ? "active" : ""}`} onClick={() => selectBottomTab(tab)}>
            <span>{tab}</span>
          </button>
        ))}
      </nav>

      {selectedAskProfile ? <AskProfileScreen profile={selectedAskProfile} onClose={() => setSelectedAskProfile(null)} /> : null}

      {roomModalOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header-row">
              <button className="header-inline-btn modal-back-btn" onClick={() => setRoomModalOpen(false)}>←</button>
              <strong>랜덤방 개설</strong>
              <span className="modal-spacer" />
            </div>
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


