import * as $webview from "@webview/webview"

const webview = new $webview.Webview()

async function buildLauncherWindow() {
    webview.title = "Lentia"
    webview.size = {
        height: 600,
        width: 900,
        hint: $webview.SizeHint.FIXED,
    }
    webview.navigate("https://google.com")
    webview.run()
}

buildLauncherWindow()