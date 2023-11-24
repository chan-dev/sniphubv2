export interface List {
  id: string;
  name: string;
  created_at: number;
  user_id: string;
  group_id: string;
  snippets: Record<
    string,
    {
      created_at: number;
      title: string;
    }
  >;
}

export interface CollapsibleList extends List {
  open: boolean;
}
