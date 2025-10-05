import {AfterViewInit, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {MessageModule} from 'primeng/message';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {CheckboxModule} from 'primeng/checkbox';
import {Router} from '@angular/router';
import {PersonsStorage} from "../services/persons-storage";
import {Color, Country} from "../person.model";
import {DropdownModule} from "primeng/dropdown";
import {Select} from "primeng/select";
import {Tag} from "primeng/tag";
import {InputNumber} from "primeng/inputnumber";
import {Dialog} from 'primeng/dialog';
import {updatePerson} from '../rest/update-persons';
import {savePerson} from '../rest/save-person';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CheckboxModule,
    DropdownModule,
    Select,
    Tag,
    InputNumber,
    Dialog
  ],
  templateUrl: 'main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit, AfterViewInit {
  colors = Object.values(Color).map(c => ({label: c, value: c}));
  countries = Object.values(Country).map(c => ({label: c, value: c}));

  totalWeight: number | null = null;
  minEyeColorId: number | null = null;
  weightThreshold: number = 70; // default slider value
  belowWeightCount: number | null = null;
  pendingUpdate: any = null

  constructor(private router: Router, public personsStorage: PersonsStorage) {
  }

  async ngOnInit() {

  }

  async ngAfterViewInit() {

  }

  onNameChange(person: any) {
    this.pendingUpdate = () => {
      updatePerson({id: person.id, name: person.name}).catch()
    }
  }

  onCoordinatesChange(person: any) {
    console.log('Coordinates changed:', person.coordinates);
  }

  onEyeColorChange(person: any) {
    this.pendingUpdate = () => {
      updatePerson({id: person.id, eyeColor: person.eyeColor}).catch()
    }

    console.log('Eye color changed:', person.eyeColor);
  }

  onHairColorChange(person: any) {
    this.pendingUpdate = () => {
      updatePerson({id: person.id, hairColor: person.hairColor}).catch()
    }

    console.log('Hair color changed:', person.hairColor);
  }

  onLocationChange(person: any) {
    console.log('Location changed:', person.location);
  }

  onHeightChange(person: any) {
    this.pendingUpdate = () => {
      updatePerson({id: person.id, height: person.height}).catch()
    }

    console.log('Height changed:', person.height);
  }

  onWeightChange(person: any) {
    this.pendingUpdate = () => {
      updatePerson({id: person.id, weight: person.weight}).catch()
    }

    console.log('Weight changed:', person.weight);
  }

  onNationalityChange(person: any) {
    this.pendingUpdate = () => {
      updatePerson({id: person.id, nationality: person.nationality}).catch()
    }

    console.log('Nationality changed:', person.nationality);
  }

  onEditComplete(_: any) {
    if (this.pendingUpdate != null) {
      this.pendingUpdate()
      this.pendingUpdate = null
    }
  }

  calculateTotalWeight() {
    if (!this.personsStorage || !this.personsStorage.persons) {
      this.totalWeight = 0;
      return;
    }
    this.totalWeight = this.personsStorage.persons
      .reduce((sum, person) => sum + (person.weight || 0), 0);
  }

  getMinEyeColor() {
    if (!this.personsStorage?.persons || this.personsStorage.persons.length === 0) {
      this.minEyeColorId = null;
      return;
    }

    // Sort eye colors alphabetically to get the minimum
    const sortedPersons = [...this.personsStorage.persons].sort((a, b) => {
      if (a.eyeColor && b.eyeColor) {
        return a.eyeColor.localeCompare(b.eyeColor);
      }
      return 0;
    });

    // Take the first person with a defined eyeColor
    const minPerson = sortedPersons.find(p => p.eyeColor != null);

    this.minEyeColorId = minPerson?.id ?? null;
  }

  getBelowWeight() {
    if (!this.personsStorage?.persons || this.personsStorage.persons.length === 0) {
      this.belowWeightCount = 0;
      return;
    }

    this.belowWeightCount = this.personsStorage.persons.filter(
      person => person.weight != null && person.weight < this.weightThreshold
    ).length;
  }

  displayCreateDialog: boolean = false;

  newPerson = this.getEmptyPerson();

  showCreateDialog() {
    this.newPerson = this.getEmptyPerson(); // reset form
    this.displayCreateDialog = true;
  }

  getEmptyPerson() {
    return {
      id: null,
      name: '',
      coordinates: {id: null, x: 0, y: 0},
      creationTime: null,
      eyeColor: Color.BROWN,
      hairColor: Color.BLUE,
      location: {id: null, x: 0, y: 0, name: ''},
      height: 0,
      weight: 0,
      nationality: Country.GERMANY
    };
  }

  generateNewId(): number {
    const ids = this.personsStorage.persons.map(p => p.id).filter(v => v != null);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  isCreateFormValid(): boolean {
    // basic validation: name and eyeColor required
    return !!this.newPerson.name && !!this.newPerson.eyeColor;
  }

  createPerson() {
    const created_person = {...this.newPerson}
    savePerson(created_person).catch()
    this.personsStorage.onPersonUpdate(created_person);
    this.displayCreateDialog = false;
  }
}
