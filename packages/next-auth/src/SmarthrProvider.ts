import { Provider } from 'next-auth/providers'
import { v4 as uuid } from 'uuid'

type Arguments = {
  smarthrUrl: string
  redirectUri: string
  clientId: string
  clientSecret: string
}

export const SmarthrProvider = ({ smarthrUrl, redirectUri, clientId, clientSecret }: Arguments): Provider => ({
  id: 'smarthr',
  name: 'SmartHR',
  type: 'oauth',
  authorization: `${smarthrUrl}/oauth/authorization`,
  token: {
    async request(context) {
      const res = await fetch(`${smarthrUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: context.params.code,
          client_id: context.provider.clientId,
          client_secret: context.provider.clientSecret,
          redirect_uri: redirectUri,
          skip: true,
        }),
      })
      const data = await res.json()

      return {
        tokens: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
        },
      }
    },
  },
  clientId,
  clientSecret,
  userinfo: `${smarthrUrl}/api/v1/users/me`,
  issuer: 'https://authlete.com',
  httpOptions: {
    // 認証時のタイムアウトを3500から延長
    timeout: 30000,
  },
  profile(profile) {
    return {
      id: profile.id,
      email: profile.email ?? uuid(), // next-auth ではこの email を使って redis に値を入れるので、社員番号ログインで email がない場合は uuid を代わりとする
      uid: profile.id,
    }
  },
})
