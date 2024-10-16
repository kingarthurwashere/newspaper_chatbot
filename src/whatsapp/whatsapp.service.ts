import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppService {
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.phoneNumberId = this.configService.get<string>(
      'WHATSAPP_PHONE_NUMBER_ID',
    );
    this.accessToken = this.configService.get<string>('WHATSAPP_API_TOKEN');
    this.apiUrl = this.configService.get<string>('WHATSAPP_CLOUD_API_URL');
  }

  async sendMessage(to: string, message: string): Promise<any> {
    const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
    const data = {
      messaging_product: 'whatsapp',
      to,
      text: {
        body: message,
      },
    };

    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(url, data, { headers });
    return response.data;
  }
}
