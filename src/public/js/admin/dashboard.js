
// load biểu đồ
document.addEventListener('DOMContentLoaded', async function () {
    const overviewChartData = await fetChartData('overview')
    const ctx = document.getElementById('overviewChart').getContext('2d');
    const tripsOverviewChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: overviewData.months, // Nhãn trên trục X
            datasets: [
                {
                    label: 'Số chuyến đã đặt',
                    data: overviewData.booked, // Dữ liệu của dataset 1
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false,
                },
                {
                    label: 'Số chuyến hủy',
                    data: overviewData.canceled, // Dữ liệu của dataset 2
                    borderColor: 'rgb(129, 129, 129)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Month'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: ''
                    }
                }
            }
        },
    });

    const passengersData = await fetchChartData('passengers')
    const passengersCtx = document.querySelector('#passengersChart').getContext('2d');
    const passengersChart = new Chart(passengersCtx, {
        type: 'doughnut',
        data: {
            labels: ['Nam', 'Nữ', 'Chưa rõ'],
            datasets: [{
                label: '',
                data: passengersData,
                backgroundColor: [
                    'rgb(54, 162, 235)',
                    'rgb(255, 99, 132)',
                    'rgb(159, 86, 255)'
                ],
                hoverOffset: 20
            },
            ]
        },
        options: {
            maintainAspectRatio: false,
            height: 150
        }
    })

    const bookingMedCtx = document.querySelector('#bookingMedChart').getContext('2d');
    const bookingMedData = await fetchChartData('booking-method')
    const bookingMedChart = new Chart(bookingMedCtx, {
        type: 'polarArea',
        data: {
            labels: ['Trực tiếp', 'Web', 'Tổng đài'],
            datasets: [{
                data: bookingMedData,
                backgroundColor: ['rgba(255, 100, 100, 0.3)',
                    'rgba(100, 255, 100, 0.3)',
                    'rgba(100, 100, 255, 0.3)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        },
        plugins: {
            tooltip: {

            }
        }
    })


    const clientTypeData = await fetchChartData('client-type')
    const clientTypeCtx = document.querySelector('#clientTypeChart').getContext('2d');
    const clientTypeChart = new Chart(clientTypeCtx, {
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
                    label: "Khách cũ",
                    backgroundColor: "#59d05d",
                    borderColor: "#59d05d",
                    // data: [95, 100, 112, 101, 144, 159, 178, 156, 188, 190, 210, 245],
                    data: clientTypeData.old,
                },
                {
                    stack: 1,
                    label: "Khách mới",
                    backgroundColor: "#fdaf4b",
                    borderColor: "#fdaf4b",
                    data: clientTypeData.new
                }
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {

                legend: {
                    position: "bottom",
                },
            },
            title: {
                display: true,
                text: "Traffic Stats",
            },
            tooltips: {
                mode: "index",
                intersect: false,
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

});



function fetchChartData(url) {
    return new Promise((resolve, reject) => {
        fetch(`/${url}`)
            .then(response => {
                if (!response.ok) {
                    return reject('Failed to fetch chart data');
                }
                return response.json(); // Parse JSON from the response
            })
            .then(result => {
                resolve(result); // Resolve the Promise with the result
            })
            .catch(error => {
                reject(error); // Reject the Promise on error
            });
    });
}

function fetchTripStatisticsTable(time){
    fetch(`/trip-statistics?days=${time}`)
       .then(response => {
            if (!response.ok) {
                return reject('Failed to fetch trip statistics table data');
            }
            return response.json(); // Parse JSON from the response
        })
       .then(result => {
            renderTripStatisticsTable(result); // Render the table with the result
        })
       .catch(error => {
            console.error('Error fetching trip statistics table data:', error);
        });
}

async function loadTable(time){
    let table = document.querySelector('#tripStatistics')
    let data = await fetchTripStatisticsTable(time);
    const thead = table.querySelector('thead'); // Lấy phần tiêu đề
    const tbody = table.querySelector('tbody'); // Lấy phần nội dung

    // Xóa dữ liệu cũ
    thead.innerHTML = '';
    tbody.innerHTML = '';

    // Tạo hàng tiêu đề (header row)
    let headerRow = '<tr><th scope="col"></th>'; // Cột trống đầu tiên
    data.forEach(item => {
        headerRow += `<th scope="col">${item.vehicle}</th>`; // Thêm từng loại xe vào cột
    });
    headerRow += '</tr>';
    thead.innerHTML = headerRow;

    // Xây dựng các hàng dữ liệu
    const rows = [
        { label: 'Doanh thu', key: 'revenue' },
        { label: 'Số chuyến', key: 'trips' },
        { label: 'Thời gian chờ', key: 'waitings' },
        { label: 'Số khách hàng', key: 'client' }
    ];

    rows.forEach(row => {
        let rowHTML = `<tr><td>${row.label}</td>`; // Cột tên hàng
        data.forEach(item => {
            rowHTML += `<td>${item[row.key].toLocaleString()}</td>`; // Thêm dữ liệu từng cột
        });
        rowHTML += '</tr>';
        tbody.innerHTML += rowHTML;
    });
}
