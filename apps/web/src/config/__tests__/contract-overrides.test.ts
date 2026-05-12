import { getContractOverrides } from '../contract-overrides'

describe('getContractOverrides', () => {
  it('returns undefined for chains with no override', () => {
    expect(getContractOverrides('1', '1.3.0', true)).toBeUndefined()
    expect(getContractOverrides('137', '1.4.1', true)).toBeUndefined()
  })

  it('returns undefined when version is null', () => {
    expect(getContractOverrides('14', null, true)).toBeUndefined()
  })

  it('returns undefined for Flare on a version that is not configured', () => {
    expect(getContractOverrides('14', '1.4.1', true)).toBeUndefined()
    expect(getContractOverrides('14', '1.1.1', true)).toBeUndefined()
  })

  it('returns L1 singleton override for Flare v1.3.0 with isL1SafeSingleton=true', () => {
    const override = getContractOverrides('14', '1.3.0', true)
    expect(override).toBeDefined()
    expect(override?.safeSingletonAddress).toBe('0x69f4D1788e39c87893C980c06EdF4b7f686e2938')
    expect(override?.safeProxyFactoryAddress).toBe('0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC')
    expect(override?.multiSendAddress).toBe('0x998739BFdAAdde7C933B942a68053933098f9EDa')
    expect(override?.multiSendCallOnlyAddress).toBe('0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B')
    expect(override?.fallbackHandlerAddress).toBe('0x017062a1dE2FE6b99BE3d9d37841FeD19F573804')
    expect(override?.signMessageLibAddress).toBe('0x98FFBBF51bb33A056B08ddf711f289936AafF717')
    expect(override?.createCallAddress).toBe('0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d')
    expect(override?.simulateTxAccessorAddress).toBe('0x727a77a074D1E6c4530e814F89E618a3298FC044')
  })

  it('returns L2 singleton override for Flare v1.3.0 with isL1SafeSingleton=false', () => {
    const override = getContractOverrides('14', '1.3.0', false)
    expect(override?.safeSingletonAddress).toBe('0xfb1bffC9d739B8D520DaF37dF666da4C687191EA')
    expect(override?.multiSendCallOnlyAddress).toBe('0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B')
  })

  it('strips +L2 metadata from the version string before matching', () => {
    expect(getContractOverrides('14', '1.3.0+L2', false)?.safeSingletonAddress).toBe(
      '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA',
    )
  })
})
