import { Controller, Post, Body } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { NewsService } from '../news/news.service';

@Controller('webhook')
export class WhatsAppController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly newsService: NewsService,
  ) {}

  @Post()
  async handleIncomingMessage(@Body() body: any): Promise<any> {
    const incomingMessage = body.entry[0].changes[0].value.messages[0];
    const from = incomingMessage.from; // The user's phone number
    const text = incomingMessage.text.body.toLowerCase().trim();

    if (text === 'news') {
      const news = await this.newsService.getLatestNews();
      const latestNews = news
        .map((item: any) => `${item.title.rendered}: ${item.link}`)
        .join('\n');
      await this.whatsappService.sendMessage(
        from,
        `Latest news:\n${latestNews}`,
      );
    }

    return { status: 'Message processed successfully' };
  }
}
