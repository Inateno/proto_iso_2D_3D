﻿(function () {
    // Checking minimum features support
    if (document.createEvent === undefined) {
        return;
    }

    // Installing Hand.js
    var supportedEventsNames = ["PointerDown", "PointerUp", "PointerMove", "PointerOver", "PointerOut", "PointerCancel", "PointerEnter", "PointerLeave",
                                "pointerdown", "pointerup", "pointermove", "pointerover", "pointerout", "pointercancel", "pointerenter", "pointerleave",
    ];

    var POINTER_TYPE_TOUCH = "touch";
    var POINTER_TYPE_PEN = "pen";
    var POINTER_TYPE_MOUSE = "mouse";

    // Touch events
    var generateTouchClonedEvent = function (sourceEvent, newName) {
        // Considering touch events are almost like super mouse events
        var evObj = document.createEvent('MouseEvents');
        evObj.initMouseEvent(newName, true, true, window, 1, sourceEvent.screenX, sourceEvent.screenY,
            sourceEvent.clientX, sourceEvent.clientY, sourceEvent.ctrlKey, sourceEvent.altKey,
            sourceEvent.shiftKey, sourceEvent.metaKey, sourceEvent.button, null);

        // offsets
        if (evObj.offsetX === undefined) {
            if (sourceEvent.offsetX !== undefined) {

                // For Opera which creates readonly properties
                if (Object && Object.defineProperty !== undefined) {
                    Object.defineProperty(evObj, "offsetX", {
                        writable: true
                    });
                    Object.defineProperty(evObj, "offsetY", {
                        writable: true
                    });
                }

                evObj.offsetX = sourceEvent.offsetX;
                evObj.offsetY = sourceEvent.offsetY;
            }
            else if (sourceEvent.layerX !== undefined) {
                evObj.offsetX = sourceEvent.layerX - sourceEvent.currentTarget.offsetLeft;
                evObj.offsetY = sourceEvent.layerY - sourceEvent.currentTarget.offsetTop;
            }
        }

        // adding missing properties

        if (sourceEvent.isPrimary !== undefined)
            evObj.isPrimary = sourceEvent.isPrimary;
        else
            evObj.isPrimary = true;

        if (sourceEvent.pressure)
            evObj.pressure = sourceEvent.pressure;
        else {
            var button = 0;

            if (sourceEvent.which !== undefined)
                button = sourceEvent.which;
            else if (sourceEvent.button !== undefined) {
                button = sourceEvent.button;
            }
            evObj.pressure = (button == 0) ? 0 : 0.5;
        }


        if (sourceEvent.rotation)
            evObj.rotation = sourceEvent.rotation;
        else
            evObj.rotation = 0;

        // Timestamp
        if (sourceEvent.hwTimestamp)
            evObj.hwTimestamp = sourceEvent.hwTimestamp;
        else
            evObj.hwTimestamp = 0;

        // Tilts
        if (sourceEvent.tiltX)
            evObj.tiltX = sourceEvent.tiltX;
        else
            evObj.tiltX = 0;

        if (sourceEvent.tiltY)
            evObj.tiltY = sourceEvent.tiltY;
        else
            evObj.tiltY = 0;

        // Width and Height
        if (sourceEvent.height)
            evObj.height = sourceEvent.height;
        else
            evObj.height = 0;

        if (sourceEvent.width)
            evObj.width = sourceEvent.width;
        else
            evObj.width = 0;

        // PreventDefault
        evObj.preventDefault = function () {
            if (sourceEvent.preventDefault !== undefined)
                sourceEvent.preventDefault();
        };

        // Constants
        evObj.POINTER_TYPE_TOUCH = POINTER_TYPE_TOUCH;
        evObj.POINTER_TYPE_PEN = POINTER_TYPE_PEN;
        evObj.POINTER_TYPE_MOUSE = POINTER_TYPE_MOUSE;

        // Pointer values
        evObj.pointerId = sourceEvent.pointerId;
        evObj.pointerType = sourceEvent.pointerType;

        switch (evObj.pointerType) {// Old spec version check
            case 2:
                evObj.pointerType = evObj.POINTER_TYPE_TOUCH;
                break;
            case 3:
                evObj.pointerType = evObj.POINTER_TYPE_PEN;
                break;
            case 4:
                evObj.pointerType = evObj.POINTER_TYPE_MOUSE;
                break;
        }

        // If force preventDefault
        if (sourceEvent.currentTarget.handjs_forcePreventDefault === true)
            evObj.preventDefault();

        // Fire event
        sourceEvent.target.dispatchEvent(evObj);
    };

    var generateMouseProxy = function (evt, eventName) {
        evt.pointerId = 1;
        evt.pointerType = POINTER_TYPE_MOUSE;
        generateTouchClonedEvent(evt, eventName);
    };

    var handleOtherEvent = function (eventObject, name) {
        if (eventObject.preventManipulation)
            eventObject.preventManipulation();

        for (var i = 0; i < eventObject.changedTouches.length; ++i) {
            var touchPoint = eventObject.changedTouches[i];
            var touchPointId = touchPoint.identifier + 2; // Just to not override mouse id

            touchPoint.pointerId = touchPointId;
            touchPoint.pointerType = POINTER_TYPE_TOUCH;
            touchPoint.currentTarget = eventObject.currentTarget;

            if (eventObject.preventDefault !== undefined) {
                touchPoint.preventDefault = function () {
                    eventObject.preventDefault();
                };
            }

            generateTouchClonedEvent(touchPoint, name);
        }
    };

    var getPrefixEventName = function(item, prefix, eventName) {
        var msEventName;

        if (eventName == eventName.toLowerCase()) {
            var indexOfUpperCase = supportedEventsNames.indexOf(eventName) - (supportedEventsNames.length / 2);
            msEventName = prefix + supportedEventsNames[indexOfUpperCase];
        }
        else {
            msEventName = prefix + eventName;
        }

        // Fallback to PointerOver if PointerEnter is not currently supported
        if (msEventName === prefix + "PointerEnter" && item["on" + prefix.toLowerCase() + "pointerenter"] === undefined) {
            msEventName = prefix + "PointerOver";
        }

        // Fallback to PointerOut if PointerLeave is not currently supported
        if (msEventName === prefix + "PointerLeave" && item["on" + prefix.toLowerCase() + "pointerleave"] === undefined) {
            msEventName = prefix + "PointerOut";
        }

        return msEventName;
    };

    var registerOrUnregisterEvent = function(item, name, func, enable) {
        if (enable) {
            item.addEventListener(name, func, false);
        } else {
            item.removeEventListener(name, func);
        }
    };

    var setTouchAware = function (item, eventName, enable) {
        // If item is already touch aware, do nothing
        if (item.onpointerdown !== undefined) {
            return;
        }
       
        // IE 10
        if (item.onmspointerdown !== undefined) {
            var msEventName = getPrefixEventName(item, "MS", eventName);
            
            registerOrUnregisterEvent(item, msEventName, function (evt) { generateTouchClonedEvent(evt, eventName); }, enable);

            // We can return because MSPointerXXX integrate mouse support
            return;
        }

        // Chrome, Firefox
        if (item.ontouchstart !== undefined) {
            switch (eventName.toLowerCase()) {
                case "pointerdown":
                    registerOrUnregisterEvent(item, "touchstart", function (evt) { handleOtherEvent(evt, eventName); }, enable);
                    break;
                case "pointermove":
                    registerOrUnregisterEvent(item, "touchmove", function (evt) { handleOtherEvent(evt, eventName); }, enable);
                    break;
                case "pointerup":
                    registerOrUnregisterEvent(item, "touchend", function (evt) { handleOtherEvent(evt, eventName); }, enable);
                    break;
                case "pointercancel":
                    registerOrUnregisterEvent(item, "touchcancel", function (evt) { handleOtherEvent(evt, eventName); }, enable);
                    break;
            }
        }

        // Fallback to mouse
        switch (eventName.toLowerCase()) {
            case "pointerdown":
                registerOrUnregisterEvent(item, "mousedown", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                break;
            case "pointermove":
                registerOrUnregisterEvent(item, "mousemove", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                break;
            case "pointerup":
                registerOrUnregisterEvent(item, "mouseup", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                break;
            case "pointerover":
                registerOrUnregisterEvent(item, "mouseover", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                break;
            case "pointerout":
                registerOrUnregisterEvent(item, "mouseout", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                break;
            case "pointerenter":
                if (item.onmouseenter === undefined) { // Fallback to mouseover
                    registerOrUnregisterEvent(item, "mouseover", function (evt) { generateMouseProxy(evt, eventName); }, enable);
                } else {
                    registerOrUnregisterEvent(item, "mouseenter", function(evt) { generateMouseProxy(evt, eventName); }, enable);
                }
                break;
            case "pointerleave":
                if (item.onmouseleave === undefined) { // Fallback to mouseout
                    registerOrUnregisterEvent(item, "mouseout", function(evt) { generateMouseProxy(evt, eventName); }, enable);
                } else {
                    registerOrUnregisterEvent(item, "mouseleave", function(evt) { generateMouseProxy(evt, eventName); }, enable);
                }
                break;
        }
    };

    // Intercept addEventListener calls by changing the prototype
    var interceptAddEventListener = function (root) {
        var current = root.prototype.addEventListener;

        var customAddEventListener = function (name, func, capture) {
            // Branch when a PointerXXX is used
            if (supportedEventsNames.indexOf(name) != -1) {
                setTouchAware(this, name, true);
            }

            current.call(this, name, func, capture);
        };

        root.prototype.addEventListener = customAddEventListener;
    };

    // Intercept removeEventListener calls by changing the prototype
    var interceptRemoveEventListener = function (root) {
        var current = root.prototype.removeEventListener;

        var customRemoveEventListener = function (name, func, capture) {
            // Release when a PointerXXX is used
            if (supportedEventsNames.indexOf(name) != -1) {
                setTouchAware(this, name, false);
            }

            current.call(this, name, func, capture);
        };

        root.prototype.removeEventListener = customRemoveEventListener;
    };

    // Hooks
    interceptAddEventListener(HTMLBodyElement);
    interceptAddEventListener(HTMLCanvasElement);
    interceptAddEventListener(HTMLDivElement);
    interceptAddEventListener(HTMLImageElement);
    interceptAddEventListener(HTMLSpanElement);
    interceptAddEventListener(HTMLUListElement);
    interceptAddEventListener(HTMLAnchorElement);
    interceptAddEventListener(HTMLLIElement);

    interceptRemoveEventListener(HTMLBodyElement);
    interceptRemoveEventListener(HTMLCanvasElement);
    interceptRemoveEventListener(HTMLDivElement);
    interceptRemoveEventListener(HTMLImageElement);
    interceptRemoveEventListener(HTMLSpanElement);
    interceptRemoveEventListener(HTMLUListElement);
    interceptRemoveEventListener(HTMLAnchorElement);
    interceptRemoveEventListener(HTMLLIElement);

    // Extension to navigator
    if (navigator.pointerEnabled === undefined) {

        // Indicates if the browser will fire pointer events for pointing input
        navigator.pointerEnabled = true;

        // IE
        if (navigator.msPointerEnabled) {
            navigator.maxTouchPoints = navigator.msMaxTouchPoints;
        }
    }

    // Handling touch-action css rule
    if (document.styleSheets) {
        document.addEventListener("DOMContentLoaded", function () {

            var trim = function (string) {
                return string.replace(/^\s+|\s+$/, '');
            };
            
            var processStylesheet = function (unfilteredSheet) {
                var globalRegex = new RegExp(".+?{.*?}", "m");
                var selectorRegex = new RegExp(".+?{", "m");

                while (unfilteredSheet != "") {
                    var block = globalRegex.exec(unfilteredSheet)[0];
                    unfilteredSheet = trim(unfilteredSheet.replace(block, ""));
                    var selectorText = trim(selectorRegex.exec(block)[0].replace("{", ""));

                    // Checking if the user wanted to deactivate the default behavior
                    if (block.replace(/\s/g, "").indexOf("touch-action:none") != -1) {
                        var elements = document.querySelectorAll(selectorText);

                        for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
                            var element = elements[elementIndex];

                            if (element.style.msTouchAction !== undefined) {
                                element.style.msTouchAction = "none";
                            }
                            else {
                                element.handjs_forcePreventDefault = true;
                            }
                        }
                    }
                }
            }; // Looking for touch-action in referenced stylesheets
            for (var index = 0; index < document.styleSheets.length; index++) {
                var sheet = document.styleSheets[index];

                if (sheet.href == undefined) { // it is an inline style
                    continue;
                }

                // Loading the original stylesheet
                var xhr = new XMLHttpRequest();
                xhr.open("get", sheet.href, false);
                xhr.send();

                var unfilteredSheet = xhr.responseText.replace(/(\n|\r)/g, "");

                processStylesheet(unfilteredSheet);
            }

            // Looking for touch-action in inline styles
            var styles = document.getElementsByTagName("style");
            for (var index = 0; index < styles.length; index++) {
                var inlineSheet = styles[index];

                var inlineUnfilteredSheet = trim(inlineSheet.innerHTML.replace(/(\n|\r)/g, ""));

                processStylesheet(inlineUnfilteredSheet);
            }
        }, false);
    }

})();