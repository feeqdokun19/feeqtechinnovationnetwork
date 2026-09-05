import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    HttpModule,
    AuthModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}