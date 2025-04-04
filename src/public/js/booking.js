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
const bookTaxi = async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
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
    room = trip.trip_id;
    socket.emit('joinRoom', room.toString())
    document.querySelector('button[data-target="#detailTrip"]').style.display = 'block'

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

validate(bookingForm, objectsToValidate, 'error', bookTaxi)



checkCost.addEventListener('click', () => validateAll(objectsToValidate))


socket.on('message', message => {
  alert(message);
})


