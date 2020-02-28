// import the awesomeness
import 'leaflet';
import 'leaflet-realtime';
import './style.css';

// Function to set marker color based on magnitude using a ternary operator
function getColor(mag){
  return mag > 5 ? "#d73027":
      mag > 4 ? "#fc8d59" :
      mag > 3 ? "#fee08b":
      mag > 2 ? "#d9ef8b":
      mag > 1 ? "#91cf60":
      "#1a9850";
}

function createCircleMarker(feature, latlng) {
  let options = {
    radius: feature.properties.mag * 4,
    fillColor: getColor(feature.properties.mag),
    color: "black",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.6
  }
  return L.circleMarker(latlng, options);

}

function createRealtimeLayer(url, container) {
  return L.realtime(url, {
    interval: 60 * 1000,
    getFeatureId: function (f) {
      // required for L.Realtime to track which feature is which
      // over consecutive data requests. We setthe url as id so that all features are shown on the map. If we set the id as feauture.id than the newset point would replace the old pne.
      return f.properties.url;
    },
    cache: true,
    container: container,
    pointToLayer: createCircleMarker,
    onEachFeature(f, l) {
      l.bindPopup(function () {
        return '<h3>' + f.properties.place + '</h3>' +
          '<p>' + new Date(f.properties.time) +
          '<br/>Magnitude: <strong>' + f.properties.mag + '</strong></p>' +
          '<p><a href="' + f.properties.url + '">More information</a></p>';
      });
    }
  });
}

// initialize the awesome map
var map = L.map('map');

var subgroup1 = L.geoJson();
var subgroup2 = L.geoJson();

var realtime1 = createRealtimeLayer('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', subgroup1).addTo(map)
var realtime2 = createRealtimeLayer('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson', subgroup2);


var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
});




// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Satellite": Esri_WorldImagery,
  "Grayscale": CartoDB_Positron,
  "voyager": CartoDB_Voyager
};

var overlayMaps = {
  'Earthquakes 2.5+': realtime1,
  'Last 2 daysEarthquakes': realtime2
};

L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(map);

realtime1.once('update', function () {
  map.fitBounds(realtime1.getBounds(), { maxZoom: 3 });
});


// Create a legend to display information in the bottom right
var legend = L.control({position: 'bottomright'});

legend.onAdd = function(map) {

  var div = L.DomUtil.create('div','info legend'),
      magnitudes = [0,1,2,3,4,5],
      labels = [];

  div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>" 
  // loop through our density intervals and generate a label for each interval
  for (var i=0; i < magnitudes.length; i++){
    div.innerHTML +=
      '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
      magnitudes[i] + (magnitudes[i+1]?'&ndash;' + magnitudes[i+1] +'<br>': '+');
    }
    return div;
};
legend.addTo(map);




