import * as path from "jsr:@std/path"
import * as utils from "../utils.ts"
import { AuthorizationObject, GamArguments, GameLaunchOptions, VersionObject } from "../interfaces.ts";

const os = Deno.build.os == "darwin" ? "osx" : Deno.build.os 
const osVersion = utils.parseOSVersion(Deno.osRelease())

export async function getClasspath(root: string, version: string): Promise<string> {
    const libraries = await utils.scanFiles(path.join(root, "libraries"))
    switch (os) {
        case "linux":
            return [...libraries, path.join(root, version, `${version}.jar`)].join(":")
        default:
            return [...libraries, path.join(root, version, `${version}.jar`)].join(";")
    }
}

export async function buildJVMArgsUnder1_12_2(root: string, version: string): Promise<string> {
    return `
    -Djava.library.path=${path.join(root, "natives", version)}
    -Dminecraft.launcher.brand=Lentia -Dminecraft.launcher.version=0.0.1
    -cp=${await getClasspath(root, version)}
    ${os == "windows" ? (osVersion.major == 10 && osVersion.patch < 22000 ? "-Dos.name=Windows 10 -Dos.version=10.0" : "") : ""}
    -XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump
    -XstartOnFirstThread
    -Xss1M
    `
}

export function replaceVariableByTheirValue(str: string, data: { [key: string]: any }): string {
    return str.replace(/\$\{([^}]+)\}/g, (match, key) => {
        return key in data ? data[key] : match
    })
}

export function parseMinecraftArguments(minecraftArguments: string, authorization: AuthorizationObject, root: string, version: VersionObject) {
    const gameArguments: GamArguments = {
        accessToken: authorization.accessToken,
        uuid: authorization.uuid,
        assetsDir: path.join(root, "assets"),
        assetsIndex: `${version}.json`,
        gameDir: root,
        userType: authorization.userType,
        username: authorization.name,
        version: version.id,
        versionType: version.type,
    }
    return replaceVariableByTheirValue(minecraftArguments, gameArguments)
}

export async function launchGame(options: GameLaunchOptions) {
    const manifest = JSON.parse(await Deno.readTextFile(path.join(options.root, "versions", options.version.id, `${options.version.id}.json`)))
    const gameArguments = parseMinecraftArguments(manifest.minecraftArguments, options.authorization, options.root, options.version)

}