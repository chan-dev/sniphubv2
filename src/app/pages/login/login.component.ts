import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { signInWithPopup } from '@angular/fire/auth';
import { NgIconComponent } from '@ng-icons/core';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './login.component.html',
  styles: ``,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  async login() {
    try {
      await this.authService.login();
      this.router.navigate(['/home']);
    } catch (error) {
      console.log('error', { error });
    }
  }
}
