import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NewsService {
  constructor(private readonly configService: ConfigService) {}

  async getLatestNews(): Promise<any> {
    const wordpressUrl = this.configService.get<string>('WORDPRESS_API_URL');
    const response = await axios.get(wordpressUrl);
    return response.data;
  }
}
