(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function startHeroTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
      startHeroTimer();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(activeIndex - 1);
      startHeroTimer();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(activeIndex + 1);
      startHeroTimer();
    });
  }

  startHeroTimer();

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));

  filterInputs.forEach(function (input) {
    var section = input.closest('section');
    var grid = section ? section.querySelector('[data-card-grid]') : null;
    var yearSelect = section ? section.querySelector('[data-year-filter]') : null;

    function applyFilter() {
      if (!grid) {
        return;
      }

      var keyword = input.value.trim().toLowerCase();
      var year = yearSelect ? yearSelect.value : '';
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        card.style.display = matchKeyword && matchYear ? '' : 'none';
      });
    }

    input.addEventListener('input', applyFilter);

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
  });
})();
