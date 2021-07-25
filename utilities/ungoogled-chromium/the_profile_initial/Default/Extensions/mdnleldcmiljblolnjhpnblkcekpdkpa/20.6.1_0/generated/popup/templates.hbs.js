this["RQ"] = this["RQ"] || {};
this["RQ"]["Templates"] = this["RQ"]["Templates"] || {};

Handlebars.registerPartial("PremiumBadge", this["RQ"]["Templates"]["PremiumBadge"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "title=\""
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "\"";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<a class=\"premium-badge\"\n   href=\"https://www.requestly.io/blog/2019/02/18/introducing-premium-plans-free-plan-limits\" target=\"_blank\">\n  <span class=\"badge badge-success\" "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.title : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">\n    <i class=\"fa fa-star\"></i>\n    <span>Premium</span>\n  </span>\n</a>\n";
},"useData":true}));

Handlebars.registerPartial("StatusToggle", this["RQ"]["Templates"]["StatusToggle"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "checked";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<a class=\"switch square\">\n  <label>\n    Off\n    <input type=\"checkbox\" class=\"status-toggle\" "
    + ((stack1 = (helpers.equals || (depth0 && depth0.equals) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.status : depth0),"Active",{"name":"equals","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " />\n    <span class=\"lever\"></span>\n    On\n  </label>\n</a>\n";
},"useData":true}));

this["RQ"]["Templates"]["FavouritesTab"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "  <div id=\"favourites-rules-list\" class=\"list\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.rules : depth0),{"name":"each","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "  </div>\n";
},"2":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3="function";

  return "      <div class=\"list-item favourite-rule rule-theme-"
    + alias2((helpers.toLowerCase || (depth0 && depth0.toLowerCase) || alias1).call(depth0,(depth0 != null ? depth0.ruleType : depth0),{"name":"toLowerCase","hash":{},"data":data}))
    + "\" data-index=\""
    + alias2(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias1),(typeof helper === alias3 ? helper.call(depth0,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\n        <span class=\"rule-type badge\">\n          <i class=\""
    + alias2((helpers.getRuleIconClass || (depth0 && depth0.getRuleIconClass) || alias1).call(depth0,(depth0 != null ? depth0.ruleType : depth0),{"name":"getRuleIconClass","hash":{},"data":data}))
    + "\" title=\""
    + alias2(((helper = (helper = helpers.ruleType || (depth0 != null ? depth0.ruleType : depth0)) != null ? helper : alias1),(typeof helper === alias3 ? helper.call(depth0,{"name":"ruleType","hash":{},"data":data}) : helper)))
    + " Rule\"></i>\n        </span>\n        <a class=\"rule-name\" href=\""
    + alias2((helpers.readGlobalVar || (depth0 && depth0.readGlobalVar) || alias1).call(depth0,"RQ.RULES_PAGE_URL",{"name":"readGlobalVar","hash":{},"data":data}))
    + "#edit/"
    + alias2(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias3 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">"
    + alias2(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias3 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</a>\n"
    + ((stack1 = this.invokePartial(partials.StatusToggle,depth0,{"name":"StatusToggle","data":data,"indent":"        ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "      </div>\n";
},"4":function(depth0,helpers,partials,data) {
    return "  <div class=\"no-rules-message\">\n    <p>There are no favourite rules setup yet.</p>\n  </div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.rules : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(4, data, 0),"data":data})) != null ? stack1 : "")
    + "<div class=\"popup-footer\">\n  <a id=\"manage-favourites-link\" href=\""
    + this.escapeExpression((helpers.readGlobalVar || (depth0 && depth0.readGlobalVar) || helpers.helperMissing).call(depth0,"RQ.RULES_PAGE_URL",{"name":"readGlobalVar","hash":{},"data":data}))
    + "\" target=\"_blank\">Manage Favourite Rules</a>\n"
    + ((stack1 = this.invokePartial(partials.PremiumBadge,depth0,{"name":"PremiumBadge","hash":{"title":"Favourites is a Premium Requestly feature."},"data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "</div>\n";
},"usePartial":true,"useData":true});

this["RQ"]["Templates"]["LogsTab"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var alias1=helpers.helperMissing, alias2=this.escapeExpression;

  return "  <div class=\"upgrade-plan-message\">\n    Unlock full access to Logs feature (and other premium features) with Requestly Gold Plan.\n    <a href=\""
    + alias2((helpers.readGlobalVar || (depth0 && depth0.readGlobalVar) || alias1).call(depth0,"RQ.PRICING_PAGE_URL",{"name":"readGlobalVar","hash":{},"data":data}))
    + "\" target=\"_blank\">Learn More</a>\n\n    <div class=\"mt-1 mb-1\">\n      <a type=\"button\" class=\"btn btn-sm btn-primary\" href=\""
    + alias2((helpers.readGlobalVar || (depth0 && depth0.readGlobalVar) || alias1).call(depth0,"RQ.PRICING_PAGE_URL",{"name":"readGlobalVar","hash":{},"data":data}))
    + "\" target=\"_blank\">\n        Upgrade</a>\n    </div>\n\n    <p>Already on Gold Plan. <a href=\""
    + alias2((helpers.readGlobalVar || (depth0 && depth0.readGlobalVar) || alias1).call(depth0,"RQ.RULES_PAGE_URL",{"name":"readGlobalVar","hash":{},"data":data}))
    + "\" target=\"_blank\">Please login here</a></p>\n  </div>\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2=this.escapeExpression;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.rules : depth0),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.program(14, data, 0),"data":data})) != null ? stack1 : "")
    + "\n  <div class=\"popup-footer\">\n    <a id=\"full-logs-link\" href=\""
    + alias2((helpers.readGlobalVar || (depth0 && depth0.readGlobalVar) || alias1).call(depth0,"RQ.RULES_PAGE_URL",{"name":"readGlobalVar","hash":{},"data":data}))
    + "#logs/"
    + alias2(((helper = (helper = helpers.browserTabId || (depth0 != null ? depth0.browserTabId : depth0)) != null ? helper : alias1),(typeof helper === "function" ? helper.call(depth0,{"name":"browserTabId","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">See full logs</a>\n"
    + ((stack1 = this.invokePartial(partials.PremiumBadge,depth0,{"name":"PremiumBadge","hash":{"title":"Logs is a Premium Requestly feature."},"data":data,"indent":"    ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  </div>\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.showLimitedUseMessage : depth0),{"name":"if","hash":{},"fn":this.program(16, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return "    <div id=\"applied-rules-list\" class=\"list\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.rules : depth0),{"name":"each","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n";
},"5":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2=this.escapeExpression;

  return "        <div class=\"list-item applied-rule rule-theme-"
    + alias2((helpers.toLowerCase || (depth0 && depth0.toLowerCase) || alias1).call(depth0,(depth0 != null ? depth0.ruleType : depth0),{"name":"toLowerCase","hash":{},"data":data}))
    + "\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.name : depth0),{"name":"if","hash":{},"fn":this.program(6, data, 0),"inverse":this.program(8, data, 0),"data":data})) != null ? stack1 : "")
    + "          <span class=\"logs-count\">"
    + alias2(((helper = (helper = helpers.requests || (depth0 != null ? depth0.requests : depth0)) != null ? helper : alias1),(typeof helper === "function" ? helper.call(depth0,{"name":"requests","hash":{},"data":data}) : helper)))
    + " "
    + ((stack1 = (helpers.equals || (depth0 && depth0.equals) || alias1).call(depth0,(depth0 != null ? depth0.requests : depth0),1,{"name":"equals","hash":{},"fn":this.program(10, data, 0),"inverse":this.program(12, data, 0),"data":data})) != null ? stack1 : "")
    + "</span>\n        </div>\n";
},"6":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3="function";

  return "            <span class=\"rule-type badge\">\n              <i class=\""
    + alias2((helpers.getRuleIconClass || (depth0 && depth0.getRuleIconClass) || alias1).call(depth0,(depth0 != null ? depth0.ruleType : depth0),{"name":"getRuleIconClass","hash":{},"data":data}))
    + "\" title=\""
    + alias2(((helper = (helper = helpers.ruleType || (depth0 != null ? depth0.ruleType : depth0)) != null ? helper : alias1),(typeof helper === alias3 ? helper.call(depth0,{"name":"ruleType","hash":{},"data":data}) : helper)))
    + " Rule\"></i>\n            </span>\n            <a class=\"rule-name\" href=\""
    + alias2((helpers.readGlobalVar || (depth0 && depth0.readGlobalVar) || alias1).call(depth0,"RQ.RULES_PAGE_URL",{"name":"readGlobalVar","hash":{},"data":data}))
    + "#edit/"
    + alias2(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias3 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">"
    + alias2(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias3 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</a>\n";
},"8":function(depth0,helpers,partials,data) {
    return "            <span class=\"deleted-rule\">Deleted rule</span>\n";
},"10":function(depth0,helpers,partials,data) {
    return "request";
},"12":function(depth0,helpers,partials,data) {
    return "requests";
},"14":function(depth0,helpers,partials,data) {
    return "    <div class=\"no-rules-message\">\n      <p>There are no rules applied on this page yet.</p>\n      <a href=\""
    + this.escapeExpression((helpers.readGlobalVar || (depth0 && depth0.readGlobalVar) || helpers.helperMissing).call(depth0,"RQ.RULES_PAGE_URL",{"name":"readGlobalVar","hash":{},"data":data}))
    + "#selectRule\" target=\"_blank\">Create new rule</a>\n    </div>\n";
},"16":function(depth0,helpers,partials,data) {
    return "    <p class=\"limited-use-message\">\n      Logs feature is available for limited use in Bronze & Silver plan.\n    </p>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.featureDisabled : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "");
},"usePartial":true,"useData":true});

this["RQ"]["Templates"]["PopupContainer"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"popup-header\">\n  <div class=\"product-logo\">\n    <img src=\"/resources/images/extended_logo-96.png\" class=\"product-image\" />\n  </div>\n  <a id=\"app-link\" class=\"btn btn-sm btn-primary\" href=\""
    + this.escapeExpression((helpers.readGlobalVar || (depth0 && depth0.readGlobalVar) || helpers.helperMissing).call(depth0,"RQ.RULES_PAGE_URL",{"name":"readGlobalVar","hash":{},"data":data}))
    + "\" target=\"_blank\">\n    <span>Open app</span>\n    <i class=\"fa fa-external-link\"></i>\n  </a>\n</div>\n<div id=\"popup-content\">\n  <ul class=\"nav nav-tabs nav-justified md-tabs grey darken-2\" role=\"tablist\">\n    <li class=\"nav-item\">\n      <a class=\"nav-link active\" id=\"favourites-tab\" data-toggle=\"tab\" href=\"#favourites-tab-content\" role=\"tab\"\n         aria-controls=\"favourite\" aria-selected=\"true\">\n        <i class=\"fa fa-heart popup-tab-icon\"></i>\n        <span class=\"popup-tab-label\">Favourites</span>\n        <span class=\"badge badge-pill badge-info popup-tab-counter\"></span>\n      </a>\n    </li>\n    <li class=\"nav-item\">\n      <a class=\"nav-link\" id=\"logs-tab\" data-toggle=\"tab\" href=\"#logs-tab-content\" role=\"tab\"\n         aria-controls=\"logs\" aria-selected=\"false\">\n        <i class=\"fa fa-file-text popup-tab-icon\"></i>\n        <span class=\"popup-tab-label\">Logs</span>\n        <span class=\"badge badge-pill badge-info popup-tab-counter\"></span>\n      </a>\n    </li>\n  </ul>\n  <div class=\"tab-content card\">\n    <div class=\"tab-pane fade show active\" id=\"favourites-tab-content\" role=\"tabpanel\" aria-labelledby=\"favourite-tab\"></div>\n    <div class=\"tab-pane fade\" id=\"logs-tab-content\" role=\"tabpanel\" aria-labelledby=\"logs-tab\"></div>\n  </div>\n</div>";
},"useData":true});