<?php
/**
 * Template for the cart
 */
?>

<script type="text/template" id="tmpl-cart">
	<div class="list-header">
		<div class="qty"><?php /* translators: woocommerce */ _ex( 'Qty', 'Abbreviation of Quantity', 'woocommerce-pos' ); ?></div>
		<div class="title"><?php /* translators: woocommerce */ _e( 'Product', 'woocommerce' ); ?></div>
		<div class="price"><?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ); ?></div>
		<div class="total"><?php /* translators: woocommerce */ _e( 'Total', 'woocommerce' ); ?></div>
		<div class="action">&nbsp;</div>
	</div>
	<div class="list"></div>
	<div class="list-totals"></div>
	<div class="cart-actions"></div>
</script>

<script type="text/template" id="tmpl-cart-empty">
	<div><?php /* translators: woocommerce */ _e( 'Your cart is currently empty.', 'woocommerce' ); ?></div>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-item">
	<div class="qty"><input type="text" value="{{number qty precision='auto'}}" size="10" step="any" data-id="qty" data-title="<?php _e( 'Quantity', 'woocommerce-pos' ); ?>" data-placement="bottom" data-numpad="quantity" class="autogrow"></div>
	<div class="title">
		{{title}}
		{{#with attributes}}
		<dl>
			{{#each this}}
			<dt>{{name}}:</dt>
			<dd>{{option}}</dd>
			{{/each}}
		</dl>
		{{/with}}
	</div>
	<div class="price"><input type="text" value="{{number item_price}}" size="10" data-id="item_price" data-original="{{regular_price}}" data-title="<?php _e( 'Item Price', 'woocommerce-pos' ); ?>" data-placement="bottom" data-numpad="item_price" class="autogrow"></div>
	<div class="total">
		{{#compare total '!=' subtotal}}
			<del>{{{money subtotal}}}</del>
			<ins>{{{money total}}}</ins>
		{{else}}
			{{{money total}}}
		{{/compare}}
	</div>
	<div class="action"><a class="btn btn-circle btn-danger action-remove" href="#"><i class="icon icon-times"></i></a></div>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-totals">
	<li class="subtotal">
		<div><?php /* translators: woocommerce */ _e( 'Cart Subtotal', 'woocommerce' ); ?>:</div>
		<div class="total">{{{money subtotal}}}</div>
		<div class="action"></div>
	</li>
	{{#if show_cart_discount}}
	<li class="cart-discount">
		<div><?php /* translators: woocommerce */ _e( 'Cart Discount', 'woocommerce' ); ?>:</div>
		<div class="total">{{{money cart_discount negative=true}}}</div>
		<div class="action"></div>
	</li>
	{{/if}}
	{{#if show_tax}}
	{{#if show_itemized}}
	{{#each itemized_tax}}
	<li class="tax">
		<div>
			{{#if ../incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
			{{label}}:
		</div>
		<div class="total">{{{money total}}}</div>
		<div class="action"></div>
	</li>
	{{/each}}
	{{else}}
	<li class="tax">
		<div>
			{{#if incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
			<?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:
		</div>
		<div class="total">{{{money total_tax}}}</div>
		<div class="action"></div>
	</li>
	{{/if}}
	{{/if}}
	<li class="order-discount" {{#unless show_order_discount}}style="display:none"{{/unless}}>
		<div><?php /* translators: woocommerce-admin */ _e( 'Order Discount', 'woocommerce-admin' ); ?>:</div>
		<div class="total">
			<input type="text" value="{{number order_discount}}" size="10" data-id="order_discount" data-original="{{original}}" data-title="<?php _e( 'Discount', 'woocommerce-pos' ); ?>" data-placement="left" data-numpad="discount" class="autogrow">
			<span class="amount">{{{money order_discount negative=true}}}</span>
		</div>
		<div class="action"></div>
	</li>
	<li class="order-total">
		<div><?php /* translators: woocommerce */ _e( 'Order Total', 'woocommerce' ); ?>:</div>
		<div class="total">{{{money total}}}</div>
		<div class="action"></div>
	</li>
</script>

<script type="text/x-handlebars-template" id="tmpl-cart-customer">
	<?php /* translators: woocommerce */ _e( 'Customer', 'woocommerce' ); ?>:
	<input type="hidden" id="select-customer" class="select2" style="width:200px" value="{{ customer_id }}" data-customer="{{ customer_name }}" data-nonce="<?php echo wp_create_nonce( 'json-search-customers' ) ?>">
</script>

<script type="text/template" id="tmpl-cart-actions">
	<button class="btn btn-danger action-void pull-left">
		<?php _e( 'Void', 'woocommerce-pos' ); ?>
	</button>
	<button class="btn btn-primary action-note">
		<?php /* translators: woocommerce */ _e( 'Note', 'woocommerce' ); ?>
	</button>
	<button class="btn btn-primary action-discount">
		<?php _e( 'Discount', 'woocommerce-pos' ); ?>
	</button>
	<button type="submit" class="btn btn-success action-checkout">
		<?php /* translators: woocommerce */ _e( 'Checkout', 'woocommerce' ); ?>
	</button>
</script>