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
      unique: true, // Making roll number globally unique for simplicity, or unique within the school
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
    guardianContact: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
