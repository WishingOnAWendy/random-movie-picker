const apiKey = '44d93654566b22634575a4d0673b06b8'; // Replace with your actual TMDb API key


let shownMovies = []; // Array to keep track of shown movies

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

// Function to fetch all pages of movie data from TMDb API
async function fetchMovies() {
    const genre1 = document.getElementById("genre1").value;
    const genre2 = document.getElementById("genre2").value;
    const rating = document.getElementById("rating").value;
    const releaseYear = document.getElementById("release-year").value;

    const baseUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genre1},${genre2}&vote_average.gte=${rating}&primary_release_date.gte=${releaseYear}-01-01&sort_by=popularity.desc&language=en-US`;
    const movies = [];

    try {
        // First request to get the total number of results
        const totalResultsResponse = await fetch(`${baseUrl}&page=1`);
        const totalResultsData = await totalResultsResponse.json();
        const totalPages = totalResultsData.total_pages;

        // Fetch all pages
        for (let i = 1; i <= totalPages; i++) {
            const response = await fetch(`${baseUrl}&page=${i}`);
            const data = await response.json();
            movies.push(...data.results);
        }

        // Filter out already shown movies
        const uniqueMovies = movies.filter(movie => !shownMovies.includes(movie.id));
        return uniqueMovies;
    } catch (error) {
        console.error('Error fetching movie data:', error);
        displayErrorMessage("Error fetching movie data. Please try again later.");
        return [];
    }
}

// Function to truncate text to 5 lines if needed
function truncateText(text, maxLines) {
    const lineHeight = 1.5; // Assuming the line height is 1.5em
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'nowrap';
    div.style.width = '100%';
    div.style.lineHeight = `${lineHeight}em`;
    div.style.fontSize = '16px'; // Match the font size used in the description
    div.style.fontFamily = 'Roboto, sans-serif'; // Match the font family used in the description
    document.body.appendChild(div);
    div.innerHTML = text;

    let truncatedText = text;
    while (div.offsetHeight / parseFloat(getComputedStyle(div).lineHeight) > maxLines) {
        truncatedText = truncatedText.slice(0, -1);
        div.innerHTML = truncatedText + '...';
    }

    const needsEllipsis = div.offsetHeight / parseFloat(getComputedStyle(div).lineHeight) > maxLines;
    document.body.removeChild(div);
    return needsEllipsis ? truncatedText + '...' : text;
}

// Function to display movie details on the web app page
function displayMovie(movie) {
    const movieDisplay = document.getElementById("movie-display");
    movieDisplay.style.opacity = 0; // Start fade-out effect
    setTimeout(() => {
        const truncatedOverview = truncateText(movie.overview, 5);
        movieDisplay.innerHTML = `
            <h2>${movie.title} (${movie.release_date.slice(0, 4)})</h2>
            <a href="https://www.themoviedb.org/movie/${movie.id}" target="_blank">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            </a>
            <p class="description">${truncatedOverview}</p>
        `;
        movieDisplay.style.opacity = 1; // Start fade-in effect
    }, 300); // Duration of the fade-out effect
}

// Function to display error message on the web app page
function displayErrorMessage(message) {
    const movieDisplay = document.getElementById("movie-display");
    movieDisplay.innerHTML = `<p>${message}</p>`;
}

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to roll through movies before selecting the final one
async function rollMovies() {
    let movies = await fetchMovies();
    if (movies.length === 0) {
        displayErrorMessage("No movies match the selected criteria.");
        return;
    }

    // Shuffle the array of movies
    shuffleArray(movies);

    let rollCount = 5; // Number of times to roll
    const rollInterval = 200; // Interval between rolls in milliseconds
    let currentIndex = 0;

    const rollIntervalId = setInterval(() => {
        const movie = movies[currentIndex];
        displayMovie(movie);
        currentIndex = (currentIndex + 1) % movies.length;
        rollCount--;
        if (rollCount === 0) {
            clearInterval(rollIntervalId);
            // Pick the final movie
            const randomIndex = Math.floor(Math.random() * movies.length);
            const randomMovie = movies[randomIndex];
            displayMovie(randomMovie);
            shownMovies.push(randomMovie.id); // Add to shown movies
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

// Event listener to reset shown movies when filters are changed
document.querySelectorAll('#filters select').forEach(select => {
    select.addEventListener('change', () => {
        shownMovies = []; // Reset shown movies
    });
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