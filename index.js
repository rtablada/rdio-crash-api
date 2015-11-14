require('dotenv').load();
var _ = require('lodash');
var clientId = process.env.RDIO_ID;
var clientSecret = process.env.RDIO_SECRET;
var port = process.env.PORT || 3000;

var Rdio = require('rdio')({
  rdio: {
    clientId,
    clientSecret,
  },
});
var express = require('express');
var cors = require('cors');
var app = express();

app.use(cors());

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  var rdio = new Rdio();

  rdio.getClientToken(function(err) {
    if (err) {
      return res.send(err);
    }

    rdio.request({method: 'getTopCharts', type: 'Album'}, false, function(err, data) {
      if (err) {
        return res.send(err);
      }

      res.send(data);
    });
  });
});

app.get('/albums/:key', function(req, res) {
  var rdio = new Rdio();

  rdio.getClientToken(function(err) {
    if (err) {
      return res.send(err);
    }

    rdio.request({method: 'get', keys: req.params.key}, false, function(err, data) {
      if (err) {
        return res.send(err);
      }

      var result = data.result[req.params.key];
      var trackKeys = result.trackKeys;

      rdio.request({method: 'get', keys: trackKeys.join(',')}, false, function(err, trackData) {
        if (err) {
          return res.send(err);
        }

        result.tracks = trackKeys.reduce((carry, trackKey) => {
          carry.push(trackData.result[trackKey]);

          return carry;
        }, []);

        res.send(data);
      });
    });
  });
});

app.use(function(res) {
  return res.send('Not Implemented');
});

var server = app.listen(port, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
