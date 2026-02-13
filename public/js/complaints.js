const Complaints = (function() {
  async function create(payload) {
    try {
      const token = Auth.getToken();
      const r = await fetch('/api/complaints', {
        method:'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': token ? 'Bearer '+token : '' },
        body: JSON.stringify(payload)
      });
      const json = await r.json();
      return r.ok ? { ok:true, data: json } : { ok:false, error: json.msg || 'Failed' };
    } catch (err) { return { ok:false, error: err.message }; }
}

async function getMine(){
  try {
    const token = Auth.getToken();
    const r = await fetch('/api/complaints/mine', {
      headers: { 'Authorization': token ? 'Bearer '+token : '' }
    });
    const json = await r.json();
    return r.ok ? { ok:true, data: json } : { ok:false, error: json.msg || 'Failed' };
  } catch (err) { return { ok:false, error: err.message }; }
}

async function update(id, payload){
  try {
    const token = Auth.getToken();
    const r = await fetch(`/api/complaints/${id}`, {
      method:'PUT',
      headers: { 'Content-Type':'application/json', 'Authorization': token ? 'Bearer '+token : '' },
      body: JSON.stringify(payload)
    });
    const json = await r.json();
    return r.ok ? { ok:true, data: json } : { ok:false, error: json.msg || 'Failed' };
  } catch (err) { return { ok:false, error: err.message }; }
}

async function remove(id){
  try {
    const token = Auth.getToken();
    const r = await fetch(`/api/complaints/${id}`, {
      method:'DELETE',
      headers: { 'Authorization': token ? 'Bearer '+token : '' }
    });
    const json = await r.json();
    return r.ok ? { ok:true, data: json } : { ok:false, error: json.msg || 'Failed' };
  } catch (err) { return { ok:false, error: err.message }; }
}

async function listAll(){
  try {
    const token = Auth.getToken();
    const r = await fetch('/api/complaints', {
      headers: { 'Authorization': token ? 'Bearer '+token : '' }
    });
    const json = await r.json();
    return r.ok ? { ok:true, data: json } : { ok:false, error: json.msg || 'Failed' };
  } catch (err) { return { ok:false, error: err.message }; }
}

async function approve(id){
  try {
    const token = Auth.getToken();
    const r = await fetch(`/api/complaints/${id}/approve`, {
      method:'PUT',
      headers: { 'Authorization': token ? 'Bearer '+token : '' }
    });
    const json = await r.json();
    return r.ok ? { ok:true, data: json } : { ok:false, error: json.msg || 'Failed' };
  } catch (err) { return { ok:false, error: err.message }; }
}

async function complete(id){
  try {
    const token = Auth.getToken();
    const r = await fetch(`/api/complaints/${id}/complete`, {
      method:'PUT',
      headers: { 'Authorization': token ? 'Bearer '+token : '' }
    });
    const json = await r.json();
    return r.ok ? { ok:true, data: json } : { ok:false, error: json.msg || 'Failed' };
  } catch (err) { return { ok:false, error: err.message }; }
}

function renderResident(container, items){
  if (!container) return;
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = '<p class="muted">No complaints yet.</p>';
    return;
  }
  container.innerHTML = '';
  items.slice().reverse().forEach(c => {
  const div = document.createElement('div');
  div.className = 'notice';
  const actionsHtml = c.status !== 'completed'
  ? `<button class="btn edit" data-id="${c.id}">Edit</button>
  <button class="btn ghost del" data-id="${c.id}">Delete</button>`
  : `<span class="muted">No actions (completed)</span>`;

  div.innerHTML = `<h4>${escapeHtml(c.title)} <small class="muted">(${escapeHtml(c.status)})</small></h4>
  <p>${escapeHtml(c.body)}</p>
  <small class="muted">${new Date(c.createdAt).toLocaleString()}</small>
  <div style="margin-top:8px">${actionsHtml}</div>`;
  container.appendChild(div);
});

container.querySelectorAll('button.edit').forEach(b => {
  b.addEventListener('click', async () => {
    const id = b.getAttribute('data-id');
    const newTitle = prompt('Edit title');
    if (newTitle === null) return;
    const newBody = prompt('Edit details');
    if (newBody === null) return;
    const res = await update(id, { title: newTitle.trim(), body: newBody.trim() });
    if (res.ok) loadMyComplaints(); else alert(res.error || 'Update failed');
  });
});  

container.querySelectorAll('button.del').forEach(b => {
  b.addEventListener('click', async () => {
    if (!confirm('Delete this complaint?')) return;
    const id = b.getAttribute('data-id');
    const res = await remove(id);
    if (res.ok) loadMyComplaints(); else alert(res.error || 'Delete failed');
  });
});
}

function renderAdmin(container, items){
  if (!container) return;
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = '<p class="muted">No complaints</p>';
    return;
  }
  container.innerHTML = '';
  items.slice().reverse().forEach(c => {
  const div = document.createElement('div');
  div.className = 'notice';
  const approveBtn = c.status === 'open' ? `<button class="btn approve" data-id="${c.id}">Approve</button>` : '';
  const completeBtn = c.status !== 'completed' ? `<button class="btn complete" data-id="${c.id}">Mark complete</button>` : `<span class="muted">Completed</span>`;
  div.innerHTML = `<h4>${escapeHtml(c.title)} <small class="muted">(${escapeHtml(c.status)})</small></h4>
  <p>${escapeHtml(c.body)}</p>
  <small class="muted">By: ${escapeHtml(c.resident)} • ${new Date(c.createdAt).toLocaleString()}</small>
  <div style="margin-top:8px">
  ${approveBtn}
  ${completeBtn}
  </div>`;
  container.appendChild(div);
});

container.querySelectorAll('button.approve').forEach(b => {
  b.addEventListener('click', async () => {
  const id = b.getAttribute('data-id');
  const res = await approve(id);
  if (res.ok) loadAdminComplaints(); else alert(res.error || 'Approve failed');
});
});

container.querySelectorAll('button.complete').forEach(b => {
  b.addEventListener('click', async () => {
  const id = b.getAttribute('data-id');
  const res = await complete(id);
  if (res.ok) loadAdminComplaints(); else alert(res.error || 'Complete failed');
});
});
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

return {
    create, getMine, update, remove,
    listAll, approve, complete,
    renderResident, renderAdmin
  };
}) ();

window.loadAdminComplaints = async function() {
    const container = document.getElementById('adminComplaints') || document.getElementById('complaintsList');
    if (!container) return;
    const res = await Complaints.listAll();
    if (res.ok) Complaints.renderAdmin(container, res.data);
};

window.loadMyComplaints = async function() {
    const container = document.getElementById('myComplaints');
    if (!container) return;
    const res = await Complaints.getMine();
    if (res.ok) Complaints.renderResident(container, res.data);
};