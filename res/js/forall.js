$(document).ready(function () {

    var developerHash = '';
    var ajaxURL = 'http://127.0.0.1:12345/';
    var cID = '';
    var invoiceImageURL = '';


    if (localStorage.getItem('hash')) {
        developerHash = localStorage.getItem('hash');
        $('.hash').html(developerHash);
    }

    getFilename();

    if ((localStorage.getItem('hash') && $('#login-page').length > 0) || (localStorage.getItem('hash') && $('#register-page').length > 0)) {
        window.location = "app.html";
    }

    /*
     Logout
     */
    $(document).on('click', 'a[href="logout"]', function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location = "login.html";
    });

    /*
     Verstecken von overlay
     */
    $('.hide-overlay').on('click', function (e) {
        e.preventDefault();
        $('.overlay').removeClass('show');
        $('.overlay .success').removeClass('show');
    });

    /*
     Login
     */
    $(document).on('submit', '.login__form', function (e) {
        e.preventDefault();
        var hash = $('#hash').val();
        $.ajax({
            url: ajaxURL + 'login/' + hash,
            method: 'PUT',
            success: function (data) {
                localStorage.setItem('hash', data);
                window.location = "app.html";
            },
            error: function (err) {
                alert(err.responseJSON.error);
            }
        })
    });

    /*
     Entwickler anlegen
     */
    $(document).on('submit', '.register__form', function (e) {
        e.preventDefault();
        var email = $('#email').val();
        var firma = $('#firma').val();
        var adresse = $('#adresse').val();
        var plz = $('#plz').val();
        var ort = $('#ort').val();
        $.ajax({
            url: ajaxURL + 'register',
            method: 'POST',
            data: {
                email: email,
                firma: firma,
                adresse: adresse,
                plz: plz,
                ort: ort
            },
            success: function (data) {
                localStorage.setItem('hash', data);
                window.location = "app.html";
            },
            error: function (err) {
                alert(err.responseJSON.error);
            }
        })
    });

    /* Menü Switcher */
    $(document).on('click', '.menu a, .boxcontainer a', function (e) {
        e.preventDefault();
        $('.menu a').removeClass('current');
        $('.content > div').removeClass('show');
        var nextContent = $(this).attr('href');
        $('.menu a.' + nextContent).addClass('current');
        $('.' + nextContent).addClass('show');
        getLast5Tickets(developerHash);
        getCustomersList(developerHash);
        getOpenTickets(developerHash);
        getInvoices(developerHash);
        if ($( window ).width() < 569 && $('.menu').css('display') == 'block') {
            $('.menu').slideToggle();
        }
        uncheckCheckboxes();
    });

    $(document).on('click', '.fa-bars', function () {
        $('.menu').slideToggle();
    });

    var uncheckCheckboxes = function () {
        $('input[type="checkbox"]').prop("checked", false);
        $('#ticket__check-offen').prop("checked", true);
    };
    var clearInput = function () {
        $('.overlay input, .overlay textarea').val('');
    };
    /*
     Kunden anlegen
     */
    $(document).on('click', '.add-new-customer', function (e) {
        e.preventDefault();
        $('.overlay').toggleClass('show');
        $('.overlay .add-customer').toggleClass('show');
    });

    $(document).on('submit', '.addcustomer__form', function (e) {
        e.preventDefault();
        var cName = $('.addcustomer__name').val();
        var cAdress = $('.addcustomer__adress').val();
        var cZip = $('.addcustomer__zip').val();
        var cCity = $('.addcustomer__city').val();
        var cPerson = $('.addcustomer__contactperson').val();
        var cEmail = $('.addcustomer__email').val();
        var cTel = $('.addcustomer__telefon').val();
        var cRate = $('.addcustomer__rate').val();
        $.ajax({
            url: ajaxURL + 'kunde',
            method: 'POST',
            data: {
                devHash: developerHash,
                name: cName,
                address: cAdress,
                zip: cZip,
                city: cCity,
                person: cPerson,
                email: cEmail,
                tel: cTel,
                rate: cRate
            },
            success: function (data) {
                $('.overlay .add-customer').toggleClass('show');
                $('.overlay .add-customer-success').toggleClass('show').find('span').html(data);
                getCustomersList(developerHash);
                clearInput();
            },
            error: function (err) {
              $('.overlay-error').addClass('show');
              $('.overlay-error span').html(err.responseJSON.error);
              $('.overlay-error button').on('click',function(){
                $('.overlay-error.show').removeClass('show');
              })
            }
        })
    });

    /*
     Kunden auswählen
     */
    $(document).on('click', '.customer__name', function (e) {
        e.preventDefault();
        $('.content > .show').removeClass('show');
        $('.content .customer-detail').addClass('show');
        cID = $(this).parent().attr('data-cid');
        $.ajax({
            url: ajaxURL + 'kunde/' + developerHash + '/' + cID,
            method: 'GET',
            success: function (data) {
                $('.customer-detail__name').html(data.name);
                $('.customer-detail__address').html(data.address);
                $('.customer-detail__zip').html(data.zip + ' ' + data.city);
                $('.customer-detail__person').html(data.person);
                $('.customer-detail__email').html(data.email);
                $('.customer-detail__telefon').html(data.tel);
                $('.customer-detail__rate').html(data.rate + '€');
                $('.customer-detail__hash').html(data.hash);
                $('.customer-detail .add-new-ticket').attr('data-cid', cID);
                console.log(data);

                getOpenTicketsFromCustomer(developerHash, cID);
                getInvoices(developerHash, cID);
            }
        })
    });

    $(document).on('click', '.customer-detail .add-new-ticket', function (e) {
        e.preventDefault();
        $('.overlay').toggleClass('show');
        $('.overlay .add-ticket').toggleClass('show');
    });

    /*
     Ticket hinzufügen
     */
    $(document).on('submit', '.addticket__form', function (e) {
        e.preventDefault();
        var tName = $('.addticket__name').val();
        var tDesc = $('.addticket__description').val();
        var tOffered = $('.addticket__offered').val();
        $.ajax({
            url: ajaxURL + 'ticket',
            method: 'POST',
            data: {
                devHash: developerHash,
                cusHash: cID,
                name: tName,
                description: tDesc,
                offered: tOffered
            },
            success: function (data) {
                $('.overlay .add-ticket').toggleClass('show');
                $('.overlay .add-ticket-success').toggleClass('show');
                $('.overlay .add-ticket-success span').html(data);
                getOpenTicketsFromCustomer(developerHash, cID);
                clearInput();
            }
        });
    });

    var getCustomersList = function (devHash) {
        $.ajax({
            url: ajaxURL + 'kundenliste/' + devHash,
            method: 'GET',
            success: function (data) {
                $('.customer__list').empty();
                for (var i in data) {
                    var cLI = $('<li>').addClass('customer__item')
                        .attr({
                            'data-cid': i
                        })
                        .appendTo('.customer__list');
                    $('<div>').addClass('customer__name').html(data[i].name).appendTo(cLI);
                    $('<div>').addClass('customer__contactperson').html(data[i].person).appendTo(cLI);
                    $('<div>').addClass('customer__email').html(data[i].email).appendTo(cLI);
                    if (data[i].tickets == 0) {
                        $('<div>').addClass('customer__ticketinfo abgeschlossen').html(data[i].tickets + ' Tickets').appendTo(cLI);
                    } else if (data[i].tickets < 10) {
                        $('<div>').addClass('customer__ticketinfo bearbeitung').html(data[i].tickets + ' Tickets').appendTo(cLI);
                    } else {
                        $('<div>').addClass('customer__ticketinfo offen').html(data[i].tickets + ' Tickets').appendTo(cLI);
                    }
                }
            },
            error: function (err) {
                //  alert(err.responseJSON.error);
            }
        })
    };

    /*
     Offene Tickets von Kunden
     */
    var getOpenTicketsFromCustomer = function (devHash, cusHash) {
        $.ajax({
                url: ajaxURL + 'ticket/' + devHash,
                method: 'GET',
                success: function (data) {
                    $('.ticket__list.open,.ticket__list.closed').empty();
                    for (var i in data) {
                        var iDate = new Date(data[i].date);
                        var customer = data[i].customer;
                        var offered = data[i].offered;
                        var processPercent = Math.round(data[i].fulltime * 100 / offered);
                        if (data[i].cusHash == cID && data[i].status != 'abgeschlossen' && data[i].status != 'storniert' && data[i].status != "verrechnet") {
                            var otLI = $('<li>').addClass('ticket__item').appendTo('.ticket__list.open');
                            var otOverview = $('<div>').addClass('ticket__overview')
                                .on('click', function () {
                                    $(this).next().slideToggle();
                                }).appendTo(otLI);
                            $('<div>').addClass('ticket__id').html('#' + data[i].id).appendTo(otOverview);
                            $('<div>').addClass('ticket__title').html(data[i].name).appendTo(otOverview);
                            if (offered > 0) {
                                var processOuter = $('<div>').addClass('ticket__process').html('<span>' + processPercent + '%</span>').appendTo(otOverview);
                                if (processPercent > 100) {
                                    $('<div>').addClass('ticket__processbar').css({
                                        'width': '100%',
                                        'background': '#D0011B'
                                    }).appendTo(processOuter);
                                } else {
                                    $('<div>').addClass('ticket__processbar').css({
                                        'width': processPercent + '%',
                                        'background': '#00794C'
                                    }).appendTo(processOuter);
                                }
                                $('<div>').addClass('ticket__processcount').html(data[i].fulltime + ' / <span>' + offered + '</span>').appendTo(otOverview);
                            } else {
                                $('<div>').addClass('ticket__notime').html('Es wurde keine Zeit angeboten').appendTo(otOverview);
                                otLI.addClass('notime');
                            }
                            $('<div>').addClass('ticket__customer').html(iDate.getDate() + '.' + (iDate.getMonth() + 1) + '.' + iDate.getFullYear()).appendTo(otOverview);
                            $('<div>').addClass('ticket__status ' + data[i].status).html(data[i].status).appendTo(otOverview);
                            if (data[i].status != 'storniert') {
                                var otExpander = $('<div>').addClass('ticket__expander').appendTo(otLI);
                                $('<div>').addClass('ticket__date').html('<strong>Datum:</strong> ' + iDate.getDate() + '.' + (iDate.getMonth() + 1) + '.' + iDate.getFullYear()).appendTo(otExpander);
                                if (data[i].description != '') {
                                    $('<div>').addClass('ticket__description').html('<strong>Beschreibung:</strong> ' + data[i].description).appendTo(otExpander);
                                }
                                if (offered > 0) {
                                    $('<strong>Angebotene Arbeitszeit:</strong> <span class="offered-time">' + offered + ' Stunden</span><br>').appendTo(otExpander);
                                }
                                if (data[i].fulltime > 0 && data[i].fulltime != 'undefined') {
                                    $('<strong>Arbeitszeit:</strong> <span class="worked-time">' + data[i].fulltime + ' Stunden</span><br>').appendTo(otExpander);
                                }
                                if (data[i].notes.length > 0) {
                                    $('<strong>Kommentare:</strong><br>').appendTo(otExpander);
                                    var otUL = $('<ul>').addClass('ticket__note-list').appendTo(otExpander);
                                    for (var j in data[i].notes) {
                                        $('<li>').html(data[i].notes[j].note + ' - ' + data[i].notes[j].time + ' Stunden').appendTo(otUL);
                                    }
                                }
                                if (data[i].status != 'abgeschlossen' && data[i].status != 'storniert' && data[i].status != 'verrechnet') {
                                    $('<button>').addClass('btn btn-green').attr({
                                        'data-ticket': data[i].id,
                                        'data-customer': data[i].cusHash
                                    }).html('Zeit buchen')
                                        .on('click', function (e) {
                                            e.preventDefault();
                                            var ticketID = $(this).attr('data-ticket');
                                            var tCusHash = $(this).attr('data-customer');
                                            var ticket = $(this).parent().parent();
                                            $('.overlay').toggleClass('show');
                                            $('.overlay .edit-ticket').toggleClass('show');
                                            $('.editticket__form').attr({
                                                'data-ticket': ticketID,
                                                'data-customer': tCusHash
                                            });
                                            $('.editticket__form h3').html('#' + ticketID + ' - ' + ticket.find('.ticket__title').html());
                                            $('.editticket__status').val(ticket.find('.ticket__status').html());
                                            $('.editticket__offered').val(ticket.find('.ticket__processcount span').html());
                                        }).appendTo(otExpander);
                                    $('<button>').addClass('btn btn-red').attr({
                                        'data-ticket': data[i].id,
                                        'data-customer': data[i].cusHash,
                                        'data-name': data[i].name
                                    }).html('Ticket stornieren')
                                        .on('click', function (e) {
                                            e.preventDefault();
                                            var ticketID = $(this).attr('data-ticket');
                                            var tCusHash = $(this).attr('data-customer');
                                            var ticketName = $(this).attr('data-name');
                                            $('.overlay, .overlay .delete-ticket').addClass('show');
                                            $('.delete-ticket .id').html(ticketID);
                                            $('.delete-ticket .name').html(ticketName);
                                            $('.delete-ticket .delete-overlay').attr({'data-customer': tCusHash});
                                        }).appendTo(otExpander);
                                }
                            }
                        } else if (data[i].cusHash == cID && data[i].status == 'abgeschlossen') {
                            var otLI = $('<li>').addClass('ticket__item').appendTo('.ticket__list.closed');
                            var otOverview = $('<div>').addClass('ticket__overview')
                                .on('click', function () {
                                    $(this).next().slideToggle();
                                }).appendTo(otLI);
                            $('<div>').addClass('ticket__id').html('#' + data[i].id).appendTo(otOverview);
                            $('<div>').addClass('ticket__title').html(data[i].name).appendTo(otOverview);
                            if (offered > 0) {
                                var processOuter = $('<div>').addClass('ticket__process').html('<span>' + processPercent + '%</span>').appendTo(otOverview);
                                if (processPercent > 100) {
                                    $('<div>').addClass('ticket__processbar').css({
                                        'width': '100%',
                                        'background': '#D0011B'
                                    }).appendTo(processOuter);
                                } else {
                                    $('<div>').addClass('ticket__processbar').css({
                                        'width': processPercent + '%',
                                        'background': '#00794C'
                                    }).appendTo(processOuter);
                                }
                                $('<div>').addClass('ticket__processcount').html(data[i].fulltime + ' / <span>' + offered + '</span>').appendTo(otOverview);
                            } else {
                                $('<div>').addClass('ticket__notime').html('Es wurde keine Zeit angeboten').appendTo(otOverview);
                                otLI.addClass('notime');
                            }
                            $('<div>').addClass('ticket__customer').html(data[i].customer).appendTo(otOverview);
                            $('<div>').addClass('ticket__status ' + data[i].status).html(data[i].status).appendTo(otOverview);

                            if (data[i].status != 'storniert') {
                                var otExpander = $('<div>').addClass('ticket__expander').appendTo(otLI);
                                $('<div>').addClass('ticket__description').html('<strong>Beschreibung:</strong> ' + data[i].description).appendTo(otExpander);
                                $('<strong>Angebotene Arbeitszeit:</strong> <span class="offered-time">' + offered + ' Stunden</span><br>').appendTo(otExpander);
                                if (data[i].fulltime < 0 && data[i].fulltime != 'undefined') {
                                    $('<strong>Arbeitszeit:</strong> <span class="worked-time">' + data[i].fulltime + '</span><br>').appendTo(otExpander);
                                }
                                if (data[i].notes.length > 0) {
                                    $('<strong>Kommentare:</strong><br>').appendTo(otExpander);
                                    var otUL = $('<ul>').addClass('ticket__note-list').appendTo(otExpander);
                                    for (var j in data[i].notes) {
                                        $('<li>').html(data[i].notes[j].note + ' - ' + data[i].notes[j].time + ' Stunden').appendTo(otUL);
                                    }
                                }
                            }
                        }
                    }
                    if ($('.ticket__list.closed > li').length == 0) {
                        $('#closed-tickets').hide();
                    } else {
                        $('#closed-tickets').show();
                    }
                }
            }
        )
    };
    var getLast5Tickets = function (devHash) {
        $.ajax({
            url: ajaxURL + 'ticket/' + devHash,
            method: 'GET',
            success: function (data) {
                data = data.slice(-5);
                $('.ticket__list.last-5').empty();
                for (var i in data) {
                    var iDate = new Date(data[i].date);
                    var customer = data[i].customer;
                    var offered = data[i].offered;
                    var processPercent = Math.round(data[i].fulltime * 100 / offered);
                    var otLI = $('<li>').addClass('ticket__item').appendTo('.ticket__list.last-5');
                    var otOverview = $('<div>').addClass('ticket__overview')
                        .on('click', function () {
                            $(this).next().slideToggle();
                        }).appendTo(otLI);
                    $('<div>').addClass('ticket__id').html('#' + data[i].id).appendTo(otOverview);
                    $('<div>').addClass('ticket__title').html(data[i].name).appendTo(otOverview);
                    if (offered > 0) {
                        var processOuter = $('<div>').addClass('ticket__process').html('<span>' + processPercent + '%</span>').appendTo(otOverview);
                        if (processPercent > 100) {
                            $('<div>').addClass('ticket__processbar').css({
                                'width': '100%',
                                'background': '#D0011B'
                            }).appendTo(processOuter);
                        } else {
                            $('<div>').addClass('ticket__processbar').css({
                                'width': processPercent + '%',
                                'background': '#00794C'
                            }).appendTo(processOuter);
                        }
                        $('<div>').addClass('ticket__processcount').html(data[i].fulltime + ' / <span>' + offered + '</span>').appendTo(otOverview);
                    } else {
                        $('<div>').addClass('ticket__notime').html('Es wurde keine Zeit angeboten').appendTo(otOverview);
                        otLI.addClass('notime');
                    }
                    $('<div>').addClass('ticket__customer').html(data[i].customer).appendTo(otOverview);
                    $('<div>').addClass('ticket__status ' + data[i].status).html(data[i].status).appendTo(otOverview);
                    if (data[i].status != 'storniert') {
                        var otExpander = $('<div>').addClass('ticket__expander').appendTo(otLI);
                        $('<div>').addClass('ticket__customer-expand').html('<strong>Kunde:</strong> ' + data[i].customer).appendTo(otExpander);
                        $('<div>').addClass('ticket__date').html('<strong>Datum:</strong> ' + iDate.getDate() + '.' + (iDate.getMonth() + 1) + '.' + iDate.getFullYear()).appendTo(otExpander);
                        if (data[i].description != '') {
                            $('<div>').addClass('ticket__description').html('<strong>Beschreibung:</strong> ' + data[i].description).appendTo(otExpander);
                        }
                        if (offered > 0) {
                            $('<strong>Angebotene Arbeitszeit:</strong> <span class="offered-time">' + offered + ' Stunden</span><br>').appendTo(otExpander);
                        }
                        if (data[i].fulltime > 0 && data[i].fulltime != 'undefined') {
                            $('<strong>Arbeitszeit:</strong> <span class="worked-time">' + data[i].fulltime + ' Stunden</span><br>').appendTo(otExpander);
                        }
                        if (data[i].notes.length > 0) {
                            $('<strong>Kommentare:</strong><br>').appendTo(otExpander);
                            var otUL = $('<ul>').addClass('ticket__note-list').appendTo(otExpander);
                            for (var j in data[i].notes) {
                                $('<li>').html(data[i].notes[j].note + ' - ' + data[i].notes[j].time + ' Stunden').appendTo(otUL);
                            }
                        }
                        if (data[i].status != 'abgeschlossen' && data[i].status != 'verrechnet') {
                            $('<button>').addClass('btn btn-green').attr({
                                'data-ticket': data[i].id,
                                'data-customer': data[i].cusHash
                            }).html('Zeit buchen')
                                .on('click', function (e) {
                                    e.preventDefault();
                                    var ticketID = $(this).attr('data-ticket');
                                    var tCusHash = $(this).attr('data-customer');
                                    var ticket = $(this).parent().parent();
                                    $('.overlay').toggleClass('show');
                                    $('.overlay .edit-ticket').toggleClass('show');
                                    $('.editticket__form').attr({
                                        'data-ticket': ticketID,
                                        'data-customer': tCusHash
                                    });
                                    $('.editticket__form h3').html('#' + ticketID + ' - ' + ticket.find('.ticket__title').html());
                                    $('.editticket__status').val(ticket.find('.ticket__status').html());
                                    $('.editticket__offered').val(ticket.find('.ticket__processcount span').html());
                                }).appendTo(otExpander);
                            $('<button>').addClass('btn btn-red').attr({
                                'data-ticket': data[i].id,
                                'data-customer': data[i].cusHash,
                                'data-name': data[i].name
                            }).html('Ticket stornieren')
                                .on('click', function (e) {
                                    e.preventDefault();
                                    var ticketID = $(this).attr('data-ticket');
                                    var tCusHash = $(this).attr('data-customer');
                                    var ticketName = $(this).attr('data-name');
                                    $('.overlay, .overlay .delete-ticket').addClass('show');
                                    $('.delete-ticket .id').html(ticketID);
                                    $('.delete-ticket .name').html(ticketName);
                                    $('.delete-ticket .delete-overlay').attr({'data-customer': tCusHash});
                                }).appendTo(otExpander);
                        }
                    }
                }
            }
        })
    };

    var getOpenTickets = function (devHash) {
        $.ajax({
            url: ajaxURL + 'ticket/' + devHash,
            method: 'GET',
            success: function (data) {
                $('.tickets .ticket__list').empty();
                for (var i in data) {
                    var iDate = new Date(data[i].date);
                    var customer = data[i].customer;
                    var offered = data[i].offered;
                    var processPercent = Math.round(data[i].fulltime * 100 / offered);
                    var otLI = $('<li>').addClass('ticket__item').attr({'data-status': data[i].status}).appendTo('.tickets .ticket__list');
                    var otOverview = $('<div>').addClass('ticket__overview')
                        .on('click', function () {
                            $(this).next().slideToggle();
                        }).appendTo(otLI);
                    $('<div>').addClass('ticket__id').html('#' + data[i].id).appendTo(otOverview);
                    $('<div>').addClass('ticket__title').html(data[i].name).appendTo(otOverview);
                    if (offered > 0) {
                        var processOuter = $('<div>').addClass('ticket__process').html('<span>' + processPercent + '%</span>').appendTo(otOverview);
                        if (processPercent > 100) {
                            $('<div>').addClass('ticket__processbar').css({
                                'width': '100%',
                                'background': '#D0011B'
                            }).appendTo(processOuter);
                        } else {
                            $('<div>').addClass('ticket__processbar').css({
                                'width': processPercent + '%',
                                'background': '#00794C'
                            }).appendTo(processOuter);
                        }
                        $('<div>').addClass('ticket__processcount').html(data[i].fulltime + ' / <span>' + offered + '</span>').appendTo(otOverview);
                    } else {
                        $('<div>').addClass('ticket__notime').html('Es wurde keine Zeit angeboten').appendTo(otOverview);
                        otLI.addClass('notime');
                    }
                    $('<div>').addClass('ticket__customer').html(data[i].customer).appendTo(otOverview);
                    $('<div>').addClass('ticket__status ' + data[i].status).html(data[i].status).appendTo(otOverview);

                    if (data[i].status != 'storniert') {
                        var otExpander = $('<div>').addClass('ticket__expander').appendTo(otLI);
                        $('<div>').addClass('ticket__date').html('<strong>Datum:</strong> ' + iDate.getDate() + '.' + (iDate.getMonth() + 1) + '.' + iDate.getFullYear()).appendTo(otExpander);
                        if (data[i].description != '') {
                            $('<div>').addClass('ticket__description').html('<strong>Beschreibung:</strong> ' + data[i].description).appendTo(otExpander);
                        }
                        if (offered > 0) {
                            $('<strong>Angebotene Arbeitszeit:</strong> <span class="offered-time">' + offered + ' Stunden</span><br>').appendTo(otExpander);
                        }
                        if (data[i].fulltime > 0 && data[i].fulltime != 'undefined') {
                            $('<strong>Arbeitszeit:</strong> <span class="worked-time">' + data[i].fulltime + ' Stunden</span><br>').appendTo(otExpander);
                        }
                        if (data[i].notes.length > 0) {
                            $('<strong>Kommentare:</strong><br>').appendTo(otExpander);
                            var otUL = $('<ul>').addClass('ticket__note-list').appendTo(otExpander);
                            for (var j in data[i].notes) {
                                $('<li>').html(data[i].notes[j].note + ' - ' + data[i].notes[j].time + ' Stunden').appendTo(otUL);
                            }
                        }
                        if (data[i].status != 'abgeschlossen' && data[i].status != 'storniert' && data[i].status != 'verrechnet') {
                            $('<button>').addClass('btn btn-green').attr({
                                'data-ticket': data[i].id,
                                'data-customer': data[i].cusHash
                            }).html('Zeit buchen')
                                .on('click', function (e) {
                                    e.preventDefault();
                                    var ticketID = $(this).attr('data-ticket');
                                    var tCusHash = $(this).attr('data-customer');
                                    var ticket = $(this).parent().parent();
                                    $('.overlay').toggleClass('show');
                                    $('.overlay .edit-ticket').toggleClass('show');
                                    $('.editticket__form').attr({
                                        'data-ticket': ticketID,
                                        'data-customer': tCusHash
                                    });
                                    $('.editticket__form h3').html('#' + ticketID + ' - ' + ticket.find('.ticket__title').html());
                                    $('.editticket__status').val(ticket.find('.ticket__status').html());
                                    $('.editticket__offered').val(ticket.find('.ticket__processcount span').html());
                                }).appendTo(otExpander);
                            $('<button>').addClass('btn btn-red').attr({
                                'data-ticket': data[i].id,
                                'data-customer': data[i].cusHash,
                                'data-name': data[i].name
                            }).html('Ticket stornieren')
                                .on('click', function (e) {
                                    e.preventDefault();
                                    var ticketID = $(this).attr('data-ticket');
                                    var tCusHash = $(this).attr('data-customer');
                                    var ticketName = $(this).attr('data-name');
                                    $('.overlay, .overlay .delete-ticket').addClass('show');
                                    $('.delete-ticket .id').html(ticketID);
                                    $('.delete-ticket .name').html(ticketName);
                                    $('.delete-ticket .delete-overlay').attr({'data-customer': tCusHash});
                                }).appendTo(otExpander);
                        }
                    }
                }
            }
        });
    };

    $(document).on('submit', '.editticket__form', function (e) {
        e.preventDefault();
        $.ajax({
            url: ajaxURL + 'ticket/' + $(this).attr('data-customer') + '/' + $(this).attr('data-ticket'),
            method: 'PUT',
            data: {
                offered: $(this).find('.editticket__offered').val(),
                status: $(this).find('.editticket__status').val(),
                time: $(this).find('.editticket__workedtime').val(),
                note: $(this).find('.editticket__note').val()
            },
            success: function (data) {
                $('.overlay, .overlay .edit-ticket').removeClass('show');
                getOpenTicketsFromCustomer(developerHash, cID);
                getLast5Tickets(developerHash);
                getOpenTickets(developerHash);
                clearInput();
            }
        })
    });

    var deleteTicket = function (cusHash, id) {
        $.ajax({
            url: ajaxURL + 'ticket/' + cusHash + '/' + id,
            method: 'DELETE',
            success: function (data) {
                getOpenTicketsFromCustomer(developerHash, cID);
                getLast5Tickets(developerHash);
                getOpenTickets(developerHash);
            }
        })
    };

    var createInvoice = function (data) {
        var dev = data.developer;
        var cus = data.customer;
        var mwst = data.total / 100 * 20;
        var totalMwst = data.total + mwst;
        var iDate = new Date(data.date);
        var y = 540;
        var c = document.getElementById("invoice");
        var ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle="#FFFFFF";
        ctx.fillRect(0 , 0 , c.width, c.height);
        //Header
        ctx.textAlign = "left";
        ctx.font = "bold 36px Open Sans";
        ctx.fillStyle = "#00794C";
        ctx.fillText(dev.name, 50, 125);
        ctx.font = "14px Open Sans";
        ctx.fillStyle = "#000000";
        // Kontaktdaten
        ctx.fillText(dev.name, 525, 70);
        ctx.fillText(dev.adresse, 525, 90);
        ctx.fillText(dev.plz + ' ' + dev.ort, 525, 110);
        ctx.fillText(dev.telefon, 525, 130);
        ctx.fillText(dev.email, 525, 150);
        ctx.fillText(dev.www, 525, 170);
        // Kundendaten
        ctx.font = "10px Open Sans";
        ctx.fillText(dev.name + " - " + dev.adresse + " - " + dev.plz + ' ' + dev.ort, 50, 200);
        ctx.font = "14px Open Sans";
        ctx.fillText(cus.name, 50, 220);
        ctx.fillText(cus.person, 50, 240);
        ctx.fillText(cus.address, 50, 260);
        ctx.fillText(cus.zip + ' ' + cus.city, 50, 280);
        // Rechnungsdaten
        ctx.font = "bold 30px Open Sans";
        ctx.fillText("Rechnung Nr. " + data.nr, 50, 380);
        ctx.font = "14px Open Sans";
        ctx.fillText("Kunden Nr.: " + ('0100'.substr(String(cus.id).length) + cus.id), 50, 430);
        ctx.textAlign = "right";
        ctx.fillText("Rechnungsdatum: " + iDate.getDate() + '.' + (iDate.getMonth() + 1) + '.' + iDate.getFullYear(), 753, 430);
        ctx.textAlign = "left";
        ctx.font = "bold 14px Open Sans";
        ctx.fillText("Leistung", 55, 505);
        ctx.fillText("Einzelpreis", 450, 505);
        ctx.fillText("Anzahl", 570, 505);
        ctx.fillText("Gesamtpreis", 645, 505);
        ctx.moveTo(50, 515);
        ctx.lineTo(753, 515);
        ctx.font = "14px Open Sans";
        ctx.fillText("Web Dienstleistung", 55, y);
        ctx.fillText(parseFloat(cus.rate).toFixed(2) + "€", 450, y);
        ctx.fillText(parseFloat(data.hours).toFixed(2), 570, y);
        ctx.fillText(parseFloat(cus.rate * data.hours).toFixed(2) + '€', 645, y);
        //y + 15
        for (var i in data.tickets) {
            y += 20;
            ctx.fillText('#' + ('0000'.substr(String(data.tickets[i].id).length) + data.tickets[i].id), 65, y);
            ctx.fillText('- ' + data.tickets[i].name, 110, y);
            ctx.fillText('- ' + parseFloat(data.tickets[i].fulltime).toFixed(2), 340, y);
        }
        ctx.moveTo(50, 900);
        ctx.lineTo(753, 900);
        ctx.fillText("Mehrwertsteuer in Höhe von 20%:", 400, 920);
        ctx.fillText(parseFloat(mwst).toFixed(2) + "€", 645, 920);
        ctx.moveTo(50, 940);
        ctx.lineTo(753, 940);
        ctx.fillText("Gesamtpreis:", 538, 960);
        ctx.fillText(parseFloat(totalMwst).toFixed(2) + '€', 645, 960);
        ctx.font = "bold 12px Open Sans";
        ctx.fillText("Bankverbindung", 50, 1085);
        ctx.font = "12px Open Sans";
        ctx.fillText(dev.bank, 50, 1100);
        ctx.fillText(dev.iban, 50, 1115);
        ctx.fillText(dev.bic, 50, 1130);
        ctx.textAlign = "right";
        ctx.fillText(dev.name, 753, 1100);
        ctx.fillText("UID: " + dev.uid, 753, 1115);
        ctx.fillText("Firmenbuchnummer: " + dev.firmenbuch, 753, 1130);
        ctx.stroke();
        invoiceImageURL = c.toDataURL();
        invoiceNr = data.nr;
        $('.content > div').removeClass('show');
        $('.content .invoices-detail').addClass('show');
    };
    
    $(document).on('click', '.create-invoice', function (e) {
        e.preventDefault();
        $.ajax({
            url: ajaxURL + 'rechnung/' + developerHash + '/' + cID,
            method: 'GET',
            success: function (data) {
                createInvoice(data);
            }
        });
    });

    $(document).on('click', '.save-pdf', function () {
        var doc = new jsPDF();
        doc.addImage(invoiceImageURL, 'JPEG', 0, 0, 210, 297);
        doc.save('Rechnung_' + invoiceNr + '.pdf')
    });

    $(document).on('click', '#ticket__check-offen', function () {
        $('.ticket__item[data-status="offen"], .ticket__item[data-status="in Bearbeitung"]').fadeToggle('normal');
    });
    $(document).on('click', '#ticket__check-abgeschlossen', function () {
        $('.ticket__item[data-status="abgeschlossen"]').fadeToggle('normal');
    });
    $(document).on('click', '#ticket__check-verrechnet', function () {
        $('.ticket__item[data-status="verrechnet"]').fadeToggle('normal');
    });
    $(document).on('click', '#ticket__check-storniert', function () {
        $('.ticket__item[data-status="storniert"]').fadeToggle('normal');
    });

    var getInvoices = function () {
        var devHash = arguments[0];
        if (arguments.length > 1) {
            var cusHash = arguments[1];
            $.ajax({
                url: ajaxURL + 'rechnungen/' + devHash + '/' + cusHash,
                method: 'GET',
                success: function (data) {
                    $('.invoice__list').empty();
                    for (var i in data) {
                        var iDate = new Date(data[i].date);
                        var iLI = $('<li>').addClass('invoice__item payed-'+data[i].ispayed).attr({
                            'data-invoice': data[i].nr,
                            'data-customer': cusHash
                        }).appendTo('.invoice__list');
                        $('<div>').addClass('invoice__id').html('Rechnung Nr.' + data[i].nr).appendTo(iLI);
                        $('<div>').addClass('invoice__total').html(parseFloat(data[i].total + (data[i].total / 100 * 20)).toFixed(2) + '€').appendTo(iLI);
                        $('<div>').addClass('invoice__date').html('Rechnungsdatum: ' + iDate.getDate() + '.' + (iDate.getMonth() + 1) + '.' + iDate.getFullYear()).appendTo(iLI);
                        $('<div>').addClass('invoice__customer').html(data[i].customer.name).appendTo(iLI);
                        if (data[i].ispayed == 0) {
                            $('<div>').addClass('invoice__ispayed offen').html('offen').appendTo(iLI);
                            $('<div>').addClass('invoice__payed').html('<i class="fa fa-check abgeschlossen"></i>').appendTo(iLI);
                        } else {
                            $('<div>').addClass('invoice__ispayed abgeschlossen').html('bezahlt').appendTo(iLI);
                        }
                    }
                    if ($('#invoice-list .invoice__list > li').length == 0) {
                        $('#invoice-list').hide();
                    } else {
                        $('#invoice-list').show();
                    }
                }
            })
        } else {
            $.ajax({
                url: ajaxURL + 'rechnungen/' + devHash,
                method: 'GET',
                success: function (data) {
                    $('.invoice__list').empty();
                    for (var i in data) {
                        var iDate = new Date(data[i].date);
                        var iLI = $('<li>').addClass('invoice__item payed-'+data[i].ispayed).attr({'data-invoice': data[i].nr}).appendTo('.invoice__list');
                        $('<div>').addClass('invoice__id').html('Rechnung Nr.' + data[i].nr).appendTo(iLI);
                        $('<div>').addClass('invoice__total').html(parseFloat(data[i].total + (data[i].total / 100 * 20)).toFixed(2) + '€').appendTo(iLI);
                        $('<div>').addClass('invoice__date').html('Rechnungsdatum: ' + iDate.getDate() + '.' + (iDate.getMonth() + 1) + '.' + iDate.getFullYear()).appendTo(iLI);
                        $('<div>').addClass('invoice__customer').html(data[i].customer.name).appendTo(iLI);
                        if (data[i].ispayed == 0) {
                            $('<div>').addClass('invoice__ispayed offen').html('offen').appendTo(iLI);
                            $('<div>').addClass('invoice__payed').html('<i class="fa fa-check abgeschlossen"></i>').appendTo(iLI);
                        } else {
                            $('<div>').addClass('invoice__ispayed abgeschlossen').html('bezahlt').appendTo(iLI);
                        }
                    }
                }
            })
        }
    };

    $(document).on('click', '.fa-check', function (e) {
        e.preventDefault();
        var id = $(this).parent().parent().attr('data-invoice') * 1 - 1;
        var cusHash = $(this).parent().parent().attr('data-customer');

        $.ajax({
            url: ajaxURL + 'rechnung/' + developerHash + '/' + id,
            method: 'PUT',
            success: function (data) {
                if (cusHash != '' && cusHash != undefined) {
                    getInvoices(developerHash, cusHash);
                } else {
                    getInvoices(developerHash);
                }
            }
        })
    });

    $(document).on('click', '.invoice__item .invoice__id', function (e) {
        e.preventDefault();
        var id = $(this).parent().attr('data-invoice') * 1 - 1;
        $.ajax({
            url: ajaxURL + 'rechnung-detail/' + developerHash + '/' + id,
            method: 'GET',
            success: function (data) {
                createInvoice(data);
            }
        })
    });

    $(document).on('click', '.delete-ticket .delete-overlay', function (e) {
        e.preventDefault();
        var tCusHash = $(this).attr('data-customer');
        var ticketID = $('.delete-ticket .id').html();
        deleteTicket(tCusHash, ticketID);
        $('.overlay.show, .overlay .show').removeClass('show');
    });

    $(document).on('click', '.fa-times', function (e) {
        e.preventDefault();
        $('.overlay.show, .overlay .show').removeClass('show');
        clearInput();
    });

    getLast5Tickets(developerHash);
    getCustomersList(developerHash);
    getOpenTickets(developerHash);
    console.log(developerHash);
})
;

var getFilename = function () {
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/') + 1).replace('.html', '');
    $('body').attr('id', filename + '-page');
};
