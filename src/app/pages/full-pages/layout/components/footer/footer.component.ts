import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as global from '../../../../../../environment/global';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  anio = global.anio;
  titulo = global.titulo;
  version = global.version;
}
