let TrainSpeed = 2000;

class Train {
  constructor(data, map) {
    this.updateData(data);

    // initially put the train at the known coords of stop
    if(this.lastStop) {
      this.position = {
        lat: this.lastStop.lat,
        lng: this.lastStop.lng
      };
    } else {
      this.status = "STOPPED_AT";
      this.position = {
        lat: this.stop.lat,
        lng: this.stop.lng
      };
    }

    console.log("Creating new train", this);
    let icon = L.divIcon({className: `train-marker train-marker-${data.track}`});
    this.marker = L.marker([this.position.lat, this.position.lng], {icon: icon})
      .addTo(map);
    this.intervalId = setInterval(() => this.updateMarker(), TrainSpeed);
  }

  updateData(update) {
    this.stop = update.stop;
    this.nextStop = update.next_stop;
    this.lastStop = update.last_stop;
    this.status = update.status;
    this.id = update.id;
  }

  atStation() {
    this.status == "STOPPED_AT";
  }

  updateMarker() {
    this.move();
    let latlng = L.latLng(this.position.lat, this.position.lng);
    this.marker.setLatLng(latlng);
  }

  destroy() {
    this.marker.remove();
    clearInterval(this.intervalId);
  }

  move() {
    let now = Math.round(new Date() / 1000);
    // not at station but moving towards
    if (!this.atStation() && this.stop.arrival > 0) {
      this.updatePosition(now, this.stop.arrival);
    } else if (!this.atStation() && this.stop.departure > 0) {
      this.updatePosition(now, this.stop.departure - 30);
    // at station and departing
    } else if (this.atStation() && this.stop.departure > now && this.next_stop != null) {
      this.status = "IN_TRANSIT_TO";
      this.stop = this.next_stop;
      this.next_stop = null;
      this.move();
    } else {
      console.log("Don't know how to move", this);
    }
  }

  updatePosition(now, when) {
    let deltas = this.howFar(now, when);
    // if we are close enough, just move to the station
    if (deltas[0] == 0 && deltas[1] == 0) {
      this.status == "STOPPED_AT";
    } else {
      this.position = {
        lat: this.position.lat + deltas[0],
        lng: this.position.lng + deltas[1]
      }
    }
  }

  howFar(now, when) {
    // times are in seconds
    let moves = (when - now) / (TrainSpeed / 1000);
    if (moves < 1) {
      moves = 1;
    }

    let deltaLat = (this.stop.lat - this.position.lat) / moves;
    let deltaLng = (this.stop.lng - this.position.lng) / moves;
    return [deltaLat, deltaLng];
  }
}

let trains = {}

let getTrains = (map) => {
  fetch("https://s3.amazonaws.com/wibitty.com/js/gtfs.json")
    .then( resp => resp.json() )
    .then( update => {
      Object.keys(update).forEach( key => {
        let train = update[key];
        if (trains[train.id]) {
          trains[train.id].updateData(train);
        } else {
          trains[train.id] = new Train(train, map);
        }
      });

      // delete train if no longer in update
      Object.keys(trains).forEach( key => {
        if (!update[key]) {
          trains[key].destroy();
          delete(trains[key]);
        }
      });
    })
}

document.addEventListener('DOMContentLoaded', () => { 
  let mymap = L.map('mapid', {
    zoomControl: false,
    dragging: false,
    boxZoom: false,
    doubleClickZoom: false,
    scrollWheelZoom: false
  }).setView([40.768, -73.985], 14);

  L.tileLayer('https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey={apikey}', {
    attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    apikey: 'da8d4e6212904e8fbf27c73c7b2a237e',
    maxZoom: 22
  }).addTo(mymap);

  getTrains(mymap);
  setInterval(() => getTrains(mymap), 30000);
}, false);
