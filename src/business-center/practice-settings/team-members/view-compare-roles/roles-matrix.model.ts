export class RolesMatrix {
    Name: string = "";
    Functions?: Array<RolesFunctions>;
    active: boolean = false;
  }
  
  export class RolesFunctions {
    Name: string = "";
    Actions?: Array<RolesActions>;
  }
  
  export class RolesActions {
    Name: string = "";
    Roles?: Array<string>;
    ActionIds?: Array<string>;
  }

  export enum ViewCompareRoleType {
    view,
    compare
  }