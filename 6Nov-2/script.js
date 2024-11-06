let points = []; // Array to store points (latitude, longitude)
const gridContainer = document.getElementById('gridContainer');
const addMoreButton = document.getElementById('addMore');
const calculateButton = document.getElementById('calculateArea');
const areaOutput = document.getElementById('areaOutput');

// Function to record user location and add it to the grid
addMoreButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            points.push([longitude, latitude]);

            // Create a new Edge box with recorded latitude and longitude
            const edgeDiv = document.createElement('div');
            edgeDiv.className = 'grid-item';
            edgeDiv.innerHTML = `Edge ${points.length}<br><span class="latlong">${latitude.toFixed(4)}<br>${longitude.toFixed(4)}</span>`;
            gridContainer.appendChild(edgeDiv);

            // Check if there are at least 3 points to enable Calculate button
            if (points.length >= 3) {
                calculateButton.style.display = 'block';
            }
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Function to calculate and display area
calculateButton.addEventListener('click', () => {
    if (points.length < 3) {
        alert('Need at least 3 points to form a polygon.');
        return;
    }

    // Close the polygon by repeating the first point at the end
    points.push(points[0]);

    const polygon = turf.polygon([points]);
    const area = turf.area(polygon);

    // Display the area in the center of the container and hide other elements
    areaOutput.innerText = `Area: ${area.toFixed(2)} square meters`;
    areaOutput.style.display = 'flex';
    addMoreButton.style.display = 'none';
    gridContainer.style.display = 'none';

    // Remove the duplicate point used to close the polygon
    points.pop();
});
