!function(a){"use strict";a.fn.select2.locales["pt-BR"]={formatNoMatches:function(){return"Nenhum resultado encontrado"},formatAjaxError:function(){return"Erro na busca"},formatInputTooShort:function(a,b){var c=b-a.length;return"Digite "+(1==b?"":"mais")+" "+c+" caracter"+(1==c?"":"es")},formatInputTooLong:function(a,b){var c=a.length-b;return"Apague "+c+" caracter"+(1==c?"":"es")},formatSelectionTooBig:function(a){return"Só é possível selecionar "+a+" elemento"+(1==a?"":"s")},formatLoadMore:function(){return"Carregando mais resultados…"},formatSearching:function(){return"Buscando…"}},a.extend(a.fn.select2.defaults,a.fn.select2.locales["pt-BR"])}(jQuery),function(a){"function"==typeof define&&define.amd?define(["moment"],a):"object"==typeof exports?module.exports=a(require("../moment")):a(("undefined"!=typeof global?global:this).moment)}(function(a){return a.defineLocale("pt-br",{months:"janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro".split("_"),monthsShort:"jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez".split("_"),weekdays:"domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado".split("_"),weekdaysShort:"dom_seg_ter_qua_qui_sex_sáb".split("_"),weekdaysMin:"dom_2ª_3ª_4ª_5ª_6ª_sáb".split("_"),longDateFormat:{LT:"HH:mm",LTS:"LT:ss",L:"DD/MM/YYYY",LL:"D [de] MMMM [de] YYYY",LLL:"D [de] MMMM [de] YYYY [às] LT",LLLL:"dddd, D [de] MMMM [de] YYYY [às] LT"},calendar:{sameDay:"[Hoje às] LT",nextDay:"[Amanhã às] LT",nextWeek:"dddd [às] LT",lastDay:"[Ontem às] LT",lastWeek:function(){return 0===this.day()||6===this.day()?"[Último] dddd [às] LT":"[Última] dddd [às] LT"},sameElse:"L"},relativeTime:{future:"em %s",past:"%s atrás",s:"segundos",m:"um minuto",mm:"%d minutos",h:"uma hora",hh:"%d horas",d:"um dia",dd:"%d dias",M:"um mês",MM:"%d meses",y:"um ano",yy:"%d anos"},ordinalParse:/\d{1,2}º/,ordinal:"%dº"})});