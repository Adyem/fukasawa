<?php
/**
 * Template Name: Contact
 * Description: Contact page template with enhanced inquiry form.
 *
 * @package Fukasawa
 */

get_header();

$photography_types = fukasawa_get_photography_types();
$time_options      = fukasawa_get_photography_time_options();
$default_fields    = array(
        'sender_name'      => '',
        'sender_email'     => '',
        'sender_phone'     => '',
        'photography_type' => '',
        'message'          => '',
);

$form_status   = isset( $_GET['form_status'] ) ? sanitize_key( wp_unslash( $_GET['form_status'] ) ) : '';
$feedback_key  = isset( $_GET['token'] ) ? sanitize_text_field( wp_unslash( $_GET['token'] ) ) : '';
$form_feedback = array(
        'errors' => array(),
        'fields' => $default_fields,
        'dates'  => array(),
);

if ( 'error' === $form_status && $feedback_key ) {
        $stored_feedback = get_transient( $feedback_key );

        if ( $stored_feedback ) {
                $form_feedback['errors'] = isset( $stored_feedback['errors'] ) ? $stored_feedback['errors'] : array();
                $form_feedback['fields'] = wp_parse_args( isset( $stored_feedback['fields'] ) ? $stored_feedback['fields'] : array(), $default_fields );
                $form_feedback['dates']  = isset( $stored_feedback['dates'] ) ? $stored_feedback['dates'] : array();

                delete_transient( $feedback_key );
        }
}

$form_feedback['fields'] = wp_parse_args( $form_feedback['fields'], $default_fields );

if ( empty( $form_feedback['dates'] ) ) {
        $form_feedback['dates'] = array(
                array(
                        'date' => '',
                        'time' => '',
                ),
        );
}

$availability_slots = array();
foreach ( $form_feedback['dates'] as $slot ) {
        $availability_slots[] = array(
                'date' => isset( $slot['date'] ) ? $slot['date'] : '',
                'time' => isset( $slot['time'] ) ? $slot['time'] : '',
        );
}

$has_errors       = 'error' === $form_status && ! empty( $form_feedback['errors'] );
$has_general_error = isset( $form_feedback['errors']['general'] );
$max_slots        = apply_filters( 'fukasawa_contact_form_max_slots', 5 );
?>

<div class="content thin">

        <?php if ( have_posts() ) : ?>
                <?php while ( have_posts() ) : the_post(); ?>

                        <article id="post-<?php the_ID(); ?>" <?php post_class( 'entry post contact-entry' ); ?>>

                                <header class="post-header">
                                        <?php the_title( '<h1 class="post-title">', '</h1>' ); ?>
                                </header><!-- .post-header -->

                                <div class="post-content entry-content">
                                        <?php the_content(); ?>

                                        <div class="fukasawa-contact-form-wrapper">
                                                <section class="contact-form__intro" aria-live="polite">
                                                        <?php esc_html_e( 'Share your project details and preferred photoshoot timing to receive a tailored quote.', 'fukasawa' ); ?>
                                                </section>

                                                <?php if ( 'success' === $form_status ) : ?>
                                                        <div class="contact-form__feedback contact-form__feedback--success" role="status">
                                                                <?php esc_html_e( 'Thanks for reaching out! We have received your request and will respond shortly.', 'fukasawa' ); ?>
                                                        </div>
                                                <?php endif; ?>

                                                <?php if ( $has_errors && ! $has_general_error ) : ?>
                                                        <div class="contact-form__feedback contact-form__feedback--error" role="alert">
                                                                <?php esc_html_e( 'Please review the highlighted fields and try submitting the form again.', 'fukasawa' ); ?>
                                                        </div>
                                                <?php endif; ?>

                                                <?php if ( $has_general_error ) : ?>
                                                        <div class="contact-form__feedback contact-form__feedback--error" role="alert">
                                                                <?php echo esc_html( $form_feedback['errors']['general'] ); ?>
                                                        </div>
                                                <?php endif; ?>

                                                <form id="contact-form" class="fukasawa-contact-form" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post" data-max-slots="<?php echo esc_attr( $max_slots ); ?>">
                                                        <?php wp_nonce_field( 'fukasawa_contact_form', 'fukasawa_contact_nonce' ); ?>
                                                        <input type="hidden" name="action" value="fukasawa_contact_form" />

                                                        <div class="contact-form__row contact-form__row--two">
                                                                <?php
                                                                $name_error = isset( $form_feedback['errors']['sender_name'] ) ? $form_feedback['errors']['sender_name'] : '';
                                                                $email_error = isset( $form_feedback['errors']['sender_email'] ) ? $form_feedback['errors']['sender_email'] : '';
                                                                ?>
                                                                <div class="contact-form__field">
                                                                        <label for="contact-sender-name"><?php esc_html_e( 'Your name', 'fukasawa' ); ?></label>
                                                                        <input type="text" id="contact-sender-name" name="sender_name" value="<?php echo esc_attr( $form_feedback['fields']['sender_name'] ); ?>" required<?php echo $name_error ? ' aria-invalid="true" aria-describedby="contact-sender-name-error"' : ''; ?> />
                                                                        <?php if ( $name_error ) : ?>
                                                                                <p class="contact-form__error" id="contact-sender-name-error" role="alert" data-error-source="server"><?php echo esc_html( $name_error ); ?></p>
                                                                        <?php endif; ?>
                                                                </div>

                                                                <div class="contact-form__field">
                                                                        <label for="contact-sender-email"><?php esc_html_e( 'Email address', 'fukasawa' ); ?></label>
                                                                        <input type="email" id="contact-sender-email" name="sender_email" value="<?php echo esc_attr( $form_feedback['fields']['sender_email'] ); ?>" required<?php echo $email_error ? ' aria-invalid="true" aria-describedby="contact-sender-email-error"' : ''; ?> />
                                                                        <?php if ( $email_error ) : ?>
                                                                                <p class="contact-form__error" id="contact-sender-email-error" role="alert" data-error-source="server"><?php echo esc_html( $email_error ); ?></p>
                                                                        <?php endif; ?>
                                                                </div>
                                                        </div>

                                                        <div class="contact-form__row contact-form__row--two">
                                                                <div class="contact-form__field">
                                                                        <label for="contact-sender-phone"><?php esc_html_e( 'Phone number', 'fukasawa' ); ?></label>
                                                                        <input type="tel" id="contact-sender-phone" name="sender_phone" value="<?php echo esc_attr( $form_feedback['fields']['sender_phone'] ); ?>" placeholder="<?php esc_attr_e( '+1 (555) 123-4567', 'fukasawa' ); ?>" />
                                                                        <p class="contact-form__helper"><?php esc_html_e( 'Optional – include the best number to reach you.', 'fukasawa' ); ?></p>
                                                                </div>

                                                                <?php $type_error = isset( $form_feedback['errors']['photography_type'] ) ? $form_feedback['errors']['photography_type'] : ''; ?>
                                                                <div class="contact-form__field">
                                                                        <label for="contact-photography-type"><?php esc_html_e( 'Photography type', 'fukasawa' ); ?></label>
                                                                        <select id="contact-photography-type" name="photography_type" required<?php echo $type_error ? ' aria-invalid="true" aria-describedby="contact-photography-type-error"' : ''; ?>>
                                                                                <option value=""><?php esc_html_e( 'Select a project focus', 'fukasawa' ); ?></option>
                                                                                <?php foreach ( $photography_types as $type_key => $type_label ) : ?>
                                                                                        <option value="<?php echo esc_attr( $type_key ); ?>" <?php selected( $form_feedback['fields']['photography_type'], $type_key ); ?>><?php echo esc_html( $type_label ); ?></option>
                                                                                <?php endforeach; ?>
                                                                        </select>
                                                                        <?php if ( $type_error ) : ?>
                                                                                <p class="contact-form__error" id="contact-photography-type-error" role="alert" data-error-source="server"><?php echo esc_html( $type_error ); ?></p>
                                                                        <?php endif; ?>
                                                                </div>
                                                        </div>

                                                        <fieldset class="contact-form__availability" aria-describedby="contact-availability-description">
                                                                <legend class="contact-form__legend"><?php esc_html_e( 'Possible photoshoot dates & times', 'fukasawa' ); ?></legend>
                                                                <p id="contact-availability-description" class="contact-form__helper"><?php esc_html_e( 'Add as many options as you like—this helps us confirm availability sooner.', 'fukasawa' ); ?></p>

                                                                <div data-availability-slots>
                                                                        <?php foreach ( $availability_slots as $index => $slot ) :
                                                                                $date_id = 'contact-date-' . ( $index + 1 );
                                                                                $time_id = 'contact-time-' . ( $index + 1 );
                                                                        ?>
                                                                                <div class="contact-form__slot" data-slot>
                                                                                        <div class="contact-form__field">
                                                                                                <label for="<?php echo esc_attr( $date_id ); ?>"><?php esc_html_e( 'Preferred date', 'fukasawa' ); ?></label>
                                                                                                <input type="date" id="<?php echo esc_attr( $date_id ); ?>" name="shoot_dates[]" value="<?php echo esc_attr( $slot['date'] ); ?>"<?php echo 0 === $index ? ' required' : ''; ?> />
                                                                                        </div>

                                                                                        <div class="contact-form__field">
                                                                                                <label for="<?php echo esc_attr( $time_id ); ?>"><?php esc_html_e( 'Preferred time', 'fukasawa' ); ?></label>
                                                                                                <select id="<?php echo esc_attr( $time_id ); ?>" name="shoot_times[]"<?php echo 0 === $index ? ' required' : ''; ?>>
                                                                                                        <option value=""><?php esc_html_e( 'Select a time', 'fukasawa' ); ?></option>
                                                                                                        <?php foreach ( $time_options as $time_key => $time_label ) : ?>
                                                                                                                <option value="<?php echo esc_attr( $time_key ); ?>" <?php selected( $slot['time'], $time_key ); ?>><?php echo esc_html( $time_label ); ?></option>
                                                                                                        <?php endforeach; ?>
                                                                                                </select>
                                                                                        </div>

                                                                                        <button type="button" class="contact-form__remove-slot" data-remove-slot>
                                                                                                <span aria-hidden="true">&times;</span>
                                                                                                <span class="screen-reader-text"><?php esc_html_e( 'Remove availability', 'fukasawa' ); ?></span>
                                                                                        </button>
                                                                                </div>
                                                                        <?php endforeach; ?>
                                                                </div>

                                                                <div class="contact-form__availability-feedback" data-availability-error>
                                                                        <?php if ( isset( $form_feedback['errors']['dates'] ) ) : ?>
                                                                                <p class="contact-form__error" id="contact-availability-error" role="alert" data-error-source="server"><?php echo esc_html( $form_feedback['errors']['dates'] ); ?></p>
                                                                        <?php endif; ?>
                                                                </div>

                                                                <button type="button" class="contact-form__add-slot" data-add-slot><?php esc_html_e( 'Add another date & time', 'fukasawa' ); ?></button>
                                                        </fieldset>

                                                        <?php $message_error = isset( $form_feedback['errors']['message'] ) ? $form_feedback['errors']['message'] : ''; ?>
                                                        <div class="contact-form__field">
                                                                <label for="contact-message"><?php esc_html_e( 'Additional message or project details', 'fukasawa' ); ?></label>
                                                                <textarea id="contact-message" name="message" rows="6" required<?php echo $message_error ? ' aria-invalid="true" aria-describedby="contact-message-error"' : ''; ?>><?php echo esc_textarea( $form_feedback['fields']['message'] ); ?></textarea>
                                                                <?php if ( $message_error ) : ?>
                                                                        <p class="contact-form__error" id="contact-message-error" role="alert" data-error-source="server"><?php echo esc_html( $message_error ); ?></p>
                                                                <?php endif; ?>
                                                        </div>

                                                        <div class="contact-form__actions">
                                                                <input type="submit" value="<?php esc_attr_e( 'Send request', 'fukasawa' ); ?>" />
                                                                <p class="contact-form__helper"><?php esc_html_e( 'We respect your inbox—no spam, ever.', 'fukasawa' ); ?></p>
                                                        </div>
                                                </form>
                                        </div><!-- .fukasawa-contact-form-wrapper -->
                                </div><!-- .post-content -->

                        </article><!-- .contact-entry -->

                <?php endwhile; ?>
        <?php endif; ?>

</div><!-- .content -->

<template id="fukasawa-date-slot-template">
        <div class="contact-form__slot" data-slot>
                <div class="contact-form__field">
                        <label for="contact-date-__index__"><?php esc_html_e( 'Preferred date', 'fukasawa' ); ?></label>
                        <input type="date" id="contact-date-__index__" name="shoot_dates[]" />
                </div>
                <div class="contact-form__field">
                        <label for="contact-time-__index__"><?php esc_html_e( 'Preferred time', 'fukasawa' ); ?></label>
                        <select id="contact-time-__index__" name="shoot_times[]">
                                <option value=""><?php esc_html_e( 'Select a time', 'fukasawa' ); ?></option>
                                <?php foreach ( $time_options as $time_key => $time_label ) : ?>
                                        <option value="<?php echo esc_attr( $time_key ); ?>"><?php echo esc_html( $time_label ); ?></option>
                                <?php endforeach; ?>
                        </select>
                </div>
                <button type="button" class="contact-form__remove-slot" data-remove-slot>
                        <span aria-hidden="true">&times;</span>
                        <span class="screen-reader-text"><?php esc_html_e( 'Remove availability', 'fukasawa' ); ?></span>
                </button>
        </div>
</template>

<?php get_footer();
