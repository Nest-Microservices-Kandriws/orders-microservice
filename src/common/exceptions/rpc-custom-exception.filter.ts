import { Catch, ArgumentsHost, ExceptionFilter, Logger, HttpStatus, BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException, BadRequestException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcCustomExceptionFilter.name);

  catch(exception: RpcException | BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToRpc();  // Cambia esto a switchToRpc ya que es un microservicio
    const data = ctx.getData();

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      this.logger.error(`Validation error: ${JSON.stringify(response)}`);

      // Si deseas manejar específicamente los detalles de BadRequestException
      const message = (response as any).message || 'Bad Request';
      const errors = Array.isArray(response) ? response : [message];

      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors,
        data,  // Muestra los datos que estaban en la solicitud
      };
    }

    // Para otras excepciones RPC
    if (exception instanceof RpcException) {
      const rpcError = exception.getError();
      this.logger.error(`RPC error: ${JSON.stringify(rpcError)}`);

      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: rpcError,
        data,
      };
    }
  }
}
