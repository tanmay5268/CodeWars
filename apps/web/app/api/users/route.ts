import { prisma,Prisma } from "@repo/db";
export async function GET() {
  try {
    const createdUsers = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "example@examle.com",
      },
    });
    return Response.json(createdUsers);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return Response.json({ error: "Email already exists" }, { status: 409 });
      }

      const meta = error.meta as
        | { driverAdapterError?: { cause?: { originalMessage?: string } } }
        | undefined;

      return Response.json(
        {
          error: "Failed to create user",
          serverError: meta?.driverAdapterError?.cause?.originalMessage,
        },
        { status: 500 },
      );
    }

    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
