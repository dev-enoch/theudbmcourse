import mongoose, { Schema, Document } from 'mongoose';

export interface IAutomationRule extends Document {
  name: string;
  trigger: 'inactive_14_days' | 'lesson_completed' | 'course_completed';
  subject: string;
  htmlBody: string;
  isActive: boolean;
  createdAt: Date;
}

const AutomationRuleSchema: Schema = new Schema({
  name: { type: String, required: true },
  trigger: { type: String, required: true, enum: ['inactive_14_days', 'lesson_completed', 'course_completed'] },
  subject: { type: String, required: true },
  htmlBody: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AutomationRule || mongoose.model<IAutomationRule>('AutomationRule', AutomationRuleSchema);
