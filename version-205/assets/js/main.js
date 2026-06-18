document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const siteNav = document.querySelector("[data-site-nav]");

  if (menuButton && siteNav) {
    menuButton.addEventListener("click", function () {
      siteNav.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const filterInput = document.querySelector("[data-filter-input]");
  const filterSelect = document.querySelector("[data-filter-select]");
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  const emptyState = document.querySelector("[data-empty-state]");

  function applyFilter() {
    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    const yearValue = filterSelect ? filterSelect.value : "";
    let visibleCount = 0;

    cards.forEach(function (card) {
      const haystack = [
        card.dataset.title || "",
        card.dataset.year || "",
        card.dataset.genre || "",
        card.dataset.region || ""
      ].join(" ").toLowerCase();
      const matchKeyword = !keyword || haystack.includes(keyword);
      const matchYear = !yearValue || (card.dataset.year || "").includes(yearValue);
      const visible = matchKeyword && matchYear;

      card.style.display = visible ? "" : "none";
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount ? "none" : "block";
    }
  }

  if (filterInput || filterSelect) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    if (query && filterInput) {
      filterInput.value = query;
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }

    if (filterSelect) {
      filterSelect.addEventListener("change", applyFilter);
    }

    applyFilter();
  }
});
