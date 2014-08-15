define(['app', 'apps/checkout/show/show_view'], function(POS, View){
	
	POS.module('CheckoutApp.Show', function(Show, POS, Backbone, Marionette, $, _){
	
		Show.Controller = Marionette.Controller.extend({

			initialize: function(options) {

				// set cartId
				var id = options.cartId;
				if(0 === id % (!isNaN(parseFloat(id)) && 0 <= ~~id)) {
					this.cartId = id;
				} else {
					this.cartId = 1;
				}

				// get cart totals
				this.items = POS.Entities.channel.request('cart:items', { cartId: this.cartId });
				this.totals = POS.Entities.channel.request('cart:totals', { id: this.cartId, cart: this.items });

				// init layout
				this.layout = new View.Layout();

			},

			show: function(){
				
				this.listenTo( this.layout, 'show', function() {
					this._showStatusRegion();		
					this._showPaymentRegion();		
					this._showActionsRegion();		
				});

				POS.rightRegion.show(this.layout);

			},

			_showStatusRegion: function(){
				
				// get payment view
				var view = new View.Status({
					total: this.totals.get('total')
				});

				// show
				this.layout.statusRegion.show( view );
			},

			_showPaymentRegion: function(){
				
				// get payment view
				var view = new View.Payment();

				// show
				this.layout.paymentRegion.show( view );
			},

			_showActionsRegion: function(){
				
				// get payment view
				var view = new View.Actions();

				// return to sale
				this.listenTo( view, 'checkout:close', function(args) {
					POS.trigger('cart:list');
				});

				// show
				this.layout.actionsRegion.show( view );
			}

		});
		
	});

	return POS.CheckoutApp.Show.Controller;
});