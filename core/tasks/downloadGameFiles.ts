import * as utils from "../utils.ts"
import * as path from "jsr:@std/path"
import * as java from "./java.ts"
import { download } from "../download.ts"
import archFinder from "https://raw.githubusercontent.com/denorg/arch/master/mod.ts"

const END_POINTS = {
    libraries: "https://libraries.minecraft.net",
    resources: "https://resources.download.minecraft.net"
}

const os = Deno.build.os == "darwin" ? "osx" : Deno.build.os 
const arch = await archFinder() == "x64" ? "64" : "32"

let root: string = ""

interface Rule {
    action: string
    os?: {
        name: string
    }
}

export function validateRule(rules: Rule[], os: string): boolean {
    let isAllowed = false
  
    for (const rule of rules) {
        if (rule.os && rule.os.name !== os) {
            continue
        }
        if (rule.action === "disallow") {
            return false
        } else if (rule.action === "allow") {
            isAllowed = true
        }
    }
  
    return isAllowed
}

async function findGameVersion($version: string) {
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

export async function downloadGameFiles($version: string, isCustom: boolean = false, url: string = "") {
    const downloadQueue: Array<any> = []
    const version = isCustom == true ? { id: $version, url: url } : await findGameVersion($version)
    try {
        await download(version.url, path.join(root, "versions", $version, `${$version}.json`))
        const manifest = JSON.parse(await Deno.readTextFile(path.join(root, "versions", $version, `${$version}.json`)))
        await download(manifest.downloads.client.url, path.join(root, "versions", manifest.id, `${manifest.id}.jar`))
        const assetsResponse = await fetch(manifest.assetIndex.url)
        const assetsManifest = await assetsResponse.json()
        for (const key in assetsManifest.objects) {
            if (Object.prototype.hasOwnProperty.call(assetsManifest.objects, key)) {
                const asset = assetsManifest.objects[key]
                downloadQueue.push({
                    url: `${END_POINTS.resources}/${new String(asset.hash).substring(0, 2)}/${asset.hash}`,
                    path: path.join(root, "assets", "objects", new String(asset.hash).substring(0, 2), asset.hash)
                })
            }
        }
        downloadQueue.push({
            url: manifest.assetIndex.url,
            path: path.join(root, "assets", "indexes", `${version.id}.json`)
        })
        for (const asset of downloadQueue) {
            try {
                await download(asset.url, asset.path)
            } catch (error) {
                console.log(asset)
                console.log(error)
            }
        }
        utils.clearArray(downloadQueue)
        for (const library of manifest.libraries) {
            if (library.rules) {
                if (validateRule(library.rules, os)) {
                    downloadQueue.push(library)
                }
            } else {
                downloadQueue.push(library)
            }
        }
        for (const library of downloadQueue) {
            try {
                if (library.downloads.artifact) {
                    await download(`${END_POINTS.libraries}/${library.downloads.artifact.path}`, path.join(root, "libraries", library.downloads.artifact.path))
                } else if (library.downloads.classifiers) {
                    const native = library.downloads.classifiers[library.natives[os].replace("${arch}", arch)]
                    if (native) {
                        utils.createIfNotExists(path.join(root, "natives", version.id))
                        await download(`${END_POINTS.libraries}/${native.path}`, path.join(root, "libraries", native.path))
                        await utils.extractZip(`${root}/libraries/${native.path}`, path.join(root, "natives", version.id))
                    }
                }
            } catch (error) {
                console.log(library)
                console.error(error)
            }
        }
        utils.clearArray(downloadQueue)
        if (manifest.logging?.client) {
            await download(manifest.logging.client.file.url, path.join(root, manifest.logging.client.file.id))
        }
        if (!java.isJavaSpecificVersionInstalled(manifest.javaVersion.majorVersion)) {
            await java.installJava(manifest.javaVersion.majorVersion, os, arch, root)
        }
    } catch (error) {
        console.log(error)
    }
}

setRoot(path.join(Deno.cwd(), "game"))
downloadGameFiles("1.7.10")