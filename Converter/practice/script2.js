// Initialize the map
const map = L.map('map').setView([34.083656, 74.797371], 13);

// Add the OpenStreetMap tile layer
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22 // Set the maximum zoom level for OpenStreetMap
}).addTo(map);
