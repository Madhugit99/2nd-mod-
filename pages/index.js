import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(0);
  const [captcha, setCaptcha] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [captchaSubmitted, setCaptchaSubmitted] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const generateCaptcha = () => {
    const characters = Array.from({ length: 4 }, (_, index) => ({
      value: generateRandomCharacter(index),
      style: generateRandomStyle(),
    }));

    return characters;
  };

  const generateRandomCharacter = (index) => {
    if (index % 2 === 0) {
      return String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Uppercase letter
    } else {
      return Math.floor(Math.random() * 10).toString(); // Number
    }
  };

  const generateRandomStyle = () => {
    return {
      color: getRandomColor(),
      fontWeight: getRandomFontWeight(),
    };
  };

  const getRandomColor = () => {
    const colors = ["#ff6347", "#4682b4", "#32cd32", "#ba55d3"]; // List of colors
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getRandomFontWeight = () => {
    const fontWeights = ["normal", "bold", "bolder"]; // List of font weights
    return fontWeights[Math.floor(Math.random() * fontWeights.length)];
  };

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
    }
  };

  useEffect(() => {
    // Generate captcha and set initial balance when component mounts
    setCaptcha(generateCaptcha());
    getWallet();
    getBalance(); // Added to fetch and set the initial balance
  }, []);

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
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
    handleAccount(accounts[0]);

    // once wallet is set, get a reference to our deployed contract
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
      const currentBalance = await atm.getBalance();
      setBalance(currentBalance.toNumber());
    }
  };

  const deposit = async () => {
    if (atm && captchaSubmitted) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    } else {
      alert("Please submit the captcha before performing a deposit.");
    }
  };

  const withdraw = async () => {
    if (atm && captchaSubmitted) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    } else {
      alert("Please submit the captcha before performing a withdrawal.");
    }
  };

  const handleCaptchaChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleSubmit = () => {
    if (userInput === captcha.map((char) => char.value).join("")) {
      alert("Captcha verified! You can now deposit or withdraw.");
      setCaptchaSubmitted(true);
    } else {
      alert("Incorrect captcha. Please try again.");
    }
  };

  const regenerateCaptcha = () => {
    setCaptcha(generateCaptcha());
    setUserInput("");
    setCaptchaSubmitted(false);
  };

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      <div className="atm-container">
        {!account ? (
          <button onClick={connectAccount}>Please connect your Metamask wallet</button>
        ) : (
          <div className="user-info">
            <p>Your Account: {account}</p>
            <p>Your Balance: {balance}</p>
            <div className="captcha-section">
              <p>Captcha:</p>
              {captcha.map((char, index) => (
                <span key={index} style={char.style}>
                  {char.value}
                </span>
              ))}
              <button onClick={regenerateCaptcha} disabled={captchaSubmitted}>
                Regenerate Captcha
              </button>
              <input type="text" value={userInput} onChange={handleCaptchaChange} />
              <button onClick={handleSubmit}>Submit Captcha</button>
            </div>
            <button onClick={deposit} disabled={!captchaSubmitted}>
              Deposit 1 ETH
            </button>
            <button onClick={withdraw} disabled={!captchaSubmitted}>
              Withdraw 1 ETH
            </button>
          </div>
        )}
      </div>
      <style jsx>{`
        .container {
          text-align: center;
        }

        .atm-container {
          background-color: #fff0e6; /* Eburnean */
          border: 2px solid #000;
          border-radius: 10px;
          padding: 20px;
          margin: 20px;
        }

        .user-info {
          /* Add any additional styles for the user info section */
        }

        .captcha-section {
          display: flex;
          align-items: center;

          p {
            margin-right: 10px;
          }

          span {
            margin-right: 5px;
          }

          input {
            margin-right: 10px;
          }

          button {
            margin-right: 10px;
          }
        }
      `}</style>
    </main>
  );
}
