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
import { DataSource, Repository } from 'typeorm';
import { PaginationDTO } from './dto/pagination.dto';
import { isUUID } from 'class-validator';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productRepositoryImage: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productRepositoryImage.create({ url: image }),
        ),
      });
      await this.productRepository.save(product);
      return { ...product, images: images };
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
        relations: { images: true },
      });
      return products.map((product) => ({
        ...product,
        images: product.images.map((i) => i.url),
      }));
    } catch (error) {
      this.handlerError(error);
    }
  }

  async findOne(term: string) {
    if (isUUID(term)) {
      const product = await this.productRepository.findOneBy({ id: term });
      return product;
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('pro');
      const product = await queryBuilder
        .where('title =:title or slug =:slug', {
          title: term,
          slug: term,
        })
        .getOne();
      return product;
    }
  }

  async update(idProduct: string, updateProductDto: UpdateProductDto) {
    const { images, ...rest } = updateProductDto;
    const product = await this.productRepository.preload({
      id: idProduct,
      ...rest,
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${idProduct} not found`);
    //Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, {
          product: { id:idProduct },
        });
        product.images = images.map((image) =>
          this.productRepositoryImage.create({ url: image }),
        );
      }

      //await this.productRepository.save(product);
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(idProduct);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handlerError(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    if (product) {
      await this.productRepository.remove(product);
      return 'Product delete success';
    } else {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }
  }

  async deleteAllProducts() {
    try {
      const query = this.productRepository.createQueryBuilder('product');
      await query.delete().where({}).execute();
    } catch (error) {
      this.handlerError(error);
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

  async findOnePlain(term: string) {
    const product = await this.findOne(term);
    return {
      ...product,
      images: product.images.map((i) => i.url),
    };
  }
}
