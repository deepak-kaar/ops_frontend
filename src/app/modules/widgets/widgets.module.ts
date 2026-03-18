import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetsComponent } from './widgets.component';
import { InputTextComponent } from './components/input-text/input-text.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { LabelComponent } from './components/label/label.component';
import { ParagraphComponent } from './components/paragraph/paragraph.component';
import { TextAreaComponent } from './components/text-area/text-area.component';
import { MultiSelectComponent } from './components/multi-select/multi-select.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { GridstackComponent, GridstackModule } from 'gridstack/dist/angular';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { RadioButtonComponent } from './components/radio-button/radio-button.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ButtonComponent } from './components/buttons/button/button.component';
import { IconButtonComponent } from './components/buttons/icon-button/icon-button.component';
import { ButtonGroupComponent } from './components/buttons/button-group/button-group.component';
import { StaticTableComponent } from './components/tables/static-table/static-table.component';
import { DynamicTableComponent } from './components/tables/dynamic-table/dynamic-table.component';
import { PieChartComponent } from './components/charts/pie-chart/pie-chart.component';
import { DonutComponent } from './components/charts/donut/donut.component';
import { PolarAreaComponent } from './components/charts/polar-area/polar-area.component';
import { RadarComponent } from './components/charts/radar/radar.component';
import { HorizontalBarComponent } from './components/charts/horizontal-bar/horizontal-bar.component';
import { ShBarComponent } from './components/charts/sh-bar/sh-bar.component';
import { SvBarComponent } from './components/charts/sv-bar/sv-bar.component';
import { LineComponent } from './components/charts/line/line.component';
import { BarChartComponent } from './components/charts/bar-chart/bar-chart.component';
import { ImageComponent } from './components/assets/image/image.component';
import { VideoComponent } from './components/assets/video/video.component';
import { MapComponent } from './components/others/map/map.component';
import { DateTagComponent } from './components/others/date-tag/date-tag.component';
import { LocationTagComponent } from './components/others/location-tag/location-tag.component';
import { TagComponent } from './components/others/tag/tag.component';
import { SpacerComponent } from './components/others/spacer/spacer.component';
import { SectionComponent } from './components/section/section.component';
import { DividerComponent } from './components/divider/divider.component';
import { SpeedGuageComponent } from './components/speed-guage/speed-guage.component';
import { SpeedGuage1Component } from './components/speed-guage1/speed-guage1.component';
import { ApexsplineComponent } from './components/charts/apexspline/apexspline.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { RatingComponent } from './components/rating/rating.component';
import { InputNumberComponent } from './components/input-number/input-number.component';
import { InputOtpComponent } from './components/input-otp/input-otp.component';
import { KnobComponent } from './components/knob/knob.component';
import { PrimengMultiselectComponent } from './components/primeng-multiselect/primeng-multiselect.component';
import { TreeSelectComponent } from './components/tree-select/tree-select.component';
import { ToggleSwitchComponent } from './components/toggle-switch/toggle-switch.component';
import { ToggleButtonComponent } from './components/toggle-button/toggle-button.component';



@NgModule({
  declarations: [
    WidgetsComponent,
    InputTextComponent,
    DropdownComponent,
    LabelComponent,
    ParagraphComponent,
    TextAreaComponent,
    MultiSelectComponent,
    CheckboxComponent,
    DatePickerComponent,
    RadioButtonComponent,
    FileUploadComponent,
    ButtonComponent,
    IconButtonComponent,
    ButtonGroupComponent,
    StaticTableComponent,
    DynamicTableComponent,
    PieChartComponent,
    DonutComponent,
    PolarAreaComponent,
    RadarComponent,
    HorizontalBarComponent,
    ShBarComponent,
    SvBarComponent,
    LineComponent,
    BarChartComponent,
    ImageComponent,
    VideoComponent,
    MapComponent,
    DateTagComponent,
    LocationTagComponent,
    TagComponent,
    SpacerComponent,
    SectionComponent,
    DividerComponent,
    SpeedGuageComponent,
    SpeedGuage1Component,
    ApexsplineComponent,
    ProgressBarComponent,
    RatingComponent,
    InputNumberComponent,
    InputOtpComponent,
    KnobComponent,
    PrimengMultiselectComponent,
    TreeSelectComponent,
    ToggleSwitchComponent,
    ToggleButtonComponent,
  ],
  imports: [
    CommonModule,
    PrimeNgModules,
    GridstackModule
  ],
  exports: [
    InputTextComponent,
    DropdownComponent,
    LabelComponent,
    ParagraphComponent,
    TextAreaComponent,
    MultiSelectComponent,
    CheckboxComponent,
    DatePickerComponent,
    RadioButtonComponent,
    FileUploadComponent,
    ButtonComponent,
    IconButtonComponent,
    ButtonGroupComponent,
    StaticTableComponent,
    DynamicTableComponent,
    PieChartComponent,
    DonutComponent,
    PolarAreaComponent,
    RadarComponent,
    HorizontalBarComponent,
    ShBarComponent,
    SvBarComponent,
    LineComponent,
    BarChartComponent,
    ImageComponent,
    VideoComponent,
    MapComponent,
    DateTagComponent,
    LocationTagComponent,
    TagComponent,
    SpacerComponent,
    SectionComponent,
    DividerComponent,
    SpeedGuageComponent,
    ApexsplineComponent,
    ProgressBarComponent,
    RatingComponent,
    InputNumberComponent,
    InputOtpComponent,
    KnobComponent,
    PrimengMultiselectComponent,
    TreeSelectComponent,
    ToggleSwitchComponent,
    ToggleButtonComponent,
  ]
})
export class WidgetsModule {
  constructor() {
    GridstackComponent.addComponentToSelectorType([
      InputTextComponent,
      DropdownComponent,
      LabelComponent,
      ParagraphComponent,
      TextAreaComponent,
      DatePickerComponent,
      CheckboxComponent,
      RadioButtonComponent,
      FileUploadComponent,
      ButtonComponent,
      IconButtonComponent,
      DynamicTableComponent,
      PieChartComponent,
      DonutComponent,
      PolarAreaComponent,
      RadarComponent,
      HorizontalBarComponent,
      ShBarComponent,
      SvBarComponent,
      LineComponent,
      BarChartComponent,
      ImageComponent,
      VideoComponent,
      MapComponent,
      TagComponent,
      DateTagComponent,
      LocationTagComponent,
      SpacerComponent,
      DividerComponent,
      SpeedGuageComponent,
      ApexsplineComponent
    ])
  }
}
