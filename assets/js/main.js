/* Stepping Stone Foundation — site behaviour (no dependencies) */
(function () {
  'use strict';
  window.SSF_REVEAL = true;
  var CFG = window.SSF_CONFIG || {};
  var RAZORPAY = CFG.razorpayUrl || 'https://razorpay.me/@steppingstonefoundation';
  var EMAIL = CFG.contactEmail || 'mail@ssfnagpur.org';
  var root = document.documentElement;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  $$('[data-razorpay]').forEach(function (a) { a.href = RAZORPAY; a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-email-text]').forEach(function (el) { el.textContent = EMAIL; });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Sticky masthead height (keeps section links from hiding under it) */
  var mast = $('.masthead');
  function setMast() { if (mast) root.style.setProperty('--masthead', mast.offsetHeight + 'px'); }
  setMast(); window.addEventListener('resize', setMast);

  /* ---------- Navigation ---------- */
  var nav = $('#site-nav'), toggle = $('.nav-toggle');
  if (toggle && nav) toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  var menus = $$('.has-menu');
  function closeMenus(except) { menus.forEach(function (m) { if (m !== except) { m.classList.remove('is-open'); var b = $('.submenu-toggle', m); if (b) b.setAttribute('aria-expanded', 'false'); } }); }
  menus.forEach(function (m) {
    var btn = $('.submenu-toggle', m);
    btn.addEventListener('click', function (e) {
      e.stopPropagation(); m.classList.remove('is-dismissed');
      var open = !m.classList.contains('is-open'); closeMenus(m);
      m.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenus(); m.classList.add('is-dismissed'); btn.focus(); } });
    m.addEventListener('focusout', function (e) { if (!m.contains(e.relatedTarget)) m.classList.remove('is-dismissed'); });
    m.addEventListener('mouseenter', function () { if (innerWidth > 900) btn.setAttribute('aria-expanded', 'true'); });
    m.addEventListener('mouseleave', function () { m.classList.remove('is-dismissed'); if (innerWidth > 900 && !m.classList.contains('is-open')) btn.setAttribute('aria-expanded', 'false'); });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.has-menu')) closeMenus(); });
  if (nav) nav.addEventListener('click', function (e) {
    if (e.target.closest('a') && nav.classList.contains('is-open')) { nav.classList.remove('is-open'); closeMenus(); if (toggle) toggle.setAttribute('aria-expanded', 'false'); }
  });

  /* ---------- Focus-area tabs ---------- */
  $$('[data-tabs]').forEach(function (wrap) {
    var tabs = $$('[role="tab"]', wrap), current = 0;
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    function show(i, focus) {
      current = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) { var on = k === current; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; panels[k].hidden = !on; });
      if (focus) tabs[current].focus();
      tabs[current].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1, true); } if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1, true); } });
    });
    $$('[data-tab-prev]', wrap).forEach(function (b) { b.addEventListener('click', function () { show(current - 1); }); });
    $$('[data-tab-next]', wrap).forEach(function (b) { b.addEventListener('click', function () { show(current + 1); }); });
    tabs.forEach(function (t, k) { t.tabIndex = k === 0 ? 0 : -1; });
  });

  /* ---------- Gallery lightbox ---------- */
  var tiles = $$('[data-lightbox]');
  if (tiles.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox'; lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = '<div class="lb-top"><span data-lb-count></span><button type="button" class="lb-close" aria-label="Close photo viewer"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><img alt="" data-lb-img><p data-lb-cap></p><div class="arrows"><button type="button" class="arrow-btn" aria-label="Previous photo" data-lb-prev><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button><button type="button" class="arrow-btn arrow-btn--dark" aria-label="Next photo" data-lb-next><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>';
    document.body.appendChild(lb);
    var idx = 0, opener = null;
    var render = function () { var im = $('img', tiles[idx]); $('[data-lb-img]', lb).src = im.currentSrc || im.src; $('[data-lb-img]', lb).alt = im.alt; $('[data-lb-cap]', lb).textContent = im.alt; $('[data-lb-count]', lb).textContent = (idx + 1) + ' / ' + tiles.length; };
    var open = function (i) { idx = i; opener = tiles[i]; render(); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); };
    var close = function () { lb.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); };
    var step = function (d) { idx = (idx + d + tiles.length) % tiles.length; render(); };
    tiles.forEach(function (t, i) { t.addEventListener('click', function () { open(i); }); });
    $('.lb-close', lb).addEventListener('click', close);
    $('[data-lb-prev]', lb).addEventListener('click', function () { step(-1); });
    $('[data-lb-next]', lb).addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  }

  /* ---------- Donation amount (shared by every amount picker) ---------- */
  var amountField = $('#d-amount');
  function setAmount(n, source) {
    n = Math.round(Number(n));
    if (!n || n < 1) return;
    store('ssf_amount', String(n));
    $$('[data-picker]').forEach(function (p) {
      var preset = false;
      $$('[data-amount]', p).forEach(function (b) { var on = Number(b.dataset.amount) === n; if (on) preset = true; b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var custom = $('[data-custom-amount]', p);
      if (custom && custom !== source) custom.value = preset ? '' : n;
      var tpl = p.dataset.label || 'Donate {amt}';
      $$('[data-donate-label]', p).forEach(function (el) { el.textContent = tpl.replace('{amt}', fmt(n)); });
    });
    if (amountField) amountField.value = n;
    $$('[data-amount-text]').forEach(function (el) { el.textContent = fmt(n); });
  }
  $$('[data-picker]').forEach(function (p) {
    $$('[data-amount]', p).forEach(function (b) { b.addEventListener('click', function () { setAmount(b.dataset.amount, b); }); });
    var custom = $('[data-custom-amount]', p);
    if (custom) custom.addEventListener('input', function () { if (custom.value) setAmount(custom.value, custom); });
  });
  setAmount(Number(store('ssf_amount')) || 500);

  /* ---------- Forms ---------- */
  function india(f) { return !f.country || /^india$/i.test(f.country.value.trim()); }
  var RULES = {
    name: function (v) { if (!v) return 'Please enter your full name.'; if (v.trim().length < 3) return 'Please enter your full name.'; },
    mobile: function (v) {
      if (!v) return 'Please enter your mobile number.';
      var d = v.replace(/[\s-]/g, '');
      if (/^\+?91\d{10}$/.test(d)) d = d.replace(/^\+?91/, '');
      if (!/^[6-9]\d{9}$/.test(d) && !/^\+\d{8,15}$/.test(d)) return 'Enter a valid 10-digit mobile number (or +country code).';
    },
    email: function (v) { if (!v) return 'Please enter your email.'; if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address.'; },
    required: function (v, f, el) { if (!v) return 'Please fill in ' + (el.dataset.label || 'this field').toLowerCase() + '.'; },
    pan: function (v) { if (v && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase())) return 'PAN should look like ABCDE1234F.'; }
  };
  function fieldError(el, msg) {
    var id = el.id + '-err', box = document.getElementById(id);
    if (msg) {
      if (!box) { box = document.createElement('span'); box.id = id; box.className = 'field-error'; box.setAttribute('role', 'alert'); el.insertAdjacentElement('afterend', box); }
      box.textContent = msg; el.classList.add('invalid'); el.setAttribute('aria-invalid', 'true');
      var d = el.getAttribute('aria-describedby') || ''; if (d.indexOf(id) < 0) el.setAttribute('aria-describedby', (d + ' ' + id).trim());
    } else { if (box) box.remove(); el.classList.remove('invalid'); el.removeAttribute('aria-invalid'); }
  }
  function validate(form) {
    var first = null;
    $$('[data-rule]', form).forEach(function (el) {
      if (el.disabled) { fieldError(el, null); return; }
      var r = RULES[el.dataset.rule], msg = r ? r(el.value.trim(), form.elements, el) : null;
      fieldError(el, msg); if (msg && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }
  function collect(form) {
    var out = {};
    $$('[name]', form).forEach(function (el) {
      if (el.disabled || el.type === 'checkbox' || el.type === 'submit') return;
      out[el.dataset.label || el.name] = el.value.trim();
    });
    return out;
  }
  function asText(o) { return Object.keys(o).map(function (k) { return k + ': ' + (o[k] || '-'); }).join('\n'); }
  function send(subject, data) {
    if (!CFG.formEndpoint) return Promise.reject(new Error('no endpoint'));
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    return fetch(CFG.formEndpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(Object.assign({}, data, { _subject: subject, _template: 'table', _captcha: 'false' })), signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json().catch(function () { return {}; }); })
      .then(function (j) { if (j && (j.success === false || j.success === 'false')) { if (window.console) console.warn('Form service:', j.message || j); throw new Error(j.message || 'Not accepted'); } return j; });
  }
  function copyBtn(btn, text) {
    btn.addEventListener('click', function () {
      var label = btn.dataset.label || 'Copy';
      var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = label; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text()).then(done, function () { btn.textContent = 'Select and copy'; });
      else btn.textContent = 'Select and copy';
    });
  }

  /* Anonymous donation: hide and skip the personal fields */
  var anon = $('#d-anon'), identity = $('[data-identity]');
  function syncAnon() {
    if (!anon || !identity) return;
    identity.hidden = anon.checked;
    $$('input', identity).forEach(function (el) { el.disabled = anon.checked; if (anon.checked) fieldError(el, null); });
  }
  if (anon) anon.addEventListener('change', syncAnon);
  syncAnon();

  $$('form[data-form]').forEach(function (form) {
    var kind = form.dataset.form, submit = $('[type="submit"]', form), status = $('[data-status]', form);
    $$('.uppercase', form).forEach(function (el) { el.addEventListener('input', function () { var p = el.selectionStart; el.value = el.value.toUpperCase(); try { el.setSelectionRange(p, p); } catch (e) {} }); });
    $$('[data-rule]', form).forEach(function (el) { el.addEventListener('input', function () { if (el.classList.contains('invalid')) { var r = RULES[el.dataset.rule]; if (!(r && r(el.value.trim(), form.elements, el))) fieldError(el, null); } }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (kind === 'donor' && (!amountField || Number(amountField.value) < 1)) { var c = $('[data-custom-amount]', form); if (c) c.focus(); return; }
      if (!validate(form)) return;
      var label = submit.innerHTML;

      if (kind === 'donor') {
        var amount = Number(amountField.value);
        var isAnon = anon && anon.checked;
        var showPay = function (state) {
          submit.disabled = false; submit.innerHTML = label;
          var panel = $('#pay-step');
          var first = isAnon ? '' : form.elements.name.value.trim().split(/\s+/)[0];
          $$('[data-donor-name]').forEach(function (el) { el.textContent = first ? ', ' + first : ''; });
          $$('[data-amount-text]').forEach(function (el) { el.textContent = fmt(amount); });
          $('[data-sent-ok]', panel).hidden = state !== 'ok';
          $('[data-sent-fail]', panel).hidden = state !== 'fail';
          $('[data-sent-anon]', panel).hidden = state !== 'anon';
          var s = $('[data-summary]', panel); if (s) s.textContent = asText(collect(form));
          form.hidden = true; panel.hidden = false;
          var target = $('#donate-form'); if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          var h = $('h2', panel); if (h) h.focus({ preventScroll: true });
        };
        if (isAnon) { showPay('anon'); return; }
        submit.disabled = true; submit.textContent = 'Saving your details…';
        send('New donor details — ' + fmt(amount) + ' — ' + form.elements.name.value.trim(), collect(form))
          .then(function () { showPay('ok'); }, function () { showPay('fail'); });
        return;
      }

      var data = collect(form);
      submit.disabled = true; submit.textContent = 'Sending…';
      var subj = kind === 'volunteer' ? 'Volunteer / Intern enquiry — ' + (data['First name'] || '') + ' ' + (data['Last name'] || '') : 'Website contact — ' + (data['Email'] || '');
      send(subj, data).then(function () {
        submit.disabled = false; submit.innerHTML = label;
        status.className = 'notice notice-success'; status.hidden = false;
        status.textContent = 'Thank you! Your message has reached Stepping Stone Foundation. We will get back to you soon.';
        form.reset();
      }, function () {
        submit.disabled = false; submit.innerHTML = label;
        status.className = 'notice notice-error'; status.hidden = false;
        status.innerHTML = 'We couldn’t send this automatically. Please email your message to <strong>' + EMAIL + '</strong> or call +91 72197 48162. <button type="button" class="copy-btn" data-label="Copy my message">Copy my message</button>';
        copyBtn($('.copy-btn', status), function () { return asText(data); });
      });
    });
  });
  var edit = $('[data-edit-details]');
  if (edit) edit.addEventListener('click', function () { $('#pay-step').hidden = true; var f = $('#donor-form'); f.hidden = false; var b = $('[data-amount][aria-pressed="true"]', f) || $('[data-amount]', f); if (b) b.focus(); });
  $$('[data-copy-summary]').forEach(function (b) { copyBtn(b, function () { var s = $('[data-summary]'); return s ? s.textContent : ''; }); });
  $$('[data-copy-amount]').forEach(function (b) { copyBtn(b, function () { return String(Number(amountField ? amountField.value : 0)); }); });

  /* ---------- Report PDFs: offer by email until the files are uploaded ---------- */
  $$('[data-doc]').forEach(function (a) {
    var title = $('strong', a).textContent;
    var pending = function () {
      a.classList.add('is-pending'); a.removeAttribute('target');
      a.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Request: ' + title + ' (last 3 years)');
      $('.doc-text span', a).textContent = 'Last 3 years · available on request';
      $('[data-doc-label]', a).textContent = 'Request';
    };
    if (location.protocol === 'file:') { pending(); return; }
    fetch(a.getAttribute('href'), { method: 'HEAD' }).then(function (r) { if (!r.ok) pending(); }, pending);
  });

  /* ---------- Entrance animations ---------- */
  var settle = function (id, jump) {
    var el = id && document.getElementById(id); if (!el) return;
    var r = el.classList.contains('reveal') ? el : el.closest('.reveal');
    if (r && !r.classList.contains('is-in')) { r.style.transition = 'none'; r.classList.add('is-in'); void r.offsetWidth; r.style.transition = ''; }
    if (jump) el.scrollIntoView({ block: 'start' });
  };
  if (root.classList.contains('js-reveal')) {
    var els = $$('.reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
    window.addEventListener('load', function () { els.forEach(function (el) { if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-in'); }); });
  }
  if (location.hash.length > 1) {
    var hid = decodeURIComponent(location.hash.slice(1));
    settle(hid, true);
    window.addEventListener('load', function () { setMast(); settle(hid, true); });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]'); if (!a) return;
    var url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.hash.length > 1) settle(decodeURIComponent(url.hash.slice(1)), false);
  }, true);
})();
