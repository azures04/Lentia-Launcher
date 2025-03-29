import * as utils from "../utils.ts"
import * as path from "jsr:@std/path"
import { download } from "../download.ts"

const END_POINTS = {
    resources: "https://resources.download.minecraft.net/"
}

const os = Deno.build.os == "darwin" ? "osx" : Deno.build.os 
let root:string = ""

async function findGameVersion($version:string) {
    const response = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")
    const manifest = await response.json()
    const version = manifest.versions.find((v: { id: string }) => v.id === $version)
    if (!version) {
        throw new Error(`Version ${$version} not found`)
    }
    return version
}

export function setRoot($root:string) {
    root = $root
}

export function getRoot() {
    return root
}

export async function downloadGameFiles($version:string, isCustom:boolean = false, url:string = "") {
    const downloadQueue = []
    const version = isCustom == true ? { id: $version, url: url } : await findGameVersion($version)
    const response = await fetch(version.url)
    const manifest = await response.json()
    const assetsResponse = await fetch(manifest.assetIndex.url)
    const assetsManifest = await assetsResponse.json()
    for (const key in assetsManifest.objects) {
        if (Object.prototype.hasOwnProperty.call(assetsManifest.objects, key)) {
            const asset = assetsManifest.objects[key]
            await download(path.posix.join(END_POINTS.resources, new String(asset.hash).substring(0, 2), asset.hash), path.join(root, "assets", "indexes", new String(asset.hash).substring(0, 2), asset.hash))
        }
    }
    for (const library of manifest.libraries) {
        if (library.rules) {
            for (const rule of library.rules) {
                if (rule.os && rule.os.name !== os) {
                    continue
                }
                if (rule.action === "allow") {
                    downloadQueue.push(library)
                }
            }
        } else {
            downloadQueue.push(library)
        }
    }
    for (const library of downloadQueue) {
        try {
            await download(library.downloads.artifact.url, path.join(root, "libraries", library.downloads.artifact.path))
        } catch (error) {
            console.error(error)
        }
    }
    utils.clearArray(downloadQueue)
    if (manifest.logging?.client) {
        await download(manifest.logging.client.file.url, path.join(root, manifest.logging.client.file.id))
    }

    await download(manifest.downloads.client.url, path.join(root, "versions", manifest.id, `${manifest.id}.jar`))
}

setRoot(path.join(Deno.cwd(), "game"))
downloadGameFiles("1.20.3")