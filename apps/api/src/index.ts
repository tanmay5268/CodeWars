import express from 'express';
import { utility } from '@repo/utils';
import {prisma} from "@repo/db";
const app = express();
const PORT = process.env.PORT || 5000;
utility('API is starting...');
app.get('/',async (req, res) => {
    try {
        const users = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: `john.doe+${Date.now()}@example.com`
        }
    });
    console.log(users);
    res.json({ message: 'Hello, World!', users: users });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
