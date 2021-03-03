import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DisclaimerComponent } from '../components/disclaimer/disclaimer.component';

@Component({
  selector: 'app-bridge',
  templateUrl: './bridge.component.html',
  styleUrls: ['./bridge.component.scss']
})
export class BridgeComponent implements AfterViewInit {
  @ViewChild('disclaimerText', { static: true }) disclaimerText;

  constructor(private dialog: MatDialog) {}

  private openDisclaimer(): void {
    this.dialog.open(DisclaimerComponent, {
      width: '650px',
      disableClose: true,
      data: {
        text: 'DISCLAIMERS.START.TEXT',
        title: 'DISCLAIMERS.START.TITLE',
        actions: {}
      }
    });
  }

  ngAfterViewInit() {
    const link = this.disclaimerText.nativeElement.getElementsByClassName('as-link')[0];
    if (link) {
      link.onclick = event => {
        event.preventDefault();
        this.openDisclaimer();
        return false;
      };
    }
  }
}
