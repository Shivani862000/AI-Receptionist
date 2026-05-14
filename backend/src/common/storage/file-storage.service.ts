import * as fs from "fs";
import * as path from "path";

import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";

import { AppLoggerService } from "../logger/app-logger.service";

@Injectable()
export class FileStorageService implements OnModuleInit {
  private readonly baseDirectory = path.join(process.cwd(), "uploads");
  private readonly folders = ["recordings", "transcripts", "tts-audio", "reports", "temp"];

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService
  ) {}

  onModuleInit() {
    this.ensureDirectoryStructure();
  }

  getDirectory(folder: string) {
    const directory = path.join(this.baseDirectory, folder);
    fs.mkdirSync(directory, { recursive: true });
    return directory;
  }

  buildSafeFilename(prefix: string, extension: string) {
    const normalizedPrefix = prefix.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const normalizedExtension = extension.replace(/^\./, "");

    return `${normalizedPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${normalizedExtension}`;
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  cleanupTempFiles() {
    const tempDirectory = this.getDirectory("temp");
    const ttlHours = this.configService.get<number>("storage.tempFileTtlHours") || 24;
    const maxAgeMs = ttlHours * 60 * 60 * 1000;
    const now = Date.now();
    let deleted = 0;

    for (const file of fs.readdirSync(tempDirectory)) {
      const filePath = path.join(tempDirectory, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        deleted += 1;
      }
    }

    if (deleted > 0) {
      this.logger.log(`Cleaned ${deleted} temp upload files`, FileStorageService.name);
    }
  }

  private ensureDirectoryStructure() {
    for (const folder of this.folders) {
      this.getDirectory(folder);
    }
  }
}
