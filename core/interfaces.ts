export interface XboxResponseSchem {
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

export interface XstsErrorReponse {
    Identity: string,
    XErr: number,
    Message: string,
    Redirect: string
}

export interface MinecraftXboxLoginResponse {
    username: string,
    roles: Array<Object>,
    access_token: string,
    token_type: string,
    expires_in: number
}

export interface McStoreResponse {
    items: McStoreResponseItem[],
    signature: string,
    keyId: string
}

export interface McStoreResponseItem {
    name: string,
    signature: string 
}

export interface Skin {
    id: string
    state: "ACTIVE" | "INACTIVE"
    url: string
    variant: "CLASSIC" | "SLIM"
    alias: string
}

export interface Cape {
    id: string
    state: "ACTIVE" | "INACTIVE"
    url: string
    alias: string
}

export interface DontHaveMinecraftError {
    path: string,
    error: string,
    errorMessage: string
}

export interface OAuthErrorResponse {
    error: string
    error_description: string
    error_codes: number[]
    timestamp: string
    trace_id: string
    correlation_id: string
    error_uri: string
}

export interface DeviceCodeResponse {
    user_code: string
    device_code: string
    verification_uri: string
    expires_in: number
    interval: number
    message: string
}

export interface MinecraftProfile {
    id: string
    name: string
    accessToken: string,
    skins: Skin[]
    capes: Cape[]
}

export interface AuthorizationObject {
    name: string,
    uuid: string,
    clientToken: string,
    accessToken: string,
    selectedProfile: {
        name: string,
        uuid: string
    },
    user_properties: object
}

export interface MojangUserProfile {
    access_token: string,
    client_token: string,
    uuid: string,
    name: string,
    user_properties: string,
    selected_profile: object | null
}

export interface GameLaunchOptions {
    authorization: AuthorizationObject,
    root: string,
    version: {
        id: string,
        type: "version" | "snapshot", 
        modded?: "forge" | "fabric" | "liteloader" | "quilt" | "neoforge" | "mcp" | null
    },
    window?: {
        width?: number,
        height?: number,
        fullscreen?: boolean,
    },
    memory: {
        min: number,
        max: number
    },
    customJvmArgs?: Array<string>,
    customGameArgs?: Array<string>
    proxy?: {
        host: string,
        port: number,
        username?: string,
        password?: string
    },
    quickPlay?: {
        identifier: "singleplayer" | "multiplayer" | "realms" | "legacy",
        path: string
    },
    features: Array<string>,
    javaPath?: string,
}

export interface SemanticVersion {
    major: number,
    minor: number,
    patch: number
}