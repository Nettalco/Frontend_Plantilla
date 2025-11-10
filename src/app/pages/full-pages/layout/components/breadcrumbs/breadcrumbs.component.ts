import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, BreadcrumbModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.css'
})
export class BreadcrumbsComponent implements OnInit {
  items: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/inicio' };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.updateBreadcrumbs();
      });

    this.updateBreadcrumbs();
  }

  private updateBreadcrumbs(): void {
    const route = this.activatedRoute.root;
    const breadcrumbs: MenuItem[] = [];

    let currentRoute = route;
    let url = '';

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
      const routeSnapshot = currentRoute.snapshot;

      if (routeSnapshot.url.length) {
        url += '/' + routeSnapshot.url.map(segment => segment.path).join('/');
        
        const label = routeSnapshot.data['breadcrumb'] || routeSnapshot.url[routeSnapshot.url.length - 1].path;
        
        if (label && label !== 'inicio') {
          breadcrumbs.push({
            label: this.formatLabel(label),
            routerLink: url
          });
        }
      }
    }

    this.items = breadcrumbs;
  }

  private formatLabel(label: string): string {
    return label
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
