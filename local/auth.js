const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const regMsg = document.getElementById("regMsg");
const logMsg = document.getElementById("logMsg");
const logoutBtn = document.getElementById("logoutBtn");
const whoBadge = document.getElementById("whoBadge");

function setSession(session){
  const token = session?.token || session?.accessToken || "";
  const role = session?.user?.role || session?.role || "";
  const email = session?.user?.email || session?.email || "";

  App.store.token = token;
  App.store.role = role;
  App.store.email = email;
}

function renderWho(){
  const ok = !!App.store.token;
  if (whoBadge) {
    whoBadge.style.display = ok ? "inline-flex" : "none";
    if (ok) whoBadge.textContent = `${App.store.role || "user"} • ${App.store.email || ""}`;
  }
  if (logoutBtn) logoutBtn.style.display = ok ? "inline-flex" : "none";
}

renderWho();

if (registerForm) {
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    regMsg.textContent = "";
    try {
      const payload = {
        email: document.getElementById("regEmail").value.trim(),
        password: document.getElementById("regPassword").value,
        role: document.getElementById("regRole").value
      };
      const data = await App.api("/auth/register", { method: "POST", body: JSON.stringify(payload) });
      setSession(data);
      regMsg.textContent = "Registered.";
      renderWho();
    } catch (err) {
      regMsg.textContent = err.message;
    }
  };
}

if (loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    logMsg.textContent = "";
    try {
      const payload = {
        email: document.getElementById("logEmail").value.trim(),
        password: document.getElementById("logPassword").value
      };
      const data = await App.api("/auth/login", { method: "POST", body: JSON.stringify(payload) });
      setSession(data);
      logMsg.textContent = "Logged in.";
      renderWho();
    } catch (err) {
      logMsg.textContent = err.message;
    }
  };
}

if (logoutBtn) {
  logoutBtn.onclick = () => {
    App.store.logout();
    renderWho();
  };
}