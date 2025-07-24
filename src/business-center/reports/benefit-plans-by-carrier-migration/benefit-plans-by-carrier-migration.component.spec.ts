import { ComponentFixture, TestBed, async, tick } from '@angular/core/testing';
import { BenefitPlansByCarrierMigrationComponent } from './benefit-plans-by-carrier-migration.component';
import { SimpleChange } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

describe('BenefitPlansByCarrierMigrationComponent', () => {
    let component: BenefitPlansByCarrierMigrationComponent;
    let fixture: ComponentFixture<BenefitPlansByCarrierMigrationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BenefitPlansByCarrierMigrationComponent],
            imports: [TranslateModule.forRoot()]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BenefitPlansByCarrierMigrationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    const testData = {
        "carriers": [
            {
                "address": "1041 Obar Drive",
                "address2": "Peachtree Corners Circle",
                "benefitPlans": [
                    {
                        "name": "AARp for patient",
                        "planGroupNumber": "34324324",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "Apollo Plan DEMO",
                        "planGroupNumber": "43242332",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20anodqskifw",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20cfeogxxqbl",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20chtdnjthyk",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20feihmfveox",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20mblntyeebb",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20osjylnrogn",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20prxowgmfpk",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20ptzkljxuhi",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20sjhrvlnnjs",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20yoewmbrwqw",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30dfmlabwusg",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30feihajkmhy",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30giazuztbbh",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30hwpmzkzxti",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30kxbqhixgyn",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30moxtlnjndh",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30nvpfrcnseu",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30ozvrayiciv",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30qoicnhuhcd",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30srjevxwgwm",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40aavhjxlnrg",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40chikmdmjif",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40dzoxrqoivh",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40emhpbmdycj",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40kknzjvswvv",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40kyivbamseq",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40qswjtzxonv",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40romggrochf",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40ruobnxsxhe",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40sngfhmvsvn",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40uofxsevnfm",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestbqorithvzs",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestgkiueqjmvl",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestmigbnahtcn",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestmjaqlbwsfx",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestmqfxadndmr",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestmqvyygroxg",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestoicffyezkf",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestpgnnfxuctt",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTesttmplrzdcby",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestxnnccmrzlo",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestynewoxkfmi",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestzyvppsdxbe",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "Split Screen Plan",
                        "planGroupNumber": "11223",
                        "patientBenefitPlans": []
                    }
                ],
                "city": "Norcrosss",
                "name": "AARP",
                "payerId": "15646",
                "phoneNumbers": [
                    "3424324242"
                ],
                "state": "GA",
                "zipCode": "30009"
            },
            {
                "address": "309 Spruce Lane",
                "address2": "Peachtree Corners Circle",
                "benefitPlans": [
                    {
                        "name": "BrantleyGarza Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "BraydenDavid Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "CaydenRoss Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "DeaconHebert Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "IsmaelCallahan Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "JordanPennington Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "JuanKirk Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "JudeHopkins Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "JulianBrennan Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "KendrickSchultz Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "KhalilWinters Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "KingstonBowman Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "KoltonMartin Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "LeoSosa Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "MalakaiFinch Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "MohamedHouston Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "NikolaiRollins Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20bfinzdggzd",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20enhehkaasr",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20fsozdofqvo",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20hivpobmbqr",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20hqolnoynvs",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20maltgtiipu",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20mrahawmhon",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20ozduwfywel",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20pmosqtimab",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest20tczzxuturg",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30alvaiyaohg",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30bmiecfjgyt",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30haecqnltne",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30kdkrdvqizn",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30lbleaqvfdt",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30maijkeminm",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30tpxlvtvrdm",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30vijwzudnpz",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30woklmfegye",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest30zsybbvjdhy",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40fseirnqofl",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40klyuajjjky",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40mqrsqrldgw",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40odbocwswvw",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40oyudcfmgib",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40oztvtokpkf",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40uevmkfyvzt",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40uqjbkhnnyc",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40vriwljlxnh",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40xdokrhxzww",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTest40yqrdnkoldo",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestbmkywokkan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestbsqhajxryi",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestbvknqlnrux",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestethsgucefq",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTesteuplipzgof",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestgdvygufare",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestqicqqvntml",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestttotbxfbzy",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTesttuqoqgfgfd",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestvvhoudhgbj",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestvytfymdwhw",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "PlanTestxoiskrsgdw",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "RomeoTrevino Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "SimonSloan Benefit Plan",
                        "patientBenefitPlans": []
                    },
                    {
                        "name": "ThomasPayne Benefit Plan",
                        "patientBenefitPlans": []
                    }
                ],
                "city": "Spruce River",
                "name": "AbelCarson Insurance Company",
                "payerId": "00000",
                "phoneNumbers": [
                    "3424324359"
                ],
                "state": "IL",
                "zipCode": "30293"
            },
        ],
        "generatedAtDateTime": "2024-01-05T14:40:34.9230322Z",
        "generatedByUserCode": "ADMFU1",
        "locationOrPracticeEmail": "info@test.com",
        "locationOrPracticeName": "PracticePerf26899",
        "locationOrPracticePhone": "11111-222",
        "reportTitle": "Benefit Plans By Carrier"
    };

    describe('Refresh the data', () => {
        it('should create the component', () => {
            component.data = testData;
            component.refreshData = jasmine.createSpy();
            component.ngOnChanges();
            expect(component.refreshData).toHaveBeenCalled();
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    


  
});
