import jwt from 'jsonwebtoken';

import { Request, Response, NextFunction } from 'express';
import { UserType } from '../components/user/user.type';

import User from '../components/user/user.model';
interface JwtPayload {
  user: UserType;
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.locals.path = req.path;
  res.locals.isLoggedIn = false;
  res.locals.errors = [];
  res.locals.user = null;
  res.locals.isUserAdmin = false;
  res.locals.isUserMember = false;

  const token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;

      if (decoded) {
        res.locals.user = decoded.user;
        res.locals.isLoggedIn = true;
        res.locals.isUserAdmin = decoded.user.admin;
        res.locals.isUserMember = decoded.user.member;
      }
    } catch (error) {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.clearCookie('jwt');
        res.clearCookie('refreshToken');
        return res.redirect('/login');
      }
      const user = await User.findOne({ refreshToken });
      if (!user) {
        res.clearCookie('jwt');
        res.clearCookie('refreshToken');
        return res.redirect('/login');
      }

      const refreshTokenIsValid = await User.checkRefreshTokenValidity(
        refreshToken,
        user.username,
      );
      if (!refreshTokenIsValid) {
        res.clearCookie('jwt');
        res.clearCookie('refreshToken');
        return res.redirect('/login');
      }

      const newAccessToken = jwt.sign(
        { user },
        process.env.JWT_SECRET as string,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      );

      res.cookie('jwt', newAccessToken, { httpOnly: true });

      // const decodedRefreshToken = jwt.verify(
      //     refreshToken,
      //     process.env.JWT_REFRESH_SECRET as string,
      //     ) as { username: string};

      // if(decodedRefreshToken.username !== user.username) {
      //     res.clearCookie('jwt');
      //     res.clearCookie('refreshToken');
      //   return res.redirect('/login');
      // }

      //   res.clearCookie('jwt');
      //   return res.redirect('/login');
    }
  }

  next();
};

export default authMiddleware;
