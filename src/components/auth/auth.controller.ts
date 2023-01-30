import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { body, validationResult } from 'express-validator';
import User from '../user/user.model';

const getSignup = (req: express.Request, res: express.Response) => {
  if (res.locals.isLoggedIn) {
    return res.redirect('/');
  }
  res.render('signup', { pageTitle: 'Sign up' });
};

const postSignup = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('password')
    .trim()
    .isLength({ min: 6, max: 255 })
    .withMessage('Password must be between 6 and 255 characters'),
  body('passwordConfirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('signup', {
        pageTitle: 'Sign up',
        errors: errors.array(),
      });
    } else {
      const user = await User.findOne({ username: req.body.username });
      if (user) {
        res.render('signup', {
          pageTitle: 'Sign up',
          errors: [{ msg: 'Username already exists' }],
        });
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
        });
        await user.save();
        res.redirect('/');
      }
    }
  },
];

const getLogin = (req: express.Request, res: express.Response) => {
  if (res.locals.isLoggedIn) {
    return res.redirect('/');
  }
  res.render('login', { pageTitle: 'Login' });
};

const postLogin = async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('login', {
      pageTitle: 'Login',
      errors: 'Please fill in all fields',
    });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.render('login', {
      pageTitle: 'Login',
      errors: 'Invalid username or password',
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.render('login', {
      pageTitle: 'Login',
      errors: 'Invalid username or password',
    });
  }
  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    httpOnly: true, // cookie cannot be accessed or modified in any way by the browser
  });
  res.redirect('/');
};

const getLogout = (req: express.Request, res: express.Response) => {
  if (!res.locals.isLoggedIn) {
    return res.redirect('/login');
  }
  res.clearCookie('jwt');
  res.redirect('/');
};

export { getSignup, postSignup, getLogin, postLogin, getLogout };
