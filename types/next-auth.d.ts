import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: string
    memberId?: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      memberId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    memberId?: string
  }
}
