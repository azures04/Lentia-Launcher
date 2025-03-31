import * as path from "jsr:@std/path"
import * as utils from "../utils.ts"

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

export function buildJVMArgsUnder1_12_2(root: string, version: string): string {
    return `
    -Djava.library.path=${path.join(root, "natives", version)}
    -Dminecraft.launcher.brand=Lentia -Dminecraft.launcher.version=0.0.1
    -cp=${getClasspath(root, version)}
    ${os == "windows" ? (osVersion.major == 10 && osVersion.patch < 22000 ? "-Dos.name=Windows 10 -Dos.version=10.0" : "") : ""}
    -XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump
    -XstartOnFirstThread
    -Xss1M
    `
}