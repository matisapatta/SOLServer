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
const { Review } = require('./models/Review')
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


/**************** POST ****************/

app.post('/api/testsalasave', (req, res) => {
  console.log(req.body)
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


/**************** POST  ****************/

app.post('/api/savereview', (req, res) => {
  const review = new Review(req.body);
  review.save((err, doc) => {

    if (err) return res.json({ review: false })
    res.status(200).json({
      // success: true,
      review: doc
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
      doc.forEach(function (item) {
        money += item.paid;
      })
      res.status(200).json({ money });
    })
  } else {
    Reservation.find({ ownerId: user }, (err, doc) => {
      if (err) {
        return res.status(400).send(err);
      }
      let money = 0;
      doc.forEach(function (item) {
        money += item.paid;
      })
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
      // res.status(200).send(ret);
    })
  } else {
    Sala.find({ ownerId: user }, (err, doc) => {
      if (err) {
        return res.status(400).send(err);
      }
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
      doc.forEach(function (item) {
        money += item.paid;
      })
      res.status(200).json({ money });
    }).sort({ salaName: 1 })
  } else {
    Reservation.find({ salaId: sala }, (err, doc) => {
      if (err) {
        return res.status(400).send(err);
      }
      let money = 0;
      doc.forEach(function (item) {
        money += item.paid;
      })
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
          console.log(ret)
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
})
})




const port = process.env.PORT || 3008;
app.listen(port, () => {
  console.log("Server running on port", port)
})
