/**
 * modified from https://github.com/nextauthjs/next-auth/tree/main/packages/adapter-upstash-redis
 *
 * ISC License
 *
 * Copyright (c) 2022-2023, Balázs Orbán
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/**
 * NextAuth の Upstash Redis Adapter のコードの hydrateDates の最初に JSON.parse() を加えています
 */
import { v4 as uuid } from 'uuid'

import type { Redis } from 'ioredis'
import type { Account as AdapterAccount } from 'next-auth'
import type { Adapter, AdapterSession, AdapterUser } from 'next-auth/adapters'

const prefixes = {
  accountKey: 'user:account:',
  accountByUserId: 'user:account:by-user-id:',
  emailKey: 'user:email:',
  sessionKey: 'user:session:',
  sessionByUserIdKey: 'user:session:by-user-id:',
  userKey: 'user:',
  verificationTokenKey: 'user:token:',
}

const isoDateRE =
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/
function isDate(value: any) {
  return value && isoDateRE.test(value) && !isNaN(Date.parse(value))
}
const expireSec = 604800 // 7日間

function hydrateDates(jsonStr: string) {
  const json = JSON.parse(jsonStr)
  return Object.entries(json).reduce((acc, [key, val]) => {
    acc[key] = isDate(val) ? new Date(val as string) : val
    return acc
  }, {} as any)
}

export function RedisAdapter(redis: Redis): Adapter {
  const set = async (key: string, value: string | number) => {
    await redis.setex(key, expireSec, value)
  }
  const setObjectAsJson = async (key: string, obj: any) => {
    await redis.setex(key, expireSec, JSON.stringify(obj))
  }

  const setAccount = async (id: string, account: AdapterAccount) => {
    const accountKey = prefixes.accountKey + id
    await setObjectAsJson(accountKey, account)
    await set(prefixes.accountByUserId + account.userId, accountKey)
    return account
  }

  const getAccount = async (id: string) => {
    const account = await redis.get(prefixes.accountKey + id)
    if (!account) return null
    return hydrateDates(account)
  }

  const setSession = async (id: string, session: AdapterSession): Promise<AdapterSession> => {
    const sessionKey = prefixes.sessionKey + id
    await setObjectAsJson(sessionKey, session)
    await set(prefixes.sessionByUserIdKey + session.userId, sessionKey)
    return session
  }

  const getSession = async (id: string) => {
    const session = await redis.get(prefixes.sessionKey + id)
    if (!session) return null
    return hydrateDates(session)
  }

  const setUser = async (id: string, user: AdapterUser): Promise<AdapterUser> => {
    await setObjectAsJson(prefixes.userKey + id, user)
    await set(`${prefixes.emailKey}${user.email as string}`, id)
    return user
  }

  const getUser = async (id: string) => {
    const user = await redis.get(prefixes.userKey + id)
    if (!user) return null
    return hydrateDates(user)
  }

  return {
    async createUser(user: AdapterUser) {
      const id = uuid()
      // TypeScript thinks the emailVerified field is missing
      // but all fields are copied directly from user, so it's there
      return setUser(id, { ...user, id })
    },
    getUser,
    async getUserByEmail(email) {
      const userId = await redis.get(prefixes.emailKey + email)
      if (!userId) {
        return null
      }
      return getUser(userId)
    },
    async getUserByAccount(account) {
      const dbAccount = await getAccount(`${account.provider}:${account.providerAccountId}`)
      if (!dbAccount) return null
      return getUser(dbAccount.userId)
    },
    async updateUser(updates) {
      const userId = updates.id as string
      const user = await getUser(userId)
      return setUser(userId, { ...(user as AdapterUser), ...updates })
    },
    async linkAccount(account: AdapterAccount) {
      const id = `${account.provider}:${account.providerAccountId}`
      await setAccount(id, { ...account, id })
    },
    async createSession(session) {
      const id = session.sessionToken
      return setSession(id, { ...session })
    },
    async getSessionAndUser(sessionToken) {
      const session = await getSession(sessionToken)
      if (!session) return null
      const user = await getUser(session.userId)
      if (!user) return null
      return { session, user }
    },
    async updateSession(updates) {
      const session = await getSession(updates.sessionToken)
      if (!session) return null
      return setSession(updates.sessionToken, { ...session, ...updates })
    },
    async deleteSession(sessionToken) {
      await redis.del(prefixes.sessionKey + sessionToken)
    },
    async createVerificationToken(verificationToken) {
      await setObjectAsJson(
        prefixes.verificationTokenKey + verificationToken.identifier + ':' + verificationToken.token,
        verificationToken,
      )
      return verificationToken
    },
    async useVerificationToken(verificationToken) {
      const tokenKey = prefixes.verificationTokenKey + verificationToken.identifier + ':' + verificationToken.token

      const token = await redis.get(tokenKey)
      if (!token) return null

      await redis.del(tokenKey)
      return hydrateDates(token)
      // return reviveFromJson(token)
    },
    async unlinkAccount(account: AdapterAccount) {
      const id = `${account.provider}:${account.providerAccountId}`
      const dbAccount = await getAccount(id)
      if (!dbAccount) return
      const accountKey = `${prefixes.accountKey}${id}`
      await redis.del(accountKey, `${prefixes.accountByUserId} + ${dbAccount.userId as string}`)
    },
    async deleteUser(userId) {
      const user = await getUser(userId)
      if (!user) return
      const accountByUserKey = prefixes.accountByUserId + userId
      const accountKey = await redis.get(accountByUserKey)
      const sessionByUserIdKey = prefixes.sessionByUserIdKey + userId
      const sessionKey = await redis.get(sessionByUserIdKey)
      await redis.del(
        prefixes.userKey + userId,
        `${prefixes.emailKey}${user.email as string}`,
        accountKey as string,
        accountByUserKey,
        sessionKey as string,
        sessionByUserIdKey,
      )
    },
  }
}
