document.addEventListener('DOMContentLoaded', () => {
    // Navigate between sections
    const btnHome = document.getElementById('btn-home');
    const btnStatus = document.getElementById('btn-status');
    const sectionDashboard = document.getElementById('dashboard-section');
    const sectionStatus = document.getElementById('status-section');

    function switchSection(activeStartBtn, activeEndBtn, showSection, hideSection) {
        activeStartBtn.classList.remove('active');
        activeEndBtn.classList.add('active');
        hideSection.classList.remove('active-section');
        showSection.classList.add('active-section');
    }

    btnHome.addEventListener('click', () => {
        if (!btnHome.classList.contains('active')) {
            sectionStatus.classList.remove('active-section');
            sectionDashboard.classList.add('active-section');
            btnStatus.classList.remove('active');
            btnHome.classList.add('active');
        }
    });

    btnStatus.addEventListener('click', () => {
        if (!btnStatus.classList.contains('active')) {
            sectionDashboard.classList.remove('active-section');
            sectionStatus.classList.add('active-section');
            btnHome.classList.remove('active');
            btnStatus.classList.add('active');
        }
    });

    // Check Backend on Load
    // We do a quick check to see if backend is ready
    const healthDot = document.getElementById('health-dot');
    const healthText = document.getElementById('health-text');
    
    // User Management Logic
    const userForm = document.getElementById('user-form');
    const userListBody = document.getElementById('user-list-body');
    const refreshBtn = document.getElementById('refresh-btn');

    // Fetch users function
    async function fetchUsers() {
        // Show loading state
        userListBody.innerHTML = '<tr class="loading-row"><td colspan="4">Loading users...</td></tr>';
        
        try {
            const response = await fetch('/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            
            const users = await response.json();
            renderUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            userListBody.innerHTML = `
                <tr class="loading-row">
                    <td colspan="4" style="color: #ef4444;">Could not load users. Is the backend running?</td>
                </tr>
            `;
            showToast('Error loading users', 'error');
        }
    }

    function renderUsers(users) {
        userListBody.innerHTML = '';
        if (users.length === 0) {
            userListBody.innerHTML = '<tr class="loading-row"><td colspan="4">No users found. Create one!</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${user.id || '-'}</td>
                <td>
                    <div style="font-weight: 500;">${escapeHtml(user.name)}</div>
                </td>
                <td>${escapeHtml(user.email)}</td>
                <td><span class="badge badge-active">Active</span></td>
            `;
            userListBody.appendChild(row);
        });
    }

    // Add User
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const submitBtn = userForm.querySelector('button[type="submit"]');

        const userData = {
            name: nameInput.value,
            email: emailInput.value
        };

        // Loading state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Creating...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) throw new Error('Failed to create user');

            const newUser = await response.json();
            
            showToast(`User ${newUser.name} created!`, 'success');
            
            // Clear form
            nameInput.value = '';
            emailInput.value = '';
            
            // Refresh list
            fetchUsers();

        } catch (error) {
            console.error(error);
            showToast('Failed to create user', 'error');
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    refreshBtn.addEventListener('click', fetchUsers);

    // Initial Load
    fetchUsers();


    // System Check Logic
    document.getElementById('check-health-btn').addEventListener('click', async () => {
        const resultBox = document.getElementById('health-result');
        const dot = document.getElementById('health-dot');
        const text = document.getElementById('health-text');
        
        resultBox.textContent = 'Pinging /h...';
        dot.className = 'dot pending';
        
        try {
            const res = await fetch('/h');
            const data = await res.text();
            
            resultBox.textContent = `Response: "${data}" (Status: ${res.status})`;
            
            if (res.ok) {
                dot.className = 'dot green';
                text.textContent = 'Online';
                showToast('Backend is online', 'success');
            } else {
                dot.className = 'dot red';
                text.textContent = 'Error';
            }
        } catch (err) {
            resultBox.textContent = `Error: ${err.message}`;
            dot.className = 'dot red';
            text.textContent = 'Offline';
            showToast('Backend unreachable', 'error');
        }
    });

    document.getElementById('check-order-btn').addEventListener('click', async () => {
        const itemInput = document.getElementById('order-item');
        const resultBox = document.getElementById('order-result');
        const item = itemInput.value.trim() || 'something';
        
        resultBox.textContent = `Checking order for "${item}"...`;
        
        try {
            const res = await fetch(`/order?item=${encodeURIComponent(item)}`);
            const data = await res.text(); // Assuming endpoint returns string
            resultBox.textContent = data;
        } catch (err) {
            resultBox.textContent = `Error: ${err.message}`;
        }
    });

    // Utilities
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Icon based on type
        const icon = type === 'success' ? '✓' : '⚠';
        
        toast.innerHTML = `
            <span style="font-weight:bold; font-size:1.2rem;">${icon}</span>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }
});
