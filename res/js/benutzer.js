$(document).ready(function () {

    getFilename();

    var ajaxURL = 'http://127.0.0.1:12345/';
    var cID = '';

    if (localStorage.getItem('hash')) {
        cID = localStorage.getItem('hash');
        $('.hash').html(cID);
    }

    if (localStorage.getItem('hash') && $('#login-page').length > 0) {
        window.location = "app.html";
    }

    /*
     Login
     */
    $(document).on('submit', '.login__form', function (e) {
        e.preventDefault();
        var hash = $('#hash').val();
        $.ajax({
            url: ajaxURL + 'userlogin/' + hash,
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

    $(document).on('click', '.add-new-ticket', function (e) {
        e.preventDefault();
        $('.overlay').toggleClass('show');
        $('.overlay .add-ticket').toggleClass('show');
    });

    $(document).on('click', '.fa-times', function (e) {
        e.preventDefault();
        $('.overlay.show, .overlay .show').removeClass('show');
        clearInput();
    });
    var clearInput = function () {
        $('.overlay input, .overlay textarea').val('');
    };
    /*
     Ticket hinzufügen
     */
    $(document).on('submit', '.addticket__form', function (e) {
        e.preventDefault();
        var tName = $('.addticket__name').val();
        var tDesc = $('.addticket__description').val();
        console.log(cID, tName, tDesc);
        $.ajax({
            url: ajaxURL + 'userticket/' + cID,
            method: 'POST',
            data: {
                cusHash: cID,
                name: tName,
                description: tDesc
            },
            success: function (data) {
                console.log(data);
                $('.overlay .add-ticket').toggleClass('show');
                $('.overlay .add-ticket-success').toggleClass('show');
                $('.overlay .add-ticket-success span').html(data);
                getOpenTicketsFromCustomer(cID);
                clearInput();
            }
        });
    });

    var getOpenTicketsFromCustomer = function (cusHash) {
        $.ajax({
            url: ajaxURL + 'userticket/' + cusHash,
            method: 'GET',
            success: function (data) {
                console.log(data);
                $('h1 span').html(data.person);
                $('.tickets .ticket__list').empty();
                for (var i in data.tickets) {
                    var iDate = new Date(data.tickets[i].date);
                    var customer = data.tickets[i].customer;
                    var offered = data.tickets[i].offered;
                    var processPercent = Math.round(data.tickets[i].fulltime * 100 / offered);
                    var otLI = $('<li>').addClass('ticket__item').attr({'data-status': data.tickets[i].status}).appendTo('.tickets .ticket__list');
                    var otOverview = $('<div>').addClass('ticket__overview')
                        .on('click', function () {
                            $(this).next().slideToggle();
                        }).appendTo(otLI);
                    $('<div>').addClass('ticket__id').html('#' + data.tickets[i].id).appendTo(otOverview);
                    $('<div>').addClass('ticket__title').html(data.tickets[i].name).appendTo(otOverview);
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
                        $('<div>').addClass('ticket__processcount').html(data.tickets[i].fulltime + ' / <span>' + offered + '</span>').appendTo(otOverview);
                    } else {
                        $('<div>').addClass('ticket__notime').html('Es wurde keine Zeit angeboten').appendTo(otOverview);
                        otLI.addClass('notime');
                    }
                    $('<div>').addClass('ticket__customer').html(iDate.getDate() + '.' + (iDate.getMonth() + 1) + '.' + iDate.getFullYear()).appendTo(otOverview);
                    $('<div>').addClass('ticket__status ' + data.tickets[i].status).html(data.tickets[i].status).appendTo(otOverview);
                    var otExpander = $('<div>').addClass('ticket__expander').appendTo(otLI);
                    $('<div>').addClass('ticket__description').html('<strong>Beschreibung:</strong> ' + data.tickets[i].description).appendTo(otExpander);
                    $('<strong>Angebotene Arbeitszeit:</strong> <span class="offered-time">' + offered + ' Stunden</span><br>').appendTo(otExpander);
                    if (data.tickets[i].fulltime < 0 && data.tickets[i].fulltime != 'undefined') {
                        $('<strong>Arbeitszeit:</strong> <span class="worked-time">' + data.tickets[i].fulltime + '</span><br>').appendTo(otExpander);
                    }
                    if (data.tickets[i].status != 'abgeschlossen' && data.tickets[i].status != 'storniert' && data.tickets[i].status != 'verrechnet') {
                        $('<button>').addClass('btn btn-red').attr({
                            'data-ticket': data.tickets[i].id,
                            'data-customer': data.tickets[i].cusHash,
                            'data-name': data.tickets[i].name
                        }).html('Ticket stornieren')
                            .on('click', function (e) {
                                e.preventDefault();
                                var ticketID = $(this).attr('data-ticket');
                                var tCusHash = $(this).attr('data-customer');
                                var ticketName = $(this).attr('data-name');
                                $('.overlay, .overlay .delete-ticket').addClass('show');
                                $('.delete-ticket .id').html(ticketID);
                                $('.delete-ticket .name').html(ticketName);
                                $('.delete-ticket .delete-overlay').attr({'data-customer':tCusHash});
                            }).appendTo(otExpander);
                    }
                }
            }
        })
    };

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

    $(document).on('click', '.delete-ticket .delete-overlay', function(e){
        e.preventDefault();
        var tCusHash = $(this).attr('data-customer');
        var ticketID = $('.delete-ticket .id').html();
        deleteTicket(tCusHash, ticketID);
        $('.overlay.show, .overlay .show').removeClass('show');
    });

    var deleteTicket = function (cusHash, id) {
        $.ajax({
            url: ajaxURL + 'ticket/stornieren/' + cusHash + '/' + id,
            method: 'DELETE',
            success: function (data) {
                getOpenTicketsFromCustomer(cID);
            }
        })
    };

    getOpenTicketsFromCustomer(cID);
});

var getFilename = function () {
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/') + 1).replace('.html', '');
    $('body').attr('id', filename + '-page');
};
