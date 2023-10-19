import React, {ReactNode} from "react";
import {DefaultApiInterface, ViewInfo} from "../api";
import {ColumnChartView, ColumnChartViewCreationEvents} from "./views/ColumnChartView";
import {AbstractView, AbstractViewFrontendStaticSettings, AbstractViewSuppliers} from "./views/AbstractView";
import {HighlightingView} from "./views/HighlightingView";
import {PieChart, PieChartCreationEvents} from "./views/PieChart";
import {TreemapView, TreemapViewCreationEvents} from "./views/TreemapView";

export type ErrorHandler = (uninitializedContainerId: number, reason: any) => void

export interface ViewAPIProps extends React.ComponentProps<any> {
    gridCellIdentifier: number
    dataSupplier: DefaultApiInterface | ViewInfo
    language: string
    region: string
}

export interface ViewHandlers {
    requestErrorHandler?: ErrorHandler
    creationHandlers?: ColumnChartViewCreationEvents | PieChartCreationEvents | TreemapViewCreationEvents
}

export interface ViewSuppliers extends AbstractViewSuppliers {
    errorView?: () => ReactNode
    notSupportedYetView?: () => ReactNode
    preloader?: () => ReactNode
}

export interface ViewFrontendProps extends AbstractViewFrontendStaticSettings {
}

export interface ViewProps extends ViewAPIProps, ViewHandlers, ViewFrontendProps, ViewSuppliers {
}

interface ViewState extends React.ComponentState {
    gridCellData: ViewInfo | null
    isErrored: boolean
}

function isDefaultApiInterface(object: any): object is DefaultApiInterface {
    return "getGridCellData" in object
}

export class View extends React.Component<ViewProps, ViewState> {
    private refToView: AbstractView<any, any, any> | null = null;

    async resolveData(): Promise<void> {
        try {
            if (isDefaultApiInterface(this.props.dataSupplier)) {
                let gridCellData = await this.props.dataSupplier.getGridCellData(
                    this.props.gridCellIdentifier
                );

                if (gridCellData.status === 200) {
                    this.setState({gridCellData: gridCellData.data, isErrored: false});
                } else {
                    if (this.props.requestErrorHandler) {
                        this.props.requestErrorHandler(this.props.gridCellIdentifier, gridCellData);
                    }
                    this.setState({gridCellData: null, isErrored: true});
                }
            } else {
                this.setState({gridCellData: this.props.dataSupplier, isErrored: false})
            }
        } catch (e) {
            this.setState({...this.state, isErrored: true})
        }
    }

    constructor(props: ViewProps) {
        super(props);

        this.state = {
            gridCellData: null,
            isErrored: false
        }
    }

    async updateData() {
        if (this.refToView !== null) {
            await this.resolveData()
            this.refToView.onDataChanged()
        }
    }

    componentDidMount() {
        if (!this.state.gridCellData) {
            if (!this.state.isErrored) {
                this.resolveData()
            }
        }
    }

    private static parseStringJson(jsonString?: string) {
        return jsonString ? JSON.parse(jsonString) : undefined
    }

    render() {
        if (this.state.isErrored) {
            if (this.props.errorView) {
                return this.props.errorView()
            } else {
                return (
                    <div id={"error-" + this.props.gridCellIdentifier.toString()}>
                        <span
                            id={"error-message-span-" + this.props.gridCellIdentifier.toString()}>Error loading data</span>
                    </div>
                )
            }
        } else {
            if (this.state.gridCellData !== null) {
                let info = View.parseStringJson(this.state.gridCellData.data)
                let settings = View.parseStringJson(this.state.gridCellData.settings)
                let fetchedHandlers = View.parseStringJson(this.state.gridCellData.handlers)
                let commonSettings = {
                    className: this.props.className,
                    containerId: this.props.gridCellIdentifier.toString(),
                    info: info,
                    settings: settings,
                    requestedHandlers: fetchedHandlers,
                    dataPreprocessor: this.state.gridCellData.preprocessor,
                    language: this.props.language,
                    region: this.props.region,

                    _theme: this.props._theme,
                    chartAppearDelay: this.props.chartAppearDelay,
                    chartAppearDuration: this.props.chartAppearDuration,
                    seriesAppearDelay: this.props.seriesAppearDelay,
                    seriesAppearDuration: this.props.seriesAppearDuration,

                    invalidDataView: this.props.invalidDataView,
                    emptyDataView: this.props.emptyDataView
                }
                switch (this.state.gridCellData.visualizationType) {
                    case "CLUSTERED_COLUMN_CHART":
                    case "COLUMN_CHART": {
                        return (
                            <div className={"container" + this.props.className}
                                 id={"container-" + this.props.gridCellIdentifier.toString()}>
                                <ColumnChartView ref={(view) => {this.refToView = view}} handlers={this.props.creationHandlers} {...commonSettings}/>
                            </div>
                        )
                    }
                    case "HIGHLIGHTING_CHART_SERIES": {
                        return (
                            <div className={"container" + this.props.className}
                                 id={"container-" + this.props.gridCellIdentifier.toString()}>
                                <HighlightingView ref={(view) => {this.refToView = view}} handlers={this.props.creationHandlers} {...commonSettings}/>
                            </div>
                        )
                    }
                    case "MULTILEVEL_TREE_MAP": {
                        return (
                            <div className={"container" + this.props.className}
                                 id={"container-" + this.props.gridCellIdentifier.toString()}>
                                <TreemapView ref={(view) => {this.refToView = view}} handlers={this.props.creationHandlers} {...commonSettings}/>
                            </div>
                        )
                    }
                    case "PIE_CHART": {
                        return (
                            <div className={"container" + this.props.className}
                                 id={"container-" + this.props.gridCellIdentifier.toString()}>
                                <PieChart ref={(view) => {this.refToView = view}} handlers={this.props.creationHandlers} {...commonSettings}/>
                            </div>
                        )
                    }
                    default: {
                        if (this.props.notSupportedYetView) {
                            return this.props.notSupportedYetView();
                        } else {
                            return (
                                <div id={"unresolved-" + this.props.gridCellIdentifier.toString()}>
                                    <span id={"unresolved-span-" + this.props.gridCellIdentifier.toString()}>Unresolved type of chart. Not supported yet</span>
                                </div>
                            )
                        }
                    }
                }
            } else {
                if (this.props.preloader) {
                    return this.props.preloader();
                } else {
                    return (
                        <div id={"loader-" + this.props.gridCellIdentifier.toString()}>
                            <span id={"preloader-span-" + this.props.gridCellIdentifier.toString()}>Loading...</span>
                        </div>
                    )
                }
            }
        }
    }

}