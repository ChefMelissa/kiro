document.addEventListener('DOMContentLoaded', function () {
  var search = document.getElementById('storySearch');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-story-card]'));
  var empty = document.getElementById('noResults');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.topic-filter, .lesson-filter'));
  var selected = 'all';

  function normalize(value) {
    return (value || '').trim().toLowerCase();
  }

  function updateButtons() {
    buttons.forEach(function (button) {
      var active = (button.getAttribute('data-lesson') || 'all') === selected;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function filterStories() {
    if (!cards.length) return;
    var query = normalize(search && search.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var lesson = normalize(card.getAttribute('data-category'));
      var show = (!query || text.indexOf(query) !== -1) && (selected === 'all' || lesson === selected);
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (empty) empty.classList.toggle('hidden', visible !== 0);
    updateButtons();
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      selected = button.getAttribute('data-lesson') || 'all';
      filterStories();
    });
  });

  if (search) search.addEventListener('input', filterStories);
  filterStories();
});
