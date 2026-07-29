
$(function(){
    const $track = $('.carousel-track');
    const $slides = $('.carousel-slide');
    let index = 0;
    const total = $slides.length;

    function showSlide(i) {
        $track.css('transform', `translateX(${-i * 100}%)`);
    }

    $('.next').click(function(){
        index = (index + 1) % total;
        showSlide(index);
    });

    $('.prev').click(function(){
        index = (index - 1 + total) % total;
        showSlide(index);
    });

    // Auto-play cada 3 segundos
    setInterval(function(){
        index = (index + 1) % total;
        showSlide(index);
    }, 3000);
});
