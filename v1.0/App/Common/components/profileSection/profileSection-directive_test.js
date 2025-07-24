// ***************************************
// This file is obsolete, has been migrated to Angular and is only here for reference
// Please see src\@shared\components\profile-section\profile-section.component.spec.ts for the new version
// ***************************************
//

// describe('pofileSection directive ->', function () {
// 	var compile, scope, exceptionHandler, compileProvider;

// 	var element, contentElement, linkElement;

// 	beforeEach(module("common.directives"));
//     beforeEach(module("Soar.Common"));
// 	beforeEach(module("soar.templates"));

// 	beforeEach(module(function ($compileProvider) {
// 		compileProvider = $compileProvider;
// 	}));

// 	beforeEach(inject(function ($compile, $rootScope, $exceptionHandler) {
// 		compile = $compile;
// 		exceptionHandler = $exceptionHandler;
// 		scope = $rootScope.$new();
// 	}));

// 	beforeEach(function () {
// 	    scope.actions = [
// 	        {
// 	            Path: '/test/'
// 	        }
// 	    ];
// 		element = compile('<profile-section base-id="testText" title="Test Title" actions="actions" height="123">Transcluded Content</profile-section>')(scope);

// 		scope.$digest();

// 		contentElement = element.find('.profile-section-content');
// 		linkElement = element.find('#testTextLink0');
// 	});

// 	it('should contain a link with an id containing the baseId value', function()
// 	{
// 		expect(linkElement.length).toEqual(1);
// 	});

// 	it('should contain a link with an ng-href value matching the link-path value', function () {
// 		expect(linkElement.attr('ng-href')).toEqual("/test/");
// 	});
// });
