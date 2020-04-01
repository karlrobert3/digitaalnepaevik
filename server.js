require('dotenv').config()
const express = require('express')
const bodyparser = require('body-parser')
const knex = require('knex')({
    client: 'mysql2',
    connection: {
      host: process.env.NODE_DBHOST,
      port: process.env.NODE_DBPORT,
      user: process.env.NODE_DBUSER,
      password: process.env.NODE_DBPASWORD,
      database: process.env.NODE_DBDATABASE,
  }
})
const app = express();
const port = 2800;
const bcrypt = require('bcrypt');



app.use(bodyparser.json())
app.use('/', express.static('web'));

app.get('/api/record', function(req, res) {
  knex('diary').select().then(function (result) {
    res.send(result)
})

app.post('/api/record', function(req, res) {
  const data = req.body
  knex('diary').insert(data).then(function () {
    res.send('Succes')
  })

  })
})

app.post('/api/registration', function (req, res) {
  const data = req.body
  data.password = bcrypt.hashSync(data.password, 10);

  console.log('REGISTRATION', req.body)
  knex('user').insert(data).then(function () {
    res.send('Succes')
  })
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
