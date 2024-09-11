
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

tabBar.querySelectorAll('li').forEach((tab) => tab.addEventListener('click',
    (e) => {
        tabBar.querySelectorAll('li').forEach((tab) => tab.classList.remove('select'));
        e.target.classList.add('select');
    }))