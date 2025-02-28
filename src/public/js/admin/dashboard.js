
// load biểu đồ
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('overviewChart').getContext('2d');
    const tripsOverviewChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'], // Nhãn trên trục X
            datasets: [
                {
                    label: 'Số chuyến đã đặt',
                    data: [65, 59, 80, 81, 56, 55, 40], // Dữ liệu của dataset 1
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false,
                },
                {
                    label: 'Số chuyến hủy',
                    data: [28, 48, 40, 19, 86, 27, 90], // Dữ liệu của dataset 2
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
    const passengersCtx = document.querySelector('#passengersChart').getContext('2d');
    const passengersChart = new Chart(passengersCtx, {
        type: 'doughnut',
        data: {
            labels: ['Men', 'Women', 'Other'],
            datasets: [{
                label: '',
                data: [500, 500, 300],
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
    const bookingMedChart = new Chart(bookingMedCtx, {
        type: 'polarArea',
        data: {
            labels: ['Trực tiếp', 'Web', 'Tổng đài'],
            datasets: [{
                data: [100, 200, 150],
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
                    data: [95, 100, 112, 101, 144, 159, 178, 156, 188, 190, 210, 245],
                },
                {
                    stack: 1,
                    label: "Khách mới",
                    backgroundColor: "#fdaf4b",
                    borderColor: "#fdaf4b",
                    data: [
                        145, 256, 244, 233, 210, 279, 287, 253, 287, 299, 312, 356,
                    ],
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

