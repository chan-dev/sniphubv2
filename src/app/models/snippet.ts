import { FieldValue } from 'firebase/firestore';

export interface Snippet {
  id: string;
  title: string;
  content: string;
  language: string;
  created_at: number;
  uid: string;
  list_id: string;
}

export interface EmbeddedSnippetUnderList {
  title: string;
  created_at: FieldValue;
}

export type SaveSnippetDTO = Omit<Snippet, 'id' | 'created_at'>;
export type SaveSnippetWithTimestampDTO = SaveSnippetDTO & {
  created_at: FieldValue;
};

export type UpdateSnippetDTO = Partial<SaveSnippetDTO>;
