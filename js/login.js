window.addEventListener('DOMContentLoaded', () => {
  const fragment = window.location.hash.substring(1);

  if (fragment) {
    let decodedData;
    try {

      const decodedFragment = atob(fragment);
      decodedData = JSON.parse(decodedFragment);
    } catch (e) {
      console.error('Failed to decode and parse fragment:', e);
      return;
    }

    fetch('https://api.grab-tutorials.live/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(decodedData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Worker Response:', data);

        if (data && data.alias) {

          localStorage.setItem('userAlias', data.alias);
          console.log('Alias stored in localStorage:', data.alias);
        } else {
          console.error('Alias not found in the response.');
        }
      })
      .catch(error => {
        console.error('Error sending fragment:', error);
      });
  }
});
