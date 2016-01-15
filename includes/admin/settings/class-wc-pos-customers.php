<?php
/**
 * Customer Settings
 *
 * @class 	  WC_POS_Pro_Admin_Settings_Customers
 * @package   WooCommerce POS Pro
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */


class WC_POS_Admin_Settings_Customers extends WC_POS_Admin_Settings_Abstract {

  protected static $instance;

  public $flush_local_data = array(
    'customer_roles'
  );

  public function __construct() {
    $this->id    = 'customers';
    $this->label = /* translators: woocommerce */ __( 'Customers', 'woocommerce' );

    $this->defaults = array(
      'default_customer' => 0,
      'customer_roles' => array( 'all' )
    );
  }

}