# [$]> rsync-to-droplet.sh

# update the icebreakers directory

rsync -zarvh src/icebreakers/ droplet:www/icebreakers

# update the resume directory

rsync -zarvh src/resume/ droplet:www/resume

# update the utils directory

rsync -zarvh src/utils/ droplet:www/utils
