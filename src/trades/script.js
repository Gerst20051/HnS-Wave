const isLocal = false;
const host = isLocal ? 'http://127.0.0.1' : document.location.origin;

var tickers = [];

$(document).ready(function () {
    $('#loadingDataHeaderContent, #loadingDataContent').show();
    loadData();
});

$('#logo').on('click', function () {
    window.open('https://finviz.com/screener.ashx?v=211&t=' + tickers.join(',') + '&ta=0&o=ticker', '_blank');
    window.open('https://mobile.twitter.com/search/live?q=' + encodeURIComponent(tickers.map(function ($0) { return '"$' + $0 + '"'; }).join(' OR ')), '_blank');
});

$('#reload').on('click', loadData);

function loadData() {
    tickers = [];
    // $.getJSON('sample-data.json').done(function (data) {
    $.getJSON(`${host}:8002/stocks-portfolio`).done(function (data) {
        var positions = data.positions.sort(function ($0, $1) { return $0.symbol.localeCompare($1.symbol); });
        $('#equityValue .rowSubTitle').text('$' + parseFloat(data.portfolio.equity));
        $('#marketValue .rowSubTitle').text('$' + parseFloat(data.portfolio.market_value));
        $('#equityValueExtendedHours .rowSubTitle').text('$' + parseFloat(data.portfolio.extended_hours_equity));
        $('#marketValueExtendedHours .rowSubTitle').text('$' + parseFloat(data.portfolio.extended_hours_market_value));
        $('#noOpenPositions').toggle(!positions.length);
        $('#positionsListContent').toggle(!!positions.length);
        if (positions.length) {
            var rowItems = _.map(positions, function (position) {
                tickers.push(position.symbol);
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
