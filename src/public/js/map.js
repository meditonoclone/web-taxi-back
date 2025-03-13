const apiKey = 'UL1tI5GPwmeSZwTvU1sUg39AHw4nD7xC'
const socket = io();
const vehicleType = document.querySelector('#vehicleType');
const spanCost = document.querySelector('#cost');
let map;
let directionsService;
let directionsRenderer;
let inputs = []
let markers = []
let route;

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

function setupAutocomplete(inputId, position) {
    let input = document.getElementById(inputId);
    inputs[position] = input;
    if (!input) return;
    input.parentElement.style.position = "relative";

    let ul = document.createElement("ul");
    ul.classList.add("suggestions-container");
    input.parentNode.appendChild(ul);

    input.addEventListener("input", async function () {
        let query = this.value.trim();
        ul.innerHTML = "";

        // Nếu input rỗng hoặc ít hơn 2 ký tự thì hiển thị "Vị trí hiện tại"
        if (query.length < 2) {
            addCurrentLocationOption();
            return;
        }

        try {
            let response = await fetch(`https://mapapis.openmap.vn/v1/autocomplete?input=${query}&apikey=${apiKey}`);
            let data = await response.json();
            if (!data.predictions || data.predictions.length === 0) return;

            data.predictions.forEach(place => {
                let li = document.createElement("li");
                li.classList.add("suggestion-item");
                li.textContent = place.description;
                li.onclick = async () => {
                    input.value = place.description;
                    let lngLat = await forwardGeocoding(place.description);
                    if (!markers[position]) {
                        markers[position] = createPoint(lngLat, position);
                    } else {
                        markers[position].setLngLat([lngLat.lng, lngLat.lat]);
                    }
                    ul.innerHTML = "";
                };
                ul.appendChild(li);
            });

            // Luôn hiển thị lựa chọn "Vị trí hiện tại" đầu tiên
            addCurrentLocationOption();
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    });

    // Thêm tùy chọn "Vị trí hiện tại"
    function addCurrentLocationOption() {
        let li = document.createElement("li");
        li.classList.add("suggestion-item");
        li.textContent = "📍 Vị trí hiện tại";
        li.onclick = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    console.log(1);
                    let { latitude, longitude } = position.coords;
                    input.value = forwardGeocoding({ latitude, longitude });

                    let lngLat = { lng, lat };
                    if (!markers[position]) {
                        markers[position] = createPoint(lngLat, position);
                    } else {
                        markers[position].setLngLat([longitude, latitude]);
                    }

                    ul.innerHTML = "";
                }, (error) => {
                    console.error("Lỗi lấy vị trí:", error);
                    alert("Không thể lấy vị trí hiện tại.");
                },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                alert("Trình duyệt của bạn không hỗ trợ định vị.");
            }
        };
        ul.prepend(li);
    }

    // Ẩn danh sách khi click bên ngoài
    document.addEventListener("click", function (e) {
        if (!input.contains(e.target) && !ul.contains(e.target)) {
            ul.innerHTML = "";
        }
    });
}


// function setupAutocomplete(inputId, position) {
//     let input = document.getElementById(inputId);
//     inputs[position] = input;
//     if (!input) return;
//     input.parentElement.style.position = "relative"
//     let ul = document.createElement("ul");
//     ul.classList.add("suggestions-container");
//     input.parentNode.appendChild(ul);

//     input.addEventListener("input", async function () {
//         let query = this.value.trim();
//         if (query.length < 2) {
//             ul.innerHTML = "";
//             return;
//         }

//         try {
//             let response = await fetch(`https://mapapis.openmap.vn/v1/autocomplete?input=${query}&apikey=${apiKey}`);
//             let data = await response.json();
//             ul.innerHTML = "";
//             if (!data.predictions || data.predictions.length === 0) return;

//             data.predictions.forEach(place => {
//                 let li = document.createElement("li");
//                 li.classList.add("suggestion-item");
//                 li.textContent = place.description;
//                 li.onclick = async () => {
//                     input.value = place.description;
//                     let lngLat = await forwardGeocoding(place.description)
//                     if (!markers[position])
//                         markers[position] = createPoint(lngLat, position)
//                     else
//                         markers[position].setLngLat([lngLat.lng, lngLat.lat])

//                     ul.innerHTML = "";
//                 };
//                 ul.appendChild(li);
//             });
//         } catch (error) {
//             console.error("Error fetching suggestions:", error);
//         }
//     });

//     document.addEventListener("click", function (e) {
//         if (!input.contains(e.target) && !ul.contains(e.target)) {
//             ul.innerHTML = "";
//         }
//     });
// }
setupAutocomplete("start", 0);
setupAutocomplete("end", 1);




function requestData(s, type) {
    socket.emit('getPrice', s, type);
}
function createPoint(lngLat, position) {
    let point = new maplibregl.Marker({
        draggable: true,
    })
        .setLngLat(lngLat)
        .addTo(map)

    point.on('dragend', async function () {
        inputs[position].value = await reverseGeocoding(point.getLngLat());
        savedPosition = point.getLngLat(); // Lấy vị trí mới

        drawRoute();

    });
    return point;
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

async function drawRoute() {
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

async function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: `https://tiles.openmap.vn/styles/day-v1/style.json?apikey=${apiKey}`, // stylesheet location
        center: [106.86212, 10.958527], // starting position [lng, lat]
        zoom: 13, // starting zoom
        maplibreLogo: false,
    });

    map.on('click', async (e) => {
        if (markers.length < 2) // tạo tối đa 2 điểm
        {
            let point = createPoint(e.lngLat, markers.length);
            inputs[markers.length].value = await reverseGeocoding(e.lngLat);
            markers.push(point);

        }
    });

}



async function calculateRoute() {
    if (markers.length < 2) {
        alert("Vui lòng nhập cả điểm khởi hành và điểm đến.");
        return;
    }
    drawRoute();
    document.getElementById('result').innerText = `Quãng đường: ${route.legs[0].distance.text}`;
    requestData((route.legs[0].distance.value / 1000), vehicleType.value);
    // Nhận dữ liệu từ server
    socket.on('recivePrice', (price) => {
        spanCost.innerText = ` - Giá: ${price} VNĐ`;
    });

}

window.onload = initMap;
