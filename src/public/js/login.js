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

const formLogin = document.querySelector('#loginForm');
const usernameInput = formLogin.querySelector('#username');
const passwordInput = formLogin.querySelector('#password');

function login() {
  const formData = new FormData(formLogin);
  fetch('/login', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData))
  })
    .then(response => response.json())  // Xử lý response thành JSON
    .then(data => {
      if(data.phone)
        showError(usernameInput, 'error', 'Tài khoản không tồn tại');
      else if(data.pass)
        showError(passwordInput, 'error', 'Mật khẩu không đúng');
      else 
        window.location.pathname = "/";
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Đã có lỗi xảy ra!');  // Thông báo khi có lỗi xảy ra
    });
}





