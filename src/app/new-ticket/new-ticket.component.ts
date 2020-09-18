import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';


import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/database';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';



declare var google: any;
let map: any;
let marker: any;
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};
let infowindow: any;
const iconBase = 'http://maps.google.com/mapfiles/ms/icons/';


export const snapshotToArray = (snapshot: any) => {
  const returnArr = [];

  snapshot.forEach((childSnapshot: any) => {
    const item = childSnapshot.val();
    item.key = childSnapshot.key;
    returnArr.push(item);
  });

  return returnArr;
};

//adding category
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }

}


@Component({
  selector: 'app-new-ticket',
  templateUrl: './new-ticket.component.html',
  styleUrls: ['./new-ticket.component.css']
})






export class MyNewTicketComponent implements OnInit {

  @ViewChild('map', { static: false }) mapElement: ElementRef;
  donors = [];

  initMap() {
    navigator.geolocation.getCurrentPosition((location) => {
      map = new google.maps.Map(this.mapElement.nativeElement, {
        center: { lat: location.coords.latitude, lng: location.coords.longitude },
        zoom: 10
      });

      infowindow = new google.maps.InfoWindow();


      marker = new google.maps.Marker({
        position: { lat: location.coords.latitude, lng: location.coords.longitude },
        map,
        title: 'Click to zoom',
        icon: iconBase + 'blue-dot.png'
      });

      map.addListener('center_changed', () => {
        window.setTimeout(() => {
          map.panTo(marker.getPosition());
        }, 3000);
      });

      marker.addListener('click', (event: any) => {
        infowindow.setPosition(event.latLng);
        infowindow.setContent('<h2>Technical!</h2>' +
          '<h3><a href="/add-donor/' + marker.getPosition().lat() + '/' + marker.getPosition().lng() + '">Register Here</a></h3>');
        infowindow.open(map, marker);
      });
    }, (error) => {
      console.log(error);
    }, options);
  }

  createMarkers(place: any) {
    const latitude = parseFloat(place.coords.latitude);
    const longitude = parseFloat(place.coords.longitude);
    const donorMarker = new google.maps.Marker({
      map,
      position: { lat: latitude, lng: longitude },
      icon: iconBase + 'green-dot.png'
    });

    google.maps.event.addListener(donorMarker, 'click', function () {
      infowindow.setContent('<h3>' + place.name + '</h3><p>Phone number: ' + place.phone + '<br>Email: ' + place.email + '</p>');
      infowindow.open(map, this);
    });
  }


  constructor() {

    firebase.database().ref('donors/').on('value', resp => {
      this.donors = [];
      this.donors = snapshotToArray(resp);
      for (const donor of this.donors) {
        this.createMarkers(donor);
      }
    });
    this.initMap();
  }

  donorForm: FormGroup;
  formBuilder: FormBuilder;
  name: string = '';
  phone: string = '';
  email: string = '';
  lat = '';
  lng = '';
  ref = firebase.database().ref('donors/');

  ngOnInit() {

    this.donorForm = this.formBuilder.group({
      'name': [null, Validators.required],
      'phone': [null, Validators.required],
      'email': [null, Validators.required]
    });
  }
  // constructor( private formBuilder: FormBuilder) {
  //   this.lat = this.route.snapshot.paramMap.get('lat');
  //   this.lng = this.route.snapshot.paramMap.get('lng');
  // }

  onFormSubmit(form: any) {
    const donor = form;
    donor.coords = { latitude: this.lat, longitude: this.lng };
    const newDonor = firebase.database().ref('donors/').push();
    newDonor.set(donor);

  }




}
