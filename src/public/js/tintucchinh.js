document.querySelectorAll('.news-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      // Xử lý click event ở đây, ví dụ:
      console.log('Clicked news item:', this.querySelector('.detail-box h6').textContent);
      // Hoặc mở bài viết trong một modal
      // Hoặc chuyển hướng bằng JavaScript:
      // window.location.href = this.getAttribute('href');
    });
  });