import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    grade: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    period: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// We allow multiple classes with same grade/section but different periods/teachers.

export default mongoose.model('Class', classSchema);
