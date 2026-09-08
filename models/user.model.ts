import mongoose, { Schema, Document, Model, model } from "mongoose";

// Role Enum / Union Type
export type UserRole = "student" | "tutor" | "admin";

// Base User Interface
export interface IUser {
    name: string;
    email: string;
    whatsappNumber: string;
    password?: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// Instance Methods Interface
export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Combined Document Interface
export interface IUserDocument extends IUser, IUserMethods, Document { }

// Model Interface
export interface IUserModel extends Model<IUserDocument> { }

const userSchema = new Schema<IUserDocument, IUserModel, IUserMethods>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        whatsappNumber: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email address",
            ],
            index: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false,
        },
        role: {
            type: String,
            enum: {
                values: ["student", "tutor", "admin"],
                message: "{VALUE} is not a valid role",
            },
            default: "student",
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                delete ret.password;
                return ret;
            },
        },
    }
);


const User =
    (mongoose.models.User as IUserModel) ||
    model<IUserDocument, IUserModel>("User", userSchema);

export default User;