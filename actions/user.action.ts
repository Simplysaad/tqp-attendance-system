'use server';

import { cookies } from "next/headers";
import connectDB from '@/lib/db';
import User, { IUser } from '@/models/user.model';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';


const SESSION_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Helper to set a secure httpOnly cookie containing user session data
 */
async function setUserSessionCookie(user: Record<string, any>) {
    const cookieStore = await cookies();

    // Create a minimal session payload (exclude sensitive fields)
    const sessionData = JSON.stringify({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
    });

    cookieStore.set("session", sessionData, {
        httpOnly: true, // Prevents client-side JS access (mitigates XSS)
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "lax",
        path: "/",
        expires: new Date(Date.now() + SESSION_EXPIRATION_MS),
    });
}

// 1. Register User Action
export async function registerUser(formData: IUser) {
    try {
        let conn = await connectDB();
        console.log("conn", conn)

        if (!formData.password) {
            return { success: false, error: "Error registering user, empty password" };
        }

        const hashedPassword = await bcrypt.hash(formData.password, 10);
        const newUser = await User.create({
            ...formData,
            password: hashedPassword,
        });

        const sanitizedUser = JSON.parse(JSON.stringify(newUser));
        delete sanitizedUser.password;

        // Persist session cookie on registration
        await setUserSessionCookie(sanitizedUser);



        return { success: true, user: sanitizedUser };
    } catch (error: any) {
        return { success: false, error: error.message || "Registration failed" };
    }
}

// 2. Authenticate User Action
export async function loginUser(email: string, password: string) {
    try {
        await connectDB();

        // Find user by email and explicitly select password field
        const user = await User.findOne({ email }).select("+password");

        if (!user || !user.password) {
            return { success: false, error: "Invalid email or password" };
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password);

        if (!isCorrectPassword) {
            return { success: false, error: "Invalid email or password" };
        }

        user.lastLoginAt = new Date();
        await user.save();

        const sanitizedUser = JSON.parse(JSON.stringify(user));
        delete sanitizedUser.password;

        // Persist session cookie on successful login
        await setUserSessionCookie(sanitizedUser);
        // // console.log("loggedIn user", sanitizedUser)

        return { success: true, user: sanitizedUser };
    } catch (error: any) {
        return { success: false, error: error.message || "Login failed" };
    }
}

// 3. Helper to read current session in Server Components / Actions
export async function getSession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) return null;

    try {
        return JSON.parse(sessionCookie);
    } catch {
        return null;
    }
}

// 4. Logout Action
export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return { success: true };
}

// 2. Fetch Single User Profile
export async function getUserById(userId: string) {
    try {
        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return { success: false, error: 'Invalid user ID' };
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, user: JSON.parse(JSON.stringify(user)) };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to fetch user' };
    }
}

// 3. Update User Profile
export async function updateUser(userId: string, updateData: Partial<IUser>) {
    try {
        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return { success: false, error: 'Invalid user ID' };
        }

        const payload = { ...updateData };

        // FIXED: Hash password if it is being updated
        if (payload.password) {
            payload.password = await bcrypt.hash(payload.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: payload },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, user: JSON.parse(JSON.stringify(updatedUser)) };
    } catch (error: any) {
        return { success: false, error: error.message || 'Update failed' };
    }
}

// 4. Delete Account
export async function deleteUser(userId: string) {
    try {
        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return { success: false, error: 'Invalid user ID' };
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, message: 'User deleted successfully' };
    } catch (error: any) {
        return { success: false, error: error.message || 'Deletion failed' };
    }
}

// 5. Fetch Users by Role (e.g., list all tutors)
export async function getUsersByRole(role: 'student' | 'tutor') {
    try {
        await connectDB();

        const users = await User.find({ role }).select('-password');

        return { success: true, users: JSON.parse(JSON.stringify(users)) };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to fetch users' };
    }
}