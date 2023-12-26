import { Injectable, inject } from '@angular/core';
import {
  ComponentStore,
  OnStateInit,
  OnStoreInit,
  tapResponse,
} from '@ngrx/component-store';

import { EditListDTO, List, NewListWithTimestampDTO } from '../models/list';
import { SaveSnippetDTO, Snippet, UpdateSnippetDTO } from '../models/snippet';
import { AuthService } from './auth.service';
import { EMPTY, of, switchMap, tap } from 'rxjs';
import { ListsService } from './lists.service';
import { SnippetService } from './snippets.service';

export type Error = {
  message: string;
};

export interface SnippetState {
  // NOTE: user state must be shared by components so we just
  // leave it on users.service.ts since it's provided into the root
  lists: List[];
  activeSnippet: Snippet | null;
  isLoading: boolean;
  error: Error | null;
}

export const initialState: SnippetState = {
  lists: [],
  activeSnippet: null,
  error: null,
  isLoading: false,
};

@Injectable()
export class SnippetsStore
  extends ComponentStore<SnippetState>
  implements OnStoreInit, OnStateInit
{
  private authService = inject(AuthService);
  private listsService = inject(ListsService);
  private snippetsService = inject(SnippetService);

  lists$ = this.select((state) => state.lists);
  activeSnippet$ = this.select((state) => state.activeSnippet);
  isLoading$ = this.select((state) => state.isLoading);
  error$ = this.select((state) => state.error);
  user$ = this.authService.currentUser$;

  vm$ = this.select(
    this.lists$,
    this.activeSnippet$,
    this.isLoading$,
    this.error$,
    this.user$,
    (lists, activeSnippet, isLoading, error, user) => {
      return {
        lists,
        activeSnippet,
        isLoading,
        error,
        user,
      };
    },
    { debounce: true },
  );

  constructor() {
    // NOTE: we may need to lazily load state using setState
    super(initialState);
    console.log('SnippetsStore');
  }

  ngrxOnStateInit() {
    console.log('[SnippetsStore]: onStateInit');
  }

  ngrxOnStoreInit() {
    console.log('[SnippetsStore]: onStoreInit');
  }

  getLists = this.effect<string | null>((userId$) => {
    return userId$.pipe(
      tap(() => {
        this.patchState({ isLoading: true });
      }),
      switchMap((userId) => {
        if (!userId) {
          this.patchState({
            lists: [],
            isLoading: false,
            error: { message: 'Not logged in' },
          });
          return EMPTY;
        }
        return this.listsService.getLists(userId).pipe(
          tapResponse(
            (lists) => {
              this.patchState({ lists, isLoading: false, error: null });
            },
            (error) => {
              console.log('error', { error });
              this.patchState({
                lists: [],
                isLoading: false,
                error: { message: (error as Error).message },
              });
            },
          ),
        );
      }),
    );
  });

  saveList = this.effect<{
    newList: NewListWithTimestampDTO | null;
    cb?: () => void;
  }>((input$) => {
    return input$.pipe(
      switchMap((input) => {
        if (!input.newList) {
          return EMPTY;
        }
        return this.listsService.createList(input.newList).pipe(
          tapResponse(
            (list) => {
              console.log('[saveList]: new list', list);
              input.cb && input.cb();
            },
            (error) => {
              console.log('[saveList]: error', { error });
            },
          ),
        );
      }),
    );
  });

  editList = this.effect<{
    list: EditListDTO;
    cb?: () => void;
  }>((input$) => {
    return input$.pipe(
      tap(() => {
        this.patchState({ isLoading: true });
      }),
      switchMap((input) => {
        if (!input.list) {
          this.patchState({
            isLoading: false,
            error: { message: 'No list provided' },
          });
          return EMPTY;
        }
        return this.listsService.editList(input.list).pipe(
          tapResponse(
            () => {
              input.cb && input.cb();
              this.patchState((state) => {
                return {
                  ...state,
                  lists: state.lists.map((l) => {
                    if (l.id === input.list.id) {
                      return {
                        ...l,
                        ...input.list,
                      };
                    }
                    return l;
                  }),
                  error: null,
                  isLoading: false,
                };
              });
            },
            (error) => {
              console.log('error', { error });
              this.patchState({
                isLoading: false,
                error: { message: (error as Error).message },
              });
            },
          ),
        );
      }),
    );
  });

  deleteList = this.effect<{
    id: string;
    cb?: () => void;
  }>((input$) => {
    return input$.pipe(
      tap(() => {
        this.patchState({ isLoading: true });
      }),
      switchMap((input) => {
        if (!input.id) {
          this.patchState({
            isLoading: false,
            error: { message: 'List not found' },
          });
          return EMPTY;
        }

        return this.listsService.deleteList(input.id).pipe(
          tapResponse(
            () => {
              input.cb && input.cb();
              this.patchState((state) => {
                return {
                  ...state,
                  lists: state.lists.filter((l) => {
                    return l.id !== input.id;
                  }),
                  error: null,
                  isLoading: false,
                };
              });
            },
            (error) => {
              console.log('error', { error });
              this.patchState({
                isLoading: false,
                error: { message: (error as Error).message },
              });
            },
          ),
        );
      }),
    );
  });

  getActiveSnippet = this.effect<string | null>((snippetId$) => {
    return snippetId$.pipe(
      tap(() => {
        this.patchState({ isLoading: true });
      }),
      switchMap((id) => {
        if (!id) {
          return EMPTY;
        }
        return this.snippetsService.getSnippet(id).pipe(
          tapResponse(
            (snippet) => {
              this.patchState({
                activeSnippet: snippet,
                isLoading: false,
                error: null,
              });
            },
            (error) => {
              this.patchState({
                activeSnippet: null,
                isLoading: false,
                error: { message: (error as Error).message },
              });
            },
          ),
        );
      }),
    );
  });

  addSnippet = this.effect<{
    snippet: SaveSnippetDTO;
    cb: () => void;
  }>((input$) => {
    return input$.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap((input) => {
        if (!input.snippet) {
          this.patchState({
            isLoading: false,
            error: { message: 'No snippet provided' },
          });
          return EMPTY;
        }
        return of(this.snippetsService.addSnippet(input.snippet)).pipe(
          tapResponse(
            () => {
              input.cb();
              this.patchState({ isLoading: false, error: null });
            },
            (error) => {
              this.patchState({
                isLoading: false,
                error: { message: (error as Error).message },
              });
            },
          ),
        );
      }),
    );
  });

  updateSnippet = this.effect<{
    id: string;
    list_id: string;
    snippet: UpdateSnippetDTO;
    cb?: () => void;
  }>((input$) => {
    return input$.pipe(
      tap(() =>
        this.patchState({
          isLoading: true,
        }),
      ),
      switchMap((input) => {
        if (!input.snippet || !input.id || !input.list_id) {
          this.patchState({
            isLoading: false,
            error: { message: 'No snippet provided' },
          });
          return EMPTY;
        }
        return of(
          this.snippetsService.updateSnippet(
            input.id,
            input.list_id,
            input.snippet,
          ),
        ).pipe(
          tapResponse(
            () => {
              input.cb && input.cb();
              this.patchState({ isLoading: false, error: null });
            },
            (error) => {
              this.patchState({
                isLoading: false,
                error: { message: (error as Error).message },
              });
            },
          ),
        );
      }),
    );
  });

  deleteSnippet = this.effect<{
    id: string;
    list_id: string;
    cb?: () => void;
  }>((input$) => {
    return input$.pipe(
      tap(() =>
        this.patchState({
          isLoading: true,
        }),
      ),
      switchMap((input) => {
        if (!input.id || !input.list_id) {
          this.patchState({
            isLoading: false,
            error: { message: 'No snippet provided' },
          });
          return EMPTY;
        }
        return of(
          this.snippetsService.deleteSnippet(input.id, input.list_id),
        ).pipe(
          tapResponse(
            () => {
              input.cb && input.cb();
              this.patchState({ isLoading: false, error: null });
            },
            (error) => {},
          ),
        );
      }),
    );
  });
}
