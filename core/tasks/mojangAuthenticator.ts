const yggdrasilServer:string = "https://authserver.mojang.com"
const uuid = crypto.randomUUID()

interface MojangUserProfile {
    access_token: string,
    client_token: string,
    uuid: string,
    name: string,
    user_properties: string,
    selected_profile: Object | null
}

export async function authenticate(username:string, password:string, clientToken: string | null = null): Promise<MojangUserProfile | Error> {
    if (!password) {
        const $uuid = crypto.randomUUID()
        const user: MojangUserProfile = {
            access_token: $uuid,
            client_token: clientToken || $uuid,
            uuid: $uuid,
            name: username,
            user_properties: "{}",
            selected_profile: null
        }
        return user
    } else {
        try {
            const response = await fetch(`${yggdrasilServer}/authenticate`, {
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    agent: {
                        name: "Minecraft",
                        version: 1
                    },
                    username,
                    password,
                    clientToken: uuid,
                    requestUser: true
                })
            })
            const mojangAccount: any = response.json()
            if (!mojangAccount || !mojangAccount.selectedProfile) {
                return new Error("Missing profile.")
            }
            const user: MojangUserProfile = {
                access_token: mojangAccount.accessToken,
                client_token: mojangAccount.clientToken,
                uuid: mojangAccount.selectedProfile.id,
                name: mojangAccount.selectedProfile.name,
                selected_profile: mojangAccount.selectedProfile,
                user_properties: parsePropts(mojangAccount.user.properties)
            }
            return user
        } catch (error) {
            throw error
        }
    }
}

export async function refresh(accessToken:string, clientToken: string): Promise<MojangUserProfile | Error> {
    const response = await fetch(`${yggdrasilServer}/validate`, {
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            accessToken: accessToken, 
            clientToken: clientToken,
            requestUser: true
        })
    })
    try {
        const refreshedProfile: any = response.json()
        const userProfile: MojangUserProfile = {
            access_token: refreshedProfile.accessToken,
            client_token: uuid,
            uuid: refreshedProfile.selectedProfile.id,
            name: refreshedProfile.selectedProfile.name,
            selected_profile: refreshedProfile.selectedProfile,
            user_properties: parsePropts(refreshedProfile.user.properties)
        }
        return userProfile
    } catch (error) {
        throw error
    }
}

export async function validate(accessToken:string, clientToken: string): Promise<boolean> {
    const response = await fetch(`${yggdrasilServer}/validate`, {
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            accessToken: accessToken, 
            clientToken: clientToken
        })
    })
    if (response.status == 204) {
        return true
    } else {
        return false
    }
}

export async function invalidate(accessToken:string, clientToken: string): Promise<boolean> {
    const response = await fetch(`${yggdrasilServer}/validate`, {
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            accessToken: accessToken, 
            clientToken: clientToken
        })
    })
    if (response.status == 200) {
        return true
    } else {
        return false
    }
}

export async function signOut(username:string, password:string): Promise<boolean> {
    const response = await fetch(`${yggdrasilServer}/signout`, {
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username, 
            password
        })
    })
    if (response.status == 200) {
        return true
    } else {
        return false
    }
}

/**
 * 
 * @author https://github.com/Pierce01
 * @link https://github.com/Pierce01/MinecraftLauncher-core/blob/master/components/authenticator.js#L147C1-L162C1
 * @returns 
*/
function parsePropts(array: any) {
    if (array) {
        const newObj: any = {}
        for (const entry of array) {
            if (newObj[entry.name]) {
                newObj[entry.name].push(entry.value)
            } else {
                newObj[entry.name] = [entry.value]
            }
        }
        return JSON.stringify(newObj)
    } else {
       return "{}"
    }
}
