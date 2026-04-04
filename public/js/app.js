async function loadNews() {
  const res = await fetch('../content/news/news.json');
  const news = await res.json();

  const container = document.getElementById('news');

  news.forEach(article => {
    container.innerHTML += `
      <div class="card">
        <h3>${article.title}</h3>
        <p>${article.date}</p>
      </div>
    `;
  });
}

loadNews();
