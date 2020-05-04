import { Component, Input, Output, EventEmitter } from '@angular/core';
import { App, NavController, ModalController } from 'ionic-angular';

@Component({
  selector: 'thf-toolbar',
  templateUrl: 'thf-toolbar.html',
})
export class ThfToolbarComponent {
  @Input() titleText: string;
  @Input() showMenu: boolean = false;
  @Input() buttonText: string;
  @Input() buttonDisabled : boolean =false;
  @Output() buttonCallback: EventEmitter<string> = new EventEmitter(true);
  @Input() showShadow: boolean = true;
  @Input() showLogo: boolean=false;

  isRootPage: boolean;
  constructor(private app:App,private navCtrl: NavController, private modalCtrl: ModalController) {
    this.navCtrl.viewDidLoad.subscribe((a) => {
    });
  }
  ngOnInit(){
      this.isRootPage = !this.navCtrl.canGoBack();
  }

  btClick(event) {
    if(!this.buttonDisabled){
        this.buttonCallback.emit(event);
    }
  }
}
