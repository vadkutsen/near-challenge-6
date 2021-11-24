import 'regenerator-runtime/runtime';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';
import TransferForm from './components/TransferForm';
import MintForm from './components/MintForm';
import RegisterReceiverForm from './components/RegisterReceiverForm';
import SignIn from './components/SignIn';
import Notification from './components/Notification';
import spaceman from './assets/beard-white.svg';
import beardLogo from './assets/beard-white.svg';

const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [balance, setBalance] = useState(0)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    getBalance()
  }, [])

  const getBalance = () => {
    currentUser ? contract.ft_balance_of({account_id: currentUser.accountId }).then(balance => {setBalance(balance*1000000000000000000000000)}) : 0
  }

  const register = () => {
    contract.storage_deposit(
      {
        account_id: currentUser.accountId,
      },
      BOATLOAD_OF_GAS,
      Big(0.00125)
        .times(10 ** 24)
        .toFixed()
    )
  }

  const registerReceiver = (e) => {
    e.preventDefault();
    const { receiver } = e.target.elements;
    contract.storage_deposit(
      {
        account_id: receiver.value,
      },
      BOATLOAD_OF_GAS,
      Big(0.00125)
        .times(10 ** 24)
        .toFixed()
    ).then(() => {
      getBalance()
    })
  }

  const onMintSubmit = (e) => {
    e.preventDefault();
    const { fieldset, amount } = e.target.elements;
    contract.ft_mint(
      {
        receiver_id: currentUser.accountId,
        amount: amount.value,
      },
      BOATLOAD_OF_GAS,
      Big(0.01).times(10 ** 24).toFixed()
    ).then(() => {
      getBalance()
      amount.value = 0;
      fieldset.disabled = false;
      accountId.focus();
      // show Notification
      setShowNotification(true)
      setTimeout(() => {
        setShowNotification(false)
      }, 11000)
    })
  }

  const onTransferSubmit = (e) => {
    e.preventDefault();
    const { fieldset, receiverId, amount } = e.target.elements;
    fieldset.disabled = true;
    contract.ft_transfer(
      {
        receiver_id: receiverId.value,
        amount: amount.value
      },
      BOATLOAD_OF_GAS,
      Big(0.000000000000000000000001).times(10 ** 24).toFixed()
    ).then(() => {
      getBalance()
      accountId.value = '';
      amount.value = 0;
      fieldset.disabled = false;
      accountId.focus();
      // show Notification
      setShowNotification(true)
      setTimeout(() => {
        setShowNotification(false)
      }, 11000)
    })
  }

  const signIn = () => {
    wallet.requestSignIn(
      nearConfig.contractName,
      'NEARvember challenge 6'
    )
  }

  const signOut = () => {
    wallet.signOut();
    window.location.replace(window.location.origin + window.location.pathname)
  }

  return (
    <main>
      {currentUser ?
      <div>
        <header>
          <div className="account">
            <div>Hi <span>{currentUser.accountId}!</span> Your balance: <span>{(balance/1000000000000000000000000).toFixed(4)} BRD,</span> <span>{(currentUser.balance/1000000000000000000000000).toFixed(4)} NEAR</span></div>
          </div>
          <button className="signout" onClick={signOut}>Log out</button>
        </header>
        <div>
          <h1 style={{ textAlign: 'center' }}>NEARvember Challenge #6</h1>
          <div className="image-container">
              <img src={spaceman} style={{ width: '20%' }} alt="Spaceman" />
            </div>
          <h3>BEARD token <img src={beardLogo} style={{width: '32px', color: 'white'}} /> is now avilable for minting and transfering!</h3>
        </div>
      </div>
      :
      <header><button className="signin" onClick={signIn}>Log in</button></header>
      }
      { currentUser
        ? <div>
            <div>
              <p>Just a few easy steps to get BRD:</p>
              <p>
                1. Register first if you did not use BRD before{' '}
                <button className="register" onClick={register}>Register</button>
              </p>
              <p>
                2. Register the receiver to ensure they can recieve transferred tokens
              </p>
              <RegisterReceiverForm onSubmit={registerReceiver} />
                <p>3. Mint and anjoy or Transfer to your friends</p>
            </div>
            <div className="message-area">
            <div style={{ flex: 1 }}>
              <MintForm onMintSubmit={onMintSubmit} currentUser={currentUser} />
            </div>
            <div style={{ flex: 1 }}>
              <TransferForm onTransferSubmit={onTransferSubmit} currentUser={currentUser} balance={balance} />
            </div>
          </div>
        </div>
        : <SignIn />
      }
      { !!currentUser }
      {showNotification && <Notification currentUser={currentUser} amount={getBalance()} />}
    </main>
  );
};

App.propTypes = {
  contract: PropTypes.shape({
    ft_balance_of: PropTypes.func.isRequired,
    ft_mint: PropTypes.func.isRequired,
    ft_transfer: PropTypes.func.isRequired,
    // is_registered: PropTypes.func.isRequired,
    storage_deposit: PropTypes.func.isRequired
  }).isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired,
  }),
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired,
  wallet: PropTypes.shape({
    requestSignIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired
  }).isRequired
};

export default App;
