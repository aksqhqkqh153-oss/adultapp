(function () {
  var ADMIN_EMAIL = "aksqhqkqh3@naver.com";
  var ADMIN_PASSWORD = "329tjdrb@2a";
  var BUTTON_ID = "adultapp-admin-test-login-button";
  function apiBases() {
    var bases = [];
    try {
      var saved = window.localStorage.getItem("adultapp_active_api_base");
      if (saved) bases.push(saved.replace(/\/$/, ""));
    } catch (error) {}
    if (window.location.hostname.endsWith("up.railway.app")) bases.push(window.location.origin.replace(/\/$/, "") + "/api");
    bases.push("https://adultapp-production.up.railway.app/api");
    return Array.from(new Set(bases.filter(Boolean)));
  }
  function setMessage(text) {
    var target = document.querySelector(".auth-message-line");
    if (target) target.textContent = text;
  }
  async function adminLogin() {
    setMessage("관리자용 계정으로 로그인 중입니다.");
    var lastError = null;
    for (var i = 0; i < apiBases().length; i += 1) {
      var base = apiBases()[i];
      try {
        var res = await fetch(base + "/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, device_name: "admin-test-button" })
        });
        var text = await res.text();
        if (!res.ok) throw new Error("POST /auth/login failed: " + res.status + " " + text);
        var data = text ? JSON.parse(text) : {};
        if (!data.access_token) throw new Error("access_token missing");
        window.localStorage.setItem("adultapp_access_token", data.access_token);
        window.localStorage.setItem("adultapp_refresh_token", data.refresh_token || "");
        window.localStorage.setItem("adultapp_active_api_base", base);
        window.localStorage.setItem("adultapp_demo_role", String(data.role || "1"));
        setMessage("관리자용 계정 로그인 완료");
        window.location.reload();
        return;
      } catch (error) {
        lastError = error;
      }
    }
    setMessage(lastError instanceof Error ? lastError.message : "관리자용 계정 로그인 실패");
  }
  function hasLoginTitle() {
    return Array.from(document.querySelectorAll("h1,strong")).some(function (node) {
      return (node.textContent || "").trim() === "로그인";
    });
  }
  function ensureButton() {
    if (!hasLoginTitle()) return;
    if (document.getElementById(BUTTON_ID)) return;
    var rows = Array.from(document.querySelectorAll(".copy-action-row"));
    var row = rows.find(function (item) { return (item.textContent || "").includes("로그인") && (item.textContent || "").includes("회원가입"); });
    if (!row || !row.parentElement) return;
    var button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.className = "ghost-btn admin-test-login-btn";
    button.textContent = "관리자용 계정 테스트 접속";
    button.style.width = "100%";
    button.style.marginTop = "8px";
    button.addEventListener("click", adminLogin);
    row.parentElement.insertBefore(button, row.nextSibling);
  }
  var observer = new MutationObserver(ensureButton);
  window.addEventListener("DOMContentLoaded", function () {
    ensureButton();
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
