import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDTO } from './dto/pagination.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(@Query() Pagination:PaginationDTO) {
    return this.productService.findAll(Pagination);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.productService.findOne(uuid);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid',new ParseUUIDPipe()) uuid: string) {
    return this.productService.remove(uuid);
  }
}
