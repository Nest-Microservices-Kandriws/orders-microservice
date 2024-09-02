import { IsEnum, IsUUID } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";
import { OrderStatus } from "@prisma/client";

export class ChangeOrderStatus {
    @IsUUID(4)
    id: string

    @IsEnum(OrderStatusList, {
        message: `status must be one of ${OrderStatusList}`
    })
    status: OrderStatus
}