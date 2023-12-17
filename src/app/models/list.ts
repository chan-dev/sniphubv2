import { FieldValue } from 'firebase/firestore';

export interface List {
  id: string;
  name: string;
  created_at: number;
  uid: string;
  snippets?: Record<
    string,
    {
      created_at: number;
      title: string;
    }
  >;
}

export type NewListDTO = Omit<List, 'id' | 'created_at' | 'snippets'>;
export type NewListWithTimestampDTO = NewListDTO & {
  created_at: FieldValue;
};
export type EditListDTO = Pick<List, 'id' | 'name'>;
