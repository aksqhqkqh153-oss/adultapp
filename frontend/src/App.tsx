import { useEffect, useMemo, useState } from "react";
import { clearTokens, getJson, getRefreshToken, postForm, postJson, setAuthToken, setRefreshToken } from "./lib/api";

type Metric = { key: string; label: string; value: string | number };
type AnyRow = Record<string, any>;

type LoginResult = {
  access_token: string;
  refresh_token: string;
  role: string;
  user_id: number;
  two_factor_required: boolean;
  challenge_token?: string;
};

const tabs = ["홈", "쇼핑", "주문", "운영", "보안", "앱심사"] as const;

const gradeLabelMap: Record<string, string> = {
  "1": "관리자",
  "2": "부관리자",
  "3": "중간관리자",
  "4": "사업자",
  "5": "소비자",
  "6": "일반회원",
  "7": "기타",
};

const roleAccountMap: Record<string, { email: string; password: string; device_name: string }> = {
  "1": { email: "admin@example.com", password: "admin1234", device_name: "Admin Console" },
  "4": { email: "seller@example.com", password: "seller1234", device_name: "Seller Center" },
  "5": { email: "customer@example.com", password: "customer1234", device_name: "Customer Web" },
  "6": { email: "general@example.com", password: "general1234", device_name: "General Web" },
};

const roleUsageMap: Record<string, { summary: string; tabs: string[]; buttons: string[] }> = {
  "1": { summary: "전체 운영 통제, 제재, 앱심사, 감사로그, 승인큐, 커뮤니티/DM 모더레이션", tabs: ["홈", "쇼핑", "주문", "운영", "보안", "앱심사"], buttons: ["상품 승인/삭제", "신고 처리", "승인큐 승인", "2FA 관리", "감사로그 확인", "커뮤니티 모니터링"] },
  "4": { summary: "상품 등록, SKU 관리, 주문 확인, 환불 처리, 정산 확인, 정보성 커뮤니티 응답", tabs: ["홈", "쇼핑", "주문", "보안"], buttons: ["상품 저장", "미디어 업로드", "주문 확인", "환불 승인/반려", "피드 작성", "DM 답변"] },
  "5": { summary: "상품 탐색, 주문 생성, 환불 요청 상태 조회, 신고 접수, 정보 교류 커뮤니티 사용", tabs: ["홈", "쇼핑", "주문", "보안"], buttons: ["주문 생성", "환불 진행상태 확인", "신고 등록", "피드 작성", "DM 시작", "비밀번호 변경"] },
  "6": { summary: "안전 노출 콘텐츠 탐색, 성인인증 전 안내 확인, 제한적 정보 교류", tabs: ["홈", "쇼핑", "보안"], buttons: ["공개 상품 탐색", "가이드 열람", "안전 피드 열람", "운영/상품 문의 DM", "로그인/비밀번호 초기화"] },
};

function Card({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="card">
      <div className="card-head">
        <h3>{title}</h3>
        {actions ? <div className="card-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

function Table({ rows }: { rows: AnyRow[] }) {
  if (!rows.length) return <p className="muted">데이터 없음</p>;
  const headers = Object.keys(rows[0]);
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>{headers.map((h) => <td key={h}>{String(row[h] ?? "-")}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("홈");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [launchGates, setLaunchGates] = useState<AnyRow[]>([]);
  const [refunds, setRefunds] = useState<AnyRow[]>([]);
  const [reviewMode, setReviewMode] = useState<any>(null);
  const [sellerChecklist, setSellerChecklist] = useState<any>(null);
  const [skuPolicy, setSkuPolicy] = useState<any>({});
  const [penalties, setPenalties] = useState<AnyRow[]>([]);
  const [assets, setAssets] = useState<AnyRow[]>([]);
  const [pgProviders, setPgProviders] = useState<AnyRow[]>([]);
  const [adultProviders, setAdultProviders] = useState<AnyRow[]>([]);
  const [taxDashboard, setTaxDashboard] = useState<any>({});
  const [security, setSecurity] = useState<any>(null);
  const [approvalQueue, setApprovalQueue] = useState<AnyRow[]>([]);
  const [screenshots, setScreenshots] = useState<AnyRow[]>([]);
  const [integrationOverview, setIntegrationOverview] = useState<any>(null);
  const [authMe, setAuthMe] = useState<any>(null);
  const [currentGrade, setCurrentGrade] = useState<string>("1");
  const [rbacMap, setRbacMap] = useState<any>(null);
  const [twoFASetup, setTwoFASetup] = useState<any>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [challengeToken, setChallengeToken] = useState("");
  const [lastAction, setLastAction] = useState("대기 중");
  const [sessions, setSessions] = useState<AnyRow[]>([]);
  const [products, setProducts] = useState<AnyRow[]>([]);
  const [contents, setContents] = useState<AnyRow[]>([]);
  const [categories, setCategories] = useState<AnyRow[]>([]);
  const [projectStatus, setProjectStatus] = useState<any>(null);
  const [updateNeeds, setUpdateNeeds] = useState<string[]>([]);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [orders, setOrders] = useState<AnyRow[]>([]);
  const [settlements, setSettlements] = useState<any>({ items: [], summary: {} });
  const [reports, setReports] = useState<AnyRow[]>([]);
  const [actionLogs, setActionLogs] = useState<AnyRow[]>([]);
  const [communityPosts, setCommunityPosts] = useState<AnyRow[]>([]);
  const [dmThreads, setDmThreads] = useState<AnyRow[]>([]);
  const [dmMessages, setDmMessages] = useState<AnyRow[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [smoke, setSmoke] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ email: "admin@example.com", password: "admin1234", otp_code: "", backup_code: "", device_name: "Chrome on Windows" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "admin1234", new_password: "admin12345!" });
  const [resetRequestEmail, setResetRequestEmail] = useState("admin@example.com");
  const [resetToken, setResetToken] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("adminReset123!");
  const [productForm, setProductForm] = useState<any>({ seller_id: 2, name: "", sku_code: "", category: "위생/보관", description: "", price: 0, stock_qty: 0, risk_grade: "A", display_scope: "app_web", payment_scope: "card_transfer", status: "draft", thumbnail_url: "" });
  const [contentForm, setContentForm] = useState<any>({ author_id: 1, category: "가이드", title: "", body: "", visibility: "safe", thumbnail_url: "", video_url: "", status: "draft" });
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [orderForm, setOrderForm] = useState<any>({ product_id: 1, qty: 1, payment_method: "card", payment_pg: "demo-pg", fee_rate: 0.1, coupon_burden_owner: "platform" });
  const [reportForm, setReportForm] = useState<any>({ reporter_id: 3, target_type: "product", target_id: 1, reason_code: "manual_review", priority: "normal" });
  const [postForm, setPostForm] = useState<any>({ category: "정보공유", title: "", body: "", visibility: "safe", purpose: "정보교류", allow_dm: true });
  const [threadForm, setThreadForm] = useState<any>({ participant_b_id: 2, subject: "상품/운영 문의", purpose_code: "PRODUCT_QA", thread_type: "product_inquiry", related_post_id: null, related_product_id: 1 });
  const [messageForm, setMessageForm] = useState<any>({ thread_id: 0, message: "", purpose_code: "PRODUCT_QA" });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function loadPublicData() {
    const [dashboard, review, seller, policy, refundList, penaltyList, assetList, pg, adult, tax, securityResp, queue, screenshotResp, overview, roles, productList, contentList, categoryList, progress, orderList, settlementPreview, reportList, logList, communityList, threadList, smokeResp] = await Promise.all([
      getJson<any>("/dashboard"),
      getJson<any>("/review-mode"),
      getJson<any>("/seller/2/activation-checklist"),
      getJson<any>("/sku-policy"),
      getJson<any>("/refunds"),
      getJson<any>("/seller-penalties"),
      getJson<any>("/assets"),
      getJson<any>("/pg/providers"),
      getJson<any>("/adult-verification/providers"),
      getJson<any>("/tax/dashboard"),
      getJson<any>("/security/admin-controls"),
      getJson<any>("/security/approval-queue"),
      getJson<any>("/assets/screenshots"),
      getJson<any>("/integrations/overview"),
      getJson<any>("/auth/rbac-map"),
      getJson<any>("/products"),
      getJson<any>("/contents"),
      getJson<any>("/ui/category-groups"),
      getJson<any>("/project-status"),
      getJson<any>("/orders"),
      getJson<any>("/settlements/preview"),
      getJson<any>("/reports"),
      getJson<any>("/admin-action-logs"),
      getJson<any>("/community/posts"),
      getJson<any>("/community/threads").catch(() => []),
      getJson<any>("/qa/smoke"),
    ]);
    setMetrics(dashboard.metrics ?? []);
    setLaunchGates(dashboard.launch_gates ?? []);
    setReviewMode(review);
    setSellerChecklist(seller);
    setSkuPolicy(policy);
    setRefunds(refundList);
    setPenalties(penaltyList);
    setAssets(assetList);
    setPgProviders(pg.providers ?? []);
    setAdultProviders(adult.providers ?? []);
    setTaxDashboard(tax);
    setSecurity(securityResp);
    setApprovalQueue(queue.items ?? []);
    setScreenshots(screenshotResp.items ?? []);
    setIntegrationOverview(overview);
    setRbacMap(roles);
    setProducts(productList);
    setContents(contentList);
    setCategories(categoryList.items ?? []);
    setProjectStatus(progress);
    setUpdateNeeds(progress.recommended_updates ?? []);
    setOrders(orderList);
    setSettlements(settlementPreview);
    setReports(reportList);
    setActionLogs(logList);
    setCommunityPosts(communityList);
    setDmThreads(threadList);
    setSmoke(smokeResp);
  }

  async function loadMeSafe() {
    try {
      const [me, sessionRows] = await Promise.all([getJson<any>("/auth/me"), getJson<any>("/auth/sessions")]);
      setAuthMe(me);
      setCurrentGrade(String(me.grade ?? "1"));
      setSessions(sessionRows.items ?? []);
    } catch {
      setAuthMe(null);
      setCurrentGrade("1");
      setSessions([]);
    }
  }

  useEffect(() => {
    loadPublicData().catch(console.error);
    loadMeSafe().catch(console.error);
  }, []);

  async function login() {
    try {
      const result = await postJson<LoginResult>("/auth/login", loginForm);
      if (result.two_factor_required) {
        setChallengeToken(result.challenge_token ?? "");
        setLastAction("관리자 2FA 필요");
        return;
      }
      setAuthToken(result.access_token);
      setRefreshToken(result.refresh_token);
      setChallengeToken("");
      await loadMeSafe();
      setLastAction(`로그인 완료: ${loginForm.email}`);
    } catch (e) { alert(String(e)); }
  }

  async function completeTwoFactor(useBackup = false) {
    try {
      const result = await postJson<LoginResult>("/auth/2fa/complete", { challenge_token: challengeToken, otp_code: useBackup ? undefined : loginForm.otp_code, backup_code: useBackup ? loginForm.backup_code : undefined });
      setAuthToken(result.access_token);
      setRefreshToken(result.refresh_token);
      setChallengeToken("");
      await loadMeSafe();
      setLastAction(useBackup ? "백업코드 2FA 완료" : "OTP 2FA 완료");
    } catch (e) { alert(String(e)); }
  }

  async function refreshAccess() {
    try {
      const token = getRefreshToken();
      if (!token) throw new Error("refresh token 없음");
      const result = await postJson<LoginResult>("/auth/refresh", { refresh_token: token });
      setAuthToken(result.access_token);
      setRefreshToken(result.refresh_token);
      await loadMeSafe();
      setLastAction("토큰 재발급 완료");
    } catch (e) { alert(String(e)); }
  }

  async function logout() {
    try {
      const token = getRefreshToken();
      if (token) await postJson("/auth/logout", { refresh_token: token });
    } catch {}
    clearTokens();
    setChallengeToken("");
    setAuthMe(null);
    setSessions([]);
    setLastAction("로그아웃 완료");
  }

  async function changePassword() {
    try {
      await postJson("/auth/password/change", passwordForm);
      setLastAction("비밀번호 변경 완료");
      await loadMeSafe();
    } catch (e) { alert(String(e)); }
  }

  async function requestReset() {
    try {
      const result = await postJson<any>("/auth/password/reset/request", { email: resetRequestEmail });
      setResetToken(result.reset_token ?? "");
      setLastAction("비밀번호 초기화 토큰 발급 완료");
    } catch (e) { alert(String(e)); }
  }

  async function confirmReset() {
    try {
      await postJson("/auth/password/reset/confirm", { reset_token: resetToken, new_password: resetNewPassword });
      setLastAction("비밀번호 초기화 완료");
    } catch (e) { alert(String(e)); }
  }

  async function setupTwoFA() {
    try {
      setTwoFASetup(await getJson("/security/2fa/setup"));
      setLastAction("2FA 시크릿 발급 완료");
    } catch (e) { alert(String(e)); }
  }

  async function verifyTwoFA() {
    try {
      await postJson("/security/2fa/verify", { otp_code: loginForm.otp_code });
      setLastAction("2FA 등록 검증 완료");
      await loadMeSafe();
    } catch (e) { alert(String(e)); }
  }

  async function regenerateBackupCodes() {
    try {
      const result = await postJson<any>("/security/2fa/backup-codes/regenerate", {});
      setBackupCodes(result.codes ?? []);
      setLastAction("백업코드 재생성 완료");
      await loadMeSafe();
    } catch (e) { alert(String(e)); }
  }

  async function revokeSession(id: number) {
    try {
      await postJson("/auth/sessions/revoke", { session_id: id });
      setLastAction(`세션 ${id} 종료 완료`);
      await loadMeSafe();
    } catch (e) { alert(String(e)); }
  }

  async function moveRefund(id: number, status: string) {
    try {
      const payload = status === "rejected" ? { status, reject_reason_code: "RJ01", reject_reason_detail: "UI 반려 샘플", evidence_photo_set_id: "PHOTO-001" } : { status };
      await postJson(`/refunds/${id}/transition`, payload);
      setLastAction(`환불 ${id} 상태변경: ${status}`);
      await loadPublicData();
    } catch (e) { alert(String(e)); }
  }

  async function approveQueue(id: number) {
    try {
      await postJson(`/security/approval-queue/${id}/approve`, {});
      setLastAction(`승인큐 ${id} 승인 완료`);
      await loadPublicData();
    } catch (e) { alert(String(e)); }
  }

  async function saveProduct() {
    try {
      await postJson("/products", productForm);
      setLastAction("상품 저장 완료");
      setProductForm({ seller_id: 2, name: "", sku_code: "", category: "위생/보관", description: "", price: 0, stock_qty: 0, risk_grade: "A", display_scope: "app_web", payment_scope: "card_transfer", status: "draft", thumbnail_url: uploadResult?.file_url ?? "" });
      await loadPublicData();
    } catch (e) { alert(String(e)); }
  }

  function editProduct(item: AnyRow) {
    setProductForm(item);
    setSelectedProductId(item.id);
    setLastAction(`상품 ${item.id} 편집모드`);
  }

  async function deleteProduct(id: number) {
    try {
      await postJson(`/products/${id}/delete`, {});
      setLastAction(`상품 ${id} 삭제 완료`);
      await loadPublicData();
    } catch (e) { alert(String(e)); }
  }

  async function saveContent() {
    try {
      await postJson("/contents", contentForm);
      setLastAction("콘텐츠 저장 완료");
      setContentForm({ author_id: 1, category: "가이드", title: "", body: "", visibility: "safe", thumbnail_url: "", video_url: "", status: "draft" });
      await loadPublicData();
    } catch (e) { alert(String(e)); }
  }

  function editContent(item: AnyRow) {
    setContentForm(item);
    setLastAction(`콘텐츠 ${item.id} 편집모드`);
  }

  async function deleteContent(id: number) {
    try {
      await postJson(`/contents/${id}/delete`, {});
      setLastAction(`콘텐츠 ${id} 삭제 완료`);
      await loadPublicData();
    } catch (e) { alert(String(e)); }
  }

  async function uploadMedia() {
    try {
      if (!selectedFile) throw new Error("파일을 선택하세요");
      const form = new FormData();
      form.append("file", selectedFile);
      const uploaded: any = await postForm("/upload", form);
      setUploadResult(uploaded);
      setLastAction(`업로드 완료: ${uploaded.saved_name}`);
      if (selectedProductId) {
        await postJson("/products/media", { product_id: selectedProductId, file_name: uploaded.saved_name, file_url: uploaded.file_url, media_type: uploaded.media_type, sort_order: 0 });
        await loadPublicData();
      }
    } catch (e) { alert(String(e)); }
  }

  async function createOrder() {
    try {
      await postJson("/orders", orderForm);
      setLastAction("주문 생성 완료");
      await loadPublicData();
    } catch (e) { alert(String(e)); }
  }

  async function createReport() {
    try {
      await postJson("/reports", reportForm);
      setLastAction("신고 생성 완료");
      await loadPublicData();
    } catch (e) { alert(String(e)); }
  }

  async function resolveReport(id: number, status: string) {
    try {
      await postJson(`/reports/${id}/resolve`, { status, action_taken: status === "resolved" ? "검토 후 해제" : "임시조치" });
      setLastAction(`신고 ${id} 처리 완료`);
      await loadPublicData();
    } catch (e) { alert(String(e)); }
  }

  async function createCommunityPost() {
    try {
      await postJson("/community/posts", postForm);
      setLastAction("커뮤니티 피드 작성 완료");
      setPostForm({ ...postForm, title: "", body: "" });
      await loadPublicData();
    } catch (e) { alert(String(e)); }
  }

  async function createThread(targetId?: number, relatedPostId?: number) {
    try {
      const payload = { ...threadForm, participant_b_id: targetId ?? threadForm.participant_b_id, related_post_id: relatedPostId ?? threadForm.related_post_id };
      const thread = await postJson<any>("/community/threads", payload);
      setSelectedThreadId(thread.id);
      setMessageForm({ ...messageForm, thread_id: thread.id, purpose_code: payload.purpose_code });
      setLastAction(`DM 스레드 ${thread.id} 생성 완료`);
      await loadPublicData();
      await loadMessages(thread.id);
    } catch (e) { alert(String(e)); }
  }

  async function loadMessages(threadId: number) {
    try {
      const rows = await getJson<any>(`/community/threads/${threadId}/messages`);
      setSelectedThreadId(threadId);
      setDmMessages(rows);
      setMessageForm({ ...messageForm, thread_id: threadId });
    } catch (e) { alert(String(e)); }
  }

  async function sendMessage() {
    try {
      await postJson("/community/messages", messageForm);
      setLastAction("DM 전송 완료");
      if (messageForm.thread_id) await loadMessages(messageForm.thread_id);
      setMessageForm({ ...messageForm, message: "" });
      await loadPublicData();
    } catch (e) { alert(String(e)); }
  }

  const metricCards = useMemo(() => metrics.slice(0, 8), [metrics]);
  const roleInfo = useMemo(() => roleUsageMap[currentGrade] ?? roleUsageMap["1"], [currentGrade]);
  const visibleTabs = useMemo(() => roleInfo.tabs, [roleInfo]);
  const isAdmin = currentGrade === "1";
  const isSeller = currentGrade === "4";
  const isCustomer = currentGrade === "5";
  const isGeneral = currentGrade === "6";

  function switchDemoRole(grade: string) {
    const preset = roleAccountMap[grade];
    if (!preset) return;
    setLoginForm({ ...loginForm, ...preset, otp_code: "", backup_code: "" });
    setCurrentGrade(grade);
    setLastAction(`${gradeLabelMap[grade]} 데모 계정 준비 완료`);
  }

  const progressRows = useMemo(() => (projectStatus?.items ?? []).map((item: AnyRow) => ({
    항목: item.category,
    진행도: `${item.percent}%`,
    상태: item.status,
    부족항목: (item.gaps ?? []).join(", "),
  })), [projectStatus]);

  const HomeTab = (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">Adult platform starter · React(Vite) + FastAPI</div>
          <h1>보안 · 운영 · 상품 · 주문 기본 뼈대</h1>
          <p>현재 진행도를 반영해 주문/정산 미리보기, 신고/운영 로그, 업로드 검증, 기본 QA 스모크 체크까지 프로젝트 앱 범위에서 즉시 확장 가능한 부분을 추가 반영했습니다.</p>
        </div>
        <div className="hero-status">{lastAction}</div>
      </section>
      <div className="status-band">
        <div className="status-pill"><span className="muted">현재 역할</span><strong>{gradeLabelMap[currentGrade]}</strong></div>
        <div className="status-pill"><span className="muted">즉시 사용 범위</span><strong>{roleInfo.summary}</strong></div>
        <div className="status-pill"><span className="muted">현재 상태</span><strong>{lastAction}</strong></div>
      </div>
      <div className="metric-grid">{metricCards.map((m) => <div className="metric-card" key={m.key}><span>{m.label}</span><strong>{m.value}</strong></div>)}</div>
      <div className="grid-2">
        <Card title="Launch Gate"><Table rows={launchGates} /></Card>
        <Card title="판매자 활성화 체크리스트"><pre>{JSON.stringify(sellerChecklist, null, 2)}</pre></Card>
      </div>
      <div className="grid-2">
        <Card title="카테고리 그룹 기본 뼈대"><Table rows={categories} /></Card>
        <Card title="실연동 개요"><pre>{JSON.stringify(integrationOverview, null, 2)}</pre></Card>
      </div>
      <div className="grid-2">
        <Card title="현재 진행상태 퍼센트"><Table rows={progressRows} /></Card>
        <Card title="추가 보완 필요 항목">
          {projectStatus?.overall ? <pre>{JSON.stringify(projectStatus.overall, null, 2)}</pre> : null}
          <ul className="bullet-list">{updateNeeds.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
        </Card>
      </div>
      <div className="grid-2">
        <Card title="계정등급별 즉시 사용 모드">
          <div className="actions">
            <button onClick={() => switchDemoRole("1")}>관리자 모드</button>
            <button onClick={() => switchDemoRole("4")}>사업자 모드</button>
            <button onClick={() => switchDemoRole("5")}>소비자 모드</button>
            <button onClick={() => switchDemoRole("6")}>일반회원 모드</button>
          </div>
          <div className="role-board">
            <div className="role-chip">현재 선택 등급: {gradeLabelMap[currentGrade]}</div>
            <p className="muted">{roleInfo.summary}</p>
            <ul className="bullet-list">{roleInfo.buttons.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </Card>
        <Card title="계정별 사용 목적 안내">
          <Table rows={Object.entries(roleUsageMap).map(([grade, info]) => ({ 등급: `${grade} - ${gradeLabelMap[grade]}`, 사용목적: info.summary, 노출탭: info.tabs.join(', '), 주요버튼: info.buttons.join(', ') }))} />
        </Card>
      </div>
      <div className="grid-2">
        <Card title="커뮤니티 피드 · 정보 교류">
          <div className="notice-box">정보 교류 목적의 피드/DM은 가능하지만, 연락처 공유·오프라인 만남 유도·성매매 연상 표현은 금지하고 즉시 차단되도록 설계했습니다.</div>
          <div className="form-grid two-col" style={{marginTop:12}}>
            <input value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} placeholder="카테고리" />
            <input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} placeholder="피드 제목" />
            <select value={postForm.visibility} onChange={(e) => setPostForm({ ...postForm, visibility: e.target.value })}><option value="safe">safe</option><option value="auth_only">auth_only</option></select>
            <select value={postForm.allow_dm ? "yes" : "no"} onChange={(e) => setPostForm({ ...postForm, allow_dm: e.target.value === "yes" })}><option value="yes">DM 허용</option><option value="no">DM 차단</option></select>
            <textarea value={postForm.body} onChange={(e) => setPostForm({ ...postForm, body: e.target.value })} placeholder="제품 사용 팁, 보관 방법, 익명포장 경험, 정책/환불 경험 등 안전한 정보 교류만 작성" />
          </div>
          <div className="actions"><button onClick={createCommunityPost}>피드 작성</button></div>
          <Table rows={communityPosts} />
          <div className="action-list">{communityPosts.filter((row) => row.allow_dm).slice(0, 6).map((row) => (<div key={row.id} className="inline-actions"><button onClick={() => createThread(row.author_id, row.id)}>작성자에게 정보 DM</button></div>))}</div>
        </Card>
        <Card title="정보 DM · 상품/운영 문의">
          <div className="form-grid two-col">
            <input type="number" value={threadForm.participant_b_id} onChange={(e) => setThreadForm({ ...threadForm, participant_b_id: Number(e.target.value) })} placeholder="상대 user_id" />
            <input value={threadForm.subject} onChange={(e) => setThreadForm({ ...threadForm, subject: e.target.value })} placeholder="DM 제목" />
            <select value={threadForm.purpose_code} onChange={(e) => setThreadForm({ ...threadForm, purpose_code: e.target.value, thread_type: e.target.value === "PRODUCT_QA" ? "product_inquiry" : "feed_reply" })}><option value="PRODUCT_QA">PRODUCT_QA</option><option value="FEED_REPLY">FEED_REPLY</option><option value="SUPPORT">SUPPORT</option><option value="INFO_EXCHANGE">INFO_EXCHANGE</option></select>
            <input type="number" value={threadForm.related_product_id ?? 1} onChange={(e) => setThreadForm({ ...threadForm, related_product_id: Number(e.target.value) })} placeholder="related_product_id" />
          </div>
          <div className="actions"><button onClick={() => createThread()}>DM 스레드 시작</button></div>
          <Table rows={dmThreads} />
          <div className="action-list">{dmThreads.map((thread) => <button key={thread.id} onClick={() => loadMessages(thread.id)}>대화 {thread.id} 열기</button>)}</div>
          <hr className="soft" />
          <div className="form-grid">
            <input type="number" value={messageForm.thread_id} onChange={(e) => setMessageForm({ ...messageForm, thread_id: Number(e.target.value) })} placeholder="thread_id" />
            <textarea value={messageForm.message} onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })} placeholder="상품 문의, 보관 방법, 배송 문의, 운영 문의 등 안전한 내용만 전송" />
          </div>
          <div className="actions"><button onClick={sendMessage}>DM 전송</button></div>
          <Table rows={dmMessages} />
        </Card>
      </div>
      <div className="grid-2">
        <Card title="QA 스모크 체크"><pre>{JSON.stringify(smoke, null, 2)}</pre></Card>
        <Card title="정산 미리보기 요약"><pre>{JSON.stringify(settlements?.summary ?? {}, null, 2)}</pre></Card>
      </div>
    </>
  );

  const ShopTab = (
    <div className="grid-2">
      {(isAdmin || isSeller) ? <Card title="상품 등록 / 수정">
        <div className="form-grid two-col">
          <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="상품명" />
          <input value={productForm.sku_code} onChange={(e) => setProductForm({ ...productForm, sku_code: e.target.value })} placeholder="SKU 코드" />
          <input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} placeholder="카테고리" />
          <input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} placeholder="가격" />
          <input type="number" value={productForm.stock_qty} onChange={(e) => setProductForm({ ...productForm, stock_qty: Number(e.target.value) })} placeholder="재고수량" />
          <select value={productForm.status} onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}><option value="draft">draft</option><option value="published">published</option></select>
          <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="상품 설명" />
          <input value={productForm.thumbnail_url} onChange={(e) => setProductForm({ ...productForm, thumbnail_url: e.target.value })} placeholder="썸네일 URL" />
        </div>
        <div className="actions"><button onClick={saveProduct}>상품 저장</button></div>
      </Card> : <Card title="상품 등록 / 수정"><p className="muted">관리자/사업자 계정에서만 상품 등록/수정이 가능합니다.</p></Card>}
      {(isAdmin || isSeller) ? <Card title="사진 / 영상 첨부">
        <div className="form-grid">
          <input type="number" value={selectedProductId ?? ""} onChange={(e) => setSelectedProductId(Number(e.target.value))} placeholder="product_id" />
          <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
          <div className="actions"><button onClick={uploadMedia}>업로드</button></div>
        </div>
        <pre>{JSON.stringify(uploadResult, null, 2)}</pre>
      </Card> : <Card title="사진 / 영상 첨부"><p className="muted">관리자/사업자 계정에서만 미디어 업로드가 가능합니다.</p></Card>}
      <Card title="상품 목록"><Table rows={products} /><div className="action-list">{(isAdmin || isSeller) ? products.map((item) => <div key={item.id} className="inline-actions"><button onClick={() => editProduct(item)}>편집</button><button className="danger" onClick={() => deleteProduct(item.id)}>삭제</button></div>) : <p className="muted">일반 조회 전용</p>}</div></Card>
      <Card title="SKU / 결제 / 노출 규칙"><Table rows={skuPolicy.payment_method_mapping ?? []} /></Card>
      <Card title="PG Provider"><Table rows={pgProviders} /></Card>
      <Card title="성인인증 Provider"><Table rows={adultProviders} /></Card>
    </div>
  );

  const OrderTab = (
    <div className="grid-2">
      {(isAdmin || isCustomer || isSeller) ? <Card title="주문 생성 기본 뼈대">
        <div className="form-grid two-col">
          <input type="number" value={orderForm.product_id} onChange={(e) => setOrderForm({ ...orderForm, product_id: Number(e.target.value) })} placeholder="product_id" />
          <input type="number" value={orderForm.qty} onChange={(e) => setOrderForm({ ...orderForm, qty: Number(e.target.value) })} placeholder="수량" />
          <select value={orderForm.payment_method} onChange={(e) => setOrderForm({ ...orderForm, payment_method: e.target.value })}><option value="card">card</option><option value="transfer">transfer</option><option value="virtual_account">virtual_account</option></select>
          <input value={orderForm.payment_pg} onChange={(e) => setOrderForm({ ...orderForm, payment_pg: e.target.value })} placeholder="payment pg" />
          <input type="number" step="0.01" value={orderForm.fee_rate} onChange={(e) => setOrderForm({ ...orderForm, fee_rate: Number(e.target.value) })} placeholder="fee_rate" />
          <select value={orderForm.coupon_burden_owner} onChange={(e) => setOrderForm({ ...orderForm, coupon_burden_owner: e.target.value })}><option value="platform">platform</option><option value="seller">seller</option></select>
        </div>
        <div className="actions"><button onClick={createOrder}>주문 생성</button></div>
      </Card> : <Card title="주문 생성 기본 뼈대"><p className="muted">일반회원은 주문 생성 대신 공개 상품/가이드 열람만 가능합니다.</p></Card>}
      <Card title="정산 미리보기"><Table rows={settlements?.items ?? []} /></Card>
      <Card title="주문 목록"><Table rows={orders} /></Card>
      {(isAdmin || isSeller || isCustomer) ? <Card title="환불 상태머신"><Table rows={refunds} /><div className="action-list">{(isAdmin || isSeller) ? refunds.map((r) => <div key={r.id} className="inline-actions"><button onClick={() => moveRefund(r.id, "seller_notified")}>통지</button><button onClick={() => moveRefund(r.id, "pickup_requested")}>회수</button><button onClick={() => moveRefund(r.id, "inspecting")}>검수</button><button onClick={() => moveRefund(r.id, "approved")}>승인</button><button className="danger" onClick={() => moveRefund(r.id, "rejected")}>반려</button></div>) : <p className="muted">소비자는 상태 조회 중심, 사업자/관리자는 처리 버튼 사용 가능</p>}</div></Card> : <Card title="환불 상태머신"><p className="muted">환불 상태는 로그인 계정 등급에 따라 제한적으로 확인됩니다.</p></Card>}
      <Card title="세무/정산 준비"><pre>{JSON.stringify(taxDashboard, null, 2)}</pre></Card>
    </div>
  );

  const OpsTab = (
    <div className="grid-2">
      {(isAdmin || currentGrade === "2" || currentGrade === "3") ? <Card title="콘텐츠 등록 / 수정">
        <div className="form-grid two-col">
          <input value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} placeholder="제목" />
          <input value={contentForm.category} onChange={(e) => setContentForm({ ...contentForm, category: e.target.value })} placeholder="카테고리" />
          <input value={contentForm.thumbnail_url} onChange={(e) => setContentForm({ ...contentForm, thumbnail_url: e.target.value })} placeholder="썸네일 URL" />
          <input value={contentForm.video_url} onChange={(e) => setContentForm({ ...contentForm, video_url: e.target.value })} placeholder="영상 URL" />
          <select value={contentForm.visibility} onChange={(e) => setContentForm({ ...contentForm, visibility: e.target.value })}><option value="safe">safe</option><option value="auth_only">auth_only</option><option value="web_only">web_only</option></select>
          <select value={contentForm.status} onChange={(e) => setContentForm({ ...contentForm, status: e.target.value })}><option value="draft">draft</option><option value="published">published</option></select>
          <textarea value={contentForm.body} onChange={(e) => setContentForm({ ...contentForm, body: e.target.value })} placeholder="본문" />
        </div>
        <div className="actions"><button onClick={saveContent}>콘텐츠 저장</button></div>
      </Card> : <Card title="콘텐츠 등록 / 수정"><p className="muted">운영/관리 계정에서만 콘텐츠 등록 및 수정이 가능합니다.</p></Card>}
      <Card title="콘텐츠 목록"><Table rows={contents} /><div className="action-list">{(isAdmin || currentGrade === "2" || currentGrade === "3") ? contents.map((item) => <div key={item.id} className="inline-actions"><button onClick={() => editContent(item)}>편집</button><button className="danger" onClick={() => deleteContent(item.id)}>삭제</button></div>) : <p className="muted">열람 전용</p>}</div></Card>
      {(isAdmin || currentGrade === "2" || currentGrade === "3" || isCustomer) ? <Card title="신고 생성 / 처리">
        <div className="form-grid two-col">
          <input type="number" value={reportForm.reporter_id} onChange={(e) => setReportForm({ ...reportForm, reporter_id: Number(e.target.value) })} placeholder="reporter_id" />
          <input value={reportForm.target_type} onChange={(e) => setReportForm({ ...reportForm, target_type: e.target.value })} placeholder="target_type" />
          <input type="number" value={reportForm.target_id} onChange={(e) => setReportForm({ ...reportForm, target_id: Number(e.target.value) })} placeholder="target_id" />
          <input value={reportForm.reason_code} onChange={(e) => setReportForm({ ...reportForm, reason_code: e.target.value })} placeholder="reason_code" />
          <select value={reportForm.priority} onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}><option value="normal">normal</option><option value="high">high</option></select>
        </div>
        <div className="actions"><button onClick={createReport}>신고 등록</button></div>
        <Table rows={reports} />
        <div className="action-list">{(isAdmin || currentGrade === "2" || currentGrade === "3") ? reports.map((item) => <div key={item.id} className="inline-actions"><button onClick={() => resolveReport(item.id, "resolved")}>해제</button><button className="danger" onClick={() => resolveReport(item.id, "actioned")}>조치</button></div>) : <p className="muted">소비자는 신고 등록, 운영/관리자는 처리 가능</p>}</div>
      </Card> : <Card title="신고 생성 / 처리"><p className="muted">신고는 고객/운영/관리자 계정에서 사용 가능합니다.</p></Card>}
      {isAdmin ? <Card title="관리자 액션 로그"><Table rows={actionLogs} /></Card> : <Card title="관리자 액션 로그"><p className="muted">관리자 전용 로그 화면입니다.</p></Card>}
      <Card title="판매자 패널티"><Table rows={penalties} /></Card>
      <Card title="앱 자산 DB"><Table rows={assets} /></Card>
    </div>
  );

  const SecurityTab = (
    <div className="grid-2">
      <Card title="로그인 / 2FA / Refresh">
        <div className="form-grid two-col">
          <input value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="email" />
          <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="password" />
          <input value={loginForm.device_name} onChange={(e) => setLoginForm({ ...loginForm, device_name: e.target.value })} placeholder="device name" />
          <input value={loginForm.otp_code} onChange={(e) => setLoginForm({ ...loginForm, otp_code: e.target.value })} placeholder="OTP" />
          <input value={loginForm.backup_code} onChange={(e) => setLoginForm({ ...loginForm, backup_code: e.target.value })} placeholder="backup code" />
        </div>
        <div className="actions"><button onClick={login}>로그인</button><button onClick={() => completeTwoFactor(false)} disabled={!challengeToken}>OTP 인증</button><button onClick={() => completeTwoFactor(true)} disabled={!challengeToken}>백업코드 인증</button><button onClick={refreshAccess}>토큰 재발급</button><button onClick={logout}>로그아웃</button></div>
        <pre>{JSON.stringify({ authMe, challengeToken }, null, 2)}</pre>
      </Card>
      <Card title="비밀번호 변경 / 초기화">
        <div className="form-grid two-col">
          <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} placeholder="현재 비밀번호" />
          <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} placeholder="새 비밀번호" />
          <input value={resetRequestEmail} onChange={(e) => setResetRequestEmail(e.target.value)} placeholder="reset email" />
          <input value={resetToken} onChange={(e) => setResetToken(e.target.value)} placeholder="reset token" />
          <input type="password" value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} placeholder="reset new password" />
        </div>
        <div className="actions"><button onClick={changePassword}>비밀번호 변경</button><button onClick={requestReset}>초기화 요청</button><button onClick={confirmReset}>초기화 확정</button></div>
      </Card>
      <Card title="관리자 2FA 등록 / 백업코드">
        <div className="actions"><button onClick={setupTwoFA}>2FA 시크릿 발급</button><button onClick={verifyTwoFA}>2FA 검증</button><button onClick={regenerateBackupCodes}>백업코드 재생성</button></div>
        <pre>{JSON.stringify({ twoFASetup, backupCodes }, null, 2)}</pre>
      </Card>
      <Card title="기기별 세션관리"><Table rows={sessions} /><div className="action-list">{sessions.map((s) => <div key={s.id} className="inline-actions"><button className="danger" onClick={() => revokeSession(s.id)}>세션 종료</button></div>)}</div></Card>
      <Card title="Rate Limit / 보안 제어"><pre>{JSON.stringify(security, null, 2)}</pre></Card>
      <Card title="RBAC"><pre>{JSON.stringify(rbacMap, null, 2)}</pre></Card>
    </div>
  );

  const ReviewTab = (
    <div className="grid-2">
      <Card title="앱 심사 모드"><pre>{JSON.stringify(reviewMode, null, 2)}</pre></Card>
      <Card title="심사 스크린샷 자산"><Table rows={screenshots} /></Card>
      <Card title="승인 큐"><Table rows={approvalQueue} /><div className="action-list">{approvalQueue.map((row) => <div key={row.id} className="inline-actions"><button onClick={() => approveQueue(row.id)}>승인</button></div>)}</div></Card>
    </div>
  );

  const safeTab = visibleTabs.includes(activeTab) ? activeTab : visibleTabs[0];
  const body = safeTab === "홈" ? HomeTab : safeTab === "쇼핑" ? ShopTab : safeTab === "주문" ? OrderTab : safeTab === "운영" ? OpsTab : safeTab === "보안" ? SecurityTab : ReviewTab;

  useEffect(() => {
    setMobileNavOpen(false);
  }, [safeTab, currentGrade]);

  return (
    <div className="app-shell">
      <div className={mobileNavOpen ? "sidebar-backdrop open" : "sidebar-backdrop"} onClick={() => setMobileNavOpen(false)} />
      <aside className={mobileNavOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-head">
          <div className="brand">adultapp</div>
          <button className="sidebar-close" onClick={() => setMobileNavOpen(false)} aria-label="메뉴 닫기">닫기</button>
        </div>
        <div className="sidebar-role-card">
          <span className="muted">접속 역할</span>
          <strong>{gradeLabelMap[currentGrade]}</strong>
          <small>{roleInfo.summary}</small>
        </div>
        <nav className="sidebar-nav">
          {visibleTabs.map((tab) => (
            <button
              key={tab}
              className={safeTab === tab ? "nav-btn active" : "nav-btn"}
              onClick={() => {
                setActiveTab(tab);
                setMobileNavOpen(false);
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-panel">
        <header className="mobile-topbar">
          <button className="menu-toggle" onClick={() => setMobileNavOpen(true)} aria-label="메뉴 열기">☰</button>
          <div className="mobile-topbar-copy">
            <strong>adultapp</strong>
            <span>{gradeLabelMap[currentGrade]} · {safeTab}</span>
          </div>
          <div className="mobile-topbar-state">{lastAction}</div>
        </header>
        <div className="notice-box">블랙 테마 기준으로 가독성을 보강했고, 계정 등급에 따라 탭/버튼/업무 흐름이 바로 분기되도록 연결했습니다.</div>
        {body}
      </main>
      <nav className="mobile-bottom-nav" aria-label="모바일 하단 탭">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            className={safeTab === tab ? "mobile-tab active" : "mobile-tab"}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
}
