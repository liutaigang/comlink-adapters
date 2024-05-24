import { Remote, wrap } from 'comlink'
import { createContext } from 'react'
import { HandlersType } from '../../handlers'
import { vscodeWebviewEndpoint } from 'comlink-adapters'

const remote = wrap<HandlersType>(vscodeWebviewEndpoint())
export const RemoteContext = createContext<Remote<HandlersType>>(remote)

export const JsonrpcClientContextProvider = ({ children }: { children: React.ReactNode }) => {
  return <RemoteContext.Provider value={remote}>{children}</RemoteContext.Provider>
}
