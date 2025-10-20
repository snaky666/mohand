// admin.js - تحكم بسيط (client-side)
const STORAGE_KEY = "barber_bookings_v1";
const ANN_KEY = "barber_announcement_v1";

function loadBookings(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); }catch(e){return [];}}
function saveBookings(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
function loadAnnouncement(){ return localStorage.getItem(ANN_KEY) || ""; }
function saveAnnouncement(t){ localStorage.setItem(ANN_KEY, t); }

function renderAdmin(){
  const list = loadBookings();
  const container = document.getElementById("adminList");
  if(!list.length){ container.innerHTML = "<div class='muted'>لا توجد حجوزات.</div>"; return; }
  let html = "<div class='list'>";
  list.forEach((b, idx)=>{
    html += `<div class="slot"><div><div class="name">${escapeHtml(b.name)}</div><div class="meta">${b.day} • ${b.phone}</div></div><div><button class="btn" data-idx="${idx}" data-id="${b.id}">حذف</button></div></div>`;
  });
  html += "</div>";
  container.innerHTML = html;
  // attach delete
  container.querySelectorAll("button[data-idx]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const idx = Number(btn.dataset.idx);
      if(!confirm("هل تريد حذف هذا الحجز؟")) return;
      const cur = loadBookings();
      cur.splice(idx,1);
      saveBookings(cur);
      renderAdmin();
    });
  });
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

document.addEventListener("DOMContentLoaded", ()=>{
  // simple auth
  const correct = "admin123";
  const pw = prompt("أدخل كلمة مرور المدير:");
  if(pw !== correct){
    alert("كلمة المرور خاطئة. سيتم توجيهك إلى الصفحة الرئيسية.");
    window.location.href = "index.html";
    return;
  }

  // announcement controls
  const annInput = document.getElementById("announcementInput");
  annInput.value = loadAnnouncement();
  document.getElementById("saveAnn").addEventListener("click", ()=>{
    saveAnnouncement(annInput.value.trim());
    alert("تم نشر الإعلان.");
  });
  document.getElementById("clearAnn").addEventListener("click", ()=>{
    annInput.value = "";
    saveAnnouncement("");
    alert("تم إزالة الإعلان.");
  });

  renderAdmin();
});
