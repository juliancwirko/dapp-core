import React from 'react';
import { Address } from '@elrondnetwork/erdjs/out';
import { useGetNetworkConfig } from 'hooks';
import useGetTokenDetails from 'hooks/transactions/useGetTokenDetails';

import icons from 'optionalPackages/fortawesome-free-solid-svg-icons';
import PageState from 'UI/PageState';
import TokenDetails from 'UI/TokenDetails';
import TransactionData from 'UI/TransactionData';
import {
  denominate,
  getEgldLabel,
  getGeneratedClasses,
  isTokenTransfer
} from 'utils';

export interface SignStepType {
  onSignTransaction: () => void;
  onPrev: () => void;
  handleClose: () => void;
  waitingForDevice: boolean;
  error: string | null;
  callbackRoute?: string;
  title?: string;
  currentStep: number;
  currentTransaction: any;
  isLastTransaction: boolean;
  className: string;
}

const SignStep = ({
  onSignTransaction,
  handleClose,
  onPrev,
  title = 'Confirm on Ledger',
  waitingForDevice,
  currentTransaction,
  error,
  isLastTransaction,
  currentStep,
  className
}: SignStepType) => {
  const egldLabel = getEgldLabel();
  const transactionData = currentTransaction.transaction.getData().toString();
  const { network } = useGetNetworkConfig();

  const { tokenId, amount, type, multiTxData, receiver } =
    currentTransaction.transactionTokenInfo;

  const isTokenTransaction = Boolean(
    tokenId && isTokenTransfer({ tokenId, erdLabel: egldLabel })
  );

  const onCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFirst) {
      handleClose();
    } else {
      onPrev();
    }
  };

  const continueWithoutSigning =
    type && multiTxData && !transactionData.endsWith(multiTxData);

  let signBtnLabel = 'Sign & Continue';
  signBtnLabel = waitingForDevice ? 'Check your Ledger' : signBtnLabel;
  signBtnLabel =
    isLastTransaction && !waitingForDevice ? 'Sign & Submit' : signBtnLabel;
  signBtnLabel = continueWithoutSigning ? 'Continue' : signBtnLabel;

  const isFirst = currentStep === 0;

  const { tokenDenomination } = useGetTokenDetails({
    tokenId: currentTransaction.transactionTokenInfo.tokenId
  });

  const denominatedAmount = denominate({
    input: isTokenTransaction
      ? amount
      : currentTransaction.transaction.getValue().toString(),
    denomination: isTokenTransaction
      ? tokenDenomination
      : Number(network.egldDenomination),
    decimals: Number(network.decimals),
    showLastNonZeroDecimal: false,
    addCommas: true
  });

  const classes = getGeneratedClasses(className, true, {
    formGroup: 'form-group text-left',
    formLabel: 'form-label text-secondary',
    icon: 'text-white',
    contentWrapper:
      'd-flex flex-column justify-content-start flex-md-row justify-content-md-between mb-3',
    tokenWrapper: 'mb-3 mb-md-0 d-flex flex-column align-items-start',
    tokenLabel: 'text-secondary text-left',
    tokenValue: 'd-flex align-items-center mt-1',
    tokenAmountLabel: 'text-secondary text-left',
    tokenAmountValue: 'd-flex align-items-center',
    dataFormGroup: 'form-group text-left',
    errorMessage:
      'text-danger d-flex justify-content-center align-items-center',
    buttonsWrapper: 'd-flex align-items-center justify-content-end mt-spacer',
    cancelButton: 'btn btn-dark text-white flex-even mr-2',
    signButton: 'btn btn-primary flex-even ml-2'
  });

  return (
    <PageState
      icon={error ? icons.faTimes : icons.faHourglass}
      iconClass={classes.icon}
      iconBgClass={error ? 'bg-danger' : 'bg-warning'}
      iconSize='3x'
      className={className}
      title={title}
      description={
        <React.Fragment>
          {currentTransaction.transaction && (
            <React.Fragment>
              <div className={classes.formGroup} data-testid='transactionTitle'>
                <div className={classes.formLabel}>To: </div>
                {multiTxData
                  ? new Address(receiver).bech32()
                  : currentTransaction.transaction.getReceiver().toString()}
              </div>

              <div className={classes.contentWrapper}>
                <div className={classes.tokenWrapper}>
                  <div className={classes.tokenlabel}>Token</div>
                  <div className={classes.tokenValue}>
                    <TokenDetails.Icon token={tokenId || egldLabel} />
                    <div className='mr-1'></div>
                    <TokenDetails.Label token={tokenId || egldLabel} />
                  </div>
                </div>
                <div>
                  <div className={classes.tokenAmountLabel}>Amount</div>
                  <div className={classes.tokenAmountValue}>
                    <div className='mr-1'>{denominatedAmount}</div>
                    <TokenDetails.Symbol token={tokenId || egldLabel} />
                  </div>
                </div>
              </div>

              <div className={classes.dataFormGroup}>
                {currentTransaction.transaction.getData() && (
                  <TransactionData
                    {...{
                      data: currentTransaction.transaction.getData().toString(),
                      highlight: multiTxData,
                      isScCall: !tokenId
                    }}
                  />
                )}
              </div>
              {error && <p className={classes.errorMessage}>{error}</p>}
            </React.Fragment>
          )}
        </React.Fragment>
      }
      action={
        <div className={classes.buttonsWrapper}>
          <button
            id='closeButton'
            data-testid='closeButton'
            onClick={onCloseClick}
            className={classes.cancelButton}
          >
            {isFirst ? 'Cancel' : 'Back'}
          </button>

          <button
            type='button'
            className={classes.signButton}
            id='signBtn'
            data-testid='signBtn'
            onClick={onSignTransaction}
            disabled={waitingForDevice}
          >
            {signBtnLabel}
          </button>
        </div>
      }
    />
  );
};

export default SignStep;
