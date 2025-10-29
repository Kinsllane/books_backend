import mongoose, { Schema, Document } from 'mongoose';

export interface IHttpLog extends Document {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  ip: string;
  userAgent?: string;
  userId?: string;
  requestBody?: any;
  responseBody?: any;
  error?: string;
  timestamp: Date;
}

const HttpLogSchema: Schema = new Schema({
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  url: {
    type: String,
    required: true,
    index: true
  },
  statusCode: {
    type: Number,
    required: true,
    index: true
  },
  responseTime: {
    type: Number,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  userId: {
    type: String
  },
  requestBody: {
    type: mongoose.Schema.Types.Mixed
  },
  responseBody: {
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  }
}, {
  collection: 'http_logs',
  timestamps: false
});

HttpLogSchema.index({ timestamp: -1 });
HttpLogSchema.index({ method: 1, timestamp: -1 });
HttpLogSchema.index({ statusCode: 1, timestamp: -1 });
HttpLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model<IHttpLog>('HttpLog', HttpLogSchema);

