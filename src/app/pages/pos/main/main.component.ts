import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  loading = false;
  firstName: any = localStorage.getItem('firstName') || 'Guest';
  inventory = [];
  sales=0;
  constructor(private route: Router, private api: ApiService) {
    this.inventory = JSON.parse(localStorage.getItem('location') || '[]');
  }
  ngOnInit(){
    this.getStats();
  }
  getStats() {
    try {
      this.api.getAPI('/bills/previousStats', [["inventory", JSON.stringify(this.inventory)]]).subscribe((res: any) => {
        if (res.success == false) {
          this.loading = false;
        } else {
          this.sales = res.data
          this.loading = false;
        }
      });
    } catch (err) {
      this.loading = false;
    }
  }
}
