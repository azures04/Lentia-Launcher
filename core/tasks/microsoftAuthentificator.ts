import { XstsErrorReponse, DeviceCodeResponse, DontHaveMinecraftError, McStoreResponse, MinecraftProfile, MinecraftXboxLoginResponse, OAuthErrorResponse, XboxResponseSchem } from "../interfaces.ts"

export const XstsErrorCodes: Record<number, string> = {
    2148916227: "The account is banned from Xbox.",
    2148916233: "The account doesn't have an Xbox account. Please sign up.",
    2148916235: "The account is from a country where Xbox Live is not available/banned.",
    2148916236: "The account needs adult verification on the Xbox page. (South Korea)",
    2148916237: "The account needs adult verification on the Xbox page. (South Korea)",
    2148916238: "The account is a child (under 18) and must be added to a Family.",
    2148916262: "Unknown error occurred."
}

export function getAuthorizationUrl(clientId: string, redirectUri: string): string {
    const baseUrl = "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize"
    const scope = "XboxLive.signin offline_access"
    const responseType = "code"

    const url = new URL(baseUrl)
    url.searchParams.append("client_id", clientId)
    url.searchParams.append("response_type", responseType)
    url.searchParams.append("redirect_uri", redirectUri)
    url.searchParams.append("scope", scope)

    return url.toString()
}

export async function getCodeLink(client: string): Promise<DeviceCodeResponse | OAuthErrorResponse> {
    const response = await fetch("https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode", {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        body: `
        \rclient_id=${client}
        \r&scope=XboxLive.signin offline_access
        `
    })
    const result = await response.json() as DeviceCodeResponse | OAuthErrorResponse
    return result
}

export async function getAccessToken(clientId: string, code: string, redirectUri: string): Promise<string | null> {
    const tokenUrl = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token"
    
    const body = new URLSearchParams()
    body.append("client_id", clientId)
    body.append("grant_type", "authorization_code")
    body.append("code", code)
    body.append("redirect_uri", redirectUri)

    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    if (!response.ok) {
        console.error("Erreur lors de la récupération du token d'accès :", await response.text())
        return null
    }

    const data = await response.json()
    return data.access_token
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
    if (!("access_token" in result) && !("errorMessage" in result)) {
        result.accessToken = accessToken
    }
    return result
}