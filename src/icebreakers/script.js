const ICEBREAKERS = $('pre').text().split('\n');

$('#randomIceBreaker').text(ICEBREAKERS[Math.floor(ICEBREAKERS.length * Math.random())]);

$('#searchIceBreakers').on('input', function () {
  const search = $(this).val().toLowerCase();
  $('pre').text(ICEBREAKERS.filter(iceBreaker => iceBreaker.toLowerCase().includes(search)).join('\n'));
  if (search.length > 2) {
    $('pre').mark(search);
  }
});
