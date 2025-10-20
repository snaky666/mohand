// admin.js - Supabase Admin Panel
const ADMIN_PASSWORD = 'admin123'; // ⚠️ غيّر هذا!
const PRICE_PER_BOOKING = 500;

// Supabase Admin Client (يستخدم service role key)
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxaXJqenN6aHhncWVjZGludW90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk2OTQ0OSwiZXhwIjoyMDc2NTQ1NDQ5fQ.hgO_aBKdVkQCNx8mlGF_c34fPPZCewL5xEiRNe_BRig';
const supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

let currentPassword = '';

// تسجيل الدخول
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;

    if (password === ADMIN_PASSWORD) {
        currentPassword = password;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        await loadDashboard();
    } else {
        alert('كلمة مرور خاطئة!');
    }
});

// تسجيل الخروج
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    currentPassword = '';
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('password').value = '';
});

// تحميل لوحة التحكم
async function loadDashboard() {
    await Promise.all([
        loadStatistics(),
        loadBookings(),
        loadAnnouncement()
    ]);
}

// تحميل الإحصائيات
async function loadStatistics() {
    try {
        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select('*');

        if (error) throw error;

        const totalBookings = bookings.length;
        const totalRevenue = totalBookings * PRICE_PER_BOOKING;

        // حساب الحجوزات اليوم
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter(b => b.day === today).length;

        // تحديث الإحصائيات
        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('todayBookings').textContent = todayBookings;
        document.getElementById('totalRevenue').textContent = `${totalRevenue} دج`;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// تحميل الحجوزات
async function loadBookings() {
    try {
        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .order('day', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;

        const tableBody = document.getElementById('bookingsTable');
        tableBody.innerHTML = '';

        if (bookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">لا توجد حجوزات</td></tr>';
            return;
        }

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.name}</td>
                <td>${booking.phone}</td>
                <td>${new Date(booking.day).toLocaleDateString('ar-DZ')}</td>
                <td>${new Date(booking.created_at).toLocaleString('ar-DZ')}</td>
                <td>
                    <button class="delete-btn" onclick="deleteBooking('${booking.id}')">
                        🗑️ حذف
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// حذف حجز
async function deleteBooking(bookingId) {
    if (!confirm('هل أنت متأكد من حذف هذا الحجز؟')) return;

    try {
        const { error } = await supabaseAdmin
            .from('bookings')
            .delete()
            .eq('id', bookingId);

        if (error) throw error;

        alert('تم حذف الحجز بنجاح!');
        await loadDashboard();
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('حدث خطأ أثناء حذف الحجز');
    }
}

// تحميل الإعلان
async function loadAnnouncement() {
    try {
        const { data: announcements, error } = await supabaseAdmin
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (announcements && announcements.length > 0) {
            document.getElementById('announcementText').value = announcements[0].message;
        }
    } catch (error) {
        console.error('Error loading announcement:', error);
    }
}

// حفظ الإعلان
document.getElementById('announcementForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = document.getElementById('announcementText').value.trim();
    if (!message) {
        alert('الرجاء إدخال نص الإعلان');
        return;
    }

    try {
        // الحصول على الإعلان الحالي
        const { data: existing } = await supabaseAdmin
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (existing && existing.length > 0) {
            // تحديث الإعلان الحالي
            const { error } = await supabaseAdmin
                .from('announcements')
                .update({ message })
                .eq('id', existing[0].id);

            if (error) throw error;
        } else {
            // إنشاء إعلان جديد
            const { error } = await supabaseAdmin
                .from('announcements')
                .insert({ message });

            if (error) throw error;
        }

        alert('تم حفظ الإعلان بنجاح!');
    } catch (error) {
        console.error('Error saving announcement:', error);
        alert('حدث خطأ أثناء حفظ الإعلان');
    }
});

// تحديث تلقائي كل دقيقة
setInterval(() => {
    if (currentPassword) {
        loadDashboard();
    }
}, 60000);