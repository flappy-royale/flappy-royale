export default () => {
  window.addEventListener('load', function (e) {
    window.applicationCache.addEventListener('cached', (e) => {
      console.log("AppCache: 'cached' event", e)
    }, false)

    window.applicationCache.addEventListener('checking', (e) => {
      console.log("AppCache: 'checking' event", e)
    }, false)

    window.applicationCache.addEventListener('error', (e) => {
      console.log("AppCache: 'error' event", e)
    }, false)

    window.applicationCache.addEventListener('noupdate', (e) => {
      console.log("AppCache: 'noupdate' event", e)
    }, false)

    window.applicationCache.addEventListener('obsolete', (e) => {
      console.log("AppCache: 'cached' event", e)
    }, false)

    window.applicationCache.addEventListener('downloading', (e) => {
      console.log("Downloading a new version of the app!", e)
    }, false)

    window.applicationCache.addEventListener('updateready', (e) => {
      if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
        // A new version of the app is ready, reload it
        // TODO: Do this automatically! For now, though, I want to test if this works
        alert("A new version of this site is available. Let's load it!")
        window.location.reload();
      }
    }, false);
  }, false);
}