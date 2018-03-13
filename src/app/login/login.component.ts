import { Component, OnInit } from '@angular/core';
import { SOAPService, Client } from 'ngx-soap';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { Session } from 'protractor';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  baseUrl: String = 'rmi://localhost:1099/TP';
  pseudo: string = '';
  client: Client;
  jsonResponse: any;
  reponse: Boolean;
  message: String;
  constructor(private http: Http, private soap: SOAPService, private router: Router) { }

  ngOnInit() {
    this.http.get('/assets/chat.wsdl').subscribe(response => {
      if (response && response.text()) {
        this.soap.createClient(response.text()).then((client: Client) => {
          this.client = client;
        });
      }
    });
  }

  subscribe() {
    // 1. get wsdl content
    this.http.get('/assets/chat.wsdl').subscribe(response => {
      // 2. create the client
      this.soap.createClient(response.text()).then((client: Client) => {
        // 3. get the web service operation
        const params = {
          pseudo: this.pseudo,
          salon: this.baseUrl
        };
        client.operation('subscribe', params)
          .then(operation => {
            if (operation.error) {
              console.log('Operation error', operation.error);
              return;
            }
            // 4. call the web service operation
            const url = operation.url.replace('http://localhost:8080', '');
            this.http.post(url, operation.xml, { headers: operation.headers }).subscribe(
              response => {
                this.jsonResponse = this.client.parseResponseBody(response.text());
                try {
                  this.reponse = this.jsonResponse.Body.subscribeResponse.subscribeReturn;
                  if (this.reponse === true) {
                    localStorage.setItem('pseudo', this.pseudo);
                    this.router.navigate(['chat']);
                  } else {
                    this.message = 'pseudo existe deja';
                  }

                } catch (error) { }
              },
              err => {
                console.log('Error calling ws', err);
              }
            );
          })
          .catch(err => console.log('Error', err));
      });
    });
  }
}
