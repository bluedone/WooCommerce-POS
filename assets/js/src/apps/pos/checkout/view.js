POS.module('POSApp.Checkout', function(Checkout, POS, Backbone, Marionette, $, _) {

    Checkout.Layout = Marionette.LayoutView.extend({
        template: _.template( $('#tmpl-checkout').html() ),
        tagName: 'section',
        regions: {
            gatewaysRegion : '.checkout-gateways'
        },
        attributes: {
            'class' : 'module checkout-module'
        }
    });
});