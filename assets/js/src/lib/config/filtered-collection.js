var Collection = require('./collection');
var app = require('./application');
var _ = require('lodash');
var Parser = require('query-parser');
var parse = new Parser();

var defaultFilterName = '__default';

module.exports = app.prototype.FilteredCollection = Collection.extend({
  _filters: {},

  setFilter: function (filterName, filter) {
    if (filter === undefined) {
      filter = filterName;
      filterName = defaultFilterName;
    }
    if (!filter) {
      return this.removeFilter(filterName);
    }
    this._filters[filterName] = {
      string: filter,
      query : _.isString(filter) ? parse(filter) : filter
    };
    this.trigger('filtered:set');

    return this.fetch({data: {filter: this.getFilterOptions()}});
  },

  removeFilter: function (filterName) {
    if (!filterName) {
      filterName = defaultFilterName;
    }
    delete this._filters[filterName];
    this.trigger('filtered:remove');

    return this.fetch({data: {filter: this.getFilterOptions()}});
  },

  resetFilters: function () {
    this._filters = {};
    this.trigger('filtered:reset');
    return this.fetch();
  },

  getFilters: function (name) {
    if (name) {
      return this._filters[name];
    }
    return this._filters;
  },

  hasFilter: function (name) {
    return _.includes(_.keys(this.getFilters()), name);
  },

  hasFilters: function () {
    return _.size(this.getFilters()) > 0;
  },

  getFilterOptions: function () {
    if (this.hasFilters()) {
      return {q: this.getFilterQueries(), fields: this.fields};
    }
  },

  getFilterQueries: function () {
    var queries = _(this.getFilters()).map('query').flattenDeep().value();

    // compact
    if (queries.length > 1) {
      queries = _.reduce(queries, function (result, next) {
        if (!_.some(result, function (val) {
            return _.isEqual(val, next);
          })) {
          result.push(next);
        }
        return result;
      }, []);
    }

    // extra compact for common simple query
    if (queries.length === 1 && _.get(queries, [0, 'type']) === 'string') {
      queries = _.get(queries, [0, 'query']);
    }

    return queries;
  }

});