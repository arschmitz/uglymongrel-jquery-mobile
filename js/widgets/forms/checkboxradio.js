/*
* "checkboxradio" plugin
*/

//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Consistent styling for checkboxes/radio buttons.
//>>label: Checkboxes & Radio Buttons
//>>group: Forms
//>>css.structure: ../css/structure/jquery.mobile.forms.checkboxradio.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

define( [ "jquery",
	"../../vmouse",
	"../../navigation/path",
	"../../core",
	"../../widget",
	"./reset" ], function( jQuery ) {
//>>excludeEnd("jqmBuildExclude");
(function( $, undefined ) {

var escapeId = $.mobile.path.hashToSelector;

$.widget( "mobile.checkboxradio", $.extend( {

	initSelector: "input:not( :jqmData(role='flipswitch' ) )[type='checkbox'],input[type='radio']:not( :jqmData(role='flipswitch' ))",

	options: {
		theme: "inherit",
		mini: false,
		wrapperClass: null,
		enhanced: false,
		iconpos: "left"

	},
	_create: function() {
		var input = this.element,
			o = this.options,
			inheritAttr = function( input, dataAttr ) {
				return input.jqmData( dataAttr ) ||
					input.closest( "form, fieldset" ).jqmData( dataAttr );
			},
			// NOTE: Windows Phone could not find the label through a selector
			// filter works though.
			parentLabel = input.closest( "label" ),
			label = parentLabel.length ? parentLabel :
				input
					.closest( "form, fieldset, :jqmData(role='page'), :jqmData(role='dialog')" )
					.find( "label" )
					.filter( "[for='" + escapeId( input[0].id ) + "']" )
					.first(),
			inputtype = input[0].type,
			checkedClass = "ui-" + inputtype + "-on",
			uncheckedClass = "ui-" + inputtype + "-off";

		if ( inputtype !== "checkbox" && inputtype !== "radio" ) {
			return;
		}

		if ( this.element[0].disabled ) {
			this.options.disabled = true;
		}

		o.iconpos = inheritAttr( input, "iconpos" ) || label.attr( "data-" + $.mobile.ns + "iconpos" ) || o.iconpos,

		// Establish options
		o.mini = inheritAttr( input, "mini" ) || o.mini;

		// Expose for other methods
		$.extend( this, {
			input: input,
			label: label,
			parentLabel: parentLabel,
			inputtype: inputtype,
			checkedClass: checkedClass,
			uncheckedClass: uncheckedClass
		});

		if ( !this.options.enhanced ) {
			this._enhance();
		}

		this._on( label, {
			vmouseover: "_handleLabelVMouseOver",
			vclick: "_handleLabelVClick"
		});

		this._on( input, {
			vmousedown: "_cacheVals",
			vclick: "_handleInputVClick",
			focus: "_handleInputFocus",
			blur: "_handleInputBlur"
		});

		this._handleFormReset();
		this.refresh();
	},

	_enhance: function() {
		this.label.addClass( "ui-btn ui-corner-all");

		if ( this.parentLabel.length > 0 ) {
			this.input.add( this.label ).wrapAll( this._wrapper() );
		} else {
			//this.element.replaceWith( this.input.add( this.label ).wrapAll( this._wrapper() ) );
			this.element.wrap( this._wrapper() );
			this.element.parent().prepend( this.label );
		}

		// Wrap the input + label in a div

		this._setOptions({
			"theme": this.options.theme,
			"iconpos": this.options.iconpos,
			"mini": this.options.mini
		});

	},

	_wrapper: function() {
		return $( "<div class='"  +
			( this.options.wrapperClass ? this.options.wrapperClass : "" ) +
			" ui-" + this.inputtype +
			( this.options.disabled ? " ui-state-disabled" : "" ) + "' ></div>" );
	},

	_handleInputFocus: function() {
		this.label.addClass( $.mobile.focusClass );
	},

	_handleInputBlur: function() {
		this.label.removeClass( $.mobile.focusClass );
	},

	_handleInputVClick: function() {
		// Adds checked attribute to checked input when keyboard is used
		this.element.prop( "checked", this.element.is( ":checked" ) );
		this._getInputSet().not( this.element ).prop( "checked", false );
		this._updateAll();
	},

	_handleLabelVMouseOver: function( event ) {
		if ( this.label.parent().hasClass( "ui-state-disabled" ) ) {
			event.stopPropagation();
		}
	},

	_handleLabelVClick: function( event ) {
		var input = this.element;

		if ( input.is( ":disabled" ) ) {
			event.preventDefault();
			return;
		}

		this._cacheVals();

		input.prop( "checked", this.inputtype === "radio" && true || !input.prop( "checked" ) );

		// trigger click handler's bound directly to the input as a substitute for
		// how label clicks behave normally in the browsers
		// TODO: it would be nice to let the browser's handle the clicks and pass them
		//       through to the associate input. we can swallow that click at the parent
		//       wrapper element level
		input.triggerHandler( "click" );

		// Input set for common radio buttons will contain all the radio
		// buttons, but will not for checkboxes. clearing the checked status
		// of other radios ensures the active button state is applied properly
		this._getInputSet().not( input ).prop( "checked", false );

		this._updateAll();
		return false;
	},

	_cacheVals: function() {
		this._getInputSet().each( function() {
			$( this ).attr("data-" + $.mobile.ns + "cacheVal", this.checked );
		});
	},

	// Returns those radio buttons that are supposed to be in the same group as
	// this radio button. In the case of a checkbox or a radio lacking a name
	// attribute, it returns this.element.
	_getInputSet: function() {
		var selector, formId,
			radio = this.element[ 0 ],
			name = radio.name,
			form = radio.form,
			doc = this.element.parents().last().get( 0 ),

			// A radio is always a member of its own group
			radios = this.element;

		// Only start running selectors if this is an attached radio button with a name
		if ( name && this.inputtype === "radio" && doc ) {
			selector = "input[type='radio'][name='" + escapeId( name ) + "']";

			// If we're inside a form
			if ( form ) {
				formId = form.getAttribute( "id" );

				// If the form has an ID, collect radios scattered throught the document which
				// nevertheless are part of the form by way of the value of their form attribute
				if ( formId ) {
					radios = $( selector + "[form='" + escapeId( formId ) + "']", doc );
				}

				// Also add to those the radios in the form itself
				radios = $( form ).find( selector ).filter( function() {

					// Some radios inside the form may belong to some other form by virtue of
					// having a form attribute defined on them, so we must filter them out here
					return ( this.form === form );
				}).add( radios );

			// If we're outside a form
			} else {

				// Collect all those radios which are also outside of a form and match our name
				radios = $( selector, doc ).filter( function() {
					return !this.form;
				});
			}
		}
		return radios;
	},

	_updateAll: function() {
		var self = this;

		this._getInputSet().each( function() {
			var $this = $( this );

			if ( this.checked || self.inputtype === "checkbox" ) {
				$this.trigger( "change" );
			}
		})
		.checkboxradio( "refresh" );
	},

	_reset: function() {
		this.refresh();
	},

	// Is the widget supposed to display an icon?
	_hasIcon: function() {
		var controlgroup, controlgroupWidget,
			controlgroupConstructor = $.mobile.controlgroup;

		// If the controlgroup widget is defined ...
		if ( controlgroupConstructor ) {
			controlgroup = this.element.closest(
				":mobile-controlgroup," +
				controlgroupConstructor.prototype.initSelector );

			// ... and the checkbox is in a controlgroup ...
			if ( controlgroup.length > 0 ) {

				// ... look for a controlgroup widget instance, and ...
				controlgroupWidget = $.data( controlgroup[ 0 ], "mobile-controlgroup" );

				// ... if found, decide based on the option value, ...
				return ( ( controlgroupWidget ? controlgroupWidget.options.type :

					// ... otherwise decide based on the "type" data attribute.
					controlgroup.attr( "data-" + $.mobile.ns + "type" ) ) !== "horizontal" );
			}
		}

		// Normally, the widget displays an icon.
		return true;
	},

	refresh: function() {
		var hasIcon = this._hasIcon(),
			isChecked = this.element[ 0 ].checked,
			active = $.mobile.activeBtnClass,
			iconposClass = "ui-btn-icon-" + this.options.iconpos,
			addClasses = [],
			removeClasses = [];

		if ( hasIcon ) {
			removeClasses.push( active );
			addClasses.push( iconposClass );
		} else {
			removeClasses.push( iconposClass );
			( isChecked ? addClasses : removeClasses ).push( active );
		}

		if ( isChecked ) {
			addClasses.push( this.checkedClass );
			removeClasses.push( this.uncheckedClass );
		} else {
			addClasses.push( this.uncheckedClass );
			removeClasses.push( this.checkedClass );
		}

		this.label
			.addClass( addClasses.join( " " ) )
			.removeClass( removeClasses.join( " " ) );
	},

	widget: function() {
		return this.label.parent();
	},

	_setOptions: function( options ) {
		var label = this.label,
			currentOptions = this.options,
			outer = this.widget(),
			hasIcon = this._hasIcon();

		if ( options.disabled !== undefined ) {
			this.input.prop( "disabled", !!options.disabled );
			outer.toggleClass( "ui-state-disabled", !!options.disabled );
		}
		if ( options.mini !== undefined ) {
			outer.toggleClass( "ui-mini", !!options.mini );
		}
		if ( options.theme !== undefined ) {
			label
				.removeClass( "ui-btn-" + currentOptions.theme )
				.addClass( "ui-btn-" + options.theme );
		}
		if ( options.wrapperClass !== undefined ) {
			outer
				.removeClass( currentOptions.wrapperClass )
				.addClass( options.wrapperClass );
		}
		if ( options.iconpos !== undefined && hasIcon ) {
			label.removeClass( "ui-btn-icon-" + currentOptions.iconpos ).addClass( "ui-btn-icon-" + options.iconpos );
		} else if ( !hasIcon ) {
			label.removeClass( "ui-btn-icon-" + currentOptions.iconpos );
		}
		this._super( options );
	}

}, $.mobile.behaviors.formReset ) );

})( jQuery );
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");
