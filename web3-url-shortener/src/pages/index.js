"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getSignerContract } from "../lib/contract";
import Head from "next/head";

export default function Home() {
  const [shortCode, setShortCode] = useState("");
  const [longUrl, setLongUrl] = useState("");
  const [status, setStatus] = useState("");
  const [connected, setConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [generatedLink, setGeneratedLink] = useState(null); // New state for the generated link

  // Debug: Check the provider at mount (browser-only)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      console.log("window.ethereum:", window.ethereum);
      if (window.ethereum.isMetaMask) {
        console.log("Using MetaMask provider");
      }
      if (window.ethereum.isPhantom) {
        console.log("Using Phantom provider (Ethereum mode)");
      }
    }
  }, []);

  async function connectWallet() {
    if (
      typeof window === "undefined" ||
      typeof window.ethereum === "undefined"
    ) {
      alert("Please install MetaMask or a compatible wallet!");
      return;
    }

    try {
      console.log("Requesting accounts from provider...");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        console.log("Accounts retrieved:", accounts);
        setConnected(true);
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No accounts returned from provider.");
      }
    } catch (error) {
      console.error("User likely rejected the request:", error);
      setStatus("Connection request was rejected.");
    }
  }

  async function shortenURL() {
    if (!connected) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!shortCode || !longUrl) {
      alert("Please enter both a short code and a long URL.");
      return;
    }

    if (
      typeof window === "undefined" ||
      typeof window.ethereum === "undefined"
    ) {
      alert("No Ethereum provider found. Please install MetaMask.");
      return;
    }

    try {
      setStatus("Transaction pending...");
      const provider = new ethers.BrowserProvider(window.ethereum); // Ethers v6
      const signer = await provider.getSigner();
      const contract = getSignerContract(signer);

      console.log("Sending transaction to set URL:", { shortCode, longUrl });
      const tx = await contract.setURL(shortCode, longUrl);
      await tx.wait();

      const newLink = `${window.location.origin}/${shortCode}`;
      setGeneratedLink(newLink); // Set the generated link
      setStatus("Transaction successful!");

      console.log(`Shortened URL: ${newLink}`);
    } catch (error) {
      console.error(error);
      setStatus("Error occurred during transaction.");
    }
  }

  return (
    <>
      <Head>
        <title>Web3 URL shortener</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Web3 URL shortener" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
          <div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Web3 URL Shortener
            </h1>
          </div>
          <div className="mt-8 space-y-6">
            {connected ? (
              <p className="text-center text-sm text-gray-600">
                Connected: {currentAccount?.slice(0, 6)}...
                {currentAccount?.slice(-4)}
              </p>
            ) : (
              <button
                onClick={connectWallet}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Connect Wallet
              </button>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="text"
                  placeholder="Short code (e.g. abc123)"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Long URL (e.g. https://example.com)"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <button
                onClick={shortenURL}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Shorten
              </button>
            </div>
          </div>
          {status && (
            <div className="mt-4 text-center text-sm">
              <p
                className={`font-medium ${
                  status.includes("Error") ? "text-red-600" : "text-green-600"
                }`}
              >
                {status}
              </p>
            </div>
          )}
          {generatedLink && (
            <div className="mt-4 text-center text-sm">
              <p className="font-medium text-blue-600">
                Shortened URL:{" "}
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {generatedLink}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
