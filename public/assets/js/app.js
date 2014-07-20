 define(['marionette', 'apps/config/marionette/regions/modal'], function(Marionette){
	
	var POS = new Marionette.Application();

	POS.addRegions({
		headerRegion: '#header',
		leftRegion: '#left-panel',
		rightRegion: '#right-panel',
		dialogRegion: Marionette.Region.Modal.extend({
			el: '#modal'
		}),
		numpadRegion: '#numpad'
	});

	POS.navigate = function(route, options){
		options || (options = {});
		Backbone.history.navigate(route, options);
	};

	POS.getCurrentRoute = function(){
		return Backbone.history.fragment;
	};

	POS.startSubApp = function(appName, args){
		var currentApp = appName ? POS.module( appName ) : null;
		if ( POS.currentApp === currentApp ){ return; }

		if ( POS.currentApp ){
			POS.currentApp.stop();
		}

		POS.currentApp = currentApp;
			if( currentApp ){
			currentApp.start( args );
		}
	};

	POS.on('start', function(){
		if(Backbone.history){
			require([
				'apps/products/products_app', 			// products
				'apps/cart/cart_app',					// cart
				'apps/checkout/checkout_app'			// checkout
			], function () {
				Backbone.history.start();

				// show products 
				POS.trigger('products:list');

				if(POS.getCurrentRoute() === ''){

					// default to cart
					POS.trigger('cart:list');
				}
			});
		}
	});

	return POS;
});