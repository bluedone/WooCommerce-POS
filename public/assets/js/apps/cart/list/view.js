define(['app', 'handlebars', 'accounting'], function(POS, Handlebars, accounting){

	POS.module('CartApp.List.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-cart-layout',

			regions: {
				cartRegion: '#cart',
				cartCustomerRegion: '#cart-customer',
				cartActionsRegion: '#cart-actions',
				cartNotesRegion: '#cart-notes'
			},

			initialize: function() {

				// move this to a regionClass?
				this.cartCustomerRegion.on( 'show', function() {
					this.$el.show();
				});
				this.cartActionsRegion.on( 'show', function() {
					this.$el.show();
				});
				this.cartCustomerRegion.on( 'empty', function() {
					this.$el.hide();
				});
				this.cartActionsRegion.on( 'empty', function() {
					this.$el.hide();
				});
				this.cartNotesRegion.on( 'empty', function() {
					this.$el.hide();
				});
			}

		});
		
		View.CartItem = Marionette.ItemView.extend({
			tagName: 'tr',
			template: Handlebars.compile( $('#tmpl-cart-item').html() ),

			initialize: function( options ) {
				accounting.settings = pos_params.accounting;

				// remove any open popovers
				this.on( 'before:render before:destroy', function() { this.trigger( 'popover:close' ) });
			},

			behaviors: {
				AutoGrow: {},
				Pulse: {},
				Popover: {}
			},

			modelEvents: {
				'change': 'render'
			},

			events: {
				'click .action-remove' 	: 'removeFromCart',
				'click *[data-numpad]'  : 'numpadPopover',
				'keypress input'  		: 'updateOnEnter',
      			'blur input'      		: 'save'
			},

			removeFromCart: function(e) {
				e.preventDefault();
				this.trigger('cartitem:delete', this.model);
			},

			remove: function() {
				this.$el.parent('tbody').addClass('animating');
				this.$('td').addClass('bg-danger');
				var self = this;
				this.$el.fadeOut( 500, function() {
					self.$el.parent('tbody').removeClass('animating');
					Marionette.ItemView.prototype.remove.call(self);
				});
			},

			numpadPopover: function(e) {

				this.trigger( 'popover:open', {
					target 				: $(e.target),
					popoverTmpl 		: '<div class="arrow"></div><div class="popover-content"></div>',
					className 			: 'popover numpad-popover',
					attributes 			: { 'role' : 'textbox' },
					onShowPopover 		: this.onShowPopover
				});

			},

			onShowPopover: function() {
				this.numpad = POS.Components.channel.request('get:numpad', { 
					title: this.options.target.data('title'),
					value: this.options.target.val(),
					select: true
				});

				// hijack popover setContent, and show numpad instead
				this.options.target.data('bs.popover').__proto__.setContent = function() {};
				this.content.show(this.numpad);
			},

			save: function(e) {
				var input 	= $(e.target),
					key 	= input.data('id'),
					value 	= input.val(),
					decimal = accounting.unformat( value, accounting.settings.number.decimal );

				switch( key ) {
					case 'qty':
						if ( value === this.model.get('qty') ) { break; }
						if ( value === 0 ) {
							this.removeFromCart();
							break;
						}
						if ( value ) {
							this.model.save( { qty: value } );
							input.removeClass('editing');
						} else {
							input.focus();
						}
						break;

					case 'price':
						if( !isNaN( decimal ) ) {
							this.model.save( { display_price: decimal } );
						} else {
							input.focus();
						}
						break;		
				}

			},

			updateOnEnter: function(e) {

				// enter key triggers blur as well?
				if (e.keyCode === 13) { this.save(e); }
			},

		});

		var NoCartItemsView = Marionette.ItemView.extend({
			tagName: 'tr',
			className: 'empty',
			template: '#tmpl-cart-empty',
		});

		View.CartItems = Marionette.CompositeView.extend({
			template: '#tmpl-cart-items',
			childView: View.CartItem,
			childViewContainer: 'tbody',
			emptyView: NoCartItemsView,

		});

		View.CartTotals = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-cart-totals').html() ),

			behaviors: {
				Popover: {}
			},

			modelEvents: {
				'sync': 'render'
			},

			events: {
				'click .order-discount' 	: 'edit',
				'keypress .order-discount'	: 'saveOnEnter',
				'blur .order-discount'		: 'save',
			},

			edit: function(e) {
				var td = $(e.currentTarget).children('td');
				td.attr('contenteditable','true').text( td.data('value') );
				this.numpadPopover(e);
			},

			save: function(e) {
				var value = $(e.target).text();

				// if empty, go back to zero
				if( value === '' ) { value = 0; } 

				// validate
				if( isNaN( parseFloat( value ) ) ) {
					return;
				}

				// unformat number
				var decimal = accounting.unformat( value, accounting.settings.number.decimal );				

				// save
				this.model.save({ order_discount: decimal });
				// this.model.trigger('change:order_discount');
			},

			saveOnEnter: function(e) {

				// save note on enter
				if (e.which === 13) { 
					e.preventDefault();
					this.save(e);
					// $(e.currentTarget).children('td').blur();
				}
			},

			addDiscount: function() {
				console.log('discount!');
			},

			showDiscountRow: function() {
				// toggle discount row
				td = this.$('.order-discount').show().children('td');
				td.attr('contenteditable','true').text( td.data('value') );
			},

			numpadPopover: function(e) {
				this.trigger( 'popover:open', {
					target 				: $(e.target),
					popoverTmpl 		: '<div class="arrow"></div><div class="popover-content"></div>',
					className 			: 'popover numpad-popover',
					attributes 			: { 'role' : 'textbox' },
					onShowPopover 		: this.onShowPopover
				});
			},

			onShowPopover: function() {
				this.numpad = POS.Components.channel.request('get:numpad', { 
					title: this.options.target.data('title'),
					value: this.options.target.val(),
					select: true
				});

				// hijack popover setContent, and show numpad instead
				this.options.target.data('bs.popover').__proto__.setContent = function() {};
				this.content.show(this.numpad);
			},

		});

		View.CartActions = Marionette.ItemView.extend({
			template: _.template( $('#tmpl-cart-actions').html() ),

			initialize: function() {
				// this.on('all', function(e) { console.log("Cart Actions View event: " + e); }); // debug
			},

			triggers: {
				'click .action-void' 	: 'cart:void:clicked',
				'click .action-note' 	: 'cart:note:clicked',
				'click .action-discount': 'cart:discount:clicked',
				'click .action-checkout': 'cart:checkout:clicked'
			}

		});

		View.Notes = Marionette.ItemView.extend({
			template: _.template( '<%= note %>' ),

			modelEvents: {
				'change:note': 'render'
			},

			events: {
				'click' 	: 'edit',
				'keypress'	: 'saveOnEnter',
				'blur'		: 'save',
			},

			onShow: function() {
				this.showOrHide();
			},

			showOrHide: function() {
				if( this.model.get('note') === '' ) {
					this.$el.parent('#cart-notes').hide();
				}
			},

			edit: function(e) {
				this.$el.attr('contenteditable','true').focus();
			},

			save: function(e) {
				var value = this.$el.text();

				// validate and save
				this.model.save({ note: value });
				this.$el.attr('contenteditable','false');
				this.showOrHide();
			},

			saveOnEnter: function(e) {
				// save note on enter
				if (e.which === 13) { 
					e.preventDefault();
					this.$el.blur();
				}
			},

			showNoteField: function() {
				this.$el.parent('#cart-notes').show();
				this.$el.attr('contenteditable','true').focus();
			}
		});

	});

	return POS.CartApp.List.View;
});