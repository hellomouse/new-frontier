'use strict';

module.exports = function (text) {
    let caption = document.getElementById('caption-text');

    caption.style.opacity = 1;
    caption.innerHTML = text;

    setTimeout(() => {
        caption.style.opacity = 0;
    }, 1500);
}
