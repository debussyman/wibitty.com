cd ~/Projects/wibitty.com/gtfs; zip -r /tmp/nyct_trains.zip ./* --exclude @exclude.lst
aws s3 cp /tmp/nyct_trains.zip s3://wibitty.com/build/nyct_trains.zip
rm /tmp/nyct_trains.zip
