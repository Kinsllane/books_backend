import mongoose, { Schema, Document } from 'mongoose';

export interface IDatabaseLog extends Document {
  operation: string;
  modelName: string;
  recordId?: string;
  action: string; // 'CREATE', 'UPDATE', 'DELETE', 'READ'
  userId?: string;
  changes?: any;
  success: boolean;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

const DatabaseLogSchema: Schema = new Schema({
  operation: {
    type: String,
    required: true
  },
  modelName: {
    type: String,
    required: true,
    index: true
  },
  recordId: {
    type: String,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'READ'],
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  error: {
    type: String
  },
  executionTime: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  }
}, {
  collection: 'database_logs',
  timestamps: false
});

// Индексы для быстрого поиска
DatabaseLogSchema.index({ timestamp: -1 });
DatabaseLogSchema.index({ modelName: 1, timestamp: -1 });
DatabaseLogSchema.index({ action: 1, timestamp: -1 });
DatabaseLogSchema.index({ success: 1, timestamp: -1 });
DatabaseLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model<IDatabaseLog>('DatabaseLog', DatabaseLogSchema);

