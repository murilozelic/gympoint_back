import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    student_id: {
      type: Number,
      required: true,
    },
    question: {
      type: String,
      required: true,
      default: null,
    },
    answer: {
      type: String,
      default: null,
    },
    answer_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Order', OrderSchema);
