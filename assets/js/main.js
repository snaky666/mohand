// main.js - مدير الحجز بالـ LocalStorage
const CAPACITY = {
  "الأحد": 3,
  "الإثنين": 3,
  "الثلاثاء": 3,
  "الأربعاء": 1000,
  "الخميس": 1000,
  "الجمعة": 5,
  "السبت": 5
};

const STORAGE_KEY = "barber_bookings_v1";
const ANN_KEY = "barber_announcement_v1";

function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch(e){ return []; }
}

function saveBookings(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadAnnouncement(){
  return localStorage.getItem(ANN_KEY) || "";
}

function saveAnnouncement(text){
  localStorage.setItem(ANN_KEY, text);
}

function countForDay(day){
  const list = loadBookings();
  return list.filter(b => b.day === day).length;
}

function renderBookings(){
  const list = loadBookings();
  const container = document.getElementById("bookingsList");
  if(!list.length){ container.innerHTML = "<div class='muted'>لا توجد حجوزات بعد.</div>"; return; }
  // group by day
  const byDay = {};
  list.forEach(b => { (byDay[b.day] = byDay[b.day]||[]).push(b); });
  let html = "";
  Object.keys(byDay).forEach(day=>{
    html += `<h3 style="margin-top:8px">${day} — ${byDay[day].length} حجز</h3>`;
    byDay[day].forEach(b=>{
      html += `<div class="slot"><div><div class="name">${escapeHtml(b.name)}</div><div class="meta">${b.phone}</div></div><div class="meta">${b.id}</div></div>`;
    });
  });
  container.innerHTML = html;
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

document.addEventListener("DOMContentLoaded", ()=>{
  // show announcement
  const ann = loadAnnouncement();
  const announcementEl = document.getElementById("announcement");
  if (announcementEl) {
    announcementEl.textContent = ann;
  }

  const form = document.getElementById("bookingForm");
  const msg = document.getElementById("message");

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const day = document.getElementById("day").value;
    const phone = document.getElementById("phone").value.trim();

    if(!name || !day || !phone){
      msg.textContent = "يرجى ملء جميع الحقول.";
      return;
    }

    const capacity = CAPACITY[day] ?? 1000;
    const current = countForDay(day);
    if(current >= capacity){
      msg.textContent = `عذراً، تم امتلاء حجوزات يوم ${day}.`;
      return;
    }

    // create booking
    const id = 'BK' + Date.now().toString().slice(-6);
    const booking = { id, name, day, phone, createdAt: new Date().toISOString() };
    const list = loadBookings();
    list.push(booking);
    saveBookings(list);

    msg.textContent = `تم الحجز بنجاح — رقم الحجز: ${id}`;
    form.reset();
    renderBookings();
  });

  renderBookings();

  // social whatsapp links (example opens chat)
  const waLink = document.getElementById("waLink");
  const waFooter = document.getElementById("whatsappFooter");
  const phoneForWA = "213555123456"; // ضع رقم الصالون هنا إن أردت
  waLink.href = `https://wa.me/${phoneForWA}`;
  waFooter.href = `https://wa.me/${phoneForWA}`;
});
