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

const smtpHost = process.env.NODE_SMTP_HOST


app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(easySession.main(session));


app.use(bodyparser.json())
app.use('/', express.static('web'));

app.get('/api/record', function (req, res) {
  //req.session.user
  if (!req.session.user) {
    return res.status(401).send('Unauthorised')
  }

  const query = knex('diary');
  query.select();
  if (req.session.user.role === 'User') {
    query.where({
      user_id: req.session.user.userId,
    });
  }
  query.then((result) => {
    res.send(result)
  })

});

app.post('/api/record', function (req, res) {
  if (!req.session.user) {
    return res.status(401).send('Unauthorised')
  }

  const user = req.session.user

  const data = Object.assign(req.body, {user_id: user.userId})
  knex('diary').insert(data).then(function () {
    res.send('Succes')
  })
});

app.put('/api/record/:id', function(req, res) {
  const {id} = req.params;
  const data = req.body
})

app.post('/api/login', function (req, res) {
  const {loginEmail, loginPassword} = req.body
  if (!loginEmail || !loginPassword) {
    return res.status(400).send('Email or Password is invalid')
  }
  knex('user')
    .select('id', 'email', 'password', 'firstname', 'lastname', 'role')
    .where({
      email: loginEmail,
    })
    .first()
    .then(function (result) {
      const {email, password} = result
      if (!email || !password) {
        return res.status(403).send('Email or password does not fit');
      }
      const doesPasswordMatch = bcrypt.compareSync(loginPassword, password)
      if (!doesPasswordMatch) {
        return res.status(403).send('Email or password does not fit');
      }
      const user = {
        userId: result.id,
        firstName: result.firstname,
        lastName: result.lastname,
        email: result.email,
        role: result.role
      }
      req.session.login({user})
        .then(() => {
          //here we have a logged in session
          console.log(req.session.userId); // Will print 10;
          res.send('Authenticated')
        });

    })
})
app.post('/api/registration', function (req, res) {
  const data = req.body
  data.password = bcrypt.hashSync(data.password, 10);

  console.log('REGISTRATION', req.body)
  knex('user')
    .insert(data)
    .then(function () {
      res.send('Succes')
    })
    .catch(function (error) {
      return res.status(400).send(error.sqlMessage)

    })

})
app.get('/api/user', function (req, res) {
  if (!req.session.user) {
    return res.status(401).send('Unauthorised')
  }

  res.send(req.session.user)
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
