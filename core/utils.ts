import { MinecraftProfile, MojangUserProfile, AuthorizationObject, SemanticVersion } from "./interfaces.ts"
import * as path from "jsr:@std/path"
import * as zip from "@zip-js/zip-js"
import bus from "./events.ts"

export function clearArray<T>(array: T[]) {
    while (array.length > 0) {
        array.pop()
    }
}

export async function createIfNotExists(path:string) {
    try {
        const stat = await Deno.stat(path)
        if (!stat.isDirectory) {
            throw new Error("Path is not a directory")
        }
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            await Deno.mkdir(path, { recursive: true })
        }
    }
}

export async function extractZip(zipFilePath: string, outputDir: string): Promise<string | null> {
    const zipData = await Deno.readFile(zipFilePath)
    const zipReader = new zip.ZipReader(new zip.BlobReader(new Blob([zipData])))

    let rootDir: string | null = null

    bus.emit("zip-extracting-start", {
        file: zipFilePath,
        outDir: outputDir,
    })
    
    const entries = await zipReader.getEntries()

    for (const entry of entries) {
        if (!entry.directory && !entry.filename.endsWith("MANIFEST.MF")) {
            if (entry !== undefined) {
                const parts = entry.filename.split('/')
                if (parts.length > 1 && !rootDir) {
                    rootDir = parts[0]
                }
                const fileData = await entry.getData(new zip.Uint8ArrayWriter())
                const filePath = `${outputDir}/${entry.filename}`
    
                const dirPath = filePath.substring(0, filePath.lastIndexOf('/'))
                await Deno.mkdir(dirPath, { recursive: true })
                await Deno.writeFile(filePath, fileData)
                bus.emit("zip-extracting-file", {
                    filePath: filePath
                })
            }
        }
    }
    bus.emit("zip-extracting-complete", {
        filePath: zipFilePath,
        outDir: outputDir
    })
    await zipReader.close()
    return rootDir
}

export function convertToAuthorizationObject(data: MinecraftProfile | MojangUserProfile): AuthorizationObject {
    if ("accessToken" in data) {
        return {
            name: data.name,
            uuid: data.id,
            clientToken: data.id,
            accessToken: data.accessToken,
            selectedProfile: {
                name: data.name,
                uuid: data.id
            },
            user_properties: {}
        }
    } else {
        return {
            name: data.name,
            uuid: data.uuid,
            clientToken: data.client_token,
            accessToken: data.access_token,
            selectedProfile: {
                name: data.name,
                uuid: data.uuid
            },
            user_properties: JSON.parse(data.user_properties || "{}")
        }
    }
}

export async function scanFiles(dir: string): Promise<string[]> {
    const files: string[] = []

    for await (const entry of Deno.readDir(dir)) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isFile) {
            files.push(fullPath)
        } else if (entry.isDirectory) {
            const subFiles = await scanFiles(fullPath)
            files.push(...subFiles)
        }
    }

    return files
}

export function parseOSVersion(rawVersion: string): SemanticVersion {
    const javaVersion: SemanticVersion = {
        major: parseInt(rawVersion.split(".")[0]),
        minor: parseInt(rawVersion.split(".")[1]),
        patch:  parseInt(rawVersion.split(".")[2]),
    }
    return javaVersion
}