import {
    API,
    RetAPI,
    PlainAPI as PlainAPI,
    ArgAPI,
    ZodBase,
    StdAPI,
} from '@/def'
import type { Axios, AxiosRequestConfig } from 'axios'
import { z } from 'zod'
import {
    callAPI,
    RequestInfoNoArg,
    RequestInfoWithArg,
} from './request'
export interface ApiClient<DTO, VO> {
    (data: DTO): Promise<VO>
}
type AllClient =
    | NoArgClientInfo<any>
    | NoRetClientInfo<any>
    | NoIOClientInfo
    | FullAPIClientInfo<any, any>
export interface ClientInfoBase {
    axios?: Axios
    requestConfig?: AxiosRequestConfig
    onError?: (err: unknown) => Promise<void>
}
export interface NoArgClientInfo<VO extends ZodBase>
    extends ClientInfoBase {
    api: RetAPI<VO>
}
export interface NoRetClientInfo<DTO extends ZodBase>
    extends ClientInfoBase {
    api: ArgAPI<DTO>
}
export interface NoIOClientInfo extends ClientInfoBase {
    api: PlainAPI
}
export interface FullAPIClientInfo<
    DTO extends ZodBase,
    VO extends ZodBase,
> extends ClientInfoBase {
    api: StdAPI<DTO, VO>
}

export function clientOfAPI<
    DTO extends ZodBase,
    VO extends ZodBase,
>(
    clientInfo: FullAPIClientInfo<DTO, VO>
): ApiClient<z.output<DTO>, z.output<VO>>
export function clientOfAPI<VO extends ZodBase>(
    clientInfo: NoArgClientInfo<VO>
): ApiClient<void, z.output<VO>>
export function clientOfAPI<DTO extends ZodBase>(
    clientInfo: NoRetClientInfo<DTO>
): ApiClient<z.output<DTO>, void>
export function clientOfAPI(
    clientInfo: NoIOClientInfo
): ApiClient<void, void>

export function clientOfAPI(
    clientInfo: AllClient
): ApiClient<any, any> {
    return async (data: any): Promise<any> => {
        try {
            return await callAPI({
                requestConfig: clientInfo.requestConfig,
                axios: clientInfo.axios,
                api: clientInfo.api,
                data,
            })
        } catch (err: unknown) {
            console.error('Client error', err)
            await clientInfo.onError?.(err)
            throw err
        }
    }
}
