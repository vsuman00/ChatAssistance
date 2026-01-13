import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  owner_id: mongoose.Types.ObjectId;
  name: string;
  system_prompt: string;
  model_config: {
    provider: string;
    model: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    owner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    system_prompt: {
      type: String,
      default: "You are a helpful AI assistant.",
      maxlength: [10000, "System prompt cannot exceed 10000 characters"],
    },
    model_config: {
      provider: {
        type: String,
        default: "openrouter",
        enum: ["openai", "openrouter"],
      },
      model: {
        type: String,
        default: "meta-llama/llama-3.3-70b-instruct:free",
      },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Project: Model<IProject> =
  models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
