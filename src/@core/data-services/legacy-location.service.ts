// "abstract class" type definition for legacy Location Service
// (ideally this would be an interface, but that doesn't work with the Angular factory provider)
export abstract class LegacyLocationService {
    abstract getCurrentLocationEnterpriseId(): number;
    abstract getLocationEnterpriseId(locationId: number): number;
    abstract refreshActiveLocations(): Promise<void>;
}
