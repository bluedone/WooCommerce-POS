<?php
/**
 * Template for the reciept
 */
?>

<script type="text/template" id="tmpl-receipt">
  <div class="status"></div>
  <div class="list-header">
    <div class="qty"><?php _ex( 'Qty', 'Abbreviation of Quantity', 'woocommerce-pos' ); ?></div>
    <div class="title"><?php /* translators: woocommerce */ _e( 'Product', 'woocommerce' ); ?></div>
    <div class="price"><?php /* translators: woocommerce */ _e( 'Price', 'woocommerce' ); ?></div>
    <div class="total"><?php /* translators: woocommerce */ _e( 'Total', 'woocommerce' ); ?></div>
  </div>
  <div class="list"></div>
  <div class="list-totals"></div>
  <div class="list-actions"></div>
</script>

<script type="text/x-handlebars-template" id="tmpl-receipt-items">
{{#each line_items}}
  <li>
    <div class="qty">{{quantity}}</div>
    <div class="title">{{name}}</div>
    <div class="price">
      {{#if on_sale}}
      <del>{{{money regular_price}}}</del>
      <ins>{{{money price}}}</ins>
      {{else}}
      {{{money price}}}
      {{/if}}
    </div>
    <div class="total">
      {{#if on_sale}}
      <del>{{{money subtotal}}}</del>
      <ins>{{{money total}}}</ins>
      {{else}}
      {{{money total}}}
      {{/if}}
    </div>
  </li>
{{/each}}

{{#each shipping_lines}}
  <li>
    <div class="qty"></div>
    <div class="title">{{method_title}}</div>
    <div class="price"></div>
    <div class="total">{{{money total}}}</div>
  </li>
{{/each}}

{{#each fee_lines}}
  <li>
    <div class="qty"></div>
    <div class="title">{{title}}</div>
    <div class="price"></div>
    <div class="total">{{{money total}}}</div>
  </li>
{{/each}}
</script>

<script type="text/x-handlebars-template" id="tmpl-receipt-totals">
  <li class="subtotal">
    <div><?php /* translators: woocommerce */ _e( 'Cart Subtotal', 'woocommerce' ); ?>:</div>
    <div class="total">{{{money subtotal}}}</div>
  </li>
  {{#compare cart_discount '!==' 0}}
  <li class="cart-discount">
    <div><?php /* translators: woocommerce */ _e( 'Cart Discount', 'woocommerce' ); ?>:</div>
    <div class="total">{{{money cart_discount negative=true}}}</div>
  </li>
  {{/compare}}
  {{#compare total_tax '!==' 0}}
  {{#if itemized}}
  {{#each tax_lines}}
  {{#compare total '!==' 0}}
  <li class="tax">
    <div>
      {{#if ../incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
      {{title}}:
    </div>
    <div class="total">{{{money total}}}</div>
  </li>
  {{/compare}}
  {{/each}}
  {{else}}
  <li class="tax">
    <div>
      {{#if incl_tax}}<small>(<?php _ex( 'incl.', 'abbreviation for includes (tax)', 'woocommerce-pos' ); ?>)</small>{{/if}}
      <?php echo esc_html( WC()->countries->tax_or_vat() ); ?>:
    </div>
    <div class="total">{{{money total_tax}}}</div>
  </li>
  {{/if}}
  {{/compare}}
  <!-- order_discount removed in WC 2.3, included for backwards compat -->
  {{#compare order_discount '!==' 0}}
  <li class="order-discount">
    <div><?php /* translators: woocommerce */ _e( 'Order Discount', 'woocommerce' ); ?>:</div>
    <div class="total">{{{money order_discount negative=true}}}</div>
  </li>
  {{/compare}}
  <!-- end order_discount -->
  <li class="order-total">
    <div><?php /* translators: woocommerce */ _e( 'Order Total', 'woocommerce' ); ?>:</div>
    <div class="total">{{{money total}}}</div>
  </li>
  {{#if note}}
  <li class="note">
    <div>{{note}}</div>
  </li>
  {{/if}}
</script>