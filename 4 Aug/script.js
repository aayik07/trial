let points = [];

document.getElementById('recordLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            points.push({ lat: latitude, lng: longitude });
            document.getElementById('jsonOutput').value = JSON.stringify(points, null, 2);
        }, 
        error => {
            console.error(error);
            alert('Unable to retrieve location. Please try again.');
        }, 
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

document.getElementById('createPolygon').addEventListener('click', () => {
    const canvas = document.getElementById('polygonCanvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length > 1) {
        context.beginPath();
        const startPoint = points[0];
        context.moveTo(scaleX(startPoint.lng), scaleY(startPoint.lat));

        points.forEach(point => {
            context.lineTo(scaleX(point.lng), scaleY(point.lat));
        });

        context.lineTo(scaleX(startPoint.lng), scaleY(startPoint.lat));
        context.strokeStyle = '#FF0000';
        context.stroke();
        context.closePath();
    }
});

function scaleX(lng) {
    const canvas = document.getElementById('polygonCanvas');
    return (lng + 180) * (canvas.width / 360);
}

function scaleY(lat) {
    const canvas = document.getElementById('polygonCanvas');
    return (90 - lat) * (canvas.height / 180);
}
