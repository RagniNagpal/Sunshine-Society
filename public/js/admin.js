const Maintenance = (function() {
    const base = '/api/users/residents'; 
    
    async function listUsers() {
        try {
            const token = Auth.getToken();
            const r = await fetch(base, {
                headers: { 'Authorization': token ? 'Bearer ' + token : '' }
            });
            const json = await r.json();
            return r.ok ? { ok: true, data: json } : { ok: false, error: json.msg || 'Failed to fetch users' };
        } catch (err) { return { ok: false, error: err.message }; }
    }

    async function updateStatus(userId, newStatus) {
        try {
            const token = Auth.getToken();
            const r = await fetch(`${base}/${userId}/maintenance`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': token ? 'Bearer ' + token : '' },
                body: JSON.stringify({ newStatus })
            });
            const json = await r.json();
            return r.ok ? { ok: true, data: json } : { ok: false, error: json.msg || 'Update failed' };
        } catch (err) { return { ok: false, error: err.message }; }
    }

    function renderList(container, data) {
        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = '<p class="muted">No residents found with role "resident".</p>';
            return;
        }
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Flat No.</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Last Paid Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.forEach(user => {
            const isPaid = user.maintenanceStatus === 'Paid';
            const statusClass = isPaid ? 'status-paid' : 'status-pending';
            const actionText = isPaid ? 'Mark Pending' : 'Mark Paid';
            const paidDate = user.maintenancePaymentDate 
                ? new Date(user.maintenancePaymentDate).toLocaleDateString() 
                : 'N/A';
            html += `
                <tr>
                    <td>${user.flatNo}</td>
                    <td>${user.name}</td>
                    <td class="${statusClass}">${user.maintenanceStatus}</td>
                    <td>${paidDate}</td>
                    <td>
                        <button class="btn btn-small status-toggle" 
                                data-id="${user._id}" 
                                data-current-status="${user.maintenanceStatus}">
                            ${actionText}
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;

        container.querySelectorAll('button.status-toggle').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const current = btn.dataset.currentStatus;
                const newStatus = current === 'Paid' ? 'Pending' : 'Paid';
                
                btn.disabled = true;
                btn.textContent = 'Updating...';
                
                const res = await updateStatus(id, newStatus);
                const showMessage = window.showFlash || alert; 

                if (res.ok) {
                    showMessage(`Status updated to ${newStatus} for ${res.data.name}`);
                    await loadMaintenanceList(); 
                } else {
                    showMessage(res.error || 'Update failed');
                    await loadMaintenanceList(); 
                }
            });
        });
    }
    return { listUsers, updateStatus, renderList };
})();

window.loadAdminMaintenance = async function () {
    const container = document.getElementById('maintenanceList');
    if (!container) return;

    container.textContent = 'Loading Maintenance Data...';

    const res = await Maintenance.listUsers();
    if (!res.ok) {
        container.innerHTML = `<p class="muted">Error: ${res.error || 'Failed to load data'}</p>`;
    } else {
        Maintenance.renderList(container, res.data);
    }
};