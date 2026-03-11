/* ===== main.js — PUP OIA Static Site ===== */

(function () {
  'use strict';

  /* ---------- DATA ---------- */
  var COUNTRIES = [
    { code: 'JP', name: 'Japan', flag: 'https://flagcdn.com/w80/jp.png' },
    { code: 'KR', name: 'South Korea', flag: 'https://flagcdn.com/w80/kr.png' },
    { code: 'SG', name: 'Singapore', flag: 'https://flagcdn.com/w80/sg.png' },
    { code: 'TH', name: 'Thailand', flag: 'https://flagcdn.com/w80/th.png' },
    { code: 'MY', name: 'Malaysia', flag: 'https://flagcdn.com/w80/my.png' },
    { code: 'ID', name: 'Indonesia', flag: 'https://flagcdn.com/w80/id.png' },
    { code: 'VN', name: 'Vietnam', flag: 'https://flagcdn.com/w80/vn.png' },
    { code: 'CN', name: 'China', flag: 'https://flagcdn.com/w80/cn.png' },
    { code: 'TW', name: 'Taiwan', flag: 'https://flagcdn.com/w80/tw.png' },
    { code: 'AU', name: 'Australia', flag: 'https://flagcdn.com/w80/au.png' },
    { code: 'US', name: 'United States', flag: 'https://flagcdn.com/w80/us.png' },
    { code: 'GB', name: 'United Kingdom', flag: 'https://flagcdn.com/w80/gb.png' },
    { code: 'FR', name: 'France', flag: 'https://flagcdn.com/w80/fr.png' },
    { code: 'DE', name: 'Germany', flag: 'https://flagcdn.com/w80/de.png' },
    { code: 'CA', name: 'Canada', flag: 'https://flagcdn.com/w80/ca.png' }
  ];

  var UNIVERSITIES = [
    { name: 'Tokyo Institute of Technology', region: 'Eastern Asia' },
    { name: 'National University of Singapore', region: 'South-Eastern Asia' },
    { name: 'Seoul National University', region: 'Eastern Asia' },
    { name: 'Chulalongkorn University', region: 'South-Eastern Asia' },
    { name: 'University of Malaya', region: 'South-Eastern Asia' },
    { name: 'Universitas Indonesia', region: 'South-Eastern Asia' },
    { name: 'Vietnam National University', region: 'South-Eastern Asia' },
    { name: 'Tsinghua University', region: 'Eastern Asia' },
    { name: 'National Taiwan University', region: 'Eastern Asia' },
    { name: 'University of Sydney', region: 'Oceania' },
    { name: 'Stanford University', region: 'North America' },
    { name: 'Oxford University', region: 'Northern Europe' },
    { name: 'Sorbonne University', region: 'Western Europe' },
    { name: 'Technical University of Munich', region: 'Western Europe' },
    { name: 'University of Toronto', region: 'North America' }
  ];

  /* ---------- HELPERS ---------- */
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  /* ---------- SMOOTH SCROLL ---------- */
  window.scrollToSection = function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    var headerH = 80;
    var top = el.getBoundingClientRect().top + window.pageYOffset - headerH;
    window.scrollTo({ top: top, behavior: 'smooth' });
    // Close TOC if open
    var tocMenu = $('#toc-menu');
    if (tocMenu) tocMenu.classList.remove('open');
    // Close mobile menu if open
    var nav = $('#main-nav');
    if (nav) nav.classList.remove('nav-open');
  };

  /* ---------- HEADER SCROLL EFFECT ---------- */
  function initHeaderScroll() {
    var header = $('#site-header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ---------- MOBILE MENU ---------- */
  function initMobileMenu() {
    var toggle = $('#mobile-menu-toggle');
    var nav = $('#main-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('nav-open');
      toggle.classList.toggle('active');
    });
  }

  /* ---------- HERO SLIDESHOW ---------- */
  function initHeroSlideshow() {
    var slides = $$('.oia-hero-slide');
    var dots = $$('.oia-slide-dot');
    if (slides.length === 0) return;

    var current = 0;
    var total = slides.length;
    var interval = 5000;
    var timer;

    function goToSlide(n) {
      slides[current].classList.remove('oia-hero-slide--active');
      if (dots[current]) dots[current].classList.remove('oia-slide-dot--active');
      current = ((n % total) + total) % total;
      slides[current].classList.add('oia-hero-slide--active');
      if (dots[current]) dots[current].classList.add('oia-slide-dot--active');
    }

    function next() { goToSlide(current + 1); }

    // Dot click
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        clearInterval(timer);
        goToSlide(parseInt(this.getAttribute('data-slide'), 10));
        timer = setInterval(next, interval);
      });
    });

    timer = setInterval(next, interval);
  }

  /* ---------- TOC BUTTON ---------- */
  function initTOC() {
    var btn = $('#toc-button');
    var menu = $('#toc-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Color change based on scroll position
    var darkSections = ['main-banner', 'contact'];
    window.addEventListener('scroll', function () {
      var y = window.scrollY + 200;
      var isDark = false;
      darkSections.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        var rect = el.getBoundingClientRect();
        var top = rect.top + window.pageYOffset;
        var bottom = top + rect.height;
        if (y >= top && y <= bottom) isDark = true;
      });
      btn.classList.toggle('oia-toc-button--white', isDark);
      btn.classList.toggle('oia-toc-button--dark', !isDark);
    }, { passive: true });
  }

  /* ---------- FLAG CAROUSEL ---------- */
  function initFlagCarousel() {
    var wrapper = $('#flag-carousel');
    var prevBtn = $('#flag-prev');
    var nextBtn = $('#flag-next');
    var counterCurrent = $('#flag-counter-current');
    var counterTotal = $('#flag-counter-total');
    if (!wrapper) return;

    var flagsPerPage = 5;
    var currentPage = 0;
    var totalPages = Math.ceil(COUNTRIES.length / flagsPerPage);
    var autoTimer;

    // Build flag items
    wrapper.innerHTML = '';
    COUNTRIES.forEach(function (c, i) {
      var item = document.createElement('div');
      item.className = 'oia-flag-item';
      item.setAttribute('data-index', i);
      item.innerHTML =
        '<div class="oia-flag-card">' +
          '<img src="' + c.flag + '" alt="' + c.name + ' flag" class="oia-flag-img" />' +
        '</div>' +
        '<span class="oia-flag-name">' + c.name + '</span>';
      wrapper.appendChild(item);
    });

    var allFlags = wrapper.querySelectorAll('.oia-flag-item');

    function showPage(page) {
      currentPage = ((page % totalPages) + totalPages) % totalPages;
      var start = currentPage * flagsPerPage;
      var end = start + flagsPerPage;
      allFlags.forEach(function (f, i) {
        var active = i >= start && i < end;
        f.classList.toggle('oia-flag-item--active', active);
      });
      if (counterCurrent) counterCurrent.textContent = currentPage + 1;
      if (counterTotal) counterTotal.textContent = totalPages;
    }

    showPage(0);

    if (prevBtn) prevBtn.addEventListener('click', function () {
      clearInterval(autoTimer);
      showPage(currentPage - 1);
      autoTimer = setInterval(function () { showPage(currentPage + 1); }, 4000);
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      clearInterval(autoTimer);
      showPage(currentPage + 1);
      autoTimer = setInterval(function () { showPage(currentPage + 1); }, 4000);
    });

    autoTimer = setInterval(function () { showPage(currentPage + 1); }, 4000);
  }

  /* ---------- STATS ---------- */
  function initStats() {
    var statC = $('#stat-countries');
    var statI = $('#stat-institutions');
    if (statC) statC.textContent = COUNTRIES.length;
    if (statI) statI.textContent = UNIVERSITIES.length;
  }

  /* ---------- PARTNER CAROUSEL ---------- */
  function initPartnerCarousel() {
    var track = $('#partners-carousel');
    var prevBtn = $('#partner-prev');
    var nextBtn = $('#partner-next');
    var loading = $('#partners-loading');
    if (!track) return;

    // Build partner cards
    track.innerHTML = '';
    UNIVERSITIES.forEach(function (u) {
      var initials = u.name.split(' ').map(function (w) { return w[0]; }).join('');
      var card = document.createElement('div');
      card.className = 'oia-partner-card';
      card.innerHTML =
        '<div class="oia-partner-logo-wrapper">' +
          '<img src="https://via.placeholder.com/150/0056b3/ffffff?text=' + encodeURIComponent(initials) + '" alt="' + u.name + '" class="oia-partner-logo" />' +
        '</div>' +
        '<div class="oia-partner-info">' +
          '<h4 class="oia-partner-name">' + u.name + '</h4>' +
          '<span class="oia-partner-region">' + u.region + '</span>' +
        '</div>';
      track.appendChild(card);
    });

    if (loading) loading.style.display = 'none';

    // Simple horizontal scroll carousel
    var scrollAmount = 280;
    var autoTimer;

    function scrollNext() {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
    function scrollPrev() {
      if (track.scrollLeft <= 10) {
        track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }

    if (nextBtn) nextBtn.addEventListener('click', function () {
      clearInterval(autoTimer);
      scrollNext();
      autoTimer = setInterval(scrollNext, 4000);
    });
    if (prevBtn) prevBtn.addEventListener('click', function () {
      clearInterval(autoTimer);
      scrollPrev();
      autoTimer = setInterval(scrollNext, 4000);
    });

    autoTimer = setInterval(scrollNext, 4000);
  }

  /* ---------- FAQ ACCORDION ---------- */
  window.toggleFAQ = function (btn) {
    var item = btn.closest('.faq-item');
    if (!item) return;
    var icon = btn.querySelector('.faq-icon');
    var isOpen = item.classList.contains('open');

    // Close all other items (single-open accordion like React version)
    var allItems = document.querySelectorAll('.faq-item.open');
    allItems.forEach(function (openItem) {
      openItem.classList.remove('open');
      var openIcon = openItem.querySelector('.faq-icon');
      if (openIcon) openIcon.textContent = '+';
    });

    // Toggle clicked item
    if (!isOpen) {
      item.classList.add('open');
      if (icon) icon.textContent = '−';
    }
  };

  /* ---------- TEMPLATES SEARCH & FILTER ---------- */
  function initTemplates() {
    var searchInput = $('#templates-search');
    var filterBtns = $$('.templates-category-filter');
    var cards = $$('.template-item-card');
    var noResults = $('#templates-no-results');
    if (!searchInput || cards.length === 0) return;

    var activeCategory = 'all';

    function filterCards() {
      var q = searchInput.value.toLowerCase().trim();
      var visible = 0;
      cards.forEach(function (card) {
        var name = (card.getAttribute('data-name') || '').toLowerCase();
        var desc = (card.getAttribute('data-desc') || '').toLowerCase();
        var type = (card.getAttribute('data-type') || '').toLowerCase();
        var matchCat = activeCategory === 'all' || type === activeCategory;
        var matchSearch = !q || name.indexOf(q) !== -1 || desc.indexOf(q) !== -1;
        var show = matchCat && matchSearch;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (noResults) noResults.style.display = visible === 0 ? '' : 'none';
    }

    searchInput.addEventListener('input', filterCards);

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        activeCategory = this.getAttribute('data-category');
        filterCards();
      });
    });
  }

  /* ---------- INTERSECTION OBSERVER (fade-in) ---------- */
  function initScrollAnimations() {
    var targets = $$('.pup-io-objective-card, .pup-io-function-card, .service-card, .official-card, .section-title, .templates-info-card, .template-item-card, .faq-item, .oia-about-card, .oia-about-image-wrapper');
    if (!targets.length || !('IntersectionObserver' in window)) return;

    // Add initial hidden state with stagger support
    targets.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1)';
    });

    var observer = new IntersectionObserver(function (entries) {
      // Collect all newly intersecting entries and stagger them
      var visible = [];
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visible.push(entry.target);
          observer.unobserve(entry.target);
        }
      });
      visible.forEach(function (el, idx) {
        setTimeout(function () {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, idx * 80);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- INIT ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeaderScroll();
    initMobileMenu();
    initHeroSlideshow();
    initTOC();
    initFlagCarousel();
    initStats();
    initPartnerCarousel();
    initTemplates();
    initScrollAnimations();
  });

})();
