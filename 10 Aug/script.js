let points = [];
let canvas = document.getElementById('drawingCanvas');
let context = canvas.getContext('2d');
let lastPoint = null;

document.getElementById('recordLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            points.push([longitude, latitude]);
            document.getElementById('jsonOutput').value = JSON.stringify(points, null, 2);

            // Convert geo coordinates to canvas coordinates
            let point = toCanvasCoords(longitude, latitude);
            drawPoint(point);

            if (lastPoint) {
                drawLine(lastPoint, point);
                let distance = turf.distance(turf.point(lastPoint), turf.point(point), { units: 'meters' });
                drawDistanceLabel(lastPoint, point, distance.toFixed(2));
            }
            lastPoint = point;
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
    drawLine(lastPoint, toCanvasCoords(points[0][0], points[0][1]));
    lastPoint = null;

    const polygon = turf.polygon([points]);
    const area = turf.area(polygon);
    document.getElementById('areaOutput').innerText = `Area: ${area.toFixed(2)} square meters`;
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
