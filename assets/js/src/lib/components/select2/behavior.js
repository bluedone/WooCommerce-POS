var POS = (function(App) {

    App.Behaviors.Select2 = Marionette.Behavior.extend({

        initialize: function(options){

            this.options = _.defaults(options, {
                minimumInputLength	: 2,
                //formatNoMatches		: pos_params.select.no_matches,
                //formatSearching		: pos_params.select.searching,
                //formatLoadMore		: pos_params.select.load_more,
                //formatInputTooShort	: this.formatInputTooShort,
                //formatInputTooLong	: this.formatInputTooLong,
                //formatSelectionTooBig: this.formatSelectionTooBig,
                formatResult		: this.view.formatResult,
                formatSelection 	: this.view.formatSelection,

                formatMatches: function (matches) { if (matches === 1) { return "One result is available, press enter to select it."; } return matches + " results are available, use up and down arrow keys to navigate."; },
                formatNoMatches: function () { return "No matches found"; },
                formatInputTooShort: function (input, min) { var n = min - input.length; return "Please enter " + n + " or more character" + (n == 1 ? "" : "s"); },
                formatInputTooLong: function (input, max) { var n = input.length - max; return "Please delete " + n + " character" + (n == 1 ? "" : "s"); },
                formatSelectionTooBig: function (limit) { return "You can only select " + limit + " item" + (limit == 1 ? "" : "s"); },
                formatLoadMore: function (pageNumber) { return "Loading more results…"; },
                formatSearching: function () { return "Searching…"; }
            });

        },

        ui: {
            select: '.select2'
        },

        onRender: function() {
            this.ui.select.select2( this.options );
        },

        onBeforeDestroy: function() {
            this.ui.select.select2( 'destroy' );
        },

        formatInputTooShort: function( input, min ) {
            var n = min - input.length;
            if( n > 1 ) {
                var str = pos_params.select.too_shorts;
                return str.replace( "%d", n );
            } else {
                return pos_params.select.too_short;
            }
        },

        formatInputTooLong: function( input, max ) {
            var n = input.length - max;
            if( n > 1 ) {
                var str = pos_params.select.too_longs;
                return str.replace( "%d", n );
            } else {
                return pos_params.select.too_long;
            }
        },

        formatSelectionTooBig: function( limit ) {
            if( limit > 1 ) {
                var str = pos_params.select.too_bigs;
                return str.replace( "%d", limit );
            } else {
                return pos_params.select.too_big;
            }
        }

    });

    return POS;

})(POS || {});