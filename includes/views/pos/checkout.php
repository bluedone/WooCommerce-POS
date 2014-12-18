<?php
/**
 * Template for the checkout
 */
?>

<script type="text/template" id="tmpl-checkout" data-title="<?php /* translators: woocommerce */ _e( 'Checkout', 'woocommerce' ); ?>">
	<div class="list-header checkout-status">
		<h4 class="text-center">
			<?php _e( 'To Pay', 'woocommerce-pos' ); ?>:
			{{{money total}}}
		</h4>
	</div>
	<div class="list checkout-gateways"></div>
	<div class="checkout-actions">
		<button class="btn action-close pull-left"><?php _e( 'Return to Sale', 'woocommerce-pos' ); ?></button>
		<button class="btn btn-success action-process"><?php _e( 'Process Payment', 'woocommerce-pos' ); ?></button>
	</div>
</script>

<script type="text/template" id="tmpl-checkout-gateways">
	<form>

		<?php
//		// pretend we're guest
//		wp_set_current_user( 0 );
//
//		if ( $enabled_gateways = WC_POS()->payment_gateways()->get_enabled_payment_gateways() ) :
//			$default_gateway = get_option( 'woocommerce_pos_default_gateway' );
//			foreach ( $enabled_gateways as $gateway ) :
//				$active = $gateway->id == $default_gateway ? true : false;
//				?>
<!---->
<!--				<fieldset id="--><?php //echo $gateway->id; ?><!--" class="--><?php //if($active) echo 'active'; ?><!--">-->
<!--					<legend>-->
<!--						<input type="radio" name="payment_method" value="--><?php //echo $gateway->id; ?><!--" --><?php //if($active) echo 'checked'; ?><!-->-->
<!--						--><?php //echo $gateway->get_title(); ?>
<!--						--><?php //echo $gateway->get_icon(); ?>
<!--					</legend>-->
<!--					<div class="form-group">-->
<!--						--><?php
//						if( $gateway->has_fields() || $gateway->get_description() )
//							$gateway->payment_fields();
//						?>
<!--					</div>-->
<!--				</fieldset>-->
<!---->
<!--			--><?php
//			endforeach;
//
//		else :
//			// no payment gateways enabled
//			echo '<p>' . __( 'No payment gateways enabled.', 'woocommerce-pos' ) . '</p>';
//		endif;
//
//		// back to being logged in
//		wp_set_current_user( WC_POS()->logged_in_user->ID );
		?>

	</form>
</script>