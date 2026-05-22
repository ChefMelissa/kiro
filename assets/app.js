// Story search and filter
document.addEventListener('DOMContentLoaded', function () {
  var search = document.getElementById('storySearch');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-story-card]'));
  var empty = document.getElementById('noResults');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var selected = 'all';

  function normalize(val) {
    return (val || '').trim().toLowerCase();
  }

  function filter() {
    if (!cards.length) return;
    var query = normalize(search ? search.value : '');
    var count = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var cat = normalize(card.getAttribute('data-category'));
      var show = (!query || text.indexOf(query) !== -1) && (selected === 'all' || cat === selected);
      card.style.display = show ? '' : 'none';
      if (show) count++;
    });
    if (empty) empty.style.display = count === 0 ? '' : 'none';
    buttons.forEach(function (btn) {
      var val = btn.getAttribute('data-filter') || 'all';
      btn.classList.toggle('btn-primary', val === selected);
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      selected = btn.getAttribute('data-filter') || 'all';
      filter();
    });
  });
  if (search) search.addEventListener('input', filter);
  filter();
});

// Cookie consent
(function () {
  if (localStorage.getItem('cookie_consent')) return;
  var banner = document.getElementById('cookieBanner');
  if (!banner) return;
  banner.classList.add('visible');
  document.getElementById('cookieAccept').addEventListener('click', function () {
    localStorage.setItem('cookie_consent', 'accepted');
    banner.classList.remove('visible');
  });
  document.getElementById('cookieReject').addEventListener('click', function () {
    localStorage.setItem('cookie_consent', 'rejected');
    banner.classList.remove('visible');
  });
})();
