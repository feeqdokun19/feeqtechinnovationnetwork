import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async initializePayment(orderId: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        service: true,
        transaction: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new BadRequestException(
        'You are not authorized to pay for this order',
      );
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'This order is not available for payment',
      );
    }

    if (!order.transaction) {
      throw new BadRequestException(
        'Transaction does not exist for this order',
      );
    }

    const reference = `SC-${order.id}-${Date.now()}`;
    const amountInKobo = Math.round(Number(order.amount) * 100);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.paystack.co/transaction/initialize',
          {
            email: order.customer.email,
            amount: amountInKobo.toString(),
            currency: 'NGN',
            reference,
            callback_url: process.env.PAYSTACK_CALLBACK_URL,
            metadata: {
              orderId: order.id,
              transactionId: order.transaction.id,
              customerId: order.customerId,
              serviceId: order.serviceId,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (!response.data?.status) {
        throw new BadRequestException(
          'Unable to initialize Paystack payment',
        );
      }

      const paystackReference = response.data.data.reference;

      await this.prisma.transaction.update({
        where: {
          id: order.transaction.id,
        },
        data: {
          paymentReference: paystackReference,
          paymentProvider: 'PAYSTACK',
        },
      });

      return {
        message: 'Payment initialized successfully',
        orderId: order.id,
        transactionId: order.transaction.id,
        reference: paystackReference,
        authorizationUrl:
          response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.response?.data?.message ||
          'Unable to initialize payment with Paystack',
      );
    }
  }

  async verifyPayment(
    reference: string,
    customerId: string,
  ) {
    const transaction =
      await this.prisma.transaction.findUnique({
        where: {
          paymentReference: reference,
        },
        include: {
          order: true,
        },
      });

    if (!transaction) {
      throw new NotFoundException(
        'Payment transaction not found',
      );
    }

    if (transaction.customerId !== customerId) {
      throw new BadRequestException(
        'You are not authorized to verify this payment',
      );
    }

    return this.verifyPaystackTransaction(
      reference,
      transaction.id,
      transaction.orderId,
    );
  }

  async verifyPaymentByReference(reference: string) {
    if (!reference) {
      throw new BadRequestException(
        'Payment reference is required',
      );
    }

    const transaction =
      await this.prisma.transaction.findUnique({
        where: {
          paymentReference: reference,
        },
      });

    if (!transaction) {
      throw new NotFoundException(
        'Payment transaction not found',
      );
    }

    return this.verifyPaystackTransaction(
      reference,
      transaction.id,
      transaction.orderId,
    );
  }

  private async verifyPaystackTransaction(
    reference: string,
    transactionId: string,
    orderId: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
          },
        ),
      );

      if (!response.data?.status) {
        throw new BadRequestException(
          'Unable to verify payment with Paystack',
        );
      }

      const payment = response.data.data;

      const transaction =
        await this.prisma.transaction.findUnique({
          where: {
            id: transactionId,
          },
        });

      if (!transaction) {
        throw new NotFoundException(
          'Transaction not found',
        );
      }

      const expectedAmount = Math.round(
        Number(transaction.amount) * 100,
      );

      if (payment.reference !== reference) {
        throw new BadRequestException(
          'Payment reference mismatch',
        );
      }

      if (payment.amount !== expectedAmount) {
        throw new BadRequestException(
          'Payment amount does not match the order amount',
        );
      }

      if (payment.currency !== 'NGN') {
        throw new BadRequestException(
          'Payment currency is not supported',
        );
      }

      if (payment.status !== 'success') {
        return {
          message: 'Payment has not been completed',
          status: payment.status,
          reference,
          orderId,
          transactionId,
        };
      }

      await this.markPaymentSuccessful(
        transactionId,
        orderId,
        payment.paid_at,
      );

      return {
        message: 'Payment verified successfully',
        reference,
        status: 'success',
        orderId,
        transactionId,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        error?.response?.data?.message ||
          'Unable to verify payment with Paystack',
      );
    }
  }

  private async markPaymentSuccessful(
    transactionId: string,
    orderId: string,
    paidAt?: string,
  ) {
    let paymentProcessed = false;

    await this.prisma.$transaction(async (tx) => {
      const transaction =
        await tx.transaction.findUnique({
          where: {
            id: transactionId,
          },
        });

      if (!transaction) {
        throw new NotFoundException(
          'Transaction not found',
        );
      }

      // Prevent duplicate processing
      if (transaction.status === 'SUCCESS') {
        return;
      }

      await tx.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          status: 'SUCCESS',
          paidAt: paidAt
            ? new Date(paidAt)
            : new Date(),
        },
      });

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: 'PAID',
        },
      });

      paymentProcessed = true;
    });

    // Do not create duplicate notifications
    if (!paymentProcessed) {
      return;
    }

    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        service: true,
      },
    });

    if (!order) {
      return;
    }

    const amount = Number(order.amount).toLocaleString(
      'en-NG',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    );

    // Notify customer
    await this.notificationsService.createNotification({
      userId: order.customerId,
      orderId: order.id,
      type: 'PAYMENT_SUCCESS',
      title: 'Payment successful',
      message: `Your payment of ₦${amount} for "${order.service.title}" was successful.`,
    });

    // Notify provider
    await this.notificationsService.createNotification({
      userId: order.service.providerId,
      orderId: order.id,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment received',
      message: `Payment of ₦${amount} has been received for "${order.service.title}".`,
    });
  }

  /**
   * Paystack webhook handler.
   */
  async handleWebhook(
    signature: string,
    rawBody: Buffer | undefined,
    body: any,
  ) {
    if (!signature) {
      throw new BadRequestException(
        'Missing Paystack signature',
      );
    }

    if (!rawBody) {
      throw new BadRequestException(
        'Webhook raw body is unavailable',
      );
    }

    const expectedSignature = crypto
      .createHmac(
        'sha512',
        process.env.PAYSTACK_SECRET_KEY!,
      )
      .update(rawBody)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer =
      Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !==
        expectedBuffer.length ||
      !crypto.timingSafeEqual(
        signatureBuffer,
        expectedBuffer,
      )
    ) {
      throw new BadRequestException(
        'Invalid Paystack webhook signature',
      );
    }

    if (body.event !== 'charge.success') {
      return {
        message: 'Event received but not processed',
        event: body.event,
      };
    }

    const payment = body.data;
    const reference = payment.reference;

    if (!reference) {
      throw new BadRequestException(
        'Payment reference missing from webhook',
      );
    }

    const transaction =
      await this.prisma.transaction.findUnique({
        where: {
          paymentReference: reference,
        },
      });

    if (!transaction) {
      throw new NotFoundException(
        'Transaction for webhook not found',
      );
    }

    const expectedAmount = Math.round(
      Number(transaction.amount) * 100,
    );

    if (payment.amount !== expectedAmount) {
      throw new BadRequestException(
        'Webhook payment amount does not match order amount',
      );
    }

    if (payment.currency !== 'NGN') {
      throw new BadRequestException(
        'Webhook payment currency is invalid',
      );
    }

    if (payment.status !== 'success') {
      return {
        message: 'Payment was not successful',
      };
    }

    await this.markPaymentSuccessful(
      transaction.id,
      transaction.orderId,
      payment.paid_at,
    );

    return {
      message: 'Webhook processed successfully',
    };
  }
}
