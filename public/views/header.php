<!DOCTYPE html>
<html lang="en-US">
<head>
	<meta charset="UTF-8" />
	<title>Point of Sale - <?php bloginfo('name') ?></title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="apple-mobile-web-app-capable" content="yes" />

	<?php WooCommerce_POS::pos_print_css(); ?>
	<?php WooCommerce_POS::pos_print_js('head'); ?>
	
</head>
<body>
<div id="page" class="site">
	<header id="masthead" role="banner" class="site-header">
		<a href="#menu" id="menu-btn" class="btn-header alignleft"><i class="fa fa-bars"></i> <span>Menu</span></a>
		<div class="dropdown alignright">
			<a href="#" class="btn-header" data-toggle="dropdown">
				<i class="fa fa-cog"></i> <span><?php _e( 'Howdy', 'woocommerce-pos' ); ?>, <?php global $current_user; get_currentuserinfo(); echo $current_user->display_name ?></span>
			</a>
			<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
				<li><a href="<?php echo wp_logout_url( home_url() ); ?>" title="Logout">Logout</a></li>
			</ul>
		</div>
		<h1><?php bloginfo( 'name' ); ?></h1>
	</header><!-- /header -->
