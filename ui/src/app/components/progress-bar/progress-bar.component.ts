import { Component, Input } from '@angular/core';
import { NbComponentStatus, NbComponentSize } from '@nebular/theme';

@Component({
  selector: 'be-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {

  @Input() value = 0;

  @Input() status: NbComponentStatus = 'primary';

  @Input() size: NbComponentSize = 'medium';

}
