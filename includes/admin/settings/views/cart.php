<?php
/**
 * Template for the cart settings
 */

use WC_POS\API\Params;
use WC_POS\Tax;

?>

<h3><?php /* translators: woocommerce */ _e( 'Shipping Options', 'woocommerce' ); ?></h3>

<table class="wc_pos-form-table">

  <tr>
    <th scope="row">
      <label for="shipping.name"><?php /* translators: woocommerce */ _e( 'Shipping Name', 'woocommerce' ) ?></label>
    </th>
    <th scope="row">
      <label for="shipping.method"><?php /* translators: woocommerce */ _e( 'Shipping Method', 'woocommerce' ) ?></label>
    </th>
    <th scope="row">
      <label for="shipping.taxable"><?php /* translators: woocommerce */ _e( 'Taxable', 'woocommerce' ) ?></label>
    </th>
    <th scope="row">
      <label for="shipping.price">
        <?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ) ?>
        (<?php echo get_woocommerce_currency_symbol( get_woocommerce_currency() ); ?>)
      </label>
    </th>
  </tr>

  <tr>
    <td>
      <input type="text" name="shipping.name" id="shipping.name" placeholder="<?php /* translators: woocommerce */ _e( 'Shipping', 'woocommerce' ) ?>" style="width:250px" />
    </td>
    <td>
      <select name="shipping.method" id="shipping.method">
        <?php foreach( Params::shipping_labels() as $slug => $label ): ?>
          <option value="<?php echo esc_attr($slug); ?>"><?php echo esc_html($label); ?></option>
        <?php endforeach; ?>
      </select>
    </td>
    <td>
      <input type="checkbox" name="shipping.taxable" id="shipping.taxable" />
      <select name="shipping.tax_class" id="shipping.tax_class">
        <?php foreach( Tax::tax_classes() as $slug => $label ): ?>
          <option value="<?php echo esc_attr($slug); ?>"><?php echo esc_html($label); ?></option>
        <?php endforeach; ?>
      </select>
    </td>
    <td>
      <input type="text" name="shipping.price" id="shipping.price" placeholder="0" style="width:70px" />
    </td>
  </tr>

</table>

<h3><?php _e( 'Fee Options', 'woocommerce-pos' ); ?></h3>

<table class="wc_pos-form-table">

  <tr>
    <th scope="row">
      <label for="fee.name"><?php /* translators: woocommerce */ _e( 'Fee Name', 'woocommerce' ) ?></label>
    </th>
    <th scope="row">
      <label for="shipping.taxable"><?php /* translators: woocommerce */ _e( 'Taxable', 'woocommerce' ) ?></label>
    </th>
    <th scope="row">
      <label for="fee.price">
        <?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ) ?>
        (<?php echo get_woocommerce_currency_symbol( get_woocommerce_currency() ); ?>)
      </label>
    </th>
  </tr>

  <tr>
    <td>
      <input type="text" name="fee.name" id="fee.name" placeholder="<?php /* translators: woocommerce */ _e( 'Fee', 'woocommerce' ) ?>" style="width:250px" />
    </td>
    <td>
      <input type="checkbox" name="fee.taxable" id="fee.taxable" />
      <select name="fee.tax_class" id="fee.tax_class">
        <?php foreach( Tax::tax_classes() as $slug => $label ): ?>
          <option value="<?php echo esc_attr($slug); ?>"><?php echo esc_html($label); ?></option>
        <?php endforeach; ?>
      </select>
    </td>
    <td>
      <input type="text" name="fee.price" id="fee.price" placeholder="0" style="width:70px" />
    </td>
  </tr>

</table>