import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  /** When true, the search button is disabled and shows a loading state. */
  @Input() isLoading = false;

  /** Emits the trimmed location string when the user submits a search. */
  @Output() search = new EventEmitter<string>();

  /** Bound to the text input via ngModel. */
  locationInput = '';

  /** Inline validation message shown below the input. */
  validationError = '';

  ngOnInit(): void {}

  /**
   * Called when the form is submitted (button click or Enter key).
   * Validates input before emitting the search event.
   */
  onSubmit(): void {
    const trimmed = this.locationInput.trim();

    if (!trimmed) {
      this.validationError = 'Please enter a city name or ZIP code.';
      return;
    }

    if (trimmed.length > 100) {
      this.validationError = 'Location is too long (max 100 characters).';
      return;
    }

    this.validationError = '';
    this.search.emit(trimmed);
  }

  /** Clears the validation error as the user types. */
  onInputChange(): void {
    if (this.validationError) {
      this.validationError = '';
    }
  }
}