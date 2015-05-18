<?php

/**
 * WC REST API Class
 *
 * @class    WC_POS_API
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

class WC_POS_API {


  /**
   *
   */
  public function __construct() {
    if( ! is_pos() )
      return;

    add_filter( 'woocommerce_api_dispatch_args', array( $this, 'dispatch_args'), 10, 2 );
    add_filter( 'woocommerce_api_query_args', array( $this, 'woocommerce_api_query_args' ), 10, 2 );
  }

  /**
   * @param $args
   * @param $callback
   * @return mixed
   */
  public function dispatch_args($args, $callback){
    $wc_api_handler = get_class($callback[0]);

    switch($wc_api_handler){
      case 'WC_API_Products':
        new WC_POS_API_Products();
        break;
      case 'WC_API_Orders':
        new WC_POS_API_Orders();
        break;
      case 'WC_API_Customers':
        new WC_POS_API_Customers();
        break;
      case 'WC_API_Coupons':
        new WC_POS_API_Coupons();
        break;
    }

    return $args;
  }

  /**
   * @param $args
   * @param $request_args
   * @return mixed
   */
  public function woocommerce_api_query_args($args, $request_args){

    // required for compatibility WC < 2.3.5
    if ( ! empty( $request_args['in'] ) ) {
      $args['post__in'] = explode(',', $request_args['in']);
      unset( $request_args['in'] );
    }

    // pos query
    if ( ! empty( $request_args['not_in'] ) ) {
      $args['post__not_in'] = explode(',', $request_args['not_in']);
      unset( $request_args['not_in'] );
    }

    return $args;
  }

  /**
   * Get all the ids for a given post_type
   * @return json
   */
  static public function get_all_ids() {
    $entity = isset($_REQUEST['type']) ? $_REQUEST['type'] : false;
    $updated_at_min = isset($_REQUEST['updated_at_min']) ? $_REQUEST['updated_at_min'] : false;
    $handler = 'WC_POS_API_' . ucfirst( $entity );

    if(method_exists($handler, 'get_ids')){
      $result = $handler::get_ids($updated_at_min);
    } else {
      $result = new WP_Error(
        'woocommerce_pos_get_ids_error',
        /* translators: woocommerce */
        sprintf( __( 'There was an error calling %s::%s', 'woocommerce' ), 'WC_POS_API', $entity ),
        array( 'status' => 500 )
      );
    }

    WC_POS_AJAX::serve_response($result);
  }

}