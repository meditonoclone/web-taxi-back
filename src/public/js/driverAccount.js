
const tabBar = document.createElement('div');
const orderList = document.querySelector('#orderList');
const historyTrips = document.querySelector('#historyTrips');

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

function addEventToTakeTripBtn(){
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

const socket = io();


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
      <td>${row.name}</td>
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
      console.log(data)
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
    .then(status => {
      if (status === 'success') {
        updateHistoryTrips();
        document.querySelector('.tab-bar li:last-child').click();
        return;
      }
      alert(status);
    })
}


table.forEach(((row) => {
  var status = row.querySelector('td:last-child');
  if (status.innerText === 'booked') {
    status.addEventListener('click', () => accept({
      tripId: row.querySelector('td:first-child').innerText
    }));
  }
}))