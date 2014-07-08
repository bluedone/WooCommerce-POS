<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Cash
 *
 * Provides a Cash Payment Gateway.
 *
 * @class 		WooCommerce_POS_Gateway_Cash
 * @extends		WC_Payment_Gateway
 */
class WooCommerce_POS_Gateway_Cash extends WC_Payment_Gateway {

	/** @var string 'no' never enabled in Online Store. */
	public $enabled = 'no';

    /**
     * Constructor for the gateway.
     */
	public function __construct() {
		$this->id                 = 'pos_cash';
		$this->icon               = apply_filters( 'woocommerce_pos_cash_icon', '' );
		$this->method_title       = __( 'Cash', 'woocommerce-pos' );
		$this->method_description = __( 'Cash sales.', 'woocommerce-pos' );
		$this->has_fields         = false;

	}

    /**
     * Initialise Gateway Settings Form Fields
     */
    public function init_form_fields() {

    	$this->form_fields = array(
			'title' => array(
				'title'       => __( 'Title', 'woocommerce-pos' ),
				'type'        => 'text',
				'description' => __( 'Payment method title.', 'woocommerce-pos' ),
				'default'     => __( 'Cash', 'woocommerce-pos' ),
				'desc_tip'    => true,
			),
 	   );
    }

	/**
	 * Check If The Gateway Is Available For Use
	 *
	 * @return bool
	 */
	public function is_available() {
		return true;
	}

	/**
	 * Return the gateways title
	 *
	 * @access public
	 * @return string
	 */
	public function get_title() {
		return 'Cash';
	}

}