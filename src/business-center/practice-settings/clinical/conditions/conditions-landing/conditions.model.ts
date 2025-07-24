export class ConditionModel {
  Description?: string;
  DataTag?: string;
  DateModified?: string;
  AffectedAreaId?: number;
  DrawTypeId?: string;
  ConditionId?: string;
  Abbreviation?: string | null;
  PracticeId?: number;
  UserModified?: string;
  IsDefault?: boolean;
  IconName?: string ;
  Value?: string;
  constructor(
    Description?: string,
    DrawTypeId?: string,
    IsDefault?: boolean,
    AffectedAreaId?: number,
    ConditionId?: string,
    DataTag?: string,
    Abbreviation?: string | null,
    UserModified?: string,
    DateModified?: string,
    IconName?: string,
    Value?: string,
  ) {
    this.AffectedAreaId = AffectedAreaId
    this.DataTag = DataTag
    this.DateModified = DateModified
    this.Description = Description
    this.DrawTypeId = DrawTypeId
    this.ConditionId = ConditionId
    this.Abbreviation = Abbreviation
    this.UserModified = UserModified
    this.IsDefault = IsDefault
    this.IconName = IconName
    this.Value = Value
  }
}

export class DrawTypes {
  AffectedAreaId?: number;
  DataTag?: string;
  DateModified?: string;
  Description?: string;
  DrawType?: string;
  DrawTypeId?: string;
  GroupNumber?: number;
  PathLocator?: string;
  PracticeId?: number;
  UserModified?: string;
}


export class AffectedAreas {
  Id?: number;
  Name?: string;
  Order?: number;
}


