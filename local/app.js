const API_BASE = "/api";

const store = {
  get token(){ return localStorage.getItem("token") || ""; },
  set token(v){ v ? localStorage.setItem("token", v) : localStorage.removeItem("token"); },
  get role(){ return localStorage.getItem("role") || ""; },
  set role(v){ v ? localStorage.setItem("role", v) : localStorage.removeItem("role"); },
  get email(){ return localStorage.getItem("email") || ""; },
  set email(v){ v ? localStorage.setItem("email", v) : localStorage.removeItem("email"); },
  logout(){ this.token=""; this.role=""; this.email=""; }
};

function qs(k){ return new URLSearchParams(location.search).get(k); }

async function api(path, options = {}) {
  const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
  if (store.token) headers.Authorization = `Bearer ${store.token}`;
  const res = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
  if (!res.ok) throw new Error(data?.error || data?.message || "Request failed");
  return data;
}

function setTheme(next){
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

function initShell(){
  const saved = localStorage.getItem("theme") || "dark";
  setTheme(saved);

  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.onclick = () => {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      setTheme(cur === "dark" ? "light" : "dark");
    };
  }

  const menuBtn = document.getElementById("menuToggle");
  const mobile = document.getElementById("mobileMenu");
  if (menuBtn && mobile) {
    menuBtn.onclick = () => {
      mobile.style.display = mobile.style.display === "block" ? "none" : "block";
    };
  }

  const searchForm = document.getElementById("globalSearch");
  const searchInput = document.getElementById("globalQuery");
  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (!q) return;
      location.href = `index.html?q=${encodeURIComponent(q)}`;
    });
  }

  const authLink = document.getElementById("authLink");
  const authLinkMobile = document.getElementById("authLinkMobile");
  const label = store.token ? (store.role === "admin" ? "Admin" : "User") : "Login";
  if (authLink) authLink.title = label;
  if (authLinkMobile) authLinkMobile.textContent = store.token ? `Account (${label})` : "Login / Register";
}

function isAdmin(){
  return store.role === "admin" && !!store.token;
}

initShell();

window.App = { api, qs, store, isAdmin };