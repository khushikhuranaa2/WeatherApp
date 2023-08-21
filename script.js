const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const minMaxTemp = document.getElementById("minMaxTemp");
const feelsLike = document.getElementById("feelsLike");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const uvIndex = document.getElementById("uvIndex");
const dateTime = document.getElementById("dateTime");
const weatherType = document.getElementById("weatherType");
const cityNameElement = document.getElementById("cityName");
//const forecastContainer = document.querySelector(".forecast-container");
//const hforecastContainer = document.querySelector(".hourly-forecast-container");
const mapContainer = document.getElementById("mapContainer");

const queryParams = new URLSearchParams(window.location.search);
const city = queryParams.get("city")

if (city) {
    cityName.textContent = city;

    //fetching weather data using OpenWeatherMap API
    const apiKey = "04661450cfbf63cefbfa122c4b05b36a";
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const fiveDayForecastContainer = document.getElementById("fiveDayForecastContainer");
    const fiveDayForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    const hourlyForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    const weatherIconContainer = document.getElementById("weatherIcon");

    const weatherImages = {
        "01d": "images/clear_sky.png",
        "01n": "images/clear_sky.png",
        "02d": "images/few_clouds_day.png",
        "02n": "images/few_clouds_night.png",
        "03d": "images/scattered_clouds.png",
        "03n": "images/scattered_clouds.png",
        "04d": "images/overcast_clouds.png",
        "04n": "images/overcast_clouds.png",
        "09d": "images/shower_rain.png",
        "09n": "images/shower_rain.png",
        "10d": "images/rain.png",
        "10n": "images/rain.png",
        "11d": "images/thunderstorm.png",
        "11n": "images/thunderstorm.png",
        "13d": "images/snow.png",
        "13n": "images/snow.png",
        "50d": "images/haze.png",
        "50n": "images/haze.png"
    };

    fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {

        const weatherConditionCode = data.weather[0].icon;
        const customImagePath = weatherImages[weatherConditionCode];

        if (customImagePath) {
            // Creating an image element for the custom weather image
            const weatherImage = document.createElement("img");
            weatherImage.src = customImagePath;
            weatherImage.alt = "Weather Image";

            weatherIconContainer.appendChild(weatherImage);
        }

        temperature.textContent = `${Math.round(data.main.temp)}°C`;
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${data.wind.speed} km/h`;
        minMaxTemp.textContent = `${Math.round(data.main.temp_min)}° / ${Math.round(data.main.temp_max)}°`;
        feelsLike.textContent = `${Math.round(data.main.feels_like)}°`;

        const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        sunrise.textContent = sunriseTime.toUpperCase();
        sunset.textContent = sunsetTime.toUpperCase();

        const currentDateTime = new Date();
        const dateTimeOptions = { 
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
        };
        const formattedDateTime = currentDateTime.toLocaleString(undefined, dateTimeOptions);
        const capitalizedDateTime = formattedDateTime.replace(/\b(am|pm)\b/g, match => match.toUpperCase());

        dateTime.textContent = capitalizedDateTime;

        weatherType.textContent = data.weather[0].description;

        //5 days forecast
        fetch(fiveDayForecastUrl)
        .then(response => response.json())
        .then(fiveDayData => {
            fiveDayForecastContainer.innerHTML = "";

            const forecasts = fiveDayData.list;
            let currentDate = "";

            forecasts.forEach(forecast => {
                const forecastDate = new Date(forecast.dt * 1000);
                const date = forecastDate.toLocaleString("en-US", { month: "short", day: "numeric" });

            if (date !== currentDate) {
                const dayOfWeek = forecastDate.toLocaleString("en-US", { weekday: "short" });
                const weatherIcon = forecast.weather[0].icon;
                const temperature = forecast.main.temp;

                const forecastItem = document.createElement("div");
                forecastItem.classList.add("forecast-item");

                forecastItem.innerHTML = `
                    <div class="day-line">${dayOfWeek}, ${date}</div>
                    <div class="icon-line"><img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="Weather Icon"></div>
                    <div class="temperature-line">${temperature}°C</div>
                `;

                fiveDayForecastContainer.appendChild(forecastItem);
                currentDate = date;
            }
            });
        })

        //hourly forecast chart
        function createHourlyForecastChart(hourlyData) {
            const hourlyTemperatures = hourlyData.map(forecast => forecast.main.temp);
            const hourlyTimes = hourlyData.map(forecast => {
                const forecastDate = new Date(forecast.dt * 1000);
                return forecastDate.toLocaleString("en-US", { hour: "numeric" });
            });
        
            const ctx = document.getElementById("hourlyChart").getContext("2d");
            new Chart(ctx, {
                type: "line",
                data: {
                    labels: hourlyTimes,
                    datasets: [{
                        label: "Hourly Temperature",
                        data: hourlyTemperatures,
                        borderColor: "rgba(75, 192, 192, 1)",
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderWidth: 1,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                        },
                    },
                },
            });
        }

        fetch(hourlyForecastUrl)
        .then(response => response.json())
        .then(hourlyData => {
            createHourlyForecastChart(hourlyData.list);
        })
        .catch(error => {
            console.error("Error fetching hourly forecast data:", error);
        });

        // const toggleButton = document.getElementById("toggleUnits");
        // let isFahrenheit = false;

        // function toggleTemperatureUnits() {
        //     isFahrenheit = !isFahrenheit;
        //     updateTemperatureUnits();
        //     updateForecastUnits();
        // }

        // function updateTemperatureUnits() {
        //     const celsiusTemp = data.main.temp;
        //     if (isFahrenheit) {
        //         const fahrenheitTemp = celsiusToFahrenheit(celsiusTemp);
        //         temperature.textContent = `${Math.round(fahrenheitTemp)}°F`;
        //     } else {
        //         temperature.textContent = `${Math.round(celsiusTemp)}°C`;
        //     }
        //     // Update other temperature-related elements similarly
        // }


        // const map = L.map(mapContainer).setView([data.coord.lat, data.coord.lon], 13);
        // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        // L.marker([data.coord.lat, data.coord.lon]).addTo(map)
        //     .bindPopup(city + ' Weather').openPopup();

      })
      .catch(error => {
            console.error("Error fetching weather data:", error);
        });
    }