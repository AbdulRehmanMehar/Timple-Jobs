import { randomBytes } from 'crypto'

const {
  BULLHORN_CLIENT_ID,
  BULLHORN_CLIENT_SECRET,
  BULLHORN_API_USERNAME,
  BULLHORN_API_PASSWORD,
} = process.env

function generateOAuth2State() {
  return randomBytes(16).toString('hex')
}

export async function getBullhornAccessToken() {
  try {
    console.log("Getting Bullhorn access token...")

    const loginInfoResp = await fetch(
      `https://rest.bullhornstaffing.com/rest-services/loginInfo?username=${BULLHORN_API_USERNAME}`
    )

    if (!loginInfoResp.ok) {
      throw new Error(`Login info request failed: ${loginInfoResp.status}`)
    }

    const loginInfo = await loginInfoResp.json()
    

    const state = generateOAuth2State()
    const authCodeUrl = `${loginInfo.oauthUrl}/authorize?client_id=${BULLHORN_CLIENT_ID}&response_type=code&action=Login&username=${BULLHORN_API_USERNAME}&password=${BULLHORN_API_PASSWORD}&state=${state}`

    const authCodeResp = await fetch(authCodeUrl, {
      method: "GET",
      redirect: 'manual'
    })

    if (authCodeResp.status === 302 || authCodeResp.status === 307) {
      const location = authCodeResp.headers.get('location')

      if (location) {
        const url = new URL(location)
        const code = url.searchParams.get('code')
        const returnedState = url.searchParams.get('state')

        if (code && returnedState === state) {
          const tokenUrl = `${loginInfo.oauthUrl}/token?grant_type=authorization_code&code=${code}&client_id=${BULLHORN_CLIENT_ID}&client_secret=${BULLHORN_CLIENT_SECRET}`

          const tokenResp = await fetch(tokenUrl, {
            method: "POST",
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })

          if (!tokenResp.ok) {
            const errorText = await tokenResp.text()
            throw new Error(`Token request failed: ${tokenResp.status} - ${errorText}`)
          }

          const tokenData = await tokenResp.json()
           
          return {
            accessToken: tokenData.access_token,
            loginInfo
          }
        } else {
          throw new Error("Invalid authorization code response")
        }
      } else {
        throw new Error("No redirect location found")
      }
    } else {
      const responseText = await authCodeResp.text()
      throw new Error(`Authorization failed: ${authCodeResp.status} - ${responseText}`)
    }
  } catch (error) {
    console.error("Error getting access token:", error)
    throw error
  }
}

export async function authenticateWithBullhorn(accessToken, loginInfo) {
  try {
    const restLoginUrl = loginInfo.restUrl;
    const finalRestLoginURL = `${restLoginUrl}/login?version=2.0&access_token=${accessToken}`;

    const restUrlResp = await fetch(finalRestLoginURL, { method: "POST" });

    if (!restUrlResp.ok) {
      const errorText = await restUrlResp.text();
      throw new Error(`Bullhorn login failed: ${restUrlResp.status} - ${errorText}`);
    }

    const restUrlData = await restUrlResp.json();

    if (!restUrlData.restUrl || !restUrlData.BhRestToken) {
      throw new Error('Invalid login response from Bullhorn');
    }

    return {
      restUrl: restUrlData.restUrl,
      sessionToken: restUrlData.BhRestToken
    };
  } catch (error) {
    console.error("Error authenticating with Bullhorn:", error);
    throw error;
  }
}
