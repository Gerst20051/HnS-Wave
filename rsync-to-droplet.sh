# [$]> rsync-to-droplet.sh

# update the index

rsync -zarvh src/index.html droplet:www

# update birthdays

rsync -zarvh src/birthdays/functions.js droplet:www/birthdays
rsync -zarvh src/birthdays/index.html droplet:www/birthdays

# update the icebreakers directory

rsync -zarvh src/icebreakers/ droplet:www/icebreakers

# update the mastery book files

rsync -zarvh src/mastery/init.js droplet:www/mastery
rsync -zarvh src/mastery/javascript.html droplet:www/mastery
rsync -zarvh src/mastery/javascript_datatypes.html droplet:www/mastery
rsync -zarvh src/mastery/mastery.js droplet:www/mastery
rsync -zarvh src/mastery/php.html droplet:www/mastery

# update quotes

rsync -zarvh src/quotes/functions.js droplet:www/quotes
rsync -zarvh src/quotes/index.html droplet:www/quotes

# update the resume directory

rsync -zarvh src/resume/ droplet:www/resume

# update the skills directory

rsync -zarvh src/skills/ droplet:www/skills
ssh droplet ln -s ../favicon.ico www/skills/favicon.ico

# update stations

rsync -zarvh src/stations/index.html droplet:www/stations
rsync -zarvh src/stations/js/app.js droplet:www/stations/js

# update trades

rsync -zarvh src/trades/index.html droplet:www/trades

# update the utils directory

rsync -zarvh src/utils/ droplet:www/utils

# update websnapchat

rsync -zarvh src/websnapchat/functions.js droplet:www/websnapchat
rsync -zarvh src/websnapchat/index.html droplet:www/websnapchat
