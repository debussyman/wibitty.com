let TrainSpeed = 100;

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
      // do nothing
    } else if (this.atStation && this.nextStation.departAt.isAfter(LocalDateTime.now())) {
    } else if (this.atStation) {
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

let SixTrainSouth = [
  {lat: 40.790192, lng: -73.947682},
  {lat: 40.785683, lng: -73.950927},
  {lat: 40.779462, lng: -73.955830},
  {lat: 40.773522, lng: -73.959746},
  {lat: 40.768144, lng: -73.963872},
  {lat: 40.762996, lng: -73.967868},
  {lat: 40.762845, lng: -73.967535},
  {lat: 40.757156, lng: -73.972160},
  {lat: 40.752402, lng: -73.977470},
  {lat: 40.746664, lng: -73.981891}
]

let FFTrainSouth = [
  {lat: 40.804406, lng: -73.937221},
  {lat: 40.779469, lng: -73.955841},
  {lat: 40.762996, lng: -73.967868},
  {lat: 40.752402, lng: -73.977470},
  {lat: 40.735291, lng: -73.991064}
]

let FFTrainNorth = [
  {lat: 40.735291, lng: -73.991064},
  {lat: 40.752402, lng: -73.977470},
  {lat: 40.762996, lng: -73.967868},
  {lat: 40.779469, lng: -73.955841},
  {lat: 40.804406, lng: -73.937221}
]

let LocalDateTime = JSJoda.LocalDateTime;
let ChronoUnit = JSJoda.ChronoUnit;

let sixtrain = (map) => {
  let icon = L.icon({
    iconUrl: 'img/6.png',
    iconSize: [35, 35],
  });
  let route = SixTrainNorth;
  if (Math.random() > 0.5) {
    route = SixTrainSouth;
  }
  let stops = [];
  for(let i=0; i<route.length; i++) {
    stops.push({
      lat: route[i].lat,
      lng: route[i].lng,
      departAt: LocalDateTime.now().plusSeconds(i*35)
    })
  }
  new Train("6S", stops, map, icon);
  setTimeout(() => fftrain(map), 120000);
}

let fftrain = (map) => {
  let icon = L.icon({
    iconUrl: 'img/4.png',
    iconSize: [35, 35],
  });
  if (Math.random() > 0.5) {
    icon = L.icon({
      iconUrl: 'img/5.png',
      iconSize: [35, 35],
    });
  }
  let route = FFTrainSouth;
  if (Math.random() > 0.5) {
    route = FFTrainNorth;
  }
  let stops = [];
  for(let i=0; i<route.length; i++) {
    stops.push({
      lat: route[i].lat,
      lng: route[i].lng,
      departAt: LocalDateTime.now().plusSeconds(i*35)
    })
  }
  new Train("5S", stops, map, icon);
  setTimeout(() => fftrain(map), 60000);
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

    sixtrain(mymap);
    fftrain(mymap);
}, false);
