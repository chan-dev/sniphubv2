import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideIcons } from '@ng-icons/core';
import {
  ionAdd,
  ionCopyOutline,
  ionChevronForward,
  ionChevronDown,
  ionPencilSharp,
  ionSave,
  ionCheckmarkSharp,
  ionClose,
  ionPencilOutline,
  ionEllipsisHorizontal,
  ionCodeSlashOutline,
  ionAddCircleOutline,
  ionSearchOutline,
} from '@ng-icons/ionicons';
import { simpleJavascript, simpleGoogle } from '@ng-icons/simple-icons';
import { tablerLoader2 } from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatSnackBarModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  viewProviders: [
    provideIcons({
      ionAdd,
      ionCopyOutline,
      ionChevronForward,
      ionEllipsisHorizontal,
      ionChevronDown,
      ionPencilSharp,
      ionSave,
      ionCheckmarkSharp,
      ionClose,
      ionCodeSlashOutline,
      ionPencilOutline,
      ionAddCircleOutline,
      ionSearchOutline,
      simpleJavascript,
      simpleGoogle,
      tablerLoader2,
    }),
  ],
})
export class AppComponent {}
