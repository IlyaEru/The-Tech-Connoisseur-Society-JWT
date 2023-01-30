import { UserType } from '../components/user/user.type';

declare namespace Express {
  interface Request {
    user?: UserType | undefined;
  }
  interface Response {
    user?: UserType | undefined;
  }
}
