var Node,
    Scene,
    mainScene,
    currentSearchTerm = '',
    currentGridIndex = 0,
    gameAlertTimeoutId = 0,
    foundWordTimeoutId = 0,
    currentGridSolutionsCount = 0,
    grids = [],
    gridSolutions = [],
    playGrids = [],
    gridNodes = [],
    nodeConnectors = [],
    wordsFound = [],
    playerScores = {},
    gridLoading = true,
    gameStarted = false,
    gameOver = false,
    roundStartTime = 0,
    roundIntermissionStartTime = 0,
    roundTimeLimitInSeconds = 0,
    roundIntermissionInSeconds = 0,
    playerScore = 0,
    doFullScreen = false,
    centeredCanvas = true,
    canvasDimension = 800,
    canvasSize = {
        height: (doFullScreen) ? maxHeight : canvasDimension,
        width: (doFullScreen) ? maxWidth : canvasDimension
    };

loadRoundGridsFile();

function loadRoundGridsFile() {
    const jsonPath = 'https://raw.githubusercontent.com/Gerst20051/HnS-Wave/wordracer/src/games/word-racer/';
    $.getJSON(jsonPath + 'round-grids.json').done(function (gridJSON) {
        grids = gridJSON;
    });
}

function startGame() {
    resetSettings();
    setJSONArrays();
    generateScene();
    preBeginningOfRound();
}

function resetSettings() {
    currentSearchTerm = '';
    currentGridIndex = 0;
    gameAlertTimeoutId = 0;
    foundWordTimeoutId = 0;
    currentGridSolutionsCount = 0;
    gridNodes = [];
    nodeConnectors = [];
    wordsFound = [];
    playerScores = [];
    gridLoading = true;
    gameStarted = false;
    gameOver = false;
    roundStartTime = 0;
    roundIntermissionStartTime = 0;
    playerScore = 0;
}

function setJSONArrays() {
    gridSolutions = Array(playGrids.length).fill(null).map(() => { return []; });
    wordsFound = Array(playGrids.length).fill(null).map(() => { return []; });
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
    drawCanvas();
}

function beginningOfRound() {
    roundIntermissionStartTime = 0;
    roundStartTime = timeSeconds();
    gridLoading = false;
    gameStarted = true;
    generateScene();
    addWordsFoundToPanel();
}

function endOfRound() {
    if (currentGridIndex === playGrids.length - 1) {
        roundStartTime = 0;
        gameOver = true;
        toggleGameOverLabel();
        $('#searchterm').text('Start Game');
        // TODO: use a keyboard shortcut or after 15 seconds show all words that have been found for each round in the word panel.
    } else {
        preBeginningOfRound();
        $('#searchterm').text('');
    }
    addSolutionsToWordPanel();
    currentSearchTerm = '';
    drawCanvas();
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
    playerScores[currentGridIndex] = {};
    _.each(Object.keys(gamePlayers), function (userId) {
        playerScores[currentGridIndex][userId] = getPlayerScore(userId);
    });
    addPlayerWordsToPanel();
    var playerWordsFoundCount = playerScores[currentGridIndex][store.get('sessionUserId')].count;
    $('#wordsfoundcount').text('(' + playerWordsFoundCount + ') ' + __.round((playerWordsFoundCount / currentGridSolutionsCount) * 100) + '%');
    addPlayerScoresToPanel();
    $('#solutions').empty();
    if (!playerWordsFoundCount) {
        $('#wordpaneldividercontainer').hide();
    }
}

function addPlayerWordsToPanel() {
    var content = [];
    _.each(_.pairs(playerScores[currentGridIndex]), function (playerScore) { // TODO: Need To Add Username To Row
        _.each(playerScore[0].words, function (wordObject) {
            content.push(
                $('<div/>', { 'class': 'wordpanelrow' })
                    .append($('<div/>', { 'class': 'wordpanelrowtext' }).text(wordObject.word))
                    .append($('<div/>', { 'class': 'wordpanelrowpoints' }).text(wordObject.points))
            );
        });
    });
    $('#wordsfound').html(content);
}

function addPlayerScoresToPanel() {
    var content = [];
    var scores = {};
    _.each(_.values(playerScores), function (roundScores) {
        _.each(_.pairs(roundScores), function (playerScore) {
            if (!scores[playerScore[0]]) {
                scores[playerScore[0]] = {
                    score: 0,
                    username: gamePlayers[playerScore[0]].username
                };
            }
            scores[playerScore[0]].score += playerScore[1].score;
        });
    });
    _.each(Object.keys(scores), function (userId) {
        content.push(
            $('<div/>', { 'class': 'scorepanelrow' })
                .append($('<div/>', { 'class': 'scorepanelrowtext' }).text(scores[userId].username))
                .append($('<div/>', { 'class': 'scorepanelrowpoints' }).text(scores[userId].score))
        );
    });
    $('#scorepanel').html(content);
}

function getPointsForWord(word) {
    const wordPointsDistribution = [ 10, 20, 40, 80, 120, 140, 220, 300 ];
    return (wordPointsDistribution[word.length - 3] || 400) * getMultiplierForWord(word);
}

function getMultiplierForWord(word) {
    return 1; // TODO: 2 and 3 multipliers
}

function getScoreForWords(words) {
    return _.reduce(words, function (carry, word) {
        return carry += word.points;
    }, 0);
}

function getPlayerScore(userId) {
    const words = [];
    _.each(_.filter(wordsFound[currentGridIndex], function (wordsFoundObject) {
        return wordsFoundObject.userId === userId;
    }), function (wordsFoundObject) {
        words.push({
            points: getPointsForWord(wordsFoundObject.word),
            word: wordsFoundObject.word
        });
    });
    return {
        count: words.length,
        score: getScoreForWords(words),
        words: words
    };
}

function getWordsFoundByAllPlayers() {
    return _.reduce(_.values(playerScores[currentGridIndex]), function (carry, playerScore) {
        return carry.concat(playerScore.words);
    }, []);
}

function addSolutionsToWordPanel() {
    const wordsFound = getWordsFoundByAllPlayers();
    const solutions = _.filter(gridSolutions[currentGridIndex], function (s) {
        return !_.contains(wordsFound, s);
    }).sort(); // could also sort by word length
    if (!wordsFound.length || !solutions.length) {
        $('#wordpaneldividercontainer').hide();
    } else {
        $('#wordpaneldividercontainer').show();
    }
    $('#solutions').html(_.map(solutions, function (word) {
        const wordPoints = getPointsForWord(word);
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
    if (gameOver) {
        createGame();
    }
    if (!currentSearchTerm.length) {
        return;
    }
    if (currentSearchTerm.length < 3) {
        showGameToastAlert('Words Must Be 3 Characters Or Longer!');
        return;
    }
    postRawJSON(getApiUrl('checkword'), getBaseApiParams({
        gameId: gameId,
        searchTerm: currentSearchTerm
    }), function (response) {
        if (!response.exists && response.reason) {
            showGameToastAlert(response.reason);
        }
    });
    currentSearchTerm = '';
    $('#searchterm').text('');
    drawCanvas();
}

keyUp = function (e) {
    if (gameOver && _.contains([ keys.ENTER, keys.RETURN, keys.SPACE ], keycode.getKeyCode(e))) {
        createGame();
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

function setupCanvas() {
    window.canvas = new Canvas(document.getElementById('canvas1'));
    window.ctx = canvas.ctx;
    canvas.setup = window.setup;
    canvas.run();
}

function destroyCanvas() {
    if (typeof canvas !== 'undefined') canvas.destroy();
    ctx = null;
}
