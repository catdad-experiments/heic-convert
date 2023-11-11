const decode = require('heic-decode');
const { one, all } = require('./lib.js')(decode);

module.exports = one;
module.exports.all = all;
