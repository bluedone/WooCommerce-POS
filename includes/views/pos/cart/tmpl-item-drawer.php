{{#if product_id}}
<div class="list-row">
  <div><?php /* translators: woocommerce */ _e( 'Regular price', 'woocommerce' ); ?>:</div>
  <div>
    <input name="regular_price" id="regular_price" class="form-control autogrow" type="text" data-numpad="amount" data-label="<?php /* translators: woocommerce */ _e( 'Regular price', 'woocommerce' ); ?>" />
  </div>
</div>

{{/if}}

{{#is type 'shipping'}}
<div class="list-row">
  <div><?php /* translators: woocommerce */ _e( 'Shipping Method', 'woocommerce' ); ?>:</div>
  <div>
    <select class="c-select" name="method_id" id="method_id"></select>
  </div>
</div>
{{/is}}

<div class="list-row">
  <div><?php /* translators: woocommerce */ _e( 'Taxable', 'woocommerce' ); ?>:</div>
  <div>
    <label class="c-input c-checkbox">
      <input type="checkbox" name="taxable" id="taxable"><span class="c-indicator"></span>
    </label>
    <select class="c-select" name="tax_class" id="tax_class" {{#unless taxable}}disabled{{/unless}}></select>
  </div>
</div>

{{#if product_id}}
<div class="list-row">
  <div><?php /* translators: woocommerce */ _e( 'Add&nbsp;meta', 'woocommerce' ); ?>:</div>
  <div>
    {{#each meta}}
      <span data-key="{{key}}">
        <input name="meta.label" value="{{label}}" type="text" class="form-control">
        <textarea name="meta.value" class="form-control">{{value}}</textarea>
        <a href="#" data-action="remove-meta">
          <i class="icon-remove icon-lg"></i>
        </a>
      </span>
    {{/each}}
    <a href="#" data-action="add-meta">
      <i class="icon-add icon-lg"></i>
    </a>
  </div>
</div>
{{/if}}