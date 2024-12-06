import { ethers } from "ethers";
import urlShortenerJson from "../abi/UrlShortener.json";

export function getContract() {
  
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    urlShortenerJson.abi, 
    provider
  );
  return contract;
}

export function getSignerContract(signer) {
  // Again, pass only the .abi array
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    urlShortenerJson.abi,
    signer
  );
}
