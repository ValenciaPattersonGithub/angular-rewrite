describe('overview-controller tests -> ', function () {
  var ctrl, scope, window, timeout;

  beforeEach(module('Soar.Common'));

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $window,
    $timeout
  ) {
    scope = $rootScope.$new();
    timeout = $timeout;
    window = $window;

    scope.$target = angular.element(
      '<div style="height: 100px; width: 200px; position: absolute; top: 10px; left: 20px;"></div>'
    );
    scope.$arrow = angular.element('<div></div>');
    scope.height = 500;
    scope.width = 300;

    ctrl = $controller('OverviewController', {
      $scope: scope,
    });
  }));

  it('should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  it('should set scope properties', function () {
    expect(scope.window).toEqual(window);
    expect(scope.visible).toBe(false);
    expect(scope.canOpen).toBe(true);
    expect(scope.forceHide).toBe(false);
    expect(ctrl.initialized).toBe(false);
    expect(ctrl.arrowPlacement).toBeNull();
    expect(scope.arrowClass).toBeNull();
    expect(ctrl.placement).toEqual({
      Top: 'Top',
      Bottom: 'Bottom',
      Left: 'Left',
      Right: 'Right',
      Center: 'Center',
    });
  });

  describe('resize function -> ', function () {
    it('should call intialization if target has already been initialized', function () {
      spyOn(ctrl, 'initialization');
      ctrl.initialized = true;
      ctrl.resize();

      expect(ctrl.initialization).toHaveBeenCalled();
    });

    it('should not call intialization if target has not been initialized', function () {
      spyOn(ctrl, 'initialization');
      ctrl.initialized = false;
      ctrl.resize();

      expect(ctrl.initialization).not.toHaveBeenCalled();
    });
  });

  describe('$watch window.resize function -> ', function () {
    it('should call ctrl.resize when window resizes', function () {
      spyOn(ctrl, 'resize');
      scope.$apply(function () {
        scope.window.resize = 100;
      });
      timeout.flush();

      expect(ctrl.resize).toHaveBeenCalled();
    });
  });

  describe('initialization function -> ', function () {
    it('should set target properties', function () {
      ctrl.initialization();

      expect(ctrl.target.Height).toEqual(100);
      expect(ctrl.target.Width).toEqual(200);
      expect(ctrl.target.Top).toEqual(-50);
      expect(ctrl.target.Left).toEqual(0);
      expect(ctrl.centeredTop).toEqual(200);
      expect(ctrl.initialized).toBe(true);
    });
  });

  describe('getPosition function -> ', function () {
    it('should set arrowPlacement to Bottom', function () {
      spyOn(ctrl, 'getPlacement').and.callFake(function () {
        return {
          Top: 'Top',
          Left: null,
        };
      });

      ctrl.getPosition();

      expect(ctrl.arrowPlacement).toEqual('Bottom');
    });

    it('should set arrowPlacement to Top', function () {
      spyOn(ctrl, 'getPlacement').and.callFake(function () {
        return {
          Top: 'Bottom',
          Left: null,
        };
      });

      ctrl.getPosition();

      expect(ctrl.arrowPlacement).toEqual('Top');
    });

    it('should set arrowPlacement to null', function () {
      spyOn(ctrl, 'getPlacement').and.callFake(function () {
        return {
          Top: 'TopCenter',
          Left: null,
        };
      });

      ctrl.getPosition();

      expect(ctrl.arrowPlacement).toBeNull();
    });

    it('should set arrowPlacement to RightCenter', function () {
      spyOn(ctrl, 'getPlacement').and.callFake(function () {
        return {
          Top: null,
          Left: 'Left',
        };
      });

      ctrl.getPosition();

      expect(ctrl.arrowPlacement).toEqual('RightCenter');
    });

    it('should set arrowPlacement to LeftCenter', function () {
      spyOn(ctrl, 'getPlacement').and.callFake(function () {
        return {
          Top: null,
          Left: 'Right',
        };
      });

      ctrl.getPosition();

      expect(ctrl.arrowPlacement).toEqual('LeftCenter');
    });

    it('should set arrowPlacement to TopRight', function () {
      spyOn(ctrl, 'getPlacement').and.callFake(function () {
        return {
          Top: 'Bottom',
          Left: 'LeftCenter',
        };
      });

      ctrl.getPosition();

      expect(ctrl.arrowPlacement).toEqual('TopRight');
    });

    it('should set arrowPlacement to BottomRight', function () {
      spyOn(ctrl, 'getPlacement').and.callFake(function () {
        return {
          Top: 'Top',
          Left: 'LeftCenter',
        };
      });

      ctrl.getPosition();

      expect(ctrl.arrowPlacement).toEqual('BottomRight');
    });

    it('should set arrowPlacement to TopLeft', function () {
      spyOn(ctrl, 'getPlacement').and.callFake(function () {
        return {
          Top: 'Bottom',
          Left: 'RightCenter',
        };
      });

      ctrl.getPosition();

      expect(ctrl.arrowPlacement).toEqual('TopLeft');
    });

    it('should set arrowPlacement to BottomLeft', function () {
      spyOn(ctrl, 'getPlacement').and.callFake(function () {
        return {
          Top: 'Top',
          Left: 'RightCenter',
        };
      });

      ctrl.getPosition();

      expect(ctrl.arrowPlacement).toEqual('BottomLeft');
    });
  });

  describe('getPlacement function -> ', function () {
    beforeEach(function () {
      var html = '<div id="content"></div>';
      angular.element(document.body).append(html);
    });

    it('should set leftPlacement as Right and topPlacement as TopCenter', function () {
      // Condition: ctrl.target.Left + ctrl.target.Width + $scope.width) / $window.innerWidth < 0.9
      ctrl.initialization();

      // override top so it's not at 0
      ctrl.target.Top = 300;
      var tLeft = ctrl.target.Left;
      var tWidth = ctrl.target.Width;
      var width = scope.width;

      window.innerWidth = 1920;

      var placement = ctrl.getPlacement();

      expect(placement.Left).toEqual('Right');
      expect(placement.Top).toEqual('TopCenter');
    });

    it('should set leftPlacement as Left and topPlacement as TopCenter', function () {
      // Condition: ctrl.target.Left > $scope.width
      ctrl.target.Left = 600;
      scope.width = 500;

      // set to 0 so we can skip first check
      window.innerWidth = 0;

      var placement = ctrl.getPlacement();

      expect(placement.Left).toEqual('Left');
      expect(placement.Top).toEqual('TopCenter');
    });

    it('should set leftPlacement as RightCenter and topPlacement as TopCenter', function () {
      // Condition: ELSE
      ctrl.target.Left = 0;
      scope.width = 500;

      // set to 0 so we can skip first check
      window.innerWidth = 0;

      var placement = ctrl.getPlacement();

      expect(placement.Left).toEqual('RightCenter');
      expect(placement.Top).toEqual('TopCenter');
    });

    it('should set leftPlacement as Right and topPlacement as TopCenter', function () {
      // Condition: leftPlacement != ctrl.placement.Right + ctrl.placement.Center &&
      //              ctrl.target.Top - ctrl.centeredTop > ctrl.docScroll &&
      //              ctrl.target.Top + ctrl.target.Height + ctrl.centeredTop < $window.innerHeight + ctrl.docScroll

      ctrl.initialization();

      // override top so it's not at 0
      ctrl.target.Top = 300;
      var ct = ctrl.centeredTop;
      var tHeight = ctrl.target.Height;
      var ds = ctrl.docScroll;

      window.innerWidth = 1920;
      window.innerHeight = 1080;

      var placement = ctrl.getPlacement();

      expect(placement.Left).toEqual('Right');
      expect(placement.Top).toEqual('TopCenter');
    });

    it('should set leftPlacement as RightCenter and topPlacement as Top', function () {
      // Condition: ctrl.target.Top + ctrl.target.Height + ctrl.centeredTop > $window.innerHeight + ctrl.docScroll

      ctrl.initialization();

      // override top so it's not at 0
      ctrl.target.Top = 800;
      var ct = ctrl.centeredTop;
      var tHeight = ctrl.target.Height;
      var ds = ctrl.docScroll;

      window.innerWidth = 1920;
      window.innerHeight = 1080;

      var placement = ctrl.getPlacement();

      expect(placement.Left).toEqual('RightCenter');
      expect(placement.Top).toEqual('Top');
    });
  });

  describe('getArrowClass function -> ', function () {
    beforeEach(function () {
      ctrl.initialization();
    });

    it('should return overview-arrow-right when arrowPlacement is RightCenter', function () {
      ctrl.arrowPlacement = 'RightCenter';
      var arrowClass = ctrl.getArrowClass();

      expect(arrowClass).toEqual('overview-arrow-right');
    });

    it('should return overview-arrow-left when arrowPlacement is LeftCenter', function () {
      ctrl.arrowPlacement = 'LeftCenter';
      var arrowClass = ctrl.getArrowClass();

      expect(arrowClass).toEqual('overview-arrow-left');
    });

    it('should return overview-arrow-up when arrowPlacement is TopRight', function () {
      ctrl.arrowPlacement = 'TopRight';
      var arrowClass = ctrl.getArrowClass();

      expect(arrowClass).toEqual('overview-arrow-up');
    });

    it('should return overview-arrow-up when arrowPlacement is TopLeft', function () {
      ctrl.arrowPlacement = 'TopLeft';
      var arrowClass = ctrl.getArrowClass();

      expect(arrowClass).toEqual('overview-arrow-up');
    });

    it('should return overview-arrow-up when arrowPlacement is BottomRight', function () {
      ctrl.arrowPlacement = 'BottomRight';
      var arrowClass = ctrl.getArrowClass();

      expect(arrowClass).toEqual('overview-arrow-down');
    });

    it('should return overview-arrow-up when arrowPlacement is BottomLeft', function () {
      ctrl.arrowPlacement = 'BottomLeft';
      var arrowClass = ctrl.getArrowClass();

      expect(arrowClass).toEqual('overview-arrow-down');
    });

    it('should return null when arrowPlacement is null', function () {
      ctrl.arrowPlacement = null;
      var arrowClass = ctrl.getArrowClass();

      expect(arrowClass).toBeNull();
    });
  });

  describe('getCssProperties function -> ', function () {
    it('should return object of css properties', function () {
      var css = ctrl.getCssProperties();

      expect(css).not.toBeNull();
    });
  });

  describe('applyCss function -> ', function () {
    it('should return css properties with display as block when visible', function () {
      spyOn(ctrl, 'initialization');
      scope.visible = true;
      var css = ctrl.applyCss();

      expect(ctrl.initialization).toHaveBeenCalled();
      expect(css.display).toEqual('block');
    });

    it('should return css properties with display as none when not visible', function () {
      spyOn(ctrl, 'initialization');
      scope.visible = false;
      var css = ctrl.applyCss();

      expect(css.display).toEqual('none');
    });
  });

  describe('$watch overrideOpen function -> ', function () {
    it('should set canOpen to true when overrideOpen is true', function () {
      scope.$apply(function () {
        scope.overrideOpen = true;
      });

      expect(scope.canOpen).toBe(true);
    });

    it('should set canOpen to false when overrideOpen is false', function () {
      scope.$apply(function () {
        scope.overrideOpen = false;
      });

      expect(scope.canOpen).toBe(false);
    });
  });

  describe('$watch overrideClose function -> ', function () {
    it('should set forceHide to true when overrideClose is true', function () {
      scope.$apply(function () {
        scope.overrideClose = true;
      });

      expect(scope.forceHide).toBe(true);
    });

    it('should set canOpen to false when overrideClose is false', function () {
      scope.$apply(function () {
        scope.overrideClose = false;
      });

      expect(scope.forceHide).toBe(false);
    });
  });
});
