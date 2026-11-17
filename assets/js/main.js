/* Stepping Stone Foundation — site behaviour (no dependencies) */
(function () {
  'use strict';
  var CFG = window.SSF_CONFIG || {};
  var RAZORPAY = CFG.razorpayUrl || 'https://razorpay.me/@steppingstonefoundation';
  var EMAIL = CFG.contactEmail || 'mail@ssfnagpur.org';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
  function store(key, val) { try { if (val === undefined) return sessionStorage.getItem(key); sessionStorage.setItem(key, val); } catch (e) { return null; } }

  /* Razorpay links everywhere */
  $$('[data-razorpay]').forEach(function (a) { a.href = RAZORPAY; a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-email-text]').forEach(function (el) { el.textContent = EMAIL; });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Mobile navigation */
  var toggle = $('.nav-toggle'), nav = $('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* Tabs (focus areas) */
  $$('[data-tabs]').forEach(function (wrap) {
    var tabs = $$('[role="tab"]', wrap);
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var current = 0;
    function show(i, focus) {
      current = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) {
        var on = k === current;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      if (focus) tabs[current].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1, true); }
      });
    });
    $$('[data-tab-prev]', wrap).forEach(function (b) { b.addEventListener('click', function () { show(current - 1); }); });
    $$('[data-tab-next]', wrap).forEach(function (b) { b.addEventListener('click', function () { show(current + 1); }); });
    show(0);
  });

  /* Slider (impact stories) */
  $$('[data-slider]').forEach(function (wrap) {
    var slides = $$('[data-slide]', wrap);
    var current = 0;
    var dots = [];
    $$('[data-dots-slot]', wrap).forEach(function (slot) {
      slides.forEach(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'dot'; b.setAttribute('aria-label', 'Show story ' + (i + 1));
        b.dataset.i = i;
        b.addEventListener('click', function () { show(i); });
        slot.appendChild(b); dots.push(b);
      });
    });
    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.hidden = k !== current; });
      dots.forEach(function (d) { if (Number(d.dataset.i) === current) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      $$('[data-slide-count]', wrap).forEach(function (el) { el.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0'); });
    }
    $$('[data-slide-prev]', wrap).forEach(function (b) { b.addEventListener('click', function () { show(current - 1); }); });
    $$('[data-slide-next]', wrap).forEach(function (b) { b.addEventListener('click', function () { show(current + 1); }); });
    show(0);
  });

  /* Gallery lightbox */
  var tiles = $$('[data-lightbox]');
  if (tiles.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox'; lb.hidden = true;
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = '<div class="lb-top"><span data-lb-count></span><button type="button" class="lb-close" aria-label="Close photo viewer"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<img alt="" data-lb-img><p data-lb-cap></p>' +
      '<div class="arrows"><button type="button" class="arrow-btn" aria-label="Previous photo" data-lb-prev><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button><button type="button" class="arrow-btn arrow-btn--dark" aria-label="Next photo" data-lb-next><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>';
    document.body.appendChild(lb);
    var idx = 0, opener = null;
    function render() {
      var t = tiles[idx], img = $('img', t);
      $('[data-lb-img]', lb).src = img.currentSrc || img.src;
      $('[data-lb-img]', lb).alt = img.alt;
      $('[data-lb-cap]', lb).textContent = img.alt;
      $('[data-lb-count]', lb).textContent = (idx + 1) + ' / ' + tiles.length;
    }
    function open(i) { idx = i; opener = tiles[i]; render(); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); }
    function close() { lb.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); }
    tiles.forEach(function (t, i) { t.addEventListener('click', function () { open(i); }); });
    $('.lb-close', lb).addEventListener('click', close);
    $('[data-lb-prev]', lb).addEventListener('click', function () { idx = (idx + tiles.length - 1) % tiles.length; render(); });
    $('[data-lb-next]', lb).addEventListener('click', function () { idx = (idx + 1) % tiles.length; render(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') { idx = (idx + 1) % tiles.length; render(); }
      if (e.key === 'ArrowLeft') { idx = (idx + tiles.length - 1) % tiles.length; render(); }
    });
  }

  /* Donation amount — shared between the donation cards and the donor form */
  var amountField = $('#d-amount');
  function setAmount(n, source) {
    n = Math.round(Number(n));
    if (!n || n < 1) return;
    store('ssf_amount', String(n));
    $$('[data-donate-card]').forEach(function (card) {
      $$('[data-amount]', card).forEach(function (b) { b.setAttribute('aria-pressed', Number(b.dataset.amount) === n ? 'true' : 'false'); });
      var custom = $('[data-custom-amount]', card);
      var preset = $$('[data-amount]', card).some(function (b) { return Number(b.dataset.amount) === n; });
      if (custom && source !== custom) custom.value = preset ? '' : n;
      $$('[data-donate-label]', card).forEach(function (el) { el.textContent = 'Donate ' + fmt(n); });
    });
    if (amountField && source !== amountField) amountField.value = n;
    $$('[data-amount-text]').forEach(function (el) { el.textContent = fmt(n); });
  }
  $$('[data-donate-card]').forEach(function (card) {
    $$('[data-amount]', card).forEach(function (b) { b.addEventListener('click', function () { setAmount(b.dataset.amount, b); }); });
    var custom = $('[data-custom-amount]', card);
    if (custom) custom.addEventListener('input', function () { if (custom.value) setAmount(custom.value, custom); });
    var go = $('[data-donate-go]', card);
    if (go && amountField) {
      go.addEventListener('click', function (e) {
        e.preventDefault();
        $$('.steps li').forEach(function (li, i) { li.className = i === 0 ? 'is-done' : i === 1 ? 'is-active' : ''; });
        var target = $('#donor-details');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(function () { var f = $('#d-name'); if (f) f.focus({ preventScroll: true }); }, 500);
      });
    }
  });
  if (amountField) amountField.addEventListener('input', function () { if (amountField.value) setAmount(amountField.value, amountField); });
  setAmount(Number(store('ssf_amount')) || 500);

  /* ---------- Forms ---------- */
  var RULES = {
    name: function (v) { if (!v) return 'Please enter your full name.'; if (v.trim().split(/\s+/).length < 2) return 'Please enter your name and surname.'; },
    mobile: function (v, f) {
      var d = v.replace(/[\s-]/g, '').replace(/^\+?91(?=\d{10}$)/, '');
      if (!v) return 'Please enter your mobile number.';
      var india = !f.country || /^india$/i.test(f.country.value.trim());
      if (india && !/^[6-9]\d{9}$/.test(d)) return 'Enter a valid 10-digit Indian mobile number.';
      if (!india && !/^\+?\d{6,15}$/.test(d)) return 'Enter a valid mobile number with country code.';
    },
    email: function (v) { if (!v) return 'Please enter your email.'; if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address.'; },
    required: function (v, f, el) { if (!v) return 'Please fill in ' + (el.dataset.label || 'this field') + '.'; },
    pin: function (v, f) {
      if (!v) return 'Please enter your PIN code.';
      var india = !f.country || /^india$/i.test(f.country.value.trim());
      if (india && !/^[1-9]\d{5}$/.test(v)) return 'Enter a valid 6-digit PIN code.';
      if (!india && !/^[A-Za-z0-9 -]{3,10}$/.test(v)) return 'Enter a valid postal code.';
    },
    pan: function (v) { if (v && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase())) return 'PAN should look like ABCDE1234F.'; },
    amount: function (v) { if (!v || Number(v) < 1) return 'Please enter an amount.'; }
  };

  function fieldError(el, msg) {
    var id = el.id + '-err', box = document.getElementById(id);
    if (msg) {
      if (!box) { box = document.createElement('span'); box.id = id; box.className = 'field-error'; box.setAttribute('role', 'alert'); el.insertAdjacentElement('afterend', box); }
      box.textContent = msg; el.classList.add('invalid'); el.setAttribute('aria-invalid', 'true');
      var d = el.getAttribute('aria-describedby') || ''; if (d.indexOf(id) < 0) el.setAttribute('aria-describedby', (d + ' ' + id).trim());
    } else {
      if (box) box.remove(); el.classList.remove('invalid'); el.removeAttribute('aria-invalid');
    }
  }
  function validate(form) {
    var first = null;
    $$('[data-rule]', form).forEach(function (el) {
      var rule = RULES[el.dataset.rule];
      var msg = rule ? rule(el.value.trim(), form.elements, el) : null;
      fieldError(el, msg);
      if (msg && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }
  function collect(form) {
    var out = {};
    $$('[name]', form).forEach(function (el) { if (el.name.charAt(0) !== '_' && el.type !== 'submit') out[el.dataset.label || el.name] = el.value.trim(); });
    return out;
  }
  function asText(obj) { return Object.keys(obj).map(function (k) { return k + ': ' + (obj[k] || '-'); }).join('\n'); }

  function send(subject, data) {
    if (!CFG.formEndpoint) return Promise.reject(new Error('no endpoint'));
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    var body = Object.assign({}, data, { _subject: subject, _template: 'table', _captcha: 'false' });
    return fetch(CFG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().catch(function () { return {}; });
    }).then(function (j) {
      if (j && (j.success === false || j.success === 'false')) throw new Error(j.message || 'Not accepted');
      return j;
    });
  }

  function copyButton(btn, text) {
    btn.addEventListener('click', function () {
      var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = btn.dataset.label || 'Copy'; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text()).then(done, function () { btn.textContent = 'Select and copy the text'; });
      else btn.textContent = 'Select and copy the text';
    });
  }

  $$('form[data-form]').forEach(function (form) {
    var kind = form.dataset.form;
    var submit = $('[type="submit"]', form);
    var status = $('[data-status]', form);
    $$('.uppercase', form).forEach(function (el) { el.addEventListener('input', function () { var p = el.selectionStart; el.value = el.value.toUpperCase(); try { el.setSelectionRange(p, p); } catch (e) {} }); });
    // Clear an error while the visitor types, once the value becomes valid (keeps layout stable on submit).
    $$('[data-rule]', form).forEach(function (el) { el.addEventListener('input', function () { if (el.classList.contains('invalid')) { var r = RULES[el.dataset.rule]; if (!(r && r(el.value.trim(), form.elements, el))) fieldError(el, null); } }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var data = collect(form);
      var label = submit.innerHTML;
      submit.disabled = true; submit.textContent = 'Sending…';

      if (kind === 'donor') {
        var amount = Number(form.elements.amount.value);
        var subject = 'New donor details — ' + fmt(amount) + ' — ' + form.elements.name.value.trim();
        send(subject, data).then(function () { showPay(true); }, function () { showPay(false); });
        function showPay(sent) {
          submit.disabled = false; submit.innerHTML = label;
          var panel = $('#pay-step');
          $$('[data-donor-name]').forEach(function (el) { el.textContent = form.elements.name.value.trim().split(/\s+/)[0]; });
          $$('[data-amount-text]').forEach(function (el) { el.textContent = fmt(amount); });
          $('[data-sent-ok]', panel).hidden = !sent;
          $('[data-sent-fail]', panel).hidden = sent;
          var summary = $('[data-summary]', panel); if (summary) summary.textContent = asText(data);
          form.closest('[data-step="details"]').hidden = true;
          panel.hidden = false;
          $$('.steps li').forEach(function (li, i) { li.className = i < 2 ? 'is-done' : 'is-active'; });
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          var h = $('h2', panel); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
        }
        return;
      }

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
        copyButton($('.copy-btn', status), function () { return asText(data); });
      });
    });
  });

  /* Pay step helpers */
  var back = $('[data-edit-details]');
  if (back) back.addEventListener('click', function () {
    $('#pay-step').hidden = true;
    $('[data-step="details"]').hidden = false;
    $$('.steps li').forEach(function (li, i) { li.className = i === 0 ? 'is-done' : i === 1 ? 'is-active' : ''; });
    $('#d-name').focus();
  });
  $$('[data-copy-summary]').forEach(function (btn) { copyButton(btn, function () { var s = $('[data-summary]'); return s ? s.textContent : ''; }); });
  $$('[data-copy-amount]').forEach(function (btn) { copyButton(btn, function () { return String(Number(amountField ? amountField.value : 0)); }); });
})();

/* Smooth entrance animations */
(function () {
  'use strict';
  window.SSF_REVEAL = true;
  var root = document.documentElement;
  if (!root.classList.contains('js-reveal')) return;
  var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(function (el) { io.observe(el); });
  // Elements revealed later (tabs, slides) animate as they appear; anything already passed shows at once.
  window.addEventListener('load', function () {
    els.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.bottom < 0) el.classList.add('is-in'); });
  });
})();

/* About dropdown + report links */
(function () {
  'use strict';
  var menus = Array.prototype.slice.call(document.querySelectorAll('.has-menu'));
  function closeAll(except) {
    menus.forEach(function (m) { if (m !== except) { m.classList.remove('is-open'); var b = m.querySelector('.submenu-toggle'); if (b) b.setAttribute('aria-expanded', 'false'); } });
  }
  menus.forEach(function (m) {
    var btn = m.querySelector('.submenu-toggle');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      m.classList.remove('is-dismissed');
      var open = !m.classList.contains('is-open');
      closeAll(m);
      m.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    m.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAll(); m.classList.add('is-dismissed'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    });
    m.addEventListener('focusout', function (e) { if (!m.contains(e.relatedTarget)) m.classList.remove('is-dismissed'); });
    m.addEventListener('mouseleave', function () { m.classList.remove('is-dismissed'); });
    // On wide screens, keep aria-expanded in step with hover for screen readers
    m.addEventListener('mouseenter', function () { if (window.innerWidth > 900) btn.setAttribute('aria-expanded', 'true'); });
    m.addEventListener('mouseleave', function () { if (window.innerWidth > 900 && !m.classList.contains('is-open')) btn.setAttribute('aria-expanded', 'false'); });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.has-menu')) closeAll(); });

  // Close the mobile menu after choosing a link (needed for same-page section links)
  var nav = document.getElementById('site-nav'), toggle = document.querySelector('.nav-toggle');
  if (nav) nav.addEventListener('click', function (e) {
    if (e.target.closest('a') && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open'); closeAll();
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Report PDFs: until the files are uploaded, offer them on request by email instead of a broken link
  var email = (window.SSF_CONFIG && window.SSF_CONFIG.contactEmail) || 'mail@ssfnagpur.org';
  Array.prototype.slice.call(document.querySelectorAll('[data-doc]')).forEach(function (a) {
    var title = a.querySelector('strong').textContent;
    function pending() {
      a.classList.add('is-pending');
      a.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Request: ' + title + ' (last 3 years)');
      a.removeAttribute('target');
      a.querySelector('.doc-text span').textContent = 'Last 3 years · available on request';
      a.querySelector('[data-doc-label]').textContent = 'Request';
    }
    if (location.protocol === 'file:') { pending(); return; }
    fetch(a.getAttribute('href'), { method: 'HEAD' }).then(function (r) { if (!r.ok) pending(); }, pending);
  });
})();

/* Section links: show the target at once so the browser lands exactly on it */
(function () {
  'use strict';
  function settle(id, jump) {
    var el = id && document.getElementById(id);
    if (!el) return;
    var r = el.classList.contains('reveal') ? el : el.closest('.reveal');
    if (r && !r.classList.contains('is-in')) { r.style.transition = 'none'; r.classList.add('is-in'); void r.offsetWidth; r.style.transition = ''; }
    if (jump) el.scrollIntoView({ block: 'start' });
  }
  if (location.hash.length > 1) {
    var id = decodeURIComponent(location.hash.slice(1));
    settle(id, true);
    window.addEventListener('load', function () { settle(id, true); });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]');
    if (!a) return;
    var url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.hash.length > 1) settle(decodeURIComponent(url.hash.slice(1)), false);
  }, true);
})();
