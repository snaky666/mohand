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
    const tableBody = document.getElementById('bookingsTable');
    
    try {
        if (!supabaseAdmin) {
            throw new Error('Supabase admin client not initialized');
        }

        tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">جارٍ التحميل...</td></tr>';

        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .order('day', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Supabase error details:', error);
            throw new Error(error.message || 'فشل تحميل الحجوزات');
        }

        console.log('✅ Loaded bookings:', bookings?.length || 0);

        if (!tableBody) {
            console.error('❌ Table body element not found');
            return;
        }

        tableBody.innerHTML = '';

        if (!bookings || bookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">لا توجد حجوزات</td></tr>';
            return;
        }

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            const bookingDate = new Date(booking.day + 'T00:00:00');
            const createdDate = new Date(booking.created_at);
            
            row.innerHTML = `
                <td>${escapeHtml(booking.name)}</td>
                <td>${escapeHtml(booking.phone)}</td>
                <td>${bookingDate.getDate()}/${bookingDate.getMonth() + 1}/${bookingDate.getFullYear()}</td>
                <td>${createdDate.getDate()}/${createdDate.getMonth() + 1}/${createdDate.getFullYear()} ${createdDate.getHours()}:${String(createdDate.getMinutes()).padStart(2, '0')}</td>
                <td>
                    <button class="delete-btn" onclick="deleteBooking('${booking.id}')">
                        🗑️ حذف
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('❌ Error loading bookings:', error);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="5" class="empty-state" style="color: #ff7b7b;">خطأ في تحميل الحجوزات: ${error.message}</td></tr>`;
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// حذف حجز
async function deleteBooking(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
        return;
    }

    const password = prompt('أدخل كلمة مرور الإدارة:');
    if (!password || password !== ADMIN_PASSWORD) {
        showMessage('كلمة مرور خاطئة!', 'error');
        return;
    }

    try {
        const { error } = await supabaseAdmin
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showMessage('تم حذف الحجز بنجاح!', 'success');
        loadBookings();
        loadStatistics();
    } catch (error) {
        console.error('Error deleting booking:', error);
        showMessage('خطأ في حذف الحجز: ' + error.message, 'error');
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

// Helper function to display messages
function showMessage(msg, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = msg;
    messageElement.className = type; // 'success' or 'error'
    messageElement.style.display = 'block';
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
}