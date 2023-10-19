import * as am5xy from "@amcharts/amcharts5/xy"
import {CreationHandler} from "./interfaces/EventHandlers";
import {
    AbstractView,
    AbstractViewCreationEvents,
    AbstractViewFrontendRequestedSettings,
    AbstractViewProps,
    CreatableInfo,
    CreatableKeys,
    libs,
} from "./AbstractView";
import {AbstractXYCreationEvents} from "./interfaces/ViewEvents";

type AnyAxes =
    typeof am5xy.CategoryAxis
    | typeof am5xy.ValueAxis
    | typeof am5xy.DateAxis
    | typeof am5xy.CategoryDateAxis
    | typeof am5xy.GaplessDateAxis
    | typeof am5xy.DurationAxis

export type AbstractXYViewOperatable = AnyAxes & typeof am5xy.XYCursor | typeof am5xy.XYChart | typeof am5xy.XYSeries

interface AxisCreated {
    id: number,
    axis: InstanceType<AnyAxes>
}

type axisViewType =
    "CATEGORY_AXIS"
    | "DATE_AXIS"
    | "DURATION_AXIS"
    | "GAPLESS_DATE_AXIS"
    | "VALUE_AXIS"
    | "CATEGORY_DATE_AXIS"

export interface AbstractXYViewCreationEvents extends AbstractViewCreationEvents {
    cursor?: CreationHandler<am5xy.XYCursor>

    xAxisRenderer?: CreationHandler<am5xy.AxisRendererX | am5xy.AxisRenderer>
    xAxis?: CreationHandler<AnyAxes>

    yAxisRenderer?: CreationHandler<am5xy.AxisRenderer | am5xy.AxisRendererY>
    yAxis?: CreationHandler<AnyAxes>
}

interface AbstractXYViewFrontendRequestedSettingsV1 {
    // XAxis configuration
    xAxesTooltip?: object
    xRendererSettings?: object
    xAxisSettings?: object
    xAxisType?: string

    // YAxis Configuration
    yAxesTooltip?: object
    yRendererSettings?: object
    yAxisSettings?: object
    yAxisType?: string
}

interface AxisDefinition {
    id: number
    type: "xAxis" | "yAxis"
    viewType: axisViewType
    settings?: object
    renderer?: object
    tooltip?: object
    axisDataExtractor?: string
    syncWithAxisById?: number
}

interface AbstractXYViewFrontendRequestedSettingsV2 {
    axis?: Array<AxisDefinition> | AxisDefinition
}

export interface AbstractXYViewFrontendRequestedSettings extends AbstractViewFrontendRequestedSettings, AbstractXYViewFrontendRequestedSettingsV1, AbstractXYViewFrontendRequestedSettingsV2 {
    cursorSettings?: object
}

export interface AbstractXYViewProps<E extends AbstractXYViewCreationEvents, S extends AbstractXYViewFrontendRequestedSettings> extends AbstractViewProps<E, S> {
}

export interface XYCreatableKeys extends CreatableKeys {
    _chartType: CreatableInfo<typeof am5xy.XYChart>
    _seriesType: CreatableInfo<typeof am5xy.XYSeries>
    _cursorType: CreatableInfo<typeof am5xy.XYCursor>
    _xAxisRendererType: CreatableInfo<typeof am5xy.AxisRendererX>
    _xAxisType: CreatableInfo<AnyAxes>
    _yAxisRendererType: CreatableInfo<typeof am5xy.AxisRendererY>
    _yAxisType: CreatableInfo<AnyAxes>
}

export abstract class AbstractXYView<Props extends AbstractXYViewProps<Events, Settings>,
    Events extends AbstractXYViewCreationEvents,
    Settings extends AbstractXYViewFrontendRequestedSettings> extends AbstractView<Props, Events, Settings> {

    _elements: XYCreatableKeys = {
        ...this["_elements"],
        _chartType: {_source: am5xy.XYChart, _factory: am5xy.XYChart["new"]},
        _seriesType: {_source: am5xy.XYSeries, _factory: am5xy.XYSeries["new"]},
        _cursorType: {_source: am5xy.XYCursor, _factory: am5xy.XYCursor["new"]},
        _xAxisRendererType: {_source: am5xy.AxisRendererX, _factory: am5xy.AxisRendererX["new"]},
        _xAxisType: {_source: am5xy.ValueAxis, _factory: am5xy.ValueAxis["new"]},
        _yAxisRendererType: {_source: am5xy.AxisRendererY, _factory: am5xy.AxisRendererY["new"]},
        _yAxisType: {_source: am5xy.CategoryAxis, _factory: am5xy.CategoryAxis["new"]}
    }

    _link = AbstractXYCreationEvents

    public cursor?: am5xy.XYCursor

    public xTooltip?: InstanceType<this["_elements"]["_tooltipType"]["_source"]>
    public xRenderer!: am5xy.AxisRendererX
    public xAxis!: am5xy.Axis<any>

    public yTooltip?: InstanceType<this["_elements"]["_tooltipType"]["_source"]>
    public yRenderer!: am5xy.AxisRendererY
    public yAxis!: am5xy.Axis<any>

    public axis: Map<number, am5xy.Axis<any>> = new Map<number, am5xy.Axis<any>>()

    constructor(props: Props) {
        super(props);


        // Setup xAxisType and yAxisType
        this._elements["_xAxisType"] = this.determineAxisType("_xAxisType", this.props.settings?.xAxisType)
        this._elements["_yAxisType"] = this.determineAxisType("_yAxisType", this.props.settings?.yAxisType)
    }

    async onDataChanged() {
        await super.onDataChanged()
        if (this.root) {
            this.axis = new Map<number, am5xy.Axis<any>>();
        }
        let version = this.checkVersion()
        switch (version) {
            case "1":
                if (this.props.settings?.xAxisType !== "VALUE_AXIS") {
                    this.xAxis.data.setAll(this.data);
                } else if (this.props.settings?.yAxisType !== "VALUE_AXIS") {
                    this.yAxis.data.setAll(this.data);
                } else {
                    console.warn("No value axis in v1 method!")
                    this.setState({isDataQueryingError: true});
                }
                break;
            case "2":
                this.axis.forEach(
                    (val, key) => {
                        if (this.props.settings?.axis) {
                            if (this.props.settings.axis instanceof Array) {
                                for (let creationSettings of this.props.settings.axis) {
                                    if (val.data && val.data.length > 0 && key === creationSettings.id) {
                                        if (creationSettings.viewType !== "VALUE_AXIS") {
                                            if (creationSettings.axisDataExtractor) {
                                                // eslint-disable-next-line no-eval
                                                let xAxisData = eval(creationSettings.axisDataExtractor)(this.data, libs)
                                                //console.log(xAxisData)
                                                val.data.setAll(xAxisData)
                                            } else {
                                                val.data.setAll(this.data)
                                            }
                                            (val as any).set("syncWithAxis", this.axis.get(creationSettings.syncWithAxisById || -1));
                                        }
                                    }
                                }
                            }
                        }
                    }
                )
                break;
        }
    }

    createAxis<V extends am5xy.XYChart>(creationSettings: AxisDefinition, chart: V): AxisCreated {
        //console.log(creationSettings)
        switch (creationSettings.type) {
            case "xAxis":
                let xRenderer = this.instantiate<typeof am5xy.AxisRendererX>(this.root, "_xAxisRendererType", creationSettings.renderer)
                let xTooltip = creationSettings.tooltip ? this.instantiate < typeof this["_elements"]["_tooltipType"]["_source"] > (this.root, "_tooltipType", creationSettings.tooltip) : undefined
                let xAxisCreatableInfo = this.determineAxisType("_xAxisType", creationSettings.viewType)
                let xAxis = chart.xAxes.push(this.createByInfo<typeof xAxisCreatableInfo["_source"]>(
                    xAxisCreatableInfo,
                    this.root,
                    {
                        ...creationSettings.settings,
                        renderer: xRenderer,
                        tooltip: xTooltip
                    },
                    "_xAxisType"
                ))
                if (creationSettings.viewType !== "VALUE_AXIS") {
                    if (creationSettings.axisDataExtractor) {
                        // eslint-disable-next-line no-eval
                        let xAxisData = eval(creationSettings.axisDataExtractor)(this.data, libs)
                        //console.log(xAxisData)
                        xAxis.data.setAll(xAxisData)
                    } else {
                        xAxis.data.setAll(this.data)
                    }
                }
                return {
                    id: creationSettings.id,
                    axis: xAxis
                }
            case "yAxis":
                let yRenderer = this.instantiate<typeof am5xy.AxisRendererY>(this.root, "_yAxisRendererType", creationSettings.renderer)
                let yTooltip = creationSettings.tooltip ? this.instantiate < typeof this["_elements"]["_tooltipType"]["_source"] > (this.root, "_tooltipType", creationSettings.tooltip) : undefined
                let yAxisCreatableInfo = this.determineAxisType("_xAxisType", creationSettings.viewType)
                let yAxis = chart.yAxes.push(this.createByInfo<typeof yAxisCreatableInfo["_source"]>(
                    yAxisCreatableInfo,
                    this.root,
                    {
                        ...creationSettings.settings,
                        renderer: yRenderer,
                        tooltip: yTooltip
                    },
                    "_xAxisType"
                ))
                if (creationSettings.viewType !== "VALUE_AXIS") {
                    if (creationSettings.axisDataExtractor) {
                        // eslint-disable-next-line no-eval
                        let yAxisData = eval(creationSettings.axisDataExtractor)(this.data, libs)
                        //console.log(yAxisData)
                        yAxis.data.setAll(yAxisData)
                    } else {
                        yAxis.data.setAll(this.data)
                    }
                }
                return {
                    id: creationSettings.id,
                    axis: yAxis
                }
        }
    }

    createSeries<V extends typeof am5xy.XYSeries>(xAxis: number, yAxis: number, settings?: object, tooltip?: object): InstanceType<V> {
        return this.instantiateWithDefaultSettings<V>(
            this.root,
            "_seriesType",
            {
                xAxis: this.axis.get(xAxis) as any,
                yAxis: this.axis.get(yAxis) as any,
                tooltip: (tooltip ? this.instantiate < typeof this["_elements"]["_tooltipType"]["_source"] > (this.root, "_tooltipType", tooltip) : undefined)
            },
            settings
        )
    }

    /*
    * Back compatibility
    * v1 could only display 1 xAxis and 1 yAxis
    * */
    setupV1<V extends am5xy.XYChart>(chart: V) {
        this.xTooltip = this.props.settings?.xAxesTooltip ? this.instantiate(this.root, "_tooltipType", this.props.settings.xAxesTooltip) : undefined;

        this.xRenderer = this.instantiate<typeof am5xy.AxisRendererX>(this.root, "_xAxisRendererType", this.props.settings?.xRendererSettings)
        this.xAxis = this.instantiateWithDefaultSettings < typeof this["_elements"]["_xAxisType"]["_source"] > (
            this.root,
                "_xAxisType",
                {
                    renderer: this.xRenderer,
                    tooltip: this.xTooltip
                },
                this.props.settings?.xAxisSettings
        );

        this.xAxis = chart.xAxes.push(this.xAxis)

        this.yTooltip = this.props.settings?.yAxesTooltip ? this.instantiate(this.root, "_tooltipType", this.props.settings.yAxesTooltip) : undefined;
        this.yRenderer = this.instantiate < typeof this["_elements"]["_yAxisRendererType"]["_source"] > (this.root, "_yAxisRendererType", this.props.settings?.yRendererSettings)
        this.yAxis = this.instantiateWithDefaultSettings < typeof this["_elements"]["_yAxisType"]["_source"] > (
            this.root,
                "_yAxisType",
                {
                    renderer: this.yRenderer,
                    tooltip: this.yTooltip
                },
                this.props.settings?.yAxisSettings
        )

        this.yAxis = chart.yAxes.push(this.yAxis)

        if (this.props.settings?.xAxisType !== "VALUE_AXIS") {
            this.xAxis.data.setAll(this.data);
        } else if (this.props.settings?.yAxisType !== "VALUE_AXIS") {
            this.yAxis.data.setAll(this.data);
        } else {
            console.warn("No value axis in v1 method!")
            this.setState({isDataQueryingError: true});
        }
    }

    setupV2<V extends am5xy.XYChart>(chart: V) {
        if (this.props.settings?.axis) {
            //console.warn("Test mode!")
            if (this.props.settings.axis instanceof Array) {
                for (let axis of this.props.settings.axis) {
                    let createdAxis = this.createAxis(axis, chart)
                    this.axis.set(createdAxis.id, createdAxis.axis);
                    (createdAxis.axis as any).set("syncWithAxis", this.axis.get(axis.syncWithAxisById || -1));
                }
            } else {
                console.error("Not enough axis")
                this.setState(
                    {
                        isDataQueryingError: true
                    }
                )
            }
        } else {
            console.error("Wrong type v2 configuration")
            this.setState(
                {
                    isDataQueryingError: true
                }
            )
        }
    }

    setup() {
        if (this.chart instanceof am5xy.XYChart) {
            this.cursor = this.props.settings?.cursorSettings ? this.instantiate<typeof am5xy.XYCursor>(this.root, "_cursorType", this.props.settings.cursorSettings) : undefined;

            this.cursor = this.chart.set("cursor", this.cursor)
            let version = this.checkVersion()
            switch (version) {
                case "1":
                    this.setupV1(this.chart)
                    break;
                case "2":
                    this.setupV2(this.chart)
                    break;
            }
        }
    }

    private determineAxisType(modifiable: "_xAxisType" | "_yAxisType", type?: string): CreatableInfo<AnyAxes> {
        if (type) {
            switch (type) {
                case "CATEGORY_AXIS":
                    return {
                        _source: am5xy.CategoryAxis,
                        _factory: am5xy.CategoryAxis["new"]
                    }
                case "DATE_AXIS":
                    return {
                        _source: am5xy.DateAxis,
                        _factory: am5xy.DateAxis["new"]
                    }
                case "DURATION_AXIS":
                    return {
                        _source: am5xy.DurationAxis,
                        _factory: am5xy.DurationAxis["new"]
                    }
                case "GAPLESS_DATE_AXIS":
                    return {
                        _source: am5xy.GaplessDateAxis,
                        _factory: am5xy.GaplessDateAxis["new"]
                    }
                case "VALUE_AXIS":
                    return {
                        _source: am5xy.ValueAxis,
                        _factory: am5xy.ValueAxis["new"]
                    }
                case "CATEGORY_DATE_AXIS":
                    return {
                        _source: am5xy.CategoryDateAxis,
                        _factory: am5xy.CategoryDateAxis["new"]
                    }
                default:
                    console.error("Type was empty!")
                    if (modifiable === "_xAxisType") {
                        return {
                            _source: am5xy.CategoryAxis,
                            _factory: am5xy.CategoryAxis["new"]
                        }
                    } else {
                        return {
                            _source: am5xy.ValueAxis,
                            _factory: am5xy.ValueAxis["new"]
                        }
                    }
            }
        } else {
            if (modifiable === "_xAxisType") {
                return {
                    _source: am5xy.CategoryAxis,
                    _factory: am5xy.CategoryAxis["new"]
                }
            } else {
                return {
                    _source: am5xy.ValueAxis,
                    _factory: am5xy.ValueAxis["new"]
                }
            }
        }
    }

    private checkVersion() {
        if (this.props.settings?.xAxisType && this.props.settings?.yAxisType) {
            return "1"
        } else {
            return "2";
        }
    }

}