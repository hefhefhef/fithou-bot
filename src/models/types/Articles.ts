import { Document } from 'mongoose';

export default interface Articles extends Document {
  aid: number;
  link: string;
  subscribedIDs: string[];
}
