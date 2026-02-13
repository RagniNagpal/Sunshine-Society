const Socket = (function() {
    const token = Auth.getToken();
    if (!token) return;

    const socket = io({
        query: { token: token },
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log('Connected for Real-time Updates');
    });

    socket.on('new_update', async (data) => {

    if (data.type === 'NEW_COMPLAINT') {
        if (window.loadAdminComplaints) {
            await window.loadAdminComplaints();
        }
        showToast(`New Complaint from ${data.payload.resident}`);
    }

    if (data.type === 'COMPLAINT_STATUS_UPDATE') {
        if (window.loadAdminComplaints) {
            await window.loadAdminComplaints();
        }
        if (window.loadMyComplaints) {
            await window.loadMyComplaints();
        }
        showToast(`Status Updated: ${data.payload.title}`);
    }

    if (data.type === 'UPDATE_COMPLAINT') {
        if (window.loadAdminComplaints) {
            await window.loadAdminComplaints();
        }
        if (window.loadMyComplaints) {
            await window.loadMyComplaints();
        }
        showToast(`Complaint Updated`);
    }
    
    if (data.type === 'DELETE_COMPLAINT') {
        if (window.loadAdminComplaints) {
            await window.loadAdminComplaints();
        }
        if (window.loadMyComplaints) {
            await window.loadMyComplaints();
        }
        showToast(`Complaint Deleted`);
    }

    if (data.type === 'MAINTENANCE_STATUS_UPDATE') {
        if (window.loadAdminMaintenance) {
            await window.loadAdminMaintenance();
        }
        showToast(`Maintenance ${data.payload.status}`);
    }
    
    if (data.type === 'NEW_NOTICE') {
        if (window.loadNotices) {
            await window.loadNotices();
        }
        showToast('New Notice Published');
    }
    
    if (data.type === 'UPDATE_NOTICE') {
        if (window.loadNotices) {
            await window.loadNotices();
        }
        showToast('Notice Updated');
    }
    
    if (data.type === 'DELETE_NOTICE') {
        if (window.loadNotices) {
            await window.loadNotices();
        }
        showToast('Notice Deleted');
    }
});

function showToast(msg) {
        const toast = document.createElement('div');
        toast.style = `position:fixed; bottom:20px; right:20px; background:#2c3e50; color:#fff; 
                       padding:15px; border-radius:8px; z-index:10000; border-left:5px solid #f1c40f; 
                       box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-family: sans-serif;`;
        toast.textContent = '🔔 ' + msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
})();