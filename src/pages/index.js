/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import { nftAddress, nftMarketAddress } from '../config'
import { getContracts, getNfts } from '../utils/helpers'

export default function Home() {
  const [nfts, setNfts] = useState()
  const [isLoading, setIsLoading] = useState(true)

  const loadNfts = async () => {
    const { tokenContract, marketProviderContract: marketContract } = await getContracts({}, true)
    const data = await marketContract.fetchMarketItems()
    const items = await getNfts(data, tokenContract)
    setNfts(items)
    setIsLoading(false)
  }

  const buyNft = async (nft) => {
    const { marketContract: contract } = await getContracts()
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftAddress, nft.tokenId, { value: price })
    await transaction.wait()
    loadNfts()
  }

  useEffect(() => {
    loadNfts()
  }, [])

  if (isLoading) {
    return <h1>Loading...</h1>
  }

  if (!isLoading && !nfts.length) {
    return <h1>There are no items on the marketplace</h1>
  }

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="border shadow rounded-xl overflow-hidden">
              <img alt={nft.name} src={nft.image} />
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
