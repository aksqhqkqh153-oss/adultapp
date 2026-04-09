import { useEffect, useMemo, useState } from "react";
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

const mobileTabs = ["홈", "쇼핑", "소통", "채팅", "프로필"] as const;
const legacyMenu = ["운영현황", "주문관리", "보안", "앱심사", "배포가이드"] as const;
const homeTabs = ["피드", "상품"] as const;
const shoppingTabs = ["목록", "주문", "바구니"] as const;
const communityTabs = ["커뮤", "후기", "이벤트"] as const;
const chatTabs = ["채팅", "랜덤", "질문"] as const;
const profileTabs = ["내정보"] as const;
const settingsCategories = ["일반", "계정", "알림", "보안", "배포", "운영"] as const;
const randomRoomCategories = ["전체", "고민/상담", "정보공유", "일상대화", "취미/관심사", "자유주제"] as const;
const chatCategories = ["전체", "즐겨찾기", "개인", "단체"] as const;
const oneToOneRandomCategories = ["고민상담", "자유수다", "아무말대잔치", "도파민수다"] as const;


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
type OverlayMode = "search" | "settings" | null;

type HeaderNavItem = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

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

function SettingSection({ category, isAdmin, legacySection, setLegacySection, projectStatus, deployGuide, currentUserRole }: {
  category: SettingsCategory;
  isAdmin: boolean;
  legacySection: LegacyTab;
  setLegacySection: (section: LegacyTab) => void;
  projectStatus: ProjectStatus | null;
  deployGuide: DeployGuide | null;
  currentUserRole: string;
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
  const [globalKeyword, setGlobalKeyword] = useState("");
  const [homeTab, setHomeTab] = useState<HomeTab>("피드");
  const [shoppingTab, setShoppingTab] = useState<ShoppingTab>("목록");
  const [communityTab, setCommunityTab] = useState<CommunityTab>("커뮤");
  const [chatTab, setChatTab] = useState<ChatTab>("채팅");
  const [chatCategory, setChatCategory] = useState<ChatCategory>("전체");
  const [profileTab, setProfileTab] = useState<ProfileTab>("내정보");
  const [settingsCategory, setSettingsCategory] = useState<SettingsCategory>("일반");
  const [selectedShopCategory, setSelectedShopCategory] = useState("전체");
  const [selectedCommunityCategory, setSelectedCommunityCategory] = useState<string>("전체");
  const [randomRoomCategory, setRandomRoomCategory] = useState<RandomRoomCategory>("전체");
  const [oneToOneCategory, setOneToOneCategory] = useState<OneToOneRandomCategory>("고민상담");
  const [randomSettingsOpen, setRandomSettingsOpen] = useState(false);
  const [matchingRandom, setMatchingRandom] = useState(false);
  const [matchedRandomUser, setMatchedRandomUser] = useState<{ name: string; category: OneToOneRandomCategory; nickname: string } | null>(null);
  const [randomMatchPhase, setRandomMatchPhase] = useState<"idle" | "queueing" | "matched">("idle");
  const [randomMatchNote, setRandomMatchNote] = useState("카테고리를 고른 뒤 랜덤채팅을 시작할 수 있습니다.");
  const [shopKeyword, setShopKeyword] = useState("");
  const [communityKeyword, setCommunityKeyword] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null);
  const [deployGuide, setDeployGuide] = useState<DeployGuide | null>(null);
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

  const isAdmin = ["ADMIN", "1", "GRADE_1"].includes(currentUserRole);

  useEffect(() => {
    getJson<ProjectStatus>("/project-status").then(setProjectStatus).catch(() => null);
    getJson<DeployGuide>("/deploy/cloudflare-pages-manual").then(setDeployGuide).catch(() => null);
  }, []);

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
        || (chatCategory === "단체" && thread.kind === "단체");
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
  const currentScreenTitle = activeTab;

  const openOverlay = (mode: Exclude<OverlayMode, null>) => {
    setOverlayMode((prev) => (prev === mode ? null : mode));
    setRoomModalOpen(false);
  };

  const startRandomMatch = () => {
    if (matchingRandom) return;
    setRandomSettingsOpen(false);
    setMatchedRandomUser(null);
    setRandomMatchPhase("queueing");
    setRandomMatchNote(`${oneToOneCategory} 카테고리 대기열에 등록되었습니다. 매칭 상대를 찾는 중입니다.`);
    setMatchingRandom(true);
    window.setTimeout(() => {
      const demoMatches: Record<OneToOneRandomCategory, { name: string; nickname: string }> = {
        고민상담: { name: "익명 상담 파트너", nickname: "달빛고민러" },
        자유수다: { name: "자유수다 메이트", nickname: "수다한잔" },
        아무말대잔치: { name: "아무말 메이트", nickname: "말풍선친구" },
        도파민수다: { name: "도파민 토커", nickname: "텐션부스터" },
      };
      const picked = demoMatches[oneToOneCategory];
      setMatchedRandomUser({ ...picked, category: oneToOneCategory });
      setRandomMatchPhase("matched");
      setRandomMatchNote(`${picked.nickname} 님과 연결되었습니다. 다음 단계에서는 실제 소켓 채팅방으로 이동시키면 됩니다.`);
      setMatchingRandom(false);
    }, 1600);
  };

  const cancelRandomMatch = () => {
    setMatchingRandom(false);
    setRandomMatchPhase("idle");
    setMatchedRandomUser(null);
    setRandomMatchNote("랜덤채팅 대기열에서 빠졌습니다.");
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

  const settingsNavItems = useMemo<SettingsCategory[]>(() => settingsCategories.filter((item) => item !== "운영" || isAdmin), [isAdmin]);

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
      setRandomMatchNote("카테고리를 고른 뒤 랜덤채팅을 시작할 수 있습니다.");
    }
    if (tab !== "프로필") setProfileTab("내정보");
  };

  return (
    <div className="mobile-app-shell">
      <header className="top-header">
        <div className="topbar-row">
          <div className="topbar-side topbar-left topbar-segment">
            <div className="topbar-inline-actions topbar-inline-actions-left">
              {headerNavItems.map((item) => (
                <button key={item.label} type="button" className={`header-inline-btn ${item.active ? "active" : ""}`} onClick={item.onClick} disabled={!item.onClick}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="topbar-title-block topbar-segment">
            <h1>{currentScreenTitle}</h1>
          </div>
          <div className="topbar-side topbar-right topbar-segment">
            <div className="topbar-inline-actions topbar-inline-actions-right">
              <button className={`header-inline-btn ${overlayMode === "search" ? "active" : ""}`} onClick={() => openOverlay("search")}>검색</button>
              <button className={`header-inline-btn ${overlayMode === "settings" ? "active" : ""}`} onClick={() => openOverlay("settings")}>설정</button>
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
              <div className="overlay-body stack-gap">
                <input value={globalKeyword} onChange={(e) => setGlobalKeyword(e.target.value)} placeholder="홈·쇼핑·소통·채팅 전체 검색" />
                <button className="ghost-btn" onClick={() => setGlobalKeyword("")}>검색어 초기화</button>
              </div>
            ) : null}

            {overlayMode === "settings" ? (
              <div className="stack-gap">
                <div className="legacy-nav inline settings-category-nav">
                  {settingsNavItems.map((item) => (
                    <button key={item} className={`legacy-nav-btn ${settingsCategory === item ? "active" : ""}`} onClick={() => setSettingsCategory(item)}>{item}</button>
                  ))}
                </div>
                <SettingSection
                  category={settingsCategory}
                  isAdmin={isAdmin}
                  legacySection={legacySection}
                  setLegacySection={setLegacySection}
                  projectStatus={projectStatus}
                  deployGuide={deployGuide}
                  currentUserRole={currentUserRole}
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === "홈" ? (
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

        {activeTab === "쇼핑" ? (
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

        {activeTab === "소통" ? (
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

        {activeTab === "채팅" ? (
          <section className="tab-pane fill-pane">
            {chatTab === "랜덤" ? (
              <div className="random-match-pane">
                <div className="random-match-toolbar">
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
                    <button type="button">신고/차단 기준 확인</button>
                  </div>
                </div>
                {matchedRandomUser ? (
                  <div className="random-match-result">
                    <span className="random-room-category-chip">{matchedRandomUser.category}</span>
                    <strong>{matchedRandomUser.name}</strong>
                    <p>{matchedRandomUser.nickname} 닉네임으로 연결된 데모 화면입니다. 다음 단계에서 실제 1:1 채팅방 입장 API를 연결하면 됩니다.</p>
                  </div>
                ) : null}
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

        {activeTab === "프로필" ? (
          <section className="tab-pane fill-pane">
            <div className="section-head compact-head"><div><h2>프로필</h2><p>내정보와 활동 통계를 확인합니다.</p></div></div>
            <div className="profile-shell compact-scroll-list">
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
              <div className="profile-columns">
                <div className="legacy-box"><h3>내가 작성한 게시글</h3><ul>{communitySeed.slice(0, 3).map((post) => <li key={post.id}>{post.title}</li>)}</ul></div>
                <div className="legacy-box"><h3>업로드한 상품</h3><ul>{productsSeed.slice(0, 3).map((product) => <li key={product.id}>{product.name}</li>)}</ul></div>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <nav className="bottom-nav">
        {mobileTabs.map((tab) => (
          <button key={tab} className={`bottom-nav-btn ${activeTab === tab ? "active" : ""}`} onClick={() => selectBottomTab(tab)}>
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
