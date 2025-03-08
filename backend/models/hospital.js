import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Hospital name is required"],
        trim: true,
        minLength: [2, "Name must be at least 2 characters"]
    },
    contactNumber: {
        type: String,
        required: [true, "Contact number is required"],
        match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Please enter a valid 10-digit number"]
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        trim: true
    },
    services: [{
        name: {
            type: String,
            required: [true, "Service name is required"],
            trim: true
        },
        patientsWaiting: {
            type: Number,
            required: [true, "Number of patients waiting is required"],
            min: [0, "Number of patients waiting cannot be negative"]
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, {
    timestamps: true
});

hospitalSchema.index({ name: 1 });
hospitalSchema.index({ location: 1 });

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital;
