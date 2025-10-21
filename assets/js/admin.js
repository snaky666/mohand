const PRICE_PER_BOOKING = 500;
let currentPassword = '';

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            currentPassword = password;
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('logoutBtn').style.display = 'block';
            await loadDashboard();
        } else {
            alert('كلمة مرور خاطئة!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('حدث خطأ أثناء تسجيل الدخول');
    }
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    currentPassword = '';
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('password').value = '';
});

async function loadDashboard() {
    console.log('🔄 Loading admin dashboard...');
    try {
        if (!supabase) {
            console.error('❌ Supabase not initialized');
            alert('خطأ في الاتصال بقاعدة البيانات. يرجى تحديث الصفحة.');
            return;
        }
        
        await Promise.all([
            loadStatistics(),
            loadBookings(),
            loadAnnouncement()
        ]);
        console.log('✅ Dashboard loaded successfully');
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        alert('حدث خطأ أثناء تحميل لوحة التحكم: ' + error.message);
    }
}

async function loadStatistics() {
    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*');

        if (error) throw error;

        const totalBookings = bookings.length;
        const totalRevenue = totalBookings * PRICE_PER_BOOKING;

        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter(b => b.day === today).length;

        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('todayBookings').textContent = todayBookings;
        document.getElementById('totalRevenue').textContent = `${totalRevenue} دج`;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function loadBookings() {
    const tableBody = document.getElementById('bookingsTable');
    
    try {
        if (!supabase) {
            console.error('❌ Supabase not initialized');
            throw new Error('Supabase not initialized');
        }

        if (!tableBody) {
            console.error('❌ Table body element not found');
            return;
        }

        tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">جارٍ التحميل...</td></tr>';

        console.log('🔄 Fetching bookings from Supabase...');
        
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .order('day', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Supabase error details:', error);
            throw new Error(error.message || 'فشل تحميل الحجوزات');
        }

        console.log('✅ Loaded bookings:', bookings?.length || 0);

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

async function deleteBooking(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
        return;
    }

    try {
        const response = await fetch('/api/admin/delete-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password: currentPassword })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert('تم حذف الحجز بنجاح!');
            loadBookings();
            loadStatistics();
        } else {
            alert('فشل حذف الحجز: ' + (result.error || 'خطأ غير معروف'));
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('خطأ في حذف الحجز: ' + error.message);
    }
}

async function loadAnnouncement() {
    try {
        const { data: announcements, error } = await supabase
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

document.getElementById('announcementForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = document.getElementById('announcementText').value.trim();
    if (!message) {
        alert('الرجاء إدخال نص الإعلان');
        return;
    }

    try {
        const response = await fetch('/api/admin/update-announcement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, password: currentPassword })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert('تم حفظ الإعلان بنجاح!');
        } else {
            alert('فشل حفظ الإعلان: ' + (result.error || 'خطأ غير معروف'));
        }
    } catch (error) {
        console.error('Error saving announcement:', error);
        alert('حدث خطأ أثناء حفظ الإعلان');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Admin page loaded - login required');
    
    if (!supabase) {
        console.error('❌ Supabase library not loaded');
        alert('خطأ في تحميل المكتبات المطلوبة. يرجى تحديث الصفحة.');
        return;
    }
    
    console.log('✅ Admin page initialized - please login');
});

setInterval(() => {
    if (currentPassword) {
        loadDashboard();
    }
}, 60000);
