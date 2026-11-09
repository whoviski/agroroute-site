(() => {
  const KEY = 'agroroute_cookie_consent';
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const panel = document.getElementById('cookie-panel');
  const analytics = document.getElementById('cookie-analytics');
  const marketing = document.getElementById('cookie-marketing');
  const settingsBtn = document.getElementById('cookie-settings');
  const acceptBtn = document.getElementById('cookie-accept');
  const necessaryBtn = document.getElementById('cookie-necessary');
  const saveBtn = document.getElementById('cookie-save');

  function read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!parsed || parsed.v !== 1 || parsed.necessary !== true) return null;
      return {
        v: 1,
        necessary: true,
        analytics: parsed.analytics === true,
        marketing: parsed.marketing === true
      };
    } catch (e) {
      return null;
    }
  }

  function write(choice) {
    const value = {
      v: 1,
      necessary: true,
      analytics: choice.analytics === true,
      marketing: choice.marketing === true
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
    } catch (e) {
      return null;
    }
    return value;
  }

  function allows(kind) {
    const saved = read();
    if (kind === 'necessary') return true;
    if (!saved) return false;
    if (kind === 'analytics') return saved.analytics;
    if (kind === 'marketing') return saved.marketing;
    return false;
  }

  window.agrorouteConsent = { allows };

  function applyToPanel(saved) {
    if (analytics) analytics.checked = !!(saved && saved.analytics);
    if (marketing) marketing.checked = !!(saved && saved.marketing);
  }

  function focusIn(el) {
    if (el) el.focus({ preventScroll: true });
  }

  function syncPad() {
    document.body.style.paddingBottom = banner.hidden ? '' : banner.offsetHeight + 'px';
  }

  function open(showPanel, moveFocus) {
    applyToPanel(read());
    banner.hidden = false;
    if (panel) panel.hidden = !showPanel;
    if (settingsBtn) settingsBtn.setAttribute('aria-expanded', showPanel ? 'true' : 'false');
    syncPad();
    if (moveFocus) focusIn(showPanel && analytics ? analytics : acceptBtn);
  }

  function close() {
    banner.hidden = true;
    if (settingsBtn) settingsBtn.setAttribute('aria-expanded', 'false');
    syncPad();
  }

  if (!read()) open(false, false);

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      if (write({ analytics: true, marketing: true })) close();
    });
  }
  if (necessaryBtn) {
    necessaryBtn.addEventListener('click', () => {
      if (write({ analytics: false, marketing: false })) close();
    });
  }
  if (settingsBtn && panel) {
    settingsBtn.addEventListener('click', () => {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      settingsBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      syncPad();
      if (willOpen && analytics) focusIn(analytics);
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (write({
        analytics: !!(analytics && analytics.checked),
        marketing: !!(marketing && marketing.checked)
      })) close();
    });
  }

  document.querySelectorAll('[data-cookie-settings]').forEach((button) => {
    button.addEventListener('click', () => open(true, true));
  });

  addEventListener('resize', syncPad);
  if (!banner.hidden) syncPad();

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || banner.hidden) return;
    if (!read()) return;
    close();
  });
})();
