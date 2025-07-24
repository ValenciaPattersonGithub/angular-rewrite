import { MicroServiceApiService } from 'src/security/providers';
import { ServerlessSignalrHubConnectionService } from './serverless-signalr-hub-connection.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from "@angular/common/http";
import { ToastService } from '../components/toaster/toast.service';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { Observable, of } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { SignalRConnectionInfo } from "src/@shared/models/signalr-connection-info.model";

//Needed for $rootScope
export function injectorFactory() {
    const rootScopeMock = new $rootScopeMock();
    const rootElementMock = { on: () => undefined };
    return function $injectorGet(provider: string) {
        if (provider === '$rootScope') {
            return rootScopeMock;
        } else if (provider === '$rootElement') {
            return rootElementMock;
        } else {
            throw new Error(`Unsupported injectable mock: ${provider}`);
        }
    };
}

//Needed for $rootScope
export class $rootScopeMock {
    private watchers: any[] = [];
    private events: { [k: string]: any[] } = {};

    $watch(fn: any) {
        this.watchers.push(fn);
    }

    $broadcast(evt: string, ...args: any[]) {
        if (this.events[evt]) {
            this.events[evt].forEach(fn => {
                fn.apply(fn, [/** angular.IAngularEvent*/ {}, ...args]);
            });
        }
        return {
            defaultPrevented: false,
            preventDefault() {
                this.defaultPrevented = true;
            }
        };
    }

    $on(evt: string, fn: any) {
        if (!this.events[evt]) {
            this.events[evt] = [];
        }
        this.events[evt].push(fn);
    }

    $evalAsync(fn: any) {
        fn();
    }

    $digest() {
        this.watchers.forEach(fn => fn());
    }
}

describe('ServerlessSignalrHubConnectionService', () => {

    const mockLocalizeService: any = {
        getLocalizedString: () => 'translated text'
    };

    const mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };

    let mockPracticeService: any = {
        getCurrentPractice: jasmine.createSpy().and.returnValue({id:324})
    };

    let mockServerlessSignalrHubConnectionService: ServerlessSignalrHubConnectionService;
    const mockMicroServiceApiUrlConfig = {};
    let mockMicroServiceApiService: MicroServiceApiService;
   
    //let mockToastService = {
    //    show: jasmine.createSpy('show'),
    //    close: jasmine.createSpy('close')
    //}

    let mockHttpClient: HttpClient;
    let upgradeModule: UpgradeModule;
    let $rootScope;
       
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([{ path: '1', children: [] }, { path: '2', children: [] }]),
                UpgradeModule
            ],
            declarations: [

            ],
            providers: [ServerlessSignalrHubConnectionService,
                { provide: 'HttpClient', useValue: mockHttpClient },
                MicroServiceApiService,
                { provide: 'MicroServiceApiUrlConfig', useValue: mockMicroServiceApiUrlConfig },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'practiceService', useValue: mockPracticeService }
            ]
        });
        upgradeModule = TestBed.inject(UpgradeModule);
        upgradeModule.$injector = { get: injectorFactory() };
        $rootScope = upgradeModule.$injector.get('$rootScope');
        mockMicroServiceApiService = jasmine.createSpyObj('MicroServiceApiService', ['getServerlessSignalRUrl']);
        mockServerlessSignalrHubConnectionService = new ServerlessSignalrHubConnectionService(mockHttpClient, mockMicroServiceApiService, $rootScope, mockToastrFactory, mockLocalizeService, mockPracticeService);

    });

    describe('init method', () => {

        it('startWatch method was called', () => {
            //Arrange
            //Spy on a private method. The <any> allows this
            const privateStartWatchSpy = spyOn<any>(mockServerlessSignalrHubConnectionService, 'startWatch');

            //Act
            mockServerlessSignalrHubConnectionService.init();

            //Assert
            expect(privateStartWatchSpy).toHaveBeenCalled();
        });
    })

    describe('startWatch method', () => {
        it('createSignalRConnection method was called', () => {
            //Arrange
            //Spy on a private method. The <any> allows this
            spyOn<any>(mockServerlessSignalrHubConnectionService, 'startWatch').and.callThrough();
            spyOn($rootScope, '$on').and.callThrough();
            //This is how you spy on a private method with the <any>
            const privateCreateSignalRConnectionSpy = spyOn<any>(mockServerlessSignalrHubConnectionService, 'createSignalRConnection').and.callThrough();
            mockServerlessSignalrHubConnectionService.getConnectionInfo = jasmine.createSpy().and.returnValue({ pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }) });
            spyOn(sessionStorage, 'getItem').and.returnValue('{"id": 123456}');

            //Act
            sessionStorage.setItem('userPractice', '{"id": 123456}');
            mockServerlessSignalrHubConnectionService.init();
            $rootScope.$broadcast('patCore:initpractice');
            mockServerlessSignalrHubConnectionService.hubConnection = null;

            //Assert
            expect(privateCreateSignalRConnectionSpy).toHaveBeenCalled();
        });
    });

    describe('createSignalRConnection method', () => {

        it('sessionStorage.getItem method was called and groupName = "123456"', () => {
            //Arrange
            mockPracticeService.getCurrentPractice = jasmine.createSpy().and.returnValue({ id: null });
            //Spy on a private method. The <any> allows this
            spyOn<any>(mockServerlessSignalrHubConnectionService, 'startWatch').and.callThrough();
            spyOn($rootScope, '$on').and.callThrough();
            //This is how you spy on a private method with the <any>
            const privateCreateSignalRConnectionSpy = spyOn<any>(mockServerlessSignalrHubConnectionService, 'createSignalRConnection').and.callThrough();
            mockServerlessSignalrHubConnectionService.getConnectionInfo = jasmine.createSpy().and.returnValue({ pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }) });
            let sessionStorageGetItemSpy = spyOn(sessionStorage, 'getItem').and.returnValue('{"id": 123456}');

            //Act
            sessionStorage.setItem('userPractice', '{"id": 123456}');
            mockServerlessSignalrHubConnectionService.init();
            $rootScope.$broadcast('patCore:initpractice');
            mockServerlessSignalrHubConnectionService.hubConnection = null;

            //Assert
            expect(sessionStorageGetItemSpy).toHaveBeenCalled();
            expect(mockServerlessSignalrHubConnectionService.groupName).toEqual('123456');
        });

        it('start method was called', async () => {
            //Arrange
            //Spy on a private method. The <any> allows this
            spyOn<any>(mockServerlessSignalrHubConnectionService, 'startWatch').and.callThrough();
            spyOn($rootScope, '$on').and.callThrough();
            //This is how you spy on a private method with the <any>
            const privateCreateSignalRConnectionSpy = spyOn<any>(mockServerlessSignalrHubConnectionService, 'createSignalRConnection').and.callThrough();
            let sessionStorageGetItemSpy = spyOn(sessionStorage, 'getItem').and.returnValue('{"id": 123456}');
            let signalRConnectionInfo: Observable<SignalRConnectionInfo> = of({ endpoint: 'aaaaaa', accessToken: 'bbbbbbb', url: 'ccccccc' });
            mockServerlessSignalrHubConnectionService.getConnectionInfo = jasmine.createSpy().and.returnValue(signalRConnectionInfo.pipe(takeWhile(() => mockServerlessSignalrHubConnectionService.alive)));
            //This is how you spy on a private method with the <any>
            const privateStartSpy = spyOn<any>(mockServerlessSignalrHubConnectionService, 'start');

            //Act
            sessionStorage.setItem('userPractice', '{"id": 123456}');
            mockServerlessSignalrHubConnectionService.init();
            $rootScope.$broadcast('patCore:initpractice');
            mockServerlessSignalrHubConnectionService.hubConnection = null;
            await Promise.resolve();

             //Assert
             expect(privateStartSpy).toHaveBeenCalled();
        });
    });

    describe('private start method', () => {
        //let resolveFunction: (value: void | PromiseLike<void>) => void;
        //let rejectFunction: (value: void | PromiseLike<void>) => void;
        let promise;
         
        beforeEach(function () {
            promise = new Promise<void>((resolve, reject) => {

                resolve();
            });

            mockServerlessSignalrHubConnectionService.signalRIsDisconnected = false;
            mockServerlessSignalrHubConnectionService.signalRErrorOnLoad = false;
                     
        });
        
        it('mockServerlessSignalrHubConnectionService.hubConnection.start is called', async() => {

            //Arrange
            mockServerlessSignalrHubConnectionService.hubConnection = jasmine.createSpyObj('mockServerlessSignalrHubConnectionService', ['hubConnection']);
            mockServerlessSignalrHubConnectionService.hubConnection.start = jasmine.createSpy().and.returnValue(promise);
                             
            //Act
            //Call private method
            mockServerlessSignalrHubConnectionService['start']();
            await Promise.resolve();

            //Assert
            expect(mockServerlessSignalrHubConnectionService.hubConnection.start).toHaveBeenCalled();
                    
        });

        it('mockServerlessSignalrHubConnectionService.hubConnection.connectionId to equal "12345678"', async () => {

            //Arrange
            mockServerlessSignalrHubConnectionService.hubConnection = jasmine.createSpyObj('mockServerlessSignalrHubConnectionService', ['hubConnection']);
            mockServerlessSignalrHubConnectionService.hubConnection.start = jasmine.createSpy().and.returnValue(promise);
            //This mocks a read only property
            Object.defineProperty(mockServerlessSignalrHubConnectionService.hubConnection, 'connectionId', { value: '12345678' });

            //Act
            //Call private method
            mockServerlessSignalrHubConnectionService['start']();
            await Promise.resolve();

            //Assert
            expect(mockServerlessSignalrHubConnectionService.hubConnection.connectionId).toEqual('12345678');
        });

        it('displaySignalRReconnectedSuccessMessage method is called', async () => {

            //Arrange
            mockServerlessSignalrHubConnectionService.hubConnection = jasmine.createSpyObj('mockServerlessSignalrHubConnectionService', ['hubConnection']);
            mockServerlessSignalrHubConnectionService.hubConnection.start = jasmine.createSpy().and.returnValue(promise);
            //This mocks a read only property
            Object.defineProperty(mockServerlessSignalrHubConnectionService.hubConnection, 'connectionId', { value: '12345678' });
            //Spy on a private method. The <any> allows this
            let displaySignalRReconnectedSuccessMessage = spyOn<any>(mockServerlessSignalrHubConnectionService, 'displaySignalRReconnectedSuccessMessage');

            //Act
            //Call private method
            mockServerlessSignalrHubConnectionService['start']();
            await Promise.resolve();

            //Assert
            expect(displaySignalRReconnectedSuccessMessage).toHaveBeenCalled();
        });

        it('displaySignalRConnectSuccessMessage method is called', async () => {

            //Arrange
            mockServerlessSignalrHubConnectionService.hubConnection = jasmine.createSpyObj('mockServerlessSignalrHubConnectionService', ['hubConnection']);
            mockServerlessSignalrHubConnectionService.hubConnection.start = jasmine.createSpy().and.returnValue(promise);
            //This mocks a read only property
            Object.defineProperty(mockServerlessSignalrHubConnectionService.hubConnection, 'connectionId', { value: '12345678' });
            //Spy on a private method. The <any> allows this
            let displaySignalRConnectSuccessMessage = spyOn<any>(mockServerlessSignalrHubConnectionService, 'displaySignalRConnectSuccessMessage');

            //Act
            //Call private method
            mockServerlessSignalrHubConnectionService['start']();
            await Promise.resolve();

            //Assert
            expect(displaySignalRConnectSuccessMessage).toHaveBeenCalled();
        });

        it('addUserToGroup method is called', async () => {

            //Arrange
            mockServerlessSignalrHubConnectionService.hubConnection = jasmine.createSpyObj('mockServerlessSignalrHubConnectionService', ['hubConnection']);
            mockServerlessSignalrHubConnectionService.hubConnection.start = jasmine.createSpy().and.returnValue(promise);
            //This mocks a read only property
            Object.defineProperty(mockServerlessSignalrHubConnectionService.hubConnection, 'connectionId', { value: '12345678' });
            //Spy on a private method. The <any> allows this
            let addUserToGroup = spyOn<any>(mockServerlessSignalrHubConnectionService, 'addUserToGroup');

            //Act
            //Call private method
            mockServerlessSignalrHubConnectionService['start']();
            await Promise.resolve();

            //Assert
            expect(addUserToGroup).toHaveBeenCalled();
        });
    });
});