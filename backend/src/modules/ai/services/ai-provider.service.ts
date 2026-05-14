import { Injectable } from "@nestjs/common";

import { GeminiProvider } from "../providers/gemini.provider";

@Injectable()
export class AiProviderService extends GeminiProvider {}
