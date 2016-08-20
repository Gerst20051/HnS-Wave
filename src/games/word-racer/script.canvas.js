var playGrids = [];
var Node,
    Scene,
    mainScene,
    currentSearchTerm = '',
    currentGridIndex = 0,
    countdownToBeginningOfRoundTimeoutId = 0,
    countdownToEndOfRoundTimeoutId = 0,
    gameAlertTimeoutId = 0,
    foundWordTimeoutId = 0,
    gridNodes = [],
    nodeConnectors = [],
    wordsFound = [],
    gridLoading = true,
    gameStarted = false,
    gameOver = false,
    roundStartTime = 0,
    roundIntermissionStartTime = 0,
    roundTimeLimitInSeconds = 80,
    roundIntermissionInSeconds = 12,
    playerScore = 0,
    doFullScreen = false,
    centeredCanvas = true,
    canvasDimension = 800,
    canvasSize = {
        height: (doFullScreen) ? maxHeight : canvasDimension,
        width: (doFullScreen) ? maxWidth : canvasDimension
    };

function startGame() {
    resetSettings();
    setJSONArrays();
    generateScene();
    startCountdownToBeginningOfRound();
}

function resetSettings() {
    currentSearchTerm = '';
    currentGridIndex = 0;
    countdownToBeginningOfRoundTimeoutId = 0;
    countdownToEndOfRoundTimeoutId = 0;
    gameAlertTimeoutId = 0;
    foundWordTimeoutId = 0;
    gridNodes = [];
    nodeConnectors = [];
    wordsFound = [];
    gridLoading = true;
    gameStarted = false;
    gameOver = false;
    roundStartTime = 0;
    roundIntermissionStartTime = 0;
    playerScore = 0;
}

function setJSONArrays() {
    wordsFound = Array(grids.length).fill(null).map(() => { return []; });
}

function getNearGridOptions(grid, rowIndex, itemIndex) {
    const w = grid[rowIndex] && grid[rowIndex][itemIndex - 1] && [ rowIndex, itemIndex - 1 ];
    const nw = grid[rowIndex - 1] && grid[rowIndex - 1][itemIndex - 1] && [ rowIndex - 1, itemIndex - 1 ];
    const n = grid[rowIndex - 1] && grid[rowIndex - 1][itemIndex] && [ rowIndex - 1, itemIndex ];
    const ne = grid[rowIndex - 1] && grid[rowIndex - 1][itemIndex + 1] && [ rowIndex - 1, itemIndex + 1 ];
    const e = grid[rowIndex] && grid[rowIndex][itemIndex + 1] && [ rowIndex, itemIndex + 1 ];
    const se = grid[rowIndex + 1] && grid[rowIndex + 1][itemIndex + 1] && [ rowIndex + 1, itemIndex + 1 ];
    const s = grid[rowIndex + 1] && grid[rowIndex + 1][itemIndex] && [ rowIndex + 1, itemIndex ];
    const sw = grid[rowIndex + 1] && grid[rowIndex + 1][itemIndex - 1] && [ rowIndex + 1, itemIndex - 1 ];
    return [ w, nw, n, ne, e, se, s, sw ];
}

function preBeginningOfRound() {
    roundIntermissionStartTime = timeSeconds();
    roundStartTime = 0;
    gridLoading = true;
    if (gameStarted) {
        addSolutionsToWordPanel();
    }
    drawCanvas();
}

function startCountdownToBeginningOfRound() {
    preBeginningOfRound();
    countdownToBeginningOfRoundTimeoutId = setTimeout(beginningOfRoundCallback, 1E3 * roundIntermissionInSeconds);
}

function beginningOfRoundCallback() {
    roundIntermissionStartTime = 0;
    roundStartTime = timeSeconds();
    gridLoading = false;
    if (gameStarted) {
        currentGridIndex++;
    } else {
        gameStarted = true;
    }
    startCountdownToEndOfRound();
    generateScene();
    addWordsFoundToPanel();
    clearTimeout(countdownToBeginningOfRoundTimeoutId);
    countdownToBeginningOfRoundTimeoutId = 0;
}

function startCountdownToEndOfRound() {
    countdownToEndOfRoundTimeoutId = setTimeout(endOfRoundCallback, 1E3 * roundTimeLimitInSeconds);
}

function endOfRoundCallback() {
    if (currentGridIndex === gridSolutions.length - 1) {
        roundStartTime = 0;
        gameOver = true;
        toggleGameOverLabel();
        // TODO: use a keyboard shortcut or after 15 seconds show all words that have been found for each round in the word panel.
    } else {
        startCountdownToBeginningOfRound();
    }
    currentSearchTerm = '';
    $('#searchterm').text(currentSearchTerm);
    drawCanvas();
    clearTimeout(countdownToEndOfRoundTimeoutId);
    countdownToEndOfRoundTimeoutId = 0;
}

function nextRound() {
    if (gameOver) {
        return;
    }
    clearTimeout(countdownToBeginningOfRoundTimeoutId);
    endOfRoundCallback();
    if (currentGridIndex < gridSolutions.length - 1) {
        preBeginningOfRound();
        beginningOfRoundCallback();
    }
}

function toggleGameOverLabel() {
    $('#progressinfo').toggleClass('gameover');
}

function generateScene() {
    mainScene = new Scene();
    mainScene.init();
}

Node = function (x, y, letter, rowIndex, itemIndex) {
    var x = x;
    var y = y;
    var letter = letter;
    var rowIndex = rowIndex;
    var itemIndex = itemIndex;
    var selected = false;
    var highlighted = false;

    this.draw = function () {
        const shouldHighlightNode = this.shouldHighlightNode();
        const nodeType = grids[currentGridIndex][rowIndex][itemIndex];
        const nodeColor = [ colors.ghostwhite, colors.carolinablue, colors.lightpink ][nodeType - 1];
        const radiusXOffset = (letter === 'I') ? this.radius / 10 : (letter === 'Qu') ? this.radius / 1.7 : this.radius / 3;
        fill(gridLoading || gameOver ? (gameStarted ? colors.gray : colors.black) : nodeColor);
        stroke(gridLoading || gameOver ? colors.black : (shouldHighlightNode ? colors.yellow : nodeColor));
        strokeWeight(shouldHighlightNode ? 4 : 2);
        circle(x, y, this.radius);
        strokeWeight(1);
        textSize(currentGridIndex ? 30 : 46);
        fill(colors.black);
        text(letter, x - radiusXOffset, y + this.radius / 2.7);
    };

    this.areNearbyNodesAlsoInSearchTerm = function () {
        const currentSearchTermMinusNodeLetter = currentSearchTerm.replace(letter.toUpperCase(), '');
        const nearbyNodeLetters = _.map(_.compact(getNearGridOptions(playGrids[currentGridIndex], rowIndex, itemIndex)), function (nearbyNode) {
            return playGrids[currentGridIndex][nearbyNode[0]][nearbyNode[1]].toUpperCase();
        });
        return _.filter(nearbyNodeLetters, function (nearbyNodeLetter) {
            return __.includes(currentSearchTermMinusNodeLetter, nearbyNodeLetter);
        }).length;
    };

    this.shouldHighlightNode = function () {
        var isLetterInSearchTerm = false,
            areNearbyNodesAlsoInSearchTerm = false,
            shouldCheckNearbyNodes = false;
        if (currentSearchTerm.length) {
            const containsMultiLetterNode = __.includes(currentSearchTerm, 'QU');
            isLetterInSearchTerm = __.includes(currentSearchTerm, letter.toUpperCase());
            areNearbyNodesAlsoInSearchTerm = this.areNearbyNodesAlsoInSearchTerm();
            shouldCheckNearbyNodes = 0 < currentSearchTerm.length - (containsMultiLetterNode ? 2 : 1);
        }
        return isLetterInSearchTerm && (!shouldCheckNearbyNodes || (shouldCheckNearbyNodes && areNearbyNodesAlsoInSearchTerm));
    };

    this.setX = function (newX) { x = newX; };
    this.getX = function () { return x; };
    this.setY = function (newY) { y = newY; };
    this.getY = function () { return y; };
    this.getLetter = function () { return letter; };
    this.getRowIndex = function () { return rowIndex; };
    this.getItemIndex = function () { return itemIndex; };
    this.isSelected = function () { return selected; };
    this.setSelected = function (isSelected) { selected = isSelected; };
    this.isHighlighted = function () { return highlighted; };
    this.setHighlighted = function (isHighlighted) { highlighted = isHighlighted; };
};

Scene = function () {
    var gridSize = 0;
    var nodeDiameter = 0;
    var nodeRadius = 0;

    this.init = function () {
        this.calculateNodeRadius();
        this.generateNodes();
        this.generateNodeConnectors();
        drawCanvas();
    };

    this.draw = function () {
        background(color(130, 170, 230));
    };

    this.calculateNodeRadius = function () {
        gridSize = canvasDimension / _.first(playGrids[currentGridIndex]).length;
        nodeDiameter = gridSize / 2;
        nodeRadius = nodeDiameter / 2;
        Node.prototype.radius = nodeRadius;
    };

    this.getNodeCoordinates = function (rowIndex, itemIndex) {
        const nodeXPos = (gridSize * itemIndex) + nodeDiameter;
        const nodeYPos = (gridSize * rowIndex) + nodeDiameter;
        return [ nodeXPos, nodeYPos ];
    };

    this.getNodeIndexesFromCoordinates = function (x, y) {
        const rowIndex = __.floor(y / gridSize);
        const itemIndex = __.floor(x / gridSize);
        return [ rowIndex, itemIndex ];
    };

    this.getNodeFromCoordinates = function (x, y) {
        return this.getNodeFromIndexes.apply(this, this.getNodeIndexesFromCoordinates(x, y));
    };

    this.getNodeFromIndexes = function (rowIndex, itemIndex) {
        return _.first(_.filter(gridNodes, function (gridNode) {
            return gridNode.getRowIndex() === rowIndex && gridNode.getItemIndex() === itemIndex;
        }));
    };

    this.generateNodes = function () {
        gridNodes = [];
        const grid = playGrids[currentGridIndex], _this = this;
        _.each(grid, function (row, rowIndex) {
            _.each(row, function (item, itemIndex) {
                if (item) {
                    const coordinates = _this.getNodeCoordinates(rowIndex, itemIndex);
                    gridNodes.push(new Node(coordinates[0], coordinates[1], item, rowIndex, itemIndex));
                }
            });
        });
    };

    this.generateNodeConnectors = function () {
        const neighborNodes = {}, _this = this;
        _.each(gridNodes, function (node) {
            const nodeKey = `${node.getRowIndex()},${node.getItemIndex()}`;
            const nearNodes = getNearGridOptions(playGrids[currentGridIndex], node.getRowIndex(), node.getItemIndex());
            neighborNodes[nodeKey] = nearNodes;
        });
        nodeConnectors = _.flatten(_.values(_.mapObject(neighborNodes, function (nodes, originNodeKey) {
            const nodeOrigin = originNodeKey.split(',');
            const startCoordinates = _this.getNodeCoordinates(nodeOrigin[0], nodeOrigin[1]);
            return _.map(_.compact(nodes), function (node) {
                const endCoordinates = _this.getNodeCoordinates(node[0], node[1]);
                return {
                    start: { x: startCoordinates[0], y: startCoordinates[1] },
                    end: { x: endCoordinates[0], y: endCoordinates[1] }
                };
            });
        })));
    };
};

var setup = function () {
    if (doFullScreen) {
        fullScreen();
    } else {
        size(canvasSize.width, canvasSize.height);
    }
    positionElements();
};

setInterval(updateProgressInfo, 500);

function updateProgressInfo() {
    var countdownTimeString = '';
    if (!gameOver) {
        $('#countdownlabel').text(gridLoading ? 'Starts in:' : 'Time:');
        var secondsRemaining = 0;
        if (gridLoading) {
            if (gameStarted) {
                $('#roundnumber').text(currentGridIndex + 2);
            } else {
                $('#roundnumber').text(currentGridIndex + 1);
            }
            secondsRemaining = __.round((roundIntermissionStartTime + roundIntermissionInSeconds) - timeSeconds());
        } else {
            $('#roundnumber').text(currentGridIndex + 1);
            secondsRemaining = __.round((roundStartTime + roundTimeLimitInSeconds) - timeSeconds());
        }
        countdownTimeString = new Date(secondsRemaining * 1E3).toISOString().substr(15, 4);
    } else {
        countdownTimeString = 'Game Over';
    }
    $('#countdowntime').text(countdownTimeString);
}

function drawCanvas() {
    if (loopStarted) {
        mainScene && mainScene.draw();
        drawNodeConnectors();
        drawNodes();
    }
}

function drawNodeConnectors() {
    stroke(gameOver ? colors.white : colors.black);
    _.each(nodeConnectors, function (connector) {
        line(connector.start.x, connector.start.y, connector.end.x, connector.end.y);
    });
    stroke(colors.black);
}

function drawNodes() {
    _.each(gridNodes, function (node) {
        node.draw();
    });
}

function addWordsFoundToPanel() {
    const wordPointsDistribution = [ 10, 20, 40, 80, 120, 140, 220, 300 ];
    $('#wordsfound').html(_.map(wordsFound[currentGridIndex], function (word) {
        const wordPoints = wordPointsDistribution[word.length - 3] || 400;
        return $('<div/>', { 'class': 'wordpanelrow' })
            .append($('<div/>', { 'class': 'wordpanelrowtext' }).text(word))
            .append($('<div/>', { 'class': 'wordpanelrowpoints' }).text(wordPoints));
    }));
    const wordsFoundCount = wordsFound[currentGridIndex].length;
    $('#wordsfoundcount').text('(' + wordsFound[currentGridIndex].length + ') ' + __.round((wordsFoundCount / _.filter(gridSolutions[currentGridIndex], function (s) { return s.length > 2; }).length) * 100) + '%');
    playerScore = _.reduce(wordsFound, function (carry, wordsFoundGrid) {
        return carry += _.reduce(wordsFoundGrid, function (carry, word) {
            return carry += wordPointsDistribution[word.length - 3] || 400;
        }, 0);
    }, 0);
    $('#scorepanel').html(
        $('<div/>', { 'class': 'scorepanelrow' })
            .append($('<div/>', { 'class': 'scorepanelrowtext' }).text('You'))
            .append($('<div/>', { 'class': 'scorepanelrowpoints' }).text(playerScore))
    );
    $('#solutions').empty();
    if (!wordsFound[currentGridIndex].length || !solutions.length) {
        $('#wordpaneldividercontainer').hide();
    }
}

function addSolutionsToWordPanel() {
    const wordPointsDistribution = [ 10, 20, 40, 80, 120, 140, 220, 300 ];
    const solutions = _.filter(gridSolutions[currentGridIndex], function (s) {
        return s.length > 2 && !_.contains(wordsFound[currentGridIndex], s);
    }).sort(); // could also sort by word length
    if (!wordsFound[currentGridIndex].length || !solutions.length) {
        $('#wordpaneldividercontainer').hide();
    } else {
        $('#wordpaneldividercontainer').show();
    }
    $('#solutions').html(_.map(solutions, function (word) {
        const wordPoints = wordPointsDistribution[word.length - 3] || 400;
        return $('<div/>', { 'class': 'wordpanelrow' })
            .append($('<div/>', { 'class': 'wordpanelrowtext' }).text(word))
            .append($('<div/>', { 'class': 'wordpanelrowpoints' }).text(wordPoints));
    }));
}

function showGameToastAlert(text) {
    $('#alertpanel').finish().text(text).fadeIn();
    clearTimeout(gameAlertTimeoutId);
    gameAlertTimeoutId = setTimeout(function() {
        $('#alertpanel').finish().fadeOut(400, function () {
            $(this).empty();
        });
    }, 2E3);
}

function doFoundWordEffect() {
    $('#alertpanel').finish().empty();
    $('#searchterm').addClass('foundword');
    clearTimeout(foundWordTimeoutId);
    foundWordTimeoutId = setTimeout(function() {
        $('#searchterm').removeClass('foundword');
    }, 500);
}

function submitWord() {
    if (!currentSearchTerm.length) {
        return;
    }
    if (currentSearchTerm.length > 2 && _.contains(gridSolutions[currentGridIndex], currentSearchTerm)) {
        if (!_.contains(wordsFound[currentGridIndex], currentSearchTerm)) {
            wordsFound[currentGridIndex].unshift(currentSearchTerm);
            doFoundWordEffect();
        } else {
            showGameToastAlert('The Word \'' + currentSearchTerm + '\' Has Already Been Found!');
        }
    } else if (currentSearchTerm.length < 3) {
        showGameToastAlert('Words Must Be 3 Characters Or Longer!');
    } else if (searchTrie(currentSearchTerm)) {
        showGameToastAlert('\'' + currentSearchTerm + '\' Is Not In The Grid!');
    } else {
        showGameToastAlert('\'' + currentSearchTerm + '\' Is Not A Word!');
    }
    currentSearchTerm = '';
    addWordsFoundToPanel();
    $('#searchterm').text(currentSearchTerm);
    drawCanvas();
}

keyUp = function (e) {
    if (gameOver && _.contains([ keys.ENTER, keys.RETURN, keys.SPACE ], keycode.getKeyCode(e))) {
        startGame();
        toggleGameOverLabel();
        return;
    }
    if (gridLoading || gameOver) {
        return;
    }
    if (keycode.getKeyCode(e) === keys.BACKSPACE) {
        currentSearchTerm = currentSearchTerm.slice(0, -1);
        $('#searchterm').text(currentSearchTerm);
    } else if (_.contains([ keys.ENTER, keys.RETURN, keys.SPACE ], keycode.getKeyCode(e))) {
        submitWord();
    } else {
        var letter = (keycode.getValueByEvent(e) || '').toUpperCase().replace(/[^a-zA-Z]/g, '');
        letter = letter.length === 1 ? letter : '';
        currentSearchTerm += letter;
        $('#searchterm').text(currentSearchTerm);
    }
    drawCanvas();
};

mouseClicked = function () {
    if (!gridLoading && !gameOver && gameStarted) {
        currentSearchTerm += mainScene.getNodeFromCoordinates(mouseX, mouseY).getLetter().toUpperCase();
        $('#searchterm').text(currentSearchTerm);
        drawCanvas();
    }
};

windowResized = function () {
    positionElements();
};

function positionElements() {
    centerCanvas();
    positionProgressInfo()
    positionSearchTerm();
    positionAlertPanel();
    positionWordPanel();
    positionScorePanel();
}

function centerCanvas() {
    $canvas = $('#canvas1'), $window = $(window);
    $canvas.css({
        'left': (($window.width() - canvasSize.width) / 2) + 'px',
        'position': 'absolute',
        'top': (($window.height() - canvasSize.height) / 2) + 'px'
    });
}

function positionProgressInfo() {
    $div = $('#progressinfo'), $canvas = $('#canvas1'), padding = 20;
    $div.css({
        'top': (parseInt($canvas.css('top')) + canvasSize.height + padding) + 'px',
        'left': parseInt($canvas.css('left')) + 'px',
        'width': canvasSize.width + 'px'
    }).show();
}

function positionSearchTerm() {
    $div = $('#searchterm'), $progressinfo = $('#progressinfo'), padding = 40;
    $div.css({
        'left': parseInt($progressinfo.css('left')) + 'px',
        'top': (parseInt($progressinfo.css('top')) + parseInt($progressinfo.css('height')) + padding) + 'px',
        'width': canvasSize.width + 'px'
    }).show();
}

function positionAlertPanel() {
    $div = $('#alertpanel'), $searchterm = $('#searchterm'), panelWidth = 250, padding = 20;
    $div.css({
        'left': (parseInt($searchterm.css('left')) - panelWidth) + 'px',
        'top': (parseInt($searchterm.css('top')) + parseInt($searchterm.css('height')) + padding) + 'px',
        'width': (canvasSize.width + 2 * panelWidth) + 'px'
    }).show();
}

function positionWordPanel() {
    $div = $('#wordpanel'), $title = $('#wordpaneltitle'), $canvas = $('#canvas1'), titleHeight = 40, padding = 20;
    $div.css({
        'height': (canvasSize.height - (2 * parseInt($div.css('padding')))) + 'px',
        'left': (parseInt($canvas.css('left')) + canvasSize.width + padding) + 'px',
        'top': parseInt($canvas.css('top')) + 'px'
    }).show();
    $title.css({
        'left': parseInt($div.css('left')) + 'px',
        'top': (parseInt($div.css('top')) - titleHeight) + 'px'
    }).show();
}

function positionScorePanel() {
    $div = $('#scorepanel'), $title = $('#scorepaneltitle'), $canvas = $('#canvas1'), panelWidth = 250, titleHeight = 40, padding = 20;
    $div.css({
        'height': (canvasSize.height - (2 * parseInt($div.css('padding')))) + 'px',
        'left': (parseInt($canvas.css('left')) - panelWidth - (2 * padding)) + 'px',
        'top': parseInt($canvas.css('top')) + 'px'
    }).show();
    $title.css({
        'left': parseInt($div.css('left')) + 'px',
        'top': (parseInt($div.css('top')) - titleHeight) + 'px'
    }).show();
}

$(document).ready(function () {
    $('#searchterm').on('click', submitWord);
});

window.onload = function () {
    window.canvas = new Canvas(document.getElementById('canvas1'));
    window.ctx = canvas.ctx;
    canvas.setup = window.setup;
    canvas.run();
};
