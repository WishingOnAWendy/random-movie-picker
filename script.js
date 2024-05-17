const apiKey = '44d93654566b22634575a4d0673b06b8'; // Replace with your actual TMDb API key

// Function to fetch genre list from TMDb API
async function fetchGenres() {
    const genreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;

    try {
        const response = await fetch(genreUrl);
        const data = await response.json();
        const genres = data.genres;

        // Update genre select dropdowns with fetched genre list
        updateGenreDropdowns(genres);
    } catch (error) {
        console.error('Error fetching genre list:', error);
    }
}

// Function to update genre select dropdowns with fetched genre list
function updateGenreDropdowns(genres) {
    const genreSelect1 = document.getElementById("genre1");
    const genreSelect2 = document.getElementById("genre2");

    genres.forEach(genre => {
        const option1 = document.createElement("option");
        option1.text = genre.name;
        option1.value = genre.id;
        genreSelect1.add(option1);

        const option2 = document.createElement("option");
        option2.text = genre.name;
        option2.value = genre.id;
        genreSelect2.add(option2);
    });
}

// Function to fetch movie data from TMDb API
async function fetchMovies() {
    const genre1 = document.getElementById("genre1").value;
    const genre2 = document.getElementById("genre2").value;
    const rating = document.getElementById("rating").value;
    const releaseYear = document.getElementById("release-year").value;

    const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genre1},${genre2}&vote_average.gte=${rating}&primary_release_date.gte=${releaseYear}-01-01&sort_by=popularity.desc&language=en-US&page=1`;

    try {
        const response = await fetch(movieUrl);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching movie data:', error);
        displayErrorMessage("Error fetching movie data. Please try again later.");
        return [];
    }
}

// Function to display movie details on the web app page
function displayMovie(movie) {
    const movieDisplay = document.getElementById("movie-display");
    movieDisplay.style.opacity = 0; // Start fade-out effect
    setTimeout(() => {
        movieDisplay.innerHTML = `
            <h2>${movie.title} (${movie.release_date.slice(0, 4)})</h2>
            <a href="https://www.themoviedb.org/movie/${movie.id}" target="_blank">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            </a>
            <p>${movie.overview}</p>
        `;
        movieDisplay.style.opacity = 1; // Start fade-in effect
    }, 300); // Duration of the fade-out effect
}

// Function to display error message on the web app page
function displayErrorMessage(message) {
    const movieDisplay = document.getElementById("movie-display");
    movieDisplay.innerHTML = `<p>${message}</p>`;
}

// Function to roll through movies before selecting the final one
async function rollMovies() {
    const movies = await fetchMovies();
    if (movies.length === 0) {
        return;
    }

    const filteredMovies = movies.filter(movie => {
        const genre1 = document.getElementById("genre1").value;
        const genre2 = document.getElementById("genre2").value;
        const rating = document.getElementById("rating").value;
        const releaseYear = document.getElementById("release-year").value;
        return (movie.genre_ids.includes(parseInt(genre1)) || movie.genre_ids.includes(parseInt(genre2))) &&
            movie.vote_average >= rating &&
            parseInt(movie.release_date.slice(0, 4)) >= releaseYear;
    });

    if (filteredMovies.length === 0) {
        displayErrorMessage("No movies match the selected criteria.");
        return;
    }

    let rollCount = 5; // Number of times to roll
    const rollInterval = 200; // Interval between rolls in milliseconds
    let currentIndex = 0;

    const rollIntervalId = setInterval(() => {
        const movie = filteredMovies[currentIndex];
        displayMovie(movie);
        currentIndex = (currentIndex + 1) % filteredMovies.length;
        rollCount--;
        if (rollCount === 0) {
            clearInterval(rollIntervalId);
            // Pick the final movie
            const randomIndex = Math.floor(Math.random() * filteredMovies.length);
            const randomMovie = filteredMovies[randomIndex];
            displayMovie(randomMovie);
        }
    }, rollInterval);
}

// Event listener for the "Generate Random Movie" button
document.getElementById("generate-btn").addEventListener("click", function() {
    var button = document.getElementById("generate-btn");
    button.classList.add("active");
    setTimeout(function() {
        button.classList.remove("active");
    }, 300); // Remove "active" class after 300 milliseconds
    rollMovies();
});

// Populate genre select dropdowns with genre list from TMDb API when the page loads
window.addEventListener("load", fetchGenres);

// Populate rating select dropdown with values from 1 to 10
const ratingSelect = document.getElementById("rating");
for (let i = 1; i <= 10; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = `At least ${i}`;
    ratingSelect.add(option);
}

// Populate release year select dropdown with values from the current year to 1900
const currentYear = new Date().getFullYear();
const releaseYearSelect = document.getElementById("release-year");
for (let year = currentYear; year >= 1900; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.text = `No older than ${year}`;
    releaseYearSelect.add(option);
}