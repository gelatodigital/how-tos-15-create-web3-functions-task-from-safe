
# HOW TOs #14 Create Gelato Web3 Functions programmatically
This repo shows how to create Gelato Web3 Functions tasks programmatically from an EOA and from a SAFE.

## EOA Creator 
This is straightforward forward we will use the automate sdk to create and cancel the tasks.

### Create Task

```typescript
const cid="QmSBdgzCUYcpwAWQPZc4oFn1zYwb4LovCXMPyrHUncBQ7S" 
  const { taskId, tx } = await automate.createBatchExecTask({
    name: "Heartbeat 30 sec",
    web3FunctionHash: cid,
    web3FunctionArgs: { 
    //   "arg1":"value",
    },
    trigger: {
      interval: 30 * 1000,
      type: TriggerType.TIME
    },
  });
```
Code [here](./scripts/eoa/create-task.ts)

### Cancel Task
```typescript
  const automate = new AutomateSDK(chainId, deployer);
  const taskId = "0xc35e11031c59558b2c4a9c35d9ab23fb4feae7f3e9f5fac689d95bdc9cb0d77d"
  const { tx } = await automate.cancelTask(taskId)
```
Code [here](./scripts/eoa/cancel-task.ts)


## Safe Creator
In order to crete tasks from a safe we will need to use the Safe Transaction Service API.
We will instantiate Apikit following:
```typescript
   const txServiceUrl = 'https://safe-transaction-sepolia.safe.global' 
   const service = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapter })
```
The custom txServiceUrl is for Sepolia, for other networks please visit [here]("https://docs.safe.global/core-api/transaction-service-supported-networks")

For creating or cancelling the task we will follow a similar process:
- Propose tx
- Confirm tx (sent by all required signers);
- Execute tx 

### Create Task

#### Propose transaction
```typescript
  const automate = new AutomateSDK(chainId, deployer);
  const cid="QmSBdgzCUYcpwAWQPZc4oFn1zYwb4LovCXMPyrHUncBQ7S"
  const { taskId, tx } = await automate.prepareBatchExecTask({
    name: "heartbeat",
    web3FunctionHash: cid,
    web3FunctionArgs: { 
      // "arg1":"value",
    },
    trigger: {
      interval: 30 * 1000,
      type: TriggerType.TIME,
    },
  },
  {},
  safeAddress // important to pass the safe address as task creator
);


```
Code [here](./scripts/safe/create-task/propose-create.ts)

```shell
$ npx hardhat run ./scripts/safe/create-task/propose-create.ts
```

Results
```shell
{ predictedSafeAddress: '0x6b594E0eD457654FD3F129de134d343ab3bf8957' }
{ isSafeDeployed: true }
Proposed a transaction with Safe: 0x6b594E0eD457654FD3F129de134d343ab3bf8957
- safeTxHash: 0x72fd3bf3cc4f1040daace6f2c5c2990e0aedaaa6aef9f4dbdd55aad64ecff875
- Sender: 0x903918bB1903714E0518Ea2122aCeBfa27f11b6F
- Sender signature: 0xf7b5e057d2720ebbb5792da973c48194f0df6fde2b9e1334e2556dec8cc28b51505b287bb76587143ac23d6ac5b45cca98dbac3a7c8d7d4c94e255d9d871b1f21f
- TaskId: 0x6314532f55943780432bd60d1c2a25313db5c9ecf3662f93b6ee2c6b2e69bcb1
✨  Done in 9.11s.
```

#### Confirm transaction
Every required signer has to confirm the transaction, this can be done programatically as shown below or in the safe UI

We will need to grab the SafeTxHash from previous script and run
```shell
- safeTxHash: 0x72fd3bf3cc4f1040daace6f2c5c2990e0aedaaa6aef9f4dbdd55aad64ecff875
```
Code [here](./scripts/safe/create-task/confirm-create.ts)

```shell
$ npx hardhat run ./scripts/safe/create-task/confirm-create.ts
```
Results:
```shell
{ predictedSafeAddress: '0x6b594E0eD457654FD3F129de134d343ab3bf8957' }
{ isSafeDeployed: true }
Confirmed a transaction with Safe: 0x6b594E0eD457654FD3F129de134d343ab3bf8957
- safeTxHash: 0x72fd3bf3cc4f1040daace6f2c5c2990e0aedaaa6aef9f4dbdd55aad64ecff875
- Sender: 0x903918bB1903714E0518Ea2122aCeBfa27f11b6F
- Sender signature: 0xf7b5e057d2720ebbb5792da973c48194f0df6fde2b9e1334e2556dec8cc28b51505b287bb76587143ac23d6ac5b45cca98dbac3a7c8d7d4c94e255d9d871b1f21f
✨  Done in 5.96s.
```
#### Execute transaction
Once all signatures have been confirmed we are ready to execute. We will need here also to pass the txHash

Code [here](./scripts/safe/create-task/execute-create.ts)

```shell
$ npx hardhat run ./scripts/safe/create-task/execute-create.ts
```
Results:
```shell
{ predictedSafeAddress: '0x6b594E0eD457654FD3F129de134d343ab3bf8957' }
{ isSafeDeployed: true }
Confirmed a transaction with Safe: 0x6b594E0eD457654FD3F129de134d343ab3bf8957
- txHash:  0xdee0a7b4d3f2ae3d163fee82c545ea76151b9ad2138f91af55edc0b310bc8b3a
✨  Done in 22.49s.
```

### Cancel Task
In order to cancel the task we will require the TaskId and the process will be the same: propose, confirm and cancel.

When proposing the the tx in this case the payload is:
```typescript
  const automate = new AutomateSDK(chainId, deployer);
   const taskId= "0x6314532f55943780432bd60d1c2a25313db5c9ecf3662f93b6ee2c6b2e69bcb1"
  const {tx} = await automate.prepareCancelTask(taskId)
```

```shell
$ npx hardhat run ./scripts/safe/create-task/propose-cancel.ts
```

```shell
$ npx hardhat run ./scripts/safe/create-task/confirm-cancel.ts
```

```shell
$ npx hardhat run ./scripts/safe/create-task/execute-cancel.ts
```

## 1Balance Withdrawal from Safe (Polygon)

The withdrawal process from Gelato 1Balance consists of two on-chain transactions with an off-chain settlement step in between.

> **Important:** Update the `safeAddress` in [./scripts/safe/safe.ts](./scripts/safe/safe.ts) to your Safe address on Polygon before running these scripts.  
> Update `withdrawalAmount` in the propose scripts to the amount you wish to withdraw (USDC has 6 decimals, e.g. `10000000` = 10 USDC).

**Contract:** [Gelato1Balance on Polygon](https://polygonscan.com/address/0x7506c12a824d73d9b08564d5afc22c949434755e#writeProxyContract)  
**Token:** USDC (`0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`)

### Step 1: Initiate Withdrawal

This submits a `requestWithdrawal` transaction to the 1Balance contract, signaling your intent to withdraw.

#### Propose
```shell
$ yarn withdrawal:propose-initiate
```
Code [here](./scripts/safe/withdrawal/propose-initiate.ts)

#### Confirm
Grab the `safeTxHash` from the propose output and paste it into [confirm-withdrawal.ts](./scripts/safe/withdrawal/confirm-withdrawal.ts).

```shell
$ yarn withdrawal:confirm
```

#### Execute
Paste the same `safeTxHash` into [execute-withdrawal.ts](./scripts/safe/withdrawal/execute-withdrawal.ts).

```shell
$ yarn withdrawal:execute
```

### Step 2: Wait for Settlement (Off-chain)

After the `requestWithdrawal` transaction is confirmed on-chain, the Gelato backend needs to process and settle the request. **This can take several hours.**

During settlement, Gelato's backend:
1. Detects the `LogRequestWithdrawal` event emitted by the contract.
2. Validates the withdrawal amount against your deposited balance.
3. Updates the Merkle tree to include your withdrawal allocation.
4. Settles a new Merkle root on-chain via the `settle` function.

You can check if settlement is complete by querying:
```
https://api.gelato.digital/1balance/networks/mainnets/sponsors/<your-safe-address>
```

Look for `_totalValidRequestedWithdrawAmount` in the response. Once this value is greater than `0`, your withdrawal is settled and ready to finalize.

### Step 3: Finalize Withdrawal

The finalize script automatically handles the off-chain steps before proposing the on-chain `withdraw` transaction:

1. **Checks settlement status** - Queries the Gelato API to verify `_totalValidRequestedWithdrawAmount > 0`. If not yet settled, it exits with a message to retry later.
2. **Fetches Merkle Proof** - Retrieves the `_merkleProof` from:
   ```
   https://api.gelato.digital/1balance/networks/137/tokens/<usdc-address>/sponsors/<your-safe-address>/proof
   ```
   The proof cryptographically validates your withdrawal against the current Merkle root stored in the contract.
3. **Proposes the withdraw transaction** - Encodes a call to the contract's `withdraw` function with `_token`, `_amount`, `_totalValidRequestedWithdrawAmount`, and `_merkleProof`, then proposes it through the Safe.

#### Propose
```shell
$ yarn withdrawal:propose-finalize
```
Code [here](./scripts/safe/withdrawal/propose-finalize.ts)

#### Confirm
Grab the `safeTxHash` from the propose output and paste it into [confirm-withdrawal.ts](./scripts/safe/withdrawal/confirm-withdrawal.ts).

```shell
$ yarn withdrawal:confirm
```

#### Execute
Paste the same `safeTxHash` into [execute-withdrawal.ts](./scripts/safe/withdrawal/execute-withdrawal.ts).

```shell
$ yarn withdrawal:execute
```

Once the transaction is confirmed, your USDC funds will be transferred to the Safe.
