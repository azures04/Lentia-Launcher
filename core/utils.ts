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