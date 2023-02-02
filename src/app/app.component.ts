import { Component, ChangeDetectorRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from './data.service';
import { Phenophase } from './phenophase';
import { Species } from './species';
import { Observation } from './observation';
import { v4 as uuid } from 'uuid';
import {isNumeric} from "rxjs/util/isNumeric"
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { Abundance } from './abundance';
import { FormsModule } from '@angular/forms';

/// <reference types="googlemaps"/>

interface Marker {
  lat: number;
  lng: number;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
  ) { }

  dateModel = new NgbDate(1789, 7, 14);;

  title = 'buffelgrass-tracker';
  
  abundances: Abundance[];
  selectedAbundance: Abundance;
  phenophases: Phenophase[];
  species: Species[];
  selectedSpecies: Species;


  // used for definition popups
  phenophaseName;
  phenophaseDefinition;
  phenophaseImage;

  observationsSubmitted = false;

  streetNumber;
  route;
  thecity;
  state;
  streetAddress;
  validAddress;
  fullLocation;

  validationErrorMsg;

  map: google.maps.Map; 
  lat = 32.2226;
  lng = -110.9747;
  marker = new google.maps.Marker({
    position: {
      lat: this.lat,
      lng: this.lng
    }
  });

  @ViewChild('gmap') gmapElement: any;

  userSettings = {
    showSearchButton: false,
    inputPlaceholderText: 'Enter Location'
  }
	autoCompleteCallback1(selectedData:any) {
    // alert(JSON.stringify(selectedData));
    if(selectedData 
      && selectedData.data 
      && selectedData.data.geometry.location 
      && selectedData.data.geometry.location.lat && selectedData.data.geometry.location.lng)
      this.setMapMarker(selectedData.data.geometry.location.lat, selectedData.data.geometry.location.lng);
  }
  
  showAbundance = false;

  setPhenophase(phenophase: Phenophase, value) {
    if(!this.observationsSubmitted) {
      phenophase.selection = phenophase.selection == value ? null : value;
      if(phenophase.selection == 'Y' || phenophase.selection == '?') {
        this.showAbundance = true;
      } else {
        this.showAbundance = false;
      }
    }
  }

  public phenoPhotoCredit = ``;
  showPhenophaseDetails(phenophase: Phenophase) {
    this.phenophaseDefinition = phenophase.definition;
    this.phenophaseName = phenophase.phenophase_name;
    if(this.selectedSpecies.common_name == 'Cheatgrass') {
      if(phenophase.phenophase_name === 'Leaves') {
        this.phenophaseImage = "assets/cheat-leaves.jpeg";
        this.phenoPhotoCredit = `Credit: John Hilty, <a href="https://creativecommons.org/licenses/by-nc/2.0/" target="_blank">(CC BY-NC)</a>`;
      }
      if(phenophase.phenophase_name === 'Flowers') {
        this.phenophaseImage = "assets/cheat-flowers.jpeg";
        this.phenoPhotoCredit = `Credit: Paul Rothrock, <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank">(CC BY-SA)</a>`;
      }
      if(phenophase.phenophase_name === 'Fruits') {
        this.phenophaseImage = "assets/cheat-fruits.jpeg";
        this.phenoPhotoCredit = `Credit: Max Licher, <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank">(CC BY-SA)</a>`;
        this.phenophaseDefinition = "One or more fruits are visible on the plant. For Bromus tectorum, the fruit is a tiny grain, hidden within tiny bracts and grouped into small clusters that hang on the end of branches along a drooping seed head, that changes texture from soft or watery to hard and drops from the plant. Do not include seed heads that have already dropped all of their grains."
      }
    }
    else if(this.selectedSpecies.common_name == 'Red Brome') {
      if(phenophase.phenophase_name === 'Leaves') {
        this.phenophaseImage = "assets/bromus-leaves.jpeg";
        this.phenoPhotoCredit = `Credit: Dr. Michael Pfeiffer`;
      }
      if(phenophase.phenophase_name === 'Flowers') {
        this.phenophaseImage = "assets/bromus-flowers.jpeg";
        this.phenoPhotoCredit = `Credit: Max Licher, <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank">(CC BY-SA)</a>`;
      }
      if(phenophase.phenophase_name === 'Fruits') {
        this.phenophaseImage = "assets/bromus-fruits.jpeg";
        this.phenoPhotoCredit = `Credit: Patrick Alexander, <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank">(CC BY-SA)</a>`;
        this.phenophaseDefinition = "One or more ripe fruits are visible on the plant. For Bromus rubens, a fruit is considered ripe when it is hard when squeezed and difficult to divide with a fingernail, or when it readily drops from the plant when touched. Do not include seed heads that have already dropped all of their grains.";
      }
     }
     else {
      this.phenophaseImage = "";
      this.phenoPhotoCredit = ``;
      this.phenophaseDefinition = "";
     }
      
    
  }

  circleAllNo() {
    if(!this.observationsSubmitted)
      this.phenophases.forEach(phenophase => phenophase.selection = 'N');
  }

  selectAbundance(abundance: Abundance) {
    this.selectedAbundance = abundance;
  }

  public selectedSpeciesName = '';
  selectSpecies(species: Species) {
    this.selectedSpecies = species;
    this.selectedSpeciesName = species.common_name;
  }
 
  reverseGeoCode(lat, lng) {
    let apiKey = "AIzaSyD1LZ4BL5z9hpEwolZYiPIRbW8F2OCDwqE";
    let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    return this.http.get(url);
  }

  public addressChange(event) {
    console.log('addresschanged');
  }

  public resetObservations() {
    this.observationsSubmitted = false;
    this.phenophases.forEach(phenophase => {
      phenophase.selection = null;
    })
    this.showAbundance = null;
    this.selectedAbundance = null;
    this.selectedSpecies= null;
    this.validationErrorMsg = null;
    window.scrollTo(0, 0);
  }

  public async submitObservations() {
    this.validationErrorMsg = null;

    if(!isNumeric(this.lat) || !isNumeric(this.lng)) {
      this.validationErrorMsg = "Your location didn't resolve to a valid latitude and longitude. Please choose a location before submitting."
      setTimeout(()=> { this.validationErrorMsg = null; }, 5000);
      return;
    }

    if(this.lat == 32.2226 && this.lng == -110.9747) {
      this.validationErrorMsg = "Please choose a location before submitting."
      setTimeout(()=> { this.validationErrorMsg = null; }, 5000);
      return;
    }

    let observationExtentMap = {'Y': 1, 'N': 0, '?': -1};
    let url = this.dataService.baseUrl + `observations`;

    let obsDate = new Date(this.dateModel.year, this.dateModel.month - 1, this.dateModel.day)//

    let observations = [];
    this.phenophases.forEach(phenophase => {
      if (phenophase.selection != null) {
        let obs = new Observation();
        obs.observation_extent = observationExtentMap[phenophase.selection];
        obs.phenophase_id = phenophase.phenophase_id;
        obs.observation_date = obsDate.toISOString().slice(0, 19).replace('T', ' ');
        if(this.showAbundance && this.selectedAbundance != null) {
          obs.abundance_category_id = this.selectedAbundance.abundance_category_id;
          obs.abundance_value_id = this.selectedAbundance.abundance_value_id;
        }
        observations.push(obs);
      }
    });

    if(observations.length < 1) {
      this.validationErrorMsg = "Please select Y, N, or ? for at least one phenophase before submitting."
      setTimeout(()=> { this.validationErrorMsg = null; }, 5000);
      return;
    }

    let payload = [{
      user_id: localStorage.getItem("userId"),
      latitude: this.lat,
      longitude: this.lng,
      species_id: this.species[0].species_id,
      client_datetime: obsDate.toISOString().slice(0, 19).replace('T', ' '),
      observations: observations
    }];

    let headers = new Headers({ 'Content-Type': 'application/json' });
    //let options = new RequestOptions({ headers: headers, withCredentials: true });
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    const req = this.http.post(url, payload, httpOptions).subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log("Error occured");
      }
    );
    this.observationsSubmitted = true;
    return req;
  }

  setMapMarker(lat, lng) {
    this.marker.setMap(null);
    this.lat = lat;
    this.lng = lng;
    this.marker = new google.maps.Marker({
      position: {
        lat: this.lat, 
        lng: this.lng
      }
    });
    this.marker.setMap(this.map);
    this.map.setCenter({
      lat:this.lat,
      lng:this.lng
    });
  }

  alreadyCalled = false;

  ngOnInit() {

    let d = new Date();
    this.dateModel.year = d.getFullYear();
    this.dateModel.month = d.getMonth() + 1;
    this.dateModel.day = d.getDate();

    if(!localStorage.getItem("userId"))
      localStorage.setItem("userId", uuid());
    var mapProp = {
      center: new google.maps.LatLng(this.lat, this.lng),
      zoom: 9,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      disableDefaultUI: true
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    
    this.marker.setMap(this.map);
    navigator.geolocation.getCurrentPosition(position => {
      console.log(position);
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
      console.log('test');
      this.setMapMarker(this.lat, this.lng);
      this.reverseGeoCode(this.lat, this.lng).subscribe(geo => {
        this.streetNumber = '';
        this.route = '';
        this.thecity = '';
        this.state = '';
        if (geo['results'].length > 0) {
            geo['results'][0].address_components.forEach(ac => {
                if (ac.types.includes('street_number')) {
                    this.streetNumber = ac.short_name;
                } else if(ac.types.includes('route')) {
                    this.route = ac.short_name;
                } else if(ac.types.includes('locality')) {
                    this.thecity = ac.short_name;
                } else if(ac.types.includes('administrative_area_level_1')) {
                  this.state = ac.short_name;
                }
            });
            this.streetAddress = this.streetNumber + " " + this.route;
        } else {
            console.log("no location at coordinates");
            this.validAddress = false;
        }
        this.fullLocation = this.streetAddress + ' ' + this.thecity + ', ' + this.state;

        //update text in the input field
        this.userSettings['inputString'] = this.fullLocation;
        this.userSettings = Object.assign({},this.userSettings);

        this.cd.detectChanges();
        setTimeout(()=> { this.alreadyCalled = false; }, 200);
      });
    });
    
    google.maps.event.addListener(this.map, 'click', (event) => {
      if (!this.alreadyCalled) {
        this.alreadyCalled = true;
      
        this.setMapMarker(event.latLng.lat(), event.latLng.lng());
        
        this.reverseGeoCode(this.lat, this.lng).subscribe(geo => {
          this.streetNumber = '';
          this.route = '';
          this.thecity = '';
          this.state = '';
          if (geo['results'].length > 0) {
              geo['results'][0].address_components.forEach(ac => {
                  if (ac.types.includes('street_number')) {
                      this.streetNumber = ac.short_name;
                  } else if(ac.types.includes('route')) {
                      this.route = ac.short_name;
                  } else if(ac.types.includes('locality')) {
                      this.thecity = ac.short_name;
                  } else if(ac.types.includes('administrative_area_level_1')) {
                    this.state = ac.short_name;
                  }
              });
              this.streetAddress = this.streetNumber + " " + this.route;
          } else {
              console.log("no location at coordinates");
              this.validAddress = false;
          }
          this.fullLocation = this.streetAddress + ' ' + this.thecity + ', ' + this.state;

          //update text in the input field
          this.userSettings['inputString'] = this.fullLocation;
          this.userSettings = Object.assign({},this.userSettings);

          this.cd.detectChanges();
          setTimeout(()=> { this.alreadyCalled = false; }, 200);
        });

      }
      
  });

  this.dataService.getAbundances()
    .subscribe((data) => {
    this.abundances = data;
    });

  this.dataService.getPhenophases()
    .subscribe((data) => {
    this.phenophases = data.reverse();
    });

  this.dataService.getSpecies()
    .subscribe((data) => {
    this.species = data;
    });

  }
}
