import Web3Modal from 'web3modal'

export const DEFAULT_WEB3_MODAL_CONFIG = {
  network: 'mainnet',
  cacheProvider: true,
}

export const getWalletInfo = async (config) => {
  const web3Modal = new Web3Modal(config)
  const connection = await web3Modal.connect()
  const provider = new ethers.providers.Web3Provider(connection)
  const signer = provider.getSigner()
  const marketContract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer)
  const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
  return { marketContract, tokenContract }
}
