(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
      typeof define === 'function' && define.amd ? define(factory) :
          (factory());
}(this, (function () {

  var ChangeStore = function ChangeStore(seed) {
    this._changes = seed || {};
  };


  ChangeStore.prototype.getChanges = function getChanges (documentId, sinceVersion, toVersion, cb) {
    if (typeof sinceVersion === 'function') {
      cb = sinceVersion;
      sinceVersion = 0;
    } else if (typeof toVersion === 'function') {
      cb = toVersion;
      toVersion = undefined;
    }
    if (!(documentId && sinceVersion >= 0 && cb)) {
      throw new Error('Invalid arguments')
    }
    var version = this._getVersion(documentId);
    var changes = this._getChanges(documentId);
    changes = changes.slice(sinceVersion, toVersion);
    cb(null, changes, version);
  };


  ChangeStore.prototype.addChange = function addChange (documentId, change, cb) {
    if (!documentId || !change) {
      throw new Error('Invalid arguments')
    }
    this._addChange(documentId, change);
    var newVersion = this._getVersion(documentId);
    cb(null, newVersion);
  };


  ChangeStore.prototype.deleteChanges = function deleteChanges (documentId, cb) {
    var deletedChanges = this._deleteChanges(documentId);
    cb(null, deletedChanges.length);
  };


  ChangeStore.prototype.getVersion = function getVersion (id, cb) {
    cb(null, this._getVersion(id));
  };




  ChangeStore.prototype._deleteChanges = function _deleteChanges (documentId) {
    var changes = this._getChanges(documentId);
    delete this._changes[documentId];
    return changes
  };

  ChangeStore.prototype._getVersion = function _getVersion (documentId) {
    var changes = this._changes[documentId];
    return changes ? changes.length : 0
  };

  ChangeStore.prototype._getChanges = function _getChanges (documentId) {
    return this._changes[documentId] || []
  };

  ChangeStore.prototype._addChange = function _addChange (documentId, change) {
    if (!this._changes[documentId]) {
      this._changes[documentId] = [];
    }
    this._changes[documentId].push(change);
  };

  function forEach(iteratee, func) {
    if (!iteratee) { return }
    if (iteratee.constructor.prototype.forEach) {
      iteratee.forEach(func);
    } else {
      Object.keys(iteratee).forEach(function(key) {
        return func(iteratee[key], key)
      });
    }
  }

  function isObject(val) {
    var type = typeof val;
    return Boolean(val) && (type === 'object' || type === 'function')
  }

  var EventEmitter = function EventEmitter () {};

  var prototypeAccessors = { __events__: {} };

  EventEmitter.prototype.emit = function emit (event) {
    if (event in this.__events__) {


      var bindings = this.__events__[event].slice();
      var args = Array.prototype.slice.call(arguments, 1);
      for (var i = 0, len = bindings.length; i < len; i++) {
        var binding = bindings[i];

        binding.method.apply(binding.context, args);
      }
      return true
    }
    return false
  };


  EventEmitter.prototype.on = function on (event, method, context, options) {
    var priority = 0;
    if (arguments.length === 4) {
      priority = options.priority || priority;
    }
    _on.call(this, event, method, context, priority);
    this.__events__[event].sort(byPriorityDescending);
  };


  EventEmitter.prototype.off = function off (event, method, context) {
    if (arguments.length === 1 && isObject(arguments[0])) {
      _disconnect.call(this, arguments[0]);
    } else {
      _off.apply(this, arguments);
    }
  };

  EventEmitter.prototype._debugEvents = function _debugEvents () {

    console.log('### EventEmitter: ', this);
    forEach(this.__events__, function(handlers, name) {
      console.log("- %s listeners for %s: ", handlers.length, name, handlers);
    });

  };

  prototypeAccessors.__events__.get = function () {
    if (!this.___events___) {
      this.___events___ = {};
    }
    return this.___events___
  };

  Object.defineProperties( EventEmitter.prototype, prototypeAccessors );



  function byPriorityDescending(a, b) {
    return b.priority - a.priority
  }


  function _on(event, method, context, priority) {

    var bindings;
    validateMethod( method, context );
    if (this.__events__.hasOwnProperty(event)) {
      bindings = this.__events__[event];
    } else {

      bindings = this.__events__[event] = [];
    }

    bindings.push({
      method: method,
      context: context || null,
      priority: priority
    });
    return this

  }


  function _off(event, method, context) {

    var i, bindings;
    if ( arguments.length === 1 ) {

      delete this.__events__[event];
      return this
    }
    validateMethod( method, context );
    if ( !( event in this.__events__ ) || !this.__events__[event].length ) {

      return this
    }

    if ( arguments.length < 3 ) {
      context = null;
    }

    bindings = this.__events__[event];
    i = bindings.length;
    while ( i-- ) {
      if ( bindings[i].method === method && bindings[i].context === context ) {
        bindings.splice( i, 1 );
      }
    }

    if ( bindings.length === 0 ) {
      delete this.__events__[event];
    }
    return this

  }



  function _disconnect(context) {


    forEach(this.__events__, function(bindings, event) {
      var this$1 = this;

      for (var i = bindings.length-1; i>=0; i--) {


        if (bindings[i] && bindings[i].context === context) {
          _off.call(this$1, event, bindings[i].method, context);
        }
      }
    }.bind(this));
    return this

  }

  function validateMethod(method, context) {

    if (typeof method === 'string') {

      if (context === undefined || context === null) {
        throw new Error( 'Method name "' + method + '" has no context.' )
      }
      if (!(method in context)) {


        throw new Error( 'Method not found: "' + method + '"' )
      }
      if (typeof context[method] !== 'function') {


        throw new Error( 'Property "' + method + '" is not a function' )
      }
    } else if (typeof method !== 'function') {
      throw new Error( 'Invalid callback. Function or method name expected.' )
    }
  }

  var SubstanceError = (function (Error) {
    function SubstanceError(name, options) {
      Error.call(this, name, options);
      this.name = name;
      this.message = options.message;
      this.info = options.info;
      this.errorCode = options.errorCode;
      this.cause = options.cause;

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, (SubstanceError));
      }
    }

    if ( Error ) SubstanceError.__proto__ = Error;
    SubstanceError.prototype = Object.create( Error && Error.prototype );
    SubstanceError.prototype.constructor = SubstanceError;

    SubstanceError.prototype.inspect = function inspect () {
      var parts = [];


      parts.push(this.stack);


      if (this.info) {
        parts.push(this.info + '. ');
      }


      if (this.cause) {
        parts.push('\nCaused by: ');

        if (this.cause.inspect) {

          parts.push(this.cause.inspect());
        } else {

          parts.push(this.cause.toString());
        }
      }
      return parts.join('')
    };

    return SubstanceError;
  }(Error));


  SubstanceError.fromJSON = function(err) {
    if (!err) { return null }
    var error = new SubstanceError(err.name, {
      message: err.message,
      info: err.info,
      errorCode: err.errorCode,
      cause: SubstanceError.fromJSON(err.cause)
    });
    return error
  };

  function extend() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return Object.assign.apply(Object, args)
  }

  function map(iteratee, func) {
    if (!iteratee) { return [] }
    if (!func) { func = function(item) { return item }; }
    if (Array.isArray(iteratee)) {
      return iteratee.map(func)
    } else if (typeof iteratee.length !== 'undefined') {
      var l = iteratee.length;
      var result = [];
      for (var i = 0; i < l; i++) {
        result.push(func(iteratee[i], i));
      }
      return result
    } else {
      return Object.keys(iteratee).map(function(key) {
        return func(iteratee[key], key)
      })
    }
  }

  function isPlainObject(o) {
    return Boolean(o) && o.constructor === {}.constructor
  }

  function isArray(a) {
    return Array.isArray(a)
  }

  function isEqual(a, b) {
    if (a === b) { return true }
    if (isArray(a) && isArray(b)) {
      if (a.length !== b.length) { return false }
      for (var i = 0; i < a.length; i++) {
        if (!isEqual(a[i], b[i])) { return false }
      }
      return true
    }
    if (isPlainObject(a) && isPlainObject(b)) {
      var akeys = Object.keys(a).sort();
      var bkeys = Object.keys(b).sort();
      if (!isEqual(akeys, bkeys)) { return false }
      for (var i$1 = 0; i$1 < akeys.length; i$1++) {
        var key = akeys[i$1];
        if (!isEqual(a[key], b[key])) { return false }
      }
      return true
    }
    return false
  }

  function clone(val) {
    if (isArray(val)) {
      return val.slice(0)
    }
    if (isObject(val)) {
      return Object.assign({}, val)
    }


    return val
  }

  var inBrowser = ( typeof window !== 'undefined');

  function cloneDeep(val) {
    if (isArray(val)) {
      return _cloneArrayDeep(val);
    }



    if (inBrowser && val instanceof window.File) {
      return val
    }
    if (isObject(val)) {
      return _cloneObjectDeep(val)
    }


    return val
  }

  function _cloneObjectDeep(obj) {
    var res = {};
    forEach(obj, function (val, key) {
      res[key] = cloneDeep(val);
    });
    return res
  }

  function _cloneArrayDeep(arr) {
    return arr.map(cloneDeep)
  }

  function uuid(prefix, len) {
    if (prefix && prefix[prefix.length-1] !== "-") {
      prefix = prefix.concat("-");
    }
    var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [];
    var radix = 16;
    var idx;
    len = len || 32;
    if (len) {

      for (idx = 0; idx < len; idx++) { uuid[idx] = chars[0 | Math.random()*radix]; }
    } else {

      var r;

      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';


      for (idx = 0; idx < 36; idx++) {
        if (!uuid[idx]) {
          r = 0 | Math.random()*16;
          uuid[idx] = chars[(idx === 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }
    return (prefix ? prefix : "") + uuid.join('');
  }

  function isNumber(n) {
    return typeof n === 'number'
  }

  function isNil(o) {
    return o === null || o === undefined
  }

  function isString(s) {
    return typeof s === 'string'
  }

  var isArray$1 = Array.isArray;

  function isObject$1(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  var funcTag = '[object Function]';
  var genTag = '[object GeneratorFunction]';


  var objectProto$1 = Object.prototype;


  var objectToString = objectProto$1.toString;


  function isFunction(value) {



    var tag = isObject$1(value) ? objectToString.call(value) : '';
    return tag == funcTag || tag == genTag;
  }

  function isHostObject(value) {


    var result = false;
    if (value != null && typeof value.toString != 'function') {
      try {
        result = !!(value + '');
      } catch (e) {}
    }
    return result;
  }

  function checkGlobal(value) {
    return (value && value.Object === Object) ? value : null;
  }

  var freeGlobal = checkGlobal(typeof global == 'object' && global);


  var freeSelf = checkGlobal(typeof self == 'object' && self);


  var thisGlobal = checkGlobal(typeof undefined == 'object' && undefined);


  var root = freeGlobal || freeSelf || thisGlobal || Function('return this')();

  var coreJsData = root['__core-js_shared__'];

  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());


  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  var funcToString$1 = Function.prototype.toString;


  function toSource(func) {
    if (func != null) {
      try {
        return funcToString$1.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;


  var reIsHostCtor = /^\[object .+?Constructor\]$/;


  var objectProto = Object.prototype;


  var funcToString = Function.prototype.toString;


  var hasOwnProperty = objectProto.hasOwnProperty;


  var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
          .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );


  function baseIsNative(value) {
    if (!isObject$1(value) || isMasked(value)) {
      return false;
    }
    var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  var nativeCreate = getNative(Object, 'create');

  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
  }

  function hashDelete(key) {
    return this.has(key) && delete this.__data__[key];
  }

  var HASH_UNDEFINED = '__lodash_hash_undefined__';


  var objectProto$2 = Object.prototype;


  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;


  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty$1.call(data, key) ? data[key] : undefined;
  }

  var objectProto$3 = Object.prototype;


  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;


  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== undefined : hasOwnProperty$2.call(data, key);
  }

  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';


  function hashSet(key, value) {
    var data = this.__data__;
    data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
    return this;
  }

  function Hash(entries) {
    var this$1 = this;

    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this$1.set(entry[0], entry[1]);
    }
  }


  Hash.prototype.clear = hashClear;
  Hash.prototype['delete'] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;

  function listCacheClear() {
    this.__data__ = [];
  }

  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  var arrayProto = Array.prototype;


  var splice = arrayProto.splice;


  function listCacheDelete(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    return true;
  }

  function listCacheGet(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }

  function listCacheSet(key, value) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  function ListCache(entries) {
    var this$1 = this;

    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this$1.set(entry[0], entry[1]);
    }
  }


  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype['delete'] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;

  var Map$1 = getNative(root, 'Map');

  function mapCacheClear() {
    this.__data__ = {
      'hash': new Hash,
      'map': new (Map$1 || ListCache),
      'string': new Hash
    };
  }

  function isKeyable(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
  }

  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
  }

  function mapCacheDelete(key) {
    return getMapData(this, key)['delete'](key);
  }

  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }

  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }

  function mapCacheSet(key, value) {
    getMapData(this, key).set(key, value);
    return this;
  }

  function MapCache(entries) {
    var this$1 = this;

    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this$1.set(entry[0], entry[1]);
    }
  }


  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype['delete'] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;

  var FUNC_ERROR_TEXT = 'Expected a function';


  function memoize(func, resolver) {
    if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments,
          key = resolver ? resolver.apply(this, args) : args[0],
          cache = memoized.cache;

      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result);
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache);
    return memoized;
  }


  memoize.Cache = MapCache;

  var Symbol = root.Symbol;

  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  var symbolTag = '[object Symbol]';


  var objectProto$4 = Object.prototype;


  var objectToString$1 = objectProto$4.toString;


  function isSymbol(value) {
    return typeof value == 'symbol' ||
        (isObjectLike(value) && objectToString$1.call(value) == symbolTag);
  }

  var INFINITY = 1 / 0;


  var symbolProto = Symbol ? Symbol.prototype : undefined;
  var symbolToString = symbolProto ? symbolProto.toString : undefined;


  function baseToString(value) {

    if (typeof value == 'string') {
      return value;
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }

  function toString(value) {
    return value == null ? '' : baseToString(value);
  }

  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g;


  var reEscapeChar = /\\(\\)?/g;


  var stringToPath = memoize(function(string) {
    var result = [];
    toString(string).replace(rePropName, function(match, number, quote, string) {
      result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
    });
    return result;
  });

  function castPath(value) {
    return isArray$1(value) ? value : stringToPath(value);
  }

  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var reIsPlainProp = /^\w*$/;


  function isKey(value, object) {
    if (isArray$1(value)) {
      return false;
    }
    var type = typeof value;
    if (type == 'number' || type == 'symbol' || type == 'boolean' ||
        value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object));
  }

  var INFINITY$1 = 1 / 0;


  function toKey(value) {
    if (typeof value == 'string' || isSymbol(value)) {
      return value;
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
  }

  function baseGet(object, path) {
    path = isKey(path, object) ? [path] : castPath(path);

    var index = 0,
        length = path.length;

    while (object != null && index < length) {
      object = object[toKey(path[index++])];
    }
    return (index && index == length) ? object : undefined;
  }

  function get(object, path, defaultValue) {
    var result = object == null ? undefined : baseGet(object, path);
    return result === undefined ? defaultValue : result;
  }

  var objectProto$5 = Object.prototype;


  var hasOwnProperty$3 = objectProto$5.hasOwnProperty;


  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty$3.call(object, key) && eq(objValue, value)) ||
        (value === undefined && !(key in object))) {
      object[key] = value;
    }
  }

  var MAX_SAFE_INTEGER = 9007199254740991;


  var reIsUint = /^(?:0|[1-9]\d*)$/;


  function isIndex(value, length) {
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length &&
        (typeof value == 'number' || reIsUint.test(value)) &&
        (value > -1 && value % 1 == 0 && value < length);
  }

  function baseSet(object, path, value, customizer) {
    path = isKey(path, object) ? [path] : castPath(path);

    var index = -1,
        length = path.length,
        lastIndex = length - 1,
        nested = object;

    while (nested != null && ++index < length) {
      var key = toKey(path[index]);
      if (isObject$1(nested)) {
        var newValue = value;
        if (index != lastIndex) {
          var objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : undefined;
          if (newValue === undefined) {
            newValue = objValue == null
                ? (isIndex(path[index + 1]) ? [] : {})
                : objValue;
          }
        }
        assignValue(nested, key, newValue);
      }
      nested = nested[key];
    }
    return object;
  }

  function setWith(object, path, value, customizer) {
    customizer = typeof customizer == 'function' ? customizer : undefined;
    return object == null ? object : baseSet(object, path, value, customizer);
  }

  var nativeGetPrototype = Object.getPrototypeOf;


  function getPrototype(value) {
    return nativeGetPrototype(Object(value));
  }

  var objectProto$6 = Object.prototype;


  var hasOwnProperty$4 = objectProto$6.hasOwnProperty;


  function baseHas(object, key) {



    return object != null &&
        (hasOwnProperty$4.call(object, key) ||
        (typeof object == 'object' && key in object && getPrototype(object) === null));
  }

  function last(array) {
    var length = array ? array.length : 0;
    return length ? array[length - 1] : undefined;
  }

  function baseSlice(array, start, end) {
    var index = -1,
        length = array.length;

    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }
    end = end > length ? length : end;
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : ((end - start) >>> 0);
    start >>>= 0;

    var result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  }

  function parent(object, path) {
    return path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
  }

  function baseUnset(object, path) {
    path = isKey(path, object) ? [path] : castPath(path);
    object = parent(object, path);

    var key = toKey(last(path));
    return !(object != null && baseHas(object, key)) || delete object[key];
  }

  function unset(object, path) {
    return object == null ? true : baseUnset(object, path);
  }

  var PathObject = function PathObject(root) {
    if (root) {
      this.__root__ = root;
    }
  };

  PathObject.prototype.contains = function contains (id) {
    return Boolean(this.getRoot()[id])
  };

  PathObject.prototype.getRoot = function getRoot () {
    if (this.__root__) {
      return this.__root__
    } else {
      return this
    }
  };


  PathObject.prototype.get = function get$1 (path) {
    if (!path) {
      return undefined
    }
    if (isString(path)) {
      return this.getRoot()[path]
    }
    if (arguments.length > 1) {
      path = Array.prototype.slice(arguments, 0);
    }
    if (!isArray(path)) {
      throw new Error('Illegal argument for PathObject.get()')
    }
    return get(this.getRoot(), path)
  };

  PathObject.prototype.set = function set (path, value) {
    if (!path) {
      throw new Error('Illegal argument: PathObject.set(>path<, value) - path is mandatory.')
    }
    if (isString(path)) {
      this.getRoot()[path] = value;
    } else {
      setWith(this.getRoot(), path, value);
    }
  };

  PathObject.prototype.delete = function delete$1 (path) {
    if (isString(path)) {
      delete this.getRoot()[path];
    } else if (path.length === 1) {
      delete this.getRoot()[path[0]];
    } else {
      var success = unset(this.getRoot(), path);
      if (!success) {
        throw new Error('Could not delete property at path' + path)
      }
    }
  };

  PathObject.prototype.clear = function clear () {
    var root = this.getRoot();
    for (var key in root) {
      if (root.hasOwnProperty(key)) {
        delete root[key];
      }
    }
  };

  PathObject.prototype._isPathObject = true;

  var Conflict = (function (Error) {
    function Conflict(a, b) {
      Error.call(this, "Conflict: " + JSON.stringify(a) +" vs " + JSON.stringify(b));
      this.a = a;
      this.b = b;
    }

    if ( Error ) Conflict.__proto__ = Error;
    Conflict.prototype = Object.create( Error && Error.prototype );
    Conflict.prototype.constructor = Conflict;

    return Conflict;
  }(Error));

  var INSERT = "insert";
  var DELETE$1 = "delete";

  var TextOperation = function TextOperation(data) {
    if (!data || data.type === undefined || data.pos === undefined || data.str === undefined) {
      throw new Error("Illegal argument: insufficient data.")
    }

    this.type = data.type;

    this.pos = data.pos;

    this.str = data.str;

    if(!this.isInsert() && !this.isDelete()) {
      throw new Error("Illegal type.")
    }
    if (!isString(this.str)) {
      throw new Error("Illegal argument: expecting string.")
    }
    if (!isNumber(this.pos) || this.pos < 0) {
      throw new Error("Illegal argument: expecting positive number as pos.")
    }
  };

  TextOperation.prototype.apply = function apply (str) {
    if (this.isEmpty()) { return str }
    if (this.type === INSERT) {
      if (str.length < this.pos) {
        throw new Error("Provided string is too short.")
      }
      if (str.splice) {
        return str.splice(this.pos, 0, this.str)
      } else {
        return str.slice(0, this.pos).concat(this.str).concat(str.slice(this.pos))
      }
    }
    else  {
      if (str.length < this.pos + this.str.length) {
        throw new Error("Provided string is too short.")
      }
      if (str.splice) {
        return str.splice(this.pos, this.str.length)
      } else {
        return str.slice(0, this.pos).concat(str.slice(this.pos + this.str.length))
      }
    }
  };

  TextOperation.prototype.clone = function clone () {
    return new TextOperation(this)
  };

  TextOperation.prototype.isNOP = function isNOP () {
    return this.type === "NOP" || this.str.length === 0
  };

  TextOperation.prototype.isInsert = function isInsert () {
    return this.type === INSERT
  };

  TextOperation.prototype.isDelete = function isDelete () {
    return this.type === DELETE$1
  };

  TextOperation.prototype.getLength = function getLength () {
    return this.str.length
  };

  TextOperation.prototype.invert = function invert () {
    var data = {
      type: this.isInsert() ? DELETE$1 : INSERT,
      pos: this.pos,
      str: this.str
    };
    return new TextOperation(data)
  };

  TextOperation.prototype.hasConflict = function hasConflict$1 (other) {
    return hasConflict$1(this, other)
  };

  TextOperation.prototype.isEmpty = function isEmpty () {
    return this.str.length === 0
  };

  TextOperation.prototype.toJSON = function toJSON () {
    return {
      type: this.type,
      pos: this.pos,
      str: this.str
    }
  };

  TextOperation.prototype.toString = function toString () {
    return ["(", (this.isInsert() ? INSERT : DELETE$1), ",", this.pos, ",'", this.str, "')"].join('')
  };

  TextOperation.prototype._isOperation = true;
  TextOperation.prototype._isTextOperation = true;

  function hasConflict$1(a, b) {



    if (a.type === INSERT && b.type === INSERT) { return (a.pos === b.pos) }



    if (a.type === DELETE$1 && b.type === DELETE$1) {

      return !(a.pos >= b.pos + b.str.length || b.pos >= a.pos + a.str.length)
    }



    var del, ins;
    if (a.type === DELETE$1) {
      del = a; ins = b;
    } else {
      del = b; ins = a;
    }
    return (ins.pos >= del.pos && ins.pos < del.pos + del.str.length)
  }




  function transform_insert_insert(a, b) {
    if (a.pos === b.pos) {
      b.pos += a.str.length;
    }
    else if (a.pos < b.pos) {
      b.pos += a.str.length;
    }
    else {
      a.pos += b.str.length;
    }
  }





  function transform_delete_delete$1(a, b, first) {

    if (a.pos > b.pos) {
      return transform_delete_delete$1(b, a, !first)
    }
    if (a.pos === b.pos && a.str.length > b.str.length) {
      return transform_delete_delete$1(b, a, !first)
    }

    if (b.pos < a.pos + a.str.length) {
      var s = b.pos - a.pos;
      var s1 = a.str.length - s;
      var s2 = s + b.str.length;
      a.str = a.str.slice(0, s) + a.str.slice(s2);
      b.str = b.str.slice(s1);
      b.pos -= s;
    } else {
      b.pos -= a.str.length;
    }
  }





  function transform_insert_delete(a, b) {
    if (a.type === DELETE$1) {
      return transform_insert_delete(b, a)
    }


    if (a.pos <= b.pos) {
      b.pos += a.str.length;
    }

    else if (a.pos >= b.pos + b.str.length) {
      a.pos -= b.str.length;
    }



    else {
      var s = a.pos - b.pos;
      b.str = b.str.slice(0, s) + a.str + b.str.slice(s);
      a.str = "";
    }
  }

  function transform$1(a, b, options) {
    options = options || {};
    if (options["no-conflict"] && hasConflict$1(a, b)) {
      throw new Conflict(a, b)
    }
    if (!options.inplace) {
      a = a.clone();
      b = b.clone();
    }
    if (a.type === INSERT && b.type === INSERT) {
      transform_insert_insert(a, b);
    }
    else if (a.type === DELETE$1 && b.type === DELETE$1) {
      transform_delete_delete$1(a, b, true);
    }
    else {
      transform_insert_delete(a,b);
    }
    return [a, b]
  }

  TextOperation.transform = function() {
    return transform$1.apply(null, arguments)
  };



  TextOperation.Insert = function(pos, str) {
    return new TextOperation({ type: INSERT, pos: pos, str: str })
  };

  TextOperation.Delete = function(pos, str) {
    return new TextOperation({ type: DELETE$1, pos: pos, str: str })
  };

  TextOperation.INSERT = INSERT;
  TextOperation.DELETE = DELETE$1;

  TextOperation.fromJSON = function(data) {
    return new TextOperation(data)
  };

  var NOP$1 = "NOP";
  var DELETE$2 = "delete";
  var INSERT$1 = "insert";

  var ArrayOperation = function ArrayOperation(data) {
    if (!data || !data.type) {
      throw new Error("Illegal argument: insufficient data.")
    }
    this.type = data.type;
    if (this.type === NOP$1) { return }

    if (this.type !== INSERT$1 && this.type !== DELETE$2) {
      throw new Error("Illegal type.")
    }

    this.pos = data.pos;

    this.val = data.val;
    if (!isNumber(this.pos) || this.pos < 0) {
      throw new Error("Illegal argument: expecting positive number as pos.")
    }
  };

  ArrayOperation.prototype.apply = function apply (array) {
    if (this.type === NOP$1) {
      return array
    }
    if (this.type === INSERT$1) {
      if (array.length < this.pos) {
        throw new Error("Provided array is too small.")
      }
      array.splice(this.pos, 0, this.val);
      return array
    }

    else  {
      if (array.length < this.pos) {
        throw new Error("Provided array is too small.")
      }
      if (!isEqual(array[this.pos], this.val)) {
        throw Error("Unexpected value at position " + this.pos + ". Expected " + this.val + ", found " + array[this.pos])
      }
      array.splice(this.pos, 1);
      return array
    }
  };

  ArrayOperation.prototype.clone = function clone () {
    var data = {
      type: this.type,
      pos: this.pos,
      val: cloneDeep(this.val)
    };
    return new ArrayOperation(data)
  };

  ArrayOperation.prototype.invert = function invert () {
    var data = this.toJSON();
    if (this.type === NOP$1) { data.type = NOP$1; }
    else if (this.type === INSERT$1) { data.type = DELETE$2; }
    else  { data.type = INSERT$1; }
    return new ArrayOperation(data)
  };

  ArrayOperation.prototype.hasConflict = function hasConflict (other) {
    return ArrayOperation.hasConflict(this, other)
  };

  ArrayOperation.prototype.toJSON = function toJSON () {
    var result = {
      type: this.type,
    };
    if (this.type === NOP$1) { return result }
    result.pos = this.pos;
    result.val = cloneDeep(this.val);
    return result
  };

  ArrayOperation.prototype.isInsert = function isInsert () {
    return this.type === INSERT$1
  };

  ArrayOperation.prototype.isDelete = function isDelete () {
    return this.type === DELETE$2
  };

  ArrayOperation.prototype.getOffset = function getOffset () {
    return this.pos
  };

  ArrayOperation.prototype.getValue = function getValue () {
    return this.val
  };

  ArrayOperation.prototype.isNOP = function isNOP () {
    return this.type === NOP$1
  };

  ArrayOperation.prototype.toString = function toString () {
    return ["(", (this.isInsert() ? INSERT$1 : DELETE$2), ",", this.getOffset(), ",'", this.getValue(), "')"].join('')
  };

  ArrayOperation.prototype._isOperation = true;
  ArrayOperation.prototype._isArrayOperation = true;

  function hasConflict$2(a, b) {
    if (a.type === NOP$1 || b.type === NOP$1) { return false }
    if (a.type === INSERT$1 && b.type === INSERT$1) {
      return a.pos === b.pos
    } else {
      return false
    }
  }

  function transform_insert_insert$1(a, b) {
    if (a.pos === b.pos) {
      b.pos += 1;
    }

    else if (a.pos < b.pos) {
      b.pos += 1;
    }

    else {
      a.pos += 1;
    }
  }

  function transform_delete_delete$2(a, b) {

    if (a.pos === b.pos) {
      b.type = NOP$1;
      a.type = NOP$1;
      return
    }
    if (a.pos < b.pos) {
      b.pos -= 1;
    } else {
      a.pos -= 1;
    }
  }

  function transform_insert_delete$1(a, b) {

    if (a.type === DELETE$2) {
      var tmp = a;
      a = b;
      b = tmp;
    }
    if (a.pos <= b.pos) {
      b.pos += 1;
    } else {
      a.pos -= 1;
    }
  }

  var transform$2 = function(a, b, options) {
    options = options || {};


    if (options['no-conflict'] && hasConflict$2(a, b)) {
      throw new Conflict(a, b)
    }

    if (!options.inplace) {
      a = a.clone();
      b = b.clone();
    }
    if (a.type === NOP$1 || b.type === NOP$1) {

    }
    else if (a.type === INSERT$1 && b.type === INSERT$1) {
      transform_insert_insert$1(a, b);
    }
    else if (a.type === DELETE$2 && b.type === DELETE$2) {
      transform_delete_delete$2(a, b);
    }
    else {
      transform_insert_delete$1(a, b);
    }
    return [a, b]
  };

  ArrayOperation.transform = transform$2;
  ArrayOperation.hasConflict = hasConflict$2;



  ArrayOperation.Insert = function(pos, val) {
    return new ArrayOperation({type:INSERT$1, pos: pos, val: val})
  };

  ArrayOperation.Delete = function(pos, val) {
    return new ArrayOperation({ type:DELETE$2, pos: pos, val: val })
  };

  ArrayOperation.fromJSON = function(data) {
    return new ArrayOperation(data)
  };

  ArrayOperation.NOP = NOP$1;
  ArrayOperation.DELETE = DELETE$2;
  ArrayOperation.INSERT = INSERT$1;

  var SHIFT = 'shift';

  var CoordinateOperation = function CoordinateOperation(data) {
    if (!data || data.type === undefined) {
      throw new Error("Illegal argument: insufficient data.")
    }

    this.type = data.type;

    this.val = data.val;

    if(!this.isShift()) {
      throw new Error("Illegal type.")
    }
    if (!isNumber(this.val)) {
      throw new Error("Illegal argument: expecting number as shift value.")
    }
  };

  CoordinateOperation.prototype.apply = function apply (coor) {
    coor.offset = coor.offset + this.val;
  };

  CoordinateOperation.prototype.isShift = function isShift () {
    return this.type === SHIFT
  };

  CoordinateOperation.prototype.isNOP = function isNOP () {
    switch (this.type) {
      case SHIFT: {
        return this.val === 0
      }
      default:
        return false
    }
  };

  CoordinateOperation.prototype.clone = function clone () {
    return new CoordinateOperation(this)
  };

  CoordinateOperation.prototype.invert = function invert () {
    var data;
    switch (this.type) {
      case SHIFT:
        data = {
          type: SHIFT,
          val: -this.val
        };
        break
      default:
        throw new Error('Invalid type.')
    }
    return new CoordinateOperation(data)
  };

  CoordinateOperation.prototype.hasConflict = function hasConflict () {

    return false
  };

  CoordinateOperation.prototype.toJSON = function toJSON () {
    return {
      type: this.type,
      val: this.val
    }
  };

  CoordinateOperation.prototype.toString = function toString () {
    return ["(", (this.type), ",", this.val, "')"].join('')
  };

  CoordinateOperation.prototype._isOperation = true;
  CoordinateOperation.prototype._isCoordinateOperation = true;

  function transform_shift_shift(a, b) {
    a.val += b.val;
    b.val += a.val;
  }

  function transform$3(a, b, options) {
    options = options || {};

    if (!options.inplace) {
      a = a.clone();
      b = b.clone();
    }
    if (a.type === SHIFT && b.type === SHIFT) {
      transform_shift_shift(a, b);
    }
    else {
      throw new Error('Illegal type')
    }
    return [a, b]
  }

  CoordinateOperation.transform = function() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return transform$3.apply(void 0, args)
  };

  CoordinateOperation.fromJSON = function(json) {
    return new CoordinateOperation(json)
  };

  CoordinateOperation.Shift = function(val) {
    return new CoordinateOperation({
      type: SHIFT,
      val: val
    })
  };

  var NOP = "NOP";
  var CREATE = "create";
  var DELETE = 'delete';
  var UPDATE = 'update';
  var SET = 'set';

  var ObjectOperation = function ObjectOperation(data) {
    if (!data) {
      throw new Error('Data of ObjectOperation is missing.')
    }
    if (!data.type) {
      throw new Error('Invalid data: type is mandatory.')
    }
    this.type = data.type;
    if (data.type === NOP) {
      return
    }
    this.path = data.path;
    if (!data.path) {
      throw new Error('Invalid data: path is mandatory.')
    }
    if (this.type === CREATE || this.type === DELETE) {
      if (!data.val) {
        throw new Error('Invalid data: value is missing.')
      }
      this.val = data.val;
    }
    else if (this.type === UPDATE) {
      if (data.diff) {
        this.diff = data.diff;
        if (data.diff._isTextOperation) {
          this.propertyType = 'string';
        } else if (data.diff._isArrayOperation) {
          this.propertyType = 'array';
        } else if (data.diff._isCoordinateOperation) {
          this.propertyType = 'coordinate';
        } else {
          throw new Error('Invalid data: diff must be a TextOperation or an ArrayOperation.')
        }
      } else {
        throw new Error("Invalid data: diff is mandatory for update operation.")
      }
    }
    else if (this.type === SET) {
      this.val = data.val;
      this.original = data.original;
    } else {
      throw new Error('Invalid type: '+ data.type)
    }
  };

  ObjectOperation.prototype.apply = function apply (obj) {
    if (this.type === NOP) { return obj }
    var adapter;
    if (obj._isPathObject) {
      adapter = obj;
    } else {
      adapter = new PathObject(obj);
    }
    if (this.type === CREATE) {
      adapter.set(this.path, cloneDeep(this.val));
      return obj
    }
    if (this.type === DELETE) {
      adapter.delete(this.path, "strict");
    }
    else if (this.type === UPDATE) {
      var diff = this.diff;
      switch (this.propertyType) {
        case 'array': {
          var arr = adapter.get(this.path);
          diff.apply(arr);
          break
        }
        case 'string': {
          var str = adapter.get(this.path);
          if (isNil(str)) { str = ''; }
          str = diff.apply(str);
          adapter.set(this.path, str);
          break
        }
        case 'coordinate': {
          var coor = adapter.get(this.path);
          if (!coor) { throw new Error('No coordinate with path '+this.path) }
          diff.apply(coor);
          break
        }
        default:
          throw new Error('Invalid state.')
      }
    }
    else if (this.type === SET) {

      adapter.set(this.path, cloneDeep(this.val));
    }
    else {
      throw new Error('Invalid type.')
    }
    return obj
  };

  ObjectOperation.prototype.clone = function clone () {
    var data = {
      type: this.type,
      path: this.path,
    };
    if (this.val) {
      data.val = cloneDeep(this.val);
    }
    if (this.diff) {
      data.diff = this.diff.clone();
    }
    return new ObjectOperation(data)
  };

  ObjectOperation.prototype.isNOP = function isNOP () {
    if (this.type === NOP) { return true }
    else if (this.type === UPDATE) { return this.diff.isNOP() }
  };

  ObjectOperation.prototype.isCreate = function isCreate () {
    return this.type === CREATE
  };

  ObjectOperation.prototype.isDelete = function isDelete () {
    return this.type === DELETE
  };

  ObjectOperation.prototype.isUpdate = function isUpdate (propertyType) {
    if (propertyType) {
      return (this.type === UPDATE && this.propertyType === propertyType)
    } else {
      return this.type === UPDATE
    }
  };

  ObjectOperation.prototype.isSet = function isSet () {
    return this.type === SET
  };

  ObjectOperation.prototype.invert = function invert () {
    if (this.type === NOP) {
      return new ObjectOperation({ type: NOP })
    }
    var result = new ObjectOperation(this);
    if (this.type === CREATE) {
      result.type = DELETE;
    }
    else if (this.type === DELETE) {
      result.type = CREATE;
    }
    else if (this.type === UPDATE) {
      var invertedDiff;
      if (this.diff._isTextOperation) {
        invertedDiff = TextOperation.fromJSON(this.diff.toJSON()).invert();
      } else if (this.diff._isArrayOperation) {
        invertedDiff = ArrayOperation.fromJSON(this.diff.toJSON()).invert();
      } else if (this.diff._isCoordinateOperation) {
        invertedDiff = CoordinateOperation.fromJSON(this.diff.toJSON()).invert();
      } else {
        throw new Error('Illegal type')
      }
      result.diff = invertedDiff;
    }
    else  {
      result.val = this.original;
      result.original = this.val;
    }
    return result
  };

  ObjectOperation.prototype.hasConflict = function hasConflict (other) {
    return ObjectOperation.hasConflict(this, other)
  };

  ObjectOperation.prototype.toJSON = function toJSON () {
    if (this.type === NOP) {
      return { type: NOP }
    }
    var data = {
      type: this.type,
      path: this.path,
    };
    if (this.type === CREATE || this.type === DELETE) {
      data.val = this.val;
    }
    else if (this.type === UPDATE) {
      if (this.diff._isTextOperation) {
        data.propertyType = "string";
      } else if (this.diff._isArrayOperation) {
        data.propertyType = "array";
      } else if (this.diff._isCoordinateOperation) {
        data.propertyType = "coordinate";
      } else {
        throw new Error('Invalid property type.')
      }
      data.diff = this.diff.toJSON();
    }
    else  {
      data.val = this.val;
      data.original = this.original;
    }
    return data
  };

  ObjectOperation.prototype.getType = function getType () {
    return this.type
  };

  ObjectOperation.prototype.getPath = function getPath () {
    return this.path
  };

  ObjectOperation.prototype.getValue = function getValue () {
    return this.val
  };

  ObjectOperation.prototype.getOldValue = function getOldValue () {
    return this.original
  };

  ObjectOperation.prototype.getValueOp = function getValueOp () {
    return this.diff
  };

  ObjectOperation.prototype.toString = function toString () {
    switch (this.type) {
      case CREATE:
        return ["(+,", JSON.stringify(this.path), JSON.stringify(this.val), ")"].join('')
      case DELETE:
        return ["(-,", JSON.stringify(this.path), JSON.stringify(this.val), ")"].join('')
      case UPDATE:
        return ["(>>,", JSON.stringify(this.path), this.propertyType, this.diff.toString(), ")"].join('')
      case SET:
        return ["(=,", JSON.stringify(this.path), this.val, this.original, ")"].join('')
      case NOP:
        return "NOP"
      default:
        throw new Error('Invalid type')
    }
  };

  ObjectOperation.prototype._isOperation = true;
  ObjectOperation.prototype._isObjectOperation = true;



  function hasConflict(a, b) {
    if (a.type === NOP || b.type === NOP) { return false }
    return isEqual(a.path, b.path)
  }

  function transform_delete_delete(a, b) {


    a.type = NOP;
    b.type = NOP;
  }

  function transform_create_create() {
    throw new Error("Can not transform two concurring creates of the same property")
  }

  function transform_delete_create() {
    throw new Error('Illegal state: can not create and delete a value at the same time.')
  }

  function transform_delete_update(a, b, flipped) {
    if (a.type !== DELETE) {
      return transform_delete_update(b, a, true)
    }
    var op;
    switch (b.propertyType) {
      case 'string':
        op = TextOperation.fromJSON(b.diff);
        break
      case 'array':
        op = ArrayOperation.fromJSON(b.diff);
        break
      case 'coordinate':
        op = CoordinateOperation.fromJSON(b.diff);
        break
      default:
        throw new Error('Illegal type')
    }

    if (!flipped) {
      a.type = NOP;
      b.type = CREATE;
      b.val = op.apply(a.val);
    }

    else {
      a.val = op.apply(a.val);
      b.type = NOP;
    }
  }

  function transform_create_update() {

    throw new Error("Can not transform a concurring create and update of the same property")
  }

  function transform_update_update(a, b) {

    var op_a, op_b, t;
    switch(b.propertyType) {
      case 'string':
        op_a = TextOperation.fromJSON(a.diff);
        op_b = TextOperation.fromJSON(b.diff);
        t = TextOperation.transform(op_a, op_b, {inplace: true});
        break
      case 'array':
        op_a = ArrayOperation.fromJSON(a.diff);
        op_b = ArrayOperation.fromJSON(b.diff);
        t = ArrayOperation.transform(op_a, op_b, {inplace: true});
        break
      case 'coordinate':
        op_a = CoordinateOperation.fromJSON(a.diff);
        op_b = CoordinateOperation.fromJSON(b.diff);
        t = CoordinateOperation.transform(op_a, op_b, {inplace: true});
        break
      default:
        throw new Error('Illegal type')
    }
    a.diff = t[0];
    b.diff = t[1];
  }

  function transform_create_set() {
    throw new Error('Illegal state: can not create and set a value at the same time.')
  }

  function transform_delete_set(a, b, flipped) {
    if (a.type !== DELETE) { return transform_delete_set(b, a, true) }
    if (!flipped) {
      a.type = NOP;
      b.type = CREATE;
      b.original = undefined;
    } else {
      a.val = b.val;
      b.type = NOP;
    }
  }

  function transform_update_set() {
    throw new Error("Unresolvable conflict: update + set.")
  }

  function transform_set_set(a, b) {
    a.type = NOP;
    b.original = a.val;
  }

  var _NOP = 0;
  var _CREATE = 1;
  var _DELETE = 2;
  var _UPDATE = 4;
  var _SET = 8;

  var CODE = (function () {
    var c = {};
    c[NOP] =_NOP;
    c[CREATE] = _CREATE;
    c[DELETE] = _DELETE;
    c[UPDATE] = _UPDATE;
    c[SET] = _SET;
    return c
  })();

  var __transform__ = (function () {

    var t = {};
    t[_DELETE | _DELETE] = transform_delete_delete;
    t[_DELETE | _CREATE] = transform_delete_create;
    t[_DELETE | _UPDATE] = transform_delete_update;
    t[_CREATE | _CREATE] = transform_create_create;
    t[_CREATE | _UPDATE] = transform_create_update;
    t[_UPDATE | _UPDATE] = transform_update_update;
    t[_CREATE | _SET   ] = transform_create_set;
    t[_DELETE | _SET   ] = transform_delete_set;
    t[_UPDATE | _SET   ] = transform_update_set;
    t[_SET    | _SET   ] = transform_set_set;

    return t
  })();

  function transform(a, b, options) {
    options = options || {};
    if (options['no-conflict'] && hasConflict(a, b)) {
      throw new Conflict(a, b)
    }
    if (!options.inplace) {
      a = a.clone();
      b = b.clone();
    }
    if (a.isNOP() || b.isNOP()) {
      return [a, b]
    }
    var sameProp = isEqual(a.path, b.path);

    if (sameProp) {
      __transform__[CODE[a.type] | CODE[b.type]](a,b);
    }
    return [a, b]
  }

  ObjectOperation.transform = transform;
  ObjectOperation.hasConflict = hasConflict;



  ObjectOperation.Create = function(idOrPath, val) {
    var path;
    if (isString(idOrPath)) {
      path = [idOrPath];
    } else {
      path = idOrPath;
    }
    return new ObjectOperation({type: CREATE, path: path, val: val})
  };

  ObjectOperation.Delete = function(idOrPath, val) {
    var path;
    if (isString(idOrPath)) {
      path = [idOrPath];
    } else {
      path = idOrPath;
    }
    return new ObjectOperation({type: DELETE, path: path, val: val})
  };

  ObjectOperation.Update = function(path, op) {
    return new ObjectOperation({
      type: UPDATE,
      path: path,
      diff: op
    })
  };

  ObjectOperation.Set = function(path, oldVal, newVal) {
    return new ObjectOperation({
      type: SET,
      path: path,
      val: cloneDeep(newVal),
      original: cloneDeep(oldVal)
    })
  };

  ObjectOperation.fromJSON = function(data) {
    data = cloneDeep(data);
    if (data.type === "update") {
      switch (data.propertyType) {
        case "string":
          data.diff = TextOperation.fromJSON(data.diff);
          break
        case "array":
          data.diff = ArrayOperation.fromJSON(data.diff);
          break
        case "coordinate":
          data.diff = CoordinateOperation.fromJSON(data.diff);
          break
        default:
          throw new Error("Unsupported update diff:" + JSON.stringify(data.diff))
      }
    }
    var op = new ObjectOperation(data);
    return op
  };

  ObjectOperation.NOP = NOP;
  ObjectOperation.CREATE = CREATE;
  ObjectOperation.DELETE = DELETE;
  ObjectOperation.UPDATE = UPDATE;
  ObjectOperation.SET = SET;

  var OperationSerializer = function OperationSerializer() {
    this.SEPARATOR = '\t';
  };

  OperationSerializer.prototype.serialize = function serialize (op) {
    var out = [];
    switch (op.type) {
      case 'create':
        out.push('c');
        out.push(op.val.id);
        out.push(op.val);
        break
      case 'delete':
        out.push('d');
        out.push(op.val.id);
        out.push(op.val);
        break
      case 'set':
        out.push('s');
        out.push(op.path.join('.'));
        out.push(op.val);
        out.push(op.original);
        break
      case 'update':
        out.push('u');
        out.push(op.path.join('.'));
        Array.prototype.push.apply(out, this.serializePrimitiveOp(op.diff));
        break
      default:
        throw new Error('Unsupported operation type.')
    }
    return out
  };

  OperationSerializer.prototype.serializePrimitiveOp = function serializePrimitiveOp (op) {
    var out = [];
    if (op._isTextOperation) {
      if (op.isInsert()) {
        out.push('t+');
      } else if (op.isDelete()) {
        out.push('t-');
      }
      out.push(op.pos);
      out.push(op.str);
    } else if (op._isArrayOperation) {
      if (op.isInsert()) {
        out.push('a+');
      } else if (op.isDelete()) {
        out.push('a-');
      }
      out.push(op.pos);
      out.push(op.val);
    } else if (op._isCoordinateOperation) {
      if (op.isShift()) {
        out.push('c>>');
      } else {
        throw new Error('Unsupported CoordinateOperation type.')
      }
      out.push(op.pos);
      out.push(op.val);
    } else {
      throw new Error('Unsupported operation type.')
    }
    return out
  };

  OperationSerializer.prototype.deserialize = function deserialize (str, tokenizer) {
    if (!tokenizer) {
      tokenizer = new Tokenizer(str, this.SEPARATOR);
    }
    var type = tokenizer.getString();
    var op, path, val, oldVal, diff;
    switch (type) {
      case 'c':
        path = tokenizer.getPath();
        val = tokenizer.getObject();
        op = ObjectOperation.Create(path, val);
        break
      case 'd':
        path = tokenizer.getPath();
        val = tokenizer.getObject();
        op = ObjectOperation.Delete(path, val);
        break
      case 's':
        path = tokenizer.getPath();
        val = tokenizer.getAny();
        oldVal = tokenizer.getAny();
        op = ObjectOperation.Set(path, oldVal, val);
        break
      case 'u':
        path = tokenizer.getPath();
        diff = this.deserializePrimitiveOp(str, tokenizer);
        op = ObjectOperation.Update(path, diff);
        break
      default:
        throw new Error('Illegal type for ObjectOperation: '+ type)
    }
    return op
  };

  OperationSerializer.prototype.deserializePrimitiveOp = function deserializePrimitiveOp (str, tokenizer) {
    if (!tokenizer) {
      tokenizer = new Tokenizer(str, this.SEPARATOR);
    }
    var type = tokenizer.getString();
    var op, pos, val;
    switch (type) {
      case 't+':
        pos = tokenizer.getNumber();
        val = tokenizer.getString();
        op = TextOperation.Insert(pos, val);
        break
      case 't-':
        pos = tokenizer.getNumber();
        val = tokenizer.getString();
        op = TextOperation.Delete(pos, val);
        break
      case 'a+':
        pos = tokenizer.getNumber();
        val = tokenizer.getAny();
        op = ArrayOperation.Insert(pos, val);
        break
      case 'a-':
        pos = tokenizer.getNumber();
        val = tokenizer.getAny();
        op = ArrayOperation.Delete(pos, val);
        break
      case 'c>>':
        val = tokenizer.getNumber();
        op = CoordinateOperation.Shift(val);
        break
      default:
        throw new Error('Unsupported operation type: ' + type)
    }
    return op
  };

  var Tokenizer = function Tokenizer(str, sep) {
    if (isArray(arguments[0])) {
      this.tokens = arguments[0];
    } else {
      this.tokens = str.split(sep);
    }
    this.pos = -1;
  };

  Tokenizer.prototype.error = function error (msg) {
    throw new Error('Parsing error: ' + msg + '\n' + this.tokens[this.pos])
  };

  Tokenizer.prototype.getString = function getString () {
    this.pos++;
    var str = this.tokens[this.pos];
    if (str[0] === '"') {
      str = str.slice(1, -1);
    }
    return str
  };

  Tokenizer.prototype.getNumber = function getNumber () {
    this.pos++;
    var number;
    var token = this.tokens[this.pos];
    try {
      if (isNumber(token)) {
        number = token;
      } else {
        number = parseInt(this.tokens[this.pos], 10);
      }
      return number
    } catch (err) {
      this.error('expected number');
    }
  };

  Tokenizer.prototype.getObject = function getObject () {
    this.pos++;
    var obj;
    var token = this.tokens[this.pos];
    try {
      if (isObject(token)) {
        obj = token;
      } else {
        obj = JSON.parse(this.tokens[this.pos]);
      }
      return obj
    } catch (err) {
      this.error('expected object');
    }
  };

  Tokenizer.prototype.getAny = function getAny () {
    this.pos++;
    var token = this.tokens[this.pos];
    return token
  };

  Tokenizer.prototype.getPath = function getPath () {
    var str = this.getString();
    return str.split('.')
  };

  OperationSerializer.Tokenizer = Tokenizer;

  function isArrayEqual(arr1, arr2) {
    if (arr1 === arr2) { return true }
    if (!isArray(arr1) || !isArray(arr2)) { return false }
    if (arr1.length !== arr2.length) { return false }
    var L = arr1.length;
    for (var i = 0; i < L; i++) {
      if (arr1[i] !== arr2[i]) { return false }
    }
    return true
  }

  var Coordinate = function Coordinate(path, offset) {

    if (arguments[0] === 'SKIP') { return }
    if (arguments.length === 1) {
      var data = arguments[0];
      this.path = data.path;
      this.offset = data.offset;
    } else {
      this.path = path;
      this.offset = offset;
    }
    if (!isArray(this.path)) {
      throw new Error('Invalid arguments: path should be an array.')
    }
    if (!isNumber(this.offset) || this.offset < 0) {
      throw new Error('Invalid arguments: offset must be a positive number.')
    }
  };

  Coordinate.prototype.equals = function equals (other) {
    return (other === this ||
    (isArrayEqual(other.path, this.path) && other.offset === this.offset) )
  };

  Coordinate.prototype.withCharPos = function withCharPos (offset) {
    return new Coordinate(this.path, offset)
  };

  Coordinate.prototype.getNodeId = function getNodeId () {
    return this.path[0]
  };

  Coordinate.prototype.getPath = function getPath () {
    return this.path
  };

  Coordinate.prototype.getOffset = function getOffset () {
    return this.offset
  };

  Coordinate.prototype.toJSON = function toJSON () {
    return {
      path: this.path.slice(),
      offset: this.offset
    }
  };

  Coordinate.prototype.toString = function toString () {
    return "(" + this.path.join('.') + ", " + this.offset + ")"
  };

  Coordinate.prototype.isPropertyCoordinate = function isPropertyCoordinate () {
    return this.path.length > 1
  };

  Coordinate.prototype.isNodeCoordinate = function isNodeCoordinate () {
    return this.path.length === 1
  };

  Coordinate.prototype.hasSamePath = function hasSamePath (other) {
    return isArrayEqual(this.path, other.path)
  };

  Coordinate.prototype._isCoordinate = true;

  var Anchor = (function (Coordinate$$1) {
    function Anchor () {
      Coordinate$$1.apply(this, arguments);
    }

    if ( Coordinate$$1 ) Anchor.__proto__ = Coordinate$$1;
    Anchor.prototype = Object.create( Coordinate$$1 && Coordinate$$1.prototype );
    Anchor.prototype.constructor = Anchor;

    Anchor.prototype.isAnchor = function isAnchor () {
      return true
    };

    return Anchor;
  }(Coordinate));

  var Selection = function Selection() {

    var _internal = {};
    Object.defineProperty(this, "_internal", {
      enumerable: false,
      value: _internal
    });

    _internal.doc = null;
  };

  var prototypeAccessors$1 = { type: {} };

  Selection.prototype.clone = function clone () {
    var newSel = this._clone();
    if (this._internal.doc) {
      newSel.attach(this._internal.doc);
    }
    return newSel
  };


  Selection.prototype.getDocument = function getDocument () {
    var doc = this._internal.doc;
    if (!doc) {
      throw new Error('Selection is not attached to a document.')
    }
    return doc
  };

  Selection.prototype.isAttached = function isAttached () {
    return Boolean(this._internal.doc)
  };


  Selection.prototype.attach = function attach (doc) {
    this._internal.doc = doc;
    return this
  };


  Selection.prototype.isNull = function isNull () { return false; };


  Selection.prototype.isPropertySelection = function isPropertySelection () { return false; };


  Selection.prototype.isContainerSelection = function isContainerSelection () { return false; };


  Selection.prototype.isNodeSelection = function isNodeSelection () { return false; };

  Selection.prototype.isCustomSelection = function isCustomSelection () { return false; };


  Selection.prototype.isCollapsed = function isCollapsed () { return true; };


  Selection.prototype.isReverse = function isReverse () { return false; };

  Selection.prototype.getType = function getType () {
    throw new Error('Selection.getType() is abstract.')
  };

  prototypeAccessors$1.type.get = function () {
    return this.getType()
  };


  Selection.prototype.equals = function equals (other) {
    if (this === other) {
      return true
    } else if (!other) {
      return false
    } else if (this.isNull() !== other.isNull()) {
      return false
    } else if (this.getType() !== other.getType()) {
      return false
    } else {


      return true
    }
  };


  Selection.prototype.toString = function toString () {
    return "null"
  };


  Selection.prototype.toJSON = function toJSON () {
    throw new Error('This method is abstract.')
  };


  Selection.prototype.getFragments = function getFragments () {
    return []
  };

  Selection.prototype.createWith = function createWith (update) {
    var SelectionClass = this.constructor;
    var data = this.toJSON();
    Object.assign(data, update);
    return SelectionClass.fromJSON(data)
  };

  Object.defineProperties( Selection.prototype, prototypeAccessors$1 );


  Selection.prototype._isSelection = true;


  var NullSelection = (function (Selection) {
    function NullSelection () {
      Selection.apply(this, arguments);
    }

    if ( Selection ) NullSelection.__proto__ = Selection;
    NullSelection.prototype = Object.create( Selection && Selection.prototype );
    NullSelection.prototype.constructor = NullSelection;

    NullSelection.prototype.isNull = function isNull () {
      return true
    };

    NullSelection.prototype.getType = function getType () {
      return 'null'
    };

    NullSelection.prototype.toJSON = function toJSON () {
      return null
    };

    NullSelection.prototype.clone = function clone () {
      return this
    };

    return NullSelection;
  }(Selection));



  Selection.nullSelection = Object.freeze(new NullSelection());


  var SelectionFragment = (function (EventEmitter$$1) {
    function SelectionFragment(path, startOffset, endOffset, full) {
      EventEmitter$$1.call(this);

      this.type = "selection-fragment";
      this.path = path;
      this.startOffset = startOffset;
      this.endOffset = endOffset || startOffset;
      this.full = Boolean(full);
    }

    if ( EventEmitter$$1 ) SelectionFragment.__proto__ = EventEmitter$$1;
    SelectionFragment.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    SelectionFragment.prototype.constructor = SelectionFragment;

    SelectionFragment.prototype.isAnchor = function isAnchor () {
      return false
    };

    SelectionFragment.prototype.isInline = function isInline () {
      return false
    };

    SelectionFragment.prototype.isPropertyFragment = function isPropertyFragment () {
      return true
    };

    SelectionFragment.prototype.isNodeFragment = function isNodeFragment () {
      return false
    };

    SelectionFragment.prototype.isFull = function isFull () {
      return this.full
    };

    SelectionFragment.prototype.isPartial = function isPartial () {
      return !this.full
    };

    SelectionFragment.prototype.getNodeId = function getNodeId () {
      return this.path[0]
    };

    return SelectionFragment;
  }(EventEmitter));

  Selection.Fragment = SelectionFragment;


  var NodeFragment = (function (EventEmitter$$1) {
    function NodeFragment(nodeId) {
      EventEmitter$$1.call(this);

      this.type = "node-fragment";
      this.nodeId = nodeId;
      this.path = [nodeId];
    }

    if ( EventEmitter$$1 ) NodeFragment.__proto__ = EventEmitter$$1;
    NodeFragment.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    NodeFragment.prototype.constructor = NodeFragment;

    NodeFragment.prototype.isAnchor = function isAnchor () {
      return false
    };

    NodeFragment.prototype.isInline = function isInline () {
      return false
    };

    NodeFragment.prototype.isPropertyFragment = function isPropertyFragment () {
      return false
    };

    NodeFragment.prototype.isNodeFragment = function isNodeFragment () {
      return true
    };

    NodeFragment.prototype.isFull = function isFull () {
      return true
    };

    NodeFragment.prototype.isPartial = function isPartial () {
      return false
    };

    NodeFragment.prototype.getNodeId = function getNodeId () {
      return this.nodeId
    };

    return NodeFragment;
  }(EventEmitter));

  Selection.NodeFragment = NodeFragment;


  var Cursor = (function (Anchor$$1) {
    function Cursor(path, offset) {
      Anchor$$1.call(this, path, offset);

      this.type = "cursor";
    }

    if ( Anchor$$1 ) Cursor.__proto__ = Anchor$$1;
    Cursor.prototype = Object.create( Anchor$$1 && Anchor$$1.prototype );
    Cursor.prototype.constructor = Cursor;

    Cursor.prototype.isPropertyFragment = function isPropertyFragment () {
      return false
    };

    Cursor.prototype.isNodeFragment = function isNodeFragment () {
      return false
    };

    return Cursor;
  }(Anchor));

  Selection.Cursor = Cursor;

  var PropertySelection = (function (Selection$$1) {
    function PropertySelection(path, startOffset, endOffset, reverse, containerId, surfaceId) {
      Selection$$1.call(this);

      if (arguments.length === 1) {
        var data = arguments[0];
        path = data.path;
        startOffset = data.startOffset;
        endOffset = data.endOffset;
        reverse = data.reverse;
        containerId = data.containerId;
        surfaceId = data.surfaceId;
      }

      if (!path || !isNumber(startOffset)) {
        throw new Error('Invalid arguments: `path` and `startOffset` are mandatory');
      }

      this.start = new Coordinate(path, startOffset);
      this.end = new Coordinate(path, isNumber(endOffset) ? endOffset : startOffset);


      this.reverse = Boolean(reverse);

      this.containerId = containerId;


      this.surfaceId = surfaceId;
    }

    if ( Selection$$1 ) PropertySelection.__proto__ = Selection$$1;
    PropertySelection.prototype = Object.create( Selection$$1 && Selection$$1.prototype );
    PropertySelection.prototype.constructor = PropertySelection;

    var prototypeAccessors = { path: {},startOffset: {},endOffset: {} };

    prototypeAccessors.path.get = function () {
      return this.start.path
    };

    prototypeAccessors.startOffset.get = function () {
      console.warn('DEPRECATED: Use sel.start.offset instead');
      return this.start.offset
    };

    prototypeAccessors.endOffset.get = function () {
      console.warn('DEPRECATED: Use sel.end.offset instead');
      return this.end.offset
    };


    PropertySelection.prototype.toJSON = function toJSON () {
      return {
        type: 'property',
        path: this.start.path,
        startOffset: this.start.offset,
        endOffset: this.end.offset,
        reverse: this.reverse,
        containerId: this.containerId,
        surfaceId: this.surfaceId
      }
    };

    PropertySelection.prototype.isPropertySelection = function isPropertySelection () {
      return true
    };

    PropertySelection.prototype.getType = function getType () {
      return 'property'
    };

    PropertySelection.prototype.isNull = function isNull () {
      return false
    };

    PropertySelection.prototype.isCollapsed = function isCollapsed () {
      return this.start.offset === this.end.offset;
    };

    PropertySelection.prototype.isReverse = function isReverse () {
      return this.reverse
    };

    PropertySelection.prototype.equals = function equals (other) {
      return (
          Selection$$1.prototype.equals.call(this, other) &&
          (this.start.equals(other.start) && this.end.equals(other.end))
      )
    };

    PropertySelection.prototype.toString = function toString () {

      return [
        "PropertySelection(", JSON.stringify(this.path), ", ",
        this.start.offset, " -> ", this.end.offset,
        (this.reverse?", reverse":""),
        (this.surfaceId?(", "+this.surfaceId):""),
        ")"
      ].join('')
    };


    PropertySelection.prototype.collapse = function collapse (direction) {
      var offset;
      if (direction === 'left') {
        offset = this.start.offset;
      } else {
        offset = this.end.offset;
      }
      return this.createWithNewRange(offset, offset)
    };





    PropertySelection.prototype.getPath = function getPath () {
      return this.start.path;
    };

    PropertySelection.prototype.getNodeId = function getNodeId () {
      return this.start.path[0];
    };


    PropertySelection.prototype.isInsideOf = function isInsideOf (other, strict) {
      if (other.isNull()) { return false }
      if (other.isContainerSelection()) {
        return other.contains(this, strict)
      }
      if (strict) {
        return (isArrayEqual(this.path, other.path) &&
        this.start.offset > other.start.offset &&
        this.end.offset < other.end.offset);
      } else {
        return (isArrayEqual(this.path, other.path) &&
        this.start.offset >= other.start.offset &&
        this.end.offset <= other.end.offset);
      }
    };


    PropertySelection.prototype.contains = function contains (other, strict) {
      if (other.isNull()) { return false }
      return other.isInsideOf(this, strict)
    };


    PropertySelection.prototype.overlaps = function overlaps (other, strict) {
      if (other.isNull()) { return false }
      if (other.isContainerSelection()) {

        return other.overlaps(this)
      }
      if (!isArrayEqual(this.path, other.path)) { return false }
      if (strict) {
        return (! (this.start.offset>=other.end.offset||this.end.offset<=other.start.offset) );
      } else {
        return (! (this.start.offset>other.end.offset||this.end.offset<other.start.offset) );
      }
    };


    PropertySelection.prototype.isRightAlignedWith = function isRightAlignedWith (other) {
      if (other.isNull()) { return false }
      if (other.isContainerSelection()) {

        return other.isRightAlignedWith(this)
      }
      return (isArrayEqual(this.path, other.path) &&
      this.end.offset === other.end.offset);
    };


    PropertySelection.prototype.isLeftAlignedWith = function isLeftAlignedWith (other) {
      if (other.isNull()) { return false }
      if (other.isContainerSelection()) {

        return other.isLeftAlignedWith(this)
      }
      return (isArrayEqual(this.path, other.path) &&
      this.start.offset === other.start.offset);
    };


    PropertySelection.prototype.expand = function expand (other) {
      if (other.isNull()) { return this }




      if (other.isContainerSelection()) {
        return other.expand(this)
      }
      if (!isArrayEqual(this.path, other.path)) {
        throw new Error('Can not expand PropertySelection to a different property.')
      }
      var newStartOffset = Math.min(this.start.offset, other.start.offset);
      var newEndOffset = Math.max(this.end.offset, other.end.offset);
      return this.createWithNewRange(newStartOffset, newEndOffset);
    };


    PropertySelection.prototype.truncateWith = function truncateWith (other) {
      if (other.isNull()) { return this }
      if (other.isInsideOf(this, 'strict')) {

        throw new Error('Can not truncate with a contained selections')
      }
      if (!this.overlaps(other)) {
        return this
      }
      var otherStartOffset, otherEndOffset;
      if (other.isPropertySelection()) {
        otherStartOffset = other.start.offset;
        otherEndOffset = other.end.offset;
      } else if (other.isContainerSelection()) {

        if (isArrayEqual(other.start.path, this.start.path)) {
          otherStartOffset = other.start.offset;
        } else {
          otherStartOffset = this.start.offset;
        }
        if (isArrayEqual(other.end.path, this.start.path)) {
          otherEndOffset = other.end.offset;
        } else {
          otherEndOffset = this.end.offset;
        }
      } else {
        return this
      }

      var newStartOffset;
      var newEndOffset;
      if (this.start.offset > otherStartOffset && this.end.offset > otherEndOffset) {
        newStartOffset = otherEndOffset;
        newEndOffset = this.end.offset;
      } else if (this.start.offset < otherStartOffset && this.end.offset < otherEndOffset) {
        newStartOffset = this.start.offset;
        newEndOffset = otherStartOffset;
      } else if (this.start.offset === otherStartOffset) {
        if (this.end.offset <= otherEndOffset) {
          return Selection$$1.nullSelection;
        } else {
          newStartOffset = otherEndOffset;
          newEndOffset = this.end.offset;
        }
      } else if (this.end.offset === otherEndOffset) {
        if (this.start.offset >= otherStartOffset) {
          return Selection$$1.nullSelection;
        } else {
          newStartOffset = this.start.offset;
          newEndOffset = otherStartOffset;
        }
      } else if (other.contains(this)) {
        return Selection$$1.nullSelection
      } else {

        throw new Error('Illegal state.')
      }
      return this.createWithNewRange(newStartOffset, newEndOffset)
    };


    PropertySelection.prototype.createWithNewRange = function createWithNewRange (startOffset, endOffset) {
      var sel = new PropertySelection(this.path, startOffset, endOffset, false, this.containerId, this.surfaceId);
      var doc = this._internal.doc;
      if (doc) {
        sel.attach(doc);
      }
      return sel
    };


    PropertySelection.prototype.getFragments = function getFragments () {
      if(this._internal.fragments) {
        return this._internal.fragments
      }

      var fragments;

      if (this.isCollapsed()) {
        fragments = [new Selection$$1.Cursor(this.path, this.start.offset)];
      } else {
        fragments = [new Selection$$1.Fragment(this.path, this.start.offset, this.end.offset)];
      }

      this._internal.fragments = fragments;
      return fragments
    };

    PropertySelection.prototype._clone = function _clone () {
      return new PropertySelection(this.start.path, this.start.offset, this.end.offset, this.reverse, this.containerId, this.surfaceId);
    };

    Object.defineProperties( PropertySelection.prototype, prototypeAccessors );

    return PropertySelection;
  }(Selection));

  PropertySelection.fromJSON = function(json) {
    return new PropertySelection(json)
  };

  var ContainerSelection = (function (Selection$$1) {
    function ContainerSelection(containerId, startPath, startOffset, endPath, endOffset, reverse, surfaceId) {
      Selection$$1.call(this);

      if (arguments.length === 1) {
        var data = arguments[0];
        containerId = data.containerId;
        startPath = data.startPath;
        startOffset = data.startOffset;
        endPath = data.endPath;
        endOffset = data.endOffset;
        reverse = data.reverse;
        surfaceId = data.surfaceId;
      }


      this.containerId = containerId;
      if (!this.containerId) { throw new Error('Invalid arguments: `containerId` is mandatory'); }

      this.start = new Coordinate(startPath, startOffset);
      this.end = new Coordinate(isNil(endPath) ? startPath : endPath, isNil(endOffset) ? startOffset : endOffset);

      this.reverse = Boolean(reverse);

      this.surfaceId = surfaceId;
    }

    if ( Selection$$1 ) ContainerSelection.__proto__ = Selection$$1;
    ContainerSelection.prototype = Object.create( Selection$$1 && Selection$$1.prototype );
    ContainerSelection.prototype.constructor = ContainerSelection;

    var prototypeAccessors = { startPath: {},startOffset: {},endPath: {},endOffset: {},path: {} };

    prototypeAccessors.startPath.get = function () {
      console.warn('DEPRECATED: use sel.start.path instead.');
      return this.start.path
    };

    prototypeAccessors.startOffset.get = function () {
      console.warn('DEPRECATED: use sel.start.offset instead.');
      return this.start.offset
    };

    prototypeAccessors.endPath.get = function () {
      console.warn('DEPRECATED: use sel.end.path instead.');
      return this.end.path
    };

    prototypeAccessors.endOffset.get = function () {
      console.warn('DEPRECATED: use sel.end.offset instead.');
      return this.end.offset
    };

    ContainerSelection.prototype.toJSON = function toJSON () {
      return {
        type: 'container',
        containerId: this.containerId,
        startPath: this.start.path,
        startOffset: this.start.offset,
        endPath: this.end.path,
        endOffset: this.end.offset,
        reverse: this.reverse,
        surfaceId: this.surfaceId
      };
    };


    ContainerSelection.prototype.isContainerSelection = function isContainerSelection () {
      return true;
    };

    ContainerSelection.prototype.getType = function getType () {
      return 'container';
    };

    ContainerSelection.prototype.isNull = function isNull () {
      return false;
    };

    ContainerSelection.prototype.isCollapsed = function isCollapsed () {
      return this.start.equals(this.end);
    };

    ContainerSelection.prototype.isReverse = function isReverse () {
      return this.reverse;
    };

    ContainerSelection.prototype.equals = function equals (other) {
      return (
          Selection$$1.prototype.equals.call(this, other) &&
          this.containerId === other.containerId &&
          (this.start.equals(other.start) && this.end.equals(other.end))
      );
    };

    ContainerSelection.prototype.toString = function toString () {

      return [
        "ContainerSelection(",
        this.containerId, ", ",
        JSON.stringify(this.start.path), ", ", this.start.offset,
        " -> ",
        JSON.stringify(this.end.path), ", ", this.end.offset,
        (this.reverse?", reverse":""),
        (this.surfaceId?(", "+this.surfaceId):""),
        ")"
      ].join('');
    };


    ContainerSelection.prototype.getContainer = function getContainer () {
      if (!this._internal.container) {
        this._internal.container = this.getDocument().get(this.containerId);
      }
      return this._internal.container;
    };

    ContainerSelection.prototype.isInsideOf = function isInsideOf (other, strict) {


      if (other.isNull()) { return false; }
      strict = Boolean(strict);
      var r1 = this._range(this);
      var r2 = this._range(other);
      return (r2.start.isBefore(r1.start, strict) &&
      r1.end.isBefore(r2.end, strict));
    };

    ContainerSelection.prototype.contains = function contains (other, strict) {


      if (other.isNull()) { return false; }
      strict = Boolean(strict);
      var r1 = this._range(this);
      var r2 = this._range(other);
      return (r1.start.isBefore(r2.start, strict) &&
      r2.end.isBefore(r1.end, strict));
    };

    ContainerSelection.prototype.containsNode = function containsNode (nodeId, strict) {
      var container = this.getContainer();
      var coor = new Coordinate([nodeId], 0);
      var address = container.getAddress(coor);
      var r = this._range(this);

      var contained = r.start.isBefore(address, strict);
      if (contained) {
        address.offset = 1;
        contained = r.end.isAfter(address, strict);
      }
      return contained;
    };

    ContainerSelection.prototype.overlaps = function overlaps (other) {
      var r1 = this._range(this);
      var r2 = this._range(other);

      return !(r1.end.isBefore(r2.start, false) ||
      r2.end.isBefore(r1.start, false));
    };

    ContainerSelection.prototype.isLeftAlignedWith = function isLeftAlignedWith (other) {
      var r1 = this._range(this);
      var r2 = this._range(other);
      return r1.start.isEqual(r2.start);
    };

    ContainerSelection.prototype.isRightAlignedWith = function isRightAlignedWith (other) {
      var r1 = this._range(this);
      var r2 = this._range(other);
      return r1.end.isEqual(r2.end);
    };


    ContainerSelection.prototype.collapse = function collapse (direction) {
      var coor;
      if (direction === 'left') {
        coor = this.start;
      } else {
        coor = this.end;
      }
      return _createNewSelection(this, coor, coor);
    };

    ContainerSelection.prototype.expand = function expand (other) {
      var r1 = this._range(this);
      var r2 = this._range(other);
      var start;
      var end;

      if (r1.start.isEqual(r2.start)) {
        start = new Coordinate(this.start.path, Math.min(this.start.offset, other.start.offset));
      } else if (r1.start.isAfter(r2.start)) {
        start = new Coordinate(other.start.path, other.start.offset);
      } else {
        start = this.start;
      }
      if (r1.end.isEqual(r2.end)) {
        end = new Coordinate(this.end.path, Math.max(this.end.offset, other.end.offset));
      } else if (r1.end.isBefore(r2.end, false)) {
        end = new Coordinate(other.end.path, other.end.offset);
      } else {
        end = this.end;
      }

      return _createNewSelection(this, start, end);
    };

    ContainerSelection.prototype.truncateWith = function truncateWith (other) {
      if (other.isInsideOf(this, 'strict')) {

        throw new Error('Can not truncate with a contained selections');
      }
      if (!this.overlaps(other)) {
        return this;
      }
      var r1 = this._range(this);
      var r2 = this._range(other);
      var start, end;
      if (r2.start.isBefore(r1.start, 'strict') && r2.end.isBefore(r1.end, 'strict')) {
        start = other.end;
        end = this.end;
      } else if (r1.start.isBefore(r2.start, 'strict') && r1.end.isBefore(r2.end, 'strict')) {
        start = this.start;
        end = other.start;
      } else if (r1.start.isEqual(r2.start)) {
        if (r2.end.isBefore(r1.end, 'strict')) {
          start = other.end;
          end = this.end;
        } else {

          return Selection$$1.nullSelection;
        }
      } else if (r1.end.isEqual(r2.end)) {
        if (r1.start.isBefore(r2.start, 'strict')) {
          start = this.start;
          end = other.start;
        } else {

          return Selection$$1.nullSelection;
        }
      } else if (this.isInsideOf(other)) {
        return Selection$$1.nullSelection;
      } else {
        throw new Error('Could not determine coordinates for truncate. Check input');
      }
      return _createNewSelection(this, start, end);
    };


    ContainerSelection.prototype.getNodeIds = function getNodeIds () {
      var container = this.getContainer();
      var startPos = container.getPosition(this.start.path[0]);
      var endPos = container.getPosition(this.end.path[0]);
      return container.nodes.slice(startPos, endPos+1)
    };


    ContainerSelection.prototype.getFragments = function getFragments () {


      console.warn('DEPRECATED: this implementation turned out to be too complicated and will be removed soon.');


      if(this._internal.fragments) {
        return this._internal.fragments;
      }

      var fragments = [];

      var doc = this.getDocument();
      var container = this.getContainer();
      var startPos = container.getPosition(this.start.path[0]);
      var endPos = container.getPosition(this.end.path[0]);

      var coor, node, nodeId, fragment, path, offset, text;
      if (startPos !== endPos) {


        coor = this.start;
        path = coor.path;
        offset = coor.offset;
        nodeId = path[0];
        node = doc.get(nodeId);
        if (!node) {
          throw new Error('Node does not exist:' + nodeId);
        }

        if (coor.isPropertyCoordinate()) {
          text = doc.get(path);
          fragment = new Selection$$1.Fragment(path, offset, text.length, (offset === 0));
          fragments.push(fragment);
        }

        else if (coor.isNodeCoordinate() && offset === 0) {
          fragments.push(
              new Selection$$1.NodeFragment(node.id)
          );
        }


        for (var pos= startPos+1; pos < endPos; pos++) {
          node = container.getChildAt(pos);
          if (node.isText()) {
            path = [node.id, 'content'];
            text = doc.get(path);
            fragments.push(
                new Selection$$1.Fragment(path, 0, text.length, true)
            );
          } else {
            fragments.push(
                new Selection$$1.NodeFragment(container.nodes[pos])
            );
          }
        }


        coor = this.end;
        path = coor.path;
        offset = coor.offset;
        nodeId = path[0];
        node = doc.get(nodeId);
        if (!node) {
          throw new Error('Node does not exist:' + nodeId);
        }

        if (coor.isPropertyCoordinate()) {
          text = doc.get(path);
          fragment = new Selection$$1.Fragment(path, 0, offset, (offset === text.length));
          fragments.push(fragment);
        }

        else if (coor.isNodeCoordinate() && offset > 0) {
          fragments.push(
              new Selection$$1.NodeFragment(node.id)
          );
        }
      } else {

        path = this.start.path;
        nodeId = path[0];
        node = doc.get(nodeId);
        var startIsNodeCoordinate = this.start.isNodeCoordinate();
        var endIsNodeCoordinate = this.end.isNodeCoordinate();
        if (!node.isText()) {
          fragments.push(
              new Selection$$1.NodeFragment(nodeId)
          );
        } else if (startIsNodeCoordinate && endIsNodeCoordinate && this.start.offset < this.end.offset) {
          fragments.push(
              new Selection$$1.NodeFragment(nodeId)
          );
        } else if (!startIsNodeCoordinate && endIsNodeCoordinate && this.end.offset > 0) {
          text = doc.get(this.start.path);
          fragments.push(
              new Selection$$1.Fragment(path, this.start.offset, text.length, (this.start.offset === 0))
          );
        } else if (startIsNodeCoordinate && !endIsNodeCoordinate && this.start.offset === 0) {
          text = doc.get(this.end.path);
          fragments.push(
              new Selection$$1.Fragment(path, 0, this.end.offset, (this.end.offset === text.length))
          );
        } else if (!startIsNodeCoordinate && !endIsNodeCoordinate) {
          text = doc.get(this.start.path);
          fragments.push(
              new Selection$$1.Fragment(path, this.start.offset, this.end.offset, (this.start.offset === 0 && this.end.offset === text.length))
          );
        }
      }

      this._internal.fragments = fragments;

      return fragments;
    };


    ContainerSelection.prototype.splitIntoPropertySelections = function splitIntoPropertySelections () {
      var sels = [];
      var fragments = this.getFragments();
      fragments.forEach(function(fragment) {
        if (fragment instanceof Selection$$1.Fragment) {
          sels.push(
              new PropertySelection(fragment.path, fragment.startOffset,
                  fragment.endOffset, false, this.containerId, this.surfaceId)
          );
        }
      }.bind(this));
      return sels;
    };

    ContainerSelection.prototype._clone = function _clone () {
      return new ContainerSelection(this);
    };

    ContainerSelection.prototype._range = function _range (sel) {



      if (sel._internal.addressRange) {
        return sel._internal.addressRange;
      }

      var container = this.getContainer();
      var startAddress = container.getAddress(sel.start);
      var endAddress;
      if (sel.isCollapsed()) {
        endAddress = startAddress;
      } else {
        endAddress = container.getAddress(sel.end);
      }
      var addressRange = {
        start: startAddress,
        end: endAddress
      };
      if (sel._isContainerSelection) {
        sel._internal.addressRange = addressRange;
      }
      return addressRange;
    };

    prototypeAccessors.path.get = function () {
      throw new Error('ContainerSelection has no path property. Use startPath and endPath instead');
    };

    Object.defineProperties( ContainerSelection.prototype, prototypeAccessors );

    return ContainerSelection;
  }(Selection));

  ContainerSelection.prototype._isContainerSelection = true;

  ContainerSelection.fromJSON = function(properties) {
    var sel = new ContainerSelection(properties);
    return sel;
  };

  function _createNewSelection(containerSel, start, end) {
    var newSel = new ContainerSelection(containerSel.containerId,
        start.path, start.offset, end.path, end.offset, false, containerSel.surfaceId);

    var doc = containerSel._internal.doc;
    if (doc) {
      newSel.attach(doc);
    }
    return newSel;
  }

  var NodeSelection = (function (Selection$$1) {
    function NodeSelection(containerId, nodeId, mode, reverse, surfaceId) {
      Selection$$1.call(this);

      if (arguments.length === 1) {
        var data = arguments[0];
        containerId = data.containerId;
        nodeId = data.nodeId;
        mode = data.mode;
        reverse = data.reverse;
        surfaceId = data.surfaceId;
      }

      if (!isString(containerId)) {
        throw new Error("'containerId' is mandatory.");
      }
      if (!isString(nodeId)) {
        throw new Error("'nodeId' is mandatory.");
      }
      mode = mode || "full";

      this.containerId = containerId;
      this.nodeId = nodeId;
      this.mode = mode;
      this.reverse = Boolean(reverse);
      this.surfaceId = surfaceId;

      this.start = new Coordinate([nodeId], 0);
      this.end = new Coordinate([nodeId], 1);
    }

    if ( Selection$$1 ) NodeSelection.__proto__ = Selection$$1;
    NodeSelection.prototype = Object.create( Selection$$1 && Selection$$1.prototype );
    NodeSelection.prototype.constructor = NodeSelection;

    NodeSelection.prototype.equals = function equals (other) {
      return (
          Selection$$1.prototype.equals.call(this, other) &&
          this.nodeId === other.nodeId &&
          this.mode === other.mode
      )
    };

    NodeSelection.prototype.isNodeSelection = function isNodeSelection () {
      return true;
    };

    NodeSelection.prototype.getType = function getType () {
      return 'node';
    };

    NodeSelection.prototype.getNodeId = function getNodeId () {
      return this.nodeId;
    };

    NodeSelection.prototype.isFull = function isFull () {
      return this.mode === 'full';
    };

    NodeSelection.prototype.isBefore = function isBefore () {
      return this.mode === 'before';
    };

    NodeSelection.prototype.isAfter = function isAfter () {
      return this.mode === 'after';
    };

    NodeSelection.prototype.isCollapsed = function isCollapsed () {
      return this.mode !== 'full';
    };

    NodeSelection.prototype.toJSON = function toJSON () {
      return {
        type: 'node',
        nodeId: this.nodeId,
        mode: this.mode,
        reverse: this.reverse,
        containerId: this.containerId,
        surfaceId: this.surfaceId
      };
    };

    NodeSelection.prototype.toString = function toString () {

      return [
        "NodeSelection(",
        this.containerId, ".", this.nodeId, ", ",
        this.mode, ", ",
        (this.reverse?", reverse":""),
        (this.surfaceId?(", "+this.surfaceId):""),
        ")"
      ].join('');
    };

    NodeSelection.prototype.collapse = function collapse (direction) {
      if (direction === 'left') {
        if (this.isBefore()) {
          return this;
        } else {
          return new NodeSelection(this.containerId, this.nodeId, 'before', this.reverse, this.surfaceId);
        }
      } else if (direction === 'right') {
        if (this.isAfter()) {
          return this;
        } else {
          return new NodeSelection(this.containerId, this.nodeId, 'after', this.reverse, this.surfaceId);
        }
      } else {
        throw new Error("'direction' must be either 'left' or 'right'");
      }
    };

    NodeSelection.prototype._getCoordinate = function _getCoordinate () {
      if (this.mode === 'before') {
        return new Coordinate([this.nodeId], 0);
      } else if (this.mode === 'after') {
        return new Coordinate([this.nodeId], 1);
      }
    };

    NodeSelection.prototype._clone = function _clone () {
      return new NodeSelection(this);
    };

    return NodeSelection;
  }(Selection));

  NodeSelection.prototype._isNodeSelection = true;

  NodeSelection.fromJSON = function(json) {
    return new NodeSelection(json);
  };


  NodeSelection._createFromCoordinate = function(coor) {
    var containerId = coor.containerId;
    var nodeId = coor.getNodeId();
    var mode = coor.offset === 0 ? 'before' : 'after';
    return new NodeSelection(containerId, nodeId, mode, false);
  };

  var CustomSelection = (function (Selection$$1) {
    function CustomSelection(customType, data, surfaceId) {
      Selection$$1.call(this);

      if (arguments.length === 1) {
        var _data = arguments[0];
        customType = _data.customType;
        data = _data.data;
        surfaceId = _data.surfaceId;
      }

      this.customType = customType;
      this.data = data || {};
      this.surfaceId = surfaceId;
    }

    if ( Selection$$1 ) CustomSelection.__proto__ = Selection$$1;
    CustomSelection.prototype = Object.create( Selection$$1 && Selection$$1.prototype );
    CustomSelection.prototype.constructor = CustomSelection;

    CustomSelection.prototype.isCustomSelection = function isCustomSelection () {
      return true;
    };

    CustomSelection.prototype.getType = function getType () {
      return 'custom';
    };

    CustomSelection.prototype.getCustomType = function getCustomType () {
      return this.customType;
    };

    CustomSelection.prototype.toJSON = function toJSON () {
      return {
        type: 'custom',
        customType: this.customType,
        data: cloneDeep(this.data),
        surfaceId: this.surfaceId
      };
    };

    CustomSelection.prototype.toString = function toString () {

      return [
        'CustomSelection(',
        this.customType,', ',
        JSON.stringify(this.data),
        ")"
      ].join('');
    };

    CustomSelection.prototype.equals = function equals (other) {
      return (
          Selection$$1.prototype.equals.call(this, other) &&
          other.isCustomSelection() &&
          isEqual(this.data, other.data)
      );
    };

    CustomSelection.prototype._clone = function _clone () {
      return new CustomSelection(this)
    };

    return CustomSelection;
  }(Selection));

  CustomSelection.prototype._isCustomSelection = true;

  CustomSelection.fromJSON = function(json) {
    return new CustomSelection(json);
  };

  function last$2(arr) {
    return arr[arr.length-1]
  }

  function fromJSON(json) {
    if (!json) { return Selection.nullSelection }
    var type = json.type;
    switch(type) {
      case 'property':
        return PropertySelection.fromJSON(json)
      case 'container':
        return ContainerSelection.fromJSON(json)
      case 'node':
        return NodeSelection.fromJSON(json)
      case 'custom':
        return CustomSelection.fromJSON(json)
      default:

        return Selection.nullSelection
    }
  }


  function isFirst(doc, coor) {
    if (coor.isNodeCoordinate() && coor.offset === 0) { return true }
    var node = doc.get(coor.path[0]).getRoot();
    if (node.isText() && coor.offset === 0) { return true }
    if (node.isList()) {
      var itemId = coor.path[0];
      if (node.items[0] === itemId && coor.offset === 0) { return true }
    }
  }


  function isLast(doc, coor) {
    if (coor.isNodeCoordinate() && coor.offset > 0) { return true }
    var node = doc.get(coor.path[0]).getRoot();
    if (node.isText() && coor.offset >= node.getLength()) { return true }
    if (node.isList()) {
      var itemId = coor.path[0];
      var item = doc.get(itemId);
      if (last$2(node.items) === itemId && coor.offset === item.getLength()) { return true }
    }
  }

  function isEntirelySelected(doc, node, start, end) {
    var ref = getRangeInfo(doc, node, start, end);
    var isEntirelySelected = ref.isEntirelySelected;
    return isEntirelySelected
  }

  function getRangeInfo(doc, node, start, end) {
    var isFirst = true;
    var isLast = true;
    if (node.isText()) {
      if (start && start.offset !== 0) { isFirst = false; }
      if (end && end.offset < node.getLength()) { isLast = false; }
    } else if (node.isList()) {
      if (start) {
        var itemId = start.path[0];
        var itemPos = node.getItemPosition(itemId);
        if (itemPos > 0 || start.offset !== 0) { isFirst = false; }
      }
      if (end) {
        var itemId$1 = end.path[0];
        var itemPos$1 = node.getItemPosition(itemId$1);
        var item = doc.get(itemId$1);
        if (itemPos$1 < node.items.length-1 || end.offset < item.getLength()) { isLast = false; }
      }
    }
    var isEntirelySelected = isFirst && isLast;
    return {isFirst: isFirst, isLast: isLast, isEntirelySelected: isEntirelySelected}
  }

  function setCursor(tx, node, containerId, mode) {
    if (node.isText()) {
      var offset = 0;
      if (mode === 'after') {
        var text = node.getText();
        offset = text.length;
      }
      tx.setSelection({
        type: 'property',
        path: node.getTextPath(),
        startOffset: offset,
        containerId: containerId
      });
    } else if (node.isList()) {
      var item, offset$1;
      if (mode === 'after') {
        item = node.getLastItem();
        offset$1 = item.getLength();
      } else {
        item = node.getFirstItem();
        offset$1 = 0;
      }
      tx.setSelection({
        type: 'property',
        path: item.getTextPath(),
        startOffset: offset$1,
        containerId: containerId
      });
    } else {
      tx.setSelection({
        type: 'node',
        containerId: containerId,
        nodeId: node.id,



      });
    }
  }

  function selectNode(tx, nodeId, containerId) {
    tx.setSelection(createNodeSelection({ doc: tx, nodeId: nodeId, containerId: containerId }));
  }

  function createNodeSelection(ref) {
    var doc = ref.doc;
    var nodeId = ref.nodeId;
    var containerId = ref.containerId;
    var mode = ref.mode;
    var reverse = ref.reverse;
    var surfaceId = ref.surfaceId;

    var node = doc.get(nodeId);
    if (!node) { return Selection.nullSelection }
    node = node.getRoot();
    if (node.isText()) {
      return new PropertySelection({
        path: node.getTextPath(),
        startOffset: mode === 'after' ? node.getLength() : 0,
        endOffset: mode === 'before' ? 0 : node.getLength(),
        reverse: reverse,
        containerId: containerId,
        surfaceId: surfaceId
      })
    } else if (node.isList() && node.getLength()>0) {
      var first = node.getFirstItem();
      var last = node.getLastItem();
      var start = {
        path: first.getTextPath(),
        offset: 0
      };
      var end = {
        path: last.getTextPath(),
        offset: last.getLength()
      };
      if (mode === 'after') { start = end; }
      else if (mode === 'before') { end = start; }
      return new ContainerSelection({
        startPath: start.path,
        startOffset: start.offset,
        endPath: end.path,
        endOffset: end.offset,
        reverse: reverse,
        containerId: containerId,
        surfaceId: surfaceId
      })
    } else {
      return new NodeSelection({ nodeId: nodeId, mode: mode, reverse: reverse, containerId: containerId, surfaceId: surfaceId })
    }
  }

  function stepIntoIsolatedNode(editorSession, comp) {


    if (comp.grabFocus()) { return true }


    var surface = comp.find('.sc-surface');
    if (surface) {
      if (surface._isTextPropertyEditor) {
        var doc = editorSession.getDocument();
        var path = surface.getPath();
        var text = doc.get(path, 'strict');
        editorSession.setSelection({
          type: 'property',
          path: path,
          startOffset: text.length,
          surfaceId: surface.id
        });
        return true
      } else if (surface._isContainerEditor) {
        var container = surface.getContainer();
        if (container.length > 0) {
          var first = container.getChildAt(0);
          setCursor(editorSession, first, container.id, 'after');
        }
        return true
      }
    }
    return false
  }

  var DocumentChange = function DocumentChange(ops, before, after) {
    if (arguments.length === 1 && isObject(arguments[0])) {
      var data = arguments[0];

      this.sha = data.sha;

      this.timestamp = data.timestamp;

      this.before = data.before || {};

      this.ops = data.ops;
      this.info = data.info;

      this.after = data.after || {};
    } else if (arguments.length === 3) {
      this.sha = uuid();
      this.info = {};
      this.timestamp = Date.now();
      this.ops = ops.slice(0);
      this.before = before || {};
      this.after = after || {};
    } else {
      throw new Error('Illegal arguments.')
    }

    this.updated = null;

    this.created = null;

    this.deleted = null;
  };


  DocumentChange.prototype._extractInformation = function _extractInformation (doc) {
    var ops = this.ops;
    var created = {};
    var deleted = {};
    var updated = {};
    var affectedContainerAnnos = [];


    function _checkAnnotation(op) {
      switch (op.type) {
        case "create":
        case "delete": {
          var node = op.val;
          if (node.hasOwnProperty('start')) {
            updated[node.start.path] = true;
          }
          if (node.hasOwnProperty('end')) {
            updated[node.end.path] = true;
          }
          break
        }
        case "update":
        case "set": {

          var node$1 = doc.get(op.path[0]);
          if (node$1) {
            if (node$1._isPropertyAnnotation) {
              updated[node$1.start.path] = true;
            } else if (node$1._isContainerAnnotation) {
              affectedContainerAnnos.push(node$1);
            }
          }
          break
        }
        default:
          throw new Error('Illegal state')
      }
    }

    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      if (op.type === "create") {
        created[op.val.id] = op.val;
        delete deleted[op.val.id];
      }
      if (op.type === "delete") {
        delete created[op.val.id];
        deleted[op.val.id] = op.val;
      }
      if (op.type === "set" || op.type === "update") {
        updated[op.path] = true;

        updated[op.path[0]] = true;
      }
      _checkAnnotation(op);
    }

    affectedContainerAnnos.forEach(function(anno) {
      var container = doc.get(anno.containerId, 'strict');
      var startPos = container.getPosition(anno.start.path[0]);
      var endPos = container.getPosition(anno.end.path[0]);
      for (var pos = startPos; pos <= endPos; pos++) {
        var node = container.getChildAt(pos);
        var path;
        if (node.isText()) {
          path = [node.id, 'content'];
        } else {
          path = [node.id];
        }
        if (!deleted[node.id]) {
          updated[path] = true;
        }
      }
    });


    if(Object.keys(deleted).length > 0) {
      forEach(updated, function(_, key) {
        var nodeId = key.split(',')[0];
        if (deleted[nodeId]) {
          delete updated[key];
        }
      });
    }

    this.created = created;
    this.deleted = deleted;
    this.updated = updated;
  };

  DocumentChange.prototype.invert = function invert () {
    var this$1 = this;


    var copy = this.toJSON();
    copy.ops = [];

    var tmp = copy.before;
    copy.before = copy.after;
    copy.after = tmp;
    var inverted = DocumentChange.fromJSON(copy);
    var ops = [];
    for (var i = this.ops.length - 1; i >= 0; i--) {
      ops.push(this$1.ops[i].invert());
    }
    inverted.ops = ops;
    return inverted
  };




  DocumentChange.prototype.isAffected = function isAffected (path) {
    return this.updated[path]
  };

  DocumentChange.prototype.isUpdated = function isUpdated (path) {

    return this.isAffected(path)
  };



  DocumentChange.prototype.serialize = function serialize () {
    var opSerializer = new OperationSerializer();
    var data = this.toJSON();
    data.ops = this.ops.map(function(op) {
      return opSerializer.serialize(op)
    });
    return JSON.stringify(data)
  };

  DocumentChange.prototype.clone = function clone$$1 () {
    return DocumentChange.fromJSON(this.toJSON())
  };

  DocumentChange.prototype.toJSON = function toJSON () {
    var data = {

      sha: this.sha,

      before: clone(this.before),
      ops: map(this.ops, function(op) {
        return op.toJSON()
      }),
      info: this.info,

      after: clone(this.after),
    };



    data.after.selection = undefined;
    data.before.selection = undefined;

    var sel = this.before.selection;
    if (sel && sel._isSelection) {
      data.before.selection = sel.toJSON();
    }
    sel = this.after.selection;
    if (sel && sel._isSelection) {
      data.after.selection = sel.toJSON();
    }
    return data
  };

  DocumentChange.deserialize = function(str) {
    var opSerializer = new OperationSerializer();
    var data = JSON.parse(str);
    data.ops = data.ops.map(function(opData) {
      return opSerializer.deserialize(opData)
    });
    if (data.before.selection) {
      data.before.selection = fromJSON(data.before.selection);
    }
    if (data.after.selection) {
      data.after.selection = fromJSON(data.after.selection);
    }
    return new DocumentChange(data)
  };

  DocumentChange.fromJSON = function(data) {

    var change = cloneDeep(data);
    change.ops = data.ops.map(function(opData) {
      return ObjectOperation.fromJSON(opData)
    });
    change.before.selection = fromJSON(data.before.selection);
    change.after.selection = fromJSON(data.after.selection);
    return new DocumentChange(change)
  };


  DocumentChange.transformInplace = function(A, B) {
    _transformInplaceBatch(A, B);
  };

  function _transformInplaceSingle(a, b) {
    for (var i = 0; i < a.ops.length; i++) {
      var a_op = a.ops[i];
      for (var j = 0; j < b.ops.length; j++) {
        var b_op = b.ops[j];


        ObjectOperation.transform(a_op, b_op, {inplace: true});
      }
    }
    if (a.before) {
      _transformSelectionInplace(a.before.selection, b);
    }
    if (a.after) {
      _transformSelectionInplace(a.after.selection, b);
    }
    if (b.before) {
      _transformSelectionInplace(b.before.selection, a);
    }
    if (b.after) {
      _transformSelectionInplace(b.after.selection, a);
    }
  }

  function _transformInplaceBatch(A, B) {
    if (!isArray(A)) {
      A = [A];
    }
    if (!isArray(B)) {
      B = [B];
    }
    for (var i = 0; i < A.length; i++) {
      var a = A[i];
      for (var j = 0; j < B.length; j++) {
        var b = B[j];
        _transformInplaceSingle(a,b);
      }
    }
  }

  function _transformSelectionInplace(sel, a) {
    if (!sel || (!sel.isPropertySelection() && !sel.isContainerSelection()) ) {
      return false
    }
    var ops = a.ops;
    var hasChanged = false;
    var isCollapsed = sel.isCollapsed();
    for(var i=0; i<ops.length; i++) {
      var op = ops[i];
      hasChanged |= _transformCoordinateInplace(sel.start, op);
      if (!isCollapsed) {
        hasChanged |= _transformCoordinateInplace(sel.end, op);
      } else {
        if (sel.isContainerSelection()) {
          sel.end.path = sel.start.path;
        }
        sel.end.offset = sel.start.offset;
      }
    }
    return hasChanged
  }

  DocumentChange.transformSelection = function(sel, a) {
    var newSel = sel.clone();
    var hasChanged = _transformSelectionInplace(newSel, a);
    if (hasChanged) {
      return newSel
    } else {
      return sel
    }
  };

  function _transformCoordinateInplace(coor, op) {
    if (!isEqual(op.path, coor.path)) { return false }
    var hasChanged = false;
    if (op.type === 'update' && op.propertyType === 'string') {
      var diff = op.diff;
      var newOffset;
      if (diff.isInsert() && diff.pos <= coor.offset) {
        newOffset = coor.offset + diff.str.length;

        coor.offset = newOffset;
        hasChanged = true;
      } else if (diff.isDelete() && diff.pos <= coor.offset) {
        newOffset = Math.max(diff.pos, coor.offset - diff.str.length);

        coor.offset = newOffset;
        hasChanged = true;
      }
    }
    return hasChanged
  }

  var ServerRequest = function ServerRequest(message, ws) {
    this.message = message;
    this.ws = ws;
    this.isAuthenticated = false;
    this.isAuhorized = false;
  };


  ServerRequest.prototype.setAuthenticated = function setAuthenticated (session) {
    this.isAuthenticated = true;
    this.session = session;
  };


  ServerRequest.prototype.setAuthorized = function setAuthorized (authorizationData) {
    this.isAuthorized = true;
    this.authorizationData = authorizationData;
  };


  ServerRequest.prototype.setEnhanced = function setEnhanced () {
    this.isEnhanced = true;
  };

  var ServerResponse = function ServerResponse() {
    this.isReady = false;
    this.isEnhanced = false;
    this.isSent = false;
    this.err = null;
    this.data = null;
  };


  ServerResponse.prototype.error = function error (err) {
    this.err = err;
    this.isReady = true;
  };


  ServerResponse.prototype.send = function send (data) {
    this.data = data;
    this.isReady = true;
  };


  ServerResponse.prototype.setEnhanced = function setEnhanced () {
    this.isEnhanced = true;
  };

  ServerResponse.prototype.setSent = function setSent () {
    this.isSent = true;
  };

  function deleteFromArray(array, value) {
    if (!array) { return }
    for (var i = 0; i < array.length; i++) {
      if (array[i] === value) {
        array.splice(i, 1);
        i--;
      }
    }
  }

  var ArrayTree = function ArrayTree () {};

  ArrayTree.prototype.add = function add (path, val) {
    if (!this[path]) {
      this[path] = [];
    }
    this[path].push(val);
  };
  ArrayTree.prototype.remove = function remove (path, val) {
    if (this[path]) {
      deleteFromArray(this[path], val);
    }
  };

  var MarkersManager = function MarkersManager(editorSession) {
    this.editorSession = editorSession;


    this._textProperties = {};
    this._dirtyProps = {};

    this._markers = new MarkersIndex(editorSession);

    editorSession.onUpdate(this._onChange, this);
    editorSession.onRender(this._updateProperties, this);
  };

  MarkersManager.prototype.dispose = function dispose () {
    this.editorSession.off(this);
    this._markers.dispose();
  };

  MarkersManager.prototype.register = function register (textProperyComponent) {
    var path = String(textProperyComponent.getPath());

    var textProperties = this._textProperties[path];
    if (!textProperties) {
      textProperties = this._textProperties[path] = [];
    }
    textProperties.push(textProperyComponent);
  };

  MarkersManager.prototype.deregister = function deregister (textProperyComponent) {
    var path = String(textProperyComponent.getPath());

    var textProperties = this._textProperties[path];
    if (!textProperties) {

      return
    }
    deleteFromArray(this._textProperties[path], textProperyComponent);
    if (textProperties.length === 0) {
      delete this._textProperties[path];
    }
  };

  MarkersManager.prototype.getMarkers = function getMarkers (path, opts) {
    opts = opts || {};
    var doc = this.editorSession.getDocument();
    var annos = doc.getAnnotations(path) || [];
    var markers = this._markers.get(path, opts.surfaceId, opts.containerId);
    return annos.concat(markers)
  };

  MarkersManager.prototype._onChange = function _onChange (editorSession) {
    var this$1 = this;

    if (editorSession.hasDocumentChanged()) {

      if (editorSession.hasDocumentChanged()) {
        var change = editorSession.getChange();
        forEach(change.updated, function (val, id) {
          this$1._dirtyProps[id] = true;
        });
      }
      Object.assign(this._dirtyProps, this._markers._collectDirtyProps());
    }
  };

  MarkersManager.prototype._updateProperties = function _updateProperties () {
    var this$1 = this;

    Object.keys(this._dirtyProps).forEach(function (path) {
      var textProperties = this$1._textProperties[path];
      if (textProperties) {
        textProperties.forEach(this$1._updateTextProperty.bind(this$1));
      }
    });
    this._dirtyProps = {};
  };

  MarkersManager.prototype._updateTextProperty = function _updateTextProperty (textPropertyComponent) {
    var path = textPropertyComponent.getPath();
    var markers = this.getMarkers(path, {
      surfaceId: textPropertyComponent.getSurfaceId(),
      containerId: textPropertyComponent.getContainerId()
    });

    textPropertyComponent.setState({
      markers: markers
    });
  };


  var MarkersIndex = function MarkersIndex(editorSession) {
    this.editorSession = editorSession;
    this.document = editorSession.getDocument();
    this._documentMarkers = new ArrayTree();
    this._surfaceMarkers = {};
    this._containerMarkers = {};

    this._dirtyProps = {};

    this.document.addIndex('markers', this);
    editorSession.onUpdate('document', this._onDocumentChange, this);
  };

  MarkersIndex.prototype.dispose = function dispose () {


    delete this.document.data.indexes['markers'];
    this.editorSession.off(this);
  };

  MarkersIndex.prototype.reset = function reset () {
    var this$1 = this;

    this._documentMarkers = new ArrayTree();
    this._surfaceMarkers = {};
    this._containerMarkers = {};
    var doc = this.document;
    forEach(doc.getNodes(), function (node) {
      if (this$1.select(node)) {
        this$1.create(node);
      }
    });
  };

  MarkersIndex.prototype.select = function select (node) {
    return node._isMarker
  };

  MarkersIndex.prototype.create = function create (marker) {

    switch (marker.constructor.scope) {
      case 'document': {
        this._dirtyProps[marker.path] = true;
        this._documentMarkers.add(marker.path, marker);
        break
      }
      case 'surface': {
        if (!this._surfaceMarkers[marker.surfaceId]) {
          this._surfaceMarkers[marker.surfaceId] = new ArrayTree();
        }
        this._dirtyProps[marker.path] = true;
        this._surfaceMarkers[marker.surfaceId].add(marker.path, marker);
        break
      }
      case 'container': {
        console.warn('Container scoped markers are not supported yet');
        break
      }
      default:
        console.error('Invalid marker scope.');
    }
  };

  MarkersIndex.prototype.delete = function delete$1 (marker) {
    switch (marker.constructor.scope) {
      case 'document': {
        this._dirtyProps[marker.path] = true;
        this._documentMarkers.remove(marker.path, marker);
        break
      }
      case 'surface': {
        if (!this._surfaceMarkers[marker.surfaceId]) {
          this._surfaceMarkers[marker.surfaceId] = new ArrayTree();
        }
        this._dirtyProps[marker.path] = true;
        this._surfaceMarkers[marker.surfaceId].remove(marker.path, marker);
        break
      }
      case 'container': {
        console.warn('Container scoped markers are not supported yet');
        break
      }
      default:
        console.error('Invalid marker scope.');
    }
  };

  MarkersIndex.prototype.get = function get (path, surfaceId) {
    var markers = this._documentMarkers[path] || [];
    if (surfaceId && this._surfaceMarkers[surfaceId]) {
      var surfaceMarkers = this._surfaceMarkers[surfaceId][path];
      if (surfaceMarkers) { markers = markers.concat(surfaceMarkers); }
    }

    return markers
  };

  MarkersIndex.prototype._collectDirtyProps = function _collectDirtyProps () {
    var dirtyProps = this._dirtyProps;
    this._dirtyProps = {};
    return dirtyProps
  };


  MarkersIndex.prototype._getAllCustomMarkers = function _getAllCustomMarkers (path) {
    var this$1 = this;

    var markers = this._documentMarkers[path] || [];
    for(var surfaceId in this$1._surfaceMarkers) {
      if (!this$1._surfaceMarkers.hasOwnProperty(surfaceId)) { continue }
      var surfaceMarkers = this$1._surfaceMarkers[surfaceId][path];
      if (surfaceMarkers) { markers = markers.concat(surfaceMarkers); }
    }

    return markers
  };

  MarkersIndex.prototype._onDocumentChange = function _onDocumentChange (change) {
    var this$1 = this;

    var doc = this.doc;
    change.ops.forEach(function (op) {
      var markers = this$1._getAllCustomMarkers(op.path);
      if (op.type === 'update' && op.diff._isTextOperation) {
        var diff = op.diff;
        switch (diff.type) {
          case 'insert':
            this$1._transformInsert(doc, markers, diff);
            break
          case 'delete':
            this$1._transformDelete(doc, markers, diff);
            break
          default:

        }
      }
    });
  };

  MarkersIndex.prototype._transformInsert = function _transformInsert (doc, markers, op) {
    var pos = op.pos;
    var length = op.str.length;
    if (length === 0) { return }
    markers.forEach(function(marker) {

      var start = marker.start.offset;
      var end = marker.end.offset;
      var newStart = start;
      var newEnd = end;
      if (pos >= end) { return }
      if (pos <= start) {
        newStart += length;
        newEnd += length;
        marker.start.offset = newStart;
        marker.end.offset = newEnd;
        return
      }
      if (pos < end) {
        newEnd += length;
        marker.end.offset = newEnd;
        if (marker.invalidate) { marker.invalidate(); }
      }
    });
  };

  MarkersIndex.prototype._transformDelete = function _transformDelete (doc, markers, op) {
    var pos1 = op.pos;
    var length = op.str.length;
    var pos2 = pos1 + length;
    if (pos1 === pos2) { return }
    markers.forEach(function (marker) {
      var start = marker.start.offset;
      var end = marker.end.offset;
      var newStart = start;
      var newEnd = end;
      if (pos2 <= start) {
        newStart -= length;
        newEnd -= length;
        marker.start.offset = newStart;
        marker.end.offset = newEnd;
      } else if (pos1 >= end) {

      }


      else {
        if (pos1 <= start) {
          newStart = start - Math.min(pos2-pos1, start-pos1);
        }
        if (pos1 <= end) {
          newEnd = end - Math.min(pos2-pos1, end-pos1);
        }

        if (start !== end && newStart === newEnd) {
          marker.remove();
          return
        }
        if (start !== newStart) {
          marker.start.offset = newStart;
        }
        if (end !== newEnd) {
          marker.end.offset = newEnd;
        }
        if (marker.invalidate) { marker.invalidate(); }
      }
    });
  };

  var TreeNode = function TreeNode () {};



  var TreeIndex = function TreeIndex () {};

  TreeIndex.prototype.get = function get$1 (path) {
    if (arguments.length > 1) {
      path = Array.prototype.slice(arguments, 0);
    }
    if (isString(path)) {
      path = [path];
    }
    return get(this, path);
  };

  TreeIndex.prototype.getAll = function getAll (path) {
    if (arguments.length > 1) {
      path = Array.prototype.slice(arguments, 0);
    }
    if (isString(path)) {
      path = [path];
    }
    if (!isArray(path)) {
      throw new Error('Illegal argument for TreeIndex.get()');
    }
    var node = get(this, path);
    return this._collectValues(node);
  };

  TreeIndex.prototype.set = function set (path, value) {
    if (isString(path)) {
      path = [path];
    }
    setWith(this, path, value, function(val) {
      if (!val) { return new TreeNode(); }
    });
  };

  TreeIndex.prototype.delete = function delete$1 (path) {
    if (isString(path)) {
      delete this[path];
    } else if(path.length === 1) {
      delete this[path[0]];
    } else {
      var key = path[path.length-1];
      path = path.slice(0, -1);
      var parent = get(this, path);
      if (parent) {
        delete parent[key];
      }
    }
  };

  TreeIndex.prototype.clear = function clear () {
    var root = this;
    for (var key in root) {
      if (root.hasOwnProperty(key)) {
        delete root[key];
      }
    }
  };

  TreeIndex.prototype.traverse = function traverse (fn) {
    this._traverse(this, [], fn);
  };

  TreeIndex.prototype.forEach = function forEach () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    (ref = this).traverse.apply(ref, args);
    var ref;
  };

  TreeIndex.prototype._traverse = function _traverse (root, path, fn) {
    var this$1 = this;

    var id;
    for (id in root) {
      if (!root.hasOwnProperty(id)) { continue; }
      var child = root[id];
      var childPath = path.concat([id]);
      if (child instanceof TreeNode) {
        this$1._traverse(child, childPath, fn);
      } else {
        fn(child, childPath);
      }
    }
  };

  TreeIndex.prototype._collectValues = function _collectValues (root) {


    var vals = {};
    this._traverse(root, [], function(val, path) {
      var key = path[path.length-1];
      vals[key] = val;
    });
    return vals;
  };

  var TreeIndexArrays = (function (TreeIndex) {
    function TreeIndexArrays () {
      TreeIndex.apply(this, arguments);
    }

    if ( TreeIndex ) TreeIndexArrays.__proto__ = TreeIndex;
    TreeIndexArrays.prototype = Object.create( TreeIndex && TreeIndex.prototype );
    TreeIndexArrays.prototype.constructor = TreeIndexArrays;

    TreeIndexArrays.prototype.contains = function contains (path) {
      var val = TreeIndex.prototype.get.call(this, path);
      return Boolean(val)
    };

    TreeIndexArrays.prototype.get = function get$$1 (path) {
      var val = TreeIndex.prototype.get.call(this, path);
      if (val instanceof TreeNode) {
        val = val.__values__ || [];
      }
      return val;
    };

    TreeIndexArrays.prototype.set = function set (path, arr) {
      var val = TreeIndex.prototype.get.call(this, path);
      val.__values__ = arr;
    };

    TreeIndexArrays.prototype.add = function add (path, value) {
      if (isString(path)) {
        path = [path];
      }
      if (!isArray(path)) {
        throw new Error('Illegal arguments.');
      }
      var arr;







      setWith(this, path.concat(['__values__','__dummy__']), undefined, function(val, key) {
        if (key === '__values__') {
          if (!val) { val = []; }
          arr = val;
        } else if (!val) {
          val = new TreeNode();
        }
        return val;
      });
      delete arr.__dummy__;
      arr.push(value);
    };

    TreeIndexArrays.prototype.remove = function remove (path, value) {
      var arr = get(this, path);
      if (arr instanceof TreeNode) {
        if (arguments.length === 1) {
          delete arr.__values__;
        } else {
          deleteFromArray(arr.__values__, value);
        }
      }
    };

    TreeIndexArrays.prototype._collectValues = function _collectValues (root) {
      var vals = [];
      this._traverse(root, [], function(val) {
        vals.push(val);
      });
      vals = Array.prototype.concat.apply([], vals);
      return vals
    };

    return TreeIndexArrays;
  }(TreeIndex));

  TreeIndex.Arrays = TreeIndexArrays;

  function isFunction$2(f) {
    return typeof f === 'function'
  }

  function filter(iteratee, fn) {
    if (!iteratee) { return [] }
    if (iteratee.constructor.prototype.filter && isFunction$2(iteratee.constructor.prototype.filter)) {
      return iteratee.filter(fn)
    }
    var result = [];
    forEach(iteratee, function (val, key) {
      if (fn(val, key)) {
        result.push(val);
      }
    });
    return result
  }

  function flatten(arr) {
    return Array.prototype.concat.apply([], arr)
  }

  var NodeIndex = function NodeIndex () {};

  NodeIndex.prototype.select = function select (node) {
    throw new Error('This method is abstract.')
  };


  NodeIndex.prototype.create = function create (node) {
    throw new Error('This method is abstract.')
  };


  NodeIndex.prototype.delete = function delete$1 (node) {
    throw new Error('This method is abstract.')
  };

  NodeIndex.prototype.set = function set (node, path, newValue, oldValue) {
    this.update(node, path, newValue, oldValue);
  };


  NodeIndex.prototype.update = function update (node, path, newValue, oldValue) {
    throw new Error('This method is abstract.')
  };


  NodeIndex.prototype.reset = function reset (data) {
    this._clear();
    this._initialize(data);
  };


  NodeIndex.prototype.clone = function clone () {
    var NodeIndexClass = this.constructor;
    var clone = new NodeIndexClass();
    return clone
  };

  NodeIndex.prototype._clear = function _clear () {
    throw new Error('This method is abstract')
  };

  NodeIndex.prototype._initialize = function _initialize (data) {
    forEach(data.getNodes(), function(node) {
      if (this.select(node)) {
        this.create(node);
      }
    }.bind(this));
  };


  NodeIndex.create = function(prototype) {
    var index = Object.assign(new NodeIndex(), prototype);
    index.clone = function() {
      return NodeIndex.create(prototype)
    };
    return index
  };


  NodeIndex.filterByType = function(type) {
    return function(node) {
      return node.isInstanceOf(type)
    }
  };

  var DocumentIndex = (function (NodeIndex$$1) {
    function DocumentIndex () {
      NodeIndex$$1.apply(this, arguments);
    }if ( NodeIndex$$1 ) DocumentIndex.__proto__ = NodeIndex$$1;
    DocumentIndex.prototype = Object.create( NodeIndex$$1 && NodeIndex$$1.prototype );
    DocumentIndex.prototype.constructor = DocumentIndex;



    return DocumentIndex;
  }(NodeIndex));

  var annotationHelpers = {
    insertedText: insertedText,
    deletedText: deletedText,
    transferAnnotations: transferAnnotations,
    expandAnnotation: expandAnnotation,
    fuseAnnotation: fuseAnnotation,
    truncateAnnotation: truncateAnnotation
  };

  function insertedText(doc, coordinate, length) {
    if (!length) { return; }
    var index = doc.getIndex('annotations');
    var annotations = index.get(coordinate.path);
    for (var i = 0; i < annotations.length; i++) {
      var anno = annotations[i];
      var pos = coordinate.offset;
      var start = anno.start.offset;
      var end = anno.end.offset;
      var newStart = start;
      var newEnd = end;
      if ( (pos < start) ||
          (pos === start) ) {
        newStart += length;
      }

      if ( (pos < end) ||
          (pos === end && !anno.isInline()) ) {
        newEnd += length;
      }

      if (newStart !== start) {
        doc.set([anno.id, 'start', 'offset'], newStart);
      }
      if (newEnd !== end) {
        doc.set([anno.id, 'end', 'offset'], newEnd);
      }
    }




















  }

  function deletedText(doc, path, startOffset, endOffset) {
    if (startOffset === endOffset) { return; }
    var index = doc.getIndex('annotations');
    var annotations = index.get(path);
    var length = endOffset - startOffset;
    for (var i = 0; i < annotations.length; i++) {
      var anno = annotations[i];
      var pos1 = startOffset;
      var pos2 = endOffset;
      var start = anno.start.offset;
      var end = anno.end.offset;
      var newStart = start;
      var newEnd = end;
      if (pos2 <= start) {
        newStart -= length;
        newEnd -= length;
        doc.set([anno.id, 'start', 'offset'], newStart);
        doc.set([anno.id, 'end', 'offset'], newEnd);
      } else {
        if (pos1 <= start) {
          newStart = start - Math.min(pos2-pos1, start-pos1);
        }
        if (pos1 <= end) {
          newEnd = end - Math.min(pos2-pos1, end-pos1);
        }

        if (start !== end && newStart === newEnd) {
          doc.delete(anno.id);
        } else {

          if (start !== newStart) {
            doc.set([anno.id, 'start', 'offset'], newStart);
          }
          if (end !== newEnd) {
            doc.set([anno.id, 'end', 'offset'], newEnd);
          }
        }
      }
    }






































  }


  function transferAnnotations(doc, path, offset, newPath, newOffset) {
    var index = doc.getIndex('annotations');
    var annotations = index.get(path, offset);
    for (var i = 0; i < annotations.length; i++) {
      var a = annotations[i];
      var isInside = (offset > a.start.offset && offset < a.end.offset);
      var start = a.start.offset;
      var end = a.end.offset;

      if (isInside) {

        if (a.canSplit()) {
          var newAnno = a.toJSON();
          newAnno.id = uuid(a.type + "_");
          newAnno.start.path = newPath;
          newAnno.start.offset = newOffset;
          newAnno.end.path = newPath;
          newAnno.end.offset = newOffset + a.end.offset - offset;
          doc.create(newAnno);
        }

        var newStartOffset = a.start.offset;
        var newEndOffset = offset;

        if (newEndOffset === newStartOffset) {
          doc.delete(a.id);
        }

        else {

          if (newStartOffset !== start) {
            doc.set([a.id, 'start', 'offset'], newStartOffset);
          }
          if (newEndOffset !== end) {
            doc.set([a.id, 'end', 'offset'], newEndOffset);
          }
        }
      }

      else if (a.start.offset >= offset) {



        doc.set([a.id, 'start', 'path'], newPath);
        doc.set([a.id, 'start', 'offset'], newOffset + a.start.offset - offset);
        doc.set([a.id, 'end', 'path'], newPath);
        doc.set([a.id, 'end', 'offset'], newOffset + a.end.offset - offset);
      }
    }

























  }


  function truncateAnnotation(tx, anno, sel) {
    if (!sel || !sel._isSelection) { throw new Error('Argument "selection" is required.') }
    if (!anno || !anno._isAnnotation) { throw new Error('Argument "anno" is required.') }
    var annoSel = anno.getSelection();
    var newAnnoSel = annoSel.truncateWith(sel);
    anno._updateRange(tx, newAnnoSel);
    return anno
  }


  function expandAnnotation(tx, anno, sel) {
    if (!sel || !sel._isSelection) { throw new Error('Argument "selection" is required.') }
    if (!anno || !anno._isAnnotation) { throw new Error('Argument "anno" is required.') }
    var annoSel = anno.getSelection();
    var newAnnoSel = annoSel.expand(sel);
    anno._updateRange(tx, newAnnoSel);
    return anno
  }


  function fuseAnnotation(tx, annos) {
    if (!isArray(annos) || annos.length < 2) {
      throw new Error('fuseAnnotation(): at least two annotations are necessary.')
    }
    var sel, annoType;
    annos.forEach(function(anno, idx) {
      if (idx === 0) {
        sel = anno.getSelection();
        annoType = anno.type;
      } else {
        if (anno.type !== annoType) {
          throw new Error('fuseAnnotation(): all annotations must be of the same type.')
        }
        sel = sel.expand(anno.getSelection());
      }
    });

    for (var i = 1; i < annos.length; i++) {
      tx.delete(annos[i].id);
    }
    expandAnnotation(tx, annos[0], sel);
    tx.setSelection(sel);
  }

  var documentHelpers = {
    isContainerAnnotation: isContainerAnnotation,
    getPropertyAnnotationsForSelection: getPropertyAnnotationsForSelection,
    getContainerAnnotationsForSelection: getContainerAnnotationsForSelection,
    getAnnotationsForSelection: getAnnotationsForSelection,
    getTextForSelection: getTextForSelection,
    getMarkersForSelection: getMarkersForSelection,
    getChangeFromDocument: getChangeFromDocument,
    copyNode: copyNode,
    deleteNode: deleteNode,
    deleteTextRange: deleteTextRange,
    deleteListRange: deleteListRange,
    mergeListItems: mergeListItems
  };


  function isContainerAnnotation(doc, type) {
    var schema = doc.getSchema();
    return schema.isInstanceOf(type, 'container-annotation');
  }


  function getPropertyAnnotationsForSelection(doc, sel, options) {
    options = options || {};
    if (!sel.isPropertySelection()) {
      return [];
    }
    var path = sel.getPath();
    var annotations = doc.getIndex('annotations').get(path, sel.start.offset, sel.end.offset);
    if (options.type) {
      annotations = filter(annotations, DocumentIndex.filterByType(options.type));
    }
    return annotations;
  }


  function getContainerAnnotationsForSelection(doc, sel, containerId, options) {




    if (!containerId) {
      throw new Error("'containerId' is required.");
    }
    options = options || {};
    var index = doc.getIndex('container-annotations');
    var annotations = index.get(containerId, options.type);
    annotations = filter(annotations, function(anno) {
      return sel.overlaps(anno.getSelection());
    });
    return annotations;
  }


  function getAnnotationsForSelection(doc, sel, annotationType, containerId) {
    var annos;
    var isContainerAnno = isContainerAnnotation(doc, annotationType);

    if (isContainerAnno) {
      var container = doc.get(containerId, 'strict');
      annos = getContainerAnnotationsForSelection(doc, sel, container, {
        type: annotationType
      });
    } else {
      annos = getPropertyAnnotationsForSelection(doc, sel, { type: annotationType });
    }
    return annos;
  }


  function getTextForSelection(doc, sel) {
    if (!sel || sel.isNull()) {
      return "";
    } else if (sel.isPropertySelection()) {
      var text = doc.get(sel.start.path);
      return text.substring(sel.start.offset, sel.end.offset);
    } else if (sel.isContainerSelection()) {
      var result = [];
      var nodeIds = sel.getNodeIds();
      var L = nodeIds.length;
      for (var i = 0; i < L; i++) {
        var id = nodeIds[i];
        var node = doc.get(id);
        if (node.isText()) {
          var text$1 = node.getText();
          if (i === L-1) {
            text$1 = text$1.slice(0, sel.end.offset);
          }
          if (i === 0) {
            text$1 = text$1.slice(sel.start.offset);
          }
          result.push(text$1);
        }
      }
      return result.join('\n');
    }
  }

  function getMarkersForSelection(doc, sel) {

    if (!sel || !sel.isPropertySelection()) { return [] }
    var path = sel.getPath();

    var markers = doc.getIndex('markers').get(path);
    var filtered = filter(markers, function(m) {
      return m.containsSelection(sel)
    });
    return filtered
  }

  function getChangeFromDocument(doc) {
    var nodes = doc.getNodes();
    var annotations = [];
    var contentNodes = [];
    var containers = [];

    forEach(nodes, function (node) {
      if (node._isAnnotation) {
        annotations.push(node);
      } else if (node._isContainer) {
        containers.push(node);
      } else {
        contentNodes.push(node);
      }
    });

    var ops = contentNodes.concat(containers).concat(annotations).map(function (node) {
      return ObjectOperation.Create([node.id], node.toJSON())
    });

    return new DocumentChange({ops: ops})
  }


  function deleteNode(doc, node) {
    if (!node) {
      console.warn('Invalid arguments');
      return
    }
    if (node.isText()) {

      var annos = doc.getIndex('annotations').get(node.id);
      for (var i = 0; i < annos.length; i++) {
        doc.delete(annos[i].id);
      }
    }



    var nodeSchema = node.getSchema();
    forEach(nodeSchema, function (prop) {
      if ((prop.isReference() && prop.isOwned()) || (prop.type === 'file')) {
        if (prop.isArray()) {
          var ids = node[prop.name];
          ids.forEach(function (id) {
            deleteNode(doc, doc.get(id));
          });
        } else {
          deleteNode(doc, doc.get(node[prop.name]));
        }
      }
    });
    doc.delete(node.id);
  }


  function copyNode(node) {
    var nodes = [];

    var nodeSchema = node.getSchema();
    var doc = node.getDocument();
    forEach(nodeSchema, function (prop) {


      if ((prop.isReference() && prop.isOwned()) || (prop.type === 'file')) {
        var val = node[prop.name];
        nodes.push(_copyChildren(val));
      }
    });
    nodes.push(node.toJSON());
    var annotationIndex = node.getDocument().getIndex('annotations');
    var annotations = annotationIndex.get([node.id]);
    forEach(annotations, function(anno) {
      nodes.push(anno.toJSON());
    });
    var result = flatten(nodes).filter(Boolean);

    return result

    function _copyChildren(val) {
      if (!val) { return null }
      if (isArray(val)) {
        return flatten(val.map(_copyChildren))
      } else {
        var id = val;
        if (!id) { return null }
        var child = doc.get(id);
        if (!child) { return }
        return copyNode(child)
      }
    }
  }


  function deleteTextRange(doc, start, end) {
    if (!start) {
      start = {
        path: end.path,
        offset: 0
      };
    }
    var path = start.path;
    var text = doc.get(path);
    if (!end) {
      end = {
        path: start.path,
        offset: text.length
      };
    }
    if (!isArrayEqual(start.path, end.path)) { throw new Error('Unsupported state: selection should be on one property') }
    var startOffset = start.offset;
    var endOffset = end.offset;
    doc.update(path, { type: 'delete', start: startOffset, end: endOffset });

    var annos = doc.getAnnotations(path);
    annos.forEach(function(anno) {
      var annoStart = anno.start.offset;
      var annoEnd = anno.end.offset;

      if (annoEnd<=startOffset) {
        return
      }

      else if (annoStart>=endOffset) {
        doc.update([anno.id, 'start'], { type: 'shift', value: startOffset-endOffset });
        doc.update([anno.id, 'end'], { type: 'shift', value: startOffset-endOffset });
      }

      else if (annoStart>=startOffset && annoEnd<=endOffset) {
        doc.delete(anno.id);
      }

      else if (annoStart>=startOffset && annoEnd>=endOffset) {
        if (annoStart>startOffset) {
          doc.update([anno.id, 'start'], { type: 'shift', value: startOffset-annoStart });
        }
        doc.update([anno.id, 'end'], { type: 'shift', value: startOffset-endOffset });
      }

      else if (annoStart<=startOffset && annoEnd<=endOffset) {
        doc.update([anno.id, 'end'], { type: 'shift', value: startOffset-annoEnd });
      }

      else if (annoStart<startOffset && annoEnd >= endOffset) {
        doc.update([anno.id, 'end'], { type: 'shift', value: startOffset-endOffset });
      }
      else {
        console.warn('TODO: handle annotation update case.');
      }
    });
  }

  function deleteListRange(doc, list, start, end) {
    if (doc !== list.getDocument()) {
      list = doc.get(list.id);
    }
    if (!start) {
      start = {
        path: list.getItemAt(0).getTextPath(),
        offset: 0
      };
    }
    if (!end) {
      var item = list.getLastItem();
      end = {
        path: item.getTextPath(),
        offset: item.getLength()
      };
    }
    var startId = start.path[0];
    var startPos = list.getItemPosition(startId);
    var endId = end.path[0];
    var endPos = list.getItemPosition(endId);

    if (startPos === endPos) {
      deleteTextRange(doc, start, end);
      return
    }

    if (startPos > endPos) {
      var assign;
      (assign = [end, start], start = assign[0], end = assign[1]);
      var assign$1;
      (assign$1 = [endPos, startPos], startPos = assign$1[0], endPos = assign$1[1]);
      var assign$2;
      (assign$2 = [endId, startId], startId = assign$2[0], endId = assign$2[1]);
    }
    var firstItem = doc.get(startId);
    var lastItem = doc.get(endId);
    var firstEntirelySelected = isEntirelySelected(doc, firstItem, start, null);
    var lastEntirelySelected = isEntirelySelected(doc, lastItem, null, end);


    if (lastEntirelySelected) {
      list.removeItemAt(endPos);
      deleteNode(doc, lastItem);
    } else {
      deleteTextRange(doc, null, end);
    }


    for (var i = endPos-1; i > startPos; i--) {
      var itemId = list.items[i];
      list.removeItemAt(i);
      deleteNode(doc, doc.get(itemId));
    }


    if (firstEntirelySelected) {
      list.removeItemAt(startPos);
      deleteNode(doc, firstItem);
    } else {
      deleteTextRange(doc, start, null);
    }

    if (!firstEntirelySelected && !lastEntirelySelected) {
      mergeListItems(doc, list.id, startPos);
    }
  }

  function mergeListItems(doc, listId, itemPos) {

    var list = doc.get(listId);
    var target = list.getItemAt(itemPos);
    var targetPath = target.getTextPath();
    var targetLength = target.getLength();
    var source = list.getItemAt(itemPos+1);
    var sourcePath = source.getTextPath();

    list.removeItemAt(itemPos+1);

    doc.update(targetPath, { type: 'insert', start: targetLength, text: source.getText() });

    annotationHelpers.transferAnnotations(doc, sourcePath, 0, targetPath, targetLength);
    doc.delete(source.id);
  }

  var SelectionState = function SelectionState(doc) {
    this.document = doc;

    this.selection = Selection.nullSelection;
    this._state = {};
    this._resetState();
  };

  SelectionState.prototype.setSelection = function setSelection (sel) {

    if (!sel) {
      sel = Selection.nullSelection;
    } else {
      sel.attach(this.document);
    }


    this._deriveState(sel);
    this.selection = sel;
    return true
  };

  SelectionState.prototype.getSelection = function getSelection () {
    return this.selection
  };

  SelectionState.prototype.getAnnotationsForType = function getAnnotationsForType (type) {
    var state = this._state;
    if (state.annosByType) {
      return state.annosByType.get(type) || []
    }
    return []
  };

  SelectionState.prototype.getMarkers = function getMarkers () {

    return this._state.markers || []
  };

  SelectionState.prototype.isInlineNodeSelection = function isInlineNodeSelection () {
    return this._state.isInlineNodeSelection
  };

  SelectionState.prototype.getContainer = function getContainer () {
    return this._state.container
  };

  SelectionState.prototype.getPreviousNode = function getPreviousNode () {
    return this._state.previousNode
  };

  SelectionState.prototype.getNextNode = function getNextNode () {
    return this._state.nextNode
  };


  SelectionState.prototype.isFirst = function isFirst$$1 () {
    return Boolean(this._state.isFirst)
  };


  SelectionState.prototype.isLast = function isLast$$1 () {
    return Boolean(this._state.isLast)
  };

  SelectionState.prototype.get = function get (key) {
    return this._state[key]
  };


  SelectionState.prototype.set = function set (key, value) {
    if (this._state[key]) {
      throw new Error(("State " + key + " is already set"))
    }
    this._state[key] = value;
  };

  SelectionState.prototype._deriveState = function _deriveState (sel) {
    this._resetState();
    this._deriveContainerSelectionState(sel);
    this._deriveAnnoState(sel);
    if (this.document.getIndex('markers')) {
      this._deriveMarkerState(sel);
    }

  };

  SelectionState.prototype._deriveContainerSelectionState = function _deriveContainerSelectionState (sel) {
    var state = this._state;
    var doc = this.document;
    if (sel.containerId) {
      var container = doc.get(sel.containerId);
      state.container = container;
      var startId = sel.start.getNodeId();
      var endId = sel.end.getNodeId();
      var startNode = doc.get(startId).getRoot();
      var startPos = container.getPosition(startNode);
      if (startPos > 0) {
        state.previousNode = container.getNodeAt(startPos-1);
      }
      state.isFirst = isFirst(doc, sel.start);
      var endNode, endPos;
      if (endId === startId) {
        endNode = startNode;
        endPos = startPos;
      } else {
        endNode = doc.get(endId).getRoot();
        endPos = container.getPosition(endNode);
      }
      if (endPos < container.getLength()-1) {
        state.nextNode = container.getNodeAt(endPos+1);
      }
      state.isLast = isLast(doc, sel.end);
    }
  };

  SelectionState.prototype._deriveAnnoState = function _deriveAnnoState (sel) {
    var doc = this.document;
    var state = this._state;


    var annosByType = new TreeIndex.Arrays();
    var propAnnos = documentHelpers.getPropertyAnnotationsForSelection(doc, sel);
    propAnnos.forEach(function(anno) {
      annosByType.add(anno.type, anno);
    });

    if (propAnnos.length === 1 && propAnnos[0].isInline()) {
      state.isInlineNodeSelection = propAnnos[0].getSelection().equals(sel);
    }

    var containerId = sel.containerId;
    if (containerId) {
      var containerAnnos = documentHelpers.getContainerAnnotationsForSelection(doc, sel, containerId);
      containerAnnos.forEach(function(anno) {
        annosByType.add(anno.type, anno);
      });
    }
    state.annosByType = annosByType;
  };

  SelectionState.prototype._deriveMarkerState = function _deriveMarkerState (sel) {
    var doc = this.document;
    var state = this._state;
    var markers = documentHelpers.getMarkersForSelection(doc, sel);
    state.markers = markers;
  };

  SelectionState.prototype._resetState = function _resetState () {
    this._state = {

      annosByType: null,

      markers: null,

      isInlineNodeSelection: false,

      container: null,
      previousNode: null,
      nextNode: null,

      isFirst: false,

      isLast: false
    };
    return this._state
  };

  var ChangeHistory = function ChangeHistory() {

    this.doneChanges = [];

    this.undoneChanges = [];

    this.lastChange = null;
  };

  ChangeHistory.prototype.canUndo = function canUndo () {
    return this.doneChanges.length > 0
  };

  ChangeHistory.prototype.canRedo = function canRedo () {
    return this.undoneChanges.length > 0
  };

  ChangeHistory.prototype.push = function push (change) {
    this.doneChanges.push(change);
    this.undoneChanges = [];
  };

  var SurfaceManager = function SurfaceManager(editorSession) {
    this.editorSession = editorSession;
    this.surfaces = {};
    this._state = {
      focusedSurfaceId: null,
      selection: null,
    };
    editorSession.onUpdate('selection', this._onSelectionChanged, this);
    editorSession.onPostRender(this._recoverDOMSelection, this);
  };

  SurfaceManager.prototype.dispose = function dispose () {
    this.editorSession.off(this);
  };


  SurfaceManager.prototype.getSurface = function getSurface (name) {
    if (name) {
      return this.surfaces[name]
    }
  };


  SurfaceManager.prototype.getFocusedSurface = function getFocusedSurface () {
    if (this._state.focusedSurfaceId) {
      return this.getSurface(this._state.focusedSurfaceId)
    }
  };

  SurfaceManager.prototype.getSurfaces = function getSurfaces () {
    var this$1 = this;



    return Object.keys(this.surfaces).map(function (key) { return this$1.surfaces[key]; })
  };


  SurfaceManager.prototype.registerSurface = function registerSurface (surface) {
    this.surfaces[surface.getId()] = surface;
  };


  SurfaceManager.prototype.unregisterSurface = function unregisterSurface (surface) {
    surface.off(this);
    var surfaceId = surface.getId();





    var registeredSurface = this.surfaces[surfaceId];
    if (registeredSurface === surface) {
      var focusedSurface = this.getFocusedSurface();
      delete this.surfaces[surfaceId];
      if (surface && focusedSurface === surface) {
        this._state.focusedSurfaceId = null;
      }
    }
  };

  SurfaceManager.prototype._onSelectionChanged = function _onSelectionChanged (selection) {
    var state = this._state;
    state.selection = selection;
    state.focusedSurfaceId = selection.surfaceId;



    if (selection && selection.isCustomSelection() && inBrowser) {
      window.getSelection().removeAllRanges();
      window.document.activeElement.blur();
    }
  };

  SurfaceManager.prototype._recoverDOMSelection = function _recoverDOMSelection () {


    var focusedSurface = this.getFocusedSurface();
    if (focusedSurface && !focusedSurface.isDisabled()) {

      focusedSurface.focus();
      focusedSurface.rerenderDOMSelection();
    }
  };

  var PropertyIndex = (function (NodeIndex$$1) {
    function PropertyIndex(property) {
      NodeIndex$$1.call(this);

      this._property = property || 'id';
      this.index = new TreeIndex();
    }

    if ( NodeIndex$$1 ) PropertyIndex.__proto__ = NodeIndex$$1;
    PropertyIndex.prototype = Object.create( NodeIndex$$1 && NodeIndex$$1.prototype );
    PropertyIndex.prototype.constructor = PropertyIndex;


    PropertyIndex.prototype.get = function get (path) {
      return this.index.get(path) || {}
    };


    PropertyIndex.prototype.getAll = function getAll (path) {
      return this.index.getAll(path)
    };


    PropertyIndex.prototype.select = function select (node) {
      return true
    };


    PropertyIndex.prototype.create = function create (node) {
      var values = node[this._property];
      if (!isArray(values)) {
        values = [values];
      }
      forEach(values, function(value) {
        this.index.set([value, node.id], node);
      }.bind(this));
    };


    PropertyIndex.prototype.delete = function delete$1 (node) {
      var values = node[this._property];
      if (!isArray(values)) {
        values = [values];
      }
      forEach(values, function(value) {
        this.index.delete([value, node.id]);
      }.bind(this));
    };


    PropertyIndex.prototype.update = function update (node, path, newValue, oldValue) {
      if (!this.select(node) || path[1] !== this._property) { return }
      var values = oldValue;
      if (!isArray(values)) {
        values = [values];
      }
      forEach(values, function(value) {
        this.index.delete([value, node.id]);
      }.bind(this));
      values = newValue;
      if (!isArray(values)) {
        values = [values];
      }
      forEach(values, function(value) {
        this.index.set([value, node.id], node);
      }.bind(this));
    };

    PropertyIndex.prototype.set = function set (node, path, newValue, oldValue) {
      this.update(node, path, newValue, oldValue);
    };

    PropertyIndex.prototype._clear = function _clear () {
      this.index.clear();
    };

    PropertyIndex.prototype._initialize = function _initialize (data) {
      forEach(data.getNodes(), function(node) {
        if (this.select(node)) {
          this.create(node);
        }
      }.bind(this));
    };

    return PropertyIndex;
  }(NodeIndex));

  var AnnotationIndex = (function (DocumentIndex$$1) {
    function AnnotationIndex() {
      DocumentIndex$$1.call(this);

      this.byPath = new TreeIndex();
      this.byType = new TreeIndex();
    }

    if ( DocumentIndex$$1 ) AnnotationIndex.__proto__ = DocumentIndex$$1;
    AnnotationIndex.prototype = Object.create( DocumentIndex$$1 && DocumentIndex$$1.prototype );
    AnnotationIndex.prototype.constructor = AnnotationIndex;

    AnnotationIndex.prototype.select = function select (node) {
      return Boolean(node._isPropertyAnnotation)
    };

    AnnotationIndex.prototype.reset = function reset (data) {
      this.byPath.clear();
      this.byType.clear();
      this._initialize(data);
    };


    AnnotationIndex.prototype.get = function get (path, start, end, type) {
      var annotations;
      if (isString(path) || path.length === 1) {
        annotations = this.byPath.getAll(path) || {};
      } else {
        annotations = this.byPath.get(path);
      }
      annotations = map(annotations);
      if (isNumber(start)) {
        annotations = filter(annotations, AnnotationIndex.filterByRange(start, end));
      }
      if (type) {
        annotations = filter(annotations, DocumentIndex$$1.filterByType(type));
      }
      return annotations
    };

    AnnotationIndex.prototype.create = function create (anno) {
      this.byType.set([anno.type, anno.id], anno);
      this.byPath.set(anno.start.path.concat([anno.id]), anno);
    };

    AnnotationIndex.prototype.delete = function delete$1 (anno) {
      this._delete(anno.type, anno.id, anno.start.path);
    };

    AnnotationIndex.prototype._delete = function _delete (type, id, path) {
      this.byType.delete([type, id]);
      this.byPath.delete(path.concat([id]));
    };

    AnnotationIndex.prototype.update = function update (node, path, newValue, oldValue) {

      if (this.select(node) && path[1] === 'start' && path[2] === "path") {
        this._delete(node.type, node.id, oldValue);
        this.create(node);
      }
    };

    return AnnotationIndex;
  }(DocumentIndex));

  AnnotationIndex.filterByRange = function(start, end) {
    return function(anno) {
      var aStart = anno.start.offset;
      var aEnd = anno.end.offset;
      var overlap = (aEnd >= start);

      if (isNumber(end)) {
        overlap = overlap && (aStart <= end);
      }
      return overlap
    }
  };

  var ContainerAnnotationIndex = (function (DocumentIndex$$1) {
    function ContainerAnnotationIndex() {
      DocumentIndex$$1.call(this);
      this.byId = new TreeIndex();
    }

    if ( DocumentIndex$$1 ) ContainerAnnotationIndex.__proto__ = DocumentIndex$$1;
    ContainerAnnotationIndex.prototype = Object.create( DocumentIndex$$1 && DocumentIndex$$1.prototype );
    ContainerAnnotationIndex.prototype.constructor = ContainerAnnotationIndex;

    ContainerAnnotationIndex.prototype.select = function select (node) {
      return Boolean(node._isContainerAnnotation)
    };

    ContainerAnnotationIndex.prototype.reset = function reset (data) {
      this.byId.clear();
      this._initialize(data);
    };

    ContainerAnnotationIndex.prototype.get = function get (containerId, type) {
      var annotations = map(this.byId.get(containerId));
      if (isString(type)) {
        annotations = filter(annotations, DocumentIndex$$1.filterByType);
      }
      return annotations
    };

    ContainerAnnotationIndex.prototype.create = function create (anno) {
      this.byId.set([anno.containerId, anno.id], anno);
    };

    ContainerAnnotationIndex.prototype.delete = function delete$1 (anno) {
      this.byId.delete([anno.containerId, anno.id]);
    };

    ContainerAnnotationIndex.prototype.update = function update (node, path, newValue, oldValue) {

    };

    return ContainerAnnotationIndex;
  }(DocumentIndex));

  var PathEventProxy = function PathEventProxy(doc) {
    this.listeners = new TreeIndex.Arrays();
    this._list = [];
    this.doc = doc;
  };

  PathEventProxy.prototype.on = function on (path, method, context) {
    this._add(context, path, method);
  };




  PathEventProxy.prototype.off = function off (context, path, method) {
    this._remove(context, path, method);
  };

  PathEventProxy.prototype.connect = function connect (listener, path, method) {
    console.warn('DEPRECATED: use proxy.on(path, this.onPropertyChange, this) instead');
    this.on(path, method, listener);
  };

  PathEventProxy.prototype.disconnect = function disconnect (listener) {
    console.warn('DEPRECATED: use proxy.off(this) instead');
    this.off(listener);
  };

  PathEventProxy.prototype.onDocumentChanged = function onDocumentChanged (change, info, doc) {

    if (this._list.length === 0) {
      return
    }
    var listeners = this.listeners;
    forEach(change.updated, function(_, pathStr) {
      var scopedListeners = listeners.get(pathStr.split(','));
      if (isArray(scopedListeners)) { scopedListeners = scopedListeners.slice(0); }
      forEach(scopedListeners, function(entry) {
        entry.method.call(entry.listener, change, info, doc);
      });
    });
  };

  PathEventProxy.prototype._add = function _add (listener, path, method) {
    if (!method) {
      throw new Error('Invalid argument: expected function but got ' + method)
    }
    var entry = { listener: listener, path: path, method: method };
    this.listeners.add(path, entry);
    this._list.push(entry);
  };

  PathEventProxy.prototype._remove = function _remove (listener, path, method) {
    var this$1 = this;

    for (var i = 0; i < this._list.length; i++) {
      var item = this$1._list[i];
      var match = (
          (!path || isEqual(item.path, path)) &&
          (!listener || item.listener === listener) &&
          (!method || item.method !== method)
      );
      if (match) {
        var entry = this$1._list[i];
        this$1._list.splice(i, 1);
        this$1.listeners.remove(entry.path, entry);
      }
    }
  };

  var NodeFactory = function NodeFactory(nodeRegistry) {
    this.nodeRegistry = nodeRegistry;
  };

  NodeFactory.prototype.create = function create (nodeType, nodeData) {
    var NodeClass = this.nodeRegistry.get(nodeType);
    if (!NodeClass) {
      throw new Error('No Node registered by that name: ' + nodeType)
    }
    return new NodeClass(nodeData)
  };

  var Data = (function (EventEmitter$$1) {
    function Data(schema, options) {
      EventEmitter$$1.call(this);

      options = options || {};
      this.schema = schema;
      this.nodes = {};
      this.indexes = {};
      this.options = options || {};

      this.nodeFactory = options.nodeFactory || new NodeFactory(schema.nodeRegistry);



      this.__QUEUE_INDEXING__ = false;
      this.queue = [];
    }

    if ( EventEmitter$$1 ) Data.__proto__ = EventEmitter$$1;
    Data.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    Data.prototype.constructor = Data;


    Data.prototype.contains = function contains (id) {
      return Boolean(this.nodes[id])
    };


    Data.prototype.get = function get (path, strict) {
      var result = this._get(path);
      if (strict && result === undefined) {
        if (isString(path)) {
          throw new Error("Could not find node with id '"+path+"'.")
        } else if (!this.contains(path[0])) {
          throw new Error("Could not find node with id '"+path[0]+"'.")
        } else {
          throw new Error("Property for path '"+path+"' us undefined.")
        }
      }
      return result
    };

    Data.prototype._get = function _get (path) {
      if (!path) { return undefined }
      var result;
      if (isString(path)) {
        result = this.nodes[path];
      } else if (path.length === 1) {
        result = this.nodes[path[0]];
      } else if (path.length > 1) {
        var context = this.nodes[path[0]];
        for (var i = 1; i < path.length-1; i++) {
          if (!context) { return undefined }
          context = context[path[i]];
        }
        if (!context) { return undefined }
        result = context[path[path.length-1]];
      }
      return result
    };


    Data.prototype.getNodes = function getNodes () {
      return this.nodes
    };


    Data.prototype.create = function create (nodeData) {
      var node = this.nodeFactory.create(nodeData.type, nodeData);
      if (!node) {
        throw new Error('Illegal argument: could not create node for data:', nodeData)
      }
      if (this.contains(node.id)) {
        throw new Error("Node already exists: " + node.id)
      }
      if (!node.id || !node.type) {
        throw new Error("Node id and type are mandatory.")
      }
      this.nodes[node.id] = node;

      var change = {
        type: 'create',
        node: node
      };

      if (this.__QUEUE_INDEXING__) {
        this.queue.push(change);
      } else {
        this._updateIndexes(change);
      }

      return node
    };


    Data.prototype.delete = function delete$1 (nodeId) {
      var node = this.nodes[nodeId];
      if (!node) { return }
      node.dispose();
      delete this.nodes[nodeId];

      var change = {
        type: 'delete',
        node: node,
      };

      if (this.__QUEUE_INDEXING__) {
        this.queue.push(change);
      } else {
        this._updateIndexes(change);
      }

      return node
    };


    Data.prototype.set = function set (path, newValue) {
      var node = this.get(path[0]);
      var oldValue = this._set(path, newValue);
      var change = {
        type: 'set',
        node: node,
        path: path,
        newValue: newValue,
        oldValue: oldValue
      };
      if (this.__QUEUE_INDEXING__) {
        this.queue.push(change);
      } else {
        this._updateIndexes(change);
      }
      return oldValue
    };

    Data.prototype._set = function _set (path, newValue) {
      var oldValue;
      if (path.length === 2) {
        oldValue = this.nodes[path[0]][path[1]];
        this.nodes[path[0]][path[1]] = newValue;
      } else if (path.length === 3) {
        oldValue = this.nodes[path[0]][path[1]][path[2]];
        this.nodes[path[0]][path[1]][path[2]] = newValue;
      } else {
        throw new Error('Path of length '+path.length+' not supported.')
      }
      return oldValue
    };


    Data.prototype.update = function update (path, diff) {
      var realPath = this.getRealPath(path);
      if (!realPath) {
        console.error('Could not resolve path', path);
        return
      }
      var node = this.get(realPath[0]);
      var oldValue = this._get(realPath);
      var newValue;
      if (diff.isOperation) {
        newValue = diff.apply(oldValue);
      } else {
        diff = this._normalizeDiff(oldValue, diff);
        if (isString(oldValue)) {
          switch (diff.type) {
            case 'delete': {
              newValue = oldValue.split('').splice(diff.start, diff.end-diff.start).join('');
              break
            }
            case 'insert': {
              newValue = [oldValue.substring(0, diff.start), diff.text, oldValue.substring(diff.start)].join('');
              break
            }
            default:
              throw new Error('Unknown diff type')
          }
        } else if (isArray(oldValue)) {
          newValue = oldValue.slice(0);
          switch (diff.type) {
            case 'delete': {
              newValue.splice(diff.pos, 1);
              break
            }
            case 'insert': {
              newValue.splice(diff.pos, 0, diff.value);
              break
            }
            default:
              throw new Error('Unknown diff type')
          }
        } else if (oldValue._isCoordinate) {
          switch (diff.type) {
            case 'shift': {

              oldValue = { path: oldValue.path, offset: oldValue.offset };
              newValue = oldValue;
              newValue.offset += diff.value;
              break
            }
            default:
              throw new Error('Unknown diff type')
          }
        } else {
          throw new Error('Diff is not supported:', JSON.stringify(diff))
        }
      }
      this._set(realPath, newValue);

      var change = {
        type: 'update',
        node: node,
        path: realPath,
        newValue: newValue,
        oldValue: oldValue
      };

      if (this.__QUEUE_INDEXING__) {
        this.queue.push(change);
      } else {
        this._updateIndexes(change);
      }

      return oldValue
    };


    Data.prototype._normalizeDiff = function _normalizeDiff (value, diff) {
      if (isString(value)) {

        if (diff['delete']) {
          console.warn('DEPRECATED: use doc.update(path, {type:"delete", start:s, end: e}) instead');
          diff = {
            type: 'delete',
            start: diff['delete'].start,
            end: diff['delete'].end
          };
        } else if (diff['insert']) {
          console.warn('DEPRECATED: use doc.update(path, {type:"insert", start:s, text: t}) instead');
          diff = {
            type: 'insert',
            start: diff['insert'].offset,
            text: diff['insert'].value
          };
        }
      } else if (isArray(value)) {

        if (diff['delete']) {
          console.warn('DEPRECATED: use doc.update(path, {type:"delete", pos:1}) instead');
          diff = {
            type: 'delete',
            pos: diff['delete'].offset
          };
        } else if (diff['insert']) {
          console.warn('DEPRECATED: use doc.update(path, {type:"insert", pos:1, value: "foo"}) instead');
          diff = {
            type: 'insert',
            pos: diff['insert'].offset,
            value: diff['insert'].value
          };
        }
      } else if (value._isCoordinate) {
        if (diff.hasOwnProperty('shift')) {
          console.warn('DEPRECATED: use doc.update(path, {type:"shift", value:2}) instead');
          diff = {
            type: 'shift',
            value: diff['shift']
          };
        }
      }
      return diff
    };


    Data.prototype.toJSON = function toJSON () {
      var nodes = {};
      forEach(this.nodes, function (node){
        nodes[node.id] = node.toJSON();
      });
      return {
        schema: [this.schema.id, this.schema.version],
        nodes: nodes
      }
    };


    Data.prototype.reset = function reset () {
      this.nodes.clear();
    };


    Data.prototype.addIndex = function addIndex (name, index) {
      if (this.indexes[name]) {
        console.error('Index with name %s already exists.', name);
      }
      index.reset(this);
      this.indexes[name] = index;
      return index
    };


    Data.prototype.getIndex = function getIndex (name) {
      return this.indexes[name]
    };


    Data.prototype._updateIndexes = function _updateIndexes (change) {
      if (!change || this.__QUEUE_INDEXING__) { return }
      forEach(this.indexes, function(index) {
        if (index.select(change.node)) {
          if (!index[change.type]) {
            console.error('Contract: every NodeIndex must implement ' + change.type);
          }
          index[change.type](change.node, change.path, change.newValue, change.oldValue);
        }
      });
    };


    Data.prototype._stopIndexing = function _stopIndexing () {
      this.__QUEUE_INDEXING__ = true;
    };


    Data.prototype._startIndexing = function _startIndexing () {
      var this$1 = this;

      this.__QUEUE_INDEXING__ = false;
      while(this.queue.length >0) {
        var change = this$1.queue.shift();
        this$1._updateIndexes(change);
      }
    };

    return Data;
  }(EventEmitter));

  var IncrementalData = (function (Data$$1) {
    function IncrementalData () {
      Data$$1.apply(this, arguments);
    }

    if ( Data$$1 ) IncrementalData.__proto__ = Data$$1;
    IncrementalData.prototype = Object.create( Data$$1 && Data$$1.prototype );
    IncrementalData.prototype.constructor = IncrementalData;

    IncrementalData.prototype.create = function create (nodeData) {
      if (nodeData._isNode) {
        nodeData = nodeData.toJSON();
      }
      var op = ObjectOperation.Create([nodeData.id], nodeData);
      this.apply(op);
      return op
    };


    IncrementalData.prototype.delete = function delete$1 (nodeId) {
      var op = null;
      var node = this.get(nodeId);
      if (node) {
        var nodeData = node.toJSON();
        op = ObjectOperation.Delete([nodeId], nodeData);
        this.apply(op);
      }
      return op
    };


    IncrementalData.prototype.update = function update (path, diff) {
      var diffOp = this._getDiffOp(path, diff);
      var op = ObjectOperation.Update(path, diffOp);
      this.apply(op);
      return op
    };


    IncrementalData.prototype.set = function set (path, newValue) {
      var oldValue = this.get(path);
      var op = ObjectOperation.Set(path, oldValue, newValue);
      this.apply(op);
      return op
    };


    IncrementalData.prototype.apply = function apply (op) {
      if (op.type === ObjectOperation.NOP) { return }
      else if (op.type === ObjectOperation.CREATE) {

        Data$$1.prototype.create.call(this, cloneDeep(op.val));
      } else if (op.type === ObjectOperation.DELETE) {
        Data$$1.prototype.delete.call(this, op.val.id);
      } else if (op.type === ObjectOperation.UPDATE) {
        var oldVal = this.get(op.path);
        var diff = op.diff;
        if (op.propertyType === 'array') {
          if (! (diff._isArrayOperation) ) {
            diff = ArrayOperation.fromJSON(diff);
          }

          diff.apply(oldVal);
        } else if (op.propertyType === 'string') {
          if (!(diff._isTextOperation) ) {
            diff = TextOperation.fromJSON(diff);
          }
          var newVal = diff.apply(oldVal);
          Data$$1.prototype.set.call(this, op.path, newVal);
        } else if (op.propertyType === 'coordinate') {
          if (!(diff._isCoordinateOperation) ) {
            diff = CoordinateOperation.fromJSON(diff);
          }
          diff.apply(oldVal);
        } else {
          throw new Error("Unsupported type for operational update.")
        }
      } else if (op.type === ObjectOperation.SET) {
        Data$$1.prototype.set.call(this, op.path, op.val);
      } else {
        throw new Error("Illegal state.")
      }
      this.emit('operation:applied', op, this);
    };


    IncrementalData.prototype._getDiffOp = function _getDiffOp (path, diff) {
      var diffOp = null;
      if (diff.isOperation) {
        diffOp = diff;
      } else {
        var value = this.get(path);
        diff = this._normalizeDiff(value, diff);
        if (value === null || value === undefined) {
          throw new Error('Property has not been initialized: ' + JSON.stringify(path))
        } else if (isString(value)) {
          switch (diff.type) {
            case 'delete': {
              diffOp = TextOperation.Delete(diff.start, value.substring(diff.start, diff.end));
              break
            }
            case 'insert': {
              diffOp = TextOperation.Insert(diff.start, diff.text);
              break
            }
            default:
              throw new Error('Unknown diff type')
          }
        } else if (isArray(value)) {
          switch (diff.type) {
            case 'delete': {
              diffOp = ArrayOperation.Delete(diff.pos, value[diff.pos]);
              break
            }
            case 'insert': {
              diffOp = ArrayOperation.Insert(diff.pos, diff.value);
              break
            }
            default:
              throw new Error('Unknown diff type')
          }
        } else if (value._isCoordinate) {
          switch (diff.type) {
            case 'shift': {
              diffOp = CoordinateOperation.Shift(diff.value);
              break
            }
            default:
              throw new Error('Unknown diff type')
          }
        }
      }
      if (!diffOp) {
        throw new Error('Unsupported diff: ' + JSON.stringify(diff))
      }
      return diffOp
    };

    return IncrementalData;
  }(Data));

  var DocumentNodeFactory = function DocumentNodeFactory(doc) {
    this.doc = doc;
  };

  DocumentNodeFactory.prototype.create = function create (nodeType, nodeData) {
    var NodeClass = this.doc.schema.getNodeClass(nodeType);
    if (!NodeClass) {
      throw new Error('No node registered by that name: ' + nodeType)
    }
    return new NodeClass(this.doc, nodeData)
  };

  var Range = function Range(start, end, reverse, containerId, surfaceId) {

    if (arguments[0] === 'SKIP') { return }
    if (arguments.length === 1 && isPlainObject(arguments[0])) {
      var data = arguments[0];
      this.start = data.start;
      this.end = data.end;
      this.reverse = Boolean(data.reverse);
      this.containerId = data.containerId;
      this.surfaceId = data.surfaceId;
    } else {
      this.start = start;
      this.end = end;
      this.reverse = Boolean(reverse);
      this.containerId = containerId;
      this.surfaceId = surfaceId;
    }
  };

  Range.prototype.isCollapsed = function isCollapsed () {
    return this.start.equals(this.end)
  };

  Range.prototype.equals = function equals (other) {
    if (this === other) { return true }
    else {
      return (
          this.containerId === other.containerId &&
          this.start.equals(other.start) &&
          this.end.equals(other.end)
      )
    }
  };

  Range.prototype.isReverse = function isReverse () {
    return this.reverse
  };

  Range.prototype.toString = function toString () {
    var str = [this.start.toString(), '->', this.end.toString()];
    if (this.isReverse()) {
      str.push('[reverse]');
    }
    if (this.containerId) {
      str.push('[container='+this.containerId+']');
    }
    if (this.surfaceId) {
      str.push('[surface='+this.surfaceId+']');
    }
    return str.join('')
  };

  Range.prototype._isRange = true;

  var JSONConverter = function JSONConverter () {};

  JSONConverter.prototype.importDocument = function importDocument (doc, json) {
    if (!json.nodes) {
      throw new Error('Invalid JSON format.')
    }
    var schema = doc.getSchema();
    if (json.schema && schema.name !== json.schema.name) {
      throw new Error('Incompatible schema.')
    }

    var nodes = json.nodes;



    doc.import(function(tx) {
      forEach(nodes, function(node) {

        if (tx.get(node.id)) {
          tx.delete(node.id);
        }
        tx.create(node);
      });
    });
    return doc
  };

  JSONConverter.prototype.exportDocument = function exportDocument (doc) {
    var schema = doc.getSchema();
    var json = {
      schema: {
        name: schema.name
      },
      nodes: {}
    };
    forEach(doc.getNodes(), function(node) {
      if (node._isDocumentNode) {
        json.nodes[node.id] = node.toJSON();
      }
    });
    return json
  };

  var ParentNodeHook = function ParentNodeHook(doc) {
    this.doc = doc;
    this.table = {};
    doc.data.on('operation:applied', this._onOperationApplied, this);
  };

  ParentNodeHook.prototype._onOperationApplied = function _onOperationApplied (op) {
    var doc = this.doc;
    var table = this.table;
    var node = doc.get(op.path[0]);


    switch(op.type) {
      case 'create': {
        switch (node.type) {
          case 'list':
            _setParent(node, node.items);
            break
          case 'list-item': {
            _setRegisteredParent(node);
            break
          }
          case 'table':
            _setParent(node, node.cells);
            break
          case 'table-cell': {
            _setRegisteredParent(node);
            break
          }
          default:

        }
        break
      }
      case 'update': {


        var update = op.diff;
        switch(node.type) {
          case 'list':
            if (op.path[1] === 'items') {
              if (update.isInsert()) {
                _setParent(node, update.getValue());
              }
            }
            break
          case 'table':
            if (op.path[1] === 'cells') {
              if (update.isInsert()) {
                _setParent(node, update.getValue());
              }
            }
            break
          default:

        }
        break
      }
      case 'set': {
        switch(node.type) {
          case 'list':
            if (op.path[1] === 'items') {
              _setParent(node, op.getValue());
            }
            break
          case 'table':
            if (op.path[1] === 'cells') {
              _setParent(node, op.getValue());
            }
            break
          default:

        }
        break
      }
      default:

    }

    function _setParent(parent, ids) {
      if (ids) {
        if (isArray(ids)) {
          ids.forEach(_set);
        } else {
          _set(ids);
        }
      }
      function _set(id) {



        table[id] = parent;
        var child = doc.get(id);
        if (child) {
          child.parent = parent;
        }
      }
    }
    function _setRegisteredParent(child) {
      var parent = table[child.id];
      if (parent) {
        child.parent = parent;
      }
    }
  };

  ParentNodeHook.register = function(doc) {
    return new ParentNodeHook(doc)
  };

  var converter = new JSONConverter();



  var Document = (function (EventEmitter$$1) {
    function Document(schema) {
      EventEmitter$$1.call(this);


      if (arguments[0] === 'SKIP') { return }

      this.__id__ = uuid();

      if (!schema) {
        throw new Error('A document needs a schema for reflection.')
      }

      this.schema = schema;
      this.nodeFactory = new DocumentNodeFactory(this);
      this.data = new IncrementalData(schema, {
        nodeFactory: this.nodeFactory
      });


      this.addIndex('type', new PropertyIndex('type'));


      this.addIndex('annotations', new AnnotationIndex());




      this.addIndex('container-annotations', new ContainerAnnotationIndex());









      this.eventProxies = {
        'path': new PathEventProxy(this),
      };
      this.on('document:changed', this._updateEventProxies, this);


      ParentNodeHook.register(this);
    }

    if ( EventEmitter$$1 ) Document.__proto__ = EventEmitter$$1;
    Document.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    Document.prototype.constructor = Document;

    var prototypeAccessors = { id: {} };

    prototypeAccessors.id.get = function () {
      return this.__id__
    };


    Document.prototype.getSchema = function getSchema () {
      return this.schema
    };


    Document.prototype.contains = function contains (id) {
      return this.data.contains(id)
    };


    Document.prototype.get = function get (path, strict) {
      return this.data.get(path, strict)
    };


    Document.prototype.getNodes = function getNodes () {
      return this.data.getNodes()
    };


    Document.prototype.import = function import$1 (importer) {
      try {
        this.data._stopIndexing();
        importer(this);
        this.data._startIndexing();
      } finally {
        this.data.queue = [];
        this.data._startIndexing();
      }
    };


    Document.prototype.create = function create (nodeData) {
      if (!nodeData.id) {
        nodeData.id = uuid(nodeData.type);
      }
      var op = this._create(nodeData);
      var change = new DocumentChange([op], {}, {});
      change._extractInformation(this);
      this._notifyChangeListeners(change, { hidden: true });
      return this.data.get(nodeData.id)
    };


    Document.prototype.delete = function delete$1 (nodeId) {
      var node = this.get(nodeId);
      var op = this._delete(nodeId);
      var change = new DocumentChange([op], {}, {});
      change._extractInformation(this);
      this._notifyChangeListeners(change, { hidden: true });
      return node
    };


    Document.prototype.set = function set (path, value) {
      var oldValue = this.get(path);
      var op = this._set(path, value);
      var change = new DocumentChange([op], {}, {});
      change._extractInformation(this);
      this._notifyChangeListeners(change, { hidden: true });
      return oldValue
    };


    Document.prototype.update = function update (path, diff) {
      var op = this._update(path, diff);
      var change = new DocumentChange([op], {}, {});
      change._extractInformation(this);
      this._notifyChangeListeners(change, { hidden: true });
      return op
    };


    Document.prototype.addIndex = function addIndex (name, index) {
      return this.data.addIndex(name, index)
    };


    Document.prototype.getIndex = function getIndex (name) {
      return this.data.getIndex(name)
    };


    Document.prototype.createSelection = function createSelection (data) {
      var sel;
      if (isNil(data)) { return Selection.nullSelection }
      if (arguments.length !== 1 || !isPlainObject(data)) {
        sel = _createSelectionLegacy(this, arguments);
      } else {
        switch (data.type) {
          case 'property': {
            if (isNil(data.endOffset)) {
              data.endOffset = data.startOffset;
            }
            if (!data.hasOwnProperty('reverse')) {
              if (data.startOffset>data.endOffset) {
                var assign;
                (assign = [data.endOffset, data.startOffset], data.startOffset = assign[0], data.endOffset = assign[1]);
                data.reverse = !data.reverse;
              }
            }

            var text = this.get(data.path, 'strict');
            if (data.startOffset < 0 || data.startOffset > text.length) {
              throw new Error('Invalid startOffset: target property has length '+text.length+', given startOffset is ' + data.startOffset)
            }
            if (data.endOffset < 0 || data.endOffset > text.length) {
              throw new Error('Invalid startOffset: target property has length '+text.length+', given endOffset is ' + data.endOffset)
            }
            sel = new PropertySelection(data);
            break
          }
          case 'container': {
            var container = this.get(data.containerId, 'strict');
            if (!container) { throw new Error('Can not create ContainerSelection: container "'+data.containerId+'" does not exist.') }
            var start = this._normalizeCoor({ path: data.startPath, offset: data.startOffset});
            var end = this._normalizeCoor({ path: data.endPath, offset: data.endOffset});
            var startAddress = container.getAddress(start);
            var endAddress = container.getAddress(end);
            if (!startAddress) {
              throw new Error('Invalid arguments for ContainerSelection: ', start.toString())
            }
            if (!endAddress) {
              throw new Error('Invalid arguments for ContainerSelection: ', end.toString())
            }
            if (!data.hasOwnProperty('reverse')) {
              if (endAddress.isBefore(startAddress, 'strict')) {
                var assign$1;
                (assign$1 = [end, start], start = assign$1[0], end = assign$1[1]);
                data.reverse = true;
              }
            }
            sel = new ContainerSelection(container.id, start.path, start.offset, end.path, end.offset, data.reverse, data.surfaceId);
            break
          }
          case 'node': {
            sel = createNodeSelection({
              doc: this,
              nodeId: data.nodeId,
              mode: data.mode,
              containerId: data.containerId,
              reverse: data.reverse,
              surfaceId: data.surfaceId
            });
            break
          }
          case 'custom': {
            sel = CustomSelection.fromJSON(data);
            break
          }
          default:
            throw new Error('Illegal selection type', data)
        }
      }
      if (!sel.isNull()) {
        sel.attach(this);
      }
      return sel
    };

    Document.prototype.getEventProxy = function getEventProxy (name) {
      return this.eventProxies[name]
    };

    Document.prototype.newInstance = function newInstance () {
      var DocumentClass = this.constructor;
      return new DocumentClass(this.schema)
    };


    Document.prototype.createSnippet = function createSnippet () {
      var snippet = this.newInstance();
      var snippetContainer = snippet.create({
        type: 'container',
        id: Document.SNIPPET_ID
      });
      snippet.getContainer = function() {
        return snippetContainer
      };
      snippet.show = function() {
        snippetContainer.show.apply(snippetContainer, arguments);
      };
      return snippet
    };

    Document.prototype.fromSnapshot = function fromSnapshot (data) {
      var doc = this.newInstance();
      doc.loadSeed(data);
      return doc
    };

    Document.prototype.getDocumentMeta = function getDocumentMeta () {
      return this.get('document')
    };

    Document.prototype._apply = function _apply (documentChange) {
      forEach(documentChange.ops, function(op) {
        this.data.apply(op);
        this.emit('operation:applied', op);
      }.bind(this));

      documentChange._extractInformation(this);
    };

    Document.prototype._notifyChangeListeners = function _notifyChangeListeners (change, info) {
      info = info || {};
      this.emit('document:changed', change, info, this);
    };

    Document.prototype._updateEventProxies = function _updateEventProxies (change, info) {
      forEach(this.eventProxies, function(proxy) {
        proxy.onDocumentChanged(change, info, this);
      }.bind(this));
    };


    Document.prototype.loadSeed = function loadSeed (seed) {

      forEach(this.data.nodes, function(node) {
        this.delete(node.id);
      }.bind(this));

      forEach(seed.nodes, function(nodeData) {
        this.create(nodeData);
      }.bind(this));
    };


    Document.prototype.toJSON = function toJSON () {
      return converter.exportDocument(this)
    };

    Document.prototype.getTextForSelection = function getTextForSelection (sel) {
      console.warn('DEPRECATED: use documentHelpers.getTextForSelection() instead.');
      return documentHelpers.getTextForSelection(this, sel)
    };

    Document.prototype.setText = function setText (path, text, annotations) {
      var this$1 = this;


      var idx;
      var oldAnnos = this.getIndex('annotations').get(path);

      for (idx = 0; idx < oldAnnos.length; idx++) {
        this$1.delete(oldAnnos[idx].id);
      }
      this.set(path, text);
      for (idx = 0; idx < annotations.length; idx++) {
        this$1.create(annotations[idx]);
      }
    };

    Document.prototype.getAnnotations = function getAnnotations (path) {
      return this.getIndex('annotations').get(path)
    };

    Document.prototype._create = function _create (nodeData) {
      var op = this.data.create(nodeData);
      return op
    };

    Document.prototype._delete = function _delete (nodeId) {
      var op = this.data.delete(nodeId);
      return op
    };

    Document.prototype._update = function _update (path, diff) {
      var op = this.data.update(path, diff);
      return op
    };

    Document.prototype._set = function _set (path, value) {
      var op = this.data.set(path, value);
      return op
    };


    Document.prototype._createSelectionFromRange = function _createSelectionFromRange (range) {
      if (!range) { return Selection.nullSelection }
      var inOneNode = isEqual(range.start.path, range.end.path);
      if (inOneNode) {
        if (range.start.isNodeCoordinate()) {


          return new NodeSelection(range.containerId, range.start.getNodeId(), 'full', range.reverse, range.surfaceId)
        } else {
          return this.createSelection({
            type: 'property',
            path: range.start.path,
            startOffset: range.start.offset,
            endOffset: range.end.offset,
            reverse: range.reverse,
            containerId: range.containerId,
            surfaceId: range.surfaceId
          })
        }
      } else {
        return this.createSelection({
          type: 'container',
          startPath: range.start.path,
          startOffset: range.start.offset,
          endPath: range.end.path,
          endOffset: range.end.offset,
          reverse: range.reverse,
          containerId: range.containerId,
          surfaceId: range.surfaceId
        })
      }
    };

    Document.prototype._normalizeCoor = function _normalizeCoor (ref) {
      var path = ref.path;
      var offset = ref.offset;


      if (path.length === 1) {
        var node = this.get(path[0]).getRoot();
        if (node.isText()) {

          return new Coordinate(node.getTextPath(), offset === 0 ? 0 : node.getLength())
        } else if (node.isList()) {

          if (offset === 0) {
            var item = node.getItemAt(0);
            return new Coordinate(item.getTextPath(), 0)
          } else {
            var item$1 = this.get(last$2(node.items));
            return new Coordinate(item$1.getTextPath(), item$1.getLength())
          }
        }
      }
      return new Coordinate(path, offset)
    };

    Object.defineProperties( Document.prototype, prototypeAccessors );

    return Document;
  }(EventEmitter));

  Document.prototype._isDocument = true;



  Document.SNIPPET_ID = "snippet";

  Document.TEXT_SNIPPET_ID = "text-snippet";





  function _createSelectionLegacy(doc, args) {
    console.warn('DEPRECATED: use document.createSelection({ type: ... }) instead');

    if (args[0] instanceof Coordinate) {
      var coor = args[0];
      if (coor.isNodeCoordinate()) {
        return NodeSelection._createFromCoordinate(coor)
      } else {
        return doc.createSelection({
          type: 'property',
          path: coor.path,
          startOffset: coor.offset,
        })
      }
    }

    else if (args[0] instanceof Range) {
      return doc._createSelectionFromRange(args[0])
    }

    else if (args.length === 2 && isArray(args[0])) {
      return doc.createSelection({
        type: 'property',
        path: args[0],
        startOffset: args[1]
      })
    }

    else if (args.length === 3 && isArray(args[0])) {
      return doc.createSelection({
        type: 'property',
        path: args[0],
        startOffset: args[1],
        endOffset: args[2]
      })
    }

    else if (args.length === 5 && isString(args[0])) {
      return doc.createSelection({
        type: 'container',
        containerId: args[0],
        startPath: args[1],
        startOffset: args[2],
        endPath: args[3],
        endOffset: args[4]
      })
    } else {
      console.error('Illegal arguments for document.createSelection().', args);
      return doc.createSelection(null)
    }
  }

  var TransactionDocument = (function (Document$$1) {
    function TransactionDocument(document) {
      Document$$1.call(this, 'SKIP');

      this.schema = document.schema;
      this.nodeFactory = new DocumentNodeFactory(this);
      this.data = new IncrementalData(this.schema, {
        nodeFactory: this.nodeFactory
      });

      this.document = document;


      this.ops = [];
      this.lastOp = null;


      forEach(document.data.indexes, function(index, name) {
        this.data.addIndex(name, index.clone());
      }.bind(this));


      ParentNodeHook.register(this);

      this.loadSeed(document.toJSON());


      document.on('document:changed', this._onDocumentChanged, this);
    }

    if ( Document$$1 ) TransactionDocument.__proto__ = Document$$1;
    TransactionDocument.prototype = Object.create( Document$$1 && Document$$1.prototype );
    TransactionDocument.prototype.constructor = TransactionDocument;

    TransactionDocument.prototype.dispose = function dispose () {
      this.document.off(this);
    };

    TransactionDocument.prototype.create = function create (nodeData) {
      if (!nodeData.id) {
        nodeData.id = uuid(nodeData.type);
      }
      if (!nodeData.type) {
        throw new Error('No node type provided')
      }
      this.lastOp = this.data.create(nodeData);
      if (this.lastOp) {
        this.ops.push(this.lastOp);
        return this.data.get(nodeData.id)
      }
    };

    TransactionDocument.prototype.createDefaultTextNode = function createDefaultTextNode (text, dir) {
      return this.create({
        type: this.getSchema().getDefaultTextType(),
        content: text || '',
        direction: dir
      })
    };

    TransactionDocument.prototype.delete = function delete$1 (nodeId) {
      this.lastOp = this.data.delete(nodeId);
      if (this.lastOp) {
        this.ops.push(this.lastOp);
      }
    };

    TransactionDocument.prototype.set = function set (path, value) {
      this.lastOp = this.data.set(path, value);
      if (this.lastOp) {
        this.ops.push(this.lastOp);
      }
    };

    TransactionDocument.prototype.update = function update (path, diffOp) {
      var op = this.lastOp = this.data.update(path, diffOp);
      if (op) {
        this.ops.push(op);
        return op
      }
    };

    TransactionDocument.prototype._onDocumentChanged = function _onDocumentChanged (change) {


      this._apply(change);
    };

    TransactionDocument.prototype._apply = function _apply (documentChange) {
      documentChange.ops.forEach(function(op) {
        this.data.apply(op);
      }.bind(this));
    };

    TransactionDocument.prototype._reset = function _reset () {
      this.ops = [];
      this.lastOp = null;
    };

    TransactionDocument.prototype._rollback = function _rollback () {
      var this$1 = this;

      for (var i = this.ops.length - 1; i >= 0; i--) {
        this$1.data.apply(this$1.ops[i].invert());
      }
      this.ops = [];
      this.lastOp = null;
    };

    TransactionDocument.prototype.newInstance = function newInstance () {
      return this.document.newInstance()
    };

    return TransactionDocument;
  }(Document));

  TransactionDocument.prototype._isTransactionDocument = true;

  function copySelection(doc, selection) {
    if (!selection) { throw new Error("'selection' is mandatory.") }
    var copy = null;
    if (!selection.isNull() && !selection.isCollapsed()) {

      if (selection.isPropertySelection()) {
        copy = _copyPropertySelection(doc, selection);
      }
      else if (selection.isContainerSelection()) {
        copy = _copyContainerSelection(doc, selection);
      }
      else if (selection.isNodeSelection()) {
        copy = _copyNodeSelection(doc, selection);
      }
      else {
        console.error('Copy is not yet supported for selection type.');
      }
    }
    return copy
  }

  function _copyPropertySelection(doc, selection) {
    var path = selection.start.path;
    var offset = selection.start.offset;
    var endOffset = selection.end.offset;
    var text = doc.get(path);
    var snippet = doc.createSnippet();
    var containerNode = snippet.getContainer();
    snippet.create({
      type: doc.schema.getDefaultTextType(),
      id: Document.TEXT_SNIPPET_ID,
      content: text.substring(offset, endOffset)
    });
    containerNode.show(Document.TEXT_SNIPPET_ID);
    var annotations = doc.getIndex('annotations').get(path, offset, endOffset);
    forEach(annotations, function(anno) {
      var data = cloneDeep(anno.toJSON());
      var path = [Document.TEXT_SNIPPET_ID, 'content'];
      data.start = {
        path: path,
        offset: Math.max(offset, anno.start.offset)-offset
      };
      data.end = {
        path: path,
        offset: Math.min(endOffset, anno.end.offset)-offset
      };
      snippet.create(data);
    });
    return snippet
  }

  function _copyContainerSelection(tx, sel) {
    var snippet = tx.createSnippet();
    var container = snippet.getContainer();

    var nodeIds = sel.getNodeIds();
    var L = nodeIds.length;
    if (L === 0) { return snippet }

    var start = sel.start;
    var end = sel.end;

    var skippedFirst = false;
    var skippedLast = false;


    var created = {};
    for(var i = 0; i<L; i++) {
      var id = nodeIds[i];
      var node = tx.get(id);

      if (i===0 && isLast(tx, start)) {
        skippedFirst = true;
        continue
      }
      if (i===L-1 && isFirst(tx, end)) {
        skippedLast = true;
        continue
      }
      if (!created[id]) {
        documentHelpers.copyNode(node).forEach(function (nodeData) {
          var copy = snippet.create(nodeData);
          created[copy.id] = true;
        });
        container.show(id);
      }
    }
    if (!skippedFirst) {

      var startNode = snippet.get(start.getNodeId()).getRoot();
      if (startNode.isText()) {
        documentHelpers.deleteTextRange(snippet, null, start);
      } else if (startNode.isList()) {
        documentHelpers.deleteListRange(snippet, startNode, null, start);
      }
    }
    if (!skippedLast) {

      var endNode = snippet.get(end.getNodeId()).getRoot();
      if (endNode.isText()) {
        documentHelpers.deleteTextRange(snippet, end, null);
      } else if (endNode.isList()) {
        documentHelpers.deleteListRange(snippet, endNode, end, null);
      }
    }
    return snippet
  }

  function _copyNodeSelection(doc, selection) {
    var snippet = doc.createSnippet();
    var containerNode = snippet.getContainer();
    var nodeId = selection.getNodeId();
    var node = doc.get(nodeId);
    documentHelpers.copyNode(node).forEach(function (nodeData) {
      snippet.create(nodeData);
    });
    containerNode.show(node.id);
    return snippet
  }

  function paste(tx, args) {
    var sel = tx.selection;
    if (!sel || sel.isNull()) {
      throw new Error("Can not paste, without selection.")
    }
    args = args || {};
    args.text = args.text || '';
    var pasteDoc = args.doc;


    var inContainer = Boolean(sel.containerId);




    if (!pasteDoc && !inContainer) {
      tx.insertText(args.text);
      return
    }
    if (!pasteDoc) {
      pasteDoc = _convertPlainTextToDocument(tx, args);
    }
    if (!sel.isCollapsed()) {
      tx.deleteSelection();
    }
    var nodes = pasteDoc.get(Document.SNIPPET_ID).nodes;
    var schema = tx.getSchema();
    if (nodes.length > 0) {
      var first = pasteDoc.get(nodes[0]);
      if (schema.isInstanceOf(first.type, 'text')) {
        _pasteAnnotatedText(tx, pasteDoc);


        nodes.shift();
      }

      if (nodes.length > 0) {
        _pasteDocument(tx, pasteDoc);
      }
    }
    return args
  }


  function _convertPlainTextToDocument(tx, args) {
    var lines = args.text.split(/\s*\n\s*\n/);
    var pasteDoc = tx.getDocument().newInstance();
    var defaultTextType = pasteDoc.getSchema().getDefaultTextType();
    var container = pasteDoc.create({
      type: 'container',
      id: Document.SNIPPET_ID,
      nodes: []
    });
    var node;
    if (lines.length === 1) {
      node = pasteDoc.create({
        id: Document.TEXT_SNIPPET_ID,
        type: defaultTextType,
        content: lines[0]
      });
      container.show(node.id);
    } else {
      for (var i = 0; i < lines.length; i++) {
        node = pasteDoc.create({
          id: uuid(defaultTextType),
          type: defaultTextType,
          content: lines[i]
        });
        container.show(node.id);
      }
    }
    return pasteDoc
  }

  function _pasteAnnotatedText(tx, copy) {
    var sel = tx.selection;
    var nodes = copy.get(Document.SNIPPET_ID).nodes;
    var textPath = [nodes[0], 'content'];
    var text = copy.get(textPath);
    var annotations = copy.getIndex('annotations').get(textPath);

    var path = sel.start.path;
    var offset = sel.start.offset;
    tx.insertText(text);

    forEach(annotations, function(anno) {
      var data = anno.toJSON();
      data.start.path = path.slice(0);
      data.start.offset += offset;
      data.end.offset += offset;

      if (tx.get(data.id)) { data.id = uuid(data.type); }
      tx.create(data);
    });
  }

  function _pasteDocument(tx, pasteDoc) {
    var sel = tx.selection;
    var containerId = sel.containerId;
    var container = tx.get(containerId);
    var insertPos;
    if (sel.isPropertySelection()) {
      var startPath = sel.start.path;
      var nodeId = sel.start.getNodeId();
      var startPos = container.getPosition(nodeId, 'strict');
      var text = tx.get(startPath);


      if (text.length === 0) {
        insertPos = startPos;
        container.hide(nodeId);
        documentHelpers.deleteNode(tx, tx.get(nodeId));
      } else if ( text.length === sel.start.offset ) {
        insertPos = startPos + 1;
      } else {
        tx.break();
        insertPos = startPos + 1;
      }
    } else if (sel.isNodeSelection()) {
      var nodePos = container.getPosition(sel.getNodeId(), 'strict');
      if (sel.isBefore()) {
        insertPos = nodePos;
      } else if (sel.isAfter()) {
        insertPos = nodePos+1;
      } else {
        throw new Error('Illegal state: the selection should be collapsed.')
      }
    }

    var nodeIds = pasteDoc.get(Document.SNIPPET_ID).nodes;
    var insertedNodes = [];
    var visited = {};
    for (var i = 0; i < nodeIds.length; i++) {
      var node = pasteDoc.get(nodeIds[i]);





      var newId = _transferWithDisambiguatedIds(node.getDocument(), tx, node.id, visited);

      node = tx.get(newId);
      container.show(newId, insertPos++);
      insertedNodes.push(node);
    }

    if (insertedNodes.length > 0) {
      var lastNode = last$2(insertedNodes);
      setCursor(tx, lastNode, containerId, 'after');
    }
  }






  function _transferWithDisambiguatedIds(sourceDoc, targetDoc, id, visited) {
    if (visited[id]) { throw new Error('FIXME: dont call me twice') }
    var node = sourceDoc.get(id, 'strict');
    var oldId = node.id;
    var newId;
    if (targetDoc.contains(node.id)) {

      newId = uuid(node.type);
      node.id = newId;
    }
    visited[id] = node.id;
    var annotationIndex = sourceDoc.getIndex('annotations');
    var nodeSchema = node.getSchema();

    var annos = [];



    for (var key in nodeSchema) {
      if (key === 'id' || key === 'type' || !nodeSchema.hasOwnProperty(key)) { continue }
      var prop = nodeSchema[key];
      var name = prop.name;

      if ((prop.isReference() && prop.isOwned()) || (prop.type === 'file')) {


        var val = node[prop.name];
        if (prop.isArray()) {
          _transferArrayOfReferences(sourceDoc, targetDoc, val, visited);
        } else {
          var id$1 = val;
          if (!visited[id$1]) {
            node[name] = _transferWithDisambiguatedIds(sourceDoc, targetDoc, id$1, visited);
          }
        }
      }

      else if (prop.isText()) {
        var _annos = annotationIndex.get([node.id]);
        for (var i = 0; i < _annos.length; i++) {
          var anno = _annos[i];
          if (anno.start.path[0] === oldId) {
            anno.start.path[0] = newId;
          }
          if (anno.end.path[0] === oldId) {
            anno.end.path[0] = newId;
          }
          annos.push(anno);
        }
      }
    }
    targetDoc.create(node);
    for (var i$1 = 0; i$1 < annos.length; i$1++) {
      _transferWithDisambiguatedIds(sourceDoc, targetDoc, annos[i$1].id, visited);
    }
    return node.id
  }

  function _transferArrayOfReferences(sourceDoc, targetDoc, arr, visited) {
    for (var i = 0; i < arr.length; i++) {
      var val = arr[i];

      if (isArray(val)) {
        _transferArrayOfReferences(sourceDoc, targetDoc, val, visited);
      } else {
        var id = val;
        if (id && !visited[id]) {
          arr[i] = _transferWithDisambiguatedIds(sourceDoc, targetDoc, id, visited);
        }
      }
    }
  }

  var Editing = function Editing () {};

  Editing.prototype.annotate = function annotate (tx, annotation) {
    var sel = tx.selection;
    if (!sel || sel.isNull() || sel.isCollapsed()) {
      throw new Error('Non-collapsed selection required for tx.annotate()')
    }
    if (sel.isCollapsed()) { return }
    var schema = tx.getSchema();
    var AnnotationClass = schema.getNodeClass(annotation.type);
    if (!AnnotationClass) { throw new Error('Unknown annotation type', annotation) }
    if (sel.isNodeSelection()) {
      throw new Error('Node selections are not supported by tx.annotate()')
    } else if (sel.isCustomSelection()) {
      throw new Error('Custom selections are not supported by tx.annotate()')
    }
    var start = sel.start;
    var end = sel.end;
    var containerId = sel.containerId;
    var nodeData = { start: start, end: end, containerId: containerId };
    if (sel.isPropertySelection()) {
      if (!AnnotationClass.prototype._isAnnotation) {
        throw new Error('Annotation can not be created for a selection.')
      }
    } else if (sel.isContainerSelection()) {
      if (AnnotationClass.prototype._isPropertyAnnotation) {
        console.warn('NOT SUPPORTED YET: creating property annotations for a non collapsed container selection.');
      }
    } else {
      throw new Error('Unsupported selection.')
    }
    Object.assign(nodeData, annotation);
    return tx.create(nodeData)
  };

  Editing.prototype.break = function break$1 (tx) {
    var sel = tx.selection;
    if (sel.isNodeSelection()) {
      var containerId = sel.containerId;
      var container = tx.get(containerId);
      var nodeId = sel.getNodeId();
      var nodePos = container.getPosition(nodeId, 'strict');
      var textNode = tx.createDefaultTextNode();
      if (sel.isBefore()) {
        tx.update(container.getContentPath(), { type: 'insert', pos: nodePos, value: textNode.id });

      } else {
        tx.update(container.getContentPath(), { type: 'insert', pos: nodePos+1, value: textNode.id });
        setCursor(tx, textNode, containerId, 'before');
      }
    }
    else if (sel.isCustomSelection()) {

    }
    else if (sel.isCollapsed() || sel.isPropertySelection()) {
      var containerId$1 = sel.containerId;
      if (!sel.isCollapsed()) {

        this.deletePropertySelection(tx, sel);
        tx.setSelection(sel.collapse('left'));
      }

      if (containerId$1) {
        var container$1 = tx.get(containerId$1);
        var nodeId$1 = sel.start.path[0];
        var node = tx.get(nodeId$1);
        this._breakNode(tx, node, sel.start, container$1);
      } else {
        this.insertText(tx, '\n');
      }
    }
    else if (sel.isContainerSelection()) {
      if (sel.start.hasSamePath(sel.end)) {
        this.deleteContainerSelection(tx, sel);
        this.break(tx);
      } else {
        var start = sel.start;
        var containerId$2 = sel.containerId;
        var container$2 = tx.get(containerId$2);
        var startNodeId = start.path[0];
        var nodePos$1 = container$2.getPosition(startNodeId, 'strict');
        this.deleteContainerSelection(tx, sel);
        if (nodePos$1 < container$2.length-1) {
          setCursor(tx, container$2.getNodeAt(nodePos$1+1), containerId$2, 'before');
        } else {
          tx.setSelection(sel.collapse('left'));
          this.break(tx);
        }
      }
    }
  };

  Editing.prototype.delete = function delete$1 (tx, direction) {
    var sel = tx.selection;



    if (sel.isNodeSelection()) {
      this.deleteNodeSelection(tx, sel, direction);
    }

    else if (sel.isCustomSelection()) {}


    else if (sel.isCollapsed()) {



      var path = sel.start.path;
      var node = tx.get(path[0]);
      var text = tx.get(path);
      var offset = sel.start.offset;
      var needsMerge = (sel.containerId && (
          (offset === 0 && direction === 'left') ||
          (offset === text.length && direction === 'right')
      ));
      if (needsMerge) {



        var root = node.getRoot();
        if (root.isList() && offset === 0 && direction === 'left') {
          return this.toggleList(tx)
        } else {
          var container = tx.get(sel.containerId);
          this._merge(tx, root, sel.start, direction, container);
        }
      } else {
        var startOffset = (direction === 'left') ? offset-1 : offset;
        var endOffset = startOffset+1;
        var start = { path: path, offset: startOffset };
        var end = { path: path, offset: endOffset };
        documentHelpers.deleteTextRange(tx, start, end);
        tx.setSelection({
          type: 'property',
          path: path,
          startOffset: startOffset,
          containerId: sel.containerId
        });
      }
    }

    else if (sel.isPropertySelection()) {
      documentHelpers.deleteTextRange(tx, sel.start, sel.end);
      tx.setSelection(sel.collapse('left'));
    }

    else if (sel.isContainerSelection()) {
      this.deleteContainerSelection(tx, sel);
    }
    else {
      console.warn('Unsupported case: tx.delete(%)', direction, sel);
    }
  };

  Editing.prototype.deleteNodeSelection = function deleteNodeSelection (tx, sel, direction) {
    var nodeId = sel.getNodeId();
    var container = tx.get(sel.containerId);
    var nodePos = container.getPosition(nodeId, 'strict');
    if (sel.isFull() ||
        sel.isBefore() && direction === 'right' ||
        sel.isAfter() && direction === 'left' ) {

      var contentPath = container.getContentPath();
      tx.update(contentPath, { type: 'delete', pos: nodePos });
      tx.delete(nodeId);
      var newNode = tx.createDefaultTextNode();
      tx.update(contentPath, { type: 'insert', pos: nodePos, value: newNode.id });
      tx.setSelection({
        type: 'property',
        path: newNode.getTextPath(),
        startOffset: 0,
        containerId: container.id,
      });
    } else {
      if (sel.isBefore() && direction === 'left') {
        if (nodePos > 0) {
          var previous = container.getNodeAt(nodePos-1);
          if (previous.isText()) {
            tx.setSelection({
              type: 'property',
              path: previous.getTextPath(),
              startOffset: previous.getLength()
            });
            this.delete(tx, direction);
          } else {
            tx.setSelection({
              type: 'node',
              nodeId: previous.id,
              containerId: container.id
            });
          }
        } else {

        }
      } else if (sel.isAfter() && direction === 'right') {
        if (nodePos < container.getLength()-1) {
          var next = container.getNodeAt(nodePos+1);
          if (next.isText()) {
            tx.setSelection({
              type: 'property',
              path: next.getTextPath(),
              startOffset: 0
            });
            this.delete(tx, direction);
          } else {
            tx.setSelection({
              type: 'node',
              nodeId: next.id,
              containerId: container.id
            });
          }
        } else {

        }
      } else {
        console.warn('Unsupported case: delete(%s)', direction, sel);
      }
    }
  };

  Editing.prototype.deletePropertySelection = function deletePropertySelection (tx, sel) {
    var path = sel.start.path;
    var start = sel.start.offset;
    var end = sel.end.offset;
    tx.update(path, { type: 'delete', start: start, end: end });
    annotationHelpers.deletedText(tx, path, start, end);
  };


  Editing.prototype.deleteContainerSelection = function deleteContainerSelection (tx, sel) {
    var containerId = sel.containerId;
    var container = tx.get(containerId);
    var start = sel.start;
    var end = sel.end;
    var startId = start.getNodeId();
    var endId = end.getNodeId();
    var startPos = container.getPosition(startId, 'strict');
    var endPos = container.getPosition(endId, 'strict');


    if (startPos === endPos) {

      var node = tx.get(startId).getRoot();
      if (node.isText()) {
        documentHelpers.deleteTextRange(tx, start, end);
      } else if (node.isList()) {
        documentHelpers.deleteListRange(tx, node, start, end);
      } else {
        throw new Error('Not supported yet.')
      }
      tx.setSelection(sel.collapse('left'));
      return
    }


    if (startPos > endPos) {
      var assign;
      (assign = [end, start], start = assign[0], end = assign[1]);
      var assign$1;
      (assign$1 = [endPos, startPos], startPos = assign$1[0], endPos = assign$1[1]);
      var assign$2;
      (assign$2 = [endId, startId], startId = assign$2[0], endId = assign$2[1]);
    }



    var firstNode = tx.get(start.getNodeId());
    var lastNode = tx.get(end.getNodeId());
    var firstEntirelySelected = isEntirelySelected(tx, firstNode, start, null);
    var lastEntirelySelected = isEntirelySelected(tx, lastNode, null, end);


    if (lastEntirelySelected) {
      tx.update([container.id, 'nodes'], { type: 'delete', pos: endPos });
      documentHelpers.deleteNode(tx, lastNode);
    } else {

      var node$1 = lastNode.getRoot();
      if (node$1.isText()) {
        documentHelpers.deleteTextRange(tx, null, end);
      } else if (node$1.isList()) {
        documentHelpers.deleteListRange(tx, node$1, null, end);
      } else {

      }
    }


    for (var i = endPos-1; i > startPos; i--) {
      var nodeId = container.nodes[i];
      tx.update([container.id, 'nodes'], { type: 'delete', pos: i });
      documentHelpers.deleteNode(tx, tx.get(nodeId));
    }


    if (firstEntirelySelected) {
      tx.update([container.id, 'nodes'], { type: 'delete', pos: startPos });
      documentHelpers.deleteNode(tx, firstNode);
    } else {

      var node$2 = firstNode.getRoot();
      if (node$2.isText()) {
        documentHelpers.deleteTextRange(tx, start, null);
      } else if (node$2.isList()) {
        documentHelpers.deleteListRange(tx, node$2, start, null);
      } else {

      }
    }


    if (firstEntirelySelected && lastEntirelySelected) {

      var textNode = tx.createDefaultTextNode();
      tx.update([container.id, 'nodes'], { type: 'insert', pos: startPos, value: textNode.id });
      tx.setSelection({
        type: 'property',
        path: textNode.getTextPath(),
        startOffset: 0,
        containerId: containerId
      });
    } else if (!firstEntirelySelected && !lastEntirelySelected) {
      this._merge(tx, firstNode, sel.start, 'right', container);
      tx.setSelection(sel.collapse('left'));
    } else if (firstEntirelySelected) {
      setCursor(tx, lastNode, container.id, 'before');
    } else {
      setCursor(tx, firstNode, container.id, 'after');
    }
  };


  Editing.prototype.deleteNode = function deleteNode (tx, nodeId, containerId) {
    if (!nodeId) { throw new Error('Parameter `nodeId` is mandatory.') }
    var node = tx.get(nodeId);
    if (!node) { throw new Error('Node does not exist') }
    if (containerId) {
      var container = tx.get(containerId);
      container.hide(nodeId);











































    }
    documentHelpers.deleteNode(tx, node);
  };

  Editing.prototype.insertInlineNode = function insertInlineNode (tx, nodeData) {
    var sel = tx.selection;
    if (!sel.isPropertySelection()) { throw new Error('insertInlineNode requires a PropertySelection') }
    var text = "\uFEFF";
    this.insertText(tx, text);
    sel = tx.selection;
    var endOffset = tx.selection.end.offset;
    var startOffset = endOffset - text.length;
    nodeData = Object.assign({}, nodeData, {
      start: {
        path: sel.path,
        offset: startOffset
      },
      end: {
        path: sel.path,
        offset: endOffset
      }
    });
    return tx.create(nodeData)
  };

  Editing.prototype.insertBlockNode = function insertBlockNode (tx, nodeData) {
    var sel = tx.selection;
    if (!sel || sel.isNull()) { throw new Error('Selection is null.') }

    var blockNode;
    if (!nodeData._isNode || !tx.get(nodeData.id)) {
      blockNode = tx.create(nodeData);
    } else {
      blockNode = tx.get(nodeData.id);
    }
    if (sel.isNodeSelection()) {
      var containerId = sel.containerId;
      var container = tx.get(containerId);
      var nodeId = sel.getNodeId();
      var nodePos = container.getPosition(nodeId, 'strict');

      if (sel.isBefore()) {
        tx.update(container.getContentPath(), { type: 'insert', pos: nodePos, value: blockNode.id });
      }

      else if (sel.isAfter()) {
        tx.update(container.getContentPath(), { type: 'insert', pos: nodePos+1, value: blockNode.id });
        tx.setSelection({
          type: 'node',
          containerId: containerId,
          nodeId: blockNode.id,
          mode: 'after'
        });
      } else {
        tx.update(container.getContentPath(), { type: 'delete', pos: nodePos });
        tx.delete(sel.getNodeId());
        tx.update([container.id, 'nodes'], { type: 'insert', pos: nodePos, value: blockNode.id });
        tx.setSelection({
          type: 'node',
          containerId: containerId,
          nodeId: blockNode.id,
          mode: 'after'
        });
      }
    } else if (sel.isPropertySelection()) {
      if (!sel.containerId) { throw new Error('insertBlockNode can only be used within a container.') }
      var container$1 = tx.get(sel.containerId);
      if (!sel.isCollapsed()) {
        this.deletePropertySelection(tx);
        tx.setSelection(sel.collapse('left'));
      }
      var node = tx.get(sel.path[0]);
      if (!node) { throw new Error('Invalid selection.') }
      var nodePos$1 = container$1.getPosition(node.id, 'strict');
      if (node.isText()) {
        var text = node.getText();

        if (text.length === 0) {
          tx.update(container$1.getContentPath(), { type: 'delete', pos: nodePos$1 });
          tx.delete(node.id);
          tx.update([container$1.id, 'nodes'], { type: 'insert', pos: nodePos$1, value: blockNode.id });
          setCursor(tx, blockNode, container$1.id, 'after');
        }

        else if (sel.start.offset === 0) {
          tx.update(container$1.getContentPath(), { type: 'insert', pos: nodePos$1, value: blockNode.id });
        }

        else if (sel.start.offset === text.length) {
          tx.update(container$1.getContentPath(), { type: 'insert', pos: nodePos$1+1, value: blockNode.id });
          setCursor(tx, blockNode, container$1.id, 'before');
        }

        else {
          this.break(tx);
          tx.update(container$1.getContentPath(), { type: 'insert', pos: nodePos$1+1, value: blockNode.id });
          setCursor(tx, blockNode, container$1.id, 'after');
        }
      } else {

        console.error('Not yet implemented: insertBlockNode() on a custom node');
      }
    } else if (sel.isContainerSelection()) {
      if (sel.isCollapsed()) {
        var start = sel.start;
        if (start.isPropertyCoordinate()) {
          tx.setSelection({
            type: 'property',
            path: start.path,
            startOffset: start.offset,
            containerId: sel.containerId,
          });
        } else if (start.isNodeCoordinate()) {
          tx.setSelection({
            type: 'node',
            containerId: sel.containerId,
            nodeId: start.path[0],
            mode: start.offset === 0 ? 'before' : 'after',
          });
        } else {
          throw new Error('Unsupported selection for insertBlockNode')
        }
        return this.insertBlockNode(tx, blockNode)
      }
    }
  };

  Editing.prototype.insertText = function insertText (tx, text) {
    var sel = tx.selection;


    if (sel.isNodeSelection()) {
      var containerId = sel.containerId;
      var container = tx.get(containerId);
      var nodeId = sel.getNodeId();
      var nodePos = container.getPosition(nodeId, 'strict');
      var textNode = tx.createDefaultTextNode(text);
      if (sel.isBefore()) {
        container.show(textNode, nodePos);
      } else if (sel.isAfter()) {
        container.show(textNode, nodePos+1);
      } else {
        container.hide(nodeId);
        tx.delete(nodeId);
        container.show(textNode, nodePos);
      }
      setCursor(tx, textNode, sel.containerId, 'after');
    } else if (sel.isCustomSelection()) {

    } else if (sel.isCollapsed() || sel.isPropertySelection()) {

      this._insertText(tx, sel, text);

    } else if (sel.isContainerSelection()) {
      this.deleteContainerSelection(tx, sel);
      this.insertText(tx, text);
    }
  };

  Editing.prototype.paste = function paste$1 (tx, content) {
    if (!content) { return }
    if (isString(content)) {
      paste(tx, {text: content});
    } else if (content._isDocument) {
      paste(tx, {doc: content});
    } else {
      throw new Error('Illegal content for paste.')
    }
  };


  Editing.prototype.switchTextType = function switchTextType (tx, data) {
    var sel = tx.selection;
    if (!sel.isPropertySelection()) {
      throw new Error("Selection must be a PropertySelection.")
    }
    var containerId = sel.containerId;
    if (!containerId) {
      throw new Error("Selection must be within a container.")
    }
    var path = sel.path;
    var nodeId = path[0];
    var node = tx.get(nodeId);
    if (!(node.isInstanceOf('text'))) {
      throw new Error('Trying to use switchTextType on a non text node. Skipping.')
    }

    var newNode = Object.assign({
      id: uuid(data.type),
      type: data.type,
      content: node.content,
      direction: node.direction
    }, data);
    var newPath = [newNode.id, 'content'];
    newNode = tx.create(newNode);
    annotationHelpers.transferAnnotations(tx, path, 0, newPath, 0);


    var container = tx.get(sel.containerId);
    var pos = container.getPosition(nodeId, 'strict');
    container.hide(nodeId);
    container.show(newNode.id, pos);


    this.deleteNode(tx, node.id, containerId);
    tx.setSelection({
      type: 'property',
      path: newPath,
      startOffset: sel.start.offset,
      endOffset: sel.end.offset,
      containerId: containerId
    });

    return newNode
  };

  Editing.prototype.toggleList = function toggleList (tx, params) {
    var sel = tx.selection;
    var container = tx.get(sel.containerId);

    if (!container) { return }
    if (sel.isPropertySelection()) {
      var nodeId = sel.start.path[0];

      var node = tx.get(nodeId).getRoot();
      var nodePos = container.getPosition(node.id, 'strict');
      if (node.isText()) {
        tx.update([container.id, 'nodes'], { type: 'delete', pos: nodePos });

        var newItem = tx.create({
          type: 'list-item',
          content: node.getText(),
        });
        annotationHelpers.transferAnnotations(tx, node.getTextPath(), 0, newItem.getTextPath(), 0);
        var newList = tx.create(Object.assign({
          type: 'list',
          items: [newItem.id]
        }, params));
        tx.delete(node.id);
        tx.update([container.id, 'nodes'], { type: 'insert', pos: nodePos, value: newList.id });
        tx.setSelection({
          type: 'property',
          path: newItem.getTextPath(),
          startOffset: sel.start.offset,
          containerId: sel.containerId
        });
      } else if (node.isList()) {
        var itemId = sel.start.path[0];
        var itemPos = node.getItemPosition(itemId);
        var item = node.getItemAt(itemPos);
        var newTextNode = tx.createDefaultTextNode(item.getText());
        annotationHelpers.transferAnnotations(tx, item.getTextPath(), 0, newTextNode.getTextPath(), 0);

        node.removeItemAt(itemPos);
        if (node.getLength() === 0) {
          tx.update([container.id, 'nodes'], { type: 'delete', pos: nodePos });
          tx.delete(node.id);
          tx.update([container.id, 'nodes'], { type: 'insert', pos: nodePos, value: newTextNode.id });
        } else if (itemPos === 0) {
          tx.update([container.id, 'nodes'], { type: 'insert', pos: nodePos, value: newTextNode.id });
        } else if (node.getLength() <= itemPos){
          tx.update([container.id, 'nodes'], { type: 'insert', pos: nodePos+1, value: newTextNode.id });
        } else {

          var tail = [];
          var items = node.items.slice();
          var L = items.length;
          for (var i = L-1; i >= itemPos; i--) {
            tail.unshift(items[i]);
            node.removeItemAt(i);
          }
          var newList$1 = tx.create({
            type: 'list',
            items: tail,
            ordered: node.ordered
          });
          tx.update([container.id, 'nodes'], { type: 'insert', pos: nodePos+1, value: newTextNode.id });
          tx.update([container.id, 'nodes'], { type: 'insert', pos: nodePos+2, value: newList$1.id });
        }
        tx.setSelection({
          type: 'property',
          path: newTextNode.getTextPath(),
          startOffset: sel.start.offset,
          containerId: sel.containerId
        });
      }
    } else if (sel.isContainerSelection()) {
      console.error('TODO: support toggleList with ContainerSelection');
    }
  };

  Editing.prototype.indent = function indent (tx) {
    var sel = tx.selection;
    if (sel.isPropertySelection()) {
      var nodeId = sel.start.getNodeId();

      var node = tx.get(nodeId).getRoot();
      if (node.isList()) {
        var itemId = sel.start.path[0];
        var item = tx.get(itemId);

        if (item && item.level<3) {
          tx.set([itemId, 'level'], item.level+1);
        }
      }
    } else if (sel.isContainerSelection()) {

    }
  };

  Editing.prototype.dedent = function dedent (tx) {
    var sel = tx.selection;
    if (sel.isPropertySelection()) {
      var nodeId = sel.start.getNodeId();

      var node = tx.get(nodeId).getRoot();
      if (node.isList()) {
        var itemId = sel.start.path[0];
        var item = tx.get(itemId);
        if (item && item.level>1) {
          tx.set([itemId, 'level'], item.level-1);
        }
      }
    } else if (sel.isContainerSelection()) {

    }
  };


  Editing.prototype._insertText = function _insertText (tx, sel, text) {
    var start = sel.start;
    var end = sel.end;
    if (!isArrayEqual(start.path, end.path)) {
      throw new Error('Unsupported state: range should be on one property')
    }
    var path = start.path;
    var startOffset = start.offset;
    var endOffset = end.offset;
    var typeover = !sel.isCollapsed();
    var L = text.length;

    if (typeover) {
      tx.update(path, { type: 'delete', start: startOffset, end: endOffset });
    }

    tx.update(path, { type: 'insert', start: startOffset, text: text });

    var annos = tx.getAnnotations(path);
    annos.forEach(function(anno) {
      var annoStart = anno.start.offset;
      var annoEnd = anno.end.offset;

      if (annoEnd<startOffset) {
        return
      }

      else if (annoStart>=endOffset) {
        tx.update([anno.id, 'start'], { type: 'shift', value: startOffset-endOffset+L });
        tx.update([anno.id, 'end'], { type: 'shift', value: startOffset-endOffset+L });
      }




      else if (
          (annoStart>=startOffset && annoEnd<endOffset) ||
          (anno._isInlineNode && annoStart>=startOffset && annoEnd<=endOffset)
      ) {
        tx.delete(anno.id);
      }

      else if (annoStart>=startOffset && annoEnd>=endOffset) {

        if (annoStart>startOffset || !typeover) {
          tx.update([anno.id, 'start'], { type: 'shift', value: startOffset-annoStart+L });
        }
        tx.update([anno.id, 'end'], { type: 'shift', value: startOffset-endOffset+L });
      }

      else if (annoStart<startOffset && annoEnd<endOffset) {

        tx.update([anno.id, 'end'], { type: 'shift', value: startOffset-annoEnd+L });
      }

      else if (annoStart<startOffset && annoEnd>=endOffset) {
        if (anno._isInlineNode) {

        } else {
          tx.update([anno.id, 'end'], { type: 'shift', value: startOffset-endOffset+L });
        }
      }
      else {
        console.warn('TODO: handle annotation update case.');
      }
    });
    var offset = startOffset + text.length;
    tx.setSelection({
      type: 'property',
      path: start.path,
      startOffset: offset,
      containerId: sel.containerId,
      surfaceId: sel.surfaceId
    });
  };

  Editing.prototype._breakNode = function _breakNode (tx, node, coor, container) {

    node = node.getRoot();
    if (node.isText()) {
      this._breakTextNode(tx, node, coor, container);
    } else if (node.isList()) {
      this._breakListNode(tx, node, coor, container);
    } else {
      throw new Error('Not supported')
    }
  };

  Editing.prototype._breakTextNode = function _breakTextNode (tx, node, coor, container) {
    var path = coor.path;
    var offset = coor.offset;
    var nodePos = container.getPosition(node.id, 'strict');
    var text = node.getText();



    if (offset === 0) {
      var newNode = tx.create({
        type: node.type,
        content: ""
      });

      container.show(newNode.id, nodePos);
      tx.setSelection({
        type: 'property',
        path: path,
        startOffset: 0,
        containerId: container.id
      });
    }

    else {
      var newNode$1 = node.toJSON();
      delete newNode$1.id;
      newNode$1.content = text.substring(offset);

      if (offset === text.length) {
        newNode$1.type = tx.getSchema().getDefaultTextType();
      }
      newNode$1 = tx.create(newNode$1);

      if (offset < text.length) {

        annotationHelpers.transferAnnotations(tx, path, offset, newNode$1.getTextPath(), 0);

        tx.update(path, { type: 'delete', start: offset, end: text.length });
      }

      container.show(newNode$1.id, nodePos+1);

      tx.setSelection({
        type: 'property',
        path: newNode$1.getTextPath(),
        startOffset: 0,
        containerId: container.id
      });
    }
  };

  Editing.prototype._breakListNode = function _breakListNode (tx, node, coor, container) {
    var path = coor.path;
    var offset = coor.offset;
    var listItem = tx.get(path[0]);

    var L = node.length;
    var itemPos = node.getItemPosition(listItem.id);
    var text = listItem.getText();
    var newItem = listItem.toJSON();
    delete newItem.id;
    if (offset === 0) {

      if (!text) {


        var nodePos = container.getPosition(node.id, 'strict');
        var newTextNode = tx.createDefaultTextNode();

        if (L < 2) {
          container.hide(node.id);
          tx.delete(node.id);
          container.show(newTextNode.id, nodePos);
        }

        else if (itemPos === 0) {
          node.remove(listItem.id);
          tx.delete(listItem.id);
          container.show(newTextNode.id, nodePos);
        }

        else if (itemPos >= L-1) {
          node.remove(listItem.id);
          tx.delete(listItem.id);
          container.show(newTextNode.id, nodePos+1);
        }

        else {
          var tail = [];
          var items = node.items.slice();
          for (var i = L-1; i > itemPos; i--) {
            tail.unshift(items[i]);
            node.remove(items[i]);
          }
          node.remove(items[itemPos]);
          var newList = tx.create({
            type: 'list',
            items: tail,
            ordered: node.ordered
          });
          container.show(newTextNode.id, nodePos+1);
          container.show(newList.id, nodePos+2);
        }
        tx.setSelection({
          type: 'property',
          path: newTextNode.getTextPath(),
          startOffset: 0
        });
      }

      else {
        newItem.content = "";
        newItem = tx.create(newItem);
        node.insertItemAt(itemPos, newItem.id);
        tx.setSelection({
          type: 'property',
          path: listItem.getTextPath(),
          startOffset: 0
        });
      }
    }

    else {
      newItem.content = text.substring(offset);
      newItem = tx.create(newItem);

      if (offset < text.length) {

        annotationHelpers.transferAnnotations(tx, path, offset, [newItem.id,'content'], 0);

        tx.update(path, { type: 'delete', start: offset, end: text.length });
      }
      node.insertItemAt(itemPos+1, newItem.id);
      tx.setSelection({
        type: 'property',
        path: newItem.getTextPath(),
        startOffset: 0
      });
    }
  };

  Editing.prototype._merge = function _merge (tx, node, coor, direction, container) {


    if (node.isList()) {
      var list = node;
      var itemId = coor.path[0];
      var itemPos = list.getItemPosition(itemId);
      var withinListNode = (
          (direction === 'left' && itemPos > 0) ||
          (direction === 'right' && itemPos<list.items.length-1)
      );
      if (withinListNode) {
        itemPos = (direction === 'left') ? itemPos-1 : itemPos;
        var target = list.getItemAt(itemPos);
        var targetLength = target.getLength();
        documentHelpers.mergeListItems(tx, list.id, itemPos);
        tx.setSelection({
          type: 'property',
          path: target.getTextPath(),
          startOffset: targetLength,
          containerId: container.id
        });
        return
      }
    }

    var nodePos = container.getPosition(node, 'strict');
    if (direction === 'left' && nodePos > 0) {
      this._mergeNodes(tx, container, nodePos-1, direction);
    } else if (direction === 'right' && nodePos<container.getLength()-1) {
      this._mergeNodes(tx, container, nodePos, direction);
    }
  };

  Editing.prototype._mergeNodes = function _mergeNodes (tx, container, pos, direction) {
    var first = container.getChildAt(pos);
    var second = container.getChildAt(pos+1);
    if (first.isText()) {

      if (first.isEmpty()) {
        container.hide(first.id);
        tx.delete(first.id);


        setCursor(tx, second, container.id, 'before');
        return
      }
      var target = first;
      var targetPath = target.getTextPath();
      var targetLength = target.getLength();
      if (second.isText()) {
        var source = second;
        var sourcePath = source.getTextPath();
        container.hide(source.id);

        tx.update(targetPath, { type: 'insert', start: targetLength, text: source.getText() });

        annotationHelpers.transferAnnotations(tx, sourcePath, 0, targetPath, targetLength);
        tx.delete(source.id);
        tx.setSelection({
          type: 'property',
          path: targetPath,
          startOffset: targetLength,
          containerId: container.id
        });
      } else if (second.isList()) {
        var list = second;
        var source$1 = list.getFirstItem();
        var sourcePath$1 = source$1.getTextPath();

        list.removeItemAt(0);

        tx.update(targetPath, { type: 'insert', start: targetLength, text: source$1.getText() });

        annotationHelpers.transferAnnotations(tx, sourcePath$1, 0, targetPath, targetLength);

        tx.delete(source$1.id);
        if (list.getLength() === 0) {
          container.hide(list.id);
          tx.delete(list.id);
        }
        tx.setSelection({
          type: 'property',
          path: targetPath,
          startOffset: targetLength,
          containerId: container.id
        });
      } else {
        selectNode(tx, direction === 'left' ? first.id : second.id, container.id);
      }
    } else if (first.isList()) {
      if (second.isText()) {
        var source$2 = second;
        var sourcePath$2 = source$2.getTextPath();
        var target$1 = first.getLastItem();
        var targetPath$1 = target$1.getTextPath();
        var targetLength$1 = target$1.getLength();

        container.hide(source$2.id);

        tx.update(targetPath$1, { type: 'insert', start: targetLength$1, text: source$2.getText() });

        annotationHelpers.transferAnnotations(tx, sourcePath$2, 0, targetPath$1, targetLength$1);
        tx.delete(source$2.id);
        tx.setSelection({
          type: 'property',
          path: target$1.getTextPath(),
          startOffset: targetLength$1,
          containerId: container.id
        });
      } else if (second.isList()) {
        container.hide(second.id);
        var firstItems = first.items.slice();
        var secondItems = second.items.slice();
        for (var i=0; i<secondItems.length;i++) {
          second.removeItemAt(0);
          first.appendItem(secondItems[i]);
        }
        tx.delete(second.id);
        if (direction === 'left') {
          tx.setSelection({
            type: 'property',
            path: tx.get(secondItems[0]).getTextPath(),
            startOffset: 0,
            containerId: container.id
          });
        } else {
          var item = tx.get(last$2(firstItems));
          tx.setSelection({
            type: 'property',
            path: item.getTextPath(),
            startOffset: item.getLength(),
            containerId: container.id
          });
        }
      } else {
        selectNode(tx, direction === 'left' ? first.id : second.id, container.id);
      }
    } else {
      if (second.isText() && second.isEmpty()) {
        container.hide(second.id);
        tx.delete(second.id);
        setCursor(tx, first, container.id, 'after');
      } else {
        selectNode(tx, direction === 'left' ? first.id : second.id, container.id);
      }
    }
  };

  var EditingInterface = function EditingInterface(doc) {
    this._document = doc;
    this._selection = null;

    this._impl = new Editing();
    this._direction = null;
  };

  var prototypeAccessors$2 = { selection: {},textDirection: {} };

  EditingInterface.prototype.getDocument = function getDocument () {
    return this._document
  };



  EditingInterface.prototype.get = function get () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return (ref = this._document).get.apply(ref, args)
    var ref;
  };

  EditingInterface.prototype.contains = function contains (id) {
    return this._document.contains(id)
  };

  EditingInterface.prototype.create = function create (nodeData) {
    return this._document.create(nodeData)
  };

  EditingInterface.prototype.createDefaultTextNode = function createDefaultTextNode (content) {
    return this._document.createDefaultTextNode(content, this._direction)
  };

  EditingInterface.prototype.delete = function delete$1 (nodeId) {
    return this._document.delete(nodeId)
  };

  EditingInterface.prototype.set = function set (path, value) {
    return this._document.set(path, value)
  };

  EditingInterface.prototype.update = function update (path, diffOp) {
    return this._document.update(path, diffOp)
  };



  EditingInterface.prototype.createSelection = function createSelection () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return (ref = this._document).createSelection.apply(ref, args)
    var ref;
  };

  EditingInterface.prototype.setSelection = function setSelection (sel) {
    if (!sel) { sel = Selection.nullSelection; }
    else if (isPlainObject(sel)) {
      sel = this.createSelection(sel);
    }
    var oldSel = this._selection;
    if (oldSel && sel && !sel.isNull()) {
      if (!sel.containerId) {
        sel.containerId = oldSel.containerId;
      }
    }
    this._selection = sel;
  };

  EditingInterface.prototype.getSelection = function getSelection () {
    return this._selection
  };

  prototypeAccessors$2.selection.get = function () {
    return this._selection
  };

  prototypeAccessors$2.selection.set = function (sel) {
    this.setSelection(sel);
  };


  prototypeAccessors$2.textDirection.get = function () {
    return this._direction
  };

  prototypeAccessors$2.textDirection.set = function (dir) {
    this._direction = dir;
  };



  EditingInterface.prototype.annotate = function annotate (annotationData) {
    if (this._selection && !this._selection.isNull()) {
      return this._impl.annotate(this, annotationData)
    }
  };

  EditingInterface.prototype.break = function break$1 () {
    if (this._selection && !this._selection.isNull()) {
      this._impl.break(this);
    }
  };

  EditingInterface.prototype.copySelection = function copySelection$1 () {
    if (this._selection && !this._selection.isNull()) {
      return copySelection(this.getDocument(), this._selection)
    }
  };

  EditingInterface.prototype.deleteSelection = function deleteSelection (options) {
    if (this._selection && !this._selection.isNull()) {
      this._impl.delete(this, 'right', options);
    }
  };

  EditingInterface.prototype.deleteCharacter = function deleteCharacter (direction) {
    if (!this._selection || this._selection.isNull()) {

    } else if (!this._selection.isCollapsed()) {
      this.deleteSelection();
    } else {
      this._impl.delete(this, direction);
    }
  };

  EditingInterface.prototype.insertText = function insertText (text) {
    if (this._selection && !this._selection.isNull()) {
      this._impl.insertText(this, text);
    }
  };


  EditingInterface.prototype.insertInlineNode = function insertInlineNode (inlineNode) {
    if (this._selection && !this._selection.isNull()) {
      this._impl.insertInlineNode(this, inlineNode);
    }
  };

  EditingInterface.prototype.insertBlockNode = function insertBlockNode (blockNode) {
    if (this._selection && !this._selection.isNull()) {
      this._impl.insertBlockNode(this, blockNode);
    }
  };

  EditingInterface.prototype.paste = function paste (content) {
    if (this._selection && !this._selection.isNull()) {
      this._impl.paste(this, content);
    }
  };

  EditingInterface.prototype.switchTextType = function switchTextType (nodeData) {
    if (this._selection && !this._selection.isNull()) {
      return this._impl.switchTextType(this, nodeData)
    }
  };

  EditingInterface.prototype.toggleList = function toggleList (params) {
    if (this._selection && !this._selection.isNull()) {
      return this._impl.toggleList(this, params)
    }
  };

  EditingInterface.prototype.indent = function indent () {
    if (this._selection && !this._selection.isNull()) {
      this._impl.indent(this);
    }
  };

  EditingInterface.prototype.dedent = function dedent () {
    if (this._selection && !this._selection.isNull()) {
      this._impl.dedent(this);
    }
  };



  EditingInterface.prototype.getIndex = function getIndex () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return (ref = this._document).getIndex.apply(ref, args)
    var ref;
  };

  EditingInterface.prototype.getAnnotations = function getAnnotations () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return (ref = this._document).getAnnotations.apply(ref, args)
    var ref;
  };

  EditingInterface.prototype.getSchema = function getSchema () {
    return this._document.getSchema()
  };

  EditingInterface.prototype.createSnippet = function createSnippet () {
    return this._document.createSnippet()
  };

  Object.defineProperties( EditingInterface.prototype, prototypeAccessors$2 );

  var Transaction = (function (EditingInterface$$1) {
    function Transaction(doc, editorSession) {
      EditingInterface$$1.call(this);



      this._stageDoc = this._document = new TransactionDocument(doc, this);
      this._editorSession = editorSession;


      this._isTransacting = false;
      this._state = 'idle';
      this._surface = null;
    }

    if ( EditingInterface$$1 ) Transaction.__proto__ = EditingInterface$$1;
    Transaction.prototype = Object.create( EditingInterface$$1 && EditingInterface$$1.prototype );
    Transaction.prototype.constructor = Transaction;

    var prototypeAccessors = { ops: {} };

    Transaction.prototype.dispose = function dispose () {
      this._stageDoc.dispose();
    };

    Transaction.prototype.setSelection = function setSelection (sel) {
      EditingInterface$$1.prototype.setSelection.call(this, sel);




      sel = this._selection;
      if (!sel.isNull()) {
        if (!sel.surfaceId) {

          var surface = this._editorSession.getFocusedSurface();
          if (surface) {
            sel.surfaceId = surface.id;
          } else {

            console.warn('No focused surface. Selection will not be rendered.');
          }
        }
      }
    };





    prototypeAccessors.ops.get = function () {
      return this._stageDoc.ops
    };
    prototypeAccessors.ops.set = function (ops) {
      this._stageDoc.ops = ops;
    };

    Transaction.prototype.rollback = function rollback () {
      this._stageDoc._rollback();
    };

    Transaction.prototype._apply = function _apply () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      (ref = this._stageDoc)._apply.apply(ref, args);
      var ref;
    };






    Transaction.prototype._recordChange = function _recordChange (transformation, selection) {

      if (this._isTransacting) { throw new Error('Nested transactions are not supported.') }
      if (!isFunction$2(transformation)) { throw new Error('Document.transaction() requires a transformation function.') }
      this._isTransacting = true;
      this._reset();
      this._state = 'started';
      var change;
      try {
        this.setSelection(selection);
        var selBefore = this.getSelection();
        transformation(this, {
          selection: selBefore
        });
        var ops = this.ops;
        if (ops.length > 0) {
          change = new DocumentChange(ops, this._before, this._after);
          change.before = { selection: selBefore };
          change.after = { selection: this.getSelection() };
        }
        this._state = 'finished';
      } finally {
        if (this._state !== 'finished') {
          this.rollback();
        }
        this._state = 'idle';
        this._isTransacting = false;
      }
      return change
    };

    Transaction.prototype._reset = function _reset () {
      this._before = {};
      this._after = {};
      this._stageDoc._reset();
      this._info = {};
      this.setSelection(null);
    };

    Object.defineProperties( Transaction.prototype, prototypeAccessors );

    return Transaction;
  }(EditingInterface));

  var PLAINOBJ = {};


  var Registry = function Registry(entries, validator) {
    this.entries = {};
    this.names = [];
    this.validator = validator;

    if (entries) {
      forEach(entries, function(entry, name) {
        this.add(name, entry);
      }.bind(this));
    }
  };

  var prototypeAccessors$3 = { _isRegistry: {} };

  prototypeAccessors$3._isRegistry.get = function () { return true };


  Registry.prototype.contains = function contains (name) {
    return this.entries.hasOwnProperty(name)
  };


  Registry.prototype.add = function add (name, entry) {
    if (this.validator) {
      this.validator(entry);
    }
    if (PLAINOBJ[name]) {
      throw new Error('Illegal key: "'+name+'" is a property of Object which is thus not allowed as a key.')
    }
    if (this.contains(name)) {
      this.remove(name);
    }
    this.entries[name] = entry;
    this.names.push(name);
  };


  Registry.prototype.remove = function remove (name) {
    var pos = this.names.indexOf(name);
    if (pos >= 0) {
      this.names.splice(pos, 1);
    }
    delete this.entries[name];
  };


  Registry.prototype.clear = function clear () {
    this.names = [];
    this.entries = {};
  };


  Registry.prototype.get = function get (name) {
    return this.entries[name]
  };


  Registry.prototype.each = function each (callback, ctx) {
    console.warn('DEPRECATED: use Registry.forEach(cb) instead');
    return this.forEach(callback.bind(ctx))
  };

  Registry.prototype.forEach = function forEach$$1 (callback) {
    var this$1 = this;

    for (var i = 0; i < this.names.length; i++) {
      var name = this$1.names[i];
      var _continue = callback(this$1.entries[name], name);
      if (_continue === false) {
        break
      }
    }
  };

  Registry.prototype.map = function map (callback) {
    var result = [];
    this.forEach(function(entry, name) {
      result.push(callback(entry, name));
    });
    return result
  };

  Registry.prototype.filter = function filter (callback) {
    var result = [];
    this.forEach(function(entry, name) {
      if (callback(entry, name)) {
        result.push(entry);
      }
    });
    return result
  };

  Object.defineProperties( Registry.prototype, prototypeAccessors$3 );

  var CommandManager = function CommandManager(context, commands) {
    if (!context.editorSession) {
      throw new Error('EditorSession required.')
    }

    this.editorSession = context.editorSession;
    this.doc = this.editorSession.getDocument();
    this.context = extend({}, context, {

      doc: this.doc
    });

    this.commandRegistry = new Registry();
    forEach(commands, function(command) {
      if(!command._isCommand) {
        throw new Error("Expecting instances of ui/Command.")
      }
      this.commandRegistry.add(command.name, command);
    }.bind(this));

    this.editorSession.onUpdate(this.onSessionUpdate, this);
    this.updateCommandStates(this.editorSession);
  };

  CommandManager.prototype.dispose = function dispose () {
    this.editorSession.off(this);
  };

  CommandManager.prototype.onSessionUpdate = function onSessionUpdate (editorSession) {
    if (editorSession.hasChanged('change') || editorSession.hasChanged('selection')) {
      this.updateCommandStates(editorSession);
    }
  };


  CommandManager.prototype.updateCommandStates = function updateCommandStates (editorSession) {
    var commandStates = {};
    var commandContext = this.getCommandContext();
    var params = this._getCommandParams();
    this.commandRegistry.forEach(function(cmd) {
      commandStates[cmd.getName()] = cmd.getCommandState(params, commandContext);
    });

    if (!isEqual(this.commandStates, commandStates)) {
      this.commandStates = commandStates;
      editorSession.setCommandStates(commandStates);
    }
  };


  CommandManager.prototype.executeCommand = function executeCommand (commandName, userParams, cb) {
    var this$1 = this;

    var cmd = this.commandRegistry.get(commandName);
    if (!cmd) {
      console.warn('command', commandName, 'not registered');
      return
    }
    var commandState = this.commandStates[commandName];
    var params = extend(this._getCommandParams(), userParams, {
      commandState: commandState
    });

    if (cmd.isAsync) {

      this.editorSession.lock();
      cmd.execute(params, this.getCommandContext(), function (err, info) {
        if (err) {
          if (cb) {
            cb(err);
          } else {
            console.error(err);
          }
        } else {
          if (cb) { cb(null, info); }
        }
        this$1.editorSession.unlock();
      });
    } else {
      var info = cmd.execute(params, this.getCommandContext());
      return info
    }
  };


  CommandManager.prototype.getCommandStates = function getCommandStates () {
    return this.commandStates
  };

  CommandManager.prototype.getCommandContext = function getCommandContext () {
    return this.context
  };


  CommandManager.prototype._getCommandParams = function _getCommandParams () {
    var editorSession = this.context.editorSession;
    var selectionState = editorSession.getSelectionState();
    var sel = selectionState.getSelection();
    var surface = this.context.surfaceManager.getFocusedSurface();
    return {
      editorSession: editorSession,
      selectionState: selectionState,
      surface: surface,
      selection: sel,
    }
  };

  var _global = (typeof global !== 'undefined') ? global : window;
  var substanceGlobals = _global.hasOwnProperty('Substance') ? _global.Substance : _global.Substance = {
    DEBUG_RENDERING: true
  };

  function flattenOften(arr, max) {
    if (!(max > 0)) { throw new Error("'max' must be a positive number") }
    var l = arr.length;
    arr = flatten(arr);
    var round = 1;
    while (round < max && l < arr.length) {
      l = arr.length;
      arr = flatten(arr);
      round++;
    }
    return arr
  }

  var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';


  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED$2);
    return this;
  }

  function setCacheHas(value) {
    return this.__data__.has(value);
  }

  function SetCache(values) {
    var this$1 = this;

    var index = -1,
        length = values ? values.length : 0;

    this.__data__ = new MapCache;
    while (++index < length) {
      this$1.add(values[index]);
    }
  }


  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
  SetCache.prototype.has = setCacheHas;

  function indexOfNaN(array, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 1 : -1);

    while ((fromRight ? index-- : ++index < length)) {
      var other = array[index];
      if (other !== other) {
        return index;
      }
    }
    return -1;
  }

  function baseIndexOf(array, value, fromIndex) {
    if (value !== value) {
      return indexOfNaN(array, fromIndex);
    }
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  function arrayIncludes(array, value) {
    var length = array ? array.length : 0;
    return !!length && baseIndexOf(array, value, 0) > -1;
  }

  function arrayIncludesWith(array, value, comparator) {
    var index = -1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (comparator(value, array[index])) {
        return true;
      }
    }
    return false;
  }

  function arrayMap(array, iteratee) {
    var index = -1,
        length = array ? array.length : 0,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }

  function cacheHas(cache, key) {
    return cache.has(key);
  }

  var LARGE_ARRAY_SIZE = 200;


  function baseDifference(array, values, iteratee, comparator) {
    var index = -1,
        includes = arrayIncludes,
        isCommon = true,
        length = array.length,
        result = [],
        valuesLength = values.length;

    if (!length) {
      return result;
    }
    if (iteratee) {
      values = arrayMap(values, baseUnary(iteratee));
    }
    if (comparator) {
      includes = arrayIncludesWith;
      isCommon = false;
    }
    else if (values.length >= LARGE_ARRAY_SIZE) {
      includes = cacheHas;
      isCommon = false;
      values = new SetCache(values);
    }
    outer:
        while (++index < length) {
          var value = array[index],
              computed = iteratee ? iteratee(value) : value;

          value = (comparator || value !== 0) ? value : 0;
          if (isCommon && computed === computed) {
            var valuesIndex = valuesLength;
            while (valuesIndex--) {
              if (values[valuesIndex] === computed) {
                continue outer;
              }
            }
            result.push(value);
          }
          else if (!includes(values, computed, comparator)) {
            result.push(value);
          }
        }
    return result;
  }

  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined : object[key];
    };
  }

  var getLength = baseProperty('length');

  var MAX_SAFE_INTEGER$1 = 9007199254740991;


  function isLength(value) {
    return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
  }

  function isArrayLike(value) {
    return value != null && isLength(getLength(value)) && !isFunction(value);
  }

  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }

  function apply(func, thisArg, args) {
    var length = args.length;
    switch (length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  var NAN = 0 / 0;


  var reTrim = /^\s+|\s+$/g;


  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;


  var reIsBinary = /^0b[01]+$/i;


  var reIsOctal = /^0o[0-7]+$/i;


  var freeParseInt = parseInt;


  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject$1(value)) {
      var other = isFunction(value.valueOf) ? value.valueOf() : value;
      value = isObject$1(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
  }

  var INFINITY$2 = 1 / 0;
  var MAX_INTEGER = 1.7976931348623157e+308;


  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY$2 || value === -INFINITY$2) {
      var sign = (value < 0 ? -1 : 1);
      return sign * MAX_INTEGER;
    }
    return value === value ? value : 0;
  }

  function toInteger(value) {
    var result = toFinite(value),
        remainder = result % 1;

    return result === result ? (remainder ? result - remainder : result) : 0;
  }

  var FUNC_ERROR_TEXT$1 = 'Expected a function';


  var nativeMax = Math.max;


  function rest(func, start) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$1);
    }
    start = nativeMax(start === undefined ? (func.length - 1) : toInteger(start), 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }
      switch (start) {
        case 0: return func.call(this, array);
        case 1: return func.call(this, args[0], array);
        case 2: return func.call(this, args[0], args[1], array);
      }
      var otherArgs = Array(start + 1);
      index = -1;
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = array;
      return apply(func, this, otherArgs);
    };
  }

  var without = rest(function(array, values) {
    return isArrayLikeObject(array)
        ? baseDifference(array, values)
        : [];
  });

  var ArrayIterator = function ArrayIterator(arr) {
    this.arr = arr;
    this.pos = -1;
  };

  var prototypeAccessors$5 = { _isArrayIterator: {} };

  prototypeAccessors$5._isArrayIterator.get = function () {
    return true
  };


  ArrayIterator.prototype.hasNext = function hasNext () {
    return this.pos < this.arr.length - 1
  };


  ArrayIterator.prototype.next = function next () {
    this.pos += 1;
    var next = this.arr[this.pos];
    return next
  };


  ArrayIterator.prototype.back = function back () {
    if (this.pos >= 0) {
      this.pos -= 1;
    }
    return this
  };

  Object.defineProperties( ArrayIterator.prototype, prototypeAccessors$5 );

  var NOT_IMPLEMENTED = 'This method is not implemented.';


  var DOMElement = function DOMElement () {};

  var prototypeAccessors$4 = { id: {},tagName: {},nodeName: {},nodeType: {},className: {},textContent: {},innerHTML: {},outerHTML: {},firstChild: {},lastChild: {},nextSibling: {},previousSibling: {},parentNode: {},height: {},width: {} };

  DOMElement.prototype.getNativeElement = function getNativeElement () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.hasClass = function hasClass (className) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.addClass = function addClass (classString) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.removeClass = function removeClass (classString) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.attr = function attr () {
    if (arguments.length === 1) {
      if (isString(arguments[0])) {
        return this.getAttribute(arguments[0])
      } else if (isObject(arguments[0])) {
        forEach(arguments[0], function(value, name) {
          this.setAttribute(name, value);
        }.bind(this));
      }
    } else if (arguments.length === 2) {
      this.setAttribute(arguments[0], arguments[1]);
    }
    return this
  };


  DOMElement.prototype.removeAttr = function removeAttr (name) {
    var names = name.split(/\s+/);
    if (names.length === 1) {
      this.removeAttribute(name);
    } else {
      names.forEach(function(name) {
        this.removeAttribute(name);
      }.bind(this));
    }
    return this
  };


  DOMElement.prototype.getAttribute = function getAttribute (name) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.setAttribute = function setAttribute (name, value) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.removeAttribute = function removeAttribute (name) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.getAttributes = function getAttributes () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.htmlProp = function htmlProp () {
    if (arguments.length === 1) {
      if (isString(arguments[0])) {
        return this.getProperty(arguments[0])
      } else if (isObject(arguments[0])) {
        forEach(arguments[0], function(value, name) {
          this.setProperty(name, value);
        }.bind(this));
      }
    } else if (arguments.length === 2) {
      this.setProperty(arguments[0], arguments[1]);
    }
    return this
  };

  DOMElement.prototype.getProperty = function getProperty (name) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.setProperty = function setProperty (name, value) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.removeProperty = function removeProperty (name) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.getTagName = function getTagName () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.setTagName = function setTagName (tagName) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.getId = function getId () {
    return this.getAttribute('id')
  };


  DOMElement.prototype.setId = function setId (id) {
    this.setAttribute('id', id);
  };


  DOMElement.prototype.val = function val (value) {
    if (arguments.length === 0) {
      return this.getValue()
    } else {
      this.setValue(value);
      return this
    }
  };

  DOMElement.prototype.getValue = function getValue () {
    return this.getProperty('value')
  };

  DOMElement.prototype.setValue = function setValue (value) {
    this.setProperty('value', value);
    return this
  };


  DOMElement.prototype.css = function css () {
    if (arguments.length === 1) {
      if (isString(arguments[0])) {
        return this.getStyle(arguments[0])
      } else if (isObject(arguments[0])) {
        forEach(arguments[0], function(value, name) {
          this.setStyle(name, value);
        }.bind(this));
      } else {
        throw new Error('Illegal arguments.')
      }
    } else if (arguments.length === 2) {
      this.setStyle(arguments[0], arguments[1]);
    } else {
      throw new Error('Illegal arguments.')
    }
    return this
  };

  DOMElement.prototype.getStyle = function getStyle (name) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.setStyle = function setStyle (name, value) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.text = function text (text$1) {
    if (arguments.length === 0) {
      return this.getTextContent()
    } else {
      this.setTextContent(text$1);
    }
    return this
  };


  DOMElement.prototype.getTextContent = function getTextContent () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.setTextContent = function setTextContent (text) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.html = function html (html$1) {
    if (arguments.length === 0) {
      return this.getInnerHTML()
    } else {
      this.setInnerHTML(html$1);
    }
    return this
  };


  DOMElement.prototype.getInnerHTML = function getInnerHTML () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.setInnerHTML = function setInnerHTML (html) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.getOuterHTML = function getOuterHTML () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.on = function on (eventName, handler, context, options) {
    if (!isString(eventName)) {
      throw new Error('Illegal argument: "event" must be a String.')
    }
    options = options || {};
    if (context) {
      options.context = context;
    }
    if (options.selector && !isString(options.selector)) {
      throw new Error('Illegal argument: selector must be a string.')
    }
    if (!handler || !isFunction$2(handler)) {
      throw new Error('Illegal argument: invalid handler function for event ' + eventName)
    }
    this.addEventListener(eventName, handler, options);
    return this
  };


  DOMElement.prototype.off = function off (eventName, handler) {

    if (arguments.length === 1 && !isString(eventName)) {
      var context = arguments[0];
      this.getEventListeners().filter(function(l) {
        return l.context === context
      }).forEach(function(l) {
        this.removeEventListener(l);
      }.bind(this));
    } else {
      this.removeEventListener(eventName, handler);
    }
    return this
  };

  DOMElement.prototype.addEventListener = function addEventListener (eventName, handler, options) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.removeEventListener = function removeEventListener (eventName, handler) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.getEventListeners = function getEventListeners () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.getNodeType = function getNodeType () {
    if (this.isTextNode()) {
      return "text"
    } else if (this.isCommentNode()) {
      return "comment"
    } else if (this.isElementNode()) {
      return "element"
    } else if (this.isDocumentNode()) {
      return "document"
    } else {
      throw new Error("Unsupported node type")
    }
  };

  DOMElement.prototype.getChildCount = function getChildCount () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.getChildNodes = function getChildNodes () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.getChildren = function getChildren () {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.getChildAt = function getChildAt (pos) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.getChildIndex = function getChildIndex (child) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.getChildNodeIterator = function getChildNodeIterator () {
    return new ArrayIterator(this.getChildNodes())
  };

  DOMElement.prototype.getLastChild = function getLastChild () {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.getFirstChild = function getFirstChild () {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.getNextSibling = function getNextSibling () {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.getPreviousSibling = function getPreviousSibling () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.isTextNode = function isTextNode () {
    return false
  };


  DOMElement.prototype.isElementNode = function isElementNode () {
    return false
  };


  DOMElement.prototype.isCommentNode = function isCommentNode () {
    return false
  };


  DOMElement.prototype.isDocumentNode = function isDocumentNode () {
    return false
  };


  DOMElement.prototype.clone = function clone () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.createElement = function createElement (str) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.createTextNode = function createTextNode (text) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.is = function is (cssSelector) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.getParent = function getParent () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.getRoot = function getRoot () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.getOwnerDocument = function getOwnerDocument () {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.find = function find (cssSelector) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.findAll = function findAll (cssSelector) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.append = function append (child) {
    var children;
    if (arguments.length === 1) {
      if (isArray(child)) {
        children = child;
      } else {
        this.appendChild(child);
        return this
      }
    } else {
      children = arguments;
    }
    if (children) {
      Array.prototype.forEach.call(children, this.appendChild.bind(this));
    }
    return this
  };

  DOMElement.prototype.appendChild = function appendChild (child) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.insertAt = function insertAt (pos, child) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.insertBefore = function insertBefore (newChild, before) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.removeAt = function removeAt (pos) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.removeChild = function removeChild (child) {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.replaceChild = function replaceChild (oldChild, newChild) {

    throw new Error(NOT_IMPLEMENTED)
  };


  DOMElement.prototype.remove = function remove () {
    var parent = this.getParent();
    if (parent) {
      parent.removeChild(this);
    }
  };


  DOMElement.prototype.empty = function empty () {

    throw new Error(NOT_IMPLEMENTED)
  };

  DOMElement.prototype.serialize = function serialize () {
    return this.getOuterHTML()
  };

  DOMElement.prototype.isInDocument = function isInDocument () {
    var el = this;
    while(el) {
      if (el.isDocumentNode()) {
        return true
      }
      el = el.getParent();
    }
  };


  DOMElement.prototype.focus = function focus () {
    return this
  };


  DOMElement.prototype.blur = function blur () {
    return this
  };


  DOMElement.prototype.click = function click () {
    return this
  };



  DOMElement.prototype.getWidth = function getWidth () {
    return 0
  };

  DOMElement.prototype.getHeight = function getHeight () {
    return 0
  };


  DOMElement.prototype.getOuterHeight = function getOuterHeight (withMargin) {
    return 0
  };


  DOMElement.prototype.getOffset = function getOffset () {
    return { top: 0, left: 0 }
  };


  DOMElement.prototype.getPosition = function getPosition () {
    return { top: 0, left: 0 }
  };


  DOMElement.prototype.getElementFactory = function getElementFactory () {
    return this.createElement.bind(this)
  };



  prototypeAccessors$4.id.get = function () {
    return this.getId()
  };

  prototypeAccessors$4.id.set = function (id) {
    this.setId(id);
  };

  prototypeAccessors$4.tagName.get = function () {
    return this.getTagName()
  };

  prototypeAccessors$4.tagName.set = function (tagName) {
    this.setTagName(tagName);
  };

  prototypeAccessors$4.nodeName.get = function () {
    return this.getTagName()
  };

  prototypeAccessors$4.nodeType.get = function () {
    return this.getNodeType()
  };

  prototypeAccessors$4.className.get = function () {
    return this.getAttribute('class')
  };

  prototypeAccessors$4.className.set = function (className) {
    this.setAttribute('class', className);
  };

  prototypeAccessors$4.textContent.get = function () {
    return this.getTextContent()
  };

  prototypeAccessors$4.textContent.set = function (text) {
    this.setTextContent(text);
  };

  prototypeAccessors$4.innerHTML.get = function () {
    return this.getInnerHTML()
  };

  prototypeAccessors$4.innerHTML.set = function (html) {
    this.setInnerHTML(html);
  };

  prototypeAccessors$4.outerHTML.get = function () {
    return this.getOuterHTML()
  };

  prototypeAccessors$4.firstChild.get = function () {
    return this.getFirstChild()
  };

  prototypeAccessors$4.lastChild.get = function () {
    return this.getLastChild()
  };

  prototypeAccessors$4.nextSibling.get = function () {
    return this.getNextSibling()
  };

  prototypeAccessors$4.previousSibling.get = function () {
    return this.getPreviousSibling()
  };

  prototypeAccessors$4.parentNode.get = function () {
    return this.getParent()
  };

  prototypeAccessors$4.height.get = function () {
    return this.getHeight()
  };

  prototypeAccessors$4.width.get = function () {
    return this.getWidth()
  };

  Object.defineProperties( DOMElement.prototype, prototypeAccessors$4 );

  DOMElement.prototype._isDOMElement = true;

  DOMElement.pxStyles = {
    top: true,
    bottom: true,
    left: true,
    right: true,
    height: true,
    width: true
  };

  DOMElement.EMPTY_HTML = '<html><head></head><body></body></html>';

  function findIndex(arr, predicate) {
    if (!isFunction$2(predicate)) { return arr.indexOf(predicate) }
    for (var i = 0; i < arr.length; i++) {
      if (predicate(arr[i])) { return i }
    }
    return -1
  }

  var DOMEventListener = function DOMEventListener(eventName, handler, options) {
    if (!isString(eventName) || !isFunction$2(handler)) {
      throw new Error("Illegal arguments: 'eventName' must be a String, and 'handler' must be a Function.")
    }
    options = options || {};
    var origHandler = handler;
    var context = options.context;
    var capture = Boolean(options.capture);

    if (context) {
      handler = handler.bind(context);
    }
    if (options.once === true) {
      handler = _once(this, handler);
    }

    this.eventName = eventName;
    this.originalHandler = origHandler;
    this.handler = handler;
    this.capture = capture;
    this.context = context;
    this.options = options;

    this._el = null;
  };

  DOMEventListener.prototype._isDOMEventListener = true;

  DOMEventListener.findIndex = function(eventListeners, eventName, handler) {
    var idx = -1;
    if (arguments[1]._isDOMEventListener) {
      idx = eventListeners.indexOf(arguments[1]);
    } else {
      idx = findIndex(eventListeners,
          _matches.bind(null, {
            eventName: eventName,
            originalHandler: handler
          })
      );
    }
    return idx
  };

  function _matches(l1, l2) {
    return l1.eventName === l2.eventName && l1.originalHandler === l2.originalHandler
  }

  function _once(listener, handler) {
    return function(event) {
      handler(event);
      listener._el.removeEventListener(listener);
    }
  }

  var VirtualElement = (function (DOMElement$$1) {
    function VirtualElement(owner) {
      DOMElement$$1.call(this);


      this.parent = null;

      this._owner = owner;

      this._ref = null;
    }

    if ( DOMElement$$1 ) VirtualElement.__proto__ = DOMElement$$1;
    VirtualElement.prototype = Object.create( DOMElement$$1 && DOMElement$$1.prototype );
    VirtualElement.prototype.constructor = VirtualElement;

    var prototypeAccessors = { childNodes: {} };

    VirtualElement.prototype.getParent = function getParent () {
      return this.parent
    };

    prototypeAccessors.childNodes.get = function () {
      return this.getChildNodes()
    };


    VirtualElement.prototype.getComponent = function getComponent () {
      return this._comp
    };


    VirtualElement.prototype.ref = function ref (ref$1) {
      if (!ref$1) { throw new Error('Illegal argument') }

      if (this._ref) { throw new Error('A VirtualElement can only be referenced once.') }
      this._ref = ref$1;
      if (this._context) {
        var refs = this._context.refs;
        if(refs[ref$1]) {
          throw new Error('An item with reference "'+ref$1+'" already exists.')
        }
        refs[ref$1] = this;
      }
      return this
    };

    VirtualElement.prototype.isInDocument = function isInDocument () {
      return false
    };

    Object.defineProperties( VirtualElement.prototype, prototypeAccessors );

    return VirtualElement;
  }(DOMElement));

  VirtualElement.prototype._isVirtualElement = true;


  var VirtualHTMLElement = (function (VirtualElement) {
    function VirtualHTMLElement(tagName) {
      VirtualElement.call(this);

      this._tagName = tagName;
      this.classNames = null;
      this.attributes = null;
      this.htmlProps = null;
      this.style = null;
      this.eventListeners = null;


      this.children = [];
    }

    if ( VirtualElement ) VirtualHTMLElement.__proto__ = VirtualElement;
    VirtualHTMLElement.prototype = Object.create( VirtualElement && VirtualElement.prototype );
    VirtualHTMLElement.prototype.constructor = VirtualHTMLElement;

    VirtualHTMLElement.prototype.getTagName = function getTagName () {
      return this._tagName
    };

    VirtualHTMLElement.prototype.setTagName = function setTagName (tagName) {
      this._tagName = tagName;
      return this
    };

    VirtualHTMLElement.prototype.hasClass = function hasClass (className) {
      if (this.classNames) {
        return this.classNames.indexOf(className) > -1
      }
      return false
    };

    VirtualHTMLElement.prototype.addClass = function addClass (className) {
      if (!this.classNames) {
        this.classNames = [];
      }
      this.classNames.push(className);
      return this
    };

    VirtualHTMLElement.prototype.removeClass = function removeClass (className) {
      if (this.classNames) {
        this.classNames = without(this.classNames, className);
      }
      return this
    };

    VirtualHTMLElement.prototype.removeAttribute = function removeAttribute (name) {
      if (this.attributes) {
        delete this.attributes[name];
      }
      return this
    };

    VirtualHTMLElement.prototype.getAttribute = function getAttribute (name) {
      if (this.attributes) {
        return this.attributes[name]
      }
    };

    VirtualHTMLElement.prototype.setAttribute = function setAttribute (name, value) {
      if (!this.attributes) {
        this.attributes = {};
      }
      this.attributes[name] = value;
      return this
    };

    VirtualHTMLElement.prototype.getAttributes = function getAttributes () {



      var attributes = {};
      if (this.attributes) {
        extend(attributes, this.attributes);
      }
      if (this.classNames) {
        attributes.class = this.classNames.join(' ');
      }
      if (this.style) {
        attributes.style = map(this.style, function(val, key) {
          return key + ":" + val
        }).join(';');
      }
      return attributes
    };

    VirtualHTMLElement.prototype.getId = function getId () {
      return this.getAttribute('id')
    };

    VirtualHTMLElement.prototype.setId = function setId (id) {
      this.setAttribute('id', id);
      return this
    };

    VirtualHTMLElement.prototype.setTextContent = function setTextContent (text) {
      if (!isString(text)) { throw new Error('Illegal argument: expecting a string.') }
      text = text || '';
      this.empty();
      this.appendChild(text);
      return this
    };

    VirtualHTMLElement.prototype.setInnerHTML = function setInnerHTML (html) {
      html = html || '';
      this.empty();
      this._innerHTMLString = html;
      return this
    };

    VirtualHTMLElement.prototype.getInnerHTML = function getInnerHTML () {
      if (!this.hasOwnProperty('_innerHTMLString')) {
        throw new Error('Not supported.')
      } else {
        return this._innerHTMLString
      }
    };

    VirtualHTMLElement.prototype.getValue = function getValue () {
      return this.htmlProp('value')
    };

    VirtualHTMLElement.prototype.setValue = function setValue (value) {
      this.htmlProp('value', value);
      return this
    };

    VirtualHTMLElement.prototype.getChildNodes = function getChildNodes () {
      return this.children
    };

    VirtualHTMLElement.prototype.getChildren = function getChildren () {
      return this.children.filter(function(child) {
        return child.getNodeType() !== "text"
      })
    };

    VirtualHTMLElement.prototype.isTextNode = function isTextNode () {
      return false
    };

    VirtualHTMLElement.prototype.isElementNode = function isElementNode () {
      return true
    };

    VirtualHTMLElement.prototype.isCommentNode = function isCommentNode () {
      return false
    };

    VirtualHTMLElement.prototype.isDocumentNode = function isDocumentNode () {
      return false
    };

    VirtualHTMLElement.prototype.append = function append () {
      if (this._innerHTMLString) {
        throw Error('It is not possible to mix $$.html() with $$.append(). You can call $$.empty() to reset this virtual element.')
      }
      this._append(this.children, arguments);
      return this
    };

    VirtualHTMLElement.prototype.appendChild = function appendChild (child) {
      if (this._innerHTMLString) {
        throw Error('It is not possible to mix $$.html() with $$.append(). You can call $$.empty() to reset this virtual element.')
      }
      this._appendChild(this.children, child);
      return this
    };

    VirtualHTMLElement.prototype.insertAt = function insertAt (pos, child) {
      child = this._normalizeChild(child);
      if (!child) {
        throw new Error('Illegal child: ' + child)
      }
      if (!child._isVirtualElement) {
        throw new Error('Illegal argument for $$.insertAt():' + child)
      }
      if (pos < 0 || pos > this.children.length) {
        throw new Error('insertAt(): index out of bounds.')
      }
      this._insertAt(this.children, pos, child);
      return this
    };

    VirtualHTMLElement.prototype.insertBefore = function insertBefore (child, before) {
      var pos = this.children.indexOf(before);
      if (pos > -1) {
        this.insertAt(pos, child);
      } else {
        throw new Error('insertBefore(): reference node is not a child of this element.')
      }
      return this
    };

    VirtualHTMLElement.prototype.removeAt = function removeAt (pos) {
      if (pos < 0 || pos >= this.children.length) {
        throw new Error('removeAt(): Index out of bounds.')
      }
      this._removeAt(pos);
      return this
    };

    VirtualHTMLElement.prototype.removeChild = function removeChild (child) {
      if (!child || !child._isVirtualElement) {
        throw new Error('removeChild(): Illegal arguments. Expecting a CheerioDOMElement instance.')
      }
      var idx = this.children.indexOf(child);
      if (idx < 0) {
        throw new Error('removeChild(): element is not a child.')
      }
      this.removeAt(idx);
      return this
    };

    VirtualHTMLElement.prototype.replaceChild = function replaceChild (oldChild, newChild) {
      if (!newChild || !oldChild ||
          !newChild._isVirtualElement || !oldChild._isVirtualElement) {
        throw new Error('replaceChild(): Illegal arguments. Expecting BrowserDOMElement instances.')
      }
      var idx = this.children.indexOf(oldChild);
      if (idx < 0) {
        throw new Error('replaceChild(): element is not a child.')
      }
      this.removeAt(idx);
      this.insertAt(idx, newChild);
      return this
    };

    VirtualHTMLElement.prototype.empty = function empty () {
      var children = this.children;
      while (children.length) {
        var child = children.pop();
        child.parent = null;
      }
      delete this._innerHTMLString;
      return this
    };

    VirtualHTMLElement.prototype.getProperty = function getProperty (name) {
      if (this.htmlProps) {
        return this.htmlProps[name]
      }
    };

    VirtualHTMLElement.prototype.setProperty = function setProperty (name, value) {
      if (!this.htmlProps) {
        this.htmlProps = {};
      }
      this.htmlProps[name] = value;
      return this
    };

    VirtualHTMLElement.prototype.removeProperty = function removeProperty (name) {
      if (this.htmlProps) {
        delete this.htmlProps[name];
      }
      return this
    };

    VirtualHTMLElement.prototype.getStyle = function getStyle (name) {
      if (this.style) {
        return this.style[name]
      }
    };

    VirtualHTMLElement.prototype.setStyle = function setStyle (name, value) {
      if (!this.style) {
        this.style = {};
      }
      if (DOMElement.pxStyles[name] && isNumber(value)) { value = value + 'px'; }
      this.style[name] = value;
      return this
    };

    VirtualHTMLElement.prototype.addEventListener = function addEventListener (eventName, handler, options) {
      var listener;
      if (arguments.length === 1 && arguments[0]._isDOMEventListener) {
        listener = arguments[0];
      } else {
        options = options || {};
        options.context = options.context || this._owner._comp;
        listener = new DOMEventListener(eventName, handler, options);
      }
      if (!this.eventListeners) {
        this.eventListeners = [];
      }
      this.eventListeners.push(listener);
      return this
    };

    VirtualHTMLElement.prototype.removeEventListener = function removeEventListener (eventName, handler) {
      if (this.eventListeners) {
        DOMElement._findEventListenerIndex(this.eventListeners, eventName, handler);
      }
      return this
    };

    VirtualHTMLElement.prototype.getEventListeners = function getEventListeners () {
      return this.eventListeners
    };

    VirtualHTMLElement.prototype.getNodeType = function getNodeType () {
      return "element"
    };

    VirtualHTMLElement.prototype.hasInnerHTML = function hasInnerHTML () {
      return Boolean(this._innerHTMLString)
    };

    VirtualHTMLElement.prototype._normalizeChild = function _normalizeChild (child) {
      if (isString(child)) {
        child = new VirtualTextNode(child);
      }
      return child
    };

    VirtualHTMLElement.prototype._append = function _append (outlet, args) {
      if (args.length === 1 && !isArray(args[0])) {
        this._appendChild(outlet, args[0]);
        return
      }
      var children;
      if (isArray(args[0])) {
        children = args[0];
      } else if (arguments.length > 1) {
        children = Array.prototype.slice.call(args,0);
      } else {
        return
      }
      children.forEach(this._appendChild.bind(this, outlet));
    };

    VirtualHTMLElement.prototype._appendChild = function _appendChild (outlet, child) {
      child = this._normalizeChild(child);


      if (!child) { return }
      outlet.push(child);
      this._attach(child);
      return child
    };

    VirtualHTMLElement.prototype._insertAt = function _insertAt (outlet, pos, child) {
      if (!child) { return }
      outlet.splice(pos, 0, child);
      this._attach(child);
    };

    VirtualHTMLElement.prototype._removeAt = function _removeAt (outlet, pos) {
      var child = outlet[pos];
      outlet.splice(pos, 1);
      this._detach(child);
    };

    VirtualHTMLElement.prototype._attach = function _attach (child) {
      child.parent = this;
      if (this._context && child._owner !== this._owner && child._ref) {
        this._context.foreignRefs[child._ref] = child;
      }
    };

    VirtualHTMLElement.prototype._detach = function _detach (child) {
      child.parent = null;
      if (this._context && child._owner !== this._owner && child._ref) {
        delete this.context.foreignRefs[child._ref];
      }
    };

    VirtualHTMLElement.prototype._mergeHTMLConfig = function _mergeHTMLConfig (other) {
      if (other.classNames) {
        if (!this.classNames) {
          this.classNames = [];
        }
        this.classNames = this.classNames.concat(other.classNames);
      }
      if (other.attributes) {
        if (!this.attributes) {
          this.attributes = {};
        }
        extend(this.attributes, other.attributes);
      }
      if (other.htmlProps) {
        if (!this.htmlProps) {
          this.htmlProps = {};
        }
        extend(this.htmlProps, other.htmlProps);
      }
      if (other.style) {
        if (!this.style) {
          this.style = {};
        }
        extend(this.style, other.style);
      }
      if (other.eventListeners) {
        if (!this.eventListeners) {
          this.eventListeners = [];
        }
        this.eventListeners = this.eventListeners.concat(other.eventListeners);
      }
    };

    return VirtualHTMLElement;
  }(VirtualElement));

  VirtualHTMLElement.prototype._isVirtualHTMLElement = true;



  var VirtualComponent = (function (VirtualHTMLElement) {
    function VirtualComponent(ComponentClass, props) {
      VirtualHTMLElement.call(this);

      props = props || {};

      this.ComponentClass = ComponentClass;
      this.props = props;
      if (!props.children) {
        props.children = [];
      }
      this.children = props.children;
    }

    if ( VirtualHTMLElement ) VirtualComponent.__proto__ = VirtualHTMLElement;
    VirtualComponent.prototype = Object.create( VirtualHTMLElement && VirtualHTMLElement.prototype );
    VirtualComponent.prototype.constructor = VirtualComponent;

    var prototypeAccessors$1 = { _isVirtualComponent: {} };

    prototypeAccessors$1._isVirtualComponent.get = function () { return true; };

    VirtualComponent.prototype.getComponent = function getComponent () {
      return this._comp
    };



    VirtualComponent.prototype.getChildren = function getChildren () {
      return this.props.children
    };

    VirtualComponent.prototype.getNodeType = function getNodeType () {
      return 'component'
    };

    VirtualComponent.prototype.outlet = function outlet (name) {
      return new Outlet(this, name)
    };

    VirtualComponent.prototype._attach = function _attach (child) {
      child._preliminaryParent = this;
    };

    VirtualComponent.prototype._detach = function _detach (child) {
      child._preliminaryParent = null;
    };

    VirtualComponent.prototype._copyHTMLConfig = function _copyHTMLConfig () {
      return {
        classNames: clone(this.classNames),
        attributes: clone(this.attributes),
        htmlProps: clone(this.htmlProps),
        style: clone(this.style),
        eventListeners: clone(this.eventListeners)
      }
    };

    Object.defineProperties( VirtualComponent.prototype, prototypeAccessors$1 );

    return VirtualComponent;
  }(VirtualHTMLElement));

  var Outlet = function Outlet(virtualEl, name) {
    this.virtualEl = virtualEl;
    this.name = name;
    Object.freeze(this);
  };

  Outlet.prototype._getOutlet = function _getOutlet () {
    var outlet = this.virtualEl.props[this.name];
    if (!outlet) {
      outlet = [];
      this.virtualEl.props[this.name] = outlet;
    }
    return outlet
  };

  Outlet.prototype.append = function append () {
    var outlet = this._getOutlet();
    this.virtualEl._append(outlet, arguments);
    return this
  };

  Outlet.prototype.empty = function empty () {
    var arr = this.virtualEl.props[this.name];
    arr.forEach(function(el) {
      this._detach(el);
    }.bind(this));
    arr.splice(0, arr.length);
    return this
  };


  var VirtualTextNode = (function (VirtualElement) {
    function VirtualTextNode(text) {
      VirtualElement.call(this);
      this.text = text;
    }

    if ( VirtualElement ) VirtualTextNode.__proto__ = VirtualElement;
    VirtualTextNode.prototype = Object.create( VirtualElement && VirtualElement.prototype );
    VirtualTextNode.prototype.constructor = VirtualTextNode;

    var prototypeAccessors$2 = { _isVirtualTextNode: {} };

    prototypeAccessors$2._isVirtualTextNode.get = function () { return true; };

    Object.defineProperties( VirtualTextNode.prototype, prototypeAccessors$2 );

    return VirtualTextNode;
  }(VirtualElement));

  VirtualElement.Component = VirtualComponent;
  VirtualElement.TextNode = VirtualTextNode;


  VirtualElement.createElement = function() {
    var content;
    var _first = arguments[0];
    var _second = arguments[1];
    var type;
    if (isString(_first)) {
      type = "element";
    } else if (isFunction$2(_first) && _first.prototype._isComponent) {
      type = "component";
    } else if (isNil(_first)) {
      throw new Error('$$(null): provided argument was null or undefined.')
    } else {
      throw new Error('Illegal usage of $$()')
    }

    var props = {};
    var classNames, ref;
    var eventHandlers = [];
    for(var key in _second) {
      if (!_second.hasOwnProperty(key)) { continue }
      var val = _second[key];
      switch(key) {
        case 'class':
          classNames = val;
          break
        case 'ref':
          ref = val;
          break
        default:
          props[key] = val;
      }
    }
    if (type === 'element') {
      content = new VirtualHTMLElement(_first);


      content.attr(props);
    } else {
      content = new VirtualComponent(_first, props);
    }


    content._owner = this.owner;
    if (classNames) {
      content.addClass(classNames);
    }
    if (ref) {
      content.ref(ref);
    }
    eventHandlers.forEach(function(h) {
      if (isFunction$2(h.handler)) {
        content.on(h.name, h.handler);
      } else if (isPlainObject(h.handler)) {
        var params = h.handler;
        content.on(h.name, params.handler, params.context, params);
      } else {
        throw new Error('Illegal arguments for $$(_,{ on'+h.name+'})')
      }
    });


    if (arguments.length > 2) {
      content.append(flattenOften(Array.prototype.slice.call(arguments, 2), 3));
    }
    return content
  };

  var DelegatedEvent = function DelegatedEvent(owner, selectedTarget, originalEvent) {
    this.owner = owner;
    this.target = selectedTarget;
    this.originalEvent = originalEvent;
  };

  DelegatedEvent.delegatedHandler = function(listener, top) {
    var handler = listener.handler;
    var context = listener.context;
    var selector = listener.options.selector;
    return function(event) {
      var el = DOMElement.wrap(event.target);
      while(el) {
        if (el.is(selector)) {
          handler(new DelegatedEvent(context, event.target, event));
          break
        }
        if (el === top) {
          break
        }
        el = el.parentNode;
      }
    }
  };

  var BrowserDOMElement = (function (DOMElement$$1) {
    function BrowserDOMElement(el) {
      DOMElement$$1.call(this);

      console.assert(el instanceof window.Node, "Expecting native DOM node.");
      this.el = el;
      el._wrapper = this;

      this.eventListeners = [];


      this._changedProperties = new Set();
    }

    if ( DOMElement$$1 ) BrowserDOMElement.__proto__ = DOMElement$$1;
    BrowserDOMElement.prototype = Object.create( DOMElement$$1 && DOMElement$$1.prototype );
    BrowserDOMElement.prototype.constructor = BrowserDOMElement;

    var prototypeAccessors = { childNodes: {},children: {},ownerDocument: {} };

    BrowserDOMElement.prototype.getNativeElement = function getNativeElement () {
      return this.el
    };

    BrowserDOMElement.prototype.hasClass = function hasClass (className) {
      return this.el.classList.contains(className)
    };

    BrowserDOMElement.prototype.addClass = function addClass (className) {
      this.el.classList.add(className);
      return this
    };

    BrowserDOMElement.prototype.removeClass = function removeClass (className) {
      this.el.classList.remove(className);
      return this
    };

    BrowserDOMElement.prototype.getAttribute = function getAttribute (name) {
      return this.el.getAttribute(name)
    };

    BrowserDOMElement.prototype.setAttribute = function setAttribute (name, value) {
      this.el.setAttribute(name, value);
      return this
    };

    BrowserDOMElement.prototype.removeAttribute = function removeAttribute (name) {
      this.el.removeAttribute(name);
      return this
    };

    BrowserDOMElement.prototype.getAttributes = function getAttributes () {
      var result = {};
      var attributes = this.el.attributes;
      var l = attributes.length;
      for(var i=0; i < l; i++) {
        var attr = attributes.item(i);
        result[attr.name] = attr.value;
      }
      return result
    };

    BrowserDOMElement.prototype.getProperties = function getProperties () {
      var this$1 = this;

      var properties = {};
      this._changedProperties.forEach(function (name) {
        properties[name] = this$1.el[name];
      });
      return properties
    };

    BrowserDOMElement.prototype.getProperty = function getProperty (name) {
      return this.el[name]
    };

    BrowserDOMElement.prototype.setProperty = function setProperty (name, value) {
      this._changedProperties.add(name);
      this.el[name] = value;
      return this
    };

    BrowserDOMElement.prototype.removeProperty = function removeProperty (name) {
      this._changedProperties.delete(name);
      delete this.el[name];
      return this
    };

    BrowserDOMElement.prototype.getTagName = function getTagName () {


      if (this._isXML()) {
        return this.el.tagName
      } else if (this.el.tagName) {
        return this.el.tagName.toLowerCase()
      }
    };

    BrowserDOMElement.prototype.setTagName = function setTagName (tagName) {
      var this$1 = this;

      var newEl = this.createElement(tagName);
      var attributes = this.el.attributes;
      var l = attributes.length;
      var i;
      for(i = 0; i < l; i++) {
        var attr = attributes.item(i);
        newEl.setAttribute(attr.name, attr.value);
      }
      this._changedProperties.forEach(function (name){
        newEl[name] = this$1.el[name];
      });
      this.eventListeners.forEach(function(listener) {
        newEl.addEventListener(listener.eventName, listener.handler, listener.capture);
      });

      newEl.append(this.getChildNodes());

      this._replaceNativeEl(newEl.getNativeElement());
      return this
    };

    BrowserDOMElement.prototype.getId = function getId () {
      return this.el.id
    };

    BrowserDOMElement.prototype.setId = function setId (id) {
      this.el.id = id;
      return this
    };

    BrowserDOMElement.prototype.getStyle = function getStyle (name) {

      var style = this.getComputedStyle();
      return style[name] || this.el.style[name]
    };

    BrowserDOMElement.prototype.getComputedStyle = function getComputedStyle () {
      return window.getComputedStyle(this.el)
    };

    BrowserDOMElement.prototype.setStyle = function setStyle (name, value) {
      if (DOMElement$$1.pxStyles[name] && isNumber(value)) { value = value + 'px'; }
      this.el.style[name] = value;
      return this
    };

    BrowserDOMElement.prototype.getTextContent = function getTextContent () {
      return this.el.textContent
    };

    BrowserDOMElement.prototype.setTextContent = function setTextContent (text) {
      this.el.textContent = text;
      return this
    };

    BrowserDOMElement.prototype.getInnerHTML = function getInnerHTML () {
      var innerHTML = this.el.innerHTML;
      if (!isString(innerHTML)) {
        var frag = this.el.ownerDocument.createDocumentFragment();
        for (var c = this.el.firstChild; c; c = c.nextSibling) {
          frag.appendChild(c.cloneNode(true));
        }
        var xs = new window.XMLSerializer();
        innerHTML = xs.serializeToString(frag);
      }
      return innerHTML
    };

    BrowserDOMElement.prototype.setInnerHTML = function setInnerHTML (html) {
      this.el.innerHTML = html;
      return this
    };

    BrowserDOMElement.prototype.getOuterHTML = function getOuterHTML () {
      var outerHTML = this.el.outerHTML;
      if (!isString(outerHTML)) {
        var xs = new window.XMLSerializer();
        outerHTML = xs.serializeToString(this.el);
      }
      return outerHTML
    };

    BrowserDOMElement.prototype.addEventListener = function addEventListener (eventName, handler, options) {
      var listener;
      if (arguments.length === 1 && arguments[0]) {
        listener = arguments[0];
      } else {
        listener = new DOMEventListener(eventName, handler, options);
      }
      if (listener.options.selector && !listener.__hasEventDelegation__) {
        listener.handler = DelegatedEvent.delegatedHandler(listener, this.getNativeElement());
        listener.__hasEventDelegation__ = true;
      }
      this.el.addEventListener(listener.eventName, listener.handler, listener.capture);
      this.eventListeners.push(listener);
      listener._el = this;
      return this
    };

    BrowserDOMElement.prototype.removeEventListener = function removeEventListener (eventName, handler) {

      var listener = null, idx = -1;
      idx = DOMEventListener.findIndex(this.eventListeners, eventName, handler);
      listener = this.eventListeners[idx];
      if (idx > -1) {
        this.eventListeners.splice(idx, 1);

        listener._el = null;
        this.el.removeEventListener(listener.eventName, listener.handler);
      }
      return this
    };

    BrowserDOMElement.prototype.removeAllEventListeners = function removeAllEventListeners () {
      var this$1 = this;

      for (var i = 0; i < this.eventListeners.length; i++) {
        var listener = this$1.eventListeners[i];

        listener._el = null;
        this$1.el.removeEventListener(listener.eventName, listener.handler);
      }
      this.eventListeners = [];
    };

    BrowserDOMElement.prototype.getEventListeners = function getEventListeners () {
      return this.eventListeners
    };

    BrowserDOMElement.prototype.getChildCount = function getChildCount () {
      return this.el.childNodes.length
    };

    BrowserDOMElement.prototype.getChildNodes = function getChildNodes () {
      var childNodes = [];
      for (var node = this.el.firstChild; node; node = node.nextSibling) {
        childNodes.push(BrowserDOMElement.wrapNativeElement(node));
      }
      return childNodes
    };

    prototypeAccessors.childNodes.get = function () {
      return this.getChildNodes()
    };

    BrowserDOMElement.prototype.getChildren = function getChildren () {


      var children = [];
      for (var node = this.el.firstChild; node; node = node.nextSibling) {
        if (node.nodeType === window.Node.ELEMENT_NODE) {
          children.push(BrowserDOMElement.wrapNativeElement(node));
        }
      }
      return children
    };

    prototypeAccessors.children.get = function () {
      return this.getChildren()
    };

    BrowserDOMElement.prototype.getChildAt = function getChildAt (pos) {
      return BrowserDOMElement.wrapNativeElement(this.el.childNodes[pos])
    };

    BrowserDOMElement.prototype.getChildIndex = function getChildIndex (child) {
      if (!child._isBrowserDOMElement) {
        throw new Error('Expecting a BrowserDOMElement instance.')
      }
      return Array.prototype.indexOf.call(this.el.childNodes, child.el)
    };

    BrowserDOMElement.prototype.getFirstChild = function getFirstChild () {
      var firstChild = this.el.firstChild;
      if (firstChild) {
        return BrowserDOMElement.wrapNativeElement(firstChild)
      } else {
        return null
      }
    };

    BrowserDOMElement.prototype.getLastChild = function getLastChild () {
      var lastChild = this.el.lastChild;
      if (lastChild) {
        return BrowserDOMElement.wrapNativeElement(lastChild)
      } else {
        return null
      }
    };

    BrowserDOMElement.prototype.getNextSibling = function getNextSibling () {
      var next = this.el.nextSibling;
      if (next) {
        return BrowserDOMElement.wrapNativeElement(next)
      } else {
        return null
      }
    };

    BrowserDOMElement.prototype.getPreviousSibling = function getPreviousSibling () {
      var previous = this.el.previousSibling;
      if (previous) {
        return BrowserDOMElement.wrapNativeElement(previous)
      } else {
        return null
      }
    };

    BrowserDOMElement.prototype.isTextNode = function isTextNode () {
      return (this.el.nodeType === window.Node.TEXT_NODE)
    };

    BrowserDOMElement.prototype.isElementNode = function isElementNode () {
      return (this.el.nodeType === window.Node.ELEMENT_NODE)
    };

    BrowserDOMElement.prototype.isCommentNode = function isCommentNode () {
      return (this.el.nodeType === window.Node.COMMENT_NODE)
    };

    BrowserDOMElement.prototype.isDocumentNode = function isDocumentNode () {
      return (this.el.nodeType === window.Node.DOCUMENT_NODE)
    };

    BrowserDOMElement.prototype.clone = function clone () {
      var clone = this.el.cloneNode(true);
      return BrowserDOMElement.wrapNativeElement(clone)
    };

    BrowserDOMElement.prototype.createDocument = function createDocument (format) {
      return BrowserDOMElement.createDocument(format)
    };

    BrowserDOMElement.prototype.createElement = function createElement (tagName) {
      var doc = this._getNativeOwnerDocument();
      var el = doc.createElement(tagName);
      return BrowserDOMElement.wrapNativeElement(el)
    };

    BrowserDOMElement.prototype.createTextNode = function createTextNode (text) {
      var doc = this._getNativeOwnerDocument();
      var el = doc.createTextNode(text);
      return BrowserDOMElement.wrapNativeElement(el)
    };

    BrowserDOMElement.prototype.createComment = function createComment (data) {
      var doc = this._getNativeOwnerDocument();
      var el = doc.createComment(data);
      return BrowserDOMElement.wrapNativeElement(el)
    };

    BrowserDOMElement.prototype.createProcessingInstruction = function createProcessingInstruction (name, data) {
      var doc = this._getNativeOwnerDocument();
      var el = doc.createProcessingInstruction(name, data);
      return BrowserDOMElement.wrapNativeElement(el)
    };

    BrowserDOMElement.prototype.createCDATASection = function createCDATASection (data) {
      var doc = this._getNativeOwnerDocument();
      var el = doc.createCDATASection(data);
      return BrowserDOMElement.wrapNativeElement(el)
    };

    BrowserDOMElement.prototype.is = function is (cssSelector) {


      var el = this.el;
      if (this.isElementNode()) {
        return matches(el, cssSelector)
      } else {
        return false
      }
    };

    BrowserDOMElement.prototype.getParent = function getParent () {
      var parent = this.el.parentNode;
      if (parent) {
        return BrowserDOMElement.wrapNativeElement(parent)
      } else {
        return null
      }
    };

    BrowserDOMElement.prototype.getRoot = function getRoot () {
      var el = this.el;
      var parent = el;
      while (parent) {
        el = parent;
        parent = el.parentNode;
      }
      return BrowserDOMElement.wrapNativeElement(el)
    };

    BrowserDOMElement.prototype.getOwnerDocument = function getOwnerDocument () {
      return BrowserDOMElement.wrapNativeElement(this._getNativeOwnerDocument())
    };

    prototypeAccessors.ownerDocument.get = function () {
      return this.getOwnerDocument()
    };

    BrowserDOMElement.prototype._getNativeOwnerDocument = function _getNativeOwnerDocument () {
      return (this.isDocumentNode() ? this.el : this.el.ownerDocument)
    };

    BrowserDOMElement.prototype.find = function find (cssSelector) {
      var result = null;
      if (this.el.querySelector) {
        result = this.el.querySelector(cssSelector);
      }
      if (result) {
        return BrowserDOMElement.wrapNativeElement(result)
      } else {
        return null
      }
    };

    BrowserDOMElement.prototype.findAll = function findAll (cssSelector) {
      var result = [];
      if (this.el.querySelectorAll) {
        result = this.el.querySelectorAll(cssSelector);
      }
      return Array.prototype.map.call(result, function(el) {
        return BrowserDOMElement.wrapNativeElement(el)
      })
    };

    BrowserDOMElement.prototype._normalizeChild = function _normalizeChild (child) {
      if (child instanceof window.Node) {
        if (!child._wrapper) {
          child = BrowserDOMElement.wrapNativeElement(child);
        } else {
          return child
        }
      }
      if (isString(child) || isNumber(child)) {
        child = this.createTextNode(child);
      }
      if (!child || !child._isBrowserDOMElement) {
        throw new Error('Illegal child type.')
      }



      if (!child.el._wrapper) {
        child.el._wrapper = child;
      }
      console.assert(child.el._wrapper === child, "The backlink to the wrapper should be consistent");
      return child.getNativeElement()
    };

    BrowserDOMElement.prototype.appendChild = function appendChild (child) {
      var nativeChild = this._normalizeChild(child);
      this.el.appendChild(nativeChild);
      return this
    };

    BrowserDOMElement.prototype.insertAt = function insertAt (pos, child) {
      var nativeChild = this._normalizeChild(child);
      var childNodes = this.el.childNodes;
      if (pos >= childNodes.length) {
        this.el.appendChild(nativeChild);
      } else {
        this.el.insertBefore(nativeChild, childNodes[pos]);
      }
      return this
    };

    BrowserDOMElement.prototype.insertBefore = function insertBefore (child, before) {
      if (!before || !before._isBrowserDOMElement) {
        throw new Error('insertBefore(): Illegal arguments. "before" must be a BrowserDOMElement instance.')
      }
      var nativeChild = this._normalizeChild(child);
      this.el.insertBefore(nativeChild, before.el);
      return this
    };

    BrowserDOMElement.prototype.removeAt = function removeAt (pos) {
      this.el.removeChild(this.el.childNodes[pos]);
      return this;
    };

    BrowserDOMElement.prototype.removeChild = function removeChild (child) {
      if (!child || !child._isBrowserDOMElement) {
        throw new Error('removeChild(): Illegal arguments. Expecting a BrowserDOMElement instance.')
      }
      this.el.removeChild(child.el);
      return this
    };

    BrowserDOMElement.prototype.replaceChild = function replaceChild (oldChild, newChild) {
      if (!newChild || !oldChild ||
          !newChild._isBrowserDOMElement || !oldChild._isBrowserDOMElement) {
        throw new Error('replaceChild(): Illegal arguments. Expecting BrowserDOMElement instances.')
      }

      this.el.replaceChild(newChild.el, oldChild.el);
      return this
    };

    BrowserDOMElement.prototype.empty = function empty () {


      var el = this.el;
      while (el.lastChild) {
        el.removeChild(el.lastChild);
      }
      return this
    };

    BrowserDOMElement.prototype.remove = function remove () {
      if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
      return this
    };

    BrowserDOMElement.prototype.serialize = function serialize () {
      var outerHTML = this.el.outerHTML;
      if (isString(outerHTML)) {
        return outerHTML
      } else {
        var xs = new window.XMLSerializer();
        return xs.serializeToString(this.el)
      }
    };

    BrowserDOMElement.prototype.isInDocument = function isInDocument () {
      var el = this.el;
      while(el) {
        if (el.nodeType === window.Node.DOCUMENT_NODE) {
          return true
        }
        el = el.parentNode;
      }
    };

    BrowserDOMElement.prototype._replaceNativeEl = function _replaceNativeEl (newEl) {
      console.assert(newEl instanceof window.Node, "Expecting a native element.");
      var oldEl = this.el;
      var parentNode = oldEl.parentNode;
      if (parentNode) {
        parentNode.replaceChild(newEl, oldEl);
      }
      this.el = newEl;

      this.el._wrapper = this;
    };

    BrowserDOMElement.prototype._getChildNodeCount = function _getChildNodeCount () {
      return this.el.childNodes.length
    };

    BrowserDOMElement.prototype.focus = function focus () {
      this.el.focus();
      return this
    };

    BrowserDOMElement.prototype.blur = function blur () {
      this.el.focus();
      return this
    };

    BrowserDOMElement.prototype.click = function click () {
      this.el.click();
      return this
    };

    BrowserDOMElement.prototype.getWidth = function getWidth () {
      var rect = this.el.getClientRects()[0];
      if (rect) {
        return rect.width
      } else {
        return 0
      }
    };

    BrowserDOMElement.prototype.getHeight = function getHeight () {
      var rect = this.el.getClientRects()[0];
      if (rect) {
        return rect.height
      } else {
        return 0
      }
    };

    BrowserDOMElement.prototype.getOffset = function getOffset () {
      var rect = this.el.getBoundingClientRect();
      return {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft
      }
    };

    BrowserDOMElement.prototype.getPosition = function getPosition () {
      return {left: this.el.offsetLeft, top: this.el.offsetTop}
    };

    BrowserDOMElement.prototype.getOuterHeight = function getOuterHeight (withMargin) {
      var outerHeight = this.el.offsetHeight;
      if (withMargin) {
        var style = this.getComputedStyle();
        outerHeight += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
      }
      return outerHeight
    };

    BrowserDOMElement.prototype._isXML = function _isXML () {
      return this._getNativeOwnerDocument().contentType === 'application/xml'
    };

    Object.defineProperties( BrowserDOMElement.prototype, prototypeAccessors );

    return BrowserDOMElement;
  }(DOMElement));

  BrowserDOMElement.prototype._isBrowserDOMElement = true;


  BrowserDOMElement.createDocument = function(format) {
    var doc;
    if (format === 'xml') {

      doc = window.document.implementation.createDocument(null, 'dummy');

      doc.removeChild(doc.firstChild);
    } else {
      doc = (new window.DOMParser()).parseFromString(DOMElement.EMPTY_HTML, 'text/html');
    }
    return BrowserDOMElement.wrapNativeElement(doc)
  };

  BrowserDOMElement.createElement = function(tagName) {
    return BrowserDOMElement.wrapNativeElement(
        window.document.createElement(tagName)
    )
  };

  BrowserDOMElement.createTextNode = function(text) {
    return BrowserDOMElement.wrapNativeElement(
        window.document.createTextNode(text)
    )
  };

  BrowserDOMElement.parseMarkup = function(str, format, isFullDoc) {
    var nativeEls = [];
    var doc;
    if (!str) {
      return BrowserDOMElement.createDocument(format)
    } else {
      var parser = new window.DOMParser();
      if (format === 'html') {
        isFullDoc = (str.search(/<\s*html/i)>=0);
        doc = parser.parseFromString(str, 'text/html');
      } else if (format === 'xml') {
        doc = parser.parseFromString(str, 'text/xml');
      }
      if (doc) {
        var parserError = doc.querySelector('parsererror');
        if (parserError) {
          throw new Error("ParserError: could not parse " + str)
        }
        if (format === 'html') {
          if (isFullDoc) {
            nativeEls = [doc.querySelector('html')];
          } else {



            var body = doc.querySelector('body');
            nativeEls = body.childNodes;
          }
        } else if (format === 'xml') {
          if (isFullDoc) {
            nativeEls = [doc];
          } else {
            nativeEls = doc.childNodes;
          }
        }
      } else {
        throw new Error('Could not parse DOM string.')
      }
    }
    var elements = Array.prototype.map.call(nativeEls, function(el) {
      return new BrowserDOMElement(el)
    });
    if (elements.length === 1) {
      return elements[0]
    } else {
      return elements
    }
  };

  BrowserDOMElement.parseHTML = function(html, isFullDoc) {
    return BrowserDOMElement.parseMarkup(html, 'html', isFullDoc)
  };

  BrowserDOMElement.parseXML = function(html, isFullDoc) {
    return BrowserDOMElement.parseMarkup(html, 'xml', isFullDoc)
  };

  var BrowserTextNode = (function (BrowserDOMElement) {
    function BrowserTextNode(nativeEl) {
      BrowserDOMElement.call(this, nativeEl);
      if (!(nativeEl instanceof window.Node) || nativeEl.nodeType !== 3) {
        throw new Error("Expecting native TextNode.")
      }
    }

    if ( BrowserDOMElement ) BrowserTextNode.__proto__ = BrowserDOMElement;
    BrowserTextNode.prototype = Object.create( BrowserDOMElement && BrowserDOMElement.prototype );
    BrowserTextNode.prototype.constructor = BrowserTextNode;
    BrowserTextNode.prototype.getNodeType = function getNodeType () { return 'text' };

    return BrowserTextNode;
  }(BrowserDOMElement));

  BrowserDOMElement.wrapNativeElement = function(el) {
    if (el) {
      if (el._wrapper) {
        return el._wrapper
      } else if (el instanceof window.Node) {
        if (el.nodeType === 3) {
          return new BrowserTextNode(el)
        } else {
          return new BrowserDOMElement(el)
        }
      } else if (el === window) {
        return BrowserDOMElement.getBrowserWindow()
      }
    } else {
      return null
    }
  };


  var BrowserWindow = function BrowserWindow() {

    this.el = window;
    window.__BrowserDOMElementWrapper__ = this;
    this.eventListeners = [];
  };

  BrowserWindow.prototype.on = BrowserDOMElement.prototype.on;

  BrowserWindow.prototype.off = BrowserDOMElement.prototype.off;

  BrowserWindow.prototype.addEventListener = BrowserDOMElement.prototype.addEventListener;

  BrowserWindow.prototype.removeEventListener = BrowserDOMElement.prototype.removeEventListener;

  BrowserWindow.prototype.getEventListeners = BrowserDOMElement.prototype.getEventListeners;

  BrowserDOMElement.getBrowserWindow = function() {
    if (window.__BrowserDOMElementWrapper__) { return window.__BrowserDOMElementWrapper__ }
    return new BrowserWindow(window)
  };

  BrowserDOMElement.isReverse = function(anchorNode, anchorOffset, focusNode, focusOffset) {


    if (focusNode && anchorNode) {
      if (!BrowserDOMElement.isReverse._r1) {
        BrowserDOMElement.isReverse._r1 = window.document.createRange();
        BrowserDOMElement.isReverse._r2 = window.document.createRange();
      }
      var _r1 = BrowserDOMElement.isReverse._r1;
      var _r2 = BrowserDOMElement.isReverse._r2;
      _r1.setStart(anchorNode.getNativeElement(), anchorOffset);
      _r2.setStart(focusNode.getNativeElement(), focusOffset);
      var cmp = _r1.compareBoundaryPoints(window.Range.START_TO_START, _r2);
      if (cmp === 1) {
        return true
      }
    }
    return false
  };

  BrowserDOMElement.getWindowSelection = function() {
    var nativeSel = window.getSelection();
    var result = {
      anchorNode: BrowserDOMElement.wrapNativeElement(nativeSel.anchorNode),
      anchorOffset: nativeSel.anchorOffset,
      focusNode: BrowserDOMElement.wrapNativeElement(nativeSel.focusNode),
      focusOffset: nativeSel.focusOffset
    };
    return result
  };

  function matches(el, selector) {
    var elProto = window.Element.prototype;
    var _matches = (
        elProto.matches || elProto.matchesSelector ||
        elProto.msMatchesSelector || elProto.webkitMatchesSelector
    );
    return _matches.call(el, selector)
  }

  var XNode = {};

  var DefaultDOMElementClass = inBrowser ? BrowserDOMElement : XNode;


  var DefaultDOMElement = {};

  DefaultDOMElement.createDocument = function(format) {
    return DefaultDOMElement._impl.createDocument(format)
  };

  DefaultDOMElement.createElement = function(tagName) {
    return DefaultDOMElement._impl.createElement(tagName)
  };

  DefaultDOMElement.createTextNode = function(text) {
    return DefaultDOMElement._impl.createTextNode(text)
  };


  DefaultDOMElement.getBrowserWindow = function() {
    return DefaultDOMElement._impl.getBrowserWindow()
  };


  DefaultDOMElement.parseHTML = function(html) {
    return DefaultDOMElement._impl.parseHTML(html)
  };


  DefaultDOMElement.parseXML = function(xml, fullDoc) {
    return DefaultDOMElement._impl.parseXML(xml, fullDoc)
  };

  DefaultDOMElement.wrap =
      DefaultDOMElement.wrapNativeElement = function(el) {
        if (!el) { throw new Error('Illegal argument') }

        if (el._isXNode) { return el }
        else { return DefaultDOMElement._impl.wrapNativeElement(el) }
      };

  DefaultDOMElement.isReverse = function(anchorNode, anchorOffset, focusNode, focusOffset) {
    return DefaultDOMElement._impl.isReverse(anchorNode, anchorOffset, focusNode, focusOffset)
  };

  DefaultDOMElement._impl = DefaultDOMElementClass;

  DefaultDOMElement._reset = function() {
    DefaultDOMElement._impl = DefaultDOMElementClass;
  };

  DefaultDOMElement._useXNode = function() {
    DefaultDOMElement._impl = XNode;
  };

  var RenderingEngine = function RenderingEngine(options) {
    if ( options === void 0 ) options = {};

    this.elementFactory = options.elementFactory || DefaultDOMElement.createDocument('html');
  };

  RenderingEngine.prototype._render = function _render$1 (comp, oldProps, oldState) {

    var vel = _createWrappingVirtualComponent(comp);
    var state = new RenderingEngine.State(this.elementFactory);
    if (oldProps) {
      state.setOldProps(vel, oldProps);
    }
    if (oldState) {
      state.setOldState(vel, oldState);
    }
    try {
      _capture(state, vel, 'forceCapture');
      if (vel._isVirtualComponent) {
        _render(state, vel._content);
      } else {
        _render(state, vel);
      }
      _triggerUpdate(state, vel);
    } finally {
      state.dispose();
    }

  };


  RenderingEngine.prototype._renderChild = function _renderChild (comp, vel) {


    var state = new RenderingEngine.State(this.elementFactory);
    vel.parent = { _comp: comp };
    try {
      _capture(state, vel);
      _render(state, vel);
      return vel._comp;
    } finally {
      state.dispose();
    }
  };


  function _create(state, vel) {
    var comp = vel._comp;
    console.assert(!comp, "Component instance should not exist when this method is used.");
    var parent = vel.parent._comp;

    if (!parent) {
      parent = _create(state, vel.parent);
    }
    if (vel._isVirtualComponent) {
      console.assert(parent, "A Component should have a parent.");
      comp = new vel.ComponentClass(parent, vel.props);

      vel.props = comp.props;
      comp.__htmlConfig__ = vel._copyHTMLConfig();
    } else if (vel._isVirtualHTMLElement) {
      comp = new Component.Element(parent, vel);
    } else if (vel._isVirtualTextNode) {
      comp = new Component.TextNode(parent, vel);
    }
    if (vel._ref) {
      comp._ref = vel._ref;
    }
    if (vel._owner) {
      comp._owner = vel._owner._comp;
    }
    vel._comp = comp;
    return comp;
  }

  function _capture(state, vel, forceCapture) {
    if (state.isCaptured(vel)) {
      return vel;
    }

    var comp = vel._comp;
    if (!comp) {
      comp = _create(state, vel);
      state.setNew(vel);
    }
    if (vel._isVirtualComponent) {
      var needRerender;



      if (forceCapture) {
        needRerender = true;
      } else {

        needRerender = !comp.el || comp.shouldRerender(vel.props, comp.state);
        comp.__htmlConfig__ = vel._copyHTMLConfig();
        state.setOldProps(vel, comp.props);
        state.setOldState(vel, comp.state);

        comp._setProps(vel.props);
        if (!state.isNew(vel)) {
          state.setUpdated(vel);
        }
      }
      if (needRerender) {
        var context = new CaptureContext(vel);
        var content = comp.render(context.$$);
        if (!content || !content._isVirtualHTMLElement) {
          throw new Error("Component.render must return VirtualHTMLElement");
        }

        if (comp.__htmlConfig__) {
          content._mergeHTMLConfig(comp.__htmlConfig__);
        }
        content._comp = comp;
        vel._content = content;
        if (!state.isNew(vel) && comp.isMounted()) {
          state.setUpdated(vel);
        }

        _prepareVirtualComponent(state, comp, content);


        if (substanceGlobals.DEBUG_RENDERING) {




          var stack = content.children.slice(0);
          while (stack.length) {
            var child = stack.shift();
            if (state.isCaptured(child)) { continue }

            if (child._isVirtualComponent) { continue }
            if (!child._comp) {
              _create(state, child);
            }
            if (child._isVirtualHTMLElement && child.children.length > 0) {
              stack = stack.concat(child.children);
            }
            state.setCaptured(child);
          }
          state.setCaptured(content);


          var descendingContext = new DescendingContext(state, context);
          while (descendingContext.hasPendingCaptures()) {
            descendingContext.reset();
            comp.render(descendingContext.$$);
          }
        } else {


          _capture(state, vel._content);
        }
      } else {
        state.setSkipped(vel);
      }
    } else if (vel._isVirtualHTMLElement) {
      for (var i = 0; i < vel.children.length; i++) {
        _capture(state, vel.children[i]);
      }
    }
    state.setCaptured(vel);
    return vel;
  }

  function _render(state, vel) {
    if (state.isSkipped(vel)) { return; }








    var comp = vel._comp;
    console.assert(comp && comp._isComponent, "A captured VirtualElement must have a component instance attached.");


    if (vel._isVirtualComponent) {
      _render(state, vel._content);
      return;
    }

    if (!comp.el) {
      comp.el = _createElement(state, vel);
      comp.el._comp = comp;
    }
    _updateElement(comp, vel);


    if (vel._isVirtualHTMLElement && !vel.hasInnerHTML()) {
      var newChildren = vel.children;
      var oldComp, virtualComp, newComp;
      var pos1 = 0; var pos2 = 0;




      var oldChildren = [];
      comp.el.getChildNodes().forEach(function(node) {
        var childComp = node._comp;







        if (!childComp || state.isRelocated(childComp)) {
          comp.el.removeChild(node);
        } else {
          oldChildren.push(childComp);
        }
      });

      while(pos1 < oldChildren.length || pos2 < newChildren.length) {




        do {
          oldComp = oldChildren[pos1++];
        } while (oldComp && (state.isDetached(oldComp)));

        virtualComp = newChildren[pos2++];

        if (oldComp && !virtualComp) {
          while (oldComp) {
            _removeChild(state, comp, oldComp);
            oldComp = oldChildren[pos1++];
          }
          break;
        }


        if (oldComp && oldComp.el.isTextNode() &&
            virtualComp && virtualComp._isVirtualTextNode &&
            oldComp.el.textContent === virtualComp.text ) {
          continue;
        }

        if (!state.isRendered(virtualComp)) {
          _render(state, virtualComp);
        }

        newComp = virtualComp._comp;


        if (state.isRelocated(newComp)) {
          newComp._setParent(comp);
        }

        console.assert(newComp, 'Component instance should now be available.');

        if (virtualComp && !oldComp) {
          _appendChild(state, comp, newComp);
          continue;
        }

        else if (state.isMapped(virtualComp)) {

          if (newComp === oldComp) {

          } else {

            state.setDetached(oldComp);
            _removeChild(state, comp, oldComp);
            pos2--;
          }
        }
        else if (state.isMapped(oldComp)) {
          _insertChildBefore(state, comp, newComp, oldComp);
          pos1--;
        } else {




          _replaceChild(state, comp, oldComp, newComp);
        }
      }
    }




    var refs = {};
    var foreignRefs = {};
    if (vel._context) {
      forEach(vel._context.refs, function(vel, ref) {
        refs[ref] = vel._comp;
      });
      forEach(vel._context.foreignRefs, function(vel, ref) {
        foreignRefs[ref] = vel._comp;
      });
    }
    comp.refs = refs;
    comp.__foreignRefs__ = foreignRefs;

    state.setRendered(vel);
  }

  function _triggerUpdate(state, vel) {
    if (vel._isVirtualComponent) {
      if (!state.isSkipped(vel)) {
        vel._content.children.forEach(_triggerUpdate.bind(null, state));
      }
      if (state.isUpdated(vel)) {
        vel._comp.didUpdate(state.getOldProps(vel), state.getOldState(vel));
      }
    } else if (vel._isVirtualHTMLElement) {
      vel.children.forEach(_triggerUpdate.bind(null, state));
    }
  }

  function _appendChild(state, parent, child) {
    parent.el.appendChild(child.el);
    _triggerDidMount(state, parent, child);
  }

  function _replaceChild(state, parent, oldChild, newChild) {
    parent.el.replaceChild(oldChild.el, newChild.el);
    if (!state.isDetached(oldChild)) {
      oldChild.triggerDispose();
    }
    _triggerDidMount(state, parent, newChild);
  }

  function _insertChildBefore(state, parent, child, before) {
    parent.el.insertBefore(child.el, before.el);
    _triggerDidMount(state, parent, child);
  }

  function _removeChild(state, parent, child) {
    parent.el.removeChild(child.el);
    if (!state.isDetached(child)) {
      child.triggerDispose();
    }
  }

  function _triggerDidMount(state, parent, child) {
    if (!state.isDetached(child) &&
        parent.isMounted() && !child.isMounted()) {
      child.triggerDidMount(true);
    }
  }


  function _prepareVirtualComponent(state, comp, vc) {
    var newRefs = {};
    var foreignRefs = {};




    if (vc._context) {
      newRefs = vc._context.refs;
      foreignRefs = vc._context.foreignRefs;
    }
    var oldRefs = comp.refs;
    var oldForeignRefs = comp.__foreignRefs__;

    forEach(newRefs, function(vc, ref) {
      var comp = oldRefs[ref];
      if (comp) { _mapComponents(state, comp, vc); }
    });
    forEach(foreignRefs, function(vc, ref) {
      var comp = oldForeignRefs[ref];
      if (comp) { _mapComponents(state, comp, vc); }
    });
  }



  function _mapComponents(state, comp, vc) {
    if (!comp && !vc) { return true; }
    if (!comp || !vc) { return false; }





    if (state.isMapped(vc) || state.isMapped(comp)) {
      return vc._comp === comp;
    }
    if (vc._comp) {
      if (vc._comp === comp) {
        state.setMapped(vc);
        state.setMapped(comp);
        return true;
      } else {
        return false;
      }
    }
    if (!_isOfSameType(comp, vc)) {
      return false;
    }

    vc._comp = comp;
    state.setMapped(vc);
    state.setMapped(comp);

    var canMapParent;
    var parent = comp.getParent();
    if (vc.parent) {
      canMapParent = _mapComponents(state, parent, vc.parent);
    }




    else if (vc._preliminaryParent) {
      while (parent && parent._isElementComponent) {
        parent = parent.getParent();
      }
      canMapParent = _mapComponents(state, parent, vc._preliminaryParent);
    }
    if (!canMapParent) {
      state.setRelocated(vc);
      state.setRelocated(comp);
    }
    return canMapParent;
  }

  function _isOfSameType(comp, vc) {
    return (
        (comp._isElementComponent && vc._isVirtualHTMLElement) ||
        (comp._isComponent && vc._isVirtualComponent && comp.constructor === vc.ComponentClass) ||
        (comp._isTextNodeComponent && vc._isVirtualTextNode)
    );
  }

  function _createElement(state, vel) {
    var el;
    if (vel._isVirtualTextNode) {
      el = state.elementFactory.createTextNode(vel.text);
    } else {
      el = state.elementFactory.createElement(vel.tagName);
    }
    return el;
  }

  function _updateElement(comp, vel) {
    if (comp._isTextNodeComponent) {
      comp.setTextContent(vel.text);
      return;
    }
    var el = comp.el;
    console.assert(el, "Component's element should exist at this point.");
    var tagName = el.getTagName();
    if (vel.tagName.toLowerCase() !== tagName) {
      el.setTagName(vel.tagName);
    }
    _updateHash({
      oldHash: el.getAttributes(),
      newHash: vel.getAttributes(),
      update: function(key, val) {
        el.setAttribute(key, val);
      },
      remove: function(key) {
        el.removeAttribute(key);
      }
    });
    _updateHash({
      oldHash: el.htmlProps,
      newHash: vel.htmlProps,
      update: function(key, val) {
        el.setProperty(key, val);
      },
      remove: function(key) {
        el.removeProperty(key);
      }
    });
    _updateListeners({
      el: el,
      oldListeners: el.getEventListeners(),
      newListeners: vel.getEventListeners()
    });


    if (vel.hasInnerHTML()) {
      if (!el._hasInnerHTML) {
        el.empty();
        el.setInnerHTML(vel.getInnerHTML());
      } else {
        var oldInnerHTML = el.getInnerHTML();
        var newInnerHTML = vel.getInnerHTML();
        if (oldInnerHTML !== newInnerHTML) {
          el.setInnerHTML(newInnerHTML);
        }
      }
      el._hasInnerHTML = true;
    }
  }

  function _updateHash(args) {
    var newHash = args.newHash;
    var oldHash = args.oldHash || {};
    var updatedKeys = {};
    var update = args.update;
    var remove = args.remove;
    var key;
    for (key in newHash) {
      if (newHash.hasOwnProperty(key)) {
        var oldVal = oldHash[key];
        var newVal = newHash[key];
        updatedKeys[key] = true;
        if (oldVal !== newVal) {
          update(key, newVal);
        }
      }
    }
    for (key in oldHash) {
      if (oldHash.hasOwnProperty(key) && !updatedKeys[key]) {
        remove(key);
      }
    }
  }

  function _updateListeners(args) {
    var el = args.el;



    var newListeners = args.newListeners || [];
    el.removeAllEventListeners();
    for (var i=0; i<newListeners.length;i++) {
      el.addEventListener(newListeners[i]);
    }
  }




  var DescendingContext = function DescendingContext(state, captureContext) {
    this.state = state;
    this.owner = captureContext.owner;
    this.refs = {};
    this.foreignRefs = {};
    this.elements = captureContext.elements;
    this.pos = 0;
    this.updates = captureContext.components.length;
    this.remaining = this.updates;

    this.$$ = this._createComponent.bind(this);
  };

  DescendingContext.prototype._createComponent = function _createComponent () {
    var state = this.state;
    var vel = this.elements[this.pos++];



    if (!state.isCaptured(vel) && vel._isVirtualComponent &&
        vel.parent && state.isCaptured(vel.parent)) {
      _capture(state, vel);
      this.updates++;
      this.remaining--;
    }




    vel = VirtualElement.createElement.apply(this, arguments);

    vel._context = this;
    vel._owner = this.owner;


    vel._attach = function() {};
    vel._detach = function() {};
    return vel;
  };

  DescendingContext.prototype.hasPendingCaptures = function hasPendingCaptures () {
    return this.updates > 0 && this.remaining > 0;
  };

  DescendingContext.prototype.reset = function reset () {
    this.pos = 0;
    this.updates = 0;
    this.refs = {};
  };

  DescendingContext.prototype._ancestorsReady = function _ancestorsReady (vel) {
    var this$1 = this;

    while (vel) {
      if (this$1.state.isCaptured(vel) ||

          vel === this$1.owner || vel === this$1.owner._content) {
        return true;
      }
      vel = vel.parent;
    }
    return false;
  };

  RenderingEngine._internal = {
    _capture: _capture,
    _wrap: _createWrappingVirtualComponent,
  };

  var CaptureContext = function CaptureContext(owner) {
    this.owner = owner;
    this.refs = {};
    this.foreignRefs = {};
    this.elements = [];
    this.components = [];
    this.$$ = this._createComponent.bind(this);
    this.$$.capturing = true;
  };

  CaptureContext.prototype._createComponent = function _createComponent () {
    var vel = VirtualElement.createElement.apply(this, arguments);
    vel._context = this;
    vel._owner = this.owner;
    if (vel._isVirtualComponent) {

      this.components.push(vel);
    }
    this.elements.push(vel);
    return vel;
  };


  function _createWrappingVirtualComponent(comp) {
    var vel = new VirtualElement.Component(comp.constructor);
    vel._comp = comp;
    if (comp.__htmlConfig__) {
      vel._mergeHTMLConfig(comp.__htmlConfig__);
    }
    return vel;
  }

  RenderingEngine.createContext = function(comp) {
    var vel = _createWrappingVirtualComponent(comp);
    return new CaptureContext(vel);
  };


  var RenderingState = function RenderingState(elementFactory) {
    this.elementFactory = elementFactory;
    this.poluted = [];
    this.id = "__"+uuid();
  };

  RenderingState.prototype.dispose = function dispose () {
    var id = this.id;
    this.poluted.forEach(function(obj) {
      delete obj[id];
    });
  };

  RenderingState.prototype.set = function set (obj, key, val) {
    var info = obj[this.id];
    if (!info) {
      info = {};
      obj[this.id] = info;
      this.poluted.push(obj);
    }
    info[key] = val;
  };

  RenderingState.prototype.get = function get (obj, key) {
    var info = obj[this.id];
    if (info) {
      return info[key];
    }
  };

  RenderingState.prototype.setMapped = function setMapped (c) {
    this.set(c, 'mapped', true);
  };


  RenderingState.prototype.isMapped = function isMapped (c) {
    return Boolean(this.get(c, 'mapped'));
  };

  RenderingState.prototype.setRelocated = function setRelocated (c) {
    this.set(c, 'relocated', true);
  };

  RenderingState.prototype.isRelocated = function isRelocated (c) {
    return Boolean(this.get(c, 'relocated'));
  };

  RenderingState.prototype.setDetached = function setDetached (c) {
    this.set(c, 'detached', true);
  };

  RenderingState.prototype.isDetached = function isDetached (c) {
    return Boolean(this.get(c, 'detached'));
  };

  RenderingState.prototype.setCaptured = function setCaptured (vc) {
    this.set(vc, 'captured', true);
  };

  RenderingState.prototype.isCaptured = function isCaptured (vc) {
    return Boolean(this.get(vc, 'captured'));
  };

  RenderingState.prototype.setNew = function setNew (vc) {
    this.set(vc, 'created', true);
  };

  RenderingState.prototype.isNew = function isNew (vc) {
    return Boolean(this.get(vc, 'created'));
  };

  RenderingState.prototype.setUpdated = function setUpdated (vc) {
    this.set(vc, 'updated', true);
  };

  RenderingState.prototype.isUpdated = function isUpdated (vc) {
    return Boolean(this.get(vc, 'updated'));
  };

  RenderingState.prototype.setSkipped = function setSkipped (vc) {
    this.set(vc, 'skipped', true);
  };

  RenderingState.prototype.isSkipped = function isSkipped (vc) {
    return Boolean(this.get(vc, 'skipped'));
  };

  RenderingState.prototype.setRendered = function setRendered (vc) {
    this.set(vc, 'rendered', true);
  };

  RenderingState.prototype.isRendered = function isRendered (vc) {
    return Boolean(this.get(vc, 'rendered'));
  };

  RenderingState.prototype.setOldProps = function setOldProps (vc, oldProps) {
    this.set(vc, 'oldProps', oldProps);
  };

  RenderingState.prototype.getOldProps = function getOldProps (vc) {
    return this.get(vc, 'oldProps');
  };

  RenderingState.prototype.setOldState = function setOldState (vc, oldState) {
    this.set(vc, 'oldState', oldState);
  };

  RenderingState.prototype.getOldState = function getOldState (vc) {
    return this.get(vc, 'oldState');
  };

  RenderingEngine.State = RenderingState;

  var Component = (function (EventEmitter$$1) {
    function Component(parent, props, options) {
      if ( props === void 0 ) props = {};
      if ( options === void 0 ) options = {};

      EventEmitter$$1.call(this);







      this.parent = (parent && parent._isComponent) ? parent : null;


      this.el = options.el;



      var context = options.context ? options.context : this._getContext() || {};
      this.context = context;
      Object.freeze(this.context);




      this.renderingEngine = (parent && parent.renderingEngine) || context.renderingEngine || options.renderingEngine || new RenderingEngine();



      if (this._SKIP_COMPONENT_INIT) { return }

      this.__id__ = uuid();


      this.refs = {};



      this.__foreignRefs__ = {};


      this._actionHandlers = {};


      this.props = props;
      Object.freeze(this.props);


      this.state = this.getInitialState() || {};
      Object.freeze(this.state);
    }

    if ( EventEmitter$$1 ) Component.__proto__ = EventEmitter$$1;
    Component.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    Component.prototype.constructor = Component;

    var prototypeAccessors = { textContent: {},innerHTML: {},outerHTML: {},childNodes: {} };

    Component.prototype.getId = function getId () {
      return this.__id__
    };

    Component.prototype.setId = function setId () {
      throw new Error("'id' is readonly")
    };


    Component.prototype.getChildContext = function getChildContext () {
      return this.childContext || {}
    };


    Component.prototype.getInitialState = function getInitialState () {
      return {}
    };


    Component.prototype.getParent = function getParent () {
      return this.parent
    };


    Component.prototype.getRoot = function getRoot () {
      var comp = this;
      var parent = comp;
      while (parent) {
        comp = parent;
        parent = comp.getParent();
      }
      return comp
    };

    Component.prototype.getNativeElement = function getNativeElement () {
      return this.el.getNativeElement()
    };


    Component.prototype.getLabel = function getLabel (name) {
      var labelProvider = this.context.labelProvider;
      if (!labelProvider) { throw new Error('Missing labelProvider.') }
      return labelProvider.getLabel(name)
    };


    Component.prototype.getComponent = function getComponent (componentName, maybe) {
      var componentRegistry = this.getComponentRegistry();
      if (!componentRegistry) { throw new Error('Missing componentRegistry.') }
      var ComponentClass = componentRegistry.get(componentName);
      if (!maybe && !ComponentClass) {
        throw new Error('No Component registered with name ' + componentName)
      }
      return ComponentClass
    };

    Component.prototype.getComponentRegistry = function getComponentRegistry () {
      return this.props.componentRegistry || this.context.componentRegistry
    };

    Component.prototype.getFlow = function getFlow () {
      return this.context.flow
    };


    Component.prototype.render = function render ($$) {

      return $$('div')
    };


    Component.prototype.mount = function mount (el) {
      if (!el) {
        throw new Error('Element is required.')
      }
      if (!el._isDOMElement) {
        el = DefaultDOMElement.wrapNativeElement(el);
      }

      this.el = null;
      this.renderingEngine = new RenderingEngine({ elementFactory: el.getOwnerDocument() });
      this._render();
      el.appendChild(this.el);
      if (el.isInDocument()) {
        this.triggerDidMount(true);
      }
      return this
    };


    Component.prototype.shouldRerender = function shouldRerender (newProps, newState) {
      return true
    };


    Component.prototype.rerender = function rerender () {
      this._rerender(this.props, this.state);
    };

    Component.prototype._rerender = function _rerender (oldProps, oldState) {
      this._render(oldProps, oldState);

      if (!this.isMounted()) {
        this.didUpdate(oldProps, oldState);
      }
    };

    Component.prototype._render = function _render (oldProps, oldState) {
      if (this.__isRendering__) {
        throw new Error('Component is rendering already.')
      }
      this.__isRendering__ = true;
      try {
        this.renderingEngine._render(this, oldProps, oldState);
      } finally {
        delete this.__isRendering__;
      }
    };


    Component.prototype.triggerDidMount = function triggerDidMount () {

      this.getChildren().forEach(function(child) {


        child.triggerDidMount(true);
      });


      if (!this.__isMounted__) {
        this.__isMounted__ = true;
        this.didMount();
      }
    };


    Component.prototype.didMount = function didMount () {};


    Component.prototype.didUpdate = function didUpdate () {};


    Component.prototype.isMounted = function isMounted () {
      return this.__isMounted__
    };


    Component.prototype.triggerDispose = function triggerDispose () {
      this.getChildren().forEach(function(child) {
        child.triggerDispose();
      });
      this.dispose();
      this.__isMounted__ = false;
    };


    Component.prototype.dispose = function dispose () {};


    Component.prototype._setParent = function _setParent (newParent) {
      this.parent = newParent;
      this.context = this._getContext() || {};
      Object.freeze(this.context);
    };


    Component.prototype.send = function send (action) {
      var arguments$1 = arguments;

      var comp = this;
      while(comp) {
        if (comp._actionHandlers && comp._actionHandlers[action]) {
          comp._actionHandlers[action].apply(comp, Array.prototype.slice.call(arguments$1, 1));
          return true
        }
        comp = comp.getParent();
      }
      console.warn('Action', action, 'was not handled.');
      return false
    };


    Component.prototype.handleActions = function handleActions (actionHandlers) {
      forEach(actionHandlers, function(method, actionName) {
        this.handleAction(actionName, method);
      }.bind(this));
      return this
    };


    Component.prototype.handleAction = function handleAction (name, handler) {
      if (!name || !handler || !isFunction$2(handler)) {
        throw new Error('Illegal arguments.')
      }
      handler = handler.bind(this);
      this._actionHandlers[name] = handler;
    };


    Component.prototype.getState = function getState () {
      return this.state
    };


    Component.prototype.setState = function setState (newState) {
      var oldProps = this.props;
      var oldState = this.state;


      var needRerender = !this.__isSettingProps__ &&
          this.shouldRerender(this.getProps(), newState);

      this.willUpdateState(newState);
      this.state = newState || {};
      Object.freeze(this.state);
      if (needRerender) {
        this._rerender(oldProps, oldState);
      } else if (!this.__isSettingProps__) {
        this.didUpdate(oldProps, oldState);
      }
    };


    Component.prototype.extendState = function extendState (newState) {
      newState = extend({}, this.state, newState);
      this.setState(newState);
    };


    Component.prototype.willUpdateState = function willUpdateState (newState) {
    };


    Component.prototype.getProps = function getProps () {
      return this.props
    };


    Component.prototype.setProps = function setProps (newProps) {
      var oldProps = this.props;
      var oldState = this.state;
      var needRerender = this.shouldRerender(newProps, this.state);
      this._setProps(newProps);
      if (needRerender) {
        this._rerender(oldProps, oldState);
      } else {
        this.didUpdate(oldProps, oldState);
      }
    };

    Component.prototype._setProps = function _setProps (newProps) {
      newProps = newProps || {};

      this.__isSettingProps__ = true;
      try {
        this.willReceiveProps(newProps);
        this.props = newProps || {};
        Object.freeze(newProps);
      } finally {
        delete this.__isSettingProps__;
      }
    };


    Component.prototype.extendProps = function extendProps (updatedProps) {
      var newProps = extend({}, this.props, updatedProps);
      this.setProps(newProps);
    };


    Component.prototype.willReceiveProps = function willReceiveProps (newProps) {
    };

    Component.prototype.getTextContent = function getTextContent () {
      if (this.el) {
        return this.el.textContent
      }
    };

    prototypeAccessors.textContent.get = function () {
      return this.getTextContent()
    };

    Component.prototype.getInnerHTML = function getInnerHTML () {
      if (this.el) {
        return this.el.getInnerHTML()
      }
    };

    prototypeAccessors.innerHTML.get = function () {
      return this.getInnerHTML()
    };

    Component.prototype.getOuterHTML = function getOuterHTML () {
      if (this.el) {
        return this.el.getOuterHTML()
      }
    };

    prototypeAccessors.outerHTML.get = function () {
      return this.getOuterHTML()
    };

    Component.prototype.getAttribute = function getAttribute (name) {
      if (this.el) {
        return this.el.getAttribute(name)
      }
    };

    Component.prototype.setAttribute = function setAttribute (name, val) {
      if (this.el) {
        this.el.setAttribute(name, val);
      }
      return this
    };

    Component.prototype.getProperty = function getProperty (name) {
      if (this.el) {
        return this.el.getProperty(name)
      }
    };

    Component.prototype.setProperty = function setProperty (name, val) {
      if (this.el) {
        this.el.setProperty(name, val);
      }
      return this
    };

    Component.prototype.hasClass = function hasClass (name) {
      if (this.el) {
        return this.el.hasClass(name)
      }
    };

    Component.prototype.addClass = function addClass (name) {
      if (this.el) {
        this.el.addClass(name);
      }
      return this
    };

    Component.prototype.removeClass = function removeClass (name) {
      if (this.el) {
        this.el.removeClass(name);
      }
      return this
    };

    Component.prototype.getStyle = function getStyle (name) {
      if (this.el) {
        return this.el.getStyle(name)
      }
    };

    Component.prototype.setStyle = function setStyle (name, val) {
      if (this.el) {
        return this.el.setStyle(name, val)
      }
      return this
    };

    Component.prototype.getValue = function getValue () {
      if (this.el) {
        return this.el.getValue()
      }
    };

    Component.prototype.setValue = function setValue (val) {
      if (this.el) {
        this.el.setValue(val);
      }
      return this
    };

    Component.prototype.getChildCount = function getChildCount () {
      if (!this.el) { return 0 }
      return this.el.getChildCount()
    };

    prototypeAccessors.childNodes.get = function () {
      return this.getChildNodes()
    };

    Component.prototype.getChildNodes = function getChildNodes () {
      if (!this.el) { return [] }
      var childNodes = this.el.getChildNodes();
      childNodes = childNodes.map(_unwrapComp).filter(Boolean);
      return childNodes
    };

    Component.prototype.getChildren = function getChildren () {
      if (!this.el) { return [] }
      var children = this.el.getChildren();
      children = children.map(_unwrapComp).filter(Boolean);
      return children
    };

    Component.prototype.getChildAt = function getChildAt (pos) {
      var node = this.el.getChildAt(pos);
      return _unwrapCompStrict(node)
    };

    Component.prototype.find = function find (cssSelector) {
      var el = this.el.find(cssSelector);
      return _unwrapComp(el)
    };

    Component.prototype.findAll = function findAll (cssSelector) {
      var els = this.el.findAll(cssSelector);
      return els.map(_unwrapComp).filter(Boolean)
    };

    Component.prototype.appendChild = function appendChild (child) {
      this.insertAt(this.getChildCount(), child);
    };

    Component.prototype.insertAt = function insertAt (pos, childEl) {
      if (isString(childEl)) {
        childEl = new VirtualElement.TextNode(childEl);
      }
      if (!childEl._isVirtualElement) {
        throw new Error('Invalid argument: "child" must be a VirtualElement.')
      }
      var child = this.renderingEngine._renderChild(this, childEl);
      this.el.insertAt(pos, child.el);
      _mountChild(this, child);
    };

    Component.prototype.removeAt = function removeAt (pos) {
      var childEl = this.el.getChildAt(pos);
      if (childEl) {
        var child = _unwrapCompStrict(childEl);
        _disposeChild(child);
        this.el.removeAt(pos);
      }
    };

    Component.prototype.removeChild = function removeChild (child) {
      if (!child || !child._isComponent) {
        throw new Error('removeChild(): Illegal arguments. Expecting a Component instance.')
      }

      _disposeChild(child);
      this.el.removeChild(child.el);
    };

    Component.prototype.replaceChild = function replaceChild (oldChild, newChild) {
      if (!newChild || !oldChild ||
          !newChild._isComponent || !oldChild._isComponent) {
        throw new Error('replaceChild(): Illegal arguments. Expecting BrowserDOMElement instances.')
      }

      _disposeChild(oldChild);
      this.el.replaceChild(newChild.el, oldChild.el);
      if (this.isMounted()) {
        newChild.triggerDidMount(true);
      }
    };

    Component.prototype.empty = function empty () {
      if (this.el) {
        this.getChildNodes().forEach(function(child) {
          _disposeChild(child);
        });
        this.el.empty();
      }
      return this
    };

    Component.prototype.remove = function remove () {
      _disposeChild(this);
      this.el.remove();
    };

    Component.prototype.addEventListener = function addEventListener () {
      throw new Error("Not supported.")
    };

    Component.prototype.removeEventListener = function removeEventListener () {
      throw new Error("Not supported.")
    };

    Component.prototype.insertBefore = function insertBefore () {
      throw new Error("Not supported.")
    };

    Component.prototype.click = function click () {
      if (this.el) {
        this.el.click();
      }
    };

    Component.prototype.getComponentPath = function getComponentPath () {
      var path = [];
      var comp = this;
      while (comp) {
        path.unshift(comp);
        comp = comp.getParent();
      }
      return path
    };

    Component.prototype._getContext = function _getContext () {
      var context = {};
      var parent = this.getParent();
      if (parent) {
        context = extend(context, parent.context);
        if (parent.getChildContext) {
          return extend(context, parent.getChildContext())
        }
      }
      return context
    };

    Object.defineProperties( Component.prototype, prototypeAccessors );

    return Component;
  }(EventEmitter));

  Component.prototype._isComponent = true;

  Component.prototype.attr = DOMElement.prototype.attr;

  Component.prototype.htmlProp = DOMElement.prototype.htmlProp;

  Component.prototype.val = DOMElement.prototype.val;

  Component.prototype.css = DOMElement.prototype.css;

  Component.prototype.text = DOMElement.prototype.text;

  Component.prototype.append = DOMElement.prototype.append;

  Component.unwrap = _unwrapComp;

  Component.render = function(props) {
    props = props || {};
    var ComponentClass = this;
    var comp = new ComponentClass(null, props);
    comp._render();
    return comp
  };

  Component.mount = function(props, el) {
    if (arguments.length === 1) {
      el = props;
      props = {};
    }
    if (!el) { throw new Error("'el' is required.") }
    if (isString(el)) {
      var selector = el;
      if (inBrowser) {
        el = window.document.querySelector(selector);
      } else {
        throw new Error("This selector is not supported on server side.")
      }
    }
    if (!el._isDOMElement) {
      el = new DefaultDOMElement.wrapNativeElement(el);
    }
    var ComponentClass = this;
    var comp = new ComponentClass(null, props);
    comp.mount(el);
    return comp
  };

  Component.getComponentForDOMElement = function(el) {
    return _unwrapComp(el)
  };

  Component.unwrapDOMElement = function(el) {
    console.warn('DEPRECATED: Use Component.getComponentForDOMElement');
    return Component.getComponentForDOMElement(el)
  };

  Component.getComponentFromNativeElement = function(nativeEl) {



    return _unwrapComp(DefaultDOMElement.wrapNativeElement(nativeEl))
  };


  function _disposeChild(child) {
    child.triggerDispose();
    if (child._owner && child._ref) {
      console.assert(child._owner.refs[child._ref] === child, "Owner's ref should point to this child instance.");
      delete child._owner.refs[child._ref];
    }
  }


  function _mountChild(parent, child) {
    if (parent.isMounted()) {
      child.triggerDidMount(true);
    }
    if (child._owner && child._ref) {
      child._owner.refs[child._ref] = child;
    }
  }


  function _unwrapComp(el) {
    if (el) {
      if (!el._isDOMElement) { el = el._wrapper; }
      if (el) { return el._comp }
    }
  }

  function _unwrapCompStrict(el) {
    var comp = _unwrapComp(el);
    if (!comp) { throw new Error("Expecting a back-link to the component instance.") }
    return comp
  }


  var ElementComponent = (function (Component) {
    function ElementComponent(parent) {
      Component.call(this, parent);
    }

    if ( Component ) ElementComponent.__proto__ = Component;
    ElementComponent.prototype = Object.create( Component && Component.prototype );
    ElementComponent.prototype.constructor = ElementComponent;

    return ElementComponent;
  }(Component));

  ElementComponent.prototype._isElementComponent = true;
  ElementComponent.prototype._SKIP_COMPONENT_INIT = true;

  var TextNodeComponent = (function (Component) {
    function TextNodeComponent(parent) {
      Component.call(this, parent);
    }

    if ( Component ) TextNodeComponent.__proto__ = Component;
    TextNodeComponent.prototype = Object.create( Component && Component.prototype );
    TextNodeComponent.prototype.constructor = TextNodeComponent;

    TextNodeComponent.prototype.setTextContent = function setTextContent (text) {
      if (!this.el) {
        throw new Error('Component must be rendered first.')
      }
      if (this.el.textContent !== text) {
        this.el.textContent = text;
      }
    };

    TextNodeComponent.prototype.getChildNodes = function getChildNodes () {
      return []
    };

    TextNodeComponent.prototype.getChildren = function getChildren () {
      return []
    };

    return TextNodeComponent;
  }(Component));

  TextNodeComponent.prototype._isTextNodeComponent = true;
  TextNodeComponent.prototype._SKIP_COMPONENT_INIT = true;


  Component.Element = ElementComponent;
  Component.TextNode = TextNodeComponent;

  var DragAndDropHandler = function DragAndDropHandler () {};

  var prototypeAccessors$6 = { _isDragAndDropHandler: {} };

  DragAndDropHandler.prototype.match = function match (dragState, context) {
    return false
  };

  DragAndDropHandler.prototype.drop = function drop (dragState, context) {

  };

  prototypeAccessors$6._isDragAndDropHandler.get = function () {
    return true
  };

  Object.defineProperties( DragAndDropHandler.prototype, prototypeAccessors$6 );

  var platform = {

    inBrowser: inBrowser,


    isIE: false,


    isFF: false,

    isWebkit: false,


    version: -1,



    isWindows: (inBrowser && window.navigator !== undefined && window.navigator.appVersion && window.navigator.appVersion.indexOf("Win") !== -1),

    isMac: (inBrowser && window.navigator !== undefined && window.navigator.platform.indexOf('Mac') >= 0)

  };

  if (typeof window !== 'undefined') {

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');
    var edge = ua.indexOf('Edge/');

    if (msie > 0) {

      platform.isIE = true;
      platform.version = 10;


    } else if (trident > 0) {

      platform.isIE = true;
      platform.version = 11;
      platform.isTrident = true;



    } else if (edge > 0) {

      platform.isIE = true;
      platform.isEdge = true;
      platform.version = 12;

      parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }


    platform.isFF = window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;


    platform.isWebkit = !platform.isFF && !platform.isIE;
  }

  function getDOMRangeFromEvent(evt) {
    var range, x = evt.clientX, y = evt.clientY;

    if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToPoint(x, y);
    }
    else if (!isNil(document.createRange)) {


      if (!isNil(evt.rangeParent)) {
        range = document.createRange();
        range.setStart(evt.rangeParent, evt.rangeOffset);
        range.collapse(true);
      }

      else if (document.caretPositionFromPoint) {
        var pos = document.caretPositionFromPoint(x, y);
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
      }

      else if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(x, y);
      }
    }
    return range
  }


  function getSelectionRect(parentRect) {
    if (inBrowser) {
      var wsel = window.getSelection();
      if (wsel.rangeCount === 0) { return }
      var wrange = wsel.getRangeAt(0);
      var contentRect = parentRect;
      var selectionRect = wrange.getBoundingClientRect();
      if (selectionRect.top === 0 && selectionRect.bottom === 0) {
        selectionRect = _fixForCursorRectBug();
      }
      return getRelativeRect(contentRect, selectionRect)
    }
  }

  function _fixForCursorRectBug() {
    var wsel = window.getSelection();
    var rects = wsel.anchorNode.parentElement.getClientRects();
    return rects[0]
  }

  function getRelativeRect(parentRect, childRect) {
    var left = childRect.left - parentRect.left;
    var top = childRect.top - parentRect.top;
    return {
      left: left,
      top: top,
      right: parentRect.width - left - childRect.width,
      bottom: parentRect.height - top - childRect.height,
      width: childRect.width,
      height: childRect.height
    }
  }

  function isMouseInsideDOMSelection(e) {
    var wsel = window.getSelection();
    if (wsel.rangeCount === 0) {
      return false
    }
    var wrange = wsel.getRangeAt(0);
    var selectionRect = wrange.getBoundingClientRect();
    return e.clientX >= selectionRect.left &&
        e.clientX <= selectionRect.right &&
        e.clientY >= selectionRect.top &&
        e.clientY <= selectionRect.bottom
  }

  var DragManager = (function (EventEmitter$$1) {
    function DragManager(customDropHandlers, context) {
      EventEmitter$$1.call(this);

      this.context = context;

      var dropAssetHandlers = [];
      var moveInlineHandlers = [];
      customDropHandlers.forEach(function (h) {

        var type = h.type || 'drop-asset';
        switch (type) {
          case 'drop-asset': {
            dropAssetHandlers.push(h);
            break
          }
          case 'move-inline': {
            moveInlineHandlers.push(h);
            break
          }
          default:
            console.warn('Unknown type of drop handler.', h);
        }
      });


      this.dropHandlers = [

        new MoveInline(moveInlineHandlers),

        new MoveBlockNode(),

        new InsertNodes(dropAssetHandlers, this.context),


        new CustomHandler() ];
      if (inBrowser) {
        this.el = DefaultDOMElement.wrapNativeElement(document);
        this.el.on('dragstart', this.onDragStart, this);

        this.el.on('drop', this.onDragEnd, this);
        this.el.on('dragenter', this.onDragEnter, this);
        this.el.on('dragexit', this.onDragExit, this);
        this.el.on('mousedown', this.onMousedown, this);
      }
    }

    if ( EventEmitter$$1 ) DragManager.__proto__ = EventEmitter$$1;
    DragManager.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    DragManager.prototype.constructor = DragManager;

    DragManager.prototype.dispose = function dispose () {
      if (this.el) {
        this.el.off(this);
      }
    };

    DragManager.prototype.onDragStart = function onDragStart (e) {

      this._initDrag(e, { external: false });


      var img = document.createElement("img");
      img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
      e.dataTransfer.setDragImage(img, 0, 0);






      if (this.dragState.mode === 'inline') {
        e.dataTransfer.setData('text/html', img.outerHTML);
      } else {


        e.dataTransfer.setData('text/html', '<div></div>');
      }

    };


    DragManager.prototype.onDragEnter = function onDragEnter (e) {
      if (!this.dragState) {

        this._initDrag(e, {external: true});
      }
    };

    DragManager.prototype.onDragEnd = function onDragEnd (event) {
      if (event.__reserved__) { return }

      if (this.dragState) {
        event.stopPropagation();
        event.preventDefault();


        this._onDragEnd(event);
      }
    };

    DragManager.prototype.onDragExit = function onDragExit (e) {
      if (platform.isFF) {

      } else {



        this._onDragEnd(e);
      }
    };

    DragManager.prototype.extendDragState = function extendDragState (extState) {
      Object.assign(this.dragState, extState);
    };



    DragManager.prototype.onMousedown = function onMousedown (event) {
      if (this.dragState) {
        this.dragState = null;
        this._onDragEnd(event);
      }
    };

    DragManager.prototype._onDragEnd = function _onDragEnd (event) {
      if (!this.dragState) {



        console.warn('Not in a valid drag state.');
      } else {
        this._handleDrop(event);
      }
      this.emit('drag:finished');
      this.dragState = null;
    };


    DragManager.prototype._handleDrop = function _handleDrop (e) {
      var this$1 = this;

      var dragState = this.dragState;
      var i, handler;
      var match = false;
      dragState.event = e;
      dragState.data = this._getData(e);

      for (i = 0; i < this.dropHandlers.length && !match; i++) {
        handler = this$1.dropHandlers[i];
        match = handler.match(dragState);
      }
      if (match) {
        var editorSession = this.context.editorSession;
        editorSession.transaction(function (tx) {
          handler.drop(tx, dragState);
        });
      } else {
        console.error('No drop handler could be found.');
      }
    };


    DragManager.prototype._initDrag = function _initDrag (event, options) {






      var sel = this._getSelection();
      var dragState = Object.assign({ startEvent: event }, options);
      this.dragState = dragState;



      if (dragState.external) {
        dragState.selectionDrag = false;
        dragState.sourceSelection = null;
        dragState.scrollPanes = this._getSurfacesGroupedByScrollPane();
        this.emit('drag:started', dragState);
        return
      }



      var isSelectionDrag = (
          (sel.isPropertySelection() || sel.isContainerSelection()) &&
          isMouseInsideDOMSelection(event)
      );
      if (isSelectionDrag) {

        if (sel.isContainerSelection()) {
          console.warn('Dragging of ContainerSelection is not supported yet.');
          return _stop()
        }

        dragState.inline = true;
        dragState.selectionDrag = true;
        dragState.sourceSelection = sel;

        return
      }
      var comp = Component.unwrap(event.target);
      if (!comp) { return _stop() }
      var isolatedNodeComponent;
      if (comp._isInlineNodeComponent) {
        isolatedNodeComponent = comp;
        dragState.inline = true;
        dragState.sourceNode = comp.props.node;
      } else {
        isolatedNodeComponent = comp.context.isolatedNodeComponent;
      }
      if (!isolatedNodeComponent) { return _stop() }
      var surface = isolatedNodeComponent.context.surface;

      if(isolatedNodeComponent._isInlineNodeComponent) {
        var inlineNode = isolatedNodeComponent.props.node;
        dragState.inline = true;
        dragState.selectionDrag = true;
        dragState.sourceSelection = {
          type: 'property',
          path: inlineNode.start.path,
          startOffset: inlineNode.start.offset,
          endOffset: inlineNode.end.offset,
          containerId: surface.getContainerId(),
          surfaceId: surface.id
        };
        return
      }


      dragState.selectionDrag = false;
      dragState.nodeDrag = true;
      dragState.sourceSelection = {
        type: 'node',
        nodeId: isolatedNodeComponent.props.node.id,
        containerId: surface.getContainerId(),
        surfaceId: surface.id
      };



      dragState.scrollPanes = this._getSurfacesGroupedByScrollPane();

      this.emit('drag:started', dragState);

      function _stop() {

        event.preventDefault();
        event.stopPropagation();
      }
    };

    DragManager.prototype._getSurfacesGroupedByScrollPane = function _getSurfacesGroupedByScrollPane () {


      var surfaces = this.context.surfaceManager.getSurfaces();
      var scrollPanes = {};
      surfaces.forEach(function (surface) {

        if (!surface.isContainerEditor()) { return }
        var scrollPane = surface.context.scrollPane;
        var scrollPaneName = scrollPane.getName();
        var surfaceName = surface.getName();
        if (!scrollPanes[scrollPaneName]) {
          var surfaces = {};
          surfaces[surfaceName] = surface;
          scrollPanes[scrollPaneName] = { scrollPane: scrollPane, surfaces: surfaces };
        } else {
          scrollPanes[scrollPaneName].surfaces[surfaceName] = surface;
        }
      });
      return scrollPanes
    };

    DragManager.prototype._getSelection = function _getSelection () {
      return this.context.editorSession.getSelection()
    };

    DragManager.prototype._getComponents = function _getComponents (targetEl) {
      var res = [];
      var curr = targetEl;
      while (curr) {
        var comp = Component.getComponentForDOMElement(curr);
        if (comp) {
          res.unshift(comp);
          if(comp._isSurface) {
            return res
          }
        }
        curr = curr.parentNode;
      }
      return null
    };

    DragManager.prototype._getIsolatedNodeOrContainerChild = function _getIsolatedNodeOrContainerChild (targetEl) {
      var parent, current;
      current = targetEl;
      parent = current.parentNode;
      while(parent) {
        if (parent._comp && parent._comp._isContainerEditor) {
          return current._comp
        } else if (current._comp && current._comp._isIsolatedNode) {
          return current._comp
        }
        current = parent;
        parent = current.parentNode;
      }
    };


    DragManager.prototype._extractUris = function _extractUris (dataTransfer) {
      var uris = [];
      var rawUriList = dataTransfer.getData('text/uri-list');
      if (rawUriList) {
        uris = rawUriList.split('\n').filter(function(item) {
          return !item.startsWith('#')
        });
      }
      return uris
    };


    DragManager.prototype._getData = function _getData (e) {
      var dataTransfer = e.dataTransfer;
      if (dataTransfer) {
        return {
          files: Array.prototype.slice.call(dataTransfer.files),
          uris: this._extractUris(dataTransfer),
          text: dataTransfer.getData('text/plain'),
          html: dataTransfer.getData('text/html')
        }
      }
    };

    return DragManager;
  }(EventEmitter));


  var MoveBlockNode = (function (DragAndDropHandler$$1) {
    function MoveBlockNode () {
      DragAndDropHandler$$1.apply(this, arguments);
    }

    if ( DragAndDropHandler$$1 ) MoveBlockNode.__proto__ = DragAndDropHandler$$1;
    MoveBlockNode.prototype = Object.create( DragAndDropHandler$$1 && DragAndDropHandler$$1.prototype );
    MoveBlockNode.prototype.constructor = MoveBlockNode;

    MoveBlockNode.prototype.match = function match (dragState) {
      var ref = dragState.dropParams;
      var insertPos = ref.insertPos;

      return (!dragState.external && dragState.nodeDrag &&
          dragState.dropType === 'place' && insertPos >= 0
      )
    };

    MoveBlockNode.prototype.drop = function drop (tx, dragState) {




      var ref = dragState.dropParams;
      var insertPos = ref.insertPos;
      tx.setSelection(dragState.sourceSelection);
      var copy = tx.copySelection();

      tx.deleteSelection({ clear: true });
      var containerId = dragState.targetSurface.getContainerId();
      var surfaceId = dragState.targetSurface.getName();
      var container = tx.get(containerId);
      var targetNode = container.nodes[insertPos];
      var insertMode = 'before';
      if (!targetNode) {
        targetNode = container.nodes[insertPos-1];
        insertMode = 'after';
      }
      tx.setSelection({
        type: 'node',
        nodeId: targetNode,
        mode: insertMode,
        containerId: containerId,
        surfaceId: surfaceId
      });
      tx.paste(copy);
    };

    return MoveBlockNode;
  }(DragAndDropHandler));

  var MoveInline = (function (DragAndDropHandler$$1) {
    function MoveInline () {
      DragAndDropHandler$$1.apply(this, arguments);
    }

    if ( DragAndDropHandler$$1 ) MoveInline.__proto__ = DragAndDropHandler$$1;
    MoveInline.prototype = Object.create( DragAndDropHandler$$1 && DragAndDropHandler$$1.prototype );
    MoveInline.prototype.constructor = MoveInline;

    MoveInline.prototype.match = function match (dragState) {
      return !dragState.external && dragState.inline
    };

    MoveInline.prototype.drop = function drop (tx, dragState) {
      var event = dragState.event;
      var sourceSel = dragState.sourceSelection;
      var wrange = getDOMRangeFromEvent(event);
      if (!wrange) { return }
      var comp = Component.unwrap(event.target);
      if (!comp) { return }
      var domSelection = comp.context.domSelection;
      if (!domSelection) { return }
      var range = domSelection.mapDOMRange(wrange);
      if (!range) { return }
      var targetSel = tx.getDocument()._createSelectionFromRange(range);


      tx.selection = sourceSel;
      var snippet = tx.copySelection();
      tx.deleteSelection();
      tx.selection = DocumentChange.transformSelection(targetSel, tx);
      tx.paste(snippet);
    };

    return MoveInline;
  }(DragAndDropHandler));

  var InsertNodes = (function (DragAndDropHandler$$1) {
    function InsertNodes(assetHandlers, context) {
      DragAndDropHandler$$1.call(this);
      this.assetHandlers = assetHandlers;
      this.context = context;
    }

    if ( DragAndDropHandler$$1 ) InsertNodes.__proto__ = DragAndDropHandler$$1;
    InsertNodes.prototype = Object.create( DragAndDropHandler$$1 && DragAndDropHandler$$1.prototype );
    InsertNodes.prototype.constructor = InsertNodes;

    InsertNodes.prototype.match = function match (dragState) {
      return dragState.dropType === 'place' && dragState.external
    };

    InsertNodes.prototype.drop = function drop (tx, dragState) {
      var this$1 = this;

      var ref = dragState.dropParams;
      var insertPos = ref.insertPos;
      var files = dragState.data.files;
      var uris = dragState.data.uris;
      var containerId = dragState.targetSurface.getContainerId();
      var surfaceId = dragState.targetSurface.id;
      var container = tx.get(containerId);
      var targetNode = container.nodes[insertPos];
      var insertMode = 'before';
      if (!targetNode) {
        targetNode = container.nodes[insertPos-1];
        insertMode = 'after';
      }
      tx.setSelection({
        type: 'node',
        nodeId: targetNode,
        mode: insertMode,
        containerId: containerId,
        surfaceId: surfaceId
      });
      if (files.length > 0) {
        files.forEach(function (file) {
          this$1._callHandlers(tx, {
            file: file,
            type: 'file'
          });
        });
      } else if (uris.length > 0) {
        uris.forEach(function (uri) {
          this$1._callHandlers(tx, {
            uri: uri,
            type: 'uri'
          });
        });
      } else {
        console.info('TODO: implement html/text drop here');
      }
    };

    InsertNodes.prototype._callHandlers = function _callHandlers (tx, params) {
      var this$1 = this;

      var i, handler;
      for (i = 0; i < this.assetHandlers.length; i++) {
        handler = this$1.assetHandlers[i];

        var match = handler.match(params, this$1.context);
        if (match) {
          handler.drop(tx, params, this$1.context);
          break
        }
      }
    };

    return InsertNodes;
  }(DragAndDropHandler));


  var CustomHandler = (function (DragAndDropHandler$$1) {
    function CustomHandler () {
      DragAndDropHandler$$1.apply(this, arguments);
    }

    if ( DragAndDropHandler$$1 ) CustomHandler.__proto__ = DragAndDropHandler$$1;
    CustomHandler.prototype = Object.create( DragAndDropHandler$$1 && DragAndDropHandler$$1.prototype );
    CustomHandler.prototype.constructor = CustomHandler;

    CustomHandler.prototype.match = function match (dragState) {
      return dragState.dropType === 'custom'
    };

    CustomHandler.prototype.drop = function drop (tx, dragState) {

      dragState.component.handleDrop(tx, dragState);
    };

    return CustomHandler;
  }(DragAndDropHandler));

  var events = [ 'keydown', 'keyup', 'keypress', 'mousedown', 'mouseup' , 'copy'];

  var GlobalEventHandler = function GlobalEventHandler(editorSession, surfaceManager) {
    this.editorSession = editorSession;
    this.surfaceManager = surfaceManager;
    this.listeners = [];
    this.initialize();
  };

  GlobalEventHandler.prototype.initialize = function initialize () {
    if (inBrowser) {
      var document = DefaultDOMElement.wrapNativeElement(window.document);
      events.forEach(function(name) {
        document.on(name, this._dispatch.bind(this, name), this);
      }.bind(this));
    }
  };

  GlobalEventHandler.prototype.dispose = function dispose () {
    if (inBrowser) {
      var document = DefaultDOMElement.wrapNativeElement(window.document);
      document.off(this);
    }
  };

  GlobalEventHandler.prototype.addEventListener = function addEventListener (eventName, handler, options) {
    if (!options.id) {
      throw new Error("GlobalEventHandler can only be used with option 'id'")
    }
    var listener = new DOMEventListener(eventName, handler, options);
    this.listeners.push(listener);
  };

  GlobalEventHandler.prototype.removeEventListener = function removeEventListener (listener) {
    var idx = this.listeners.indexOf(listener);
    if (idx > -1) {
      this.listeners.splice(idx, 1);
    }
  };

  GlobalEventHandler.prototype.getEventListeners = function getEventListeners () {
    return this.listeners
  };

  GlobalEventHandler.prototype._getActiveListener = function _getActiveListener (eventName) {
    var this$1 = this;

    var editorSession = this.editorSession;
    var sel = editorSession.getSelection();
    if (sel) {
      var surfaceId = sel.surfaceId;
      for (var i = 0; i < this.listeners.length; i++) {
        var listener = this$1.listeners[i];
        if (listener.eventName === eventName && listener.options.id === surfaceId) {
          return listener
        }
      }
    }
  };

  GlobalEventHandler.prototype._dispatch = function _dispatch (eventName, e) {
    var listener = this._getActiveListener(eventName);
    if (listener) {
      listener.handler(e);
    }
  };

  GlobalEventHandler.prototype.on = DOMElement.prototype.on;
  GlobalEventHandler.prototype.off = DOMElement.prototype.off;

  var MacroManager = function MacroManager(context, macros) {
    this.context = context;
    this.macros = macros;
    this.context.editorSession.onFinalize('document', this.onDocumentChanged, this);
  };

  MacroManager.prototype.dispose = function dispose () {
    this.context.editorSession.off(this);
  };

  MacroManager.prototype.onDocumentChanged = function onDocumentChanged (change, info) {
    this.executeMacros(change, info);
  };

  MacroManager.prototype.executeMacros = function executeMacros (change, info) {
    var this$1 = this;

    var doc = this.context.editorSession.getDocument();
    var nodeId, node, text, start, end;
    var path;


    switch(info.action) {
      case 'type': {
        var op = change.ops[0];
        if (op.type === 'update' && op.diff._isTextOperation) {
          path = op.path;
          nodeId = path[0];
          node = doc.get(nodeId);
          text = doc.get(path);
          start = op.diff.pos;
          end = start+op.diff.getLength();
        }
        break
      }
      case 'break': {








        var sel = change.before.selection;
        if (!sel.isPropertySelection()) { return }
        path = sel.path;
        nodeId = path[0];
        node = doc.get(nodeId);

        if (!node || !node.isText()) { return }
        text = node.getText();
        start = sel.start.offset;
        end = start;
        break
      }
      case 'paste': {

        if (change.ops.length === 1) {
          var op$1 = change.ops[0];
          if (op$1.type === 'update' && op$1.propertyType === 'string') {
            path = op$1.path;
            nodeId = path[0];
            node = doc.get(nodeId);
            if (!node.isText()) { return }
            text = node.getText();
            start = op$1.diff.pos;
            end = start+op$1.diff.getLength();
          }
        }
        break
      }
      default:
        return
    }

    var props = {
      action: info.action,
      node: node,
      path: path,
      text: text,
      start: start,
      end: end,
      editorSession: this.context.editorSession,
      selection: this.context.editorSession.getSelection()
    };

    setTimeout(function () {
      for (var i = 0; i < this$1.macros.length; i++) {
        var macro = this$1.macros[i];
        var executed = macro.execute(props, this$1.context);
        if (executed) {
          break
        }
      }
    });

  };

  var keys = {
    UNDEFINED: 0,
    BACKSPACE: 8,
    DELETE: 46,
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    ENTER: 13,
    END: 35,
    HOME: 36,
    TAB: 9,
    PAGEUP: 33,
    PAGEDOWN: 34,
    ESCAPE: 27,
    SHIFT: 16,
    SPACE: 32
  };

  var ExecuteCommandHandler = function ExecuteCommandHandler(editorSession, commandName) {
    this.editorSession = editorSession;
    this.commandName = commandName;
  };
  ExecuteCommandHandler.prototype.execute = function execute (params) {
    var commandState = params.editorSession.getCommandStates()[this.commandName];
    if (!commandState || commandState.disabled) { return false }
    this.editorSession.executeCommand(this.commandName, params);
    return true
  };

  var KeyboardManager = function KeyboardManager(editorSession, bindings, options) {
    var this$1 = this;

    this.editorSession = editorSession;

    this.context = options.context || {};

    this.keydownBindings = {};
    this.textinputBindings = {};

    bindings.forEach(function (ref) {
      var key = ref.key;
      var spec = ref.spec;


      var type = spec.type || 'keydown';
      if(spec.command) {
        var handler = new ExecuteCommandHandler(editorSession, spec.command);
        var hook = handler.execute.bind(handler);
        if (type === 'keydown') {
          this$1.keydownBindings[parseCombo(key)] = hook;
        } else if (type === 'textinput') {
          this$1.textinputBindings[key] = hook;
        }
      } else {
        throw new Error('Keyboard binding not supported', spec)
      }
    });
  };

  KeyboardManager.prototype.onKeydown = function onKeydown (event) {
    var key = generateKey(event);
    var hook = this.keydownBindings[key];
    if (hook) {
      event.preventDefault();
      event.stopPropagation();
      var params = this._getParams();
      return hook(params, this.context)
    }
  };

  KeyboardManager.prototype.onTextInput = function onTextInput (text) {
    var hook = this.textinputBindings[text];
    if (hook) {
      var params = this._getParams();
      return hook(params, this.context)
    }
  };

  KeyboardManager.prototype._getParams = function _getParams () {
    var editorSession = this.editorSession;
    var selectionState = editorSession.getSelectionState();
    var sel = selectionState.getSelection();
    var surface = this.context.surfaceManager.getFocusedSurface();
    return {
      editorSession: editorSession,
      selectionState: selectionState,
      surface: surface,
      selection: sel,
    }
  };



  function generateKey(event) {
    var frags = [];
    if (event.altKey) {
      if (event.code === 'AltRight') {
        frags.push('ALTGR');
      } else {
        frags.push('ALT');
      }
    }
    if (event.ctrlKey) { frags.push('CTRL'); }
    if (event.metaKey) { frags.push('META'); }
    if (event.shiftKey) { frags.push('SHIFT'); }
    frags.push(event.keyCode);
    return frags.join('+')
  }

  function parseCombo(combo) {
    var frags = combo.split('+');
    var data = {
      keyCode: -1
    };
    for (var i = 0; i < frags.length; i++) {
      var frag = frags[i].toUpperCase();
      switch(frag) {
        case 'ALT': {
          data.altKey = true;
          break
        }
        case 'ALTGR': {
          data.altKey = true;
          data.code = 'AltRight';
          break
        }
        case 'CMD': {
          data.metaKey = true;
          break
        }
        case 'CTRL': {
          data.ctrlKey = true;
          break
        }
        case 'SHIFT': {
          data.shiftKey = true;
          break
        }
        default:
          if (frag.length === 1) {
            data.keyCode = frag.charCodeAt(0);
          } else if (keys.hasOwnProperty(frag)) {
            data.keyCode = keys[frag];
          } else {
            throw new Error('Unsupported keyboard command: '+ combo)
          }
      }
    }
    return generateKey(data)
  }

  KeyboardManager.parseCombo = parseCombo;

  var FileManager = function FileManager(editorSession, extensions, context) {
    var this$1 = this;

    this.editorSession = editorSession;
    this.extensions = extensions;
    this.proxies = {};
    this.context = context;


    forEach(editorSession.getDocument().getNodes(), function (node) {
      if (node._isFileNode) { this$1.storeFile(node); }
    });

    this.editorSession.onUpdate('document', this._onDocumentChange, this);
  };

  FileManager.prototype.dispose = function dispose () {
    this.editorSession.off(this);
  };

  FileManager.prototype.storeFile = function storeFile (fileNode) {
    var proxy = this.proxies[fileNode.id];

    if (!proxy) {
      proxy = this.createFileProxy(fileNode);
      if (proxy) {
        this.proxies[fileNode.id] = proxy;
      }
    }
    fileNode.proxy = proxy;
    return proxy
  };

  FileManager.prototype.createFileProxy = function createFileProxy (fileNode) {
    var this$1 = this;

    var context = this.context;
    for (var i = 0; i < this.extensions.length; i++) {
      var ExtClass = this$1.extensions[i];
      if (ExtClass.match(fileNode, context)) {
        return new ExtClass(fileNode, context)
      }
    }
    console.error('No file adapter found for ', fileNode);
  };

  FileManager.prototype.getProxy = function getProxy (fileNode) {
    return this.proxies[fileNode.id]
  };

  FileManager.prototype.sync = function sync () {


    var promises = map(this.proxies, function (proxy) {
      return proxy.sync()
    });
    return Promise.all(promises)
  };

  FileManager.prototype._onDocumentChange = function _onDocumentChange (change) {
    var this$1 = this;

    var doc = this.editorSession.getDocument();
    forEach(change.created, function (nodeData) {

      var node = doc.get(nodeData.id);
      if (node._isFileNode) {
        this$1.storeFile(node);
      }
    });
  };

  var EditorSession = (function (EventEmitter$$1) {
    function EditorSession(doc, options) {
      EventEmitter$$1.call(this);

      options = options || {};

      this.id = options.id || uuid();
      this.document = doc;
      if (!options.configurator) {
        throw new Error('No configurator provided.')
      }
      this.configurator = options.configurator;

      this._transaction = new Transaction(doc, this);

      this._history = new ChangeHistory();

      this._currentChange = null;





      this._selectionState = new SelectionState(doc);

      this._commandStates = [];


      this._resources = ['document', 'selection', 'commandStates'];

      this._dirtyFlags = {};

      this._change = null;
      this._info = null;

      this._flowStages = ['update', 'pre-render', 'render', 'post-render', 'position', 'finalize'];

      this._postponed = [];

      this._observers = {};

      this._lang = options.lang || this.configurator.getDefaultLanguage();
      this._dir = options.dir || 'ltr';






      this.surfaceManager = new SurfaceManager(this);

      this._context = {
        editorSession: this,

        surfaceManager: this.surfaceManager,
      };

      if (options.context) {
        Object.assign(this._context, options.context);
      }

      var configurator = this.configurator;
      var commands = configurator.getCommands();
      var dropHandlers = configurator.getDropHandlers();
      var macros = configurator.getMacros();
      var converterRegistry = configurator.getConverterRegistry();
      var editingBehavior = configurator.getEditingBehavior();

      this.fileManager = options.fileManager || new FileManager(this, configurator.getFileAdapters(), this._context);


      this._hasUnsavedChanges = false;
      this._isSaving = false;

      if (options.saveHandler) {
        this.saveHandler = options.saveHandler;
      } else {
        this.saveHandler = configurator.getSaveHandler();
      }


      this.commandManager = new CommandManager(this._context, commands);


      this.dragManager = new DragManager(dropHandlers, Object.assign({}, this._context, {
        commandManager: this.commandManager
      }));

      this.macroManager = new MacroManager(this._context, macros);
      this.globalEventHandler = new GlobalEventHandler(this, this.surfaceManager);
      this.markersManager = new MarkersManager(this);
      this.keyboardManager = new KeyboardManager(this, configurator.getKeyboardShortcuts(), {
        context: this._context
      });


      this.converterRegistry = converterRegistry;
      this.editingBehavior = editingBehavior;
    }

    if ( EventEmitter$$1 ) EditorSession.__proto__ = EventEmitter$$1;
    EditorSession.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    EditorSession.prototype.constructor = EditorSession;

    EditorSession.prototype.dispose = function dispose () {
      this.surfaceManager.dispose();
      this.fileManager.dispose();
      this.commandManager.dispose();
      this.dragManager.dispose();
      this.macroManager.dispose();
      this.globalEventHandler.dispose();
      this.markersManager.dispose();
    };

    EditorSession.prototype.hasChanged = function hasChanged (resource) {
      return this._dirtyFlags[resource]
    };

    EditorSession.prototype.hasDocumentChanged = function hasDocumentChanged () {
      return this.hasChanged('document')
    };

    EditorSession.prototype.hasSelectionChanged = function hasSelectionChanged () {
      return this.hasChanged('selection')
    };

    EditorSession.prototype.hasCommandStatesChanged = function hasCommandStatesChanged () {
      return this.hasChanged('commandStates')
    };

    EditorSession.prototype.hasLanguageChanged = function hasLanguageChanged () {
      return this.hasChanged('lang')
    };

    EditorSession.prototype.hasTextDirectionChanged = function hasTextDirectionChanged () {
      return this.hasChanged('dir')
    };

    EditorSession.prototype.get = function get (resourceName) {
      switch(resourceName) {
        case 'document':
          return this.getDocument()
        case 'selection':
          return this.getSelection()
        case 'commandStates':
          return this.getCommandStates()
        case 'change':
          return this.getChange()
        default:
          throw new Error('Unknown resource: ' + resourceName)
      }
    };

    EditorSession.prototype.getConfigurator = function getConfigurator () {
      return this.configurator
    };

    EditorSession.prototype.getDocument = function getDocument () {
      return this.document
    };

    EditorSession.prototype.getSelection = function getSelection () {
      return this.getSelectionState().getSelection()
    };

    EditorSession.prototype.getSelectionState = function getSelectionState () {
      return this._selectionState
    };

    EditorSession.prototype.getCommandStates = function getCommandStates () {
      return this._commandStates
    };

    EditorSession.prototype.getChange = function getChange () {
      return this._change
    };

    EditorSession.prototype.getChangeInfo = function getChangeInfo () {
      return this._info
    };

    EditorSession.prototype.getFocusedSurface = function getFocusedSurface () {
      return this.surfaceManager.getFocusedSurface()
    };

    EditorSession.prototype.getSurface = function getSurface (surfaceId) {
      return this.surfaceManager.getSurface(surfaceId)
    };

    EditorSession.prototype.getLanguage = function getLanguage () {
      return this._lang
    };

    EditorSession.prototype.getTextDirection = function getTextDirection () {
      return this._dir
    };

    EditorSession.prototype.canUndo = function canUndo () {
      return this._history.canUndo()
    };

    EditorSession.prototype.canRedo = function canRedo () {
      return this._history.canRedo()
    };

    EditorSession.prototype.executeCommand = function executeCommand () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      (ref = this.commandManager).executeCommand.apply(ref, args);
      var ref;
    };

    EditorSession.prototype.setSelection = function setSelection (sel) {

      if (sel && isPlainObject(sel)) {
        sel = this.getDocument().createSelection(sel);
      }
      if (sel && !sel.isNull() && !sel.surfaceId) {
        var fs = this.getFocusedSurface();
        if (fs) {
          sel.surfaceId = fs.id;
        }
      }
      if (this._setSelection(sel)) {
        this.startFlow();
      }
      return sel
    };

    EditorSession.prototype.selectNode = function selectNode (nodeId) {
      var surface = this.getFocusedSurface();
      this.setSelection({
        type: 'node',
        nodeId: nodeId,
        containerId: surface.getContainerId(),
        surfaceId: surface.id
      });
    };

    EditorSession.prototype.setCommandStates = function setCommandStates (commandStates) {
      this._commandStates = commandStates;
      this._setDirty('commandStates');
    };

    EditorSession.prototype.setLanguage = function setLanguage (lang) {
      if (this._lang !== lang) {
        this._lang = lang;
        this._setDirty('lang');
        this.startFlow();
      }
    };

    EditorSession.prototype.setTextDirection = function setTextDirection (dir) {
      if (this._dir !== dir) {
        this._dir = dir;
        this._setDirty('dir');
        this.startFlow();
      }
    };

    EditorSession.prototype.createSelection = function createSelection () {
      var doc = this.getDocument();
      return doc.createSelection.apply(doc, arguments)
    };

    EditorSession.prototype.getCollaborators = function getCollaborators () {
      return null
    };


    EditorSession.prototype.setSaveHandler = function setSaveHandler (saveHandler) {
      this.saveHandler = saveHandler;
    };


    EditorSession.prototype.transaction = function transaction (transformation, info) {
      info = info || {};
      var change = this._transaction._recordChange(transformation, this.getSelection(), this.getFocusedSurface());
      if (change) {
        this._commit(change, info);
      } else {

        this._setSelection(this._transaction.getSelection());
        this.startFlow();
      }
      return change
    };

    EditorSession.prototype.undo = function undo () {
      this._undoRedo('undo');
    };

    EditorSession.prototype.redo = function redo () {
      this._undoRedo('redo');
    };


    EditorSession.prototype.onUpdate = function onUpdate () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return this._registerObserver('update', args)
    };

    EditorSession.prototype.onPreRender = function onPreRender () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return this._registerObserver('pre-render', args)
    };


    EditorSession.prototype.onRender = function onRender () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return this._registerObserver('render', args)
    };


    EditorSession.prototype.onPostRender = function onPostRender () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return this._registerObserver('post-render', args)
    };


    EditorSession.prototype.onPosition = function onPosition () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return this._registerObserver('position', args)
    };

    EditorSession.prototype.onFinalize = function onFinalize () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return this._registerObserver('finalize', args)
    };

    EditorSession.prototype.off = function off (observer) {
      EventEmitter$$1.prototype.off.call(this, observer);
      this._deregisterObserver(observer);
    };

    EditorSession.prototype._setSelection = function _setSelection (sel) {
      var hasChanged = this.getSelectionState().setSelection(sel);
      if (hasChanged) { this._setDirty('selection'); }
      return hasChanged
    };

    EditorSession.prototype._undoRedo = function _undoRedo (which) {
      var doc = this.getDocument();
      var from, to;
      if (which === 'redo') {
        from = this._history.undoneChanges;
        to = this._history.doneChanges;
      } else {
        from = this._history.doneChanges;
        to = this._history.undoneChanges;
      }
      var change = from.pop();
      if (change) {
        this._applyChange(change, {});

        this._transaction._apply(change);

        to.push(change.invert());

        var sel = change.after.selection;
        if (sel) { sel.attach(doc); }
        this._setSelection(sel);

        this.startFlow();
      } else {
        console.warn('No change can be %s.', (which === 'undo'? 'undone':'redone'));
      }
    };

    EditorSession.prototype._transformLocalChangeHistory = function _transformLocalChangeHistory (externalChange) {




      var clone = {
        ops: externalChange.ops.map(function(op) { return op.clone(); })
      };
      DocumentChange.transformInplace(clone, this._history.doneChanges);
      DocumentChange.transformInplace(clone, this._history.undoneChanges);
    };

    EditorSession.prototype._transformSelection = function _transformSelection (change) {
      var oldSelection = this.getSelection();
      var newSelection = DocumentChange.transformSelection(oldSelection, change);

      return newSelection
    };

    EditorSession.prototype._commit = function _commit (change, info) {
      this._commitChange(change, info);

      this._hasUnsavedChanges = true;
      this.startFlow();
    };

    EditorSession.prototype._commitChange = function _commitChange (change, info) {
      change.timestamp = Date.now();
      this._applyChange(change, info);
      if (info['history'] !== false && !info['hidden']) {
        this._history.push(change.invert());
      }
      var newSelection = change.after.selection || Selection.nullSelection;


      if (!newSelection.isNull() && !newSelection.surfaceId) {
        newSelection.surfaceId = change.after.surfaceId;
      }
      this._setSelection(newSelection);
    };

    EditorSession.prototype._applyChange = function _applyChange (change, info) {
      if (!change) {
        console.error('FIXME: change is null.');
        return
      }
      this.getDocument()._apply(change);
      this._setDirty('document');
      this._change = change;
      this._info = info;
    };


    EditorSession.prototype.hasUnsavedChanges = function hasUnsavedChanges () {
      return this._hasUnsavedChanges
    };


    EditorSession.prototype.save = function save () {
      var this$1 = this;

      var saveHandler = this.saveHandler;

      if (this._hasUnsavedChanges && !this._isSaving) {
        this._isSaving = true;

        if (saveHandler) {
          var saveParams = {
            editorSession: this,
            fileManager: this.fileManager
          };
          return saveHandler.saveDocument(saveParams)
              .then(function () {
                this$1._hasUnsavedChanges = false;




                this$1.setSelection(this$1.getSelection());
              })
              .catch(function (err) {
                console.error('Error during save', err);
              }).then(function () {
                this$1._isSaving = false;
              })
        } else {
          console.error('Document saving is not handled at the moment. Make sure saveHandler instance provided to editorSession');
          return Promise.reject()
        }
      }
    };


    EditorSession.prototype.startFlow = function startFlow () {
      if (this._flowing) { return }
      this._flowing = true;
      try {
        this.performFlow();
      } finally {
        this._resetFlow();
        this._flowing = false;
      }



      var postponed = this._postponed;
      var self = this;
      this._postponed = [];
      setTimeout(function() {
        postponed.forEach(function(fn) {
          fn(self);
        });
      }, 0);
    };


    EditorSession.prototype.performFlow = function performFlow () {
      var this$1 = this;

      this._flowStages.forEach(function (stage) {
        this$1._notifyObservers(stage);
      });
    };

    EditorSession.prototype.postpone = function postpone (fn) {
      this._postponed.push(fn);
    };

    EditorSession.prototype._parseObserverArgs = function _parseObserverArgs (args) {
      var params = { resource: null, handler: null, context: null, options: {} };

      var idx = 0;
      var arg = args[idx];
      if (isString(arg)) {
        params.resource = arg;
        idx++;
        arg = args[idx];
      }
      if (!arg) {
        throw new Error('Provided handler function was nil.')
      }
      if (!isFunction$2(arg)) {
        throw new Error('Expecting a handler Function.')
      }
      params.handler = arg;
      idx++;
      arg = args[idx];
      if (arg) {
        params.context = arg;
        idx++;
        arg = args[idx];
      }
      if (arg) {
        params.options = arg;
      }
      return params
    };

    EditorSession.prototype._registerObserver = function _registerObserver (stage, args) {
      var observer = this._parseObserverArgs(args);
      var observers = this._observers[stage];
      if (!observers) {
        observers = this._observers[stage] = [];
      }
      observers.push(observer);
    };

    EditorSession.prototype._deregisterObserver = function _deregisterObserver (observer) {


      forEach(this._observers, function (observers) {
        for (var i = 0; i < observers.length; i++) {
          var entry = observers[i];
          if (entry.context === observer) {

            observers.splice(i, 1);
            i--;
          }
        }
      });


      observer._deregistered = true;
    };

    EditorSession.prototype._notifyObservers = function _notifyObservers (stage) {
      var this$1 = this;







      var _observers = this._observers[stage];
      if (!_observers) { return }



      var observers = _observers.slice();
      for (var i = 0; i < observers.length; i++) {
        var o = observers[i];

        if (o._deregistered) { continue }
        if (!o.resource) {
          o.handler.call(o.context, this$1);
        } else if (o.resource === 'document') {
          if (!this$1.hasDocumentChanged()) { continue }
          var change = this$1.getChange();
          var info = this$1.getChangeInfo();
          var path = o.options.path;
          if (!path) {
            o.handler.call(o.context, change, info, this$1);
          } else if (change.isAffected(path)) {
            o.handler.call(o.context, change, info, this$1);
          }
        } else {
          if (!this$1.hasChanged(o.resource)) { continue }
          var resource = this$1.get(o.resource);
          o.handler.call(o.context, resource, this$1);
        }
      }
    };

    EditorSession.prototype._setDirty = function _setDirty (resource) {
      this._dirtyFlags[resource] = true;
    };

    EditorSession.prototype._resetFlow = function _resetFlow () {
      var this$1 = this;

      Object.keys(this._dirtyFlags).forEach(function (resource) {
        this$1._dirtyFlags[resource] = false;
      });
      this._change = null;
      this._info = null;
    };

    return EditorSession;
  }(EventEmitter));

  function request(method, url, data, cb) {
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var res = request.responseText;
        if(isJson(res)) { res = JSON.parse(res); }
        cb(null, res);
      } else {
        return cb(new Error('Request failed. Returned status: ' + request.status))
      }
    };

    if (data) {
      request.send(JSON.stringify(data));
    } else {
      request.send();
    }
  }

  function isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false
    }
    return true
  }

  var DocumentClient = function DocumentClient(config) {
    this.config = config;
  };


  DocumentClient.prototype.createDocument = function createDocument (newDocument, cb) {
    request('POST', this.config.httpUrl, newDocument, cb);
  };



  DocumentClient.prototype.getDocument = function getDocument (documentId, cb) {
    request('GET', this.config.httpUrl+documentId, null, cb);
  };



  DocumentClient.prototype.deleteDocument = function deleteDocument (documentId, cb) {
    request('DELETE', this.config.httpUrl+documentId, null, cb);
  };

  var NAN$1 = 0 / 0;


  function baseToNumber(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol(value)) {
      return NAN$1;
    }
    return +value;
  }

  function createMathOperation(operator) {
    return function(value, other) {
      var result;
      if (value === undefined && other === undefined) {
        return 0;
      }
      if (value !== undefined) {
        result = value;
      }
      if (other !== undefined) {
        if (result === undefined) {
          return other;
        }
        if (typeof value == 'string' || typeof other == 'string') {
          value = baseToString(value);
          other = baseToString(other);
        } else {
          value = baseToNumber(value);
          other = baseToNumber(other);
        }
        result = operator(value, other);
      }
      return result;
    };
  }

  var add = createMathOperation(function(augend, addend) {
    return augend + addend;
  });

  var FUNC_ERROR_TEXT$2 = 'Expected a function';


  function after(n, func) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$2);
    }
    n = toInteger(n);
    return function() {
      if (--n < 1) {
        return func.apply(this, arguments);
      }
    };
  }

  function identity(value) {
    return value;
  }

  var WeakMap$1 = getNative(root, 'WeakMap');

  var metaMap = WeakMap$1 && new WeakMap$1;

  var baseSetData = !metaMap ? identity : function(func, data) {
    metaMap.set(func, data);
    return func;
  };

  var objectCreate = Object.create;


  function baseCreate(proto) {
    return isObject$1(proto) ? objectCreate(proto) : {};
  }

  function createCtorWrapper(Ctor) {
    return function() {



      var args = arguments;
      switch (args.length) {
        case 0: return new Ctor;
        case 1: return new Ctor(args[0]);
        case 2: return new Ctor(args[0], args[1]);
        case 3: return new Ctor(args[0], args[1], args[2]);
        case 4: return new Ctor(args[0], args[1], args[2], args[3]);
        case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
        case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
        case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
      }
      var thisBinding = baseCreate(Ctor.prototype),
          result = Ctor.apply(thisBinding, args);



      return isObject$1(result) ? result : thisBinding;
    };
  }

  var BIND_FLAG$1 = 1;


  function createBaseWrapper(func, bitmask, thisArg) {
    var isBind = bitmask & BIND_FLAG$1,
        Ctor = createCtorWrapper(func);

    function wrapper() {
      var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
      return fn.apply(isBind ? thisArg : this, arguments);
    }
    return wrapper;
  }

  var nativeMax$2 = Math.max;


  function composeArgs(args, partials, holders, isCurried) {
    var argsIndex = -1,
        argsLength = args.length,
        holdersLength = holders.length,
        leftIndex = -1,
        leftLength = partials.length,
        rangeLength = nativeMax$2(argsLength - holdersLength, 0),
        result = Array(leftLength + rangeLength),
        isUncurried = !isCurried;

    while (++leftIndex < leftLength) {
      result[leftIndex] = partials[leftIndex];
    }
    while (++argsIndex < holdersLength) {
      if (isUncurried || argsIndex < argsLength) {
        result[holders[argsIndex]] = args[argsIndex];
      }
    }
    while (rangeLength--) {
      result[leftIndex++] = args[argsIndex++];
    }
    return result;
  }

  var nativeMax$3 = Math.max;


  function composeArgsRight(args, partials, holders, isCurried) {
    var argsIndex = -1,
        argsLength = args.length,
        holdersIndex = -1,
        holdersLength = holders.length,
        rightIndex = -1,
        rightLength = partials.length,
        rangeLength = nativeMax$3(argsLength - holdersLength, 0),
        result = Array(rangeLength + rightLength),
        isUncurried = !isCurried;

    while (++argsIndex < rangeLength) {
      result[argsIndex] = args[argsIndex];
    }
    var offset = argsIndex;
    while (++rightIndex < rightLength) {
      result[offset + rightIndex] = partials[rightIndex];
    }
    while (++holdersIndex < holdersLength) {
      if (isUncurried || argsIndex < argsLength) {
        result[offset + holders[holdersIndex]] = args[argsIndex++];
      }
    }
    return result;
  }

  function countHolders(array, placeholder) {
    var length = array.length,
        result = 0;

    while (length--) {
      if (array[length] === placeholder) {
        result++;
      }
    }
    return result;
  }

  function baseLodash() {

  }

  var MAX_ARRAY_LENGTH = 4294967295;


  function LazyWrapper(value) {
    this.__wrapped__ = value;
    this.__actions__ = [];
    this.__dir__ = 1;
    this.__filtered__ = false;
    this.__iteratees__ = [];
    this.__takeCount__ = MAX_ARRAY_LENGTH;
    this.__views__ = [];
  }


  LazyWrapper.prototype = baseCreate(baseLodash.prototype);
  LazyWrapper.prototype.constructor = LazyWrapper;

  function noop() {

  }

  var getData = !metaMap ? noop : function(func) {
    return metaMap.get(func);
  };

  var realNames = {};

  var objectProto$7 = Object.prototype;


  var hasOwnProperty$5 = objectProto$7.hasOwnProperty;


  function getFuncName(func) {
    var result = (func.name + ''),
        array = realNames[result],
        length = hasOwnProperty$5.call(realNames, result) ? array.length : 0;

    while (length--) {
      var data = array[length],
          otherFunc = data.func;
      if (otherFunc == null || otherFunc == func) {
        return data.name;
      }
    }
    return result;
  }

  function LodashWrapper(value, chainAll) {
    this.__wrapped__ = value;
    this.__actions__ = [];
    this.__chain__ = !!chainAll;
    this.__index__ = 0;
    this.__values__ = undefined;
  }

  LodashWrapper.prototype = baseCreate(baseLodash.prototype);
  LodashWrapper.prototype.constructor = LodashWrapper;

  function copyArray(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  function wrapperClone(wrapper) {
    if (wrapper instanceof LazyWrapper) {
      return wrapper.clone();
    }
    var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
    result.__actions__ = copyArray(wrapper.__actions__);
    result.__index__  = wrapper.__index__;
    result.__values__ = wrapper.__values__;
    return result;
  }

  var objectProto$8 = Object.prototype;


  var hasOwnProperty$6 = objectProto$8.hasOwnProperty;


  function lodash(value) {
    if (isObjectLike(value) && !isArray$1(value) && !(value instanceof LazyWrapper)) {
      if (value instanceof LodashWrapper) {
        return value;
      }
      if (hasOwnProperty$6.call(value, '__wrapped__')) {
        return wrapperClone(value);
      }
    }
    return new LodashWrapper(value);
  }


  lodash.prototype = baseLodash.prototype;
  lodash.prototype.constructor = lodash;

  function isLaziable(func) {
    var funcName = getFuncName(func),
        other = lodash[funcName];

    if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
      return false;
    }
    if (func === other) {
      return true;
    }
    var data = getData(other);
    return !!data && func === data[0];
  }

  function now() {
    return Date.now();
  }

  var HOT_COUNT = 150;
  var HOT_SPAN = 16;


  var setData = (function() {
    var count = 0,
        lastCalled = 0;

    return function(key, value) {
      var stamp = now(),
          remaining = HOT_SPAN - (stamp - lastCalled);

      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return key;
        }
      } else {
        count = 0;
      }
      return baseSetData(key, value);
    };
  }());

  var BIND_FLAG$3 = 1;
  var BIND_KEY_FLAG$2 = 2;
  var CURRY_BOUND_FLAG = 4;
  var CURRY_FLAG$2 = 8;
  var PARTIAL_FLAG$1 = 32;
  var PARTIAL_RIGHT_FLAG$1 = 64;


  function createRecurryWrapper(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
    var isCurry = bitmask & CURRY_FLAG$2,
        newHolders = isCurry ? holders : undefined,
        newHoldersRight = isCurry ? undefined : holders,
        newPartials = isCurry ? partials : undefined,
        newPartialsRight = isCurry ? undefined : partials;

    bitmask |= (isCurry ? PARTIAL_FLAG$1 : PARTIAL_RIGHT_FLAG$1);
    bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG$1 : PARTIAL_FLAG$1);

    if (!(bitmask & CURRY_BOUND_FLAG)) {
      bitmask &= ~(BIND_FLAG$3 | BIND_KEY_FLAG$2);
    }
    var newData = [
      func, bitmask, thisArg, newPartials, newHolders, newPartialsRight,
      newHoldersRight, argPos, ary, arity
    ];

    var result = wrapFunc.apply(undefined, newData);
    if (isLaziable(func)) {
      setData(result, newData);
    }
    result.placeholder = placeholder;
    return result;
  }

  function getHolder(func) {
    var object = func;
    return object.placeholder;
  }

  var nativeMin = Math.min;


  function reorder(array, indexes) {
    var arrLength = array.length,
        length = nativeMin(indexes.length, arrLength),
        oldArray = copyArray(array);

    while (length--) {
      var index = indexes[length];
      array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
    }
    return array;
  }

  var PLACEHOLDER = '__lodash_placeholder__';


  function replaceHolders(array, placeholder) {
    var index = -1,
        length = array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (value === placeholder || value === PLACEHOLDER) {
        array[index] = PLACEHOLDER;
        result[resIndex++] = index;
      }
    }
    return result;
  }

  var BIND_FLAG$2 = 1;
  var BIND_KEY_FLAG$1 = 2;
  var CURRY_FLAG$1 = 8;
  var CURRY_RIGHT_FLAG$1 = 16;
  var ARY_FLAG$1 = 128;
  var FLIP_FLAG = 512;


  function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
    var isAry = bitmask & ARY_FLAG$1,
        isBind = bitmask & BIND_FLAG$2,
        isBindKey = bitmask & BIND_KEY_FLAG$1,
        isCurried = bitmask & (CURRY_FLAG$1 | CURRY_RIGHT_FLAG$1),
        isFlip = bitmask & FLIP_FLAG,
        Ctor = isBindKey ? undefined : createCtorWrapper(func);

    function wrapper() {
      var arguments$1 = arguments;

      var length = arguments.length,
          args = Array(length),
          index = length;

      while (index--) {
        args[index] = arguments$1[index];
      }
      if (isCurried) {
        var placeholder = getHolder(wrapper),
            holdersCount = countHolders(args, placeholder);
      }
      if (partials) {
        args = composeArgs(args, partials, holders, isCurried);
      }
      if (partialsRight) {
        args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
      }
      length -= holdersCount;
      if (isCurried && length < arity) {
        var newHolders = replaceHolders(args, placeholder);
        return createRecurryWrapper(
            func, bitmask, createHybridWrapper, wrapper.placeholder, thisArg,
            args, newHolders, argPos, ary, arity - length
        );
      }
      var thisBinding = isBind ? thisArg : this,
          fn = isBindKey ? thisBinding[func] : func;

      length = args.length;
      if (argPos) {
        args = reorder(args, argPos);
      } else if (isFlip && length > 1) {
        args.reverse();
      }
      if (isAry && ary < length) {
        args.length = ary;
      }
      if (this && this !== root && this instanceof wrapper) {
        fn = Ctor || createCtorWrapper(fn);
      }
      return fn.apply(thisBinding, args);
    }
    return wrapper;
  }

  function createCurryWrapper(func, bitmask, arity) {
    var Ctor = createCtorWrapper(func);

    function wrapper() {
      var arguments$1 = arguments;

      var length = arguments.length,
          args = Array(length),
          index = length,
          placeholder = getHolder(wrapper);

      while (index--) {
        args[index] = arguments$1[index];
      }
      var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
          ? []
          : replaceHolders(args, placeholder);

      length -= holders.length;
      if (length < arity) {
        return createRecurryWrapper(
            func, bitmask, createHybridWrapper, wrapper.placeholder, undefined,
            args, holders, undefined, undefined, arity - length);
      }
      var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
      return apply(fn, this, args);
    }
    return wrapper;
  }

  var BIND_FLAG$4 = 1;


  function createPartialWrapper(func, bitmask, thisArg, partials) {
    var isBind = bitmask & BIND_FLAG$4,
        Ctor = createCtorWrapper(func);

    function wrapper() {
      var arguments$1 = arguments;

      var argsIndex = -1,
          argsLength = arguments.length,
          leftIndex = -1,
          leftLength = partials.length,
          args = Array(leftLength + argsLength),
          fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;

      while (++leftIndex < leftLength) {
        args[leftIndex] = partials[leftIndex];
      }
      while (argsLength--) {
        args[leftIndex++] = arguments$1[++argsIndex];
      }
      return apply(fn, isBind ? thisArg : this, args);
    }
    return wrapper;
  }

  var PLACEHOLDER$1 = '__lodash_placeholder__';


  var BIND_FLAG$5 = 1;
  var BIND_KEY_FLAG$3 = 2;
  var CURRY_BOUND_FLAG$1 = 4;
  var CURRY_FLAG$3 = 8;
  var ARY_FLAG$2 = 128;
  var REARG_FLAG = 256;


  var nativeMin$1 = Math.min;


  function mergeData(data, source) {
    var bitmask = data[1],
        srcBitmask = source[1],
        newBitmask = bitmask | srcBitmask,
        isCommon = newBitmask < (BIND_FLAG$5 | BIND_KEY_FLAG$3 | ARY_FLAG$2);

    var isCombo =
        ((srcBitmask == ARY_FLAG$2) && (bitmask == CURRY_FLAG$3)) ||
        ((srcBitmask == ARY_FLAG$2) && (bitmask == REARG_FLAG) && (data[7].length <= source[8])) ||
        ((srcBitmask == (ARY_FLAG$2 | REARG_FLAG)) && (source[7].length <= source[8]) && (bitmask == CURRY_FLAG$3));


    if (!(isCommon || isCombo)) {
      return data;
    }

    if (srcBitmask & BIND_FLAG$5) {
      data[2] = source[2];

      newBitmask |= bitmask & BIND_FLAG$5 ? 0 : CURRY_BOUND_FLAG$1;
    }

    var value = source[3];
    if (value) {
      var partials = data[3];
      data[3] = partials ? composeArgs(partials, value, source[4]) : value;
      data[4] = partials ? replaceHolders(data[3], PLACEHOLDER$1) : source[4];
    }

    value = source[5];
    if (value) {
      partials = data[5];
      data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
      data[6] = partials ? replaceHolders(data[5], PLACEHOLDER$1) : source[6];
    }

    value = source[7];
    if (value) {
      data[7] = value;
    }

    if (srcBitmask & ARY_FLAG$2) {
      data[8] = data[8] == null ? source[8] : nativeMin$1(data[8], source[8]);
    }

    if (data[9] == null) {
      data[9] = source[9];
    }

    data[0] = source[0];
    data[1] = newBitmask;

    return data;
  }

  var FUNC_ERROR_TEXT$3 = 'Expected a function';


  var BIND_FLAG = 1;
  var BIND_KEY_FLAG = 2;
  var CURRY_FLAG = 8;
  var CURRY_RIGHT_FLAG = 16;
  var PARTIAL_FLAG = 32;
  var PARTIAL_RIGHT_FLAG = 64;


  var nativeMax$1 = Math.max;


  function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
    var isBindKey = bitmask & BIND_KEY_FLAG;
    if (!isBindKey && typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$3);
    }
    var length = partials ? partials.length : 0;
    if (!length) {
      bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
      partials = holders = undefined;
    }
    ary = ary === undefined ? ary : nativeMax$1(toInteger(ary), 0);
    arity = arity === undefined ? arity : toInteger(arity);
    length -= holders ? holders.length : 0;

    if (bitmask & PARTIAL_RIGHT_FLAG) {
      var partialsRight = partials,
          holdersRight = holders;

      partials = holders = undefined;
    }
    var data = isBindKey ? undefined : getData(func);

    var newData = [
      func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,
      argPos, ary, arity
    ];

    if (data) {
      mergeData(newData, data);
    }
    func = newData[0];
    bitmask = newData[1];
    thisArg = newData[2];
    partials = newData[3];
    holders = newData[4];
    arity = newData[9] = newData[9] == null
        ? (isBindKey ? 0 : func.length)
        : nativeMax$1(newData[9] - length, 0);

    if (!arity && bitmask & (CURRY_FLAG | CURRY_RIGHT_FLAG)) {
      bitmask &= ~(CURRY_FLAG | CURRY_RIGHT_FLAG);
    }
    if (!bitmask || bitmask == BIND_FLAG) {
      var result = createBaseWrapper(func, bitmask, thisArg);
    } else if (bitmask == CURRY_FLAG || bitmask == CURRY_RIGHT_FLAG) {
      result = createCurryWrapper(func, bitmask, arity);
    } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !holders.length) {
      result = createPartialWrapper(func, bitmask, thisArg, partials);
    } else {
      result = createHybridWrapper.apply(undefined, newData);
    }
    var setter = data ? baseSetData : setData;
    return setter(result, newData);
  }

  var ARY_FLAG = 128;


  function ary(func, n, guard) {
    n = guard ? undefined : n;
    n = (func && n == null) ? func.length : n;
    return createWrapper(func, ARY_FLAG, undefined, undefined, undefined, undefined, n);
  }

  function copyObject(source, props, object, customizer) {
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : source[key];

      assignValue(object, key, newValue);
    }
    return object;
  }

  function isIterateeCall(value, index, object) {
    if (!isObject$1(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number'
            ? (isArrayLike(object) && isIndex(index, object.length))
            : (type == 'string' && index in object)
    ) {
      return eq(object[index], value);
    }
    return false;
  }

  function createAssigner(assigner) {
    return rest(function(object, sources) {
      var index = -1,
          length = sources.length,
          customizer = length > 1 ? sources[length - 1] : undefined,
          guard = length > 2 ? sources[2] : undefined;

      customizer = (assigner.length > 3 && typeof customizer == 'function')
          ? (length--, customizer)
          : undefined;

      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? undefined : customizer;
        length = 1;
      }
      object = Object(object);
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, index, customizer);
        }
      }
      return object;
    });
  }

  var objectProto$10 = Object.prototype;


  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$10;

    return value === proto;
  }

  var nativeKeys = Object.keys;


  function baseKeys(object) {
    return nativeKeys(Object(object));
  }

  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  var argsTag = '[object Arguments]';


  var objectProto$11 = Object.prototype;


  var hasOwnProperty$8 = objectProto$11.hasOwnProperty;


  var objectToString$2 = objectProto$11.toString;


  var propertyIsEnumerable$1 = objectProto$11.propertyIsEnumerable;


  function isArguments(value) {

    return isArrayLikeObject(value) && hasOwnProperty$8.call(value, 'callee') &&
        (!propertyIsEnumerable$1.call(value, 'callee') || objectToString$2.call(value) == argsTag);
  }

  var stringTag = '[object String]';


  var objectProto$12 = Object.prototype;


  var objectToString$3 = objectProto$12.toString;


  function isString$1(value) {
    return typeof value == 'string' ||
        (!isArray$1(value) && isObjectLike(value) && objectToString$3.call(value) == stringTag);
  }

  function indexKeys(object) {
    var length = object ? object.length : undefined;
    if (isLength(length) &&
        (isArray$1(object) || isString$1(object) || isArguments(object))) {
      return baseTimes(length, String);
    }
    return null;
  }

  function keys$1(object) {
    var isProto = isPrototype(object);
    if (!(isProto || isArrayLike(object))) {
      return baseKeys(object);
    }
    var indexes = indexKeys(object),
        skipIndexes = !!indexes,
        result = indexes || [],
        length = result.length;

    for (var key in object) {
      if (baseHas(object, key) &&
          !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
          !(isProto && key == 'constructor')) {
        result.push(key);
      }
    }
    return result;
  }

  var objectProto$9 = Object.prototype;


  var hasOwnProperty$7 = objectProto$9.hasOwnProperty;


  var propertyIsEnumerable = objectProto$9.propertyIsEnumerable;


  var nonEnumShadows = !propertyIsEnumerable.call({ 'valueOf': 1 }, 'valueOf');


  var assign = createAssigner(function(object, source) {
    if (nonEnumShadows || isPrototype(source) || isArrayLike(source)) {
      copyObject(source, keys$1(source), object);
      return;
    }
    for (var key in source) {
      if (hasOwnProperty$7.call(source, key)) {
        assignValue(object, key, source[key]);
      }
    }
  });

  var Reflect = root.Reflect;

  function iteratorToArray(iterator) {
    var data,
        result = [];

    while (!(data = iterator.next()).done) {
      result.push(data.value);
    }
    return result;
  }

  var objectProto$15 = Object.prototype;


  var enumerate = Reflect ? Reflect.enumerate : undefined;
  var propertyIsEnumerable$3 = objectProto$15.propertyIsEnumerable;


  function baseKeysIn(object) {
    object = object == null ? object : Object(object);

    var result = [];
    for (var key in object) {
      result.push(key);
    }
    return result;
  }


  if (enumerate && !propertyIsEnumerable$3.call({ 'valueOf': 1 }, 'valueOf')) {
    baseKeysIn = function(object) {
      return iteratorToArray(enumerate(object));
    };
  }

  var baseKeysIn$1 = baseKeysIn;

  var objectProto$14 = Object.prototype;


  var hasOwnProperty$9 = objectProto$14.hasOwnProperty;


  function keysIn(object) {
    var index = -1,
        isProto = isPrototype(object),
        props = baseKeysIn$1(object),
        propsLength = props.length,
        indexes = indexKeys(object),
        skipIndexes = !!indexes,
        result = indexes || [],
        length = result.length;

    while (++index < propsLength) {
      var key = props[index];
      if (!(skipIndexes && (key == 'length' || isIndex(key, length))) &&
          !(key == 'constructor' && (isProto || !hasOwnProperty$9.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  var objectProto$13 = Object.prototype;


  var propertyIsEnumerable$2 = objectProto$13.propertyIsEnumerable;


  var nonEnumShadows$1 = !propertyIsEnumerable$2.call({ 'valueOf': 1 }, 'valueOf');


  var assignIn = createAssigner(function(object, source) {
    if (nonEnumShadows$1 || isPrototype(source) || isArrayLike(source)) {
      copyObject(source, keysIn(source), object);
      return;
    }
    for (var key in source) {
      assignValue(object, key, source[key]);
    }
  });

  var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
    copyObject(source, keysIn(source), object, customizer);
  });

  var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
    copyObject(source, keys$1(source), object, customizer);
  });

  function baseAt(object, paths) {
    var index = -1,
        isNil = object == null,
        length = paths.length,
        result = Array(length);

    while (++index < length) {
      result[index] = isNil ? undefined : get(object, paths[index]);
    }
    return result;
  }

  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  function isFlattenable(value) {
    return isArray$1(value) || isArguments(value);
  }

  function baseFlatten(array, depth, predicate, isStrict, result) {
    var index = -1,
        length = array.length;

    predicate || (predicate = isFlattenable);
    result || (result = []);

    while (++index < length) {
      var value = array[index];
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {

          baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }

  var at = rest(function(object, paths) {
    return baseAt(object, baseFlatten(paths, 1));
  });

  var errorTag = '[object Error]';


  var objectProto$16 = Object.prototype;


  var objectToString$4 = objectProto$16.toString;


  function isError(value) {
    if (!isObjectLike(value)) {
      return false;
    }
    return (objectToString$4.call(value) == errorTag) ||
        (typeof value.message == 'string' && typeof value.name == 'string');
  }

  var attempt = rest(function(func, args) {
    try {
      return apply(func, undefined, args);
    } catch (e) {
      return isError(e) ? e : new Error(e);
    }
  });

  var FUNC_ERROR_TEXT$4 = 'Expected a function';


  function before(n, func) {
    var result;
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$4);
    }
    n = toInteger(n);
    return function() {
      if (--n > 0) {
        result = func.apply(this, arguments);
      }
      if (n <= 1) {
        func = undefined;
      }
      return result;
    };
  }

  var BIND_FLAG$6 = 1;
  var PARTIAL_FLAG$2 = 32;


  var bind = rest(function(func, thisArg, partials) {
    var bitmask = BIND_FLAG$6;
    if (partials.length) {
      var holders = replaceHolders(partials, getHolder(bind));
      bitmask |= PARTIAL_FLAG$2;
    }
    return createWrapper(func, bitmask, thisArg, partials, holders);
  });


  bind.placeholder = {};

  function arrayEach(array, iteratee) {
    var index = -1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  var bindAll = rest(function(object, methodNames) {
    arrayEach(baseFlatten(methodNames, 1), function(key) {
      key = toKey(key);
      object[key] = bind(object[key], object);
    });
    return object;
  });

  var BIND_FLAG$7 = 1;
  var BIND_KEY_FLAG$4 = 2;
  var PARTIAL_FLAG$3 = 32;


  var bindKey = rest(function(object, key, partials) {
    var bitmask = BIND_FLAG$7 | BIND_KEY_FLAG$4;
    if (partials.length) {
      var holders = replaceHolders(partials, getHolder(bindKey));
      bitmask |= PARTIAL_FLAG$3;
    }
    return createWrapper(key, bitmask, object, partials, holders);
  });


  bindKey.placeholder = {};

  function castSlice(array, start, end) {
    var length = array.length;
    end = end === undefined ? length : end;
    return (!start && end >= length) ? array : baseSlice(array, start, end);
  }

  var rsAstralRange = '\\ud800-\\udfff';
  var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23';
  var rsComboSymbolsRange = '\\u20d0-\\u20f0';
  var rsVarRange = '\\ufe0e\\ufe0f';


  var rsZWJ = '\\u200d';


  var reHasComplexSymbol = RegExp('[' + rsZWJ + rsAstralRange  + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');

  var rsAstralRange$1 = '\\ud800-\\udfff';
  var rsComboMarksRange$1 = '\\u0300-\\u036f\\ufe20-\\ufe23';
  var rsComboSymbolsRange$1 = '\\u20d0-\\u20f0';
  var rsVarRange$1 = '\\ufe0e\\ufe0f';


  var rsAstral = '[' + rsAstralRange$1 + ']';
  var rsCombo = '[' + rsComboMarksRange$1 + rsComboSymbolsRange$1 + ']';
  var rsFitz = '\\ud83c[\\udffb-\\udfff]';
  var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
  var rsNonAstral = '[^' + rsAstralRange$1 + ']';
  var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
  var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
  var rsZWJ$1 = '\\u200d';


  var reOptMod = rsModifier + '?';
  var rsOptVar = '[' + rsVarRange$1 + ']?';
  var rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
  var rsSeq = rsOptVar + reOptMod + rsOptJoin;
  var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';


  var reComplexSymbol = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');


  function stringToArray(string) {
    return string.match(reComplexSymbol);
  }

  function createCaseFirst(methodName) {
    return function(string) {
      string = toString(string);

      var strSymbols = reHasComplexSymbol.test(string)
          ? stringToArray(string)
          : undefined;

      var chr = strSymbols
          ? strSymbols[0]
          : string.charAt(0);

      var trailing = strSymbols
          ? castSlice(strSymbols, 1).join('')
          : string.slice(1);

      return chr[methodName]() + trailing;
    };
  }

  var upperFirst = createCaseFirst('toUpperCase');

  function capitalize(string) {
    return upperFirst(toString(string).toLowerCase());
  }

  function arrayReduce(array, iteratee, accumulator, initAccum) {
    var index = -1,
        length = array ? array.length : 0;

    if (initAccum && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }

  var deburredLetters = {
    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
    '\xc7': 'C',  '\xe7': 'c',
    '\xd0': 'D',  '\xf0': 'd',
    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
    '\xcC': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
    '\xeC': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
    '\xd1': 'N',  '\xf1': 'n',
    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
    '\xc6': 'Ae', '\xe6': 'ae',
    '\xde': 'Th', '\xfe': 'th',
    '\xdf': 'ss'
  };


  function deburrLetter(letter) {
    return deburredLetters[letter];
  }

  var reLatin1 = /[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g;


  var rsComboMarksRange$2 = '\\u0300-\\u036f\\ufe20-\\ufe23';
  var rsComboSymbolsRange$2 = '\\u20d0-\\u20f0';


  var rsCombo$1 = '[' + rsComboMarksRange$2 + rsComboSymbolsRange$2 + ']';


  var reComboMark = RegExp(rsCombo$1, 'g');


  function deburr(string) {
    string = toString(string);
    return string && string.replace(reLatin1, deburrLetter).replace(reComboMark, '');
  }

  var reBasicWord = /[a-zA-Z0-9]+/g;


  var rsAstralRange$2 = '\\ud800-\\udfff';
  var rsComboMarksRange$3 = '\\u0300-\\u036f\\ufe20-\\ufe23';
  var rsComboSymbolsRange$3 = '\\u20d0-\\u20f0';
  var rsDingbatRange = '\\u2700-\\u27bf';
  var rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff';
  var rsMathOpRange = '\\xac\\xb1\\xd7\\xf7';
  var rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf';
  var rsPunctuationRange = '\\u2000-\\u206f';
  var rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000';
  var rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde';
  var rsVarRange$2 = '\\ufe0e\\ufe0f';
  var rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;


  var rsApos$1 = "['\u2019]";
  var rsBreak = '[' + rsBreakRange + ']';
  var rsCombo$2 = '[' + rsComboMarksRange$3 + rsComboSymbolsRange$3 + ']';
  var rsDigits = '\\d+';
  var rsDingbat = '[' + rsDingbatRange + ']';
  var rsLower = '[' + rsLowerRange + ']';
  var rsMisc = '[^' + rsAstralRange$2 + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']';
  var rsFitz$1 = '\\ud83c[\\udffb-\\udfff]';
  var rsModifier$1 = '(?:' + rsCombo$2 + '|' + rsFitz$1 + ')';
  var rsNonAstral$1 = '[^' + rsAstralRange$2 + ']';
  var rsRegional$1 = '(?:\\ud83c[\\udde6-\\uddff]){2}';
  var rsSurrPair$1 = '[\\ud800-\\udbff][\\udc00-\\udfff]';
  var rsUpper = '[' + rsUpperRange + ']';
  var rsZWJ$2 = '\\u200d';


  var rsLowerMisc = '(?:' + rsLower + '|' + rsMisc + ')';
  var rsUpperMisc = '(?:' + rsUpper + '|' + rsMisc + ')';
  var rsOptLowerContr = '(?:' + rsApos$1 + '(?:d|ll|m|re|s|t|ve))?';
  var rsOptUpperContr = '(?:' + rsApos$1 + '(?:D|LL|M|RE|S|T|VE))?';
  var reOptMod$1 = rsModifier$1 + '?';
  var rsOptVar$1 = '[' + rsVarRange$2 + ']?';
  var rsOptJoin$1 = '(?:' + rsZWJ$2 + '(?:' + [rsNonAstral$1, rsRegional$1, rsSurrPair$1].join('|') + ')' + rsOptVar$1 + reOptMod$1 + ')*';
  var rsSeq$1 = rsOptVar$1 + reOptMod$1 + rsOptJoin$1;
  var rsEmoji = '(?:' + [rsDingbat, rsRegional$1, rsSurrPair$1].join('|') + ')' + rsSeq$1;


  var reComplexWord = RegExp([
    rsUpper + '?' + rsLower + '+' + rsOptLowerContr + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
    rsUpperMisc + '+' + rsOptUpperContr + '(?=' + [rsBreak, rsUpper + rsLowerMisc, '$'].join('|') + ')',
    rsUpper + '?' + rsLowerMisc + '+' + rsOptLowerContr,
    rsUpper + '+' + rsOptUpperContr,
    rsDigits,
    rsEmoji
  ].join('|'), 'g');


  var reHasComplexWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;


  function words(string, pattern, guard) {
    string = toString(string);
    pattern = guard ? undefined : pattern;

    if (pattern === undefined) {
      pattern = reHasComplexWord.test(string) ? reComplexWord : reBasicWord;
    }
    return string.match(pattern) || [];
  }

  var rsApos = "['\u2019]";


  var reApos = RegExp(rsApos, 'g');


  function createCompounder(callback) {
    return function(string) {
      return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
    };
  }

  var camelCase = createCompounder(function(result, word, index) {
    word = word.toLowerCase();
    return result + (index ? capitalize(word) : word);
  });

  function castArray() {
    if (!arguments.length) {
      return [];
    }
    var value = arguments[0];
    return isArray$1(value) ? value : [value];
  }

  var nativeMin$2 = Math.min;


  function createRound(methodName) {
    var func = Math[methodName];
    return function(number, precision) {
      number = toNumber(number);
      precision = nativeMin$2(toInteger(precision), 292);
      if (precision) {


        var pair = (toString(number) + 'e').split('e'),
            value = func(pair[0] + 'e' + (+pair[1] + precision));

        pair = (toString(value) + 'e').split('e');
        return +(pair[0] + 'e' + (+pair[1] - precision));
      }
      return func(number);
    };
  }

  var ceil = createRound('ceil');

  function chain(value) {
    var result = lodash(value);
    result.__chain__ = true;
    return result;
  }

  var nativeCeil = Math.ceil;
  var nativeMax$4 = Math.max;


  function chunk(array, size, guard) {
    if ((guard ? isIterateeCall(array, size, guard) : size === undefined)) {
      size = 1;
    } else {
      size = nativeMax$4(toInteger(size), 0);
    }
    var length = array ? array.length : 0;
    if (!length || size < 1) {
      return [];
    }
    var index = 0,
        resIndex = 0,
        result = Array(nativeCeil(length / size));

    while (index < length) {
      result[resIndex++] = baseSlice(array, index, (index += size));
    }
    return result;
  }

  function baseClamp(number, lower, upper) {
    if (number === number) {
      if (upper !== undefined) {
        number = number <= upper ? number : upper;
      }
      if (lower !== undefined) {
        number = number >= lower ? number : lower;
      }
    }
    return number;
  }

  function clamp(number, lower, upper) {
    if (upper === undefined) {
      upper = lower;
      lower = undefined;
    }
    if (upper !== undefined) {
      upper = toNumber(upper);
      upper = upper === upper ? upper : 0;
    }
    if (lower !== undefined) {
      lower = toNumber(lower);
      lower = lower === lower ? lower : 0;
    }
    return baseClamp(toNumber(number), lower, upper);
  }

  function stackClear() {
    this.__data__ = new ListCache;
  }

  function stackDelete(key) {
    return this.__data__['delete'](key);
  }

  function stackGet(key) {
    return this.__data__.get(key);
  }

  function stackHas(key) {
    return this.__data__.has(key);
  }

  var LARGE_ARRAY_SIZE$1 = 200;


  function stackSet(key, value) {
    var cache = this.__data__;
    if (cache instanceof ListCache && cache.__data__.length == LARGE_ARRAY_SIZE$1) {
      cache = this.__data__ = new MapCache(cache.__data__);
    }
    cache.set(key, value);
    return this;
  }

  function Stack(entries) {
    this.__data__ = new ListCache(entries);
  }


  Stack.prototype.clear = stackClear;
  Stack.prototype['delete'] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;

  function baseAssign(object, source) {
    return object && copyObject(source, keys$1(source), object);
  }

  function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var result = new buffer.constructor(buffer.length);
    buffer.copy(result);
    return result;
  }

  function stubArray() {
    return [];
  }

  var getOwnPropertySymbols = Object.getOwnPropertySymbols;


  function getSymbols(object) {


    return getOwnPropertySymbols(Object(object));
  }


  if (!getOwnPropertySymbols) {
    getSymbols = stubArray;
  }

  var getSymbols$1 = getSymbols;

  function copySymbols(source, object) {
    return copyObject(source, getSymbols$1(source), object);
  }

  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray$1(object) ? result : arrayPush(result, symbolsFunc(object));
  }

  function getAllKeys(object) {
    return baseGetAllKeys(object, keys$1, getSymbols$1);
  }

  var DataView = getNative(root, 'DataView');

  var Promise$1 = getNative(root, 'Promise');

  var Set$1 = getNative(root, 'Set');

  var mapTag$1 = '[object Map]';
  var objectTag$1 = '[object Object]';
  var promiseTag = '[object Promise]';
  var setTag$1 = '[object Set]';
  var weakMapTag$1 = '[object WeakMap]';

  var dataViewTag$1 = '[object DataView]';


  var objectProto$17 = Object.prototype;


  var objectToString$5 = objectProto$17.toString;


  var dataViewCtorString = toSource(DataView);
  var mapCtorString = toSource(Map$1);
  var promiseCtorString = toSource(Promise$1);
  var setCtorString = toSource(Set$1);
  var weakMapCtorString = toSource(WeakMap$1);


  function getTag(value) {
    return objectToString$5.call(value);
  }



  if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
      (Map$1 && getTag(new Map$1) != mapTag$1) ||
      (Promise$1 && getTag(Promise$1.resolve()) != promiseTag) ||
      (Set$1 && getTag(new Set$1) != setTag$1) ||
      (WeakMap$1 && getTag(new WeakMap$1) != weakMapTag$1)) {
    getTag = function(value) {
      var result = objectToString$5.call(value),
          Ctor = result == objectTag$1 ? value.constructor : undefined,
          ctorString = Ctor ? toSource(Ctor) : undefined;

      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString: return dataViewTag$1;
          case mapCtorString: return mapTag$1;
          case promiseCtorString: return promiseTag;
          case setCtorString: return setTag$1;
          case weakMapCtorString: return weakMapTag$1;
        }
      }
      return result;
    };
  }

  var getTag$1 = getTag;

  var objectProto$18 = Object.prototype;


  var hasOwnProperty$10 = objectProto$18.hasOwnProperty;


  function initCloneArray(array) {
    var length = array.length,
        result = array.constructor(length);


    if (length && typeof array[0] == 'string' && hasOwnProperty$10.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  var Uint8Array = root.Uint8Array;

  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array(result).set(new Uint8Array(arrayBuffer));
    return result;
  }

  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }

  function addMapEntry(map, pair) {

    map.set(pair[0], pair[1]);
    return map;
  }

  function mapToArray(map) {
    var index = -1,
        result = Array(map.size);

    map.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }

  function cloneMap(map, isDeep, cloneFunc) {
    var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
    return arrayReduce(array, addMapEntry, new map.constructor);
  }

  var reFlags = /\w*$/;


  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }

  function addSetEntry(set, value) {
    set.add(value);
    return set;
  }

  function setToArray(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }

  function cloneSet(set, isDeep, cloneFunc) {
    var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
    return arrayReduce(array, addSetEntry, new set.constructor);
  }

  var symbolProto$1 = Symbol ? Symbol.prototype : undefined;
  var symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;


  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }

  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }

  var boolTag$1 = '[object Boolean]';
  var dateTag$1 = '[object Date]';
  var mapTag$2 = '[object Map]';
  var numberTag$1 = '[object Number]';
  var regexpTag$1 = '[object RegExp]';
  var setTag$2 = '[object Set]';
  var stringTag$2 = '[object String]';
  var symbolTag$2 = '[object Symbol]';

  var arrayBufferTag$1 = '[object ArrayBuffer]';
  var dataViewTag$2 = '[object DataView]';
  var float32Tag$1 = '[object Float32Array]';
  var float64Tag$1 = '[object Float64Array]';
  var int8Tag$1 = '[object Int8Array]';
  var int16Tag$1 = '[object Int16Array]';
  var int32Tag$1 = '[object Int32Array]';
  var uint8Tag$1 = '[object Uint8Array]';
  var uint8ClampedTag$1 = '[object Uint8ClampedArray]';
  var uint16Tag$1 = '[object Uint16Array]';
  var uint32Tag$1 = '[object Uint32Array]';


  function initCloneByTag(object, tag, cloneFunc, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag$1:
        return cloneArrayBuffer(object);

      case boolTag$1:
      case dateTag$1:
        return new Ctor(+object);

      case dataViewTag$2:
        return cloneDataView(object, isDeep);

      case float32Tag$1: case float64Tag$1:
      case int8Tag$1: case int16Tag$1: case int32Tag$1:
      case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
      return cloneTypedArray(object, isDeep);

      case mapTag$2:
        return cloneMap(object, isDeep, cloneFunc);

      case numberTag$1:
      case stringTag$2:
        return new Ctor(object);

      case regexpTag$1:
        return cloneRegExp(object);

      case setTag$2:
        return cloneSet(object, isDeep, cloneFunc);

      case symbolTag$2:
        return cloneSymbol(object);
    }
  }

  function initCloneObject(object) {
    return (typeof object.constructor == 'function' && !isPrototype(object))
        ? baseCreate(getPrototype(object))
        : {};
  }

  function stubFalse() {
    return false;
  }

  var freeExports = typeof exports == 'object' && exports;


  var freeModule = freeExports && typeof module == 'object' && module;


  var moduleExports = freeModule && freeModule.exports === freeExports;


  var Buffer = moduleExports ? root.Buffer : undefined;


  var isBuffer = !Buffer ? stubFalse : function(value) {
    return value instanceof Buffer;
  };

  var argsTag$1 = '[object Arguments]';
  var arrayTag = '[object Array]';
  var boolTag = '[object Boolean]';
  var dateTag = '[object Date]';
  var errorTag$1 = '[object Error]';
  var funcTag$1 = '[object Function]';
  var genTag$1 = '[object GeneratorFunction]';
  var mapTag = '[object Map]';
  var numberTag = '[object Number]';
  var objectTag = '[object Object]';
  var regexpTag = '[object RegExp]';
  var setTag = '[object Set]';
  var stringTag$1 = '[object String]';
  var symbolTag$1 = '[object Symbol]';
  var weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]';
  var dataViewTag = '[object DataView]';
  var float32Tag = '[object Float32Array]';
  var float64Tag = '[object Float64Array]';
  var int8Tag = '[object Int8Array]';
  var int16Tag = '[object Int16Array]';
  var int32Tag = '[object Int32Array]';
  var uint8Tag = '[object Uint8Array]';
  var uint8ClampedTag = '[object Uint8ClampedArray]';
  var uint16Tag = '[object Uint16Array]';
  var uint32Tag = '[object Uint32Array]';


  var cloneableTags = {};
  cloneableTags[argsTag$1] = cloneableTags[arrayTag] =
      cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
          cloneableTags[boolTag] = cloneableTags[dateTag] =
              cloneableTags[float32Tag] = cloneableTags[float64Tag] =
                  cloneableTags[int8Tag] = cloneableTags[int16Tag] =
                      cloneableTags[int32Tag] = cloneableTags[mapTag] =
                          cloneableTags[numberTag] = cloneableTags[objectTag] =
                              cloneableTags[regexpTag] = cloneableTags[setTag] =
                                  cloneableTags[stringTag$1] = cloneableTags[symbolTag$1] =
                                      cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
                                          cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag$1] = cloneableTags[funcTag$1] =
      cloneableTags[weakMapTag] = false;


  function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
    var result;
    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject$1(value)) {
      return value;
    }
    var isArr = isArray$1(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray(value, result);
      }
    } else {
      var tag = getTag$1(value),
          isFunc = tag == funcTag$1 || tag == genTag$1;

      if (isBuffer(value)) {
        return cloneBuffer(value, isDeep);
      }
      if (tag == objectTag || tag == argsTag$1 || (isFunc && !object)) {
        if (isHostObject(value)) {
          return object ? value : {};
        }
        result = initCloneObject(isFunc ? {} : value);
        if (!isDeep) {
          return copySymbols(value, baseAssign(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = initCloneByTag(value, tag, baseClone, isDeep);
      }
    }

    stack || (stack = new Stack);
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);

    if (!isArr) {
      var props = isFull ? getAllKeys(value) : keys$1(value);
    }

    arrayEach(props || value, function(subValue, key) {
      if (props) {
        key = subValue;
        subValue = value[key];
      }
      assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
    });
    return result;
  }

  function clone$2(value) {
    return baseClone(value, false, true);
  }

  function cloneDeep$2(value) {
    return baseClone(value, true, true);
  }

  function cloneDeepWith(value, customizer) {
    return baseClone(value, true, true, customizer);
  }

  function cloneWith(value, customizer) {
    return baseClone(value, false, true, customizer);
  }

  function wrapperCommit() {
    return new LodashWrapper(this.value(), this.__chain__);
  }

  function compact(array) {
    var index = -1,
        length = array ? array.length : 0,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (value) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  function concat() {
    var arguments$1 = arguments;

    var length = arguments.length,
        args = Array(length ? length - 1 : 0),
        array = arguments[0],
        index = length;

    while (index--) {
      args[index - 1] = arguments$1[index];
    }
    return length
        ? arrayPush(isArray$1(array) ? copyArray(array) : [array], baseFlatten(args, 1))
        : [];
  }

  function arraySome(array, predicate) {
    var index = -1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }

  var UNORDERED_COMPARE_FLAG$1 = 1;
  var PARTIAL_COMPARE_FLAG$2 = 2;


  function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
    var isPartial = bitmask & PARTIAL_COMPARE_FLAG$2,
        arrLength = array.length,
        othLength = other.length;

    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }

    var stacked = stack.get(array);
    if (stacked) {
      return stacked == other;
    }
    var index = -1,
        result = true,
        seen = (bitmask & UNORDERED_COMPARE_FLAG$1) ? new SetCache : undefined;

    stack.set(array, other);


    while (++index < arrLength) {
      var arrValue = array[index],
          othValue = other[index];

      if (customizer) {
        var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack);
      }
      if (compared !== undefined) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }

      if (seen) {
        if (!arraySome(other, function(othValue, othIndex) {
              if (!seen.has(othIndex) &&
                  (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
                return seen.add(othIndex);
              }
            })) {
          result = false;
          break;
        }
      } else if (!(
              arrValue === othValue ||
              equalFunc(arrValue, othValue, customizer, bitmask, stack)
          )) {
        result = false;
        break;
      }
    }
    stack['delete'](array);
    return result;
  }

  var UNORDERED_COMPARE_FLAG$2 = 1;
  var PARTIAL_COMPARE_FLAG$3 = 2;


  var boolTag$2 = '[object Boolean]';
  var dateTag$2 = '[object Date]';
  var errorTag$2 = '[object Error]';
  var mapTag$3 = '[object Map]';
  var numberTag$2 = '[object Number]';
  var regexpTag$2 = '[object RegExp]';
  var setTag$3 = '[object Set]';
  var stringTag$3 = '[object String]';
  var symbolTag$3 = '[object Symbol]';

  var arrayBufferTag$2 = '[object ArrayBuffer]';
  var dataViewTag$3 = '[object DataView]';


  var symbolProto$2 = Symbol ? Symbol.prototype : undefined;
  var symbolValueOf$1 = symbolProto$2 ? symbolProto$2.valueOf : undefined;


  function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
    switch (tag) {
      case dataViewTag$3:
        if ((object.byteLength != other.byteLength) ||
            (object.byteOffset != other.byteOffset)) {
          return false;
        }
        object = object.buffer;
        other = other.buffer;

      case arrayBufferTag$2:
        if ((object.byteLength != other.byteLength) ||
            !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
          return false;
        }
        return true;

      case boolTag$2:
      case dateTag$2:



        return +object == +other;

      case errorTag$2:
        return object.name == other.name && object.message == other.message;

      case numberTag$2:

        return (object != +object) ? other != +other : object == +other;

      case regexpTag$2:
      case stringTag$3:



        return object == (other + '');

      case mapTag$3:
        var convert = mapToArray;

      case setTag$3:
        var isPartial = bitmask & PARTIAL_COMPARE_FLAG$3;
        convert || (convert = setToArray);

        if (object.size != other.size && !isPartial) {
          return false;
        }

        var stacked = stack.get(object);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= UNORDERED_COMPARE_FLAG$2;
        stack.set(object, other);


        return equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);

      case symbolTag$3:
        if (symbolValueOf$1) {
          return symbolValueOf$1.call(object) == symbolValueOf$1.call(other);
        }
    }
    return false;
  }

  var PARTIAL_COMPARE_FLAG$4 = 2;


  function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
    var isPartial = bitmask & PARTIAL_COMPARE_FLAG$4,
        objProps = keys$1(object),
        objLength = objProps.length,
        othProps = keys$1(other),
        othLength = othProps.length;

    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : baseHas(other, key))) {
        return false;
      }
    }

    var stacked = stack.get(object);
    if (stacked) {
      return stacked == other;
    }
    var result = true;
    stack.set(object, other);

    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key],
          othValue = other[key];

      if (customizer) {
        var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack);
      }

      if (!(compared === undefined
                  ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
                  : compared
          )) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == 'constructor');
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor,
          othCtor = other.constructor;


      if (objCtor != othCtor &&
          ('constructor' in object && 'constructor' in other) &&
          !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack['delete'](object);
    return result;
  }

  var argsTag$3 = '[object Arguments]';
  var arrayTag$2 = '[object Array]';
  var boolTag$3 = '[object Boolean]';
  var dateTag$3 = '[object Date]';
  var errorTag$3 = '[object Error]';
  var funcTag$2 = '[object Function]';
  var mapTag$4 = '[object Map]';
  var numberTag$3 = '[object Number]';
  var objectTag$3 = '[object Object]';
  var regexpTag$3 = '[object RegExp]';
  var setTag$4 = '[object Set]';
  var stringTag$4 = '[object String]';
  var weakMapTag$2 = '[object WeakMap]';

  var arrayBufferTag$3 = '[object ArrayBuffer]';
  var dataViewTag$4 = '[object DataView]';
  var float32Tag$2 = '[object Float32Array]';
  var float64Tag$2 = '[object Float64Array]';
  var int8Tag$2 = '[object Int8Array]';
  var int16Tag$2 = '[object Int16Array]';
  var int32Tag$2 = '[object Int32Array]';
  var uint8Tag$2 = '[object Uint8Array]';
  var uint8ClampedTag$2 = '[object Uint8ClampedArray]';
  var uint16Tag$2 = '[object Uint16Array]';
  var uint32Tag$2 = '[object Uint32Array]';


  var typedArrayTags = {};
  typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] =
      typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] =
          typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] =
              typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] =
                  typedArrayTags[uint32Tag$2] = true;
  typedArrayTags[argsTag$3] = typedArrayTags[arrayTag$2] =
      typedArrayTags[arrayBufferTag$3] = typedArrayTags[boolTag$3] =
          typedArrayTags[dataViewTag$4] = typedArrayTags[dateTag$3] =
              typedArrayTags[errorTag$3] = typedArrayTags[funcTag$2] =
                  typedArrayTags[mapTag$4] = typedArrayTags[numberTag$3] =
                      typedArrayTags[objectTag$3] = typedArrayTags[regexpTag$3] =
                          typedArrayTags[setTag$4] = typedArrayTags[stringTag$4] =
                              typedArrayTags[weakMapTag$2] = false;


  var objectProto$20 = Object.prototype;


  var objectToString$6 = objectProto$20.toString;


  function isTypedArray(value) {
    return isObjectLike(value) &&
        isLength(value.length) && !!typedArrayTags[objectToString$6.call(value)];
  }

  var PARTIAL_COMPARE_FLAG$1 = 2;


  var argsTag$2 = '[object Arguments]';
  var arrayTag$1 = '[object Array]';
  var objectTag$2 = '[object Object]';


  var objectProto$19 = Object.prototype;


  var hasOwnProperty$11 = objectProto$19.hasOwnProperty;


  function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
    var objIsArr = isArray$1(object),
        othIsArr = isArray$1(other),
        objTag = arrayTag$1,
        othTag = arrayTag$1;

    if (!objIsArr) {
      objTag = getTag$1(object);
      objTag = objTag == argsTag$2 ? objectTag$2 : objTag;
    }
    if (!othIsArr) {
      othTag = getTag$1(other);
      othTag = othTag == argsTag$2 ? objectTag$2 : othTag;
    }
    var objIsObj = objTag == objectTag$2 && !isHostObject(object),
        othIsObj = othTag == objectTag$2 && !isHostObject(other),
        isSameTag = objTag == othTag;

    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack);
      return (objIsArr || isTypedArray(object))
          ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
          : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
    }
    if (!(bitmask & PARTIAL_COMPARE_FLAG$1)) {
      var objIsWrapped = objIsObj && hasOwnProperty$11.call(object, '__wrapped__'),
          othIsWrapped = othIsObj && hasOwnProperty$11.call(other, '__wrapped__');

      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
            othUnwrapped = othIsWrapped ? other.value() : other;

        stack || (stack = new Stack);
        return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack);
    return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
  }

  function baseIsEqual(value, other, customizer, bitmask, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || (!isObject$1(value) && !isObjectLike(other))) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
  }

  var UNORDERED_COMPARE_FLAG = 1;
  var PARTIAL_COMPARE_FLAG = 2;


  function baseIsMatch(object, source, matchData, customizer) {
    var index = matchData.length,
        length = index,
        noCustomizer = !customizer;

    if (object == null) {
      return !length;
    }
    object = Object(object);
    while (index--) {
      var data = matchData[index];
      if ((noCustomizer && data[2])
              ? data[1] !== object[data[0]]
              : !(data[0] in object)
      ) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0],
          objValue = object[key],
          srcValue = data[1];

      if (noCustomizer && data[2]) {
        if (objValue === undefined && !(key in object)) {
          return false;
        }
      } else {
        var stack = new Stack;
        if (customizer) {
          var result = customizer(objValue, srcValue, key, object, source, stack);
        }
        if (!(result === undefined
                    ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
                    : result
            )) {
          return false;
        }
      }
    }
    return true;
  }

  function isStrictComparable(value) {
    return value === value && !isObject$1(value);
  }

  function getMatchData(object) {
    var result = keys$1(object),
        length = result.length;

    while (length--) {
      var key = result[length],
          value = object[key];

      result[length] = [key, value, isStrictComparable(value)];
    }
    return result;
  }

  function matchesStrictComparable(key, srcValue) {
    return function(object) {
      if (object == null) {
        return false;
      }
      return object[key] === srcValue &&
          (srcValue !== undefined || (key in Object(object)));
    };
  }

  function baseMatches(source) {
    var matchData = getMatchData(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable(matchData[0][0], matchData[0][1]);
    }
    return function(object) {
      return object === source || baseIsMatch(object, source, matchData);
    };
  }

  function baseHasIn(object, key) {
    return object != null && key in Object(object);
  }

  function hasPath(object, path, hasFunc) {
    path = isKey(path, object) ? [path] : castPath(path);

    var result,
        index = -1,
        length = path.length;

    while (++index < length) {
      var key = toKey(path[index]);
      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }
      object = object[key];
    }
    if (result) {
      return result;
    }
    var length = object ? object.length : 0;
    return !!length && isLength(length) && isIndex(key, length) &&
        (isArray$1(object) || isString$1(object) || isArguments(object));
  }

  function hasIn(object, path) {
    return object != null && hasPath(object, path, baseHasIn);
  }

  var UNORDERED_COMPARE_FLAG$3 = 1;
  var PARTIAL_COMPARE_FLAG$5 = 2;


  function baseMatchesProperty(path, srcValue) {
    if (isKey(path) && isStrictComparable(srcValue)) {
      return matchesStrictComparable(toKey(path), srcValue);
    }
    return function(object) {
      var objValue = get(object, path);
      return (objValue === undefined && objValue === srcValue)
          ? hasIn(object, path)
          : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG$3 | PARTIAL_COMPARE_FLAG$5);
    };
  }

  function basePropertyDeep(path) {
    return function(object) {
      return baseGet(object, path);
    };
  }

  function property(path) {
    return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
  }

  function baseIteratee(value) {


    if (typeof value == 'function') {
      return value;
    }
    if (value == null) {
      return identity;
    }
    if (typeof value == 'object') {
      return isArray$1(value)
          ? baseMatchesProperty(value[0], value[1])
          : baseMatches(value);
    }
    return property(value);
  }

  var FUNC_ERROR_TEXT$5 = 'Expected a function';


  function cond(pairs) {
    var length = pairs ? pairs.length : 0,
        toIteratee = baseIteratee;

    pairs = !length ? [] : arrayMap(pairs, function(pair) {
      if (typeof pair[1] != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT$5);
      }
      return [toIteratee(pair[0]), pair[1]];
    });

    return rest(function(args) {
      var this$1 = this;

      var index = -1;
      while (++index < length) {
        var pair = pairs[index];
        if (apply(pair[0], this$1, args)) {
          return apply(pair[1], this$1, args);
        }
      }
    });
  }

  function baseConforms(source) {
    var props = keys$1(source),
        length = props.length;

    return function(object) {
      if (object == null) {
        return !length;
      }
      var index = length;
      while (index--) {
        var key = props[index],
            predicate = source[key],
            value = object[key];

        if ((value === undefined &&
            !(key in Object(object))) || !predicate(value)) {
          return false;
        }
      }
      return true;
    };
  }

  function conforms(source) {
    return baseConforms(baseClone(source, true));
  }

  function constant(value) {
    return function() {
      return value;
    };
  }

  function arrayAggregator(array, setter, iteratee, accumulator) {
    var index = -1,
        length = array ? array.length : 0;

    while (++index < length) {
      var value = array[index];
      setter(accumulator, value, iteratee(value), array);
    }
    return accumulator;
  }

  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1,
          iterable = Object(object),
          props = keysFunc(object),
          length = props.length;

      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  var baseFor = createBaseFor();

  function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys$1);
  }

  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      if (!isArrayLike(collection)) {
        return eachFunc(collection, iteratee);
      }
      var length = collection.length,
          index = fromRight ? length : -1,
          iterable = Object(collection);

      while ((fromRight ? index-- : ++index < length)) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }

  var baseEach = createBaseEach(baseForOwn);

  function baseAggregator(collection, setter, iteratee, accumulator) {
    baseEach(collection, function(value, key, collection) {
      setter(accumulator, value, iteratee(value), collection);
    });
    return accumulator;
  }

  function createAggregator(setter, initializer) {
    return function(collection, iteratee) {
      var func = isArray$1(collection) ? arrayAggregator : baseAggregator,
          accumulator = initializer ? initializer() : {};

      return func(collection, setter, baseIteratee(iteratee), accumulator);
    };
  }

  var objectProto$21 = Object.prototype;


  var hasOwnProperty$12 = objectProto$21.hasOwnProperty;


  var countBy = createAggregator(function(result, value, key) {
    hasOwnProperty$12.call(result, key) ? ++result[key] : (result[key] = 1);
  });

  function create(prototype, properties) {
    var result = baseCreate(prototype);
    return properties ? baseAssign(result, properties) : result;
  }

  var CURRY_FLAG$4 = 8;


  function curry(func, arity, guard) {
    arity = guard ? undefined : arity;
    var result = createWrapper(func, CURRY_FLAG$4, undefined, undefined, undefined, undefined, undefined, arity);
    result.placeholder = curry.placeholder;
    return result;
  }


  curry.placeholder = {};

  var CURRY_RIGHT_FLAG$2 = 16;


  function curryRight(func, arity, guard) {
    arity = guard ? undefined : arity;
    var result = createWrapper(func, CURRY_RIGHT_FLAG$2, undefined, undefined, undefined, undefined, undefined, arity);
    result.placeholder = curryRight.placeholder;
    return result;
  }


  curryRight.placeholder = {};

  var FUNC_ERROR_TEXT$6 = 'Expected a function';


  var nativeMax$5 = Math.max;
  var nativeMin$3 = Math.min;


  function debounce(func, wait, options) {
    var lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$6);
    }
    wait = toNumber(wait) || 0;
    if (isObject$1(options)) {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? nativeMax$5(toNumber(options.maxWait) || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      var args = lastArgs,
          thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {

      lastInvokeTime = time;

      timerId = setTimeout(timerExpired, wait);

      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime,
          result = wait - timeSinceLastCall;

      return maxing ? nativeMin$3(result, maxWait - timeSinceLastInvoke) : result;
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime;




      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
      var time = now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }

      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;



      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now());
    }

    function debounced() {
      var time = now(),
          isInvoking = shouldInvoke(time);

      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {

          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }

  var objectProto$22 = Object.prototype;


  var hasOwnProperty$13 = objectProto$22.hasOwnProperty;


  function assignInDefaults(objValue, srcValue, key, object) {
    if (objValue === undefined ||
        (eq(objValue, objectProto$22[key]) && !hasOwnProperty$13.call(object, key))) {
      return srcValue;
    }
    return objValue;
  }

  var defaults = rest(function(args) {
    args.push(undefined, assignInDefaults);
    return apply(assignInWith, undefined, args);
  });

  function assignMergeValue(object, key, value) {
    if ((value !== undefined && !eq(object[key], value)) ||
        (typeof key == 'number' && value === undefined && !(key in object))) {
      object[key] = value;
    }
  }

  var objectTag$4 = '[object Object]';


  var objectProto$23 = Object.prototype;


  var funcToString$2 = Function.prototype.toString;


  var hasOwnProperty$14 = objectProto$23.hasOwnProperty;


  var objectCtorString = funcToString$2.call(Object);


  var objectToString$7 = objectProto$23.toString;


  function isPlainObject$1(value) {
    if (!isObjectLike(value) ||
        objectToString$7.call(value) != objectTag$4 || isHostObject(value)) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty$14.call(proto, 'constructor') && proto.constructor;
    return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString$2.call(Ctor) == objectCtorString);
  }

  function toPlainObject(value) {
    return copyObject(value, keysIn(value));
  }

  function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
    var objValue = object[key],
        srcValue = source[key],
        stacked = stack.get(srcValue);

    if (stacked) {
      assignMergeValue(object, key, stacked);
      return;
    }
    var newValue = customizer
        ? customizer(objValue, srcValue, (key + ''), object, source, stack)
        : undefined;

    var isCommon = newValue === undefined;

    if (isCommon) {
      newValue = srcValue;
      if (isArray$1(srcValue) || isTypedArray(srcValue)) {
        if (isArray$1(objValue)) {
          newValue = objValue;
        }
        else if (isArrayLikeObject(objValue)) {
          newValue = copyArray(objValue);
        }
        else {
          isCommon = false;
          newValue = baseClone(srcValue, true);
        }
      }
      else if (isPlainObject$1(srcValue) || isArguments(srcValue)) {
        if (isArguments(objValue)) {
          newValue = toPlainObject(objValue);
        }
        else if (!isObject$1(objValue) || (srcIndex && isFunction(objValue))) {
          isCommon = false;
          newValue = baseClone(srcValue, true);
        }
        else {
          newValue = objValue;
        }
      }
      else {
        isCommon = false;
      }
    }
    stack.set(srcValue, newValue);

    if (isCommon) {

      mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    }
    stack['delete'](srcValue);
    assignMergeValue(object, key, newValue);
  }

  function baseMerge(object, source, srcIndex, customizer, stack) {
    if (object === source) {
      return;
    }
    if (!(isArray$1(source) || isTypedArray(source))) {
      var props = keysIn(source);
    }
    arrayEach(props || source, function(srcValue, key) {
      if (props) {
        key = srcValue;
        srcValue = source[key];
      }
      if (isObject$1(srcValue)) {
        stack || (stack = new Stack);
        baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
      }
      else {
        var newValue = customizer
            ? customizer(object[key], srcValue, (key + ''), object, source, stack)
            : undefined;

        if (newValue === undefined) {
          newValue = srcValue;
        }
        assignMergeValue(object, key, newValue);
      }
    });
  }

  function mergeDefaults(objValue, srcValue, key, object, source, stack) {
    if (isObject$1(objValue) && isObject$1(srcValue)) {
      baseMerge(objValue, srcValue, undefined, mergeDefaults, stack.set(srcValue, objValue));
    }
    return objValue;
  }

  var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
    baseMerge(object, source, srcIndex, customizer);
  });

  var defaultsDeep = rest(function(args) {
    args.push(undefined, mergeDefaults);
    return apply(mergeWith, undefined, args);
  });

  var FUNC_ERROR_TEXT$7 = 'Expected a function';


  function baseDelay(func, wait, args) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$7);
    }
    return setTimeout(function() { func.apply(undefined, args); }, wait);
  }

  var defer = rest(function(func, args) {
    return baseDelay(func, 1, args);
  });

  var delay = rest(function(func, wait, args) {
    return baseDelay(func, toNumber(wait) || 0, args);
  });

  var difference = rest(function(array, values) {
    return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
        : [];
  });

  var differenceBy = rest(function(array, values) {
    var iteratee = last(values);
    if (isArrayLikeObject(iteratee)) {
      iteratee = undefined;
    }
    return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), baseIteratee(iteratee))
        : [];
  });

  var differenceWith = rest(function(array, values) {
    var comparator = last(values);
    if (isArrayLikeObject(comparator)) {
      comparator = undefined;
    }
    return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined, comparator)
        : [];
  });

  var divide = createMathOperation(function(dividend, divisor) {
    return dividend / divisor;
  });

  function drop(array, n, guard) {
    var length = array ? array.length : 0;
    if (!length) {
      return [];
    }
    n = (guard || n === undefined) ? 1 : toInteger(n);
    return baseSlice(array, n < 0 ? 0 : n, length);
  }

  function dropRight(array, n, guard) {
    var length = array ? array.length : 0;
    if (!length) {
      return [];
    }
    n = (guard || n === undefined) ? 1 : toInteger(n);
    n = length - n;
    return baseSlice(array, 0, n < 0 ? 0 : n);
  }

  function baseWhile(array, predicate, isDrop, fromRight) {
    var length = array.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length) &&
    predicate(array[index], index, array)) {}

    return isDrop
        ? baseSlice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
        : baseSlice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));
  }

  function dropRightWhile(array, predicate) {
    return (array && array.length)
        ? baseWhile(array, baseIteratee(predicate, 3), true, true)
        : [];
  }

  function dropWhile(array, predicate) {
    return (array && array.length)
        ? baseWhile(array, baseIteratee(predicate, 3), true)
        : [];
  }

  function forEach$1(collection, iteratee) {
    var func = isArray$1(collection) ? arrayEach : baseEach;
    return func(collection, baseIteratee(iteratee, 3));
  }

  function arrayEachRight(array, iteratee) {
    var length = array ? array.length : 0;

    while (length--) {
      if (iteratee(array[length], length, array) === false) {
        break;
      }
    }
    return array;
  }

  var baseForRight = createBaseFor(true);

  function baseForOwnRight(object, iteratee) {
    return object && baseForRight(object, iteratee, keys$1);
  }

  var baseEachRight = createBaseEach(baseForOwnRight, true);

  function forEachRight(collection, iteratee) {
    var func = isArray$1(collection) ? arrayEachRight : baseEachRight;
    return func(collection, baseIteratee(iteratee, 3));
  }

  function endsWith(string, target, position) {
    string = toString(string);
    target = baseToString(target);

    var length = string.length;
    position = position === undefined
        ? length
        : baseClamp(toInteger(position), 0, length);

    position -= target.length;
    return position >= 0 && string.indexOf(target, position) == position;
  }

  function baseToPairs(object, props) {
    return arrayMap(props, function(key) {
      return [key, object[key]];
    });
  }

  function setToPairs(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function(value) {
      result[++index] = [value, value];
    });
    return result;
  }

  var mapTag$5 = '[object Map]';
  var setTag$5 = '[object Set]';


  function createToPairs(keysFunc) {
    return function(object) {
      var tag = getTag$1(object);
      if (tag == mapTag$5) {
        return mapToArray(object);
      }
      if (tag == setTag$5) {
        return setToPairs(object);
      }
      return baseToPairs(object, keysFunc(object));
    };
  }

  var toPairs = createToPairs(keys$1);

  var toPairsIn = createToPairs(keysIn);

  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  };


  function escapeHtmlChar(chr) {
    return htmlEscapes[chr];
  }

  var reUnescapedHtml = /[&<>"'`]/g;
  var reHasUnescapedHtml = RegExp(reUnescapedHtml.source);


  function escape(string) {
    string = toString(string);
    return (string && reHasUnescapedHtml.test(string))
        ? string.replace(reUnescapedHtml, escapeHtmlChar)
        : string;
  }

  var reRegExpChar$1 = /[\\^$.*+?()[\]{}|]/g;
  var reHasRegExpChar = RegExp(reRegExpChar$1.source);


  function escapeRegExp(string) {
    string = toString(string);
    return (string && reHasRegExpChar.test(string))
        ? string.replace(reRegExpChar$1, '\\$&')
        : string;
  }

  function arrayEvery(array, predicate) {
    var index = -1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (!predicate(array[index], index, array)) {
        return false;
      }
    }
    return true;
  }

  function baseEvery(collection, predicate) {
    var result = true;
    baseEach(collection, function(value, index, collection) {
      result = !!predicate(value, index, collection);
      return result;
    });
    return result;
  }

  function every(collection, predicate, guard) {
    var func = isArray$1(collection) ? arrayEvery : baseEvery;
    if (guard && isIterateeCall(collection, predicate, guard)) {
      predicate = undefined;
    }
    return func(collection, baseIteratee(predicate, 3));
  }

  var MAX_ARRAY_LENGTH$1 = 4294967295;


  function toLength(value) {
    return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH$1) : 0;
  }

  function baseFill(array, value, start, end) {
    var length = array.length;

    start = toInteger(start);
    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }
    end = (end === undefined || end > length) ? length : toInteger(end);
    if (end < 0) {
      end += length;
    }
    end = start > end ? 0 : toLength(end);
    while (start < end) {
      array[start++] = value;
    }
    return array;
  }

  function fill(array, value, start, end) {
    var length = array ? array.length : 0;
    if (!length) {
      return [];
    }
    if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
      start = 0;
      end = length;
    }
    return baseFill(array, value, start, end);
  }

  function arrayFilter(array, predicate) {
    var index = -1,
        length = array ? array.length : 0,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  function baseFilter(collection, predicate) {
    var result = [];
    baseEach(collection, function(value, index, collection) {
      if (predicate(value, index, collection)) {
        result.push(value);
      }
    });
    return result;
  }

  function filter$1(collection, predicate) {
    var func = isArray$1(collection) ? arrayFilter : baseFilter;
    return func(collection, baseIteratee(predicate, 3));
  }

  function createFind(findIndexFunc) {
    return function(collection, predicate, fromIndex) {
      var iterable = Object(collection);
      predicate = baseIteratee(predicate, 3);
      if (!isArrayLike(collection)) {
        var props = keys$1(collection);
      }
      var index = findIndexFunc(props || collection, function(value, key) {
        if (props) {
          key = value;
          value = iterable[key];
        }
        return predicate(value, key, iterable);
      }, fromIndex);
      return index > -1 ? collection[props ? props[index] : index] : undefined;
    };
  }

  function baseFindIndex(array, predicate, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 1 : -1);

    while ((fromRight ? index-- : ++index < length)) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }

  var nativeMax$6 = Math.max;


  function findIndex$1(array, predicate, fromIndex) {
    var length = array ? array.length : 0;
    if (!length) {
      return -1;
    }
    var index = fromIndex == null ? 0 : toInteger(fromIndex);
    if (index < 0) {
      index = nativeMax$6(length + index, 0);
    }
    return baseFindIndex(array, baseIteratee(predicate, 3), index);
  }

  var find = createFind(findIndex$1);

  function baseFindKey(collection, predicate, eachFunc) {
    var result;
    eachFunc(collection, function(value, key, collection) {
      if (predicate(value, key, collection)) {
        result = key;
        return false;
      }
    });
    return result;
  }

  function findKey(object, predicate) {
    return baseFindKey(object, baseIteratee(predicate, 3), baseForOwn);
  }

  var nativeMax$7 = Math.max;
  var nativeMin$4 = Math.min;


  function findLastIndex(array, predicate, fromIndex) {
    var length = array ? array.length : 0;
    if (!length) {
      return -1;
    }
    var index = length - 1;
    if (fromIndex !== undefined) {
      index = toInteger(fromIndex);
      index = fromIndex < 0
          ? nativeMax$7(length + index, 0)
          : nativeMin$4(index, length - 1);
    }
    return baseFindIndex(array, baseIteratee(predicate, 3), index, true);
  }

  var findLast = createFind(findLastIndex);

  function findLastKey(object, predicate) {
    return baseFindKey(object, baseIteratee(predicate, 3), baseForOwnRight);
  }

  function head(array) {
    return (array && array.length) ? array[0] : undefined;
  }

  function baseMap(collection, iteratee) {
    var index = -1,
        result = isArrayLike(collection) ? Array(collection.length) : [];

    baseEach(collection, function(value, key, collection) {
      result[++index] = iteratee(value, key, collection);
    });
    return result;
  }

  function map$1(collection, iteratee) {
    var func = isArray$1(collection) ? arrayMap : baseMap;
    return func(collection, baseIteratee(iteratee, 3));
  }

  function flatMap(collection, iteratee) {
    return baseFlatten(map$1(collection, iteratee), 1);
  }

  var INFINITY$3 = 1 / 0;


  function flatMapDeep(collection, iteratee) {
    return baseFlatten(map$1(collection, iteratee), INFINITY$3);
  }

  function flatMapDepth(collection, iteratee, depth) {
    depth = depth === undefined ? 1 : toInteger(depth);
    return baseFlatten(map$1(collection, iteratee), depth);
  }

  function flatten$1(array) {
    var length = array ? array.length : 0;
    return length ? baseFlatten(array, 1) : [];
  }

  var INFINITY$4 = 1 / 0;


  function flattenDeep(array) {
    var length = array ? array.length : 0;
    return length ? baseFlatten(array, INFINITY$4) : [];
  }

  function flattenDepth(array, depth) {
    var length = array ? array.length : 0;
    if (!length) {
      return [];
    }
    depth = depth === undefined ? 1 : toInteger(depth);
    return baseFlatten(array, depth);
  }

  var FLIP_FLAG$1 = 512;


  function flip(func) {
    return createWrapper(func, FLIP_FLAG$1);
  }

  var floor = createRound('floor');

  var LARGE_ARRAY_SIZE$2 = 200;


  var FUNC_ERROR_TEXT$8 = 'Expected a function';


  var CURRY_FLAG$5 = 8;
  var PARTIAL_FLAG$4 = 32;
  var ARY_FLAG$3 = 128;
  var REARG_FLAG$1 = 256;


  function createFlow(fromRight) {
    return rest(function(funcs) {
      funcs = baseFlatten(funcs, 1);

      var length = funcs.length,
          index = length,
          prereq = LodashWrapper.prototype.thru;

      if (fromRight) {
        funcs.reverse();
      }
      while (index--) {
        var func = funcs[index];
        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT$8);
        }
        if (prereq && !wrapper && getFuncName(func) == 'wrapper') {
          var wrapper = new LodashWrapper([], true);
        }
      }
      index = wrapper ? index : length;
      while (++index < length) {
        func = funcs[index];

        var funcName = getFuncName(func),
            data = funcName == 'wrapper' ? getData(func) : undefined;

        if (data && isLaziable(data[0]) &&
            data[1] == (ARY_FLAG$3 | CURRY_FLAG$5 | PARTIAL_FLAG$4 | REARG_FLAG$1) &&
            !data[4].length && data[9] == 1
        ) {
          wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
        } else {
          wrapper = (func.length == 1 && isLaziable(func))
              ? wrapper[funcName]()
              : wrapper.thru(func);
        }
      }
      return function() {
        var this$1 = this;

        var args = arguments,
            value = args[0];

        if (wrapper && args.length == 1 &&
            isArray$1(value) && value.length >= LARGE_ARRAY_SIZE$2) {
          return wrapper.plant(value).value();
        }
        var index = 0,
            result = length ? funcs[index].apply(this, args) : value;

        while (++index < length) {
          result = funcs[index].call(this$1, result);
        }
        return result;
      };
    });
  }

  var flow = createFlow();

  var flowRight = createFlow(true);

  function forIn(object, iteratee) {
    return object == null
        ? object
        : baseFor(object, baseIteratee(iteratee, 3), keysIn);
  }

  function forInRight(object, iteratee) {
    return object == null
        ? object
        : baseForRight(object, baseIteratee(iteratee, 3), keysIn);
  }

  function forOwn(object, iteratee) {
    return object && baseForOwn(object, baseIteratee(iteratee, 3));
  }

  function forOwnRight(object, iteratee) {
    return object && baseForOwnRight(object, baseIteratee(iteratee, 3));
  }

  function fromPairs(pairs) {
    var index = -1,
        length = pairs ? pairs.length : 0,
        result = {};

    while (++index < length) {
      var pair = pairs[index];
      result[pair[0]] = pair[1];
    }
    return result;
  }

  function baseFunctions(object, props) {
    return arrayFilter(props, function(key) {
      return isFunction(object[key]);
    });
  }

  function functions(object) {
    return object == null ? [] : baseFunctions(object, keys$1(object));
  }

  function functionsIn(object) {
    return object == null ? [] : baseFunctions(object, keysIn(object));
  }

  var objectProto$24 = Object.prototype;


  var hasOwnProperty$15 = objectProto$24.hasOwnProperty;


  var groupBy = createAggregator(function(result, value, key) {
    if (hasOwnProperty$15.call(result, key)) {
      result[key].push(value);
    } else {
      result[key] = [value];
    }
  });

  function baseGt(value, other) {
    return value > other;
  }

  function createRelationalOperation(operator) {
    return function(value, other) {
      if (!(typeof value == 'string' && typeof other == 'string')) {
        value = toNumber(value);
        other = toNumber(other);
      }
      return operator(value, other);
    };
  }

  var gt = createRelationalOperation(baseGt);

  var gte = createRelationalOperation(function(value, other) {
    return value >= other;
  });

  function has(object, path) {
    return object != null && hasPath(object, path, baseHas);
  }

  var nativeMax$8 = Math.max;
  var nativeMin$5 = Math.min;


  function baseInRange(number, start, end) {
    return number >= nativeMin$5(start, end) && number < nativeMax$8(start, end);
  }

  function inRange(number, start, end) {
    start = toNumber(start) || 0;
    if (end === undefined) {
      end = start;
      start = 0;
    } else {
      end = toNumber(end) || 0;
    }
    number = toNumber(number);
    return baseInRange(number, start, end);
  }

  function baseValues(object, props) {
    return arrayMap(props, function(key) {
      return object[key];
    });
  }

  function values(object) {
    return object ? baseValues(object, keys$1(object)) : [];
  }

  var nativeMax$9 = Math.max;


  function includes(collection, value, fromIndex, guard) {
    collection = isArrayLike(collection) ? collection : values(collection);
    fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

    var length = collection.length;
    if (fromIndex < 0) {
      fromIndex = nativeMax$9(length + fromIndex, 0);
    }
    return isString$1(collection)
        ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
        : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
  }

  var nativeMax$10 = Math.max;


  function indexOf(array, value, fromIndex) {
    var length = array ? array.length : 0;
    if (!length) {
      return -1;
    }
    var index = fromIndex == null ? 0 : toInteger(fromIndex);
    if (index < 0) {
      index = nativeMax$10(length + index, 0);
    }
    return baseIndexOf(array, value, index);
  }

  function initial(array) {
    return dropRight(array, 1);
  }

  var nativeMin$6 = Math.min;


  function baseIntersection(arrays, iteratee, comparator) {
    var includes = comparator ? arrayIncludesWith : arrayIncludes,
        length = arrays[0].length,
        othLength = arrays.length,
        othIndex = othLength,
        caches = Array(othLength),
        maxLength = Infinity,
        result = [];

    while (othIndex--) {
      var array = arrays[othIndex];
      if (othIndex && iteratee) {
        array = arrayMap(array, baseUnary(iteratee));
      }
      maxLength = nativeMin$6(array.length, maxLength);
      caches[othIndex] = !comparator && (iteratee || (length >= 120 && array.length >= 120))
          ? new SetCache(othIndex && array)
          : undefined;
    }
    array = arrays[0];

    var index = -1,
        seen = caches[0];

    outer:
        while (++index < length && result.length < maxLength) {
          var value = array[index],
              computed = iteratee ? iteratee(value) : value;

          value = (comparator || value !== 0) ? value : 0;
          if (!(seen
                      ? cacheHas(seen, computed)
                      : includes(result, computed, comparator)
              )) {
            othIndex = othLength;
            while (--othIndex) {
              var cache = caches[othIndex];
              if (!(cache
                      ? cacheHas(cache, computed)
                      : includes(arrays[othIndex], computed, comparator))
              ) {
                continue outer;
              }
            }
            if (seen) {
              seen.push(computed);
            }
            result.push(value);
          }
        }
    return result;
  }

  function castArrayLikeObject(value) {
    return isArrayLikeObject(value) ? value : [];
  }

  var intersection = rest(function(arrays) {
    var mapped = arrayMap(arrays, castArrayLikeObject);
    return (mapped.length && mapped[0] === arrays[0])
        ? baseIntersection(mapped)
        : [];
  });

  var intersectionBy = rest(function(arrays) {
    var iteratee = last(arrays),
        mapped = arrayMap(arrays, castArrayLikeObject);

    if (iteratee === last(mapped)) {
      iteratee = undefined;
    } else {
      mapped.pop();
    }
    return (mapped.length && mapped[0] === arrays[0])
        ? baseIntersection(mapped, baseIteratee(iteratee))
        : [];
  });

  var intersectionWith = rest(function(arrays) {
    var comparator = last(arrays),
        mapped = arrayMap(arrays, castArrayLikeObject);

    if (comparator === last(mapped)) {
      comparator = undefined;
    } else {
      mapped.pop();
    }
    return (mapped.length && mapped[0] === arrays[0])
        ? baseIntersection(mapped, undefined, comparator)
        : [];
  });

  function baseInverter(object, setter, iteratee, accumulator) {
    baseForOwn(object, function(value, key, object) {
      setter(accumulator, iteratee(value), key, object);
    });
    return accumulator;
  }

  function createInverter(setter, toIteratee) {
    return function(object, iteratee) {
      return baseInverter(object, setter, toIteratee(iteratee), {});
    };
  }

  var invert = createInverter(function(result, value, key) {
    result[value] = key;
  }, constant(identity));

  var objectProto$25 = Object.prototype;


  var hasOwnProperty$16 = objectProto$25.hasOwnProperty;


  var invertBy = createInverter(function(result, value, key) {
    if (hasOwnProperty$16.call(result, value)) {
      result[value].push(key);
    } else {
      result[value] = [key];
    }
  }, baseIteratee);

  function baseInvoke(object, path, args) {
    if (!isKey(path, object)) {
      path = castPath(path);
      object = parent(object, path);
      path = last(path);
    }
    var func = object == null ? object : object[toKey(path)];
    return func == null ? undefined : apply(func, object, args);
  }

  var invoke = rest(baseInvoke);

  var invokeMap = rest(function(collection, path, args) {
    var index = -1,
        isFunc = typeof path == 'function',
        isProp = isKey(path),
        result = isArrayLike(collection) ? Array(collection.length) : [];

    baseEach(collection, function(value) {
      var func = isFunc ? path : ((isProp && value != null) ? value[path] : undefined);
      result[++index] = func ? apply(func, value, args) : baseInvoke(value, path, args);
    });
    return result;
  });

  var arrayBufferTag$4 = '[object ArrayBuffer]';


  var objectProto$26 = Object.prototype;


  var objectToString$8 = objectProto$26.toString;


  function isArrayBuffer(value) {
    return isObjectLike(value) && objectToString$8.call(value) == arrayBufferTag$4;
  }

  var boolTag$4 = '[object Boolean]';


  var objectProto$27 = Object.prototype;


  var objectToString$9 = objectProto$27.toString;


  function isBoolean(value) {
    return value === true || value === false ||
        (isObjectLike(value) && objectToString$9.call(value) == boolTag$4);
  }

  var dateTag$4 = '[object Date]';


  var objectProto$28 = Object.prototype;


  var objectToString$10 = objectProto$28.toString;


  function isDate(value) {
    return isObjectLike(value) && objectToString$10.call(value) == dateTag$4;
  }

  function isElement(value) {
    return !!value && value.nodeType === 1 && isObjectLike(value) && !isPlainObject$1(value);
  }

  var mapTag$6 = '[object Map]';
  var setTag$6 = '[object Set]';


  var objectProto$29 = Object.prototype;


  var hasOwnProperty$17 = objectProto$29.hasOwnProperty;


  var propertyIsEnumerable$4 = objectProto$29.propertyIsEnumerable;


  var nonEnumShadows$2 = !propertyIsEnumerable$4.call({ 'valueOf': 1 }, 'valueOf');


  function isEmpty(value) {
    if (isArrayLike(value) &&
        (isArray$1(value) || isString$1(value) || isFunction(value.splice) ||
        isArguments(value) || isBuffer(value))) {
      return !value.length;
    }
    if (isObjectLike(value)) {
      var tag = getTag$1(value);
      if (tag == mapTag$6 || tag == setTag$6) {
        return !value.size;
      }
    }
    for (var key in value) {
      if (hasOwnProperty$17.call(value, key)) {
        return false;
      }
    }
    return !(nonEnumShadows$2 && keys$1(value).length);
  }

  function isEqual$1(value, other) {
    return baseIsEqual(value, other);
  }

  function isEqualWith(value, other, customizer) {
    customizer = typeof customizer == 'function' ? customizer : undefined;
    var result = customizer ? customizer(value, other) : undefined;
    return result === undefined ? baseIsEqual(value, other, customizer) : !!result;
  }

  var nativeIsFinite = root.isFinite;


  function isFinite(value) {
    return typeof value == 'number' && nativeIsFinite(value);
  }

  function isInteger(value) {
    return typeof value == 'number' && value == toInteger(value);
  }

  var mapTag$7 = '[object Map]';


  function isMap(value) {
    return isObjectLike(value) && getTag$1(value) == mapTag$7;
  }

  function isMatch(object, source) {
    return object === source || baseIsMatch(object, source, getMatchData(source));
  }

  function isMatchWith(object, source, customizer) {
    customizer = typeof customizer == 'function' ? customizer : undefined;
    return baseIsMatch(object, source, getMatchData(source), customizer);
  }

  var numberTag$4 = '[object Number]';


  var objectProto$30 = Object.prototype;


  var objectToString$11 = objectProto$30.toString;


  function isNumber$1(value) {
    return typeof value == 'number' ||
        (isObjectLike(value) && objectToString$11.call(value) == numberTag$4);
  }

  function isNaN(value) {



    return isNumber$1(value) && value != +value;
  }

  var isMaskable = coreJsData ? isFunction : stubFalse;

  function isNative(value) {
    if (isMaskable(value)) {
      throw new Error('This method is not supported with `core-js`. Try https://github.com/es-shims.');
    }
    return baseIsNative(value);
  }

  function isNil$1(value) {
    return value == null;
  }

  function isNull(value) {
    return value === null;
  }

  var regexpTag$4 = '[object RegExp]';


  var objectProto$31 = Object.prototype;


  var objectToString$12 = objectProto$31.toString;


  function isRegExp(value) {
    return isObject$1(value) && objectToString$12.call(value) == regexpTag$4;
  }

  var MAX_SAFE_INTEGER$2 = 9007199254740991;


  function isSafeInteger(value) {
    return isInteger(value) && value >= -MAX_SAFE_INTEGER$2 && value <= MAX_SAFE_INTEGER$2;
  }

  var setTag$7 = '[object Set]';


  function isSet(value) {
    return isObjectLike(value) && getTag$1(value) == setTag$7;
  }

  function isUndefined(value) {
    return value === undefined;
  }

  var weakMapTag$3 = '[object WeakMap]';


  function isWeakMap(value) {
    return isObjectLike(value) && getTag$1(value) == weakMapTag$3;
  }

  var weakSetTag = '[object WeakSet]';


  var objectProto$32 = Object.prototype;


  var objectToString$13 = objectProto$32.toString;


  function isWeakSet(value) {
    return isObjectLike(value) && objectToString$13.call(value) == weakSetTag;
  }

  function iteratee(func) {
    return baseIteratee(typeof func == 'function' ? func : baseClone(func, true));
  }

  var arrayProto$1 = Array.prototype;


  var nativeJoin = arrayProto$1.join;


  function join(array, separator) {
    return array ? nativeJoin.call(array, separator) : '';
  }

  var kebabCase = createCompounder(function(result, word, index) {
    return result + (index ? '-' : '') + word.toLowerCase();
  });

  var keyBy = createAggregator(function(result, value, key) {
    result[key] = value;
  });

  var nativeMax$11 = Math.max;
  var nativeMin$7 = Math.min;


  function lastIndexOf(array, value, fromIndex) {
    var length = array ? array.length : 0;
    if (!length) {
      return -1;
    }
    var index = length;
    if (fromIndex !== undefined) {
      index = toInteger(fromIndex);
      index = (
              index < 0
                  ? nativeMax$11(length + index, 0)
                  : nativeMin$7(index, length - 1)
          ) + 1;
    }
    if (value !== value) {
      return indexOfNaN(array, index - 1, true);
    }
    while (index--) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  var lowerCase = createCompounder(function(result, word, index) {
    return result + (index ? ' ' : '') + word.toLowerCase();
  });

  var lowerFirst = createCaseFirst('toLowerCase');

  function baseLt(value, other) {
    return value < other;
  }

  var lt = createRelationalOperation(baseLt);

  var lte = createRelationalOperation(function(value, other) {
    return value <= other;
  });

  function mapKeys(object, iteratee) {
    var result = {};
    iteratee = baseIteratee(iteratee, 3);

    baseForOwn(object, function(value, key, object) {
      result[iteratee(value, key, object)] = value;
    });
    return result;
  }

  function mapValues(object, iteratee) {
    var result = {};
    iteratee = baseIteratee(iteratee, 3);

    baseForOwn(object, function(value, key, object) {
      result[key] = iteratee(value, key, object);
    });
    return result;
  }

  function matches$1(source) {
    return baseMatches(baseClone(source, true));
  }

  function matchesProperty(path, srcValue) {
    return baseMatchesProperty(path, baseClone(srcValue, true));
  }

  function baseExtremum(array, iteratee, comparator) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      var value = array[index],
          current = iteratee(value);

      if (current != null && (computed === undefined
                  ? (current === current && !isSymbol(current))
                  : comparator(current, computed)
          )) {
        var computed = current,
            result = value;
      }
    }
    return result;
  }

  function max(array) {
    return (array && array.length)
        ? baseExtremum(array, identity, baseGt)
        : undefined;
  }

  function maxBy(array, iteratee) {
    return (array && array.length)
        ? baseExtremum(array, baseIteratee(iteratee), baseGt)
        : undefined;
  }

  function baseSum(array, iteratee) {
    var result,
        index = -1,
        length = array.length;

    while (++index < length) {
      var current = iteratee(array[index]);
      if (current !== undefined) {
        result = result === undefined ? current : (result + current);
      }
    }
    return result;
  }

  var NAN$2 = 0 / 0;


  function baseMean(array, iteratee) {
    var length = array ? array.length : 0;
    return length ? (baseSum(array, iteratee) / length) : NAN$2;
  }

  function mean(array) {
    return baseMean(array, identity);
  }

  function meanBy(array, iteratee) {
    return baseMean(array, baseIteratee(iteratee));
  }

  var merge = createAssigner(function(object, source, srcIndex) {
    baseMerge(object, source, srcIndex);
  });

  var method = rest(function(path, args) {
    return function(object) {
      return baseInvoke(object, path, args);
    };
  });

  var methodOf = rest(function(object, args) {
    return function(path) {
      return baseInvoke(object, path, args);
    };
  });

  function min(array) {
    return (array && array.length)
        ? baseExtremum(array, identity, baseLt)
        : undefined;
  }

  function minBy(array, iteratee) {
    return (array && array.length)
        ? baseExtremum(array, baseIteratee(iteratee), baseLt)
        : undefined;
  }

  function mixin(object, source, options) {
    var props = keys$1(source),
        methodNames = baseFunctions(source, props);

    var chain = !(isObject$1(options) && 'chain' in options) || !!options.chain,
        isFunc = isFunction(object);

    arrayEach(methodNames, function(methodName) {
      var func = source[methodName];
      object[methodName] = func;
      if (isFunc) {
        object.prototype[methodName] = function() {
          var chainAll = this.__chain__;
          if (chain || chainAll) {
            var result = object(this.__wrapped__),
                actions = result.__actions__ = copyArray(this.__actions__);

            actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
            result.__chain__ = chainAll;
            return result;
          }
          return func.apply(object, arrayPush([this.value()], arguments));
        };
      }
    });

    return object;
  }

  var multiply = createMathOperation(function(multiplier, multiplicand) {
    return multiplier * multiplicand;
  });

  var FUNC_ERROR_TEXT$9 = 'Expected a function';


  function negate(predicate) {
    if (typeof predicate != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$9);
    }
    return function() {
      return !predicate.apply(this, arguments);
    };
  }

  var mapTag$8 = '[object Map]';
  var setTag$8 = '[object Set]';


  var iteratorSymbol = typeof (iteratorSymbol = Symbol && Symbol.iterator) == 'symbol' ? iteratorSymbol : undefined;


  function toArray(value) {
    if (!value) {
      return [];
    }
    if (isArrayLike(value)) {
      return isString$1(value) ? stringToArray(value) : copyArray(value);
    }
    if (iteratorSymbol && value[iteratorSymbol]) {
      return iteratorToArray(value[iteratorSymbol]());
    }
    var tag = getTag$1(value),
        func = tag == mapTag$8 ? mapToArray : (tag == setTag$8 ? setToArray : values);

    return func(value);
  }

  function wrapperNext() {
    if (this.__values__ === undefined) {
      this.__values__ = toArray(this.value());
    }
    var done = this.__index__ >= this.__values__.length,
        value = done ? undefined : this.__values__[this.__index__++];

    return { 'done': done, 'value': value };
  }

  function baseNth(array, n) {
    var length = array.length;
    if (!length) {
      return;
    }
    n += n < 0 ? length : 0;
    return isIndex(n, length) ? array[n] : undefined;
  }

  function nth(array, n) {
    return (array && array.length) ? baseNth(array, toInteger(n)) : undefined;
  }

  function nthArg(n) {
    n = toInteger(n);
    return rest(function(args) {
      return baseNth(args, n);
    });
  }

  function basePick(object, props) {
    object = Object(object);
    return arrayReduce(props, function(result, key) {
      if (key in object) {
        result[key] = object[key];
      }
      return result;
    }, {});
  }

  var getOwnPropertySymbols$1 = Object.getOwnPropertySymbols;


  var getSymbolsIn = !getOwnPropertySymbols$1 ? getSymbols$1 : function(object) {
    var result = [];
    while (object) {
      arrayPush(result, getSymbols$1(object));
      object = getPrototype(object);
    }
    return result;
  };

  function getAllKeysIn(object) {
    return baseGetAllKeys(object, keysIn, getSymbolsIn);
  }

  var omit = rest(function(object, props) {
    if (object == null) {
      return {};
    }
    props = arrayMap(baseFlatten(props, 1), toKey);
    return basePick(object, baseDifference(getAllKeysIn(object), props));
  });

  function basePickBy(object, predicate) {
    var index = -1,
        props = getAllKeysIn(object),
        length = props.length,
        result = {};

    while (++index < length) {
      var key = props[index],
          value = object[key];

      if (predicate(value, key)) {
        result[key] = value;
      }
    }
    return result;
  }

  function omitBy(object, predicate) {
    predicate = baseIteratee(predicate);
    return basePickBy(object, function(value, key) {
      return !predicate(value, key);
    });
  }

  function once(func) {
    return before(2, func);
  }

  function baseSortBy(array, comparer) {
    var length = array.length;

    array.sort(comparer);
    while (length--) {
      array[length] = array[length].value;
    }
    return array;
  }

  function compareAscending(value, other) {
    if (value !== other) {
      var valIsDefined = value !== undefined,
          valIsNull = value === null,
          valIsReflexive = value === value,
          valIsSymbol = isSymbol(value);

      var othIsDefined = other !== undefined,
          othIsNull = other === null,
          othIsReflexive = other === other,
          othIsSymbol = isSymbol(other);

      if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
          (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
          (valIsNull && othIsDefined && othIsReflexive) ||
          (!valIsDefined && othIsReflexive) ||
          !valIsReflexive) {
        return 1;
      }
      if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
          (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
          (othIsNull && valIsDefined && valIsReflexive) ||
          (!othIsDefined && valIsReflexive) ||
          !othIsReflexive) {
        return -1;
      }
    }
    return 0;
  }

  function compareMultiple(object, other, orders) {
    var index = -1,
        objCriteria = object.criteria,
        othCriteria = other.criteria,
        length = objCriteria.length,
        ordersLength = orders.length;

    while (++index < length) {
      var result = compareAscending(objCriteria[index], othCriteria[index]);
      if (result) {
        if (index >= ordersLength) {
          return result;
        }
        var order = orders[index];
        return result * (order == 'desc' ? -1 : 1);
      }
    }







    return object.index - other.index;
  }

  function baseOrderBy(collection, iteratees, orders) {
    var index = -1;
    iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(baseIteratee));

    var result = baseMap(collection, function(value, key, collection) {
      var criteria = arrayMap(iteratees, function(iteratee) {
        return iteratee(value);
      });
      return { 'criteria': criteria, 'index': ++index, 'value': value };
    });

    return baseSortBy(result, function(object, other) {
      return compareMultiple(object, other, orders);
    });
  }

  function orderBy(collection, iteratees, orders, guard) {
    if (collection == null) {
      return [];
    }
    if (!isArray$1(iteratees)) {
      iteratees = iteratees == null ? [] : [iteratees];
    }
    orders = guard ? undefined : orders;
    if (!isArray$1(orders)) {
      orders = orders == null ? [] : [orders];
    }
    return baseOrderBy(collection, iteratees, orders);
  }

  function isFlattenableIteratee(value) {
    return isArray$1(value) && !(value.length == 2 && !isFunction(value[0]));
  }

  function createOver(arrayFunc) {
    return rest(function(iteratees) {
      iteratees = (iteratees.length == 1 && isArray$1(iteratees[0]))
          ? arrayMap(iteratees[0], baseUnary(baseIteratee))
          : arrayMap(baseFlatten(iteratees, 1, isFlattenableIteratee), baseUnary(baseIteratee));

      return rest(function(args) {
        var thisArg = this;
        return arrayFunc(iteratees, function(iteratee) {
          return apply(iteratee, thisArg, args);
        });
      });
    });
  }

  var over = createOver(arrayMap);

  var nativeMin$8 = Math.min;


  var overArgs = rest(function(func, transforms) {
    transforms = (transforms.length == 1 && isArray$1(transforms[0]))
        ? arrayMap(transforms[0], baseUnary(baseIteratee))
        : arrayMap(baseFlatten(transforms, 1, isFlattenableIteratee), baseUnary(baseIteratee));

    var funcsLength = transforms.length;
    return rest(function(args) {
      var this$1 = this;

      var index = -1,
          length = nativeMin$8(args.length, funcsLength);

      while (++index < length) {
        args[index] = transforms[index].call(this$1, args[index]);
      }
      return apply(func, this, args);
    });
  });

  var overEvery = createOver(arrayEvery);

  var overSome = createOver(arraySome);

  var MAX_SAFE_INTEGER$3 = 9007199254740991;


  var nativeFloor$1 = Math.floor;


  function baseRepeat(string, n) {
    var result = '';
    if (!string || n < 1 || n > MAX_SAFE_INTEGER$3) {
      return result;
    }


    do {
      if (n % 2) {
        result += string;
      }
      n = nativeFloor$1(n / 2);
      if (n) {
        string += string;
      }
    } while (n);

    return result;
  }

  var rsAstralRange$3 = '\\ud800-\\udfff';
  var rsComboMarksRange$4 = '\\u0300-\\u036f\\ufe20-\\ufe23';
  var rsComboSymbolsRange$4 = '\\u20d0-\\u20f0';
  var rsVarRange$3 = '\\ufe0e\\ufe0f';


  var rsAstral$1 = '[' + rsAstralRange$3 + ']';
  var rsCombo$3 = '[' + rsComboMarksRange$4 + rsComboSymbolsRange$4 + ']';
  var rsFitz$2 = '\\ud83c[\\udffb-\\udfff]';
  var rsModifier$2 = '(?:' + rsCombo$3 + '|' + rsFitz$2 + ')';
  var rsNonAstral$2 = '[^' + rsAstralRange$3 + ']';
  var rsRegional$2 = '(?:\\ud83c[\\udde6-\\uddff]){2}';
  var rsSurrPair$2 = '[\\ud800-\\udbff][\\udc00-\\udfff]';
  var rsZWJ$3 = '\\u200d';


  var reOptMod$2 = rsModifier$2 + '?';
  var rsOptVar$2 = '[' + rsVarRange$3 + ']?';
  var rsOptJoin$2 = '(?:' + rsZWJ$3 + '(?:' + [rsNonAstral$2, rsRegional$2, rsSurrPair$2].join('|') + ')' + rsOptVar$2 + reOptMod$2 + ')*';
  var rsSeq$2 = rsOptVar$2 + reOptMod$2 + rsOptJoin$2;
  var rsSymbol$1 = '(?:' + [rsNonAstral$2 + rsCombo$3 + '?', rsCombo$3, rsRegional$2, rsSurrPair$2, rsAstral$1].join('|') + ')';


  var reComplexSymbol$1 = RegExp(rsFitz$2 + '(?=' + rsFitz$2 + ')|' + rsSymbol$1 + rsSeq$2, 'g');


  function stringSize(string) {
    if (!(string && reHasComplexSymbol.test(string))) {
      return string.length;
    }
    var result = reComplexSymbol$1.lastIndex = 0;
    while (reComplexSymbol$1.test(string)) {
      result++;
    }
    return result;
  }

  var nativeCeil$2 = Math.ceil;


  function createPadding(length, chars) {
    chars = chars === undefined ? ' ' : baseToString(chars);

    var charsLength = chars.length;
    if (charsLength < 2) {
      return charsLength ? baseRepeat(chars, length) : chars;
    }
    var result = baseRepeat(chars, nativeCeil$2(length / stringSize(chars)));
    return reHasComplexSymbol.test(chars)
        ? castSlice(stringToArray(result), 0, length).join('')
        : result.slice(0, length);
  }

  var nativeCeil$1 = Math.ceil;
  var nativeFloor = Math.floor;


  function pad(string, length, chars) {
    string = toString(string);
    length = toInteger(length);

    var strLength = length ? stringSize(string) : 0;
    if (!length || strLength >= length) {
      return string;
    }
    var mid = (length - strLength) / 2;
    return (
        createPadding(nativeFloor(mid), chars) +
        string +
        createPadding(nativeCeil$1(mid), chars)
    );
  }

  function padEnd(string, length, chars) {
    string = toString(string);
    length = toInteger(length);

    var strLength = length ? stringSize(string) : 0;
    return (length && strLength < length)
        ? (string + createPadding(length - strLength, chars))
        : string;
  }

  function padStart(string, length, chars) {
    string = toString(string);
    length = toInteger(length);

    var strLength = length ? stringSize(string) : 0;
    return (length && strLength < length)
        ? (createPadding(length - strLength, chars) + string)
        : string;
  }

  var reTrim$1 = /^\s+|\s+$/g;


  var reHasHexPrefix = /^0x/i;


  var nativeParseInt = root.parseInt;


  function parseInt$1(string, radix, guard) {


    if (guard || radix == null) {
      radix = 0;
    } else if (radix) {
      radix = +radix;
    }
    string = toString(string).replace(reTrim$1, '');
    return nativeParseInt(string, radix || (reHasHexPrefix.test(string) ? 16 : 10));
  }

  var PARTIAL_FLAG$5 = 32;


  var partial = rest(function(func, partials) {
    var holders = replaceHolders(partials, getHolder(partial));
    return createWrapper(func, PARTIAL_FLAG$5, undefined, partials, holders);
  });


  partial.placeholder = {};

  var PARTIAL_RIGHT_FLAG$2 = 64;


  var partialRight = rest(function(func, partials) {
    var holders = replaceHolders(partials, getHolder(partialRight));
    return createWrapper(func, PARTIAL_RIGHT_FLAG$2, undefined, partials, holders);
  });


  partialRight.placeholder = {};

  var partition = createAggregator(function(result, value, key) {
    result[key ? 0 : 1].push(value);
  }, function() { return [[], []]; });

  var pick = rest(function(object, props) {
    return object == null ? {} : basePick(object, arrayMap(baseFlatten(props, 1), toKey));
  });

  function pickBy(object, predicate) {
    return object == null ? {} : basePickBy(object, baseIteratee(predicate));
  }

  function wrapperPlant(value) {
    var result,
        parent = this;

    while (parent instanceof baseLodash) {
      var clone = wrapperClone(parent);
      clone.__index__ = 0;
      clone.__values__ = undefined;
      if (result) {
        previous.__wrapped__ = clone;
      } else {
        result = clone;
      }
      var previous = clone;
      parent = parent.__wrapped__;
    }
    previous.__wrapped__ = value;
    return result;
  }

  function propertyOf(object) {
    return function(path) {
      return object == null ? undefined : baseGet(object, path);
    };
  }

  function baseIndexOfWith(array, value, fromIndex, comparator) {
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (comparator(array[index], value)) {
        return index;
      }
    }
    return -1;
  }

  var arrayProto$2 = Array.prototype;


  var splice$1 = arrayProto$2.splice;


  function basePullAll(array, values, iteratee, comparator) {
    var indexOf = comparator ? baseIndexOfWith : baseIndexOf,
        index = -1,
        length = values.length,
        seen = array;

    if (array === values) {
      values = copyArray(values);
    }
    if (iteratee) {
      seen = arrayMap(array, baseUnary(iteratee));
    }
    while (++index < length) {
      var fromIndex = 0,
          value = values[index],
          computed = iteratee ? iteratee(value) : value;

      while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
        if (seen !== array) {
          splice$1.call(seen, fromIndex, 1);
        }
        splice$1.call(array, fromIndex, 1);
      }
    }
    return array;
  }

  function pullAll(array, values) {
    return (array && array.length && values && values.length)
        ? basePullAll(array, values)
        : array;
  }

  var pull = rest(pullAll);

  function pullAllBy(array, values, iteratee) {
    return (array && array.length && values && values.length)
        ? basePullAll(array, values, baseIteratee(iteratee))
        : array;
  }

  function pullAllWith(array, values, comparator) {
    return (array && array.length && values && values.length)
        ? basePullAll(array, values, undefined, comparator)
        : array;
  }

  var arrayProto$3 = Array.prototype;


  var splice$2 = arrayProto$3.splice;


  function basePullAt(array, indexes) {
    var length = array ? indexes.length : 0,
        lastIndex = length - 1;

    while (length--) {
      var index = indexes[length];
      if (length == lastIndex || index !== previous) {
        var previous = index;
        if (isIndex(index)) {
          splice$2.call(array, index, 1);
        }
        else if (!isKey(index, array)) {
          var path = castPath(index),
              object = parent(array, path);

          if (object != null) {
            delete object[toKey(last(path))];
          }
        }
        else {
          delete array[toKey(index)];
        }
      }
    }
    return array;
  }

  var pullAt = rest(function(array, indexes) {
    indexes = baseFlatten(indexes, 1);

    var length = array ? array.length : 0,
        result = baseAt(array, indexes);

    basePullAt(array, arrayMap(indexes, function(index) {
      return isIndex(index, length) ? +index : index;
    }).sort(compareAscending));

    return result;
  });

  var nativeFloor$2 = Math.floor;
  var nativeRandom$1 = Math.random;


  function baseRandom(lower, upper) {
    return lower + nativeFloor$2(nativeRandom$1() * (upper - lower + 1));
  }

  var freeParseFloat = parseFloat;


  var nativeMin$9 = Math.min;
  var nativeRandom = Math.random;


  function random(lower, upper, floating) {
    if (floating && typeof floating != 'boolean' && isIterateeCall(lower, upper, floating)) {
      upper = floating = undefined;
    }
    if (floating === undefined) {
      if (typeof upper == 'boolean') {
        floating = upper;
        upper = undefined;
      }
      else if (typeof lower == 'boolean') {
        floating = lower;
        lower = undefined;
      }
    }
    if (lower === undefined && upper === undefined) {
      lower = 0;
      upper = 1;
    }
    else {
      lower = toNumber(lower) || 0;
      if (upper === undefined) {
        upper = lower;
        lower = 0;
      } else {
        upper = toNumber(upper) || 0;
      }
    }
    if (lower > upper) {
      var temp = lower;
      lower = upper;
      upper = temp;
    }
    if (floating || lower % 1 || upper % 1) {
      var rand = nativeRandom();
      return nativeMin$9(lower + (rand * (upper - lower + freeParseFloat('1e-' + ((rand + '').length - 1)))), upper);
    }
    return baseRandom(lower, upper);
  }

  var nativeCeil$3 = Math.ceil;
  var nativeMax$12 = Math.max;


  function baseRange(start, end, step, fromRight) {
    var index = -1,
        length = nativeMax$12(nativeCeil$3((end - start) / (step || 1)), 0),
        result = Array(length);

    while (length--) {
      result[fromRight ? length : ++index] = start;
      start += step;
    }
    return result;
  }

  function createRange(fromRight) {
    return function(start, end, step) {
      if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
        end = step = undefined;
      }

      start = toNumber(start);
      start = start === start ? start : 0;
      if (end === undefined) {
        end = start;
        start = 0;
      } else {
        end = toNumber(end) || 0;
      }
      step = step === undefined ? (start < end ? 1 : -1) : (toNumber(step) || 0);
      return baseRange(start, end, step, fromRight);
    };
  }

  var range = createRange();

  var rangeRight = createRange(true);

  var REARG_FLAG$2 = 256;


  var rearg = rest(function(func, indexes) {
    return createWrapper(func, REARG_FLAG$2, undefined, undefined, undefined, baseFlatten(indexes, 1));
  });

  function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
    eachFunc(collection, function(value, index, collection) {
      accumulator = initAccum
          ? (initAccum = false, value)
          : iteratee(accumulator, value, index, collection);
    });
    return accumulator;
  }

  function reduce(collection, iteratee, accumulator) {
    var func = isArray$1(collection) ? arrayReduce : baseReduce,
        initAccum = arguments.length < 3;

    return func(collection, baseIteratee(iteratee, 4), accumulator, initAccum, baseEach);
  }

  function arrayReduceRight(array, iteratee, accumulator, initAccum) {
    var length = array ? array.length : 0;
    if (initAccum && length) {
      accumulator = array[--length];
    }
    while (length--) {
      accumulator = iteratee(accumulator, array[length], length, array);
    }
    return accumulator;
  }

  function reduceRight(collection, iteratee, accumulator) {
    var func = isArray$1(collection) ? arrayReduceRight : baseReduce,
        initAccum = arguments.length < 3;

    return func(collection, baseIteratee(iteratee, 4), accumulator, initAccum, baseEachRight);
  }

  function reject(collection, predicate) {
    var func = isArray$1(collection) ? arrayFilter : baseFilter;
    predicate = baseIteratee(predicate, 3);
    return func(collection, function(value, index, collection) {
      return !predicate(value, index, collection);
    });
  }

  function remove(array, predicate) {
    var result = [];
    if (!(array && array.length)) {
      return result;
    }
    var index = -1,
        indexes = [],
        length = array.length;

    predicate = baseIteratee(predicate, 3);
    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result.push(value);
        indexes.push(index);
      }
    }
    basePullAt(array, indexes);
    return result;
  }

  function repeat(string, n, guard) {
    if ((guard ? isIterateeCall(string, n, guard) : n === undefined)) {
      n = 1;
    } else {
      n = toInteger(n);
    }
    return baseRepeat(toString(string), n);
  }

  var stringProto = String.prototype;


  var nativeReplace = stringProto.replace;


  function replace() {
    var args = arguments,
        string = toString(args[0]);

    return args.length < 3 ? string : nativeReplace.call(string, args[1], args[2]);
  }

  function result(object, path, defaultValue) {
    path = isKey(path, object) ? [path] : castPath(path);

    var index = -1,
        length = path.length;


    if (!length) {
      object = undefined;
      length = 1;
    }
    while (++index < length) {
      var value = object == null ? undefined : object[toKey(path[index])];
      if (value === undefined) {
        index = length;
        value = defaultValue;
      }
      object = isFunction(value) ? value.call(object) : value;
    }
    return object;
  }

  var arrayProto$4 = Array.prototype;


  var nativeReverse = arrayProto$4.reverse;


  function reverse(array) {
    return array ? nativeReverse.call(array) : array;
  }

  var round = createRound('round');

  function sample(collection) {
    var array = isArrayLike(collection) ? collection : values(collection),
        length = array.length;

    return length > 0 ? array[baseRandom(0, length - 1)] : undefined;
  }

  function sampleSize(collection, n, guard) {
    var index = -1,
        result = toArray(collection),
        length = result.length,
        lastIndex = length - 1;

    if ((guard ? isIterateeCall(collection, n, guard) : n === undefined)) {
      n = 1;
    } else {
      n = baseClamp(toInteger(n), 0, length);
    }
    while (++index < n) {
      var rand = baseRandom(index, lastIndex),
          value = result[rand];

      result[rand] = result[index];
      result[index] = value;
    }
    result.length = n;
    return result;
  }

  function set(object, path, value) {
    return object == null ? object : baseSet(object, path, value);
  }

  var MAX_ARRAY_LENGTH$2 = 4294967295;


  function shuffle(collection) {
    return sampleSize(collection, MAX_ARRAY_LENGTH$2);
  }

  var mapTag$9 = '[object Map]';
  var setTag$9 = '[object Set]';


  function size(collection) {
    if (collection == null) {
      return 0;
    }
    if (isArrayLike(collection)) {
      var result = collection.length;
      return (result && isString$1(collection)) ? stringSize(collection) : result;
    }
    if (isObjectLike(collection)) {
      var tag = getTag$1(collection);
      if (tag == mapTag$9 || tag == setTag$9) {
        return collection.size;
      }
    }
    return keys$1(collection).length;
  }

  function slice(array, start, end) {
    var length = array ? array.length : 0;
    if (!length) {
      return [];
    }
    if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
      start = 0;
      end = length;
    }
    else {
      start = start == null ? 0 : toInteger(start);
      end = end === undefined ? length : toInteger(end);
    }
    return baseSlice(array, start, end);
  }

  var snakeCase = createCompounder(function(result, word, index) {
    return result + (index ? '_' : '') + word.toLowerCase();
  });

  function baseSome(collection, predicate) {
    var result;

    baseEach(collection, function(value, index, collection) {
      result = predicate(value, index, collection);
      return !result;
    });
    return !!result;
  }

  function some(collection, predicate, guard) {
    var func = isArray$1(collection) ? arraySome : baseSome;
    if (guard && isIterateeCall(collection, predicate, guard)) {
      predicate = undefined;
    }
    return func(collection, baseIteratee(predicate, 3));
  }

  var sortBy = rest(function(collection, iteratees) {
    if (collection == null) {
      return [];
    }
    var length = iteratees.length;
    if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
      iteratees = [];
    } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
      iteratees = [iteratees[0]];
    }
    iteratees = (iteratees.length == 1 && isArray$1(iteratees[0]))
        ? iteratees[0]
        : baseFlatten(iteratees, 1, isFlattenableIteratee);

    return baseOrderBy(collection, iteratees, []);
  });

  var MAX_ARRAY_LENGTH$4 = 4294967295;
  var MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH$4 - 1;


  var nativeFloor$3 = Math.floor;
  var nativeMin$10 = Math.min;


  function baseSortedIndexBy(array, value, iteratee, retHighest) {
    value = iteratee(value);

    var low = 0,
        high = array ? array.length : 0,
        valIsNaN = value !== value,
        valIsNull = value === null,
        valIsSymbol = isSymbol(value),
        valIsUndefined = value === undefined;

    while (low < high) {
      var mid = nativeFloor$3((low + high) / 2),
          computed = iteratee(array[mid]),
          othIsDefined = computed !== undefined,
          othIsNull = computed === null,
          othIsReflexive = computed === computed,
          othIsSymbol = isSymbol(computed);

      if (valIsNaN) {
        var setLow = retHighest || othIsReflexive;
      } else if (valIsUndefined) {
        setLow = othIsReflexive && (retHighest || othIsDefined);
      } else if (valIsNull) {
        setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
      } else if (valIsSymbol) {
        setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
      } else if (othIsNull || othIsSymbol) {
        setLow = false;
      } else {
        setLow = retHighest ? (computed <= value) : (computed < value);
      }
      if (setLow) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return nativeMin$10(high, MAX_ARRAY_INDEX);
  }

  var MAX_ARRAY_LENGTH$3 = 4294967295;
  var HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH$3 >>> 1;


  function baseSortedIndex(array, value, retHighest) {
    var low = 0,
        high = array ? array.length : low;

    if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
      while (low < high) {
        var mid = (low + high) >>> 1,
            computed = array[mid];

        if (computed !== null && !isSymbol(computed) &&
            (retHighest ? (computed <= value) : (computed < value))) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return high;
    }
    return baseSortedIndexBy(array, value, identity, retHighest);
  }

  function sortedIndex(array, value) {
    return baseSortedIndex(array, value);
  }

  function sortedIndexBy(array, value, iteratee) {
    return baseSortedIndexBy(array, value, baseIteratee(iteratee));
  }

  function sortedIndexOf(array, value) {
    var length = array ? array.length : 0;
    if (length) {
      var index = baseSortedIndex(array, value);
      if (index < length && eq(array[index], value)) {
        return index;
      }
    }
    return -1;
  }

  function sortedLastIndex(array, value) {
    return baseSortedIndex(array, value, true);
  }

  function sortedLastIndexBy(array, value, iteratee) {
    return baseSortedIndexBy(array, value, baseIteratee(iteratee), true);
  }

  function sortedLastIndexOf(array, value) {
    var length = array ? array.length : 0;
    if (length) {
      var index = baseSortedIndex(array, value, true) - 1;
      if (eq(array[index], value)) {
        return index;
      }
    }
    return -1;
  }

  function baseSortedUniq(array, iteratee) {
    var index = -1,
        length = array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index],
          computed = iteratee ? iteratee(value) : value;

      if (!index || !eq(computed, seen)) {
        var seen = computed;
        result[resIndex++] = value === 0 ? 0 : value;
      }
    }
    return result;
  }

  function sortedUniq(array) {
    return (array && array.length)
        ? baseSortedUniq(array)
        : [];
  }

  function sortedUniqBy(array, iteratee) {
    return (array && array.length)
        ? baseSortedUniq(array, baseIteratee(iteratee))
        : [];
  }

  var MAX_ARRAY_LENGTH$5 = 4294967295;


  var stringProto$1 = String.prototype;


  var nativeSplit = stringProto$1.split;


  function split(string, separator, limit) {
    if (limit && typeof limit != 'number' && isIterateeCall(string, separator, limit)) {
      separator = limit = undefined;
    }
    limit = limit === undefined ? MAX_ARRAY_LENGTH$5 : limit >>> 0;
    if (!limit) {
      return [];
    }
    string = toString(string);
    if (string && (
            typeof separator == 'string' ||
            (separator != null && !isRegExp(separator))
        )) {
      separator = baseToString(separator);
      if (separator == '' && reHasComplexSymbol.test(string)) {
        return castSlice(stringToArray(string), 0, limit);
      }
    }
    return nativeSplit.call(string, separator, limit);
  }

  var FUNC_ERROR_TEXT$10 = 'Expected a function';


  var nativeMax$13 = Math.max;


  function spread(func, start) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$10);
    }
    start = start === undefined ? 0 : nativeMax$13(toInteger(start), 0);
    return rest(function(args) {
      var array = args[start],
          otherArgs = castSlice(args, 0, start);

      if (array) {
        arrayPush(otherArgs, array);
      }
      return apply(func, this, otherArgs);
    });
  }

  var startCase = createCompounder(function(result, word, index) {
    return result + (index ? ' ' : '') + upperFirst(word);
  });

  function startsWith(string, target, position) {
    string = toString(string);
    position = baseClamp(toInteger(position), 0, string.length);
    return string.lastIndexOf(baseToString(target), position) == position;
  }

  function stubObject() {
    return {};
  }

  function stubString() {
    return '';
  }

  function stubTrue() {
    return true;
  }

  var subtract = createMathOperation(function(minuend, subtrahend) {
    return minuend - subtrahend;
  });

  function sum(array) {
    return (array && array.length)
        ? baseSum(array, identity)
        : 0;
  }

  function sumBy(array, iteratee) {
    return (array && array.length)
        ? baseSum(array, baseIteratee(iteratee))
        : 0;
  }

  function tail(array) {
    return drop(array, 1);
  }

  function take(array, n, guard) {
    if (!(array && array.length)) {
      return [];
    }
    n = (guard || n === undefined) ? 1 : toInteger(n);
    return baseSlice(array, 0, n < 0 ? 0 : n);
  }

  function takeRight(array, n, guard) {
    var length = array ? array.length : 0;
    if (!length) {
      return [];
    }
    n = (guard || n === undefined) ? 1 : toInteger(n);
    n = length - n;
    return baseSlice(array, n < 0 ? 0 : n, length);
  }

  function takeRightWhile(array, predicate) {
    return (array && array.length)
        ? baseWhile(array, baseIteratee(predicate, 3), false, true)
        : [];
  }

  function takeWhile(array, predicate) {
    return (array && array.length)
        ? baseWhile(array, baseIteratee(predicate, 3))
        : [];
  }

  function tap(value, interceptor) {
    interceptor(value);
    return value;
  }

  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };


  function escapeStringChar(chr) {
    return '\\' + stringEscapes[chr];
  }

  var reInterpolate = /<%=([\s\S]+?)%>/g;

  var reEscape = /<%-([\s\S]+?)%>/g;

  var reEvaluate = /<%([\s\S]+?)%>/g;

  var templateSettings = {


    'escape': reEscape,


    'evaluate': reEvaluate,


    'interpolate': reInterpolate,


    'variable': '',


    'imports': {


      '_': { 'escape': escape }
    }
  };

  var reEmptyStringLeading = /\b__p \+= '';/g;
  var reEmptyStringMiddle = /\b(__p \+=) '' \+/g;
  var reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;


  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;


  var reNoMatch = /($^)/;


  var reUnescapedString = /['\n\r\u2028\u2029\\]/g;


  function template(string, options, guard) {



    var settings = templateSettings.imports._.templateSettings || templateSettings;

    if (guard && isIterateeCall(string, options, guard)) {
      options = undefined;
    }
    string = toString(string);
    options = assignInWith({}, options, settings, assignInDefaults);

    var imports = assignInWith({}, options.imports, settings.imports, assignInDefaults),
        importsKeys = keys$1(imports),
        importsValues = baseValues(imports, importsKeys);

    var isEscaping,
        isEvaluating,
        index = 0,
        interpolate = options.interpolate || reNoMatch,
        source = "__p += '";


    var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
        , 'g');


    var sourceURL = 'sourceURL' in options ? '//# sourceURL=' + options.sourceURL + '\n' : '';

    string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
      interpolateValue || (interpolateValue = esTemplateValue);


      source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);


      if (escapeValue) {
        isEscaping = true;
        source += "' +\n__e(" + escapeValue + ") +\n'";
      }
      if (evaluateValue) {
        isEvaluating = true;
        source += "';\n" + evaluateValue + ";\n__p += '";
      }
      if (interpolateValue) {
        source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
      }
      index = offset + match.length;



      return match;
    });

    source += "';\n";



    var variable = options.variable;
    if (!variable) {
      source = 'with (obj) {\n' + source + '\n}\n';
    }

    source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');


    source = 'function(' + (variable || 'obj') + ') {\n' +
        (variable
                ? ''
                : 'obj || (obj = {});\n'
        ) +
        "var __t, __p = ''" +
        (isEscaping
                ? ', __e = _.escape'
                : ''
        ) +
        (isEvaluating
                ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
                : ';\n'
        ) +
        source +
        'return __p\n}';

    var result = attempt(function() {
      return Function(importsKeys, sourceURL + 'return ' + source)
          .apply(undefined, importsValues);
    });



    result.source = source;
    if (isError(result)) {
      throw result;
    }
    return result;
  }

  var FUNC_ERROR_TEXT$11 = 'Expected a function';


  function throttle(func, wait, options) {
    var leading = true,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$11);
    }
    if (isObject$1(options)) {
      leading = 'leading' in options ? !!options.leading : leading;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }
    return debounce(func, wait, {
      'leading': leading,
      'maxWait': wait,
      'trailing': trailing
    });
  }

  function thru(value, interceptor) {
    return interceptor(value);
  }

  var MAX_SAFE_INTEGER$4 = 9007199254740991;


  var MAX_ARRAY_LENGTH$6 = 4294967295;


  var nativeMin$11 = Math.min;


  function times(n, iteratee) {
    n = toInteger(n);
    if (n < 1 || n > MAX_SAFE_INTEGER$4) {
      return [];
    }
    var index = MAX_ARRAY_LENGTH$6,
        length = nativeMin$11(n, MAX_ARRAY_LENGTH$6);

    iteratee = baseIteratee(iteratee);
    n -= MAX_ARRAY_LENGTH$6;

    var result = baseTimes(length, iteratee);
    while (++index < n) {
      iteratee(index);
    }
    return result;
  }

  function wrapperToIterator() {
    return this;
  }

  function baseWrapperValue(value, actions) {
    var result = value;
    if (result instanceof LazyWrapper) {
      result = result.value();
    }
    return arrayReduce(actions, function(result, action) {
      return action.func.apply(action.thisArg, arrayPush([result], action.args));
    }, result);
  }

  function wrapperValue() {
    return baseWrapperValue(this.__wrapped__, this.__actions__);
  }

  function toLower(value) {
    return toString(value).toLowerCase();
  }

  function toPath(value) {
    if (isArray$1(value)) {
      return arrayMap(value, toKey);
    }
    return isSymbol(value) ? [value] : copyArray(stringToPath(value));
  }

  var MAX_SAFE_INTEGER$5 = 9007199254740991;


  function toSafeInteger(value) {
    return baseClamp(toInteger(value), -MAX_SAFE_INTEGER$5, MAX_SAFE_INTEGER$5);
  }

  function toUpper(value) {
    return toString(value).toUpperCase();
  }

  function transform$4(object, iteratee, accumulator) {
    var isArr = isArray$1(object) || isTypedArray(object);
    iteratee = baseIteratee(iteratee, 4);

    if (accumulator == null) {
      if (isArr || isObject$1(object)) {
        var Ctor = object.constructor;
        if (isArr) {
          accumulator = isArray$1(object) ? new Ctor : [];
        } else {
          accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
        }
      } else {
        accumulator = {};
      }
    }
    (isArr ? arrayEach : baseForOwn)(object, function(value, index, object) {
      return iteratee(accumulator, value, index, object);
    });
    return accumulator;
  }

  function charsEndIndex(strSymbols, chrSymbols) {
    var index = strSymbols.length;

    while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
    return index;
  }

  function charsStartIndex(strSymbols, chrSymbols) {
    var index = -1,
        length = strSymbols.length;

    while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
    return index;
  }

  var reTrim$2 = /^\s+|\s+$/g;


  function trim(string, chars, guard) {
    string = toString(string);
    if (string && (guard || chars === undefined)) {
      return string.replace(reTrim$2, '');
    }
    if (!string || !(chars = baseToString(chars))) {
      return string;
    }
    var strSymbols = stringToArray(string),
        chrSymbols = stringToArray(chars),
        start = charsStartIndex(strSymbols, chrSymbols),
        end = charsEndIndex(strSymbols, chrSymbols) + 1;

    return castSlice(strSymbols, start, end).join('');
  }

  var reTrimEnd = /\s+$/;


  function trimEnd(string, chars, guard) {
    string = toString(string);
    if (string && (guard || chars === undefined)) {
      return string.replace(reTrimEnd, '');
    }
    if (!string || !(chars = baseToString(chars))) {
      return string;
    }
    var strSymbols = stringToArray(string),
        end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;

    return castSlice(strSymbols, 0, end).join('');
  }

  var reTrimStart = /^\s+/;


  function trimStart(string, chars, guard) {
    string = toString(string);
    if (string && (guard || chars === undefined)) {
      return string.replace(reTrimStart, '');
    }
    if (!string || !(chars = baseToString(chars))) {
      return string;
    }
    var strSymbols = stringToArray(string),
        start = charsStartIndex(strSymbols, stringToArray(chars));

    return castSlice(strSymbols, start).join('');
  }

  var DEFAULT_TRUNC_LENGTH = 30;
  var DEFAULT_TRUNC_OMISSION = '...';


  var reFlags$1 = /\w*$/;


  function truncate(string, options) {
    var length = DEFAULT_TRUNC_LENGTH,
        omission = DEFAULT_TRUNC_OMISSION;

    if (isObject$1(options)) {
      var separator = 'separator' in options ? options.separator : separator;
      length = 'length' in options ? toInteger(options.length) : length;
      omission = 'omission' in options ? baseToString(options.omission) : omission;
    }
    string = toString(string);

    var strLength = string.length;
    if (reHasComplexSymbol.test(string)) {
      var strSymbols = stringToArray(string);
      strLength = strSymbols.length;
    }
    if (length >= strLength) {
      return string;
    }
    var end = length - stringSize(omission);
    if (end < 1) {
      return omission;
    }
    var result = strSymbols
        ? castSlice(strSymbols, 0, end).join('')
        : string.slice(0, end);

    if (separator === undefined) {
      return result + omission;
    }
    if (strSymbols) {
      end += (result.length - end);
    }
    if (isRegExp(separator)) {
      if (string.slice(end).search(separator)) {
        var match,
            substring = result;

        if (!separator.global) {
          separator = RegExp(separator.source, toString(reFlags$1.exec(separator)) + 'g');
        }
        separator.lastIndex = 0;
        while ((match = separator.exec(substring))) {
          var newEnd = match.index;
        }
        result = result.slice(0, newEnd === undefined ? end : newEnd);
      }
    } else if (string.indexOf(baseToString(separator), end) != end) {
      var index = result.lastIndexOf(separator);
      if (index > -1) {
        result = result.slice(0, index);
      }
    }
    return result + omission;
  }

  function unary(func) {
    return ary(func, 1);
  }

  var htmlUnescapes = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#96;': '`'
  };


  function unescapeHtmlChar(chr) {
    return htmlUnescapes[chr];
  }

  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g;
  var reHasEscapedHtml = RegExp(reEscapedHtml.source);


  function unescape(string) {
    string = toString(string);
    return (string && reHasEscapedHtml.test(string))
        ? string.replace(reEscapedHtml, unescapeHtmlChar)
        : string;
  }

  var INFINITY$5 = 1 / 0;


  var createSet = !(Set$1 && (1 / setToArray(new Set$1([,-0]))[1]) == INFINITY$5) ? noop : function(values) {
    return new Set$1(values);
  };

  var LARGE_ARRAY_SIZE$3 = 200;


  function baseUniq(array, iteratee, comparator) {
    var index = -1,
        includes = arrayIncludes,
        length = array.length,
        isCommon = true,
        result = [],
        seen = result;

    if (comparator) {
      isCommon = false;
      includes = arrayIncludesWith;
    }
    else if (length >= LARGE_ARRAY_SIZE$3) {
      var set = iteratee ? null : createSet(array);
      if (set) {
        return setToArray(set);
      }
      isCommon = false;
      includes = cacheHas;
      seen = new SetCache;
    }
    else {
      seen = iteratee ? [] : result;
    }
    outer:
        while (++index < length) {
          var value = array[index],
              computed = iteratee ? iteratee(value) : value;

          value = (comparator || value !== 0) ? value : 0;
          if (isCommon && computed === computed) {
            var seenIndex = seen.length;
            while (seenIndex--) {
              if (seen[seenIndex] === computed) {
                continue outer;
              }
            }
            if (iteratee) {
              seen.push(computed);
            }
            result.push(value);
          }
          else if (!includes(seen, computed, comparator)) {
            if (seen !== result) {
              seen.push(computed);
            }
            result.push(value);
          }
        }
    return result;
  }

  var union = rest(function(arrays) {
    return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
  });

  var unionBy = rest(function(arrays) {
    var iteratee = last(arrays);
    if (isArrayLikeObject(iteratee)) {
      iteratee = undefined;
    }
    return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), baseIteratee(iteratee));
  });

  var unionWith = rest(function(arrays) {
    var comparator = last(arrays);
    if (isArrayLikeObject(comparator)) {
      comparator = undefined;
    }
    return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined, comparator);
  });

  function uniq(array) {
    return (array && array.length)
        ? baseUniq(array)
        : [];
  }

  function uniqBy(array, iteratee) {
    return (array && array.length)
        ? baseUniq(array, baseIteratee(iteratee))
        : [];
  }

  function uniqWith(array, comparator) {
    return (array && array.length)
        ? baseUniq(array, undefined, comparator)
        : [];
  }

  var idCounter = 0;


  function uniqueId(prefix) {
    var id = ++idCounter;
    return toString(prefix) + id;
  }

  var nativeMax$14 = Math.max;


  function unzip(array) {
    if (!(array && array.length)) {
      return [];
    }
    var length = 0;
    array = arrayFilter(array, function(group) {
      if (isArrayLikeObject(group)) {
        length = nativeMax$14(group.length, length);
        return true;
      }
    });
    return baseTimes(length, function(index) {
      return arrayMap(array, baseProperty(index));
    });
  }

  function unzipWith(array, iteratee) {
    if (!(array && array.length)) {
      return [];
    }
    var result = unzip(array);
    if (iteratee == null) {
      return result;
    }
    return arrayMap(result, function(group) {
      return apply(iteratee, undefined, group);
    });
  }

  function baseUpdate(object, path, updater, customizer) {
    return baseSet(object, path, updater(baseGet(object, path)), customizer);
  }

  function castFunction(value) {
    return typeof value == 'function' ? value : identity;
  }

  function update(object, path, updater) {
    return object == null ? object : baseUpdate(object, path, castFunction(updater));
  }

  function updateWith(object, path, updater, customizer) {
    customizer = typeof customizer == 'function' ? customizer : undefined;
    return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
  }

  var upperCase = createCompounder(function(result, word, index) {
    return result + (index ? ' ' : '') + word.toUpperCase();
  });

  function valuesIn(object) {
    return object == null ? [] : baseValues(object, keysIn(object));
  }

  function wrap(value, wrapper) {
    wrapper = wrapper == null ? identity : wrapper;
    return partial(wrapper, value);
  }

  var wrapperAt = rest(function(paths) {
    paths = baseFlatten(paths, 1);
    var length = paths.length,
        start = length ? paths[0] : 0,
        value = this.__wrapped__,
        interceptor = function(object) { return baseAt(object, paths); };

    if (length > 1 || this.__actions__.length ||
        !(value instanceof LazyWrapper) || !isIndex(start)) {
      return this.thru(interceptor);
    }
    value = value.slice(start, +start + (length ? 1 : 0));
    value.__actions__.push({
      'func': thru,
      'args': [interceptor],
      'thisArg': undefined
    });
    return new LodashWrapper(value, this.__chain__).thru(function(array) {
      if (length && !array.length) {
        array.push(undefined);
      }
      return array;
    });
  });

  function wrapperChain() {
    return chain(this);
  }

  function wrapperReverse() {
    var value = this.__wrapped__;
    if (value instanceof LazyWrapper) {
      var wrapped = value;
      if (this.__actions__.length) {
        wrapped = new LazyWrapper(this);
      }
      wrapped = wrapped.reverse();
      wrapped.__actions__.push({
        'func': thru,
        'args': [reverse],
        'thisArg': undefined
      });
      return new LodashWrapper(wrapped, this.__chain__);
    }
    return this.thru(reverse);
  }

  function baseXor(arrays, iteratee, comparator) {
    var index = -1,
        length = arrays.length;

    while (++index < length) {
      var result = result
          ? arrayPush(
          baseDifference(result, arrays[index], iteratee, comparator),
          baseDifference(arrays[index], result, iteratee, comparator)
      )
          : arrays[index];
    }
    return (result && result.length) ? baseUniq(result, iteratee, comparator) : [];
  }

  var xor = rest(function(arrays) {
    return baseXor(arrayFilter(arrays, isArrayLikeObject));
  });

  var xorBy = rest(function(arrays) {
    var iteratee = last(arrays);
    if (isArrayLikeObject(iteratee)) {
      iteratee = undefined;
    }
    return baseXor(arrayFilter(arrays, isArrayLikeObject), baseIteratee(iteratee));
  });

  var xorWith = rest(function(arrays) {
    var comparator = last(arrays);
    if (isArrayLikeObject(comparator)) {
      comparator = undefined;
    }
    return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined, comparator);
  });

  var zip = rest(unzip);

  function baseZipObject(props, values, assignFunc) {
    var index = -1,
        length = props.length,
        valsLength = values.length,
        result = {};

    while (++index < length) {
      var value = index < valsLength ? values[index] : undefined;
      assignFunc(result, props[index], value);
    }
    return result;
  }

  function zipObject(props, values) {
    return baseZipObject(props || [], values || [], assignValue);
  }

  function zipObjectDeep(props, values) {
    return baseZipObject(props || [], values || [], baseSet);
  }

  var zipWith = rest(function(arrays) {
    var length = arrays.length,
        iteratee = length > 1 ? arrays[length - 1] : undefined;

    iteratee = typeof iteratee == 'function' ? (arrays.pop(), iteratee) : undefined;
    return unzipWith(arrays, iteratee);
  });

  var array = {
    chunk: chunk, compact: compact, concat: concat, difference: difference, differenceBy: differenceBy,
    differenceWith: differenceWith, drop: drop, dropRight: dropRight, dropRightWhile: dropRightWhile, dropWhile: dropWhile,
    fill: fill, findIndex: findIndex$1, findLastIndex: findLastIndex, first: head, flatten: flatten$1,
    flattenDeep: flattenDeep, flattenDepth: flattenDepth, fromPairs: fromPairs, head: head, indexOf: indexOf,
    initial: initial, intersection: intersection, intersectionBy: intersectionBy, intersectionWith: intersectionWith, join: join,
    last: last, lastIndexOf: lastIndexOf, nth: nth, pull: pull, pullAll: pullAll,
    pullAllBy: pullAllBy, pullAllWith: pullAllWith, pullAt: pullAt, remove: remove, reverse: reverse,
    slice: slice, sortedIndex: sortedIndex, sortedIndexBy: sortedIndexBy, sortedIndexOf: sortedIndexOf, sortedLastIndex: sortedLastIndex,
    sortedLastIndexBy: sortedLastIndexBy, sortedLastIndexOf: sortedLastIndexOf, sortedUniq: sortedUniq, sortedUniqBy: sortedUniqBy, tail: tail,
    take: take, takeRight: takeRight, takeRightWhile: takeRightWhile, takeWhile: takeWhile, union: union,
    unionBy: unionBy, unionWith: unionWith, uniq: uniq, uniqBy: uniqBy, uniqWith: uniqWith,
    unzip: unzip, unzipWith: unzipWith, without: without, xor: xor, xorBy: xorBy,
    xorWith: xorWith, zip: zip, zipObject: zipObject, zipObjectDeep: zipObjectDeep, zipWith: zipWith
  };

  var collection = {
    at: at, countBy: countBy, each: forEach$1, eachRight: forEachRight, every: every,
    filter: filter$1, find: find, findLast: findLast, flatMap: flatMap, flatMapDeep: flatMapDeep,
    flatMapDepth: flatMapDepth, forEach: forEach$1, forEachRight: forEachRight, groupBy: groupBy, includes: includes,
    invokeMap: invokeMap, keyBy: keyBy, map: map$1, orderBy: orderBy, partition: partition,
    reduce: reduce, reduceRight: reduceRight, reject: reject, sample: sample, sampleSize: sampleSize,
    shuffle: shuffle, size: size, some: some, sortBy: sortBy
  };

  var date = {
    now: now
  };

  var func = {
    after: after, ary: ary, before: before, bind: bind, bindKey: bindKey,
    curry: curry, curryRight: curryRight, debounce: debounce, defer: defer, delay: delay,
    flip: flip, memoize: memoize, negate: negate, once: once, overArgs: overArgs,
    partial: partial, partialRight: partialRight, rearg: rearg, rest: rest, spread: spread,
    throttle: throttle, unary: unary, wrap: wrap
  };

  var lang = {
    castArray: castArray, clone: clone$2, cloneDeep: cloneDeep$2, cloneDeepWith: cloneDeepWith, cloneWith: cloneWith,
    eq: eq, gt: gt, gte: gte, isArguments: isArguments, isArray: isArray$1,
    isArrayBuffer: isArrayBuffer, isArrayLike: isArrayLike, isArrayLikeObject: isArrayLikeObject, isBoolean: isBoolean, isBuffer: isBuffer,
    isDate: isDate, isElement: isElement, isEmpty: isEmpty, isEqual: isEqual$1, isEqualWith: isEqualWith,
    isError: isError, isFinite: isFinite, isFunction: isFunction, isInteger: isInteger, isLength: isLength,
    isMap: isMap, isMatch: isMatch, isMatchWith: isMatchWith, isNaN: isNaN, isNative: isNative,
    isNil: isNil$1, isNull: isNull, isNumber: isNumber$1, isObject: isObject$1, isObjectLike: isObjectLike,
    isPlainObject: isPlainObject$1, isRegExp: isRegExp, isSafeInteger: isSafeInteger, isSet: isSet, isString: isString$1,
    isSymbol: isSymbol, isTypedArray: isTypedArray, isUndefined: isUndefined, isWeakMap: isWeakMap, isWeakSet: isWeakSet,
    lt: lt, lte: lte, toArray: toArray, toFinite: toFinite, toInteger: toInteger,
    toLength: toLength, toNumber: toNumber, toPlainObject: toPlainObject, toSafeInteger: toSafeInteger, toString: toString
  };

  var math = {
    add: add, ceil: ceil, divide: divide, floor: floor, max: max,
    maxBy: maxBy, mean: mean, meanBy: meanBy, min: min, minBy: minBy,
    multiply: multiply, round: round, subtract: subtract, sum: sum, sumBy: sumBy
  };

  var number = {
    clamp: clamp, inRange: inRange, random: random
  };

  var object = {
    assign: assign, assignIn: assignIn, assignInWith: assignInWith, assignWith: assignWith, create: create,
    defaults: defaults, defaultsDeep: defaultsDeep, entries: toPairs, entriesIn: toPairsIn, extend: assignIn,
    extendWith: assignInWith, findKey: findKey, findLastKey: findLastKey, forIn: forIn, forInRight: forInRight,
    forOwn: forOwn, forOwnRight: forOwnRight, functions: functions, functionsIn: functionsIn, get: get,
    has: has, hasIn: hasIn, invert: invert, invertBy: invertBy, invoke: invoke,
    keys: keys$1, keysIn: keysIn, mapKeys: mapKeys, mapValues: mapValues, merge: merge,
    mergeWith: mergeWith, omit: omit, omitBy: omitBy, pick: pick, pickBy: pickBy,
    result: result, set: set, setWith: setWith, toPairs: toPairs, toPairsIn: toPairsIn,
    transform: transform$4, unset: unset, update: update, updateWith: updateWith, values: values,
    valuesIn: valuesIn
  };

  var seq = {
    at: wrapperAt, chain: chain, commit: wrapperCommit, lodash: lodash, next: wrapperNext,
    plant: wrapperPlant, reverse: wrapperReverse, tap: tap, thru: thru, toIterator: wrapperToIterator,
    toJSON: wrapperValue, value: wrapperValue, valueOf: wrapperValue, wrapperChain: wrapperChain
  };

  var string = {
    camelCase: camelCase, capitalize: capitalize, deburr: deburr, endsWith: endsWith, escape: escape,
    escapeRegExp: escapeRegExp, kebabCase: kebabCase, lowerCase: lowerCase, lowerFirst: lowerFirst, pad: pad,
    padEnd: padEnd, padStart: padStart, parseInt: parseInt$1, repeat: repeat, replace: replace,
    snakeCase: snakeCase, split: split, startCase: startCase, startsWith: startsWith, template: template,
    templateSettings: templateSettings, toLower: toLower, toUpper: toUpper, trim: trim, trimEnd: trimEnd,
    trimStart: trimStart, truncate: truncate, unescape: unescape, upperCase: upperCase, upperFirst: upperFirst,
    words: words
  };

  var util = {
    attempt: attempt, bindAll: bindAll, cond: cond, conforms: conforms, constant: constant,
    flow: flow, flowRight: flowRight, identity: identity, iteratee: iteratee, matches: matches$1,
    matchesProperty: matchesProperty, method: method, methodOf: methodOf, mixin: mixin, noop: noop,
    nthArg: nthArg, over: over, overEvery: overEvery, overSome: overSome, property: property,
    propertyOf: propertyOf, range: range, rangeRight: rangeRight, stubArray: stubArray, stubFalse: stubFalse,
    stubObject: stubObject, stubString: stubString, stubTrue: stubTrue, times: times, toPath: toPath,
    uniqueId: uniqueId
  };

  function lazyClone() {
    var result = new LazyWrapper(this.__wrapped__);
    result.__actions__ = copyArray(this.__actions__);
    result.__dir__ = this.__dir__;
    result.__filtered__ = this.__filtered__;
    result.__iteratees__ = copyArray(this.__iteratees__);
    result.__takeCount__ = this.__takeCount__;
    result.__views__ = copyArray(this.__views__);
    return result;
  }

  function lazyReverse() {
    if (this.__filtered__) {
      var result = new LazyWrapper(this);
      result.__dir__ = -1;
      result.__filtered__ = true;
    } else {
      result = this.clone();
      result.__dir__ *= -1;
    }
    return result;
  }

  var nativeMax$16 = Math.max;
  var nativeMin$14 = Math.min;


  function getView(start, end, transforms) {
    var index = -1,
        length = transforms.length;

    while (++index < length) {
      var data = transforms[index],
          size = data.size;

      switch (data.type) {
        case 'drop':      start += size; break;
        case 'dropRight': end -= size; break;
        case 'take':      end = nativeMin$14(end, start + size); break;
        case 'takeRight': start = nativeMax$16(start, end - size); break;
      }
    }
    return { 'start': start, 'end': end };
  }

  var LARGE_ARRAY_SIZE$4 = 200;


  var LAZY_FILTER_FLAG$1 = 1;
  var LAZY_MAP_FLAG = 2;


  var nativeMin$13 = Math.min;


  function lazyValue() {
    var array = this.__wrapped__.value(),
        dir = this.__dir__,
        isArr = isArray$1(array),
        isRight = dir < 0,
        arrLength = isArr ? array.length : 0,
        view = getView(0, arrLength, this.__views__),
        start = view.start,
        end = view.end,
        length = end - start,
        index = isRight ? end : (start - 1),
        iteratees = this.__iteratees__,
        iterLength = iteratees.length,
        resIndex = 0,
        takeCount = nativeMin$13(length, this.__takeCount__);

    if (!isArr || arrLength < LARGE_ARRAY_SIZE$4 ||
        (arrLength == length && takeCount == length)) {
      return baseWrapperValue(array, this.__actions__);
    }
    var result = [];

    outer:
        while (length-- && resIndex < takeCount) {
          index += dir;

          var iterIndex = -1,
              value = array[index];

          while (++iterIndex < iterLength) {
            var data = iteratees[iterIndex],
                iteratee = data.iteratee,
                type = data.type,
                computed = iteratee(value);

            if (type == LAZY_MAP_FLAG) {
              value = computed;
            } else if (!computed) {
              if (type == LAZY_FILTER_FLAG$1) {
                continue outer;
              } else {
                break outer;
              }
            }
          }
          result[resIndex++] = value;
        }
    return result;
  }

  var VERSION = '4.13.1';


  var BIND_KEY_FLAG$5 = 2;


  var LAZY_FILTER_FLAG = 1;
  var LAZY_WHILE_FLAG = 3;


  var MAX_ARRAY_LENGTH$7 = 4294967295;


  var arrayProto$5 = Array.prototype;
  var objectProto$33 = Object.prototype;


  var hasOwnProperty$18 = objectProto$33.hasOwnProperty;


  var iteratorSymbol$1 = typeof (iteratorSymbol$1 = Symbol && Symbol.iterator) == 'symbol' ? iteratorSymbol$1 : undefined;


  var nativeMax$15 = Math.max;
  var nativeMin$12 = Math.min;


  var mixin$2 = (function(func$$1) {
    return function(object$$1, source, options) {
      if (options == null) {
        var isObj = isObject$1(source),
            props = isObj && keys$1(source),
            methodNames = props && props.length && baseFunctions(source, props);

        if (!(methodNames ? methodNames.length : isObj)) {
          options = source;
          source = object$$1;
          object$$1 = this;
        }
      }
      return func$$1(object$$1, source, options);
    };
  }(mixin));


  lodash.after = func.after;
  lodash.ary = func.ary;
  lodash.assign = object.assign;
  lodash.assignIn = object.assignIn;
  lodash.assignInWith = object.assignInWith;
  lodash.assignWith = object.assignWith;
  lodash.at = collection.at;
  lodash.before = func.before;
  lodash.bind = func.bind;
  lodash.bindAll = util.bindAll;
  lodash.bindKey = func.bindKey;
  lodash.castArray = lang.castArray;
  lodash.chain = seq.chain;
  lodash.chunk = array.chunk;
  lodash.compact = array.compact;
  lodash.concat = array.concat;
  lodash.cond = util.cond;
  lodash.conforms = util.conforms;
  lodash.constant = util.constant;
  lodash.countBy = collection.countBy;
  lodash.create = object.create;
  lodash.curry = func.curry;
  lodash.curryRight = func.curryRight;
  lodash.debounce = func.debounce;
  lodash.defaults = object.defaults;
  lodash.defaultsDeep = object.defaultsDeep;
  lodash.defer = func.defer;
  lodash.delay = func.delay;
  lodash.difference = array.difference;
  lodash.differenceBy = array.differenceBy;
  lodash.differenceWith = array.differenceWith;
  lodash.drop = array.drop;
  lodash.dropRight = array.dropRight;
  lodash.dropRightWhile = array.dropRightWhile;
  lodash.dropWhile = array.dropWhile;
  lodash.fill = array.fill;
  lodash.filter = collection.filter;
  lodash.flatMap = collection.flatMap;
  lodash.flatMapDeep = collection.flatMapDeep;
  lodash.flatMapDepth = collection.flatMapDepth;
  lodash.flatten = array.flatten;
  lodash.flattenDeep = array.flattenDeep;
  lodash.flattenDepth = array.flattenDepth;
  lodash.flip = func.flip;
  lodash.flow = util.flow;
  lodash.flowRight = util.flowRight;
  lodash.fromPairs = array.fromPairs;
  lodash.functions = object.functions;
  lodash.functionsIn = object.functionsIn;
  lodash.groupBy = collection.groupBy;
  lodash.initial = array.initial;
  lodash.intersection = array.intersection;
  lodash.intersectionBy = array.intersectionBy;
  lodash.intersectionWith = array.intersectionWith;
  lodash.invert = object.invert;
  lodash.invertBy = object.invertBy;
  lodash.invokeMap = collection.invokeMap;
  lodash.iteratee = util.iteratee;
  lodash.keyBy = collection.keyBy;
  lodash.keys = keys$1;
  lodash.keysIn = object.keysIn;
  lodash.map = collection.map;
  lodash.mapKeys = object.mapKeys;
  lodash.mapValues = object.mapValues;
  lodash.matches = util.matches;
  lodash.matchesProperty = util.matchesProperty;
  lodash.memoize = func.memoize;
  lodash.merge = object.merge;
  lodash.mergeWith = object.mergeWith;
  lodash.method = util.method;
  lodash.methodOf = util.methodOf;
  lodash.mixin = mixin$2;
  lodash.negate = func.negate;
  lodash.nthArg = util.nthArg;
  lodash.omit = object.omit;
  lodash.omitBy = object.omitBy;
  lodash.once = func.once;
  lodash.orderBy = collection.orderBy;
  lodash.over = util.over;
  lodash.overArgs = func.overArgs;
  lodash.overEvery = util.overEvery;
  lodash.overSome = util.overSome;
  lodash.partial = func.partial;
  lodash.partialRight = func.partialRight;
  lodash.partition = collection.partition;
  lodash.pick = object.pick;
  lodash.pickBy = object.pickBy;
  lodash.property = util.property;
  lodash.propertyOf = util.propertyOf;
  lodash.pull = array.pull;
  lodash.pullAll = array.pullAll;
  lodash.pullAllBy = array.pullAllBy;
  lodash.pullAllWith = array.pullAllWith;
  lodash.pullAt = array.pullAt;
  lodash.range = util.range;
  lodash.rangeRight = util.rangeRight;
  lodash.rearg = func.rearg;
  lodash.reject = collection.reject;
  lodash.remove = array.remove;
  lodash.rest = rest;
  lodash.reverse = array.reverse;
  lodash.sampleSize = collection.sampleSize;
  lodash.set = object.set;
  lodash.setWith = object.setWith;
  lodash.shuffle = collection.shuffle;
  lodash.slice = array.slice;
  lodash.sortBy = collection.sortBy;
  lodash.sortedUniq = array.sortedUniq;
  lodash.sortedUniqBy = array.sortedUniqBy;
  lodash.split = string.split;
  lodash.spread = func.spread;
  lodash.tail = array.tail;
  lodash.take = array.take;
  lodash.takeRight = array.takeRight;
  lodash.takeRightWhile = array.takeRightWhile;
  lodash.takeWhile = array.takeWhile;
  lodash.tap = seq.tap;
  lodash.throttle = func.throttle;
  lodash.thru = thru;
  lodash.toArray = lang.toArray;
  lodash.toPairs = object.toPairs;
  lodash.toPairsIn = object.toPairsIn;
  lodash.toPath = util.toPath;
  lodash.toPlainObject = lang.toPlainObject;
  lodash.transform = object.transform;
  lodash.unary = func.unary;
  lodash.union = array.union;
  lodash.unionBy = array.unionBy;
  lodash.unionWith = array.unionWith;
  lodash.uniq = array.uniq;
  lodash.uniqBy = array.uniqBy;
  lodash.uniqWith = array.uniqWith;
  lodash.unset = object.unset;
  lodash.unzip = array.unzip;
  lodash.unzipWith = array.unzipWith;
  lodash.update = object.update;
  lodash.updateWith = object.updateWith;
  lodash.values = object.values;
  lodash.valuesIn = object.valuesIn;
  lodash.without = array.without;
  lodash.words = string.words;
  lodash.wrap = func.wrap;
  lodash.xor = array.xor;
  lodash.xorBy = array.xorBy;
  lodash.xorWith = array.xorWith;
  lodash.zip = array.zip;
  lodash.zipObject = array.zipObject;
  lodash.zipObjectDeep = array.zipObjectDeep;
  lodash.zipWith = array.zipWith;


  lodash.entries = object.toPairs;
  lodash.entriesIn = object.toPairsIn;
  lodash.extend = object.assignIn;
  lodash.extendWith = object.assignInWith;


  mixin$2(lodash, lodash);


  lodash.add = math.add;
  lodash.attempt = util.attempt;
  lodash.camelCase = string.camelCase;
  lodash.capitalize = string.capitalize;
  lodash.ceil = math.ceil;
  lodash.clamp = number.clamp;
  lodash.clone = lang.clone;
  lodash.cloneDeep = lang.cloneDeep;
  lodash.cloneDeepWith = lang.cloneDeepWith;
  lodash.cloneWith = lang.cloneWith;
  lodash.deburr = string.deburr;
  lodash.divide = math.divide;
  lodash.endsWith = string.endsWith;
  lodash.eq = lang.eq;
  lodash.escape = string.escape;
  lodash.escapeRegExp = string.escapeRegExp;
  lodash.every = collection.every;
  lodash.find = collection.find;
  lodash.findIndex = array.findIndex;
  lodash.findKey = object.findKey;
  lodash.findLast = collection.findLast;
  lodash.findLastIndex = array.findLastIndex;
  lodash.findLastKey = object.findLastKey;
  lodash.floor = math.floor;
  lodash.forEach = collection.forEach;
  lodash.forEachRight = collection.forEachRight;
  lodash.forIn = object.forIn;
  lodash.forInRight = object.forInRight;
  lodash.forOwn = object.forOwn;
  lodash.forOwnRight = object.forOwnRight;
  lodash.get = object.get;
  lodash.gt = lang.gt;
  lodash.gte = lang.gte;
  lodash.has = object.has;
  lodash.hasIn = object.hasIn;
  lodash.head = array.head;
  lodash.identity = identity;
  lodash.includes = collection.includes;
  lodash.indexOf = array.indexOf;
  lodash.inRange = number.inRange;
  lodash.invoke = object.invoke;
  lodash.isArguments = lang.isArguments;
  lodash.isArray = isArray$1;
  lodash.isArrayBuffer = lang.isArrayBuffer;
  lodash.isArrayLike = lang.isArrayLike;
  lodash.isArrayLikeObject = lang.isArrayLikeObject;
  lodash.isBoolean = lang.isBoolean;
  lodash.isBuffer = lang.isBuffer;
  lodash.isDate = lang.isDate;
  lodash.isElement = lang.isElement;
  lodash.isEmpty = lang.isEmpty;
  lodash.isEqual = lang.isEqual;
  lodash.isEqualWith = lang.isEqualWith;
  lodash.isError = lang.isError;
  lodash.isFinite = lang.isFinite;
  lodash.isFunction = lang.isFunction;
  lodash.isInteger = lang.isInteger;
  lodash.isLength = lang.isLength;
  lodash.isMap = lang.isMap;
  lodash.isMatch = lang.isMatch;
  lodash.isMatchWith = lang.isMatchWith;
  lodash.isNaN = lang.isNaN;
  lodash.isNative = lang.isNative;
  lodash.isNil = lang.isNil;
  lodash.isNull = lang.isNull;
  lodash.isNumber = lang.isNumber;
  lodash.isObject = isObject$1;
  lodash.isObjectLike = lang.isObjectLike;
  lodash.isPlainObject = lang.isPlainObject;
  lodash.isRegExp = lang.isRegExp;
  lodash.isSafeInteger = lang.isSafeInteger;
  lodash.isSet = lang.isSet;
  lodash.isString = lang.isString;
  lodash.isSymbol = lang.isSymbol;
  lodash.isTypedArray = lang.isTypedArray;
  lodash.isUndefined = lang.isUndefined;
  lodash.isWeakMap = lang.isWeakMap;
  lodash.isWeakSet = lang.isWeakSet;
  lodash.join = array.join;
  lodash.kebabCase = string.kebabCase;
  lodash.last = last;
  lodash.lastIndexOf = array.lastIndexOf;
  lodash.lowerCase = string.lowerCase;
  lodash.lowerFirst = string.lowerFirst;
  lodash.lt = lang.lt;
  lodash.lte = lang.lte;
  lodash.max = math.max;
  lodash.maxBy = math.maxBy;
  lodash.mean = math.mean;
  lodash.meanBy = math.meanBy;
  lodash.min = math.min;
  lodash.minBy = math.minBy;
  lodash.stubArray = util.stubArray;
  lodash.stubFalse = util.stubFalse;
  lodash.stubObject = util.stubObject;
  lodash.stubString = util.stubString;
  lodash.stubTrue = util.stubTrue;
  lodash.multiply = math.multiply;
  lodash.nth = array.nth;
  lodash.noop = util.noop;
  lodash.now = date.now;
  lodash.pad = string.pad;
  lodash.padEnd = string.padEnd;
  lodash.padStart = string.padStart;
  lodash.parseInt = string.parseInt;
  lodash.random = number.random;
  lodash.reduce = collection.reduce;
  lodash.reduceRight = collection.reduceRight;
  lodash.repeat = string.repeat;
  lodash.replace = string.replace;
  lodash.result = object.result;
  lodash.round = math.round;
  lodash.sample = collection.sample;
  lodash.size = collection.size;
  lodash.snakeCase = string.snakeCase;
  lodash.some = collection.some;
  lodash.sortedIndex = array.sortedIndex;
  lodash.sortedIndexBy = array.sortedIndexBy;
  lodash.sortedIndexOf = array.sortedIndexOf;
  lodash.sortedLastIndex = array.sortedLastIndex;
  lodash.sortedLastIndexBy = array.sortedLastIndexBy;
  lodash.sortedLastIndexOf = array.sortedLastIndexOf;
  lodash.startCase = string.startCase;
  lodash.startsWith = string.startsWith;
  lodash.subtract = math.subtract;
  lodash.sum = math.sum;
  lodash.sumBy = math.sumBy;
  lodash.template = string.template;
  lodash.times = util.times;
  lodash.toFinite = lang.toFinite;
  lodash.toInteger = toInteger;
  lodash.toLength = lang.toLength;
  lodash.toLower = string.toLower;
  lodash.toNumber = lang.toNumber;
  lodash.toSafeInteger = lang.toSafeInteger;
  lodash.toString = lang.toString;
  lodash.toUpper = string.toUpper;
  lodash.trim = string.trim;
  lodash.trimEnd = string.trimEnd;
  lodash.trimStart = string.trimStart;
  lodash.truncate = string.truncate;
  lodash.unescape = string.unescape;
  lodash.uniqueId = util.uniqueId;
  lodash.upperCase = string.upperCase;
  lodash.upperFirst = string.upperFirst;


  lodash.each = collection.forEach;
  lodash.eachRight = collection.forEachRight;
  lodash.first = array.head;

  mixin$2(lodash, (function() {
    var source = {};
    baseForOwn(lodash, function(func$$1, methodName) {
      if (!hasOwnProperty$18.call(lodash.prototype, methodName)) {
        source[methodName] = func$$1;
      }
    });
    return source;
  }()), { 'chain': false });


  lodash.VERSION = VERSION;
  (lodash.templateSettings = string.templateSettings).imports._ = lodash;


  arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
    lodash[methodName].placeholder = lodash;
  });


  arrayEach(['drop', 'take'], function(methodName, index) {
    LazyWrapper.prototype[methodName] = function(n) {
      var filtered = this.__filtered__;
      if (filtered && !index) {
        return new LazyWrapper(this);
      }
      n = n === undefined ? 1 : nativeMax$15(toInteger(n), 0);

      var result$$1 = this.clone();
      if (filtered) {
        result$$1.__takeCount__ = nativeMin$12(n, result$$1.__takeCount__);
      } else {
        result$$1.__views__.push({
          'size': nativeMin$12(n, MAX_ARRAY_LENGTH$7),
          'type': methodName + (result$$1.__dir__ < 0 ? 'Right' : '')
        });
      }
      return result$$1;
    };

    LazyWrapper.prototype[methodName + 'Right'] = function(n) {
      return this.reverse()[methodName](n).reverse();
    };
  });


  arrayEach(['filter', 'map', 'takeWhile'], function(methodName, index) {
    var type = index + 1,
        isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;

    LazyWrapper.prototype[methodName] = function(iteratee$$1) {
      var result$$1 = this.clone();
      result$$1.__iteratees__.push({
        'iteratee': baseIteratee(iteratee$$1, 3),
        'type': type
      });
      result$$1.__filtered__ = result$$1.__filtered__ || isFilter;
      return result$$1;
    };
  });


  arrayEach(['head', 'last'], function(methodName, index) {
    var takeName = 'take' + (index ? 'Right' : '');

    LazyWrapper.prototype[methodName] = function() {
      return this[takeName](1).value()[0];
    };
  });


  arrayEach(['initial', 'tail'], function(methodName, index) {
    var dropName = 'drop' + (index ? '' : 'Right');

    LazyWrapper.prototype[methodName] = function() {
      return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
    };
  });

  LazyWrapper.prototype.compact = function() {
    return this.filter(identity);
  };

  LazyWrapper.prototype.find = function(predicate) {
    return this.filter(predicate).head();
  };

  LazyWrapper.prototype.findLast = function(predicate) {
    return this.reverse().find(predicate);
  };

  LazyWrapper.prototype.invokeMap = rest(function(path, args) {
    if (typeof path == 'function') {
      return new LazyWrapper(this);
    }
    return this.map(function(value$$1) {
      return baseInvoke(value$$1, path, args);
    });
  });

  LazyWrapper.prototype.reject = function(predicate) {
    predicate = baseIteratee(predicate, 3);
    return this.filter(function(value$$1) {
      return !predicate(value$$1);
    });
  };

  LazyWrapper.prototype.slice = function(start, end) {
    start = toInteger(start);

    var result$$1 = this;
    if (result$$1.__filtered__ && (start > 0 || end < 0)) {
      return new LazyWrapper(result$$1);
    }
    if (start < 0) {
      result$$1 = result$$1.takeRight(-start);
    } else if (start) {
      result$$1 = result$$1.drop(start);
    }
    if (end !== undefined) {
      end = toInteger(end);
      result$$1 = end < 0 ? result$$1.dropRight(-end) : result$$1.take(end - start);
    }
    return result$$1;
  };

  LazyWrapper.prototype.takeRightWhile = function(predicate) {
    return this.reverse().takeWhile(predicate).reverse();
  };

  LazyWrapper.prototype.toArray = function() {
    return this.take(MAX_ARRAY_LENGTH$7);
  };


  baseForOwn(LazyWrapper.prototype, function(func$$1, methodName) {
    var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName),
        isTaker = /^(?:head|last)$/.test(methodName),
        lodashFunc = lodash[isTaker ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName],
        retUnwrapped = isTaker || /^find/.test(methodName);

    if (!lodashFunc) {
      return;
    }
    lodash.prototype[methodName] = function() {
      var value$$1 = this.__wrapped__,
          args = isTaker ? [1] : arguments,
          isLazy = value$$1 instanceof LazyWrapper,
          iteratee$$1 = args[0],
          useLazy = isLazy || isArray$1(value$$1);

      var interceptor = function(value$$1) {
        var result$$1 = lodashFunc.apply(lodash, arrayPush([value$$1], args));
        return (isTaker && chainAll) ? result$$1[0] : result$$1;
      };

      if (useLazy && checkIteratee && typeof iteratee$$1 == 'function' && iteratee$$1.length != 1) {

        isLazy = useLazy = false;
      }
      var chainAll = this.__chain__,
          isHybrid = !!this.__actions__.length,
          isUnwrapped = retUnwrapped && !chainAll,
          onlyLazy = isLazy && !isHybrid;

      if (!retUnwrapped && useLazy) {
        value$$1 = onlyLazy ? value$$1 : new LazyWrapper(this);
        var result$$1 = func$$1.apply(value$$1, args);
        result$$1.__actions__.push({ 'func': thru, 'args': [interceptor], 'thisArg': undefined });
        return new LodashWrapper(result$$1, chainAll);
      }
      if (isUnwrapped && onlyLazy) {
        return func$$1.apply(this, args);
      }
      result$$1 = this.thru(interceptor);
      return isUnwrapped ? (isTaker ? result$$1.value()[0] : result$$1.value()) : result$$1;
    };
  });


  arrayEach(['pop', 'push', 'shift', 'sort', 'splice', 'unshift'], function(methodName) {
    var func$$1 = arrayProto$5[methodName],
        chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
        retUnwrapped = /^(?:pop|shift)$/.test(methodName);

    lodash.prototype[methodName] = function() {
      var args = arguments;
      if (retUnwrapped && !this.__chain__) {
        var value$$1 = this.value();
        return func$$1.apply(isArray$1(value$$1) ? value$$1 : [], args);
      }
      return this[chainName](function(value$$1) {
        return func$$1.apply(isArray$1(value$$1) ? value$$1 : [], args);
      });
    };
  });


  baseForOwn(LazyWrapper.prototype, function(func$$1, methodName) {
    var lodashFunc = lodash[methodName];
    if (lodashFunc) {
      var key = (lodashFunc.name + ''),
          names = realNames[key] || (realNames[key] = []);

      names.push({ 'name': methodName, 'func': lodashFunc });
    }
  });

  realNames[createHybridWrapper(undefined, BIND_KEY_FLAG$5).name] = [{
    'name': 'wrapper',
    'func': undefined
  }];


  LazyWrapper.prototype.clone = lazyClone;
  LazyWrapper.prototype.reverse = lazyReverse;
  LazyWrapper.prototype.value = lazyValue;


  lodash.prototype.at = seq.at;
  lodash.prototype.chain = seq.wrapperChain;
  lodash.prototype.commit = seq.commit;
  lodash.prototype.next = seq.next;
  lodash.prototype.plant = seq.plant;
  lodash.prototype.reverse = seq.reverse;
  lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = seq.value;

  if (iteratorSymbol$1) {
    lodash.prototype[iteratorSymbol$1] = seq.toIterator;
  }

  function computeSnapshot(jsonDoc, changeset) {

    jsonDoc = cloneDeep$2(jsonDoc);
    var nodes = jsonDoc.nodes;
    changeset.forEach(function (change) {
      change.ops.forEach(function (opData) {
        try {
          var op = ObjectOperation.fromJSON(opData);
          op.apply(nodes);
        } catch (err) {
          console.error(err, opData);
        }
      });
    });
    return jsonDoc
  }

  var EMPTY_DOC = { nodes: {} };


  var SnapshotEngine = function SnapshotEngine(config) {
    this.changeStore = config.changeStore;
    this.snapshotStore = config.snapshotStore;
  };


  SnapshotEngine.prototype.getSnapshot = function getSnapshot (documentId, version, cb) {
    var this$1 = this;

    var jsonDoc = EMPTY_DOC;
    this._getClosestSnapshot(documentId, version, function (err, snapshot, closestVersion) {
      if (err) {
        return cb(err)
      }
      if (snapshot && version === closestVersion) {

        return cb(null, snapshot, version)
      }
      var knownVersion;
      if (snapshot) {
        knownVersion = closestVersion;
      } else {
        knownVersion = 0;
      }
      if (snapshot) {
        jsonDoc = snapshot;
      }

      this$1.changeStore.getChanges(documentId, knownVersion, version, function (err, changes) {
        if (err) { return cb(err) }
        if (changes.length < (version - knownVersion)) {
          return cb('Changes missing for reconstructing version '+ version)
        }
        jsonDoc = computeSnapshot(jsonDoc, changes);
        cb(null, jsonDoc, version);
      });
    });
  };


  SnapshotEngine.prototype.createSnapshot = function createSnapshot (documentId, version, cb) {
    var this$1 = this;

    this.getSnapshot(documentId, version, function (err, snapshot) {
      if (err) { return cb(err) }
      this$1.snapshotStore.saveSnapshot(documentId, version, snapshot, cb);
    });
  };

  SnapshotEngine.prototype._getClosestSnapshot = function _getClosestSnapshot (documentId, version, cb) {
    var this$1 = this;

    var closestVersion;

    this.snapshotStore.getVersions(documentId, function (err, versions) {
      if (versions.indexOf(version) >= 0) {
        closestVersion = version;
      } else {

        var smallerVersions = versions.filter(function(v) {
          return parseInt(v, 10) < version
        });

        closestVersion = Math.max.apply(null, smallerVersions);
      }
      if (!closestVersion) {
        return cb(null, undefined)
      }
      this$1.snapshotStore.getSnapshot(documentId, version, cb);
    });
  };

  var DocumentEngine = (function (EventEmitter$$1) {
    function DocumentEngine(config) {
      EventEmitter$$1.call(this);
      this.changeStore = config.changeStore;
      this.snapshotStore = config.snapshotStore;


      this.snapshotFrequency = config.snapshotFrequency || 1;
      this.snapshotEngine = new SnapshotEngine({
        changeStore: this.changeStore,
        snapshotStore: this.snapshotStore
      });
    }

    if ( EventEmitter$$1 ) DocumentEngine.__proto__ = EventEmitter$$1;
    DocumentEngine.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    DocumentEngine.prototype.constructor = DocumentEngine;


    DocumentEngine.prototype.createDocument = function createDocument (documentId, initialChange, cb) {
      this.addChange(documentId, initialChange, cb);
    };


    DocumentEngine.prototype.getDocument = function getDocument (documentId, version, cb) {
      var this$1 = this;

      if (typeof version === 'function') {
        cb = version;
        version = undefined;
      }
      if (!documentId) {
        throw new Error('Invalid Arguments')
      }
      if (version === undefined) {
        this.getVersion(documentId, function (err, version) {
          if (err) { return cb(err) }
          this$1.snapshotEngine.getSnapshot(documentId, version, cb);
        });
      } else {
        this.snapshotEngine.getSnapshot(documentId, version, cb);
      }
    };


    DocumentEngine.prototype.deleteDocument = function deleteDocument (documentId, cb) {
      this.changeStore.deleteChanges(documentId, function (err) {
        if (err) {
          return cb(new Error('Deleting changes failed'))
        }
      });
    };


    DocumentEngine.prototype.documentExists = function documentExists (documentId, cb) {
      this.getVersion(documentId, function (err, version) {
        if (version >= 0) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      });
    };


    DocumentEngine.prototype.getChanges = function getChanges (documentId, sinceVersion, toVersion, cb) {
      this.changeStore.getChanges(documentId, sinceVersion, toVersion, cb);
    };


    DocumentEngine.prototype.getVersion = function getVersion (documentId, cb) {
      this.changeStore.getVersion(documentId, cb);
    };


    DocumentEngine.prototype.requestSnapshot = function requestSnapshot (documentId, version, cb) {
      if (version % this.snapshotFrequency === 0) {
        this.snapshotEngine.createSnapshot(documentId, version, cb);
      } else {
        cb(null);
      }
    };


    DocumentEngine.prototype.addChange = function addChange (documentId, change, cb) {
      var this$1 = this;

      this.changeStore.addChange(documentId, change, function (err, newVersion) {
        if (err) { return cb(err) }

        this$1.requestSnapshot(documentId, newVersion, function () {

          cb(null, newVersion);
        });
      });
    };

    return DocumentEngine;
  }(EventEmitter));

  var DocumentServer = function DocumentServer(params) {
    this.configurator = params.configurator;
    this.engine = this.configurator.getDocumentEngine();

    this.path = '/api/documents';
  };


  DocumentServer.prototype.bind = function bind (app) {
    app.post(this.path, this._createDocument.bind(this));
    app.get(this.path + '/:id', this._getDocument.bind(this));
    app.delete(this.path + '/:id', this._deleteDocument.bind(this));
  };


  DocumentServer.prototype._createDocument = function _createDocument (req, res, next) {
    var ref = req.body;
    var documentId = ref.documentId;
    var change = ref.change;
    this.engine.createDocument(documentId, change, function(err, version) {
      if (err) { return next(err) }
      res.json(version);
    });
  };


  DocumentServer.prototype._getDocument = function _getDocument (req, res, next) {
    var documentId = req.params.id;
    this.engine.getDocument(documentId, function(err, jsonDoc, version) {
      if (err) { return next(err) }
      res.json({
        data: jsonDoc,
        version: version
      });
    });
  };


  DocumentServer.prototype._deleteDocument = function _deleteDocument (req, res, next) {
    var documentId = req.params.id;
    this.engine.deleteDocument(documentId, function(err, result) {
      if (err) { return next(err) }
      res.json(result);
    });
  };

  var SnapshotStore = function SnapshotStore(seed) {
    this._snapshots = seed || {};
  };


  SnapshotStore.prototype.getVersions = function getVersions (documentId, cb) {
    var versions = this._getVersions(documentId);
    cb(null, versions);
  };


  SnapshotStore.prototype.getSnapshot = function getSnapshot (documentId, version, cb) {
    if (!arguments.length === 3) {
      throw new Error('Invalid Arguments')
    }
    var docEntry = this._snapshots[documentId];
    if (!docEntry) { return cb(null, undefined) }
    var snapshot = docEntry[version];
    if (snapshot) {
      cb(null, snapshot, version);
    } else {
      cb(null, undefined);
    }
  };


  SnapshotStore.prototype.saveSnapshot = function saveSnapshot (documentId, version, data, cb) {
    if (!documentId || !version || !data) {
      throw new Error('Invalid arguments')
    }
    var docEntry = this._snapshots[documentId];
    if (!docEntry) {
      docEntry = this._snapshots[documentId] = {};
    }
    docEntry[version] = data;
    cb(null, docEntry[version]);
  };


  SnapshotStore.prototype.deleteSnapshot = function deleteSnapshot (documentId, version, cb) {
    var docEntry = this._snapshots[documentId];
    if (!docEntry || !docEntry[version]) {
      return cb(new Error('Snapshot does not exist and can not be deleted'))
    }
    var snapshot = this._snapshots[documentId][version];
    delete this._snapshots[documentId][version];
    cb(null, snapshot);
  };


  SnapshotStore.prototype._getVersions = function _getVersions (documentId) {
    var docEntry = this._snapshots[documentId];
    if (!docEntry) { return [] }
    return Object.keys(docEntry)
  };

  var CollabServerConfigurator = function CollabServerConfigurator() {
    this.config = {
      heartbeat: 30*1000,
      documentStore: undefined,
      changeStore: undefined,
      snapshotStore: undefined
    };
  };

  CollabServerConfigurator.prototype.setHost = function setHost (host) {
    this.config.host = host;
  };

  CollabServerConfigurator.prototype.setPort = function setPort (port) {
    this.config.port = port;
  };




  CollabServerConfigurator.prototype.setDocumentStore = function setDocumentStore (documentStore) {
    this.config.documentStore = documentStore;
  };

  CollabServerConfigurator.prototype.setChangeStore = function setChangeStore (changeStore) {
    this.config.changeStore = changeStore;
  };

  CollabServerConfigurator.prototype.setSnapshotStore = function setSnapshotStore (snapshotStore) {
    this.config.snapshotStore = snapshotStore;
  };




  CollabServerConfigurator.prototype.getHost = function getHost () {
    return this.config.host
  };

  CollabServerConfigurator.prototype.getPort = function getPort () {
    return this.config.port
  };

  CollabServerConfigurator.prototype.getDocumentStore = function getDocumentStore () {
    return this.config.documentStore
  };

  CollabServerConfigurator.prototype.getChangeStore = function getChangeStore () {
    return this.config.changeStore
  };

  CollabServerConfigurator.prototype.getSnapshotStore = function getSnapshotStore () {
    return this.config.snapshotStore
  };


  CollabServerConfigurator.prototype.getDocumentEngine = function getDocumentEngine () {
    if (!this.documentEngine) {
      this.documentEngine = new DocumentEngine({
        documentStore: this.config.documentStore,
        changeStore: this.config.changeStore,
        snapshotStore: this.config.snapshotStore
      });
    }
    return this.documentEngine
  };


  CollabServerConfigurator.prototype.import = function import$1 (pkg, options) {
    pkg.configure(this, options || {});
    return this
  };

  function isBoolean$2(val) {
    return (val === true || val === false || (val && val.constructor === Boolean) )
  }

  var Property = function Property(definition) {
    this.definition = definition;
  };

  var prototypeAccessors$7 = { type: {},name: {} };

  Property.prototype.isArray = function isArray$1 () {
    return isArray(this.definition.type)
  };

  Property.prototype.isReference = function isReference () {
    if (this.isArray()) {
      return last$2(this.definition.type) === 'id'
    } else {
      return this.definition.type === 'id'
    }
  };

  Property.prototype.isText = function isText () {
    return Boolean(this.definition._isText)
  };

  Property.prototype.isOwned = function isOwned () {
    return Boolean(this.definition.owned)
  };

  Property.prototype.isOptional = function isOptional () {
    return Boolean(this.definition.optional)
  };

  Property.prototype.isNotNull = function isNotNull () {
    return Boolean(this.definition.notNull)
  };

  Property.prototype.hasDefault = function hasDefault () {
    return this.definition.hasOwnProperty('default')
  };

  Property.prototype.getDefault = function getDefault () {
    return this.definition.default
  };

  Property.prototype.createDefaultValue = function createDefaultValue () {
    if (isArray(this.definition.type)) {
      return []
    }
    switch(this.definition.type) {
      case 'object':
        return {}
      case 'number':
        return -1
      case 'coordinate':
        return new Coordinate([], 0)
      case 'boolean':
        return false
      case 'id':
        return null
      case 'string':
        return ''
      default:
        return null
    }
  };

  prototypeAccessors$7.type.get = function () {
    return this.definition.type
  };

  prototypeAccessors$7.name.get = function () {
    return this.definition.name
  };

  Object.defineProperties( Property.prototype, prototypeAccessors$7 );

  var Node = (function (EventEmitter$$1) {
    function Node(data) {
      var this$1 = this;

      EventEmitter$$1.call(this);

      var NodeClass = this.constructor;

      var schema = NodeClass.schema;
      for (var name in schema) {
        if (!schema.hasOwnProperty(name)) { continue }
        var prop = schema[name];


        var propIsGiven = (data[name] !== undefined);
        var hasDefault = prop.hasDefault();
        var isOptional = prop.isOptional();
        if ( (!isOptional && !hasDefault) && !propIsGiven) {
          throw new Error('Property ' + name + ' is mandatory for node type ' + this$1.type)
        }
        if (propIsGiven) {
          this$1[name] = _checked(prop, data[name]);
        } else if (hasDefault) {
          this$1[name] = cloneDeep(_checked(prop, prop.getDefault()));
        } else {

        }
      }
    }

    if ( EventEmitter$$1 ) Node.__proto__ = EventEmitter$$1;
    Node.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    Node.prototype.constructor = Node;

    var prototypeAccessors = { type: {} };

    Node.prototype.dispose = function dispose () {};


    Node.prototype.isInstanceOf = function isInstanceOf (typeName) {
      return Node.isInstanceOf(this.constructor, typeName)
    };

    Node.prototype.getSchema = function getSchema () {
      return this.constructor.schema
    };


    Node.prototype.getTypeNames = function getTypeNames () {
      var typeNames = [];
      var NodeClass = this.constructor;
      while (NodeClass.type !== "node") {
        typeNames.push(NodeClass.type);
        NodeClass = Object.getPrototypeOf(NodeClass);
      }
      return typeNames
    };


    Node.prototype.getPropertyType = function getPropertyType (propertyName) {
      var schema = this.constructor.schema;
      return schema[propertyName].type
    };


    Node.prototype.toJSON = function toJSON () {
      var this$1 = this;

      var data = {
        type: this.type
      };
      var schema = this.getSchema();
      forEach(schema, function (prop, name) {
        var val = this$1[name];
        if (prop.isOptional() && val === undefined) { return }
        if (isArray(val) || isObject(val)) {
          val = cloneDeep(val);
        }
        data[prop.name] = val;
      });
      return data
    };

    prototypeAccessors.type.get = function () {
      return this.constructor.type
    };

    Object.defineProperties( Node.prototype, prototypeAccessors );

    return Node;
  }(EventEmitter));

  Node.prototype._isNode = true;


  Object.defineProperty(Node, 'schema', {
    get: function get() { return this._schema },
    set: function set(schema) {
      var NodeClass = this;


      if (schema.type) {
        NodeClass.type = schema.type;
      }



      NodeClass._schema = compileSchema(NodeClass, schema);
    }
  });

  Node.define = Node.defineSchema = function define(schema) {
    this.schema = schema;
  };

  Node.schema = {
    type: "node",
    id: 'string'
  };


  Node.isInstanceOf = function(NodeClass, typeName) {
    var type = NodeClass.type;
    while (type !== "node") {
      if (type === typeName) { return true }
      var _super = Object.getPrototypeOf(NodeClass.prototype).constructor;
      if (_super && _super.type) {
        NodeClass = _super;
        type = NodeClass.type;
      } else {
        break
      }
    }
    return false
  };



  function compileSchema(NodeClass, schema) {
    var compiledSchema = _compileSchema(schema);
    var schemas = [compiledSchema];
    var clazz = NodeClass;
    while(clazz) {
      var parentProto = Object.getPrototypeOf(clazz.prototype);
      if (!parentProto) {
        break
      }
      clazz = parentProto.constructor;
      if (clazz && clazz._schema) {
        schemas.unshift(clazz._schema);
      }
    }
    schemas.unshift({});
    return Object.assign.apply(null, schemas)
  }

  function _compileSchema(schema) {
    var compiledSchema = {};
    forEach(schema, function(definition, name) {

      if (name === 'type') {
        return
      }
      if (isString(definition) || isArray(definition)) {
        definition = { type: definition };
      }
      definition = _compileDefintion(definition);
      definition.name = name;
      compiledSchema[name] = new Property(definition);
    });
    return compiledSchema
  }

  function _compileDefintion(definition) {
    var result = definition;
    if (isArray(definition.type) && definition.type[0] !== "array") {
      definition.type = [ "array", definition.type[0] ];
    } else if (definition.type === 'text') {
      result = {
        type: "string",
        default: '',
        _isText: true
      };
    }
    return result
  }

  function _checked(prop, value) {
    var type;
    var name = prop.name;
    if (prop.isArray()) {
      type = "array";
    } else {
      type = prop.type;
    }
    if (value === null) {
      if (prop.isNotNull()) {
        throw new Error('Value for property ' + name + ' is null.')
      } else {
        return value
      }
    }
    if (value === undefined) {
      throw new Error('Value for property ' + name + ' is undefined.')
    }
    if (type === "string" && !isString(value) ||
        type === "boolean" && !isBoolean$2(value) ||
        type === "number" && !isNumber(value) ||
        type === "array" && !isArray(value) ||
        type === "id" && !isString(value) ||
        type === "object" && !isObject(value)) {
      throw new Error('Illegal value type for property ' + name + ': expected ' + type + ', was ' + (typeof value))
    }
    return value
  }

  var DocumentNode = (function (DataNode) {
    function DocumentNode(doc, props) {
      DataNode.call(this, props);



      this.document = doc;
    }

    if ( DataNode ) DocumentNode.__proto__ = DataNode;
    DocumentNode.prototype = Object.create( DataNode && DataNode.prototype );
    DocumentNode.prototype.constructor = DocumentNode;


    DocumentNode.prototype.getDocument = function getDocument () {
      return this.document
    };


    DocumentNode.prototype.hasParent = function hasParent () {
      return Boolean(this.parent)
    };


    DocumentNode.prototype.getParent = function getParent () {
      return this.document.get(this.parent)
    };


    DocumentNode.prototype.getRoot = function getRoot () {
      var node = this;
      while(node.parent) {
        node = node.parent;
      }
      return node
    };


    DocumentNode.prototype.hasChildren = function hasChildren () {
      return false
    };


    DocumentNode.prototype.getChildIndex = function getChildIndex (child) {
      return -1
    };


    DocumentNode.prototype.getChildAt = function getChildAt (idx) {
      return null
    };


    DocumentNode.prototype.getChildCount = function getChildCount () {
      return 0
    };




    DocumentNode.prototype.setHighlighted = function setHighlighted (highlighted, scope) {
      if (this.highlighted !== highlighted) {
        this.highlightedScope = scope;
        this.highlighted = highlighted;
        this.emit('highlighted', highlighted);
      }
    };



    DocumentNode.prototype.on = function on (eventName, handler, ctx) {
      var match = _matchPropertyEvent(eventName);
      if (match) {
        var propertyName = match[1];
        if (this.constructor.schema[propertyName]) {
          var doc = this.getDocument();
          doc.getEventProxy('path')
              .on([this.id, propertyName], handler, ctx);
        }
      }
      EventEmitter.prototype.on.apply(this, arguments);
    };

    DocumentNode.prototype.off = function off (ctx, eventName, handler) {
      var doc = this.getDocument();
      var match = false;
      if (!eventName) {
        doc.getEventProxy('path').off(ctx);
      } else {
        match = _matchPropertyEvent(eventName);
      }
      if (match) {
        var propertyName = match[1];
        doc.getEventProxy('path')
            .off(ctx, [this.id, propertyName], handler);
      }
      EventEmitter.prototype.off.apply(this, arguments);
    };

    DocumentNode.prototype._onPropertyChange = function _onPropertyChange (propertyName) {
      var args = [propertyName + ':changed']
          .concat(Array.prototype.slice.call(arguments, 1));
      this.emit.apply(this, args);
    };





    DocumentNode.prototype.isBlock = function isBlock () {
      return Boolean(this.constructor.isBlock)
    };


    DocumentNode.prototype.isText = function isText () {
      return Boolean(this.constructor.isText)
    };


    DocumentNode.prototype.isInline = function isInline () {
      return Boolean(this.constructor.isInline)
    };

    DocumentNode.prototype.isList = function isList () {
      return Boolean(this.constructor.isList)
    };

    DocumentNode.prototype.isIsolatedNode = function isIsolatedNode () {
      return !this.isText() && !this.isList()
    };

    return DocumentNode;
  }(Node));

  DocumentNode.prototype._isDocumentNode = true;


  DocumentNode.isBlock = false;


  DocumentNode.isText = false;


  DocumentNode.isPropertyAnnotation = false;


  DocumentNode.isContainerAnnotation = false;


  DocumentNode.isInline = false;

  function _matchPropertyEvent(eventName) {
    return /([a-zA-Z_0-9]+):changed/.exec(eventName)
  }

  var BlockNode = (function (DocumentNode$$1) {
    function BlockNode () {
      DocumentNode$$1.apply(this, arguments);
    }if ( DocumentNode$$1 ) BlockNode.__proto__ = DocumentNode$$1;
    BlockNode.prototype = Object.create( DocumentNode$$1 && DocumentNode$$1.prototype );
    BlockNode.prototype.constructor = BlockNode;



    return BlockNode;
  }(DocumentNode));

  BlockNode.isBlock = true;

  var ContainerAddress = function ContainerAddress(pos, offset) {
    this.pos = pos;
    this.offset = offset;
  };

  ContainerAddress.prototype.isBefore = function isBefore (other, strict) {
    strict = Boolean(strict);
    if (this.pos < other.pos) {
      return true
    } else if (this.pos > other.pos) {
      return false
    } else if (this.offset < other.offset) {
      return true
    } else if (this.offset > other.offset) {
      return false
    }
    if (strict) {
      return false
    } else {
      return true
    }
  };

  ContainerAddress.prototype.isAfter = function isAfter (other, strict) {
    return other.isBefore(this, strict)
  };

  ContainerAddress.prototype.isEqual = function isEqual (other) {
    return (this.pos === other.pos && this.offset === other.offset)
  };

  ContainerAddress.prototype.toString = function toString () {
    return [this.pos,'.',this.offset].join('')
  };

  var Container = (function (DocumentNode$$1) {
    function Container() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      DocumentNode$$1.apply(this, args);




      this._enableCaching();
    }

    if ( DocumentNode$$1 ) Container.__proto__ = DocumentNode$$1;
    Container.prototype = Object.create( DocumentNode$$1 && DocumentNode$$1.prototype );
    Container.prototype.constructor = Container;

    var prototypeAccessors = { length: {} };

    Container.prototype.dispose = function dispose () {
      this.document.off(this);
    };

    Container.prototype.getContentPath = function getContentPath () {
      return [this.id, 'nodes']
    };

    Container.prototype.getContent = function getContent () {
      return this.nodes
    };

    Container.prototype.getPosition = function getPosition (node, strict) {
      if (isString(node)) {
        node = this.document.get(node);
      }
      var pos = this._getPosition(node);
      if (strict && pos < 0) {
        throw new Error('Node is not within this container: ' + node.id)
      }
      return pos
    };

    Container.prototype.getNodeAt = function getNodeAt (idx) {
      var content = this.getContent();
      if (idx < 0 || idx >= content.length) {
        throw new Error('Array index out of bounds: ' + idx + ", " + content.length)
      }
      return this.getDocument().get(content[idx])
    };

    Container.prototype.getNodes = function getNodes () {
      var doc = this.getDocument();
      return this.getContent().map(function (id) { return doc.get(id); }).filter(Boolean)
    };

    Container.prototype.show = function show (nodeId, pos) {
      var doc = this.getDocument();
      var arg1 = arguments[0];
      if (!isString(arg1)) {
        if (arg1._isNode) {
          nodeId = arg1.id;
        }
      }
      if (!isNumber(pos)) {
        pos = this.getLength();
      }
      doc.update(this.getContentPath(), { type: 'insert', pos: pos, value: nodeId });
    };

    Container.prototype.hide = function hide (nodeId) {
      var doc = this.getDocument();
      var pos = this.getPosition(nodeId);
      if (pos >= 0) {
        doc.update(this.getContentPath(), { type: 'delete', pos: pos });
      }
    };

    Container.prototype.getAddress = function getAddress (coor) {
      if (!coor._isCoordinate) {

        throw new Error('Illegal argument: Container.getAddress(coor) expects a Coordinate instance.')
      }
      var nodeId = coor.path[0];
      var nodePos = this.getPosition(nodeId);
      var offset;
      if (coor.isNodeCoordinate()) {
        if (coor.offset > 0) {
          offset = Number.MAX_VALUE;
        } else {
          offset = 0;
        }
      } else {
        offset = coor.offset;
      }
      return new ContainerAddress(nodePos, offset)
    };

    Container.prototype.getLength = function getLength () {
      return this.getContent().length
    };

    prototypeAccessors.length.get = function () {
      return this.getLength()
    };

    Container.prototype._getPosition = function _getPosition (node) {
      if (this._isCaching) {
        return this._getCachedPosition(node)
      } else {
        return this._lookupPosition(node)
      }
    };

    Container.prototype._getCachedPosition = function _getCachedPosition (node) {
      var cache = this._cachedPositions || this._fillCache();
      var nodeId = node.id;
      var pos = -1;
      if (cache.hasOwnProperty(nodeId)) {
        pos = cache[nodeId];
      } else {
        pos = this._lookupPosition(node);
        cache[nodeId] = pos;
      }
      return pos
    };

    Container.prototype._fillCache = function _fillCache () {
      var positions = {};
      this.nodes.forEach(function (id, pos) {
        positions[id] = pos;
      });
      this._cachedPositions = positions;
      return positions
    };

    Container.prototype._invalidateCache = function _invalidateCache () {
      this._cachedPositions = null;
    };

    Container.prototype._lookupPosition = function _lookupPosition (node) {
      if (node.hasParent()) {
        node = node.getRoot();
      }
      return this.getContent().indexOf(node.id)
    };

    Container.prototype._enableCaching = function _enableCaching () {


      if (this.document) {
        this.document.data.on('operation:applied', this._onOperationApplied, this);
        this._isCaching = true;
      }
    };

    Container.prototype._onOperationApplied = function _onOperationApplied (op) {
      if (op.type === 'set' || op.type === 'update') {
        if (op.path[0] === this.id) {
          this._invalidateCache();
        }
      }
    };

    Container.prototype._onDocumentChange = function _onDocumentChange (change) {
      if (change.isUpdated(this.getContentPath())) {
        this._invalidateCache();
      }
    };




    Container.prototype.hasChildren = function hasChildren () {
      return this.nodes.length > 0
    };

    Container.prototype.getChildIndex = function getChildIndex (child) {
      return this.nodes.indexOf(child.id)
    };

    Container.prototype.getChildren = function getChildren () {
      var doc = this.getDocument();
      var childrenIds = this.nodes;
      return childrenIds.map(function(id) {
        return doc.get(id)
      })
    };

    Container.prototype.getChildAt = function getChildAt (idx) {
      var childrenIds = this.nodes;
      if (idx < 0 || idx >= childrenIds.length) {
        throw new Error('Array index out of bounds: ' + idx + ", " + childrenIds.length)
      }
      return this.getDocument().get(childrenIds[idx])
    };

    Container.prototype.getChildCount = function getChildCount () {
      return this.nodes.length
    };

    Object.defineProperties( Container.prototype, prototypeAccessors );

    return Container;
  }(DocumentNode));

  Container.prototype._isContainer = true;

  Container.schema = {
    type: 'container',
    nodes: { type: ['array', 'id'], default: [] }
  };

  var Annotation = (function (DocumentNode$$1) {
    function Annotation(doc, props) {
      DocumentNode$$1.call(this, doc, _normalizedProps(props));


      this.start = new Coordinate(this.start);
      this.end = new Coordinate(this.end);
    }

    if ( DocumentNode$$1 ) Annotation.__proto__ = DocumentNode$$1;
    Annotation.prototype = Object.create( DocumentNode$$1 && DocumentNode$$1.prototype );
    Annotation.prototype.constructor = Annotation;

    var prototypeAccessors = { startPath: {},startOffset: {},endPath: {},endOffset: {} };

    prototypeAccessors.startPath.get = function () {
      console.warn('DEPRECATED: use Annotation.start.path instead.');
      return this.start.path
    };

    prototypeAccessors.startPath.set = function (path) {
      console.warn('DEPRECATED: use Annotation.start.path instead.');
      this.start.path = path;
    };

    prototypeAccessors.startOffset.get = function () {
      console.warn('DEPRECATED: use Annotation.start.offset instead.');
      return this.start.offset
    };

    prototypeAccessors.startOffset.set = function (offset) {
      console.warn('DEPRECATED: use Annotation.start.offset instead.');
      this.start.offset = offset;
    };

    prototypeAccessors.endPath.get = function () {
      console.warn('DEPRECATED: use Annotation.end.path instead.');
      return this.end.path
    };

    prototypeAccessors.endPath.set = function (path) {
      console.warn('DEPRECATED: use Annotation.end.path instead.');
      this.end.path = path;
    };

    prototypeAccessors.endOffset.get = function () {
      console.warn('DEPRECATED: use Annotation.end.offset instead.');
      return this.end.offset
    };

    prototypeAccessors.endOffset.set = function (offset) {
      console.warn('DEPRECATED: use Annotation.end.offset instead.');
      this.end.offset = offset;
    };


    Annotation.prototype.getText = function getText () {
      var doc = this.getDocument();
      if (!doc) {
        console.warn('Trying to use a Annotation which is not attached to the document.');
        return ""
      }
      return documentHelpers.getTextForSelection(doc, this.getSelection())
    };


    Annotation.prototype.canSplit = function canSplit () {
      return true
    };


    Annotation.prototype.isAnchor = function isAnchor () {
      return false
    };

    Object.defineProperties( Annotation.prototype, prototypeAccessors );

    return Annotation;
  }(DocumentNode));

  Annotation.define({
    type: "annotation",
    start: "coordinate",
    end: "coordinate"
  });

  Annotation.prototype._isAnnotation = true;

  function _normalizedProps(props) {
    if (!props.hasOwnProperty('start')) {

      console.warn('DEPRECATED: create Annotation with "start" and "end" coordinate instead.');
      props = Object.assign({}, props);
      props.start = {
        path: props.startPath || props.path,
        offset: props.startOffset
      };
      props.end = {};
      if (props.hasOwnProperty('endPath')) {
        props.end.path = props.endPath;
      } else {
        props.end.path = props.start.path;
      }
      if (props.hasOwnProperty('endOffset')) {
        props.end.offset = props.endOffset;
      } else {
        props.end.offset = props.start.offset;
      }
      delete props.path;
      delete props.startPath;
      delete props.endPath;
      delete props.startOffset;
      delete props.endOffset;
    } else if (props.hasOwnProperty('end') && !props.end.path) {
      props.end.path = props.start.path;
    }
    return props
  }

  var ContainerAnnotation = (function (Annotation$$1) {
    function ContainerAnnotation () {
      Annotation$$1.apply(this, arguments);
    }

    if ( Annotation$$1 ) ContainerAnnotation.__proto__ = Annotation$$1;
    ContainerAnnotation.prototype = Object.create( Annotation$$1 && Annotation$$1.prototype );
    ContainerAnnotation.prototype.constructor = ContainerAnnotation;

    ContainerAnnotation.prototype.getSelection = function getSelection () {
      var doc = this.getDocument();

      if (!doc) {
        console.warn('Trying to use a ContainerAnnotation which is not attached to the document.');
        return Selection.nullSelection()
      }
      return doc.createSelection({
        type: "container",
        containerId: this.containerId,
        startPath: this.start.path,
        startOffset: this.start.offset,
        endPath: this.end.path,
        endOffset: this.end.offset
      })
    };

    ContainerAnnotation.prototype.setHighlighted = function setHighlighted (highlighted, scope) {
      if (this.highlighted !== highlighted) {
        this.highlighted = highlighted;
        this.highlightedScope = scope;
        this.emit('highlighted', highlighted, scope);
        forEach(this.fragments, function(frag) {
          frag.emit('highlighted', highlighted, scope);
        });
      }
    };

    ContainerAnnotation.prototype._updateRange = function _updateRange (tx, sel) {
      if (!sel.isContainerSelection()) {
        throw new Error('Invalid argument.')
      }

      if (!isEqual(this.start.path, sel.start.path)) {
        tx.set([this.id, 'start', 'path'], sel.start.path);
      }
      if (this.start.offset !== sel.start.offset) {
        tx.set([this.id, 'start', 'offset'], sel.start.offset);
      }
      if (!isEqual(this.end.path, sel.end.path)) {
        tx.set([this.id, 'end', 'path'], sel.end.path);
      }
      if (this.end.offset !== sel.end.offset) {
        tx.set([this.id, 'end', 'offset'], sel.end.offset);
      }
    };

    return ContainerAnnotation;
  }(Annotation));

  ContainerAnnotation.schema = {
    type: "container-annotation",
    containerId: "string"
  };

  ContainerAnnotation.prototype._isContainerAnnotation = true;

  var PropertyAnnotation = (function (Annotation$$1) {
    function PropertyAnnotation () {
      Annotation$$1.apply(this, arguments);
    }

    if ( Annotation$$1 ) PropertyAnnotation.__proto__ = Annotation$$1;
    PropertyAnnotation.prototype = Object.create( Annotation$$1 && Annotation$$1.prototype );
    PropertyAnnotation.prototype.constructor = PropertyAnnotation;

    var prototypeAccessors = { path: {},startPath: {},endPath: {} };

    prototypeAccessors.path.get = function () {
      return this.start.path
    };

    PropertyAnnotation.prototype.getPath = function getPath () {
      return this.start.path
    };

    PropertyAnnotation.prototype.getSelection = function getSelection () {
      return this.getDocument().createSelection({
        type: 'property',
        path: this.path,
        startOffset: this.start.offset,
        endOffset: this.end.offset
      })
    };


    PropertyAnnotation.prototype._updateRange = function _updateRange (tx, sel) {
      if (!sel.isPropertySelection()) {
        throw new Error('Invalid argument: PropertyAnnotation._updateRange() requires a PropertySelection.')
      }
      if (!isArrayEqual(this.start.path, sel.start.path)) {
        tx.set([this.id, 'path'], sel.start.path);
      }

      if (this.start.offset !== sel.start.offset) {
        tx.set([this.id, 'start', 'offset'], sel.start.offset);
      }
      if (this.end.offset !== sel.end.offset) {
        tx.set([this.id, 'end', 'offset'], sel.end.offset);
      }
    };

    prototypeAccessors.startPath.get = function () {
      return this.path
    };

    prototypeAccessors.endPath.get = function () {
      return this.path
    };

    Object.defineProperties( PropertyAnnotation.prototype, prototypeAccessors );

    return PropertyAnnotation;
  }(Annotation));

  PropertyAnnotation.isPropertyAnnotation = true;
  PropertyAnnotation.prototype._isAnnotation = true;
  PropertyAnnotation.prototype._isPropertyAnnotation = true;

  PropertyAnnotation.schema = {
    type: "annotation",
    start: "coordinate",
    end: "coordinate",


    _content: { type: "string", optional: true}
  };

  var ENTER = 1;
  var EXIT = -1;
  var ANCHOR = -2;






























  var Fragmenter = function Fragmenter(options) {
    Object.assign(this, options);
  };

  Fragmenter.prototype.start = function start (rootContext, text, annotations) {
    if (!isString(text)) {
      throw new Error("Illegal argument: 'text' must be a String, but was " + text)
    }
    this._start(rootContext, text, annotations);
  };

  Fragmenter.prototype.onText = function onText (context, text, entry) {
  };


  Fragmenter.prototype.onEnter = function onEnter (entry, parentContext) {
    return null
  };

  Fragmenter.prototype.onExit = function onExit (entry, context, parentContext) {
  };

  Fragmenter.prototype._enter = function _enter (entry, parentContext) {
    entry.counter++;
    return this.onEnter(entry, parentContext)
  };

  Fragmenter.prototype._exit = function _exit (entry, context, parentContext) {
    this.onExit(entry, context, parentContext);
  };

  Fragmenter.prototype._createText = function _createText (context, text, entry) {
    this.onText(context, text, entry);
  };

  Fragmenter.prototype._start = function _start (rootContext, text, annotations) {
    var this$1 = this;

    var entries = _extractEntries.call(this, annotations);
    var stack = [{context: rootContext, entry: null}];

    var pos = 0;
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var textFragment = text.substring(pos, entry.pos);
      if (textFragment) {

        this$1._createText(stack[stack.length-1].context, textFragment, entry);
      }

      pos = entry.pos;
      var stackLevel, idx, _entry;
      if (entry.mode === ENTER || entry.mode === ANCHOR) {

        for (stackLevel = 1; stackLevel < stack.length; stackLevel++) {
          if (entry.level < stack[stackLevel].entry.level) {
            break
          }
        }


        for (idx = stack.length-1; idx >= stackLevel; idx--) {
          _entry = stack[idx].entry;

          _entry.length = pos - _entry.pos;
          this$1._exit(_entry, stack[idx].context, stack[idx-1].context);
        }
        stack.splice(stackLevel, 0, {entry: entry});

        for (idx = stackLevel; idx < stack.length; idx++) {
          _entry = stack[idx].entry;

          _entry.pos = pos;
          stack[idx].context = this$1._enter(_entry, stack[idx-1].context);
        }
      }
      if (entry.mode === EXIT || entry.mode === ANCHOR) {

        for (stackLevel = 1; stackLevel < stack.length; stackLevel++) {
          if (stack[stackLevel].entry.node === entry.node) {
            break
          }
        }
        for (idx = stack.length-1; idx >= stackLevel; idx--) {
          _entry = stack[idx].entry;

          _entry.length = pos - _entry.pos;
          this$1._exit(_entry, stack[idx].context, stack[idx-1].context);
        }
        stack.splice(stackLevel, 1);

        for (idx = stackLevel; idx < stack.length; idx++) {
          _entry = stack[idx].entry;

          _entry.pos = pos;
          stack[idx].context = this$1._enter(_entry, stack[idx-1].context);
        }
      }
    }


    var trailingText = text.substring(pos);
    if (trailingText) {
      this._createText(rootContext, trailingText);
    }
  };

  Fragmenter.SHOULD_NOT_SPLIT = 0;
  Fragmenter.NORMAL = 10;
  Fragmenter.ANY = 100;
  Fragmenter.ALWAYS_ON_TOP = Number.MAX_VALUE;







































  function _extractEntries(annotations) {
    var openers = [];
    var closers = [];
    forEach(annotations, function(a) {
      var isAnchor = (a.isAnchor ? a.isAnchor() : false);

      if (isAnchor) {
        openers.push({
          mode: ANCHOR,
          pos: a.offset,
          id: a.id,
          level: Fragmenter.ALWAYS_ON_TOP,
          type: 'anchor',
          node: a,
          counter: -1,
          length: 0
        });
      } else {









        var l = Fragmenter.NORMAL;
        var isInline = (a.isInline ? a.isInline() : false);
        if (isInline) {
          l = Number.MAX_VALUE;
        } else if (a.constructor.hasOwnProperty('fragmentation')) {
          l = a.constructor.fragmentation;
        } else if (a.hasOwnProperty('fragmentationHint')) {
          l = a.fragmentationHint;
        }
        var startOffset = Math.min(a.start.offset, a.end.offset);
        var endOffset = Math.max(a.start.offset, a.end.offset);
        var opener = {
          pos: startOffset,
          mode: ENTER,
          level: l,
          id: a.id,
          type: a.type,
          node: a,
          length: 0,
          counter: -1,
        };
        openers.push(opener);
        closers.push({
          pos: endOffset,
          mode: EXIT,
          level: l,
          id: a.id,
          type: a.type,
          node: a,
          opener: opener
        });
      }
    });


    openers.sort(_compareOpeners);

    for (var i = openers.length - 1; i >= 0; i--) {
      openers[i].idx = i;
    }
    closers.sort(_compareClosers);

    var entries = new Array(openers.length+closers.length);
    var idx = 0;
    var idx1 = 0;
    var idx2 = 0;
    var opener = openers[idx1];
    var closer = closers[idx2];
    while(opener || closer) {
      if (opener && closer) {

        if (closer.pos <= opener.pos && closer.opener !== opener) {
          entries[idx] = closer;
          idx2++;
        } else {
          entries[idx] = opener;
          idx1++;
        }
      } else if (opener) {
        entries[idx] = opener;
        idx1++;
      } else if (closer) {
        entries[idx] = closer;
        idx2++;
      }
      opener = openers[idx1];
      closer = closers[idx2];
      idx++;
    }
    return entries
  }

  function _compareOpeners(a, b) {
    if (a.pos < b.pos) { return -1 }
    if (a.pos > b.pos) { return 1 }
    if (a.mode < b.mode) { return -1 }
    if (a.mode > b.mode) { return 1 }
    if (a.mode === b.mode) {
      if (a.level < b.level) { return -1 }
      if (a.level > b.level) { return 1 }
    }
    return 0
  }


  function _compareClosers(a, b) {
    if (a.pos < b.pos) { return -1 }
    if (a.pos > b.pos) { return 1 }





    if (a.pos === a.opener.pos && b.pos === b.opener.pos) {
      if (a.opener.idx < b.opener.idx) {
        return -1
      } else {
        return 1
      }
    }
    if (a.opener.idx > b.opener.idx) { return -1 }
    if (a.opener.idx < b.opener.idx) { return 1 }
    return 0
  }

  function encodeXMLEntities(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
  }

  var DOMExporter = function DOMExporter(config, context) {
    this.context = context || {};
    if (!config.converters) {
      throw new Error('config.converters is mandatory')
    }
    if (!config.converters._isRegistry) {
      this.converters = new Registry();
      config.converters.forEach(function(Converter) {
        var converter = isFunction$2(Converter) ? new Converter() : Converter;
        if (!converter.type) {
          console.error('Converter must provide the type of the associated node.', converter);
          return
        }
        this.converters.add(converter.type, converter);
      }.bind(this));
    } else {
      this.converters = config.converters;
    }

    this.state = {
      doc: null
    };
    this.config = config;


    this._elementFactory = config.elementFactory;
    if (!this._elementFactory) {
      throw new Error("'elementFactory' is mandatory")
    }
    this.$$ = this.createElement.bind(this);
  };

  DOMExporter.prototype.exportDocument = function exportDocument (doc) {




    return this.convertDocument(doc)
  };


  DOMExporter.prototype.convertDocument = function convertDocument (doc) {
    throw new Error('This method is abstract')
  };

  DOMExporter.prototype.convertContainer = function convertContainer (container) {
    if (!container) {
      throw new Error('Illegal arguments: container is mandatory.')
    }
    var doc = container.getDocument();
    this.state.doc = doc;
    var elements = [];
    container.nodes.forEach(function(id) {
      var node = doc.get(id);
      var nodeEl = this.convertNode(node);
      elements.push(nodeEl);
    }.bind(this));
    return elements
  };

  DOMExporter.prototype.convertNode = function convertNode (node) {
    if (isString(node)) {

      node = this.state.doc.get(node);
    } else {
      this.state.doc = node.getDocument();
    }
    var converter = this.getNodeConverter(node);


    if (node._isPropertyAnnotation && (!converter || !converter.export)) {
      return this._convertPropertyAnnotation(node)
    }
    if (!converter) {
      converter = this.getDefaultBlockConverter();
    }
    var el;
    if (converter.tagName) {
      el = this.$$(converter.tagName);
    } else {
      el = this.$$('div');
    }
    el.attr(this.config.idAttribute, node.id);
    if (converter.export) {
      el = converter.export(node, el, this) || el;
    } else {
      el = this.getDefaultBlockConverter().export(node, el, this) || el;
    }
    return el
  };

  DOMExporter.prototype.convertProperty = function convertProperty (doc, path, options) {
    this.initialize(doc, options);
    var wrapper = this.$$('div')
        .append(this.annotatedText(path));
    return wrapper.innerHTML
  };

  DOMExporter.prototype.annotatedText = function annotatedText (path) {
    var doc = this.state.doc;
    var text = doc.get(path);
    var annotations = doc.getIndex('annotations').get(path);
    return this._annotatedText(text, annotations)
  };

  DOMExporter.prototype.getNodeConverter = function getNodeConverter (node) {
    return this.converters.get(node.type)
  };

  DOMExporter.prototype.getDefaultBlockConverter = function getDefaultBlockConverter () {
    throw new Error('This method is abstract.')
  };

  DOMExporter.prototype.getDefaultPropertyAnnotationConverter = function getDefaultPropertyAnnotationConverter () {
    throw new Error('This method is abstract.')
  };

  DOMExporter.prototype.getDocument = function getDocument () {
    return this.state.doc
  };

  DOMExporter.prototype.createElement = function createElement (str) {
    return this._elementFactory.createElement(str)
  };

  DOMExporter.prototype._annotatedText = function _annotatedText (text, annotations) {
    var self = this;

    var annotator = new Fragmenter();
    annotator.onText = function(context, text) {
      context.children.push(encodeXMLEntities(text));
    };
    annotator.onEnter = function(fragment) {
      var anno = fragment.node;
      return {
        annotation: anno,
        children: []
      }
    };
    annotator.onExit = function(fragment, context, parentContext) {
      var anno = context.annotation;
      var converter = self.getNodeConverter(anno);
      if (!converter) {
        converter = self.getDefaultPropertyAnnotationConverter();
      }
      var el;
      if (converter.tagName) {
        el = this.$$(converter.tagName);
      } else {
        el = this.$$('span');
      }
      el.attr(this.config.idAttribute, anno.id);
      el.append(context.children);
      if (converter.export) {
        el = converter.export(anno, el, self) || el;
      }
      parentContext.children.push(el);
    }.bind(this);
    var wrapper = { children: [] };
    annotator.start(wrapper, text, annotations);
    return wrapper.children
  };


  DOMExporter.prototype._convertPropertyAnnotation = function _convertPropertyAnnotation (anno) {

    var wrapper = this.$$('div').append(this.annotatedText(anno.path));
    var el = wrapper.find('['+this.config.idAttribute+'="'+anno.id+'"]');
    return el
  };

  function createCountingIdGenerator() {
    var counters = {};
    return function uuid(prefix) {
      if (!counters.hasOwnProperty(prefix)) {
        counters[prefix] = 1;
      }
      var result = [prefix, '-', counters[prefix]++].join('');
      return result
    }
  }

  var WS_LEFT = /^\s+/g;
  var WS_LEFT_ALL = /^\s*/g;
  var WS_RIGHT = /\s+$/g;
  var WS_ALL = /\s+/g;


  var SPACE = " ";
  var TABS_OR_NL = /[\t\n\r]+/g;


  var DOMImporter = function DOMImporter(config, context) {
    this.context = context || {};

    if (!config.converters) {
      throw new Error('config.converters is mandatory')
    }
    if (!config.DocumentClass) {
      throw new Error('DocumentClass is mandatory')
    }

    this.config = extend({ idAttribute: 'id' }, config);
    this.schema = config.schema;
    this.state = null;

    this._defaultBlockConverter = null;
    this._allConverters = [];
    this._blockConverters = [];
    this._propertyAnnotationConverters = [];

    var schema = this.schema;
    var defaultTextType = schema.getDefaultTextType();

    config.converters.forEach(function(Converter) {
      var converter;
      if (typeof Converter === 'function') {

        converter = new Converter();
      } else {
        converter = Converter;
      }
      if (!converter.type) {
        console.error('Converter must provide the type of the associated node.', converter);
        return
      }
      if (!converter.matchElement && !converter.tagName) {
        console.error('Converter must provide a matchElement function or a tagName property.', converter);
        return
      }
      if (!converter.matchElement) {
        converter.matchElement = this._defaultElementMatcher.bind(converter);
      }
      var NodeClass = schema.getNodeClass(converter.type);
      if (!NodeClass) {
        console.error('No node type defined for converter', converter.type);
        return
      }
      if (!this._defaultBlockConverter && defaultTextType === converter.type) {
        this._defaultBlockConverter = converter;
      }

      this._allConverters.push(converter);

      if (NodeClass.prototype._isPropertyAnnotation) {
        this._propertyAnnotationConverters.push(converter);
      } else {
        this._blockConverters.push(converter);
      }

    }.bind(this));

    this.state = new DOMImporter.State();
  };

  DOMImporter.prototype.reset = function reset () {
    this.state.reset();
    this.createDocument();
  };

  DOMImporter.prototype.createDocument = function createDocument () {
    this.state.doc = this._createDocument(this.config.schema);
    return this.state.doc
  };



  DOMImporter.prototype._createDocument = function _createDocument (schema) {

    var doc = new this.config.DocumentClass(schema);
    return doc
  };






  DOMImporter.prototype.generateDocument = function generateDocument () {
    if (!this.state.doc) {
      this.state.doc = this.createDocument();
    }
    this._createNodes();
    return this.state.doc
  };

  DOMImporter.prototype._createNodes = function _createNodes$1 () {
    var state = this.state;
    _createNodes(state.doc, state.nodes);
    this._createInlineNodes();
  };

  DOMImporter.prototype._createInlineNodes = function _createInlineNodes () {
    var state = this.state;
    _createNodes(state.doc, state.inlineNodes);
  };


  DOMImporter.prototype.convertContainer = function convertContainer (elements, containerId) {
    var this$1 = this;

    var state = this.state;
    state.container = [];
    state.containerId = containerId;
    var iterator = new ArrayIterator(elements);
    while(iterator.hasNext()) {
      var el = iterator.next();
      var blockTypeConverter = this$1._getConverterForElement(el, 'block');
      var node;
      if (blockTypeConverter) {
        node = this$1._createNode(el, blockTypeConverter.type);
        state.pushContext(el.tagName, blockTypeConverter);
        node = blockTypeConverter.import(el, node, this$1) || node;
        state.popContext();
        this$1._createAndShow(node);
      } else {
        if (el.isCommentNode()) {

        } else if (el.isTextNode()) {
          var text = el.textContent;
          if (/^\s*$/.exec(text)) { continue }


          iterator.back();
          this$1._wrapInlineElementsIntoBlockElement(iterator);
        } else if (el.isElementNode()) {




          iterator.back();
          this$1._wrapInlineElementsIntoBlockElement(iterator);
        }
      }
    }
    var container = {
      type: 'container',
      id: containerId,
      nodes: this.state.container.slice(0)
    };
    this.createNode(container);
    return container
  };


  DOMImporter.prototype.convertElement = function convertElement (el) {
    var isTopLevel = !this.state.isConverting;
    if (isTopLevel) {
      this.state.isConverting = true;
    }
    var node = this._convertElement(el);


    if (this.config["stand-alone"] && isTopLevel) {
      this.state.isConverting = false;
      this.generateDocument();
      node = this.state.doc.get(node.id);
      this.reset();
    }
    return node
  };

  DOMImporter.prototype._convertElement = function _convertElement (el, mode) {
    var node;
    var converter = this._getConverterForElement(el, mode);
    if (converter) {
      node = this._createNode(el, converter.type);
      var NodeClass = this.schema.getNodeClass(node.type);
      this.state.pushContext(el.tagName, converter);





      if (NodeClass.isInline) {
        this._convertInlineNode(el, node, converter);
      }
      else if (NodeClass.prototype._isPropertyAnnotation) {
        this._convertPropertyAnnotation(el, node);
      } else {
        node = converter.import(el, node, this) || node;
      }
      this.state.popContext();
      this.createNode(node);
    } else {
      throw new Error('No converter found for '+el.tagName)
    }
    return node
  };

  DOMImporter.prototype._convertPropertyAnnotation = function _convertPropertyAnnotation (el, node) {



    node._content = this.annotatedText(el, node.path);
    node.start = {
      path: [node.id, '_content'],
      offset: 0
    };
    node.end = {
      offset: node._content.length
    };
  };

  DOMImporter.prototype._convertInlineNode = function _convertInlineNode (el, node, converter) {
    node._content = '$';
    node.start = {
      path: [node.id, '_content'],
      offset: 0
    };
    node.end = {
      offset: 1
    };
    node = converter.import(el, node, this);
    return node
  };

  DOMImporter.prototype.createNode = function createNode (node) {
    if (!node.type) {
      throw new Error('node.type required.')
    }
    if (!node.id) {
      node.id = this.nextId(node.type);
    }
    if (this.state.ids[node.id]) {
      throw new Error('Node with id alread exists:' + node.id)
    }
    this.state.ids[node.id] = true;
    this.state.nodes.push(node);
    return node
  };

  DOMImporter.prototype.show = function show (node) {
    this.state.container.push(node.id);
  };

  DOMImporter.prototype._createNode = function _createNode (el, type) {
    var NodeClass = this.schema.getNodeClass(type);
    if (!NodeClass) { throw new Error('No NodeClass registered for type '+type) }
    var nodeData = {};
    forEach(NodeClass.schema, function(prop, name) {
      if (prop.hasDefault()) {
        nodeData[name] = clone(prop.default);
      } else {




        nodeData[name] = prop.createDefaultValue();
      }
    });
    nodeData.type = type;
    nodeData.id = this.getIdForElement(el, type);


    var node = new NodeClass(null, nodeData);
    return node
  };

  DOMImporter.prototype._createAndShow = function _createAndShow (node) {
    this.createNode(node);
    this.show(node);
  };


  DOMImporter.prototype.annotatedText = function annotatedText (el, path, options) {
    var state = this.state;
    if (path) {



      if (options && options.preserveWhitespace) {
        state.preserveWhitespace = true;
      }
      state.stack.push({ path: path, offset: 0, text: ""});
    } else {
      if (state.stack.length===0) {
        throw new Error("Contract: DOMImporter.annotatedText() requires 'path' for non-reentrant call.", el.outerHTML)
      }
    }



    this.state.lastChar = '';
    var text;
    var iterator = el.getChildNodeIterator();
    text = this._annotatedText(iterator);
    if (path) {
      state.stack.pop();
      state.preserveWhitespace = false;
    }
    return text
  };


  DOMImporter.prototype.plainText = function plainText (el) {
    var state = this.state;
    var text = el.textContent;
    if (state.stack.length > 0) {
      var context = last$2(state.stack);
      context.offset += text.length;
      context.text += context.text.concat(text);
    }
    return text
  };


  DOMImporter.prototype.customText = function customText (text) {
    var state = this.state;
    if (state.stack.length > 0) {
      var context = last$2(state.stack);
      context.offset += text.length;
      context.text += context.text.concat(text);
    }
    return text
  };


  DOMImporter.prototype.nextId = function nextId (prefix) {




    return this.state.uuid(prefix)
  };

  DOMImporter.prototype.getIdForElement = function getIdForElement (el, type) {
    var this$1 = this;

    var id = el.getAttribute(this.config.idAttribute);
    if (id && !this.state.ids[id]) { return id }

    var root = el.getRoot();
    id = this.nextId(type);
    while (this.state.ids[id] || root.find('#'+id)) {
      id = this$1.nextId(type);
    }
    return id
  };

  DOMImporter.prototype.defaultConverter = function defaultConverter (el, converter) {
    if (!this.IGNORE_DEFAULT_WARNINGS) {
      console.warn('This element is not handled by the converters you provided. This is the default implementation which just skips conversion. Override DOMImporter.defaultConverter(el, converter) to change this behavior.', el.outerHTML);
    }
    var defaultTextType = this.schema.getDefaultTextType();
    var defaultConverter = this._defaultBlockConverter;
    if (!defaultConverter) {
      throw new Error('Could not find converter for default type ', defaultTextType)
    }
    var node = this._createNode(el, defaultTextType);
    this.state.pushContext(el.tagName, converter);
    node = defaultConverter.import(el, node, converter) || node;
    this.state.popContext();
    return node
  };

  DOMImporter.prototype._defaultElementMatcher = function _defaultElementMatcher (el) {
    return el.is(this.tagName)
  };




  DOMImporter.prototype._annotatedText = function _annotatedText (iterator) {
    var this$1 = this;

    var state = this.state;
    var context = last$2(state.stack);
    if (!context) {
      throw new Error('Illegal state: context is null.')
    }
    while(iterator.hasNext()) {
      var el = iterator.next();
      var text = "";

      if (el.isTextNode()) {
        text = this$1._prepareText(state, el.textContent);
        if (text.length) {


          context.text = context.text.concat(text);
          context.offset += text.length;
        }
      } else if (el.isCommentNode()) {

        continue
      } else if (el.isElementNode()) {
        var inlineTypeConverter = this$1._getConverterForElement(el, 'inline');

        if (!inlineTypeConverter) {
          if (!this$1.IGNORE_DEFAULT_WARNINGS) {
            console.warn('Unsupported inline element. We will not create an annotation for it, but process its children to extract annotated text.', el.outerHTML);
          }

          this$1.annotatedText(el);
          continue
        }



        var startOffset = context.offset;
        var inlineType = inlineTypeConverter.type;
        var inlineNode = this$1._createNode(el, inlineType);
        if (inlineTypeConverter.import) {

          state.stack.push({
            path: context.path,
            offset: startOffset,
            text: ""
          });
          state.pushContext(el.tagName, inlineTypeConverter);
          inlineNode = inlineTypeConverter.import(el, inlineNode, this$1) || inlineNode;
          state.popContext();

          var NodeClass = this$1.schema.getNodeClass(inlineType);

          if (NodeClass.isInline) {
            this$1.customText("\u200B");
          } else {



            this$1.annotatedText(el);
          }

          var result = state.stack.pop();
          context.offset = result.offset;
          context.text = context.text.concat(result.text);
        } else {
          this$1.annotatedText(el);
        }

        var endOffset = context.offset;
        inlineNode.start = {
          path: context.path.slice(0),
          offset: startOffset
        };
        inlineNode.end = {
          offset: endOffset
        };
        state.inlineNodes.push(inlineNode);
      } else {
        console.warn('Unknown element type. Taking plain text.', el.outerHTML);
        text = this$1._prepareText(state, el.textContent);
        context.text = context.text.concat(text);
        context.offset += text.length;
      }
    }

    return context.text
  };

  DOMImporter.prototype._getConverterForElement = function _getConverterForElement (el, mode) {
    var this$1 = this;

    var converters;
    if (mode === "block") {
      if (!el.tagName) { return null }
      converters = this._blockConverters;
    } else if (mode === "inline") {
      converters = this._propertyAnnotationConverters;
    } else {
      converters = this._allConverters;
    }
    var converter = null;
    for (var i = 0; i < converters.length; i++) {
      if (this$1._converterCanBeApplied(converters[i], el)) {
        converter = converters[i];
        break
      }
    }
    return converter
  };

  DOMImporter.prototype._converterCanBeApplied = function _converterCanBeApplied (converter, el) {
    return converter.matchElement(el, converter)
  };

  DOMImporter.prototype._createElement = function _createElement (tagName) {
    return this._el.createElement(tagName)
  };


  DOMImporter.prototype._wrapInlineElementsIntoBlockElement = function _wrapInlineElementsIntoBlockElement (childIterator) {
    var this$1 = this;

    var wrapper = this._createElement('div');
    while(childIterator.hasNext()) {
      var el = childIterator.next();

      var blockTypeConverter = this$1._getConverterForElement(el, 'block');
      if (blockTypeConverter) {
        childIterator.back();
        break
      }
      wrapper.append(el.clone());
    }
    var node = this.defaultConverter(wrapper, this);
    if (node) {
      if (!node.type) {
        throw new Error('Contract: DOMImporter.defaultConverter() must return a node with type.')
      }
      this._createAndShow(node);
    }
    return node
  };


  DOMImporter.prototype._createDefaultBlockElement = function _createDefaultBlockElement (el) {
    var node = this.defaultConverter(el, this);
    if (node) {
      if (!node.type) {
        throw new Error('Contract: Html.defaultConverter() must return a node with type.', el.outerHTML)
      }
      node.id = node.id || this.defaultId(el, node.type);
      this._createAndShow(node);
    }
  };


  DOMImporter.prototype._prepareText = function _prepareText (state, text) {
    if (state.preserveWhitespace) {
      return text
    }
    var repl = SPACE;

    text = text.replace(TABS_OR_NL, '');



    if (state.lastChar === SPACE) {
      text = text.replace(WS_LEFT_ALL, repl);
    } else {
      text = text.replace(WS_LEFT, repl);
    }
    text = text.replace(WS_RIGHT, repl);



    if (this.config.REMOVE_INNER_WS || state.removeInnerWhitespace) {
      text = text.replace(WS_ALL, SPACE);
    }
    state.lastChar = text[text.length-1] || state.lastChar;
    return text
  };


  DOMImporter.prototype._trimTextContent = function _trimTextContent (el) {
    var nodes = el.getChildNodes();
    var firstNode = nodes[0];
    var lastNode = last$2(nodes);
    var text, trimmed;

    if (firstNode && firstNode.isTextNode()) {
      text = firstNode.textContent;
      trimmed = this._trimLeft(text);
      firstNode.textContent = trimmed;
    }
    if (lastNode && lastNode.isTextNode()) {
      text = lastNode.textContent;
      trimmed = this._trimRight(text);
      lastNode.textContent = trimmed;
    }
    return el
  };

  DOMImporter.prototype._trimLeft = function _trimLeft (text) {
    return text.replace(WS_LEFT, "")
  };

  DOMImporter.prototype._trimRight = function _trimRight (text) {
    return text.replace(WS_RIGHT, "")
  };

  var DOMImporterState = function DOMImporterState() {
    this.reset();
  };

  DOMImporterState.prototype.reset = function reset () {
    this.preserveWhitespace = false;
    this.nodes = [];
    this.inlineNodes = [];
    this.containerId = null;
    this.container = [];
    this.ids = {};

    this.contexts = [];

    this.stack = [];
    this.lastChar = "";
    this.skipTypes = {};
    this.ignoreAnnotations = false;
    this.isConverting = false;



    this.uuid = createCountingIdGenerator();
  };

  DOMImporterState.prototype.pushContext = function pushContext (tagName, converter) {
    this.contexts.push({ tagName: tagName, converter: converter});
  };

  DOMImporterState.prototype.popContext = function popContext () {
    return this.contexts.pop()
  };

  DOMImporterState.prototype.getCurrentContext = function getCurrentContext () {
    return last$2(this.contexts)
  };

  DOMImporter.State = DOMImporterState;

  function _createNodes(doc, nodes) {
    nodes.forEach(function (node) {



      var _node = doc.get(node.id);
      if (_node && _node !== node) {

        doc.delete(node.id);
      }
      if (node.document !== doc) {
        doc.create(node);
      }
    });
  }

  var FileProxy = function FileProxy(fileNode, context) {
    this.fileNode = fileNode;
    this.context = context;
    fileNode.setProxy(this);
  };

  var prototypeAccessors$8 = { id: {} };

  prototypeAccessors$8.id.get = function () {
    return this.fileNode.id
  };


  FileProxy.prototype.triggerUpdate = function triggerUpdate () {
    var fileId = this.fileNode.id;
    this.context.editorSession.transaction(function (tx) {
      tx.set([fileId, '__changed__'], '');
    }, { history: false });
  };

  FileProxy.prototype.getUrl = function getUrl () {
    return ''
  };

  FileProxy.prototype.sync = function sync () {
    return Promise.reject(new Error('sync method not implemented'))
  };

  Object.defineProperties( FileProxy.prototype, prototypeAccessors$8 );

  FileProxy.match = function(fileNode, context) {
    return false
  };

  var HTMLExporter = (function (DOMExporter$$1) {
    function HTMLExporter(config, context) {
      DOMExporter$$1.call(this, _defaultConfig(config), context);
    }

    if ( DOMExporter$$1 ) HTMLExporter.__proto__ = DOMExporter$$1;
    HTMLExporter.prototype = Object.create( DOMExporter$$1 && DOMExporter$$1.prototype );
    HTMLExporter.prototype.constructor = HTMLExporter;

    HTMLExporter.prototype.exportDocument = function exportDocument (doc) {
      var htmlEl = DefaultDOMElement.parseHTML('<html><head></head><body></body></html>');
      return this.convertDocument(doc, htmlEl)
    };

    HTMLExporter.prototype.getDefaultBlockConverter = function getDefaultBlockConverter () {
      return defaultBlockConverter
    };

    HTMLExporter.prototype.getDefaultPropertyAnnotationConverter = function getDefaultPropertyAnnotationConverter () {
      return defaultAnnotationConverter
    };

    return HTMLExporter;
  }(DOMExporter));

  function _defaultConfig(config) {
    config = Object.assign({
      idAttribute: 'data-id'
    }, config);
    if (!config.elementFactory) {
      config.elementFactory = DefaultDOMElement.createDocument('html');
    }
    return config
  }


  var defaultAnnotationConverter = {
    tagName: 'span',
    export: function(node, el) {
      el.tagName = 'span';
      el.attr('data-type', node.type);
      var properties = node.toJSON();
      forEach(properties, function(value, name) {
        if (name === 'id' || name === 'type') { return }
        if (isString(value) || isNumber(value) || isBoolean$2(value)) {
          el.attr('data-'+name, value);
        }
      });
    }
  };

  var defaultBlockConverter = {
    export: function(node, el, converter) {
      el.attr('data-type', node.type);
      var properties = node.toJSON();
      forEach(properties, function(value, name) {
        if (name === 'id' || name === 'type') {
          return
        }
        var prop = converter.$$('div').attr('property', name);
        if (node.getPropertyType(name) === 'string' && value) {
          prop.append(converter.annotatedText([node.id, name]));
        } else {
          prop.text(value);
        }
        el.append(prop);
      });
    }
  };

  var HTMLImporter = (function (DOMImporter$$1) {
    function HTMLImporter(config) {
      DOMImporter$$1.call(this, Object.assign({ idAttribute: 'data-id' }, config));


      this._el = DefaultDOMElement.parseHTML('<html></html>');
    }

    if ( DOMImporter$$1 ) HTMLImporter.__proto__ = DOMImporter$$1;
    HTMLImporter.prototype = Object.create( DOMImporter$$1 && DOMImporter$$1.prototype );
    HTMLImporter.prototype.constructor = HTMLImporter;

    HTMLImporter.prototype.importDocument = function importDocument (html) {
      this.reset();
      var parsed = DefaultDOMElement.parseHTML(html);

      this.convertDocument(parsed);
      this.generateDocument();
      return this.state.doc
    };


    HTMLImporter.prototype.convertDocument = function convertDocument (documentEl) {
      throw new Error('This method is abstract')
    };

    return HTMLImporter;
  }(DOMImporter));

  var InlineNode = (function (PropertyAnnotation$$1) {
    function InlineNode () {
      PropertyAnnotation$$1.apply(this, arguments);
    }if ( PropertyAnnotation$$1 ) InlineNode.__proto__ = PropertyAnnotation$$1;
    InlineNode.prototype = Object.create( PropertyAnnotation$$1 && PropertyAnnotation$$1.prototype );
    InlineNode.prototype.constructor = InlineNode;



    return InlineNode;
  }(PropertyAnnotation));

  InlineNode.prototype._isInlineNode = true;

  InlineNode.isInline = true;

  var Marker = (function (PropertyAnnotation$$1) {
    function Marker () {
      PropertyAnnotation$$1.apply(this, arguments);
    }

    if ( PropertyAnnotation$$1 ) Marker.__proto__ = PropertyAnnotation$$1;
    Marker.prototype = Object.create( PropertyAnnotation$$1 && PropertyAnnotation$$1.prototype );
    Marker.prototype.constructor = Marker;

    Marker.prototype.invalidate = function invalidate () {};
    Marker.prototype.remove = function remove () {
      this.getDocument().data.delete(this.id);
    };


    Marker.prototype.containsSelection = function containsSelection (sel) {
      if (sel.isNull()) { return false; }
      if (sel.isPropertySelection()) {
        return (isArrayEqual(this.start.path, sel.start.path) &&
        this.start.offset <= sel.start.offset &&
        this.end.offset >= sel.end.offset)
      } else {
        console.warn('Marker.contains() does not support other selection types.');
      }
    };

    return Marker;
  }(PropertyAnnotation));


  Marker.prototype._isPropertyAnnotation = false;
  Marker.prototype._isMarker = true;

  var TextNode = (function (DocumentNode$$1) {
    function TextNode () {
      DocumentNode$$1.apply(this, arguments);
    }

    if ( DocumentNode$$1 ) TextNode.__proto__ = DocumentNode$$1;
    TextNode.prototype = Object.create( DocumentNode$$1 && DocumentNode$$1.prototype );
    TextNode.prototype.constructor = TextNode;

    TextNode.prototype.getTextPath = function getTextPath () {


      return this.getPath()
    };

    TextNode.prototype.getPath = function getPath () {
      return [this.id, 'content']
    };

    TextNode.prototype.getText = function getText () {
      return this.content
    };

    TextNode.prototype.isEmpty = function isEmpty () {
      return !this.content
    };

    TextNode.prototype.getLength = function getLength () {
      return this.content.length
    };

    return TextNode;
  }(DocumentNode));

  TextNode.isText = true;

  TextNode.schema = {
    type: "text",
    content: "text",
    direction: { type: "string", optional: true }
  };

  var TextBlock = (function (TextNode$$1) {
    function TextBlock () {
      TextNode$$1.apply(this, arguments);
    }if ( TextNode$$1 ) TextBlock.__proto__ = TextNode$$1;
    TextBlock.prototype = Object.create( TextNode$$1 && TextNode$$1.prototype );
    TextBlock.prototype.constructor = TextBlock;



    return TextBlock;
  }(TextNode));

  TextBlock.isBlock = true;

  var Button = (function (Component$$1) {
    function Button () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Button.__proto__ = Component$$1;
    Button.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Button.prototype.constructor = Button;

    Button.prototype.render = function render ($$) {
      var el = $$('button')
          .addClass('sc-button');

      if (this.props.icon) {
        el.append(this.renderIcon($$));
      }
      if (this.props.label) {
        el.append(this.renderLabel($$));
      }
      if (this.props.active) {
        el.addClass('sm-active');
      }
      if (this.props.style) {
        el.addClass('sm-style-'+this.props.style);
      }
      if (this.props.disabled) {

        el.attr('tabindex', -1)
            .attr('disabled', true);
      } else {

        el.attr('tabindex', 1);
      }


      el.append(this.props.children);
      return el
    };

    Button.prototype.renderIcon = function renderIcon ($$) {
      var iconEl = this.context.iconProvider.renderIcon($$, this.props.icon);
      return iconEl
    };

    Button.prototype.renderLabel = function renderLabel ($$) {
      return $$('div').addClass('se-label').append(
          this.getLabel(this.props.label)
      )
    };

    Button.prototype.renderHint = function renderHint ($$) {
      return $$('div').addClass('se-hint').append(
          this.getLabel(this.props.hint+'-hint')
      )
    };

    Button.prototype.getLabel = function getLabel (name) {
      var labelProvider = this.context.labelProvider;
      return labelProvider.getLabel(name)
    };

    return Button;
  }(Component));

  var ButtonPackage = {
    name: 'button',
    configure: function(config) {
      config.addComponent('button', Button);
    }
  };

  var Toolbox = (function (Component$$1) {
    function Toolbox () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Toolbox.__proto__ = Component$$1;
    Toolbox.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Toolbox.prototype.constructor = Toolbox;

    Toolbox.prototype.getInitialState = function getInitialState () {
      return {
        activeToolGroups: this.getActiveToolGroups()
      }
    };

    Toolbox.prototype.shouldRerender = function shouldRerender (newProps, newState) {

      var hasChanged = !isEqual(this.props, newProps) || !isEqual(this.state.activeToolGroups, newState.activeToolGroups);

      if (!hasChanged) {
        this.hide();
        return false
      }
      return true
    };

    Toolbox.prototype.didMount = function didMount () {

      this.context.editorSession.onRender(this._onCommandStatesChanged, this);
    };

    Toolbox.prototype.dispose = function dispose () {
      this.context.editorSession.off(this);
    };

    Toolbox.prototype._onCommandStatesChanged = function _onCommandStatesChanged (editorSession) {
      if (editorSession.hasChanged('commandStates')) {
        this.setState({
          activeToolGroups: this.getActiveToolGroups()
        });
      }
    };


    Toolbox.prototype.getActiveToolGroups = function getActiveToolGroups () {
      var this$1 = this;

      this._hasActiveTools = false;

      var toolGroups = this.context.toolGroups;
      var activeToolGroupNames = this.getActiveToolGroupNames();
      var activeToolGroups = new Map();

      activeToolGroupNames.forEach(function (toolGroupName) {
        var toolGroup = toolGroups.get(toolGroupName);
        if (!toolGroup) { return }
        var tools = toolGroup.tools;
        var activeTools = this$1.getActiveTools(tools, toolGroupName);
        activeToolGroups.set(toolGroupName, {
          name: toolGroupName,
          Class: toolGroup.Class,
          tools: activeTools
        });
      });
      return activeToolGroups
    };


    Toolbox.prototype.getActiveTools = function getActiveTools (tools, toolGroupName) {
      var this$1 = this;

      var activeTools = new Map();
      var commandStates = this._getCommandStates();

      tools.forEach(function (tool, toolName) {
        if (!commandStates[toolName]) {
          throw new Error(("Could not find commandState for " + toolName))
        }

        var toolProps = Object.assign({}, commandStates[toolName], {
          name: toolName,
          label: toolName,

          style: this$1.getToolStyle(toolName)
        });

        if (!toolProps.disabled || this$1.showDisabled()) {
          activeTools.set(tool.name, {
            name: tool.name,
            Class: tool.Class,
            toolProps: toolProps
          });
          this$1._hasActiveTools = true;
        }
      });

      return activeTools
    };

    Toolbox.prototype.hasActiveTools = function hasActiveTools () {
      return Boolean(this._hasActiveTools)
    };

    Toolbox.prototype.getActiveToolGroupNames = function getActiveToolGroupNames () {
      throw new Error('Abstract method')
    };

    Toolbox.prototype.showDisabled = function showDisabled () {
      return false
    };

    Toolbox.prototype.hide = function hide () {

    };


    Toolbox.prototype.getToolStyle = function getToolStyle () {
      throw new Error('Abstract method')
    };

    Toolbox.prototype._getCommandStates = function _getCommandStates () {
      return this.context.commandManager.getCommandStates()
    };

    return Toolbox;
  }(Component));

  var ContextMenu = (function (Toolbox$$1) {
    function ContextMenu () {
      Toolbox$$1.apply(this, arguments);
    }

    if ( Toolbox$$1 ) ContextMenu.__proto__ = Toolbox$$1;
    ContextMenu.prototype = Object.create( Toolbox$$1 && Toolbox$$1.prototype );
    ContextMenu.prototype.constructor = ContextMenu;

    ContextMenu.prototype.didMount = function didMount () {
      Toolbox$$1.prototype.didMount.call(this);
      if (!this.context.scrollPane) {
        throw new Error('Requires a scrollPane context')
      }
      this.context.scrollPane.on('context-menu:opened', this._onContextMenuOpened, this);
    };

    ContextMenu.prototype.dispose = function dispose () {
      Toolbox$$1.prototype.dispose.call(this);
      this.context.scrollPane.off(this);
    };


    ContextMenu.prototype.render = function render ($$) {
      var this$1 = this;

      var el = $$('div').addClass('sc-context-menu sm-hidden');
      var activeToolGroups = this.state.activeToolGroups;

      activeToolGroups.forEach(function (toolGroup) {
        var toolGroupProps = Object.assign({}, toolGroup, {
          toolStyle: this$1.getToolStyle(),
          showLabels: true,

        });

        if (toolGroupProps.tools.size > 0) {
          var toolGroupEl = $$(toolGroup.Class, toolGroupProps);
          el.append(toolGroupEl);
        }
      });
      return el
    };

    ContextMenu.prototype.getActiveToolGroupNames = function getActiveToolGroupNames () {
      return ['context-menu-primary', 'context-menu-document']
    };

    ContextMenu.prototype.showDisabled = function showDisabled () {
      return true
    };


    ContextMenu.prototype.getToolStyle = function getToolStyle () {
      return 'plain-dark'
    };

    ContextMenu.prototype.hide = function hide () {
      this.el.addClass('sm-hidden');
    };


    ContextMenu.prototype._onContextMenuOpened = function _onContextMenuOpened (hints) {
      var mouseBounds = hints.mouseBounds;
      this.el.removeClass('sm-hidden');
      var contextMenuWidth = this.el.htmlProp('offsetWidth');


      this.el.css('top', mouseBounds.top);
      var leftPos = mouseBounds.left;

      leftPos = Math.max(leftPos, 0);

      var maxLeftPos = mouseBounds.left + mouseBounds.right - contextMenuWidth;
      leftPos = Math.min(leftPos, maxLeftPos);
      this.el.css('left', leftPos);
    };

    return ContextMenu;
  }(Toolbox));

  var ContextMenuPackage = {
    name: 'context-menu',
    configure: function(config) {
      config.addComponent('context-menu', ContextMenu);
    }
  };

  var Grid = (function (Component$$1) {
    function Grid () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Grid.__proto__ = Component$$1;
    Grid.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Grid.prototype.constructor = Grid;

    Grid.prototype.render = function render ($$) {
      var el = $$('div').addClass('sc-grid');
      if (this.props.mobile) {
        el.addClass('sm-mobile');
      }
      el.append(this.props.children);
      return el
    };

    return Grid;
  }(Component));


  var Row = (function (Component$$1) {
    function Row () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Row.__proto__ = Component$$1;
    Row.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Row.prototype.constructor = Row;

    Row.prototype.render = function render ($$) {
      var el = $$('div').addClass('se-row');
      el.append(this.props.children);
      return el
    };

    return Row;
  }(Component));


  var Cell = (function (Component$$1) {
    function Cell () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Cell.__proto__ = Component$$1;
    Cell.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Cell.prototype.constructor = Cell;

    Cell.prototype.render = function render ($$) {
      var el = $$('div').addClass('se-cell');
      el.addClass('sm-column-'+this.props.columns);
      el.append(this.props.children);
      return el
    };

    return Cell;
  }(Component));

  Grid.Row = Row;
  Grid.Cell = Cell;

  var GridPackage = {
    name: 'grid',
    configure: function(config) {
      config.addComponent('grid', Grid);
    }
  };

  var Gutter = (function (Toolbox$$1) {
    function Gutter () {
      Toolbox$$1.apply(this, arguments);
    }

    if ( Toolbox$$1 ) Gutter.__proto__ = Toolbox$$1;
    Gutter.prototype = Object.create( Toolbox$$1 && Toolbox$$1.prototype );
    Gutter.prototype.constructor = Gutter;

    Gutter.prototype.render = function render ($$) {
      var this$1 = this;

      var el = $$('div').addClass(this.getClassNames());
      el.addClass('sm-hidden');
      el.addClass('sm-theme-'+this.getTheme());
      var activeToolGroups = this.state.activeToolGroups;
      var activeToolsEl = $$('div').addClass('se-active-tools');

      activeToolGroups.forEach(function (toolGroup) {
        var toolGroupProps = Object.assign({}, toolGroup, {
          toolStyle: this$1.getToolStyle(),
          showIcons: true
        });
        activeToolsEl.append(
            $$(toolGroup.Class, toolGroupProps)
        );
      });

      el.append(activeToolsEl);
      return el
    };


    Gutter.prototype.getToolStyle = function getToolStyle () {
      return 'outline-dark'
    };

    Gutter.prototype.show = function show (hints) {
      this.el.removeClass('sm-hidden');
      this._position(hints);
    };

    Gutter.prototype.hide = function hide () {
      this.el.addClass('sm-hidden');
    };

    Gutter.prototype._position = function _position (hints) {
      if (hints) {

        this.el.css('top', hints.rectangle.top + hints.rectangle.height - hints.rectangle.height / 2);
        this.el.css('left', 0);
      }
    };

    Gutter.prototype.getClassNames = function getClassNames () {
      return 'sc-gutter'
    };

    Gutter.prototype.getTheme = function getTheme () {
      return 'dark'
    };

    Gutter.prototype.getActiveToolGroupNames = function getActiveToolGroupNames () {
      return ['gutter']
    };

    return Gutter;
  }(Toolbox));

  var GutterPackage = {
    name: 'gutter',
    configure: function(config) {
      config.addToolGroup('gutter');
      config.addComponent('gutter', Gutter);
    }
  };

  var Input = (function (Component$$1) {
    function Input () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Input.__proto__ = Component$$1;
    Input.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Input.prototype.constructor = Input;

    Input.prototype._onChange = function _onChange () {
      var editorSession = this.context.editorSession;
      var path = this.props.path;
      var newVal = this.el.val();

      editorSession.transaction(function(tx) {
        tx.set(path, newVal);
      });
    };

    Input.prototype.render = function render ($$) {
      var val;

      if (this.props.path) {
        var editorSession = this.context.editorSession;
        var doc = editorSession.getDocument();
        val = doc.get(this.props.path);
      } else {
        val = this.props.value;
      }

      var el = $$('input').attr({
            value: val,
            type: this.props.type,
            placeholder: this.props.placeholder
          })
          .addClass('sc-input');

      if (this.props.path) {
        el.on('change', this._onChange);
      }

      if (this.props.centered) {
        el.addClass('sm-centered');
      }

      return el
    };

    return Input;
  }(Component));

  var InputPackage = {
    name: 'input',
    configure: function(config) {
      config.addComponent('input', Input);
    }
  };

  var Layout = (function (Component$$1) {
    function Layout () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Layout.__proto__ = Component$$1;
    Layout.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Layout.prototype.constructor = Layout;

    Layout.prototype.render = function render ($$) {
      var el = $$('div').addClass('sc-layout');
      el.addClass('sm-width-'+this.props.width);
      if (this.props.textAlign) {
        el.addClass('sm-text-align-'+this.props.textAlign);
      }

      if (this.props.noPadding) {
        el.addClass('sm-no-padding');
      }

      el.append(this.props.children);
      return el
    };

    return Layout;
  }(Component));

  var LayoutPackage = {
    name: 'layout',
    configure: function(config) {
      config.addComponent('layout', Layout);
    }
  };

  var Modal = (function (Component$$1) {
    function Modal () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Modal.__proto__ = Component$$1;
    Modal.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Modal.prototype.constructor = Modal;

    Modal.prototype.render = function render ($$) {
      var el = $$('div').addClass('sc-modal');



      el.on('click', this._closeModal);

      if (this.props.width) {
        el.addClass('sm-width-'+this.props.width);
      }

      el.append(
          $$('div').addClass('se-body').append(
              this.props.children
          )
      );
      return el
    };

    Modal.prototype._closeModal = function _closeModal (e) {
      var closeSurfaceClick = e.target.classList.contains('sc-modal');
      if (closeSurfaceClick) {
        this.send('closeModal');
      }
    };

    return Modal;
  }(Component));

  var ModalPackage = {
    name: 'modal',
    configure: function(config) {
      config.addComponent('modal', Modal);
    }
  };

  var Overlay = (function (Toolbox$$1) {
    function Overlay () {
      Toolbox$$1.apply(this, arguments);
    }

    if ( Toolbox$$1 ) Overlay.__proto__ = Toolbox$$1;
    Overlay.prototype = Object.create( Toolbox$$1 && Toolbox$$1.prototype );
    Overlay.prototype.constructor = Overlay;

    Overlay.prototype.didMount = function didMount () {
      Toolbox$$1.prototype.didMount.call(this);
      if (!this.context.scrollPane) {
        throw new Error('Requires scrollPane context')
      }
      this.context.scrollPane.on('selection:positioned', this._onSelectionPositioned, this);
    };

    Overlay.prototype.dispose = function dispose () {
      Toolbox$$1.prototype.dispose.call(this);
      this.context.scrollPane.off(this);
    };

    Overlay.prototype.render = function render ($$) {
      var this$1 = this;

      var el = $$('div').addClass(this.getClassNames());
      el.addClass('sm-hidden');
      el.addClass('sm-theme-'+this.getTheme());
      var activeToolGroups = this.state.activeToolGroups;
      var activeToolsEl = $$('div').addClass('se-active-tools');

      activeToolGroups.forEach(function (toolGroup) {
        var toolGroupProps = Object.assign({}, toolGroup, {
          toolStyle: this$1.getToolStyle(),
          showIcons: true
        });
        activeToolsEl.append(
            $$(toolGroup.Class, toolGroupProps)
        );
      });
      el.append(activeToolsEl);
      return el
    };


    Overlay.prototype.getToolStyle = function getToolStyle () {
      return 'plain-dark'
    };

    Overlay.prototype.show = function show (hints) {
      this.el.removeClass('sm-hidden');
      this._position(hints);
    };

    Overlay.prototype.hide = function hide () {
      this.el.addClass('sm-hidden');
    };


    Overlay.prototype._onSelectionPositioned = function _onSelectionPositioned (hints) {
      var isActiveEditor = true;
      if (hints.editorId !== this.context.editorSession.id) {
        isActiveEditor = false;
      }
      if (this.hasActiveTools() && isActiveEditor) {
        this.el.removeClass('sm-hidden');
        var overlayWidth = this.el.htmlProp('offsetWidth');
        var selRect = hints.selectionRect;
        var selectionMaxWidth = selRect.width;

        this.el.css('top', selRect.top + selRect.height);
        var leftPos = selRect.left + selectionMaxWidth/2 - overlayWidth/2;

        leftPos = Math.max(leftPos, 0);

        var maxLeftPos = selRect.left + selectionMaxWidth + selRect.right - overlayWidth;
        leftPos = Math.min(leftPos, maxLeftPos);
        this.el.css('left', leftPos);
      } else {
        this.el.addClass('sm-hidden');
      }
    };

    Overlay.prototype.getClassNames = function getClassNames () {
      return 'sc-overlay'
    };

    Overlay.prototype.getTheme = function getTheme () {
      return 'dark'
    };

    Overlay.prototype.getActiveToolGroupNames = function getActiveToolGroupNames () {
      return this.props.toolGroups || ['overlay']
    };

    return Overlay;
  }(Toolbox));

  var OverlayPackage = {
    name: 'overlay',
    configure: function(config) {
      config.addToolGroup('overlay');
      config.addComponent('overlay', Overlay);
    }
  };

  function getRelativeBoundingRect(els, containerEl) {
    if (els.length === undefined) {
      els = [els];
    }
    var elRects = map(els, function(el) {
      return _getBoundingOffsetsRect(el, containerEl)
    });

    var elsRect = _getBoundingRect(elRects);
    var containerElRect = containerEl.getBoundingClientRect();
    return {
      left: elsRect.left,
      top: elsRect.top,
      right: containerElRect.width - elsRect.left - elsRect.width,
      bottom: containerElRect.height - elsRect.top - elsRect.height,
      width: elsRect.width,
      height: elsRect.height
    }
  }


  function _getBoundingRect(rects) {
    var bounds = {
      left: Number.POSITIVE_INFINITY,
      top: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY,
      width: Number.NaN,
      height: Number.NaN
    };

    forEach(rects, function(rect) {
      if (rect.left < bounds.left) {
        bounds.left = rect.left;
      }
      if (rect.top < bounds.top) {
        bounds.top = rect.top;
      }
      if (rect.left + rect.width > bounds.right) {
        bounds.right = rect.left + rect.width;
      }
      if (rect.top + rect.height > bounds.bottom) {
        bounds.bottom = rect.top + rect.height;
      }
    });
    bounds.width = bounds.right - bounds.left;
    bounds.height = bounds.bottom - bounds.top;
    return bounds
  }


  function _getBoundingOffsetsRect(el, relativeParentEl) {
    var relativeParentElRect = relativeParentEl.getBoundingClientRect();
    var elRect = _getBoundingRect(el.getClientRects());

    var left = elRect.left - relativeParentElRect.left;
    var top = elRect.top - relativeParentElRect.top;
    return {
      left: left,
      top: top,
      right: relativeParentElRect.width - left - elRect.width,
      bottom: relativeParentElRect.height - top - elRect.height,
      width: elRect.width,
      height: elRect.height
    }
  }

  var Dropzones = (function (Component$$1) {
    function Dropzones () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Dropzones.__proto__ = Component$$1;
    Dropzones.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Dropzones.prototype.constructor = Dropzones;

    Dropzones.prototype.didMount = function didMount () {
      this.context.dragManager.on('drag:started', this.onDragStarted, this);
      this.context.dragManager.on('drag:finished', this.onDragFinished, this);
    };

    Dropzones.prototype.render = function render ($$) {
      var this$1 = this;

      var el = $$('div').addClass('sc-dropzones');

      if (this.state.dropzones) {
        el.on('dragenter', this.onDrag)
            .on('dragover', this.onDrag);


        forEach(this.state.dropzones, function (dropzones, surfaceId) {
          dropzones.forEach(function (dropzone, index) {
            var dropType = dropzone.type;
            var dropzoneEl;
            if (dropType === 'place') {
              dropzoneEl = $$('div').addClass('se-dropzone')
                  .attr({
                    'data-dropzone-index': index,
                    'data-dropzone-surface': surfaceId
                  }).append(
                      $$('div').addClass('se-drop-teaser').css({
                        top: dropzone.teaserPos
                      })
                  );
            } else if (dropType === 'custom') {
              dropzoneEl = $$('div').addClass('se-custom-dropzone').attr({
                'data-dropzone-index': index,
                'data-dropzone-surface': surfaceId
              }).append(


                  $$('div').addClass('se-message').append(dropzone.message)
              );
            }
            if (dropzoneEl) {
              var shield = $$('div').addClass('se-drop-shield')
                  .on('dragenter', this$1.onDragEnter)
                  .on('dragleave', this$1.onDragLeave)
                  .on('drop', this$1.onDrop)
                  .on('mouseenter', this$1.onDragEnter)
                  .on('mouseleave', this$1.onDragLeave)
                  .on('mouseup', this$1.onDrop);
              dropzoneEl.append(shield);
              dropzoneEl.css({
                position: 'absolute',
                top: dropzone.top,
                left: dropzone.left,
                width: dropzone.width,
                height: dropzone.height
              });
              el.append(dropzoneEl);
            }
          });
        });
      } else {
        el.addClass('sm-hidden');
      }
      return el
    };


    Dropzones.prototype.onDragStarted = function onDragStarted (dragState) {
      var this$1 = this;

      var dropzones = this._computeDropzones(dragState);
      setTimeout(function () {
        this$1.setState({
          dropzones: dropzones
        });
      }, 250);
    };


    Dropzones.prototype.onDragFinished = function onDragFinished () {
      this.setState({});
    };

    Dropzones.prototype.onDragEnter = function onDragEnter (e) {

      e.target.parentNode.classList.add('sm-over');
    };

    Dropzones.prototype.onDragLeave = function onDragLeave (e) {

      e.target.parentNode.classList.remove('sm-over');
    };


    Dropzones.prototype.onDrag = function onDrag (e) {

      e.preventDefault();
    };

    Dropzones.prototype.onDrop = function onDrop (e) {


      e.__reserved__ = true;
      e.preventDefault();
      e.stopPropagation();
      var dropzoneIndex = e.target.parentNode.dataset.dropzoneIndex;
      var dropzoneSurface = e.target.parentNode.dataset.dropzoneSurface;
      var dropzone = this.state.dropzones[dropzoneSurface][dropzoneIndex];
      var dropParams = dropzone.dropParams;
      var dropType = dropzone.type;

      var targetSurface = this.context.surfaceManager.getSurface(dropzoneSurface);

      var component = dropzone.component;
      var dropzoneComponent = dropzone.dropzoneComponent;

      var dragManager = this.context.dragManager;
      dragManager.extendDragState({
        targetSurface: targetSurface,
        dropType: dropType,
        dropParams: dropParams,
        component: component,
        dropzoneComponent: dropzoneComponent
      });
      dragManager._onDragEnd(e);
    };


    Dropzones.prototype._getBoundingRect = function _getBoundingRect (comp) {
      var scrollPane = comp.context.scrollPane;
      var contentElement = scrollPane.getContentElement().getNativeElement();
      var rect = getRelativeBoundingRect(comp.getNativeElement(), contentElement);
      return rect
    };

    Dropzones.prototype._computeDropzones = function _computeDropzones (dragState) {
      var this$1 = this;

      var scrollPaneName = this.context.scrollPane.getName();
      var surfaces = dragState.scrollPanes[scrollPaneName].surfaces;
      var scopedDropzones = {};

      forEach(surfaces, function (surface) {
        var components = surface.childNodes;


        var numDropzones = components.length + 1;
        var dropzones = [];

        for (var i = 0; i < numDropzones; i++) {
          if (i === 0) {

            var firstComp = this$1._getBoundingRect(components[0]);
            dropzones.push({
              type: 'place',
              left: firstComp.left,
              top: firstComp.top,
              width: firstComp.width,
              height: firstComp.height / 2,
              teaserPos: 0,
              dropParams: {
                insertPos: i
              }
            });
          } else if (i === numDropzones - 1) {

            var lastComp = this$1._getBoundingRect(components[i - 1]);
            dropzones.push({
              type: 'place',
              left: lastComp.left,
              top: lastComp.top + lastComp.height / 2,
              width: lastComp.width,
              height: lastComp.height / 2,
              teaserPos: lastComp.height / 2,
              dropParams: {
                insertPos: i
              }
            });
          } else {

            var upperComp = this$1._getBoundingRect(components[i-1]);
            var lowerComp = this$1._getBoundingRect(components[i]);
            var topBound = upperComp.top + upperComp.height / 2;
            var bottomBound = lowerComp.top + lowerComp.height / 2;

            dropzones.push({
              type: 'place',
              left: upperComp.left,
              top: topBound,
              width: upperComp.width,
              height: bottomBound - topBound,
              teaserPos: (upperComp.top + upperComp.height + lowerComp.top) / 2 - topBound,
              dropParams: {
                insertPos: i
              }
            });
          }

          if (i < numDropzones - 1) {
            var comp = components[i];

            if (comp._isIsolatedNodeComponent) {
              comp = comp.getContent();
            }

            if (comp.getDropzoneSpecs) {
              var dropzoneSpecs = comp.getDropzoneSpecs();
              dropzoneSpecs.forEach(function (dropzoneSpec) {
                var dropzoneComp = dropzoneSpec.component;
                var rect = this$1._getBoundingRect(dropzoneComp);
                dropzones.push({
                  type: 'custom',
                  component: comp,
                  dropzoneComponent: dropzoneComp,
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  message: dropzoneSpec.message,
                  dropParams: dropzoneSpec.dropParams
                });
              });
            }
          }
        }
        scopedDropzones[surface.getName()] = dropzones;
      });
      return scopedDropzones
    };

    Dropzones.prototype._renderDropTeaser = function _renderDropTeaser (hints) {
      if (hints.visible) {
        this.el.removeClass('sm-hidden');
        this.el.css('top', hints.rect.top);
        this.el.css('left', hints.rect.left);
        this.el.css('right', hints.rect.right);
      } else {
        this.el.addClass('sm-hidden');
      }
    };

    return Dropzones;
  }(Component));

  var DropzonesPackage = {
    name: 'dropzones',
    configure: function(config) {
      config.addComponent('dropzones', Dropzones);
    }
  };

  var Scrollbar = (function (Component$$1) {
    function Scrollbar () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Scrollbar.__proto__ = Component$$1;
    Scrollbar.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Scrollbar.prototype.constructor = Scrollbar;

    Scrollbar.prototype.didMount = function didMount () {

      DefaultDOMElement.getBrowserWindow().on('resize', this.onResize, this);

      this.props.scrollPane.on('scroll', this.onScroll, this);

      setTimeout(function() {
        this.updatePositions();
      }.bind(this));
    };

    Scrollbar.prototype.dispose = function dispose () {
      DefaultDOMElement.getBrowserWindow().off(this);
      this.props.scrollPane.off(this);
    };

    Scrollbar.prototype.didUpdate = function didUpdate () {
      this.updatePositions();
    };

    Scrollbar.prototype.render = function render ($$) {
      var el = $$('div')
          .addClass('sc-scrollbar')
          .on('mousedown', this.onMouseDown);

      if (this.props.highlights) {
        var highlightEls = [];

        forEach(this.props.highlights, function(highlights, scope) {
          forEach(highlights, function(h) {
            highlightEls.push(
                $$('div').ref(h).addClass('se-highlight sm-'+scope)
            );
          });
        });

        el.append(
            $$('div').ref('highlights')
                .addClass('se-highlights')
                .append(highlightEls)
        );
      }
      el.append($$('div').ref('thumb').addClass('se-thumb'));
      return el
    };

    Scrollbar.prototype.updatePositions = function updatePositions () {
      var scrollPane = this.props.scrollPane;
      var scrollableEl = scrollPane.getScrollableElement();
      var contentHeight = scrollPane.getContentHeight();
      var scrollPaneHeight = scrollPane.getHeight();
      var scrollTop = scrollPane.getScrollPosition();
      var contentEl = scrollPane.getContentElement();


      this.factor = (contentHeight / scrollPaneHeight);

      if (this.factor <= 1) {
        this.el.addClass('sm-hide-thumb');
      } else {
        this.el.removeClass('sm-hide-thumb');
      }

      this.refs.thumb.css({
        top: scrollTop / this.factor,
        height: scrollPaneHeight / this.factor
      });


      if (this.props.highlights) {

        forEach(this.props.highlights,function(highlights) {
          forEach(highlights, function(nodeId) {
            var nodeEl = scrollableEl.find('*[data-id="'+nodeId+'"]');

            if (!nodeEl) { return }


            var rect = getRelativeBoundingRect(nodeEl.getNativeElement(), contentEl.getNativeElement());
            var top = rect.top / this.factor;
            var height = rect.height / this.factor;


            if (height < Scrollbar.overlayMinHeight) {
              height = Scrollbar.overlayMinHeight;
            }

            var highlightEl = this.refs[nodeId];
            if (highlightEl) {
              this.refs[nodeId].css({
                top: top,
                height: height
              });
            } else {
              console.warn('no ref found for highlight', nodeId);
            }
          }.bind(this));
        }.bind(this));
      }
    };

    Scrollbar.prototype.getScrollableElement = function getScrollableElement () {
      return this.props.scrollPane.getScrollableElement()
    };

    Scrollbar.prototype.onResize = function onResize () {
      this.rerender();
    };

    Scrollbar.prototype.onScroll = function onScroll () {
      this.updatePositions();
    };

    Scrollbar.prototype.onMouseDown = function onMouseDown (e) {
      e.stopPropagation();
      e.preventDefault();
      this._mouseDown = true;



      var _window = DefaultDOMElement.getBrowserWindow();
      _window.on('mousemove', this.onMouseMove, this);
      _window.on('mouseup', this.onMouseUp, this);

      var scrollBarOffset = this.el.getOffset().top;
      var y = e.pageY - scrollBarOffset;
      var thumbEl = this.refs.thumb.el;
      if (e.target !== thumbEl.getNativeElement()) {

        this.offset = thumbEl.height / 2;
        this.onMouseMove(e);
      } else {
        this.offset = y - thumbEl.getPosition().top;
      }
    };


    Scrollbar.prototype.onMouseUp = function onMouseUp () {
      this._mouseDown = false;
      var _window = DefaultDOMElement.getBrowserWindow();
      _window.off('mousemove', this.onMouseMove, this);
      _window.off('mouseup', this.onMouseUp, this);
    };

    Scrollbar.prototype.onMouseMove = function onMouseMove (e) {
      if (this._mouseDown) {
        var scrollPane = this.props.scrollPane;
        var scrollableEl = scrollPane.getScrollableElement();
        var scrollBarOffset = this.el.getOffset().top;
        var y = e.pageY - scrollBarOffset;


        var scroll = (y-this.offset)*this.factor;
        scrollableEl.setProperty('scrollTop', scroll);
      }
    };

    return Scrollbar;
  }(Component));

  Scrollbar.overlayMinHeight = 2;

  var ScrollbarPackage = {
    name: 'scrollbar',
    configure: function(config) {
      config.addComponent('scrollbar', Scrollbar);
    }
  };

  function getRelativeMouseBounds(mouseEvent, containerEl) {
    var containerElRect = containerEl.getBoundingClientRect();
    var left = mouseEvent.clientX - containerElRect.left;
    var top = mouseEvent.clientY - containerElRect.top;
    var res = {
      left: left,
      right: containerElRect.width - left,
      top: top,
      bottom: containerElRect.height - top
    };
    return res;
  }

  var AbstractScrollPane = (function (Component$$1) {
    function AbstractScrollPane () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) AbstractScrollPane.__proto__ = Component$$1;
    AbstractScrollPane.prototype = Object.create( Component$$1 && Component$$1.prototype );
    AbstractScrollPane.prototype.constructor = AbstractScrollPane;

    AbstractScrollPane.prototype.getChildContext = function getChildContext () {
      return {
        scrollPane: this
      }
    };

    AbstractScrollPane.prototype.didMount = function didMount () {
      if (inBrowser) {
        this.windowEl = DefaultDOMElement.wrapNativeElement(window);
        this.windowEl.on('resize', this.onSelectionPositioned, this);
      }
    };

    AbstractScrollPane.prototype.dispose = function dispose () {
      if (this.windowEl) {
        this.windowEl.off(this);
      }
    };

    AbstractScrollPane.prototype.getName = function getName () {
      return this.props.name
    };


    AbstractScrollPane.prototype.updateSelection = function updateSelection (ref) {
      var editorId = ref.editorId;

      this._editorId = editorId;
      this.onSelectionPositioned();
    };


    AbstractScrollPane.prototype.onSelectionPositioned = function onSelectionPositioned () {
      var contentRect = this._getContentRect();
      var selectionRect = this._getSelectionRect();
      if (!selectionRect) { return }
      var hints = {
        contentRect: contentRect,
        selectionRect: selectionRect,
        editorId: this._editorId
      };
      this._emitSelectionPositioned(hints);
      this._scrollSelectionIntoView(selectionRect);
    };

    AbstractScrollPane.prototype._emitSelectionPositioned = function _emitSelectionPositioned (hints) {


      this.emit('selection:positioned', hints);

      this.emit('dom-selection:rendered', hints);
    };


    AbstractScrollPane.prototype._onContextMenu = function _onContextMenu (e) {
      e.preventDefault();
      var mouseBounds = this._getMouseBounds(e);
      this.emit('context-menu:opened', {
        mouseBounds: mouseBounds
      });
    };

    AbstractScrollPane.prototype._scrollSelectionIntoView = function _scrollSelectionIntoView (selectionRect) {
      var upperBound = this.getScrollPosition();
      var lowerBound = upperBound + this.getHeight();
      var selTop = selectionRect.top;
      var selBottom = selectionRect.top + selectionRect.height;
      if ((selTop < upperBound && selBottom < upperBound) ||
          (selTop > lowerBound && selBottom > lowerBound)) {
        this.setScrollPosition(selTop);
      }
    };


    AbstractScrollPane.prototype.getHeight = function getHeight () {
      throw new Error('Abstract method')
    };


    AbstractScrollPane.prototype.getContentHeight = function getContentHeight () {
      throw new Error('Abstract method')
    };

    AbstractScrollPane.prototype.getContentElement = function getContentElement () {

      throw new Error('Abstract method')
    };




    AbstractScrollPane.prototype.getScrollableElement = function getScrollableElement () {
      throw new Error('Abstract method')
    };


    AbstractScrollPane.prototype.getScrollPosition = function getScrollPosition () {
      throw new Error('Abstract method')
    };

    AbstractScrollPane.prototype.setScrollPosition = function setScrollPosition () {
      throw new Error('Abstract method')
    };


    AbstractScrollPane.prototype.getPanelOffsetForElement = function getPanelOffsetForElement (el) {
      throw new Error('Abstract method')
    };


    AbstractScrollPane.prototype.scrollTo = function scrollTo (componentId, onlyIfNotVisible) {
      throw new Error('Abstract method')
    };

    AbstractScrollPane.prototype._getContentRect = function _getContentRect () {
      return this.getContentElement().getNativeElement().getBoundingClientRect()
    };


    AbstractScrollPane.prototype._getSelectionRect = function _getSelectionRect () {
      return getSelectionRect(this._getContentRect())
    };

    AbstractScrollPane.prototype._getMouseBounds = function _getMouseBounds (e) {
      return getRelativeMouseBounds(e, this.getContentElement().getNativeElement())
    };

    return AbstractScrollPane;
  }(Component));

  var ScrollPane = (function (AbstractScrollPane$$1) {
    function ScrollPane () {
      AbstractScrollPane$$1.apply(this, arguments);
    }

    if ( AbstractScrollPane$$1 ) ScrollPane.__proto__ = AbstractScrollPane$$1;
    ScrollPane.prototype = Object.create( AbstractScrollPane$$1 && AbstractScrollPane$$1.prototype );
    ScrollPane.prototype.constructor = ScrollPane;

    ScrollPane.prototype.didMount = function didMount () {
      AbstractScrollPane$$1.prototype.didMount.call(this);
      if (this.refs.scrollbar && this.props.highlights) {
        this.props.highlights.on('highlights:updated', this.onHighlightsUpdated, this);
      }
      if (this.refs.scrollbar) {
        this.domObserver = new window.MutationObserver(this._onContentChanged.bind(this));
        this.domObserver.observe(this.el.getNativeElement(), {
          subtree: true,
          attributes: true,
          characterData: true,
          childList: true,
        });
        this.context.editorSession.onPosition(this._onPosition, this);
      }
    };

    ScrollPane.prototype.dispose = function dispose () {
      AbstractScrollPane$$1.prototype.dispose.call(this);
      if (this.props.highlights) {
        this.props.highlights.off(this);
      }
      this.context.editorSession.off(this);
      this.context.dragManager.off(this);
    };

    ScrollPane.prototype.render = function render ($$) {
      var el = $$('div')
          .addClass('sc-scroll-pane');

      if (platform.isFF) {
        el.addClass('sm-firefox');
      }



      if (!this.props.noStyle) {
        el.addClass('sm-default-style');
      }


      if (this.props.scrollbarType === 'substance') {
        el.addClass('sm-substance-scrollbar');
        el.addClass('sm-scrollbar-position-' + this.props.scrollbarPosition);

        el.append(


            $$(Scrollbar, {
              scrollPane: this
            }).ref('scrollbar')
                .attr('id', 'content-scrollbar')
        );


        el.append(
            $$('div').ref("scanline").addClass('se-scanline')
        );
      }

      el.append(
          $$('div').ref('scrollable').addClass('se-scrollable').append(
              this.renderContent($$)
          ).on('scroll', this.onScroll)
      );
      return el
    };

    ScrollPane.prototype.renderContent = function renderContent ($$) {
      var contentEl = $$('div').ref('content').addClass('se-content');
      contentEl.append(this.props.children);
      if (this.props.contextMenu === 'custom') {
        contentEl.on('contextmenu', this._onContextMenu);
      }
      return contentEl
    };

    ScrollPane.prototype._onContentChanged = function _onContentChanged () {
      this._contentChanged = true;
    };

    ScrollPane.prototype._onPosition = function _onPosition () {
      if (this.refs.scrollbar && this._contentChanged) {
        this._contentChanged = false;
        this._updateScrollbar();
      }
    };

    ScrollPane.prototype._updateScrollbar = function _updateScrollbar () {
      if (this.refs.scrollbar) {
        this.refs.scrollbar.updatePositions();
      }
    };

    ScrollPane.prototype.onHighlightsUpdated = function onHighlightsUpdated (highlights) {
      this.refs.scrollbar.extendProps({
        highlights: highlights
      });
    };

    ScrollPane.prototype.onScroll = function onScroll () {
      var scrollPos = this.getScrollPosition();
      var scrollable = this.refs.scrollable;
      if (this.props.onScroll) {
        this.props.onScroll(scrollPos, scrollable);
      }

      if (this.props.tocProvider) {
        this.props.tocProvider.markActiveEntry(this);
      }
      this.emit('scroll', scrollPos, scrollable);
    };


    ScrollPane.prototype.getHeight = function getHeight () {
      var scrollableEl = this.getScrollableElement();
      return scrollableEl.height
    };


    ScrollPane.prototype.getContentHeight = function getContentHeight () {
      var contentEl = this.refs.content.el.getNativeElement();



      return contentEl.scrollHeight
    };


    ScrollPane.prototype.getContentElement = function getContentElement () {
      return this.refs.content.el
    };


    ScrollPane.prototype.getScrollableElement = function getScrollableElement () {
      return this.refs.scrollable.el
    };


    ScrollPane.prototype.getScrollPosition = function getScrollPosition () {
      var scrollableEl = this.getScrollableElement();
      return scrollableEl.getProperty('scrollTop')
    };

    ScrollPane.prototype.setScrollPosition = function setScrollPosition (scrollPos) {
      var scrollableEl = this.getScrollableElement();
      scrollableEl.setProperty('scrollTop', scrollPos);
    };


    ScrollPane.prototype.getPanelOffsetForElement = function getPanelOffsetForElement (el) {
      var nativeEl = el.getNativeElement();
      var contentContainerEl = this.refs.content.getNativeElement();
      var rect = getRelativeBoundingRect(nativeEl, contentContainerEl);
      return rect.top
    };


    ScrollPane.prototype.scrollTo = function scrollTo (componentId, onlyIfNotVisible) {
      var scrollableEl = this.getScrollableElement();
      var targetNode = scrollableEl.find('*[data-id="'+componentId+'"]');
      if (targetNode) {
        var offset = this.getPanelOffsetForElement(targetNode);
        var shouldScroll = true;
        if (onlyIfNotVisible) {
          var height = scrollableEl.height;
          var oldOffset = scrollableEl.getProperty('scrollTop');
          shouldScroll = (offset < oldOffset || oldOffset+height<offset);
        }
        if (shouldScroll) {
          this.setScrollPosition(offset);
        }
      } else {
        console.warn(componentId, 'not found in scrollable container');
      }
    };


    ScrollPane.prototype.onSelectionPositioned = function onSelectionPositioned () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      AbstractScrollPane$$1.prototype.onSelectionPositioned.apply(this, args);
      this._updateScrollbar();
    };

    ScrollPane.prototype._onContextMenu = function _onContextMenu (e) {
      AbstractScrollPane$$1.prototype._onContextMenu.call(this, e);
      this._updateScrollbar();
    };

    return ScrollPane;
  }(AbstractScrollPane));

  var ScrollPanePackage = {
    name: 'scroll-pane',
    configure: function(config) {
      config.addComponent('scroll-pane', ScrollPane);
    }
  };

  var BodyScrollPane = (function (AbstractScrollPane$$1) {
    function BodyScrollPane () {
      AbstractScrollPane$$1.apply(this, arguments);
    }

    if ( AbstractScrollPane$$1 ) BodyScrollPane.__proto__ = AbstractScrollPane$$1;
    BodyScrollPane.prototype = Object.create( AbstractScrollPane$$1 && AbstractScrollPane$$1.prototype );
    BodyScrollPane.prototype.constructor = BodyScrollPane;

    BodyScrollPane.prototype.getChildContext = function getChildContext () {
      return {
        scrollPane: this
      }
    };

    BodyScrollPane.prototype.getName = function getName () {
      return 'body'
    };

    BodyScrollPane.prototype.render = function render ($$) {
      var el = $$('div').addClass('sc-body-scroll-pane');
      if (this.props.contextMenu === 'custom') {
        el.on('contextmenu', this._onContextMenu);
      }
      el.append(this.props.children);
      return el
    };


    BodyScrollPane.prototype.getHeight = function getHeight () {
      return window.innerHeight
    };


    BodyScrollPane.prototype.getContentHeight = function getContentHeight () {
      return document.body.scrollHeight
    };

    BodyScrollPane.prototype.getContentElement = function getContentElement () {
      return DefaultDOMElement.wrapNativeElement(window.document.body)
    };




    BodyScrollPane.prototype.getScrollableElement = function getScrollableElement () {
      return document.body
    };


    BodyScrollPane.prototype.getScrollPosition = function getScrollPosition () {
      return document.body.scrollTop
    };

    BodyScrollPane.prototype.setScrollPosition = function setScrollPosition (scrollPos) {
      document.body.scrollTop = scrollPos;
    };


    BodyScrollPane.prototype.getPanelOffsetForElement = function getPanelOffsetForElement (el) {
      console.warn('TODO: implement');
    };


    BodyScrollPane.prototype.scrollTo = function scrollTo (componentId, onlyIfNotVisible) {
      console.warn('TODO: implement');
    };

    return BodyScrollPane;
  }(AbstractScrollPane));

  var BodyScrollPanePackage = {
    name: 'body-scroll-pane',
    configure: function(config) {
      config.addComponent('body-scroll-pane', BodyScrollPane);
    }
  };

  var SplitPane = (function (Component$$1) {
    function SplitPane () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) SplitPane.__proto__ = Component$$1;
    SplitPane.prototype = Object.create( Component$$1 && Component$$1.prototype );
    SplitPane.prototype.constructor = SplitPane;

    SplitPane.prototype.render = function render ($$) {
      if (this.props.children.length !== 2) {
        throw new Error('SplitPane only works with exactly two child elements')
      }

      var el = $$('div').addClass('sc-split-pane');
      if (this.props.splitType === 'horizontal') {
        el.addClass('sm-horizontal');
      } else {
        el.addClass('sm-vertical');
      }

      var paneA = this.props.children[0];
      var paneB = this.props.children[1];


      if (this.props.sizeB) {
        paneB.addClass('se-pane sm-sized');
        paneB.css(this.getSizedStyle(this.props.sizeB));
        paneA.addClass('se-pane sm-auto-fill');
      } else {
        paneA.addClass('se-pane sm-sized');
        paneA.css(this.getSizedStyle(this.props.sizeA));
        paneB.addClass('se-pane sm-auto-fill');
      }

      el.append(
          paneA,
          paneB
      );
      return el
    };


    SplitPane.prototype.getSizedStyle = function getSizedStyle (size) {
      if (!size || size === 'inherit') { return {} }
      if (this.props.splitType === 'horizontal') {
        return {'height': size}
      } else {
        return {'width': size}
      }
    };

    return SplitPane;
  }(Component));

  var SplitPanePackage = {
    name: 'split-pane',
    configure: function(config) {
      config.addComponent('split-pane', SplitPane);
    }
  };

  var TabbedPane = (function (Component$$1) {
    function TabbedPane () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) TabbedPane.__proto__ = Component$$1;
    TabbedPane.prototype = Object.create( Component$$1 && Component$$1.prototype );
    TabbedPane.prototype.constructor = TabbedPane;

    TabbedPane.prototype.render = function render ($$) {
      var el = $$('div').addClass('sc-tabbed-pane');
      var tabsEl = $$('div').addClass('se-tabs');
      forEach(this.props.tabs, function(tab) {
        var tabEl = $$('a')
            .addClass("se-tab")
            .attr({
              href: "#",
              "data-id": tab.id,
            })
            .on('click', this.onTabClicked);
        if (tab.id === this.props.activeTab) {
          tabEl.addClass("sm-active");
        }
        tabEl.append(
            $$('span').addClass('label').append(tab.name)
        );
        tabsEl.append(tabEl);
      }.bind(this));

      el.append(tabsEl);

      el.append(
          $$('div').addClass('se-tab-content').ref('tabContent').append(
              this.props.children
          )
      );
      return el
    };

    TabbedPane.prototype.onTabClicked = function onTabClicked (e) {
      e.preventDefault();
      var tabId = e.currentTarget.dataset.id;
      this.send('switchTab', tabId);
    };

    return TabbedPane;
  }(Component));

  var TabbedPanePackage = {
    name: 'tabbed-pane',
    configure: function(config) {
      config.addComponent('tabbed-pane', TabbedPane);
    }
  };

  var FileNode = (function (DocumentNode$$1) {
    function FileNode() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      DocumentNode$$1.apply(this, args);
    }

    if ( DocumentNode$$1 ) FileNode.__proto__ = DocumentNode$$1;
    FileNode.prototype = Object.create( DocumentNode$$1 && DocumentNode$$1.prototype );
    FileNode.prototype.constructor = FileNode;

    FileNode.prototype.getUrl = function getUrl () {
      if (this.proxy) {
        return this.proxy.getUrl()
      } else {

        console.warn('No file proxy attached to ', this.id);
        return ''
      }
    };

    FileNode.prototype.setProxy = function setProxy (proxy) {
      this.proxy = proxy;
    };

    return FileNode;
  }(DocumentNode));

  FileNode.type = 'file';

  FileNode.schema = {
    url: { type: 'string', optional: true },
    fileType: { type: 'string', optional: true },
    mimeType: { type: 'string', optional: true },
    sourceFile: { type: 'object', optional: true }
  };

  FileNode.prototype._isFileNode = true;
  FileNode._isFileNode = true;

  var FilePackage = {
    name: 'file',
    configure: function(config) {
      config.addNode(FileNode);
    }
  };

  var Tool = (function (Component$$1) {
    function Tool () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Tool.__proto__ = Component$$1;
    Tool.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Tool.prototype.constructor = Tool;

    var prototypeAccessors = { _isTool: {} };

    prototypeAccessors._isTool.get = function () {
      return true
    };


    Tool.prototype.render = function render ($$) {
      var el = $$('div')
          .addClass('se-tool');

      var customClassNames = this.getClassNames();
      if (customClassNames) {
        el.addClass(customClassNames);
      }

      var title = this.getTitle();
      if (title) {
        el.attr('title', title);
        el.attr('aria-label', title);
      }

      el.append(
          this.renderButton($$)
      );
      return el
    };

    Tool.prototype.renderButton = function renderButton ($$) {
      var Button = this.getComponent('button');
      var btn = $$(Button, {
        icon: this.props.showIcon ? this.props.name : null,
        label: this.props.showLabel ? this.props.name : null,
        hint: this.props.showHint ? this.props.name : null,
        active: this.props.active,
        disabled: this.props.disabled,
        style: this.props.style
      }).on('click', this.onClick);
      return btn
    };

    Tool.prototype.getClassNames = function getClassNames () {
      return ''
    };

    Tool.prototype.getTitle = function getTitle () {
      var labelProvider = this.context.labelProvider;
      var title = this.props.title || labelProvider.getLabel(this.getName());

      if (this.props.mode) {
        title = [capitalize(this.props.mode), title].join(' ');
      }
      return title
    };


    Tool.prototype.getCommandName = function getCommandName () {
      return this.getName()
    };

    Tool.prototype.getName = function getName () {
      return this.props.name
    };

    Tool.prototype.onClick = function onClick (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!this.props.disabled) { this.executeCommand(); }
    };


    Tool.prototype.executeCommand = function executeCommand (props) {
      this.context.commandManager.executeCommand(this.getCommandName(), extend({
        mode: this.props.mode
      }, props));
    };

    Object.defineProperties( Tool.prototype, prototypeAccessors );

    return Tool;
  }(Component));

  var Command = function Command(config) {
    this.config = config || {};
    this.name = this.config.name;
    if (!this.name) {
      throw new Error("'name' is required");
    }
  };

  var prototypeAccessors$9 = { isAsync: {} };

  prototypeAccessors$9.isAsync.get = function () {
    return false
  };


  Command.prototype.getName = function getName () {
    return this.name
  };


  Command.prototype.getCommandState = function getCommandState (params, context) {
    throw new Error('Command.getCommandState() is abstract.')
  };


  Command.prototype.execute = function execute (params, context) {
    throw new Error('Command.execute() is abstract.')
  };

  Command.prototype._getEditorSession = function _getEditorSession (params, context) {
    var editorSession = params.editorSession || context.editorSession;
    if (!editorSession) {
      throw new Error("'editorSession' is required.")
    }
    return editorSession
  };

  Command.prototype._getSelection = function _getSelection (params) {
    var sel = params.selection || params.selectionState.getSelection();
    if (!sel) {
      throw new Error("'selection' is required.")
    }
    return sel
  };

  Object.defineProperties( Command.prototype, prototypeAccessors$9 );

  Command.prototype._isCommand = true;

  var Undo = (function (Command$$1) {
    function Undo () {
      Command$$1.apply(this, arguments);
    }

    if ( Command$$1 ) Undo.__proto__ = Command$$1;
    Undo.prototype = Object.create( Command$$1 && Command$$1.prototype );
    Undo.prototype.constructor = Undo;

    Undo.prototype.getCommandState = function getCommandState (params) {
      var editorSession = params.editorSession;
      return {
        disabled: !editorSession.canUndo(),
        active: false
      }
    };

    Undo.prototype.execute = function execute (params) {
      var editorSession = params.editorSession;
      if (editorSession.canUndo()) {
        editorSession.undo();
        return true
      }
      return false
    };

    return Undo;
  }(Command));

  var Redo = (function (Command$$1) {
    function Redo () {
      Command$$1.apply(this, arguments);
    }

    if ( Command$$1 ) Redo.__proto__ = Command$$1;
    Redo.prototype = Object.create( Command$$1 && Command$$1.prototype );
    Redo.prototype.constructor = Redo;

    Redo.prototype.getCommandState = function getCommandState (params) {
      var editorSession = params.editorSession;
      return {
        disabled: !editorSession.canRedo(),
        active: false
      }
    };

    Redo.prototype.execute = function execute (params) {
      var editorSession = params.editorSession;
      if (editorSession.canRedo()) {
        editorSession.redo();
        return true
      } else {
        return false
      }
    };

    return Redo;
  }(Command));

  var SelectAll = (function (Command$$1) {
    function SelectAll () {
      Command$$1.apply(this, arguments);
    }

    if ( Command$$1 ) SelectAll.__proto__ = Command$$1;
    SelectAll.prototype = Object.create( Command$$1 && Command$$1.prototype );
    SelectAll.prototype.constructor = SelectAll;

    SelectAll.prototype.getCommandState = function getCommandState (params) {
      var editorSession = params.editorSession;
      return {
        disabled: editorSession.getSelection().isNull()
      }
    };

    SelectAll.prototype.execute = function execute (params) {
      var editorSession = params.editorSession;
      var doc = editorSession.getDocument();
      var surface = params.surface || editorSession.getFocusedSurface();
      if (surface) {
        var sel;

        if (surface._isContainerEditor) {
          var container = surface.getContainer();
          if (container.nodes.length === 0) {
            return false
          }
          var firstNodeId = container.nodes[0];
          var lastNodeId = last$2(container.nodes);
          sel = editorSession.createSelection({
            type: 'container',
            startPath: [firstNodeId],
            startOffset: 0,
            endPath: [lastNodeId],
            endOffset: 1,
            containerId: container.id,
            surfaceId: surface.id
          });
        } else if (surface._isTextPropertyEditor) {
          var path = surface.getPath();
          var text = doc.get(path);
          sel = editorSession.createSelection({
            type: 'property',
            path: path,
            startOffset: 0,
            endOffset: text.length,
            surfaceId: surface.id
          });
        }
        editorSession.setSelection(sel);
        return true
      }
      return false
    };

    return SelectAll;
  }(Command));

  var BasePackage = {
    name: 'base',
    configure: function(config) {
      config.import(FilePackage);
      config.import(ScrollPanePackage);
      config.import(BodyScrollPanePackage);
      config.import(SplitPanePackage);
      config.import(TabbedPanePackage);
      config.import(ScrollbarPackage);
      config.import(GridPackage);
      config.import(ModalPackage);
      config.import(InputPackage);
      config.import(ButtonPackage);
      config.import(LayoutPackage);
      config.import(ContextMenuPackage);
      config.import(OverlayPackage);
      config.import(DropzonesPackage);
      config.import(GutterPackage);


      config.addToolGroup('document');
      config.addToolGroup('annotations');
      config.addToolGroup('default');
      config.addToolGroup('context-menu-primary');
      config.addToolGroup('context-menu-document');
      config.addToolGroup('insert');


      config.addCommand('undo', Undo);
      config.addCommand('redo', Redo);
      config.addCommand('select-all', SelectAll);


      config.addTool('undo', Tool, {toolGroup: ['document', 'context-menu-document']});
      config.addTool('redo', Tool, {toolGroup: ['document', 'context-menu-document']});
      config.addTool('select-all', Tool, {toolGroup: ['context-menu-document']});


      config.addIcon('undo', { 'fontawesome': 'fa-undo' });
      config.addIcon('redo', { 'fontawesome': 'fa-repeat' });
      config.addIcon('edit', { 'fontawesome': 'fa-cog' });
      config.addIcon('delete', { 'fontawesome': 'fa-times' });
      config.addIcon('expand', { 'fontawesome': 'fa-arrows-h' });
      config.addIcon('truncate', { 'fontawesome': 'fa-arrows-h' });


      config.addLabel('undo', {
        en: 'Undo',
        de: 'Rückgängig'
      });
      config.addLabel('redo', {
        en: 'Redo',
        de: 'Wiederherstellen'
      });
      config.addLabel('select-all', {
        en: 'Select All',
        de: 'Alles Auswählen'
      });
      config.addLabel('container-selection', {
        en: 'Container',
        de: 'Container'
      });
      config.addLabel('container', {
        en: 'Container',
        de: 'Container'
      });
      config.addLabel('insert-container', {
        en: 'Insert Container',
        de: 'Container einfügen'
      });

      if (platform.isMac) {
        config.addKeyboardShortcut('cmd+z', { command: 'undo' });
        config.addKeyboardShortcut('cmd+shift+z', { command: 'redo' });
        config.addKeyboardShortcut('cmd+a', { command: 'select-all' });
      } else {
        config.addKeyboardShortcut('ctrl+z', { command: 'undo' });
        config.addKeyboardShortcut('ctrl+shift+z', { command: 'redo' });
        config.addKeyboardShortcut('ctrl+a', { command: 'select-all' });
      }
    }
  };

  var Blockquote = (function (TextBlock$$1) {
    function Blockquote () {
      TextBlock$$1.apply(this, arguments);
    }if ( TextBlock$$1 ) Blockquote.__proto__ = TextBlock$$1;
    Blockquote.prototype = Object.create( TextBlock$$1 && TextBlock$$1.prototype );
    Blockquote.prototype.constructor = Blockquote;



    return Blockquote;
  }(TextBlock));

  Blockquote.type = "blockquote";

  var NodeComponent = (function (Component$$1) {
    function NodeComponent () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) NodeComponent.__proto__ = Component$$1;
    NodeComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
    NodeComponent.prototype.constructor = NodeComponent;

    NodeComponent.prototype.render = function render ($$) {
      var tagName = this.getTagName();
      var el = $$(tagName)
          .attr('data-id', this.props.node.id)
          .addClass(this.getClassNames());
      return el
    };

    NodeComponent.prototype.getTagName = function getTagName () {
      return 'div'
    };

    NodeComponent.prototype.getClassNames = function getClassNames () {
      return ''
    };

    return NodeComponent;
  }(Component));

  function levenshtein(a, b){
    var m = [];
    for(var i = 0; i <= b.length; i++) {
      m[i] = [i];
      if(i === 0) { continue; }
      var ib = i-1;
      for(var j = 0; j <= a.length; j++){
        m[0][j] = j;
        if(j === 0) { continue; }
        var jb = j-1;
        m[i][j] = b.charAt(ib) === a.charAt(jb) ? m[ib][jb] : Math.min(
            m[ib][jb]+1,
            m[i][jb]+1,
            m[ib][j]+1
        );
      }
    }
    return m
  }

  function diff(a, b, offset) {
    if (!isString(a) || !isString(b)) {
      throw new Error('Illegal arguments.')
    }
    offset = offset || 0;
    var changes = [];
    if (a || b) {
      if (!a && b) {
        changes.push({ type:'insert', start:offset, text:b });
      } else if (a && !b) {
        changes.push({ type:'delete', start:offset, end:offset+a.length });
      } else {
        var m = levenshtein(a, b);
        changes = _diff(a, b, m, offset);
      }
    }
    return changes
  }

  function _diff(a, b, m, offset) {
    var i = b.length;
    var j = a.length;
    var changes = [];
    var current;
    while (i>0 && j>0) {
      _next();
    }
    _commit();
    return changes

    function _next() {
      var d = m[i][j];
      var ib = i-1;
      var jb = j-1;

      if (m[ib][jb]<d) {
        if (current && current.type === 'replace') {
          current.start--;
          current.text.unshift(b.charAt(ib));
        } else {
          _commit();
          current = { type:'replace', start:jb, end:j, text:[b.charAt(ib)] };
        }
        i--;
        j--;
      }

      else if (m[ib][j]<d) {
        if (current && current.type === 'insert') {
          current.start--;
          current.text.unshift(b.charAt(ib));
        } else {
          _commit();
          current = { type:'insert', start:jb, text:[b.charAt(ib)] };
        }
        i--;
      }

      else if (m[i][jb]<d) {
        if (current && current.type === 'delete') {
          current.start--;
        } else {
          _commit();
          current = { type:'delete', start:jb, end:j };
        }
        j--;
      }

      else {
        _commit();
        i--;
        j--;
      }
    }

    function _commit() {
      if (current) {
        switch (current.type) {
          case 'insert':
            current.start += offset;
            current.text = current.text.join('');
            break
          case 'delete':
            current.start += offset;
            current.end += offset;
            break
          case 'replace':
            current.start += offset;
            current.end += offset;
            current.text = current.text.join('');
            break
          default:
            throw new Error('Invalid state')
        }
        changes.push(current);
        current = null;
      }
    }

  }

  var AnnotationComponent = (function (Component$$1) {
    function AnnotationComponent () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) AnnotationComponent.__proto__ = Component$$1;
    AnnotationComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
    AnnotationComponent.prototype.constructor = AnnotationComponent;

    AnnotationComponent.prototype.didMount = function didMount () {
      var node = this.props.node;
      node.on('highlighted', this.onHighlightedChanged, this);
    };


    AnnotationComponent.prototype.dispose = function dispose () {
      var node = this.props.node;
      node.off(this);
    };

    AnnotationComponent.prototype.render = function render ($$) {
      var el = $$(this.getTagName())
          .attr("data-id", this.props.node.id)
          .addClass(this.getClassNames());
      if (this.props.node.highlighted) {
        el.addClass('sm-highlighted');
      }
      el.append(this.props.children);
      return el
    };

    AnnotationComponent.prototype.getClassNames = function getClassNames () {
      return 'sc-'+this.props.node.type
    };

    AnnotationComponent.prototype.onHighlightedChanged = function onHighlightedChanged () {
      if (this.props.node.highlighted) {
        this.el.addClass('sm-highlighted');
      } else {
        this.el.removeClass('sm-highlighted');
      }
    };

    AnnotationComponent.prototype.getTagName = function getTagName () {
      return 'span'
    };

    return AnnotationComponent;
  }(Component));

  var AbstractIsolatedNodeComponent = (function (Component$$1) {
    function AbstractIsolatedNodeComponent() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      Component$$1.apply(this, args);

      this.name = this.props.node.id;
      this._id = this.context.surface.id +'/'+this.name;
      this._state = {
        selectionFragment: null
      };

      this.handleAction('escape', this.escape);
      this.ContentClass = this._getContentClass(this.props.node) || Component$$1;


      var useBlocker = platform.isFF || !this.ContentClass.noBlocker;
      this.blockingMode = useBlocker ? 'closed' : 'open';
    }

    if ( Component$$1 ) AbstractIsolatedNodeComponent.__proto__ = Component$$1;
    AbstractIsolatedNodeComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
    AbstractIsolatedNodeComponent.prototype.constructor = AbstractIsolatedNodeComponent;

    var prototypeAccessors = { id: {} };

    AbstractIsolatedNodeComponent.prototype.getChildContext = function getChildContext () {
      return {
        isolatedNodeComponent: this,


        surface: undefined
      }
    };

    AbstractIsolatedNodeComponent.prototype.getInitialState = function getInitialState () {
      var selState = this.context.editorSession.getSelectionState();
      return this._deriveStateFromSelectionState(selState)
    };

    AbstractIsolatedNodeComponent.prototype.didMount = function didMount () {
      Component$$1.prototype.didMount.call(this);

      var editorSession = this.context.editorSession;
      editorSession.onRender('selection', this._onSelectionChanged, this);
    };

    AbstractIsolatedNodeComponent.prototype.dispose = function dispose () {
      Component$$1.prototype.dispose.call(this);

      var editorSession = this.context.editorSession;
      editorSession.off(this);
    };

    AbstractIsolatedNodeComponent.prototype.renderContent = function renderContent ($$, node, options) {
      if ( options === void 0 ) options = {};

      var ComponentClass = this.ContentClass;
      if (!ComponentClass) {
        console.error('Could not resolve a component for type: ' + node.type);
        return $$(this.__elementTag)
      } else {
        var props = Object.assign({
          disabled: this.props.disabled,
          node: node,
          isolatedNodeState: this.state.mode,
          focused: (this.state.mode === 'focused')
        }, options);
        return $$(ComponentClass, props)
      }
    };

    AbstractIsolatedNodeComponent.prototype.getId = function getId () {
      return this._id
    };

    prototypeAccessors.id.get = function () { return this.getId() };

    AbstractIsolatedNodeComponent.prototype.getMode = function getMode () {
      return this.state.mode
    };

    AbstractIsolatedNodeComponent.prototype.isOpen = function isOpen () {
      return this.blockingMode === 'open'
    };

    AbstractIsolatedNodeComponent.prototype.isClosed = function isClosed () {
      return this.blockingMode === 'closed'
    };

    AbstractIsolatedNodeComponent.prototype.isNotSelected = function isNotSelected () {
      return !this.state.mode
    };

    AbstractIsolatedNodeComponent.prototype.isSelected = function isSelected () {
      return this.state.mode === 'selected'
    };

    AbstractIsolatedNodeComponent.prototype.isCoSelected = function isCoSelected () {
      return this.state.mode === 'co-selected'
    };

    AbstractIsolatedNodeComponent.prototype.isFocused = function isFocused () {
      return this.state.mode === 'focused'
    };

    AbstractIsolatedNodeComponent.prototype.isCoFocused = function isCoFocused () {
      return this.state.mode === 'co-focused'
    };

    AbstractIsolatedNodeComponent.prototype.escape = function escape () {

      this.selectNode();
    };

    AbstractIsolatedNodeComponent.prototype._onSelectionChanged = function _onSelectionChanged () {
      var editorSession = this.context.editorSession;
      var newState = this._deriveStateFromSelectionState(editorSession.getSelectionState());
      if (!newState && this.state.mode) {
        this.extendState({ mode: null });
      } else if (newState && newState.mode !== this.state.mode) {
        this.extendState(newState);
      }
    };

    AbstractIsolatedNodeComponent.prototype.onKeydown = function onKeydown (event) {




      if (event.keyCode === keys.ESCAPE && this.state.mode === 'focused') {
        event.stopPropagation();
        event.preventDefault();
        this.escape();
      }
    };

    AbstractIsolatedNodeComponent.prototype._getContentClass = function _getContentClass (node) {
      var componentRegistry = this.context.componentRegistry;
      var ComponentClass = componentRegistry.get(node.type);
      return ComponentClass
    };

    AbstractIsolatedNodeComponent.prototype._getSurface = function _getSurface (selState) {
      var surface = selState.get('surface');
      if (surface === undefined) {
        var sel = selState.getSelection();
        if (sel && sel.surfaceId) {
          var surfaceManager = this.context.surfaceManager;
          surface = surfaceManager.getSurface(sel.surfaceId);
        } else {
          surface = null;
        }
        selState.set('surface', surface);
      }
      return surface
    };



    AbstractIsolatedNodeComponent.prototype._getIsolatedNodes = function _getIsolatedNodes (selState) {
      var isolatedNodes = selState.get('isolatedNodes');
      if (!isolatedNodes) {
        var sel = selState.getSelection();
        isolatedNodes = [];
        if (sel && sel.surfaceId) {
          var surfaceManager = this.context.surfaceManager;
          var surface = surfaceManager.getSurface(sel.surfaceId);
          isolatedNodes = surface.getComponentPath().filter(function (comp) { return comp._isAbstractIsolatedNodeComponent; });
        }
        selState.set('isolatedNodes', isolatedNodes);
      }
      return isolatedNodes
    };

    AbstractIsolatedNodeComponent.prototype._shouldConsumeEvent = function _shouldConsumeEvent (event) {
      var comp = Component$$1.unwrap(event.target);
      return (comp && (comp === this || comp.context.isolatedNodeComponent === this))
    };

    Object.defineProperties( AbstractIsolatedNodeComponent.prototype, prototypeAccessors );

    return AbstractIsolatedNodeComponent;
  }(Component));

  AbstractIsolatedNodeComponent.prototype._isAbstractIsolatedNodeComponent = true;

  var InlineNodeComponent = (function (AbstractIsolatedNodeComponent$$1) {
    function InlineNodeComponent () {
      AbstractIsolatedNodeComponent$$1.apply(this, arguments);
    }

    if ( AbstractIsolatedNodeComponent$$1 ) InlineNodeComponent.__proto__ = AbstractIsolatedNodeComponent$$1;
    InlineNodeComponent.prototype = Object.create( AbstractIsolatedNodeComponent$$1 && AbstractIsolatedNodeComponent$$1.prototype );
    InlineNodeComponent.prototype.constructor = InlineNodeComponent;

    InlineNodeComponent.prototype.render = function render ($$) {
      var node = this.props.node;
      var ContentClass = this.ContentClass;

      var el = $$('span');
      el.addClass(this.getClassNames())
          .addClass('sc-inline-node')
          .addClass('sm-'+this.props.node.type)
          .attr("data-id", node.id)
          .attr('data-inline', '1');

      var disabled = this.isDisabled();

      if (this.state.mode) {
        el.addClass('sm-'+this.state.mode);
      } else {
        el.addClass('sm-not-selected');
      }

      if (!ContentClass.noStyle) {
        el.addClass('sm-default-style');
      }




      el.on('keydown', this.onKeydown);

      el.append(
          this.renderContent($$, node)
              .ref('content')
              .addClass('se-content')
      );

      if (disabled) {
        el.addClass('sm-disabled')
            .attr('contenteditable', false)
            .on('click', this.onClick);
      }

      el.attr('draggable', true);
      return el
    };

    InlineNodeComponent.prototype.isDisabled = function isDisabled () {
      return !this.state.mode || ['co-selected', 'cursor'].indexOf(this.state.mode) > -1;
    };

    InlineNodeComponent.prototype.getClassNames = function getClassNames () {
      return ''
    };

    InlineNodeComponent.prototype.onClick = function onClick (event) {
      if (!this._shouldConsumeEvent(event)) { return }
      this.selectNode();
    };

    InlineNodeComponent.prototype.selectNode = function selectNode () {

      var editorSession = this.context.editorSession;
      var surface = this.context.surface;
      var node = this.props.node;
      editorSession.setSelection({
        type: 'property',
        path: node.start.path,
        startOffset: node.start.offset,
        endOffset: node.end.offset,
        containerId: surface.getContainerId(),
        surfaceId: surface.id
      });
    };



    InlineNodeComponent.prototype._deriveStateFromSelectionState = function _deriveStateFromSelectionState (selState) {
      var surface = this._getSurface(selState);
      if (!surface) { return null }

      if (surface === this.context.surface) {
        var sel = selState.getSelection();
        var node = this.props.node;
        if (sel.isPropertySelection() && !sel.isCollapsed() && isEqual(sel.path, node.path)) {
          var nodeSel = node.getSelection();
          if(nodeSel.equals(sel)) {
            return { mode: 'selected' }
          }
          if (sel.contains(nodeSel)) {
            return { mode: 'co-selected' }
          }
        }
      }
      var isolatedNodeComponent = surface.context.isolatedNodeComponent;
      if (!isolatedNodeComponent) { return null }
      if (isolatedNodeComponent === this) {
        return { mode: 'focused' }
      }
      var isolatedNodes = this._getIsolatedNodes(selState);
      if (isolatedNodes.indexOf(this) > -1) {
        return { mode: 'co-focused' }
      }
      return null
    };

    return InlineNodeComponent;
  }(AbstractIsolatedNodeComponent));

  InlineNodeComponent.prototype._isInlineNodeComponent = true;

  var AnnotatedTextComponent = (function (Component$$1) {
    function AnnotatedTextComponent () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) AnnotatedTextComponent.__proto__ = Component$$1;
    AnnotatedTextComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
    AnnotatedTextComponent.prototype.constructor = AnnotatedTextComponent;

    AnnotatedTextComponent.prototype.render = function render ($$) {
      var el = this._renderContent($$)
          .addClass('sc-annotated-text')
          .css({ whiteSpace: "pre-wrap" });
      return el
    };

    AnnotatedTextComponent.prototype.getText = function getText () {
      return this.getDocument().get(this.props.path) || ''
    };

    AnnotatedTextComponent.prototype.getAnnotations = function getAnnotations () {
      return this.getDocument().getIndex('annotations').get(this.props.path)
    };

    AnnotatedTextComponent.prototype._getTagName = function _getTagName () {
      return this.props.tagName
    };

    AnnotatedTextComponent.prototype._onDocumentChange = function _onDocumentChange (update) {
      if (update.change && update.change.updated[this.getPath()]) {
        this.rerender();
      }
    };

    AnnotatedTextComponent.prototype._renderContent = function _renderContent ($$) {
      var text = this.getText();
      var annotations = this.getAnnotations();
      var el = $$(this._getTagName() || 'span');
      if (annotations && annotations.length > 0) {
        var fragmenter = new Fragmenter({
          onText: this._renderTextNode.bind(this),
          onEnter: this._renderFragment.bind(this, $$),
          onExit: this._finishFragment.bind(this)
        });
        fragmenter.start(el, text, annotations);
      } else {
        el.append(text);
      }
      return el
    };

    AnnotatedTextComponent.prototype._renderTextNode = function _renderTextNode (context, text) {
      if (text && text.length > 0) {
        context.append(text);
      }
    };

    AnnotatedTextComponent.prototype._renderFragment = function _renderFragment ($$, fragment) {
      var doc = this.getDocument();
      var componentRegistry = this.getComponentRegistry();
      var node = fragment.node;

      if (node.type === "container-annotation-fragment") {



      } else if (node.type === "container-annotation-anchor") {




      } else {
        var ComponentClass = componentRegistry.get(node.type) || AnnotationComponent;
        if (node.constructor.isInline &&

            !ComponentClass.prototype._isInlineNodeComponent &&

            !ComponentClass.isCustom) {
          ComponentClass = InlineNodeComponent;
        }
        var el = $$(ComponentClass, { doc: doc, node: node });
        return el
      }
    };

    AnnotatedTextComponent.prototype._finishFragment = function _finishFragment (fragment, context, parentContext) {
      parentContext.append(context);
    };


    AnnotatedTextComponent.prototype.getDocument = function getDocument () {
      return this.props.doc || this.context.doc
    };

    return AnnotatedTextComponent;
  }(Component));

  var CursorComponent = (function (Component$$1) {
    function CursorComponent () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) CursorComponent.__proto__ = Component$$1;
    CursorComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
    CursorComponent.prototype.constructor = CursorComponent;

    CursorComponent.prototype.render = function render ($$) {

      var el = $$('span').addClass('se-cursor');



      el.append("\uFEFF");
      el.append($$('div').addClass('se-cursor-inner'));

      if (this.props.collaborator) {
        var collaboratorIndex = this.props.collaborator.colorIndex;
        el.addClass('sm-collaborator-'+collaboratorIndex);
      } else {
        el.addClass('sm-local-user');
      }

      return el
    };

    return CursorComponent;
  }(Component));

  var SelectionFragmentComponent = (function (Component$$1) {
    function SelectionFragmentComponent () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) SelectionFragmentComponent.__proto__ = Component$$1;
    SelectionFragmentComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
    SelectionFragmentComponent.prototype.constructor = SelectionFragmentComponent;

    SelectionFragmentComponent.prototype.render = function render ($$) {

      var el = $$('span').addClass('se-selection-fragment');
      if (this.props.collaborator) {
        var collaboratorIndex = this.props.collaborator.colorIndex;
        el.addClass('sm-collaborator-'+collaboratorIndex);
      } else {
        el.addClass('sm-local-user');
      }
      el.append(this.props.children);
      return el
    };

    return SelectionFragmentComponent;
  }(Component));

  var TextPropertyComponent = (function (AnnotatedTextComponent$$1) {
    function TextPropertyComponent () {
      AnnotatedTextComponent$$1.apply(this, arguments);
    }

    if ( AnnotatedTextComponent$$1 ) TextPropertyComponent.__proto__ = AnnotatedTextComponent$$1;
    TextPropertyComponent.prototype = Object.create( AnnotatedTextComponent$$1 && AnnotatedTextComponent$$1.prototype );
    TextPropertyComponent.prototype.constructor = TextPropertyComponent;

    TextPropertyComponent.prototype.getInitialState = function getInitialState () {
      var markersManager = this.context.markersManager;
      var path = this.props.path;
      var markers;
      if (markersManager) {

        markersManager.register(this);
        markers = markersManager.getMarkers(path, {
          surfaceId: this.getSurfaceId(),
          containerId: this.getContainerId()
        });
      } else {
        var doc = this.getDocument();
        markers = doc.getAnnotations(path);
      }
      return {
        markers: markers
      }
    };

    TextPropertyComponent.prototype.didMount = function didMount () {
      if (this.context.surface && this.context.surface.hasNativeSpellcheck()) {
        this.domObserver = new window.MutationObserver(this._onDomMutations.bind(this));
        this.domObserver.observe(this.el.getNativeElement(), { subtree: true, characterData: true, characterDataOldValue: true });
      }
    };

    TextPropertyComponent.prototype.dispose = function dispose () {
      if (this.context.markersManager) {
        this.context.markersManager.deregister(this);
      }
    };

    TextPropertyComponent.prototype.render = function render ($$) {
      var path = this.getPath();

      var el = this._renderContent($$)
          .addClass('sc-text-property')
          .attr({
            'data-path': path.join('.')
          })
          .css({
            'white-space': 'pre-wrap'
          });

      if (!this.props.withoutBreak) {
        el.append($$('br'));
      }
      return el
    };

    TextPropertyComponent.prototype.getAnnotations = function getAnnotations () {
      return this.state.markers
    };

    TextPropertyComponent.prototype._renderFragment = function _renderFragment ($$, fragment) {
      var node = fragment.node;
      var id = node.id;
      var el;
      if (node.type === 'cursor') {
        el = $$(CursorComponent, { collaborator: node.collaborator });
      } else if (node.type === 'selection-fragment') {
        el = $$(SelectionFragmentComponent, { collaborator: node.collaborator });
      } else {
        el = AnnotatedTextComponent$$1.prototype._renderFragment.apply(this, arguments);
        el.ref(id + '@' + fragment.counter);












      }
      el.attr('data-offset', fragment.pos);
      return el
    };

    TextPropertyComponent.prototype._onDomMutations = function _onDomMutations (mutations) {

      if (mutations.length === 2 && mutations[0].target === mutations[1].target) {
        var textEl = mutations[0].target._wrapper;
        if (textEl) {
          this._applyTextMutation(textEl, mutations[0].oldValue);
          return
        }
      }

      this.rerender();
    };

    TextPropertyComponent.prototype._applyTextMutation = function _applyTextMutation (textEl, oldText) {

      var offset = _getCharPos(textEl, 0);
      var newText = textEl.textContent;
      var changes = diff(oldText, newText, offset);

      var editorSession = this.context.editorSession;
      var path = this.getPath();
      editorSession.transaction(function(tx) {
        changes.forEach(function(change) {

          if (change.type === 'replace') {
            tx.update(path, { type: 'delete', start: change.start, end: change.end });
            tx.update(path, { type: 'insert', start: change.start, text: change.text });
          } else {
            tx.update(path, change);
          }
        });
      });
    };

    TextPropertyComponent.prototype.getPath = function getPath () {
      return this.props.path
    };

    TextPropertyComponent.prototype.getText = function getText () {
      return this.getDocument().get(this.getPath())
    };

    TextPropertyComponent.prototype.getDocument = function getDocument () {
      return this.props.doc ||this.context.doc
    };

    TextPropertyComponent.prototype.getSurface = function getSurface () {
      return this.props.surface || this.context.surface
    };

    TextPropertyComponent.prototype.getSurfaceId = function getSurfaceId () {
      var surface = this.getSurface();
      return surface ? surface.id : null
    };

    TextPropertyComponent.prototype.getContainerId = function getContainerId () {
      var surface = this.getSurface();
      return surface ? surface.getContainerId() : null
    };

    TextPropertyComponent.prototype.isEditable = function isEditable () {
      return this.getSurface().isEditable()
    };

    TextPropertyComponent.prototype.isReadonly = function isReadonly () {
      return this.getSurface().isReadonly()
    };

    TextPropertyComponent.prototype.getDOMCoordinate = function getDOMCoordinate (charPos) {
      return this._getDOMCoordinate(this.el, charPos)
    };


    TextPropertyComponent.prototype._finishFragment = function _finishFragment (fragment, context, parentContext) {
      context.attr('data-length', fragment.length);
      parentContext.append(context);
    };

    TextPropertyComponent.prototype._getDOMCoordinate = function _getDOMCoordinate (el, charPos) {
      var this$1 = this;

      var l;
      var idx = 0;
      if (charPos === 0) {
        return {
          container: el.getNativeElement(),
          offset: 0
        }
      }
      for (var child = el.getFirstChild(); child; child = child.getNextSibling(), idx++) {
        if (child.isTextNode()) {
          l = child.textContent.length;
          if (l >= charPos) {
            return {
              container: child.getNativeElement(),
              offset: charPos
            }
          } else {
            charPos -= l;
          }
        } else if (child.isElementNode()) {
          var length = child.getAttribute('data-length');
          if (length) {
            l = parseInt(length, 10);
            if (l >= charPos) {

              if (child.attr('data-inline')) {
                var nextSibling = child.getNextSibling();
                if (nextSibling && nextSibling.isTextNode()) {
                  return {
                    container: nextSibling.getNativeElement(),
                    offset: 0
                  }
                } else {
                  return {
                    container: el.getNativeElement(),
                    offset: el.getChildIndex(child) + 1
                  }
                }
              }
              return this$1._getDOMCoordinate(child, charPos, idx)
            } else {
              charPos -= l;
            }
          } else {
            console.error('FIXME: Can not map to DOM coordinates.');
            return null
          }
        }
      }
    };

    return TextPropertyComponent;
  }(AnnotatedTextComponent));

  TextPropertyComponent.prototype._isTextPropertyComponent = true;





  TextPropertyComponent.getCoordinate = function(root, el, offset) {
    var context = _getPropertyContext(root, el, offset);
    if (!context) {
      return null
    }



    var charPos = _getCharPos(context.node, context.offset);
    if (isNumber(charPos)) {
      var coor = new Coordinate(context.path, charPos);
      coor._comp = context.comp;
      return coor
    } else {
      return null
    }
  };

  function _getPropertyContext(root, node, offset) {
    var result = {
      comp: null,
      el: null,
      path: null,
      node: node,
      offset: offset
    };
    while (node && node !== root) {
      if (node.isElementNode()) {
        var comp = Component.unwrap(node);
        if (comp && comp._isTextPropertyComponent) {
          result.comp = comp;
          result.el = node;
          result.path = comp.getPath();
          return result;
        }



        if (node.getAttribute('data-inline')) {
          result.node = node;
          if (offset > 0) {
            result.offset = 1;
          }
        }
      }
      node = node.getParent();
    }
    return null
  }

  function _getCharPos(node, offset) {
    var charPos = offset;
    var parent, childIdx;



    parent = node.getParent();
    if (node.isTextNode()) {

      if (node === parent.firstChild) {

        var parentPath = parent.getAttribute('data-path');
        var parentOffset = parent.getAttribute('data-offset');
        if (parentPath) {
          charPos = offset;
        }

        else if (parentOffset) {
          charPos = parseInt(parentOffset, 10) + offset;
        }

        else {
          charPos = _getCharPos(parent, 0) + offset;
        }
      } else {

        childIdx = parent.getChildIndex(node);
        charPos = _getCharPos(parent, childIdx) + offset;
      }
    } else if (node.isElementNode()) {
      var pathStr = node.getAttribute('data-path');
      var offsetStr = node.getAttribute('data-offset');


      if (pathStr) {
        charPos = _countCharacters(node, offset);
      }


      else if (offsetStr) {
        childIdx = parent.getChildIndex(node);
        charPos = parseInt(offsetStr, 10) + _countCharacters(node, offset);
      }


      else {
        childIdx = parent.getChildIndex(node);
        charPos = _getCharPos(parent, childIdx) + _countCharacters(node, offset);
      }
    } else {

      return null
    }
    return charPos;
  }

  function _countCharacters(el, maxIdx) {
    var charPos = 0;

    if (el.getAttribute('data-inline')) {
      return maxIdx === 0 ? 0 : 1;
    }
    var l = el.getChildCount();
    if (arguments.length === 1) {
      maxIdx = l;
    }
    maxIdx = Math.min(l, maxIdx);
    for (var i=0, child = el.getFirstChild(); i < maxIdx; child = child.getNextSibling(), i++) {
      if (child.isTextNode()) {
        charPos += child.getTextContent().length;
      } else if (child.isElementNode()) {
        var length = child.getAttribute('data-length');
        if (child.getAttribute('data-inline')) {
          charPos += 1;
        } else if (length) {
          charPos += parseInt(length, 10);
        } else {
          charPos += _countCharacters(child);
        }
      }
    }
    return charPos
  }

  var TextBlockComponent = (function (NodeComponent$$1) {
    function TextBlockComponent () {
      NodeComponent$$1.apply(this, arguments);
    }

    if ( NodeComponent$$1 ) TextBlockComponent.__proto__ = NodeComponent$$1;
    TextBlockComponent.prototype = Object.create( NodeComponent$$1 && NodeComponent$$1.prototype );
    TextBlockComponent.prototype.constructor = TextBlockComponent;

    TextBlockComponent.prototype.render = function render ($$) {
      var el = NodeComponent$$1.prototype.render.call(this, $$);
      el.addClass('sc-text-block');

      var node = this.props.node;


      if (node.direction) {

        el.attr('dir', node.direction);
      }
      el.append($$(TextPropertyComponent, {
        path: node.getTextPath(),
        direction: node.direction
      }));
      return el
    };

    return TextBlockComponent;
  }(NodeComponent));

  var Code = (function (PropertyAnnotation$$1) {
    function Code () {
      PropertyAnnotation$$1.apply(this, arguments);
    }if ( PropertyAnnotation$$1 ) Code.__proto__ = PropertyAnnotation$$1;
    Code.prototype = Object.create( PropertyAnnotation$$1 && PropertyAnnotation$$1.prototype );
    Code.prototype.constructor = Code;



    return Code;
  }(PropertyAnnotation));

  Code.type = 'code';

  var AnnotationCommand = (function (Command$$1) {
    function AnnotationCommand() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      Command$$1.apply(this, args);

      if (!this.config.nodeType) {
        throw new Error("'nodeType' is required")
      }
    }

    if ( Command$$1 ) AnnotationCommand.__proto__ = Command$$1;
    AnnotationCommand.prototype = Object.create( Command$$1 && Command$$1.prototype );
    AnnotationCommand.prototype.constructor = AnnotationCommand;


    AnnotationCommand.prototype.getAnnotationType = function getAnnotationType () {
      return this.config.nodeType
    };


    AnnotationCommand.prototype.getAnnotationData = function getAnnotationData () {
      return {}
    };


    AnnotationCommand.prototype.isDisabled = function isDisabled (sel) {


      if (!sel || sel.isNull() || !sel.isAttached() || sel.isCustomSelection()||
          sel.isNodeSelection() || sel.isContainerSelection()) {
        return true
      }

      if (this.config.disableCollapsedCursor && sel.isCollapsed()) {
        return true
      }

      return false
    };



    AnnotationCommand.prototype.canCreate = function canCreate (annos, sel) {
      return (annos.length === 0 && !sel.isCollapsed())
    };


    AnnotationCommand.prototype.canFuse = function canFuse (annos, sel) {

      return (annos.length >= 2 && !sel.isCollapsed())
    };


    AnnotationCommand.prototype.canDelete = function canDelete (annos, sel) {

      if (annos.length !== 1) { return false }
      var annoSel = annos[0].getSelection();
      return sel.isInsideOf(annoSel)
    };


    AnnotationCommand.prototype.canExpand = function canExpand (annos, sel) {

      if (annos.length !== 1) { return false }
      var annoSel = annos[0].getSelection();
      return sel.overlaps(annoSel) && !sel.isInsideOf(annoSel)
    };


    AnnotationCommand.prototype.canTruncate = function canTruncate (annos, sel) {
      if (annos.length !== 1) { return false }
      var annoSel = annos[0].getSelection();

      return (sel.isLeftAlignedWith(annoSel) || sel.isRightAlignedWith(annoSel)) &&
          !sel.contains(annoSel) &&
          !sel.isCollapsed()
    };


    AnnotationCommand.prototype.getCommandState = function getCommandState (params) {

      var sel = this._getSelection(params);



      if (this.isDisabled(sel)) {
        return {
          disabled: true
        }
      }
      var annos = this._getAnnotationsForSelection(params);
      var newState = {
        disabled: false,
        active: false,
        mode: null
      };
      if (this.canCreate(annos, sel)) {
        newState.mode = 'create';
      } else if (this.canFuse(annos, sel)) {
        newState.mode = 'fuse';
      } else if (this.canTruncate(annos, sel)) {
        newState.active = true;
        newState.mode = 'truncate';
      } else if (this.canExpand(annos, sel)) {
        newState.mode = 'expand';
      } else if (this.canDelete(annos, sel)) {
        newState.active = true;
        newState.mode = 'delete';
      } else {
        newState.disabled = true;
      }
      return newState
    };



    AnnotationCommand.prototype.execute = function execute (params) {



      var commandState = params.commandState;

      if (commandState.disabled) { return false }
      switch(commandState.mode) {
        case 'create':
          return this.executeCreate(params)
        case 'fuse':
          return this.executeFuse(params)
        case 'truncate':
          return this.executeTruncate(params)
        case 'expand':
          return this.executeExpand(params)
        case 'delete':
          return this.executeDelete(params)
        default:
          console.warn('Command.execute(): unknown mode', commandState.mode);
          return false
      }
    };

    AnnotationCommand.prototype.executeCreate = function executeCreate (params) {
      var annos = this._getAnnotationsForSelection(params);
      this._checkPrecondition(params, annos, this.canCreate);
      var editorSession = this._getEditorSession(params);
      var annoData = this.getAnnotationData();
      annoData.type = this.getAnnotationType();
      var anno;
      editorSession.transaction(function (tx) {
        anno = tx.annotate(annoData);
      });
      return {
        mode: 'create',
        anno: anno
      }
    };

    AnnotationCommand.prototype.executeFuse = function executeFuse (params) {
      var annos = this._getAnnotationsForSelection(params);
      this._checkPrecondition(params, annos, this.canFuse);
      this._applyTransform(params, function(tx) {
        annotationHelpers.fuseAnnotation(tx, annos);
      });
      return {
        mode: 'fuse',
        anno: annos[0]
      }
    };

    AnnotationCommand.prototype.executeTruncate = function executeTruncate (params) {
      var annos = this._getAnnotationsForSelection(params);
      var anno = annos[0];
      this._checkPrecondition(params, annos, this.canTruncate);
      this._applyTransform(params, function(tx) {
        annotationHelpers.truncateAnnotation(tx, anno, params.selection);
      });
      return {
        mode: 'truncate',
        anno: anno
      }
    };

    AnnotationCommand.prototype.executeExpand = function executeExpand (params) {
      var annos = this._getAnnotationsForSelection(params);
      var anno = annos[0];
      this._checkPrecondition(params, annos, this.canExpand);
      this._applyTransform(params, function(tx) {
        annotationHelpers.expandAnnotation(tx, anno, params.selection);
      });
      return {
        mode: 'expand',
        anno: anno
      }
    };

    AnnotationCommand.prototype.executeDelete = function executeDelete (params) {
      var annos = this._getAnnotationsForSelection(params);
      var anno = annos[0];
      this._checkPrecondition(params, annos, this.canDelete);
      this._applyTransform(params, function(tx) {
        return tx.delete(anno.id)
      });
      return {
        mode: 'delete',
        annoId: anno.id
      }
    };

    AnnotationCommand.prototype._checkPrecondition = function _checkPrecondition (params, annos, checker) {
      var sel = this._getSelection(params);
      if (!checker.call(this, annos, sel)) {
        throw new Error("AnnotationCommand: can't execute command for selection " + sel.toString())
      }
    };

    AnnotationCommand.prototype._getAnnotationsForSelection = function _getAnnotationsForSelection (params) {
      return params.selectionState.getAnnotationsForType(this.getAnnotationType())
    };


    AnnotationCommand.prototype._applyTransform = function _applyTransform (params, transformFn) {
      var sel = this._getSelection(params);
      if (sel.isNull()) { return }

      var editorSession = this._getEditorSession(params);
      var result;
      editorSession.setSelection(sel);
      editorSession.transaction(function(tx) {
        var out = transformFn(tx, params);
        if (out) { result = out.result; }
      });
      return result
    };

    return AnnotationCommand;
  }(Command));

  var AnnotationTool = (function (Tool$$1) {
    function AnnotationTool () {
      Tool$$1.apply(this, arguments);
    }

    if ( Tool$$1 ) AnnotationTool.__proto__ = Tool$$1;
    AnnotationTool.prototype = Object.create( Tool$$1 && Tool$$1.prototype );
    AnnotationTool.prototype.constructor = AnnotationTool;

    AnnotationTool.prototype.render = function render ($$) {
      var el = Tool$$1.prototype.render.call(this, $$);
      el.addClass('sm-annotation-tool');
      return el
    };

    AnnotationTool.prototype.renderButton = function renderButton ($$) {
      var el = Tool$$1.prototype.renderButton.call(this, $$);
      el.append(this.renderMode($$));
      return el
    };


    AnnotationTool.prototype.renderMode = function renderMode ($$) {
      var mode = this.props.mode;
      var el = $$('div').addClass('se-mode');

      var iconEl = this.context.iconProvider.renderIcon($$, mode);
      if (iconEl) {
        el.append(iconEl);
      }
      return el
    };

    return AnnotationTool;
  }(Tool));

  var Codeblock = (function (TextBlock$$1) {
    function Codeblock () {
      TextBlock$$1.apply(this, arguments);
    }if ( TextBlock$$1 ) Codeblock.__proto__ = TextBlock$$1;
    Codeblock.prototype = Object.create( TextBlock$$1 && TextBlock$$1.prototype );
    Codeblock.prototype.constructor = Codeblock;



    return Codeblock;
  }(TextBlock));

  Codeblock.type = "codeblock";

  var Emphasis = (function (PropertyAnnotation$$1) {
    function Emphasis () {
      PropertyAnnotation$$1.apply(this, arguments);
    }if ( PropertyAnnotation$$1 ) Emphasis.__proto__ = PropertyAnnotation$$1;
    Emphasis.prototype = Object.create( PropertyAnnotation$$1 && PropertyAnnotation$$1.prototype );
    Emphasis.prototype.constructor = Emphasis;



    return Emphasis;
  }(PropertyAnnotation));

  Emphasis.type = "emphasis";


  Emphasis.fragmentation = Fragmenter.ANY;

  var EmphasisHTMLConverter = {

    type: 'emphasis',
    tagName: 'em',

    matchElement: function(el) {
      return el.is('em, i')
    }

  };

  var EmphasisComponent = (function (AnnotationComponent$$1) {
    function EmphasisComponent () {
      AnnotationComponent$$1.apply(this, arguments);
    }

    if ( AnnotationComponent$$1 ) EmphasisComponent.__proto__ = AnnotationComponent$$1;
    EmphasisComponent.prototype = Object.create( AnnotationComponent$$1 && AnnotationComponent$$1.prototype );
    EmphasisComponent.prototype.constructor = EmphasisComponent;

    EmphasisComponent.prototype.getTagName = function getTagName () {
      return 'em'
    };

    return EmphasisComponent;
  }(AnnotationComponent));

  var EmphasisPackage = {
    name: 'emphasis',
    configure: function(config, ref) {
      var toolGroup = ref.toolGroup;
      var disableCollapsedCursor = ref.disableCollapsedCursor;

      config.addNode(Emphasis);
      config.addConverter('html', EmphasisHTMLConverter);
      config.addConverter('xml', EmphasisHTMLConverter);
      config.addComponent('emphasis', EmphasisComponent);
      config.addCommand('emphasis', AnnotationCommand, {
        nodeType: Emphasis.type,
        disableCollapsedCursor: disableCollapsedCursor
      });
      config.addTool('emphasis', AnnotationTool, {
        toolGroup: toolGroup || 'annotations'
      });
      config.addIcon('emphasis', { 'fontawesome': 'fa-italic' });
      config.addLabel('emphasis', {
        en: 'Emphasis',
        de: 'Betonung'
      });
      if (platform.isMac) {
        config.addKeyboardShortcut('cmd+i', { command: 'emphasis' });
      } else {
        config.addKeyboardShortcut('ctrl+i', { command: 'emphasis' });
      }
    },
    Emphasis: Emphasis,
    EmphasisHTMLConverter: EmphasisHTMLConverter
  };

  var ImageNode = (function (DocumentNode$$1) {
    function ImageNode () {
      DocumentNode$$1.apply(this, arguments);
    }

    if ( DocumentNode$$1 ) ImageNode.__proto__ = DocumentNode$$1;
    ImageNode.prototype = Object.create( DocumentNode$$1 && DocumentNode$$1.prototype );
    ImageNode.prototype.constructor = ImageNode;

    ImageNode.prototype.getImageFile = function getImageFile () {
      if (this.imageFile) {
        return this.document.get(this.imageFile)
      }
    };

    ImageNode.prototype.getUrl = function getUrl () {
      var imageFile = this.getImageFile();
      if (imageFile) {
        return imageFile.getUrl()
      }
    };

    return ImageNode;
  }(DocumentNode));

  ImageNode.schema = {
    type: 'image',
    imageFile: { type: 'file' }
  };

  var DefaultFileProxy = (function (FileProxy$$1) {
    function DefaultFileProxy(fileNode, context) {
      FileProxy$$1.call(this, fileNode, context);


      this.file = fileNode.sourceFile;
      if (this.file) {
        this._fileUrl = URL.createObjectURL(this.file);
      }
      this.url = fileNode.url;
    }

    if ( FileProxy$$1 ) DefaultFileProxy.__proto__ = FileProxy$$1;
    DefaultFileProxy.prototype = Object.create( FileProxy$$1 && FileProxy$$1.prototype );
    DefaultFileProxy.prototype.constructor = DefaultFileProxy;

    DefaultFileProxy.prototype.getUrl = function getUrl () {

      if (this.url) {
        return this.url
      }

      if (this._fileUrl) {
        return this._fileUrl
      }

      return ''
    };

    DefaultFileProxy.prototype.sync = function sync () {
      if (!this.url) {
        console.info('Simulating file upload. Creating blob url instead.', this._fileUrl);
        this.url = this._fileUrl;
      }
      return Promise.resolve()
    };

    return DefaultFileProxy;
  }(FileProxy));

  var ImageProxy = (function (DefaultFileProxy$$1) {
    function ImageProxy () {
      DefaultFileProxy$$1.apply(this, arguments);
    }if ( DefaultFileProxy$$1 ) ImageProxy.__proto__ = DefaultFileProxy$$1;
    ImageProxy.prototype = Object.create( DefaultFileProxy$$1 && DefaultFileProxy$$1.prototype );
    ImageProxy.prototype.constructor = ImageProxy;



    return ImageProxy;
  }(DefaultFileProxy));


  ImageProxy.match = function(fileNode) {
    return fileNode.fileType === 'image'
  };

  var InlineWrapper = (function (InlineNode$$1) {
    function InlineWrapper () {
      InlineNode$$1.apply(this, arguments);
    }

    if ( InlineNode$$1 ) InlineWrapper.__proto__ = InlineNode$$1;
    InlineWrapper.prototype = Object.create( InlineNode$$1 && InlineNode$$1.prototype );
    InlineWrapper.prototype.constructor = InlineWrapper;

    InlineWrapper.prototype.getWrappedNode = function getWrappedNode () {
      return this.getDocument().get(this.wrappedNode)
    };

    return InlineWrapper;
  }(InlineNode));

  InlineWrapper.schema = {
    type: 'inline-wrapper',
    wrappedNode: 'id'
  };

  var Paragraph = (function (TextBlock$$1) {
    function Paragraph () {
      TextBlock$$1.apply(this, arguments);
    }if ( TextBlock$$1 ) Paragraph.__proto__ = TextBlock$$1;
    Paragraph.prototype = Object.create( TextBlock$$1 && TextBlock$$1.prototype );
    Paragraph.prototype.constructor = Paragraph;



    return Paragraph;
  }(TextBlock));

  Paragraph.type = "paragraph";

  var ParagraphComponent = (function (TextBlockComponent$$1) {
    function ParagraphComponent () {
      TextBlockComponent$$1.apply(this, arguments);
    }

    if ( TextBlockComponent$$1 ) ParagraphComponent.__proto__ = TextBlockComponent$$1;
    ParagraphComponent.prototype = Object.create( TextBlockComponent$$1 && TextBlockComponent$$1.prototype );
    ParagraphComponent.prototype.constructor = ParagraphComponent;

    ParagraphComponent.prototype.render = function render ($$) {
      var el = TextBlockComponent$$1.prototype.render.call(this, $$);
      return el.addClass('sc-paragraph')
    };

    ParagraphComponent.prototype.getTagName = function getTagName () {
      return 'p'
    };

    return ParagraphComponent;
  }(TextBlockComponent));

  var ParagraphHTMLConverter = {

    type: 'paragraph',
    tagName: 'p',

    import: function(el, node, converter) {
      node.content = converter.annotatedText(el, [node.id, 'content']);
    },

    export: function(node, el, converter) {
      el.append(converter.annotatedText([node.id, 'content']));
    }

  };

  var ParagraphPackage = {
    name: 'paragraph',
    configure: function(config) {
      config.addNode(Paragraph);
      config.addComponent(Paragraph.type, ParagraphComponent);
      config.addConverter('html', ParagraphHTMLConverter);
      config.addConverter('xml', ParagraphHTMLConverter);
      config.addTextType({
        name: 'paragraph',
        data: {type: 'paragraph'}
      });
      config.addLabel('paragraph', {
        en: 'Paragraph',
        de: 'Paragraph'
      });
      config.addLabel('paragraph.content', {
        en: 'Paragraph',
        de: 'Paragraph'
      });
    },
    Paragraph: Paragraph,
    ParagraphComponent: ParagraphComponent,
    ParagraphHTMLConverter: ParagraphHTMLConverter
  };

  var Strong = (function (PropertyAnnotation$$1) {
    function Strong () {
      PropertyAnnotation$$1.apply(this, arguments);
    }if ( PropertyAnnotation$$1 ) Strong.__proto__ = PropertyAnnotation$$1;
    Strong.prototype = Object.create( PropertyAnnotation$$1 && PropertyAnnotation$$1.prototype );
    Strong.prototype.constructor = Strong;



    return Strong;
  }(PropertyAnnotation));

  Strong.type = "strong";



  Strong.fragmentation = Fragmenter.ANY;

  var StrongHTMLConverter = {

    type: "strong",
    tagName: "strong",

    matchElement: function(el) {
      return el.is("strong, b")
    }

  };

  var StrongComponent = (function (AnnotationComponent$$1) {
    function StrongComponent () {
      AnnotationComponent$$1.apply(this, arguments);
    }

    if ( AnnotationComponent$$1 ) StrongComponent.__proto__ = AnnotationComponent$$1;
    StrongComponent.prototype = Object.create( AnnotationComponent$$1 && AnnotationComponent$$1.prototype );
    StrongComponent.prototype.constructor = StrongComponent;

    StrongComponent.prototype.getTagName = function getTagName () {
      return 'strong'
    };

    return StrongComponent;
  }(AnnotationComponent));

  var StrongPackage = {
    name: 'strong',
    configure: function(config, ref) {
      var toolGroup = ref.toolGroup;
      var disableCollapsedCursor = ref.disableCollapsedCursor;

      config.addNode(Strong);
      config.addConverter('html', StrongHTMLConverter);
      config.addConverter('xml', StrongHTMLConverter);
      config.addComponent('strong', StrongComponent);

      config.addCommand('strong', AnnotationCommand, {
        nodeType: 'strong',
        disableCollapsedCursor: disableCollapsedCursor
      });
      config.addTool('strong', AnnotationTool, {
        toolGroup: toolGroup || 'annotations'
      });
      config.addIcon('strong', { 'fontawesome': 'fa-bold' });
      config.addLabel('strong', {
        en: 'Strong',
        de: 'Fett'
      });
      if (platform.isMac) {
        config.addKeyboardShortcut('cmd+b', { command: 'strong' });
      } else {
        config.addKeyboardShortcut('ctrl+b', { command: 'strong' });
      }
    },
    Strong: Strong,
    StrongHTMLConverter: StrongHTMLConverter
  };

  var Subscript = (function (PropertyAnnotation$$1) {
    function Subscript () {
      PropertyAnnotation$$1.apply(this, arguments);
    }if ( PropertyAnnotation$$1 ) Subscript.__proto__ = PropertyAnnotation$$1;
    Subscript.prototype = Object.create( PropertyAnnotation$$1 && PropertyAnnotation$$1.prototype );
    Subscript.prototype.constructor = Subscript;



    return Subscript;
  }(PropertyAnnotation));

  Subscript.type = 'subscript';


  Subscript.fragmentation = Fragmenter.ANY;

  var Superscript = (function (PropertyAnnotation$$1) {
    function Superscript () {
      PropertyAnnotation$$1.apply(this, arguments);
    }if ( PropertyAnnotation$$1 ) Superscript.__proto__ = PropertyAnnotation$$1;
    Superscript.prototype = Object.create( PropertyAnnotation$$1 && PropertyAnnotation$$1.prototype );
    Superscript.prototype.constructor = Superscript;



    return Superscript;
  }(PropertyAnnotation));

  Superscript.type = 'superscript';


  Superscript.fragmentation = Fragmenter.ANY;

  var Heading = (function (TextBlock$$1) {
    function Heading () {
      TextBlock$$1.apply(this, arguments);
    }if ( TextBlock$$1 ) Heading.__proto__ = TextBlock$$1;
    Heading.prototype = Object.create( TextBlock$$1 && TextBlock$$1.prototype );
    Heading.prototype.constructor = Heading;



    return Heading;
  }(TextBlock));

  Heading.schema = {
    type: "heading",
    level: { type: "number", default: 1 }
  };

  var HeadingComponent = (function (TextBlockComponent$$1) {
    function HeadingComponent () {
      TextBlockComponent$$1.apply(this, arguments);
    }

    if ( TextBlockComponent$$1 ) HeadingComponent.__proto__ = TextBlockComponent$$1;
    HeadingComponent.prototype = Object.create( TextBlockComponent$$1 && TextBlockComponent$$1.prototype );
    HeadingComponent.prototype.constructor = HeadingComponent;

    HeadingComponent.prototype.render = function render ($$) {
      var el = TextBlockComponent$$1.prototype.render.call(this, $$);
      return el.addClass("sc-heading sm-level-"+this.props.node.level)
    };

    HeadingComponent.prototype.getTagName = function getTagName () {
      return 'h'+this.props.node.level
    };

    return HeadingComponent;
  }(TextBlockComponent));

  var HeadingHTMLConverter = {

    type: "heading",

    matchElement: function(el) {
      return /^h\d$/.exec(el.tagName)
    },

    import: function(el, node, converter) {
      node.level = Number(el.tagName[1]);
      node.content = converter.annotatedText(el, [node.id, 'content']);
    },

    export: function(node, el, converter) {
      el.tagName = 'h'+node.level;
      el.append(
          converter.annotatedText([node.id, 'content'])
      );
    }

  };

  var HeadingPackage = {
    name: 'heading',
    configure: function(config) {
      config.addNode(Heading);
      config.addComponent(Heading.type, HeadingComponent);
      config.addConverter('html', HeadingHTMLConverter);
      config.addConverter('xml', HeadingHTMLConverter);
      config.addTextType({
        name: 'heading1',
        data: {type: 'heading', level: 1}
      });
      config.addTextType({
        name: 'heading2',
        data: {type: 'heading', level: 2}
      });
      config.addTextType({
        name: 'heading3',
        data: {type: 'heading', level: 3}
      });
      config.addLabel('heading1', {
        en: 'Heading 1',
        de: 'Überschrift 1'
      });
      config.addLabel('heading2', {
        en: 'Heading 2',
        de: 'Überschrift 2'
      });
      config.addLabel('heading3', {
        en: 'Heading 3',
        de: 'Überschrift 3'
      });
    },
    Heading: Heading,
    HeadingComponent: HeadingComponent,
    HeadingHTMLConverter: HeadingHTMLConverter
  };

  var SwitchTextTypeTool = (function (Tool$$1) {
    function SwitchTextTypeTool() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      Tool$$1.apply(this, args);


      this._navIdx = -1;
    }

    if ( Tool$$1 ) SwitchTextTypeTool.__proto__ = Tool$$1;
    SwitchTextTypeTool.prototype = Object.create( Tool$$1 && Tool$$1.prototype );
    SwitchTextTypeTool.prototype.constructor = SwitchTextTypeTool;




    SwitchTextTypeTool.prototype.didMount = function didMount () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      Tool$$1.prototype.didMount.apply(this, args);
      this._focusToggle();
    };

    SwitchTextTypeTool.prototype.render = function render ($$) {
      var labelProvider = this.context.labelProvider;
      var textTypeName = 'No selection';

      if (this.props.currentTextType) {
        textTypeName = this.props.currentTextType.name;
      }
      var el = $$('div').addClass('sc-switch-text-type');

      var toggleButton = $$('button').ref('toggle')
          .addClass('se-toggle')
          .attr('title', labelProvider.getLabel('switch_text'))
          .append(labelProvider.getLabel(textTypeName))
          .on('click', this.toggleAvailableTextTypes);

      if (this.props.disabled || !this.props.currentTextType) {
        el.addClass('sm-disabled');
        toggleButton.attr('tabindex', -1);
      } else {
        toggleButton.attr('tabindex', 1);
      }

      el.append(toggleButton);

      if (this.state.open) {
        el.addClass('sm-open');


        var options = $$('div').addClass("se-options").ref('options');
        forEach(this.props.textTypes, function(textType) {
          var button = $$('button')
              .addClass('se-option sm-'+textType.name)
              .attr('data-type', textType.name)
              .append(labelProvider.getLabel(textType.name))
              .on('click', this.handleClick);
          options.append(button);
        }.bind(this));
        el.append(options);
        el.on('keydown', this.onKeydown);
      }

      return el
    };

    SwitchTextTypeTool.prototype.didUpdate = function didUpdate () {
      this._focusToggle();
    };

    SwitchTextTypeTool.prototype._focusToggle = function _focusToggle () {
      if (this.state.open) {
        this.refs.toggle.el.focus();
      }
    };

    SwitchTextTypeTool.prototype.executeCommand = function executeCommand (textType) {
      this.context.commandManager.executeCommand(this.getCommandName(), {
        textType: textType
      });
    };

    SwitchTextTypeTool.prototype.getTextCommands = function getTextCommands () {
      var surface = this.getSurface();
      if (!this.textCommands && surface) {
        this.textCommands = surface.getTextCommands();
      }
      return this.textCommands || {}
    };

    SwitchTextTypeTool.prototype.handleClick = function handleClick (e) {
      e.preventDefault();


      this.executeCommand(e.currentTarget.dataset.type);
    };

    SwitchTextTypeTool.prototype.onKeydown = function onKeydown (event) {
      var handled = false;
      switch (event.keyCode) {
        case keys.UP:
          this._nav(-1);
          handled = true;
          break
        case keys.DOWN:
          this._nav(1);
          handled = true;
          break
        case keys.ESCAPE:
          this.toggleDropdown();
          handled = true;
          break
        default:

      }
      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    SwitchTextTypeTool.prototype.toggleAvailableTextTypes = function toggleAvailableTextTypes (e) {
      e.preventDefault();
      e.stopPropagation();
      if (this.props.disabled) { return }



      this.toggleDropdown();
    };

    SwitchTextTypeTool.prototype.toggleDropdown = function toggleDropdown () {

      this._navIdx = -1;
      this.extendState({
        open: !this.state.open
      });
    };

    SwitchTextTypeTool.prototype._nav = function _nav (step) {
      this._navIdx += step;
      this._navIdx = Math.max(0, this._navIdx);
      this._navIdx = Math.min(this._getOptionsCount()-1, this._navIdx);

      if (this._navIdx >= 0) {
        var option = this.refs.options.children[this._navIdx];
        option.focus();
      }
    };

    SwitchTextTypeTool.prototype._getOptionsCount = function _getOptionsCount () {
      return this.refs.options.children.length
    };

    return SwitchTextTypeTool;
  }(Tool));

  SwitchTextTypeTool.command = 'switch-text-type';

  var SwitchTextTypeCommand = (function (Command$$1) {
    function SwitchTextTypeCommand () {
      Command$$1.apply(this, arguments);
    }

    if ( Command$$1 ) SwitchTextTypeCommand.__proto__ = Command$$1;
    SwitchTextTypeCommand.prototype = Object.create( Command$$1 && Command$$1.prototype );
    SwitchTextTypeCommand.prototype.constructor = SwitchTextTypeCommand;

    SwitchTextTypeCommand.prototype.getTextTypes = function getTextTypes (params) {
      var surface = params.surface;
      if (surface && surface.isContainerEditor()) {
        return surface.getTextTypes()
      } else {
        return []
      }
    };

    SwitchTextTypeCommand.prototype.getTextType = function getTextType (params) {
      var textTypes = this.getTextTypes(params);
      return find(textTypes, function(t) {
        return t.name === params.textType
      })
    };



    SwitchTextTypeCommand.prototype.getCurrentTextType = function getCurrentTextType (params, node) {
      var textTypes = this.getTextTypes(params);
      var currentTextType;
      textTypes.forEach(function(textType) {
        var nodeProps = clone(textType.data);
        delete nodeProps.type;
        if (isMatch(node, nodeProps) && node.type === textType.data.type) {
          currentTextType = textType;
        }
      });
      return currentTextType
    };

    SwitchTextTypeCommand.prototype.isDisabled = function isDisabled (ref) {
      var selection = ref.selection;
      var surface = ref.surface;

      if (!surface || !surface.isEnabled() || selection.isNull()) {
        return true
      }

      if (selection && this.config.disableCollapsedCursor && selection.isCollapsed()) {
        return true
      }
      return false
    };

    SwitchTextTypeCommand.prototype.getCommandState = function getCommandState (params) {
      var doc = params.editorSession.getDocument();
      var sel = params.selection;

      var node;
      var newState = {
        disabled: false,
        textTypes: this.getTextTypes(params)
      };

      if (this.isDisabled(params)) {
        newState.disabled = true;
      } else if (sel.isContainerSelection()) {
        newState.disabled = true;
        newState.currentTextType = {name: 'container-selection'};
      } else if (sel.isPropertySelection()) {
        var path = sel.getPath();
        node = doc.get(path[0]);


        if (node) {
          if (node.isText() && node.isBlock()) {
            newState.currentTextType = this.getCurrentTextType(params, node);
          }
          if (!newState.currentTextType) {



            newState.currentTextType = {name: [node.type, path[1]].join('.')};
            newState.disabled = true;
          }
        }
      } else if (sel.isNodeSelection()) {
        node = doc.get(sel.getNodeId());
        newState.currentTextType = {name: node.type};
        newState.disabled = true;
      } else if (sel.isCustomSelection()) {
        newState.currentTextType = {name: 'custom'};
        newState.disabled = true;
      }
      return newState
    };


    SwitchTextTypeCommand.prototype.execute = function execute (params) {
      var textType = this.getTextType(params);
      var nodeData = textType.data;
      var surface = params.surface;
      var editorSession = params.editorSession;
      if (!surface) {
        console.warn('No focused surface. Stopping command execution.');
        return
      }
      editorSession.transaction(function(tx) {
        return tx.switchTextType(nodeData)
      });
      return nodeData
    };

    return SwitchTextTypeCommand;
  }(Command));

  var Link = (function (PropertyAnnotation$$1) {
    function Link () {
      PropertyAnnotation$$1.apply(this, arguments);
    }if ( PropertyAnnotation$$1 ) Link.__proto__ = PropertyAnnotation$$1;
    Link.prototype = Object.create( PropertyAnnotation$$1 && PropertyAnnotation$$1.prototype );
    Link.prototype.constructor = Link;



    return Link;
  }(PropertyAnnotation));

  Link.schema = {
    type: "link",
    title: { type: 'string', optional: true },
    url: { type: 'string', 'default': ''}
  };


  Link.fragmentation = Fragmenter.SHOULD_NOT_SPLIT;

  var LinkComponent = (function (AnnotationComponent$$1) {
    function LinkComponent () {
      AnnotationComponent$$1.apply(this, arguments);
    }

    if ( AnnotationComponent$$1 ) LinkComponent.__proto__ = AnnotationComponent$$1;
    LinkComponent.prototype = Object.create( AnnotationComponent$$1 && AnnotationComponent$$1.prototype );
    LinkComponent.prototype.constructor = LinkComponent;

    LinkComponent.prototype.didMount = function didMount () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      AnnotationComponent$$1.prototype.didMount.apply(this, args);

      var node = this.props.node;
      this.context.editorSession.onRender('document', this.rerender, this, {
        path: [node.id, 'url']
      });
    };

    LinkComponent.prototype.dispose = function dispose () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      AnnotationComponent$$1.prototype.dispose.apply(this, args);

      this.context.editorSession.off(this);
    };

    LinkComponent.prototype.render = function render ($$) {
      var el = AnnotationComponent$$1.prototype.render.call(this, $$);

      el.tagName = 'a';
      el.attr('href', this.props.node.url);

      var titleComps = [this.props.node.url];
      if (this.props.node.title) {
        titleComps.push(this.props.node.title);
      }

      return el.attr("title", titleComps.join(' | '))
    };

    return LinkComponent;
  }(AnnotationComponent));

  var LinkCommand = (function (AnnotationCommand$$1) {
    function LinkCommand () {
      AnnotationCommand$$1.apply(this, arguments);
    }

    if ( AnnotationCommand$$1 ) LinkCommand.__proto__ = AnnotationCommand$$1;
    LinkCommand.prototype = Object.create( AnnotationCommand$$1 && AnnotationCommand$$1.prototype );
    LinkCommand.prototype.constructor = LinkCommand;

    LinkCommand.prototype.canFuse = function canFuse () { return false };


    LinkCommand.prototype.executeCreate = function executeCreate (params) {
      var result = AnnotationCommand$$1.prototype.executeCreate.call(this, params);
      var editorSession = this._getEditorSession(params);
      editorSession.transaction(function (tx) {
        tx.setSelection(tx.selection.collapse());
      });
      return result
    };

    return LinkCommand;
  }(AnnotationCommand));

  var LinkXMLConverter = {

    type: "link",
    tagName: 'a',

    import: function(el, node) {
      node.url = el.attr('href');
      node.title = el.attr('title');
    },

    export: function(link, el) {
      el.attr({
        href: link.url,
        title: link.title
      });
    }

  };

  var EditLinkTool = (function (Tool$$1) {
    function EditLinkTool () {
      Tool$$1.apply(this, arguments);
    }

    if ( Tool$$1 ) EditLinkTool.__proto__ = Tool$$1;
    EditLinkTool.prototype = Object.create( Tool$$1 && Tool$$1.prototype );
    EditLinkTool.prototype.constructor = EditLinkTool;

    EditLinkTool.prototype.getUrlPath = function getUrlPath () {
      var propPath = this.constructor.urlPropertyPath;
      return [this.props.node.id].concat(propPath)
    };

    EditLinkTool.prototype._openLink = function _openLink () {
      var doc = this.context.editorSession.getDocument();
      window.open(doc.get(this.getUrlPath()), '_blank');
    };

    EditLinkTool.prototype.render = function render ($$) {
      var Input = this.getComponent('input');
      var Button = this.getComponent('button');
      var el = $$('div').addClass('sc-edit-link-tool');


      if (this.props.disabled) {
        console.warn('Tried to render EditLinkTool while disabled.');
        return el
      }

      var urlPath = this.getUrlPath();

      el.append(
          $$(Input, {
            type: 'url',
            path: urlPath,
            placeholder: 'Paste or type a link url'
          }),
          $$(Button, {
            icon: 'open-link',
            style: this.props.style
          }).attr('title', this.getLabel('open-link'))
              .on('click', this._openLink),

          $$(Button, {
            icon: 'delete',
            style: this.props.style
          }).attr('title', this.getLabel('delete-link'))
              .on('click', this.onDelete)
      );
      return el
    };

    EditLinkTool.prototype.onDelete = function onDelete (e) {
      e.preventDefault();
      var node = this.props.node;
      var sm = this.context.surfaceManager;
      var surface = sm.getFocusedSurface();
      if (!surface) {
        console.warn('No focused surface. Stopping command execution.');
        return
      }
      var editorSession = this.context.editorSession;
      editorSession.transaction(function(tx, args) {
        tx.delete(node.id);
        return args
      });
    };

    return EditLinkTool;
  }(Tool));

  EditLinkTool.urlPropertyPath = ['url'];

  var EditAnnotationCommand = (function (Command$$1) {
    function EditAnnotationCommand() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      Command$$1.apply(this, args);

      if (!this.config.nodeType) {
        throw new Error("'nodeType' is required")
      }
    }

    if ( Command$$1 ) EditAnnotationCommand.__proto__ = Command$$1;
    EditAnnotationCommand.prototype = Object.create( Command$$1 && Command$$1.prototype );
    EditAnnotationCommand.prototype.constructor = EditAnnotationCommand;


    EditAnnotationCommand.prototype.getCommandState = function getCommandState (params) {
      var sel = this._getSelection(params);
      var annos = this._getAnnotationsForSelection(params);
      var newState = {
        disabled: true,
      };
      if (annos.length === 1 && sel.isPropertySelection() && sel.isCollapsed()) {
        newState.disabled = false;
        newState.node = annos[0];
      }
      return newState
    };

    EditAnnotationCommand.prototype.execute = function execute (params) { };

    EditAnnotationCommand.prototype._getAnnotationsForSelection = function _getAnnotationsForSelection (params) {
      return params.selectionState.getAnnotationsForType(this.config.nodeType)
    };

    return EditAnnotationCommand;
  }(Command));

  var LinkPackage = {
    name: 'link',
    configure: function(config, ref) {
      var toolGroup = ref.toolGroup;
      var editLinkToolGroup = ref.editLinkToolGroup;
      var disableCollapsedCursor = ref.disableCollapsedCursor;

      config.addNode(Link);
      config.addComponent('link', LinkComponent);
      config.addConverter('html', LinkXMLConverter);
      config.addConverter('xml', LinkXMLConverter);
      config.addCommand('link', LinkCommand, {
        nodeType: 'link',
        disableCollapsedCursor: disableCollapsedCursor
      });
      config.addCommand('edit-link', EditAnnotationCommand, {
        nodeType: 'link'
      });
      config.addTool('link', AnnotationTool, {
        toolGroup: toolGroup || 'annotations'
      });
      config.addTool('edit-link', EditLinkTool, {
        toolGroup: editLinkToolGroup || 'overlay'
      });
      config.addIcon('link', { 'fontawesome': 'fa-link'});
      config.addIcon('open-link', { 'fontawesome': 'fa-external-link' });
      config.addLabel('link', {
        en: 'Link',
        de: 'Link'
      });
      config.addLabel('open-link', {
        en: 'Open Link',
        de: 'Link öffnen'
      });
      config.addLabel('delete-link', {
        en: 'Remove Link',
        de: 'Link löschen'
      });
      if (platform.isMac) {
        config.addKeyboardShortcut('cmd+k', { command: 'link' });
      } else {
        config.addKeyboardShortcut('ctrl+k', { command: 'link' });
      }
    },
    Link: Link,
    LinkComponent: LinkComponent,
    LinkCommand: LinkCommand,
    EditLinkTool: EditLinkTool,
  };

  var ListNode = (function (DocumentNode$$1) {
    function ListNode () {
      DocumentNode$$1.apply(this, arguments);
    }

    if ( DocumentNode$$1 ) ListNode.__proto__ = DocumentNode$$1;
    ListNode.prototype = Object.create( DocumentNode$$1 && DocumentNode$$1.prototype );
    ListNode.prototype.constructor = ListNode;

    var prototypeAccessors = { length: {} };

    ListNode.prototype.getItemAt = function getItemAt (idx) {
      return this.getDocument().get(this.items[idx])
    };

    ListNode.prototype.getFirstItem = function getFirstItem () {
      return this.getItemAt(0)
    };

    ListNode.prototype.getLastItem = function getLastItem () {
      return this.getItemAt(this.getLength()-1)
    };

    ListNode.prototype.getItems = function getItems () {
      var doc = this.getDocument();
      return this.items.map(function (id) {
        return doc.get(id)
      })
    };

    ListNode.prototype.getItemPosition = function getItemPosition (itemId) {
      if (itemId._isNode) { itemId = itemId.id; }
      var pos = this.items.indexOf(itemId);
      if (pos < 0) { throw new Error('Item is not within this list: ' + itemId) }
      return pos
    };

    ListNode.prototype.insertItemAt = function insertItemAt (pos, itemId) {
      var doc = this.getDocument();
      doc.update([this.id, 'items'], { type: 'insert', pos: pos, value: itemId });
    };

    ListNode.prototype.appendItem = function appendItem (itemId) {
      this.insertItemAt(this.items.length, itemId);
    };

    ListNode.prototype.removeItemAt = function removeItemAt (pos) {
      var doc = this.getDocument();
      doc.update([this.id, 'items'], { type: 'delete', pos: pos });
    };

    ListNode.prototype.remove = function remove (itemId) {
      var doc = this.getDocument();
      var pos = this.getItemPosition(itemId);
      if (pos >= 0) {
        doc.update([this.id, 'items'], { type: 'delete', pos: pos });
      }
    };

    ListNode.prototype.getLength = function getLength () {
      return this.items.length
    };

    prototypeAccessors.length.get = function () {
      return this.getLength()
    };

    Object.defineProperties( ListNode.prototype, prototypeAccessors );

    return ListNode;
  }(DocumentNode));

  ListNode.isList = true;

  ListNode.type = 'list';

  ListNode.schema = {
    ordered: { type: 'boolean', default: false },

    items: { type: [ 'array', 'id' ], default: [], owned: true }
  };

  var ListItem = (function (TextNode$$1) {
    function ListItem () {
      TextNode$$1.apply(this, arguments);
    }if ( TextNode$$1 ) ListItem.__proto__ = TextNode$$1;
    ListItem.prototype = Object.create( TextNode$$1 && TextNode$$1.prototype );
    ListItem.prototype.constructor = ListItem;



    return ListItem;
  }(TextNode));

  ListItem.type = 'list-item';

  ListItem.schema = {
    level: { type: "number", default: 1 }
  };

  var ListItemComponent = (function (TextPropertyComponent$$1) {
    function ListItemComponent () {
      TextPropertyComponent$$1.apply(this, arguments);
    }if ( TextPropertyComponent$$1 ) ListItemComponent.__proto__ = TextPropertyComponent$$1;
    ListItemComponent.prototype = Object.create( TextPropertyComponent$$1 && TextPropertyComponent$$1.prototype );
    ListItemComponent.prototype.constructor = ListItemComponent;



    return ListItemComponent;
  }(TextPropertyComponent));

  function getListTagName(node) {

    return node.ordered ? 'ol' : 'ul'
  }

  function renderListNode(node, rootEl, createElement) {
    var items = node.getItems();
    var stack = [rootEl];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.level<stack.length) {
        for (var j = stack.length; j > item.level; j--) {
          stack.pop();
        }
      } else if (item.level>stack.length) {
        for (var j$1 = stack.length; j$1 < item.level; j$1++) {

          var sublist = createElement(getListTagName(node));
          last$2(stack).append(sublist);
          stack.push(sublist);
        }
      }
      console.assert(item.level === stack.length, 'item.level should now be the same as stack.length');
      last$2(stack).append(
          createElement(item)
      );
    }
    for(var j$2=stack.length; j$2>1;j$2--) {
      stack.pop();
    }
  }

  var ListComponent = (function (Component$$1) {
    function ListComponent () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) ListComponent.__proto__ = Component$$1;
    ListComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
    ListComponent.prototype.constructor = ListComponent;

    ListComponent.prototype.didMount = function didMount () {
      this.context.editorSession.onRender('document', this._onChange, this);
    };

    ListComponent.prototype.render = function render ($$) {
      var node = this.props.node;
      var el = $$(getListTagName(node))
          .addClass('sc-list')
          .attr('data-id', node.id);
      renderListNode(node, el, function (arg) {
        if (isString(arg)) {
          return $$(arg)
        } else if(arg.type === 'list-item') {
          var item = arg;
          return $$(ListItemComponent, {
            path: [item.id, 'content'],
            node: item,
            tagName: 'li'
          })

              .ref(item.id)
        }
      });
      return el
    };

    ListComponent.prototype._onChange = function _onChange (change) {
      var this$1 = this;

      var node = this.props.node;
      if (change.isAffected(node.id)) {
        return this.rerender()
      }

      var itemIds = node.items;
      for (var i = 0; i < itemIds.length; i++) {
        if (change.isAffected([itemIds[i], 'level'])) {
          return this$1.rerender()
        }
      }
    };

    return ListComponent;
  }(Component));


  ListComponent.prototype._isCustomNodeComponent = true;

  var ListHTMLConverter = {

    type: "list",

    matchElement: function(el) {
      return el.is('ul') || el.is('ol')
    },

    import: function(el, node, converter) {
      var self = this;
      this._santizeNestedLists(el);
      if (el.is('ol')) {
        node.ordered = true;
      }
      var itemEls = el.findAll('li');
      itemEls.forEach(function(li) {

        var listItem = converter.convertElement(li);
        listItem.level = _getLevel(li);
        node.items.push(listItem.id);
      });
      function _getLevel(li) {
        var _el = li;
        var level = 1;
        while(_el) {
          if (_el.parentNode === el) { return level }
          _el = _el.parentNode;
          if (self.matchElement(_el)) { level++; }
        }
      }
    },

    export: function(node, el, converter) {
      var $$ = converter.$$;
      el.tagName = getListTagName(node);
      renderListNode(node, el, function (arg){
        if (isString(arg)) {
          return $$(arg)
        } else {
          var item = arg;
          return $$('li').append(converter.annotatedText(item.getTextPath()))
        }
      });
      return el
    },

    _santizeNestedLists: function _santizeNestedLists(root) {
      var nestedLists = root.findAll('ol,ul');
      nestedLists.forEach(function (el){
        while (!el.parentNode.is('ol,ul')) {

          var parent = el.parentNode;
          var grandParent = parent.parentNode;
          var pos = grandParent.getChildIndex(parent);
          grandParent.insertAt(pos+1, el);
        }
      });
    }
  };

  var ListItemHTMLConverter = {

    type: "list-item",

    matchElement: function(el) {
      return el.is('li')
    },

    import: function(el, node, converter) {
      node.content = converter.annotatedText(el, [node.id, 'content']);
    },

    export: function(node, el, converter) {
      el.append(converter.annotatedText(node.getTextPath()));
    }
  };

  var InsertListCommand = (function (Command$$1) {
    function InsertListCommand () {
      Command$$1.apply(this, arguments);
    }

    if ( Command$$1 ) InsertListCommand.__proto__ = Command$$1;
    InsertListCommand.prototype = Object.create( Command$$1 && Command$$1.prototype );
    InsertListCommand.prototype.constructor = InsertListCommand;

    InsertListCommand.prototype.getCommandState = function getCommandState (params) {
      var sel = this._getSelection(params);
      var commandState = {};
      var _disabledCollapsedCursor = this.config.disableCollapsedCursor && sel.isCollapsed();
      if (_disabledCollapsedCursor || !sel.isPropertySelection()) {
        commandState.disabled = true;
      }
      return commandState
    };
    InsertListCommand.prototype.execute = function execute (params) {
      var ordered = this.config.ordered;
      var editorSession = params.editorSession;
      editorSession.transaction(function (tx) {
        tx.toggleList({ ordered: ordered });
      });
    };

    return InsertListCommand;
  }(Command));

  var InsertListTool = (function (Tool$$1) {
    function InsertListTool () {
      Tool$$1.apply(this, arguments);
    }

    if ( Tool$$1 ) InsertListTool.__proto__ = Tool$$1;
    InsertListTool.prototype = Object.create( Tool$$1 && Tool$$1.prototype );
    InsertListTool.prototype.constructor = InsertListTool;

    InsertListTool.prototype.getClassNames = function getClassNames () {
      return 'sc-insert-list-tool'
    };
    InsertListTool.prototype.renderButton = function renderButton ($$) {
      var button = Tool$$1.prototype.renderButton.call(this, $$);
      return [ button ]
    };
    InsertListTool.prototype.onClick = function onClick () {
      this.executeCommand({
        context: this.context
      });
    };

    return InsertListTool;
  }(Tool));

  var ListPackage = {
    name: 'list',
    configure: function(config, ref) {
      var toolGroup = ref.toolGroup;
      var disableCollapsedCursor = ref.disableCollapsedCursor;

      config.addNode(ListNode);
      config.addNode(ListItem);
      config.addComponent('list', ListComponent);

      config.addCommand('insert-unordered-list', InsertListCommand, {
        nodeType: 'list',
        ordered: false,
        disableCollapsedCursor: disableCollapsedCursor
      });
      config.addTool('insert-unordered-list', InsertListTool, { toolGroup: toolGroup });
      config.addLabel('insert-unordered-list', {
        en: 'Unordered list',
        de: 'Aufzählung'
      });
      config.addIcon('insert-unordered-list', { 'fontawesome': 'fa-list-ul' });

      config.addCommand('insert-ordered-list', InsertListCommand, {
        nodeType: 'list',
        ordered: true,
        disableCollapsedCursor: disableCollapsedCursor
      });
      config.addTool('insert-ordered-list', InsertListTool, { toolGroup: toolGroup });
      config.addLabel('insert-ordered-list', {
        en: 'Ordered list',
        de: 'Nummerierte Liste'
      });
      config.addIcon('insert-ordered-list', { 'fontawesome': 'fa-list-ol' });

      config.addConverter('html', ListHTMLConverter);
      config.addConverter('html', ListItemHTMLConverter);
    }
  };

  var Table = (function (BlockNode$$1) {
    function Table () {
      BlockNode$$1.apply(this, arguments);
    }

    if ( BlockNode$$1 ) Table.__proto__ = BlockNode$$1;
    Table.prototype = Object.create( BlockNode$$1 && BlockNode$$1.prototype );
    Table.prototype.constructor = Table;

    Table.prototype.getRowCount = function getRowCount () {
      return this.cells.length
    };

    Table.prototype.getColCount = function getColCount () {
      if (this.cells.length > 0) {
        return this.cells[0].length
      } else {
        return 0
      }
    };

    Table.prototype.getCellAt = function getCellAt (row, col) {
      var cellId = this.cells[row][col];
      if (cellId) {
        return this.document.get(cellId)
      }
    };

    return Table;
  }(BlockNode));

  Table.schema = {
    type: 'table',
    cells: { type: ['array', 'array', 'id'], default: [], owned: true }
  };

  var TableCell = (function (TextNode$$1) {
    function TableCell () {
      TextNode$$1.apply(this, arguments);
    }if ( TextNode$$1 ) TableCell.__proto__ = TextNode$$1;
    TableCell.prototype = Object.create( TextNode$$1 && TextNode$$1.prototype );
    TableCell.prototype.constructor = TableCell;



    return TableCell;
  }(TextNode));

  TableCell.schema = {
    type: 'table-cell',
    rowspan: { type: 'number', default: 0 },
    colspan: { type: 'number', default: 0 }
  };

  function startsWith$2(str, prefix) {
    if (!isString(str)) { return false }
    if (str.startsWith) { return str.startsWith(prefix) }
    if (!isString(prefix)) { prefix = String(prefix); }
    return str.slice(0, prefix.length) === prefix
  }

  var ClipboardImporter = (function (HTMLImporter$$1) {
    function ClipboardImporter(config) {
      ClipboardImporter._addConverters(config);

      if (!config.schema) {
        throw new Error('Missing argument: config.schema is required.')
      }

      HTMLImporter$$1.call(this, config);

      this.IGNORE_DEFAULT_WARNINGS = true;

      extend(config, {
        trimWhitespaces: true,
        REMOVE_INNER_WS: true
      });



      this._isWindows = platform.isWindows;

      this._emptyDoc = this._createDocument(this.schema);
    }

    if ( HTMLImporter$$1 ) ClipboardImporter.__proto__ = HTMLImporter$$1;
    ClipboardImporter.prototype = Object.create( HTMLImporter$$1 && HTMLImporter$$1.prototype );
    ClipboardImporter.prototype.constructor = ClipboardImporter;


    ClipboardImporter.prototype.importDocument = function importDocument (html) {
      var body, el;

      if (this._isWindows) {


        var match = /<!--StartFragment-->(.*)<!--EndFragment-->/.exec(html);
        if (match) {
          html = match[1];
        }
      }




      if (html.search(/script id=.substance-clipboard./)>=0) {
        el = DefaultDOMElement.parseHTML(html);
        var substanceData = el.find('#substance-clipboard');
        if (substanceData) {
          var jsonStr = substanceData.textContent;
          try {
            return this.importFromJSON(jsonStr)
          } catch(err) {
            console.error(err);
          }
        }
      }

      el = DefaultDOMElement.parseHTML(html);
      if (isArray(el)) {
        body = this._createElement('body');
        body.append(el);
      } else {
        body = el.find('body');
      }
      if (!body) {
        body = this._createElement('body');
        body.append(el);
      }
      body = this._sanitizeBody(body);
      if (!body) {
        console.warn('Invalid HTML.');
        return null
      }

      this.reset();
      this.convertBody(body);
      var doc = this.generateDocument();
      return doc
    };

    ClipboardImporter.prototype._sanitizeBody = function _sanitizeBody (body) {
      body = this._fixupGoogleDocsBody(body);

      body.findAll('meta').forEach(function (el) { return el.remove(); });
      return body
    };

    ClipboardImporter.prototype._fixupGoogleDocsBody = function _fixupGoogleDocsBody (body) {
      if (!body) { return }




      var bold = body.find('b');
      if (bold && /^docs-internal/.exec(bold.id)) {
        return bold
      }
      return body
    };

    ClipboardImporter.prototype.importFromJSON = function importFromJSON (jsonStr) {
      var doc = this.createDocument();
      var jsonData = JSON.parse(jsonStr);
      var converter = new JSONConverter();
      converter.importDocument(doc, jsonData);
      return doc
    };


    ClipboardImporter.prototype.convertBody = function convertBody (body) {
      this.convertContainer(body.childNodes, Document.SNIPPET_ID);
    };

    ClipboardImporter.prototype._wrapInlineElementsIntoBlockElement = function _wrapInlineElementsIntoBlockElement (childIterator) {
      var this$1 = this;

      var wrapper = this._createElement('p');
      while(childIterator.hasNext()) {
        var el = childIterator.next();

        var blockTypeConverter = this$1._getConverterForElement(el, 'block');
        if (blockTypeConverter) {
          childIterator.back();
          break
        }
        wrapper.append(el.clone(true));
      }




      wrapper.attr('data-id', Document.TEXT_SNIPPET_ID);
      var node = this.defaultConverter(wrapper, this);
      if (node) {
        if (!node.type) {
          throw new Error('Contract: Html.defaultConverter() must return a node with type.')
        }
        this._createAndShow(node);
      }
      return node
    };


    ClipboardImporter.prototype.createDocument = function createDocument () {
      return this._emptyDoc.createSnippet()
    };

    ClipboardImporter.prototype._getUnsupportedNodeConverter = function _getUnsupportedNodeConverter () {

    };

    return ClipboardImporter;
  }(HTMLImporter));

  var CONVERTERS = {
    'catch-all-block': {
      type: 'paragraph',
      matchElement: function(el) { return el.is('div') },
      import: function(el, node, converter) {
        node.content = converter.annotatedText(el, [node.id, 'content']);
      }
    }
  };

  ClipboardImporter._addConverters = function(config) {
    if (config.converters) {
      var registry = new Registry();
      config.converters.forEach(function(conv, name) {
        registry.add(name, conv);
      });
      forEach(CONVERTERS, function(converter, name) {
        registry.add(name, converter);
      });
      config.converters = registry;
    }
  };

  var ClipboardExporter = (function (HtmlExporter) {
    function ClipboardExporter () {
      HtmlExporter.apply(this, arguments);
    }

    if ( HtmlExporter ) ClipboardExporter.__proto__ = HtmlExporter;
    ClipboardExporter.prototype = Object.create( HtmlExporter && HtmlExporter.prototype );
    ClipboardExporter.prototype.constructor = ClipboardExporter;

    ClipboardExporter.prototype.exportDocument = function exportDocument (doc) {
      this.state.doc = doc;
      var html;
      var elements = this.convertDocument(doc);

      if (elements.length === 1 && elements[0].attr('data-id') === Document.TEXT_SNIPPET_ID) {
        html = elements[0].innerHTML;
      } else {
        html = elements.map(function(el) {
          return el.outerHTML
        }).join('');
      }
      var jsonConverter = new JSONConverter();
      var jsonStr = JSON.stringify(jsonConverter.exportDocument(doc));
      var substanceContent = "<script id=\"substance-clipboard\" type=\"application/json\">" + jsonStr + "</script>";
      return '<html><head>' +substanceContent+ '</head><body>' + html + '</body></html>'
    };


    ClipboardExporter.prototype.convertDocument = function convertDocument (doc) {
      var content = doc.get(Document.SNIPPET_ID);
      if (!content) {
        throw new Error('Illegal clipboard document: could not find container "' + Document.SNIPPET_ID + '"')
      }
      return this.convertContainer(content)
    };

    return ClipboardExporter;
  }(HTMLExporter));

  var Clipboard = function Clipboard(editorSession, config) {
    this.editorSession = editorSession;
    var doc = editorSession.getDocument();
    var schema = doc.getSchema();

    var htmlConverters = [];
    if (config.converterRegistry) {
      htmlConverters = config.converterRegistry.get('html') || [];
    }
    var _config = {
      schema: schema,
      DocumentClass: doc.constructor,
      converters: htmlConverters
    };

    this.htmlImporter = new ClipboardImporter(_config);
    this.htmlExporter = new ClipboardExporter(_config);
  };

  Clipboard.prototype.getEditorSession = function getEditorSession () {
    return this.editorSession
  };


  Clipboard.prototype.attach = function attach (el) {
    el.on('copy', this.onCopy, this);
    el.on('cut', this.onCut, this);
    el.on('paste', this.onPaste, this);
  };


  Clipboard.prototype.detach = function detach (el) {
    el.off(this);
  };


  Clipboard.prototype.onCopy = function onCopy (event) {

    var clipboardData = this._copy();
    substanceGlobals._clipboardData = event.clipboardData;

    if (event.clipboardData && clipboardData.doc) {
      event.preventDefault();

      event.clipboardData.setData('text/plain', clipboardData.text);

      if (!platform.isIE && !platform.isEdge) {
        event.clipboardData.setData('text/html', clipboardData.html);
      }
    }
  };


  Clipboard.prototype.onCut = function onCut (event) {


    event.preventDefault();

    this.onCopy(event);
    var editorSession = this.getEditorSession();
    editorSession.transaction(function (tx){
      tx.deleteSelection();
    });
  };



  Clipboard.prototype.onPaste = function onPaste (event) {
    var clipboardData = event.clipboardData;

    var types = {};
    for (var i = 0; i < clipboardData.types.length; i++) {
      types[clipboardData.types[i]] = true;
    }


    event.preventDefault();
    event.stopPropagation();

    var plainText;
    var html;
    if (types['text/plain']) {
      plainText = clipboardData.getData('text/plain');
    }
    if (types['text/html']) {
      html = clipboardData.getData('text/html');
    }



    if (platform.isEdge &&
        substanceGlobals.clipboardData &&
        substanceGlobals.clipboardData.text === plainText) {
      html = substanceGlobals.clipboardData.html;
    } else {
      substanceGlobals.clipboardData = {
        text: plainText,
        html: html
      };
    }





    if (platform.isFF && !html) {
      this._pastePlainText(plainText);
      return
    }



    if (html) {
      if (!this._pasteHtml(html, plainText)) {
        this._pastePlainText(plainText);
      }
    } else {
      this._pastePlainText(plainText);
    }
  };


  Clipboard.prototype._pastePlainText = function _pastePlainText (plainText) {
    var editorSession = this.getEditorSession();
    editorSession.transaction(function(tx) {
      tx.paste(plainText);
    }, { action: 'paste' });
  };


  Clipboard.prototype._copy = function _copy () {
    var editorSession = this.getEditorSession();
    var sel = editorSession.getSelection();
    var doc = editorSession.getDocument();
    var clipboardDoc = null;
    var clipboardText = "";
    var clipboardHtml = "";
    if (!sel.isCollapsed()) {
      clipboardText = documentHelpers.getTextForSelection(doc, sel) || "";
      clipboardDoc = copySelection(doc, sel);
      clipboardHtml = this.htmlExporter.exportDocument(clipboardDoc);
    }
    return {
      doc: clipboardDoc,
      html: clipboardHtml,
      text: clipboardText
    }
  };


  Clipboard.prototype._pasteHtml = function _pasteHtml (html, text) {
    var content = this.htmlImporter.importDocument(html);
    this.paste(content, text);
    return true
  };


  Clipboard.prototype.paste = function paste (doc, text) {
    var content = doc || text;
    var editorSession = this.getEditorSession();
    if (content) {
      editorSession.transaction(function (tx) {
        tx.paste(content);
      }, { action: 'paste' });
    }
  };

  var UnsupportedNodeComponent = (function (Component$$1) {
    function UnsupportedNodeComponent () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) UnsupportedNodeComponent.__proto__ = Component$$1;
    UnsupportedNodeComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
    UnsupportedNodeComponent.prototype.constructor = UnsupportedNodeComponent;

    UnsupportedNodeComponent.prototype.render = function render ($$) {
      return $$('pre')
          .addClass('content-node unsupported')
          .attr({
            'data-id': this.props.node.id,
            contentEditable: false
          })
          .append(
              JSON.stringify(this.props.node.properties, null, 2)
          )
    };

    return UnsupportedNodeComponent;
  }(Component));

  var Surface = (function (Component$$1) {
    function Surface() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      Component$$1.apply(this, args);



      this.editorSession = this.props.editorSession || this.context.editorSession;
      if (!this.editorSession) {
        throw new Error('No EditorSession provided')
      }
      this.name = this.props.name;
      if (!this.name) {
        throw new Error('Surface must have a name.')
      }
      if (this.name.indexOf('/') > -1) {

        throw new Error("Surface.name must not contain '/'")
      }


      this._surfaceId = createSurfaceId(this);

      this.clipboard = new Clipboard(this.editorSession, {
        converterRegistry: this.context.converterRegistry
      });

      this.domSelection = this.context.domSelection;
      if (!this.domSelection) { throw new Error('DOMSelection instance must be provided via context.') }

      this.domObserver = null;



      if (inBrowser) {
        this.documentEl = DefaultDOMElement.wrapNativeElement(window.document);
      }


      this.undoEnabled = true;


      this._textProperties = {};

      this._state = {

        skipNextFocusEvent: false
      };
    }

    if ( Component$$1 ) Surface.__proto__ = Component$$1;
    Surface.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Surface.prototype.constructor = Surface;

    var prototypeAccessors = { id: {} };

    Surface.prototype.getChildContext = function getChildContext () {
      return {
        surface: this,
        doc: this.getDocument(),


        isolatedNodeComponent: null
      }
    };

    Surface.prototype.didMount = function didMount () {
      if (this.context.surfaceManager) {
        this.context.surfaceManager.registerSurface(this);
      }
      this.editorSession.onRender('selection', this._onSelectionChanged, this);
    };


    Surface.prototype.dispose = function dispose () {
      this.editorSession.off(this);
      if (this.domObserver) {
        this.domObserver.disconnect();
      }
      if (this.context.surfaceManager) {
        this.context.surfaceManager.unregisterSurface(this);
      }
    };

    Surface.prototype.didUpdate = function didUpdate () {
      this._updateContentEditableState();
    };

    Surface.prototype.render = function render ($$) {
      var tagName = this.props.tagName || 'div';
      var el = $$(tagName)
          .addClass('sc-surface')
          .attr('tabindex', 2)
          .attr('data-surface-id', this.id);

      if (!this.isDisabled()) {
        if (this.isEditable()) {

          el.on('keydown', this.onKeyDown);

          if (!platform.isIE) {
            el.on('compositionstart', this.onCompositionStart);
          }




          if (inBrowser && window.TextEvent && !platform.isIE) {
            el.on('textInput', this.onTextInput);
          } else {
            el.on('keypress', this.onTextInputShim);
          }
        }
        if (!this.isReadonly()) {

          el.on('mousedown', this.onMouseDown);
          el.on('contextmenu', this.onContextMenu);


          el.on('focus', this.onNativeFocus);
          el.on('blur', this.onNativeBlur);

          this.clipboard.attach(el);
        }

      }
      return el
    };

    Surface.prototype.renderNode = function renderNode ($$, node) {
      var doc = this.getDocument();
      var componentRegistry = this.getComponentRegistry();
      var ComponentClass = componentRegistry.get(node.type);
      if (!ComponentClass) {
        console.error('Could not resolve a component for type: ' + node.type);
        ComponentClass = UnsupportedNodeComponent;
      }
      return $$(ComponentClass, {
        doc: doc,
        node: node
      }).ref(node.id)
    };

    Surface.prototype.getComponentRegistry = function getComponentRegistry () {
      return this.context.componentRegistry || this.props.componentRegistry
    };

    Surface.prototype.getName = function getName () {
      return this.name
    };

    Surface.prototype.getId = function getId () {
      return this._surfaceId
    };

    Surface.prototype.isDisabled = function isDisabled () {
      return this.props.disabled
    };

    Surface.prototype.isEditable = function isEditable () {
      return (this.props.editing === "full" || this.props.editing === undefined)
    };

    Surface.prototype.isSelectable = function isSelectable () {
      return (this.props.editing === "selection" || this.props.editing === "full")
    };

    Surface.prototype.isReadonly = function isReadonly () {
      return this.props.editing === "readonly"
    };

    Surface.prototype.getElement = function getElement () {
      return this.el
    };

    Surface.prototype.getDocument = function getDocument () {
      return this.editorSession.getDocument()
    };

    Surface.prototype.getEditorSession = function getEditorSession () {
      return this.editorSession
    };

    Surface.prototype.isEnabled = function isEnabled () {
      return !this.state.disabled
    };

    Surface.prototype.isContainerEditor = function isContainerEditor () {
      return false
    };

    Surface.prototype.hasNativeSpellcheck = function hasNativeSpellcheck () {
      return this.props.spellcheck === 'native'
    };

    Surface.prototype.getContainerId = function getContainerId () {
      return null
    };

    Surface.prototype.blur = function blur () {
      if (this.el) {
        this.el.blur();
      }
    };

    Surface.prototype.focus = function focus () {
      if (this.isDisabled()) { return }



      if (platform.isFF) {
        this.domSelection.clear();
        this.el.getNativeElement().blur();
      }
      this._focus();
    };


    Surface.prototype.rerenderDOMSelection = function rerenderDOMSelection () {
      if (this.isDisabled()) { return }
      if (inBrowser) {

        var sel = this.editorSession.getSelection();
        if (sel.surfaceId === this.getId()) {
          this.domSelection.setSelection(sel);

          this.context.scrollPane.updateSelection({
            editorId: this.editorSession.id
          });
        }
      }
    };

    Surface.prototype.getDomNodeForId = function getDomNodeForId (nodeId) {
      return this.el.getNativeElement().querySelector('*[data-id="'+nodeId+'"]')
    };




    Surface.prototype.onKeyDown = function onKeyDown (event) {
      if (!this._shouldConsumeEvent(event)) { return }



      if ( event.which === 229 ) { return }


      switch ( event.keyCode ) {

        case keys.LEFT:
        case keys.RIGHT:
          return this._handleLeftOrRightArrowKey(event)
        case keys.UP:
        case keys.DOWN:
          return this._handleUpOrDownArrowKey(event)
        case keys.HOME:
        case keys.END:
          return this._handleHomeOrEndKey(event)
        case keys.PAGEUP:
        case keys.PAGEDOWN:
          return this._handlePageUpOrDownKey(event)

        case keys.ENTER:
          return this._handleEnterKey(event)
        case keys.SPACE:
          return this._handleSpaceKey(event)
        case keys.TAB:
          return this._handleTabKey(event)
        case keys.BACKSPACE:
        case keys.DELETE:
          return this._handleDeleteKey(event)
        default:
          break
      }


      this.editorSession.keyboardManager.onKeydown(event);
    };

    Surface.prototype.onTextInput = function onTextInput (event) {
      if (!this._shouldConsumeEvent(event)) { return }

      event.preventDefault();
      event.stopPropagation();
      if (!event.data) { return }

      var text = event.data;
      if (!this.editorSession.keyboardManager.onTextInput(text)) {
        this.editorSession.transaction(function (tx) {
          tx.insertText(text);
        }, { action: 'type' });
      }
    };


    Surface.prototype.onCompositionStart = function onCompositionStart (event) {
      if (!this._shouldConsumeEvent(event)) { return }
    };


    Surface.prototype.onTextInputShim = function onTextInputShim (event) {
      if (!this._shouldConsumeEvent(event)) { return }

      if (

          event.which === 0 || event.charCode === 0 ||

          event.keyCode === keys.TAB || event.keyCode === keys.ESCAPE ||

          Boolean(event.metaKey) || (Boolean(event.ctrlKey)^Boolean(event.altKey))
      ) {
        return
      }
      var character = String.fromCharCode(event.which);
      if (!event.shiftKey) {
        character = character.toLowerCase();
      }
      event.preventDefault();
      event.stopPropagation();
      if (!this.editorSession.keyboardManager.onTextInput(character)) {
        if (character.length>0) {
          this.editorSession.transaction(function (tx) {
            tx.insertText(character);
          }, { action: 'type' });
        }
      }
    };






    Surface.prototype.onMouseDown = function onMouseDown (event) {
      if (!this._shouldConsumeEvent(event)) { return }






      if (event.__reserved__) {

        return
      } else {

        event.__reserved__ = this;
      }




      if (this.isEditable()) {
        this.el.setAttribute('contenteditable', true);
      }


      if ( event.button !== 0 ) {
        return
      }


      if (!(platform.isIE && platform.version<12) && event.detail >= 3) {
        var sel = this.getEditorSession().getSelection();
        if (sel.isPropertySelection()) {
          this._selectProperty(sel.path);
          event.preventDefault();
          event.stopPropagation();
          return
        } else if (sel.isContainerSelection()) {
          this._selectProperty(sel.startPath);
          event.preventDefault();
          event.stopPropagation();
          return
        }
      }




      this._state.skipNextFocusEvent = true;


      if (this.documentEl) {

        this.documentEl.on('mouseup', this.onMouseUp, this, { once: true });
      }
    };

    Surface.prototype.onMouseUp = function onMouseUp (e) {




      e.stopPropagation();





      setTimeout(function() {
        var sel = this.domSelection.getSelection();
        this._setSelection(sel);
      }.bind(this));
    };




    Surface.prototype.onContextMenu = function onContextMenu (event) {
      if (!this._shouldConsumeEvent(event)) { return }
      var sel = this.domSelection.getSelection();
      this._setSelection(sel);
    };

    Surface.prototype.onNativeBlur = function onNativeBlur () {

      var _state = this._state;
      _state.hasNativeFocus = false;
    };

    Surface.prototype.onNativeFocus = function onNativeFocus () {

      var _state = this._state;
      _state.hasNativeFocus = true;
    };




    Surface.prototype._onSelectionChanged = function _onSelectionChanged (selection) {
      var newMode = this._deriveModeFromSelection(selection);
      if (this.state.mode !== newMode) {
        this.extendState({
          mode: newMode
        });
      }
    };


    Surface.prototype._deriveModeFromSelection = function _deriveModeFromSelection (sel) {
      if (!sel) { return null }
      var surfaceId = sel.surfaceId;
      var id = this.getId();
      var mode;
      if (startsWith$2(surfaceId, id)) {
        if (surfaceId.length === id.length) {
          mode = 'focused';
        } else {
          mode = 'co-focused';
        }
      }
      return mode
    };

    Surface.prototype._updateContentEditableState = function _updateContentEditableState () {





      var enableContenteditable = false;
      if (this.isEditable() && !this.props.disabled) {
        enableContenteditable = true;
        if (this.state.mode === 'co-focused') {
          var selState = this.context.editorSession.getSelectionState();
          var sel = selState.getSelection();
          var surface = this.context.surfaceManager.getSurface(sel.surfaceId);
          if (surface) {
            var isolatedNodeComponent = surface.context.isolatedNodeComponent;
            if (isolatedNodeComponent) {
              enableContenteditable = isolatedNodeComponent.isOpen();
            }
          }
        }
      }
      if (enableContenteditable) {
        this.el.setAttribute('contenteditable', true);
      } else {

        this.el.removeAttribute('contenteditable');
      }
    };

    Surface.prototype._focus = function _focus () {
      this._state.hasNativeFocus = true;




      if (this.el && !platform.isWebkit) {
        this._state.skipNextFocusEvent = true;


        this.el.focus();
        this._state.skipNextFocusEvent = false;
      }
    };

    Surface.prototype._handleLeftOrRightArrowKey = function _handleLeftOrRightArrowKey (event) {
      event.stopPropagation();
      var direction = (event.keyCode === keys.LEFT) ? 'left' : 'right';


      window.setTimeout(function() {
        this._updateModelSelection({direction: direction});
      }.bind(this));
    };

    Surface.prototype._handleUpOrDownArrowKey = function _handleUpOrDownArrowKey (event) {
      event.stopPropagation();


      window.setTimeout(function() {
        var options = {
          direction: (event.keyCode === keys.UP) ? 'left' : 'right'
        };
        this._updateModelSelection(options);
      }.bind(this));
    };

    Surface.prototype._handleHomeOrEndKey = function _handleHomeOrEndKey (event) {
      event.stopPropagation();


      window.setTimeout(function() {
        var options = {
          direction: (event.keyCode === keys.HOME) ? 'left' : 'right'
        };
        this._updateModelSelection(options);
      }.bind(this));
    };

    Surface.prototype._handlePageUpOrDownKey = function _handlePageUpOrDownKey (event) {
      event.stopPropagation();


      window.setTimeout(function() {
        var options = {
          direction: (event.keyCode === keys.PAGEUP) ? 'left' : 'right'
        };
        this._updateModelSelection(options);
      }.bind(this));
    };

    Surface.prototype._handleSpaceKey = function _handleSpaceKey (event) {
      event.preventDefault();
      event.stopPropagation();
      this.editorSession.transaction(function (tx) {
        tx.insertText(' ');
      }, { action: 'type' });
    };

    Surface.prototype._handleTabKey = function _handleTabKey (event) {
      var this$1 = this;

      event.stopPropagation();
      window.setTimeout(function (){
        this$1._updateModelSelection();
      });
    };

    Surface.prototype._handleEnterKey = function _handleEnterKey (event) {
      event.preventDefault();
      event.stopPropagation();
      this.editorSession.transaction(function (tx) {
        tx.break();
      }, { action: 'break' });
    };

    Surface.prototype._handleDeleteKey = function _handleDeleteKey (event) {
      event.preventDefault();
      event.stopPropagation();
      var direction = (event.keyCode === keys.BACKSPACE) ? 'left' : 'right';
      this.editorSession.transaction(function (tx) {
        tx.deleteCharacter(direction);
      }, { action: 'delete' });
    };

    Surface.prototype._hasNativeFocus = function _hasNativeFocus () {
      return Boolean(this._state.hasNativeFocus)
    };

    Surface.prototype._setSelection = function _setSelection (sel) {








      if (!sel.isNull() && sel.surfaceId === this.id && platform.isFF) {
        this._focus();
      }
      this.editorSession.setSelection(sel);
    };

    Surface.prototype._updateModelSelection = function _updateModelSelection (options) {
      var sel = this.domSelection.getSelection(options);



      this._setSelection(sel);
    };

    Surface.prototype._selectProperty = function _selectProperty (path) {
      var doc = this.getDocument();
      var text = doc.get(path);
      this._setSelection(doc.createSelection({
        type: 'property',
        path: path,
        startOffset: 0,
        endOffset: text.length
      }));
    };



    Surface.prototype._registerTextProperty = function _registerTextProperty (textPropertyComponent) {
      var path = textPropertyComponent.getPath();
      this._textProperties[path] = textPropertyComponent;
    };

    Surface.prototype._unregisterTextProperty = function _unregisterTextProperty (textPropertyComponent) {
      var path = textPropertyComponent.getPath();
      if (this._textProperties[path] === textPropertyComponent) {
        delete this._textProperties[path];
      }
    };

    Surface.prototype._getTextPropertyComponent = function _getTextPropertyComponent (path) {
      return this._textProperties[path]
    };



    Surface.prototype._renderNode = function _renderNode ($$, nodeId) {
      var doc = this.getDocument();
      var node = doc.get(nodeId);
      var componentRegistry = this.context.componentRegistry || this.props.componentRegistry;
      var ComponentClass = componentRegistry.get(node.type);
      if (!ComponentClass) {
        console.error('Could not resolve a component for type: ' + node.type);
        ComponentClass = UnsupportedNodeComponent;
      }
      return $$(ComponentClass, {
        doc: doc,
        node: node
      })
    };


    Surface.prototype._shouldConsumeEvent = function _shouldConsumeEvent (event) {
      var comp = Component$$1.unwrap(event.target._wrapper);
      return (comp && (comp === this || comp.context.surface === this))
    };


    Surface.prototype.getSelectionFromEvent = function getSelectionFromEvent (event) {
      var domRange = getDOMRangeFromEvent(event);
      var sel = this.domSelection.getSelectionForDOMRange(domRange);
      sel.surfaceId = this.getId();
      return sel;
    };

    Surface.prototype.setSelectionFromEvent = function setSelectionFromEvent (event) {
      var sel = this.getSelectionFromEvent(event);
      if (sel) {
        this._state.skipNextFocusEvent = true;
        this._setSelection(sel);
      } else {
        console.error('Could not create a selection from event.');
      }
    };

    prototypeAccessors.id.get = function () {
      return this._surfaceId
    };

    Object.defineProperties( Surface.prototype, prototypeAccessors );

    return Surface;
  }(Component));

  Surface.prototype._isSurface = true;


  function createSurfaceId(surface) {
    var isolatedNodeComponent = surface.context.isolatedNodeComponent;
    if (isolatedNodeComponent) {
      var parentSurface = isolatedNodeComponent.context.surface;

      if (surface.isContainerEditor()) {
        if (isolatedNodeComponent._isInlineNodeComponent) {
          return parentSurface.id + '/' + isolatedNodeComponent.props.node.id + '/' + surface.name
        } else {
          return parentSurface.id + '/' + surface.name
        }
      }

      else {
        return parentSurface.id + '/' + isolatedNodeComponent.props.node.id + '/' + surface.name
      }
    } else {
      return surface.name
    }
  }

  var TextPropertyEditor = (function (Surface$$1) {
    function TextPropertyEditor(parent, props) {

      props.name = props.name || props.path.join('.');
      Surface$$1.call(this, parent, props);

      if (!props.path) {
        throw new Error("Property 'path' is mandatory.")
      }
    }

    if ( Surface$$1 ) TextPropertyEditor.__proto__ = Surface$$1;
    TextPropertyEditor.prototype = Object.create( Surface$$1 && Surface$$1.prototype );
    TextPropertyEditor.prototype.constructor = TextPropertyEditor;

    TextPropertyEditor.prototype.render = function render ($$) {
      var el = Surface$$1.prototype.render.apply(this, arguments);
      el.addClass("sc-text-property-editor");

      if (!this.props.disabled) {
        el.addClass('sm-enabled');
        el.attr('contenteditable', true);

        el.attr('spellcheck', this.props.spellcheck === 'native');
      }

      el.append(
          $$(TextPropertyComponent, {
            tagName: this.props.tagName || "div",
            path: this.props.path,
            withoutBreak: this.props.withoutBreak
          })
      );

      return el
    };

    TextPropertyEditor.prototype._handleEnterKey = function _handleEnterKey (event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.props.multiLine) {
        Surface$$1.prototype._handleEnterKey.call(this, event);
      }
    };

    TextPropertyEditor.prototype.getPath = function getPath () {
      return this.props.path
    };

    return TextPropertyEditor;
  }(Surface));

  TextPropertyEditor.prototype._isTextPropertyEditor = true;

  var TableCellComponent = (function (Component$$1) {
    function TableCellComponent () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) TableCellComponent.__proto__ = Component$$1;
    TableCellComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
    TableCellComponent.prototype.constructor = TableCellComponent;

    TableCellComponent.prototype.render = function render ($$) {
      var node = this.props.node;
      var el = $$('td').addClass('sc-table-cell');
      el.append(
          $$(TextPropertyEditor, {
            path: node.getTextPath(),
            disabled: this.props.disabled
          }).ref('editor')
      );
      if (node.rowspan > 0) {
        el.attr('rowspan', node.rowspan);
      }
      if (node.colspan > 0) {
        el.attr('colspan', node.colspan);
      }
      return el
    };

    TableCellComponent.prototype.grabFocus = function grabFocus () {
      var node = this.props.node;
      this.context.editorSession.setSelection({
        type: 'property',
        path: node.getPath(),
        startOffset: node.getLength(),
        surfaceId: this.refs.editor.id
      });
    };

    return TableCellComponent;
  }(Component));

  TableCellComponent.prototype._isTableCellComponent = true;

  var TableComponent = (function (Component$$1) {
    function TableComponent () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) TableComponent.__proto__ = Component$$1;
    TableComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
    TableComponent.prototype.constructor = TableComponent;

    TableComponent.prototype.render = function render ($$) {
      var this$1 = this;

      var el = $$('table').addClass('sc-table');
      var node = this.props.node;
      var doc = this.props.node.getDocument();
      var cells = this.props.node.cells;
      var rowCount = node.getRowCount();
      var colCount = node.getColCount();
      for (var i = 0; i < rowCount; i++) {
        var rowEl = $$('tr');
        for (var j = 0; j < colCount; j++) {
          var cellId = cells[i][j];

          if (cellId) {
            var cellNode = doc.get(cellId);
            var cellEl = $$(TableCellComponent, {
              node: cellNode,
              disabled: this$1.props.disabled
            }).ref(cellNode.id);
            rowEl.append(cellEl);
          }
        }
        el.append(rowEl);
      }
      el.on('click', this.onClick);
      el.on('dblclick', this.onDblClick);
      return el
    };

    TableComponent.prototype.onClick = function onClick (event) {
      event.stopPropagation();

    };


    TableComponent.prototype.onDblClick = function onDblClick (event) {
      event.stopPropagation();




      var comp = Component$$1.unwrap(event.target);
      if (comp) {
        var cellComp;
        if (comp._isTableCellComponent) {
          cellComp = comp;
        } else if (comp._isTextPropertyEditor) {
          cellComp = comp.getParent();
        } else if (comp._isTextPropertyComponent) {
          cellComp = comp.getParent().getParent();
        } else {
          console.warn('TODO: find the right cell');
        }
        if (cellComp) {
          cellComp.grabFocus();
        }
      }
    };

    TableComponent.prototype.grabFocus = function grabFocus () {
      var cellId = this.props.node.cells[0][0];
      if (cellId) {
        var comp = this.refs[cellId];
        comp.grabFocus();
      }
    };

    return TableComponent;
  }(Component));

  TableComponent.hasDropzones = true;

  function times$2(num, fn, ctx) {
    for (var i=0; i<num; i++) {
      fn.call(ctx);
    }
  }

  var TableHTMLConverter = {

    type: 'table',
    tagName: 'table',


    import: function(el, node, converter) {
      var trs = el.find('tbody').getChildren();
      var colCount = 0;
      var cells = [];
      var rowspans = [];
      var loop = function ( i ) {
        var tds = trs[i].getChildren();
        var row = [];
        colCount = Math.max(tds.length, colCount);
        for (var j = 0; j < tds.length; j++) {
          var td = tds[j];

          if (rowspans[j] > 1) {
            row.push(null);
            rowspans[j] -= 1;
          }
          var tableCell = converter.convertElement(td);
          row.push(tableCell.id);
          if (tableCell.rowspan > 1) {
            rowspans[j] = tableCell.rowspan;
          }
          if (tableCell.colspan > 1) {

            times$2(tableCell.colspan - 1, function () {
              row.push(null);
            });
          }
        }
        cells.push(row);
      };

      for (var i = 0; i < trs.length; i++) loop( i );
      node.cells = cells;
    },

    export: function(node, el, converter) {
      var $$ = converter.$$;
      var rowCount = node.getRowCount();
      var colCount = node.getColCount();
      for (var i = 0; i < rowCount; i++) {
        var rowEl = $$('tr');
        for (var j = 0; j < colCount; j++) {
          var cellId = node.cells[i][j];

          if (cellId) {
            var cellEl = converter.convertNode(cellId);
            rowEl.append(cellEl);
          }
        }
        el.append(rowEl);
      }
      return el
    }
  };

  var TableCellHTMLConverter = {

    type: 'table-cell',
    tagName: 'td',

    import: function(el, node, converter) {
      node.content = converter.annotatedText(el, [node.id, 'content']);
      var colspan = el.attr('colspan');
      var rowspan = el.attr('rowspan');
      if (colspan) {
        node.colspan = Number(colspan);
      }
      if (rowspan) {
        node.rowspan = Number(rowspan);
      }
    },

    export: function(node, el, converter) {
      el.append(converter.annotatedText([node.id, 'content']));
      if (node.rowspan > 0) {
        el.attr('rowspan', node.rowspan);
      }
      if (node.colspan > 0) {
        el.attr('colspan', node.colspan);
      }
      return el
    }
  };

  var TablePackage = {
    name: 'table',
    configure: function(config) {
      config.addNode(Table);
      config.addNode(TableCell);
      config.addComponent('table', TableComponent);
      config.addConverter('html', TableHTMLConverter);
      config.addConverter('html', TableCellHTMLConverter);
      config.addConverter('xml', TableHTMLConverter);
      config.addConverter('xml', TableCellHTMLConverter);
      config.addLabel('table', {
        en: 'Table',
        de: 'Tabelle'
      });
      config.addLabel('table-cell.content', {
        en: 'Cell',
        de: 'Zelle'
      });
    }
  };

  var ResourceManager = function ResourceManager(editorSession, context) {
    this.editorSession = editorSession;
    this.context = context;
    this.editorSession.onRender('document', this._onDocumentChange, this);
  };

  ResourceManager.prototype._onDocumentChange = function _onDocumentChange (change) {
    var this$1 = this;

    var doc = this.editorSession.getDocument();
    forEach(change.created, function (node) {
      node = doc.get(node.id);
      if (node.constructor.isResource) {
        setTimeout(function () {
          this$1.triggerFetch(node);
        });
      }
    });
  };


  ResourceManager.prototype.triggerFetch = function triggerFetch (resource) {
    var this$1 = this;

    resource.fetchPayload(this.context, function (err, props) {
      if (err) {
        this$1._updateNode(resource.id, {
          errorMessage: err.toString()
        });
      } else {
        this$1._updateNode(resource.id, props);
      }
    });
  };


  ResourceManager.prototype._updateNode = function _updateNode (nodeId, props) {
    var editorSession = this.editorSession;
    editorSession.transaction(function (tx) {
      forEach(props, function (val, key) {
        tx.set([nodeId, key], val);
      });
    });
  };

  var BRACKET = 'X';


  var IsolatedNodeComponent = (function (AbstractIsolatedNodeComponent$$1) {
    function IsolatedNodeComponent() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      AbstractIsolatedNodeComponent$$1.apply(this, args);
    }

    if ( AbstractIsolatedNodeComponent$$1 ) IsolatedNodeComponent.__proto__ = AbstractIsolatedNodeComponent$$1;
    IsolatedNodeComponent.prototype = Object.create( AbstractIsolatedNodeComponent$$1 && AbstractIsolatedNodeComponent$$1.prototype );
    IsolatedNodeComponent.prototype.constructor = IsolatedNodeComponent;

    IsolatedNodeComponent.prototype.render = function render ($$) {
      var node = this.props.node;
      var ContentClass = this.ContentClass;
      var disabled = this.props.disabled;


      var el = $$('div');
      el.addClass(this.getClassNames())
          .addClass('sc-isolated-node')
          .addClass('sm-'+this.props.node.type)
          .attr("data-id", node.id);
      if (disabled) {
        el.addClass('sm-disabled');
      }
      if (this.state.mode) {
        el.addClass('sm-'+this.state.mode);
      }
      if (!ContentClass.noStyle) {
        el.addClass('sm-default-style');
      }

      el.on('keydown', this.onKeydown);


      var shouldRenderBlocker = (
          this.blockingMode === 'closed' &&
          !this.state.unblocked
      );



      el.append(
          $$('div').addClass('se-bracket sm-left').ref('left')
              .append(BRACKET)
      );

      var content = this.renderContent($$, node, {
        disabled: this.props.disabled || shouldRenderBlocker
      }).ref('content');
      content.attr('contenteditable', false);

      el.append(content);
      el.append($$(Blocker).ref('blocker'));
      el.append(
          $$('div').addClass('se-bracket sm-right').ref('right')
              .append(BRACKET)
      );

      if (!shouldRenderBlocker) {
        el.addClass('sm-no-blocker');
        el.on('click', this.onClick)
            .on('dblclick', this.onDblClick);
      }
      el.on('mousedown', this._reserveMousedown, this);

      return el
    };

    IsolatedNodeComponent.prototype.getClassNames = function getClassNames () {
      return ''
    };

    IsolatedNodeComponent.prototype.getContent = function getContent () {
      return this.refs.content
    };

    IsolatedNodeComponent.prototype.selectNode = function selectNode () {

      var editorSession = this.context.editorSession;
      var surface = this.context.surface;
      var nodeId = this.props.node.id;
      editorSession.setSelection({
        type: 'node',
        nodeId: nodeId,
        containerId: surface.getContainerId(),
        surfaceId: surface.id
      });
    };



    IsolatedNodeComponent.prototype.onClick = function onClick (event) {

      event.stopPropagation();
    };

    IsolatedNodeComponent.prototype.onDblClick = function onDblClick (event) {

      event.stopPropagation();
    };

    IsolatedNodeComponent.prototype.grabFocus = function grabFocus (event) {
      var content = this.refs.content;
      if (content.grabFocus) {
        content.grabFocus(event);
        return true
      }
    };



    IsolatedNodeComponent.prototype._reserveMousedown = function _reserveMousedown (event) {
      if (event.__reserved__) {

        return
      } else {

        event.__reserved__ = this;
      }
    };

    IsolatedNodeComponent.prototype._deriveStateFromSelectionState = function _deriveStateFromSelectionState (selState) {
      var surface = this._getSurface(selState);
      var newState = { mode: null, unblocked: null};
      if (!surface) { return newState }

      if (surface === this.context.surface) {
        var sel = selState.getSelection();
        var nodeId = this.props.node.id;
        if (sel.isNodeSelection() && sel.getNodeId() === nodeId) {
          if (sel.isFull()) {
            newState.mode = 'selected';
            newState.unblocked = true;
          } else if (sel.isBefore()) {
            newState.mode = 'cursor';
            newState.position = 'before';
          } else if (sel.isAfter()) {
            newState.mode = 'cursor';
            newState.position = 'after';
          }
        }
        if (sel.isContainerSelection() && sel.containsNode(nodeId)) {
          newState.mode = 'co-selected';
        }
      } else {
        var isolatedNodeComponent = surface.context.isolatedNodeComponent;
        if (isolatedNodeComponent) {
          if (isolatedNodeComponent === this) {
            newState.mode = 'focused';
            newState.unblocked = true;
          } else {
            var isolatedNodes = this._getIsolatedNodes(selState);
            if (isolatedNodes.indexOf(this) > -1) {
              newState.mode = 'co-focused';
              newState.unblocked = true;
            }
          }
        }
      }
      return newState
    };

    return IsolatedNodeComponent;
  }(AbstractIsolatedNodeComponent));

  IsolatedNodeComponent.prototype._isIsolatedNodeComponent = true;

  IsolatedNodeComponent.prototype._isDisabled = IsolatedNodeComponent.prototype.isDisabled;

  IsolatedNodeComponent.getDOMCoordinate = function(comp, coor) {
    var ref = IsolatedNodeComponent.getDOMCoordinates(comp);
    var start = ref.start;
    var end = ref.end;
    if (coor.offset === 0) { return start }
    else { return end }
  };

  IsolatedNodeComponent.getDOMCoordinates = function(comp) {
    var left = comp.refs.left;
    var right = comp.refs.right;
    return {
      start: {
        container: left.getNativeElement(),
        offset: 0
      },
      end: {
        container: right.getNativeElement(),
        offset: right.getChildCount()
      }
    }
  };

  IsolatedNodeComponent.getCoordinate = function(nodeEl, options) {
    var comp = Component.unwrap(nodeEl, 'strict').context.isolatedNodeComponent;
    var offset = null;
    if (options.direction === 'left' || nodeEl === comp.refs.left.el) {
      offset = 0;
    } else if (options.direction === 'right' || nodeEl === comp.refs.right.el) {
      offset = 1;
    }
    var coor;
    if (offset !== null) {
      coor = new Coordinate([comp.props.node.id], offset);
      coor._comp = comp;
    }
    return coor
  };

  var Blocker = (function (Component$$1) {
    function Blocker () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Blocker.__proto__ = Component$$1;
    Blocker.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Blocker.prototype.constructor = Blocker;

    Blocker.prototype.render = function render ($$) {
      return $$('div').addClass('sc-isolated-node-blocker')
          .attr('draggable', true)
          .attr('contenteditable', false)
          .on('click', this.onClick)
          .on('dblclick', this.onDblClick)
    };

    Blocker.prototype.onClick = function onClick (event) {
      if (event.target !== this.getNativeElement()) { return }

      event.stopPropagation();
      var comp = this._getIsolatedNodeComponent();
      comp.extendState({ mode: 'selected', unblocked: true });
      comp.selectNode();
    };

    Blocker.prototype.onDblClick = function onDblClick (event) {

      event.stopPropagation();
    };

    Blocker.prototype._getIsolatedNodeComponent = function _getIsolatedNodeComponent () {
      return this.context.isolatedNodeComponent
    };

    return Blocker;
  }(Component));

  var DEBUG = false;


  var DOMSelection = function DOMSelection(editor) {
    this.editor = editor;
    if (inBrowser) {
      this.wRange = window.document.createRange();
    }


    this.state = { dom: null, model: null };
  };


  DOMSelection.prototype.getSelection = function getSelection (options) {

    if (!inBrowser) { return }
    var range = this.mapDOMSelection(options);
    var doc = this.editor.getDocument();

    return doc._createSelectionFromRange(range)
  };

  DOMSelection.prototype.getSelectionForDOMRange = function getSelectionForDOMRange (wrange) {
    var range = this.mapDOMRange(wrange);
    var doc = this.editor.getDocument();
    return doc._createSelectionFromRange(range)
  };


  DOMSelection.prototype.mapDOMSelection = function mapDOMSelection (options) {
    var wSel = window.getSelection();
    var state = this.state;
    var range;


    if (DEBUG) { console.info('DOM->Model: ', wSel.anchorNode, wSel.anchorOffset, wSel.focusNode, wSel.focusOffset); }
    if (wSel.rangeCount === 0) { return _null() }
    var anchorNode = DefaultDOMElement.wrapNativeElement(wSel.anchorNode);
    if (wSel.isCollapsed) {
      var coor = this._getCoordinate(anchorNode, wSel.anchorOffset, options);
      if (!coor) { return _null() }
      range = _createRange({
        start: coor,
        end: coor
      });
    }
    else {
      var focusNode = DefaultDOMElement.wrapNativeElement(wSel.focusNode);
      range = this._getRange(anchorNode, wSel.anchorOffset, focusNode, wSel.focusOffset, options);
    }
    if (DEBUG) { console.info('DOM->Model: range ', range ? range.toString() : null); }
    state.model = range;
    return range

    function _null() {
      state.dom = null;
      state.model = null;
      return null
    }
  };


  DOMSelection.prototype.setSelection = function setSelection (sel) {

    if (!inBrowser) { return }
    var state = this.state;
    var wSel = window.getSelection();
    var wRange = this.wRange;
    if (!sel || sel.isNull()) { return this.clear() }

    var ref = this.mapModelToDOMCoordinates(sel);
    var start = ref.start;
    var end = ref.end;
    if (!start) { return this.clear() }
    if (sel.isReverse()) {
      var assign;
      (assign = [end, start], start = assign[0], end = assign[1]);
    }
    state.dom = {
      anchorNode: start.container,
      anchorOffset: start.offset,
      focusNode: end.container,
      focusOffset: end.offset
    };
    _set(state.dom);

    function _set(ref) {
      var anchorNode = ref.anchorNode;
      var anchorOffset = ref.anchorOffset;
      var focusNode = ref.focusNode;
      var focusOffset = ref.focusOffset;

      wSel.removeAllRanges();
      wRange.setStart(anchorNode, anchorOffset);
      wRange.setEnd(anchorNode, anchorOffset);
      wSel.addRange(wRange);
      if (focusNode !== anchorOffset || focusOffset !== anchorOffset) {
        wSel.extend(focusNode, focusOffset);
      }
    }
  };

  DOMSelection.prototype.mapModelToDOMCoordinates = function mapModelToDOMCoordinates (sel) {
    if (DEBUG) { console.info('Model->DOM: sel =', sel.toString()); }
    var rootEl;
    var surface = this.editor.surfaceManager.getSurface(sel.surfaceId);
    if (!surface) {
      console.warn('Selection should have "surfaceId" set.');
      rootEl = this.editor.el;
    } else {
      rootEl = surface.el;
    }
    if (sel.isNull() || sel.isCustomSelection()) {
      return {}
    }

    var start, end;
    if (sel.isPropertySelection() || sel.isContainerSelection()) {
      start = this._getDOMCoordinate(rootEl, sel.start);
      if (!start) {
        console.warn('FIXME: selection seems to be invalid.');
        return {}
      }
      if (sel.isCollapsed()) {
        end = start;
      } else {
        end = this._getDOMCoordinate(rootEl, sel.end);
        if (!end) {
          console.warn('FIXME: selection seems to be invalid.');
          return {}
        }
      }
    } else if (sel.isNodeSelection()) {
      var comp = Component.unwrap(rootEl.find('*[data-id="'+sel.getNodeId()+'"]'));
      if (!comp) {
        console.error('Could not find component with id', sel.getNodeId());
        return {}
      }
      if (comp._isIsolatedNodeComponent) {
        var coors = IsolatedNodeComponent.getDOMCoordinates(comp, sel);
        start = coors.start;
        end = coors.end;



      } else {
        var _nodeEl = comp.el;
        start = {
          container: _nodeEl.getNativeElement(),
          offset: 0
        };
        end = {
          container: _nodeEl.getNativeElement(),
          offset: _nodeEl.getChildCount()
        };
      }
    }
    if (DEBUG) { console.info('Model->DOM:', start.container, start.offset, end.container, end.offset, 'isReverse?', sel.isReverse()); }
    return {start: start,end: end}
  };

  DOMSelection.prototype._getDOMCoordinate = function _getDOMCoordinate (rootEl, coor) {
    var comp, domCoor = null;
    if (coor.isNodeCoordinate()) {
      comp = Component.unwrap(rootEl.find('*[data-id="'+coor.getNodeId()+'"]'));
      if (comp) {
        if (comp._isIsolatedNodeComponent) {
          domCoor = IsolatedNodeComponent.getDOMCoordinate(comp, coor);
        } else {
          var domOffset = 0;
          if (coor.offset > 0) {
            domOffset = comp.getChildCount();
          }
          domCoor = {
            container: comp.getNativeElement(),
            offset: domOffset
          };
        }
      }
    } else {
      comp = Component.unwrap(rootEl.find('.sc-text-property[data-path="'+coor.path.join('.')+'"]'));
      if (comp) {
        domCoor = comp.getDOMCoordinate(coor.offset);
      }
    }
    return domCoor
  };


  DOMSelection.prototype.mapDOMRange = function mapDOMRange (wRange, options) {
    return this._getRange(
        DefaultDOMElement.wrapNativeElement(wRange.startContainer),
        wRange.startOffset,
        DefaultDOMElement.wrapNativeElement(wRange.endContainer),
        wRange.endOffset, options)
  };


  DOMSelection.prototype.clear = function clear () {
    window.getSelection().removeAllRanges();
    this.state.dom = null;
    this.state.model = null;
  };

  DOMSelection.prototype.collapse = function collapse (dir) {
    var wSel = window.getSelection();
    var wRange;
    if (wSel.rangeCount > 0) {
      wRange = wSel.getRangeAt(0);
      wRange.collapse(dir === 'left');
      wSel.removeAllRanges();
      wSel.addRange(wRange);
    }
  };

  DOMSelection.prototype.select = function select (el) {
    var wSel = window.getSelection();
    var wRange = window.document.createRange();
    wRange.selectNode(el.getNativeElement());
    wSel.removeAllRanges();
    wSel.addRange(wRange);
  };

  DOMSelection.prototype.extend = function extend (el, offset) {
    var wSel = window.getSelection();
    wSel.extend(el.getNativeElement(), offset);
  };

  DOMSelection.prototype.setCursor = function setCursor (el, offset) {
    var wSel = window.getSelection();
    var wRange = window.document.createRange();
    wRange.setStart(el.getNativeElement(), offset);
    wSel.removeAllRanges();
    wSel.addRange(wRange);
  };


  DOMSelection.prototype._getRange = function _getRange (anchorNode, anchorOffset, focusNode, focusOffset, options) {
    if ( options === void 0 ) options = {};

    var isReverse = DefaultDOMElement.isReverse(anchorNode, anchorOffset, focusNode, focusOffset);
    var isCollapsed = (anchorNode === focusNode && anchorOffset === focusOffset);
    var start, end;
    if (isCollapsed) {
      start = end = this._getCoordinate(anchorNode, anchorOffset, options);
    } else {
      start = this._getCoordinate(anchorNode, anchorOffset, { direction: isReverse ? 'right' : 'left' });
      end = this._getCoordinate(focusNode, focusOffset, options);
    }
    if (start && end) {
      return _createRange({ start: start, end: end, isReverse: isReverse })
    } else {
      return null
    }
  };


  DOMSelection.prototype._getCoordinate = function _getCoordinate (nodeEl, offset, options) {
    if ( options === void 0 ) options={};

    var coor = null;

    if (!coor) {
      coor = TextPropertyComponent.getCoordinate(this.editor.el, nodeEl, offset);
    }
    var comp = Component.unwrap(nodeEl);
    if (!coor && comp) {

      if (comp.context.isolatedNodeComponent) {
        coor = IsolatedNodeComponent.getCoordinate(nodeEl, options);
      }
    }


    if (!coor) {

      if (comp && comp._isContainerEditor) {
        var childIdx = (offset === 0) ? 0 : offset-1;
        var isBefore = (offset === 0);
        var container = comp.getContainer();
        var childNode = container.getNodeAt(childIdx);
        var childComp = comp.getChildAt(childIdx);
        coor = new Coordinate([childNode.id], isBefore?0:1 );
        coor._comp = childComp;
      }

      else if (nodeEl.isElementNode() && nodeEl.getChildCount() > 0) {
        var child = (offset > 0) ? nodeEl.getChildAt(offset-1) : nodeEl.firstChild;
        var prop;
        var childComp$1 = Component.unwrap(child);
        if (childComp$1 && childComp$1._isTextPropertyComponent) {
          prop = child;
        }

        if (prop) {
          coor = TextPropertyComponent.getCoordinate(nodeEl, prop, (offset > 0) ? prop.getChildCount() : 0);
        }
      }
    }
    return coor
  };


  function _createRange(ref) {
    var start = ref.start;
    var end = ref.end;
    var isReverse = ref.isReverse;

    if (isReverse) {
      var assign;
      (assign = [end, start], start = assign[0], end = assign[1]);
    }
    if (!start._comp || !end._comp) {
      console.error('FIXME: getCoordinate() should provide a component instance');
      return null
    }
    var surface = start._comp.context.surface;
    if (!surface) {
      console.error('FIXME: Editable components should have their surface in the context');
      return null
    }
    if (surface !== end._comp.context.surface) {
      console.error('Coordinates are within two different surfaces. Can not create a selection.');
      return null
    }
    return new Range(start, end, isReverse, surface.getContainerId(), surface.id)
  }

  var AbstractEditor = (function (Component$$1) {
    function AbstractEditor() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      Component$$1.apply(this, args);
      this._initialize(this.props);
    }

    if ( Component$$1 ) AbstractEditor.__proto__ = Component$$1;
    AbstractEditor.prototype = Object.create( Component$$1 && Component$$1.prototype );
    AbstractEditor.prototype.constructor = AbstractEditor;

    AbstractEditor.prototype._initialize = function _initialize (props) {
      if (!props.editorSession) {
        throw new Error('EditorSession instance required');
      }
      this.editorSession = props.editorSession;
      this.doc = this.editorSession.getDocument();

      var configurator = this.editorSession.getConfigurator();
      this.componentRegistry = configurator.getComponentRegistry();
      this.toolGroups = configurator.getToolGroups();
      this.labelProvider = configurator.getLabelProvider();
      this.iconProvider = configurator.getIconProvider();


      this.surfaceManager = this.editorSession.surfaceManager;
      this.commandManager = this.editorSession.commandManager;
      this.dragManager = this.editorSession.dragManager;
      this.macroManager = this.editorSession.macroManager;
      this.converterRegistry = this.editorSession.converterRegistry;
      this.globalEventHandler = this.editorSession.globalEventHandler;
      this.editingBehavior = this.editorSession.editingBehavior;
      this.markersManager = this.editorSession.markersManager;

      this.resourceManager = new ResourceManager(this.editorSession, this.getChildContext());

      this.domSelection = new DOMSelection(this);
    };


    AbstractEditor.prototype.render = function render () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return Component$$1.prototype.render.apply(this, args)
    };

    AbstractEditor.prototype.willReceiveProps = function willReceiveProps (nextProps) {
      var newSession = nextProps.editorSession;
      var shouldDispose = newSession && newSession !== this.editorSession;
      if (shouldDispose) {
        this._dispose();
        this._initialize(nextProps);
      }
    };

    AbstractEditor.prototype.dispose = function dispose () {
      this._dispose();
    };

    AbstractEditor.prototype._dispose = function _dispose () {


      this.empty();
    };

    AbstractEditor.prototype.getChildContext = function getChildContext () {
      return {
        editor: this,
        editorSession: this.editorSession,
        doc: this.doc,
        componentRegistry: this.componentRegistry,
        surfaceManager: this.surfaceManager,
        domSelection: this.domSelection,
        commandManager: this.commandManager,
        markersManager: this.markersManager,
        converterRegistry: this.converterRegistry,
        dragManager: this.dragManager,
        editingBehavior: this.editingBehavior,
        globalEventHandler: this.globalEventHandler,
        iconProvider: this.iconProvider,
        labelProvider: this.labelProvider,
        resourceManager: this.resourceManager,


        toolGroups: this.toolGroups,
      }
    };

    AbstractEditor.prototype.getDocument = function getDocument () {
      return this.editorSession.getDocument()
    };

    AbstractEditor.prototype.getConfigurator = function getConfigurator () {
      return this.editorSession.getConfigurator()
    };

    AbstractEditor.prototype.getEditorSession = function getEditorSession () {
      return this.editorSession
    };

    AbstractEditor.prototype.getComponentRegistry = function getComponentRegistry () {
      return this.componentRegistry
    };

    AbstractEditor.prototype.onSessionUnlocked = function onSessionUnlocked () {
      if (this.refs.blocker) {
        this.refs.blocker.remove();
      }
    };

    return AbstractEditor;
  }(Component));

  var EditingBehavior = function EditingBehavior() {
    this._merge = {};
    this._mergeComponents = {};
    this._break = {};
  };

  EditingBehavior.prototype.defineMerge = function defineMerge (firstType, secondType, impl) {
    if (!this._merge[firstType]) {
      this._merge[firstType] = {};
    }
    this._merge[firstType][secondType] = impl;
    return this
  };

  EditingBehavior.prototype.canMerge = function canMerge (firstType, secondType) {
    return (this._merge[firstType] && this._merge[firstType][secondType])
  };

  EditingBehavior.prototype.getMerger = function getMerger (firstType, secondType) {
    return this._merge[firstType][secondType]
  };

  EditingBehavior.prototype.defineComponentMerge = function defineComponentMerge (nodeType, impl) {
    this._mergeComponents[nodeType] = impl;
  };

  EditingBehavior.prototype.canMergeComponents = function canMergeComponents (nodeType) {
    return this._mergeComponents[nodeType]
  };

  EditingBehavior.prototype.getComponentMerger = function getComponentMerger (nodeType) {
    return this._mergeComponents[nodeType]
  };

  EditingBehavior.prototype.defineBreak = function defineBreak (nodeType, impl) {
    this._break[nodeType] = impl;
    return this
  };

  EditingBehavior.prototype.canBreak = function canBreak (nodeType) {
    return this._break[nodeType]
  };

  EditingBehavior.prototype.getBreaker = function getBreaker (nodeType) {
    return this._break[nodeType]
  };

  var ContainerEditor = (function (Surface$$1) {
    function ContainerEditor(parent, props, el) {

      props.containerId = props.containerId || props.node.id;
      props.name = props.name || props.containerId || props.node.id;

      Surface$$1.call(this, parent, props, el);

      this.containerId = this.props.containerId;
      if (!isString(this.containerId)) {
        throw new Error("Property 'containerId' is mandatory.")
      }
      var doc = this.getDocument();
      this.container = doc.get(this.containerId);
      if (!this.container) {
        throw new Error('Container with id ' + this.containerId + ' does not exist.')
      }

      this.textTypes = this.props.textTypes || [];

      this.editingBehavior = this.context.editingBehavior || new EditingBehavior();

      this._deriveInternalState(this.props);
    }

    if ( Surface$$1 ) ContainerEditor.__proto__ = Surface$$1;
    ContainerEditor.prototype = Object.create( Surface$$1 && Surface$$1.prototype );
    ContainerEditor.prototype.constructor = ContainerEditor;


    ContainerEditor.prototype.shouldRerender = function shouldRerender (newProps) {
      if (newProps.disabled !== this.props.disabled) { return true }


      return false
    };

    ContainerEditor.prototype.willReceiveProps = function willReceiveProps (newProps) {
      Surface$$1.prototype.willReceiveProps.apply(this, arguments);
      this._deriveInternalState(newProps);
    };

    ContainerEditor.prototype.didMount = function didMount () {
      Surface$$1.prototype.didMount.apply(this, arguments);
      var editorSession = this.getEditorSession();
      editorSession.onUpdate('document', this._onContainerChanged, this, {
        path: [this.getContainerId(), 'nodes']
      });

    };

    ContainerEditor.prototype.dispose = function dispose () {
      Surface$$1.prototype.dispose.apply(this, arguments);
      var editorSession = this.getEditorSession();
      editorSession.off(this);
    };

    ContainerEditor.prototype.render = function render ($$) {
      var el = Surface$$1.prototype.render.call(this, $$);

      var doc = this.getDocument();
      var containerId = this.getContainerId();
      var containerNode = doc.get(containerId);
      if (!containerNode) {
        console.warn('No container node found for ', containerId);
      }
      el.addClass('sc-container-editor container-node ' + containerId)
          .attr("data-id", containerId);


      el.attr('spellcheck', this.props.spellcheck === 'native');

      containerNode.getNodes().forEach(function(node) {
        el.append(this._renderNode($$, node));
      }.bind(this));


      if (!this.props.disabled && !this.isEmpty()) {
        el.addClass('sm-enabled');
        el.setAttribute('contenteditable', true);
      }

      return el
    };

    ContainerEditor.prototype._renderNode = function _renderNode ($$, node) {
      if (!node) { throw new Error('Illegal argument') }
      if (node.isText()) {
        return Surface$$1.prototype.renderNode.call(this, $$, node)
      } else {
        var componentRegistry = this.context.componentRegistry;
        var ComponentClass = componentRegistry.get(node.type);
        if (ComponentClass.prototype._isCustomNodeComponent || ComponentClass.prototype._isIsolatedNodeComponent) {
          return $$(ComponentClass, { node: node }).ref(node.id)
        } else {
          return $$(IsolatedNodeComponent, { node: node }).ref(node.id)
        }
      }
    };

    ContainerEditor.prototype._deriveInternalState = function _deriveInternalState (props) {
      var _state = this._state;
      if (!props.hasOwnProperty('enabled') || props.enabled) {
        _state.enabled = true;
      } else {
        _state.enabled = false;
      }
    };

    ContainerEditor.prototype._selectNextIsolatedNode = function _selectNextIsolatedNode (direction) {
      var selState = this.getEditorSession().getSelectionState();
      var node = (direction === 'left') ? selState.getPreviousNode() : selState.getNextNode();
      if (!node || !node.isIsolatedNode()) { return false }
      if (
          (direction === 'left' && selState.isFirst()) ||
          (direction === 'right' && selState.isLast())
      ) {
        this.getEditorSession().setSelection({
          type: 'node',
          nodeId: node.id,
          containerId: selState.getContainer().id,
          surfaceId: this.id
        });
        return true
      }
      return false
    };

    ContainerEditor.prototype._handleLeftOrRightArrowKey = function _handleLeftOrRightArrowKey (event) {
      var this$1 = this;

      event.stopPropagation();
      var doc = this.getDocument();
      var sel = this.getEditorSession().getSelection();
      var left = (event.keyCode === keys.LEFT);
      var right = !left;
      var direction = left ? 'left' : 'right';

      if (sel && !sel.isNull()) {
        var container = doc.get(sel.containerId, 'strict');


        if (sel.isNodeSelection()) {
          var nodePos = container.getPosition(doc.get(sel.getNodeId()));
          if ((left && nodePos === 0) || (right && nodePos === container.length-1)) {
            event.preventDefault();
            return
          }
        }

        if (sel.isNodeSelection() && !event.shiftKey) {
          this.domSelection.collapse(direction);
        }
      }

      window.setTimeout(function () {
        this$1._updateModelSelection({ direction: direction });
      });
    };

    ContainerEditor.prototype._handleUpOrDownArrowKey = function _handleUpOrDownArrowKey (event) {
      var this$1 = this;

      event.stopPropagation();
      var doc = this.getDocument();
      var sel = this.getEditorSession().getSelection();
      var up = (event.keyCode === keys.UP);
      var down = !up;
      var direction = up ? 'left' : 'right';

      if (sel && !sel.isNull()) {
        var container = doc.get(sel.containerId, 'strict');

        if (sel.isNodeSelection()) {
          var nodePos = container.getPosition(doc.get(sel.getNodeId()));
          if ((up && nodePos === 0) || (down && nodePos === container.length-1)) {
            event.preventDefault();
            return
          }


          var editorSession = this.getEditorSession();



          if (!event.shiftKey) {
            event.preventDefault();
            if (up) {
              var prev = container.getChildAt(nodePos-1);
              setCursor(editorSession, prev, sel.containerId, 'after');
              return
            } else {
              var next = container.getChildAt(nodePos+1);
              setCursor(editorSession, next, sel.containerId, 'before');
              return
            }
          }
        }
      }

      window.setTimeout(function () {
        this$1._updateModelSelection({ direction: direction });
      });
    };

    ContainerEditor.prototype._handleTabKey = function _handleTabKey (event) {
      var editorSession = this.getEditorSession();
      var sel = editorSession.getSelection();
      if (sel.isNodeSelection() && sel.isFull()) {
        var comp = this.refs[sel.getNodeId()];
        if (comp && stepIntoIsolatedNode(editorSession, comp)) {
          event.preventDefault();
          event.stopPropagation();
          return
        }
      }
      Surface$$1.prototype._handleTabKey.call(this, event);
    };


    ContainerEditor.prototype.isContainerEditor = function isContainerEditor () {
      return true
    };


    ContainerEditor.prototype.getContainerId = function getContainerId () {
      return this.containerId
    };

    ContainerEditor.prototype.getContainer = function getContainer () {
      return this.getDocument().get(this.getContainerId())
    };

    ContainerEditor.prototype.isEmpty = function isEmpty () {
      var containerNode = this.getContainer();
      return (containerNode && containerNode.nodes.length === 0)
    };

    ContainerEditor.prototype.isEditable = function isEditable () {
      return Surface$$1.prototype.isEditable.call(this) && !this.isEmpty()
    };

    ContainerEditor.prototype.getTextTypes = function getTextTypes () {
      return this.textTypes || []
    };




    ContainerEditor.prototype.getTextCommands = function getTextCommands () {
      var textCommands = {};
      this.commandRegistry.each(function(cmd) {
        if (cmd.constructor.textTypeName) {
          textCommands[cmd.getName()] = cmd;
        }
      });
      return textCommands
    };


    ContainerEditor.prototype._onContainerChanged = function _onContainerChanged (change) {
      var this$1 = this;

      var doc = this.getDocument();

      var renderContext = RenderingEngine.createContext(this);
      var $$ = renderContext.$$;
      var container = this.getContainer();
      var path = container.getContentPath();
      for (var i = 0; i < change.ops.length; i++) {
        var op = change.ops[i];
        if (op.type === "update" && op.path[0] === path[0]) {
          var diff = op.diff;
          if (diff.type === "insert") {
            var nodeId = diff.getValue();
            var node = doc.get(nodeId);
            var nodeEl = (void 0);
            if (node) {
              nodeEl = this$1._renderNode($$, node);
            } else {



              nodeEl = $$('div');
            }
            this$1.insertAt(diff.getOffset(), nodeEl);
          } else if (diff.type === "delete") {
            this$1.removeAt(diff.getOffset());
          }
        }
      }
    };

    return ContainerEditor;
  }(Surface));

  ContainerEditor.prototype._isContainerEditor = true;

  var Toolbar = (function (Toolbox$$1) {
    function Toolbar () {
      Toolbox$$1.apply(this, arguments);
    }

    if ( Toolbox$$1 ) Toolbar.__proto__ = Toolbox$$1;
    Toolbar.prototype = Object.create( Toolbox$$1 && Toolbox$$1.prototype );
    Toolbar.prototype.constructor = Toolbar;

    Toolbar.prototype.render = function render ($$) {
      var this$1 = this;

      var el = $$('div').addClass(this.getClassNames());
      var activeToolGroups = this.state.activeToolGroups;

      activeToolGroups.forEach(function (toolGroup) {
        var toolGroupProps = Object.assign({}, toolGroup, {
          toolStyle: this$1.getToolStyle(),
          layout: 'horizontal',
          showIcons: true
        });
        el.append(
            $$(toolGroup.Class, toolGroupProps)
        );
      });
      return el
    };

    Toolbar.prototype.getActiveToolGroupNames = function getActiveToolGroupNames () {
      return this.props.toolGroups || ['text', 'document', 'annotations', 'default']
    };

    Toolbar.prototype.getClassNames = function getClassNames () {
      return 'sc-toolbar';
    };

    Toolbar.prototype.getToolStyle = function getToolStyle () {
      return 'outline'
    };

    Toolbar.prototype.showDisabled = function showDisabled () {
      return true
    };

    return Toolbar;
  }(Toolbox));

  var ProseEditor = (function (AbstractEditor$$1) {
    function ProseEditor () {
      AbstractEditor$$1.apply(this, arguments);
    }

    if ( AbstractEditor$$1 ) ProseEditor.__proto__ = AbstractEditor$$1;
    ProseEditor.prototype = Object.create( AbstractEditor$$1 && AbstractEditor$$1.prototype );
    ProseEditor.prototype.constructor = ProseEditor;

    ProseEditor.prototype.render = function render ($$) {
      var SplitPane = this.componentRegistry.get('split-pane');
      var el = $$('div').addClass('sc-prose-editor');
      var toolbar = this._renderToolbar($$);
      var editor = this._renderEditor($$);

      var ScrollPane = this.componentRegistry.get('scroll-pane');
      var Overlay = this.componentRegistry.get('overlay');
      var ContextMenu = this.componentRegistry.get('context-menu');
      var Dropzones = this.componentRegistry.get('dropzones');

      var contentPanel = $$(ScrollPane, {
        name: 'contentPanel',
        contextMenu: this.props.contextMenu || 'native',
        scrollbarPosition: 'right',
        scrollbarType: this.props.scrollbarType,
      }).append(
          editor,
          $$(Overlay),
          $$(ContextMenu),
          $$(Dropzones)
      ).ref('contentPanel');

      el.append(
          $$(SplitPane, {splitType: 'horizontal'}).append(
              toolbar,
              contentPanel
          )
      );
      return el
    };

    ProseEditor.prototype._renderToolbar = function _renderToolbar ($$) {
      var commandStates = this.commandManager.getCommandStates();
      return $$('div').addClass('se-toolbar-wrapper').append(
          $$(Toolbar, {
            commandStates: commandStates
          }).ref('toolbar')
      )
    };

    ProseEditor.prototype._renderEditor = function _renderEditor ($$) {
      var configurator = this.getConfigurator();
      return $$(ContainerEditor, {
        disabled: this.props.disabled,
        editorSession: this.editorSession,
        node: this.doc.get('body'),
        commands: configurator.getSurfaceCommandNames(),
        textTypes: configurator.getTextTypes()
      }).ref('body')
    };

    return ProseEditor;
  }(AbstractEditor));

  var SpellError = (function (Marker$$1) {
    function SpellError () {
      Marker$$1.apply(this, arguments);
    }

    if ( Marker$$1 ) SpellError.__proto__ = Marker$$1;
    SpellError.prototype = Object.create( Marker$$1 && Marker$$1.prototype );
    SpellError.prototype.constructor = SpellError;

    SpellError.prototype.invalidate = function invalidate () {
      this.remove();
    };

    return SpellError;
  }(Marker));

  SpellError.schema = {
    type: 'spell-error',
    suggestions: { type: ['object'], default: [] }
  };

  SpellError.scope = 'document';

  function sendRequest(params, cb) {
    return new Promise(function(resolve, reject) {
      var method = (params.method || 'GET').toUpperCase();
      var url = params.url;
      if (['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) < 0) {
        throw new Error("Parameter 'method' must be 'GET', 'POST', 'PUT', or 'DELETE'.")
      }
      if (!url) {
        throw new Error("Parameter 'url' is required.")
      }
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {


        if (xmlhttp.readyState === 4) { return _done() }
      };
      xmlhttp.open(method, url, true);
      if (params.header) {
        forEach(params.header, function(val, key) {
          xmlhttp.setRequestHeader(key, val);
        });
      }
      if (params.data) {
        xmlhttp.send(JSON.stringify(params.data));
      } else {
        xmlhttp.send();
      }

      function _done() {
        if (xmlhttp.status === 200) {
          var response = xmlhttp.responseText;
          if (cb) { cb(null, response); }
          resolve(response);
        } else {
          console.error(xmlhttp.statusText);
          if (cb) { cb(xmlhttp.status); }
          reject(xmlhttp.statusText, xmlhttp.status);
        }
      }
    })
  }

  var DEFAULT_API_URL = 'http://localhost:4777/api/check';

  var SpellCheckManager = function SpellCheckManager(editorSession, options) {
    options = options || {};
    var wait = options.wait || 750;

    this.editorSession = editorSession;
    this.apiURL = options.apiURL || DEFAULT_API_URL;


    this.textPropertyManager = editorSession.markersManager;
    this.markersManager = editorSession.markersManager;

    this._schedule = {};
    this._scheduleCheck = debounce(this._runSpellCheck.bind(this), wait);

    editorSession.onFinalize('document', this._onDocumentChange, this);
  };

  SpellCheckManager.prototype.dispose = function dispose () {
    this.editorSession.off(this);
  };

  SpellCheckManager.prototype.check = function check (path) {
    this._runSpellCheck(String(path));
  };

  SpellCheckManager.prototype.runGlobalCheck = function runGlobalCheck () {
    var this$1 = this;

    var paths = Object.keys(this.textPropertyManager._textProperties);
    paths.forEach(function (p) {
      this$1._runSpellCheck(p);
    });
  };

  SpellCheckManager.prototype._onDocumentChange = function _onDocumentChange (change, info) {
    var this$1 = this;

    if (info.spellcheck) { return }



    var textProperties = this.textPropertyManager._textProperties;
    Object.keys(change.updated).forEach(function (pathStr) {
      if (textProperties[pathStr]) { this$1._scheduleCheck(pathStr); }
    });
  };

  SpellCheckManager.prototype._runSpellCheck = function _runSpellCheck (pathStr) {
    var this$1 = this;


    var path = pathStr.split(',');
    var text = this.editorSession.getDocument().get(path);
    var lang = this.editorSession.getLanguage();
    if (!text || !isString(text)) { return }
    sendRequest({
      method: 'POST',
      url: this.apiURL,
      header: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      data: {
        text: text,
        lang: lang
      }
    }).then(function (data) {
      data = JSON.parse(data);
      this$1._addSpellErrors(path, data);
    }).catch(function(err) {
      console.error(err);
    });
  };


  SpellCheckManager.prototype._addSpellErrors = function _addSpellErrors (path, data) {
    var doc = this.editorSession.getDocument();
    var oldErrors = doc.getIndex('markers').get(path).filter(function (marker) {
      return marker.type === 'spell-error'
    });
    var newErrors = data.map(function(m) {
      return {
        type: 'spell-error',
        start: {
          path: path,
          offset: m.start
        },
        end: {
          offset: m.end
        },
        suggestions: m.suggestions
      }
    });
    this.editorSession.transaction(function (tx) {

      oldErrors.forEach(function (spellError) {
        tx.delete(spellError.id);
      });

      newErrors.forEach(function (spellError) {
        tx.create(spellError);
      });
    }, { history: false, spellcheck: true });
  };

  var FontAwesomeIcon = (function (Component$$1) {
    function FontAwesomeIcon() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      Component$$1.apply(this, args);
    }

    if ( Component$$1 ) FontAwesomeIcon.__proto__ = Component$$1;
    FontAwesomeIcon.prototype = Object.create( Component$$1 && Component$$1.prototype );
    FontAwesomeIcon.prototype.constructor = FontAwesomeIcon;

    FontAwesomeIcon.prototype.render = function render ($$) {
      return $$('i').addClass('fa ' + this.props.icon)
    };

    return FontAwesomeIcon;
  }(Component));

  function includes$2(arr, val) {
    if (!arr) { return false }
    return (arr.indexOf(val) >= 0)
  }

  var TOCProvider = (function (EventEmitter$$1) {
    function TOCProvider(document, config) {
      EventEmitter$$1.call(this, document, config);
      this.document = document;
      this.config = config;

      this.entries = this.computeEntries();
      if (this.entries.length > 0) {
        this.activeEntry = this.entries[0].id;
      } else {
        this.activeEntry = null;
      }

      this.document.on('document:changed', this.handleDocumentChange, this);
    }

    if ( EventEmitter$$1 ) TOCProvider.__proto__ = EventEmitter$$1;
    TOCProvider.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    TOCProvider.prototype.constructor = TOCProvider;

    TOCProvider.prototype.dispose = function dispose () {
      var doc = this.getDocument();
      doc.disconnect(this);
    };



    TOCProvider.prototype.handleDocumentChange = function handleDocumentChange (change) {
      var doc = this.getDocument();
      var needsUpdate = false;
      var tocTypes = this.constructor.tocTypes;







      for (var i = 0; i < change.ops.length; i++) {
        var op = change.ops[i];
        var nodeType = (void 0);
        if (op.isCreate() || op.isDelete()) {
          var nodeData = op.getValue();
          nodeType = nodeData.type;
          if (includes$2(tocTypes, nodeType)) {
            needsUpdate = true;
            break
          }
        } else {
          var id = op.path[0];
          var node = doc.get(id);
          if (node && includes$2(tocTypes, node.type)) {
            needsUpdate = true;
            break
          }
        }
      }
      if (needsUpdate) {
        this.entries = this.computeEntries();
        this.emit('toc:updated');
      }
    };

    TOCProvider.prototype.computeEntries = function computeEntries () {
      var doc = this.getDocument();
      var config = this.config;
      var entries = [];
      var contentNodes = doc.get(config.containerId).nodes;
      forEach(contentNodes, function(nodeId) {
        var node = doc.get(nodeId);
        if (node.type === 'heading') {
          entries.push({
            id: node.id,
            name: node.content,
            level: node.level,
            node: node
          });
        }
      });
      return entries
    };

    TOCProvider.prototype.getEntries = function getEntries () {
      return this.entries
    };

    TOCProvider.prototype.getDocument = function getDocument () {
      return this.document
    };

    TOCProvider.prototype.markActiveEntry = function markActiveEntry (scrollPane) {
      var panelContent = scrollPane.getContentElement();
      var contentHeight = scrollPane.getContentHeight();
      var scrollPaneHeight = scrollPane.getHeight();
      var scrollPos = scrollPane.getScrollPosition();

      var scrollBottom = scrollPos + scrollPaneHeight;
      var regularScanline = scrollPos;
      var smartScanline = 2 * scrollBottom - contentHeight;
      var scanline = Math.max(regularScanline, smartScanline);

      var tocNodes = this.computeEntries();
      if (tocNodes.length === 0) { return }


      var activeEntry = tocNodes[0].id;
      for (var i = tocNodes.length - 1; i >= 0; i--) {
        var tocNode = tocNodes[i];
        var nodeEl = panelContent.find('[data-id="'+tocNode.id+'"]');
        if (!nodeEl) {
          console.warn('Not found in Content panel', tocNode.id);
          return
        }
        var panelOffset = scrollPane.getPanelOffsetForElement(nodeEl);
        if (scanline >= panelOffset) {
          activeEntry = tocNode.id;
          break
        }
      }

      if (this.activeEntry !== activeEntry) {
        this.activeEntry = activeEntry;
        this.emit('toc:updated');
      }
    };

    return TOCProvider;
  }(EventEmitter));

  TOCProvider.tocTypes = ['heading'];

  var Router = (function (EventEmitter$$1) {
    function Router() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      EventEmitter$$1.apply(this, args);
      this.__isStarted__ = false;
    }

    if ( EventEmitter$$1 ) Router.__proto__ = EventEmitter$$1;
    Router.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    Router.prototype.constructor = Router;


    Router.prototype.start = function start () {
      var window = DefaultDOMElement.getBrowserWindow();
      window.on('hashchange', this._onHashChange, this);
      this.__isStarted__ = true;
    };


    Router.prototype.readRoute = function readRoute () {
      if (!this.__isStarted__) { this.start(); }
      return this.parseRoute(this.getRouteString())
    };


    Router.prototype.writeRoute = function writeRoute (route, opts) {
      opts = opts || {};
      var routeString = this.stringifyRoute(route);
      if (!routeString) {
        this.clearRoute(opts);
      } else {
        this._writeRoute(routeString, opts);
      }
    };

    Router.prototype.dispose = function dispose () {
      var window = DefaultDOMElement.getBrowserWindow();
      window.off(this);
    };


    Router.prototype.parseRoute = function parseRoute (routeString) {
      return Router.routeStringToObject(routeString)
    };


    Router.prototype.stringifyRoute = function stringifyRoute (route) {
      return Router.objectToRouteString(route)
    };

    Router.prototype.getRouteString = function getRouteString () {
      return window.location.hash.slice(1)
    };

    Router.prototype._writeRoute = function _writeRoute (route, opts) {
      this.__isSaving__ = true;
      try {
        if (opts.replace) {
          window.history.replaceState({} , '', '#'+route);
        } else {
          window.history.pushState({} , '', '#'+route);
        }
      } finally {
        this.__isSaving__ = false;
      }
    };

    Router.prototype.clearRoute = function clearRoute (opts) {
      this._writeRoute('', opts);
    };

    Router.prototype._onHashChange = function _onHashChange () {

      if (this.__isSaving__) {
        return
      }
      if (this.__isLoading__) {
        console.error('FIXME: router is currently applying a route.');
        return
      }
      this.__isLoading__ = true;
      try {
        var routeString = this.getRouteString();
        var route = this.parseRoute(routeString);
        this.emit('route:changed', route);
      } finally {
        this.__isLoading__ = false;
      }
    };

    return Router;
  }(EventEmitter));

  Router.objectToRouteString = function(obj) {
    var route = [];
    forEach(obj, function(val, key) {
      route.push(key+'='+val);
    });
    return route.join(',')
  };

  Router.routeStringToObject = function(routeStr) {
    var obj = {};

    if (!routeStr) { return obj }
    var params = routeStr.split(',');
    params.forEach(function(param) {
      var tuple = param.split('=');
      if (tuple.length !== 2) {
        throw new Error('Illegal route.')
      }
      obj[tuple[0].trim()] = tuple[1].trim();
    });
    return obj
  };

  var NodeRegistry = (function (Registry$$1) {
    function NodeRegistry () {
      Registry$$1.apply(this, arguments);
    }

    if ( Registry$$1 ) NodeRegistry.__proto__ = Registry$$1;
    NodeRegistry.prototype = Object.create( Registry$$1 && Registry$$1.prototype );
    NodeRegistry.prototype.constructor = NodeRegistry;

    NodeRegistry.prototype.register = function register (nodeClazz) {
      var type = nodeClazz.prototype.type;
      if ( typeof type !== 'string' || type === '' ) {
        console.error('#### nodeClazz', nodeClazz);
        throw new Error( 'Node names must be strings and must not be empty')
      }
      if ( !( nodeClazz.prototype._isNode) ) {
        throw new Error( 'Nodes must be subclasses of Substance.Data.Node' )
      }
      if (this.contains(type)) {
        throw new Error('Node class is already registered: ' + type)
      }
      this.add(type, nodeClazz);
    };

    return NodeRegistry;
  }(Registry));

  var Schema = function Schema(name, version) {

    this.name = name;

    this.version = version;

    this.nodeRegistry = new NodeRegistry();

    this.tocTypes = [];


    this.addNodes(this.getBuiltIns());
  };


  Schema.prototype.addNodes = function addNodes (nodes) {
    if (!nodes) { return }
    forEach(nodes, function(NodeClass) {
      if (!NodeClass.prototype._isNode) {
        console.error('Illegal node class: ', NodeClass);
      } else {
        this.addNode(NodeClass);
      }
    }.bind(this));
  };

  Schema.prototype.addNode = function addNode (NodeClass) {
    this.nodeRegistry.register(NodeClass);
    if (NodeClass.tocType) {
      this.tocTypes.push(NodeClass.type);
    }
  };


  Schema.prototype.getNodeClass = function getNodeClass (name) {
    return this.nodeRegistry.get(name)
  };


  Schema.prototype.getBuiltIns = function getBuiltIns () {
    return []
  };


  Schema.prototype.isInstanceOf = function isInstanceOf (type, parentType) {
    var NodeClass = this.getNodeClass(type);
    if (NodeClass) {
      return Node.isInstanceOf(NodeClass, parentType)
    }
    return false
  };


  Schema.prototype.each = function each () {
    this.nodeRegistry.each.apply(this.nodeRegistry, arguments);
  };


  Schema.prototype.getTocTypes = function getTocTypes () {
    return this.tocTypes
  };


  Schema.prototype.getDefaultTextType = function getDefaultTextType () {
    throw new Error('Schmema.prototype.getDefaultTextType() must be overridden.')
  };

  Schema.prototype.getNodeSchema = function getNodeSchema (type) {
    var NodeClass = this.getNodeClass(type);
    if (!NodeClass) {
      console.error('Unknown node type ', type);
      return null
    }
    return NodeClass.schema
  };

  var DocumentSchema = (function (Schema$$1) {
    function DocumentSchema(name, version, options) {
      if ( options === void 0 ) options = {};

      Schema$$1.call(this, name, version);

      this.defaultTextType = options.defaultTextType;
    }

    if ( Schema$$1 ) DocumentSchema.__proto__ = Schema$$1;
    DocumentSchema.prototype = Object.create( Schema$$1 && Schema$$1.prototype );
    DocumentSchema.prototype.constructor = DocumentSchema;



    DocumentSchema.prototype.getDefaultTextType = function getDefaultTextType () {
      return this.defaultTextType
    };

    DocumentSchema.prototype.isAnnotationType = function isAnnotationType (type) {
      var nodeClass = this.getNodeClass(type);
      return (nodeClass && nodeClass.prototype._isPropertyAnnotation)
    };

    DocumentSchema.prototype.getBuiltIns = function getBuiltIns () {
      return [DocumentNode, PropertyAnnotation, Container, ContainerAnnotation]
    };

    return DocumentSchema;
  }(Schema));

  var ComponentRegistry = (function (Registry$$1) {
    function ComponentRegistry(entries) {
      Registry$$1.call(this, entries, function(ComponentClass) {
        if (!ComponentClass.prototype._isComponent) {
          throw new Error('Component registry: wrong type. Expected a ComponentClass. Was: ' + String(ComponentClass))
        }
      });
    }

    if ( Registry$$1 ) ComponentRegistry.__proto__ = Registry$$1;
    ComponentRegistry.prototype = Object.create( Registry$$1 && Registry$$1.prototype );
    ComponentRegistry.prototype.constructor = ComponentRegistry;

    return ComponentRegistry;
  }(Registry));

  var FontAwesomeIconProvider = function FontAwesomeIconProvider(icons) {
    this.map = {};
    forEach(icons, function(config, name) {
      var faClass = config['fontawesome'];
      if (faClass) {
        this.addIcon(name, faClass);
      }
    }.bind(this));
  };

  FontAwesomeIconProvider.prototype.renderIcon = function renderIcon ($$, name) {
    var iconClass = this.map[name];
    if (iconClass) {
      return $$(FontAwesomeIcon, {icon:iconClass})
    }
  };

  FontAwesomeIconProvider.prototype.addIcon = function addIcon (name, faClass) {
    this.map[name] = faClass;
  };

  var DefaultLabelProvider = function DefaultLabelProvider(labels, lang) {
    this.lang = lang || 'en';
    this.labels = labels;
  };

  DefaultLabelProvider.prototype.getLabel = function getLabel (name) {
    var labels = this.labels[this.lang];
    if (!labels) { return name }
    return labels[name] || name
  };

  var ToolGroup = (function (Component$$1) {
    function ToolGroup () {
      Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) ToolGroup.__proto__ = Component$$1;
    ToolGroup.prototype = Object.create( Component$$1 && Component$$1.prototype );
    ToolGroup.prototype.constructor = ToolGroup;

    ToolGroup.prototype.render = function render ($$) {
      var this$1 = this;


      var tools = this.props.tools;
      var el = $$('div').addClass('sc-tool-group');
      el.addClass('sm-target-'+this.props.name);
      if (this.props.layout) {
        el.addClass('sm-layout-'+this.props.layout);
      }

      tools.forEach(function (tool) {
        var toolProps = Object.assign({}, tool.toolProps, {
          showIcon: this$1.props.showIcons,
          showLabel: this$1.props.showLabels,
          style: this$1.props.toolStyle
        });
        el.append(
            $$(tool.Class, toolProps)
        );
      });
      return el
    };

    return ToolGroup;
  }(Component));

  var SaveHandlerStub = function SaveHandlerStub () {};

  SaveHandlerStub.prototype.saveDocument = function saveDocument (ref) {
    var fileManager = ref.fileManager;

    console.info('Simulating save ...');

    return fileManager.sync()
        .then(function () {


          console.info('Creating document snapshot...');
        })

  };

  var Configurator = function Configurator() {
    this.config = {
      schema: {},
      nodes: {},
      components: {},
      converters: {},
      importers: {},
      exporters: {},
      fileProxies: [],
      commands: {},
      tools: new Map(),
      toolGroups: new Map(),
      textTypes: [],
      editingBehaviors: [],
      macros: [],
      dropHandlers: [],
      keyboardShortcuts: [],
      icons: {},
      labels: {},
      lang: 'en_US',
      SaveHandlerClass: null
    };
  };





  Configurator.prototype.defineSchema = function defineSchema (schema) {
    this.config.schema = schema;
  };


  Configurator.prototype.addNode = function addNode (NodeClass) {
    var type = NodeClass.type;
    if (!type) {
      throw new Error('A NodeClass must have a type.')
    }
    if (this.config.nodes[type]) {
      throw new Error('NodeClass with this type name is already registered: ' + type)
    }
    this.config.nodes[type] = NodeClass;
  };


  Configurator.prototype.addConverter = function addConverter (type, converter) {
    var converters = this.config.converters[type];
    if (!converters) {
      converters = {};
      this.config.converters[type] = converters;
    }
    if (!converter.type) {
      throw new Error('A converter needs an associated type.')
    }
    converters[converter.type] = converter;
  };


  Configurator.prototype.addImporter = function addImporter (type, ImporterClass) {
    this.config.importers[type] = ImporterClass;
  };


  Configurator.prototype.addExporter = function addExporter (type, ExporterClass) {
    this.config.exporters[type] = ExporterClass;
  };


  Configurator.prototype.addComponent = function addComponent (nodeType, ComponentClass, force) {
    if (!force && this.config.components[nodeType]) {
      throw new Error(nodeType+' already registered')
    }
    if (!ComponentClass) {
      throw new Error('Provided nil for component '+nodeType)
    }
    if (!ComponentClass.prototype._isComponent) {
      throw new Error('ComponentClass must be a subclass of ui/Component.')
    }
    this.config.components[nodeType] = ComponentClass;
  };

  Configurator.prototype.addCommand = function addCommand (name, CommandClass, options) {
    if (!isString(name)) {
      throw new Error("Expecting 'name' to be a String")
    }
    if (!CommandClass) {
      throw new Error('Provided nil for command '+name)
    }
    if (!CommandClass.prototype._isCommand) {
      throw new Error("Expecting 'CommandClass' to be of type ui/Command.")
    }
    this.config.commands[name] = {
      name: name,
      CommandClass: CommandClass,
      options: options || {}
    };
  };

  Configurator.prototype.addToolGroup = function addToolGroup (name, ToolGroupClass, options) {
    options = options || {};
    ToolGroupClass = ToolGroupClass || ToolGroup;

    this.config.toolGroups.set(name, {
      name: name,
      tools: new Map(),
      Class: ToolGroupClass,
      options: options
    });
  };

  Configurator.prototype.addTool = function addTool (name, ToolClass, options) {
    var this$1 = this;

    options = options || {};

    if (options.target) {
      console.warn('DEPRECATED: please use `toolGroup` instead of `target`', name);
    }
    var toolGroupNames = options.toolGroup || options.target;
    if (isString(toolGroupNames)) {
      toolGroupNames = [ toolGroupNames ];
    }

    if (!toolGroupNames && options.overlay) {
      toolGroupNames = [ 'overlay' ];
    } else if (!toolGroupNames) {
      toolGroupNames = [ 'default' ];
    }

    if (!isString(name)) {
      throw new Error("Expecting 'name' to be a String")
    }
    if (!ToolClass) {
      throw new Error('Provided nil for tool '+name)
    }
    if (!ToolClass || !ToolClass.prototype._isTool) {
      throw new Error("Expecting 'ToolClass' to be of type ui/Tool. name:")
    }

    toolGroupNames.forEach(function (toolGroupName) {
      var toolGroup = this$1.config.toolGroups.get(toolGroupName);
      if (!toolGroup) {
        console.error(("No toolGroup registered with name: " + toolGroupName));
        return
      }
      toolGroup.tools.set(name, {
        name: name,
        Class: ToolClass,
        options: options || {}
      });
    });
  };


  Configurator.prototype.addIcon = function addIcon (iconName, options) {
    var iconConfig = this.config.icons[iconName];
    if (!iconConfig) {
      iconConfig = {};
      this.config.icons[iconName] = iconConfig;
    }
    Object.assign(iconConfig, options);
  };


  Configurator.prototype.addLabel = function addLabel (labelName, label) {
    if (isString(label)) {
      if(!this.config.labels['en']) {
        this.config.labels['en'] = {};
      }
      this.config.labels['en'][labelName] = label;
    } else {
      forEach(label, function(label, lang) {
        if (!this.config.labels[lang]) {
          this.config.labels[lang] = {};
        }
        this.config.labels[lang][labelName] = label;
      }.bind(this));
    }
  };


  Configurator.prototype.addSeed = function addSeed (seed) {
    this.config.seed = seed;
  };

  Configurator.prototype.addTextType = function addTextType (textType, options) {
    this.config.textTypes.push({
      spec: textType,
      options: options || {}
    });
  };


  Configurator.prototype.addEditingBehavior = function addEditingBehavior (editingBehavior) {
    this.config.editingBehaviors.push(editingBehavior);
  };

  Configurator.prototype.addMacro = function addMacro (macro) {
    this.config.macros.push(macro);
  };

  Configurator.prototype.addDragAndDrop = function addDragAndDrop (DragAndDropHandlerClass) {


    console.warn('DEPRECATED: Use addDropHandler() instead');
    if (!DragAndDropHandlerClass.prototype._isDragAndDropHandler) {
      throw new Error('Only instances of DragAndDropHandler are allowed.')
    }
    this.addDropHandler(new DragAndDropHandlerClass());
  };

  Configurator.prototype.addDropHandler = function addDropHandler (dropHandler) {

    if (dropHandler._isDragAndDropHandler) {
      dropHandler.type = dropHandler.type || 'drop-asset';
    }
    this.config.dropHandlers.push(dropHandler);
  };

  Configurator.prototype.addKeyboardShortcut = function addKeyboardShortcut (combo, spec) {
    var entry = {
      key: combo,
      spec: spec
    };
    this.config.keyboardShortcuts.push(entry);
  };

  Configurator.prototype.addFileProxy = function addFileProxy (FileProxyClass) {
    this.config.fileProxies.push(FileProxyClass);
  };

  Configurator.prototype.getFileAdapters = function getFileAdapters () {
    return this.config.fileProxies.slice(0)
  };


  Configurator.prototype.import = function import$1 (pkg, options) {
    pkg.configure(this, options || {});
    return this
  };




  Configurator.prototype.getConfig = function getConfig () {
    return this.config
  };

  Configurator.prototype.getStyles = function getStyles () {
    return this.config.styles
  };

  Configurator.prototype.getSchema = function getSchema () {
    var schemaConfig = this.config.schema;


    var schema = new DocumentSchema(schemaConfig.name, '1.0.0');
    schema.getDefaultTextType = function() {
      return schemaConfig.defaultTextType
    };
    schema.addNodes(this.config.nodes);
    return schema
  };

  Configurator.prototype.createArticle = function createArticle (seed) {
    var schemaConfig = this.config.schema;
    var schema = this.getSchema();
    var doc = new schemaConfig.ArticleClass(schema);
    if (seed) {
      seed(doc);
    }
    return doc
  };

  Configurator.prototype.createImporter = function createImporter (type, context, options) {
    if ( options === void 0 ) options = {};

    var ImporterClass = this.config.importers[type];
    var config = Object.assign({
      schema: this.getSchema(),
      converters: this.getConverterRegistry().get(type),
      DocumentClass: this.config.schema.ArticleClass
    }, options);
    return new ImporterClass(config, context)
  };

  Configurator.prototype.createExporter = function createExporter (type, context, options) {
    if ( options === void 0 ) options = {};

    var ExporterClass = this.config.exporters[type];
    var config = Object.assign({
      schema: this.getSchema(),
      converters: this.getConverterRegistry().get(type)
    }, options);
    return new ExporterClass(config, context)
  };

  Configurator.prototype.getToolGroups = function getToolGroups () {
    return this.config.toolGroups
  };

  Configurator.prototype.getTools = function getTools (toolGroupName) {
    return this.config.toolGroups.get(toolGroupName).tools
  };

  Configurator.prototype.getComponentRegistry = function getComponentRegistry () {
    var componentRegistry = new ComponentRegistry();
    forEach(this.config.components, function(ComponentClass, name) {
      componentRegistry.add(name, ComponentClass);
    });
    return componentRegistry
  };

  Configurator.prototype.getCommands = function getCommands () {
    return map(this.config.commands, function(item, name) {
      return new item.CommandClass(Object.assign({name: name}, item.options))
    })
  };

  Configurator.prototype.getSurfaceCommandNames = function getSurfaceCommandNames () {
    var commands = this.getCommands();
    var commandNames = commands.map(function(C) {
      return C.type
    });
    return commandNames
  };


  Configurator.prototype.getConverterRegistry = function getConverterRegistry () {
    if (!this.converterRegistry) {
      var converterRegistry = new Registry();
      forEach(this.config.converters, function(converters, name) {
        converterRegistry.add(name, new Registry(converters));
      });
      this.converterRegistry = converterRegistry;
    }
    return this.converterRegistry
  };

  Configurator.prototype.getDropHandlers = function getDropHandlers () {
    return this.config.dropHandlers.slice(0)
  };

  Configurator.prototype.getSeed = function getSeed () {
    return this.config.seed
  };

  Configurator.prototype.getTextTypes = function getTextTypes () {
    return this.config.textTypes.map(function(t) {
      return t.spec
    })
  };

  Configurator.prototype.getIconProvider = function getIconProvider () {
    return new FontAwesomeIconProvider(this.config.icons)
  };

  Configurator.prototype.getLabelProvider = function getLabelProvider () {
    return new DefaultLabelProvider(this.config.labels)
  };

  Configurator.prototype.getEditingBehavior = function getEditingBehavior () {
    var editingBehavior = new EditingBehavior();
    this.config.editingBehaviors.forEach(function(behavior) {
      behavior.register(editingBehavior);
    });
    return editingBehavior
  };

  Configurator.prototype.getMacros = function getMacros () {
    return this.config.macros
  };

  Configurator.prototype.getKeyboardShortcuts = function getKeyboardShortcuts () {
    return this.config.keyboardShortcuts
  };

  Configurator.prototype.setDefaultLanguage = function setDefaultLanguage (lang) {
    this.config.lang = lang;
  };

  Configurator.prototype.getDefaultLanguage = function getDefaultLanguage () {
    return this.config.lang || 'en_US'
  };

  Configurator.prototype.setSaveHandlerClass = function setSaveHandlerClass (SaveHandlerClass) {
    this.config.SaveHandlerClass = SaveHandlerClass;
  };

  Configurator.prototype.getSaveHandler = function getSaveHandler () {
    var SaveHandler = this.config.SaveHandlerClass || SaveHandlerStub;
    return new SaveHandler()
  };

  var RichTextAreaEditor = (function (ProseEditor$$1) {
    function RichTextAreaEditor () {
      ProseEditor$$1.apply(this, arguments);
    }

    if ( ProseEditor$$1 ) RichTextAreaEditor.__proto__ = ProseEditor$$1;
    RichTextAreaEditor.prototype = Object.create( ProseEditor$$1 && ProseEditor$$1.prototype );
    RichTextAreaEditor.prototype.constructor = RichTextAreaEditor;

    RichTextAreaEditor.prototype.didMount = function didMount () {

      var scrollPane = this.context.scrollPane;
      var Overlay$$1 = this.componentRegistry.get('overlay');
      var Dropzones$$1 = this.componentRegistry.get('dropzones');

      this.overlay = new Overlay$$1(this, {
        toolGroups: ['annotations', 'text', 'overlay']
      }).mount(scrollPane.el);

      this.dropzones = new Dropzones$$1(this, {}).mount(scrollPane.el);
    };

    RichTextAreaEditor.prototype.dispose = function dispose () {
      this.overlay.remove();
      this.dropzones.remove();
    };

    RichTextAreaEditor.prototype.render = function render ($$) {
      var el = $$('div').addClass('sc-rich-text-area-editor');
      var configurator = this.getConfigurator();

      el.append(
          $$(ContainerEditor, {
            disabled: this.props.disabled,
            editorSession: this.editorSession,
            node: this.doc.get('body'),
            commands: configurator.getSurfaceCommandNames(),
            textTypes: configurator.getTextTypes()
          }).ref('body')
      );
      return el
    };

    return RichTextAreaEditor;
  }(ProseEditor));

  var RichTextAreaHTMLImporter = (function (HTMLImporter$$1) {
    function RichTextAreaHTMLImporter () {
      HTMLImporter$$1.apply(this, arguments);
    }

    if ( HTMLImporter$$1 ) RichTextAreaHTMLImporter.__proto__ = HTMLImporter$$1;
    RichTextAreaHTMLImporter.prototype = Object.create( HTMLImporter$$1 && HTMLImporter$$1.prototype );
    RichTextAreaHTMLImporter.prototype.constructor = RichTextAreaHTMLImporter;

    RichTextAreaHTMLImporter.prototype.convertDocument = function convertDocument (bodyEls) {
      if (!isArray(bodyEls)) {
        bodyEls = [ bodyEls ];
      }
      this.convertContainer(bodyEls, 'body');
    };

    return RichTextAreaHTMLImporter;
  }(HTMLImporter));

  var RichTextAreaHTMLExporter = (function (HTMLExporter$$1) {
    function RichTextAreaHTMLExporter () {
      HTMLExporter$$1.apply(this, arguments);
    }

    if ( HTMLExporter$$1 ) RichTextAreaHTMLExporter.__proto__ = HTMLExporter$$1;
    RichTextAreaHTMLExporter.prototype = Object.create( HTMLExporter$$1 && HTMLExporter$$1.prototype );
    RichTextAreaHTMLExporter.prototype.constructor = RichTextAreaHTMLExporter;

    RichTextAreaHTMLExporter.prototype.convertDocument = function convertDocument (doc) {
      var body = doc.get('body');
      var elements = this.convertContainer(body);
      return elements.map(function (el) {
        return el.outerHTML
      }).join('')
    };

    return RichTextAreaHTMLExporter;
  }(HTMLExporter));

  var RichTextAreaPackage = {
    name: 'rich-text-area',
    configure: function(config) {
      config.defineSchema({
        name: 'rich-text-area',
        ArticleClass: Document,
        defaultTextType: 'paragraph'
      });

      var defaultOptions = {
        disableCollapsedCursor: true,
        toolGroup: 'overlay'
      };

      config.import(BasePackage, defaultOptions);
      config.import(ParagraphPackage, defaultOptions);


      config.addImporter('html', RichTextAreaHTMLImporter);
      config.addExporter('html', RichTextAreaHTMLExporter);
    }
  };

  var Xref = (function (PropertyAnnotation$$1) {
    function Xref () {
      PropertyAnnotation$$1.apply(this, arguments);
    }if ( PropertyAnnotation$$1 ) Xref.__proto__ = PropertyAnnotation$$1;
    Xref.prototype = Object.create( PropertyAnnotation$$1 && PropertyAnnotation$$1.prototype );
    Xref.prototype.constructor = Xref;



    return Xref;
  }(PropertyAnnotation));

  Xref.define({
    type: 'xref',
    content: { type: 'string', optional: true }
  });


  Xref.fragmentation = Fragmenter.SHOULD_NOT_SPLIT;

  var XrefHTMLConverter = {

    type: 'xref',
    tagName: 'span',

    matchElement: function(el) {
      return el.is('span') && el.attr('data-type') === 'xref'
    }

  };

  var XrefPackage = {
    name: 'xref',
    configure: function(config, ref) {
      var toolGroup = ref.toolGroup;
      var disableCollapsedCursor = ref.disableCollapsedCursor;

      config.addNode(Xref);
      config.addComponent('xref', AnnotationComponent);
      config.addConverter('html', XrefHTMLConverter);

      config.addCommand('xref', AnnotationCommand, {
        nodeType: 'xref',
        disableCollapsedCursor: disableCollapsedCursor
      });
      config.addTool('xref', AnnotationTool, {
        toolGroup: toolGroup || 'annotations'
      });
      config.addIcon('xref', { 'fontawesome': 'fa-comment'});
      config.addLabel('xref', 'Comment');
    }
  };

  var MinimalSwitchTextTypeTool = (function (Tool$$1) {
    function MinimalSwitchTextTypeTool () {
      Tool$$1.apply(this, arguments);
    }

    if ( Tool$$1 ) MinimalSwitchTextTypeTool.__proto__ = Tool$$1;
    MinimalSwitchTextTypeTool.prototype = Object.create( Tool$$1 && Tool$$1.prototype );
    MinimalSwitchTextTypeTool.prototype.constructor = MinimalSwitchTextTypeTool;

    MinimalSwitchTextTypeTool.prototype.render = function render ($$) {
      var this$1 = this;

      var Button$$1 = this.getComponent('button');
      var el = $$('div').addClass('sc-minimal-switch-text-type');
      this.props.textTypes.forEach(function (textType) {
        var button = $$(Button$$1, {
          label: textType.name,
          active: this$1.props.currentTextType.name === textType.name,
          disabled: this$1.props.disabled,
          style: this$1.props.style
        }).attr('data-type', textType.name)
            .on('click', this$1.handleClick);
        el.append(button);
      });
      return el
    };

    MinimalSwitchTextTypeTool.prototype.handleClick = function handleClick (e) {
      var newTextType = e.currentTarget.dataset.type;
      e.preventDefault();
      this.context.commandManager.executeCommand(this.getCommandName(), {
        textType: newTextType
      });
    };

    return MinimalSwitchTextTypeTool;
  }(Tool));

  var MinimalSwitchTextTypePackage = {
    name: 'minimal-switch-text-type',
    configure: function(config) {
      config.addToolGroup('text');
      config.addCommand('minimal-switch-text-type', SwitchTextTypeCommand, {
        disableCollapsedCursor: true
      });
      config.addTool('minimal-switch-text-type', MinimalSwitchTextTypeTool, {
        toolGroup: 'text'
      });

      config.addLabel('paragraph', 'P');
      config.addLabel('heading1', 'H1');
      config.addLabel('heading2', 'H2');
      config.addLabel('heading3', 'H3');

    }
  };

  var PACKAGES = {
    'strong': StrongPackage,
    'emphasis': EmphasisPackage,
    'link': LinkPackage,
    'list': ListPackage,
    'table': TablePackage,
    'xref': XrefPackage,
    'heading': HeadingPackage,
  };

  var DEFAULT_PACKAGES = ['heading', 'strong', 'emphasis', 'link', 'list', 'table'];

  var RichTextArea = (function (Component$$1) {
    function RichTextArea() {
      var this$1 = this;
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      Component$$1.apply(this, args);
      this.cfg = new Configurator().import(RichTextAreaPackage);
      var enabledPackages = this.props.config.enabledPackages || DEFAULT_PACKAGES;
      var defaultOptions = {
        disableCollapsedCursor: true,
        toolGroup: 'annotations'
      };
      enabledPackages.forEach(function (pkg) {
        this$1.cfg.import(PACKAGES[pkg], defaultOptions);
      });


      if (enabledPackages.indexOf('heading') >= 0) {
        this.cfg.import(MinimalSwitchTextTypePackage);
      }
      this._initDoc(this.props);
    }

    if ( Component$$1 ) RichTextArea.__proto__ = Component$$1;
    RichTextArea.prototype = Object.create( Component$$1 && Component$$1.prototype );
    RichTextArea.prototype.constructor = RichTextArea;

    RichTextArea.prototype.didMount = function didMount () {
      this.registerHandlers();
    };

    RichTextArea.prototype.didUpdate = function didUpdate () {
      this.registerHandlers();
    };

    RichTextArea.prototype.hideOverlays = function hideOverlays () {
      this.refs.editor.hideOverlays();
    };

    RichTextArea.prototype.registerHandlers = function registerHandlers () {
      this.editorSession.onRender('selection', this._onSelectionChanged, this);
    };

    RichTextArea.prototype.unregisterHandlers = function unregisterHandlers () {
      this.editorSession.off(this);
    };

    RichTextArea.prototype.dispose = function dispose () {
      this.unregisterHandlers();
    };


    RichTextArea.prototype.blur = function blur () {
      this.editorSession.setSelection(null);
    };

    RichTextArea.prototype._onSelectionPositioned = function _onSelectionPositioned (hints) {
      hints.editorId = this.props.editorId;
      this.emit('selection:positioned', hints);
    };

    RichTextArea.prototype.getChildContext = function getChildContext () {
      return {
        editorId: this.props.editorId,
        scrollPane: this.props.scrollPane
      }
    };

    RichTextArea.prototype.willReceiveProps = function willReceiveProps (props) {
      this.dispose();
      this.empty();
      this._initDoc(props);
    };

    RichTextArea.prototype._initDoc = function _initDoc (props) {
      this.importer = this.cfg.createImporter('html');
      this.doc = this.importer.importDocument(props.html);


      this.editorSession = new EditorSession(this.doc, {
        id: this.props.editorId,
        configurator: this.cfg
      });
    };

    RichTextArea.prototype._onSelectionChanged = function _onSelectionChanged () {
      var selectionState = this.editorSession.getSelectionState();
      var activeAnnotation = selectionState.getAnnotationsForType('xref')[0];
      this.emit('selection:changed', {
        activeAnnotation: activeAnnotation,
        editorId: this.props.editorId
      });
    };

    RichTextArea.prototype.render = function render ($$) {
      var el = $$('div').addClass('sc-rich-text-area');
      el.append(
          $$(RichTextAreaEditor, {
            editorSession: this.editorSession,
            editorId: this.props.editorId
          }).ref('editor')
      );
      return el
    };

    RichTextArea.prototype.getHTML = function getHTML () {
      var htmlExporter = this.cfg.createExporter('html');

      return htmlExporter.exportDocument(this.doc)
    };

    return RichTextArea;
  }(Component));

  var Forms = (function (EventEmitter$$1) {
    function Forms() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      EventEmitter$$1.apply(this, args);
      this._editables = {};
      this.bodyScrollPane = BodyScrollPane.mount({}, document.body);
      this.bodyScrollPane.on('selection:positioned', this._onSelectionPositioned, this);
    }

    if ( EventEmitter$$1 ) Forms.__proto__ = EventEmitter$$1;
    Forms.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    Forms.prototype.constructor = Forms;

    Forms.prototype.dispose = function dispose () {
      this.bodyScrollPane.off(this);
    };

    Forms.prototype.addRichTextArea = function addRichTextArea (editorId, el, config) {
      config = config || {};
      el = DefaultDOMElement.wrapNativeElement(el);
      var html = el.innerHTML;

      el.innerHTML = '';
      var richTextArea = RichTextArea.mount({
        scrollPane: this.bodyScrollPane,
        editorId: editorId,
        html: html,
        config: config
      }, el);
      richTextArea.on('selection:positioned', this._onSelectionPositioned, this);
      richTextArea.on('selection:changed', this._onSelectionChanged, this);
      this._editables[editorId] = richTextArea;
      return richTextArea
    };

    Forms.prototype._onSelectionPositioned = function _onSelectionPositioned (hints) {
      this.emit('selection:positioned', hints);
    };

    Forms.prototype._onSelectionChanged = function _onSelectionChanged (params) {
      this.emit('selection:changed', params);
    };

    Forms.prototype.removeRichTextArea = function removeRichTextArea (editorId) {
      this._editables[editorId].off(this);
    };

    Forms.prototype.getHTML = function getHTML (editorId) {
      return this._editables[editorId].getHTML()
    };

    Forms.prototype.setHTML = function setHTML (editorId, html) {
      var editor = this._editables[editorId];
      editor.extendProps({
        html: html
      });
    };

    return Forms;
  }(EventEmitter));

  window.SubstanceForms = Forms;

})));

//# sourceMappingURL=./substance-forms.js.map