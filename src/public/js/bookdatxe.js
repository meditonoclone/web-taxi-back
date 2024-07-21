document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Ở đây bạn sẽ thêm logic để gửi dữ liệu đặt xe
    
    // Hiển thị thông báo
    var messageDiv = document.getElementById('bookingMessage');
    messageDiv.style.display = 'block';
    messageDiv.innerHTML = 'Đặt xe thành công! Chúng tôi sẽ liên hệ với bạn sớm.';
    messageDiv.style.color = 'green';
    
    // Xóa thông báo sau 5 giây
    setTimeout(function() {
      messageDiv.style.display = 'none';
    }, 5000);
  });