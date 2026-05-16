// Shared shell: sidebar injection, particles, auth guard
(function() {
  const NAV = [
    { href: 'dashboard.html',        label: 'Dashboard',       icon: 'layout-dashboard' },
    { href: 'missions.html',         label: 'Missions',        icon: 'rocket' },
    { href: 'system-health.html',    label: 'System Health',   icon: 'activity' },
    { href: 'alerts.html',           label: 'Alerts',          icon: 'alert-triangle' },
    { href: 'analytics.html',        label: 'Analytics',       icon: 'bar-chart-3' },
    { href: 'ai-predictions.html',   label: 'AI Predictions',  icon: 'brain-circuit' },
    { href: 'communication.html',    label: 'Communication',   icon: 'radio' },
    { href: 'news.html',             label: 'Space News',      icon: 'newspaper' },
  ];
  const ADMIN_NAV = { href: 'users.html', label: 'Users', icon: 'users' };

  function icon(name, cls = '') {
    return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#icon-${name}"/></svg>`;
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem('astracore_user') || 'null'); } catch { return null; }
  }

  function authGuard() {
    const user = getUser();
    if (!user) { window.location.href = 'index.html'; return false; }
    return true;
  }

  function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-duration: ${Math.random() * 4 + 3}s;
        animation-delay: ${Math.random() * 4}s;
        opacity: ${Math.random() * 0.3 + 0.05};
        width: ${Math.random() > 0.8 ? 3 : 2}px;
        height: ${Math.random() > 0.8 ? 3 : 2}px;
      `;
      container.appendChild(p);
    }
  }

  function buildSidebar(containerId) {
    if (!authGuard()) return;
    const user = getUser();
    const current = window.location.pathname.split('/').pop() || 'dashboard.html';
    const allNav = user && user.role === 'admin' ? [...NAV, ADMIN_NAV] : NAV;
    const navHtml = allNav.map(item => {
      const active = current === item.href ? 'active' : '';
      return `<a href="${item.href}" class="nav-link ${active}">
        <i data-lucide="${item.icon}" style="width:18px;height:18px;flex-shrink:0"></i>
        <span>${item.label}</span>
      </a>`;
    }).join('');

    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <a href="dashboard.html" class="sidebar-logo">
          <i data-lucide="rocket" style="width:22px;height:22px;color:var(--primary)"></i>
          ASTRACORE
        </a>
        <nav class="sidebar-nav">${navHtml}</nav>
        <div class="sidebar-footer">
          <div class="sidebar-user">
            <span class="sidebar-user-name">${user ? user.username : 'Operator'}</span>
            <span class="sidebar-user-role">${user ? user.role : 'user'}</span>
          </div>
          <button class="logout-btn" onclick="logout()" title="Logout">
            <i data-lucide="log-out" style="width:16px;height:16px"></i>
          </button>
        </div>
      </aside>`;
    if (window.lucide) lucide.createIcons();
  }

  window.logout = function() {
    localStorage.removeItem('astracore_user');
    window.location.href = 'index.html';
  };

  window.showToast = function(title, desc, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) { container = document.createElement('div'); container.id = 'toast-container'; document.body.appendChild(container); }
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<div class="toast-title">${title}</div>${desc ? `<div class="toast-desc">${desc}</div>` : ''}`;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  };

  window.initShell = function(containerId) {
    initParticles();
    buildSidebar(containerId);
  };

  // Mobile menu toggle
  window.toggleSidebar = function() {
    const s = document.getElementById('sidebar');
    if (s) s.classList.toggle('open');
  };
})();

// Demo data
const DEMO = {
  user: null,
  missions: [
    { id:1, name:'ARTEMIS VII',       destination:'Moon',              payload:'Crew of 4',             launchDate:'2025-03-15', status:'active',    successProbability:'94.2' },
    { id:2, name:'MARS PATHFINDER II',destination:'Mars',              payload:'Rover + Lander',        launchDate:'2025-06-20', status:'planning',  successProbability:'78.5' },
    { id:3, name:'EUROPA PROBE',      destination:'Jupiter',           payload:'Scientific Equipment',  launchDate:'2024-11-08', status:'completed', successProbability:'96.1' },
    { id:4, name:'TITAN EXPLORER',    destination:'Saturn',            payload:'Atmospheric Probe',     launchDate:'2025-01-30', status:'active',    successProbability:'81.3' },
    { id:5, name:'VENUS MAPPER',      destination:'Venus',             payload:'Orbital Satellite',     launchDate:'2024-09-12', status:'failed',    successProbability:'45.0' },
    { id:6, name:'DEEP SPACE RELAY',  destination:'Deep Space',        payload:'Communication Array',   launchDate:'2025-08-05', status:'planning',  successProbability:'88.7' },
    { id:7, name:'LUNAR GATEWAY',     destination:'Moon',              payload:'Station Module',        launchDate:'2025-11-20', status:'planning',  successProbability:'92.3' },
    { id:8, name:'STARSHOT ALPHA',    destination:'Proxima Centauri',  payload:'Nanosatellite Array',   launchDate:'2026-01-01', status:'aborted',   successProbability:'22.0' },
  ],
  alerts: [
    { id:1, type:'FUEL_LOW',        severity:'critical', message:'Fuel level below 20% threshold on ARTEMIS VII', createdAt: new Date(Date.now()-1800000), acknowledged:false },
    { id:2, type:'SIGNAL_DEGRADED', severity:'warning',  message:'Signal strength reduced to 42% on TITAN EXPLORER', createdAt: new Date(Date.now()-3600000), acknowledged:false },
    { id:3, type:'SYSTEM_NOMINAL',  severity:'safe',     message:'All systems operating within normal parameters on EUROPA PROBE', createdAt: new Date(Date.now()-7200000), acknowledged:true },
    { id:4, type:'TEMPERATURE_SPIKE',severity:'warning', message:'Temperature reading 31.2°C on spacecraft hull sensors', createdAt: new Date(Date.now()-900000),  acknowledged:false },
    { id:5, type:'THRUSTER_ANOMALY',severity:'critical', message:'Thruster 3B showing irregular firing pattern on ARTEMIS VII', createdAt: new Date(Date.now()-600000), acknowledged:false },
    { id:6, type:'BATTERY_LOW',     severity:'warning',  message:'Battery backup cells at 73% on DEEP SPACE RELAY prototype', createdAt: new Date(Date.now()-5400000), acknowledged:true },
    { id:7, type:'RADIATION_SPIKE', severity:'critical', message:'Radiation level exceeded 35 μSv/h in belt crossing zone', createdAt: new Date(Date.now()-300000),  acknowledged:false },
  ],
  users: [
    { id:1, username:'commander_hayes', email:'hayes@astracore.mil',  role:'admin', createdAt:'2024-01-15' },
    { id:2, username:'pilot_reyes',     email:'reyes@astracore.mil',  role:'user',  createdAt:'2024-02-20' },
    { id:3, username:'eng_patel',       email:'patel@astracore.mil',  role:'user',  createdAt:'2024-03-10' },
    { id:4, username:'sci_torres',      email:'torres@astracore.mil', role:'user',  createdAt:'2024-04-05' },
    { id:5, username:'admin_morgan',    email:'morgan@astracore.mil', role:'admin', createdAt:'2024-01-01' },
    { id:6, username:'nav_chen',        email:'chen@astracore.mil',   role:'user',  createdAt:'2024-05-12' },
  ],
  health: { fuelLevel:'67.3', battery:'92.1', oxygenLevel:'98.4', signalStrength:'73.8', temperature:'22.5', thrusterStatus:'nominal' },
  summary: { totalMissions:8, activeMissions:2, successRate:76, criticalAlerts:3, totalAlerts:7, systemHealthScore:84, totalUsers:6 },
};

// Status / severity color helpers
function statusBadge(s) {
  const m = { planning:'badge-blue', active:'badge-emerald', completed:'badge-purple', failed:'badge-red', aborted:'badge-yellow' };
  return `<span class="badge ${m[s]||'badge-muted'}">${s}</span>`;
}
function severityBadge(s) {
  const m = { critical:'badge-red', warning:'badge-yellow', safe:'badge-emerald' };
  return `<span class="badge ${m[s]||'badge-muted'}">${s}</span>`;
}
function severityColor(s) {
  return s==='critical'?'var(--red)':s==='warning'?'var(--yellow)':'var(--emerald)';
}
function riskBadge(r) {
  const m = { low:'badge-emerald', medium:'badge-yellow', high:'badge-orange', critical:'badge-red' };
  return `<span class="badge ${m[r]||'badge-muted'}">${r}</span>`;
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}
function fmtTime(d) {
  return new Date(d).toLocaleString();
}
