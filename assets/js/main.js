const BASE_URL = 'http://api.openweathermap.org/data/2.5/forecast/daily';
const APP_ID = '2d538d5a0c3ed45b51a87ffa00ee4ba8';

const weekDays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
const cities = [
    {
        id: 6455259,
        name: 'Paris',
    },
    {
        id: 2643743,
        name: 'London',
    },
];

let selectedDayIndex = 0;

function generateURL(queryParams) {
    let queryString = '';
    
    for (var queryParam in queryParams) {
        if (queryParams.hasOwnProperty(queryParam)) {
            queryString += `&${queryParam}=${queryParams[queryParam]}`;
        }
    }
    
    const defaultParams = `?appid=${APP_ID}&units=metric`
    
    return `${BASE_URL}${defaultParams}${queryString}`;
}

function call(url, params = {}) {
    return fetch(url, params);
}

function handleError(error) {
    console.error(error);
}

function makeRequestByCoords(coords) {
    const url = generateURL(coords);
    
    return call(url);
}

function makeRequestByCityID(id) {
    const url = generateURL({ id });
    
    return call(url);
}

function getCityName(data) {
    if (data && data.city) {
        return data.city.name;
    }
    
    return '';
}

function parseWeatherData(list) {
    return list.map(dayCard);
}

function showLoader() {
    const loader = document.getElementById('loader');
    
    loader.className = 'shown';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    
    loader.className = 'hidden';
}

function appendCity(data) {
    const { city } = data;
    
    const citiesContainer = document.getElementById('cities-dropdown');
    
    const newCityOption = document.createElement('option');
    newCityOption.value = city.id;
    newCityOption.textContent = city.name;
    
    citiesContainer.appendChild(newCityOption);
    
    citiesContainer.value = city.id;
}

function renderWeatherData(res, shouldAppendCity = false) {
    showLoader();
    
    const response = res.json();
    
    response
        .then(data => {
            hideLoader();
            
            if (shouldAppendCity) {
                appendCity(data);
            }
            
            const cityName = document.createElement('h1');
            cityName.textContent = getCityName(data);
            
            const details = document.getElementById('weather-details');
            details.innerHTML = '';
            details.appendChild(cityName);
            
            const cards = parseWeatherData(data.list);
            
            cards.forEach(card => {
                details.append(card);
            });
        })
        .catch(handleError);
}

function handleCityChange(event) {
    const id = event.target.value;
    
    makeRequestByCityID(id)
        .then(renderWeatherData)
        .catch(handleError);
}

function handleDefaultCity() {
    const citiesContainer = document.getElementById('cities-dropdown');
    const id = citiesContainer.value;
    
    makeRequestByCityID(id)
        .then(renderWeatherData)
        .catch(handleError);
}

function generateDropdown() {
    const dropdown = document.createElement('select');
    dropdown.id = 'cities-dropdown';
    dropdown.addEventListener('change', handleCityChange);
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        
        dropdown.appendChild(option);
    });
    
    const citiesContainer = document.getElementById('cities');
    citiesContainer.append(dropdown);
}

function hideAllActiveCards() {
    const app = document.getElementById('weather-app');
    const activeCards = app.getElementsByClassName('active');
    
    for (let i = 0; i < activeCards.length; i++) {
        activeCards[i].classList.remove('active');
    }
}

function highlightCard(event) {
    hideAllActiveCards();
    
    // store selected day index
    selectedDayIndex = parseInt(event.currentTarget.dataset.index, 10);
    
    event.currentTarget.classList.add('active');
}

function dayCard(item, index) {
    const div = document.createElement('div');
    div.className = 'day-card';
    div.dataset.index = index;
    
    if (index === selectedDayIndex) {
        div.classList.add('active');
    }
    
    div.addEventListener('click', highlightCard)
    
    const title = document.createElement('h3');
    title.textContent = formatDate(item.dt);
    
    const temperature = document.createElement('p');
    temperature.textContent = formatTemparature(item.temp.eve);
    
    div.appendChild(title);
    div.appendChild(temperature);
    
    return div;
}

function formatTemparature(temp) {
    return `${temp} C`;
}

function formatDate(timestamp) {
    const unixTimestamp = timestamp * 1000;
    
    const dateObj = new Date(unixTimestamp);
    
    const weekDay = weekDays[dateObj.getDay()];
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    
    return `${weekDay} - ${day} ${month}`;
}

function init() {
    if ('geolocation' in navigator) {
        
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                
                showLoader();
                
                if (coords) {
                    const { latitude: lat, longitude: lon } = coords;
                    
                    const userCoords = {
                        lat,
                        lon,
                    };
                    
                    makeRequestByCoords(userCoords)
                        .then(res => {
                            // passing shouldAppendCity = true to append city into dropdown got from geolocation
                            renderWeatherData(res, true);
                        })
                        .catch(handleError);
                }
            },
            handleError,
        );
    }
    
    generateDropdown();
    
    handleDefaultCity();
}

init();
