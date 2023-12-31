/* tslint:disable */
/* eslint-disable */
/**
 * uncharted
 * uncharted
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import { Configuration } from './configuration';
import globalAxios, { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from './common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from './base';

/**
 * Description of whole grid
 * @export
 * @interface Grid
 */
export interface Grid {
    /**
     * Count of columns
     * @type {number}
     * @memberof Grid
     */
    'cols': number;
    /**
     * Array of desciptions of cells
     * @type {Array<GridCell>}
     * @memberof Grid
     */
    'cells': Array<GridCell>;
}
/**
 * Description of grid cell
 * @export
 * @interface GridCell
 */
export interface GridCell {
    /**
     * Grid cell unique identifier
     * @type {number}
     * @memberof GridCell
     */
    'identifier': number;
    /**
     * 
     * @type {GridInfo}
     * @memberof GridCell
     */
    'grid': GridInfo;
}
/**
 * Description of grid cell
 * @export
 * @interface GridInfo
 */
export interface GridInfo {
    /**
     * X axis position
     * @type {number}
     * @memberof GridInfo
     */
    'x': number;
    /**
     * Y axis position
     * @type {number}
     * @memberof GridInfo
     */
    'y': number;
    /**
     * Colspan info
     * @type {number}
     * @memberof GridInfo
     */
    'colspan'?: number;
    /**
     * Rowspan info
     * @type {number}
     * @memberof GridInfo
     */
    'rowspan'?: number;
    /**
     * Maximum height
     * @type {number}
     * @memberof GridInfo
     */
    'maxH'?: number;
    /**
     * Maximum width
     * @type {number}
     * @memberof GridInfo
     */
    'maxW'?: number;
    /**
     * Minimum height
     * @type {number}
     * @memberof GridInfo
     */
    'minH'?: number;
    /**
     * Minimum width
     * @type {number}
     * @memberof GridInfo
     */
    'minW'?: number;
}
/**
 * Response for view! Contains all needed for correct visualization.
 * @export
 * @interface ViewInfo
 */
export interface ViewInfo {
    /**
     * 
     * @type {VisualizationTypeEnum}
     * @memberof ViewInfo
     */
    'visualizationType': VisualizationTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof ViewInfo
     */
    'settings': string;
    /**
     * 
     * @type {string}
     * @memberof ViewInfo
     */
    'handlers'?: string;
    /**
     * 
     * @type {string}
     * @memberof ViewInfo
     */
    'data': string;
    /**
     * 
     * @type {string}
     * @memberof ViewInfo
     */
    'preprocessor'?: string;
}
/**
 * Type of visualization
 * @export
 * @enum {string}
 */

export const VisualizationTypeEnum = {
    ColumnChart: 'COLUMN_CHART',
    ClusteredColumnChart: 'CLUSTERED_COLUMN_CHART',
    HighlightingChartSeries: 'HIGHLIGHTING_CHART_SERIES',
    PieChart: 'PIE_CHART',
    MultilevelTreeMap: 'MULTILEVEL_TREE_MAP'
} as const;

export type VisualizationTypeEnum = typeof VisualizationTypeEnum[keyof typeof VisualizationTypeEnum];



/**
 * DefaultApi - axios parameter creator
 * @export
 */
export const DefaultApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Get information to visualize
         * @param {number} gridCellIdentifier 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getGridCellData: async (gridCellIdentifier: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'gridCellIdentifier' is not null or undefined
            assertParamExists('getGridCellData', 'gridCellIdentifier', gridCellIdentifier)
            const localVarPath = `/uncharted/info/{gridCellIdentifier}`
                .replace(`{${"gridCellIdentifier"}}`, encodeURIComponent(String(gridCellIdentifier)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Operation to get info about grid
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getInformationAboutGrid: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/uncharted/info`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * DefaultApi - functional programming interface
 * @export
 */
export const DefaultApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = DefaultApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Get information to visualize
         * @param {number} gridCellIdentifier 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getGridCellData(gridCellIdentifier: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ViewInfo>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getGridCellData(gridCellIdentifier, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Operation to get info about grid
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getInformationAboutGrid(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Grid>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getInformationAboutGrid(options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * DefaultApi - factory interface
 * @export
 */
export const DefaultApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = DefaultApiFp(configuration)
    return {
        /**
         * 
         * @summary Get information to visualize
         * @param {number} gridCellIdentifier 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getGridCellData(gridCellIdentifier: number, options?: any): AxiosPromise<ViewInfo> {
            return localVarFp.getGridCellData(gridCellIdentifier, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Operation to get info about grid
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getInformationAboutGrid(options?: any): AxiosPromise<Grid> {
            return localVarFp.getInformationAboutGrid(options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * DefaultApi - interface
 * @export
 * @interface DefaultApi
 */
export interface DefaultApiInterface {
    /**
     * 
     * @summary Get information to visualize
     * @param {number} gridCellIdentifier 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApiInterface
     */
    getGridCellData(gridCellIdentifier: number, options?: AxiosRequestConfig): AxiosPromise<ViewInfo>;

    /**
     * 
     * @summary Operation to get info about grid
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApiInterface
     */
    getInformationAboutGrid(options?: AxiosRequestConfig): AxiosPromise<Grid>;

}

/**
 * DefaultApi - object-oriented interface
 * @export
 * @class DefaultApi
 * @extends {BaseAPI}
 */
export class DefaultApi extends BaseAPI implements DefaultApiInterface {
    /**
     * 
     * @summary Get information to visualize
     * @param {number} gridCellIdentifier 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    public getGridCellData(gridCellIdentifier: number, options?: AxiosRequestConfig) {
        return DefaultApiFp(this.configuration).getGridCellData(gridCellIdentifier, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Operation to get info about grid
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    public getInformationAboutGrid(options?: AxiosRequestConfig) {
        return DefaultApiFp(this.configuration).getInformationAboutGrid(options).then((request) => request(this.axios, this.basePath));
    }
}


