describe('treatment-rooms-add test -> ', function () {
  var routeParams, scope, ctrl;

  //#region mock data
  var mockTreatmentRooms = [
    { RoomId: 1, Name: 'Room 1' },
    { RoomId: 2, Name: 'Room 2' },
    { RoomId: 3, Name: 'Room 3' },
  ];

  var mockTreatmentRoom = { RoomId: 1, Name: 'Room 1' };

  var mockTreatmentRoomValue = {
    Value: { RoomId: 1, Name: 'Room 1' },
  };

  var mockLocations = [{ LocationId: 1, AbbreviationName: 'Location 1' }];

  var modalInstanceMock = {
    close: jasmine.createSpy(),
  };

  var mockModalFactory = {
    CancelModal: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy(),
    }),
  };

  //#endregion

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Schedule'));

  var mockScheduleServices;

  // Create spies for services
  beforeEach(
    module('Soar.Schedule', function ($provide) {
      mockScheduleServices = {
        Dtos: {
          TreatmentRooms: {
            save: jasmine.createSpy(),
            Update: jasmine.createSpy(),
          },
        },
      };

      $provide.value('ScheduleServices', mockScheduleServices);

      $provide.value('$uibModalInstance', modalInstanceMock);
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $route, $routeParams) {
    scope = $rootScope.$new();
    routeParams = $routeParams;

    ctrl = $controller('TreatmentRoomAddController', {
      $scope: scope,
      $uibModalInstance: modalInstanceMock,
      $routeParams: routeParams,
      ScheduleServices: mockScheduleServices,
      treatmentRoom: mockTreatmentRoom,
      treatmentRooms: mockTreatmentRooms,
      ModalFactory: mockModalFactory,
    });
  }));

  it('should set initial scope properties', function () {
    expect(ctrl.backupTreatmentRoom).toEqual(mockTreatmentRoom);
    expect(scope.editMode).toBe(true);
    expect(scope.treatmentRoom).toEqual(mockTreatmentRoom);
    expect(ctrl.treatmentRooms).toEqual(mockTreatmentRooms);
    expect(scope.hasErrors).toBe(false);
    expect(scope.hasDuplicates).toBe(false);
    expect(scope.isSaving).toBe(false);
  });

  describe('$watch treatmentRoom.Name -> ', function () {
    it('should call checkForDuplicates when newValue does not equal oldValue', function () {
      spyOn(ctrl, 'checkForDuplicates');

      scope.$apply(function () {
        scope.treatmentRoom.Name = 'Room';
      });
      scope.$apply(function () {
        scope.treatmentRoom.Name = 'asdf';
      });

      expect(ctrl.checkForDuplicates).toHaveBeenCalled();
    });

    it('should set hasDuplicates to false when newValue is undefined', function () {
      scope.$apply(function () {
        scope.treatmentRoom.Name = 'Room';
      });
      scope.$apply(function () {
        scope.treatmentRoom.Name = undefined;
      });

      expect(scope.hasDuplicates).toBe(false);
    });
  });

  describe('checkForDuplicates function -> ', function () {
    it('should set hasDuplicates to false when no duplicates are found', function () {
      ctrl.treatmentRooms = [];
      ctrl.checkForDuplicates();

      expect(scope.hasDuplicates).toBe(false);
    });

    it('should set hasDuplicates to true when Name is the same and RoomId is not the same', function () {
      scope.treatmentRoom = { Name: 'Room 1' };
      ctrl.checkForDuplicates();

      expect(scope.hasDuplicates).toBe(true);
    });
  });

  describe('IsValid function -> ', function () {
    it('should return true if frmTreatmentRoomSave and inpName is valid', function () {
      scope.frmTreatmentRoomSave = {
        $valid: true,
        inpName: {
          $valid: true,
        },
      };

      var bool = ctrl.IsValid();

      expect(bool).toBe(true);
    });

    it('should return false if frmTreatmentRoomSave is valid and inpName is inValid', function () {
      scope.frmTreatmentRoomSave = {
        $valid: true,
        inpName: {
          $valid: false,
        },
      };

      var bool = ctrl.IsValid();

      expect(bool).toBe(false);
    });

    it('should return false if frmTreatmentRoomSave is invalid and inpName is valid', function () {
      scope.frmTreatmentRoomSave = {
        $valid: false,
        inpName: {
          $valid: true,
        },
      };

      var bool = ctrl.IsValid();

      expect(bool).toBe(false);
    });

    it('should return false if frmTreatmentRoomSave is invalid and inpName is invalid', function () {
      scope.frmTreatmentRoomSave = {
        $valid: false,
        inpName: {
          $valid: false,
        },
      };

      var bool = ctrl.IsValid();

      expect(bool).toBe(false);
    });
  });

  describe('saveTreatmentRoom function -> ', function () {
    it('should set isSaving to false when IsValid returns false', function () {
      spyOn(ctrl, 'IsValid').and.callFake(function () {
        return false;
      });

      scope.saveTreatmentRoom();

      expect(scope.isSaving).toBe(false);
    });

    it('should set isSaving to false when hasDuplicates returns true', function () {
      spyOn(ctrl, 'IsValid').and.callFake(function () {
        return true;
      });
      scope.hasDuplicates = true;

      scope.saveTreatmentRoom();

      expect(scope.isSaving).toBe(false);
    });

    it('should set isSaving to false when IsValid returns false and hasDuplicates returns true', function () {
      spyOn(ctrl, 'IsValid').and.callFake(function () {
        return false;
      });
      scope.hasDuplicates = true;

      scope.saveTreatmentRoom();

      expect(scope.isSaving).toBe(false);
    });

    it('should call TreatmentRooms.save when not in editMode and hasErrors is false', function () {
      spyOn(ctrl, 'IsValid').and.callFake(function () {
        return true;
      });
      scope.hasDuplicates = false;
      scope.editMode = false;

      scope.saveTreatmentRoom();

      expect(mockScheduleServices.Dtos.TreatmentRooms.save).toHaveBeenCalled();
    });

    it('should call TreatmentRooms.Update when not in editMode and hasErrors is false', function () {
      spyOn(ctrl, 'IsValid').and.callFake(function () {
        return true;
      });
      scope.hasDuplicates = false;
      scope.editMode = true;

      scope.saveTreatmentRoom();

      expect(
        mockScheduleServices.Dtos.TreatmentRooms.Update
      ).toHaveBeenCalled();
    });
  });

  describe('TreatmentRoomsSaveOnSuccess function -> ', function () {
    it('should set isSaving to false and call toastrFactor.success and close modalInstance', function () {
      ctrl.TreatmentRoomsSaveOnSuccess(mockTreatmentRoomValue);

      expect(scope.isSaving).toBe(false);
      expect(_toastr_.success).toHaveBeenCalled();
      expect(modalInstanceMock.close).toHaveBeenCalled();
    });
  });

  describe('TreatmentRoomsSaveOnError function -> ', function () {
    it('should set isSaving to false and call toastrFactor.error', function () {
      ctrl.TreatmentRoomsSaveOnError();

      expect(scope.isSaving).toBe(false);
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });

  describe('cancelChanges function -> ', function () {
    it('should call modalFactory.CancelModal', function () {
      scope.treatmentRoom.Name = 'fdsa';
      scope.cancelChanges();

      expect(mockModalFactory.CancelModal().then).toHaveBeenCalled();
    });

    it('should call mInstance.close', function () {
      scope.cancelChanges();

      expect(modalInstanceMock.close).toHaveBeenCalled();
    });
  });

  describe('confirmCancel function -> ', function () {
    it('should call mInstance.close', function () {
      ctrl.confirmCancel();

      expect(modalInstanceMock.close).toHaveBeenCalled();
    });
  });
});
