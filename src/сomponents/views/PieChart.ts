import {
    AbstractPercentView,
    AbstractPercentViewCreationEvents,
    AbstractPercentViewProps,
    AbstractPercentViewSettings,
    PercentViewCreatableKeys
} from "./AbstractPercentView";

import * as am5percent from "@amcharts/amcharts5/percent"

export interface PieChartSettings extends AbstractPercentViewSettings {

}

export interface PieChartCreationEvents extends AbstractPercentViewCreationEvents {

}

export interface PieChartProps extends AbstractPercentViewProps<PieChartCreationEvents, PieChartSettings> {

}

interface PieChartCreatableKeys extends PercentViewCreatableKeys {

}

export class PieChart extends AbstractPercentView<PieChartProps, PieChartCreationEvents, PieChartSettings> {

    _elements: PieChartCreatableKeys = {
        ...this["_elements"],
        _chartType: {_factory: am5percent.PieChart["new"], _source: am5percent.PieChart},
        _seriesType: {_factory: am5percent.PieSeries["new"], _source: am5percent.PieSeries}
    }

    setupSingleSeries(seriesSettings: InstanceType<this["_elements"]["_seriesType"]["_source"]>["_settings"]): InstanceType<this["_elements"]["_seriesType"]["_source"]> {
        let seriesTooltip = this.instantiateTooltip()
        return this.instantiateWithDefaultSettings(
            this.root,
            "_seriesType",
            {
                tooltip: seriesTooltip
            },
            seriesSettings
        )
    }

}