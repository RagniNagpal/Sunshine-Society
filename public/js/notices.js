const Notices = (function () {
  const base = '/api/notices';

  async function load() {
    try {
      const r = await fetch(base);
      const json = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, error: json.msg || json.error || 'Failed' };
      return { ok: true, data: json };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function req(path = '', method = 'GET', body) {
    try {
      const token = Auth.getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      };

      const res = await fetch(base + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const json = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data: json };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  const create = payload => req('/', 'POST', payload);
  const update = (id, payload) => req(`/${id}`, 'PUT', payload);
  const remove = id => req(`/${id}`, 'DELETE');

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  async function renderList(container, adminMode = false) {
    if (!container) return;
    container.textContent = 'Loading notices...';

    const r = await load();
    if (!r.ok) {
      container.innerHTML = `<p class="muted">${r.error || 'Failed to load notices'}</p>`;
      return;
    }
    const notices = r.data || [];
    if (!notices.length) {
      container.innerHTML = '<p class="muted">No notices yet.</p>';
      return;
    }

    container.innerHTML = '';

    notices.slice().reverse().forEach(n => {
      const div = document.createElement('div');
      div.className = 'notice card';
      div.dataset.id = n.id || n._id;
      div.innerHTML = `
        <h4>${escapeHtml(n.title)}</h4>
        <p>${escapeHtml(n.body)}</p>
        <small class="muted">
          By ${escapeHtml(n.authorName || 'Admin')} • ${new Date(n.createdAt).toLocaleString()}
        </small>
        ${
          adminMode
            ? `<div class="notice-actions" style="margin-top:8px">
                 <button class="btn small edit" data-id="${n.id || n._id}">Edit</button>
                 <button class="btn small ghost delete" data-id="${n.id || n._id}">Delete</button>
               </div>`
            : ''
        }
      `;
      container.appendChild(div);
    });
    if (adminMode) attachAdminHandlers(container);
  }

  function attachAdminHandlers(container) {
    container.querySelectorAll('button.edit').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const card = btn.closest('.notice');
        const curTitle = card.querySelector('h4')?.textContent || '';
        const curBody = card.querySelector('p')?.textContent || '';

        const title = prompt('Edit notice title', curTitle);
        if (title === null) return;

        const body = prompt('Edit notice body', curBody);
        if (body === null) return;

        const res = await update(id, { title: title.trim(), body: body.trim() });
        if (res.ok) {
          await window.loadNotices();
          showFlash('Notice updated');
        } else {
          alert(res.data?.msg || res.error || 'Update failed');
        }
      };
    });

    container.querySelectorAll('button.delete').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        if (!confirm('Delete this notice?')) return;

        const res = await remove(id);
        if (res.ok) {
          await window.loadNotices();
          showFlash('Notice deleted');
        } else {
          alert(res.data?.msg || res.error || 'Delete failed');
        }
      };
    });
  }

  function showFlash(msg, timeout = 2000) {
    let f = document.getElementById('noticeFlash');
    if (!f) {
      f = document.createElement('div');
      f.id = 'noticeFlash';
      f.style.cssText =
        'position:fixed;right:20px;top:20px;padding:8px 12px;background:#222;color:#fff;border-radius:6px;z-index:9999';
      document.body.appendChild(f);
    }
    f.textContent = msg;
    f.style.display = 'block';
    clearTimeout(f._t);
    f._t = setTimeout(() => (f.style.display = 'none'), timeout);
  }
  return { load, create, update, remove, renderList, showFlash };
})();

window.loadNotices = async function () {
  const container = document.getElementById('noticesList');
  if (!container) return;
  const isAdmin = Auth.getRole && Auth.getRole() === 'admin';
  await Notices.renderList(container, isAdmin);
};