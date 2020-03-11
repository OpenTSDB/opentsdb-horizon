/** Angular items */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/** Other modules */
import { MaterialModule } from '../material/material.module';
import { DygraphsModule } from '../dygraphs/dygraphs.module';
import { ChartjsModule } from '../chartjs/chartjs.module';
import { DateTimePickerModule } from '../date-time-picker/date-time-picker.module';
import { ColorPickerModule } from '../color-picker/color-picker.module';

/** public items from Sharedcomponents */

 // other components
 // tslint:disable:max-line-length
import { ThemePickerComponent } from './components/theme-picker/theme-picker.component';
import { InlineEditableComponent } from './components/inline-editable/inline-editable.component';

 // widget config components
import { WidgetConfigAxesComponent } from './components/widget-config-axes/widget-config-axes.component';
import { WidgetConfigGeneralComponent } from './components/widget-config-general/widget-config-general.component';
import { WidgetConfigMetricQueriesComponent } from './components/widget-config-metric-queries/widget-config-metric-queries.component';
import { WidgetConfigTimeComponent } from './components/widget-config-time/widget-config-time.component';
import { WidgetConfigVisualAppearanceComponent } from './components/widget-config-visual-appearance/widget-config-visual-appearance.component';
import { WidgetConfigQueryInspectorComponent } from './components/widget-config-query-inspector/widget-config-query-inspector.component';
import { WidgetConfigLegendComponent } from './components/widget-config-legend/widget-config-legend.component';
import { DropdownLineWeightComponent } from './components/dropdown-line-weight/dropdown-line-weight.component';
import { DropdownLineTypeComponent } from './components/dropdown-line-type/dropdown-line-type.component';
import { DropdownVisualTypeComponent } from './components/dropdown-visual-type/dropdown-visual-type.component';
import { NavbarTimezoneToggleComponent } from './components/navbar-timezone-toggle/navbar-timezone-toggle.component';
import { DropdownUnitTypeComponent } from './components/dropdown-unit-type/dropdown-unit-type.component';
import { GenericMessageBarComponent } from './components/generic-message-bar/generic-message-bar.component';
import { SimpleDashboardListComponent } from './components/simple-dashboard-list/simple-dashboard-list.component';
import { NamespaceAutocompleteComponent } from './components/namespace-autocomplete/namespace-autocomplete.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { DebugDialogComponent } from './components/debug-dialog/debug-dialog.component';
import { TagAggregatorComponent } from './components/tag-aggregator/tag-aggregator.component';
import { WidgetConfigSortingComponent } from './components/widget-config-sorting/widget-config-sorting.component';
import { ConditionalFormatterComponent } from './components/conditional-formatter/conditional-formatter.component';
import { QueryEditorProtoComponent } from './components/query-editor-proto/query-editor-proto.component';
import { InlineFilterEditorComponent } from './components/inline-filter-editor/inline-filter-editor.component';
import { MetricAutocompleteComponent } from './components/metric-autocomplete/metric-autocomplete.component';
import { DropdownMetricTagsComponent } from './components/dropdown-metric-tags/dropdown-metric-tags.component';
import { MetricFunctionComponent } from './components/metric-function/metric-function.component';
import { EventTimelineComponent } from './components/event-timeline/event-timeline.component';
import { WidgetConfigEventsComponent } from './components/widget-config-events/widget-config-events.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { WidgetConfigMultigraphComponent } from './components/widget-config-multigraph/widget-config-multigraph.component';
import { TimeSelectorComponent } from './components/time-selector/time-selector.component';
import { GraphTypeComponent } from './components/graph-type/graph-type.component';
import { AuraDialogComponent } from './components/aura-dialog/aura-dialog.component';
import { InfoTooltipComponent } from './components/info-tooltip/info-tooltip.component';
import { FormatAutoManualFilterPipe } from '../../../core/services/automanual.pipe';
import { MetricVisualPanelComponent } from './components/metric-visual-panel/metric-visual-panel.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        DygraphsModule,
        ChartjsModule,
        DateTimePickerModule,
        ColorPickerModule
    ],
    declarations: [
        ThemePickerComponent,
        WidgetConfigAxesComponent,
        WidgetConfigGeneralComponent,
        WidgetConfigLegendComponent,
        WidgetConfigMetricQueriesComponent,
        WidgetConfigQueryInspectorComponent,
        WidgetConfigTimeComponent,
        WidgetConfigVisualAppearanceComponent,
        InlineEditableComponent,
        DropdownLineWeightComponent,
        DropdownLineTypeComponent,
        DropdownVisualTypeComponent,
        NavbarTimezoneToggleComponent,
        DropdownUnitTypeComponent,
        GenericMessageBarComponent,
        SimpleDashboardListComponent,
        NamespaceAutocompleteComponent,
        ErrorDialogComponent,
        DebugDialogComponent,
        TagAggregatorComponent,
        WidgetConfigSortingComponent,
        ConditionalFormatterComponent,
        QueryEditorProtoComponent,
        InlineFilterEditorComponent,
        MetricAutocompleteComponent,
        DropdownMetricTagsComponent,
        MetricFunctionComponent,
        EventTimelineComponent,
        WidgetConfigEventsComponent,
        EventListComponent,
        WidgetConfigMultigraphComponent,
        TimeSelectorComponent,
        GraphTypeComponent,
        AuraDialogComponent,
        InfoTooltipComponent,
        FormatAutoManualFilterPipe,
        MetricVisualPanelComponent
    ],
    exports: [
        ThemePickerComponent,
        WidgetConfigAxesComponent,
        WidgetConfigGeneralComponent,
        WidgetConfigLegendComponent,
        WidgetConfigMetricQueriesComponent,
        WidgetConfigQueryInspectorComponent,
        WidgetConfigTimeComponent,
        WidgetConfigVisualAppearanceComponent,
        DateTimePickerModule,
        ColorPickerModule,
        InlineEditableComponent,
        NamespaceAutocompleteComponent,
        DropdownLineWeightComponent,
        DropdownUnitTypeComponent,
        NavbarTimezoneToggleComponent,
        DropdownMetricTagsComponent,
        GenericMessageBarComponent,
        SimpleDashboardListComponent,
        InlineFilterEditorComponent,
        WidgetConfigSortingComponent,
        ConditionalFormatterComponent,
        QueryEditorProtoComponent,
        MetricAutocompleteComponent,
        DropdownMetricTagsComponent,
        MetricFunctionComponent,
        EventTimelineComponent,
        WidgetConfigEventsComponent,
        EventListComponent,
        WidgetConfigMultigraphComponent,
        TimeSelectorComponent,
        GraphTypeComponent,
        InfoTooltipComponent
    ],
    entryComponents: [
        InlineFilterEditorComponent,
        MetricAutocompleteComponent,
        ErrorDialogComponent,
        AuraDialogComponent,
        DebugDialogComponent
    ],
})
export class SharedcomponentsModule { }
