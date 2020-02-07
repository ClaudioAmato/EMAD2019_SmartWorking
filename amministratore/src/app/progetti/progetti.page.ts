import { Component, OnInit } from '@angular/core';
import LoadingService from '../providers/loading.service';
import { NavController } from '@ionic/angular';
import {NavigationExtras} from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HttpClient} from '@angular/common/http';


@Component({
  selector: 'app-progetti',
  templateUrl: './progetti.page.html',
  styleUrls: ['./progetti.page.scss'],
})

export class ProgettiPage implements OnInit {
  projects = [];

  constructor(private http: HttpClient, private loadingService: LoadingService, 
    private alertController: AlertController, public navCtrl: NavController) {}

  ngOnInit() {
    this.loadingService.presentLoading('Loading...').then(() => {

      const url = 'https://europe-west1-smart-working-5f3ea.cloudfunctions.net/getAllProjects';

      this.http.get(url).subscribe(response => {

        if (response['hasError']) {

          this.loadingService.dismissLoading();

          this.presentAlertError(response['error']);

        } else {

          this.loadingService.dismissLoading();

          this.projects = response['progetti'];

        }

      });

    });

  }

  async presentAlertError(message: string) {
    const alert = await this.alertController.create({
      header: 'Errore',
      message,
      cssClass: 'alertClass2',
      buttons: [{
        text: 'OK',
      }]
    });

    await alert.present();
  }

  goAnOtherPage() {

    this.navCtrl.navigateRoot('/form-progetti');

  }

  goGestioneProgetto(id: string) {

    let navigationExtras: NavigationExtras = {

      queryParams: {

        id

      }

    }

    this.navCtrl.navigateForward('/associa-dipendenti', navigationExtras);

  }

  filterList(evt) {
    const searchTerm = evt.srcElement.value;
    if (!searchTerm) {
      return;
    }
    this.projects = this.projects.filter(element =>{
      if (element.nome.toLowerCase && searchTerm){
        if (element.nome.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
           return true;
        }
      }
      return false;
    })
  }

}
