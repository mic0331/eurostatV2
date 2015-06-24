var mongoose = require('mongoose');

module.exports = function(config) {
    mongoose.connect(config.db);
    mongoose.set('debug', function (coll, method, query, doc) {
        console.log(coll + " " + method + " " + JSON.stringify(query) + " " + JSON.stringify(doc));
    });
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error....'));
    db.once('open', function callback() {
        console.log('eurostat db opened'.help);
    });
};

