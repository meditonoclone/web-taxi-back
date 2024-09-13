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
const checkCost = bookingForm.querySelector('#checkCost');

checkCost.addEventListener('click', () => validateAll(objectsToValidate))