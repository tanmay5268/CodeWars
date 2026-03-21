import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "./generated/prisma/client";

function getDatabaseUrl(): string {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error(
			"DATABASE_URL is not set. Add it to your environment (e.g. a root .env or apps/api/.env) before importing @repo/db.",
		);
	}
	return databaseUrl;
}

function createPrismaClient() {
	const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });

	const log: Prisma.LogLevel[] | Prisma.LogDefinition[] =
		process.env.PRISMA_LOG_QUERIES === "true"
			? [
					{ emit: "event", level: "query" },
					{ emit: "stdout", level: "warn" },
					{ emit: "stdout", level: "error" },
				]
			: ["warn", "error"];

	const client = new PrismaClient({ adapter, log });

	if (process.env.PRISMA_LOG_QUERIES === "true") {
		client.$on("query", (event) => {
			// Keep this terse; query text can be large.
			console.log(`[prisma:query] ${event.duration}ms ${event.query}`);
		});
	}

	return client;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

export { prisma, Prisma, PrismaClient, createPrismaClient };

const isDirectRun = typeof require !== "undefined" && require.main === module;

if (isDirectRun) {
	prisma
		.$connect()
		.then(async () => {
			console.log("[db] Prisma connected successfully.");
		})
		.catch((error) => {
			console.error("[db] Prisma connection failed:", error);
			process.exitCode = 1;
		})
		.finally(async () => {
			await prisma.$disconnect();
		});
}
