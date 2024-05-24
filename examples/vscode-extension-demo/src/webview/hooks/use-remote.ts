import { useContext } from 'react'
import { RemoteContext } from '../contexts/remote-context'

export const useRemote = () => {
  const remote = useContext(RemoteContext)
  if (remote === undefined) {
    throw new Error('useRemote must be used within the RemoteContextProvider')
  }
  return remote
}
