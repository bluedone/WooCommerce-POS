!function(a){"use strict";a.fn.select2.locales.ro={formatNoMatches:function(){return"Nu a fost găsit nimic"},formatInputTooShort:function(a,b){var c=b-a.length;return"Vă rugăm să introduceți incă "+c+" caracter"+(1==c?"":"e")},formatInputTooLong:function(a,b){var c=a.length-b;return"Vă rugăm să introduceți mai puțin de "+c+" caracter"+(1==c?"":"e")},formatSelectionTooBig:function(a){return"Aveți voie să selectați cel mult "+a+" element"+(1==a?"":"e")},formatLoadMore:function(){return"Se încarcă…"},formatSearching:function(){return"Căutare…"}},a.extend(a.fn.select2.defaults,a.fn.select2.locales.ro)}(jQuery),function(a){"function"==typeof define&&define.amd?define(["moment"],a):"object"==typeof exports?module.exports=a(require("../moment")):a(window.moment)}(function(a){function b(a,b,c){var d={mm:"minute",hh:"ore",dd:"zile",MM:"luni",yy:"ani"},e=" ";return(a%100>=20||a>=100&&a%100===0)&&(e=" de "),a+e+d[c]}return a.defineLocale("ro",{months:"ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie".split("_"),monthsShort:"ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.".split("_"),weekdays:"duminică_luni_marți_miercuri_joi_vineri_sâmbătă".split("_"),weekdaysShort:"Dum_Lun_Mar_Mie_Joi_Vin_Sâm".split("_"),weekdaysMin:"Du_Lu_Ma_Mi_Jo_Vi_Sâ".split("_"),longDateFormat:{LT:"H:mm",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY H:mm",LLLL:"dddd, D MMMM YYYY H:mm"},calendar:{sameDay:"[azi la] LT",nextDay:"[mâine la] LT",nextWeek:"dddd [la] LT",lastDay:"[ieri la] LT",lastWeek:"[fosta] dddd [la] LT",sameElse:"L"},relativeTime:{future:"peste %s",past:"%s în urmă",s:"câteva secunde",m:"un minut",mm:b,h:"o oră",hh:b,d:"o zi",dd:b,M:"o lună",MM:b,y:"un an",yy:b},week:{dow:1,doy:7}})});