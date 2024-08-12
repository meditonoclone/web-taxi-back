const objectsToValidate = [
  {
    selector: '#phone',
    rules: ['notEmpty', 'phone']
  },
  {
    selector: '#email',
    rules: ['notEmpty', 'mail']
  },
  {
    selector: '#name',
    rules: ['notEmpty', 'name']
  },
  {
    selector: '#password',
    rules: ['notEmpty', 'password']
  },
  {
    selector: '#confirmPassword',
    rules: ['notEmpty', 'confirmPassword']

  }
]

validate(objectsToValidate, 'error')

const socket = io();
const form = document.querySelector('#registerForm');
const usernameInput = form.querySelector('#phone');
// Gửi yêu cầu dữ liệu với tiêu chí cụ thể


function requestData(criteria) {
  socket.emit('checkSignup', criteria);
}

// Nhận dữ liệu từ server
socket.on('reciveError', (err) => {

  if (err == 'exist')
    showError(usernameInput, 'error', 'Số điện thoại này đã được sử dụng');

});

form.querySelector('.btn-register').addEventListener('click', () => {
  requestData({
    phone: usernameInput.value
  });
  // confirm password

});



