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
            let response = await fetch(`https://mapapis.openmap.vn/v1/autocomplete?input=${query}&apikey=UL1tI5GPwmeSZwTvU1sUg39AHw4nD7xC`);
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


function requestData(s, type) {
    socket.emit('getPrice', s, type);
}




async function initMap() {
    map = new new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.openmap.vn/styles/day-v1/style.json?apikey=UL1tI5GPwmeSZwTvU1sUg39AHw4nD7xC', // stylesheet location
        center: [106.8427, 10.9574], // starting position [lng, lat]
        zoom: 9 // starting zoom
      });



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
