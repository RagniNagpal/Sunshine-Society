const Auth = (function() {
  const tokenKey = 'ss_token';
  const userKey = 'ss_user';

async function signup(data){
  try {
    const r = await fetch('/api/auth/signup', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  const json = await r.json();
  if (r.ok && json.token) {
    localStorage.setItem(tokenKey, json.token);
    localStorage.setItem(userKey, JSON.stringify(json.user));
    renderHeader();
    setTimeout(() => {
      if (json.user.role === 'admin') location.href = '/admin.html';
      else location.href = '/dashboard.html';
    }, 200);
    return { ok:true, user: json.user };
  }
  return { ok:false, error: json.msg || (json.error && json.error.message) || 'Signup failed' };
} catch (err) { return { ok:false, error: err.message }; }
}

async function login(email, password) {
  try {
    const r = await fetch('/api/auth/login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email, password })
  });
  const json = await r.json();
  if (r.ok && json.token) {
    localStorage.setItem(tokenKey, json.token);
    localStorage.setItem(userKey, JSON.stringify(json.user));
    renderHeader();
    setTimeout(() => {
      if (json.user.role === 'admin') location.href = '/admin.html';
      else location.href = '/dashboard.html';
    }, 200);
    return { ok:true, user: json.user };
  }
  return { ok:false, error: json.msg || 'Invalid credentials' };
} catch (err) { return { ok:false, error: err.message }; }
}

function logout(){ localStorage.removeItem(tokenKey); localStorage.removeItem(userKey); renderHeader(); }

function getToken(){ return localStorage.getItem(tokenKey); }
function getUser(){ const u = localStorage.getItem(userKey); return u ? JSON.parse(u) : null; }
function getRole(){ const u = getUser(); return u ? u.role : null; }

function renderHeader() {
  const token = getToken();
  const user = getUser();
  const loginLink = document.getElementById('loginLink');
  const signupLink = document.getElementById('signupLink');
  const userArea = document.getElementById('userArea');
  const userCircle = document.getElementById('userCircle');
  const userName = document.getElementById('userName');
  const dashboardLink = document.getElementById('dashboardLink');

  if (!loginLink || !signupLink || !userArea) return;

  if (token && user) {
    loginLink.style.display = 'none';
    signupLink.style.display = 'none';
    userArea.style.display = 'flex';
    const first = (user.name || '').trim().split(/\s+/)[0] || '';
    if (userCircle) userCircle.textContent = (first[0] || '').toUpperCase();
    if (userName) userName.textContent = user.name;
    if (dashboardLink) dashboardLink.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
  } else {
    loginLink.style.display = 'inline-block';
    signupLink.style.display = 'inline-block';
    userArea.style.display = 'none';
    if (userCircle) userCircle.textContent = '';
    if (userName) userName.textContent = '';
  }
}

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'logoutLink') {
    e.preventDefault();
    logout();
    location.href = '/';
  }
});

document.addEventListener('DOMContentLoaded', () => { renderHeader(); });

return { signup, login, logout, getToken, getUser, getRole, renderHeader }; 
}) ();