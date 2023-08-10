import { BadRequestException } from '@nestjs/common';
import * as path from 'path';

export const fileFilter = (req, file, callback) => {
  const ext = file.mimetype;
  if (
    ext !== 'image/png' &&
    ext !== 'image/jpg' &&
    ext !== 'image/jpeg' &&
    ext !== 'application/pdf'
  ) {
    return callback(
      new BadRequestException('Only images and PDFs are allowed'),
      false,
    );
  }
  callback(null, true);
};

export const EditFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0].replace(/\s/g, '').toLowerCase();
  const fileExtName = path.extname(file.originalname);
  const randomName = Array(8)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};
