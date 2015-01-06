POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){

    Numpad.Layout = Marionette.LayoutView.extend({
        template: _.template( '<div class="numpad"><div class="numpad-header"></div><div class="numpad-keys"></div></div>' ),

        regions: {
            headerRegion: '.numpad-header',
            keysRegion: '.numpad-keys'
        }

    });

    Numpad.Header = POS.View.Form.extend({
        initialize: function() {
            this.template = Numpad.HeaderTmpl;

            //if( this.model.get('type') === 'discount' || this.model.get('type') === 'item_price' ){
            //    this.model.set({
            //        currency_symbol: accounting.settings.currency.symbol,
            //        mode: 'amount'
            //    });
            //    this.calcPercentage();
            //    this.model.on( 'change:value', this.calcPercentage, this );
            //    this.model.on( 'change:percentage', this.calcValue, this );
            //}
        },

        bindings: {
            'input[name="value"]'       : {
                observe: 'value',
                //onGet: POS.Utils.formatNumber,
                //onSet: function(val){
                //    console.log(val);
                //    return val;
                //},
                afterUpdate: function($el, val, options){
                    $el.trigger('input');
                }
            },
            'input[name="percentage"]'  : 'percentage'
        },

        ui: {
            inputField: 'input'
        },

        behaviors: {
            AutoGrow: {}
        },

        events: {
            'keyup @ui.inputField' 	: 'directInput',
            'click *[data-modifier]': 'modifier'
        },

        modelEvents: {
            'change:mode': 'onChangeMode'
        },

        modifier: function(e){
            var modifier = $(e.currentTarget).data('modifier'),
                value = this.model.get('value');

            if( this.model.get('type') === 'quantity' ) {
                this.model.set('value', (modifier === 'increase' ? ++value : --value) );
            }

            if( this.model.get('type') === 'discount' ){
                this.model.set({ mode: modifier });
            }
        },

        onChangeMode: function(){
            this.$('a[data-modifier]').toggleClass( 'disabled' );
            this.$('input').toggle();
        },

        //onShow: function() {
        //    if( this.model.get('select') ) {
        //        this.ui.inputField.select();
        //    }
        //},
        //
        //directInput: function(e) {
        //    var newValue = $(e.target).val();
        //    this.model.set({ value: newValue.toString(), select: false }, { silent: true });
        //    if( e.which === 13 ) {
        //        this.trigger('enter:keypress');
        //    }
        //},

    });

    Numpad.Keys = Marionette.ItemView.extend({
        initialize: function() {
            this.template = Numpad.NumkeysTmpl;
        },

        events: {
            'click .keys a': 'onKeyClick'
        },

        serializeData: function(){
            var data = this.model.toJSON();
            if( data.type === 'tendered' ) {
                data.quick_key = this.cashKeys();
            }
            return data;
        },

        onKeyClick: function(e){
            e.preventDefault();
            var key = $(e.currentTarget),
                parent = key.parent(),
                keyValue = key.text();

            // set decimal flag
            if( key.hasClass('decimal') ){
                this.decimal = true;
                return;
            }

            //
            if( parent.hasClass('extra-keys discount') ) {
                this.discountKeys(keyValue);
                return;
            }

            //
            if( parent.hasClass('extra-keys tendered') ) {
                this.tenderedKeys(keyValue);
                return;
            }

            this.standardKeys(keyValue);
            this.decimal = false;
        },

        standardKeys: function(keyValue){
            var data = {},
                newValue,
                decimal,
                mode = this.model.get('mode'),
                oldValue = mode === 'percentage' ? this.model.get('percentage') : this.model.get('value');

            switch(keyValue) {
                case 'return':
                    this.trigger('return:keypress');
                    return;
                case 'del':
                    newValue = Math.abs( oldValue ) < 10 ? 0 : oldValue.toString().slice(0, -1);
                    break;
                case '+/-':
                    newValue = oldValue*-1;
                    break;
                default:
                    oldValue = oldValue.toString();
                    decimal = this.decimal && oldValue.indexOf('.') === -1 ? '.' : '';
                    newValue = oldValue + decimal + keyValue;
            }

            data[mode] = newValue;
            this.model.set(data);

        },

        discountKeys: function(keyValue){
            var discount = keyValue.replace('%', '');
            this.model.set({
                percentage: parseFloat(discount),
                mode: 'percentage'
            });
        },

        tenderedKeys: function(keyValue) {
            this.model.set({ value: parseFloat(keyValue) });
        },

        // create 4 quick keys based on amount
        cashKeys: function(){
            var coins = POS.denominations.coins,
                notes = POS.denominations.notes,
                amount = parseFloat( this.model.get('original') ),
                keys = [],
                x;

            if( amount === 0 ) {
                return notes.slice(-4);
            }

            // round for two coins
            _.each( coins, function(coin) {
                if( _.isEmpty(keys) ) {
                    x = Math.round( amount / coin );
                } else {
                    x = Math.ceil( amount / coin );
                }
                keys.push( x * coin );
            });

            keys = _.uniq(keys, true).slice(0, 2);


            // round for two notes
            _.each( notes, function(note) {
                x = Math.ceil( amount / note );
                keys.push( x * note );
            });

            keys = _.uniq(keys, true).slice(0, 4);

            return keys;
        }

    });

});