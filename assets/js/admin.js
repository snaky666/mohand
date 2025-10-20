// admin.js - Supabase Admin Panel
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
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error deleting booking:', e);
    return false;
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
  try {
    const announcement = await loadAnnouncement();
    
    if (announcement.id) {
      const { error } = await supabase
        .from('announcements')
        .update({ message: text })
        .eq('id', announcement.id);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('announcements')
        .insert([{ message: text }]);
      
      if (error) throw error;
    }
    return true;
  } catch (e) {
    console.error('Error saving announcement:', e);
    return false;
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
      
      const success = await deleteBooking(id);
      if (success) {
        await renderAdmin();
      } else {
        alert("حدث خطأ أثناء الحذف. حاول مرة أخرى.");
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

  const correct = "admin123";
  const pw = prompt("أدخل كلمة مرور المدير:");
  if (pw !== correct) {
    alert("كلمة المرور خاطئة. سيتم توجيهك إلى الصفحة الرئيسية.");
    window.location.href = "index.html";
    return;
  }

  const announcement = await loadAnnouncement();
  const annInput = document.getElementById("announcementInput");
  annInput.value = announcement.message;

  document.getElementById("saveAnn").addEventListener("click", async () => {
    const success = await saveAnnouncement(annInput.value.trim());
    if (success) {
      alert("تم نشر الإعلان.");
    } else {
      alert("حدث خطأ أثناء النشر. حاول مرة أخرى.");
    }
  });

  document.getElementById("clearAnn").addEventListener("click", async () => {
    annInput.value = "";
    const success = await saveAnnouncement("");
    if (success) {
      alert("تم إزالة الإعلان.");
    } else {
      alert("حدث خطأ. حاول مرة أخرى.");
    }
  });

  await renderAdmin();
}

document.addEventListener("DOMContentLoaded", initAdmin);
