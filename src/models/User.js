import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
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
    },
    preferredLanguage: {
      type: String,
      default: "en-US",
      enum: {
        values: ["en-US", "hi-IN", "es-ES"],
        message: "{VALUE} is not a supported language",
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Instance method to get user's public profile
userSchema.methods.toPublicProfile = function () {
  return {
    userId: this._id,
    name: this.name,
    email: this.email,
    preferredLanguage: this.preferredLanguage,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
