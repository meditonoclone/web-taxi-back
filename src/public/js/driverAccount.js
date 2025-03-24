const apiKey = 'UL1tI5GPwmeSZwTvU1sUg39AHw4nD7xC';
const socket = io();
const tabBar = document.createElement('div');
const orderList = document.querySelector('#orderList');
const historyTrips = document.querySelector('#historyTrips');
let currentLocation;
let mapDetailTrip;
let room;
const statusMap = {
  "en route": "Đang đón",
  "in transit": "Đang di chuyển",
  "waiting": "Đang chờ",
  "booking": "Đang đặt",
  "completed": "Hoàn thành"
};
const textBtn = {
  "en route": "Xác nhận đón",
  "in transit": "Hoàn thành",
  "waiting": "Tiếp tục chuyến"
}
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

      console.log(result)

      updateHistoryTrips();
      document.querySelector('#acceptingTrip > div').innerHTML = 
      `
      <div class="client-info">
            <img src="${result.currentTrip.profile_picture?result.currentTrip.profile_picture:''}" alt="" id="avatar">
            <div>
                <h1 id="name">${result.currentTrip.name?result.currentTrip.name:''}</h1>
                <a href="tel:${result.currentTrip.contact}" id="phone">${result.currentTrip.contact}</a>
            </div>
        </div>
        <div id="map">
        </div>
        <div class="trip-info row">
            <p class="col-sm-6 col-xs-12"><i class="fas fa-map-marker-alt"></i>Điểm đón: <span>${result.currentTrip.from_location}</span></p>
            <p class="col-sm-6 col-xs-12"><i class="fas fa-map-pin"></i>Điểm đến: <span>${result.currentTrip.to_location}</span></p>
            <p class="col-sm-6 col-xs-12"><i class="fas fa-route"></i>Quảng đường: <span id="distance">${result.currentTrip.distance?result.currentTrip.distance:''}</span></p>
            <div class="col-sm-6 col-xs-12">
                <button><i class="fas fa-pen"></i></button>
                <input type="text" name="waitingTime" placeholder="Thời gian chờ">
            </div>
            <p class="col-sm-6 col-xs-12"><i class="fas fa-money-bill-wave"></i>Số tiền: <span id="cost">${result.currentTrip.cost?result.currentTrip.cost:''}</span></p>
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
      socket.emit('joinRoom', room, 'Chuyến đã được nhận');
      mapDetailTrip = await initMapDetail();
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


let myLocation
let clientLocation
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


let clientImg = document.querySelector("#acceptingTrip #avatar");
if (!clientImg) {
  clientImg = document.createElement('img')
  clientImg.src = 'img/taxi.jpg'
}
else {
  clientImg = clientImg.cloneNode(true)
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
        if (!mapDetailTrip)
          return
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
  getRealtimePosition();
  room = await getTrip();
  console.log(room)
  if (room) {
    socket.emit('joinRoom', room.toString());
    mapDetailTrip = await initMapDetail();
  }

}

socket.on('receiveLocation', (location) => {
  console.log('đang nhận vị trí', clientImg);

  if (!clientLocation)
    clientLocation = new maplibregl.Marker({
      draggable: false,
    })
      .setLngLat(location)
      .addTo(mapDetailTrip)
  clientLocation.setLngLat(location)
})

// progress trip

async function updateTripStatus(tripId, newStatus, detailCompletedTrip) {
  try {
    const response = await fetch("/update-trip", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tripId: tripId,
        status: newStatus
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log("Cập nhật thành công:", result);
      if (result.newStatus == "completed")
        document.querySelector("#acceptingTrip > div").innerHTML = "<h2>Chuyến đang thực hiện</h2><p>Chưa nhận chuyến xe nào</p>"
      else
        modifyBtnAndStatus(result.newStatus);
      alert(result.message);
    } else {
      console.error("Lỗi cập nhật:", result);
      alert("Lỗi: " + result.message);
    }
  } catch (error) {
    console.error("Lỗi kết nối API:", error);
    alert("Lỗi kết nối đến server!");
  }
}

function modifyBtnAndStatus(status) {
  if (!textBtn.hasOwnProperty(status))
    return
  document.getElementById("btnNextStatus").innerText = textBtn[status]
  document.getElementById("status").innerText = statusMap[status]
}
// Ví dụ gọi hàm khi tài xế bấm nút
let btnNextStatus = document.getElementById("btnNextStatus")
if (btnNextStatus) {
  btnNextStatus.addEventListener("click", () => {
    const tripId = room; // ID chuyến đi

    updateTripStatus(tripId);
  });
}

// xử lí