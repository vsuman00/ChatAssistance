import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface ISource extends Document {
  projectId: mongoose.Types.ObjectId;
  fileName: string;
  content: string;
  createdAt: Date;
}

const SourceSchema = new Schema<ISource>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Source: Model<ISource> =
  models.Source || mongoose.model<ISource>("Source", SourceSchema);

export default Source;
