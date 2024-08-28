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

validate(objectsToValidate, 'error')

const bookingForm = document.querySelector('#bookingForm');
