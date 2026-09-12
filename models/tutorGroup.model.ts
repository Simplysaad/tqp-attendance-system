import { Document, Types } from "mongoose";
import { Schema, model, models, Model } from "mongoose";

// --- Subdocument Types ---

export interface IQuranPosition {
    surahNumber?: number; // 1 - 114
    surahName?: string;   // e.g., "Al-Baqarah"
    aayah?: number;       // >= 1
    juz?: number;         // 1 - 30
}

export interface IMemorizationRange {
    start?: IQuranPosition;
    end?: IQuranPosition;
}

export interface ITutorGroupRules {
    maxCapacity: number;
    femaleOnly: boolean;
    memorizationRange?: IMemorizationRange;
}

// --- Base Interface ---

export interface ITutorGroup {
    tutor: Types.ObjectId;
    students: Types.ObjectId[];
    schedules: Types.ObjectId[];
    sessions: Types.ObjectId[];
    rules: ITutorGroupRules;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// --- Mongoose Document Interface ---

export interface ITutorGroupDocument extends ITutorGroup, Document {
    _id: Types.ObjectId;
}

// --- Populated Type Variants (For Server Actions/API Reponses) ---

export interface ITutorGroupPopulated extends Omit<ITutorGroup, "tutor" | "students" | "schedules" | "sessions"> {
    _id: Types.ObjectId;
    tutor: {
        _id: Types.ObjectId;
        name: string;
        email: string;
    };
    students: Array<{
        _id: Types.ObjectId;
        name: string;
        email: string;
    }>;
    schedules: Array<Record<string, unknown>>; // Replace with IScheduleDocument if available
    sessions: Array<Record<string, unknown>>;  // Replace with ISessionDocument if available
}



const quranPositionSchema = new Schema(
    {
        surahNumber: {
            type: Number,
            min: [1, "Surah number must be at least 1"],
            max: [114, "Surah number cannot exceed 114"],
        },
        surahName: {
            type: String,
            trim: true,
        },
        aayah: {
            type: Number,
            min: [1, "Aayah number must be at least 1"],
        },
        juz: {
            type: Number,
            min: [1, "Juz must be between 1 and 30"],
            max: [30, "Juz must be between 1 and 30"],
        },
    },
    { _id: false }
);

const memorizationRangeSchema = new Schema(
    {
        start: quranPositionSchema,
        end: quranPositionSchema,
    },
    { _id: false }
);

const rulesSchema = new Schema(
    {
        maxCapacity: {
            type: Number,
            default: 5,
            min: [1, "Capacity must be at least 1"],
        },
        femaleOnly: {
            type: Boolean,
            default: false,
        },
        memorizationRange: {
            type: memorizationRangeSchema,
            default: {},
        },
    },
    { _id: false }
);

const tutorGroupSchema = new Schema<ITutorGroupDocument>(
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
        schedules: [
            {
                type: Schema.Types.ObjectId,
                ref: "Schedule",
            },
        ],
        sessions: [
            {
                type: Schema.Types.ObjectId,
                ref: "Session",
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        rules: {
            type: rulesSchema,
            default: () => ({}),
        },
    },
    {
        timestamps: true,
    }
);

// Prevent re-compilation in Next.js HMR development mode
const TutorGroup: Model<ITutorGroupDocument> =
    models.TutorGroup || model<ITutorGroupDocument>("TutorGroup", tutorGroupSchema);

export default TutorGroup;