import { TransactionPayload } from '@elrondnetwork/erdjs/out';
import axios from 'axios';
import { networkConfigSelector } from 'redux/selectors';
import { store } from 'redux/store';
import { SmartContractResult, TransactionServerStatusesEnum } from 'types';

export type GetTransactionsByHashesReturnType = {
  hash: string;
  invalidTransaction: boolean;
  status: TransactionServerStatusesEnum;
  results: SmartContractResult[];
  sender: string;
  receiver: string;
  data: string;
  previousStatus: string;
  hasStatusChanged: boolean;
}[];

export type PendingTransactionsType = {
  hash: string;
  previousStatus: string;
}[];

export async function getTransactionsByHashes(
  pendingTransactions: PendingTransactionsType
): Promise<GetTransactionsByHashesReturnType> {
  const networkConfig = networkConfigSelector(store.getState());
  const hashes = pendingTransactions.map((tx) => tx.hash);
  const { data: responseData } = await axios.get(
    `${networkConfig.network.apiAddress}/transactions`,
    {
      params: {
        hashes: hashes.join(','),
        withScResults: true
      }
    }
  );
  return pendingTransactions.map(({ hash, previousStatus }) => {
    const txOnNetwork = responseData.find(
      (txResponse: any) => txResponse.txHash === hash
    );
    const data = TransactionPayload.fromEncoded(txOnNetwork?.data).toString();

    return {
      hash,
      data,
      invalidTransaction: txOnNetwork == null,
      status: txOnNetwork.status,
      results: txOnNetwork.results,
      sender: txOnNetwork.sender,
      receiver: txOnNetwork?.receiver,
      previousStatus,
      hasStatusChanged: status !== previousStatus
    };
  });
}
