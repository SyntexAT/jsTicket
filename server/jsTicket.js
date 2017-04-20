// Mein Webserver

var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var express = require('express');
var crypto = require('crypto');
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(function(req,res,next){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, DELETE');
  next();
});

var server = app.listen(12345, function(){
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server listen http://%s:%s',host,port);
});

var getJsonData = function(file, callback){
  fs.readFile('data/'+file, function(err, data){
    if (err) {
      console.log('Datei konnte nicht gelesen werden! ' + file);
      callback({data:[]});
    } else {
      callback(JSON.parse(data));
    }
  })
}

var writeJsonData = function(file, data){
  fs.writeFile('data/'+file, JSON.stringify(data));
  console.log('Daten wurden gespeichert! ' + file);
}

app.get('/json', function(req,res) {
  getJsonData('tickets.json', function(data){
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify(data));
    console.log('JSON abgerufen');
  });
});

app.put('/login/:id', function(req,res) {
  var id = req.params.id;
  console.log('Login überprüfen');
  getJsonData('tickets.json', function(data){
    var userFound = 0, hash = '';
    for(var i in data.data){
      if (i == id) {
        userFound = 1;
        hash = i;
      }
    }

    if (userFound == 1) {
      console.log('found');
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(hash));
    } else {
      console.log('notfound');
      res.writeHead(404, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error:'Keine Firmeninstanz zu diesem Hash gefunden!' + hash}));
    }

  });
});

app.post('/register', function(req,res) {
  getJsonData('tickets.json', function(data){
    var dataDev = data.data;
    hash = crypto.createHash('md5').update(req.body.firma+'synSalt').digest('hex');
    if(dataDev[hash]){
    res.writeHead(409, {'Content-Type':'application/json'});
    res.end(JSON.stringify({error:'Firmeninstanz schon vorhanden!'}));
    } else {
      dataDev[hash] = {
        developer: {
          name: req.body.firma,
          adresse: req.body.adresse,
          plz: req.body.plz,
          ort: req.body.ort,
          email: req.body.email
        },
        customer: {},
        tickets: []
      };
      writeJsonData('tickets.json', data);
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(hash));
    }
  });
});

app.post('/kunde',function(req,res) {
  getJsonData('tickets.json', function(data){
    var dataDev = data.data;
    var devHash = req.body.devHash;
    var cusHash = crypto.createHash('md5').update(req.body.firma+'synSalt').digest('hex');
    if(dataDev[devHash].customer[cusHash]){
      res.writeHead(409, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error:'Kunde schon vorhanden!'}));
    } else {
      dataDev[devHash].customer[cusHash] = {
        name: req.body.firma,
        contactperson: req.body.firma,
        address: req.body.adresse,
        zip: req.body.plz,
        city: req.body.ort
      };
      console.log(devHash, cusHash);
      writeJsonData('tickets.json', data);
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(dataDev[devHash]));
    }
  });
});

app.use(express.static('.'));
