
exports.up = function(knex) {
 return knex.schema.createTable('diary',function (t) {
    t.increments('id');
    t.string('reason');
    t.dateTime('start');
    t.dateTime('end');
    t.string('notes');
    t.dateTime('created_at').defaultTo(knex.fn.now());
    t.dateTime('modified_at').defaultTo(knex.fn.now());
    t.dateTime('deleted_at');
 })
};

exports.down = function(knex) {
  return knex.schema.createTable('diary')
};
