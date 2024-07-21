document.addEventListener('DOMContentLoaded', function() {
    function showNotification(message, isSuccess, duration = 3000) {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${isSuccess ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 1000;
      `;
  
      document.body.appendChild(notification);
  
      setTimeout(function() {
        document.body.removeChild(notification);
      }, duration);
    }
  
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
  
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="text"]');
        const email = emailInput.value.trim();
  
        if (!email) {
          showNotification('Vui lòng nhập địa chỉ email', false);
        } else if (!validateEmail(email)) {
          showNotification('Vui lòng nhập một địa chỉ email hợp lệ', false);
        } else {
          showNotification('Bạn đã đăng ký nhận bản tin thành công!', true);
          this.reset();
        }
      });
    }
  });