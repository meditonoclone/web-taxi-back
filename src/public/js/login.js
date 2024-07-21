document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('rememberMe');

  // Kiểm tra nếu có thông tin đăng nhập đã lưu
  if (localStorage.getItem('rememberedUser')) {
    const rememberedUser = JSON.parse(localStorage.getItem('rememberedUser'));
    usernameInput.value = rememberedUser.username;
    passwordInput.value = rememberedUser.password;
    rememberMeCheckbox.checked = true;
  }

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = usernameInput.value;
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    // Xử lý đăng nhập ở đây (ví dụ: gửi request đến server)

    // Nếu đăng nhập thành công và người dùng chọn "Lưu thông tin đăng nhập"
    if (rememberMe) {
      localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
    } else {
      localStorage.removeItem('rememberedUser');
    }

    // Giả lập đăng nhập thành công
    alert('Đăng nhập thành công!');
  });
});