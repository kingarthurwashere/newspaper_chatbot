import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppController } from './whatsapp/whatsapp.controller';
import { WhatsAppService } from './whatsapp/whatsapp.service';
import { NewsService } from './news/news.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, NewsService],
})
export class AppModule {}
