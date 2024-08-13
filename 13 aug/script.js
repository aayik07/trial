let points = [];

// Function to draw the polygon on the canvas
function drawPolygon() {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    
    if (points.length < 3) return; // Not enough points to draw a polygon

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate bounds of the polygon
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach(([longitude, latitude]) => {
        if (longitude < minX) minX = longitude;
        if (longitude > maxX) maxX = longitude;
        if (latitude < minY) minY = latitude;
        if (latitude > maxY) maxY = latitude;
    });

    const polyWidth = maxX - minX;
    const polyHeight = maxY - minY;

    // Calculate scale and offset
    const scaleX = canvasWidth / polyWidth;
    const scaleY = canvasHeight / polyHeight;
    const scale = Math.min(scaleX, scaleY); // Use the smaller scale to fit the polygon

    const offsetX = (canvasWidth - (polyWidth * scale)) / 2 - (minX * scale);
    const offsetY = (canvasHeight - (polyHeight * scale)) / 2 - (minY * scale);

    // Clear previous drawings
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.strokeStyle = '#e880f1';
    ctx.fillStyle = 'rgba(232, 128, 241, 0.3)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo((points[0][0] * scale) + offsetX, (points[0][1] * scale) + offsetY);
    
    points.forEach(([longitude, latitude]) => {
        const x = (longitude * scale) + offsetX;
        const y = (latitude * scale) + offsetY;
        ctx.lineTo(x, y);
    });
    
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
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

    const polygon = turf.polygon([points]);
    const area = turf.area(polygon);

    // Display the area in square meters
    document.getElementById('areaOutput').innerText = `Area: ${area.toFixed(2)} square meters`;
});

// Event listener for clearing locations
document.getElementById('clearLocations').addEventListener('click', () => {
    points = [];
    document.getElementById('jsonOutput').value = '';
    document.getElementById('areaOutput').innerText = '';
    drawPolygon(); // Clear the drawing on the canvas
});
