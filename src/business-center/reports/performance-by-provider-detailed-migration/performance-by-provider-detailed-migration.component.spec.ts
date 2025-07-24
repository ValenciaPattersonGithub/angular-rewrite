import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PerformanceByProviderDetailedMigrationComponent } from './performance-by-provider-detailed-migration.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/@shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

describe('PerformanceByProviderDetailedMigrationComponent', () => {
  let component: PerformanceByProviderDetailedMigrationComponent;
  let fixture: ComponentFixture<PerformanceByProviderDetailedMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerformanceByProviderDetailedMigrationComponent],
      imports: [
        ScrollingModule,
        CommonModule,
        SharedModule,
        TranslateModule,
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceByProviderDetailedMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
