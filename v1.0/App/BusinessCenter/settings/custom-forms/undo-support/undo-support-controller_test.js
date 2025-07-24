describe('Controller: UndoSupportController', function () {
  var ctrl, scope, undoSupportService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('common.services'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, _UndoSupportService_) {
    undoSupportService = _UndoSupportService_;
    scope = $rootScope.$new();
    scope.section = '';

    ctrl = $controller('UndoSupportController', {
      $scope: scope,
      UndoSupportService: undoSupportService,
    });
  }));

  //controller
  it('should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  it('should check that undoSupportService is not null', function () {
    expect(undoSupportService).not.toBe(null);
  });

  it('should check that undoSupportService is not undefined', function () {
    expect(undoSupportService).not.toBeUndefined();
  });

  it('should check that correct intial values', function () {
    expect(scope.canUndo).toBeDefined(false);
    expect(scope.canRedo).toBeDefined(false);
  });
  it('should check that undoSupportObject is not null', function () {
    expect(scope.undoServiceObject).not.toBe(null);
    expect(scope.undoServiceObject).not.toBeUndefined;
  });

  it('should allow a number of undo changes (word by word) and canUndo', function () {
    scope.section = '';
    scope.$apply();
    scope.section = 'Hello';
    scope.$apply();
    scope.section = 'Hello World';
    scope.$apply();
    scope.section = 'Hello World How';
    scope.$apply();
    scope.undo();
    expect(scope.canUndo).toBe(true);
    expect(scope.section).toBe('Hello World');
    scope.undo();
    expect(scope.canUndo).toBe(true);
    expect(scope.section).toBe('Hello');
    scope.undo();
    expect(scope.section).toBe('');
    expect(scope.canUndo).toBe(false);
  });

  it('should allow a number of redo changes (word by word) and canRedo', function () {
    scope.section = '';
    scope.$apply();
    scope.section = 'Hello';
    scope.$apply();
    scope.section = 'Hello World';
    scope.$apply();
    scope.section = 'Hello World @';
    scope.$apply();
    scope.undo();
    expect(scope.section).toBe('Hello World');
    scope.undo();
    expect(scope.section).toBe('Hello');
    scope.undo();
    expect(scope.section).toBe('');
    scope.redo();
    expect(scope.canRedo).toBe(true);
    expect(scope.section).toBe('Hello');
    scope.redo();
    expect(scope.canRedo).toBe(true);
    expect(scope.section).toBe('Hello World');
    scope.redo();
    expect(scope.canRedo).toBe(false);
  });

  //clearUndo
  it('clearUndo should clear trace of undo actions', function () {
    scope.clearUndo();
    //expect(scope.undoServiceObject.clear).toHaveBeenCalled();
  });
});
