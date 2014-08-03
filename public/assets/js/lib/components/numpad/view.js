define([
	'app',
	'text!lib/components/numpad/template.html',
	'handlebars'
], function(
	POS,
	NumpadTmpl,
	Handlebars
){
	
	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){
		
		Numpad.NumpadView = Marionette.ItemView.extend({
			template: Handlebars.compile( NumpadTmpl ),

		});

	});

});