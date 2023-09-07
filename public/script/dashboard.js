document.addEventListener('DOMContentLoaded', function() {
    const events = [
      { type: 'created', timestamp: '2023-01-01' },
      { type: 'read', timestamp: '2023-01-02' },
      // Ajoutez plus d'événements ici...
    ];
  
    const eventTypes = ['created', 'read', 'deleted'];
    const eventData = eventTypes.map(type => {
      return events.filter(event => event.type === type).length;
    });
  
    // Bar Chart
    const ctxBar = document.getElementById('eventChartBar').getContext('2d');
    const barChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: eventTypes,
        datasets: [{
          label: '# of Events',
          data: eventData,
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(255, 99, 132, 0.5)'
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
  
    // Pie Chart
    const ctxPie = document.getElementById('eventChartPie').getContext('2d');
    const pieChart = new Chart(ctxPie, {
      type: 'pie',
      data: {
        labels: eventTypes,
        datasets: [{
          data: eventData,
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(255, 99, 132, 0.5)'
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
  });
  