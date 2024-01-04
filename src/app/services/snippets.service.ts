import { Injectable, inject } from '@angular/core';
import { map, tap } from 'rxjs';
import {
  collection,
  collectionData,
  deleteField,
  doc,
  docData,
  Firestore,
  query,
  serverTimestamp,
  where,
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

  deleteSnippet(id: string, listId: string) {
    const batch = writeBatch(this.db);
    // TODO: should we wrap this in Observable?
    // return deleteDoc(doc(this.db, 'snippets', id));
    const snippetDocRef = doc(this.db, 'snippets', id);
    batch.delete(snippetDocRef);

    const listDocRef = doc(this.db, 'lists', listId);
    batch.update(listDocRef, `snippets.${id}`, deleteField());

    return batch.commit();
  }

  searchSnippets(searchPattern: string) {
    /**
     * As a tentative solution, we simply support prefix search on "title" property.
     * Firestore does not natively support full-text or wildcard search.
     *
     * However, ideally, we should use a full-text search index to do that using
     * tools such as Algolia or Elastic Search.
     * The caveat is that the account has to be on Blaze plan.
     */
    const snippetsCollectionRef = collection(this.db, 'snippets');
    const queryRef = query(
      snippetsCollectionRef,
      where('title', '>=', searchPattern),
      where('title', '<', `${searchPattern}\uf8ff`),
    );

    return collectionData(queryRef, {
      idField: 'id',
    }).pipe(
      tap((snippets) => console.log('searchSnippets', snippets)),
      map((snippets) => {
        return snippets as Snippet[];
      }),
    );
  }
}
