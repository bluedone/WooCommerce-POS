<?php

/**
 * Cart Class
 *
 * Handles the cart
 * 
 * @class 	  WooCommerce_POS_Cart
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_Cart {

	/**
	 * Get the current cart
	 */
	public function get_cart_items() {
		$items = array();

		$cart_items = WC()->cart->get_cart();

		// error_log( print_R( $cart_items, TRUE ) ); //debug
		
		if ( sizeof( WC()->cart->get_cart() ) > 0 ) :

			foreach($cart_items as $cart_item_key => $cart_item) {
				$_product     = apply_filters( 'woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key );
				$product_id   = apply_filters( 'woocommerce_cart_item_product_id', $cart_item['product_id'], $cart_item, $cart_item_key );

				if ( $_product && $_product->exists() && $cart_item['quantity'] > 0 ) {

					$product_name  = apply_filters( 'woocommerce_cart_item_name', $_product->get_title(), $cart_item, $cart_item_key );
					$product_price = apply_filters( 'woocommerce_cart_item_price', WC()->cart->get_product_price( $_product ), $cart_item, $cart_item_key );
					$product_total = apply_filters( 'woocommerce_cart_item_subtotal', WC()->cart->get_product_subtotal( $_product, $cart_item['quantity'] ), $cart_item, $cart_item_key );

					$cart_item = array(
						'cart_item_key' => $cart_item_key,
						'title'			=> $product_name,
						'price_html'	=> $product_price,
						'qty'			=> $cart_item['quantity'],
						'total'			=> $product_total,

					);
					array_push($items, $cart_item);
				}
			}

		endif;

		return $items;
	}

	/**
	 * Get the current cart total
	 */
	public function get_cart_totals() {
		$totals = array(
			array(
				'title' => 'Sub Total',
				'total' => WC()->cart->get_cart_subtotal()
				),
			array(
				'title' => esc_html( WC()->countries->tax_or_vat() ),
				'total' => WC()->cart->get_cart_tax()
				),
			array(
				'title' => 'Discount',
				'total' => WC()->cart->get_total_discount()
			),
			array(
				'title' => 'Order Total',
				'total' => WC()->cart->get_total()
			),
				//'wp_nonce_field'=> wp_nonce_field('checkout','woocommerce-pos_checkout'),
		);

		return $totals;

	}

}