// Initialize the map
const map = L.map('map').setView([34.083656, 74.797371], 13); // srinagar

// Add the OpenStreetMap tile layer
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22 // Set the maximum zoom level for OpenStreetMap
}).addTo(map);

// Add the satellite tile layer
const satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFoaWx0YXJpcTA3IiwiYSI6ImNseXpidnY0bjIwZHoyaXFzYXp6ODR3aHEifQ.30ZOn7h2x37GKsGbO3AHLg', {
    attribution: 'Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 22 // Set the maximum zoom level for Mapbox Satellite
});

let satelliteView = false;

// Locate button event listener
document.getElementById('locate-button').addEventListener('click', () => {
    map.locate({ setView: true, maxZoom: 22 }); // Set maximum zoom level when locating
});

// Toggle satellite view event listener
document.getElementById('toggle-satellite').addEventListener('click', () => {
    if (satelliteView) {
        map.removeLayer(satelliteLayer);
        map.addLayer(osmLayer);
    } else {
        map.removeLayer(osmLayer);
        map.addLayer(satelliteLayer);
    }
    satelliteView = !satelliteView;
});

// On location found event
map.on('locationfound', (e) => {
    const radius = e.accuracy / 2;
    L.marker(e.latlng).addTo(map)
});

// On location error event
map.on('locationerror', (e) => {
    alert(e.message);
});

// Add Leaflet Draw controls
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polygon: {
            shapeOptions: {
                color: '#bada55'
            },
            icon: new L.DivIcon({
                iconSize: new L.Point(10, 10),
                className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
            })
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false
    }
});
map.addControl(drawControl);

// Finish polygon button event listener
document.getElementById('finish-polygon').addEventListener('click', () => {
    if (drawingLayer) {
        const latlngs = drawingLayer.getLatLngs()[0];
        const coordinates = latlngs.map(latlng => [latlng.lng, latlng.lat]);
        coordinates.push(coordinates[0]); // Close the polygon
        const polygon = turf.polygon([coordinates]);
        const area = turf.area(polygon);

        // Update the text area with the calculated area
        document.getElementById('info').value = `Last Polygon Area: ${area.toFixed(2)} square meters`;

        // Add tooltips for distances between points
        for (let i = 0; i < latlngs.length; i++) {
            const from = latlngs[i];
            const to = latlngs[(i + 1) % latlngs.length];
            const distance = from.distanceTo(to).toFixed(2);
            const midPoint = L.latLng((from.lat + to.lat) / 2, (from.lng + to.lng) / 2);
            const tooltip = L.tooltip({
                permanent: true,
                direction: 'center',
                className: 'distance-tooltip'
            })
            .setContent(`${distance} meters`)
            .setLatLng(midPoint)
            .addTo(map);
            tooltips.push(tooltip);
        }

        // Add the finalized polygon to the drawn items layer
        drawnItems.addLayer(drawingLayer);
        drawingLayer = null;
    }
});

let drawingLayer;
let tooltips = [];

map.on('draw:drawstart', (e) => {
    if (drawingLayer) {
        map.removeLayer(drawingLayer);
    }
    tooltips.forEach(tooltip => map.removeLayer(tooltip));
    tooltips = [];
    document.getElementById('info').value = ''; // Clear the text area
});

map.on('draw:created', (e) => {
    const type = e.layerType;
    const layer = e.layer;
    if (type === 'polygon') {
        drawingLayer = layer;
        drawingLayer.addTo(map); // Keep the polygon visible
    }
});

map.on('draw:deleted', (e) => {
    tooltips.forEach(tooltip => map.removeLayer(tooltip));
    tooltips = [];
    document.getElementById('info').value = ''; // Clear the text area
});
