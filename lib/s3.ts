interface S3ClientType {
  write(path: string, data: File): Promise<void>;
  delete(path: string): Promise<void>;
  file(path: string): { presign(options: { expiresIn: number; acl: string }): string };
}

let s3Client: S3ClientType | null = null;

async function getClient(): Promise<S3ClientType> {
  if (s3Client) return s3Client;

  const bun = (global as typeof globalThis & { bun?: { S3Client: new (config: { accessKeyId: string; secretAccessKey: string; bucket: string; endpoint: string }) => S3ClientType } }).bun;
  if (!bun) {
    throw new Error("Bun runtime is required for S3 operations");
  }

  const { S3Client } = await import("bun");
  s3Client = new S3Client({
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    bucket: process.env.R2_BUCKET || "",
    endpoint: process.env.R2_ENDPOINT || "",
  });

  return s3Client;
}

export function generateReceiptPath(userId: string, expenseId: string, filename: string): string {
  return `receipts/${userId}/${expenseId}/${filename}`;
}

export async function uploadReceipt(userId: string, expenseId: string, file: File): Promise<{ filePath: string; fileName: string }> {
  const client = await getClient();
  const fileName = file.name;
  const filePath = generateReceiptPath(userId, expenseId, fileName);

  try {
    console.log("Uploading to S3:", { filePath, fileName, fileType: file.type, fileSize: file.size });
    await client.write(filePath, file);
    console.log("Upload successful");
  } catch (error) {
    console.error("S3 Upload Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to upload receipt: ${errorMessage}`);
  }

  return {
    filePath,
    fileName,
  };
}

export async function deleteReceipt(receiptFile: string): Promise<void> {
  if (!receiptFile) return;

  const client = await getClient();
  await client.delete(receiptFile);
}

export async function getPresignedUrl(receiptFile: string): Promise<string> {
  if (!receiptFile) {
    throw new Error("No receipt file provided");
  }

  const client = await getClient();
  const url = client.file(receiptFile).presign({
    expiresIn: 7 * 24 * 60 * 60,
    acl: "public-read",
  });

  return url;
}

export default s3Client;
