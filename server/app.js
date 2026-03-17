import express, { json, urlencoded } from 'express';
import morgan from 'morgan';
import cors from "cors";
import { connectDB } from './config/db.js';
import userRouter from './routers/user.router.js';
import conversationRouter from './routers/conversation.router.js';
import queueRouter from './routers/queue.router.js';
import { errorHandler, urlNotFound } from './middlewares/errors.middleware.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import createSocketServer from './config/socket.js';
import {createServer} from "http";

dotenv.config();

const app = express(); // Ensure 'app' is declared first
// const httpServer = createSocketServer(); // Create the HTTP server
const httpServer = createServer(app);

connectDB('customerServiceDB');

app.use(cors());

// app.use(cors({
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true
// }));

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static('public'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/pictures', express.static(path.join(__dirname, 'pictures')));

app.use(morgan("dev"));

// Define your routes after initializing 'app'
app.get('/test-cors', (req, res) => {
    res.json({ message: 'CORS is working!' });
});

app.use('/user', userRouter);
app.use('/conversation', conversationRouter);
app.use('/queue', queueRouter);

app.use(urlNotFound);
app.use(errorHandler);

const server = createSocketServer();

server.listen(8080, () => {
    console.log('HTTP server and WebSocket server running on port 8080');
});

const port = 7000
httpServer.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


dotenv.config();

