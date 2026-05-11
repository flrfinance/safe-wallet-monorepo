import semverSatisfies from 'semver/functions/satisfies'
import type { ContractNetworkConfig } from '@safe-global/protocol-kit'
import type { SafeState } from '@safe-global/store/gateway/AUTO_GENERATED/safes'

type VersionedOverride = {
  versions: string
  addresses: Partial<ContractNetworkConfig>
  isL1?: boolean
}

const FLARE_CHAIN_ID = '14'

// Flare mainnet (chainId 14) — Safe v1.3.0 deployments are not registered in
// @safe-global/safe-deployments, so we inject them here. Both L1 (GnosisSafe)
// and L2 (GnosisSafeL2) singletons are deployed; protocol-kit picks one via
// `isL1SafeSingleton`, so we expose both addresses and let the caller decide.
const FLARE_V1_3_0_OVERRIDES: Partial<ContractNetworkConfig> = {
  safeSingletonAddress: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938',
  safeProxyFactoryAddress: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC',
  multiSendAddress: '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  multiSendCallOnlyAddress: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B',
  fallbackHandlerAddress: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
  signMessageLibAddress: '0x98FFBBF51bb33A056B08ddf711f289936AafF717',
  createCallAddress: '0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d',
  simulateTxAccessorAddress: '0x727a77a074D1E6c4530e814F89E618a3298FC044',
}

const FLARE_V1_3_0_L2_OVERRIDES: Partial<ContractNetworkConfig> = {
  ...FLARE_V1_3_0_OVERRIDES,
  safeSingletonAddress: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA',
}

const OVERRIDES: Record<string, VersionedOverride[]> = {
  [FLARE_CHAIN_ID]: [
    { versions: '1.3.0', isL1: true, addresses: FLARE_V1_3_0_OVERRIDES },
    { versions: '1.3.0', isL1: false, addresses: FLARE_V1_3_0_L2_OVERRIDES },
  ],
}

const stripVersionMetadata = (version: string): string => version.split('+')[0]

export const getContractOverrides = (
  chainId: string,
  version: SafeState['version'],
  isL1SafeSingleton: boolean,
): Partial<ContractNetworkConfig> | undefined => {
  if (!version) return undefined
  const entries = OVERRIDES[chainId]
  if (!entries) return undefined

  const clean = stripVersionMetadata(version)
  return entries.find(
    (entry) => semverSatisfies(clean, entry.versions) && (entry.isL1 === undefined || entry.isL1 === isL1SafeSingleton),
  )?.addresses
}
