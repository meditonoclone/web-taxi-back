document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.contact_form form');
    const nameInput = form.querySelector('input[placeholder="Họ và tên"]');
    const phoneInput = form.querySelector('input[placeholder="Số điện thoại"]');
    const messageInput = form.querySelector('input[placeholder="Tin nhắn"]');
    const submitButton = form.querySelector('button');
  
    function showNotification(message, isSuccess) {
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
      }, 3000);
    }
  
    function validateForm() {
      if (!nameInput.value.trim()) {
        showNotification('Vui lòng nhập họ và tên', false);
        return false;
      }
      if (!phoneInput.value.trim()) {
        showNotification('Vui lòng nhập số điện thoại', false);
        return false;
      }
      if (!messageInput.value.trim()) {
        showNotification('Vui lòng nhập tin nhắn', false);
        return false;
      }
      return true;
    }
  
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (validateForm()) {
        showNotification('Tin nhắn của bạn đã được gửi thành công!', true);
        form.reset();
      }
    });
  });