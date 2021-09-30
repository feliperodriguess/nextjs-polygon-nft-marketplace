import Head from 'next/head'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'

import { nftAddress, nftMarketAddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFT.market.sol/NFTMarket.json'

export default function Home() {
  const [nfts, setNfts] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadNFTs = async () => {
    const provider = ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, provider)
    const data = await marketContract.fetchMarketItems()
    const items = await Promise.all(
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
    setNfts(items)
    setIsLoading(false)
  }

  useEffect(() => {
    loadNFTs()
  }, [])

  if (!isLoading && !nfts.length) {
    return <h1>There are no items on the marketplace</h1>
  }

  if (isLoading) {
    return <h1>Loading...</h1>
  }

  return (
    <div>
      <h1>Home</h1>
    </div>
  )
}
