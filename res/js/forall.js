$(document).ready(function(){

  var developerHash = '';
  var ajaxURL = 'http://127.0.0.1:12345/';
  var cID = '';

  if(localStorage.getItem('hash')) {
    developerHash = localStorage.getItem('hash');
  }

  getFilename();

  if((localStorage.getItem('hash') && $('#login-page').length > 0) || (localStorage.getItem('hash') && $('#register-page').length > 0)){
    window.location = "app.html";
  }

  $('.ticket__overview').on('click', function(){
    $(this).next().slideToggle();
  });


  /*
    Login
  */
  $(document).on('submit', '.login__form', function(e){
    e.preventDefault();
    var hash = $('#hash').val();
    $.ajax({
      url: ajaxURL+'login/'+hash,
      method: 'PUT',
      success: function(data){
        localStorage.setItem('hash',data);
      },
      error: function(err){
        alert(err.responseJSON.error);
      }
    })
  });

  /*
    Entwickler/Firma anlegen
  */
  $(document).on('submit', '.register__form', function(e){
    e.preventDefault();
    var email = $('#email').val();
    var firma = $('#firma').val();
    var adresse = $('#adresse').val();
    var plz = $('#plz').val();
    var ort = $('#ort').val();
    $.ajax({
      url: ajaxURL+'register',
      method: 'POST',
      data: {email:email, firma:firma, adresse:adresse, plz:plz, ort:ort},
      success: function(data){
        localStorage.setItem('hash',data);
        window.location = "app.html";
      },
      error: function(err){
        alert(err.responseJSON.error);
      }
    })
  });

  $(document).on('click', '.add-new-customer', function(e){
    e.preventDefault();
    $('.customer .overlay').toggleClass('show');
    $('.customer .overlay .add-customer').toggleClass('show');
  });

  $(document).on('submit', '.addcustomer__form', function(e){
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
      url: ajaxURL+'kunde',
      method: 'POST',
      data: {
        devHash:developerHash,
        name: cName,
        address: cAdress,
        zip: cZip,
        city: cCity,
        person: cPerson,
        email: cEmail,
        tel: cTel,
        rate: cRate
      },
      success: function(data){
        $('.overlay .add-customer').toggleClass('show');
        $('.overlay .success').toggleClass('show').find('span').html(data);
        getCustomersList(developerHash);
      },
      error: function(err){
      //  alert(err.responseJSON.error);
      }
    })
  })

  $('.hide-overlay').on('click', function(e){
    e.preventDefault();
    $('.overlay').removeClass('show');
    $('.overlay .success').removeClass('show');
  });

  $(document).on('click', '.customer__name', function(e){
    e.preventDefault();
    cID = $(this).parent().attr('data-cid');
    $.ajax({
      url: ajaxURL+'kunde/'+developerHash+'/'+cID,
      method: 'GET',
      success: function(data) {
        $('.customer-detail__name').html(data.name);
        $('.customer-detail__address').html(data.address);
        $('.customer-detail__zip').html(data.zip + ' ' + data.city);
        $('.customer-detail__person').html(data.person);
        $('.customer-detail__email').html(data.email);
        $('.customer-detail__telefon').html(data.tel);
        $('.customer-detail__rate').html(data.rate + '€');
        $('.customer-detail .add-new-ticket').attr('data-cid',cID);

        getOpenTicketsFromCustomer(developerHash, cID);
      }
    })
  })

  $(document).on('click', '.customer-detail .add-new-ticket', function(e) {
    e.preventDefault();
    $('.customer-detail .overlay').toggleClass('show');
    $('.customer-detail .overlay .add-ticket').toggleClass('show');
  });

  $(document).on('submit', '.addticket__form', function(e){
    e.preventDefault();
    var tName = $('.addticket__name').val();
    var tDesc = $('.addticket__description').val();
    var tOffered = $('.addticket__offered').val();
    $.ajax({
      url: ajaxURL+'ticket',
      method: 'POST',
      data: {devHash: developerHash, cusHash:cID, name:tName, description:tDesc, offered:tOffered},
      success: function(data){
        $('.customer-detail .overlay .add-ticket').toggleClass('show');
        $('.customer-detail .overlay .success').toggleClass('show');
        $('.customer-detail .overlay .success span').html(data);
      }
    });
  });

  var getCustomersList = function(devHash){
    console.log(devHash);
    $.ajax({
      url: ajaxURL+'kundenliste/'+devHash,
      method: 'GET',
      success: function(data){
        $('.customer__list').empty();
        for(var i in data){
          var cLI = $('<li>').addClass('customer__item')
          .attr({'data-cid':i})
          .appendTo('.customer__list');
          $('<div>').addClass('customer__name').html(data[i].name).appendTo(cLI);
          $('<div>').addClass('customer__contactperson').html(data[i].person).appendTo(cLI);
          $('<div>').addClass('customer__email').html(data[i].email).appendTo(cLI);
          if(data[i].tickets == 0){
            $('<div>').addClass('customer__ticketinfo abgeschlossen').html(data[i].tickets + ' Tickets').appendTo(cLI);
          } else if( data[i].tickets < 10){
            $('<div>').addClass('customer__ticketinfo bearbeitung').html(data[i].tickets + ' Tickets').appendTo(cLI);
          } else {
            $('<div>').addClass('customer__ticketinfo offen').html(data[i].tickets + ' Tickets').appendTo(cLI);
          }
        }
      },
      error: function(err){
      //  alert(err.responseJSON.error);
      }
    })
  }
  var getOpenTicketsFromCustomer = function(devHash, cusHash){
    $.ajax({
      url: ajaxURL+'tickets/'+devHash+'/'+cusHash,
      method: 'GET',
      success: function(data){
        var ticketCounter = 0;
        for(var i in data){
          if(data[i].cusHash == cID && data[i].status != 'abgeschlossen'){
            ticketCounter++;
            var otLI = $('<li>').addClass('ticket__item').appendTo('.ticket__list.open');
            var otOverview = $('<div>').addClass('ticket__overview').appendTo(otLI);
            $('<div>').addClass('ticket__id').html(ticketCounter).appendTo(otOverview);
            $('<div>').addClass('ticket__title').html(data[i].name).appendTo(otOverview);
            $('<div>').addClass('ticket__description').html(data[i].description).appendTo(otOverview);
            $('<div>').addClass('ticket__customer').html(data[i].cusHash).appendTo(otOverview);
            $('<div>').addClass('ticket__status '+data[i].status).html(data[i].status).appendTo(otOverview);
            var otExpander = $('<div>').addClass('ticket__expander').appendTo(otLI);
            /*
            $('<strong>geschätzte Arbeitszeit:</strong>')
            <div class="ticket__expander">
              <strong>geschätzte Arbeitszeit:</strong> 30 Stunden<br>
              <strong>Arbeitszeit:</strong> 35 Stunden<br>
              <strong>Notiz:</strong> Notizen für das Ticket, um zu verstehen was passiert ist oder auch nicht, das wissen nur die Entwickler...<br>
              <br>
              <button class="btn btn-green">abschließen</button>
              <button class="btn btn-orange">bearbeiten</button>
              <button class="btn btn-red">stornieren</button>
            </div>*/
          } else if (data[i].cusHash == cID && data[i].status == 'abgeschlossen') {

          }
        }
      }
    })
  };
  getCustomersList(developerHash);
});

var getFilename = function(){
  var url = window.location.pathname;
  var filename = url.substring(url.lastIndexOf('/')+1).replace('.html','');
  $('body').attr('id',filename+'-page');
};
