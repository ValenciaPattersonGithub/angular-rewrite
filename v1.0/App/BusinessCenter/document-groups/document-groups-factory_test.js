describe('DocumentGroupsFactory tests ->', function () {
  var factory, documentGroupsService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      documentGroupsService = {};
      $provide.value('DocumentGroupsService', documentGroupsService);
    })
  );

  beforeEach(inject(function ($injector) {
    factory = $injector.get('DocumentGroupsFactory');
  }));

  it('should exist', function () {
    expect(factory).toBeDefined();
  });

  describe('access function ->', function () {
    var access;
    beforeEach(function () {
      _authPatSecurityService_.IsAuthorizedByAbbreviation = jasmine
        .createSpy()
        .and.callFake(function () {
          return access;
        });
    });

    it('should call patSecurityService', function () {
      factory.access();

      expect(
        _authPatSecurityService_.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledTimes(4);
      expect(
        _authPatSecurityService_.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith('soar-doc-docorg-agroup');
      expect(
        _authPatSecurityService_.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith('soar-doc-docorg-dgroup');
      expect(
        _authPatSecurityService_.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith('soar-doc-docorg-egroup');
      expect(
        _authPatSecurityService_.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith('soar-doc-docorg-vgroup');
    });

    it('should set values to false when user does not have access', function () {
      access = false;

      var retVal = factory.access();

      expect(retVal).toEqual({
        Create: false,
        View: false,
        Edit: false,
        Delete: false,
      });
    });

    it('should set values to true when user has access', function () {
      access = true;

      var retVal = factory.access();

      expect(retVal).toEqual({
        Create: true,
        View: true,
        Edit: true,
        Delete: true,
      });
    });
  });

  describe('DocumentGroups function ->', function () {
    var thenFn;
    beforeEach(function () {
      thenFn = angular.noop;
      documentGroupsService.get = jasmine.createSpy().and.callFake(function () {
        return {
          $promise: {
            then: thenFn,
          },
        };
      });
    });

    it('should not call documentGroupsService if user does not have access', function () {
      _authPatSecurityService_.IsAuthorizedByAbbreviation = function () {
        return false;
      };

      factory.DocumentGroups();

      expect(documentGroupsService.get).not.toHaveBeenCalled();
    });

    it('should call documentGroupsService if user has access', function () {
      _authPatSecurityService_.IsAuthorizedByAbbreviation = function () {
        return true;
      };

      factory.DocumentGroups();

      expect(documentGroupsService.get).toHaveBeenCalled();
    });

    describe('success callback ->', function () {
      var res;
      beforeEach(function () {
        res = { Value: 'res.Value' };
        thenFn = function (success) {
          success(res);
        };
      });

      it('should resolve promise', function () {
        var result = factory.DocumentGroups();

        expect(result.values).toBe(res.Value);
      });
    });

    describe('failure callback ->', function () {
      beforeEach(function () {
        thenFn = function (success, failure) {
          failure();
        };
      });

      it('should call toastrfactory.error', function () {
        factory.DocumentGroups();

        expect(_toastr_.error).toHaveBeenCalled();
      });
    });
  });

  describe('SaveDocumentGroup function ->', function () {
    var thenFn, dto;
    beforeEach(function () {
      dto = { DocumentGroupId: null };
      thenFn = angular.noop;
      documentGroupsService.save = jasmine
        .createSpy()
        .and.callFake(function () {
          return {
            $promise: {
              then: thenFn,
            },
          };
        });
      documentGroupsService.update = jasmine
        .createSpy()
        .and.callFake(function () {
          return {
            $promise: {
              then: thenFn,
            },
          };
        });
    });

    describe('when documentGroupDto.DocumentGroupId is null ->', function () {
      var access;
      beforeEach(function () {
        _authPatSecurityService_.IsAuthorizedByAbbreviation = jasmine
          .createSpy()
          .and.callFake(function (amfa) {
            return amfa === 'soar-doc-docorg-agroup' ? access : false;
          });
      });

      it('should not call documentGroupsService if user does not have create access', function () {
        access = false;

        factory.SaveDocumentGroup(dto);

        expect(documentGroupsService.save).not.toHaveBeenCalled();
      });

      it('should call documentGroupsService if user has access', function () {
        access = true;

        factory.SaveDocumentGroup(dto);

        expect(documentGroupsService.save).toHaveBeenCalled();
      });
    });

    describe('when documentGroupDto.DocumentGroupId is not null ->', function () {
      var access;
      beforeEach(function () {
        dto = { DocumentGroupId: 'groupId' };
        _authPatSecurityService_.IsAuthorizedByAbbreviation = jasmine
          .createSpy()
          .and.callFake(function (amfa) {
            return amfa === 'soar-doc-docorg-egroup' ? access : false;
          });
      });

      it('should not call documentGroupsService if user does not have create access', function () {
        access = false;

        factory.SaveDocumentGroup(dto);

        expect(documentGroupsService.update).not.toHaveBeenCalled();
      });

      it('should call documentGroupsService if user has access', function () {
        access = true;

        factory.SaveDocumentGroup(dto);

        expect(documentGroupsService.update).toHaveBeenCalled();
      });
    });

    describe('success callback ->', function () {
      var res;
      beforeEach(function () {
        res = { Value: 'res.Value' };
        thenFn = function (success) {
          success(res);
        };
      });

      it('should resolve promise', function () {
        var result = factory.SaveDocumentGroup(dto);

        expect(result.values).toBe(res.Value);
        expect(_toastr_.success).toHaveBeenCalled();
      });
    });

    describe('failure callback ->', function () {
      beforeEach(function () {
        thenFn = function (success, failure) {
          failure();
        };
      });

      it('should not call toastrfactory.success', function () {
        factory.SaveDocumentGroup(dto);

        expect(_toastr_.success).not.toHaveBeenCalled();
      });
    });
  });

  describe('DeleteDocumentGroup function ->', function () {
    var thenFn, id, access;
    beforeEach(function () {
      id = 'groupid';
      thenFn = angular.noop;
      documentGroupsService.delete = jasmine
        .createSpy()
        .and.callFake(function () {
          return {
            $promise: {
              then: thenFn,
            },
          };
        });
      _authPatSecurityService_.IsAuthorizedByAbbreviation = function () {
        return access;
      };
    });

    it('should not call documentGroupsService if user does not have create access', function () {
      access = false;

      factory.DeleteDocumentGroup(id);

      expect(documentGroupsService.delete).not.toHaveBeenCalled();
    });

    it('should call documentGroupsService if user has access', function () {
      access = true;

      factory.DeleteDocumentGroup(id);

      expect(documentGroupsService.delete).toHaveBeenCalled();
    });

    describe('success callback ->', function () {
      var res;
      beforeEach(function () {
        res = { Value: 'res.Value' };
        thenFn = function (success) {
          success(res);
        };
      });

      it('should resolve promise', function () {
        factory.DeleteDocumentGroup(id);

        expect(_toastr_.success).toHaveBeenCalled();
      });
    });

    describe('failure callback ->', function () {
      beforeEach(function () {
        thenFn = function (success, failure) {
          failure();
        };
      });

      it('should not call toastrfactory.success', function () {
        factory.DeleteDocumentGroup(id);

        expect(_toastr_.success).not.toHaveBeenCalled();
      });
    });
  });

  it('should set Actions', function () {
    expect(factory.Actions).toEqual({
      Create: 'create',
      Update: 'update',
      Delete: 'delete',
    });
  });
});
