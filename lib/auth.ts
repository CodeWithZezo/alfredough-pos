import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const dbUrl = process.env.DATABASE_URL ?? 'NOT SET'
        console.log('[auth] DATABASE_URL:', dbUrl)
        const dbPath = dbUrl.replace('file:', '')
        const absPath = path.resolve(process.cwd(), dbPath)
        console.log('[auth] resolved DB path:', absPath)
        console.log('[auth] DB file exists:', fs.existsSync(absPath))
        console.log('[auth] authorize called, username:', credentials?.username)
        if (!credentials?.username || !credentials?.password) {
          console.log('[auth] missing credentials')
          return null
        }
        const admin = await prisma.admin.findUnique({ where: { username: credentials.username } })
        console.log('[auth] admin found:', !!admin)
        if (!admin) return null
        const isValid = await bcrypt.compare(credentials.password, admin.password)
        console.log('[auth] password valid:', isValid)
        if (!isValid) return null
        console.log('[auth] login success, id:', admin.id)
        return { id: admin.id.toString(), name: admin.name, email: admin.username }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id
      }
      return session
    },
  },
}