#!/usr/bin/env python
from __future__ import print_function

import os
import gtfs_realtime_pb2, nyct_subway_pb2
import urllib2
import csv
import re
import boto3
import json

s3 = boto3.client('s3')

def load_stops():
    stops = {}
    with open('static/stops.txt', 'r') as stopsfile:
        reader = csv.reader(stopsfile)
        for stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon,zone_id,stop_url,location_type,parent_station in reader:
            if(stop_id != 'stop_id'):
                stops[stop_id] = {"lat": float(stop_lat), "lng": float(stop_lon), "name": stop_name}
    return stops

def stop_time_north(stop_time):
    if(stop_time.Extensions[nyct_subway_pb2.nyct_stop_time_update].HasField('actual_track')):
        track = stop_time.Extensions[nyct_subway_pb2.nyct_stop_time_update].actual_track
    else:
        track = stop_time.Extensions[nyct_subway_pb2.nyct_stop_time_update].scheduled_track
    if track == '1' or track == '2':
        return True
    else:
        return False

def stop_time_local(stop_time):
    if(stop_time.Extensions[nyct_subway_pb2.nyct_stop_time_update].HasField('actual_track')):
        track = stop_time.Extensions[nyct_subway_pb2.nyct_stop_time_update].actual_track
    else:
        track = stop_time.Extensions[nyct_subway_pb2.nyct_stop_time_update].scheduled_track
    if track == '1' or track == '4':
        return True
    else:
        return False

def stop_time_arrival(stop_time):
    if(stop_time.HasField('arrival')):
        return stop_time.arrival.time
    else:
        return -1

def stop_time_departure(stop_time):
    if(stop_time.HasField('departure')):
        return stop_time.departure.time
    else:
        return -1

def upload_to_s3(results):
    s3.put_object(Bucket="wibitty.com",
                  Key="js/gtfs.json",
                  ACL='public-read',
                  Body=json.dumps(results))
    return

def url():
    key = os.environ['MTAKEY']
    return 'http://datamine.mta.info/mta_esi.php?key={}&feed_id=1'.format(key)

def lambda_handler(event, context):
    print('Querying mta data at {}...'.format(event['time']))
    stops = load_stops()
    feed = gtfs_realtime_pb2.FeedMessage()
    body = urllib2.urlopen(url()).read()
    feed.ParseFromString(body)
    vehicles = [v.vehicle for v in feed.entity if v.vehicle.ByteSize() > 0]
    alerts = [a for a in feed.entity if a.alert.ByteSize() > 0]
    updates = [u.trip_update for u in feed.entity if u.trip_update.ByteSize() > 0]
    results = {}
    for v in vehicles:
        descriptor = v.trip.Extensions[nyct_subway_pb2.nyct_trip_descriptor]
        match = re.match(r'^0([123456])', descriptor.train_id, re.M)
        if match:
            update = next(u for u in updates if u.trip.trip_id == v.trip.trip_id and u.trip.Extensions[nyct_subway_pb2.nyct_trip_descriptor].train_id == descriptor.train_id)
            stop_time = next(s for s in update.stop_time_update if s.stop_id == v.stop_id)
            next_stop_time = next((s for s in update.stop_time_update if s.stop_id != v.stop_id), None)

            r = {"id": descriptor.train_id, "track": match.group(1), "status": gtfs_realtime_pb2.VehiclePosition.VehicleStopStatus.Name(v.current_status)}
            stop = {"arrival": stop_time_arrival(stop_time), "departure": stop_time_departure(stop_time)}
            stop.update(stops[stop_time.stop_id])

            if next_stop_time != None:
                next_stop = {"arrival": stop_time_arrival(next_stop_time), "departure": stop_time_departure(next_stop_time)}
                next_stop.update(stops[next_stop_time.stop_id])
            else:
                next_stop = None

            r['north'] = stop_time_north(stop_time)
            r['local'] = stop_time_local(stop_time)
            r['stop'] = stop
            r['next_stop'] = next_stop
            results[r['id']] = r

    upload_to_s3(results)
    print('Done.')
    return

if __name__ == '__main__':
    lambda_handler({'time': 'Now'}, None)
