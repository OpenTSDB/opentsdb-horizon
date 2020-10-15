import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule } from '@angular/material';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialModule } from '../material/material.module';

import { EMPTY_COLOR } from './color-picker';

// services
import { ColorPickerService } from './services/color-picker.service';
import { ColorService } from './services/color.service';

// components
import { ColorPickerComponent } from './containers/color-picker/color-picker.component';
import { ColorPickerSelectorComponent } from './components/color-picker-selector/color-picker-selector.component';
import { ColorPickerHueSliderComponent } from './components/color-picker-hue-slider/color-picker-hue-slider.component';
import { ColorPickerHsvSelectorComponent } from './components/color-picker-hsv-selector/color-picker-hsv-selector.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OverlayModule,
    PortalModule,
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  declarations: [
    ColorPickerComponent,
    ColorPickerSelectorComponent,
    ColorPickerHueSliderComponent,
    ColorPickerHsvSelectorComponent
  ],
  exports: [
    ColorPickerComponent
  ],
  providers: [ColorPickerService, ColorService, { provide: EMPTY_COLOR, useValue: 'none' }],
})

export class ColorPickerModule { }
