POS.module('Entities.Cart', function(Cart, POS, Backbone, Marionette, $, _) {

    Cart.Collection = Backbone.Collection.extend({
        model: Cart.Model,
        local: true,

        initialize: function (models, options) {
            this.indexedDB = new Backbone.IndexedDB({
                storeName: 'cart',
                storePrefix: 'wc_pos_',
                dbVersion: 1,
                keyPath: 'local_id',
                autoIncrement: true,
                indexes: [
                    {name: 'local_id', keyPath: 'local_id', unique: true},
                    {name: 'id', keyPath: 'id', unique: false},
                    {name: 'order', keyPath: 'order', unique: false},
                    {name: 'status', keyPath: 'status', unique: false}
                ]
            }, this);

            if (options.order) {
                this.order = options.order;
            }

            this.on( 'add remove change', this.calcTotals );
        },

        calcTotals: function() {
            var subtotal,
                subtotal_tax,
                cart_discount,
                total_tax = 0,
                total,
                itemized_tax 	= [],
                tax_rates 		= {};

            // sum up the line totals
            subtotal 	  = _( this.pluck('subtotal') ).reduce( function(memo, num){ return memo + num; }, 0 );
            subtotal_tax  = _( this.pluck('subtotal_tax') ).reduce( function(memo, num){ return memo + num; }, 0 );
            total 		  = _( this.pluck('total') ).reduce( function(memo, num){ return memo + num; }, 0 );

            if( POS.tax.calc_taxes === 'yes' ) {
                total_tax = _( this.pluck('total_tax') ).reduce( function(memo, num){ return memo + num; }, 0 );
            }

            // create totals object
            var totals = {
                'subtotal'		: POS.round( subtotal, 4 ),
                'subtotal_tax'	: POS.round( subtotal_tax, 4 ),
                'cart_discount'	: POS.round( subtotal - total, 4 ),
                'total_tax'		: POS.round( total_tax, 4 ),
                //'itemized_tax'	: itemized_tax
            };

            this.order.save( totals );

        },

        fetchOrder: function (order_id) {
            var self = this,
                promise = $.Deferred();
            var onItem = function (item) {
                if (item.order === order_id) {
                    self.add(item);
                }
            }
            var onEnd = function () {
                promise.resolve();
            };
            self.indexedDB.iterate(onItem, {
                index: 'order',
                order: 'ASC',
                onEnd: onEnd
            });
            return promise;
        }
    });

});