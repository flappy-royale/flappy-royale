export const setupGAnalytics = () => {
    const script = document.createElement("script")
    script.src = "https://www.googletagmanager.com/gtag/js?id=UA-143077069-1"
    script.async = true
    script.onload = () => {
        //@ts-ignore
        window.dataLayer = window.dataLayer || []
        function gtag() {
            // @ts-ignore
            dataLayer.push(arguments)
        }
        // @ts-ignore
        gtag("js", new Date())
        // @ts-ignore
        gtag("config", "UA-143077069-1")
    }
    document.getElementsByTagName("head")[0].appendChild(script)
}

/**
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-143077069-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-143077069-1');
</script>
 */
