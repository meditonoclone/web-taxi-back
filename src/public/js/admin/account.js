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
$(document).ready(() => {
    $('#clientTable').DataTable({
        language,
        ordering: true,      
        info: true,         // Tắt thông tin số trang
        lengthChange: false,  // Tắt dropdown chọn số record/trang
        paginate: true,
        pageLenght: 20,
    });
})