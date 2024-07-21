document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
  
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const newUsername = document.getElementById('newUsername').value;
      const email = document.getElementById('email').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
  
      if (newPassword !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
      }
  
      // Ở đây, bạn sẽ thêm logic để gửi thông tin đăng ký đến server
      // Đây chỉ là một ví dụ đơn giản
      alert(`Đăng ký thành công cho ${newUsername}!`);
      // Chuyển hướng về trang đăng nhập sau khi đăng ký thành công
      window.location.href = 'logindangnhap.html';
    });
  });