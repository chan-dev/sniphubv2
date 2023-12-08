import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
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
} from '@ng-icons/ionicons';
import { simpleJavascript } from '@ng-icons/simple-icons';
import { tablerLoader2 } from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  viewProviders: [
    provideIcons({
      ionAdd,
      ionCopyOutline,
      ionChevronForward,
      ionChevronDown,
      ionPencilSharp,
      ionSave,
      ionCheckmarkSharp,
      ionClose,
      simpleJavascript,
      ionPencilOutline,
      tablerLoader2,
    }),
  ],
})
export class AppComponent {}
