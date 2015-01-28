var Radio = require('backbone').Radio;
var debug = require('debug')('dualCollection');
var Collection = require('./collection');
var POS = require('lib/utilities/global');
var $ = require('jquery');

var wrapError = function(model, options) {
  var error;
  error = options.error;
  return options.error = function(resp) {
    if (error) {
      error(model, resp, options);
    }
    return model.trigger('error', model, resp, options);
  };
};

module.exports = POS.DualCollection = Collection.extend({
  states: {
    SYNCHRONIZED  : 'SYNCHRONIZED',
    SYNCHRONIZING : 'SYNCHRONIZING',
    UPDATE_FAILED : 'UPDATE_FAILED',
    CREATE_FAILED : 'CREATE_FAILED',
    DELETE_FAILED : 'DELETE_FAILED'
  },

  eventNames: {
    LOCAL_SYNC_FAIL     : 'LOCAL_SYNC_FAIL',
    LOCAL_SYNC_SUCCESS  : 'LOCAL_SYNC_SUCCESS',
    REMOTE_SYNC_FAIL    : 'REMOTE_SYNC_FAIL',
    REMOTE_SYNC_SUCCESS : 'REMOTE_SYNC_SUCCESS',
    SYNCHRONIZED        : 'SYNCHRONIZED'
  },

  constructor: function() {
    Collection.apply(this, arguments);

    this._isReady = $.Deferred();
    this.once('idb:ready', function() {
      this._isReady.resolve();
    });

  },

  url: function(){
    var wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });
    return wc_api + this.name;
  },

  fetch: function(options){
    var self = this;
    return $.when(this._isReady).then(function() {
      debug('fetching: ' + self.name);
      return Collection.prototype.fetch.call(self, options);
    });
  },

  state: {
    pageSize: 10
  },

  parseState: function (resp, queryParams, state, options) {
    // totals are always in the WC API headers
    var totalRecords = options.xhr.getResponseHeader('X-WC-Total');
    var totalPages = options.xhr.getResponseHeader('X-WC-Total');

    // return as decimal
    return {
      totalRecords: parseInt(totalRecords, 10),
      totalPages: parseInt(totalPages, 10)
    };
  },

  parse: function (resp) {
    return resp[this.name] ? resp[this.name] : resp ;
  },

  getSyncMethodsByState: function(state){
    var method;
    return method = (function() {
      switch (false) {
        case this.states.CREATE_FAILED !== state:
          return 'create';
        case this.states.UPDATE_FAILED !== state:
          return 'update';
        case this.states.DELETE_FAILED !== state:
          return 'delete';
      }
    }).call(this);
  },

  mergeFirstSync: function(newData) {
    return newData;
  },

  mergeFullSync: function(newData) {
    return newData;
  },

  firstSync: function(options) {
    var event, fetchSuccess, originalSuccess, syncError, syncSuccess;
    if (options == null) {
      options = {};
    }
    originalSuccess = options.success || $.noop;
    event = _.extend({}, Backbone.Events);
    syncSuccess = (function(_this) {
      return function(response) {
        var data, method;
        data = _this.mergeFirstSync(_this.parse(response));
        event.trigger(_this.eventNames.REMOTE_SYNC_SUCCESS);
        method = options.reset ? 'reset' : 'set';
        _this[method](data, options);
        originalSuccess(_this, data, options);
        _this.trigger('sync', _this, data, options);
        wrapError(_this, options);
        return _this.save().done(function() {
          return _this.fetch().done(function() {
            return event.trigger(_this.eventNames.SYNCHRONIZED);
          });
        });
      };
    })(this);
    syncError = (function(_this) {
      return function(error) {
        return event.trigger(_this.eventNames.REMOTE_SYNC_FAIL, error, options);
      };
    })(this);
    fetchSuccess = (function(_this) {
      return function(data) {
        options.success = syncSuccess;
        options.error = syncError;
        event.trigger(_this.eventNames.LOCAL_SYNC_SUCCESS, data);
        return Backbone.ajaxSync('read', _this, options);
      };
    })(this);
    this.fetch({
      success: fetchSuccess,
      error: function(error) {
        return event.trigger(this.eventNames.LOCAL_SYNC_FAIL, error);
      }
    });
    return event;
  },

  removeGarbage: function(delayedData) {
    var deferred, idsForRemove, key;
    deferred = new $.Deferred();
    key = this.indexedDB.keyPath;
    idsForRemove = _.map(delayedData, function(item) {
      return item[key];
    });
    this.indexedDB.removeBatch(idsForRemove, (function() {
      return deferred.resolve();
    }), (function() {
      return deferred.reject();
    }));
    return deferred.promise();
  },

  _getDelayedData: function(status) {
    var data, deferred, keyRange, options;
    deferred = new $.Deferred();
    data = [];
    keyRange = this.indexedDB.makeKeyRange({
      lower: status,
      upper: status
    });
    options = {
      index: 'status',
      keyRange: keyRange,
      onEnd: function() {
        return deferred.resolve(data);
      }
    };
    this.indexedDB.iterate(function(item) {
      return data.push(item);
    }, options);
    return deferred.promise();
  },

  getDelayedData: function() {
    var created, deferred, deleted, updated;
    deferred = new $.Deferred();
    deleted = this._getDelayedData(this.states.DELETE_FAILED);
    created = this._getDelayedData(this.states.CREATE_FAILED);
    updated = this._getDelayedData(this.states.UPDATE_FAILED);
    $.when(deleted, created, updated).done(function(a, b, c) {
      return deferred.resolve(_.union(a, b, c));
    });
    return deferred.promise();
  },

  fullSync: function() {
    var deferred;
    deferred = new $.Deferred();
    this.getDelayedData().done((function(_this) {
      return function(delayedData) {
        var count, done;
        debug('start full sync', delayedData);
        count = 0;
        done = function() {
          count++;
          if (count === delayedData.length) {
            return _this.fetch().done(function() {
              return deferred.resolve();
            });
          }
        };
        return _.each(delayedData, function(item) {
          var method, model, status;
          status = item.status;
          method = _this.getSyncMethodsByState(status);
          delete item.status;
          model = new _this.model(item);
          debug('full sync model', item, method);
          model.url = model.getUrlForSync(_.result(_this, 'url'), method);
          return Backbone.ajaxSync(method, model, {
            success: (function(response) {
              var data;
              if (status === _this.states.DELETE_FAILED) {
                return _this.removeGarbage([item]).done(done());
              } else {
                data = _this.mergeFullSync(model.parse(response));
                if (!data.status) {
                  data.status = '';
                }
                model = _this.get(item[_this.indexedDB.keyPath]).set(data);
                return _this.indexedDB.store.put(model.attributes, done, done);
              }
            }),
            error: function(jqXHR, textStatus, errorThrown) {
              var collection;
              if (method === 'update') {
                collection = _this;
                model.fetch({
                  success: function(model) {
                    return collection.indexedDB.store.put(model.attributes);
                  }
                });
              }
              return deferred.reject(item, jqXHR, textStatus, errorThrown);
            }
          });
        });
      };
    })(this));
    return deferred.promise();
  },

  save: function() {
    var deferred;
    deferred = new $.Deferred();
    this.indexedDB.saveAll((function() {
      return deferred.resolve();
    }), (function() {
      return deferred.reject();
    }));
    return deferred.promise();
  }

});