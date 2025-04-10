const apiKey = 'UL1tI5GPwmeSZwTvU1sUg39AHw4nD7xC';
const socket = io();
const tabBar = document.createElement('div');
const orderList = document.querySelector('#orderList');
const historyTrips = document.querySelector('#historyTrips');
let currentLocation;
let mapDetailTrip;
let routeCoords = [];
let recommendRoute = [];
let room;
let trip;
const statusMap = {
  "en route": "Đang đón",
  "in transit": "Đang di chuyển",
  "waiting": "Đang chờ",
  "booking": "Đang đặt",
  "completed": "Hoàn thành",
  "pending payment": "Xử lí thanh toán"
};
const textBtn = {
  "en route": "Xác nhận đón",
  "in transit": "Hoàn thành",
  "waiting": "Tiếp tục chuyến",
  "pending payment": "Đã thanh toán"
}
tabBar.classList.add('tab-bar');
if (screen.width > 768)
  tabBar.innerHTML =
    `<div class="tab-bar">
      <ul>
          <li class="select">Thông tin cá nhân</li>
          <li >Đơn chuyến</li>
          <li>Lịch sử chuyến</li>
          <li>Báo cáo</li>
          <li>Trạng thái chuyến đi hiện tại</li>
      </ul>
  </div>`

else
  tabBar.innerHTML =
    `<div class="tab-bar">
      <ul>
         <li class="select"><i class="fas fa-user"></i></li>
          <li><i class="fas fa-car-side"></i></li>
          <li><i class="fas fa-history"></i></li>
          <li><i class="fas fa-chart-line"></i></li>
          <li><i class="fas fa-map-marker-alt"></i></li>
      </ul>
    </div>`

var table = document.querySelector('#orderList tbody');

function addEventToTakeTripBtn() {
  const rows = table.querySelectorAll('tr');
  rows.forEach(((row) => {
    var btn = row.querySelector('td:last-child button');
    if (btn) {
      btn.addEventListener('click', () => accept({
        tripId: row.querySelector('td:first-child').innerText
      }));
    }
  }))
}

addEventToTakeTripBtn();

document.body.appendChild(tabBar);
tabBar.querySelectorAll('li').forEach((tab, index) => tab.addEventListener('click',
  (e) => {
    tabBar.querySelectorAll('li').forEach((tab) => tab.classList.remove('select'));
    tab.classList.add('select');

    document.body.querySelector('section.show').classList.remove('show');
    document.body.querySelector(`section:nth-child(${index + 2})`).classList.add('show');
  }))


socket.emit('joinRoom', 'driver');

function updateNewTrips() {
  fetch('/get-newtrips', {
    method: 'GET', // Phương thức GET
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Chuyển đổi response thành JSON
    })
    .then(data => {
      if (!Array.isArray(data) || data.length == 0) {
        orderList.querySelector('table tbody').innerHTML = `<td colspan="7">Không có chuyến nào để hiển thị</td>`
        return;
      }
      orderList.querySelector('table tbody').innerHTML = data.reduce((html, row) =>
        html + `
    <tr>
      <td>${row.trip_id}</td>
      <td>${formatDate(row.order_time)}</td>
      <td>${row.from_location}</td>
      <td>${row.to_location}</td>
      <td>${row.name ? row.name : ''}</td>
      <td>${row.contact}</td>
      <td><button class="btn btn-outline-success">Nhận chuyến</button></td>
    </tr>`
        , '');
      addEventToTakeTripBtn();
    })
    .catch(error => {
      console.error('Có lỗi xảy ra:', error);
    });
}

function updateHistoryTrips() {
  fetch('/get-history-trips', {
    method: 'GET', // Phương thức GET
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Chuyển đổi response thành JSON
    })
    .then(data => {
      if (!Array.isArray(data) || data.length == 0) {
        historyTrips.querySelector('table tbody').innerHTML = `<td colspan="11">Không có chuyến nào để hiển thị</td>`
        return;
      }
      historyTrips.querySelector('table tbody').innerHTML = data.reduce((html, row) =>
        html + `
    <tr>
      <td>${row.trip_id}</td>
      <td>${row.order_time}</td>
      <td>${row.distance}</td>
      <td>${row.waiting_minutes}</td>
      <td>${row.cost}</td>
      <td>${row.from_location}</td>
      <td>${row.to_location}</td>
      <td>${row.name}</td>
      <td>${row.phone}</td>
      <td>${row.finished_time}</td>
      <td>${statusMap[row.status]}</td>
    </tr>`
        , '');
    })
    .catch(error => {
      console.error('Có lỗi xảy ra:', error);
    });
}
// Lắng nghe sự kiện cập nhật dữ liệu từ server
socket.on('update data', function (status) {
  if (status) {
    updateNewTrips();
  }
});


// accept trip
async function accept(data) {
  fetch('/accept-trip', {
    method: 'POST', // Phương thức POST
    headers: {
      'Content-Type': 'application/json', // Định dạng dữ liệu là JSON
    },
    body: JSON.stringify(data)// Chuyển đổi đối tượng JavaScript thành chuỗi JSON
  })
    .then(response => {
      if (!response.ok) {
        console.log(response.json())
        throw new Error('Network response was not ok');
      }
      return response.json(); // Chuyển đổi response thành JSON
    })
    .then(async result => {

      trip = result.currentTrip;

      updateHistoryTrips();
      document.querySelector('#acceptingTrip > div').innerHTML =
        `
      <div class="client-info">
            <img src="${result.currentTrip.client_profile_picture ? result.currentTrip.client_profile_picture : ''}" alt="" id="avatar">
            <div>
                <h1 id="name">${result.currentTrip.name ? result.currentTrip.name : ''}</h1>
                <a href="tel:${result.currentTrip.contact}" id="phone">${result.currentTrip.contact}</a>
            </div>
        </div>
        <div id="map">
        </div>
        <div class="trip-info row">
            <p class="col-sm-6 col-xs-12"><i class="fas fa-map-marker-alt"></i>Điểm đón: <span>${result.currentTrip.from_location}</span></p>
            <p class="col-sm-6 col-xs-12"><i class="fas fa-map-pin"></i>Điểm đến: <span>${result.currentTrip.to_location}</span></p>
            <p class="col-sm-6 col-xs-12"><i class="fas fa-route"></i>Quảng đường: <span id="distance">${result.currentTrip.distance ? result.currentTrip.distance : ''}</span></p>
            <div class="col-sm-6 col-xs-12">
                <button id="setWaitingBtn"><i class="fas fa-pen"></i></button>
                <input id="waitingInput" type="text" name="waitingTime" placeholder="Thời gian chờ">
            </div>
            <p class="col-sm-6 col-xs-12"><i class="fas fa-money-bill-wave"></i>Số tiền: <span id="cost">${result.currentTrip.cost ? result.currentTrip.cost : ''}</span></p>
            <p class="col-sm-6 col-xs-12"><i class="fas fa-info-circle"></i>Trạng thái: <span id="status">${statusMap[result.currentTrip.status]}</span></p>

        </div>
        <button id="btnNextStatus" class="btn btn-success">Xác nhận đón</button>`
      let btnNextStatus = document.getElementById("btnNextStatus")

      room = result.currentTrip.trip_id.toString();
      if (btnNextStatus) {
        btnNextStatus.addEventListener("click", () => {
          const tripId = room; // ID chuyến đi

          updateTripStatus(tripId);
        });
      }
      document.querySelector('.tab-bar li:last-child').click();
      socket.emit("updateStatus", room);

      socket.emit('joinRoom', room, 'Chuyến đã được nhận');
      trip = await getTrip();
      mapDetailTrip = await initMapDetail();
      myMarker.addTo(mapDetailTrip)
      console.log(mapDetailTrip)
      return;
    })
    .catch(error => console.log('Có lỗi xảy ra: ', error))
}


table.querySelectorAll('row').forEach(((row) => {
  var status = row.querySelector('td:last-child');
  if (status.innerText === 'booked') {
    status.addEventListener('click', () => accept({
      tripId: row.querySelector('td:first-child').innerText
    }));
  }
}))


//map


let myMarker
let clientMarker
let dropOffPoint
let pickUpPoint
let driverImg = document.querySelector("#infomation #avatar");
if (!driverImg) {
  driverImg = document.createElement('img')
  driverImg.src = 'img/taxi.jpg'
}
else {
  driverImg = driverImg.cloneNode(true)
  driverImg.style.width = '30px';  // Điều chỉnh kích thước
  driverImg.style.height = '30px';
  driverImg.style.borderRadius = '50%'

}

let clientImg = document.createElement('img');
if (!clientImg) {
  clientImg = document.createElement('img')
  clientImg.src = 'img/taxi.jpg'
}
else {
  clientImg = clientImg.cloneNode(true)

}
clientImg.style.width = '30px';  // Điều chỉnh kích thước
clientImg.style.height = '30px';
clientImg.style.borderRadius = '50%'

function getRealtimePosition() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        if (position.coords.accuracy > 10) {
          console.warn("GPS kém, bỏ qua:", position.coords.accuracy);
          return;
        }
        currentLocation = {
          lng: position.coords.longitude,
          lat: position.coords.latitude
        };
        if (!mapDetailTrip)
          return
        if (myMarker)
          myMarker.setLngLat(currentLocation)
        else {
          myMarker = new maplibregl.Marker({
            element: driverImg,
            draggable: false,
          })
            .setLngLat(currentLocation)
            .addTo(mapDetailTrip)
        }
        // vẽ đường đi khi đón khách
        handlePickupRoute(trip.status, [currentLocation.lng, currentLocation.lat], [pickUpPoint._lngLat.lng, pickUpPoint._lngLat.lat])

        handleDropoffRoute(trip.status, [currentLocation.lng, currentLocation.lat], [pickUpPoint._lngLat.lng, pickUpPoint._lngLat.lat], [dropOffPoint._lngLat.lng, dropOffPoint._lngLat.lat])

        socket.emit('sendLocation', room.toString(), currentLocation)
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
async function initMapDetail() {
  let map = new maplibregl.Map({
    container: 'map',
    style: `https://tiles.openmap.vn/styles/day-v1/style.json?apikey=${apiKey}`, // stylesheet location
    center: [106.86212, 10.958527], // starting position [lng, lat]
    zoom: 13, // starting zoom
    maplibreLogo: false,
  });
  map.on("load", () => {
    map.addSource("route", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: []
      }
    });

    // Thêm layer vẽ đường
    map.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#ff6600",
        "line-width": 5
      }
    });


    map.addSource("recommendRoute", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: []
      }
    });

    // Thêm layer vẽ đường
    map.addLayer({
      id: "recommend-route-line",
      type: "line",
      source: "recommendRoute",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#ff6600",
        "line-width": 5
      }
    });
  });
  pickUpPoint = new maplibregl.Marker({
    draggable: false,
  })
    .setLngLat([trip.pickup_longitude, trip.pickup_latitude])
    .addTo(map)
  dropOffPoint = new maplibregl.Marker({
    draggable: false,
  })
    .setLngLat([trip.dropoff_longitude, trip.dropoff_latitude])
    .addTo(map)
  return map;
}
async function getTrip() {
  try {
    const response = await fetch("/get-trip");
    const data = await response.json();
    return data
  } catch (error) {
    console.error("Lỗi:", error);
  }
}
window.onload = async () => {
  trip = await getTrip();
  getRealtimePosition();
  room = trip.trip_id;
  if (room) {
    socket.emit('joinRoom', room.toString());
    mapDetailTrip = await initMapDetail();
    myMarker.addTo(mapDetailTrip);
  }

}

socket.on('receiveLocation', (location) => {
  console.log('đang nhận vị trí');

  if (!clientMarker) {
    let img = document.querySelector('#acceptingTrip #avatar')
    if (img)
      clientImg.src = img.src
    clientMarker
      = new maplibregl.Marker({
        draggable: false,
        element: clientImg
      })
        .setLngLat(location)
        .addTo(mapDetailTrip)

  }
  clientMarker
    .setLngLat(location)
})

// progress trip

async function updateTripStatus(tripId, newStatus) {
  let detailCompletedTrip
  if (trip.status === 'in transit') {
    detailCompletedTrip = {}
    detailCompletedTrip.distance = calculateTotalDistance(routeCoords);
    detailCompletedTrip.location = currentLocation;
  }
  try {
    const response = await fetch("/update-trip", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tripId: tripId,
        status: newStatus,
        detailCompletedTrip
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log("Cập nhật thành công:", result);
      socket.emit("updateStatus", room);
      if (result.newStatus == "completed") {

        document.querySelector("#acceptingTrip > div").innerHTML = "<h2>Chuyến đang thực hiện</h2><p>Chưa nhận chuyến xe nào</p>"
        mapDetailTrip;
        routeCoords = [];
        recommendRoute = [];
        room = null;
        trip = null;
      }
      else
        modifyBtnAndStatus(result.newStatus);
      trip = await getTrip();
      if (trip.cost)
        $('#acceptingTrip #cost')[0].innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trip.cost)
      routeCoords = [];
      alert(result.message);
    } else {
      console.error("Chưa được thanh toán", result);
      alert(result.message);
    }
  } catch (error) {
    console.error("Lỗi kết nối API:", error);
  }

}

function modifyBtnAndStatus(status) {
  if (!textBtn.hasOwnProperty(status))
    return
  document.getElementById("btnNextStatus").innerText = textBtn[status]
  document.getElementById("status").innerText = statusMap[status]
}

let btnNextStatus = document.getElementById("btnNextStatus")
if (btnNextStatus) {
  btnNextStatus.addEventListener("click", () => {
    const tripId = room; // ID chuyến đi

    updateTripStatus(tripId);
  });
}

// xử lí thực hiện chuyến: vẽ tuyễn đường, tính toán quãng đường, số tiền, gửi về client


function haversine(prePossition, curentPosstion) {
  const R = 6371000; // Bán kính Trái Đất (m)
  const toRad = (deg) => (deg * Math.PI) / 180; // Chuyển đổi độ sang radian

  const dLat = toRad(curentPosstion[1] - prePossition[1]);
  const dLng = toRad(curentPosstion[0] - prePossition[0]);

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(prePossition[1])) * Math.cos(toRad(curentPosstion[1])) *
    Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Khoảng cách tính bằng m
}





function interpolatePolyline(polyline, interval = 5) {


  function interpolatePoints(coord1, coord2, numPoints) {
    let [lng1, lat1] = coord1;
    let [lng2, lat2] = coord2;

    let newPoints = [];
    for (let i = 1; i < numPoints; i++) {
      let t = i / numPoints;
      let lat = lat1 + (lat2 - lat1) * t;
      let lng = lng1 + (lng2 - lng1) * t;
      newPoints.push([lng, lat]);
    }
    return newPoints;
  }

  let newPolyline = [polyline[0]]; // Bắt đầu từ điểm đầu tiên

  for (let i = 0; i < polyline.length - 1; i++) {
    let dist = haversine(polyline[i], polyline[i + 1]);

    if (dist > interval) {
      let numPoints = Math.floor(dist / interval);
      newPolyline.push(...interpolatePoints(polyline[i], polyline[i + 1], numPoints));
    }

    newPolyline.push(polyline[i + 1]);
  }

  return newPolyline;
}
function calculateTotalDistance(polyline) {

  let totalDistance = 0; // đơn vị m
  for (let i = 0; i < polyline.length - 1; i++) {
    totalDistance += haversine(polyline[i], polyline[i + 1]);
  }
  return parseFloat((totalDistance / 1000).toFixed(3));
}


async function handlePickupRoute(status, driverLocation, pickupLocation) {
  if (status !== "en route") return;
  if (routeCoords.length === 0) {
    routeCoords = await getRoute(driverLocation, pickupLocation);
  }

  updateRoute(driverLocation);
  drawRoute('route', routeCoords);
}
async function handleDropoffRoute(status, currentLocation, pickupLocation, dropoffLocation) {
  if (routeCoords.length > 1)//nếu vị trí mới cách vị trí cũ dưới 5m thì không nhận
  {
    let dif = haversine(routeCoords.at(-1), currentLocation)
    if (dif < 0.005)
      return
  }
  if (status !== "in transit") return;
  // vẽ tuyến đường gợi ý
  if (recommendRoute.length === 0) {
    recommendRoute = await getRoute(pickupLocation, dropoffLocation);
    drawRoute('recommendRoute', recommendRoute);
  }
  //vẽ đoạn đường đi thực tế
  routeCoords.push(currentLocation);
  drawRoute('route', routeCoords);
  document.querySelector('#distance').innerText = `${calculateTotalDistance(routeCoords)} km`;
  socket.emit('sendDistance', room.toString(), calculateTotalDistance(routeCoords));// gửi quãng đường đi được cho khách hàng

}

async function getRoute(driverLocation, pickupLocation) {
  const origin = `${driverLocation[1]},${driverLocation[0]}`;
  const destination = `${pickupLocation[1]},${pickupLocation[0]}`;

  const url = `https://mapapis.openmap.vn/v1/direction?origin=${origin}&destination=${destination}&vehicle=car&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const ppl = data.routes[0].overview_polyline.points;
    return polyline.decode(ppl).map(coord => [coord[1], coord[0]]);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu tuyến đường:", error);
    return [];
  }
}

function updateRoute(driverLocation) {
  let closestIndex = -1;
  let minDistance = Infinity;

  // Tìm điểm gần nhất trên tuyến đường
  for (let i = 0; i < routeCoords.length; i++) {
    const [lng, lat] = routeCoords[i];
    const distance = haversine([lng, lat], driverLocation);

    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }

  // Nếu điểm gần nhất cách tài xế dưới 20m, xóa toàn bộ đoạn trước đó
  if (closestIndex !== -1 && minDistance < 20) {
    routeCoords = routeCoords.slice(closestIndex); // Cập nhật routeCoords
  }
}


function drawRoute(sourceId, route) {
  if (mapDetailTrip.getSource(sourceId)) {
    mapDetailTrip.getSource(sourceId).setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: route }
    });
  } else {
    mapDetailTrip.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: route }
      }
    });

    mapDetailTrip.addLayer({
      id: sourceId,
      type: 'line',
      source: sourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#FF5733', 'line-width': 4 }
    });
  }
}


socket.on('paid', result => {
  if (result) {
    alert('Đã thanh toán!');
    document.querySelector("#acceptingTrip > div").innerHTML = "<h2>Chuyến đang thực hiện</h2><p>Chưa nhận chuyến xe nào</p>"

  }
})