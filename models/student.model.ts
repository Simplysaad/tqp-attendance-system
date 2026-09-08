import mongoose, { Schema, Document, Model, model, Types } from "mongoose";

// Enums / Union Types
export type Gender = "male" | "female";
export type StudentStatus = "active" | "at risk" | "inactive";

// Sub-document Interface
export interface ICurrentMemorization {
    surah?: string;
    aayah?: number;
    juz?: number;
    page?: number;
}

// Base Student Interface
export interface IStudent {
    user: Types.ObjectId;
    matricNumber?: string;
    gender: Gender;
    faculty?: string;
    department?: string;
    level?: number;
    currentMemorization?: ICurrentMemorization;
    status: StudentStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

// Mongoose Document Interface
export interface IStudentDocument extends IStudent, Document { }

// Mongoose Model Interface
export interface IStudentModel extends Model<IStudentDocument> { }

const studentSchema = new Schema<IStudentDocument, IStudentModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            unique: true,
            index: true,
        },
        matricNumber: {
            type: String,
            trim: true,
            default: null,
        },
        gender: {
            type: String,
            enum: {
                values: ["male", "female"],
                message: "{VALUE} is not a valid gender option",
            },
            required: [true, "Gender is required"],
        },
        faculty: {
            type: String,
            trim: true,
        },
        department: {
            type: String,
            trim: true,
        },
        level: {
            type: Number,
            min: [100, "Level cannot be below 100"],
        },
        currentMemorization: {
            surah: { type: String, trim: true },
            aayah: { type: Number, min: 1 },
            juz: { type: Number, min: 1, max: 30 },
            page: { type: Number, min: 1, max: 604 },
        },
        status: {
            type: String,
            enum: {
                values: ["active", "at risk", "inactive"],
                message: "{VALUE} is not a valid status",
            },
            default: "active",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const Student =
    (mongoose.models.Student as IStudentModel) ||
    model<IStudentDocument, IStudentModel>("Student", studentSchema);

export default Student;