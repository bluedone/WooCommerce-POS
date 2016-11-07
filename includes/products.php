<?php

/**
 * POS Product Class
 * duck punches the WC REST API
 *
 * @class    WC_POS_API_Products
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

namespace WC_POS;

class Products {

  /**
   * Constructor
   */
  public function __construct() {
    add_action( 'woocommerce_product_set_stock', array( $this, 'product_set_stock') );
    add_action( 'woocommerce_variation_set_stock', array( $this, 'product_set_stock') );
    $this->init();
  }

  /**
   * Load Product subclasses
   */
  private function init() {

    // pos only products
    if( wc_pos_get_option( 'products', 'pos_only_products' ) ) {
      new Products\Visibility();
    }

    // decimal quantities
    if( wc_pos_get_option( 'products', 'decimal_qty' ) ){
      remove_filter('woocommerce_stock_amount', 'intval');
      add_filter( 'woocommerce_stock_amount', 'floatval' );
    }

  }

  /**
   * Bump modified date on stock change
   * - variation->id = parent id
   * @param $product
   */
  public function product_set_stock( $product ){
    $post_modified     = current_time( 'mysql' );
    $post_modified_gmt = current_time( 'mysql', 1 );
    wp_update_post( array(
      'ID'                => $product->id,
      'post_modified'     => $post_modified,
      'post_modified_gmt' => $post_modified_gmt
    ));
  }

}