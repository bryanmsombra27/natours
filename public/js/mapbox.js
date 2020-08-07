/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1Ijoia29zb2syb28yIiwiYSI6ImNrZGFtbDhhdTAzOXAyc3F0OXAzbjYyaXIifQ.alr_hiO4ybCu1aus17ANHQ';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/kosok2oo2/ckdan0n6f1c5h1imgo8mlgd6r', // stylesheet location
  // center: [-118.113491, 34.111745], // starting position [lng, lat]
  // zoom: 10, // starting zoom
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  //add marker
  const el = document.createElement('div');
  el.className = 'marker';

  new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
    .setLngLat(loc.coordinates)
    .addTo(map);

  //add popup
  new mapboxgl.Popup({
      offset: 30,
    })
    .setLngLat(loc.coordinates)
    .setHTML(
      `
        <p>Day ${loc.day}: ${loc.description}</p>
    `
    )
    .addTo(map);

  //extends map bounds  to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});


/////////////////////// ///////////////////////// //////////////////////
///PAYMENTS stripe.js