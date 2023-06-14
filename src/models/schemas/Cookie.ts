import { model, Model, Schema } from 'mongoose';

import { MODELS } from 'utils/constants/models';
import Cookies from 'models/types/Cookie';

const CookiesSchema = new Schema<Cookies>(
  {
    cookies: { type: [String], required: true, default: [] },
    username: { type: String, required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

CookiesSchema.index({ username: 1, cookies: 1 });

const CookiesModel: Model<Cookies> = model<Cookies>(MODELS.cookie, CookiesSchema, MODELS.cookie);
export default CookiesModel;
