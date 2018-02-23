/**
 * Aggregated script. All javascripts under this node will be included.
 */

var contextPath = '';

    /*!
 * jQuery UI Widget 1.8.6
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function( $, undefined ) {

// jQuery 1.4+
if ( $.cleanData ) {
	var _cleanData = $.cleanData;
	$.cleanData = function( elems ) {
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			$( elem ).triggerHandler( "remove" );
		}
		_cleanData( elems );
	};
} else {
	var _remove = $.fn.remove;
	$.fn.remove = function( selector, keepData ) {
		return this.each(function() {
			if ( !keepData ) {
				if ( !selector || $.filter( selector, [ this ] ).length ) {
					$( "*", this ).add( [ this ] ).each(function() {
						$( this ).triggerHandler( "remove" );
					});
				}
			}
			return _remove.call( $(this), selector, keepData );
		});
	};
}

$.widget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};

	$[ namespace ] = $[ namespace ] || {};
	$[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
//	$.each( basePrototype, function( key, val ) {
//		if ( $.isPlainObject(val) ) {
//			basePrototype[ key ] = $.extend( {}, val );
//		}
//	});
	basePrototype.options = $.extend( true, {}, basePrototype.options );
	$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
		namespace: namespace,
		widgetName: name,
		widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
		widgetBaseClass: fullName
	}, prototype );

	$.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;

		// prevent calls to internal methods
		if ( isMethodCall && options.charAt( 0 ) === "_" ) {
			return returnValue;
		}

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $.data( this, name ),
					methodValue = instance && $.isFunction( instance[options] ) ?
						instance[ options ].apply( instance, args ) :
						instance;
				// TODO: add this back in 1.9 and use $.error() (see #5972)
//				if ( !instance ) {
//					throw "cannot call methods on " + name + " prior to initialization; " +
//						"attempted to call method '" + options + "'";
//				}
//				if ( !$.isFunction( instance[options] ) ) {
//					throw "no such method '" + options + "' for " + name + " widget instance";
//				}
//				var methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, name, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( options, element ) {
	// allow instantiation without initializing for simple inheritance
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	options: {
		disabled: false
	},
	_createWidget: function( options, element ) {
		// $.widget.bridge stores the plugin instance, but we do it anyway
		// so that it's stored even before the _create function runs
		$.data( element, this.widgetName, this );
		this.element = $( element );
		this.options = $.extend( true, {},
			this.options,
			this._getCreateOptions(),
			options );

		var self = this;
		this.element.bind( "remove." + this.widgetName, function() {
			self.destroy();
		});

		this._create();
		this._trigger( "create" );
		this._init();
	},
	_getCreateOptions: function() {
		return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
	},
	_create: function() {},
	_init: function() {},

	destroy: function() {
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled" );
	},

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.extend( {}, this.options );
		}

		if  (typeof key === "string" ) {
			if ( value === undefined ) {
				return this.options[ key ];
			}
			options = {};
			options[ key ] = value;
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var self = this;
		$.each( options, function( key, value ) {
			self._setOption( key, value );
		});

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				[ value ? "addClass" : "removeClass"](
					this.widgetBaseClass + "-disabled" + " " +
					"ui-state-disabled" )
				.attr( "aria-disabled", value );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_trigger: function( type, event, data ) {
		var callback = this.options[ type ];

		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		data = data || {};

		// copy original event properties over to the new event
		// this would happen if we could call $.event.fix instead of $.Event
		// but we don't have a way to force an event to be fixed multiple times
		if ( event.originalEvent ) {
			for ( var i = $.event.props.length, prop; i; ) {
				prop = $.event.props[ --i ];
				event[ prop ] = event.originalEvent[ prop ];
			}
		}

		this.element.trigger( event, data );

		return !( $.isFunction(callback) &&
			callback.call( this.element[0], event, data ) === false ||
			event.isDefaultPrevented() );
	}
};

})( jQuery );

    /**
 * @author trixta 
 */
(function($){
	try {
		if(!window.console){
			window.console = {};
		}
		if(!console.log){
			console.log = $.noop;
		}
	} catch(e){}
	
	if(document.execCommand){
		try{
			document.execCommand('BackgroundImageCache', false, true);
		} catch(e){}
	}
	
	if(!$.support.opacity && !$.opacityRemoveFix){
		var oldStyle = $.style;
		$.style = function(elem, name, value){
			var ret = oldStyle(elem, name, value);
			if(name === 'opacity' && value == 1){
				elem.style.filter = (elem.style.filter || '').replace('alpha(opacity=100)', '');
			}
			return ret;
		};
		$.opacityRemoveFix = true;
	}
	
	$.beget = function(o, cfg){
		var f = function(){};
		o = new f();
		if(o.create && o.create.apply){
			o.create.call(o, cfg || {});
		}
		return o;
	};
	
	var atom 	= ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'p', 'li', 'dt', 'dd', 'blockquote', 'address', 'th', 'td', 'dfn'],
		exp 	= $.expr.filters
	;
	
	exp.focusPoint = function(elem){
		var name = elem.nodeName.toLowerCase();
		return (
				//state check
				( !elem.disabled && elem.type !== 'hidden' && elem.getAttribute('role') !== 'presentation' && elem.getAttribute('aria-disabled') !== 'true') &&
				//style check
				(elem.offsetWidth > 0 && elem.offsetHeight > 0 && $.curCSS(elem, 'visibility') !== 'hidden') &&
				//element check
				( $.inArray(name, atom) !== -1 )
		);
	};
	
	exp.focusAble = function(i, elem){
		return ( $.attr(elem, 'tabindex') !== undefined );
	};
	
	
	$.fn.firstExpOf = function(sel){
		if(!this[0]){
			return this.pushStack([]);
		}
		var elems 	= $('*', this[0]),
			len 	= elems.length,
			ret		= []
		;
		for(var i = 0; i < len; i++){
			if(exp[sel](elems[i], i)){
				ret = [elems[i]];
				break;
			}
		}
		return this.pushStack(ret);
	};
	
	var currentLoc = location.href.split('#')[0];
	$.fn.getHrefHash = function(sel){
		var ret = '';
		if(this[0]){
			ret = this[0].hash || this[0].href.replace(currentLoc, '');
		}
		return ret;
	};
	
	$('html').addClass('js-on');
	
	var body, bodyStyle;
	
	$.SCROLLBARWIDTH = 15;
	$.SCROLLROOT = $($.browser.webkit || document.compatMode == 'BackCompat' ?
				document.body : 
				document.documentElement);
	function setConstants(){
		body = $(document.body);
		bodyStyle = body[0].style;
		
		var testElem 		= $('<div style="position: absolute; visibility: hidden; width: 80px; overflow: scroll;height: 80px;"><div style="width: 99px; height: 99px;" /></div>')
								.appendTo('body');
		$.SCROLLBARWIDTH = testElem.innerWidth() - $('div', testElem).css('width', 'auto').innerWidth();
		testElem.remove();
		testElem = null;
		body.removeClass('js-off');
	}
	
	if(!document.body || !document.body.style){
		$(setConstants);
	} else {
		setConstants();
	}
	
	$.each(['outerHeight', 'outerWidth', 'height', 'width', 'innerHeight', 'innerWidth'], function(i, name){
		$.fn[name +'s'] = function(arg){
			if( (name === 'height' || name === 'width') && arg !== undefined ){
				return $.fn[name].apply(this, arguments);
			}
			var ret = 0;
			this.each(function(){
				ret += $(this)[name](arg);
			});
			return ret;
		};
	});
	
	
})(jQuery);


(function($){
	var allowFocus 	= true;
	
	function stopFocus(){
		allowFocus = false;
		setTimeout(function(){
			allowFocus = true;
		}, 1);
	}
	
	function testDomTarget(e){
		var oE 	= e.originalEvent;
		if(e.target === document || e.target === window || $.nodeName(e.target, 'body') || $.nodeName(e.target, 'html') || $.attr(e.target, 'tabindex') === undefined ){
			stopFocus();
			return false;
		}
		if(oE){
			if(
					allowFocus && e.target && e.target.nodeType === 1 &&
					(oE.explicitOriginalTarget && oE.explicitOriginalTarget && oE.explicitOriginalTarget !== window &&  oE.explicitOriginalTarget !== document && !$(oE.explicitOriginalTarget).is('html, body') ||
					oE.toElement || oE.fromElement)
				) {
					return true;
				} else {
					return false;
				}
		}
		return true;
	}
	
	$.each(['focusin', 'focusout'], function(i, eType){
		
		$.event.special['dom'+ eType] = {
			setup: function(){
				$(this)
					.bind(eType, $.event.special['dom'+ eType].handler);
                return true;
            },
			teardown: function(){
                $(this).unbind(eType, $.event.special['dom'+ eType].handler);
                return true;
            },
            handler: function(e){
				if(testDomTarget(e)){
	                e = $.extend({}, e, {type: 'dom'+ eType});
	                return $.event.handle.call(this, e);
				}
				return undefined;
            }
		};
		
	});
	
	/*
	 * timer
	 */

	var clearInterval 	= window.clearInterval,
		setInterval 	= window.setInterval,
		setTimeout 		= window.setTimeout
	;
	$.createTimer = function(obj){
		
		function clear(name){
			if(obj[name] !== undefined){
				clearInterval(obj[name]);
			}
		}
		
		return {
			setInterval: function(name, fn, delay){
				clear(name); 
				obj[name] = setInterval(function(){fn.call(obj);}, delay);
			},
			setDelay: function(name, fn, delay){
				clear(name);
				obj[name] = setTimeout(function(){fn.call(obj);}, delay);
			},
			clear: clear
		};
	};
})(jQuery);
(function($){
	
	var offsetBaseCSS 	= 'position: absolute; width: 1px; height: 1px; overflow: hidden;margin: 0; padding: 0;top: 0;',
		offsetDir 		= ($('html').attr('dir') === 'rtl') ? 'right: -9999em;' : 'left: -99999em;',
		offsetCSS 		= offsetBaseCSS+offsetDir,
		version 		= parseInt($.browser.version, 10)
	;
	$.support.waiAria = (!$.browser.msie || version > 7);
	$.notIE6 = (!$.browser.msie || version > 6);
	$.browser.lteIE6 = ($.browser.msie && version < 7);
	$.browser.lteIE7 = ($.browser.msie && version < 8);
	$.browser.lteIE8 = ($.browser.msie && version < 9);
	
	if($.fx.interval < 16){
		$.fx.interval = 17;
		if($.browser.lteIE8 || $.browser.mozilla && version < 2){
			$.fx.interval = 25;
		}
		$(function(){
			try{
				if($(window).width() < 490 && $(window).height() < 490){
					$.fx.interval = 33;
				}
			} catch(e){}
		});
	}
	
$(function(){
	
	var style = document.createElement('style'),
		styleS
	;
	
	style.setAttribute('type', 'text/css');
	style = $(style).prependTo('head');
	
	styleS = document.styleSheets[0];
	
	function add(sel, prop){
		if (styleS.cssRules || styleS.rules) {
			if (styleS.insertRule) {
				styleS.insertRule(sel +' {'+ prop +';}', styleS.cssRules.length);
			} else if (styleS.addRule) {
				styleS.addRule(sel, prop);
			}
		}
	}
	
	add('.a11y-js-overflow', 'overflow:visible !important');
	add('.a11y-hidden', 'position:absolute');
	add('.a11y-hidden', offsetDir.replace(';', ''));
	
	
	
	$.cssRule = {
		add: add
	};
});

	$.ui = $.ui ||
		{};
		
	if(!$.ui.keyCode){
		$.ui.keyCode = {
			DOWN: 40,
			END: 35,
			ENTER: 13,
			ESCAPE: 27,
			HOME: 36,
			LEFT: 37,
			PAGE_DOWN: 34,
			PAGE_UP: 33,
			RIGHT: 39,
			SHIFT: 16,
			SPACE: 32,
			TAB: 9,
			UP: 38
		};
	}
		
	
	/*
	 * HCM-Detection
	 */
	$.ui.userMode = (function(){
		var userBg, 
			timer, 
			testDiv;
		
		function testBg(){
			if(console.firebug && console.info){return;}
			testDiv = testDiv || $('<div style="'+ offsetCSS +'"></div>').appendTo('body');
			var black = $.curCSS( testDiv.css({backgroundColor: '#000000'})[0], 'backgroundColor', true),
				white = $.curCSS( testDiv.css({backgroundColor: '#ffffff'})[0], 'backgroundColor', true),
				newBgStatus = (black === white || white === 'transparent')
			;
			
			if(newBgStatus != userBg){
				userBg = newBgStatus;
				$.event.trigger({type: 'usermode', disabled: !userBg, enabled: userBg});
			}
			return userBg;
		}
		
		function init(){
			testBg();
			clearInterval(timer);
			timer = setInterval(testBg, 3000);
		}
				
		$.event.special.usermode = {
			add: function(handler){
				//always trigger
				testBg();
				var elem =  this;
				setTimeout(function(){
					$(elem).trigger({type: 'usermode', disabled: !userBg, enabled: userBg});
				}, 0);
				return handler;
			},
			setup: function(){
				
			},
			teardown: function(){},
            handler: function(){}
		};
		
		return {
			get: testBg,
			init: init
		};
		
	})();
	
	$.fn.userMode = function(fn){
		return this[(fn) ? 'bind' : 'trigger']('usermode', fn);
	};
	
	$(function(){
		$('html').userMode(function(e){
			$(this)[e.enabled ? 'addClass' : 'removeClass']('hcm');
		});
		$.ui.userMode.init();
	});
	
	(function($){
		var preventclick = false;
		
		function handleAriaClick(e){
			if(!preventclick && (!e.keyCode || e.keyCode === 13 || ( e.keyCode === 32 && $.attr(e.target, 'role') === 'button' ) )){
				preventclick = true;
				setTimeout(function(){
					preventclick = false;
				}, 1);
				return $.event.special.ariaclick.handler.apply(this, arguments);
			} else if(preventclick && e.type == 'click'){
				e.preventDefault();
				return false;
			}
			return undefined;
		}
		$.event.special.ariaclick = {
			setup: function(){
				$(this).bind('click keypress', handleAriaClick);
	            return true;
	        },
			teardown: function(){
	            $(this).unbind('click keypress', handleAriaClick);
	            return true;
	        },
	        handler: function(e){
	            e.type = 'ariaclick';
	            return $.event.handle.apply(this, arguments);
	        }
		};
	})(jQuery);
	
	
	/* EM-Change */
	$.bodyDefaultFontsize = 10;
	$.testEm = (function(){
		var body = document.body,
			timer,
			evt = {
					type: 'emchange',
					emPx: 0,
					oldEmPx: 0
			},
			html = $(document.documentElement)
		;
				
		function test(){
			if(console.firebug && console.info){return;}
			var oldEmPx = evt.emPx;
			evt.emPx = parseInt($.curCSS(body, 'fontSize', true), 10);
			if(evt.emPx !== oldEmPx){
				evt.oldEmPx = oldEmPx;
				$.event.trigger(evt);
			}
			return evt;
		}
		
		function addEmClass(e){
			var dif 	= e.emPx - $.bodyDefaultFontsize,
				prefix	= (dif > 0) ? 'em-increased-' : 'em-decreased-',
				newCl 	= []
			;

			dif = Math.abs(dif) + 1;
			while (dif-- > 1) {
				newCl.push(prefix + dif);
			}
			html[0].className = $.grep(html[0].className.split(' '), function(n){
				return (n.indexOf('em-increased-') !== 0 && n.indexOf('em-decreased-') !== 0);
			}).concat(newCl).join(' ');
		}
			
		
		$(function(){
			body = document.body;
			clearInterval(timer);
			setTimeout(function(){
				html.bind('emchange', addEmClass);
				test();
				timer = setInterval(test, 3000);
			}, 0);
		});
		return test;
	})();
		
	(function($){
		var allowFocus 		= true,
			currentFocus 	= document,
			supActiveElem 	= ('activeElement' in document),
			// Jaws 8/9 needs at least 54ms
			minFocusTimer 	= 70,
			keyFocusTimer,
			focusTimer
		;
		
		function stopKeyFocus(e){
			allowFocus = false;
			clearTimeout(keyFocusTimer);
			setTimeout(function(){
				allowFocus = true;
				clearTimeout(keyFocusTimer);
			}, 99);
		}
		
		
		function addFocus(e){
			var jElm = $(e.target).addClass('a11y-focus');
			
			currentFocus = e.target;
			if(!supActiveElem){
				document.activeElement = e.target;
			}
			clearTimeout(keyFocusTimer);
			keyFocusTimer = setTimeout(function(){
				if(allowFocus){
					jElm.addClass('a11y-focus-key').trigger('keyfocus');
				}
			}, 0);
			
		}
		
		$(document)
			.bind('mousedown click', stopKeyFocus)
			.bind('domfocusin', addFocus)
			.bind('focusout', function(e){
				clearTimeout(keyFocusTimer);
				$(e.target)
					.removeClass('a11y-focus-key a11y-focus-widget a11y-focus')
				;
			})
		;
		
		
		function addTabindex(jElm){
			var tabindex = jElm.attr('tabindex');
			if(!(tabindex || tabindex === 0)){
				jElm.css({outline: 'none'}).attr({tabindex: '-1'});
				if( !$.support.waiAria && jElm[0] ){
					jElm[0].hideFocus = true;
				}
			}
			return jElm;
		}
		
		$.fn.setFocus = function(opts){
			if(!this[0]){return this;}
			opts = $.extend({}, $.fn.setFocus.defaults, opts);
			var elem 			= this[0],
				jElm 			= $(elem),
				activeElem		= document.activeElement,
				now				= new Date().getTime(),
				focusFn 		= function(){
								try{
									stopKeyFocus();
									elem.focus();
									jElm.addClass('a11y-focus-widget');
								} catch(e){}
							},
				fxParent
			;
			
			
			if(opts.addTabindex){
				addTabindex(jElm);
			}
			
			$.ui.SR.update();
			
			if( !opts.fast ){
				//update jaws 8/9 buffer
				if(activeElem && activeElem.focus && activeElem.blur){
					activeElem.blur();
					stopKeyFocus();
					activeElem.focus();
				}
				
				clearTimeout(focusTimer);
				
				//falsy focus bounce in ie / no scrollIntoView in ff workaround
				fxParent = jElm.closest(':animated', opts.context);
				if( fxParent[0] ){
					fxParent.queue(function(){
						var time = new Date().getTime() - now - minFocusTimer;
						time = (time > 9) ? time : 9;
						focusTimer = setTimeout( focusFn, time );
						setTimeout(function(){
							fxParent.dequeue();
						}, time + 16);
					});
				} else {
					focusTimer = setTimeout( focusFn, minFocusTimer );//min 54
				}
			} else {
				focusFn();
			}
			return this;
		};
		
		$.fn.setFocus.defaults = {
			addTabindex: true,
			fast: false,
			context: false
		};
			
	})(jQuery);
	
	/* hide/show */
	
	$.fn.ariaHide = function(){
		$.fn.hide.apply(this, arguments);
		return this.attr({'aria-hidden': 'true'});
	};
	
	$.fn.ariaShow = function(){
		$.fn.show.apply(this, arguments);
		return this.attr({'aria-hidden': 'false'});
	};
	
	
	/*
	 * SR-Update
	 */
	$.ui.SR = (function(){
		var input, val = 0, alertBox, boxTimer, statusBox, statusTimer;
		
		function init(){
			alertBox = $('<div class="a11y-hidden" role="alert" style="'+ offsetCSS +'" />').ariaHide().appendTo('body');
			statusBox = $('<div class="a11y-hidden" style="'+ offsetCSS +'"><div aria-live="polite" relevant="additions text" /> </div>').appendTo('body').find('div');
			input = $('<form role="presentation" action="#" class="aural" style="'+ offsetCSS +'"><input name="sr-update" id="sr-update" type="hidden" value="'+val+'" /></form>')
				.appendTo('body')
				.find('input')
				.ajaxComplete(update);
		}
		
		function update(){
			var posStyle, wrapperHeight;
			if(input){
				input[0].setAttribute('value', '' +(++val));
				setTimeout(function(){
					input[0].setAttribute('value', '' +(++val));
				}, 1);
			}
		}
		
		
		function alert(notice){
			clearTimeout(boxTimer);
			alertBox.ariaHide()
				.html(notice)
					.find('*')
					.attr({role: 'presentation'})
				.end()
				.ariaShow();
			
			boxTimer = setTimeout(function(){
				alertBox.ariaHide().empty();
			}, 999);
		}
		
		function giveStatus(text){
			
			text = $('<div>'+ text +'</div>')
					.find('*')
					.attr({role: 'presentation'})
				.end();
			statusBox.html(text);
			clearTimeout(statusTimer);
			statusTimer = setTimeout(function(){
				statusBox.empty();
			}, 999);
		}
		
		
		return {
			update: update,
			alert: alert,
			giveStatus: giveStatus,
			init: init
		};
	})();
	$($.ui.SR.init);
	
	/*
	 * getID-Exts
	 */
	
	if(!$.fn.getID){
		var uId = new Date().getTime();
		$.fn.getID = function(setAll){
			
			function setID(){
				var id 		= this.getAttribute('id');
				if(!id){
					id = 'ID-' + (uId++);
					this.setAttribute('id', id);
				}
				return id;
			}
			if(this[0]){
				if(setAll){
					this.each(setID);
				}
				return setID.call(this[0]);
			}
			return undefined;
		};
	}
	
	$.each({
		labelWith: 'aria-labelledby',
		describeWith: 'aria-describedby',
		ownsThis: 'aria-owns',
		controlsThis: 'aria-controls',
		activateThis: 'aria-activedescendant'
	}, function(name, prop){
		$.fn[name] = function(elem){
			return this.attr(prop, $(elem).getID() || '');
		};
	});
	
	/*
	*  enterLeave
	*  hover = focusblur
	*/
	var inReg 	= /focusin|focus$|mouseenter|mouseover/,
		inID 	= 0
	;	
	$.fn.enterLeave = function(enter, out, opts){
		opts = $.extend({}, $.fn.enterLeave.defaults, opts);
		inID++;
		var dataID = 'enterLeaveData-'+inID;
		var eventTypes 	= 'mouseenter mouseleave focusin focusout';
		
		if(opts.useEventTypes === 'mouse'){
			eventTypes = 'mouseenter mouseleave';
		} else if(opts.useEventTypes === 'focus'){
			eventTypes = 'focusin focusout';
		}
		var handler = function handler(e){
			var fn,
				inOutData = $.data(this, dataID) || $.data(this, dataID, {inEvents: 0}),
				params,
				elem = this,
				evt
			;
			if(inReg.test(e.type)){
				fn = enter;
				params =  [1, 'in', true];
				//webkit autoblur prevention 
				if(opts.useWebkitAutoBlur){
					inOutData.autoBlur = true; 
					setTimeout(function(){
						inOutData.autoBlur = false;
					}, 0);
				}
			} else {
				fn = out;
				params = [-1, 'out', false];
				if(inOutData.autoBlur){
					return;
				}
			}
			
			clearTimeout(inOutData.inOutTimer);
			inOutData.inEvents = Math.max(inOutData.inEvents + params[0], 0);
			inOutData.inOutTimer = setTimeout(function(){
				if(params[2] != inOutData.inOutState && 
						(params[2] || !opts.bothOut || !inOutData.inEvents)){
					
					inOutData.inOutState = params[2];
					evt = $.Event(params[1]);
					evt.originalEvent = e;
					$.extend(evt, {target: e.target, currentTarget: e.currentTarget});
					fn.call(elem, evt);
				}
			}, /focus/.test(e.type) ? opts.keyDelay : opts.mouseDelay);
		};
		return this[opts.bindStyle](eventTypes, handler);
	};
	
	$.fn.enterLeave.defaults = {
		mouseDelay: 0,
		keyDelay: 1,
		bothOut: false,
		useEventTypes: 'both', // both || mouse || focus
		useWebkitAutoBlur: false,
		bindStyle: 'bind'
	};
	
	$.fn.inOut = $.fn.enterLeave;
	
	$.fn.slideParentDown = function(opts){
		opts = $.extend({}, $.fn.slideParentDown.defaults, opts);
		var fn = opts.complete;
		
		return this.each(function(){
			
			var jElm 		= $(this),
				parent		= jElm.parent().css({height: ''}),
				outerHeight
			;
			jElm
				.css((opts.hideStyle === 'visibility') ? {visibility: ''} : {display: 'block'})
			;
			outerHeight = parent.height();
						
			parent
				.css({overflow: 'hidden', height: '0px'})
				.animate(
					{
						height: outerHeight
					}, 
					$.extend({}, opts, {complete: function(){
						parent.css({height: ''});
						fn.apply(this, arguments);
					}})
				)
			;
			
			
		});
	};
	$.fn.slideParentDown.defaults = {
		duration: 400,
		complete: $.noop,
		hideStyle: 'display'
	};
		
	$.fn.slideParentUp = function(opts){
		opts = $.extend({}, $.fn.slideParentUp.defaults, opts);
		var fn = opts.complete;
		return this.each(function(){
			var jElm 		= $(this),
				parent		= jElm.parent().css({overflow: 'hidden'}),
				cssProp 	= {height: '0px'}
			;
			if($.browser.mozilla && opts.flickrFix){
				cssProp.flickrFix = Math.random() * 2;
			}
			parent
				.animate(cssProp, $.extend({}, opts, {
					complete: function(){
						if(opts.hideStyle === 'visibility'){
							jElm.css({visibility: 'hidden'});
						} else {
							jElm.css({display: 'none'});
							parent.css({height: '', overflow: '', display: ''});
						}
						fn.apply(this, arguments);
					}
				}));
		});
	};
	$.fn.slideParentUp.defaults = {
		duration: 400,
		hideStyle: 'display',
		complete: $.noop,
		flickrFix: false
	};
	
	
	/* inline-block support */
	$.support.inlineBlock = true;
	
	$(function() {
		var tElm = $('<div style="display: inline-block;"/>').appendTo('body');
		$.support.inlineBlock = (tElm.css('display') === 'inline-block');
		tElm.remove();
	});
	
})(jQuery);
    /*!
 * jQuery UI 1.8.6
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function( $, undefined ) {

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.ui = $.ui || {};
if ( $.ui.version ) {
	return;
}

$.extend( $.ui, {
	version: "1.8.6",

	keyCode: {
		ALT: 18,
		BACKSPACE: 8,
		CAPS_LOCK: 20,
		COMMA: 188,
		COMMAND: 91,
		COMMAND_LEFT: 91, // COMMAND
		COMMAND_RIGHT: 93,
		CONTROL: 17,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		INSERT: 45,
		LEFT: 37,
		MENU: 93, // COMMAND_RIGHT
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SHIFT: 16,
		SPACE: 32,
		TAB: 9,
		UP: 38,
		WINDOWS: 91 // COMMAND
	}
});

// plugins
$.fn.extend({
	_focus: $.fn.focus,
	focus: function( delay, fn ) {
		return typeof delay === "number" ?
			this.each(function() {
				var elem = this;
				setTimeout(function() {
					$( elem ).focus();
					if ( fn ) {
						fn.call( elem );
					}
				}, delay );
			}) :
			this._focus.apply( this, arguments );
	},

	scrollParent: function() {
		var scrollParent;
		if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.curCSS(this,'position',1)) && (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

$.each( [ "Width", "Height" ], function( i, name ) {
	var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
		type = name.toLowerCase(),
		orig = {
			innerWidth: $.fn.innerWidth,
			innerHeight: $.fn.innerHeight,
			outerWidth: $.fn.outerWidth,
			outerHeight: $.fn.outerHeight
		};

	function reduce( elem, size, border, margin ) {
		$.each( side, function() {
			size -= parseFloat( $.curCSS( elem, "padding" + this, true) ) || 0;
			if ( border ) {
				size -= parseFloat( $.curCSS( elem, "border" + this + "Width", true) ) || 0;
			}
			if ( margin ) {
				size -= parseFloat( $.curCSS( elem, "margin" + this, true) ) || 0;
			}
		});
		return size;
	}

	$.fn[ "inner" + name ] = function( size ) {
		if ( size === undefined ) {
			return orig[ "inner" + name ].call( this );
		}

		return this.each(function() {
			$( this ).css( type, reduce( this, size ) + "px" );
		});
	};

	$.fn[ "outer" + name] = function( size, margin ) {
		if ( typeof size !== "number" ) {
			return orig[ "outer" + name ].call( this, size );
		}

		return this.each(function() {
			$( this).css( type, reduce( this, size, true, margin ) + "px" );
		});
	};
});

// selectors
function visible( element ) {
	return !$( element ).parents().andSelf().filter(function() {
		return $.curCSS( this, "visibility" ) === "hidden" ||
			$.expr.filters.hidden( this );
	}).length;
}

$.extend( $.expr[ ":" ], {
	data: function( elem, i, match ) {
		return !!$.data( elem, match[ 3 ] );
	},

	focusable: function( element ) {
		var nodeName = element.nodeName.toLowerCase(),
			tabIndex = $.attr( element, "tabindex" );
		if ( "area" === nodeName ) {
			var map = element.parentNode,
				mapName = map.name,
				img;
			if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
				return false;
			}
			img = $( "img[usemap=#" + mapName + "]" )[0];
			return !!img && visible( img );
		}
		return ( /input|select|textarea|button|object/.test( nodeName )
			? !element.disabled
			: "a" == nodeName
				? element.href || !isNaN( tabIndex )
				: !isNaN( tabIndex ))
			// the element and all of its ancestors must be visible
			&& visible( element );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" );
		return ( isNaN( tabIndex ) || tabIndex >= 0 ) && $( element ).is( ":focusable" );
	}
});

// support
$(function() {
	var body = document.body,
		div = body.appendChild( div = document.createElement( "div" ) );

	$.extend( div.style, {
		minHeight: "100px",
		height: "auto",
		padding: 0,
		borderWidth: 0
	});

	$.support.minHeight = div.offsetHeight === 100;
	$.support.selectstart = "onselectstart" in div;

	// set display to none to avoid a layout bug in IE
	// http://dev.jquery.com/ticket/4014
	body.removeChild( div ).style.display = "none";
});





// deprecated
$.extend( $.ui, {
	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function( module, option, set ) {
			var proto = $.ui[ module ].prototype;
			for ( var i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode ) {
				return;
			}
	
			for ( var i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},
	
	// will be deprecated when we switch to jQuery 1.4 - use jQuery.contains()
	contains: function( a, b ) {
		return document.compareDocumentPosition ?
			a.compareDocumentPosition( b ) & 16 :
			a !== b && a.contains( b );
	},
	
	// only used by resizable
	hasScroll: function( el, a ) {
	
		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}
	
		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;
	
		if ( el[ scroll ] > 0 ) {
			return true;
		}
	
		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},
	
	// these are odd functions, fix the API or move into individual plugins
	isOverAxis: function( x, reference, size ) {
		//Determines when x coordinate is over "b" element axis
		return ( x > reference ) && ( x < ( reference + size ) );
	},
	isOver: function( y, x, top, left, height, width ) {
		//Determines when x, y coordinates is over "b" element
		return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
	}
});

})( jQuery );

    /*!
 * jQuery UI Mouse 1.8.6
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget("ui.mouse", {
	options: {
		cancel: ':input,option',
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var self = this;

		this.element
			.bind('mousedown.'+this.widgetName, function(event) {
				return self._mouseDown(event);
			})
			.bind('click.'+this.widgetName, function(event) {
				if(self._preventClickEvent) {
					self._preventClickEvent = false;
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		// TODO: figure out why we have to use originalEvent
		event.originalEvent = event.originalEvent || {};
		if (event.originalEvent.mouseHandled) { return; }

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var self = this,
			btnIsLeft = (event.which == 1),
			elIsCancel = (typeof this.options.cancel == "string" ? $(event.target).parents().add(event.target).filter(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				self.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return self._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return self._mouseUp(event);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		event.preventDefault();
		event.originalEvent.mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.browser.msie && !(document.documentMode >= 9) && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;
			this._preventClickEvent = (event.target == this._mouseDownEvent.target);
			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(event) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(event) {},
	_mouseDrag: function(event) {},
	_mouseStop: function(event) {},
	_mouseCapture: function(event) { return true; }
});

})(jQuery);

    /**
 * @author alexander.farkas
 * @version 1.2
 */
(function($){
    $.testMedia = function(str){
        var date = new Date().getTime(), styleS, div = $('<div class="testMediaQuery' + date + '"></div>').css({
            visibility: 'hidden',
            position: 'absolute'
        }).appendTo('body'), style = document.createElement('style');
        style.setAttribute('type', 'text/css');
    	style.setAttribute('media', str);
        style = $(style).prependTo('head');
        styleS = document.styleSheets[0];
        if (styleS.cssRules || styleS.rules) {
            if (styleS.insertRule) {
                styleS.insertRule('.testMediaQuery' + date + ' {display:none !important;}', styleS.cssRules.length);
            } else if (styleS.addRule) {
                styleS.addRule('.testMediaQuery' + date, 'display:none');
            }
        }
        var ret = div.css('display') === 'none';
        div.remove();
        style.remove();
        return ret;
    };
    $.arrayInString = function(str, arr){
        var ret = -1;
        $.each(arr, function(i, item){
			if (str.indexOf(item) != -1) {
                ret = i;
                return false;
            }
        });
        return ret;
    };
    $.enableMediaQuery = (function(){
        var styles = [], styleLinks, date = new Date().getTime();
        function parseMedia(link){
            var medias = link.getAttribute('media'), 
				pMin = /\(\s*min-width\s*:\s*(\d+)px\s*\)/, 
				pMax = /\(\s*max-width\s*:\s*(\d+)px\s*\)/, 
				resMin, 
				resMax, 
				supportedMedia = ['handheld', 'all', 'screen', 'projection', 'tty', 'tv', 'print'], 
				curMedia, 
	            mediaString = [];
	            medias = (!medias) ? ['all'] : medias.split(',');
			
            for (var i = 0, len = medias.length; i < len; i++) {
				curMedia = $.arrayInString(medias[i], supportedMedia);
				
                if (curMedia != -1) {
					
                    curMedia = supportedMedia[curMedia];
                    if (!resMin) {
                        resMin = pMin.exec(medias[i]);
                        if (resMin) {
                            resMin = parseInt(resMin[1], 10);
                        }
                    }
                    if (!resMax) {
                        resMax = pMax.exec(medias[i]);
                        if (resMax) {
                            resMax = parseInt(resMax[1], 10);
                        }
                    }
                    mediaString.push(curMedia);
                }
            }
			if (resMin || resMax) {
				styles.push({
					obj: link,
					min: resMin,
					max: resMax,
					medium: mediaString.join(','),
					used: false
				});
			}
        }
        return {
            init: function(){
                if (!styleLinks) {
					var resizeTimer;
                    styleLinks = $('link[rel*=style]').each(function(){
                        parseMedia(this);
                    });
                    $.enableMediaQuery.adjust();
                    $(window).bind('resize.mediaQueries', function(){
						clearTimeout(resizeTimer);
						resizeTimer = setTimeout( $.enableMediaQuery.adjust , 29);
					});
                }
            },
            adjust: function(){
                var width 		= $(window).width(),
					addStyles	= [],
					changeQuery,
					shouldUse,
					i, len
				;
				
                for (i = 0, len = styles.length; i < len; i++) {
					shouldUse = !styles[i].obj.disabled && ((!(styles[i].min && styles[i].min > width) && !(styles[i].max && styles[i].max < width)) || (!styles[i].max && !styles[i].min));
                    if ( shouldUse ) {
                        var n = styles[i].obj.cloneNode(true);
                        n.setAttribute('media', styles[i].medium);
                        n.className = 'insertStyleforMedia' + date;
						addStyles.push(n);
						if( !styles[i].used ){
							styles[i].used = true;
							changeQuery = true;
						}
                    } else if( styles[i].used !== shouldUse ){
						styles[i].used = false;
						changeQuery = true;
					}
                }
				
				if(changeQuery){
					$('link.insertStyleforMedia' + date).remove();
					var head = document.getElementsByTagName('head');
					for(i = 0, len = addStyles.length; i < len; i++){
						head[0].appendChild(addStyles[i]);
					}
					//repaint
					$('body').css('zoom', '1').css('zoom', '');
				}
            }
        };
    })();
	//make some odd assumption before dom-ready
	$.support.mediaQueries = !( $.browser.msie && parseFloat($.browser.version, 10) < 9) || ($.browser.mozilla && parseFloat($.browser.version, 10) < 1.9 );
    setTimeout(function(){
		if (!$.isReady && document.body && !$.support.mediaQueries) {
	        try {
				$.enableMediaQuery.init();
	        } catch (e) {}
	    } 
	}, 1);
    $(function(){
		//test media query compatibility
		$.support.mediaQueries = $.testMedia('only all');
		if (!$.support.mediaQueries) {
            $.enableMediaQuery.init();
        }
    });
})(jQuery);

    /*! Copyright (c) 2010 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.4
 * 
 * Requires: 1.2.2+
 */

(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( event.wheelDelta ) { delta = event.wheelDelta/120; }
    if ( event.detail     ) { delta = -event.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return $.event.handle.apply(this, args);
}

})(jQuery);

/**
 * @author trixta
 * @version 1.2
 */
(function($){

var mwheelI = {
			pos: [-260, -260]
		},
	minDif 	= 3,
	doc 	= document,
	root 	= doc.documentElement,
	body 	= doc.body,
	longDelay, shortDelay
;

function unsetPos(){
	if(this === mwheelI.elem){
		mwheelI.pos = [-260, -260];
		mwheelI.elem = false;
		minDif = 3;
	}
}

$.event.special.mwheelIntent = {
	setup: function(){
		var jElm = $(this).bind('mousewheel', $.event.special.mwheelIntent.handler);
		if( this !== doc && this !== root && this !== body ){
			jElm.bind('mouseleave', unsetPos);
		}
		jElm = null;
        return true;
    },
	teardown: function(){
        $(this)
			.unbind('mousewheel', $.event.special.mwheelIntent.handler)
			.unbind('mouseleave', unsetPos)
		;
        return true;
    },
    handler: function(e, d){
		var pos = [e.clientX, e.clientY];
		if( this === mwheelI.elem || Math.abs(mwheelI.pos[0] - pos[0]) > minDif || Math.abs(mwheelI.pos[1] - pos[1]) > minDif ){
            mwheelI.elem = this;
			mwheelI.pos = pos;
			minDif = 250;
			
			clearTimeout(shortDelay);
			shortDelay = setTimeout(function(){
				minDif = 10;
			}, 200);
			clearTimeout(longDelay);
			longDelay = setTimeout(function(){
				minDif = 3;
			}, 1500);
			e = $.extend({}, e, {type: 'mwheelIntent'});
            return $.event.handle.apply(this, arguments);
		}
    }
};
$.fn.extend({
	mwheelIntent: function(fn) {
		return fn ? this.bind("mwheelIntent", fn) : this.trigger("mwheelIntent");
	},
	
	unmwheelIntent: function(fn) {
		return this.unbind("mwheelIntent", fn);
	}
});

$(function(){
	body = doc.body;
	//assume that document is always scrollable, doesn't hurt if not
	$(doc).bind('mwheelIntent.mwheelIntentDefault', $.noop);
});
})(jQuery);
    /*
 * jQuery Color Animations
 * Copyright 2007 John Resig
 * Released under the MIT and GPL licenses.
 */

(function(jQuery){

	// We override the animation for all of these color styles
	jQuery.each(['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'], function(i,attr){
		jQuery.fx.step[attr] = function(fx){
			if ( fx.state == 0 ) {
				fx.start = getColor( fx.elem, attr );
				fx.end = getRGB( fx.end );
			}

			fx.elem.style[attr] = "rgb(" + [
				Math.max(Math.min( parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0]), 255), 0),
				Math.max(Math.min( parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1]), 255), 0),
				Math.max(Math.min( parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2]), 255), 0)
			].join(",") + ")";
		}
	});

	// Color Conversion functions from highlightFade
	// By Blair Mitchelmore
	// http://jquery.offput.ca/highlightFade/

	// Parse strings looking for color tuples [255,255,255]
	function getRGB(color) {
		var result;

		// Check if we're already dealing with an array of colors
		if ( color && color.constructor == Array && color.length == 3 )
			return color;

		// Look for rgb(num,num,num)
		if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
			return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];

		// Look for rgb(num%,num%,num%)
		if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
			return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];

		// Look for #a0b1c2
		if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
			return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];

		// Look for #fff
		if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
			return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];

		// Otherwise, we're most likely dealing with a named color
		return colors[jQuery.trim(color).toLowerCase()];
	}
	
	function getColor(elem, attr) {
		var color;

		do {
			color = jQuery.curCSS(elem, attr);

			// Keep going until we find an element that has color, or we hit the body
			if ( color != '' && color != 'transparent' || jQuery.nodeName(elem, "body") )
				break; 

			attr = "backgroundColor";
		} while ( elem = elem.parentNode );

		return getRGB(color);
	};
	
	// Some named colors to work with
	// From Interface by Stefan Petre
	// http://interface.eyecon.ro/

	var colors = {
		aqua:[0,255,255],
		azure:[240,255,255],
		beige:[245,245,220],
		black:[0,0,0],
		blue:[0,0,255],
		brown:[165,42,42],
		cyan:[0,255,255],
		darkblue:[0,0,139],
		darkcyan:[0,139,139],
		darkgrey:[169,169,169],
		darkgreen:[0,100,0],
		darkkhaki:[189,183,107],
		darkmagenta:[139,0,139],
		darkolivegreen:[85,107,47],
		darkorange:[255,140,0],
		darkorchid:[153,50,204],
		darkred:[139,0,0],
		darksalmon:[233,150,122],
		darkviolet:[148,0,211],
		fuchsia:[255,0,255],
		gold:[255,215,0],
		green:[0,128,0],
		indigo:[75,0,130],
		khaki:[240,230,140],
		lightblue:[173,216,230],
		lightcyan:[224,255,255],
		lightgreen:[144,238,144],
		lightgrey:[211,211,211],
		lightpink:[255,182,193],
		lightyellow:[255,255,224],
		lime:[0,255,0],
		magenta:[255,0,255],
		maroon:[128,0,0],
		navy:[0,0,128],
		olive:[128,128,0],
		orange:[255,165,0],
		pink:[255,192,203],
		purple:[128,0,128],
		violet:[128,0,128],
		red:[255,0,0],
		silver:[192,192,192],
		white:[255,255,255],
		yellow:[255,255,0]
	};
	
})(jQuery);

    /**
 * @author alexander.farkas
 */
(function($){
	$.widget('ui.scroller', {
		options: {
			//Wrapper Classes:
	        hidingWrapper: 'div.rack',
	        moveWrapper: 'div.rack-design',
	        //Elements Classes
	        atoms: 'div.teaser',
	        nextLink: 'a.next',
	        prevLink: 'a.prev',
	        activeLinkClass: 'show',
			stickyFirstLast: true,
			
	        linkFn: $.noop,
	        moveStep: 'atom',
	        direction: 'horizontal',
			
	        hidingWidth: false,
	        hidingHeight: false,
	        //animate
	        animate: true,
	        animateOptions: {
	            duration: 600,
	            complete: $.noop
	        },
	        enableMwheel: true,
			
	        diashow: false,
			restartDiaShow: true,
			
	        addSubPixel: 0,
			recalcStageOnresize: true,
			updateOnImgLoad: true,
			bindStyle: 'bind',
			
	        pagination: false,
	        paginationAtoms: '<li class="pa-$number"><a href="#">$number</a></li>',
	        paginationTitleFrom: false,
	        activePaginationClass: 'on',
	        paginationFn: false
		},
		_create: function(){
			
			var elem = this.element[0],
				o = this.options,
				that = this,
				fn		= o.animateOptions.complete
			;
			
	        o.animateOptions.complete = function(){
            	if(fn && $.isFunction(fn)){
					fn.call(this, that);
				}
	            that.propagate('end');
	        };
			
	        o.direction = (o.direction == 'vertical') ? {
	            scroll: 'scrollTop',
	            outerD: 'outerHeight',
	            dim: 'height',
				dir: 'Top'
	        } : {
	            scroll: 'scrollLeft',
	            outerD: 'outerWidth',
	            dim: 'width',
				dir: 'Left'
	        };
			
	        this.moveElem = $(o.moveWrapper, elem);
	        this.atomElem = $(o.atoms, elem);
	        this.hidingWrapper = $(o.hidingWrapper, elem);
	        
	        this.nextLink = $(o.nextLink, elem);
	        this.prevLink = $(o.prevLink, elem);
	        
	        this.position = 0;
	        this.atomPos = 0;
	        this.percentage = 0;
	        this.oldPosition = 0;
	        this.oldAtomPos = 0;
	        if (o.hidingHeight || o.hidingWidth) {
	            var css = (o.hidingHeight) ? {
	                height: o.hidingHeight
	            } : {};
	            if ((o.hidingWidth)) {
	                css = $.extend(css, {
	                    width: o.hidingWidth
	                });
	            }
	            this.hidingWrapper.css(css);
	        }
			
			this.selectedFocus = false;
			
			
			if($.fn.setFocus && $.fn.closest){
				var traverse = {};
				if((o.direction.dir === 'Top')){
					traverse[$.ui.keyCode.UP] = 'prev';
					traverse[$.ui.keyCode.DOWN] = 'next';
				} else {
					traverse[$.ui.keyCode.LEFT] = 'prev';
					traverse[$.ui.keyCode.RIGHT] = 'next';
				}
				this.moveElem
					.bind('keyfocus', function(e){
						var atom = $(e.target).closest(o.atoms);
						if(atom[0]){
							that.scrollIntoView(atom);
						}
					})
					.bind('focusin', function(e){
						var atom = $(e.target).closest(o.atoms);
						that.selectedFocus = (atom[0]) ? atom : false;
					})
					.bind('focusout', function(e){
						that.selectedFocus = false;
					})
					.bind('keydown', function(e){
						
						if(that.selectedFocus === false || !traverse[e.keyCode]){return;}
						var selectElement = that.selectedFocus[traverse[e.keyCode]](o.atoms);
						
						if(selectElement && selectElement[0]){
							e.preventDefault();
							selectElement.setFocus();
							that.scrollIntoView(selectElement);
						} else if(that.isSliding){
							e.preventDefault();
						}

					});
			}
			
	        this.dims = [0];
	        this.hidingWrapper[o.direction.scroll](0);
			this.minPos = 0;
	        this.update();
			
			if(o.recalcStageOnresize){
				$(window).bind('resize', function(){
					setTimeout(function(){
						that.stageWidthUpdate.call(that);
					}, 0);
				});
			}
			
			if(o.updateOnImgLoad){
				this.updateOnImgLoad();
			}
			
	        if (o.diashow) {
	            this.startDiashow();
	            this.element.bind('mouseenter focusin', function(){
	                clearInterval(that.diaTimer);
					setTimeout(function(){
						clearInterval(that.diaTimer);
					}, 9);
	            });
				if(o.restartDiaShow){
					this.element
						.bind('mouseleave focusout', function(){
			                that.startDiashow.call(that);
			            });
				}
	        }
			
	        if (o.enableMwheel && $.fn.mwheelIntent) {
				this.hidingWrapper.mwheelIntent(function(e, d){
	                that.stopDiashow.call(that);
	                d = (d < 0) ? '-' : '+';
					if((that.position >= that.maxPos && d === '-') || (d === '+' && that.position <= that.minPos)){
						return !that.isSliding;
					}
					
	                var moveStep = (o.moveStep) ? o.moveStep : 'atom';
	                that.moveTo(d + 'atom1');
	                return false;
	            });
	        }
						
			var handlePrevNext = function(){
	            var dir = ($.inArray(this, that.prevLink) !== -1) ?
					'+' :
					'-';
				that.stopDiashow.call(that);
	            that.moveTo(dir + o.moveStep);
	            return false;
	        };
			
	        this.nextLink
				.bind('click.uiscroller', handlePrevNext);
	        this.prevLink
				.bind('click.uiscroller', handlePrevNext);
			if($.browser.msie && parseInt($.browser.version, 10) < 7){
				var over = function(){$(this).addClass('over');},
					out = function(){$(this).removeClass('over');}
				;
				this.nextLink
					.hover(over, out);
		        this.prevLink
					.hover(over, out);
			}	
			if(o.defaultSelected){
				this.moveTo('goTo'+ o.defaultSelected, false);
			}		
			this.propagate('init');
		},
		stageWidthUpdate: function(){
			this.dims[1] = this.hidingWrapper[this.options.direction.dim]();
			this.maxPos = (this.dims[0] - this.dims[1]);
			this.updatePosition_Controls();
		},
        createPagination: function(hard){
            var content = '<ul>', that = this, tmpContent, o = this.options;
            this.pagination = $(o.pagination, this.element[0]);
            this.atomElem.each(function(i){
                tmpContent = o.paginationAtoms.replace(/\$number/g, i + 1);
                
                content += (o.paginationTitleFrom) ? tmpContent.replace(/\$title/g, $(o.paginationTitleFrom, this).text()) : tmpContent;
            });
            this.pagination.html(content + '</ul>').find('a').each(function(i){
                $(this).click(function(){
                    that.stopDiashow.call(that);
                    that.moveTo.call(that, 'goTo' + i);
                    return false;
                });
            });
        },
		getIndexNearPos: function(nPos){
			var len = this.dims.length;
			while (len--) {
                if (nPos >= this.dims[len]) {					
                    return len;
                }
            }
            return false;
        },
		inView: function(atom){
			var dir 		= this.options.direction,
				stageDim 	= this.dims[1],
				atomDim 	= atom[dir.outerD](),
				curPos		= this.hidingWrapper['scroll' + dir.dir](),
				atomPos 	= atom[0]['offset'+ dir.dir]
			;
			if(curPos > atomPos || stageDim < atomDim + atomPos - curPos){
				return atomPos;
			}
			return false;
		},
		scrollIntoView: function(atom){
			var inView = this.inView(atom);
			if(inView !== false){
				this.moveTo(inView);
			}
		},

        _setOption: function(k, v){
        	var o = this.options;
        	switch(k) {
	        	case 'enableMwheel' :
	        		if( !v && o.enableMwheel){
	        			this.hidingWrapper.unmwheelIntent();
	        		}
	        		break;
	        		
	        	case 'addSubPixel':
	        		if(o.addSubPixel !== v) {
	        			this.dims[0] -= o.addSubPixel;
	        			o.addSubPixel = v;
	        			this.dims[0] += o.addSubPixel;
	        			this.update();
	        		}
	        		break;
        	}
        	$.Widget.prototype._setOption.apply(this, arguments);
        },
        startDiashow: function(){
            var that = this;
            clearInterval(this.diaTimer);
            this.diaTimer = setInterval(function(){
                ((that.position === that.maxPos && that.options.type !== 'carousel') ? that.moveTo(0, false) : that.moveTo('-' + that.options.moveStep));
            }, this.options.diashow);
        },
        stopDiashow: function(){
            this.element.unbind('.diashow');
            clearInterval(this.diaTimer);
        },
		updateOnImgLoad: function(){
			var loadingSize = 0;
			var that = this;
			$('img', this.element).each(function(){
				if(!this.complete){
					loadingSize++;
					$(this).one('load', function(){
						loadingSize--;
						if(!loadingSize){
							that.update(true);
						}
					});
				}
			});
		},
        update: function(hard){
            var that = this, jElm, o = this.options;
            
			if (hard) {
                this.dims = [0];
            }
			
            this.dims[1] = this.hidingWrapper.css({
                overflow: 'hidden',
				position: 'relative'
            })[o.direction.dim]();
			
            var from = this.dims.length - 2;
			for(var i = from, len = this.atomElem.length; i < len; i++){
                jElm = $(this.atomElem[i]);
                that.dims.push(that.dims[0]);
                that.dims[0] += jElm[o.direction.outerD]({margin: true});
			}
			this.dims[0] += o.addSubPixel;
            this.maxPos = (this.dims[0] - this.dims[1]);
			
			var moveCss = {};
			moveCss[o.direction.dim] = this.dims[0] + 'px';
			
            this.moveElem.css(moveCss);
			
            if (o.pagination) {
                this.createPagination(hard);
            }
            this.updatePosition_Controls();
        },
        updatePosition_Controls: function(pos){
			//calculate the curent position
			var o = this.options;
			pos = (isNaN(pos)) ? parseInt(this.hidingWrapper[o.direction.scroll](), 10) : pos;
			
			function changeState(elem, active){
				var doo = (active) ?{
						style: 'addClass'
					} : {
						style: 'removeClass'
					};
				return elem[doo.style](o.activeLinkClass);
			}
			
            if(pos !== this.position){
				this.percentage = pos / (this.maxPos / 100);
	            this.oldPosition = this.position;
	            this.oldAtomPos = this.atomPos;
	            this.position = pos;
				
	            var num = this.getIndexNearPos(this.position);
	           
			    num = (num) ? num - 2 : 0;
	            this.atomPos = num;
			}
			
			this.percentage = pos / (this.maxPos / 100);
            
            if (pos <= this.minPos && this.prevLink.hasClass(o.activeLinkClass)) {
                o.linkFn.call(this.prevLink, 'hide', this.ui());
				changeState(this.prevLink);
            }
            else 
                if (pos > this.minPos && !this.prevLink.hasClass(o.activeLinkClass)) {
                    o.linkFn.call(this.prevLink, 'show', this.ui());
					changeState(this.prevLink, true);
                }
            if (pos >= this.maxPos && this.nextLink.hasClass(o.activeLinkClass)) {
                o.linkFn.call(this.nextLink, 'hide', this.ui());
				changeState(this.nextLink);
                
            }
            else 
                if (pos < this.maxPos && !this.nextLink.hasClass(o.activeLinkClass)) {
                    o.linkFn.call(this.nextLink, 'show', this.ui());
					changeState(this.nextLink, true);
                }
            if (this.pagination) {
                var oldActive = this.pagination.find('li').filter('.' + o.activePaginationClass).removeClass(o.activePaginationClass), newActive = oldActive.end().eq(this.atomPos).addClass(o.activePaginationClass);
                if ($.isFunction(o.paginationFn)) {
                    o.paginationFn.call(oldActive, 'inactive');
                    o.paginationFn.call(newActive, 'active');
                }
            }
        },
        getNummericPosition: function(ePos){
            var rel = false, num, lastDim = this.dims[this.dims.length - 1];
			
            // handle Atom Step & goTo
            if (ePos.indexOf('goTo') === 0) {
                num = parseInt(/(\d+)$/.exec(ePos)[0], 10) + 2;
                ePos = this.dims[num];
            }
			else if (ePos.indexOf('centerTo') === 0) {
				num = parseInt(/(\d+)$/.exec(ePos)[0], 10) + 2;
				ePos = this.dims[num] - (this.dims[1] / 2) + (this.atomElem.filter(":eq("+num+")")[this.options.direction.outerD]() / 2);
			}
            else 
                if (ePos == '-atom' || ePos == '-atom1') {
                    num = this.atomPos + 3;
                    ePos = (this.dims[num] || this.dims[num] === 0) ? this.dims[num] : lastDim;
                }
                else 
                    if (ePos == '+atom' || ePos == '+atom1') {
                        ePos = (this.atomPos) ? this.dims[this.atomPos + 1] : 0;
                    }
                    else 
                        if (ePos.indexOf('atom') == 1) {
                            num = parseInt(/(\d+)$/.exec(ePos)[0], 10);
                            if (ePos.indexOf('-') === 0) {
                                num += 2;
                                if (this.dims[this.atomPos + num]) {
                                    ePos = this.dims[this.atomPos + num];
                                }
                                else {
                                    ePos = lastDim;
                                }
                            }
                            else {
                                num -= 2;
                                var aLen = this.atomPos - num;
                                if (aLen > 1 && this.dims[this.atomPos - num]) {
                                    ePos = this.dims[this.atomPos - num];
                                }
                                else {
                                    ePos = 0;
                                }
                            }
                        // handle: +/-Number
                        }
                        else 
                            if (ePos.indexOf('+') === 0 || ePos.indexOf('-') === 0) {
                                rel = ePos.slice(0, 1);
                                ePos = parseInt(ePos.slice(1), 10);
                                ePos = (rel == '-') ? this.position + ePos : this.position - ePos;
                            }
                            else {
                                // handle Percentage
                                var per = /(\d+)%$/.exec(ePos);
                                if (per && per[1]) {
                                    ePos = this.maxPos / 100 * parseFloat(ePos);
                                }
                            }
			if(this.options.stickyFirstLast){
				if((ePos - this.maxPos) * -1 < this.atomElem.filter(':last')[this.options.direction.outerD]()){
                    if (ePos > this.maxPos) {
                        ePos = this.maxPos;
                    }
				} else if(ePos < this.atomElem[this.options.direction.outerD]()){
					ePos = 0;
				}
			}
            return ePos;
        },
        moveTo: function(pos, anim, animOp){
			pos = (typeof pos === 'string' || isNaN(pos)) ? this.getNummericPosition(pos) : pos;
		    pos = (pos <= 0) ? 0 : (pos >= this.maxPos) ? this.maxPos : pos;
            if (pos === this.position) {
                return false;
            }
            var o = this.options, scroll = o.direction.scroll;
            this.updatePosition_Controls(pos);
            this.propagate('start', this.oldPosition);
            
            anim = (typeof anim == 'undefined') ? o.animate : anim;
            if (anim) {
                //dirty break recursion
                animOp = animOp ||
                {};
                animOp = $.extend({}, o.animateOptions, {
                    slide: this
                }, animOp);
                var animCss = (scroll == 'scrollTop') ? 
					{scrollerTop: pos} : 
					{scrollerLeft: pos}
				;
                this.hidingWrapper.stop().animate(animCss, animOp);
            }
            else {
                this.hidingWrapper.stop()[scroll](pos);
                this.propagate('end');
            }
        },
        ui: function(){
            return {
                instance: this,
                options: this.options,
                pos: this.position,
                percentPos: this.percentage,
                oldIndex: this.oldAtomPos,
                newIndex: this.atomPos,
                size: this.dims.length - 2
            };
        },
        propagate: function(n, pos){
			var args = (pos || pos === 0) ? $.extend({}, this.ui(), {
                'pos': pos,
                percentPos: pos / (this.maxPos / 100)
            }) : this.ui();
			if(n === 'start'){
				this.isSliding = true;
			} else if(n === 'end'){
				this.isSliding = false;
			}
            this.element.triggerHandler("uiscroller" + n, [args]);
			if(this.options[n]){
				this.options[n].call(this.element[0], {type: 'uiscroller' + n}, args);
			}
        }
	});
	$.each({scrollerLeft: 'scrollLeft', scrollerTop: 'scrollTop'}, function(name, prop){
		$.fx.step[name] = function(fx){
            if (fx.now || fx.now === 0) {
                var scroller = fx.options.slide;
                if (scroller) {
					if(!fx.scrollerInit){
						fx.scrollerInit = true;
						fx.start = scroller.hidingWrapper[prop]();
						fx.now = fx.start;
					}
					scroller.hidingWrapper[prop](fx.now);
                   	scroller.propagate('slide', fx.now);
                }
            }
        };
	});
   
})(jQuery);

    /*
 * jQuery UI Slider 1.8.6
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Slider
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

// number of pages in a slider
// (how many times can you page up/down to go through the whole range)
var numPages = 5;

$.widget( "ui.slider", $.ui.mouse, {

	widgetEventPrefix: "slide",

	options: {
		animate: false,
		distance: 0,
		max: 100,
		min: 0,
		orientation: "horizontal",
		range: false,
		step: 1,
		value: 0,
		values: null
	},

	_create: function() {
		var self = this,
			o = this.options;

		this._keySliding = false;
		this._mouseSliding = false;
		this._animateOff = true;
		this._handleIndex = null;
		this._detectOrientation();
		this._mouseInit();

		this.element
			.addClass( "ui-slider" +
				" ui-slider-" + this.orientation +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" );
		
		if ( o.disabled ) {
			this.element.addClass( "ui-slider-disabled ui-disabled" );
		}

		this.range = $([]);

		if ( o.range ) {
			if ( o.range === true ) {
				this.range = $( "<div></div>" );
				if ( !o.values ) {
					o.values = [ this._valueMin(), this._valueMin() ];
				}
				if ( o.values.length && o.values.length !== 2 ) {
					o.values = [ o.values[0], o.values[0] ];
				}
			} else {
				this.range = $( "<div></div>" );
			}

			this.range
				.appendTo( this.element )
				.addClass( "ui-slider-range" );

			if ( o.range === "min" || o.range === "max" ) {
				this.range.addClass( "ui-slider-range-" + o.range );
			}

			// note: this isn't the most fittingly semantic framework class for this element,
			// but worked best visually with a variety of themes
			this.range.addClass( "ui-widget-header" );
		}

		if ( $( ".ui-slider-handle", this.element ).length === 0 ) {
			$( "<a href='#'></a>" )
				.appendTo( this.element )
				.addClass( "ui-slider-handle" );
		}

		if ( o.values && o.values.length ) {
			while ( $(".ui-slider-handle", this.element).length < o.values.length ) {
				$( "<a href='#'></a>" )
					.appendTo( this.element )
					.addClass( "ui-slider-handle" );
			}
		}

		this.handles = $( ".ui-slider-handle", this.element )
			.addClass( "ui-state-default" +
				" ui-corner-all" );

		this.handle = this.handles.eq( 0 );

		this.handles.add( this.range ).filter( "a" )
			.click(function( event ) {
				event.preventDefault();
			})
			.hover(function() {
				if ( !o.disabled ) {
					$( this ).addClass( "ui-state-hover" );
				}
			}, function() {
				$( this ).removeClass( "ui-state-hover" );
			})
			.focus(function() {
				if ( !o.disabled ) {
					$( ".ui-slider .ui-state-focus" ).removeClass( "ui-state-focus" );
					$( this ).addClass( "ui-state-focus" );
				} else {
					$( this ).blur();
				}
			})
			.blur(function() {
				$( this ).removeClass( "ui-state-focus" );
			});

		this.handles.each(function( i ) {
			$( this ).data( "index.ui-slider-handle", i );
		});

		this.handles
			.keydown(function( event ) {
				var ret = true,
					index = $( this ).data( "index.ui-slider-handle" ),
					allowed,
					curVal,
					newVal,
					step;
	
				if ( self.options.disabled ) {
					return;
				}
	
				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
					case $.ui.keyCode.END:
					case $.ui.keyCode.PAGE_UP:
					case $.ui.keyCode.PAGE_DOWN:
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						ret = false;
						if ( !self._keySliding ) {
							self._keySliding = true;
							$( this ).addClass( "ui-state-active" );
							allowed = self._start( event, index );
							if ( allowed === false ) {
								return;
							}
						}
						break;
				}
	
				step = self.options.step;
				if ( self.options.values && self.options.values.length ) {
					curVal = newVal = self.values( index );
				} else {
					curVal = newVal = self.value();
				}
	
				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
						newVal = self._valueMin();
						break;
					case $.ui.keyCode.END:
						newVal = self._valueMax();
						break;
					case $.ui.keyCode.PAGE_UP:
						newVal = self._trimAlignValue( curVal + ( (self._valueMax() - self._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.PAGE_DOWN:
						newVal = self._trimAlignValue( curVal - ( (self._valueMax() - self._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
						if ( curVal === self._valueMax() ) {
							return;
						}
						newVal = self._trimAlignValue( curVal + step );
						break;
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						if ( curVal === self._valueMin() ) {
							return;
						}
						newVal = self._trimAlignValue( curVal - step );
						break;
				}
	
				self._slide( event, index, newVal );
	
				return ret;
	
			})
			.keyup(function( event ) {
				var index = $( this ).data( "index.ui-slider-handle" );
	
				if ( self._keySliding ) {
					self._keySliding = false;
					self._stop( event, index );
					self._change( event, index );
					$( this ).removeClass( "ui-state-active" );
				}
	
			});

		this._refreshValue();

		this._animateOff = false;
	},

	destroy: function() {
		this.handles.remove();
		this.range.remove();

		this.element
			.removeClass( "ui-slider" +
				" ui-slider-horizontal" +
				" ui-slider-vertical" +
				" ui-slider-disabled" +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" )
			.removeData( "slider" )
			.unbind( ".slider" );

		this._mouseDestroy();

		return this;
	},

	_mouseCapture: function( event ) {
		var o = this.options,
			position,
			normValue,
			distance,
			closestHandle,
			self,
			index,
			allowed,
			offset,
			mouseOverHandle;

		if ( o.disabled ) {
			return false;
		}

		this.elementSize = {
			width: this.element.outerWidth(),
			height: this.element.outerHeight()
		};
		this.elementOffset = this.element.offset();

		position = { x: event.pageX, y: event.pageY };
		normValue = this._normValueFromMouse( position );
		distance = this._valueMax() - this._valueMin() + 1;
		self = this;
		this.handles.each(function( i ) {
			var thisDistance = Math.abs( normValue - self.values(i) );
			if ( distance > thisDistance ) {
				distance = thisDistance;
				closestHandle = $( this );
				index = i;
			}
		});

		// workaround for bug #3736 (if both handles of a range are at 0,
		// the first is always used as the one with least distance,
		// and moving it is obviously prevented by preventing negative ranges)
		if( o.range === true && this.values(1) === o.min ) {
			index += 1;
			closestHandle = $( this.handles[index] );
		}

		allowed = this._start( event, index );
		if ( allowed === false ) {
			return false;
		}
		this._mouseSliding = true;

		self._handleIndex = index;

		closestHandle
			.addClass( "ui-state-active" )
			.focus();
		
		offset = closestHandle.offset();
		mouseOverHandle = !$( event.target ).parents().andSelf().is( ".ui-slider-handle" );
		this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
			left: event.pageX - offset.left - ( closestHandle.width() / 2 ),
			top: event.pageY - offset.top -
				( closestHandle.height() / 2 ) -
				( parseInt( closestHandle.css("borderTopWidth"), 10 ) || 0 ) -
				( parseInt( closestHandle.css("borderBottomWidth"), 10 ) || 0) +
				( parseInt( closestHandle.css("marginTop"), 10 ) || 0)
		};

		this._slide( event, index, normValue );
		this._animateOff = true;
		return true;
	},

	_mouseStart: function( event ) {
		return true;
	},

	_mouseDrag: function( event ) {
		var position = { x: event.pageX, y: event.pageY },
			normValue = this._normValueFromMouse( position );
		
		this._slide( event, this._handleIndex, normValue );

		return false;
	},

	_mouseStop: function( event ) {
		this.handles.removeClass( "ui-state-active" );
		this._mouseSliding = false;

		this._stop( event, this._handleIndex );
		this._change( event, this._handleIndex );

		this._handleIndex = null;
		this._clickOffset = null;
		this._animateOff = false;

		return false;
	},
	
	_detectOrientation: function() {
		this.orientation = ( this.options.orientation === "vertical" ) ? "vertical" : "horizontal";
	},

	_normValueFromMouse: function( position ) {
		var pixelTotal,
			pixelMouse,
			percentMouse,
			valueTotal,
			valueMouse;

		if ( this.orientation === "horizontal" ) {
			pixelTotal = this.elementSize.width;
			pixelMouse = position.x - this.elementOffset.left - ( this._clickOffset ? this._clickOffset.left : 0 );
		} else {
			pixelTotal = this.elementSize.height;
			pixelMouse = position.y - this.elementOffset.top - ( this._clickOffset ? this._clickOffset.top : 0 );
		}

		percentMouse = ( pixelMouse / pixelTotal );
		if ( percentMouse > 1 ) {
			percentMouse = 1;
		}
		if ( percentMouse < 0 ) {
			percentMouse = 0;
		}
		if ( this.orientation === "vertical" ) {
			percentMouse = 1 - percentMouse;
		}

		valueTotal = this._valueMax() - this._valueMin();
		valueMouse = this._valueMin() + percentMouse * valueTotal;

		return this._trimAlignValue( valueMouse );
	},

	_start: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}
		return this._trigger( "start", event, uiHash );
	},

	_slide: function( event, index, newVal ) {
		var otherVal,
			newValues,
			allowed;

		if ( this.options.values && this.options.values.length ) {
			otherVal = this.values( index ? 0 : 1 );

			if ( ( this.options.values.length === 2 && this.options.range === true ) && 
					( ( index === 0 && newVal > otherVal) || ( index === 1 && newVal < otherVal ) )
				) {
				newVal = otherVal;
			}

			if ( newVal !== this.values( index ) ) {
				newValues = this.values();
				newValues[ index ] = newVal;
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal,
					values: newValues
				} );
				otherVal = this.values( index ? 0 : 1 );
				if ( allowed !== false ) {
					this.values( index, newVal, true );
				}
			}
		} else {
			if ( newVal !== this.value() ) {
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal
				} );
				if ( allowed !== false ) {
					this.value( newVal );
				}
			}
		}
	},

	_stop: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}

		this._trigger( "stop", event, uiHash );
	},

	_change: function( event, index ) {
		if ( !this._keySliding && !this._mouseSliding ) {
			var uiHash = {
				handle: this.handles[ index ],
				value: this.value()
			};
			if ( this.options.values && this.options.values.length ) {
				uiHash.value = this.values( index );
				uiHash.values = this.values();
			}

			this._trigger( "change", event, uiHash );
		}
	},

	value: function( newValue ) {
		if ( arguments.length ) {
			this.options.value = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, 0 );
		}

		return this._value();
	},

	values: function( index, newValue ) {
		var vals,
			newValues,
			i;

		if ( arguments.length > 1 ) {
			this.options.values[ index ] = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, index );
		}

		if ( arguments.length ) {
			if ( $.isArray( arguments[ 0 ] ) ) {
				vals = this.options.values;
				newValues = arguments[ 0 ];
				for ( i = 0; i < vals.length; i += 1 ) {
					vals[ i ] = this._trimAlignValue( newValues[ i ] );
					this._change( null, i );
				}
				this._refreshValue();
			} else {
				if ( this.options.values && this.options.values.length ) {
					return this._values( index );
				} else {
					return this.value();
				}
			}
		} else {
			return this._values();
		}
	},

	_setOption: function( key, value ) {
		var i,
			valsLength = 0;

		if ( $.isArray( this.options.values ) ) {
			valsLength = this.options.values.length;
		}

		$.Widget.prototype._setOption.apply( this, arguments );

		switch ( key ) {
			case "disabled":
				if ( value ) {
					this.handles.filter( ".ui-state-focus" ).blur();
					this.handles.removeClass( "ui-state-hover" );
					this.handles.attr( "disabled", "disabled" );
					this.element.addClass( "ui-disabled" );
				} else {
					this.handles.removeAttr( "disabled" );
					this.element.removeClass( "ui-disabled" );
				}
				break;
			case "orientation":
				this._detectOrientation();
				this.element
					.removeClass( "ui-slider-horizontal ui-slider-vertical" )
					.addClass( "ui-slider-" + this.orientation );
				this._refreshValue();
				break;
			case "value":
				this._animateOff = true;
				this._refreshValue();
				this._change( null, 0 );
				this._animateOff = false;
				break;
			case "values":
				this._animateOff = true;
				this._refreshValue();
				for ( i = 0; i < valsLength; i += 1 ) {
					this._change( null, i );
				}
				this._animateOff = false;
				break;
		}
	},

	//internal value getter
	// _value() returns value trimmed by min and max, aligned by step
	_value: function() {
		var val = this.options.value;
		val = this._trimAlignValue( val );

		return val;
	},

	//internal values getter
	// _values() returns array of values trimmed by min and max, aligned by step
	// _values( index ) returns single value trimmed by min and max, aligned by step
	_values: function( index ) {
		var val,
			vals,
			i;

		if ( arguments.length ) {
			val = this.options.values[ index ];
			val = this._trimAlignValue( val );

			return val;
		} else {
			// .slice() creates a copy of the array
			// this copy gets trimmed by min and max and then returned
			vals = this.options.values.slice();
			for ( i = 0; i < vals.length; i+= 1) {
				vals[ i ] = this._trimAlignValue( vals[ i ] );
			}

			return vals;
		}
	},
	
	// returns the step-aligned value that val is closest to, between (inclusive) min and max
	_trimAlignValue: function( val ) {
		if ( val < this._valueMin() ) {
			return this._valueMin();
		}
		if ( val > this._valueMax() ) {
			return this._valueMax();
		}
		var step = ( this.options.step > 0 ) ? this.options.step : 1,
			valModStep = val % step,
			alignValue = val - valModStep;

		if ( Math.abs(valModStep) * 2 >= step ) {
			alignValue += ( valModStep > 0 ) ? step : ( -step );
		}

		// Since JavaScript has problems with large floats, round
		// the final value to 5 digits after the decimal point (see #4124)
		return parseFloat( alignValue.toFixed(5) );
	},

	_valueMin: function() {
		return this.options.min;
	},

	_valueMax: function() {
		return this.options.max;
	},
	
	_refreshValue: function() {
		var oRange = this.options.range,
			o = this.options,
			self = this,
			animate = ( !this._animateOff ) ? o.animate : false,
			valPercent,
			_set = {},
			lastValPercent,
			value,
			valueMin,
			valueMax;

		if ( this.options.values && this.options.values.length ) {
			this.handles.each(function( i, j ) {
				valPercent = ( self.values(i) - self._valueMin() ) / ( self._valueMax() - self._valueMin() ) * 100;
				_set[ self.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
				$( this ).stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
				if ( self.options.range === true ) {
					if ( self.orientation === "horizontal" ) {
						if ( i === 0 ) {
							self.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { left: valPercent + "%" }, o.animate );
						}
						if ( i === 1 ) {
							self.range[ animate ? "animate" : "css" ]( { width: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					} else {
						if ( i === 0 ) {
							self.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { bottom: ( valPercent ) + "%" }, o.animate );
						}
						if ( i === 1 ) {
							self.range[ animate ? "animate" : "css" ]( { height: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					}
				}
				lastValPercent = valPercent;
			});
		} else {
			value = this.value();
			valueMin = this._valueMin();
			valueMax = this._valueMax();
			valPercent = ( valueMax !== valueMin ) ?
					( value - valueMin ) / ( valueMax - valueMin ) * 100 :
					0;
			_set[ self.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
			this.handle.stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );

			if ( oRange === "min" && this.orientation === "horizontal" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { width: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "horizontal" ) {
				this.range[ animate ? "animate" : "css" ]( { width: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
			if ( oRange === "min" && this.orientation === "vertical" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { height: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "vertical" ) {
				this.range[ animate ? "animate" : "css" ]( { height: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
		}
	}

});

$.extend( $.ui.slider, {
	version: "1.8.6"
});

}(jQuery));

    /**
 * @author trixta
 */
(function($){
	
	function numsort (a, b) {
	  return a - b;
	}
	var uniqueID = 0;
	$.widget('ui.tabtree', {
		options: {
			buttonSel: 'a',
			panelSel: false,
			focusOnExpand: true,
			focusSel: true,
			createPanelwrapper: false, 
			toggleButton: false,
			multiSelectable: false,
			createPanelTabRelation: false,
			selectEvents: 'ariaclick',
			bindStyle: 'bind',
			bindContext: false,
			defaultSelected: 0,
			slideShow: false,
			restartSlideShow: true,
			activeButtonClass: 'js-selected',
			activePanelClass: 'js-expanded',
			handleDisplay: true, //initial | true | false
			interceptClick: true,
			addAria: true
		},
		_createPanelAPI: function(button, panel){
			var that = this;
			$.data(panel[0], 'tabtreepanel', {
				instance: this,
				button: button,
				expand: function(e){
					that.expand(button, e);
				},
				collapse: function(e){
					that.collapse(button, e);
				}
			});
			$.data(button[0], 'tabtreebutton', {
				instance: this,
				panel: panel,
				expand: function(e){
					that.expand(button, e);
				},
				collapse: function(e){
					that.collapse(button, e);
				}
			});
		},
		_create: function(){
			var that 			= this,
				o 				=  this.options,
				elem 			= this.element,
				isSelectedArray = o.defaultSelected.length,
				isHTMLSelected
			;
			
			this.selectedIndexes = [];			
			this.slideShowtimer = null;
			
			this.buttons = $(o.buttonSel, elem[0]);
			
			this.panels = (o.panelSel) ? 
				$(o.panelSel, this.element[0]).each(function(i){
					var button 	= $(that.buttons[i]),
						panel 	= $(this)
					;
					button.controlsThis(panel);
					if(o.createPanelTabRelation){
						panel.labelWith(button);
					}
					that._createPanelAPI(button, panel);
					
				}) : 
				this.buttons.map(function(){
					var button 	= $(this),
						idRef 	= button.getHrefHash(),
						panel 	= $(idRef)
					;
					
					if(o.createPanelTabRelation){
						panel.labelWith(button);
					}
					
					button.attr({'aria-controls': idRef.replace('#', '')});
					that._createPanelAPI(button, panel);
					return panel[0];
				});
							
			this.panels = $($.unique(this.panels.get()));
						
			if(o.createPanelwrapper){
				this.panels.wrap('<div class="a11y-panelwrapper" />');
			}
			
			//get defaultselected
			isHTMLSelected = !!this.buttons.filter('.'+ o.activeButtonClass)[0];
				
			this.buttons
				.each(function(i){
					var initAction;
					if(isHTMLSelected){
						initAction = ($(this).hasClass(o.activeButtonClass)) ? 'expand' : 'collapse';
					} else if(isSelectedArray){
						initAction = ($.inArray(i, o.defaultSelected) !== -1) ? 'expand' : 'collapse';
					} else {
						initAction = (o.defaultSelected === i) ? 'expand' : 'collapse';
					}
					that[initAction].call(that, this, {type: 'init'});
				})
			;
			
			if(o.addAria){
				this.buttons.attr({role: 'button'});
				if (this.buttons[0] && $.nodeName(this.buttons[0], 'a')) {
					this.buttons.each(function(){
						var jElm = $(this);
						this.setAttribute('data-href', jElm.attr('href'));
						if($.support.waiAria){
							jElm.removeAttr('href');
						}
					});
				}
			}
			
			this.panels.attr({role: 'group'}).addClass('a11y-js-overflow');
			
			uniqueID++;
			if(o.bindStyle === 'live'){
				this.buttons.context = (o.bindContext) ? $(o.bindContext, this.element)[0] : this.element[0];
				this.buttons.selector = '.tabtree-button_'+ uniqueID;
				this.buttons.addClass('tabtree-button_'+ uniqueID);
				if(!this.buttons.context) {
					console.log(o.bindContext +' not found in tab-module');
				}
			}
			
			if(o.selectEvents){
				this.buttons
					[o.bindStyle](o.selectEvents, function(e){
						var action = (o.toggleButton) ?
							'toggle' :
							'expand'
						;
						clearInterval(that.slideShowtimer);
						that[action].call(that, this, e);
						return false;
					})
				;
			}
			
			//focus panels onclick if no click event is added
			if(o.interceptClick && (!o.selectEvents || o.selectEvents.indexOf('click') == -1)){
				this.buttons[o.bindStyle]('click', function(){
					clearInterval(that.slideShowtimer);
					if(o.focusOnExpand){
						that.focusPanel.call(that, $('#'+$(this).attr('aria-controls')), 1);
					}
					return false;
				});
			}
			
			if(o.slideShow && isFinite(o.slideShow)){
				this.slideShowtimer = setInterval(function(){
					that.showPrevNext.call(that, 1);
				}, o.slideShow);
				
				this.element.inOut(
					function(){
						clearInterval(that.slideShowtimer);
					}, function(){
					if(o.restartSlideShow){
						clearInterval(that.slideShowtimer);
						that.slideShowtimer = setInterval(function(){
							that.showPrevNext.call(that, 1);
						}, o.slideShow);
					}
				});
			}
			
			this._trigger('init', {type: 'init'}, this.ui());
		},
		getPrevNext: function(dir){
			var index = this.buttons
				.index(this.buttons.filter('.'+ this.options.activeButtonClass)[0]) + dir
			;
			if(index < 0){
				index = this.buttons.length - 1;
			} else if(index >= this.buttons.length){
				index = 0;
			}
			return {button: this.buttons.get(index), panel: this.panels.get(index)};
		},
		showPrevNext: function(dir){
			var data = this.getPrevNext(dir);
			this.expand(data.button, {type: 'show-'+ dir});
		},
		toggle: function(button, e){
			var action = ($(button).hasClass(this.options.activeButtonClass)) ?
				'collapse' : 'expand';
			this[action](button, e);
		},
		collapse: function(button, e, _panel, _opener){
			e = e || {type: 'collapse'};
			button = $(button);
			
			//if button/panel is already inactive
			if(!button.hasClass(this.options.activeButtonClass) && e.type != 'init'){
				return false;
			}
			
			var panel 		= _panel || this.getPanel(button),
				buttons 	= this.getButtons(panel),
				type 		= (e.type == 'init') ? 
								'collapseinit' :
								'collapse',
				that 		= this,
				o 			= this.options,
				uiObj 		= {
								button: buttons,
								panel: panel
							}
			;
			
			if(!o.multiSelectable){
				uiObj.expandElements = _opener || 
					{
						panel: $([]),
						button: $([])
					}
				;
			}
			
			this.removeIndex(panel);
			if(this._trigger(type, e, $.extend({}, this.ui(), uiObj)) === false){
				this.addIndex(panel);
				return undefined;
			}
			
			this.setState(buttons, uiObj.panel, 'inactive');
			
			if(o.handleDisplay === true || (e.type == 'init' && o.handleDisplay)){
				if(o.hideStyle === 'visibility'){
					uiObj.panel
						.parent()
						.css({overflow: 'hidden', height: 0})
						.end()
						.css({visibility: 'hidden'})
					;
				} else {
					uiObj.panel.hide();
				}
			}
			
			uiObj.button = button;
			
			$.ui.SR.update();
			
			return uiObj;
		},
		addIndex: function(index){
			if(!isFinite(index) && index.jquery){
				index = this.panels.index(index[0]);
			}
			if($.inArray(index, this.selectedIndexes) === -1){
				this.selectedIndexes.push(index);
				this.selectedIndexes.sort(numsort);
			}
		},
		removeIndex: function(index){
			if(!isFinite(index) && index.jquery){
				index = this.panels.index(index[0]);
			}
			this.selectedIndexes = $.grep(this.selectedIndexes, function(num, i){
				return (index !== num);
			});
		},
		expand: function(button, e){
			e = e ||
				{type: 'expand'};
			button = $(button);
			
			//if button/panel is already active
			if(e.type != 'init' && button.hasClass(this.options.activeButtonClass)){
				return false;
			}
			
			var type 			= (e.type == 'init') ? 
								'expandinit' :
								'expand',
				that 			= this,
				o 				= this.options,
				uiObj 			= {},
				panel 			= this.getPanel(button),
				buttons			= this.getButtons(panel),
				collapseButton 	= this.buttons.filter('.'+ o.activeButtonClass),
				posStyle,
				panelWrapper
			;
			
			uiObj.button = buttons;
			uiObj.panel = panel;
			
			if(!o.multiSelectable){
				uiObj.collapseElements = {
							button: collapseButton, 
							panel: this.getPanel(collapseButton)
						};
				
			}
			
			this.addIndex(panel);
			//collapse all other panels, if not multiSelectable
			if(e.type != 'init' && !o.multiSelectable){
				collapseButton.each(function(){
					that.collapse.call(that, this, e, false, {button: buttons, panel: panel});
				});
			}
			this.setState(buttons, panel, 'active');
			
			
						
			if(o.handleDisplay === true || (e.type == 'init' && o.handleDisplay == 'initial')){
				if(o.hideStyle === 'visibility'){
					panel
						.parent()
						.css({overflow: '', height: ''})
						.end()
						.css({visibility: ''})
					;
				} else {
					panel.show();
				}
				
			}
			
			$.ui.SR.update();
			
			if(o.addToHistory && e.type !== 'init' && e.type !== 'hashHistoryChange'){
				$.hashHistory.add('tab-'+ panel.getID());
			}
			
			this._trigger(type, e, $.extend({}, this.ui(), uiObj));
			
			if(/click|hashHistoryChange/.test(e.type) && o.focusOnExpand){
				that.focusPanel(panel);
			}
			return undefined;
		},
		collapseAll: function(e){
			var that = this;
			$.each(this.selectedIndexes, function(i, index){
				that.collapse.call(that, that.buttons[index], e);
			});
		},
		getButtons: function(panel){
			return this.buttons.filter('[aria-controls='+ panel.getID() +']');
		},
		getPanel: function(button){
			return this.panels.filter('#'+ button.attr('aria-controls') );
		},
		setState: function(button, panel, state){
			var o	 	= this.options,
				set 	= (state == 'active') ? 
							{
								c: 'addClass',
								
								index: '-1',
								aria: 'true'
							} :
							{
								c: 'removeClass',
								index: '0',
								aria: 'false'
							}
			;
			if((!o.toggleButton)){
				button.attr({'tabindex': set.index, 'aria-disabled': set.aria})[set.c]('ui-disabled');
			} else {
				button.attr({'tabindex': '0'});
			}
			button[set.c](o.activeButtonClass).attr('aria-expanded', set.aria);
			panel[set.c](o.activePanelClass).attr('aria-expanded', set.aria);
		},
		focusPanel: function(panel){
			var o 			= this.options,
				focusElem 	= (o.focusSel === true || !o.focusSel) ? panel.firstExpOf('focusPoint') : $(o.focusSel, panel)
			;
			focusElem.setFocus({context: (panel[0].parentNode || {}).parentNode});
			return undefined;
		},
		ui: function(){
			return {
				instance: this,
				panels: this.panels,
				buttons: this.buttons,
				selectedIndexes: this.selectedIndexes
			};
		}
	});
	
})(jQuery);
    /**
 * @author alexander.farkas
 */
(function($){
	var uID = new Date().getTime();
	$.fn.embedSWF = function(o){
		
		var ret = [],
			reservedParams = ['width', 'height', 'expressInstall', 'version'];
		o = $.extend(true, {}, $.fn.embedSWF.defaults, o);
		
		function getId(jElem){
			var id = jElem.attr('id');
			if(!id){
				id = 'id-' + String(uID++);
				jElem.attr({id: id});
			}
			return id;
		}
		
		function strToObj(str){
			var obj  = {};
			if(str){
				str = str.replace(/^\?/,'').replace(/&amp;/g, '&').split(/&/);
				$.each(str, function(i, param){
					queryPair = param.split(/\=/);
					obj[decodeURIComponent(queryPair[0])] = (queryPair[1]) ?
						decodeURIComponent(queryPair[1]) :
						'';
				});
			}
			return obj;
		}
		
		this.each(function(){
			
			var jElem = $(this),
				classes = this.className,
				linkSrc = $('a', this).filter('[href*=.swf], [href*=.flv]'),
				id =  getId(jElem),
				src = linkSrc.attr('href').split('?'),
				params = strToObj(src[1]),
				width = params.width ||
					jElem.width(),
				height = params.height ||
					jElem.height(),
				version = params.version || 
					o.version,
				expressInstall,
				flash;
			
			if(params.expressInstall == 'false'){
				expressInstall = false;
			} else if(!params.expressInstall){
				expressInstall = o.expressInstall;
			} else {
				expressInstall = params.expressInstall;
			}
			$.each(reservedParams, function(i, reservedParam){
				delete params[reservedParam];
			});
			
			$.extend({}, o.parameters, params);
			swfobject.embedSWF(src[0], id, width, height, version, expressInstall, false, params);
			flash = document.getElementById(id);
			flash.className = classes;
			
			ret.push(flash);
			
		});
		return this.pushStack(ret);
	};
	
	$.fn.embedSWF.defaults = {
		expressInstall: false,
		version: "9.0.124",
		parameters: {}
	};
})(jQuery);
    /*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
    // Bookmarks
(function($){
    $.socialbookmark={
		findRelElm: function(elm){
			var jelm = $(elm),
			ref = jelm.attr('href'),
			find = ref.indexOf('#');
			ref = ref.substr(find);
			return ref;
		},
		handler: function(){
			if($.socialbookmark.actElm && !$($.socialbookmark.actElm).is(':hidden')){
				$.socialbookmark.hide();
			} else {
				$.socialbookmark.show.call(this);
			}
			return false;
		},
		hideNotinActElm: function(e){
			var jElm = $(e.target);
			if(jElm.is($.socialbookmark.actElm) || jElm.parents($.socialbookmark.actElm).size()){
				return;
			}
			$.socialbookmark.hide();
		},
		show:function(){
			var ref = $.socialbookmark.findRelElm(this);
			$(ref).animate({height: 'show',opacity: 'show'}, {duration: 400});
			$.socialbookmark.actElm = ref;
			$(document).bind('click', $.socialbookmark.hideNotinActElm);
			return false;
		},
		actElm: null,
		hide: function(){
			$($.socialbookmark.actElm).animate({height: "hide", opacity: "hide"});
			$('body').unbind('click', $.socialbookmark.hideNotinActElm);
		},
		init: function(sel){
			var jElm = $(sel);
			if(jElm.size()){
				var ref = $.socialbookmark.findRelElm(jElm[0]);
				$(ref).css({display: 'none'});
				jElm.click($.socialbookmark.handler);
			}
		}
	};
})(jQuery);
    /** 
 * flowplayer.js 3.0.3. The Flowplayer API
 * 
 * Copyright 2008 Flowplayer Oy
 * 
 * This file is part of Flowplayer.
 * 
 * Flowplayer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Flowplayer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Flowplayer.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Version: 3.0.3 - Wed Jan 07 2009 13:22:30 GMT-0000 (GMT+00:00)
 */
(function(){function log(args){console.log("$f.fireEvent",[].slice.call(args));}function clone(obj){if(!obj||typeof obj!='object'){return obj;}var temp=new obj.constructor();for(var key in obj){if(obj.hasOwnProperty(key)){temp[key]=clone(obj[key]);}}return temp;}function each(obj,fn){if(!obj){return;}var name,i=0,length=obj.length;if(length===undefined){for(name in obj){if(fn.call(obj[name],name,obj[name])===false){break;}}}else{for(var value=obj[0];i<length&&fn.call(value,i,value)!==false;value=obj[++i]){}}return obj;}function el(id){return document.getElementById(id);}function extend(to,from,skipFuncs){if(to&&from){each(from,function(name,value){if(!skipFuncs||typeof value!='function'){to[name]=value;}});}}function select(query){var index=query.indexOf(".");if(index!=-1){var tag=query.substring(0,index)||"*";var klass=query.substring(index+1,query.length);var els=[];each(document.getElementsByTagName(tag),function(){if(this.className&&this.className.indexOf(klass)!=-1){els.push(this);}});return els;}}function stopEvent(e){e=e||window.event;if(e.preventDefault){e.stopPropagation();e.preventDefault();}else{e.returnValue=false;e.cancelBubble=true;}return false;}function bind(to,evt,fn){to[evt]=to[evt]||[];to[evt].push(fn);}function makeId(){return"_"+(""+Math.random()).substring(2,10);}var Clip=function(json,index,player){var self=this;var cuepoints={};var listeners={};self.index=index;if(typeof json=='string'){json={url:json};}extend(this,json,true);each(("Begin*,Start,Pause*,Resume*,Seek*,Stop*,Finish*,LastSecond,Update,BufferFull,BufferEmpty,BufferStop").split(","),function(){var evt="on"+this;if(evt.indexOf("*")!=-1){evt=evt.substring(0,evt.length-1);var before="onBefore"+evt.substring(2);self[before]=function(fn){bind(listeners,before,fn);return self;};}self[evt]=function(fn){bind(listeners,evt,fn);return self;};if(index==-1){if(self[before]){player[before]=self[before];}if(self[evt]){player[evt]=self[evt];}}});extend(this,{onCuepoint:function(points,fn){if(arguments.length==1){cuepoints.embedded=[null,points];return self;}if(typeof points=='number'){points=[points];}var fnId=makeId();cuepoints[fnId]=[points,fn];if(player.isLoaded()){player._api().fp_addCuepoints(points,index,fnId);}return self;},update:function(json){extend(self,json);if(player.isLoaded()){player._api().fp_updateClip(json,index);}var conf=player.getConfig();var clip=(index==-1)?conf.clip:conf.playlist[index];extend(clip,json,true);},_fireEvent:function(evt,arg1,arg2,target){if(evt=='onLoad'){each(cuepoints,function(key,val){if(val[0]){player._api().fp_addCuepoints(val[0],index,key);}});return false;}if(index!=-1){target=self;}if(evt=='onCuepoint'){var fn=cuepoints[arg1];if(fn){return fn[1].call(player,target,arg2);}}if(evt=='onStart'||evt=='onUpdate'){extend(target,arg1);if(!target.duration){target.duration=arg1.metaData.duration;}else{target.fullDuration=arg1.metaData.duration;}}var ret=true;each(listeners[evt],function(){ret=this.call(player,target,arg1,arg2);});return ret;}});if(json.onCuepoint){var arg=json.onCuepoint;self.onCuepoint.apply(self,typeof arg=='function'?[arg]:arg);delete json.onCuepoint;}each(json,function(key,val){if(typeof val=='function'){bind(listeners,key,val);delete json[key];}});if(index==-1){player.onCuepoint=this.onCuepoint;}};var Plugin=function(name,json,player,fn){var listeners={};var self=this;var hasMethods=false;if(fn){extend(listeners,fn);}each(json,function(key,val){if(typeof val=='function'){listeners[key]=val;delete json[key];}});extend(this,{animate:function(props,speed,fn){if(!props){return self;}if(typeof speed=='function'){fn=speed;speed=500;}if(typeof props=='string'){var key=props;props={};props[key]=speed;speed=500;}if(fn){var fnId=makeId();listeners[fnId]=fn;}if(speed===undefined){speed=500;}json=player._api().fp_animate(name,props,speed,fnId);return self;},css:function(props,val){if(val!==undefined){var css={};css[props]=val;props=css;}json=player._api().fp_css(name,props);extend(self,json);return self;},show:function(){this.display='block';player._api().fp_showPlugin(name);return self;},hide:function(){this.display='none';player._api().fp_hidePlugin(name);return self;},toggle:function(){this.display=player._api().fp_togglePlugin(name);return self;},fadeTo:function(o,speed,fn){if(typeof speed=='function'){fn=speed;speed=500;}if(fn){var fnId=makeId();listeners[fnId]=fn;}this.display=player._api().fp_fadeTo(name,o,speed,fnId);this.opacity=o;return self;},fadeIn:function(speed,fn){return self.fadeTo(1,speed,fn);},fadeOut:function(speed,fn){return self.fadeTo(0,speed,fn);},getName:function(){return name;},_fireEvent:function(evt,arg){if(evt=='onUpdate'){var json=player._api().fp_getPlugin(name);if(!json){return;}extend(self,json);delete self.methods;if(!hasMethods){each(json.methods,function(){var method=""+this;self[method]=function(){var a=[].slice.call(arguments);var ret=player._api().fp_invoke(name,method,a);return ret=='undefined'?self:ret;};});hasMethods=true;}}var fn=listeners[evt];if(fn){fn.call(self,arg);if(evt.substring(0,1)=="_"){delete listeners[evt];}}}});};function Player(wrapper,params,conf){var
self=this,api=null,html,commonClip,playlist=[],plugins={},listeners={},playerId,apiId,playerIndex,activeIndex,swfHeight,wrapperHeight;extend(self,{id:function(){return playerId;},isLoaded:function(){return(api!==null);},getParent:function(){return wrapper;},hide:function(all){if(all){wrapper.style.height="0px";}if(api){api.style.height="0px";}return self;},show:function(){wrapper.style.height=wrapperHeight+"px";if(api){api.style.height=swfHeight+"px";}return self;},isHidden:function(){return api&&parseInt(api.style.height,10)===0;},load:function(fn){if(!api&&self._fireEvent("onBeforeLoad")!==false){each(players,function(){this.unload();});html=wrapper.innerHTML;flashembed(wrapper,params,{config:conf});if(fn){fn.cached=true;bind(listeners,"onLoad",fn);}}return self;},unload:function(){try{if(api&&api.fp_isFullscreen()){}}catch(error){return;}if(api&&html.replace(/\s/g,'')!==''&&!api.fp_isFullscreen()&&self._fireEvent("onBeforeUnload")!==false){api.fp_close();wrapper.innerHTML=html;self._fireEvent("onUnload");api=null;}return self;},getClip:function(index){if(index===undefined){index=activeIndex;}return playlist[index];},getCommonClip:function(){return commonClip;},getPlaylist:function(){return playlist;},getPlugin:function(name){var plugin=plugins[name];if(!plugin&&self.isLoaded()){var json=self._api().fp_getPlugin(name);if(json){plugin=new Plugin(name,json,self);plugins[name]=plugin;}}return plugin;},getScreen:function(){return self.getPlugin("screen");},getControls:function(){return self.getPlugin("controls");},getConfig:function(copy){return copy?clone(conf):conf;},getFlashParams:function(){return params;},loadPlugin:function(name,url,props,fn){if(typeof props=='function'){fn=props;props={};}var fnId=fn?makeId():"_";self._api().fp_loadPlugin(name,url,props,fnId);var arg={};arg[fnId]=fn;var p=new Plugin(name,null,self,arg);plugins[name]=p;return p;},getState:function(){return api?api.fp_getState():-1;},play:function(clip){function play(){if(clip!==undefined){self._api().fp_play(clip);}else{self._api().fp_play();}}if(api){play();}else{self.load(function(){play();});}return self;},getVersion:function(){var js="flowplayer.js 3.0.3";if(api){var ver=api.fp_getVersion();ver.push(js);return ver;}return js;},_api:function(){if(!api){throw"Flowplayer "+self.id()+" not loaded. Try moving your call to player's onLoad event";}return api;},_dump:function(){console.log(listeners);},setClip:function(clip){self.setPlaylist([clip]);},getIndex:function(){return playerIndex;}});each(("Click*,Load*,Unload*,Keypress*,Volume*,Mute*,Unmute*,PlaylistReplace,Fullscreen*,FullscreenExit,Error").split(","),function(){var name="on"+this;if(name.indexOf("*")!=-1){name=name.substring(0,name.length-1);var name2="onBefore"+name.substring(2);self[name2]=function(fn){bind(listeners,name2,fn);return self;};}self[name]=function(fn){bind(listeners,name,fn);return self;};});each(("pause,resume,mute,unmute,stop,toggle,seek,getStatus,getVolume,setVolume,getTime,isPaused,isPlaying,startBuffering,stopBuffering,isFullscreen,reset,close,setPlaylist").split(","),function(){var name=this;self[name]=function(arg){if(!api){return self;}var ret=(arg===undefined)?api["fp_"+name]():api["fp_"+name](arg);return ret=='undefined'?self:ret;};});self._fireEvent=function(evt,arg0,arg1,arg2){if(conf.debug){log(arguments);}if(!api&&evt=='onLoad'&&arg0=='player'){api=api||el(apiId);swfHeight=api.clientHeight;each(playlist,function(){this._fireEvent("onLoad");});each(plugins,function(name,p){p._fireEvent("onUpdate");});commonClip._fireEvent("onLoad");}if(evt=='onLoad'&&arg0!='player'){return;}if(evt=='onError'){if(typeof arg0=='string'||(typeof arg0=='number'&&typeof arg1=='number')){arg0=arg1;arg1=arg2;}}if(evt=='onContextMenu'){each(conf.contextMenu[arg0],function(key,fn){fn.call(self);});return;}if(evt=='onPluginEvent'){var name=arg0.name||arg0;var p=plugins[name];if(p){p._fireEvent("onUpdate",arg0);p._fireEvent(arg1);}return;}if(evt=='onPlaylistReplace'){playlist=[];var index=0;each(arg0,function(){playlist.push(new Clip(this,index++,self));});}var ret=true;if(arg0===0||(arg0&&arg0>=0&&arg0<playlist.length)){activeIndex=arg0;var clip=playlist[arg0];if(clip){ret=clip._fireEvent(evt,arg1,arg2);}if(!clip||ret!==false){ret=commonClip._fireEvent(evt,arg1,arg2,clip);}}var i=0;each(listeners[evt],function(){ret=this.call(self,arg0,arg1);if(this.cached){listeners[evt].splice(i,1);}if(ret===false){return false;}i++;});return ret;};function init(){if($f(wrapper)){$f(wrapper).getParent().innerHTML="";playerIndex=$f(wrapper).getIndex();players[playerIndex]=self;}else{players.push(self);playerIndex=players.length-1;}wrapperHeight=parseInt(wrapper.style.height,10)||wrapper.clientHeight;if(typeof params=='string'){params={src:params};}playerId=wrapper.id||"fp"+makeId();apiId=params.id||playerId+"_api";params.id=apiId;conf.playerId=playerId;if(typeof conf=='string'){conf={clip:{url:conf}};}conf.clip=conf.clip||{};if(wrapper.getAttribute("href",2)&&!conf.clip.url){conf.clip.url=wrapper.getAttribute("href",2);}commonClip=new Clip(conf.clip,-1,self);conf.playlist=conf.playlist||[conf.clip];var index=0;each(conf.playlist,function(){var clip=this;if(typeof clip=='object'&&clip.length){clip=""+clip;}if(!clip.url&&typeof clip=='string'){clip={url:clip};}each(conf.clip,function(key,val){if(clip[key]===undefined&&typeof val!='function'){clip[key]=val;}});conf.playlist[index]=clip;clip=new Clip(clip,index,self);playlist.push(clip);index++;});each(conf,function(key,val){if(typeof val=='function'){bind(listeners,key,val);delete conf[key];}});each(conf.plugins,function(name,val){if(val){plugins[name]=new Plugin(name,val,self);}});if(!conf.plugins||conf.plugins.controls===undefined){plugins.controls=new Plugin("controls",null,self);}params.bgcolor=params.bgcolor||"#000000";params.version=params.version||[9,0];params.expressInstall='http://www.flowplayer.org/swf/expressinstall.swf';function doClick(e){if(!self.isLoaded()&&self._fireEvent("onBeforeClick")!==false){self.load();}return stopEvent(e);}html=wrapper.innerHTML;if(html.replace(/\s/g,'')!==''){if(wrapper.addEventListener){wrapper.addEventListener("click",doClick,false);}else if(wrapper.attachEvent){wrapper.attachEvent("onclick",doClick);}}else{if(wrapper.addEventListener){wrapper.addEventListener("click",stopEvent,false);}self.load();}}if(typeof wrapper=='string'){flashembed.domReady(function(){var node=el(wrapper);if(!node){throw"Flowplayer cannot access element: "+wrapper;}else{wrapper=node;init();}});}else{init();}}var players=[];function Iterator(arr){this.length=arr.length;this.each=function(fn){each(arr,fn);};this.size=function(){return arr.length;};}window.flowplayer=window.$f=function(){var instance=null;var arg=arguments[0];if(!arguments.length){each(players,function(){if(this.isLoaded()){instance=this;return false;}});return instance||players[0];}if(arguments.length==1){if(typeof arg=='number'){return players[arg];}else{if(arg=='*'){return new Iterator(players);}each(players,function(){if(this.id()==arg.id||this.id()==arg||this.getParent()==arg){instance=this;return false;}});return instance;}}if(arguments.length>1){var swf=arguments[1];var conf=(arguments.length==3)?arguments[2]:{};if(typeof arg=='string'){if(arg.indexOf(".")!=-1){var instances=[];each(select(arg),function(){instances.push(new Player(this,clone(swf),clone(conf)));});return new Iterator(instances);}else{var node=el(arg);return new Player(node!==null?node:arg,swf,conf);}}else if(arg){return new Player(arg,swf,conf);}}return null;};extend(window.$f,{fireEvent:function(id,evt,a0,a1,a2){var p=$f(id);return p?p._fireEvent(evt,a0,a1,a2):null;},addPlugin:function(name,fn){Player.prototype[name]=fn;return $f;},each:each,extend:extend});if(document.all){window.onbeforeunload=function(){$f("*").each(function(){if(this.isLoaded()){this.close();}});};}if(typeof jQuery=='function'){jQuery.prototype.flowplayer=function(params,conf){if(!arguments.length||typeof arguments[0]=='number'){var arr=[];this.each(function(){var p=$f(this);if(p){arr.push(p);}});return arguments.length?arr[arguments[0]]:new Iterator(arr);}return this.each(function(){$f(this,clone(params),conf?clone(conf):{});});};}})();(function(){var jQ=typeof jQuery=='function';function isDomReady(){if(domReady.done){return false;}var d=document;if(d&&d.getElementsByTagName&&d.getElementById&&d.body){clearInterval(domReady.timer);domReady.timer=null;for(var i=0;i<domReady.ready.length;i++){domReady.ready[i].call();}domReady.ready=null;domReady.done=true;}}var domReady=jQ?jQuery:function(f){if(domReady.done){return f();}if(domReady.timer){domReady.ready.push(f);}else{domReady.ready=[f];domReady.timer=setInterval(isDomReady,13);}};function extend(to,from){if(from){for(key in from){if(from.hasOwnProperty(key)){to[key]=from[key];}}}return to;}function concatVars(vars){var out="";for(var key in vars){if(vars[key]){out+=[key]+'='+asString(vars[key])+'&';}}return out.substring(0,out.length-1);}function asString(obj){switch(typeOf(obj)){case'string':obj=obj.replace(new RegExp('(["\\\\])','g'),'\\$1');obj=obj.replace(/^\s?(\d+)%/,"$1pct");return'"'+obj+'"';case'array':return'['+map(obj,function(el){return asString(el);}).join(',')+']';case'function':return'"function()"';case'object':var str=[];for(var prop in obj){if(obj.hasOwnProperty(prop)){str.push('"'+prop+'":'+asString(obj[prop]));}}return'{'+str.join(',')+'}';}return String(obj).replace(/\s/g," ").replace(/\'/g,"\"");}function typeOf(obj){if(obj===null||obj===undefined){return false;}var type=typeof obj;return(type=='object'&&obj.push)?'array':type;}if(window.attachEvent){window.attachEvent("onbeforeunload",function(){__flash_unloadHandler=function(){};__flash_savedUnloadHandler=function(){};});}function map(arr,func){var newArr=[];for(var i in arr){if(arr.hasOwnProperty(i)){newArr[i]=func(arr[i]);}}return newArr;}function getEmbedCode(p,c){var html='<embed type="application/x-shockwave-flash" ';if(p.id){extend(p,{name:p.id});}for(var key in p){if(p[key]!==null){html+=key+'="'+p[key]+'"\n\t';}}if(c){html+='flashvars=\''+concatVars(c)+'\'';}html+='/>';return html;}function getObjectCode(p,c,embeddable){var html='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ';html+='width="'+p.width+'" height="'+p.height+'"';if(!p.id&&document.all){p.id="_"+(""+Math.random()).substring(5);}if(p.id){html+=' id="'+p.id+'"';}html+='>';if(document.all){p.src+=((p.src.indexOf("?")!=-1?"&":"?")+Math.random());}html+='\n\t<param name="movie" value="'+p.src+'" />';var e=extend({},p);e.id=e.width=e.height=e.src=null;for(var k in e){if(e[k]!==null){html+='\n\t<param name="'+k+'" value="'+e[k]+'" />';}}if(c){html+='\n\t<param name="flashvars" value=\''+concatVars(c)+'\' />';}if(embeddable){html+=getEmbedCode(p,c);}html+="</object>";return html;}function getFullHTML(p,c){return getObjectCode(p,c,true);}function getHTML(p,c){var isNav=navigator.plugins&&navigator.mimeTypes&&navigator.mimeTypes.length;return(isNav)?getEmbedCode(p,c):getObjectCode(p,c);}window.flashembed=function(root,userParams,flashvars){var params={src:'#',width:'100%',height:'100%',version:null,onFail:null,expressInstall:null,debug:false,allowfullscreen:true,allowscriptaccess:'always',quality:'high',type:'application/x-shockwave-flash',pluginspage:'http://www.adobe.com/go/getflashplayer'};if(typeof userParams=='string'){userParams={src:userParams};}extend(params,userParams);var version=flashembed.getVersion();var required=params.version;var express=params.expressInstall;var debug=params.debug;if(typeof root=='string'){var el=document.getElementById(root);if(el){root=el;}else{domReady(function(){flashembed(root,userParams,flashvars);});return;}}if(!root){return;}if(!required||flashembed.isSupported(required)){params.onFail=params.version=params.expressInstall=params.debug=null;root.innerHTML=getHTML(params,flashvars);return root.firstChild;}else if(params.onFail){var ret=params.onFail.call(params,flashembed.getVersion(),flashvars);if(ret===true){root.innerHTML=ret;}}else if(required&&express&&flashembed.isSupported([6,65])){extend(params,{src:express});flashvars={MMredirectURL:location.href,MMplayerType:'PlugIn',MMdoctitle:document.title};root.innerHTML=getHTML(params,flashvars);}else{if(root.innerHTML.replace(/\s/g,'')!==''){}else{root.innerHTML="<h2>Flash version "+required+" or greater is required</h2>"+"<h3>"+(version[0]>0?"Your version is "+version:"You have no flash plugin installed")+"</h3>"+"<p>Download latest version from <a href='"+params.pluginspage+"'>here</a></p>";}}return root;};extend(window.flashembed,{getVersion:function(){var version=[0,0];if(navigator.plugins&&typeof navigator.plugins["Shockwave Flash"]=="object"){var _d=navigator.plugins["Shockwave Flash"].description;if(typeof _d!="undefined"){_d=_d.replace(/^.*\s+(\S+\s+\S+$)/,"$1");var _m=parseInt(_d.replace(/^(.*)\..*$/,"$1"),10);var _r=/r/.test(_d)?parseInt(_d.replace(/^.*r(.*)$/,"$1"),10):0;version=[_m,_r];}}else if(window.ActiveXObject){try{var _a=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");}catch(e){try{_a=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");version=[6,0];_a.AllowScriptAccess="always";}catch(ee){if(version[0]==6){return;}}try{_a=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");}catch(eee){}}if(typeof _a=="object"){_d=_a.GetVariable("$version");if(typeof _d!="undefined"){_d=_d.replace(/^\S+\s+(.*)$/,"$1").split(",");version=[parseInt(_d[0],10),parseInt(_d[2],10)];}}}return version;},isSupported:function(version){var now=flashembed.getVersion();var ret=(now[0]>version[0])||(now[0]==version[0]&&now[1]>=version[1]);return ret;},domReady:domReady,asString:asString,getHTML:getHTML,getFullHTML:getFullHTML});if(jQ){jQuery.prototype.flashembed=function(params,flashvars){return this.each(function(){flashembed(this,params,flashvars);});};}})();
    /**
 * @author alexander.farkas
 */
/**
* JS-Singelton-Klasse um Objekte (zum Beispiel Bilder) zu skalieren
* @id objScaleModule
* @alias $.objScale
* @alias jQuery.objScale
*/

/**
 * Berechnet die Höhe und Breite von DOM-Objekten
 * 
 * @id getDim
 * @method
 * @alias $.objScale.getDim
 * @param {Object} obj obj erwartet ein DOM-Objekt, ein jQuery-Objekt oder ein Objekt mit den Eigenschaften width und height.
 * @return {Object} gibt ein Objekt mit höhe und Breite zurück. Beispiel. {height: 200, width: 300}
 */
/**
 * Berechnet eine verhältnismäßige Skalierung eines Objekts.<br>
 * siehe auch: $.objScale.scaleHeightTo und $.objScale.scaleWidthTo
 * 
 * @id scaleTo
 * @method
 * @alias $.objScale.scaleTo
 * @see #scaleHeightTo
 * @param {Object} obj obj erwartet ein DOM-Objekt, ein jQuery-Objekt oder ein Objekt welches skaliert werden soll.
 * @param {Number} num num erwartet die neue Grösse, welche das Objekt haben soll (Breite oder Höhe)
 * @param {String} side gibt an welche Seite (Höhe oder Breite) man im 2. Parameter angegeben hat
 * @return {Number} gibt die neue Länge zurück (Wenn man unter num/side 'width' angegeben hat, wird die Höhe zurückgeliefert).
 */
/**
 * Skaliert die Höhe eines Objekts und gibt die verhältnismäßige Breite zurück.<br> 
 * (Shorthand für $.objScale.scaleTo(obj, num, 'height');)
 * 
 * @id scaleHeightTo
 * @method
 * @alias $.objScale.scaleHeightTo
 * @param {Object} obj obj erwartet ein DOM-Objekt, ein jQuery-Objekt oder ein Objekt welches skaliert werden soll.
 * @param {Number} num num erwartet die neue Höhe, welche das Objekt haben soll
 * @return {Number} gibt die neue Breite zurück
 */
/**
 * Skaliert die Breite eines Objekts und gibt die verhältnismäßige Höhe zurück.<br> 
 * (Shorthand für $.objScale.scaleTo(obj, num, 'width');)
 * 
 * @id scaleWidthTo
 * @method
 * @alias $.objScale.scaleWidthTo
 * @param {Object} obj obj erwartet ein DOM-Objekt, ein jQuery-Objekt oder ein Objekt welches skaliert werden soll.
 * @param {Number} num num erwartet die neue Breite, welche das Objekt haben soll
 * @return {Number} gibt die neue Höhe zurück
 */

/**
 * Skaliert die Breite eines Objekts und gibt die verhältnismäßige Höhe zurück.<br> 
 * (Shorthand für $.objScale.scaleTo(obj, num, 'width');)
 * 
 * @id scaleWidthTo
 * @method
 * @alias $.objScale.scaleWidthTo
 * @param {Object} obj obj erwartet ein DOM-Objekt, ein jQuery-Objekt oder ein Objekt welches skaliert werden soll.
 * @param {Number} num num erwartet die neue Breite, welche das Objekt haben soll
 * @return {Number} gibt die neue Höhe zurück
 */
/**
 * Zentriert ein kleineres Objekt in einem Grösseren.<br> 
 * siehe auch: $.objScale.constrainObjTo();
 * 
 * @id centerObjTo
 * @method
 * @alias $.objScale.centerObjTo
 * @param {Object} obj obj erwartet ein DOM-Objekt, ein jQuery-Objekt oder ein anderes Objekt mit Höhen und Breiten-Eigenschaften,  welches zentriert werden soll.
 * @param {Object} container erwartet ein DOM-Objekt, ein jQuery-Objekt oder ein anderes Objekt mit Höhen und Breiten-Eigenschaften,  in welches das andere Objekt zentriert werden soll
 * @param {Object, Options} opts stellt Optionen bereit so kann angegeben werden, ob es einen Mindest nach oben bzw. links geben soll (margin: [10, false]) und, ob vertical und / oder horizontal zentriert werden soll<br><br>
 * Beispiel:<br>
 * $.objScale.centerObjTo(img, container, {margin: [10, 0], horizontal: false};<br>
 * Es soll nur vertical und nicht horizontal zentriert werden, ausserdem soll der Mindestabstand nach oben 10 Einheiten betragen<br><br>
 * $.objScale.centerObjTo(img, container, {margin: [false, 0]};<br>
 * Es soll vertical und horizontal zentriert werden, ausserdem soll der Mindestabstand nach links 0 Einheiten betragen und nach oben existiert keine Mindestbeschränkung (Es können negative Werte auftreten).<br><br>
 * defaults: {margin: [0, 0], vertical: true, horizontal: true}
 * @return {Object} gibt ein Objekt mit top und left Eigenschaften zurück
 */
/**
 * Zentriert ein Objekt in einem anderen Objekt. Ist das zu skalierende Objekt grösser, wird es zusätzlich verkleinert.<br> 
 * siehe auch: $.objScale.centerObjTo(); und $.objScale.scaleObjTo();
 * @id constrainObjTo
 * @method
 * @alias $.objScale.constrainObjTo
 * @param {Object} obj obj erwartet ein DOM-Objekt, ein jQuery-Objekt oder ein anderes Objekt mit Höhen und Breiten-Eigenschaften,  welches angepasst und zentriert werden soll.
 * @param {Object} container erwartet ein DOM-Objekt, ein jQuery-Objekt oder ein anderes Objekt mit Höhen und Breiten-Eigenschaften,  in welches das andere Objekt zentriert werden soll
 * @param {Object, Options} opts stellt Optionen bereit so kann angegeben werden, ob es einen Mindestabstand nach oben bzw. links geben soll (margin: [10, false], padding: [10, 0]) und ob vertical und / oder horizontal zentriert werden soll<br><br>
 * Unterschied zwischen padding und margin: Die margin- und padding-Angaben werden für die evtl. Verkleinerung des Objekts berücksichtigt. Bei einer möglichen Zentrierung wird dagegen ausschließlich der margin-Wert berücksichtigt. Das padding-Array darf daher nur Zahlen enthalten, das margin-Array darf daneben noch den booleschen Wert false enthalten.
 * Beispiel:<br>
 * $.objScale.constrainObjTo(img, container, {margin: [10, 0], horizontal: false};<br>
 * Es soll nur vertical und nicht horizontal zentriert werden, ausserdem soll der Mindestabstand nach oben 10 Einheiten betragen<br><br>
 * defaults: {margin: [0, 0], padding: [0, 0], vertical: true, horizontal: true}
 * @return {Object} gibt ein Objekt mit width, height, top und left Eigenschaften zurück
 */
/**
 * Skaliert ein Objekt, so dass es perfekt in ein anderes Objekt passt und zentriert es. (Ist es kleiner, wird es vergrössert bzw. ist grösser, wird es verkleinert).<br> 
 * siehe auch: $.objScale.centerObjTo(); und $.objScale.constrainObjTo();
 * @id scaleObjTo
 * @method
 * @alias $.objScale.scaleObjTo
 * @param {Object} obj obj erwartet ein DOM-Objekt, ein jQuery-Objekt oder ein anderes Objekt mit Höhen und Breiten-Eigenschaften,  welches skaliert und zentriert werden soll.
 * @param {Object} container erwartet ein DOM-Objekt, ein jQuery-Objekt oder ein anderes Objekt mit Höhen und Breiten-Eigenschaften,  in welches das andere Objekt zentriert/skaliert werden soll
 * @param {Object, Options} opts stellt Optionen bereit so kann angegeben werden, ob es einen Mindestabstand nach oben bzw. links geben soll (margin: [10, false], padding: [10, 0]), ob vertical und / oder horizontal zentriert werden soll. Die scaleToFit-Eigenschaft gibt an, ob bei unterschiedlichen Seitenverhältnissen das innere Objekt vollständig zu sehen sein soll oder ob es das äußere Objekt vollständig ausfüllen soll<br><br>
 * Unterschied zwischen padding und margin: Die margin- und padding-Angaben werden für die evtl. Skalierung des Objekts berücksichtigt. Bei einer möglichen Zentrierung wird dagegen ausschließlich der margin-Wert berücksichtigt. Das padding-Array darf daher nur Zahlen enthalten, das margin-Array darf daneben noch den booleschen Wert false enthalten.
 * Beispiel:<br>
 * $.objScale.scaleObjTo(img, container, {margin: [10, 0], horizontal: false};<br>
 * Es soll nur vertical und nicht horizontal zentriert werden, ausserdem soll der Mindestabstand nach oben 10 Einheiten betragen<br><br>
 * defaults: {margin: [false, false], padding: [0, 0], scaleToFit: false, vertical: true, horizontal: true}
 * @return {Object} gibt ein Objekt mit width, height, top und left Eigenschaften zurück
 */
(function($){
	/**
	 * @id objScaleModule
	 */
	$.objScale = (function(){
	
	/**
	 * @id getDim
	 */
		function getDim(obj){
			
			//console.log(obj.height())
			var height,
				width,
				ret = (obj.jquery) ?
						{
							height: ($.nodeName(obj[0], 'object')) ? parseInt(obj[0].height, 10) : obj.height(),
							width: ($.nodeName(obj[0], 'object')) ? parseInt(obj[0].width, 10) : obj.width()
						} : 
						(isFinite(obj.width) && isFinite(obj.height)) ?
						{width: obj.width, height: obj.height} :
						getDim($(obj));
			return ret; 
		}
		
		/**
		 * @id scaleTo
		 */
		function scaleTo(obj, num, side){
			var cur = getDim(obj),
				percentage,
				reverseSide = (side == 'height') ?
					'width' :
					'height';
			
			percentage = cur[side] / num;
			return cur[reverseSide] / percentage;
		}
		
		/**
		 * @id scaleHeightTo
		 */
		function scaleHeightTo(obj, height){
			return scaleTo(obj, height, 'height');
		}
		
		/**
		 * @id scaleWidthTo
		 */
		function scaleWidthTo(obj, width){
			return scaleTo(obj, width, 'width');
		}
		
		/**
		 * @id constrainObjTo
		 */
		function constrainObjTo(obj, container, opts){
			opts = $.extend({
				margin: [0, 0],
				padding: [0, 0],
				cleanCSS: true
			}, opts);
			var cur = getDim(obj),
				con = getDim(container),
				maxWidth = con.width - opts.padding[1],
				maxHeight = con.height - opts.padding[0],
				estimatetPer = con.height / con.width,
				curPer = cur.height / cur.width,
				ret = $.extend({},cur);
			
			if(opts.margin[1]){
				maxWidth -=  opts.margin[1] * 2;
			}
			if(opts.margin[0]){
				maxHeight -=  opts.margin[0] * 2;
			}
			if(estimatetPer < curPer && maxHeight < cur.height){
				ret.width = scaleTo(obj, maxHeight, 'height'); 
				ret.height = maxHeight;
			} else if(maxWidth < cur.width){
				ret.width = maxWidth; 
				ret.height = scaleTo(obj, maxWidth, 'width');
			}
			if(!opts.cleanCSS){
				ret.widthSubtraction = ret.width - cur.width;
				ret.heightSubtraction = ret.height - cur.height;
			}
			$.extend(ret, centerObjTo(ret, con, opts));
			return ret;
		}
		
		/**
		 * @id centerObjTo
		 */
		function centerObjTo(obj, container, opts){
			opts = $.extend({
				margin: [0, 0],
				vertical: true,
				horizontal: true
			}, opts);
			var cur = getDim(obj),
				con = getDim(container),
				ret = {};
				
			if(opts.vertical){
				ret.top = (con.height - cur.height) / 2;
				if (isFinite(opts.margin[0])) {
					ret.top = Math.max(ret.top, opts.margin[0]);
				}
			}
			
			if(opts.horizontal){
				ret.left =  (con.width - cur.width) / 2;
				if(isFinite(opts.margin[1])){
					ret.left = Math.max(ret.left, opts.margin[1]);
				}
			}
			return ret;
		}
		
		/**
		 * @id scaleObjTo
		 */
		function scaleObjTo(obj, container, opts){
			opts = $.extend({
				margin: [false, false],
				padding: [0, 0],
				scaleToFit: false
			}, opts);
			
			var cur = getDim(obj),
				con = getDim(container),
				curPer = cur.height / cur.width,
				ret = {};
			
			con.maxHeight = con.height - opts.padding[0];
			con.maxWidth = con.width - opts.padding[1];
			
			if(opts.margin[0]){
				con.maxHeight -= opts.margin[0];
			}
			if(opts.margin[1]){
				con.maxWidth -= opts.margin[1];
			}
			
			var	estimatetPer = con.maxHeight / con.maxWidth;
				
			if(opts.scaleToFit !== estimatetPer > curPer){
				ret.width = con.maxWidth; 
				ret.height = scaleTo(obj, con.maxWidth, 'width');
			} else {
				ret.width = scaleTo(obj, con.maxHeight, 'height'); 
				ret.height = con.maxHeight;
			}
			
			$.extend(ret, centerObjTo(ret, con, opts));
			return ret;
		}
		
		return {
			scaleWidthTo: scaleWidthTo,
			scaleHeightTo: scaleHeightTo,
			scaleSidesIn: scaleObjTo, /* dep */
			scaleObjTo: scaleObjTo,
			constrainObjTo: constrainObjTo,
			getDim: getDim,
			centerObjTo: centerObjTo
		};
	})();
})(jQuery);

    /**
 * @author alexander.farkas
 * 
 * Usage Example:
 * 
 * 

$('#photo-index a').each(function(){
	$.imgPreLoad.add($(this).attr('href'));
});

 */
(function($){
	$.imgPreLoad = (function(){
		var srcList 	= [], 
			ready 		= false, 
			started 	= false,
			loaded 		= false,
			errorDelay 	= 5000,
			errorTimer
		;
		
		function createImg(){
			return (window.Image) ? new Image() : document.createElement('img');
		}
			
		function loadImg(src, callback){
			var img = createImg(),
				fn = function(e){
					var that = this, args = arguments;
					clearTimeout(errorTimer);
					$(this).unbind('load error');
					src[1].apply(that, args);
					callback.apply(that, args);
				};
			
			img.src = src[0];
			if(!img.complete){
				clearTimeout(errorTimer);
				errorTimer = setTimeout(function(){
					fn.call(img, {type: 'timeouterror'});
				}, errorDelay);
				$(img)
					.bind('load error', fn);
			} else {
				fn.call(img, {type: 'cacheLoad'});
			}
		}
		
		function loadNextImg(){
			if(srcList.length && ready){
				started = true;
				var src = srcList.shift();
				loadImg(src, loadNextImg);
			} else {
				started = false;
			}
		}
		
		function pause(){
			started = false;
			ready = false;
		}
		
		function restart(){
			if(loaded) {
				ready = true;
				loadNextImg();
			}
		}
		
		function loadNow(src, callback){
			pause();
			callback = callback || function(){};
			loadImg([src, callback], restart);
		}
		
		return {
			add: function(src, 	fn, priority){
				fn = fn || function(){};
				src = [src, fn];
				if(priority){
					srcList.unshift(src);
				} else {
					srcList.push(src);
				}
				if(ready && !started){
					loadNextImg();
				}
			},
			loadNow: loadNow,
			ready: function(){
				loaded = true;
				ready = true;
				loadNextImg();
			}
		};
	})();
	if($.windowLoaded){
		$.imgPreLoad.ready();
	} else {
		$(window).bind('load', $.imgPreLoad.ready);
	}
})(jQuery);


    /**
 * @author trixta
 */
(function($){
	
	/* Mask */
	
	$.fn.fadeInTo = function(){
		var args = arguments;
		return this.each(function(){
			var jElm = $(this);
			
			if(jElm.css('display') === 'none'){
				jElm.css({opacity: '0', display: 'block'});
			}
			$.fn.fadeTo.apply(jElm, args);
		});
	};
	
	var maskID = new Date().getTime();
	
	$.widget('ui.overlayProto', {
		hideElementsOnShow: function(){
			var o 		= this.options,
				that 	= this
			;
			
			this.hiddenElements = $([]);
			
			if(o.hideWindowedFlash){
				this.hiddenElements = $('object, embed').filter(function(){
						return !(
								((this.getAttribute('classid') || '').toLowerCase() === 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' || this.getAttribute('type') === 'application/x-shockwave-flash') && //isFlash
										(this.getAttribute('transparent') !== 'transparent' &&
										(/<param\s+(?:[^>]*(?:name=["'?]\bwmode["'?][\s\/>]|\bvalue=["'?](?:opaque|transparent)["'?][\s\/>])[^>]*){2}/i.test(this.innerHTML)))
							);
					});
			}
			
			if(o.hideWhileShown){
				this.hiddenElements = this.hiddenElements.add(o.hideWhileShown);
			}
			
			this.hiddenElements = this.hiddenElements
				.filter(function(){
					
					return ($.curCSS(this, 'visibility') !== 'hidden' && !$.contains( that.element[0], this ));
				})
				.filter(o.hideFilter)
				.css({visibility: 'hidden'});
		}
	});
	
    $.widget('ui.mask', $.ui.overlayProto, {
		options: {
			extraClass: false,
			closeOnClick: true,
			closeOnEsc: true,
			hideFilter: function(){return true;},
			handleDisplay: true,
			fadeInTime: 0,
			fadeOutTime: 0,
			opacity: 0.8,
			bgIframe: false,
			cssWidth: true
		},
		_create: function(){
			var o  		= this.options,
				that 	= this,
				css
			;
			maskID++;
			this.id = maskID;
			this.maskedElement = this.element.parent();
			
			if(this.maskedElement.is('body')){
				this.dimensionElement = $(document);
				this.calcMethod = {
					height: 'height',
					width: 'width'
				};
			} else {
				this.dimensionElement = this.maskedElement.css({position: 'relative'});
				this.calcMethod = {
					height: 'innerHeight',
					width: 'innerWidth'
				};
			}
			if(this.maskedElement.is('body') || (parseInt($.browser.version, 10) < 7 && $.browser.msie)){
				css = {
					display: 'none',
					position: 'absolute',
					top: '0',
					left: '0'
				};
				this.calcSize = true;
			} else {
				css = {
					display: 'none',
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0
				};
				
				this.calcSize = false;
			}
			this.element.css(css);
			this.isVisible = false;
			if(o.closeOnClick){
				this.element.click(function(e){
					that.hide.call(that, e, this);
				});
			}
			if(o.extraClass){
				this.element.addClass(o.extraClass);
			}
		},
		ui: function(){
			return {
				instance: this
			};
		},
		hide: function(e, elem){
			
			if(!this.isVisible){return;}
			var result 	= this._trigger('close', e, this.ui()),
				o 		= this.options,
				that 	= this
			;
			if(result === false){return;}
			this.isVisible = false;
			
			if(o.handleDisplay){
				if(o.fadeOutTime){
					this.element.fadeOut(o.fadeOutTime, function(){
						that.unexpose.call(that);
					});
				} else {
					this.element.hide();
					this.unexpose();
				}
			}
			this.element.queue(function(){
				if(that.hiddenElements && that.hiddenElements.css){
					that.hiddenElements.css({visibility: 'visible'});
				}
				that.maskedElement.removeClass('mask-visible');
				that.element.dequeue();
			});
			$(document).unbind('.mask'+ this.id);
			$(window).unbind('.mask'+ this.id);
		},
		resize: function(set){
			var ret = {
				'height': this.dimensionElement[this.calcMethod.height]()
			};
			if(!this.options.cssWidth){
				ret.width = this.dimensionElement[this.calcMethod.width]();
			}
			if(set){
				this.element.css(ret);
			}
			return ret;
		},
		show: function(e, o){
			
			if(this.isVisible){return;}
			o = (o) ? $.extend(true, {}, this.options, o) : this.options;
			var that 	= this,
				resize 	= function(e){
						that.resize.call(that, true);
					}
			;
			if(o.expose){
				this.expose(o.expose);
			}
			
			this._trigger('show', e, $.extend(true, {} , this.ui(), o));
			this.isVisible = true;
			this.maskedElement.addClass('mask-visible');
			this.hideElementsOnShow();
			if(o.handleDisplay){
				if(this.calcSize){
					this.resize(true);
				}
				if(o.fadeInTime){
					this.element.fadeInTo(o.fadeInTime, o.opacity);
				} else {
					this.element.css({opacity: o.opacity, display: 'block'});
				}
			}
			
			if(o.closeOnEsc){
				$(document).bind('keydown.mask'+ this.id, function(e){
					if(e.keyCode === $.ui.keyCode.ESCAPE){
						that.hide.call(that, e, this);
					}
				});
			}
			if (that.calcSize) {
				$(document).bind('resize.mask'+ this.id +' emchange.mask'+ this.id, resize);
				$(window).bind('resize.mask'+ this.id, resize);
			}
		},
		unexpose: function(elem){
			if(!elem && !this.exposed){return;}
			var exposed = elem || this.exposed;
			exposed.each(function(){
				$(this).css({
					position: '',
					zIndex: ''
				});
			});
			if(!elem){
				this.exposed = false;
			}
		},
		expose: function(jElm){
			var zIndex =  parseInt(this.maskedElement.css('z-index'), 10) || 9;
			jElm = this.maskedElement.find(jElm);
			jElm.each(function(){
				var jExpose = $(this);
				if(jExpose.css('position') === 'static'){
					jExpose.css({position: 'relative'});
				}
				zIndex++;
				jExpose.css({
					zIndex: zIndex
				});
			});
			this.exposed = jElm;
		}
	});
		
	/* END: Mask */
	
	/* Content-Overlay */
	
	var currentFocus,
		id 		= new Date().getTime()
	;
		
	$(document).bind('focusin', function(e){
		if(e.target.nodeType == 1){
			currentFocus = e.target;
		}
	});
	
	if(!$.fn.mask){
		$.fn.mask = function(){return this;};
	}
	
	$.widget('ui.cOverlay', $.ui.overlayProto, {
		options: {
			//
			mask: false, //Soll die Seite zusätzlich maskiert werden
			maskOpts: {}, //Optionen für die Maskierung, siehe mask-Plugin im Overlay-Ordner
			hideStyle: 'visibility',
			bgIframe: false, //IE6 bugfix für select-zIndex-Bug
			hideWindowedFlash: 'auto', // Sollen Flashelemente versteckt werden, die kein wmode haben
			hideWhileShown: false, // Selektor von Elementen, DOM-Objekte die während der Anzeige versteckt werden sollen
			hideFilter: function(){return true;}, // funktion zum herausfiltern von Objekten die versteckt werden sollen
			
			extraClass: false, // Zusatzklasse für Overlay-Element
			attrs: {}, //zusätzliche Attribute, für das Overlay-Element
			bodyShowClass: 'overlay-visible', //body-Klasse die gesetzt ist solange das Overlay angezeigt wird (gut für Print-Stylesheets)
			
			positionType: '', // Name der Funktion im Namespace  $.ui.cOverlay.posMethods bzw die Funktion selbst, welche die Position berechnet 
			positionOpts: {}, //optionen der positions-Funktion
			//mögliche weitere Positionierungs-Optionen
			followMouse: false,
			
			restoreFocus: 'auto', // Ob der Focus beim Schliessen auf das Element gesetzt werden soll, welches vor dem öffnen fokusiert war, bei auto ist dies true, sofern focusOnShow gesetzt wurde
			focusOnShow: false, // Ob das Overlay fokusiert werden soll, wenn es geöffnet wird. Wird ein Selektor angegeben, dann wird dieses Element fokusiert
			
			closeOnEsc: true,
			closeBtnSel: 'a.close-button',
			
			animShow: function(jElm, ui){ //Show-Animation (ui.posCSS enthält die berechnete Positionierung und muss gesetzt werden) 
				jElm.css(ui.posCSS).css({visibility: 'visible'});
			},
			animHide: function(jElm, ui){//Hide-Animation 
				jElm.css({visibility: 'hidden'});
			},
			
			addRole: false, // nonfocussyle: tooltip || alert || focusstyle: alertdialog || dialog 
			createA11yWrapper: 'auto',
			labelledbySel: false,
			describedbySel: false,
			
			//Opener
			openerSel: false, // Elemente (Selektor:String, jQuery:Object, DOM:Object), welche das Overlay öffnen
			openerContext: document, // Kontext (DOM:Object, jQuery:Object) in dem nach openerSel gesucht wird
			bindStyle: 'bind', // Art des Event-Bindings (bind|live)
			
			//opencloseEvents werden durch a11ymode erweitert
			openEvent: 'ariaclick', // mouseenter || click
			closeEvent: false,
			openDelay: 0, //Zeit die vergehen soll bis das overlay geöffnet wird
			
			setInitialContent: false
		},
		_create: function(){
			var o 		= this.options,
				that 	= this,
				hideCss = (o.hideStyle === 'display') ? {display: 'none'} : {visibility: 'hidden'},
				close 	= function(e){
					var elem = this;
					
					that.timer.clear('openTimer');
					
					that.timer.setDelay('closeTimer', function(){
						that.hide(e, {closer: elem});
					}, 1);
					return false;
				},
				show 	= function(e){
					var elem = this;
					if(that.closeTimer !== undefined && (!that.currentOpener || that.currentOpener[0] === elem || elem === that.element[0])){
						that.timer.clear('closeTimer');
					}
					that.timer.setDelay('openTimer', function(){
						that.show(e, {opener: elem});
					}, o.openDelay);
					return false;
				},
				isDialog, isSpecial
			;
			this.timer = $.createTimer(this);
			this.mask = $([]);
			
			if(o.mask && o.hideWindowedFlash === 'auto'){
				o.maskOpts = o.maskOpts || {};
				o.hideWindowedFlash = true;
			} else {
				o.hideWindowedFlash = false;
			}
			
			if(o.maskOpts){
				o.maskOpts.hideWindowedFlash = false;
			}
			if(o.extraClass){
				this.element.addClass(o.extraClass);
			}
			
			if(o.mask){
				this.mask = $('<div class="mask" />')
					.insertBefore(this.element)
					.mask(
						$.extend(o.maskOpts, 
							{
								close: function(e, ui){
									that.timer.clear('openTimer');
									return that.hide(e, ui);
								}
							}
						)
					);
			}
			this.element
				.css(hideCss)
				.addClass('a11y-js-overflow')
				.attr(o.attrs)
				.attr({'aria-hidden': 'true'})
			;
			
			
			if(o.createA11yWrapper === true || (o.createA11yWrapper && this.element.parent().is('body'))){
				this.element.wrap('<div class="a11y-wrapper" />');
			}
			
			
			if(o.restoreFocus === 'auto'){
				o.restoreFocus = !!(o.focusOnShow);
			}
			
			if(o.setInitialContent){
				this.fillContent(this.element, o.setInitialContent);
			}
			
			this.clonedOverlay = this.element.clone().attr({role: 'presentation'}).addClass('cloned-overlay');
			
			if(o.bgIframe && $.fn.bgIframe && parseInt($.browser.version, 10) < 7){
				this.element.bgIframe();
			}
			
			id++;
			this.id = 'overlay-'+ id;
			this.isVisible = false;
			this.hiddenElements = $([]);
			this.openers = $([]);
			
			this.closeBtn = $(o.closeBtnSel, this.element)
				.bind('ariaclick', function(e){
					that.timer.clear('openTimer');
					that.hide(e, {closer: this});
					return false;
				})
			;
				
			if(o.openerSel){
				this.openers = $(o.openerSel, o.openercontext);
				if(o.openEvent){
					this.openers[o.bindStyle](o.openEvent, show);
				}
				if(o.closeEvent){
					this.openers[o.bindStyle](o.closeEvent, close);
				}
			}
			if($.support.waiAria){
				if(this.closeBtn[0] && $.nodeName(this.closeBtn[0], 'a')){
					this.closeBtn.removeAttr('href').attr({tabindex: '0', role: 'button'});
				}
				
				if(o.labelledbySel){
					this.element.labelWith($(o.labelledbySel, this.element));
				} 
				
				if(o.describedbySel){
					this.element.describeWith($(o.describedbySel, this.element));
				}
				if(o.addRole){
					this.element.attr('role', o.addRole);
				}
			}
			this._trigger('init', {
				type: 'init'
			}, this.ui());
		},
		fillContent: function(element, content, isClone){
			var o = this.options;
			
			element = element || this.element;
			content = content || this.content || {};
			$.each(content, function(name, html){
				if($.isFunction(html)){
					html(name, element, content, isClone);
				} else {
					$('.'+ name, element).html(html);
				}
			});
			if(o.addRole === 'tooltip' || o.addRole === 'alert'){
				$('*', this.element).attr({role: 'presentation'});
			}
		},
		ui: function(){
			var obj = {
						instance: this,
						isVisible: this.isVisible,
						openers: this.openers,
						id: this.id,
						element: this.element
					},
				arg = arguments
			;
			
			for(var i = 0, len = arg.length; i < len; i++){
				if(arg[i]){
					$.extend(obj, arg[i]);
				}
			}
			return obj;
		},
		show: function(e, extras){
			this.timer.clear('closeTimer');
			this.currentOpener = (extras && extras.opener) ? $(extras.opener) : (e && e.currentTarget) ? $(e.currentTarget) : $(currentFocus);
			extras = extras || {};
			extras.opener = this.currentOpener;
			
			if(this.isVisible || this._trigger('beforeShow', e, this.ui({extras: extras})) === false || this.stopShow){return;}
			this.isVisible = true;
			var o 				= this.options,
				that 			= this,
				posCSS,
				ui
			;
			this.hideElementsOnShow();
			if(o.addRole === 'tooltip' && this.currentOpener){
				this.currentOpener.attr({
					'aria-describedby': this.element.getID()
				});
			}
			
			posCSS = this.setPosition(e, extras);
			
			ui = this.ui({extras: extras, posCSS: posCSS});
			this.mask.mask('show');
			
			o.animShow(this.element.stop(true, true), ui);
			
			this.element.attr({'aria-hidden': 'false'});
			
			$.ui.SR.update();
				
			this.restoreFocus = currentFocus;
			if( o.focusOnShow ){
				if( o.focusOnShow === true ){
					this.element.firstExpOf('focusPoint').setFocus({context: (this.element[0].parentNode || {}).parentNode});
				} else {
					$(o.focusOnShow, this.element).setFocus({context: (this.element[0].parentNode || {}).parentNode});
				}
			}
				
			$('body').addClass(o.bodyShowClass);
			
			if(o.closeOnEsc){
				$(document).bind('keydown.'+ this.id, function(e){
					if(e.keyCode === $.ui.keyCode.ESCAPE){
						that.hide.call(that, e, {closer: this});
					}
				});
			}
						
			this.mask.mask('resize', true);
			$.ui.SR.update();
			this._trigger('show', e, ui);
		},
		hide: function(e, extras){
			if(!this.isVisible){return;}
			var o 		= this.options,
				ui 		= this.ui({extras: extras})
			;
			if(this._trigger('beforeHide', e, ui) === false){return false;}
			
			this.isVisible = false;
			
			if(o.addRole === 'tooltip' && this.currentOpener){
				this.currentOpener.removeAttr('aria-describedby');
			}
			
			
			this.mask.mask('hide');
			
			$(document).unbind('.'+ this.id);
			$(window).unbind('.'+ this.id);
			if (o.restoreFocus && this.restoreFocus) {
				$(this.restoreFocus).setFocus({fast: true});
			}
			
			o.animHide(this.element, ui);
			if(this.removeFlashContent){
				this.removeFlashContent();
			}
			this.element.attr({'aria-hidden': 'true'});
			
			this.hiddenElements.css({visibility: 'visible'});
			this._trigger('hide', e, ui);
			$('body').removeClass(o.bodyShowClass);
			this.restoreFocus = false;
		},
		setPosition: function(e, extras, elem){
			elem = elem || this.element;
			var o 	= this.options,
				pos = {};
			e = (e && e.type) ? e : {type: 'unknown'};
			extras = extras || {};
			if(!extras.opener){
				extras.opener = this.currentOpener;
			}
			
			if(typeof o.positionType === 'string' && $.ui.cOverlay.posMethods[o.positionType]){
				
				pos = $.ui.cOverlay.posMethods[o.positionType](elem, e, extras, this);
			} else if($.isFunction(o.positionType)){
				pos = o.positionType(elem, e, extras, this);
			}
			return pos;
		}
	});
	
	$.ui.cOverlay.posMethods = {};
	$.ui.cOverlay.posMethods.position = function(overlay, e, extra, ui){
		var o 	= ui.options,
			target,
			pos
		;
		if(o.followMouse && e.type.indexOf('mouse') != -1){
			target = e;
			$(document).bind('mousemove.'+ ui.id, function(evt){
				var delta = {
						top: e.pageY - evt.pageY,
						left: e.pageX - evt.pageX
					},
					posDelta = {
						top: pos.top - delta.top,
						left: pos.left - delta.left
					}
				;
				overlay.css({
						top: pos.top - delta.top,
						left: pos.left - delta.left
					});
			});
		} else if(o.positionOpts.posTarget || extra.opener){
			target = o.positionOpts.posTarget || ui.currentOpener || extra.opener;
		}
		overlay.position($.extend({}, o.positionOpts, {
			of: target,
			using: function(tmpPos){pos = tmpPos;}
		}));
		return pos;
	};
	$.ui.cOverlay.posMethods.around = function(overlay, e, extra, ui){
		var o 	= ui.options,
			pos
		;
		
		if(!$.posAround){
			setTimeout(function(){
				throw('please install the posAround plugin');
			},0);
			return {};
		}
		
		if(o.followMouse && e.type.indexOf('mouse') != -1){
			pos = $.posAround(overlay, e, o.positionOpts);
			$(document).bind('mousemove.'+ ui.id, function(evt){
				var delta = {
						top: e.pageY - evt.pageY,
						left: e.pageX - evt.pageX
					},
					posDelta = {
						top: pos.top - delta.top,
						left: pos.left - delta.left
					}
				;
				overlay.css({
						top: pos.top - delta.top,
						left: pos.left - delta.left
					});
			});
		} else if(o.positionOpts.posTarget || extra.opener){
			pos = $.posAround(overlay, o.positionOpts.posTarget || extra.opener, o.positionOpts);
		}
		return pos;
	};
	
	$.ui.cOverlay.posMethods.centerInsideView = function(overlay, e, extra, ui){
		var o 	= ui.options,
			doc = $(document),
			pos
		;
		
		if(!$.objScale){
			setTimeout(function(){
				throw('please install the objScale plugin');
			},0);
			return {};
		}
		
		pos = $.objScale.centerObjTo(overlay, $(window), o.positionOpts);
		pos.top += doc.scrollTop();
		pos.left += doc.scrollLeft();
		return pos;
	};
	
})(jQuery);
    /**
 * @author alexander.farkas
 */
(function($){
	// helper für createUrlIndex
	var controlState = {};
	$.each({disable: ['-1', 'true', 'addClass'], enable: ['0', 'false', 'removeClass']}, function(name, sets){
		controlState[name] = function(){
			var jElm = $(this);
			if(!jElm.is('span, div')){
				jElm.attr({tabindex: sets[0], 'aria-disabled': sets[1]});
			}
			jElm[sets[2]]('ui-disabled');
		};
	});
		
	$.createUrlIndex = function(anchors, obj){
		var o = obj.options;
		o.srcAttribute = o.srcAttribute || 'href';
		obj.uniqueUrls = [];
		obj.uniqueOpeners = [];
		anchors.each(function(){
			var url = $(this).attr(o.srcAttribute);
			
			if($.inArray(url, obj.uniqueUrls) === -1){
				obj.uniqueUrls.push(url);
				obj.uniqueOpeners.push(this);
			}
			
		});
		
		obj.nextBtn = $('.next', obj.element);
		obj.prevBtn = $('.prev', obj.element);
		obj.playPauseBtn = $('.play-pause', obj.element);
		if ($.support.waiAria) {
			obj.nextBtn.add(obj.prevBtn).add(obj.playPauseBtn)
				.each(function(){
					if($.nodeName(this, 'a')){
						$(this)
							.removeAttr('href')
							.attr({tabindex: '0'});
					}
				})
			;
		}
		obj.currentIndexDisplay = $('.current-index', obj.element).html('1');
		obj.lengthDisplay = $('.item-length', obj.element).html(obj.uniqueUrls.length);
		
		obj.play = function(delay, playAgain){
			if(obj.isPlaying){return;}
			obj.isPlaying = true;
			obj.playPauseBtn.addClass('ui-isplaying').html(o.pauseText);
			if(o.pauseTitle){
				obj.playPauseBtn.attr({
					title: o.pauseTitle
				});
			}
			slideShowLoad((delay) ? o.slideshowDelay : 0, (playAgain !== undefined) ? playAgain : true);
		};
		
		obj.pause = function(){
			if(!obj.isPlaying){return;}
			obj.isPlaying = false;
			obj.playPauseBtn.addClass('ui-isplaying').html(o.playText);
			if(o.playTitle){
				obj.playPauseBtn.attr({
					title: o.playTitle
				});
			} 
			clearTimeout(obj.slideshowTimer);
		};
		
		obj.playPauseToggle = function(time, playAgain){
			obj[(obj.isPlaying) ? 'pause' : 'play'](time, playAgain);
			return false;
		};
		
		
		
		obj.isPlaying = false;
		
		if(obj.uniqueUrls.length > 1){
			
			obj.nextBtn.bind('ariaclick', function(e){
				obj.loadNext(e);
				return false;
			});
			
			obj.prevBtn.bind('ariaclick', function(e){
				obj.loadPrev(e);
				return false;
			});
			
			obj.playPauseBtn.bind('ariaclick', function(){
				obj.playPauseToggle(undefined, true);
				return false;
			});
			
			if(o.addKeyNav){
				obj.element.bind('keydown', function(e){
					var prevent; 
					
					switch(e.keyCode) {
						case $.ui.keyCode.LEFT:
							prevent = obj.loadPrev(e);
							break;
						case $.ui.keyCode.RIGHT:
							prevent = obj.loadNext(e);
							break;
						case $.ui.keyCode.SPACE:
							obj.playPauseToggle();
							break;
					}
					return prevent;
				});
			}
			
		} else {
			if(o.controlsWrapper){
				$(o.controlsWrapper, obj.element).hide();
			}
			obj.prevBtn.hide();
			obj.nextBtn.hide();
			obj.playPauseBtn.hide();
		}
		
		function slideShowLoad(time, playAgain){
			clearTimeout(obj.slideshowTimer);
			obj.slideshowTimer = setTimeout(function(){
				if(!obj.loadNext({type: 'slideshow'})){
					if(o.carousel || playAgain){
						obj.loadIndex(0, {type: 'slideshow'});
					} else {
						obj.pause();
					}
				}
			}, time || 0);
		}
		
		
		obj.uniqueOpeners = $(obj.uniqueOpeners);
		
		obj.updateIndex = function(url){
			var extendUI = {
				disable: $([]),
				enabled: $([])
			};
			
			obj.currentUrl = url;
			obj.currentIndex = $.inArray(url, obj.uniqueUrls);
			obj.currentAnchor = obj.uniqueOpeners.filter(':eq('+ obj.currentIndex +')');
			
			obj.currentIndexDisplay.html(String( obj.currentIndex + 1 ));
			
			
			
			if(obj.currentIndex === 0){
				if(!o.carousel){
					extendUI.disable = obj.prevBtn.each(controlState.disable);
				}
				obj._trigger('indexStartEndReachedChange', {type: 'indexStartReached'}, obj.ui(extendUI));
			} else if(obj.prevBtn.hasClass('ui-disabled')){
				extendUI.enable = obj.prevBtn.each(controlState.enable);
				obj._trigger('indexStartEndReachedChange', {type: 'indexStartReachedChanged'}, obj.ui(extendUI));
			}
			if(obj.uniqueUrls.length <= obj.currentIndex + 1){
				if(!o.carousel){
					obj.pause();
					extendUI.disable = obj.nextBtn.each(controlState.disable);
				}
				obj._trigger('indexStartEndReachedChange', {type: 'indexEndReached'}, obj.ui(extendUI));
			} else if(obj.nextBtn.hasClass('ui-disabled')){
				extendUI.enable = obj.nextBtn.each(controlState.enable);
				obj._trigger('indexStartEndReachedChange', {type: 'indexEndReachedChanged'}, obj.ui(extendUI));
			}
		};
		
		obj.loadIndex = function(index, e){
			if(typeof index === 'string' && index * 1 !== index){
				index = $.inArray(index, obj.uniqueUrls);
			}
			if(index === obj.currentIndex || index === -1){return false;}
			var nextAnchor 	= obj.uniqueOpeners.filter(':eq('+ index+ ')'),
				oldAnchor 	= obj.currentAnchor,
				url, urlPart, type
			;
			
			if(nextAnchor[0]){
				url = nextAnchor.attr(o.srcAttribute);
				urlPart = url.split('?')[0];
				type = nextAnchor.attr('type') || '';
				type = [type, type.split('/')];
				e = e || {type: 'loadIndex'};
				obj.updateIndex(url);
				obj.element.addClass('loading');
				if(obj.mask){
					obj.mask.addClass('loading-mask');
				}
				o.hideContentAnim(obj, e, {oldAnchor: oldAnchor, index: index, opener: nextAnchor, content: obj.content});
				
				if(o.addLiveRegion){
					$('div.content-box', obj.element).attr({
						'aria-busy': 'true'
					});
				}
				
				$.each($.createUrlIndex.mmContent.types, function(name, mmHanlder){
					if(mmHanlder.filter(url, nextAnchor, urlPart, type)){
						mmHanlder.load(url, nextAnchor, obj, function(url, width){
							
							var uiEvent = {oldAnchor: oldAnchor, index: index, opener: nextAnchor};
							uiEvent.content = obj.content;
							obj.options.getTextContent(nextAnchor, obj.content, obj);
							o.showContentAnim(obj, obj.content['multimedia-box'], e, uiEvent);
							obj._trigger('indexChange', e, uiEvent);
							obj.element.queue(function(){
								obj.element.removeClass('loading');
								if(obj.mask) {
									obj.mask.removeClass('loading-mask');
								}
								obj.element.dequeue();
							});
							if(obj.isPlaying){
								slideShowLoad(o.slideshowDelay);
							}
							if(o.addLiveRegion){
								$('div.content-box', obj.element).attr({'aria-live': 'polite', 'aria-busy': 'false'});
							}
							$.ui.SR.update();
						});
						return false;
					}
					return undefined;
				});
				return true;
			}
			return false;
		};
		
		obj.loadNext = function(e){
			var retVal = obj.loadIndex(obj.currentIndex + 1, e);
			if(retVal === false && o.carousel){
				retVal = obj.loadIndex(0, e);
			}
			return retVal;
		};
		
		obj.loadPrev = function(e){
			var retVal = obj.loadIndex(obj.currentIndex - 1, e);
			if(retVal === false && o.carousel){
				retVal = obj.loadIndex(obj.uniqueOpeners.length - 1, e);
			}
			return retVal;
		};
	};
	
	$.createUrlIndex.mmContent = {
		types: {},
		add: function(name, obj){
			this.types[name] = obj;
		}
	};
	
	var imgReg = /\.jpg$|\.jpeg$|\.gif$|\.png$/i;
	
	$.createUrlIndex.mmContent.add('img', {
		filter: function(url, opener, urlPart, type){
			if(type[1][0] === 'image' || opener.is('.img, .image, .picture')){
				return true;
			}
			return (imgReg.test(urlPart));
		},
		load: function(url, opener, ui, fn){
			var inst = ui.instance || ui;
			$.imgPreLoad.loadNow(url, 
				function loadImg(e){
					var imgWidth 	= this.width,
						jElm 		= $(this)
					;
					
					if(ui.extras){
						ui.extras.mm = jElm;
					}
					inst.content = {
						'multimedia-box': jElm
					};
					fn(url, imgWidth);
					
				}
			);
		}
	});
})(jQuery);

    /**
 * @author alexander.farkas
 */
(function($){
	$.addOuterDimensions = function(jElm, dim, dir){
		var adds = (dir === 'height') ? ['Top', 'Bottom'] : ['Left', 'Right'];
		$.each(['padding', 'border', 'margin'], function(i, css){
			if(css !== 'border'){
				dim += parseInt( jElm.css(css + adds[0]), 10) || 0;
				dim += parseInt( jElm.css(css + adds[1]), 10) || 0;
			} else {
				dim += parseInt( jElm.css(css + adds[0] +'Width'), 10) || 0;
				dim += parseInt( jElm.css(css + adds[1] +'Width'), 10) || 0;
			}
		});
		return dim;
	};
	
	function addFollowScroll(overlay, ui){
		var o 	= ui.options,
			doc = $(document),
			timer
		;
		if(o.followScroll){
			$(window).bind('scroll.'+ this.id +' resize.'+ this.id, function(e){
				if($(window).height() - 20 > overlay.outerHeight(true) + overlay.offset().top - $.SCROLLROOT.scrollTop()){
					clearTimeout(timer);
					timer = setTimeout(function(){
						overlay.animate({top: doc.scrollTop()});
					}, 400);
				}
			});
		}
	}
		
	$.ui.cOverlay.posMethods.centerHorizontalView = function(overlay, e, extra, ui){
		var o 	= ui.options,
			doc = $(document),
			pos
		;
		
		if(!$.objScale){
			setTimeout(function(){
				throw('please install the objScale plugin');
			},0);
			return {};
		}
		
		pos = $.objScale.centerObjTo(overlay, $(window), o.positionOpts);
		pos.top = doc.scrollTop();
		
		if(isFinite(o.marginTop)){
			pos.top += o.marginTop;
		}
		
		pos.left += doc.scrollLeft();
		addFollowScroll(overlay, ui);
		return pos;
	};
	
	$.ui.cOverlay.posMethods.constrainInsideView = function(overlay, e, extra, ui){
		var o 			= ui.options,
			doc 		= $(document),
			imgDim		= {},
			dim 		= {},
			pos
		;
		
		if(!$.objScale){
			setTimeout(function(){
				throw('please install the objScale plugin');
			},0);
			return {};
		}
		
		pos = $.objScale.constrainObjTo(overlay, $(window), o.positionOpts);
		$.swap(overlay[0], { position: "absolute", visibility: "hidden", display:"block" }, function(){
			imgDim = $.objScale.getDim(extra.mm);
		});
		
		pos.top += doc.scrollTop();
		pos.left += doc.scrollLeft();
		
		dim.width = imgDim.width + pos.widthSubtraction;
		dim.height = imgDim.height + pos.heightSubtraction;
		if(extra.mm.css && extra.mm.attr && extra.mm[0] && !$.nodeName(extra.mm[0], 'object')){
			extra.mm.css(dim).attr(dim);
		}
		delete pos.widthSubtraction;
		delete pos.heightSubtraction;
		addFollowScroll(overlay, ui);
		return pos;
	};
	
	$.ui.cOverlay.posMethods.constrainHorizontalView = function(overlay, e, extra, ui){
		var o 	= ui.options,
			pos = $.ui.cOverlay.posMethods.constrainInsideView(overlay, e, extra, ui)
		;
		pos.top = $(document).scrollTop();
		return pos;
	};
	$.fn.showbox = function(opts){
		opts = $.extend({}, $.fn.showbox.defaults, opts);
		opts.openerSel = this;
		var lightbox = $(opts.structure)
			.appendTo('body')
			.bind('coverlayinit', function(e, ui){
				
				var inst 	= ui.instance,
					o 		= inst.options
				;
				
				$.createUrlIndex(inst.openers, inst);
				
				inst.widthElement = (inst.element.is(o.widthElementSel)) ? inst.element : $(inst.options.widthElementSel, inst.element);
				
				inst.calcWidth = function(img, initialWidth){
					var width 	= initialWidth || img[0].width,
						elem 	= img
					;
					if(width == 'auto'){
						return width;
					}
					if (!width) {
						return false;
					}
					while(!elem.is(o.widthElementSel) && elem[0]){
						width = $.addOuterDimensions(elem, width, 'width');
						elem = elem.parent();
					}
					return width;
				};
				
			})
			.bind('coverlaybeforeshow', function(e, ui){
				if(!ui.extras.mm){
					var inst 	= ui.instance, 
						url 	= ui.extras.opener.attr('href'),
						urlPart = url.split('?')[0],
						type 	= ui.extras.opener.attr('type') || ''
					;
					type = [type, type.split('/')];
					inst.mask.addClass('loading-mask').mask('show');
					
					$.each($.createUrlIndex.mmContent.types, function(name, mmHanlder){
						if(mmHanlder.filter(url, inst.currentOpener, urlPart, type)){
							mmHanlder.load(url, inst.currentOpener, ui, function(url, width){
								
								inst.options.getTextContent(inst.currentOpener, inst.content, inst);
								
								inst.fillContent();
								
								width = inst.calcWidth(ui.extras.mm, width);
								if(width){
									inst.widthElement.css({
										width: width
									});
								}
								
								inst.stopShow = false;
								inst.updateIndex(url);
								
								inst.show(e, ui.extras);
								
								inst._trigger('indexchange', e, {oldAnchor: null, index: inst.currentIndex, opener: inst.currentOpener, content: inst.content});
								inst.mask.removeClass('loading-mask');
							});
							return false;
						}
						return undefined;
					});
					
					inst.stopShow = true;
				}
			})
			.bind('coverlayshow', function(e, ui){
				var inst = ui.instance;
				if(inst.options.slideShowAutostart){
					inst.play(true);
				}
			})
			.bind('coverlayhide', function(e, ui){
				ui.instance.pause();
				$('div.content-box', ui.element).removeAttr('aria-live').removeAttr('aria-busy');
			})
			.cOverlay(opts);
		
		return (opts.returnOverlay) ? lightbox : this;
	};
	
	$.fn.showbox.defaults = {
		returnOverlay: false,
		mask: true,
		maskOpts: {
			fadeInTime: 600
		},
		focusOnShow: 'h1.showbox-title',
		addRole: 'dialog',
		positionType: 'centerHorizontalView',
		followScroll: true,
		widthElementSel: '.content-box',
		structure: '<div class="showbox">' +
						'<div class="showbox-box">'+
							'<div class="showbox-head">'+
								'<h1 class="showbox-title"></h1>'+
								'<span class="showbox-toolbar">'+ 
									'<a role="button" class="prev" href="#" /> <a role="button" class="next" href="#" />'+
									' <a class="play-pause" role="button" href="#" />'+ 
									' <span class="index-pagination"><span class="current-index" /> / <span class="item-length" /></span>'+
								'</span>'+
							'</div>'+
							'<div class="content-box"><div class="multimedia-box"></div><div class="text-content"></div></div>'+
							' <a role="button" class="close-button" href="#"></a>'+
						'</div>'+
					'</div>',
		getTextContent: function(opener, content, ui){
			content['text-content'] = opener.attr('title');
		},
		addKeyNav: true,
		addLiveRegion: true,
		showContentAnim: function(ui, img, e, extras){
			var contentBox 	= $('div.content-box', ui.element);
			
			contentBox
				.queue(function(){
					ui.fillContent();
					
					ui.widthElement.css({width: ui.calcWidth(img)});
					
					contentBox.fadeTo(300, 1);
					contentBox.dequeue();
				});
		},
		hideContentAnim: function(ui){
			var contentBox = $('div.content-box', ui.element);
			contentBox.fadeTo(300, 0);
		},
		controlsWrapper: '.showbox-toolbar', // versteckt toolar wenn nur ein Bild - optionen: false 
		slideShowAutostart: false,
		slideshowDelay: 4000,
		playTitle: '',  // title text play button 
		playText: 'play',
		pauseText: 'pause',
		pauseTitle: '' // title text Pause button 
	};
})(jQuery);
    /**
 * @author alexander.farkas
 */
(function($){
	
	var isLocal = ( (location.protocol.indexOf('file') === 0) || location.href.indexOf('://127.0.0.1') !== -1 || location.href.indexOf('://localhost'));
	
	$.widget('aperto.simpleMenu', {
		options: {
            debug: false,
			inOutOpts: {
				mouseDelay: 100
			},
			
			menuSel: 'div.menu',
			menuItemSel: '> a, > strong', //
			addKeyNav: true,
			visibleClass: 'menu-visible',
			activateDelay: 300,
			
			showHiddenOnFocus: false,
			
			constrainHorizontal: false,
			constrainStyle: 'left',
			positionTop: false,
			
			
			
			closeOnItemLeave: true, // false funktioniert nur bei einfacher verschachtelung
			closeOnMenuLeave: false,
			initialOpenSel: '.ui-menu-visible', // Selector gilt nur für 1. Verschachtelung
			restoreInitialStateOnLeave: false, // true funktioniert nur für 1. Verachtelung
			
			
			nestedMenu: false
		},
		_create: function(){
			
			var o 			= this.options,
				that 		= this,
				firstUL 	= (this.element.is('ul, ol')) ? 
								this.element : 
								$('ul, ol', this.element).filter(':first') 
			;
			
			if( isLocal && !o.nestedMenu && this.element.parents(':aperto-simpleMenu').length ){
				alert('Are you sure you want to create multiple nested megamenus. Check your selector.');
			}
			
			this.timer = $.createTimer(this);
			
			this.mainItems = $('> li', firstUL[0]);
			
			this.menuItems = [];
			this.menus 	= [];
			
			function initItems(){
				var menu = $(o.menuSel, this), jElm;		
				if(menu[0]){
					jElm = $(this);
					jElm = jElm.addClass('has-menu');
					that.menuItems.push(this);
					that.menus.push(menu[0]);
					return menu;
				}
				return false;
			}
			
			function over(e){
				that.show($(this), e);
			}
				
			function out(e){
                if(o.debug){return;}
				if(o.closeOnItemLeave){
					that.hide($(this), e);
				}
			}
			
			this.initialOpenItem = $([]);
			
			this.mainItems.each(function(i){
				var menu 	= initItems.call(this), 
					jElm	= $(this),
					toText 	= '',
					nextLi, 
					fromText, 
					toElem, 
					skipLink
				;
				
				if(menu){
					if(o.initialOpenSel && jElm.is(o.initialOpenSel)){
						that.initialOpenItem = jElm.addClass(o.visibleClass);
					}
					$('li', this).each(initItems);
				}
			});
			
			that.currentOpenItem = that.initialOpenItem;
			firstUL.context = firstUL.parent()[0];
			firstUL.selector = '> ul, > ol';
			
			if(o.restoreInitialStateOnLeave && this.initialOpenItem[0]){
				firstUL.inOut(function(){
					that.timer.clear('openTimer');
				}, function(e){
					that.timer.setDelay('openTimer', function(){
						that.show(that.initialOpenItem, e);
					}, 1);
				}, o.inOutOpts);
			} else if(!o.closeOnItemLeave && o.closeOnMenuLeave){
				firstUL.inOut(function(){
					that.timer.clear('openTimer');
				}, function(e){
					that.timer.setDelay('openTimer', function(){
						if(that.currentOpenItem && that.currentOpenItem[0]){
							that.hide(that.currentOpenItem, e);
						}
					}, 1);
				}, o.inOutOpts);
			}
			
			if(o.addKeyNav){
				this.mainItems.bind('keydown', function(e){
					if($(e.target).is(':input')){return undefined;}
					var ret;
					if($.ui.keyCode.LEFT === e.keyCode){
						ret = that.focusIndex(that.mainItems.index(this) - 1);
					} else if($.ui.keyCode.RIGHT === e.keyCode){
						ret = that.focusIndex(that.mainItems.index(this) + 1);
					}
					
					return ret;
				});
			}
			this.element
				.inOut(
					$.proxy(this, 'activateMenu'),
					$.proxy(this, 'inactivateMenu'),
					{
						mouseDelay: o.activateDelay,
						keyDelay: 0
					}
				)
			;
				
			this.menuItems = $(this.menuItems);
			this.menuItems.context = firstUL[0];
			this.menuItems.selector = '.has-menu';
			this.menuItems.inOut(over, out, o.inOutOpts);
			
			this.menuItems
				[o.inOutOpts.bindStyle || 'bind']('mouseleave mouseenter focusin focusout', function(){
					that.timer.clear('openTimer');
				})
			;
			
			this.menus = $(this.menus);
			this._trigger('init', {}, this.ui());
			
			
		},
		focusIndex: function(index){
			var focusItem = this.mainItems.get(index);
			if(focusItem){
				$(this.options.menuItemSel, focusItem).setFocus();
				return false;
			}
			return undefined;
		},
		ui: function(){
			return {
				instance: this,
				menuItems: this.menuItems,
				menus: this.menus,
				element: this.element
			};
		},
		constrainRight: function(menu){
			var offset = (this.element.offset().left + this.element.width()) - (menu.offset().left + menu.width());
			if(offset < 0){
				menu.css(this.options.constrainStyle, offset);
			}
		},
		activateMenu: function(){
			this.isActivated = true;
			if(this.showOnActivate && this.showOnActivate[0]){
				this.show(this.showOnActivate, {type: 'activated'});
			}
			this.showOnActivate = false;
		},
		inactivateMenu: function(){
			this.isActivated = false;
			this.showOnActivate = false;
		},
		show: function(menuItem, e){
			this.timer.clear('openTimer');
			e = e || {type: 'show'};
			var o 			= this.options,
				menu 		= $(o.menuSel +':first', menuItem)
			;
			if(menuItem.hasClass(o.visibleClass)){return;}
			
			if(!$.aperto.simpleMenu.shouldReactOnFocus(e, menu, o)){
				return false;
			}
			if(!this.isActivated){
				this.showOnActivate = menuItem;
				return;
			}
			if($.inArray(menuItem[0], this.mainItems) > -1){
				if((!o.closeOnItemLeave || o.restoreInitialStateOnLeave) && this.currentOpenItem && this.currentOpenItem[0]){
					this.hide(this.currentOpenItem, e);
				}
				this.currentOpenItem = menuItem;
			}
			
			if( o.positionTop !== false && isFinite(o.positionTop) ){
				menu.css({
					top: menu.offsetParent().outerHeight() + o.positionTop
				});
			}
			
			this._trigger('show', e, $.extend({}, this.ui(), {menuItem: menuItem, menu: menu}));
			menuItem.addClass(o.visibleClass);
			if(o.constrainHorizontal){
				this.constrainRight(menu);
			}
			
			return undefined;
		},
		hide: function(menuItem, e){
			e = e || {type: 'hide'};
			var o 		= this.options,
				that 	=	this,
				menu 	= $(o.menuSel +':first', menuItem)
			;
			
			if(!menuItem.hasClass(o.visibleClass)){
				if(this.showOnActivate && this.showOnActivate[0] === menuItem[0]){
					this.showOnActivate = false;
					return;
				}
				return;
			}
			this._trigger('hide', e, $.extend({}, this.ui(), {menuItem: menuItem, menu: menu}));
			
			menuItem.removeClass(o.visibleClass);
			if($.inArray(menuItem[0], this.mainItems) > -1){
				this.currentOpenItem = $([]);
			}
		},
		hideAll: function(e) {
			var that		= this;
			e = e || {type: 'hideAll'};
			
			this
				.menuItems
				.filter('.'+this.option('visibleClass'))
				.each(function(){
					that.hide($(this), e);
			});
		}
	});
	
	$.aperto.simpleMenu.shouldReactOnFocus = function(e, menu, o){
		return !!(!e || !(!o.showHiddenOnFocus && 
					e.originalEvent && e.originalEvent.type &&
					e.originalEvent.type.indexOf('focus') !== -1 && 
					menu.css('display') === 'none'));
	};
	
})(jQuery);
    /**
 * @author   Christian Ringele christian.ringele [at] magnolia-cms.com
 * @version  1.0 2010-01-20
 * 
 * 
 * jquery.gatracker.js - Monitor events with Google Analytics ga.js tracking code
 * 
 * Requires jQuery 1.2.x or higher (for cross-domain $.getScript)
 * 
 * Used some elements of qGoogleAnalytics of David Simpson  david.simpson [at] nottingham.ac.uk
 * (http://davidsimpson.me/2008/06/18/jgoogleanalytics-google-analytics-integration-for-jquery/) 
 * who built upon gaTracker (c)2007 Jason Huck/Core Five Creative 
 * (http://devblog.jasonhuck.com/2007/11/19/google-analytics-integration-with-jquery/)
 *    http://plugins.jquery.com/files/jquery.gatracker.js_0.txt  
 * 
 * Implemented features by David Simpsons qGoogleAnalytics;
 * - clicks events
 * - form submit events
 * - cross subdomain
 * - cross domain (e.g. for eCommerce payment gateways hosted externally)
 * - new organic search engines
 * - all the features of Jason Huck�s GA jQuery integration
 *      
 * Changes and added features to David Simpsons version of qGoogleAnalytics:
 * - tracking of anchor links on pages (href starting with #) 
 * - enabling/disabling possibilities of all link tracking options (external-, maitlo-, anchor- & download-links)
 * - standardizing the default values (null where no booelan is expected, null=not tracked)
 *  
 * @param {String} trackerCode
 * @param {Object} options see setings below
 *    
 * usage: 
 *	 $.qGoogleAnalytics( 'UA-XXXXXX-X');
 *	 $.qGoogleAnalytics( 'UA-XXXXXX-X', {trackLinksEnabled: true, pageViewsEnabled: false} );
 * 
 */

(function($) { // make available to jQuery only

	$.mgnlGoogleAnalytics = function (trackerCode, options)
	{
		
		settings = $.extend({
			//events tracking
			clickEvents:         null,          // e.g. {'.popup': '/popup/nasty'}
			evalClickEvents:     null,          // e.g. {'#menu li a': "'/tabs/'+ $(this).text()"}
			submitEvents:        null,          // e.g. {'#personUK': '/personsearch/uk'}
			evalSubmitEvents:    null,          // e.g. {'#menu li a': "'/tabs/'+ $(this).text()"}

			//link tracking
			trackLinksEnabled:   false,         // enables the link tracking (external-, maitlo-, anchor- & download-links)			
			externalPrefix:	     null,          // prefix to add to external links e.g. '/external/'
			mailtoPrefix:		 null,          // prefix to add to email addresses e.g. '/mailtos/'
			anchorPrefix:	     null,          // prefix to add to anchors (href starting with #) e.g. '/anchors/'
			downloadPrefix:	     null,          // prefix to add to downloads e.g. '/downloads/'
			downloadExtensions:  [              
					               'pdf','doc','xls','ppt','docx','xlsx','pptx',
					               'odt','odp','ods','csv','txt','jpg','jpeg','jpx',
					               'gif','png','bmp','swf','zip','gz','tar','rar',
					               'dmg','xml','js','mp3','wav','mov','mpg','mpeg','avi'
			                     ],	           // tracked files extensions of downloads
			                     
			//domain tracking                 
			crossDomainSelector: null,          // e.g. 'a.crossDomain'
			domainName:          null,          // e.g. 'nottingham.ac.uk'
			
			//misc tracking options
			organicSearch:       null,		    // e.g. {'search-engine': 'query-term', 'google.nottingham.ac.uk': 'q'}
			pageViewsEnabled:    true,          // can be disabled e.g. if only tracking click events
			sampleRate:          null           // e.g. 50 - set the sample rate at 50%
		});
		
		if (options)
		{
			$.extend(settings, options);
		} 
		
		init();
		



		/****** methods *******/
				
		/**
		 * Initialise the tracking code and add any optional functionality
		 */
		function setupTracking()
		{
			// Get the tracking code
			var pageTracker = _gat._getTracker(trackerCode);
				
			// Track visitor across subdomain
			if (settings.topLevelDomain)
			{
				pageTracker._setDomainName(settings.topLevelDomain);
			}
			
			// Set the sample rate - for very busy sites
			if (settings.sampleRate)
			{
				pageTracker._setSampleRate(settings.sampleRate);
			}
			
			// Track visitor across domains		
			if (settings.crossDomainSelector)
			{
				// ignore domain names
				pageTracker._setDomainName('none');
				pageTracker._setAllowLinker(true);
				
				// Add submit event to form selector e.g. form.crossDomain
				$('form' + settings.crossDomainSelector).submit(
					function()
					{
						pageTracker._linkByPost(this);
						// console.debug('crossDomain ._linkByPost');
					}
				);
				// Add a click event to anchor selector e.g. a.crossDomain
				$('a' + settings.crossDomainSelector).click(
					function()
					{
						pageTracker._link( $(this).attr('href') );
						// console.debug('crossDomain ._link: ' + $(this).attr('href'));
					}
				);				
				// Add click event to link
			}
			
			// Add organic search engines as required
			if (settings.organicSearch)
			{
				$.each(
					settings.organicSearch, 
					function(key, val)
					{
						pageTracker._addOrganic(key, val);
						// console.debug('_addOrganic: ' + key);
					}
				);
			}
			
			// check that this is the correct place
			pageTracker._initData();
			// console.debug('_initData');
			
			addTracking(pageTracker);		
		}
		
		/**
		 * 
		 */
		function addTracking(pageTracker)
		{		
			// 1. Track event triggered 'views'
					
			// loop thru each link on the page
			if (settings.trackLinksEnabled)
			{
				// From: http://plugins.jquery.com/files/jquery.gatracker.js_0.txt
				$('a').each(function(){
					var u = $(this).attr('href');
					
					if(typeof(u) != 'undefined'){
						var newLink = decorateLink(u);
	
						// if it needs to be tracked manually,
						// bind a click event to call GA with
						// the decorated/prefixed link
						if (newLink.length)
						{
							$(this).click(
								function()
								{
									pageTracker._trackPageview(newLink);
									//console.debug('linkClick: ' + newLink);
								}
							);
						}
					}				
				});
			}
			
			// loop thru the clickEvents object
			if (settings.clickEvents)
			{
				$.each(settings.clickEvents, function(key, val){
					$(key).click(function(){
						pageTracker._trackPageview(val);
						// console.debug('clickEvents: ' + val);

					})
				});
			}

			// loop thru the evalClickEvents object
			if (settings.evalClickEvents)
			{
				$.each(settings.evalClickEvents, function(key, val){
					$(key).click(function(){
						evalVal = eval(val)
						if (evalVal != '')
						{
							pageTracker._trackPageview(evalVal);
							// console.debug('evalClickEvents: ' + evalVal);
						}
					})
				});			
			}
			
			// loop thru the evalSubmitEvents object
			if (settings.evalSubmitEvents)
			{
				$.each(settings.evalSubmitEvents, function(key, val){
					$(key).submit(function(){
						evalVal = eval(val)
						if (evalVal != '')
						{
							pageTracker._trackPageview(evalVal);
							// console.debug('evalSubmitEvents: ' + evalVal);
						}						
					})
				});
			}
			
			// loop thru the submitEvents object
			if (settings.submitEvents)
			{
				$.each(settings.submitEvents, function(key, val){
					$(key).submit(function(){
						pageTracker._trackPageview(val);
						// console.debug('submitEvents: ' + val);
					})
				});
			}

			// 2. Track normal page views
			if (settings.pageViewsEnabled)
			{
				pageTracker._trackPageview();	
				// console.debug('pageViewsEnabled');
			}
			else
			{
				// console.debug('pageViewsDisabled');		
			}
		}

		// From: http://plugins.jquery.com/files/jquery.gatracker.js_0.txt
		// Returns the given URL prefixed if it is:
		//		a) a link to an external site
		//		b) a mailto link
		//		c) a downloadable file
		//      d) a anchor link (starting with # in href)
		// ...otherwise returns an empty string.
		function decorateLink(uri)
		{
			var trackingUri = '';
			
			// check if internal link
			if (uri.indexOf('://') == -1 && uri.indexOf('mailto:') != 0)
			{
				// check if download links shall be tracked
				if(settings.downloadPrefix){
				
					// no protocol or mailto - internal link - check extension
					var ext = uri.split('.')[uri.split('.').length - 1];			
					var exts = settings.downloadExtensions;
					
					for(i=0; i < exts.length; i++)
					{
						if(ext == exts[i])
						{
							// external link - decorate
							trackingUri = settings.downloadPrefix + uri;
							break;
						}
					}		
				}
				
				//Check if anchors on page shall be tracked
				if(settings.anchorPrefix){
					if(uri.indexOf('#') == 0 && uri.length>1){
						//anchor link - decorate
						var pageUrl = window.location.pathname;
						var indexHtml = pageUrl.indexOf('.html');
						pageUrl = pageUrl.substring(0, indexHtml);
						trackingUri = settings.anchorPrefix+ pageUrl+'.'+ uri.substring(1);
					}
				}
			} 
			else // is not internal link -> mail or external link
			{
				// check if mailto link
				if (uri.indexOf('mailto:') == 0) 
				{
					//Check if mailto links shall be tracked
					if(settings.mailtoPrefix){
						// mailto link - decorate
						trackingUri = settings.mailtoPrefix + uri.substring(7);	
					}
				} 
				else // is external link
				{
					// check if external links shall be tracked
					if(settings.externalPrefix){
						// complete URL - check domain
						var regex     = /([^:\/]+)*(?::\/\/)*([^:\/]+)(:[0-9]+)*\/?/i;
						var linkparts = regex.exec(uri);
						var urlparts  = regex.exec(location.href);
											
						if (linkparts[2] != urlparts[2])
						{
							// external link - decorate
							trackingUri = settings.externalPrefix + uri;
						}
					}
				}
			}
			
			return trackingUri;			
		}
		
		/**
		 * load ga.js and add the tracking code
		 */		
		function init()
		{
			
			try
			{
				// determine whether to include the normal or SSL version
				var gaUrl = (location.href.indexOf('https') == 0 ? 'https://ssl' : 'http://www');
				gaUrl += '.google-analytics.com/ga.js';
				
				// load ga.js with caching
				return $.ajax({
					type: 'GET',
					url: gaUrl,  // Store the tracking JS locally & update weekkly (??)
					dataType: 'script',
					cache: true,
					success: function() {  
						// console.debug('ga.js loaded!'); 
						setupTracking(); 
					},
					error: function() { 
						// console.error('ajax GET failed'); 
					}
				});	
			} 
			catch(err) 
			{
				// log any failure
				// console.error('Failed to load Google Analytics:' + err);
			}	
			
			return false;		
		}	
	} 
	
	
})(jQuery);	
/*ends*/

    
/*
  This message is for google-analytics-module JS debugging:
  No google-analytics configuration found under 'config.modules.google-analytics.config.sites.site' for STK site-config 'site'
*/



