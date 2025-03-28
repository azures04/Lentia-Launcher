import * as utils from "./utils.ts"
import * as path from "jsr:@std/path"
import bus from "./events.ts"

export async function download(downloadUrl: string, downloadPath: string): Promise<void> {
    await utils.createIfNotExists(path.parse(downloadPath).dir)

    const response = await fetch(downloadUrl)
    if (!response.body) {
        throw new Error("Failed to get response body")
    }

    const contentLength = response.headers.get("content-length")
    if (!contentLength) {
        throw new Error("Failed to get content length")
    }

    const totalSize = parseInt(contentLength, 10)
    const file = await Deno.open(downloadPath, { write: true, create: true, truncate: true })
    const reader = response.body.getReader()
    let downloadedSize = 0
    const startTime = performance.now()

    try {
        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            await file.write(value)
            downloadedSize += value.length
            const progress = (downloadedSize / totalSize) * 100
            const speed = downloadedSize / ((performance.now() - startTime) / 1000)

            bus.emit("download-status", {
                file: downloadPath,
                progress: progress.toFixed(2),
                speed: speed.toFixed(2),
            })
        }

        bus.emit("download-complete", {
            file: downloadPath,
        })
    } catch (error: any) {
        bus.emit("download-error", {
            file: downloadPath,
            error: error.message,
        })
        throw error
    } finally {
        file.close()
    }
}