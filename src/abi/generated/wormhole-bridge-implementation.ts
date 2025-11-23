import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    AdminChanged: event("0x7e644d79422f17c01e4894b5f4f588d331ebfa28653d42ae832dc59e38c9798f", "AdminChanged(address,address)", {"previousAdmin": p.address, "newAdmin": p.address}),
    BeaconUpgraded: event("0x1cf3b03a6cf19fa2baba4df148e9dcabedea7f8a5c07840e207e5c089be95d3e", "BeaconUpgraded(address)", {"beacon": indexed(p.address)}),
    ContractUpgraded: event("0x2e4cc16c100f0b55e2df82ab0b1a7e294aa9cbd01b48fbaf622683fbc0507a49", "ContractUpgraded(address,address)", {"oldContract": indexed(p.address), "newContract": indexed(p.address)}),
    TransferRedeemed: event("0xcaf280c8cfeba144da67230d9b009c8f868a75bac9a528fa0474be1ba317c169", "TransferRedeemed(uint16,bytes32,uint64)", {"emitterChainId": indexed(p.uint16), "emitterAddress": indexed(p.bytes32), "sequence": indexed(p.uint64)}),
    Upgraded: event("0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b", "Upgraded(address)", {"implementation": indexed(p.address)}),
}

export const functions = {
    WETH: viewFun("0xad5c4648", "WETH()", {}, p.address),
    _parseTransferCommon: viewFun("0xe89bc401", "_parseTransferCommon(bytes)", {"encoded": p.bytes}, p.struct({"payloadID": p.uint8, "amount": p.uint256, "tokenAddress": p.bytes32, "tokenChain": p.uint16, "to": p.bytes32, "toChain": p.uint16, "fee": p.uint256})),
    attestToken: fun("0xc48fa115", "attestToken(address,uint32)", {"tokenAddress": p.address, "nonce": p.uint32}, p.uint64),
    bridgeContracts: viewFun("0xad66a5f1", "bridgeContracts(uint16)", {"chainId_": p.uint16}, p.bytes32),
    chainId: viewFun("0x9a8a0592", "chainId()", {}, p.uint16),
    completeTransfer: fun("0xc6878519", "completeTransfer(bytes)", {"encodedVm": p.bytes}, ),
    completeTransferAndUnwrapETH: fun("0xff200cde", "completeTransferAndUnwrapETH(bytes)", {"encodedVm": p.bytes}, ),
    completeTransferAndUnwrapETHWithPayload: fun("0x1c8475e4", "completeTransferAndUnwrapETHWithPayload(bytes)", {"encodedVm": p.bytes}, p.bytes),
    completeTransferWithPayload: fun("0xc3f511c1", "completeTransferWithPayload(bytes)", {"encodedVm": p.bytes}, p.bytes),
    createWrapped: fun("0xe8059810", "createWrapped(bytes)", {"encodedVm": p.bytes}, p.address),
    encodeAssetMeta: viewFun("0xb046223b", "encodeAssetMeta((uint8,bytes32,uint16,uint8,bytes32,bytes32))", {"meta": p.struct({"payloadID": p.uint8, "tokenAddress": p.bytes32, "tokenChain": p.uint16, "decimals": p.uint8, "symbol": p.bytes32, "name": p.bytes32})}, p.bytes),
    encodeTransfer: viewFun("0x5f854266", "encodeTransfer((uint8,uint256,bytes32,uint16,bytes32,uint16,uint256))", {"transfer": p.struct({"payloadID": p.uint8, "amount": p.uint256, "tokenAddress": p.bytes32, "tokenChain": p.uint16, "to": p.bytes32, "toChain": p.uint16, "fee": p.uint256})}, p.bytes),
    encodeTransferWithPayload: viewFun("0xd56e2e24", "encodeTransferWithPayload((uint8,uint256,bytes32,uint16,bytes32,uint16,bytes32,bytes))", {"transfer": p.struct({"payloadID": p.uint8, "amount": p.uint256, "tokenAddress": p.bytes32, "tokenChain": p.uint16, "to": p.bytes32, "toChain": p.uint16, "fromAddress": p.bytes32, "payload": p.bytes})}, p.bytes),
    evmChainId: viewFun("0x64d42b17", "evmChainId()", {}, p.uint256),
    finality: viewFun("0x739fc8d1", "finality()", {}, p.uint8),
    governanceActionIsConsumed: viewFun("0x2c3c02a4", "governanceActionIsConsumed(bytes32)", {"hash": p.bytes32}, p.bool),
    governanceChainId: viewFun("0xfbe3c2cd", "governanceChainId()", {}, p.uint16),
    governanceContract: viewFun("0xb172b222", "governanceContract()", {}, p.bytes32),
    implementation: viewFun("0x5c60da1b", "implementation()", {}, p.address),
    initialize: fun("0x8129fc1c", "initialize()", {}, ),
    isFork: viewFun("0xe039f224", "isFork()", {}, p.bool),
    isInitialized: viewFun("0xd60b347f", "isInitialized(address)", {"impl": p.address}, p.bool),
    isTransferCompleted: viewFun("0xaa4efa5b", "isTransferCompleted(bytes32)", {"hash": p.bytes32}, p.bool),
    isWrappedAsset: viewFun("0x1a2be4da", "isWrappedAsset(address)", {"token": p.address}, p.bool),
    outstandingBridged: viewFun("0xb96c7e4d", "outstandingBridged(address)", {"token": p.address}, p.uint256),
    parseAssetMeta: viewFun("0x07dfd8fb", "parseAssetMeta(bytes)", {"encoded": p.bytes}, p.struct({"payloadID": p.uint8, "tokenAddress": p.bytes32, "tokenChain": p.uint16, "decimals": p.uint8, "symbol": p.bytes32, "name": p.bytes32})),
    parsePayloadID: viewFun("0x0f509008", "parsePayloadID(bytes)", {"encoded": p.bytes}, p.uint8),
    parseRecoverChainId: viewFun("0xcb4cfea8", "parseRecoverChainId(bytes)", {"encodedRecoverChainId": p.bytes}, p.struct({"module": p.bytes32, "action": p.uint8, "evmChainId": p.uint256, "newChainId": p.uint16})),
    parseRegisterChain: viewFun("0x01f53255", "parseRegisterChain(bytes)", {"encoded": p.bytes}, p.struct({"module": p.bytes32, "action": p.uint8, "chainId": p.uint16, "emitterChainID": p.uint16, "emitterAddress": p.bytes32})),
    parseTransfer: viewFun("0x2b511375", "parseTransfer(bytes)", {"encoded": p.bytes}, p.struct({"payloadID": p.uint8, "amount": p.uint256, "tokenAddress": p.bytes32, "tokenChain": p.uint16, "to": p.bytes32, "toChain": p.uint16, "fee": p.uint256})),
    parseTransferWithPayload: viewFun("0xea63738d", "parseTransferWithPayload(bytes)", {"encoded": p.bytes}, p.struct({"payloadID": p.uint8, "amount": p.uint256, "tokenAddress": p.bytes32, "tokenChain": p.uint16, "to": p.bytes32, "toChain": p.uint16, "fromAddress": p.bytes32, "payload": p.bytes})),
    parseUpgrade: viewFun("0xfbeeacd9", "parseUpgrade(bytes)", {"encoded": p.bytes}, p.struct({"module": p.bytes32, "action": p.uint8, "chainId": p.uint16, "newContract": p.bytes32})),
    registerChain: fun("0xa5799f93", "registerChain(bytes)", {"encodedVM": p.bytes}, ),
    submitRecoverChainId: fun("0x178149e7", "submitRecoverChainId(bytes)", {"encodedVM": p.bytes}, ),
    tokenImplementation: viewFun("0x2f3a3d5d", "tokenImplementation()", {}, p.address),
    transferTokens: fun("0x0f5287b0", "transferTokens(address,uint256,uint16,bytes32,uint256,uint32)", {"token": p.address, "amount": p.uint256, "recipientChain": p.uint16, "recipient": p.bytes32, "arbiterFee": p.uint256, "nonce": p.uint32}, p.uint64),
    transferTokensWithPayload: fun("0xc5a5ebda", "transferTokensWithPayload(address,uint256,uint16,bytes32,uint32,bytes)", {"token": p.address, "amount": p.uint256, "recipientChain": p.uint16, "recipient": p.bytes32, "nonce": p.uint32, "payload": p.bytes}, p.uint64),
    updateWrapped: fun("0xf768441f", "updateWrapped(bytes)", {"encodedVm": p.bytes}, p.address),
    upgrade: fun("0x25394645", "upgrade(bytes)", {"encodedVM": p.bytes}, ),
    wormhole: viewFun("0x84acd1bb", "wormhole()", {}, p.address),
    wrapAndTransferETH: fun("0x9981509f", "wrapAndTransferETH(uint16,bytes32,uint256,uint32)", {"recipientChain": p.uint16, "recipient": p.bytes32, "arbiterFee": p.uint256, "nonce": p.uint32}, p.uint64),
    wrapAndTransferETHWithPayload: fun("0xbee9cdfc", "wrapAndTransferETHWithPayload(uint16,bytes32,uint32,bytes)", {"recipientChain": p.uint16, "recipient": p.bytes32, "nonce": p.uint32, "payload": p.bytes}, p.uint64),
    wrappedAsset: viewFun("0x1ff1e286", "wrappedAsset(uint16,bytes32)", {"tokenChainId": p.uint16, "tokenAddress": p.bytes32}, p.address),
}

export class Contract extends ContractBase {

    WETH() {
        return this.eth_call(functions.WETH, {})
    }

    _parseTransferCommon(encoded: _parseTransferCommonParams["encoded"]) {
        return this.eth_call(functions._parseTransferCommon, {encoded})
    }

    bridgeContracts(chainId_: BridgeContractsParams["chainId_"]) {
        return this.eth_call(functions.bridgeContracts, {chainId_})
    }

    chainId() {
        return this.eth_call(functions.chainId, {})
    }

    encodeAssetMeta(meta: EncodeAssetMetaParams["meta"]) {
        return this.eth_call(functions.encodeAssetMeta, {meta})
    }

    encodeTransfer(transfer: EncodeTransferParams["transfer"]) {
        return this.eth_call(functions.encodeTransfer, {transfer})
    }

    encodeTransferWithPayload(transfer: EncodeTransferWithPayloadParams["transfer"]) {
        return this.eth_call(functions.encodeTransferWithPayload, {transfer})
    }

    evmChainId() {
        return this.eth_call(functions.evmChainId, {})
    }

    finality() {
        return this.eth_call(functions.finality, {})
    }

    governanceActionIsConsumed(hash: GovernanceActionIsConsumedParams["hash"]) {
        return this.eth_call(functions.governanceActionIsConsumed, {hash})
    }

    governanceChainId() {
        return this.eth_call(functions.governanceChainId, {})
    }

    governanceContract() {
        return this.eth_call(functions.governanceContract, {})
    }

    implementation() {
        return this.eth_call(functions.implementation, {})
    }

    isFork() {
        return this.eth_call(functions.isFork, {})
    }

    isInitialized(impl: IsInitializedParams["impl"]) {
        return this.eth_call(functions.isInitialized, {impl})
    }

    isTransferCompleted(hash: IsTransferCompletedParams["hash"]) {
        return this.eth_call(functions.isTransferCompleted, {hash})
    }

    isWrappedAsset(token: IsWrappedAssetParams["token"]) {
        return this.eth_call(functions.isWrappedAsset, {token})
    }

    outstandingBridged(token: OutstandingBridgedParams["token"]) {
        return this.eth_call(functions.outstandingBridged, {token})
    }

    parseAssetMeta(encoded: ParseAssetMetaParams["encoded"]) {
        return this.eth_call(functions.parseAssetMeta, {encoded})
    }

    parsePayloadID(encoded: ParsePayloadIDParams["encoded"]) {
        return this.eth_call(functions.parsePayloadID, {encoded})
    }

    parseRecoverChainId(encodedRecoverChainId: ParseRecoverChainIdParams["encodedRecoverChainId"]) {
        return this.eth_call(functions.parseRecoverChainId, {encodedRecoverChainId})
    }

    parseRegisterChain(encoded: ParseRegisterChainParams["encoded"]) {
        return this.eth_call(functions.parseRegisterChain, {encoded})
    }

    parseTransfer(encoded: ParseTransferParams["encoded"]) {
        return this.eth_call(functions.parseTransfer, {encoded})
    }

    parseTransferWithPayload(encoded: ParseTransferWithPayloadParams["encoded"]) {
        return this.eth_call(functions.parseTransferWithPayload, {encoded})
    }

    parseUpgrade(encoded: ParseUpgradeParams["encoded"]) {
        return this.eth_call(functions.parseUpgrade, {encoded})
    }

    tokenImplementation() {
        return this.eth_call(functions.tokenImplementation, {})
    }

    wormhole() {
        return this.eth_call(functions.wormhole, {})
    }

    wrappedAsset(tokenChainId: WrappedAssetParams["tokenChainId"], tokenAddress: WrappedAssetParams["tokenAddress"]) {
        return this.eth_call(functions.wrappedAsset, {tokenChainId, tokenAddress})
    }
}

/// Event types
export type AdminChangedEventArgs = EParams<typeof events.AdminChanged>
export type BeaconUpgradedEventArgs = EParams<typeof events.BeaconUpgraded>
export type ContractUpgradedEventArgs = EParams<typeof events.ContractUpgraded>
export type TransferRedeemedEventArgs = EParams<typeof events.TransferRedeemed>
export type UpgradedEventArgs = EParams<typeof events.Upgraded>

/// Function types
export type WETHParams = FunctionArguments<typeof functions.WETH>
export type WETHReturn = FunctionReturn<typeof functions.WETH>

export type _parseTransferCommonParams = FunctionArguments<typeof functions._parseTransferCommon>
export type _parseTransferCommonReturn = FunctionReturn<typeof functions._parseTransferCommon>

export type AttestTokenParams = FunctionArguments<typeof functions.attestToken>
export type AttestTokenReturn = FunctionReturn<typeof functions.attestToken>

export type BridgeContractsParams = FunctionArguments<typeof functions.bridgeContracts>
export type BridgeContractsReturn = FunctionReturn<typeof functions.bridgeContracts>

export type ChainIdParams = FunctionArguments<typeof functions.chainId>
export type ChainIdReturn = FunctionReturn<typeof functions.chainId>

export type CompleteTransferParams = FunctionArguments<typeof functions.completeTransfer>
export type CompleteTransferReturn = FunctionReturn<typeof functions.completeTransfer>

export type CompleteTransferAndUnwrapETHParams = FunctionArguments<typeof functions.completeTransferAndUnwrapETH>
export type CompleteTransferAndUnwrapETHReturn = FunctionReturn<typeof functions.completeTransferAndUnwrapETH>

export type CompleteTransferAndUnwrapETHWithPayloadParams = FunctionArguments<typeof functions.completeTransferAndUnwrapETHWithPayload>
export type CompleteTransferAndUnwrapETHWithPayloadReturn = FunctionReturn<typeof functions.completeTransferAndUnwrapETHWithPayload>

export type CompleteTransferWithPayloadParams = FunctionArguments<typeof functions.completeTransferWithPayload>
export type CompleteTransferWithPayloadReturn = FunctionReturn<typeof functions.completeTransferWithPayload>

export type CreateWrappedParams = FunctionArguments<typeof functions.createWrapped>
export type CreateWrappedReturn = FunctionReturn<typeof functions.createWrapped>

export type EncodeAssetMetaParams = FunctionArguments<typeof functions.encodeAssetMeta>
export type EncodeAssetMetaReturn = FunctionReturn<typeof functions.encodeAssetMeta>

export type EncodeTransferParams = FunctionArguments<typeof functions.encodeTransfer>
export type EncodeTransferReturn = FunctionReturn<typeof functions.encodeTransfer>

export type EncodeTransferWithPayloadParams = FunctionArguments<typeof functions.encodeTransferWithPayload>
export type EncodeTransferWithPayloadReturn = FunctionReturn<typeof functions.encodeTransferWithPayload>

export type EvmChainIdParams = FunctionArguments<typeof functions.evmChainId>
export type EvmChainIdReturn = FunctionReturn<typeof functions.evmChainId>

export type FinalityParams = FunctionArguments<typeof functions.finality>
export type FinalityReturn = FunctionReturn<typeof functions.finality>

export type GovernanceActionIsConsumedParams = FunctionArguments<typeof functions.governanceActionIsConsumed>
export type GovernanceActionIsConsumedReturn = FunctionReturn<typeof functions.governanceActionIsConsumed>

export type GovernanceChainIdParams = FunctionArguments<typeof functions.governanceChainId>
export type GovernanceChainIdReturn = FunctionReturn<typeof functions.governanceChainId>

export type GovernanceContractParams = FunctionArguments<typeof functions.governanceContract>
export type GovernanceContractReturn = FunctionReturn<typeof functions.governanceContract>

export type ImplementationParams = FunctionArguments<typeof functions.implementation>
export type ImplementationReturn = FunctionReturn<typeof functions.implementation>

export type InitializeParams = FunctionArguments<typeof functions.initialize>
export type InitializeReturn = FunctionReturn<typeof functions.initialize>

export type IsForkParams = FunctionArguments<typeof functions.isFork>
export type IsForkReturn = FunctionReturn<typeof functions.isFork>

export type IsInitializedParams = FunctionArguments<typeof functions.isInitialized>
export type IsInitializedReturn = FunctionReturn<typeof functions.isInitialized>

export type IsTransferCompletedParams = FunctionArguments<typeof functions.isTransferCompleted>
export type IsTransferCompletedReturn = FunctionReturn<typeof functions.isTransferCompleted>

export type IsWrappedAssetParams = FunctionArguments<typeof functions.isWrappedAsset>
export type IsWrappedAssetReturn = FunctionReturn<typeof functions.isWrappedAsset>

export type OutstandingBridgedParams = FunctionArguments<typeof functions.outstandingBridged>
export type OutstandingBridgedReturn = FunctionReturn<typeof functions.outstandingBridged>

export type ParseAssetMetaParams = FunctionArguments<typeof functions.parseAssetMeta>
export type ParseAssetMetaReturn = FunctionReturn<typeof functions.parseAssetMeta>

export type ParsePayloadIDParams = FunctionArguments<typeof functions.parsePayloadID>
export type ParsePayloadIDReturn = FunctionReturn<typeof functions.parsePayloadID>

export type ParseRecoverChainIdParams = FunctionArguments<typeof functions.parseRecoverChainId>
export type ParseRecoverChainIdReturn = FunctionReturn<typeof functions.parseRecoverChainId>

export type ParseRegisterChainParams = FunctionArguments<typeof functions.parseRegisterChain>
export type ParseRegisterChainReturn = FunctionReturn<typeof functions.parseRegisterChain>

export type ParseTransferParams = FunctionArguments<typeof functions.parseTransfer>
export type ParseTransferReturn = FunctionReturn<typeof functions.parseTransfer>

export type ParseTransferWithPayloadParams = FunctionArguments<typeof functions.parseTransferWithPayload>
export type ParseTransferWithPayloadReturn = FunctionReturn<typeof functions.parseTransferWithPayload>

export type ParseUpgradeParams = FunctionArguments<typeof functions.parseUpgrade>
export type ParseUpgradeReturn = FunctionReturn<typeof functions.parseUpgrade>

export type RegisterChainParams = FunctionArguments<typeof functions.registerChain>
export type RegisterChainReturn = FunctionReturn<typeof functions.registerChain>

export type SubmitRecoverChainIdParams = FunctionArguments<typeof functions.submitRecoverChainId>
export type SubmitRecoverChainIdReturn = FunctionReturn<typeof functions.submitRecoverChainId>

export type TokenImplementationParams = FunctionArguments<typeof functions.tokenImplementation>
export type TokenImplementationReturn = FunctionReturn<typeof functions.tokenImplementation>

export type TransferTokensParams = FunctionArguments<typeof functions.transferTokens>
export type TransferTokensReturn = FunctionReturn<typeof functions.transferTokens>

export type TransferTokensWithPayloadParams = FunctionArguments<typeof functions.transferTokensWithPayload>
export type TransferTokensWithPayloadReturn = FunctionReturn<typeof functions.transferTokensWithPayload>

export type UpdateWrappedParams = FunctionArguments<typeof functions.updateWrapped>
export type UpdateWrappedReturn = FunctionReturn<typeof functions.updateWrapped>

export type UpgradeParams = FunctionArguments<typeof functions.upgrade>
export type UpgradeReturn = FunctionReturn<typeof functions.upgrade>

export type WormholeParams = FunctionArguments<typeof functions.wormhole>
export type WormholeReturn = FunctionReturn<typeof functions.wormhole>

export type WrapAndTransferETHParams = FunctionArguments<typeof functions.wrapAndTransferETH>
export type WrapAndTransferETHReturn = FunctionReturn<typeof functions.wrapAndTransferETH>

export type WrapAndTransferETHWithPayloadParams = FunctionArguments<typeof functions.wrapAndTransferETHWithPayload>
export type WrapAndTransferETHWithPayloadReturn = FunctionReturn<typeof functions.wrapAndTransferETHWithPayload>

export type WrappedAssetParams = FunctionArguments<typeof functions.wrappedAsset>
export type WrappedAssetReturn = FunctionReturn<typeof functions.wrappedAsset>

