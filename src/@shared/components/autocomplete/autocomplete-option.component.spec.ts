import { AutocompleteOptionComponent } from "./autocomplete-option.component";
import { ChangeDetectorRef } from "@angular/core";

describe("AutocompleteOptionComponent", () => {
  let component: AutocompleteOptionComponent<TestObject>;

  let mockChangeDetectorRef: ChangeDetectorRef;

  beforeEach(() => {
    mockChangeDetectorRef  = {
      detach: jasmine.createSpy(),
      detectChanges: jasmine.createSpy(),
      checkNoChanges: null,
      reattach: null,
      markForCheck: null
    };

    component = new AutocompleteOptionComponent<TestObject>(mockChangeDetectorRef);
  });

  describe("setActiveStyles ->", function () {
    it("should set isActive to true if it is not currently set to true", function () {
      component.isActive = false;

      component.setActiveStyles();

      expect(component.isActive).toBeTruthy();
    });

    it("should call change detection when isActive is not currently set to true", function () {
      component.isActive = true;
      jasmine.createSpy(mockChangeDetectorRef['destroyed']).and.returnValue(false);

      component.setInactiveStyles();

      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalledTimes(1);
    });
  });

  describe("setInactiveStyles ->", function () {
    it("should set isActive to false if it is not currently set to false", function () {
      component.isActive = false;

      component.setInactiveStyles();

      expect(component.isActive).toBeFalsy();
    });


    it("should call change detection when isActive to false if it is not currently set to false", function () {
      component.isActive = true;
      jasmine.createSpy(mockChangeDetectorRef['destroyed']).and.returnValue(false);

      component.setInactiveStyles();

      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalledTimes(1);
    });
  });
});

type TestObject = {
  FirstName: string;
  LastName: string;
};
