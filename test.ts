// import * as msa from "./core/tasks/microsoftAuthentificator.ts"

// const clientId = "48d5524c-aefa-4f0c-a7b3-a23f2cf525d4"
// const redirectUri = "http://localhost"

// async function authenticateMinecraft(code: string) {
//     // const deviceCodeResponse = await msa.getCodeLink(clientId)
//     // const authorizationUrl = msa.getAuthorizationUrl(clientId, redirectUri)
//     // if ('error' in deviceCodeResponse) throw new Error(deviceCodeResponse.error_description)
    
//     const accessToken = await msa.getAccessToken(clientId, code, redirectUri)
//     const xboxResponse = await msa.xboxLiveAuthenticate(accessToken)
//     console.log(xboxResponse)
//     const xstsResponse = await msa.xstsTokenMinecraft(xboxResponse.Token)
//     console.log(xstsResponse)
//     if ('XErr' in xstsResponse) return

//     // const loginResponse = await msa.loginMinecraftWithXbox(xstsResponse.DisplayClaims.xui[0].uhs, xstsResponse.Token)
//     // const mcStoreResponse = await msa.getUserMCStore(loginResponse.access_token)
//     // const playerProfile = await msa.getPlayerProfile(loginResponse.access_token)
// }

// console.log(msa.getAuthorizationUrl(clientId, redirectUri))
// const codeFromUrl = "M.C525_SN1.2.U.f430fcef-a956-eeee-cf37-34454ffea6bd"
// authenticateMinecraft(codeFromUrl)

import { getClasspath } from "./core/tasks/launchGame.ts"

console.log(await getClasspath("game", "1.7.10"))