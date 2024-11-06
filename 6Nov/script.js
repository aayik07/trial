let points = [];

document.getElementById('recordLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude, accuracy } = position.coords;

            if (accuracy > 10) {  // If accuracy is more than 10 meters, it might be too inaccurate
                alert('GPS signal is weak. Please try again for more accurate readings.');
                return;
            }

            console.log(`Recorded point: ${latitude}, ${longitude} with accuracy: ${accuracy} meters`);
            points.push([longitude, latitude]);
            document.getElementById('jsonOutput').value = JSON.stringify(points, null, 2);
        }, error => {
            console.error('Error obtaining location', error);
            alert('Error getting location, please try again.');
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
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

    // Close the polygon by repeating the first point at the end
    points.push(points[0]);

    const polygon = turf.polygon([points]);
    const area = turf.area(polygon); // Turf.js's area calculation on spherical Earth

    // Display the area in square meters
    document.getElementById('areaOutput').innerText = `Area: ${area.toFixed(2)} square meters`;
});

function toggleMenu() {
    document.querySelector('.navbar').classList.toggle('active');
}
