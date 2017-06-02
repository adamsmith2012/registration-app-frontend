var express = require('express')
var app = express();
var port = process.env.PORT || 8000;

app.use(express.static('public'));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT ,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.get('/*', function(req, res) {
  res.sendfile('public/index.html');
});

app.listen(port, function() {
  console.log("auth frontend running on port: ", port);
});
