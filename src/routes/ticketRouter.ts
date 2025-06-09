import express from 'express';
import {
  createTicket,
  deleteTicket,
  getAllTickets,
  getTicket,
} from '../controllers/ticketController';

const router = express.Router();

router.post('/createTicket', createTicket as express.RequestHandler);
router.get('/getTicket/:id', getTicket as express.RequestHandler);
router.get('/getAllTickets', getAllTickets as express.RequestHandler);
router.delete('/deleteTicket/:id', deleteTicket as express.RequestHandler);

export default router;
