// Assuming 'events' is passed from the server as a JSON object
const events = JSON.parse(document.getElementById('events-data').textContent);

// Function to update chart
function updateChart(events) {
    const eventTypes = ['created', 'read', 'deleted'];
    const eventData = eventTypes.map(type => events.filter(event => event.type === type).length);

    // Create or update the chart
    const ctx = document.getElementById('eventChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: eventTypes,
            datasets: [{
                label: '# of Events',
                data: eventData,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.5)',  // created: blue
                    'rgba(255, 206, 86, 0.5)',  // read: yellow
                    'rgba(255, 99, 132, 0.5)'   // deleted: red
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        }
    });
}

// Initialize
updateChart(events);

// Add real-time update or filters here
