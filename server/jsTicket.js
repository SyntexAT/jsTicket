var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var express = require('express');
var crypto = require('crypto');
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

var server = app.listen(12345, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server listen http://%s:%s', host, port);
});

var getJsonData = function (file, callback) {
    fs.readFile('data/' + file, function (err, data) {
        if (err) {
            console.log('Datei konnte nicht gelesen werden! ' + file);
            callback({data: []});
        } else {
            callback(JSON.parse(data));
        }
    })
}
var writeJsonData = function (file, data) {
    fs.writeFile('data/' + file, JSON.stringify(data));
    console.log('Daten wurden gespeichert! ' + file);
}

app.get('/json', function (req, res) {
    getJsonData('tickets.json', function (data) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));
        console.log('JSON abgerufen');
    });
});

app.put('/login/:id', function (req, res) {
    var id = req.params.id;
    console.log('Login überprüfen');
    getJsonData('tickets.json', function (data) {
        var userFound = 0, hash = '';
        for (var i in data.data) {
            if (i == id) {
                userFound = 1;
                hash = i;
            }
        }

        if (userFound == 1) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(hash));
        } else {
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Keine Firmeninstanz zu diesem Hash gefunden!' + hash}));
        }

    });
});
app.post('/register', function (req, res) {
    getJsonData('tickets.json', function (data) {
        var dataDev = data.data;

        hash = crypto.createHash('md5').update(req.body.firma + 'synSalt').digest('hex');


        if (dataDev[hash]) {
            res.writeHead(409, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Login existiert schon!'}));
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
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(hash));
        }
    });
});

app.post('/kunde', function (req, res) {
    getJsonData('tickets.json', function (data) {
        var dataDev = data.data;
        var devHash = req.body.devHash;
        var cusHash = crypto.createHash('md5').update(req.body.name + 'synSalt').digest('hex');
        if (dataDev[devHash].customer[cusHash]) {
            res.writeHead(409, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Kunde schon vorhanden!'}));
        } else {
            var cusID = 1;
            for (var i in dataDev[devHash].customer) {
                cusID++;
            }
            dataDev[devHash].customer[cusHash] = {
                id: cusID,
                name: req.body.name,
                address: req.body.address,
                zip: req.body.zip,
                city: req.body.city,
                person: req.body.person,
                email: req.body.email,
                tel: req.body.tel,
                rate: req.body.rate,
                tickets: 0
            };
            writeJsonData('tickets.json', data);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(req.body.name));
        }
    });
});
app.get('/kunde/:dev/:id', function (req, res) {
    var id = req.params.id;
    var devHash = req.params.dev;
    getJsonData('tickets.json', function (data) {
        var customerDetail = data.data[devHash].customer[id];
        customerDetail.hash = id;
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(customerDetail));
    });
});
app.get('/kundenliste/:dev', function (req, res) {
    var dev = req.params.dev;
    getJsonData('tickets.json', function (data) {
        var customerList = data.data[dev].customer;
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(customerList));
    });
});

app.post('/ticket', function (req, res) {
    getJsonData('tickets.json', function (data) {
        var openTickets = data.data[req.body.devHash].customer[req.body.cusHash].tickets;
        openTickets++;
        var ticketID = data.data[req.body.devHash].tickets.length;
        ticketID++
        data.data[req.body.devHash].customer[req.body.cusHash].tickets = openTickets;
        req.body.status = 'offen';
        req.body.customer = data.data[req.body.devHash].customer[req.body.cusHash].name;
        req.body.id = ticketID;
        req.body.notes = [];
        req.body.fulltime = 0;
        req.body.date = new Date();
        data.data[req.body.devHash].tickets.push(req.body);
        writeJsonData('tickets.json', data);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data.data[req.body.devHash].tickets.length));
    })
});
app.get('/ticket/:dev', function (req, res) {
    var dev = req.params.dev;
    getJsonData('tickets.json', function (data) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data.data[dev].tickets));
    });
});
app.put('/ticket/:cus/:id', function (req, res) {
    var cusHash = req.params.cus;
    var ticketID = req.params.id * 1 - 1;
    getJsonData('tickets.json', function (data) {
        for (var i in data.data) {
            if (data.data[i].tickets[ticketID].cusHash == cusHash) {
                data.data[i].tickets[ticketID].status = req.body.status;
                data.data[i].tickets[ticketID].offered = req.body.offered;
                if (req.body.status == 'abgeschlossen') {
                    data.data[i].customer[cusHash].tickets = data.data[i].customer[cusHash].tickets - 1;
                }
                if (req.body.time != '' || req.body.note != '') {
                    var ticketNote = {
                        time: req.body.time,
                        note: req.body.note
                    };
                    data.data[i].tickets[ticketID].fulltime = Math.round(((data.data[i].tickets[ticketID].fulltime * 1) + (req.body.time * 1)) * 100) / 100;
                    data.data[i].tickets[ticketID].notes.push(ticketNote);
                }

            }
        }
        writeJsonData('tickets.json', data);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));
    })
});
app.delete('/ticket/:cus/:id', function (req, res) {
    var cusHash = req.params.cus;
    var ticketID = req.params.id * 1 - 1;
    getJsonData('tickets.json', function (data) {
        for (var i in data.data) {
            if (data.data[i].tickets[ticketID].cusHash == cusHash) {
                data.data[i].tickets[ticketID].status = "storniert";
                data.data[i].customer[cusHash].tickets = data.data[i].customer[cusHash].tickets - 1;
            }
        }
        writeJsonData('tickets.json', data);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));
    })
});

app.get('/rechnungen/:dev', function (req, res) {
    var devHash = req.params.dev;
    getJsonData('tickets.json', function (data) {
        var invoices = data.data[devHash].invoices;
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(invoices));
    })
});
app.get('/rechnungen/:dev/:cus', function (req, res) {
    var devHash = req.params.dev;
    var cusHash = req.params.cus;
    getJsonData('tickets.json', function (data) {
        var invoices = [];
        for (var i in data.data[devHash].invoices) {
            if (data.data[devHash].invoices[i].cusHash == cusHash) {
                invoices.push(data.data[devHash].invoices[i]);
            }
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(invoices));
    })
});
app.get('/rechnung/:dev/:cus', function (req, res) {
    var devHash = req.params.dev;
    var cusHash = req.params.cus;
    getJsonData('tickets.json', function (data) {
        var developerData = data.data[devHash].developer;
        var customerData = data.data[devHash].customer[cusHash];
        var ticketsData = data.data[devHash].tickets;
        var ticketsTime = 0;
        var invoiceData = {
            cusHash: cusHash,
            nr: data.data[devHash].invoices.length + 1,
            developer: developerData,
            customer: customerData,
            tickets: [],
            date: new Date(),
            hours: 0,
            total: 0,
            ispayed: 0
        };
        for (var i in ticketsData) {
            if (ticketsData[i].cusHash == cusHash && ticketsData[i].status == 'abgeschlossen') {
                ticketsData[i].status = 'verrechnet';
                var ticketInfo = {
                    id: ticketsData[i].id,
                    name: ticketsData[i].name,
                    fulltime: ticketsData[i].fulltime
                }
                invoiceData.tickets.push(ticketInfo);
                invoiceData.hours = invoiceData.hours + ticketsData[i].fulltime;
            }
        }
        invoiceData.total = invoiceData.hours * customerData.rate;
        data.data[devHash].invoices.push(invoiceData);
        writeJsonData('tickets.json', data);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(invoiceData));
    });
});
app.put('/rechnung/:dev/:id', function(req, res) {
    var devHash = req.params.dev;
    var id = req.params.id;
    getJsonData('tickets.json', function(data){
       var ticket = data.data[devHash].invoices[id];
        ticket.ispayed = 1;
        writeJsonData('tickets.json', data);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(ticket));
    });
});
app.get('/rechnung-detail/:dev/:id', function (req, res) {
    var devHash = req.params.dev;
    var id = req.params.id;
    getJsonData('tickets.json', function (data) {
        var ticket = data.data[devHash].invoices[id];
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(ticket));
    })
});

app.get('/userlogin/:id', function (req, res) {
    var id = req.params.id;
    getJsonData('tickets.json', function (data) {
        var userFound = 0, hash = '';
        for (var i in data.data) {
            for (var j in data.data[i].customer) {
                if (j == id) {
                    userFound = 1;
                    hash = j;
                }
            }
        }
        if (userFound == 1) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(hash));
        } else {
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Keine Firmeninstanz zu diesem Hash gefunden!' + hash}));
        }

    });
});
app.get('/userticket/:cus', function (req, res) {
    var cusHash = req.params.cus;
    getJsonData('tickets.json', function (data) {
        for (var i in data.data) {
            for (var j in data.data[i].customer) {
                if (j == cusHash) {
                    var customer = {
                        name: data.data[i].customer[j].name,
                        person: data.data[i].customer[j].person,
                        tickets: []
                    }
                }
            }
        }
        for (var i in data.data){
            for(var j in data.data[i].tickets){
                if(data.data[i].tickets[j].cusHash == cusHash){
                    customer.tickets.push(data.data[i].tickets[j]);
                }
            }
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(customer));
    })
});
app.post('/userticket/:cus', function (req, res) {
    var cusHash = req.params.cus;
    getJsonData('tickets.json', function (data) {
        for (var i in data.data) {
            for (var j in data.data[i].customer)
                if (j == cusHash) {
                    var openTickets = data.data[i].customer[cusHash].tickets;
                    openTickets++;
                    var ticketID = data.data[i].tickets.length;
                    ticketID++;
                    data.data[i].customer[cusHash].tickets = openTickets;
                    req.body.devHash = i;
                    req.body.status = 'offen';
                    req.body.customer = data.data[i].customer[cusHash].name;
                    req.body.id = ticketID;
                    req.body.notes = [];
                    req.body.fulltime = 0;
                    req.body.offered = 0;
                    req.body.date = new Date();
                    data.data[i].tickets.push(req.body);
                }
        }
         writeJsonData('tickets.json', data);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data.data));
    })
});

app.use(express.static('.'));
