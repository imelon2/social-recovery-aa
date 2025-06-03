declare global {
  interface Window {
    ethereum?: any;
  }
}

export const metamask_requestAccounts = async () => {
  if (!window.ethereum) {
    alert("MetaMask가 설치되어 있지 않습니다.");
    return;
  }

  return await window.ethereum.request({
    method: "eth_requestAccounts",
  });
};
