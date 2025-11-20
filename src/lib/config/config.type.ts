import { Expose, Type } from "class-transformer";
import {
  IsBoolean,
  IsNotEmpty,
  IsPort,
  IsString,
  ValidateNested,
} from "class-validator";

export class BuildConfig {
  @Expose()
  @IsString()
  @IsNotEmpty()
  entryFile!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  outDir!: string;
}

export class RunConfig {
  @Expose()
  @IsString()
  @IsNotEmpty()
  dir!: string;
}

export class ClientConfig {
  @Expose()
  @IsPort()
  port!: string;

  @Expose()
  @IsPort()
  gameExposurePort!: string;

  @Expose()
  @Type(() => BuildConfig)
  @ValidateNested()
  build!: BuildConfig;

  @Expose()
  @Type(() => RunConfig)
  @ValidateNested()
  runtime!: RunConfig;
}

export class ServerConfig {
  @Expose()
  @IsBoolean()
  enable!: boolean;

  @Expose()
  @IsPort()
  port!: string;

  @Expose()
  @Type(() => BuildConfig)
  @ValidateNested()
  build!: BuildConfig;

  @Expose()
  @Type(() => RunConfig)
  @ValidateNested()
  runtime!: RunConfig;
}

export class Config {
  @Expose()
  @Type(() => ClientConfig)
  @ValidateNested()
  client!: ClientConfig;

  @Expose()
  @Type(() => ServerConfig)
  @ValidateNested()
  server!: ServerConfig;
}
