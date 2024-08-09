let points = [];
let canvas = document.getElementById('drawingCanvas');
let context = canvas.getContext('2d');
let lastPoint = null;

// Record the user's current location
document.getElementById('recordLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            points.push([longitude, latitude]);
            document.getElementById('jsonOutput').value = JSON.stringify(points, null, 2);

            // Draw point on canvas
            let point = toCanvasCoords(longitude, latitude);
            drawPoint(point);

            if (lastPoint) {
                drawLine(lastPoint, point);
                let distance = turf.distance(turf.point(lastPoint), turf.point(point), { units: 'meters' });
                drawDistanceLabel(lastPoint, point, distance.toFixed(2));
            }
            lastPoint = point;

            // Update canvas view and adjust zoom
            updateCanvasView();
            fitToPolygon();
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Calculate the area of the polygon
document.getElementById('calculateArea').addEventListener('click', () => {
    if (points.length < 3) {
        alert('Need at least 3 points to form a polygon.');
        return;
    }

    const polygon = turf.polygon([points]);
    const area = turf.area(polygon);
    document.getElementById('areaOutput').innerText = `Area: ${area.toFixed(2)} square meters`;
});

// Finish the polygon by closing it
document.getElementById('finishPolygon').addEventListener('click', () => {
    if (points.length < 3) {
        alert('Need at least 3 points to form a polygon.');
        return;
    }

    // Close the polygon by drawing the final line
    let firstPoint = toCanvasCoords(points[0][0], points[0][1]);
    drawLine(lastPoint, firstPoint);

    const polygon = turf.polygon([points]);
    const area = turf.area(polygon);
    document.getElementById('areaOutput').innerText = `Area: ${area.toFixed(2)} square meters`;

    lastPoint = null; // Reset lastPoint to stop drawing new lines
});

// Convert longitude and latitude to canvas coordinates
function toCanvasCoords(lng, lat) {
    return [
        (lng + 180) * (canvas.width / 360),
        (90 - lat) * (canvas.height / 180)
    ];
}

// Draw a point on the canvas
function drawPoint(point) {
    context.beginPath();
    context.arc(point[0], point[1], 5, 0, 2 * Math.PI);
    context.fillStyle = '#FF0000';
    context.fill();
}

// Draw a line between two points on the canvas
function drawLine(start, end) {
    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.strokeStyle = '#0000FF';
    context.stroke();
}

// Draw a label with the distance between two points
function drawDistanceLabel(start, end, distance) {
    let midPoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
    context.fillStyle = '#000000';
    context.font = '12px Arial';
    context.fillText(`${distance} m`, midPoint[0], midPoint[1]);
}

// Update the canvas view by redrawing all points and lines
function updateCanvasView() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < points.length; i++) {
        let point = toCanvasCoords(points[i][0], points[i][1]);
        drawPoint(point);

        if (i > 0) {
            let prevPoint = toCanvasCoords(points[i - 1][0], points[i - 1][1]);
            drawLine(prevPoint, point);
            let distance = turf.distance(turf.point(points[i - 1]), turf.point(points[i]), { units: 'meters' });
            drawDistanceLabel(prevPoint, point, distance.toFixed(2));
        }
    }

    // Optionally, close the polygon if all points are recorded
    if (points.length > 2) {
        let firstPoint = toCanvasCoords(points[0][0], points[0][1]);
        let lastPoint = toCanvasCoords(points[points.length - 1][0], points[points.length - 1][1]);
        drawLine(lastPoint, firstPoint);
    }
}

// Adjust the canvas zoom to fit the entire polygon
function fitToPolygon() {
    if (points.length > 0) {
        let lats = points.map(p => p[1]);
        let lngs = points.map(p => p[0]);

        let minLat = Math.min(...lats);
        let maxLat = Math.max(...lats);
        let minLng = Math.min(...lngs);
        let maxLng = Math.max(...lngs);

        let padding = 10; // Padding around the polygon
        let scale = Math.min(
            canvas.width / (maxLng - minLng + padding),
            canvas.height / (maxLat - minLat + padding)
        );

        context.setTransform(scale, 0, 0, scale, padding, padding);
    }
}
