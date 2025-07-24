describe('imageUpload directive ->', function () {
  var element, compile, rootScope, scope, toastrFactory;

  beforeEach(module('common.directives'));
  beforeEach(module('soar.templates'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    compile = $compile;
    rootScope = $rootScope;
    scope = rootScope.$new();
  }));

  it('should inject template when compiled', function () {
    element = angular.element('<image-upload></image-upload>');
    compile(element)(scope);
    rootScope.$digest();
    var input = angular.element('input#imageUpload', element);
    expect(input.length).toBe(1);
  });

  it('should set isolate scope properties', function () {
    element = angular.element(
      '<image-upload preview-container="container" button-text="upload image" max-size="300"></image-upload>'
    );
    compile(element)(scope);
    rootScope.$digest();
    var elementScope = element.isolateScope();
    expect(elementScope.previewContainer).toBe('container');
    expect(elementScope.buttonText).toBe('upload image');
    expect(elementScope.maxSize).toBe('300');
  });

  it('should set file name and initial file size', function () {
    element = angular.element('<image-upload></image-upload>');
    compile(element)(scope);
    rootScope.$digest();
    var elementScope = element.isolateScope();
    elementScope.file = {
      name: '',
      initialSize: '',
    };
    var changeEvent = {
      target: {
        files: [
          {
            name: 'Test.png',
            size: 300,
            type: 'image/png',
          },
        ],
      },
    };
    elementScope.processFile(changeEvent);
    expect(elementScope.file.name).toBe('Test.png');
    expect(elementScope.file.initialSize).toBe(300);
  });

  it('should set validFileType to true for valid file types', function () {
    element = angular.element('<image-upload></image-upload>');
    compile(element)(scope);
    rootScope.$digest();
    var elementScope = element.isolateScope();
    elementScope.file = {
      name: '',
      initialSize: '',
    };
    var changeEvent = {
      target: {
        files: [
          {
            name: 'Test.jpg',
            size: 300,
            type: 'image/jpg',
          },
        ],
      },
    };
    elementScope.processFile(changeEvent);
    expect(elementScope.validFileType).toBe(true);
  });

  it('should set validFileType to false for invalid file types', function () {
    element = angular.element('<image-upload></image-upload>');
    compile(element)(scope);
    rootScope.$digest();
    var elementScope = element.isolateScope();
    elementScope.file = {
      name: '',
      initialSize: '',
    };
    var changeEvent = {
      target: {
        files: [
          {
            name: 'Test.tif',
            size: 300,
            type: 'image/tif',
          },
        ],
      },
    };
    elementScope.processFile(changeEvent);
    expect(elementScope.validFileType).toBe(false);
  });
});
