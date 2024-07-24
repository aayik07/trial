// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add the OpenStreetMap tile layer
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add the Google Maps satellite tile layer
const googleSatLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: 'Imagery © <a href="https://www.google.com/maps">Google Maps</a>'
});

let satelliteView = false;

// Locate button event listener
document.getElementById('locate-button').addEventListener('click', () => {
    map.locate({ setView: true, maxZoom: 16 });
});

// Toggle satellite view event listener
document.getElementById('toggle-satellite').addEventListener('click', () => {
    if (satelliteView) {
        map.removeLayer(googleSatLayer);
        map.addLayer(osmLayer);
    } else {
        map.removeLayer(osmLayer);
        map.addLayer(googleSatLayer);
    }
    satelliteView = !satelliteView;
});

// On location found event
map.on('locationfound', (e) => {
    const radius = e.accuracy / 2;
    L.marker(e.latlng).addTo(map)
        .bindPopup(`You are within ${radius} meters from this point`).openPopup();
    L.circle(e.latlng, radius).addTo(map);
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
        featureGroup: drawnItems,
        poly: {
            shapeOptions: {
                color: '#3388ff',
                weight: 4
            },
            icon: new L.DivIcon({
                iconSize: new L.Point(8, 8),
                className: 'leaflet-div-icon leaflet-editing-icon'
            })
        }
    },
    draw: {
        polygon: {
            shapeOptions: {
                color: '#3388ff',
                weight: 4
            },
            showArea: true,
            metric: true,
            icon: new L.DivIcon({
                iconSize: new L.Point(8, 8),
                className: 'leaflet-div-icon leaflet-editing-icon'
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
    map.fire('draw:created', { layerType: 'polygon', layer: drawingLayer });
});

let drawingLayer;
map.on('draw:drawstart', (e) => {
    if (drawingLayer) {
        map.removeLayer(drawingLayer);
    }
});

map.on('draw:created', (e) => {
    const type = e.layerType;
    const layer = e.layer;
    if (type === 'polygon') {
        drawnItems.addLayer(layer);
        drawingLayer = layer;

        // Calculate the area of the polygon using Turf.js
        const latlngs = layer.getLatLngs()[0];
        const coordinates = latlngs.map(latlng => [latlng.lng, latlng.lat]);
        coordinates.push(coordinates[0]); // Close the polygon
        const polygon = turf.polygon([coordinates]);
        const area = turf.area(polygon);

        // Update the text area with the calculated area
        document.getElementById('info').value = `Last Polygon Area: ${area.toFixed(2)} square meters`;

        // Calculate and display distances between points
        for (let i = 0; i < latlngs.length; i++) {
            const start = latlngs[i];
            const end = latlngs[(i + 1) % latlngs.length];
            const distance = start.distanceTo(end);

            // Create a polyline to display the distance
            const polyline = L.polyline([start, end], { color: 'blue' }).addTo(map);

            // Add the distance label
            const midPoint = L.latLng(
                (start.lat + end.lat) / 2,
                (start.lng + end.lng) / 2
            );
            L.marker(midPoint, {
                icon: L.divIcon({
                    className: 'distance-label',
                    html: `${distance.toFixed(2)} m`
                })
            }).addTo(map);
        }
    }
});
