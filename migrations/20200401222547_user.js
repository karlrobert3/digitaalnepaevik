
exports.up = function(knex) {
    return knex.schema.createTable('user', function (t) {
        t.increments('id')
        t.string('firstname')
        t.string('lastname')
        t.string('email')
        t.string('password')
        t.dateTime('created_at').defaultTo(knex.fn.now());
        t.dateTime('modified_at').defaultTo(knex.fn.now());
        t.dateTime('deleted_at');
    })
  
};

exports.down = function(knex) {
    return knex.schema.createTable('user')
};
