import { prisma } from "@repo/db";

export async function GET() {
  const users = await prisma.user.findMany();
  return Response.json(users);
}
