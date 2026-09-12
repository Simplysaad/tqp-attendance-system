import mongoose, { Schema, Document, Model, model, Types } from "mongoose";

// Union Types
export type DayOfWeek =
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday";

export type Gender = "male" | "female";

// Time Conversion Utility Functions
export const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
};

export const minutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

// Sub-document Interface
export interface IAvailability {
    _id?: Types.ObjectId;
    dayOfWeek: DayOfWeek;
    startTime: number; // Minutes from midnight (0 - 1439) e.g., 540 = 09:00 AM
    endTime: number;   // Minutes from midnight (0 - 1439) e.g., 1020 = 05:00 PM
    isActive: boolean;
}

// Base Tutor Interface
export interface ITutor {
    user: Types.ObjectId; // Replace with IUser interface if populated
    gender: Gender;
    maximumStudents: number;
    isActive: boolean;
    availability: IAvailability[];
    createdAt?: Date;
    updatedAt?: Date;
}

// Document Interface
export interface ITutorDocument extends ITutor, Document { }

// Model Interface
export interface ITutorModel extends Model<ITutorDocument> { }

// Availability Sub-schema
const availabilitySchema = new Schema<IAvailability>(
    {
        dayOfWeek: {
            type: String,
            enum: {
                values: [
                    "sunday",
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                ],
                message: "{VALUE} is not a valid day of the week",
            },
            required: [true, "Day of the week is required"],
            lowercase: true,
            trim: true,
        },
        startTime: {
            type: Number,
            required: [true, "Start time is required"],
            min: [0, "Start time cannot be less than 0 (00:00)"],
            max: [1439, "Start time cannot exceed 1439 (23:59)"],
        },
        endTime: {
            type: Number,
            required: [true, "End time is required"],
            min: [0, "End time cannot be less than 0 (00:00)"],
            max: [1439, "End time cannot exceed 1439 (23:59)"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { _id: true }
);

// Custom Validator: Ensure startTime is strictly before endTime
availabilitySchema.pre("validate", function () {
    if (
        this.startTime !== undefined &&
        this.endTime !== undefined &&
        this.startTime >= this.endTime
    ) {
        this.invalidate(
            "endTime",
            `End time (${minutesToTime(this.endTime)}) must be strictly after start time (${minutesToTime(this.startTime)})`
        );
    }
});

// Main Tutor Schema
const tutorSchema = new Schema<ITutorDocument, ITutorModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            unique: true,
            index: true,
        },
        gender: {
            type: String,
            enum: {
                values: ["male", "female"],
                message: "{VALUE} is not a valid gender",
            },
            required: [true, "Gender is required"],
        },
        // maximumStudents: {
        //     type: Number,
        //     required: [true, "Maximum students capacity is required"],
        //     min: [3, "Maximum students must be at least 3"],
        //     default: 5,
        // },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        availability: {
            type: [availabilitySchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Tutor =
    (mongoose.models.Tutor as ITutorModel) ||
    model<ITutorDocument, ITutorModel>("Tutor", tutorSchema);

export default Tutor;