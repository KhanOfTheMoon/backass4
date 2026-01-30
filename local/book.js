const bookRoot = document.getElementById("bookRoot");
const reviewsList = document.getElementById("reviewsList");
const adminReviewBox = document.getElementById("adminReviewBox");
const createReviewForm = document.getElementById("createReviewForm");
const reviewMsg = document.getElementById("reviewMsg");

const id = App.qs("id");

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function stars(v){
  const n = Math.max(0, Math.min(5, Number(v) || 0));
  const full = Math.round(n);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function money(v){
  const n = Number(v);
  if (!Number.isFinite(n)) return `$${String(v)}`;
  const formatted = n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `$${formatted}`;
}

function renderBook(b){
  const title = b.title || "";
  const author = b.author || "";
  const desc = b.description || "";
  const rating = b.rating ?? 0;
  const reviewsCount = b.reviewsCount ?? 0;
  const price = b.price ?? 0;

  bookRoot.innerHTML = `
    <section class="card p-3">
      <div class="row" style="justify-content:space-between; align-items:flex-start; gap:16px">
        <div style="flex:1">
          <div class="meta">${escapeHtml(author)}</div>
          <h1 style="margin:6px 0 6px">${escapeHtml(title)}</h1>
          <div class="meta">${stars(rating)} • ${reviewsCount} reviews</div>
          <div class="price" style="margin-top:10px">${money(price)}</div>
        </div>
        ${App.isAdmin() ? `<a class="btn btn-light" href="index.html">Back</a>` : `<a class="btn btn-light" href="index.html">Back</a>`}
      </div>
      <hr class="hr" style="margin:14px 0">
      <div class="meta">Description</div>
      <div style="margin-top:6px; line-height:1.5">${escapeHtml(desc)}</div>
    </section>
  `;
}

function renderReviews(arr){
  if (!arr.length) {
    reviewsList.innerHTML = `<div class="muted">No reviews yet.</div>`;
    return;
  }
  reviewsList.innerHTML = "";
  arr.forEach(r => {
    const rid = r._id || r.id;
    const name = r.name || r.reviewer || "user";
    const text = r.text || r.comment || "";
    const st = r.stars ?? r.rating ?? 0;
    const ts = r.createdAt ? new Date(r.createdAt).toLocaleString() : "";
    const delBtn = App.isAdmin() ? `<button class="btn btn-danger" data-rdel="${encodeURIComponent(rid)}">Delete</button>` : "";

    const el = document.createElement("article");
    el.className = "card p-3";
    el.innerHTML = `
      <div class="row" style="justify-content:space-between; align-items:center">
        <div class="meta">${escapeHtml(name)} ${ts ? "• " + escapeHtml(ts) : ""}</div>
        ${delBtn}
      </div>
      <div class="stars" style="margin-top:6px">${stars(st)}</div>
      <div style="margin-top:6px; line-height:1.45">${escapeHtml(text)}</div>
    `;
    reviewsList.appendChild(el);
  });

  if (App.isAdmin()) {
    reviewsList.querySelectorAll("button[data-rdel]").forEach(btn => {
      btn.onclick = async () => {
        const rid = btn.getAttribute("data-rdel");
        if (!confirm("Delete this review?")) return;
        try {
          await App.api(`/reviews/${rid}`, { method: "DELETE" });
          await load();
        } catch (e) {
          alert(e.message);
        }
      };
    });
  }
}

async function load(){
  if (!id) {
    bookRoot.innerHTML = `<div class="card p-3">Missing id</div>`;
    return;
  }

  try {
    const book = await App.api(`/books/${encodeURIComponent(id)}`, { method: "GET" });
    renderBook(book);
  } catch (e) {
    bookRoot.innerHTML = `<div class="card p-3">Error: ${escapeHtml(e.message)}</div>`;
    return;
  }

  try {
    const allReviews = await App.api("/reviews", { method: "GET" });
    const filtered = (Array.isArray(allReviews) ? allReviews : []).filter(r => {
      const bid = r.bookId || r.book || r.book_id;
      return String(bid) === String(id);
    });
    renderReviews(filtered);
  } catch (e) {
    reviewsList.innerHTML = `<div class="muted">Error: ${escapeHtml(e.message)}</div>`;
  }
}

if (adminReviewBox) adminReviewBox.style.display = App.isAdmin() ? "block" : "none";

if (createReviewForm) {
  createReviewForm.onsubmit = async (e) => {
    e.preventDefault();
    reviewMsg.textContent = "";
    try {
      const payload = {
        bookId: id,
        name: document.getElementById("rName").value.trim(),
        stars: Number(document.getElementById("rStars").value),
        text: document.getElementById("rText").value.trim()
      };
      await App.api("/reviews", { method: "POST", body: JSON.stringify(payload) });
      createReviewForm.reset();
      reviewMsg.textContent = "Created.";
      await load();
    } catch (err) {
      reviewMsg.textContent = err.message;
    }
  };
}

load();