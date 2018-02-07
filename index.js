// Complete page load handler
// For a wider cross-browser compatibility e.g. IE8,9, the code needs to be changed
// Also it should be adjusted for some modular system

; (function () {
    'use strict';

    var XHRSend = XMLHttpRequest.prototype.send,
        windowLoaded = false,
        readyToGo = false,
        callbacks = [],
        pendingXHRs = 0;

    // setting up the proxy for the default "send" method
    XMLHttpRequest.prototype.send = function () {
        readyToGo = false;
        pendingXHRs += 1;
        this.addEventListener('loadend', function () {
            // waiting for xhr done | fail | abort
            pendingXHRs -= 1;
            checkAndRunIfReadyToGo();
        });
        return XHRSend.apply(this, arguments);
    };

    window.addEventListener('load', function () {
        // waiting for all external sources, including images
        windowLoaded = true;
        checkAndRunIfReadyToGo();
    });

    function checkAndRunIfReadyToGo() {
        setTimeout(function () {
            // setTimeout gives additional safety, it covers some special cases,
            // including jQuery 3 asynchronous "$(function () {...})" which may contains ajax calls
            readyToGo = windowLoaded && pendingXHRs == 0;
            
            if (readyToGo) {
                runCallbacks();
                callbacks = [];
            }
        });
    }

    function runCallbacks() {
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i]();
        }
    }

    function callWhenReadyToGo(callback) {
        if (readyToGo) {
            callback();
        } else {
            callbacks.push(callback);
        }
    }

    // export function
    window.callWhenReadyToGo = callWhenReadyToGo;

})();