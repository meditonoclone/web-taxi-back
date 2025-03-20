const apiKey = 'UL1tI5GPwmeSZwTvU1sUg39AHw4nD7xC';
const socket = io();
const vehicleType = document.querySelector('#vehicleType');
const spanCost = document.querySelector('#cost');
let map;
let directionsService;
let directionsRenderer;
let inputs = [];
let markers = [];
let route;
let currentLocation;
let mapDetailTrip;
let room;


async function reverseGeocoding(lngLat) {
    try {
        let response = await fetch(`https://mapapis.openmap.vn/v1/geocode/reverse?latlng=${lngLat.lat},${lngLat.lng}&apikey=${apiKey}`);
        let data = await response.json();
        return data.results[0].formatted_address;
    } catch (error) {
        console.error(`Lỗi chuyển đổi ${error}`);
    }
}
async function forwardGeocoding(address) {
    try {
        let response = await fetch(`https://mapapis.openmap.vn/v1/geocode/forward?address=${address}&apikey=${apiKey}`);
        let data = await response.json();
        return data.results[0].geometry.location;
    } catch (error) {
        console.error(`Lỗi chuyển đổi ${error}`);
    }
}

function createPoint(lngLat, position, map) {
    let point = new maplibregl.Marker({
        draggable: true,
    })
        .setLngLat(lngLat)
        .addTo(map)


    point.on('dragend', async function () {
        inputs[position].value = await reverseGeocoding(point.getLngLat());

        savedPosition = point.getLngLat(); // Lấy vị trí mới

    });
    map.setCenter(lngLat);

    return point;
}

async function initMap() {
    let map = new maplibregl.Map({
        container: 'map',
        style: `https://tiles.openmap.vn/styles/day-v1/style.json?apikey=${apiKey}`, // stylesheet location
        center: [106.86212, 10.958527], // starting position [lng, lat]
        zoom: 13, // starting zoom
        maplibreLogo: false,
    });

    map.on('click', async (e) => {
        if (markers.length < 2) // tạo tối đa 2 điểm
        {
            console.log(e.lngLat)
            let point = createPoint(e.lngLat, markers.length, map);
            inputs[markers.length].value = await reverseGeocoding(e.lngLat);
            inputs[markers.length].dispatchEvent(new Event("input", { bubbles: true }));

            markers.push(point);

        }
    });
    return map;
}



function setupAutocomplete(inputId, position, markers, map) {
    let input = document.getElementById(inputId);
    inputs[position] = input;
    if (!input) return;
    input.parentElement.style.position = "relative";

    let ul = document.createElement("ul");

    async function loadPlace(query) {

        try {
            let response = await fetch(`https://mapapis.openmap.vn/v1/autocomplete?input=${query}&apikey=${apiKey}`);
            let data = await response.json();
            if (!data.predictions || data.predictions.length === 0) return;
            console.log(3)
            data.predictions.forEach(place => {
                let li = document.createElement("li");
                li.classList.add("suggestion-item");
                li.textContent = place.description;
                li.onclick = async () => {
                    console.log(2)
                    input.value = place.description;
                    input.dispatchEvent(new Event("input", { bubbles: true }));

                    let lngLat = await forwardGeocoding(place.description);
                    if (!markers[position]) {
                        markers[position] = createPoint(lngLat, position, map);
                    } else {
                        markers[position].setLngLat([lngLat.lng, lngLat.lat]);
                        map.setCenter([lngLat.lng, lngLat.lat])
                    }
                    ul.innerHTML = "";
                };
                ul.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    }
    ul.classList.add("suggestions-container");
    input.parentNode.appendChild(ul);
    input.addEventListener("blur", async () => {
        let query = input.value.trim();

        await loadPlace(query);
        if (ul.firstChild)
            ul.firstChild.click();
    })
    input.addEventListener("focus", async () => {
        if (inputs.indexOf(input) !== 0 || !currentLocation)
            return
        let liCurrentLocation = await addCurrentLocationOption();

        ul.innerHTML = "";
        ul.appendChild(liCurrentLocation);
    })
    input.addEventListener("keyup", async function (e) {

        if (e.key !== " ") {
            return
        }
        let query = this.value.trim();

        ul.innerHTML = '';
        // // if (inputs.indexOf(input) === 0)

        // //     if (currentLocation) {
        // //         liCurrentLocation = addCurrentLocationOption();
        // //         ul.appendChild(liCurrentLocation);
        //     }

        loadPlace(query)

    });

    // Thêm tùy chọn "Vị trí hiện tại"
    function addCurrentLocationOption() {
        let li = document.createElement("li");
        li.classList.add("suggestion-item");
        li.textContent = "📍 Vị trí hiện tại";
        li.addEventListener("click", async () => {
            if (!markers[0]) {
                markers[0] = createPoint(currentLocation, 0, map);
            } else {
                markers[0].setLngLat([currentLocation.lng, currentLocation.lat]);
            }

            ul.innerHTML = "";
            inputs[0].value = await reverseGeocoding(currentLocation);
            input.dispatchEvent(new Event("input", { bubbles: true }));
        })
        return li;
    }

    // Ẩn danh sách khi click bên ngoài
    document.addEventListener("click", function (e) {
        if (!input.contains(e.target) && !ul.contains(e.target)) {
            ul.innerHTML = "";
        }
    });
}













function requestData(s, type) {
    console.log(s, type)
    socket.emit('getPrice', s, type);
}

async function getRoute(markers) {
    if (markers.length < 2) return;
    let origin = `${markers[0]._lngLat.lat},${markers[0]._lngLat.lng}`;
    let destination = markers
        .slice(2) // Bỏ qua markers[0] (điểm đầu) & markers[1] (điểm cuối)
        .map(marker => `${marker._lngLat.lat},${marker._lngLat.lng}`)
        .join(';'); // Nối chuỗi bằng dấu ";"

    destination = `${destination}${destination ? ';' : ''}${markers[1]._lngLat.lat},${markers[1]._lngLat.lng}`;

    const url = `https://mapapis.openmap.vn/v1/direction?origin=${origin}&destination=${destination}&vehicle=car&apikey=${apiKey}`

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.routes[0]; // Trả về tọa độ đường đi
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tuyến đường:", error);
    }
}

async function drawRoute(markers, map) {
    if (markers.length < 2) return;
    route = await getRoute(markers);
    const pll = route.overview_polyline.points;
    const decodedCoordinates = polyline.decode(pll).map(coord => [coord[1], coord[0]]); //giải mã polyline và đão tọa độ
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





async function calculateRoute() {
    if (markers.length < 2) {
        alert("Vui lòng nhập cả điểm khởi hành và điểm đến.");
        return;
    }
    await drawRoute(markers, map);
    if (route)
        requestData((route.legs[0].distance.value / 1000), vehicleType.value);
    // Nhận dữ liệu từ server

}
socket.on('receivePrice', (price) => {
    spanCost.innerText = ` - Giá: ${price} VNĐ`;
    document.getElementById('result').innerText = `Quãng đường: ${route.legs[0].distance.text}`;
});

async function initMapDetail() {
    let map = new maplibregl.Map({
        container: 'mapTrip',
        style: `https://tiles.openmap.vn/styles/day-v1/style.json?apikey=${apiKey}`, // stylesheet location
        center: [106.86212, 10.958527], // starting position [lng, lat]
        zoom: 13, // starting zoom
        maplibreLogo: false,
    });
    return map;
}

document.addEventListener("DOMContentLoaded", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Vị trí hiện tại:", position.coords);
                currentLocation = { lng: position.coords.longitude, lat: position.coords.latitude };
            },
            (error) => {
                console.error("Lỗi lấy vị trí:", error);

                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Bạn đã từ chối cấp quyền vị trí. Vui lòng kiểm tra cài đặt trình duyệt.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Không thể lấy vị trí. Hãy bật GPS và kiểm tra kết nối mạng.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Yêu cầu lấy vị trí quá lâu, thử lại hoặc di chuyển ra ngoài trời.";
                        break;
                    default:
                        errorMessage = "Lỗi không xác định khi lấy vị trí.";
                }

                alert(errorMessage);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        alert("Trình duyệt của bạn không hỗ trợ định vị.");
    }
    getRealtimePosition();

});
let myLocation

window.onload = async () => {

    map = await initMap();
    setupAutocomplete("start", 0, markers, map);
    setupAutocomplete("end", 1, markers, map);
    mapDetailTrip = await initMapDetail()
}

function getRealtimePosition() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                if (myLocation)
                    myLocation.setLngLat({
                        lng: position.coords.longitude,
                        lat: position.coords.latitude
                    })
                else {
                    myLocation = new maplibregl.Marker({
                        element: null,
                        draggable: false,
                    })
                        .setLngLat({
                            lng: position.coords.longitude,
                            lat: position.coords.latitude
                        })
                        .addTo(mapDetailTrip)
                }

                if (room) {
                    console.log(room)
                    socket.emit('sendLocation', room.toString(), {
                        lng: position.coords.longitude,
                        lat: position.coords.latitude
                    })
                }
            },
            (error) => {
                console.error("Lỗi lấy vị trí:", error);

                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Bạn đã từ chối cấp quyền vị trí. Vui lòng kiểm tra cài đặt trình duyệt.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Không thể lấy vị trí. Hãy bật GPS và kiểm tra kết nối mạng.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Yêu cầu lấy vị trí quá lâu, thử lại hoặc di chuyển ra ngoài trời.";
                        break;
                    default:
                        errorMessage = "Lỗi không xác định khi lấy vị trí.";
                }

                alert(errorMessage);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        alert("Trình duyệt của bạn không hỗ trợ định vị.");
    }
}



let driverLocation
socket.on('receiveLocation', (location) => {
    if (!driverLocation)
        driverLocation = new maplibregl.Marker({
            draggable: false,
        })
            .setLngLat(location)
            .addTo(mapDetailTrip)
    driverLocation.setLngLat(location)
})

document.addEventListener('DOMContentLoaded', async () => {
    room = await getTrip(); // vào lại phòng nếu đẫ đặt chuyến trước đó
    if (room) {
        socket.emit('joinRoom', room.toString())
        document.querySelector('button[data-target="#detailTrip"]').style.display = 'block'
    }
    console.log(room)
})