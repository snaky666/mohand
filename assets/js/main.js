// main.js - Supabase Booking System
const TOTAL_DAYS = 15;
const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// استخدام إعدادات Supabase من ملف supabase-config.js
let supabaseClient = null;

function initSupabase() {
  try {
    // استخدام الإعدادات من supabase-config.js
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return false;
  }
}

function getDailyCapacity(date) {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 3) {
    return 0;
  } else if (dayOfWeek === 5 || dayOfWeek === 6) {
    return 5;
  } else if (dayOfWeek === 0 || dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4) {
    return 3;
  }
  return 0;
}

async function loadBookings() {
  try {
    const { data, error } = await supabaseClient
      .from('bookings')
      .select('*')
      .order('day', { ascending: true });

    if (error) throw error;

    return data.map(booking => ({
      id: booking.id.substring(0, 8),
      name: booking.name,
      phone: booking.phone,
      dateStr: booking.day,
      dayName: getArabicDayName(new Date(booking.day + 'T00:00:00'))
    }));
  } catch (e) {
    console.error('Error loading bookings:', e);
    return [];
  }
}

async function saveBooking(booking) {
  try {
    const { data, error } = await supabaseClient
      .from('bookings')
      .insert([{
        name: booking.name,
        phone: booking.phone,
        day: booking.dateStr
      }])
      .select();

    if (error) throw error;
    return data[0];
  } catch (e) {
    console.error('Error saving booking:', e);
    throw e;
  }
}

async function loadAnnouncement() {
  try {
    const { data, error } = await supabaseClient
      .from('announcements')
      .select('message')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data?.message || "";
  } catch (e) {
    console.error('Error loading announcement:', e);
    return "";
  }
}

function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getArabicDayName(date) {
  return DAYS_AR[date.getDay()];
}

// تخزين مؤقت للبيانات
let cachedDates = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 ثانية

async function getAvailableDates(forceRefresh = false) {
  // استخدام البيانات المخزنة مؤقتاً إذا كانت حديثة
  const now = Date.now();
  if (!forceRefresh && cachedDates && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedDates;
  }

  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // جلب جميع الحجوزات مرة واحدة بدلاً من استدعاءات متعددة
  let allBookings = [];
  try {
    const data = await loadBookings();
    allBookings = data;
  } catch (e) {
    console.error('Error loading bookings for dates:', e);
  }

  // حساب عدد الحجوزات لكل يوم
  const bookingsByDate = {};
  allBookings.forEach(booking => {
    bookingsByDate[booking.dateStr] = (bookingsByDate[booking.dateStr] || 0) + 1;
  });

  let daysAdded = 0;
  let offset = 0;
  const MAX_SEARCH_DAYS = 60;

  while (daysAdded < TOTAL_DAYS && offset < MAX_SEARCH_DAYS) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const capacity = getDailyCapacity(date);

    if (capacity > 0) {
      const dateStr = getDateString(date);
      const booked = bookingsByDate[dateStr] || 0;
      const available = capacity - booked;

      if (available > 0) {
        dates.push({
          dateStr: dateStr,
          dayName: getArabicDayName(date),
          displayText: `${getArabicDayName(date)} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
          capacity: capacity,
          available: available
        });
        daysAdded++;
      }
    }
    
    offset++;
  }

  // تخزين النتائج
  cachedDates = dates;
  cacheTimestamp = now;

  return dates;
}

async function countForDate(dateStr) {
  try {
    const { count, error } = await supabaseClient
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('day', dateStr);

    if (error) throw error;
    return count || 0;
  } catch (e) {
    console.error('Error counting bookings:', e);
    return 0;
  }
}

async function cleanOldBookings() {
  try {
    const today = getDateString(new Date());
    const { error } = await supabaseClient
      .from('bookings')
      .delete()
      .lt('day', today);

    if (error) throw error;
  } catch (e) {
    console.error('Error cleaning old bookings:', e);
  }
}

async function renderBookings() {
  await cleanOldBookings();
  const list = await loadBookings();
  const container = document.getElementById("bookingsList");
  if (!list.length) {
    container.innerHTML = "<div class='muted'>لا توجد حجوزات بعد.</div>";
    return;
  }

  const byDate = {};
  list.forEach(b => {
    (byDate[b.dateStr] = byDate[b.dateStr] || []).push(b);
  });

  const sortedDates = Object.keys(byDate).sort();

  let html = "";
  sortedDates.forEach(dateStr => {
    const bookings = byDate[dateStr];
    const dateObj = new Date(dateStr + 'T00:00:00');
    const displayDate = `${bookings[0].dayName} - ${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

    html += `<h3 style="margin-top:8px">${displayDate} — ${bookings.length} حجز</h3>`;
    bookings.forEach(b => {
      html += `<div class="slot"><div><div class="name">${escapeHtml(b.name)}</div><div class="meta">${b.phone}</div></div><div class="meta">${b.id}</div></div>`;
    });
  });
  container.innerHTML = html;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

async function populateDaySelect() {
  const dates = await getAvailableDates();
  const sel = document.getElementById("day");
  sel.innerHTML = '<option value="">اختر التاريخ</option>';

  for (const d of dates) {
    const label = `${d.displayText} (متاح: ${d.available})`;
    const opt = document.createElement("option");
    opt.value = d.dateStr;
    opt.textContent = label;
    sel.appendChild(opt);
  }
}

async function showAnnouncement() {
  const msg = await loadAnnouncement();
  const ann = document.getElementById("announcement");
  const homeAnn = document.getElementById("homeAnnouncement");
  const homeAnnText = document.getElementById("homeAnnouncementText");
  
  if (msg) {
    // عرض الإعلان في المكانين
    if (ann) {
      ann.textContent = msg;
      ann.style.display = "block";
    }
    if (homeAnn && homeAnnText) {
      homeAnnText.textContent = msg;
      homeAnn.style.display = "block";
    }
  } else {
    if (ann) ann.style.display = "none";
    if (homeAnn) homeAnn.style.display = "none";
  }
}

async function handleBookingSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const day = document.getElementById("day").value;
  const phone = document.getElementById("phone").value.trim();

  if (!name || !day || !phone) {
    showMessage("الرجاء ملء جميع الحقول", "error");
    return;
  }

  // استخدام البيانات المخزنة مؤقتاً للتحقق السريع
  const dates = await getAvailableDates(false);
  const chosen = dates.find(d => d.dateStr === day);
  if (!chosen) {
    showMessage("التاريخ غير صالح", "error");
    return;
  }

  try {
    // التحقق النهائي من التوافر قبل الحفظ
    const currentBooked = await countForDate(day);
    const dateObj = new Date(day + 'T00:00:00');
    const capacity = getDailyCapacity(dateObj);
    
    if (currentBooked >= capacity) {
      showMessage("عذراً، هذا اليوم ممتلئ", "error");
      await populateDaySelect(); // تحديث القائمة
      return;
    }

    await saveBooking({ name, phone, dateStr: day, dayName: chosen.dayName });
    showMessage("✅ تم الحجز بنجاح! سنتواصل معك قريباً.", "success");
    document.getElementById("bookingForm").reset();
    
    // إعادة تحميل البيانات
    cachedDates = null; // مسح الذاكرة المؤقتة
    await populateDaySelect();
    await renderBookings();
  } catch (error) {
    console.error('Booking error:', error);
    showMessage("حدث خطأ أثناء الحجز. حاول مرة أخرى.", "error");
  }
}

function showMessage(text, type) {
  const msg = document.getElementById("message");
  msg.textContent = text;
  msg.style.display = "block";
  msg.style.background = type === "error" ? "rgba(255,123,123,0.2)" : "rgba(167,139,250,0.15)";
  msg.style.borderColor = type === "error" ? "rgba(255,123,123,0.5)" : "rgba(167,139,250,0.4)";
}

function setupWhatsAppLinks() {
  const phoneNumber = "213557364841";
  const message = encodeURIComponent("مرحباً، أريد حجز موعد في صالون ⵎⵓⵃⵎⵎⴷ barber");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  const waLink = document.getElementById("waLink");
  const waSidebar = document.getElementById("waSidebar");
  const waFooter = document.getElementById("whatsappFooter");

  if (waLink) waLink.href = whatsappUrl;
  if (waSidebar) waSidebar.href = whatsappUrl;
  if (waFooter) waFooter.href = whatsappUrl;
}

function setupSidebar() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    menuToggle.classList.remove("active");
  }

  function openSidebar() {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    menuToggle.classList.add("active");
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (sidebar.classList.contains("active")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  const sidebarLinks = document.querySelectorAll(".sidebar-nav a");
  sidebarLinks.forEach(link => {
    link.addEventListener("click", closeSidebar);
  });
}

async function initApp() {
  const initialized = initSupabase();
  if (!initialized) {
    showMessage("فشل الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً.", "error");
    return;
  }

  setupWhatsAppLinks();
  setupSidebar();
  await showAnnouncement();
  await populateDaySelect();
  await renderBookings();

  const form = document.getElementById("bookingForm");
  if (form) {
    form.addEventListener("submit", handleBookingSubmit);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}