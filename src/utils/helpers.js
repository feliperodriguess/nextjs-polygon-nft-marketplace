import axios from 'axios'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'

import { nftMarketAddress, nftAddress } from '../../config'
import NFTMarket from '../../artifacts/contracts/NFT.Market.sol/NFTMarket.json'
import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'

export const DEFAULT_WEB3_MODAL_CONFIG = {
  network: 'mainnet',
  cacheProvider: true,
}

export const getNfts = async (data, tokenContract) =>
  await Promise.all(
    data.map(async (item) => {
      const tokenURI = await tokenContract.tokenURI(item.tokenId)
      const meta = await axios.get(tokenURI)
      let price = ethers.utils.formatUnits(item.price.toString(), 'ether')
      const { owner, seller, tokenId } = item
      const { name, description, image } = meta.data
      return {
        description,
        image,
        name,
        price,
        owner,
        seller,
        tokenId: tokenId.toNumber(),
      }
    })
  )

export const getContracts = async (config = null, hasJsonRpcProvider = false) => {
  const web3Modal = config ? new Web3Modal(config) : new Web3Modal()
  const connection = await web3Modal.connect()
  const provider = hasJsonRpcProvider ? new ethers.providers.JsonRpcProvider() : new ethers.providers.Web3Provider(connection)
  const signer = provider.getSigner()
  const marketContract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer)
  const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
  const tokenSignerContract = new ethers.Contract(nftAddress, NFT.abi, signer)
  const marketProviderContract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, provider)
  return { marketContract, marketProviderContract, tokenContract, tokenSignerContract }
}

export const HEADER_ITEMS = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Sell Digital Asset',
    href: '/create-item',
  },
  {
    label: 'My Digital Assets',
    href: '/my-assets',
  },
  {
    label: 'Creator Dashboard',
    href: '/dashboard',
  },
]
