<?php
  // using global user info
  global $current_user;
?>
<li class="list-row">
  <div class="label"><?php /* translators: wordpress */ _e( 'Name' ); ?>:</div>
  <div class="input" data-name="name" contenteditable><?php
    if( $current_user->first_name != '' || $current_user->last_name != '' ){
      echo $current_user->first_name .' '. $current_user->last_name;
    } else {
      echo $current_user->display_name;
    }
    ?></div>
</li>
<li class="list-row">
  <div class="label"><?php /* translators: wordpress */ _e( 'Email' ); ?>:</div>
  <div class="input" data-name="email" contenteditable><?php echo $current_user->user_email ?></div>
</li>
<li class="list-row">
  <div class="label"><?php /* translators: wordpress */ _e( 'Message' ); ?>:</div>
  <div class="input" data-name="message" placeholder="<?php _e('Describe your problem here ...', 'woocommerce-pos') ?>" contenteditable></div>
</li>
<li class="list-row no-border">
  <div>
    <label class="c-input c-checkbox small">
      <input type="checkbox" name="reports[]" value="pos" checked="checked">
      <span class="c-indicator"></span>
      <?php _e( 'Append POS system report', 'woocommerce-pos' ); ?>
    </label>
    <a href="#" class="toggle"><i class="icon-info-circle"></i></a>
    <textarea class="form-control" id="pos_status" name="pos_status" class="small" style="display:none" readonly>Shop URL: <?php echo get_bloginfo('url')."\n"; ?></textarea>
  </div>
</li>