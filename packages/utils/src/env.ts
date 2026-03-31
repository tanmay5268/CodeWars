import 'dotenv/config';
class Env {
    static SOCKET_PORT = process.env.SOCKET_PORT;
    static SOCKET_URL = String(process.env.SOCKET_URL);
    static FRONTEND_URL = process.env.FRONTEND_URL;
    static FRONTEND_PORT = process.env.FRONTEND_PORT;
    static DATABASE_URL = process.env.DATABASE_URL;
}

export default Env;

