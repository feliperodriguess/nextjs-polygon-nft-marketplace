/* eslint-disable @next/next/no-img-element */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { nftMarketAddress, nftAddress } from '../config'

import NFTMarket from '../artifacts/contracts/NFT.Market.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer)
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const data = await marketContract.fetchMyNFTs()

    const items = await Promise.all(
      data.map(async (item) => {
        const tokenUri = await tokenContract.tokenURI(item.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(item.price.toString(), 'ether')
        const { owner, seller, tokenId } = item
        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image: meta.data.image,
        }
      })
    )
    setNfts(items)
    setIsLoading(false)
  }

  useEffect(() => {
    loadNFTs()
  }, [])

  if (!isLoading && !nfts.length) return <h1 className="py-10 px-20 text-3xl">No assets owned</h1>

  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft) => (
            <div key={nft.name} className="border shadow rounded-xl overflow-hidden">
              <img alt={nft.name} src={nft.image} className="rounded" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
