const PRICE_PER_BOOKING = 500;
let currentPassword = '';

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;

    // التحقق من كلمة المرور (للاستخدام على GitHub Pages)
    // ⚠️ ملاحظة: هذا غير آمن تماماً - يجب استخدام خادم حقيقي للأمان الكامل
    const ADMIN_PASSWORD = 'mohand2004'; // غيّر هذا إلى كلمة مرور قوية
    
    if (password === ADMIN_PASSWORD) {
        currentPassword = password;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'block';
        await loadDashboard();
    } else {
        alert('كلمة مرور خاطئة!');
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
            loadDaySettings(),
            loadBookings()
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
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) throw error;

        alert('تم حذف الحجز بنجاح!');
        loadBookings();
        loadStatistics();
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('خطأ في حذف الحجز: ' + error.message);
    }
}

// ========================================
// إدارة إعدادات الأيام
// ========================================

async function loadDaySettings() {
    const tableBody = document.getElementById('daySettingsTable');
    
    try {
        if (!supabase) {
            console.error('❌ Supabase not initialized');
            throw new Error('Supabase not initialized');
        }

        if (!tableBody) {
            console.error('❌ Day settings table not found');
            return;
        }

        tableBody.innerHTML = '<tr><td colspan="4" class="empty-state">جارٍ التحميل...</td></tr>';

        console.log('🔄 Fetching day settings from Supabase...');
        
        const { data: daySettings, error } = await supabase
            .from('day_settings')
            .select('*')
            .order('day_of_week', { ascending: true });

        if (error) {
            console.error('❌ Supabase error details:', error);
            throw new Error(error.message || 'فشل تحميل إعدادات الأيام');
        }

        console.log('✅ Loaded day settings:', daySettings?.length || 0);

        tableBody.innerHTML = '';

        if (!daySettings || daySettings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="empty-state">لا توجد إعدادات. يرجى تشغيل ملف SQL الخاص بالإعداد.</td></tr>';
            return;
        }

        daySettings.forEach(setting => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            
            const statusBadge = setting.is_active 
                ? '<span style="background: rgba(76, 175, 80, 0.2); color: #4caf50; padding: 4px 12px; border-radius: 12px; font-size: 14px;">مفتوح</span>'
                : '<span style="background: rgba(244, 67, 54, 0.2); color: #f44336; padding: 4px 12px; border-radius: 12px; font-size: 14px;">مغلق</span>';
            
            row.innerHTML = `
                <td style="padding: 12px;">${escapeHtml(setting.day_name_ar)}</td>
                <td style="padding: 12px;">
                    <input 
                        type="number" 
                        id="capacity_${setting.day_of_week}" 
                        value="${setting.capacity}" 
                        min="0" 
                        max="50"
                        style="width: 80px; padding: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: white; text-align: center;"
                    />
                </td>
                <td style="padding: 12px;">${statusBadge}</td>
                <td style="padding: 12px;">
                    <button 
                        class="btn" 
                        style="padding: 6px 12px; font-size: 14px; margin-left: 8px;"
                        onclick="updateDaySetting('${setting.id}', ${setting.day_of_week}, ${!setting.is_active})"
                    >
                        ${setting.is_active ? '🔒 إغلاق' : '🔓 فتح'}
                    </button>
                    <button 
                        class="btn" 
                        style="padding: 6px 12px; font-size: 14px; background: rgba(76, 175, 80, 0.8);"
                        onclick="saveCapacity('${setting.id}', ${setting.day_of_week})"
                    >
                        💾 حفظ السعة
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('❌ Error loading day settings:', error);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="4" class="empty-state" style="color: #ff7b7b;">خطأ في تحميل إعدادات الأيام: ${error.message}</td></tr>`;
        }
    }
}

async function updateDaySetting(id, dayOfWeek, newActiveState) {
    try {
        console.log(`🔄 Updating day ${dayOfWeek} to ${newActiveState ? 'active' : 'inactive'}`);
        
        const { error } = await supabase
            .from('day_settings')
            .update({ is_active: newActiveState })
            .eq('id', id);

        if (error) throw error;

        alert(`تم ${newActiveState ? 'فتح' : 'إغلاق'} اليوم بنجاح!`);
        loadDaySettings();
    } catch (error) {
        console.error('Error updating day setting:', error);
        alert('خطأ في تحديث إعدادات اليوم: ' + error.message);
    }
}

async function saveCapacity(id, dayOfWeek) {
    try {
        const capacityInput = document.getElementById(`capacity_${dayOfWeek}`);
        const newCapacity = parseInt(capacityInput.value);

        if (isNaN(newCapacity) || newCapacity < 0) {
            alert('الرجاء إدخال رقم صحيح (0 أو أكثر)');
            return;
        }

        console.log(`💾 Saving capacity ${newCapacity} for day ${dayOfWeek}`);
        
        const { error } = await supabase
            .from('day_settings')
            .update({ capacity: newCapacity })
            .eq('id', id);

        if (error) throw error;

        alert('تم حفظ السعة بنجاح!');
        loadDaySettings();
    } catch (error) {
        console.error('Error saving capacity:', error);
        alert('خطأ في حفظ السعة: ' + error.message);
    }
}

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
