function setEqualHeight() {
    const items = document.querySelectorAll('.news_section .news_container .box .detail-box');
    var height = 0;

    items.forEach((item) => {
        if (item.offsetHeight > height) {
            height = item.offsetHeight;
        }
    })

    items.forEach((item) => {
        item.style.height = `${height}px`;
    })
    console.log(items);
  }

document.addEventListener('DOMContentLoaded', setEqualHeight);