
export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '9:16',
  LANDSCAPE = '16:9',
}

export interface PageData {
  pageText: string;
  sceneSynopsis: string;
  focalCharacters: string[];
  setting: string;
  keyProps: string[];
  mood: string;
}

export interface StoryPage extends PageData {
  id: string;
  illustrationUrl?: string;
  audioUrl?: string;
  altText?: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
}

export type LoadingState = {
  active: boolean;
  message: string;
};
