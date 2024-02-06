import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [transactionValue, setTransactionValue] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    const selectedAccount = accounts[0];
    if (selectedAccount) {
      console.log("Account connected: ", selectedAccount);
      setAccount(selectedAccount);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // Once the wallet is set, get a reference to the deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balance = await atm.getBalance();
        setBalance(balance.toNumber());
      } catch (error) {
        console.error("Error getting balance:", error);
      }
    }
  };

  const updateTransactionHistory = (action, amount) => {
    const date = new Date().toLocaleString();
    const transaction = {
      action,
      amount,
      date,
    };
    setTransactionHistory((prevHistory) => [...prevHistory, transaction]);
  };

  const generateBill = () => {
    if (balance === undefined) {
      alert("Balance information is not available");
      return;
    }

    const date = new Date().toLocaleString();
    alert(`Remaining Balance: ${balance} ETH\nTransaction History:\n${formatTransactionHistory()}\nDate: ${date}`);
  };

  const formatTransactionHistory = () => {
    return transactionHistory.map((transaction, index) => {
      return `${index + 1}. ${transaction.action} - ${transaction.amount} ETH (${transaction.date})`;
    }).join('\n');
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check if the user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={() => setSelectedOption("Banking")}>Banking</button>
      </div>
    );
  };

  const renderOptionContent = () => {
    if (selectedOption === "Banking") {
      return (
        <div>
          <label>
            Enter amount:
            <input type="number" placeholder="Enter amount" value={transactionValue} onChange={(e) => setTransactionValue(e.target.value)} />
          </label>
          <button onClick={() => performTransaction("Deposit", transactionValue)}>Deposit</button>
          <button onClick={() => performTransaction("Withdrawal", transactionValue)}>Withdraw</button>
          <button onClick={generateBill}>Generate Bill</button>
        </div>
      );
    }
    return null;
  };

  const performTransaction = async (action, amount) => {
    if (!amount) {
      alert("Please enter a valid amount");
      return;
    }

    if (atm) {
      try {
        let tx;
        if (action === "Deposit") {
          tx = await atm.deposit(amount);
        } else if (action === "Withdrawal") {
          tx = await atm.withdraw(amount);
        }

        await tx.wait();
        getBalance();
        updateTransactionHistory(action, amount);
      } catch (error) {
        console.error("Error performing transaction:", error);
      }
    }
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      {renderOptionContent()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #4B5162; /* Light Navy Blue */
          color: white;
          padding: 20px;
        }
        button {
          margin: 8px;
        }
        label {
          display: block;
          margin-bottom: 8px;
        }
        input {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
        }
      `}</style>
    </main>
  );
}
