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
      this.baseUrl = 'https://services.usanpn.org/one-time-obs-services/v0/';
  }

  baseUrl: string;

  getAbundances(): Observable<Abundance[]> {
    let obj = [
      { abundance_value_id:31,
        abundance_name:"Green",
        seq_num:1,
        abundance_category_id:38,
        abundance_category_name:"Plant greeness",
        abundance_category_description:"What color is the grass?",
        phenophase_id:1000,
        species_id:4
      },
      { abundance_value_id:32,
        abundance_name:"Red",
        seq_num:2,
        abundance_category_id:38,
        abundance_category_name:"Plant greeness",
        abundance_category_description:"What color is the grass?",
        phenophase_id:1000,
        species_id:4
      },
      { abundance_value_id:33,
        abundance_name:"Tan",
        seq_num:3,
        abundance_category_id:38,
        abundance_category_name:"Plant greeness",
        abundance_category_description:"What color is the grass?",
        phenophase_id:1000,
        species_id:4
      }
      ];
      return of(obj as Abundance[]);
    //return this.http.get(this.baseUrl+"abundances?phenophase_id='489'").pipe(map(res => <Abundance[]>res));
  }

  getPhenophases(): Observable<Phenophase[]> {
    return this.http.get(this.baseUrl+"phenophases?phenophase_id=1000,390,493").pipe(map(res => <Phenophase[]>res));
  }

  getSpecies(): Observable<Species[]> {
    return this.http.get(this.baseUrl+"species?species_id=3,4").pipe(map(res => <Species[]>res));
  }

}
