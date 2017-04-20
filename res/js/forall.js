$(document).ready(function(){

  getFilename();
  var developerHash = '';
  var ajaxURL = 'http://127.0.0.1:12345/';

  if(localStorage.getItem('hash')) {
    developerHash = localStorage.getItem('hash');
  }

  if((localStorage.getItem('hash') && $('#login-page').length > 0) || (localStorage.getItem('hash') && $('#register-page').length > 0)){
    window.location = "app.html";
  }

  $('.ticket__overview').on('click', function(){
    $(this).next().slideToggle();
  });

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
      },
      error: function(err){
        alert(err.responseJSON.error);
      }
    })
  });
  $(document).on('click', '.box-customer', function(e) {
    e.preventDefault();
    $.ajax({
      url: ajaxURL+'kunde',
      method: 'POST',
      data: {devHash:developerHash, email:"max@mustermann.at", firma:"Muster", adresse:"musterstraße", plz:"1234", ort:"wien"},
      success: function(data){
        console.log(data);
      },
      error: function(err){
      //  alert(err.responseJSON.error);
      }
    })
  })
});

var getFilename = function(){
  var url = window.location.pathname;
  var filename = url.substring(url.lastIndexOf('/')+1).replace('.html','');
  $('body').attr('id',filename+'-page');
};
