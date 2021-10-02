import axios from 'axios'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'

import { nftAddress, nftMarketAddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFT.market.sol/NFTMarket.json'

export default function Home() {
  const [nfts, setNfts] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadNfts = async () => {
    const provider = new ethers.providers.JsonRpcProvider()
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

  const buyNft = async (nft) => {
    const web3Modal = new Web3Modal()
    const walletConnection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(walletConnection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer)
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftAddress, nft.tokenId, { value: price })
    await transaction.wait()
    loadNfts()
  }

  useEffect(() => {
    loadNfts()
  }, [])

  if (!isLoading && !nfts.length) {
    return <h1>There are no items on the marketplace</h1>
  }

  if (isLoading) {
    return <h1>Loading...</h1>
  }

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="border shadow rounded-xl overflow-hidden">
              <Image alt={nft.name} src={nft.image} />
              <div className="p-4">
                <p style={{ height: '64px' }} className="text-2xl font-semibold">
                  {nft.name}
                </p>
                <div style={{ height: '70px', overflow: 'hidden' }}>
                  <p className="text-gray-400">{nft.description}</p>
                </div>
              </div>
              <div className="p-4 bg-black">
                <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
