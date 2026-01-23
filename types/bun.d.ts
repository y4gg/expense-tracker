declare module "bun" {
  export class S3Client {
    constructor(config: { accessKeyId?: string; secretAccessKey?: string; bucket?: string; endpoint?: string });
    write(path: string, data: File): Promise<void>;
    delete(path: string): Promise<void>;
    file(path: string): { presign(options: { expiresIn: number; acl: string }): string };
  }
}
