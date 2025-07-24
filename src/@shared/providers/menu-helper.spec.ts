import { TestBed } from '@angular/core/testing';
import { MenuHelper } from "./menu-helper";

describe('MenuHelper', () => {
    let service: MenuHelper;
    let mockPatSecurityService: jasmine.SpyObj<{ IsAuthorizedByAbbreviation: (authtype: string) => boolean; }>;

    beforeEach(() => {
        mockPatSecurityService = jasmine.createSpyObj('patSecurityService', ['IsAuthorizedByAbbreviation']);

        TestBed.configureTestingModule({
            providers: [
                MenuHelper,
                { provide: 'patSecurityService', useValue: mockPatSecurityService }
            ],
        });
        service = TestBed.inject(MenuHelper);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('authAccessByType', () => {
        it('Should call authAccessByType method returns true', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation.and.returnValue(true);

            const businessMenuItems = service.businessMenuItems();

            expect(businessMenuItems[0].Disabled).toBe(false);
            expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-dsh-dsh-view');

            expect(businessMenuItems[2].SubMenuItems[0].Disabled).toBe(false);
            expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-ins-iclaim-view');
        });

        it('Should call authAccessByType method returns false', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation.and.returnValue(false);
            
            const businessMenuItems = service.businessMenuItems();
            
            expect(businessMenuItems[0].Disabled).toBe(true);
            expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-dsh-dsh-view');

            expect(businessMenuItems[2].SubMenuItems[0].Disabled).toBe(true);
            expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-ins-iclaim-view');
        });
    });
});
