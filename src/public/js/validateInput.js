function showError(input, errorClass, err) {
    const span = input.nextElementSibling;
    if (err) {
        input.classList.add(errorClass);
        span.textContent = err;
    } else {
        input.classList.remove(errorClass);
        span.textContent = '';
    }
}

const rules = {
    phone: value => /^0\d{9}$/.test(value) ? '' : 'Số điện thoại không hợp lệ',
    password: value => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value) ? '' : 'Mật khẩu phải ít nhất 8 kí tự và chứa cả số và chữ',
    confirmPassword: (value, objectsToValidate) => {
        const passwordObj = objectsToValidate.find(obj => obj.rules.includes('password'));
        const passwordInput = document.querySelector(passwordObj?.selector);
        return value !== passwordInput?.value ? 'Không trùng khớp' : '';
    },
    notEmpty: value => value.trim() !== '' ? '' : 'Trường này không được để trống',
    mail: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Email không hợp lệ',
    name: name => {
        name = name.trim();
        const vietnameseNameRegex = /^[A-ZĂÂĐÊÔƠƯÁẮẤÉẾÍÓỐỚÚỨÝÀẰẦÈỀÌÒỒỜÙỪỲẢẲẨẺỂỈỎỔỞỦỬỶÃẴẪẼỄĨÕỖỠŨỮỸẠẶẬẸỆỊỌỘỢỤỰỴ][a-zăâđêôơưáắấéếíóốớúứýàằầèềìòồờùừỳảẳẩẻểỉỏổởủửỷãẵẫẽễĩõỗỡũữỹạặậẹệịọộợụựỵ]+(\s[A-ZĂÂĐÊÔƠƯÁẮẤÉẾÍÓỐỚÚỨÝÀẰẦÈỀÌÒỒỜÙỪỲẢẲẨẺỂỈỎỔỞỦỬỶÃẴẪẼỄĨÕỖỠŨỮỸẠẶẬẸỆỊỌỘỢỤỰỴ][a-zăâđêôơưáắấéếíóốớúứýàằầèềìòồờùừỳảẳẩẻểỉỏổởủửỷãẵẫẽễĩõỗỡũữỹạặậẹệịọộợụựỵ]+)+$/;
        if (!vietnameseNameRegex.test(name)) return 'Tên không hợp lệ';
        if (/\s{2,}/.test(name)) return 'Thừa khoảng trắng';
        return '';
    }
};

function validateInput(input, rulesToApply, errorClass, objectsToValidate) {
    let errorMessage = '';
    for (const rule of rulesToApply) {
        errorMessage = rule === 'confirmPassword'
            ? rules[rule](input.value, objectsToValidate)
            : rules[rule](input.value);
        if (errorMessage) break;
    }

    showError(input, errorClass, errorMessage);
    return errorMessage === '';
}

function validateAll(objectsToValidate, errorClass) {
    let allValid = true;

    objectsToValidate.forEach(obj => {
        const input = document.querySelector(obj.selector);
        if (input) {
            input.value = input.value.trim();
            const valid = validateInput(input, obj.rules, errorClass, objectsToValidate);
            if (!valid) allValid = false;
        }
    });

    return allValid;
}

function validate(form, objectsToValidate, errorClass, callApi) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const isValid = validateAll(objectsToValidate, errorClass);
        if (!isValid) {
            const firstInvalid = form.querySelector(`.${errorClass}`);
            firstInvalid?.focus();
            return;
        }
        if (callApi) {
            await callApi(e);
        } else {
            form.submit();
        }
    });

    // Các sự kiện cho input
    objectsToValidate.forEach(obj => {
        const input = document.querySelector(obj.selector);
        const span = input?.nextElementSibling;
        if (!input || !span) return;

        input.addEventListener('blur', () => {
            if (!obj.rules.includes('confirmPassword')) {
                setTimeout(()=>{

                    input.value = input.value.trim();
                    validateInput(input, obj.rules, errorClass, objectsToValidate);
                }, 300)
            }
        });

        input.addEventListener('input', () => {
            input.classList.remove(errorClass);
            span.textContent = '';
        });
    });

    // Trả lại function validateAll nếu muốn gọi thủ công
    return () => validateAll(objectsToValidate, errorClass);
}
