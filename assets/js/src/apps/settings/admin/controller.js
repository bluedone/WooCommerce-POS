var POS = (function(App, Backbone, Marionette, $, _) {

    App.SettingsApp.Controller = Marionette.Controller.extend({

        initialize: function (options) {

            this.settingsRegion = new Marionette.Region({
                el: '#wc-pos-settings'
            });

            // store form state
            var SettingsModel = Backbone.Model.extend({
                url: ajaxurl,
                sync: this._sync
            });
            this.settingsCollection = new Backbone.Collection( App.bootstrap, {
                model: SettingsModel
            });

            this._showTabs({ tab: options.tab });
            this._showSettings({ tab: options.tab });

        },

        _showTabs: function ( options ) {
            var view = new App.SettingsApp.Views.Tabs( options );

            // tab clicked
            this.listenTo(view, 'settings:tab:clicked', function (tab) {
                App.navigate( tab );
                this._showSettings({ tab: tab });
            }, this);

        },

        _showSettings: function (options) {
            _.defaults( options, { col: this.settingsCollection } );
            var view = new App.SettingsApp.Views.Settings(options);

            // form submit
            this.listenTo(view, 'settings:form:submit', function (model) {
                this._saveSettings(model);
            });

            this.settingsRegion.show(view);

        },

        _saveSettings: function (model) {
            model.save( [], { emulateHTTP: true } );
        },

        _sync: function (method, model, options) {
            options.url = model.url + '?action=wc_pos_save_admin_settings&security=' + model.get('security');
            model.unset('security');
            return Backbone.sync(method, model, options);
        }

    });

    return App;

})(POS || {}, Backbone, Marionette, jQuery, _);