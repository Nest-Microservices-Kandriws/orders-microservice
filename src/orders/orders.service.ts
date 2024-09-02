import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatus } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);
  async onModuleInit() {
    await this.$connect();
    this.logger.log('DB::Orders Service Connected');
  }
  async create(createOrderDto: CreateOrderDto) {
    try {
      const order = await this.order.create({
        data: createOrderDto
      });

      return order;

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
        }
      });

      if (!order) {
        throw new RpcException({
          message: 'Order not found',
          status: HttpStatus.NOT_FOUND
        });
      };

      return order;
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
