this["POS"] = this["POS"] || {};
this["POS"]["Components"] = this["POS"]["Components"] || {};
this["POS"]["Components"]["Numpad"] = this["POS"]["Components"]["Numpad"] || {};

this["POS"]["Components"]["Numpad"]["HeaderTmpl"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, helperMissing=helpers.helperMissing, buffer = "    <div class=\"input-group\">\n    	<span class=\"input-group-addon\">";
  stack1 = ((helpers.getOption || (depth0 && depth0.getOption) || helperMissing).call(depth0, "accounting.currency.symbol", {"name":"getOption","hash":{},"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</span>\n		<input type=\"text\" name=\"value\" class=\"form-control autogrow\">\n	</div>\n";
},"3":function(depth0,helpers,partials,data) {
  var stack1, helperMissing=helpers.helperMissing, buffer = "    <span></span>\n	<div class=\"input-group\">\n		<span class=\"input-group-btn\"><a class=\"disabled\" href=\"#\" data-modifier=\"value\">";
  stack1 = ((helpers.getOption || (depth0 && depth0.getOption) || helperMissing).call(depth0, "accounting.currency.symbol", {"name":"getOption","hash":{},"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</a></span>\n		<input type=\"text\" name=\"value\" class=\"form-control autogrow\">\n		<input type=\"text\" name=\"percentage\" class=\"form-control autogrow\" style=\"display:none\">\n		<span class=\"input-group-btn\"><a href=\"#\" data-modifier=\"percentage\">%</a></span>\n	</div>\n";
},"5":function(depth0,helpers,partials,data) {
  return "	<div class=\"input-group\">\n		<span class=\"input-group-btn\"><a href=\"#\" data-modifier=\"decrease\"><i class=\"icon icon-minus\"></i></a></span>\n		<input type=\"text\" name=\"value\" class=\"form-control autogrow\">\n		<span class=\"input-group-btn\"><a href=\"#\" data-modifier=\"increase\"><i class=\"icon icon-plus\"></i></a></span>\n	</div>\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<strong class=\"title\">"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</strong>\n\n";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.type : depth0), "price|tendered", {"name":"is","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.type : depth0), "discount", {"name":"is","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.type : depth0), "quantity", {"name":"is","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});



this["POS"]["Components"]["Numpad"]["NumkeysTmpl"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  return "    <div class=\"keys extra-keys discount\">\n        <a href=\"#\" class=\"btn\">5%</a>\n        <a href=\"#\" class=\"btn\">10%</a>\n        <a href=\"#\" class=\"btn\">20%</a>\n        <a href=\"#\" class=\"btn\">25%</a>\n    </div>\n";
  },"3":function(depth0,helpers,partials,data) {
  var stack1, buffer = "    <div class=\"keys extra-keys tendered\">\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.quick_key : depth0), {"name":"each","hash":{},"fn":this.program(4, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "	</div>\n";
},"4":function(depth0,helpers,partials,data) {
  var stack1, helperMissing=helpers.helperMissing, buffer = "        <a href=\"#\" class=\"btn\">";
  stack1 = ((helpers.number || (depth0 && depth0.number) || helperMissing).call(depth0, depth0, {"name":"number","hash":{},"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</a>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"keys\">\n    <div class=\"row\">\n        <a href=\"#\" class=\"btn\">1</a>\n        <a href=\"#\" class=\"btn\">2</a>\n        <a href=\"#\" class=\"btn\">3</a>\n    </div>\n    <div class=\"row\">\n        <a href=\"#\" class=\"btn\">4</a>\n        <a href=\"#\" class=\"btn\">5</a>\n        <a href=\"#\" class=\"btn\">6</a>\n    </div>\n    <div class=\"row\">\n        <a href=\"#\" class=\"btn\">7</a>\n        <a href=\"#\" class=\"btn\">8</a>\n        <a href=\"#\" class=\"btn\">9</a>\n    </div>\n    <div class=\"row\">\n        <a href=\"#\" class=\"btn\">0</a>\n        <a href=\"#\" class=\"btn\">00</a>\n        <a href=\"#\" class=\"btn decimal\">"
    + escapeExpression(((helpers.getOption || (depth0 && depth0.getOption) || helperMissing).call(depth0, "accounting.number.decimal", {"name":"getOption","hash":{},"data":data})))
    + "</a>\n    </div>\n</div>\n<div class=\"keys extra-keys standard\">\n    <a href=\"#\" class=\"btn del\"><i class=\"icon icon-delete\"><span>del</span></i></a>\n    <a href=\"#\" class=\"btn\">+/-</a>\n    <a href=\"#\" class=\"btn return\">return</a>\n</div>\n\n";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.type : depth0), "discount", {"name":"is","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = ((helpers.is || (depth0 && depth0.is) || helperMissing).call(depth0, (depth0 != null ? depth0.type : depth0), "tendered", {"name":"is","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});