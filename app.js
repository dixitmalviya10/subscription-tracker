import express from 'express';

import { PORT } from './config/env.js';


import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from "./routes/subscription.routes.js";
import connectToDatabse from './db/db.js';

const app = express();

app.use('/api/v1/auth', authRouter); // app.use() is used for Middleware and Routing
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);

app.get('/', (req, res) => {
    res.send("Hello World");
})

app.listen(PORT, async () => {
    console.log(`Server is running on Port http://localhost:${PORT}`);
    await connectToDatabse();
})

export default app;