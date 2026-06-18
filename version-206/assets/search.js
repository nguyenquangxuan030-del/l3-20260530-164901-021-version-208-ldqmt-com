(function () {
  var input = document.getElementById('movie-search-input');
  var results = document.getElementById('movie-search-results');
  var clearButton = document.getElementById('movie-search-clear');
  var movies = window.MOVIE_INDEX || [];

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function render(items) {
    if (!results) {
      return;
    }

    if (!items.length) {
      results.innerHTML = '<div class="movie-article"><h2>未找到匹配影片</h2><p>可以尝试输入年份、地区、类型或更短的片名关键词。</p></div>';
      return;
    }

    results.innerHTML = items.slice(0, 120).map(function (movie) {
      return [
        '<a class="search-result-item" href="./' + movie.page + '">',
        '  <img src="./' + movie.image + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">',
        '  <span>',
        '    <strong>' + movie.title + '</strong>',
        '    <p>' + movie.year + ' · ' + movie.region + ' · ' + movie.genre + '</p>',
        '  </span>',
        '  <span class="primary-btn">查看</span>',
        '</a>'
      ].join('');
    }).join('');
  }

  function runSearch() {
    var keyword = normalize(input ? input.value : '');

    if (!keyword) {
      render(movies.slice(0, 60));
      return;
    }

    var matched = movies.filter(function (movie) {
      return normalize(movie.search).indexOf(keyword) !== -1;
    });

    render(matched);
  }

  if (input) {
    input.addEventListener('input', runSearch);

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      input.value = query;
    }
  }

  if (clearButton && input) {
    clearButton.addEventListener('click', function () {
      input.value = '';
      input.focus();
      runSearch();
    });
  }

  runSearch();
})();
