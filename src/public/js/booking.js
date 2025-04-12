const bookingForm = document.querySelector('#bookingForm');
const checkCost = bookingForm.querySelector('#checkCost');
async function getTrip() {
  try {
    const response = await fetch("/get-trip");
    const data = await response.json();
    return data
  } catch (error) {
    console.error("Lỗi:", error);
  }
}
const bookTaxi = async () => {
  
  const formData = new FormData(bookingForm);
  const pickupLatitude = markers[0].getLngLat().lat;
  const pickupLongitude = markers[0].getLngLat().lng;
  const dropoffLatitude = markers[1].getLngLat().lat;
  const dropoffLongitude = markers[1].getLngLat().lng;

  // Thêm tọa độ vào FormData
  formData.append("pickup_latitude", pickupLatitude);
  formData.append("pickup_longitude", pickupLongitude);
  formData.append("dropoff_latitude", dropoffLatitude);
  formData.append("dropoff_longitude", dropoffLongitude);


  const response = await fetch("/book-taxi", {
    method: "POST",
    body: formData
  });

  const result = await response.json();

  if (result.success) {
    alert("🚖 Đặt chuyến thành công!")
    trip = await getTrip();
    window.location.href = '/account'

  } else {
    alert("❌ Lỗi: " + result.message)
  }
}
const objectsToValidate = [
  {
    selector: '#start',
    rules: ['notEmpty']
  },
  {
    selector: '#end',
    rules: ['notEmpty']
  },
  {
    selector: '#phone',
    rules: ['notEmpty', 'phone']
  }
]

validate(bookingForm, objectsToValidate, 'error', sendOTP)



checkCost.addEventListener('click', () => validateAll(objectsToValidate))


socket.on('message', message => {
  alert(message);
})


async function sendOTP(e)
{
  e.preventDefault();
  let phone = document.querySelector('#phone').value;
  fetch('/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }) 
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));

}



document.getElementById('otpForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const otpCode = document.getElementById('otpInput').value;
  const phoneNumber = document.getElementById('phone').value;

  fetch('/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneNumber, otp: otpCode })
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert('✅ Xác thực thành công!');
          var otpModal = $('#otpModal');
          otpModal.modal('hide');
          bookTaxi();
      } else {
          alert('❌ OTP không hợp lệ, vui lòng thử lại!');
      }
  })
  .catch(error => console.error('Lỗi:', error));
});