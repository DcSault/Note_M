// Easter Egg: Show a modal with a cat image when user types the specific sequence
let easterEggSequence = [];
const targetSequence = ['ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

document.addEventListener('keydown', function(event) {
  easterEggSequence.push(event.key);
  
  // If the sequence is longer than the target sequence, remove the oldest key
  if (easterEggSequence.length > targetSequence.length) {
    easterEggSequence.shift();
  }

  // Check if the sequences match
  if (JSON.stringify(easterEggSequence) === JSON.stringify(targetSequence)) {
    const modal = document.getElementById("catModal");
    const span = document.getElementsByClassName("close")[0];
    
    modal.style.display = "block";
    
    span.onclick = function() {
      modal.style.display = "none";
    }
    
    window.onclick = function(event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    }
  }
});
