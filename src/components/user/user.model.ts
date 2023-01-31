import mongoose from 'mongoose';

import { UserType } from './user.type';

export interface IUser extends UserType {
  checkRefreshTokenValidity: (
    refreshToken: string,
    username: string,
  ) => Promise<boolean>;
}

export interface IUserModel extends mongoose.Model<IUser> {
  checkRefreshTokenValidity: (
    refreshToken: string,
    username: string,
  ) => Promise<boolean>;
}

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxLength: 50,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxLength: 255,
    },
    member: {
      type: Boolean,
      default: false,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    versionKey: false,
  },
);

userSchema.statics.checkRefreshTokenValidity = async function (
  refreshToken: string,
  username: string,
) {
  const user = await this.findOne({ refreshToken });
  if (!user) {
    return false;
  }
  if (user.username !== username) {
    return false;
  }
  return true;
};
const User: IUserModel = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
