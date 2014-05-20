requirejs.config({
	"paths": {
		// requireJS plugins
		"text": "../external/requirejs/plugins/text",
		"json": "../external/requirejs/plugins/json",

		"jquery": "../external/jquery/jquery",
		"jquery-ui": "../external/jquery-ui",
		"jquery-plugins": "../external/jquery/plugins",
		"uglymongrel": "../external/uglymongrel"
	},
	"shim": {
		"jquery-plugins/jquery.hashchange": [ "jquery" ],
		"jquery-ui/jquery.ui.widget": [ "jquery" ],
		"jquery-ui/jquery.ui.tabs": [ "jquery-ui/jquery.ui.widget" ],
		"jquery-ui/jquery.ui.core": [ "jquery" ],
		"jquery-ui/datepicker.js": [ "jquery-ui/jquery.ui.core.js" ]
	}
});
