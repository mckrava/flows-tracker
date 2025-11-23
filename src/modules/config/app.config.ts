import { transformAndValidateSync } from 'class-transformer-validator';
import 'reflect-metadata';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsEnum, ValidationError } from 'class-validator';
import { NodeEnv } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

export class AppConfig {
  private static instance: AppConfig;

  @IsNotEmpty()
  @IsEnum(NodeEnv)
  readonly NODE_ENV: NodeEnv = NodeEnv.DEVELOPMENT;

  @Transform(({ value }: { value: string }) => +value)
  readonly PORT: number = 8080;

  @IsNotEmpty()
  @IsString()
  readonly PORTAL_URL_MOONBEAM: string;

  @IsNotEmpty()
  @IsString()
  readonly PORTAL_URL_ETHEREUM: string;

  static getInstance(): AppConfig {
    if (AppConfig.instance) return AppConfig.instance;

    try {
      AppConfig.instance = transformAndValidateSync(AppConfig, process.env, {
        validator: { stopAtFirstError: true },
      });
      return AppConfig.instance;
    } catch (errors) {
      if (Array.isArray(errors) && errors[0] instanceof ValidationError) {
        errors.forEach((error: ValidationError) => {
          Object.values(error.constraints || {}).forEach((msg) =>
            console.error(msg),
          );
        });
      } else {
        console.error('Unexpected error during the environment validation');
      }
      console.dir(errors, { depth: null });
      throw new Error('Failed to validate environment variables');
    }
  }
}
