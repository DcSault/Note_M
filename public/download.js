  // Function to confirm reading
  function confirmRead() {
    const secureTextElement = document.getElementById("secureText");
    secureTextElement.innerText = '<%= text %>';
      markAsRead();
      closeModal();
   }

   // Function to close the modal without reading
   function closeModal() {
     document.getElementById("myModal").style.display = "none";
   }

   function markAsRead() {
     const id = '<%= id %>';
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