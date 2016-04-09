/* jshint -W071, -W074 */
var _ = require('lodash');
var matchMaker = require('json-query');

var is_safari = window.navigator.userAgent.indexOf('Safari') !== -1 &&
  window.navigator.userAgent.indexOf('Chrome') === -1 &&
  window.navigator.userAgent.indexOf('Android') === -1;

var indexedDB = window.indexedDB;
var IDBKeyRange = window.IDBKeyRange;

var consts = {
  'READ_ONLY'         : 'readonly',
  'READ_WRITE'        : 'readwrite',
  'VERSION_CHANGE'    : 'versionchange',
  'NEXT'              : 'next',
  'NEXT_NO_DUPLICATE' : 'nextunique',
  'PREV'              : 'prev',
  'PREV_NO_DUPLICATE' : 'prevunique'
};

function IDBAdapter( options ){
  options = options || {};
  this.parent = options.collection;
  this.opts = _.defaults(_.pick(this.parent, _.keys(this.default)), this.default);
  this.opts.storeName = this.parent.name || this.default.storeName;
  this.opts.dbName = this.opts.storePrefix + this.opts.storeName;
}

IDBAdapter.prototype = {

  default: {
    storeName    : 'store',
    storePrefix  : 'Prefix_',
    dbVersion    : 1,
    keyPath      : 'id',
    autoIncrement: true,
    indexes      : [],
    matchMaker   : matchMaker,
    onerror      : function (options) {
      options = options || {};
      var err = new Error(options._error.message);
      err.code = event.target.errorCode;
      options._error.callback(err);
    }
  },

  constructor: IDBAdapter,

  open: function (options) {
    options = options || {};
    if (!this._open) {
      var self = this;

      this._open = new Promise(function (resolve, reject) {
        var request = indexedDB.open(self.opts.dbName);

        request.onsuccess = function (event) {
          self.db = event.target.result;

          // get count & safari hack
          self.count()
            .then(function () {
              if (is_safari) {
                return self.getBatch(null, { data: { filter: { limit: 1, order: 'DESC' } } });
              }
            })
            .then(function (resp) {
              if(is_safari){
                self.highestKey = _.isEmpty(resp) ? 0 : resp[0][self.opts.keyPath];
              }
              resolve(self.db);
            });
        };

        request.onerror = function (event) {
          options._error = {event: event, message: 'open indexedDB error', callback: reject};
          self.opts.onerror(options);
        };

        request.onupgradeneeded = function (event) {
          var store = event.currentTarget.result.createObjectStore(self.opts.storeName, self.opts);

          self.opts.indexes.forEach(function (index) {
            store.createIndex(index.name, index.keyPath, {
              unique: index.unique
            });
          });
        };
      });
    }

    return this._open;
  },

  close: function () {
    this.db.close();
    this.db = undefined;
    this._open = undefined;
  },

  read: function(key, options){
    var get = key ? this.get : this.getBatch;
    return get.call(this, key, options);
  },

  update: function(data, options){
    var put = _.isArray(data) ? this.putBatch : this.put;
    var get = _.isArray(data) ? this.getBatch : this.get;
    var self = this;
    return put.call(this, data, options)
      .then(function (resp) {
        return get.call(self, resp);
      });
  },

  delete: function(key, options){
    var remove = key ? this.remove : this.removeBatch;
    return remove.call(this, key, options);
  },

  getTransaction: function (access) {
    return this.db.transaction([this.opts.storeName], access);
  },

  getObjectStore: function (access) {
    return this.getTransaction(access).objectStore(this.opts.storeName);
  },

  count: function (options) {
    options = options || {};
    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY);

    return new Promise(function (resolve, reject) {
      var request = objectStore.count();

      request.onsuccess = function (event) {
        self.length = event.target.result || 0;
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'count error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  put: function (data, options) {
    options = options || {};
    var objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);
    var self = this, keyPath = this.opts.keyPath;

    // merge on index keyPath
    if (options.index) {
      return this.merge(data, options);
    }

    if (!data[keyPath]) {
      return this.add(data, options);
    }

    return new Promise(function (resolve, reject) {
      var request = objectStore.put(data);

      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'put error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  add: function (data, options) {
    options = options || {};
    var objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);
    var self = this, keyPath = this.opts.keyPath;

    if (is_safari) {
      data[keyPath] = ++this.highestKey;
    }

    return new Promise(function (resolve, reject) {
      var request = objectStore.add(data);

      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'add error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  get: function (key, options) {
    options = options || {};
    var objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY),
        keyPath     = options.index || this.opts.keyPath,
        self        = this;

    if (_.isObject(keyPath)) {
      keyPath = keyPath.keyPath;
    }

    return new Promise(function (resolve, reject) {
      var request = (keyPath === self.opts.keyPath) ?
        objectStore.get(key) : objectStore.index(keyPath).get(key);

      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'get error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  remove: function (key, options) {
    options = options || {};
    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);

    return new Promise(function (resolve, reject) {
      var request = objectStore.delete(key);

      request.onsuccess = function (event) {
        resolve(event.target.result); // undefined
      };

      request.onerror = function (event) {
        var err = new Error('delete error');
        err.code = event.target.errorCode;
        reject(err);
      };
      request.onerror = function (event) {
        options._error = {event: event, message: 'delete error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  putBatch: function (dataArray, options) {
    options = options || {};
    options.objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);
    var batch = [];

    _.each(dataArray, function (data) {
      batch.push(this.put(data, options));
    }.bind(this));

    return Promise.all(batch);
  },

  /**
   * 4/3/2016: Chrome can do a fast merge on one transaction, but other browsers can't
   */
  merge: function (data, options) {
    options = options || {};
    var self = this, keyPath = options.index;
    var primaryKey = this.opts.keyPath;

    var fn = function (local, remote, keyPath) {
      if (local) {
        remote[keyPath] = local[keyPath];
      }
      return remote;
    };

    if (_.isObject(options.index)) {
      keyPath = _.get(options, ['index', 'keyPath'], primaryKey);
      if (_.isFunction(options.index.merge)) {
        fn = options.index.merge;
      }
    }

    return this.get(data[keyPath], {index: keyPath, objectStore: options.objectStore})
      .then(function (result) {
        return self.put(fn(result, data, primaryKey));
      });
  },

  getBatch: function (keyArray, options) {
    options = options || {};

    var objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY),
        include     = _.isArray(keyArray) ? keyArray : _.get(options, ['data', 'filter', 'in']),
        limit       = _.get(options, ['data', 'filter', 'limit'], -1),
        start       = _.get(options, ['data', 'filter', 'offset'], 0),
        order       = _.get(options, ['data', 'filter', 'order'], 'ASC'),
        direction   = order === 'DESC' ? consts.PREV : consts.NEXT,
        query       = _.get(options, ['data', 'filter', 'q']),
        keyPath     = options.index || this.opts.keyPath,
        page        = _.get(options, ['data', 'page']),
        self        = this,
        range       = null,
        end;

    if (_.isObject(keyPath)) {
      if(keyPath.value){
        range = IDBKeyRange.only(keyPath.value);
      }
      keyPath = keyPath.keyPath;
    }

    if (page && limit !== -1) {
      start = (page - 1) * limit;
    }

    return new Promise(function (resolve, reject) {
      var records = [], delayed = 0;
      var request = (keyPath === self.opts.keyPath) ?
        objectStore.openCursor(range, direction) :
        objectStore.index(keyPath).openCursor(range, direction);

      request.onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
          if (cursor.value._state === 'READ_FAILED') {
            delayed++;
          }
          if (
            (!include || _.includes(include, cursor.value[keyPath])) &&
            (!query || self._match(query, cursor.value, keyPath, options))
          ) {
            records.push(cursor.value);
          }
          return cursor.continue();
        }
        _.set(options, 'idb.total', records.length);
        _.set(options, 'idb.delayed', delayed);
        end = limit !== -1 ? start + limit : records.length;
        resolve(_.slice(records, start, end));
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'getAll error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  removeBatch: function(keyArray, options) {
    return this.clear(options);
  },

  clear: function (options) {
    options = options || {};
    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);

    return new Promise(function (resolve, reject) {
      var request = objectStore.clear();

      request.onsuccess = function (event) {
        self.length = 0;
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'clear error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  _match: function (query, json, keyPath, options) {
    var fields = _.get(options, ['data', 'filter', 'fields'], keyPath);
    return this.opts.matchMaker.call(this, json, query, {fields: fields});
  }

};

module.exports = IDBAdapter;
/* jshint +W071, +W074 */