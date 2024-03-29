import { Injectable } from '@angular/core';

import { UpdateSnippetDTO, SaveSnippetDTO } from '../models/snippet';
import { db } from '../db';

@Injectable({ providedIn: 'root' })
export class SnippetService {
  getSnippet(id: number) {
    return db
      .from('snippets')
      .select('id, title, content, language, created_at, user_id, list_id')
      .eq('id', id)
      .limit(1)
      .single();
  }

  addSnippet(snippet: SaveSnippetDTO) {
    return db.from('snippets').insert(snippet);
  }

  updateSnippet(id: number, list_id: number, snippet: UpdateSnippetDTO) {
    return db
      .from('snippets')
      .update({
        ...snippet,
        list_id,
      })
      .eq('id', id);
  }

  deleteSnippet(id: number) {
    return db.from('snippets').delete().eq('id', id);
  }

  searchSnippets(searchPattern: string) {
    // Searching multiple column: title and content.
    // Under the hood, we created a postgresql function in supabase.
    // https://supabase.com/docs/guides/database/full-text-search#search-multiple-columns
    return db
      .from('snippets')
      .select()
      .textSearch('title_content', searchPattern, {
        type: 'websearch',
        config: 'english',
      });
  }
}
