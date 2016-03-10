<?php

/**
 * WP Checkout Settings Class
 *
 * @class    WC_POS_Admin_Settings_General
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

namespace WC_POS\Admin\Settings;

class General extends Page {

  protected static $instance;

  public $flush_local_data = array(
    'pos_only_products',
    'decimal_qty'
  );

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    $this->id    = 'general';
    /* translators: woocommerce */
    $this->label = __( 'General', 'woocommerce' );

    $this->defaults = array(
      'discount_quick_keys' => array('5', '10', '20', '25'),
      'shipping' => array(
        'taxable' => true
      ),
      'fee' => array(
        'taxable' => true
      )
    );
  }

}