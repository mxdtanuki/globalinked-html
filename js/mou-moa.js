/* ===== mou-moa.js — Partnership Statistics Page ===== */

(function () {
  'use strict';

  /* ---------- DATA ---------- */
  var COUNTRIES = [
    { code: 'jp', name: 'Japan' },
    { code: 'kr', name: 'South Korea' },
    { code: 'sg', name: 'Singapore' },
    { code: 'th', name: 'Thailand' },
    { code: 'my', name: 'Malaysia' },
    { code: 'id', name: 'Indonesia' },
    { code: 'vn', name: 'Vietnam' },
    { code: 'cn', name: 'China' },
    { code: 'tw', name: 'Taiwan' },
    { code: 'au', name: 'Australia' },
    { code: 'us', name: 'United States' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'fr', name: 'France' },
    { code: 'de', name: 'Germany' },
    { code: 'ca', name: 'Canada' }
  ];

  var UNIVERSITIES = [
    { name: 'Tokyo Institute of Technology', country: 'Japan', region: 'Eastern Asia' },
    { name: 'National University of Singapore', country: 'Singapore', region: 'South-Eastern Asia' },
    { name: 'Seoul National University', country: 'South Korea', region: 'Eastern Asia' },
    { name: 'Chulalongkorn University', country: 'Thailand', region: 'South-Eastern Asia' },
    { name: 'University of Malaya', country: 'Malaysia', region: 'South-Eastern Asia' },
    { name: 'Universitas Indonesia', country: 'Indonesia', region: 'South-Eastern Asia' },
    { name: 'Vietnam National University', country: 'Vietnam', region: 'South-Eastern Asia' },
    { name: 'Tsinghua University', country: 'China', region: 'Eastern Asia' },
    { name: 'National Taiwan University', country: 'Taiwan', region: 'Eastern Asia' },
    { name: 'University of Sydney', country: 'Australia', region: 'Oceania' },
    { name: 'Stanford University', country: 'United States', region: 'North America' },
    { name: 'Oxford University', country: 'United Kingdom', region: 'Northern Europe' },
    { name: 'Sorbonne University', country: 'France', region: 'Western Europe' },
    { name: 'Technical University of Munich', country: 'Germany', region: 'Western Europe' },
    { name: 'University of Toronto', country: 'Canada', region: 'North America' }
  ];

  var REGION_MAP = {
    'Eastern Asia': 'Asia-Pacific',
    'South-Eastern Asia': 'Asia-Pacific',
    'Oceania': 'Asia-Pacific',
    'North America': 'Americas',
    'Northern Europe': 'Europe',
    'Western Europe': 'Europe'
  };

  /* Seed-based pseudo-random for stable data */
  var seed = 42;
  function seededRandom() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  /* Generate deterministic agreements */
  function generateAgreements(count) {
    var agreements = [];
    var types = ['MOU', 'MOA'];
    var categories = ['Student Exchange', 'Faculty Exchange', 'Research Collaboration', 'Cultural Exchange', 'Conference Co-Hosting', 'Student Internship'];

    for (var i = 0; i < count; i++) {
      var c = COUNTRIES[Math.floor(seededRandom() * COUNTRIES.length)];
      var u = UNIVERSITIES[Math.floor(seededRandom() * UNIVERSITIES.length)];
      var docType = types[Math.floor(seededRandom() * types.length)];
      var startYear = 2020 + Math.floor(seededRandom() * 5);
      var isActive = seededRandom() > 0.2;

      agreements.push({
        id: i + 1,
        institution: u.name,
        country: c.name,
        countryCode: c.code,
        type: docType,
        category: categories[Math.floor(seededRandom() * categories.length)],
        startYear: startYear,
        status: isActive ? 'Active' : 'Expired',
        region: u.region,
        broadRegion: REGION_MAP[u.region] || u.region
      });
    }
    return agreements;
  }

  var agreements = generateAgreements(50);

  /* ---------- STATE ---------- */
  var state = {
    view: 'overview',     // overview | partnerships | countries | regions
    viewMode: 'grid',     // grid | list
    search: '',
    sort: 'name-asc',
    filter: 'all',        // all | MOU | MOA
    selectedCountry: null
  };

  /* ---------- DERIVED DATA ---------- */
  function getFilteredAgreements() {
    var data = agreements;
    if (state.filter === 'MOU') data = data.filter(function (a) { return a.type === 'MOU'; });
    if (state.filter === 'MOA') data = data.filter(function (a) { return a.type === 'MOA'; });
    if (state.search) {
      var q = state.search.toLowerCase();
      data = data.filter(function (a) {
        return a.institution.toLowerCase().indexOf(q) !== -1 ||
               a.country.toLowerCase().indexOf(q) !== -1;
      });
    }
    return data;
  }

  function getCountryData(filtered) {
    var map = {};
    filtered.forEach(function (a) {
      if (!map[a.country]) {
        map[a.country] = { country: a.country, code: a.countryCode, mou: 0, moa: 0, total: 0, region: a.region, broadRegion: a.broadRegion, universities: {} };
      }
      if (a.type === 'MOU') map[a.country].mou++;
      else map[a.country].moa++;
      map[a.country].total++;
      map[a.country].universities[a.institution] = true;
    });
    var arr = Object.keys(map).map(function (k) { return map[k]; });
    return sortData(arr);
  }

  function getRegionData(filtered) {
    var map = {};
    filtered.forEach(function (a) {
      var r = REGION_MAP[a.region] || a.region;
      if (!map[r]) { map[r] = { region: r, mou: 0, moa: 0, agreements: 0, countries: {} }; }
      if (a.type === 'MOU') map[r].mou++;
      else map[r].moa++;
      map[r].agreements++;
      map[r].countries[a.country] = true;
    });
    return Object.keys(map).map(function (k) {
      var d = map[k];
      d.countryCount = Object.keys(d.countries).length;
      return d;
    }).sort(function (a, b) { return b.agreements - a.agreements; });
  }

  function getInstitutionData(filtered) {
    var map = {};
    filtered.forEach(function (a) {
      if (!map[a.institution]) {
        map[a.institution] = { name: a.institution, country: a.country, code: a.countryCode, region: a.region, count: 0 };
      }
      map[a.institution].count++;
    });
    var arr = Object.keys(map).map(function (k) { return map[k]; });
    return arr.sort(function (a, b) { return a.name.localeCompare(b.name); });
  }

  function sortData(arr) {
    var s = state.sort;
    return arr.sort(function (a, b) {
      if (s === 'name-asc') return a.country.localeCompare(b.country);
      if (s === 'name-desc') return b.country.localeCompare(a.country);
      if (s === 'count-desc') return b.total - a.total;
      if (s === 'count-asc') return a.total - b.total;
      return 0;
    });
  }

  /* ---------- RENDER ---------- */
  function render() {
    var filtered = getFilteredAgreements();
    var totalMOU = filtered.filter(function (a) { return a.type === 'MOU'; }).length;
    var totalMOA = filtered.filter(function (a) { return a.type === 'MOA'; }).length;
    var countrySet = {};
    var uniSet = {};
    filtered.forEach(function (a) { countrySet[a.country] = true; uniSet[a.institution] = true; });
    var totalCountries = Object.keys(countrySet).length;
    var totalPartners = Object.keys(uniSet).length;

    renderHeroStats(totalPartners, totalCountries, totalMOU, totalMOA);
    renderTabs();
    renderContent(filtered, totalMOU, totalMOA, totalCountries, totalPartners);
  }

  function renderHeroStats(partners, countries, mous, moas) {
    var el = document.getElementById('hero-stats');
    if (!el) return;
    el.innerHTML =
      '<div class="moumoa-hero-stat-card">' +
        '<span class="moumoa-hero-stat-icon">&#127758;</span>' +
        '<span class="moumoa-hero-stat-number">' + partners + '</span>' +
        '<span class="moumoa-hero-stat-label">Partners</span>' +
      '</div>' +
      '<div class="moumoa-hero-stat-card">' +
        '<span class="moumoa-hero-stat-icon">&#127988;</span>' +
        '<span class="moumoa-hero-stat-number">' + countries + '</span>' +
        '<span class="moumoa-hero-stat-label">Countries</span>' +
      '</div>' +
      '<div class="moumoa-hero-stat-card">' +
        '<span class="moumoa-hero-stat-icon">&#128220;</span>' +
        '<span class="moumoa-hero-stat-number">' + mous + '</span>' +
        '<span class="moumoa-hero-stat-label">MOUs</span>' +
      '</div>' +
      '<div class="moumoa-hero-stat-card">' +
        '<span class="moumoa-hero-stat-icon">&#129309;</span>' +
        '<span class="moumoa-hero-stat-number">' + moas + '</span>' +
        '<span class="moumoa-hero-stat-label">MOAs</span>' +
      '</div>';
  }

  function renderTabs() {
    var tabs = document.querySelectorAll('.moumoa-nav-tab');
    tabs.forEach(function (t) {
      t.classList.toggle('moumoa-active', t.getAttribute('data-view') === state.view);
    });
  }

  function renderContent(filtered, totalMOU, totalMOA, totalCountries, totalPartners) {
    var content = document.getElementById('moumoa-content');
    if (!content) return;

    if (state.view === 'overview') {
      content.innerHTML = renderOverview(filtered, totalMOU, totalMOA, totalCountries, totalPartners);
    } else if (state.view === 'partnerships') {
      content.innerHTML = renderInstitutions(filtered);
    } else if (state.view === 'countries') {
      content.innerHTML = renderCountries(filtered);
    } else if (state.view === 'regions') {
      content.innerHTML = renderRegions(filtered, totalMOU, totalMOA);
    }

    // Bind country card clicks
    content.querySelectorAll('[data-country-click]').forEach(function (el) {
      el.addEventListener('click', function () {
        openCountryModal(this.getAttribute('data-country-click'), filtered);
      });
    });
  }

  /* ----- Overview ----- */
  function renderOverview(filtered, totalMOU, totalMOA, totalCountries, totalPartners) {
    var countryData = getCountryData(filtered);
    var regionData = getRegionData(filtered);
    var top6 = countryData.slice().sort(function (a, b) { return b.total - a.total; }).slice(0, 6);

    var html = '';

    // Summary cards
    html += '<div class="moumoa-overview-summary">';
    html += summaryCard('&#127758;', totalPartners, 'Total Partners');
    html += summaryCard('&#127988;', totalCountries, 'Countries');
    html += summaryCard('&#128220;', totalMOU, 'Memoranda of Understanding');
    html += summaryCard('&#129309;', totalMOA, 'Memoranda of Agreement');
    html += '</div>';

    // Top countries
    html += '<div class="moumoa-top-countries-section">';
    html += '<div class="moumoa-section-header"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><h3>Top Countries</h3></div>';
    html += '<div class="moumoa-top-countries-grid">';
    top6.forEach(function (c, i) {
      html += '<div class="moumoa-country-card" data-country-click="' + escapeAttr(c.country) + '">';
      html += '<span class="moumoa-country-rank-badge">' + (i + 1) + '</span>';
      html += '<div class="moumoa-country-header">';
      html += '<img src="https://flagcdn.com/w80/' + c.code + '.png" alt="' + escapeAttr(c.country) + '" class="moumoa-country-flag" />';
      html += '<div class="moumoa-country-info-text"><span class="moumoa-country-name">' + escapeHtml(c.country) + '</span><span class="moumoa-country-region">' + escapeHtml(c.region) + '</span></div>';
      html += '</div>';
      html += '<div class="moumoa-country-stats">';
      html += '<div class="moumoa-stat-item"><span class="moumoa-stat-label">MOU</span><span class="moumoa-stat-value">' + c.mou + '</span></div>';
      html += '<div class="moumoa-stat-item"><span class="moumoa-stat-label">MOA</span><span class="moumoa-stat-value">' + c.moa + '</span></div>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div></div>';

    // Regional distribution
    html += '<div class="moumoa-section-header" style="margin-top:40px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><h3>Regional Distribution</h3></div>';
    html += '<div class="moumoa-regional-overview">';
    var totalAll = totalMOU + totalMOA;
    regionData.forEach(function (r) {
      var mouPct = totalAll > 0 ? (r.mou / totalAll) * 100 : 0;
      var moaPct = totalAll > 0 ? (r.moa / totalAll) * 100 : 0;
      html += '<div class="moumoa-regional-item">';
      html += '<span class="moumoa-regional-label">' + escapeHtml(r.region) + '</span>';
      html += '<div class="moumoa-regional-bar-wrapper">';
      html += '<div class="moumoa-regional-bar-segment moumoa-regional-mou" style="width:' + mouPct.toFixed(1) + '%" title="' + r.mou + ' MOUs">' + (r.mou > 0 ? r.mou : '') + '</div>';
      html += '<div class="moumoa-regional-bar-segment moumoa-regional-moa" style="width:' + moaPct.toFixed(1) + '%" title="' + r.moa + ' MOAs">' + (r.moa > 0 ? r.moa : '') + '</div>';
      html += '</div>';
      html += '<span class="moumoa-regional-count">' + r.agreements + ' total</span>';
      html += '</div>';
    });
    html += '</div>';

    return html;
  }

  function summaryCard(icon, value, label) {
    return '<div class="moumoa-summary-card">' +
      '<span class="moumoa-summary-icon">' + icon + '</span>' +
      '<span class="moumoa-summary-value">' + value + '</span>' +
      '<span class="moumoa-summary-label">' + label + '</span>' +
    '</div>';
  }

  /* ----- Institutions ----- */
  function renderInstitutions(filtered) {
    var institutions = getInstitutionData(filtered);
    var html = '';

    if (state.viewMode === 'grid') {
      html += '<div class="partners-grid">';
      if (institutions.length === 0) {
        html += '<div class="moumoa-no-results"><h3>No institutions found</h3><p>Try adjusting your search or filters.</p></div>';
      }
      institutions.forEach(function (inst) {
        var initials = inst.name.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 3);
        html += '<div class="partner-card">';
        html += '<div class="partner-logo"><div class="logo-placeholder">' + escapeHtml(initials) + '</div></div>';
        html += '<h4 class="partner-name">' + escapeHtml(inst.name) + '</h4>';
        html += '<p class="partner-location">' + escapeHtml(inst.country) + '</p>';
        html += '</div>';
      });
      html += '</div>';
    } else {
      html += '<div class="partners-list">';
      if (institutions.length === 0) {
        html += '<div class="moumoa-no-results"><h3>No institutions found</h3><p>Try adjusting your search or filters.</p></div>';
      }
      institutions.forEach(function (inst) {
        var initials = inst.name.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 3);
        html += '<div class="partner-list-item">';
        html += '<div class="list-logo"><div class="logo-placeholder-small">' + escapeHtml(initials) + '</div></div>';
        html += '<div class="list-info"><h4>' + escapeHtml(inst.name) + '</h4><p>' + escapeHtml(inst.country) + ' &middot; ' + escapeHtml(inst.region) + '</p></div>';
        html += '</div>';
      });
      html += '</div>';
    }
    return html;
  }

  /* ----- Countries ----- */
  function renderCountries(filtered) {
    var countryData = getCountryData(filtered);
    var html = '';

    if (state.viewMode === 'grid') {
      html += '<div class="moumoa-countries-table"><div class="moumoa-table-body">';
      if (countryData.length === 0) {
        html += '<div class="moumoa-no-results"><h3>No countries found</h3><p>Try adjusting your search or filters.</p></div>';
      }
      countryData.forEach(function (c) {
        html += '<div class="moumoa-table-row" data-country-click="' + escapeAttr(c.country) + '">';
        html += '<div class="moumoa-table-country">';
        html += '<img src="https://flagcdn.com/w80/' + c.code + '.png" alt="' + escapeAttr(c.country) + '" class="moumoa-table-flag" />';
        html += escapeHtml(c.country);
        html += '</div>';
        html += '<span class="moumoa-table-region">' + escapeHtml(c.region) + '</span>';
        html += '<div class="moumoa-card-stats-row">';
        html += '<div class="moumoa-card-stat-box"><span class="moumoa-card-stat-value">' + c.mou + '</span><span class="moumoa-card-stat-label">MOU</span></div>';
        html += '<div class="moumoa-card-stat-box"><span class="moumoa-card-stat-value">' + c.moa + '</span><span class="moumoa-card-stat-label">MOA</span></div>';
        html += '</div>';
        html += '<div style="text-align:center;margin-top:8px;"><span class="moumoa-table-badge">' + c.total + '</span></div>';
        html += '</div>';
      });
      html += '</div></div>';
    } else {
      html += '<div class="countries-list">';
      if (countryData.length === 0) {
        html += '<div class="moumoa-no-results"><h3>No countries found</h3><p>Try adjusting your search or filters.</p></div>';
      }
      countryData.forEach(function (c) {
        html += '<div class="country-list-item" data-country-click="' + escapeAttr(c.country) + '">';
        html += '<div class="list-flag"><img src="https://flagcdn.com/w80/' + c.code + '.png" alt="' + escapeAttr(c.country) + '" /></div>';
        html += '<div class="list-content">';
        html += '<div class="list-header"><h4 class="list-title">' + escapeHtml(c.country) + '</h4><span class="list-region">' + escapeHtml(c.region) + '</span></div>';
        html += '<div class="list-details">';
        html += '<span class="list-stat"><span class="list-stat-label">MOU:</span> <span class="list-stat-value">' + c.mou + '</span></span>';
        html += '<span class="list-stat-separator">|</span>';
        html += '<span class="list-stat"><span class="list-stat-label">MOA:</span> <span class="list-stat-value">' + c.moa + '</span></span>';
        html += '<span class="list-stat-separator">|</span>';
        html += '<span class="list-stat"><span class="list-stat-label">Total:</span> <span class="list-stat-value list-total">' + c.total + '</span></span>';
        html += '</div></div></div>';
      });
      html += '</div>';
    }
    return html;
  }

  /* ----- Regions ----- */
  function renderRegions(filtered, totalMOU, totalMOA) {
    var regionData = getRegionData(filtered);
    var html = '<div class="moumoa-regions-content">';

    if (regionData.length === 0) {
      html += '<div class="moumoa-no-results"><h3>No regions found</h3></div>';
    }

    regionData.forEach(function (r) {
      var mouPct = (r.mou + r.moa) > 0 ? (r.mou / (r.mou + r.moa)) * 100 : 0;
      var moaPct = 100 - mouPct;
      html += '<div class="moumoa-region-card">';
      html += '<div class="moumoa-region-header">';
      html += '<div class="moumoa-region-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>';
      html += '<h4 class="moumoa-region-name">' + escapeHtml(r.region) + '</h4>';
      html += '</div>';
      html += '<div class="moumoa-region-stats-row">';
      html += '<div class="moumoa-region-stat"><span class="moumoa-region-stat-value">' + r.countryCount + '</span><span class="moumoa-region-stat-text">Countries</span></div>';
      html += '<div class="moumoa-region-stat"><span class="moumoa-region-stat-value">' + (r.mou + r.moa) + '</span><span class="moumoa-region-stat-text">Agreements</span></div>';
      html += '<div class="moumoa-region-stat"><span class="moumoa-region-stat-value">' + r.mou + '/' + r.moa + '</span><span class="moumoa-region-stat-text">MOU/MOA</span></div>';
      html += '</div>';
      html += '<div class="moumoa-region-chart">';
      html += '<div class="moumoa-chart-segment moumoa-mou-segment" style="width:' + mouPct.toFixed(1) + '%"></div>';
      html += '<div class="moumoa-chart-segment moumoa-moa-segment" style="width:' + moaPct.toFixed(1) + '%"></div>';
      html += '</div>';
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  /* ---------- MODAL ---------- */
  function openCountryModal(countryName, filtered) {
    var countryData = getCountryData(filtered);
    var c = countryData.find(function (d) { return d.country === countryName; });
    if (!c) return;

    var modal = document.getElementById('country-modal');
    var header = document.getElementById('modal-header');
    var unis = document.getElementById('modal-universities');
    var footer = document.getElementById('modal-footer');

    header.innerHTML =
      '<div class="moumoa-modal-header-left">' +
        '<img src="https://flagcdn.com/48x36/' + c.code + '.png" alt="' + escapeAttr(c.country) + '" class="moumoa-modal-flag" />' +
        '<h3>' + escapeHtml(c.country) + '</h3>' +
      '</div>' +
      '<div class="moumoa-modal-stats">' +
        '<div class="moumoa-modal-stat"><h4>' + c.mou + '</h4><p>Memorandum of Understanding</p></div>' +
        '<div class="moumoa-modal-stat"><h4>' + c.moa + '</h4><p>Memorandum of Agreement</p></div>' +
      '</div>';

    var uniNames = Object.keys(c.universities);
    var uniHtml = '<h4 class="moumoa-modal-universities-title">Partner Institutions</h4><div class="moumoa-modal-universities-list">';
    uniNames.forEach(function (name) {
      var initials = name.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2);
      uniHtml += '<div class="moumoa-modal-university-item">';
      uniHtml += '<span class="moumoa-modal-university-placeholder">' + escapeHtml(initials) + '</span>';
      uniHtml += '<span class="moumoa-modal-university-name">' + escapeHtml(name) + '</span>';
      uniHtml += '</div>';
    });
    uniHtml += '</div>';
    unis.innerHTML = uniHtml;

    footer.innerHTML =
      '<span class="moumoa-region-tag">' + escapeHtml(c.region) + '</span>' +
      '<span class="moumoa-total-tag">Total Agreements: ' + c.total + '</span>';

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    var modal = document.getElementById('country-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  /* ---------- DROPDOWN LOGIC ---------- */
  function setupDropdowns() {
    var wrappers = document.querySelectorAll('.moumoa-control-wrapper');

    wrappers.forEach(function (wrapper) {
      var btn = wrapper.querySelector('.moumoa-control-btn');
      var menu = wrapper.querySelector('.moumoa-dropdown-menu');
      if (!btn || !menu) return;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        // Close other dropdowns
        document.querySelectorAll('.moumoa-dropdown-menu.open').forEach(function (m) {
          if (m !== menu) m.classList.remove('open');
        });
        menu.classList.toggle('open');
      });

      menu.querySelectorAll('.moumoa-dropdown-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
          e.stopPropagation();
          var value = this.getAttribute('data-value');
          menu.querySelectorAll('.moumoa-dropdown-item').forEach(function (i) { i.classList.remove('moumoa-active'); });
          this.classList.add('moumoa-active');
          menu.classList.remove('open');

          // Determine which dropdown
          if (menu.id === 'view-mode-dropdown') {
            state.viewMode = value;
            btn.innerHTML = this.innerHTML;
          } else if (menu.id === 'sort-dropdown') {
            state.sort = value;
          } else if (menu.id === 'filter-dropdown') {
            state.filter = value;
          }
          render();
        });
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function () {
      document.querySelectorAll('.moumoa-dropdown-menu.open').forEach(function (m) {
        m.classList.remove('open');
      });
    });
  }

  /* ---------- EVENT HANDLERS ---------- */
  function setupEvents() {
    // Tab navigation
    document.querySelectorAll('.moumoa-nav-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.view = this.getAttribute('data-view');
        render();
      });
    });

    // Search
    var searchInput = document.getElementById('moumoa-search');
    if (searchInput) {
      var debounceTimer;
      searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        var val = this.value;
        debounceTimer = setTimeout(function () {
          state.search = val;
          render();
        }, 250);
      });
    }

    // Modal close
    var closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    var overlay = document.getElementById('country-modal');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === this) closeModal();
      });
    }

    // Escape key closes modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    // Header scroll
    var header = document.getElementById('site-header');
    if (header) {
      window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 50);
      }, { passive: true });
    }

    // Mobile menu
    var toggle = document.getElementById('mobile-menu-toggle');
    var nav = document.getElementById('main-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('nav-open');
        toggle.classList.toggle('active');
      });
    }
  }

  /* ---------- HELPERS ---------- */
  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- INIT ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    setupEvents();
    setupDropdowns();
    render();
  });

})();
