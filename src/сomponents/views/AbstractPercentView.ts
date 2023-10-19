import {
    AbstractView,
    AbstractViewCreationEvents,
    AbstractViewFrontendRequestedSettings,
    AbstractViewProps, CreatableKeys
} from "./AbstractView";

import * as am5percent from "@amcharts/amcharts5/percent"

export interface AbstractPercentViewProps<Events extends AbstractPercentViewCreationEvents, Settings extends AbstractPercentViewSettings> extends AbstractViewProps<Events, Settings> {

}

export interface AbstractPercentViewCreationEvents extends AbstractViewCreationEvents {

}

export interface AbstractPercentViewSettings extends AbstractViewFrontendRequestedSettings {

}

export interface PercentViewCreatableKeys extends CreatableKeys {

}

export abstract class AbstractPercentView<Props extends AbstractPercentViewProps<Events, Settings>,
    Events extends AbstractPercentViewCreationEvents,
    Settings extends AbstractPercentViewSettings> extends AbstractView<Props, Events, Settings> {

    _elements: PercentViewCreatableKeys = {
        ...this["_elements"],
        _chartType: {_factory: am5percent.PercentChart["new"], _source: am5percent.PercentChart},
        _seriesType: {_factory: am5percent.PercentSeries["new"], _source: am5percent.PercentSeries}
    }

    setup() { }

}