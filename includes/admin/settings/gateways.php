<?php

/**
 * Gateway Settings Class
 *
 * @package    WCPOS\Admin_Settings_Gateways
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.wcpos.com
 */

namespace WCPOS\Admin\Settings;

use WC_Payment_Gateway;

class Gateways extends Page {

//  note: should be init as new, not Singleton
//  protected static $instance;

	/**
	 * @param $gateway_id
	 */
	public function __construct( $gateway_id ) {
		$this->id       = 'gateway_' . $gateway_id;
		$this->defaults = array(
			'icon' => true
		);
	}

	/**
	 * @param WC_Payment_Gateway $gateway
	 */
	public function merge_settings( WC_Payment_Gateway $gateway ) {
		$data = $this->get();
		if ( isset( $data['title'] ) ) {
			$gateway->title = $data['title'];
		}
		if ( isset( $data['description'] ) ) {
			$gateway->description = $data['description'];
		}
		$gateway->has_icon  = $gateway->get_icon() != '';
		$gateway->show_icon = isset( $data['icon'] ) ? $data['icon'] : true;
	}

}
