document.addEventListener("DOMContentLoaded", function() {
    // Utilisation de la variable globale définie dans le fichier EJS
    const events = eventsData;

    // Vérifie que la variable events existe et est un tableau
    if (Array.isArray(events)) {
        // Prépare les données pour le graphique
        const eventTypes = ['created', 'read', 'deleted'];
        const eventData = eventTypes.map(type => {
            return events.filter(event => event.type === type).length;
        });

        // Crée le graphique
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
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        console.error("La variable 'events' n'est pas un tableau ou n'est pas définie.");
    }
});
