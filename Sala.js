var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salaSchema = new Schema({
  name: String,
  disponible: Boolean
});


module.export = salaSchema;
