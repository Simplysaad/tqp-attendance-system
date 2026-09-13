import mongoose, { Schema, Document, Model, model, Types } from "mongoose";
import { IMemorization } from "./student.model";

export type GoalType = "memorization" | "revision" | "attendance";
export type GoalStatus = "in_progress" | "completed" | "abandoned";

export interface IGoal {
    student: Types.ObjectId;
    semester: string; // e.g., "Fall 2026" or "Semester 1"
    type: GoalType;
    title: string;
    current: IMemorization;
    target: IMemorization;
    targetPages: number;
    targetVerses: number;
    startDate: Date;
    targetDate: Date;
    status: GoalStatus;
    progressPercentage: number; // 0 to 100
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IGoalDocument extends IGoal, Document { }
export interface IGoalModel extends Model<IGoalDocument> { }

// Sub-schema for Quranic position tracking
const memorizationPositionSchema = new Schema<IMemorization>(
    {
        surah: { type: String, trim: true },
        aayah: { type: Number, min: 1 },
        juz: { type: Number, min: 1, max: 30 },
        page: { type: Number, min: 1, max: 604 },
    },
    { _id: false }
);

const goalSchema = new Schema<IGoalDocument, IGoalModel>(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "Student reference is required"],
            index: true,
        },
        semester: {
            type: String,
            required: [true, "Semester is required"],
            trim: true,
        },
        title: {
            type: String,
            required: [true, "Goal title is required"],
            trim: true,
        },
        current: {
            type: memorizationPositionSchema,
            required: true,
        },
        target: {
            type: memorizationPositionSchema,
            required: true,
        },

        targetPages: {
            type: Number,
            default: 0
        },
        targetVerses: {
            type: Number,
            default: 0
        },


        type: {
            type: String,
            enum: ["memorization", "revision", "attendance"],
            default: "memorization",
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        targetDate: {
            type: Date,
            default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
        },
        status: {
            type: String,
            enum: ["in_progress", "completed", "abandoned"],
            default: "in_progress",
            index: true,
        },
        progressPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
    },
    { timestamps: true }
);

// Compound Index for student semester queries
goalSchema.index({ student: 1, semester: 1 });

const Goal =
    (mongoose.models.Goal as IGoalModel) ||
    model<IGoalDocument, IGoalModel>("Goal", goalSchema);

export default Goal;