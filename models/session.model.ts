import mongoose, { Schema, Document, Model, model, Types } from "mongoose";

// Enums / Union Types
export type AttendanceStatus = "present" | "absent" | "partial" | "cancelled";
export type PerformanceRating = "excellent" | "good" | "fair" | "needs_work";

// Sub-document Interfaces
export interface IQuranPosition {
    surah?: string;
    aayah?: number;
    page?: number;
    juz?: number;
}

export interface IMemorizationRange {
    start?: IQuranPosition;
    end?: IQuranPosition;
}

// Base Session Interface
export interface ISession {
    schedule: Types.ObjectId;
    student: Types.ObjectId;
    tutor: Types.ObjectId;
    date: Date;
    startTime: number; // Minutes from midnight (0-1439)
    endTime: number;   // Minutes from midnight (0-1439)
    attendance: AttendanceStatus;
    newMemorization?: IMemorizationRange;
    revision?: IMemorizationRange;
    performance?: PerformanceRating;
    tutorsComment?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Mongoose Document & Model Interfaces
export interface ISessionDocument extends ISession, Document { }
export interface ISessionModel extends Model<ISessionDocument> { }

// Reusable Sub-schema for Quran Positions
const quranPositionSchema = new Schema<IQuranPosition>(
    {
        surah: { type: String, trim: true },
        aayah: { type: Number, min: 1 },
        page: { type: Number, min: 1, max: 604 },
        juz: { type: Number, min: 1, max: 30 },
    },
    { _id: false }
);

const memorizationRangeSchema = new Schema<IMemorizationRange>(
    {
        start: quranPositionSchema,
        end: quranPositionSchema,
    },
    { _id: false }
);

const sessionSchema = new Schema<ISessionDocument, ISessionModel>(
    {
        schedule: {
            type: Schema.Types.ObjectId,
            ref: "Schedule",
            required: [true, "Schedule reference is required"],
            index: true,
        },
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "Student reference is required"],
            index: true,
        },
        tutor: {
            type: Schema.Types.ObjectId,
            ref: "Tutor",
            required: [true, "Tutor reference is required"],
            index: true,
        },
        date: {
            type: Date,
            required: [true, "Session date is required"],
            index: true,
        },
        startTime: {
            type: Number,
            required: [true, "Start time is required"],
            min: [0, "Start time cannot be less than 0"],
            max: [1439, "Start time cannot exceed 1439"],
        },
        endTime: {
            type: Number,
            required: [true, "End time is required"],
            min: [0, "End time cannot be less than 0"],
            max: [1439, "End time cannot exceed 1439"],
        },
        attendance: {
            type: String,
            enum: {
                values: ["present", "absent", "partial", "cancelled"],
                message: "{VALUE} is not a valid attendance status",
            },
            required: [true, "Attendance status is required"],
            default: "present",
        },
        newMemorization: memorizationRangeSchema,
        revision: memorizationRangeSchema,
        performance: {
            type: String,
            enum: {
                values: ["excellent", "good", "fair", "needs_work"],
                message: "{VALUE} is not a valid performance rating",
            },
        },
        tutorsComment: {
            type: String,
            trim: true,
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient querying of a student's or tutor's daily sessions
sessionSchema.index({ student: 1, date: -1 });
sessionSchema.index({ tutor: 1, date: -1 });

// Synchronous validator: Ensure startTime < endTime
sessionSchema.pre("validate", function () {
    if (
        this.startTime !== undefined &&
        this.endTime !== undefined &&
        this.startTime >= this.endTime
    ) {
        this.invalidate("endTime", "End time must be strictly after start time");
    }
});

const Session =
    (mongoose.models.Session as ISessionModel) ||
    model<ISessionDocument, ISessionModel>("Session", sessionSchema);

export default Session;