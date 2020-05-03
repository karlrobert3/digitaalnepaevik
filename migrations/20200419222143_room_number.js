exports.up = function (knex) {
  return knex.schema.table('user', function (table) {
    table.integer('room_number')
  })
};

exports.down = function (knex) {
    return knex.schema.table('user', function (table) {
        table.dropColumn('room_number')

    })
};
