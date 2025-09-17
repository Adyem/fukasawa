		</main><!-- .wrapper -->

                <div id="fukasawa-lightbox" class="fukasawa-lightbox" role="dialog" aria-modal="true" aria-hidden="true" hidden>
                        <div class="fukasawa-lightbox__backdrop" data-lightbox-close></div>
                        <div class="fukasawa-lightbox__dialog" role="document">
                                <button type="button" class="fukasawa-lightbox__button fukasawa-lightbox__close" data-lightbox-close aria-label="<?php esc_attr_e( 'Close image preview', 'fukasawa' ); ?>">
                                        <span aria-hidden="true">&times;</span>
                                </button>
                                <button type="button" class="fukasawa-lightbox__button fukasawa-lightbox__prev" data-lightbox-prev aria-label="<?php esc_attr_e( 'Show previous image', 'fukasawa' ); ?>">
                                        <span aria-hidden="true">&#10094;</span>
                                </button>
                                <figure class="fukasawa-lightbox__figure">
                                        <img id="fukasawa-lightbox-image" class="fukasawa-lightbox__image" src="" alt="" loading="lazy" />
                                        <figcaption id="fukasawa-lightbox-caption" class="fukasawa-lightbox__caption"></figcaption>
                                </figure>
                                <button type="button" class="fukasawa-lightbox__button fukasawa-lightbox__next" data-lightbox-next aria-label="<?php esc_attr_e( 'Show next image', 'fukasawa' ); ?>">
                                        <span aria-hidden="true">&#10095;</span>
                                </button>
                        </div>
                </div>

                <?php wp_footer(); ?>

	</body>
</html>