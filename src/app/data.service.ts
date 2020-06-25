import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
 
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Phenophase } from './phenophase';
import { Species } from './species';
import { Abundance } from './abundance';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {
    if(location.hostname.includes('local')) {
      this.baseUrl = 'https://data.usanpn.org/springwatchservices/v0/';
    }
    else if(location.hostname.includes('dev')) {
      this.baseUrl = 'https://data-dev.usanpn.org/springwatchservices/v0/';
    }
    else {
      this.baseUrl = 'https://data.usanpn.org/springwatchservices/v0/';
    }
  }

  baseUrl: string;

  getAbundances(): Observable<Abundance[]> {
    return this.http.get(this.baseUrl+"abundances?phenophase_id='489'").pipe(map(res => <Abundance[]>res));
  }

  getPhenophases(): Observable<Phenophase[]> {
    return this.http.get(this.baseUrl+"phenophases?phenophase_id='489'").pipe(map(res => <Phenophase[]>res));
  }

  getSpecies(): Observable<Species[]> {
    return this.http.get(this.baseUrl+"species?species_id='2'").pipe(map(res => <Species[]>res));
  }

}
