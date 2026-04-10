import { Expose, Type } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from "class-validator";

export enum ManifestPackageTypeEnum {
  COMPONENT = "component",
  SYSTEM = "system",
}

class PathsPublishManifest {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  package?: string;
}

class PublishManifest {
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => PathsPublishManifest)
  paths?: PathsPublishManifest;
}

export class Manifest {
  @Expose()
  @IsString()
  @Matches(/^[A-Za-z0-9-]+\/[A-Za-z0-9-]+$/)
  @IsNotEmpty()
  name!: string;

  @Expose()
  @IsString()
  @IsEnum(ManifestPackageTypeEnum)
  @IsNotEmpty()
  type!: ManifestPackageTypeEnum;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @Expose()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @Expose()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  dependencies?: string[];

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => PublishManifest)
  publish?: PublishManifest;

  @Expose()
  @IsObject()
  @IsOptional()
  npmDependencies?: Record<string, string>;
}

export interface FullManifest {
  name: string;
  type: ManifestPackageTypeEnum;
  description?: string;
  dependencies?: string[];
  npmDependencies?: Record<string, string>;
  publish?: {
    paths?: {
      package?: string;
    };
  };
  _file: string;
}
