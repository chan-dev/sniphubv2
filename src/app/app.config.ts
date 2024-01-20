import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import {
  MonacoEditorModule,
  NgxMonacoEditorConfig,
} from 'ngx-monaco-editor-v2';
import { provideAnimations } from '@angular/platform-browser/animations';

const monacoConfig: NgxMonacoEditorConfig = {
  // baseUrl: './assets', // configure base path for monaco editor. Starting with version 8.0.0 it defaults to './assets'. Previous releases default to '/assets'
  defaultOptions: { scrollBeyondLastLine: false }, // pass default options to be used
  onMonacoLoad: () => {
    // NOTE:
    // A workaround to disable default CTRL/CMD + K keybinding which is used
    // as shortcut key for searching code snippets.
    //
    // https://github.com/microsoft/monaco-editor/issues/102#issuecomment-1300619657
    window.monaco.editor.addKeybindingRules([
      {
        keybinding: window.monaco.KeyMod.CtrlCmd + window.monaco.KeyCode.KeyK,
        command: null,
      },
    ]);
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(MonacoEditorModule.forRoot(monacoConfig)),
    provideAnimations(),
  ],
};
