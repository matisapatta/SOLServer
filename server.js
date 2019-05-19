/*
Dependencias
 */
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

/*
Schemas
 */
const { Sala, Room } = require('./models/Sala');
const { User } = require('./models/User');
const { auth } = require('./middleware/auth.js')


const app = express();
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/salasonline');
// var db = mongoose.connect('mongodb://localhost:27017/salasonline');

app.use(bodyParser.json());
app.use(cookieParser());

/**************** SALAS  ****************/

/**************** GET  ****************/

app.get('/api/', function (req, res) {
  console.log("Andando")
  res.send('Andando')
});

app.get('/api/getsala', function (req, res) {
  const text = req.query.search;
  Sala.find({$text:{$search:text}}).exec((err,doc)=>{
    if (err) return res.status(400).send(err);
    res.send(doc);
  })
})


app.get('/api/sala', (req, res) => {
  let id = req.query._id;
  Sala.findById(id, (err, doc) => {
      if (err) return res.status(400).send(err);
      res.status(200).send(doc);
  })
})

/**************** POST ****************/
app.post('/api/testsalasave', (req, res) => {
  console.log(req.body)
  const sala = new Sala(req.body);
  sala.save((err, doc) => {
    console.log(err);
      if (err) return res.json({ success: false })
      res.status(200).json({
          success: true,
          sala: doc
      })
  })
})

/**************** USERS  ****************/

/**************** GET  ****************/
app.get('/api/users', (req, res) => {
  User.find({}, (err, users) => {
      if (err) return res.status(400).send(err);
      res.status(200).send(users)
  })
})

app.get('/api/auth', auth, (req, res) => {
  res.json({
      isAuth: true,
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname
  })
})

app.get('/api/logout', auth, (req, res) => {
  req.user.deleteToken(req.token, (err, user) => {
      if (err) return res.status(400).send(err);
      res.status(200).send(user)
  })

})

/**************** POST  ****************/

app.post('/api/register', (req, res) => {
  const user = new User(req.body);
  user.save((err, doc) => {
      if (err) return res.json({ success: false })
      res.status(200).json({
          success: true,
          user: doc
      })
  })
})

app.post('/api/login', (req, res) => {
  User.findOne({ 'email': req.body.email }, (err, user) => {
      if (!user) return res.json({ isAuth: false, message: 'Email no encontrado' });
      user.comparePassword(req.body.password, function (err, isMatch) {
          if (!isMatch) return res.json({
              isAuth: false,
              message: 'Contraseña incorrecta'
          });
          user.generateToken((err, user) => {
              if (err) return res.status(400).send(err);
              res.cookie('auth', user.token).json({
                  isAuth: true,
                  id: user._id,
                  email: user.email,
                  name: user.name,
                  lastname: user.lastname,
                  role: user.role
              })
          })
      })
  })
})






// Pido estado de una sala
app.get('/sala/:name', function (req, res) {
  Sala.findOne({ name: req.params.name }).then(function (response) {
    if (!response) return res.json({ err: 'No la encontré' });
    res.json(response);
  });
});

app.get('/sala/', function (req, res) {
  Sala.find().then(function (response) {
    res.json(response);
  });
});

// Creo una sala
app.post('/sala/:name', function (req, res) {
  const sala = new Sala({ name: req.params.name });
  sala.save().then(function () {
    res.json({ msg: 'sala creada ' + sala.name });
  });
});

app.post('/sala/:name/ocupar', function (req, res) {
  Sala.findOne({ name: req.params.name }).then(function (sala) {
    if (!sala) return res.json({ err: 'No la encontre' });

    sala.disponible = false;
    sala.save().then(function () {
      res.send("Sala " + sala.name + " ocupada.");
    });
  });
});


const port = process.env.PORT || 3008;
app.listen(port, () => {
  console.log("Server running on port", port)
})
