<?php
/**
 * Template for the general settings
 */
?>

<h3><?= __( 'General Options', 'woocommerce-pos' ); ?></h3>

<table class="form-table">

	<tr>
		<th scope="row"><label for="grant_access"><?= __( 'Grant POS Access', 'woocommerce-pos' ); ?></label></th>
		<td>
			<select multiple name="grant_access" id="grant_access" class="select2">
				<?php global $wp_roles; if( $roles = $wp_roles->roles ): foreach( $roles as $slug => $role ):  ?>
					<option value="<?= $slug ?>"><?= $role['name'] ?></option>
				<?php endforeach; endif; ?>
			</select>
		</td>
	</tr>

	<tr>
		<th scope="row">
			<label for="checkbox">Checkbox:</label>
			<img data-toggle="tooltip" title="<?= __( 'Help tip', 'woocommerce-pos' ); ?>" src="<?= esc_url( WC()->plugin_url() ); ?>/assets/images/help.png" height="16" width="16" />
		</th>
		<td><input type="checkbox" name="checkbox" /></td>
	</tr>

	<tr>
		<th scope="row"><label for="select">Select:</label></th>
		<td>
			<select name="select" class="select2">
				<option value="888">Option 1</option>
				<option value="999">Option 2</option>
				<option value="000">Option 3</option>
			</select>
		</td>
	</tr>

</table>