const apiKey = 'UL1tI5GPwmeSZwTvU1sUg39AHw4nD7xC'

async function reverseGeocoding(lngLat){
    try{
        let response = await fetch(`https://mapapis.openmap.vn/v1/geocode/reverse?latlng=${lngLat.lat},${lngLat.lng}&apikey=${apiKey}`);
        let data = await response.json();
        return data.results[0].formatted_address;
    } catch(error){
        console.error(`Lỗi chuyển đổi ${error}`);
    }
}
async function forwardGeocoding(address){
    try{
        let response = await fetch(`https://mapapis.openmap.vn/v1/geocode/forward?address=${address}&apikey=${apiKey}`);
        let data = await response.json();
        return data.results[0].geometry.location;
    } catch(error){
        console.error(`Lỗi chuyển đổi ${error}`);
    }
}

function setupAutocomplete(inputId) {
    let input = document.getElementById(inputId);
    if (!input) return;
    input.parentElement.style.position = "relative"
    let ul = document.createElement("ul");
    ul.classList.add("suggestions-container");
    input.parentNode.appendChild(ul);

    input.addEventListener("input", async function () {
        let query = this.value.trim();
        if (query.length < 2) {
            ul.innerHTML = "";
            return;
        }

        try {
            let response = await fetch(`https://mapapis.openmap.vn/v1/autocomplete?input=${query}&apikey=${apiKey}`);
            let data = await response.json();
            ul.innerHTML = "";
            if (!data.predictions || data.predictions.length === 0) return;
            
            data.predictions.forEach(place => {
                let li = document.createElement("li");
                li.classList.add("suggestion-item");
                li.textContent = place.description;
                li.onclick = () => {
                    input.value = place.description;
                    ul.innerHTML = "";
                };
                ul.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    });

    document.addEventListener("click", function (e) {
        if (!input.contains(e.target) && !ul.contains(e.target)) {
            ul.innerHTML = "";
        }
    });
}


setupAutocomplete("start");
setupAutocomplete("end");

const socket = io();
const vehicleType = document.querySelector('#vehicleType');
const spanCost = document.querySelector('#cost');
let map;
let directionsService;
let directionsRenderer;
let startInput;
let endInput;
let endPoint;
let startPoint;
let route;
function requestData(s, type) {
    socket.emit('getPrice', s, type);
}
function createPoint(lngLat){
    let point = new maplibregl.Marker({
        draggable: true,
    })
        .setLngLat(lngLat)
        .addTo(map)

    point.on('dragend', function () {
        savedPosition = point.getLngLat(); // Lấy vị trí mới
        console.log("Marker đã di chuyển đến:", savedPosition);
        drawRoute();

    });
    return point;
}
async function getRoute(start, end) {
    const url = `https://mapapis.openmap.vn/v1/direction?origin=${start._lngLat.lat},${start._lngLat.lng}&destination=${end._lngLat.lat},${end._lngLat.lng}&vehicle=car&apikey=${apiKey}`

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.routes[0]; // Trả về tọa độ đường đi
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tuyến đường:", error);
    }
}

async function drawRoute() {
    if (!endPoint || !startPoint) return;
    route = await getRoute(startPoint, endPoint);
    const pll = route.overview_polyline.points;
    const decodedCoordinates = polyline.decode(pll).map(coord => [coord[1], coord[0]]); //giải mã polyline và đão tọa độ
    console.log(decodedCoordinates);
    if (map.getSource('route')) {
        map.getSource('route').setData({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: decodedCoordinates
            }
        });
    } else {
        map.addSource('route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: decodedCoordinates
                }
            }
        });

        map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route', // Trỏ đến nguồn dữ liệu đã tạo
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#FF5733',
                'line-width': 4
            }
        });
    }
}

async function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.openmap.vn/styles/day-v1/style.json?apikey=UL1tI5GPwmeSZwTvU1sUg39AHw4nD7xC', // stylesheet location
        center: [106.86212, 10.958527], // starting position [lng, lat]
        zoom: 13, // starting zoom
        maplibreLogo: false,
    });

    map.on('click', (e) => {
        if (!startPoint) {
            startPoint = createPoint(e.lngLat);

        } else if (!endPoint) {
            endPoint = createPoint(e.lngLat)
            drawRoute();
        }
    });

}



async function calculateRoute() {
    if (!route) {
        alert("Vui lòng nhập cả điểm khởi hành và điểm đến.");
        return;
    }
    document.getElementById('result').innerText = `Quãng đường: ${route.legs[0].distance.text}`;
    requestData((route.legs[0].distance.value/1000), vehicleType.value);
    // Nhận dữ liệu từ server
    socket.on('recivePrice', (price) => {
        spanCost.innerText = ` - Giá: ${price} VNĐ`;
    });
    
}

window.onload = initMap;
