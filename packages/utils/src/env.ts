type EnvKey =
	| 'BACKEND_PORT'
	| 'FRONTEND_PORT'
	| 'DATABASE_URL'
	| 'BACKEND_URL'
	| 'FRONTEND_URL';

function requireEnv(key: EnvKey): string {
	const value = process.env[key];
	if (typeof value === 'string' && value.length > 0) return value;
	throw new Error(
		`Missing required environment variable ${key}. ` +
			`Set it in your .env or deployment environment. (cwd: ${process.cwd()})`,
	);
}

class Env {
	static get BACKEND_PORT(): string {
		return requireEnv('BACKEND_PORT');
	}
	static get FRONTEND_PORT(): string {
		return requireEnv('FRONTEND_PORT');
	}
	static get DATABASE_URL(): string {
		return requireEnv('DATABASE_URL');
	}
	static get BACKEND_URL(): string {
		return requireEnv('BACKEND_URL');
	}
	static get FRONTEND_URL(): string {
		return requireEnv('FRONTEND_URL');
	}
}

export default Env;

