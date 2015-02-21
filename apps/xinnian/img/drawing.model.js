'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DrawingSchema = new Schema({
  'userid': String,
  'data':String,
  'drawid': String,
  // 'time':String,
});

module.exports = mongoose.model('drawing', DrawingSchema);
