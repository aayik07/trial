let points = []; // Array to store points (latitude, longitude)
const gridContainer = document.getElementById('gridContainer');
const loader = document.createElement('div');
loader.className = 'loader';
gridContainer.appendChild(loader);

// Function to add "Add More" button dynamically
function addAddMoreButton() {
    const addMoreButton = document.createElement('div');
    addMoreButton.id = 'addMore';
    addMoreButton.className = 'grid-item';

    const text = document.createElement('span');
    text.className = 'text';
    text.innerText = 'Add More';

    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.innerText = '+';

    addMoreButton.appendChild(text);
    addMoreButton.appendChild(icon);

    addMoreButton.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                points.push([longitude, latitude]);

                const edgeDiv = document.createElement('div');
                edgeDiv.className = 'grid-item';
                edgeDiv.innerHTML = `Edge ${points.length}<br><span class="latlong">${latitude.toFixed(7)}<br>${longitude.toFixed(7)}</span>`;
                gridContainer.insertBefore(edgeDiv, addMoreButton);

                updateAddMorePosition();
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });

    gridContainer.appendChild(addMoreButton);
    updateAddMorePosition();
}

// Function to update the position of the "Add More" button
function updateAddMorePosition() {
    const addMoreButton = document.getElementById('addMore');
    const totalEdges = points.length;

    if (totalEdges % 2 === 0) {
        addMoreButton.style.gridColumnStart = '1';
    } else {
        addMoreButton.style.gridColumnStart = '2';
    }
}

document.getElementById('calculateArea').addEventListener('click', () => {
    if (points.length < 3) {
        alert('Need at least 3 points to form a polygon.');
        return;
    }

    loader.style.display = 'block';
    setTimeout(() => {
        points.push(points[0]);

        const polygon = turf.polygon([points]);
        const areaInSqMeters = turf.area(polygon);
        const areaInMarlas = areaInSqMeters / 25.2929;

        gridContainer.innerHTML = '';

        const areaDiv = document.createElement('div');
        areaDiv.className = 'area-display';
        areaDiv.innerHTML = `<b>${areaInSqMeters.toFixed(2)} sq meters</b><br><span>(${areaInMarlas.toFixed(2)} marlas)</span>`;

        gridContainer.appendChild(areaDiv);

        const calculateButton = document.getElementById('calculateArea');
        calculateButton.innerText = 'Reset';
        calculateButton.onclick = resetRecording;

        points.pop();

        loader.style.display = 'none';
    }, 2000);
});

function resetRecording() {
    location.reload();
}

// Add "Add More" button when page loads
addAddMoreButton();
