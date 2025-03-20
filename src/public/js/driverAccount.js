const apiKey = 'UL1tI5GPwmeSZwTvU1sUg39AHw4nD7xC';
const socket = io();
const tabBar = document.createElement('div');
const orderList = document.querySelector('#orderList');
const historyTrips = document.querySelector('#historyTrips');
let currentLocation;
let mapDetailTrip;
let room;
tabBar.classList.add('tab-bar');

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
    e.target.classList.add('select');

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
      <td>${row.name?row.name:''}</td>
      <td>${row.contact}</td>
      <td>${row.status}</td>
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
      <td>${row.status}</td>
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
function accept(data) {
  fetch('/accept-trip', {
    method: 'POST', // Phương thức POST
    headers: {
      'Content-Type': 'application/json', // Định dạng dữ liệu là JSON
    },
    body: JSON.stringify(data)// Chuyển đổi đối tượng JavaScript thành chuỗi JSON
  })
    .then(response => response.json()) // Chuyển đổi phản hồi từ server thành JSON
    .then(result => {
      if (result.status === 'success') {
        updateHistoryTrips();
        document.querySelector('.tab-bar li:last-child').click();
        room = result.tripId.toString();
        socket.emit('joinRoom', result.tripId.toString(), 'Chuyến đã được nhận');
        return;
      }
    })
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


let myLocation
let clientLocation
const driverImg = document.querySelector("#infomation #avatar").cloneNode(true);
driverImg.style.width = '30px';  // Điều chỉnh kích thước
driverImg.style.height = '30px';
driverImg.style.borderRadius = '50%'
const clientImg = document.querySelector("#acceptingTrip #avatar").cloneNode(true);
if (clientImg) {

  clientImg.style.width = '30px';  // Điều chỉnh kích thước
  clientImg.style.height = '30px';
  clientImg.style.borderRadius = '50%'
}
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
            element: driverImg,
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
  
  if (!clientLocation)
    clientLocation = new maplibregl.Marker({
      draggable: false,
    })
      .setLngLat(location)
      .addTo(mapDetailTrip)
  clientLocation.setLngLat(location)
})
