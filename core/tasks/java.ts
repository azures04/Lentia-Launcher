import { SemanticVersion } from "../interfaces.ts"
import { download } from "../download.ts"
import * as path from "jsr:@std/path"
import * as utils from "../utils.ts"

export function parseJavaVersion(rawVersion: string): SemanticVersion {
    const javaVersion: SemanticVersion = {
        major: parseInt(rawVersion.split(".")[0]),
        minor: parseInt(rawVersion.split(".")[1]),
        patch:  parseInt(rawVersion.split(".")[2].replace("0_", "")),
    }
    if (rawVersion.startsWith("1.8")) {
        javaVersion.major = 8
        javaVersion.minor = 0
    }
    return javaVersion
}

export async function isJavaSpecificVersionInstalled(majorVersion: number): Promise<boolean> {
    const javaVersion = new Deno.Command("runtime", {
        args: [
            "-version"
        ]
    })
    const stdout = new TextDecoder().decode((await javaVersion.output()).stdout)
    const stderr = new TextDecoder().decode((await javaVersion.output()).stderr)
    if (stdout.trim() == "") {
        const lines = stderr.split("\r\n")
        const line = lines.find($line => $line.includes("java version"))
        if (line) {
            const javaVersion: SemanticVersion = parseJavaVersion(line.split("\"")[1])
            if (javaVersion.major != majorVersion) {
                return false
            } else {
                return true
            }
        } else {
            return false
        }
    }
    return false
}

export async function installJava(majorVersion: number, os: string, arch: string, root: string): Promise<string | null> {
    await download(`https://api.adoptium.net/v3/binary/latest/${majorVersion}/ga/${os}/${arch}/jdk/hotspot/normal/eclipse`, path.join(root, "runtime", `${majorVersion.toString()}.zip`))
    const archive = await utils.extractZip(path.join(root, "runtime", `${majorVersion.toString()}.zip`), path.join(root, "runtime"))
    await Deno.remove(path.join(root, "runtime", `${majorVersion.toString()}.zip`))
    return archive
}