define(['app', 'entities/cart/item', 'localstorage'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.CartItems = Backbone.Collection.extend({
			model: Entities.CartItem,

			initialize: function(models, options) { 
				// this.on('all', function(e) { console.log("Cart Items event: " + e); }); // debug	
				
				// localStorage
				this.localStorage = new Backbone.LocalStorage( 'cart-' + options.cartId );

				// update totals on change to collection
				this.on( 'add remove change', this.calcTotals );
			},

			calcTotals: function() {
				var subtotal 		= 0,
					cart_discount 	= 0,
					total_tax 		= 0,
					itemized_tax 	= [],
					tax_rates 		= {};

				// sum up the line totals
				subtotal = _( this.pluck('subtotal') ).reduce( function(memo, num){ return memo + num; }, 0 );
				cart_discount = _( this.pluck('line_discount') ).reduce( function(memo, num){ return memo + num; }, 0 );
				
				if( pos_params.wc.calc_taxes === 'yes' ) {
					total_tax = _( this.pluck('line_tax') ).reduce( function(memo, num){ return memo + num; }, 0 );			
				}

				// special case: itemized taxes
				if( total_tax !== 0 ) {
					tax_rates = this._tax_rates();
					_.each(tax_rates, function(tax, key) {
						var tax_sum = 0;
						tax_sum = _.reduce( _.compact( this.pluck( 'line_tax_' + key ) ), function(memo, num){ return memo + num; }, 0 );
						if( tax_sum !== 0 ) {
							itemized_tax.push({
								id: key,
								label: tax.label,
								total: this.roundNum( tax_sum )
							});
						}
					}, this);
				}

				// create totals object
				var totals = {
					'subtotal'		: this.roundNum( subtotal ),
					'cart_discount'	: this.roundNum( cart_discount ),
					'total_tax'		: this.roundNum( total_tax ),
					'itemized_tax'	: itemized_tax,
				};

				// now, update the totals
				this.trigger('update:totals', totals);

			},
	 
	 		/**
	 		 * grabs all the itemized taxes and merges them into one array
	 		 * @return {array}
	 		 */
			_tax_rates: function() {
				var tax_rates = [],
					all_rates = {};

				tax_rates = _.compact( this.pluck('tax_rates') );
				if( tax_rates.length > 0 ) {
					all_rates = _.reduce( tax_rates, function(a, b) { return _.merge(a, b); }, {});
				}
				return all_rates;
			},

			// Convenience method for rounding to 4 decimal places
			// TODO: mirror the functionality of WC_ROUNDING_PRECISION
			roundNum: function(num) {
				if( pos_params.wc.tax_round_at_subtotal === 'no' ) {
					return parseFloat( num.toFixed(4) );
				}
				return num;
			},

		});

	});

	return POS.Entities.CartItems;
});