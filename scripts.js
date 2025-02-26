const apiKey = "YOUR_WEATHERAPI_KEY"; // Replace with your valid API key
const searchBtn = document.getElementById("searchBtn");
const weatherCard = document.getElementById("weatherCard");

window.onload = () => {
    console.log("Page loaded, checking geolocation...");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            console.log("Geolocation success:", position.coords);
            getWeatherByCoords(position.coords.latitude, position.coords.longitude);
        }, error => {
            console.warn("Geolocation error:", error);
            alert("Location access denied. Please search manually.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
};

searchBtn.addEventListener("click", () => {
    const city = document.getElementById("cityInput").value.trim();
    console.log("Search button clicked, city entered:", city);
    if (city) {
        getWeather(city);
    } else {
        alert("Please enter a city name");
    }
});

async function getWeather(city) {
    console.log("Fetching weather for city:", city);
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
    await fetchWeather(url);
}

async function getWeatherByCoords(lat, lon) {
    console.log(`Fetching weather for coordinates: lat=${lat}, lon=${lon}`);
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;
    await fetchWeather(url);
}

async function fetchWeather(url) {
    try {
        console.log("Making API request to:", url);
        const response = await fetch(url);

        if (!response.ok) {
            console.error("HTTP Error:", response.status);
            alert("Error fetching weather data. Please try again.");
            return;
        }

        const data = await response.json();
        console.log("API Response Data:", data);

        if (data.error) {
            console.error("API Error:", data.error.message);
            alert("City not found. Please try again.");
            return;
        }

        // Ensure the data structure is valid before updating UI
        if (data.location && data.current) {
            console.log("Weather data received, updating UI...");
            document.getElementById("cityName").innerText = `${data.location.name}, ${data.location.country}`;
            document.getElementById("temp").innerText = `Temperature: ${data.current.temp_c}°C`;
            document.getElementById("description").innerText = data.current.condition.text;
            document.getElementById("humidity").innerText = data.current.humidity;
            document.getElementById("wind").innerText = data.current.wind_kph;
            document.getElementById("weatherIcon").src = `https:${data.current.condition.icon}`;

            // Ensure the weather card is visible
            weatherCard.classList.remove("d-none");
            weatherCard.classList.add("show-card");

            changeBackground(data.current.condition.text);
        } else {
            console.error("Invalid API Response Structure", data);
            alert("Unexpected data format from API. Please try again.");
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("Error fetching data. Please check your internet connection.");
    }
}


async function changeBackground(weather) {
    const body = document.body;
    let query;

    if (weather.includes("Sunny") || weather.includes("Clear")) {
        query = "sunny sky";
    } else if (weather.includes("Cloudy") || weather.includes("Overcast")) {
        query = "clouds";
    } else if (weather.includes("Rain") || weather.includes("Drizzle")) {
        query = "rainy sky";
    } else if (weather.includes("Snow")) {
        query = "snowy landscape";
    } else {
        query = "weather";
    }

    // Use Pexels API to get a relevant image
    const apiKey = "YOUR_PEXELS_API_KEY"; // Replace with your Pexels API key
    const url = `https://api.pexels.com/v1/search?query=${query}&per_page=1`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: apiKey }
        });

        if (!response.ok) {
            console.error("Pexels API Error:", response.status);
            return;
        }

        const data = await response.json();

        if (data.photos.length > 0) {
            // Use the highest resolution image available
            body.style.background = `url('${data.photos[0].src.original}')`;
            body.style.backgroundSize = "cover";
            body.style.backgroundPosition = "center";
            body.style.backgroundRepeat = "no-repeat";
            body.style.transition = "background 1s ease-in-out";
        } else {
            console.error("No images found for query:", query);
        }
    } catch (error) {
        console.error("Error fetching background image:", error);
    }
}
