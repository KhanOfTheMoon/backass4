const listEl = document.getElementById("list");
const hintEl = document.getElementById("hint");
const sortEl = document.getElementById("sort");
const minRatingEl = document.getElementById("minRating");
const resetBtn = document.getElementById("reset");
const adminBox = document.getElementById("adminBox");
const sessionInfo = document.getElementById("sessionInfo");

const createBookForm = document.getElementById("createBookForm");
const adminMsg = document.getElementById("adminMsg");

let all = [];

function money(v){
  const n = Number(v);
  if (!Number.isFinite(n)) return `$${String(v)}`;
  const formatted = n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `$${formatted}`;
}

function stars(v){
  const n = Math.max(0, Math.min(5, Number(v) || 0));
  const full = Math.round(n);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function render(arr){
  if (!arr.length) {
    listEl.innerHTML = `<div class="card p-3 muted">No books found.</div>`;
    return;
  }

  listEl.innerHTML = "";
  arr.forEach(b => {
    const id = b._id || b.id;
    const title = b.title || "";
    const author = b.author || "";
    const rating = b.rating ?? 0;
    const reviewsCount = b.reviewsCount ?? 0;
    const price = b.price ?? 0;

    const el = document.createElement("article");
    el.className = "card book-card";
    el.innerHTML = `
      <div class="content">
        <div class="meta">${author}</div>
        <div style="font-weight:900; margin-top:4px">${escapeHtml(title)}</div>
        <div class="meta" style="margin-top:6px">${stars(rating)} • ${reviewsCount} reviews</div>
        <div class="row" style="justify-content:space-between; margin-top:10px">
          <div class="price">${money(price)}</div>
          <div class="row">
            <a class="btn btn-light" href="book.html?id=${encodeURIComponent(id)}">Details</a>
            ${App.isAdmin() ? `<button class="btn btn-danger" data-del="${encodeURIComponent(id)}">Delete</button>` : ``}
          </div>
        </div>
      </div>
    `;
    listEl.appendChild(el);
  });

  if (App.isAdmin()) {
    listEl.querySelectorAll("button[data-del]").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-del");
        if (!confirm("Delete this book?")) return;
        try {
          await App.api(`/books/${id}`, { method: "DELETE" });
          await load();
        } catch (e) {
          alert(e.message);
        }
      };
    });
  }
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function apply(){
  const q = (App.qs("q") || "").toLowerCase();
  const minR = Number(minRatingEl.value || 0);

  let arr = all.filter(b => {
    const t = String(b.title || "").toLowerCase();
    const a = String(b.author || "").toLowerCase();
    const okQ = !q || t.includes(q) || a.includes(q);
    const okR = (Number(b.rating) || 0) >= minR;
    return okQ && okR;
  });

  const mode = sortEl.value;
  if (mode === "az") arr.sort((x,y)=>String(x.title||"").localeCompare(String(y.title||"")));
  if (mode === "rating") arr.sort((x,y)=>(Number(y.rating)||0)-(Number(x.rating)||0));
  if (mode === "reviews") arr.sort((x,y)=>(Number(y.reviewsCount)||0)-(Number(x.reviewsCount)||0));
  if (mode === "price") arr.sort((x,y)=>(Number(x.price)||0)-(Number(y.price)||0));
  if (mode === "new") arr.sort((x,y)=>new Date(y.createdAt||0)-new Date(x.createdAt||0));

  hintEl.textContent = q ? `Search: "${q}" • results: ${arr.length}` : `Total books: ${arr.length}`;
  render(arr);
}

async function load(){
  try {
    all = await App.api("/books", { method: "GET" });
    apply();
  } catch (e) {
    listEl.innerHTML = `<div class="card p-3">Error: ${escapeHtml(e.message)}</div>`;
  }
}

sortEl.onchange = apply;
minRatingEl.oninput = apply;

resetBtn.onclick = () => {
  sortEl.value = "new";
  minRatingEl.value = "0";
  const url = new URL(location.href);
  url.searchParams.delete("q");
  history.replaceState({}, "", url.toString());
  apply();
};

if (adminBox) adminBox.style.display = App.isAdmin() ? "block" : "none";
if (sessionInfo) {
  sessionInfo.textContent = App.store.token ? `${App.store.role} • ${App.store.email}` : "guest";
}

if (createBookForm) {
  createBookForm.onsubmit = async (e) => {
    e.preventDefault();
    adminMsg.textContent = "";
    try {
      const payload = {
        title: document.getElementById("bTitle").value.trim(),
        author: document.getElementById("bAuthor").value.trim(),
        price: Number(document.getElementById("bPrice").value),
        rating: Number(document.getElementById("bRating").value),
        reviewsCount: Number(document.getElementById("bReviews").value),
        description: document.getElementById("bDesc").value.trim()
      };
      await App.api("/books", { method: "POST", body: JSON.stringify(payload) });
      createBookForm.reset();
      adminMsg.textContent = "Created.";
      await load();
    } catch (err) {
      adminMsg.textContent = err.message;
    }
  };
}

load();