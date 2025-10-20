// main.js - Supabase Booking Manager
const TOTAL_DAYS = 15;
const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

let supabase = null;

async function initSupabase() {
  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
    return true;
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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

function getAvailableDates() {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < TOTAL_DAYS; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const capacity = getDailyCapacity(date);

    if (capacity === 0) continue;

    dates.push({
      dateStr: getDateString(date),
      dayName: getArabicDayName(date),
      displayText: `${getArabicDayName(date)} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
      capacity: capacity
    });
  }

  return dates;
}

async function countForDate(dateStr) {
  try {
    const { count, error } = await supabase
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
    const { error } = await supabase
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
  const dates = getAvailableDates();
  const sel = document.getElementById("day");
  sel.innerHTML = '<option value="">اختر التاريخ</option>';

  for (const d of dates) {
    const booked = await countForDate(d.dateStr);
    const available = d.capacity - booked;
    const label = available > 0
      ? `${d.displayText} (متاح: ${available})`
      : `${d.displayText} (ممتلئ)`;
    const opt = document.createElement("option");
    opt.value = d.dateStr;
    opt.textContent = label;
    opt.disabled = available <= 0;
    sel.appendChild(opt);
  }
}

async function showAnnouncement() {
  const msg = await loadAnnouncement();
  const ann = document.getElementById("announcement");
  if (msg) {
    ann.textContent = msg;
    ann.style.display = "block";
  } else {
    ann.style.display = "none";
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

  const dates = getAvailableDates();
  const chosen = dates.find(d => d.dateStr === day);
  if (!chosen) {
    showMessage("التاريخ غير صالح", "error");
    return;
  }

  const booked = await countForDate(day);
  if (booked >= chosen.capacity) {
    showMessage("عذراً، هذا اليوم ممتلئ", "error");
    return;
  }

  try {
    await saveBooking({ name, phone, dateStr: day, dayName: chosen.dayName });
    showMessage("✅ تم الحجز بنجاح! سنتواصل معك قريباً.", "success");
    document.getElementById("bookingForm").reset();
    await populateDaySelect();
    await renderBookings();
  } catch (error) {
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
  const initialized = await initSupabase();
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
