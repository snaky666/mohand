// admin.js - Supabase Admin Panel with Secure Server-Side Operations
let supabase = null;
let adminPassword = null;

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

async function loadBookings() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('day', { ascending: true });
    
    if (error) throw error;
    
    return data.map(booking => ({
      id: booking.id,
      idShort: booking.id.substring(0, 8),
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

async function deleteBooking(id) {
  if (!adminPassword) {
    throw new Error('No admin password stored');
  }
  
  try {
    const response = await fetch('/api/admin/delete-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, password: adminPassword })
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete booking');
    }
    
    return true;
  } catch (e) {
    console.error('Error deleting booking:', e);
    throw e;
  }
}

async function loadAnnouncement() {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || { id: null, message: "" };
  } catch (e) {
    console.error('Error loading announcement:', e);
    return { id: null, message: "" };
  }
}

async function saveAnnouncement(text) {
  if (!adminPassword) {
    throw new Error('No admin password stored');
  }
  
  try {
    const response = await fetch('/api/admin/update-announcement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: text, password: adminPassword })
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update announcement');
    }
    
    return true;
  } catch (e) {
    console.error('Error saving announcement:', e);
    throw e;
  }
}

function getArabicDayName(date) {
  const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  return DAYS_AR[date.getDay()];
}

async function calculateStats() {
  const list = await loadBookings();
  const PRICE_PER_BOOKING = 500;
  
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
    
    if (b.dateStr === todayStr) {
      todayCount++;
    }
    
    if (bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear) {
      monthlyCount++;
    }
    
    if (bookingDate.getFullYear() === currentYear) {
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

async function updateStats() {
  const stats = await calculateStats();
  document.getElementById("totalBookings").textContent = stats.total;
  document.getElementById("todayBookings").textContent = stats.today;
  document.getElementById("monthlyIncome").textContent = stats.monthlyIncome.toLocaleString('ar-DZ') + " دج";
  document.getElementById("yearlyIncome").textContent = stats.yearlyIncome.toLocaleString('ar-DZ') + " دج";
}

async function renderAdmin() {
  const list = await loadBookings();
  const container = document.getElementById("adminList");
  
  await updateStats();
  
  if (!list.length) {
    container.innerHTML = "<div class='muted'>لا توجد حجوزات.</div>";
    return;
  }
  
  const sortedList = [...list].sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  
  let html = "<div class='list'>";
  sortedList.forEach((b) => {
    const dateObj = new Date(b.dateStr + 'T00:00:00');
    const displayDate = `${b.dayName} - ${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
    
    html += `<div class="slot"><div><div class="name">${escapeHtml(b.name)}</div><div class="meta">${displayDate} • ${b.phone}</div></div><div><button class="btn" data-id="${b.id}">حذف</button></div></div>`;
  });
  html += "</div>";
  container.innerHTML = html;
  
  container.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("هل تريد حذف هذا الحجز؟")) return;
      
      try {
        await deleteBooking(id);
        await renderAdmin();
      } catch (error) {
        alert("حدث خطأ أثناء الحذف: " + error.message);
      }
    });
  });
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

async function initAdmin() {
  const initialized = await initSupabase();
  if (!initialized) {
    alert("فشل الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً.");
    return;
  }

  const pw = prompt("أدخل كلمة مرور المدير:");
  if (!pw || pw.trim() === '') {
    alert("كلمة المرور مطلوبة. سيتم توجيهك إلى الصفحة الرئيسية.");
    window.location.href = "index.html";
    return;
  }

  adminPassword = pw;

  const announcement = await loadAnnouncement();
  const annInput = document.getElementById("announcementInput");
  annInput.value = announcement.message;

  document.getElementById("saveAnn").addEventListener("click", async () => {
    try {
      await saveAnnouncement(annInput.value.trim());
      alert("تم نشر الإعلان.");
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        alert("كلمة المرور خاطئة!");
        adminPassword = null;
        window.location.href = "admin.html";
      } else {
        alert("حدث خطأ أثناء النشر: " + error.message);
      }
    }
  });

  document.getElementById("clearAnn").addEventListener("click", async () => {
    annInput.value = "";
    try {
      await saveAnnouncement("");
      alert("تم إزالة الإعلان.");
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        alert("كلمة المرور خاطئة!");
        adminPassword = null;
        window.location.href = "admin.html";
      } else {
        alert("حدث خطأ: " + error.message);
      }
    }
  });

  await renderAdmin();
}

document.addEventListener("DOMContentLoaded", initAdmin);
