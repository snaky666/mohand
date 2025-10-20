// admin.js - تحكم بسيط (client-side)
const STORAGE_KEY = "barber_bookings_v1";
const ANN_KEY = "barber_announcement_v1";

function loadBookings(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); }catch(e){return [];}}
function saveBookings(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
function loadAnnouncement(){ return localStorage.getItem(ANN_KEY) || ""; }
function saveAnnouncement(t){ localStorage.setItem(ANN_KEY, t); }

function calculateStats(){
  const list = loadBookings();
  const PRICE_PER_BOOKING = 500; // سعر الحلاقة الواحدة (يمكن تعديله)
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let todayCount = 0;
  let monthlyCount = 0;
  let yearlyCount = 0;
  
  list.forEach(b => {
    const bookingDate = new Date(b.dateStr + 'T00:00:00');
    
    // حجوزات اليوم
    if(b.dateStr === todayStr){
      todayCount++;
    }
    
    // حجوزات الشهر
    if(bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear){
      monthlyCount++;
    }
    
    // حجوزات السنة
    if(bookingDate.getFullYear() === currentYear){
      yearlyCount++;
    }
  });
  
  return {
    total: list.length,
    today: todayCount,
    monthlyIncome: monthlyCount * PRICE_PER_BOOKING,
    yearlyIncome: yearlyCount * PRICE_PER_BOOKING
  };
}

function updateStats(){
  const stats = calculateStats();
  document.getElementById("totalBookings").textContent = stats.total;
  document.getElementById("todayBookings").textContent = stats.today;
  document.getElementById("monthlyIncome").textContent = stats.monthlyIncome.toLocaleString('ar-DZ') + " دج";
  document.getElementById("yearlyIncome").textContent = stats.yearlyIncome.toLocaleString('ar-DZ') + " دج";
}

function renderAdmin(){
  const list = loadBookings();
  const container = document.getElementById("adminList");
  
  // تحديث الإحصائيات
  updateStats();
  
  if(!list.length){ container.innerHTML = "<div class='muted'>لا توجد حجوزات.</div>"; return; }
  
  // ترتيب حسب التاريخ
  const sortedList = [...list].sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  
  let html = "<div class='list'>";
  sortedList.forEach((b, idx)=>{
    const dateObj = new Date(b.dateStr + 'T00:00:00');
    const displayDate = `${b.dayName} - ${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
    
    html += `<div class="slot"><div><div class="name">${escapeHtml(b.name)}</div><div class="meta">${displayDate} • ${b.phone}</div></div><div><button class="btn" data-id="${b.id}">حذف</button></div></div>`;
  });
  html += "</div>";
  container.innerHTML = html;
  
  // attach delete
  container.querySelectorAll("button[data-id]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      if(!confirm("هل تريد حذف هذا الحجز؟")) return;
      const cur = loadBookings();
      const filtered = cur.filter(b => b.id !== id);
      saveBookings(filtered);
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
