# [$]> rsync-games-to-droplet.sh

# update the index

rsync -zarvh src/index.html droplet:www

# update the games index

rsync -zarvh src/games/index.html droplet:www/games

# update the cdn asset files

rsync -zarvh src/cdn/ droplet:www/cdn

# update the mastery book files

rsync -zarvh src/mastery/init.js droplet:www/mastery
rsync -zarvh src/mastery/mastery.js droplet:www/mastery

# update the game asset files

rsync -zarvh src/games/audio/ droplet:www/games/audio
rsync -zarvh src/games/fonts/ droplet:www/games/fonts
rsync -zarvh src/games/images/ droplet:www/games/images

# update the engine source files

rsync -zarvh src/games/canvasengine.js droplet:www/games
rsync -zarvh src/games/imageengine.js droplet:www/games
rsync -zarvh src/games/soundengine.js droplet:www/games

# update the single file games
# [$]> find src/games -type f -name '*.html' | sort

rsync -zarvh src/games/aiasteroids.html droplet:www/games
rsync -zarvh src/games/animatedrainbow.html droplet:www/games
rsync -zarvh src/games/animatedrandomrainbow.html droplet:www/games
rsync -zarvh src/games/breakout.html droplet:www/games
rsync -zarvh src/games/canvasenginedemo.html droplet:www/games
rsync -zarvh src/games/clock.html droplet:www/games
rsync -zarvh src/games/cone.html droplet:www/games
rsync -zarvh src/games/cone.original.html droplet:www/games
rsync -zarvh src/games/connect3.html droplet:www/games
rsync -zarvh src/games/connect4.html droplet:www/games
rsync -zarvh src/games/connect5.html droplet:www/games
rsync -zarvh src/games/gameoflife.html droplet:www/games
rsync -zarvh src/games/images.html droplet:www/games
rsync -zarvh src/games/mario.html droplet:www/games
rsync -zarvh src/games/matrix.html droplet:www/games
rsync -zarvh src/games/minesweeper.html droplet:www/games
rsync -zarvh src/games/mosaics.html droplet:www/games
rsync -zarvh src/games/mosaics_weird.html droplet:www/games
rsync -zarvh src/games/pacman.html droplet:www/games
rsync -zarvh src/games/particles.html droplet:www/games
rsync -zarvh src/games/pathfinding.html droplet:www/games
rsync -zarvh src/games/pong.html droplet:www/games
rsync -zarvh src/games/rainbowgrid.html droplet:www/games
rsync -zarvh src/games/raindrops.html droplet:www/games
rsync -zarvh src/games/randommapgeneration.html droplet:www/games
rsync -zarvh src/games/raytracing.html droplet:www/games
rsync -zarvh src/games/rotatingcube.html droplet:www/games
rsync -zarvh src/games/rotatingcubes.html droplet:www/games
rsync -zarvh src/games/snake.html droplet:www/games
rsync -zarvh src/games/sounds.html droplet:www/games
rsync -zarvh src/games/tictactoe.html droplet:www/games
rsync -zarvh src/games/tiles.html droplet:www/games
rsync -zarvh src/games/trianglesplitter.html droplet:www/games
rsync -zarvh src/games/wordsearch.html droplet:www/games

# update all of the directory based games

rsync -zarvh src/games/paint-racer/single-player/index.html droplet:www/games/paint-racer/single-player
rsync -zarvh src/games/paint-racer/single-player/script.js droplet:www/games/paint-racer/single-player
rsync -zarvh src/games/paint-racer/single-player/style.css droplet:www/games/paint-racer/single-player

rsync -zarvh src/games/word-racer/index.html droplet:www/games/word-racer
rsync -zarvh src/games/word-racer/round-grids.js droplet:www/games/word-racer
rsync -zarvh src/games/word-racer/round-grids.json droplet:www/games/word-racer
rsync -zarvh src/games/word-racer/script.canvas.js droplet:www/games/word-racer
rsync -zarvh src/games/word-racer/script.js droplet:www/games/word-racer
rsync -zarvh src/games/word-racer/style.base.css droplet:www/games/word-racer
rsync -zarvh src/games/word-racer/style.canvas.css droplet:www/games/word-racer
rsync -zarvh src/games/word-racer/style.interface.css droplet:www/games/word-racer
rsync -zarvh src/games/word-racer/style.registration.css droplet:www/games/word-racer

rsync -zarvh src/games/word-racer/single-player/dictionary.js droplet:www/games/word-racer/single-player
rsync -zarvh src/games/word-racer/single-player/frequencies.js droplet:www/games/word-racer/single-player
rsync -zarvh src/games/word-racer/single-player/index.html droplet:www/games/word-racer/single-player
rsync -zarvh src/games/word-racer/single-player/round-grids.js droplet:www/games/word-racer/single-player
