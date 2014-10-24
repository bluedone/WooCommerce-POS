<?php

/**
 * WP Checkout Settings Class
 *
 * @class    WC_POS_Admin_Settings_General
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_Admin_Settings_General extends WC_POS_Admin_Settings_Page {

	/**
	 *
	 */
	public function __construct() {
		$this->id           = 'general';
		$this->label        = _x( 'General', 'settings tab label', 'woocommerce-pos' );
//		$this->option_name  = $this->get_option_name( $this->id );
		$this->option_name  = parent::$prefix . $this->id;
		$this->options      = get_option( $this->option_name );
	}

	/**
	 *
	 */
	public function output() {
		include_once 'views/general.php';
	}

}