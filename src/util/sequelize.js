module.exports = {
    resultsToObject: function (results, type) {
        if(type === 'model')
            return results.map((item)=>item.dataValues)
        else{
            if(results.length === 0) return
            return results.map((item)=>item[0]());
        }
    },
    resultToObject: function (result, type) {
        if(type === 'model')
            return { ...result.dataValues };
        else{
            if(result.length === 0 || !result) return
            return (result[0]);
        }

    },
    addProp: function (obj, prop) {
        
        Object.assign(obj, prop);
    },
    validateUserData:  function (userData) {
        // Helper function to trim and validate each field
        function validateField(value, validator) {
            const trimmedValue = (typeof value === 'string') ? value.trim() : value;
            return validator(trimmedValue) ? trimmedValue : null;
        }

        // Validation rules
        const rules = {
            email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            name: value => {
                const vietnameseNameRegex = /^[A-ZĂÂĐÊÔƠƯÁẮẤÉẾÍÓỐỚÚỨÝÀẰẦÈỀÌÒỒỜÙỪỲẢẲẨẺỂỈỎỔỞỦỬỶÃẴẪẼỄĨÕỖỠŨỮỸẠẶẬẸỆỊỌỘỢỤỰỴ][a-zăâđêôơưáắấéếíóốớúứýàằầèềìòồờùừỳảẳẩẻểỉỏổởủửỷãẵẫẽễĩõỗỡũữỹạặậẹệịọộợụựỵ]+(\s[A-ZĂÂĐÊÔƠƯÁẮẤÉẾÍÓỐỚÚỨÝÀẰẦÈỀÌÒỒỜÙỪỲẢẲẨẺỂỈỎỔỞỦỬỶÃẴẪẼỄĨÕỖỠŨỮỸẠẶẬẸỆỊỌỘỢỤỰỴ][a-zăâđêôơưáắấéếíóốớúứýàằầèềìòồờùừỳảẳẩẻểỉỏổởủửỷãẵẫẽễĩõỗỡũữỹạặậẹệịọộợụựỵ]+)+$/;
                return vietnameseNameRegex.test(value) && !/\s{2,}/.test(value);
            },
            phone: value => /^0\d{9}$/.test(value),
            password: value => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value)
        };

        // Validate each field
        const validatedData = {
            email: validateField(userData.email, rules.email),
            name: validateField(userData.name, rules.name),
            phone: validateField(userData.phone, rules.phone),
            password: validateField(userData.password, rules.password)
        };

        // Check if all fields are valid
        const isValid = Object.values(validatedData).every(value => value !== null);
        console.log(validatedData);
        return isValid ? validatedData : false;
    }
};