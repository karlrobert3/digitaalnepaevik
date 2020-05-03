
exports.up = function(knex) {
  return knex.schema.table('user', function (table) {
    table.string('role').defaultTo('User')
  })
};

exports.down = function(knex) {
  return knex.schema.table('user', function (table) {
    table.dropColumn('role')
  })
};
