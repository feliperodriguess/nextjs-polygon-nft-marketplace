/* eslint-disable @next/next/no-img-element */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { nftMarketAddress, nftAddress } from '../config'

import NFTMarket from '../artifacts/contracts/NFT.Market.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import { DEFAULT_WEB3_MODAL_CONFIG, getWalletInfo } from '../utils/helpers'

export default function Dashboard() {
  const [nfts, setNfts] = useState([])
  const [soldNfts, setSoldNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadNFTs() {
    const { tokenContract, marketContract } = await getWalletInfo(DEFAULT_WEB3_MODAL_CONFIG)
    const data = await marketContract.fetchItemsCreated()
    const items = await Promise.all(
      data.map(async (item) => {
        const tokenUri = await tokenContract.tokenURI(item.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(item.price.toString(), 'ether')
        const { owner, seller, sold, tokenId } = item
        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          sold,
          image: meta.data.image,
        }
      })
    )
    const soldItems = items.filter((item) => item.sold)
    setSoldNfts(soldItems)
    setNfts(items)
    setIsLoading(false)
  }

  useEffect(() => {
    loadNFTs()
  }, [])

  if (!isLoading && !nfts.length) return <h1 className="py-10 px-20 text-3xl">No assets created</h1>

  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img alt={nft.name} src={nft.image} className="rounded" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4">
        {!!soldNfts.length && (
          <div>
            <h2 className="text-2xl py-2">Items sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {soldNfts.map((nft) => (
                <div key={nft.tokenId} className="border shadow rounded-xl overflow-hidden">
                  <img alt={nft.name} src={nft.image} className="rounded" />
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
