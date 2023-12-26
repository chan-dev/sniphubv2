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
import { BehaviorSubject, tap } from 'rxjs';
import { NgIconComponent } from '@ng-icons/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { Snippet, UpdateSnippetDTO } from '../../models/snippet';
import { SnippetService } from '../../services/snippets.service';
import { SnackbarService } from '../../services/snackbar.service';
import { TrackUnsavedService } from '../../services/track-unsaved.service';
import { EditorOptions } from '../../types/editor';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';

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
  private snippetService = inject(SnippetService);
  private snackbarService = inject(SnackbarService);
  private trackUnsavedService = inject(TrackUnsavedService);
  private snippetSubject = new BehaviorSubject<Snippet | null>(null);

  private readonly defaultSnippet = {
    id: '',
    title: 'Untitled',
    content: '',
    language: '',
  } as Snippet;

  activeSnippet = this.defaultSnippet;

  editorContent = this.activeSnippet.content;
  editorTitle = this.activeSnippet.title;
  editorLanguage = this.activeSnippet.language;

  savingInProgress = false;

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
    console.log('snippet component ngOnInit');
    this.snippetSubject
      .pipe(
        // Everytime we switch to a different state
        // reset local state.
        tap(() => this.resetToDefaults()),
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

    this.trackUnsavedService.hasUnsaved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.isEditInProgress = value;

        if (!value) {
          this.resetToDefaults();
        }
      });
  }

  onEditorInit(_editor: any) {
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
    this.trackUnsavedService.trackChange(true);
  }

  updateEditorLanguage(id: string) {
    this.setEditorOptions({ language: id });
    this.trackUnsavedService.trackChange(true);
  }

  updateEditorContent(content: string) {
    if (content !== this.activeSnippet.content) {
      this.trackUnsavedService.trackChange(true);
    }
  }

  makeEditorTitleEditable(id: string) {
    // Add visual cue for editing
    this.isTitleEditable = true;
  }

  setTitleEditable(open: boolean) {
    this.isTitleEditable = open;
  }

  async saveSnippet(snippetId: string) {
    if (snippetId) {
      try {
        this.savingInProgress = true;
        // TODO: add alert
        const data: UpdateSnippetDTO = {
          content: this.editorContent,
          language: this.editorLanguage,
        };

        if (this.editorTitle !== this.activeSnippet.title) {
          data.title = this.editorTitle;
        }

        await this.snippetService.updateSnippet(
          snippetId,
          this.activeSnippet.list_id,
          data,
        );

        this.savingInProgress = false;
        // this.shouldEdit = false;
        this.trackUnsavedService.trackChange(false);
        // this.updateEditorReadonly(true);
        this.openSnackbar('Snippet saved');
      } catch (error) {
        console.error(error);
        this.openSnackbar('Failed to save snippet');
      }
    }
  }

  cancelUpdate() {
    const question =
      'You have unsaved changes. Are you sure you want to discard them?';

    // TODO: replace with modal
    // Modal should be reused on the `unsavedChangesGuard` route guard
    if (window.confirm(question)) {
      this.resetToDefaults();
      this.trackUnsavedService.reset();
    }
  }

  openSnackbar(message: string) {
    this.snackbarService.openSnackbar(message);
  }

  private resetToDefaults() {
    this.isTitleEditable = false;
    this.editorContent = this.activeSnippet?.content;
    this.editorTitle = this.activeSnippet?.title;
    this.editorLanguage = this.activeSnippet?.language;
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
