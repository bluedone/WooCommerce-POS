</div><!-- /page -->

<?php if( WC_POS()->is_pos() == 'main' ) : ?> 
<div id="footer" class="textcenter">
	<i class="fa fa-support"></i> <?= sprintf( __( 'Need help? Visit the <a href="%s">support</a> page', 'woocommerce-pos' ), WC_POS()->pos_url( 'support' ) ); ?>
</div>
<?php endif; ?>

<div id="menu" class="pushy pushy-left">
	<ul>
		<li><a href="<?= WC_POS()->pos_url(); ?>"><i class="fa fa-shopping-cart"></i> <?php _e( 'POS', 'woocommerce-pos' ); ?></a></li>
		<li><a href="<?= admin_url('edit.php?post_type=product'); ?>"><?php _e( 'View Products', 'woocommerce-pos' ); ?></a></li>
		<li><a href="<?= admin_url('post-new.php?post_type=product'); ?>"><?php _e( 'Add Product', 'woocommerce-pos' ); ?></a></li>
		<li><a href="<?= admin_url('edit.php?post_type=shop_order'); ?>"><?php _e( 'View Orders', 'woocommerce-pos' ); ?></a></li>
		<li><a href="<?= admin_url('users.php'); ?>"><?php _e( 'View Customers', 'woocommerce-pos' ); ?></a></li>
		<li class="support"><a href="<?= WC_POS()->pos_url('support'); ?>"><i class="fa fa-support"></i> <?php _e( 'Support', 'woocommerce-pos' ); ?></a></li>
	</ul>
</div><!-- /menu -->

<?php WooCommerce_POS::pos_print_js('footer'); ?>

</body>
</html>