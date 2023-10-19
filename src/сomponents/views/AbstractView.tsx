import React, {ReactNode} from "react";
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import {AnimatedTheme} from "@amcharts/amcharts5/.internal/themes/AnimatedTheme";
import {CreationHandler} from "./interfaces/EventHandlers";
import {AbstractCreationEvents} from "./interfaces/ViewEvents";
import en from "@amcharts/amcharts5/locales/en";
import ru from "@amcharts/amcharts5/locales/ru_RU";

import 'moment/min/locales';

export type AbstractViewCreated = "_legendType" | "_tooltipType" | "_chartType" | "_seriesType";
export type AbstractViewOperatable = typeof am5.Entity | typeof am5.Chart | typeof am5.Sprite | typeof am5.Legend;
export type CreatableInfo<S extends AbstractViewOperatable> = { _source: S, _factory: S["new"] }

export interface AbstractViewCreationEvents {

    root?: CreationHandler<am5.Root>
    theme?: CreationHandler<am5.Theme>
    chart?: CreationHandler<am5.SerialChart>
    legend?: CreationHandler<am5.Legend>
    series?: CreationHandler<am5.Series>
    beforeAppearCalled?: string
    afterAppearCalled?: string

}

export interface AbstractViewFrontendStaticSettings {
    className: string

    // Amcharts theme
    _theme?: typeof am5.Theme

    // Animation related
    chartAppearDuration?: number
    chartAppearDelay?: number

    seriesAppearDuration?: number
    seriesAppearDelay?: number
}

export interface AbstractViewFrontendRequestedSettings {
    legendPosition?: string
    legendSettings?: object
    chartSettings?: object
    seriesTooltip?: object
    seriesSettings?: object
}

export interface AbstractViewSuppliers {
    emptyDataView?: () => ReactNode
    invalidDataView?: () => ReactNode
}

export interface AbstractViewProps<Events extends AbstractViewCreationEvents, Settings extends AbstractViewFrontendRequestedSettings> extends AbstractViewFrontendStaticSettings, AbstractViewSuppliers {
    language?: string
    region?: string
    containerId: string
    handlers?: Events
    requestedHandlers?: Events
    settings?: Settings
    children?: any

    dataPreprocessor?: string
    info: any
}

export interface AbstractViewState {
    isDataQueryingError: boolean
}

const jsonpath = require("jsonpath");
const moment = require("moment");

export const libs = {
    jsonpath: jsonpath,
    moment: moment,
    am5: am5
}

export type CreatableKeys = {
    _seriesType: CreatableInfo<typeof am5.Series>,
    _chartType: CreatableInfo<typeof am5.Chart>,
    _tooltipType: CreatableInfo<typeof am5.Tooltip>,
    _legendType: CreatableInfo<typeof am5.Legend>
}

export abstract class AbstractView<Props extends AbstractViewProps<Events, Settings>,
    Events extends AbstractViewCreationEvents,
    Settings extends AbstractViewFrontendRequestedSettings> extends React.Component<Props, AbstractViewState> {

    private readonly language: string;
    private readonly region: string;

    _elements: CreatableKeys = {
        _chartType: {_factory: am5.Chart["new"], _source: am5.Chart},
        _legendType: {_factory: am5.Legend["new"], _source: am5.Legend},
        _seriesType: {_factory: am5.Series["new"], _source: am5.Series},
        _tooltipType: {_factory: am5.Tooltip["new"], _source: am5.Tooltip}
    }

    _themeType: typeof am5.Theme = AnimatedTheme

    _link: typeof AbstractCreationEvents = AbstractCreationEvents

    public root!: am5.Root
    public chart!: am5.Chart
    public legend!: am5.Legend
    public theme!: am5.Theme
    public data: object[] = []
    private series: Array<am5.Series> = []

    protected constructor(props: Props) {
        super(props);

        if (props.language) {
            this.language = props.language.toLowerCase();
        } else {
            this.language = "ru";
        }
        if (props.region) {
            this.region = props.region.toUpperCase();
        } else {
            this.region = "RU";
        }

        if (this.props._theme) {
            this["_themeType"] = this.props._theme
        }

        libs.moment.locale(this.language + "-" + this.region)

        this.state = {
            isDataQueryingError: false
        }
    }

    public createByInfo<V extends AbstractViewOperatable>(creatableInfo: any, root: am5.Root, settings: InstanceType<V>["_settings"], key: keyof this["_elements"]) {
        let created = creatableInfo._source.new(root, settings)
        this.fireCreationEvent(AbstractCreationEvents.getByKey(this._link, key.toString()).HANDLER, created)
        return created
    }

    private create<V extends AbstractViewOperatable>(key: keyof this["_elements"], root: am5.Root, settings: InstanceType<V>["_settings"]): InstanceType<V> {
        for (const k of Object.keys(this["_elements"])) {
            if (k === key) {
                let fetched = this["_elements"][k];
                return this.createByInfo(fetched, root, settings, key)
            }
        }
        throw Error(`Not found ${key.toString()} in ${Object.keys(this["_elements"])}!`);
    }

    private fireCreationEvent<V>(key: string, item: V) {
        if (this.props.handlers && this.props.handlers[key]) {
            this.props.handlers[key](key, item, this.props.containerId)
        }
        if (this.props.requestedHandlers && this.props.requestedHandlers[key]) {
            if (typeof this.props.requestedHandlers[key] === 'string') {
                //console.log(this.props.requestedHandlers[key])
                // eslint-disable-next-line no-eval
                eval(this.props.requestedHandlers[key])(key, item, this.props.containerId, libs)
            }
        }
    }

    private async instantiateRoot(): Promise<am5.Root> {
        //const locale = (this.language === "ar" ? this.language : this.language + "_" + this.region);
        let root = am5.Root.new(this.props.containerId)
        if (this.language === 'ru') {
            root.locale = ru;
        } else {
            root.locale = en;
        }
        this.fireCreationEvent(this._link.ROOT.HANDLER, root)
        return root
    }

    protected instantiateTooltip(): am5.Tooltip | undefined {
        if (this.props.settings?.seriesTooltip) {
            return this.instantiate<typeof am5.Tooltip>(this.root, "_tooltipType", this.props.settings?.seriesTooltip)
        }
    }

    private getConfig<V extends AbstractViewOperatable>(settings?: InstanceType<V>["_settings"] | string): InstanceType<V>["_settings"] {
        // eslint-disable-next-line no-eval
        if (settings) {
            if (typeof settings === 'string') {
                //console.log(settings)
                // eslint-disable-next-line no-eval
                let evaluated = eval(settings)
                if (typeof evaluated === 'function') {
                    return evaluated()
                }
            } else {
                if (typeof settings === 'object') {
                    return {...settings}
                } else {
                    return {}
                }
            }
        }
        return {}
    }

    protected instantiate<V extends AbstractViewOperatable>(root: am5.Root, key: keyof this["_elements"], settings?: InstanceType<V>["_settings"] | string): InstanceType<V> {
        return this.create(key, root, this.getConfig(settings))
    }

    protected instantiateWithDefaultSettings<V extends AbstractViewOperatable>(root: am5.Root, key: keyof this["_elements"], defaultSettings: InstanceType<V>["_settings"], settings?: InstanceType<V>["_settings"] | string | object): InstanceType<V> {
        if (settings) {
            settings = this.getConfig(settings)
            if (settings) {
                for (const [k, v] of Object.entries(defaultSettings)) {
                    settings[k] = v
                }
                return this.instantiate(root, key, settings)
            } else {
                return this.instantiate(root, key, defaultSettings)
            }
        } else {
            return this.instantiate(root, key, defaultSettings)
        }
    }

    private getSeriesSettings(seriesPassedSettings?: any) {
        if (seriesPassedSettings) {
            if (seriesPassedSettings.factory) {
                return this.getConfig(seriesPassedSettings.factory)
            } else {
                return seriesPassedSettings
            }
        } else {
            return {}
        }
    }

    async onDataChanged() {
        if (this.root) {
            this.root.dispose();
            this.series = new Array<am5.Series>();
        }
        await this.prepare();
        if (this.chart instanceof am5xy.XYChart) {
            if ((this.chart as am5xy.XYChart).zoomOutButton.isVisible()) {
                await this.chart.zoomOutButton.hide(0)
            }
        }
    }

    /*
        Setup for am5.Root, am5.Theme and this["_chartType"] etc..<br/>
        Takes settings from server!
    */
    async prepare() {
        if (this.props.info && !this.state.isDataQueryingError) {
            this.root = await this.instantiateRoot()
            this.theme = this["_themeType"].new(this.root)
            this.root.setThemes([this.theme])
            this.chart = this.instantiate<typeof am5.Chart>(this.root, "_chartType", this.props.settings?.chartSettings)
            this.chart = this.root.container.children.push(this.chart)

            if (this.props.settings?.legendSettings) {
                this.legend = this.instantiate<typeof am5.Legend>(
                    this.root,
                    "_legendType",
                    this.props.settings.legendSettings
                )
                if (this.props.settings.legendSettings["customPosition"] !== undefined) {
                    this.legend = this.chart[this.props.settings.legendSettings["customPosition"]].children.push(this.legend)
                } else {
                    this.legend = this.chart.children.push(this.legend)
                }
            }

            if (this.props.dataPreprocessor) {
                let data: object[] = []
                // eslint-disable-next-line no-new-func
                let preprocessor: Function = Function("libs", "given", "target", "series", "root", this.props.dataPreprocessor)
                preprocessor(libs, this.props.info, data, this.root)
                this.data = data
            } else {
                this.data = this.props.info as object[]
            }

            //console.log(this.props.containerId, this.data)

            await this.setup()

            if ((this.chart) instanceof am5.SerialChart) {
                if (this.props.settings?.seriesSettings === undefined) {
                    console.warn("No series passed!")
                    this.setState({isDataQueryingError: true})
                    return;
                }
                if (this.props.settings?.seriesSettings instanceof Array) {
                    for (const seriesDescription of this.props.settings?.seriesSettings) {
                        let seriesSettings = this.getSeriesSettings(seriesDescription)
                        this.processSeries(seriesSettings, this.chart)
                    }
                } else {
                    let seriesSettings = this.getSeriesSettings(this.props.settings?.seriesSettings)
                    if (seriesSettings instanceof Array) {
                        for (const seriesDescription of seriesSettings) {
                            this.processSeries(seriesDescription, this.chart)
                        }
                    } else {
                        this.processSeries(seriesSettings, this.chart)
                    }
                }
            }

            if (this.props.requestedHandlers?.beforeAppearCalled) {
                // eslint-disable-next-line no-eval
                eval(this.props.requestedHandlers.beforeAppearCalled)(AbstractCreationEvents.getByKey(this._link, "beforeAppearCalled"), this.props.containerId, this, libs);
            }

            for (const series of this.series) {
                series.appear(this.props.seriesAppearDuration, this.props.seriesAppearDelay)
            }
            this.chart.appear(this.props.chartAppearDuration, this.props.chartAppearDelay)
        }
    }

    private processSeries(settings: InstanceType<this["_elements"]["_seriesType"]["_source"]>["_settings"], chart: am5.SerialChart) {
        let series: InstanceType<this["_elements"]["_seriesType"]["_source"]> | undefined = this.setupSingleSeries(settings);

        if (series) {
            chart.series.push(series)
            series.data.setAll(this.data)
            this.series.push(series)
            if (this.legend) {
                this.legend.data.push(series)
            }
        }
    }

    render() {
        if (this.state.isDataQueryingError) {
            if (this.root) {
                this.root.dispose()
            }
            if (this.props.invalidDataView) {
                return this.props.invalidDataView()
            } else {
                return (
                    <div className={"error" + this.props.className} id={"error-" + this.props.containerId}>
                        <span>Could not display data</span>
                    </div>
                )
            }
        } else if (this.props.info) {
            return <div className={"root" + this.props.className} id={this.props.containerId}/>
        } else {
            if (this.props.emptyDataView) {
                return this.props.emptyDataView()
            } else {
                return (
                    <div className={"empty" + this.props.className}><span>Empty data!</span></div>
                )
            }
        }
    }

    componentDidMount() {
        if (!this.state.isDataQueryingError) {
            void (this.prepare())
        }
    }

    abstract setup()

    abstract setupSingleSeries(seriesSettings: InstanceType<this["_elements"]["_seriesType"]["_source"]>["_settings"]): InstanceType<this["_elements"]["_seriesType"]["_source"]> | undefined

}
