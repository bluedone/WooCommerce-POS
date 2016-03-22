var bb = require('backbone');

/* jshint -W074 */
module.exports = function(method, entity, options) {
  var isModel = entity instanceof bb.Model;

  return entity.db.open()
    .then(function () {
      switch (method) {
        case 'read':
          if (isModel) {
            return entity.db.get(entity.id);
          }
          return entity.db.getBatch(options);
        case 'create':
          return entity.db.add(entity.toJSON())
            .then(function (key) {
              return entity.db.get(key);
            });
        case 'update':
          return entity.db.put(entity.toJSON())
            .then(function (key) {
              return entity.db.get(key);
            });
        case 'delete':
          if (isModel) {
            return entity.db.delete(entity.id);
          }
          return;
      }
    })
    .then(function (resp) {
      if (options.success) {
        options.success(resp);
      }
      return resp;
    })
    .catch(function (resp) {
      if (options.error) {
        options.error(resp);
      }
    });

};
/* jshint +W074 */