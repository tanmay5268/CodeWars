import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
}
=NextAuth({
    session:{
        strategy:"jwt"
    },
    providers: [
        CredentialsProvider({
            name:"Credentials",
            async authorize(credentials){
                    try{
                        if(credentials === null) return null;
                        const user={
                            id:new Date().getTime().toString(),
                            email:credentials.email,
                            password:credentials.password
                        }
                        console.log(user);
                        return user;
                    }
                    catch(err){
                        console.log(err);
                        return null;
                    }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization:{
                params:{
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization:{
                params:{
                    prompt:"consent",
                    access_type:"offline",
                    response_type:"code"
                }
            }
        })
    ]
})
