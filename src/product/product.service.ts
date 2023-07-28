import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDTO } from './dto/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handlerError(error);
    }
  }

  async findAll(pagination: PaginationDTO) {
    try {
      const { limit = 10, offset = 0 } = pagination;
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
      });
      return products;
    } catch (error) {
      this.handlerError(error);
    }
  }

  async findOne(term: string) {
    if(isUUID(term)){
      const product = await this.productRepository.findOneBy({ id: term });
      return product
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder();
      const product = await queryBuilder.where("title =:title or slug =:slug",{
        title:term,
        slug:term
      }).getOne();
      return product;
    }

  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.productRepository.delete(id);
    if (product.affected) {
      return 'Product delete success';
    } else {
      throw new NotFoundException(`Product ${id} no found!`);
    }
  }

  handlerError(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    } else {
      this.logger.error(error);
      throw new InternalServerErrorException(error.detail);
    }
  }
}
