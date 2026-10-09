import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    guardianContact: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

studentSchema.index({ class: 1, rollNumber: 1 }, { unique: true });

export default mongoose.model('Student', studentSchema);
