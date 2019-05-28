export default () => {
  // Check if a new cache is available on page load.
  // (Copy/pasted from https://www.html5rocks.com/en/tutorials/appcache/beginner/)
  window.addEventListener('load', function (e) {
    window.applicationCache.addEventListener('updateready', function (e) {
      if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
        // A new version of the app is ready, reload it
        // TODO: Do this automatically! For now, though, I want to test if this works
        if (confirm('A new version of this site is available. Load it?')) {
          window.location.reload();
        }
      }
    }, false);
  }, false);
}