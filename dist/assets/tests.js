'use strict';

define('@ember/test-helpers/-utils', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.nextTickPromise = nextTickPromise;
  exports.runDestroyablesFor = runDestroyablesFor;
  exports.isNumeric = isNumeric;
  const nextTick = exports.nextTick = setTimeout;
  const futureTick = exports.futureTick = setTimeout;

  /**
   @private
   @returns {Promise<void>} promise which resolves on the next turn of the event loop
  */
  function nextTickPromise() {
    return new Ember.RSVP.Promise(resolve => {
      nextTick(resolve);
    });
  }

  /**
   Retrieves an array of destroyables from the specified property on the object
   provided, iterates that array invoking each function, then deleting the
   property (clearing the array).
  
   @private
   @param {Object} object an object to search for the destroyable array within
   @param {string} property the property on the object that contains the destroyable array
  */
  function runDestroyablesFor(object, property) {
    let destroyables = object[property];

    if (!destroyables) {
      return;
    }

    for (let i = 0; i < destroyables.length; i++) {
      destroyables[i]();
    }

    delete object[property];
  }

  /**
   Returns whether the passed in string consists only of numeric characters.
  
   @private
   @param {string} n input string
   @returns {boolean} whether the input string consists only of numeric characters
   */
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
});
define('@ember/test-helpers/application', ['exports', '@ember/test-helpers/resolver'], function (exports, _resolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.setApplication = setApplication;
  exports.getApplication = getApplication;


  var __application__;

  /**
    Stores the provided application instance so that tests being ran will be aware of the application under test.
  
    - Required by `setupApplicationContext` method.
    - Used by `setupContext` and `setupRenderingContext` when present.
  
    @public
    @param {Ember.Application} application the application that will be tested
  */
  function setApplication(application) {
    __application__ = application;

    if (!(0, _resolver.getResolver)()) {
      let Resolver = application.Resolver;
      let resolver = Resolver.create({ namespace: application });

      (0, _resolver.setResolver)(resolver);
    }
  }

  /**
    Retrieve the application instance stored by `setApplication`.
  
    @public
    @returns {Ember.Application} the previously stored application instance under test
  */
  function getApplication() {
    return __application__;
  }
});
define('@ember/test-helpers/build-owner', ['exports', 'ember-test-helpers/legacy-0-6-x/build-registry'], function (exports, _buildRegistry) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = buildOwner;


  /**
    Creates an "owner" (an object that either _is_ or duck-types like an
    `Ember.ApplicationInstance`) from the provided options.
  
    If `options.application` is present (e.g. setup by an earlier call to
    `setApplication`) an `Ember.ApplicationInstance` is built via
    `application.buildInstance()`.
  
    If `options.application` is not present, we fall back to using
    `options.resolver` instead (setup via `setResolver`). This creates a mock
    "owner" by using a custom created combination of `Ember.Registry`,
    `Ember.Container`, `Ember._ContainerProxyMixin`, and
    `Ember._RegistryProxyMixin`.
  
    @private
    @param {Ember.Application} [application] the Ember.Application to build an instance from
    @param {Ember.Resolver} [resolver] the resolver to use to back a "mock owner"
    @returns {Promise<Ember.ApplicationInstance>} a promise resolving to the generated "owner"
  */
  function buildOwner(application, resolver) {
    if (application) {
      return application.boot().then(app => app.buildInstance().boot());
    }

    if (!resolver) {
      throw new Error('You must set up the ember-test-helpers environment with either `setResolver` or `setApplication` before running any tests.');
    }

    let { owner } = (0, _buildRegistry.default)(resolver);
    return Ember.RSVP.Promise.resolve(owner);
  }
});
define('@ember/test-helpers/dom/-get-element', ['exports', '@ember/test-helpers/dom/get-root-element'], function (exports, _getRootElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getElement;


  /**
    Used internally by the DOM interaction helpers to find one element.
  
    @private
    @param {string|Element} target the element or selector to retrieve
    @returns {Element} the target or selector
  */
  function getElement(target) {
    if (target.nodeType === Node.ELEMENT_NODE || target.nodeType === Node.DOCUMENT_NODE || target instanceof Window) {
      return target;
    } else if (typeof target === 'string') {
      let rootElement = (0, _getRootElement.default)();

      return rootElement.querySelector(target);
    } else {
      throw new Error('Must use an element or a selector string');
    }
  }
});
define('@ember/test-helpers/dom/-get-elements', ['exports', '@ember/test-helpers/dom/get-root-element'], function (exports, _getRootElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getElements;


  /**
    Used internally by the DOM interaction helpers to find multiple elements.
  
    @private
    @param {string} target the selector to retrieve
    @returns {NodeList} the matched elements
  */
  function getElements(target) {
    if (typeof target === 'string') {
      let rootElement = (0, _getRootElement.default)();

      return rootElement.querySelectorAll(target);
    } else {
      throw new Error('Must use a selector string');
    }
  }
});
define('@ember/test-helpers/dom/-is-focusable', ['exports', '@ember/test-helpers/dom/-is-form-control'], function (exports, _isFormControl) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = isFocusable;


  const FOCUSABLE_TAGS = ['A'];

  /**
    @private
    @param {Element} element the element to check
    @returns {boolean} `true` when the element is focusable, `false` otherwise
  */
  function isFocusable(element) {
    if ((0, _isFormControl.default)(element) || element.isContentEditable || FOCUSABLE_TAGS.indexOf(element.tagName) > -1) {
      return true;
    }

    return element.hasAttribute('tabindex');
  }
});
define('@ember/test-helpers/dom/-is-form-control', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = isFormControl;
  const FORM_CONTROL_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];

  /**
    @private
    @param {Element} element the element to check
    @returns {boolean} `true` when the element is a form control, `false` otherwise
  */
  function isFormControl(element) {
    let { tagName, type } = element;

    if (type === 'hidden') {
      return false;
    }

    return FORM_CONTROL_TAGS.indexOf(tagName) > -1;
  }
});
define("@ember/test-helpers/dom/-to-array", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = toArray;
  /**
    @private
    @param {NodeList} nodelist the nodelist to convert to an array
    @returns {Array} an array
  */
  function toArray(nodelist) {
    let array = new Array(nodelist.length);
    for (let i = 0; i < nodelist.length; i++) {
      array[i] = nodelist[i];
    }

    return array;
  }
});
define('@ember/test-helpers/dom/blur', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/settled', '@ember/test-helpers/dom/-is-focusable', '@ember/test-helpers/-utils'], function (exports, _getElement, _fireEvent, _settled, _isFocusable, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.__blur__ = __blur__;
  exports.default = blur;


  /**
    @private
    @param {Element} element the element to trigger events on
  */
  function __blur__(element) {
    let browserIsNotFocused = document.hasFocus && !document.hasFocus();

    // makes `document.activeElement` be `body`.
    // If the browser is focused, it also fires a blur event
    element.blur();

    // Chrome/Firefox does not trigger the `blur` event if the window
    // does not have focus. If the document does not have focus then
    // fire `blur` event via native event.
    if (browserIsNotFocused) {
      (0, _fireEvent.default)(element, 'blur', { bubbles: false });
      (0, _fireEvent.default)(element, 'focusout');
    }
  }

  /**
    Unfocus the specified target.
  
    Sends a number of events intending to simulate a "real" user unfocusing an
    element.
  
    The following events are triggered (in order):
  
    - `blur`
    - `focusout`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle unfocusing a given element.
  
    @public
    @param {string|Element} [target=document.activeElement] the element or selector to unfocus
    @return {Promise<void>} resolves when settled
  */
  function blur(target = document.activeElement) {
    return (0, _utils.nextTickPromise)().then(() => {
      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`blur('${target}')\`.`);
      }

      if (!(0, _isFocusable.default)(element)) {
        throw new Error(`${target} is not focusable`);
      }

      __blur__(element);

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/click', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/dom/focus', '@ember/test-helpers/settled', '@ember/test-helpers/dom/-is-focusable', '@ember/test-helpers/-utils', '@ember/test-helpers/dom/-is-form-control'], function (exports, _getElement, _fireEvent, _focus, _settled, _isFocusable, _utils, _isFormControl) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.__click__ = __click__;
  exports.default = click;


  /**
    @private
    @param {Element} element the element to click on
  */
  function __click__(element) {
    (0, _fireEvent.default)(element, 'mousedown');

    if ((0, _isFocusable.default)(element)) {
      (0, _focus.__focus__)(element);
    }

    (0, _fireEvent.default)(element, 'mouseup');
    (0, _fireEvent.default)(element, 'click');
  }

  /**
    Clicks on the specified target.
  
    Sends a number of events intending to simulate a "real" user clicking on an
    element.
  
    For non-focusable elements the following events are triggered (in order):
  
    - `mousedown`
    - `mouseup`
    - `click`
  
    For focusable (e.g. form control) elements the following events are triggered
    (in order):
  
    - `mousedown`
    - `focus`
    - `focusin`
    - `mouseup`
    - `click`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle clicking a given element.
  
    @public
    @param {string|Element} target the element or selector to click on
    @return {Promise<void>} resolves when settled
  */
  function click(target) {
    return (0, _utils.nextTickPromise)().then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `click`.');
      }

      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`click('${target}')\`.`);
      }

      let isDisabledFormControl = (0, _isFormControl.default)(element) && element.disabled === true;

      if (!isDisabledFormControl) {
        __click__(element);
      }

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/fill-in', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/-is-form-control', '@ember/test-helpers/dom/focus', '@ember/test-helpers/settled', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/-utils'], function (exports, _getElement, _isFormControl, _focus, _settled, _fireEvent, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = fillIn;


  /**
    Fill the provided text into the `value` property (or set `.innerHTML` when
    the target is a content editable element) then trigger `change` and `input`
    events on the specified target.
  
    @public
    @param {string|Element} target the element or selector to enter text into
    @param {string} text the text to fill into the target element
    @return {Promise<void>} resolves when the application is settled
  */
  function fillIn(target, text) {
    return (0, _utils.nextTickPromise)().then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `fillIn`.');
      }

      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`fillIn('${target}')\`.`);
      }
      let isControl = (0, _isFormControl.default)(element);
      if (!isControl && !element.isContentEditable) {
        throw new Error('`fillIn` is only usable on form controls or contenteditable elements.');
      }

      if (typeof text === 'undefined' || text === null) {
        throw new Error('Must provide `text` when calling `fillIn`.');
      }

      (0, _focus.__focus__)(element);

      if (isControl) {
        element.value = text;
      } else {
        element.innerHTML = text;
      }

      (0, _fireEvent.default)(element, 'input');
      (0, _fireEvent.default)(element, 'change');

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/find-all', ['exports', '@ember/test-helpers/dom/-get-elements', '@ember/test-helpers/dom/-to-array'], function (exports, _getElements, _toArray) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = find;


  /**
    Find all elements matched by the given selector. Equivalent to calling
    `querySelectorAll()` on the test root element.
  
    @public
    @param {string} selector the selector to search for
    @return {Array} array of matched elements
  */
  function find(selector) {
    if (!selector) {
      throw new Error('Must pass a selector to `findAll`.');
    }

    if (arguments.length > 1) {
      throw new Error('The `findAll` test helper only takes a single argument.');
    }

    return (0, _toArray.default)((0, _getElements.default)(selector));
  }
});
define('@ember/test-helpers/dom/find', ['exports', '@ember/test-helpers/dom/-get-element'], function (exports, _getElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = find;


  /**
    Find the first element matched by the given selector. Equivalent to calling
    `querySelector()` on the test root element.
  
    @public
    @param {string} selector the selector to search for
    @return {Element} matched element or null
  */
  function find(selector) {
    if (!selector) {
      throw new Error('Must pass a selector to `find`.');
    }

    if (arguments.length > 1) {
      throw new Error('The `find` test helper only takes a single argument.');
    }

    return (0, _getElement.default)(selector);
  }
});
define('@ember/test-helpers/dom/fire-event', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = fireEvent;


  const DEFAULT_EVENT_OPTIONS = { bubbles: true, cancelable: true };
  const KEYBOARD_EVENT_TYPES = exports.KEYBOARD_EVENT_TYPES = Object.freeze(['keydown', 'keypress', 'keyup']);
  const MOUSE_EVENT_TYPES = ['click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover'];
  const FILE_SELECTION_EVENT_TYPES = ['change'];

  /**
    Internal helper used to build and dispatch events throughout the other DOM helpers.
  
    @private
    @param {Element} element the element to dispatch the event to
    @param {string} eventType the type of event
    @param {Object} [options] additional properties to be set on the event
    @returns {Event} the event that was dispatched
  */
  function fireEvent(element, eventType, options = {}) {
    if (!element) {
      throw new Error('Must pass an element to `fireEvent`');
    }

    let event;
    if (KEYBOARD_EVENT_TYPES.indexOf(eventType) > -1) {
      event = buildKeyboardEvent(eventType, options);
    } else if (MOUSE_EVENT_TYPES.indexOf(eventType) > -1) {
      let rect;
      if (element instanceof Window) {
        rect = element.document.documentElement.getBoundingClientRect();
      } else if (element.nodeType === Node.DOCUMENT_NODE) {
        rect = element.documentElement.getBoundingClientRect();
      } else if (element.nodeType === Node.ELEMENT_NODE) {
        rect = element.getBoundingClientRect();
      } else {
        return;
      }

      let x = rect.left + 1;
      let y = rect.top + 1;
      let simulatedCoordinates = {
        screenX: x + 5, // Those numbers don't really mean anything.
        screenY: y + 95, // They're just to make the screenX/Y be different of clientX/Y..
        clientX: x,
        clientY: y
      };

      event = buildMouseEvent(eventType, Ember.merge(simulatedCoordinates, options));
    } else if (FILE_SELECTION_EVENT_TYPES.indexOf(eventType) > -1 && element.files) {
      event = buildFileEvent(eventType, element, options);
    } else {
      event = buildBasicEvent(eventType, options);
    }

    element.dispatchEvent(event);
    return event;
  }

  // eslint-disable-next-line require-jsdoc
  function buildBasicEvent(type, options = {}) {
    let event = document.createEvent('Events');

    let bubbles = options.bubbles !== undefined ? options.bubbles : true;
    let cancelable = options.cancelable !== undefined ? options.cancelable : true;

    delete options.bubbles;
    delete options.cancelable;

    // bubbles and cancelable are readonly, so they can be
    // set when initializing event
    event.initEvent(type, bubbles, cancelable);
    Ember.merge(event, options);
    return event;
  }

  // eslint-disable-next-line require-jsdoc
  function buildMouseEvent(type, options = {}) {
    let event;
    try {
      event = document.createEvent('MouseEvents');
      let eventOpts = Ember.merge(Ember.merge({}, DEFAULT_EVENT_OPTIONS), options);
      event.initMouseEvent(type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }

  // eslint-disable-next-line require-jsdoc
  function buildKeyboardEvent(type, options = {}) {
    let eventOpts = Ember.merge(Ember.merge({}, DEFAULT_EVENT_OPTIONS), options);
    let event, eventMethodName;

    try {
      event = new KeyboardEvent(type, eventOpts);

      // Property definitions are required for B/C for keyboard event usage
      // If this properties are not defined, when listening for key events
      // keyCode/which will be 0. Also, keyCode and which now are string
      // and if app compare it with === with integer key definitions,
      // there will be a fail.
      //
      // https://w3c.github.io/uievents/#interface-keyboardevent
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
      Object.defineProperty(event, 'keyCode', {
        get() {
          return parseInt(eventOpts.keyCode);
        }
      });

      Object.defineProperty(event, 'which', {
        get() {
          return parseInt(eventOpts.which);
        }
      });

      return event;
    } catch (e) {
      // left intentionally blank
    }

    try {
      event = document.createEvent('KeyboardEvents');
      eventMethodName = 'initKeyboardEvent';
    } catch (e) {
      // left intentionally blank
    }

    if (!event) {
      try {
        event = document.createEvent('KeyEvents');
        eventMethodName = 'initKeyEvent';
      } catch (e) {
        // left intentionally blank
      }
    }

    if (event) {
      event[eventMethodName](type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
    } else {
      event = buildBasicEvent(type, options);
    }

    return event;
  }

  // eslint-disable-next-line require-jsdoc
  function buildFileEvent(type, element, files = []) {
    let event = buildBasicEvent(type);

    if (files.length > 0) {
      Object.defineProperty(files, 'item', {
        value(index) {
          return typeof index === 'number' ? this[index] : null;
        }
      });
      Object.defineProperty(element, 'files', {
        value: files,
        configurable: true
      });
    }

    Object.defineProperty(event, 'target', {
      value: element
    });

    return event;
  }
});
define('@ember/test-helpers/dom/focus', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/settled', '@ember/test-helpers/dom/-is-focusable', '@ember/test-helpers/-utils'], function (exports, _getElement, _fireEvent, _settled, _isFocusable, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.__focus__ = __focus__;
  exports.default = focus;


  /**
    @private
    @param {Element} element the element to trigger events on
  */
  function __focus__(element) {
    let browserIsNotFocused = document.hasFocus && !document.hasFocus();

    // makes `document.activeElement` be `element`. If the browser is focused, it also fires a focus event
    element.focus();

    // Firefox does not trigger the `focusin` event if the window
    // does not have focus. If the document does not have focus then
    // fire `focusin` event as well.
    if (browserIsNotFocused) {
      // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
      (0, _fireEvent.default)(element, 'focus', {
        bubbles: false
      });

      (0, _fireEvent.default)(element, 'focusin');
    }
  }

  /**
    Focus the specified target.
  
    Sends a number of events intending to simulate a "real" user focusing an
    element.
  
    The following events are triggered (in order):
  
    - `focus`
    - `focusin`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle focusing a given element.
  
    @public
    @param {string|Element} target the element or selector to focus
    @return {Promise<void>} resolves when the application is settled
  */
  function focus(target) {
    return (0, _utils.nextTickPromise)().then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `focus`.');
      }

      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`focus('${target}')\`.`);
      }

      if (!(0, _isFocusable.default)(element)) {
        throw new Error(`${target} is not focusable`);
      }

      __focus__(element);

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/get-root-element', ['exports', '@ember/test-helpers/setup-context'], function (exports, _setupContext) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getRootElement;


  /**
    Get the root element of the application under test (usually `#ember-testing`)
  
    @public
    @returns {Element} the root element
  */
  function getRootElement() {
    let context = (0, _setupContext.getContext)();
    let owner = context && context.owner;

    if (!owner) {
      throw new Error('Must setup rendering context before attempting to interact with elements.');
    }

    let rootElementSelector;
    // When the host app uses `setApplication` (instead of `setResolver`) the owner has
    // a `rootElement` set on it with the element id to be used
    if (owner && owner._emberTestHelpersMockOwner === undefined) {
      rootElementSelector = owner.rootElement;
    } else {
      rootElementSelector = '#ember-testing';
    }

    let rootElement = document.querySelector(rootElementSelector);

    return rootElement;
  }
});
define('@ember/test-helpers/dom/tap', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/dom/click', '@ember/test-helpers/settled', '@ember/test-helpers/-utils'], function (exports, _getElement, _fireEvent, _click, _settled, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = tap;


  /**
    Taps on the specified target.
  
    Sends a number of events intending to simulate a "real" user tapping on an
    element.
  
    For non-focusable elements the following events are triggered (in order):
  
    - `touchstart`
    - `touchend`
    - `mousedown`
    - `mouseup`
    - `click`
  
    For focusable (e.g. form control) elements the following events are triggered
    (in order):
  
    - `touchstart`
    - `touchend`
    - `mousedown`
    - `focus`
    - `focusin`
    - `mouseup`
    - `click`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle tapping on a given element.
  
    @public
    @param {string|Element} target the element or selector to tap on
    @param {Object} options the options to be provided to the touch events
    @return {Promise<void>} resolves when settled
  */
  function tap(target, options = {}) {
    return (0, _utils.nextTickPromise)().then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `tap`.');
      }

      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`tap('${target}')\`.`);
      }

      let touchstartEv = (0, _fireEvent.default)(element, 'touchstart', options);
      let touchendEv = (0, _fireEvent.default)(element, 'touchend', options);

      if (!touchstartEv.defaultPrevented && !touchendEv.defaultPrevented) {
        (0, _click.__click__)(element);
      }

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/trigger-event', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/settled', '@ember/test-helpers/-utils'], function (exports, _getElement, _fireEvent, _settled, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = triggerEvent;


  /**
    Triggers an event on the specified target.
  
    @public
    @param {string|Element} target the element or selector to trigger the event on
    @param {string} eventType the type of event to trigger
    @param {Object} options additional properties to be set on the event
    @return {Promise<void>} resolves when the application is settled
  */
  function triggerEvent(target, eventType, options) {
    return (0, _utils.nextTickPromise)().then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `triggerEvent`.');
      }

      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`triggerEvent('${target}', ...)\`.`);
      }

      if (!eventType) {
        throw new Error(`Must provide an \`eventType\` to \`triggerEvent\``);
      }

      (0, _fireEvent.default)(element, eventType, options);

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/trigger-key-event', ['exports', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/fire-event', '@ember/test-helpers/settled', '@ember/test-helpers/-utils'], function (exports, _getElement, _fireEvent, _settled, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = triggerKeyEvent;


  const DEFAULT_MODIFIERS = Object.freeze({
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false
  });

  // This is not a comprehensive list, but it is better than nothing.
  const keyFromKeyCode = {
    8: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    20: 'CapsLock',
    27: 'Escape',
    32: ' ',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    65: 'a',
    66: 'b',
    67: 'c',
    68: 'd',
    69: 'e',
    70: 'f',
    71: 'g',
    72: 'h',
    73: 'i',
    74: 'j',
    75: 'k',
    76: 'l',
    77: 'm',
    78: 'n',
    79: 'o',
    80: 'p',
    81: 'q',
    82: 'r',
    83: 's',
    84: 't',
    85: 'u',
    86: 'v',
    87: 'v',
    88: 'x',
    89: 'y',
    90: 'z',
    91: 'Meta',
    93: 'Meta', // There is two keys that map to meta,
    187: '=',
    189: '-'
  };

  /**
    Calculates the value of KeyboardEvent#key given a keycode and the modifiers.
    Note that this works if the key is pressed in combination with the shift key, but it cannot
    detect if caps lock is enabled.
    @param {number} keycode The keycode of the event.
    @param {object} modifiers The modifiers of the event.
    @returns {string} The key string for the event.
   */
  function keyFromKeyCodeAndModifiers(keycode, modifiers) {
    if (keycode > 64 && keycode < 91) {
      if (modifiers.shiftKey) {
        return String.fromCharCode(keycode);
      } else {
        return String.fromCharCode(keycode).toLocaleLowerCase();
      }
    }
    let key = keyFromKeyCode[keycode];
    if (key) {
      return key;
    }
  }

  /**
   * Infers the keycode from the given key
   * @param {string} key The KeyboardEvent#key string
   * @returns {number} The keycode for the given key
   */
  function keyCodeFromKey(key) {
    let keys = Object.keys(keyFromKeyCode);
    let keyCode = keys.find(keyCode => keyFromKeyCode[keyCode] === key);
    if (!keyCode) {
      keyCode = keys.find(keyCode => keyFromKeyCode[keyCode] === key.toLowerCase());
    }
    return parseInt(keyCode);
  }

  /**
    Triggers a keyboard event of given type in the target element.
    It also requires the developer to provide either a string with the [`key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
    or the numeric [`keyCode`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode) of the pressed key.
    Optionally the user can also provide a POJO with extra modifiers for the event.
  
    @public
    @param {string|Element} target the element or selector to trigger the event on
    @param {'keydown' | 'keyup' | 'keypress'} eventType the type of event to trigger
    @param {number|string} key the `keyCode`(number) or `key`(string) of the event being triggered
    @param {Object} [modifiers] the state of various modifier keys
    @param {boolean} [modifiers.ctrlKey=false] if true the generated event will indicate the control key was pressed during the key event
    @param {boolean} [modifiers.altKey=false] if true the generated event will indicate the alt key was pressed during the key event
    @param {boolean} [modifiers.shiftKey=false] if true the generated event will indicate the shift key was pressed during the key event
    @param {boolean} [modifiers.metaKey=false] if true the generated event will indicate the meta key was pressed during the key event
    @return {Promise<void>} resolves when the application is settled
  */
  function triggerKeyEvent(target, eventType, key, modifiers = DEFAULT_MODIFIERS) {
    return (0, _utils.nextTickPromise)().then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `triggerKeyEvent`.');
      }

      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`triggerKeyEvent('${target}', ...)\`.`);
      }

      if (!eventType) {
        throw new Error(`Must provide an \`eventType\` to \`triggerKeyEvent\``);
      }

      if (_fireEvent.KEYBOARD_EVENT_TYPES.indexOf(eventType) === -1) {
        let validEventTypes = _fireEvent.KEYBOARD_EVENT_TYPES.join(', ');
        throw new Error(`Must provide an \`eventType\` of ${validEventTypes} to \`triggerKeyEvent\` but you passed \`${eventType}\`.`);
      }

      let props;
      if (typeof key === 'number') {
        props = { keyCode: key, which: key, key: keyFromKeyCodeAndModifiers(key, modifiers) };
      } else if (typeof key === 'string' && key.length !== 0) {
        let firstCharacter = key[0];
        if (firstCharacter !== firstCharacter.toUpperCase()) {
          throw new Error(`Must provide a \`key\` to \`triggerKeyEvent\` that starts with an uppercase character but you passed \`${key}\`.`);
        }

        if ((0, _utils.isNumeric)(key)) {
          throw new Error(`Must provide a numeric \`keyCode\` to \`triggerKeyEvent\` but you passed \`${key}\` as a string.`);
        }

        let keyCode = keyCodeFromKey(key);
        props = { keyCode, which: keyCode, key };
      } else {
        throw new Error(`Must provide a \`key\` or \`keyCode\` to \`triggerKeyEvent\``);
      }

      let options = Ember.merge(props, modifiers);

      (0, _fireEvent.default)(element, eventType, options);

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/dom/wait-for', ['exports', '@ember/test-helpers/wait-until', '@ember/test-helpers/dom/-get-element', '@ember/test-helpers/dom/-get-elements', '@ember/test-helpers/dom/-to-array', '@ember/test-helpers/-utils'], function (exports, _waitUntil, _getElement, _getElements, _toArray, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = waitFor;


  /**
    Used to wait for a particular selector to appear in the DOM. Due to the fact
    that it does not wait for general settledness, this is quite useful for testing
    interim DOM states (e.g. loading states, pending promises, etc).
  
    @param {string} selector the selector to wait for
    @param {Object} [options] the options to be used
    @param {number} [options.timeout=1000] the time to wait (in ms) for a match
    @param {number} [options.count=null] the number of elements that should match the provided selector (null means one or more)
    @returns {Element|Array<Element>} the element (or array of elements) that were being waited upon
  */
  function waitFor(selector, { timeout = 1000, count = null, timeoutMessage = 'waitFor timed out' } = {}) {
    return (0, _utils.nextTickPromise)().then(() => {
      if (!selector) {
        throw new Error('Must pass a selector to `waitFor`.');
      }

      let callback;
      if (count !== null) {
        callback = () => {
          let elements = (0, _getElements.default)(selector);
          if (elements.length === count) {
            return (0, _toArray.default)(elements);
          }
        };
      } else {
        callback = () => (0, _getElement.default)(selector);
      }
      return (0, _waitUntil.default)(callback, { timeout, timeoutMessage });
    });
  }
});
define('@ember/test-helpers/global', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = (() => {
    if (typeof self !== 'undefined') {
      return self;
    } else if (typeof window !== 'undefined') {
      return window;
    } else if (typeof global !== 'undefined') {
      return global;
    } else {
      return Function('return this')();
    }
  })();
});
define('@ember/test-helpers/has-ember-version', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = hasEmberVersion;


  /**
    Checks if the currently running Ember version is greater than or equal to the
    specified major and minor version numbers.
  
    @private
    @param {number} major the major version number to compare
    @param {number} minor the minor version number to compare
    @returns {boolean} true if the Ember version is >= MAJOR.MINOR specified, false otherwise
  */
  function hasEmberVersion(major, minor) {
    var numbers = Ember.VERSION.split('-')[0].split('.');
    var actualMajor = parseInt(numbers[0], 10);
    var actualMinor = parseInt(numbers[1], 10);
    return actualMajor > major || actualMajor === major && actualMinor >= minor;
  }
});
define('@ember/test-helpers/index', ['exports', '@ember/test-helpers/resolver', '@ember/test-helpers/application', '@ember/test-helpers/setup-context', '@ember/test-helpers/teardown-context', '@ember/test-helpers/setup-rendering-context', '@ember/test-helpers/teardown-rendering-context', '@ember/test-helpers/setup-application-context', '@ember/test-helpers/teardown-application-context', '@ember/test-helpers/settled', '@ember/test-helpers/wait-until', '@ember/test-helpers/validate-error-handler', '@ember/test-helpers/dom/click', '@ember/test-helpers/dom/tap', '@ember/test-helpers/dom/focus', '@ember/test-helpers/dom/blur', '@ember/test-helpers/dom/trigger-event', '@ember/test-helpers/dom/trigger-key-event', '@ember/test-helpers/dom/fill-in', '@ember/test-helpers/dom/wait-for', '@ember/test-helpers/dom/get-root-element', '@ember/test-helpers/dom/find', '@ember/test-helpers/dom/find-all'], function (exports, _resolver, _application, _setupContext, _teardownContext, _setupRenderingContext, _teardownRenderingContext, _setupApplicationContext, _teardownApplicationContext, _settled, _waitUntil, _validateErrorHandler, _click, _tap, _focus, _blur, _triggerEvent, _triggerKeyEvent, _fillIn, _waitFor, _getRootElement, _find, _findAll) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'setResolver', {
    enumerable: true,
    get: function () {
      return _resolver.setResolver;
    }
  });
  Object.defineProperty(exports, 'getResolver', {
    enumerable: true,
    get: function () {
      return _resolver.getResolver;
    }
  });
  Object.defineProperty(exports, 'getApplication', {
    enumerable: true,
    get: function () {
      return _application.getApplication;
    }
  });
  Object.defineProperty(exports, 'setApplication', {
    enumerable: true,
    get: function () {
      return _application.setApplication;
    }
  });
  Object.defineProperty(exports, 'setupContext', {
    enumerable: true,
    get: function () {
      return _setupContext.default;
    }
  });
  Object.defineProperty(exports, 'getContext', {
    enumerable: true,
    get: function () {
      return _setupContext.getContext;
    }
  });
  Object.defineProperty(exports, 'setContext', {
    enumerable: true,
    get: function () {
      return _setupContext.setContext;
    }
  });
  Object.defineProperty(exports, 'unsetContext', {
    enumerable: true,
    get: function () {
      return _setupContext.unsetContext;
    }
  });
  Object.defineProperty(exports, 'pauseTest', {
    enumerable: true,
    get: function () {
      return _setupContext.pauseTest;
    }
  });
  Object.defineProperty(exports, 'resumeTest', {
    enumerable: true,
    get: function () {
      return _setupContext.resumeTest;
    }
  });
  Object.defineProperty(exports, 'teardownContext', {
    enumerable: true,
    get: function () {
      return _teardownContext.default;
    }
  });
  Object.defineProperty(exports, 'setupRenderingContext', {
    enumerable: true,
    get: function () {
      return _setupRenderingContext.default;
    }
  });
  Object.defineProperty(exports, 'render', {
    enumerable: true,
    get: function () {
      return _setupRenderingContext.render;
    }
  });
  Object.defineProperty(exports, 'clearRender', {
    enumerable: true,
    get: function () {
      return _setupRenderingContext.clearRender;
    }
  });
  Object.defineProperty(exports, 'teardownRenderingContext', {
    enumerable: true,
    get: function () {
      return _teardownRenderingContext.default;
    }
  });
  Object.defineProperty(exports, 'setupApplicationContext', {
    enumerable: true,
    get: function () {
      return _setupApplicationContext.default;
    }
  });
  Object.defineProperty(exports, 'visit', {
    enumerable: true,
    get: function () {
      return _setupApplicationContext.visit;
    }
  });
  Object.defineProperty(exports, 'currentRouteName', {
    enumerable: true,
    get: function () {
      return _setupApplicationContext.currentRouteName;
    }
  });
  Object.defineProperty(exports, 'currentURL', {
    enumerable: true,
    get: function () {
      return _setupApplicationContext.currentURL;
    }
  });
  Object.defineProperty(exports, 'teardownApplicationContext', {
    enumerable: true,
    get: function () {
      return _teardownApplicationContext.default;
    }
  });
  Object.defineProperty(exports, 'settled', {
    enumerable: true,
    get: function () {
      return _settled.default;
    }
  });
  Object.defineProperty(exports, 'isSettled', {
    enumerable: true,
    get: function () {
      return _settled.isSettled;
    }
  });
  Object.defineProperty(exports, 'getSettledState', {
    enumerable: true,
    get: function () {
      return _settled.getSettledState;
    }
  });
  Object.defineProperty(exports, 'waitUntil', {
    enumerable: true,
    get: function () {
      return _waitUntil.default;
    }
  });
  Object.defineProperty(exports, 'validateErrorHandler', {
    enumerable: true,
    get: function () {
      return _validateErrorHandler.default;
    }
  });
  Object.defineProperty(exports, 'click', {
    enumerable: true,
    get: function () {
      return _click.default;
    }
  });
  Object.defineProperty(exports, 'tap', {
    enumerable: true,
    get: function () {
      return _tap.default;
    }
  });
  Object.defineProperty(exports, 'focus', {
    enumerable: true,
    get: function () {
      return _focus.default;
    }
  });
  Object.defineProperty(exports, 'blur', {
    enumerable: true,
    get: function () {
      return _blur.default;
    }
  });
  Object.defineProperty(exports, 'triggerEvent', {
    enumerable: true,
    get: function () {
      return _triggerEvent.default;
    }
  });
  Object.defineProperty(exports, 'triggerKeyEvent', {
    enumerable: true,
    get: function () {
      return _triggerKeyEvent.default;
    }
  });
  Object.defineProperty(exports, 'fillIn', {
    enumerable: true,
    get: function () {
      return _fillIn.default;
    }
  });
  Object.defineProperty(exports, 'waitFor', {
    enumerable: true,
    get: function () {
      return _waitFor.default;
    }
  });
  Object.defineProperty(exports, 'getRootElement', {
    enumerable: true,
    get: function () {
      return _getRootElement.default;
    }
  });
  Object.defineProperty(exports, 'find', {
    enumerable: true,
    get: function () {
      return _find.default;
    }
  });
  Object.defineProperty(exports, 'findAll', {
    enumerable: true,
    get: function () {
      return _findAll.default;
    }
  });
});
define("@ember/test-helpers/resolver", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.setResolver = setResolver;
  exports.getResolver = getResolver;
  var __resolver__;

  /**
    Stores the provided resolver instance so that tests being ran can resolve
    objects in the same way as a normal application.
  
    Used by `setupContext` and `setupRenderingContext` as a fallback when `setApplication` was _not_ used.
  
    @public
    @param {Ember.Resolver} resolver the resolver to be used for testing
  */
  function setResolver(resolver) {
    __resolver__ = resolver;
  }

  /**
    Retrieve the resolver instance stored by `setResolver`.
  
    @public
    @returns {Ember.Resolver} the previously stored resolver
  */
  function getResolver() {
    return __resolver__;
  }
});
define('@ember/test-helpers/settled', ['exports', '@ember/test-helpers/-utils', '@ember/test-helpers/wait-until'], function (exports, _utils, _waitUntil) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._teardownAJAXHooks = _teardownAJAXHooks;
  exports._setupAJAXHooks = _setupAJAXHooks;
  exports.getSettledState = getSettledState;
  exports.isSettled = isSettled;
  exports.default = settled;


  // Ember internally tracks AJAX requests in the same way that we do here for
  // legacy style "acceptance" tests using the `ember-testing.js` asset provided
  // by emberjs/ember.js itself. When `@ember/test-helpers`'s `settled` utility
  // is used in a legacy acceptance test context any pending AJAX requests are
  // not properly considered during the `isSettled` check below.
  //
  // This utilizes a local utility method present in Ember since around 2.8.0 to
  // properly consider pending AJAX requests done within legacy acceptance tests.
  const _internalPendingRequests = (() => {
    if (Ember.__loader.registry['ember-testing/test/pending_requests']) {
      // Ember <= 3.1
      return Ember.__loader.require('ember-testing/test/pending_requests').pendingRequests;
    } else if (Ember.__loader.registry['ember-testing/lib/test/pending_requests']) {
      // Ember >= 3.2
      return Ember.__loader.require('ember-testing/lib/test/pending_requests').pendingRequests;
    }

    return () => 0;
  })();

  let requests;

  /**
    @private
    @returns {number} the count of pending requests
  */
  function pendingRequests() {
    let localRequestsPending = requests !== undefined ? requests.length : 0;
    let internalRequestsPending = _internalPendingRequests();

    return localRequestsPending + internalRequestsPending;
  }

  /**
    @private
    @param {Event} event (unused)
    @param {XMLHTTPRequest} xhr the XHR that has initiated a request
  */
  function incrementAjaxPendingRequests(event, xhr) {
    requests.push(xhr);
  }

  /**
    @private
    @param {Event} event (unused)
    @param {XMLHTTPRequest} xhr the XHR that has initiated a request
  */
  function decrementAjaxPendingRequests(event, xhr) {
    // In most Ember versions to date (current version is 2.16) RSVP promises are
    // configured to flush in the actions queue of the Ember run loop, however it
    // is possible that in the future this changes to use "true" micro-task
    // queues.
    //
    // The entire point here, is that _whenever_ promises are resolved will be
    // before the next run of the JS event loop. Then in the next event loop this
    // counter will decrement. In the specific case of AJAX, this means that any
    // promises chained off of `$.ajax` will properly have their `.then` called
    // _before_ this is decremented (and testing continues)
    (0, _utils.nextTick)(() => {
      for (let i = 0; i < requests.length; i++) {
        if (xhr === requests[i]) {
          requests.splice(i, 1);
        }
      }
    }, 0);
  }

  /**
    Clears listeners that were previously setup for `ajaxSend` and `ajaxComplete`.
  
    @private
  */
  function _teardownAJAXHooks() {
    if (!Ember.$) {
      return;
    }

    Ember.$(document).off('ajaxSend', incrementAjaxPendingRequests);
    Ember.$(document).off('ajaxComplete', decrementAjaxPendingRequests);
  }

  /**
    Sets up listeners for `ajaxSend` and `ajaxComplete`.
  
    @private
  */
  function _setupAJAXHooks() {
    requests = [];

    if (!Ember.$) {
      return;
    }

    Ember.$(document).on('ajaxSend', incrementAjaxPendingRequests);
    Ember.$(document).on('ajaxComplete', decrementAjaxPendingRequests);
  }

  let _internalCheckWaiters;
  if (Ember.__loader.registry['ember-testing/test/waiters']) {
    // Ember <= 3.1
    _internalCheckWaiters = Ember.__loader.require('ember-testing/test/waiters').checkWaiters;
  } else if (Ember.__loader.registry['ember-testing/lib/test/waiters']) {
    // Ember >= 3.2
    _internalCheckWaiters = Ember.__loader.require('ember-testing/lib/test/waiters').checkWaiters;
  }

  /**
    @private
    @returns {boolean} true if waiters are still pending
  */
  function checkWaiters() {
    if (_internalCheckWaiters) {
      return _internalCheckWaiters();
    } else if (Ember.Test.waiters) {
      if (Ember.Test.waiters.any(([context, callback]) => !callback.call(context))) {
        return true;
      }
    }

    return false;
  }

  /**
    Check various settledness metrics, and return an object with the following properties:
  
    * `hasRunLoop` - Checks if a run-loop has been started. If it has, this will
      be `true` otherwise it will be `false`.
    * `hasPendingTimers` - Checks if there are scheduled timers in the run-loop.
      These pending timers are primarily registered by `Ember.run.schedule`. If
      there are pending timers, this will be `true`, otherwise `false`.
    * `hasPendingWaiters` - Checks if any registered test waiters are still
      pending (e.g. the waiter returns `true`). If there are pending waiters,
      this will be `true`, otherwise `false`.
    * `hasPendingRequests` - Checks if there are pending AJAX requests (based on
      `ajaxSend` / `ajaxComplete` events triggered by `jQuery.ajax`). If there
      are pending requests, this will be `true`, otherwise `false`.
    * `pendingRequestCount` - The count of pending AJAX requests.
  
    @public
    @returns {Object} object with properties for each of the metrics used to determine settledness
  */
  function getSettledState() {
    let pendingRequestCount = pendingRequests();

    return {
      hasPendingTimers: Boolean(Ember.run.hasScheduledTimers()),
      hasRunLoop: Boolean(Ember.run.currentRunLoop),
      hasPendingWaiters: checkWaiters(),
      hasPendingRequests: pendingRequestCount > 0,
      pendingRequestCount
    };
  }

  /**
    Checks various settledness metrics (via `getSettledState()`) to determine if things are settled or not.
  
    Settled generally means that there are no pending timers, no pending waiters,
    no pending AJAX requests, and no current run loop. However, new settledness
    metrics may be added and used as they become available.
  
    @public
    @returns {boolean} `true` if settled, `false` otherwise
  */
  function isSettled() {
    let { hasPendingTimers, hasRunLoop, hasPendingRequests, hasPendingWaiters } = getSettledState();

    if (hasPendingTimers || hasRunLoop || hasPendingRequests || hasPendingWaiters) {
      return false;
    }

    return true;
  }

  /**
    Returns a promise that resolves when in a settled state (see `isSettled` for
    a definition of "settled state").
  
    @public
    @returns {Promise<void>} resolves when settled
  */
  function settled() {
    return (0, _waitUntil.default)(isSettled, { timeout: Infinity });
  }
});
define('@ember/test-helpers/setup-application-context', ['exports', '@ember/test-helpers/-utils', '@ember/test-helpers/setup-context', '@ember/test-helpers/has-ember-version', '@ember/test-helpers/settled'], function (exports, _utils, _setupContext, _hasEmberVersion, _settled) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.visit = visit;
  exports.currentRouteName = currentRouteName;
  exports.currentURL = currentURL;
  exports.default = setupApplicationContext;


  /**
    Navigate the application to the provided URL.
  
    @public
    @returns {Promise<void>} resolves when settled
  */
  function visit() {
    let context = (0, _setupContext.getContext)();
    let { owner } = context;

    return (0, _utils.nextTickPromise)().then(() => {
      return owner.visit(...arguments);
    }).then(() => {
      if (EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false) {
        context.element = document.querySelector('#ember-testing > .ember-view');
      } else {
        context.element = document.querySelector('#ember-testing');
      }
    }).then(_settled.default);
  }

  /**
    @public
    @returns {string} the currently active route name
  */
  /* globals EmberENV */
  function currentRouteName() {
    let { owner } = (0, _setupContext.getContext)();
    let router = owner.lookup('router:main');
    return Ember.get(router, 'currentRouteName');
  }

  const HAS_CURRENT_URL_ON_ROUTER = (0, _hasEmberVersion.default)(2, 13);

  /**
    @public
    @returns {string} the applications current url
  */
  function currentURL() {
    let { owner } = (0, _setupContext.getContext)();
    let router = owner.lookup('router:main');

    if (HAS_CURRENT_URL_ON_ROUTER) {
      return Ember.get(router, 'currentURL');
    } else {
      return Ember.get(router, 'location').getURL();
    }
  }

  /**
    Used by test framework addons to setup the provided context for working with
    an application (e.g. routing).
  
    `setupContext` must have been ran on the provided context prior to calling
    `setupApplicatinContext`.
  
    Sets up the basic framework used by application tests.
  
    @public
    @param {Object} context the context to setup
    @returns {Promise<Object>} resolves with the context that was setup
  */
  function setupApplicationContext() {
    return (0, _utils.nextTickPromise)();
  }
});
define('@ember/test-helpers/setup-context', ['exports', '@ember/test-helpers/build-owner', '@ember/test-helpers/settled', '@ember/test-helpers/global', '@ember/test-helpers/resolver', '@ember/test-helpers/application', '@ember/test-helpers/-utils'], function (exports, _buildOwner, _settled, _global, _resolver, _application, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.CLEANUP = undefined;
  exports.setContext = setContext;
  exports.getContext = getContext;
  exports.unsetContext = unsetContext;
  exports.pauseTest = pauseTest;
  exports.resumeTest = resumeTest;

  exports.default = function (context, options = {}) {
    Ember.testing = true;
    setContext(context);

    let contextGuid = Ember.guidFor(context);
    CLEANUP[contextGuid] = [];

    return (0, _utils.nextTickPromise)().then(() => {
      let application = (0, _application.getApplication)();
      if (application) {
        return application.boot();
      }
    }).then(() => {
      let testElementContainer = document.getElementById('ember-testing-container');
      let fixtureResetValue = testElementContainer.innerHTML;

      // push this into the final cleanup bucket, to be ran _after_ the owner
      // is destroyed and settled (e.g. flushed run loops, etc)
      CLEANUP[contextGuid].push(() => {
        testElementContainer.innerHTML = fixtureResetValue;
      });

      let { resolver } = options;

      // This handles precendence, specifying a specific option of
      // resolver always trumps whatever is auto-detected, then we fallback to
      // the suite-wide registrations
      //
      // At some later time this can be extended to support specifying a custom
      // engine or application...
      if (resolver) {
        return (0, _buildOwner.default)(null, resolver);
      }

      return (0, _buildOwner.default)((0, _application.getApplication)(), (0, _resolver.getResolver)());
    }).then(owner => {
      Object.defineProperty(context, 'owner', {
        configurable: true,
        enumerable: true,
        value: owner,
        writable: false
      });

      Object.defineProperty(context, 'set', {
        configurable: true,
        enumerable: true,
        value(key, value) {
          let ret = Ember.run(function () {
            return Ember.set(context, key, value);
          });

          return ret;
        },
        writable: false
      });

      Object.defineProperty(context, 'setProperties', {
        configurable: true,
        enumerable: true,
        value(hash) {
          let ret = Ember.run(function () {
            return Ember.setProperties(context, hash);
          });

          return ret;
        },
        writable: false
      });

      Object.defineProperty(context, 'get', {
        configurable: true,
        enumerable: true,
        value(key) {
          return Ember.get(context, key);
        },
        writable: false
      });

      Object.defineProperty(context, 'getProperties', {
        configurable: true,
        enumerable: true,
        value(...args) {
          return Ember.getProperties(context, args);
        },
        writable: false
      });

      let resume;
      context.resumeTest = function resumeTest() {
        (true && !(resume) && Ember.assert('Testing has not been paused. There is nothing to resume.', resume));

        resume();
        _global.default.resumeTest = resume = undefined;
      };

      context.pauseTest = function pauseTest() {
        console.info('Testing paused. Use `resumeTest()` to continue.'); // eslint-disable-line no-console

        return new Ember.RSVP.Promise(resolve => {
          resume = resolve;
          _global.default.resumeTest = resumeTest;
        }, 'TestAdapter paused promise');
      };

      (0, _settled._setupAJAXHooks)();

      return context;
    });
  };

  let __test_context__;

  /**
    Stores the provided context as the "global testing context".
  
    Generally setup automatically by `setupContext`.
  
    @public
    @param {Object} context the context to use
  */
  function setContext(context) {
    __test_context__ = context;
  }

  /**
    Retrive the "global testing context" as stored by `setContext`.
  
    @public
    @returns {Object} the previously stored testing context
  */
  function getContext() {
    return __test_context__;
  }

  /**
    Clear the "global testing context".
  
    Generally invoked from `teardownContext`.
  
    @public
  */
  function unsetContext() {
    __test_context__ = undefined;
  }

  /**
   * Returns a promise to be used to pauses the current test (due to being
   * returned from the test itself).  This is useful for debugging while testing
   * or for test-driving.  It allows you to inspect the state of your application
   * at any point.
   *
   * The test framework wrapper (e.g. `ember-qunit` or `ember-mocha`) should
   * ensure that when `pauseTest()` is used, any framework specific test timeouts
   * are disabled.
   *
   * @public
   * @returns {Promise<void>} resolves _only_ when `resumeTest()` is invoked
   * @example <caption>Usage via ember-qunit</caption>
   *
   * import { setupRenderingTest } from 'ember-qunit';
   * import { render, click, pauseTest } from '@ember/test-helpers';
   *
   *
   * module('awesome-sauce', function(hooks) {
   *   setupRenderingTest(hooks);
   *
   *   test('does something awesome', async function(assert) {
   *     await render(hbs`{{awesome-sauce}}`);
   *
   *     // added here to visualize / interact with the DOM prior
   *     // to the interaction below
   *     await pauseTest();
   *
   *     click('.some-selector');
   *
   *     assert.equal(this.element.textContent, 'this sauce is awesome!');
   *   });
   * });
   */
  function pauseTest() {
    let context = getContext();

    if (!context || typeof context.pauseTest !== 'function') {
      throw new Error('Cannot call `pauseTest` without having first called `setupTest` or `setupRenderingTest`.');
    }

    return context.pauseTest();
  }

  /**
    Resumes a test previously paused by `await pauseTest()`.
  
    @public
  */
  function resumeTest() {
    let context = getContext();

    if (!context || typeof context.resumeTest !== 'function') {
      throw new Error('Cannot call `resumeTest` without having first called `setupTest` or `setupRenderingTest`.');
    }

    context.resumeTest();
  }

  const CLEANUP = exports.CLEANUP = Object.create(null);

  /**
    Used by test framework addons to setup the provided context for testing.
  
    Responsible for:
  
    - sets the "global testing context" to the provided context (`setContext`)
    - create an owner object and set it on the provided context (e.g. `this.owner`)
    - setup `this.set`, `this.setProperties`, `this.get`, and `this.getProperties` to the provided context
    - setting up AJAX listeners
    - setting up `pauseTest` (also available as `this.pauseTest()`) and `resumeTest` helpers
  
    @public
    @param {Object} context the context to setup
    @param {Object} [options] options used to override defaults
    @param {Resolver} [options.resolver] a resolver to use for customizing normal resolution
    @returns {Promise<Object>} resolves with the context that was setup
  */
});
define('@ember/test-helpers/setup-rendering-context', ['exports', '@ember/test-helpers/global', '@ember/test-helpers/setup-context', '@ember/test-helpers/-utils', '@ember/test-helpers/settled', '@ember/test-helpers/dom/get-root-element'], function (exports, _global, _setupContext, _utils, _settled, _getRootElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RENDERING_CLEANUP = undefined;
  exports.render = render;
  exports.clearRender = clearRender;
  exports.default = setupRenderingContext;
  /* globals EmberENV */
  const RENDERING_CLEANUP = exports.RENDERING_CLEANUP = Object.create(null);
  const OUTLET_TEMPLATE = Ember.HTMLBars.template({
    "id": "em3WhaQV",
    "block": "{\"symbols\":[],\"statements\":[[1,[21,\"outlet\"],false]],\"hasEval\":false}",
    "meta": {}
  });
  const EMPTY_TEMPLATE = Ember.HTMLBars.template({
    "id": "xOcW61lH",
    "block": "{\"symbols\":[],\"statements\":[],\"hasEval\":false}",
    "meta": {}
  });

  /**
    @private
    @param {Ember.ApplicationInstance} owner the current owner instance
    @returns {Template} a template representing {{outlet}}
  */
  function lookupOutletTemplate(owner) {
    let OutletTemplate = owner.lookup('template:-outlet');
    if (!OutletTemplate) {
      owner.register('template:-outlet', OUTLET_TEMPLATE);
      OutletTemplate = owner.lookup('template:-outlet');
    }

    return OutletTemplate;
  }

  /**
    @private
    @param {string} [selector] the selector to search for relative to element
    @returns {jQuery} a jQuery object representing the selector (or element itself if no selector)
  */
  function jQuerySelector(selector) {
    let { element } = (0, _setupContext.getContext)();

    // emulates Ember internal behavor of `this.$` in a component
    // https://github.com/emberjs/ember.js/blob/v2.5.1/packages/ember-views/lib/views/states/has_element.js#L18
    return selector ? _global.default.jQuery(selector, element) : _global.default.jQuery(element);
  }

  let templateId = 0;
  /**
    Renders the provided template and appends it to the DOM.
  
    @public
    @param {CompiledTemplate} template the template to render
    @returns {Promise<void>} resolves when settled
  */
  function render(template) {
    let context = (0, _setupContext.getContext)();

    if (!template) {
      throw new Error('you must pass a template to `render()`');
    }

    return (0, _utils.nextTickPromise)().then(() => {
      let { owner } = context;

      let toplevelView = owner.lookup('-top-level-view:main');
      let OutletTemplate = lookupOutletTemplate(owner);
      templateId += 1;
      let templateFullName = `template:-undertest-${templateId}`;
      owner.register(templateFullName, template);

      let outletState = {
        render: {
          owner,
          into: undefined,
          outlet: 'main',
          name: 'application',
          controller: undefined,
          ViewClass: undefined,
          template: OutletTemplate
        },

        outlets: {
          main: {
            render: {
              owner,
              into: undefined,
              outlet: 'main',
              name: 'index',
              controller: context,
              ViewClass: undefined,
              template: owner.lookup(templateFullName),
              outlets: {}
            },
            outlets: {}
          }
        }
      };
      toplevelView.setOutletState(outletState);

      // returning settled here because the actual rendering does not happen until
      // the renderer detects it is dirty (which happens on backburner's end
      // hook), see the following implementation details:
      //
      // * [view:outlet](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/views/outlet.js#L129-L145) manually dirties its own tag upon `setOutletState`
      // * [backburner's custom end hook](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/renderer.js#L145-L159) detects that the current revision of the root is no longer the latest, and triggers a new rendering transaction
      return (0, _settled.default)();
    });
  }

  /**
    Clears any templates previously rendered. This is commonly used for
    confirming behavior that is triggered by teardown (e.g.
    `willDestroyElement`).
  
    @public
    @returns {Promise<void>} resolves when settled
  */
  function clearRender() {
    let context = (0, _setupContext.getContext)();

    if (!context || typeof context.clearRender !== 'function') {
      throw new Error('Cannot call `clearRender` without having first called `setupRenderingContext`.');
    }

    return render(EMPTY_TEMPLATE);
  }

  /**
    Used by test framework addons to setup the provided context for rendering.
  
    `setupContext` must have been ran on the provided context
    prior to calling `setupRenderingContext`.
  
    Responsible for:
  
    - Setup the basic framework used for rendering by the
      `render` helper.
    - Ensuring the event dispatcher is properly setup.
    - Setting `this.element` to the root element of the testing
      container (things rendered via `render` will go _into_ this
      element).
  
    @public
    @param {Object} context the context to setup for rendering
    @returns {Promise<Object>} resolves with the context that was setup
  */
  function setupRenderingContext(context) {
    let contextGuid = Ember.guidFor(context);
    RENDERING_CLEANUP[contextGuid] = [];

    return (0, _utils.nextTickPromise)().then(() => {
      let { owner } = context;

      // these methods being placed on the context itself will be deprecated in
      // a future version (no giant rush) to remove some confusion about which
      // is the "right" way to things...
      Object.defineProperty(context, 'render', {
        configurable: true,
        enumerable: true,
        value: render,
        writable: false
      });
      Object.defineProperty(context, 'clearRender', {
        configurable: true,
        enumerable: true,
        value: clearRender,
        writable: false
      });

      if (_global.default.jQuery) {
        Object.defineProperty(context, '$', {
          configurable: true,
          enumerable: true,
          value: jQuerySelector,
          writable: false
        });
      }

      // When the host app uses `setApplication` (instead of `setResolver`) the event dispatcher has
      // already been setup via `applicationInstance.boot()` in `./build-owner`. If using
      // `setResolver` (instead of `setApplication`) a "mock owner" is created by extending
      // `Ember._ContainerProxyMixin` and `Ember._RegistryProxyMixin` in this scenario we need to
      // manually start the event dispatcher.
      if (owner._emberTestHelpersMockOwner) {
        let dispatcher = owner.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
        dispatcher.setup({}, '#ember-testing');
      }

      let OutletView = owner.factoryFor ? owner.factoryFor('view:-outlet') : owner._lookupFactory('view:-outlet');
      let toplevelView = OutletView.create();

      owner.register('-top-level-view:main', {
        create() {
          return toplevelView;
        }
      });

      // initially render a simple empty template
      return render(EMPTY_TEMPLATE).then(() => {
        Ember.run(toplevelView, 'appendTo', (0, _getRootElement.default)());

        return (0, _settled.default)();
      });
    }).then(() => {
      Object.defineProperty(context, 'element', {
        configurable: true,
        enumerable: true,
        // ensure the element is based on the wrapping toplevel view
        // Ember still wraps the main application template with a
        // normal tagged view
        //
        // In older Ember versions (2.4) the element itself is not stable,
        // and therefore we cannot update the `this.element` until after the
        // rendering is completed
        value: EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false ? (0, _getRootElement.default)().querySelector('.ember-view') : (0, _getRootElement.default)(),

        writable: false
      });

      return context;
    });
  }
});
define('@ember/test-helpers/teardown-application-context', ['exports', '@ember/test-helpers/settled'], function (exports, _settled) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function () {
    return (0, _settled.default)();
  };
});
define('@ember/test-helpers/teardown-context', ['exports', '@ember/test-helpers/settled', '@ember/test-helpers/setup-context', '@ember/test-helpers/-utils'], function (exports, _settled, _setupContext, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = teardownContext;


  /**
    Used by test framework addons to tear down the provided context after testing is completed.
  
    Responsible for:
  
    - un-setting the "global testing context" (`unsetContext`)
    - destroy the contexts owner object
    - remove AJAX listeners
  
    @public
    @param {Object} context the context to setup
    @returns {Promise<void>} resolves when settled
  */
  function teardownContext(context) {
    return (0, _utils.nextTickPromise)().then(() => {
      let { owner } = context;

      (0, _settled._teardownAJAXHooks)();

      Ember.run(owner, 'destroy');
      Ember.testing = false;

      (0, _setupContext.unsetContext)();

      return (0, _settled.default)();
    }).finally(() => {
      let contextGuid = Ember.guidFor(context);

      (0, _utils.runDestroyablesFor)(_setupContext.CLEANUP, contextGuid);

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/teardown-rendering-context', ['exports', '@ember/test-helpers/setup-rendering-context', '@ember/test-helpers/-utils', '@ember/test-helpers/settled'], function (exports, _setupRenderingContext, _utils, _settled) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = teardownRenderingContext;


  /**
    Used by test framework addons to tear down the provided context after testing is completed.
  
    Responsible for:
  
    - resetting the `ember-testing-container` to its original state (the value
      when `setupRenderingContext` was called).
  
    @public
    @param {Object} context the context to setup
    @returns {Promise<void>} resolves when settled
  */
  function teardownRenderingContext(context) {
    return (0, _utils.nextTickPromise)().then(() => {
      let contextGuid = Ember.guidFor(context);

      (0, _utils.runDestroyablesFor)(_setupRenderingContext.RENDERING_CLEANUP, contextGuid);

      return (0, _settled.default)();
    });
  }
});
define('@ember/test-helpers/validate-error-handler', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = validateErrorHandler;

  const VALID = Object.freeze({ isValid: true, message: null });
  const INVALID = Object.freeze({
    isValid: false,
    message: 'error handler should have re-thrown the provided error'
  });

  /**
   * Validate the provided error handler to confirm that it properly re-throws
   * errors when `Ember.testing` is true.
   *
   * This is intended to be used by test framework hosts (or other libraries) to
   * ensure that `Ember.onerror` is properly configured. Without a check like
   * this, `Ember.onerror` could _easily_ swallow all errors and make it _seem_
   * like everything is just fine (and have green tests) when in reality
   * everything is on fire...
   *
   * @public
   * @param {Function} [callback=Ember.onerror] the callback to validate
   * @returns {Object} object with `isValid` and `message`
   *
   * @example <caption>Example implementation for `ember-qunit`</caption>
   *
   * import { validateErrorHandler } from '@ember/test-helpers';
   *
   * test('Ember.onerror is functioning properly', function(assert) {
   *   let result = validateErrorHandler();
   *   assert.ok(result.isValid, result.message);
   * });
   */
  function validateErrorHandler(callback = Ember.onerror) {
    if (callback === undefined || callback === null) {
      return VALID;
    }

    let error = new Error('Error handler validation error!');

    let originalEmberTesting = Ember.testing;
    Ember.testing = true;
    try {
      callback(error);
    } catch (e) {
      if (e === error) {
        return VALID;
      }
    } finally {
      Ember.testing = originalEmberTesting;
    }

    return INVALID;
  }
});
define('@ember/test-helpers/wait-until', ['exports', '@ember/test-helpers/-utils'], function (exports, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = waitUntil;


  const TIMEOUTS = [0, 1, 2, 5, 7];
  const MAX_TIMEOUT = 10;

  /**
    Wait for the provided callback to return a truthy value.
  
    This does not leverage `settled()`, and as such can be used to manage async
    while _not_ settled (e.g. "loading" or "pending" states).
  
    @public
    @param {Function} callback the callback to use for testing when waiting should stop
    @param {Object} [options] options used to override defaults
    @param {number} [options.timeout=1000] the maximum amount of time to wait
    @param {string} [options.timeoutMessage='waitUntil timed out'] the message to use in the reject on timeout
    @returns {Promise} resolves with the callback value when it returns a truthy value
  */
  function waitUntil(callback, options = {}) {
    let timeout = 'timeout' in options ? options.timeout : 1000;
    let timeoutMessage = 'timeoutMessage' in options ? options.timeoutMessage : 'waitUntil timed out';

    // creating this error eagerly so it has the proper invocation stack
    let waitUntilTimedOut = new Error(timeoutMessage);

    return new Ember.RSVP.Promise(function (resolve, reject) {
      let time = 0;

      // eslint-disable-next-line require-jsdoc
      function scheduleCheck(timeoutsIndex) {
        let interval = TIMEOUTS[timeoutsIndex];
        if (interval === undefined) {
          interval = MAX_TIMEOUT;
        }

        (0, _utils.futureTick)(function () {
          time += interval;

          let value;
          try {
            value = callback();
          } catch (error) {
            reject(error);
          }

          if (value) {
            resolve(value);
          } else if (time < timeout) {
            scheduleCheck(timeoutsIndex + 1);
          } else {
            reject(waitUntilTimedOut);
          }
        }, interval);
      }

      scheduleCheck(0);
    });
  }
});
define('dummy/tests/acceptance/ember-shepherd-test', ['qunit', '@ember/test-helpers', 'ember-qunit', 'ember-sinon-qunit/test-support/test', 'dummy/tests/data'], function (_qunit, _testHelpers, _emberQunit, _test, _data) {
  'use strict';

  (0, _qunit.module)('Acceptance | Tour functionality tests', function (hooks) {
    let tour;

    (0, _emberQunit.setupApplicationTest)(hooks);

    hooks.beforeEach(function () {
      tour = this.owner.lookup('service:tour');

      tour.set('confirmCancel', false);
      tour.set('modal', false);
    });

    (0, _qunit.test)('Shows cancel link', async function (assert) {
      await (0, _testHelpers.visit)('/');

      await (0, _testHelpers.click)('.toggleHelpModal');

      const cancelLink = document.querySelector('.shepherd-cancel-link');
      assert.ok(cancelLink, 'Cancel link shown');
    });

    (0, _qunit.test)('Hides cancel link', async function (assert) {
      const defaults = {
        classes: 'shepherd-theme-arrows test-defaults',
        showCancelLink: false
      };

      const steps = [{
        id: 'step-without-cancel-link',
        options: {
          attachTo: '.first-element bottom',
          buttons: [_data.builtInButtons.cancel, _data.builtInButtons.next],
          showCancelLink: false
        }
      }];

      await (0, _testHelpers.visit)('/');

      tour.set('defaults', defaults);
      tour.set('steps', steps);

      await (0, _testHelpers.click)('.toggleHelpModal');

      assert.notOk(document.querySelector('.shepherd-element a.shepherd-cancel-link'));
    });

    (0, _qunit.test)('Cancel link cancels the tour', async function (assert) {
      await (0, _testHelpers.visit)('/');

      await (0, _testHelpers.click)('.toggleHelpModal');

      assert.ok(document.body.classList.contains('shepherd-active'), 'Body has class of shepherd-active, when shepherd becomes active');

      await (0, _testHelpers.click)(document.querySelector('.shepherd-content a.shepherd-cancel-link'));

      assert.notOk(document.body.classList.contains('shepherd-active'), 'Body does not have class of shepherd-active, when shepherd becomes inactive');
    });

    (0, _test.default)('Confirm cancel makes you confirm cancelling the tour', async function (assert) {
      const stub = this.stub(window, 'confirm');

      await (0, _testHelpers.visit)('/');

      tour.set('confirmCancel', true);
      tour.set('steps', _data.steps);

      await (0, _testHelpers.click)('.toggleHelpModal');

      assert.ok(document.body.classList.contains('shepherd-active'), 'Body has class of shepherd-active, when shepherd becomes active');

      await (0, _testHelpers.click)(document.querySelector('.shepherd-element a.shepherd-cancel-link'));

      assert.ok(stub.calledOnce);
    });

    (0, _qunit.test)('Modal page contents', async function (assert) {
      assert.expect(3);

      await (0, _testHelpers.visit)('/');

      await (0, _testHelpers.click)('.toggleHelpModal');

      assert.ok(document.body.classList.contains('shepherd-active'), 'Body gets class of shepherd-active, when shepherd becomes active');
      assert.equal(document.querySelectorAll('.shepherd-enabled').length, 1, 'attachTo element has the shepherd-enabled class');
      assert.ok(document.querySelector('#shepherdOverlay'), '#shepherdOverlay exists, since modal');
    });

    (0, _qunit.test)('Non-modal page contents', async function (assert) {
      assert.expect(3);

      await (0, _testHelpers.visit)('/');

      await (0, _testHelpers.click)('.toggleHelpNonmodal');

      assert.ok(document.body.classList.contains('shepherd-active'), 'Body gets class of shepherd-active, when shepherd becomes active');
      assert.equal(document.querySelectorAll('.shepherd-enabled').length, 1, 'attachTo element has the shepherd-enabled class');
      assert.notOk(document.querySelector('#shepherdOverlay'), '#shepherdOverlay should not exist, since non-modal');
    });

    (0, _qunit.test)('Tour next, back, and cancel buttons work', async function (assert) {
      assert.expect(3);

      await (0, _testHelpers.visit)('/');

      await (0, _testHelpers.click)('.toggleHelpModal');
      await (0, _testHelpers.click)(document.querySelector('.shepherd-element[style*="display: block"] .next-button'));
      assert.ok(document.querySelector('.shepherd-element[style*="display: block"] .back-button'), 'Ensure that the back button appears');

      await (0, _testHelpers.click)(document.querySelector('.shepherd-element[style*="display: block"] .back-button'));
      assert.notOk(document.querySelector('.shepherd-element[style*="display: block"] .back-button'), 'Ensure that the back button disappears');

      await (0, _testHelpers.click)(document.querySelector('.shepherd-element[style*="display: block"] .cancel-button'));
      assert.notOk(document.querySelector('.shepherd-element [class^=shepherd-button]'), 'Ensure that all buttons are gone, after exit');
    });

    (0, _qunit.test)('Highlight applied', async function (assert) {
      assert.expect(2);

      const steps = [{
        id: 'test-highlight',
        options: {
          attachTo: '.first-element bottom',
          buttons: [_data.builtInButtons.cancel, _data.builtInButtons.next],
          highlightClass: 'highlight',
          text: ['Testing highlight']
        }
      }];

      await (0, _testHelpers.visit)('/');

      tour.set('steps', steps);
      tour.set('modal', true);

      await (0, _testHelpers.click)('.toggleHelpModal');

      assert.ok(document.querySelector('.highlight'), 'currentElement highlighted');

      await (0, _testHelpers.click)(document.querySelector('.shepherd-content .cancel-button'));

      assert.notOk(document.querySelector('.highlight'), 'highlightClass removed on cancel');
    });

    (0, _qunit.test)('Highlight applied when `tour.modal == false`', async function (assert) {
      assert.expect(2);

      const steps = [{
        id: 'test-highlight',
        options: {
          attachTo: '.first-element bottom',
          buttons: [_data.builtInButtons.cancel, _data.builtInButtons.next],
          highlightClass: 'highlight',
          text: ['Testing highlight']
        }
      }];

      await (0, _testHelpers.visit)('/');

      tour.set('steps', steps);

      await (0, _testHelpers.click)('.toggleHelpNonmodal');

      assert.ok(document.querySelector('.highlight'), 'currentElement highlighted');

      await (0, _testHelpers.click)(document.querySelector('.shepherd-content .cancel-button'));

      assert.notOk(document.querySelector('.highlight'), 'highlightClass removed on cancel');
    });

    (0, _qunit.test)('Defaults applied', async function (assert) {
      assert.expect(1);

      const stepsWithoutClasses = [{
        id: 'test-highlight',
        options: {
          attachTo: '.first-element bottom',
          buttons: [_data.builtInButtons.cancel, _data.builtInButtons.next]
        }
      }];

      await (0, _testHelpers.visit)('/');

      tour.set('steps', stepsWithoutClasses);

      await (0, _testHelpers.click)('.toggleHelpModal');

      assert.ok(document.querySelector('.custom-default-class'), 'defaults class applied');
    });

    (0, _qunit.test)('configuration works with attachTo object when element is a simple string', async function (assert) {
      assert.expect(1);

      const steps = [{
        id: 'test-attachTo-string',
        options: {
          attachTo: {
            element: '.first-element',
            on: 'bottom'
          },
          buttons: [_data.builtInButtons.cancel, _data.builtInButtons.next]
        }
      }];

      tour.set('steps', steps);

      await (0, _testHelpers.visit)('/');

      await (0, _testHelpers.click)('.toggleHelpModal');

      assert.ok(document.querySelector('.shepherd-element'), 'tour is visible');
    });

    (0, _qunit.test)('configuration works with attachTo object when element is dom element', async function (assert) {
      assert.expect(1);

      await (0, _testHelpers.visit)('/');

      const steps = [{
        id: 'test-attachTo-dom',
        options: {
          attachTo: {
            element: (0, _testHelpers.find)('.first-element'),
            on: 'bottom'
          },
          buttons: [_data.builtInButtons.cancel, _data.builtInButtons.next]
        }
      }];

      tour.set('steps', steps);

      await (0, _testHelpers.click)('.toggleHelpModal');

      assert.ok(document.querySelector('.shepherd-element'), 'tour is visible');
    });

    (0, _qunit.test)('buttons work when type is not specified and passed action is triggered', async function (assert) {
      assert.expect(4);

      let buttonActionCalled = false;

      const steps = [{
        id: 'test-buttons-custom-action',
        options: {
          attachTo: {
            element: '.first-element',
            on: 'bottom'
          },
          buttons: [{
            classes: 'shepherd-button-secondary button-one',
            text: 'button one'
          }, {
            classes: 'shepherd-button-secondary button-two',
            text: 'button two',
            action() {
              buttonActionCalled = true;
            }
          }, {
            classes: 'shepherd-button-secondary button-three',
            text: 'button three'
          }]
        }
      }];

      await (0, _testHelpers.visit)('/');

      tour.set('steps', steps);

      await (0, _testHelpers.click)('.toggleHelpModal');

      assert.ok(document.querySelector('.button-one'), 'tour button one is visible');
      assert.ok(document.querySelector('.button-two'), 'tour button two is visible');
      assert.ok(document.querySelector('.button-three'), 'tour button three is visible');

      await (0, _testHelpers.click)(document.querySelector('.button-two'));

      assert.ok(buttonActionCalled, 'button action triggered');
    });

    (0, _qunit.test)('`pointer-events` is set to `auto` for any step element on clean up', async function (assert) {
      assert.expect(2);

      await (0, _testHelpers.visit)('/');

      await (0, _testHelpers.click)('.toggleHelpModal');

      // Go through a step of the tour...
      await (0, _testHelpers.click)(document.querySelector('[data-id="intro"] .next-button'));

      // Get the target element
      const targetElement = document.querySelector('.shepherd-target');

      // Check the target element has pointer-events = 'none'
      assert.equal(targetElement.style.pointerEvents, 'none');

      // Exit the tour
      await (0, _testHelpers.click)(document.querySelector('[data-id="installation"] .cancel-button'));

      // Check the target element now has pointer-events = 'auto'
      assert.equal(targetElement.style.pointerEvents, 'auto');
    });

    (0, _qunit.test)('scrollTo works with disableScroll on', async function (assert) {
      assert.expect(2);
      // Setup controller tour settings
      tour.set('disableScroll', true);
      tour.set('scrollTo', true);

      // Visit route
      await (0, _testHelpers.visit)('/');

      document.querySelector('#ember-testing-container').scrollTop = 0;

      assert.equal(document.querySelector('#ember-testing-container').scrollTop, 0, 'Scroll is initially 0');

      await (0, _testHelpers.click)('.toggleHelpModal');

      await (0, _testHelpers.click)(document.querySelector('.shepherd-content .next-button'));

      await (0, _testHelpers.click)(document.querySelector('.shepherd-content .next-button'));

      assert.ok(document.querySelector('#ember-testing-container').scrollTop > 0, 'Scrolled down correctly');
    });

    (0, _qunit.test)('scrollTo works with a custom scrollToHandler', async function (assert) {
      assert.expect(2);
      // Override default behavior
      const steps = [{
        id: 'intro',
        options: {
          attachTo: '.first-element bottom',
          buttons: [_data.builtInButtons.cancel, _data.builtInButtons.next],
          scrollTo: true,
          scrollToHandler() {
            return document.querySelector('#ember-testing-container').scrollTop = 120;
          }
        }
      }];

      // Visit route
      await (0, _testHelpers.visit)('/');

      tour.set('steps', steps);

      document.querySelector('#ember-testing-container').scrollTop = 0;
      assert.equal(document.querySelector('#ember-testing-container').scrollTop, 0, 'Scroll is initially 0');

      await (0, _testHelpers.click)('.toggleHelpModal');
      await (0, _testHelpers.click)(document.querySelector('.shepherd-content .next-button'));

      assert.ok(document.querySelector('#ember-testing-container').scrollTop === 120, 'Scrolled correctly');
    });

    (0, _qunit.test)('scrollTo works without a custom scrollToHandler', async function (assert) {
      assert.expect(2);
      // Setup controller tour settings
      tour.set('scrollTo', true);

      // Visit route
      await (0, _testHelpers.visit)('/');

      document.querySelector('#ember-testing-container').scrollTop = 0;

      assert.equal(document.querySelector('#ember-testing-container').scrollTop, 0, 'Scroll is initially 0');

      await (0, _testHelpers.click)('.toggleHelpModal');
      await (0, _testHelpers.click)(document.querySelector('.shepherd-content .next-button'));

      assert.ok(document.querySelector('#ember-testing-container').scrollTop > 0, 'Scrolled correctly');
    });

    (0, _qunit.test)('Shows by id works', async function (assert) {
      await (0, _testHelpers.visit)('/');

      tour.show('usage');

      assert.equal(document.querySelector('.shepherd-element .shepherd-text').textContent, 'To use the tour service, simply inject it into your application and use it like this example.', 'Usage step shown');
    });

    (0, _qunit.test)('copyStyles copies the element correctly', async function (assert) {
      assert.expect(1);

      const steps = [{
        id: 'intro',
        options: {
          attachTo: '.first-element bottom',
          buttons: [_data.builtInButtons.cancel, _data.builtInButtons.next],
          copyStyles: true
        }
      }];

      await (0, _testHelpers.visit)('/');

      tour.set('steps', steps);

      await (0, _testHelpers.click)('.toggleHelpModal');

      assert.equal(document.querySelectorAll('.first-element').length, 2, 'First element is copied with copyStyles');
    });

    (0, _qunit.test)('configuring the modal container works', async function (assert) {
      await (0, _testHelpers.visit)('/');
      await (0, _testHelpers.click)('.toggleHelpModal');

      assert.equal(document.querySelector('#shepherdOverlay').parentNode.tagName, 'BODY', 'modal overlay gets placed in body element by default');
      await (0, _testHelpers.click)(document.querySelector('.cancel-button'));
      assert.notOk(document.querySelector('#shepherdOverlay'), 'overlay gets cleaned up after closing tour (default location)');

      tour.set('modalContainer', '.test-modal-container');
      await (0, _testHelpers.visit)('/');
      await (0, _testHelpers.click)('.toggleHelpModal');

      assert.ok(document.querySelector('#shepherdOverlay').parentNode.classList.contains('test-modal-container'), 'modal overlay gets placed in custom element');
      await (0, _testHelpers.click)(document.querySelector('.cancel-button'));
      assert.notOk(document.querySelector('#shepherdOverlay'), 'overlay gets cleaned up after closing tour (custom location)');
    });
  });
});
define('dummy/tests/data', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  const builtInButtons = exports.builtInButtons = {
    cancel: {
      classes: 'shepherd-button-secondary cancel-button',
      text: 'Exit',
      type: 'cancel'
    },
    next: {
      classes: 'shepherd-button-primary next-button',
      text: 'Next',
      type: 'next'
    },
    back: {
      classes: 'shepherd-button-primary back-button',
      text: 'Back',
      type: 'back'
    }
  };

  const steps = exports.steps = [{
    id: 'intro',
    options: {
      attachTo: '.first-element bottom',
      buttons: [builtInButtons.cancel, builtInButtons.next],
      classes: 'custom-class-name-1 custom-class-name-2',
      copyStyles: false,
      title: 'Welcome to Ember Shepherd!',
      text: [`Ember Shepherd is a javascript library for guiding users through your Ember app.
           It is an Ember addon that wraps <a href="https://github.com/shipshapecode/shepherd">Shepherd</a>
           and extends its functionality. Shepherd uses <a href="https://popper.js.org/">Popper.js</a>,
           another open source library, to position all of its steps.`, `Popper makes sure your steps never end up off screen or cropped by an
           overflow. Try resizing your browser to see what we mean.`]
    }
  }, {
    id: 'installation',
    options: {
      attachTo: '.install-element bottom',
      buttons: [builtInButtons.cancel, builtInButtons.back, builtInButtons.next],
      classes: 'custom-class-name-1 custom-class-name-2',
      copyStyles: false,
      text: ['Installation is simple, if you are using Ember-CLI, just install like any other addon.']
    }
  }, {
    id: 'usage',
    options: {
      attachTo: '.usage-element bottom',
      buttons: [builtInButtons.cancel, builtInButtons.back, builtInButtons.next],
      classes: 'custom-class-name-1 custom-class-name-2',
      copyStyles: false,
      text: ['To use the tour service, simply inject it into your application and use it like this example.']
    }
  }, {
    id: 'modal',
    options: {
      attachTo: {
        element: '.modal-element',
        on: 'top'
      },
      buttons: [builtInButtons.cancel, builtInButtons.back, builtInButtons.next],
      classes: 'custom-class-name-1 custom-class-name-2',
      copyStyles: false,
      text: ['We implemented true modal functionality by disabling clicking of the rest of the page.', 'If you would like to enable modal, simply do this.get(\'tour\').set(\'modal\', true).']
    }
  }, {
    id: 'copyStyle',
    options: {
      attachTo: {
        element: '.style-copy-element',
        on: 'top'
      },
      buttons: [builtInButtons.cancel, builtInButtons.back, builtInButtons.next],
      classes: 'custom-class-name-1 custom-class-name-2',
      copyStyles: false,
      text: [`When using a modal, most times just setting the z-index of your element to something high will
           make it highlight. For complicated cases, where this does not work, we implemented a copyStyles option
           that clones the element and copies its computed styles.`]
    }
  }, {
    id: 'buttons',
    options: {
      attachTo: '.built-in-buttons-element top',
      buttons: [builtInButtons.cancel, builtInButtons.back, builtInButtons.next],
      classes: 'custom-class-name-1 custom-class-name-2',
      copyStyles: false,
      text: [`For the common button types ("next", "back", "cancel", etc.), we implemented Ember actions
          that perform these actions on your tour automatically. To use them, simply include
          in the buttons array in each step.`]
    }
  }, {
    id: 'disableScroll',
    options: {
      attachTo: '.disable-scroll-element top',
      buttons: [builtInButtons.cancel, builtInButtons.back, builtInButtons.next],
      classes: 'custom-class-name-1 custom-class-name-2',
      copyStyles: false,
      text: [`When navigating the user through a tour, you may want to disable scrolling, so they
          cannot mess up your carefully planned out, amazing tour. This is now easily achieved
          with this.get('tour').set('disableScroll', true).`, 'Try scrolling right now, then exit the tour and see that you can again!']
    }
  }, {
    id: 'noAttachTo',
    options: {
      buttons: [builtInButtons.cancel, builtInButtons.back],
      classes: 'custom-class-name-1 custom-class-name-2',
      copyStyles: false,
      text: ['If no attachTo is specified, the modal will appear in the center of the screen, as per the Shepherd docs.']
    }
  }];
});
define('ember-cli-qunit', ['exports', 'ember-qunit'], function (exports, _emberQunit) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'TestLoader', {
    enumerable: true,
    get: function () {
      return _emberQunit.TestLoader;
    }
  });
  Object.defineProperty(exports, 'setupTestContainer', {
    enumerable: true,
    get: function () {
      return _emberQunit.setupTestContainer;
    }
  });
  Object.defineProperty(exports, 'loadTests', {
    enumerable: true,
    get: function () {
      return _emberQunit.loadTests;
    }
  });
  Object.defineProperty(exports, 'startTests', {
    enumerable: true,
    get: function () {
      return _emberQunit.startTests;
    }
  });
  Object.defineProperty(exports, 'setupTestAdapter', {
    enumerable: true,
    get: function () {
      return _emberQunit.setupTestAdapter;
    }
  });
  Object.defineProperty(exports, 'start', {
    enumerable: true,
    get: function () {
      return _emberQunit.start;
    }
  });
});
define('ember-cli-test-loader/test-support/index', ['exports'], function (exports) {
  /* globals requirejs, require */
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.addModuleIncludeMatcher = addModuleIncludeMatcher;
  exports.addModuleExcludeMatcher = addModuleExcludeMatcher;
  let moduleIncludeMatchers = [];
  let moduleExcludeMatchers = [];

  function addModuleIncludeMatcher(fn) {
    moduleIncludeMatchers.push(fn);
  }

  function addModuleExcludeMatcher(fn) {
    moduleExcludeMatchers.push(fn);
  }

  function checkMatchers(matchers, moduleName) {
    return matchers.some(matcher => matcher(moduleName));
  }

  class TestLoader {
    static load() {
      new TestLoader().loadModules();
    }

    constructor() {
      this._didLogMissingUnsee = false;
    }

    shouldLoadModule(moduleName) {
      return moduleName.match(/[-_]test$/);
    }

    listModules() {
      return Object.keys(requirejs.entries);
    }

    listTestModules() {
      let moduleNames = this.listModules();
      let testModules = [];
      let moduleName;

      for (let i = 0; i < moduleNames.length; i++) {
        moduleName = moduleNames[i];

        if (checkMatchers(moduleExcludeMatchers, moduleName)) {
          continue;
        }

        if (checkMatchers(moduleIncludeMatchers, moduleName) || this.shouldLoadModule(moduleName)) {
          testModules.push(moduleName);
        }
      }

      return testModules;
    }

    loadModules() {
      let testModules = this.listTestModules();
      let testModule;

      for (let i = 0; i < testModules.length; i++) {
        testModule = testModules[i];
        this.require(testModule);
        this.unsee(testModule);
      }
    }

    require(moduleName) {
      try {
        require(moduleName);
      } catch (e) {
        this.moduleLoadFailure(moduleName, e);
      }
    }

    unsee(moduleName) {
      if (typeof require.unsee === 'function') {
        require.unsee(moduleName);
      } else if (!this._didLogMissingUnsee) {
        this._didLogMissingUnsee = true;
        if (typeof console !== 'undefined') {
          console.warn('unable to require.unsee, please upgrade loader.js to >= v3.3.0');
        }
      }
    }

    moduleLoadFailure(moduleName, error) {
      console.error('Error loading: ' + moduleName, error.stack);
    }
  }exports.default = TestLoader;
  ;
});
define('ember-qunit/adapter', ['exports', 'qunit', '@ember/test-helpers/has-ember-version'], function (exports, _qunit, _hasEmberVersion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  function unhandledRejectionAssertion(current, error) {
    let message, source;

    if (typeof error === 'object' && error !== null) {
      message = error.message;
      source = error.stack;
    } else if (typeof error === 'string') {
      message = error;
      source = 'unknown source';
    } else {
      message = 'unhandledRejection occured, but it had no message';
      source = 'unknown source';
    }

    current.assert.pushResult({
      result: false,
      actual: false,
      expected: true,
      message: message,
      source: source
    });
  }

  let Adapter = Ember.Test.Adapter.extend({
    init() {
      this.doneCallbacks = [];
    },

    asyncStart() {
      this.doneCallbacks.push(_qunit.default.config.current ? _qunit.default.config.current.assert.async() : null);
    },

    asyncEnd() {
      let done = this.doneCallbacks.pop();
      // This can be null if asyncStart() was called outside of a test
      if (done) {
        done();
      }
    },

    // clobber default implementation of `exception` will be added back for Ember
    // < 2.17 just below...
    exception: null
  });

  // Ember 2.17 and higher do not require the test adapter to have an `exception`
  // method When `exception` is not present, the unhandled rejection is
  // automatically re-thrown and will therefore hit QUnit's own global error
  // handler (therefore appropriately causing test failure)
  if (!(0, _hasEmberVersion.default)(2, 17)) {
    Adapter = Adapter.extend({
      exception(error) {
        unhandledRejectionAssertion(_qunit.default.config.current, error);
      }
    });
  }

  exports.default = Adapter;
});
define('ember-qunit/index', ['exports', 'ember-qunit/legacy-2-x/module-for', 'ember-qunit/legacy-2-x/module-for-component', 'ember-qunit/legacy-2-x/module-for-model', 'ember-qunit/adapter', 'qunit', 'ember-qunit/test-loader', '@ember/test-helpers', 'ember-qunit/test-isolation-validation'], function (exports, _moduleFor, _moduleForComponent, _moduleForModel, _adapter, _qunit, _testLoader, _testHelpers, _testIsolationValidation) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.loadTests = exports.todo = exports.only = exports.skip = exports.test = exports.module = exports.QUnitAdapter = exports.moduleForModel = exports.moduleForComponent = exports.moduleFor = undefined;
  Object.defineProperty(exports, 'moduleFor', {
    enumerable: true,
    get: function () {
      return _moduleFor.default;
    }
  });
  Object.defineProperty(exports, 'moduleForComponent', {
    enumerable: true,
    get: function () {
      return _moduleForComponent.default;
    }
  });
  Object.defineProperty(exports, 'moduleForModel', {
    enumerable: true,
    get: function () {
      return _moduleForModel.default;
    }
  });
  Object.defineProperty(exports, 'QUnitAdapter', {
    enumerable: true,
    get: function () {
      return _adapter.default;
    }
  });
  Object.defineProperty(exports, 'module', {
    enumerable: true,
    get: function () {
      return _qunit.module;
    }
  });
  Object.defineProperty(exports, 'test', {
    enumerable: true,
    get: function () {
      return _qunit.test;
    }
  });
  Object.defineProperty(exports, 'skip', {
    enumerable: true,
    get: function () {
      return _qunit.skip;
    }
  });
  Object.defineProperty(exports, 'only', {
    enumerable: true,
    get: function () {
      return _qunit.only;
    }
  });
  Object.defineProperty(exports, 'todo', {
    enumerable: true,
    get: function () {
      return _qunit.todo;
    }
  });
  Object.defineProperty(exports, 'loadTests', {
    enumerable: true,
    get: function () {
      return _testLoader.loadTests;
    }
  });
  exports.setResolver = setResolver;
  exports.render = render;
  exports.clearRender = clearRender;
  exports.settled = settled;
  exports.pauseTest = pauseTest;
  exports.resumeTest = resumeTest;
  exports.setupTest = setupTest;
  exports.setupRenderingTest = setupRenderingTest;
  exports.setupApplicationTest = setupApplicationTest;
  exports.setupTestContainer = setupTestContainer;
  exports.startTests = startTests;
  exports.setupTestAdapter = setupTestAdapter;
  exports.setupEmberTesting = setupEmberTesting;
  exports.setupEmberOnerrorValidation = setupEmberOnerrorValidation;
  exports.setupTestIsolationValidation = setupTestIsolationValidation;
  exports.start = start;
  function setResolver() {
    (true && !(false) && Ember.deprecate('`setResolver` should be imported from `@ember/test-helpers`, but was imported from `ember-qunit`', false, {
      id: 'ember-qunit.deprecated-reexports.setResolver',
      until: '4.0.0'
    }));


    return (0, _testHelpers.setResolver)(...arguments);
  }

  function render() {
    (true && !(false) && Ember.deprecate('`render` should be imported from `@ember/test-helpers`, but was imported from `ember-qunit`', false, {
      id: 'ember-qunit.deprecated-reexports.render',
      until: '4.0.0'
    }));


    return (0, _testHelpers.render)(...arguments);
  }

  function clearRender() {
    (true && !(false) && Ember.deprecate('`clearRender` should be imported from `@ember/test-helpers`, but was imported from `ember-qunit`', false, {
      id: 'ember-qunit.deprecated-reexports.clearRender',
      until: '4.0.0'
    }));


    return (0, _testHelpers.clearRender)(...arguments);
  }

  function settled() {
    (true && !(false) && Ember.deprecate('`settled` should be imported from `@ember/test-helpers`, but was imported from `ember-qunit`', false, {
      id: 'ember-qunit.deprecated-reexports.settled',
      until: '4.0.0'
    }));


    return (0, _testHelpers.settled)(...arguments);
  }

  function pauseTest() {
    (true && !(false) && Ember.deprecate('`pauseTest` should be imported from `@ember/test-helpers`, but was imported from `ember-qunit`', false, {
      id: 'ember-qunit.deprecated-reexports.pauseTest',
      until: '4.0.0'
    }));


    return (0, _testHelpers.pauseTest)(...arguments);
  }

  function resumeTest() {
    (true && !(false) && Ember.deprecate('`resumeTest` should be imported from `@ember/test-helpers`, but was imported from `ember-qunit`', false, {
      id: 'ember-qunit.deprecated-reexports.resumeTest',
      until: '4.0.0'
    }));


    return (0, _testHelpers.resumeTest)(...arguments);
  }

  function setupTest(hooks, options) {
    hooks.beforeEach(function (assert) {
      return (0, _testHelpers.setupContext)(this, options).then(() => {
        let originalPauseTest = this.pauseTest;
        this.pauseTest = function QUnit_pauseTest() {
          assert.timeout(-1); // prevent the test from timing out

          return originalPauseTest.call(this);
        };
      });
    });

    hooks.afterEach(function () {
      return (0, _testHelpers.teardownContext)(this);
    });
  }

  function setupRenderingTest(hooks, options) {
    setupTest(hooks, options);

    hooks.beforeEach(function () {
      return (0, _testHelpers.setupRenderingContext)(this);
    });

    hooks.afterEach(function () {
      return (0, _testHelpers.teardownRenderingContext)(this);
    });
  }

  function setupApplicationTest(hooks, options) {
    setupTest(hooks, options);

    hooks.beforeEach(function () {
      return (0, _testHelpers.setupApplicationContext)(this);
    });

    hooks.afterEach(function () {
      return (0, _testHelpers.teardownApplicationContext)(this);
    });
  }

  /**
     Uses current URL configuration to setup the test container.
  
     * If `?nocontainer` is set, the test container will be hidden.
     * If `?dockcontainer` or `?devmode` are set the test container will be
       absolutely positioned.
     * If `?devmode` is set, the test container will be made full screen.
  
     @method setupTestContainer
   */
  function setupTestContainer() {
    let testContainer = document.getElementById('ember-testing-container');
    if (!testContainer) {
      return;
    }

    let params = _qunit.default.urlParams;

    let containerVisibility = params.nocontainer ? 'hidden' : 'visible';
    let containerPosition = params.dockcontainer || params.devmode ? 'fixed' : 'relative';

    if (params.devmode) {
      testContainer.className = ' full-screen';
    }

    testContainer.style.visibility = containerVisibility;
    testContainer.style.position = containerPosition;

    let qunitContainer = document.getElementById('qunit');
    if (params.dockcontainer) {
      qunitContainer.style.marginBottom = window.getComputedStyle(testContainer).height;
    }
  }

  /**
     Instruct QUnit to start the tests.
     @method startTests
   */
  function startTests() {
    _qunit.default.start();
  }

  /**
     Sets up the `Ember.Test` adapter for usage with QUnit 2.x.
  
     @method setupTestAdapter
   */
  function setupTestAdapter() {
    Ember.Test.adapter = _adapter.default.create();
  }

  /**
    Ensures that `Ember.testing` is set to `true` before each test begins
    (including `before` / `beforeEach`), and reset to `false` after each test is
    completed. This is done via `QUnit.testStart` and `QUnit.testDone`.
  
   */
  function setupEmberTesting() {
    _qunit.default.testStart(() => {
      Ember.testing = true;
    });

    _qunit.default.testDone(() => {
      Ember.testing = false;
    });
  }

  /**
    Ensures that `Ember.onerror` (if present) is properly configured to re-throw
    errors that occur while `Ember.testing` is `true`.
  */
  function setupEmberOnerrorValidation() {
    _qunit.default.module('ember-qunit: Ember.onerror validation', function () {
      _qunit.default.test('Ember.onerror is functioning properly', function (assert) {
        assert.expect(1);
        let result = (0, _testHelpers.validateErrorHandler)();
        assert.ok(result.isValid, `Ember.onerror handler with invalid testing behavior detected. An Ember.onerror handler _must_ rethrow exceptions when \`Ember.testing\` is \`true\` or the test suite is unreliable. See https://git.io/vbine for more details.`);
      });
    });
  }

  function setupTestIsolationValidation() {
    _qunit.default.testDone(_testIsolationValidation.detectIfTestNotIsolated);
    _qunit.default.done(_testIsolationValidation.reportIfTestNotIsolated);
  }

  // This polyfills the changes from https://github.com/qunitjs/qunit/pull/1279
  // and should be removed when that change is released and included in a release
  // version of QUnit
  function polyfillMemoryLeakPrevention() {
    _qunit.default.testDone(function () {
      // release the test callback
      _qunit.default.config.current.callback = undefined;
    });

    _qunit.default.moduleDone(function () {
      // release the module hooks
      _qunit.default.config.current.module.hooks = {};
    });
  }

  /**
     @method start
     @param {Object} [options] Options to be used for enabling/disabling behaviors
     @param {Boolean} [options.loadTests] If `false` tests will not be loaded automatically.
     @param {Boolean} [options.setupTestContainer] If `false` the test container will not
     be setup based on `devmode`, `dockcontainer`, or `nocontainer` URL params.
     @param {Boolean} [options.startTests] If `false` tests will not be automatically started
     (you must run `QUnit.start()` to kick them off).
     @param {Boolean} [options.setupTestAdapter] If `false` the default Ember.Test adapter will
     not be updated.
     @param {Boolean} [options.setupEmberTesting] `false` opts out of the
     default behavior of setting `Ember.testing` to `true` before all tests and
     back to `false` after each test will.
     @param {Boolean} [options.setupEmberOnerrorValidation] If `false` validation
     of `Ember.onerror` will be disabled.
     @param {Boolean} [options.setupTestIsolationValidation] If `false` test isolation validation
     will be disabled.
     @param {Boolean} [options._polyfillMemoryLeakPrevention] If `false` the polyfilled memory leak prevention will not be enabled.
   */
  function start(options = {}) {
    if (options.loadTests !== false) {
      (0, _testLoader.loadTests)();
    }

    if (options.setupTestContainer !== false) {
      setupTestContainer();
    }

    if (options.setupTestAdapter !== false) {
      setupTestAdapter();
    }

    if (options.setupEmberTesting !== false) {
      setupEmberTesting();
    }

    if (options.setupEmberOnerrorValidation !== false) {
      setupEmberOnerrorValidation();
    }

    if (typeof options.setupTestIsolationValidation !== 'undefined' && options.setupTestIsolationValidation !== false) {
      setupTestIsolationValidation();
    }

    if (options._polyfillMemoryLeakPrevention !== false) {
      polyfillMemoryLeakPrevention();
    }

    if (options.startTests !== false) {
      startTests();
    }
  }
});
define('ember-qunit/legacy-2-x/module-for-component', ['exports', 'ember-qunit/legacy-2-x/qunit-module', 'ember-test-helpers'], function (exports, _qunitModule, _emberTestHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = moduleForComponent;
  function moduleForComponent(name, description, callbacks) {
    (0, _qunitModule.createModule)(_emberTestHelpers.TestModuleForComponent, name, description, callbacks);
  }
});
define('ember-qunit/legacy-2-x/module-for-model', ['exports', 'ember-qunit/legacy-2-x/qunit-module', 'ember-test-helpers'], function (exports, _qunitModule, _emberTestHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = moduleForModel;
  function moduleForModel(name, description, callbacks) {
    (0, _qunitModule.createModule)(_emberTestHelpers.TestModuleForModel, name, description, callbacks);
  }
});
define('ember-qunit/legacy-2-x/module-for', ['exports', 'ember-qunit/legacy-2-x/qunit-module', 'ember-test-helpers'], function (exports, _qunitModule, _emberTestHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = moduleFor;
  function moduleFor(name, description, callbacks) {
    (0, _qunitModule.createModule)(_emberTestHelpers.TestModule, name, description, callbacks);
  }
});
define('ember-qunit/legacy-2-x/qunit-module', ['exports', 'qunit'], function (exports, _qunit) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.createModule = createModule;


  function noop() {}

  function callbackFor(name, callbacks) {
    if (typeof callbacks !== 'object') {
      return noop;
    }
    if (!callbacks) {
      return noop;
    }

    var callback = noop;

    if (callbacks[name]) {
      callback = callbacks[name];
      delete callbacks[name];
    }

    return callback;
  }

  function createModule(Constructor, name, description, callbacks) {
    if (!callbacks && typeof description === 'object') {
      callbacks = description;
      description = name;
    }

    var before = callbackFor('before', callbacks);
    var beforeEach = callbackFor('beforeEach', callbacks);
    var afterEach = callbackFor('afterEach', callbacks);
    var after = callbackFor('after', callbacks);

    var module;
    var moduleName = typeof description === 'string' ? description : name;

    (0, _qunit.module)(moduleName, {
      before() {
        // storing this in closure scope to avoid exposing these
        // private internals to the test context
        module = new Constructor(name, description, callbacks);
        return before.apply(this, arguments);
      },

      beforeEach() {
        // provide the test context to the underlying module
        module.setContext(this);

        return module.setup(...arguments).then(() => {
          return beforeEach.apply(this, arguments);
        });
      },

      afterEach() {
        let result = afterEach.apply(this, arguments);
        return Ember.RSVP.resolve(result).then(() => module.teardown(...arguments));
      },

      after() {
        try {
          return after.apply(this, arguments);
        } finally {
          after = afterEach = before = beforeEach = callbacks = module = null;
        }
      }
    });
  }
});
define('ember-qunit/test-isolation-validation', ['exports', '@ember/test-helpers'], function (exports, _testHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.detectIfTestNotIsolated = detectIfTestNotIsolated;
  exports.reportIfTestNotIsolated = reportIfTestNotIsolated;
  exports.getMessage = getMessage;


  const TESTS_NOT_ISOLATED = [];

  /**
   * Detects if a specific test isn't isolated. A test is considered
   * not isolated if it:
   *
   * - has pending timers
   * - is in a runloop
   * - has pending AJAX requests
   * - has pending test waiters
   *
   * @function detectIfTestNotIsolated
   * @param {Object} testInfo
   * @param {string} testInfo.module The name of the test module
   * @param {string} testInfo.name The test name
   */
  function detectIfTestNotIsolated({ module, name }) {
    if (!(0, _testHelpers.isSettled)()) {
      TESTS_NOT_ISOLATED.push(`${module}: ${name}`);
      Ember.run.cancelTimers();
    }
  }

  /**
   * Reports if a test isn't isolated. Please see above for what
   * constitutes a test being isolated.
   *
   * @function reportIfTestNotIsolated
   * @throws Error if tests are not isolated
   */
  function reportIfTestNotIsolated() {
    if (TESTS_NOT_ISOLATED.length > 0) {
      let leakyTests = TESTS_NOT_ISOLATED.slice();
      TESTS_NOT_ISOLATED.length = 0;

      throw new Error(getMessage(leakyTests.length, leakyTests.join('\n')));
    }
  }

  function getMessage(testCount, testsToReport) {
    return `TESTS ARE NOT ISOLATED
    The following (${testCount}) tests have one or more of pending timers, pending AJAX requests, pending test waiters, or are still in a runloop: \n
    ${testsToReport}
  `;
  }
});
define('ember-qunit/test-loader', ['exports', 'qunit', 'ember-cli-test-loader/test-support/index'], function (exports, _qunit, _index) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TestLoader = undefined;
  exports.loadTests = loadTests;


  (0, _index.addModuleExcludeMatcher)(function (moduleName) {
    return _qunit.default.urlParams.nolint && moduleName.match(/\.(jshint|lint-test)$/);
  });

  (0, _index.addModuleIncludeMatcher)(function (moduleName) {
    return moduleName.match(/\.jshint$/);
  });

  let moduleLoadFailures = [];

  _qunit.default.done(function () {
    if (moduleLoadFailures.length) {
      throw new Error('\n' + moduleLoadFailures.join('\n'));
    }
  });

  class TestLoader extends _index.default {
    moduleLoadFailure(moduleName, error) {
      moduleLoadFailures.push(error);

      _qunit.default.module('TestLoader Failures');
      _qunit.default.test(moduleName + ': could not be loaded', function () {
        throw error;
      });
    }
  }

  exports.TestLoader = TestLoader;
  /**
     Load tests following the default patterns:
  
     * The module name ends with `-test`
     * The module name ends with `.jshint`
  
     Excludes tests that match the following
     patterns when `?nolint` URL param is set:
  
     * The module name ends with `.jshint`
     * The module name ends with `-lint-test`
  
     @method loadTests
   */
  function loadTests() {
    new TestLoader().loadModules();
  }
});
define('ember-sinon-qunit/test-support/only', ['exports', 'ember-qunit', 'ember-sinon-qunit/test-support/utils/config'], function (exports, _emberQunit, _config) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = only;


  // Global sinon config setup
  (0, _config.commonConfig)();

  function only(testName, callback) {
    (0, _config.wrapTest)(testName, callback, _emberQunit.only);
  }
});
define('ember-sinon-qunit/test-support/test', ['exports', 'ember-qunit', 'ember-sinon-qunit/test-support/utils/config'], function (exports, _emberQunit, _config) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = test;


  // Global sinon config setup
  (0, _config.commonConfig)();

  function test(testName, callback) {
    (0, _config.wrapTest)(testName, callback, _emberQunit.test);
  }
});
define('ember-sinon-qunit/test-support/utils/config', ['exports', 'sinon', 'qunit'], function (exports, _sinon, _qunit) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.commonConfig = exports.wrapTest = undefined;


  let ALREADY_FAILED = {};

  const commonConfig = function () {
    _sinon.default.expectation.fail = _sinon.default.assert.fail = function (msg) {
      _qunit.default.assert.ok(false, msg);
    };

    _sinon.default.assert.pass = function (assertion) {
      _qunit.default.assert.ok(true, assertion);
    };

    _sinon.default.config = {
      injectIntoThis: false,
      injectInto: null,
      properties: ['spy', 'stub', 'mock', 'sandbox'],
      useFakeTimers: false,
      useFakeServer: false
    };
  };

  const DEFAULT_SINON_CONFIG = {
    injectIntoThis: true,
    injectInto: null,
    properties: ["spy", "stub", "mock", "clock", "server", "requests"],
    useFakeTimers: true,
    useFakeServer: true
  };

  /**
   * if DEFAULT_SINON_CONFIG has prop that sinon.config has, then add that prop to new map config
   *
   * @method getConfig
   */
  let getConfig = (overrides = {}) => {
    let config = {};

    for (let prop in overrides) {
      if (DEFAULT_SINON_CONFIG.hasOwnProperty(prop)) {
        config[prop] = overrides.hasOwnProperty(prop) ? overrides[prop] : null;
      }
    }

    return config;
  };

  let wrapTest = (testName, callback, importedQunitFunc) => {
    let sandbox;
    let wrapper = function () {
      let context = this;
      if (Ember.isBlank(context)) {
        context = {};
      }

      let config = getConfig(_sinon.default.config);
      config.injectInto = context;
      sandbox = _sinon.default.sandbox.create(config);
      sandbox.usingPromise(Ember.RSVP);

      // There are two ways to have an async test:
      // 1. return a thenable
      // 2. call `assert.async()`

      let result = callback.apply(context, arguments);
      let currentTest = _qunit.default.config.current;

      // Normalize into a promise, even if the test was originally
      // synchronous. And wait for a thenable `result` to finish first
      // (otherwise an asynchronously invoked `assert.async()` will be
      // ignored).
      let promise = Ember.RSVP.resolve(result).then(data => {
        // When `assert.async()` is called, the best way found to
        // detect completion (so far) is to poll the semaphore. :(
        // (Esp. for cases where the test timed out.)
        let poll = (resolve, reject) => {
          // Afford for the fact that we are returning a promise, which
          // bumps the semaphore to at least 1. So when it drops to 1
          // then everything else is complete.
          // (0 means it already failed, e.g. by timing out. - handled below)
          if (currentTest.semaphore === 1) {
            clearTimeout(testTimeoutPollerId);
            testTimeoutDeferred.resolve();
            resolve(data);
          } else {
            setTimeout(() => poll(resolve, reject), 10);
          }
        };

        return new Ember.RSVP.Promise(poll);
      });

      // Watch for cases where either the `result` thenable
      // or `assert.async()` times out and ensure cleanup.
      let testTimeoutPollerId = 0;
      let testTimeoutPoll = () => {
        // 0 means it already failed, e.g. by timing out.
        if (!currentTest.semaphore) {
          testTimeoutDeferred.reject(ALREADY_FAILED);
        } else {
          testTimeoutPollerId = setTimeout(testTimeoutPoll, 10);
        }
      };
      let testTimeoutDeferred = Ember.RSVP.defer();
      // delay first check so that the returned promise can bump the semaphore
      setTimeout(testTimeoutPoll);

      return Ember.RSVP.all([promise, testTimeoutDeferred.promise]).then(([data]) => {
        sandbox.verifyAndRestore();
        return data;
      }, error => {
        sandbox.restore();
        if (error === ALREADY_FAILED) return;
        return Ember.RSVP.reject(error);
      });
    };

    try {
      return importedQunitFunc(testName, wrapper);
    } catch (exception) {
      sandbox.restore();
      throw exception;
    }
  };

  exports.wrapTest = wrapTest;
  exports.commonConfig = commonConfig;
});
define('ember-test-helpers/has-ember-version', ['exports', '@ember/test-helpers/has-ember-version'], function (exports, _hasEmberVersion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _hasEmberVersion.default;
    }
  });
});
define('ember-test-helpers/index', ['exports', '@ember/test-helpers', 'ember-test-helpers/legacy-0-6-x/test-module', 'ember-test-helpers/legacy-0-6-x/test-module-for-acceptance', 'ember-test-helpers/legacy-0-6-x/test-module-for-component', 'ember-test-helpers/legacy-0-6-x/test-module-for-model'], function (exports, _testHelpers, _testModule, _testModuleForAcceptance, _testModuleForComponent, _testModuleForModel) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_testHelpers).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _testHelpers[key];
      }
    });
  });
  Object.defineProperty(exports, 'TestModule', {
    enumerable: true,
    get: function () {
      return _testModule.default;
    }
  });
  Object.defineProperty(exports, 'TestModuleForAcceptance', {
    enumerable: true,
    get: function () {
      return _testModuleForAcceptance.default;
    }
  });
  Object.defineProperty(exports, 'TestModuleForComponent', {
    enumerable: true,
    get: function () {
      return _testModuleForComponent.default;
    }
  });
  Object.defineProperty(exports, 'TestModuleForModel', {
    enumerable: true,
    get: function () {
      return _testModuleForModel.default;
    }
  });
});
define('ember-test-helpers/legacy-0-6-x/-legacy-overrides', ['exports', 'ember-test-helpers/has-ember-version'], function (exports, _hasEmberVersion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.preGlimmerSetupIntegrationForComponent = preGlimmerSetupIntegrationForComponent;
  function preGlimmerSetupIntegrationForComponent() {
    var module = this;
    var context = this.context;

    this.actionHooks = {};

    context.dispatcher = this.container.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');
    context.actions = module.actionHooks;

    (this.registry || this.container).register('component:-test-holder', Ember.Component.extend());

    context.render = function (template) {
      // in case `this.render` is called twice, make sure to teardown the first invocation
      module.teardownComponent();

      if (!template) {
        throw new Error('in a component integration test you must pass a template to `render()`');
      }
      if (Ember.isArray(template)) {
        template = template.join('');
      }
      if (typeof template === 'string') {
        template = Ember.Handlebars.compile(template);
      }
      module.component = module.container.lookupFactory('component:-test-holder').create({
        layout: template
      });

      module.component.set('context', context);
      module.component.set('controller', context);

      Ember.run(function () {
        module.component.appendTo('#ember-testing');
      });

      context._element = module.component.element;
    };

    context.$ = function () {
      return module.component.$.apply(module.component, arguments);
    };

    context.set = function (key, value) {
      var ret = Ember.run(function () {
        return Ember.set(context, key, value);
      });

      if ((0, _hasEmberVersion.default)(2, 0)) {
        return ret;
      }
    };

    context.setProperties = function (hash) {
      var ret = Ember.run(function () {
        return Ember.setProperties(context, hash);
      });

      if ((0, _hasEmberVersion.default)(2, 0)) {
        return ret;
      }
    };

    context.get = function (key) {
      return Ember.get(context, key);
    };

    context.getProperties = function () {
      var args = Array.prototype.slice.call(arguments);
      return Ember.getProperties(context, args);
    };

    context.on = function (actionName, handler) {
      module.actionHooks[actionName] = handler;
    };

    context.send = function (actionName) {
      var hook = module.actionHooks[actionName];
      if (!hook) {
        throw new Error('integration testing template received unexpected action ' + actionName);
      }
      hook.apply(module, Array.prototype.slice.call(arguments, 1));
    };

    context.clearRender = function () {
      module.teardownComponent();
    };
  }
});
define('ember-test-helpers/legacy-0-6-x/abstract-test-module', ['exports', 'ember-test-helpers/legacy-0-6-x/ext/rsvp', '@ember/test-helpers/settled', '@ember/test-helpers'], function (exports, _rsvp, _settled, _testHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  // calling this `merge` here because we cannot
  // actually assume it is like `Object.assign`
  // with > 2 args
  const merge = Ember.assign || Ember.merge;

  exports.default = class {
    constructor(name, options) {
      this.context = undefined;
      this.name = name;
      this.callbacks = options || {};

      this.initSetupSteps();
      this.initTeardownSteps();
    }

    setup(assert) {
      Ember.testing = true;
      return this.invokeSteps(this.setupSteps, this, assert).then(() => {
        this.contextualizeCallbacks();
        return this.invokeSteps(this.contextualizedSetupSteps, this.context, assert);
      });
    }

    teardown(assert) {
      return this.invokeSteps(this.contextualizedTeardownSteps, this.context, assert).then(() => {
        return this.invokeSteps(this.teardownSteps, this, assert);
      }).then(() => {
        this.cache = null;
        this.cachedCalls = null;
      }).finally(function () {
        Ember.testing = false;
      });
    }

    initSetupSteps() {
      this.setupSteps = [];
      this.contextualizedSetupSteps = [];

      if (this.callbacks.beforeSetup) {
        this.setupSteps.push(this.callbacks.beforeSetup);
        delete this.callbacks.beforeSetup;
      }

      this.setupSteps.push(this.setupContext);
      this.setupSteps.push(this.setupTestElements);
      this.setupSteps.push(this.setupAJAXListeners);
      this.setupSteps.push(this.setupPromiseListeners);

      if (this.callbacks.setup) {
        this.contextualizedSetupSteps.push(this.callbacks.setup);
        delete this.callbacks.setup;
      }
    }

    invokeSteps(steps, context, assert) {
      steps = steps.slice();

      function nextStep() {
        var step = steps.shift();
        if (step) {
          // guard against exceptions, for example missing components referenced from needs.
          return new Ember.RSVP.Promise(resolve => {
            resolve(step.call(context, assert));
          }).then(nextStep);
        } else {
          return Ember.RSVP.resolve();
        }
      }
      return nextStep();
    }

    contextualizeCallbacks() {}

    initTeardownSteps() {
      this.teardownSteps = [];
      this.contextualizedTeardownSteps = [];

      if (this.callbacks.teardown) {
        this.contextualizedTeardownSteps.push(this.callbacks.teardown);
        delete this.callbacks.teardown;
      }

      this.teardownSteps.push(this.teardownContext);
      this.teardownSteps.push(this.teardownTestElements);
      this.teardownSteps.push(this.teardownAJAXListeners);
      this.teardownSteps.push(this.teardownPromiseListeners);

      if (this.callbacks.afterTeardown) {
        this.teardownSteps.push(this.callbacks.afterTeardown);
        delete this.callbacks.afterTeardown;
      }
    }

    setupTestElements() {
      let testElementContainer = document.querySelector('#ember-testing-container');
      if (!testElementContainer) {
        testElementContainer = document.createElement('div');
        testElementContainer.setAttribute('id', 'ember-testing-container');
        document.body.appendChild(testElementContainer);
      }

      let testEl = document.querySelector('#ember-testing');
      if (!testEl) {
        let element = document.createElement('div');
        element.setAttribute('id', 'ember-testing');

        testElementContainer.appendChild(element);
        this.fixtureResetValue = '';
      } else {
        this.fixtureResetValue = testElementContainer.innerHTML;
      }
    }

    setupContext(options) {
      let context = this.getContext();

      merge(context, {
        dispatcher: null,
        inject: {}
      });
      merge(context, options);

      this.setToString();
      (0, _testHelpers.setContext)(context);
      this.context = context;
    }

    setContext(context) {
      this.context = context;
    }

    getContext() {
      if (this.context) {
        return this.context;
      }

      return this.context = (0, _testHelpers.getContext)() || {};
    }

    setToString() {
      this.context.toString = () => {
        if (this.subjectName) {
          return `test context for: ${this.subjectName}`;
        }

        if (this.name) {
          return `test context for: ${this.name}`;
        }
      };
    }

    setupAJAXListeners() {
      (0, _settled._setupAJAXHooks)();
    }

    teardownAJAXListeners() {
      (0, _settled._teardownAJAXHooks)();
    }

    setupPromiseListeners() {
      (0, _rsvp._setupPromiseListeners)();
    }

    teardownPromiseListeners() {
      (0, _rsvp._teardownPromiseListeners)();
    }

    teardownTestElements() {
      document.getElementById('ember-testing-container').innerHTML = this.fixtureResetValue;

      // Ember 2.0.0 removed Ember.View as public API, so only do this when
      // Ember.View is present
      if (Ember.View && Ember.View.views) {
        Ember.View.views = {};
      }
    }

    teardownContext() {
      var context = this.context;
      this.context = undefined;
      (0, _testHelpers.unsetContext)();

      if (context && context.dispatcher && !context.dispatcher.isDestroyed) {
        Ember.run(function () {
          context.dispatcher.destroy();
        });
      }
    }
  };
});
define('ember-test-helpers/legacy-0-6-x/build-registry', ['exports', 'require'], function (exports, _require2) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (resolver) {
    var fallbackRegistry, registry, container;
    var namespace = Ember.Object.create({
      Resolver: {
        create() {
          return resolver;
        }
      }
    });

    function register(name, factory) {
      var thingToRegisterWith = registry || container;

      if (!(container.factoryFor ? container.factoryFor(name) : container.lookupFactory(name))) {
        thingToRegisterWith.register(name, factory);
      }
    }

    if (Ember.Application.buildRegistry) {
      fallbackRegistry = Ember.Application.buildRegistry(namespace);
      fallbackRegistry.register('component-lookup:main', Ember.ComponentLookup);

      registry = new Ember.Registry({
        fallback: fallbackRegistry
      });

      if (Ember.ApplicationInstance && Ember.ApplicationInstance.setupRegistry) {
        Ember.ApplicationInstance.setupRegistry(registry);
      }

      // these properties are set on the fallback registry by `buildRegistry`
      // and on the primary registry within the ApplicationInstance constructor
      // but we need to manually recreate them since ApplicationInstance's are not
      // exposed externally
      registry.normalizeFullName = fallbackRegistry.normalizeFullName;
      registry.makeToString = fallbackRegistry.makeToString;
      registry.describe = fallbackRegistry.describe;

      var owner = Owner.create({
        __registry__: registry,
        __container__: null
      });

      container = registry.container({ owner: owner });
      owner.__container__ = container;

      exposeRegistryMethodsWithoutDeprecations(container);
    } else {
      container = Ember.Application.buildContainer(namespace);
      container.register('component-lookup:main', Ember.ComponentLookup);
    }

    // Ember 1.10.0 did not properly add `view:toplevel` or `view:default`
    // to the registry in Ember.Application.buildRegistry :(
    //
    // Ember 2.0.0 removed Ember.View as public API, so only do this when
    // Ember.View is present
    if (Ember.View) {
      register('view:toplevel', Ember.View.extend());
    }

    // Ember 2.0.0 removed Ember._MetamorphView from the Ember global, so only
    // do this when present
    if (Ember._MetamorphView) {
      register('view:default', Ember._MetamorphView);
    }

    var globalContext = typeof global === 'object' && global || self;
    if (requirejs.entries['ember-data/setup-container']) {
      // ember-data is a proper ember-cli addon since 2.3; if no 'import
      // 'ember-data'' is present somewhere in the tests, there is also no `DS`
      // available on the globalContext and hence ember-data wouldn't be setup
      // correctly for the tests; that's why we import and call setupContainer
      // here; also see https://github.com/emberjs/data/issues/4071 for context
      var setupContainer = (0, _require2.default)('ember-data/setup-container')['default'];
      setupContainer(registry || container);
    } else if (globalContext.DS) {
      var DS = globalContext.DS;
      if (DS._setupContainer) {
        DS._setupContainer(registry || container);
      } else {
        register('transform:boolean', DS.BooleanTransform);
        register('transform:date', DS.DateTransform);
        register('transform:number', DS.NumberTransform);
        register('transform:string', DS.StringTransform);
        register('serializer:-default', DS.JSONSerializer);
        register('serializer:-rest', DS.RESTSerializer);
        register('adapter:-rest', DS.RESTAdapter);
      }
    }

    return {
      registry,
      container,
      owner
    };
  };

  /* globals global, self, requirejs */

  function exposeRegistryMethodsWithoutDeprecations(container) {
    var methods = ['register', 'unregister', 'resolve', 'normalize', 'typeInjection', 'injection', 'factoryInjection', 'factoryTypeInjection', 'has', 'options', 'optionsForType'];

    function exposeRegistryMethod(container, method) {
      if (method in container) {
        container[method] = function () {
          return container._registry[method].apply(container._registry, arguments);
        };
      }
    }

    for (var i = 0, l = methods.length; i < l; i++) {
      exposeRegistryMethod(container, methods[i]);
    }
  }

  var Owner = function () {
    if (Ember._RegistryProxyMixin && Ember._ContainerProxyMixin) {
      return Ember.Object.extend(Ember._RegistryProxyMixin, Ember._ContainerProxyMixin, {
        _emberTestHelpersMockOwner: true
      });
    }

    return Ember.Object.extend({
      _emberTestHelpersMockOwner: true
    });
  }();
});
define('ember-test-helpers/legacy-0-6-x/ext/rsvp', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._setupPromiseListeners = _setupPromiseListeners;
  exports._teardownPromiseListeners = _teardownPromiseListeners;


  let originalAsync;

  /**
    Configures `RSVP` to resolve promises on the run-loop's action queue. This is
    done by Ember internally since Ember 1.7 and it is only needed to
    provide a consistent testing experience for users of Ember < 1.7.
  
    @private
  */
  function _setupPromiseListeners() {
    originalAsync = Ember.RSVP.configure('async');

    Ember.RSVP.configure('async', function (callback, promise) {
      Ember.run.backburner.schedule('actions', () => {
        callback(promise);
      });
    });
  }

  /**
    Resets `RSVP`'s `async` to its prior value.
  
    @private
  */
  function _teardownPromiseListeners() {
    Ember.RSVP.configure('async', originalAsync);
  }
});
define('ember-test-helpers/legacy-0-6-x/test-module-for-acceptance', ['exports', 'ember-test-helpers/legacy-0-6-x/abstract-test-module', '@ember/test-helpers'], function (exports, _abstractTestModule, _testHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = class extends _abstractTestModule.default {
    setupContext() {
      super.setupContext({ application: this.createApplication() });
    }

    teardownContext() {
      Ember.run(() => {
        (0, _testHelpers.getContext)().application.destroy();
      });

      super.teardownContext();
    }

    createApplication() {
      let { Application, config } = this.callbacks;
      let application;

      Ember.run(() => {
        application = Application.create(config);
        application.setupForTesting();
        application.injectTestHelpers();
      });

      return application;
    }
  };
});
define('ember-test-helpers/legacy-0-6-x/test-module-for-component', ['exports', 'ember-test-helpers/legacy-0-6-x/test-module', 'ember-test-helpers/has-ember-version', 'ember-test-helpers/legacy-0-6-x/-legacy-overrides'], function (exports, _testModule, _hasEmberVersion, _legacyOverrides) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.setupComponentIntegrationTest = setupComponentIntegrationTest;
  /* globals EmberENV */
  let ACTION_KEY;
  if ((0, _hasEmberVersion.default)(2, 0)) {
    ACTION_KEY = 'actions';
  } else {
    ACTION_KEY = '_actions';
  }

  const isPreGlimmer = !(0, _hasEmberVersion.default)(1, 13);

  exports.default = class extends _testModule.default {
    constructor(componentName, description, callbacks) {
      // Allow `description` to be omitted
      if (!callbacks && typeof description === 'object') {
        callbacks = description;
        description = null;
      } else if (!callbacks) {
        callbacks = {};
      }

      let integrationOption = callbacks.integration;
      let hasNeeds = Array.isArray(callbacks.needs);

      super('component:' + componentName, description, callbacks);

      this.componentName = componentName;

      if (hasNeeds || callbacks.unit || integrationOption === false) {
        this.isUnitTest = true;
      } else if (integrationOption) {
        this.isUnitTest = false;
      } else {
        Ember.deprecate('the component:' + componentName + ' test module is implicitly running in unit test mode, ' + 'which will change to integration test mode by default in an upcoming version of ' + 'ember-test-helpers. Add `unit: true` or a `needs:[]` list to explicitly opt in to unit ' + 'test mode.', false, {
          id: 'ember-test-helpers.test-module-for-component.test-type',
          until: '0.6.0'
        });
        this.isUnitTest = true;
      }

      if (!this.isUnitTest && !this.isLegacy) {
        callbacks.integration = true;
      }

      if (this.isUnitTest || this.isLegacy) {
        this.setupSteps.push(this.setupComponentUnitTest);
      } else {
        this.callbacks.subject = function () {
          throw new Error("component integration tests do not support `subject()`. Instead, render the component as if it were HTML: `this.render('<my-component foo=true>');`. For more information, read: http://guides.emberjs.com/v2.2.0/testing/testing-components/");
        };
        this.setupSteps.push(this.setupComponentIntegrationTest);
        this.teardownSteps.unshift(this.teardownComponent);
      }

      if (Ember.View && Ember.View.views) {
        this.setupSteps.push(this._aliasViewRegistry);
        this.teardownSteps.unshift(this._resetViewRegistry);
      }
    }

    initIntegration(options) {
      this.isLegacy = options.integration === 'legacy';
      this.isIntegration = options.integration !== 'legacy';
    }

    _aliasViewRegistry() {
      this._originalGlobalViewRegistry = Ember.View.views;
      var viewRegistry = this.container.lookup('-view-registry:main');

      if (viewRegistry) {
        Ember.View.views = viewRegistry;
      }
    }

    _resetViewRegistry() {
      Ember.View.views = this._originalGlobalViewRegistry;
    }

    setupComponentUnitTest() {
      var _this = this;
      var resolver = this.resolver;
      var context = this.context;

      var layoutName = 'template:components/' + this.componentName;

      var layout = resolver.resolve(layoutName);

      var thingToRegisterWith = this.registry || this.container;
      if (layout) {
        thingToRegisterWith.register(layoutName, layout);
        thingToRegisterWith.injection(this.subjectName, 'layout', layoutName);
      }
      var eventDispatcher = resolver.resolve('event_dispatcher:main');
      if (eventDispatcher) {
        thingToRegisterWith.register('event_dispatcher:main', eventDispatcher);
      }

      context.dispatcher = this.container.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
      context.dispatcher.setup({}, '#ember-testing');

      context._element = null;

      this.callbacks.render = function () {
        var subject;

        Ember.run(function () {
          subject = context.subject();
          subject.appendTo('#ember-testing');
        });

        context._element = subject.element;

        _this.teardownSteps.unshift(function () {
          Ember.run(function () {
            Ember.tryInvoke(subject, 'destroy');
          });
        });
      };

      this.callbacks.append = function () {
        Ember.deprecate('this.append() is deprecated. Please use this.render() or this.$() instead.', false, {
          id: 'ember-test-helpers.test-module-for-component.append',
          until: '0.6.0'
        });
        return context.$();
      };

      context.$ = function () {
        this.render();
        var subject = this.subject();

        return subject.$.apply(subject, arguments);
      };
    }

    setupComponentIntegrationTest() {
      if (isPreGlimmer) {
        return _legacyOverrides.preGlimmerSetupIntegrationForComponent.apply(this, arguments);
      } else {
        return setupComponentIntegrationTest.apply(this, arguments);
      }
    }

    setupContext() {
      super.setupContext();

      // only setup the injection if we are running against a version
      // of Ember that has `-view-registry:main` (Ember >= 1.12)
      if (this.container.factoryFor ? this.container.factoryFor('-view-registry:main') : this.container.lookupFactory('-view-registry:main')) {
        (this.registry || this.container).injection('component', '_viewRegistry', '-view-registry:main');
      }

      if (!this.isUnitTest && !this.isLegacy) {
        this.context.factory = function () {};
      }
    }

    teardownComponent() {
      var component = this.component;
      if (component) {
        Ember.run(component, 'destroy');
        this.component = null;
      }
    }
  };
  function setupComponentIntegrationTest() {
    var module = this;
    var context = this.context;

    this.actionHooks = context[ACTION_KEY] = {};
    context.dispatcher = this.container.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');

    var hasRendered = false;
    var OutletView = module.container.factoryFor ? module.container.factoryFor('view:-outlet') : module.container.lookupFactory('view:-outlet');
    var OutletTemplate = module.container.lookup('template:-outlet');
    var toplevelView = module.component = OutletView.create();
    var hasOutletTemplate = !!OutletTemplate;
    var outletState = {
      render: {
        owner: Ember.getOwner ? Ember.getOwner(module.container) : undefined,
        into: undefined,
        outlet: 'main',
        name: 'application',
        controller: module.context,
        ViewClass: undefined,
        template: OutletTemplate
      },

      outlets: {}
    };

    var element = document.getElementById('ember-testing');
    var templateId = 0;

    if (hasOutletTemplate) {
      Ember.run(() => {
        toplevelView.setOutletState(outletState);
      });
    }

    context.render = function (template) {
      if (!template) {
        throw new Error('in a component integration test you must pass a template to `render()`');
      }
      if (Ember.isArray(template)) {
        template = template.join('');
      }
      if (typeof template === 'string') {
        template = Ember.Handlebars.compile(template);
      }

      var templateFullName = 'template:-undertest-' + ++templateId;
      this.registry.register(templateFullName, template);
      var stateToRender = {
        owner: Ember.getOwner ? Ember.getOwner(module.container) : undefined,
        into: undefined,
        outlet: 'main',
        name: 'index',
        controller: module.context,
        ViewClass: undefined,
        template: module.container.lookup(templateFullName),
        outlets: {}
      };

      if (hasOutletTemplate) {
        stateToRender.name = 'index';
        outletState.outlets.main = { render: stateToRender, outlets: {} };
      } else {
        stateToRender.name = 'application';
        outletState = { render: stateToRender, outlets: {} };
      }

      Ember.run(() => {
        toplevelView.setOutletState(outletState);
      });

      if (!hasRendered) {
        Ember.run(module.component, 'appendTo', '#ember-testing');
        hasRendered = true;
      }

      if (EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false) {
        // ensure the element is based on the wrapping toplevel view
        // Ember still wraps the main application template with a
        // normal tagged view
        context._element = element = document.querySelector('#ember-testing > .ember-view');
      } else {
        context._element = element = document.querySelector('#ember-testing');
      }
    };

    context.$ = function (selector) {
      // emulates Ember internal behavor of `this.$` in a component
      // https://github.com/emberjs/ember.js/blob/v2.5.1/packages/ember-views/lib/views/states/has_element.js#L18
      return selector ? Ember.$(selector, element) : Ember.$(element);
    };

    context.set = function (key, value) {
      var ret = Ember.run(function () {
        return Ember.set(context, key, value);
      });

      if ((0, _hasEmberVersion.default)(2, 0)) {
        return ret;
      }
    };

    context.setProperties = function (hash) {
      var ret = Ember.run(function () {
        return Ember.setProperties(context, hash);
      });

      if ((0, _hasEmberVersion.default)(2, 0)) {
        return ret;
      }
    };

    context.get = function (key) {
      return Ember.get(context, key);
    };

    context.getProperties = function () {
      var args = Array.prototype.slice.call(arguments);
      return Ember.getProperties(context, args);
    };

    context.on = function (actionName, handler) {
      module.actionHooks[actionName] = handler;
    };

    context.send = function (actionName) {
      var hook = module.actionHooks[actionName];
      if (!hook) {
        throw new Error('integration testing template received unexpected action ' + actionName);
      }
      hook.apply(module.context, Array.prototype.slice.call(arguments, 1));
    };

    context.clearRender = function () {
      Ember.run(function () {
        toplevelView.setOutletState({
          render: {
            owner: module.container,
            into: undefined,
            outlet: 'main',
            name: 'application',
            controller: module.context,
            ViewClass: undefined,
            template: undefined
          },
          outlets: {}
        });
      });
    };
  }
});
define('ember-test-helpers/legacy-0-6-x/test-module-for-model', ['exports', 'require', 'ember-test-helpers/legacy-0-6-x/test-module'], function (exports, _require2, _testModule) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = class extends _testModule.default {
    constructor(modelName, description, callbacks) {
      super('model:' + modelName, description, callbacks);

      this.modelName = modelName;

      this.setupSteps.push(this.setupModel);
    }

    setupModel() {
      var container = this.container;
      var defaultSubject = this.defaultSubject;
      var callbacks = this.callbacks;
      var modelName = this.modelName;

      var adapterFactory = container.factoryFor ? container.factoryFor('adapter:application') : container.lookupFactory('adapter:application');
      if (!adapterFactory) {
        if (requirejs.entries['ember-data/adapters/json-api']) {
          adapterFactory = (0, _require2.default)('ember-data/adapters/json-api')['default'];
        }

        // when ember-data/adapters/json-api is provided via ember-cli shims
        // using Ember Data 1.x the actual JSONAPIAdapter isn't found, but the
        // above require statement returns a bizzaro object with only a `default`
        // property (circular reference actually)
        if (!adapterFactory || !adapterFactory.create) {
          adapterFactory = DS.JSONAPIAdapter || DS.FixtureAdapter;
        }

        var thingToRegisterWith = this.registry || this.container;
        thingToRegisterWith.register('adapter:application', adapterFactory);
      }

      callbacks.store = function () {
        var container = this.container;
        return container.lookup('service:store') || container.lookup('store:main');
      };

      if (callbacks.subject === defaultSubject) {
        callbacks.subject = function (options) {
          var container = this.container;

          return Ember.run(function () {
            var store = container.lookup('service:store') || container.lookup('store:main');
            return store.createRecord(modelName, options);
          });
        };
      }
    }
  };
});
define('ember-test-helpers/legacy-0-6-x/test-module', ['exports', 'ember-test-helpers/legacy-0-6-x/abstract-test-module', '@ember/test-helpers', 'ember-test-helpers/legacy-0-6-x/build-registry', '@ember/test-helpers/has-ember-version'], function (exports, _abstractTestModule, _testHelpers, _buildRegistry, _hasEmberVersion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = class extends _abstractTestModule.default {
    constructor(subjectName, description, callbacks) {
      // Allow `description` to be omitted, in which case it should
      // default to `subjectName`
      if (!callbacks && typeof description === 'object') {
        callbacks = description;
        description = subjectName;
      }

      super(description || subjectName, callbacks);

      this.subjectName = subjectName;
      this.description = description || subjectName;
      this.resolver = this.callbacks.resolver || (0, _testHelpers.getResolver)();

      if (this.callbacks.integration && this.callbacks.needs) {
        throw new Error("cannot declare 'integration: true' and 'needs' in the same module");
      }

      if (this.callbacks.integration) {
        this.initIntegration(callbacks);
        delete callbacks.integration;
      }

      this.initSubject();
      this.initNeeds();
    }

    initIntegration(options) {
      if (options.integration === 'legacy') {
        throw new Error("`integration: 'legacy'` is only valid for component tests.");
      }
      this.isIntegration = true;
    }

    initSubject() {
      this.callbacks.subject = this.callbacks.subject || this.defaultSubject;
    }

    initNeeds() {
      this.needs = [this.subjectName];
      if (this.callbacks.needs) {
        this.needs = this.needs.concat(this.callbacks.needs);
        delete this.callbacks.needs;
      }
    }

    initSetupSteps() {
      this.setupSteps = [];
      this.contextualizedSetupSteps = [];

      if (this.callbacks.beforeSetup) {
        this.setupSteps.push(this.callbacks.beforeSetup);
        delete this.callbacks.beforeSetup;
      }

      this.setupSteps.push(this.setupContainer);
      this.setupSteps.push(this.setupContext);
      this.setupSteps.push(this.setupTestElements);
      this.setupSteps.push(this.setupAJAXListeners);
      this.setupSteps.push(this.setupPromiseListeners);

      if (this.callbacks.setup) {
        this.contextualizedSetupSteps.push(this.callbacks.setup);
        delete this.callbacks.setup;
      }
    }

    initTeardownSteps() {
      this.teardownSteps = [];
      this.contextualizedTeardownSteps = [];

      if (this.callbacks.teardown) {
        this.contextualizedTeardownSteps.push(this.callbacks.teardown);
        delete this.callbacks.teardown;
      }

      this.teardownSteps.push(this.teardownSubject);
      this.teardownSteps.push(this.teardownContainer);
      this.teardownSteps.push(this.teardownContext);
      this.teardownSteps.push(this.teardownTestElements);
      this.teardownSteps.push(this.teardownAJAXListeners);
      this.teardownSteps.push(this.teardownPromiseListeners);

      if (this.callbacks.afterTeardown) {
        this.teardownSteps.push(this.callbacks.afterTeardown);
        delete this.callbacks.afterTeardown;
      }
    }

    setupContainer() {
      if (this.isIntegration || this.isLegacy) {
        this._setupIntegratedContainer();
      } else {
        this._setupIsolatedContainer();
      }
    }

    setupContext() {
      var subjectName = this.subjectName;
      var container = this.container;

      var factory = function () {
        return container.factoryFor ? container.factoryFor(subjectName) : container.lookupFactory(subjectName);
      };

      super.setupContext({
        container: this.container,
        registry: this.registry,
        factory: factory,
        register() {
          var target = this.registry || this.container;
          return target.register.apply(target, arguments);
        }
      });

      if (Ember.setOwner) {
        Ember.setOwner(this.context, this.container.owner);
      }

      this.setupInject();
    }

    setupInject() {
      var module = this;
      var context = this.context;

      if (Ember.inject) {
        var keys = (Object.keys || keys)(Ember.inject);

        keys.forEach(function (typeName) {
          context.inject[typeName] = function (name, opts) {
            var alias = opts && opts.as || name;
            Ember.run(function () {
              Ember.set(context, alias, module.container.lookup(typeName + ':' + name));
            });
          };
        });
      }
    }

    teardownSubject() {
      var subject = this.cache.subject;

      if (subject) {
        Ember.run(function () {
          Ember.tryInvoke(subject, 'destroy');
        });
      }
    }

    teardownContainer() {
      var container = this.container;
      Ember.run(function () {
        container.destroy();
      });
    }

    defaultSubject(options, factory) {
      return factory.create(options);
    }

    // allow arbitrary named factories, like rspec let
    contextualizeCallbacks() {
      var callbacks = this.callbacks;
      var context = this.context;

      this.cache = this.cache || {};
      this.cachedCalls = this.cachedCalls || {};

      var keys = (Object.keys || keys)(callbacks);
      var keysLength = keys.length;

      if (keysLength) {
        var deprecatedContext = this._buildDeprecatedContext(this, context);
        for (var i = 0; i < keysLength; i++) {
          this._contextualizeCallback(context, keys[i], deprecatedContext);
        }
      }
    }

    _contextualizeCallback(context, key, callbackContext) {
      var _this = this;
      var callbacks = this.callbacks;
      var factory = context.factory;

      context[key] = function (options) {
        if (_this.cachedCalls[key]) {
          return _this.cache[key];
        }

        var result = callbacks[key].call(callbackContext, options, factory());

        _this.cache[key] = result;
        _this.cachedCalls[key] = true;

        return result;
      };
    }

    /*
      Builds a version of the passed in context that contains deprecation warnings
      for accessing properties that exist on the module.
    */
    _buildDeprecatedContext(module, context) {
      var deprecatedContext = Object.create(context);

      var keysForDeprecation = Object.keys(module);

      for (var i = 0, l = keysForDeprecation.length; i < l; i++) {
        this._proxyDeprecation(module, deprecatedContext, keysForDeprecation[i]);
      }

      return deprecatedContext;
    }

    /*
      Defines a key on an object to act as a proxy for deprecating the original.
    */
    _proxyDeprecation(obj, proxy, key) {
      if (typeof proxy[key] === 'undefined') {
        Object.defineProperty(proxy, key, {
          get() {
            Ember.deprecate('Accessing the test module property "' + key + '" from a callback is deprecated.', false, {
              id: 'ember-test-helpers.test-module.callback-context',
              until: '0.6.0'
            });
            return obj[key];
          }
        });
      }
    }

    _setupContainer(isolated) {
      var resolver = this.resolver;

      var items = (0, _buildRegistry.default)(!isolated ? resolver : Object.create(resolver, {
        resolve: {
          value() {}
        }
      }));

      this.container = items.container;
      this.registry = items.registry;

      if ((0, _hasEmberVersion.default)(1, 13)) {
        var thingToRegisterWith = this.registry || this.container;
        var router = resolver.resolve('router:main');
        router = router || Ember.Router.extend();
        thingToRegisterWith.register('router:main', router);
      }
    }

    _setupIsolatedContainer() {
      var resolver = this.resolver;
      this._setupContainer(true);

      var thingToRegisterWith = this.registry || this.container;

      for (var i = this.needs.length; i > 0; i--) {
        var fullName = this.needs[i - 1];
        var normalizedFullName = resolver.normalize(fullName);
        thingToRegisterWith.register(fullName, resolver.resolve(normalizedFullName));
      }

      if (!this.registry) {
        this.container.resolver = function () {};
      }
    }

    _setupIntegratedContainer() {
      this._setupContainer();
    }
  };
});
define('ember-test-helpers/wait', ['exports', '@ember/test-helpers/settled', '@ember/test-helpers'], function (exports, _settled, _testHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._teardownPromiseListeners = exports._teardownAJAXHooks = exports._setupPromiseListeners = exports._setupAJAXHooks = undefined;
  Object.defineProperty(exports, '_setupAJAXHooks', {
    enumerable: true,
    get: function () {
      return _settled._setupAJAXHooks;
    }
  });
  Object.defineProperty(exports, '_setupPromiseListeners', {
    enumerable: true,
    get: function () {
      return _settled._setupPromiseListeners;
    }
  });
  Object.defineProperty(exports, '_teardownAJAXHooks', {
    enumerable: true,
    get: function () {
      return _settled._teardownAJAXHooks;
    }
  });
  Object.defineProperty(exports, '_teardownPromiseListeners', {
    enumerable: true,
    get: function () {
      return _settled._teardownPromiseListeners;
    }
  });
  exports.default = wait;


  /**
    Returns a promise that resolves when in a settled state (see `isSettled` for
    a definition of "settled state").
  
    @private
    @deprecated
    @param {Object} [options={}] the options to be used for waiting
    @param {boolean} [options.waitForTimers=true] should timers be waited upon
    @param {boolean} [options.waitForAjax=true] should $.ajax requests be waited upon
    @param {boolean} [options.waitForWaiters=true] should test waiters be waited upon
    @returns {Promise<void>} resolves when settled
  */
  function wait(options = {}) {
    if (typeof options !== 'object' || options === null) {
      options = {};
    }

    return (0, _testHelpers.waitUntil)(() => {
      let waitForTimers = 'waitForTimers' in options ? options.waitForTimers : true;
      let waitForAJAX = 'waitForAJAX' in options ? options.waitForAJAX : true;
      let waitForWaiters = 'waitForWaiters' in options ? options.waitForWaiters : true;

      let {
        hasPendingTimers,
        hasRunLoop,
        hasPendingRequests,
        hasPendingWaiters
      } = (0, _testHelpers.getSettledState)();

      if (waitForTimers && (hasPendingTimers || hasRunLoop)) {
        return false;
      }

      if (waitForAJAX && hasPendingRequests) {
        return false;
      }

      if (waitForWaiters && hasPendingWaiters) {
        return false;
      }

      return true;
    }, { timeout: Infinity });
  }
});
define("ember-window-mock/-private/mock/local-storage", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  function argumentError(f, required, given) {
    return new TypeError("Failed to execute '" + f + "' on 'Storage': " + required + 'arguments required, but only ' + given + 'present.');
  }

  class Storage {
    constructor() {
      Object.defineProperty(this, 'getItem', {
        value(key) {
          if (arguments.length < 1) {
            throw argumentError('getItem', 1, arguments.length);
          }
          if (this.hasOwnProperty(key)) {
            return this[key];
          }
          return null;
        },
        enumerable: false
      });

      Object.defineProperty(this, 'setItem', {
        value(key, value) {
          if (arguments.length < 2) {
            throw argumentError('setItem', 2, arguments.length);
          }
          this[key] = value + '';
        },
        enumerable: false
      });

      Object.defineProperty(this, 'removeItem', {
        value(key) {
          if (arguments.length < 1) {
            throw argumentError('removeItem', 1, arguments.length);
          }
          delete this[key];
        },
        enumerable: false
      });

      Object.defineProperty(this, 'key', {
        value(index) {
          if (arguments.length < 1) {
            throw argumentError('key', 1, arguments.length);
          }
          index = parseInt(index, 10);

          if (Number.isNaN(index)) {
            index = 0;
          }

          if (index < 0 || index > this.length - 1) {
            return null;
          }

          return Object.keys(this)[index];
        },
        enumerable: false
      });

      Object.defineProperty(this, 'clear', {
        value() {
          Object.keys(this).forEach(key => delete this[key]);
        },
        enumerable: false
      });

      Object.defineProperty(this, 'toString', {
        value() {
          return '[object Storage]';
        },
        enumerable: false
      });
    }

    get length() {
      return Object.keys(this).length;
    }
  }
  exports.default = Storage;
});
define('ember-window-mock/-private/mock/location', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = locationFactory;
  const mappedPorperties = [
  // 'href',
  'port', 'host', 'hostname', 'hash', 'origin', 'search', 'pathname', 'protocol', 'username', 'password'];

  /**
   * mock implementation of window.mock
   *
   * based on https://github.com/RyanV/jasmine-fake-window/blob/master/src/jasmine_fake_window.js
   *
   * @type {Object}
   * @public
   */
  function locationFactory(defaultUrl) {
    let location = {};
    let url = new URL(defaultUrl);

    mappedPorperties.forEach(propertyName => {
      Object.defineProperty(location, propertyName, {
        get() {
          return url[propertyName];
        },
        set(value) {
          url[propertyName] = value;
        }
      });
    });

    Object.defineProperty(location, 'href', {
      get() {
        return url.href;
      },
      set(value) {
        try {
          // check if it's a valid absolute URL
          new URL(value);
          url.href = value;
        } catch (e) {
          // absolute path
          if (value.charAt(0) === '/') {
            url.href = url.origin + value;
          } else {
            // replace last part of path with new value
            let parts = url.pathname.split('/').filter((item, index, array) => index !== array.length - 1).concat(value);
            url.href = url.origin + parts.join('/');
          }
        }
      }
    });

    location.reload = function () {};
    location.assign = function (url) {
      this.href = url;
    };
    location.replace = location.assign;
    location.toString = function () {
      return this.href;
    };

    return location;
  }
});
define('ember-window-mock/-private/mock/proxy', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = proxyFactory;
  function proxyFactory(original) {
    let holder = {};

    let proxy = new Proxy(original, {
      get(target, name) {
        if (name === '_reset') {
          return () => holder = {};
        }
        if (name in holder) {
          return holder[name];
        }
        if (typeof target[name] === 'function') {
          return target[name].bind(target);
        }
        if (typeof target[name] === 'object') {
          let proxy = proxyFactory(target[name]);
          holder[name] = proxy;
          return proxy;
        }
        return target[name];
      },
      set(target, name, value) {
        holder[name] = value;
        return true;
      },
      has(target, prop) {
        return prop in holder || prop in target;
      },
      deleteProperty(target, prop) {
        delete holder[prop];
        delete target[prop];
        return true;
      }
    });

    return proxy;
  }
});
define('ember-window-mock/-private/setup-window-mock', ['exports', 'ember-window-mock'], function (exports, _emberWindowMock) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = setupWindowMock;


  //
  // Used to reset window-mock for a test.
  //
  // NOTE: the `hooks = self` is for mocha support
  //
  function setupWindowMock(hooks = self) {
    hooks.beforeEach(_emberWindowMock.reset);
  }
});
define('ember-window-mock/-private/window', ['exports', 'ember-window-mock/-private/mock/location', 'ember-window-mock/-private/mock/local-storage', 'ember-window-mock/-private/mock/proxy'], function (exports, _location, _localStorage, _proxy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.reset = reset;


  const originalWindow = window;

  let location = (0, _location.default)(originalWindow.location.href);
  let localStorage = new _localStorage.default();
  let holder = {};

  function noop() {}

  exports.default = new Proxy(window, {
    get(target, name) {
      switch (name) {
        case 'location':
          return location;
        case 'localStorage':
          return localStorage;
        case 'alert':
        case 'confirm':
        case 'prompt':
          return name in holder ? holder[name] : noop;
        default:
          if (name in holder) {
            return holder[name];
          }
          if (typeof window[name] === 'function') {
            return window[name].bind(window);
          }
          if (typeof window[name] === 'object') {
            let proxy = (0, _proxy.default)(window[name]);
            holder[name] = proxy;
            return proxy;
          }
          return target[name];
      }
    },
    set(target, name, value, receiver) {
      switch (name) {
        case 'location':
          // setting window.location is equivalent to setting window.location.href
          receiver.location.href = value;
          return true;
        default:
          holder[name] = value;
          return true;
      }
    },
    has(target, prop) {
      return prop in holder || prop in target;
    },
    deleteProperty(target, prop) {
      delete holder[prop];
      delete target[prop];
      return true;
    }
  });
  function reset() {
    location = (0, _location.default)(originalWindow.location.href);
    localStorage = new _localStorage.default();
    holder = {};
  }
});
define('ember-window-mock/index', ['exports', 'ember-window-mock/-private/window', 'ember-window-mock/-private/setup-window-mock'], function (exports, _window, _setupWindowMock) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _window.default;
    }
  });
  Object.defineProperty(exports, 'reset', {
    enumerable: true,
    get: function () {
      return _window.reset;
    }
  });
  Object.defineProperty(exports, 'setupWindowMock', {
    enumerable: true,
    get: function () {
      return _setupWindowMock.default;
    }
  });
});
define('dummy/tests/helpers/resolver', ['exports', 'dummy/resolver', 'dummy/config/environment'], function (exports, _resolver, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const resolver = _resolver.default.create();

  resolver.namespace = {
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix
  };

  exports.default = resolver;
});
define('dummy/tests/lint/app.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | app');

  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/application.js should pass ESLint\n\n');
  });

  QUnit.test('data.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'data.js should pass ESLint\n\n');
  });

  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });

  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });

  QUnit.test('routes/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/application.js should pass ESLint\n\n');
  });
});
define('dummy/tests/lint/templates.template.lint-test', [], function () {
  'use strict';

  QUnit.module('TemplateLint');

  QUnit.test('dummy/templates/application.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'dummy/templates/application.hbs should pass TemplateLint.\n\n');
  });
});
define('dummy/tests/lint/tests.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | tests');

  QUnit.test('acceptance/ember-shepherd-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'acceptance/ember-shepherd-test.js should pass ESLint\n\n');
  });

  QUnit.test('data.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'data.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/resolver.js should pass ESLint\n\n');
  });

  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });

  QUnit.test('unit/services/tour-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/tour-test.js should pass ESLint\n\n');
  });
});
define("qunit/index", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /* globals QUnit */

  var _module = QUnit.module;
  exports.module = _module;
  var test = exports.test = QUnit.test;
  var skip = exports.skip = QUnit.skip;
  var only = exports.only = QUnit.only;
  var todo = exports.todo = QUnit.todo;

  exports.default = QUnit;
});
define('dummy/tests/test-helper', ['dummy/app', 'dummy/config/environment', '@ember/test-helpers', 'ember-qunit'], function (_app, _environment, _testHelpers, _emberQunit) {
  'use strict';

  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));

  (0, _emberQunit.start)();
});
define('dummy/tests/unit/services/tour-test', ['qunit', 'ember-qunit', 'ember-shepherd/utils', 'dummy/tests/data'], function (_qunit, _emberQunit, _utils, _data) {
  'use strict';

  const steps = [{
    id: 'intro',
    options: {
      attachTo: '.test-element bottom',
      buttons: [_data.builtInButtons.cancel, _data.builtInButtons.next],
      classes: 'custom-class-name-1 custom-class-name-2',
      title: 'Welcome to Ember-Shepherd!',
      text: ['Test text'],
      scrollTo: true,
      scrollToHandler() {
        return 'custom scrollToHandler';
      }
    }
  }];

  (0, _qunit.module)('Unit | Service | tour', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    (0, _qunit.test)('it starts the tour when the `start` event is triggered', function (assert) {
      assert.expect(1);

      const mockTourObject = Ember.Object.extend({
        start() {
          assert.ok(true, 'The tour was started');
        }
      }).create();

      const service = this.owner.factoryFor('service:tour').create({
        steps
      });

      service.set('tourObject', mockTourObject);

      Ember.run(function () {
        service.start();
      });
    });

    (0, _qunit.test)('it allows another object to bind to events', function (assert) {
      assert.expect(1);

      const mockTourObject = Ember.Object.extend({
        next() {}
      }).create();

      const service = this.owner.factoryFor('service:tour').create({
        steps
      });

      service.set('tourObject', mockTourObject);

      service.on('next', function () {
        assert.ok(true);
      });

      Ember.run(function () {
        service.next();
      });
    });

    (0, _qunit.test)('it passes through a custom scrollToHandler option', function (assert) {
      assert.expect(1);

      const mockTourObject = Ember.Object.extend({
        start() {
          assert.equal(steps[0].options.scrollToHandler(), 'custom scrollToHandler', 'The handler was passed through as an option on the step');
        }
      }).create();

      const service = this.owner.factoryFor('service:tour').create({
        steps
      });

      service.set('tourObject', mockTourObject);

      Ember.run(function () {
        service.start();
      });
    });

    (0, _qunit.test)('it correctly calculates element position from getElementPosition', function (assert) {
      assert.expect(2);

      const mockElement = { offsetHeight: 500, offsetLeft: 200, offsetTop: 100, offsetWidth: 250 };
      const position = (0, _utils.getElementPosition)(mockElement);

      assert.equal(position.top, '100', 'Top is correctly calculated');
      assert.equal(position.left, '200', 'Left is correctly calculated');
    });

    (0, _qunit.test)('it correctly sets the highlight element position', function (assert) {
      assert.expect(4);

      const currentElement = { offsetHeight: 500, offsetLeft: 200, offsetTop: 100, offsetWidth: 250 };
      const highlightElement = { style: {} };

      (0, _utils.setPositionForHighlightElement)({
        currentElement,
        highlightElement
      });

      assert.ok(highlightElement.style.left.indexOf(currentElement.offsetLeft) > -1);
      assert.ok(highlightElement.style.top.indexOf(currentElement.offsetTop) > -1);
      assert.ok(highlightElement.style.width.indexOf(currentElement.offsetWidth) > -1);
      assert.ok(highlightElement.style.height.indexOf(currentElement.offsetHeight) > -1);
    });

    (0, _qunit.test)('it correctly sets the highlight element position format', function (assert) {
      assert.expect(4);

      const currentElement = { offsetHeight: 500, offsetLeft: 200, offsetTop: 100, offsetWidth: 250 };
      const highlightElement = { style: {} };

      (0, _utils.setPositionForHighlightElement)({
        currentElement,
        highlightElement
      });

      assert.ok(highlightElement.style.left.indexOf('px') > -1);
      assert.ok(highlightElement.style.top.indexOf('px') > -1);
      assert.ok(highlightElement.style.width.indexOf('px') > -1);
      assert.ok(highlightElement.style.height.indexOf('px') > -1);
    });
  });
});
define('dummy/config/environment', [], function() {
  var prefix = 'dummy';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

require('dummy/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
