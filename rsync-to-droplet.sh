# [$]> rsync-to-droplet.sh

# update the icebreakers directory

rsync -zarvh src/icebreakers/ droplet:www/icebreakers
