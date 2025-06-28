jQuery(document).ready(function($){
    // Append overlay element to body
    var overlay = $('<div class="fukasawa-lightbox-overlay"><img class="fukasawa-lightbox-image" src="" alt="" /></div>');
    $('body').append(overlay);

    function showOverlay(url){
        overlay.find('img').attr('src', url);
        overlay.addClass('active');
    }

    overlay.on('click', function(){
        overlay.removeClass('active');
    });

    $(document).on('click', 'a[href$=".jpg"],a[href$=".jpeg"],a[href$=".png"],a[href$=".gif"],a[href$=".webp"]', function(e){
        var href = $(this).attr('href');
        // Only handle links that contain an image and are within post/content areas
        if(href && $(this).find('img').length){
            e.preventDefault();
            showOverlay(href);
        }
    });
});
