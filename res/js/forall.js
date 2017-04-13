$(document).ready(function(){
  
  getFilename();

  $('.ticket__overview').on('click', function(){
    $(this).next().slideToggle();
  });

});

var getFilename = function(){
  var url = window.location.pathname;
  var filename = url.substring(url.lastIndexOf('/')+1).replace('.html','');
  $('body').attr('id',filename+'-page');
};
