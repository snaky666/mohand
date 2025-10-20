// main.js - مدير الحجز بالـ LocalStorage
const DAILY_CAPACITY = 5; // سعة الحجز اليومية
const TOTAL_DAYS = 15; // عدد الأيام المتاحة للحجز

const STORAGE_KEY = "barber_bookings_v1";
const ANN_KEY = "barber_announcement_v1";

const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

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

// دالة للحصول على التاريخ بصيغة YYYY-MM-DD
function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// دالة للحصول على اسم اليوم بالعربية
function getArabicDayName(date) {
  return DAYS_AR[date.getDay()];
}

// دالة لإنشاء قائمة الأيام المتاحة (15 يوم من اليوم)
function getAvailableDates() {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      dateStr: getDateString(date),
      dayName: getArabicDayName(date),
      displayText: `${getArabicDayName(date)} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    });
  }
  
  return dates;
}

// دالة لحساب عدد الحجوزات لتاريخ معين
function countForDate(dateStr){
  const list = loadBookings();
  return list.filter(b => b.dateStr === dateStr).length;
}

// دالة لتنظيف الحجوزات القديمة (أقدم من اليوم)
function cleanOldBookings() {
  const list = loadBookings();
  const today = getDateString(new Date());
  const filtered = list.filter(b => b.dateStr >= today);
  if (filtered.length !== list.length) {
    saveBookings(filtered);
  }
}

function renderBookings(){
  cleanOldBookings();
  const list = loadBookings();
  const container = document.getElementById("bookingsList");
  if(!list.length){ container.innerHTML = "<div class='muted'>لا توجد حجوزات بعد.</div>"; return; }
  
  // ترتيب حسب التاريخ
  const byDate = {};
  list.forEach(b => { (byDate[b.dateStr] = byDate[b.dateStr]||[]).push(b); });
  
  // ترتيب التواريخ
  const sortedDates = Object.keys(byDate).sort();
  
  let html = "";
  sortedDates.forEach(dateStr => {
    const bookings = byDate[dateStr];
    const dateObj = new Date(dateStr + 'T00:00:00');
    const displayDate = `${bookings[0].dayName} - ${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
    
    html += `<h3 style="margin-top:8px">${displayDate} — ${bookings.length} حجز</h3>`;
    bookings.forEach(b=>{
      html += `<div class="slot"><div><div class="name">${escapeHtml(b.name)}</div><div class="meta">${b.phone}</div></div><div class="meta">${b.id}</div></div>`;
    });
  });
  container.innerHTML = html;
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

document.addEventListener("DOMContentLoaded", ()=>{
  // Show announcement if set
  const ann = loadAnnouncement();
  const announcementEl = document.getElementById("announcement");
  const announcementTextEl = document.getElementById("announcementText");
  if (ann.trim() && announcementEl && announcementTextEl) {
    announcementEl.style.display = "block";
    announcementTextEl.textContent = ann;
  }

  const form = document.getElementById("bookingForm");
  const msg = document.getElementById("message");

  // إنشاء قائمة الأيام في القائمة المنسدلة
  const daySelect = document.getElementById("day");
  if (daySelect) {
    const availableDates = getAvailableDates();
    daySelect.innerHTML = '<option value="">اختر التاريخ</option>';
    availableDates.forEach(date => {
      const current = countForDate(date.dateStr);
      const isFull = current >= DAILY_CAPACITY;
      const option = document.createElement('option');
      option.value = date.dateStr;
      option.textContent = date.displayText + (isFull ? ' (ممتلئ)' : ` (${DAILY_CAPACITY - current} متاح)`);
      option.disabled = isFull;
      daySelect.appendChild(option);
    });
  }

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const dateStr = document.getElementById("day").value;
    const phone = document.getElementById("phone").value.trim();

    if(!name || !dateStr || !phone){
      msg.textContent = "يرجى ملء جميع الحقول.";
      return;
    }

    const current = countForDate(dateStr);
    if(current >= DAILY_CAPACITY){
      msg.textContent = `عذراً، تم امتلاء حجوزات هذا اليوم.`;
      return;
    }

    // الحصول على اسم اليوم
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayName = getArabicDayName(dateObj);

    // إنشاء الحجز
    const id = 'BK' + Date.now().toString().slice(-6);
    const booking = { 
      id, 
      name, 
      dateStr, 
      dayName, 
      phone, 
      createdAt: new Date().toISOString() 
    };
    const list = loadBookings();
    list.push(booking);
    saveBookings(list);

    msg.textContent = `تم الحجز بنجاح — رقم الحجز: ${id}`;
    form.reset();
    
    // تحديث القائمة المنسدلة
    if (daySelect) {
      const availableDates = getAvailableDates();
      daySelect.innerHTML = '<option value="">اختر التاريخ</option>';
      availableDates.forEach(date => {
        const current = countForDate(date.dateStr);
        const isFull = current >= DAILY_CAPACITY;
        const option = document.createElement('option');
        option.value = date.dateStr;
        option.textContent = date.displayText + (isFull ? ' (ممتلئ)' : ` (${DAILY_CAPACITY - current} متاح)`);
        option.disabled = isFull;
        daySelect.appendChild(option);
      });
    }
    
    renderBookings();
  });

  renderBookings();

  // social whatsapp links (example opens chat)
  const waLink = document.getElementById("waLink");
  const waFooter = document.getElementById("whatsappFooter");
  const waSidebar = document.getElementById("waSidebar");
  const phoneForWA = "213555123456"; // ضع رقم الصالون هنا إن أردت
  if (waLink) waLink.href = `https://wa.me/${phoneForWA}`;
  if (waFooter) waFooter.href = `https://wa.me/${phoneForWA}`;
  if (waSidebar) waSidebar.href = `https://wa.me/${phoneForWA}`;

  // Sidebar menu toggle
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  if (menuToggle && sidebar && sidebarOverlay) {
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active");
      sidebar.classList.toggle("active");
      sidebarOverlay.classList.toggle("active");
      document.body.style.overflow = sidebar.classList.contains("active") ? "hidden" : "";
    });

    sidebarOverlay.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      sidebar.classList.remove("active");
      sidebarOverlay.classList.remove("active");
      document.body.style.overflow = "";
    });

    // Close sidebar on navigation
    const sidebarLinks = sidebar.querySelectorAll("a");
    sidebarLinks.forEach(link => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        sidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }
});