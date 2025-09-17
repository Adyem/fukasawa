<div class="post-container">

	<div id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

		<?php 

		$post_format = get_post_format();

		if ( ! post_password_required() ) :
		
			// Video format specific featured media
			if ( $post_format == 'video' && strpos( $post->post_content, '<!--more-->' ) ) : ?>

				<figure class="featured-media">

					<?php
							
					// Fetch post content
					$content = get_post_field( 'post_content', get_the_ID() );
					
					// Get content parts
					$content_parts = get_extended( $content );
					
					// oEmbed part before <!--more--> tag
					$embed_code = wp_oembed_get( $content_parts['main'] ); 
					
					echo $embed_code;
					
					?>

				</figure><!-- .featured-media -->

				<?php 
			
			// Gallery format specific featured media
			elseif ( $post_format == 'gallery' ) : ?>

				<figure class="featured-media">
					<?php fukasawa_flexslider( 'post-thumb' ); ?>
				</figure><!-- .featured-media -->
		
			<?php 
			
			// Image format specific featured media
                        elseif ( $post_format == 'image' && has_post_thumbnail() ) :

                                $thumbnail_id = get_post_thumbnail_id();
                                $full_image   = $thumbnail_id ? wp_get_attachment_image_url( $thumbnail_id, 'full' ) : '';
                                $srcset       = $thumbnail_id ? wp_get_attachment_image_srcset( $thumbnail_id, 'full' ) : '';
                                $sizes        = $thumbnail_id ? wp_get_attachment_image_sizes( $thumbnail_id, 'full' ) : '';
                                $alt_text     = $thumbnail_id ? get_post_meta( $thumbnail_id, '_wp_attachment_image_alt', true ) : '';
                                ?>

                                <figure class="featured-media">

                                        <a class="post-lightbox-trigger" href="<?php echo esc_url( $full_image ? $full_image : get_permalink() ); ?>" data-lightbox-srcset="<?php echo esc_attr( $srcset ); ?>" data-lightbox-sizes="<?php echo esc_attr( $sizes ); ?>" data-lightbox-alt="<?php echo esc_attr( $alt_text ? $alt_text : get_the_title() ); ?>" data-lightbox-caption="<?php echo esc_attr( get_the_title() ); ?>">

                                                <?php echo wp_get_attachment_image( $thumbnail_id, 'post-thumb', false, array( 'loading' => 'lazy', 'class' => 'post-thumbnail-image' ) ); ?>

                                                <span class="post-overlay">
                                                        <p class="view"><?php _e( 'View', 'fukasawa' ); ?> &rarr;</p>
                                                </span>

                                                <span class="screen-reader-text"><?php printf( __( 'Open full-size image of %s', 'fukasawa' ), get_the_title() ); ?></span>

                                        </a>

                                </figure><!-- .featured-media -->

                        <?php

                        // Standard format featured media
                        elseif ( has_post_thumbnail() ) :

                                $thumbnail_id = get_post_thumbnail_id();
                                $full_image   = $thumbnail_id ? wp_get_attachment_image_url( $thumbnail_id, 'full' ) : '';
                                $srcset       = $thumbnail_id ? wp_get_attachment_image_srcset( $thumbnail_id, 'full' ) : '';
                                $sizes        = $thumbnail_id ? wp_get_attachment_image_sizes( $thumbnail_id, 'full' ) : '';
                                $alt_text     = $thumbnail_id ? get_post_meta( $thumbnail_id, '_wp_attachment_image_alt', true ) : '';
                                ?>

                                <figure class="featured-media">
                                        <a class="post-lightbox-trigger" href="<?php echo esc_url( $full_image ? $full_image : get_permalink() ); ?>" data-lightbox-srcset="<?php echo esc_attr( $srcset ); ?>" data-lightbox-sizes="<?php echo esc_attr( $sizes ); ?>" data-lightbox-alt="<?php echo esc_attr( $alt_text ? $alt_text : get_the_title() ); ?>" data-lightbox-caption="<?php echo esc_attr( get_the_title() ); ?>">
                                                <?php echo wp_get_attachment_image( $thumbnail_id, 'post-thumb', false, array( 'loading' => 'lazy', 'class' => 'post-thumbnail-image' ) ); ?>
                                                <span class="screen-reader-text"><?php printf( __( 'Open full-size image of %s', 'fukasawa' ), get_the_title() ); ?></span>
                                        </a>
                                </figure><!-- .featured-media -->
					
				<?php 
			endif;
		endif;
		
		// Hide the post title and excerpt for image format posts with post thumbnail
		if ( $post_format !== 'image' || $post_format == 'image' && ! has_post_thumbnail() ) :
		
			if ( get_the_title() ) : ?>
						
				<div class="post-header">
					<h2 class="post-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
				</div><!-- .post-header -->
			
				<?php 
			endif;
			
			if ( get_the_excerpt() ) : ?>
			
				<div class="post-excerpt">
				
					<?php 
					if ( $post_format == 'video' && strpos( $post->post_content, '<!--more-->' ) ) {
						echo '<p>' . mb_strimwidth( $content_parts['extended'], 0, 160, '...' ) . '</p>';
					} else {
						the_excerpt();
					}
					?>
				
				</div>

				<?php 
			endif;
			
			if ( ! get_the_title() ) : ?>
					
				<div class="posts-meta">
					<a href="<?php the_permalink(); ?>"><?php the_time( get_option( 'date_format' ) ); ?></a>
				</div>
			
				<?php 
			endif;
			
		endif;
		
		?>
	
	</div><!-- .post -->

</div><!-- .post-container -->