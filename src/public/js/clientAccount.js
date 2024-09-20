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