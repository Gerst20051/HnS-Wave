$(document).ready(function () {
    $('#loadingDataHeaderContent, #loadingDataContent').show();
    loadData();
});

$('#reload').on('click', loadData);

function loadData() {
    // $.getJSON('sample-data.json').done(function (data) {
    $.getJSON(document.location.origin + ':8002/accountdata').done(function (data) {
        $('#equityValue .rowSubTitle').text('$' + parseFloat(data.portfolio.equity));
        $('#marketValue .rowSubTitle').text('$' + parseFloat(data.portfolio.market_value));
        $('#equityValueExtendedHours .rowSubTitle').text('$' + parseFloat(data.portfolio.extended_hours_equity));
        $('#marketValueExtendedHours .rowSubTitle').text('$' + parseFloat(data.portfolio.extended_hours_market_value));
        $('#noOpenPositions').toggle(!data.positions.length);
        $('#positionsListContent').toggle(!!data.positions.length);
        if (data.positions.length) {
            var rowItems = _.map(data.positions, function (position) {
                var quantity = parseInt(position.quantity);
                var price = parseFloat(position.average_buy_price);
                var equityValue = quantity * price;
                var marketValue = quantity * parseFloat(position.quote.last_trade_price);
                var valueDifference = parseFloat((marketValue - equityValue).toFixed(2));
                return [
                    '<li class="clearfix">',
                    '   <div class="rowLeftSection">',
                    '       <div class="rowTitle">' + position.symbol + ' (' + position.name + ')</div><div class="rowSubTitle">' + quantity + ' SHARES @ ' + price + ' ($' + equityValue + ')' + '</div>',
                    '   </div>',
                    '   <div class="rowRightSection">',
                    '       <span class="rowBubble valueDifference">$' + (0 < valueDifference ? '+' : '') + valueDifference + '</span>',
                    '       <span class="rowBubble marketValue">$' + marketValue + '</span>',
                    '       <span class="rowBubble lastTradePrice">$' + parseFloat(position.quote.last_trade_price) + '</span>',
                    '       <span class="rowBubble lastTradePriceExtendedHours">$' + parseFloat(position.quote.last_extended_hours_trade_price || position.quote.last_trade_price) + '</span>',
                    '   </div>',
                    '</li>'
                ].join('');
            });
            $('#positionsList').html(rowItems);
        }
        $('#loadingDataHeaderContent, #loadingDataContent').hide();
        $('#loadedDataHeaderContent, #loadedDataContent').show();
    });
}
