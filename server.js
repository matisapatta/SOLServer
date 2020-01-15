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
var nodeMailer = require('nodemailer');
const bcrypt = require('bcrypt');
const SALT_I = 10;
const config = require('./config/config').get(process.env.NODE_ENV)
// mail
// mads.solutions@gmail.com
// MADSM0bile*
/*
Schemas
 */
const { Sala } = require('./models/Sala');
const { User } = require('./models/User');
const { Reservation } = require('./models/Reservations')
const { Review } = require('./models/Review')
const { auth } = require('./middleware/auth.js')


const app = express();
mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE)
// mongoose.connect('mongodb://localhost:27017/salasonline');
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

// Para heroku
app.use(express.static('client/build'))

function sendEmail(subject, mailto, data, body) {
  let email;
  var query = User.findById(mailto, (err, doc) => {
    if (err) console.log(err)
    email = doc.email;
  })
  query.exec().then(function () {
    let transporter = nodeMailer.createTransport({
      // host: 'smtp.gmail.com',
      // port: 465,
      // secure: true,
      service: 'Gmail',
      auth: {
        user: 'mads.solutions@gmail.com',
        pass: 'MADSM0bile2*'
      }
    });
    // console.log(email)
    let mailOptions = {
      from: '"Salas Online" <mads.solutions@gmail.com>', // sender address
      to: "mati.sapatta@gmail.com", // list of receivers
      // to: email,
      subject: subject, // Subject line
      // text: req.body.body, // plain text body
      html: body
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      // console.log('Message %s sent: %s', info.messageId, info.response);
      // res.render('index');
    });
  })
}



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

app.get('/api/getsalasadmin', (req, res) => {
  Sala.find({}, (err, doc) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(doc);
  })
})


/**************** POST ****************/

app.post('/api/testsalasave', (req, res) => {
  const sala = new Sala(req.body);
  sala.save((err, doc) => {

    if (err) {
      return res.json({ success: false })
    }
    res.status(200).json({
      success: true,
      sala: doc
    })
  })
})

app.post('/api/closespecial', (req, res) => {
  Sala.findByIdAndUpdate(req.body.id, { $push: { specialClose: req.body.date } }, { new: true }, (err, doc) => {
    if (err) return res.json({ sala: false })
    res.status(200).json({
      // success: true,
      sala: doc
    })
  })
})

app.post('/api/openspecial', (req, res) => {
  Sala.findByIdAndUpdate(req.body.id, { $pull: { specialClose: req.body.date } }, { new: true }, (err, doc) => {
    if (err) return res.json({ sala: false })
    res.status(200).json({
      // success: true,
      sala: doc
    })
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

app.post('/api/updatesala', (req, res) => {
  const id = req.body._id;
  Sala.findByIdAndUpdate(id, req.body, { new: true }, (err, doc) => {
    if (err) {
      console.log(err)
      return res.json({ sala: false })
    }
    res.status(200).json({
      // success: true,
      sala: doc
    })
  })
})

// app.post('/api/addscoretosala', (req, res) => {
//   const salaId = req.query.id;
//   let score = 0;
//   Review.find({ salaId: id }, (err, doc) => {
//     if (err) {
//       console.log(err)
//       return res.json({ sala: false })
//     }
//     let acum = 0;
//     doc.map((item, i) => {
//       acum += item.score
//     })
//     score = acum / doc.length
//   })
//   Sala.findByIdAndUpdate(salaId, { score: score }, { new: true }, (err, doc) => {
//     if (err) {
//       console.log(err)
//       return res.json({ sala: false })
//     }

//     res.status(200).json({
//       // success: true,
//       sala: doc
//     })
//   })
// })

function addScoreToSala(salaId) {
  let score = 0;
  let query = Review.find({ salaId: salaId }, (err, doc) => {
    if (err) {
      console.log(err)
      return err;
    }
    let acum = 0;
    doc.map((item, i) => {
      acum += item.score
    })
    score = Math.round(acum / doc.length)
  })
  query.exec().then(function () {
    Sala.findByIdAndUpdate(salaId, { score: score }, { new: true }, (err, doc) => {
      if (err) {
        console.log(err)
        return err;
      }
      return doc;
    })
  })
}

app.post('/api/deletesala', (req, res) => {
  Sala.findByIdAndRemove(req.query.id, (err, doc) => {
    if (err) {
      return res.json(err)
    }
    res.status(200).json({ deleted: true })
  })
})




/**************** RESERVATIONS  ****************/

/**************** GET  ****************/

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

app.get('/api/getrestoreviewbyuser', (req, res) => {
  let id = req.query._id;
  Reservation.find({ userId: id, cancelled: false, closed: true }, (err, doc) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.status(200).send(doc);
  })
})

app.get('/api/getreservationbyid', (req, res) => {
  let id = req.query._id;
  let sendData = null;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // Yes, it's a valid ObjectId, proceed with `findById` call.
    Reservation.findById(id, (err, doc) => {
      if (err) {
        return res.status(400).send(err);
      }
      User.findById(doc.userId, (err, user) => {
        if (err) return res.status(400).send(err)
        sendData = {
          _id: doc._id,
          salaId: doc.salaId,
          ownerId: doc.ownerId,
          salaName: doc.salaName,
          roomId: doc.roomId,
          day: doc.day,
          from: doc.from,
          hours: doc.hours,
          timestamp: doc.timestamp,
          userId: doc.userId,
          paid: doc.paid,
          cancelled: doc.cancelled,
          cancelledBy: doc.cancelledBy,
          cancelledById: doc.cancelledById,
          reviewed: doc.reviewed,
          reviewedBy: doc.reviewedBy,
          reviewedById: doc.reviewedById,
          closed: doc.closed,
          username: user.name + ' ' + user.lastname,
          useremail: user.email,
          userphone: user.phone,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt
        }
        res.status(200).send(sendData)
      })
      // res.status(200).send(doc);
    })
  } else {
    return res.json({
      error: "No es un formato de ID de reserva válido"
    })
  }

})


/**************** POST  ****************/

app.post('/api/savereservation', (req, res) => {
  const reserv = new Reservation(req.body);
  reserv.save((err, doc) => {
    if (err) {
      console.log(err)
      return res.json({ reserv: false })
    }
    const emailReservaOwner = '<b>Email automático</b>' +
      `<div>Se ha creado una nueva reserva, en ${doc.salaName}, el ${doc.timestamp}. El código de reserva es ${doc._id}</div>`

    const emailReservauser = '<b>Email automático</b>' +
      `<div>Se ha creado una nueva reserva, en ${doc.salaName}, el ${doc.timestamp}. El código de reserva es ${doc._id}</div>`
    // Mail to user
    sendEmail("Reserva creada con éxito", doc.userId, doc, emailReservauser);
    // Mail to vendor
    sendEmail("Nueva reserva creada", doc.ownerId, doc, emailReservaOwner);
    res.status(200).json({ reservation: doc })
  })
})

app.post('/api/cancelreservation', (req, res) => {
  Reservation.findByIdAndUpdate(req.query.id, { cancelled: true, cancelledById: req.body.userid, cancelledBy: req.body.username }, { new: true }, (err, doc) => {
    if (err) {
      console.log(err)
      return res.json({ reserv: false })
    }
    res.status(200).json({ reservation: doc })
  })
})

app.post('/api/deletereservation', (req, res) => {
  Reservation.findByIdAndRemove(req.query.id, (err, doc) => {
    if (err) {
      return res.json(err)
    }
    res.status(200).json({ deleted: true })
  })
})

app.post('/api/closereservation', (req, res) => {
  Reservation.findByIdAndUpdate(req.query.id, { closed: true }, { new: true }, (err, doc) => {
    if (err) {
      console.log(err)
      return res.json({ reserv: false })
    }
    res.status(200).json({ reservation: doc })
  })
})


/**************** REVIEWS  ****************/

/**************** GET  ****************/

app.get('/api/getreviewsbysala', (req, res) => {
  let id = req.query._id;
  Review.find({ salaId: id }, (err, doc) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(doc);
  })
})

app.get('/api/getreviewsbyuser', (req, res) => {
  let id = req.query._id;
  Review.find({ reviewer: id }, (err, doc) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.status(200).send(doc);
  })
})

app.get('/api/getreviewsbyreservationid', (req, res) => {
  let id = req.query._id;
  // console.log(id)
  Review.find({ reservationId: id }, (err, doc) => {
    if (err) {
      return res.status(400).send(err);
    }
    // console.log(doc)
    res.status(200).json({
      // success: true,
      review: doc
    })
  })
})


/**************** POST  ****************/

app.post('/api/savereview', (req, res) => {
  const review = new Review(req.body);
  const salaId = req.body.salaId
  let returnDoc;
  review.save((err, doc) => {
    if (err) return res.json({ review: false })
    returnDoc = doc
    addScoreToSala(salaId)
    res.status(200).json({
      // success: true,
      savedReview: returnDoc
    })
  })
})

app.post('/api/markasreviewed', (req, res) => {
  Reservation.findByIdAndUpdate(req.query.id, { reviewed: true, reviewedById: req.body.userid, reviewedBy: req.body.username }, { new: true }, (err, doc) => {
    if (err) {
      console.log(err)
      return res.json({ reserv: false })
    }
    res.status(200).json({ reservation: doc })
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

// app.post('/api/register', (req, res) => {
//   const user = new User(req.body);
//   user.save((err, doc) => {
//     if (err) return res.json({ success: false })
//     res.status(200).json({
//       success: true,
//       user: doc
//     })
//   })
// })

app.post('/api/register', (req, res) => {
  const user = new User(req.body);
  user.save((err, doc) => {
    if (err) return res.json({ err, success: false })
    if (doc.active) {
      const emailBody = '<p>Bienvenido!</p>' +
        '<div>Su usuario se encuentra activado. Ya puede empezar a utilizar nuestros servicios. Visite el siguiente link para comenzar</div>' +
        `<div><a href='http://localhost:3000/'>http://localhost:3000/</a></div>`
      // Mail
      sendEmail("Bienvenido a Salas OnLine", doc._id, doc, emailBody);
      doc.generateToken((err, doc) => {
        if (err) return res.status(400).send(err);
        res.cookie('auth', doc.token).json({
          success: true,
          user: doc
        })
      })
    } else {
      const emailBody = '<p>Bienvenido!</p>' +
        '<div>Es necesario que active su usario. Para eso, haga click en el siguiente link</div>' +
        `<div><a href='http://localhost:3000/activateuser/${doc._id}'>http://localhost:3000/activateuser/${doc._id}</a></div>`
      // Mail
      sendEmail("Activación de usuario requerida", doc._id, doc, emailBody);
      res.status(200).json({
        success: true,
        user: doc
      })
    }
  })
})


app.post('/api/login', (req, res) => {
  User.findOne({ 'email': req.body.email }, (err, user) => {
    if (!user) return res.json({ isAuth: false, message: 'Email no encontrado' });
    if (!user.active) return res.json({ isAuth: false, message: 'Usuario pendiente de activación' });
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

  if (file) {
    cloudinary.uploader.upload(file,
      {
        resource_type: "image", public_id: `salasonline/${folder}/${name}`,
        overwrite: true
      },
      function (error, result) {

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

app.post('/api/activateuser', (req, res) => {
  User.findByIdAndUpdate(req.body._id, { active: true }, { new: true }, (err, user) => {
    if (err) return res.status(400).send(err);
    const emailBody = '<p>Bienvenido!</p>' +
      '<div>Su usuario se encuentra activado. Ya puede empezar a utilizar nuestros servicios. Visite el siguiente link para comenzar</div>' +
      `<div><a href='http://localhost:3000/'>http://localhost:3000/</a></div>`
    // Mail
    sendEmail("Bienvenido a Salas OnLine", user._id, user, emailBody);
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

app.post('/api/resetpassword', (req, res) => {
  User.findById(req.body._id, (err, doc) => {
    if (err) return res.json({ err, success: false })
    if (!doc.active) {
      const user = new User(doc);
      user.password = req.body.password;
      user.active = true;
      user.save((err, doc) => {
        if (err) return res.json({ err, success: false })
        res.status(200).json({ doc, success: true })
      })
    } else {
      res.status(200).json({ msg: "Link expirado", success: false })
    }
  })
})

app.post('/api/changepassword', (req, res) => {
  User.findById(req.body._id, (err, doc) => {
    if (err) return res.json({ err, success: false })
    const user = new User(doc);
    user.password = req.body.password;
    user.save((err, doc) => {
      if (err) return res.json({ err, success: false })
      res.status(200).json({ doc, success: true })
    })
  })
})

app.post('/api/forgotpassword', (req, res) => {
  User.findOneAndUpdate({ email: req.body.email }, { active: false }, { new: true }, (err, doc) => {
    if (err) return res.status(400).send(err)
    if (doc) {
      const emailBody = '<p>Cambio de contraseña</p>' +
        '<div>Ha solicitado cambiar la contraseña. Por favor visite el siguiente link para cambiarla</div>' +
        `<div><a href='http://localhost:3000/resetpassword/${doc._id}'>http://localhost:3000/resetpassword/${doc._id}</a></div>`
      // Mail
      sendEmail("Cambio de Contraseña", doc._id, doc, emailBody);
      res.status(200).json({ success: true, doc })
    } else {
      res.json({ success: false, msg: "Email no encontrado" })
    }
  })
})


/** PAGO **/
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
      success: `http://localhost:3000/paymentok/${req.body.reservationId}`,
      failure: `http://localhost:3000/paymentko/${req.body.reservationId}`,
      pending: `http://localhost:3000/paymentp/${req.body.reservationId}`,
    },
    auto_return: 'approved',
  }

  res.status(200)
  mercadopago.preferences.create(preference)
    .then(function (preference) {

      return res.send(preference)
    }).catch(function (error) {

      return res.send(error)
    });
})


/**************** REPORTS  ****************/


/** Total ganado por dueño de sala */
app.get('/api/totalmoneybyuser', (req, res) => {
  const user = req.query.user;
  const seven = req.query.seven;
  if (seven) {
    Reservation.find({ ownerId: user, timestamp: { $gte: new Date((new Date).getTime() - 7 * 24 * 60 * 60 * 1000) } }, (err, doc) => {
      if (err) {
        return res.status(400).send(err);
      }
      let money = 0;
      if (doc && doc.length === 0) {

      } else {
        doc.forEach(function (item) {
          money += item.paid;
        })
      }

      res.status(200).json({ money });
    })
  } else {
    Reservation.find({ ownerId: user }, (err, doc) => {
      if (err) {
        return res.status(400).send(err);
      }
      let money = 0;
      if (doc && doc.length === 0) {

      } else {
        doc.forEach(function (item) {
          money += item.paid;
        })
      }
      res.status(200).json({ money });
    })
  }
})


app.get('/api/totalmoneybysala', (req, res) => {
  const user = req.query.user;
  const seven = req.query.seven;
  var ret = []
  var query;
  if (seven) {
    Sala.find({ ownerId: user }, (err, doc) => {
      if (err) {
        return res.status(400).send(err);
      }
      if (doc && doc.length === 0) {
        return res.status(200).send(doc)
      } else {
        doc.forEach(function (sala) {
          query = Reservation.find({ salaId: sala._id, timestamp: { $gte: new Date((new Date).getTime() - 7 * 24 * 60 * 60 * 1000) } }, (err, doc) => {
            if (err) {
              return res.status(400).send(err);
            }
            let money = 0;
            doc.forEach(function (item) {
              money += item.paid
            })
            ret.push({
              sala: sala.name,
              money,
            });

          })
        })
        query.exec().then(function () {
          res.status(200).send(ret);
        })
      }
      // res.status(200).send(ret);
    })
  } else {
    Sala.find({ ownerId: user }, (err, doc) => {
      if (err) {
        return res.status(400).send(err);
      }
      if (doc && doc.length === 0) {
        return res.status(200).send(doc)
      } else {
        doc.forEach(function (sala) {
          query = Reservation.find({ salaId: sala._id }, (err, doc) => {
            if (err) {
              return res.status(400).send(err);
            }
            let money = 0;
            doc.forEach(function (item) {
              money += item.paid
            })
            ret.push({
              sala: sala.name,
              money,
            });

          })
        })
        query.exec().then(function () {
          res.status(200).send(ret);
        })
      }

      // res.status(200).send(ret);
    })
  }
})

/** Total ganado por sala */
app.get('/api/moneybysala', (req, res) => {
  const sala = req.query.sala;
  const seven = req.query.seven;
  if (seven) {
    Reservation.find({ salaId: sala, timestamp: { $gte: new Date((new Date).getTime() - 7 * 24 * 60 * 60 * 1000) } }, (err, doc) => {
      if (err) {
        return res.status(400).send(err);
      }
      let money = 0;
      if (doc && doc.length === 0) {

      } else {
        doc.forEach(function (item) {
          money += item.paid;
        })
      }
      res.status(200).json({ money });
    }).sort({ salaName: 1 })
  } else {
    Reservation.find({ salaId: sala }, (err, doc) => {
      if (err) {
        return res.status(400).send(err);
      }
      let money = 0;
      if (doc && doc.length === 0) {

      } else {
        doc.forEach(function (item) {
          money += item.paid;
        })
      }
      res.status(200).json({ money });
    }).sort({ salaName: 1 })
  }
})



app.get('/api/reservationsbyday', (req, res) => {
  const user = req.query.user;
  const seven = req.query.seven;
  var ret = []
  var query;
  Sala.find({ ownerId: user }).sort({ _id: 'asc' }).exec((err, doc) => {
    if (err) {
      return res.status(400).send(err);
    }
    if (doc && doc.length === 0) {
      return res.status(200).send(doc);
    } else {
      doc.map(function (sala, i) {
        if (seven) {
          query = Reservation.find({ salaId: sala._id, timestamp: { $gte: new Date((new Date).getTime() - 7 * 24 * 60 * 60 * 1000) } }, (err, doc) => {
            if (err) {
              return res.status(400).send(err);
            }
            let reserv = {
              dom: 0,
              lun: 0,
              mar: 0,
              mier: 0,
              jue: 0,
              vie: 0,
              sab: 0,

            }
            doc.forEach(function (item) {
              switch (item.numberDay) {
                case 0:
                  reserv["dom"] += 1;
                  break;
                case 1:
                  reserv["lun"] += 1;
                  break;
                case 2:
                  reserv["mar"] += 1;
                  break;
                case 3:
                  reserv["mier"] += 1;
                  break;
                case 4:
                  reserv["jue"] += 1;
                  break;
                case 5:
                  reserv["vie"] += 1;
                  break;
                case 6:
                  reserv["sab"] += 1;
                  break;
                default: null
              }
            })
            ret.push({
              sala: sala.name,
              reserv,
              total: doc.length,
            });
            // console.log(ret)
          })
        } else {
          query = Reservation.find({ salaId: sala._id }, (err, doc) => {
            if (err) {
              return res.status(400).send(err);
            }
            let reserv = {
              dom: 0,
              lun: 0,
              mar: 0,
              mier: 0,
              jue: 0,
              vie: 0,
              sab: 0,

            }
            doc.forEach(function (item) {
              switch (item.numberDay) {
                case 0:
                  reserv["dom"] += 1;
                  break;
                case 1:
                  reserv["lun"] += 1;
                  break;
                case 2:
                  reserv["mar"] += 1;
                  break;
                case 3:
                  reserv["mier"] += 1;
                  break;
                case 4:
                  reserv["jue"] += 1;
                  break;
                case 5:
                  reserv["vie"] += 1;
                  break;
                case 6:
                  reserv["sab"] += 1;
                  break;
                default: null
              }
            })
            ret.push({
              sala: sala.name,
              reserv,
              total: doc.length,
            });
          })
        }

      })
      query.exec().then(function () {
        res.status(200).send(ret);
      })
    }

  })
})

app.get('/api/lastreview', (req, res) => {
  Review.find().sort({ createdAt: 'desc' }).limit(3).exec((err, doc) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(doc)
  })
})

app.get('/api/nextreservation', (req, res) => {
  const id = req.query.id;
  const now = new Date();
  var closest = Infinity;
  var reserv = null;
  var query = Reservation.find({ userId: id }, (err, doc) => {
    if (err) return res.status(400).send(err);
    doc.map((item, i) => {
      var date = new Date(item.timestamp)
      if (date >= now && (date < new Date(closest) || date < closest)) {
        closest = item.timestamp;
        reserv = item;
        // console.log(reserv)
      }
    })
  })
  query.exec().then(function () {
    // console.log(reserv)
    res.status(200).send(reserv)
  })
})

app.get('/api/latestsala', (req, res) => {
  Sala.find().sort({ createdAt: 'desc' }).limit(1).exec((err, doc) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(doc)
  })
})

if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.get('/*',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'client','build','index.html'));
  });

}

const port = process.env.PORT || 3008;
app.listen(port, () => {
  console.log("Server running on port", port)
})
