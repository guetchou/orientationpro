
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private configService: ConfigService) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date(),
      version: this.configService.get('APP_VERSION', '1.0.0'),
      environment: this.configService.get('NODE_ENV', 'development'),
      features: {
        chatbot: this.configService.get('FEATURE_CHATBOT') === 'true',
        analytics: this.configService.get('FEATURE_ANALYTICS') === 'true',
      },
    };
  }
}
