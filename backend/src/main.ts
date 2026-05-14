import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as express from "express";
import * as path from "path";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseTransformInterceptor } from "./common/interceptors/response-transform.interceptor";
import { AppLoggerService } from "./common/logger/app-logger.service";
import { SanitizeInputPipe } from "./common/pipes/sanitize-input.pipe";

async function bootstrap() {
  const compressionMiddleware = require("compression") as () => express.RequestHandler;
  const helmetMiddleware = require("helmet") as () => express.RequestHandler;
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });
  const configService = app.get(ConfigService);
  const appLogger = app.get(AppLoggerService);
  const configuredFrontendUrl = configService.get<string>("app.frontendUrl") || "http://localhost:3000";
  const configuredOrigins = configService.get<string[]>("app.corsOrigins") || [configuredFrontendUrl];
  const allowedOrigins = Array.from(
    new Set([...configuredOrigins, configuredFrontendUrl, "http://localhost:3000", "http://localhost:3001", "http://localhost:3002"])
  );

  app.useLogger(appLogger);
  app.enableShutdownHooks();
  const expressApp = app.getHttpAdapter().getInstance();
  if (configService.get<boolean>("app.trustProxy")) {
    expressApp.set("trust proxy", 1);
  }
  app.use(helmetMiddleware());
  app.use(compressionMiddleware());
  expressApp.disable("x-powered-by");

  app.setGlobalPrefix("api", {
    exclude: ["health"]
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1"
  });
  app.enableCors({
    origin: allowedOrigins,
    credentials: true
  });
  app.useGlobalPipes(new SanitizeInputPipe());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter(appLogger));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  if (configService.get<boolean>("app.enableSwagger")) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("AI Receptionist API")
      .setDescription("Phase 1 NestJS backend for the AI Receptionist POC")
      .setVersion("1.0.0")
      .addBearerAuth()
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, swaggerDoc);
  }

  const port = configService.get<number>("app.port") || 4000;
  await app.listen(port, "0.0.0.0");
  appLogger.log(`Backend listening on port ${port}`, "Bootstrap");
}

bootstrap();
