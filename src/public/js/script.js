function setupHoverEffect(query, newText, newBgColor, newTextColor) {
    const element = document.querySelector(query);
    if (!element) return;
  
    const originalText = element.innerText;
    const originalBgColor = getComputedStyle(element).backgroundColor;
    const originalTextColor = getComputedStyle(element).color;
    const originalWidth = getComputedStyle(element).width;
  
    element.addEventListener('mouseover', function() {
      element.innerText = newText;
      element.style.backgroundColor = newBgColor;
      element.style.color = newTextColor;
      element.style.width = originalWidth;
    });
  
    element.addEventListener('mouseout', function() {
      element.innerText = originalText;
      element.style.backgroundColor = originalBgColor;
      element.style.color = originalTextColor;

    });
  }
  
  // Sử dụng hàm
  setupHoverEffect('.nav-link.logout', 'ĐĂNG XUẤT', 'red', 'black');