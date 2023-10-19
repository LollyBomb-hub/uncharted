import GridLayout, {Layout, ReactGridLayoutProps, WidthProvider} from "react-grid-layout";
import React, {ReactNode} from "react";
import {DefaultApiInterface} from "../api";
import {map} from "@amcharts/amcharts5/.internal/core/util/Array";

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {View, ViewFrontendProps, ViewHandlers, ViewProps, ViewSuppliers} from "./View";

const Grid = WidthProvider(GridLayout);

interface GeneratorInfo extends Layout {
    gridCellId: number
}

export type ResizeCallback = (
    gridCellId: number,
    layout: Layout
) => any

export type DropCallback = (
    gridCellId: number,
    layout: Layout,
    e: Event
) => any

interface ViewGridCallbackProps extends ViewHandlers {
    onResizeStop?: ResizeCallback
    onDrop?: DropCallback
    suppliers?: ViewSuppliers
}

interface ViewGridFrontendProps extends ViewFrontendProps {
    childrenElementsClassName: string
    className: string
    width?: number
    rowHeight?: number
    useCSSTransforms?: boolean
    language: string
    region: string
}

export interface ViewGridProps<Component extends React.Component<ViewProps>> extends ViewGridFrontendProps, ViewGridCallbackProps {
    rglProps?: ReactGridLayoutProps
    api: DefaultApiInterface
    container?: (new(props: ViewProps) => Component)
    children?: never
    constructorMode: boolean
}

interface ViewGridState extends React.ComponentState {
    isErrorLoading: boolean
    cols: number
    generatorInfo: GeneratorInfo[] | null
}

class DefaultContainer extends React.Component<ViewProps> {

    render() {
        return (
            <div id={"grid-element-" + this.props.gridCellIdentifier}
                 className={"grid-element"}>
                <View {...this.props}/>
            </div>
        );
    }

}

export class ViewGrid<Component extends React.Component<ViewProps>> extends React.Component<ViewGridProps<Component>, ViewGridState> {

    async resolveGridConfiguration() {
        let informationAboutGrid = await this.props.api.getInformationAboutGrid();

        if (informationAboutGrid.status === 200) {
            let data = informationAboutGrid.data;

            let infos: GeneratorInfo[] = [];

            data.cells.forEach(
                el => {
                    let layout: GeneratorInfo = {
                        gridCellId: el.identifier,

                        i: el.identifier.toString(),

                        x: el.grid.x,
                        y: el.grid.y,
                        w: el.grid.colspan ? el.grid.colspan : 1,
                        h: el.grid.rowspan ? el.grid.rowspan : 1,

                        maxH: el.grid.maxH ? el.grid.maxH : undefined,
                        maxW: el.grid.maxW ? el.grid.maxW : undefined,
                        minH: el.grid.minH ? el.grid.minH : undefined,
                        minW: el.grid.minW ? el.grid.minW : undefined,

                        isDraggable: this.props.constructorMode,
                        isResizable: this.props.constructorMode,
                        resizeHandles: ['se']
                    }

                    infos.push(layout)
                }
            )

            this.setState(
                {
                    isErrorLoading: false,
                    cols: data.cols,
                    generatorInfo: infos
                }
            )
        } else {
            this.setState({
                isErrorLoading: true,
                cols: 10,
                generatorInfo: null
            })
        }
    }

    constructor(props: ViewGridProps<Component>) {
        super(props);

        this.state = {
            isErrorLoading: false,
            cols: 10,
            generatorInfo: null
        }
    }

    async componentDidUpdate(prevProps: Readonly<ViewGridProps<Component>>, prevState: Readonly<ViewGridState>, snapshot?: any) {
        await this.resolveGridConfiguration()
    }

    generateElements(): ReactNode {
        if (this.state.generatorInfo) {
            return map(
                this.state.generatorInfo,
                info => {
                    return (
                        <div key={info.i}>
                            {
                                React.createElement(
                                    this.props.container ? this.props.container : DefaultContainer,
                                    {
                                        language: this.props.language,
                                        region: this.props.region,
                                        className: this.props.childrenElementsClassName,
                                        key: info.i,
                                        gridCellIdentifier: info.gridCellId,
                                        dataSupplier: this.props.api,

                                        requestErrorHandler: this.props.requestErrorHandler,
                                        creationHandlers: this.props.creationHandlers,

                                        _theme: this.props._theme,
                                        chartAppearDelay: this.props.chartAppearDelay,
                                        chartAppearDuration: this.props.chartAppearDuration,
                                        seriesAppearDelay: this.props.seriesAppearDelay,
                                        seriesAppearDuration: this.props.seriesAppearDuration,

                                        ...this.props.suppliers
                                    } as ViewProps
                                )
                            }
                        </div>
                    )
                }
            )
        }
    }

    componentDidMount() {
        if (this.state.generatorInfo === null && !this.state.isErrorLoading) {
            void (this.resolveGridConfiguration());
        }
    }

    onResizeStop(layout: Layout[], old: Layout, newItem: Layout) {
        if (this.props.onResizeStop) {
            this.props.onResizeStop(parseInt(newItem.i), newItem)
        }
    }

    onDrop(layouts: Layout[], item: Layout, event: Event) {
        if (this.props.onDrop) {
            this.props.onDrop(parseInt(item.i), item, event)
        }
    }

    render() {
        if (this.state.generatorInfo === null) {
            if (this.state.isErrorLoading) {
                return (<div><span>Error loading info about grid!</span></div>)
            } else {
                return (<div><span>Loading...</span></div>)
            }
        } else {
            return (
                <Grid
                    className={this.props.className}
                    layout={this.state.generatorInfo}
                    cols={this.state.cols}
                    width={this.props.width ? this.props.width : 1000}
                    rowHeight={this.props.rowHeight ? this.props.rowHeight : 200}
                    onResizeStop={(layout: Layout[], old: Layout, newItem: Layout) => {
                        this.onResizeStop(layout, old, newItem)
                    }}
                    onDrop={this.onDrop}
                    useCSSTransforms={this.props.useCSSTransforms}
                    {...this.props.rglProps}
                >
                    {this.generateElements()}
                </Grid>
            );
        }
    }

}