import {AbstractXYViewFrontendRequestedSettings} from "./AbstractXYView";
import {AbstractView, AbstractViewCreationEvents, AbstractViewProps} from "./AbstractView";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy"

export interface TreemapViewSettings extends AbstractXYViewFrontendRequestedSettings {

}

export interface TreemapViewCreationEvents extends AbstractViewCreationEvents {

}

export interface TreemapViewProps extends AbstractViewProps<TreemapViewCreationEvents, TreemapViewSettings> {

}

export class TreemapView extends AbstractView<TreemapViewProps, TreemapViewCreationEvents, TreemapViewSettings> {

    _elements = {
        ...this["_elements"],
        _seriesType: {_factory: am5hierarchy.Treemap["new"], _source: am5hierarchy.Treemap}
    }

    setup() {
    }

    setupSingleSeries(seriesSettings: InstanceType<this["_elements"]["_seriesType"]["_source"]>["_settings"]): InstanceType<this["_elements"]["_seriesType"]["_source"]> {
        let seriesTooltip = this.instantiateTooltip()
        return  this.instantiateWithDefaultSettings(
            this.root,
            "_seriesType",
            {
                tooltip: seriesTooltip
            },
            this.props.settings?.seriesSettings
        )
    }

}