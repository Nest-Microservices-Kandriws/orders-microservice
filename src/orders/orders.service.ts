import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatus } from './dto';
import { NAST_SERVICE, PRODUCT_SERVICE } from 'src/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);
  //crea un constructor
  constructor(@Inject(NAST_SERVICE) private readonly client: ClientProxy,) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.log('DB::Orders Service Connected');
  }
  async create(createOrderDto: CreateOrderDto) {
    try {
      const productIds = createOrderDto.items.map(item => item.productId);

      const validatedProducts: any[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_product_exists' }, productIds).pipe(
          catchError((error) => {
            throw new RpcException({
              message: error,
              status: HttpStatus.NOT_FOUND
            });
          })
        )
      );

      const totalAmount: number = createOrderDto.items.reduce((_, orderItem) => {
        const item = validatedProducts.find(product => product.id === orderItem.productId);
        return item.price * orderItem.quantity;
      }, 0);

      const totalItems: number = createOrderDto.items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity;
      }, 0);

      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map(orderItem => ({
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                price: validatedProducts.find(product => product.id === orderItem.productId).price
              }))
            }
          },
        }, include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true
            }
          }
        }
      }
      );


      return {
        ...order,
        OrderItem: order.OrderItem.map(item => ({
          ...item,
          name: validatedProducts.find(product => product.id === item.productId).name
        }))
      }

    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    try {
      const { page, limit, status } = orderPaginationDto;

      const totalOrders = await this.order.count(
        {
          where: {
            status
          }
        }
      );

      const orders = await this.order.findMany(
        {
          where: {
            status
          },
          skip: (page - 1) * limit,
          take: limit,
        }
      );

      return {
        data: orders,
        totalOrders,
        pagination: {
          page,
          limit,
          lastPage: Math.ceil(totalOrders / limit)
        }

      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.order.findFirst({
        where: {
          id: id
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true
            }
          }
        }
      });

      if (!order) {
        throw new RpcException({
          message: 'Order not found',
          status: HttpStatus.NOT_FOUND
        });
      };
      const productIds = order.OrderItem.map(item => item.productId);
      const validatedProducts: any[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_product_exists' }, productIds).pipe(
          catchError((error) => {
            throw new RpcException({
              message: error,
              status: HttpStatus.NOT_FOUND
            });
          })
        )
      )
      return {
        ...order,
        OrderItem: order.OrderItem.map(orderItem => ({
          ...orderItem,
          name: validatedProducts.find(product => product.id === orderItem.productId).name
        }))
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async changeStatus(changeOrderStatus: ChangeOrderStatus) {
    try {
      const { id, status } = changeOrderStatus;

      const order = await this.findOne(id);

      if (order.status === status) {
        return order;
      }

      return this.order.update({
        where: {
          id
        },
        data: {
          status
        }
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

}
