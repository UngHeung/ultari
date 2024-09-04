import { join } from 'path';

export const PROJECT_ROOT_PATH = process.cwd();
export const PUBLIC_FOLDER_NAME = 'public';
export const PROFILE_FOLDER_NAME = 'profile';
export const POST_FOLDER_NAME = 'post';
export const TEMP_FOLDER_NAME = 'temp';

export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PATH, PUBLIC_FOLDER_NAME);

export const PROFILE_IMAGE_PATH = join(PUBLIC_FOLDER_NAME, PROFILE_FOLDER_NAME);
export const POST_IMAGE_PATH = join(PUBLIC_FOLDER_NAME, POST_FOLDER_NAME);
export const TEMP_FOLDER_PATH = join(PUBLIC_FOLDER_NAME, TEMP_FOLDER_NAME);
