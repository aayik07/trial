const points = [];
let minX, maxX, minY, maxY;

const drawSvg = SVG().addTo('#drawingSvg').size('100%', '100%');

// Function to convert latitude and longitude to SVG coordinates
function convertCoords(longitude, latitude, scale, offsetX, offsetY) {
    return [
        (longitude - minX) * scale + offsetX,
        (maxY - latitude) * scale + offsetY
    ];
}

// Function to calculate the distance between two points in SVG pixels
function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Function to draw the polygon and distances
function drawPolygon() {
    if (points.length < 2) return; // Need at least 2 points to draw lines

    // Calculate bounds of the polygon
    minX = Infinity; maxX = -Infinity; minY = Infinity; maxY = -Infinity;
    points.forEach(([longitude, latitude]) => {
        if (longitude < minX) minX = longitude;
        if (longitude > maxX) maxX = longitude;
        if (latitude < minY) minY = latitude;
        if (latitude > maxY) maxY = latitude;
    });

    const polyWidth = maxX - minX;
    const polyHeight = maxY - minY;

    // Calculate scale and offset
    const canvasWidth = drawSvg.width();
    const canvasHeight = drawSvg.height();
    const scaleX = canvasWidth / polyWidth;
    const scaleY = canvasHeight / polyHeight;
    const scale = Math.min(scaleX, scaleY); // Use the smaller scale to fit the polygon

    const offsetX = (canvasWidth - (polyWidth * scale)) / 2 - (minX * scale);
    const offsetY = (canvasHeight - (polyHeight * scale)) / 2 - (minY * scale);

    // Clear previous drawings
    drawSvg.clear();

    // Draw the polygon
    const pathData = points.concat([points[0]]).map(([lon, lat]) => {
        const [x, y] = convertCoords(lon, lat, scale, offsetX, offsetY);
        return [x, y];
    }).reduce((acc, [x, y], i) => {
        return acc + (i === 0 ? 'M' : 'L') + `${x},${y}`;
    }, '');

    drawSvg.path(pathData)
        .fill('rgba(232, 128, 241, 0.3)')
        .stroke({ color: '#e880f1', width: 2 });

    // Draw distances
    points.forEach(([longitude, latitude], index) => {
        if (index > 0) {
            const [prevX, prevY] = convertCoords(points[index - 1][0], points[index - 1][1], scale, offsetX, offsetY);
            const [x, y] = convertCoords(longitude, latitude, scale, offsetX, offsetY);
            const distance = calculateDistance(prevX, prevY, x, y).toFixed(2);

            if (!isNaN(distance)) {
                drawSvg.text(`${distance} px`)
                    .move((prevX + x) / 2, (prevY + y) / 2 - 10)
                    .fill('#e880f1');
            }
        }
    });

    // Draw distance for the last segment
    if (points.length > 1) {
        const [lastX, lastY] = convertCoords(points[0][0], points[0][1], scale, offsetX, offsetY);
        const [startX, startY] = convertCoords(points[points.length - 1][0], points[points.length - 1][1], scale, offsetX, offsetY);
        const lastDistance = calculateDistance(startX, startY, lastX, lastY).toFixed(2);

        if (!isNaN(lastDistance)) {
            drawSvg.text(`${lastDistance} px`)
                .move((lastX + startX) / 2, (lastY + startY) / 2 - 10)
                .fill('#e880f1');
        }
    }
}

// Event listener for recording location
document.getElementById('recordLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            console.log(`Recorded point: ${latitude}, ${longitude}`);
            points.push([longitude, latitude]);
            document.getElementById('jsonOutput').value = JSON.stringify(points, null, 2);
            drawPolygon(); // Draw the polygon whenever a new point is recorded
        }, error => {
            console.error(error);
            alert('Error retrieving location. Please try again.');
        }, {
            enableHighAccuracy: true
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Event listener for calculating area
document.getElementById('calculateArea').addEventListener('click', () => {
    if (points.length < 3) {
        alert('Need at least 3 points to form a polygon.');
        return;
    }

    // Close the polygon by repeating the first point at the end
    points.push(points[0]);

    // Calculate the area using Turf.js
    const polygon = turf.polygon([points]);
    const area = turf.area(polygon);

    // Display the area in square meters
    document.getElementById('areaOutput').innerText = `Area: ${area.toFixed(2)} square meters`;
});

// Event listener for clearing locations
document.getElementById('clearLocations').addEventListener('click', () => {
    points.length = 0;
    document.getElementById('jsonOutput').value = '';
    document.getElementById('areaOutput').innerText = '';
    drawPolygon(); // Clear the drawing on the SVG
});
