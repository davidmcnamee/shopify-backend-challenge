import { imageHash as originalImageHash } from 'image-hash';
import { uniqueNamesGenerator, colors, adjectives, animals } from 'unique-names-generator';
import { promisify } from 'util';

const SEED = 7834950847328;

const imageHash = promisify(originalImageHash)

export async function computeHash(url: string): Promise<string> {
    return await imageHash(url, 16, true) as string;
}

export function generateImageName() {
    return uniqueNamesGenerator({ dictionaries: [colors, adjectives, animals], style: 'lowerCase', seed: SEED, separator: '-' });
}
