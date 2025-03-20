const historyTripSwitch = document.querySelector('.trip_history>h4');
const historyTable = document.querySelector('.trip_history>table');
const chevronUp = document.querySelector('.trip_history i.fa-chevron-up');
const chevronDown = document.querySelector('.trip_history i.fa-chevron-down');
function toggleHistoryTable() {
  historyTable.classList.toggle('hide');
  chevronUp.classList.toggle('hide');
  chevronDown.classList.toggle('hide');
}
historyTripSwitch.addEventListener('click', toggleHistoryTable);

function getTrip() {
  socket.emit();
}

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
  if(!confirm('Xác nhận hủy chuyến'))
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

data.forEach(((row) => {
  var status = row.querySelector('td:last-child');
  if (status.innerText === 'booked') {
    status.addEventListener('click', () => cancel(row.querySelector('td:first-child').innerText));
  }
}))

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
          html + `
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
        <td>${row.status}</td>
      </tr>`
      , '');
      })
      .catch(error => {
        console.error('Có lỗi xảy ra:', error);
      });
  }
});

//map
const apiKey = 'UL1tI5GPwmeSZwTvU1sUg39AHw4nD7xC';
let room;
let myLocation
let driverLocation
const imgMarker = document.querySelector("#avatar").cloneNode(true);
imgMarker.style.width = '30px';  // Điều chỉnh kích thước
imgMarker.style.height = '30px';
imgMarker.style.borderRadius = '50%'
function getRealtimePosition() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        currentLocation = {
          lng: position.coords.longitude,
          lat: position.coords.latitude
        };
        if (myLocation)
          myLocation.setLngLat(currentLocation)
        else {
          myLocation = new maplibregl.Marker({
            element: imgMarker,
            draggable: false,
          })
            .setLngLat(currentLocation)
            .addTo(mapDetailTrip)
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
    return data.trip
  } catch (error) {
    console.error("Lỗi:", error);
  }
}
window.onload = async () => {
  room = await getTrip();
  getRealtimePosition();
  console.log(room)
  socket.emit('joinRoom', room.toString());
  mapDetailTrip = await initMapDetail();

}

socket.on('receiveLocation', (location) => {
  console.log('đang nhận vị trí',clientImg);
  
  if (!driverLocation)
    driverLocation = new maplibregl.Marker({
      draggable: false,
    })
      .setLngLat(location)
      .addTo(mapDetailTrip)
  driverLocation.setLngLat(location)
})
