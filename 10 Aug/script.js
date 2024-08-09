let points = [];
let canvas = document.getElementById('drawingCanvas');
let context = canvas.getContext('2d');
let lastPoint = null;
let bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

document.getElementById('recordLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            points.push([longitude, latitude]);
            document.getElementById('jsonOutput').value = JSON.stringify(points, null, 2);

            // Convert geo coordinates to canvas coordinates
            let point = toCanvasCoords(longitude, latitude);
            updateBounds(point);
            drawPoint(point);

            if (lastPoint) {
                drawLine(lastPoint, point);
                let distance = turf.distance(turf.point(lastPoint), turf.point(point), { units: 'meters' });
                drawDistanceLabel(lastPoint, point, distance.toFixed(2));
            }
            lastPoint = point;
            adjustCanvas();
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

document.getElementById('calculateArea').addEventListener('click', () => {
    if (points.length < 3) {
        alert('Need at least 3 points to form a polygon.');
        return;
    }

    const polygon = turf.polygon([points]);
    const area = turf.area(polygon);
    document.getElementById('areaOutput').innerText = `Area: ${area.toFixed(2)} square meters`;
});

document.getElementById('finishPolygon').addEventListener('click', () => {
    if (points.length < 3) {
        alert('Need at least 3 points to form a polygon.');
        return;
    }

    // Close the polygon by drawing the final line
    let firstPoint = toCanvasCoords(points[0][0], points[0][1]);
    drawLine(lastPoint, firstPoint);
    lastPoint = null;

    const polygon = turf.polygon([points]);
    const area = turf.area(polygon);
    document.getElementById('areaOutput').innerText = `Area: ${area.toFixed(2)} square meters`;

    adjustCanvas();
});

function toCanvasCoords(lng, lat) {
    return [
        (lng + 180) * (canvas.width / 360),
        (90 - lat) * (canvas.height / 180)
    ];
}

function drawPoint(point) {
    context.beginPath();
    context.arc(point[0], point[1], 5, 0, 2 * Math.PI);
    context.fillStyle = '#FF0000';
    context.fill();
}

function drawLine(start, end) {
    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.strokeStyle = '#0000FF';
    context.stroke();
}

function drawDistanceLabel(start, end, distance) {
    let midPoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
    context.fillStyle = '#000000';
    context.font = '12px Arial';
    context.fillText(`${distance} m`, midPoint[0], midPoint[1]);
}

function updateBounds(point) {
    bounds.minX = Math.min(bounds.minX, point[0]);
    bounds.minY = Math.min(bounds.minY, point[1]);
    bounds.maxX = Math.max(bounds.maxX, point[0]);
    bounds.maxY = Math.max(bounds.maxY, point[1]);
}

function adjustCanvas() {
    let margin = 20; // Margin around the polygon
    let width = bounds.maxX - bounds.minX;
    let height = bounds.maxY - bounds.minY;

    let scaleX = (canvas.width - 2 * margin) / width;
    let scaleY = (canvas.height - 2 * margin) / height;
    let scale = Math.min(scaleX, scaleY);

    let offsetX = (canvas.width - width * scale) / 2 - bounds.minX * scale;
    let offsetY = (canvas.height - height * scale) / 2 - bounds.minY * scale;

    context.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    redrawPolygon();
}

function redrawPolygon() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (points.length > 0) {
        let firstPoint = toCanvasCoords(points[0][0], points[0][1]);
        drawPoint(firstPoint);
        lastPoint = firstPoint;
    }

    for (let i = 1; i < points.length; i++) {
        let point = toCanvasCoords(points[i][0], points[i][1]);
        drawPoint(point);
        drawLine(lastPoint, point);
        let distance = turf.distance(turf.point(lastPoint), turf.point(point), { units: 'meters' });
        drawDistanceLabel(lastPoint, point, distance.toFixed(2));
        lastPoint = point;
    }

    if (points.length > 2) {
        drawLine(lastPoint, toCanvasCoords(points[0][0], points[0][1]));
    }
}
