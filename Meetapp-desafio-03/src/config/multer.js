import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

/**
 *  multer configuration
 *  it will generate 16 random letters and numbers
 *  thats gonna be the name of the upload
 */

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
