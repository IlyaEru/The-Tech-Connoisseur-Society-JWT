import express from 'express';
import helmet from 'helmet';
const xss = require('xss-clean');
import ExpressMongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';

import cookieParser from 'cookie-parser';

import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import routes from './routes';

import User from './components/user/user.model';
import { UserType } from './components/user/user.type';

const app = express();

// load env vars
dotenv.config();

// set security HTTP headers
app.use(helmet());

// enable cors
app.use(cors());
app.options('*', cors());

// parse json request body
app.use(express.json());

app.use(cookieParser());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(ExpressMongoSanitize());

// gzip compression
app.use(compression());

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.use(express.static('public'));

// set port, listen for requests

const port = process.env.PORT || 3000;

// app.use((req, res, next) => {
//   res.locals.isLoggedIn = res.locals.isLoggedIn;
//   res.locals.user = res.locals.user;
//   res.locals.isUserAdmin = res.locals.user?.admin;
//   res.locals.isUserMember = res.locals.user?.member;
//   res.locals.path = req.path;
//   next();
// });

interface JwtPayload {
  user: UserType;
}
app.use((req, res, next) => {
  res.locals.path = req.path;
  res.locals.isLoggedIn = false;
  res.locals.errors = [];
  res.locals.user = null;
  res.locals.isUserAdmin = false;
  res.locals.isUserMember = false;

  const token = req.cookies.jwt;

  if (token) {
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
  }

  next();
});

app.use(routes);

app.use((req, res) => {
  res.status(404).render('404', { pageTitle: '404' });
});

export default app;
