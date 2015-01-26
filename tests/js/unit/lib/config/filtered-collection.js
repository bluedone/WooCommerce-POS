describe('lib/config/filtered-collection.js', function () {

  beforeEach(function () {
    var dummy = require('./../../../data/products.json');
    var collection = new Backbone.Collection(dummy.products);
    var FilteredCollection = require('lib/config/filtered-collection');
    this.filtered = new FilteredCollection(collection);
  });

  describe('var filtered = new FilteredCollection();', function () {
    it('should be in a valid state', function() {
      expect(this.filtered).to.be.ok;
    });
  });

  describe('filtered.query()', function () {

    it('should have a query method', function() {
      expect(this.filtered).to.have.property('query');
    });

    it('should filter a freetext query', function() {
      this.filtered.query('woo');
      expect(this.filtered.length).equal(12);
      this.filtered.query('ninja');
      expect(this.filtered.length).equal(9);
    });

    it('should filter a cat: query', function() {
      this.filtered.query('cat:Music');
      expect(this.filtered.length).equal(6);
    });

    it('should filter an id: query', function() {
      this.filtered.query('id:99');
      expect(this.filtered.length).equal(1);
    });

    it('should filter a piped id: query', function() {
      this.filtered.query('id:99|96');
      expect(this.filtered.length).equal(2);
    });


  });

});