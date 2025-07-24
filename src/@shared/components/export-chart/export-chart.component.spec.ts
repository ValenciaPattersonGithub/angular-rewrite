import { ExportChartComponent } from "./export-chart.component";

describe('ExportChartComponent ->', () => {

    let component: ExportChartComponent;
    let mockPatientService;
    let mockToasterFactory;
    let mockLocalizeService;

    beforeEach(() => {

        mockPatientService = {
            save: (a: any) => jasmine.createSpy()
        };

        mockToasterFactory = {
            error: jasmine.createSpy()
        };

        mockLocalizeService = {
            getLocalizedString: () => 'Please select at least one item.'
        };

        component = new ExportChartComponent(mockPatientService, mockToasterFactory, mockLocalizeService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('test validation logic', () => {

        it('should disable export button if no options are selected', () => {

            //arrange
            component.exportButtonDisabled = false;

            //act
            component.exportChart = false;
            component.exportFees = false;
            component.exportLedger = false;
            component.exportNotes = false;
            component.onOptionChanged();

            //assert
            expect(component.exportButtonDisabled).toBe(true);
        });

        it('should show correct error message when no options are selected', () => {

            //arrange
            component.exportButtonDisabled = false;

            //act
            component.exportChart = false;
            component.exportFees = false;
            component.exportLedger = false;
            component.exportNotes = false;
            component.onOptionChanged();

            //assert
            expect(component.showError).toBe(true);
            expect(component.errorMessage).toBe('Please select at least one item.');
        });

    });
})