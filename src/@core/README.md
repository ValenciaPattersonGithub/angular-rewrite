# @core Angular module

The '@core' Angular module has a a specific purpose and types of files that should reside in it. Take note of the following charachteristics that define the types of files in Angular that will be under the @core module.

The **@** notation was added to the folder name as a convention to keep it and the @core modules bubbled to the top of the folder structure to represent modules that will commonly cross lines and be used by 2..n modules.

The following types of classes, services, and functionality would be charachteristic of being placed inside the @core module:
- http wrapper functionality
- mock objects common to app testing (alothough consider using a framework like TSMocks instead)
- model objects or .ts.d created files
- state or store functionality (i.e. NgRX or RxJS)