import {
    AbstractXYView,
    AbstractXYViewCreationEvents,
    AbstractXYViewFrontendRequestedSettings,
    AbstractXYViewProps,
    XYCreatableKeys
} from "./AbstractXYView";

import * as am5xy from "@amcharts/amcharts5/xy"
import * as am5 from "@amcharts/amcharts5";
import {AbstractViewState} from "./AbstractView";

interface HighlightingViewCreatableKeys extends XYCreatableKeys {
}

export interface HighlightingViewSettings extends AbstractXYViewFrontendRequestedSettings {

}

export interface HighlightingViewEvents extends AbstractXYViewCreationEvents {

}

export interface HighlightingViewProps extends AbstractXYViewProps<HighlightingViewEvents, HighlightingViewSettings> {

}

type Extends<C> = C & {
    xAxisId?: number
    yAxisId?: number
    customTooltip?: object
}

export class HighlightingView extends AbstractXYView<HighlightingViewProps, HighlightingViewEvents, HighlightingViewSettings> {

    _elements: HighlightingViewCreatableKeys = {
        ...this["_elements"],
        _seriesType: {_factory: am5xy.LineSeries["new"], _source: am5xy.LineSeries}
    }

    async onDataChanged() {
        await super.onDataChanged();
        let series: Array<this["_elements"]["_seriesType"]["_source"]> = (this.chart as any).series
        if (series) {
            for (let seriesIdx = 0; seriesIdx < series.length; seriesIdx++) {
                let seriesObj: am5.Series = series.values[seriesIdx];
                if (seriesObj) {
                    seriesObj.data.setAll(this.data)
                }
            }
        }
        let chart = this.chart as InstanceType<this["_elements"]["_chartType"]["_source"]>;
        chart.zoomOut()
    }

    setupSingleSeries(seriesSettings: Extends<InstanceType<this["_elements"]["_seriesType"]["_source"]>["_settings"]>): InstanceType<this["_elements"]["_seriesType"]["_source"]> | undefined {
        let seriesTooltip = (seriesSettings.customTooltip === undefined ? this.instantiateTooltip() : this.instantiate < typeof this["_elements"]["_tooltipType"]["_source"] > (this.root, "_tooltipType", seriesSettings.customTooltip));
        if (seriesSettings.xAxisId === undefined && seriesSettings.yAxisId === undefined) {
            // v1
            //console.log("Creating series as in v1")
            return this.instantiateWithDefaultSettings < typeof this["_elements"]["_seriesType"]["_source"] > (
                this.root,
                    "_seriesType",
                    {
                        xAxis: this.xAxis,
                        yAxis: this.yAxis,
                        tooltip: seriesTooltip
                    },
                    seriesSettings
            )
        } else if (seriesSettings.xAxisId !== undefined && seriesSettings.yAxisId !== undefined) {
            //console.log("Creating series as in v2", seriesSettings)
            return this.createSeries<typeof this["_elements"]["_seriesType"]["_source"]>(seriesSettings.xAxisId, seriesSettings.yAxisId, seriesSettings, seriesSettings.customTooltip)
        } else {
            //console.warn("Undetermined type of axis")
            this.setState({isDataQueryingError: true})
        }
    }

}