/**
 * Maznex Enterprises — Entry Flow Popup
 * Shows on first visit: Company/Individual → Country → Field of Work (company only) → Newsletter → Register
 * Saved to localStorage so it only shows once per session
 */
(function () {
  if (localStorage.getItem('mnx_entry_done')) return;

  const COUNTRIES = [
    { flag: '🇬🇧', name: 'United Kingdom', code: 'GB', currency: 'GBP' },
    { flag: '🇺🇸', name: 'United States',  code: 'US', currency: 'USD' },
    { flag: '🇦🇪', name: 'UAE',             code: 'AE', currency: 'AED' },
    { flag: '🇨🇦', name: 'Canada',          code: 'CA', currency: 'CAD' },
    { flag: '🇦🇺', name: 'Australia',       code: 'AU', currency: 'AUD' },
    { flag: '🇵🇰', name: 'Pakistan',        code: 'PK', currency: 'PKR' },
    { flag: '🇮🇳', name: 'India',           code: 'IN', currency: 'INR' },
    { flag: '🇩🇪', name: 'Germany',         code: 'DE', currency: 'EUR' },
    { flag: '🇫🇷', name: 'France',          code: 'FR', currency: 'EUR' },
    { flag: '🇸🇬', name: 'Singapore',       code: 'SG', currency: 'SGD' },
    { flag: '🇳🇬', name: 'Nigeria',         code: 'NG', currency: 'NGN' },
    { flag: '🇿🇦', name: 'South Africa',    code: 'ZA', currency: 'ZAR' },
    { flag: '🇸🇦', name: 'Saudi Arabia',    code: 'SA', currency: 'SAR' },
    { flag: '🇯🇵', name: 'Japan',           code: 'JP', currency: 'JPY' },
    { flag: '🇳🇱', name: 'Netherlands',     code: 'NL', currency: 'EUR' },
    { flag: '🇮🇪', name: 'Ireland',         code: 'IE', currency: 'EUR' },
    { flag: '🇳🇿', name: 'New Zealand',     code: 'NZ', currency: 'NZD' },
    { flag: '🇲🇾', name: 'Malaysia',        code: 'MY', currency: 'MYR' },
    { flag: '🇰🇪', name: 'Kenya',           code: 'KE', currency: 'KES' },
    { flag: '🇧🇷', name: 'Brazil',          code: 'BR', currency: 'BRL' },
    { flag: '🌍', name: 'Other',            code: 'OT', currency: 'GBP' },
  ];

  const INDUSTRIES = [
    { icon: 'calculate',      label: 'Accounting & Tax',    sub: 'Audit, tax, advisory' },
    { icon: 'account_balance',label: 'Banking & Finance',   sub: 'Global transactions & assets' },
    { icon: 'app_shortcut',   label: 'Tech & SaaS',         sub: 'Software & digital infrastructure' },
    { icon: 'gavel',          label: 'Legal Services',       sub: 'Corporate & international law' },
    { icon: 'domain',         label: 'Real Estate',          sub: 'Commercial & property' },
    { icon: 'local_hospital', label: 'Healthcare',           sub: 'Medical & pharma' },
    { icon: 'energy_savings_leaf', label: 'Renewables',     sub: 'Clean energy & ESG' },
    { icon: 'shopping_bag',   label: 'Retail & Fashion',     sub: 'Luxury & logistics' },
    { icon: 'precision_manufacturing', label: 'Engineering', sub: 'Industrial & manufacturing' },
    { icon: 'more_horiz',     label: 'Other',                sub: 'Not listed above' },
  ];

  let state = { step: 1, type: null, country: null, industry: null, newsletter: false };

  // ── Styles ────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #mnx-overlay {
      position:fixed;inset:0;z-index:99999;
      background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);
      display:flex;align-items:center;justify-content:center;padding:16px;
      animation:mnxFadeIn 0.3s ease;
    }
    @keyframes mnxFadeIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
    #mnx-card {
      background:#1A1A1A;border:1px solid rgba(201,168,76,0.3);border-radius:16px;
      width:100%;max-width:560px;max-height:90vh;overflow:hidden;
      display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(0,0,0,0.8);
    }
    #mnx-header {
      padding:28px 32px 20px;border-bottom:1px solid rgba(255,255,255,0.06);
      text-align:center;
    }
    #mnx-logo {
      font-family:Manrope,sans-serif;font-size:22px;font-weight:900;
      color:#C9A84C;letter-spacing:-0.05em;text-transform:uppercase;margin-bottom:6px;
    }
    #mnx-steps {
      display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:14px;
    }
    .mnx-step-dot {
      width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.15);transition:all 0.3s;
    }
    .mnx-step-dot.active { background:#C9A84C;box-shadow:0 0 8px rgba(201,168,76,0.6); }
    .mnx-step-dot.done   { background:rgba(201,168,76,0.4); }
    #mnx-title {
      font-family:Manrope,sans-serif;font-size:20px;font-weight:800;
      color:#fff;margin-bottom:4px;
    }
    #mnx-subtitle { font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5; }
    #mnx-body {
      padding:24px 32px;overflow-y:auto;flex:1;
      scrollbar-width:thin;scrollbar-color:#C9A84C #1A1A1A;
    }
    #mnx-body::-webkit-scrollbar{width:5px}
    #mnx-body::-webkit-scrollbar-thumb{background:#C9A84C;border-radius:99px}
    #mnx-footer {
      padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);
    }
    .mnx-btn-primary {
      width:100%;padding:14px;border-radius:8px;border:none;cursor:pointer;
      background:linear-gradient(135deg,#C9A84C,#A68936);
      color:#1A1A1A;font-family:Manrope,sans-serif;font-size:13px;
      font-weight:800;text-transform:uppercase;letter-spacing:0.08em;
      transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;
    }
    .mnx-btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(201,168,76,0.3)}
    .mnx-btn-primary:disabled{opacity:0.4;cursor:not-allowed;transform:none}
    .mnx-btn-secondary {
      background:none;border:none;cursor:pointer;
      color:rgba(255,255,255,0.35);font-size:12px;
      padding:8px;display:block;margin:8px auto 0;text-decoration:underline;
    }
    .mnx-type-btn {
      width:100%;padding:18px 20px;border-radius:10px;cursor:pointer;
      border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);
      display:flex;align-items:center;gap:16px;transition:all 0.2s;text-align:left;
    }
    .mnx-type-btn:hover{border-color:rgba(201,168,76,0.5);background:rgba(201,168,76,0.06)}
    .mnx-type-btn.selected{border-color:#C9A84C;background:rgba(201,168,76,0.1)}
    .mnx-type-icon {
      width:44px;height:44px;border-radius:10px;background:rgba(201,168,76,0.15);
      display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px;
    }
    .mnx-type-label{font-family:Manrope,sans-serif;font-weight:700;font-size:14px;color:#fff}
    .mnx-type-sub{font-size:12px;color:rgba(255,255,255,0.4);margin-top:2px}
    .mnx-country-grid {
      display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;
    }
    .mnx-country-btn {
      padding:10px 8px;border-radius:8px;cursor:pointer;
      border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);
      display:flex;align-items:center;justify-content:center;gap:6px;
      font-size:11px;color:rgba(255,255,255,0.7);font-weight:600;transition:all 0.2s;
    }
    .mnx-country-btn:hover{border-color:rgba(201,168,76,0.4);background:rgba(201,168,76,0.06)}
    .mnx-country-btn.selected{border-color:#C9A84C;background:rgba(201,168,76,0.12);color:#C9A84C}
    .mnx-search {
      width:100%;padding:11px 14px;border-radius:8px;margin-bottom:12px;
      background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
      color:#fff;font-size:13px;outline:none;box-sizing:border-box;
    }
    .mnx-search:focus{border-color:#C9A84C}
    .mnx-search::placeholder{color:rgba(255,255,255,0.25)}
    .mnx-industry-item {
      display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:8px;
      cursor:pointer;border:1px solid rgba(255,255,255,0.08);
      background:rgba(255,255,255,0.03);transition:all 0.2s;margin-bottom:8px;
    }
    .mnx-industry-item:hover{border-color:rgba(201,168,76,0.4);background:rgba(201,168,76,0.06)}
    .mnx-industry-item.selected{border-color:#C9A84C;background:rgba(201,168,76,0.1)}
    .mnx-industry-icon {
      width:36px;height:36px;border-radius:8px;background:rgba(201,168,76,0.12);
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
      font-size:18px;color:#C9A84C;
    }
    .mnx-check {
      width:20px;height:20px;border-radius:4px;border:2px solid rgba(255,255,255,0.2);
      margin-left:auto;flex-shrink:0;display:flex;align-items:center;justify-content:center;
    }
    .mnx-check.checked{background:#C9A84C;border-color:#C9A84C}
    .mnx-input {
      width:100%;padding:12px 14px;border-radius:8px;margin-bottom:12px;
      background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);
      color:#fff;font-size:13px;outline:none;box-sizing:border-box;font-family:Inter,sans-serif;
    }
    .mnx-input:focus{border-color:#C9A84C}
    .mnx-input::placeholder{color:rgba(255,255,255,0.25)}
    .mnx-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(201,168,76,0.8);margin-bottom:6px;display:block}
    .mnx-toggle-row {
      display:flex;align-items:center;justify-content:space-between;
      padding:14px 16px;border-radius:8px;background:rgba(255,255,255,0.04);
      border:1px solid rgba(255,255,255,0.08);margin-bottom:10px;cursor:pointer;
    }
    .mnx-toggle {
      width:40px;height:22px;border-radius:99px;background:rgba(255,255,255,0.15);
      position:relative;transition:background 0.2s;flex-shrink:0;
    }
    .mnx-toggle.on{background:#C9A84C}
    .mnx-toggle::after {
      content:'';position:absolute;top:3px;left:3px;
      width:16px;height:16px;border-radius:50%;background:#fff;transition:transform 0.2s;
    }
    .mnx-toggle.on::after{transform:translateX(18px)}
    .mnx-success-icon{font-size:48px;text-align:center;margin-bottom:12px}
    @media(max-width:480px){
      #mnx-card{border-radius:12px}
      #mnx-header{padding:20px 20px 16px}
      #mnx-body{padding:20px}
      #mnx-footer{padding:16px 20px}
      .mnx-country-grid{grid-template-columns:repeat(2,1fr)}
    }
  `;
  document.head.appendChild(style);

  // ── Render ────────────────────────────────────────────────────────────────
  function render() {
    const existing = document.getElementById('mnx-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'mnx-overlay';

    const steps = [1, 2, 3, 4, 5];
    const dots = steps.map(s => {
      const cls = s < state.step ? 'done' : s === state.step ? 'active' : '';
      return `<div class="mnx-step-dot ${cls}"></div>`;
    }).join('<div style="width:20px;height:1px;background:rgba(255,255,255,0.1)"></div>');

    const titles = {
      1: ['Welcome to Maznex', 'Are you a company or an individual?'],
      2: ['Select Your Country', 'We\'ll tailor pricing to your local currency.'],
      3: ['Field of Work', 'Help us personalise your experience.'],
      4: ['Stay Informed', 'Get exclusive market insights & updates.'],
      5: ['You\'re All Set!', 'How would you like to proceed?'],
    };

    overlay.innerHTML = `
      <div id="mnx-card">
        <div id="mnx-header">
          <div id="mnx-logo">MX · Maznex</div>
          <div id="mnx-steps">${dots}</div>
          <div id="mnx-title">${titles[state.step][0]}</div>
          <div id="mnx-subtitle">${titles[state.step][1]}</div>
        </div>
        <div id="mnx-body">${getStepBody()}</div>
        <div id="mnx-footer">${getStepFooter()}</div>
      </div>`;

    document.body.appendChild(overlay);
    bindEvents();
  }

  function getStepBody() {
    switch (state.step) {

      case 1: return `
        <div style="display:flex;flex-direction:column;gap:12px">
          <button class="mnx-type-btn ${state.type==='company'?'selected':''}" data-type="company">
            <div class="mnx-type-icon">🏢</div>
            <div>
              <div class="mnx-type-label">Company / Business</div>
              <div class="mnx-type-sub">I need financial services or want to hire talent</div>
            </div>
          </button>
          <button class="mnx-type-btn ${state.type==='individual'?'selected':''}" data-type="individual">
            <div class="mnx-type-icon">👤</div>
            <div>
              <div class="mnx-type-label">Individual / Candidate</div>
              <div class="mnx-type-sub">I'm looking for career opportunities in finance</div>
            </div>
          </button>
        </div>`;

      case 2: {
        const search = state._countrySearch || '';
        const filtered = COUNTRIES.filter(c =>
          c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
        );
        return `
          <input class="mnx-search" id="mnx-country-search" placeholder="🔍  Search country..." value="${search}"/>
          <div class="mnx-country-grid">
            ${filtered.map(c => `
              <button class="mnx-country-btn ${state.country===c.code?'selected':''}" data-country="${c.code}" data-currency="${c.currency}" data-name="${c.name}">
                <span>${c.flag}</span><span>${c.name.split(' ')[0]}</span>
              </button>`).join('')}
          </div>`;
      }

      case 3: return `
        ${INDUSTRIES.map(ind => `
          <div class="mnx-industry-item ${state.industry===ind.label?'selected':''}" data-industry="${ind.label}">
            <div class="mnx-industry-icon">
              <span class="material-symbols-outlined" style="font-size:18px">${ind.icon}</span>
            </div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:13px;color:#fff">${ind.label}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.4)">${ind.sub}</div>
            </div>
            <div class="mnx-check ${state.industry===ind.label?'checked':''}">
              ${state.industry===ind.label?'<span class="material-symbols-outlined" style="font-size:13px;color:#1A1A1A">check</span>':''}
            </div>
          </div>`).join('')}`;

      case 4: return `
        <div style="margin-bottom:20px">
          <label class="mnx-label">Your Name</label>
          <input class="mnx-input" id="mnx-name" placeholder="Full name" value="${state.name||''}"/>
          <label class="mnx-label">Email Address</label>
          <input class="mnx-input" id="mnx-email" type="email" placeholder="your@email.com" value="${state.email||''}"/>
        </div>
        <div class="mnx-toggle-row" id="mnx-newsletter-toggle">
          <div>
            <div style="font-size:13px;font-weight:600;color:#fff">Subscribe to Market Insights</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">Weekly briefings on global finance & recruitment</div>
          </div>
          <div class="mnx-toggle ${state.newsletter?'on':''}" id="mnx-toggle-el"></div>
        </div>
        <div class="mnx-toggle-row" id="mnx-terms-toggle">
          <div style="font-size:12px;color:rgba(255,255,255,0.5)">
            I agree to Maznex's <a href="/contact" style="color:#C9A84C">Privacy Policy</a> & Terms
          </div>
          <div class="mnx-toggle ${state.terms?'on':''}" id="mnx-terms-el"></div>
        </div>`;

      case 5: return `
        <div style="text-align:center;padding:12px 0 20px">
          <div class="mnx-success-icon">✅</div>
          <div style="font-family:Manrope,sans-serif;font-size:18px;font-weight:800;color:#fff;margin-bottom:8px">
            Welcome to Maznex${state.name ? ', ' + state.name.split(' ')[0] : ''}!
          </div>
          <div style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:24px">
            ${state.country ? `Viewing from <strong style="color:#C9A84C">${state._countryName}</strong> · ` : ''}
            ${state.type === 'company' ? 'Explore our services & packages' : 'Browse open finance roles'}
          </div>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${state.type === 'company' ? `
              <a href="/services" style="display:block;padding:13px;border-radius:8px;background:linear-gradient(135deg,#C9A84C,#A68936);color:#1A1A1A;font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;text-align:center">Explore Our Services</a>
              <a href="/packages" style="display:block;padding:13px;border-radius:8px;border:1px solid rgba(201,168,76,0.3);color:#C9A84C;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;text-align:center">View Pricing Packages</a>
              <a href="/recruitment" style="display:block;padding:13px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;text-align:center">Hire Finance Talent</a>
            ` : `
              <a href="/jobs" style="display:block;padding:13px;border-radius:8px;background:linear-gradient(135deg,#C9A84C,#A68936);color:#1A1A1A;font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;text-align:center">Browse Open Roles</a>
              <a href="/candidate-portal" style="display:block;padding:13px;border-radius:8px;border:1px solid rgba(201,168,76,0.3);color:#C9A84C;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;text-align:center">Register as a Candidate</a>
              <a href="/recruitment" style="display:block;padding:13px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;text-align:center">Learn About Maznex Recruitment</a>
            `}
          </div>
        </div>`;
    }
  }

  function getStepFooter() {
    if (state.step === 5) {
      return `<button class="mnx-btn-secondary" id="mnx-close">Close & Continue Browsing →</button>`;
    }
    const labels = { 1: 'Continue', 2: 'Confirm Country', 3: 'Continue', 4: 'Finish Setup' };
    const disabled = (state.step === 1 && !state.type) ||
                     (state.step === 2 && !state.country) ||
                     (state.step === 3 && !state.industry) ||
                     (state.step === 4 && (!state.email || !state.terms));
    // Skip step 3 for individuals
    const skipLabel = (state.step === 2 && state.type === 'individual') ? 'Skip Field of Work →' : '';

    return `
      <button class="mnx-btn-primary" id="mnx-next" ${disabled ? 'disabled' : ''}>
        ${labels[state.step]} <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
      </button>
      ${skipLabel ? `<button class="mnx-btn-secondary" id="mnx-skip">${skipLabel}</button>` : ''}
      ${state.step > 1 ? `<button class="mnx-btn-secondary" id="mnx-back">← Back</button>` : ''}
      <button class="mnx-btn-secondary" id="mnx-dismiss">Skip for now</button>`;
  }

  function bindEvents() {
    // Type selection
    document.querySelectorAll('[data-type]').forEach(btn => {
      btn.onclick = () => { state.type = btn.dataset.type; render(); };
    });

    // Country selection
    document.querySelectorAll('[data-country]').forEach(btn => {
      btn.onclick = () => {
        state.country = btn.dataset.country;
        state._countryName = btn.dataset.name;
        state._currency = btn.dataset.currency;
        render();
      };
    });

    // Country search
    const searchEl = document.getElementById('mnx-country-search');
    if (searchEl) {
      searchEl.oninput = (e) => { state._countrySearch = e.target.value; render(); };
      searchEl.focus();
    }

    // Industry selection
    document.querySelectorAll('[data-industry]').forEach(item => {
      item.onclick = () => { state.industry = item.dataset.industry; render(); };
    });

    // Newsletter toggle
    const newsletterToggle = document.getElementById('mnx-newsletter-toggle');
    if (newsletterToggle) newsletterToggle.onclick = () => { state.newsletter = !state.newsletter; render(); };

    // Terms toggle
    const termsToggle = document.getElementById('mnx-terms-toggle');
    if (termsToggle) termsToggle.onclick = () => { state.terms = !state.terms; render(); };

    // Name / email inputs
    const nameEl  = document.getElementById('mnx-name');
    const emailEl = document.getElementById('mnx-email');
    if (nameEl)  nameEl.oninput  = (e) => { state.name  = e.target.value; updateNextBtn(); };
    if (emailEl) emailEl.oninput = (e) => { state.email = e.target.value; updateNextBtn(); };

    // Next button
    const nextBtn = document.getElementById('mnx-next');
    if (nextBtn) nextBtn.onclick = () => nextStep();

    // Skip (individuals skip step 3)
    const skipBtn = document.getElementById('mnx-skip');
    if (skipBtn) skipBtn.onclick = () => { state.step = 4; render(); };

    // Back
    const backBtn = document.getElementById('mnx-back');
    if (backBtn) backBtn.onclick = () => { state.step--; render(); };

    // Close / dismiss
    const closeBtn = document.getElementById('mnx-close');
    if (closeBtn) closeBtn.onclick = () => dismiss();
    const dismissBtn = document.getElementById('mnx-dismiss');
    if (dismissBtn) dismissBtn.onclick = () => dismiss();
  }

  function updateNextBtn() {
    const btn = document.getElementById('mnx-next');
    if (!btn) return;
    const emailEl = document.getElementById('mnx-email');
    const email = emailEl ? emailEl.value : state.email;
    const disabled = !email || !email.includes('@') || !state.terms;
    btn.disabled = disabled;
  }

  function nextStep() {
    // Capture name/email before moving on
    const nameEl  = document.getElementById('mnx-name');
    const emailEl = document.getElementById('mnx-email');
    if (nameEl)  state.name  = nameEl.value;
    if (emailEl) state.email = emailEl.value;

    if (state.step === 2 && state.type === 'individual') {
      state.step = 4; // skip industry step for individuals
    } else if (state.step === 4) {
      submitData();
      state.step = 5;
    } else {
      state.step++;
    }
    render();
  }

  function submitData() {
    // Send to backend API
    const API = 'https://maznex-backend.vercel.app';
    fetch(`${API}/api/entry/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:       state.type,
        country:    state._countryName,
        countryCode:state.country,
        currency:   state._currency,
        industry:   state.industry,
        name:       state.name,
        email:      state.email,
        newsletter: state.newsletter,
      })
    }).catch(() => {}); // silent fail — popup still completes
  }

  function dismiss() {
    localStorage.setItem('mnx_entry_done', '1');
    const overlay = document.getElementById('mnx-overlay');
    if (overlay) {
      overlay.style.animation = 'mnxFadeIn 0.2s ease reverse';
      setTimeout(() => overlay.remove(), 200);
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(render, 800));
  } else {
    setTimeout(render, 800);
  }

})();
