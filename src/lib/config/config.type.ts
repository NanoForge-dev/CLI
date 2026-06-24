import { Expose, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNotEmpty, IsPort, IsString, ValidateNested } from "class-validator";

export class BuildConfig {
  @Expose()
  @IsString()
  @IsNotEmpty()
  entry!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  staticDir!: string;
}

export class EditorConfig {
  @Expose()
  @IsString()
  @IsNotEmpty()
  entry!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  save!: string;
}

export class DirsConfig {
  @Expose()
  @IsString()
  @IsNotEmpty()
  components!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  systems!: string;
}

export class ClientConfig {
  @Expose()
  @IsBoolean()
  enable!: boolean;

  @Expose()
  @IsPort()
  port!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  outDir!: string;

  @Expose()
  @Type(() => BuildConfig)
  @ValidateNested()
  build!: BuildConfig;

  @Expose()
  @Type(() => EditorConfig)
  @ValidateNested()
  editor!: EditorConfig;

  @Expose()
  @Type(() => DirsConfig)
  @ValidateNested()
  dirs!: DirsConfig;
}

export class ServerConfig {
  @Expose()
  @IsBoolean()
  enable!: boolean;

  @Expose()
  @IsString()
  @IsNotEmpty()
  outDir!: string;

  @Expose()
  @Type(() => BuildConfig)
  @ValidateNested()
  build!: BuildConfig;

  @Expose()
  @Type(() => EditorConfig)
  @ValidateNested()
  editor!: EditorConfig;

  @Expose()
  @Type(() => DirsConfig)
  @ValidateNested()
  dirs!: DirsConfig;
}

export class SslConfig {
  @Expose()
  @IsBoolean()
  enable!: boolean;

  @Expose()
  @IsString()
  cert!: string;

  @Expose()
  @IsString()
  key!: string;
}

export class Config {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Expose()
  @IsEnum(["ts", "js"])
  language!: "ts" | "js";

  @Expose()
  @IsBoolean()
  initFunctions!: boolean;

  @Expose()
  @Type(() => ClientConfig)
  @ValidateNested()
  client!: ClientConfig;

  @Expose()
  @Type(() => ServerConfig)
  @ValidateNested()
  server!: ServerConfig;

  @Expose()
  @Type(() => SslConfig)
  @ValidateNested()
  ssl!: SslConfig;
}
