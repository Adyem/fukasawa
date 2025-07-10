jQuery(document).ready(function($){
    var links = [];

    function collectLinks(){
        links = $('a[href$=".jpg"],a[href$=".jpeg"],a[href$=".png"],a[href$=".gif"],a[href$=".webp"]').filter(function(){
            return $(this).find('img').length;
        });
    }

    collectLinks();

    // Append overlay element to body
    var overlay = $('<div class="fukasawa-lightbox-overlay">' +
                    '<span class="lightbox-close genericon genericon-close"></span>' +
                    '<span class="lightbox-prev genericon genericon-leftarrow"></span>' +
                    '<img class="fukasawa-lightbox-image" src="" alt="" />' +
                    '<span class="lightbox-next genericon genericon-rightarrow"></span>' +
                    '</div>');
    $('body').append(overlay);

    var currentIndex = -1;

    function showOverlay(index){
        if(links.length === 0){
            collectLinks();
        }
        if(index < 0){
            index = links.length - 1;
        }
        if(index >= links.length){
            index = 0;
        }
        currentIndex = index;
        overlay.find('img').attr('src', $(links[currentIndex]).attr('href'));
        overlay.addClass('active');
    }

    overlay.on('click', function(e){
        if($(e.target).hasClass('lightbox-prev')){
            showOverlay(currentIndex - 1);
            return;
        }
        if($(e.target).hasClass('lightbox-next')){
            showOverlay(currentIndex + 1);
            return;
        }
        if($(e.target).hasClass('lightbox-close')){
            overlay.removeClass('active');
            return;
        }
        if(!$(e.target).is('img')){
            overlay.removeClass('active');
        }
    });

    $(document).on('keydown', function(e){
        if(!overlay.hasClass('active')) return;
        if(e.key === 'ArrowRight'){
            showOverlay(currentIndex + 1);
        } else if(e.key === 'ArrowLeft'){
            showOverlay(currentIndex - 1);
        } else if(e.key === 'Escape'){
            overlay.removeClass('active');
        }
    });

    $(document).on('click', 'a[href$=".jpg"],a[href$=".jpeg"],a[href$=".png"],a[href$=".gif"],a[href$=".webp"]', function(e){
        if($(this).find('img').length){
            e.preventDefault();
            collectLinks();
            showOverlay(links.index(this));
        }
    });

    $(document.body).on('post-load', function(){
        collectLinks();
    });
});
