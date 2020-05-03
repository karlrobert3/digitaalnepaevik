require('dotenv').config();
const services = require('./services');
const Joi = require('@hapi/joi');
const crypto = require('crypto');
const express = require('express');
const bodyparser = require('body-parser');
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
}));
app.use(easySession.main(session));


app.use(bodyparser.json());
app.use('/', express.static('web'));

app.get('/api/record', function (req, res) {
  //req.session.user
  if (!req.session.user) {
    return res.status(401).send('Unauthorised')
  }
  const query = knex('diary')
    .select('diary.id', 'diary.reason', 'diary.start', 'diary.end', 'diary.notes', 'user.firstname', 'user.lastname', 'user.room_number')
    .innerJoin('user', 'diary.user_id', 'user.id')

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

app.put('/api/record/:id', function (req, res) {
  const {id} = req.params;
  const data = req.body
  knex('diary')
    .update(data)
    .where({id})
    .then(function () {
      res.send('Success')
    })
});

app.post('/api/login', function (req, res) {
  const {loginEmail, loginPassword} = req.body
  if (!loginEmail || !loginPassword) {
    return res.status(400).send('Email or Password is invalid')
  }
  knex('user')
    .select('id', 'email', 'password', 'firstname', 'lastname', 'role', 'key', 'is_active')
    .where({
      email: loginEmail,
    })
    .first()
    .then(function (result) {
      if (!result) {
        return res.status(403).send('Email or password does not fit');
      }
      const {email, password} = result

      if (!email || !password) {
        return res.status(403).send('Email or password does not fit');
      }

      if (!result.is_active) {
        const data = result
        data.kuhu = 'emailConfirm';
        data.html = 'activate'
        return services.sendEmail(data)
          .then(result => {
            console.log(result)
            return res.status(403).send('Account not activated, please check email');
          })
          .catch(err => {
            console.error(err)
            // todo send error
          })

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
      };

      req.session.login({user})
        .then(() => {
          //here we have a logged in session
          console.log(req.session.userId);
          res.send('Authenticated')
        });

    })
});
app.post('/api/registration', function (req, res) {
  const data = req.body
  data.password = bcrypt.hashSync(data.password, 10);

  console.log('REGISTRATION', req.body)
  //TODO validation joi
  data.key = crypto.randomBytes(20).toString('hex');
  knex('user')
    .insert(data)
    .then(function () {
      data.kuhu = 'emailConfirm';
      data.html = 'activate';
      console.log(data);
      services.sendEmail(data)
        .then(result => {
          console.log(result);
          res.send('Succes')
        })
        .catch(err => {
          // todo send error
        })

    })
    .catch(function (error) {
      return res.status(400).send({
        msg: 'This Email is already in use'
      })
    })

});
app.get('/api/user', function (req, res) {
  if (!req.session.user) {
    return res.status(401).send('Unauthorised')
  }

  res.send(req.session.user)
});
app.post('/api/logOut', function (req, res) {
  req.session.logout()
    .then(() => {
      return res.status(200).send('Loged out')
    })
});
app.get('/activate', function (req, res) {
  const {key} = req.query
  knex('user')
    .update({is_active: true})
    .where({
      key,
      is_active: false
    })
    .then((result) => {
      res.redirect(`${process.env.NODE_BASEHOST}/login.html`)
    })
    .catch(e => {
      res.status(400).send({msg: 'Unable to activate'})
    })

});
app.post('/api/passwordReset', function (req, res) {
  const {resetEmail} = req.body;
  console.log(req.body)

  const schema = Joi.object({
    resetEmail: Joi.string().trim().email().required(),
  });

  const {error} = schema.validate(req.body)

  if (error) {
    return res.status(400).send('Please insert correct email');
  }

  knex('user')
    .select('id', 'email', 'firstname', 'lastname', 'key', 'is_active')
    .where({
      email: resetEmail,
    })
    .first()
    .then(async function (data) {
      if (!data) {
        return res.send('Please check email')
      }

      let message;
      if (!data.is_active) {
        data.emailType = 'emailConfirm';
        data.html = 'activate';
        message = 'Account not activated, please check email'
      } else {
        data.emailType = 'forgotPassword';
        data.html = 'resetPassword.html';
        message = 'Please check email';
        data.key = crypto.randomBytes(20).toString('hex');
        await knex('user')
          .update({key: data.key})
          .where({
            id: data.id
          })
      }

      services.sendEmail(data)
        .then(result => {
          console.log(result)
          res.status(403).send(message);
        })
        .catch(err => {
          console.error(err)
          res.status(500).send('Unable to send email')
        })

    });


});
app.post('/api/newPassword', function (req, res) {
  const {key, password} = req.body;

  knex('user')
    .update({password: bcrypt.hashSync(password, 10)})
    .where({key})
    .then(function () {
      res.send('Success')
    })

});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
