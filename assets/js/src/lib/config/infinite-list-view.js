var Mn = require('backbone.marionette');
var POS = require('lib/utilities/global');
var _ = require('lodash');
//var $ = require('jquery');

module.exports = POS.InfiniteListView = Mn.CompositeView.extend({
  className: 'infinite-list',
  template: function(){
    return '<div></div>' +
      '<ul class="striped"></ul>' +
      '<div><i class="icon icon-spinner"></i>';
  },

  initialize: function(){
    this.listenTo(this.collection.superset(), {
      'start:processQueue': this.startLoading,
      'end:processQueue': this.endLoading,
      'end:fullSync': this.checkOverflow
    });
    this.on({
      'all': this.checkOverflow
    });
    _.bindAll(this, 'onScroll', 'loadMore', 'getOverflow');
  },

  // Marionette's default implementation ignores the index, always
  // appending the new view to the end. Let's be a little more clever.
  //appendHtml: function(collectionView, itemView, index){
  //  if (!index) {
  //    collectionView.$el.prepend(itemView.el);
  //  } else {
  //    $(collectionView.$('li')[index - 1]).after(itemView.el);
  //  }
  //},

  onShow: function(){
    this._parent.$el.scroll(this.onScroll);
  },

  onScroll: _.throttle(function(){
    if(this.getOverflow() < 100){
      this.loadMore();
    }
  }, 200),

  checkOverflow: _.debounce(function(){
    if(this.getOverflow() < 100){
      this.loadMore();
    }
  }, 200),

  getOverflow: function(){
    if(this._parent) {
      var sH = this._parent.el.scrollHeight,
          cH = this._parent.el.clientHeight,
          sT = this._parent.el.scrollTop;
      return sH - cH - sT;
    }
  },

  loadMore: function() {
    // get next page from filtered collection
    if (this.collection.hasNextPage()) {
      return this.collection.appendNextPage();
    }

    // load more from queue
    if (this.collection.superset().queue.length > 0) {
      this.remoteFetchMore();
    }
  },

  remoteFetchMore: function(){
    var options = {};
    var tokens = this.collection.getTokens();
    if(tokens){
      options.filter = this.prepareRemoteQuery(tokens);
    }
    this.collection.superset().processQueue(options);
  },

  startLoading: function(){
    this.toggleLoading(true);
  },

  endLoading: function(){
    this.toggleLoading(false);
  },

  toggleLoading: function(loading){
    this.$el.toggleClass('loading', loading);
  },

  prepareRemoteQuery: function(tokens){
    var filter = {
      'not_in': this.collection.pluck('id').join(',')
    };

    _.each(tokens, function(token){

      // simple search
      if(token.type === 'string'){
        filter.q = token.query;
      }

      // simple prefix search
      if(token.type === 'prefix'){
        filter[token.prefix] = token.query;
      }

    });

    return filter;
  }

});