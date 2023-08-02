import { Injectable } from '@nestjs/common';
import { ProductService } from 'src/product/product.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productServices: ProductService) {}

  async executeSeed() {
    await this.productServices.deleteAllProducts();
    const products = initialData.products;
    const insertProducts = [];
    products.forEach((product) => {
      insertProducts.push(this.productServices.create(product));
    });
    await Promise.all(insertProducts);
    return 'The table with seed data was filled correctly';
  }
}
