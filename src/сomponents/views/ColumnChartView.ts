import * as am5xy from "@amcharts/amcharts5/xy"
import {
    AbstractXYView,
    AbstractXYViewCreationEvents,
    AbstractXYViewFrontendRequestedSettings,
    AbstractXYViewProps,
    XYCreatableKeys
} from "./AbstractXYView";

interface ColumnChartCreatableKeys extends XYCreatableKeys {
}

export interface ColumnChartViewCreationEvents extends AbstractXYViewCreationEvents {
}

interface ColumnChartViewFrontendRequestedSettings extends AbstractXYViewFrontendRequestedSettings {
}

interface ColumnChartViewProps extends AbstractXYViewProps<ColumnChartViewCreationEvents, ColumnChartViewFrontendRequestedSettings> {
}

type Extends<C> = C & {
    xAxisId?: number
    yAxisId?: number
    customTooltip?: object
}

export class ColumnChartView extends AbstractXYView<ColumnChartViewProps, ColumnChartViewCreationEvents, ColumnChartViewFrontendRequestedSettings> {

    _elements: ColumnChartCreatableKeys = {
        ...this["_elements"],
        _seriesType: {_factory: am5xy.ColumnSeries["new"], _source: am5xy.ColumnSeries}
    }

    setupSingleSeries(seriesSettings: Extends<InstanceType<this["_elements"]["_seriesType"]["_source"]>["_settings"]>): InstanceType<this["_elements"]["_seriesType"]["_source"]> | undefined {
        let seriesTooltip = (seriesSettings.customTooltip === undefined ? this.instantiateTooltip() : this.instantiate<typeof this["_elements"]["_tooltipType"]["_source"]>(this.root, "_tooltipType", seriesSettings.customTooltip));
        if (seriesSettings.xAxisId === undefined && seriesSettings.yAxisId === undefined) {
            // v1
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