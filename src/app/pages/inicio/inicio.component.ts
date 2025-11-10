import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import * as global from '../../../environment/global';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  titulo = global.titulo;
}

