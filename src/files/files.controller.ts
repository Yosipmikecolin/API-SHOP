import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Param,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter';
import { diskStorage } from 'multer';
import { fileName } from './helpers/fileName';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './static/uploads',
        filename: fileName,
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (file) {
      return { url:  `${this.configService.get("HOST_API")}/files/product/` + file.filename };
    } else {
      throw new BadRequestException('The file does not exist');
    }
  }

  @Get('product/:uuid')
  findOneFile(@Res() res: Response, @Param('uuid') uuidFile: string) {
    const patch = this.filesService.getStaticProductImage(uuidFile);
    res.sendFile(patch);
 /*    return res.status(200).json({
      statusCode: 200,
      response: patch,
    }); */
  }
}
