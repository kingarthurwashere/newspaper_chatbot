import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { NewsService } from '../news/news.service';

interface IncomingMessage {
  entry: Array<{
    changes: Array<{
      value: {
        messages: Array<{
          from: string;
          text?: {
            body: string;
          };
        }>;
      };
    }>;
  }>;
}

@Controller('webhook')
export class WhatsAppController {
  private readonly VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly newsService: NewsService,
  ) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    // Check if the mode and token are valid
    if (mode && token === this.VERIFY_TOKEN) {
      console.log('Webhook verified successfully!');
      return challenge; // Return the challenge token to confirm verification
    } else {
      console.error('Verification failed: tokens do not match.');
      throw new BadRequestException('Verification failed, tokens do not match');
    }
  }

  @Post()
  async handleIncomingMessage(@Body() body: IncomingMessage): Promise<any> {
    try {
      // Safely extract the incoming message details
      const incomingMessage =
        body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!incomingMessage) {
        throw new Error('Invalid message format received');
      }

      const from = incomingMessage.from; // The user's phone number
      const text = incomingMessage.text?.body?.toLowerCase().trim();

      if (!text) {
        await this.whatsappService.sendMessage(
          from,
          "Sorry, I couldn't understand your message. Please try again.",
        );
        return { status: 'Message not processed due to missing content' };
      }

      switch (text) {
        case 'news':
          try {
            const news = await this.newsService.getLatestNews();

            if (Array.isArray(news) && news.length > 0) {
              const latestNews = news
                .map(
                  (item: {
                    id: number;
                    date: string;
                    modified: string;
                    guid: { rendered: string };
                    link: string;
                    title: { rendered: string };
                    content: { rendered: string };
                    excerpt: { rendered: string };
                    author: number;
                    comment_status: string;
                    featured_media: number;
                  }) => {
                    // Extracting key elements
                    const postId = item.id;
                    const publicationDate = item.date;
                    const modifiedDate = item.modified;
                    const permalink = item.guid.rendered;
                    const title = item.title.rendered;
                    const content = item.content.rendered;
                    const excerpt = item.excerpt.rendered;
                    const authorId = item.author;
                    const commentsAllowed = item.comment_status;

                    // Construct the formatted output for each post

                    return (
                      `ID: ${postId}\n` +
                      `Published Date: ${publicationDate}\n` +
                      `Last Modified: ${modifiedDate}\n` +
                      `Title: ${title}\n` +
                      `Link: ${permalink}\n` +
                      `Excerpt: ${excerpt}\n` +
                      `Content: ${content}\n` +
                      `Author ID: ${authorId}\n` +
                      `Comments Allowed: ${commentsAllowed}\n` +
                      `-----------------------------------`
                    );
                  },
                )
                .join('\n');
              await this.whatsappService.sendMessage(
                from,
                `📰 *Latest News*:\n${latestNews}`,
              );
            } else {
              await this.whatsappService.sendMessage(
                from,
                'Sorry, no news is available at the moment.',
              );
            }
          } catch (error) {
            console.error('Error fetching news:', error);
            await this.whatsappService.sendMessage(
              from,
              'Sorry, there was an error retrieving the news. Please try again later.',
            );
          }
          break;

        default:
          await this.whatsappService.sendMessage(
            from,
            "Sorry, I didn't recognize that command. Please type 'news' to get the latest updates.",
          );
          break;
      }

      return { status: 'Message processed successfully' };
    } catch (error) {
      console.error('Error processing incoming message:', error);
      throw new BadRequestException('Failed to process the incoming message');
    }
  }
}
