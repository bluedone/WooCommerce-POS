var Model = require('./model');
var POS = require('lib/utilities/global');
var _ = require('lodash');

module.exports = POS.DualModel = Model.extend({
  idAttribute: 'local_id',
  remoteIdAttribute: 'id',
  fields: ['title'],

  parse: function (resp) {
    return resp[this.name] ? resp[this.name] : resp ;
  },

  url: function(){
    var remoteId = this.get(this.remoteIdAttribute),
        urlRoot = _.result(this.collection, 'url');

    if(remoteId){
      return '' + urlRoot + '/' + remoteId + '/';
    }
    return urlRoot;
  },

  states: {
    SYNCHRONIZED  : 'SYNCHRONIZED',
    SYNCHRONIZING : 'SYNCHRONIZING',
    UPDATE_FAILED : 'UPDATE_FAILED',
    CREATE_FAILED : 'CREATE_FAILED',
    DELETE_FAILED : 'DELETE_FAILED'
  },

  hasRemoteId: function() {
    return !!this.get(this.remoteIdAttribute);
  },

  getUrlForSync: function(urlRoot, method) {
    var remoteId = this.get(this.remoteIdAttribute);
    if (remoteId && (method === 'update' || method === 'delete')) {
      return '' + urlRoot + '/' + remoteId + '/';
    }
    return urlRoot;
  },

  getSyncMethodsByState: function(state){
    var methods = {};
    methods[this.states.CREATE_FAILED] = 'create';
    methods[this.states.UPDATE_FAILED] = 'update';
    methods[this.states.DELETE_FAILED] = 'delete';
    return methods[state];
  },

  isInSynchronizing: function() {
    return this.get('status') === this.states.SYNCHRONIZING;
  },

  isDelayed: function() {
    var status = this.get('status');
    return status === this.states.DELETE_FAILED ||
           status === this.states.UPDATE_FAILED ||
           status === this.states.CREATE_FAILED;
  },

  serverSync: function(){
    var method, status, self = this, options = {};
    status = this.get('status');
    method = this.getSyncMethodsByState(status);

    options.success = function(response){ // (response, textStatus, jqXHR)
      if (method === 'delete') {
        return self.destroy();
      }
      var data = self.parse(response);
      if (!data.status) { data.status = ''; }
      return self.save(data);
    };

    options.remote = true;

    return this.sync(method, this, options);
  }

});