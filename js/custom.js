$(document).ready(function() {
  $('#media').carousel({
    pause: true,
    interval: false,
  });
});
$('.modal').on('shown.bs.modal', function () {
  $(this).find('input:text:visible:first').focus();
})
