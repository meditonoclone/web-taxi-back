const objectsToValidate = [
  { 
    selector: '#username',
    rules: ['notEmpty', 'phone']
  },
  {
      selector: '#password',
      rules: ['notEmpty', 'password']
  },
]

validate(objectsToValidate, 'error')

const socket = io();
const formLogin = document.querySelector('#loginForm');
const usernameInput = formLogin.querySelector('#username');
const passwordInput = formLogin.querySelector('#password');
// Gửi yêu cầu dữ liệu với tiêu chí cụ thể


function requestData(criteria) {
  socket.emit('checkLogin', criteria);
}

// Nhận dữ liệu từ server
socket.on('reciveError', (err) => {
  if (err) {
    if (err == 'username')
      showError(usernameInput, 'error', 'Tài khoản không tồn tại');
    if (err == 'pass')
      showError(passwordInput, 'error', 'Mật khẩu không đúng');
  } else
    formLogin.submit();
});

// GỬi dữ liệu để kiểm tra
formLogin.querySelector('.btn-login').addEventListener('click', () => {
  requestData({
    username: usernameInput.value,
    password: passwordInput.value,
  });
});