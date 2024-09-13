
const tabBar = document.createElement('div');

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

document.body.appendChild(tabBar);

tabBar.querySelectorAll('li').forEach((tab, index) => tab.addEventListener('click',
        (e) => {
        tabBar.querySelectorAll('li').forEach((tab) => tab.classList.remove('select'));
        e.target.classList.add('select');

        document.body.querySelector('section.show').classList.remove('show');
        document.body.querySelector(`section:nth-child(${index + 2})`).classList.add('show');
    }))

//accept trip
function accept(data) {
    console.log('cc')
    fetch('/accept-trip', {
      method: 'POST', // Phương thức POST
      headers: {
        'Content-Type': 'application/json', // Định dạng dữ liệu là JSON
      },
      body: JSON.stringify(data)// Chuyển đổi đối tượng JavaScript thành chuỗi JSON
    })
      .then(response => response.json()) // Chuyển đổi phản hồi từ server thành JSON
      .then(status => {
        if (status === 'success')
            document.querySelector('.tab-bar li:last-child').click();  
        console.log(status);
      })
  }
  
  var table = document.querySelectorAll('#orderList tbody tr');
  
  table.forEach(((row) => {
    var status = row.querySelector('td:last-child');
    if (status.innerText === 'booked') {
      status.addEventListener('click', () => accept({
        tripId: row.querySelector('td:first-child').innerText
      }));
    }
  }))