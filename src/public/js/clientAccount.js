const historyTripSwitch = document.querySelector('.trip_history>h4');
const historyTable = document.querySelector('.trip_history>table');
const chevronUp = document.querySelector('.trip_history i.fa-chevron-up');
const chevronDown = document.querySelector('.trip_history i.fa-chevron-down');
const statusMap = {
  "en route": "Đang đón",
  "in transit": "Đang di chuyển",
  "waiting": "Đang chờ",
  "booking": "Đang đặt",
  "completed": "Hoàn thành"
};

function toggleHistoryTable() {
  historyTable.classList.toggle('hide');
  chevronUp.classList.toggle('hide');
  chevronDown.classList.toggle('hide');
}
historyTripSwitch.addEventListener('click', toggleHistoryTable);



function loadTrips(table, data) {
  var tbody = '';
  data.forEach(trip => {
    tbody += `
      
        <tr>
          <td>${trip.trip_id}</td>
          <td>${trip.order_time}</td>
          <td>${trip.vehicle_type}</td>
          <td>${trip.distance}</td>
          <td>${trip.waiting_minutes}</td>
          <td>${trip.cost}</td>
          <td>${trip.from_location}</td>
          <td>${trip.to_location}</td>
          <td>${trip.name}</td>
          <td>${trip.phone}</td>
          <td>${trip.status}</td>
      </tr>
    `;
  })
  table.querySelector('tbody').innerHTML = tbody;
}
function cancel(e) {
  if (!confirm('Xác nhận hủy chuyến'))
    return;
  fetch('/delete-trip', {
    method: 'POST', // Phương thức POST
    headers: {
      'Content-Type': 'application/json', // Định dạng dữ liệu là JSON
    },
    body: JSON.stringify({
      tripId: e
    })// Chuyển đổi đối tượng JavaScript thành chuỗi JSON
  })
    .then(response => response.json()) // Chuyển đổi phản hồi từ server thành JSON
    .then(status => {
      if (status === 'success')
        // Tải lại trang hiện tại
        location.reload();

    })
}

var data = historyTable.querySelectorAll('tbody tr');



const socket = io();
const table = document.querySelector('.trip_history table');
socket.on('update data', function (status) {
  if (status) {
    fetch('/get-history-trips', {
      method: 'GET',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Chuyển đổi response thành JSON
      })
      .then(data => {
        if (!Array.isArray(data) || data.length == 0) {
          table.querySelector('tbody').innerHTML = `<td colspan="11">Không có chuyến nào để hiển thị</td>`
          return;
        }
        table.querySelector('tbody').innerHTML = data.reduce((html, row) =>
        {
          if(row.tripId = room){

          }
          return html + `
      <tr>
        <td>${row.trip_id}</td>
        <td>${formatDate(row.order_time)}</td>
        <td>${row.vehicle_type}</td>
        <td>${row.distance}</td>
        <td>${row.waiting_minutes}</td>
        <td>${row.cost}</td>
        <td>${row.from_location}</td>
        <td>${row.to_location}</td>
        <td>${row.name}</td>
        <td>${row.phone}</td>
        <td>${statusMap[row.status]}</td>
      </tr>`
        }
          , '');
      })
      .catch(error => {
        console.error('Có lỗi xảy ra:', error);
      });
  }
});

//map
const apiKey = 'UL1tI5GPwmeSZwTvU1sUg39AHw4nD7xC';
let map;
let trip;
let room;
let myMarker
let driverMarker
let clientMarker
let dropOffPoint
let pickUpPoint
let imgMarker = document.querySelector("#avatar");
if (!imgMarker) {
  imgMarker = document.createElement('img')
  imgMarker.src = 'img/taxi.jpg'
}
else{
  imgMarker = imgMarker.cloneNode(true)
  imgMarker.style.width = '30px';  // Điều chỉnh kích thước
  imgMarker.style.height = '30px';
  imgMarker.style.borderRadius = '50%'

}

let imgDriverMarker = document.querySelector("#driverAvatar");
if (!imgDriverMarker) {
  imgDriverMarker = document.createElement('img')
  imgDriverMarker.src = 'img/taxi.jpg'
  imgDriverMarker.style.width = '30px';  // Điều chỉnh kích thước
  imgDriverMarker.style.height = '30px';
  imgDriverMarker.style.borderRadius = '50%'  
}
else{
  imgDriverMarker = imgDriverMarker.cloneNode(true)
  imgDriverMarker.style.width = '30px';  // Điều chỉnh kích thước
  imgDriverMarker.style.height = '30px';
  imgDriverMarker.style.borderRadius = '50%'

}
function getRealtimePosition() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        if(!map) return;
        currentLocation = {
          lng: position.coords.longitude,
          lat: position.coords.latitude
        };
        if (myMarker)
          myMarker.setLngLat(currentLocation)
        else {
          myMarker = new maplibregl.Marker({
            element: imgMarker,
            draggable: false,
          })
            .setLngLat(currentLocation)
            .addTo(map)
        }
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
  if(trip)
  {
    room = trip.trip_id;
    map = await initMapDetail();
    getRealtimePosition();
    socket.emit('joinRoom', room.toString());
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

  }

}

socket.on('receiveLocation', (location) => {
  console.log('đang nhận vị trí');

  if (!driverMarker)
    driverMarker = new maplibregl.Marker({
      element: imgDriverMarker,
      draggable: false,
    })
      .setLngLat(location)
      .addTo(map)
  driverMarker.setLngLat(location)
  handleDropoffRoute(trip.status, [location.lng, location.lat])
})


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

function calculateTotalDistance(polyline) {

  let totalDistance = 0; // đơn vị m
  for (let i = 0; i < polyline.length - 1; i++) {
    totalDistance += haversine(polyline[i], polyline[i + 1]);
  }
  return parseFloat((totalDistance / 1000).toFixed(3));
}


async function getRoute(startLocation, endLocation) {
  const origin = `${startLocation[1]},${startLocation[0]}`;
  const destination = `${endLocation[1]},${endLocation[0]}`;

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
function drawRoute(sourceId, route) {
  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: route }
    });
  } else {
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: route }
      }
    });

    map.addLayer({
      id: sourceId,
      type: 'line',
      source: sourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#FF5733', 'line-width': 4 }
    });
  }
}
socket.on('message', message => {
  alert(message);
})

socket.on('getDriverInfo', async info => {
  if(info){
    console.log(info)
    document.querySelector('.client-info').innerHTML = `
    <img src=${info.img} alt="" id="driverAvatar">
    <div>
        <h4 id="name">${info.name}</h4>
        <a href="tel:${info.phone}" id="phone">${info.phone}</a>
    </div>
    `
   

  }
})

socket.on("updateStatus", async result => {
  if(result)
    trip = await getTrip()
  if(trip.status === 'completed')
  {
    driverName = document.querySelector('#acceptingTrip #name');
    openModal(driverName, trip.driver_id, trip.trip_id)
  }
})

async function handleDropoffRoute(status, driverLocation) {
  if (status !== "in transit") return;
  
  //vẽ đoạn đường đi thực tế
  routeCoords.push(driverLocation);
  drawRoute('route', routeCoords);
  document.querySelector('#distance').innerText = `${calculateTotalDistance(routeCoords)} km`;
}

/// modal rating
let selectedRating = 0;
let ratingModal;

// Khởi tạo modal Bootstrap
document.addEventListener("DOMContentLoaded", () => {
    ratingModal = new bootstrap.Modal(document.getElementById("ratingModal"));
});

// Hiển thị modal khi chuyến đi hoàn thành
function openModal(driverName, driverId, tripId) {
    document.getElementById("driverName").innerText = driverName;
    document.getElementById("ratingModal").dataset.driverId = driverId;
    document.getElementById("ratingModal").dataset.tripId = tripId;
    resetStars();
    ratingModal.show();
}

// Đặt số sao khi chọn
function setRating(rating) {
    selectedRating = rating;
    let stars = document.querySelectorAll("#ratingModal .star i");
    stars.forEach((star, index) => {
        star.style.color = index < rating ? "gold" : "gray";
    });
}

// Reset số sao khi mở lại modal
function resetStars() {
    selectedRating = 0;
    let stars = document.querySelectorAll("#ratingModal .star i");
    stars.forEach(star => star.style.color = "gray");
}

// Gửi đánh giá lên server
function submitRating() {
    let driverId = document.getElementById("ratingModal").dataset.driverId;
    let tripId = document.getElementById("ratingModal").dataset.tripId;
    let reviewText = document.getElementById("reviewText").value;

    if (selectedRating === 0) {
        alert("Vui lòng chọn số sao!");
        return;
    }

    fetch("/rate-driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, tripId, rating: selectedRating, comment: reviewText })
    })
    .then(response => response.json())
    .then(data => {
        alert("Đánh giá thành công!");
        ratingModal.hide();
    })
    .catch(error => console.error("Lỗi:", error));
}
