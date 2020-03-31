require('dotenv').config()
console.log(process.env)
module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            host: process.env.NODE_DBHOST,
            port: process.env.NODE_DBPORT,
            user: process.env.NODE_DBUSER,
            password: process.env.NODE_DBPASWORD,
            database: process.env.NODE_DBDATABASE,
        }
    }
}