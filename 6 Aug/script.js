let points = [];

document.getElementById('recordLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            console.log(`Recorded point: ${latitude}, ${longitude}`);
            points.push({ lat: latitude, lng: longitude });
            document.getElementById('jsonOutput').value = JSON.stringify(points, null, 2);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

document.getElementById('createPolygon').addEventListener('click', () => {
    if (points.length < 3) {
        alert('Need at least 3 points to create a polygon.');
        return;
    }

    const canvas = document.getElementById('polygonCanvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();
    const startPoint = points[0];
    context.moveTo(scaleX(startPoint.lng), scaleY(startPoint.lat));

    points.forEach(point => {
        console.log(`Drawing line to: ${point.lat}, ${point.lng}`);
        context.lineTo(scaleX(point.lng), scaleY(point.lat));
    });

    context.lineTo(scaleX(startPoint.lng), scaleY(startPoint.lat));
    context.strokeStyle = '#FF0000';
    context.stroke();
    context.closePath();
    console.log('Polygon created successfully.');
});

function scaleX(lng) {
    const canvas = document.getElementById('polygonCanvas');
    return (lng + 180) * (canvas.width / 360);
}

function scaleY(lat) {
    const canvas = document.getElementById('polygonCanvas');
    return (90 - lat) * (canvas.height / 180);
}
