let points = [];
let canvas = document.getElementById('drawingCanvas');
let context = canvas.getContext('2d');

// Record the user's current location
document.getElementById('recordLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            points.push([longitude, latitude]);
            document.getElementById('jsonOutput').value = JSON.stringify(points, null, 2);

            // Update canvas by redrawing all points and lines
            updateCanvasView();
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

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

// Convert longitude and latitude to canvas coordinates
function toCanvasCoords(lng, lat) {
    return [
        (lng + 180) * (canvas.width / 360),
        (90 - lat) * (canvas.height / 180)
    ];
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
        }
    }
}
