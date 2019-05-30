export default () => {
  window.addEventListener('load', function (e) {
    /* There are some appCache events we're not currently listening to:
     * - 'cached': I think this happens on initial first-time caching, but I can't get it to trigger?
     * - 'checking': Fires more or less on pageload
     * - 'noupdate': We've confirmed there's no new version to download
     * - 'obsolete': ???
     * */

    window.applicationCache.addEventListener('error', (e) => {
      console.log("AppCache error", e)
    }, false)

    window.applicationCache.addEventListener('downloading', (e) => {
      console.log("Downloading a new version of the app!", e)
    }, false)

    window.applicationCache.addEventListener('progress', (e: ProgressEvent) => {
      console.log(`Downloading new version: ${e.loaded}/${e.total} = ${Math.floor(100 * (e.loaded / e.total))}%`)
    })

    window.applicationCache.addEventListener('updateready', (e) => {
      alert("A new version of the game is available! We need to reload the page to update.")
      window.location.reload()
    }, false);
  }, false);
}