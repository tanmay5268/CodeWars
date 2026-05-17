import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import { prisma } from "@repo/db";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback) as (
    password: string,
    salt: string,
    keylen: number
) => Promise<Buffer>;

const PASSWORD_HASH_PREFIX = "scrypt";
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEY_BYTES = 64;

function isHashedPassword(value: string): boolean {
    return value.startsWith(`${PASSWORD_HASH_PREFIX}:`);
}

async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(PASSWORD_SALT_BYTES).toString("hex");
    const derivedKey = await scrypt(password, salt, PASSWORD_KEY_BYTES);
    return `${PASSWORD_HASH_PREFIX}:${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [prefix, salt, keyHex] = storedHash.split(":");
    if (prefix !== PASSWORD_HASH_PREFIX || !salt || !keyHex) return false;

    const derivedKey = await scrypt(password, salt, PASSWORD_KEY_BYTES);
    const storedKey = Buffer.from(keyHex, "hex");
    if (storedKey.length !== derivedKey.length) return false;

    return timingSafeEqual(storedKey, derivedKey);
}

type UserWithPassword = {
    id: number;
    email: string;
    name: string | null;
    password: string;
};
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
                        const email = credentials?.email;
                        const password = credentials?.password;
                        const name = credentials?.name;
                        if (typeof email !== "string" || typeof password !== "string") {
                            return null;
                        }

                        const existingUser = (await prisma.user.findUnique({
                            where:{
                                email
                            }
                        })) as UserWithPassword | null;

                        if(!existingUser){
                            const hashedPassword = await hashPassword(password);
                            const newUser = await prisma.user.create({
                                data:{
                                    email,
                                    password: hashedPassword,
                                    name: typeof name === "string" ? name : undefined
                                }
                            });
                            return {
                                id: newUser.id.toString(),
                                email: newUser.email,
                                name: newUser.name
                            };
                        }

                        let passwordValid = false;
                        if (isHashedPassword(existingUser.password)) {
                            passwordValid = await verifyPassword(password, existingUser.password);
                        } else {
                            passwordValid = existingUser.password === password;
                            if (passwordValid) {
                                const upgradedHash = await hashPassword(password);
                                await prisma.user.update({
                                    where: { id: existingUser.id },
                                    data: { password: upgradedHash }
                                });
                            }
                        }

                        if (!passwordValid) return null;

                        return {
                            id: existingUser.id.toString(),
                            email: existingUser.email,
                            name: existingUser.name
                        };
                    }
                    catch(err){
                        console.log("ERROR FROM AUTH.TS:", err);
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
