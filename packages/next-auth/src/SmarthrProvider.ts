import { v4 as uuid } from 'uuid'

import type { Provider } from 'next-auth/providers'

type Arguments = {
  smarthrUrl: string
  redirectUri: string
  clientId: string
  clientSecret: string
  useUuidForEmail?: boolean
}

export const SmarthrProvider = ({ smarthrUrl, redirectUri, clientId, clientSecret, useUuidForEmail }: Arguments): Provider => ({
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
      // email の重複による OAuthAccountNotLinked エラー避けるため、useUuidForEmail が true の場合は uuid を email として扱う
      // 社員番号ログインで email がない場合も uuid を代わりとする
      email: useUuidForEmail ? uuid() : (profile.email ?? uuid()),
      uid: profile.id,
      role: {
        session_timeout_in: profile.role?.session_timeout_in ?? null,
      },
    }
  },
})
