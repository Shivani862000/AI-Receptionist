import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class SanitizeInputPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata) {
    return this.sanitize(value);
  }

  private sanitize(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (value && typeof value === "object") {
      const sanitizedEntries = Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !["__proto__", "prototype", "constructor"].includes(key))
        .map(([key, item]) => [key, this.sanitize(item)]);

      return Object.fromEntries(sanitizedEntries);
    }

    if (typeof value === "string") {
      return value.trim();
    }

    return value;
  }
}
