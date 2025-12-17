import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {MessageModule} from 'primeng/message';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Table, TableModule} from 'primeng/table';
import {CheckboxModule} from 'primeng/checkbox';
import {Router} from '@angular/router';
import {PersonsStorage} from "../services/persons-storage";
import {Color, Country, Operation, OperationStatus, OperationType, Person} from "../person.model";
import {DropdownModule} from "primeng/dropdown";
import {Select} from "primeng/select";
import {Tag} from "primeng/tag";
import {InputNumber} from "primeng/inputnumber";
import {Dialog} from 'primeng/dialog';
import * as Papa from 'papaparse';
import {updatePerson} from '../rest/update-persons';
import {savePerson, savePersons} from '../rest/save-person';
import {deletePerson} from '../rest/delete-person';
import {MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {getOperations} from '../rest/get-persons';
import {apiBaseUrl} from '../rest/query';

export enum ColumnFilter {
  NONE = "NONE",
  ID = "id",
  NAME = "name",
  COORDINATE_X = "coordinates.x",
  COORDINATE_Y = "coordinates.y",
  EYE_COLOR = "eyeColor",
  HAIR_COLOR = "hairColor",
  LOCATION_X = "location.x",
  LOCATION_Y = "location.y",
  LOCATION_NAME = "location.name",
  HEIGHT = "height",
  WEIGHT = "weight",
  NATIONALITY = "nationality"
}

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
    Dialog,
    ToastModule
  ],
  templateUrl: 'main-page.component.html',
  styleUrl: './main-page.component.scss',
  providers: [MessageService]
})
export class MainPageComponent implements OnInit, AfterViewInit {
  @ViewChild('dt') dt!: Table;

  colors = Object.values(Color).map(c => ({label: c, value: c}));
  countries = Object.values(Country).map(c => ({label: c, value: c}));
  filters = Object.values(ColumnFilter).map(c => ({label: c, value: c}));

  totalWeight: number | null = null;
  minEyeColorId: number | null = null;
  weightThreshold: number = 70; // default slider value
  belowWeightCount: number | null = null;
  pendingUpdate: any = null

  dialogInUpdateMode = false
  displayCreateDialog = false;
  displayChooseLocation = false
  displayChooseCoordinates = false
  newPerson = this.getEmptyPerson();
  errorMessageFromServer = ""
  columnFilter = ColumnFilter.NONE
  filterValue = ""

  displayOperationsDialog = false;
  operations: Operation[] = [];


  constructor(private router: Router, public personsStorage: PersonsStorage, private cdr: ChangeDetectorRef, private messageService: MessageService) {
  }

  async ngOnInit() {

  }

  async ngAfterViewInit() {

  }

  getNested(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  applyFilter() {
    if (this.columnFilter === ColumnFilter.NONE) {
      return [...this.personsStorage.persons];
    }
    return [...this.personsStorage.persons].filter(p => {
      const value = this.getNested(p, this.columnFilter);
      return value == this.filterValue;
    });
  }

  onPersonDelete(person: Person) {
    this.finishForm(deletePerson({...person}))
  }

  onNameChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, name: person.name}))
    }
  }

  onCoordinatesChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, coordinates: person.coordinates}))
    }
  }

  onEyeColorChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, eyeColor: person.eyeColor}))
    }

    console.log('Eye color changed:', person.eyeColor);
  }

  onHairColorChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, hairColor: person.hairColor}))
    }

    console.log('Hair color changed:', person.hairColor);
  }

  onLocationChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, location: person.location}))
    }
  }

  onHeightChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, height: person.height}))
    }

    console.log('Height changed:', person.height);
  }

  onWeightChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, weight: person.weight}))
    }

    console.log('Weight changed:', person.weight);
  }

  onNationalityChange(person: any) {
    this.pendingUpdate = () => {
      this.finishForm(updatePerson({id: person.id, nationality: person.nationality}))
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

  showCreateDialog() {
    this.newPerson = this.getEmptyPerson(); // reset form
    this.displayCreateDialog = true;
    this.dialogInUpdateMode = false
  }

  onLocationSelected(personToCopyLocation: Person) {
    // @ts-ignore
    this.newPerson.location = personToCopyLocation.location!
    this.displayChooseLocation = false
  }

  onCoordinatesSelected(personToCopyLocation: Person) {
    // @ts-ignore
    this.newPerson.coordinates = personToCopyLocation.coordinates!
    this.displayChooseCoordinates = false
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
    return !!this.newPerson.name && !!this.newPerson.eyeColor;
  }

  getReasonForInvalidForm(): string | null {
    if (this.newPerson.name == null || this.newPerson.name.length === 0) {
      return "Name can not be blank";
    }

    if (this.newPerson.coordinates.x == null) {
      return "x coordinate must be set"
    }

    if (this.newPerson.coordinates.y == null) {
      return "y coordinate must be set"
    }

    if (this.newPerson.coordinates.x < -367) {
      return "x coordinate can not be below -367"
    }

    if (this.newPerson.coordinates.y > 944) {
      return "y coordinate can not be above 944"
    }

    if (this.newPerson.location.name.length > 409) {
      return "Location name too long"
    }

    if (this.newPerson.coordinates.x < 0 || this.newPerson.coordinates.x >= 360) {
      return "Coordinate.x must be between 0 and 360";
    }

    if (this.newPerson.coordinates.y < 0 || this.newPerson.coordinates.y >= 180) {
      return "Coordinate.y must be between 0 and 180";
    }

    if (this.newPerson.height == null || this.newPerson.height <= 0) {
      return "Height must be positive"
    }

    if (this.newPerson.weight == null || this.newPerson.weight <= 0) {
      return "Weight must be positive"
    }

    return null
  }

  createPerson() {
    const person = {...this.newPerson}

    if (this.dialogInUpdateMode) {
      this.finishForm(updatePerson(person))
    } else {
      this.finishForm(savePerson(person))
    }
  }

  finishForm(result: Promise<Response>) {
    result.then(async r => {
      if (r.ok) {
        this.displayCreateDialog = false;
        this.dialogInUpdateMode = false
      } else {
        this.personsStorage.fullUpdate()
        this.errorMessageFromServer = await r.text()
      }
    }).catch(e => {
      this.personsStorage.fullUpdate()
      this.errorMessageFromServer = e.value
    })
  }

  triggerCsvUpload() {
    document.getElementById('csvUpload')?.click();
  }

  onCsvSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.parseCsv(file)
        .then((persons: Person[]) => {
          this.savePersons(persons)
            .then(r => r.json())
            .catch(r => this.showErrorNotification(
              `Failed to save persons`))
            .then(json => {
              this.showSuccessNotification(
                `Successfully added ${json["changes"]} persons`)
            });
        })
        .catch(error => {
          this.showErrorNotification(
            `Error parsing CSV: ${error}`)
        });
    }
  }

  private parseCsv(file: File): Promise<Person[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const csvText = e.target.result;
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            try {
              const persons: Person[] = results.data.map((row: any) => this.mapRowToPerson(row));
              resolve(persons);
            } catch (error) {
              reject(error);
            }
          },
          error: (error: any) => reject(error),
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  private mapRowToPerson(row: any): Person {
    const coordinates = {
      id: row['coordinates_id'] ? parseInt(row['coordinates_id'], 10) : null,
      x: parseFloat(row['coordinates_x']),
      y: parseFloat(row['coordinates_y']),
    };

    const location = {
      id: row['location_id'] ? parseInt(row['location_id'], 10) : null,
      x: parseFloat(row['location_x']),
      y: parseFloat(row['location_y']),
      name: row['location_name'],
    };

    const eyeColor = this.mapToColor(row['eyeColor']);
    const hairColor = this.mapToColor(row['hairColor']);
    const nationality = row['nationality'] ? this.mapToCountry(row['nationality']) : undefined;

    return {
      id: null,
      name: row['name'],
      coordinates,
      creationTime: null,
      eyeColor,
      hairColor,
      location,
      height: parseFloat(row['height']),
      weight: parseFloat(row['weight']),
      nationality,
    };
  }

  private mapToColor(value: string): Color {
    const upperValue = value.toUpperCase();
    if (Object.values(Color).includes(upperValue as Color)) {
      return upperValue as Color;
    }
    throw new Error(`Invalid Color value: ${value}`);
  }

  private mapToCountry(value: string): Country {
    const upperValue = value.toUpperCase();
    if (Object.values(Country).includes(upperValue as Country)) {
      return upperValue as Country;
    }
    throw new Error(`Invalid Country value: ${value}`);
  }

  private async savePersons(persons: Person[]) {
    try {
      return await savePersons(persons)
    } catch (error) {
      this.personsStorage.fullUpdate();
      throw Error;
    }
  }

  showSuccessNotification(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 5000
    });
  }

  showErrorNotification(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }

  async showOperations() {
    try {
      this.operations = await getOperations('vaskozlov');
      this.displayOperationsDialog = true;
    } catch (error) {
      this.showErrorNotification('Failed to load operations');
      console.error(error);
    }
  }

  downloadFile(objectName: string | undefined) {
    if (!objectName) {
      return;
    }

    fetch(`${apiBaseUrl}/download?objectName=${objectName}`, {
      method: 'GET',
      mode: 'cors',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to download');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = objectName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Download failed', error);
        this.showErrorNotification('Failed to download file');
      });
  }

  protected readonly OperationType = OperationType;
  protected readonly OperationStatus = OperationStatus;
}
