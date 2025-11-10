import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PRIMENG_MODULES } from './prime-ng/prime-ng-modules';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ...PRIMENG_MODULES],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front-plantilla';

  toggleDarkMode(): void {
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('app-dark');
  }
}
