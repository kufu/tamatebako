# `@smarthr/next-auth`

[![npm version](https://badge.fury.io/js/%40smarthr%2Fnext-auth.svg)](https://badge.fury.io/js/%40smarthr%2Fnext-auth)

next-auth に渡す adapter と provider を提供しているパッケージです。  
adapter は redis を使用し、provider は SmarthrProvider を使用することを想定しています。

RedisAdapter には ioredis のインスタンスを渡します。

## Usage

```typescript
// pages/api/auth/[...nextauth].ts

import type { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import { RedisAdapter, SmarthrProvider } from '@smarthr/next-auth'

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    adapter: RedisAdapter(redisClient),
    provider: [
      SmarthrProvider({
        smarthrUrl: 'smarthrUrl',
        redirectUri: 'redirectUri',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
      })
    ],
    // ...省略
  })
}
```

## License

This project is licensed under the terms of the [MIT license](https://github.com/kufu/tamatebako/blob/master/packages/next-auth/LICENSE).
