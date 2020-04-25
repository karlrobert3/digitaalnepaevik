
exports.up = function(knex) {
  return knex.schema.table('diary', function (table) {
    table.integer('user_id').unsigned().references('id').inTable('user')

  })
};

exports.down = function(knex) {
  return knex.schema.table('diary', function (table) {
    table.dropColumn('user_id')
  })
};
