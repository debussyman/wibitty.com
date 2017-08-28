let TrainSpeed = 200;

class Train {
  constructor(name, route, map, icon) {
    let firstStop = route.shift();
    this.id = `${name}.${firstStop.departAt.toString()}`;
    console.log("Creating new train", this.id);
    this.position = firstStop;
    this.nextStation = firstStop;
    this.route = route;
    this.atStation = true;
    this.marker = L.marker([this.position.lat, this.position.lng], {icon: icon})
      .addTo(map);
    this.intervalId = setInterval(() => this.updateMarker(), TrainSpeed);
  }

  updateMarker() {
    this.move();
    if (this.nextStation == null) {
      this.destroy();
    } else {
      let latlng = L.latLng(this.position.lat, this.position.lng);
      this.marker.setLatLng(latlng);
    }
  }

  destroy() {
    this.marker.remove();
    clearInterval(this.intervalId);
  }

  move() {
    let now = LocalDateTime.now();
    if (this.nextStation == null) {
      console.log("Route done");
    } else if (this.atStation && this.nextStation.departAt.isAfter(LocalDateTime.now())) {
      console.log("At station, departing", this.nextStation.departAt.toString());
    } else if (this.atStation) {
      console.log("Next station");
      this.nextStation = this.route.shift();
      this.atStation = false;
      this.move();
    } else {
      let deltas = this.howFar();
      // if we are close enough, just move to the station
      if (deltas[0] == 0 && deltas[1] == 0) {
        this.atStation = true;
      } else {
        this.position = {
          lat: this.position.lat + deltas[0],
          lng: this.position.lng + deltas[1]
        }
      }
    }
  }

  howFar() {
    let moves = LocalDateTime.now().until(this.nextStation.departAt.minusSeconds(5), ChronoUnit.MILLIS) / TrainSpeed;
    if (moves < 1) {
      moves = 1;
    }

    let deltaLat = (this.nextStation.lat - this.position.lat) / moves;
    let deltaLong = (this.nextStation.lng - this.position.lng) / moves;
    return [deltaLat, deltaLong];
  }
}

let SixTrainNorth = [
  {lat: 40.746664, lng: -73.981891},
  {lat: 40.752402, lng: -73.977470},
  {lat: 40.757156, lng: -73.972160},
  {lat: 40.762845, lng: -73.967535},
  {lat: 40.762996, lng: -73.967868},
  {lat: 40.768144, lng: -73.963872},
  {lat: 40.773522, lng: -73.959746},
  {lat: 40.779462, lng: -73.955830},
  {lat: 40.785683, lng: -73.950927},
  {lat: 40.790192, lng: -73.947682}
]

let FiveTrainSouth = [
  {lat: 40.804406, lng: -73.937221},
  {lat: 40.779469, lng: -73.955841},
  {lat: 40.762996, lng: -73.967868},
  {lat: 40.752399, lng: -73.977470},
  {lat: 40.735291, lng: -73.991064}
]

let LocalDateTime = JSJoda.LocalDateTime;
let ChronoUnit = JSJoda.ChronoUnit;

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

    let snroutes = [];
    for(let i=0; i<SixTrainNorth.length; i++) {
      snroutes.push({
        lat: SixTrainNorth[i].lat,
        lng: SixTrainNorth[i].lng,
        departAt: LocalDateTime.now().plusSeconds(i*20)
      })
    }
    var sixicon = L.icon({
      iconUrl: 'img/6.png',
      iconSize: [35, 35],
    });
    new Train("6N", snroutes, mymap, sixicon);

    let fsroutes = [];
    for(let i=0; i<FiveTrainSouth.length; i++) {
      fsroutes.push({
        lat: FiveTrainSouth[i].lat,
        lng: FiveTrainSouth[i].lng,
        departAt: LocalDateTime.now().plusSeconds(i*35)
      })
    }
    var fiveicon = L.icon({
      iconUrl: 'img/5.png',
      iconSize: [35, 35],
    });
    new Train("5S", fsroutes, mymap, fiveicon);

}, false);
