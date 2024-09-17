let points = [];

document.getElementById('recordLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude, accuracy } = position.coords;
            
            if (accuracy > 10) {
                alert('GPS signal is weak. Please try again for more accurate readings.');
                return;
            }

            const newPoint = [longitude, latitude];
            
            // Only add the point if it's significantly far from the last point
            if (points.length > 0) {
                const lastPoint = points[points.length - 1];
                const distance = turf.distance(lastPoint, newPoint);
                if (distance < 5) {  // Only record if the distance is greater than 5 meters
                    alert('Too close to the previous point. Move further to record.');
                    return;
                }
            }

            console.log(`Recorded point: ${latitude}, ${longitude} with accuracy: ${accuracy} meters`);
            points.push(newPoint);
            document.getElementById('jsonOutput').value = JSON.stringify(points, null, 2);
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
