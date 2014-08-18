define(['app', 'handlebars'], function(POS, Handlebars){

	POS.module('CheckoutApp.Payment.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-checkout',

			regions: {
				statusRegion: '#checkout-status',
				paymentRegion: '#checkout-payment',
				actionsRegion: '#checkout-actions',
			}
		});

		View.Status = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-checkout-status').html() ),

			// initialize: function(options) {
				
			// }

		});

		View.Payment = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-checkout-payment').html() ),

			behaviors: {
				Collapse: {
					// options
				},
			},

			events: {
				'click *[data-numpad]'  : 'numpadPopover',
			},

			onRender: function(){
				this.$('.panel').on('show.bs.collapse', function(e){
					$(e.target).closest('.panel').removeClass('panel-default').addClass('panel-success');
				});
				this.$('.panel').on('hide.bs.collapse', function(e){
					$(e.target).closest('.panel').removeClass('panel-success').addClass('panel-default');
				});
			},

			onShow: function() {
				if(Modernizr.touch) {
					this.$('*[data-numpad]').attr('readonly', true);
				}
			},

			removePopovers: function() {
				POS.Components.Popover.channel.command( 'close' );
			},

			numpadPopover: function(e) {
				if( $(e.target).attr('aria-describedby') ) {
					return;
				}

				// much hack, trying to force close popovers
				var self = this;

				POS.Components.Numpad.channel.command( 'showPopover', { target: $(e.target) } );
				$(e.target).on( 'numpad:return', function( e, value ) {
					$(e.target).val( value ).trigger('blur');
					self.removePopovers();
				});
			}

		});

		View.Actions = Marionette.ItemView.extend({
			template: _.template( $('#tmpl-checkout-actions').html() ),

			triggers: {
				'click .action-close' 	: 'checkout:close'
			},

			events: {
				'click .action-process' : 'processPayment'
			},

			processPayment: function() {

				// get any payment form inputs
				var fields = {};
				_( $('#checkout-payment').find('form.panel-success').serializeArray() ).each( function(o){
					var n = o.name,
						v = o.value;

					fields[n] = fields[n] === undefined ? v
							: _.isArray( fields[n] ) ? fields[n].concat( v )
							: [ fields[n], v ];
				}, this);

				if( _.isEmpty(fields) ) {
					if(POS.debug) console.warn('No payment method selected');
				} else {
					this.model.processPayment( fields );
				}
				
			}

		});

	});

	return POS.CheckoutApp.Payment.View;

});