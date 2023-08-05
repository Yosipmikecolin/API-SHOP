import { Request } from 'express';

export const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  const type = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png'];
  validExtensions.includes(type)
    ? callback(null, true)
    : callback(new Error('The file type is invalid'), false);
};
