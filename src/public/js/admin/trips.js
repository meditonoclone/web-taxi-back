var language = {
    lengthMenu: "Hiển thị _MENU_ dòng",
    search: "Tìm kiếm:",
    info: "Hiển thị _START_ đến _END_ của _TOTAL_ dòng",
    infoEmpty: "Hiển thị 0 đến 0 của 0 dòng",
    infoFiltered: "(được lọc từ _MAX_ dòng)",
    zeroRecords: "Không tìm thấy dữ liệu phù hợp",
    paginate: {
        first: "Đầu",
        previous: "Trước",
        next: "Tiếp",
        last: "Cuối"
    }
}

$(document).ready(function () {
    // Cấu hình biều đồ
    const ctx = document.getElementById('tripsChart').getContext('2d');
    const tripsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ],
            datasets: [
                {
                    stack: 1,
                    label: "Chuyến hoàn thành",
                    backgroundColor: "green",
                    borderColor: "green",
                    data: [150, 100, 112, 101, 144, 159, 178, 156, 188, 190, 210, 245],
                },
                {
                    stack: 1,
                    label: "Chuyến hủy",
                    backgroundColor: "red",
                    borderColor: "red",
                    data: [
                        50, 256, 244, 233, 210, 279, 287, 253, 287, 299, 312, 356,
                    ],
                }
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {

                legend: {
                    position: "bottom",
                },
                tooltip: {
                    callbacks: {
                        footer: (tooltipItems) => {
                            let sum = 0;

                            tooltipItems.forEach(function (tooltipItem) {
                                sum += tooltipItem.parsed.y;
                            });
                            return 'Tổng: ' + sum;
                        },
                    }
                }
            },
            title: {
                display: true,
                text: "Traffic Stats",
            },
            responsive: true,
            scales: {
                xAxes: [
                    {
                        stacked: true,
                    },
                ],
                yAxes: [
                    {
                        stacked: true,
                    },
                ],
            },
        },
    });


    const timeLabels = ['5:00-8:00', '8:00-11:00', '11:00-14:00', '14:00-17:00', '17:00-20:00', '20:00-22:00'];

    const wardsData = [
        { name: 'An Bình', data: [20, 45, 30, 50, 60, 40] },
        { name: 'Bình Da', data: [15, 40, 25, 45, 55, 35] },
        { name: 'Bửu Hòa', data: [18, 50, 28, 48, 65, 38] },
        { name: 'Bửu Long', data: [25, 60, 35, 55, 70, 45] },
        { name: 'Hiệp Hòa', data: [30, 50, 40, 60, 75, 50] },
        { name: 'Hóa An', data: [22, 42, 32, 52, 62, 42] },
        { name: 'Hòa Bình', data: [17, 47, 27, 47, 57, 37] },
        { name: 'Hố Nai', data: [20, 55, 30, 50, 65, 40] },
        { name: 'Long Bình', data: [25, 65, 35, 55, 70, 45] },
        { name: 'Long Bình Tân', data: [30, 70, 40, 60, 75, 50] },
        { name: 'Long Hưng', data: [28, 58, 38, 58, 68, 48] },
        { name: 'Phước Tân', data: [18, 48, 28, 48, 58, 38] },
        { name: 'Quang Vinh', data: [21, 51, 31, 51, 61, 41] },
        { name: 'Quyết Thắng', data: [19, 49, 29, 49, 59, 39] },
        { name: 'Tam Hiệp', data: [26, 56, 36, 56, 66, 46] },
        { name: 'Tam Hòa', data: [24, 64, 34, 54, 74, 44] },
        { name: 'Tam Phước', data: [27, 57, 37, 57, 67, 47] },
        { name: 'Tân Biên', data: [29, 59, 39, 59, 69, 49] },
        { name: 'Tân Hạnh', data: [31, 61, 41, 61, 71, 51] },
        { name: 'Tân Hiệp', data: [23, 53, 33, 53, 63, 43] },
        { name: 'Tân Hòa', data: [19, 49, 29, 49, 59, 39] },
        { name: 'Tân Mai', data: [28, 68, 38, 58, 78, 48] },
        { name: 'Tân Phong', data: [22, 62, 32, 52, 72, 42] },
        { name: 'Tân Tiến', data: [24, 54, 34, 54, 64, 44] },
        { name: 'Tân Vạn', data: [18, 58, 28, 48, 68, 38] },
        { name: 'Thanh Bình', data: [20, 50, 30, 50, 60, 40] },
        { name: 'Thống Nhất', data: [25, 55, 35, 55, 65, 45] },
        { name: 'Trảng Dài', data: [30, 70, 40, 60, 80, 50] },
        { name: 'Trung Dũng', data: [27, 67, 37, 57, 77, 47] }
    ];

    // Chuyển đổi dữ liệu để sử dụng trong Chart.js
    const datasets = wardsData.map((ward, index) => ({
        label: ward.name,
        data: ward.data,
        backgroundColor: `rgba(${50 + index * 10}, ${100 + index * 5}, ${150 - index * 5}, 0.5)`,
        borderColor: `rgba(${50 + index * 10}, ${100 + index * 5}, ${150 - index * 5}, 1)`,
        borderWidth: 1
    }));
    const taxiDemandCtx = document.getElementById('taxiDemandChart').getContext('2d');
    const taxiDemandChart = new Chart(taxiDemandCtx, {
        type: 'bar',
        data: {
            labels: timeLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Số lượng chuyến theo phường và thời gian'
                }
            },
            scales: {
                x: {
                    stacked: true // Hiển thị các nhóm
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    })

    // Cấu hình các bảng
    $("#tripsOrder").DataTable({
        language,
        ordering: true,      // Tắt sắp xếp
        info: false,         // Tắt thông tin số trang
        lengthChange: false,  // Tắt dropdown chọn số record/trang
        paginate: false
    });
    $("#tripsInProgress").DataTable({
        language,
        ordering: true,      // Tắt sắp xếp
        info: false,         // Tắt thông tin số trang
        lengthChange: false,  // Tắt dropdown chọn số record/trang
        paginate: false
    });
    $("#tripsCompleted").DataTable({
        language,
        ordering: true,      // Tắt sắp xếp
        info: false,         // Tắt thông tin số trang
        lengthChange: false,  // Tắt dropdown chọn số record/trang
        paginate: false,

    });
});
