import { join } from 'path';

export const PROJECT_ROOT_PATH = process.cwd();
export const PROJECT_S3_PATH = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}`;

export const PUBLIC_FOLDER_NAME = 'public';
export const PROFILE_FOLDER_NAME = 'profile';
export const POST_FOLDER_NAME = 'post';
export const TEMP_FOLDER_NAME = 'temp';

export const PUBLIC_ROOT_FOLDER_PATH = join(
  PROJECT_ROOT_PATH,
  PUBLIC_FOLDER_NAME,
);
export const PUBLIC_AWS_FOLDER_PATH = join(PROJECT_S3_PATH, PUBLIC_FOLDER_NAME);

export const PROFILE_IMAGE_PATH = join(PUBLIC_FOLDER_NAME, PROFILE_FOLDER_NAME);
export const POST_IMAGE_PATH = join(PUBLIC_FOLDER_NAME, POST_FOLDER_NAME);
export const TEMP_FOLDER_PATH = join(PUBLIC_FOLDER_NAME, TEMP_FOLDER_NAME);

export const PROFILE_IMAGE_S3_PATH = join(
  PUBLIC_FOLDER_NAME,
  PROFILE_FOLDER_NAME,
);
export const POST_IMAGE_S3_PATH = join(PUBLIC_FOLDER_NAME, POST_FOLDER_NAME);
export const TEMP_FOLDER_S3_PATH = join(PUBLIC_FOLDER_NAME, TEMP_FOLDER_NAME);
