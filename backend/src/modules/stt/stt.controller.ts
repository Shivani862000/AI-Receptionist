import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ParseFilePipeBuilder } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { TranscribeAudioDto } from "./dto/transcribe-audio.dto";
import { SttService } from "./stt.service";

@ApiTags("STT")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("stt")
export class SttController {
  constructor(private readonly sttService: SttService) {}

  @Post("transcribe")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        audioUrl: { type: "string" },
        callId: { type: "string" },
        language: { type: "string" },
        file: { type: "string", format: "binary" }
      }
    }
  })
  @ApiOperation({ summary: "Transcribe audio with Deepgram STT" })
  transcribe(
    @Body() dto: TranscribeAudioDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(audio|mpeg|mp3|wav|webm|ogg|x-wav|x-m4a|mp4)$/i
        })
        .addMaxSizeValidator({
          maxSize: 15 * 1024 * 1024
        })
        .build({
          fileIsRequired: false
        })
    )
    file?: { buffer: Buffer; originalname: string; mimetype: string; size: number }
  ) {
    return this.sttService.transcribe(dto, file);
  }
}
