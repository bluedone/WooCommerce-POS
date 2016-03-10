<?php

/**
 * POS Receipts Settings Class
 *
 * @class    WC_POS_Admin_Settings_Receipts
 * @package  WooCommerce POS
 * @author   Paul Kilmurray <paul@kilbot.com.au>
 * @link     http://www.woopos.com.au
 */

namespace WC_POS\Admin\Settings;

class Receipts extends Page {

  protected static $instance;

  /**
   * Each settings tab requires an id and label
   */
  public function __construct() {
    $this->id    = 'receipts';
    $this->label = __( 'Receipts', 'woocommerce-pos' );

    $this->section_handlers = array(
      '\WC_POS\Admin\Settings\Receipt\Options',
      '\WC_POS\Admin\Settings\Receipt\Template'
    );
  }

}