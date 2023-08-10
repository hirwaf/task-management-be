export class PageDto {
  readonly page: number;
  readonly take: number;
  readonly itemCount: number;
  readonly pageCount: number;
  readonly data: [];
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;

  constructor({ page, take, itemCount, entities }) {
    this.page = page;
    this.take = take;
    this.data = entities;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
