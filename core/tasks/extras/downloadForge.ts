import * as zip from "@zip-js/zip-js"

export async function extractJsonVersionFromOnlineForgeJar(url: string): Promise<object> {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    const blob = new Blob([buffer])

    const reader = new zip.ZipReader(new zip.BlobReader(blob))
    const entries = await reader.getEntries()
    
    const entry = entries.find((file: any) => file.filename == "version.json")
    if (!entry) {
        return {}
    }
    const content = await entry.getData(new zip.TextWriter())
    await reader.close()
    return JSON.parse(content)
}

// export async function name(params:type) {
//     const downloadQueue: Array<any> = []
// }

