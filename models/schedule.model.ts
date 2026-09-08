import mongoose, { Schema, Document, Model, model, Types } from "mongoose";

export type DayOfWeek = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
export type ScheduleMode = "online" | "physical";
export type ScheduleStatus = "active" | "inactive";

export interface ISchedule {
    tutor: Types.ObjectId;
    students: Types.ObjectId[]; // Array of assigned students
    maxCapacity?: number;
    dayOfWeek: DayOfWeek;
    startTime: number; // Minutes from midnight (0–1439)
    endTime: number;   // Minutes from midnight (0–1439)
    mode: ScheduleMode;
    pseudoLink: string;
    googleMeetLink?: string;
    googleCalendarId?: string;
    googleEventId?: string;
    status: ScheduleStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IScheduleDocument extends ISchedule, Document { }
export interface IScheduleModel extends Model<IScheduleDocument> { }

const scheduleSchema = new Schema<IScheduleDocument, IScheduleModel>(
    {
        tutor: {
            type: Schema.Types.ObjectId,
            ref: "Tutor",
            required: [true, "Tutor reference is required"],
            index: true,
        },
        students: [
            {
                type: Schema.Types.ObjectId,
                ref: "Student",
            },
        ],
        maxCapacity: {
            type: Number,
            default: 1, // Change to >1 for group classes
        },
        dayOfWeek: {
            type: String,
            enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
            required: [true, "Day of the week is required"],
            lowercase: true,
            trim: true,
        },
        startTime: {
            type: Number,
            required: [true, "Start time is required"],
            min: 0,
            max: 1439,
        },
        endTime: {
            type: Number,
            required: [true, "End time is required"],
            min: 0,
            max: 1439,
        },
        mode: {
            type: String,
            enum: ["online", "physical"],
            default: "online",
        },
        pseudoLink: {
            type: String,
            trim: true,
            default: ""
        },
        googleMeetLink: { type: String, trim: true },
        googleCalendarId: { type: String, trim: true },
        googleEventId: { type: String, trim: true },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            index: true,
        },
    },
    { timestamps: true }
);

// Compound index to quickly find a tutor's schedule for a specific day
scheduleSchema.index({ tutor: 1, dayOfWeek: 1 });

// Ensure startTime is before endTime
scheduleSchema.pre("validate", function () {
    if (this.startTime !== undefined && this.endTime !== undefined && this.startTime >= this.endTime) {
        this.invalidate("endTime", "End time must be strictly after start time");
    }
});

const Schedule =
    (mongoose.models.Schedule as IScheduleModel) ||
    model<IScheduleDocument, IScheduleModel>("Schedule", scheduleSchema);

export default Schedule;