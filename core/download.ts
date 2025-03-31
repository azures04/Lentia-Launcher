import * as utils from "./utils.ts"
import * as path from "jsr:@std/path"
import bus from "./events.ts"

export async function download(downloadUrl: string, downloadPath: string): Promise<string | void> {
    await utils.createIfNotExists(path.parse(downloadPath).dir)

    const response = await fetch(downloadUrl)
    if (!response.body) {
        throw new Error("Failed to get response body")
    }

    const contentLength = response.headers.get("content-length")
    const contentDisposition = response.headers.get("content-disposition")
    const totalSize = contentLength ? parseInt(contentLength, 10) : undefined
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

            if (totalSize) {
                const progress = (downloadedSize / totalSize) * 100
                const speed = downloadedSize / ((performance.now() - startTime) / 1000)

                bus.emit("download-status", {
                    file: downloadPath,
                    progress: progress.toFixed(2),
                    speed: speed.toFixed(2),
                })
            } else {
                const speed = downloadedSize / ((performance.now() - startTime) / 1000)

                bus.emit("download-status", {
                    file: downloadPath,
                    downloadedSize: downloadedSize,
                    speed: speed.toFixed(2),
                })
            }
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
        if (contentDisposition?.split("; ")[1]) {
            return contentDisposition?.split("; ")[1].split("=")[1]
        }
    }
}