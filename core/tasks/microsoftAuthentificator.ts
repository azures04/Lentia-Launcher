interface XboxResponseSchem {
    IssueInstant: string,
    NotAfter: string,
    Token: string, 
    DisplayClaims: {
        xui: [
            {
                uhs: string 
            }
        ]
    }
}

interface XstsErrorReponse {
    Identity: string,
    XErr: number,
    Message: string,
    Redirect: string
}

interface MinecraftXboxLoginResponse {
    username: string,
    roles: Array<Object>,
    access_token: string,
    token_type: string,
    expires_in: number
}

interface McStoreResponse {
    items: McStoreResponseItem[],
    signature: string,
    keyId: string
}

interface McStoreResponseItem {
    name: string,
    signature: string 
}

interface MinecraftProfile {
    id: string
    name: string
    skins: Skin[]
    capes: Cape[]
}

interface Skin {
    id: string
    state: "ACTIVE" | "INACTIVE"
    url: string
    variant: "CLASSIC" | "SLIM"
    alias: string
}

interface Cape {
    id: string
    state: "ACTIVE" | "INACTIVE"
    url: string
    alias: string
}


interface DontHaveMinecraftError {
    path: string,
    error: string,
    errorMessage: string
}

export const XstsErrorCodes: Record<number, string> = {
    2148916227: "The account is banned from Xbox.",
    2148916233: "The account doesn't have an Xbox account. Please sign up.",
    2148916235: "The account is from a country where Xbox Live is not available/banned.",
    2148916236: "The account needs adult verification on the Xbox page. (South Korea)",
    2148916237: "The account needs adult verification on the Xbox page. (South Korea)",
    2148916238: "The account is a child (under 18) and must be added to a Family.",
    2148916262: "Unknown error occurred."
}

export async function xboxLiveAuthenticate(accessToken: string): Promise<XboxResponseSchem> {
    const response = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            Properties: {
                AuthMethod: "RPS",
                SiteName: "user.auth.xboxlive.com",
                RpsTicket: `d=${accessToken}`
            },
            RelyingParty: "http://auth.xboxlive.com",
            TokenType: "JWT"
        })
    })
    const xboxliveAuthentification: XboxResponseSchem = await response.json()
    return xboxliveAuthentification
}

export async function xstsTokenMinecraft(token: string): Promise<XboxResponseSchem | XstsErrorReponse> {
    const response = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            Properties: {
                SandboxId: "RETAIL",
                UserTokens: [    
                    `d=${token}`
                ]
            },
            RelyingParty: "rp://api.minecraftservices.com/",
            TokenType: "JWT"
        })
    })
    if (response.status == 401) {
        const result: XstsErrorReponse = await response.json()
        return result
    }
    const result: XboxResponseSchem = await response.json()
    return result
}

export async function loginMinecraftWithXbox(userHash: string, xsts: string): Promise<MinecraftXboxLoginResponse> {
    const response = await fetch("https://api.minecraftservices.com/authentication/login_with_xbox", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            identityToken: `XBL3.0 x=${userHash};${xsts}`
        })
    })
    const result: MinecraftXboxLoginResponse = await response.json()
    return result
}

export async function getUserMCStore(accessToken: string): Promise<McStoreResponse> {
    const response = await fetch("https://api.minecraftservices.com/entitlements/mcstore", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
    const result: McStoreResponse = await response.json()
    return result
}

export async function getPlayerProfile(accessToken: string): Promise<MinecraftProfile | DontHaveMinecraftError> {
    const response = await fetch("https://api.minecraftservices.com/minecraft/profile", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
    const result = await response.json() as MinecraftProfile | DontHaveMinecraftError
    return result
}