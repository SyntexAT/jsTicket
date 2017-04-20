// Mein Webserver

var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// CORS geht immer

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


var zufallsZahl = function( von, bis ) {
  // Math.random() -> 0...1
  var zufall, anzahl;
  anzahl = bis - von + 1;
  zufall = Math.floor( Math.random() * anzahl ) + von;
  return zufall;
}


var getData = function(file, callback)
{
  fs.readFile('data/'+file, function(err, data){
    if (err)
    {
      console.log('Error Daten einlesen. ' + file);
      callback({data:[]});
    }
    else
    {
      callback(JSON.parse(data));
    }
  });
}


var writeData = function(file, data)
{
  fs.writeFile('data/'+file, JSON.stringify(data));
  console.log('Daten gespeichert');
}

app.get('/t2/projects', function(req,res)
{
  console.log('Get All Projects');
  getData('projects.json', function(data)
  {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify(data));
  });
});

app.get('/t2/frontprojects', function(req,res)
{
  console.log('Get All Projects for FrontApplication');
  getData('projects.json', function(data)
  {
    var retProjects = [];
    for (let i in data.data)
    {
      if (data.data[i] != null)
      {
        retProjects.push(data.data[i].name);
      }
      else
      {
        retProjects.push(null);
      }
    }
    console.log(retProjects);
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({data:retProjects}));
  });
});

app.post('/t2/frontprojects/:id', function(req,res)
{
  var id = req.params.id;
  var code = req.body.code;
  console.log('Login Request for Project ', id);
  getData('projects.json', function(data)
  {
    var exisitingProject = data.data[id];
    console.log('Login on Project ', exisitingProject);
    if (exisitingProject.code != code)
    {
      res.writeHead(403, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error:'Code invalid'}));
      return;
    }
    else
    {
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({data:exisitingProject}));
      return;
    }

  });
});

app.post('/t2/projects', function(req,res)
{
  console.log('New Project ', req.body);
  getData('projects.json', function(data)
  {
    var newProject = req.body;
    newProject.code = '';
    newProject.code += zufallsZahl(0,9).toString()+zufallsZahl(0,9).toString()+zufallsZahl(0,9).toString()+zufallsZahl(0,9).toString();
    newProject.markers = [];
    data.data.push(req.body);
    writeData('projects.json', data);
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({id:data.data.length-1}));
  });
});

app.put('/t2/projects/:id', function(req,res)
{
  var id = req.params.id;

  console.log('Update Project', id);
  console.log('Body', req.body);
  console.log('Change Name to', req.body.name);
  getData('projects.json', function(data)
  {
    try {
      // Only Update Name
      data.data[id].name = req.body.name;
      writeData('projects.json', data);
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({changed:true}));
    } catch (e) {
      console.log(e);
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error:'ID falsch?'}));
    }
  });
});

app.delete('/t2/projects/:id', function(req,res)
{
  var id = req.params.id;
  console.log('Delete Project', id);
  getData('projects.json', function(data)
  {
    try {
      data.data[id] = null;
      writeData('projects.json', data);
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({deleted:true}));
    } catch (e) {
      console.log(e);
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error:'ID falsch?'}));
    }
  });
});

app.post('/t2/projects/:id/markers', function(req,res)
{
  var projectid = req.params.id;
  console.log('Add Marker ', req.body, 'to project ', projectid);
  getData('projects.json', function(data)
  {
    var newmarker = req.body;
    var exisitingproject = data.data[projectid];
    console.log(exisitingproject);
    if (!exisitingproject.markers)
    {
      exisitingproject.markers = [];
    }
    exisitingproject.markers.push(newmarker);
    writeData('projects.json', data);
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({id:data.data.length-1}));
  });
});

app.put('/t2/projects/:projectid/markers/:markerid', function(req,res)
{
  var projectid = req.params.projectid;
  var markerid = req.params.markerid;
  console.log('Edit Marker ', req.body, ' where marker id is ',markerid,'to project ', projectid);
  getData('projects.json', function(data)
  {
    var editmarker = req.body;
    var exisitingproject = data.data[projectid];

    console.log(exisitingproject);
    if (exisitingproject.markers)
    {
      var exisitingmarker = exisitingproject.markers[markerid];
      if (exisitingmarker)
      {
        exisitingmarker.name = editmarker.name;
        exisitingmarker.lat = editmarker.lat;
        exisitingmarker.lng = editmarker.lng;
        writeData('projects.json', data);
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({id:data.data.length-1}));
        return;
      }
    }
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({error:'Something went wrong'}));
  });
});

// DELTE Marker
app.delete('/t2/projects/:projectid/markers/:markerid', function(req,res)
{
  var projectid = req.params.projectid;
  var markerid = req.params.markerid;
  console.log('Delete Marker where marker id is ',markerid,'to project ', projectid);
  getData('projects.json', function(data)
  {
    var exisitingproject = data.data[projectid];

    console.log(exisitingproject);
    if (exisitingproject.markers)
    {
      var exisitingmarker = exisitingproject.markers[markerid];
      if (exisitingmarker)
      {
        exisitingproject.markers[markerid] = null;
        writeData('projects.json', data);
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({id:data.data.length-1}));
        return;
      }
    }
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({error:'Something went wrong'}));
  });
});

app.use(express.static('.'));
