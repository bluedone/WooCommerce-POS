<?php

/**
 * AJAX Event Handler
 *
 * Handles the ajax
 *
 * @class     WC_POS_AJAX
 * @package   WooCommerce POS
 * @author    Paul Kilmurray <paul@kilbot.com.au>
 * @link      http://www.woopos.com.au
 */

class WC_POS_AJAX {

  /**
   * Hook into ajax events
   *
   * @param WC_POS_i18n $i18n
   */
  public function __construct(WC_POS_i18n $i18n) {

    $ajax_events = array(
      'get_all_ids'           => 'WC_POS_API',
      'get_modal'             => $this,
      'get_print_template'    => $this,
//      'set_product_visibilty' => $this,
      'email_receipt'         => $this,
      'admin_settings'        => $this,
      'send_support_email'    => $this,
      'update_translations'   => $i18n,
      'test_http_methods'     => $this,
      'system_status'         => $this,
      'toggle_legacy_server'  => 'WC_POS_Status'
    );

    foreach ( $ajax_events as $ajax_event => $class ) {
      // check_ajax_referer
      add_action( 'wp_ajax_wc_pos_' . $ajax_event, array( $this, 'check_ajax_referer' ), 1 );
      // trigger method
      add_action( 'wp_ajax_wc_pos_' . $ajax_event, array( $class, $ajax_event ) );
    }
  }

  public function get_modal() {

    if( isset( $_REQUEST['data']) )
      extract( $_REQUEST['data'] );

    include_once( dirname(__FILE__) . '/views/modals/' . $_REQUEST['template'] . '.php' );
    die();
  }

  public function get_print_template() {

    // check for custom template
    $template_path_theme = '/woocommerce-pos/';
    $template_path_plugin = WC_POS()->plugin_path. 'public/views/print/';

    wc_get_template( $_REQUEST['template'] . '.php', null, $template_path_theme, $template_path_plugin );

    die();
  }

  /**
   * Update POS visibilty option
   */
//  public function set_product_visibilty() {
//
//    if( !isset( $_REQUEST['post_id'] ) )
//      wp_die('Product ID required');
//
//    // security
//    check_ajax_referer( 'set-product-visibilty-'.$_REQUEST['post_id'], 'security' );
//
//    // set the post_meta field
//    if( update_post_meta( $_REQUEST['post_id'], '_pos_visibility', $_REQUEST['_pos_visibility'] ) ) {
//      $post_modified     = current_time( 'mysql' );
//      $post_modified_gmt = current_time( 'mysql', 1 );
//      wp_update_post( array(
//        'ID'        => $_REQUEST['post_id'],
//        'post_modified'   => $post_modified,
//        'post_modified_gmt' => $post_modified_gmt
//      ));
//      $result = array('success' => true);
//    }
//    else {
//      wp_die('Failed to update post meta table');
//    }
//
//    $this->serve_response($result);
//  }

  /**
   * POS Settings stored in options table
   */
  public function admin_settings() {
    $result = $this->process_admin_settings();
    WC_POS_Server::response($result);
  }

  private function process_admin_settings(){
    // validate
    if(!isset($_GET['id']))
      return new WP_Error(
        'woocommerce_pos_settings_error',
        __( 'There is no settings id', 'woocommerce-pos' ),
        array( 'status' => 400 )
      );

    $id   = $_GET['id'];
    $data = WC_POS_Server::get_raw_data();

    // special case: gateway_
    $gateway_id = preg_replace( '/^gateway_/', '', strtolower( $id ), 1, $count );
    if($count){
      $handler = new WC_POS_Admin_Settings_Gateways($gateway_id);

      // else, find handler by id
    } else {
      $handlers = (array) WC_POS_Admin_Settings::handlers();
      if(!isset($handlers[$id]))
        return new WP_Error(
          'woocommerce_pos_settings_error',
          sprintf( __( 'No handler found for %s settings', 'woocommerce-pos' ), $_GET['id']),
          array( 'status' => 400 )
        );
      $handler = new $handlers[$id]();
    }

    // Compatibility for clients that can't use PUT/PATCH/DELETE
    $method = strtoupper($_SERVER['REQUEST_METHOD']);
    if ( isset( $_GET['_method'] ) ) {
      $method = strtoupper( $_GET['_method'] );
    } elseif ( isset( $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ) ) {
      $method = strtoupper( $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] );
    }

    // get
    if( $method === 'GET' ) {
      return $handler->get();
    }

    // set
    if( $method === 'POST' || $method === 'PUT' ) {
      return $handler->set($data);
    }

    // delete
    if( $method === 'DELETE' ) {
      return $handler->delete($data);
    }

    return new WP_Error(
      'woocommerce_pos_cannot_'.$method.'_'.$id,
      __( 'Settings error', 'woocommerce-pos' ),
      array( 'status' => 405 )
    );
  }

  /**
   * Send email receipt
   */
  public function email_receipt() {
    $order_id = isset($_REQUEST['order_id']) ? $_REQUEST['order_id'] : '';
    $email    = isset($_REQUEST['email']) ? $_REQUEST['email'] : '';
    $order    = wc_get_order( absint( $order_id ) );
    if( is_object( $order ) ) {
      if( $email != '' ){
        $order->billing_email = $email;
      }
      WC()->mailer()->customer_invoice( $order );
      $response = array(
        'result' => 'success',
        'message' => __( 'Email sent', 'woocommerce-pos')
      );

      // hook for third party plugins
      do_action( 'woocommerce_pos_email_receipt', $email, $order_id, $order );
    } else {
      $response = array(
        'result' => 'error',
        'message' => __( 'There was an error sending the email', 'woocommerce-pos')
      );
    }
    WC_POS_Server::response($response);
  }

  /**
   *
   */
  public function send_support_email() {
    $headers[]  = 'From: '. $_POST['name'] .' <'. $_POST['email'] .'>';
    $message    = $_POST['message'] . "\n\n" . $_POST['status'];
    $support    = apply_filters( 'woocommerce_pos_support_email', 'support@woopos.com.au' );
    if( wp_mail( $support, 'WooCommerce POS Support', $message, $headers ) ) {
      $response = array(
        'result' => 'success',
        'message' => __( 'Email sent', 'woocommerce-pos')
      );
    } else {
      $response = array(
        'result' => 'error',
        'message' => __( 'There was an error sending the email', 'woocommerce-pos')
      );
    }

    WC_POS_Server::response($response);
  }

  /**
   * Returns payload for any request for testing
   */
  public function test_http_methods(){
    WC_POS_Server::response( array(
      'method' => strtolower($_SERVER['REQUEST_METHOD']),
      'payload' => WC_POS_Server::get_raw_data()
    ));
  }

  /**
   * Returns system status JSON array
   */
  public function system_status(){
    $status = new WC_POS_Status();
    WC_POS_Server::response( $status->output() );
  }

  /**
   * Verifies the AJAX request
   */
  public function check_ajax_referer(){
    $pass = check_ajax_referer( WC_POS_PLUGIN_NAME, 'security', false );
    if(!$pass){
      $result = new WP_Error(
        'woocommerce_pos_invalid_nonce',
        __( 'Invalid security nonce', 'woocommerce-pos' ),
        array( 'status' => 401 )
      );
      WC_POS_Server::response($result);
    }
  }

}