import { Expose, Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsPort, IsString } from "class-validator";

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
  port!: number;

  @Expose()
  @IsPort()
  clientExposurePort!: number;

  @Expose()
  @Type(() => BuildConfig)
  build!: BuildConfig;

  @Expose()
  @Type(() => RunConfig)
  runtime!: RunConfig;
}

export class ServerConfig {
  @Expose()
  @IsBoolean()
  enable!: boolean;

  @Expose()
  @IsPort()
  port!: number;

  @Expose()
  @Type(() => BuildConfig)
  build!: BuildConfig;

  @Expose()
  @Type(() => RunConfig)
  runtime!: RunConfig;
}

export class Config {
  @Expose()
  @Type(() => ClientConfig)
  client!: ClientConfig;

  @Expose()
  @Type(() => ServerConfig)
  server!: ServerConfig;
}
