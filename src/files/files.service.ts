import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    const patch = join(__dirname, '../../static/uploads', imageName);
    if (!existsSync(patch)) {
      throw new BadRequestException('No product found with image ' + imageName);
    } else {
      return patch;
    }
  }
}
