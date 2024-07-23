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

var TrainSpeed = 2000;

var Train = function () {
  function Train(data, map) {
    var _this = this;

    _classCallCheck(this, Train);

    this.updateData(data);

    // initially put the train at the known coords of stop
    if (this.lastStop) {
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
    var icon = L.divIcon({ className: "train-marker train-marker-" + data.track });
    this.marker = L.marker([this.position.lat, this.position.lng], { icon: icon }).addTo(map);
    this.intervalId = setInterval(function () {
      return _this.updateMarker();
    }, TrainSpeed);
  }

  _createClass(Train, [{
    key: "updateData",
    value: function updateData(update) {
      this.stop = update.stop;
      this.nextStop = update.next_stop;
      this.lastStop = update.last_stop;
      this.status = update.status;
      this.id = update.id;
    }
  }, {
    key: "atStation",
    value: function atStation() {
      this.status == "STOPPED_AT";
    }
  }, {
    key: "updateMarker",
    value: function updateMarker() {
      this.move();
      var latlng = L.latLng(this.position.lat, this.position.lng);
      this.marker.setLatLng(latlng);
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
      var now = Math.round(new Date() / 1000);
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
  }, {
    key: "updatePosition",
    value: function updatePosition(now, when) {
      var deltas = this.howFar(now, when);
      // if we are close enough, just move to the station
      if (deltas[0] == 0 && deltas[1] == 0) {
        this.status == "STOPPED_AT";
      } else {
        this.position = {
          lat: this.position.lat + deltas[0],
          lng: this.position.lng + deltas[1]
        };
      }
    }
  }, {
    key: "howFar",
    value: function howFar(now, when) {
      // times are in seconds
      var moves = (when - now) / (TrainSpeed / 1000);
      if (moves < 1) {
        moves = 1;
      }

      var deltaLat = (this.stop.lat - this.position.lat) / moves;
      var deltaLng = (this.stop.lng - this.position.lng) / moves;
      return [deltaLat, deltaLng];
    }
  }]);

  return Train;
}();

var trains = {};

var getTrains = function getTrains(map) {
  fetch("https://s3.amazonaws.com/wibitty.com/js/gtfs.json").then(function (resp) {
    return resp.json();
  }).then(function (update) {
    Object.keys(update).forEach(function (key) {
      var train = update[key];
      if (trains[train.id]) {
        trains[train.id].updateData(train);
      } else {
        trains[train.id] = new Train(train, map);
      }
    });

    // delete train if no longer in update
    Object.keys(trains).forEach(function (key) {
      if (!update[key]) {
        trains[key].destroy();
        delete trains[key];
      }
    });
  });
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

  getTrains(mymap);
  setInterval(function () {
    return getTrains(mymap);
  }, 30000);
}, false);

/***/ })
/******/ ]);
//# sourceMappingURL=main.bundle.js.map