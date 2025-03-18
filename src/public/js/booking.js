const bookingForm = document.querySelector('#bookingForm');
const checkCost = bookingForm.querySelector('#checkCost');
async function getTrip() {
  try {
    const response = await fetch("/get-trip");
    const data = await response.json();
    return data.trip
  } catch (error) {
    console.error("Lỗi:", error);
  }
}
const bookTaxi = async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  for (const [key, value] of formData.entries()) {
    console.log(key, value); // Xem có dữ liệu không
}
  
  const response = await fetch("/book-taxi", {
    method: "POST",
    body: formData
  });

  const result = await response.json();

  if (result.success) {
    alert( "🚖 Đặt chuyến thành công!")
    let room = await getTrip();
    socket.emit('joinRoom', room.toString())
  } else {
    alert( "❌ Lỗi: " + result.message)
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

validate(bookingForm, objectsToValidate, 'error', bookTaxi)



checkCost.addEventListener('click', () => validateAll(objectsToValidate))