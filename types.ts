export interface Document {
  id: string;
  title: string;
  content: string;
  author: string;
  isPublished: boolean;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  likes: number;
  likedBy: string[]; // Array of user emails who liked the post
}

export type ViewState = 'feed' | 'library' | 'editor' | 'reader';

export interface EditorState {
  docId: string | null; // null means new document
}

export interface ReaderState {
  docId: string;
}

// AI Service Types
export interface AICompletionRequest {
  prompt: string;
  currentContent?: string;
}