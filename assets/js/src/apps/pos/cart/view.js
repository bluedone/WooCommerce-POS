POS.module('POSApp.Cart', function(Cart, POS, Backbone, Marionette, $, _) {

    Cart.Layout = Marionette.LayoutView.extend({
        template: _.template( $('#tmpl-cart').html() ),
        tagName: 'section',
        regions: {
            listRegion: '.list',
            totalsRegion: '.list-totals',
            actionsRegion: '.cart-actions'
        },
        attributes: {
            class: 'module cart-module'
        }
    });

    /**
     * Single Cart Item
     */
    Cart.Item = Marionette.ItemView.extend({
        tagName: 'li',

        initialize: function() {
            this.template = Handlebars.compile( $('#tmpl-cart-item').html() )
        },

        behaviors: {
            AutoGrow: {},
            Pulse: {},
            //Numpad: {}
        },

        modelEvents: {
            'change': 'render'
        },

        events: {
            'click .action-remove' 	: 'removeItem',
            'keypress input'  		: 'saveOnEnter',
            'blur input'      		: 'onBlur'
        },

        remove: function() {
            this.$el.parent('ul').addClass('animating');
            this.$('li').addClass('bg-danger');
            this.$el.fadeOut( 500, function() {
                this.$el.parent('ul').removeClass('animating');
                Marionette.ItemView.prototype.remove.call(this);
            }.bind(this));
        },

        removeItem: function() {
            this.model.destroy();
        }

    });

    /**
     * Cart Collection
     */
    Cart.EmptyView = Marionette.ItemView.extend({
        tagName: 'li',
        template: '#tmpl-cart-empty'
    });

    Cart.List = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: Cart.Item,
        emptyView: Cart.EmptyView,

        serializeData: function(data) {
            console.log(data);
        }
    });

    /**
     * Cart Totals
     */
    Cart.Totals = Marionette.ItemView.extend({
        tagName: 'ul',

        initialize: function() {
            this.template = Handlebars.compile($('#tmpl-cart-totals').html());
        },

        modelEvents: {
            'change': 'render'
        }
    });

    /**
     * Cart Actions
     */
    Cart.Actions = Marionette.ItemView.extend({
        template: _.template( $('#tmpl-cart-actions').html() ),

        triggers: {
            'click .action-void' 	: 'cart:void:clicked',
            'click .action-note' 	: 'cart:note:clicked',
            'click .action-discount': 'cart:discount:clicked',
            'click .action-checkout': 'cart:checkout:clicked'
        }

    });

});