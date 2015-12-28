var TICK = 17;

/**
 * EVENT_NAME_MAP is used to determine which event fired when a
 * transition/animation ends, based on the style property used to
 * define that event.
 */
var EVENT_NAME_MAP = {
  transitionend: {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'mozTransitionEnd',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd'
  },

  animationend: {
    'animation': 'animationend',
    'WebkitAnimation': 'webkitAnimationEnd',
    'MozAnimation': 'mozAnimationEnd',
    'OAnimation': 'oAnimationEnd',
    'msAnimation': 'MSAnimationEnd'
  }
};

var endEvents = [];

(function detectEvents() {
  if (typeof document === 'undefined') {
    return;
  }

  var testEl = document.createElement('div'),
      style = testEl.style;

  // On some platforms, in particular some releases of Android 4.x, the
  // un-prefixed "animation" and "transition" properties are defined on the
  // style object but the events that fire will still be prefixed, so we need
  // to check if the un-prefixed events are useable, and if not remove them
  // from the map
  if (!('AnimationEvent' in window)) {
    delete EVENT_NAME_MAP.animationend.animation;
  }

  if (!('TransitionEvent' in window)) {
    delete EVENT_NAME_MAP.transitionend.transition;
  }

  for (var baseEventName in EVENT_NAME_MAP) {
    if (EVENT_NAME_MAP.hasOwnProperty(baseEventName)) {
      var baseEvents = EVENT_NAME_MAP[baseEventName];
      for (var styleName in baseEvents) {
        if (styleName in style) {
          endEvents.push(baseEvents[styleName]);
          break;
        }
      }

    }
  }
})();

function animationSupported() {
  return endEvents.length !== 0;
}

/**
 * Functions for element class management to replace dependency on jQuery
 * addClass, removeClass and hasClass
 */
function addClass(element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else if (!hasClass(element, className)) {
    element.className = element.className + ' ' + className;
  }

  return element;
}

function removeClass(element, className) {
  if (hasClass(className)) {
    if (element.classList) {
      element.classList.remove(className);
    } else {
      element.className = (' ' + element.className + ' ')
             .replace(' ' + className + ' ', ' ').trim();
    }
  }

  return element;
}

function hasClass(element, className) {
  if (element.classList) {
    return element.classList.contains(className);
  } else {
    return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
  }
}

function timeoutTransition(t) {
  var params = t.params[0];
  var node = t.node;
  var transitionName = params.name;
  var enterTimeout = params.enterTimeout;
  var leaveTimeout = params.leaveTimeout;
  var animationType = t.isIntro ? 'enter' : 'leave';
  var className = transitionName + '--' + animationType;
  var activeClassName = className + '-active';

  var classNameQueue = [];
  var timeout;
  var animationTimeout;

  var endListener = function() {
    if (animationType === 'enter') {
      removeClass(node, className);
      removeClass(node, activeClassName);
    }

    if(animationTimeout) {
      clearTimeout(animationTimeout);
    }

    if(timeout) {
      clearTimeout(timeout);
    }

    t.complete();
  };

  function queueClass(className) {
    classNameQueue.push(className);

    if(!timeout) {
      timeout = setTimeout(flushClassNameQueue, TICK);
    }
  }

  function flushClassNameQueue() {
    classNameQueue.forEach(function(className) {
      addClass(node, className);
    });

    classNameQueue.length = 0;
    timeout = null;
  }

  // Remove `leave` class if we're about to `enter` again.
  // (See rationale above.)
  if (animationType === 'enter') {
    removeClass(node, transitionName + '--leave');
    removeClass(node, transitionName + '--leave-active');
  }

  if (!animationSupported()) {
    endListener();
  } else {
    if (animationType === 'enter') {
      animationTimeout = setTimeout(endListener, enterTimeout);
    } else if (animationType === 'leave') {
      animationTimeout = setTimeout(endListener, leaveTimeout);
    }
  }

  addClass(node, className);

  // Need to do this to actually trigger a transition.
  queueClass(activeClassName);
}

module.exports = timeoutTransition;
