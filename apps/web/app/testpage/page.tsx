"use client";
import { useSession } from 'next-auth/react'
const page = () => {
  const { data: session } = useSession()
  return (
    <div>
        <h1>Test Page</h1>
        {session ? (
          <div>
            <p>Welcome, {session.user?.name}!</p>
            <p>Email: {session.user?.email}</p>
          </div>
        ) : (
          <p>You are not logged in.</p>
        )}
    </div>
  )
}

export default page
