/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TrainSpeed = 100;

var Train = function () {
  function Train(name, route, map, icon) {
    var _this = this;

    _classCallCheck(this, Train);

    var firstStop = route.shift();
    this.id = name + "." + firstStop.departAt.toString();
    console.log("Creating new train", this.id);
    this.position = firstStop;
    this.nextStation = firstStop;
    this.route = route;
    this.atStation = true;
    this.marker = L.marker([this.position.lat, this.position.lng], { icon: icon }).addTo(map);
    this.intervalId = setInterval(function () {
      return _this.updateMarker();
    }, TrainSpeed);
  }

  _createClass(Train, [{
    key: "updateMarker",
    value: function updateMarker() {
      this.move();
      if (this.nextStation == null) {
        this.destroy();
      } else {
        var latlng = L.latLng(this.position.lat, this.position.lng);
        this.marker.setLatLng(latlng);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.marker.remove();
      clearInterval(this.intervalId);
    }
  }, {
    key: "move",
    value: function move() {
      var now = LocalDateTime.now();
      if (this.nextStation == null) {
        // do nothing
      } else if (this.atStation && this.nextStation.departAt.isAfter(LocalDateTime.now())) {} else if (this.atStation) {
        this.nextStation = this.route.shift();
        this.atStation = false;
        this.move();
      } else {
        var deltas = this.howFar();
        // if we are close enough, just move to the station
        if (deltas[0] == 0 && deltas[1] == 0) {
          this.atStation = true;
        } else {
          this.position = {
            lat: this.position.lat + deltas[0],
            lng: this.position.lng + deltas[1]
          };
        }
      }
    }
  }, {
    key: "howFar",
    value: function howFar() {
      var moves = LocalDateTime.now().until(this.nextStation.departAt.minusSeconds(5), ChronoUnit.MILLIS) / TrainSpeed;
      if (moves < 1) {
        moves = 1;
      }

      var deltaLat = (this.nextStation.lat - this.position.lat) / moves;
      var deltaLong = (this.nextStation.lng - this.position.lng) / moves;
      return [deltaLat, deltaLong];
    }
  }]);

  return Train;
}();

var SixTrainNorth = [{ lat: 40.746664, lng: -73.981891 }, { lat: 40.752402, lng: -73.977470 }, { lat: 40.757156, lng: -73.972160 }, { lat: 40.762845, lng: -73.967535 }, { lat: 40.762996, lng: -73.967868 }, { lat: 40.768144, lng: -73.963872 }, { lat: 40.773522, lng: -73.959746 }, { lat: 40.779462, lng: -73.955830 }, { lat: 40.785683, lng: -73.950927 }, { lat: 40.790192, lng: -73.947682 }];

var SixTrainSouth = [{ lat: 40.790192, lng: -73.947682 }, { lat: 40.785683, lng: -73.950927 }, { lat: 40.779462, lng: -73.955830 }, { lat: 40.773522, lng: -73.959746 }, { lat: 40.768144, lng: -73.963872 }, { lat: 40.762996, lng: -73.967868 }, { lat: 40.762845, lng: -73.967535 }, { lat: 40.757156, lng: -73.972160 }, { lat: 40.752402, lng: -73.977470 }, { lat: 40.746664, lng: -73.981891 }];

var FFTrainSouth = [{ lat: 40.804406, lng: -73.937221 }, { lat: 40.779469, lng: -73.955841 }, { lat: 40.762996, lng: -73.967868 }, { lat: 40.752402, lng: -73.977470 }, { lat: 40.735291, lng: -73.991064 }];

var FFTrainNorth = [{ lat: 40.735291, lng: -73.991064 }, { lat: 40.752402, lng: -73.977470 }, { lat: 40.762996, lng: -73.967868 }, { lat: 40.779469, lng: -73.955841 }, { lat: 40.804406, lng: -73.937221 }];

var LocalDateTime = JSJoda.LocalDateTime;
var ChronoUnit = JSJoda.ChronoUnit;

var sixtrain = function sixtrain(map) {
  var icon = L.icon({
    iconUrl: 'img/6.png',
    iconSize: [35, 35]
  });
  var route = SixTrainNorth;
  if (Math.random() > 0.5) {
    route = SixTrainSouth;
  }
  var stops = [];
  for (var i = 0; i < route.length; i++) {
    stops.push({
      lat: route[i].lat,
      lng: route[i].lng,
      departAt: LocalDateTime.now().plusSeconds(i * 35)
    });
  }
  new Train("6S", stops, map, icon);
  setTimeout(function () {
    return fftrain(map);
  }, 120000);
};

var fftrain = function fftrain(map) {
  var icon = L.icon({
    iconUrl: 'img/4.png',
    iconSize: [35, 35]
  });
  if (Math.random() > 0.5) {
    icon = L.icon({
      iconUrl: 'img/5.png',
      iconSize: [35, 35]
    });
  }
  var route = FFTrainSouth;
  if (Math.random() > 0.5) {
    route = FFTrainNorth;
  }
  var stops = [];
  for (var i = 0; i < route.length; i++) {
    stops.push({
      lat: route[i].lat,
      lng: route[i].lng,
      departAt: LocalDateTime.now().plusSeconds(i * 35)
    });
  }
  new Train("5S", stops, map, icon);
  setTimeout(function () {
    return fftrain(map);
  }, 60000);
};

document.addEventListener('DOMContentLoaded', function () {
  var mymap = L.map('mapid', {
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

/***/ })
/******/ ]);
//# sourceMappingURL=main.bundle.js.map