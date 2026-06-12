import { Schema, model } from 'mongoose';

const creditConfigSchema = new Schema({
  baseCredit: { type: Number, default: 1 },      // 'a' value in AP progression
  commonDifference: { type: Number, default: 2 } // 'd' value in AP progression
});

export const CreditConfig = model('CreditConfig', creditConfigSchema);