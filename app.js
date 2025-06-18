import express from 'express';

import { PORT } from './config/env.js';


import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from "./routes/subscription.routes.js";
import connectToDatabse from './db/db.js';
import errorMiddleware from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';

const app = express();

// Some inbuilt middlewares provided by express.
app.use(express.json()); // This allows your app to handle JSON data sent in requests or API calls.
app.use(express.urlencoded({ extended: false })) // This helps us to process the form data sent via HTML forms in a simple format.
app.use(cookieParser()); // additional package
app.use(arcjetMiddleware);

app.use('/api/v1/auth', authRouter); // app.use() is used for Middleware and Routing
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);

// custom middleware
app.use(errorMiddleware);

app.get('/', (req, res) => {
    res.send("Hello World");
})

app.listen(PORT, async () => {
    console.log(`Server is running on Port http://localhost:${PORT}`);
    await connectToDatabse();
})

export default app;