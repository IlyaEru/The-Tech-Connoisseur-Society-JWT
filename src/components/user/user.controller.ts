import express from 'express';
import User from './user.model';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import { body, validationResult } from 'express-validator';

dotenv.config();

const getMember = (req: express.Request, res: express.Response) => {
  if (!res.locals.isLoggedIn) {
    return res.redirect('/login');
  }

  res.render('member', { pageTitle: 'Become a Member' });
};

const postMember = [
  body('passcode')
    .trim()
    .exists()
    .withMessage('Passcode is required')
    .custom((value, { req }) => {
      if (
        value.trim().toLowerCase() !==
        process.env.MEMBER_PASSCODE?.toLowerCase()
      ) {
        throw new Error('Incorrect passcode');
      }
      return true;
    }),
  async (req: express.Request, res: express.Response) => {
    if (!res.locals.isLoggedIn) {
      return res.redirect('/login');
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('member', {
        pageTitle: 'Become a Member',

        errors: errors.array(),
      });
    } else {
      await User.findByIdAndUpdate(res.locals.user._id, { member: true });
      const user = await User.findById(res.locals.user._id);
      const newToken = jwt.sign({ user }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      res.cookie('jwt', newToken, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        httpOnly: true,
      });
      res.redirect('/');
    }
  },
];

const getAdmin = (req: express.Request, res: express.Response) => {
  if (!res.locals.isLoggedIn) {
    return res.redirect('/login');
  }

  res.render('admin', { pageTitle: 'Become an Admin' });
};

const postAdmin = [
  body('passcode')
    .trim()
    .exists()
    .withMessage('Passcode is required')
    .custom((value, { req }) => {
      if (
        value.trim().toLowerCase() !== process.env.ADMIN_PASSCODE?.toLowerCase()
      ) {
        throw new Error('Incorrect passcode');
      } else {
        return true;
      }
    }),
  async (req: express.Request, res: express.Response) => {
    if (!res.locals.isLoggedIn) {
      return res.redirect('/login');
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('admin', {
        pageTitle: 'Become an Admin',

        errors: errors.array(),
      });
    } else {
      await User.findByIdAndUpdate(res.locals.user._id, { admin: true });
      const user = await User.findById(res.locals.user._id);
      const newToken = jwt.sign({ user }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      res.cookie('jwt', newToken, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        httpOnly: true,
      });
      res.redirect('/');
    }
  },
];

export { getMember, postMember, getAdmin, postAdmin };
