conditionizr.add('ios', [], function () {
  return /iP(ad|hone|od)/i.test(navigator.userAgent);
});

conditionizr.load('resources/js/ios.js', ['ios']);

$(document).ready(function() {

  $('html').addClass('onLoad');

  $("#slider").owlCarousel({
    navigation : false, // Show next and prev buttons
      slideSpeed : 300,
      paginationSpeed : 400,
      singleItem: true,
      stopOnHover: true,
      autoPlay: 2500
  });


  var $container = $('#j-product-container');

  $container.isotope({
    getSortData :{
      price: function($elem){
        return parseFloat($elem.find(".merchitem__price").attr('data-price'));
      }
    }
  });

  $('#merch-filters a').click(function(){

    $optionSet = $(this).parent();
    $optionSet.find('.selected').removeClass('selected');
    $(this).addClass('selected');

    var selector = $(this).attr('data-filter');
    $container.isotope({filter: selector});
  });

  $('#merch-sorters a').click(function(){

    $optionSet = $(this).parent();
    $optionSet.find('.selected').removeClass('selected');
    $(this).addClass('selected');

    var sortName = $(this).attr('data-sort');
    $container.isotope({sortBy: sortName, sortAscending: true});
  });

   $('#merch-priceHigh').click(function(){
    $container.isotope({sortBy: 'price', sortAscending: false});
  });

  // Resets Mobile Nav Toggle Checkbox State when its children is clicked
  // Implemented so even local anchors will close the menu
  $('.nav__list a').click(function(){
      $('#header__toggle').prop('checked', false);
  });

});