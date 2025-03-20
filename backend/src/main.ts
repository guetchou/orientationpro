
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Middleware
  app.use(cors());
  app.useGlobalPipes(new ValidationPipe());

  // Configuration du port
  const PORT = process.env.PORT || 3000;
  
  // Démarrage du serveur
  await app.listen(PORT);
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔍 Features activées: chatbot=${process.env.FEATURE_CHATBOT}, analytics=${process.env.FEATURE_ANALYTICS}`);
}
bootstrap();
