export const AutocompleteStoryDefinition = (args) => ({
  props: args,
  template: AutocompleteStoryTemplate,
});

const AutocompleteStoryTemplate = `
  <div> 
     <app-svg-definitions></app-svg-definitions>
     <autocomplete 
        [aria-label]="ariaLabel"
        [disabled]="disabled" 
        [maxLength]="maxLength"
        [placeholderText]="placeholderText" 
        [hasError]="hasError" 
        [showResultsForEmptySearch]="showResultsForEmptySearch"
        [items]="items" 
        [(selectedItem)]="selectedItem"
        [itemFilter]="itemFilter" 
        (onSearch)="filteredItems = $event.filteredResults; searchTerm = $event.searchTerm">
          <autocomplete-option *ngFor="let item of filteredItems | slice:0:20" (onSelected)="selectedItem = $event;" [item]="item">{{item}}</autocomplete-option>
     </autocomplete> 
  </div>`;

export const AutocompleteStoryParameters = {
  docs: {
    source: {
      code: AutocompleteStoryTemplate,
      language: "html",
    },
  },
};
