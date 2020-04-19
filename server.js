require('dotenv').config()
const express = require('express')
const bodyparser = require('body-parser')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const easySession = require('easy-session');
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
const port = 3000;
const bcrypt = require('bcrypt');


app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(easySession.main(session));


app.use(bodyparser.json())
app.use('/', express.static('web'));

app.get('/api/record', function(req, res) {
  //req.session.user
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
app.post('/api/login', function (req, res) {
  const {loginEmail, loginPassword} = req.body
  if (!loginEmail || !loginPassword ){
    return res.status(400).send('Email or Password is invalid')
  }
  knex('user')
      .select('id', 'email', 'password', 'firstname', 'lastname')
      .where({
        email: loginEmail,
      })
      .first()
      .then( function (result) {
        const {email, password} = result
        if (!email || !password){
          return res.status(403).send('Email or password does not fit');
        }
        const doesPasswordMatch = bcrypt.compareSync(loginPassword, password)
        if (!doesPasswordMatch){
          return res.status(403).send('Email or password does not fit');
        }
        const user = {
          userId: result.id,
          firstName: result.firstname,
          lastName: result.lastname,
          email: result.email
        }
        req.session.login({user})
            .then(() => {
              //here we have a logged in session
              console.log(req.session.userId); // Will print 10;
              res.send('Authentigated')
            });

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
