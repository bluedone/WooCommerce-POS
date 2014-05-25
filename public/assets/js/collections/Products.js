// Filename: collections/projects
define(['backbone', 'backbone.paginator', 'models/Product', 'settings', 'indexeddb'], 
	function(Backbone, PageableCollection, Product, Settings){
	
	var database = {
		id: 'productsDB',
		description: 'POS products database',
		migrations : [{
			version: "1",
			migrate: function(transaction , next) {
				var store;
				if(!transaction.db.objectStoreNames.contains( 'products' )){
					store = transaction.db.createObjectStore( 'products', { keyPath: 'id' } );
				}
				store = transaction.objectStore( 'products' );
				store.createIndex( 'titleIndex', 'title', { unique: false} );
				next();
			}
		}]
	};

	// the pageable product list
	var Products = Backbone.PageableCollection.extend({
		database: database,
		storeName: 'products',
		model: Product,
		mode: 'client',

		state: {
			pageSize: 5,
			totalRecords: null,
			sortKey: "updated_at",
    		order: 1
  		},

		initialize: function() {
			// this.on('all', function(e) { console.log("Product Collection event: " + e); }); // debug
		},

		clear: function() {
			this.reset(); // empty products list
			this.deleteDB(); // delete the database
		},

		/*============================================================================
		Server Sync
		1. get a list of all product ids from server
		2. check against ids in local db
		3. remove any products not on the server
		4. check for updates since last_update
		5. download products
		6. set updated products in local db

		TODO: chain an id audit on the end of the server sync to catch any problems
		closeSync() should fire always but errors need to display somewhere
		updated_at_min only takes 2014-04-04 can we go down to minutes, seconds?
		also need to look into server time versus local browser time, poss conflict
		===========================================================================*/ 

		serverSync: function() {
			
			$('#pagination').addClass('working');

			var deleteComplete = false, 
				saveComplete = false,
				that = this;

			// audit products, returns an array of products to be deleted
			// then: remove the products (if any)
			// then: we're done
			this.auditProducts()
			.then( function( productArray ) {
				if( productArray.length > 0 ) { 
					return this.removeProducts( productArray ); 
				}
			})
			.then( function(){
				deleteComplete = true;
				that.closeSync( deleteComplete, saveComplete );
			});


			// get the number of products changed since last update
			// then: queue the ajax calls to get updated products
			// then: we're done
			
			var updated_at_min = this.formatLastUpdateFilter( Settings.get('last_update') );

			this.getUpdatedCount( updated_at_min )
			.then( function( count ) {
				if ( count > 0 ) { 

					// if we need less than 10, get less than 10
					// if we need more than 10, get limit of 10 at a time
					var limit = ( count < 100 ) ? count : 100 ;

					// queue the products to update
					// calls to server will be asynchronous
					// saving happens synchronous to each call
					return that.queueProducts( count, limit, updated_at_min );

				}
			})
			.then( function(){
				saveComplete = true;
				that.closeSync( deleteComplete, saveComplete );
			});

		},

		/**
		 * Get a number of products about to be returned
		 * @param  int updated_at_min
		 * @return promise, then int count
		 */
		getUpdatedCount: function(updated_at_min) {

			// updated at min should be value like 2014-05-14 or null
			updated_at_min = typeof updated_at_min !== 'undefined' ? updated_at_min : null;

			// get count of products updated from the server
			return $.getJSON( '/wc-api/v1/products/count', { 'filter[updated_at_min]': updated_at_min } )
			.then( function( response ) {
				console.log(response.count + ' products need to be updated');
				return response.count;
			}, function (jqXHR, textStatus, errorThrown) {
				console.log('error ' + textStatus);
				console.log('incoming Text ' + jqXHR.responseText);
				alert(errorThrown);
			});
		},


		/**
		 * This breaks the product requests into manageable chunks for
		 * the server. If a store has 1,000's of products the REST API 
		 * will timeout. This is a bit of a work around.
		 *
		 * Returns a promise which resolves when all products are 
		 * downloaded and saved.
		 * 
		 * @param  int count, limit, updated_at_min
		 * @return promise
		 */
		queueProducts: function(count, limit, updated_at_min) {

			// default values
			count = typeof count !== 'undefined' ? count : 10; // default count is 10
			limit = typeof limit !== 'undefined' ? limit : 10; // default limit is 10
			updated_at_min = typeof updated_at_min !== 'undefined' ? updated_at_min : null;		
			
			var requests = [];
			for (var offset = 0; offset < count; offset += limit) {
				requests.push(
					this.getProducts( limit, offset, updated_at_min )
				);
			}
			console.log(requests.length + ' ajax calls queued');
			
			return $.when.apply($, requests).always(function ( data ) {
	    		console.log('All products retrieved and saved');
			});
			
		},

		/**
		 * Get the products from the server, 
		 * then: save the returned products (synchronous)
		 * @param  int limit, offset, updated_at_min	filters provided by WC REST API
		 * @return promise
		 */
		getProducts: function(limit, offset, updated_at_min) {
			var that = this;

			console.log('getting ' + limit + ' products, offset by ' + offset );

			// default values
			limit = typeof limit !== 'undefined' ? limit : 10; // default limit is 10
			offset = typeof offset !== 'undefined' ? offset : 0; // default offset is 0
			updated_at_min = typeof updated_at_min !== 'undefined' ? updated_at_min : null;

			// make the call, save the data
			return $.getJSON( '/wc-api/v1/products/', { 'filter[limit]': limit, 'filter[offset]': offset, 'filter[updated_at_min]': updated_at_min } )
			.then( function( data ) { 
				that.saveProducts( data ); 
			}, function( jqXHR, textStatus, errorThrown ) {
				alert( errorThrown );
			});

		},

		/**
		 * Save products to the local database
		 * @param  JSON expects json object containing products
		 * @return null
		 */
		saveProducts: function( ajaxResponse ) {
			var that = this; 

			console.log('saving ' + ajaxResponse.products.length + ' products' );

			// for each product in the WC API response
			_.each(ajaxResponse.products, function( product ) {

				// use collection create convenience method
				// equivalent to:
				// newProduct = new Product(product);
				// newProduct.save();
				// products.add(newProduct, {merge: true});
				that.fullCollection.create( product, {
					merge: true,
					success: function(model, response) {
						console.log('saved: ' + response.title);
					},
					error: function(model, response) {
						console.log('error saving model: ' + response.title);
					}
				});
			});
		},

		/**
		 * Check local product ids against a the server
		 * @return promise, then array of ids
		 */
		auditProducts: function() {
			var that = this;

			// get list of product ids from the server
			return $.getJSON( pos_cart_params.ajax_url , { 'action' : 'pos_get_product_ids' } )
			.then( function( sids ) {
				if (sids instanceof Array) {  
					// build an array of ids stored locally
					var models = that.fullCollection.models;
					var lids = [];
					for (var i = 0; i < models.length; i++) {
						lids.push(models[i].id);
					}

					// use underscore method to check difference
					var diff = _.difference(lids, sids);
					console.log(diff.length + ' products need to be deleted');
					return diff;

				} else {
					console.log('server response is no good');
				}

			}, function(jqXHR, textStatus, errorThrown) {
				console.log('error ' + textStatus);
				console.log('incoming Text ' + jqXHR.responseText);
				alert(errorThrown);
			});
		},

		/**
		 * Remove the products the local database
		 * @param  array expects and array of product ids
		 * @return null
		 */
		removeProducts: function(models) {
			if (models instanceof Array) { 

				for (var i = 0; i < models.length; i++) {
					var model = this.fullCollection.get(models[i]);
					var jqxhr = model.destroy();
					this.remove(model);
				}
				console.log(i + ' products removed');
			}
		},

		/**
		 * Product Sync clean up
		 */
		closeSync: function( deleteComplete, saveComplete ) {
			if(deleteComplete && saveComplete) {
				console.log( 'sync is done! ' );
				Settings.set( 'last_update', Date.now() );
				this.trigger('reset');
				$('#pagination').removeClass('working');
			}
		},

		/*
		 * Helper function to format the last_update timestamp to 
		 * updated_at_min as required by WC REST API
		 */
		formatLastUpdateFilter: function(timestamp) {
			var last_update = new Date(+timestamp);

			// test for valid timestamps
			if(last_update.getTime() > 0) {
				var year 	= new Date( last_update ).getFullYear();
		        var month 	= new Date( last_update ).getMonth() + 1; // starts month at 0
		        // var month 	= new Date( last_update ).getMonth(); // debug
		        var date 	= new Date( last_update ).getDate();

		        if (month < 10) {
					month = '0' + month;
				}

				if (date < 10) {
					date = '0' + date;
				}

		        return year + '-' + month + '-' + date;
			} else {
				return null;
			}
		},

		/*============================================================================
		Delete the database
		===========================================================================*/ 
		deleteDB: function() {
			try {
				// close any open connections
				this.sync( 'closeall' );

			    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB ;

				// clobber the database 
				var dbreq = indexedDB.deleteDatabase(database.id);
				dbreq.onsuccess = function (event) {
					var db = event.result;
					console.log("indexedDB: " + database.id + " deleted");
				};
				dbreq.onerror = function (event) {
					console.error("indexedDB.delete Error: " + event.message);
				};
				dbreq.onblocked = function (event) {
					console.error("indexedDB.delete Error: " + event.message);
				};
			}
			catch (e) {
				console.error("Error: " + e.message);
			}
		}

	});

	// You don't usually return a collection instantiated
  	return Products;

});