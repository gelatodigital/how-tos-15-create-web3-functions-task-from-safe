
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

### Propose transaction
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

### Confirm transaction
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
### Execute transaction
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
