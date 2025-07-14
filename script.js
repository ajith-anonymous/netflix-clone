// 🔑 API config values
const apiKey = "64757c31918f955b0adce2eafb949a80";
const imgPath = "https://image.tmdb.org/t/p/w500";
const bannerImgPath = "https://image.tmdb.org/t/p/original";

let trendingMovies = [];
let currentBannerIndex = 0;
let bannerInterval;

console.log("Script loaded");

//  Initialize app on page load
function init() {
  console.log("init() called");

   // Fetching trending banner movies and build carousel
  fetchAndBuildBanner();
  
  // Fetching and build all movie sections by genre
  fetchAndBuildAllSections();
  
  // Adding sticky header effect on scroll
  window.addEventListener("scroll", handleScroll);

  // Seting active style on nav item click
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", setActiveNav);
  });

  // Adding search bar enter key event
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        searchMovies(e.target.value);
      }
    });
  }
}

//  Fetching trending movies and start carousel
function fetchAndBuildBanner() {
  fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      trendingMovies = data.results.slice(0, 5);
      buildBanner(trendingMovies[currentBannerIndex]);

      bannerInterval = setInterval(nextBanner, 5000);
    });
}

//  Building banner section for given movie
function buildBanner(movie) {
  const banner = document.getElementById("banner-section");
  banner.style.backgroundImage = `url(${bannerImgPath}${movie.backdrop_path})`;
  
   // Adding HTML content for banner
  banner.innerHTML = `
    <div class="banner-content container">
      <h2 class="banner__title">${movie.title}</h2>
      <p class="banner__info">Released - ${movie.release_date}</p>
      <p class="banner__overview">${movie.overview}</p>
    </div>
    <div class="banner_fadeBottom"></div>
    <button class="banner-btn prev-btn">❮</button>
    <button class="banner-btn next-btn">❯</button>
  `;

  // Adding event listeners for previous and next buttons
  document.querySelector(".prev-btn").addEventListener("click", () => {
    clearInterval(bannerInterval);
    prevBanner();
    bannerInterval = setInterval(nextBanner, 5000);
  });
  document.querySelector(".next-btn").addEventListener("click", () => {
    clearInterval(bannerInterval);
    nextBanner();
    bannerInterval = setInterval(nextBanner, 5000);
  });
}

//  Going to next movie in banner
function nextBanner() {
  currentBannerIndex = (currentBannerIndex + 1) % trendingMovies.length;
  buildBanner(trendingMovies[currentBannerIndex]);
}

//  Going to previous movie in banner
function prevBanner() {
  currentBannerIndex = (currentBannerIndex - 1 + trendingMovies.length) % trendingMovies.length;
  buildBanner(trendingMovies[currentBannerIndex]);
}

//  Fetching all genres and their respective movies
function fetchAndBuildAllSections() {
  fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      data.genres.forEach(genre => fetchMoviesByGenre(genre));
    });
}

//  Fetching movies by a given genre
function fetchMoviesByGenre(genre) {
  fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genre.id}`)
    .then(res => res.json())
    .then(data => buildMoviesSection(data.results, genre.name));
}

//  Building and display a movies section by genre
function buildMoviesSection(movies, title) {
  const container = document.getElementById("movies-cont");
  let html = `<div class="movies-section">
    <h2 class="movie-section-heading">${title}</h2>
    <div class="movies-row">`;

   // Adding each movie poster and title
    movies.forEach(m => {
    if (m.poster_path) {
      html += `<div class="movie-item">
        <img src="${imgPath}${m.poster_path}" alt="${m.title}">
        <p style="color: white; text-align: center; margin: 8px 0;">${m.title}</p>
      </div>`;
    }
  });

  html += `</div></div>`;
  container.innerHTML += html;
}

//  Searching for movies matching the query
function searchMovies(query) {
  if (!query.trim()) return;

  // Showing alert if query too short
  if (query.trim().length < 3) {
    alert("Please enter at least 3 characters.");
    return;
  }

  // Calling TMDB API search endpoint
  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("movies-cont");
      container.innerHTML = "";

       // Showing message if no results
      if (data.results.length === 0) {
        container.innerHTML = `<p style="color:white; text-align:center;">No results found for "${query}"</p>`;
        return;
      }

       // Building results section
      let html = `<div class="movies-section">
        <h2 class="movie-section-heading">Results for "${query}"</h2>
        <div class="movies-row">`;

      data.results.forEach(m => {
        if (m.poster_path) {
          html += `<div class="movie-item">
            <img src="${imgPath}${m.poster_path}" alt="${m.title}">
            <p style="color: white; text-align: center; margin: 8px 0;">${m.title}</p>
          </div>`;
        }
      });

      html += `</div></div>`;
      container.innerHTML = html;
    })
    .catch(err => {
      console.error("Search error:", err);
    });
}

//  Changing header background on scroll
function handleScroll() {
  const header = document.getElementById("header");
  if (window.scrollY > 5) header.classList.add("black-bg");
  else header.classList.remove("black-bg");
}

//  Set active style on clicked nav item
function setActiveNav(e) {
  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  e.target.classList.add("active");
}

//  Load everything on page load
window.onload = init;
