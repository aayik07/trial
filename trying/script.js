let points = [];

document.getElementById('recordLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            console.log(`Recorded point: ${latitude}, ${longitude}`);
            points.push([longitude, latitude]);
            document.getElementById('jsonOutput').value = JSON.stringify(points, null, 2);
        }, 
        error => {
            console.error("Geolocation error:", error);
            alert("Could not retrieve accurate location. Please try again.");
        }, 
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

document.getElementById('calculateArea').addEventListener('click', () => {
    if (points.length < 3) {
        alert('Need at least 3 points to form a polygon.');
        return;
    }

    // Ensure the polygon is closed by re-adding the first point if necessary
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        points.push(firstPoint);
    }

    // Calculate geodesic area using Turf.js
    const polygon = turf.polygon([points]);
    const area = turf.area(polygon);

    // Display the area in square meters
    document.getElementById('areaOutput').innerText = `Area: ${area.toFixed(2)} square meters`;
});

function toggleMenu() {
    document.querySelector('.navbar').classList.toggle('active');
}
