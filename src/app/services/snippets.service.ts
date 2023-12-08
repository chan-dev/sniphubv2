import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { doc, docData, Firestore, writeBatch } from '@angular/fire/firestore';

import { UpdateSnippetDTO, Snippet } from '../models/snippet';

@Injectable({ providedIn: 'root' })
export class SnippetService {
  private db = inject(Firestore);

  getSnippet(id: string) {
    return docData(doc(this.db, 'snippets', id), {
      idField: 'id',
    }).pipe(
      map((snippet) => {
        return snippet as Snippet;
      }),
    );
  }

  updateSnippet(id: string, list_id: string, snippet: UpdateSnippetDTO) {
    const batch = writeBatch(this.db);

    const embeddedSnippetUnderListRef = doc(this.db, 'lists', list_id);

    const snippetDocRef = doc(this.db, 'snippets', id);

    batch.update(snippetDocRef, {
      ...snippet,
    });

    if (snippet.title) {
      batch.update(embeddedSnippetUnderListRef, `snippets.${id}`, {
        title: snippet.title,
      });
    }

    return batch.commit();
  }
}
