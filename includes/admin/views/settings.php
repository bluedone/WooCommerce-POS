<?php
/**
 * View for the Settings page
 *
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.kilbot.com.au
 */
?>

<div class="wrap">
	<p><?php _e( 'There has been an error loading the settings, please contact <a href="mailto:support@woopos.com.au">support</a>', 'woocommerce-pos' ); ?></p>
</div>

<?php foreach( $settings as $setting ): ?>
	<?php echo $setting->output(); ?>
<?php endforeach; ?>

<script type="text/template" id="tmpl-modal">
	<div class="modal-dialog"><div class="modal-content">
			<div class="modal-header"><h1><?php /* translators: wordpress */ _e( 'Title' ); ?></h1><i class="icon icon-times" data-action="close" title="<?php /* translators: wordpress */ _e( 'Close' ); ?>"></i></div>
			<div class="modal-body"></div>
			<div class="modal-footer">
				<p class="response" data-success="<?php /* translators: woocommerce */ _e( 'Your changes have been saved.', 'woocommerce' ); ?>" data-error="<?php /* translators: woocommerce */ _e( 'Sorry, there has been an error.', 'woocommerce' ); ?>"></p>
				<a href="#" class="btn btn-primary" data-action="save"><?php /* translators: woocommerce */ _e( 'Save Changes', 'woocommerce' ); ?></a>
			</div>
		</div></div>
</script>