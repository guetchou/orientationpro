
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlag } from './feature-flags.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FeatureFlagsService {
  constructor(
    @InjectRepository(FeatureFlag)
    private featureFlagsRepository: Repository<FeatureFlag>,
    private configService: ConfigService,
  ) {
    this.initializeFeatureFlags();
  }

  private async initializeFeatureFlags() {
    // Initialiser les feature flags depuis les variables d'environnement
    const chatbotEnabled = this.configService.get('FEATURE_CHATBOT') === 'true';
    const analyticsEnabled = this.configService.get('FEATURE_ANALYTICS') === 'true';
    
    await this.upsertFeatureFlag('chatbot', chatbotEnabled);
    await this.upsertFeatureFlag('analytics', analyticsEnabled);
  }

  private async upsertFeatureFlag(name: string, isEnabled: boolean) {
    const existingFlag = await this.featureFlagsRepository.findOne({ 
      where: { feature_name: name }
    });
    
    if (existingFlag) {
      await this.featureFlagsRepository.update(existingFlag.id, { is_enabled: isEnabled });
    } else {
      await this.featureFlagsRepository.save({
        feature_name: name,
        is_enabled: isEnabled,
      });
    }
  }

  async getAllFeatureFlags() {
    const flags = await this.featureFlagsRepository.find();
    return flags.reduce((acc, flag) => {
      acc[flag.feature_name] = flag.is_enabled;
      return acc;
    }, {});
  }
}
