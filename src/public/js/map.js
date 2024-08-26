
{/* <h1>Tìm đường với Google Maps</h1>
<input id="start" type="text" placeholder="Điểm khởi hành">
<input id="end" type="text" placeholder="Điểm đến">
<button onclick="calculateRoute()">Tìm đường</button>
<div id="map"></div>
<div id="result"></div> */}
const socket = io();
const vehicleType = document.querySelector('#vehicleType');
const spanCost = document.querySelector('#cost');
let map;
let directionsService;
let directionsRenderer;
let startInput;
let endInput;


function requestData(s, type) {
    socket.emit('getPrice', s, type);
}




async function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 10.9574, lng: 106.8426 }, // Vị trí trung tâm bản đồ (Biên Hòa, Việt Nam)
        zoom: 7,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: false,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        }

    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    startInput = document.getElementById('start');
    endInput = document.getElementById('end');

    new google.maps.places.Autocomplete(startInput);
    new google.maps.places.Autocomplete(endInput);
}

async function calculateRoute() {
    const start = startInput.value;
    const end = endInput.value;
    document.getElementById('result').innerText = `Quãng đường: ${3}`;
                requestData(distance, vehicleType.value);
                // Nhận dữ liệu từ server
                socket.on('recivePrice', (price) => {
                    spanCost.innerText = `Giá: ${price} VNĐ`;
                });
    if (!start || !end) {
        alert("Vui lòng nhập cả điểm khởi hành và điểm đến.");
        return;
    }

    directionsService.route(
        {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);
                const distance = response.routes[0].legs[0].distance.text;
                document.getElementById('result').innerText = `Quãng đường: ${distance}`;
                requestData(distance, vehicleType.value);
                // Nhận dữ liệu từ server
                socket.on('recivePrice', (price) => {
                    spanCost.innerText = `Giá: ${price} VNĐ`;
                });
            } else {
                alert('Không tìm thấy đường: ' + status);
            }
        }
    );
}

window.onload = initMap;

