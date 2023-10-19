export class AbstractCreationEvents {

    static readonly BEFORE_APPEAR = new AbstractCreationEvents("beforeAppearCalled", "beforeAppearCalled")
    static readonly AFTER_APPEAR = new AbstractCreationEvents("afterAppearCalled", "afterAppearCalled")
    static readonly ROOT = new AbstractCreationEvents("_rootType", "root")
    static readonly THEME = new AbstractCreationEvents("_themeType", "theme")
    static readonly TOOLTIP = new AbstractCreationEvents("_tooltipType", "tooltip")
    static readonly LEGEND = new AbstractCreationEvents("_legendType", "legend")
    static readonly CHART = new AbstractCreationEvents("_chartType", "chart")
    static readonly SERIES = new AbstractCreationEvents("_seriesType", "series")

    protected constructor(public KEY: string, public HANDLER: string) {

    }

    static getByKey<C extends typeof AbstractCreationEvents>(obj: C, key: string): AbstractCreationEvents {
        for (const propertyKey in obj) {
            let current = obj[propertyKey]
            if (current instanceof AbstractCreationEvents) {
                if (current.KEY === key) {
                    return current
                }
            }
        }
        throw key
    }

}

export class AbstractXYCreationEvents extends AbstractCreationEvents {

    static readonly CURSOR = new AbstractCreationEvents("_cursorType", "cursor")

    static readonly XAXIS_RENDERER = new AbstractCreationEvents("_xAxisRendererType", "xAxisRenderer")
    static readonly XAXIS = new AbstractCreationEvents("_xAxisType", "xAxis")

    static readonly YAXIS_RENDERER = new AbstractCreationEvents("_yAxisRendererType", "yAxisRenderer")
    static readonly YAXIS = new AbstractCreationEvents("_yAxisType", "yAxis")

}