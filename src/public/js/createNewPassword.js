const objectsToValidate = [
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