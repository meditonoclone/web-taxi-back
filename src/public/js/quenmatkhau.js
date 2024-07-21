document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  
    forgotPasswordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
  
      // Ở đây, bạn sẽ thêm logic để gửi yêu cầu đặt lại mật khẩu
      // Đây chỉ là một ví dụ đơn giản
      alert(`Yêu cầu đặt lại mật khẩu đã được gửi đến ${email}`);
    });
  });