export const setupAdsense = () => {
    const script = document.createElement("script")
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
    script.async = true
    script.onload = () => {
        //@ts-ignore
        ;(adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-5844650361408353",
            enable_page_level_ads: true
        })
    }
    document.getElementsByTagName("head")[0].appendChild(script)

    //     <ins class="adsbygoogle"
    //      style="display:block"
    //      data-adtest="on"
    //      data-ad-client="ca-pub-0000000000000000"
    //      data-ad-slot="0000000000"
    //      data-ad-format="auto"
    //      data-full-width-responsive="true"></ins>
    // <script>
}
