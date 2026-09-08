import mongoose, { Schema, Document, Model, model, Types } from "mongoose";

export type GoalType = "memorization" | "revision" | "attendance";
export type GoalStatus = "in_progress" | "completed" | "abandoned";

export interface IGoal {
    student: Types.ObjectId;
    semester: string; // e.g., "Fall 2026" or "Semester 1"
    type: GoalType;
    title: string;
    targetJuz?: number;
    targetPages?: number;
    startDate: Date;
    targetDate: Date;
    status: GoalStatus;
    progressPercentage: number; // 0 to 100
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IGoalDocument extends IGoal, Document { }
export interface IGoalModel extends Model<IGoalDocument> { }

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
            required: [true, "Semester name is required"],
            trim: true,
        },
        type: {
            type: String,
            enum: ["memorization", "revision", "attendance"],
            default: "memorization",
        },
        title: {
            type: String,
            required: [true, "Goal title is required"],
            trim: true,
        },
        targetJuz: { type: Number, min: 1, max: 30 },
        targetPages: { type: Number, min: 1, max: 604 },
        startDate: { type: Date, required: true },
        targetDate: { type: Date, required: true },
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

goalSchema.index({ student: 1, semester: 1 });

const Goal = model<IGoalDocument, IGoalModel>("Goal", goalSchema);
export default Goal;