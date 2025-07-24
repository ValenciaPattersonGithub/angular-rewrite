describe('scheduler-services test ->', function () {
  var scheduleServices;

  var mockSaveStates = {
    None: 'None',
    Add: 'Add',
    Update: 'Update',
    Delete: 'Delete',
    Failed: 'Failed',
  };

  beforeEach(function () {
    module(function ($provide) {
      $provide.value('SaveStates', mockSaveStates);
    });
    module('Soar.Schedule');
  });

  beforeEach(inject(function (ScheduleServices) {
    scheduleServices = ScheduleServices;
  }));

  describe('ProviderTime.Calculate is called with Appt Time 1:00-2:00 ->', function () {
    describe('When Adjusting start time to be earlier 12:45-2:00 ->', function () {
      var appointment;

      beforeEach(function () {
        appointment = {
          start: new Date('2015-09-01T12:45:00.000Z'),
          end: new Date('2015-09-01T14:00:00.000Z'),
          StartTime: new Date('2015-09-01T13:00:00.000Z'),
          EndTime: new Date('2015-09-01T14:00:00.000Z'),
        };
      });

      describe('With provider at 1:00-2:00', function () {
        it('should adjust Provider Time to be 12:45-2:00', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:00:00.000Z'),
              EndTime: new Date('2015-09-01T14:00:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            appointment.start.toISOString()
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            appointment.end.toISOString()
          );
        });
      });

      describe('With provider at 1:00-1:30', function () {
        it('should adjust Provider Time to be 12:45-1:30', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:00:00.000Z'),
              EndTime: new Date('2015-09-01T13:30:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            '2015-09-01T12:45:00.000Z'
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            '2015-09-01T13:30:00.000Z'
          );
        });
      });

      describe('With provider at 1:30-2:00', function () {
        it('should adjust Provider Time to be 1:30-2:00', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:30:00.000Z'),
              EndTime: new Date('2015-09-01T14:00:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            '2015-09-01T13:30:00.000Z'
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            '2015-09-01T14:00:00.000Z'
          );
        });
      });

      describe('With provider at 1:15-1:45', function () {
        it('should adjust Provider Time to be 1:15-1:45', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:15:00.000Z'),
              EndTime: new Date('2015-09-01T13:45:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            '2015-09-01T13:15:00.000Z'
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            '2015-09-01T13:45:00.000Z'
          );
        });
      });
    });

    describe('When Adjusting start time to be later 1:30-2:00 ->', function () {
      var appointment;

      beforeEach(function () {
        appointment = {
          start: new Date('2015-09-01T13:30:00.000Z'),
          end: new Date('2015-09-01T14:00:00.000Z'),
          StartTime: new Date('2015-09-01T13:00:00.000Z'),
          EndTime: new Date('2015-09-01T14:00:00.000Z'),
        };
      });

      describe('With provider at 1:00-2:00', function () {
        it('should adjust Provider Time to be 1:30-2:00', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:00:00.000Z'),
              EndTime: new Date('2015-09-01T14:00:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            appointment.start.toISOString()
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            appointment.end.toISOString()
          );
        });
      });

      describe('With provider at 1:00-1:30', function () {
        it('should adjust Provider Time to be 1:30-1:35', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:00:00.000Z'),
              EndTime: new Date('2015-09-01T13:30:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            '2015-09-01T13:30:00.000Z'
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            '2015-09-01T13:35:00.000Z'
          );
        });
      });

      describe('With provider at 1:30-2:00', function () {
        it('should adjust Provider Time to be 1:30-2:00', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:30:00.000Z'),
              EndTime: new Date('2015-09-01T14:00:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            '2015-09-01T13:30:00.000Z'
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            '2015-09-01T14:00:00.000Z'
          );
        });
      });

      describe('With provider at 1:15-1:45', function () {
        it('should adjust Provider Time to be 1:30-1:45', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:15:00.000Z'),
              EndTime: new Date('2015-09-01T13:45:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            '2015-09-01T13:30:00.000Z'
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            '2015-09-01T13:45:00.000Z'
          );
        });
      });
    });

    describe('When Adjusting end time to be earlier 1:00-1:30 ->', function () {
      var appointment;

      beforeEach(function () {
        appointment = {
          start: new Date('2015-09-01T13:00:00.000Z'),
          end: new Date('2015-09-01T13:30:00.000Z'),
          StartTime: new Date('2015-09-01T13:00:00.000Z'),
          EndTime: new Date('2015-09-01T14:00:00.000Z'),
        };
      });

      describe('With provider at 1:00-2:00', function () {
        it('should adjust Provider Time to be 1:00-1:30', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:00:00.000Z'),
              EndTime: new Date('2015-09-01T14:00:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            appointment.start.toISOString()
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            appointment.end.toISOString()
          );
        });
      });

      describe('With provider at 1:00-1:30', function () {
        it('should adjust Provider Time to be 1:00-1:30', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:00:00.000Z'),
              EndTime: new Date('2015-09-01T13:30:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            '2015-09-01T13:00:00.000Z'
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            '2015-09-01T13:30:00.000Z'
          );
        });
      });

      describe('With provider at 1:30-2:00', function () {
        it('should adjust Provider Time to be 1:25-1:30', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:30:00.000Z'),
              EndTime: new Date('2015-09-01T14:00:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            '2015-09-01T13:25:00.000Z'
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            '2015-09-01T13:30:00.000Z'
          );
        });
      });

      describe('With provider at 1:15-1:45', function () {
        it('should adjust Provider Time to be 1:15-1:45', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:15:00.000Z'),
              EndTime: new Date('2015-09-01T13:45:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            '2015-09-01T13:15:00.000Z'
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            '2015-09-01T13:30:00.000Z'
          );
        });
      });
    });

    describe('When Adjusting end time to be earlier 1:00-2:30 ->', function () {
      var appointment;

      beforeEach(function () {
        appointment = {
          start: new Date('2015-09-01T13:00:00.000Z'),
          end: new Date('2015-09-01T14:30:00.000Z'),
          StartTime: new Date('2015-09-01T13:00:00.000Z'),
          EndTime: new Date('2015-09-01T14:00:00.000Z'),
        };
      });

      describe('With provider at 1:00-2:00', function () {
        it('should adjust Provider Time to be 1:00-1:30', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:00:00.000Z'),
              EndTime: new Date('2015-09-01T14:00:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            appointment.start.toISOString()
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            appointment.end.toISOString()
          );
        });
      });

      describe('With provider at 1:00-1:30', function () {
        it('should adjust Provider Time to be 1:00-1:30', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:00:00.000Z'),
              EndTime: new Date('2015-09-01T13:30:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            '2015-09-01T13:00:00.000Z'
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            '2015-09-01T13:30:00.000Z'
          );
        });
      });

      describe('With provider at 1:30-2:00', function () {
        it('should adjust Provider Time to be 1:30-2:30', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:30:00.000Z'),
              EndTime: new Date('2015-09-01T14:00:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            '2015-09-01T13:30:00.000Z'
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            '2015-09-01T14:30:00.000Z'
          );
        });
      });

      describe('With provider at 1:15-1:45', function () {
        it('should adjust Provider Time to be 1:15-1:45', function () {
          appointment.ProviderAppointments = [
            {
              StartTime: new Date('2015-09-01T13:15:00.000Z'),
              EndTime: new Date('2015-09-01T13:45:00.000Z'),
            },
          ];

          scheduleServices.ProviderTime(appointment).Calculate();

          expect(appointment.ProviderAppointments[0].StartTime).toEqual(
            '2015-09-01T13:15:00.000Z'
          );
          expect(appointment.ProviderAppointments[0].EndTime).toEqual(
            '2015-09-01T13:45:00.000Z'
          );
        });
      });
    });
  });
});

//describe('ScheduleViews test ->', function() {
//	describe("ScheduleViews ->", function () {

//		var mockQ = {
//			all: jasmine.createSpy().and.returnValue("some promise"),
//			when: jasmine.createSpy()
//		};

//		var mockFilter = jasmine.createSpy().and.returnValue(jasmine.createSpy());

//		var mockScheduleServices = {
//			Dtos: {
//				LocationHoursOfOperation: {
//					Operations: {
//						Retrieve: jasmine.createSpy()
//					}
//				},
//				ProviderHoursOfOperation: {
//					Operations: {
//						Retrieve: jasmine.createSpy().and.returnValue({
//							$promise: {
//								then: jasmine.createSpy().and.callThrough()
//							}
//						})
//					}
//				}
//			},
//			Lists: {
//				AppointmentTypes: {
//					GetAll: jasmine.createSpy().and.returnValue({
//						$promise: {
//							then: jasmine.createSpy().and.callThrough()
//						}
//					})
//				},
//				TreatmentRooms: {
//					get: jasmine.createSpy().and.returnValue({
//						$promise: {
//							then: jasmine.createSpy().and.callThrough()
//						}
//					})
//				}
//			}
//		};

//		var mockUserServices = {
//			Users: {
//				get: jasmine.createSpy().and.returnValue({
//					$promise: {
//						then: jasmine.createSpy().and.callThrough()
//					}
//				})
//			}
//		};

//		var mockStaticData = {
//			PracticeSettings: jasmine.createSpy().and.returnValue({
//				$promise: {
//					then: jasmine.createSpy().and.callThrough()
//				}
//			})
//		};

//		beforeEach(function() {
//			module(function($provide) {
//				$provide.value('$q', mockQ);

//				//$provide.value('$filter', mockFilter);

//				$provide.value('ScheduleServices', mockScheduleServices);

//				$provide.value('UserServices', mockUserServices);

//				$provide.value('StaticData', mockStaticData);
//			});

//			module('Soar.Schedule');
//		});

//		// inject the service
//		var scheduleViewService;
//		beforeEach(inject(function (ScheduleViews) {
//			scheduleViewService = angular.copy(ScheduleViews);
//		}));

//		it('should exist', function () {
//			expect(scheduleViewService).not.toBeNull();
//		});

//		describe('GetAppointmentEditData ->', function () {
//			var appointment, existingAppointmentEditData;

//			beforeEach(function() {
//				appointment = {};
//				existingAppointmentEditData = { };
//			});

//			it('when existingAppointmentEditData.location is null, should call scheduleServices.Dtos.LocationHoursOfOperation.Operations.Retrieve', function () {
//				appointment = {
//					Location: {
//						LocationId: "Z"
//					}
//				};

//				existingAppointmentEditData = {};
//				scheduleViewService.Appointments.GetAppointmentEditData(appointment, existingAppointmentEditData);

//				expect(mockScheduleServices.Dtos.LocationHoursOfOperation.Operations.Retrieve).toHaveBeenCalled();
//				expect(existingAppointmentEditData.location.id).toEqual("Z");
//			});
//		});
//	});
//});
