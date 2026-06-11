import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { AppConfig } from './config/AppConfig';
import AppLogger from './core/logger/app-logger';
import corebootstrap from "./core/bootstrap"
import { messageFactory, messages } from './shared/message.shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configObj = app.get(AppConfig)
  const logger = app.get(AppLogger)
  const appConfig = configObj.get('app')
  const {port} = appConfig

  try{
    corebootstrap(app,configObj);
    await app.listen(port,()=>{
      const successMsg = messageFactory(messages.S1,[port]);
      logger.log(successMsg, 200);
    })
  }
  catch(error:any){
    const errMsg = messageFactory(messages.E1, [ error.message])
    logger.error(errMsg,500);
  }
}

bootstrap();
