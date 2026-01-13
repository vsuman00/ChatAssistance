import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IMessage extends Document {
  projectId: mongoose.Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
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

const Message: Model<IMessage> =
  models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
