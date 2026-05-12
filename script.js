(function () {
  'use strict';

  var COOKIE_NAME = 'wtp_age_ok';
  var COOKIE_DAYS = 30;

  // Kit (formerly ConvertKit) integration.
  // 1. In Kit, create a form. The embed code contains a number like:
  //      action="https://app.kit.com/forms/8392739/subscriptions"
  //    Paste that number below.
  // 2. The form POSTs `email_address` (Kit's field name) to that URL.
  var KIT_FORM_ID = '9432197'; // e.g. '8392739'

  function setCookie(name, value, days) {
    var expires = new Date();
    expires.setTime(expires.getTime() + days * 864e5);
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  var gate = document.getElementById('age-gate');
  var site = document.getElementById('site');

  function revealSite() {
    gate.classList.add('age-gate--hidden');
    site.hidden = false;
    document.body.style.overflow = '';
  }

  function lockBody() {
    document.body.style.overflow = 'hidden';
  }

  if (getCookie(COOKIE_NAME) === '1') {
    revealSite();
  } else {
    lockBody();
  }

  document.getElementById('age-yes').addEventListener('click', function () {
    setCookie(COOKIE_NAME, '1', COOKIE_DAYS);
    revealSite();
  });

  document.getElementById('age-no').addEventListener('click', function () {
    window.location.replace('under-21.html');
  });

  // Email signup
  var form = document.getElementById('signup');
  var msg = document.getElementById('signup-msg');
  var input = document.getElementById('email');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.className = 'signup__msg';
    msg.textContent = '';

    var email = input.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = 'Please enter a valid email.';
      msg.classList.add('is-error');
      return;
    }

    if (!KIT_FORM_ID) {
      // No Kit form ID set yet — pretend it worked so the UX flows.
      msg.textContent = "You're on the list. We'll be in touch.";
      msg.classList.add('is-success');
      form.reset();
      return;
    }

    var endpoint = 'https://app.kit.com/forms/' + KIT_FORM_ID + '/subscriptions';
    var data = new FormData();
    data.append('email_address', email);

    // Kit doesn't return CORS headers, so we use no-cors and assume success.
    // The request still reaches Kit; we just can't read the response body.
    fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      body: data
    }).then(function () {
      msg.textContent = "You're on the list. We'll send you an email when we launch.";
      msg.classList.add('is-success');
      form.reset();
    }).catch(function () {
      msg.textContent = 'Network error. Try again?';
      msg.classList.add('is-error');
    });
  });

  // Year in footer
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
