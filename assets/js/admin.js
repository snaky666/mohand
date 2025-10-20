
// admin.js - لوحة تحكم محسّنة
const STORAGE_KEY = "barber_bookings_v1";
const ANN_KEY = "barber_announcement_v1";
const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function loadBookings(){ 
  try{ 
    return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); 
  }catch(e){
    return [];
  }
}

function saveBookings(list){ 
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); 
}

function loadAnnouncement(){ 
  return localStorage.getItem(ANN_KEY) || ""; 
}

function saveAnnouncement(t){ 
  localStorage.setItem(ANN_KEY, t); 
}

function escapeHtml(s){ 
  return String(s).replace(/[&<>"']/g, m=>({ 
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;' 
  }[m])); 
}

// دالة لحساب الإحصاءات
function calculateStats() {
  const list = loadBookings();
  const today = getDateString(new Date());
  
  // إجمالي الحجوزات
  const total = list.length;
  
  // حجوزات اليوم
  const todayCount = list.filter(b => b.dateStr === today).length;
  
  // أكثر يوم طلباً
  const dayCount = {};
  list.forEach(b => {
    dayCount[b.dateStr] = (dayCount[b.dateStr] || 0) + 1;
  });
  
  let busiestDay = "—";
  let maxCount = 0;
  Object.entries(dayCount).forEach(([dateStr, count]) => {
    if (count > maxCount) {
      maxCount = count;
      const dateObj = new Date(dateStr + 'T00:00:00');
      busiestDay = DAYS_AR[dateObj.getDay()];
    }
  });
  
  return { total, todayCount, busiestDay };
}

// دالة لتحديث الإحصاءات في الواجهة
function updateStats() {
  const stats = calculateStats();
  document.getElementById("totalBookings").textContent = stats.total;
  document.getElementById("todayBookings").textContent = stats.todayCount;
  document.getElementById("busiestDay").textContent = stats.busiestDay;
}

// دالة لتعبئة خيارات التصفية
function populateFilterOptions() {
  const list = loadBookings();
  const dates = new Set();
  
  list.forEach(b => dates.add(b.dateStr));
  
  const sortedDates = Array.from(dates).sort();
  const filterSelect = document.getElementById("dayFilter");
  
  filterSelect.innerHTML = '<option value="all">جميع الأيام</option>';
  
  sortedDates.forEach(dateStr => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayName = DAYS_AR[dateObj.getDay()];
    const displayDate = `${dayName} - ${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
    const option = document.createElement('option');
    option.value = dateStr;
    option.textContent = displayDate;
    filterSelect.appendChild(option);
  });
}

// دالة لعرض الحجوزات مع التصفية
function renderAdmin(filterDate = 'all'){
  const list = loadBookings();
  const container = document.getElementById("adminList");
  
  if(!list.length){ 
    container.innerHTML = "<div class='muted'>لا توجد حجوزات.</div>"; 
    return; 
  }
  
  // تطبيق التصفية
  let filteredList = list;
  if (filterDate !== 'all') {
    filteredList = list.filter(b => b.dateStr === filterDate);
  }
  
  if(!filteredList.length){ 
    container.innerHTML = "<div class='muted'>لا توجد حجوزات لهذا اليوم.</div>"; 
    return; 
  }
  
  // ترتيب حسب التاريخ
  const sortedList = [...filteredList].sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  
  // تجميع حسب التاريخ
  const byDate = {};
  sortedList.forEach(b => {
    (byDate[b.dateStr] = byDate[b.dateStr] || []).push(b);
  });
  
  let html = "<div class='list'>";
  
  Object.entries(byDate).forEach(([dateStr, bookings]) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayName = DAYS_AR[dateObj.getDay()];
    const displayDate = `${dayName} - ${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
    
    html += `<h3>${displayDate} — ${bookings.length} حجز</h3>`;
    
    bookings.forEach(b => {
      const waLink = `https://wa.me/${b.phone.replace(/\D/g, '')}?text=مرحباً ${escapeHtml(b.name)}، هذا تذكير بموعدك يوم ${dayName}`;
      
      html += `
        <div class="slot">
          <div>
            <div class="name">${escapeHtml(b.name)}</div>
            <div class="meta">${b.phone} • ${b.id}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="${waLink}" target="_blank" class="btn ghost" style="padding: 8px 12px; margin: 0;">📱 واتساب</a>
            <button class="btn" data-id="${b.id}" style="padding: 8px 16px; margin: 0;">حذف</button>
          </div>
        </div>
      `;
    });
  });
  
  html += "</div>";
  container.innerHTML = html;
  
  // ربط أزرار الحذف
  container.querySelectorAll("button[data-id]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      if(!confirm("هل تريد حذف هذا الحجز؟")) return;
      const cur = loadBookings();
      const filtered = cur.filter(b => b.id !== id);
      saveBookings(filtered);
      renderAdmin(document.getElementById("dayFilter").value);
      updateStats();
      populateFilterOptions();
    });
  });
}

// دالة للتصدير
function exportBookings() {
  const list = loadBookings();
  if (!list.length) {
    alert("لا توجد حجوزات للتصدير");
    return;
  }
  
  const dataStr = JSON.stringify(list, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bookings_${getDateString(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  alert("تم تصدير الحجوزات بنجاح");
}

function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", ()=>{
  // التحقق من كلمة المرور
  const correct = "admin123";
  const pw = prompt("أدخل كلمة مرور المدير:");
  if(pw !== correct){
    alert("كلمة المرور خاطئة. سيتم توجيهك إلى الصفحة الرئيسية.");
    window.location.href = "index.html";
    return;
  }

  // تحميل الإعلان
  const annInput = document.getElementById("announcementInput");
  annInput.value = loadAnnouncement();
  
  // حفظ الإعلان
  document.getElementById("saveAnn").addEventListener("click", ()=>{
    saveAnnouncement(annInput.value.trim());
    alert("تم نشر الإعلان.");
  });
  
  // مسح الإعلان
  document.getElementById("clearAnn").addEventListener("click", ()=>{
    annInput.value = "";
    saveAnnouncement("");
    alert("تم إزالة الإعلان.");
  });

  // التصفية
  document.getElementById("dayFilter").addEventListener("change", (e) => {
    renderAdmin(e.target.value);
  });

  // التصدير
  document.getElementById("exportBtn").addEventListener("click", exportBookings);

  // التحديث
  document.getElementById("refreshBtn").addEventListener("click", () => {
    renderAdmin(document.getElementById("dayFilter").value);
    updateStats();
    populateFilterOptions();
  });

  // التحميل الأولي
  updateStats();
  populateFilterOptions();
  renderAdmin();
});
