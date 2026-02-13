const Home = (function(){
  async function renderAll(){
    const el = document.getElementById('noticesList');
    if (!el) return;
    el.innerHTML = 'Loading...';
    try {
      const r = await fetch('/api/notices');
      const data = await r.json();
      if (!r.ok) { el.innerHTML = `<div class="muted">Failed to load</div>`; return; }
      const list = Array.isArray(data) ? data : [];
      if (list.length === 0) { el.innerHTML = '<div class="muted">No notices yet.</div>'; return; }
      el.innerHTML = '';
      list.forEach(n => {
        const d = document.createElement('div');
        d.className = 'notice';
        d.innerHTML = `<h4>${escapeHtml(n.title)}</h4><p>${escapeHtml(n.body)}</p>
          <small class="muted">By ${escapeHtml(n.authorName||'Admin')} • ${new Date(n.createdAt).toLocaleString()}</small>`;
        el.appendChild(d);
      });
    } catch (err) {
      el.innerHTML = `<div class="muted">Error: ${escapeHtml(err.message)}</div>`;
    }
  }

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

return { renderAll };
}) ();