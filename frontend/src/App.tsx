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

type MobileTab = (typeof mobileTabs)[number];
type LegacyTab = (typeof legacyMenu)[number];
type HomeTab = (typeof homeTabs)[number];
type ShoppingTab = (typeof shoppingTabs)[number];

type OverlayMode = "menu" | "search" | "settings" | null;

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
  { id: 101, name: "운영 문의", purpose: "상품/운영 문의", preview: "결제 허용 SKU 범위를 다시 확인 부탁드립니다.", time: "방금", unread: 2 },
  { id: 102, name: "seller_studio", purpose: "판매자 1:1", preview: "승인 대기 상품 이미지 규격을 수정했습니다.", time: "12분 전", unread: 0 },
  { id: 103, name: "brand_note", purpose: "콘텐츠 응답", preview: "피드형 홈 카드 노출 순서 제안 드립니다.", time: "1시간 전", unread: 1 },
  { id: 104, name: "customer demo", purpose: "구매자 지원", preview: "장바구니와 프로필 연동 상태를 확인하고 싶어요.", time: "어제", unread: 0 },
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

function FeedPoster({ item }: { item: FeedItem }) {
  return (
    <article className={`feed-card ${item.accent}`}>
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
    </article>
  );
}

function LegacyPanel({
  section,
  projectStatus,
  deployGuide,
}: {
  section: LegacyTab;
  projectStatus: ProjectStatus | null;
  deployGuide: DeployGuide | null;
}) {
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

export default function App() {
  const [activeTab, setActiveTab] = useState<MobileTab>("홈");
  const [legacySection, setLegacySection] = useState<LegacyTab>("운영현황");
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(null);
  const [globalKeyword, setGlobalKeyword] = useState("");
  const [homeTab, setHomeTab] = useState<HomeTab>("피드");
  const [shoppingTab, setShoppingTab] = useState<ShoppingTab>("목록");
  const [selectedShopCategory, setSelectedShopCategory] = useState("전체");
  const [selectedCommunityCategory, setSelectedCommunityCategory] = useState<string>("전체");
  const [shopKeyword, setShopKeyword] = useState("");
  const [communityKeyword, setCommunityKeyword] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null);
  const [deployGuide, setDeployGuide] = useState<DeployGuide | null>(null);

  useEffect(() => {
    getJson<ProjectStatus>("/project-status").then(setProjectStatus).catch(() => null);
    getJson<DeployGuide>("/deploy/cloudflare-pages-manual").then(setDeployGuide).catch(() => null);
  }, []);

  const visibleFeed = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    const filtered = !keyword
      ? feedSeed
      : feedSeed.filter((item) => `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase().includes(keyword));
    return filtered;
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
      const matchCategory = selectedCommunityCategory === "전체" || post.category === selectedCommunityCategory;
      const matchKeyword = !keyword || `${post.title} ${post.summary}`.toLowerCase().includes(keyword);
      return matchCategory && matchKeyword;
    });
  }, [selectedCommunityCategory, communityKeyword, globalKeyword]);

  const filteredThreads = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    return !keyword ? threadSeed : threadSeed.filter((thread) => `${thread.name} ${thread.preview} ${thread.purpose}`.toLowerCase().includes(keyword));
  }, [globalKeyword]);

  const homeProducts = useMemo(() => productsSeed.slice(0, 4), []);

  const currentScreenTitle =
    activeTab === "홈" ? `홈 · ${homeTab}` : activeTab === "쇼핑" ? `쇼핑 · ${shoppingTab}` : activeTab;

  const openOverlay = (mode: Exclude<OverlayMode, null>) => {
    setOverlayMode((prev) => (prev === mode ? null : mode));
  };

  const renderContextNav = () => {
    if (activeTab === "홈") {
      return (
        <div className="context-nav">
          {homeTabs.map((tab) => (
            <button key={tab} className={`context-btn ${homeTab === tab ? "active" : ""}`} onClick={() => setHomeTab(tab)}>{tab}</button>
          ))}
        </div>
      );
    }
    if (activeTab === "쇼핑") {
      return (
        <div className="context-nav">
          {shoppingTabs.map((tab) => (
            <button key={tab} className={`context-btn ${shoppingTab === tab ? "active" : ""}`} onClick={() => setShoppingTab(tab)}>{tab}</button>
          ))}
        </div>
      );
    }
    return <div className="context-nav context-label">현재 화면</div>;
  };

  return (
    <div className="mobile-app-shell">
      <header className="top-header">
        <div className="topbar-row">
          <div className="topbar-left">{renderContextNav()}</div>
          <div className="topbar-title-block">
            <h1>{currentScreenTitle}</h1>
          </div>
          <div className="topbar-tools">
            <button className={`ghost-btn tool-btn ${overlayMode === "menu" ? "active" : ""}`} onClick={() => openOverlay("menu")}>운영</button>
            <button className={`ghost-btn tool-btn ${overlayMode === "search" ? "active" : ""}`} onClick={() => openOverlay("search")}>검색</button>
            <button className={`ghost-btn tool-btn ${overlayMode === "settings" ? "active" : ""}`} onClick={() => openOverlay("settings")}>설정</button>
          </div>
        </div>
      </header>

      <main className="mobile-main">
        {overlayMode ? (
          <section className="overlay-card">
            <div className="overlay-head">
              <strong>{overlayMode === "menu" ? "운영 패널" : overlayMode === "search" ? "통합 검색" : "설정 요약"}</strong>
              <button className="ghost-btn" onClick={() => setOverlayMode(null)}>닫기</button>
            </div>

            {overlayMode === "menu" ? (
              <>
                <div className="legacy-nav inline">
                  {legacyMenu.map((item) => (
                    <button key={item} className={`legacy-nav-btn ${legacySection === item ? "active" : ""}`} onClick={() => setLegacySection(item)}>{item}</button>
                  ))}
                </div>
                <LegacyPanel section={legacySection} projectStatus={projectStatus} deployGuide={deployGuide} />
              </>
            ) : null}

            {overlayMode === "search" ? (
              <div className="overlay-body stack-gap">
                <input value={globalKeyword} onChange={(e) => setGlobalKeyword(e.target.value)} placeholder="홈·쇼핑·소통·채팅 전체 검색" />
                <button className="ghost-btn" onClick={() => setGlobalKeyword("")}>검색어 초기화</button>
              </div>
            ) : null}

            {overlayMode === "settings" ? (
              <div className="settings-grid">
                <div className="legacy-box compact"><h3>레이아웃</h3><p>모바일 1화면 기준 상단/하단 고정, 본문 개별 스크롤 구조</p></div>
                <div className="legacy-box compact"><h3>API 연결</h3><p>Production build 기본 API를 Railway /api 로 고정</p></div>
                <div className="legacy-box compact"><h3>배포</h3><p>Cloudflare Pages 수동 업로드 및 Railway health 체크 기준 유지</p></div>
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === "홈" ? (
          <section className="tab-pane fill-pane">
            {homeTab === "피드" ? (
              <>
                <div className="section-head compact-head">
                  <div>
                    <h2>홈 피드</h2>
                    <p>세로 스크롤 내부에서 사진/영상 피드를 연속 탐색합니다.</p>
                  </div>
                </div>
                <div className="feed-stack compact-scroll-list">
                  {visibleFeed.map((item) => <FeedPoster key={item.id} item={item} />)}
                </div>
              </>
            ) : (
              <>
                <div className="section-head compact-head">
                  <div>
                    <h2>추천 상품</h2>
                    <p>홈에서 바로 진입하는 추천 상품 카드 모음입니다.</p>
                  </div>
                </div>
                <div className="content-grid product-grid compact-scroll-list">
                  {homeProducts.map((product) => (
                    <article key={product.id} className="product-card">
                      <div className="product-thumb" />
                      <span className="product-badge">{product.badge}</span>
                      <strong>{product.name}</strong>
                      <p>{product.subtitle}</p>
                      <div className="product-meta">
                        <span>{product.category}</span>
                        <b>{product.price}</b>
                      </div>
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
                  <div>
                    <h2>상품 목록</h2>
                    <p>카테고리와 검색을 조합해 한 화면 안에서 탐색합니다.</p>
                  </div>
                  <div className="section-tools slim-tools">
                    <input value={shopKeyword} onChange={(e) => setShopKeyword(e.target.value)} placeholder="상품명/설명 검색" />
                  </div>
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
                        <div className="product-meta">
                          <span>{product.category}</span>
                          <b>{product.price}</b>
                        </div>
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
                  <div key={item.id} className="cart-row">
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.option} · 수량 {item.qty}</span>
                    </div>
                    <b>{item.price}</b>
                  </div>
                ))}
                <div className="cart-summary">
                  <span>총 결제 예정</span>
                  <strong>₩112,500</strong>
                </div>
                <button>주문/결제 진행</button>
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === "소통" ? (
          <section className="tab-pane fill-pane">
            <div className="section-head compact-head">
              <div>
                <h2>소통</h2>
                <p>카테고리별 게시글을 한 화면 내 스크롤로 확인합니다.</p>
              </div>
              <div className="section-tools slim-tools">
                <input value={communityKeyword} onChange={(e) => setCommunityKeyword(e.target.value)} placeholder="게시글 검색" />
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
          </section>
        ) : null}

        {activeTab === "채팅" ? (
          <section className="tab-pane fill-pane">
            <div className="section-head compact-head">
              <div>
                <h2>채팅</h2>
                <p>최근 1:1 문의 목록과 미리보기를 보여줍니다.</p>
              </div>
            </div>
            <div className="chat-list compact-scroll-list">
              {filteredThreads.map((thread) => (
                <article key={thread.id} className="chat-row">
                  <div className="avatar-circle">{thread.name[0]}</div>
                  <div className="chat-copy">
                    <strong>{thread.name}</strong>
                    <span>{thread.purpose}</span>
                    <p>{thread.preview}</p>
                  </div>
                  <div className="chat-meta">
                    <span>{thread.time}</span>
                    {thread.unread > 0 ? <b>{thread.unread}</b> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "프로필" ? (
          <section className="tab-pane fill-pane">
            <div className="section-head compact-head">
              <div>
                <h2>프로필</h2>
                <p>내 프로필, 통계, 작성 글과 업로드 상품을 확인합니다.</p>
              </div>
            </div>
            <div className="profile-shell compact-scroll-list">
              <div className="profile-card">
                <div className="profile-avatar">A</div>
                <strong>adult official</strong>
                <span>운영/브랜드/판매자 통합 프로필 예시</span>
                <div className="profile-stats">
                  {profileStats.map((stat) => (
                    <div key={stat.label}>
                      <b>{stat.value}</b>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="profile-columns">
                <div className="legacy-box">
                  <h3>내가 작성한 게시글</h3>
                  <ul>
                    {communitySeed.slice(0, 3).map((post) => <li key={post.id}>{post.title}</li>)}
                  </ul>
                </div>
                <div className="legacy-box">
                  <h3>업로드한 상품</h3>
                  <ul>
                    {productsSeed.slice(0, 3).map((product) => <li key={product.id}>{product.name}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <nav className="bottom-nav">
        {mobileTabs.map((tab) => (
          <button
            key={tab}
            className={`bottom-nav-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab);
              if (tab !== "홈") setHomeTab("피드");
              if (tab !== "쇼핑") setShoppingTab("목록");
            }}
          >
            <span>{tab}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
