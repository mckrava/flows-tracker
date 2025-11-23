import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    AdminChanged: event("0x7e644d79422f17c01e4894b5f4f588d331ebfa28653d42ae832dc59e38c9798f", "AdminChanged(address,address)", {"previousAdmin": p.address, "newAdmin": p.address}),
    BeaconUpgraded: event("0x1cf3b03a6cf19fa2baba4df148e9dcabedea7f8a5c07840e207e5c089be95d3e", "BeaconUpgraded(address)", {"beacon": indexed(p.address)}),
    ContractUpgraded: event("0x2e4cc16c100f0b55e2df82ab0b1a7e294aa9cbd01b48fbaf622683fbc0507a49", "ContractUpgraded(address,address)", {"oldContract": indexed(p.address), "newContract": indexed(p.address)}),
    GuardianSetAdded: event("0x2384dbc52f7b617fb7c5aa71e5455a21ff21d58604bb6daef6af2bb44aadebdd", "GuardianSetAdded(uint32)", {"index": indexed(p.uint32)}),
    LogMessagePublished: event("0x6eb224fb001ed210e379b335e35efe88672a8ce935d981a6896b27ffdf52a3b2", "LogMessagePublished(address,uint64,uint32,bytes,uint8)", {"sender": indexed(p.address), "sequence": p.uint64, "nonce": p.uint32, "payload": p.bytes, "consistencyLevel": p.uint8}),
    Upgraded: event("0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b", "Upgraded(address)", {"implementation": indexed(p.address)}),
}

export const functions = {
    chainId: viewFun("0x9a8a0592", "chainId()", {}, p.uint16),
    evmChainId: viewFun("0x64d42b17", "evmChainId()", {}, p.uint256),
    getCurrentGuardianSetIndex: viewFun("0x1cfe7951", "getCurrentGuardianSetIndex()", {}, p.uint32),
    getGuardianSet: viewFun("0xf951975a", "getGuardianSet(uint32)", {"index": p.uint32}, p.struct({"keys": p.array(p.address), "expirationTime": p.uint32})),
    getGuardianSetExpiry: viewFun("0xeb8d3f12", "getGuardianSetExpiry()", {}, p.uint32),
    governanceActionIsConsumed: viewFun("0x2c3c02a4", "governanceActionIsConsumed(bytes32)", {"hash": p.bytes32}, p.bool),
    governanceChainId: viewFun("0xfbe3c2cd", "governanceChainId()", {}, p.uint16),
    governanceContract: viewFun("0xb172b222", "governanceContract()", {}, p.bytes32),
    initialize: fun("0x8129fc1c", "initialize()", {}, ),
    isFork: viewFun("0xe039f224", "isFork()", {}, p.bool),
    isInitialized: viewFun("0xd60b347f", "isInitialized(address)", {"impl": p.address}, p.bool),
    messageFee: viewFun("0x1a90a219", "messageFee()", {}, p.uint256),
    nextSequence: viewFun("0x4cf842b5", "nextSequence(address)", {"emitter": p.address}, p.uint64),
    parseAndVerifyVM: viewFun("0xc0fd8bde", "parseAndVerifyVM(bytes)", {"encodedVM": p.bytes}, {"vm": p.struct({"version": p.uint8, "timestamp": p.uint32, "nonce": p.uint32, "emitterChainId": p.uint16, "emitterAddress": p.bytes32, "sequence": p.uint64, "consistencyLevel": p.uint8, "payload": p.bytes, "guardianSetIndex": p.uint32, "signatures": p.array(p.struct({"r": p.bytes32, "s": p.bytes32, "v": p.uint8, "guardianIndex": p.uint8})), "hash": p.bytes32}), "valid": p.bool, "reason": p.string}),
    parseContractUpgrade: viewFun("0x4fdc60fa", "parseContractUpgrade(bytes)", {"encodedUpgrade": p.bytes}, p.struct({"module": p.bytes32, "action": p.uint8, "chain": p.uint16, "newContract": p.address})),
    parseGuardianSetUpgrade: viewFun("0x04ca84cf", "parseGuardianSetUpgrade(bytes)", {"encodedUpgrade": p.bytes}, p.struct({"module": p.bytes32, "action": p.uint8, "chain": p.uint16, "newGuardianSet": p.struct({"keys": p.array(p.address), "expirationTime": p.uint32}), "newGuardianSetIndex": p.uint32})),
    parseRecoverChainId: viewFun("0xcb4cfea8", "parseRecoverChainId(bytes)", {"encodedRecoverChainId": p.bytes}, p.struct({"module": p.bytes32, "action": p.uint8, "evmChainId": p.uint256, "newChainId": p.uint16})),
    parseSetMessageFee: viewFun("0x515f3247", "parseSetMessageFee(bytes)", {"encodedSetMessageFee": p.bytes}, p.struct({"module": p.bytes32, "action": p.uint8, "chain": p.uint16, "messageFee": p.uint256})),
    parseTransferFees: viewFun("0x0319e59c", "parseTransferFees(bytes)", {"encodedTransferFees": p.bytes}, p.struct({"module": p.bytes32, "action": p.uint8, "chain": p.uint16, "amount": p.uint256, "recipient": p.bytes32})),
    parseVM: viewFun("0xa9e11893", "parseVM(bytes)", {"encodedVM": p.bytes}, p.struct({"version": p.uint8, "timestamp": p.uint32, "nonce": p.uint32, "emitterChainId": p.uint16, "emitterAddress": p.bytes32, "sequence": p.uint64, "consistencyLevel": p.uint8, "payload": p.bytes, "guardianSetIndex": p.uint32, "signatures": p.array(p.struct({"r": p.bytes32, "s": p.bytes32, "v": p.uint8, "guardianIndex": p.uint8})), "hash": p.bytes32})),
    publishMessage: fun("0xb19a437e", "publishMessage(uint32,bytes,uint8)", {"nonce": p.uint32, "payload": p.bytes, "consistencyLevel": p.uint8}, p.uint64),
    quorum: viewFun("0xf8ce560a", "quorum(uint256)", {"numGuardians": p.uint256}, p.uint256),
    submitContractUpgrade: fun("0x5cb8cae2", "submitContractUpgrade(bytes)", {"_vm": p.bytes}, ),
    submitNewGuardianSet: fun("0x6606b4e0", "submitNewGuardianSet(bytes)", {"_vm": p.bytes}, ),
    submitRecoverChainId: fun("0x178149e7", "submitRecoverChainId(bytes)", {"_vm": p.bytes}, ),
    submitSetMessageFee: fun("0xf42bc641", "submitSetMessageFee(bytes)", {"_vm": p.bytes}, ),
    submitTransferFees: fun("0x93df337e", "submitTransferFees(bytes)", {"_vm": p.bytes}, ),
    verifySignatures: viewFun("0xa0cce1b3", "verifySignatures(bytes32,(bytes32,bytes32,uint8,uint8)[],(address[],uint32))", {"hash": p.bytes32, "signatures": p.array(p.struct({"r": p.bytes32, "s": p.bytes32, "v": p.uint8, "guardianIndex": p.uint8})), "guardianSet": p.struct({"keys": p.array(p.address), "expirationTime": p.uint32})}, {"valid": p.bool, "reason": p.string}),
    verifyVM: viewFun("0x875be02a", "verifyVM((uint8,uint32,uint32,uint16,bytes32,uint64,uint8,bytes,uint32,(bytes32,bytes32,uint8,uint8)[],bytes32))", {"vm": p.struct({"version": p.uint8, "timestamp": p.uint32, "nonce": p.uint32, "emitterChainId": p.uint16, "emitterAddress": p.bytes32, "sequence": p.uint64, "consistencyLevel": p.uint8, "payload": p.bytes, "guardianSetIndex": p.uint32, "signatures": p.array(p.struct({"r": p.bytes32, "s": p.bytes32, "v": p.uint8, "guardianIndex": p.uint8})), "hash": p.bytes32})}, {"valid": p.bool, "reason": p.string}),
}

export class Contract extends ContractBase {

    chainId() {
        return this.eth_call(functions.chainId, {})
    }

    evmChainId() {
        return this.eth_call(functions.evmChainId, {})
    }

    getCurrentGuardianSetIndex() {
        return this.eth_call(functions.getCurrentGuardianSetIndex, {})
    }

    getGuardianSet(index: GetGuardianSetParams["index"]) {
        return this.eth_call(functions.getGuardianSet, {index})
    }

    getGuardianSetExpiry() {
        return this.eth_call(functions.getGuardianSetExpiry, {})
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

    isFork() {
        return this.eth_call(functions.isFork, {})
    }

    isInitialized(impl: IsInitializedParams["impl"]) {
        return this.eth_call(functions.isInitialized, {impl})
    }

    messageFee() {
        return this.eth_call(functions.messageFee, {})
    }

    nextSequence(emitter: NextSequenceParams["emitter"]) {
        return this.eth_call(functions.nextSequence, {emitter})
    }

    parseAndVerifyVM(encodedVM: ParseAndVerifyVMParams["encodedVM"]) {
        return this.eth_call(functions.parseAndVerifyVM, {encodedVM})
    }

    parseContractUpgrade(encodedUpgrade: ParseContractUpgradeParams["encodedUpgrade"]) {
        return this.eth_call(functions.parseContractUpgrade, {encodedUpgrade})
    }

    parseGuardianSetUpgrade(encodedUpgrade: ParseGuardianSetUpgradeParams["encodedUpgrade"]) {
        return this.eth_call(functions.parseGuardianSetUpgrade, {encodedUpgrade})
    }

    parseRecoverChainId(encodedRecoverChainId: ParseRecoverChainIdParams["encodedRecoverChainId"]) {
        return this.eth_call(functions.parseRecoverChainId, {encodedRecoverChainId})
    }

    parseSetMessageFee(encodedSetMessageFee: ParseSetMessageFeeParams["encodedSetMessageFee"]) {
        return this.eth_call(functions.parseSetMessageFee, {encodedSetMessageFee})
    }

    parseTransferFees(encodedTransferFees: ParseTransferFeesParams["encodedTransferFees"]) {
        return this.eth_call(functions.parseTransferFees, {encodedTransferFees})
    }

    parseVM(encodedVM: ParseVMParams["encodedVM"]) {
        return this.eth_call(functions.parseVM, {encodedVM})
    }

    quorum(numGuardians: QuorumParams["numGuardians"]) {
        return this.eth_call(functions.quorum, {numGuardians})
    }

    verifySignatures(hash: VerifySignaturesParams["hash"], signatures: VerifySignaturesParams["signatures"], guardianSet: VerifySignaturesParams["guardianSet"]) {
        return this.eth_call(functions.verifySignatures, {hash, signatures, guardianSet})
    }

    verifyVM(vm: VerifyVMParams["vm"]) {
        return this.eth_call(functions.verifyVM, {vm})
    }
}

/// Event types
export type AdminChangedEventArgs = EParams<typeof events.AdminChanged>
export type BeaconUpgradedEventArgs = EParams<typeof events.BeaconUpgraded>
export type ContractUpgradedEventArgs = EParams<typeof events.ContractUpgraded>
export type GuardianSetAddedEventArgs = EParams<typeof events.GuardianSetAdded>
export type LogMessagePublishedEventArgs = EParams<typeof events.LogMessagePublished>
export type UpgradedEventArgs = EParams<typeof events.Upgraded>

/// Function types
export type ChainIdParams = FunctionArguments<typeof functions.chainId>
export type ChainIdReturn = FunctionReturn<typeof functions.chainId>

export type EvmChainIdParams = FunctionArguments<typeof functions.evmChainId>
export type EvmChainIdReturn = FunctionReturn<typeof functions.evmChainId>

export type GetCurrentGuardianSetIndexParams = FunctionArguments<typeof functions.getCurrentGuardianSetIndex>
export type GetCurrentGuardianSetIndexReturn = FunctionReturn<typeof functions.getCurrentGuardianSetIndex>

export type GetGuardianSetParams = FunctionArguments<typeof functions.getGuardianSet>
export type GetGuardianSetReturn = FunctionReturn<typeof functions.getGuardianSet>

export type GetGuardianSetExpiryParams = FunctionArguments<typeof functions.getGuardianSetExpiry>
export type GetGuardianSetExpiryReturn = FunctionReturn<typeof functions.getGuardianSetExpiry>

export type GovernanceActionIsConsumedParams = FunctionArguments<typeof functions.governanceActionIsConsumed>
export type GovernanceActionIsConsumedReturn = FunctionReturn<typeof functions.governanceActionIsConsumed>

export type GovernanceChainIdParams = FunctionArguments<typeof functions.governanceChainId>
export type GovernanceChainIdReturn = FunctionReturn<typeof functions.governanceChainId>

export type GovernanceContractParams = FunctionArguments<typeof functions.governanceContract>
export type GovernanceContractReturn = FunctionReturn<typeof functions.governanceContract>

export type InitializeParams = FunctionArguments<typeof functions.initialize>
export type InitializeReturn = FunctionReturn<typeof functions.initialize>

export type IsForkParams = FunctionArguments<typeof functions.isFork>
export type IsForkReturn = FunctionReturn<typeof functions.isFork>

export type IsInitializedParams = FunctionArguments<typeof functions.isInitialized>
export type IsInitializedReturn = FunctionReturn<typeof functions.isInitialized>

export type MessageFeeParams = FunctionArguments<typeof functions.messageFee>
export type MessageFeeReturn = FunctionReturn<typeof functions.messageFee>

export type NextSequenceParams = FunctionArguments<typeof functions.nextSequence>
export type NextSequenceReturn = FunctionReturn<typeof functions.nextSequence>

export type ParseAndVerifyVMParams = FunctionArguments<typeof functions.parseAndVerifyVM>
export type ParseAndVerifyVMReturn = FunctionReturn<typeof functions.parseAndVerifyVM>

export type ParseContractUpgradeParams = FunctionArguments<typeof functions.parseContractUpgrade>
export type ParseContractUpgradeReturn = FunctionReturn<typeof functions.parseContractUpgrade>

export type ParseGuardianSetUpgradeParams = FunctionArguments<typeof functions.parseGuardianSetUpgrade>
export type ParseGuardianSetUpgradeReturn = FunctionReturn<typeof functions.parseGuardianSetUpgrade>

export type ParseRecoverChainIdParams = FunctionArguments<typeof functions.parseRecoverChainId>
export type ParseRecoverChainIdReturn = FunctionReturn<typeof functions.parseRecoverChainId>

export type ParseSetMessageFeeParams = FunctionArguments<typeof functions.parseSetMessageFee>
export type ParseSetMessageFeeReturn = FunctionReturn<typeof functions.parseSetMessageFee>

export type ParseTransferFeesParams = FunctionArguments<typeof functions.parseTransferFees>
export type ParseTransferFeesReturn = FunctionReturn<typeof functions.parseTransferFees>

export type ParseVMParams = FunctionArguments<typeof functions.parseVM>
export type ParseVMReturn = FunctionReturn<typeof functions.parseVM>

export type PublishMessageParams = FunctionArguments<typeof functions.publishMessage>
export type PublishMessageReturn = FunctionReturn<typeof functions.publishMessage>

export type QuorumParams = FunctionArguments<typeof functions.quorum>
export type QuorumReturn = FunctionReturn<typeof functions.quorum>

export type SubmitContractUpgradeParams = FunctionArguments<typeof functions.submitContractUpgrade>
export type SubmitContractUpgradeReturn = FunctionReturn<typeof functions.submitContractUpgrade>

export type SubmitNewGuardianSetParams = FunctionArguments<typeof functions.submitNewGuardianSet>
export type SubmitNewGuardianSetReturn = FunctionReturn<typeof functions.submitNewGuardianSet>

export type SubmitRecoverChainIdParams = FunctionArguments<typeof functions.submitRecoverChainId>
export type SubmitRecoverChainIdReturn = FunctionReturn<typeof functions.submitRecoverChainId>

export type SubmitSetMessageFeeParams = FunctionArguments<typeof functions.submitSetMessageFee>
export type SubmitSetMessageFeeReturn = FunctionReturn<typeof functions.submitSetMessageFee>

export type SubmitTransferFeesParams = FunctionArguments<typeof functions.submitTransferFees>
export type SubmitTransferFeesReturn = FunctionReturn<typeof functions.submitTransferFees>

export type VerifySignaturesParams = FunctionArguments<typeof functions.verifySignatures>
export type VerifySignaturesReturn = FunctionReturn<typeof functions.verifySignatures>

export type VerifyVMParams = FunctionArguments<typeof functions.verifyVM>
export type VerifyVMReturn = FunctionReturn<typeof functions.verifyVM>

