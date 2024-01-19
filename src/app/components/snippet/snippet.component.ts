import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, shareReplay, tap } from 'rxjs';
import { NgIconComponent } from '@ng-icons/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { Snippet, UpdateSnippetDTO } from '../../models/snippet';
import { SnackbarService } from '../../services/snackbar.service';
import { TrackUnsavedService } from '../../services/track-unsaved.service';
import { EditorOptions } from '../../types/editor';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';

import { SnippetsStore } from '../../services/snippets.store';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-snippet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MonacoEditorModule,
    MatSnackBarModule,
    NgIconComponent,
    AutoFocusDirective,
  ],
  templateUrl: './snippet.component.html',
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .code-editor-container {
      height: calc(100vh - 40px);
    }

    .code-editor {
      .editor-container {
        height: 100% !important;
      }
    }
  `,
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetComponent implements OnInit {
  @Input() set snippet(value: Snippet | null) {
    this.snippetSubject.next(value);
  }

  private cdRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private snippetsStore = inject(SnippetsStore);

  private snackbarService = inject(SnackbarService);
  private trackUnsavedService = inject(TrackUnsavedService);
  private modalService = inject(ModalService);

  private readonly snippetSubject = new BehaviorSubject<Snippet | null>(null);
  private readonly savingInProgressSubject = new BehaviorSubject<boolean>(
    false,
  );

  private readonly defaultSnippet = {
    id: 0,
    title: 'Untitled',
    content: '',
    language: '',
  } as Snippet;

  activeSnippet = this.defaultSnippet;

  editorContent = this.activeSnippet.content;
  editorTitle = this.activeSnippet.title;
  editorLanguage = this.activeSnippet.language;

  savingInProgress$ = this.savingInProgressSubject
    .asObservable()
    .pipe(shareReplay(1));

  editorOptions: EditorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    readOnly: false,
    contextmenu: false,
    minimap: {
      enabled: false,
    },
  };

  languages: any[] = [];

  isEditInProgress = false;
  hasUnsavedChanges = false;
  isTitleEditable = false;

  ngOnInit(): void {
    this.snippetSubject
      .pipe(
        // Everytime we switch to a different state
        // reset local state.
        tap(() => this.resetToDefaults(true)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((snippet) => {
        console.log('snippet', snippet);

        if (!snippet) {
          return;
        }

        this.activeSnippet = snippet;
        this.editorContent = this.activeSnippet.content;
        this.editorTitle = this.activeSnippet.title;
        this.editorLanguage = this.activeSnippet.language;

        this.setEditorOptions({ language: this.activeSnippet.language });

        // Since we're using changing component state via rxjs
        // inside a component using OnPush, we need to manually detect changes.
        this.cdRef.markForCheck();
      });

    this.trackUnsavedService.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.isEditInProgress = state === 'Pending';

        if (!this.isEditInProgress) {
          this.resetToDefaults(state === 'Cancelled');
        }
      });

    this.onEditorInit();
  }

  onEditorInit() {
    // TODO: add a service for local storage
    const languages = localStorage.getItem('languages');
    if (languages) {
      this.languages = JSON.parse(languages);
    } else {
      this.languages = window.monaco.languages.getLanguages();
      localStorage.setItem('languages', JSON.stringify(this.languages));
    }
  }

  updateEditorReadonly(readOnly: boolean) {
    this.setEditorOptions({ readOnly });
  }

  updateTitle() {
    // const target = event.target as HTMLElement;
    // this.editorTitle = target.textContent || '';
    this.trackUnsavedService.changePending();
  }

  updateEditorLanguage(id: string) {
    this.setEditorOptions({ language: id });
    this.trackUnsavedService.changePending();
  }

  updateEditorContent(content: string) {
    if (content !== this.activeSnippet.content) {
      this.trackUnsavedService.changePending();
    }
  }

  makeEditorTitleEditable(id: number) {
    // Add visual cue for editing
    this.isTitleEditable = true;
  }

  setTitleEditable(open: boolean) {
    this.isTitleEditable = open;
  }

  async saveSnippet(snippetId: number) {
    if (snippetId) {
      try {
        this.savingInProgressSubject.next(true);

        const data: UpdateSnippetDTO = {
          content: this.editorContent,
          language: this.editorLanguage,
        };

        if (this.editorTitle !== this.activeSnippet.title) {
          data.title = this.editorTitle;
        }

        this.snippetsStore.updateSnippetEffect({
          id: snippetId,
          list_id: this.activeSnippet.list_id,
          snippet: data,
          cb: () => {
            this.savingInProgressSubject.next(false);
            this.trackUnsavedService.changeSaved();
            this.openSnackbar('Snippet saved');
          },
        });
      } catch (error) {
        console.error(error);
        this.openSnackbar('Failed to save snippet');
        this.savingInProgressSubject.next(false);
      }
    }
  }

  cancelUpdate() {
    const modalAfterClosed$ = this.modalService.openModal({
      dialogOptions: {
        width: '400px',
        disableClose: true,
      },
      componentProps: {
        title: 'Cancel Update',
        body: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmButtonLabel: 'Ok',
        cancelButtonLabel: 'Close',
      },
    });

    modalAfterClosed$.subscribe((confirm) => {
      if (!confirm) {
        return;
      }
      this.resetToDefaults(true);
      this.trackUnsavedService.changeCancelled();
      this.cdRef.markForCheck();
    });
  }

  openSnackbar(message: string) {
    this.snackbarService.openSnackbar(message);
  }

  private resetToDefaults(resetAll: boolean) {
    this.isTitleEditable = false;
    this.hasUnsavedChanges = false;

    // Reset local snippet state
    if (resetAll) {
      this.editorContent = this.activeSnippet?.content;
      this.editorTitle = this.activeSnippet?.title;
      this.editorLanguage = this.activeSnippet?.language;
    }
  }

  private resetState() {
    this.isTitleEditable = false;
    this.hasUnsavedChanges = false;
  }

  private setEditorOptions({
    language,
    theme,
    readOnly,
    contextmenu,
  }: Partial<EditorOptions>) {
    this.editorOptions = {
      ...this.editorOptions,
      language: language ?? this.editorOptions.language,
      theme: theme ?? this.editorOptions.theme,
      readOnly: readOnly ?? this.editorOptions.readOnly,
      contextmenu: contextmenu ?? this.editorOptions.contextmenu,
    };
  }
}
