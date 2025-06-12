import { Router } from "express";
import { signUp } from "../controllers/auth.controller.js";

const authRouter = Router();

// authRouter.post('/sign-up', (req, res) => res.send({ title: 'Sign Up' })); // Instead of directly setting handlers, that's why controllers are created.
authRouter.post('/sign-up', signUp);
// authRouter.post('/sign-in', signIn);
// authRouter.post('/sign-out', signOut);


export default authRouter;