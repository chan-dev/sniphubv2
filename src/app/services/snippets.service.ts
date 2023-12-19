import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import {
  collection,
  doc,
  docData,
  Firestore,
  serverTimestamp,
  writeBatch,
} from '@angular/fire/firestore';

import {
  UpdateSnippetDTO,
  Snippet,
  SaveSnippetDTO,
  SaveSnippetWithTimestampDTO,
  EmbeddedSnippetUnderList,
} from '../models/snippet';

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

  addSnippet(snippet: SaveSnippetDTO) {
    const listId = snippet.list_id;

    const batch = writeBatch(this.db);

    const snippetsCollectionRef = collection(this.db, 'snippets');
    const newSnippetDocRef = doc(snippetsCollectionRef);
    const newSnippetId = newSnippetDocRef.id;
    const newSnippet: SaveSnippetWithTimestampDTO = {
      ...snippet,
      created_at: serverTimestamp(),
    };

    batch.set(newSnippetDocRef, newSnippet);

    const listDocRef = doc(this.db, 'lists', listId);

    const embeddedSnippet: EmbeddedSnippetUnderList = {
      title: snippet.title,
      created_at: serverTimestamp(),
    };

    batch.update(listDocRef, `snippets.${newSnippetId}`, embeddedSnippet);

    return batch.commit();
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
