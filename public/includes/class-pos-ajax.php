<?php

/**
 * AJAX Event Handler
 *
 * Handles the ajax
 * Borrows heavily from WooCommerce, hopefully can be replaced by WC API in time
 * 
 * @class 	  WooCommerce_POS_AJAX
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WooCommerce_POS_AJAX {

	/**
	 * Hook into ajax events
	 */
	public function __construct() {

		// woocommerce_EVENT => nopriv
		$ajax_events = array(
			'process_order'             => true,
			'get_product_ids'			=> true,
			'get_modal'					=> true,
			'json_search_customers'		=> true,
		);

		foreach ( $ajax_events as $ajax_event => $nopriv ) {
			add_action( 'wp_ajax_pos_' . $ajax_event, array( $this, $ajax_event ) );

			if ( $nopriv )
				add_action( 'wp_ajax_nopriv_pos_' . $ajax_event, array( $this, $ajax_event ) );
		}
	}


	/**
	 * Process the order
	 * TODO: validation
	 * @return 
	 */
	public function process_order() {

		// create order 
		$checkout = new WooCommerce_POS_Checkout();
		$order = $checkout->create_order();

		$this->json_headers();
		echo json_encode( $order );
		
		die();
	}

	public function get_product_ids() {

		// get an array of product ids
		$products = new WooCommerce_POS_Product();
		$ids = $products->get_all_ids();

		$this->json_headers();
		echo json_encode( $ids );

		die();
	}

	public function get_modal() {

		include_once( dirname(__FILE__) . '/../views/modal/' . $_REQUEST['template'] . '.php' );
		die();
	}

	/**
	 * Search for customers and return json
	 * based on same method in woocommerce/includes/class-wc-ajax.php
	 * with a few changes to display more info
	 */
	public function json_search_customers() {
		check_ajax_referer( 'search-customers', 'security' );

		self::json_headers();

		$term = wc_clean( stripslashes( $_GET['term'] ) );

		if ( empty( $term ) ) {
			die();
		}

		// get the default customer
		$customer_id 	= get_option( 'woocommerce_pos_default_customer', 0 );
		$default 		= get_userdata( $customer_id );
		if( ! $default ) {
			$default = new WP_User(0);

			// $default->first_name = __( 'Guest', 'woocommerce-pos' );
			// 
			// using init() because __set throws a warning if WP_DEBUG true
			$data = array(
				'ID' 			=> 0,
				'first_name' 	=> __( 'Guest', 'woocommerce-pos' )
			);
			$default->init( (object)$data );
		}

		add_action( 'pre_user_query', array( __CLASS__, 'json_search_customer_name' ) );

		$customers_query = new WP_User_Query( apply_filters( 'woocommerce_pos_json_search_customers_query', array(
			'fields'         => 'all',
			'orderby'        => 'display_name',
			'search'         => '*' . $term . '*',
			'search_columns' => array( 'ID', 'user_login', 'user_email', 'user_nicename' )
		) ) );

		remove_action( 'pre_user_query', array( __CLASS__, 'json_search_customer_name' ) );

		$customers = $customers_query->get_results();
		
		// add the default customer to the results
		array_unshift( $customers, $default );

		foreach ( $customers as $customer ) {

			// use id as key to return unique array
			$found_customers[$customer->ID] = array(
				'id' 			=> $customer->ID,
				'display_name' 	=> $customer->display_name,
				'first_name' 	=> $customer->first_name,
				'last_name' 	=> $customer->last_name,
				'user_email' 	=> sanitize_email( $customer->user_email ),
			);
		}

		$this->json_headers();
		echo json_encode( $found_customers );
		die();
	}

	/**
	 * When searching using the WP_User_Query, search names (user meta) too
	 * @param  object $query
	 * @return object
	 */
	public static function json_search_customer_name( $query ) {
		global $wpdb;

		$term = wc_clean( stripslashes( $_GET['term'] ) );

		$query->query_from  .= " INNER JOIN {$wpdb->usermeta} AS user_name ON {$wpdb->users}.ID = user_name.user_id AND ( user_name.meta_key = 'first_name' OR user_name.meta_key = 'last_name' ) ";
		$query->query_where .= $wpdb->prepare( " OR user_name.meta_value LIKE %s ", '%' . like_escape( $term ) . '%' );
	}

	/**
	 * Output headers for JSON requests
	 */
	private function json_headers() {
		header( 'Content-Type: application/json; charset=utf-8' );
	}

}

new WooCommerce_POS_AJAX();