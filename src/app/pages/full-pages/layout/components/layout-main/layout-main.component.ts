import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-layout-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './layout-main.component.html',
  styleUrl: './layout-main.component.css'
})
export class LayoutMainComponent {
  sidebarOpen: boolean = true;

  onToggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
