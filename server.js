/*
Dependencias
 */
const express = require('express')
const app = express()
const mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost:27017/salasensayo');

/*
Clases
 */

 /*
 Esto va en un archivo separado
  */
var Schema = mongoose.Schema;

var salaSchema = new Schema({
  name: String,
  disponible: { type: Boolean, default: true }
});
var Sala = mongoose.model('Sala', salaSchema);
/*
Hasta acá
 */


app.get('/', function(req, res) {
  res.send('Hello World!!')
});

// Pido estado de una sala
app.get('/sala/:name', function(req, res) {
  Sala.findOne({name: req.params.name}).then(function(response) {
    if (!response) return res.json({err: 'No la encontre'});
    res.json(response);
  });
});

// Creo una sala
app.post('/sala/:name', function (req, res) {
  const sala = new Sala({ name: req.params.name });
  sala.save().then(function () {
    res.json({msg: 'sala creada ' +  sala.name});
  });
});

app.post('/sala/:name/ocupar', function (req, res) {
  Sala.findOne({name: req.params.name}).then(function(sala) {
    if (!sala) return res.json({err: 'No la encontre'});

    sala.disponible = false;
    sala.save().then(function() {
      res.send("Sala " +  sala.name + " ocupada.");
    });
  });
});


app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});
