import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('initialize/:orderId')
  initializePayment(
    @Param('orderId') orderId: string,
    @Req() request: any,
  ) {
    return this.paymentsService.initializePayment(
      orderId,
      request.user.id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
@Post('verify/:reference')
verifyPayment(
  @Param('reference') reference: string,
  @Req() request: any,
) {
  return this.paymentsService.verifyPayment(
    reference,
    request.user.id,
  );
}

  
@Get('callback')
async callback(@Req() request: any, @Res() response: Response) {
  const reference =
    request.query.reference || request.query.trxref;

  try {
    const result =
      await this.paymentsService.verifyPaymentByReference(
        reference,
      );

    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:3001';

    return response.redirect(
      `${frontendUrl}/orders/${result.orderId}?payment=success`,
    );
  } catch (error) {
    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:3001';

    return response.redirect(
      `${frontendUrl}/orders?payment=failed`,
    );
  }
}

  @Post('webhook')
  async webhook(
    @Req() request: Request & { rawBody?: Buffer },
    @Res() response: Response,
  ) {
    await this.paymentsService.handleWebhook(
      request.headers['x-paystack-signature'] as string,
      request.rawBody,
      request.body,
    );

    return response.status(200).send('OK');
  }
}
