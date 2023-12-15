import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './login.component.html',
  styles: ``,
})
export class LoginComponent {}
