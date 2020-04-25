
exports.up = function(knex) {
  return knex.schema.table('user', function (table) {
    table.unique('email')

  })
};

exports.down = function(knex) {
  
};
