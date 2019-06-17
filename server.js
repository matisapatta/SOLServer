/*
Dependencias
 */
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
var cloudinary = require('cloudinary').v2;
var mercadopago = require('mercadopago');

/*
Schemas
 */
const { Sala } = require('./models/Sala');
const { User } = require('./models/User');
const { Reservation } = require('./models/Reservations')
const { auth } = require('./middleware/auth.js')


const app = express();
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/salasonline');
// var db = mongoose.connect('mongodb://localhost:27017/salasonline');
mongoose.set('useFindAndModify', false);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(fileUpload());
cloudinary.config({
  cloud_name: 'matisapatta',
  api_key: '241374799914715',
  api_secret: 'PI-_UnA5NYHrQOsKkYFIlFg0R9Q'
});

mercadopago.configure({
  sandbox: true,
  access_token: 'TEST-2929332727335212-061617-d76e5feadeeeb1c6907bcb7d470899cd-444651392'
})

/**************** SALAS  ****************/

/**************** GET  ****************/

app.get('/api/', function (req, res) {
  console.log("Andando")
  res.send('Andando')
});

app.get('/api/getsala', function (req, res) {
  var query = Sala.find({})
  const name = req.query.name;
  const location = req.query.location;
  const pricefrom = req.query.pricefrom;
  const priceto = req.query.priceto;
  if (name)
    query.and({ name })
  if (location) {
    var locationArr = location.split(',');
    locationArr.forEach((element) => {
      query.or({ "location": element });
    })
  }
  if (pricefrom)
    query.and({ "pricefrom": { $gte: pricefrom } })
  if (priceto)
    query.and({ "priceto": { $lte: priceto } })

  query.exec((err, doc) => {
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

app.get('/api/getsalasowner', (req, res) => {
  let id = req.query.id;
  Sala.find({ ownerId: id }, (err, doc) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(doc);
  })
})

app.get('/api/getreservationsbysala', (req, res) => {
  let id = req.query._id;
  Reservation.find({ salaId: id, cancelled: false }, (err, doc) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(doc);
  })
})

app.get('/api/getreservationsbyuser', (req, res) => {
  let id = req.query._id;
  Reservation.find({ userId: id, cancelled: false }, (err, doc) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.status(200).send(doc);
  })
})

/**************** POST ****************/
app.post('/api/testsalasave', (req, res) => {
  console.log(req.body)
  const sala = new Sala(req.body);
  sala.save((err, doc) => {

    if (err) {
      console.log(err)
      return res.json({ success: false })
    }
    res.status(200).json({
      success: true,
      sala: doc
    })
  })
})

app.post('/api/savereservation', (req, res) => {
  const reserv = new Reservation(req.body);
  reserv.save((err, doc) => {
    if (err) {
      console.log(err)
      return res.json({ reserv: false })
    }
    res.status(200).json({ reservation: doc })
  })
})

app.post('/api/cancelreservation', (req, res) => {
  Reservation.findByIdAndUpdate(req.query.id, { cancelled: true, cancelledBy: req.body.userid }, (err, doc) => {
    if (err) {
      console.log(err)
      return res.json({ reserv: false })
    }
    res.status(200).json({ reservation: doc })
  })
})


app.post('/api/savesala', (req, res) => {
  const sala = new Sala(req.body);
  sala.save((err, doc) => {

    if (err) return res.json({ sala: false })
    res.status(200).json({
      // success: true,
      sala: doc
    })
  })
})

app.post('/api/pay', (req, res) => {
  const item = req.body.item;
  const payer = req.body.payer;
  var preference = {
    items: [{
      id: 1234,
      title: item.title,
      quantity: item.quantity,
      currency_id: item.currency_id,
      unit_price: item.unit_price
    }],
    payer: {
      email: payer.email,
      name: payer.name,
      surname: payer.surname,
      date_created: payer.date_created
    },
    binary_mode: true,
    external_reference: req.body.reservationId,
    back_urls: {
      success: "https://www.tu-sitio/success",
      failure: "http://www.tu-sitio/failure",
      pending: "http://www.tu-sitio/pending"
  },
  auto_return: 'approved',
  }
  console.log(preference)
  res.status(200)
  mercadopago.preferences.create(preference)
  .then(function (preference) {
    console.log(preference)
    return res.send(preference)
  }).catch(function (error) {
    console.log(error)
    return res.send(error)
  });
})

// app.post('/api/initreservations', (req, res) => {
//   const reservations = new Reservations();
//   reservations.ownerId = req.body.ownerId;
//   reservations.salaId = req.body._id;
//   reservations.save((err, doc) => {
//     if (err) return res.json({ error: "No se ha podido inicializar" })
//     res.status(200).json({
//       reservations: doc
//     })
//   })
// })




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
    avatar: req.user.avatar,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    phone: req.user.phone,
    reservations: req.user.reservations,
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
      if (req.body.rememberMe) {
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
          res.cookie('auth', user.token).json({
            isAuth: true,
            id: user._id,
            role: user.role,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            avatar: user.avatar,
            phone: user.phone,
            reservations: user.reservations,
          })
        })
      } else {
        res.json({
          isAuth: true,
          id: user._id,
          role: user.role,
          email: user.email,
          name: user.name,
          lastname: user.lastname,
          avatar: user.avatar,
          phone: user.phone,
          reservations: user.reservations,
        })
      }
    })
  })
})


app.post('/api/upload', function (req, res) {
  const file = req.body.file;
  const folder = req.body.folder;
  const name = req.body.name;
  // console.log(req.body)
  if (file) {
    cloudinary.uploader.upload(file,
      {
        resource_type: "image", public_id: `salasonline/${folder}/${name}`,
        overwrite: true
      },
      function (error, result) {
        console.log(result, error);
        res.json({
          pic: result.secure_url
        });
      });
  } else {
    res.json({
      error: "Hubo un error"
    })
  }

})

/**************** UPDATE  ****************/

app.post('/api/userupdate', (req, res) => {
  User.findByIdAndUpdate(req.body._id, req.body, { new: true }, (err, user) => {
    if (err) return res.status(400).send(err);
    res.json({
      // success: true,
      isAuth: true,
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      avatar: user.avatar,
      phone: user.phone,
      reservations: user.reservations,
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
