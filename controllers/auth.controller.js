import mongoose from "mongoose"
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import User from "../models/user.model.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js"

export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    // Note: This session is not related to a user session. 
    // It is a Mongoose transaction session used for atomic operations.
    // Calling session.startTransaction() allows you to perform multiple 
    // database operations atomically — meaning **all operations must succeed**, 
    // or **none of them are applied** (all-or-nothing).
    //
    // This is important for maintaining data integrity. For example, if you're 
    // creating a user and updating other related documents, and something fails 
    // midway (e.g., DB write error), the transaction will rollback so the database 
    // doesn’t end up in an inconsistent or partial state.
    //
    // Without transactions, partial writes could lead to bugs or corrupted data 
    // (e.g., a user created without required relationships or roles).

    try {
        // Creating new User.
        const { name, email, password } = req.body;

        // Check if a user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        // Hashing the password
        const salt = await bcrypt.genSalt(10);  // salt is one of the type for hashing password.
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUsers = await User.create([{ name, email, password: hashedPassword }], { session }); // Returns all the newUsers
        const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }); // Since returns all users we only want one user which is newly created.
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: newUsers[0]
            }

        });
    } catch (error) {
        // If something wents wrong.
        await session.abortTransaction(); // Abort the transaction
        session.endSession(); // End the session
        next(error); // move next with the error
    }
}

export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        const isPasswordVaild = await bcrypt.compare(password, user.password);
        if (!isPasswordVaild) {
            const error = new Error('Invalid Password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: {
                token, user,
            }
        })
    } catch (error) {
        next(error);
    }
}

// export const signOut = async (req, res, next) => {
//     try {
        
//     } catch (error) {
//         next(error)
//     }
// }