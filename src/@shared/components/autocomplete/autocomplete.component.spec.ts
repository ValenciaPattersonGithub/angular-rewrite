import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AutocompleteComponent } from "./autocomplete.component";
import { ReactiveFormsModule } from "@angular/forms";
import { SvgIconComponent } from "../svg-icons/svg-icon.component";

describe("AutocompleteComponent", () => {
  let component: AutocompleteComponent<TestObject>;
  let fixture: ComponentFixture<AutocompleteComponent<TestObject>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AutocompleteComponent, SvgIconComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent<AutocompleteComponent<TestObject>>(
      AutocompleteComponent
    );
    component = fixture.componentInstance;
    component.ngOnInit();

    fixture.detectChanges();
  });

  describe("selectedItem ->", function () {
    it("should set value with value generated from displayFn", function () {
      component.displayFn = (item) => {
        return item.FirstName + " " + item.LastName;
      };

      component.selectedItem = { FirstName: "John", LastName: "Doe" };

      expect(component.autocompleteControl.value).toEqual("John Doe");
    });
  });

  describe("autocompleteControl ->", function () {
    it("should set isFiltered to true when length is greater than 0", () => {
      component.autocompleteControl.setValue("test");
      fixture.detectChanges();

      expect(component.isFiltered).toBeTruthy();
    });

    it("should set isFiltered to false when length is 0", function () {
      component.autocompleteControl.setValue("");
      fixture.detectChanges();

      expect(component.isFiltered).toBeFalsy();
    });

    it("should set isHidden to true filtered results are equal to zero", () => {
      component.items = [
        { FirstName: "A", LastName: "B" },
        { FirstName: "C", LastName: "D" },
        { FirstName: "E", LastName: "F" },
      ];
      component.itemFilter = (items, searchText) => {
        const normalizedSearchText = searchText.toLowerCase();
        return items.filter(
          (item) =>
            item.FirstName.toLowerCase().includes(normalizedSearchText) ||
            item.LastName.toLowerCase().includes(normalizedSearchText)
        );
      };
      component.autocompleteControl.setValue("G");
      fixture.detectChanges();

      expect(component.isHidden).toBeTruthy();
    });

    it("should set isHidden to true filtered results are greater than zero", function () {
      component.items = [
        { FirstName: "A", LastName: "B" },
        { FirstName: "C", LastName: "D" },
        { FirstName: "E", LastName: "F" },
      ];
      component.itemFilter = (items, searchText) => {
        const normalizedSearchText = searchText.toLowerCase();
        return items.filter(
          (item) =>
            item.FirstName.toLowerCase().includes(normalizedSearchText) ||
            item.LastName.toLowerCase().includes(normalizedSearchText)
        );
      };
      component.autocompleteControl.setValue("d");
      fixture.detectChanges();

      expect(component.isHidden).toBeFalsy();
    });

    it("should filter items correctly when search text is set", async (done: DoneFn) => {
      component.items = [
        { FirstName: "A", LastName: "B" },
        { FirstName: "C", LastName: "D" },
        { FirstName: "E", LastName: "A" },
      ];
      component.itemFilter = (items, searchText) => {
        const normalizedSearchText = searchText.toLowerCase();
        return items.filter(
          (item) =>
            item.FirstName.toLowerCase().includes(normalizedSearchText) ||
            item.LastName.toLowerCase().includes(normalizedSearchText)
        );
      };

      component.onSearch.subscribe((searchEvent) => {
        expect(searchEvent.filteredResults.length).toBe(2);
        done();
      });

      component.autocompleteControl.setValue("a");
    });
  });
});

type TestObject = {
  FirstName: string;
  LastName: string;
};
