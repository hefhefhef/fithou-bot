import { Document } from 'mongoose';

export default interface Cookies extends Document {
  cookies: string[];
  username: string;
}
