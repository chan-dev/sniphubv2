import { Injectable, inject } from '@angular/core';
import { EMPTY, from, switchMap, tap } from 'rxjs';
import {
  ComponentStore,
  OnStateInit,
  OnStoreInit,
  tapResponse,
} from '@ngrx/component-store';

import { EditListDTO, EmbeddedSnippet, List, NewListDTO } from '../models/list';
import { SaveSnippetDTO, Snippet, UpdateSnippetDTO } from '../models/snippet';
import { AuthService } from './auth.service';
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
  ).pipe(tap((data) => console.log('component store update', data)));

  constructor() {
    // NOTE: we may need to lazily load state using setState
    super(initialState);
  }

  ngrxOnStateInit() {}

  ngrxOnStoreInit() {}

  getListsEffect = this.effect<string | null>((userId$) => {
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
        return from(this.listsService.getLists(userId)).pipe(
          tapResponse(
            (lists) => {
              this.patchState({
                lists: lists.data ?? [],
                isLoading: false,
                error: null,
              });
            },
            (error) => {
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

  saveListEffect = this.effect<{
    newList: NewListDTO | null;
    cb?: () => void;
  }>((input$) => {
    return input$.pipe(
      switchMap((input) => {
        if (!input.newList) {
          return EMPTY;
        }
        return from(this.listsService.createList(input.newList)).pipe(
          tapResponse(
            (list) => {
              input.cb && input.cb();
            },
            (error) => {},
          ),
        );
      }),
    );
  });

  editListEffect = this.effect<{
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
        return from(this.listsService.editList(input.list)).pipe(
          tapResponse(
            (_result) => {
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

  deleteListEffect = this.effect<{
    id: number;
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

        return from(this.listsService.deleteList(input.id)).pipe(
          tapResponse(
            (_result) => {
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

  getActiveSnippetEffect = this.effect<number | null>((snippetId$) => {
    return snippetId$.pipe(
      tap(() => {
        this.patchState({ isLoading: true });
      }),
      switchMap((id) => {
        if (!id) {
          return EMPTY;
        }
        return from(this.snippetsService.getSnippet(id)).pipe(
          tapResponse(
            (snippet) => {
              this.patchState({
                activeSnippet: snippet.data,
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

  readonly addList = this.updater((state, newList: List) => {
    return {
      ...state,
      lists: [...state.lists, newList],
    };
  });

  readonly updateList = this.updater((state, updatedList: List) => {
    return {
      ...state,
      lists: state.lists.map((list) => {
        if (updatedList.id === list.id) {
          return {
            ...list,
            ...updatedList,
          };
        } else {
          return list;
        }
      }),
    };
  });

  readonly removeList = this.updater((state, deletedListId: number) => {
    return {
      ...state,
      lists: state.lists.filter((list) => {
        return deletedListId !== list.id;
      }),
    };
  });

  readonly addSnippet = this.updater((state, newSnippet: Snippet) => {
    return {
      ...state,
      lists: state.lists.map((list) => {
        if (newSnippet.list_id === list.id) {
          const { id, title, created_at } = newSnippet;
          const embeddedSnippet: EmbeddedSnippet = {
            id,
            title,
            created_at,
          };
          list.snippets = [...(list.snippets ?? []), embeddedSnippet];

          return {
            ...list,
          };
        } else {
          return list;
        }
      }),
    };
  });

  readonly updateActiveSnippet = this.updater(
    (state, updatedSnippet: Snippet) => {
      return {
        ...state,
        activeSnippet: {
          ...state.activeSnippet,
          ...updatedSnippet,
        },
        lists: state.lists.map((list) => {
          if (updatedSnippet.list_id === list.id) {
            const { id, title, created_at } = updatedSnippet;

            list.snippets = (list.snippets || []).map((snippet) => {
              if (snippet.id === updatedSnippet.id) {
                return {
                  ...snippet,
                  id,
                  title,
                  created_at,
                };
              } else {
                return snippet;
              }
            });

            return {
              ...list,
            };
          } else {
            return list;
          }
        }),
      };
    },
  );

  readonly deleteSnippet = this.updater((state, deletedSnippetId: number) => {
    const parentListOfDeletedSnippet = state.lists.find((list) => {
      return list.snippets?.find((snippet) => {
        return snippet.id === deletedSnippetId;
      });
    });

    return {
      ...state,
      lists: state.lists.map((list) => {
        if (parentListOfDeletedSnippet?.id === list.id) {
          list.snippets = (list.snippets || []).filter((snippet) => {
            return snippet.id !== deletedSnippetId;
          });

          return {
            ...list,
          };
        } else {
          return list;
        }
      }),
    };
  });

  addSnippetEffect = this.effect<{
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
        return from(this.snippetsService.addSnippet(input.snippet)).pipe(
          tapResponse(
            (_result) => {
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

  updateSnippetEffect = this.effect<{
    id: number;
    list_id: number;
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
        return from(
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

  deleteSnippetEffect = this.effect<{
    id: number;
    cb?: () => void;
  }>((input$) => {
    return input$.pipe(
      tap(() =>
        this.patchState({
          isLoading: true,
        }),
      ),
      switchMap((input) => {
        if (!input.id) {
          this.patchState({
            isLoading: false,
            error: { message: 'No snippet provided' },
          });
          return EMPTY;
        }
        return from(this.snippetsService.deleteSnippet(input.id)).pipe(
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
