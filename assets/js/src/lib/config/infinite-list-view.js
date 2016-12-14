var Mn = require('backbone.marionette');
var _ = require('lodash');
var app = require('./application');

module.exports = app.prototype.InfiniteListView = Mn.CompositeView.extend({

  className: 'list-infinite',

  template: function(){
    return '<div></div><ul></ul><div><i class="icon-spinner"></i></div>';
  },

  constructor: function(){
    Mn.CompositeView.apply(this, arguments);

    this.on('show', function(){
      this.container = this.$el.parent()[0];
      this.$el.parent().on('scroll', _.debounce(this.onScroll.bind(this), 1000/60, {leading:true}));
    });

    this.listenTo(this.collection, {
      'request' : this.startLoading,
      'sync'    : this.endLoading
    });
  },

  onScroll: function(){
    if(!this.loading && this.collection.hasMore() && this.triggerEvent()){
      this.appendNextPage();
    }
  },

  triggerEvent: function () {
    var sH = this.container.scrollHeight,
        cH = this.container.clientHeight,
        sT = this.container.scrollTop;
    var down = sT > (this._sT || 0);
    this._sT = sT;
    return down ? sH - cH - sT < 100 : sH - cH - sT <= 0;
  },

  appendNextPage: function () {
    var collection = this.collection;
    collection
      .setFilter({ not_in: collection.map('id').join(',') })
      .fetch({ index: 'id', remove: false })
      .then(function(){
        // remove not_in filter
        collection.setFilter({ not_in: undefined });
      });
  },

  /**
   *
   */
  startLoading: function () {
    this.loading = true;
    this.$el.addClass('loading');
  },

  /**
   * - don't recheck on server errors
   */
  endLoading: function (collection, response, options) {
    var xhrError, xhr = _.get(options, 'xhr');
    if(xhr){
      xhr.fail(function(){
        xhrError = true;
      });
    }
    this.loading = false;
    this.$el.removeClass('loading');
    if(!xhrError){
      this.onScroll();
    }
  }
});