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
  },
  { timestamps: true }
);

// Optional: ensure class combinations are unique
classSchema.index({ grade: 1, section: 1 }, { unique: true });

export default mongoose.model('Class', classSchema);
