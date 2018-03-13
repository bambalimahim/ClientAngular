import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { SOAPService, Client } from 'ngx-soap';
import { Router } from '@angular/router';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import $ from 'jquery';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  baseUrl: String = 'rmi://localhost:1099/TP';
  pseudo: String = localStorage.getItem('pseudo');
  client: Client;
  jsonResponse: any;
  reponse: Boolean;
  message: String;
  messages: String = '';
  mes: String;
  nouv: String;
  private stompClient;
  constructor(private http: Http, private soap: SOAPService, private router: Router) { }

  ngOnInit() {
    this.http.get('/assets/chat.wsdl').subscribe(response => {
      if (response && response.text()) {
        this.soap.createClient(response.text()).then((client: Client) => {
          this.client = client;
        });
      }
    });
    this.test();
  }

  disconnect() {
    // 1. get wsdl content
    this.http.get('/assets/chat.wsdl').subscribe(response => {
      // 2. create the client
      this.soap.createClient(response.text()).then((client: Client) => {
        // 3. get the web service operation
        const params = {
          pseudo: this.pseudo,
          url: this.baseUrl
        };
        client.operation('unsubscribe', params)
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
                  this.reponse = this.jsonResponse.Body.unsubscribeResponse.unsubscribeReturn;
                  if (this.reponse === true) {
                    this.router.navigate(['']);
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

  postMessage() {
    // 1. get wsdl content
    this.http.get('/assets/chat.wsdl').subscribe(response => {
      // 2. create the client
      this.soap.createClient(response.text()).then((client: Client) => {
        // 3. get the web service operation
        const params = {
          pseudo: this.pseudo,
          message: this.message,
          url: this.baseUrl
        };
        client.operation('postMessage', params)
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
                  this.message = '';
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

  test () {
    setInterval(() => {
      // 1. get wsdl content
    this.http.get('/assets/chat.wsdl').subscribe(response => {
      // 2. create the client
      this.soap.createClient(response.text()).then((client: Client) => {
        // 3. get the web service operation
        const params = {
          url: this.baseUrl
        };
        client.operation('getMessage', params)
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
                  this.mes = this.jsonResponse.Body.getMessageResponse.getMessageReturn;
                  if (this.mes !== this.nouv) {
                    this.messages += this.mes + '\n';
                    this.nouv = this.mes;
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
    }, 2000);
  }
}
