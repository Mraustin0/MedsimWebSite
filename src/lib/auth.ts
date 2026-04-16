import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import '@/types'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_SECRET",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Authorize called with email:", credentials?.email)
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password")
          return null
        }
        
        try {
          // Find or create a test user
          let user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.log("User not found, creating new user:", credentials.email)
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split('@')[0],
                role: 'STUDENT',
              }
            })
          }

          console.log("User authorized successfully:", user.id)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,  
            yearOfStudy: user.yearOfStudy,
            specialty: user.specialty,
            university: user.university,
            avatarUrl: user.avatarUrl,
          }
        } catch (error) {
          console.error("Auth authorize error details:", error)
          return null
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false
        
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split('@')[0],
              avatarUrl: user.image,
              role: 'STUDENT',
            }
          })
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.yearOfStudy = user.yearOfStudy
        token.specialty = user.specialty
        token.university = user.university
        // avatarUrl intentionally excluded — can be large base64 and bloat the JWT cookie
      }

      // Handle session updates — never spread avatarUrl into the token
      if (trigger === "update" && session) {
        const { avatarUrl: _ignored, ...rest } = session.user ?? {}
        return { ...token, ...rest }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.yearOfStudy = token.yearOfStudy
        session.user.specialty = token.specialty
        session.user.university = token.university
        // avatarUrl is NOT stored in the JWT — fetch from /api/user/me instead
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === 'development',
}
