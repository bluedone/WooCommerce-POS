POS.module('Components.Filter', function(Filter, POS, Backbone, Marionette, $, _) {

    Filter.Behavior = Marionette.Behavior.extend({

        ui: {
            searchField : 'input[type=search]',
            clearBtn 	: 'a.clear'
        },

        events: {
            'keyup @ui.searchField' : 'query',
            'click @ui.clearBtn'    : 'clear'
        },

        query: _.debounce( function(){
            this.showClearButtonMaybe();
            this.view.trigger( 'search:query', this.ui.searchField.val() );
        }, 149),

        // clear the filter
        clear: function(e) {
            e.preventDefault();
            this.view.collection.removeFilter('search');
            this.ui.searchField.val('');
            this.showClearButtonMaybe();
        },

        showClearButtonMaybe: function() {
            _.isEmpty( this.ui.searchField.val() ) ? this.ui.clearBtn.hide() : this.ui.clearBtn.show() ;
        }

    });

});