
exports.up = function(knex) {
  return knex.schema.table('user', function (table) {
    table.string('key');
    table.boolean('is_active').defaultTo(false);
  })
};

exports.down = function(knex) {
  return knex.schema.table('user',function (table) {
    table.dropColumns(['key','is_active'])
  })
};
