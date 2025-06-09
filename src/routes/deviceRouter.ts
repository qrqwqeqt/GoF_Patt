import express from 'express';
import multer from 'multer';

import {
  addDevice,
  deleteDevice,
  getAllDevices,
  getDevice,
  getDevicesByOwnerId,
  updateDevice,
} from '../controllers/deviceController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

router.post(
  '/addDevice',
  upload.array('images', 10),
  authenticateToken as express.RequestHandler,
  addDevice as unknown as express.RequestHandler,
);
router.get('/getDevice/:id', getDevice as express.RequestHandler);
router.get(
  '/getOwnerDevices',
  authenticateToken as express.RequestHandler,
  getDevicesByOwnerId as unknown as express.RequestHandler,
);
router.get('/getAllDevices', getAllDevices as express.RequestHandler);
router.put(
  '/updateDevice/:id',
  authenticateToken as express.RequestHandler,
  updateDevice as unknown as express.RequestHandler,
);
router.delete(
  '/deleteDevice/:id',
  authenticateToken as express.RequestHandler,
  deleteDevice as unknown as express.RequestHandler,
);

export default router;
