(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function getDefaultExportFromCjs(x2) {
  return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production_min = {};
var react = { exports: {} };
var react_production_min = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var l$1 = Symbol.for("react.element"), n$1 = Symbol.for("react.portal"), p$2 = Symbol.for("react.fragment"), q$1 = Symbol.for("react.strict_mode"), r = Symbol.for("react.profiler"), t = Symbol.for("react.provider"), u = Symbol.for("react.context"), v$1 = Symbol.for("react.forward_ref"), w = Symbol.for("react.suspense"), x = Symbol.for("react.memo"), y = Symbol.for("react.lazy"), z$1 = Symbol.iterator;
function A$1(a) {
  if (null === a || "object" !== typeof a) return null;
  a = z$1 && a[z$1] || a["@@iterator"];
  return "function" === typeof a ? a : null;
}
var B$1 = { isMounted: function() {
  return false;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, C$1 = Object.assign, D$1 = {};
function E$1(a, b, e) {
  this.props = a;
  this.context = b;
  this.refs = D$1;
  this.updater = e || B$1;
}
E$1.prototype.isReactComponent = {};
E$1.prototype.setState = function(a, b) {
  if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, a, b, "setState");
};
E$1.prototype.forceUpdate = function(a) {
  this.updater.enqueueForceUpdate(this, a, "forceUpdate");
};
function F() {
}
F.prototype = E$1.prototype;
function G$1(a, b, e) {
  this.props = a;
  this.context = b;
  this.refs = D$1;
  this.updater = e || B$1;
}
var H$1 = G$1.prototype = new F();
H$1.constructor = G$1;
C$1(H$1, E$1.prototype);
H$1.isPureReactComponent = true;
var I$1 = Array.isArray, J = Object.prototype.hasOwnProperty, K$1 = { current: null }, L$1 = { key: true, ref: true, __self: true, __source: true };
function M$1(a, b, e) {
  var d, c = {}, k2 = null, h = null;
  if (null != b) for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k2 = "" + b.key), b) J.call(b, d) && !L$1.hasOwnProperty(d) && (c[d] = b[d]);
  var g = arguments.length - 2;
  if (1 === g) c.children = e;
  else if (1 < g) {
    for (var f2 = Array(g), m2 = 0; m2 < g; m2++) f2[m2] = arguments[m2 + 2];
    c.children = f2;
  }
  if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
  return { $$typeof: l$1, type: a, key: k2, ref: h, props: c, _owner: K$1.current };
}
function N$1(a, b) {
  return { $$typeof: l$1, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
}
function O$1(a) {
  return "object" === typeof a && null !== a && a.$$typeof === l$1;
}
function escape(a) {
  var b = { "=": "=0", ":": "=2" };
  return "$" + a.replace(/[=:]/g, function(a2) {
    return b[a2];
  });
}
var P$1 = /\/+/g;
function Q$1(a, b) {
  return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
}
function R$1(a, b, e, d, c) {
  var k2 = typeof a;
  if ("undefined" === k2 || "boolean" === k2) a = null;
  var h = false;
  if (null === a) h = true;
  else switch (k2) {
    case "string":
    case "number":
      h = true;
      break;
    case "object":
      switch (a.$$typeof) {
        case l$1:
        case n$1:
          h = true;
      }
  }
  if (h) return h = a, c = c(h), a = "" === d ? "." + Q$1(h, 0) : d, I$1(c) ? (e = "", null != a && (e = a.replace(P$1, "$&/") + "/"), R$1(c, b, e, "", function(a2) {
    return a2;
  })) : null != c && (O$1(c) && (c = N$1(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P$1, "$&/") + "/") + a)), b.push(c)), 1;
  h = 0;
  d = "" === d ? "." : d + ":";
  if (I$1(a)) for (var g = 0; g < a.length; g++) {
    k2 = a[g];
    var f2 = d + Q$1(k2, g);
    h += R$1(k2, b, e, f2, c);
  }
  else if (f2 = A$1(a), "function" === typeof f2) for (a = f2.call(a), g = 0; !(k2 = a.next()).done; ) k2 = k2.value, f2 = d + Q$1(k2, g++), h += R$1(k2, b, e, f2, c);
  else if ("object" === k2) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
  return h;
}
function S$1(a, b, e) {
  if (null == a) return a;
  var d = [], c = 0;
  R$1(a, d, "", "", function(a2) {
    return b.call(e, a2, c++);
  });
  return d;
}
function T$1(a) {
  if (-1 === a._status) {
    var b = a._result;
    b = b();
    b.then(function(b2) {
      if (0 === a._status || -1 === a._status) a._status = 1, a._result = b2;
    }, function(b2) {
      if (0 === a._status || -1 === a._status) a._status = 2, a._result = b2;
    });
    -1 === a._status && (a._status = 0, a._result = b);
  }
  if (1 === a._status) return a._result.default;
  throw a._result;
}
var U$1 = { current: null }, V$1 = { transition: null }, W$1 = { ReactCurrentDispatcher: U$1, ReactCurrentBatchConfig: V$1, ReactCurrentOwner: K$1 };
function X$1() {
  throw Error("act(...) is not supported in production builds of React.");
}
react_production_min.Children = { map: S$1, forEach: function(a, b, e) {
  S$1(a, function() {
    b.apply(this, arguments);
  }, e);
}, count: function(a) {
  var b = 0;
  S$1(a, function() {
    b++;
  });
  return b;
}, toArray: function(a) {
  return S$1(a, function(a2) {
    return a2;
  }) || [];
}, only: function(a) {
  if (!O$1(a)) throw Error("React.Children.only expected to receive a single React element child.");
  return a;
} };
react_production_min.Component = E$1;
react_production_min.Fragment = p$2;
react_production_min.Profiler = r;
react_production_min.PureComponent = G$1;
react_production_min.StrictMode = q$1;
react_production_min.Suspense = w;
react_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W$1;
react_production_min.act = X$1;
react_production_min.cloneElement = function(a, b, e) {
  if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
  var d = C$1({}, a.props), c = a.key, k2 = a.ref, h = a._owner;
  if (null != b) {
    void 0 !== b.ref && (k2 = b.ref, h = K$1.current);
    void 0 !== b.key && (c = "" + b.key);
    if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
    for (f2 in b) J.call(b, f2) && !L$1.hasOwnProperty(f2) && (d[f2] = void 0 === b[f2] && void 0 !== g ? g[f2] : b[f2]);
  }
  var f2 = arguments.length - 2;
  if (1 === f2) d.children = e;
  else if (1 < f2) {
    g = Array(f2);
    for (var m2 = 0; m2 < f2; m2++) g[m2] = arguments[m2 + 2];
    d.children = g;
  }
  return { $$typeof: l$1, type: a.type, key: c, ref: k2, props: d, _owner: h };
};
react_production_min.createContext = function(a) {
  a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
  a.Provider = { $$typeof: t, _context: a };
  return a.Consumer = a;
};
react_production_min.createElement = M$1;
react_production_min.createFactory = function(a) {
  var b = M$1.bind(null, a);
  b.type = a;
  return b;
};
react_production_min.createRef = function() {
  return { current: null };
};
react_production_min.forwardRef = function(a) {
  return { $$typeof: v$1, render: a };
};
react_production_min.isValidElement = O$1;
react_production_min.lazy = function(a) {
  return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T$1 };
};
react_production_min.memo = function(a, b) {
  return { $$typeof: x, type: a, compare: void 0 === b ? null : b };
};
react_production_min.startTransition = function(a) {
  var b = V$1.transition;
  V$1.transition = {};
  try {
    a();
  } finally {
    V$1.transition = b;
  }
};
react_production_min.unstable_act = X$1;
react_production_min.useCallback = function(a, b) {
  return U$1.current.useCallback(a, b);
};
react_production_min.useContext = function(a) {
  return U$1.current.useContext(a);
};
react_production_min.useDebugValue = function() {
};
react_production_min.useDeferredValue = function(a) {
  return U$1.current.useDeferredValue(a);
};
react_production_min.useEffect = function(a, b) {
  return U$1.current.useEffect(a, b);
};
react_production_min.useId = function() {
  return U$1.current.useId();
};
react_production_min.useImperativeHandle = function(a, b, e) {
  return U$1.current.useImperativeHandle(a, b, e);
};
react_production_min.useInsertionEffect = function(a, b) {
  return U$1.current.useInsertionEffect(a, b);
};
react_production_min.useLayoutEffect = function(a, b) {
  return U$1.current.useLayoutEffect(a, b);
};
react_production_min.useMemo = function(a, b) {
  return U$1.current.useMemo(a, b);
};
react_production_min.useReducer = function(a, b, e) {
  return U$1.current.useReducer(a, b, e);
};
react_production_min.useRef = function(a) {
  return U$1.current.useRef(a);
};
react_production_min.useState = function(a) {
  return U$1.current.useState(a);
};
react_production_min.useSyncExternalStore = function(a, b, e) {
  return U$1.current.useSyncExternalStore(a, b, e);
};
react_production_min.useTransition = function() {
  return U$1.current.useTransition();
};
react_production_min.version = "18.3.1";
{
  react.exports = react_production_min;
}
var reactExports = react.exports;
const React = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f = reactExports, k = Symbol.for("react.element"), l = Symbol.for("react.fragment"), m$1 = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p$1 = { key: true, ref: true, __self: true, __source: true };
function q(c, a, g) {
  var b, d = {}, e = null, h = null;
  void 0 !== g && (e = "" + g);
  void 0 !== a.key && (e = "" + a.key);
  void 0 !== a.ref && (h = a.ref);
  for (b in a) m$1.call(a, b) && !p$1.hasOwnProperty(b) && (d[b] = a[b]);
  if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
  return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
}
reactJsxRuntime_production_min.Fragment = l;
reactJsxRuntime_production_min.jsx = q;
reactJsxRuntime_production_min.jsxs = q;
{
  jsxRuntime.exports = reactJsxRuntime_production_min;
}
var jsxRuntimeExports = jsxRuntime.exports;
var client = {};
var reactDom = { exports: {} };
var reactDom_production_min = {};
var scheduler = { exports: {} };
var scheduler_production_min = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function(exports$1) {
  function f2(a, b) {
    var c = a.length;
    a.push(b);
    a: for (; 0 < c; ) {
      var d = c - 1 >>> 1, e = a[d];
      if (0 < g(e, b)) a[d] = b, a[c] = e, c = d;
      else break a;
    }
  }
  function h(a) {
    return 0 === a.length ? null : a[0];
  }
  function k2(a) {
    if (0 === a.length) return null;
    var b = a[0], c = a.pop();
    if (c !== b) {
      a[0] = c;
      a: for (var d = 0, e = a.length, w2 = e >>> 1; d < w2; ) {
        var m2 = 2 * (d + 1) - 1, C2 = a[m2], n2 = m2 + 1, x2 = a[n2];
        if (0 > g(C2, c)) n2 < e && 0 > g(x2, C2) ? (a[d] = x2, a[n2] = c, d = n2) : (a[d] = C2, a[m2] = c, d = m2);
        else if (n2 < e && 0 > g(x2, c)) a[d] = x2, a[n2] = c, d = n2;
        else break a;
      }
    }
    return b;
  }
  function g(a, b) {
    var c = a.sortIndex - b.sortIndex;
    return 0 !== c ? c : a.id - b.id;
  }
  if ("object" === typeof performance && "function" === typeof performance.now) {
    var l2 = performance;
    exports$1.unstable_now = function() {
      return l2.now();
    };
  } else {
    var p2 = Date, q2 = p2.now();
    exports$1.unstable_now = function() {
      return p2.now() - q2;
    };
  }
  var r2 = [], t2 = [], u2 = 1, v2 = null, y2 = 3, z2 = false, A2 = false, B2 = false, D2 = "function" === typeof setTimeout ? setTimeout : null, E2 = "function" === typeof clearTimeout ? clearTimeout : null, F2 = "undefined" !== typeof setImmediate ? setImmediate : null;
  "undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function G2(a) {
    for (var b = h(t2); null !== b; ) {
      if (null === b.callback) k2(t2);
      else if (b.startTime <= a) k2(t2), b.sortIndex = b.expirationTime, f2(r2, b);
      else break;
      b = h(t2);
    }
  }
  function H2(a) {
    B2 = false;
    G2(a);
    if (!A2) if (null !== h(r2)) A2 = true, I2(J2);
    else {
      var b = h(t2);
      null !== b && K2(H2, b.startTime - a);
    }
  }
  function J2(a, b) {
    A2 = false;
    B2 && (B2 = false, E2(L2), L2 = -1);
    z2 = true;
    var c = y2;
    try {
      G2(b);
      for (v2 = h(r2); null !== v2 && (!(v2.expirationTime > b) || a && !M2()); ) {
        var d = v2.callback;
        if ("function" === typeof d) {
          v2.callback = null;
          y2 = v2.priorityLevel;
          var e = d(v2.expirationTime <= b);
          b = exports$1.unstable_now();
          "function" === typeof e ? v2.callback = e : v2 === h(r2) && k2(r2);
          G2(b);
        } else k2(r2);
        v2 = h(r2);
      }
      if (null !== v2) var w2 = true;
      else {
        var m2 = h(t2);
        null !== m2 && K2(H2, m2.startTime - b);
        w2 = false;
      }
      return w2;
    } finally {
      v2 = null, y2 = c, z2 = false;
    }
  }
  var N2 = false, O2 = null, L2 = -1, P2 = 5, Q2 = -1;
  function M2() {
    return exports$1.unstable_now() - Q2 < P2 ? false : true;
  }
  function R2() {
    if (null !== O2) {
      var a = exports$1.unstable_now();
      Q2 = a;
      var b = true;
      try {
        b = O2(true, a);
      } finally {
        b ? S2() : (N2 = false, O2 = null);
      }
    } else N2 = false;
  }
  var S2;
  if ("function" === typeof F2) S2 = function() {
    F2(R2);
  };
  else if ("undefined" !== typeof MessageChannel) {
    var T2 = new MessageChannel(), U2 = T2.port2;
    T2.port1.onmessage = R2;
    S2 = function() {
      U2.postMessage(null);
    };
  } else S2 = function() {
    D2(R2, 0);
  };
  function I2(a) {
    O2 = a;
    N2 || (N2 = true, S2());
  }
  function K2(a, b) {
    L2 = D2(function() {
      a(exports$1.unstable_now());
    }, b);
  }
  exports$1.unstable_IdlePriority = 5;
  exports$1.unstable_ImmediatePriority = 1;
  exports$1.unstable_LowPriority = 4;
  exports$1.unstable_NormalPriority = 3;
  exports$1.unstable_Profiling = null;
  exports$1.unstable_UserBlockingPriority = 2;
  exports$1.unstable_cancelCallback = function(a) {
    a.callback = null;
  };
  exports$1.unstable_continueExecution = function() {
    A2 || z2 || (A2 = true, I2(J2));
  };
  exports$1.unstable_forceFrameRate = function(a) {
    0 > a || 125 < a ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P2 = 0 < a ? Math.floor(1e3 / a) : 5;
  };
  exports$1.unstable_getCurrentPriorityLevel = function() {
    return y2;
  };
  exports$1.unstable_getFirstCallbackNode = function() {
    return h(r2);
  };
  exports$1.unstable_next = function(a) {
    switch (y2) {
      case 1:
      case 2:
      case 3:
        var b = 3;
        break;
      default:
        b = y2;
    }
    var c = y2;
    y2 = b;
    try {
      return a();
    } finally {
      y2 = c;
    }
  };
  exports$1.unstable_pauseExecution = function() {
  };
  exports$1.unstable_requestPaint = function() {
  };
  exports$1.unstable_runWithPriority = function(a, b) {
    switch (a) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        a = 3;
    }
    var c = y2;
    y2 = a;
    try {
      return b();
    } finally {
      y2 = c;
    }
  };
  exports$1.unstable_scheduleCallback = function(a, b, c) {
    var d = exports$1.unstable_now();
    "object" === typeof c && null !== c ? (c = c.delay, c = "number" === typeof c && 0 < c ? d + c : d) : c = d;
    switch (a) {
      case 1:
        var e = -1;
        break;
      case 2:
        e = 250;
        break;
      case 5:
        e = 1073741823;
        break;
      case 4:
        e = 1e4;
        break;
      default:
        e = 5e3;
    }
    e = c + e;
    a = { id: u2++, callback: b, priorityLevel: a, startTime: c, expirationTime: e, sortIndex: -1 };
    c > d ? (a.sortIndex = c, f2(t2, a), null === h(r2) && a === h(t2) && (B2 ? (E2(L2), L2 = -1) : B2 = true, K2(H2, c - d))) : (a.sortIndex = e, f2(r2, a), A2 || z2 || (A2 = true, I2(J2)));
    return a;
  };
  exports$1.unstable_shouldYield = M2;
  exports$1.unstable_wrapCallback = function(a) {
    var b = y2;
    return function() {
      var c = y2;
      y2 = b;
      try {
        return a.apply(this, arguments);
      } finally {
        y2 = c;
      }
    };
  };
})(scheduler_production_min);
{
  scheduler.exports = scheduler_production_min;
}
var schedulerExports = scheduler.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var aa = reactExports, ca = schedulerExports;
function p(a) {
  for (var b = "https://reactjs.org/docs/error-decoder.html?invariant=" + a, c = 1; c < arguments.length; c++) b += "&args[]=" + encodeURIComponent(arguments[c]);
  return "Minified React error #" + a + "; visit " + b + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var da = /* @__PURE__ */ new Set(), ea = {};
function fa(a, b) {
  ha(a, b);
  ha(a + "Capture", b);
}
function ha(a, b) {
  ea[a] = b;
  for (a = 0; a < b.length; a++) da.add(b[a]);
}
var ia = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement), ja = Object.prototype.hasOwnProperty, ka = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, la = {}, ma = {};
function oa(a) {
  if (ja.call(ma, a)) return true;
  if (ja.call(la, a)) return false;
  if (ka.test(a)) return ma[a] = true;
  la[a] = true;
  return false;
}
function pa(a, b, c, d) {
  if (null !== c && 0 === c.type) return false;
  switch (typeof b) {
    case "function":
    case "symbol":
      return true;
    case "boolean":
      if (d) return false;
      if (null !== c) return !c.acceptsBooleans;
      a = a.toLowerCase().slice(0, 5);
      return "data-" !== a && "aria-" !== a;
    default:
      return false;
  }
}
function qa(a, b, c, d) {
  if (null === b || "undefined" === typeof b || pa(a, b, c, d)) return true;
  if (d) return false;
  if (null !== c) switch (c.type) {
    case 3:
      return !b;
    case 4:
      return false === b;
    case 5:
      return isNaN(b);
    case 6:
      return isNaN(b) || 1 > b;
  }
  return false;
}
function v(a, b, c, d, e, f2, g) {
  this.acceptsBooleans = 2 === b || 3 === b || 4 === b;
  this.attributeName = d;
  this.attributeNamespace = e;
  this.mustUseProperty = c;
  this.propertyName = a;
  this.type = b;
  this.sanitizeURL = f2;
  this.removeEmptyString = g;
}
var z = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a) {
  z[a] = new v(a, 0, false, a, null, false, false);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a) {
  var b = a[0];
  z[b] = new v(b, 1, false, a[1], null, false, false);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a) {
  z[a] = new v(a, 2, false, a.toLowerCase(), null, false, false);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a) {
  z[a] = new v(a, 2, false, a, null, false, false);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a) {
  z[a] = new v(a, 3, false, a.toLowerCase(), null, false, false);
});
["checked", "multiple", "muted", "selected"].forEach(function(a) {
  z[a] = new v(a, 3, true, a, null, false, false);
});
["capture", "download"].forEach(function(a) {
  z[a] = new v(a, 4, false, a, null, false, false);
});
["cols", "rows", "size", "span"].forEach(function(a) {
  z[a] = new v(a, 6, false, a, null, false, false);
});
["rowSpan", "start"].forEach(function(a) {
  z[a] = new v(a, 5, false, a.toLowerCase(), null, false, false);
});
var ra = /[\-:]([a-z])/g;
function sa(a) {
  return a[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a) {
  var b = a.replace(
    ra,
    sa
  );
  z[b] = new v(b, 1, false, a, null, false, false);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a) {
  var b = a.replace(ra, sa);
  z[b] = new v(b, 1, false, a, "http://www.w3.org/1999/xlink", false, false);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(a) {
  var b = a.replace(ra, sa);
  z[b] = new v(b, 1, false, a, "http://www.w3.org/XML/1998/namespace", false, false);
});
["tabIndex", "crossOrigin"].forEach(function(a) {
  z[a] = new v(a, 1, false, a.toLowerCase(), null, false, false);
});
z.xlinkHref = new v("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
["src", "href", "action", "formAction"].forEach(function(a) {
  z[a] = new v(a, 1, false, a.toLowerCase(), null, true, true);
});
function ta(a, b, c, d) {
  var e = z.hasOwnProperty(b) ? z[b] : null;
  if (null !== e ? 0 !== e.type : d || !(2 < b.length) || "o" !== b[0] && "O" !== b[0] || "n" !== b[1] && "N" !== b[1]) qa(b, c, e, d) && (c = null), d || null === e ? oa(b) && (null === c ? a.removeAttribute(b) : a.setAttribute(b, "" + c)) : e.mustUseProperty ? a[e.propertyName] = null === c ? 3 === e.type ? false : "" : c : (b = e.attributeName, d = e.attributeNamespace, null === c ? a.removeAttribute(b) : (e = e.type, c = 3 === e || 4 === e && true === c ? "" : "" + c, d ? a.setAttributeNS(d, b, c) : a.setAttribute(b, c)));
}
var ua = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, va = Symbol.for("react.element"), wa = Symbol.for("react.portal"), ya = Symbol.for("react.fragment"), za = Symbol.for("react.strict_mode"), Aa = Symbol.for("react.profiler"), Ba = Symbol.for("react.provider"), Ca = Symbol.for("react.context"), Da = Symbol.for("react.forward_ref"), Ea = Symbol.for("react.suspense"), Fa = Symbol.for("react.suspense_list"), Ga = Symbol.for("react.memo"), Ha = Symbol.for("react.lazy");
var Ia = Symbol.for("react.offscreen");
var Ja = Symbol.iterator;
function Ka(a) {
  if (null === a || "object" !== typeof a) return null;
  a = Ja && a[Ja] || a["@@iterator"];
  return "function" === typeof a ? a : null;
}
var A = Object.assign, La;
function Ma(a) {
  if (void 0 === La) try {
    throw Error();
  } catch (c) {
    var b = c.stack.trim().match(/\n( *(at )?)/);
    La = b && b[1] || "";
  }
  return "\n" + La + a;
}
var Na = false;
function Oa(a, b) {
  if (!a || Na) return "";
  Na = true;
  var c = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (b) if (b = function() {
      throw Error();
    }, Object.defineProperty(b.prototype, "props", { set: function() {
      throw Error();
    } }), "object" === typeof Reflect && Reflect.construct) {
      try {
        Reflect.construct(b, []);
      } catch (l2) {
        var d = l2;
      }
      Reflect.construct(a, [], b);
    } else {
      try {
        b.call();
      } catch (l2) {
        d = l2;
      }
      a.call(b.prototype);
    }
    else {
      try {
        throw Error();
      } catch (l2) {
        d = l2;
      }
      a();
    }
  } catch (l2) {
    if (l2 && d && "string" === typeof l2.stack) {
      for (var e = l2.stack.split("\n"), f2 = d.stack.split("\n"), g = e.length - 1, h = f2.length - 1; 1 <= g && 0 <= h && e[g] !== f2[h]; ) h--;
      for (; 1 <= g && 0 <= h; g--, h--) if (e[g] !== f2[h]) {
        if (1 !== g || 1 !== h) {
          do
            if (g--, h--, 0 > h || e[g] !== f2[h]) {
              var k2 = "\n" + e[g].replace(" at new ", " at ");
              a.displayName && k2.includes("<anonymous>") && (k2 = k2.replace("<anonymous>", a.displayName));
              return k2;
            }
          while (1 <= g && 0 <= h);
        }
        break;
      }
    }
  } finally {
    Na = false, Error.prepareStackTrace = c;
  }
  return (a = a ? a.displayName || a.name : "") ? Ma(a) : "";
}
function Pa(a) {
  switch (a.tag) {
    case 5:
      return Ma(a.type);
    case 16:
      return Ma("Lazy");
    case 13:
      return Ma("Suspense");
    case 19:
      return Ma("SuspenseList");
    case 0:
    case 2:
    case 15:
      return a = Oa(a.type, false), a;
    case 11:
      return a = Oa(a.type.render, false), a;
    case 1:
      return a = Oa(a.type, true), a;
    default:
      return "";
  }
}
function Qa(a) {
  if (null == a) return null;
  if ("function" === typeof a) return a.displayName || a.name || null;
  if ("string" === typeof a) return a;
  switch (a) {
    case ya:
      return "Fragment";
    case wa:
      return "Portal";
    case Aa:
      return "Profiler";
    case za:
      return "StrictMode";
    case Ea:
      return "Suspense";
    case Fa:
      return "SuspenseList";
  }
  if ("object" === typeof a) switch (a.$$typeof) {
    case Ca:
      return (a.displayName || "Context") + ".Consumer";
    case Ba:
      return (a._context.displayName || "Context") + ".Provider";
    case Da:
      var b = a.render;
      a = a.displayName;
      a || (a = b.displayName || b.name || "", a = "" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
      return a;
    case Ga:
      return b = a.displayName || null, null !== b ? b : Qa(a.type) || "Memo";
    case Ha:
      b = a._payload;
      a = a._init;
      try {
        return Qa(a(b));
      } catch (c) {
      }
  }
  return null;
}
function Ra(a) {
  var b = a.type;
  switch (a.tag) {
    case 24:
      return "Cache";
    case 9:
      return (b.displayName || "Context") + ".Consumer";
    case 10:
      return (b._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return a = b.render, a = a.displayName || a.name || "", b.displayName || ("" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
    case 7:
      return "Fragment";
    case 5:
      return b;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return Qa(b);
    case 8:
      return b === za ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if ("function" === typeof b) return b.displayName || b.name || null;
      if ("string" === typeof b) return b;
  }
  return null;
}
function Sa(a) {
  switch (typeof a) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return a;
    case "object":
      return a;
    default:
      return "";
  }
}
function Ta(a) {
  var b = a.type;
  return (a = a.nodeName) && "input" === a.toLowerCase() && ("checkbox" === b || "radio" === b);
}
function Ua(a) {
  var b = Ta(a) ? "checked" : "value", c = Object.getOwnPropertyDescriptor(a.constructor.prototype, b), d = "" + a[b];
  if (!a.hasOwnProperty(b) && "undefined" !== typeof c && "function" === typeof c.get && "function" === typeof c.set) {
    var e = c.get, f2 = c.set;
    Object.defineProperty(a, b, { configurable: true, get: function() {
      return e.call(this);
    }, set: function(a2) {
      d = "" + a2;
      f2.call(this, a2);
    } });
    Object.defineProperty(a, b, { enumerable: c.enumerable });
    return { getValue: function() {
      return d;
    }, setValue: function(a2) {
      d = "" + a2;
    }, stopTracking: function() {
      a._valueTracker = null;
      delete a[b];
    } };
  }
}
function Va(a) {
  a._valueTracker || (a._valueTracker = Ua(a));
}
function Wa(a) {
  if (!a) return false;
  var b = a._valueTracker;
  if (!b) return true;
  var c = b.getValue();
  var d = "";
  a && (d = Ta(a) ? a.checked ? "true" : "false" : a.value);
  a = d;
  return a !== c ? (b.setValue(a), true) : false;
}
function Xa(a) {
  a = a || ("undefined" !== typeof document ? document : void 0);
  if ("undefined" === typeof a) return null;
  try {
    return a.activeElement || a.body;
  } catch (b) {
    return a.body;
  }
}
function Ya(a, b) {
  var c = b.checked;
  return A({}, b, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: null != c ? c : a._wrapperState.initialChecked });
}
function Za(a, b) {
  var c = null == b.defaultValue ? "" : b.defaultValue, d = null != b.checked ? b.checked : b.defaultChecked;
  c = Sa(null != b.value ? b.value : c);
  a._wrapperState = { initialChecked: d, initialValue: c, controlled: "checkbox" === b.type || "radio" === b.type ? null != b.checked : null != b.value };
}
function ab(a, b) {
  b = b.checked;
  null != b && ta(a, "checked", b, false);
}
function bb(a, b) {
  ab(a, b);
  var c = Sa(b.value), d = b.type;
  if (null != c) if ("number" === d) {
    if (0 === c && "" === a.value || a.value != c) a.value = "" + c;
  } else a.value !== "" + c && (a.value = "" + c);
  else if ("submit" === d || "reset" === d) {
    a.removeAttribute("value");
    return;
  }
  b.hasOwnProperty("value") ? cb(a, b.type, c) : b.hasOwnProperty("defaultValue") && cb(a, b.type, Sa(b.defaultValue));
  null == b.checked && null != b.defaultChecked && (a.defaultChecked = !!b.defaultChecked);
}
function db(a, b, c) {
  if (b.hasOwnProperty("value") || b.hasOwnProperty("defaultValue")) {
    var d = b.type;
    if (!("submit" !== d && "reset" !== d || void 0 !== b.value && null !== b.value)) return;
    b = "" + a._wrapperState.initialValue;
    c || b === a.value || (a.value = b);
    a.defaultValue = b;
  }
  c = a.name;
  "" !== c && (a.name = "");
  a.defaultChecked = !!a._wrapperState.initialChecked;
  "" !== c && (a.name = c);
}
function cb(a, b, c) {
  if ("number" !== b || Xa(a.ownerDocument) !== a) null == c ? a.defaultValue = "" + a._wrapperState.initialValue : a.defaultValue !== "" + c && (a.defaultValue = "" + c);
}
var eb = Array.isArray;
function fb(a, b, c, d) {
  a = a.options;
  if (b) {
    b = {};
    for (var e = 0; e < c.length; e++) b["$" + c[e]] = true;
    for (c = 0; c < a.length; c++) e = b.hasOwnProperty("$" + a[c].value), a[c].selected !== e && (a[c].selected = e), e && d && (a[c].defaultSelected = true);
  } else {
    c = "" + Sa(c);
    b = null;
    for (e = 0; e < a.length; e++) {
      if (a[e].value === c) {
        a[e].selected = true;
        d && (a[e].defaultSelected = true);
        return;
      }
      null !== b || a[e].disabled || (b = a[e]);
    }
    null !== b && (b.selected = true);
  }
}
function gb(a, b) {
  if (null != b.dangerouslySetInnerHTML) throw Error(p(91));
  return A({}, b, { value: void 0, defaultValue: void 0, children: "" + a._wrapperState.initialValue });
}
function hb(a, b) {
  var c = b.value;
  if (null == c) {
    c = b.children;
    b = b.defaultValue;
    if (null != c) {
      if (null != b) throw Error(p(92));
      if (eb(c)) {
        if (1 < c.length) throw Error(p(93));
        c = c[0];
      }
      b = c;
    }
    null == b && (b = "");
    c = b;
  }
  a._wrapperState = { initialValue: Sa(c) };
}
function ib(a, b) {
  var c = Sa(b.value), d = Sa(b.defaultValue);
  null != c && (c = "" + c, c !== a.value && (a.value = c), null == b.defaultValue && a.defaultValue !== c && (a.defaultValue = c));
  null != d && (a.defaultValue = "" + d);
}
function jb(a) {
  var b = a.textContent;
  b === a._wrapperState.initialValue && "" !== b && null !== b && (a.value = b);
}
function kb(a) {
  switch (a) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function lb(a, b) {
  return null == a || "http://www.w3.org/1999/xhtml" === a ? kb(b) : "http://www.w3.org/2000/svg" === a && "foreignObject" === b ? "http://www.w3.org/1999/xhtml" : a;
}
var mb, nb = function(a) {
  return "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function(b, c, d, e) {
    MSApp.execUnsafeLocalFunction(function() {
      return a(b, c, d, e);
    });
  } : a;
}(function(a, b) {
  if ("http://www.w3.org/2000/svg" !== a.namespaceURI || "innerHTML" in a) a.innerHTML = b;
  else {
    mb = mb || document.createElement("div");
    mb.innerHTML = "<svg>" + b.valueOf().toString() + "</svg>";
    for (b = mb.firstChild; a.firstChild; ) a.removeChild(a.firstChild);
    for (; b.firstChild; ) a.appendChild(b.firstChild);
  }
});
function ob(a, b) {
  if (b) {
    var c = a.firstChild;
    if (c && c === a.lastChild && 3 === c.nodeType) {
      c.nodeValue = b;
      return;
    }
  }
  a.textContent = b;
}
var pb = {
  animationIterationCount: true,
  aspectRatio: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridArea: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true
}, qb = ["Webkit", "ms", "Moz", "O"];
Object.keys(pb).forEach(function(a) {
  qb.forEach(function(b) {
    b = b + a.charAt(0).toUpperCase() + a.substring(1);
    pb[b] = pb[a];
  });
});
function rb(a, b, c) {
  return null == b || "boolean" === typeof b || "" === b ? "" : c || "number" !== typeof b || 0 === b || pb.hasOwnProperty(a) && pb[a] ? ("" + b).trim() : b + "px";
}
function sb(a, b) {
  a = a.style;
  for (var c in b) if (b.hasOwnProperty(c)) {
    var d = 0 === c.indexOf("--"), e = rb(c, b[c], d);
    "float" === c && (c = "cssFloat");
    d ? a.setProperty(c, e) : a[c] = e;
  }
}
var tb = A({ menuitem: true }, { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true });
function ub(a, b) {
  if (b) {
    if (tb[a] && (null != b.children || null != b.dangerouslySetInnerHTML)) throw Error(p(137, a));
    if (null != b.dangerouslySetInnerHTML) {
      if (null != b.children) throw Error(p(60));
      if ("object" !== typeof b.dangerouslySetInnerHTML || !("__html" in b.dangerouslySetInnerHTML)) throw Error(p(61));
    }
    if (null != b.style && "object" !== typeof b.style) throw Error(p(62));
  }
}
function vb(a, b) {
  if (-1 === a.indexOf("-")) return "string" === typeof b.is;
  switch (a) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return false;
    default:
      return true;
  }
}
var wb = null;
function xb(a) {
  a = a.target || a.srcElement || window;
  a.correspondingUseElement && (a = a.correspondingUseElement);
  return 3 === a.nodeType ? a.parentNode : a;
}
var yb = null, zb = null, Ab = null;
function Bb(a) {
  if (a = Cb(a)) {
    if ("function" !== typeof yb) throw Error(p(280));
    var b = a.stateNode;
    b && (b = Db(b), yb(a.stateNode, a.type, b));
  }
}
function Eb(a) {
  zb ? Ab ? Ab.push(a) : Ab = [a] : zb = a;
}
function Fb() {
  if (zb) {
    var a = zb, b = Ab;
    Ab = zb = null;
    Bb(a);
    if (b) for (a = 0; a < b.length; a++) Bb(b[a]);
  }
}
function Gb(a, b) {
  return a(b);
}
function Hb() {
}
var Ib = false;
function Jb(a, b, c) {
  if (Ib) return a(b, c);
  Ib = true;
  try {
    return Gb(a, b, c);
  } finally {
    if (Ib = false, null !== zb || null !== Ab) Hb(), Fb();
  }
}
function Kb(a, b) {
  var c = a.stateNode;
  if (null === c) return null;
  var d = Db(c);
  if (null === d) return null;
  c = d[b];
  a: switch (b) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (d = !d.disabled) || (a = a.type, d = !("button" === a || "input" === a || "select" === a || "textarea" === a));
      a = !d;
      break a;
    default:
      a = false;
  }
  if (a) return null;
  if (c && "function" !== typeof c) throw Error(p(231, b, typeof c));
  return c;
}
var Lb = false;
if (ia) try {
  var Mb = {};
  Object.defineProperty(Mb, "passive", { get: function() {
    Lb = true;
  } });
  window.addEventListener("test", Mb, Mb);
  window.removeEventListener("test", Mb, Mb);
} catch (a) {
  Lb = false;
}
function Nb(a, b, c, d, e, f2, g, h, k2) {
  var l2 = Array.prototype.slice.call(arguments, 3);
  try {
    b.apply(c, l2);
  } catch (m2) {
    this.onError(m2);
  }
}
var Ob = false, Pb = null, Qb = false, Rb = null, Sb = { onError: function(a) {
  Ob = true;
  Pb = a;
} };
function Tb(a, b, c, d, e, f2, g, h, k2) {
  Ob = false;
  Pb = null;
  Nb.apply(Sb, arguments);
}
function Ub(a, b, c, d, e, f2, g, h, k2) {
  Tb.apply(this, arguments);
  if (Ob) {
    if (Ob) {
      var l2 = Pb;
      Ob = false;
      Pb = null;
    } else throw Error(p(198));
    Qb || (Qb = true, Rb = l2);
  }
}
function Vb(a) {
  var b = a, c = a;
  if (a.alternate) for (; b.return; ) b = b.return;
  else {
    a = b;
    do
      b = a, 0 !== (b.flags & 4098) && (c = b.return), a = b.return;
    while (a);
  }
  return 3 === b.tag ? c : null;
}
function Wb(a) {
  if (13 === a.tag) {
    var b = a.memoizedState;
    null === b && (a = a.alternate, null !== a && (b = a.memoizedState));
    if (null !== b) return b.dehydrated;
  }
  return null;
}
function Xb(a) {
  if (Vb(a) !== a) throw Error(p(188));
}
function Yb(a) {
  var b = a.alternate;
  if (!b) {
    b = Vb(a);
    if (null === b) throw Error(p(188));
    return b !== a ? null : a;
  }
  for (var c = a, d = b; ; ) {
    var e = c.return;
    if (null === e) break;
    var f2 = e.alternate;
    if (null === f2) {
      d = e.return;
      if (null !== d) {
        c = d;
        continue;
      }
      break;
    }
    if (e.child === f2.child) {
      for (f2 = e.child; f2; ) {
        if (f2 === c) return Xb(e), a;
        if (f2 === d) return Xb(e), b;
        f2 = f2.sibling;
      }
      throw Error(p(188));
    }
    if (c.return !== d.return) c = e, d = f2;
    else {
      for (var g = false, h = e.child; h; ) {
        if (h === c) {
          g = true;
          c = e;
          d = f2;
          break;
        }
        if (h === d) {
          g = true;
          d = e;
          c = f2;
          break;
        }
        h = h.sibling;
      }
      if (!g) {
        for (h = f2.child; h; ) {
          if (h === c) {
            g = true;
            c = f2;
            d = e;
            break;
          }
          if (h === d) {
            g = true;
            d = f2;
            c = e;
            break;
          }
          h = h.sibling;
        }
        if (!g) throw Error(p(189));
      }
    }
    if (c.alternate !== d) throw Error(p(190));
  }
  if (3 !== c.tag) throw Error(p(188));
  return c.stateNode.current === c ? a : b;
}
function Zb(a) {
  a = Yb(a);
  return null !== a ? $b(a) : null;
}
function $b(a) {
  if (5 === a.tag || 6 === a.tag) return a;
  for (a = a.child; null !== a; ) {
    var b = $b(a);
    if (null !== b) return b;
    a = a.sibling;
  }
  return null;
}
var ac = ca.unstable_scheduleCallback, bc = ca.unstable_cancelCallback, cc = ca.unstable_shouldYield, dc = ca.unstable_requestPaint, B = ca.unstable_now, ec = ca.unstable_getCurrentPriorityLevel, fc = ca.unstable_ImmediatePriority, gc = ca.unstable_UserBlockingPriority, hc = ca.unstable_NormalPriority, ic = ca.unstable_LowPriority, jc = ca.unstable_IdlePriority, kc = null, lc = null;
function mc(a) {
  if (lc && "function" === typeof lc.onCommitFiberRoot) try {
    lc.onCommitFiberRoot(kc, a, void 0, 128 === (a.current.flags & 128));
  } catch (b) {
  }
}
var oc = Math.clz32 ? Math.clz32 : nc, pc = Math.log, qc = Math.LN2;
function nc(a) {
  a >>>= 0;
  return 0 === a ? 32 : 31 - (pc(a) / qc | 0) | 0;
}
var rc = 64, sc = 4194304;
function tc(a) {
  switch (a & -a) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return a & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return a & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return a;
  }
}
function uc(a, b) {
  var c = a.pendingLanes;
  if (0 === c) return 0;
  var d = 0, e = a.suspendedLanes, f2 = a.pingedLanes, g = c & 268435455;
  if (0 !== g) {
    var h = g & ~e;
    0 !== h ? d = tc(h) : (f2 &= g, 0 !== f2 && (d = tc(f2)));
  } else g = c & ~e, 0 !== g ? d = tc(g) : 0 !== f2 && (d = tc(f2));
  if (0 === d) return 0;
  if (0 !== b && b !== d && 0 === (b & e) && (e = d & -d, f2 = b & -b, e >= f2 || 16 === e && 0 !== (f2 & 4194240))) return b;
  0 !== (d & 4) && (d |= c & 16);
  b = a.entangledLanes;
  if (0 !== b) for (a = a.entanglements, b &= d; 0 < b; ) c = 31 - oc(b), e = 1 << c, d |= a[c], b &= ~e;
  return d;
}
function vc(a, b) {
  switch (a) {
    case 1:
    case 2:
    case 4:
      return b + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return b + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function wc(a, b) {
  for (var c = a.suspendedLanes, d = a.pingedLanes, e = a.expirationTimes, f2 = a.pendingLanes; 0 < f2; ) {
    var g = 31 - oc(f2), h = 1 << g, k2 = e[g];
    if (-1 === k2) {
      if (0 === (h & c) || 0 !== (h & d)) e[g] = vc(h, b);
    } else k2 <= b && (a.expiredLanes |= h);
    f2 &= ~h;
  }
}
function xc(a) {
  a = a.pendingLanes & -1073741825;
  return 0 !== a ? a : a & 1073741824 ? 1073741824 : 0;
}
function yc() {
  var a = rc;
  rc <<= 1;
  0 === (rc & 4194240) && (rc = 64);
  return a;
}
function zc(a) {
  for (var b = [], c = 0; 31 > c; c++) b.push(a);
  return b;
}
function Ac(a, b, c) {
  a.pendingLanes |= b;
  536870912 !== b && (a.suspendedLanes = 0, a.pingedLanes = 0);
  a = a.eventTimes;
  b = 31 - oc(b);
  a[b] = c;
}
function Bc(a, b) {
  var c = a.pendingLanes & ~b;
  a.pendingLanes = b;
  a.suspendedLanes = 0;
  a.pingedLanes = 0;
  a.expiredLanes &= b;
  a.mutableReadLanes &= b;
  a.entangledLanes &= b;
  b = a.entanglements;
  var d = a.eventTimes;
  for (a = a.expirationTimes; 0 < c; ) {
    var e = 31 - oc(c), f2 = 1 << e;
    b[e] = 0;
    d[e] = -1;
    a[e] = -1;
    c &= ~f2;
  }
}
function Cc(a, b) {
  var c = a.entangledLanes |= b;
  for (a = a.entanglements; c; ) {
    var d = 31 - oc(c), e = 1 << d;
    e & b | a[d] & b && (a[d] |= b);
    c &= ~e;
  }
}
var C = 0;
function Dc(a) {
  a &= -a;
  return 1 < a ? 4 < a ? 0 !== (a & 268435455) ? 16 : 536870912 : 4 : 1;
}
var Ec, Fc, Gc, Hc, Ic, Jc = false, Kc = [], Lc = null, Mc = null, Nc = null, Oc = /* @__PURE__ */ new Map(), Pc = /* @__PURE__ */ new Map(), Qc = [], Rc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Sc(a, b) {
  switch (a) {
    case "focusin":
    case "focusout":
      Lc = null;
      break;
    case "dragenter":
    case "dragleave":
      Mc = null;
      break;
    case "mouseover":
    case "mouseout":
      Nc = null;
      break;
    case "pointerover":
    case "pointerout":
      Oc.delete(b.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      Pc.delete(b.pointerId);
  }
}
function Tc(a, b, c, d, e, f2) {
  if (null === a || a.nativeEvent !== f2) return a = { blockedOn: b, domEventName: c, eventSystemFlags: d, nativeEvent: f2, targetContainers: [e] }, null !== b && (b = Cb(b), null !== b && Fc(b)), a;
  a.eventSystemFlags |= d;
  b = a.targetContainers;
  null !== e && -1 === b.indexOf(e) && b.push(e);
  return a;
}
function Uc(a, b, c, d, e) {
  switch (b) {
    case "focusin":
      return Lc = Tc(Lc, a, b, c, d, e), true;
    case "dragenter":
      return Mc = Tc(Mc, a, b, c, d, e), true;
    case "mouseover":
      return Nc = Tc(Nc, a, b, c, d, e), true;
    case "pointerover":
      var f2 = e.pointerId;
      Oc.set(f2, Tc(Oc.get(f2) || null, a, b, c, d, e));
      return true;
    case "gotpointercapture":
      return f2 = e.pointerId, Pc.set(f2, Tc(Pc.get(f2) || null, a, b, c, d, e)), true;
  }
  return false;
}
function Vc(a) {
  var b = Wc(a.target);
  if (null !== b) {
    var c = Vb(b);
    if (null !== c) {
      if (b = c.tag, 13 === b) {
        if (b = Wb(c), null !== b) {
          a.blockedOn = b;
          Ic(a.priority, function() {
            Gc(c);
          });
          return;
        }
      } else if (3 === b && c.stateNode.current.memoizedState.isDehydrated) {
        a.blockedOn = 3 === c.tag ? c.stateNode.containerInfo : null;
        return;
      }
    }
  }
  a.blockedOn = null;
}
function Xc(a) {
  if (null !== a.blockedOn) return false;
  for (var b = a.targetContainers; 0 < b.length; ) {
    var c = Yc(a.domEventName, a.eventSystemFlags, b[0], a.nativeEvent);
    if (null === c) {
      c = a.nativeEvent;
      var d = new c.constructor(c.type, c);
      wb = d;
      c.target.dispatchEvent(d);
      wb = null;
    } else return b = Cb(c), null !== b && Fc(b), a.blockedOn = c, false;
    b.shift();
  }
  return true;
}
function Zc(a, b, c) {
  Xc(a) && c.delete(b);
}
function $c() {
  Jc = false;
  null !== Lc && Xc(Lc) && (Lc = null);
  null !== Mc && Xc(Mc) && (Mc = null);
  null !== Nc && Xc(Nc) && (Nc = null);
  Oc.forEach(Zc);
  Pc.forEach(Zc);
}
function ad(a, b) {
  a.blockedOn === b && (a.blockedOn = null, Jc || (Jc = true, ca.unstable_scheduleCallback(ca.unstable_NormalPriority, $c)));
}
function bd(a) {
  function b(b2) {
    return ad(b2, a);
  }
  if (0 < Kc.length) {
    ad(Kc[0], a);
    for (var c = 1; c < Kc.length; c++) {
      var d = Kc[c];
      d.blockedOn === a && (d.blockedOn = null);
    }
  }
  null !== Lc && ad(Lc, a);
  null !== Mc && ad(Mc, a);
  null !== Nc && ad(Nc, a);
  Oc.forEach(b);
  Pc.forEach(b);
  for (c = 0; c < Qc.length; c++) d = Qc[c], d.blockedOn === a && (d.blockedOn = null);
  for (; 0 < Qc.length && (c = Qc[0], null === c.blockedOn); ) Vc(c), null === c.blockedOn && Qc.shift();
}
var cd = ua.ReactCurrentBatchConfig, dd = true;
function ed(a, b, c, d) {
  var e = C, f2 = cd.transition;
  cd.transition = null;
  try {
    C = 1, fd(a, b, c, d);
  } finally {
    C = e, cd.transition = f2;
  }
}
function gd(a, b, c, d) {
  var e = C, f2 = cd.transition;
  cd.transition = null;
  try {
    C = 4, fd(a, b, c, d);
  } finally {
    C = e, cd.transition = f2;
  }
}
function fd(a, b, c, d) {
  if (dd) {
    var e = Yc(a, b, c, d);
    if (null === e) hd(a, b, d, id, c), Sc(a, d);
    else if (Uc(e, a, b, c, d)) d.stopPropagation();
    else if (Sc(a, d), b & 4 && -1 < Rc.indexOf(a)) {
      for (; null !== e; ) {
        var f2 = Cb(e);
        null !== f2 && Ec(f2);
        f2 = Yc(a, b, c, d);
        null === f2 && hd(a, b, d, id, c);
        if (f2 === e) break;
        e = f2;
      }
      null !== e && d.stopPropagation();
    } else hd(a, b, d, null, c);
  }
}
var id = null;
function Yc(a, b, c, d) {
  id = null;
  a = xb(d);
  a = Wc(a);
  if (null !== a) if (b = Vb(a), null === b) a = null;
  else if (c = b.tag, 13 === c) {
    a = Wb(b);
    if (null !== a) return a;
    a = null;
  } else if (3 === c) {
    if (b.stateNode.current.memoizedState.isDehydrated) return 3 === b.tag ? b.stateNode.containerInfo : null;
    a = null;
  } else b !== a && (a = null);
  id = a;
  return null;
}
function jd(a) {
  switch (a) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (ec()) {
        case fc:
          return 1;
        case gc:
          return 4;
        case hc:
        case ic:
          return 16;
        case jc:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var kd = null, ld = null, md = null;
function nd() {
  if (md) return md;
  var a, b = ld, c = b.length, d, e = "value" in kd ? kd.value : kd.textContent, f2 = e.length;
  for (a = 0; a < c && b[a] === e[a]; a++) ;
  var g = c - a;
  for (d = 1; d <= g && b[c - d] === e[f2 - d]; d++) ;
  return md = e.slice(a, 1 < d ? 1 - d : void 0);
}
function od(a) {
  var b = a.keyCode;
  "charCode" in a ? (a = a.charCode, 0 === a && 13 === b && (a = 13)) : a = b;
  10 === a && (a = 13);
  return 32 <= a || 13 === a ? a : 0;
}
function pd() {
  return true;
}
function qd() {
  return false;
}
function rd(a) {
  function b(b2, d, e, f2, g) {
    this._reactName = b2;
    this._targetInst = e;
    this.type = d;
    this.nativeEvent = f2;
    this.target = g;
    this.currentTarget = null;
    for (var c in a) a.hasOwnProperty(c) && (b2 = a[c], this[c] = b2 ? b2(f2) : f2[c]);
    this.isDefaultPrevented = (null != f2.defaultPrevented ? f2.defaultPrevented : false === f2.returnValue) ? pd : qd;
    this.isPropagationStopped = qd;
    return this;
  }
  A(b.prototype, { preventDefault: function() {
    this.defaultPrevented = true;
    var a2 = this.nativeEvent;
    a2 && (a2.preventDefault ? a2.preventDefault() : "unknown" !== typeof a2.returnValue && (a2.returnValue = false), this.isDefaultPrevented = pd);
  }, stopPropagation: function() {
    var a2 = this.nativeEvent;
    a2 && (a2.stopPropagation ? a2.stopPropagation() : "unknown" !== typeof a2.cancelBubble && (a2.cancelBubble = true), this.isPropagationStopped = pd);
  }, persist: function() {
  }, isPersistent: pd });
  return b;
}
var sd = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(a) {
  return a.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, td = rd(sd), ud = A({}, sd, { view: 0, detail: 0 }), vd = rd(ud), wd, xd, yd, Ad = A({}, ud, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: zd, button: 0, buttons: 0, relatedTarget: function(a) {
  return void 0 === a.relatedTarget ? a.fromElement === a.srcElement ? a.toElement : a.fromElement : a.relatedTarget;
}, movementX: function(a) {
  if ("movementX" in a) return a.movementX;
  a !== yd && (yd && "mousemove" === a.type ? (wd = a.screenX - yd.screenX, xd = a.screenY - yd.screenY) : xd = wd = 0, yd = a);
  return wd;
}, movementY: function(a) {
  return "movementY" in a ? a.movementY : xd;
} }), Bd = rd(Ad), Cd = A({}, Ad, { dataTransfer: 0 }), Dd = rd(Cd), Ed = A({}, ud, { relatedTarget: 0 }), Fd = rd(Ed), Gd = A({}, sd, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Hd = rd(Gd), Id = A({}, sd, { clipboardData: function(a) {
  return "clipboardData" in a ? a.clipboardData : window.clipboardData;
} }), Jd = rd(Id), Kd = A({}, sd, { data: 0 }), Ld = rd(Kd), Md = {
  Esc: "Escape",
  Spacebar: " ",
  Left: "ArrowLeft",
  Up: "ArrowUp",
  Right: "ArrowRight",
  Down: "ArrowDown",
  Del: "Delete",
  Win: "OS",
  Menu: "ContextMenu",
  Apps: "ContextMenu",
  Scroll: "ScrollLock",
  MozPrintableKey: "Unidentified"
}, Nd = {
  8: "Backspace",
  9: "Tab",
  12: "Clear",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  45: "Insert",
  46: "Delete",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NumLock",
  145: "ScrollLock",
  224: "Meta"
}, Od = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function Pd(a) {
  var b = this.nativeEvent;
  return b.getModifierState ? b.getModifierState(a) : (a = Od[a]) ? !!b[a] : false;
}
function zd() {
  return Pd;
}
var Qd = A({}, ud, { key: function(a) {
  if (a.key) {
    var b = Md[a.key] || a.key;
    if ("Unidentified" !== b) return b;
  }
  return "keypress" === a.type ? (a = od(a), 13 === a ? "Enter" : String.fromCharCode(a)) : "keydown" === a.type || "keyup" === a.type ? Nd[a.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: zd, charCode: function(a) {
  return "keypress" === a.type ? od(a) : 0;
}, keyCode: function(a) {
  return "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
}, which: function(a) {
  return "keypress" === a.type ? od(a) : "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
} }), Rd = rd(Qd), Sd = A({}, Ad, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Td = rd(Sd), Ud = A({}, ud, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: zd }), Vd = rd(Ud), Wd = A({}, sd, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Xd = rd(Wd), Yd = A({}, Ad, {
  deltaX: function(a) {
    return "deltaX" in a ? a.deltaX : "wheelDeltaX" in a ? -a.wheelDeltaX : 0;
  },
  deltaY: function(a) {
    return "deltaY" in a ? a.deltaY : "wheelDeltaY" in a ? -a.wheelDeltaY : "wheelDelta" in a ? -a.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Zd = rd(Yd), $d = [9, 13, 27, 32], ae = ia && "CompositionEvent" in window, be = null;
ia && "documentMode" in document && (be = document.documentMode);
var ce = ia && "TextEvent" in window && !be, de = ia && (!ae || be && 8 < be && 11 >= be), ee = String.fromCharCode(32), fe = false;
function ge(a, b) {
  switch (a) {
    case "keyup":
      return -1 !== $d.indexOf(b.keyCode);
    case "keydown":
      return 229 !== b.keyCode;
    case "keypress":
    case "mousedown":
    case "focusout":
      return true;
    default:
      return false;
  }
}
function he(a) {
  a = a.detail;
  return "object" === typeof a && "data" in a ? a.data : null;
}
var ie = false;
function je(a, b) {
  switch (a) {
    case "compositionend":
      return he(b);
    case "keypress":
      if (32 !== b.which) return null;
      fe = true;
      return ee;
    case "textInput":
      return a = b.data, a === ee && fe ? null : a;
    default:
      return null;
  }
}
function ke(a, b) {
  if (ie) return "compositionend" === a || !ae && ge(a, b) ? (a = nd(), md = ld = kd = null, ie = false, a) : null;
  switch (a) {
    case "paste":
      return null;
    case "keypress":
      if (!(b.ctrlKey || b.altKey || b.metaKey) || b.ctrlKey && b.altKey) {
        if (b.char && 1 < b.char.length) return b.char;
        if (b.which) return String.fromCharCode(b.which);
      }
      return null;
    case "compositionend":
      return de && "ko" !== b.locale ? null : b.data;
    default:
      return null;
  }
}
var le = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
function me(a) {
  var b = a && a.nodeName && a.nodeName.toLowerCase();
  return "input" === b ? !!le[a.type] : "textarea" === b ? true : false;
}
function ne(a, b, c, d) {
  Eb(d);
  b = oe(b, "onChange");
  0 < b.length && (c = new td("onChange", "change", null, c, d), a.push({ event: c, listeners: b }));
}
var pe = null, qe = null;
function re(a) {
  se(a, 0);
}
function te(a) {
  var b = ue(a);
  if (Wa(b)) return a;
}
function ve(a, b) {
  if ("change" === a) return b;
}
var we = false;
if (ia) {
  var xe;
  if (ia) {
    var ye = "oninput" in document;
    if (!ye) {
      var ze = document.createElement("div");
      ze.setAttribute("oninput", "return;");
      ye = "function" === typeof ze.oninput;
    }
    xe = ye;
  } else xe = false;
  we = xe && (!document.documentMode || 9 < document.documentMode);
}
function Ae() {
  pe && (pe.detachEvent("onpropertychange", Be), qe = pe = null);
}
function Be(a) {
  if ("value" === a.propertyName && te(qe)) {
    var b = [];
    ne(b, qe, a, xb(a));
    Jb(re, b);
  }
}
function Ce(a, b, c) {
  "focusin" === a ? (Ae(), pe = b, qe = c, pe.attachEvent("onpropertychange", Be)) : "focusout" === a && Ae();
}
function De(a) {
  if ("selectionchange" === a || "keyup" === a || "keydown" === a) return te(qe);
}
function Ee(a, b) {
  if ("click" === a) return te(b);
}
function Fe(a, b) {
  if ("input" === a || "change" === a) return te(b);
}
function Ge(a, b) {
  return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
}
var He = "function" === typeof Object.is ? Object.is : Ge;
function Ie(a, b) {
  if (He(a, b)) return true;
  if ("object" !== typeof a || null === a || "object" !== typeof b || null === b) return false;
  var c = Object.keys(a), d = Object.keys(b);
  if (c.length !== d.length) return false;
  for (d = 0; d < c.length; d++) {
    var e = c[d];
    if (!ja.call(b, e) || !He(a[e], b[e])) return false;
  }
  return true;
}
function Je(a) {
  for (; a && a.firstChild; ) a = a.firstChild;
  return a;
}
function Ke(a, b) {
  var c = Je(a);
  a = 0;
  for (var d; c; ) {
    if (3 === c.nodeType) {
      d = a + c.textContent.length;
      if (a <= b && d >= b) return { node: c, offset: b - a };
      a = d;
    }
    a: {
      for (; c; ) {
        if (c.nextSibling) {
          c = c.nextSibling;
          break a;
        }
        c = c.parentNode;
      }
      c = void 0;
    }
    c = Je(c);
  }
}
function Le(a, b) {
  return a && b ? a === b ? true : a && 3 === a.nodeType ? false : b && 3 === b.nodeType ? Le(a, b.parentNode) : "contains" in a ? a.contains(b) : a.compareDocumentPosition ? !!(a.compareDocumentPosition(b) & 16) : false : false;
}
function Me() {
  for (var a = window, b = Xa(); b instanceof a.HTMLIFrameElement; ) {
    try {
      var c = "string" === typeof b.contentWindow.location.href;
    } catch (d) {
      c = false;
    }
    if (c) a = b.contentWindow;
    else break;
    b = Xa(a.document);
  }
  return b;
}
function Ne(a) {
  var b = a && a.nodeName && a.nodeName.toLowerCase();
  return b && ("input" === b && ("text" === a.type || "search" === a.type || "tel" === a.type || "url" === a.type || "password" === a.type) || "textarea" === b || "true" === a.contentEditable);
}
function Oe(a) {
  var b = Me(), c = a.focusedElem, d = a.selectionRange;
  if (b !== c && c && c.ownerDocument && Le(c.ownerDocument.documentElement, c)) {
    if (null !== d && Ne(c)) {
      if (b = d.start, a = d.end, void 0 === a && (a = b), "selectionStart" in c) c.selectionStart = b, c.selectionEnd = Math.min(a, c.value.length);
      else if (a = (b = c.ownerDocument || document) && b.defaultView || window, a.getSelection) {
        a = a.getSelection();
        var e = c.textContent.length, f2 = Math.min(d.start, e);
        d = void 0 === d.end ? f2 : Math.min(d.end, e);
        !a.extend && f2 > d && (e = d, d = f2, f2 = e);
        e = Ke(c, f2);
        var g = Ke(
          c,
          d
        );
        e && g && (1 !== a.rangeCount || a.anchorNode !== e.node || a.anchorOffset !== e.offset || a.focusNode !== g.node || a.focusOffset !== g.offset) && (b = b.createRange(), b.setStart(e.node, e.offset), a.removeAllRanges(), f2 > d ? (a.addRange(b), a.extend(g.node, g.offset)) : (b.setEnd(g.node, g.offset), a.addRange(b)));
      }
    }
    b = [];
    for (a = c; a = a.parentNode; ) 1 === a.nodeType && b.push({ element: a, left: a.scrollLeft, top: a.scrollTop });
    "function" === typeof c.focus && c.focus();
    for (c = 0; c < b.length; c++) a = b[c], a.element.scrollLeft = a.left, a.element.scrollTop = a.top;
  }
}
var Pe = ia && "documentMode" in document && 11 >= document.documentMode, Qe = null, Re = null, Se = null, Te = false;
function Ue(a, b, c) {
  var d = c.window === c ? c.document : 9 === c.nodeType ? c : c.ownerDocument;
  Te || null == Qe || Qe !== Xa(d) || (d = Qe, "selectionStart" in d && Ne(d) ? d = { start: d.selectionStart, end: d.selectionEnd } : (d = (d.ownerDocument && d.ownerDocument.defaultView || window).getSelection(), d = { anchorNode: d.anchorNode, anchorOffset: d.anchorOffset, focusNode: d.focusNode, focusOffset: d.focusOffset }), Se && Ie(Se, d) || (Se = d, d = oe(Re, "onSelect"), 0 < d.length && (b = new td("onSelect", "select", null, b, c), a.push({ event: b, listeners: d }), b.target = Qe)));
}
function Ve(a, b) {
  var c = {};
  c[a.toLowerCase()] = b.toLowerCase();
  c["Webkit" + a] = "webkit" + b;
  c["Moz" + a] = "moz" + b;
  return c;
}
var We = { animationend: Ve("Animation", "AnimationEnd"), animationiteration: Ve("Animation", "AnimationIteration"), animationstart: Ve("Animation", "AnimationStart"), transitionend: Ve("Transition", "TransitionEnd") }, Xe = {}, Ye = {};
ia && (Ye = document.createElement("div").style, "AnimationEvent" in window || (delete We.animationend.animation, delete We.animationiteration.animation, delete We.animationstart.animation), "TransitionEvent" in window || delete We.transitionend.transition);
function Ze(a) {
  if (Xe[a]) return Xe[a];
  if (!We[a]) return a;
  var b = We[a], c;
  for (c in b) if (b.hasOwnProperty(c) && c in Ye) return Xe[a] = b[c];
  return a;
}
var $e = Ze("animationend"), af = Ze("animationiteration"), bf = Ze("animationstart"), cf = Ze("transitionend"), df = /* @__PURE__ */ new Map(), ef = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function ff(a, b) {
  df.set(a, b);
  fa(b, [a]);
}
for (var gf = 0; gf < ef.length; gf++) {
  var hf = ef[gf], jf = hf.toLowerCase(), kf = hf[0].toUpperCase() + hf.slice(1);
  ff(jf, "on" + kf);
}
ff($e, "onAnimationEnd");
ff(af, "onAnimationIteration");
ff(bf, "onAnimationStart");
ff("dblclick", "onDoubleClick");
ff("focusin", "onFocus");
ff("focusout", "onBlur");
ff(cf, "onTransitionEnd");
ha("onMouseEnter", ["mouseout", "mouseover"]);
ha("onMouseLeave", ["mouseout", "mouseover"]);
ha("onPointerEnter", ["pointerout", "pointerover"]);
ha("onPointerLeave", ["pointerout", "pointerover"]);
fa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
fa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
fa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
fa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
fa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
fa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var lf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
function nf(a, b, c) {
  var d = a.type || "unknown-event";
  a.currentTarget = c;
  Ub(d, b, void 0, a);
  a.currentTarget = null;
}
function se(a, b) {
  b = 0 !== (b & 4);
  for (var c = 0; c < a.length; c++) {
    var d = a[c], e = d.event;
    d = d.listeners;
    a: {
      var f2 = void 0;
      if (b) for (var g = d.length - 1; 0 <= g; g--) {
        var h = d[g], k2 = h.instance, l2 = h.currentTarget;
        h = h.listener;
        if (k2 !== f2 && e.isPropagationStopped()) break a;
        nf(e, h, l2);
        f2 = k2;
      }
      else for (g = 0; g < d.length; g++) {
        h = d[g];
        k2 = h.instance;
        l2 = h.currentTarget;
        h = h.listener;
        if (k2 !== f2 && e.isPropagationStopped()) break a;
        nf(e, h, l2);
        f2 = k2;
      }
    }
  }
  if (Qb) throw a = Rb, Qb = false, Rb = null, a;
}
function D(a, b) {
  var c = b[of];
  void 0 === c && (c = b[of] = /* @__PURE__ */ new Set());
  var d = a + "__bubble";
  c.has(d) || (pf(b, a, 2, false), c.add(d));
}
function qf(a, b, c) {
  var d = 0;
  b && (d |= 4);
  pf(c, a, d, b);
}
var rf = "_reactListening" + Math.random().toString(36).slice(2);
function sf(a) {
  if (!a[rf]) {
    a[rf] = true;
    da.forEach(function(b2) {
      "selectionchange" !== b2 && (mf.has(b2) || qf(b2, false, a), qf(b2, true, a));
    });
    var b = 9 === a.nodeType ? a : a.ownerDocument;
    null === b || b[rf] || (b[rf] = true, qf("selectionchange", false, b));
  }
}
function pf(a, b, c, d) {
  switch (jd(b)) {
    case 1:
      var e = ed;
      break;
    case 4:
      e = gd;
      break;
    default:
      e = fd;
  }
  c = e.bind(null, b, c, a);
  e = void 0;
  !Lb || "touchstart" !== b && "touchmove" !== b && "wheel" !== b || (e = true);
  d ? void 0 !== e ? a.addEventListener(b, c, { capture: true, passive: e }) : a.addEventListener(b, c, true) : void 0 !== e ? a.addEventListener(b, c, { passive: e }) : a.addEventListener(b, c, false);
}
function hd(a, b, c, d, e) {
  var f2 = d;
  if (0 === (b & 1) && 0 === (b & 2) && null !== d) a: for (; ; ) {
    if (null === d) return;
    var g = d.tag;
    if (3 === g || 4 === g) {
      var h = d.stateNode.containerInfo;
      if (h === e || 8 === h.nodeType && h.parentNode === e) break;
      if (4 === g) for (g = d.return; null !== g; ) {
        var k2 = g.tag;
        if (3 === k2 || 4 === k2) {
          if (k2 = g.stateNode.containerInfo, k2 === e || 8 === k2.nodeType && k2.parentNode === e) return;
        }
        g = g.return;
      }
      for (; null !== h; ) {
        g = Wc(h);
        if (null === g) return;
        k2 = g.tag;
        if (5 === k2 || 6 === k2) {
          d = f2 = g;
          continue a;
        }
        h = h.parentNode;
      }
    }
    d = d.return;
  }
  Jb(function() {
    var d2 = f2, e2 = xb(c), g2 = [];
    a: {
      var h2 = df.get(a);
      if (void 0 !== h2) {
        var k3 = td, n2 = a;
        switch (a) {
          case "keypress":
            if (0 === od(c)) break a;
          case "keydown":
          case "keyup":
            k3 = Rd;
            break;
          case "focusin":
            n2 = "focus";
            k3 = Fd;
            break;
          case "focusout":
            n2 = "blur";
            k3 = Fd;
            break;
          case "beforeblur":
          case "afterblur":
            k3 = Fd;
            break;
          case "click":
            if (2 === c.button) break a;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            k3 = Bd;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            k3 = Dd;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            k3 = Vd;
            break;
          case $e:
          case af:
          case bf:
            k3 = Hd;
            break;
          case cf:
            k3 = Xd;
            break;
          case "scroll":
            k3 = vd;
            break;
          case "wheel":
            k3 = Zd;
            break;
          case "copy":
          case "cut":
          case "paste":
            k3 = Jd;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            k3 = Td;
        }
        var t2 = 0 !== (b & 4), J2 = !t2 && "scroll" === a, x2 = t2 ? null !== h2 ? h2 + "Capture" : null : h2;
        t2 = [];
        for (var w2 = d2, u2; null !== w2; ) {
          u2 = w2;
          var F2 = u2.stateNode;
          5 === u2.tag && null !== F2 && (u2 = F2, null !== x2 && (F2 = Kb(w2, x2), null != F2 && t2.push(tf(w2, F2, u2))));
          if (J2) break;
          w2 = w2.return;
        }
        0 < t2.length && (h2 = new k3(h2, n2, null, c, e2), g2.push({ event: h2, listeners: t2 }));
      }
    }
    if (0 === (b & 7)) {
      a: {
        h2 = "mouseover" === a || "pointerover" === a;
        k3 = "mouseout" === a || "pointerout" === a;
        if (h2 && c !== wb && (n2 = c.relatedTarget || c.fromElement) && (Wc(n2) || n2[uf])) break a;
        if (k3 || h2) {
          h2 = e2.window === e2 ? e2 : (h2 = e2.ownerDocument) ? h2.defaultView || h2.parentWindow : window;
          if (k3) {
            if (n2 = c.relatedTarget || c.toElement, k3 = d2, n2 = n2 ? Wc(n2) : null, null !== n2 && (J2 = Vb(n2), n2 !== J2 || 5 !== n2.tag && 6 !== n2.tag)) n2 = null;
          } else k3 = null, n2 = d2;
          if (k3 !== n2) {
            t2 = Bd;
            F2 = "onMouseLeave";
            x2 = "onMouseEnter";
            w2 = "mouse";
            if ("pointerout" === a || "pointerover" === a) t2 = Td, F2 = "onPointerLeave", x2 = "onPointerEnter", w2 = "pointer";
            J2 = null == k3 ? h2 : ue(k3);
            u2 = null == n2 ? h2 : ue(n2);
            h2 = new t2(F2, w2 + "leave", k3, c, e2);
            h2.target = J2;
            h2.relatedTarget = u2;
            F2 = null;
            Wc(e2) === d2 && (t2 = new t2(x2, w2 + "enter", n2, c, e2), t2.target = u2, t2.relatedTarget = J2, F2 = t2);
            J2 = F2;
            if (k3 && n2) b: {
              t2 = k3;
              x2 = n2;
              w2 = 0;
              for (u2 = t2; u2; u2 = vf(u2)) w2++;
              u2 = 0;
              for (F2 = x2; F2; F2 = vf(F2)) u2++;
              for (; 0 < w2 - u2; ) t2 = vf(t2), w2--;
              for (; 0 < u2 - w2; ) x2 = vf(x2), u2--;
              for (; w2--; ) {
                if (t2 === x2 || null !== x2 && t2 === x2.alternate) break b;
                t2 = vf(t2);
                x2 = vf(x2);
              }
              t2 = null;
            }
            else t2 = null;
            null !== k3 && wf(g2, h2, k3, t2, false);
            null !== n2 && null !== J2 && wf(g2, J2, n2, t2, true);
          }
        }
      }
      a: {
        h2 = d2 ? ue(d2) : window;
        k3 = h2.nodeName && h2.nodeName.toLowerCase();
        if ("select" === k3 || "input" === k3 && "file" === h2.type) var na = ve;
        else if (me(h2)) if (we) na = Fe;
        else {
          na = De;
          var xa = Ce;
        }
        else (k3 = h2.nodeName) && "input" === k3.toLowerCase() && ("checkbox" === h2.type || "radio" === h2.type) && (na = Ee);
        if (na && (na = na(a, d2))) {
          ne(g2, na, c, e2);
          break a;
        }
        xa && xa(a, h2, d2);
        "focusout" === a && (xa = h2._wrapperState) && xa.controlled && "number" === h2.type && cb(h2, "number", h2.value);
      }
      xa = d2 ? ue(d2) : window;
      switch (a) {
        case "focusin":
          if (me(xa) || "true" === xa.contentEditable) Qe = xa, Re = d2, Se = null;
          break;
        case "focusout":
          Se = Re = Qe = null;
          break;
        case "mousedown":
          Te = true;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Te = false;
          Ue(g2, c, e2);
          break;
        case "selectionchange":
          if (Pe) break;
        case "keydown":
        case "keyup":
          Ue(g2, c, e2);
      }
      var $a;
      if (ae) b: {
        switch (a) {
          case "compositionstart":
            var ba = "onCompositionStart";
            break b;
          case "compositionend":
            ba = "onCompositionEnd";
            break b;
          case "compositionupdate":
            ba = "onCompositionUpdate";
            break b;
        }
        ba = void 0;
      }
      else ie ? ge(a, c) && (ba = "onCompositionEnd") : "keydown" === a && 229 === c.keyCode && (ba = "onCompositionStart");
      ba && (de && "ko" !== c.locale && (ie || "onCompositionStart" !== ba ? "onCompositionEnd" === ba && ie && ($a = nd()) : (kd = e2, ld = "value" in kd ? kd.value : kd.textContent, ie = true)), xa = oe(d2, ba), 0 < xa.length && (ba = new Ld(ba, a, null, c, e2), g2.push({ event: ba, listeners: xa }), $a ? ba.data = $a : ($a = he(c), null !== $a && (ba.data = $a))));
      if ($a = ce ? je(a, c) : ke(a, c)) d2 = oe(d2, "onBeforeInput"), 0 < d2.length && (e2 = new Ld("onBeforeInput", "beforeinput", null, c, e2), g2.push({ event: e2, listeners: d2 }), e2.data = $a);
    }
    se(g2, b);
  });
}
function tf(a, b, c) {
  return { instance: a, listener: b, currentTarget: c };
}
function oe(a, b) {
  for (var c = b + "Capture", d = []; null !== a; ) {
    var e = a, f2 = e.stateNode;
    5 === e.tag && null !== f2 && (e = f2, f2 = Kb(a, c), null != f2 && d.unshift(tf(a, f2, e)), f2 = Kb(a, b), null != f2 && d.push(tf(a, f2, e)));
    a = a.return;
  }
  return d;
}
function vf(a) {
  if (null === a) return null;
  do
    a = a.return;
  while (a && 5 !== a.tag);
  return a ? a : null;
}
function wf(a, b, c, d, e) {
  for (var f2 = b._reactName, g = []; null !== c && c !== d; ) {
    var h = c, k2 = h.alternate, l2 = h.stateNode;
    if (null !== k2 && k2 === d) break;
    5 === h.tag && null !== l2 && (h = l2, e ? (k2 = Kb(c, f2), null != k2 && g.unshift(tf(c, k2, h))) : e || (k2 = Kb(c, f2), null != k2 && g.push(tf(c, k2, h))));
    c = c.return;
  }
  0 !== g.length && a.push({ event: b, listeners: g });
}
var xf = /\r\n?/g, yf = /\u0000|\uFFFD/g;
function zf(a) {
  return ("string" === typeof a ? a : "" + a).replace(xf, "\n").replace(yf, "");
}
function Af(a, b, c) {
  b = zf(b);
  if (zf(a) !== b && c) throw Error(p(425));
}
function Bf() {
}
var Cf = null, Df = null;
function Ef(a, b) {
  return "textarea" === a || "noscript" === a || "string" === typeof b.children || "number" === typeof b.children || "object" === typeof b.dangerouslySetInnerHTML && null !== b.dangerouslySetInnerHTML && null != b.dangerouslySetInnerHTML.__html;
}
var Ff = "function" === typeof setTimeout ? setTimeout : void 0, Gf = "function" === typeof clearTimeout ? clearTimeout : void 0, Hf = "function" === typeof Promise ? Promise : void 0, Jf = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof Hf ? function(a) {
  return Hf.resolve(null).then(a).catch(If);
} : Ff;
function If(a) {
  setTimeout(function() {
    throw a;
  });
}
function Kf(a, b) {
  var c = b, d = 0;
  do {
    var e = c.nextSibling;
    a.removeChild(c);
    if (e && 8 === e.nodeType) if (c = e.data, "/$" === c) {
      if (0 === d) {
        a.removeChild(e);
        bd(b);
        return;
      }
      d--;
    } else "$" !== c && "$?" !== c && "$!" !== c || d++;
    c = e;
  } while (c);
  bd(b);
}
function Lf(a) {
  for (; null != a; a = a.nextSibling) {
    var b = a.nodeType;
    if (1 === b || 3 === b) break;
    if (8 === b) {
      b = a.data;
      if ("$" === b || "$!" === b || "$?" === b) break;
      if ("/$" === b) return null;
    }
  }
  return a;
}
function Mf(a) {
  a = a.previousSibling;
  for (var b = 0; a; ) {
    if (8 === a.nodeType) {
      var c = a.data;
      if ("$" === c || "$!" === c || "$?" === c) {
        if (0 === b) return a;
        b--;
      } else "/$" === c && b++;
    }
    a = a.previousSibling;
  }
  return null;
}
var Nf = Math.random().toString(36).slice(2), Of = "__reactFiber$" + Nf, Pf = "__reactProps$" + Nf, uf = "__reactContainer$" + Nf, of = "__reactEvents$" + Nf, Qf = "__reactListeners$" + Nf, Rf = "__reactHandles$" + Nf;
function Wc(a) {
  var b = a[Of];
  if (b) return b;
  for (var c = a.parentNode; c; ) {
    if (b = c[uf] || c[Of]) {
      c = b.alternate;
      if (null !== b.child || null !== c && null !== c.child) for (a = Mf(a); null !== a; ) {
        if (c = a[Of]) return c;
        a = Mf(a);
      }
      return b;
    }
    a = c;
    c = a.parentNode;
  }
  return null;
}
function Cb(a) {
  a = a[Of] || a[uf];
  return !a || 5 !== a.tag && 6 !== a.tag && 13 !== a.tag && 3 !== a.tag ? null : a;
}
function ue(a) {
  if (5 === a.tag || 6 === a.tag) return a.stateNode;
  throw Error(p(33));
}
function Db(a) {
  return a[Pf] || null;
}
var Sf = [], Tf = -1;
function Uf(a) {
  return { current: a };
}
function E(a) {
  0 > Tf || (a.current = Sf[Tf], Sf[Tf] = null, Tf--);
}
function G(a, b) {
  Tf++;
  Sf[Tf] = a.current;
  a.current = b;
}
var Vf = {}, H = Uf(Vf), Wf = Uf(false), Xf = Vf;
function Yf(a, b) {
  var c = a.type.contextTypes;
  if (!c) return Vf;
  var d = a.stateNode;
  if (d && d.__reactInternalMemoizedUnmaskedChildContext === b) return d.__reactInternalMemoizedMaskedChildContext;
  var e = {}, f2;
  for (f2 in c) e[f2] = b[f2];
  d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = b, a.__reactInternalMemoizedMaskedChildContext = e);
  return e;
}
function Zf(a) {
  a = a.childContextTypes;
  return null !== a && void 0 !== a;
}
function $f() {
  E(Wf);
  E(H);
}
function ag(a, b, c) {
  if (H.current !== Vf) throw Error(p(168));
  G(H, b);
  G(Wf, c);
}
function bg(a, b, c) {
  var d = a.stateNode;
  b = b.childContextTypes;
  if ("function" !== typeof d.getChildContext) return c;
  d = d.getChildContext();
  for (var e in d) if (!(e in b)) throw Error(p(108, Ra(a) || "Unknown", e));
  return A({}, c, d);
}
function cg(a) {
  a = (a = a.stateNode) && a.__reactInternalMemoizedMergedChildContext || Vf;
  Xf = H.current;
  G(H, a);
  G(Wf, Wf.current);
  return true;
}
function dg(a, b, c) {
  var d = a.stateNode;
  if (!d) throw Error(p(169));
  c ? (a = bg(a, b, Xf), d.__reactInternalMemoizedMergedChildContext = a, E(Wf), E(H), G(H, a)) : E(Wf);
  G(Wf, c);
}
var eg = null, fg = false, gg = false;
function hg(a) {
  null === eg ? eg = [a] : eg.push(a);
}
function ig(a) {
  fg = true;
  hg(a);
}
function jg() {
  if (!gg && null !== eg) {
    gg = true;
    var a = 0, b = C;
    try {
      var c = eg;
      for (C = 1; a < c.length; a++) {
        var d = c[a];
        do
          d = d(true);
        while (null !== d);
      }
      eg = null;
      fg = false;
    } catch (e) {
      throw null !== eg && (eg = eg.slice(a + 1)), ac(fc, jg), e;
    } finally {
      C = b, gg = false;
    }
  }
  return null;
}
var kg = [], lg = 0, mg = null, ng = 0, og = [], pg = 0, qg = null, rg = 1, sg = "";
function tg(a, b) {
  kg[lg++] = ng;
  kg[lg++] = mg;
  mg = a;
  ng = b;
}
function ug(a, b, c) {
  og[pg++] = rg;
  og[pg++] = sg;
  og[pg++] = qg;
  qg = a;
  var d = rg;
  a = sg;
  var e = 32 - oc(d) - 1;
  d &= ~(1 << e);
  c += 1;
  var f2 = 32 - oc(b) + e;
  if (30 < f2) {
    var g = e - e % 5;
    f2 = (d & (1 << g) - 1).toString(32);
    d >>= g;
    e -= g;
    rg = 1 << 32 - oc(b) + e | c << e | d;
    sg = f2 + a;
  } else rg = 1 << f2 | c << e | d, sg = a;
}
function vg(a) {
  null !== a.return && (tg(a, 1), ug(a, 1, 0));
}
function wg(a) {
  for (; a === mg; ) mg = kg[--lg], kg[lg] = null, ng = kg[--lg], kg[lg] = null;
  for (; a === qg; ) qg = og[--pg], og[pg] = null, sg = og[--pg], og[pg] = null, rg = og[--pg], og[pg] = null;
}
var xg = null, yg = null, I = false, zg = null;
function Ag(a, b) {
  var c = Bg(5, null, null, 0);
  c.elementType = "DELETED";
  c.stateNode = b;
  c.return = a;
  b = a.deletions;
  null === b ? (a.deletions = [c], a.flags |= 16) : b.push(c);
}
function Cg(a, b) {
  switch (a.tag) {
    case 5:
      var c = a.type;
      b = 1 !== b.nodeType || c.toLowerCase() !== b.nodeName.toLowerCase() ? null : b;
      return null !== b ? (a.stateNode = b, xg = a, yg = Lf(b.firstChild), true) : false;
    case 6:
      return b = "" === a.pendingProps || 3 !== b.nodeType ? null : b, null !== b ? (a.stateNode = b, xg = a, yg = null, true) : false;
    case 13:
      return b = 8 !== b.nodeType ? null : b, null !== b ? (c = null !== qg ? { id: rg, overflow: sg } : null, a.memoizedState = { dehydrated: b, treeContext: c, retryLane: 1073741824 }, c = Bg(18, null, null, 0), c.stateNode = b, c.return = a, a.child = c, xg = a, yg = null, true) : false;
    default:
      return false;
  }
}
function Dg(a) {
  return 0 !== (a.mode & 1) && 0 === (a.flags & 128);
}
function Eg(a) {
  if (I) {
    var b = yg;
    if (b) {
      var c = b;
      if (!Cg(a, b)) {
        if (Dg(a)) throw Error(p(418));
        b = Lf(c.nextSibling);
        var d = xg;
        b && Cg(a, b) ? Ag(d, c) : (a.flags = a.flags & -4097 | 2, I = false, xg = a);
      }
    } else {
      if (Dg(a)) throw Error(p(418));
      a.flags = a.flags & -4097 | 2;
      I = false;
      xg = a;
    }
  }
}
function Fg(a) {
  for (a = a.return; null !== a && 5 !== a.tag && 3 !== a.tag && 13 !== a.tag; ) a = a.return;
  xg = a;
}
function Gg(a) {
  if (a !== xg) return false;
  if (!I) return Fg(a), I = true, false;
  var b;
  (b = 3 !== a.tag) && !(b = 5 !== a.tag) && (b = a.type, b = "head" !== b && "body" !== b && !Ef(a.type, a.memoizedProps));
  if (b && (b = yg)) {
    if (Dg(a)) throw Hg(), Error(p(418));
    for (; b; ) Ag(a, b), b = Lf(b.nextSibling);
  }
  Fg(a);
  if (13 === a.tag) {
    a = a.memoizedState;
    a = null !== a ? a.dehydrated : null;
    if (!a) throw Error(p(317));
    a: {
      a = a.nextSibling;
      for (b = 0; a; ) {
        if (8 === a.nodeType) {
          var c = a.data;
          if ("/$" === c) {
            if (0 === b) {
              yg = Lf(a.nextSibling);
              break a;
            }
            b--;
          } else "$" !== c && "$!" !== c && "$?" !== c || b++;
        }
        a = a.nextSibling;
      }
      yg = null;
    }
  } else yg = xg ? Lf(a.stateNode.nextSibling) : null;
  return true;
}
function Hg() {
  for (var a = yg; a; ) a = Lf(a.nextSibling);
}
function Ig() {
  yg = xg = null;
  I = false;
}
function Jg(a) {
  null === zg ? zg = [a] : zg.push(a);
}
var Kg = ua.ReactCurrentBatchConfig;
function Lg(a, b, c) {
  a = c.ref;
  if (null !== a && "function" !== typeof a && "object" !== typeof a) {
    if (c._owner) {
      c = c._owner;
      if (c) {
        if (1 !== c.tag) throw Error(p(309));
        var d = c.stateNode;
      }
      if (!d) throw Error(p(147, a));
      var e = d, f2 = "" + a;
      if (null !== b && null !== b.ref && "function" === typeof b.ref && b.ref._stringRef === f2) return b.ref;
      b = function(a2) {
        var b2 = e.refs;
        null === a2 ? delete b2[f2] : b2[f2] = a2;
      };
      b._stringRef = f2;
      return b;
    }
    if ("string" !== typeof a) throw Error(p(284));
    if (!c._owner) throw Error(p(290, a));
  }
  return a;
}
function Mg(a, b) {
  a = Object.prototype.toString.call(b);
  throw Error(p(31, "[object Object]" === a ? "object with keys {" + Object.keys(b).join(", ") + "}" : a));
}
function Ng(a) {
  var b = a._init;
  return b(a._payload);
}
function Og(a) {
  function b(b2, c2) {
    if (a) {
      var d2 = b2.deletions;
      null === d2 ? (b2.deletions = [c2], b2.flags |= 16) : d2.push(c2);
    }
  }
  function c(c2, d2) {
    if (!a) return null;
    for (; null !== d2; ) b(c2, d2), d2 = d2.sibling;
    return null;
  }
  function d(a2, b2) {
    for (a2 = /* @__PURE__ */ new Map(); null !== b2; ) null !== b2.key ? a2.set(b2.key, b2) : a2.set(b2.index, b2), b2 = b2.sibling;
    return a2;
  }
  function e(a2, b2) {
    a2 = Pg(a2, b2);
    a2.index = 0;
    a2.sibling = null;
    return a2;
  }
  function f2(b2, c2, d2) {
    b2.index = d2;
    if (!a) return b2.flags |= 1048576, c2;
    d2 = b2.alternate;
    if (null !== d2) return d2 = d2.index, d2 < c2 ? (b2.flags |= 2, c2) : d2;
    b2.flags |= 2;
    return c2;
  }
  function g(b2) {
    a && null === b2.alternate && (b2.flags |= 2);
    return b2;
  }
  function h(a2, b2, c2, d2) {
    if (null === b2 || 6 !== b2.tag) return b2 = Qg(c2, a2.mode, d2), b2.return = a2, b2;
    b2 = e(b2, c2);
    b2.return = a2;
    return b2;
  }
  function k2(a2, b2, c2, d2) {
    var f3 = c2.type;
    if (f3 === ya) return m2(a2, b2, c2.props.children, d2, c2.key);
    if (null !== b2 && (b2.elementType === f3 || "object" === typeof f3 && null !== f3 && f3.$$typeof === Ha && Ng(f3) === b2.type)) return d2 = e(b2, c2.props), d2.ref = Lg(a2, b2, c2), d2.return = a2, d2;
    d2 = Rg(c2.type, c2.key, c2.props, null, a2.mode, d2);
    d2.ref = Lg(a2, b2, c2);
    d2.return = a2;
    return d2;
  }
  function l2(a2, b2, c2, d2) {
    if (null === b2 || 4 !== b2.tag || b2.stateNode.containerInfo !== c2.containerInfo || b2.stateNode.implementation !== c2.implementation) return b2 = Sg(c2, a2.mode, d2), b2.return = a2, b2;
    b2 = e(b2, c2.children || []);
    b2.return = a2;
    return b2;
  }
  function m2(a2, b2, c2, d2, f3) {
    if (null === b2 || 7 !== b2.tag) return b2 = Tg(c2, a2.mode, d2, f3), b2.return = a2, b2;
    b2 = e(b2, c2);
    b2.return = a2;
    return b2;
  }
  function q2(a2, b2, c2) {
    if ("string" === typeof b2 && "" !== b2 || "number" === typeof b2) return b2 = Qg("" + b2, a2.mode, c2), b2.return = a2, b2;
    if ("object" === typeof b2 && null !== b2) {
      switch (b2.$$typeof) {
        case va:
          return c2 = Rg(b2.type, b2.key, b2.props, null, a2.mode, c2), c2.ref = Lg(a2, null, b2), c2.return = a2, c2;
        case wa:
          return b2 = Sg(b2, a2.mode, c2), b2.return = a2, b2;
        case Ha:
          var d2 = b2._init;
          return q2(a2, d2(b2._payload), c2);
      }
      if (eb(b2) || Ka(b2)) return b2 = Tg(b2, a2.mode, c2, null), b2.return = a2, b2;
      Mg(a2, b2);
    }
    return null;
  }
  function r2(a2, b2, c2, d2) {
    var e2 = null !== b2 ? b2.key : null;
    if ("string" === typeof c2 && "" !== c2 || "number" === typeof c2) return null !== e2 ? null : h(a2, b2, "" + c2, d2);
    if ("object" === typeof c2 && null !== c2) {
      switch (c2.$$typeof) {
        case va:
          return c2.key === e2 ? k2(a2, b2, c2, d2) : null;
        case wa:
          return c2.key === e2 ? l2(a2, b2, c2, d2) : null;
        case Ha:
          return e2 = c2._init, r2(
            a2,
            b2,
            e2(c2._payload),
            d2
          );
      }
      if (eb(c2) || Ka(c2)) return null !== e2 ? null : m2(a2, b2, c2, d2, null);
      Mg(a2, c2);
    }
    return null;
  }
  function y2(a2, b2, c2, d2, e2) {
    if ("string" === typeof d2 && "" !== d2 || "number" === typeof d2) return a2 = a2.get(c2) || null, h(b2, a2, "" + d2, e2);
    if ("object" === typeof d2 && null !== d2) {
      switch (d2.$$typeof) {
        case va:
          return a2 = a2.get(null === d2.key ? c2 : d2.key) || null, k2(b2, a2, d2, e2);
        case wa:
          return a2 = a2.get(null === d2.key ? c2 : d2.key) || null, l2(b2, a2, d2, e2);
        case Ha:
          var f3 = d2._init;
          return y2(a2, b2, c2, f3(d2._payload), e2);
      }
      if (eb(d2) || Ka(d2)) return a2 = a2.get(c2) || null, m2(b2, a2, d2, e2, null);
      Mg(b2, d2);
    }
    return null;
  }
  function n2(e2, g2, h2, k3) {
    for (var l3 = null, m3 = null, u2 = g2, w2 = g2 = 0, x2 = null; null !== u2 && w2 < h2.length; w2++) {
      u2.index > w2 ? (x2 = u2, u2 = null) : x2 = u2.sibling;
      var n3 = r2(e2, u2, h2[w2], k3);
      if (null === n3) {
        null === u2 && (u2 = x2);
        break;
      }
      a && u2 && null === n3.alternate && b(e2, u2);
      g2 = f2(n3, g2, w2);
      null === m3 ? l3 = n3 : m3.sibling = n3;
      m3 = n3;
      u2 = x2;
    }
    if (w2 === h2.length) return c(e2, u2), I && tg(e2, w2), l3;
    if (null === u2) {
      for (; w2 < h2.length; w2++) u2 = q2(e2, h2[w2], k3), null !== u2 && (g2 = f2(u2, g2, w2), null === m3 ? l3 = u2 : m3.sibling = u2, m3 = u2);
      I && tg(e2, w2);
      return l3;
    }
    for (u2 = d(e2, u2); w2 < h2.length; w2++) x2 = y2(u2, e2, w2, h2[w2], k3), null !== x2 && (a && null !== x2.alternate && u2.delete(null === x2.key ? w2 : x2.key), g2 = f2(x2, g2, w2), null === m3 ? l3 = x2 : m3.sibling = x2, m3 = x2);
    a && u2.forEach(function(a2) {
      return b(e2, a2);
    });
    I && tg(e2, w2);
    return l3;
  }
  function t2(e2, g2, h2, k3) {
    var l3 = Ka(h2);
    if ("function" !== typeof l3) throw Error(p(150));
    h2 = l3.call(h2);
    if (null == h2) throw Error(p(151));
    for (var u2 = l3 = null, m3 = g2, w2 = g2 = 0, x2 = null, n3 = h2.next(); null !== m3 && !n3.done; w2++, n3 = h2.next()) {
      m3.index > w2 ? (x2 = m3, m3 = null) : x2 = m3.sibling;
      var t3 = r2(e2, m3, n3.value, k3);
      if (null === t3) {
        null === m3 && (m3 = x2);
        break;
      }
      a && m3 && null === t3.alternate && b(e2, m3);
      g2 = f2(t3, g2, w2);
      null === u2 ? l3 = t3 : u2.sibling = t3;
      u2 = t3;
      m3 = x2;
    }
    if (n3.done) return c(
      e2,
      m3
    ), I && tg(e2, w2), l3;
    if (null === m3) {
      for (; !n3.done; w2++, n3 = h2.next()) n3 = q2(e2, n3.value, k3), null !== n3 && (g2 = f2(n3, g2, w2), null === u2 ? l3 = n3 : u2.sibling = n3, u2 = n3);
      I && tg(e2, w2);
      return l3;
    }
    for (m3 = d(e2, m3); !n3.done; w2++, n3 = h2.next()) n3 = y2(m3, e2, w2, n3.value, k3), null !== n3 && (a && null !== n3.alternate && m3.delete(null === n3.key ? w2 : n3.key), g2 = f2(n3, g2, w2), null === u2 ? l3 = n3 : u2.sibling = n3, u2 = n3);
    a && m3.forEach(function(a2) {
      return b(e2, a2);
    });
    I && tg(e2, w2);
    return l3;
  }
  function J2(a2, d2, f3, h2) {
    "object" === typeof f3 && null !== f3 && f3.type === ya && null === f3.key && (f3 = f3.props.children);
    if ("object" === typeof f3 && null !== f3) {
      switch (f3.$$typeof) {
        case va:
          a: {
            for (var k3 = f3.key, l3 = d2; null !== l3; ) {
              if (l3.key === k3) {
                k3 = f3.type;
                if (k3 === ya) {
                  if (7 === l3.tag) {
                    c(a2, l3.sibling);
                    d2 = e(l3, f3.props.children);
                    d2.return = a2;
                    a2 = d2;
                    break a;
                  }
                } else if (l3.elementType === k3 || "object" === typeof k3 && null !== k3 && k3.$$typeof === Ha && Ng(k3) === l3.type) {
                  c(a2, l3.sibling);
                  d2 = e(l3, f3.props);
                  d2.ref = Lg(a2, l3, f3);
                  d2.return = a2;
                  a2 = d2;
                  break a;
                }
                c(a2, l3);
                break;
              } else b(a2, l3);
              l3 = l3.sibling;
            }
            f3.type === ya ? (d2 = Tg(f3.props.children, a2.mode, h2, f3.key), d2.return = a2, a2 = d2) : (h2 = Rg(f3.type, f3.key, f3.props, null, a2.mode, h2), h2.ref = Lg(a2, d2, f3), h2.return = a2, a2 = h2);
          }
          return g(a2);
        case wa:
          a: {
            for (l3 = f3.key; null !== d2; ) {
              if (d2.key === l3) if (4 === d2.tag && d2.stateNode.containerInfo === f3.containerInfo && d2.stateNode.implementation === f3.implementation) {
                c(a2, d2.sibling);
                d2 = e(d2, f3.children || []);
                d2.return = a2;
                a2 = d2;
                break a;
              } else {
                c(a2, d2);
                break;
              }
              else b(a2, d2);
              d2 = d2.sibling;
            }
            d2 = Sg(f3, a2.mode, h2);
            d2.return = a2;
            a2 = d2;
          }
          return g(a2);
        case Ha:
          return l3 = f3._init, J2(a2, d2, l3(f3._payload), h2);
      }
      if (eb(f3)) return n2(a2, d2, f3, h2);
      if (Ka(f3)) return t2(a2, d2, f3, h2);
      Mg(a2, f3);
    }
    return "string" === typeof f3 && "" !== f3 || "number" === typeof f3 ? (f3 = "" + f3, null !== d2 && 6 === d2.tag ? (c(a2, d2.sibling), d2 = e(d2, f3), d2.return = a2, a2 = d2) : (c(a2, d2), d2 = Qg(f3, a2.mode, h2), d2.return = a2, a2 = d2), g(a2)) : c(a2, d2);
  }
  return J2;
}
var Ug = Og(true), Vg = Og(false), Wg = Uf(null), Xg = null, Yg = null, Zg = null;
function $g() {
  Zg = Yg = Xg = null;
}
function ah(a) {
  var b = Wg.current;
  E(Wg);
  a._currentValue = b;
}
function bh(a, b, c) {
  for (; null !== a; ) {
    var d = a.alternate;
    (a.childLanes & b) !== b ? (a.childLanes |= b, null !== d && (d.childLanes |= b)) : null !== d && (d.childLanes & b) !== b && (d.childLanes |= b);
    if (a === c) break;
    a = a.return;
  }
}
function ch(a, b) {
  Xg = a;
  Zg = Yg = null;
  a = a.dependencies;
  null !== a && null !== a.firstContext && (0 !== (a.lanes & b) && (dh = true), a.firstContext = null);
}
function eh(a) {
  var b = a._currentValue;
  if (Zg !== a) if (a = { context: a, memoizedValue: b, next: null }, null === Yg) {
    if (null === Xg) throw Error(p(308));
    Yg = a;
    Xg.dependencies = { lanes: 0, firstContext: a };
  } else Yg = Yg.next = a;
  return b;
}
var fh = null;
function gh(a) {
  null === fh ? fh = [a] : fh.push(a);
}
function hh(a, b, c, d) {
  var e = b.interleaved;
  null === e ? (c.next = c, gh(b)) : (c.next = e.next, e.next = c);
  b.interleaved = c;
  return ih(a, d);
}
function ih(a, b) {
  a.lanes |= b;
  var c = a.alternate;
  null !== c && (c.lanes |= b);
  c = a;
  for (a = a.return; null !== a; ) a.childLanes |= b, c = a.alternate, null !== c && (c.childLanes |= b), c = a, a = a.return;
  return 3 === c.tag ? c.stateNode : null;
}
var jh = false;
function kh(a) {
  a.updateQueue = { baseState: a.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function lh(a, b) {
  a = a.updateQueue;
  b.updateQueue === a && (b.updateQueue = { baseState: a.baseState, firstBaseUpdate: a.firstBaseUpdate, lastBaseUpdate: a.lastBaseUpdate, shared: a.shared, effects: a.effects });
}
function mh(a, b) {
  return { eventTime: a, lane: b, tag: 0, payload: null, callback: null, next: null };
}
function nh(a, b, c) {
  var d = a.updateQueue;
  if (null === d) return null;
  d = d.shared;
  if (0 !== (K & 2)) {
    var e = d.pending;
    null === e ? b.next = b : (b.next = e.next, e.next = b);
    d.pending = b;
    return ih(a, c);
  }
  e = d.interleaved;
  null === e ? (b.next = b, gh(d)) : (b.next = e.next, e.next = b);
  d.interleaved = b;
  return ih(a, c);
}
function oh(a, b, c) {
  b = b.updateQueue;
  if (null !== b && (b = b.shared, 0 !== (c & 4194240))) {
    var d = b.lanes;
    d &= a.pendingLanes;
    c |= d;
    b.lanes = c;
    Cc(a, c);
  }
}
function ph(a, b) {
  var c = a.updateQueue, d = a.alternate;
  if (null !== d && (d = d.updateQueue, c === d)) {
    var e = null, f2 = null;
    c = c.firstBaseUpdate;
    if (null !== c) {
      do {
        var g = { eventTime: c.eventTime, lane: c.lane, tag: c.tag, payload: c.payload, callback: c.callback, next: null };
        null === f2 ? e = f2 = g : f2 = f2.next = g;
        c = c.next;
      } while (null !== c);
      null === f2 ? e = f2 = b : f2 = f2.next = b;
    } else e = f2 = b;
    c = { baseState: d.baseState, firstBaseUpdate: e, lastBaseUpdate: f2, shared: d.shared, effects: d.effects };
    a.updateQueue = c;
    return;
  }
  a = c.lastBaseUpdate;
  null === a ? c.firstBaseUpdate = b : a.next = b;
  c.lastBaseUpdate = b;
}
function qh(a, b, c, d) {
  var e = a.updateQueue;
  jh = false;
  var f2 = e.firstBaseUpdate, g = e.lastBaseUpdate, h = e.shared.pending;
  if (null !== h) {
    e.shared.pending = null;
    var k2 = h, l2 = k2.next;
    k2.next = null;
    null === g ? f2 = l2 : g.next = l2;
    g = k2;
    var m2 = a.alternate;
    null !== m2 && (m2 = m2.updateQueue, h = m2.lastBaseUpdate, h !== g && (null === h ? m2.firstBaseUpdate = l2 : h.next = l2, m2.lastBaseUpdate = k2));
  }
  if (null !== f2) {
    var q2 = e.baseState;
    g = 0;
    m2 = l2 = k2 = null;
    h = f2;
    do {
      var r2 = h.lane, y2 = h.eventTime;
      if ((d & r2) === r2) {
        null !== m2 && (m2 = m2.next = {
          eventTime: y2,
          lane: 0,
          tag: h.tag,
          payload: h.payload,
          callback: h.callback,
          next: null
        });
        a: {
          var n2 = a, t2 = h;
          r2 = b;
          y2 = c;
          switch (t2.tag) {
            case 1:
              n2 = t2.payload;
              if ("function" === typeof n2) {
                q2 = n2.call(y2, q2, r2);
                break a;
              }
              q2 = n2;
              break a;
            case 3:
              n2.flags = n2.flags & -65537 | 128;
            case 0:
              n2 = t2.payload;
              r2 = "function" === typeof n2 ? n2.call(y2, q2, r2) : n2;
              if (null === r2 || void 0 === r2) break a;
              q2 = A({}, q2, r2);
              break a;
            case 2:
              jh = true;
          }
        }
        null !== h.callback && 0 !== h.lane && (a.flags |= 64, r2 = e.effects, null === r2 ? e.effects = [h] : r2.push(h));
      } else y2 = { eventTime: y2, lane: r2, tag: h.tag, payload: h.payload, callback: h.callback, next: null }, null === m2 ? (l2 = m2 = y2, k2 = q2) : m2 = m2.next = y2, g |= r2;
      h = h.next;
      if (null === h) if (h = e.shared.pending, null === h) break;
      else r2 = h, h = r2.next, r2.next = null, e.lastBaseUpdate = r2, e.shared.pending = null;
    } while (1);
    null === m2 && (k2 = q2);
    e.baseState = k2;
    e.firstBaseUpdate = l2;
    e.lastBaseUpdate = m2;
    b = e.shared.interleaved;
    if (null !== b) {
      e = b;
      do
        g |= e.lane, e = e.next;
      while (e !== b);
    } else null === f2 && (e.shared.lanes = 0);
    rh |= g;
    a.lanes = g;
    a.memoizedState = q2;
  }
}
function sh(a, b, c) {
  a = b.effects;
  b.effects = null;
  if (null !== a) for (b = 0; b < a.length; b++) {
    var d = a[b], e = d.callback;
    if (null !== e) {
      d.callback = null;
      d = c;
      if ("function" !== typeof e) throw Error(p(191, e));
      e.call(d);
    }
  }
}
var th = {}, uh = Uf(th), vh = Uf(th), wh = Uf(th);
function xh(a) {
  if (a === th) throw Error(p(174));
  return a;
}
function yh(a, b) {
  G(wh, b);
  G(vh, a);
  G(uh, th);
  a = b.nodeType;
  switch (a) {
    case 9:
    case 11:
      b = (b = b.documentElement) ? b.namespaceURI : lb(null, "");
      break;
    default:
      a = 8 === a ? b.parentNode : b, b = a.namespaceURI || null, a = a.tagName, b = lb(b, a);
  }
  E(uh);
  G(uh, b);
}
function zh() {
  E(uh);
  E(vh);
  E(wh);
}
function Ah(a) {
  xh(wh.current);
  var b = xh(uh.current);
  var c = lb(b, a.type);
  b !== c && (G(vh, a), G(uh, c));
}
function Bh(a) {
  vh.current === a && (E(uh), E(vh));
}
var L = Uf(0);
function Ch(a) {
  for (var b = a; null !== b; ) {
    if (13 === b.tag) {
      var c = b.memoizedState;
      if (null !== c && (c = c.dehydrated, null === c || "$?" === c.data || "$!" === c.data)) return b;
    } else if (19 === b.tag && void 0 !== b.memoizedProps.revealOrder) {
      if (0 !== (b.flags & 128)) return b;
    } else if (null !== b.child) {
      b.child.return = b;
      b = b.child;
      continue;
    }
    if (b === a) break;
    for (; null === b.sibling; ) {
      if (null === b.return || b.return === a) return null;
      b = b.return;
    }
    b.sibling.return = b.return;
    b = b.sibling;
  }
  return null;
}
var Dh = [];
function Eh() {
  for (var a = 0; a < Dh.length; a++) Dh[a]._workInProgressVersionPrimary = null;
  Dh.length = 0;
}
var Fh = ua.ReactCurrentDispatcher, Gh = ua.ReactCurrentBatchConfig, Hh = 0, M = null, N = null, O = null, Ih = false, Jh = false, Kh = 0, Lh = 0;
function P() {
  throw Error(p(321));
}
function Mh(a, b) {
  if (null === b) return false;
  for (var c = 0; c < b.length && c < a.length; c++) if (!He(a[c], b[c])) return false;
  return true;
}
function Nh(a, b, c, d, e, f2) {
  Hh = f2;
  M = b;
  b.memoizedState = null;
  b.updateQueue = null;
  b.lanes = 0;
  Fh.current = null === a || null === a.memoizedState ? Oh : Ph;
  a = c(d, e);
  if (Jh) {
    f2 = 0;
    do {
      Jh = false;
      Kh = 0;
      if (25 <= f2) throw Error(p(301));
      f2 += 1;
      O = N = null;
      b.updateQueue = null;
      Fh.current = Qh;
      a = c(d, e);
    } while (Jh);
  }
  Fh.current = Rh;
  b = null !== N && null !== N.next;
  Hh = 0;
  O = N = M = null;
  Ih = false;
  if (b) throw Error(p(300));
  return a;
}
function Sh() {
  var a = 0 !== Kh;
  Kh = 0;
  return a;
}
function Th() {
  var a = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  null === O ? M.memoizedState = O = a : O = O.next = a;
  return O;
}
function Uh() {
  if (null === N) {
    var a = M.alternate;
    a = null !== a ? a.memoizedState : null;
  } else a = N.next;
  var b = null === O ? M.memoizedState : O.next;
  if (null !== b) O = b, N = a;
  else {
    if (null === a) throw Error(p(310));
    N = a;
    a = { memoizedState: N.memoizedState, baseState: N.baseState, baseQueue: N.baseQueue, queue: N.queue, next: null };
    null === O ? M.memoizedState = O = a : O = O.next = a;
  }
  return O;
}
function Vh(a, b) {
  return "function" === typeof b ? b(a) : b;
}
function Wh(a) {
  var b = Uh(), c = b.queue;
  if (null === c) throw Error(p(311));
  c.lastRenderedReducer = a;
  var d = N, e = d.baseQueue, f2 = c.pending;
  if (null !== f2) {
    if (null !== e) {
      var g = e.next;
      e.next = f2.next;
      f2.next = g;
    }
    d.baseQueue = e = f2;
    c.pending = null;
  }
  if (null !== e) {
    f2 = e.next;
    d = d.baseState;
    var h = g = null, k2 = null, l2 = f2;
    do {
      var m2 = l2.lane;
      if ((Hh & m2) === m2) null !== k2 && (k2 = k2.next = { lane: 0, action: l2.action, hasEagerState: l2.hasEagerState, eagerState: l2.eagerState, next: null }), d = l2.hasEagerState ? l2.eagerState : a(d, l2.action);
      else {
        var q2 = {
          lane: m2,
          action: l2.action,
          hasEagerState: l2.hasEagerState,
          eagerState: l2.eagerState,
          next: null
        };
        null === k2 ? (h = k2 = q2, g = d) : k2 = k2.next = q2;
        M.lanes |= m2;
        rh |= m2;
      }
      l2 = l2.next;
    } while (null !== l2 && l2 !== f2);
    null === k2 ? g = d : k2.next = h;
    He(d, b.memoizedState) || (dh = true);
    b.memoizedState = d;
    b.baseState = g;
    b.baseQueue = k2;
    c.lastRenderedState = d;
  }
  a = c.interleaved;
  if (null !== a) {
    e = a;
    do
      f2 = e.lane, M.lanes |= f2, rh |= f2, e = e.next;
    while (e !== a);
  } else null === e && (c.lanes = 0);
  return [b.memoizedState, c.dispatch];
}
function Xh(a) {
  var b = Uh(), c = b.queue;
  if (null === c) throw Error(p(311));
  c.lastRenderedReducer = a;
  var d = c.dispatch, e = c.pending, f2 = b.memoizedState;
  if (null !== e) {
    c.pending = null;
    var g = e = e.next;
    do
      f2 = a(f2, g.action), g = g.next;
    while (g !== e);
    He(f2, b.memoizedState) || (dh = true);
    b.memoizedState = f2;
    null === b.baseQueue && (b.baseState = f2);
    c.lastRenderedState = f2;
  }
  return [f2, d];
}
function Yh() {
}
function Zh(a, b) {
  var c = M, d = Uh(), e = b(), f2 = !He(d.memoizedState, e);
  f2 && (d.memoizedState = e, dh = true);
  d = d.queue;
  $h(ai.bind(null, c, d, a), [a]);
  if (d.getSnapshot !== b || f2 || null !== O && O.memoizedState.tag & 1) {
    c.flags |= 2048;
    bi(9, ci.bind(null, c, d, e, b), void 0, null);
    if (null === Q) throw Error(p(349));
    0 !== (Hh & 30) || di(c, b, e);
  }
  return e;
}
function di(a, b, c) {
  a.flags |= 16384;
  a = { getSnapshot: b, value: c };
  b = M.updateQueue;
  null === b ? (b = { lastEffect: null, stores: null }, M.updateQueue = b, b.stores = [a]) : (c = b.stores, null === c ? b.stores = [a] : c.push(a));
}
function ci(a, b, c, d) {
  b.value = c;
  b.getSnapshot = d;
  ei(b) && fi(a);
}
function ai(a, b, c) {
  return c(function() {
    ei(b) && fi(a);
  });
}
function ei(a) {
  var b = a.getSnapshot;
  a = a.value;
  try {
    var c = b();
    return !He(a, c);
  } catch (d) {
    return true;
  }
}
function fi(a) {
  var b = ih(a, 1);
  null !== b && gi(b, a, 1, -1);
}
function hi(a) {
  var b = Th();
  "function" === typeof a && (a = a());
  b.memoizedState = b.baseState = a;
  a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Vh, lastRenderedState: a };
  b.queue = a;
  a = a.dispatch = ii.bind(null, M, a);
  return [b.memoizedState, a];
}
function bi(a, b, c, d) {
  a = { tag: a, create: b, destroy: c, deps: d, next: null };
  b = M.updateQueue;
  null === b ? (b = { lastEffect: null, stores: null }, M.updateQueue = b, b.lastEffect = a.next = a) : (c = b.lastEffect, null === c ? b.lastEffect = a.next = a : (d = c.next, c.next = a, a.next = d, b.lastEffect = a));
  return a;
}
function ji() {
  return Uh().memoizedState;
}
function ki(a, b, c, d) {
  var e = Th();
  M.flags |= a;
  e.memoizedState = bi(1 | b, c, void 0, void 0 === d ? null : d);
}
function li(a, b, c, d) {
  var e = Uh();
  d = void 0 === d ? null : d;
  var f2 = void 0;
  if (null !== N) {
    var g = N.memoizedState;
    f2 = g.destroy;
    if (null !== d && Mh(d, g.deps)) {
      e.memoizedState = bi(b, c, f2, d);
      return;
    }
  }
  M.flags |= a;
  e.memoizedState = bi(1 | b, c, f2, d);
}
function mi(a, b) {
  return ki(8390656, 8, a, b);
}
function $h(a, b) {
  return li(2048, 8, a, b);
}
function ni(a, b) {
  return li(4, 2, a, b);
}
function oi(a, b) {
  return li(4, 4, a, b);
}
function pi(a, b) {
  if ("function" === typeof b) return a = a(), b(a), function() {
    b(null);
  };
  if (null !== b && void 0 !== b) return a = a(), b.current = a, function() {
    b.current = null;
  };
}
function qi(a, b, c) {
  c = null !== c && void 0 !== c ? c.concat([a]) : null;
  return li(4, 4, pi.bind(null, b, a), c);
}
function ri() {
}
function si(a, b) {
  var c = Uh();
  b = void 0 === b ? null : b;
  var d = c.memoizedState;
  if (null !== d && null !== b && Mh(b, d[1])) return d[0];
  c.memoizedState = [a, b];
  return a;
}
function ti(a, b) {
  var c = Uh();
  b = void 0 === b ? null : b;
  var d = c.memoizedState;
  if (null !== d && null !== b && Mh(b, d[1])) return d[0];
  a = a();
  c.memoizedState = [a, b];
  return a;
}
function ui(a, b, c) {
  if (0 === (Hh & 21)) return a.baseState && (a.baseState = false, dh = true), a.memoizedState = c;
  He(c, b) || (c = yc(), M.lanes |= c, rh |= c, a.baseState = true);
  return b;
}
function vi(a, b) {
  var c = C;
  C = 0 !== c && 4 > c ? c : 4;
  a(true);
  var d = Gh.transition;
  Gh.transition = {};
  try {
    a(false), b();
  } finally {
    C = c, Gh.transition = d;
  }
}
function wi() {
  return Uh().memoizedState;
}
function xi(a, b, c) {
  var d = yi(a);
  c = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
  if (zi(a)) Ai(b, c);
  else if (c = hh(a, b, c, d), null !== c) {
    var e = R();
    gi(c, a, d, e);
    Bi(c, b, d);
  }
}
function ii(a, b, c) {
  var d = yi(a), e = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
  if (zi(a)) Ai(b, e);
  else {
    var f2 = a.alternate;
    if (0 === a.lanes && (null === f2 || 0 === f2.lanes) && (f2 = b.lastRenderedReducer, null !== f2)) try {
      var g = b.lastRenderedState, h = f2(g, c);
      e.hasEagerState = true;
      e.eagerState = h;
      if (He(h, g)) {
        var k2 = b.interleaved;
        null === k2 ? (e.next = e, gh(b)) : (e.next = k2.next, k2.next = e);
        b.interleaved = e;
        return;
      }
    } catch (l2) {
    } finally {
    }
    c = hh(a, b, e, d);
    null !== c && (e = R(), gi(c, a, d, e), Bi(c, b, d));
  }
}
function zi(a) {
  var b = a.alternate;
  return a === M || null !== b && b === M;
}
function Ai(a, b) {
  Jh = Ih = true;
  var c = a.pending;
  null === c ? b.next = b : (b.next = c.next, c.next = b);
  a.pending = b;
}
function Bi(a, b, c) {
  if (0 !== (c & 4194240)) {
    var d = b.lanes;
    d &= a.pendingLanes;
    c |= d;
    b.lanes = c;
    Cc(a, c);
  }
}
var Rh = { readContext: eh, useCallback: P, useContext: P, useEffect: P, useImperativeHandle: P, useInsertionEffect: P, useLayoutEffect: P, useMemo: P, useReducer: P, useRef: P, useState: P, useDebugValue: P, useDeferredValue: P, useTransition: P, useMutableSource: P, useSyncExternalStore: P, useId: P, unstable_isNewReconciler: false }, Oh = { readContext: eh, useCallback: function(a, b) {
  Th().memoizedState = [a, void 0 === b ? null : b];
  return a;
}, useContext: eh, useEffect: mi, useImperativeHandle: function(a, b, c) {
  c = null !== c && void 0 !== c ? c.concat([a]) : null;
  return ki(
    4194308,
    4,
    pi.bind(null, b, a),
    c
  );
}, useLayoutEffect: function(a, b) {
  return ki(4194308, 4, a, b);
}, useInsertionEffect: function(a, b) {
  return ki(4, 2, a, b);
}, useMemo: function(a, b) {
  var c = Th();
  b = void 0 === b ? null : b;
  a = a();
  c.memoizedState = [a, b];
  return a;
}, useReducer: function(a, b, c) {
  var d = Th();
  b = void 0 !== c ? c(b) : b;
  d.memoizedState = d.baseState = b;
  a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: a, lastRenderedState: b };
  d.queue = a;
  a = a.dispatch = xi.bind(null, M, a);
  return [d.memoizedState, a];
}, useRef: function(a) {
  var b = Th();
  a = { current: a };
  return b.memoizedState = a;
}, useState: hi, useDebugValue: ri, useDeferredValue: function(a) {
  return Th().memoizedState = a;
}, useTransition: function() {
  var a = hi(false), b = a[0];
  a = vi.bind(null, a[1]);
  Th().memoizedState = a;
  return [b, a];
}, useMutableSource: function() {
}, useSyncExternalStore: function(a, b, c) {
  var d = M, e = Th();
  if (I) {
    if (void 0 === c) throw Error(p(407));
    c = c();
  } else {
    c = b();
    if (null === Q) throw Error(p(349));
    0 !== (Hh & 30) || di(d, b, c);
  }
  e.memoizedState = c;
  var f2 = { value: c, getSnapshot: b };
  e.queue = f2;
  mi(ai.bind(
    null,
    d,
    f2,
    a
  ), [a]);
  d.flags |= 2048;
  bi(9, ci.bind(null, d, f2, c, b), void 0, null);
  return c;
}, useId: function() {
  var a = Th(), b = Q.identifierPrefix;
  if (I) {
    var c = sg;
    var d = rg;
    c = (d & ~(1 << 32 - oc(d) - 1)).toString(32) + c;
    b = ":" + b + "R" + c;
    c = Kh++;
    0 < c && (b += "H" + c.toString(32));
    b += ":";
  } else c = Lh++, b = ":" + b + "r" + c.toString(32) + ":";
  return a.memoizedState = b;
}, unstable_isNewReconciler: false }, Ph = {
  readContext: eh,
  useCallback: si,
  useContext: eh,
  useEffect: $h,
  useImperativeHandle: qi,
  useInsertionEffect: ni,
  useLayoutEffect: oi,
  useMemo: ti,
  useReducer: Wh,
  useRef: ji,
  useState: function() {
    return Wh(Vh);
  },
  useDebugValue: ri,
  useDeferredValue: function(a) {
    var b = Uh();
    return ui(b, N.memoizedState, a);
  },
  useTransition: function() {
    var a = Wh(Vh)[0], b = Uh().memoizedState;
    return [a, b];
  },
  useMutableSource: Yh,
  useSyncExternalStore: Zh,
  useId: wi,
  unstable_isNewReconciler: false
}, Qh = { readContext: eh, useCallback: si, useContext: eh, useEffect: $h, useImperativeHandle: qi, useInsertionEffect: ni, useLayoutEffect: oi, useMemo: ti, useReducer: Xh, useRef: ji, useState: function() {
  return Xh(Vh);
}, useDebugValue: ri, useDeferredValue: function(a) {
  var b = Uh();
  return null === N ? b.memoizedState = a : ui(b, N.memoizedState, a);
}, useTransition: function() {
  var a = Xh(Vh)[0], b = Uh().memoizedState;
  return [a, b];
}, useMutableSource: Yh, useSyncExternalStore: Zh, useId: wi, unstable_isNewReconciler: false };
function Ci(a, b) {
  if (a && a.defaultProps) {
    b = A({}, b);
    a = a.defaultProps;
    for (var c in a) void 0 === b[c] && (b[c] = a[c]);
    return b;
  }
  return b;
}
function Di(a, b, c, d) {
  b = a.memoizedState;
  c = c(d, b);
  c = null === c || void 0 === c ? b : A({}, b, c);
  a.memoizedState = c;
  0 === a.lanes && (a.updateQueue.baseState = c);
}
var Ei = { isMounted: function(a) {
  return (a = a._reactInternals) ? Vb(a) === a : false;
}, enqueueSetState: function(a, b, c) {
  a = a._reactInternals;
  var d = R(), e = yi(a), f2 = mh(d, e);
  f2.payload = b;
  void 0 !== c && null !== c && (f2.callback = c);
  b = nh(a, f2, e);
  null !== b && (gi(b, a, e, d), oh(b, a, e));
}, enqueueReplaceState: function(a, b, c) {
  a = a._reactInternals;
  var d = R(), e = yi(a), f2 = mh(d, e);
  f2.tag = 1;
  f2.payload = b;
  void 0 !== c && null !== c && (f2.callback = c);
  b = nh(a, f2, e);
  null !== b && (gi(b, a, e, d), oh(b, a, e));
}, enqueueForceUpdate: function(a, b) {
  a = a._reactInternals;
  var c = R(), d = yi(a), e = mh(c, d);
  e.tag = 2;
  void 0 !== b && null !== b && (e.callback = b);
  b = nh(a, e, d);
  null !== b && (gi(b, a, d, c), oh(b, a, d));
} };
function Fi(a, b, c, d, e, f2, g) {
  a = a.stateNode;
  return "function" === typeof a.shouldComponentUpdate ? a.shouldComponentUpdate(d, f2, g) : b.prototype && b.prototype.isPureReactComponent ? !Ie(c, d) || !Ie(e, f2) : true;
}
function Gi(a, b, c) {
  var d = false, e = Vf;
  var f2 = b.contextType;
  "object" === typeof f2 && null !== f2 ? f2 = eh(f2) : (e = Zf(b) ? Xf : H.current, d = b.contextTypes, f2 = (d = null !== d && void 0 !== d) ? Yf(a, e) : Vf);
  b = new b(c, f2);
  a.memoizedState = null !== b.state && void 0 !== b.state ? b.state : null;
  b.updater = Ei;
  a.stateNode = b;
  b._reactInternals = a;
  d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = e, a.__reactInternalMemoizedMaskedChildContext = f2);
  return b;
}
function Hi(a, b, c, d) {
  a = b.state;
  "function" === typeof b.componentWillReceiveProps && b.componentWillReceiveProps(c, d);
  "function" === typeof b.UNSAFE_componentWillReceiveProps && b.UNSAFE_componentWillReceiveProps(c, d);
  b.state !== a && Ei.enqueueReplaceState(b, b.state, null);
}
function Ii(a, b, c, d) {
  var e = a.stateNode;
  e.props = c;
  e.state = a.memoizedState;
  e.refs = {};
  kh(a);
  var f2 = b.contextType;
  "object" === typeof f2 && null !== f2 ? e.context = eh(f2) : (f2 = Zf(b) ? Xf : H.current, e.context = Yf(a, f2));
  e.state = a.memoizedState;
  f2 = b.getDerivedStateFromProps;
  "function" === typeof f2 && (Di(a, b, f2, c), e.state = a.memoizedState);
  "function" === typeof b.getDerivedStateFromProps || "function" === typeof e.getSnapshotBeforeUpdate || "function" !== typeof e.UNSAFE_componentWillMount && "function" !== typeof e.componentWillMount || (b = e.state, "function" === typeof e.componentWillMount && e.componentWillMount(), "function" === typeof e.UNSAFE_componentWillMount && e.UNSAFE_componentWillMount(), b !== e.state && Ei.enqueueReplaceState(e, e.state, null), qh(a, c, e, d), e.state = a.memoizedState);
  "function" === typeof e.componentDidMount && (a.flags |= 4194308);
}
function Ji(a, b) {
  try {
    var c = "", d = b;
    do
      c += Pa(d), d = d.return;
    while (d);
    var e = c;
  } catch (f2) {
    e = "\nError generating stack: " + f2.message + "\n" + f2.stack;
  }
  return { value: a, source: b, stack: e, digest: null };
}
function Ki(a, b, c) {
  return { value: a, source: null, stack: null != c ? c : null, digest: null != b ? b : null };
}
function Li(a, b) {
  try {
    console.error(b.value);
  } catch (c) {
    setTimeout(function() {
      throw c;
    });
  }
}
var Mi = "function" === typeof WeakMap ? WeakMap : Map;
function Ni(a, b, c) {
  c = mh(-1, c);
  c.tag = 3;
  c.payload = { element: null };
  var d = b.value;
  c.callback = function() {
    Oi || (Oi = true, Pi = d);
    Li(a, b);
  };
  return c;
}
function Qi(a, b, c) {
  c = mh(-1, c);
  c.tag = 3;
  var d = a.type.getDerivedStateFromError;
  if ("function" === typeof d) {
    var e = b.value;
    c.payload = function() {
      return d(e);
    };
    c.callback = function() {
      Li(a, b);
    };
  }
  var f2 = a.stateNode;
  null !== f2 && "function" === typeof f2.componentDidCatch && (c.callback = function() {
    Li(a, b);
    "function" !== typeof d && (null === Ri ? Ri = /* @__PURE__ */ new Set([this]) : Ri.add(this));
    var c2 = b.stack;
    this.componentDidCatch(b.value, { componentStack: null !== c2 ? c2 : "" });
  });
  return c;
}
function Si(a, b, c) {
  var d = a.pingCache;
  if (null === d) {
    d = a.pingCache = new Mi();
    var e = /* @__PURE__ */ new Set();
    d.set(b, e);
  } else e = d.get(b), void 0 === e && (e = /* @__PURE__ */ new Set(), d.set(b, e));
  e.has(c) || (e.add(c), a = Ti.bind(null, a, b, c), b.then(a, a));
}
function Ui(a) {
  do {
    var b;
    if (b = 13 === a.tag) b = a.memoizedState, b = null !== b ? null !== b.dehydrated ? true : false : true;
    if (b) return a;
    a = a.return;
  } while (null !== a);
  return null;
}
function Vi(a, b, c, d, e) {
  if (0 === (a.mode & 1)) return a === b ? a.flags |= 65536 : (a.flags |= 128, c.flags |= 131072, c.flags &= -52805, 1 === c.tag && (null === c.alternate ? c.tag = 17 : (b = mh(-1, 1), b.tag = 2, nh(c, b, 1))), c.lanes |= 1), a;
  a.flags |= 65536;
  a.lanes = e;
  return a;
}
var Wi = ua.ReactCurrentOwner, dh = false;
function Xi(a, b, c, d) {
  b.child = null === a ? Vg(b, null, c, d) : Ug(b, a.child, c, d);
}
function Yi(a, b, c, d, e) {
  c = c.render;
  var f2 = b.ref;
  ch(b, e);
  d = Nh(a, b, c, d, f2, e);
  c = Sh();
  if (null !== a && !dh) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Zi(a, b, e);
  I && c && vg(b);
  b.flags |= 1;
  Xi(a, b, d, e);
  return b.child;
}
function $i(a, b, c, d, e) {
  if (null === a) {
    var f2 = c.type;
    if ("function" === typeof f2 && !aj(f2) && void 0 === f2.defaultProps && null === c.compare && void 0 === c.defaultProps) return b.tag = 15, b.type = f2, bj(a, b, f2, d, e);
    a = Rg(c.type, null, d, b, b.mode, e);
    a.ref = b.ref;
    a.return = b;
    return b.child = a;
  }
  f2 = a.child;
  if (0 === (a.lanes & e)) {
    var g = f2.memoizedProps;
    c = c.compare;
    c = null !== c ? c : Ie;
    if (c(g, d) && a.ref === b.ref) return Zi(a, b, e);
  }
  b.flags |= 1;
  a = Pg(f2, d);
  a.ref = b.ref;
  a.return = b;
  return b.child = a;
}
function bj(a, b, c, d, e) {
  if (null !== a) {
    var f2 = a.memoizedProps;
    if (Ie(f2, d) && a.ref === b.ref) if (dh = false, b.pendingProps = d = f2, 0 !== (a.lanes & e)) 0 !== (a.flags & 131072) && (dh = true);
    else return b.lanes = a.lanes, Zi(a, b, e);
  }
  return cj(a, b, c, d, e);
}
function dj(a, b, c) {
  var d = b.pendingProps, e = d.children, f2 = null !== a ? a.memoizedState : null;
  if ("hidden" === d.mode) if (0 === (b.mode & 1)) b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, G(ej, fj), fj |= c;
  else {
    if (0 === (c & 1073741824)) return a = null !== f2 ? f2.baseLanes | c : c, b.lanes = b.childLanes = 1073741824, b.memoizedState = { baseLanes: a, cachePool: null, transitions: null }, b.updateQueue = null, G(ej, fj), fj |= a, null;
    b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null };
    d = null !== f2 ? f2.baseLanes : c;
    G(ej, fj);
    fj |= d;
  }
  else null !== f2 ? (d = f2.baseLanes | c, b.memoizedState = null) : d = c, G(ej, fj), fj |= d;
  Xi(a, b, e, c);
  return b.child;
}
function gj(a, b) {
  var c = b.ref;
  if (null === a && null !== c || null !== a && a.ref !== c) b.flags |= 512, b.flags |= 2097152;
}
function cj(a, b, c, d, e) {
  var f2 = Zf(c) ? Xf : H.current;
  f2 = Yf(b, f2);
  ch(b, e);
  c = Nh(a, b, c, d, f2, e);
  d = Sh();
  if (null !== a && !dh) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Zi(a, b, e);
  I && d && vg(b);
  b.flags |= 1;
  Xi(a, b, c, e);
  return b.child;
}
function hj(a, b, c, d, e) {
  if (Zf(c)) {
    var f2 = true;
    cg(b);
  } else f2 = false;
  ch(b, e);
  if (null === b.stateNode) ij(a, b), Gi(b, c, d), Ii(b, c, d, e), d = true;
  else if (null === a) {
    var g = b.stateNode, h = b.memoizedProps;
    g.props = h;
    var k2 = g.context, l2 = c.contextType;
    "object" === typeof l2 && null !== l2 ? l2 = eh(l2) : (l2 = Zf(c) ? Xf : H.current, l2 = Yf(b, l2));
    var m2 = c.getDerivedStateFromProps, q2 = "function" === typeof m2 || "function" === typeof g.getSnapshotBeforeUpdate;
    q2 || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== d || k2 !== l2) && Hi(b, g, d, l2);
    jh = false;
    var r2 = b.memoizedState;
    g.state = r2;
    qh(b, d, g, e);
    k2 = b.memoizedState;
    h !== d || r2 !== k2 || Wf.current || jh ? ("function" === typeof m2 && (Di(b, c, m2, d), k2 = b.memoizedState), (h = jh || Fi(b, c, h, d, r2, k2, l2)) ? (q2 || "function" !== typeof g.UNSAFE_componentWillMount && "function" !== typeof g.componentWillMount || ("function" === typeof g.componentWillMount && g.componentWillMount(), "function" === typeof g.UNSAFE_componentWillMount && g.UNSAFE_componentWillMount()), "function" === typeof g.componentDidMount && (b.flags |= 4194308)) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), b.memoizedProps = d, b.memoizedState = k2), g.props = d, g.state = k2, g.context = l2, d = h) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), d = false);
  } else {
    g = b.stateNode;
    lh(a, b);
    h = b.memoizedProps;
    l2 = b.type === b.elementType ? h : Ci(b.type, h);
    g.props = l2;
    q2 = b.pendingProps;
    r2 = g.context;
    k2 = c.contextType;
    "object" === typeof k2 && null !== k2 ? k2 = eh(k2) : (k2 = Zf(c) ? Xf : H.current, k2 = Yf(b, k2));
    var y2 = c.getDerivedStateFromProps;
    (m2 = "function" === typeof y2 || "function" === typeof g.getSnapshotBeforeUpdate) || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== q2 || r2 !== k2) && Hi(b, g, d, k2);
    jh = false;
    r2 = b.memoizedState;
    g.state = r2;
    qh(b, d, g, e);
    var n2 = b.memoizedState;
    h !== q2 || r2 !== n2 || Wf.current || jh ? ("function" === typeof y2 && (Di(b, c, y2, d), n2 = b.memoizedState), (l2 = jh || Fi(b, c, l2, d, r2, n2, k2) || false) ? (m2 || "function" !== typeof g.UNSAFE_componentWillUpdate && "function" !== typeof g.componentWillUpdate || ("function" === typeof g.componentWillUpdate && g.componentWillUpdate(d, n2, k2), "function" === typeof g.UNSAFE_componentWillUpdate && g.UNSAFE_componentWillUpdate(d, n2, k2)), "function" === typeof g.componentDidUpdate && (b.flags |= 4), "function" === typeof g.getSnapshotBeforeUpdate && (b.flags |= 1024)) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 1024), b.memoizedProps = d, b.memoizedState = n2), g.props = d, g.state = n2, g.context = k2, d = l2) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 1024), d = false);
  }
  return jj(a, b, c, d, f2, e);
}
function jj(a, b, c, d, e, f2) {
  gj(a, b);
  var g = 0 !== (b.flags & 128);
  if (!d && !g) return e && dg(b, c, false), Zi(a, b, f2);
  d = b.stateNode;
  Wi.current = b;
  var h = g && "function" !== typeof c.getDerivedStateFromError ? null : d.render();
  b.flags |= 1;
  null !== a && g ? (b.child = Ug(b, a.child, null, f2), b.child = Ug(b, null, h, f2)) : Xi(a, b, h, f2);
  b.memoizedState = d.state;
  e && dg(b, c, true);
  return b.child;
}
function kj(a) {
  var b = a.stateNode;
  b.pendingContext ? ag(a, b.pendingContext, b.pendingContext !== b.context) : b.context && ag(a, b.context, false);
  yh(a, b.containerInfo);
}
function lj(a, b, c, d, e) {
  Ig();
  Jg(e);
  b.flags |= 256;
  Xi(a, b, c, d);
  return b.child;
}
var mj = { dehydrated: null, treeContext: null, retryLane: 0 };
function nj(a) {
  return { baseLanes: a, cachePool: null, transitions: null };
}
function oj(a, b, c) {
  var d = b.pendingProps, e = L.current, f2 = false, g = 0 !== (b.flags & 128), h;
  (h = g) || (h = null !== a && null === a.memoizedState ? false : 0 !== (e & 2));
  if (h) f2 = true, b.flags &= -129;
  else if (null === a || null !== a.memoizedState) e |= 1;
  G(L, e & 1);
  if (null === a) {
    Eg(b);
    a = b.memoizedState;
    if (null !== a && (a = a.dehydrated, null !== a)) return 0 === (b.mode & 1) ? b.lanes = 1 : "$!" === a.data ? b.lanes = 8 : b.lanes = 1073741824, null;
    g = d.children;
    a = d.fallback;
    return f2 ? (d = b.mode, f2 = b.child, g = { mode: "hidden", children: g }, 0 === (d & 1) && null !== f2 ? (f2.childLanes = 0, f2.pendingProps = g) : f2 = pj(g, d, 0, null), a = Tg(a, d, c, null), f2.return = b, a.return = b, f2.sibling = a, b.child = f2, b.child.memoizedState = nj(c), b.memoizedState = mj, a) : qj(b, g);
  }
  e = a.memoizedState;
  if (null !== e && (h = e.dehydrated, null !== h)) return rj(a, b, g, d, h, e, c);
  if (f2) {
    f2 = d.fallback;
    g = b.mode;
    e = a.child;
    h = e.sibling;
    var k2 = { mode: "hidden", children: d.children };
    0 === (g & 1) && b.child !== e ? (d = b.child, d.childLanes = 0, d.pendingProps = k2, b.deletions = null) : (d = Pg(e, k2), d.subtreeFlags = e.subtreeFlags & 14680064);
    null !== h ? f2 = Pg(h, f2) : (f2 = Tg(f2, g, c, null), f2.flags |= 2);
    f2.return = b;
    d.return = b;
    d.sibling = f2;
    b.child = d;
    d = f2;
    f2 = b.child;
    g = a.child.memoizedState;
    g = null === g ? nj(c) : { baseLanes: g.baseLanes | c, cachePool: null, transitions: g.transitions };
    f2.memoizedState = g;
    f2.childLanes = a.childLanes & ~c;
    b.memoizedState = mj;
    return d;
  }
  f2 = a.child;
  a = f2.sibling;
  d = Pg(f2, { mode: "visible", children: d.children });
  0 === (b.mode & 1) && (d.lanes = c);
  d.return = b;
  d.sibling = null;
  null !== a && (c = b.deletions, null === c ? (b.deletions = [a], b.flags |= 16) : c.push(a));
  b.child = d;
  b.memoizedState = null;
  return d;
}
function qj(a, b) {
  b = pj({ mode: "visible", children: b }, a.mode, 0, null);
  b.return = a;
  return a.child = b;
}
function sj(a, b, c, d) {
  null !== d && Jg(d);
  Ug(b, a.child, null, c);
  a = qj(b, b.pendingProps.children);
  a.flags |= 2;
  b.memoizedState = null;
  return a;
}
function rj(a, b, c, d, e, f2, g) {
  if (c) {
    if (b.flags & 256) return b.flags &= -257, d = Ki(Error(p(422))), sj(a, b, g, d);
    if (null !== b.memoizedState) return b.child = a.child, b.flags |= 128, null;
    f2 = d.fallback;
    e = b.mode;
    d = pj({ mode: "visible", children: d.children }, e, 0, null);
    f2 = Tg(f2, e, g, null);
    f2.flags |= 2;
    d.return = b;
    f2.return = b;
    d.sibling = f2;
    b.child = d;
    0 !== (b.mode & 1) && Ug(b, a.child, null, g);
    b.child.memoizedState = nj(g);
    b.memoizedState = mj;
    return f2;
  }
  if (0 === (b.mode & 1)) return sj(a, b, g, null);
  if ("$!" === e.data) {
    d = e.nextSibling && e.nextSibling.dataset;
    if (d) var h = d.dgst;
    d = h;
    f2 = Error(p(419));
    d = Ki(f2, d, void 0);
    return sj(a, b, g, d);
  }
  h = 0 !== (g & a.childLanes);
  if (dh || h) {
    d = Q;
    if (null !== d) {
      switch (g & -g) {
        case 4:
          e = 2;
          break;
        case 16:
          e = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          e = 32;
          break;
        case 536870912:
          e = 268435456;
          break;
        default:
          e = 0;
      }
      e = 0 !== (e & (d.suspendedLanes | g)) ? 0 : e;
      0 !== e && e !== f2.retryLane && (f2.retryLane = e, ih(a, e), gi(d, a, e, -1));
    }
    tj();
    d = Ki(Error(p(421)));
    return sj(a, b, g, d);
  }
  if ("$?" === e.data) return b.flags |= 128, b.child = a.child, b = uj.bind(null, a), e._reactRetry = b, null;
  a = f2.treeContext;
  yg = Lf(e.nextSibling);
  xg = b;
  I = true;
  zg = null;
  null !== a && (og[pg++] = rg, og[pg++] = sg, og[pg++] = qg, rg = a.id, sg = a.overflow, qg = b);
  b = qj(b, d.children);
  b.flags |= 4096;
  return b;
}
function vj(a, b, c) {
  a.lanes |= b;
  var d = a.alternate;
  null !== d && (d.lanes |= b);
  bh(a.return, b, c);
}
function wj(a, b, c, d, e) {
  var f2 = a.memoizedState;
  null === f2 ? a.memoizedState = { isBackwards: b, rendering: null, renderingStartTime: 0, last: d, tail: c, tailMode: e } : (f2.isBackwards = b, f2.rendering = null, f2.renderingStartTime = 0, f2.last = d, f2.tail = c, f2.tailMode = e);
}
function xj(a, b, c) {
  var d = b.pendingProps, e = d.revealOrder, f2 = d.tail;
  Xi(a, b, d.children, c);
  d = L.current;
  if (0 !== (d & 2)) d = d & 1 | 2, b.flags |= 128;
  else {
    if (null !== a && 0 !== (a.flags & 128)) a: for (a = b.child; null !== a; ) {
      if (13 === a.tag) null !== a.memoizedState && vj(a, c, b);
      else if (19 === a.tag) vj(a, c, b);
      else if (null !== a.child) {
        a.child.return = a;
        a = a.child;
        continue;
      }
      if (a === b) break a;
      for (; null === a.sibling; ) {
        if (null === a.return || a.return === b) break a;
        a = a.return;
      }
      a.sibling.return = a.return;
      a = a.sibling;
    }
    d &= 1;
  }
  G(L, d);
  if (0 === (b.mode & 1)) b.memoizedState = null;
  else switch (e) {
    case "forwards":
      c = b.child;
      for (e = null; null !== c; ) a = c.alternate, null !== a && null === Ch(a) && (e = c), c = c.sibling;
      c = e;
      null === c ? (e = b.child, b.child = null) : (e = c.sibling, c.sibling = null);
      wj(b, false, e, c, f2);
      break;
    case "backwards":
      c = null;
      e = b.child;
      for (b.child = null; null !== e; ) {
        a = e.alternate;
        if (null !== a && null === Ch(a)) {
          b.child = e;
          break;
        }
        a = e.sibling;
        e.sibling = c;
        c = e;
        e = a;
      }
      wj(b, true, c, null, f2);
      break;
    case "together":
      wj(b, false, null, null, void 0);
      break;
    default:
      b.memoizedState = null;
  }
  return b.child;
}
function ij(a, b) {
  0 === (b.mode & 1) && null !== a && (a.alternate = null, b.alternate = null, b.flags |= 2);
}
function Zi(a, b, c) {
  null !== a && (b.dependencies = a.dependencies);
  rh |= b.lanes;
  if (0 === (c & b.childLanes)) return null;
  if (null !== a && b.child !== a.child) throw Error(p(153));
  if (null !== b.child) {
    a = b.child;
    c = Pg(a, a.pendingProps);
    b.child = c;
    for (c.return = b; null !== a.sibling; ) a = a.sibling, c = c.sibling = Pg(a, a.pendingProps), c.return = b;
    c.sibling = null;
  }
  return b.child;
}
function yj(a, b, c) {
  switch (b.tag) {
    case 3:
      kj(b);
      Ig();
      break;
    case 5:
      Ah(b);
      break;
    case 1:
      Zf(b.type) && cg(b);
      break;
    case 4:
      yh(b, b.stateNode.containerInfo);
      break;
    case 10:
      var d = b.type._context, e = b.memoizedProps.value;
      G(Wg, d._currentValue);
      d._currentValue = e;
      break;
    case 13:
      d = b.memoizedState;
      if (null !== d) {
        if (null !== d.dehydrated) return G(L, L.current & 1), b.flags |= 128, null;
        if (0 !== (c & b.child.childLanes)) return oj(a, b, c);
        G(L, L.current & 1);
        a = Zi(a, b, c);
        return null !== a ? a.sibling : null;
      }
      G(L, L.current & 1);
      break;
    case 19:
      d = 0 !== (c & b.childLanes);
      if (0 !== (a.flags & 128)) {
        if (d) return xj(a, b, c);
        b.flags |= 128;
      }
      e = b.memoizedState;
      null !== e && (e.rendering = null, e.tail = null, e.lastEffect = null);
      G(L, L.current);
      if (d) break;
      else return null;
    case 22:
    case 23:
      return b.lanes = 0, dj(a, b, c);
  }
  return Zi(a, b, c);
}
var zj, Aj, Bj, Cj;
zj = function(a, b) {
  for (var c = b.child; null !== c; ) {
    if (5 === c.tag || 6 === c.tag) a.appendChild(c.stateNode);
    else if (4 !== c.tag && null !== c.child) {
      c.child.return = c;
      c = c.child;
      continue;
    }
    if (c === b) break;
    for (; null === c.sibling; ) {
      if (null === c.return || c.return === b) return;
      c = c.return;
    }
    c.sibling.return = c.return;
    c = c.sibling;
  }
};
Aj = function() {
};
Bj = function(a, b, c, d) {
  var e = a.memoizedProps;
  if (e !== d) {
    a = b.stateNode;
    xh(uh.current);
    var f2 = null;
    switch (c) {
      case "input":
        e = Ya(a, e);
        d = Ya(a, d);
        f2 = [];
        break;
      case "select":
        e = A({}, e, { value: void 0 });
        d = A({}, d, { value: void 0 });
        f2 = [];
        break;
      case "textarea":
        e = gb(a, e);
        d = gb(a, d);
        f2 = [];
        break;
      default:
        "function" !== typeof e.onClick && "function" === typeof d.onClick && (a.onclick = Bf);
    }
    ub(c, d);
    var g;
    c = null;
    for (l2 in e) if (!d.hasOwnProperty(l2) && e.hasOwnProperty(l2) && null != e[l2]) if ("style" === l2) {
      var h = e[l2];
      for (g in h) h.hasOwnProperty(g) && (c || (c = {}), c[g] = "");
    } else "dangerouslySetInnerHTML" !== l2 && "children" !== l2 && "suppressContentEditableWarning" !== l2 && "suppressHydrationWarning" !== l2 && "autoFocus" !== l2 && (ea.hasOwnProperty(l2) ? f2 || (f2 = []) : (f2 = f2 || []).push(l2, null));
    for (l2 in d) {
      var k2 = d[l2];
      h = null != e ? e[l2] : void 0;
      if (d.hasOwnProperty(l2) && k2 !== h && (null != k2 || null != h)) if ("style" === l2) if (h) {
        for (g in h) !h.hasOwnProperty(g) || k2 && k2.hasOwnProperty(g) || (c || (c = {}), c[g] = "");
        for (g in k2) k2.hasOwnProperty(g) && h[g] !== k2[g] && (c || (c = {}), c[g] = k2[g]);
      } else c || (f2 || (f2 = []), f2.push(
        l2,
        c
      )), c = k2;
      else "dangerouslySetInnerHTML" === l2 ? (k2 = k2 ? k2.__html : void 0, h = h ? h.__html : void 0, null != k2 && h !== k2 && (f2 = f2 || []).push(l2, k2)) : "children" === l2 ? "string" !== typeof k2 && "number" !== typeof k2 || (f2 = f2 || []).push(l2, "" + k2) : "suppressContentEditableWarning" !== l2 && "suppressHydrationWarning" !== l2 && (ea.hasOwnProperty(l2) ? (null != k2 && "onScroll" === l2 && D("scroll", a), f2 || h === k2 || (f2 = [])) : (f2 = f2 || []).push(l2, k2));
    }
    c && (f2 = f2 || []).push("style", c);
    var l2 = f2;
    if (b.updateQueue = l2) b.flags |= 4;
  }
};
Cj = function(a, b, c, d) {
  c !== d && (b.flags |= 4);
};
function Dj(a, b) {
  if (!I) switch (a.tailMode) {
    case "hidden":
      b = a.tail;
      for (var c = null; null !== b; ) null !== b.alternate && (c = b), b = b.sibling;
      null === c ? a.tail = null : c.sibling = null;
      break;
    case "collapsed":
      c = a.tail;
      for (var d = null; null !== c; ) null !== c.alternate && (d = c), c = c.sibling;
      null === d ? b || null === a.tail ? a.tail = null : a.tail.sibling = null : d.sibling = null;
  }
}
function S(a) {
  var b = null !== a.alternate && a.alternate.child === a.child, c = 0, d = 0;
  if (b) for (var e = a.child; null !== e; ) c |= e.lanes | e.childLanes, d |= e.subtreeFlags & 14680064, d |= e.flags & 14680064, e.return = a, e = e.sibling;
  else for (e = a.child; null !== e; ) c |= e.lanes | e.childLanes, d |= e.subtreeFlags, d |= e.flags, e.return = a, e = e.sibling;
  a.subtreeFlags |= d;
  a.childLanes = c;
  return b;
}
function Ej(a, b, c) {
  var d = b.pendingProps;
  wg(b);
  switch (b.tag) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return S(b), null;
    case 1:
      return Zf(b.type) && $f(), S(b), null;
    case 3:
      d = b.stateNode;
      zh();
      E(Wf);
      E(H);
      Eh();
      d.pendingContext && (d.context = d.pendingContext, d.pendingContext = null);
      if (null === a || null === a.child) Gg(b) ? b.flags |= 4 : null === a || a.memoizedState.isDehydrated && 0 === (b.flags & 256) || (b.flags |= 1024, null !== zg && (Fj(zg), zg = null));
      Aj(a, b);
      S(b);
      return null;
    case 5:
      Bh(b);
      var e = xh(wh.current);
      c = b.type;
      if (null !== a && null != b.stateNode) Bj(a, b, c, d, e), a.ref !== b.ref && (b.flags |= 512, b.flags |= 2097152);
      else {
        if (!d) {
          if (null === b.stateNode) throw Error(p(166));
          S(b);
          return null;
        }
        a = xh(uh.current);
        if (Gg(b)) {
          d = b.stateNode;
          c = b.type;
          var f2 = b.memoizedProps;
          d[Of] = b;
          d[Pf] = f2;
          a = 0 !== (b.mode & 1);
          switch (c) {
            case "dialog":
              D("cancel", d);
              D("close", d);
              break;
            case "iframe":
            case "object":
            case "embed":
              D("load", d);
              break;
            case "video":
            case "audio":
              for (e = 0; e < lf.length; e++) D(lf[e], d);
              break;
            case "source":
              D("error", d);
              break;
            case "img":
            case "image":
            case "link":
              D(
                "error",
                d
              );
              D("load", d);
              break;
            case "details":
              D("toggle", d);
              break;
            case "input":
              Za(d, f2);
              D("invalid", d);
              break;
            case "select":
              d._wrapperState = { wasMultiple: !!f2.multiple };
              D("invalid", d);
              break;
            case "textarea":
              hb(d, f2), D("invalid", d);
          }
          ub(c, f2);
          e = null;
          for (var g in f2) if (f2.hasOwnProperty(g)) {
            var h = f2[g];
            "children" === g ? "string" === typeof h ? d.textContent !== h && (true !== f2.suppressHydrationWarning && Af(d.textContent, h, a), e = ["children", h]) : "number" === typeof h && d.textContent !== "" + h && (true !== f2.suppressHydrationWarning && Af(
              d.textContent,
              h,
              a
            ), e = ["children", "" + h]) : ea.hasOwnProperty(g) && null != h && "onScroll" === g && D("scroll", d);
          }
          switch (c) {
            case "input":
              Va(d);
              db(d, f2, true);
              break;
            case "textarea":
              Va(d);
              jb(d);
              break;
            case "select":
            case "option":
              break;
            default:
              "function" === typeof f2.onClick && (d.onclick = Bf);
          }
          d = e;
          b.updateQueue = d;
          null !== d && (b.flags |= 4);
        } else {
          g = 9 === e.nodeType ? e : e.ownerDocument;
          "http://www.w3.org/1999/xhtml" === a && (a = kb(c));
          "http://www.w3.org/1999/xhtml" === a ? "script" === c ? (a = g.createElement("div"), a.innerHTML = "<script><\/script>", a = a.removeChild(a.firstChild)) : "string" === typeof d.is ? a = g.createElement(c, { is: d.is }) : (a = g.createElement(c), "select" === c && (g = a, d.multiple ? g.multiple = true : d.size && (g.size = d.size))) : a = g.createElementNS(a, c);
          a[Of] = b;
          a[Pf] = d;
          zj(a, b, false, false);
          b.stateNode = a;
          a: {
            g = vb(c, d);
            switch (c) {
              case "dialog":
                D("cancel", a);
                D("close", a);
                e = d;
                break;
              case "iframe":
              case "object":
              case "embed":
                D("load", a);
                e = d;
                break;
              case "video":
              case "audio":
                for (e = 0; e < lf.length; e++) D(lf[e], a);
                e = d;
                break;
              case "source":
                D("error", a);
                e = d;
                break;
              case "img":
              case "image":
              case "link":
                D(
                  "error",
                  a
                );
                D("load", a);
                e = d;
                break;
              case "details":
                D("toggle", a);
                e = d;
                break;
              case "input":
                Za(a, d);
                e = Ya(a, d);
                D("invalid", a);
                break;
              case "option":
                e = d;
                break;
              case "select":
                a._wrapperState = { wasMultiple: !!d.multiple };
                e = A({}, d, { value: void 0 });
                D("invalid", a);
                break;
              case "textarea":
                hb(a, d);
                e = gb(a, d);
                D("invalid", a);
                break;
              default:
                e = d;
            }
            ub(c, e);
            h = e;
            for (f2 in h) if (h.hasOwnProperty(f2)) {
              var k2 = h[f2];
              "style" === f2 ? sb(a, k2) : "dangerouslySetInnerHTML" === f2 ? (k2 = k2 ? k2.__html : void 0, null != k2 && nb(a, k2)) : "children" === f2 ? "string" === typeof k2 ? ("textarea" !== c || "" !== k2) && ob(a, k2) : "number" === typeof k2 && ob(a, "" + k2) : "suppressContentEditableWarning" !== f2 && "suppressHydrationWarning" !== f2 && "autoFocus" !== f2 && (ea.hasOwnProperty(f2) ? null != k2 && "onScroll" === f2 && D("scroll", a) : null != k2 && ta(a, f2, k2, g));
            }
            switch (c) {
              case "input":
                Va(a);
                db(a, d, false);
                break;
              case "textarea":
                Va(a);
                jb(a);
                break;
              case "option":
                null != d.value && a.setAttribute("value", "" + Sa(d.value));
                break;
              case "select":
                a.multiple = !!d.multiple;
                f2 = d.value;
                null != f2 ? fb(a, !!d.multiple, f2, false) : null != d.defaultValue && fb(
                  a,
                  !!d.multiple,
                  d.defaultValue,
                  true
                );
                break;
              default:
                "function" === typeof e.onClick && (a.onclick = Bf);
            }
            switch (c) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                d = !!d.autoFocus;
                break a;
              case "img":
                d = true;
                break a;
              default:
                d = false;
            }
          }
          d && (b.flags |= 4);
        }
        null !== b.ref && (b.flags |= 512, b.flags |= 2097152);
      }
      S(b);
      return null;
    case 6:
      if (a && null != b.stateNode) Cj(a, b, a.memoizedProps, d);
      else {
        if ("string" !== typeof d && null === b.stateNode) throw Error(p(166));
        c = xh(wh.current);
        xh(uh.current);
        if (Gg(b)) {
          d = b.stateNode;
          c = b.memoizedProps;
          d[Of] = b;
          if (f2 = d.nodeValue !== c) {
            if (a = xg, null !== a) switch (a.tag) {
              case 3:
                Af(d.nodeValue, c, 0 !== (a.mode & 1));
                break;
              case 5:
                true !== a.memoizedProps.suppressHydrationWarning && Af(d.nodeValue, c, 0 !== (a.mode & 1));
            }
          }
          f2 && (b.flags |= 4);
        } else d = (9 === c.nodeType ? c : c.ownerDocument).createTextNode(d), d[Of] = b, b.stateNode = d;
      }
      S(b);
      return null;
    case 13:
      E(L);
      d = b.memoizedState;
      if (null === a || null !== a.memoizedState && null !== a.memoizedState.dehydrated) {
        if (I && null !== yg && 0 !== (b.mode & 1) && 0 === (b.flags & 128)) Hg(), Ig(), b.flags |= 98560, f2 = false;
        else if (f2 = Gg(b), null !== d && null !== d.dehydrated) {
          if (null === a) {
            if (!f2) throw Error(p(318));
            f2 = b.memoizedState;
            f2 = null !== f2 ? f2.dehydrated : null;
            if (!f2) throw Error(p(317));
            f2[Of] = b;
          } else Ig(), 0 === (b.flags & 128) && (b.memoizedState = null), b.flags |= 4;
          S(b);
          f2 = false;
        } else null !== zg && (Fj(zg), zg = null), f2 = true;
        if (!f2) return b.flags & 65536 ? b : null;
      }
      if (0 !== (b.flags & 128)) return b.lanes = c, b;
      d = null !== d;
      d !== (null !== a && null !== a.memoizedState) && d && (b.child.flags |= 8192, 0 !== (b.mode & 1) && (null === a || 0 !== (L.current & 1) ? 0 === T && (T = 3) : tj()));
      null !== b.updateQueue && (b.flags |= 4);
      S(b);
      return null;
    case 4:
      return zh(), Aj(a, b), null === a && sf(b.stateNode.containerInfo), S(b), null;
    case 10:
      return ah(b.type._context), S(b), null;
    case 17:
      return Zf(b.type) && $f(), S(b), null;
    case 19:
      E(L);
      f2 = b.memoizedState;
      if (null === f2) return S(b), null;
      d = 0 !== (b.flags & 128);
      g = f2.rendering;
      if (null === g) if (d) Dj(f2, false);
      else {
        if (0 !== T || null !== a && 0 !== (a.flags & 128)) for (a = b.child; null !== a; ) {
          g = Ch(a);
          if (null !== g) {
            b.flags |= 128;
            Dj(f2, false);
            d = g.updateQueue;
            null !== d && (b.updateQueue = d, b.flags |= 4);
            b.subtreeFlags = 0;
            d = c;
            for (c = b.child; null !== c; ) f2 = c, a = d, f2.flags &= 14680066, g = f2.alternate, null === g ? (f2.childLanes = 0, f2.lanes = a, f2.child = null, f2.subtreeFlags = 0, f2.memoizedProps = null, f2.memoizedState = null, f2.updateQueue = null, f2.dependencies = null, f2.stateNode = null) : (f2.childLanes = g.childLanes, f2.lanes = g.lanes, f2.child = g.child, f2.subtreeFlags = 0, f2.deletions = null, f2.memoizedProps = g.memoizedProps, f2.memoizedState = g.memoizedState, f2.updateQueue = g.updateQueue, f2.type = g.type, a = g.dependencies, f2.dependencies = null === a ? null : { lanes: a.lanes, firstContext: a.firstContext }), c = c.sibling;
            G(L, L.current & 1 | 2);
            return b.child;
          }
          a = a.sibling;
        }
        null !== f2.tail && B() > Gj && (b.flags |= 128, d = true, Dj(f2, false), b.lanes = 4194304);
      }
      else {
        if (!d) if (a = Ch(g), null !== a) {
          if (b.flags |= 128, d = true, c = a.updateQueue, null !== c && (b.updateQueue = c, b.flags |= 4), Dj(f2, true), null === f2.tail && "hidden" === f2.tailMode && !g.alternate && !I) return S(b), null;
        } else 2 * B() - f2.renderingStartTime > Gj && 1073741824 !== c && (b.flags |= 128, d = true, Dj(f2, false), b.lanes = 4194304);
        f2.isBackwards ? (g.sibling = b.child, b.child = g) : (c = f2.last, null !== c ? c.sibling = g : b.child = g, f2.last = g);
      }
      if (null !== f2.tail) return b = f2.tail, f2.rendering = b, f2.tail = b.sibling, f2.renderingStartTime = B(), b.sibling = null, c = L.current, G(L, d ? c & 1 | 2 : c & 1), b;
      S(b);
      return null;
    case 22:
    case 23:
      return Hj(), d = null !== b.memoizedState, null !== a && null !== a.memoizedState !== d && (b.flags |= 8192), d && 0 !== (b.mode & 1) ? 0 !== (fj & 1073741824) && (S(b), b.subtreeFlags & 6 && (b.flags |= 8192)) : S(b), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(p(156, b.tag));
}
function Ij(a, b) {
  wg(b);
  switch (b.tag) {
    case 1:
      return Zf(b.type) && $f(), a = b.flags, a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
    case 3:
      return zh(), E(Wf), E(H), Eh(), a = b.flags, 0 !== (a & 65536) && 0 === (a & 128) ? (b.flags = a & -65537 | 128, b) : null;
    case 5:
      return Bh(b), null;
    case 13:
      E(L);
      a = b.memoizedState;
      if (null !== a && null !== a.dehydrated) {
        if (null === b.alternate) throw Error(p(340));
        Ig();
      }
      a = b.flags;
      return a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
    case 19:
      return E(L), null;
    case 4:
      return zh(), null;
    case 10:
      return ah(b.type._context), null;
    case 22:
    case 23:
      return Hj(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var Jj = false, U = false, Kj = "function" === typeof WeakSet ? WeakSet : Set, V = null;
function Lj(a, b) {
  var c = a.ref;
  if (null !== c) if ("function" === typeof c) try {
    c(null);
  } catch (d) {
    W(a, b, d);
  }
  else c.current = null;
}
function Mj(a, b, c) {
  try {
    c();
  } catch (d) {
    W(a, b, d);
  }
}
var Nj = false;
function Oj(a, b) {
  Cf = dd;
  a = Me();
  if (Ne(a)) {
    if ("selectionStart" in a) var c = { start: a.selectionStart, end: a.selectionEnd };
    else a: {
      c = (c = a.ownerDocument) && c.defaultView || window;
      var d = c.getSelection && c.getSelection();
      if (d && 0 !== d.rangeCount) {
        c = d.anchorNode;
        var e = d.anchorOffset, f2 = d.focusNode;
        d = d.focusOffset;
        try {
          c.nodeType, f2.nodeType;
        } catch (F2) {
          c = null;
          break a;
        }
        var g = 0, h = -1, k2 = -1, l2 = 0, m2 = 0, q2 = a, r2 = null;
        b: for (; ; ) {
          for (var y2; ; ) {
            q2 !== c || 0 !== e && 3 !== q2.nodeType || (h = g + e);
            q2 !== f2 || 0 !== d && 3 !== q2.nodeType || (k2 = g + d);
            3 === q2.nodeType && (g += q2.nodeValue.length);
            if (null === (y2 = q2.firstChild)) break;
            r2 = q2;
            q2 = y2;
          }
          for (; ; ) {
            if (q2 === a) break b;
            r2 === c && ++l2 === e && (h = g);
            r2 === f2 && ++m2 === d && (k2 = g);
            if (null !== (y2 = q2.nextSibling)) break;
            q2 = r2;
            r2 = q2.parentNode;
          }
          q2 = y2;
        }
        c = -1 === h || -1 === k2 ? null : { start: h, end: k2 };
      } else c = null;
    }
    c = c || { start: 0, end: 0 };
  } else c = null;
  Df = { focusedElem: a, selectionRange: c };
  dd = false;
  for (V = b; null !== V; ) if (b = V, a = b.child, 0 !== (b.subtreeFlags & 1028) && null !== a) a.return = b, V = a;
  else for (; null !== V; ) {
    b = V;
    try {
      var n2 = b.alternate;
      if (0 !== (b.flags & 1024)) switch (b.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (null !== n2) {
            var t2 = n2.memoizedProps, J2 = n2.memoizedState, x2 = b.stateNode, w2 = x2.getSnapshotBeforeUpdate(b.elementType === b.type ? t2 : Ci(b.type, t2), J2);
            x2.__reactInternalSnapshotBeforeUpdate = w2;
          }
          break;
        case 3:
          var u2 = b.stateNode.containerInfo;
          1 === u2.nodeType ? u2.textContent = "" : 9 === u2.nodeType && u2.documentElement && u2.removeChild(u2.documentElement);
          break;
        case 5:
        case 6:
        case 4:
        case 17:
          break;
        default:
          throw Error(p(163));
      }
    } catch (F2) {
      W(b, b.return, F2);
    }
    a = b.sibling;
    if (null !== a) {
      a.return = b.return;
      V = a;
      break;
    }
    V = b.return;
  }
  n2 = Nj;
  Nj = false;
  return n2;
}
function Pj(a, b, c) {
  var d = b.updateQueue;
  d = null !== d ? d.lastEffect : null;
  if (null !== d) {
    var e = d = d.next;
    do {
      if ((e.tag & a) === a) {
        var f2 = e.destroy;
        e.destroy = void 0;
        void 0 !== f2 && Mj(b, c, f2);
      }
      e = e.next;
    } while (e !== d);
  }
}
function Qj(a, b) {
  b = b.updateQueue;
  b = null !== b ? b.lastEffect : null;
  if (null !== b) {
    var c = b = b.next;
    do {
      if ((c.tag & a) === a) {
        var d = c.create;
        c.destroy = d();
      }
      c = c.next;
    } while (c !== b);
  }
}
function Rj(a) {
  var b = a.ref;
  if (null !== b) {
    var c = a.stateNode;
    switch (a.tag) {
      case 5:
        a = c;
        break;
      default:
        a = c;
    }
    "function" === typeof b ? b(a) : b.current = a;
  }
}
function Sj(a) {
  var b = a.alternate;
  null !== b && (a.alternate = null, Sj(b));
  a.child = null;
  a.deletions = null;
  a.sibling = null;
  5 === a.tag && (b = a.stateNode, null !== b && (delete b[Of], delete b[Pf], delete b[of], delete b[Qf], delete b[Rf]));
  a.stateNode = null;
  a.return = null;
  a.dependencies = null;
  a.memoizedProps = null;
  a.memoizedState = null;
  a.pendingProps = null;
  a.stateNode = null;
  a.updateQueue = null;
}
function Tj(a) {
  return 5 === a.tag || 3 === a.tag || 4 === a.tag;
}
function Uj(a) {
  a: for (; ; ) {
    for (; null === a.sibling; ) {
      if (null === a.return || Tj(a.return)) return null;
      a = a.return;
    }
    a.sibling.return = a.return;
    for (a = a.sibling; 5 !== a.tag && 6 !== a.tag && 18 !== a.tag; ) {
      if (a.flags & 2) continue a;
      if (null === a.child || 4 === a.tag) continue a;
      else a.child.return = a, a = a.child;
    }
    if (!(a.flags & 2)) return a.stateNode;
  }
}
function Vj(a, b, c) {
  var d = a.tag;
  if (5 === d || 6 === d) a = a.stateNode, b ? 8 === c.nodeType ? c.parentNode.insertBefore(a, b) : c.insertBefore(a, b) : (8 === c.nodeType ? (b = c.parentNode, b.insertBefore(a, c)) : (b = c, b.appendChild(a)), c = c._reactRootContainer, null !== c && void 0 !== c || null !== b.onclick || (b.onclick = Bf));
  else if (4 !== d && (a = a.child, null !== a)) for (Vj(a, b, c), a = a.sibling; null !== a; ) Vj(a, b, c), a = a.sibling;
}
function Wj(a, b, c) {
  var d = a.tag;
  if (5 === d || 6 === d) a = a.stateNode, b ? c.insertBefore(a, b) : c.appendChild(a);
  else if (4 !== d && (a = a.child, null !== a)) for (Wj(a, b, c), a = a.sibling; null !== a; ) Wj(a, b, c), a = a.sibling;
}
var X = null, Xj = false;
function Yj(a, b, c) {
  for (c = c.child; null !== c; ) Zj(a, b, c), c = c.sibling;
}
function Zj(a, b, c) {
  if (lc && "function" === typeof lc.onCommitFiberUnmount) try {
    lc.onCommitFiberUnmount(kc, c);
  } catch (h) {
  }
  switch (c.tag) {
    case 5:
      U || Lj(c, b);
    case 6:
      var d = X, e = Xj;
      X = null;
      Yj(a, b, c);
      X = d;
      Xj = e;
      null !== X && (Xj ? (a = X, c = c.stateNode, 8 === a.nodeType ? a.parentNode.removeChild(c) : a.removeChild(c)) : X.removeChild(c.stateNode));
      break;
    case 18:
      null !== X && (Xj ? (a = X, c = c.stateNode, 8 === a.nodeType ? Kf(a.parentNode, c) : 1 === a.nodeType && Kf(a, c), bd(a)) : Kf(X, c.stateNode));
      break;
    case 4:
      d = X;
      e = Xj;
      X = c.stateNode.containerInfo;
      Xj = true;
      Yj(a, b, c);
      X = d;
      Xj = e;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!U && (d = c.updateQueue, null !== d && (d = d.lastEffect, null !== d))) {
        e = d = d.next;
        do {
          var f2 = e, g = f2.destroy;
          f2 = f2.tag;
          void 0 !== g && (0 !== (f2 & 2) ? Mj(c, b, g) : 0 !== (f2 & 4) && Mj(c, b, g));
          e = e.next;
        } while (e !== d);
      }
      Yj(a, b, c);
      break;
    case 1:
      if (!U && (Lj(c, b), d = c.stateNode, "function" === typeof d.componentWillUnmount)) try {
        d.props = c.memoizedProps, d.state = c.memoizedState, d.componentWillUnmount();
      } catch (h) {
        W(c, b, h);
      }
      Yj(a, b, c);
      break;
    case 21:
      Yj(a, b, c);
      break;
    case 22:
      c.mode & 1 ? (U = (d = U) || null !== c.memoizedState, Yj(a, b, c), U = d) : Yj(a, b, c);
      break;
    default:
      Yj(a, b, c);
  }
}
function ak(a) {
  var b = a.updateQueue;
  if (null !== b) {
    a.updateQueue = null;
    var c = a.stateNode;
    null === c && (c = a.stateNode = new Kj());
    b.forEach(function(b2) {
      var d = bk.bind(null, a, b2);
      c.has(b2) || (c.add(b2), b2.then(d, d));
    });
  }
}
function ck(a, b) {
  var c = b.deletions;
  if (null !== c) for (var d = 0; d < c.length; d++) {
    var e = c[d];
    try {
      var f2 = a, g = b, h = g;
      a: for (; null !== h; ) {
        switch (h.tag) {
          case 5:
            X = h.stateNode;
            Xj = false;
            break a;
          case 3:
            X = h.stateNode.containerInfo;
            Xj = true;
            break a;
          case 4:
            X = h.stateNode.containerInfo;
            Xj = true;
            break a;
        }
        h = h.return;
      }
      if (null === X) throw Error(p(160));
      Zj(f2, g, e);
      X = null;
      Xj = false;
      var k2 = e.alternate;
      null !== k2 && (k2.return = null);
      e.return = null;
    } catch (l2) {
      W(e, b, l2);
    }
  }
  if (b.subtreeFlags & 12854) for (b = b.child; null !== b; ) dk(b, a), b = b.sibling;
}
function dk(a, b) {
  var c = a.alternate, d = a.flags;
  switch (a.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      ck(b, a);
      ek(a);
      if (d & 4) {
        try {
          Pj(3, a, a.return), Qj(3, a);
        } catch (t2) {
          W(a, a.return, t2);
        }
        try {
          Pj(5, a, a.return);
        } catch (t2) {
          W(a, a.return, t2);
        }
      }
      break;
    case 1:
      ck(b, a);
      ek(a);
      d & 512 && null !== c && Lj(c, c.return);
      break;
    case 5:
      ck(b, a);
      ek(a);
      d & 512 && null !== c && Lj(c, c.return);
      if (a.flags & 32) {
        var e = a.stateNode;
        try {
          ob(e, "");
        } catch (t2) {
          W(a, a.return, t2);
        }
      }
      if (d & 4 && (e = a.stateNode, null != e)) {
        var f2 = a.memoizedProps, g = null !== c ? c.memoizedProps : f2, h = a.type, k2 = a.updateQueue;
        a.updateQueue = null;
        if (null !== k2) try {
          "input" === h && "radio" === f2.type && null != f2.name && ab(e, f2);
          vb(h, g);
          var l2 = vb(h, f2);
          for (g = 0; g < k2.length; g += 2) {
            var m2 = k2[g], q2 = k2[g + 1];
            "style" === m2 ? sb(e, q2) : "dangerouslySetInnerHTML" === m2 ? nb(e, q2) : "children" === m2 ? ob(e, q2) : ta(e, m2, q2, l2);
          }
          switch (h) {
            case "input":
              bb(e, f2);
              break;
            case "textarea":
              ib(e, f2);
              break;
            case "select":
              var r2 = e._wrapperState.wasMultiple;
              e._wrapperState.wasMultiple = !!f2.multiple;
              var y2 = f2.value;
              null != y2 ? fb(e, !!f2.multiple, y2, false) : r2 !== !!f2.multiple && (null != f2.defaultValue ? fb(
                e,
                !!f2.multiple,
                f2.defaultValue,
                true
              ) : fb(e, !!f2.multiple, f2.multiple ? [] : "", false));
          }
          e[Pf] = f2;
        } catch (t2) {
          W(a, a.return, t2);
        }
      }
      break;
    case 6:
      ck(b, a);
      ek(a);
      if (d & 4) {
        if (null === a.stateNode) throw Error(p(162));
        e = a.stateNode;
        f2 = a.memoizedProps;
        try {
          e.nodeValue = f2;
        } catch (t2) {
          W(a, a.return, t2);
        }
      }
      break;
    case 3:
      ck(b, a);
      ek(a);
      if (d & 4 && null !== c && c.memoizedState.isDehydrated) try {
        bd(b.containerInfo);
      } catch (t2) {
        W(a, a.return, t2);
      }
      break;
    case 4:
      ck(b, a);
      ek(a);
      break;
    case 13:
      ck(b, a);
      ek(a);
      e = a.child;
      e.flags & 8192 && (f2 = null !== e.memoizedState, e.stateNode.isHidden = f2, !f2 || null !== e.alternate && null !== e.alternate.memoizedState || (fk = B()));
      d & 4 && ak(a);
      break;
    case 22:
      m2 = null !== c && null !== c.memoizedState;
      a.mode & 1 ? (U = (l2 = U) || m2, ck(b, a), U = l2) : ck(b, a);
      ek(a);
      if (d & 8192) {
        l2 = null !== a.memoizedState;
        if ((a.stateNode.isHidden = l2) && !m2 && 0 !== (a.mode & 1)) for (V = a, m2 = a.child; null !== m2; ) {
          for (q2 = V = m2; null !== V; ) {
            r2 = V;
            y2 = r2.child;
            switch (r2.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                Pj(4, r2, r2.return);
                break;
              case 1:
                Lj(r2, r2.return);
                var n2 = r2.stateNode;
                if ("function" === typeof n2.componentWillUnmount) {
                  d = r2;
                  c = r2.return;
                  try {
                    b = d, n2.props = b.memoizedProps, n2.state = b.memoizedState, n2.componentWillUnmount();
                  } catch (t2) {
                    W(d, c, t2);
                  }
                }
                break;
              case 5:
                Lj(r2, r2.return);
                break;
              case 22:
                if (null !== r2.memoizedState) {
                  gk(q2);
                  continue;
                }
            }
            null !== y2 ? (y2.return = r2, V = y2) : gk(q2);
          }
          m2 = m2.sibling;
        }
        a: for (m2 = null, q2 = a; ; ) {
          if (5 === q2.tag) {
            if (null === m2) {
              m2 = q2;
              try {
                e = q2.stateNode, l2 ? (f2 = e.style, "function" === typeof f2.setProperty ? f2.setProperty("display", "none", "important") : f2.display = "none") : (h = q2.stateNode, k2 = q2.memoizedProps.style, g = void 0 !== k2 && null !== k2 && k2.hasOwnProperty("display") ? k2.display : null, h.style.display = rb("display", g));
              } catch (t2) {
                W(a, a.return, t2);
              }
            }
          } else if (6 === q2.tag) {
            if (null === m2) try {
              q2.stateNode.nodeValue = l2 ? "" : q2.memoizedProps;
            } catch (t2) {
              W(a, a.return, t2);
            }
          } else if ((22 !== q2.tag && 23 !== q2.tag || null === q2.memoizedState || q2 === a) && null !== q2.child) {
            q2.child.return = q2;
            q2 = q2.child;
            continue;
          }
          if (q2 === a) break a;
          for (; null === q2.sibling; ) {
            if (null === q2.return || q2.return === a) break a;
            m2 === q2 && (m2 = null);
            q2 = q2.return;
          }
          m2 === q2 && (m2 = null);
          q2.sibling.return = q2.return;
          q2 = q2.sibling;
        }
      }
      break;
    case 19:
      ck(b, a);
      ek(a);
      d & 4 && ak(a);
      break;
    case 21:
      break;
    default:
      ck(
        b,
        a
      ), ek(a);
  }
}
function ek(a) {
  var b = a.flags;
  if (b & 2) {
    try {
      a: {
        for (var c = a.return; null !== c; ) {
          if (Tj(c)) {
            var d = c;
            break a;
          }
          c = c.return;
        }
        throw Error(p(160));
      }
      switch (d.tag) {
        case 5:
          var e = d.stateNode;
          d.flags & 32 && (ob(e, ""), d.flags &= -33);
          var f2 = Uj(a);
          Wj(a, f2, e);
          break;
        case 3:
        case 4:
          var g = d.stateNode.containerInfo, h = Uj(a);
          Vj(a, h, g);
          break;
        default:
          throw Error(p(161));
      }
    } catch (k2) {
      W(a, a.return, k2);
    }
    a.flags &= -3;
  }
  b & 4096 && (a.flags &= -4097);
}
function hk(a, b, c) {
  V = a;
  ik(a);
}
function ik(a, b, c) {
  for (var d = 0 !== (a.mode & 1); null !== V; ) {
    var e = V, f2 = e.child;
    if (22 === e.tag && d) {
      var g = null !== e.memoizedState || Jj;
      if (!g) {
        var h = e.alternate, k2 = null !== h && null !== h.memoizedState || U;
        h = Jj;
        var l2 = U;
        Jj = g;
        if ((U = k2) && !l2) for (V = e; null !== V; ) g = V, k2 = g.child, 22 === g.tag && null !== g.memoizedState ? jk(e) : null !== k2 ? (k2.return = g, V = k2) : jk(e);
        for (; null !== f2; ) V = f2, ik(f2), f2 = f2.sibling;
        V = e;
        Jj = h;
        U = l2;
      }
      kk(a);
    } else 0 !== (e.subtreeFlags & 8772) && null !== f2 ? (f2.return = e, V = f2) : kk(a);
  }
}
function kk(a) {
  for (; null !== V; ) {
    var b = V;
    if (0 !== (b.flags & 8772)) {
      var c = b.alternate;
      try {
        if (0 !== (b.flags & 8772)) switch (b.tag) {
          case 0:
          case 11:
          case 15:
            U || Qj(5, b);
            break;
          case 1:
            var d = b.stateNode;
            if (b.flags & 4 && !U) if (null === c) d.componentDidMount();
            else {
              var e = b.elementType === b.type ? c.memoizedProps : Ci(b.type, c.memoizedProps);
              d.componentDidUpdate(e, c.memoizedState, d.__reactInternalSnapshotBeforeUpdate);
            }
            var f2 = b.updateQueue;
            null !== f2 && sh(b, f2, d);
            break;
          case 3:
            var g = b.updateQueue;
            if (null !== g) {
              c = null;
              if (null !== b.child) switch (b.child.tag) {
                case 5:
                  c = b.child.stateNode;
                  break;
                case 1:
                  c = b.child.stateNode;
              }
              sh(b, g, c);
            }
            break;
          case 5:
            var h = b.stateNode;
            if (null === c && b.flags & 4) {
              c = h;
              var k2 = b.memoizedProps;
              switch (b.type) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  k2.autoFocus && c.focus();
                  break;
                case "img":
                  k2.src && (c.src = k2.src);
              }
            }
            break;
          case 6:
            break;
          case 4:
            break;
          case 12:
            break;
          case 13:
            if (null === b.memoizedState) {
              var l2 = b.alternate;
              if (null !== l2) {
                var m2 = l2.memoizedState;
                if (null !== m2) {
                  var q2 = m2.dehydrated;
                  null !== q2 && bd(q2);
                }
              }
            }
            break;
          case 19:
          case 17:
          case 21:
          case 22:
          case 23:
          case 25:
            break;
          default:
            throw Error(p(163));
        }
        U || b.flags & 512 && Rj(b);
      } catch (r2) {
        W(b, b.return, r2);
      }
    }
    if (b === a) {
      V = null;
      break;
    }
    c = b.sibling;
    if (null !== c) {
      c.return = b.return;
      V = c;
      break;
    }
    V = b.return;
  }
}
function gk(a) {
  for (; null !== V; ) {
    var b = V;
    if (b === a) {
      V = null;
      break;
    }
    var c = b.sibling;
    if (null !== c) {
      c.return = b.return;
      V = c;
      break;
    }
    V = b.return;
  }
}
function jk(a) {
  for (; null !== V; ) {
    var b = V;
    try {
      switch (b.tag) {
        case 0:
        case 11:
        case 15:
          var c = b.return;
          try {
            Qj(4, b);
          } catch (k2) {
            W(b, c, k2);
          }
          break;
        case 1:
          var d = b.stateNode;
          if ("function" === typeof d.componentDidMount) {
            var e = b.return;
            try {
              d.componentDidMount();
            } catch (k2) {
              W(b, e, k2);
            }
          }
          var f2 = b.return;
          try {
            Rj(b);
          } catch (k2) {
            W(b, f2, k2);
          }
          break;
        case 5:
          var g = b.return;
          try {
            Rj(b);
          } catch (k2) {
            W(b, g, k2);
          }
      }
    } catch (k2) {
      W(b, b.return, k2);
    }
    if (b === a) {
      V = null;
      break;
    }
    var h = b.sibling;
    if (null !== h) {
      h.return = b.return;
      V = h;
      break;
    }
    V = b.return;
  }
}
var lk = Math.ceil, mk = ua.ReactCurrentDispatcher, nk = ua.ReactCurrentOwner, ok = ua.ReactCurrentBatchConfig, K = 0, Q = null, Y = null, Z = 0, fj = 0, ej = Uf(0), T = 0, pk = null, rh = 0, qk = 0, rk = 0, sk = null, tk = null, fk = 0, Gj = Infinity, uk = null, Oi = false, Pi = null, Ri = null, vk = false, wk = null, xk = 0, yk = 0, zk = null, Ak = -1, Bk = 0;
function R() {
  return 0 !== (K & 6) ? B() : -1 !== Ak ? Ak : Ak = B();
}
function yi(a) {
  if (0 === (a.mode & 1)) return 1;
  if (0 !== (K & 2) && 0 !== Z) return Z & -Z;
  if (null !== Kg.transition) return 0 === Bk && (Bk = yc()), Bk;
  a = C;
  if (0 !== a) return a;
  a = window.event;
  a = void 0 === a ? 16 : jd(a.type);
  return a;
}
function gi(a, b, c, d) {
  if (50 < yk) throw yk = 0, zk = null, Error(p(185));
  Ac(a, c, d);
  if (0 === (K & 2) || a !== Q) a === Q && (0 === (K & 2) && (qk |= c), 4 === T && Ck(a, Z)), Dk(a, d), 1 === c && 0 === K && 0 === (b.mode & 1) && (Gj = B() + 500, fg && jg());
}
function Dk(a, b) {
  var c = a.callbackNode;
  wc(a, b);
  var d = uc(a, a === Q ? Z : 0);
  if (0 === d) null !== c && bc(c), a.callbackNode = null, a.callbackPriority = 0;
  else if (b = d & -d, a.callbackPriority !== b) {
    null != c && bc(c);
    if (1 === b) 0 === a.tag ? ig(Ek.bind(null, a)) : hg(Ek.bind(null, a)), Jf(function() {
      0 === (K & 6) && jg();
    }), c = null;
    else {
      switch (Dc(d)) {
        case 1:
          c = fc;
          break;
        case 4:
          c = gc;
          break;
        case 16:
          c = hc;
          break;
        case 536870912:
          c = jc;
          break;
        default:
          c = hc;
      }
      c = Fk(c, Gk.bind(null, a));
    }
    a.callbackPriority = b;
    a.callbackNode = c;
  }
}
function Gk(a, b) {
  Ak = -1;
  Bk = 0;
  if (0 !== (K & 6)) throw Error(p(327));
  var c = a.callbackNode;
  if (Hk() && a.callbackNode !== c) return null;
  var d = uc(a, a === Q ? Z : 0);
  if (0 === d) return null;
  if (0 !== (d & 30) || 0 !== (d & a.expiredLanes) || b) b = Ik(a, d);
  else {
    b = d;
    var e = K;
    K |= 2;
    var f2 = Jk();
    if (Q !== a || Z !== b) uk = null, Gj = B() + 500, Kk(a, b);
    do
      try {
        Lk();
        break;
      } catch (h) {
        Mk(a, h);
      }
    while (1);
    $g();
    mk.current = f2;
    K = e;
    null !== Y ? b = 0 : (Q = null, Z = 0, b = T);
  }
  if (0 !== b) {
    2 === b && (e = xc(a), 0 !== e && (d = e, b = Nk(a, e)));
    if (1 === b) throw c = pk, Kk(a, 0), Ck(a, d), Dk(a, B()), c;
    if (6 === b) Ck(a, d);
    else {
      e = a.current.alternate;
      if (0 === (d & 30) && !Ok(e) && (b = Ik(a, d), 2 === b && (f2 = xc(a), 0 !== f2 && (d = f2, b = Nk(a, f2))), 1 === b)) throw c = pk, Kk(a, 0), Ck(a, d), Dk(a, B()), c;
      a.finishedWork = e;
      a.finishedLanes = d;
      switch (b) {
        case 0:
        case 1:
          throw Error(p(345));
        case 2:
          Pk(a, tk, uk);
          break;
        case 3:
          Ck(a, d);
          if ((d & 130023424) === d && (b = fk + 500 - B(), 10 < b)) {
            if (0 !== uc(a, 0)) break;
            e = a.suspendedLanes;
            if ((e & d) !== d) {
              R();
              a.pingedLanes |= a.suspendedLanes & e;
              break;
            }
            a.timeoutHandle = Ff(Pk.bind(null, a, tk, uk), b);
            break;
          }
          Pk(a, tk, uk);
          break;
        case 4:
          Ck(a, d);
          if ((d & 4194240) === d) break;
          b = a.eventTimes;
          for (e = -1; 0 < d; ) {
            var g = 31 - oc(d);
            f2 = 1 << g;
            g = b[g];
            g > e && (e = g);
            d &= ~f2;
          }
          d = e;
          d = B() - d;
          d = (120 > d ? 120 : 480 > d ? 480 : 1080 > d ? 1080 : 1920 > d ? 1920 : 3e3 > d ? 3e3 : 4320 > d ? 4320 : 1960 * lk(d / 1960)) - d;
          if (10 < d) {
            a.timeoutHandle = Ff(Pk.bind(null, a, tk, uk), d);
            break;
          }
          Pk(a, tk, uk);
          break;
        case 5:
          Pk(a, tk, uk);
          break;
        default:
          throw Error(p(329));
      }
    }
  }
  Dk(a, B());
  return a.callbackNode === c ? Gk.bind(null, a) : null;
}
function Nk(a, b) {
  var c = sk;
  a.current.memoizedState.isDehydrated && (Kk(a, b).flags |= 256);
  a = Ik(a, b);
  2 !== a && (b = tk, tk = c, null !== b && Fj(b));
  return a;
}
function Fj(a) {
  null === tk ? tk = a : tk.push.apply(tk, a);
}
function Ok(a) {
  for (var b = a; ; ) {
    if (b.flags & 16384) {
      var c = b.updateQueue;
      if (null !== c && (c = c.stores, null !== c)) for (var d = 0; d < c.length; d++) {
        var e = c[d], f2 = e.getSnapshot;
        e = e.value;
        try {
          if (!He(f2(), e)) return false;
        } catch (g) {
          return false;
        }
      }
    }
    c = b.child;
    if (b.subtreeFlags & 16384 && null !== c) c.return = b, b = c;
    else {
      if (b === a) break;
      for (; null === b.sibling; ) {
        if (null === b.return || b.return === a) return true;
        b = b.return;
      }
      b.sibling.return = b.return;
      b = b.sibling;
    }
  }
  return true;
}
function Ck(a, b) {
  b &= ~rk;
  b &= ~qk;
  a.suspendedLanes |= b;
  a.pingedLanes &= ~b;
  for (a = a.expirationTimes; 0 < b; ) {
    var c = 31 - oc(b), d = 1 << c;
    a[c] = -1;
    b &= ~d;
  }
}
function Ek(a) {
  if (0 !== (K & 6)) throw Error(p(327));
  Hk();
  var b = uc(a, 0);
  if (0 === (b & 1)) return Dk(a, B()), null;
  var c = Ik(a, b);
  if (0 !== a.tag && 2 === c) {
    var d = xc(a);
    0 !== d && (b = d, c = Nk(a, d));
  }
  if (1 === c) throw c = pk, Kk(a, 0), Ck(a, b), Dk(a, B()), c;
  if (6 === c) throw Error(p(345));
  a.finishedWork = a.current.alternate;
  a.finishedLanes = b;
  Pk(a, tk, uk);
  Dk(a, B());
  return null;
}
function Qk(a, b) {
  var c = K;
  K |= 1;
  try {
    return a(b);
  } finally {
    K = c, 0 === K && (Gj = B() + 500, fg && jg());
  }
}
function Rk(a) {
  null !== wk && 0 === wk.tag && 0 === (K & 6) && Hk();
  var b = K;
  K |= 1;
  var c = ok.transition, d = C;
  try {
    if (ok.transition = null, C = 1, a) return a();
  } finally {
    C = d, ok.transition = c, K = b, 0 === (K & 6) && jg();
  }
}
function Hj() {
  fj = ej.current;
  E(ej);
}
function Kk(a, b) {
  a.finishedWork = null;
  a.finishedLanes = 0;
  var c = a.timeoutHandle;
  -1 !== c && (a.timeoutHandle = -1, Gf(c));
  if (null !== Y) for (c = Y.return; null !== c; ) {
    var d = c;
    wg(d);
    switch (d.tag) {
      case 1:
        d = d.type.childContextTypes;
        null !== d && void 0 !== d && $f();
        break;
      case 3:
        zh();
        E(Wf);
        E(H);
        Eh();
        break;
      case 5:
        Bh(d);
        break;
      case 4:
        zh();
        break;
      case 13:
        E(L);
        break;
      case 19:
        E(L);
        break;
      case 10:
        ah(d.type._context);
        break;
      case 22:
      case 23:
        Hj();
    }
    c = c.return;
  }
  Q = a;
  Y = a = Pg(a.current, null);
  Z = fj = b;
  T = 0;
  pk = null;
  rk = qk = rh = 0;
  tk = sk = null;
  if (null !== fh) {
    for (b = 0; b < fh.length; b++) if (c = fh[b], d = c.interleaved, null !== d) {
      c.interleaved = null;
      var e = d.next, f2 = c.pending;
      if (null !== f2) {
        var g = f2.next;
        f2.next = e;
        d.next = g;
      }
      c.pending = d;
    }
    fh = null;
  }
  return a;
}
function Mk(a, b) {
  do {
    var c = Y;
    try {
      $g();
      Fh.current = Rh;
      if (Ih) {
        for (var d = M.memoizedState; null !== d; ) {
          var e = d.queue;
          null !== e && (e.pending = null);
          d = d.next;
        }
        Ih = false;
      }
      Hh = 0;
      O = N = M = null;
      Jh = false;
      Kh = 0;
      nk.current = null;
      if (null === c || null === c.return) {
        T = 1;
        pk = b;
        Y = null;
        break;
      }
      a: {
        var f2 = a, g = c.return, h = c, k2 = b;
        b = Z;
        h.flags |= 32768;
        if (null !== k2 && "object" === typeof k2 && "function" === typeof k2.then) {
          var l2 = k2, m2 = h, q2 = m2.tag;
          if (0 === (m2.mode & 1) && (0 === q2 || 11 === q2 || 15 === q2)) {
            var r2 = m2.alternate;
            r2 ? (m2.updateQueue = r2.updateQueue, m2.memoizedState = r2.memoizedState, m2.lanes = r2.lanes) : (m2.updateQueue = null, m2.memoizedState = null);
          }
          var y2 = Ui(g);
          if (null !== y2) {
            y2.flags &= -257;
            Vi(y2, g, h, f2, b);
            y2.mode & 1 && Si(f2, l2, b);
            b = y2;
            k2 = l2;
            var n2 = b.updateQueue;
            if (null === n2) {
              var t2 = /* @__PURE__ */ new Set();
              t2.add(k2);
              b.updateQueue = t2;
            } else n2.add(k2);
            break a;
          } else {
            if (0 === (b & 1)) {
              Si(f2, l2, b);
              tj();
              break a;
            }
            k2 = Error(p(426));
          }
        } else if (I && h.mode & 1) {
          var J2 = Ui(g);
          if (null !== J2) {
            0 === (J2.flags & 65536) && (J2.flags |= 256);
            Vi(J2, g, h, f2, b);
            Jg(Ji(k2, h));
            break a;
          }
        }
        f2 = k2 = Ji(k2, h);
        4 !== T && (T = 2);
        null === sk ? sk = [f2] : sk.push(f2);
        f2 = g;
        do {
          switch (f2.tag) {
            case 3:
              f2.flags |= 65536;
              b &= -b;
              f2.lanes |= b;
              var x2 = Ni(f2, k2, b);
              ph(f2, x2);
              break a;
            case 1:
              h = k2;
              var w2 = f2.type, u2 = f2.stateNode;
              if (0 === (f2.flags & 128) && ("function" === typeof w2.getDerivedStateFromError || null !== u2 && "function" === typeof u2.componentDidCatch && (null === Ri || !Ri.has(u2)))) {
                f2.flags |= 65536;
                b &= -b;
                f2.lanes |= b;
                var F2 = Qi(f2, h, b);
                ph(f2, F2);
                break a;
              }
          }
          f2 = f2.return;
        } while (null !== f2);
      }
      Sk(c);
    } catch (na) {
      b = na;
      Y === c && null !== c && (Y = c = c.return);
      continue;
    }
    break;
  } while (1);
}
function Jk() {
  var a = mk.current;
  mk.current = Rh;
  return null === a ? Rh : a;
}
function tj() {
  if (0 === T || 3 === T || 2 === T) T = 4;
  null === Q || 0 === (rh & 268435455) && 0 === (qk & 268435455) || Ck(Q, Z);
}
function Ik(a, b) {
  var c = K;
  K |= 2;
  var d = Jk();
  if (Q !== a || Z !== b) uk = null, Kk(a, b);
  do
    try {
      Tk();
      break;
    } catch (e) {
      Mk(a, e);
    }
  while (1);
  $g();
  K = c;
  mk.current = d;
  if (null !== Y) throw Error(p(261));
  Q = null;
  Z = 0;
  return T;
}
function Tk() {
  for (; null !== Y; ) Uk(Y);
}
function Lk() {
  for (; null !== Y && !cc(); ) Uk(Y);
}
function Uk(a) {
  var b = Vk(a.alternate, a, fj);
  a.memoizedProps = a.pendingProps;
  null === b ? Sk(a) : Y = b;
  nk.current = null;
}
function Sk(a) {
  var b = a;
  do {
    var c = b.alternate;
    a = b.return;
    if (0 === (b.flags & 32768)) {
      if (c = Ej(c, b, fj), null !== c) {
        Y = c;
        return;
      }
    } else {
      c = Ij(c, b);
      if (null !== c) {
        c.flags &= 32767;
        Y = c;
        return;
      }
      if (null !== a) a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null;
      else {
        T = 6;
        Y = null;
        return;
      }
    }
    b = b.sibling;
    if (null !== b) {
      Y = b;
      return;
    }
    Y = b = a;
  } while (null !== b);
  0 === T && (T = 5);
}
function Pk(a, b, c) {
  var d = C, e = ok.transition;
  try {
    ok.transition = null, C = 1, Wk(a, b, c, d);
  } finally {
    ok.transition = e, C = d;
  }
  return null;
}
function Wk(a, b, c, d) {
  do
    Hk();
  while (null !== wk);
  if (0 !== (K & 6)) throw Error(p(327));
  c = a.finishedWork;
  var e = a.finishedLanes;
  if (null === c) return null;
  a.finishedWork = null;
  a.finishedLanes = 0;
  if (c === a.current) throw Error(p(177));
  a.callbackNode = null;
  a.callbackPriority = 0;
  var f2 = c.lanes | c.childLanes;
  Bc(a, f2);
  a === Q && (Y = Q = null, Z = 0);
  0 === (c.subtreeFlags & 2064) && 0 === (c.flags & 2064) || vk || (vk = true, Fk(hc, function() {
    Hk();
    return null;
  }));
  f2 = 0 !== (c.flags & 15990);
  if (0 !== (c.subtreeFlags & 15990) || f2) {
    f2 = ok.transition;
    ok.transition = null;
    var g = C;
    C = 1;
    var h = K;
    K |= 4;
    nk.current = null;
    Oj(a, c);
    dk(c, a);
    Oe(Df);
    dd = !!Cf;
    Df = Cf = null;
    a.current = c;
    hk(c);
    dc();
    K = h;
    C = g;
    ok.transition = f2;
  } else a.current = c;
  vk && (vk = false, wk = a, xk = e);
  f2 = a.pendingLanes;
  0 === f2 && (Ri = null);
  mc(c.stateNode);
  Dk(a, B());
  if (null !== b) for (d = a.onRecoverableError, c = 0; c < b.length; c++) e = b[c], d(e.value, { componentStack: e.stack, digest: e.digest });
  if (Oi) throw Oi = false, a = Pi, Pi = null, a;
  0 !== (xk & 1) && 0 !== a.tag && Hk();
  f2 = a.pendingLanes;
  0 !== (f2 & 1) ? a === zk ? yk++ : (yk = 0, zk = a) : yk = 0;
  jg();
  return null;
}
function Hk() {
  if (null !== wk) {
    var a = Dc(xk), b = ok.transition, c = C;
    try {
      ok.transition = null;
      C = 16 > a ? 16 : a;
      if (null === wk) var d = false;
      else {
        a = wk;
        wk = null;
        xk = 0;
        if (0 !== (K & 6)) throw Error(p(331));
        var e = K;
        K |= 4;
        for (V = a.current; null !== V; ) {
          var f2 = V, g = f2.child;
          if (0 !== (V.flags & 16)) {
            var h = f2.deletions;
            if (null !== h) {
              for (var k2 = 0; k2 < h.length; k2++) {
                var l2 = h[k2];
                for (V = l2; null !== V; ) {
                  var m2 = V;
                  switch (m2.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Pj(8, m2, f2);
                  }
                  var q2 = m2.child;
                  if (null !== q2) q2.return = m2, V = q2;
                  else for (; null !== V; ) {
                    m2 = V;
                    var r2 = m2.sibling, y2 = m2.return;
                    Sj(m2);
                    if (m2 === l2) {
                      V = null;
                      break;
                    }
                    if (null !== r2) {
                      r2.return = y2;
                      V = r2;
                      break;
                    }
                    V = y2;
                  }
                }
              }
              var n2 = f2.alternate;
              if (null !== n2) {
                var t2 = n2.child;
                if (null !== t2) {
                  n2.child = null;
                  do {
                    var J2 = t2.sibling;
                    t2.sibling = null;
                    t2 = J2;
                  } while (null !== t2);
                }
              }
              V = f2;
            }
          }
          if (0 !== (f2.subtreeFlags & 2064) && null !== g) g.return = f2, V = g;
          else b: for (; null !== V; ) {
            f2 = V;
            if (0 !== (f2.flags & 2048)) switch (f2.tag) {
              case 0:
              case 11:
              case 15:
                Pj(9, f2, f2.return);
            }
            var x2 = f2.sibling;
            if (null !== x2) {
              x2.return = f2.return;
              V = x2;
              break b;
            }
            V = f2.return;
          }
        }
        var w2 = a.current;
        for (V = w2; null !== V; ) {
          g = V;
          var u2 = g.child;
          if (0 !== (g.subtreeFlags & 2064) && null !== u2) u2.return = g, V = u2;
          else b: for (g = w2; null !== V; ) {
            h = V;
            if (0 !== (h.flags & 2048)) try {
              switch (h.tag) {
                case 0:
                case 11:
                case 15:
                  Qj(9, h);
              }
            } catch (na) {
              W(h, h.return, na);
            }
            if (h === g) {
              V = null;
              break b;
            }
            var F2 = h.sibling;
            if (null !== F2) {
              F2.return = h.return;
              V = F2;
              break b;
            }
            V = h.return;
          }
        }
        K = e;
        jg();
        if (lc && "function" === typeof lc.onPostCommitFiberRoot) try {
          lc.onPostCommitFiberRoot(kc, a);
        } catch (na) {
        }
        d = true;
      }
      return d;
    } finally {
      C = c, ok.transition = b;
    }
  }
  return false;
}
function Xk(a, b, c) {
  b = Ji(c, b);
  b = Ni(a, b, 1);
  a = nh(a, b, 1);
  b = R();
  null !== a && (Ac(a, 1, b), Dk(a, b));
}
function W(a, b, c) {
  if (3 === a.tag) Xk(a, a, c);
  else for (; null !== b; ) {
    if (3 === b.tag) {
      Xk(b, a, c);
      break;
    } else if (1 === b.tag) {
      var d = b.stateNode;
      if ("function" === typeof b.type.getDerivedStateFromError || "function" === typeof d.componentDidCatch && (null === Ri || !Ri.has(d))) {
        a = Ji(c, a);
        a = Qi(b, a, 1);
        b = nh(b, a, 1);
        a = R();
        null !== b && (Ac(b, 1, a), Dk(b, a));
        break;
      }
    }
    b = b.return;
  }
}
function Ti(a, b, c) {
  var d = a.pingCache;
  null !== d && d.delete(b);
  b = R();
  a.pingedLanes |= a.suspendedLanes & c;
  Q === a && (Z & c) === c && (4 === T || 3 === T && (Z & 130023424) === Z && 500 > B() - fk ? Kk(a, 0) : rk |= c);
  Dk(a, b);
}
function Yk(a, b) {
  0 === b && (0 === (a.mode & 1) ? b = 1 : (b = sc, sc <<= 1, 0 === (sc & 130023424) && (sc = 4194304)));
  var c = R();
  a = ih(a, b);
  null !== a && (Ac(a, b, c), Dk(a, c));
}
function uj(a) {
  var b = a.memoizedState, c = 0;
  null !== b && (c = b.retryLane);
  Yk(a, c);
}
function bk(a, b) {
  var c = 0;
  switch (a.tag) {
    case 13:
      var d = a.stateNode;
      var e = a.memoizedState;
      null !== e && (c = e.retryLane);
      break;
    case 19:
      d = a.stateNode;
      break;
    default:
      throw Error(p(314));
  }
  null !== d && d.delete(b);
  Yk(a, c);
}
var Vk;
Vk = function(a, b, c) {
  if (null !== a) if (a.memoizedProps !== b.pendingProps || Wf.current) dh = true;
  else {
    if (0 === (a.lanes & c) && 0 === (b.flags & 128)) return dh = false, yj(a, b, c);
    dh = 0 !== (a.flags & 131072) ? true : false;
  }
  else dh = false, I && 0 !== (b.flags & 1048576) && ug(b, ng, b.index);
  b.lanes = 0;
  switch (b.tag) {
    case 2:
      var d = b.type;
      ij(a, b);
      a = b.pendingProps;
      var e = Yf(b, H.current);
      ch(b, c);
      e = Nh(null, b, d, a, e, c);
      var f2 = Sh();
      b.flags |= 1;
      "object" === typeof e && null !== e && "function" === typeof e.render && void 0 === e.$$typeof ? (b.tag = 1, b.memoizedState = null, b.updateQueue = null, Zf(d) ? (f2 = true, cg(b)) : f2 = false, b.memoizedState = null !== e.state && void 0 !== e.state ? e.state : null, kh(b), e.updater = Ei, b.stateNode = e, e._reactInternals = b, Ii(b, d, a, c), b = jj(null, b, d, true, f2, c)) : (b.tag = 0, I && f2 && vg(b), Xi(null, b, e, c), b = b.child);
      return b;
    case 16:
      d = b.elementType;
      a: {
        ij(a, b);
        a = b.pendingProps;
        e = d._init;
        d = e(d._payload);
        b.type = d;
        e = b.tag = Zk(d);
        a = Ci(d, a);
        switch (e) {
          case 0:
            b = cj(null, b, d, a, c);
            break a;
          case 1:
            b = hj(null, b, d, a, c);
            break a;
          case 11:
            b = Yi(null, b, d, a, c);
            break a;
          case 14:
            b = $i(null, b, d, Ci(d.type, a), c);
            break a;
        }
        throw Error(p(
          306,
          d,
          ""
        ));
      }
      return b;
    case 0:
      return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), cj(a, b, d, e, c);
    case 1:
      return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), hj(a, b, d, e, c);
    case 3:
      a: {
        kj(b);
        if (null === a) throw Error(p(387));
        d = b.pendingProps;
        f2 = b.memoizedState;
        e = f2.element;
        lh(a, b);
        qh(b, d, null, c);
        var g = b.memoizedState;
        d = g.element;
        if (f2.isDehydrated) if (f2 = { element: d, isDehydrated: false, cache: g.cache, pendingSuspenseBoundaries: g.pendingSuspenseBoundaries, transitions: g.transitions }, b.updateQueue.baseState = f2, b.memoizedState = f2, b.flags & 256) {
          e = Ji(Error(p(423)), b);
          b = lj(a, b, d, c, e);
          break a;
        } else if (d !== e) {
          e = Ji(Error(p(424)), b);
          b = lj(a, b, d, c, e);
          break a;
        } else for (yg = Lf(b.stateNode.containerInfo.firstChild), xg = b, I = true, zg = null, c = Vg(b, null, d, c), b.child = c; c; ) c.flags = c.flags & -3 | 4096, c = c.sibling;
        else {
          Ig();
          if (d === e) {
            b = Zi(a, b, c);
            break a;
          }
          Xi(a, b, d, c);
        }
        b = b.child;
      }
      return b;
    case 5:
      return Ah(b), null === a && Eg(b), d = b.type, e = b.pendingProps, f2 = null !== a ? a.memoizedProps : null, g = e.children, Ef(d, e) ? g = null : null !== f2 && Ef(d, f2) && (b.flags |= 32), gj(a, b), Xi(a, b, g, c), b.child;
    case 6:
      return null === a && Eg(b), null;
    case 13:
      return oj(a, b, c);
    case 4:
      return yh(b, b.stateNode.containerInfo), d = b.pendingProps, null === a ? b.child = Ug(b, null, d, c) : Xi(a, b, d, c), b.child;
    case 11:
      return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), Yi(a, b, d, e, c);
    case 7:
      return Xi(a, b, b.pendingProps, c), b.child;
    case 8:
      return Xi(a, b, b.pendingProps.children, c), b.child;
    case 12:
      return Xi(a, b, b.pendingProps.children, c), b.child;
    case 10:
      a: {
        d = b.type._context;
        e = b.pendingProps;
        f2 = b.memoizedProps;
        g = e.value;
        G(Wg, d._currentValue);
        d._currentValue = g;
        if (null !== f2) if (He(f2.value, g)) {
          if (f2.children === e.children && !Wf.current) {
            b = Zi(a, b, c);
            break a;
          }
        } else for (f2 = b.child, null !== f2 && (f2.return = b); null !== f2; ) {
          var h = f2.dependencies;
          if (null !== h) {
            g = f2.child;
            for (var k2 = h.firstContext; null !== k2; ) {
              if (k2.context === d) {
                if (1 === f2.tag) {
                  k2 = mh(-1, c & -c);
                  k2.tag = 2;
                  var l2 = f2.updateQueue;
                  if (null !== l2) {
                    l2 = l2.shared;
                    var m2 = l2.pending;
                    null === m2 ? k2.next = k2 : (k2.next = m2.next, m2.next = k2);
                    l2.pending = k2;
                  }
                }
                f2.lanes |= c;
                k2 = f2.alternate;
                null !== k2 && (k2.lanes |= c);
                bh(
                  f2.return,
                  c,
                  b
                );
                h.lanes |= c;
                break;
              }
              k2 = k2.next;
            }
          } else if (10 === f2.tag) g = f2.type === b.type ? null : f2.child;
          else if (18 === f2.tag) {
            g = f2.return;
            if (null === g) throw Error(p(341));
            g.lanes |= c;
            h = g.alternate;
            null !== h && (h.lanes |= c);
            bh(g, c, b);
            g = f2.sibling;
          } else g = f2.child;
          if (null !== g) g.return = f2;
          else for (g = f2; null !== g; ) {
            if (g === b) {
              g = null;
              break;
            }
            f2 = g.sibling;
            if (null !== f2) {
              f2.return = g.return;
              g = f2;
              break;
            }
            g = g.return;
          }
          f2 = g;
        }
        Xi(a, b, e.children, c);
        b = b.child;
      }
      return b;
    case 9:
      return e = b.type, d = b.pendingProps.children, ch(b, c), e = eh(e), d = d(e), b.flags |= 1, Xi(a, b, d, c), b.child;
    case 14:
      return d = b.type, e = Ci(d, b.pendingProps), e = Ci(d.type, e), $i(a, b, d, e, c);
    case 15:
      return bj(a, b, b.type, b.pendingProps, c);
    case 17:
      return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), ij(a, b), b.tag = 1, Zf(d) ? (a = true, cg(b)) : a = false, ch(b, c), Gi(b, d, e), Ii(b, d, e, c), jj(null, b, d, true, a, c);
    case 19:
      return xj(a, b, c);
    case 22:
      return dj(a, b, c);
  }
  throw Error(p(156, b.tag));
};
function Fk(a, b) {
  return ac(a, b);
}
function $k(a, b, c, d) {
  this.tag = a;
  this.key = c;
  this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
  this.index = 0;
  this.ref = null;
  this.pendingProps = b;
  this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
  this.mode = d;
  this.subtreeFlags = this.flags = 0;
  this.deletions = null;
  this.childLanes = this.lanes = 0;
  this.alternate = null;
}
function Bg(a, b, c, d) {
  return new $k(a, b, c, d);
}
function aj(a) {
  a = a.prototype;
  return !(!a || !a.isReactComponent);
}
function Zk(a) {
  if ("function" === typeof a) return aj(a) ? 1 : 0;
  if (void 0 !== a && null !== a) {
    a = a.$$typeof;
    if (a === Da) return 11;
    if (a === Ga) return 14;
  }
  return 2;
}
function Pg(a, b) {
  var c = a.alternate;
  null === c ? (c = Bg(a.tag, b, a.key, a.mode), c.elementType = a.elementType, c.type = a.type, c.stateNode = a.stateNode, c.alternate = a, a.alternate = c) : (c.pendingProps = b, c.type = a.type, c.flags = 0, c.subtreeFlags = 0, c.deletions = null);
  c.flags = a.flags & 14680064;
  c.childLanes = a.childLanes;
  c.lanes = a.lanes;
  c.child = a.child;
  c.memoizedProps = a.memoizedProps;
  c.memoizedState = a.memoizedState;
  c.updateQueue = a.updateQueue;
  b = a.dependencies;
  c.dependencies = null === b ? null : { lanes: b.lanes, firstContext: b.firstContext };
  c.sibling = a.sibling;
  c.index = a.index;
  c.ref = a.ref;
  return c;
}
function Rg(a, b, c, d, e, f2) {
  var g = 2;
  d = a;
  if ("function" === typeof a) aj(a) && (g = 1);
  else if ("string" === typeof a) g = 5;
  else a: switch (a) {
    case ya:
      return Tg(c.children, e, f2, b);
    case za:
      g = 8;
      e |= 8;
      break;
    case Aa:
      return a = Bg(12, c, b, e | 2), a.elementType = Aa, a.lanes = f2, a;
    case Ea:
      return a = Bg(13, c, b, e), a.elementType = Ea, a.lanes = f2, a;
    case Fa:
      return a = Bg(19, c, b, e), a.elementType = Fa, a.lanes = f2, a;
    case Ia:
      return pj(c, e, f2, b);
    default:
      if ("object" === typeof a && null !== a) switch (a.$$typeof) {
        case Ba:
          g = 10;
          break a;
        case Ca:
          g = 9;
          break a;
        case Da:
          g = 11;
          break a;
        case Ga:
          g = 14;
          break a;
        case Ha:
          g = 16;
          d = null;
          break a;
      }
      throw Error(p(130, null == a ? a : typeof a, ""));
  }
  b = Bg(g, c, b, e);
  b.elementType = a;
  b.type = d;
  b.lanes = f2;
  return b;
}
function Tg(a, b, c, d) {
  a = Bg(7, a, d, b);
  a.lanes = c;
  return a;
}
function pj(a, b, c, d) {
  a = Bg(22, a, d, b);
  a.elementType = Ia;
  a.lanes = c;
  a.stateNode = { isHidden: false };
  return a;
}
function Qg(a, b, c) {
  a = Bg(6, a, null, b);
  a.lanes = c;
  return a;
}
function Sg(a, b, c) {
  b = Bg(4, null !== a.children ? a.children : [], a.key, b);
  b.lanes = c;
  b.stateNode = { containerInfo: a.containerInfo, pendingChildren: null, implementation: a.implementation };
  return b;
}
function al(a, b, c, d, e) {
  this.tag = b;
  this.containerInfo = a;
  this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
  this.timeoutHandle = -1;
  this.callbackNode = this.pendingContext = this.context = null;
  this.callbackPriority = 0;
  this.eventTimes = zc(0);
  this.expirationTimes = zc(-1);
  this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
  this.entanglements = zc(0);
  this.identifierPrefix = d;
  this.onRecoverableError = e;
  this.mutableSourceEagerHydrationData = null;
}
function bl(a, b, c, d, e, f2, g, h, k2) {
  a = new al(a, b, c, h, k2);
  1 === b ? (b = 1, true === f2 && (b |= 8)) : b = 0;
  f2 = Bg(3, null, null, b);
  a.current = f2;
  f2.stateNode = a;
  f2.memoizedState = { element: d, isDehydrated: c, cache: null, transitions: null, pendingSuspenseBoundaries: null };
  kh(f2);
  return a;
}
function cl(a, b, c) {
  var d = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
  return { $$typeof: wa, key: null == d ? null : "" + d, children: a, containerInfo: b, implementation: c };
}
function dl(a) {
  if (!a) return Vf;
  a = a._reactInternals;
  a: {
    if (Vb(a) !== a || 1 !== a.tag) throw Error(p(170));
    var b = a;
    do {
      switch (b.tag) {
        case 3:
          b = b.stateNode.context;
          break a;
        case 1:
          if (Zf(b.type)) {
            b = b.stateNode.__reactInternalMemoizedMergedChildContext;
            break a;
          }
      }
      b = b.return;
    } while (null !== b);
    throw Error(p(171));
  }
  if (1 === a.tag) {
    var c = a.type;
    if (Zf(c)) return bg(a, c, b);
  }
  return b;
}
function el(a, b, c, d, e, f2, g, h, k2) {
  a = bl(c, d, true, a, e, f2, g, h, k2);
  a.context = dl(null);
  c = a.current;
  d = R();
  e = yi(c);
  f2 = mh(d, e);
  f2.callback = void 0 !== b && null !== b ? b : null;
  nh(c, f2, e);
  a.current.lanes = e;
  Ac(a, e, d);
  Dk(a, d);
  return a;
}
function fl(a, b, c, d) {
  var e = b.current, f2 = R(), g = yi(e);
  c = dl(c);
  null === b.context ? b.context = c : b.pendingContext = c;
  b = mh(f2, g);
  b.payload = { element: a };
  d = void 0 === d ? null : d;
  null !== d && (b.callback = d);
  a = nh(e, b, g);
  null !== a && (gi(a, e, g, f2), oh(a, e, g));
  return g;
}
function gl(a) {
  a = a.current;
  if (!a.child) return null;
  switch (a.child.tag) {
    case 5:
      return a.child.stateNode;
    default:
      return a.child.stateNode;
  }
}
function hl(a, b) {
  a = a.memoizedState;
  if (null !== a && null !== a.dehydrated) {
    var c = a.retryLane;
    a.retryLane = 0 !== c && c < b ? c : b;
  }
}
function il(a, b) {
  hl(a, b);
  (a = a.alternate) && hl(a, b);
}
function jl() {
  return null;
}
var kl = "function" === typeof reportError ? reportError : function(a) {
  console.error(a);
};
function ll(a) {
  this._internalRoot = a;
}
ml.prototype.render = ll.prototype.render = function(a) {
  var b = this._internalRoot;
  if (null === b) throw Error(p(409));
  fl(a, b, null, null);
};
ml.prototype.unmount = ll.prototype.unmount = function() {
  var a = this._internalRoot;
  if (null !== a) {
    this._internalRoot = null;
    var b = a.containerInfo;
    Rk(function() {
      fl(null, a, null, null);
    });
    b[uf] = null;
  }
};
function ml(a) {
  this._internalRoot = a;
}
ml.prototype.unstable_scheduleHydration = function(a) {
  if (a) {
    var b = Hc();
    a = { blockedOn: null, target: a, priority: b };
    for (var c = 0; c < Qc.length && 0 !== b && b < Qc[c].priority; c++) ;
    Qc.splice(c, 0, a);
    0 === c && Vc(a);
  }
};
function nl(a) {
  return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType);
}
function ol(a) {
  return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType && (8 !== a.nodeType || " react-mount-point-unstable " !== a.nodeValue));
}
function pl() {
}
function ql(a, b, c, d, e) {
  if (e) {
    if ("function" === typeof d) {
      var f2 = d;
      d = function() {
        var a2 = gl(g);
        f2.call(a2);
      };
    }
    var g = el(b, d, a, 0, null, false, false, "", pl);
    a._reactRootContainer = g;
    a[uf] = g.current;
    sf(8 === a.nodeType ? a.parentNode : a);
    Rk();
    return g;
  }
  for (; e = a.lastChild; ) a.removeChild(e);
  if ("function" === typeof d) {
    var h = d;
    d = function() {
      var a2 = gl(k2);
      h.call(a2);
    };
  }
  var k2 = bl(a, 0, false, null, null, false, false, "", pl);
  a._reactRootContainer = k2;
  a[uf] = k2.current;
  sf(8 === a.nodeType ? a.parentNode : a);
  Rk(function() {
    fl(b, k2, c, d);
  });
  return k2;
}
function rl(a, b, c, d, e) {
  var f2 = c._reactRootContainer;
  if (f2) {
    var g = f2;
    if ("function" === typeof e) {
      var h = e;
      e = function() {
        var a2 = gl(g);
        h.call(a2);
      };
    }
    fl(b, g, a, e);
  } else g = ql(c, b, a, e, d);
  return gl(g);
}
Ec = function(a) {
  switch (a.tag) {
    case 3:
      var b = a.stateNode;
      if (b.current.memoizedState.isDehydrated) {
        var c = tc(b.pendingLanes);
        0 !== c && (Cc(b, c | 1), Dk(b, B()), 0 === (K & 6) && (Gj = B() + 500, jg()));
      }
      break;
    case 13:
      Rk(function() {
        var b2 = ih(a, 1);
        if (null !== b2) {
          var c2 = R();
          gi(b2, a, 1, c2);
        }
      }), il(a, 1);
  }
};
Fc = function(a) {
  if (13 === a.tag) {
    var b = ih(a, 134217728);
    if (null !== b) {
      var c = R();
      gi(b, a, 134217728, c);
    }
    il(a, 134217728);
  }
};
Gc = function(a) {
  if (13 === a.tag) {
    var b = yi(a), c = ih(a, b);
    if (null !== c) {
      var d = R();
      gi(c, a, b, d);
    }
    il(a, b);
  }
};
Hc = function() {
  return C;
};
Ic = function(a, b) {
  var c = C;
  try {
    return C = a, b();
  } finally {
    C = c;
  }
};
yb = function(a, b, c) {
  switch (b) {
    case "input":
      bb(a, c);
      b = c.name;
      if ("radio" === c.type && null != b) {
        for (c = a; c.parentNode; ) c = c.parentNode;
        c = c.querySelectorAll("input[name=" + JSON.stringify("" + b) + '][type="radio"]');
        for (b = 0; b < c.length; b++) {
          var d = c[b];
          if (d !== a && d.form === a.form) {
            var e = Db(d);
            if (!e) throw Error(p(90));
            Wa(d);
            bb(d, e);
          }
        }
      }
      break;
    case "textarea":
      ib(a, c);
      break;
    case "select":
      b = c.value, null != b && fb(a, !!c.multiple, b, false);
  }
};
Gb = Qk;
Hb = Rk;
var sl = { usingClientEntryPoint: false, Events: [Cb, ue, Db, Eb, Fb, Qk] }, tl = { findFiberByHostInstance: Wc, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" };
var ul = { bundleType: tl.bundleType, version: tl.version, rendererPackageName: tl.rendererPackageName, rendererConfig: tl.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ua.ReactCurrentDispatcher, findHostInstanceByFiber: function(a) {
  a = Zb(a);
  return null === a ? null : a.stateNode;
}, findFiberByHostInstance: tl.findFiberByHostInstance || jl, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
  var vl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!vl.isDisabled && vl.supportsFiber) try {
    kc = vl.inject(ul), lc = vl;
  } catch (a) {
  }
}
reactDom_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = sl;
reactDom_production_min.createPortal = function(a, b) {
  var c = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
  if (!nl(b)) throw Error(p(200));
  return cl(a, b, null, c);
};
reactDom_production_min.createRoot = function(a, b) {
  if (!nl(a)) throw Error(p(299));
  var c = false, d = "", e = kl;
  null !== b && void 0 !== b && (true === b.unstable_strictMode && (c = true), void 0 !== b.identifierPrefix && (d = b.identifierPrefix), void 0 !== b.onRecoverableError && (e = b.onRecoverableError));
  b = bl(a, 1, false, null, null, c, false, d, e);
  a[uf] = b.current;
  sf(8 === a.nodeType ? a.parentNode : a);
  return new ll(b);
};
reactDom_production_min.findDOMNode = function(a) {
  if (null == a) return null;
  if (1 === a.nodeType) return a;
  var b = a._reactInternals;
  if (void 0 === b) {
    if ("function" === typeof a.render) throw Error(p(188));
    a = Object.keys(a).join(",");
    throw Error(p(268, a));
  }
  a = Zb(b);
  a = null === a ? null : a.stateNode;
  return a;
};
reactDom_production_min.flushSync = function(a) {
  return Rk(a);
};
reactDom_production_min.hydrate = function(a, b, c) {
  if (!ol(b)) throw Error(p(200));
  return rl(null, a, b, true, c);
};
reactDom_production_min.hydrateRoot = function(a, b, c) {
  if (!nl(a)) throw Error(p(405));
  var d = null != c && c.hydratedSources || null, e = false, f2 = "", g = kl;
  null !== c && void 0 !== c && (true === c.unstable_strictMode && (e = true), void 0 !== c.identifierPrefix && (f2 = c.identifierPrefix), void 0 !== c.onRecoverableError && (g = c.onRecoverableError));
  b = el(b, null, a, 1, null != c ? c : null, e, false, f2, g);
  a[uf] = b.current;
  sf(a);
  if (d) for (a = 0; a < d.length; a++) c = d[a], e = c._getVersion, e = e(c._source), null == b.mutableSourceEagerHydrationData ? b.mutableSourceEagerHydrationData = [c, e] : b.mutableSourceEagerHydrationData.push(
    c,
    e
  );
  return new ml(b);
};
reactDom_production_min.render = function(a, b, c) {
  if (!ol(b)) throw Error(p(200));
  return rl(null, a, b, false, c);
};
reactDom_production_min.unmountComponentAtNode = function(a) {
  if (!ol(a)) throw Error(p(40));
  return a._reactRootContainer ? (Rk(function() {
    rl(null, null, a, false, function() {
      a._reactRootContainer = null;
      a[uf] = null;
    });
  }), true) : false;
};
reactDom_production_min.unstable_batchedUpdates = Qk;
reactDom_production_min.unstable_renderSubtreeIntoContainer = function(a, b, c, d) {
  if (!ol(c)) throw Error(p(200));
  if (null == a || void 0 === a._reactInternals) throw Error(p(38));
  return rl(a, b, c, false, d);
};
reactDom_production_min.version = "18.3.1-next-f1338f8080-20240426";
function checkDCE() {
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
    return;
  }
  try {
    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
  } catch (err) {
    console.error(err);
  }
}
{
  checkDCE();
  reactDom.exports = reactDom_production_min;
}
var reactDomExports = reactDom.exports;
var m = reactDomExports;
{
  client.createRoot = m.createRoot;
  client.hydrateRoot = m.hydrateRoot;
}
function normalizeBase(value) {
  return value.replace(/\/$/, "");
}
function collectApiBases() {
  var _a;
  const bases = [];
  const envBase = "https://adultapp-production.up.railway.app/api" == null ? void 0 : "https://adultapp-production.up.railway.app/api".trim();
  if (envBase) bases.push(normalizeBase(envBase));
  if (typeof window !== "undefined") {
    const savedBase = (_a = window.localStorage.getItem("adultapp_active_api_base")) == null ? void 0 : _a.trim();
    if (savedBase) bases.push(normalizeBase(savedBase));
    const { hostname, origin } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      bases.push("http://localhost:8000/api");
      bases.push("http://127.0.0.1:8000/api");
    } else if (hostname.endsWith("pages.dev")) {
      bases.push("https://adultapp-production.up.railway.app/api");
    } else if (hostname.endsWith("up.railway.app")) {
      bases.push(`${origin}/api`);
    }
  }
  bases.push("https://adultapp-production.up.railway.app/api");
  return [...new Set(bases.filter(Boolean))];
}
const API_BASES = collectApiBases();
const DEFAULT_TIMEOUT_MS = 1e4;
let activeApiBase = API_BASES[0];
let accessToken = localStorage.getItem("adultapp_access_token") ?? "";
let refreshToken = localStorage.getItem("adultapp_refresh_token") ?? "";
let refreshPromise = null;
function timeoutForPath(path) {
  if (path.startsWith("/auth/login")) return 12e3;
  if (path.startsWith("/auth/me")) return 8e3;
  if (path.startsWith("/auth/refresh")) return 8e3;
  return DEFAULT_TIMEOUT_MS;
}
function saveActiveApiBase(base) {
  activeApiBase = base;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("adultapp_active_api_base", base);
  }
}
function shouldSkipRefresh(path) {
  return path.startsWith("/auth/login") || path.startsWith("/auth/refresh") || path.startsWith("/auth/logout");
}
async function refreshAccessToken() {
  if (!refreshToken) return false;
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    for (const base of [activeApiBase, ...API_BASES.filter((item) => item !== activeApiBase)]) {
      try {
        const response = await requestOnce(
          base,
          "/auth/refresh",
          {
            method: "POST",
            body: JSON.stringify({ refresh_token: refreshToken })
          },
          false
        );
        if (response.access_token) setAuthToken(response.access_token);
        if (response.refresh_token) setRefreshToken(response.refresh_token);
        saveActiveApiBase(base);
        return true;
      } catch {
      }
    }
    clearTokens();
    return false;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}
function getApiBase() {
  return activeApiBase;
}
function hasAuthToken() {
  return Boolean(accessToken);
}
function setAuthToken(token) {
  accessToken = token;
  if (token) localStorage.setItem("adultapp_access_token", token);
  else localStorage.removeItem("adultapp_access_token");
}
function setRefreshToken(token) {
  refreshToken = token;
  if (token) localStorage.setItem("adultapp_refresh_token", token);
  else localStorage.removeItem("adultapp_refresh_token");
}
function getRefreshToken() {
  return refreshToken;
}
function clearTokens() {
  setAuthToken("");
  setRefreshToken("");
}
async function ensureAuthSession() {
  if (accessToken) return true;
  if (!refreshToken) return false;
  return refreshAccessToken();
}
async function requestOnce(base, path, init, allowRefresh = true) {
  const headers = new Headers((init == null ? void 0 : init.headers) ?? {});
  const isFormData = typeof FormData !== "undefined" && (init == null ? void 0 : init.body) instanceof FormData;
  if (!headers.has("Content-Type") && (init == null ? void 0 : init.body) && !isFormData) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const controller = new AbortController();
  const timeoutMs = timeoutForPath(path);
  const timeout = window.setTimeout(() => controller.abort(new DOMException(`timeout after ${timeoutMs}ms`, "TimeoutError")), timeoutMs);
  try {
    const response = await fetch(`${base}${path}`, { ...init, headers, signal: controller.signal });
    if (!response.ok) {
      const text = await response.text();
      if (response.status === 401 && allowRefresh && refreshToken && !shouldSkipRefresh(path)) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return requestOnce(base, path, init, false);
        }
      }
      if (response.status === 401 && shouldSkipRefresh(path)) {
        clearTokens();
      }
      throw new Error(`${(init == null ? void 0 : init.method) ?? "GET"} ${path} failed: ${response.status} ${text}`);
    }
    saveActiveApiBase(base);
    return await response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`${(init == null ? void 0 : init.method) ?? "GET"} ${path} timeout`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
async function request(path, init) {
  let lastError = null;
  for (const base of [activeApiBase, ...API_BASES.filter((item) => item !== activeApiBase)]) {
    try {
      return await requestOnce(base, path, init);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`${(init == null ? void 0 : init.method) ?? "GET"} ${path} failed`);
}
function getJson(path) {
  return request(path);
}
function postJson(path, payload) {
  return request(path, { method: "POST", body: JSON.stringify(payload) });
}
const HOME_FEED_BATCH_SIZE = 5;
const HOME_FEED_PULL_MAX = 78;
const HOME_FEED_PULL_TRIGGER = 54;
const HOME_FEED_REFRESH_BATCH_SIZE = 3;
const CHAT_LIST_BASE_ROWS = 10;
const HOME_FEED_STATE_KEY = "adultapp_home_feed_state";
const HOME_FEED_RESET_MS = 30 * 60 * 1e3;
function readHomeFeedPersistedState() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(HOME_FEED_STATE_KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}
function isHomeFeedStateExpired(state) {
  return Boolean(state.lastInactiveAt && Date.now() - state.lastInactiveAt >= HOME_FEED_RESET_MS);
}
function getFeedComposeModeMeta(mode) {
  switch (mode) {
    case "사진피드":
      return {
        title: "사진피드",
        description: "사진 중심 피드를 등록합니다.",
        accept: "image/*",
        attachLabel: "사진 첨부",
        helper: "최대 1개 첨부 · 사진 전용 등록 · 권장 JPG / PNG / WEBP"
      };
    case "쇼츠게시":
      return {
        title: "쇼츠게시",
        description: "짧은 세로형 영상을 등록합니다.",
        accept: "video/*",
        attachLabel: "쇼츠 영상 첨부",
        helper: "최대 1개 첨부 · 쇼츠 영상은 최대 20초 / 30MB · 권장 MP4(H.264) 또는 WEBM"
      };
    default:
      return {
        title: "피드게시",
        description: "일반 피드를 등록합니다.",
        accept: "image/*,video/*",
        attachLabel: "사진/영상 첨부",
        helper: "최대 1개 첨부 · 영상은 최대 20초 / 30MB · 권장 MP4(H.264) 또는 WEBM"
      };
  }
}
const mobileTabs = ["홈", "쇼핑", "소통", "채팅", "프로필"];
const legacyMenu = ["운영현황", "주문관리", "보안", "앱심사", "포럼 분리 정책", "배포가이드"];
const homeTabs = ["피드", "쇼츠", "보관함"];
const communityTabs = ["커뮤", "포럼", "후기", "이벤트"];
const chatTabs = ["채팅", "질문"];
const chatTabLabels = { "채팅": "채팅", "질문": "질문" };
const profileTabs = ["내정보"];
const settingsCategories = ["일반", "계정", "알림", "보안", "배포", "운영", "관리자모드", "DB관리", "신고", "채팅", "기타", "HTML요소"];
const randomRoomCategories = ["전체", "관계역할/고민", "동의/경계설정", "안전수칙", "일상/취미", "자유대화"];
const forumBoardCategories = ["자유대화", "일상/취미", "고민", "관계/역할", "안전수칙", "동의/합의/계약"];
const chatCategories = ["전체", "즐겨찾기", "개인", "단체", "쇼핑"];
const adminModeTabs = ["승인", "정산", "DB관리", "신고", "채팅", "기타"];
const consentVersionMap = { terms: "terms_v1", privacy: "privacy_v1", adultNotice: "adult_notice_v1", identityNotice: "identity_notice_v1", marketing: "marketing_v1", profileOptional: "profile_optional_v1" };
const requiredConsentKeys = ["terms", "privacy", "adultNotice", "identityNotice"];
const profileGenderOptions = ["", "남성", "여성", "기타", "응답 안 함"];
const profileAgeBandOptions = ["", "20대", "30대", "40대", "50대", "60대+"];
const profileRegionOptions = ["", "서울", "경기", "인천", "강원", "충청", "전라", "경상", "제주"];
const interestCategoryOptions = ["뷰티", "케어", "건강", "커뮤니티", "브랜드", "이벤트"];
const defaultHeaderFavorites = {
  "홈": ["피드", "쇼츠", "보관함"],
  "쇼핑": ["홈", "주문", "바구니"],
  "소통": ["커뮤", "포럼", "후기"],
  "채팅": ["채팅", "질문"],
  "프로필": ["내정보"]
};
const defaultSignupConsents = { terms: false, privacy: false, adultNotice: false, identityNotice: false, marketing: false, profileOptional: false };
const defaultSignupForm = { email: "", password: "", displayName: "", loginMethod: "이메일" };
const defaultDemoProfile = { gender: "", ageBand: "", regionCode: "", interests: [], marketingOptIn: false, displayName: "", bio: "", hashtags: "", avatarUrl: "" };
const defaultSellerVerification = {
  companyName: "",
  representativeName: "",
  businessNumber: "",
  ecommerceNumber: "",
  businessAddress: "",
  csContact: "",
  returnAddress: "",
  youthProtectionOfficer: "",
  businessDocumentUrl: "",
  settlementBank: "",
  settlementAccountNumber: "",
  settlementAccountHolder: "",
  handledCategories: "",
  status: "draft"
};
const desktopBusinessViewMeta = {
  product_crud: { title: "상품 조회/등록/수정/삭제", description: "판매자센터 기본형 CRUD 화면입니다.", fallbackTab: "쇼핑", section: "상품" },
  orders: { title: "주문 관리", description: "주문 접수/결제 상태/진행 흐름을 확인합니다.", fallbackTab: "쇼핑", section: "상품" },
  shipping: { title: "배송 관리", description: "출고와 배송 처리 대상을 점검합니다.", fallbackTab: "쇼핑", section: "상품" },
  returns: { title: "환불/취소/반품/교환", description: "CS 처리 대상 주문을 모아봅니다.", fallbackTab: "쇼핑", section: "상품" },
  settlement: { title: "정산", description: "정산 예정, 수수료, 세금성 항목을 확인합니다.", fallbackTab: "쇼핑", section: "상품" },
  reviews: { title: "후기/상품평", description: "상품 리뷰와 평가 지표를 확인합니다.", fallbackTab: "소통", section: "상품" },
  chat: { title: "채팅", description: "최근 대화 목록과 상담 흐름을 확인합니다.", fallbackTab: "채팅", section: "메시지" },
  user_notifications: { title: "사용자 알림", description: "사용자에게 노출되는 알림을 관리합니다.", fallbackTab: "프로필", section: "메시지" },
  auto_messages: { title: "자동발송멘트", description: "주문/문의/안내 자동 문구를 확인합니다.", fallbackTab: "채팅", section: "메시지" },
  ops_alerts: { title: "운영 알림", description: "운영자용 상태 알림과 점검 메시지를 봅니다.", fallbackTab: "프로필", section: "알림" },
  support: { title: "고객문의", description: "고객센터/문의성 게시글 흐름을 모아봅니다.", fallbackTab: "소통", section: "고객센터" },
  ads_app: { title: "광고 · 앱", description: "앱 내부 광고 슬롯과 배너 운영 현황입니다.", fallbackTab: "홈", section: "광고" },
  ads_message: { title: "광고 · 메세지", description: "메세지형 광고 발송 대상을 관리합니다.", fallbackTab: "채팅", section: "광고" },
  ads_notice: { title: "광고 · 알림", description: "푸시/알림형 광고 공지를 관리합니다.", fallbackTab: "프로필", section: "광고" }
};
const desktopBusinessMenuSections = [
  { title: "상품", items: [
    { label: "조회/등록/수정/삭제", viewId: "product_crud", fallbackTab: "쇼핑", summary: "상품 기본 CRUD" },
    { label: "주문", viewId: "orders", fallbackTab: "쇼핑", summary: "주문 확인 및 상태 관리" },
    { label: "배송", viewId: "shipping", fallbackTab: "쇼핑", summary: "출고/배송 대상 확인" },
    { label: "환불/취소/반품/교환", viewId: "returns", fallbackTab: "쇼핑", summary: "취소/교환 처리" },
    { label: "정산", viewId: "settlement", fallbackTab: "쇼핑", summary: "정산/세금 정보", children: ["매출/순이익", "부가세", "세금계산서"] },
    { label: "후기/상품평", viewId: "reviews", fallbackTab: "소통", summary: "리뷰/평점 확인" }
  ] },
  { title: "메시지", items: [
    { label: "채팅", viewId: "chat", fallbackTab: "채팅", summary: "최근 채팅 및 상담" },
    { label: "사용자 알림", viewId: "user_notifications", fallbackTab: "프로필", summary: "알림 발송 목록" },
    { label: "자동발송멘트", viewId: "auto_messages", fallbackTab: "채팅", summary: "자동 응답/안내 문구" }
  ] },
  { title: "알림", items: [{ label: "운영 알림", viewId: "ops_alerts", fallbackTab: "프로필", summary: "운영 공지/알림" }] },
  { title: "고객센터", items: [{ label: "고객문의", viewId: "support", fallbackTab: "소통", summary: "고객 문의/지원" }] },
  { title: "광고", items: [
    { label: "앱", viewId: "ads_app", fallbackTab: "홈", summary: "앱 배너/슬롯", children: ["배너"] },
    { label: "메세지", viewId: "ads_message", fallbackTab: "채팅", summary: "메세지형 광고" },
    { label: "알림", viewId: "ads_notice", fallbackTab: "프로필", summary: "알림형 광고" }
  ] }
];
function isDesktopBusinessViewId(value) {
  if (!value) return false;
  return Object.prototype.hasOwnProperty.call(desktopBusinessViewMeta, value);
}
function getDesktopPaneSelectionLabel(selection) {
  return selection.mode === "tab" ? selection.tab : desktopBusinessViewMeta[selection.viewId].title;
}
function readDesktopPaneContext() {
  if (typeof window === "undefined") return { embedded: false, slot: null, initialTab: "홈", businessViewId: null };
  const embeddedContext = window.__ADULTAPP_EMBED_CONTEXT__;
  if (embeddedContext && (embeddedContext.desktopPane === "left" || embeddedContext.desktopPane === "right")) {
    return {
      embedded: true,
      slot: embeddedContext.desktopPane,
      initialTab: mobileTabs.includes(embeddedContext.initialTab) ? embeddedContext.initialTab : "홈",
      businessViewId: isDesktopBusinessViewId(embeddedContext.businessViewId ?? null) ? embeddedContext.businessViewId ?? null : null
    };
  }
  const params = new URLSearchParams(window.location.search);
  const desktopPane = params.get("desktopPane");
  const initialTabParam = params.get("initialTab");
  const businessViewIdParam = params.get("businessViewId");
  const initialTab = mobileTabs.includes(initialTabParam) ? initialTabParam : "홈";
  if (desktopPane === "left" || desktopPane === "right") return { embedded: true, slot: desktopPane, initialTab, businessViewId: isDesktopBusinessViewId(businessViewIdParam) ? businessViewIdParam : null };
  return { embedded: false, slot: null, initialTab, businessViewId: null };
}
function buildDesktopPaneFrameUrl(slot, selection) {
  if (typeof window === "undefined") return "";
  const nextUrl = new URL("/index.html", window.location.href);
  nextUrl.hash = "";
  nextUrl.search = "";
  nextUrl.searchParams.set("desktopPane", slot);
  nextUrl.searchParams.set("initialTab", selection.mode === "tab" ? selection.tab : desktopBusinessViewMeta[selection.viewId].fallbackTab);
  nextUrl.searchParams.set("desktopFrameMode", "app");
  nextUrl.searchParams.set("paneKey", selection.mode === "tab" ? `${slot}-${selection.tab}` : `${slot}-${selection.viewId}`);
  if (selection.mode === "business") {
    nextUrl.searchParams.set("businessViewId", selection.viewId);
  }
  const pathWithQuery = `${nextUrl.pathname}${nextUrl.search}`;
  return pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
}
function formatDesktopOrderShortDate(value) {
  const year = String(value.getFullYear()).slice(2);
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}
function formatDesktopOrderIsoDate(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function formatDesktopOrderDateLabelFromOrderNo(orderNo, fallbackIndex = 0) {
  const compact = orderNo.replace(/[^0-9]/g, "").slice(0, 8);
  if (compact.length >= 6) {
    const yy = compact.slice(0, 2);
    const mm = compact.slice(2, 4);
    const dd2 = compact.slice(4, 6);
    return `20${yy}-${mm}-${dd2}`;
  }
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() - fallbackIndex);
  return formatDesktopOrderIsoDate(date);
}
function formatDesktopSellerOrderNoParts(orderedDateIso, sellerId, sellerDailySequence) {
  const compactDate = orderedDateIso.replace(/-/g, "").slice(2);
  const sellerKey = String(Math.max(1, Number(sellerId || 1))).padStart(4, "0").slice(-4);
  const dailySequence = String(Math.max(1, Number(sellerDailySequence || 1))).padStart(3, "0").slice(-3);
  return `${compactDate}${sellerKey}${dailySequence}`;
}
function mapDesktopOrderStatuses(status, index) {
  if (status === "shipped") return { deliveryStatus: "배송중", progressStatus: "배송중" };
  if (status === "delivered") return { deliveryStatus: "배송완료", progressStatus: "배송완료" };
  if (status === "ready_to_ship") return { deliveryStatus: "배송지시", progressStatus: "배송지시" };
  if (status === "preparing") return { deliveryStatus: "상품준비중", progressStatus: "상품준비중" };
  if (status === "seller_direct") return { deliveryStatus: "업체 직접 배송", progressStatus: "배송지시" };
  if (status === "paid") return { deliveryStatus: "결제완료", progressStatus: "주문접수대기" };
  const fallbackCycle = [
    { deliveryStatus: "결제완료", progressStatus: "주문접수대기" },
    { deliveryStatus: "상품준비중", progressStatus: "상품준비중" },
    { deliveryStatus: "배송지시", progressStatus: "배송지시" },
    { deliveryStatus: "배송중", progressStatus: "배송중" },
    { deliveryStatus: "배송완료", progressStatus: "배송완료" },
    { deliveryStatus: "업체 직접 배송", progressStatus: "배송지시" }
  ];
  return fallbackCycle[index % fallbackCycle.length];
}
function buildDesktopOrderAdminRows(orders, sellerProducts) {
  const ordererNames = ["민트고양이", "로즈캣", "블랙벨", "은하수", "달빛노트", "소프트문"];
  const receiverNames = ["김수취", "박받는", "이도착", "최안심", "정포장", "윤비밀"];
  const addressSamples = [
    "서울 강남구 테헤란로 101",
    "경기 성남시 분당구 판교역로 235",
    "인천 연수구 센트럴로 123",
    "부산 해운대구 센텀남대로 35",
    "대전 유성구 대학로 99",
    "광주 서구 상무중앙로 57"
  ];
  const sellerDailyCounters = /* @__PURE__ */ new Map();
  if (orders.length) {
    return orders.slice().reverse().map((order, index) => {
      const linkedProduct = sellerProducts.length ? sellerProducts[index % sellerProducts.length] : null;
      const orderedDateIso = formatDesktopOrderDateLabelFromOrderNo(order.order_no, index);
      const sellerId = Math.max(1, Number(order.seller_id || (linkedProduct == null ? void 0 : linkedProduct.seller_id) || 1));
      const counterKey = `${orderedDateIso}:${sellerId}`;
      const nextSequence = (sellerDailyCounters.get(counterKey) ?? 0) + 1;
      sellerDailyCounters.set(counterKey, nextSequence);
      const orderNo = formatDesktopSellerOrderNoParts(orderedDateIso, sellerId, nextSequence);
      const orderedDate = /* @__PURE__ */ new Date(`${orderedDateIso}T09:00:00`);
      const statusInfo = mapDesktopOrderStatuses(order.status, index);
      const ordererName = ordererNames[index % ordererNames.length];
      const receiverName = receiverNames[index % receiverNames.length];
      const phoneTail = String(1200 + index * 37).padStart(4, "0");
      return {
        id: `desktop-order-${order.order_no}`,
        orderedAt: formatDesktopOrderShortDate(orderedDate),
        orderedDateIso,
        orderNo,
        productName: (linkedProduct == null ? void 0 : linkedProduct.name) ?? `주문 상품 ${index + 1}`,
        productCode: (linkedProduct == null ? void 0 : linkedProduct.sku_code) ?? `SKU-${String(index + 1).padStart(4, "0")}`,
        quantity: Math.max(1, Number(order.item_count ?? 1)),
        ordererLabel: `${ordererName} / buyer${order.member_id}`,
        receiverLabel: `${receiverName} / 010-48${String(index).padStart(2, "0")}-${phoneTail}`,
        address: addressSamples[index % addressSamples.length],
        deliveryStatus: statusInfo.deliveryStatus,
        progressStatus: statusInfo.progressStatus
      };
    });
  }
  return sellerProducts.slice(0, 8).map((product, index) => {
    const date = /* @__PURE__ */ new Date();
    date.setDate(date.getDate() - index);
    const orderedDateIso = formatDesktopOrderIsoDate(date);
    const statusInfo = mapDesktopOrderStatuses("", index);
    const sellerId = Math.max(1, Number(product.seller_id || 1));
    const counterKey = `${orderedDateIso}:${sellerId}`;
    const nextSequence = (sellerDailyCounters.get(counterKey) ?? 0) + 1;
    sellerDailyCounters.set(counterKey, nextSequence);
    const ordererName = ordererNames[index % ordererNames.length];
    const receiverName = receiverNames[index % receiverNames.length];
    const phoneTail = String(1400 + index * 51).padStart(4, "0");
    return {
      id: `desktop-order-fallback-${product.id}`,
      orderedAt: formatDesktopOrderShortDate(date),
      orderedDateIso,
      orderNo: formatDesktopSellerOrderNoParts(orderedDateIso, sellerId, nextSequence),
      productName: product.name,
      productCode: product.sku_code,
      quantity: Math.max(1, index % 3 + 1),
      ordererLabel: `${ordererName} / buyer${300 + index}`,
      receiverLabel: `${receiverName} / 010-57${String(index).padStart(2, "0")}-${phoneTail}`,
      address: addressSamples[index % addressSamples.length],
      deliveryStatus: statusInfo.deliveryStatus,
      progressStatus: statusInfo.progressStatus
    };
  });
}
function shiftDesktopOrderIsoMonth(orderedDateIso, deltaMonths) {
  const [year, month, day] = orderedDateIso.split("-").map((item) => Number(item));
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setMonth(date.getMonth() + deltaMonths);
  return formatDesktopOrderIsoDate(date);
}
function formatDesktopSettlementMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  return `${year}.${month}`;
}
function DesktopSplitShell() {
  const [sidebarOpen, setSidebarOpen] = reactExports.useState(true);
  const [leftSelection, setLeftSelection] = reactExports.useState({ mode: "tab", tab: "홈" });
  const [rightSelection, setRightSelection] = reactExports.useState({ mode: "tab", tab: "쇼핑" });
  const [desktopOverlayMode, setDesktopOverlayMode] = reactExports.useState(null);
  const [desktopSearchKeyword, setDesktopSearchKeyword] = reactExports.useState("");
  const [desktopSearchGroup, setDesktopSearchGroup] = reactExports.useState("전체");
  const leftFrameUrl = reactExports.useMemo(() => buildDesktopPaneFrameUrl("left", leftSelection), [leftSelection]);
  const rightFrameUrl = reactExports.useMemo(() => buildDesktopPaneFrameUrl("right", rightSelection), [rightSelection]);
  const iframeReady = Boolean(leftFrameUrl && rightFrameUrl);
  const desktopSearchIndex = reactExports.useMemo(() => buildDesktopGlobalSearchIndex(), []);
  const unreadDesktopNotificationCount = reactExports.useMemo(() => notificationSeed.filter((item) => item.unread).length, []);
  const selectPaneTab = reactExports.useCallback((slot, tab) => {
    const nextSelection = { mode: "tab", tab };
    if (slot === "left") {
      setLeftSelection(nextSelection);
      return;
    }
    setRightSelection(nextSelection);
  }, []);
  const desktopTopControls = [
    {
      slot: "left",
      title: "좌측 화면 메뉴",
      currentTab: leftSelection.mode === "tab" ? leftSelection.tab : desktopBusinessViewMeta[leftSelection.viewId].fallbackTab,
      currentLabel: getDesktopPaneSelectionLabel(leftSelection),
      onSelect: (tab) => selectPaneTab("left", tab)
    },
    {
      slot: "right",
      title: "우측 화면 메뉴",
      currentTab: rightSelection.mode === "tab" ? rightSelection.tab : desktopBusinessViewMeta[rightSelection.viewId].fallbackTab,
      currentLabel: getDesktopPaneSelectionLabel(rightSelection),
      onSelect: (tab) => selectPaneTab("right", tab)
    }
  ];
  const desktopSearchGroups = ["전체", "홈", "쇼핑", "소통", "채팅", "프로필", "알림", "테스트"];
  const desktopSearchResults = reactExports.useMemo(() => {
    const keyword = desktopSearchKeyword.trim().toLowerCase();
    const filtered = desktopSearchIndex.filter((item) => {
      const groupMatch = desktopSearchGroup === "전체" || item.group === desktopSearchGroup;
      const keywordMatch = !keyword || `${item.title} ${item.summary} ${item.keywords} ${item.path} ${item.category}`.toLowerCase().includes(keyword);
      return groupMatch && keywordMatch;
    });
    return filtered.sort((a, b) => {
      const aExact = keyword && a.title.toLowerCase().includes(keyword) ? 1 : 0;
      const bExact = keyword && b.title.toLowerCase().includes(keyword) ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      return a.path.localeCompare(b.path, "ko");
    }).slice(0, 80);
  }, [desktopSearchGroup, desktopSearchIndex, desktopSearchKeyword]);
  const desktopNotificationSections = reactExports.useMemo(
    () => ({
      notices: notificationSeed.filter((item) => item.section === "공지"),
      orders: notificationSeed.filter((item) => item.section === "주문"),
      community: notificationSeed.filter((item) => item.section === "소통"),
      events: notificationSeed.filter((item) => item.section === "이벤트")
    }),
    []
  );
  const handleDesktopResultOpen = reactExports.useCallback((item) => {
    selectPaneTab("right", item.openTab);
    setDesktopOverlayMode(null);
  }, [selectPaneTab]);
  const openBusinessPane = reactExports.useCallback((slot, viewId) => {
    const nextSelection = { mode: "business", viewId };
    if (slot === "left") {
      setLeftSelection(nextSelection);
      return;
    }
    setRightSelection(nextSelection);
  }, []);
  const toggleLabel = sidebarOpen ? "‹ 메뉴 접기" : "› 메뉴 펼치기";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `desktop-split-shell ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-split-layout", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: `desktop-side-menu ${sidebarOpen ? "open" : "closed"}`, "aria-label": "PC 분할 메뉴", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: "desktop-side-menu-toggle",
          onClick: () => setSidebarOpen((prev) => !prev),
          "aria-expanded": sidebarOpen,
          "aria-label": toggleLabel,
          title: toggleLabel,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-side-menu-toggle-arrow", "aria-hidden": "true", children: sidebarOpen ? "‹" : "›" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-side-menu-toggle-label", children: sidebarOpen ? "메뉴 접기" : "메뉴 펼치기" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-side-menu-scroll", children: desktopBusinessMenuSections.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-side-menu-section desktop-side-menu-section-business", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-side-menu-section-head", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: section.title }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "desktop-side-menu-list", children: section.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "desktop-side-menu-list-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-side-menu-item-main", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-side-menu-item-title-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("small", { children: item.summary })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-side-menu-item-actions", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "desktop-side-menu-open-btn", onClick: () => openBusinessPane("left", item.viewId), children: "좌" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "desktop-side-menu-open-btn", onClick: () => openBusinessPane("right", item.viewId), children: "우" })
            ] })
          ] }),
          item.children ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "desktop-side-menu-sublist", children: item.children.map((child) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: child }, child)) }) : null
        ] }, item.viewId)) })
      ] }, section.title)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-split-main", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-shell-top-stack", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-shell-header desktop-shell-header-actions-only", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-shell-header-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: `desktop-header-action-btn ${desktopOverlayMode === "search" ? "active" : ""}`,
              onClick: () => setDesktopOverlayMode((prev) => prev === "search" ? null : "search"),
              "aria-label": "통합 검색",
              title: "통합 검색",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, {})
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: `desktop-header-action-btn desktop-header-action-btn-bell ${desktopOverlayMode === "notifications" ? "active" : ""}`,
              onClick: () => setDesktopOverlayMode((prev) => prev === "notifications" ? null : "notifications"),
              "aria-label": "알림",
              title: "알림",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(BellIcon, {}),
                unreadDesktopNotificationCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-header-badge", children: unreadDesktopNotificationCount > 9 ? "9+" : unreadDesktopNotificationCount }) : null
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: `desktop-header-action-btn ${desktopOverlayMode === "settings" ? "active" : ""}`,
              onClick: () => setDesktopOverlayMode((prev) => prev === "settings" ? null : "settings"),
              "aria-label": "설정",
              title: "설정",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsIcon, {})
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-split-toolbar", children: desktopTopControls.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "desktop-top-control-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-top-control-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: section.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: section.currentLabel })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-top-control-grid", children: mobileTabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: `desktop-side-menu-tab-btn ${section.currentTab === tab ? "active" : ""}`,
              onClick: () => section.onSelect(tab),
              children: tab
            },
            `${section.slot}-toolbar-${tab}`
          )) })
        ] }, section.slot)) })
      ] }),
      desktopOverlayMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-utility-overlay-shell", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-utility-overlay-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: desktopOverlayMode === "search" ? "통합 검색" : desktopOverlayMode === "notifications" ? "알림 센터" : "설정" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setDesktopOverlayMode(null), children: "닫기" })
        ] }),
        desktopOverlayMode === "search" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-utility-overlay-body", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-utility-search-toolbar", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: desktopSearchKeyword,
                onChange: (event) => setDesktopSearchKeyword(event.target.value),
                placeholder: "PC/모바일 전체 키워드 검색",
                className: "desktop-utility-search-input",
                autoFocus: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setDesktopSearchKeyword(""), children: "검색어 초기화" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-utility-chip-row", children: desktopSearchGroups.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: `desktop-utility-chip ${desktopSearchGroup === item ? "active" : ""}`,
              onClick: () => setDesktopSearchGroup(item),
              children: item
            },
            item
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-utility-result-summary", children: [
            "분류 ",
            desktopSearchGroup,
            " · 결과 ",
            desktopSearchResults.length,
            "건"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-utility-result-list", children: desktopSearchResults.length ? desktopSearchResults.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "desktop-search-result-card", onClick: () => handleDesktopResultOpen(item), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-search-result-top", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-search-result-badge", children: item.group }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-search-result-category", children: item.category })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.summary }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-search-result-path", children: [
              "경로: ",
              item.path
            ] })
          ] }, item.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-utility-empty", children: "연관 검색 결과가 없습니다." }) })
        ] }) : null,
        desktopOverlayMode === "notifications" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-utility-overlay-body desktop-notification-panel", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-notification-summary-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-notification-summary-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "공지사항" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                desktopNotificationSections.notices.length,
                "건"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-notification-summary-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "주문/배송/환불" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                desktopNotificationSections.orders.length,
                "건"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-notification-summary-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "메세지/소통" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                desktopNotificationSections.community.length,
                "건"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-notification-summary-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "이벤트" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                desktopNotificationSections.events.length,
                "건"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-utility-result-list", children: notificationSeed.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "desktop-notification-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-search-result-top", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-search-result-badge", children: item.section }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-search-result-category", children: item.category })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.body }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-search-result-path", children: [
              item.meta,
              " · ",
              item.postedAt,
              item.unread ? " · 읽지 않음" : ""
            ] })
          ] }, `desktop-noti-${item.id}`)) })
        ] }) : null,
        desktopOverlayMode === "settings" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-utility-overlay-body desktop-settings-placeholder", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-settings-placeholder-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "설정 준비중" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "설정 버튼은 상단에 먼저 배치했고, 세부 항목은 추후 연결할 수 있도록 자리만 열어두었습니다." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-utility-chip-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-placeholder-pill", children: "계정" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-placeholder-pill", children: "알림" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-placeholder-pill", children: "보안" })
          ] })
        ] }) }) : null
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-split-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "desktop-split-pane", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-split-device-frame", children: iframeReady ? /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { className: "desktop-split-iframe", src: leftFrameUrl, title: "adultapp-left-pane", loading: "eager" }, leftFrameUrl) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-split-fallback", children: "화면을 준비 중입니다." }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "desktop-split-pane", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-split-device-frame", children: iframeReady ? /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { className: "desktop-split-iframe", src: rightFrameUrl, title: "adultapp-right-pane", loading: "eager" }, rightFrameUrl) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-split-fallback", children: "화면을 준비 중입니다." }) }) })
      ] })
    ] })
  ] }) });
}
const APP_BACK_MINIMIZE_WINDOW_MS = 1800;
const APP_NAVIGATION_HISTORY_LIMIT = 120;
const APP_BROWSER_HISTORY_STATE_KEY = "__adultapp_nav_index";
const cloneNavigationSnapshot = (snapshot) => JSON.parse(JSON.stringify(snapshot));
const getNativeAppPlugin = () => {
  var _a, _b;
  if (typeof window === "undefined") return null;
  return ((_b = (_a = window.Capacitor) == null ? void 0 : _a.Plugins) == null ? void 0 : _b.App) ?? null;
};
function SearchIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "6.5", fill: "none", stroke: "currentColor", strokeWidth: "1.9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 16L21 21", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round" })
  ] });
}
function SettingsIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19.14 12.94a7.4 7.4 0 0 0 .05-.94 7.4 7.4 0 0 0-.05-.94l2.03-1.58a.6.6 0 0 0 .15-.77l-1.92-3.32a.6.6 0 0 0-.73-.26l-2.39.96a7.78 7.78 0 0 0-1.63-.94l-.36-2.54a.6.6 0 0 0-.59-.51H10.3a.6.6 0 0 0-.59.51l-.36 2.54c-.58.22-1.13.54-1.63.94l-2.39-.96a.6.6 0 0 0-.73.26L2.68 8.71a.6.6 0 0 0 .15.77l2.03 1.58a7.4 7.4 0 0 0-.05.94c0 .32.02.63.05.94L2.83 14.52a.6.6 0 0 0-.15.77l1.92 3.32c.16.28.49.39.79.26l2.39-.96c.5.4 1.05.72 1.63.94l.36 2.54c.05.29.3.51.59.51h3.4c.3 0 .55-.22.59-.51l.36-2.54c.58-.22 1.13-.54 1.63-.94l2.39.96c.3.12.63.01.79-.26l1.92-3.32a.6.6 0 0 0-.15-.77l-2.03-1.58Z", fill: "none", stroke: "currentColor", strokeWidth: "2.05", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "3.1", fill: "none", stroke: "currentColor", strokeWidth: "2.05" })
  ] });
}
function MenuIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 7h16" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 12h16" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 17h16" })
  ] });
}
function BellIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 3.5a4.2 4.2 0 0 0-4.2 4.2v1.1c0 1.3-.42 2.56-1.2 3.6l-1.18 1.57c-.42.56-.02 1.36.68 1.36h12.84c.7 0 1.1-.8.68-1.36l-1.18-1.57a5.98 5.98 0 0 1-1.2-3.6V7.7A4.2 4.2 0 0 0 12 3.5Z", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9.5 18.5a2.7 2.7 0 0 0 5 0", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round" })
  ] });
}
function CartIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3.5 5h2.4l1.45 8.12a1.8 1.8 0 0 0 1.77 1.48h7.78a1.8 1.8 0 0 0 1.75-1.39l1.36-5.81H7.12", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "10.2", cy: "18.2", r: "1.35", fill: "currentColor" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "17.2", cy: "18.2", r: "1.35", fill: "currentColor" })
  ] });
}
function HomeIcon({ filled = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4.5 11.2 12 4.8l7.5 6.4V19a1.5 1.5 0 0 1-1.5 1.5h-3.2v-5.6h-5.6v5.6H6A1.5 1.5 0 0 1 4.5 19v-7.8Z", fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" }) });
}
function ShoppingBagIcon({ filled = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6.2 8.2h11.6l-.9 10.2a1.7 1.7 0 0 1-1.7 1.5H8.8a1.7 1.7 0 0 1-1.7-1.5L6.2 8.2Z", fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9 9V7.8a3 3 0 0 1 6 0V9", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" })
  ] });
}
function CommunityIcon({ filled = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4.5 6.8A2.3 2.3 0 0 1 6.8 4.5h10.4a2.3 2.3 0 0 1 2.3 2.3v6.8a2.3 2.3 0 0 1-2.3 2.3h-5.1l-4.6 3.2v-3.2H6.8a2.3 2.3 0 0 1-2.3-2.3V6.8Z", fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" }) });
}
function ChatIcon({ filled = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 7.2A2.2 2.2 0 0 1 7.2 5h9.6A2.2 2.2 0 0 1 19 7.2v5.6A2.2 2.2 0 0 1 16.8 15H11l-4 3v-3H7.2A2.2 2.2 0 0 1 5 12.8V7.2Z", fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8.2 9.8h7.6M8.2 12.2h4.8", fill: "none", stroke: filled ? "#000" : "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })
  ] });
}
function ProfileIcon({ filled = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "8.2", r: "3.3", fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "1.8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5.2 19.3a6.8 6.8 0 0 1 13.6 0", fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" })
  ] });
}
function BookmarkIcon({ filled = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 4.8h10a1 1 0 0 1 1 1V20l-6-3.6L6 20V5.8a1 1 0 0 1 1-1Z", fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" }) });
}
function BackArrowIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15.5 5 8.5 12l7 7", fill: "none", stroke: "currentColor", strokeWidth: "2.6", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
function MoreDotsIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "6", cy: "12", r: "1.8", fill: "currentColor" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "1.8", fill: "currentColor" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "18", cy: "12", r: "1.8", fill: "currentColor" })
  ] });
}
function PlusIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 5.2v13.6M5.2 12h13.6", fill: "none", stroke: "currentColor", strokeWidth: "2.6", strokeLinecap: "round" }) });
}
function ShortsCameraIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4.5", y: "7", width: "10.5", height: "10", rx: "2.2", fill: "none", stroke: "currentColor", strokeWidth: "1.8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "9.75", cy: "12", r: "2.5", fill: "none", stroke: "currentColor", strokeWidth: "1.8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 10.1 19.3 8v8L15 13.9", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round", strokeLinecap: "round" })
  ] });
}
function PhotoImageIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4.2", y: "5.2", width: "15.6", height: "13.6", rx: "2.2", fill: "none", stroke: "currentColor", strokeWidth: "1.8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "9", cy: "10", r: "1.5", fill: "currentColor" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6.8 16.1 10.3 12.7 12.9 15.2 15.2 12.8 17.8 16.1", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" })
  ] });
}
function PaperDocumentIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 4.5h6.6l3.4 3.5V19a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V6A1.5 1.5 0 0 1 8 4.5Z", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14.5 4.8V8h3.1", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9 11.2h6M9 14.2h6M9 17.2h4.2", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" })
  ] });
}
function ThumbUpIcon({ filled = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        d: "M10 10V5.8c0-1.05.83-1.8 1.55-2.52.65-.64 1.27-1.26 1.45-2.22.06-.34.52-.42.72-.13.84 1.21 1.28 2.76 1.28 4.73V10h4.1c1.04 0 1.84.93 1.68 1.95l-1.23 7.9A2 2 0 0 1 17.58 21H9.7A1.7 1.7 0 0 1 8 19.3V10h2Z",
        fill: filled ? "currentColor" : "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 10h4v11H5.2A1.2 1.2 0 0 1 4 19.8V10Z", fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" })
  ] });
}
function ThumbDownIcon({ filled = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: "translate(24 24) rotate(180)", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        d: "M10 10V5.8c0-1.05.83-1.8 1.55-2.52.65-.64 1.27-1.26 1.45-2.22.06-.34.52-.42.72-.13.84 1.21 1.28 2.76 1.28 4.73V10h4.1c1.04 0 1.84.93 1.68 1.95l-1.23 7.9A2 2 0 0 1 17.58 21H9.7A1.7 1.7 0 0 1 8 19.3V10h2Z",
        fill: filled ? "currentColor" : "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 10h4v11H5.2A1.2 1.2 0 0 1 4 19.8V10Z", fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" })
  ] }) });
}
function CommentBubbleIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 6.5h12A2.5 2.5 0 0 1 20.5 9v6A2.5 2.5 0 0 1 18 17.5H11l-4.5 3v-3H6A2.5 2.5 0 0 1 3.5 15V9A2.5 2.5 0 0 1 6 6.5Z", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" }) });
}
function ShareArrowIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M13 5.5 20 12l-7 6.5", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19.5 12H10a5.5 5.5 0 0 0-5.5 5.5", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round" })
  ] });
}
function RepostIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 7.5h9.6", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14.1 4.6 17 7.5l-2.9 2.9", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17 16.5H7.4", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9.9 13.6 7 16.5l2.9 2.9", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 7.5H6a2 2 0 0 0-2 2V11", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17 16.5h1a2 2 0 0 0 2-2V13", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" })
  ] });
}
function HeartIcon({ filled = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 20.2 5.7 13.9a4.6 4.6 0 0 1 6.5-6.5L12 8l-.2-.2a4.6 4.6 0 1 1 6.5 6.5L12 20.2Z", fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" }) });
}
function QuestionAnswerIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4.5 7.4A2.4 2.4 0 0 1 6.9 5h7.6A2.4 2.4 0 0 1 16.9 7.4v3.5a2.4 2.4 0 0 1-2.4 2.4H9.8L6.1 16v-2.7H6.9a2.4 2.4 0 0 1-2.4-2.4V7.4Z", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9 8.6a1.4 1.4 0 1 1 2.4 1c-.44.43-.98.77-.98 1.62", fill: "none", stroke: "currentColor", strokeWidth: "1.45", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "10.4", cy: "12.2", r: ".8", fill: "currentColor" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M11.9 13.2h5.2l2.8 2v-2a2.2 2.2 0 0 0 2.1-2.2V9.4a2.2 2.2 0 0 0-2.2-2.2h-1.5", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 9.5h4M15 11.7h2.5", fill: "none", stroke: "currentColor", strokeWidth: "1.45", strokeLinecap: "round" })
  ] });
}
function ViewCountIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2.8 12s3.4-5.5 9.2-5.5 9.2 5.5 9.2 5.5-3.4 5.5-9.2 5.5S2.8 12 2.8 12Z", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "2.7", fill: "none", stroke: "currentColor", strokeWidth: "1.8" })
  ] });
}
const FEED_CARD_PRESENTATION = {
  backgroundColor: "#000000",
  textColor: "#ffffff",
  mutedTextColor: "#d1d5db",
  accentColor: "var(--pink-2)"
};
const FEED_LANDSCAPE_LIBRARY = [
  { id: 10, name: "고요한 호수 풍경" },
  { id: 11, name: "숲길 풍경" },
  { id: 12, name: "산등성이 풍경" },
  { id: 13, name: "계곡 풍경" },
  { id: 14, name: "초원 풍경" },
  { id: 15, name: "노을 호수 풍경" },
  { id: 16, name: "안개 숲 풍경" },
  { id: 17, name: "강변 풍경" },
  { id: 18, name: "절벽 해안 풍경" },
  { id: 19, name: "아침 산맥 풍경" },
  { id: 20, name: "평원 풍경" },
  { id: 21, name: "구릉지 풍경" },
  { id: 22, name: "수목원 풍경" },
  { id: 23, name: "호숫가 오솔길 풍경" },
  { id: 24, name: "들판 풍경" },
  { id: 25, name: "석양 해변 풍경" },
  { id: 26, name: "산책로 풍경" },
  { id: 27, name: "강가 풍경" },
  { id: 28, name: "고원 풍경" },
  { id: 29, name: "자작나무 숲 풍경" },
  { id: 30, name: "푸른 숲 풍경" },
  { id: 31, name: "잔잔한 강 풍경" },
  { id: 32, name: "해안 절경 풍경" },
  { id: 33, name: "수평선 노을 풍경" }
];
function getFeedLandscapeMedia(itemId) {
  const landscape = FEED_LANDSCAPE_LIBRARY[itemId % FEED_LANDSCAPE_LIBRARY.length];
  return {
    mediaUrl: `https://picsum.photos/id/${landscape.id}/1200/900`,
    mediaName: landscape.name
  };
}
function normalizeFeedItemPresentation(item) {
  if (item.type !== "image" || item.mediaUrl) return item;
  const landscapeMedia = getFeedLandscapeMedia(item.id);
  return {
    ...item,
    mediaUrl: landscapeMedia.mediaUrl,
    mediaName: landscapeMedia.mediaName
  };
}
const feedSeed = [
  { id: 1, type: "video", category: "브랜드", title: "입문 가이드", caption: "입문용 제품을 안전하게 고르는 기준을 10초 요약 쇼츠로 정리했습니다.", author: "adult official", likes: 428, comments: 31, accent: "sunrise", views: 3200, postedAt: "방금", videoUrl: "/generated/shorts/short_1.mp4" },
  { id: 2, type: "video", category: "추천", title: "오늘의 인기 케어 키트", caption: "관리 루틴과 함께 보기 좋은 인기 케어 키트를 짧게 소개합니다.", author: "seller studio", likes: 391, comments: 28, accent: "violet", views: 2890, postedAt: "3분 전", videoUrl: "/generated/shorts/short_2.mp4" },
  { id: 3, type: "video", category: "보관팁", title: "위생 보관 3단계", caption: "보관 파우치, 세정, 건조 순서를 한 화면으로 확인할 수 있습니다.", author: "care lab", likes: 512, comments: 44, accent: "teal", views: 4100, postedAt: "8분 전", videoUrl: "/generated/shorts/short_3.mp4" },
  { id: 4, type: "video", category: "리뷰", title: "초보자 추천 구성", caption: "리뷰가 많은 스타터 구성과 선택 포인트를 빠르게 보여줍니다.", author: "review crew", likes: 366, comments: 19, accent: "rose", views: 2510, postedAt: "15분 전", videoUrl: "/generated/shorts/short_4.mp4" },
  { id: 5, type: "video", category: "실사용", title: "조용한 사용감 비교", caption: "저소음 위주로 비교한 추천 라인업을 짧게 살펴봅니다.", author: "seller studio", likes: 448, comments: 36, accent: "sunrise", views: 3670, postedAt: "22분 전", videoUrl: "/generated/shorts/short_5.mp4" },
  { id: 6, type: "video", category: "이벤트", title: "이번 주 할인 픽", caption: "행사 중인 제품과 리뷰 수가 높은 상품을 함께 보여줍니다.", author: "event pick", likes: 299, comments: 17, accent: "violet", views: 2190, postedAt: "35분 전", videoUrl: "/generated/shorts/short_6.mp4" },
  { id: 7, type: "video", category: "신상품", title: "신상품 언박싱 컷", caption: "이번 주 새로 올라온 상품의 포장과 구성만 간단히 확인합니다.", author: "adult official", likes: 537, comments: 48, accent: "teal", views: 4620, postedAt: "48분 전", videoUrl: "/generated/shorts/short_7.mp4" },
  { id: 8, type: "video", category: "브랜드", title: "브랜드 큐레이션", caption: "브랜드별 무드와 포지션을 10초 요약으로 보여주는 소개 영상입니다.", author: "brand note", likes: 324, comments: 20, accent: "rose", views: 2430, postedAt: "1시간 전", videoUrl: "/generated/shorts/short_8.mp4" },
  { id: 9, type: "video", category: "추천", title: "리뷰 순위 TOP 제품", caption: "리뷰 수와 재구매율 기준으로 정리한 오늘의 추천 제품입니다.", author: "review crew", likes: 605, comments: 52, accent: "sunrise", views: 5080, postedAt: "2시간 전", videoUrl: "/generated/shorts/short_9.mp4" },
  { id: 10, type: "video", category: "보관팁", title: "세정 루틴 한 컷", caption: "세정 제품과 보관 방법을 아주 짧은 루틴으로 보여줍니다.", author: "care lab", likes: 417, comments: 29, accent: "violet", views: 3010, postedAt: "오늘", videoUrl: "/generated/shorts/short_10.mp4" },
  { id: 11, type: "image", category: "브랜드", title: "무광 블랙 패키지 모음", caption: "패키지 디자인과 무드 중심으로 큐레이션한 브랜드 피드입니다.", author: "adult official", likes: 182, comments: 11, accent: "teal", views: 1280, postedAt: "방금" },
  { id: 12, type: "image", category: "리뷰", title: "리뷰 많은 입문 제품", caption: "초보자 선호도가 높은 제품을 후기 중심으로 정리했습니다.", author: "review crew", likes: 173, comments: 13, accent: "rose", views: 1190, postedAt: "11분 전" },
  { id: 13, type: "image", category: "추천", title: "오늘의 추천 딜도", caption: "형태, 재질, 보관 편의성을 함께 본 추천 카드입니다.", author: "seller studio", likes: 214, comments: 16, accent: "sunrise", views: 1490, postedAt: "18분 전" },
  { id: 14, type: "image", category: "추천", title: "오늘의 추천 바이브", caption: "입문자용 저소음 바이브레이터 추천 모음입니다.", author: "seller studio", likes: 228, comments: 15, accent: "violet", views: 1560, postedAt: "24분 전" },
  { id: 15, type: "image", category: "실사용", title: "사용감 비교 메모", caption: "실사용 후기를 짧게 정리해 제품 선택 시간을 줄여줍니다.", author: "review crew", likes: 201, comments: 14, accent: "teal", views: 1455, postedAt: "29분 전" },
  { id: 16, type: "image", category: "보관팁", title: "보관 파우치 추천", caption: "위생적인 보관을 위한 파우치와 실링 키트를 정리했습니다.", author: "care lab", likes: 194, comments: 9, accent: "rose", views: 1332, postedAt: "38분 전" },
  { id: 17, type: "image", category: "브랜드", title: "국내 브랜드 집중 소개", caption: "국내 브랜드별 대표 라인업을 한 장으로 묶은 카드입니다.", author: "brand note", likes: 166, comments: 8, accent: "sunrise", views: 1201, postedAt: "43분 전" },
  { id: 38, type: "image", category: "브랜드", title: "수입 브랜드 집중 소개", caption: "수입 브랜드 중 반응이 좋은 제품군만 골라 정리했습니다.", author: "brand note", likes: 159, comments: 7, accent: "violet", views: 1172, postedAt: "52분 전" },
  { id: 39, type: "image", category: "이벤트", title: "이번 주 기획전 소식", caption: "행사 중인 인기 카테고리와 재고 상태를 한눈에 보여줍니다.", author: "event pick", likes: 247, comments: 18, accent: "teal", views: 1880, postedAt: "1시간 전" },
  { id: 40, type: "image", category: "신상품", title: "신상품 등록 미리보기", caption: "막 등록된 상품 중 반응이 빠른 제품만 먼저 보여줍니다.", author: "seller studio", likes: 177, comments: 9, accent: "rose", views: 1307, postedAt: "1시간 전" },
  { id: 41, type: "image", category: "실사용", title: "리얼 사용 후기 모음", caption: "자극 강도, 소음, 보관성 중심으로 모은 후기 카드입니다.", author: "review crew", likes: 221, comments: 21, accent: "sunrise", views: 1615, postedAt: "2시간 전" },
  { id: 42, type: "image", category: "리뷰", title: "리뷰 100+ 추천 제품", caption: "리뷰가 누적된 제품만 별도 묶음으로 보여줍니다.", author: "review crew", likes: 239, comments: 17, accent: "violet", views: 1702, postedAt: "2시간 전" },
  { id: 43, type: "image", category: "추천", title: "본디지 테이프 큐레이션", caption: "안전하게 시작하기 좋은 본디지 테이프 위주로 정리했습니다.", author: "seller studio", likes: 187, comments: 12, accent: "teal", views: 1424, postedAt: "3시간 전" },
  { id: 44, type: "image", category: "추천", title: "패들 & 케인 추천", caption: "입문형 패들과 케인을 비교해 보여주는 추천 카드입니다.", author: "seller studio", likes: 175, comments: 10, accent: "rose", views: 1362, postedAt: "3시간 전" },
  { id: 45, type: "image", category: "보관팁", title: "세정제 고르는 기준", caption: "자극도와 성분 기준으로 세정제를 고르는 방법입니다.", author: "care lab", likes: 164, comments: 8, accent: "sunrise", views: 1234, postedAt: "오늘" },
  { id: 46, type: "image", category: "보관팁", title: "보관함 정리 루틴", caption: "사용 후 말림, 보관 순서를 카드형으로 정리했습니다.", author: "care lab", likes: 154, comments: 7, accent: "violet", views: 1150, postedAt: "오늘" },
  { id: 47, type: "image", category: "브랜드", title: "프리미엄 라인 픽", caption: "고급형 라인에서 반응이 좋은 제품만 선별했습니다.", author: "adult official", likes: 208, comments: 11, accent: "teal", views: 1538, postedAt: "어제" },
  { id: 48, type: "image", category: "추천", title: "러브젤 인기 순위", caption: "후기와 재구매 데이터를 기준으로 러브젤을 정리했습니다.", author: "seller studio", likes: 191, comments: 13, accent: "rose", views: 1468, postedAt: "어제" },
  { id: 49, type: "image", category: "신상품", title: "이번 주 신규 입점", caption: "이번 주 입점한 셀러와 신규 상품 정보를 모았습니다.", author: "event pick", likes: 169, comments: 9, accent: "sunrise", views: 1260, postedAt: "어제" },
  { id: 50, type: "image", category: "리뷰", title: "입문자 만족도 상위", caption: "입문자 평점이 높은 구성만 묶은 리뷰 카드입니다.", author: "review crew", likes: 236, comments: 14, accent: "violet", views: 1741, postedAt: "어제" },
  { id: 51, type: "image", category: "추천", title: "홈 피드 테스트 01 · 오늘 많이 저장된 제품", caption: "홈 피드 스크롤 테스트용 카드입니다. 저장 수가 높은 제품과 요약 포인트를 카드형으로 보여줍니다. 실제 운영 화면에서는 본문이 길어질 수 있으므로 첫 화면에서는 3줄까지만 노출하고, 이어지는 설명은 더보기로 펼쳐 보도록 구성했습니다.", author: "adult official", likes: 287, comments: 23, accent: "sunrise", views: 1968, postedAt: "방금" },
  { id: 52, type: "image", category: "리뷰", title: "홈 피드 테스트 02 · 실사용 후기 한눈에", caption: "인스타그램·트위터형 리스트 피드 테스트용 카드입니다. 실제 후기 요약과 반응 포인트를 빠르게 확인할 수 있습니다. 제품별 장점, 사용감, 소음감, 보관성 같은 항목이 길어질 때에도 첫 화면은 짧게 유지하고 상세 문장은 접어서 보여줍니다.", author: "review crew", likes: 264, comments: 19, accent: "teal", views: 1824, postedAt: "2분 전" },
  { id: 53, type: "image", category: "보관팁", title: "홈 피드 테스트 03 · 세정과 보관 루틴", caption: "스크롤 시 다음 피드가 자연스럽게 이어지도록 배치한 테스트 카드입니다. 세정, 건조, 보관 루틴을 한 장에 정리했습니다. 사용 후 세정제를 어떻게 고르고, 어느 정도 건조한 뒤, 어떤 파우치에 넣어두는지까지 순서형으로 설명하는 긴 본문 테스트용 문장입니다.", author: "care lab", likes: 241, comments: 17, accent: "violet", views: 1712, postedAt: "4분 전" }
];
function parseRelativeMinutes(postedAt) {
  if (!postedAt) return 240;
  if (postedAt === "방금") return 1;
  if (postedAt === "오늘") return 180;
  if (postedAt === "어제") return 1440;
  const minuteMatch = postedAt.match(/(\d+)분 전/);
  if (minuteMatch) return Number(minuteMatch[1]);
  const hourMatch = postedAt.match(/(\d+)시간 전/);
  if (hourMatch) return Number(hourMatch[1]) * 60;
  return 240;
}
const FEED_ALGO_FALLBACK_KEYWORDS = ["추천", "인기", "리뷰", "케어"];
function formatShortDateLabel(value) {
  if (!value) return "26.4.18";
  if (/^\d{2}\.\d{1,2}\.\d{1,2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.split("T")[0].split("-");
    return `${year.slice(2)}.${Number(month)}.${Number(day)}`;
  }
  if (value === "어제") return "26.4.18";
  return value;
}
function formatFeedPostedAt(postedAt) {
  const minutes = parseRelativeMinutes(postedAt);
  if (minutes <= 2) return "방금 업데이트";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
  return formatShortDateLabel(postedAt);
}
function formatCommunityPostedAt(postedAt) {
  const minutes = parseRelativeMinutes(postedAt);
  if (minutes < 60) return "1시간 전";
  if (minutes < 1440) return `${Math.max(1, Math.floor(minutes / 60))}시간 전`;
  return formatShortDateLabel(postedAt);
}
function parseCommunityMeta(meta) {
  const [authorRaw, postedAtRaw] = meta.split("·").map((item) => item.trim());
  return {
    author: authorRaw || "운영팀",
    postedAt: formatCommunityPostedAt(postedAtRaw || "26.4.18")
  };
}
function extractInterestTokens(source) {
  return source.toLowerCase().split(/[^a-z0-9가-힣]+/).map((token) => token.trim()).filter((token) => token.length >= 2);
}
function buildKeywordSignalMap({
  shopKeywordSignals,
  shortsKeywordSignals,
  globalKeyword,
  followingUserIds,
  savedFeedIds,
  feedItems,
  forumUsers
}) {
  const signalMap = /* @__PURE__ */ new Map();
  Object.entries(shopKeywordSignals).forEach(([token, score]) => signalMap.set(token.toLowerCase(), (signalMap.get(token.toLowerCase()) ?? 0) + score * 1.4));
  Object.entries(shortsKeywordSignals).forEach(([token, score]) => signalMap.set(token.toLowerCase(), (signalMap.get(token.toLowerCase()) ?? 0) + score * 1.8));
  extractInterestTokens(globalKeyword).forEach((token) => signalMap.set(token, (signalMap.get(token) ?? 0) + 4));
  const followedTopicKeywords = followingUserIds.map((id2) => forumUsers.find((user) => user.id === id2)).filter((user) => Boolean(user)).flatMap((user) => extractInterestTokens(`${user.name} ${user.topic} ${user.role}`));
  followedTopicKeywords.forEach((token) => signalMap.set(token, (signalMap.get(token) ?? 0) + 2.5));
  const savedKeywords = feedItems.filter((item) => savedFeedIds.includes(item.id)).flatMap((item) => extractInterestTokens(`${item.title} ${item.caption} ${item.category} ${item.author}`));
  savedKeywords.forEach((token) => signalMap.set(token, (signalMap.get(token) ?? 0) + 3.5));
  return signalMap;
}
function getTopMatchedKeywords(item, signalMap) {
  const content = `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase();
  const rankedSignals = Array.from(signalMap.entries()).sort((a, b) => b[1] - a[1]).map(([token]) => token.toLowerCase()).filter((token, index, array) => token && array.indexOf(token) === index);
  const directMatches = rankedSignals.filter((token) => content.includes(token));
  const fallback = rankedSignals.length ? rankedSignals : [...FEED_ALGO_FALLBACK_KEYWORDS];
  return Array.from(/* @__PURE__ */ new Set([...directMatches.length ? directMatches : fallback])).slice(0, 2);
}
function deterministicHash(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1000003;
  }
  return hash;
}
function withProductMetrics(product, index) {
  const seedText = `${product.id}-${product.name}-${product.category}-${product.badge}`;
  const reviewCount = product.reviewCount ?? 40 + deterministicHash(`${seedText}-review`) % 260;
  const orderCount = product.orderCount ?? 20 + deterministicHash(`${seedText}-order`) % 320;
  const repurchaseCount = product.repurchaseCount ?? 5 + deterministicHash(`${seedText}-re`) % 140;
  const isPremium = product.isPremium ?? (/프리미엄|premium|고급/.test(`${product.name} ${product.subtitle} ${product.badge}`.toLowerCase()) || deterministicHash(`${seedText}-premium`) % 100 < 18);
  const month = deterministicHash(`${seedText}-month`) % 4 + 1;
  const day = deterministicHash(`${seedText}-day`) % 27 + 1;
  const createdAt = product.createdAt ?? `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return {
    ...product,
    reviewCount,
    orderCount,
    repurchaseCount,
    isPremium,
    createdAt,
    stock_qty: product.stock_qty ?? 12 + index % 9
  };
}
function parseIsoDateScore(value) {
  if (!value) return 0;
  const score = Date.parse(value);
  return Number.isNaN(score) ? 0 : score;
}
const SHOP_SEARCH_COLOR_OPTIONS = ["전체", "블랙", "핑크", "퍼플", "실버"];
const SHOP_SEARCH_PURPOSE_OPTIONS = ["전체", "입문", "자극", "케어", "윤활", "보관"];
const SHOP_HOME_SORT_TABS = ["신규", "인기", "판매량", "추천", "리뷰"];
function getProductNumericPrice(product) {
  const numeric = Number(String(product.price).replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}
function getProductColorTag(product) {
  const source = `${product.name} ${product.subtitle} ${product.category}`.toLowerCase();
  if (/블랙|black|흑/.test(source)) return "블랙";
  if (/핑크|pink/.test(source)) return "핑크";
  if (/퍼플|purple|보라/.test(source)) return "퍼플";
  if (/실버|silver|메탈|금속/.test(source)) return "실버";
  const fallbackColors = SHOP_SEARCH_COLOR_OPTIONS.slice(1);
  return fallbackColors[deterministicHash(source || String(product.id)) % fallbackColors.length];
}
function getProductPurposeTag(product) {
  const source = `${product.name} ${product.subtitle} ${product.category}`.toLowerCase();
  if (/젤|윤활|수분|보습/.test(source)) return "윤활";
  if (/케어|세정|세척|클리너|위생/.test(source)) return "케어";
  if (/보관|파우치|케이스/.test(source)) return "보관";
  if (/입문|초보|소형|슬림/.test(source)) return "입문";
  if (/바이브|딜도|플러그|자극|프리미엄/.test(source)) return "자극";
  const fallbackPurposes = SHOP_SEARCH_PURPOSE_OPTIONS.slice(1);
  return fallbackPurposes[deterministicHash(source || String(product.id)) % fallbackPurposes.length];
}
function buildShopHomeRecommendationFeed({
  items,
  keywordSignals,
  visibleCount
}) {
  const normalizedItems = items.map((item, index) => withProductMetrics(item, index));
  if (!normalizedItems.length) return [];
  const rankedTokens = Object.entries(keywordSignals).sort((a, b) => b[1] - a[1]).map(([token]) => token.toLowerCase()).filter((token) => token.length >= 2).slice(0, 6);
  const fallbackTokens = normalizedItems.flatMap((item) => [item.category, ...extractInterestTokens(`${item.name} ${item.subtitle}`)]).map((token) => token.toLowerCase()).filter((token, index, arr) => token && arr.indexOf(token) === index).slice(0, 6);
  const interestTokens = rankedTokens.length ? rankedTokens : fallbackTokens;
  const matchesInterest = (item) => {
    const source = `${item.category} ${item.name} ${item.subtitle} ${item.badge}`.toLowerCase();
    return interestTokens.some((token) => source.includes(token));
  };
  const interestPoolBase = normalizedItems.filter(matchesInterest);
  const interestPool = interestPoolBase.length ? interestPoolBase : normalizedItems;
  const nonInterestPoolBase = normalizedItems.filter((item) => !interestPool.some((picked) => picked.id === item.id));
  const nonInterestPool = nonInterestPoolBase.length ? nonInterestPoolBase : normalizedItems;
  const interestTarget = Math.max(1, Math.round(visibleCount * 0.8));
  const nonInterestTarget = Math.max(0, visibleCount - interestTarget);
  const bucketTargets = {
    review: Math.round(interestTarget * 0.3),
    popular: Math.round(interestTarget * 0.2),
    best: Math.round(interestTarget * 0.2),
    newest: Math.round(interestTarget * 0.2),
    premium: 0
  };
  bucketTargets.premium = Math.max(1, interestTarget - bucketTargets.review - bucketTargets.popular - bucketTargets.best - bucketTargets.newest);
  const sortByStable = (itemsToSort, valueGetter, salt) => [...itemsToSort].sort((a, b) => valueGetter(b) - valueGetter(a) || deterministicHash(`${salt}-${a.id}`) - deterministicHash(`${salt}-${b.id}`));
  const buckets = {
    review: sortByStable(interestPool, (item) => item.reviewCount ?? 0, "review"),
    popular: sortByStable(interestPool, (item) => item.orderCount ?? 0, "popular"),
    best: sortByStable(interestPool, (item) => item.repurchaseCount ?? 0, "best"),
    newest: sortByStable(interestPool, (item) => parseIsoDateScore(item.createdAt), "newest"),
    premium: sortByStable(interestPool, (item) => (item.isPremium ? 1e5 : 0) + (item.reviewCount ?? 0), "premium")
  };
  const makeRepeated = (source, count, bucket) => Array.from({ length: Math.max(0, count) }, (_, index) => ({
    ...source[index % source.length],
    recommendationBucket: bucket
  }));
  const preparedBuckets = {
    review: makeRepeated(buckets.review.length ? buckets.review : interestPool, bucketTargets.review, "관심·리뷰다수"),
    popular: makeRepeated(buckets.popular.length ? buckets.popular : interestPool, bucketTargets.popular, "관심·인기"),
    best: makeRepeated(buckets.best.length ? buckets.best : interestPool, bucketTargets.best, "관심·베스트"),
    newest: makeRepeated(buckets.newest.length ? buckets.newest : interestPool, bucketTargets.newest, "관심·신규"),
    premium: makeRepeated(buckets.premium.length ? buckets.premium : interestPool, bucketTargets.premium, "관심·고급화")
  };
  const randomPool = [...nonInterestPool].sort((a, b) => deterministicHash(`random-${a.id}`) - deterministicHash(`random-${b.id}`));
  const randomSelections = makeRepeated(randomPool.length ? randomPool : normalizedItems, nonInterestTarget, "랜덤");
  const interestSequence = [];
  const bucketOrder = ["review", "popular", "best", "newest", "premium"];
  const cursors = { review: 0, popular: 0, best: 0, newest: 0, premium: 0 };
  while (interestSequence.length < interestTarget) {
    let pushed = false;
    for (const bucketKey of bucketOrder) {
      const bucket = preparedBuckets[bucketKey];
      const cursor = cursors[bucketKey];
      if (cursor < bucket.length) {
        interestSequence.push(bucket[cursor]);
        cursors[bucketKey] += 1;
        pushed = true;
        if (interestSequence.length >= interestTarget) break;
      }
    }
    if (!pushed) break;
  }
  const finalItems = [];
  const usedIds = /* @__PURE__ */ new Set();
  let interestIndex = 0;
  let randomIndex = 0;
  for (let index = 0; index < visibleCount; index += 1) {
    const shouldUseRandom = (index + 1) % 5 === 0 && randomSelections[randomIndex] || !interestSequence[interestIndex];
    let picked = shouldUseRandom ? randomSelections[randomIndex++] : interestSequence[interestIndex++];
    while (picked && usedIds.has(picked.id)) {
      picked = shouldUseRandom ? randomSelections[randomIndex++] : interestSequence[interestIndex++];
    }
    if (!picked) break;
    usedIds.add(picked.id);
    finalItems.push({ ...picked, feedIndex: finalItems.length });
  }
  const uniqueFallbackPool = [
    ...interestSequence,
    ...randomSelections,
    ...normalizedItems.map((item) => ({ ...item, recommendationBucket: "기본" }))
  ];
  for (const fallback of uniqueFallbackPool) {
    if (finalItems.length >= visibleCount) break;
    if (usedIds.has(fallback.id)) continue;
    usedIds.add(fallback.id);
    finalItems.push({ ...fallback, feedIndex: finalItems.length });
  }
  return finalItems;
}
function rankHomeFeedItems({ items, keywordSignalMap, followedTopicKeywords, savedFeedIds, keyword }) {
  const loweredKeyword = keyword.trim().toLowerCase();
  const filtered = !loweredKeyword ? items : items.filter((item) => `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase().includes(loweredKeyword));
  const ranked = filtered.map((item, idx) => {
    const content = `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase();
    const matchedSignalScore = Array.from(keywordSignalMap.entries()).reduce((sum, [token, score]) => sum + (content.includes(token) ? score : 0), 0);
    const freshnessMinutes = parseRelativeMinutes(item.postedAt);
    const freshnessScore = Math.max(0, 34 - Math.min(freshnessMinutes / 15, 34));
    const followScore = followedTopicKeywords.some((token) => content.includes(token)) ? 16 : 0;
    const savedScore = savedFeedIds.includes(item.id) ? 22 : 0;
    const popularityScore = Math.min(24, item.likes / 28 + item.comments / 8 + (item.views ?? 0) / 500);
    const mediaBoost = item.type === "video" ? 6 : 0;
    const nicheBoost = /딜도|바이브|본디지|패들|케인|젤|세정|보관|입문|리뷰|신상품|브랜드|추천/.test(content) ? 5 : 0;
    const explorationScore = deterministicHash(`home-${item.id}-${item.title}`) % 100 < 6 ? 8 : 0;
    const recencyPenalty = freshnessMinutes >= 1440 ? 6 : 0;
    return { ...item, sortScore: matchedSignalScore + freshnessScore + followScore + savedScore + popularityScore + mediaBoost + nicheBoost + explorationScore - recencyPenalty + (filtered.length - idx) * 1e-3 };
  });
  ranked.sort((a, b) => (b.sortScore ?? 0) - (a.sortScore ?? 0) || (b.views ?? 0) - (a.views ?? 0) || b.likes - a.likes);
  return ranked;
}
function buildFreshFeedItemFromTemplate(template, nextId, order) {
  const freshnessLabels = ["방금", "1분 전", "2분 전", "3분 전", "4분 전"];
  const badgeTitles = ["최신 관심 피드", "새 추천 피드", "실시간 관심 카드"];
  const extraCopy = [
    "관심 키워드와 최근 반응을 반영해 새로 추천된 피드입니다.",
    "최근 업로드 흐름과 저장 데이터를 반영한 최신 피드입니다.",
    "지금 보고 있는 관심사와 가까운 항목을 우선 노출한 새 피드입니다."
  ];
  const nextTitle = `${template.title} · ${badgeTitles[order % badgeTitles.length]}`;
  const nextCaptionBase = template.caption.endsWith(".") || template.caption.endsWith("!") || template.caption.endsWith("?") ? template.caption : `${template.caption}.`;
  return {
    ...template,
    id: nextId,
    title: nextTitle,
    caption: `${nextCaptionBase} ${extraCopy[order % extraCopy.length]}`,
    likes: template.likes + 12 + order * 7,
    comments: template.comments + 1 + order % 3,
    reposts: (template.reposts ?? 0) + 1 + order,
    views: typeof template.views === "number" ? template.views + 90 + order * 65 : void 0,
    postedAt: freshnessLabels[order % freshnessLabels.length]
  };
}
const askProfiles = [
  { id: 1, name: "adult official", headline: "브랜드/운영 통합 계정", intro: "스토리와 피드를 통해 정보를 공유하고 질문을 받는 홈 프로필입니다.", highlight: "답변이 공개되면 홈 피드 카드로 다시 노출됩니다." },
  { id: 2, name: "seller studio", headline: "상품 큐레이션 셀러", intro: "추천 상품, 사용 팁, 후기형 피드를 올리는 셀러 계정입니다.", highlight: "익명 또는 닉네임 기반 질문을 받을 수 있습니다." },
  { id: 3, name: "care lab", headline: "위생/보관 큐레이터", intro: "보관 루틴, 관리 팁, FAQ를 중심으로 피드를 운영합니다.", highlight: "질문 화면 상단에 프로필 요약과 질문 입력영역이 함께 보입니다." }
];
const shopCategories = [];
const generatedProductCategories = ["딜도", "바이브레이터", "러브젤", "플러그", "케어 키트", "패들"];
const generatedProductBadges = ["추천", "베스트", "신규", "인기", "테스트", "리뷰다수"];
const productsSeed = [
  { id: 1, category: "딜도", name: "슬림 입문 딜도", subtitle: "초보자용 실리콘 라인", price: "₩18,000", badge: "인기", reviewCount: 184, thumbnailUrl: "/generated/shop/dildo.png" },
  { id: 2, category: "바이브레이터", name: "저소음 바이브레이터", subtitle: "데일리 사용감 중심", price: "₩29,000", badge: "베스트", reviewCount: 266, thumbnailUrl: "/generated/shop/vibe.png" },
  { id: 3, category: "본디지 테이프", name: "본디지 테이프 스타터", subtitle: "입문형 패키지", price: "₩14,900", badge: "추천", reviewCount: 113, thumbnailUrl: "/generated/shop/bondage_tape.png" },
  { id: 4, category: "패들", name: "소프트 패들", subtitle: "초보자 선호 라인", price: "₩24,500", badge: "리뷰다수", reviewCount: 98, thumbnailUrl: "/generated/shop/paddle.png" },
  { id: 5, category: "케인", name: "플렉시블 케인", subtitle: "가벼운 탄성 타입", price: "₩32,000", badge: "신규", reviewCount: 76, thumbnailUrl: "/generated/shop/cane.png" },
  { id: 6, category: "러브젤", name: "워터 베이스 러브젤", subtitle: "저자극 케어 라인", price: "₩12,900", badge: "재구매", reviewCount: 241, thumbnailUrl: "/generated/shop/lubricant.png" },
  { id: 7, category: "플러그", name: "실리콘 플러그", subtitle: "보관이 쉬운 구조", price: "₩21,000", badge: "입문", reviewCount: 134, thumbnailUrl: "/generated/shop/plug.png" },
  { id: 8, category: "마사지기", name: "프리미엄 마사지기", subtitle: "조용한 모터 라인", price: "₩39,000", badge: "프리미엄", reviewCount: 157, thumbnailUrl: "/generated/shop/massager.png" },
  { id: 9, category: "케어 키트", name: "세정·보관 케어 키트", subtitle: "위생 루틴 번들", price: "₩17,500", badge: "안전", reviewCount: 203, thumbnailUrl: "/generated/shop/carekit.png" },
  ...Array.from({ length: 30 }, (_, index) => ({
    id: 10 + index,
    category: generatedProductCategories[index % generatedProductCategories.length],
    name: `랜덤 테스트 상품 ${index + 1}`,
    subtitle: `${generatedProductCategories[index % generatedProductCategories.length]} 카테고리 무한 스크롤 테스트용 샘플 버튼`,
    price: `₩${(15900 + index * 1300).toLocaleString()}`,
    badge: generatedProductBadges[index % generatedProductBadges.length],
    reviewCount: 60 + index * 5,
    thumbnailUrl: null
  }))
];
const skuPolicySeed = [
  { category: "위생/보관", grade: "허용", note: "보관함, 세척도구, 보호파우치, 커버류 중심으로 시작" },
  { category: "바디/케어", grade: "허용", note: "일반 케어/마사지/관리 용품 중심" },
  { category: "입문 액세서리", grade: "보류", note: "표현 수위와 외형을 검수 후 승인" },
  { category: "역할/취향 소품", grade: "보류", note: "노골적 표현, 폭력 오인, 신체손상 우려 요소는 별도 검수" },
  { category: "촬영/노출 유도 상품", grade: "금지", note: "사진/영상 촬영 유도, 공개 노출 목적 상품은 금지" },
  { category: "대여/숙박/현장서비스", grade: "금지", note: "오프라인 만남·장소·서비스 연결성 높은 품목은 금지" },
  { category: "의료효능 오인 상품", grade: "금지", note: "치료·효능·질병 개선을 표방하는 표현 금지" },
  { category: "미성년 오인/교복/연령 연상 콘셉트", grade: "금지", note: "미성년 연상 요소는 금지" }
];
const dmRuleNoticeItems = [
  "오프라인 만남 제안 금지",
  "외부 연락처 교환 금지",
  "사진/영상 전송 금지",
  "반복 접촉 금지"
];
const forumStarterUsers = [
  { id: 301, name: "boundary_note", role: "경계설정 대화", topic: "경계설정 이야기", intro: "그룹방에서 대화하던 내용을 1:1로 차분히 이어가고 싶을 때 요청할 수 있습니다.", followsMe: true },
  { id: 302, name: "starter_helper", role: "초보 고민", topic: "초보 고민", intro: "입문자용 안전 질문과 기본 커뮤니케이션 기준을 함께 정리합니다.", followsMe: false },
  { id: 303, name: "daily_wave", role: "일상 대화", topic: "일상 대화", intro: "취향 이야기보다 일상과 관심사 위주로 대화를 시작하는 예시 계정입니다.", followsMe: true },
  { id: 304, name: "care_lab", role: "제품 이야기", topic: "제품 이야기", intro: "제품 사용/보관/세척 관련 질문을 먼저 나눈 뒤 상호 팔로우 시 DM 요청이 가능합니다.", followsMe: true },
  { id: 305, name: "role_balance", role: "역할 고민", topic: "역할 고민", intro: "역할 고민은 가능하지만, 사람 찾기·만남 제안·연락처 교환·사진 전송은 계속 금지됩니다.", followsMe: false }
];
const communityCategories = ["공지", "정보", "후기", "토론", "이벤트"];
const communitySeed = [
  {
    id: 9001,
    board: "커뮤",
    category: "테스트",
    title: "테스트",
    summary: "스스로에 대해 알아 가는 시간을 가져보세요.",
    meta: "운영팀 · 12분 전",
    audience: "공식",
    sortScore: 200,
    pinned: true,
    path: "소통 > 커뮤 > 테스트",
    detailTitle: "성향 탐색 테스트",
    detailBody: [
      "이 화면은 7점 척도로 답변하는 오리지널 성향 탐색 테스트입니다.",
      "주도/수용, 봉사, 규칙 선호, 감각 자극, 돌봄, 일상 친밀감 같은 축을 함께 확인하도록 구성했습니다.",
      "결과는 의료적 진단이 아니라 자기이해와 대화 정리를 위한 참고용 요약으로 제공합니다."
    ],
    contentType: "test"
  },
  { id: 1, board: "커뮤", category: "공지", title: "안전모드 기준 및 커뮤니티 운영 원칙", summary: "앱 공개영역에서 허용되는 표현과 금지되는 표현을 한 번에 정리합니다.", meta: "관리자 · 1시간 전", audience: "공식", sortScore: 100, path: "소통 > 커뮤 > 공지" },
  { id: 2, board: "커뮤", category: "정보", title: "익명포장 SOP와 반품 회수 체크포인트", summary: "판매자/고객 모두 확인할 수 있는 실무형 요약 카드입니다.", meta: "운영팀 · 2시간 전", audience: "운영", sortScore: 92, path: "소통 > 커뮤 > 정보" },
  { id: 3, board: "후기", category: "후기", title: "사진 피드형 상품 리뷰 구성 예시", summary: "사진·짧은 영상·요약문이 결합된 소통 공간 예시입니다.", meta: "brand_note · 4시간 전", audience: "회원", sortScore: 88, path: "소통 > 후기 > 상품 후기" },
  { id: 4, board: "포럼", category: "토론", title: "신규 카테고리 승인 대기 상품 현황", summary: "판매자센터에서 확인 중인 상품들을 카테고리별로 묶어서 보여줍니다.", meta: "seller_studio · 26.4.18", audience: "회원", sortScore: 81, path: "소통 > 포럼 > 토론" },
  { id: 5, board: "포럼", category: "이벤트", title: "앱 심사 safe UI 점검 이벤트", summary: "모바일 노출 점검과 신고 흐름 확인용 공지입니다.", meta: "프로덕트팀 · 26.4.18", audience: "공식", sortScore: 90, path: "소통 > 포럼 > 이벤트" },
  { id: 6, board: "커뮤", category: "공지", title: "이용약관 및 개인정보 처리방침 안내", summary: "앱 내 약관, 개인정보 처리방침, 청소년 보호정책, 환불정책은 알림 > 공지사항과 커뮤니티 공지 카테고리에서 확인할 수 있습니다.", meta: "운영공지 · 3시간 전", audience: "공식", sortScore: 99, path: "소통 > 커뮤 > 공지" },
  { id: 7, board: "포럼", category: "공지", title: "청소년 보호정책 및 제한 웹 포럼 운영 기준", summary: "앱 공개영역에서는 랜덤채팅을 열지 않고, 제한 웹 영역에서만 안전·동의·세척/보관 정보 포럼을 승인제로 운영합니다.", meta: "안전운영팀 · 26.4.18", audience: "공식", sortScore: 97, path: "소통 > 포럼 > 공지" },
  { id: 8, board: "커뮤", category: "정보", title: "구매자 활성화를 위한 앱 내 소통 기능 10선", summary: "안전수칙 토론, 초보 Q&A, 익명 고민상담, 주간 토크방처럼 법적 리스크가 낮은 소통 구조를 정리했습니다.", meta: "기획팀 · 14시간 전", audience: "운영", sortScore: 84, path: "소통 > 커뮤 > 정보" }
];
const notificationSeed = [
  { id: 1, section: "공지", category: "정책", title: "앱 공지사항", body: "앱 정책, 필수 문서, 서비스 업데이트 공지를 알림 목록에서 빠르게 확인할 수 있도록 정리했습니다.", meta: "정책 공지", author: "운영팀", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 2, section: "공지", category: "업데이트", title: "채팅 운영기준 업데이트", body: "성향/관심사 그룹대화는 허용하되, 1:1 대화는 상호 수락 이후에만 열리도록 기준을 정리했습니다.", meta: "앱 업데이트", author: "프로덕트팀", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 7, section: "공지", category: "운영", title: "홈 검색 구조 개편 안내", body: "상단 검색 버튼을 누르면 탭별 결과 화면으로 바로 전환되는 구조로 개편되었습니다.", meta: "운영 공지", author: "서비스운영", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
  { id: 10, section: "이벤트", category: "이벤트", title: "이번 주 기획전 오픈", body: "홈과 쇼핑 화면에서 이번 주 기획전 상품과 할인 정보를 바로 확인할 수 있습니다.", meta: "이벤트 소식", author: "이벤트팀", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 11, section: "이벤트", category: "쿠폰", title: "앱 전용 쿠폰 지급", body: "앱 전용 할인 쿠폰이 발급되었습니다. 사용 가능 상품은 쇼핑 홈 추천 영역에서 우선 노출됩니다.", meta: "혜택 안내", author: "혜택운영", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
  { id: 12, section: "이벤트", category: "기획전", title: "브랜드 기획전 종료 임박", body: "관심 키워드와 맞는 브랜드 기획전이 곧 종료됩니다. 마감 전에 상세를 확인하세요.", meta: "기획전 안내", author: "브랜드기획", postedAt: "2026-04-17", ctaLabel: "상세 보기" },
  { id: 3, section: "주문", category: "주문", title: "제품 신청접수 완료", body: "주문번호 A-240412-001 상품 신청이 접수되었고 판매자 확인 단계로 이동했습니다.", meta: "쇼핑 주문", author: "주문시스템", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 4, section: "주문", category: "배송", title: "배송 상태 변경", body: "익명포장 배송 건이 택배사에 인계되었습니다. 상세 추적은 주문 목록에서 확인하세요.", meta: "배송 알림", author: "배송센터", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
  { id: 8, section: "주문", category: "교환/환불", title: "환불 요청 접수", body: "환불 요청이 정상 접수되었으며 판매자 검수 후 처리 상태가 갱신됩니다.", meta: "주문 처리", author: "정산지원", postedAt: "2026-04-17", ctaLabel: "상세 보기" },
  { id: 13, section: "주문", category: "배송", title: "배송 준비 완료", body: "주문번호 A-240412-001 건이 포장 완료되어 출고 대기 상태입니다.", meta: "출고 준비", author: "물류센터", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 14, section: "주문", category: "배송", title: "배송 완료", body: "주문하신 상품 배송이 완료되었습니다. 필요 시 후기/상품평을 남겨주세요.", meta: "배송 완료", author: "배송센터", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
  { id: 15, section: "주문", category: "취소", title: "주문 취소 승인", body: "요청하신 주문 취소가 승인되어 결제 취소 절차가 진행 중입니다.", meta: "주문 처리", author: "주문시스템", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
  { id: 16, section: "주문", category: "반품", title: "반품 회수 접수", body: "반품 회수 요청이 등록되었고 택배사 수거 일정이 배정되었습니다.", meta: "반품 처리", author: "회수지원", postedAt: "2026-04-17", ctaLabel: "상세 보기" },
  { id: 17, section: "주문", category: "교환", title: "교환 재발송 준비중", body: "교환 승인 건의 대체 상품이 재포장 단계에 들어갔습니다.", meta: "교환 처리", author: "물류센터", postedAt: "2026-04-17", ctaLabel: "상세 보기" },
  { id: 5, section: "소통", category: "댓글", title: "커뮤니티 댓글 알림", body: "공지 카테고리 게시글에 새 댓글이 등록되었습니다.", meta: "커뮤니티", author: "커뮤니티봇", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 6, section: "소통", category: "채팅", title: "그룹대화/1:1 운영 안내", body: "앱에서는 성향/관심사 기반 그룹대화를 허용하되, 외부 연락처 교환·오프라인 제안·사진/영상 전송은 금지하고 1:1은 상호 수락 후에만 허용합니다.", meta: "채팅 안내", author: "안전운영팀", postedAt: "2026-04-18", ctaLabel: "상세 보기" },
  { id: 9, section: "소통", category: "질문", title: "질문 답변 등록 완료", body: "질문 카드에 새로운 답변이 등록되어 프로필 질문 탭에서 바로 확인할 수 있습니다.", meta: "질문 알림", author: "Q&A봇", postedAt: "2026-04-17", ctaLabel: "상세 보기" },
  { id: 18, section: "소통", category: "메세지", title: "내 계정으로 새 메세지 도착", body: "상호수락 1:1 대화방에 새 메세지가 도착했습니다.", meta: "메세지 알림", author: "채팅시스템", postedAt: "2026-04-19", unread: true, ctaLabel: "상세 보기" },
  { id: 19, section: "소통", category: "후기/상품평", title: "후기 등록 요청", body: "배송 완료 상품에 대해 후기 또는 상품평을 남길 수 있습니다.", meta: "리뷰 알림", author: "리뷰봇", postedAt: "2026-04-18", ctaLabel: "상세 보기" }
];
const threadSeed = [
  { id: 101, name: "match_onyu", purpose: "상호수락 1:1", preview: "오늘 저녁에 이어서 이야기 나눠도 괜찮을까요?", time: "오전 9:41", unread: 2, avatar: "온", kind: "개인", favorite: true, status: "수락완료" },
  { id: 102, name: "soft_wave", purpose: "상호수락 1:1", preview: "서로 편한 시간대부터 맞춰보고 천천히 대화해요.", time: "오전 8:12", unread: 1, avatar: "소", kind: "개인", favorite: true, status: "활성" },
  { id: 103, name: "운영 문의", purpose: "상품/운영 문의", preview: "판매 가능 상품군 검수 기준을 다시 확인 부탁드립니다.", time: "어제", unread: 2, avatar: "운", kind: "개인", favorite: true, status: "고정" },
  { id: 104, name: "구매자 지원", purpose: "구매자 지원", preview: "장바구니에 담긴 옵션 변경이 가능한지 문의드립니다.", time: "어제", unread: 0, avatar: "구", kind: "개인" },
  { id: 105, name: "정산 지원", purpose: "정산/환불", preview: "이번 주 환불 건 정산 반영 일정을 공유드립니다.", time: "4월 8일", unread: 3, avatar: "정", kind: "개인", favorite: true },
  { id: 106, name: "주문센터", purpose: "쇼핑 주문", preview: "주문번호 A-240412-001 건이 오늘 출고 예정입니다.", time: "4월 7일", unread: 0, avatar: "주", kind: "개인" },
  { id: 107, name: "자유대화 라운지", purpose: "단체", preview: "오늘은 각자 루틴 정리 팁을 한 가지씩 공유해 주세요.", time: "4월 6일", unread: 4, avatar: "자", kind: "단체", favorite: true },
  { id: 108, name: "일상/취미 톡", purpose: "단체", preview: "주말에 본 영화나 콘텐츠 추천을 이어서 적어봐요.", time: "4월 5일", unread: 0, avatar: "일", kind: "단체" }
];
const archivedThreadSeed = [
  { id: 109, name: "브랜드 문의", purpose: "상품/운영 문의", preview: "기획전 배너 노출 일정과 적용 범위를 확인해 주세요.", time: "4월 4일", unread: 0, avatar: "브", kind: "개인" },
  { id: 110, name: "배송 알림", purpose: "쇼핑 주문", preview: "주문한 상품이 집하 처리되어 익명포장으로 이동 중입니다.", time: "4월 3일", unread: 0, avatar: "배", kind: "개인" },
  { id: 111, name: "refund check", purpose: "정산/환불", preview: "부분 환불 요청 내역을 다시 확인해 주세요.", time: "4월 2일", unread: 0, avatar: "환", kind: "개인" },
  { id: 112, name: "seller studio", purpose: "구매자 지원", preview: "옵션 구성 변경 여부를 안내드립니다.", time: "4월 1일", unread: 0, avatar: "셀", kind: "개인" },
  { id: 113, name: "daily talk", purpose: "단체", preview: "오늘의 일상/취미 대화방 새 주제가 올라왔습니다.", time: "3월 31일", unread: 0, avatar: "일", kind: "단체" },
  { id: 114, name: "care_lab", purpose: "단체", preview: "세척 루틴 체크리스트를 방 상단 공지에 정리해두었습니다.", time: "3월 30일", unread: 0, avatar: "케", kind: "단체" },
  { id: 115, name: "review crew", purpose: "단체", preview: "이번 주 실사용 후기 묶음을 공유합니다.", time: "3월 29일", unread: 0, avatar: "리", kind: "단체" },
  { id: 116, name: "consent guide", purpose: "상호수락 1:1", preview: "동의/합의 기본 문장을 먼저 맞춰보는 대화입니다.", time: "3월 28일", unread: 0, avatar: "동", kind: "개인" },
  { id: 117, name: "quiet_bridge", purpose: "상호수락 1:1", preview: "대화 속도는 천천히 맞추면서 이어가도 괜찮습니다.", time: "3월 27일", unread: 0, avatar: "브", kind: "개인" },
  { id: 118, name: "포럼 소식", purpose: "단체", preview: "포럼 인기 방 순위가 갱신되었습니다.", time: "3월 26일", unread: 0, avatar: "포", kind: "단체" },
  { id: 119, name: "habit room", purpose: "단체", preview: "취미/일상 주제 대화방은 최근 대화부터 순서대로 보여집니다.", time: "3월 25일", unread: 0, avatar: "취", kind: "단체" },
  { id: 120, name: "archive room", purpose: "단체", preview: "과거 공지 대화가 보관되었습니다.", time: "3월 24일", unread: 0, avatar: "보", kind: "단체" },
  { id: 121, name: "purchase care", purpose: "구매자 지원", preview: "문의 남겨주신 옵션 재입고 일정을 공유드립니다.", time: "3월 23일", unread: 0, avatar: "구", kind: "개인" },
  { id: 122, name: "order sync", purpose: "쇼핑 주문", preview: "주문/환불 동기화 기록이 마무리되었습니다.", time: "3월 22일", unread: 0, avatar: "오", kind: "개인" },
  { id: 123, name: "shop ops", purpose: "상품/운영 문의", preview: "상품 승인 기준 변경안이 적용되었습니다.", time: "3월 21일", unread: 0, avatar: "상", kind: "개인" },
  { id: 124, name: "settlement desk", purpose: "정산/환불", preview: "이번 달 정산 리포트 초안이 등록되었습니다.", time: "3월 20일", unread: 0, avatar: "정", kind: "개인" },
  { id: 125, name: "cozy_loop", purpose: "상호수락 1:1", preview: "대화 규칙을 먼저 확인하고 천천히 이어갈게요.", time: "3월 19일", unread: 0, avatar: "코", kind: "개인" },
  { id: 126, name: "late_sunset", purpose: "상호수락 1:1", preview: "답장 속도는 느려도 괜찮으니 편할 때 이야기 주세요.", time: "3월 18일", unread: 0, avatar: "선", kind: "개인" },
  { id: 127, name: "안전수칙 체크", purpose: "단체", preview: "오늘은 신고 대응 체크리스트를 공유합니다.", time: "3월 17일", unread: 0, avatar: "안", kind: "단체" },
  { id: 128, name: "자유수다 보관", purpose: "단체", preview: "지난주 자유대화 하이라이트를 정리해 두었습니다.", time: "3월 16일", unread: 0, avatar: "자", kind: "단체" },
  { id: 129, name: "구매자 케어", purpose: "구매자 지원", preview: "구매 전 문의 응답시간이 평균 10분대로 단축되었습니다.", time: "3월 15일", unread: 0, avatar: "케", kind: "개인" },
  { id: 130, name: "주문 확인", purpose: "쇼핑 주문", preview: "주문번호 A-240401-002 결제 상태가 완료로 바뀌었습니다.", time: "3월 14일", unread: 0, avatar: "주", kind: "개인" },
  { id: 131, name: "brand concierge", purpose: "상품/운영 문의", preview: "브랜드 페이지 노출 순서를 조정할 예정입니다.", time: "3월 13일", unread: 0, avatar: "브", kind: "개인" },
  { id: 132, name: "refund queue", purpose: "정산/환불", preview: "이번 주 검수 완료 건이 순차적으로 처리됩니다.", time: "3월 12일", unread: 0, avatar: "환", kind: "개인" },
  { id: 133, name: "soft_note", purpose: "상호수락 1:1", preview: "자기소개를 짧게 남겨두었으니 편할 때 읽어주세요.", time: "3월 11일", unread: 0, avatar: "노", kind: "개인" },
  { id: 134, name: "forum helper", purpose: "단체", preview: "포럼방 안내문은 입장 직후 시스템 메시지로 노출됩니다.", time: "3월 10일", unread: 0, avatar: "도", kind: "단체" },
  { id: 135, name: "weekend room", purpose: "단체", preview: "주말 자유대화방의 최근 메시지를 불러왔습니다.", time: "3월 9일", unread: 0, avatar: "주", kind: "단체" },
  { id: 136, name: "member support", purpose: "구매자 지원", preview: "회원 문의에 대한 답변 초안이 저장되었습니다.", time: "3월 8일", unread: 0, avatar: "멤", kind: "개인" },
  { id: 137, name: "warehouse note", purpose: "쇼핑 주문", preview: "재고 동기화 이후 주문 가능 수량이 갱신되었습니다.", time: "3월 7일", unread: 0, avatar: "창", kind: "개인" },
  { id: 138, name: "mutual_check", purpose: "상호수락 1:1", preview: "서로 불편한 주제는 미리 제외하고 이야기해 봐요.", time: "3월 6일", unread: 0, avatar: "체", kind: "개인" },
  { id: 139, name: "role board", purpose: "단체", preview: "관계/역할 포럼의 이번 주 공통 질문이 올라왔습니다.", time: "3월 5일", unread: 0, avatar: "역", kind: "단체" },
  { id: 140, name: "safety digest", purpose: "단체", preview: "안전수칙 요약본이 새로운 버전으로 교체되었습니다.", time: "3월 4일", unread: 0, avatar: "수", kind: "단체" }
];
const incomingChatRequestSeed = [
  {
    id: 901,
    name: "velvet_room",
    purpose: "상호수락 1:1",
    preview: "채팅 요청을 보냈습니다. 수락하면 일반 채팅 목록으로 이동합니다.",
    requestText: "관심사가 비슷해서 먼저 인사드려요. 괜찮으시면 수락 후 천천히 이야기 나누고 싶습니다.",
    time: "방금",
    avatar: "벨"
  },
  {
    id: 902,
    name: "calm_signal",
    purpose: "상호수락 1:1",
    preview: "답장은 수락 후에만 가능합니다.",
    requestText: "프로필을 보고 먼저 채팅 요청 남깁니다. 편하실 때 확인 부탁드립니다.",
    time: "오전 10:24",
    avatar: "캄"
  },
  {
    id: 903,
    name: "soft_anchor",
    purpose: "상호수락 1:1",
    preview: "대화 규칙을 확인한 뒤 수락해 주세요.",
    requestText: "상호 존중 기준으로 천천히 대화해 보고 싶어서 요청드립니다.",
    time: "어제",
    avatar: "앵"
  }
];
const createThreadRoomSeed = (thread) => {
  const baseLead = thread.kind === "단체" ? `${thread.name} 방에 연결된 채팅방입니다.
ㅡㅡㅡ주의사항ㅡㅡㅡ
- 외부 연락처 교환은 지양하며, 사진 / 영상 전송은 제한됩니다.
- 금전 거래를 통한 만남, 음란물 유포는 절대금지입니다.
- 마약, 총기류 등 불법 거래는 절대금지입니다.` : `${thread.name}님과 연결된 채팅방입니다.
ㅡㅡㅡ주의사항ㅡㅡㅡ
- 외부 연락처 교환은 지양하며, 사진 / 영상 전송은 제한됩니다.
- 금전 거래를 통한 만남, 음란물 유포는 절대금지입니다.
- 마약, 총기류 등 불법 거래는 절대금지입니다.`;
  const now = Date.now();
  if (thread.status === "요청전송") {
    return [
      { id: thread.id * 100 + 1, threadId: thread.id, author: "system", text: baseLead, meta: "안내", system: true, createdAt: now - 6 * 6e4 },
      { id: thread.id * 100 + 2, threadId: thread.id, author: "system", text: "채팅 요청을 먼저 보낸 상태입니다. 상대방이 수락해야 답변이 가능합니다.", meta: "요청 대기", system: true, createdAt: now - 4 * 6e4 },
      { id: thread.id * 100 + 3, threadId: thread.id, author: "나", text: thread.preview, meta: thread.time, mine: true, createdAt: now - 2 * 6e4, contentKind: "text" }
    ];
  }
  if (thread.status === "요청받음") {
    return [
      { id: thread.id * 100 + 1, threadId: thread.id, author: "system", text: baseLead, meta: "안내", system: true, createdAt: now - 6 * 6e4 },
      { id: thread.id * 100 + 2, threadId: thread.id, author: "system", text: "상대방이 먼저 보낸 요청입니다. 이 방에서 첫 메시지를 보내면 채팅이 수락되고 일반 채팅 목록으로 이동합니다.", meta: "요청 도착", system: true, createdAt: now - 4 * 6e4 },
      { id: thread.id * 100 + 3, threadId: thread.id, author: thread.name, text: thread.preview, meta: thread.time, mine: false, createdAt: now - 2 * 6e4, contentKind: "text" }
    ];
  }
  const supportLine = thread.kind === "단체" ? `${thread.purpose} 주제로 최근 대화가 상단부터 정렬됩니다.` : `${thread.purpose} 기준으로 연결된 채팅방이며, 필요한 경우 답장·공유·공지 기능을 이어서 사용할 수 있습니다.`;
  return [
    { id: thread.id * 100 + 1, threadId: thread.id, author: "system", text: baseLead, meta: "안내", system: true, createdAt: now - 6 * 6e4 },
    { id: thread.id * 100 + 2, threadId: thread.id, author: thread.name, text: thread.preview, meta: thread.time, mine: false, createdAt: now - 4 * 6e4, contentKind: "text" },
    { id: thread.id * 100 + 3, threadId: thread.id, author: "나", text: supportLine, meta: "지금", mine: true, createdAt: now - 2 * 6e4, contentKind: "text" }
  ];
};
const chatAvatarPalette = [
  ["#2b1120", "#ff5ea9"],
  ["#13253f", "#63b3ff"],
  ["#143028", "#5eead4"],
  ["#32180f", "#fbbf24"],
  ["#2c173d", "#c084fc"]
];
const buildChatAvatarDataUri = (seed) => {
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [from, to] = chatAvatarPalette[Math.abs(hash) % chatAvatarPalette.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="avatar">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="32" fill="url(#g)" />
      <circle cx="32" cy="24" r="12" fill="rgba(255,255,255,0.96)" />
      <path d="M14 54c2.5-10 10.5-17 18-17s15.5 7 18 17" fill="rgba(255,255,255,0.96)" />
    </svg>
  `.replace(/\s+/g, " ").trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
const CHAT_REACTION_OPTIONS = [
  { key: "heart", label: "하트", symbol: "♥", className: "heart" },
  { key: "like", label: "좋아요", symbol: "👍", className: "like" },
  { key: "check", label: "체크", symbol: "✓", className: "check" },
  { key: "smile", label: "웃음", symbol: "☺", className: "smile" },
  { key: "surprised", label: "놀람", symbol: "!", className: "surprised" },
  { key: "sad", label: "슬픔", symbol: "☹", className: "sad" }
];
const CHAT_QUICK_SHARE_ITEMS = [
  { key: "photo", label: "사진첨부", emoji: "🖼" },
  { key: "map", label: "지도공유", emoji: "📍" },
  { key: "file", label: "파일첨부", emoji: "📎" },
  { key: "profile", label: "프로필공유", emoji: "👤" }
];
const CHAT_PICKER_TABS = ["이모티콘", "스티커", "GIF"];
const CHAT_PICKER_LIBRARY = {
  "이모티콘": [
    { key: "emoji-1", label: "이모티콘1", items: ["😀", "😄", "😊", "😍", "😎", "😉", "🤗", "🥰", "😘", "🤍", "💗", "💜", "🔥", "✨", "🎉", "🙌"] },
    { key: "emoji-2", label: "이모티콘2", items: ["👍", "👌", "✌️", "👏", "🙏", "💯", "✅", "⭐", "🌙", "☀️", "🍀", "🎈", "🎵", "📍", "📎", "💌"] },
    { key: "emoji-3", label: "이모티콘3", items: ["🤔", "😮", "😢", "😭", "😡", "😴", "🤯", "🥺", "😇", "🤝", "🫶", "💋", "💪", "🎁", "🖤", "💫"] }
  ],
  "스티커": [
    { key: "sticker-1", label: "이모티콘1", items: ["러브곰 01", "러브곰 02", "러브곰 03", "러브곰 04", "러브곰 05", "러브곰 06"] },
    { key: "sticker-2", label: "이모티콘2", items: ["야옹이 01", "야옹이 02", "야옹이 03", "야옹이 04", "야옹이 05", "야옹이 06"] },
    { key: "sticker-3", label: "이모티콘3", items: ["말풍선 01", "말풍선 02", "말풍선 03", "말풍선 04", "말풍선 05", "말풍선 06"] }
  ],
  "GIF": [
    { key: "gif-1", label: "이모티콘1", items: ["하트 루프", "박수 루프", "반짝 루프", "체크 루프", "댄스 루프", "손흔들기 루프"] },
    { key: "gif-2", label: "이모티콘2", items: ["놀람 루프", "웃음 루프", "응원 루프", "엄지척 루프", "하이파이브 루프", "축하 루프"] },
    { key: "gif-3", label: "이모티콘3", items: ["달빛 루프", "별빛 루프", "하트빔 루프", "핑크웨이브 루프", "무드라이트 루프", "네온사인 루프"] }
  ]
};
const DEFAULT_CHAT_RECENT_PICKER_ITEMS = {
  "이모티콘": ["💗", "✨", "👍", "😊", "🔥", "🎉"],
  "스티커": ["러브곰 01", "야옹이 01", "말풍선 01"],
  "GIF": ["하트 루프", "박수 루프", "네온사인 루프"]
};
function formatChatMessageMeta(createdAt, edited) {
  if (!createdAt) return edited ? "방금 수정됨" : "방금";
  const diffMinutes = Math.max(0, Math.round((Date.now() - createdAt) / 6e4));
  const base = diffMinutes < 1 ? "방금" : diffMinutes < 60 ? `${diffMinutes}분 전` : `${Math.floor(diffMinutes / 60)}시간 전`;
  return edited ? `${base} · 수정됨` : base;
}
function formatChatMessageClock(createdAt) {
  if (!createdAt) return "지금";
  const date = new Date(createdAt);
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${hour}:${minute}`;
}
const forumRoomNoticeText = `<포럼방 안내사항>
 - 정보교류와 고민상담용이며, 만남/주선은 허용하지 않습니다.
 - 외부 연락처 교환 금지
 - 음란 사진/영상/파일 전송 금지
 - 금전 거래를 통한 만남 금지
 - 신고 접수 시 관리자 대화기록 확인 가능`;
const forumRoomSeed = [
  { id: 501, category: "자유대화", title: "자유대화 라운지", summary: "가벼운 안부와 앱 사용 경험을 부담 없이 나누는 포럼방입니다.", starter: "포럼 운영봇", participants: 18, latestAt: "방금", introMessage: "자유대화 라운지에 오신 것을 환영합니다. 규칙 범위 안에서 편하게 대화를 이어가세요." },
  { id: 502, category: "일상/취미", title: "퇴근 후 일상 메모", summary: "일상 루틴, 취미, 오늘 있었던 소소한 대화를 이어가는 방입니다.", starter: "daily mate", participants: 14, latestAt: "3분 전", introMessage: "오늘 있었던 일이나 취미 이야기를 자유롭게 남겨보세요." },
  { id: 503, category: "고민", title: "초보 고민 상담", summary: "입문 전 궁금했던 점과 조심해야 할 포인트를 차분히 묻고 답하는 방입니다.", starter: "starter helper", participants: 11, latestAt: "8분 전", introMessage: "처음이라 막막했던 고민을 한 문장씩 남겨주시면 함께 정리해드립니다." },
  { id: 504, category: "관계/역할", title: "관계 소통 체크인", summary: "관계 안에서의 기대치와 역할, 대화방식을 정리하는 주제형 포럼입니다.", starter: "role note", participants: 9, latestAt: "11분 전", introMessage: "서로 기대하는 소통 방식이나 경계에 대해 차분히 이야기해보세요." },
  { id: 505, category: "안전수칙", title: "안전수칙 체크포인트", summary: "동의, 위생, 보관, 신고 대응처럼 기본 안전수칙만 모아 공유하는 방입니다.", starter: "care lab", participants: 16, latestAt: "18분 전", introMessage: "기본 수칙과 체크리스트를 중심으로 정보만 정리하는 포럼방입니다." },
  { id: 506, category: "동의/합의/계약", title: "동의/합의 문장 정리", summary: "합의 전 확인해야 할 표현과 기록 방법을 사례형으로 나누는 포럼입니다.", starter: "consent guide", participants: 12, latestAt: "24분 전", introMessage: "동의와 합의는 구체적인 문장으로 남기는 것이 중요합니다. 기준 문장을 함께 정리해보세요." },
  { id: 507, category: "자유대화", title: "오늘의 수다", summary: "짧은 잡담과 앱 안에서 본 흥미로운 내용을 편하게 남기는 방입니다.", starter: "chat mate", participants: 7, latestAt: "41분 전", introMessage: "가벼운 수다도 좋지만, 앱 규칙과 운영 기준은 꼭 지켜주세요." },
  { id: 508, category: "일상/취미", title: "취미 공유 테이블", summary: "취미/루틴/콘텐츠 추천처럼 부담 없는 주제를 정리하는 포럼방입니다.", starter: "hobby note", participants: 10, latestAt: "1시간 전", introMessage: "최근 즐긴 취미나 루틴을 한 줄씩 나눠보세요." },
  { id: 509, category: "고민", title: "관계 고민 익명토크", summary: "상황을 간단히 적고 조언을 받는 고민 전용 포럼입니다.", starter: "mind care", participants: 13, latestAt: "2시간 전", introMessage: "구체적 신상정보 없이 고민 상황만 간단히 적어주세요." },
  { id: 510, category: "안전수칙", title: "보관/세척 정보교류", summary: "세척제, 건조, 보관 파우치 등 관리 루틴을 공유하는 정보방입니다.", starter: "clean mate", participants: 8, latestAt: "오늘", introMessage: "보관과 세척 중심의 정보만 정리하는 포럼방입니다." },
  { id: 511, category: "관계/역할", title: "관계 경계선 대화", summary: "거절 표현, 중단 신호, 서로의 경계선 정리를 돕는 대화방입니다.", starter: "boundary note", participants: 6, latestAt: "오늘", introMessage: "서로 불편하지 않은 선을 어떻게 정리할지 이야기해보세요." },
  { id: 512, category: "동의/합의/계약", title: "기록과 합의 체크", summary: "동의/합의 내용을 기록하는 방식과 주의점을 공유하는 포럼입니다.", starter: "record safe", participants: 5, latestAt: "오늘", introMessage: "중요한 합의일수록 구체적이고 명확한 기록이 필요합니다." }
];
const randomRoomSeed = [
  { id: 2001, title: "관계 역할 고민 라운지", category: "관계역할/고민", maxPeople: 6, currentPeople: 3, password: "", latestMessage: "역할 기대치와 대화 방식 차이를 편하게 나누는 방입니다." },
  { id: 2002, title: "동의/경계설정 오픈룸", category: "동의/경계설정", maxPeople: 8, currentPeople: 5, password: "1234", latestMessage: "동의 문장, 금지선, 사전 체크리스트를 함께 정리합니다." },
  { id: 2003, title: "퇴근 후 일상대화", category: "일상/취미", maxPeople: 5, currentPeople: 2, password: "", latestMessage: "가볍게 하루 있었던 일을 나누는 방입니다." },
  { id: 2004, title: "안전수칙 메모방", category: "안전수칙", maxPeople: 10, currentPeople: 7, password: "", latestMessage: "비동의 금지, 연락처 유도 금지, 외부 이동 금지 기준을 확인해요." },
  { id: 2005, title: "자유대화 라운지", category: "자유대화", maxPeople: 4, currentPeople: 1, password: "5678", latestMessage: "규칙 안에서 취향, 관심사, 일상 주제를 자유롭게 나눕니다." },
  { id: 2006, title: "관계 소통 체크인", category: "관계역할/고민", maxPeople: 6, currentPeople: 4, password: "", latestMessage: "서로 기대하는 커뮤니케이션 방식을 차분히 정리해보세요." },
  { id: 2007, title: "초보 안전 정보공유", category: "안전수칙", maxPeople: 8, currentPeople: 6, password: "", latestMessage: "입문자가 보기 쉬운 안전 기준만 모아둔 방입니다." }
];
const questionSeed = [
  { id: 1, author: "profile_owner", question: "프로필을 꾸밀 때 가장 먼저 신경 쓰는 부분은 무엇인가요?", answer: "처음 들어온 사람이 한눈에 이해할 수 있도록 제목, 요약, 대표 이미지를 먼저 정리합니다. 질문 화면에서는 너무 자극적인 표현보다 신뢰감 있는 설명이 오래 남습니다.", meta: "답변 완료 · 오늘", likes: 28, comments: 6 },
  { id: 2, author: "visitor_204", question: "질문 기능은 어떤 식으로 운영하면 참여율이 높아질까요?", answer: "질문 등록 버튼을 눈에 띄게 두고, 답변 완료된 질문을 카드형으로 계속 노출하면 참여율이 높아집니다. 상단 광고는 콘텐츠 흐름을 끊지 않는 위치에 두는 것이 안전합니다.", meta: "답변 완료 · 2시간 전", likes: 17, comments: 4 },
  { id: 3, author: "community_user", question: "익명 질문과 일반 질문을 같이 운영해도 괜찮나요?", answer: "가능합니다. 다만 신고, 차단, 키워드 필터, 운영정책이 함께 있어야 운영 리스크를 줄일 수 있습니다. 질문 등록 전 가이드 문구도 같이 노출하는 것이 좋습니다.", meta: "답변 완료 · 어제", likes: 21, comments: 3 }
];
const testScaleOptions = [
  { score: -3, label: "전혀 아니다" },
  { score: -2, label: "아니다" },
  { score: -1, label: "조금 아니다" },
  { score: 0, label: "잘 모르겠다" },
  { score: 1, label: "조금 그렇다" },
  { score: 2, label: "그렇다" },
  { score: 3, label: "매우 그렇다" }
];
const testAxisMeta = {
  lead: { label: "주도형", summary: "상황의 방향과 흐름을 먼저 설계하려는 경향" },
  follow: { label: "수용형", summary: "상대가 제안한 흐름을 받아들이며 안정감을 얻는 경향" },
  service: { label: "봉사형", summary: "상대를 챙기고 준비하는 역할에서 만족을 느끼는 경향" },
  sensation: { label: "감각자극형", summary: "새로운 감각 자극과 긴장감에 호기심을 보이는 경향" },
  structure: { label: "규칙/구조형", summary: "명확한 약속, 신호, 순서를 선호하는 경향" },
  restraint: { label: "속박호기심형", summary: "제한감이나 고정된 자세 같은 통제 장치에 관심을 보이는 경향" },
  playful: { label: "놀이/도전형", summary: "장난기와 역할 놀이, 밀고 당기기 대화에 흥미를 느끼는 경향" },
  care: { label: "돌봄/안정형", summary: "안심, 돌봄, 정서적 안전장치가 있어야 몰입되는 경향" },
  intimacy: { label: "일상친밀형", summary: "특별한 장치보다 일상적 친밀감과 대화를 더 중시하는 경향" },
  switch: { label: "혼합탐색형", summary: "상황에 따라 주도와 수용이 모두 자연스러운 경향" }
};
const testQuestions = [
  { id: 1, prompt: "관계나 플레이 상황에서 내가 먼저 방향을 잡는 편이 편하다.", helper: "리드와 진행 설계 선호를 확인합니다.", weights: { lead: 1.8, structure: 0.8, switch: 0.4 } },
  { id: 2, prompt: "상대가 제안한 흐름을 따라갈 때 더 안정감을 느낀다.", helper: "수용과 위임의 편안함을 확인합니다.", weights: { follow: 1.8, care: 0.6, switch: 0.4 } },
  { id: 3, prompt: "상대를 위해 준비하고 챙기는 역할에서 만족감이 크다.", helper: "봉사 성향과 배려 역할을 확인합니다.", weights: { service: 1.8, care: 0.7 } },
  { id: 4, prompt: "사전에 규칙, 금지선, 신호를 또렷하게 맞추는 과정이 중요하다.", helper: "규칙/구조 선호를 확인합니다.", weights: { structure: 1.8, care: 0.6 } },
  { id: 5, prompt: "살짝 긴장되는 감각 자극이나 새로운 자극을 탐색해 보고 싶다.", helper: "감각 자극과 탐색 성향을 확인합니다.", weights: { sensation: 1.7, playful: 0.5 } },
  { id: 6, prompt: "움직임이 제한되거나 자세가 고정되는 설정에 호기심이 있다.", helper: "제한감/속박 호기심을 확인합니다.", weights: { restraint: 1.9, structure: 0.5 } },
  { id: 7, prompt: "가벼운 역할 놀이와 밀고 당기기 대화가 재미있다.", helper: "놀이/도전형 반응을 확인합니다.", weights: { playful: 1.8, switch: 0.5 } },
  { id: 8, prompt: "강한 자극보다도 안심시키는 말과 마무리 돌봄이 더 중요하다.", helper: "정서적 안정과 돌봄 기대를 확인합니다.", weights: { care: 1.9, intimacy: 0.6 } },
  { id: 9, prompt: "특별한 장치 없이도 대화와 친밀감만으로 충분히 몰입할 수 있다.", helper: "일상 친밀감 중심 성향을 확인합니다.", weights: { intimacy: 1.9, care: 0.5 } },
  { id: 10, prompt: "상대가 내 반응을 세심하게 읽으며 속도를 조절해 주면 좋다.", helper: "수용형과 돌봄 기대를 함께 확인합니다.", weights: { follow: 1.2, care: 1 } },
  { id: 11, prompt: "필요할 때는 내가 규칙과 리듬을 정리해 주는 편이 자연스럽다.", helper: "주도형과 구조형의 결합을 확인합니다.", weights: { lead: 1.3, structure: 1.2 } },
  { id: 12, prompt: "상대의 반응을 보고 준비를 맞춰 주거나 챙겨 주는 일에 보람을 느낀다.", helper: "봉사형과 돌봄형의 결합을 확인합니다.", weights: { service: 1.3, care: 1 } },
  { id: 13, prompt: "조금 예측하기 어려운 분위기나 도전적인 제안이 끌릴 때가 있다.", helper: "놀이/감각 탐색 성향을 확인합니다.", weights: { playful: 1.2, sensation: 1 } },
  { id: 14, prompt: "준비된 공간, 도구, 합의된 순서가 갖춰져 있을수록 몰입이 쉽다.", helper: "구조와 제한감의 조합을 확인합니다.", weights: { structure: 1.2, restraint: 1 } },
  { id: 15, prompt: "그날의 분위기에 따라 주도하거나 따라가는 쪽이 모두 자연스러울 수 있다.", helper: "혼합탐색형 가능성을 확인합니다.", weights: { switch: 1.9, lead: 0.5, follow: 0.5 } },
  { id: 16, prompt: "결국 가장 중요한 것은 서로의 합의와 편안함이라고 생각한다.", helper: "돌봄/친밀/구조 기반을 확인합니다.", weights: { care: 1.2, intimacy: 0.8, structure: 0.6 } }
];
const testQuestionCount = testQuestions.length;
const testMaxScores = testQuestions.reduce((acc, question) => {
  Object.entries(question.weights).forEach(([axis, weight]) => {
    const key = axis;
    acc[key] = (acc[key] ?? 0) + Math.abs(weight) * 3;
  });
  return acc;
}, {});
const buildDesktopGlobalSearchIndex = () => {
  const items = [];
  feedSeed.forEach((item) => {
    items.push({
      id: `feed-${item.id}`,
      group: "홈",
      category: item.type === "video" ? "쇼츠/영상" : "피드",
      title: item.title,
      summary: item.caption,
      path: item.type === "video" ? "홈 > 쇼츠" : "홈 > 피드",
      keywords: `${item.title} ${item.caption} ${item.author} ${item.category}`,
      openTab: "홈"
    });
  });
  productsSeed.forEach((item) => {
    items.push({
      id: `product-${item.id}`,
      group: "쇼핑",
      category: "상품",
      title: item.name,
      summary: `${item.subtitle} · ${item.price}`,
      path: "쇼핑 > 홈",
      keywords: `${item.name} ${item.subtitle} ${item.category} ${item.badge} ${item.price}`,
      openTab: "쇼핑"
    });
  });
  communitySeed.forEach((item) => {
    items.push({
      id: `community-${item.id}`,
      group: item.contentType === "test" ? "테스트" : "소통",
      category: `${item.board ?? "커뮤"}/${item.category}`,
      title: item.title,
      summary: item.summary,
      path: item.path ?? `소통 > ${item.board ?? "커뮤"}`,
      keywords: `${item.title} ${item.summary} ${item.category} ${item.detailTitle ?? ""} ${(item.detailBody ?? []).join(" ")}`,
      openTab: "소통"
    });
  });
  forumRoomSeed.forEach((item) => {
    items.push({
      id: `forum-${item.id}`,
      group: "소통",
      category: "포럼",
      title: item.title,
      summary: item.summary,
      path: "소통 > 포럼",
      keywords: `${item.title} ${item.summary} ${item.category} ${item.introMessage}`,
      openTab: "소통"
    });
  });
  threadSeed.forEach((item) => {
    items.push({
      id: `thread-${item.id}`,
      group: "채팅",
      category: item.kind,
      title: item.name,
      summary: item.preview,
      path: "채팅 > 채팅",
      keywords: `${item.name} ${item.preview} ${item.purpose} ${item.kind}`,
      openTab: "채팅"
    });
  });
  questionSeed.forEach((item) => {
    items.push({
      id: `question-${item.id}`,
      group: "채팅",
      category: "질문",
      title: item.question,
      summary: item.answer,
      path: "채팅 > 질문",
      keywords: `${item.question} ${item.answer} ${item.author}`,
      openTab: "채팅"
    });
  });
  notificationSeed.forEach((item) => {
    items.push({
      id: `notification-${item.id}`,
      group: "알림",
      category: `${item.section}/${item.category}`,
      title: item.title,
      summary: item.body,
      path: `알림 > ${item.section}`,
      keywords: `${item.title} ${item.body} ${item.category} ${item.section} ${item.meta}`,
      openTab: item.section === "주문" ? "쇼핑" : item.section === "소통" ? "채팅" : "홈"
    });
  });
  testQuestions.forEach((item) => {
    items.push({
      id: `test-question-${item.id}`,
      group: "테스트",
      category: "문항",
      title: `테스트 문항 ${item.id}`,
      summary: item.prompt,
      path: "소통 > 커뮤 > 테스트 > 성향 탐색 테스트",
      keywords: `${item.prompt} ${item.helper}`,
      openTab: "소통"
    });
  });
  Object.entries(testAxisMeta).forEach(([axis, meta]) => {
    items.push({
      id: `test-axis-${axis}`,
      group: "테스트",
      category: "결과축",
      title: meta.label,
      summary: meta.summary,
      path: "소통 > 커뮤 > 테스트 > 결과 리포트",
      keywords: `${meta.label} ${meta.summary}`,
      openTab: "소통"
    });
  });
  return items;
};
const cartSeed = [
  { id: 1, name: "뉴트럴 케어 파우치", qty: 1, price: "₩18,000", option: "위생/보관" },
  { id: 2, name: "스타터 바디 케어 세트", qty: 2, price: "₩58,000", option: "입문 액세서리" },
  { id: 3, name: "정기 재구매 추천 팩", qty: 1, price: "₩36,500", option: "기획전" }
];
const FeedCaption = reactExports.memo(function FeedCaption2({ caption, title }) {
  const captionRef = reactExports.useRef(null);
  const [expanded, setExpanded] = reactExports.useState(false);
  const [showToggle, setShowToggle] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setExpanded(false);
  }, [caption]);
  reactExports.useEffect(() => {
    const measure = () => {
      const element = captionRef.current;
      if (!element) return;
      const isOverflowing = element.scrollHeight > element.clientHeight + 1;
      setShowToggle(isOverflowing || expanded);
    };
    const rafId = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
    };
  }, [caption, expanded]);
  const handleExpand = () => setExpanded(true);
  const handleCollapse = () => setExpanded(false);
  const handleExpandKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleExpand();
    }
  };
  const handleCollapseKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCollapse();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `feed-caption-block${expanded ? " expanded" : ""}${showToggle ? " has-toggle" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-caption-body", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { ref: captionRef, className: `feed-caption-text${expanded ? " expanded" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-caption-text-content", children: caption }),
      !expanded && showToggle ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-caption-more-inline", role: "button", tabIndex: 0, onClick: handleExpand, onKeyDown: handleExpandKeyDown, children: "더보기" }) : null
    ] }) }),
    expanded && showToggle ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-caption-inline-less", role: "button", tabIndex: 0, onClick: handleCollapse, onKeyDown: handleCollapseKeyDown, children: "접기" }) : null
  ] });
});
const FeedPoster = reactExports.memo(function FeedPoster2({ item, onAsk, saved, liked, reposted, commentsOpen, commentCount, onOpenComments, onToggleLike, onToggleRepost, onToggleSave, onShare, keywordTags = [], onOpenAuthorProfile, onPreviewAuthorAvatar, following, onToggleFollow }) {
  const postedLabel = formatFeedPostedAt(item.postedAt);
  const handlePreviewAuthorAvatar = () => {
    onPreviewAuthorAvatar == null ? void 0 : onPreviewAuthorAvatar(item);
  };
  const likeCount = item.likes + (liked ? 1 : 0);
  const repostCount = (item.reposts ?? Math.max(0, Math.round((item.likes + item.comments) / 7))) + (reposted ? 1 : 0);
  const viewCount = item.views ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "article",
    {
      className: `feed-card history-feed-card feed-card-unified ${item.accent}`,
      style: {
        "--feed-card-bg": FEED_CARD_PRESENTATION.backgroundColor,
        "--feed-card-fg": FEED_CARD_PRESENTATION.textColor,
        "--feed-card-muted": FEED_CARD_PRESENTATION.mutedTextColor,
        "--feed-card-accent": FEED_CARD_PRESENTATION.accentColor
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-feed-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-feed-profile", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "story-mini-avatar-button", onClick: handlePreviewAuthorAvatar, "aria-label": `${item.author} 프로필 사진 크게 보기`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "story-mini-avatar", children: item.author.slice(0, 1).toUpperCase() }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-feed-profile-copy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "feed-author-link", onClick: () => onOpenAuthorProfile(item.author), children: item.author }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-author-meta-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-posted-at", children: postedLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "팔로워 2,184" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "팔로잉 318" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "history-feed-head-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `feed-follow-btn ${following ? "active" : ""}`, onClick: () => onToggleFollow(item.author), children: following ? "팔로잉" : "팔로우" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-media", children: [
          item.type === "image" && item.mediaUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.mediaUrl, alt: item.mediaName ?? item.title, className: "feed-media-preview", loading: "lazy" }) : item.type === "video" && item.videoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: item.videoUrl, className: "feed-media-preview", controls: true, playsInline: true, muted: true, preload: "metadata" }) : null,
          keywordTags.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "content-keyword-stack content-keyword-stack--feed", children: keywordTags.slice(0, 2).map((keyword) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "content-keyword-pill", children: [
            "#",
            keyword
          ] }, `${item.id}-${keyword}`)) }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-copy", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedCaption, { caption: item.caption }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-feed-footer history-feed-footer-icons", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `feed-action-btn feed-action-btn-count ${commentsOpen ? "active" : ""}`, "aria-label": "댓글", onClick: () => onOpenComments(item), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-action-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommentBubbleIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "feed-action-count", children: formatCompactSocialCount(commentCount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `feed-action-btn feed-action-btn-count ${liked ? "active" : ""}`, "aria-label": "좋아요", onClick: () => onToggleLike(item.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-action-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeartIcon, { filled: liked }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "feed-action-count", children: formatCompactSocialCount(likeCount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `feed-action-btn feed-action-btn-count ${reposted ? "active" : ""}`, "aria-label": "재게시", onClick: () => onToggleRepost(item.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-action-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RepostIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "feed-action-count", children: formatCompactSocialCount(repostCount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "feed-action-btn feed-action-btn-count", "aria-label": "조회수", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-action-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ViewCountIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "feed-action-count", children: formatCompactSocialCount(viewCount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `feed-action-btn ${saved ? "active" : ""}`, "aria-label": "보관함", onClick: () => onToggleSave(item.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-action-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookmarkIcon, { filled: saved }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "feed-action-count feed-action-count-empty", "aria-hidden": "true", children: " " })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "feed-action-btn", "aria-label": "질문하기", onClick: () => onAsk(item), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-action-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QuestionAnswerIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "feed-action-count feed-action-count-empty", "aria-hidden": "true", children: " " })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "feed-action-btn", "aria-label": "공유", onClick: () => onShare(item), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-action-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShareArrowIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "feed-action-count feed-action-count-empty", "aria-hidden": "true", children: " " })
          ] })
        ] })
      ]
    }
  );
});
reactExports.memo(function SponsoredFeedProductCard2({ item, saved, onToggleSave }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "product-card sponsored-feed-product", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "product-thumb" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "product-badge", children: item.label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.subtitle }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "product-meta", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "피드 사이 자연노출" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: item.price })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "product-card-actions", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", children: "상품 보기" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => onToggleSave(item.id), children: saved ? "보관해제" : "보관함" })
    ] })
  ] });
});
function ShortsListCard({ item, onOpenMore, onOpenViewer }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "shorts-list-card", onClick: () => onOpenViewer(item), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `shorts-video-stage ${item.accent}`, onClick: () => onOpenViewer(item), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-video-poster-tag", children: "대표 썸네일 · 10초 · 저용량" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-video-center", children: "쇼츠 포스터" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-list-copy shorts-list-copy-detailed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-detail-identity-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shorts-profile-avatar", "aria-hidden": "true", children: item.author.slice(0, 1).toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-detail-copy-block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-detail-title-bar", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "shorts-more-btn shorts-more-icon-btn",
              "aria-label": `${item.title} 더보기`,
              onClick: (event) => {
                event.stopPropagation();
                onOpenMore(item);
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreDotsIcon, {})
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shorts-inline-meta", children: [
          item.author,
          " · 조회수 ",
          (item.views ?? 0).toLocaleString(),
          "회 · ",
          item.postedAt ?? "방금",
          " · 추천수 ",
          item.likes.toLocaleString()
        ] })
      ] })
    ] }) })
  ] });
}
function ShortsViewer({
  items,
  initialIndex,
  onClose,
  onOpenMore,
  getKeywordTags,
  onOpenAuthorProfile,
  onPreviewAuthorAvatar,
  followedAuthors,
  onToggleFollow
}) {
  const [activeIndex, setActiveIndex] = reactExports.useState(initialIndex);
  const [pausedMap, setPausedMap] = reactExports.useState(() => {
    var _a;
    return { [((_a = items[initialIndex]) == null ? void 0 : _a.id) ?? 0]: false };
  });
  const [likedIds, setLikedIds] = reactExports.useState([]);
  const [dislikedIds, setDislikedIds] = reactExports.useState([]);
  const [descriptionItem, setDescriptionItem] = reactExports.useState(null);
  const [searchOpen, setSearchOpen] = reactExports.useState(false);
  const [searchText, setSearchText] = reactExports.useState("");
  const [overlayVisible, setOverlayVisible] = reactExports.useState(true);
  const [commentOpenItemId, setCommentOpenItemId] = reactExports.useState(null);
  const [commentDraft, setCommentDraft] = reactExports.useState("");
  const [commentMap, setCommentMap] = reactExports.useState(() => Object.fromEntries(items.map((item) => [item.id, [`${item.author} 취향 태그 잘 맞아요.`, `${item.title} 관련 추천이 괜찮네요.`]])));
  const hideTimerRef = reactExports.useRef(null);
  const scrollRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    var _a;
    const target = (_a = scrollRef.current) == null ? void 0 : _a.querySelector(`[data-short-index="${initialIndex}"]`);
    target == null ? void 0 : target.scrollIntoView({ block: "start" });
  }, [initialIndex]);
  const activeItem = items[activeIndex] ?? items[0];
  const activeKeywords = getKeywordTags(activeItem).slice(0, 2);
  const restartOverlayTimer = () => {
    setOverlayVisible(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setOverlayVisible(false), 5e3);
  };
  reactExports.useEffect(() => {
    restartOverlayTimer();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [activeIndex]);
  reactExports.useEffect(() => {
    var _a;
    if (!searchOpen) return;
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return;
    const nextIndex = items.findIndex((item) => `${item.title} ${item.caption} ${item.author} ${item.category}`.toLowerCase().includes(keyword));
    if (nextIndex === -1 || nextIndex === activeIndex) return;
    const target = (_a = scrollRef.current) == null ? void 0 : _a.querySelector(`[data-short-index="${nextIndex}"]`);
    target == null ? void 0 : target.scrollIntoView({ block: "start", behavior: "smooth" });
    setActiveIndex(nextIndex);
    restartOverlayTimer();
  }, [activeIndex, items, searchOpen, searchText]);
  const togglePause = (itemId) => {
    restartOverlayTimer();
    setPausedMap((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };
  const handleViewerScroll = (event) => {
    restartOverlayTimer();
    const container = event.currentTarget;
    const nextIndex = Math.round(container.scrollTop / Math.max(container.clientHeight, 1));
    if (nextIndex !== activeIndex && items[nextIndex]) {
      setActiveIndex(nextIndex);
    }
  };
  const toggleReaction = (kind, itemId) => {
    restartOverlayTimer();
    if (kind === "like") {
      setLikedIds((prev) => prev.includes(itemId) ? prev.filter((id2) => id2 !== itemId) : [...prev, itemId]);
      setDislikedIds((prev) => prev.filter((id2) => id2 !== itemId));
      return;
    }
    setDislikedIds((prev) => prev.includes(itemId) ? prev.filter((id2) => id2 !== itemId) : [...prev, itemId]);
    setLikedIds((prev) => prev.filter((id2) => id2 !== itemId));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-viewer-overlay", "data-active-keywords": activeKeywords.join(","), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: `shorts-viewer-close-fab${overlayVisible ? " visible" : ""}`,
        onClick: () => {
          restartOverlayTimer();
          onClose();
        },
        "aria-label": "뒤로가기",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {})
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `shorts-viewer-top-actions-floating${overlayVisible ? " visible" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "shorts-icon-btn",
          onClick: () => {
            restartOverlayTimer();
            setSearchOpen((prev) => !prev);
          },
          "aria-label": "쇼츠 검색",
          title: "쇼츠 검색",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, {})
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "shorts-icon-btn",
          onClick: () => {
            restartOverlayTimer();
            onOpenMore(activeItem);
          },
          "aria-label": "쇼츠 메뉴",
          title: "쇼츠 메뉴",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreDotsIcon, {})
        }
      )
    ] }),
    searchOpen && overlayVisible ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-viewer-searchbar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        value: searchText,
        onChange: (event) => {
          restartOverlayTimer();
          setSearchText(event.target.value);
        },
        placeholder: "쇼츠 검색"
      }
    ) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-viewer-scroll", ref: scrollRef, onScroll: handleViewerScroll, children: items.map((item, idx) => {
      const paused = !!pausedMap[item.id];
      const liked = likedIds.includes(item.id);
      const disliked = dislikedIds.includes(item.id);
      const following = followedAuthors.includes(item.author);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `shorts-viewer-page ${item.accent}${commentOpenItemId === item.id ? " comments-open" : ""}`, "data-short-index": idx, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "shorts-viewer-video", onClick: () => togglePause(item.id), "aria-label": paused ? "영상 재생" : "영상 정지", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-viewer-video-fill", children: [
          item.videoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "video",
            {
              className: "shorts-viewer-video-asset",
              src: item.videoUrl,
              autoPlay: !paused,
              muted: true,
              loop: true,
              playsInline: true
            },
            item.videoUrl
          ) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-viewer-video-poster", children: "10초 · 저용량 데모 클립" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `shorts-viewer-side-actions${overlayVisible ? " visible" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `shorts-viewer-action-btn${liked ? " active" : ""}`, onClick: () => toggleReaction("like", item.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbUpIcon, { filled: liked }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: item.likes.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `shorts-viewer-action-btn${disliked ? " active" : ""}`, onClick: () => toggleReaction("dislike", item.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbDownIcon, { filled: disliked }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: Math.max(12, Math.round(item.likes / 11)).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `shorts-viewer-action-btn${commentOpenItemId === item.id ? " active" : ""}`, onClick: () => {
            restartOverlayTimer();
            setCommentOpenItemId(commentOpenItemId === item.id ? null : item.id);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommentBubbleIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: (commentMap[item.id] ?? []).length.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "shorts-viewer-action-btn", onClick: () => {
            restartOverlayTimer();
            onOpenMore(item);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShareArrowIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "공유" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `shorts-viewer-bottom${overlayVisible ? " visible" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-viewer-author-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: "shorts-profile-avatar shorts-profile-avatar-small shorts-profile-avatar-button",
                onClick: () => {
                  restartOverlayTimer();
                  onPreviewAuthorAvatar(item);
                },
                "aria-label": `${item.author} 프로필 사진 크게 보기`,
                children: item.author.slice(0, 1).toUpperCase()
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "shorts-viewer-author-link", onClick: () => {
              restartOverlayTimer();
              onOpenAuthorProfile(item.author);
            }, children: item.author }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `feed-follow-btn shorts-follow-btn ${following ? "active" : ""}`, onClick: () => {
              restartOverlayTimer();
              onToggleFollow(item.author);
            }, children: following ? "팔로잉" : "팔로우" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "shorts-viewer-full-title", onClick: restartOverlayTimer, children: [
            "풀영상 ",
            item.title
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "shorts-viewer-description", onClick: () => {
            restartOverlayTimer();
            setDescriptionItem(item);
          }, children: item.caption })
        ] }),
        commentOpenItemId === item.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-comments-sheet", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-comments-list", children: (commentMap[item.id] ?? []).map((comment, commentIndex) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-comment-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { children: [
              "user",
              commentIndex + 1
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: comment })
          ] }, `${item.id}-comment-${commentIndex}`)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-comment-input-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: commentDraft, onChange: (event) => {
              restartOverlayTimer();
              setCommentDraft(event.target.value);
            }, placeholder: "댓글을 입력하세요" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
              restartOverlayTimer();
              if (!commentDraft.trim()) return;
              setCommentMap((prev) => ({ ...prev, [item.id]: [...prev[item.id] ?? [], commentDraft.trim()] }));
              setCommentDraft("");
            }, children: "입력" })
          ] })
        ] }) : null
      ] }, `viewer-${item.id}`);
    }) }),
    descriptionItem ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-description-sheet-backdrop", onClick: () => setDescriptionItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-description-sheet", onClick: (event) => event.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-sheet-handle" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: descriptionItem.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: descriptionItem.caption }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setDescriptionItem(null), children: "닫기" })
    ] }) }) : null
  ] });
}
function AskProfileScreen({ profile, activeTab, onClose, onNavigate, renderBottomTabIcon, onOpenProfile }) {
  const storageKey = `adultapp_ask_draft_${profile.id}`;
  const [questionText, setQuestionText] = reactExports.useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(storageKey) ?? "";
  });
  const [anonymousQuestion, setAnonymousQuestion] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, questionText);
  }, [questionText, storageKey]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "question-overlay", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "asked-page-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-nav-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn topbar-search-back", onClick: onClose, "aria-label": "뒤로가기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "asked-page-title", children: "질문" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "modal-spacer" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "asked-question-profile-header", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-profile-card asked-question-profile-card-inline", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "asked-question-avatar", children: profile.name.slice(0, 1).toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-copy", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-copy-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-copy-main", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "feed-author-link asked-profile-name-btn", onClick: () => onOpenProfile(profile.name), children: profile.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: profile.headline })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-toolbar asked-question-toolbar-inline", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", children: "팔로우" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", children: "공유" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: profile.intro })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "asked-question-form", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-form-title-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "질문 내용" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "asked-question-anonymous-toggle", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: anonymousQuestion, onChange: (event) => setAnonymousQuestion(event.target.checked) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "익명" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: questionText, onChange: (e) => setQuestionText(e.target.value), placeholder: "상대에게 남길 질문을 입력하세요." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "asked-question-draft-note", children: "작성 중인 질문은 임시저장됩니다." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "asked-question-form-actions asked-question-form-actions-submit-only", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "ghost-btn",
          onClick: () => {
            if (typeof window !== "undefined") window.localStorage.removeItem(storageKey);
            setQuestionText("");
            window.alert(anonymousQuestion ? "질문이 익명으로 등록되었습니다." : "질문이 등록되었습니다.");
          },
          children: "질문 등록"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "question-list", children: questionSeed.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "question-feed-stack", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "question-feed-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "question-feed-top", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "question-user-line", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-chip", children: "질문" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.author }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-meta", children: item.meta })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "question-body", children: [
          "Q. ",
          item.question
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "question-answer-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "product-badge", children: "답변" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "question-body", children: item.answer })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "question-footer-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "question-footer-icon-btn", "aria-label": "좋아요", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "question-footer-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeartIcon, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.likes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "question-footer-icon-btn", "aria-label": "댓글", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "question-footer-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommentBubbleIcon, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.comments })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "question-footer-icon-btn", "aria-label": "공유", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "question-footer-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShareArrowIcon, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "공유" })
        ] })
      ] })
    ] }) }, `ask-${item.id}`)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "bottom-nav question-overlay-bottom-nav", children: mobileTabs.map((tab) => {
      const filled = activeTab === tab;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: `bottom-nav-btn ${filled ? "active" : ""}`,
          onClick: () => onNavigate(tab),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bottom-nav-icon", children: renderBottomTabIcon(tab, filled) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bottom-nav-label", children: tab })
          ]
        },
        `ask-nav-${tab}`
      );
    }) })
  ] });
}
function FeedCommentScreen({ item, comments, draft, attachment, attachmentBusy, onChangeDraft, onAttachImage, onClearAttachment, onSubmit, onClose, onGoHome }) {
  const postedLabel = formatFeedPostedAt(item.postedAt);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-comment-overlay", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "asked-page-head feed-comment-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-nav-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn topbar-search-back", onClick: onClose, "aria-label": "뒤로가기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "asked-page-title", children: "댓글" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-comment-head-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn ghost-btn feed-comment-home-btn", onClick: onGoHome, children: "홈" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn feed-comment-submit-top", onClick: onSubmit, children: "등록" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-comment-overlay-body", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `feed-card history-feed-card feed-comment-focus-card ${item.accent}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "history-feed-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-feed-profile", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "story-mini-avatar", children: item.author.slice(0, 1).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-feed-profile-copy", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.author }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-author-meta-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-posted-at", children: postedLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "팔로워 2,184" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "팔로잉 318" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-copy", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeedCaption, { caption: item.caption })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-meta", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "좋아요 ",
            item.likes
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "댓글 ",
            (comments.length || item.comments).toLocaleString()
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-comment-thread-shell", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-comment-thread-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            "댓글 ",
            comments.length.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "다른 사용자가 남긴 대화를 확인해보세요." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "feed-comment-thread", children: comments.length ? comments.map((comment) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "feed-comment-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-comment-avatar", children: comment.author.slice(0, 1).toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-comment-copy", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-comment-meta", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: comment.author }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: comment.meta })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: comment.text }),
            comment.imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-comment-image-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: comment.imageUrl, alt: comment.imageName ?? "첨부 이미지", className: "feed-comment-image", loading: "lazy" }) }) : null
          ] })
        ] }, comment.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "첫 댓글을 남겨보세요." }) }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-comment-composer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-comment-composer-side", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-comment-composer-avatar", children: "나" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `feed-comment-attach-btn ${attachmentBusy ? "is-busy" : ""}`, children: [
          "사진",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              accept: "image/*",
              hidden: true,
              onChange: (event) => {
                var _a;
                const file = ((_a = event.target.files) == null ? void 0 : _a[0]) ?? null;
                onAttachImage(file);
                event.currentTarget.value = "";
              }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-comment-composer-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: draft, onChange: (event) => onChangeDraft(event.target.value), placeholder: "게시글에 댓글을 남겨보세요." }),
        attachment ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-comment-attachment-preview", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: attachment.dataUrl, alt: attachment.name, className: "feed-comment-attachment-thumb", loading: "lazy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-comment-attachment-copy", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: attachment.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              Math.max(1, Math.round(attachment.size / 1024)),
              "KB · 최대 1장"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: onClearAttachment, children: "삭제" })
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-comment-composer-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: attachmentBusy ? "이미지 최적화 중" : `${draft.trim().length}/300` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onSubmit, children: "댓글 달기" })
        ] })
      ] })
    ] })
  ] });
}
function FeedComposeScreen({ mode, title, caption, attachment, busy, helperText, onChangeTitle, onChangeCaption, onAttachFile, onClearAttachment, onSubmit, onClose }) {
  const canSubmit = Boolean(caption.trim() || attachment);
  const composeMeta = getFeedComposeModeMeta(mode);
  const isShortsMode = mode === "쇼츠게시";
  const isFeedMode = mode === "피드게시";
  const feedMediaInputRef = reactExports.useRef(null);
  const feedGalleryPlaceholders = [0, 1, 2, 3, 4];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `feed-compose-overlay${isFeedMode ? " feed-compose-overlay-x" : ""}${isShortsMode ? " feed-compose-overlay-shorts" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "asked-page-head feed-compose-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-nav-row feed-compose-nav-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn topbar-search-back", onClick: onClose, "aria-label": "뒤로가기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "asked-page-title", children: composeMeta.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `header-inline-btn feed-comment-submit-top${isShortsMode ? " feed-compose-submit-pill" : ""}`, onClick: onSubmit, disabled: !canSubmit, children: "게시하기" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-compose-overlay-body compact-scroll-list", children: isFeedMode ? /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "feed-compose-card feed-compose-card-x", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-compose-profile-row feed-compose-profile-row-x", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-x-main", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-compose-gallery-access", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "feed-compose-gallery-open-btn",
          "aria-label": "사진첩 열기",
          onClick: () => {
            var _a;
            return (_a = feedMediaInputRef.current) == null ? void 0 : _a.click();
          },
          disabled: busy,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(PhotoImageIcon, {})
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: caption,
          onChange: (event) => onChangeCaption(event.target.value),
          className: "feed-compose-x-textarea",
          placeholder: "무슨 일이 일어나고 있나요?",
          maxLength: 400
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-gallery-shell", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-gallery-strip", role: "list", "aria-label": "사진 및 영상 선택", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `feed-compose-gallery-tile feed-compose-gallery-picker${busy ? " is-busy" : ""}`, role: "listitem", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: feedMediaInputRef,
                type: "file",
                accept: composeMeta.accept,
                hidden: true,
                disabled: busy,
                onChange: (event) => {
                  var _a;
                  onAttachFile(((_a = event.target.files) == null ? void 0 : _a[0]) ?? null);
                  event.currentTarget.value = "";
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-compose-gallery-picker-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PhotoImageIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: busy ? "처리 중" : "사진첩" })
          ] }),
          attachment ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-gallery-tile feed-compose-gallery-selected", role: "listitem", children: [
            attachment.type.startsWith("image/") ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: attachment.previewUrl, alt: attachment.name, className: "feed-compose-gallery-thumb", loading: "lazy" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: attachment.previewUrl, className: "feed-compose-gallery-thumb", playsInline: true, muted: true, preload: "metadata" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "feed-compose-gallery-remove", onClick: onClearAttachment, "aria-label": "선택한 첨부 삭제", children: "삭제" })
          ] }) : null,
          feedGalleryPlaceholders.map((index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "feed-compose-gallery-tile feed-compose-gallery-placeholder",
              onClick: () => {
                var _a;
                return (_a = feedMediaInputRef.current) == null ? void 0 : _a.click();
              },
              "aria-label": `첨부 항목 ${index + 1} 선택`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-compose-gallery-placeholder-fill" })
            },
            `feed-gallery-placeholder-${index}`
          ))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-gallery-meta", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: attachment ? attachment.name : "사진 또는 영상 1개 선택" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: attachment ? `${attachment.type.startsWith("video/") ? `영상 첨부${attachment.optimized ? " · 최적화" : ""}${attachment.durationSec ? ` · ${attachment.durationSec.toFixed(1)}초` : ""}` : "사진 첨부"} · ${Math.max(1, Math.round(attachment.size / 1024))}KB` : helperText })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-compose-x-privacy", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "feed-compose-privacy-chip", children: "모든 사용자에게 공개" }) })
    ] }) }) }) : isShortsMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "feed-compose-card feed-compose-card-shorts", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-shorts-hero", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "유튜브 쇼츠 등록 흐름처럼 순서대로 진행" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "영상 선택 → 제목 입력 → 설명 입력 → 업로드 전 확인 순서로 배치했습니다." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-compose-shorts-chip", children: "세로형 쇼츠" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-step-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-compose-step-badge", children: "1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-step-copy", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "쇼츠 영상 선택" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: helperText })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `creator-launch-btn feed-compose-attach-btn${busy ? " is-busy" : ""}`, children: [
          busy ? "첨부 최적화 중" : composeMeta.attachLabel,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              accept: composeMeta.accept,
              hidden: true,
              disabled: busy,
              onChange: (event) => {
                var _a;
                onAttachFile(((_a = event.target.files) == null ? void 0 : _a[0]) ?? null);
                event.currentTarget.value = "";
              }
            }
          )
        ] })
      ] }),
      attachment ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-preview-card feed-compose-preview-card-shorts", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: attachment.previewUrl, className: "feed-compose-preview-media", controls: true, playsInline: true, preload: "metadata" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-preview-copy", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: attachment.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `영상 첨부${attachment.optimized ? " · 최적화" : ""}${attachment.durationSec ? ` · ${attachment.durationSec.toFixed(1)}초` : ""} · ${Math.max(1, Math.round(attachment.size / 1024))}KB` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: onClearAttachment, children: "삭제" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-compose-empty feed-compose-empty-shorts", children: "선택한 쇼츠 영상이 여기에 미리보기로 표시됩니다." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-step-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-compose-step-badge", children: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-step-copy", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "제목" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "목록과 추천 영역에 노출될 문구입니다." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: title,
            onChange: (event) => onChangeTitle(event.target.value),
            placeholder: "쇼츠 제목을 입력하세요",
            maxLength: 60
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-step-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-compose-step-badge", children: "3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-step-copy", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "설명" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "시청자가 영상과 함께 보게 될 설명입니다." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: caption,
            onChange: (event) => onChangeCaption(event.target.value),
            placeholder: "쇼츠 설명을 입력하세요",
            maxLength: 400
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-step-card feed-compose-step-card-checklist", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-compose-step-badge", children: "4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-step-copy", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "업로드 전 확인" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "실제 업로드 전 검토 항목처럼 정리했습니다." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "feed-compose-checklist", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "세로형 비율 권장" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "20초 이하 영상 권장" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "대표 문구는 제목에 간결하게 작성" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "등록 후 홈 > 쇼츠 탭에서 확인 가능" })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "feed-compose-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-profile-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-comment-composer-avatar", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: composeMeta.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: composeMeta.description })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-field", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "제목" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: title,
            onChange: (event) => onChangeTitle(event.target.value),
            placeholder: "피드 제목을 입력하세요",
            maxLength: 60
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-field", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "내용" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: caption,
            onChange: (event) => onChangeCaption(event.target.value),
            placeholder: "피드 내용을 입력하세요",
            maxLength: 400
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-attach-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `creator-launch-btn feed-compose-attach-btn${busy ? " is-busy" : ""}`, children: [
          busy ? "첨부 최적화 중" : composeMeta.attachLabel,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              accept: composeMeta.accept,
              hidden: true,
              disabled: busy,
              onChange: (event) => {
                var _a;
                onAttachFile(((_a = event.target.files) == null ? void 0 : _a[0]) ?? null);
                event.currentTarget.value = "";
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: helperText })
      ] }),
      attachment ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-preview-card", children: [
        attachment.type.startsWith("image/") ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: attachment.previewUrl, alt: attachment.name, className: "feed-compose-preview-media", loading: "lazy" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: attachment.previewUrl, className: "feed-compose-preview-media", controls: true, playsInline: true, preload: "metadata" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-compose-preview-copy", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: attachment.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            attachment.type.startsWith("video/") ? `영상 첨부${attachment.optimized ? " · 최적화" : ""}${attachment.durationSec ? ` · ${attachment.durationSec.toFixed(1)}초` : ""}` : "사진 첨부",
            " · ",
            Math.max(1, Math.round(attachment.size / 1024)),
            "KB"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: onClearAttachment, children: "삭제" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-compose-empty", children: "첨부한 사진/영상이 여기에 미리보기로 표시됩니다." })
    ] }) })
  ] });
}
function isCompanyMailRouteActive() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  return host.includes("opsmail") || host.includes("corpmail") || host.includes("mailops") || path.startsWith("/__ops/company-mail") || hash === "#corp-mail-admin" || params.get("internal") === "company-mail";
}
function isCompanyMailHostLocked() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host.includes("opsmail") || host.includes("corpmail") || host.includes("mailops");
}
function CompanyMailAdminScreen({
  isAdmin,
  onExit,
  onRequestLogin,
  hostLabel
}) {
  var _a;
  const folderDefs = [
    { key: "받은편지함", label: "받은편지함" },
    { key: "공지/정책", label: "공지/정책" },
    { key: "주문/정산", label: "주문/정산" },
    { key: "거래처", label: "거래처" },
    { key: "임시보관", label: "임시보관" }
  ];
  const messages = reactExports.useMemo(() => [
    {
      id: 1,
      folder: "받은편지함",
      category: "운영",
      subject: "오늘 오전 관리자 점검 일정 공유",
      sender: "ops@internal.mail",
      receivedAt: "2026.04.20 09:10",
      preview: "운영 점검, 결제 리허설, 공지 반영 상태를 오전 10시에 재확인합니다.",
      body: [
        "관리자 전용 점검 화면입니다.",
        "오늘 오전 10시에 운영 점검, 결제 리허설, 공지 반영 상태를 순서대로 확인합니다.",
        "앱 내 노출 없이 관리자 계정만 접근 가능하도록 유지합니다."
      ],
      unread: true,
      priority: "중요",
      tags: ["운영", "점검"]
    },
    {
      id: 2,
      folder: "공지/정책",
      category: "정책",
      subject: "청소년 보호정책 문구 최종 검수 요청",
      sender: "policy@internal.mail",
      receivedAt: "2026.04.19 18:45",
      preview: "앱 공지/회원가입/상품 상세에 동일 문구가 반영되었는지 확인해주세요.",
      body: [
        "청소년 보호정책 최종 검수 요청입니다.",
        "회원가입, 알림 공지, 상품 상세의 고지 문구가 동일한지 확인 후 승인 처리해주세요."
      ],
      priority: "중요",
      tags: ["정책", "문구"]
    },
    {
      id: 3,
      folder: "주문/정산",
      category: "주문",
      subject: "주문 환불 처리 로그 점검",
      sender: "ledger@internal.mail",
      receivedAt: "2026.04.19 14:20",
      preview: "환불 상태 변경 이력과 관리자 사유 로그를 오후 배치 전 확인하세요.",
      body: [
        "환불 처리 로그 점검 안내입니다.",
        "주문 상태 변경 이력, 관리자 사유 기록, 환불 금액 반영값을 오후 배치 전에 검토해주세요."
      ],
      priority: "일반",
      tags: ["주문", "환불"]
    },
    {
      id: 4,
      folder: "거래처",
      category: "거래처",
      subject: "입점사 노출 상품 검수 요청",
      sender: "sellerdesk@internal.mail",
      receivedAt: "2026.04.18 16:00",
      preview: "신규 입점사 공개 예정 상품 12건의 카테고리/문구 검수가 필요합니다.",
      body: [
        "입점사 검수 요청 건입니다.",
        "신규 등록 예정 상품 12건에 대해 카테고리, 상세 문구, 노출 이미지 검수를 진행해주세요."
      ],
      unread: true,
      priority: "중요",
      tags: ["판매자", "검수"]
    },
    {
      id: 5,
      folder: "임시보관",
      category: "초안",
      subject: "앰배서더 운영 약정서 보관",
      sender: "docs@internal.mail",
      receivedAt: "2026.04.20 11:40",
      preview: "업로드한 HWP 문서를 DOCX로 변환해 docs/internal/ambassador 폴더에 보관했습니다.",
      body: [
        "문서 보관 완료 안내입니다.",
        "앰배서더 운영 가이드라인 및 참여약정서를 DOCX 형식으로 변환해 프로젝트 내부 문서 폴더에 저장했습니다."
      ],
      priority: "일반",
      tags: ["문서", "보관"]
    }
  ], []);
  const [folder, setFolder] = reactExports.useState("받은편지함");
  const visibleMessages = reactExports.useMemo(() => messages.filter((item) => item.folder === folder), [messages, folder]);
  const [selectedId, setSelectedId] = reactExports.useState(1);
  reactExports.useEffect(() => {
    var _a2;
    if (!visibleMessages.some((item) => item.id === selectedId)) {
      setSelectedId(((_a2 = visibleMessages[0]) == null ? void 0 : _a2.id) ?? 0);
    }
  }, [visibleMessages, selectedId]);
  const selectedMessage = visibleMessages.find((item) => item.id === selectedId) ?? visibleMessages[0] ?? null;
  const folderCounts = reactExports.useMemo(() => {
    return folderDefs.reduce((acc, item) => {
      acc[item.key] = messages.filter((message) => message.folder === item.key).length;
      return acc;
    }, {
      "받은편지함": 0,
      "공지/정책": 0,
      "주문/정산": 0,
      "거래처": 0,
      "임시보관": 0
    });
  }, [messages]);
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "company-mail-shell company-mail-shell--blocked", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "company-mail-auth-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-auth-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "회사메일 관리자 화면" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: hostLabel })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "이 화면은 관리자 계정만 접근할 수 있습니다." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "일반 회원 및 판매자 계정에서는 접근이 차단됩니다." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onRequestLogin, children: "로그인 화면으로 이동" }),
        onExit ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: onExit, children: "닫기" }) : null
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-shell", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "company-mail-topbar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-topbar-main", children: [
        onExit ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn topbar-search-back", onClick: onExit, "aria-label": "뒤로가기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "company-mail-topbar-spacer", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "회사메일 관리자 화면" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: hostLabel })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-topbar-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", children: "새 메일" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", children: "보안 로그" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "company-mail-layout", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "company-mail-sidebar", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-sidebar-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "숨김 폴더" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "관리자 전용" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "company-mail-folder-list", children: folderDefs.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            className: `company-mail-folder-btn ${folder === item.key ? "active" : ""}`,
            onClick: () => setFolder(item.key),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: folderCounts[item.key] })
            ]
          },
          item.key
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-sidebar-note", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "보안 주의" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "숨김 경로·숨김 도메인 연결 후 관리자 계정만 접근하도록 유지합니다." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "company-mail-list-pane", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-pane-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: folder }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "목록 ",
              visibleMessages.length,
              "건"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn ghost-btn-small", children: "새로고침" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "company-mail-message-list", children: visibleMessages.map((message) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            className: `company-mail-message-row ${(selectedMessage == null ? void 0 : selectedMessage.id) === message.id ? "active" : ""} ${message.unread ? "unread" : ""}`,
            onClick: () => setSelectedId(message.id),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-message-row-top", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "company-mail-chip", children: message.category }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: message.subject })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-message-row-meta", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: message.sender }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: message.receivedAt })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: message.preview })
            ]
          },
          message.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "company-mail-viewer", children: selectedMessage ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-viewer-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-viewer-title-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "company-mail-chip strong", children: selectedMessage.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: selectedMessage.subject })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-viewer-meta", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "보낸사람" }),
              " ",
              selectedMessage.sender
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "수신일" }),
              " ",
              selectedMessage.receivedAt
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "우선순위" }),
              " ",
              selectedMessage.priority ?? "일반"
            ] })
          ] }),
          ((_a = selectedMessage.tags) == null ? void 0 : _a.length) ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "company-mail-tag-row", children: selectedMessage.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "company-mail-tag", children: [
            "#",
            tag
          ] }, tag)) }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "company-mail-body", children: selectedMessage.body.map((line, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: line }, `${selectedMessage.id}-${index}`)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "company-mail-viewer-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", children: "답장" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", children: "전달" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", children: "보관" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "표시할 메일이 없습니다." }) }) })
    ] })
  ] });
}
function LegacyPanel({ section, projectStatus, deployGuide }) {
  var _a, _b;
  if (section === "운영현황") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "legacy-panel compact-panel", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "운영 요약" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "big-progress", children: [
          ((_a = projectStatus == null ? void 0 : projectStatus.overall) == null ? void 0 : _a.percent) ?? 0,
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: ((_b = projectStatus == null ? void 0 : projectStatus.overall) == null ? void 0 : _b.status) ?? "진행도 데이터를 불러오는 중입니다." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "세부 진행도" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-list", children: ((projectStatus == null ? void 0 : projectStatus.items) ?? []).slice(0, 7).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { style: { width: `${item.percent}%` } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { children: [
            item.percent,
            "%"
          ] })
        ] }, item.category)) })
      ] })
    ] });
  }
  if (section === "주문관리") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "legacy-panel compact-panel", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-grid three", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "주문 상태" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "신규 주문 18건 · 결제대기 4건 · 출고대기 7건" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "환불/분쟁" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "요청 3건 · 검수중 2건 · SLA 경고 1건" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "정산 미리보기" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "이번 주 플랫폼 수수료 예상 ₩1,420,000" })
      ] })
    ] }) });
  }
  if (section === "보안") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "legacy-panel compact-panel", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-grid three", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "관리자 2FA" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "OTP + 백업코드 준비, 실발송 정책만 남음" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "권한체계" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "관리자/사업자/일반회원 역할별 가드 반영" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "감사로그" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "해시체인 고도화 및 운영 내보내기 정책 보완 필요" })
      ] })
    ] }) });
  }
  if (section === "포럼 분리 정책") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "legacy-panel compact-panel", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-grid two", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "매칭 규칙" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "같은 카테고리만 매칭 · 성별 조건 선택 가능 · 연령대 선택 가능 · 지역 무관/같은 지역 우선/거리기반 설정" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "대기/재탐색" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "남성 20~40초 / 여성 5~10초 재매칭 쿨다운 · 실패 시 자동 재탐색 · 과거 차단 유저 제외" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "입장/종료" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "매칭 성공 시 1:1 채팅방 자동 생성 · 수동 종료 또는 상대 차단 시 종료" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "보관/로그" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "텍스트 전용 · 메시지 30분 내 전체 삭제 가능(삭제 표기 유지) · 관리자 전체 열람/보관" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "신고 사유 기본안" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "욕설/비하 · 광고/도배 · 불법거래유도 · 성매매유도 · 개인정보요구 · 음란표현과다 · 기타 운영위반" })
      ] })
    ] });
  }
  if (section === "앱심사") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "legacy-panel compact-panel", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-grid two", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Safe 노출 체크" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "고정 상·하단 바, 공개영역 정보성 피드, 민감 상세 분리 구조 유지" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "남은 자산" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "실기기 캡처 · App Preview · 스토어 메타데이터 최종본" })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "legacy-panel compact-panel", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Cloudflare 수동 배포 가이드" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        "Pages project: ",
        (deployGuide == null ? void 0 : deployGuide.project_name) ?? "adultapp"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        "Build command: ",
        (deployGuide == null ? void 0 : deployGuide.build_command) ?? "npm run cf:build"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        "Output: ",
        (deployGuide == null ? void 0 : deployGuide.output_directory) ?? "dist"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        "Windows script: ",
        (deployGuide == null ? void 0 : deployGuide.windows_script) ?? "scripts/cloudflare_manual_deploy.ps1"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: (deployGuide == null ? void 0 : deployGuide.pages_cli) ?? "npx wrangler pages deploy dist --project-name adultapp --branch main --commit-dirty=true" })
  ] }) });
}
function copyToClipboard(text) {
  if (typeof navigator === "undefined" || !navigator.clipboard) return;
  navigator.clipboard.writeText(text).catch(() => null);
}
function formatCompactSocialCount(value) {
  if (value >= 1e4) {
    const compact = Math.floor(value / 1e4 * 10) / 10;
    return Number.isInteger(compact) ? `${compact.toFixed(0)}만` : `${compact.toFixed(1)}만`;
  }
  return value.toLocaleString();
}
function buildElementSelector(element) {
  if (element.id) return `#${element.id}`;
  const classList = Array.from(element.classList).slice(0, 3).join(".");
  const classSelector = classList ? `.${classList}` : "";
  const parent = element.parentElement;
  const siblings = parent ? Array.from(parent.children).filter((item) => item.tagName === element.tagName) : [];
  const index = siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(element) + 1})` : "";
  return `${element.tagName.toLowerCase()}${classSelector}${index}`;
}
function buildElementCssText(element) {
  const computed = window.getComputedStyle(element);
  const cssKeys = [
    "display",
    "position",
    "width",
    "height",
    "min-width",
    "min-height",
    "max-width",
    "max-height",
    "margin",
    "padding",
    "gap",
    "grid-template-columns",
    "grid-template-rows",
    "flex-direction",
    "justify-content",
    "align-items",
    "font-size",
    "font-weight",
    "line-height",
    "color",
    "background",
    "background-color",
    "border",
    "border-radius",
    "box-shadow",
    "overflow"
  ];
  return cssKeys.map((key) => `  ${key}: ${computed.getPropertyValue(key)};`).join("\n");
}
function buildInspectorModalStyle(target) {
  const rect = target.getBoundingClientRect();
  const width = Math.min(window.innerWidth - 24, 360);
  const maxHeight = Math.max(220, Math.round(window.innerHeight * 0.4));
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
  const top = Math.max(12, Math.min(rect.bottom + 10, window.innerHeight - maxHeight - 12));
  return { left: `${left}px`, top: `${top}px`, width: `${width}px`, maxHeight: `${maxHeight}px` };
}
function SettingSection({ category, isAdmin, legacySection, setLegacySection, projectStatus, deployGuide, legalDocuments, authSummary, businessInfo, releaseReadiness, paymentProviderStatus, minorPurgePreview, currentUserRole, adminModeTab, setAdminModeTab, adminDbManage, sellerApprovalQueue, productApprovalQueue, settlementPreview, htmlInspectorEnabled, setHtmlInspectorEnabled, adminDecideSeller, adminDecideProduct, accountPrivate, setAccountPrivate }) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P;
  if (category === "일반") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-grid settings-two-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "레이아웃" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "상단/하단 높이를 축소하고 각 버튼 영역을 분리한 1줄 구조를 유지합니다." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "탭 구조" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "홈/쇼핑/소통/채팅/프로필별 좌측 서브탭과 우측 검색·설정 구조를 통일했습니다." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "법정 문서" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "이용약관 ",
          ((_b = (_a = legalDocuments == null ? void 0 : legalDocuments.items) == null ? void 0 : _a.terms_of_service) == null ? void 0 : _b.version) ?? "-",
          " · 처리방침 ",
          ((_d = (_c = legalDocuments == null ? void 0 : legalDocuments.items) == null ? void 0 : _c.privacy_policy) == null ? void 0 : _d.version) ?? "-",
          " · 청소년 보호 ",
          ((_f = (_e = legalDocuments == null ? void 0 : legalDocuments.items) == null ? void 0 : _e.youth_policy) == null ? void 0 : _f.version) ?? "-"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "회원가입 화면과 고정 링크에서 항상 열람할 수 있도록 유지합니다." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "재동의 상태" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: (authSummary == null ? void 0 : authSummary.reconsent_required) || ((_g = authSummary == null ? void 0 : authSummary.consent_status) == null ? void 0 : _g.reconsent_required) ? "필수 재동의 필요" : "최신 버전 동의 상태" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "국내 출시 법적 준비" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: (releaseReadiness == null ? void 0 : releaseReadiness.status) === "blocked" ? "출시 차단 항목 존재" : (releaseReadiness == null ? void 0 : releaseReadiness.status) === "warning" ? "주의 항목 있음" : "핵심 차단 항목 없음" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "차단 ",
          ((_h = releaseReadiness == null ? void 0 : releaseReadiness.blockers) == null ? void 0 : _h.length) ?? 0,
          "건 · 주의 ",
          ((_i = releaseReadiness == null ? void 0 : releaseReadiness.warnings) == null ? void 0 : _i.length) ?? 0,
          "건"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "사업자 표시 정보" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: (businessInfo == null ? void 0 : businessInfo.complete) ? "사업자 고지 정보 확정" : "사업자/통신판매/청소년보호책임자 정보 보완 필요" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "누락: ",
          ((_j = businessInfo == null ? void 0 : businessInfo.placeholder_fields) == null ? void 0 : _j.length) ? businessInfo.placeholder_fields.join(", ") : "없음"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "입력 소스: ",
          (businessInfo == null ? void 0 : businessInfo.source) ?? "settings",
          " ",
          (businessInfo == null ? void 0 : businessInfo.beta_db_override_enabled) ? "· 베타 DB 연동 가능" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "PortOne/PASS 연동" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: (paymentProviderStatus == null ? void 0 : paymentProviderStatus.test_env_ready) ? "테스트 설정 완료" : "테스트 설정 입력 필요" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "기본 PG: ",
          (paymentProviderStatus == null ? void 0 : paymentProviderStatus.primary_provider) ?? "-",
          " · webhook: ",
          ((_k = paymentProviderStatus == null ? void 0 : paymentProviderStatus.webhook_paths) == null ? void 0 : _k.payment) ?? "-"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "SDK: ",
          (paymentProviderStatus == null ? void 0 : paymentProviderStatus.portone_sdk_installed) ? "설치됨" : "미설치",
          " · env 분리: ",
          (paymentProviderStatus == null ? void 0 : paymentProviderStatus.payments_env_split_enabled) ? "활성화" : "비활성화"
        ] })
      ] })
    ] });
  }
  if (category === "계정") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-grid settings-two-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "현재 역할" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: currentUserRole })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "프로필 접근" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "내정보, 작성 글, 업로드 상품, 통계 카드를 확인할 수 있습니다." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "계정비공개" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "ON으로 할 경우 상호 팔로잉한 계정 외에는 계정이 비공개됩니다." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "toggle-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `toggle-btn ${accountPrivate ? "active" : ""}`, onClick: () => setAccountPrivate(true), children: "ON" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `toggle-btn ${!accountPrivate ? "active" : ""}`, onClick: () => setAccountPrivate(false), children: "OFF" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "muted-mini", children: [
          "현재 상태: ",
          accountPrivate ? "상호 팔로잉 외 비공개" : "공개"
        ] })
      ] })
    ] });
  }
  if (category === "알림") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-grid settings-two-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "주문/결제 알림" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "주문상태, 결제대기, 환불 요청을 목록 기준으로 묶어 표시합니다." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "채팅 알림" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "운영문의 채팅, 주문/판매자 응답, 질문응답 알림을 분리해서 보여줍니다." })
      ] })
    ] });
  }
  if (category === "보안") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-grid settings-two-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "권한 가드" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "관리자 전용 운영 항목은 관리자 계정일 때만 노출됩니다." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "API 연결" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Production API timeout/fallback과 재시도를 유지합니다." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "인증 상태" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "본인확인 ",
          (authSummary == null ? void 0 : authSummary.identity_verified) ? "완료" : "미완료",
          " · 성인인증 ",
          (authSummary == null ? void 0 : authSummary.adult_verified) ? "완료" : "미완료",
          " · 제한 포럼 권한 ",
          (authSummary == null ? void 0 : authSummary.adult_verified) ? "심사 가능" : "성인인증 필요"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "운영 보호장치" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "로그인·채팅·신고·주문 API는 서버 기준 rate limit, 감사로그, 성인 가드, 텍스트 필터를 적용하는 방향으로 정리했습니다." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "미성년 차단 파기 배치" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          (minorPurgePreview == null ? void 0 : minorPurgePreview.enabled) ? "배치 정책 활성" : "배치 정책 비활성",
          " · cron ",
          (minorPurgePreview == null ? void 0 : minorPurgePreview.cron) ?? "-"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "현재 파기 후보 ",
          (minorPurgePreview == null ? void 0 : minorPurgePreview.candidate_count) ?? 0,
          "건 · 보관 ",
          (minorPurgePreview == null ? void 0 : minorPurgePreview.retention_days) ?? 365,
          "일"
        ] })
      ] })
    ] });
  }
  if (category === "배포") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-grid settings-two-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Cloudflare Pages" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          (deployGuide == null ? void 0 : deployGuide.project_name) ?? "adultapp",
          " · dist 업로드 기준"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "진행도" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: ((_l = projectStatus == null ? void 0 : projectStatus.overall) == null ? void 0 : _l.status) ?? "진행도 데이터 로딩중" })
      ] })
    ] });
  }
  if (["관리자모드", "DB관리", "신고", "채팅", "기타"].includes(category)) {
    if (!isAdmin) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: category }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "관리자 계정에서만 확인할 수 있습니다." })
      ] });
    }
    const normalizedAdminMode = category === "관리자모드" ? adminModeTab : category;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-nav inline", children: adminModeTabs.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: `legacy-nav-btn ${normalizedAdminMode === item ? "active" : ""}`, onClick: () => setAdminModeTab(item), children: item }, item)) }),
      normalizedAdminMode === "승인" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-grid settings-two-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "판매자 승인 대기" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "초기 기준: 사업자등록증, 정산계좌 확인, 반품지, CS 연락처, 판매자 약관 동의까지 완료해야 승인합니다." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "compact-scroll-list", children: sellerApprovalQueue.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row multi-line", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: item.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.email }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                item.business_number ?? "-",
                " · ",
                item.status
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => adminDecideSeller(item.user_id, "approved"), disabled: !item.submission_complete, children: "승인" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => adminDecideSeller(item.user_id, "hold"), children: "보류" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn danger", onClick: () => adminDecideSeller(item.user_id, "rejected"), children: "반려" })
            ] })
          ] }, item.user_id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "상품 승인 대기" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "승인 전 상품은 비공개이며, 등록한 사업자만 자신의 계정에서 승인대기 상태를 볼 수 있습니다." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "compact-scroll-list", children: productApprovalQueue.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row multi-line", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: item.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                item.category,
                " · ",
                item.sku_code
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                item.status,
                " · ₩",
                item.price.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => adminDecideProduct(item.id, "approved"), children: "공개 승인" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => adminDecideProduct(item.id, "hold"), children: "보류" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn danger", onClick: () => adminDecideProduct(item.id, "rejected"), children: "반려" })
            ] })
          ] }, item.id)) })
        ] })
      ] }) : null,
      normalizedAdminMode === "정산" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-grid settings-two-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "정산 개요" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "정산 주기: ",
            ((_m = settlementPreview == null ? void 0 : settlementPreview.policy) == null ? void 0 : _m.settlement_cycle) ?? "주별 정산 예정"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "주문 ",
            ((_n = settlementPreview == null ? void 0 : settlementPreview.summary) == null ? void 0 : _n.count) ?? 0,
            "건 · 정산 예상 ",
            ((_q = (_p = (_o = settlementPreview == null ? void 0 : settlementPreview.summary) == null ? void 0 : _o.seller_receivable_total) == null ? void 0 : _p.toLocaleString) == null ? void 0 : _q.call(_p)) ?? 0,
            "원"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "증빙 발급 책임" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "직접판매 세금계산서: ",
            ((_r = settlementPreview == null ? void 0 : settlementPreview.policy) == null ? void 0 : _r.tax_invoice_direct) ?? "platform"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "중개판매 세금계산서: ",
            ((_s = settlementPreview == null ? void 0 : settlementPreview.policy) == null ? void 0 : _s.tax_invoice_marketplace) ?? "seller"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "직접판매 현금영수증: ",
            ((_t = settlementPreview == null ? void 0 : settlementPreview.policy) == null ? void 0 : _t.cash_receipt_direct) ?? "platform"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "중개판매 현금영수증: ",
            ((_u = settlementPreview == null ? void 0 : settlementPreview.policy) == null ? void 0 : _u.cash_receipt_marketplace) ?? "seller"
          ] })
        ] })
      ] }) : null,
      normalizedAdminMode === "DB관리" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-grid settings-two-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "신고 DB" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "총 ",
            ((_v = adminDbManage == null ? void 0 : adminDbManage.report) == null ? void 0 : _v.total) ?? 0,
            "건 · 상태 ",
            Object.entries(((_w = adminDbManage == null ? void 0 : adminDbManage.report) == null ? void 0 : _w.status_counts) ?? {}).map(([k2, v2]) => `${k2}:${v2}`).join(" / ") || "데이터 없음"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "채팅 DB" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "총 ",
            ((_x = adminDbManage == null ? void 0 : adminDbManage.chat) == null ? void 0 : _x.total_threads) ?? 0,
            "개 스레드 · 상태 ",
            Object.entries(((_y = adminDbManage == null ? void 0 : adminDbManage.chat) == null ? void 0 : _y.status_counts) ?? {}).map(([k2, v2]) => `${k2}:${v2}`).join(" / ") || "데이터 없음"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "현재 제재 기준" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: ((_z = adminDbManage == null ? void 0 : adminDbManage.other) == null ? void 0 : _z.random_chat_only_sanction_enabled) ? (_A = adminDbManage == null ? void 0 : adminDbManage.other) == null ? void 0 : _A.random_chat_only_sanction_policy : "랜덤채팅 전용 제재 비활성" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "관리자 열람/감사" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            ((_B = adminDbManage == null ? void 0 : adminDbManage.other) == null ? void 0 : _B.admin_access_scope) ?? "데이터 없음",
            " · 감사로그 ",
            ((_C = adminDbManage == null ? void 0 : adminDbManage.other) == null ? void 0 : _C.audit_enabled) ? "활성" : "비활성"
          ] })
        ] })
      ] }) : null,
      normalizedAdminMode === "신고" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-grid settings-two-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "신고 정책" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "결과 통지: ",
            ((_D = adminDbManage == null ? void 0 : adminDbManage.rule) == null ? void 0 : _D.report_result_notice_mode) ?? "silent",
            " · 랜덤채팅 전용 제재: ",
            ((_E = adminDbManage == null ? void 0 : adminDbManage.other) == null ? void 0 : _E.random_chat_only_sanction_policy) ?? "데이터 없음"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "최근 사유 집계: ",
            Object.entries(((_F = adminDbManage == null ? void 0 : adminDbManage.report) == null ? void 0 : _F.reason_counts) ?? {}).map(([k2, v2]) => `${k2}:${v2}`).join(" / ") || "데이터 없음"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "최근 신고" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "compact-scroll-list", children: (((_G = adminDbManage == null ? void 0 : adminDbManage.report) == null ? void 0 : _G.recent) ?? []).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
            "#",
            item.id,
            " · reporter ",
            item.reporter_id,
            " → target ",
            item.target_id,
            " · ",
            item.reason_code,
            " · ",
            item.status
          ] }, item.id)) })
        ] })
      ] }) : null,
      normalizedAdminMode === "채팅" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-grid settings-two-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "채팅 정책" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "차단 후 표시: ",
            ((_H = adminDbManage == null ? void 0 : adminDbManage.rule) == null ? void 0 : _H.blocked_thread_visibility) ?? "hard_hidden",
            " · 삭제 범위: ",
            ((_I = adminDbManage == null ? void 0 : adminDbManage.rule) == null ? void 0 : _I.message_delete_scope) ?? "delete_for_both_masked_archive"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "재시도 ",
            ((_J = adminDbManage == null ? void 0 : adminDbManage.rule) == null ? void 0 : _J.match_retry_limit) ?? 0,
            "회 · 최대 탐색 ",
            ((_K = adminDbManage == null ? void 0 : adminDbManage.rule) == null ? void 0 : _K.match_search_timeout_seconds) ?? 0,
            "초 · 미디어 ",
            ((_L = adminDbManage == null ? void 0 : adminDbManage.rule) == null ? void 0 : _L.media_message_mode) ?? "text_only"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "관리자모드는 현재 조회 전용이며, 실제 수정 기능은 열려 있지 않습니다." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "최근 랜덤채팅 스레드" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "compact-scroll-list", children: (((_M = adminDbManage == null ? void 0 : adminDbManage.chat) == null ? void 0 : _M.recent) ?? []).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
            "#",
            item.id,
            " · ",
            item.subject,
            " · ",
            item.status,
            " · ",
            item.participant_a_id,
            "/",
            item.participant_b_id
          ] }, item.id)) })
        ] })
      ] }) : null,
      normalizedAdminMode === "기타" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-grid settings-two-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "재가입/보존" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "영구정지 재가입 재심사: ",
            ((_N = adminDbManage == null ? void 0 : adminDbManage.other) == null ? void 0 : _N.permanent_ban_rejoin_after_days) ?? 365,
            "일 후 가능"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "메시지 자가 삭제 허용: ",
            ((_O = adminDbManage == null ? void 0 : adminDbManage.rule) == null ? void 0 : _O.self_message_delete_window_minutes) ?? 30,
            "분"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "최근 관리자 로그" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "compact-scroll-list", children: (((_P = adminDbManage == null ? void 0 : adminDbManage.other) == null ? void 0 : _P.recent_logs) ?? []).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
            "#",
            item.id,
            " · ",
            item.action_type,
            " · ",
            item.target_type,
            ":",
            item.target_id,
            " · admin ",
            item.admin_id
          ] }, item.id)) })
        ] })
      ] }) : null
    ] });
  }
  if (category === "HTML요소") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "settings-grid settings-one-col", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "split-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "HTML 요소 추출" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `toggle-pill ${htmlInspectorEnabled ? "on" : "off"}`, onClick: () => setHtmlInspectorEnabled(!htmlInspectorEnabled), children: htmlInspectorEnabled ? "ON" : "OFF" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "ON 상태에서 Ctrl + 마우스 왼쪽 클릭으로 원하는 레이아웃 요소를 선택하면 팝업에서 HTML, selector, 핵심 스타일을 복사할 수 있습니다." })
    ] }) });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "운영" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "관리자 계정에서만 확인할 수 있습니다." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-nav inline", children: legacyMenu.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: `legacy-nav-btn ${legacySection === item ? "active" : ""}`, onClick: () => setLegacySection(item), children: item }, item)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LegacyPanel, { section: legacySection, projectStatus, deployGuide })
  ] });
}
function App() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K;
  const desktopPaneContext = readDesktopPaneContext();
  const [windowWidth, setWindowWidth] = reactExports.useState(() => typeof window !== "undefined" ? window.innerWidth : 0);
  const [activeTab, setActiveTab] = reactExports.useState(desktopPaneContext.initialTab);
  const [authBootstrapDone, setAuthBootstrapDone] = reactExports.useState(false);
  const [legacySection, setLegacySection] = reactExports.useState("운영현황");
  const [overlayMode, setOverlayMode] = reactExports.useState(null);
  const [htmlInspectorEnabled, setHtmlInspectorEnabled] = reactExports.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_html_inspector_enabled") === "1";
  });
  const [inspectedElement, setInspectedElement] = reactExports.useState(null);
  const inspectedTargetRef = reactExports.useRef(null);
  const [globalKeyword, setGlobalKeyword] = reactExports.useState("");
  const deferredGlobalKeyword = reactExports.useDeferredValue(globalKeyword);
  const [searchFilter, setSearchFilter] = reactExports.useState("전체");
  const [searchSection, setSearchSection] = reactExports.useState("피드결과");
  const [notificationView, setNotificationView] = reactExports.useState({ view: "list", section: null, item: null });
  const [notificationSectionPage, setNotificationSectionPage] = reactExports.useState(1);
  const [notificationSectionPageSize, setNotificationSectionPageSize] = reactExports.useState(8);
  const [notificationItems, setNotificationItems] = reactExports.useState(() => {
    if (typeof window === "undefined") return notificationSeed;
    try {
      const stored = JSON.parse(window.localStorage.getItem("adultapp_notification_items") ?? "null");
      return Array.isArray(stored) && stored.length ? stored : notificationSeed;
    } catch {
      return notificationSeed;
    }
  });
  const [homeTab, setHomeTab] = reactExports.useState("피드");
  const [shoppingTab, setShoppingTab] = reactExports.useState("홈");
  const [communityTab, setCommunityTab] = reactExports.useState("커뮤");
  const [chatTab, setChatTab] = reactExports.useState("채팅");
  const [chatQuestionDraft, setChatQuestionDraft] = reactExports.useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("adultapp_chat_question_draft") ?? "";
  });
  const [chatQuestionAnonymous, setChatQuestionAnonymous] = reactExports.useState(false);
  const [chatCategory, setChatCategory] = reactExports.useState("전체");
  const [chatVisibleCount, setChatVisibleCount] = reactExports.useState(30);
  const [activeChatThreadId, setActiveChatThreadId] = reactExports.useState(null);
  const [chatRoomDraft, setChatRoomDraft] = reactExports.useState("");
  const [chatMessagesByThread, setChatMessagesByThread] = reactExports.useState(() => {
    const merged = [...threadSeed, ...archivedThreadSeed];
    return Object.fromEntries(merged.map((thread) => [thread.id, createThreadRoomSeed(thread)]));
  });
  const [chatAttachmentSheetOpen, setChatAttachmentSheetOpen] = reactExports.useState(false);
  const [chatEmojiSheetOpen, setChatEmojiSheetOpen] = reactExports.useState(false);
  const [chatEmojiMode, setChatEmojiMode] = reactExports.useState("이모티콘");
  const [chatEmojiKeyword, setChatEmojiKeyword] = reactExports.useState("");
  const [chatEmojiCollectionKey, setChatEmojiCollectionKey] = reactExports.useState("recent");
  const [chatRecentPickerItems, setChatRecentPickerItems] = reactExports.useState(() => ({ ...DEFAULT_CHAT_RECENT_PICKER_ITEMS }));
  const [chatReplyTarget, setChatReplyTarget] = reactExports.useState(null);
  const [chatContextMessage, setChatContextMessage] = reactExports.useState(null);
  const [chatPinnedMessageByThread, setChatPinnedMessageByThread] = reactExports.useState({});
  const [chatEditableMessageId, setChatEditableMessageId] = reactExports.useState(null);
  const [chatSelectableMessageId, setChatSelectableMessageId] = reactExports.useState(null);
  const [chatShareMessage, setChatShareMessage] = reactExports.useState(null);
  const [chatShareKeyword, setChatShareKeyword] = reactExports.useState("");
  const [chatLongPressHint, setChatLongPressHint] = reactExports.useState("");
  const [chatCopiedSelection, setChatCopiedSelection] = reactExports.useState("");
  const [selectedForumCategory, setSelectedForumCategory] = reactExports.useState("자유대화");
  const [activeForumRoomId, setActiveForumRoomId] = reactExports.useState(null);
  const [forumRoomMessages, setForumRoomMessages] = reactExports.useState({});
  const [profileTab, setProfileTab] = reactExports.useState("내정보");
  const [settingsCategory, setSettingsCategory] = reactExports.useState("일반");
  const [adminModeTab, setAdminModeTab] = reactExports.useState("DB관리");
  const [selectedShopCategory, setSelectedShopCategory] = reactExports.useState("전체");
  const [shopKeywordSignals, setShopKeywordSignals] = reactExports.useState(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("adultapp_shop_keyword_signals") ?? "{}");
    } catch {
      return {};
    }
  });
  const [shortsKeywordSignals, setShortsKeywordSignals] = reactExports.useState(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("adultapp_shorts_keyword_signals") ?? "{}");
    } catch {
      return {};
    }
  });
  const [selectedCommunityCategory, setSelectedCommunityCategory] = reactExports.useState("전체");
  const [communityPrimaryFilter, setCommunityPrimaryFilter] = reactExports.useState("전체");
  const [communitySecondaryFilter, setCommunitySecondaryFilter] = reactExports.useState("전체");
  const [communityExplorerStage, setCommunityExplorerStage] = reactExports.useState("list");
  const [selectedCommunityPost, setSelectedCommunityPost] = reactExports.useState(null);
  const [testProfile, setTestProfile] = reactExports.useState({ gender: "선택 안 함", ageBand: "20대", focus: "자기이해" });
  const [testAnswers, setTestAnswers] = reactExports.useState({});
  const [randomRoomCategory, setRandomRoomCategory] = reactExports.useState("전체");
  const [oneToOneCategory, setOneToOneCategory] = reactExports.useState("고민상담");
  const [randomGenderOption, setRandomGenderOption] = reactExports.useState("무관");
  const [randomAgeMin, setRandomAgeMin] = reactExports.useState(20);
  const [randomAgeMax, setRandomAgeMax] = reactExports.useState(39);
  const [randomRegionOption, setRandomRegionOption] = reactExports.useState("무관");
  const [randomDistanceMinKm, setRandomDistanceMinKm] = reactExports.useState(0);
  const [randomDistanceMaxKm, setRandomDistanceMaxKm] = reactExports.useState(60);
  const [randomEntryTab, setRandomEntryTab] = reactExports.useState("시작");
  const [activeRandomRoomId, setActiveRandomRoomId] = reactExports.useState(null);
  const [randomNow, setRandomNow] = reactExports.useState(() => Date.now());
  const [randomSettingsOpen, setRandomSettingsOpen] = reactExports.useState(false);
  const [matchingRandom, setMatchingRandom] = reactExports.useState(false);
  const [matchedRandomUser, setMatchedRandomUser] = reactExports.useState(null);
  const [randomMatchPhase, setRandomMatchPhase] = reactExports.useState("idle");
  const [randomMatchNote, setRandomMatchNote] = reactExports.useState("앱 공개영역에서는 직접 매칭을 제공하지 않습니다. 민감한 정보교류는 성인인증·승인제 제한 웹 포럼으로만 분리합니다.");
  const [shopKeyword, setShopKeyword] = reactExports.useState("");
  const [shopSearchVisibleCount, setShopSearchVisibleCount] = reactExports.useState(12);
  const [shopSearchFilterPanelOpen, setShopSearchFilterPanelOpen] = reactExports.useState(false);
  const [shopSearchPriceMin, setShopSearchPriceMin] = reactExports.useState("");
  const [shopSearchPriceMax, setShopSearchPriceMax] = reactExports.useState("");
  const [shopSearchColor, setShopSearchColor] = reactExports.useState("전체");
  const [shopSearchPurpose, setShopSearchPurpose] = reactExports.useState("전체");
  const [shopHomeSort, setShopHomeSort] = reactExports.useState("추천");
  const [shopHomeBannerIndex, setShopHomeBannerIndex] = reactExports.useState(0);
  const [shopHomeBannerDragOffset, setShopHomeBannerDragOffset] = reactExports.useState(0);
  const shopHomeBannerPointerStartXRef = reactExports.useRef(null);
  const shopHomeBannerPointerActiveRef = reactExports.useRef(false);
  const shopHomeGridScrollRef = reactExports.useRef(null);
  const shopHomeGridDragStartYRef = reactExports.useRef(null);
  const shopHomeGridDragStartScrollTopRef = reactExports.useRef(0);
  const shopHomeGridDraggingRef = reactExports.useRef(false);
  const shopHomeGridHasDraggedRef = reactExports.useRef(false);
  const shopHomeGridSuppressClickUntilRef = reactExports.useRef(0);
  const chatMessageHoldTimerRef = reactExports.useRef(null);
  const chatMessageListRef = reactExports.useRef(null);
  const [shopHomeGridDragging, setShopHomeGridDragging] = reactExports.useState(false);
  const [shopHomeVisibleCount, setShopHomeVisibleCount] = reactExports.useState(9);
  const [communityKeyword, setCommunityKeyword] = reactExports.useState("");
  const [communityPage, setCommunityPage] = reactExports.useState(1);
  const [projectStatus, setProjectStatus] = reactExports.useState(null);
  const [deployGuide, setDeployGuide] = reactExports.useState(null);
  const [legalDocuments, setLegalDocuments] = reactExports.useState(null);
  const [businessInfo, setBusinessInfo] = reactExports.useState(null);
  const [releaseReadiness, setReleaseReadiness] = reactExports.useState(null);
  const [paymentProviderStatus, setPaymentProviderStatus] = reactExports.useState(null);
  const [productDetail, setProductDetail] = reactExports.useState(null);
  const [selectedProductId, setSelectedProductId] = reactExports.useState(null);
  const [productDetailQuantity, setProductDetailQuantity] = reactExports.useState(1);
  const [selectedProductOption, setSelectedProductOption] = reactExports.useState("");
  const [productDetailMediaIndex, setProductDetailMediaIndex] = reactExports.useState(0);
  const [adultGateStatus, setAdultGateStatus] = reactExports.useState(null);
  const [adultBirthdate, setAdultBirthdate] = reactExports.useState("1990-01-01");
  const [minorPurgePreview, setMinorPurgePreview] = reactExports.useState(null);
  const [uiCategoryGroups, setUiCategoryGroups] = reactExports.useState([]);
  const [skuPolicy, setSkuPolicy] = reactExports.useState(null);
  const [authSummary, setAuthSummary] = reactExports.useState(null);
  const [adminDbManage, setAdminDbManage] = reactExports.useState(null);
  const [randomRooms, setRandomRooms] = reactExports.useState(randomRoomSeed);
  const [roomModalOpen, setRoomModalOpen] = reactExports.useState(false);
  const [newRoomCategory, setNewRoomCategory] = reactExports.useState("관계역할/고민");
  const [newRoomTitle, setNewRoomTitle] = reactExports.useState("");
  const [newRoomAnonymous, setNewRoomAnonymous] = reactExports.useState(true);
  const [newRoomMaxPeople, setNewRoomMaxPeople] = reactExports.useState("8");
  const [newRoomPassword, setNewRoomPassword] = reactExports.useState("");
  const [currentUserRole, setCurrentUserRole] = reactExports.useState(() => {
    if (typeof window === "undefined") return "GUEST";
    return (window.localStorage.getItem("adultapp_demo_role") ?? "GUEST").toUpperCase();
  });
  const [selectedAskProfile, setSelectedAskProfile] = reactExports.useState(null);
  const [demoLoginProvider, setDemoLoginProvider] = reactExports.useState(() => {
    if (typeof window === "undefined") return "카카오";
    return window.localStorage.getItem("adultapp_demo_login_provider") ?? "카카오";
  });
  const [identityVerified, setIdentityVerified] = reactExports.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_identity_verified") === "1";
  });
  const [adultVerified, setAdultVerified] = reactExports.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_adult_verified") === "1";
  });
  const [groupRoomSuspendedUntil, setGroupRoomSuspendedUntil] = reactExports.useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem("adultapp_group_room_suspended_until") ?? "0");
  });
  const [adultGateView, setAdultGateView] = reactExports.useState("intro");
  const [adultFailCount, setAdultFailCount] = reactExports.useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem("adultapp_adult_fail_count") ?? "0");
  });
  const [adultCooldownUntil, setAdultCooldownUntil] = reactExports.useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem("adultapp_adult_cooldown_until") ?? "0");
  });
  const [adultPromptOpen, setAdultPromptOpen] = reactExports.useState(false);
  const [signupStep, setSignupStep] = reactExports.useState("consent");
  const [signupLegalOpen, setSignupLegalOpen] = reactExports.useState(null);
  const [signupConsentModal, setSignupConsentModal] = reactExports.useState(null);
  const [identityMethod, setIdentityMethod] = reactExports.useState(() => {
    if (typeof window === "undefined") return "미완료";
    return window.localStorage.getItem("adultapp_identity_method") ?? "미완료";
  });
  const [identityVerificationToken, setIdentityVerificationToken] = reactExports.useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("adultapp_identity_token") ?? "";
  });
  const [signupConsents, setSignupConsents] = reactExports.useState(() => {
    if (typeof window === "undefined") return defaultSignupConsents;
    const raw = window.localStorage.getItem("adultapp_signup_consents");
    if (!raw) return defaultSignupConsents;
    try {
      return { ...defaultSignupConsents, ...JSON.parse(raw) };
    } catch {
      return defaultSignupConsents;
    }
  });
  const [signupForm, setSignupForm] = reactExports.useState(() => {
    if (typeof window === "undefined") return defaultSignupForm;
    const raw = window.localStorage.getItem("adultapp_signup_form");
    if (!raw) return defaultSignupForm;
    try {
      return { ...defaultSignupForm, ...JSON.parse(raw) };
    } catch {
      return defaultSignupForm;
    }
  });
  const [demoProfile, setDemoProfile] = reactExports.useState(() => {
    if (typeof window === "undefined") return defaultDemoProfile;
    const raw = window.localStorage.getItem("adultapp_demo_profile");
    if (!raw) return defaultDemoProfile;
    try {
      return { ...defaultDemoProfile, ...JSON.parse(raw) };
    } catch {
      return defaultDemoProfile;
    }
  });
  const [sellerVerification, setSellerVerification] = reactExports.useState(() => {
    if (typeof window === "undefined") return defaultSellerVerification;
    const raw = window.localStorage.getItem("adultapp_seller_verification");
    if (!raw) return defaultSellerVerification;
    try {
      return { ...defaultSellerVerification, ...JSON.parse(raw) };
    } catch {
      return defaultSellerVerification;
    }
  });
  const [productRegistrationDraft, setProductRegistrationDraft] = reactExports.useState(() => ({ category: "", name: "", imageUrls: ["", "", "", "", ""], description: "", price: "", stockQty: "", skuCode: "" }));
  const [desktopProductEditId, setDesktopProductEditId] = reactExports.useState(null);
  const [desktopProductEditorOpen, setDesktopProductEditorOpen] = reactExports.useState(false);
  const [desktopProductSelectedIds, setDesktopProductSelectedIds] = reactExports.useState([]);
  const [desktopProductCrudMessage, setDesktopProductCrudMessage] = reactExports.useState("");
  const [desktopProductCrudBusy, setDesktopProductCrudBusy] = reactExports.useState(false);
  const [desktopOrderStageFilter, setDesktopOrderStageFilter] = reactExports.useState("전체");
  const [desktopOrderDatePreset, setDesktopOrderDatePreset] = reactExports.useState("전체");
  const [desktopOrderStartDate, setDesktopOrderStartDate] = reactExports.useState("");
  const [desktopOrderEndDate, setDesktopOrderEndDate] = reactExports.useState("");
  const [desktopOrderDeliveryFilter, setDesktopOrderDeliveryFilter] = reactExports.useState("전체");
  const [desktopOrderSearchField, setDesktopOrderSearchField] = reactExports.useState("주문번호");
  const [desktopOrderSearchInput, setDesktopOrderSearchInput] = reactExports.useState("");
  const [desktopOrderSearchKeyword, setDesktopOrderSearchKeyword] = reactExports.useState("");
  const [desktopOrderSelectedNos, setDesktopOrderSelectedNos] = reactExports.useState([]);
  const [desktopSettlementPeriod, setDesktopSettlementPeriod] = reactExports.useState("월");
  const [submittedProducts, setSubmittedProducts] = reactExports.useState(() => []);
  const [sellerApprovalQueue, setSellerApprovalQueue] = reactExports.useState([]);
  const [productApprovalQueue, setProductApprovalQueue] = reactExports.useState([]);
  const [sellerProducts, setSellerProducts] = reactExports.useState([]);
  const [settlementPreview, setSettlementPreview] = reactExports.useState(null);
  const [paymentReviewReady, setPaymentReviewReady] = reactExports.useState(null);
  const [ledgerOverview, setLedgerOverview] = reactExports.useState(null);
  const [threadItems, setThreadItems] = reactExports.useState([...threadSeed, ...archivedThreadSeed]);
  const [chatListMode, setChatListMode] = reactExports.useState("threads");
  const [chatRequestItems, setChatRequestItems] = reactExports.useState(incomingChatRequestSeed);
  const [selectedChatRequestId, setSelectedChatRequestId] = reactExports.useState(((_a = incomingChatRequestSeed[0]) == null ? void 0 : _a.id) ?? null);
  const [forumTopic, setForumTopic] = reactExports.useState("제품 이야기");
  const [followingUserIds, setFollowingUserIds] = reactExports.useState([301, 303, 304]);
  const [followerUserIds] = reactExports.useState(forumStarterUsers.filter((item) => item.followsMe).map((item) => item.id));
  const [pendingDmUser, setPendingDmUser] = reactExports.useState(null);
  const [dmRuleChecks, setDmRuleChecks] = reactExports.useState({});
  const [accountPrivate, setAccountPrivate] = reactExports.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_account_private") === "1";
  });
  const [headerFavorites, setHeaderFavorites] = reactExports.useState(() => {
    var _a2, _b2, _c2, _d2, _e2;
    if (typeof window === "undefined") return defaultHeaderFavorites;
    try {
      const raw = window.localStorage.getItem("adultapp_header_favorites");
      if (!raw) return defaultHeaderFavorites;
      const parsed = JSON.parse(raw);
      return {
        "홈": ((_a2 = parsed["홈"]) == null ? void 0 : _a2.length) ? parsed["홈"] : defaultHeaderFavorites["홈"],
        "쇼핑": ((_b2 = parsed["쇼핑"]) == null ? void 0 : _b2.length) ? parsed["쇼핑"] : defaultHeaderFavorites["쇼핑"],
        "소통": ((_c2 = parsed["소통"]) == null ? void 0 : _c2.length) ? parsed["소통"] : defaultHeaderFavorites["소통"],
        "채팅": ((_d2 = parsed["채팅"]) == null ? void 0 : _d2.length) ? parsed["채팅"] : defaultHeaderFavorites["채팅"],
        "프로필": ((_e2 = parsed["프로필"]) == null ? void 0 : _e2.length) ? parsed["프로필"] : defaultHeaderFavorites["프로필"]
      };
    } catch {
      return defaultHeaderFavorites;
    }
  });
  const [savedFeedIds, setSavedFeedIds] = reactExports.useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("adultapp_saved_feed_ids") ?? "[]");
    } catch {
      return [];
    }
  });
  const [likedFeedIds, setLikedFeedIds] = reactExports.useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("adultapp_liked_feed_ids") ?? "[]");
    } catch {
      return [];
    }
  });
  const [repostedFeedIds, setRepostedFeedIds] = reactExports.useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("adultapp_reposted_feed_ids") ?? "[]");
    } catch {
      return [];
    }
  });
  const [feedCommentMap, setFeedCommentMap] = reactExports.useState(() => {
    const fallback = Object.fromEntries(feedSeed.map((item) => [item.id, [
      { id: item.id * 100 + 1, author: "trend_user", text: `${item.title} 분위기 괜찮네요.`, meta: "방금" },
      { id: item.id * 100 + 2, author: "care_note", text: `${item.category} 기준으로 더 보고 싶어요.`, meta: "3분 전" }
    ]]));
    if (typeof window === "undefined") return fallback;
    try {
      const stored = window.localStorage.getItem("adultapp_feed_comment_map");
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  });
  const [openFeedCommentItem, setOpenFeedCommentItem] = reactExports.useState(null);
  const [customFeedItems, setCustomFeedItems] = reactExports.useState([]);
  const [feedComposeOpen, setFeedComposeOpen] = reactExports.useState(false);
  const [feedComposeLauncherOpen, setFeedComposeLauncherOpen] = reactExports.useState(false);
  const [feedComposeMode, setFeedComposeMode] = reactExports.useState("피드게시");
  const [homeFeedFilter, setHomeFeedFilter] = reactExports.useState("일반");
  const [feedComposeTitle, setFeedComposeTitle] = reactExports.useState("");
  const [feedComposeCaption, setFeedComposeCaption] = reactExports.useState("");
  const [feedComposeAttachment, setFeedComposeAttachment] = reactExports.useState(null);
  const [feedComposeBusy, setFeedComposeBusy] = reactExports.useState(false);
  const [feedComposeHelperText, setFeedComposeHelperText] = reactExports.useState("최대 1개 첨부 · 영상은 최대 20초 / 30MB · 권장 MP4(H.264) 또는 WEBM");
  const [feedCommentDrafts, setFeedCommentDrafts] = reactExports.useState(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("adultapp_feed_comment_drafts") ?? "{}");
    } catch {
      return {};
    }
  });
  const [feedCommentAttachments, setFeedCommentAttachments] = reactExports.useState(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("adultapp_feed_comment_attachments") ?? "{}");
    } catch {
      return {};
    }
  });
  const [feedCommentAttachmentBusyId, setFeedCommentAttachmentBusyId] = reactExports.useState(null);
  const [viewedProfileAuthor, setViewedProfileAuthor] = reactExports.useState(null);
  const [profileSection, setProfileSection] = reactExports.useState("게시물");
  const [profileEditMode, setProfileEditMode] = reactExports.useState(false);
  const [profileEditDraft, setProfileEditDraft] = reactExports.useState(defaultDemoProfile);
  const [profileNicknameEditUnlocked, setProfileNicknameEditUnlocked] = reactExports.useState(false);
  const [followedFeedAuthors, setFollowedFeedAuthors] = reactExports.useState(() => {
    if (typeof window === "undefined") return ["adult official", "seller studio"];
    try {
      return JSON.parse(window.localStorage.getItem("adultapp_followed_feed_authors") ?? '["adult official","seller studio"]');
    } catch {
      return ["adult official", "seller studio"];
    }
  });
  const [savedProductIds, setSavedProductIds] = reactExports.useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("adultapp_saved_product_ids") ?? "[]");
    } catch {
      return [];
    }
  });
  const [savedTab, setSavedTab] = reactExports.useState("피드");
  const [shortsVisibleCount, setShortsVisibleCount] = reactExports.useState(10);
  const [profileShortsVisibleCount, setProfileShortsVisibleCount] = reactExports.useState(10);
  const [homeFeedVisibleCount, setHomeFeedVisibleCount] = reactExports.useState(() => {
    if (typeof window === "undefined") return HOME_FEED_BATCH_SIZE;
    const stored = readHomeFeedPersistedState();
    if (isHomeFeedStateExpired(stored)) return HOME_FEED_BATCH_SIZE;
    return Math.max(HOME_FEED_BATCH_SIZE, stored.visibleCount ?? HOME_FEED_BATCH_SIZE);
  });
  const [homeFeedHeaderHidden, setHomeFeedHeaderHidden] = reactExports.useState(false);
  const [homeFeedRefreshing, setHomeFeedRefreshing] = reactExports.useState(false);
  const [homeFeedPullDistance, setHomeFeedPullDistance] = reactExports.useState(0);
  const [feedAvatarPreviewItem, setFeedAvatarPreviewItem] = reactExports.useState(null);
  const homeFeedScrollRef = reactExports.useRef(null);
  const homeFeedResetOnNextShowRef = reactExports.useRef(false);
  const lastHomeFeedScrollTopRef = reactExports.useRef(0);
  const homeFeedScrollRafRef = reactExports.useRef(null);
  const homeFeedHideThresholdRef = reactExports.useRef(0);
  const homeFeedShowThresholdRef = reactExports.useRef(0);
  const homeFeedPullActiveRef = reactExports.useRef(false);
  const homeFeedPullStartYRef = reactExports.useRef(null);
  const homeFeedViewedIdsRef = reactExports.useRef([]);
  const homeFeedRefreshUsedTemplateIdsRef = reactExports.useRef([]);
  const profileAvatarInputRef = reactExports.useRef(null);
  const allFeedItems = reactExports.useMemo(() => [...customFeedItems, ...feedSeed].map((item) => normalizeFeedItemPresentation(item)), [customFeedItems]);
  const [shortsMoreItem, setShortsMoreItem] = reactExports.useState(null);
  const [shortsViewerItemId, setShortsViewerItemId] = reactExports.useState(null);
  const [savedShortsViewerItemId, setSavedShortsViewerItemId] = reactExports.useState(null);
  const [shortsHeaderHidden, setShortsHeaderHidden] = reactExports.useState(false);
  const [shortsCategoryVisible, setShortsCategoryVisible] = reactExports.useState(true);
  const [listEndToast, setListEndToast] = reactExports.useState(null);
  const [selectedShortsCategory, setSelectedShortsCategory] = reactExports.useState("전체");
  const lastShortsScrollTopRef = reactExports.useRef(0);
  const shortsScrollRafRef = reactExports.useRef(null);
  const shortsHideThresholdRef = reactExports.useRef(0);
  const shortsShowThresholdRef = reactExports.useRef(0);
  const listEndToastTimerRef = reactExports.useRef(null);
  const [authStandaloneScreen, setAuthStandaloneScreen] = reactExports.useState(null);
  const [homeShopConsentGuideSeen, setHomeShopConsentGuideSeen] = reactExports.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("adultapp_home_shop_consent_guide_seen") === "1";
  });
  const [authEmail, setAuthEmail] = reactExports.useState("customer@example.com");
  const [authPassword, setAuthPassword] = reactExports.useState("customer1234");
  const [authMessage, setAuthMessage] = reactExports.useState("");
  const [authGatePopupOpen, setAuthGatePopupOpen] = reactExports.useState(false);
  const [apiProducts, setApiProducts] = reactExports.useState([]);
  const [cartItems, setCartItems] = reactExports.useState([]);
  const [orders, setOrders] = reactExports.useState([]);
  const [selectedOrderNo, setSelectedOrderNo] = reactExports.useState("");
  const [orderDetail, setOrderDetail] = reactExports.useState(null);
  const [orderMessage, setOrderMessage] = reactExports.useState("");
  const [orderActionAmount, setOrderActionAmount] = reactExports.useState("5500");
  const [checkoutStage, setCheckoutStage] = reactExports.useState("cart");
  const [checkoutDraft, setCheckoutDraft] = reactExports.useState({
    recipientName: "성인회원",
    phone: "010-0000-0000",
    email: "aksqhqkqh153@gmail.com",
    address: "배송지 입력 필요",
    requestNote: "익명 포장 요청"
  });
  const isAdmin = ["ADMIN", "1", "GRADE_1"].includes(currentUserRole);
  const companyMailHostLocked = reactExports.useMemo(() => isCompanyMailHostLocked(), []);
  const [companyMailPreviewOpen, setCompanyMailPreviewOpen] = reactExports.useState(() => isCompanyMailRouteActive());
  const companyMailMode = companyMailHostLocked || companyMailPreviewOpen;
  const companyMailHostLabel = reactExports.useMemo(() => {
    if (typeof window === "undefined") return "숨김 경로 미리보기";
    const host = window.location.host;
    const path = window.location.pathname;
    return `${host}${path === "/" ? "" : path}`;
  }, [companyMailMode]);
  const persistHomeFeedState = reactExports.useCallback((patch = {}) => {
    var _a2;
    if (typeof window === "undefined") return;
    const previous = readHomeFeedPersistedState();
    const nextState = {
      ...previous,
      visibleCount: patch.visibleCount ?? homeFeedVisibleCount,
      scrollTop: patch.scrollTop ?? ((_a2 = homeFeedScrollRef.current) == null ? void 0 : _a2.scrollTop) ?? previous.scrollTop ?? 0,
      lastInactiveAt: patch.lastInactiveAt ?? previous.lastInactiveAt ?? 0
    };
    window.localStorage.setItem(HOME_FEED_STATE_KEY, JSON.stringify(nextState));
  }, [homeFeedVisibleCount]);
  const navigationHistoryRef = reactExports.useRef([]);
  const navigationSnapshotRef = reactExports.useRef(null);
  const navigationRestoreRef = reactExports.useRef(false);
  const browserHistoryReadyRef = reactExports.useRef(false);
  const browserHistoryIndexRef = reactExports.useRef(0);
  const suppressBrowserHistoryPushRef = reactExports.useRef(false);
  const backMinimizeTimerRef = reactExports.useRef(null);
  const lastBackPressAtRef = reactExports.useRef(0);
  const [backMinimizeHintVisible, setBackMinimizeHintVisible] = reactExports.useState(false);
  const effectiveProductDetail = productDetail ?? null;
  const effectiveSelectedProductId = effectiveProductDetail ? selectedProductId : null;
  const currentNavigationSnapshot = reactExports.useMemo(() => ({
    activeTab,
    homeTab,
    shoppingTab,
    communityTab,
    chatTab,
    profileTab,
    settingsCategory,
    overlayMode,
    notificationView,
    activeRandomRoomId,
    randomEntryTab,
    roomModalOpen,
    selectedAskProfile,
    productDetail: effectiveProductDetail,
    selectedProductId: effectiveSelectedProductId,
    openFeedCommentItem,
    feedComposeOpen,
    viewedProfileAuthor,
    profileSection,
    authStandaloneScreen,
    adultPromptOpen,
    checkoutStage,
    companyMailPreviewOpen,
    randomSettingsOpen,
    shortsMoreItem,
    shortsViewerItemId,
    savedShortsViewerItemId,
    savedTab
  }), [
    activeTab,
    homeTab,
    shoppingTab,
    communityTab,
    chatTab,
    profileTab,
    settingsCategory,
    overlayMode,
    notificationView,
    activeRandomRoomId,
    randomEntryTab,
    roomModalOpen,
    selectedAskProfile,
    effectiveProductDetail,
    effectiveSelectedProductId,
    openFeedCommentItem,
    feedComposeOpen,
    viewedProfileAuthor,
    profileSection,
    authStandaloneScreen,
    adultPromptOpen,
    checkoutStage,
    companyMailPreviewOpen,
    randomSettingsOpen,
    shortsMoreItem,
    shortsViewerItemId,
    savedShortsViewerItemId,
    savedTab
  ]);
  const hideBackMinimizeHint = reactExports.useCallback(() => {
    if (typeof window !== "undefined" && backMinimizeTimerRef.current !== null) {
      window.clearTimeout(backMinimizeTimerRef.current);
      backMinimizeTimerRef.current = null;
    }
    setBackMinimizeHintVisible(false);
  }, []);
  const showBackMinimizeHint = reactExports.useCallback(() => {
    hideBackMinimizeHint();
    lastBackPressAtRef.current = Date.now();
    setBackMinimizeHintVisible(true);
    if (typeof window !== "undefined") {
      backMinimizeTimerRef.current = window.setTimeout(() => {
        setBackMinimizeHintVisible(false);
        backMinimizeTimerRef.current = null;
      }, APP_BACK_MINIMIZE_WINDOW_MS);
    }
  }, [hideBackMinimizeHint]);
  const isHomeNavigationSnapshot = reactExports.useCallback((snapshot) => snapshot.activeTab === "홈" && snapshot.homeTab === "피드" && snapshot.overlayMode === null && snapshot.notificationView.view === "list" && snapshot.notificationView.section === null && snapshot.notificationView.item === null && !snapshot.roomModalOpen && !snapshot.selectedAskProfile && !snapshot.productDetail && snapshot.selectedProductId === null && !snapshot.openFeedCommentItem && !snapshot.feedComposeOpen && snapshot.authStandaloneScreen === null && !snapshot.adultPromptOpen && snapshot.checkoutStage === "cart" && !snapshot.companyMailPreviewOpen && !snapshot.randomSettingsOpen && !snapshot.shortsMoreItem && snapshot.shortsViewerItemId === null && snapshot.savedShortsViewerItemId === null, []);
  const homeNavigationSnapshot = reactExports.useMemo(() => ({
    activeTab: "홈",
    homeTab: "피드",
    shoppingTab: "홈",
    communityTab: "커뮤",
    chatTab: "채팅",
    profileTab: "내정보",
    settingsCategory: "일반",
    overlayMode: null,
    notificationView: { view: "list", section: null, item: null },
    activeRandomRoomId: null,
    randomEntryTab: "시작",
    roomModalOpen: false,
    selectedAskProfile: null,
    productDetail: null,
    selectedProductId: null,
    openFeedCommentItem: null,
    feedComposeOpen: false,
    viewedProfileAuthor: null,
    profileSection: "게시물",
    authStandaloneScreen: null,
    adultPromptOpen: false,
    checkoutStage: "cart",
    companyMailPreviewOpen: false,
    randomSettingsOpen: false,
    shortsMoreItem: null,
    shortsViewerItemId: null,
    savedShortsViewerItemId: null,
    savedTab: "피드"
  }), []);
  const isAtHomeScreen = reactExports.useMemo(() => isHomeNavigationSnapshot(currentNavigationSnapshot), [currentNavigationSnapshot, isHomeNavigationSnapshot]);
  const shouldManageMobileBrowserBack = reactExports.useMemo(() => {
    var _a2, _b2, _c2;
    if (typeof window === "undefined") return false;
    if ((_b2 = (_a2 = window.Capacitor) == null ? void 0 : _a2.isNativePlatform) == null ? void 0 : _b2.call(_a2)) return true;
    if (windowWidth >= 1180) return false;
    const userAgent = ((_c2 = window.navigator) == null ? void 0 : _c2.userAgent) ?? "";
    return /Android|iPhone|iPad|iPod/i.test(userAgent);
  }, [windowWidth]);
  const restoreNavigationSnapshot = reactExports.useCallback((snapshot) => {
    navigationRestoreRef.current = true;
    suppressBrowserHistoryPushRef.current = true;
    hideBackMinimizeHint();
    lastBackPressAtRef.current = 0;
    setActiveTab(snapshot.activeTab);
    setHomeTab(snapshot.homeTab);
    setShoppingTab(snapshot.shoppingTab);
    setCommunityTab(snapshot.communityTab);
    setChatTab(snapshot.chatTab);
    setProfileTab(snapshot.profileTab);
    setSettingsCategory(snapshot.settingsCategory);
    setOverlayMode(snapshot.overlayMode);
    setNotificationView(JSON.parse(JSON.stringify(snapshot.notificationView)));
    setActiveRandomRoomId(snapshot.activeRandomRoomId);
    setRandomEntryTab(snapshot.randomEntryTab);
    setRoomModalOpen(snapshot.roomModalOpen);
    setSelectedAskProfile(snapshot.selectedAskProfile);
    setProductDetail(snapshot.productDetail);
    setSelectedProductId(snapshot.selectedProductId);
    setOpenFeedCommentItem(snapshot.openFeedCommentItem);
    setFeedComposeOpen(snapshot.feedComposeOpen);
    setViewedProfileAuthor(snapshot.viewedProfileAuthor);
    setProfileSection(snapshot.profileSection);
    setAuthStandaloneScreen(snapshot.authStandaloneScreen);
    setAdultPromptOpen(snapshot.adultPromptOpen);
    setCheckoutStage(snapshot.checkoutStage);
    setCompanyMailPreviewOpen(snapshot.companyMailPreviewOpen);
    setRandomSettingsOpen(snapshot.randomSettingsOpen);
    setShortsMoreItem(snapshot.shortsMoreItem);
    setShortsViewerItemId(snapshot.shortsViewerItemId);
    setSavedShortsViewerItemId(snapshot.savedShortsViewerItemId);
    setSavedTab(snapshot.savedTab);
    if (typeof window !== "undefined") {
      if (snapshot.companyMailPreviewOpen && window.location.hash.toLowerCase() !== "#corp-mail-admin") {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#corp-mail-admin`);
      }
      if (!snapshot.companyMailPreviewOpen && window.location.hash.toLowerCase() === "#corp-mail-admin") {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      }
    }
  }, [hideBackMinimizeHint]);
  const syncBrowserBackBarrier = reactExports.useCallback((mode = "push") => {
    if (typeof window === "undefined" || !shouldManageMobileBrowserBack) return;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const previousState = window.history.state && typeof window.history.state === "object" ? window.history.state : {};
    const nextIndex = mode === "replace" ? browserHistoryIndexRef.current : browserHistoryIndexRef.current + 1;
    browserHistoryIndexRef.current = nextIndex;
    const nextState = {
      ...previousState,
      [APP_BROWSER_HISTORY_STATE_KEY]: nextIndex
    };
    if (mode === "replace") {
      window.history.replaceState(nextState, "", currentUrl);
      return;
    }
    window.history.pushState(nextState, "", currentUrl);
  }, [shouldManageMobileBrowserBack]);
  const handleAppBackNavigation = reactExports.useCallback(async (source = "native") => {
    if (!authBootstrapDone) return;
    const previousSnapshot = navigationHistoryRef.current.pop();
    if (previousSnapshot) {
      restoreNavigationSnapshot(previousSnapshot);
      return;
    }
    if (!isAtHomeScreen) {
      restoreNavigationSnapshot(homeNavigationSnapshot);
      return;
    }
    const now = Date.now();
    if (now - lastBackPressAtRef.current <= APP_BACK_MINIMIZE_WINDOW_MS) {
      hideBackMinimizeHint();
      lastBackPressAtRef.current = 0;
      try {
        const nativeAppPlugin = getNativeAppPlugin();
        if (nativeAppPlugin == null ? void 0 : nativeAppPlugin.minimizeApp) {
          await nativeAppPlugin.minimizeApp();
          return;
        }
      } catch {
      }
      if (source === "history" && typeof window !== "undefined") {
        window.history.back();
      }
      return;
    }
    showBackMinimizeHint();
    if (source === "history") {
      syncBrowserBackBarrier("push");
    }
  }, [authBootstrapDone, hideBackMinimizeHint, homeNavigationSnapshot, isAtHomeScreen, restoreNavigationSnapshot, showBackMinimizeHint, syncBrowserBackBarrier]);
  const canToggleAccountMode = !isAdmin && currentUserRole !== "GUEST";
  const isBusinessAccountMode = currentUserRole === "SELLER";
  const accountModeToggleLabel = isBusinessAccountMode ? "일반회원 계정전환" : "사업자 계정전환";
  const handleAccountModeToggle = () => {
    if (!canToggleAccountMode) return;
    const nextRole = isBusinessAccountMode ? "MEMBER" : "SELLER";
    setCurrentUserRole(nextRole);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("adultapp_demo_role", nextRole);
    }
  };
  const productCategoryOptions = reactExports.useMemo(() => {
    const backendCategories = uiCategoryGroups.flatMap((group) => group.items).filter((item) => !["상품등록", "사진/영상 첨부", "SKU 관리", "재고/상태 변경"].includes(item));
    const fallbackCategories = shopCategories.flatMap((group) => group.items.map((item) => item.name));
    return [.../* @__PURE__ */ new Set([...(backendCategories.length ? backendCategories : fallbackCategories).filter(Boolean), "채팅-이모티콘"])];
  }, [uiCategoryGroups]);
  const createEmptyProductDraft = reactExports.useCallback(() => ({
    category: "",
    name: "",
    imageUrls: ["", "", "", "", ""],
    description: "",
    price: "",
    stockQty: "",
    skuCode: ""
  }), []);
  const isProductCategorySelected = Boolean(productRegistrationDraft.category.trim());
  const isChatEmoticonCategory = productRegistrationDraft.category === "채팅-이모티콘";
  const productImageInputMeta = isChatEmoticonCategory ? [
    { label: "대표 이모티콘 이미지", placeholder: "대표 이모티콘 이미지 URL 입력" },
    { label: "미리보기 이미지 1", placeholder: "미리보기 이미지 1 URL 입력" },
    { label: "미리보기 이미지 2", placeholder: "미리보기 이미지 2 URL 입력" }
  ] : [
    { label: "대표 이미지", placeholder: "대표 이미지 URL 입력" },
    { label: "추가 이미지 1", placeholder: "추가 이미지 1 URL 입력" },
    { label: "추가 이미지 2", placeholder: "추가 이미지 2 URL 입력" },
    { label: "추가 이미지 3", placeholder: "추가 이미지 3 URL 입력" },
    { label: "추가 이미지 4", placeholder: "추가 이미지 4 URL 입력" }
  ];
  const productCategorySelectRef = reactExports.useRef(null);
    const showProductCategoryRequiredAlert = reactExports.useCallback(() => {
      window.alert("카테고리 선택을 먼저 진행해주세요");
      window.setTimeout(() => {
        var _a;
        (_a = productCategorySelectRef.current) == null ? void 0 : _a.focus();
      }, 0);
    }, []);
    const guardProductCategoryRequiredInteraction = reactExports.useCallback((event) => {
      if (isProductCategorySelected) {
        return false;
      }
      event == null ? void 0 : event.preventDefault == null ? void 0 : event.preventDefault();
      showProductCategoryRequiredAlert();
      return true;
    }, [isProductCategorySelected, showProductCategoryRequiredAlert]);
    const handleProductCategoryChange = (nextCategory) => {
    setProductRegistrationDraft((prev) => ({ ...prev, category: nextCategory }));
  };
  const handleProductNameChange = (nextName) => {
    setProductRegistrationDraft((prev) => ({ ...prev, name: nextName.slice(0, 29) }));
  };
  const handleProductDescriptionChange = (nextDescription) => {
    setProductRegistrationDraft((prev) => ({ ...prev, description: nextDescription }));
  };
  const handleProductPriceChange = (nextPrice) => {
    setProductRegistrationDraft((prev) => ({ ...prev, price: nextPrice.replace(/[^0-9]/g, "") }));
  };
  const handleProductStockQtyChange = (nextStockQty) => {
    setProductRegistrationDraft((prev) => ({ ...prev, stockQty: nextStockQty.replace(/[^0-9]/g, "").slice(0, 4) }));
  };
  const handleProductSkuCodeChange = (nextSkuCode) => {
    setProductRegistrationDraft((prev) => ({ ...prev, skuCode: nextSkuCode }));
  };
  reactExports.useEffect(() => {
    setDesktopProductSelectedIds((prev) => prev.filter((id2) => sellerProducts.some((item) => item.id === id2)));
  }, [sellerProducts]);
  reactExports.useMemo(() => followingUserIds.filter((id2) => followerUserIds.includes(id2)), [followingUserIds, followerUserIds]);
  reactExports.useMemo(() => forumStarterUsers.filter((item) => item.topic === forumTopic), [forumTopic]);
  const boostShortsSignalsFromText = (source, weight = 1) => {
    const tokens = extractInterestTokens(source);
    if (!tokens.length) return;
    setShortsKeywordSignals((prev) => {
      const next = { ...prev };
      tokens.forEach((token) => {
        next[token] = (next[token] ?? 0) + weight;
      });
      return next;
    });
  };
  const openShortsViewer = (item) => {
    boostShortsSignalsFromText(`${item.title} ${item.caption} ${item.category} ${item.author}`, 2);
    setShortsViewerItemId(item.id);
  };
  const submitDmRequest = () => {
    if (!pendingDmUser) return;
    const allChecked = dmRuleNoticeItems.every((item) => dmRuleChecks[item]);
    if (!allChecked) {
      window.alert("대화 규칙 동의를 모두 체크해야 요청할 수 있습니다.");
      return;
    }
    const existing = threadItems.find((item) => item.name === pendingDmUser.name && item.kind === "개인");
    if (!existing) {
      const newThread = {
        id: Date.now(),
        name: pendingDmUser.name,
        purpose: `${pendingDmUser.topic} · 상호수락 1:1`,
        preview: `대화 요청이 전송되었습니다. 상대 수락 후 대화가 시작되며, 채팅방 상단에 ${dmRuleNoticeItems.slice(1).join(" · ")} 안내가 고정 표시됩니다.`,
        time: "방금",
        unread: 0,
        avatar: pendingDmUser.name.slice(0, 1).toUpperCase(),
        kind: "개인",
        favorite: true,
        status: "요청전송"
      };
      setThreadItems((prev) => [newThread, ...prev]);
      setChatMessagesByThread((prev) => ({ ...prev, [newThread.id]: createThreadRoomSeed(newThread) }));
      setActiveChatThreadId(newThread.id);
    } else {
      setActiveChatThreadId(existing.id);
    }
    setPendingDmUser(null);
    setChatTab("채팅");
    setChatCategory("개인");
  };
  reactExports.useEffect(() => {
    getJson("/project-status").then(setProjectStatus).catch(() => null);
    getJson("/deploy/cloudflare-pages-manual").then(setDeployGuide).catch(() => null);
    getJson("/legal/documents").then(setLegalDocuments).catch(() => null);
    getJson("/legal/business-info").then(setBusinessInfo).catch(() => null);
    getJson("/payments/provider-status").then(setPaymentProviderStatus).catch(() => null);
    getJson("/ui/category-groups").then((res) => setUiCategoryGroups(res.items ?? [])).catch(() => null);
    getJson("/sku-policy").then(setSkuPolicy).catch(() => null);
    getJson("/products").then(setApiProducts).catch(() => null);
    (async () => {
      try {
        const restored = hasAuthToken() || await ensureAuthSession();
        if (!restored) {
          setAuthSummary(null);
          setCurrentUserRole("GUEST");
          if (typeof window !== "undefined") window.localStorage.setItem("adultapp_demo_role", "GUEST");
          setOrders([]);
          setSellerProducts([]);
          return;
        }
        const me2 = await getJson("/auth/me");
        setAuthSummary(me2);
        const nextRole = String(me2.grade ?? "GUEST").toUpperCase();
        setCurrentUserRole(nextRole);
        if (typeof window !== "undefined") window.localStorage.setItem("adultapp_demo_role", nextRole);
        setIdentityVerified(Boolean(me2.identity_verified));
        setAdultVerified(Boolean(me2.adult_verified));
        getJson("/orders").then(setOrders).catch(() => null);
        getJson("/seller/products/mine").then(setSellerProducts).catch(() => null);
        if (["ADMIN", "1", "GRADE_1"].includes(nextRole)) {
          getJson("/ops/minor-purge/preview").then(setMinorPurgePreview).catch(() => null);
          getJson("/admin/seller-approvals").then((res) => setSellerApprovalQueue(res.items ?? [])).catch(() => null);
          getJson("/admin/product-approvals").then((res) => setProductApprovalQueue(res.items ?? [])).catch(() => null);
          getJson("/settlements/preview").then(setSettlementPreview).catch(() => null);
          getJson("/payments/review-ready").then(setPaymentReviewReady).catch(() => null);
          getJson("/ledger/overview").then(setLedgerOverview).catch(() => null);
        } else {
          setReleaseReadiness(null);
        }
      } catch {
        clearTokens();
        setAuthSummary(null);
        setCurrentUserRole("GUEST");
        if (typeof window !== "undefined") window.localStorage.setItem("adultapp_demo_role", "GUEST");
        setOrders([]);
        setSellerProducts([]);
      } finally {
        setAuthBootstrapDone(true);
      }
    })();
  }, []);
  reactExports.useEffect(() => {
    const timer = window.setInterval(() => setRandomNow(Date.now()), 3e4);
    return () => window.clearInterval(timer);
  }, []);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_html_inspector_enabled", htmlInspectorEnabled ? "1" : "0");
  }, [htmlInspectorEnabled]);
  reactExports.useEffect(() => {
    if (!htmlInspectorEnabled && inspectedTargetRef.current) {
      inspectedTargetRef.current.classList.remove("html-inspector-target");
      inspectedTargetRef.current = null;
      setInspectedElement(null);
    }
  }, [htmlInspectorEnabled]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_demo_login_provider", demoLoginProvider);
  }, [demoLoginProvider]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_identity_verified", identityVerified ? "1" : "0");
  }, [identityVerified]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_adult_verified", adultVerified ? "1" : "0");
  }, [adultVerified]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_adult_fail_count", String(adultFailCount));
  }, [adultFailCount]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_adult_cooldown_until", String(adultCooldownUntil));
  }, [adultCooldownUntil]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_identity_method", identityMethod);
  }, [identityMethod]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_identity_token", identityVerificationToken);
  }, [identityVerificationToken]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_signup_consents", JSON.stringify(signupConsents));
  }, [signupConsents]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_signup_form", JSON.stringify(signupForm));
  }, [signupForm]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_demo_profile", JSON.stringify(demoProfile));
  }, [demoProfile]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_seller_verification", JSON.stringify(sellerVerification));
  }, [sellerVerification]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_account_private", accountPrivate ? "1" : "0");
  }, [accountPrivate]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_home_shop_consent_guide_seen", homeShopConsentGuideSeen ? "1" : "0");
  }, [homeShopConsentGuideSeen]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_shop_keyword_signals", JSON.stringify(shopKeywordSignals));
  }, [shopKeywordSignals]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_shorts_keyword_signals", JSON.stringify(shortsKeywordSignals));
  }, [shortsKeywordSignals]);
  const lastTrackedShopSearchRef = reactExports.useRef("");
  reactExports.useEffect(() => {
    if (activeTab !== "쇼핑") return;
    const raw = `${shopKeyword} ${globalKeyword}`.trim();
    if (!raw) return;
    const normalized = raw.split(/[,#\s/]+/).map((token) => token.trim()).filter((token) => token.length >= 2).join("|").toLowerCase();
    if (!normalized || lastTrackedShopSearchRef.current === normalized) return;
    lastTrackedShopSearchRef.current = normalized;
    setShopKeywordSignals((prev) => {
      const next = { ...prev };
      normalized.split("|").forEach((token) => {
        next[token] = (next[token] ?? 0) + 1;
      });
      return next;
    });
  }, [activeTab, shopKeyword, globalKeyword]);
  const lastTrackedShortsSearchRef = reactExports.useRef("");
  reactExports.useEffect(() => {
    if (activeTab !== "홈" || homeTab !== "쇼츠") return;
    const normalized = globalKeyword.split(/[,#\s/]+/).map((token) => token.trim()).filter((token) => token.length >= 2).join("|").toLowerCase();
    if (!normalized || lastTrackedShortsSearchRef.current === normalized) return;
    lastTrackedShortsSearchRef.current = normalized;
    setShortsKeywordSignals((prev) => {
      const next = { ...prev };
      normalized.split("|").forEach((token) => {
        next[token] = (next[token] ?? 0) + 3;
      });
      return next;
    });
  }, [activeTab, homeTab, globalKeyword]);
  reactExports.useEffect(() => {
    if (!savedFeedIds.length) return;
    const savedShorts = allFeedItems.filter((item) => savedFeedIds.includes(item.id));
    if (!savedShorts.length) return;
    setShortsKeywordSignals((prev) => {
      const next = { ...prev };
      savedShorts.forEach((item) => {
        extractInterestTokens(`${item.title} ${item.caption} ${item.category} ${item.author}`).forEach((token) => {
          next[token] = Math.max(next[token] ?? 0, 2);
        });
      });
      return next;
    });
  }, [savedFeedIds]);
  reactExports.useEffect(() => {
    if (!selectedOrderNo) return;
    getJson(`/orders/${selectedOrderNo}`).then(setOrderDetail).catch(() => setOrderDetail(null));
  }, [selectedOrderNo]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_header_favorites", JSON.stringify(headerFavorites));
  }, [headerFavorites]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_saved_feed_ids", JSON.stringify(savedFeedIds));
  }, [savedFeedIds]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_liked_feed_ids", JSON.stringify(likedFeedIds));
  }, [likedFeedIds]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_reposted_feed_ids", JSON.stringify(repostedFeedIds));
  }, [repostedFeedIds]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_feed_comment_map", JSON.stringify(feedCommentMap));
  }, [feedCommentMap]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_feed_comment_drafts", JSON.stringify(feedCommentDrafts));
  }, [feedCommentDrafts]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_feed_comment_attachments", JSON.stringify(feedCommentAttachments));
  }, [feedCommentAttachments]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_notification_items", JSON.stringify(notificationItems));
  }, [notificationItems]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const updateNotificationPageSize = () => {
      const estimatedRows = Math.floor((window.innerHeight - 220) / 42);
      setNotificationSectionPageSize(Math.max(6, Math.min(12, estimatedRows || 8)));
    };
    updateNotificationPageSize();
    window.addEventListener("resize", updateNotificationPageSize);
    return () => window.removeEventListener("resize", updateNotificationPageSize);
  }, []);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_saved_product_ids", JSON.stringify(savedProductIds));
  }, [savedProductIds]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_group_room_suspended_until", String(groupRoomSuspendedUntil));
  }, [groupRoomSuspendedUntil]);
  reactExports.useEffect(() => {
    setRandomRooms((prev) => prev.map((room) => {
      if (room.kind !== "random_1to1" || room.status === "ended" || !room.expiresAt) return room;
      if (room.expiresAt > randomNow) return room;
      return { ...room, status: "ended", endedAt: room.expiresAt, latestMessage: "채팅방 유지시간 20분이 종료되어 최근 종료 목록으로 이동했습니다." };
    }));
  }, [randomNow]);
  reactExports.useMemo(() => randomRooms.find((room) => room.id === activeRandomRoomId) ?? null, [activeRandomRoomId, randomRooms]);
  const groupRoomSuspendedRemainMinutes = groupRoomSuspendedUntil > Date.now() ? Math.ceil((groupRoomSuspendedUntil - Date.now()) / 6e4) : 0;
  reactExports.useMemo(() => randomRooms.filter((room) => room.kind === "random_1to1").sort((a, b) => {
    if ((a.status ?? "active") !== (b.status ?? "active")) return (a.status ?? "active") === "active" ? -1 : 1;
    const aTime = a.status === "ended" ? a.endedAt ?? 0 : a.expiresAt ?? 0;
    const bTime = b.status === "ended" ? b.endedAt ?? 0 : b.expiresAt ?? 0;
    return bTime - aTime;
  }), [randomRooms]);
  const toggleSavedFeed = (feedId) => {
    setSavedFeedIds((prev) => prev.includes(feedId) ? prev.filter((item) => item !== feedId) : [feedId, ...prev]);
  };
  const toggleLikedFeed = (feedId) => {
    setLikedFeedIds((prev) => prev.includes(feedId) ? prev.filter((item) => item !== feedId) : [feedId, ...prev]);
  };
  const toggleRepostedFeed = (feedId) => {
    setRepostedFeedIds((prev) => prev.includes(feedId) ? prev.filter((item) => item !== feedId) : [feedId, ...prev]);
  };
  const openFeedComments = (item) => {
    setOpenFeedCommentItem(item);
  };
  const closeFeedComments = () => {
    setOpenFeedCommentItem(null);
  };
  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("이미지 변환에 실패했습니다."));
    reader.onerror = () => reject(reader.error ?? new Error("이미지 변환에 실패했습니다."));
    reader.readAsDataURL(file);
  });
  const loadImageElement = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
    image.src = src;
  });
  const optimizeFeedCommentImage = async (file) => {
    const maxBytes = 10 * 1024 * 1024;
    if (file.size <= maxBytes) {
      return { name: file.name, dataUrl: await fileToDataUrl(file), size: file.size, type: file.type || "image/jpeg" };
    }
    const sourceUrl = await fileToDataUrl(file);
    const image = await loadImageElement(sourceUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d");
    if (!context) return { name: file.name, dataUrl: sourceUrl, size: file.size, type: file.type || "image/jpeg" };
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const targetTypes = ["image/webp", "image/jpeg"];
    for (const targetType of targetTypes) {
      for (const quality of [0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72]) {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, targetType, quality));
        if (!blob) continue;
        if (blob.size <= maxBytes) {
          const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, targetType === "image/webp" ? ".webp" : ".jpg"), { type: targetType });
          return { name: optimizedFile.name, dataUrl: await fileToDataUrl(optimizedFile), size: blob.size, type: targetType };
        }
      }
    }
    return { name: file.name, dataUrl: sourceUrl, size: file.size, type: file.type || "image/jpeg" };
  };
  const attachFeedCommentImage = async (feedId, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("이미지 파일만 첨부할 수 있습니다.");
      return;
    }
    setFeedCommentAttachmentBusyId(feedId);
    try {
      const optimized = await optimizeFeedCommentImage(file);
      setFeedCommentAttachments((prev) => ({ ...prev, [feedId]: optimized }));
    } catch {
      window.alert("이미지를 처리하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setFeedCommentAttachmentBusyId((current) => current === feedId ? null : current);
    }
  };
  const getVideoMetadata = (file) => new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    video.preload = "metadata";
    video.playsInline = true;
    video.muted = true;
    video.onloadedmetadata = () => {
      const durationSec = Number.isFinite(video.duration) ? video.duration : 0;
      const width = video.videoWidth || 0;
      const height = video.videoHeight || 0;
      URL.revokeObjectURL(objectUrl);
      resolve({ durationSec, width, height });
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("비디오 메타데이터를 불러오지 못했습니다."));
    };
    video.src = objectUrl;
  });
  const optimizeFeedComposeImage = async (file) => {
    const maxBytes = 10 * 1024 * 1024;
    if (file.size <= maxBytes) {
      return {
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        size: file.size,
        type: file.type || "image/jpeg",
        optimized: false
      };
    }
    const sourceUrl = await fileToDataUrl(file);
    const image = await loadImageElement(sourceUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d");
    if (!context) {
      return { name: file.name, previewUrl: URL.createObjectURL(file), size: file.size, type: file.type || "image/jpeg", optimized: false };
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const targetTypes = ["image/webp", "image/jpeg"];
    for (const targetType of targetTypes) {
      for (const quality of [0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72]) {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, targetType, quality));
        if (!blob) continue;
        if (blob.size <= maxBytes) {
          const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, targetType === "image/webp" ? ".webp" : ".jpg"), { type: targetType });
          return {
            name: optimizedFile.name,
            previewUrl: URL.createObjectURL(optimizedFile),
            size: optimizedFile.size,
            type: optimizedFile.type,
            optimized: true
          };
        }
      }
    }
    return { name: file.name, previewUrl: URL.createObjectURL(file), size: file.size, type: file.type || "image/jpeg", optimized: false };
  };
  const optimizeFeedComposeVideo = async (file) => {
    var _a2, _b2;
    const maxBytes = 30 * 1024 * 1024;
    const meta = await getVideoMetadata(file);
    if (meta.durationSec > 20.05) {
      throw new Error("영상은 최대 20초까지만 첨부할 수 있습니다.");
    }
    if (file.size <= maxBytes) {
      return {
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        size: file.size,
        type: file.type || "video/mp4",
        durationSec: meta.durationSec,
        optimized: false
      };
    }
    const RecorderCtor = typeof window !== "undefined" ? window.MediaRecorder : void 0;
    if (!RecorderCtor) {
      throw new Error("현재 브라우저는 영상 최적화를 지원하지 않습니다. 30MB 이하 MP4(H.264) 또는 WEBM 파일을 사용해 주세요.");
    }
    const previewUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = previewUrl;
    video.crossOrigin = "anonymous";
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("영상을 열지 못했습니다."));
    });
    const captureTarget = video;
    const stream = ((_a2 = captureTarget.captureStream) == null ? void 0 : _a2.call(captureTarget)) ?? ((_b2 = captureTarget.mozCaptureStream) == null ? void 0 : _b2.call(captureTarget));
    if (!stream) {
      URL.revokeObjectURL(previewUrl);
      throw new Error("현재 브라우저는 영상 재인코딩을 지원하지 않습니다. 30MB 이하 MP4(H.264) 또는 WEBM 파일을 사용해 주세요.");
    }
    const mimeCandidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    const selectedMime = mimeCandidates.find((mime) => {
      var _a3;
      return (_a3 = RecorderCtor.isTypeSupported) == null ? void 0 : _a3.call(RecorderCtor, mime);
    }) ?? "video/webm";
    const maxEdge = 1280;
    const bitrate = Math.min(28e5, Math.max(16e5, Math.round(maxBytes * 8 / Math.max(meta.durationSec, 1))));
    const chunks = [];
    const recorder = new RecorderCtor(stream, { mimeType: selectedMime, videoBitsPerSecond: bitrate });
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data);
    };
    const stopPromise = new Promise((resolve, reject) => {
      recorder.onerror = () => reject(new Error("영상 최적화 중 오류가 발생했습니다."));
      recorder.onstop = () => resolve(new Blob(chunks, { type: selectedMime.split(";")[0] }));
    });
    const needsResize = Math.max(meta.width, meta.height) > maxEdge;
    if (needsResize) {
      const canvas = document.createElement("canvas");
      const scale = maxEdge / Math.max(meta.width, meta.height);
      canvas.width = Math.round(meta.width * scale);
      canvas.height = Math.round(meta.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(previewUrl);
        throw new Error("영상 최적화를 시작하지 못했습니다.");
      }
      const canvasStream = canvas.captureStream(30);
      const canvasRecorder = new RecorderCtor(canvasStream, { mimeType: selectedMime, videoBitsPerSecond: bitrate });
      const canvasChunks = [];
      canvasRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) canvasChunks.push(event.data);
      };
      const canvasStopPromise = new Promise((resolve, reject) => {
        canvasRecorder.onerror = () => reject(new Error("영상 최적화 중 오류가 발생했습니다."));
        canvasRecorder.onstop = () => resolve(new Blob(canvasChunks, { type: selectedMime.split(";")[0] }));
      });
      await video.play();
      canvasRecorder.start(250);
      const drawFrame = () => {
        if (video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
      };
      requestAnimationFrame(drawFrame);
      await new Promise((resolve) => {
        video.onended = () => resolve();
      });
      if (canvasRecorder.state !== "inactive") canvasRecorder.stop();
      const optimizedBlob2 = await canvasStopPromise;
      URL.revokeObjectURL(previewUrl);
      if (optimizedBlob2.size > maxBytes) {
        throw new Error("영상 최적화 후에도 30MB를 초과합니다. 길이를 더 짧게 하거나 원본 해상도를 줄여 주세요.");
      }
      const optimizedFile2 = new File([optimizedBlob2], file.name.replace(/\.[^.]+$/, ".webm"), { type: optimizedBlob2.type || "video/webm" });
      return {
        name: optimizedFile2.name,
        previewUrl: URL.createObjectURL(optimizedFile2),
        size: optimizedFile2.size,
        type: optimizedFile2.type,
        durationSec: meta.durationSec,
        optimized: true
      };
    }
    await video.play();
    recorder.start(250);
    await new Promise((resolve) => {
      video.onended = () => resolve();
    });
    if (recorder.state !== "inactive") recorder.stop();
    const optimizedBlob = await stopPromise;
    URL.revokeObjectURL(previewUrl);
    if (optimizedBlob.size > maxBytes) {
      throw new Error("영상 최적화 후에도 30MB를 초과합니다. 길이를 더 짧게 하거나 원본 해상도를 줄여 주세요.");
    }
    const optimizedFile = new File([optimizedBlob], file.name.replace(/\.[^.]+$/, ".webm"), { type: optimizedBlob.type || "video/webm" });
    return {
      name: optimizedFile.name,
      previewUrl: URL.createObjectURL(optimizedFile),
      size: optimizedFile.size,
      type: optimizedFile.type,
      durationSec: meta.durationSec,
      optimized: true
    };
  };
  const handleFeedComposeAttach = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      window.alert("사진 또는 영상 파일만 첨부할 수 있습니다.");
      return;
    }
    setFeedComposeBusy(true);
    setFeedComposeHelperText(file.type.startsWith("video/") ? "영상 길이/용량을 확인하고 최적화 중입니다." : "이미지를 확인하고 최적화 중입니다.");
    try {
      const nextAttachment = file.type.startsWith("video/") ? await optimizeFeedComposeVideo(file) : await optimizeFeedComposeImage(file);
      setFeedComposeAttachment((prev) => {
        var _a2;
        if ((_a2 = prev == null ? void 0 : prev.previewUrl) == null ? void 0 : _a2.startsWith("blob:")) URL.revokeObjectURL(prev.previewUrl);
        return nextAttachment;
      });
      setFeedComposeHelperText(
        nextAttachment.type.startsWith("video/") ? `최대 1개 첨부 · 영상 ${nextAttachment.durationSec ? nextAttachment.durationSec.toFixed(1) : "0.0"}초 · ${Math.max(1, Math.round(nextAttachment.size / 1024 / 1024))}MB · ${nextAttachment.optimized ? "WEBM 최적화" : "원본 유지"}` : `최대 1개 첨부 · 이미지 ${Math.max(1, Math.round(nextAttachment.size / 1024))}KB${nextAttachment.optimized ? " · 최적화 완료" : ""}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "첨부 파일을 처리하지 못했습니다.";
      window.alert(message);
      setFeedComposeHelperText(getFeedComposeModeMeta(feedComposeMode).helper);
    } finally {
      setFeedComposeBusy(false);
    }
  };
  const clearFeedComposeAttachment = () => {
    setFeedComposeAttachment((prev) => {
      var _a2;
      if ((_a2 = prev == null ? void 0 : prev.previewUrl) == null ? void 0 : _a2.startsWith("blob:")) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setFeedComposeHelperText(getFeedComposeModeMeta(feedComposeMode).helper);
  };
  const openFeedComposeWithMode = reactExports.useCallback((mode) => {
    setFeedComposeAttachment((prev) => {
      var _a2;
      if ((_a2 = prev == null ? void 0 : prev.previewUrl) == null ? void 0 : _a2.startsWith("blob:")) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setFeedComposeTitle("");
    setFeedComposeCaption("");
    setFeedComposeBusy(false);
    setFeedComposeMode(mode);
    setFeedComposeHelperText(getFeedComposeModeMeta(mode).helper);
    setFeedComposeLauncherOpen(false);
    setFeedComposeOpen(true);
  }, []);
  const closeFeedCompose = () => {
    setFeedComposeOpen(false);
    setFeedComposeBusy(false);
  };
  const submitFeedCompose = () => {
    const composeMeta = getFeedComposeModeMeta(feedComposeMode);
    if (!feedComposeCaption.trim() && !feedComposeAttachment) {
      window.alert(`${composeMeta.title} 내용 또는 첨부 파일을 입력해 주세요.`);
      return;
    }
    if (feedComposeMode === "쇼츠게시" && !(feedComposeAttachment == null ? void 0 : feedComposeAttachment.type.startsWith("video/"))) {
      window.alert("쇼츠게시에는 영상 첨부가 필요합니다.");
      return;
    }
    if (feedComposeMode === "사진피드" && !(feedComposeAttachment == null ? void 0 : feedComposeAttachment.type.startsWith("image/"))) {
      window.alert("사진피드에는 사진 첨부가 필요합니다.");
      return;
    }
    const nextId = Math.max(...allFeedItems.map((item) => item.id), 0) + 1;
    const inferredType = (feedComposeAttachment == null ? void 0 : feedComposeAttachment.type.startsWith("video/")) ? "video" : "image";
    const type = feedComposeMode === "쇼츠게시" ? "video" : feedComposeMode === "사진피드" ? "image" : inferredType;
    const trimmedTitle = feedComposeTitle.trim();
    const caption = feedComposeCaption.trim();
    const nextItem = {
      id: nextId,
      type,
      category: feedComposeMode === "쇼츠게시" ? "쇼츠" : feedComposeMode === "사진피드" ? "사진피드" : "일반",
      title: trimmedTitle || caption.slice(0, 28) || "새 피드",
      caption,
      author: viewedProfileAuthor ?? currentProfileMeta.name ?? "adult official",
      likes: 0,
      comments: 0,
      accent: "rose",
      views: type === "video" ? 0 : void 0,
      postedAt: "방금",
      videoUrl: type === "video" ? feedComposeAttachment == null ? void 0 : feedComposeAttachment.previewUrl : void 0,
      mediaUrl: type === "image" ? feedComposeAttachment == null ? void 0 : feedComposeAttachment.previewUrl : void 0,
      mediaName: feedComposeAttachment == null ? void 0 : feedComposeAttachment.name
    };
    setCustomFeedItems((prev) => [nextItem, ...prev]);
    setFeedCommentMap((prev) => ({ ...prev, [nextId]: [] }));
    setFeedComposeTitle("");
    setFeedComposeCaption("");
    setFeedComposeAttachment(null);
    setFeedComposeBusy(false);
    setFeedComposeHelperText(getFeedComposeModeMeta(feedComposeMode).helper);
    setFeedComposeOpen(false);
    setActiveTab("홈");
    setHomeTab("피드");
  };
  const clearFeedCommentAttachment = (feedId) => {
    setFeedCommentAttachments((prev) => ({ ...prev, [feedId]: null }));
  };
  const updateFeedCommentDraft = (feedId, value) => {
    setFeedCommentDrafts((prev) => ({ ...prev, [feedId]: value }));
  };
  const submitFeedComment = (feedId) => {
    const draft = (feedCommentDrafts[feedId] ?? "").trim();
    const attachment = feedCommentAttachments[feedId] ?? null;
    if (!draft && !attachment) return;
    setFeedCommentMap((prev) => ({
      ...prev,
      [feedId]: [
        ...prev[feedId] ?? [],
        { id: Date.now(), author: "my_account", text: draft || "사진을 첨부했습니다.", meta: "방금", imageUrl: attachment == null ? void 0 : attachment.dataUrl, imageName: attachment == null ? void 0 : attachment.name }
      ]
    }));
    setFeedCommentDrafts((prev) => ({ ...prev, [feedId]: "" }));
    setFeedCommentAttachments((prev) => ({ ...prev, [feedId]: null }));
  };
  const toggleFollowedFeedAuthor = (author) => {
    setFollowedFeedAuthors((prev) => prev.includes(author) ? prev.filter((item) => item !== author) : [...prev, author]);
  };
  const shareFeedItem = async (item) => {
    const shareText = `${item.title} · ${item.caption}`;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: item.title, text: shareText });
        return;
      }
    } catch (error) {
      return;
    }
    copyToClipboard(shareText);
    window.alert("피드 내용이 클립보드에 복사되었습니다.");
  };
  const toggleSavedProduct = (productId) => {
    setSavedProductIds((prev) => prev.includes(productId) ? prev.filter((item) => item !== productId) : [productId, ...prev]);
  };
  const savedFeedItems = reactExports.useMemo(() => allFeedItems.filter((item) => item.type !== "video" && savedFeedIds.includes(item.id)), [savedFeedIds]);
  const openMenuOverlay = () => setOverlayMode("menu");
  const goToSavedBox = () => {
    setActiveTab("홈");
    setHomeTab("보관함");
    setSavedTab("피드");
    setOverlayMode(null);
  };
  const handleLogout = async () => {
    if (typeof window === "undefined") return;
    try {
      const refreshToken2 = getRefreshToken();
      if (refreshToken2) {
        await postJson("/auth/logout", { refresh_token: refreshToken2 });
      }
    } catch {
    }
    clearTokens();
    [
      "adultapp_demo_role",
      "adultapp_demo_login_provider",
      "adultapp_identity_verified",
      "adultapp_adult_verified",
      "adultapp_adult_fail_count",
      "adultapp_adult_cooldown_until",
      "adultapp_identity_method",
      "adultapp_identity_token",
      "adultapp_signup_consents",
      "adultapp_signup_form",
      "adultapp_demo_profile",
      "adultapp_seller_verification",
      "adultapp_account_private"
    ].forEach((key) => window.localStorage.removeItem(key));
    setCurrentUserRole("GUEST");
    setDemoLoginProvider("카카오");
    setIdentityVerified(false);
    setAdultVerified(false);
    setGroupRoomSuspendedUntil(0);
    setAdultGateView("intro");
    setAdultFailCount(0);
    setAdultCooldownUntil(0);
    setAdultPromptOpen(false);
    setSignupStep("account");
    setIdentityMethod("미완료");
    setIdentityVerificationToken("");
    setSignupConsents(defaultSignupConsents);
    setSignupForm(defaultSignupForm);
    setDemoProfile(defaultDemoProfile);
    setSellerVerification(defaultSellerVerification);
    setAccountPrivate(false);
    setAuthSummary(null);
    setOrders([]);
    setCartItems([]);
    setOrderMessage("");
    setSettingsCategory("일반");
    setOverlayMode(null);
    setActiveTab("프로필");
    setAuthStandaloneScreen("login");
    setHomeTab("피드");
    setProfileTab("내정보");
    setAuthMessage("로그아웃 완료 · 로그인 화면으로 이동했습니다.");
    setHomeShopConsentGuideSeen(false);
  };
  const openFeedAvatarPreview = reactExports.useCallback((item) => {
    setFeedAvatarPreviewItem(item);
  }, []);
  const closeFeedAvatarPreview = reactExports.useCallback(() => {
    setFeedAvatarPreviewItem(null);
  }, []);
  const handleShortsScroll = (event) => {
    const target = event.currentTarget;
    const currentTop = target.scrollTop;
    const remain = target.scrollHeight - currentTop - target.clientHeight;
    if (remain < 240) {
      setShortsVisibleCount((prev) => Math.min(prev + 10, shortsFeedItems.length));
    }
    if (showAppTabContent && activeTab === "홈" && homeTab === "쇼츠" && shortsFeedItems.length > 0 && remain <= 48 && shortsVisibleCount >= shortsFeedItems.length) {
      showListEndToast("모든 쇼츠를 확인하였습니다");
    }
    if (shortsScrollRafRef.current !== null) {
      window.cancelAnimationFrame(shortsScrollRafRef.current);
    }
    shortsScrollRafRef.current = window.requestAnimationFrame(() => {
      const prevTop = lastShortsScrollTopRef.current;
      const delta = currentTop - prevTop;
      lastShortsScrollTopRef.current = currentTop;
      if (currentTop <= 8) {
        shortsHideThresholdRef.current = 0;
        shortsShowThresholdRef.current = 0;
        setShortsHeaderHidden(false);
        setShortsCategoryVisible(true);
        return;
      }
      if (delta > 2) {
        shortsHideThresholdRef.current += delta;
        shortsShowThresholdRef.current = 0;
      } else if (delta < -2) {
        shortsShowThresholdRef.current += Math.abs(delta);
        shortsHideThresholdRef.current = 0;
      }
      if (!shortsHeaderHidden && shortsHideThresholdRef.current >= 28 && currentTop > 32) {
        shortsHideThresholdRef.current = 0;
        setShortsHeaderHidden(true);
        setShortsCategoryVisible(false);
      } else if (shortsHeaderHidden && shortsShowThresholdRef.current >= 18) {
        shortsShowThresholdRef.current = 0;
        setShortsHeaderHidden(false);
        setShortsCategoryVisible(true);
      }
    });
  };
  const handleProfileShellScroll = (event) => {
    if (!showAppTabContent || activeTab !== "프로필" || profileSection !== "쇼츠") return;
    const target = event.currentTarget;
    const remain = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (remain <= 48 && profileShortsVisibleCount < profileShortItems.length) {
      setProfileShortsVisibleCount((prev) => Math.min(prev + 10, profileShortItems.length));
    }
  };
  const showListEndToast = reactExports.useCallback((message) => {
    if (listEndToastTimerRef.current !== null) {
      window.clearTimeout(listEndToastTimerRef.current);
    }
    setListEndToast(message);
    listEndToastTimerRef.current = window.setTimeout(() => {
      setListEndToast(null);
      listEndToastTimerRef.current = null;
    }, 1800);
  }, []);
  reactExports.useEffect(() => () => {
    if (listEndToastTimerRef.current !== null) {
      window.clearTimeout(listEndToastTimerRef.current);
    }
  }, []);
  const homeMenuItems = [
    { label: "피드", onClick: () => {
      setHomeTab("피드");
      setOverlayMode(null);
      setHomeFeedHeaderHidden(false);
      lastHomeFeedScrollTopRef.current = 0;
      homeFeedHideThresholdRef.current = 0;
      homeFeedShowThresholdRef.current = 0;
    } },
    { label: "쇼츠", onClick: () => {
      setHomeTab("쇼츠");
      setOverlayMode(null);
      setShortsHeaderHidden(false);
      setShortsCategoryVisible(true);
      setSelectedShortsCategory("전체");
      lastShortsScrollTopRef.current = 0;
      shortsHideThresholdRef.current = 0;
      shortsShowThresholdRef.current = 0;
    } },
    { label: "보관함", onClick: goToSavedBox }
  ];
  const shortsCategories = reactExports.useMemo(() => {
    const fixed = ["전체", "추천", "최신"];
    const dynamic = Array.from(new Set(allFeedItems.filter((item) => item.type === "video").map((item) => item.category))).filter((category) => !fixed.includes(category));
    return [...fixed, ...dynamic];
  }, []);
  const keywordSignalMap = reactExports.useMemo(() => buildKeywordSignalMap({
    shopKeywordSignals,
    shortsKeywordSignals,
    globalKeyword,
    followingUserIds,
    savedFeedIds,
    feedItems: allFeedItems,
    forumUsers: forumStarterUsers
  }), [shopKeywordSignals, shortsKeywordSignals, globalKeyword, followingUserIds, savedFeedIds]);
  const followedTopicKeywords = reactExports.useMemo(() => followingUserIds.map((id2) => forumStarterUsers.find((user) => user.id === id2)).filter((user) => Boolean(user)).flatMap((user) => extractInterestTokens(`${user.name} ${user.topic} ${user.role}`)), [followingUserIds]);
  const recommendedHomeFeed = reactExports.useMemo(() => rankHomeFeedItems({
    items: allFeedItems,
    keywordSignalMap,
    followedTopicKeywords,
    savedFeedIds,
    keyword: deferredGlobalKeyword
  }), [keywordSignalMap, followedTopicKeywords, savedFeedIds, deferredGlobalKeyword]);
  const chronologicalHomeFeed = reactExports.useMemo(() => [...allFeedItems].sort((a, b) => b.id - a.id), [allFeedItems]);
  const followingHomeFeed = reactExports.useMemo(() => chronologicalHomeFeed.filter((item) => followedFeedAuthors.includes(item.author)), [chronologicalHomeFeed, followedFeedAuthors]);
  const activeHomeFeedItems = reactExports.useMemo(() => {
    if (homeFeedFilter === "추천") return recommendedHomeFeed;
    if (homeFeedFilter === "팔로잉") return followingHomeFeed;
    return chronologicalHomeFeed;
  }, [homeFeedFilter, recommendedHomeFeed, followingHomeFeed, chronologicalHomeFeed]);
  const homeFeedSource = reactExports.useMemo(() => activeHomeFeedItems.slice(0, homeFeedVisibleCount), [activeHomeFeedItems, homeFeedVisibleCount]);
  reactExports.useEffect(() => {
    homeFeedViewedIdsRef.current = Array.from(/* @__PURE__ */ new Set([...homeFeedViewedIdsRef.current, ...homeFeedSource.map((item) => item.id)])).slice(-240);
  }, [homeFeedSource]);
  reactExports.useEffect(() => {
    setHomeFeedVisibleCount((prev) => {
      if (!activeHomeFeedItems.length) return HOME_FEED_BATCH_SIZE;
      return Math.min(Math.max(prev, HOME_FEED_BATCH_SIZE), activeHomeFeedItems.length);
    });
  }, [activeHomeFeedItems]);
  reactExports.useEffect(() => {
    persistHomeFeedState({ visibleCount: homeFeedVisibleCount });
  }, [homeFeedVisibleCount, persistHomeFeedState]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const markInactive = () => {
      persistHomeFeedState({ lastInactiveAt: Date.now() });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        markInactive();
        return;
      }
      const stored = readHomeFeedPersistedState();
      if (!isHomeFeedStateExpired(stored)) return;
      homeFeedResetOnNextShowRef.current = true;
      setHomeFeedVisibleCount(HOME_FEED_BATCH_SIZE);
      persistHomeFeedState({ visibleCount: HOME_FEED_BATCH_SIZE, scrollTop: 0, lastInactiveAt: 0 });
      setHomeFeedHeaderHidden(false);
      lastHomeFeedScrollTopRef.current = 0;
      homeFeedHideThresholdRef.current = 0;
      homeFeedShowThresholdRef.current = 0;
      if (homeFeedScrollRef.current) {
        homeFeedScrollRef.current.scrollTop = 0;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", markInactive);
    window.addEventListener("beforeunload", markInactive);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", markInactive);
      window.removeEventListener("beforeunload", markInactive);
    };
  }, [persistHomeFeedState]);
  reactExports.useEffect(() => {
    if (homeTab === "피드" && activeTab === "홈") return;
    setHomeFeedHeaderHidden(false);
    lastHomeFeedScrollTopRef.current = 0;
    homeFeedHideThresholdRef.current = 0;
    homeFeedShowThresholdRef.current = 0;
  }, [activeTab, homeTab]);
  reactExports.useEffect(() => () => {
    if (typeof window !== "undefined" && homeFeedScrollRafRef.current !== null) {
      window.cancelAnimationFrame(homeFeedScrollRafRef.current);
    }
  }, []);
  reactExports.useEffect(() => () => {
    var _a2;
    if ((_a2 = feedComposeAttachment == null ? void 0 : feedComposeAttachment.previewUrl) == null ? void 0 : _a2.startsWith("blob:")) {
      URL.revokeObjectURL(feedComposeAttachment.previewUrl);
    }
  }, [feedComposeAttachment]);
  const getContentKeywordTags = (item) => getTopMatchedKeywords(item, keywordSignalMap);
  const recommendedShorts = reactExports.useMemo(() => {
    const base = allFeedItems.filter((item) => item.type === "video" || item.category.includes("숏"));
    const ranked = base.map((item, idx) => {
      const content = `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase();
      const matchedSignalScore = Array.from(keywordSignalMap.entries()).reduce((sum, [token, score]) => sum + (content.includes(token) ? score : 0), 0);
      const freshnessMinutes = parseRelativeMinutes(item.postedAt);
      const freshnessScore = Math.max(0, 36 - Math.min(freshnessMinutes / 12, 36));
      const followScore = followedTopicKeywords.some((token) => content.includes(token)) ? 18 : 0;
      const savedScore = savedFeedIds.includes(item.id) ? 28 : 0;
      const popularityScore = Math.min(22, item.likes / 40 + item.comments / 12 + (item.views ?? 0) / 600);
      const nicheBoost = /딜도|바이브|본디지|패들|케인|젤|세정|보관|입문|리뷰/.test(content) ? 6 : 0;
      const explorationScore = deterministicHash(`${item.id}-${item.title}`) % 100 < 2 ? 12 : 0;
      const vintagePopularBoost = freshnessMinutes >= 120 && popularityScore >= 16 && matchedSignalScore > 0 ? 10 : 0;
      const recencyPenalty = freshnessMinutes >= 1440 ? 6 : 0;
      const totalScore = matchedSignalScore + freshnessScore + followScore + savedScore + popularityScore + nicheBoost + explorationScore + vintagePopularBoost - recencyPenalty;
      return {
        ...item,
        id: 1e3 + idx,
        views: (item.views ?? 1e3) + idx * 91,
        postedAt: item.postedAt ?? ["방금", "9분 전", "26분 전", "1시간 전", "3시간 전", "어제"][idx % 6],
        sortScore: totalScore
      };
    });
    ranked.sort((a, b) => (b.sortScore ?? 0) - (a.sortScore ?? 0) || b.likes - a.likes);
    return ranked;
  }, [keywordSignalMap, followedTopicKeywords, savedFeedIds]);
  const savedShortItems = reactExports.useMemo(() => {
    const source = recommendedShorts.filter((item) => savedFeedIds.includes(item.id));
    return source.sort((a, b) => savedFeedIds.indexOf(a.id) - savedFeedIds.indexOf(b.id));
  }, [recommendedShorts, savedFeedIds]);
  const visibleShorts = reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    const baseSource = selectedShortsCategory === "최신" ? [...recommendedShorts].sort((a, b) => parseRelativeMinutes(a.postedAt) - parseRelativeMinutes(b.postedAt) || (b.views ?? 0) - (a.views ?? 0)) : recommendedShorts;
    return baseSource.filter((item) => {
      const categoryMatch = ["전체", "추천", "최신"].includes(selectedShortsCategory) || item.category === selectedShortsCategory;
      const keywordMatch = !keyword || `${item.title} ${item.caption} ${item.category} ${item.author}`.toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });
  }, [recommendedShorts, selectedShortsCategory, globalKeyword]);
  const shortsFeedItems = reactExports.useMemo(() => visibleShorts.length ? visibleShorts : recommendedShorts, [visibleShorts, recommendedShorts]);
  const pagedShorts = reactExports.useMemo(() => shortsFeedItems.slice(0, shortsVisibleCount), [shortsFeedItems, shortsVisibleCount]);
  const shortsViewerInitialIndex = reactExports.useMemo(() => shortsViewerItemId === null ? 0 : Math.max(0, shortsFeedItems.findIndex((item) => item.id === shortsViewerItemId)), [shortsFeedItems, shortsViewerItemId]);
  const savedShortsViewerInitialIndex = reactExports.useMemo(() => savedShortsViewerItemId === null ? 0 : Math.max(0, savedShortItems.findIndex((item) => item.id === savedShortsViewerItemId)), [savedShortItems, savedShortsViewerItemId]);
  reactExports.useEffect(() => {
    setShortsVisibleCount(10);
  }, [globalKeyword, selectedShortsCategory]);
  reactExports.useEffect(() => {
    setProfileShortsVisibleCount(10);
  }, [profileSection, viewedProfileAuthor, shortsFeedItems.length]);
  reactExports.useEffect(() => () => {
    if (shortsScrollRafRef.current !== null) {
      window.cancelAnimationFrame(shortsScrollRafRef.current);
    }
  }, []);
  const shopCatalogItems = reactExports.useMemo(() => {
    const source = apiProducts.length ? apiProducts.filter((item) => (item.status ?? "published") === "published").map((item, index) => withProductMetrics({
      id: item.id,
      category: item.category ?? "기타",
      name: item.name,
      subtitle: item.description ?? "",
      price: `₩${Number(item.price || 0).toLocaleString()}`,
      badge: item.stock_qty && item.stock_qty > 0 ? "판매중" : "재고확인",
      reviewCount: Number(item.review_count ?? 0) || void 0,
      stock_qty: item.stock_qty,
      thumbnailUrl: null,
      isPremium: /프리미엄|premium|고급/.test(`${item.name} ${item.description ?? ""}`.toLowerCase())
    }, index)) : productsSeed.map((item, index) => withProductMetrics(item, index));
    return source.filter((product) => selectedShopCategory === "전체" || product.category === selectedShopCategory);
  }, [selectedShopCategory, apiProducts]);
  const allShopItems = reactExports.useMemo(() => {
    const keyword = shopKeyword.trim().toLowerCase();
    return shopCatalogItems.filter((product) => !keyword || `${product.name} ${product.subtitle} ${product.category}`.toLowerCase().includes(keyword));
  }, [shopCatalogItems, shopKeyword]);
  reactExports.useMemo(() => {
    const roleSeedMap = {
      ADMIN: ["판매자", "신상품", "베스트", "위생", "보관", "케어", "세정", "입문", "브랜드", "기획전"],
      SELLER: ["신상품", "입문", "브랜드", "베스트", "위생", "보관", "케어", "세정", "기획전", "인기"],
      GUEST: ["입문", "위생", "보관", "케어", "세정", "베스트", "브랜드", "기획전", "추천", "인기"],
      MEMBER: ["입문", "위생", "보관", "케어", "세정", "베스트", "브랜드", "기획전", "추천", "인기"]
    };
    const roleSeeds = roleSeedMap[currentUserRole] ?? roleSeedMap.MEMBER;
    const pool = [
      ...Object.entries(shopKeywordSignals).sort((a, b) => b[1] - a[1]).map(([token]) => token),
      ...roleSeeds,
      ...shopCatalogItems.flatMap((item) => [item.category, item.name]),
      ...productsSeed.flatMap((item) => [item.category, item.name])
    ];
    const normalized = pool.flatMap((entry) => String(entry).split(/[·,/]/)).map((entry) => entry.trim()).filter((entry) => entry.length >= 2).filter((entry) => !/^(전체|상품|판매중|재고확인)$/.test(entry));
    const unique = [];
    for (const item of normalized) {
      if (!unique.includes(item)) unique.push(item);
      if (unique.length >= 32) break;
    }
    while (unique.length < 32) {
      unique.push(`추천 ${unique.length + 1}`);
    }
    return unique.slice(0, 32);
  }, [shopKeywordSignals, currentUserRole, shopCatalogItems]);
  const shopHomeRecommendedItems = reactExports.useMemo(() => buildShopHomeRecommendationFeed({
    items: shopCatalogItems.length ? shopCatalogItems : productsSeed,
    keywordSignals: shopKeywordSignals,
    visibleCount: shopHomeVisibleCount
  }), [shopCatalogItems, shopKeywordSignals, shopHomeVisibleCount]);
  const shopHomeSortedBaseItems = reactExports.useMemo(() => {
    const normalized = (shopCatalogItems.length ? shopCatalogItems : productsSeed.map((item, index) => withProductMetrics(item, index))).map((item, index) => withProductMetrics(item, index));
    if (shopHomeSort === "추천") {
      return buildShopHomeRecommendationFeed({ items: normalized, keywordSignals: shopKeywordSignals, visibleCount: shopHomeVisibleCount });
    }
    const sorted = [...normalized].sort((a, b) => {
      if (shopHomeSort === "신규") return parseIsoDateScore(b.createdAt) - parseIsoDateScore(a.createdAt) || b.id - a.id;
      if (shopHomeSort === "판매량") return (b.orderCount ?? 0) - (a.orderCount ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      if (shopHomeSort === "리뷰") return (b.reviewCount ?? 0) - (a.reviewCount ?? 0) || (b.orderCount ?? 0) - (a.orderCount ?? 0);
      return (b.orderCount ?? 0) + (b.reviewCount ?? 0) * 2 + (b.repurchaseCount ?? 0) * 3 - ((a.orderCount ?? 0) + (a.reviewCount ?? 0) * 2 + (a.repurchaseCount ?? 0) * 3);
    });
    return sorted.slice(0, shopHomeVisibleCount).map((item, index) => ({ ...item, feedIndex: index, recommendationBucket: shopHomeSort }));
  }, [shopCatalogItems, shopHomeSort, shopKeywordSignals, shopHomeVisibleCount]);
  const shopHomeHeroSlides = reactExports.useMemo(() => {
    const source = shopHomeSort === "추천" ? shopHomeRecommendedItems : shopHomeSortedBaseItems;
    const base = source.slice(0, 3);
    return base.length ? base : buildShopHomeRecommendationFeed({ items: productsSeed, keywordSignals: shopKeywordSignals, visibleCount: 3 });
  }, [shopHomeSort, shopHomeRecommendedItems, shopHomeSortedBaseItems, shopKeywordSignals]);
  const shopHomeFeedItems = reactExports.useMemo(() => {
    if (shopHomeSort === "추천") {
      if (shopHomeRecommendedItems.length) return shopHomeRecommendedItems;
      return buildShopHomeRecommendationFeed({ items: productsSeed, keywordSignals: shopKeywordSignals, visibleCount: shopHomeVisibleCount });
    }
    return shopHomeSortedBaseItems;
  }, [shopHomeSort, shopHomeRecommendedItems, shopHomeSortedBaseItems, shopKeywordSignals, shopHomeVisibleCount]);
  const productDetailDisplayItem = reactExports.useMemo(() => {
    if (!(productDetail == null ? void 0 : productDetail.product)) return null;
    const targetId = productDetail.product.id;
    const fallback = shopCatalogItems.find((item) => item.id === targetId) ?? productsSeed.find((item) => item.id === targetId) ?? null;
    return {
      id: targetId,
      category: productDetail.product.category ?? (fallback == null ? void 0 : fallback.category) ?? "기타",
      name: productDetail.product.name,
      subtitle: productDetail.product.description ?? (fallback == null ? void 0 : fallback.subtitle) ?? "",
      price: `₩${Number(productDetail.product.price || 0).toLocaleString()}`,
      badge: (fallback == null ? void 0 : fallback.badge) ?? (Number(productDetail.product.stock_qty || 0) > 0 ? "판매중" : "재고확인"),
      reviewCount: Number(productDetail.product.review_count ?? (fallback == null ? void 0 : fallback.reviewCount) ?? 0) || 0,
      stock_qty: productDetail.product.stock_qty ?? (fallback == null ? void 0 : fallback.stock_qty),
      thumbnailUrl: productDetail.product.thumbnail_url ?? (fallback == null ? void 0 : fallback.thumbnailUrl) ?? null,
      orderCount: fallback == null ? void 0 : fallback.orderCount,
      repurchaseCount: fallback == null ? void 0 : fallback.repurchaseCount,
      isPremium: fallback == null ? void 0 : fallback.isPremium,
      createdAt: fallback == null ? void 0 : fallback.createdAt
    };
  }, [productDetail, shopCatalogItems]);
  const productDetailImageUrls = reactExports.useMemo(() => {
    const urls = [
      ...((productDetail == null ? void 0 : productDetail.media) ?? []).map((item) => item.file_url).filter((value) => Boolean(value)),
      (productDetail == null ? void 0 : productDetail.product.thumbnail_url) ?? void 0,
      (productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.thumbnailUrl) ?? void 0
    ].filter((value) => Boolean(value));
    return Array.from(new Set(urls));
  }, [productDetail, productDetailDisplayItem]);
  const productDetailOptionChips = reactExports.useMemo(() => {
    const category = (productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.category) ?? "기본";
    const optionMap = {
      "딜도": ["슬림", "미디엄", "프리미엄 세트"],
      "바이브레이터": ["저소음", "듀얼모드", "프리미엄 세트"],
      "플러그": ["소형", "중형", "케어 세트"],
      "러브젤": ["기본형", "대용량", "세트구성"],
      "케어 키트": ["기본구성", "추가용품 포함", "선물포장"]
    };
    return optionMap[category] ?? ["기본구성", "세트구성", "선물포장"];
  }, [productDetailDisplayItem]);
  const productDetailCurrentImage = productDetailImageUrls[productDetailMediaIndex] ?? "";
  const productDetailPriceValue = Number((productDetail == null ? void 0 : productDetail.product.price) || 0);
  const productDetailShippingValue = Number((productDetail == null ? void 0 : productDetail.product.shipping_fee) || 3e3);
  const productDetailTotalAmount = productDetailPriceValue * Math.max(1, productDetailQuantity) + productDetailShippingValue;
  const productDetailRating = reactExports.useMemo(() => {
    const reviews = Number((productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.reviewCount) ?? 0);
    if (!reviews) return 4.7;
    return Math.min(5, 4.6 + reviews % 9 * 0.03);
  }, [productDetailDisplayItem]);
  reactExports.useEffect(() => {
    setProductDetailQuantity(1);
    setProductDetailMediaIndex(0);
    setSelectedProductOption(productDetailOptionChips[0] ?? "");
  }, [productDetail == null ? void 0 : productDetail.product.id, productDetailOptionChips]);
  const currentProfileAuthor = viewedProfileAuthor ?? "adult official";
  const currentProfileAuthorAliases = reactExports.useMemo(
    () => [...new Set([currentProfileAuthor, demoProfile.displayName.trim()].filter(Boolean))],
    [currentProfileAuthor, demoProfile.displayName]
  );
  const currentProfileMeta = reactExports.useMemo(() => {
    const askProfile = askProfiles.find((item) => item.name === currentProfileAuthor);
    const authorFeeds = allFeedItems.filter((item) => currentProfileAuthorAliases.includes(item.author));
    const firstFeed = authorFeeds[0];
    const hash = deterministicHash(currentProfileAuthor);
    const followerCount = 1200 + hash % 4200;
    const followingCount = 120 + hash % 430;
    const postCount = Math.max(9, authorFeeds.length * 4 || 12);
    const isOwner = viewedProfileAuthor === null;
    const ownerDisplayName = demoProfile.displayName.trim() || signupForm.displayName.trim() || currentProfileAuthor;
    const ownerBio = demoProfile.bio.trim() || (firstFeed == null ? void 0 : firstFeed.caption) || "피드와 질문, 쇼핑 정보를 함께 운영하는 계정입니다.";
    const ownerHashtags = demoProfile.hashtags.split(/[,\s#]+/).map((item) => item.trim()).filter(Boolean);
    return {
      name: isOwner ? ownerDisplayName : currentProfileAuthor,
      avatar: (isOwner ? ownerDisplayName : currentProfileAuthor).slice(0, 1).toUpperCase(),
      avatarUrl: isOwner ? demoProfile.avatarUrl.trim() : void 0,
      headline: (askProfile == null ? void 0 : askProfile.headline) ?? (firstFeed == null ? void 0 : firstFeed.category) ?? "프로필",
      bio: isOwner ? ownerBio : (askProfile == null ? void 0 : askProfile.intro) ?? (firstFeed == null ? void 0 : firstFeed.caption) ?? "피드와 질문, 쇼핑 정보를 함께 운영하는 계정입니다.",
      hashtags: isOwner && ownerHashtags.length ? ownerHashtags : getContentKeywordTags(firstFeed ?? allFeedItems[0] ?? feedSeed[0]),
      postCount,
      followerCount,
      followingCount,
      isOwner
    };
  }, [allFeedItems, currentProfileAuthor, currentProfileAuthorAliases, demoProfile.avatarUrl, demoProfile.bio, demoProfile.displayName, demoProfile.hashtags, signupForm.displayName, viewedProfileAuthor]);
  reactExports.useEffect(() => {
    if (!currentProfileMeta.isOwner) {
      setProfileEditMode(false);
      return;
    }
    setProfileEditDraft((prev) => ({
      ...prev,
      displayName: demoProfile.displayName.trim() || currentProfileMeta.name,
      bio: demoProfile.bio.trim() || currentProfileMeta.bio,
      hashtags: demoProfile.hashtags.trim() || currentProfileMeta.hashtags.join(" "),
      avatarUrl: demoProfile.avatarUrl
    }));
  }, [currentProfileMeta.bio, currentProfileMeta.hashtags, currentProfileMeta.isOwner, currentProfileMeta.name, demoProfile.avatarUrl, demoProfile.bio, demoProfile.displayName, demoProfile.hashtags]);
  const openProfileEditMode = reactExports.useCallback(() => {
    if (!currentProfileMeta.isOwner) return;
    setProfileEditDraft({
      ...demoProfile,
      displayName: demoProfile.displayName.trim() || currentProfileMeta.name,
      bio: demoProfile.bio.trim() || currentProfileMeta.bio,
      hashtags: demoProfile.hashtags.trim() || currentProfileMeta.hashtags.join(" "),
      avatarUrl: demoProfile.avatarUrl
    });
    setProfileNicknameEditUnlocked(false);
    setProfileEditMode(true);
  }, [currentProfileMeta, demoProfile]);
  const cancelProfileEditMode = reactExports.useCallback(() => {
    setProfileEditDraft((prev) => ({
      ...prev,
      displayName: demoProfile.displayName.trim() || currentProfileMeta.name,
      bio: demoProfile.bio.trim() || currentProfileMeta.bio,
      hashtags: demoProfile.hashtags.trim() || currentProfileMeta.hashtags.join(" "),
      avatarUrl: demoProfile.avatarUrl
    }));
    setProfileNicknameEditUnlocked(false);
    setProfileEditMode(false);
  }, [currentProfileMeta, demoProfile]);
  const saveProfileEditMode = reactExports.useCallback(() => {
    const nextDisplayName = profileEditDraft.displayName.trim();
    const currentDisplayName = (demoProfile.displayName.trim() || currentProfileMeta.name).trim();
    if (nextDisplayName && nextDisplayName !== currentDisplayName) {
      const confirmed = window.confirm(`닉네임이 변경되었습니다. 변경된 닉네임으로 사용하시겠습니까?

변경 전 닉네임을 사용시 취소를 누르고, 변경 후 닉네임을 사용시 선택시 네를 눌러주세요`);
      if (!confirmed) return;
    }
    setDemoProfile((prev) => ({
      ...prev,
      displayName: nextDisplayName,
      bio: profileEditDraft.bio.trim(),
      hashtags: profileEditDraft.hashtags.trim(),
      avatarUrl: profileEditDraft.avatarUrl.trim()
    }));
    setProfileNicknameEditUnlocked(false);
    setProfileEditMode(false);
  }, [currentProfileMeta.name, demoProfile.displayName, profileEditDraft]);
  const handleProfileNicknameEditUnlock = reactExports.useCallback(() => {
    if (!profileEditMode || profileNicknameEditUnlocked) return;
    window.alert("닉네임 변경시 1개월간 재변경이 불가능합니다");
    setProfileNicknameEditUnlocked(true);
    window.setTimeout(() => {
      const input = document.querySelector(".profile-ig-edit-username");
      input == null ? void 0 : input.focus();
      input == null ? void 0 : input.select();
    }, 0);
  }, [profileEditMode, profileNicknameEditUnlocked]);
  const handleProfileAvatarFileChange = reactExports.useCallback((event) => {
    var _a2;
    const file = (_a2 = event.target.files) == null ? void 0 : _a2[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfileEditDraft((prev) => ({ ...prev, avatarUrl: result }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }, []);
  const currentProfileProducts = reactExports.useMemo(() => {
    const pool = (shopCatalogItems.length ? shopCatalogItems : productsSeed.map((item, index) => withProductMetrics(item, index))).map((item, index) => withProductMetrics(item, index));
    const ownerSeedName = currentProfileAuthorAliases[0] ?? currentProfileAuthor;
    const ownerIndex = Math.abs(deterministicHash(ownerSeedName)) % 5;
    const picked = pool.filter((item) => Math.abs(deterministicHash(`${ownerSeedName}-${item.id}-${item.name}`)) % 5 === ownerIndex);
    const source = picked.length >= 6 ? picked : pool.slice(ownerIndex * 6, ownerIndex * 6 + 9);
    return [...source].sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0) || a.name.localeCompare(b.name));
  }, [shopCatalogItems, currentProfileAuthor, currentProfileAuthorAliases]);
  const profileShortItems = reactExports.useMemo(() => {
    const authored = shortsFeedItems.filter((item) => item.type === "video" && currentProfileAuthorAliases.includes(item.author));
    if (authored.length) return authored;
    const fallback = shortsFeedItems.filter((item) => item.type === "video");
    return fallback.slice(0, 30);
  }, [shortsFeedItems, currentProfileAuthor, currentProfileAuthorAliases]);
  const pagedProfileShorts = reactExports.useMemo(() => profileShortItems.slice(0, profileShortsVisibleCount), [profileShortItems, profileShortsVisibleCount]);
  const profileShortsViewerInitialIndex = reactExports.useMemo(
    () => shortsViewerItemId === null ? 0 : Math.max(0, profileShortItems.findIndex((item) => item.id === shortsViewerItemId)),
    [profileShortItems, shortsViewerItemId]
  );
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adultapp_chat_question_draft", chatQuestionDraft);
  }, [chatQuestionDraft]);
  reactExports.useEffect(() => {
    if (activeTab !== "쇼핑" || shoppingTab !== "홈") return;
    setShopHomeVisibleCount(30);
    setShopHomeBannerIndex(0);
    setShopHomeBannerDragOffset(0);
  }, [activeTab, shoppingTab, selectedShopCategory, shopHomeSort]);
  reactExports.useEffect(() => {
    if (activeTab !== "쇼핑" || shoppingTab !== "홈" || shopHomeHeroSlides.length <= 1 || shopHomeBannerPointerActiveRef.current) return;
    const timer = window.setInterval(() => {
      setShopHomeBannerIndex((prev) => (prev + 1) % shopHomeHeroSlides.length);
    }, 3e3);
    return () => window.clearInterval(timer);
  }, [activeTab, shoppingTab, shopHomeHeroSlides.length, shopHomeBannerIndex]);
  const goPrevShopHomeBanner = () => {
    setShopHomeBannerIndex((prev) => (prev - 1 + shopHomeHeroSlides.length) % shopHomeHeroSlides.length);
  };
  const goNextShopHomeBanner = () => {
    setShopHomeBannerIndex((prev) => (prev + 1) % shopHomeHeroSlides.length);
  };
  const handleShopHomeBannerPointerDown = (event) => {
    if (shopHomeHeroSlides.length <= 1) return;
    shopHomeBannerPointerActiveRef.current = true;
    shopHomeBannerPointerStartXRef.current = event.clientX;
    setShopHomeBannerDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handleShopHomeBannerPointerMove = (event) => {
    if (!shopHomeBannerPointerActiveRef.current || shopHomeBannerPointerStartXRef.current === null) return;
    setShopHomeBannerDragOffset(event.clientX - shopHomeBannerPointerStartXRef.current);
  };
  const finishShopHomeBannerDrag = (event) => {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!shopHomeBannerPointerActiveRef.current) return;
    const dragThreshold = 42;
    if (shopHomeBannerDragOffset <= -dragThreshold) {
      goNextShopHomeBanner();
    } else if (shopHomeBannerDragOffset >= dragThreshold) {
      goPrevShopHomeBanner();
    }
    shopHomeBannerPointerActiveRef.current = false;
    shopHomeBannerPointerStartXRef.current = null;
    setShopHomeBannerDragOffset(0);
  };
  const refreshHomeFeedAtTop = reactExports.useCallback(() => {
    if (homeFeedRefreshing) return;
    setHomeFeedRefreshing(true);
    window.setTimeout(() => {
      const visibleIds = new Set(homeFeedSource.map((item) => item.id));
      const viewedIds = new Set(homeFeedViewedIdsRef.current);
      const usedTemplateIds = new Set(homeFeedRefreshUsedTemplateIdsRef.current);
      const primaryCandidates = recommendedHomeFeed.filter((item) => !visibleIds.has(item.id) && !viewedIds.has(item.id) && !usedTemplateIds.has(item.id));
      const secondaryCandidates = recommendedHomeFeed.filter((item) => !visibleIds.has(item.id) && !usedTemplateIds.has(item.id));
      const fallbackCandidates = chronologicalHomeFeed.filter((item) => !visibleIds.has(item.id) && !usedTemplateIds.has(item.id));
      const selectedTemplates = (primaryCandidates.length ? primaryCandidates : secondaryCandidates.length ? secondaryCandidates : fallbackCandidates).slice(0, HOME_FEED_REFRESH_BATCH_SIZE);
      if (!selectedTemplates.length) {
        setHomeFeedRefreshing(false);
        setHomeFeedPullDistance(0);
        showListEndToast("새로 불러올 관심 피드가 없습니다");
        return;
      }
      const nextStartId = Math.max(...allFeedItems.map((item) => item.id), 0) + 1;
      const freshItems = selectedTemplates.map((item, index) => buildFreshFeedItemFromTemplate(item, nextStartId + index, index));
      setCustomFeedItems((prev) => [...freshItems, ...prev]);
      setFeedCommentMap((prev) => {
        const next = { ...prev };
        freshItems.forEach((item) => {
          if (!next[item.id]) next[item.id] = [];
        });
        return next;
      });
      homeFeedRefreshUsedTemplateIdsRef.current = Array.from(/* @__PURE__ */ new Set([...homeFeedRefreshUsedTemplateIdsRef.current, ...selectedTemplates.map((item) => item.id)])).slice(-240);
      homeFeedViewedIdsRef.current = Array.from(/* @__PURE__ */ new Set([...homeFeedViewedIdsRef.current, ...selectedTemplates.map((item) => item.id), ...freshItems.map((item) => item.id)])).slice(-240);
      setHomeFeedVisibleCount((prev) => Math.max(prev, HOME_FEED_BATCH_SIZE));
      setHomeFeedHeaderHidden(false);
      homeFeedHideThresholdRef.current = 0;
      homeFeedShowThresholdRef.current = 0;
      lastHomeFeedScrollTopRef.current = 0;
      const node = homeFeedScrollRef.current;
      if (node) node.scrollTop = 0;
      persistHomeFeedState({ visibleCount: Math.max(homeFeedVisibleCount, HOME_FEED_BATCH_SIZE), scrollTop: 0, lastInactiveAt: 0 });
      setHomeFeedRefreshing(false);
      setHomeFeedPullDistance(0);
    }, 620);
  }, [allFeedItems, chronologicalHomeFeed, homeFeedRefreshing, homeFeedSource, homeFeedVisibleCount, persistHomeFeedState, recommendedHomeFeed, showListEndToast]);
  const handleHomeFeedPullStart = reactExports.useCallback((event) => {
    var _a2;
    if (homeFeedRefreshing) return;
    const node = homeFeedScrollRef.current;
    if (!node || node.scrollTop > 0) {
      homeFeedPullActiveRef.current = false;
      homeFeedPullStartYRef.current = null;
      return;
    }
    homeFeedPullActiveRef.current = true;
    homeFeedPullStartYRef.current = ((_a2 = event.touches[0]) == null ? void 0 : _a2.clientY) ?? null;
  }, [homeFeedRefreshing]);
  const handleHomeFeedPullMove = reactExports.useCallback((event) => {
    var _a2;
    if (!homeFeedPullActiveRef.current || homeFeedRefreshing) return;
    const startY = homeFeedPullStartYRef.current;
    const currentY = ((_a2 = event.touches[0]) == null ? void 0 : _a2.clientY) ?? null;
    const node = homeFeedScrollRef.current;
    if (startY === null || currentY === null || !node || node.scrollTop > 0) {
      homeFeedPullActiveRef.current = false;
      homeFeedPullStartYRef.current = null;
      setHomeFeedPullDistance(0);
      return;
    }
    const delta = Math.max(0, currentY - startY);
    const nextDistance = Math.min(HOME_FEED_PULL_MAX, Math.round(delta * 0.45));
    setHomeFeedPullDistance(nextDistance);
    if (nextDistance > 0) {
      event.preventDefault();
    }
  }, [homeFeedRefreshing]);
  const handleHomeFeedPullEnd = reactExports.useCallback(() => {
    if (!homeFeedPullActiveRef.current) return;
    homeFeedPullActiveRef.current = false;
    homeFeedPullStartYRef.current = null;
    if (homeFeedPullDistance >= HOME_FEED_PULL_TRIGGER) {
      setHomeFeedPullDistance(HOME_FEED_PULL_TRIGGER);
      refreshHomeFeedAtTop();
      return;
    }
    setHomeFeedPullDistance(0);
  }, [homeFeedPullDistance, refreshHomeFeedAtTop]);
  const handleHomeFeedScroll = reactExports.useCallback((event) => {
    const node = event.currentTarget;
    const currentTop = node.scrollTop;
    const remain = node.scrollHeight - currentTop - node.clientHeight;
    persistHomeFeedState({ scrollTop: currentTop });
    if (node.scrollTop + node.clientHeight >= node.scrollHeight - 160) {
      setHomeFeedVisibleCount((prev) => {
        const next = prev >= activeHomeFeedItems.length ? prev : Math.min(prev + HOME_FEED_BATCH_SIZE, activeHomeFeedItems.length);
        if (next !== prev) {
          persistHomeFeedState({ visibleCount: next, scrollTop: currentTop });
        }
        return next;
      });
    }
    if (activeHomeFeedItems.length > 0 && remain <= 48 && homeFeedVisibleCount >= activeHomeFeedItems.length) {
      showListEndToast("모든 피드를 확인하였습니다");
    }
    if (homeFeedScrollRafRef.current !== null) {
      window.cancelAnimationFrame(homeFeedScrollRafRef.current);
    }
    homeFeedScrollRafRef.current = window.requestAnimationFrame(() => {
      const prevTop = lastHomeFeedScrollTopRef.current;
      const delta = currentTop - prevTop;
      lastHomeFeedScrollTopRef.current = currentTop;
      if (currentTop <= 8) {
        homeFeedHideThresholdRef.current = 0;
        homeFeedShowThresholdRef.current = 0;
        if (homeFeedHeaderHidden) {
          setHomeFeedHeaderHidden(false);
        }
        return;
      }
      if (delta > 2) {
        homeFeedHideThresholdRef.current += delta;
        homeFeedShowThresholdRef.current = 0;
      } else if (delta < -2) {
        homeFeedShowThresholdRef.current += Math.abs(delta);
        homeFeedHideThresholdRef.current = 0;
      }
      if (!homeFeedHeaderHidden && homeFeedHideThresholdRef.current >= 28 && currentTop > 32) {
        homeFeedHideThresholdRef.current = 0;
        setHomeFeedHeaderHidden(true);
      } else if (homeFeedHeaderHidden && homeFeedShowThresholdRef.current >= 18) {
        homeFeedShowThresholdRef.current = 0;
        setHomeFeedHeaderHidden(false);
      }
    });
  }, [activeHomeFeedItems.length, homeFeedHeaderHidden, homeFeedVisibleCount, persistHomeFeedState, showListEndToast]);
  const handleShopHomeScroll = (event) => {
    const node = event.currentTarget;
    if (node.scrollTop + node.clientHeight < node.scrollHeight - 120) return;
    setShopHomeVisibleCount((prev) => prev + 9);
  };
  const handleShopHomeGridPointerDown = (event) => {
    var _a2, _b2;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    shopHomeGridHasDraggedRef.current = false;
    shopHomeGridDraggingRef.current = true;
    setShopHomeGridDragging(true);
    shopHomeGridDragStartYRef.current = event.clientY;
    shopHomeGridDragStartScrollTopRef.current = event.currentTarget.scrollTop;
    (_b2 = (_a2 = event.currentTarget).setPointerCapture) == null ? void 0 : _b2.call(_a2, event.pointerId);
  };
  const handleShopHomeGridPointerMove = (event) => {
    if (!shopHomeGridDraggingRef.current || shopHomeGridDragStartYRef.current === null) return;
    const deltaY = event.clientY - shopHomeGridDragStartYRef.current;
    if (Math.abs(deltaY) > 4) {
      shopHomeGridHasDraggedRef.current = true;
      shopHomeGridSuppressClickUntilRef.current = Date.now() + 260;
    }
    event.currentTarget.scrollTop = shopHomeGridDragStartScrollTopRef.current - deltaY;
    event.preventDefault();
  };
  const finishShopHomeGridPointerDrag = (event) => {
    var _a2, _b2;
    if (event) {
      try {
        (_b2 = (_a2 = event.currentTarget).releasePointerCapture) == null ? void 0 : _b2.call(_a2, event.pointerId);
      } catch {
      }
    }
    shopHomeGridDraggingRef.current = false;
    setShopHomeGridDragging(false);
    shopHomeGridDragStartYRef.current = null;
  };
  const handleShopHomeProductCardClick = (productId) => {
    if (Date.now() < shopHomeGridSuppressClickUntilRef.current) return;
    openProductDetail(productId);
  };
  const filteredCommunity = reactExports.useMemo(() => {
    const keyword = `${communityKeyword} ${globalKeyword}`.trim().toLowerCase();
    const visiblePosts = communitySeed.filter((post) => {
      const boardMatch = communityTab === "이벤트" ? post.board === "이벤트" : communityTab === "커뮤" ? post.board === "커뮤" || !post.board : post.board === communityTab;
      const categoryMatch = selectedCommunityCategory === "전체" || post.category === selectedCommunityCategory;
      const primaryMatch = communityPrimaryFilter === "전체" || post.audience === communityPrimaryFilter;
      const keywordMatch = !keyword || `${post.title} ${post.summary} ${post.category}`.toLowerCase().includes(keyword);
      return boardMatch && categoryMatch && primaryMatch && keywordMatch;
    });
    if (communitySecondaryFilter === "최신순" || communitySecondaryFilter === "전체") {
      return visiblePosts;
    }
    if (communitySecondaryFilter === "공지우선") {
      return [...visiblePosts].sort((a, b) => {
        if (a.category === "공지" && b.category !== "공지") return -1;
        if (a.category !== "공지" && b.category === "공지") return 1;
        return (b.sortScore ?? 0) - (a.sortScore ?? 0);
      });
    }
    if (communitySecondaryFilter === "인기순") {
      return [...visiblePosts].sort((a, b) => (b.sortScore ?? 0) - (a.sortScore ?? 0));
    }
    return visiblePosts;
  }, [communityTab, selectedCommunityCategory, communityKeyword, globalKeyword, communityPrimaryFilter, communitySecondaryFilter]);
  reactExports.useEffect(() => {
    setCommunityPage(1);
  }, [communityTab, selectedCommunityCategory, communityPrimaryFilter, communitySecondaryFilter, communityKeyword, globalKeyword]);
  const COMMUNITY_PAGE_SIZE = 8;
  const communityPageCount = Math.max(1, Math.ceil(filteredCommunity.length / COMMUNITY_PAGE_SIZE));
  const pagedCommunity = reactExports.useMemo(() => {
    const start = (communityPage - 1) * COMMUNITY_PAGE_SIZE;
    return filteredCommunity.slice(start, start + COMMUNITY_PAGE_SIZE);
  }, [filteredCommunity, communityPage]);
  const communityDisplayRows = reactExports.useMemo(() => Array.from({ length: COMMUNITY_PAGE_SIZE }, (_, index) => pagedCommunity[index] ?? null), [pagedCommunity]);
  reactExports.useEffect(() => {
    setCommunityExplorerStage("list");
    setSelectedCommunityPost(null);
  }, [communityTab, selectedCommunityCategory, communityPrimaryFilter, communitySecondaryFilter, communityPage]);
  const openCommunityPost = reactExports.useCallback((post) => {
    setSelectedCommunityPost(post);
    if (post.contentType === "test") {
      setTestAnswers({});
    }
    setCommunityExplorerStage(post.contentType === "test" ? "test_intro" : "detail");
  }, []);
  const closeCommunityExplorer = reactExports.useCallback(() => {
    setCommunityExplorerStage("list");
    setSelectedCommunityPost(null);
  }, []);
  const resetCommunityTest = reactExports.useCallback(() => {
    setTestAnswers({});
    setCommunityExplorerStage((selectedCommunityPost == null ? void 0 : selectedCommunityPost.contentType) === "test" ? "test_intro" : "detail");
  }, [selectedCommunityPost]);
  const testAnsweredCount = reactExports.useMemo(() => Object.keys(testAnswers).length, [testAnswers]);
  reactExports.useMemo(() => {
    const firstEmpty = testQuestions.findIndex((question) => testAnswers[question.id] === void 0);
    return firstEmpty === -1 ? testQuestions.length - 1 : firstEmpty;
  }, [testAnswers]);
  const testResultRows = reactExports.useMemo(() => {
    const rawScores = testQuestions.reduce((acc, question) => {
      const answer = testAnswers[question.id];
      Object.entries(question.weights).forEach(([axis, weight]) => {
        const key = axis;
        acc[key] = (acc[key] ?? 0) + (answer ?? 0) * weight;
      });
      return acc;
    }, {});
    return Object.keys(testAxisMeta).map((axis) => {
      const raw = rawScores[axis] ?? 0;
      const max = Math.max(testMaxScores[axis] ?? 1, 1);
      const normalized = Math.round((raw + max) / (max * 2) * 100);
      return {
        axis,
        label: testAxisMeta[axis].label,
        summary: testAxisMeta[axis].summary,
        score: Math.max(0, Math.min(100, normalized))
      };
    }).sort((a, b) => b.score - a.score);
  }, [testAnswers]);
  const testTopResults = testResultRows.slice(0, 5);
  const testCanShowResult = testAnsweredCount === testQuestionCount;
  const answerCommunityTestQuestion = reactExports.useCallback((questionId, score) => {
    setTestAnswers((prev) => ({ ...prev, [questionId]: score }));
  }, []);
  const filteredThreads = reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    return threadItems.filter((thread) => {
      if (thread.status === "요청받음") return false;
      const isOneToOne = thread.purpose.includes("상호수락 1:1");
      const isShoppingThread = ["상품/운영 문의", "정산/환불", "쇼핑 주문", "구매자 지원"].includes(thread.purpose);
      const categoryMatch = chatCategory === "전체" || chatCategory === "즐겨찾기" && !!thread.favorite || chatCategory === "개인" && isOneToOne || chatCategory === "단체" && thread.kind === "단체" || chatCategory === "쇼핑" && isShoppingThread;
      const keywordMatch = !keyword || `${thread.name} ${thread.preview} ${thread.purpose}`.toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });
  }, [globalKeyword, chatCategory, threadItems]);
  reactExports.useEffect(() => {
    setChatVisibleCount(30);
  }, [chatCategory, globalKeyword]);
  const pagedThreads = reactExports.useMemo(() => filteredThreads.slice(0, chatVisibleCount), [filteredThreads, chatVisibleCount]);
  const chatDisplayRows = reactExports.useMemo(() => {
    const rowCount = Math.max(CHAT_LIST_BASE_ROWS, pagedThreads.length);
    return Array.from({ length: rowCount }, (_, index) => pagedThreads[index] ?? null);
  }, [pagedThreads]);
  const activeChatThread = reactExports.useMemo(() => threadItems.find((item) => item.id === activeChatThreadId) ?? null, [threadItems, activeChatThreadId]);
  const activeChatMessages = activeChatThread ? chatMessagesByThread[activeChatThread.id] ?? [] : [];
  const activePinnedMessage = reactExports.useMemo(() => {
    if (!activeChatThread) return null;
    const pinnedId = chatPinnedMessageByThread[activeChatThread.id];
    if (!pinnedId) return null;
    return activeChatMessages.find((message) => message.id === pinnedId) ?? null;
  }, [activeChatMessages, activeChatThread, chatPinnedMessageByThread]);
  const selectedChatRequest = reactExports.useMemo(() => {
    if (selectedChatRequestId === null) return chatRequestItems[0] ?? null;
    return chatRequestItems.find((item) => item.id === selectedChatRequestId) ?? chatRequestItems[0] ?? null;
  }, [chatRequestItems, selectedChatRequestId]);
  const filteredChatShareTargets = reactExports.useMemo(() => {
    const keyword = chatShareKeyword.trim().toLowerCase();
    return threadItems.filter((thread) => {
      if (thread.id === activeChatThreadId) return false;
      if (!keyword) return true;
      return `${thread.name} ${thread.purpose} ${thread.preview}`.toLowerCase().includes(keyword);
    });
  }, [activeChatThreadId, chatShareKeyword, threadItems]);
  const chatPickerCollections = reactExports.useMemo(() => {
    return [
      { key: "recent", label: "최근사용" },
      { key: "all", label: "모든" },
      ...CHAT_PICKER_LIBRARY[chatEmojiMode].map((item) => ({ key: item.key, label: item.label }))
    ];
  }, [chatEmojiMode]);
  const chatPickerItems = reactExports.useMemo(() => {
    var _a2;
    const keyword = chatEmojiKeyword.trim().toLowerCase();
    const baseItems = chatEmojiCollectionKey === "recent" ? chatRecentPickerItems[chatEmojiMode] : chatEmojiCollectionKey === "all" ? CHAT_PICKER_LIBRARY[chatEmojiMode].flatMap((item) => item.items) : ((_a2 = CHAT_PICKER_LIBRARY[chatEmojiMode].find((item) => item.key === chatEmojiCollectionKey)) == null ? void 0 : _a2.items) ?? [];
    return Array.from(new Set(baseItems)).filter((item) => !keyword || item.toLowerCase().includes(keyword));
  }, [chatEmojiCollectionKey, chatEmojiKeyword, chatEmojiMode, chatRecentPickerItems]);
  const canManageChatMessage = reactExports.useCallback((message) => {
    if (!message.mine || message.system) return false;
    return Date.now() - (message.createdAt ?? Date.now()) <= 60 * 60 * 1e3;
  }, []);
  const appendOutgoingChatMessage = reactExports.useCallback((rawText, contentKind = "text") => {
    if (!activeChatThread) return;
    const trimmed = rawText.trim();
    if (!trimmed) return;
    const now = Date.now();
    const previewText = contentKind === "sticker" ? `[스티커] ${trimmed}` : contentKind === "gif" ? `[GIF] ${trimmed}` : trimmed;
    const myMessage = {
      id: now,
      threadId: activeChatThread.id,
      author: "나",
      text: trimmed,
      meta: formatChatMessageMeta(now),
      mine: true,
      createdAt: now,
      replyTo: chatReplyTarget ? { id: chatReplyTarget.id, author: chatReplyTarget.author, text: chatReplyTarget.text } : null,
      contentKind
    };
    if (activeChatThread.status === "요청전송") {
      setChatMessagesByThread((prev) => ({
        ...prev,
        [activeChatThread.id]: [...prev[activeChatThread.id] ?? [], myMessage]
      }));
      setThreadItems((prev) => prev.map((item) => item.id === activeChatThread.id ? { ...item, preview: previewText, time: "방금", unread: 0, status: "요청전송" } : item));
      setChatReplyTarget(null);
      setChatRoomDraft("");
      setChatAttachmentSheetOpen(false);
      setChatEmojiSheetOpen(false);
      setChatLongPressHint("상대방이 아직 요청을 수락하지 않아 답장은 시작되지 않았습니다.");
      return;
    }
    if (activeChatThread.status === "요청받음") {
      const acceptedSystemMessage = {
        id: now + 1,
        threadId: activeChatThread.id,
        author: "system",
        text: "첫 메시지를 보내 채팅 요청을 수락했습니다. 이제 일반 채팅 목록에서 이어서 대화할 수 있습니다.",
        meta: "지금",
        system: true,
        createdAt: now + 1
      };
      setChatMessagesByThread((prev) => ({
        ...prev,
        [activeChatThread.id]: [...prev[activeChatThread.id] ?? [], myMessage, acceptedSystemMessage]
      }));
      setThreadItems((prev) => prev.map((item) => item.id === activeChatThread.id ? { ...item, preview: previewText, time: "방금", unread: 0, status: "수락완료" } : item));
      setChatRequestItems((prev) => prev.filter((item) => item.id !== activeChatThread.id));
      setChatReplyTarget(null);
      setChatRoomDraft("");
      setChatAttachmentSheetOpen(false);
      setChatEmojiSheetOpen(false);
      setChatLongPressHint("첫 메시지 전송으로 채팅 요청이 수락되었습니다.");
      return;
    }
    const replyText = activeChatThread.kind === "단체" ? "방 주제에 맞는 대화로 이어가 주세요. 최근 메시지 아래에 순서대로 반영했습니다." : "메시지를 확인했습니다. 지금 채팅방에서 바로 이어서 대화를 진행할 수 있습니다.";
    const replyMessage = {
      id: now + 1,
      threadId: activeChatThread.id,
      author: activeChatThread.name,
      text: replyText,
      meta: formatChatMessageMeta(now + 1),
      mine: false,
      createdAt: now + 1,
      contentKind: "text"
    };
    setChatMessagesByThread((prev) => ({
      ...prev,
      [activeChatThread.id]: [...prev[activeChatThread.id] ?? [], myMessage, replyMessage]
    }));
    setThreadItems((prev) => prev.map((item) => item.id === activeChatThread.id ? { ...item, preview: previewText, time: "방금", unread: 0 } : item));
    setChatReplyTarget(null);
    setChatRoomDraft("");
    setChatAttachmentSheetOpen(false);
    setChatEmojiSheetOpen(false);
  }, [activeChatThread, chatReplyTarget]);
  const handleChatEmojiSearch = reactExports.useCallback(() => {
    setChatEmojiCollectionKey("all");
    setChatLongPressHint(`${chatEmojiMode} 검색 결과 ${chatPickerItems.length}건을 표시합니다.`);
  }, [chatEmojiMode, chatPickerItems.length]);
  const handleChatEmojiStoreOpen = reactExports.useCallback(() => {
    setChatLongPressHint(`${chatEmojiMode} 상점 화면은 준비 중입니다.`);
  }, [chatEmojiMode]);
  const handleChatPickerSelect = reactExports.useCallback((item) => {
    const contentKind = chatEmojiMode === "이모티콘" ? "emoji" : chatEmojiMode === "스티커" ? "sticker" : "gif";
    setChatRecentPickerItems((prev) => ({
      ...prev,
      [chatEmojiMode]: [item, ...prev[chatEmojiMode].filter((entry) => entry !== item)].slice(0, 12)
    }));
    appendOutgoingChatMessage(item, contentKind);
    setChatLongPressHint(`${chatEmojiMode}이 전송되었습니다.`);
  }, [appendOutgoingChatMessage, chatEmojiMode]);
  const handleChatQuickShareAction = reactExports.useCallback((label) => {
    setChatAttachmentSheetOpen(false);
    setChatEmojiSheetOpen(false);
    setChatLongPressHint(`${label} 메뉴가 열렸습니다.`);
  }, []);
  const openChatMessageMenu = reactExports.useCallback((message) => {
    setChatContextMessage(message);
    setChatAttachmentSheetOpen(false);
    setChatEmojiSheetOpen(false);
  }, []);
  const clearChatMessageHold = reactExports.useCallback(() => {
    if (chatMessageHoldTimerRef.current !== null) {
      window.clearTimeout(chatMessageHoldTimerRef.current);
      chatMessageHoldTimerRef.current = null;
    }
  }, []);
  const startChatMessageHold = reactExports.useCallback((message) => {
    clearChatMessageHold();
    chatMessageHoldTimerRef.current = window.setTimeout(() => {
      openChatMessageMenu(message);
      chatMessageHoldTimerRef.current = null;
    }, 420);
  }, [clearChatMessageHold, openChatMessageMenu]);
  reactExports.useEffect(() => () => {
    if (chatMessageHoldTimerRef.current !== null) {
      window.clearTimeout(chatMessageHoldTimerRef.current);
    }
  }, []);
  reactExports.useEffect(() => {
    if (!chatMessageListRef.current) return;
    chatMessageListRef.current.scrollTop = chatMessageListRef.current.scrollHeight;
  }, [activeChatMessages.length, activeChatThreadId]);
  reactExports.useEffect(() => {
    if (!chatLongPressHint) return;
    const timer = window.setTimeout(() => setChatLongPressHint(""), 2200);
    return () => window.clearTimeout(timer);
  }, [chatLongPressHint]);
  reactExports.useEffect(() => {
    setChatEmojiCollectionKey("recent");
    setChatEmojiKeyword("");
  }, [chatEmojiMode]);
  reactExports.useEffect(() => {
    if (!chatRequestItems.length) {
      setSelectedChatRequestId(null);
      return;
    }
    if (selectedChatRequestId !== null && chatRequestItems.some((item) => item.id === selectedChatRequestId)) {
      return;
    }
    setSelectedChatRequestId(chatRequestItems[0].id);
  }, [chatRequestItems, selectedChatRequestId]);
  const openChatThread = reactExports.useCallback((thread) => {
    setChatListMode("threads");
    setActiveChatThreadId(thread.id);
    setThreadItems((prev) => prev.map((item) => item.id === thread.id ? { ...item, unread: 0 } : item));
    setChatMessagesByThread((prev) => prev[thread.id] ? prev : { ...prev, [thread.id]: createThreadRoomSeed(thread) });
    setChatAttachmentSheetOpen(false);
    setChatEmojiSheetOpen(false);
    setChatContextMessage(null);
    setChatReplyTarget(null);
    setChatEditableMessageId(null);
    setChatSelectableMessageId(null);
    setChatShareMessage(null);
    setChatShareKeyword("");
  }, []);
  const openIncomingChatRequest = reactExports.useCallback((request2) => {
    const existing = threadItems.find((item) => item.name === request2.name && item.purpose === "상호수락 1:1");
    if (existing && existing.status !== "요청받음") {
      openChatThread(existing);
      setChatTab("채팅");
      setActiveTab("채팅");
      return;
    }
    const pendingThread = existing ? { ...existing, preview: request2.requestText, time: request2.time, unread: 0, favorite: true, status: "요청받음" } : {
      id: request2.id,
      name: request2.name,
      purpose: "상호수락 1:1",
      preview: request2.requestText,
      time: request2.time,
      unread: 0,
      avatar: request2.avatar,
      avatarUrl: request2.avatarUrl ?? buildChatAvatarDataUri(request2.name),
      kind: "개인",
      favorite: true,
      status: "요청받음"
    };
    setThreadItems((prev) => existing ? prev.map((item) => item.id === existing.id ? pendingThread : item) : [pendingThread, ...prev]);
    setChatMessagesByThread((prev) => prev[pendingThread.id] ? prev : { ...prev, [pendingThread.id]: createThreadRoomSeed(pendingThread) });
    openChatThread(pendingThread);
    setChatTab("채팅");
    setActiveTab("채팅");
  }, [openChatThread, setActiveTab, setChatTab, threadItems]);
  const deleteChatRequest = reactExports.useCallback((request2) => {
    setChatRequestItems((prev) => prev.filter((item) => item.id !== request2.id));
    setThreadItems((prev) => prev.filter((item) => item.id !== request2.id));
    setChatMessagesByThread((prev) => {
      if (!(request2.id in prev)) return prev;
      const next = { ...prev };
      delete next[request2.id];
      return next;
    });
    if (activeChatThreadId === request2.id) {
      setActiveChatThreadId(null);
      setChatRoomDraft("");
      setChatAttachmentSheetOpen(false);
      setChatEmojiSheetOpen(false);
      setChatContextMessage(null);
      setChatReplyTarget(null);
      setChatEditableMessageId(null);
      setChatSelectableMessageId(null);
      setChatShareMessage(null);
      setChatShareKeyword("");
      setChatCopiedSelection("");
      setChatListMode("requests");
    }
    setChatLongPressHint(`${request2.name} 님 요청을 삭제했습니다.`);
  }, [activeChatThreadId]);
  const openProfileChatRequest = reactExports.useCallback(() => {
    if (currentProfileMeta.isOwner) return;
    const targetName = currentProfileMeta.name;
    const existing = threadItems.find((item) => item.name === targetName && item.purpose === "상호수락 1:1");
    const acceptedStatuses = /* @__PURE__ */ new Set(["수락완료", "활성"]);
    if (existing) {
      const nextStatus = acceptedStatuses.has(existing.status ?? "") ? existing.status : "요청전송";
      const nextPreview = acceptedStatuses.has(existing.status ?? "") ? existing.preview : "채팅 요청을 보냈습니다. 상대방 수락 후 답장이 가능합니다.";
      const nextThread = { ...existing, status: nextStatus, preview: nextPreview, time: acceptedStatuses.has(existing.status ?? "") ? existing.time : "방금", unread: 0 };
      setThreadItems((prev) => prev.map((item) => item.id === existing.id ? nextThread : item));
      setChatMessagesByThread((prev) => prev[existing.id] ? prev : { ...prev, [existing.id]: createThreadRoomSeed(nextThread) });
      openChatThread(nextThread);
      setChatTab("채팅");
      setActiveTab("채팅");
      return;
    }
    const newThread = {
      id: Date.now(),
      name: targetName,
      purpose: "상호수락 1:1",
      preview: "채팅 요청을 보냈습니다. 상대방 수락 후 답장이 가능합니다.",
      time: "방금",
      unread: 0,
      avatar: currentProfileMeta.avatar,
      avatarUrl: buildChatAvatarDataUri(targetName),
      kind: "개인",
      favorite: true,
      status: "요청전송"
    };
    setThreadItems((prev) => [newThread, ...prev]);
    setChatMessagesByThread((prev) => ({ ...prev, [newThread.id]: createThreadRoomSeed(newThread) }));
    openChatThread(newThread);
    setChatTab("채팅");
    setActiveTab("채팅");
  }, [currentProfileMeta, openChatThread, setActiveTab, setChatTab, threadItems]);
  const acceptChatRequest = reactExports.useCallback((request2) => {
    const existing = threadItems.find((item) => item.name === request2.name && item.purpose === "상호수락 1:1");
    const acceptedThread = existing ? { ...existing, preview: request2.requestText, time: "방금", unread: 0, favorite: true, status: "수락완료" } : {
      id: Date.now(),
      name: request2.name,
      purpose: "상호수락 1:1",
      preview: request2.requestText,
      time: "방금",
      unread: 0,
      avatar: request2.avatar,
      avatarUrl: request2.avatarUrl ?? buildChatAvatarDataUri(request2.name),
      kind: "개인",
      favorite: true,
      status: "수락완료"
    };
    setThreadItems((prev) => existing ? prev.map((item) => item.id === acceptedThread.id ? acceptedThread : item) : [acceptedThread, ...prev]);
    setChatMessagesByThread((prev) => ({
      ...prev,
      [acceptedThread.id]: [
        ...createThreadRoomSeed(acceptedThread),
        {
          id: acceptedThread.id * 100 + 88,
          threadId: acceptedThread.id,
          author: "system",
          text: "채팅 요청을 수락했습니다. 이제 서로 답장이 가능합니다.",
          meta: "지금",
          system: true,
          createdAt: Date.now() - 6e4
        }
      ]
    }));
    setChatRequestItems((prev) => prev.filter((item) => item.id !== request2.id));
    setChatLongPressHint(`${request2.name} 님 요청을 수락했습니다.`);
    openChatThread(acceptedThread);
    setChatCategory("전체");
    setChatTab("채팅");
    setActiveTab("채팅");
  }, [openChatThread, setActiveTab, setChatTab, threadItems]);
  const closeActiveChatThread = reactExports.useCallback(() => {
    setActiveChatThreadId(null);
    setChatRoomDraft("");
    setChatAttachmentSheetOpen(false);
    setChatEmojiSheetOpen(false);
    setChatContextMessage(null);
    setChatReplyTarget(null);
    setChatEditableMessageId(null);
    setChatSelectableMessageId(null);
    setChatShareMessage(null);
    setChatShareKeyword("");
    setChatCopiedSelection("");
  }, []);
  const submitChatRoomMessage = reactExports.useCallback(() => {
    if (!activeChatThread) return;
    const trimmed = chatRoomDraft.trim();
    if (!trimmed) return;
    if (chatEditableMessageId !== null) {
      setChatMessagesByThread((prev) => ({
        ...prev,
        [activeChatThread.id]: (prev[activeChatThread.id] ?? []).map((message) => message.id === chatEditableMessageId ? { ...message, text: trimmed, meta: formatChatMessageMeta(message.createdAt, true), edited: true } : message)
      }));
      setThreadItems((prev) => prev.map((item) => item.id === activeChatThread.id ? { ...item, preview: trimmed, time: "방금", unread: 0 } : item));
      setChatEditableMessageId(null);
      setChatReplyTarget(null);
      setChatRoomDraft("");
      setChatLongPressHint("메시지가 수정되었습니다.");
      return;
    }
    appendOutgoingChatMessage(trimmed, "text");
  }, [activeChatThread, appendOutgoingChatMessage, chatEditableMessageId, chatRoomDraft]);
  const applyChatReaction = reactExports.useCallback((message, reaction) => {
    var _a2;
    setChatMessagesByThread((prev) => ({
      ...prev,
      [message.threadId]: (prev[message.threadId] ?? []).map((item) => item.id === message.id ? { ...item, reaction } : item)
    }));
    setChatContextMessage(null);
    setChatLongPressHint(`${((_a2 = CHAT_REACTION_OPTIONS.find((item) => item.key === reaction)) == null ? void 0 : _a2.label) ?? "이모지"} 반응을 남겼습니다.`);
  }, []);
  const copyChatMessage = reactExports.useCallback((message) => {
    copyToClipboard(message.text);
    setChatContextMessage(null);
    setChatLongPressHint("메시지를 복사했습니다.");
  }, []);
  const enableChatSelectionCopy = reactExports.useCallback((message) => {
    setChatContextMessage(null);
    setChatSelectableMessageId(message.id);
    setChatCopiedSelection("");
    setChatLongPressHint("메시지 일부를 드래그해 선택한 뒤 복사 버튼을 눌러주세요.");
  }, []);
  const copySelectedChatText = reactExports.useCallback(() => {
    var _a2, _b2, _c2;
    const selectedText = typeof window !== "undefined" ? ((_b2 = (_a2 = window.getSelection) == null ? void 0 : _a2.call(window)) == null ? void 0 : _b2.toString().trim()) ?? "" : "";
    const fallback = ((_c2 = activeChatMessages.find((message) => message.id === chatSelectableMessageId)) == null ? void 0 : _c2.text) ?? "";
    const nextText = selectedText || fallback;
    if (!nextText) return;
    copyToClipboard(nextText);
    setChatCopiedSelection(nextText);
    setChatLongPressHint("선택한 텍스트를 복사했습니다.");
  }, [activeChatMessages, chatSelectableMessageId]);
  const pinChatMessage = reactExports.useCallback((message) => {
    setChatPinnedMessageByThread((prev) => ({ ...prev, [message.threadId]: message.id }));
    setChatContextMessage(null);
    setChatLongPressHint("상단 공지로 고정했습니다.");
  }, []);
  const startChatEdit = reactExports.useCallback((message) => {
    if (!canManageChatMessage(message)) return;
    setChatEditableMessageId(message.id);
    setChatRoomDraft(message.text);
    setChatReplyTarget(null);
    setChatContextMessage(null);
    setChatLongPressHint("1시간 이내 메시지 수정 모드입니다.");
  }, [canManageChatMessage]);
  const deleteChatMessage = reactExports.useCallback((message) => {
    if (!canManageChatMessage(message)) return;
    setChatMessagesByThread((prev) => ({
      ...prev,
      [message.threadId]: (prev[message.threadId] ?? []).filter((item) => item.id !== message.id)
    }));
    setChatPinnedMessageByThread((prev) => prev[message.threadId] === message.id ? { ...prev, [message.threadId]: null } : prev);
    setChatContextMessage(null);
    setChatLongPressHint("메시지를 삭제했습니다.");
  }, [canManageChatMessage]);
  const openChatShareSheet = reactExports.useCallback((message) => {
    setChatContextMessage(null);
    setChatShareMessage(message);
    setChatShareKeyword("");
  }, []);
  const shareChatMessageToThread = reactExports.useCallback((thread) => {
    if (!chatShareMessage) return;
    const now = Date.now();
    const sharedText = `[공유] ${chatShareMessage.author}: ${chatShareMessage.text}`;
    const sharedMessage = {
      id: now,
      threadId: thread.id,
      author: "나",
      text: sharedText,
      meta: formatChatMessageMeta(now),
      mine: true,
      createdAt: now
    };
    setChatMessagesByThread((prev) => ({
      ...prev,
      [thread.id]: [...prev[thread.id] ?? createThreadRoomSeed(thread), sharedMessage]
    }));
    setThreadItems((prev) => prev.map((item) => item.id === thread.id ? { ...item, preview: sharedText, time: "방금", unread: 0 } : item));
    setChatShareMessage(null);
    setChatLongPressHint(`${thread.name} 채팅방으로 공유했습니다.`);
  }, [chatShareMessage]);
  const copyChatShareLink = reactExports.useCallback(() => {
    if (!chatShareMessage) return;
    copyToClipboard(`adultapp://chat/${chatShareMessage.threadId}/message/${chatShareMessage.id}`);
    setChatLongPressHint("메시지 링크를 복사했습니다.");
  }, [chatShareMessage]);
  const replyChatMessage = reactExports.useCallback((message) => {
    setChatReplyTarget(message);
    setChatContextMessage(null);
    setChatLongPressHint(`${message.author} 메시지에 답장합니다.`);
  }, []);
  const filteredForumRooms = reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    return forumRoomSeed.filter((room) => {
      const categoryMatch = room.category === selectedForumCategory;
      const keywordMatch = !keyword || `${room.title} ${room.summary} ${room.category} ${room.starter}`.toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });
  }, [globalKeyword, selectedForumCategory]);
  const activeForumRoom = reactExports.useMemo(() => forumRoomSeed.find((room) => room.id === activeForumRoomId) ?? null, [activeForumRoomId]);
  const activeForumMessages = activeForumRoom ? forumRoomMessages[activeForumRoom.id] ?? [] : [];
  const filteredQuestions = reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    return !keyword ? questionSeed : questionSeed.filter((item) => `${item.author} ${item.question} ${item.answer}`.toLowerCase().includes(keyword));
  }, [globalKeyword]);
  reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    return randomRooms.filter((room) => {
      const categoryMatch = randomRoomCategory === "전체" || room.category === randomRoomCategory;
      const keywordMatch = !keyword || `${room.title} ${room.category}`.toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });
  }, [globalKeyword, randomRoomCategory, randomRooms]);
  const homeProducts = reactExports.useMemo(() => productsSeed.slice(0, 4), []);
  reactExports.useMemo(() => [...productsSeed, ...shopCatalogItems, ...homeProducts.map((item) => ({ ...item, subtitle: item.subtitle ?? "", badge: item.badge ?? "" }))].filter((item, index, arr) => arr.findIndex((row) => row.id === item.id) === index && savedProductIds.includes(item.id)), [savedProductIds, homeProducts, shopCatalogItems]);
  const homeSearchResults = reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return allFeedItems.filter((item) => {
      const source = `${item.title} ${item.caption} ${item.author} ${item.category}`.toLowerCase();
      if (searchFilter === "피드") return `${item.title} ${item.caption}`.toLowerCase().includes(keyword);
      if (searchFilter === "작성자") return item.author.toLowerCase().includes(keyword);
      return source.includes(keyword);
    });
  }, [globalKeyword, searchFilter]);
  const shopSearchResults = reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    const minPrice = Number(shopSearchPriceMin.replace(/[^\d]/g, "")) || 0;
    const maxPrice = Number(shopSearchPriceMax.replace(/[^\d]/g, "")) || 0;
    if (!keyword) return [];
    return shopCatalogItems.filter((item) => {
      const source = `${item.name} ${item.subtitle} ${item.category}`.toLowerCase();
      const colorTag = getProductColorTag(item);
      const purposeTag = getProductPurposeTag(item);
      const priceValue = getProductNumericPrice(item);
      const matchKeyword = searchFilter === "상품명" ? item.name.toLowerCase().includes(keyword) : searchFilter === "내용" ? item.subtitle.toLowerCase().includes(keyword) : searchFilter === "카테고리" ? item.category.toLowerCase().includes(keyword) : source.includes(keyword);
      const matchMin = !minPrice || priceValue >= minPrice;
      const matchMax = !maxPrice || priceValue <= maxPrice;
      const matchColor = shopSearchColor === "전체" || colorTag === shopSearchColor;
      const matchPurpose = shopSearchPurpose === "전체" || purposeTag === shopSearchPurpose;
      return matchKeyword && matchMin && matchMax && matchColor && matchPurpose;
    });
  }, [globalKeyword, searchFilter, shopCatalogItems, shopSearchPriceMin, shopSearchPriceMax, shopSearchColor, shopSearchPurpose]);
  const visibleShopSearchResults = reactExports.useMemo(() => shopSearchResults.slice(0, shopSearchVisibleCount), [shopSearchResults, shopSearchVisibleCount]);
  reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return communitySeed.filter((item) => {
      if (searchFilter === "제목") return item.title.toLowerCase().includes(keyword);
      if (searchFilter === "내용") return item.summary.toLowerCase().includes(keyword);
      if (searchFilter === "카테고리") return item.category.toLowerCase().includes(keyword);
      return `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(keyword);
    });
  }, [globalKeyword, searchFilter]);
  const chatSearchResults = reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return threadSeed.filter((item) => {
      if (searchFilter === "제목") return item.name.toLowerCase().includes(keyword);
      if (searchFilter === "내용") return item.preview.toLowerCase().includes(keyword);
      if (searchFilter === "유형") return `${item.kind} ${item.purpose}`.toLowerCase().includes(keyword);
      return `${item.name} ${item.preview} ${item.purpose} ${item.kind}`.toLowerCase().includes(keyword);
    });
  }, [globalKeyword, searchFilter]);
  const openProfileFromAuthor = (author) => {
    setViewedProfileAuthor(author);
    setActiveTab("프로필");
    setProfileTab("내정보");
    setProfileSection("게시물");
    setOverlayMode(null);
    setSelectedAskProfile(null);
  };
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const syncCompanyMailRoute = () => {
      setCompanyMailPreviewOpen(isCompanyMailRouteActive());
    };
    window.addEventListener("hashchange", syncCompanyMailRoute);
    window.addEventListener("popstate", syncCompanyMailRoute);
    return () => {
      window.removeEventListener("hashchange", syncCompanyMailRoute);
      window.removeEventListener("popstate", syncCompanyMailRoute);
    };
  }, []);
  reactExports.useEffect(() => {
    if (!authBootstrapDone) return;
    if (navigationRestoreRef.current) {
      navigationSnapshotRef.current = cloneNavigationSnapshot(currentNavigationSnapshot);
      navigationRestoreRef.current = false;
      return;
    }
    const previousSnapshot = navigationSnapshotRef.current;
    if (!previousSnapshot) {
      navigationSnapshotRef.current = cloneNavigationSnapshot(currentNavigationSnapshot);
      return;
    }
    const previousSnapshotKey = JSON.stringify(previousSnapshot);
    const currentSnapshotKey = JSON.stringify(currentNavigationSnapshot);
    if (previousSnapshotKey === currentSnapshotKey) return;
    navigationHistoryRef.current.push(cloneNavigationSnapshot(previousSnapshot));
    if (navigationHistoryRef.current.length > APP_NAVIGATION_HISTORY_LIMIT) {
      navigationHistoryRef.current = navigationHistoryRef.current.slice(-APP_NAVIGATION_HISTORY_LIMIT);
    }
    navigationSnapshotRef.current = cloneNavigationSnapshot(currentNavigationSnapshot);
    if (!isHomeNavigationSnapshot(currentNavigationSnapshot)) {
      hideBackMinimizeHint();
      lastBackPressAtRef.current = 0;
    }
  }, [authBootstrapDone, currentNavigationSnapshot, hideBackMinimizeHint, isHomeNavigationSnapshot]);
  reactExports.useEffect(() => {
    if (!authBootstrapDone || typeof window === "undefined" || !shouldManageMobileBrowserBack) return;
    if (browserHistoryReadyRef.current) return;
    browserHistoryReadyRef.current = true;
    browserHistoryIndexRef.current = 0;
    syncBrowserBackBarrier("replace");
    syncBrowserBackBarrier("push");
  }, [authBootstrapDone, shouldManageMobileBrowserBack, syncBrowserBackBarrier]);
  reactExports.useEffect(() => {
    if (!authBootstrapDone || typeof window === "undefined" || !shouldManageMobileBrowserBack) return;
    if (!browserHistoryReadyRef.current) return;
    if (suppressBrowserHistoryPushRef.current) {
      suppressBrowserHistoryPushRef.current = false;
      return;
    }
    syncBrowserBackBarrier("push");
  }, [authBootstrapDone, currentNavigationSnapshot, shouldManageMobileBrowserBack, syncBrowserBackBarrier]);
  reactExports.useEffect(() => {
    if (!authBootstrapDone || typeof window === "undefined" || !shouldManageMobileBrowserBack) return;
    const handleBrowserBack = () => {
      suppressBrowserHistoryPushRef.current = true;
      void handleAppBackNavigation("history");
    };
    window.addEventListener("popstate", handleBrowserBack);
    document.addEventListener("backbutton", handleBrowserBack, false);
    return () => {
      window.removeEventListener("popstate", handleBrowserBack);
      document.removeEventListener("backbutton", handleBrowserBack, false);
    };
  }, [authBootstrapDone, handleAppBackNavigation, shouldManageMobileBrowserBack]);
  reactExports.useEffect(() => {
    var _a2, _b2;
    if (!authBootstrapDone) return;
    if (typeof window === "undefined" || !((_b2 = (_a2 = window.Capacitor) == null ? void 0 : _a2.isNativePlatform) == null ? void 0 : _b2.call(_a2))) return;
    const appPlugin = getNativeAppPlugin();
    if (!(appPlugin == null ? void 0 : appPlugin.addListener)) return;
    let cancelled = false;
    let listenerHandle = null;
    void Promise.resolve(appPlugin.addListener("backButton", () => {
      void handleAppBackNavigation();
    })).then((handle) => {
      var _a3;
      if (cancelled) {
        try {
          void ((_a3 = handle == null ? void 0 : handle.remove) == null ? void 0 : _a3.call(handle));
        } catch {
        }
        return;
      }
      listenerHandle = handle ?? null;
    }).catch(() => {
    });
    return () => {
      var _a3;
      cancelled = true;
      try {
        void ((_a3 = listenerHandle == null ? void 0 : listenerHandle.remove) == null ? void 0 : _a3.call(listenerHandle));
      } catch {
      }
    };
  }, [authBootstrapDone, handleAppBackNavigation]);
  reactExports.useEffect(() => () => {
    if (typeof window !== "undefined" && backMinimizeTimerRef.current !== null) {
      window.clearTimeout(backMinimizeTimerRef.current);
    }
  }, []);
  const isDesktopSplitHost = !desktopPaneContext.embedded && windowWidth >= 1180;
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const openCompanyMailPreview = reactExports.useCallback(() => {
    setOverlayMode(null);
    setCompanyMailPreviewOpen(true);
    if (typeof window !== "undefined" && window.location.hash.toLowerCase() !== "#corp-mail-admin") {
      const next = `${window.location.pathname}${window.location.search}#corp-mail-admin`;
      window.history.replaceState(null, "", next);
    }
  }, []);
  const closeCompanyMailPreview = reactExports.useCallback(() => {
    if (companyMailHostLocked) return;
    setCompanyMailPreviewOpen(false);
    if (typeof window !== "undefined" && window.location.hash.toLowerCase() === "#corp-mail-admin") {
      const next = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", next);
    }
  }, [companyMailHostLocked]);
  const requestCompanyMailLogin = reactExports.useCallback(() => {
    if (!companyMailHostLocked) closeCompanyMailPreview();
    setAuthStandaloneScreen("login");
    setAuthMessage("회사메일은 관리자 계정으로만 접근할 수 있습니다.");
  }, [closeCompanyMailPreview, companyMailHostLocked]);
  const renderBottomTabIcon = (tab, filled) => ({
    홈: /* @__PURE__ */ jsxRuntimeExports.jsx(HomeIcon, { filled }),
    쇼핑: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBagIcon, { filled }),
    소통: /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityIcon, { filled }),
    채팅: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatIcon, { filled }),
    프로필: /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileIcon, { filled })
  })[tab];
  const bottomNavIconMap = {
    홈: renderBottomTabIcon("홈", overlayMode === null && activeTab === "홈"),
    쇼핑: renderBottomTabIcon("쇼핑", overlayMode === null && activeTab === "쇼핑"),
    소통: renderBottomTabIcon("소통", overlayMode === null && activeTab === "소통"),
    채팅: renderBottomTabIcon("채팅", overlayMode === null && activeTab === "채팅"),
    프로필: renderBottomTabIcon("프로필", overlayMode === null && activeTab === "프로필")
  };
  const legalQuickLinks = [
    { key: "terms_of_service", label: "이용약관", href: `${getApiBase()}/legal/terms-of-service` },
    { key: "privacy_policy", label: "개인정보 처리방침", href: `${getApiBase()}/legal/privacy-policy` },
    { key: "refund_policy", label: "환불정책", href: `${getApiBase()}/legal/refund-policy` },
    { key: "age_verification_policy", label: "연령 정책", href: `${getApiBase()}/legal/age-verification-policy` }
  ];
  const disclosedBusinessInfo = reactExports.useMemo(() => {
    var _a2, _b2, _c2, _d2, _e2, _f2, _g2;
    return {
      operatorName: String(((_a2 = businessInfo == null ? void 0 : businessInfo.business_info) == null ? void 0 : _a2.operator_legal_name) || ((_b2 = businessInfo == null ? void 0 : businessInfo.business_info) == null ? void 0 : _b2.operator_brand_name) || "사업자 정보 등록 필요"),
      representative: String(((_c2 = businessInfo == null ? void 0 : businessInfo.business_info) == null ? void 0 : _c2.representative_name) || "대표자 정보 등록 필요"),
      registrationNo: String(((_d2 = businessInfo == null ? void 0 : businessInfo.business_info) == null ? void 0 : _d2.business_registration_no) || "사업자번호 등록 필요"),
      phone: String(((_e2 = businessInfo == null ? void 0 : businessInfo.business_info) == null ? void 0 : _e2.support_phone) || "연락처 등록 필요"),
      address: String(((_f2 = businessInfo == null ? void 0 : businessInfo.business_info) == null ? void 0 : _f2.business_address) || "주소 등록 필요"),
      email: "aksqhqkqh153@gmail.com",
      privacyEmail: String(((_g2 = businessInfo == null ? void 0 : businessInfo.business_info) == null ? void 0 : _g2.privacy_contact_email) || "aksqhqkqh153@gmail.com")
    };
  }, [businessInfo]);
  const buildFallbackProductDetail = reactExports.useCallback((productId) => {
    var _a2;
    const fallback = shopCatalogItems.find((item) => item.id === productId) ?? productsSeed.find((item) => item.id === productId) ?? null;
    if (!fallback) return null;
    const priceValue = Number(String(fallback.price).replace(/[^\d]/g, "")) || 0;
    const shippingFee = fallback.isPremium ? 0 : 3e3;
    const sellerName = fallback.isPremium ? "adult premium store" : disclosedBusinessInfo.operatorName;
    const description = ((_a2 = fallback.subtitle) == null ? void 0 : _a2.trim()) || `${fallback.name} 상품 상세 화면 샘플입니다.`;
    return {
      product: {
        id: fallback.id,
        category: fallback.category,
        name: fallback.name,
        description,
        price: priceValue,
        shipping_fee: shippingFee,
        status: "published",
        sku_code: `SAMPLE-${fallback.id}`,
        stock_qty: fallback.stock_qty ?? 24,
        thumbnail_url: fallback.thumbnailUrl ?? null,
        review_count: Number(fallback.reviewCount ?? 0) || 0
      },
      media: fallback.thumbnailUrl ? [{ id: 1, file_url: fallback.thumbnailUrl, media_type: "image", sort_order: 1 }] : [],
      site_ready: {
        adult_only_label: "성인용품",
        illegal_goods_blocked: true,
        price_visible: true,
        purchase_button_visible: true,
        customer_center_visible: true,
        minimum_refund_window_days: 7
      },
      seller_contact: {
        name: sellerName,
        business_name: sellerName,
        business_registration_no: disclosedBusinessInfo.registrationNo,
        business_address: disclosedBusinessInfo.address,
        cs_contact: disclosedBusinessInfo.phone,
        return_address: disclosedBusinessInfo.address,
        support_email: disclosedBusinessInfo.email
      }
    };
  }, [shopCatalogItems, disclosedBusinessInfo]);
  const checkoutStepMeta = [
    { key: "cart", label: "장바구니" },
    { key: "order_form", label: "주문서 작성" },
    { key: "payment_request", label: "결제 요청" },
    { key: "payment_complete", label: "결제 완료" },
    { key: "order_confirm", label: "주문 확인" }
  ];
  const checkoutStageIndex = checkoutStepMeta.findIndex((item) => item.key === checkoutStage);
  const checkoutSelectedOrder = reactExports.useMemo(() => {
    if (!orders.length) return null;
    return (selectedOrderNo ? orders.find((item) => item.order_no === selectedOrderNo) : null) ?? [...orders].reverse()[0] ?? null;
  }, [orders, selectedOrderNo]);
  const showBaseTabContent = overlayMode === null;
  const blockedByIdentity = !isAdmin && !identityVerified;
  const requiresAdultGate = !isAdmin && !adultVerified && ["홈", "쇼핑"].includes(activeTab);
  const showAppTabContent = showBaseTabContent && !blockedByIdentity && !requiresAdultGate;
  const shouldForceAuthStandalone = authBootstrapDone && blockedByIdentity;
  reactExports.useEffect(() => {
    if (!(showAppTabContent && activeTab === "홈" && homeTab === "피드") || feedComposeOpen || openFeedCommentItem || selectedAskProfile) {
      setFeedComposeLauncherOpen(false);
    }
  }, [showAppTabContent, activeTab, homeTab, feedComposeOpen, openFeedCommentItem, selectedAskProfile]);
  reactExports.useEffect(() => {
    if (!(showAppTabContent && activeTab === "홈" && homeTab === "피드")) return;
    const stored = readHomeFeedPersistedState();
    const shouldReset = homeFeedResetOnNextShowRef.current || isHomeFeedStateExpired(stored);
    const nextVisibleCount = shouldReset ? HOME_FEED_BATCH_SIZE : Math.max(HOME_FEED_BATCH_SIZE, stored.visibleCount ?? HOME_FEED_BATCH_SIZE);
    if (nextVisibleCount !== homeFeedVisibleCount) {
      setHomeFeedVisibleCount(Math.min(nextVisibleCount, Math.max(activeHomeFeedItems.length, HOME_FEED_BATCH_SIZE)));
      return;
    }
    const rafId = window.requestAnimationFrame(() => {
      const node = homeFeedScrollRef.current;
      if (!node) return;
      const targetScrollTop = shouldReset ? 0 : Math.max(0, stored.scrollTop ?? 0);
      node.scrollTop = Math.min(targetScrollTop, Math.max(0, node.scrollHeight - node.clientHeight));
      lastHomeFeedScrollTopRef.current = node.scrollTop;
      homeFeedResetOnNextShowRef.current = false;
      if (shouldReset || node.scrollTop <= 8) {
        setHomeFeedHeaderHidden(false);
      }
      persistHomeFeedState({
        visibleCount: homeFeedVisibleCount,
        scrollTop: node.scrollTop,
        lastInactiveAt: shouldReset ? 0 : stored.lastInactiveAt ?? 0
      });
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [showAppTabContent, activeTab, homeTab, homeFeedVisibleCount, activeHomeFeedItems.length, persistHomeFeedState]);
  reactExports.useEffect(() => {
    if (!shouldForceAuthStandalone) return;
    setAuthStandaloneScreen("login");
    setAuthGatePopupOpen(true);
    setAuthMessage("로그인이 필요합니다. 청소년은 이용할 수 없습니다.");
  }, [shouldForceAuthStandalone]);
  const adultCooldownRemainMinutes = adultCooldownUntil > Date.now() ? Math.ceil((adultCooldownUntil - Date.now()) / 6e4) : 0;
  const signupConsentMeta = {
    terms: {
      title: "[필수] 이용약관 확인",
      summary: "서비스 이용 조건, 회원 의무, 금지 행위, 게시물 운영원칙, 주문/환불 기본 정책을 확인합니다.",
      body: [
        "회원은 성인 전용 서비스 정책과 커뮤니티 운영 원칙을 준수해야 합니다.",
        "불법 행위, 타인 권리 침해, 청소년 관련 위반, 결제 악용, 운영 방해 행위는 제한 대상입니다.",
        "주문·환불·제재·계정 제한과 관련된 기본 기준은 이용약관 및 운영정책에 따릅니다."
      ],
      href: `${getApiBase()}/legal/terms-of-service`
    },
    privacy: {
      title: "[필수] 개인정보 처리방침 확인",
      summary: "수집 항목, 이용 목적, 보관 기간, 제3자 제공 및 처리위탁 기준을 확인합니다.",
      body: [
        "회원 식별, 로그인 유지, 본인확인, 성인인증, 고객지원 및 법령상 의무 이행을 위해 필요한 정보를 처리합니다.",
        "법령상 보존이 필요한 정보는 해당 기간 동안 안전하게 보관될 수 있습니다.",
        "처리방침은 변경 시 공지되며, 필수 항목 변경 시 재동의가 요구될 수 있습니다."
      ],
      href: `${getApiBase()}/legal/privacy-policy`
    },
    adultNotice: {
      title: "[필수] 만 19세 이상 및 성인 서비스 이용 고지 확인",
      summary: "본 서비스는 만 19세 이상 성인만 이용할 수 있으며, 청소년은 이용할 수 없습니다.",
      body: [
        "회원가입 및 로그인은 만 19세 이상 본인확인 가능자만 진행할 수 있습니다.",
        "청소년 또는 비정상 인증으로 확인되는 경우 서비스 접근이 제한되거나 계정이 차단될 수 있습니다.",
        "성인 전용 영역은 별도 인증 절차 후에만 접근할 수 있습니다."
      ]
    },
    identityNotice: {
      title: "[필수] 본인확인/성인인증 결과 처리 안내 확인",
      summary: "본인확인 및 성인인증 결과는 계정 생성, 접근 권한 판단, 법적 의무 이행을 위해 처리됩니다.",
      body: [
        "인증 결과값은 회원 상태 판정, 청소년 차단, 성인 영역 접근 제어, 부정 이용 방지에 사용됩니다.",
        "인증 실패, 미완료, 불일치 상태에서는 회원가입 또는 일부 기능 이용이 제한될 수 있습니다.",
        "관련 법령과 내부 보안 기준에 따라 필요한 범위 내에서만 저장·처리됩니다."
      ]
    },
    marketing: {
      title: "[선택] 마케팅 정보 수신 동의",
      summary: "이벤트, 혜택, 프로모션, 신규 기능 안내를 수신할지 선택합니다.",
      body: [
        "선택 동의이며, 동의하지 않아도 기본 서비스 이용에는 영향이 없습니다.",
        "수신 채널과 항목은 운영정책에 따라 조정될 수 있습니다.",
        "언제든지 설정에서 수신 동의를 변경할 수 있습니다."
      ]
    },
    profileOptional: {
      title: "[선택] 맞춤 추천을 위한 프로필 정보 수집 동의",
      summary: "성별, 연령대, 지역, 관심 카테고리 등 선택 입력 정보를 추천 품질 향상에 활용할 수 있습니다.",
      body: [
        "선택 동의이며, 동의하지 않아도 기본 서비스 이용에는 영향이 없습니다.",
        "입력한 선택 정보는 맞춤 추천, 제한 영역 심사 참고, 운영 안전성 보조 정보로 사용될 수 있습니다.",
        "언제든지 프로필 또는 설정에서 변경할 수 있습니다."
      ]
    }
  };
  const openSignupConsentModal = (key) => {
    setSignupConsentModal(key);
  };
  const toggleSignupConsent = (key, checked) => {
    setSignupConsents((prev) => ({ ...prev, [key]: checked }));
    if (checked) {
      openSignupConsentModal(key);
    }
  };
  const requiredConsentAccepted = requiredConsentKeys.every((key) => signupConsents[key]);
  const reconsentRequired = Boolean((authSummary == null ? void 0 : authSummary.reconsent_required) || ((_b = authSummary == null ? void 0 : authSummary.consent_status) == null ? void 0 : _b.reconsent_required));
  const reconsentMode = (authSummary == null ? void 0 : authSummary.reconsent_enforcement_mode) ?? "limited_access";
  const reconsentWriteRestricted = !isAdmin && reconsentRequired && reconsentMode !== "login_block";
  const shouldShowHomeShopConsentGuide = !isAdmin && currentUserRole !== "GUEST" && ["홈", "쇼핑"].includes(activeTab) && !homeShopConsentGuideSeen;
  const signupAccountValid = Boolean(signupForm.email.trim() && signupForm.password.trim() && signupForm.displayName.trim() && identityVerified && identityVerificationToken);
  [!demoProfile.gender ? "성별" : null, !demoProfile.ageBand ? "연령대" : null, !demoProfile.regionCode ? "지역" : null].filter(Boolean);
  const sellerApprovalReady = isAdmin || sellerVerification.status === "approved";
  const openBusinessVerificationTab = () => setShoppingTab("사업자인증");
  const openProductRegistrationTab = () => setShoppingTab(isAdmin || sellerApprovalReady ? "상품등록" : "사업자인증");
  const sellerApplicationComplete = Boolean(
    sellerVerification.companyName.trim() && sellerVerification.representativeName.trim() && sellerVerification.businessNumber.trim() && sellerVerification.ecommerceNumber.trim() && sellerVerification.businessAddress.trim() && sellerVerification.csContact.trim() && sellerVerification.returnAddress.trim() && sellerVerification.youthProtectionOfficer.trim() && sellerVerification.businessDocumentUrl.trim() && sellerVerification.settlementBank.trim() && sellerVerification.settlementAccountNumber.trim() && sellerVerification.settlementAccountHolder.trim() && sellerVerification.handledCategories.trim()
  );
  const productDraftReady = Boolean(isProductCategorySelected && productRegistrationDraft.name.trim() && productRegistrationDraft.description.trim() && productRegistrationDraft.price.trim() && productRegistrationDraft.stockQty.trim() && productRegistrationDraft.skuCode.trim());
  const consentRecordsPreview = [
    { consent_type: "terms_of_service", agreed: signupConsents.terms, required: true, version: consentVersionMap.terms },
    { consent_type: "privacy_policy", agreed: signupConsents.privacy, required: true, version: consentVersionMap.privacy },
    { consent_type: "adult_service_notice", agreed: signupConsents.adultNotice, required: true, version: consentVersionMap.adultNotice },
    { consent_type: "identity_notice", agreed: signupConsents.identityNotice, required: true, version: consentVersionMap.identityNotice },
    { consent_type: "marketing_opt_in", agreed: signupConsents.marketing, required: false, version: consentVersionMap.marketing },
    { consent_type: "profile_optional_opt_in", agreed: signupConsents.profileOptional, required: false, version: consentVersionMap.profileOptional }
  ];
  const startIdentitySignup = async (provider) => {
    if (provider === "카카오") {
      setDemoLoginProvider("카카오");
      return;
    }
    try {
      const start = await postJson("/auth/identity/start", { provider });
      const confirm = await postJson("/auth/identity/confirm", { provider, tx_id: start.tx_id, verification_code: "000000" });
      setIdentityMethod(provider);
      setIdentityVerified(true);
      setIdentityVerificationToken(confirm.identity_verification_token);
    } catch {
      setIdentityMethod(provider);
      setIdentityVerified(true);
      setIdentityVerificationToken(`iv_${provider}_${Date.now()}`);
    }
    setAdultGateView("intro");
    if (["홈", "쇼핑"].includes(activeTab)) {
      setAdultPromptOpen(true);
    }
  };
  const advanceSignupStep = () => {
    if (signupStep === "consent") {
      if (!requiredConsentAccepted) {
        window.alert("필수 체크 항목을 체크 후 다음을 눌러주세요");
        return;
      }
      setSignupStep("account");
      return;
    }
    if (signupStep === "account") {
      if (!signupAccountValid) return;
      setSignupStep("profile");
    }
  };
  const completeSignupFlow = async (skipOptional = false) => {
    if (!requiredConsentAccepted || !signupAccountValid) return;
    const consentPayload = consentRecordsPreview.map((item) => ({ consent_type: item.consent_type, agreed: item.agreed, is_required: item.required, version: item.version }));
    try {
      const response = await postJson("/auth/signup", {
        email: signupForm.email,
        password: signupForm.password,
        name: signupForm.displayName,
        login_provider: signupForm.loginMethod === "카카오" ? "kakao" : "email",
        identity_verification_token: identityVerificationToken,
        identity_verification_method: identityMethod === "미완료" ? "휴대폰" : identityMethod,
        adult_verification_status: adultVerified ? "verified_adult" : "pending",
        consents: consentPayload
      });
      if (response.access_token) setAuthToken(response.access_token);
      if (response.refresh_token) setRefreshToken(response.refresh_token);
    } catch {
    }
    setIdentityVerified(true);
    setDemoLoginProvider(signupForm.loginMethod === "카카오" ? "카카오" : identityMethod === "미완료" ? "휴대폰" : identityMethod);
    setAdultGateView("intro");
    if (skipOptional) {
      setDemoProfile((prev) => ({ ...prev, marketingOptIn: signupConsents.marketing }));
    }
    setAuthEmail(signupForm.email);
    setAuthPassword(signupForm.password);
    setAuthMessage("회원가입 입력이 저장되었습니다. 로그인 화면에서 바로 로그인할 수 있습니다.");
    setHomeShopConsentGuideSeen(false);
    setAuthStandaloneScreen("login");
  };
  const toggleInterestCategory = (category) => {
    setDemoProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(category) ? prev.interests.filter((item) => item !== category) : [...prev.interests, category]
    }));
  };
  const submitSellerVerification = async () => {
    if (!sellerApplicationComplete) return;
    try {
      await postJson("/seller/verification/apply", {
        company_name: sellerVerification.companyName,
        representative_name: sellerVerification.representativeName,
        business_number: sellerVerification.businessNumber,
        ecommerce_number: sellerVerification.ecommerceNumber,
        business_address: sellerVerification.businessAddress,
        cs_contact: sellerVerification.csContact,
        return_address: sellerVerification.returnAddress,
        youth_protection_officer: sellerVerification.youthProtectionOfficer,
        settlement_bank: sellerVerification.settlementBank,
        settlement_account_number: sellerVerification.settlementAccountNumber,
        settlement_account_holder: sellerVerification.settlementAccountHolder,
        handled_categories: sellerVerification.handledCategories.split(",").map((item) => item.trim()).filter(Boolean),
        seller_contract_agreed: true,
        business_document_url: sellerVerification.businessDocumentUrl,
        approval_note: "사업자 인증 신청"
      });
    } catch {
    }
    setSellerVerification((prev) => ({ ...prev, status: "pending" }));
    setShoppingTab("사업자인증");
  };
  const submitProductRegistration = async (submitMode = "draft") => {
    if (!productDraftReady || !sellerApprovalReady || reconsentWriteRestricted || desktopProductCrudBusy) return;
    const payload = {
      id: desktopProductEditId ?? void 0,
      name: productRegistrationDraft.name,
      sku_code: productRegistrationDraft.skuCode,
      category: productRegistrationDraft.category,
      description: productRegistrationDraft.description,
      price: Number(productRegistrationDraft.price || "0"),
      stock_qty: Number(productRegistrationDraft.stockQty || "0"),
      image_urls: productRegistrationDraft.imageUrls.filter(Boolean),
      status: submitMode === "publish" ? "approved" : "draft",
      submit_mode: submitMode,
      payment_scope: "card_transfer",
      risk_grade: "A"
    };
    setDesktopProductCrudBusy(true);
    setDesktopProductCrudMessage("");
    try {
      const created = await postJson("/products", payload);
      getJson("/seller/products/mine").then(setSellerProducts).catch(() => null);
      getJson("/products").then(setApiProducts).catch(() => null);
      if (isAdmin) getJson("/admin/product-approvals").then((res) => setProductApprovalQueue(res.items ?? [])).catch(() => null);
      setOrderMessage(`${submitMode === "publish" ? desktopProductEditId ? "상품수정 반영" : "상품등록" : desktopProductEditId ? "상품수정 저장" : "상품 임시저장"} 완료: ${created.name} · ${created.status ?? "draft"}`);
      setDesktopProductCrudMessage(`${desktopProductEditId ? "상품 수정" : "상품 등록"}이 완료되었습니다.`);
      setSubmittedProducts((prev) => [productRegistrationDraft, ...prev]);
      setProductRegistrationDraft(createEmptyProductDraft());
      setDesktopProductEditId(null);
      setDesktopProductEditorOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : submitMode === "publish" ? "상품등록 실패" : "상품 임시저장 실패";
      setOrderMessage(message);
      setDesktopProductCrudMessage(message);
      return;
    } finally {
      setDesktopProductCrudBusy(false);
    }
  };
  const submitProductForReview = async (productId) => {
    setDesktopProductCrudBusy(true);
    setDesktopProductCrudMessage("");
    try {
      await postJson(`/products/${productId}/submit-review`, { note: "승인대기 제출" });
      getJson("/seller/products/mine").then(setSellerProducts).catch(() => null);
      if (isAdmin) getJson("/admin/product-approvals").then((res) => setProductApprovalQueue(res.items ?? [])).catch(() => null);
      setDesktopProductCrudMessage("승인대기 상태로 전환했습니다.");
    } catch (error) {
      setDesktopProductCrudMessage(error instanceof Error ? error.message : "승인대기 제출 실패");
    } finally {
      setDesktopProductCrudBusy(false);
    }
  };
  const adminDecideSeller = async (userId, decision) => {
    try {
      await postJson(`/admin/seller-approvals/${userId}/decision`, { decision, note: `관리자 ${decision}` });
      getJson("/admin/seller-approvals").then((res) => setSellerApprovalQueue(res.items ?? [])).catch(() => null);
    } catch {
    }
  };
  const adminDecideProduct = async (productId, decision) => {
    try {
      await postJson(`/admin/product-approvals/${productId}/decision`, { decision, note: `관리자 ${decision}` });
      getJson("/admin/product-approvals").then((res) => setProductApprovalQueue(res.items ?? [])).catch(() => null);
    } catch {
    }
  };
  const applyLoggedInUser = async () => {
    const me2 = await getJson("/auth/me");
    setAuthSummary(me2);
    const nextRole = String(me2.grade ?? "GUEST").toUpperCase();
    setCurrentUserRole(nextRole);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("adultapp_demo_role", nextRole);
    }
    setIdentityVerified(Boolean(me2.identity_verified));
    setAdultVerified(Boolean(me2.adult_verified));
    let nextOrders = [];
    try {
      nextOrders = await getJson("/orders");
      setOrders(nextOrders);
    } catch (error) {
      console.warn("orders_prefetch_failed_after_login", error);
      setOrders([]);
    }
    const firstOrderNo = nextOrders.length ? nextOrders[nextOrders.length - 1].order_no : "";
    setSelectedOrderNo(firstOrderNo);
    if (firstOrderNo) {
      try {
        const detail = await getJson(`/orders/${firstOrderNo}`);
        setOrderDetail(detail);
      } catch {
        setOrderDetail(null);
      }
    } else {
      setOrderDetail(null);
    }
    setAuthMessage(`${me2.email ?? "계정"} 로그인 완료 · 역할 ${nextRole}`);
  };
  const loginWithTestAccount = async (email, password) => {
    clearTokens();
    setAuthEmail(email);
    setAuthPassword(password);
    setAuthMessage(`테스트 계정으로 로그인 중: ${email}`);
    try {
      const response = await postJson("/auth/login", {
        email: email.trim(),
        password,
        device_name: "web-browser"
      });
      if (response.two_factor_required) {
        setAuthMessage("관리자 테스트 계정은 현재 2차 인증 없이 바로 로그인되도록 서버에서 비활성화하거나 계정을 재시드해야 합니다.");
        return;
      }
      setAuthToken(response.access_token);
      setRefreshToken(response.refresh_token);
      await applyLoggedInUser();
      setAuthStandaloneScreen(null);
      setActiveTab("홈");
      setShoppingTab("목록");
      setAdultGateView("success");
    } catch (error) {
      clearTokens();
      setAuthMessage(error instanceof Error ? error.message : "테스트 계정 로그인에 실패했습니다.");
    }
  };
  const loginWithCredentials = async () => {
    clearTokens();
    try {
      const response = await postJson("/auth/login", {
        email: authEmail.trim(),
        password: authPassword,
        device_name: "web-browser"
      });
      if (response.two_factor_required) {
        setAuthMessage("관리자 2차 인증이 필요한 계정입니다. 현재 테스트 화면에서는 2FA 완료 계정만 바로 로그인할 수 있습니다.");
        return;
      }
      setAuthToken(response.access_token);
      setRefreshToken(response.refresh_token);
      await applyLoggedInUser();
      setAuthStandaloneScreen(null);
      setActiveTab("홈");
      setShoppingTab("목록");
      setAdultGateView("success");
    } catch (error) {
      clearTokens();
      setAuthMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    }
  };
  const openProductDetail = async (productId) => {
    var _a2;
    setSelectedProductId(productId);
    setShoppingTab("상품");
    const fallbackDetail = buildFallbackProductDetail(productId);
    try {
      const detail = await getJson(`/products/${productId}`);
      setProductDetail({
        ...fallbackDetail ?? {},
        ...detail,
        product: {
          ...(fallbackDetail == null ? void 0 : fallbackDetail.product) ?? {},
          ...detail.product ?? {}
        },
        media: ((_a2 = detail.media) == null ? void 0 : _a2.length) ? detail.media : (fallbackDetail == null ? void 0 : fallbackDetail.media) ?? [],
        site_ready: {
          ...(fallbackDetail == null ? void 0 : fallbackDetail.site_ready) ?? {},
          ...detail.site_ready ?? {}
        },
        seller_contact: {
          ...(fallbackDetail == null ? void 0 : fallbackDetail.seller_contact) ?? {},
          ...detail.seller_contact ?? {}
        }
      });
      setOrderMessage("");
    } catch (error) {
      if (fallbackDetail) {
        setProductDetail(fallbackDetail);
        setOrderMessage("샘플 상품 상세 화면으로 표시 중입니다.");
        return;
      }
      setProductDetail(null);
      setOrderMessage(error instanceof Error ? error.message : "상품 상세 조회 실패");
    }
  };
  const verifyAdultSelf = async () => {
    try {
      const result = await postJson("/auth/adult/self-check", { birthdate: adultBirthdate, provider: "self_cert" });
      setAdultVerified(Boolean(result.adult_verified));
      const next = await getJson("/auth/adult/gate-status");
      setAdultGateStatus(next);
      setOrderMessage("성인 인증이 완료되었습니다. 쇼핑과 결제를 진행할 수 있습니다.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "성인 인증 실패";
      setOrderMessage(message);
      getJson("/auth/adult/gate-status").then(setAdultGateStatus).catch(() => null);
    }
  };
  const launchVerotelCheckout = async (orderNo) => {
    var _a2;
    const targetOrderNo = selectedOrderNo || ((_a2 = orderDetail == null ? void 0 : orderDetail.order) == null ? void 0 : _a2.order_no);
    if (!targetOrderNo) {
      setOrderMessage("먼저 주문을 생성하세요.");
      return;
    }
    try {
      const response = await postJson("/payments/verotel/start", { order_no: targetOrderNo, currency: "EUR" });
      const form = document.createElement("form");
      form.method = response.method || "POST";
      form.action = response.action_url || "";
      Object.entries(response.form_fields || {}).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      setOrderMessage(`중립 결제 페이지 이동 준비 완료: ${targetOrderNo}`);
      form.submit();
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "결제창 시작 실패");
    }
  };
  const addSelectedProductToCart = () => {
    const target = productDetail == null ? void 0 : productDetail.product;
    if (!target) {
      setOrderMessage("선택된 상품이 없습니다.");
      return;
    }
    setCartItems((prev) => {
      const found = prev.find((item) => item.productId === target.id);
      if (found) return prev.map((item) => item.productId === target.id ? { ...item, qty: item.qty + Math.max(1, productDetailQuantity) } : item);
      return [...prev, { productId: target.id, qty: Math.max(1, productDetailQuantity) }];
    });
    setCheckoutStage("cart");
    setOrderMessage(`${target.name} · ${Math.max(1, productDetailQuantity)}개가 장바구니에 담겼습니다.`);
  };
  const addToCart = (productId) => {
    setCartItems((prev) => {
      const found = prev.find((item) => item.productId === productId);
      if (found) return prev.map((item) => item.productId === productId ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { productId, qty: 1 }];
    });
    setCheckoutStage("cart");
    setShoppingTab("바구니");
  };
  const toggleProductCartFavorite = (productId) => {
    setCartItems((prev) => {
      const exists = prev.some((item) => item.productId === productId);
      if (exists) return prev.filter((item) => item.productId !== productId);
      return [...prev, { productId, qty: 1 }];
    });
    setCheckoutStage("cart");
  };
  const updateCartItemQuantity = (productId, delta) => {
    setCartItems((prev) => prev.flatMap((item) => {
      if (item.productId !== productId) return [item];
      const nextQty = Math.max(0, item.qty + delta);
      return nextQty > 0 ? [{ ...item, qty: nextQty }] : [];
    }));
  };
  const removeCartItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };
  const addProductToCartFromSearch = (productId) => {
    setCartItems((prev) => {
      const found = prev.find((item) => item.productId === productId);
      if (found) return prev.map((item) => item.productId === productId ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { productId, qty: 1 }];
    });
    setCheckoutStage("cart");
    showListEndToast("장바구니에 담았습니다.");
  };
  const cartDetailedItems = reactExports.useMemo(() => cartItems.map((item) => {
    const product = apiProducts.find((row) => row.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean), [cartItems, apiProducts]);
  const cartTotalAmount = reactExports.useMemo(() => cartDetailedItems.reduce((sum, item) => sum + Number(item.product.price || 0) * item.qty, 0), [cartDetailedItems]);
  const refreshOrders = async (preferredOrderNo) => {
    try {
      const nextOrders = await getJson("/orders");
      setOrders(nextOrders);
      const fallbackOrderNo = preferredOrderNo || selectedOrderNo || nextOrders.length ? nextOrders[nextOrders.length - 1].order_no : "";
      if (fallbackOrderNo) {
        setSelectedOrderNo(fallbackOrderNo);
        try {
          const detail = await getJson(`/orders/${fallbackOrderNo}`);
          setOrderDetail(detail);
        } catch {
          setOrderDetail(null);
        }
      } else {
        setOrderDetail(null);
      }
    } catch {
      return null;
    }
    return null;
  };
  const selectOrderForTesting = async (orderNo) => {
    setSelectedOrderNo(orderNo);
    try {
      const detail = await getJson(`/orders/${orderNo}`);
      setOrderDetail(detail);
      setCheckoutStage("order_confirm");
      setOrderMessage(`테스트 대상 주문 선택: ${orderNo}`);
    } catch (error) {
      setOrderDetail(null);
      setOrderMessage(error instanceof Error ? error.message : "주문 상세 조회 실패");
    }
  };
  const createOrderForSelectedProduct = async () => {
    const target = productDetail == null ? void 0 : productDetail.product;
    if (!target) {
      setOrderMessage("선택된 상품이 없습니다.");
      return;
    }
    try {
      const created = await postJson("/orders", {
        product_id: target.id,
        qty: Math.max(1, productDetailQuantity),
        payment_method: "card",
        payment_pg: "verotel"
      });
      setSelectedOrderNo(created.order_no);
      setCheckoutStage("payment_request");
      setOrderMessage(`상품 주문 생성 완료: ${created.order_no} · ${created.total_amount.toLocaleString()}원`);
      await refreshOrders(created.order_no);
      setShoppingTab("주문");
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "상품 주문 생성 실패");
    }
  };
  const createOrderFromCart = async () => {
    var _a2;
    const first = cartDetailedItems[0];
    if (!first) {
      setOrderMessage("바구니가 비어 있습니다.");
      return;
    }
    try {
      const created = await postJson("/orders", {
        product_id: first.product.id,
        qty: first.qty,
        payment_method: "card",
        payment_pg: "demo-pg"
      });
      setCheckoutStage("payment_request");
      setOrderMessage(`주문 생성 완료: ${created.order_no} · ${created.total_amount.toLocaleString()}원 · mode ${((_a2 = created.payment_init) == null ? void 0 : _a2.mode) ?? "-"}`);
      await refreshOrders(created.order_no);
      setShoppingTab("주문");
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "주문 생성 실패");
    }
  };
  const confirmSelectedOrder = async () => {
    const target = [...orders].reverse().find((item) => item.status === "payment_pending") ?? orders[orders.length - 1];
    if (!target) {
      setOrderMessage("확인할 주문이 없습니다.");
      return;
    }
    try {
      const result = await postJson("/payments/confirm", {
        order_no: target.order_no,
        payment_id: `pay_${Date.now()}`,
        status: "Paid",
        amount: target.total_amount,
        provider: "tosspayments",
        method: "card"
      });
      setCheckoutStage("payment_complete");
      setOrderMessage(`결제 승인 완료: ${target.order_no} → ${result.status}`);
      await refreshOrders(target.order_no);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "결제 승인 실패");
    }
  };
  const cancelSelectedOrder = async (partial = false) => {
    var _a2;
    const target = (selectedOrderNo ? orders.find((item) => item.order_no === selectedOrderNo) : null) ?? [...orders].reverse().find((item) => ["paid", "partial_cancelled"].includes(item.status));
    if (!target) {
      setOrderMessage("취소할 결제완료 주문이 없습니다.");
      return;
    }
    const remaining = Number(((_a2 = target.amount_snapshot) == null ? void 0 : _a2.remaining) ?? target.total_amount ?? 0);
    if (remaining <= 0) {
      setOrderMessage(`취소 가능한 잔액이 없습니다: ${target.order_no}`);
      return;
    }
    try {
      const requestedAmount = partial ? Number(orderActionAmount || "0") : remaining;
      const amount = Math.min(requestedAmount, remaining);
      const result = await postJson(`/payments/orders/${target.order_no}/cancel`, {
        amount,
        reason: partial ? "부분취소 테스트" : "전체취소 테스트",
        idempotency_key: `cancel_${partial ? "partial" : "full"}_${Date.now()}`
      });
      setOrderMessage(`취소 완료: ${target.order_no} · ${result.cancel_amount.toLocaleString()}원 · ${result.status}`);
      await refreshOrders(target.order_no);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "취소 실패");
    }
  };
  const refundSelectedOrder = async (partial = false) => {
    var _a2;
    const target = (selectedOrderNo ? orders.find((item) => item.order_no === selectedOrderNo) : null) ?? [...orders].reverse().find((item) => ["paid", "partial_cancelled"].includes(item.status));
    if (!target) {
      setOrderMessage("환불할 결제완료 주문이 없습니다.");
      return;
    }
    const remaining = Number(((_a2 = target.amount_snapshot) == null ? void 0 : _a2.remaining) ?? target.total_amount ?? 0);
    if (remaining <= 0) {
      setOrderMessage(`환불 가능한 잔액이 없습니다: ${target.order_no}`);
      return;
    }
    try {
      const requestedAmount = partial ? Number(orderActionAmount || "0") : remaining;
      const amount = Math.min(requestedAmount, remaining);
      const result = await postJson(`/payments/orders/${target.order_no}/refund`, {
        amount,
        reason: partial ? "부분환불 테스트" : "전체환불 테스트",
        idempotency_key: `refund_${partial ? "partial" : "full"}_${Date.now()}`
      });
      setOrderMessage(`환불 완료: ${target.order_no} · ${result.refund_amount.toLocaleString()}원 · ${result.status}`);
      await refreshOrders(target.order_no);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "환불 실패");
    }
  };
  const runWebhookSignatureTest = async () => {
    try {
      const result = await postJson("/payments/webhooks/test-signature", { event_type: "Transaction.Paid", data: { paymentId: `pay_${Date.now()}` }, mode: "test" });
      setOrderMessage(`webhook 서명 점검 호출 완료 · verified=${String(result.verified)} · mode=${result.mode}`);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "webhook 점검 실패");
    }
  };
  const attemptAdultVerification = async (mode) => {
    if (adultCooldownUntil > Date.now()) {
      setAdultGateView("failed");
      return;
    }
    if (mode === "minor") {
      setAdultVerified(false);
      setAdultGateView("minor");
      return;
    }
    try {
      const start = await postJson("/auth/adult/start", { provider: identityMethod === "미완료" ? "PASS" : identityMethod });
      const result = await postJson("/auth/adult/confirm", { tx_id: start.tx_id, verification_code: mode === "success" ? "000000" : "111111" });
      setAdultVerified(Boolean(result.adult_verified));
      setAdultFailCount(result.adult_verification_fail_count ?? 0);
      setAdultCooldownUntil(result.adult_verification_locked_until ? new Date(result.adult_verification_locked_until).getTime() : 0);
      setAdultGateView(result.adult_verified ? "success" : "failed");
      setAdultPromptOpen(!result.adult_verified);
      if (result.adult_verified) return;
    } catch {
    }
    if (mode === "success") {
      setAdultVerified(true);
      setAdultFailCount(0);
      setAdultCooldownUntil(0);
      setAdultGateView("success");
      setAdultPromptOpen(false);
      return;
    }
    const nextFail = adultFailCount + 1;
    setAdultFailCount(nextFail);
    setAdultGateView("failed");
    if (nextFail >= 5) {
      setAdultCooldownUntil(Date.now() + 60 * 60 * 1e3);
    }
  };
  reactExports.useEffect(() => {
    if (!requiresAdultGate) {
      setAdultPromptOpen(false);
      return;
    }
    setAdultPromptOpen(true);
  }, [requiresAdultGate, activeTab]);
  const currentScreenTitle = overlayMode === "search" ? `${activeTab}검색` : overlayMode === "settings" ? `${activeTab}설정` : overlayMode === "notifications" ? `${activeTab}알림` : activeTab;
  const openOverlay = (mode) => {
    setOverlayMode((prev) => prev === mode ? null : mode);
    setRoomModalOpen(false);
    if (mode === "search") setSearchFilter("전체");
  };
  reactExports.useEffect(() => {
    setSearchSection(searchSectionsByTab[activeTab][0]);
  }, [activeTab]);
  reactExports.useEffect(() => {
    if (overlayMode === "search") {
      setSearchSection(searchSectionsByTab[activeTab][0]);
    }
    if (overlayMode === "notifications") {
      setNotificationView({ view: "list", section: null, item: null });
    }
  }, [overlayMode, activeTab]);
  reactExports.useEffect(() => {
    if (!htmlInspectorEnabled) return void 0;
    const handleCtrlClick = (event) => {
      if (!event.ctrlKey || event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest(".html-inspector-modal") || target.closest(".settings-category-nav")) return;
      event.preventDefault();
      event.stopPropagation();
      if (inspectedTargetRef.current) {
        inspectedTargetRef.current.classList.remove("html-inspector-target");
      }
      target.classList.add("html-inspector-target");
      inspectedTargetRef.current = target;
      const textContent = (target.innerText || target.textContent || "").trim().replace(/\s+/g, " ").slice(0, 300);
      const html = target.outerHTML.slice(0, 5e3);
      setInspectedElement({
        selector: buildElementSelector(target),
        tagName: target.tagName.toLowerCase(),
        id: target.id || "-",
        className: target.className || "-",
        text: textContent || "-",
        html,
        cssText: buildElementCssText(target),
        modalStyle: buildInspectorModalStyle(target)
      });
    };
    document.addEventListener("click", handleCtrlClick, true);
    return () => document.removeEventListener("click", handleCtrlClick, true);
  }, [htmlInspectorEnabled]);
  const handleChatListScroll = reactExports.useCallback((event) => {
    const target = event.currentTarget;
    const remain = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (remain <= 120) {
      setChatVisibleCount((prev) => Math.min(prev + 10, filteredThreads.length));
    }
  }, [filteredThreads.length]);
  const openForumRoom = reactExports.useCallback((room) => {
    setActiveForumRoomId(room.id);
    setForumRoomMessages((prev) => {
      if (prev[room.id]) return prev;
      return {
        ...prev,
        [room.id]: [
          { id: room.id * 100 + 1, author: "포럼 안내", text: forumRoomNoticeText, meta: "입장 안내", kind: "system" },
          { id: room.id * 100 + 2, author: room.starter, text: room.introMessage, meta: room.latestAt, kind: "member" }
        ]
      };
    });
  }, []);
  const closeForumRoom = reactExports.useCallback(() => {
    setActiveForumRoomId(null);
  }, []);
  const openAskFromFeed = (item) => {
    const matched = askProfiles.find((profile) => profile.name.toLowerCase() === item.author.toLowerCase()) ?? askProfiles[0];
    setSelectedAskProfile(matched);
  };
  const createRandomRoom = () => {
    if (!adultVerified) {
      window.alert("성인인증 완료 회원만 단체 톡방을 개설할 수 있습니다.");
      setAdultPromptOpen(true);
      return;
    }
    if (groupRoomSuspendedUntil > Date.now()) {
      window.alert(`현재 계정은 신고/제재 반영으로 ${new Date(groupRoomSuspendedUntil).toLocaleString()}까지 단체 톡방 개설이 제한됩니다.`);
      return;
    }
    const parsedMax = Math.max(2, Math.min(20, Number(newRoomMaxPeople) || 8));
    const safeTitle = newRoomTitle.trim() || `${newRoomCategory} 채팅방`;
    const nextRoom = {
      id: Date.now(),
      category: newRoomCategory,
      maxPeople: parsedMax,
      currentPeople: 1,
      password: newRoomPassword,
      title: safeTitle,
      anonymous: newRoomAnonymous,
      latestMessage: newRoomAnonymous ? "익명으로 생성된 방입니다. 가이드를 확인하고 입장하세요." : "새로 개설된 방입니다. 첫 대화를 시작해보세요.",
      kind: "group",
      expiresAt: Date.now() + 60 * 60 * 1e3
    };
    setRandomRooms((prev) => [nextRoom, ...prev]);
    setRandomRoomCategory("전체");
    setNewRoomCategory("관계역할/고민");
    setNewRoomTitle("");
    setNewRoomAnonymous(true);
    setNewRoomMaxPeople("8");
    setNewRoomPassword("");
    setRoomModalOpen(false);
  };
  const currentTabMenuItems = reactExports.useMemo(() => {
    if (activeTab === "홈") {
      return homeTabs.map((tab) => ({ label: tab, active: homeTab === tab, onClick: () => setHomeTab(tab) }));
    }
    if (activeTab === "쇼핑") {
      return [
        { label: "홈", active: shoppingTab === "홈", onClick: () => setShoppingTab("홈") },
        { label: "주문", active: shoppingTab === "주문", onClick: () => setShoppingTab("주문") },
        { label: "바구니", active: shoppingTab === "바구니", onClick: () => setShoppingTab("바구니") }
      ];
    }
    if (activeTab === "소통") {
      return communityTabs.map((tab) => ({ label: tab, active: communityTab === tab, onClick: () => setCommunityTab(tab) }));
    }
    if (activeTab === "채팅") {
      return chatTabs.map((tab) => ({ label: chatTabLabels[tab], active: chatTab === tab, onClick: () => setChatTab(tab) }));
    }
    return profileTabs.map((tab) => ({ label: tab, active: profileTab === tab, onClick: () => setProfileTab(tab) }));
  }, [activeTab, homeTab, shoppingTab, communityTab, chatTab, profileTab]);
  const favoriteCandidates = reactExports.useMemo(() => currentTabMenuItems.map((item) => item.label), [currentTabMenuItems]);
  const headerNavItems = reactExports.useMemo(() => {
    const favoriteLabels = headerFavorites[activeTab] ?? [];
    const itemsByLabel = new Map(currentTabMenuItems.map((item) => [item.label, item]));
    const orderedFavorites = favoriteLabels.map((label) => itemsByLabel.get(label)).filter((item) => Boolean(item));
    const fallbackItems = currentTabMenuItems.filter((item) => !favoriteLabels.includes(item.label));
    return [...orderedFavorites, ...fallbackItems].slice(0, Math.max(1, orderedFavorites.length || 0));
  }, [activeTab, currentTabMenuItems, headerFavorites]);
  const toggleHeaderFavorite = (label) => {
    setHeaderFavorites((prev) => {
      const current = prev[activeTab] ?? [];
      const next = current.includes(label) ? current.filter((item) => item !== label) : [...current, label];
      return {
        ...prev,
        [activeTab]: next.length ? next : [label]
      };
    });
  };
  const resetHeaderFavorites = () => {
    setHeaderFavorites((prev) => ({ ...prev, [activeTab]: defaultHeaderFavorites[activeTab] }));
  };
  const openNotificationDetail = reactExports.useCallback((sectionKey, item) => {
    setNotificationItems((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, unread: false } : entry));
    setNotificationView({ view: "detail", section: sectionKey, item: { ...item, unread: false } });
  }, []);
  const openNotificationSection = reactExports.useCallback((sectionKey) => {
    setNotificationSectionPage(1);
    setNotificationView({ view: "section", section: sectionKey, item: null });
  }, []);
  const settingsNavItems = reactExports.useMemo(() => settingsCategories.filter((item) => ["운영", "관리자모드", "DB관리", "신고", "채팅", "기타"].includes(item) ? isAdmin : true), [isAdmin]);
  const isAnyShortsViewerOpen = shortsViewerItemId !== null || savedShortsViewerItemId !== null;
  const visibleHeaderNavItems = overlayMode === null ? headerNavItems : [];
  const currentMenuItems = (activeTab === "홈" ? homeMenuItems : currentTabMenuItems.map((item) => ({ label: item.label, onClick: item.onClick }))).map((item) => ({ label: item.label, onClick: () => {
    var _a2;
    (_a2 = item.onClick) == null ? void 0 : _a2.call(item);
    setOverlayMode(null);
  } }));
  const notificationSections = reactExports.useMemo(() => ({
    notices: notificationItems.filter((item) => item.section === "공지"),
    orders: notificationItems.filter((item) => item.section === "주문"),
    community: notificationItems.filter((item) => item.section === "소통"),
    events: notificationItems.filter((item) => item.section === "이벤트")
  }), [notificationItems]);
  const notificationSectionMeta = {
    notices: { title: "앱 공지사항", shortTitle: "공지" },
    events: { title: "이벤트", shortTitle: "이벤트" },
    orders: { title: "쇼핑주문·배송 알림", shortTitle: "쇼핑" },
    community: { title: "소통·채팅·질문·기타 알림", shortTitle: "기타" }
  };
  const notificationSectionOrder = ["notices", "orders", "community", "events"];
  const unreadNotificationCount = reactExports.useMemo(() => notificationItems.filter((item) => item.unread).length, [notificationItems]);
  const activeNotificationSectionItems = reactExports.useMemo(() => {
    if (!notificationView.section) return [];
    return notificationSections[notificationView.section];
  }, [notificationSections, notificationView.section]);
  const notificationSectionTotalPages = reactExports.useMemo(() => {
    if (!notificationView.section) return 1;
    return Math.max(1, Math.ceil(activeNotificationSectionItems.length / notificationSectionPageSize));
  }, [activeNotificationSectionItems.length, notificationSectionPageSize, notificationView.section]);
  const visibleNotificationSectionItems = reactExports.useMemo(() => {
    if (!notificationView.section) return [];
    const start = (notificationSectionPage - 1) * notificationSectionPageSize;
    return activeNotificationSectionItems.slice(start, start + notificationSectionPageSize);
  }, [activeNotificationSectionItems, notificationSectionPage, notificationSectionPageSize, notificationView.section]);
  reactExports.useEffect(() => {
    setNotificationSectionPage((prev) => Math.min(prev, notificationSectionTotalPages));
  }, [notificationSectionTotalPages]);
  const searchSectionsByTab = {
    홈: ["피드결과", "쇼츠결과", "보관함결과"],
    쇼핑: ["홈"],
    소통: ["커뮤", "포럼", "후기"],
    채팅: ["채팅", "질문"],
    프로필: ["내정보"]
  };
  const currentSearchSections = searchSectionsByTab[activeTab];
  const getNotificationChipTone = (sectionKey) => sectionKey === "orders" ? "order" : sectionKey === "community" ? "community" : sectionKey === "events" ? "event" : "";
  const notificationDetailAuthor = ((_c = notificationView.item) == null ? void 0 : _c.author) || ((_d = notificationView.item) == null ? void 0 : _d.meta) || "운영팀";
  const homeShortSearchResults = reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return recommendedShorts.filter((item) => `${item.title} ${item.caption} ${item.author} ${item.category}`.toLowerCase().includes(keyword));
  }, [globalKeyword, recommendedShorts]);
  const homeSavedSearchResults = reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    const savedFeed = savedFeedItems.filter((item) => `${item.title} ${item.caption} ${item.author} ${item.category}`.toLowerCase().includes(keyword)).map((item) => ({ id: `feed-${item.id}`, title: item.title, summary: item.caption, meta: `피드 · ${item.author}` }));
    const savedShorts = savedShortItems.filter((item) => `${item.title} ${item.caption} ${item.author} ${item.category}`.toLowerCase().includes(keyword)).map((item) => ({ id: `short-${item.id}`, title: item.title, summary: item.caption, meta: `쇼츠 · ${item.author}` }));
    return [...savedFeed, ...savedShorts];
  }, [globalKeyword, savedFeedItems, savedShortItems]);
  const communicationOverlayResults = reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return communitySeed.filter((item) => {
      const boardMatch = searchSection === "커뮤" ? item.board === "커뮤" || !item.board : item.board === searchSection;
      const primaryMatch = communityPrimaryFilter === "전체" || item.audience === communityPrimaryFilter;
      const keywordMatch = `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(keyword);
      return boardMatch && primaryMatch && keywordMatch;
    });
  }, [globalKeyword, searchSection, communityPrimaryFilter]);
  const questionSearchResults = reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return questionSeed.filter((item) => `${item.author} ${item.question} ${item.answer}`.toLowerCase().includes(keyword));
  }, [globalKeyword]);
  const selectBottomTab = (tab) => {
    if (tab === activeTab && overlayMode === null && !roomModalOpen && !selectedAskProfile && !openFeedCommentItem && !feedComposeOpen && !feedComposeLauncherOpen) {
      if (tab === "쇼핑" && shoppingTab !== "홈") {
        setProductDetail(null);
        setSelectedProductId(null);
        setShoppingTab("홈");
      }
      return;
    }
    setSelectedAskProfile(null);
    setOpenFeedCommentItem(null);
    setFeedComposeOpen(false);
    setFeedComposeLauncherOpen(false);
    setActiveTab(tab);
    if (tab === "홈") setHomeTab((prev) => prev || "피드");
    if (tab === "프로필") {
      setViewedProfileAuthor(null);
      setProfileSection("게시물");
    }
    if (overlayMode !== null) setOverlayMode(null);
    if (roomModalOpen) setRoomModalOpen(false);
    if (activeTab === "채팅" && tab !== "채팅") {
      setRandomSettingsOpen(false);
      setMatchingRandom(false);
      setMatchedRandomUser(null);
      setRandomMatchPhase("idle");
      setRandomMatchNote("카테고리를 고른 뒤 익명 정보교류용 텍스트 채팅을 시작할 수 있습니다. 외부연락, 사람 찾기, 만남유도, 사진/영상 교환은 금지됩니다.");
    }
  };
  reactExports.useEffect(() => {
    if (activeTab !== "쇼핑" || overlayMode !== "search") return;
    setShopSearchVisibleCount(12);
  }, [activeTab, overlayMode, globalKeyword, searchFilter, shopSearchPriceMin, shopSearchPriceMax, shopSearchColor, shopSearchPurpose]);
  reactExports.useEffect(() => {
    if (overlayMode === "search" && activeTab === "쇼핑") return;
    setShopSearchFilterPanelOpen(false);
  }, [overlayMode, activeTab]);
  const handleShopSearchResultsScroll = (event) => {
    if (activeTab !== "쇼핑") return;
    const target = event.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 180) {
      setShopSearchVisibleCount((prev) => Math.min(prev + 12, shopSearchResults.length));
    }
  };
  const openShopSearchFilterPanel = () => {
    if (activeTab !== "쇼핑") return;
    setShopSearchFilterPanelOpen((prev) => !prev);
  };
  const closeShopSearchFilterPanel = () => {
    setShopSearchFilterPanelOpen(false);
  };
  const resetShopSearchFilters = () => {
    setSearchFilter("전체");
    setShopSearchPriceMin("");
    setShopSearchPriceMax("");
    setShopSearchColor("전체");
    setShopSearchPurpose("전체");
  };
  const profileSearchResults = reactExports.useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return allFeedItems.filter((item) => {
      if (searchFilter === "아이디") return item.author.toLowerCase().includes(keyword);
      if (searchFilter === "피드") return `${item.title} ${item.caption}`.toLowerCase().includes(keyword);
      return `${item.author} ${item.title} ${item.caption}`.toLowerCase().includes(keyword);
    });
  }, [globalKeyword, searchFilter]);
  if (!authBootstrapDone) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-standalone-shell", children: /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "auth-standalone-main", children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "auth-standalone-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-standalone-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "세션 확인 중" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "저장된 로그인 정보를 먼저 확인하고 있습니다." })
    ] }) }) }) }) });
  }
  if (authStandaloneScreen) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-standalone-shell", children: [
      authGatePopupOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-backdrop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-card adult-auth-modal", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "로그인 필요" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-btn", onClick: () => setAuthGatePopupOpen(false), children: "닫기" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "로그인 후 이용할 수 있습니다." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "청소년은 회원가입 및 로그인할 수 없습니다." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "본인확인 결과에 따라 서비스 접속이 제한될 수 있습니다." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAuthGatePopupOpen(false), children: "확인" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => {
              setAuthGatePopupOpen(false);
              setSignupStep("consent");
              setAuthStandaloneScreen("signup");
            }, children: "회원가입" })
          ] })
        ] })
      ] }) }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "auth-standalone-main", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "auth-standalone-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `auth-standalone-head ${authStandaloneScreen === "signup" ? "auth-standalone-head--signup" : ""}`, children: authStandaloneScreen === "signup" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-standalone-headbar", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "header-inline-btn header-icon-btn auth-back-icon-btn",
              onClick: () => setAuthStandaloneScreen("login"),
              "aria-label": "뒤로가기",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {})
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "회원가입" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "auth-standalone-headbar-spacer", "aria-hidden": "true" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "로그인" }) }) }),
        authStandaloneScreen === "login" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-standalone-body stack-gap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "signup-form-grid auth-login-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "이메일" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: authEmail, onChange: (e) => setAuthEmail(e.target.value), placeholder: "customer@example.com" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "비밀번호" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: authPassword, onChange: (e) => setAuthPassword(e.target.value), placeholder: "비밀번호 입력" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: loginWithCredentials, children: "로그인" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => {
              setSignupStep("consent");
              setAuthStandaloneScreen("signup");
            }, children: "회원가입" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact auth-summary-box", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "테스트 계정" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chip-checklist auth-account-chiplist", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "chip-check", onClick: () => loginWithTestAccount("customer@example.com", "customer1234"), children: "회원" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "chip-check", onClick: () => loginWithTestAccount("admin@example.com", "admin1234"), children: "관리자" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "chip-check", onClick: () => loginWithTestAccount("seller@example.com", "seller1234"), children: "판매자" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "chip-check", onClick: () => loginWithTestAccount("general@example.com", "general1234"), children: "일반회원" })
            ] }),
            authMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: authMessage }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "테스트 계정을 누르면 바로 로그인합니다." })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-standalone-body stack-gap signup-screen-body", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "signup-step-strip signup-step-strip-mobile", children: [
            ["consent", "1단계 법정 문서 확인"],
            ["account", "2단계 가입 입력"],
            ["profile", "3단계 선택 정보 입력"]
          ].map(([step, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `signup-step-btn ${signupStep === step ? "active" : ""}`, onClick: () => {
            if (step === "consent") {
              setSignupStep("consent");
              return;
            }
            if (step === "account" && requiredConsentAccepted) {
              setSignupStep("account");
              return;
            }
            if (step === "profile" && signupAccountValid) {
              setSignupStep("profile");
            }
          }, children: label }, step)) }),
          signupStep === "consent" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap signup-step-panel signup-step-panel-consent", children: [
            signupConsentModal ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-backdrop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-card signup-consent-modal", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: signupConsentMeta[signupConsentModal].title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setSignupConsentModal(null), children: "닫기" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact signup-consent-modal-copy", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: signupConsentMeta[signupConsentModal].summary }),
                  signupConsentMeta[signupConsentModal].body.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item }, item))
                ] }),
                signupConsentMeta[signupConsentModal].href ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact signup-consent-modal-frame", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "iframe",
                  {
                    title: signupConsentMeta[signupConsentModal].title,
                    src: signupConsentMeta[signupConsentModal].href,
                    className: "signup-consent-iframe"
                  }
                ) }) : null,
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "copy-action-row signup-consent-modal-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSignupConsentModal(null), children: "확인" }) })
              ] })
            ] }) }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact signup-legal-copy signup-panel", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "약관 안내" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "consent-checklist signup-consent-checklist", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `consent-row ${signupConsents.terms ? "checked" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: signupConsents.terms, onChange: (e) => toggleSignupConsent("terms", e.target.checked) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "button", tabIndex: 0, onClick: () => openSignupConsentModal("terms"), onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openSignupConsentModal("terms");
                  }
                }, children: "[필수] 이용약관 확인" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `consent-row ${signupConsents.privacy ? "checked" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: signupConsents.privacy, onChange: (e) => toggleSignupConsent("privacy", e.target.checked) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "button", tabIndex: 0, onClick: () => openSignupConsentModal("privacy"), onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openSignupConsentModal("privacy");
                  }
                }, children: "[필수] 개인정보 처리방침 확인" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `consent-row ${signupConsents.adultNotice ? "checked" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: signupConsents.adultNotice, onChange: (e) => toggleSignupConsent("adultNotice", e.target.checked) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "button", tabIndex: 0, onClick: () => openSignupConsentModal("adultNotice"), onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openSignupConsentModal("adultNotice");
                  }
                }, children: "[필수] 만 19세 이상 및 성인 서비스 이용 고지 확인" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `consent-row ${signupConsents.identityNotice ? "checked" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: signupConsents.identityNotice, onChange: (e) => toggleSignupConsent("identityNotice", e.target.checked) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "button", tabIndex: 0, onClick: () => openSignupConsentModal("identityNotice"), onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openSignupConsentModal("identityNotice");
                  }
                }, children: "[필수] 본인확인/성인인증 결과 처리 안내 확인" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `consent-row ${signupConsents.marketing ? "checked" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: signupConsents.marketing, onChange: (e) => toggleSignupConsent("marketing", e.target.checked) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "button", tabIndex: 0, onClick: () => openSignupConsentModal("marketing"), onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openSignupConsentModal("marketing");
                  }
                }, children: "[선택] 마케팅 정보 수신 동의" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `consent-row ${signupConsents.profileOptional ? "checked" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: signupConsents.profileOptional, onChange: (e) => toggleSignupConsent("profileOptional", e.target.checked) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "button", tabIndex: 0, onClick: () => openSignupConsentModal("profileOptional"), onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openSignupConsentModal("profileOptional");
                  }
                }, children: "[선택] 맞춤 추천을 위한 프로필 정보 수집 동의" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "copy-action-row signup-action-row signup-action-row--single", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: advanceSignupStep, children: "다음" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legal-disclosure-card compact", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "사업자 정보 및 고객센터" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "문의 이메일: ",
                disclosedBusinessInfo.email
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "상호명: ",
                disclosedBusinessInfo.operatorName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "대표자: ",
                disclosedBusinessInfo.representative
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "사업자번호: ",
                disclosedBusinessInfo.registrationNo
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "연락처: ",
                disclosedBusinessInfo.phone
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "주소: ",
                disclosedBusinessInfo.address
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "notification-policy-links legal-link-row", children: legalQuickLinks.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "ghost-link-btn", href: item.href, target: "_blank", rel: "noreferrer", children: item.label }, item.key)) })
            ] })
          ] }) : null,
          signupStep === "account" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap signup-step-panel signup-step-panel-account", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "signup-form-grid signup-form-grid--account", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "로그인 수단" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: signupForm.loginMethod, onChange: (e) => setSignupForm((prev) => ({ ...prev, loginMethod: e.target.value })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "이메일", children: "이메일" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "카카오", children: "카카오" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "이메일" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: signupForm.email, onChange: (e) => setSignupForm((prev) => ({ ...prev, email: e.target.value })), placeholder: "you@example.com" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "비밀번호" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: signupForm.password, onChange: (e) => setSignupForm((prev) => ({ ...prev, password: e.target.value })), placeholder: "비밀번호 입력" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "표시 이름" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: signupForm.displayName, onChange: (e) => setSignupForm((prev) => ({ ...prev, displayName: e.target.value })), placeholder: "앱에서 보일 이름" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wide", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "휴대폰 본인확인 결과 토큰" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: identityVerificationToken, readOnly: true, placeholder: "PASS/휴대폰 본인확인 완료 시 서버 토큰이 자동 입력됩니다" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "성인인증 상태" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: adultVerified ? "완료" : "가입 후 홈/쇼핑 진입 시 1회 추가 인증", readOnly: true })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-grid three auth-option-grid signup-auth-option-grid", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "PASS 인증" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "PASS 기반 본인확인 흐름을 테스트합니다." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => startIdentitySignup("PASS"), children: "PASS 인증 완료 처리" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "휴대폰 인증" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "휴대폰 인증 흐름을 테스트합니다." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => startIdentitySignup("휴대폰"), children: "휴대폰 인증 완료 처리" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "카카오 로그인" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "카카오는 로그인 편의 수단으로만 사용합니다." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setDemoLoginProvider("카카오"), children: "카카오 로그인 방식 선택" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row signup-action-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setSignupStep("consent"), children: "이전" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: advanceSignupStep, disabled: !signupAccountValid, children: "다음" })
            ] })
          ] }) : null,
          signupStep === "profile" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap signup-step-panel signup-step-panel-profile", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "signup-form-grid profile-edit-grid signup-form-grid--profile", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "성별" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: demoProfile.gender, onChange: (e) => setDemoProfile((prev) => ({ ...prev, gender: e.target.value })), children: profileGenderOptions.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item, children: item || "선택 안 함" }, item || "blank")) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "연령대" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: demoProfile.ageBand, onChange: (e) => setDemoProfile((prev) => ({ ...prev, ageBand: e.target.value })), children: profileAgeBandOptions.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item, children: item || "선택 안 함" }, item || "blank")) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "지역" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: demoProfile.regionCode, onChange: (e) => setDemoProfile((prev) => ({ ...prev, regionCode: e.target.value })), children: profileRegionOptions.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item, children: item || "선택 안 함" }, item || "blank")) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wide", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "관심 카테고리" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chip-checklist", children: interestCategoryOptions.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `chip-check ${demoProfile.interests.includes(item) ? "active" : ""}`, onClick: () => toggleInterestCategory(item), children: item }, item)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row signup-action-row signup-action-row--triple", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setSignupStep("account"), children: "이전" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => completeSignupFlow(true), children: "선택 정보 없이 가입 완료" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => completeSignupFlow(false), children: "회원가입 완료" })
            ] })
          ] }) : null
        ] })
      ] }) })
    ] });
  }
  const loadDesktopProductForEdit = async (productId) => {
    setDesktopProductCrudBusy(true);
    setDesktopProductCrudMessage("");
    try {
      const detail = await getJson(`/products/${productId}`);
      const product = detail.product;
      const imageUrls = [...(detail.media ?? []).map((item) => item.file_url ?? "").filter(Boolean), ...product.thumbnail_url ? [product.thumbnail_url] : []].slice(0, 5);
      while (imageUrls.length < 5) imageUrls.push("");
      setProductRegistrationDraft({
        category: product.category ?? (productCategoryOptions[0] ?? "위생/보관"),
        name: product.name ?? "",
        imageUrls,
        description: product.description ?? "",
        price: String(product.price ?? ""),
        stockQty: String(product.stock_qty ?? ""),
        skuCode: product.sku_code ?? ""
      });
      setDesktopProductEditId(product.id);
      setDesktopProductEditorOpen(true);
      setDesktopProductCrudMessage(`수정 모드: ${product.name}`);
    } catch (error) {
      setDesktopProductCrudMessage(error instanceof Error ? error.message : "상품 정보를 불러오지 못했습니다.");
    } finally {
      setDesktopProductCrudBusy(false);
    }
  };
  const resetDesktopProductDraft = () => {
    setDesktopProductEditId(null);
    setDesktopProductEditorOpen(true);
    setDesktopProductCrudMessage("");
    setProductRegistrationDraft(createEmptyProductDraft());
  };
  const closeDesktopProductEditor = () => {
    setDesktopProductEditorOpen(false);
    setDesktopProductEditId(null);
    setDesktopProductCrudMessage("상품 목록 화면으로 돌아왔습니다.");
    setProductRegistrationDraft(createEmptyProductDraft());
  };
  const deleteDesktopProduct = async (productId) => {
    setDesktopProductCrudBusy(true);
    setDesktopProductCrudMessage("");
    try {
      await postJson(`/products/${productId}/delete`, { note: "desktop delete" });
      getJson("/seller/products/mine").then(setSellerProducts).catch(() => null);
      getJson("/products").then(setApiProducts).catch(() => null);
      setDesktopProductSelectedIds((prev) => prev.filter((id2) => id2 !== productId));
      if (desktopProductEditId === productId) {
        setDesktopProductEditId(null);
        setDesktopProductEditorOpen(false);
        setProductRegistrationDraft(createEmptyProductDraft());
      }
      setDesktopProductCrudMessage("상품을 삭제했습니다.");
    } catch (error) {
      setDesktopProductCrudMessage(error instanceof Error ? error.message : "상품 삭제에 실패했습니다.");
    } finally {
      setDesktopProductCrudBusy(false);
    }
  };
  const deleteSelectedDesktopProducts = async () => {
    if (!desktopProductSelectedIds.length || desktopProductCrudBusy) return;
    setDesktopProductCrudBusy(true);
    setDesktopProductCrudMessage("");
    try {
      for (const productId of desktopProductSelectedIds) {
        await postJson(`/products/${productId}/delete`, { note: "desktop bulk delete" });
      }
      getJson("/seller/products/mine").then(setSellerProducts).catch(() => null);
      getJson("/products").then(setApiProducts).catch(() => null);
      if (desktopProductEditId && desktopProductSelectedIds.includes(desktopProductEditId)) {
        setDesktopProductEditId(null);
        setDesktopProductEditorOpen(false);
        setProductRegistrationDraft(createEmptyProductDraft());
      }
      setDesktopProductSelectedIds([]);
      setDesktopProductCrudMessage(`선택한 상품 ${desktopProductSelectedIds.length}건을 삭제했습니다.`);
    } catch (error) {
      setDesktopProductCrudMessage(error instanceof Error ? error.message : "선택 상품 삭제에 실패했습니다.");
    } finally {
      setDesktopProductCrudBusy(false);
    }
  };
  const applyDesktopOrderPreset = (preset) => {
    setDesktopOrderDatePreset(preset);
    if (preset === "전체") {
      setDesktopOrderStartDate("");
      setDesktopOrderEndDate("");
      return;
    }
    const end = /* @__PURE__ */ new Date();
    const start = /* @__PURE__ */ new Date();
    start.setDate(start.getDate() - (preset === "오늘" ? 0 : preset === "지난7일" ? 6 : 29));
    setDesktopOrderStartDate(formatDesktopOrderIsoDate(start));
    setDesktopOrderEndDate(formatDesktopOrderIsoDate(end));
  };
  const resetDesktopOrderFilters = () => {
    setDesktopOrderStageFilter("전체");
    setDesktopOrderDatePreset("전체");
    setDesktopOrderStartDate("");
    setDesktopOrderEndDate("");
    setDesktopOrderDeliveryFilter("전체");
    setDesktopOrderSearchField("주문번호");
    setDesktopOrderSearchInput("");
    setDesktopOrderSearchKeyword("");
    setDesktopOrderSelectedNos([]);
  };
  const applyDesktopOrderSearch = () => {
    setDesktopOrderSearchKeyword(desktopOrderSearchInput.trim());
  };
  const renderDesktopEmbeddedBusinessView = () => {
    var _a2;
    const businessViewId = desktopPaneContext.businessViewId;
    if (!businessViewId) return null;
    const meta = desktopBusinessViewMeta[businessViewId];
    const recentOrderRows = [...orders].slice().reverse().slice(0, 6);
    const recentThreadRows = threadItems.slice(0, 6);
    const recentSupportRows = communitySeed.slice(0, 6);
    const recentNotificationRows = notificationItems.slice(0, 6);
    const desktopOrderRows = buildDesktopOrderAdminRows(orders, sellerProducts);
    const filteredDesktopOrderRows = desktopOrderRows.filter((item) => {
      const stageMatch = desktopOrderStageFilter === "전체" || (desktopOrderStageFilter === "주문접수" ? item.progressStatus.startsWith("주문접수") : item.progressStatus === desktopOrderStageFilter);
      const deliveryMatch = desktopOrderDeliveryFilter === "전체" || item.deliveryStatus === desktopOrderDeliveryFilter;
      const startMatch = !desktopOrderStartDate || item.orderedDateIso >= desktopOrderStartDate;
      const endMatch = !desktopOrderEndDate || item.orderedDateIso <= desktopOrderEndDate;
      const keyword = desktopOrderSearchKeyword.trim().toLowerCase();
      const searchTarget = desktopOrderSearchField === "주문번호" ? item.orderNo : desktopOrderSearchField === "주문자명" ? item.ordererLabel : item.receiverLabel;
      const keywordMatch = !keyword || searchTarget.toLowerCase().includes(keyword);
      return stageMatch && deliveryMatch && startMatch && endMatch && keywordMatch;
    });
    const allDesktopOrderRowsSelected = filteredDesktopOrderRows.length > 0 && filteredDesktopOrderRows.every((item) => desktopOrderSelectedNos.includes(item.orderNo));
    const productStatusSummary = {
      total: sellerProducts.length,
      approved: sellerProducts.filter((item) => item.status === "approved").length,
      waiting: sellerProducts.filter((item) => item.status !== "approved").length,
      lowStock: sellerProducts.filter((item) => Number(item.stock_qty ?? 0) > 0 && Number(item.stock_qty ?? 0) <= 5).length
    };
    if (businessViewId === "product_crud") {
      const allProductsSelected = sellerProducts.length > 0 && desktopProductSelectedIds.length === sellerProducts.length;
      const editorTitle = desktopProductEditId ? "상품 수정" : "상품 등록";
      const editorDescription = desktopProductEditId ? "선택한 상품 정보를 수정할 수 있습니다." : "신규 상품 정보를 입력할 수 있습니다.";
      const currentStatusLabel = desktopProductEditId ? ((_a2 = sellerProducts.find((item) => item.id === desktopProductEditId)) == null ? void 0 : _a2.status) ?? "draft" : "new";
      const desktopProductOperationCards = isChatEmoticonCategory ? [
        { title: "상품 주요 정보", body: `현재 상태: ${currentStatusLabel} · 상품코드: ${productRegistrationDraft.skuCode || "-"} · 카테고리: ${productRegistrationDraft.category || "-"}` },
        { title: "노출 가이드", body: "대표 이미지와 미리보기 이미지는 채팅 내 미리보기/상점 카드에 맞는 정사각형 비율을 권장합니다." },
        { title: "사용 범위", body: "채팅-이모티콘은 채팅방 이모티콘 전용 상품으로 가정하고 설명, 썸네일, 가격 정보 중심으로 등록합니다." },
        { title: "판매 운영", body: "임시저장 후 검토 또는 상품등록 시 즉시 공개 흐름을 유지하고, 필요 시 판매중지/교체 이미지를 후속 반영할 수 있습니다." }
      ] : [
        { title: "상품 주요 정보", body: `현재 상태: ${currentStatusLabel} · 상품코드: ${productRegistrationDraft.skuCode || "-"} · 카테고리: ${productRegistrationDraft.category || "-"}` },
        { title: "상품정보제공고시 / 구비서류", body: "카테고리 확정 후 필수 고시정보와 판매 증빙서류 업로드 영역을 연결할 수 있습니다." },
        { title: "배송", body: "익명포장, 배송비, 출고리드타임 정책을 연결할 수 있습니다." },
        { title: "반품/교환", body: "반품지, 교환 기준, 고객센터 안내 문구를 연결할 수 있습니다." }
      ];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-business-shell", children: [
        !desktopProductEditorOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "desktop-business-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: meta.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: meta.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-business-chip-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
              "전체 ",
              productStatusSummary.total
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
              "공개중 ",
              productStatusSummary.approved
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
              "검토/임시 ",
              productStatusSummary.waiting
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
              "재고주의 ",
              productStatusSummary.lowStock
            ] })
          ] })
        ] }) : null,
        !desktopProductEditorOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "desktop-business-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-business-section-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "상품 목록" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "첫 화면은 조회 중심으로 유지하고, 상품 등록/상세 수정은 전체 등록 화면으로 전환되도록 변경했습니다." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row desktop-product-toolbar-actions", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: resetDesktopProductDraft, disabled: desktopProductCrudBusy, children: "상품 등록" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn danger", onClick: deleteSelectedDesktopProducts, disabled: desktopProductCrudBusy || !desktopProductSelectedIds.length, children: "선택 삭제" })
            ] })
          ] }),
          desktopProductCrudMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini", children: desktopProductCrudMessage }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-product-table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "desktop-product-table desktop-product-table-clickable", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: allProductsSelected,
                  onChange: () => setDesktopProductSelectedIds(allProductsSelected ? [] : sellerProducts.map((item) => item.id)),
                  "aria-label": "전체 상품 선택"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "상품명" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "카테고리" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "상태" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "가격" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "재고" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "수정일" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "관리" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sellerProducts.length ? sellerProducts.map((item) => {
              const checked = desktopProductSelectedIds.includes(item.id);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: desktopProductEditId === item.id && desktopProductEditorOpen ? "active" : "", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked,
                    onChange: () => setDesktopProductSelectedIds((prev) => prev.includes(item.id) ? prev.filter((id2) => id2 !== item.id) : [...prev, item.id]),
                    "aria-label": `${item.name} 선택`
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "desktop-product-row-link", onClick: () => loadDesktopProductForEdit(item.id), disabled: desktopProductCrudBusy, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-product-table-sub", children: item.sku_code })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.category }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.status }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
                  "₩",
                  item.price.toLocaleString()
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.stock_qty }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.updated_at ?? "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-product-table-actions", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => loadDesktopProductForEdit(item.id), disabled: desktopProductCrudBusy, children: "상세/수정" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => submitProductForReview(item.id), disabled: desktopProductCrudBusy || item.status === "approved", children: "승인대기" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn danger", onClick: () => deleteDesktopProduct(item.id), disabled: desktopProductCrudBusy, children: "삭제" })
                ] }) })
              ] }, item.id);
            }) : /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "desktop-product-table-empty", children: "등록된 상품이 없습니다. 상단의 상품 등록 버튼으로 새 상품을 추가하세요." }) }) })
          ] }) })
        ] }) : null,
        desktopProductEditorOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "desktop-business-card desktop-product-crud-card desktop-product-detail-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-product-editor-topbar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn desktop-product-back-btn", onClick: closeDesktopProductEditor, children: "← 뒤로가기" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-business-section-head desktop-business-section-head-editor", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: editorTitle }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: editorDescription })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "copy-action-row desktop-product-toolbar-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: resetDesktopProductDraft, children: "신규 작성" }) })
          ] }),
          desktopProductCrudMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini", children: desktopProductCrudMessage }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-product-manual-strip", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-product-manual-chip", children: "상품 등록 필수항목" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-product-manual-chip", children: "상품등록 매뉴얼 동영상 가이드" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-product-manual-chip", children: "복사등록" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-product-manual-chip", children: "카탈로그 매칭하기" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-product-manual-chip", children: "도움말" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-product-section-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "desktop-product-section-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-product-section-headline", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "기본 정보" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-product-form-grid desktop-product-form-grid-detailed desktop-product-form-grid-labelless", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: productRegistrationDraft.category, onChange: (event) => handleProductCategoryChange(event.target.value), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "카테고리 선택" }),
                  productCategoryOptions.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item, children: item }, item))
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: productRegistrationDraft.name, onChange: (event) => handleProductNameChange(event.target.value), onMouseDown: guardProductCategoryRequiredInteraction, onFocus: guardProductCategoryRequiredInteraction, placeholder: "등록상품명 입력", maxLength: 29, readOnly: !isProductCategorySelected, "aria-disabled": !isProductCategorySelected }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "wide", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: productRegistrationDraft.description, onChange: (event) => handleProductDescriptionChange(event.target.value), onMouseDown: guardProductCategoryRequiredInteraction, onFocus: guardProductCategoryRequiredInteraction, rows: 6, placeholder: "상세설명 입력", readOnly: !isProductCategorySelected, "aria-disabled": !isProductCategorySelected }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `desktop-product-inline-affix${!isProductCategorySelected ? " disabled" : ""}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { inputMode: "numeric", value: productRegistrationDraft.price, onChange: (event) => handleProductPriceChange(event.target.value), onMouseDown: guardProductCategoryRequiredInteraction, onFocus: guardProductCategoryRequiredInteraction, placeholder: "판매가 입력", readOnly: !isProductCategorySelected, "aria-disabled": !isProductCategorySelected }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "원" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { inputMode: "numeric", value: productRegistrationDraft.stockQty, onChange: (event) => handleProductStockQtyChange(event.target.value), onMouseDown: guardProductCategoryRequiredInteraction, onFocus: guardProductCategoryRequiredInteraction, placeholder: "재고수량 입력", readOnly: !isProductCategorySelected, "aria-disabled": !isProductCategorySelected }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "wide", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: productRegistrationDraft.skuCode, onChange: (event) => handleProductSkuCodeChange(event.target.value), onMouseDown: guardProductCategoryRequiredInteraction, onFocus: guardProductCategoryRequiredInteraction, placeholder: "상품코드 SKU 입력", readOnly: !isProductCategorySelected, "aria-disabled": !isProductCategorySelected }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "desktop-product-section-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-product-section-headline", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: isChatEmoticonCategory ? "대표 이미지 / 미리보기 이미지" : "대표 이미지 / 추가 이미지" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-product-form-grid desktop-product-photo-grid", children: productImageInputMeta.map((meta2, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: index === 0 ? "wide" : void 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: productRegistrationDraft.imageUrls[index] ?? "",
                  onChange: (event) => {
                    const next = [...productRegistrationDraft.imageUrls];
                    next[index] = event.target.value;
                    setProductRegistrationDraft((prev) => ({ ...prev, imageUrls: next }));
                  },
                  placeholder: meta2.placeholder,
                  disabled: !isProductCategorySelected
                }
              ) }, `product-image-${index}`)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "desktop-product-section-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-product-section-headline", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "상품 운영 정보" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-product-support-grid", children: desktopProductOperationCards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "desktop-product-mini-card", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: card.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: card.body })
              ] }, card.title)) })
            ] })
          ] }),
          !sellerApprovalReady ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini", children: "사업자 인증 승인 후 상품 관리가 가능합니다." }) : null,
          !productDraftReady ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini", children: "카테고리, 등록상품명, 상세 설명, 판매가, 재고수량을 모두 입력해야 저장할 수 있습니다." }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row desktop-product-submit-actions", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: closeDesktopProductEditor, children: "취소" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => submitProductRegistration("draft"), disabled: !sellerApprovalReady || !productDraftReady || reconsentWriteRestricted || desktopProductCrudBusy, children: desktopProductEditId ? "임시 저장" : "임시 저장" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => submitProductRegistration("publish"), disabled: !sellerApprovalReady || !productDraftReady || reconsentWriteRestricted || desktopProductCrudBusy, children: desktopProductEditId ? "상품수정" : "상품등록" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: openBusinessVerificationTab, children: "사업자인증 보기" })
          ] })
        ] }) : null
      ] });
    }
    if (businessViewId === "orders") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-business-shell", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "desktop-business-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: meta.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: meta.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-business-chip-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
              "전체 주문 ",
              desktopOrderRows.length
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
              "조회 결과 ",
              filteredDesktopOrderRows.length
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
              "선택 ",
              desktopOrderSelectedNos.length
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "desktop-business-card desktop-order-stage-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-order-stage-row", children: ["전체", "주문접수", "상품준비중", "배송지시", "배송중", "배송완료"].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: `desktop-order-stage-btn ${desktopOrderStageFilter === item ? "active" : ""}`,
            onClick: () => setDesktopOrderStageFilter(item),
            children: item
          },
          item
        )) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "desktop-business-card desktop-order-filter-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-business-section-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "주문접수 및 배송처리" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "조회/등록/수정/삭제 화면에 등록된 상품과 연결되는 주문 목록을 검색·필터·상태 흐름 기준으로 볼 수 있게 구성했습니다." })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-order-filter-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-order-filter-line", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "기간" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-order-period-chip-row", children: ["오늘", "지난7일", "지난30일"].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: `desktop-order-period-chip ${desktopOrderDatePreset === item ? "active" : ""}`,
                  onClick: () => applyDesktopOrderPreset(item),
                  children: item
                },
                item
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: desktopOrderStartDate, onChange: (event) => {
                setDesktopOrderDatePreset("사용자지정");
                setDesktopOrderStartDate(event.target.value);
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-order-date-wave", children: "~" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: desktopOrderEndDate, onChange: (event) => {
                setDesktopOrderDatePreset("사용자지정");
                setDesktopOrderEndDate(event.target.value);
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: resetDesktopOrderFilters, children: "초기화" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: applyDesktopOrderSearch, children: "검색" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-order-filter-line", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "배송상태" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: desktopOrderDeliveryFilter, onChange: (event) => setDesktopOrderDeliveryFilter(event.target.value), children: ["전체", "결제완료", "상품준비중", "배송지시", "배송중", "배송완료", "업체 직접 배송"].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item, children: item }, item)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-order-filter-line", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "상세조건" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: desktopOrderSearchField, onChange: (event) => setDesktopOrderSearchField(event.target.value), children: ["주문번호", "주문자명", "수취인명"].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item, children: item }, item)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: desktopOrderSearchInput, onChange: (event) => setDesktopOrderSearchInput(event.target.value), placeholder: "검색어 입력" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-product-table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "desktop-product-table desktop-order-table", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: allDesktopOrderRowsSelected,
                  onChange: () => setDesktopOrderSelectedNos(allDesktopOrderRowsSelected ? [] : filteredDesktopOrderRows.map((item) => item.orderNo)),
                  "aria-label": "전체 주문 선택"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "주문일시" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "주문번호" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "상품명" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "상품코드" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "주문개수" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "주문자명/아이디" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "수취인/연락처" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "배송지" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "배송상태" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "진행상태" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredDesktopOrderRows.length ? filteredDesktopOrderRows.map((item) => {
              const checked = desktopOrderSelectedNos.includes(item.orderNo);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked,
                    onChange: () => setDesktopOrderSelectedNos((prev) => prev.includes(item.orderNo) ? prev.filter((orderNo) => orderNo !== item.orderNo) : [...prev, item.orderNo]),
                    "aria-label": `${item.orderNo} 선택`
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.orderedAt }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.orderNo }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.productName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.productCode }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.quantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.ordererLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.receiverLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "desktop-order-address-cell", children: item.address }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `desktop-order-status-chip desktop-order-status-chip-${item.deliveryStatus === "업체 직접 배송" ? "direct" : item.deliveryStatus === "배송완료" ? "done" : item.deliveryStatus === "배송중" ? "moving" : item.deliveryStatus === "배송지시" ? "guide" : item.deliveryStatus === "상품준비중" ? "prepare" : "paid"}`, children: item.deliveryStatus }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.progressStatus })
              ] }, item.id);
            }) : /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 11, className: "desktop-product-table-empty", children: "조건에 맞는 주문이 없습니다. 등록 상품 또는 생성된 주문 데이터가 있으면 이곳에 표시됩니다." }) }) })
          ] }) })
        ] })
      ] });
    }
    if (businessViewId === "settlement") {
      const priceByCode = new Map(sellerProducts.map((item) => [item.sku_code, Number(item.price ?? 0)]));
      const latestSettlementDateIso = desktopOrderRows.length ? desktopOrderRows.reduce((latest, item) => item.orderedDateIso > latest ? item.orderedDateIso : latest, desktopOrderRows[0].orderedDateIso) : formatDesktopOrderIsoDate(/* @__PURE__ */ new Date());
      const settlementRangeStartIso = desktopSettlementPeriod === "1년" ? shiftDesktopOrderIsoMonth(latestSettlementDateIso, -11) : desktopSettlementPeriod === "반기" ? shiftDesktopOrderIsoMonth(latestSettlementDateIso, -5) : desktopSettlementPeriod === "분기" ? shiftDesktopOrderIsoMonth(latestSettlementDateIso, -2) : `${latestSettlementDateIso.slice(0, 7)}-01`;
      const settlementRows = desktopOrderRows.filter((item) => item.orderedDateIso >= settlementRangeStartIso && item.orderedDateIso <= latestSettlementDateIso).map((item) => {
        const unitPrice = priceByCode.get(item.productCode) ?? 0;
        const salesAmount = unitPrice * item.quantity;
        return {
          ...item,
          salesAmount,
          monthKey: item.orderedDateIso.slice(0, 7)
        };
      }).sort((a, b) => b.orderedDateIso.localeCompare(a.orderedDateIso) || b.orderNo.localeCompare(a.orderNo));
      const monthlyTotals = settlementRows.reduce((acc, item) => {
        acc[item.monthKey] = (acc[item.monthKey] ?? 0) + item.salesAmount;
        return acc;
      }, {});
      const monthKeys = Object.keys(monthlyTotals).sort((a, b) => b.localeCompare(a));
      const latestMonthKey = monthKeys[0] ?? latestSettlementDateIso.slice(0, 7);
      const monthSalesTotal = monthlyTotals[latestMonthKey] ?? 0;
      const grossSalesTotal = settlementRows.reduce((sum, item) => sum + item.salesAmount, 0);
      const totalQuantity = settlementRows.reduce((sum, item) => sum + item.quantity, 0);
      const estimatedNetProfit = Math.round(grossSalesTotal * 0.82);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-business-shell", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "desktop-business-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: meta.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "기간 선택에 따라 월 총 매출과 판매 상세 내역을 동시에 볼 수 있게 구성했습니다." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-business-chip-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
              "기준 기간 ",
              desktopSettlementPeriod
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
              "판매 건수 ",
              settlementRows.length
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
              "판매 수량 ",
              totalQuantity
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "desktop-business-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-business-section-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "매출 / 순이익" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "상단 기간 버튼으로 범위를 바꾸면 월 총 매출과 하단 상세 목록이 함께 갱신됩니다." })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-settlement-period-row", children: ["1년", "반기", "분기", "월"].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: `desktop-settlement-period-btn ${desktopSettlementPeriod === item ? "active" : ""}`,
              onClick: () => setDesktopSettlementPeriod(item),
              children: item
            },
            item
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-settlement-summary-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "desktop-settlement-summary-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "월 총 매출" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                formatDesktopSettlementMonthLabel(latestMonthKey),
                " · ₩",
                monthSalesTotal.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "desktop-settlement-summary-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "선택 기간 총 매출" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                "₩",
                grossSalesTotal.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "desktop-settlement-summary-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "선택 기간 순이익" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                "₩",
                estimatedNetProfit.toLocaleString()
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-settlement-month-strip", children: monthKeys.length ? monthKeys.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `desktop-settlement-month-chip ${item === latestMonthKey ? "active" : ""}`, children: [
            formatDesktopSettlementMonthLabel(item),
            " · ₩",
            monthlyTotals[item].toLocaleString()
          ] }, item)) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "desktop-settlement-month-chip", children: "매출 데이터 없음" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-product-table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "desktop-product-table desktop-settlement-table", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "판매날짜" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "상품명" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "상품개수" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "판매매출" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: settlementRows.length ? settlementRows.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.orderedDateIso }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.productName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.quantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
                "₩",
                item.salesAmount.toLocaleString()
              ] })
            ] }, `settlement-${item.id}`)) : /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "desktop-product-table-empty", children: "표시할 판매 데이터가 없습니다." }) }) })
          ] }) })
        ] })
      ] });
    }
    const genericRows = businessViewId === "shipping" ? recentOrderRows.map((item) => ({ title: item.order_no, meta: `${item.status} · 정산 ${item.settlement_status}`, body: `출고 처리 대상 주문 · 결제 ${item.payment_pg}` })) : businessViewId === "returns" ? recentOrderRows.map((item) => ({ title: item.order_no, meta: `${item.status} · 정산 ${item.settlement_status}`, body: `취소/반품 검토 대상 주문 · 결제금액 ₩${Number(item.total_amount ?? 0).toLocaleString()}` })) : businessViewId === "reviews" ? shopCatalogItems.slice(0, 6).map((item) => ({ title: item.name, meta: `${item.category} · 리뷰 ${item.reviewCount ?? 0}건`, body: item.subtitle })) : businessViewId === "chat" ? recentThreadRows.map((item) => ({ title: item.name, meta: `${item.kind} · ${item.time}`, body: item.preview })) : businessViewId === "support" ? recentSupportRows.map((item) => ({ title: item.title, meta: `${item.category} · ${item.meta}`, body: item.summary })) : recentNotificationRows.map((item) => ({ title: item.title, meta: `${item.section} · ${item.postedAt}`, body: item.body }));
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-business-shell", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "desktop-business-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: meta.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: meta.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "desktop-business-chip-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
            "분류 ",
            meta.section
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
            "기본 탭 ",
            meta.fallbackTab
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "desktop-business-chip", children: [
            "최근 항목 ",
            genericRows.length
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "desktop-business-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-business-section-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { children: [
            meta.title,
            " 화면"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: meta.description })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-business-list", children: genericRows.length ? genericRows.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "desktop-business-list-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.meta })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.body })
        ] }, `${businessViewId}-${index}`)) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "desktop-business-empty", children: "표시할 최근 데이터가 없습니다." }) })
      ] })
    ] });
  };
  if (desktopPaneContext.embedded && desktopPaneContext.businessViewId) {
    return renderDesktopEmbeddedBusinessView();
  }
  if (companyMailMode) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CompanyMailAdminScreen,
      {
        isAdmin,
        onExit: companyMailHostLocked ? void 0 : closeCompanyMailPreview,
        onRequestLogin: requestCompanyMailLogin,
        hostLabel: companyMailHostLocked ? `숨김 도메인 접속 · ${companyMailHostLabel}` : `미리보기 경로 · ${companyMailHostLabel}#corp-mail-admin`
      }
    );
  }
  if (isDesktopSplitHost) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopSplitShell, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mobile-app-shell", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: `top-header${activeTab === "홈" && (homeTab === "쇼츠" && shortsHeaderHidden || homeTab === "피드" && homeFeedHeaderHidden || isAnyShortsViewerOpen) ? " shorts-top-header-hidden" : ""}`, children: overlayMode === "search" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `topbar-search-row ${activeTab === "쇼핑" ? "topbar-search-row-shop" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "header-inline-btn header-icon-btn topbar-search-back",
          onClick: () => setOverlayMode(null),
          "aria-label": "뒤로가기",
          title: "뒤로가기",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {})
        }
      ),
      activeTab === "쇼핑" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: `header-inline-btn topbar-search-filter-btn${shopSearchFilterPanelOpen ? " active" : ""}`,
          onClick: openShopSearchFilterPanel,
          "aria-label": `필터 ${searchFilter}`,
          title: `필터 ${searchFilter}`,
          "aria-expanded": shopSearchFilterPanelOpen,
          children: "필터"
        }
      ) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "topbar-search-input-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: globalKeyword,
          onChange: (e) => setGlobalKeyword(e.target.value),
          placeholder: `${activeTab} 검색어 입력`,
          className: "topbar-search-input",
          autoFocus: true
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "topbar-search-trailing", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "topbar-title-inline", "aria-live": "polite", children: activeTab === "쇼핑" ? "쇼핑검색" : currentScreenTitle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "header-inline-btn header-icon-btn header-toolbar-btn active", onClick: () => openOverlay("search"), "aria-label": `${activeTab}검색`, title: `${activeTab}검색`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "header-inline-btn header-icon-btn header-notification-btn header-toolbar-btn", onClick: () => openOverlay("notifications"), "aria-label": `${activeTab}알림`, title: `${activeTab}알림`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BellIcon, {}),
          unreadNotificationCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "header-badge", children: unreadNotificationCount > 9 ? "9+" : unreadNotificationCount }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "header-inline-btn header-icon-btn header-toolbar-btn", onClick: () => openOverlay("settings"), "aria-label": `${activeTab}설정`, title: `${activeTab}설정`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsIcon, {}) })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "topbar-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "topbar-side topbar-left", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "topbar-inline-actions topbar-inline-actions-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: `header-inline-btn header-icon-btn ${overlayMode === "menu" ? "active" : ""}`, onClick: openMenuOverlay, "aria-label": "메뉴", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuIcon, {}) }),
        visibleHeaderNavItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `header-inline-btn ${item.active ? "active" : ""} ${item.label === "바구니" ? "header-inline-btn-icon-label" : ""}`, onClick: item.onClick, disabled: !item.onClick, "aria-label": item.label, children: item.label === "바구니" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CartIcon, {}) : item.label }, item.label))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "topbar-side topbar-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "topbar-inline-actions topbar-inline-actions-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "topbar-title-inline", "aria-live": "polite", children: currentScreenTitle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "header-inline-btn header-icon-btn header-toolbar-btn", onClick: () => openOverlay("search"), "aria-label": `${activeTab}검색`, title: `${activeTab}검색`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `header-inline-btn header-icon-btn header-notification-btn header-toolbar-btn ${overlayMode === "notifications" ? "active" : ""}`, onClick: () => openOverlay("notifications"), "aria-label": `${activeTab}알림`, title: `${activeTab}알림`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BellIcon, {}),
          unreadNotificationCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "header-badge", children: unreadNotificationCount > 9 ? "9+" : unreadNotificationCount }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: `header-inline-btn header-icon-btn header-toolbar-btn ${overlayMode === "settings" ? "active" : ""}`, onClick: () => openOverlay("settings"), "aria-label": `${activeTab}설정`, title: `${activeTab}설정`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsIcon, {}) })
      ] }) })
    ] }) }),
    showBaseTabContent && activeTab === "홈" && homeTab === "쇼츠" && !isAnyShortsViewerOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `shorts-category-strip${shortsCategoryVisible ? " visible" : ""}`, children: shortsCategories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `shorts-category-chip${selectedShortsCategory === category ? " active" : ""}`, onClick: () => {
      setSelectedShortsCategory(category);
      setShortsHeaderHidden(false);
      setShortsCategoryVisible(true);
      lastShortsScrollTopRef.current = 0;
      shortsHideThresholdRef.current = 0;
      shortsShowThresholdRef.current = 0;
    }, children: category }, category)) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mobile-main", children: [
      showBaseTabContent && reconsentRequired ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "reconsent-banner", role: "button", tabIndex: 0, onClick: () => {
        setHomeShopConsentGuideSeen(true);
        setOverlayMode("reconsent_info");
      }, onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setHomeShopConsentGuideSeen(true);
          setOverlayMode("reconsent_info");
        }
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "필수 문서 재동의 필요" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "기존 7일 유예 없이 최신 필수 문서를 바로 다시 확인해야 합니다. 클릭하면 재동의 안내와 약관 화면으로 이동합니다." })
      ] }) : null,
      showBaseTabContent && shouldShowHomeShopConsentGuide ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "reconsent-banner", role: "button", tabIndex: 0, onClick: () => {
        setHomeShopConsentGuideSeen(true);
        setOverlayMode("reconsent_info");
      }, onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setHomeShopConsentGuideSeen(true);
          setOverlayMode("reconsent_info");
        }
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "홈/쇼핑 최초 진입 전 필수 문서 확인 안내" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: reconsentRequired ? "재동의가 필요한 계정입니다. 클릭 후 최신 필수 문서를 확인하고 무엇을 해야 하는지 안내를 먼저 보세요." : "최신 이용약관, 개인정보 처리방침, 청소년 보호정책 확인 방법을 보려면 클릭하세요." })
      ] }) : null,
      showBaseTabContent && releaseReadiness && releaseReadiness.status !== "ready" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `status-banner ${releaseReadiness.status === "blocked" ? "warning" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "국내 출시 전 법적/운영 보완 필요" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: releaseReadiness.status === "blocked" ? `출시 차단 ${releaseReadiness.blockers.length}건 · 주의 ${releaseReadiness.warnings.length}건` : `주의 ${releaseReadiness.warnings.length}건` }),
        releaseReadiness.blockers[0] || releaseReadiness.warnings[0] ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "우선 조치: ",
          (releaseReadiness.blockers[0] || releaseReadiness.warnings[0]).title,
          " — ",
          (releaseReadiness.blockers[0] || releaseReadiness.warnings[0]).action
        ] }) : null
      ] }) : null,
      overlayMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: overlayMode === "notifications" ? "stack-gap notification-overlay-body compact-scroll-list notification-overlay-root" : overlayMode === "search" ? `overlay-search-shell${activeTab === "쇼핑" ? " overlay-search-shell-shop" : ""}` : "overlay-card", children: [
        overlayMode !== "search" && overlayMode !== "notifications" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overlay-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: overlayMode === "menu" ? `${activeTab} 메뉴` : overlayMode === "reconsent_info" ? "필수 문서 재동의 안내" : "설정 카테고리" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-btn", onClick: () => setOverlayMode(null), children: "닫기" })
        ] }) : null,
        overlayMode === "search" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `overlay-body stack-gap contextual-search-pane search-overlay-pane ${activeTab === "쇼핑" ? `search-overlay-pane-shop${shopSearchFilterPanelOpen ? " filter-open" : " filter-closed"}` : ""}`, children: [
          activeTab !== "쇼핑" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "search-scope-row", children: currentSearchSections.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: `search-scope-btn ${searchSection === item ? "active" : ""}`,
              onClick: () => setSearchSection(item),
              children: item
            },
            `search-section-${item}`
          )) }) : null,
          activeTab === "쇼핑" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `search-toolbar-actions shop-search-toolbar-actions${shopSearchFilterPanelOpen ? " filter-open" : " filter-closed"}`, children: shopSearchFilterPanelOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shop-search-filter-status", children: [
              "검색범위 ",
              searchFilter,
              " · 가격 ",
              shopSearchPriceMin || "0",
              "~",
              shopSearchPriceMax || "∞",
              " · 색상 ",
              shopSearchColor,
              " · 용도 ",
              shopSearchPurpose
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-btn search-clear-btn", onClick: () => setGlobalKeyword(""), children: "검색어 초기화" })
          ] }) : null }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "search-toolbar-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-btn search-clear-btn", onClick: () => setGlobalKeyword(""), children: "검색어 초기화" }) }),
          activeTab === "쇼핑" && shopSearchFilterPanelOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-search-filter-inline-panel", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-search-filter-inline-head", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "쇼핑 검색 필터" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn shop-search-filter-apply-btn", onClick: closeShopSearchFilterPanel, children: "적용" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap shop-search-filter-body", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact shop-search-filter-box", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "가격 설정" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-search-price-range-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: shopSearchPriceMin, onChange: (event) => setShopSearchPriceMin(event.target.value.replace(/[^\d]/g, "")), placeholder: "최소 입력", inputMode: "numeric" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "~" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: shopSearchPriceMax, onChange: (event) => setShopSearchPriceMax(event.target.value.replace(/[^\d]/g, "")), placeholder: "최대 입력", inputMode: "numeric" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact shop-search-filter-box", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "색상 설정" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-search-filter-chip-row", children: SHOP_SEARCH_COLOR_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `shop-search-filter-chip ${shopSearchColor === option ? "active" : ""}`, onClick: () => setShopSearchColor(option), children: option }, `shop-color-${option}`)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact shop-search-filter-box", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "용도 설정" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-search-filter-chip-row", children: SHOP_SEARCH_PURPOSE_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `shop-search-filter-chip ${shopSearchPurpose === option ? "active" : ""}`, onClick: () => setShopSearchPurpose(option), children: option }, `shop-purpose-${option}`)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: resetShopSearchFilters, children: "초기화" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: closeShopSearchFilterPanel, children: "필터 적용" })
              ] })
            ] })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `context-search-results compact-scroll-list search-results-list ${activeTab === "쇼핑" ? "shop-search-results-list" : ""}`, onScroll: activeTab === "쇼핑" ? handleShopSearchResultsScroll : void 0, children: [
            !globalKeyword.trim() ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact search-empty-hint-box", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "검색어를 입력하면 결과가 표시됩니다." }) }) : null,
            activeTab === "홈" && searchSection === "피드결과" ? homeSearchResults.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "legacy-box compact search-result-card search-result-list-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "split-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.author })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FeedCaption, { caption: item.caption }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-meta", children: item.category })
            ] }, `home-feed-${item.id}`)) : null,
            activeTab === "홈" && searchSection === "쇼츠결과" ? homeShortSearchResults.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "legacy-box compact search-result-card search-result-list-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "split-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.author })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FeedCaption, { caption: item.caption }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "community-meta", children: [
                "쇼츠 · ",
                (item.views ?? 0).toLocaleString(),
                "회"
              ] })
            ] }, `home-short-${item.id}`)) : null,
            activeTab === "홈" && searchSection === "보관함결과" ? homeSavedSearchResults.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "legacy-box compact search-result-card search-result-list-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "split-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.meta })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.summary })
            ] }, item.id)) : null,
            activeTab === "쇼핑" ? visibleShopSearchResults.map((item) => {
              const rating = (4.1 + item.id % 8 * 0.1).toFixed(1);
              const inCart = cartItems.some((cartItem) => cartItem.productId === item.id);
              const colorTag = getProductColorTag(item);
              const purposeTag = getProductPurposeTag(item);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "article",
                {
                  className: "shop-search-result-row",
                  role: "button",
                  tabIndex: 0,
                  onClick: () => {
                    setOverlayMode(null);
                    openProductDetail(item.id);
                  },
                  onKeyDown: (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setOverlayMode(null);
                      openProductDetail(item.id);
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-search-result-thumb", children: [
                      item.thumbnailUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.thumbnailUrl, alt: item.name, className: "shop-search-result-thumb-image" }) : null,
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `shop-search-result-thumb-placeholder hero-tone-${item.id % 3 + 1}` })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-search-result-copy", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-search-result-topline", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shop-search-result-badge", children: item.badge }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shop-search-result-category", children: [
                          item.category,
                          " · ",
                          colorTag,
                          " · ",
                          purposeTag
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.subtitle }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-search-result-meta", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: item.price }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "★ ",
                          rating,
                          " (",
                          item.reviewCount ?? 0,
                          ")"
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-search-result-side", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        className: `shop-search-result-save ${inCart ? "active" : ""}`,
                        onClick: (event) => {
                          event.stopPropagation();
                          addProductToCartFromSearch(item.id);
                        },
                        "aria-label": inCart ? "장바구니 추가" : "장바구니 담기",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeartIcon, { filled: inCart })
                      }
                    ) })
                  ]
                },
                `shop-${item.id}`
              );
            }) : null,
            activeTab === "쇼핑" && globalKeyword.trim() && visibleShopSearchResults.length > 0 && visibleShopSearchResults.length < shopSearchResults.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-loading-row shop-search-loading-row", children: "상품을 더 불러오는 중" }) : null,
            activeTab === "소통" ? communicationOverlayResults.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "legacy-box compact search-result-card search-result-list-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "split-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.category })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.summary }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-meta", children: item.meta })
            ] }, `community-${item.id}`)) : null,
            activeTab === "채팅" && searchSection === "채팅" ? chatSearchResults.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "legacy-box compact search-result-card search-result-list-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "split-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.kind })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.preview }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "community-meta", children: [
                item.purpose,
                " · ",
                item.time
              ] })
            ] }, `chat-${item.id}`)) : null,
            activeTab === "채팅" && searchSection === "질문" ? questionSearchResults.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "legacy-box compact search-result-card search-result-list-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "split-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.author }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.meta })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Q. ",
                item.question
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "community-meta", children: [
                "답변 ",
                item.answer
              ] })
            ] }, `question-${item.id}`)) : null,
            activeTab === "프로필" ? profileSearchResults.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "legacy-box compact search-result-card search-result-list-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "split-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.author }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.category })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                item.title,
                " · ",
                item.caption
              ] })
            ] }, `profile-${item.id}`)) : null,
            globalKeyword.trim() && (activeTab === "홈" && (searchSection === "피드결과" && homeSearchResults.length === 0 || searchSection === "쇼츠결과" && homeShortSearchResults.length === 0 || searchSection === "보관함결과" && homeSavedSearchResults.length === 0) || activeTab === "쇼핑" && shopSearchResults.length === 0 || activeTab === "소통" && communicationOverlayResults.length === 0 || activeTab === "채팅" && (searchSection === "채팅" && chatSearchResults.length === 0 || searchSection === "질문" && questionSearchResults.length === 0) || activeTab === "프로필" && profileSearchResults.length === 0) ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "연관 검색 결과가 없습니다." }) }) : null
          ] })
        ] }) : null,
        overlayMode === "notifications" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          notificationView.view === "list" ? notificationSectionOrder.map((sectionKey) => {
            const items = notificationSections[sectionKey];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "notification-section-card notification-summary-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "notification-section-head notification-summary-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: notificationSectionMeta[sectionKey].title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn notification-more-btn", onClick: () => openNotificationSection(sectionKey), children: "더보기" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "notification-summary-list", children: items.slice(0, 3).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `notification-summary-row ${item.unread ? "unread" : ""}`, onClick: () => openNotificationDetail(sectionKey, item), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `notification-chip ${getNotificationChipTone(sectionKey)}`, children: item.category }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.postedAt })
              ] }, item.id)) })
            ] }, sectionKey);
          }) : null,
          overlayMode === "notifications" && notificationView.view === "section" && notificationView.section ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "notification-section-card notification-detail-shell notification-section-shell", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "notification-detail-head", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn topbar-search-back", onClick: () => setNotificationView({ view: "list", section: null, item: null }), "aria-label": "뒤로가기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: notificationSectionMeta[notificationView.section].title })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "notification-summary-list notification-summary-list-all notification-section-list-pane", children: visibleNotificationSectionItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `notification-summary-row ${item.unread ? "unread" : ""}`, onClick: () => openNotificationDetail(notificationView.section, item), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `notification-chip ${getNotificationChipTone(notificationView.section)}`, children: item.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.postedAt })
            ] }, item.id)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-pagination notification-section-pagination", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setNotificationSectionPage((prev) => Math.max(1, prev - 1)), disabled: notificationSectionPage <= 1, children: "이전" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                notificationSectionPage,
                " / ",
                notificationSectionTotalPages
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setNotificationSectionPage((prev) => Math.min(notificationSectionTotalPages, prev + 1)), disabled: notificationSectionPage >= notificationSectionTotalPages, children: "다음" })
            ] })
          ] }) : null,
          overlayMode === "notifications" && notificationView.view === "detail" && notificationView.item ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "notification-section-card notification-detail-shell notification-article-shell", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "notification-detail-head notification-detail-head-article", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn topbar-search-back", onClick: () => setNotificationView({ view: notificationView.section ? "section" : "list", section: notificationView.section, item: null }), "aria-label": "뒤로가기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "notification-article-meta-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "notification-article-title-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `notification-chip ${getNotificationChipTone(notificationView.section)}`, children: notificationView.item.category }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: notificationView.item.title })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "notification-article-side-meta", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: notificationDetailAuthor }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: notificationView.item.postedAt })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact notification-detail-card notification-article-content", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: notificationView.item.body }) })
          ] }) : null
        ] }) : null,
        overlayMode === "menu" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "split-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "상단바 즐겨찾기" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: resetHeaderFavorites, children: "기본값" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              activeTab,
              " 화면 상단바에 고정할 버튼을 선택합니다. 선택한 버튼만 상단에 우선 노출됩니다."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "copy-action-row wrap-row", children: (headerFavorites[activeTab] ?? []).map((label) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "header-inline-btn active", onClick: () => toggleHeaderFavorite(label), children: [
              label,
              " ×"
            ] }, `fav-${label}`)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "copy-action-row wrap-row", children: favoriteCandidates.map((label) => {
              const selected = (headerFavorites[activeTab] ?? []).includes(label);
              return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: selected ? "" : "ghost-btn", onClick: () => toggleHeaderFavorite(label), children: selected ? `${label} 제거` : `${label} 추가` }, `candidate-${label}`);
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "menu-overlay-list", children: currentMenuItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "settings-category-btn menu-overlay-btn", onClick: item.onClick, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label }) }, item.label)) }),
          activeTab === "홈" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "보관함" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "피드와 상품에서 보관함 버튼을 눌러 저장한 항목을 한곳에서 확인할 수 있습니다." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "저장된 피드" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                savedFeedIds.length,
                "개"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "저장된 상품" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                savedProductIds.length,
                "개"
              ] })
            ] })
          ] }) : null
        ] }) : null,
        overlayMode === "reconsent_info" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap compact-scroll-list", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "notification-section-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "notification-section-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "필수 문서 재동의 안내" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "홈 또는 쇼핑에 처음 들어오면 최신 필수 문서를 다시 확인해야 하는지 먼저 확인합니다." })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "notification-list", children: /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "notification-item unread", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "notification-item-copy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "notification-item-topline", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "notification-chip", children: "안내" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: reconsentRequired ? "즉시 재동의 필요" : "최신 문서 확인 권장" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: reconsentRequired ? "유예기간 없이 최신 필수 문서 재동의가 필요합니다." : "최신 약관·처리방침·청소년 보호정책을 확인해 주세요." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: reconsentRequired ? "현재 계정은 기존 7일 유예 없이 최신 버전 기준으로 즉시 재동의 상태가 적용됩니다. 재동의를 완료하기 전에는 글쓰기, 채팅, 주문, 문의, 프로필 수정 같은 쓰기 기능이 제한될 수 있습니다." : "회원가입 직후 홈/쇼핑 진입 시 최신 필수 문서를 먼저 확인하고, 변경 공지가 있을 때는 재동의 필요 여부를 여기에서 확인합니다." })
            ] }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "notification-section-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "notification-section-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "무엇을 해야 하나요?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "아래 순서대로 진행하면 됩니다." })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "consent-record-list", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "simple-list-row multi-line", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "1단계" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "이용약관, 개인정보 처리방침, 청소년 보호정책의 최신 버전을 열어 확인합니다." })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "simple-list-row multi-line", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "2단계" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "문서가 변경되었고 재동의가 필요하다고 표시되면 최신 버전 기준으로 다시 동의합니다." })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "simple-list-row multi-line", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "3단계" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "재동의 완료 후 홈, 쇼핑, 주문, 채팅, 문의, 프로필 수정 같은 기능을 계속 진행합니다." })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "simple-list-row multi-line", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "관리자 예외" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "관리자 계정은 테스트를 위해 성인인증, 필수문서 동의, 사업자인증 없이도 상품등록이 가능합니다." })
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "notification-section-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "notification-section-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "필수 문서 바로가기" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "문서를 열어 최신 버전을 확인합니다." })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "notification-policy-links", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "ghost-link-btn", href: `${getApiBase()}/legal/terms-of-service`, target: "_blank", rel: "noreferrer", children: "이용약관" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "ghost-link-btn", href: `${getApiBase()}/legal/privacy-policy`, target: "_blank", rel: "noreferrer", children: "개인정보 처리방침" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "ghost-link-btn", href: `${getApiBase()}/legal/youth-policy`, target: "_blank", rel: "noreferrer", children: "청소년 보호정책" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "ghost-link-btn", href: `${getApiBase()}/legal/refund-policy`, target: "_blank", rel: "noreferrer", children: "환불정책" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "현재 동의 상태" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: reconsentRequired ? "재동의 필요 상태" : "최신 버전 동의 상태" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "적용 방식: ",
                reconsentMode === "login_block" ? "로그인 전 재동의" : "즉시 쓰기 기능 제한"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "유예기간: ",
                ((_e = authSummary == null ? void 0 : authSummary.consent_status) == null ? void 0 : _e.grace_period_days) ?? 0,
                "일"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
              setHomeShopConsentGuideSeen(true);
              setOverlayMode(null);
            }, children: "확인 완료" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => {
              setOverlayMode("settings");
              setSettingsCategory("일반");
            }, children: "설정으로 이동" })
          ] })
        ] }) : null,
        overlayMode === "settings" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-category-nav", children: [
            canToggleAccountMode ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "settings-category-btn settings-account-toggle-btn", onClick: handleAccountModeToggle, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: accountModeToggleLabel }) }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "settings-category-btn settings-logout-btn", onClick: handleLogout, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "로그아웃" }) }),
            settingsNavItems.map((item) => {
              const isHtmlToggle = item === "HTML요소";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  className: `settings-category-btn ${settingsCategory === item ? "active" : ""} ${isHtmlToggle && htmlInspectorEnabled ? "inspector-on" : ""}`,
                  onClick: () => {
                    setSettingsCategory(item);
                    if (isHtmlToggle) setHtmlInspectorEnabled((prev) => !prev);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item }),
                    isHtmlToggle ? /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: htmlInspectorEnabled ? "ON" : "OFF" }) : null
                  ]
                },
                item
              );
            })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SettingSection,
            {
              category: settingsCategory,
              isAdmin,
              legacySection,
              setLegacySection,
              projectStatus,
              deployGuide,
              legalDocuments,
              authSummary,
              businessInfo,
              releaseReadiness,
              paymentProviderStatus,
              minorPurgePreview,
              currentUserRole,
              adminModeTab,
              setAdminModeTab,
              adminDbManage,
              sellerApprovalQueue,
              productApprovalQueue,
              settlementPreview,
              htmlInspectorEnabled,
              setHtmlInspectorEnabled,
              adminDecideSeller,
              adminDecideProduct,
              accountPrivate,
              setAccountPrivate
            }
          ),
          isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact company-mail-admin-shortcut", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "split-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "회사메일 숨김 화면" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "관리자 계정만 열 수 있는 내부 메일 화면 미리보기입니다." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: openCompanyMailPreview, children: "열기" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "muted-mini", children: [
              "미리보기 경로: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "#corp-mail-admin" }),
              " · 실제 숨김 도메인은 추후 별도 연결"
            ] })
          ] }) : null
        ] }) : null
      ] }) : null,
      showBaseTabContent && !blockedByIdentity && requiresAdultGate ? /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "tab-pane fill-pane adult-gate-pane", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "adult-gate-card stack-gap compact-scroll-list", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-head compact-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "성인 인증 필요" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            activeTab,
            " 화면은 최초 1회 성인 인증 완료 후 지속 이용 가능하도록 설계했습니다. 홈 또는 쇼핑 중 하나에서 인증이 완료되면 두 화면 모두 접근 가능합니다."
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-grid three auth-option-grid signup-auth-option-grid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "성인 인증 안내" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "회원가입 시 PASS/휴대폰 본인확인 완료 후 계정을 생성하고, 성인 회원은 홈 또는 쇼핑 최초 접근 시 1회 추가 성인인증을 진행합니다. 카카오는 로그인 편의 수단으로만 사용합니다." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setAdultPromptOpen(true), children: "성인인증 필요 모달 보기" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "PASS/휴대폰 본인확인 시작" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "실서비스에서는 외부 본인인증 SDK를 호출하고, 현재 데모에서는 흐름만 검증합니다." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => attemptAdultVerification("success"), children: "PASS/휴대폰 인증 성공" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => attemptAdultVerification("fail"), children: "인증 실패" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "차단 / 재시도 상태" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "실패 ",
              adultFailCount,
              "회 · ",
              adultCooldownRemainMinutes > 0 ? `${adultCooldownRemainMinutes}분 후 재시도 가능` : "현재 재시도 가능"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => attemptAdultVerification("minor"), children: "미성년 차단 화면 확인" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact auth-summary-box", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: adultGateView === "success" ? "인증 완료 화면" : adultGateView === "minor" ? "미성년자 차단 화면" : adultGateView === "failed" ? "인증 실패 / 재시도 화면" : "성인 인증 안내 화면" }),
          adultGateView === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "성인 인증이 완료되었습니다. 이제 홈과 쇼핑 모두 지속적으로 접근할 수 있습니다." }) : null,
          adultGateView === "minor" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "청소년 판정 계정은 로그인 및 서비스 접속이 차단됩니다. 최소 식별값과 차단 이력만 분쟁 대응 범위에서 일정 기간 보관합니다. 본인확인 결과에 따라 이용이 제한될 수 있습니다." }) : null,
          adultGateView === "failed" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "성인 인증에 실패했습니다. 1시간 이내 최대 5회 재시도 가능하며, 기준 횟수 초과 시 1시간 단위 쿨타임을 적용합니다." }) : null,
          adultGateView === "intro" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "현재 로그인 수단은 ",
            demoLoginProvider,
            "이며, 성인 기능 접근 시 1회 추가 PASS/휴대폰 본인확인을 진행하는 구조입니다."
          ] }) : null
        ] })
      ] }) }) : null,
      showAppTabContent && activeTab === "홈" ? /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: `tab-pane fill-pane home-feed-pane${homeTab === "쇼츠" ? " home-feed-pane-shorts" : ""}${homeTab === "피드" ? " home-feed-pane-feed-scroll" : ""}${homeTab === "피드" && homeFeedHeaderHidden ? " home-feed-pane-feed-scroll-collapsed" : ""}`, children: homeTab === "피드" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `chat-toolbar kakao-toolbar compact-only-toolbar feed-compose-launch-toolbar${homeFeedHeaderHidden ? " feed-compose-launch-toolbar-hidden" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-filter-tabs", role: "tablist", "aria-label": "피드 보기 필터", children: ["일반", "추천", "팔로잉"].map((filter) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: `feed-filter-tab ${homeFeedFilter === filter ? "active" : ""}`,
            onClick: () => setHomeFeedFilter(filter),
            role: "tab",
            "aria-selected": homeFeedFilter === filter,
            children: filter
          },
          filter
        )) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `feed-refresh-slot${homeFeedRefreshing ? " refreshing" : ""}${homeFeedPullDistance >= HOME_FEED_PULL_TRIGGER ? " armed" : ""}`, style: homeFeedRefreshing ? void 0 : { height: homeFeedPullDistance ? `${homeFeedPullDistance}px` : "0px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-refresh-indicator", "aria-live": "polite", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-refresh-spinner", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: homeFeedRefreshing ? "새 피드를 불러오는 중" : homeFeedPullDistance >= HOME_FEED_PULL_TRIGGER ? "놓으면 새 피드를 불러옵니다" : "당겨서 새 피드 보기" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            ref: homeFeedScrollRef,
            className: `feed-post-list compact-scroll-list feed-post-list-stream${homeFeedHeaderHidden ? " feed-post-list-stream-collapsed" : ""}`,
            onScroll: handleHomeFeedScroll,
            onTouchStart: handleHomeFeedPullStart,
            onTouchMove: handleHomeFeedPullMove,
            onTouchEnd: handleHomeFeedPullEnd,
            onTouchCancel: handleHomeFeedPullEnd,
            children: homeFeedSource.map((item) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-stream-item", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                FeedPoster,
                {
                  item,
                  onAsk: openAskFromFeed,
                  saved: savedFeedIds.includes(item.id),
                  liked: likedFeedIds.includes(item.id),
                  reposted: repostedFeedIds.includes(item.id),
                  commentsOpen: (openFeedCommentItem == null ? void 0 : openFeedCommentItem.id) === item.id,
                  commentCount: ((_a2 = feedCommentMap[item.id]) == null ? void 0 : _a2.length) ?? item.comments,
                  onOpenComments: openFeedComments,
                  onToggleLike: toggleLikedFeed,
                  onToggleRepost: toggleRepostedFeed,
                  onToggleSave: toggleSavedFeed,
                  onShare: shareFeedItem,
                  keywordTags: getContentKeywordTags(item),
                  onOpenAuthorProfile: openProfileFromAuthor,
                  onPreviewAuthorAvatar: openFeedAvatarPreview,
                  following: followedFeedAuthors.includes(item.author),
                  onToggleFollow: toggleFollowedFeedAuthor
                }
              ) }, `feed-wrap-${item.id}`);
            })
          }
        )
      ] }) : homeTab === "쇼츠" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "creator-launch-strip creator-launch-strip-shorts", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "쇼츠 업로드" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "즐겨찾기 영역 위에서 바로 쇼츠 영상을 선택할 수 있습니다." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "creator-launch-btn", children: [
            "쇼츠 올리기",
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "video/*", hidden: true, onChange: (event) => {
              var _a2, _b2;
              const fileName = (_b2 = (_a2 = event.target.files) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.name;
              if (fileName) window.alert(`쇼츠 업로드 준비: ${fileName}`);
              event.currentTarget.value = "";
            } })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-list-wrap compact-scroll-list", onScroll: handleShortsScroll, children: [
          pagedShorts.length ? pagedShorts.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ShortsListCard,
            {
              item,
              onOpenMore: setShortsMoreItem,
              onOpenViewer: openShortsViewer
            },
            `short-${item.id}`
          )) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "표시할 쇼츠가 없습니다." }) }),
          pagedShorts.length < shortsFeedItems.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-loading-row", children: "쇼츠 10개 단위로 추가 로딩 중" }) : null
        ] }),
        shortsViewerItemId !== null ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          ShortsViewer,
          {
            items: shortsFeedItems,
            initialIndex: shortsViewerInitialIndex,
            onClose: () => setShortsViewerItemId(null),
            onOpenMore: setShortsMoreItem,
            getKeywordTags: getContentKeywordTags,
            onOpenAuthorProfile: openProfileFromAuthor,
            onPreviewAuthorAvatar: openFeedAvatarPreview,
            followedAuthors: followedFeedAuthors,
            onToggleFollow: toggleFollowedFeedAuthor
          }
        ) : null
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "saved-home-pane home-feed-pane home-feed-pane-feed-scroll", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-toolbar kakao-toolbar compact-only-toolbar feed-compose-launch-toolbar saved-home-favorites-toolbar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-category-scroll", role: "tablist", "aria-label": "보관함 보기 필터", children: ["피드", "쇼츠"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `category-chip ${savedTab === tab ? "active" : ""}`, onClick: () => setSavedTab(tab), role: "tab", "aria-selected": savedTab === tab, children: tab }, tab)) }) }),
        savedTab === "피드" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-post-list compact-scroll-list feed-post-list-stream saved-home-feed-list", children: savedFeedItems.length ? savedFeedItems.map((item) => {
          var _a2;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-stream-item", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedPoster, { item, onAsk: openAskFromFeed, saved: true, liked: likedFeedIds.includes(item.id), reposted: repostedFeedIds.includes(item.id), commentsOpen: (openFeedCommentItem == null ? void 0 : openFeedCommentItem.id) === item.id, commentCount: ((_a2 = feedCommentMap[item.id]) == null ? void 0 : _a2.length) ?? item.comments, onOpenComments: openFeedComments, onToggleLike: toggleLikedFeed, onToggleRepost: toggleRepostedFeed, onToggleSave: toggleSavedFeed, onShare: shareFeedItem, keywordTags: getContentKeywordTags(item), onOpenAuthorProfile: openProfileFromAuthor, onPreviewAuthorAvatar: openFeedAvatarPreview, following: followedFeedAuthors.includes(item.author), onToggleFollow: toggleFollowedFeedAuthor }) }, `saved-feed-wrap-${item.id}`);
        }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact saved-home-empty-box", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "보관한 피드가 없습니다." }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-list-wrap compact-scroll-list saved-home-shorts-list", onScroll: handleShortsScroll, children: savedShortItems.length ? savedShortItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ShortsListCard,
            {
              item,
              onOpenMore: setShortsMoreItem,
              onOpenViewer: (target) => setSavedShortsViewerItemId(target.id)
            },
            `saved-short-${item.id}`
          )) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact saved-home-empty-box", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "보관한 쇼츠가 없습니다." }) }) }),
          savedShortsViewerItemId !== null ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            ShortsViewer,
            {
              items: savedShortItems,
              initialIndex: savedShortsViewerInitialIndex,
              onClose: () => setSavedShortsViewerItemId(null),
              onOpenMore: setShortsMoreItem,
              getKeywordTags: getContentKeywordTags,
              onOpenAuthorProfile: openProfileFromAuthor,
              onPreviewAuthorAvatar: openFeedAvatarPreview,
              followedAuthors: followedFeedAuthors,
              onToggleFollow: toggleFollowedFeedAuthor
            }
          ) : null
        ] })
      ] }) }) : null,
      showAppTabContent && activeTab === "쇼핑" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: shoppingTab === "홈" ? "compact-scroll-list shop-home-feed-pane shop-home-pane-root" : "tab-pane fill-pane", children: [
        shoppingTab === "홈" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-home-home-shell", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-home-top-stack", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "shop-home-hero-carousel",
                "aria-label": "쇼핑 홈 배너",
                onPointerDown: handleShopHomeBannerPointerDown,
                onPointerMove: handleShopHomeBannerPointerMove,
                onPointerUp: finishShopHomeBannerDrag,
                onPointerCancel: finishShopHomeBannerDrag,
                onPointerLeave: finishShopHomeBannerDrag,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-home-hero-track", style: { transform: `translateX(calc(-${shopHomeBannerIndex * 100}% + ${shopHomeBannerDragOffset}px))`, transition: shopHomeBannerPointerActiveRef.current ? "none" : void 0 }, children: shopHomeHeroSlides.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      className: "shop-home-hero-slide",
                      onClick: () => {
                        openProductDetail(item.id);
                      },
                      children: [
                        item.thumbnailUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.thumbnailUrl, alt: item.name, className: "shop-home-hero-image" }) : null,
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `shop-home-hero-placeholder hero-tone-${index % 3 + 1}` }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-home-hero-copy", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.category }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.name }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.subtitle || item.badge })
                        ] })
                      ]
                    },
                    `hero-${item.id}-${index}`
                  )) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-home-hero-dots", children: shopHomeHeroSlides.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      className: `shop-home-hero-dot ${index === shopHomeBannerIndex ? "active" : ""}`,
                      onClick: () => setShopHomeBannerIndex(index),
                      "aria-label": `${index + 1}번 배너 보기`
                    },
                    `dot-${item.id}-${index}`
                  )) })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-toolbar kakao-toolbar compact-only-toolbar feed-compose-launch-toolbar shop-home-sort-toolbar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-filter-tabs", role: "tablist", "aria-label": "쇼핑 홈 즐겨찾기 필터", children: SHOP_HOME_SORT_TABS.map((filter) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: `feed-filter-tab ${shopHomeSort === filter ? "active" : ""}`,
                onClick: () => setShopHomeSort(filter),
                role: "tab",
                "aria-selected": shopHomeSort === filter,
                children: filter
              },
              `shop-home-sort-${filter}`
            )) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: shopHomeGridScrollRef, className: `shop-home-product-grid-scroll compact-scroll-list ${shopHomeGridDragging ? "dragging" : ""}`, onScroll: handleShopHomeScroll, onPointerDown: handleShopHomeGridPointerDown, onPointerMove: handleShopHomeGridPointerMove, onPointerUp: finishShopHomeGridPointerDrag, onPointerCancel: finishShopHomeGridPointerDrag, onPointerLeave: finishShopHomeGridPointerDrag, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-home-product-grid", children: shopHomeFeedItems.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "article",
              {
                className: "shop-home-product-card",
                role: "button",
                tabIndex: 0,
                onClick: () => handleShopHomeProductCardClick(product.id),
                onKeyDown: (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleShopHomeProductCardClick(product.id);
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-home-product-thumb", children: [
                    product.thumbnailUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.thumbnailUrl, alt: product.name, className: "shop-home-product-thumb-image" }) : null,
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `shop-home-product-thumb-placeholder hero-tone-${product.feedIndex % 3 + 1}` }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shop-home-product-badge", children: product.badge }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        className: `shop-home-product-heart ${cartItems.some((item) => item.productId === product.id) ? "active" : ""}`,
                        "aria-label": "장바구니 담기",
                        onClick: (event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleProductCartFavorite(product.id);
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeartIcon, { filled: cartItems.some((item) => item.productId === product.id) })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-home-product-meta", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: product.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-home-product-stats", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "리뷰 ",
                        product.reviewCount ?? 0
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "구매 ",
                        product.orderCount ?? 0
                      ] })
                    ] })
                  ] })
                ]
              },
              `shop-feed-${product.id}-${product.feedIndex}`
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-loading-row shop-home-loading-row", children: "상품을 계속 불러오는 중" })
          ] })
        ] }) : null,
        shoppingTab === "목록" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-head compact-head shop-list-head", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-tools slim-tools", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: shopKeyword, onChange: (e) => setShopKeyword(e.target.value), placeholder: "검색" }) }) }),
          reconsentWriteRestricted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "유예기간 없이 최신 필수 문서 재동의가 필요합니다. 먼저 필수 문서 안내 화면에서 재동의 정보를 확인한 뒤 주문·문의·상품등록 같은 쓰기 기능을 진행하세요." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "copy-action-row", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => {
              setHomeShopConsentGuideSeen(true);
              setOverlayMode("reconsent_info");
            }, children: "필수 문서 안내 열기" }) })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "content-grid product-grid compact-scroll-list shop-list-grid-only", children: allShopItems.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "product-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "product-thumb" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "product-badge", children: product.badge }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: product.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: product.subtitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "product-meta", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: product.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: product.price })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "product-submeta", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "배송비 ₩3,000" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "재고 ",
                product.stock_qty ?? 12,
                "개"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "product-card-actions", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => addToCart(product.id), children: "장바구니 담기" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => openProductDetail(product.id), children: "상세보기" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `ghost-btn ${cartItems.some((item) => item.productId === product.id) ? "active" : ""}`, onClick: () => toggleProductCartFavorite(product.id), children: cartItems.some((item) => item.productId === product.id) ? "좋아요 취소" : "좋아요" })
            ] })
          ] }, product.id)) })
        ] }) : null,
        shoppingTab === "상품" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-product-detail-page compact-scroll-list", children: productDetail ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-topbar shop-product-detail-topbar-coupang", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn topbar-search-back", onClick: () => {
              setProductDetail(null);
              setSelectedProductId(null);
              setShoppingTab("홈");
            }, "aria-label": "뒤로가기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-product-detail-topbar-title", children: "상품 상세" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `header-inline-btn header-icon-btn ${cartItems.some((item) => item.productId === productDetail.product.id) ? "active" : ""}`, onClick: () => toggleProductCartFavorite(productDetail.product.id), "aria-label": "좋아요", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeartIcon, { filled: cartItems.some((item) => item.productId === productDetail.product.id) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "shop-product-detail-hero", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-gallery", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-image-frame", children: [
                productDetailCurrentImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: productDetailCurrentImage, alt: productDetail.product.name, className: "shop-product-detail-image" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-product-detail-image-placeholder", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: (productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.category) ?? "SHOP" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-image-badges", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shop-product-detail-pill accent", children: (productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.badge) ?? "판매중" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shop-product-detail-pill", children: "성인 전용" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-image-count", children: [
                  Math.min(productDetailMediaIndex + 1, Math.max(productDetailImageUrls.length, 1)),
                  "/",
                  Math.max(productDetailImageUrls.length, 1)
                ] })
              ] }),
              productDetailImageUrls.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-product-detail-thumb-row", children: productDetailImageUrls.map((imageUrl, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: `shop-product-detail-thumb ${index === productDetailMediaIndex ? "active" : ""}`,
                  onClick: () => setProductDetailMediaIndex(index),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: imageUrl, alt: `${productDetail.product.name} 썸네일 ${index + 1}` })
                },
                `${imageUrl}-${index}`
              )) }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-summary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-brand-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shop-product-detail-brand", children: ((_f = productDetail.seller_contact) == null ? void 0 : _f.business_name) || ((_g = productDetail.seller_contact) == null ? void 0 : _g.name) || disclosedBusinessInfo.operatorName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shop-product-detail-rating", children: [
                  "★ ",
                  productDetailRating.toFixed(1),
                  " (",
                  Number((productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.reviewCount) ?? 0).toLocaleString(),
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: productDetail.product.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "shop-product-detail-subtitle", children: productDetail.product.description || (productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.subtitle) || "상품 상세 설명을 준비 중입니다." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-price-panel", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shop-product-price-label", children: "판매가" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: `₩${productDetailPriceValue.toLocaleString()}` })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-price-side", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "배송비 ",
                    `₩${productDetailShippingValue.toLocaleString()}`
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: Number(productDetail.product.stock_qty || 0) > 0 ? `재고 ${Number(productDetail.product.stock_qty || 0)}개` : "품절" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-meta-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shop-product-detail-meta-chip", children: [
                  "카테고리 · ",
                  (productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.category) ?? "기타"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shop-product-detail-meta-chip", children: [
                  "최근 주문 ",
                  Number((productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.orderCount) ?? 0).toLocaleString()
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shop-product-detail-meta-chip", children: [
                  "재구매 ",
                  Number((productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.repurchaseCount) ?? 0).toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-picker-block", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-section-title-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "종류 선택" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selectedProductOption || productDetailOptionChips[0] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-product-detail-option-grid", children: productDetailOptionChips.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: `shop-product-detail-option-chip ${selectedProductOption === option ? "active" : ""}`,
                    onClick: () => setSelectedProductOption(option),
                    children: option
                  },
                  option
                )) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-picker-block", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-section-title-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "수량 선택" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    productDetailQuantity,
                    "개"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-qty-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "shop-product-qty-btn", onClick: () => setProductDetailQuantity((prev) => Math.max(1, prev - 1)), children: "-" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-product-qty-value", children: productDetailQuantity }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "shop-product-qty-btn", onClick: () => setProductDetailQuantity((prev) => Math.min(99, prev + 1)), children: "+" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-total-box", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "총 상품금액" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: `₩${productDetailTotalAmount.toLocaleString()}` })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  selectedProductOption || productDetailOptionChips[0],
                  " / ",
                  productDetailQuantity,
                  "개 / 배송비 포함"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-cta-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `ghost-btn shop-detail-secondary-btn ${cartItems.some((item) => item.productId === productDetail.product.id) ? "active" : ""}`, onClick: () => toggleProductCartFavorite(productDetail.product.id), children: cartItems.some((item) => item.productId === productDetail.product.id) ? "좋아요 취소" : "좋아요" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn shop-detail-secondary-btn", onClick: addSelectedProductToCart, children: "장바구니" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "shop-detail-primary-btn", onClick: createOrderForSelectedProduct, children: "바로구매" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "shop-product-detail-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "shop-product-detail-section-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-section-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "상품 상세" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "쿠팡형 본문 영역" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-story-block", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-story-hero", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: (productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.category) ?? "SHOP" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: productDetail.product.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: productDetail.product.description || "상세 설명 준비중" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-story-copy", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "기본 사용 흐름과 보관 편의성을 중심으로 구성된 상품입니다. 첫 구매자도 이해하기 쉬운 형태로 제품 안내와 주문 동선을 단순화했습니다." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "상세 화면은 상단 핵심 구매 정보 이후, 상품 설명 · 배송/교환 · 판매자 정보 순으로 이어지도록 구성해 실제 이커머스 상세 구조처럼 보이도록 정리했습니다." })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "shop-product-detail-section-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-section-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "기본 정보" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "필수 구매 정보" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-grid", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "카테고리" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: (productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.category) ?? "기타" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "옵션" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selectedProductOption || productDetailOptionChips[0] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "배송비" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `₩${productDetailShippingValue.toLocaleString()}` })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "재고" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: Number(productDetail.product.stock_qty || 0) > 0 ? `${Number(productDetail.product.stock_qty || 0)}개` : "품절" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "접근상태" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: (adultGateStatus == null ? void 0 : adultGateStatus.allowed_to_shop) ? "쇼핑 가능" : (adultGateStatus == null ? void 0 : adultGateStatus.member_status) || "미확인" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "후기" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    Number((productDetailDisplayItem == null ? void 0 : productDetailDisplayItem.reviewCount) ?? 0).toLocaleString(),
                    "개"
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "shop-product-detail-section-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-section-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "배송 / 교환 / 환불" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "구매 전 안내" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-policy-list", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-policy-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "배송안내" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "결제 완료 후 순차 발송 · 기본 배송비 ",
                    `₩${productDetailShippingValue.toLocaleString()}`
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-policy-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "교환/반품" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "최소 ",
                    ((_h = productDetail.site_ready) == null ? void 0 : _h.minimum_refund_window_days) || 7,
                    "일 정책 적용"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-policy-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "상품표시" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    ((_i = productDetail.site_ready) == null ? void 0 : _i.adult_only_label) || "성인용품",
                    " 명시"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-policy-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "구매버튼" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ((_j = productDetail.site_ready) == null ? void 0 : _j.purchase_button_visible) ? "노출 중" : "노출 준비중" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "shop-product-detail-section-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-section-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "판매자 정보" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "고객센터 / 사업자 정보" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-grid", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "상호명" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ((_k = productDetail.seller_contact) == null ? void 0 : _k.business_name) || ((_l = productDetail.seller_contact) == null ? void 0 : _l.name) || disclosedBusinessInfo.operatorName })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "사업자번호" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ((_m = productDetail.seller_contact) == null ? void 0 : _m.business_registration_no) || disclosedBusinessInfo.registrationNo })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "CS 연락처" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ((_n = productDetail.seller_contact) == null ? void 0 : _n.cs_contact) || disclosedBusinessInfo.phone })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "문의 이메일" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ((_o = productDetail.seller_contact) == null ? void 0 : _o.support_email) || disclosedBusinessInfo.email })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-row wide", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "사업장 주소" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ((_p = productDetail.seller_contact) == null ? void 0 : _p.business_address) || disclosedBusinessInfo.address })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-spec-row wide", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "반품 주소" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ((_q = productDetail.seller_contact) == null ? void 0 : _q.return_address) || disclosedBusinessInfo.address })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "shop-product-detail-section-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-section-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "주문 / 결제 테스트" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "현재 프로젝트 기능 유지" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-product-detail-cta-row shop-product-detail-cta-row-inline", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn shop-detail-secondary-btn", onClick: verifyAdultSelf, children: "성인인증 진행" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn shop-detail-secondary-btn", onClick: () => launchVerotelCheckout(), children: "중립 결제 테스트" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "shop-detail-primary-btn", onClick: () => setShoppingTab("주문"), children: "주문 탭 열기" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini shop-product-detail-note", children: "미성년자는 쇼핑과 결제가 차단됩니다. PASS 실연동 전에는 자체 성인 확인으로 QA 가능합니다." })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "상품을 선택하면 상세 정보가 표시됩니다." }) }) }) : null,
        shoppingTab === "주문" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap compact-scroll-list", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-grid three", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "주문 진행" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "주문 ",
                orders.length,
                "건 · 결제대기 ",
                orders.filter((item) => item.status === "payment_pending").length,
                "건 · 결제완료 ",
                orders.filter((item) => item.status === "paid").length,
                "건"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "흐름: 장바구니 → 주문서 작성 → 결제 요청 → 결제 완료 → 주문 확인" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "취소/환불 검증" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "부분 처리 금액 입력값: ₩",
                Number(orderActionAmount || "0").toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "webhook 점검" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "서명 점검 API와 주문 상태머신을 한 화면에서 검증합니다." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-grid three", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "레저 요약" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "주문 ",
                ((_r = ledgerOverview == null ? void 0 : ledgerOverview.orders) == null ? void 0 : _r.count) ?? 0,
                "건 · 총 거래액 ₩",
                Number(((_s = ledgerOverview == null ? void 0 : ledgerOverview.orders) == null ? void 0 : _s.gross) ?? 0).toLocaleString()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "거래 ",
                ((_t = ledgerOverview == null ? void 0 : ledgerOverview.transactions) == null ? void 0 : _t.count) ?? 0,
                "건 · 결제 ₩",
                Number(((_u = ledgerOverview == null ? void 0 : ledgerOverview.transactions) == null ? void 0 : _u.paid) ?? 0).toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "판매자 정산" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "정산 ",
                ((_v = ledgerOverview == null ? void 0 : ledgerOverview.settlements) == null ? void 0 : _v.count) ?? 0,
                "건 · 지급예정 ₩",
                Number(((_w = ledgerOverview == null ? void 0 : ledgerOverview.settlements) == null ? void 0 : _w.net) ?? 0).toLocaleString()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "수수료 합계 ₩",
                Number(((_x = ledgerOverview == null ? void 0 : ledgerOverview.settlements) == null ? void 0 : _x.fee) ?? 0).toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "심사용 webhook" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: ((_y = ledgerOverview == null ? void 0 : ledgerOverview.webhook) == null ? void 0 : _y.path) ?? "/api/webhook/payment" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                ((_z = ledgerOverview == null ? void 0 : ledgerOverview.webhook) == null ? void 0 : _z.signature) ?? "HMAC-SHA256",
                " · idem ",
                String(Boolean(((_A = ledgerOverview == null ? void 0 : ledgerOverview.webhook) == null ? void 0 : _A.idempotent) ?? true))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "결제 테스트 센터" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-form-grid", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "부분취소/부분환불 금액" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: orderActionAmount, onChange: (e) => setOrderActionAmount(e.target.value.replace(/[^0-9]/g, "")), placeholder: "5500" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "API Base" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: getApiBase(), readOnly: true })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "product-card-actions", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: confirmSelectedOrder, children: "선택 주문 결제승인" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => launchVerotelCheckout(), children: "중립 결제창 열기" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => cancelSelectedOrder(false), children: "선택 주문 전체취소" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => cancelSelectedOrder(true), children: "선택 주문 부분취소" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => refundSelectedOrder(false), children: "선택 주문 전체환불" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => refundSelectedOrder(true), children: "선택 주문 부분환불" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: runWebhookSignatureTest, children: "webhook 점검" })
            ] }),
            selectedOrderNo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "muted-mini", children: [
              "현재 테스트 대상 주문: ",
              selectedOrderNo
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini", children: "주문 목록에서 테스트할 주문을 먼저 선택하세요." }),
            orderMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini", children: orderMessage }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "선택 주문 상세 / 결제 스냅샷" }),
            orderDetail ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "consent-record-list", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "simple-list-row multi-line", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: orderDetail.order.order_no }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "상태 ",
                  orderDetail.order.status,
                  " · 결제수단 ",
                  orderDetail.order.payment_method,
                  " · PG ",
                  orderDetail.order.payment_pg
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "총액 ₩",
                  Number(orderDetail.order.total_amount || 0).toLocaleString(),
                  " · 공급가 ₩",
                  Number(orderDetail.order.supply_amount || 0).toLocaleString(),
                  " · VAT ₩",
                  Number(orderDetail.order.vat_amount || 0).toLocaleString()
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "simple-list-row multi-line", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "금액 스냅샷" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "결제 ₩",
                  Number(((_B = orderDetail.amount_snapshot) == null ? void 0 : _B.paid_amount) || 0).toLocaleString(),
                  " · 취소 ₩",
                  Number(((_C = orderDetail.amount_snapshot) == null ? void 0 : _C.cancelled_amount) || 0).toLocaleString(),
                  " · 환불 ₩",
                  Number(((_D = orderDetail.amount_snapshot) == null ? void 0 : _D.refunded_amount) || 0).toLocaleString(),
                  " · 잔액 ₩",
                  Number(((_E = orderDetail.amount_snapshot) == null ? void 0 : _E.remaining) || 0).toLocaleString()
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "simple-list-row multi-line", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "결제 레코드" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "confirmed ",
                  String(Boolean((_F = orderDetail.payment_record) == null ? void 0 : _F.confirmed)),
                  " · payment_id ",
                  String(((_G = orderDetail.payment_record) == null ? void 0 : _G.payment_id) || "-"),
                  " · latest ",
                  String(((_H = orderDetail.payment_record) == null ? void 0 : _H.latest_status) || "-")
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "simple-list-row multi-line", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "주문 품목" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: orderDetail.items.map((item) => `${item.sku_code || item.product_id} x${item.qty}`).join(" · ") || "없음" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "simple-list-row multi-line", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "결제 이력" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: (((_I = orderDetail.payment_record) == null ? void 0 : _I.history) || []).length ? (((_J = orderDetail.payment_record) == null ? void 0 : _J.history) || []).map((item) => String(item.action || "-")).join(" → ") : "이력 없음" })
              ] }) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "선택한 주문의 상세 정보가 여기에 표시됩니다." })
          ] }),
          checkoutSelectedOrder ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact legal-disclosure-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "5. 주문 확인" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "주문번호: ",
              checkoutSelectedOrder.order_no
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "결제금액: ₩",
              Number(checkoutSelectedOrder.total_amount || 0).toLocaleString()
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "상품 목록: ",
              ((_K = orderDetail == null ? void 0 : orderDetail.items) == null ? void 0 : _K.length) ? orderDetail.items.map((item) => `${item.sku_code || item.product_id} x${item.qty}`).join(" · ") : `${checkoutSelectedOrder.item_count}건`
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "결제상태: ",
              checkoutSelectedOrder.status
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "정산방식: 플랫폼 수취 후 판매자 재정산" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "product-card-actions", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCheckoutStage("order_confirm"), children: "주문 확인 보기" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setShoppingTab("바구니"), children: "장바구니로" })
            ] })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "최근 주문" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-list", children: orders.length ? orders.slice().reverse().map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "chat-row simple-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-circle", children: String(index + 1).padStart(2, "0") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-copy", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.order_no }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "총액 ₩",
                  Number(item.total_amount || 0).toLocaleString(),
                  " · PG ",
                  item.payment_pg
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "상태 ",
                  item.status,
                  " · 정산 ",
                  item.settlement_status,
                  " · 품목 ",
                  item.item_count,
                  "건"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-meta", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.payment_method }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: item.status }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => selectOrderForTesting(item.order_no), children: "주문선택" })
              ] })
            ] }, item.order_no)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "로그인 후 주문을 생성하면 이곳에 표시됩니다." }) })
          ] })
        ] }) : null,
        shoppingTab === "바구니" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "saved-home-pane home-feed-pane home-feed-pane-feed-scroll shop-cart-pane", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-toolbar kakao-toolbar compact-only-toolbar feed-compose-launch-toolbar saved-home-favorites-toolbar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-category-scroll", role: "tablist", "aria-label": "장바구니 보기 필터", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "category-chip active", role: "tab", "aria-selected": true, children: ["담은 상품 ", cartDetailedItems.length] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-cart-list compact-scroll-list", children: cartDetailedItems.length ? cartDetailedItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "shop-cart-item-card", role: "button", tabIndex: 0, onClick: () => openProductDetail(item.product.id), onKeyDown: (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openProductDetail(item.product.id);
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shop-cart-item-thumb-wrap", children: item.product.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.product.thumbnail_url, alt: item.product.name, className: "shop-cart-item-thumb" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `shop-cart-item-thumb shop-cart-item-thumb-placeholder hero-tone-${item.product.id % 3 + 1}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.product.category || "SHOP" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-cart-item-body", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-cart-item-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.product.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [item.product.category, " · 배송비 ₩", Number(item.product.shipping_fee || 0).toLocaleString()] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "shop-cart-remove-btn", onClick: (event) => {
                  event.stopPropagation();
                  removeCartItem(item.productId);
                }, "aria-label": "장바구니에서 삭제", children: "삭제" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-cart-item-foot", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-cart-qty-control", onClick: (event) => event.stopPropagation(), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => updateCartItemQuantity(item.productId, -1), children: "-" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.qty }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => updateCartItemQuantity(item.productId, 1), children: "+" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { children: ["₩", (Number(item.product.price || 0) * item.qty).toLocaleString()] })
              ] })
            ] })
          ] }, item.productId)) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact saved-home-empty-box", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "장바구니에 담긴 상품이 없습니다." }) }) }),
          orderMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini", children: orderMessage }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-cart-summary-bar", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "총 결제 예정" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: `₩${cartTotalAmount.toLocaleString()}` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shop-cart-summary-actions", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setShoppingTab("목록"), children: "쇼핑 계속" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                setCheckoutStage("payment_request");
                createOrderFromCart();
              }, disabled: !cartDetailedItems.length, children: "주문하기" })
            ] })
          ] })
        ] }) : null
      ] }) : null,
      shoppingTab === "사업자인증" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap compact-scroll-list", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-head compact-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "사업자인증" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "사업자 미인증 계정은 먼저 인증 정보를 등록한 뒤 관리자 승인 또는 관리자 예외 기준에 따라 상품등록으로 이동합니다." })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-grid two-col compact-grid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "인증 진행 상태" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: isAdmin ? "관리자 계정은 사업자 인증 없이도 테스트용 상품등록이 가능합니다." : sellerVerification.status === "approved" ? "관리자 승인 완료 · 상품등록 가능" : sellerVerification.status === "pending" ? "승인 대기 중 · 관리자 승인 후 상품등록 가능" : "신청 전 · 아래 입력칸을 채운 뒤 사업자 인증을 신청해주세요." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "필수 입력: 상호/법인명, 대표자명, 사업자번호, 통신판매업 신고번호, CS, 반품지, 정산계좌, 청소년보호책임자, 취급 카테고리" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "진행 안내" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "consent-record-list", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "1단계" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "사업자등록 정보와 정산계좌를 입력합니다." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "2단계" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "사업자 인증 신청을 제출하면 관리자 승인 대기 상태로 전환됩니다." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "3단계" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "승인 완료 후 상단바의 상품등록 탭에서 상품을 등록합니다." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "관리자" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "관리자 계정은 별도 인증 없이 바로 상품등록 테스트가 가능합니다." })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "사업자 인증 등록/수정" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-form-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "상호/법인명" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.companyName, onChange: (e) => setSellerVerification((prev) => ({ ...prev, companyName: e.target.value })), placeholder: "상호 또는 법인명" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "대표자명" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.representativeName, onChange: (e) => setSellerVerification((prev) => ({ ...prev, representativeName: e.target.value })), placeholder: "대표자명" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "사업자등록번호" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.businessNumber, onChange: (e) => setSellerVerification((prev) => ({ ...prev, businessNumber: e.target.value })), placeholder: "123-45-67890" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "통신판매업 신고번호" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.ecommerceNumber, onChange: (e) => setSellerVerification((prev) => ({ ...prev, ecommerceNumber: e.target.value })), placeholder: "제 2026-서울-0000호" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wide", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "사업장 주소" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.businessAddress, onChange: (e) => setSellerVerification((prev) => ({ ...prev, businessAddress: e.target.value })), placeholder: "사업장 주소" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "CS 연락처" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.csContact, onChange: (e) => setSellerVerification((prev) => ({ ...prev, csContact: e.target.value })), placeholder: "010-0000-0000" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wide", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "반품 주소" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.returnAddress, onChange: (e) => setSellerVerification((prev) => ({ ...prev, returnAddress: e.target.value })), placeholder: "반품 수령 주소" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "청소년보호책임자" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.youthProtectionOfficer, onChange: (e) => setSellerVerification((prev) => ({ ...prev, youthProtectionOfficer: e.target.value })), placeholder: "담당자명" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "정산 은행" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.settlementBank, onChange: (e) => setSellerVerification((prev) => ({ ...prev, settlementBank: e.target.value })), placeholder: "은행명" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "정산 계좌번호" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.settlementAccountNumber, onChange: (e) => setSellerVerification((prev) => ({ ...prev, settlementAccountNumber: e.target.value })), placeholder: "계좌번호" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "예금주명" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.settlementAccountHolder, onChange: (e) => setSellerVerification((prev) => ({ ...prev, settlementAccountHolder: e.target.value })), placeholder: "예금주명" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wide", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "취급 상품 카테고리" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.handledCategories, onChange: (e) => setSellerVerification((prev) => ({ ...prev, handledCategories: e.target.value })), placeholder: "위생/보관, 바디/케어, 입문 액세서리" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wide", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "사업자 등록 인증 사진 URL" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: sellerVerification.businessDocumentUrl, onChange: (e) => setSellerVerification((prev) => ({ ...prev, businessDocumentUrl: e.target.value })), placeholder: "/media/business-doc.jpg 또는 외부 저장 URL" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: submitSellerVerification, disabled: !sellerApplicationComplete || isAdmin, children: "사업자 인증 신청" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setSellerVerification((prev) => ({ ...prev, status: "approved" })), children: "데모 승인 반영" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: openProductRegistrationTab, children: "상품등록으로 이동" })
          ] }),
          isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini", children: "관리자 계정은 사업자 인증 제출 없이 바로 상품등록 테스트를 진행할 수 있습니다." }) : null
        ] })
      ] }) : null,
      shoppingTab === "상품등록" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap compact-scroll-list", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-head compact-head", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "상품등록" }),
          !sellerApprovalReady ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "사업자 미인증 계정은 먼저 사업자인증 탭에서 인증 신청과 승인 절차를 완료해야 합니다." }) : null
        ] }) }),
        !sellerApprovalReady ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "사업자 인증이 먼저 필요합니다" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "현재 계정은 상품등록 권한이 없습니다. 사업자등록 정보와 정산 정보를 입력한 뒤 사업자인증을 신청해주세요." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "copy-action-row", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: openBusinessVerificationTab, children: "사업자인증으로 이동" }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "상품 등록 화면" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-form-grid", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "카테고리" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: productRegistrationDraft.category, onChange: (e) => handleProductCategoryChange(e.target.value), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "카테고리 선택" }),
                  productCategoryOptions.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item, children: item }, item))
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "등록상품명" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: productRegistrationDraft.name, onChange: (e) => handleProductNameChange(e.target.value), onMouseDown: guardProductCategoryRequiredInteraction, onFocus: guardProductCategoryRequiredInteraction, placeholder: "등록상품명 입력", maxLength: 29, readOnly: !isProductCategorySelected, "aria-disabled": !isProductCategorySelected })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "판매가" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: productRegistrationDraft.price, onChange: (e) => handleProductPriceChange(e.target.value), onMouseDown: guardProductCategoryRequiredInteraction, onFocus: guardProductCategoryRequiredInteraction, placeholder: "판매가 입력", inputMode: "numeric", readOnly: !isProductCategorySelected, "aria-disabled": !isProductCategorySelected })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "재고수량" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: productRegistrationDraft.stockQty, onChange: (e) => handleProductStockQtyChange(e.target.value), onMouseDown: guardProductCategoryRequiredInteraction, onFocus: guardProductCategoryRequiredInteraction, placeholder: "재고수량 입력", inputMode: "numeric", readOnly: !isProductCategorySelected, "aria-disabled": !isProductCategorySelected })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "상품코드(SKU)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: productRegistrationDraft.skuCode, onChange: (e) => handleProductSkuCodeChange(e.target.value), onMouseDown: guardProductCategoryRequiredInteraction, onFocus: guardProductCategoryRequiredInteraction, placeholder: "상품코드 SKU 입력", readOnly: !isProductCategorySelected, "aria-disabled": !isProductCategorySelected })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wide", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "상세 설명" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: productRegistrationDraft.description, onChange: (e) => handleProductDescriptionChange(e.target.value), onMouseDown: guardProductCategoryRequiredInteraction, onFocus: guardProductCategoryRequiredInteraction, placeholder: "상세설명 입력", readOnly: !isProductCategorySelected, "aria-disabled": !isProductCategorySelected })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wide", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isChatEmoticonCategory ? "대표 이미지 / 미리보기 이미지" : "대표 이미지 / 추가 이미지" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "photo-url-grid", children: productImageInputMeta.map((meta, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: productRegistrationDraft.imageUrls[idx] ?? "", onChange: (e) => setProductRegistrationDraft((prev) => ({ ...prev, imageUrls: prev.imageUrls.map((item, itemIdx) => itemIdx === idx ? e.target.value : item) })), placeholder: meta.placeholder, disabled: !isProductCategorySelected }, idx)) })
              ] })
            ] }),
            !productDraftReady ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini", children: "카테고리, 상품명, 가격, 개수, 상품 코드, 상품소개를 입력해야 등록할 수 있습니다. 사진 URL은 선택입니다." }) : null,
            reconsentWriteRestricted ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini", children: "유예기간 없이 최신 필수 문서 재동의가 필요합니다. 먼저 필수 문서 안내 화면에서 최신 약관과 재동의 절차를 확인하세요." }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => submitProductRegistration("draft"), disabled: !sellerApprovalReady || !productDraftReady || reconsentWriteRestricted, children: "임시저장" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => submitProductRegistration("publish"), disabled: !sellerApprovalReady || !productDraftReady || reconsentWriteRestricted, children: "상품등록" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: openBusinessVerificationTab, children: "사업자인증 수정" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "현재 상품군 / SKU 반영 기준" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "consent-record-list", children: [
              uiCategoryGroups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "simple-list-row multi-line", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: group.group }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: group.items.join(" · ") })
              ] }) }, group.group)),
              !uiCategoryGroups.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini", children: "카테고리 그룹 정보를 불러오지 못했습니다." }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-grid three compact-grid top-gap-12", children: ((skuPolicy == null ? void 0 : skuPolicy.payment_method_mapping) ?? []).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { children: [
                "등급 ",
                item.risk_grade
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "결제: ",
                item.payment_scope
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "노출: ",
                item.display_scope
              ] })
            ] }, `${item.risk_grade}-${item.payment_scope}`)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "consent-record-list top-gap-12", children: skuPolicySeed.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "simple-list-row multi-line", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: item.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.grade }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.note })
            ] }) }, `${item.category}-${item.grade}`)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "내 등록 상품 상태" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "compact-scroll-list", children: [
              sellerProducts.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row multi-line", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: item.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    item.sku_code,
                    " · ",
                    item.category
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    item.status,
                    " · ₩",
                    item.price.toLocaleString()
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "copy-action-row", children: item.status !== "approved" ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => submitProductForReview(item.id), children: "승인대기 제출" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "muted-mini", children: "공개중" }) })
              ] }, item.id)),
              !sellerProducts.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "muted-mini", children: "등록된 내 상품이 없습니다." }) : null
            ] })
          ] }),
          submittedProducts.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "임시 등록 상품" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-list", children: submittedProducts.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "chat-row simple-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-circle", children: "P" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-copy", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  item.category,
                  " · ",
                  item.skuCode
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-meta", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  item.stockQty,
                  "개"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { children: [
                  item.price,
                  "원"
                ] })
              ] })
            ] }, `${item.skuCode}-${idx}`)) })
          ] }) : null
        ] })
      ] }) : null,
      showAppTabContent && activeTab === "소통" ? /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "tab-pane fill-pane", children: communityTab === "포럼" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "community-simple-board compact-scroll-list forum-board-shell", children: activeForumRoom ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "forum-room-topbar", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn topbar-search-back", onClick: closeForumRoom, "aria-label": "포럼 목록으로 돌아가기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "forum-room-title-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: activeForumRoom.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              activeForumRoom.category,
              " · 참여 ",
              activeForumRoom.participants,
              "명"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "forum-room-message-list compact-scroll-list", children: activeForumMessages.map((message) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `forum-room-message ${message.kind}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "forum-room-message-head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: message.author }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: message.meta })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: message.text })
        ] }, message.id)) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "community-simple-category-row forum-simple-category-row", children: forumBoardCategories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: `community-simple-chip ${selectedForumCategory === category ? "active" : ""}`,
            onClick: () => setSelectedForumCategory(category),
            children: category
          },
          category
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-list forum-simple-list", children: [
          filteredForumRooms.map((room) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "community-simple-item community-simple-forum-item", onClick: () => openForumRoom(room), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-head-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-title-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-chip", children: room.category }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { title: room.title, children: room.title })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-meta-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: room.starter }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: room.latestAt })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: room.summary })
          ] }, room.id)),
          !filteredForumRooms.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "community-simple-item community-simple-item-empty", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "선택한 카테고리의 포럼방이 없습니다." }) }) : null
        ] })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        communityExplorerStage === "list" || !selectedCommunityPost ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-board compact-scroll-list", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-category-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: `community-simple-chip ${selectedCommunityCategory === "전체" ? "active" : ""}`, onClick: () => setSelectedCommunityCategory("전체"), children: "전체" }),
            communityCategories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: `community-simple-chip ${selectedCommunityCategory === category ? "active" : ""}`, onClick: () => setSelectedCommunityCategory(category), children: category }, category))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "community-simple-list", children: communityDisplayRows.map((post, index) => {
            if (!post) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "community-simple-item community-simple-item-empty", "aria-hidden": "true", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-head-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-title-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-chip community-chip-placeholder", children: "빈 칸" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: " " })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-meta-row", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: " " }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: " " })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: " " })
              ] }, `community-empty-${communityPage}-${index}`);
            }
            const parsedMeta = parseCommunityMeta(post.meta);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `community-simple-item community-simple-item-button ${post.pinned ? "community-simple-item-pinned" : ""}`, onClick: () => openCommunityPost(post), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-head-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-title-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-chip", children: post.category }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { title: post.title, children: post.title })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-meta-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: parsedMeta.author }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: parsedMeta.postedAt })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: post.summary }),
              post.path ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-post-path", children: [
                "경로: ",
                post.path
              ] }) : null
            ] }, post.id);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-pagination", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setCommunityPage((prev) => Math.max(1, prev - 1)), disabled: communityPage <= 1, children: "이전" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              communityPage,
              " / ",
              communityPageCount
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setCommunityPage((prev) => Math.min(communityPageCount, prev + 1)), disabled: communityPage >= communityPageCount, children: "다음" })
          ] })
        ] }) : null,
        communityExplorerStage === "detail" && selectedCommunityPost ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-shell compact-scroll-list", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-topbar", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn topbar-search-back", onClick: closeCommunityExplorer, "aria-label": "목록으로 돌아가기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-topbar-copy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedCommunityPost.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selectedCommunityPost.path ?? `소통 > ${selectedCommunityPost.board ?? "커뮤"}` })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "community-detail-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-head-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-title-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-chip", children: selectedCommunityPost.category }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedCommunityPost.detailTitle ?? selectedCommunityPost.title })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-meta-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: parseCommunityMeta(selectedCommunityPost.meta).author }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: parseCommunityMeta(selectedCommunityPost.meta).postedAt })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "community-detail-summary", children: selectedCommunityPost.summary }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "community-detail-body", children: (selectedCommunityPost.detailBody ?? [selectedCommunityPost.summary]).map((line, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: line }, `${selectedCommunityPost.id}-line-${index}`)) })
          ] })
        ] }) : null,
        communityExplorerStage === "test_intro" && selectedCommunityPost ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-shell compact-scroll-list", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-topbar", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn topbar-search-back", onClick: closeCommunityExplorer, "aria-label": "목록으로 돌아가기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-topbar-copy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedCommunityPost.detailTitle ?? selectedCommunityPost.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selectedCommunityPost.path ?? "소통 > 커뮤 > 테스트" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "community-detail-card community-test-intro-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-title-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-chip", children: "7점 척도" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "스스로에 대해 알아 가는 시간을 가져보세요." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "community-detail-summary", children: "합의, 역할, 규칙, 돌봄, 일상 친밀감 같은 축을 함께 확인하는 자기이해형 테스트입니다." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-test-profile-grid", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "성별" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: testProfile.gender, onChange: (event) => setTestProfile((prev) => ({ ...prev, gender: event.target.value })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "선택 안 함" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "여성" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "남성" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "기타" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "연령대" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: testProfile.ageBand, onChange: (event) => setTestProfile((prev) => ({ ...prev, ageBand: event.target.value })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "10대 후반" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "20대" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "30대" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "40대" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "50대 이상" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "테스트 목적" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: testProfile.focus, onChange: (event) => setTestProfile((prev) => ({ ...prev, focus: event.target.value })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "자기이해" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "대화준비" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "커플체크인" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-body", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "기본 ",
                testQuestionCount,
                "문항으로 먼저 진행하며, 각 문항은 전혀 아니다부터 매우 그렇다까지 7단계로 응답합니다."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "결과는 저장형 진단이 아니라 현재 기준의 성향 탐색 요약으로 보여주며, 민감한 내용은 기본 비공개 흐름으로 설계했습니다." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCommunityExplorerStage("test_run"), children: "테스트 시작" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: resetCommunityTest, children: "응답 초기화" })
            ] })
          ] })
        ] }) : null,
        communityExplorerStage === "test_run" && selectedCommunityPost ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-shell compact-scroll-list", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-topbar", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn topbar-search-back", onClick: () => setCommunityExplorerStage("test_intro"), "aria-label": "테스트 소개로 돌아가기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-topbar-copy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedCommunityPost.detailTitle ?? selectedCommunityPost.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "진행률 ",
                testAnsweredCount,
                "/",
                testQuestionCount
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "community-test-progress-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: `${testAnsweredCount / testQuestionCount * 100}%` } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "community-test-question-list", children: testQuestions.map((question) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "community-test-question-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-test-question-head", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                question.id,
                ". ",
                question.prompt
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: question.helper })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "community-test-option-row", children: testScaleOptions.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `community-test-scale-btn ${testAnswers[question.id] === option.score ? "active" : ""}`, onClick: () => answerCommunityTestQuestion(question.id, option.score), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: option.label }) }, `${question.id}-${option.score}`)) })
          ] }, question.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCommunityExplorerStage("test_result"), disabled: !testCanShowResult, children: "결과 보기" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: resetCommunityTest, children: "처음부터 다시" })
          ] })
        ] }) : null,
        communityExplorerStage === "test_result" && selectedCommunityPost ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-shell compact-scroll-list", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-topbar", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn topbar-search-back", onClick: () => setCommunityExplorerStage("test_run"), "aria-label": "테스트로 돌아가기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-detail-topbar-copy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "테스트 결과" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                testProfile.gender,
                " · ",
                testProfile.ageBand,
                " · ",
                testProfile.focus
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "community-detail-card community-test-result-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-simple-title-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-chip", children: "TOP 5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "현재 응답 기준의 성향 요약" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "community-test-top-result-grid", children: testTopResults.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-test-top-result-item", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-test-top-result-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  item.score,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "community-test-progress-bar small", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: `${item.score}%` } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.summary })
            ] }, item.axis)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "community-detail-body", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "결과는 현재 응답을 바탕으로 한 참고용 리포트입니다. 강한 항목과 약한 항목을 함께 보면서 경계선, 합의 방식, 대화 우선순위를 정리해 보세요." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "community-test-result-list", children: testResultRows.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "community-test-result-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.summary })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { children: [
                item.score,
                "%"
              ] })
            ] }, `result-${item.axis}`)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCommunityExplorerStage("test_run"), children: "응답 수정" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: resetCommunityTest, children: "새로 하기" })
            ] })
          ] })
        ] }) : null
      ] }) }) : null,
      showAppTabContent && activeTab === "채팅" ? /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: `tab-pane fill-pane chat-tab-pane ${chatTab === "질문" ? "chat-question-pane" : ""}`, children: chatTab === "질문" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-question-pane-body", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "asked-question-profile-header", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-profile-card asked-question-profile-card-inline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "asked-question-avatar", children: currentProfileMeta.name.slice(0, 1).toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-copy", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-copy-head", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-copy-main", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "feed-author-link asked-profile-name-btn", onClick: () => openProfileFromAuthor(currentProfileMeta.name), children: currentProfileMeta.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: currentProfileMeta.headline })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-toolbar asked-question-toolbar-inline", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => toggleFollowedFeedAuthor(currentProfileMeta.name), children: followedFeedAuthors.includes(currentProfileMeta.name) ? "팔로잉" : "팔로우" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", children: "공유" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: currentProfileMeta.bio })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "asked-question-form", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-form-title-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "질문 내용" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "asked-question-anonymous-toggle", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: chatQuestionAnonymous, onChange: (event) => setChatQuestionAnonymous(event.target.checked) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "익명" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: chatQuestionDraft, onChange: (e) => setChatQuestionDraft(e.target.value), placeholder: "상대에게 남길 질문을 입력하세요." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "asked-question-draft-note", children: "작성 중인 질문은 임시저장됩니다." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "asked-question-form-actions asked-question-form-actions-submit-only", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => {
            setChatQuestionDraft("");
            if (typeof window !== "undefined") window.localStorage.removeItem("adultapp_chat_question_draft");
            window.alert(chatQuestionAnonymous ? "질문이 익명으로 등록되었습니다." : "질문이 등록되었습니다.");
          }, children: "질문 등록" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "question-list", children: filteredQuestions.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "question-feed-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "question-feed-top", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "question-user-line", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-chip", children: "질문" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.author }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-meta", children: item.meta })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "question-body", children: [
              "Q. ",
              item.question
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "question-answer-box", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "product-badge", children: "답변" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "question-body", children: item.answer })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "question-footer-actions", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "question-footer-icon-btn", "aria-label": "좋아요", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "question-footer-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeartIcon, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.likes })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "question-footer-icon-btn", "aria-label": "댓글", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "question-footer-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommentBubbleIcon, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.comments })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "question-footer-icon-btn", "aria-label": "공유", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "question-footer-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShareArrowIcon, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "공유" })
            ] })
          ] })
        ] }, item.id)) })
      ] }) : activeChatThread ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-shell", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-topbar", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "header-inline-btn header-icon-btn", "aria-label": "뒤로가기", onClick: closeActiveChatThread, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackArrowIcon, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-profile", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-circle kakao-avatar x-chat-room-avatar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: activeChatThread.avatarUrl ?? buildChatAvatarDataUri(activeChatThread.name), alt: "", loading: "lazy" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-copy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: activeChatThread.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                activeChatThread.purpose,
                activeChatThread.status ? ` · ${activeChatThread.status}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `header-inline-btn header-icon-btn ${activeChatThread.favorite ? "active" : ""}`, "aria-label": "즐겨찾기", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookmarkIcon, { filled: !!activeChatThread.favorite }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: chatMessageListRef, className: "x-chat-room-message-list compact-scroll-list", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "x-chat-room-rule-banner", children: "채팅 입력창은 하단바 바로 위에 고정되며, 길게 눌러 이모지·복사·답장·공유·공지·수정·삭제 메뉴를 열 수 있습니다." }),
          activePinnedMessage ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-pinned-banner", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "공지" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: activePinnedMessage.text })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setChatPinnedMessageByThread((prev) => ({ ...prev, [activeChatThread.id]: null })), children: "해제" })
          ] }) : null,
          chatLongPressHint ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "x-chat-room-floating-hint", children: chatLongPressHint }) : null,
          activeChatMessages.map((message) => {
            const reactionMeta = message.reaction ? CHAT_REACTION_OPTIONS.find((item) => item.key === message.reaction) ?? null : null;
            const isSelectionTarget = chatSelectableMessageId === message.id;
            const messageClock = formatChatMessageClock(message.createdAt);
            const contentKind = message.contentKind ?? "text";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "article",
              {
                className: `x-chat-room-message${message.mine ? " mine" : ""}${message.system ? " system" : ""}`,
                onContextMenu: (event) => {
                  event.preventDefault();
                  openChatMessageMenu(message);
                },
                onMouseDown: () => startChatMessageHold(message),
                onMouseUp: clearChatMessageHold,
                onMouseLeave: clearChatMessageHold,
                onTouchStart: () => startChatMessageHold(message),
                onTouchEnd: clearChatMessageHold,
                onTouchCancel: clearChatMessageHold,
                children: [
                  !message.mine && !message.system ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "x-chat-room-message-author", children: message.author }) : null,
                  message.replyTo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-message-reply-ref", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: message.replyTo.author }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: message.replyTo.text })
                  ] }) : null,
                  message.system ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `x-chat-room-message-bubble${isSelectionTarget ? " selection-enabled" : ""}`, children: message.text }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "x-chat-room-message-meta", children: message.meta })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `x-chat-room-message-row${message.mine ? " mine" : ""}`, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `x-chat-room-message-bubble kind-${contentKind}${isSelectionTarget ? " selection-enabled" : ""}`, children: [
                      contentKind === "emoji" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "x-chat-room-emoji-content", children: message.text }) : null,
                      contentKind === "sticker" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-special-card sticker", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "x-chat-room-special-chip", children: "스티커" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: message.text }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("small", { children: "선택한 스티커가 채팅으로 전송되었습니다." })
                      ] }) : null,
                      contentKind === "gif" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-special-card gif", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "x-chat-room-special-chip", children: "GIF" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: message.text }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("small", { children: "루프 미리보기 대신 이름형 카드로 표시됩니다." })
                      ] }) : null,
                      contentKind === "text" ? message.text : null
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-message-side-meta", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "x-chat-room-message-time", children: messageClock }),
                      message.edited ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "x-chat-room-message-edited", children: "수정됨" }) : null
                    ] })
                  ] }),
                  reactionMeta ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `x-chat-room-message-reaction ${reactionMeta.className}`, children: reactionMeta.symbol }) : null
                ]
              },
              message.id
            );
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-composer-wrap", children: [
          chatSelectableMessageId !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-context-strip selection-mode", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "선택 복사" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: chatCopiedSelection ? `복사됨: ${chatCopiedSelection}` : "메시지를 드래그해 일부 텍스트를 선택한 뒤 복사하세요." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-context-actions", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: copySelectedChatText, children: "선택영역 복사" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => {
                setChatSelectableMessageId(null);
                setChatCopiedSelection("");
              }, children: "취소" })
            ] })
          ] }) : null,
          chatReplyTarget ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-context-strip", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                chatReplyTarget.author,
                "에게 답장"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: chatReplyTarget.text })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setChatReplyTarget(null), children: "닫기" })
          ] }) : null,
          chatEditableMessageId !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-context-strip edit-mode", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "메시지 수정" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "보낸 뒤 1시간 이내 메시지만 수정할 수 있습니다." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => {
              setChatEditableMessageId(null);
              setChatRoomDraft("");
            }, children: "취소" })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-composer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "x-chat-room-plus-btn", "aria-label": "더보기", onClick: () => {
              setChatEmojiSheetOpen(false);
              setChatAttachmentSheetOpen((prev) => !prev);
            }, children: "+" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "x-chat-room-input-shell", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: chatRoomDraft, onChange: (event) => setChatRoomDraft(event.target.value), placeholder: "메시지를 입력하세요", onKeyDown: (event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitChatRoomMessage();
                }
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "x-chat-room-emoji-toggle", "aria-label": "이모티콘 열기", onClick: () => {
                setChatAttachmentSheetOpen(false);
                setChatEmojiSheetOpen((prev) => !prev);
              }, children: "☺" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn x-chat-room-send-btn", onClick: submitChatRoomMessage, children: "보내기" })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-toolbar kakao-toolbar compact-only-toolbar chat-toolbar-with-request", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: `chat-request-toggle ${chatListMode === "requests" ? "active" : ""}`,
              onClick: () => setChatListMode("requests"),
              children: [
                "요청",
                chatRequestItems.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: chatRequestItems.length }) : null
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-category-scroll", children: chatCategories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: `category-chip ${chatListMode === "threads" && chatCategory === category ? "active" : ""}`,
              onClick: () => {
                setChatListMode("threads");
                setChatCategory(category);
              },
              children: category
            },
            category
          )) })
        ] }),
        chatListMode === "requests" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-request-pane compact-scroll-list", children: [
          !chatRequestItems.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact chat-request-empty-box", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "받은 채팅 요청이 없습니다." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "요청 목록에서 상대를 선택한 뒤, 채팅방에서 첫 메시지를 보내면 일반 채팅으로 전환됩니다." })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-request-list", children: chatRequestItems.map((request2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "article",
            {
              className: "chat-request-row",
              onClick: () => openIncomingChatRequest(request2),
              role: "button",
              tabIndex: 0,
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openIncomingChatRequest(request2);
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-circle kakao-avatar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: request2.avatarUrl ?? buildChatAvatarDataUri(request2.name), alt: "", loading: "lazy" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-request-copy", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-request-copy-head", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: request2.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: request2.time })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: request2.requestText })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-request-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "ghost-btn chat-request-delete-btn",
                    onClick: (event) => {
                      event.stopPropagation();
                      deleteChatRequest(request2);
                    },
                    children: "삭제"
                  }
                ) })
              ]
            },
            request2.id
          )) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-list compact-scroll-list kakao-chat-list", onScroll: handleChatListScroll, children: [
          chatDisplayRows.map((thread, index) => thread ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "chat-row kakao-chat-row chat-row-openable", onClick: () => openChatThread(thread), role: "button", tabIndex: 0, onKeyDown: (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openChatThread(thread);
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-circle kakao-avatar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: thread.avatarUrl ?? buildChatAvatarDataUri(thread.name), alt: "", loading: "lazy" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-copy kakao-chat-copy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "kakao-chat-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: thread.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "kakao-chat-badges", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: thread.purpose }),
                  thread.status ? /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: thread.status }) : null
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: thread.preview }),
              thread.purpose.includes("상호수락 1:1") ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "muted-mini", children: "외부 연락처 교환 금지 · 사진/영상 전송 금지 · 반복 접촉 금지" }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-meta kakao-chat-meta", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: thread.time }),
              thread.unread > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: thread.unread }) : null
            ] })
          ] }, thread.id) : /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "chat-row kakao-chat-row kakao-chat-row-empty", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-circle kakao-avatar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-copy kakao-chat-copy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "kakao-chat-head", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: " " }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "kakao-chat-badges", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: " " }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: " " })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-meta kakao-chat-meta", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: " " }) })
          ] }, `chat-empty-${chatCategory}-${index}`)),
          pagedThreads.length < filteredThreads.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-loading-row", children: "채팅 기록 10개 단위로 추가 로딩 중" }) : null
        ] })
      ] }) }) : null,
      showAppTabContent && activeTab === "프로필" ? /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "tab-pane fill-pane profile-pane-instagram", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-ig-shell compact-scroll-list", onScroll: handleProfileShellScroll, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-ig-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "profile-ig-avatar-wrap", children: currentProfileMeta.isOwner && profileEditMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: `profile-ig-avatar profile-ig-avatar-edit-trigger ${profileEditDraft.avatarUrl ? "has-image" : ""}`,
                onClick: () => {
                  var _a2;
                  return (_a2 = profileAvatarInputRef.current) == null ? void 0 : _a2.click();
                },
                "aria-label": "프로필 사진 변경",
                children: profileEditDraft.avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: profileEditDraft.avatarUrl, alt: "프로필", loading: "lazy" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: (profileEditDraft.displayName.trim() || currentProfileMeta.name).slice(0, 1).toUpperCase() })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: profileAvatarInputRef, type: "file", accept: "image/*", className: "sr-only", onChange: handleProfileAvatarFileChange })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `profile-ig-avatar ${currentProfileMeta.avatarUrl ? "has-image" : ""}`, children: currentProfileMeta.avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: currentProfileMeta.avatarUrl, alt: "프로필", loading: "lazy" }) : currentProfileMeta.avatar }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-ig-main", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-ig-topline", children: [
              currentProfileMeta.isOwner && profileEditMode ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "profile-ig-edit-input profile-ig-edit-username",
                  value: profileEditDraft.displayName,
                  onChange: (event) => {
                    if (!profileNicknameEditUnlocked) return;
                    setProfileEditDraft((prev) => ({ ...prev, displayName: event.target.value }));
                  },
                  onClick: handleProfileNicknameEditUnlock,
                  onFocus: handleProfileNicknameEditUnlock,
                  placeholder: "표시 이름",
                  readOnly: !profileNicknameEditUnlocked
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "profile-ig-username", children: currentProfileMeta.name }),
              currentProfileMeta.isOwner ? profileEditMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-inline-actions profile-inline-actions-edit", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn profile-ig-mini-btn", onClick: cancelProfileEditMode, children: "취소" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "feed-follow-btn profile-follow-btn active", onClick: saveProfileEditMode, children: "저장" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn profile-ig-mini-btn", onClick: openProfileEditMode, children: "프로필 편집" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "asked-question-toolbar asked-question-toolbar-inline profile-inline-actions", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "feed-question-btn profile-contact-btn", onClick: openProfileChatRequest, children: "채팅" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `feed-follow-btn profile-follow-btn ${followedFeedAuthors.includes(currentProfileMeta.name) ? "active" : ""}`, onClick: () => toggleFollowedFeedAuthor(currentProfileMeta.name), children: followedFeedAuthors.includes(currentProfileMeta.name) ? "팔로잉" : "팔로우" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", children: "공유" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-ig-stats", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: currentProfileMeta.postCount }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "게시물" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: currentProfileMeta.followerCount.toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "팔로워" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: currentProfileMeta.followingCount.toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "팔로잉" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "profile-ig-bio", children: currentProfileMeta.isOwner && profileEditMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  className: "profile-ig-edit-textarea",
                  value: profileEditDraft.bio,
                  onChange: (event) => setProfileEditDraft((prev) => ({ ...prev, bio: event.target.value })),
                  placeholder: "자기소개를 작성하세요",
                  rows: 4
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "profile-ig-edit-input",
                  value: profileEditDraft.hashtags,
                  onChange: (event) => setProfileEditDraft((prev) => ({ ...prev, hashtags: event.target.value })),
                  placeholder: "태그입력(최대20개)"
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: currentProfileMeta.bio })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-ig-tabbar profile-ig-action-grid", "aria-label": "프로필 바로가기", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: profileSection === "게시물" ? "active" : "", onClick: () => setProfileSection("게시물"), children: "게시물" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: profileSection === "질문" ? "active" : "", onClick: () => setProfileSection("질문"), children: "질문" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: profileSection === "쇼츠" ? "active" : "", onClick: () => setProfileSection("쇼츠"), children: "쇼츠" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: profileSection === "태그됨" ? "active" : "", onClick: () => setProfileSection("태그됨"), children: "태그됨" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: profileSection === "상품보기" ? "active" : "", onClick: () => setProfileSection("상품보기"), children: "상품 보기" })
        ] }),
        profileSection === "게시물" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "profile-ig-grid", children: allFeedItems.filter((item) => item.type === "image" && currentProfileAuthorAliases.includes(item.author)).slice(0, 12).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `profile-ig-tile ${item.accent}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "profile-ig-tile-media", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.category }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-ig-tile-meta", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "♥ ",
              item.likes,
              " · 💬 ",
              item.comments
            ] })
          ] })
        ] }, item.id)) }) : null,
        profileSection === "질문" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "question-list profile-question-list", children: questionSeed.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "question-feed-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "question-feed-top", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "question-user-line", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-chip", children: "질문" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "feed-author-link", onClick: () => openProfileFromAuthor(currentProfileAuthor), children: currentProfileMeta.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "community-meta", children: item.meta })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "question-body", children: [
              "Q. ",
              item.question
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "question-answer-box", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "product-badge", children: "답변" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "question-body", children: item.answer })
          ] })
        ] }, `profile-question-${item.id}`)) }) : null,
        profileSection === "쇼츠" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-ig-grid profile-ig-grid-shorts", children: [
          pagedProfileShorts.length ? pagedProfileShorts.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ShortsListCard,
            {
              item,
              onOpenMore: setShortsMoreItem,
              onOpenViewer: openShortsViewer
            },
            `profile-short-${item.id}`
          )) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "legacy-box compact", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "올린 쇼츠가 없습니다." }) }),
          pagedProfileShorts.length < profileShortItems.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-loading-row", children: "쇼츠 10개 단위로 추가 로딩 중" }) : null
        ] }) : null,
        profileSection === "태그됨" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "profile-ig-grid", children: allFeedItems.filter((item) => item.type === "image").slice(12, 21).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `profile-ig-tile ${item.accent}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "profile-ig-tile-media", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "태그됨" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-ig-tile-meta", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "@",
              currentProfileMeta.name,
              " · ",
              item.postedAt ?? "오늘"
            ] })
          ] })
        ] }, `tagged-${item.id}`)) }) : null,
        profileSection === "상품보기" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "profile-ig-grid", children: currentProfileProducts.map((product, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `profile-ig-tile profile-product-tile ${index % 4 === 0 ? "sunrise" : index % 4 === 1 ? "violet" : index % 4 === 2 ? "teal" : "rose"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "profile-ig-tile-media profile-product-tile-media", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: product.badge }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-ig-tile-meta", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: product.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "판매 ",
              (product.orderCount ?? 0).toLocaleString(),
              " · 리뷰 ",
              (product.reviewCount ?? 0).toLocaleString()
            ] })
          ] })
        ] }, `profile-product-${product.id}-${index}`)) }) : null,
        profileSection === "쇼츠" && shortsViewerItemId !== null && profileShortItems.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          ShortsViewer,
          {
            items: profileShortItems,
            initialIndex: profileShortsViewerInitialIndex,
            onClose: () => setShortsViewerItemId(null),
            onOpenMore: setShortsMoreItem,
            getKeywordTags: getContentKeywordTags,
            onOpenAuthorProfile: openProfileFromAuthor,
            onPreviewAuthorAvatar: openFeedAvatarPreview,
            followedAuthors: followedFeedAuthors,
            onToggleFollow: toggleFollowedFeedAuthor
          }
        ) : null
      ] }) }) : null
    ] }),
    inspectedElement ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overlay-card html-inspector-modal", style: inspectedElement.modalStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overlay-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "HTML 요소 복사" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-btn", onClick: () => {
          if (inspectedTargetRef.current) {
            inspectedTargetRef.current.classList.remove("html-inspector-target");
            inspectedTargetRef.current = null;
          }
          setInspectedElement(null);
        }, children: "닫기" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap html-inspector-body", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "selector" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: inspectedElement.selector })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "tag" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: inspectedElement.tagName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "id" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: inspectedElement.id })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "class" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: inspectedElement.className })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "simple-list-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "text" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: inspectedElement.text })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-btn", onClick: () => copyToClipboard(inspectedElement.selector), children: "selector 복사" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-btn", onClick: () => copyToClipboard(inspectedElement.cssText), children: "style 복사" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-btn", onClick: () => copyToClipboard(inspectedElement.html), children: "html 복사" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "핵심 스타일" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: inspectedElement.cssText })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "선택 요소 HTML" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: inspectedElement.html })
        ] })
      ] })
    ] }) : null,
    chatAttachmentSheetOpen && activeChatThread ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-sheet-backdrop", onClick: () => setChatAttachmentSheetOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-action-sheet", onClick: (event) => event.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-sheet-handle" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-action-sheet-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "더보기" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "사진첨부 · 지도공유 · 파일첨부 · 프로필공유" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-action-grid", children: CHAT_QUICK_SHARE_ITEMS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "chat-action-grid-btn", onClick: () => handleChatQuickShareAction(item.label), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chat-action-grid-icon", "aria-hidden": "true", children: item.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label })
      ] }, item.key)) })
    ] }) }) : null,
    chatEmojiSheetOpen && activeChatThread ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-sheet-backdrop", onClick: () => setChatEmojiSheetOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-emoji-sheet", onClick: (event) => event.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-sheet-handle" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-emoji-primary-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-emoji-tab-row", children: CHAT_PICKER_TABS.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `chat-emoji-mode-btn ${chatEmojiMode === tab ? "active" : ""}`, onClick: () => setChatEmojiMode(tab), children: tab }, tab)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-emoji-search-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: chatEmojiKeyword, onChange: (event) => setChatEmojiKeyword(event.target.value), placeholder: "검색어 입력 텍스트칸" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: handleChatEmojiSearch, children: "검색" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: handleChatEmojiStoreOpen, children: "상점" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-emoji-collection-row", children: chatPickerCollections.map((collection) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `chat-emoji-collection-btn ${chatEmojiCollectionKey === collection.key ? "active" : ""}`, onClick: () => setChatEmojiCollectionKey(collection.key), children: collection.label }, collection.key)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `chat-emoji-grid mode-${chatEmojiMode === "이모티콘" ? "emoji" : chatEmojiMode === "스티커" ? "sticker" : "gif"} compact-scroll-list`, children: chatPickerItems.length ? chatPickerItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `chat-emoji-item ${chatEmojiMode === "이모티콘" ? "emoji" : chatEmojiMode === "스티커" ? "sticker" : "gif"}`, onClick: () => handleChatPickerSelect(item), children: [
        chatEmojiMode === "이모티콘" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chat-emoji-item-symbol", children: item }) : null,
        chatEmojiMode === "스티커" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chat-emoji-item-sticker-mark", children: "🧸" }) : null,
        chatEmojiMode === "GIF" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chat-emoji-item-gif-mark", children: "GIF" }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: item }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("small", { children: chatEmojiMode === "이모티콘" ? "4열 무한 스크롤" : chatEmojiMode === "스티커" ? "3열 무한 스크롤" : "2열 무한 스크롤" })
      ] }, `${chatEmojiMode}-${item}`)) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-emoji-empty-state", children: [
        "선택한 조건에 맞는 ",
        chatEmojiMode,
        " 항목이 없습니다."
      ] }) })
    ] }) }) : null,
    chatContextMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-backdrop", onClick: () => setChatContextMessage(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-card chat-message-modal", onClick: (event) => event.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-message-emoji-row", children: CHAT_REACTION_OPTIONS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: `chat-message-emoji-btn ${item.className}`, onClick: () => applyChatReaction(chatContextMessage, item.key), "aria-label": item.label, children: item.symbol }, item.key)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-message-menu-list", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "chat-message-menu-btn", onClick: () => copyChatMessage(chatContextMessage), children: "복사" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "chat-message-menu-btn", onClick: () => enableChatSelectionCopy(chatContextMessage), children: "선택 복사" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "chat-message-menu-btn", onClick: () => replyChatMessage(chatContextMessage), children: "답장" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "chat-message-menu-btn", onClick: () => openChatShareSheet(chatContextMessage), children: "공유" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "chat-message-menu-btn", onClick: () => pinChatMessage(chatContextMessage), children: "공지" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "chat-message-menu-btn", onClick: () => startChatEdit(chatContextMessage), disabled: !canManageChatMessage(chatContextMessage), children: "수정" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "chat-message-menu-btn danger", onClick: () => deleteChatMessage(chatContextMessage), disabled: !canManageChatMessage(chatContextMessage), children: "삭제" })
      ] })
    ] }) }) : null,
    chatShareMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-sheet-backdrop", onClick: () => setChatShareMessage(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-share-sheet", onClick: (event) => event.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-sheet-handle" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-action-sheet-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "다른 채팅방으로 공유" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "최근 채팅방을 검색하고 링크도 복사할 수 있습니다." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-share-toolbar", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: chatShareKeyword, onChange: (event) => setChatShareKeyword(event.target.value), placeholder: "최근 채팅방 검색" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: copyChatShareLink, children: "링크 복사" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chat-share-list compact-scroll-list", children: filteredChatShareTargets.map((thread) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "chat-share-row", onClick: () => shareChatMessageToThread(thread), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-circle kakao-avatar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: thread.avatarUrl ?? buildChatAvatarDataUri(thread.name), alt: "", loading: "lazy" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-share-copy", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: thread.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            thread.purpose,
            " · ",
            thread.preview
          ] })
        ] })
      ] }, thread.id)) })
    ] }) }) : null,
    shortsMoreItem ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-sheet-backdrop", onClick: () => setShortsMoreItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-sheet", onClick: (event) => event.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-sheet-handle" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shorts-sheet-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: shortsMoreItem.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: shortsMoreItem.author })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shorts-sheet-actions", children: ["공유", "보관함저장", "관심없음", "채널 추천 안함", "신고"].map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "shorts-sheet-btn",
          onClick: () => {
            if (option === "보관함저장") toggleSavedFeed(shortsMoreItem.id);
            setShortsMoreItem(null);
          },
          children: option
        },
        option
      )) })
    ] }) }) : null,
    adultPromptOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-backdrop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-card adult-auth-modal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "성인 인증 필요" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-btn", onClick: () => setAdultPromptOpen(false), children: "닫기" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "이 기능은 성인 인증 후 이용할 수 있습니다." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "청소년은 이용할 수 없습니다." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "본인확인 결과에 따라 이용이 제한될 수 있습니다." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => attemptAdultVerification("success"), children: "PASS/휴대폰 인증 완료" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => attemptAdultVerification("fail"), children: "인증 실패" })
        ] })
      ] })
    ] }) }) : null,
    backMinimizeHintVisible ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "app-back-hint-toast", role: "status", "aria-live": "polite", children: "뒤로가기 버튼을 한 번 더 누르면 앱이 최소화됩니다." }) : null,
    listEndToast ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "app-back-hint-toast app-list-end-toast", role: "status", "aria-live": "polite", children: listEndToast }) : null,
    showAppTabContent && activeTab === "홈" && homeTab === "피드" && !feedComposeOpen && !openFeedCommentItem && !selectedAskProfile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      feedComposeLauncherOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "feed-create-backdrop", "aria-label": "피드 작성 메뉴 닫기", onClick: () => setFeedComposeLauncherOpen(false) }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `feed-create-dock${feedComposeLauncherOpen ? " open" : ""}`, children: [
        feedComposeLauncherOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-create-options", "aria-hidden": false, children: [
          { mode: "쇼츠게시", label: "쇼츠게시", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShortsCameraIcon, {}) },
          { mode: "피드게시", label: "피드게시", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PaperDocumentIcon, {}) }
        ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "feed-create-option", onClick: () => openFeedComposeWithMode(item.mode), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-create-option-label", children: item.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-create-option-icon", "aria-hidden": "true", children: item.icon })
        ] }, item.mode)) }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: `feed-create-fab${feedComposeLauncherOpen ? " open" : ""}`,
            onClick: () => setFeedComposeLauncherOpen((prev) => !prev),
            "aria-label": feedComposeLauncherOpen ? "피드 작성 메뉴 닫기" : "피드 작성 메뉴 열기",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-create-fab-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlusIcon, {}) })
          }
        )
      ] })
    ] }) : null,
    !desktopPaneContext.embedded ? /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "bottom-nav", children: mobileTabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `bottom-nav-btn ${overlayMode === null && activeTab === tab ? "active" : ""}`, onClick: () => selectBottomTab(tab), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bottom-nav-icon", children: bottomNavIconMap[tab] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bottom-nav-label", children: tab })
    ] }, tab)) }) : null,
    selectedAskProfile ? /* @__PURE__ */ jsxRuntimeExports.jsx(AskProfileScreen, { profile: selectedAskProfile, activeTab, onClose: () => setSelectedAskProfile(null), onNavigate: selectBottomTab, renderBottomTabIcon, onOpenProfile: openProfileFromAuthor }) : null,
    feedAvatarPreviewItem ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-avatar-preview-backdrop", onClick: closeFeedAvatarPreview, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-avatar-preview-sheet", onClick: (event) => event.stopPropagation(), role: "dialog", "aria-modal": "true", "aria-label": "프로필 사진 미리보기", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `feed-avatar-preview-stage ${feedAvatarPreviewItem.accent}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feed-avatar-preview-square", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feed-avatar-preview-silhouette", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-avatar-preview-head" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feed-avatar-preview-body" })
    ] }) }) }) }) }) : null,
    feedComposeOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      FeedComposeScreen,
      {
        mode: feedComposeMode,
        title: feedComposeTitle,
        caption: feedComposeCaption,
        attachment: feedComposeAttachment,
        busy: feedComposeBusy,
        helperText: feedComposeHelperText,
        onChangeTitle: setFeedComposeTitle,
        onChangeCaption: setFeedComposeCaption,
        onAttachFile: handleFeedComposeAttach,
        onClearAttachment: clearFeedComposeAttachment,
        onSubmit: submitFeedCompose,
        onClose: closeFeedCompose
      }
    ) : null,
    openFeedCommentItem ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      FeedCommentScreen,
      {
        item: openFeedCommentItem,
        comments: feedCommentMap[openFeedCommentItem.id] ?? [],
        draft: feedCommentDrafts[openFeedCommentItem.id] ?? "",
        attachment: feedCommentAttachments[openFeedCommentItem.id] ?? null,
        attachmentBusy: feedCommentAttachmentBusyId === openFeedCommentItem.id,
        onChangeDraft: (value) => updateFeedCommentDraft(openFeedCommentItem.id, value),
        onAttachImage: (file) => attachFeedCommentImage(openFeedCommentItem.id, file),
        onClearAttachment: () => clearFeedCommentAttachment(openFeedCommentItem.id),
        onSubmit: () => submitFeedComment(openFeedCommentItem.id),
        onClose: closeFeedComments,
        onGoHome: () => {
          closeFeedComments();
          setActiveTab("홈");
          setHomeTab("피드");
        }
      }
    ) : null,
    pendingDmUser ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-backdrop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "1:1 대화 요청" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ghost-btn", onClick: () => setPendingDmUser(null), children: "닫기" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stack-gap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: pendingDmUser.name }),
            " 님에게 ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: pendingDmUser.topic }),
            " 주제로 1:1 대화를 요청합니다."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "요청 전에 아래 대화 규칙 동의가 필요합니다." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "consent-checklist signup-consent-checklist", children: dmRuleNoticeItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "consent-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!dmRuleChecks[item], onChange: (e) => setDmRuleChecks((prev) => ({ ...prev, [item]: e.target.checked })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item })
        ] }, item)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "copy-action-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: submitDmRequest, children: "규칙 동의 후 요청 전송" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ghost-btn", onClick: () => setPendingDmUser(null), children: "취소" })
        ] })
      ] })
    ] }) }) : null,
    roomModalOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-backdrop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "header-inline-btn modal-back-btn", onClick: () => setRoomModalOpen(false), children: "←" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "단체 채팅방 개설" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "modal-spacer" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "legacy-box compact", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "성인인증 완료 회원만 개설할 수 있습니다. 이 공간은 주제형 정보교류/고민상담용이며 사람 찾기, 만남, 주선은 허용하지 않습니다. 사진/영상/파일 전송은 막고, 앱 내부 항목만 공유할 수 있습니다." }),
        groupRoomSuspendedRemainMinutes > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "현재 계정은 신고/제재 반영으로 ",
          groupRoomSuspendedRemainMinutes,
          "분 동안 개설이 제한됩니다."
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-form-grid modal-form-grid-top", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: newRoomCategory, onChange: (e) => setNewRoomCategory(e.target.value), children: randomRoomCategories.filter((item) => item !== "전체").map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item, children: item }, item)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newRoomTitle, onChange: (e) => setNewRoomTitle(e.target.value.slice(0, 24)), placeholder: "방제목입력칸" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-form-grid modal-form-grid-bottom", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "anonymous-check", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "익명" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: newRoomAnonymous, onChange: (e) => setNewRoomAnonymous(e.target.checked) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newRoomMaxPeople, onChange: (e) => setNewRoomMaxPeople(e.target.value.replace(/[^0-9]/g, "")), placeholder: "인원수" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newRoomPassword, onChange: (e) => setNewRoomPassword(e.target.value.replace(/[^0-9]/g, "").slice(0, 8)), placeholder: "비밀번호입력칸" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "modal-submit-btn", onClick: createRandomRoom, children: "채팅방 개설" })
    ] }) }) : null
  ] });
}
const BUILD_VERSION = "1776920653674";
const VERSION_URL = "/version.json";
const UPDATE_ATTEMPT_KEY = "adultapp:update-attempt-version";
const UPDATE_ATTEMPT_AT_KEY = "adultapp:update-attempt-at";
const UPDATE_QUERY_KEY = "app_updated";
const UPDATE_COOLDOWN_MS = 30 * 1e3;
function getNow() {
  return Date.now();
}
async function getRemoteBuildVersion() {
  try {
    const response = await fetch(`${VERSION_URL}?t=${getNow()}`, {
      cache: "no-store",
      headers: {
        "cache-control": "no-cache, no-store, must-revalidate",
        pragma: "no-cache"
      }
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return typeof data.version === "string" && data.version.trim() ? data.version.trim() : null;
  } catch {
    return null;
  }
}
async function clearBrowserCaches() {
  if (!("caches" in window)) {
    return;
  }
  try {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((key) => caches.delete(key)));
  } catch {
  }
}
function canAttemptReload(nextVersion) {
  const previousVersion = window.sessionStorage.getItem(UPDATE_ATTEMPT_KEY);
  const previousAt = Number(window.sessionStorage.getItem(UPDATE_ATTEMPT_AT_KEY) ?? "0");
  if (previousVersion !== nextVersion) {
    return true;
  }
  return getNow() - previousAt > UPDATE_COOLDOWN_MS;
}
function markReloadAttempt(nextVersion) {
  window.sessionStorage.setItem(UPDATE_ATTEMPT_KEY, nextVersion);
  window.sessionStorage.setItem(UPDATE_ATTEMPT_AT_KEY, String(getNow()));
}
function clearReloadAttempt() {
  window.sessionStorage.removeItem(UPDATE_ATTEMPT_KEY);
  window.sessionStorage.removeItem(UPDATE_ATTEMPT_AT_KEY);
}
function cleanupUpdatedQueryFlag() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(UPDATE_QUERY_KEY)) {
    return;
  }
  url.searchParams.delete(UPDATE_QUERY_KEY);
  window.history.replaceState({}, document.title, url.toString());
}
async function reloadToLatest(nextVersion) {
  if (!canAttemptReload(nextVersion)) {
    return;
  }
  markReloadAttempt(nextVersion);
  await clearBrowserCaches();
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("v", nextVersion);
  nextUrl.searchParams.set(UPDATE_QUERY_KEY, "1");
  window.location.replace(nextUrl.toString());
}
async function checkForAppUpdate() {
  const remoteVersion = await getRemoteBuildVersion();
  if (!remoteVersion) {
    return;
  }
  if (remoteVersion === BUILD_VERSION) {
    clearReloadAttempt();
    cleanupUpdatedQueryFlag();
    return;
  }
  await reloadToLatest(remoteVersion);
}
function setupAppUpdateSync() {
  void checkForAppUpdate();
  const runCheck = () => {
    void checkForAppUpdate();
  };
  window.addEventListener("focus", runCheck);
  window.addEventListener("online", runCheck);
  window.addEventListener("pageshow", runCheck);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      runCheck();
    }
  });
  window.setInterval(runCheck, 60 * 1e3);
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
window.addEventListener("load", () => {
  window.setTimeout(() => {
    var _a;
    (_a = document.getElementById("app-boot-splash")) == null ? void 0 : _a.classList.add("is-hidden");
  }, 700);
});
setupAppUpdateSync();
