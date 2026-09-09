import mongoose, { Schema, Document, Model, model, Types } from "mongoose";

export type DayOfWeek = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
export type ScheduleMode = "online" | "physical";
export type ScheduleStatus = "active" | "inactive";

export interface ISchedule {
    tutor: Types.ObjectId;
    students: Types.ObjectId[];
    maxCapacity?: number;
    dayOfWeek: DayOfWeek;
    startTime: number;
    endTime: number;
    mode: ScheduleMode;
    pseudoLink?: string; // Stored field
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
            default: 1,
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
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "inactive"
        },
        pseudoLink: {
            type: String,
            trim: true
        },
        googleMeetLink: { type: String, trim: true },
        googleCalendarId: { type: String, trim: true },
        googleEventId: { type: String, trim: true },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Compound index
scheduleSchema.index({ tutor: 1, dayOfWeek: 1 });

// Ensure startTime is before endTime & generate pseudoLink
scheduleSchema.pre("save", function () {
    if (this.startTime !== undefined && this.endTime !== undefined && this.startTime >= this.endTime) {
        this.invalidate("endTime", "End time must be strictly after start time");
    }

    // Generate pseudoLink if missing or on new document creation
    if (this.isNew || !this.pseudoLink) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL || "http://localhost:3000";
        this.pseudoLink = `${baseUrl}/join/${this._id}`;
    }
});



const DAYS_OF_WEEK: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

scheduleSchema.pre(["find", "findOne", "countDocuments"], function () {
    const query = this.getQuery();

    if ("status" in query) {
        const targetStatus = query.status;
        delete query.status;

        const now = new Date();
        const currentDay = DAYS_OF_WEEK[now.getDay()];
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const activeConditions = {
            dayOfWeek: currentDay,
            startTime: { $lte: currentMinutes },
            endTime: { $gte: currentMinutes },
        };

        if (targetStatus === "active") {
            Object.assign(query, activeConditions);
        } else if (targetStatus === "inactive") {
            query.$nor = [activeConditions];
        }
    }
});

// Clear model cache in dev so Next.js reloads changes immediately
if (process.env.NODE_ENV !== "production") {
    delete (mongoose.models as any).Schedule;
}

const Schedule =
    (mongoose.models.Schedule as IScheduleModel) ||
    model<IScheduleDocument, IScheduleModel>("Schedule", scheduleSchema);

export default Schedule;