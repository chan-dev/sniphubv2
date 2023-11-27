import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { doc, docData, Firestore } from '@angular/fire/firestore';

import { Snippet } from '../models/snippet';

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
}
