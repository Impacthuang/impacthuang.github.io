<script>
    const images = document.querySelectorAll('.slider img');

    const prev = document.querySelector('.prev');
    const next = document.querySelector('.next');

    let index = 0;

    function showImage(i){
        images.forEach(img => img.classList.remove('active'));
        images[i].classList.add('active');
    }

    next.onclick = () => {
        index = (index + 1) % images.length;
        showImage(index);
    };

    prev.onclick = () => {
        index = (index - 1 + images.length) % images.length;
        showImage(index);
    };

    // 自动轮播（每 4 秒）
    setInterval(() => {
        index = (index + 1) % images.length;
        showImage(index);
    }, 4000);
</script>
