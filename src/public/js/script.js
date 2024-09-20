// function setupHoverEffect(query, newText, newBgColor, newTextColor) {
//     const element = document.querySelector(query);
//     if (!element) return;

//     const originalText = element.innerText;
//     const originalBgColor = getComputedStyle(element).backgroundColor;
//     const originalTextColor = getComputedStyle(element).color;
//     const originalWidth = getComputedStyle(element).width;

//     element.addEventListener('mouseover', function() {
//       element.innerText = newText;
//       element.style.backgroundColor = newBgColor;
//       element.style.color = newTextColor;
//       element.style.minwidth = originalWidth;
//     });

//     element.addEventListener('mouseout', function() {
//       element.innerText = originalText;
//       element.style.backgroundColor = originalBgColor;
//       element.style.color = originalTextColor;

//     });
//   }

//   // Sử dụng hàm
//   setupHoverEffect('.nav-link.logout', 'ĐĂNG XUẤT', 'red', 'black');

function formatDate(date) {
    date = new Date(date);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getUTCFullYear();

    return `${hours}:${minutes} ${day}/${month}/${year}`;
}