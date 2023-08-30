function confirmRead() {
  const secureTextElement = document.getElementById("secureText");
  const text = secureTextElement.getAttribute('data-text'); // Utilisation d'un attribut de données
  secureTextElement.innerText = text;
  markAsRead();
  closeModal();
}

function closeModal() {
  document.getElementById("myModal").style.display = "none";
}

function markAsRead() {
  const id = document.getElementById("secureText").getAttribute('data-id'); // Utilisation d'un attribut de données
  fetch(`/markAsRead/${id}`, {
    method: 'POST'
  }).then(response => {
    if (response.ok) {
      console.log('Note marked as read and deleted');
    } else {
      console.log('Failed to mark note as read');
    }
  });
}

function copyToClipboard() {
  const textArea = document.createElement('textarea');
  textArea.value = document.getElementById("secureText").innerText;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  alert('Note copié dans le presse-papiers');
}
