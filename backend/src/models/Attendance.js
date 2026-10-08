import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    attendanceDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT'],
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate attendance
// for the same student on the same date in the same class
attendanceSchema.index({ student: 1, class: 1, attendanceDate: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
