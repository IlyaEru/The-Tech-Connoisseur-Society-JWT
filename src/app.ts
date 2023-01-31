import express from 'express';
import helmet from 'helmet';
const xss = require('xss-clean');
import ExpressMongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';

import cookieParser from 'cookie-parser';

import routes from './routes';

import authMiddleware from './middlewares/authMiddleware';

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

// Jwt authentication

app.use(authMiddleware);

app.use(routes);

app.use((req, res) => {
  res.status(404).render('404', { pageTitle: '404' });
});

export default app;
