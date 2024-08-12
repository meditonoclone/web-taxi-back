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
function validate(objectsToValidate, errorClass) {
    // Các rule cơ bản
    const rules = {
        phone: value => /^0\d{9}$/.test(value) ? '' : 'Số điện thoại không hợp lệ',
        password: value => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value) ? '' : 'Mật khẩu phải ít nhất 8 kí tự và chứa cả số và chữ',
        confirmPassword: value => {
            let error = '';
            let passwordObj = objectsToValidate.find(obj => obj.rules.includes('password'))
            if (passwordObj) {
                const passwordInput = document.querySelector(passwordObj.selector);
                error = value !== passwordInput.value ? 'Không trùng khớp' : '';
            }
            return error;

        },
        notEmpty: value => value.trim() !== '' ? '' : 'Trường này không được để trống',
        mail: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Email không hợp lệ',
        name: (name) => {
            name = name.trim();
            // Kiểm tra nếu tên là một chuỗi và không rỗng
            if (typeof name !== 'string' || name.trim() === '') {
                return 'Không được để trống và phải là tên hợp lệ';
            }

            // Biểu thức chính quy để kiểm tra tên Việt Nam hợp lệ
            const vietnameseNameRegex = /^[A-ZĂÂĐÊÔƠƯÁẮẤÉẾÍÓỐỚÚỨÝÀẰẦÈỀÌÒỒỜÙỪỲẢẲẨẺỂỈỎỔỞỦỬỶÃẴẪẼỄĨÕỖỠŨỮỸẠẶẬẸỆỊỌỘỢỤỰỴ][a-zăâđêôơưáắấéếíóốớúứýàằầèềìòồờùừỳảẳẩẻểỉỏổởủửỷãẵẫẽễĩõỗỡũữỹạặậẹệịọộợụựỵ]+(\s[A-ZĂÂĐÊÔƠƯÁẮẤÉẾÍÓỐỚÚỨÝÀẰẦÈỀÌÒỒỜÙỪỲẢẲẨẺỂỈỎỔỞỦỬỶÃẴẪẼỄĨÕỖỠŨỮỸẠẶẬẸỆỊỌỘỢỤỰỴ][a-zăâđêôơưáắấéếíóốớúứýàằầèềìòồờùừỳảẳẩẻểỉỏổởủửỷãẵẫẽễĩõỗỡũữỹạặậẹệịọộợụựỵ]+)+$/;
            if (!vietnameseNameRegex.test(name)) {
                return 'Tên không hợp lệ';
            }

            // Kiểm tra không có khoảng trắng thừa
            if (/\s{2,}/.test(name)) {
                return 'Thừa khoảng trắng';
            }

            return '';
        }
    };

    function validateInput(input, rulesToApply, span) {
        let errorMessage = '';
        rulesToApply.forEach(rule => {
            if (errorMessage === '') { // Chỉ kiểm tra các rule tiếp theo nếu không có lỗi trước đó
                errorMessage = rules[rule](input.value);
            }
        });
        showError(input, errorClass, errorMessage);
        return errorMessage === '';
    }

    let isValid = true;

    document.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        objectsToValidate.forEach(obj => {
            const input = document.querySelector(obj.selector);
            const span = input.nextElementSibling;
            if (!validateInput(input, obj.rules, span))
                isValid = false;
            else
                e.target.submit();
        });
        if (!isValid)
            document.querySelector(`.${errorClass}`).focus();
    })

    objectsToValidate.forEach(obj => {
        const input = document.querySelector(obj.selector);
        const span = input.nextElementSibling;
        // Kiểm tra khi blur
        input.addEventListener('blur', () => {
            if (obj.rules.includes('confirmPassword'))
                return;
            input.value = input.value.trim();
            validateInput(input, obj.rules, span);
        });

        // Xóa lỗi khi input thay đổi
        input.addEventListener('input', () => {
            input.classList.remove(errorClass);
            span.textContent = '';
        });

    });

    return isValid;
}
