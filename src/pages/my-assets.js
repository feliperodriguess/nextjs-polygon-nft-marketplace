/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'

import { DEFAULT_WEB3_MODAL_CONFIG, getContracts, getNfts } from '../utils/helpers'

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { tokenContract, marketContract } = await getContracts(DEFAULT_WEB3_MODAL_CONFIG)
      const data = await marketContract.fetchMyNFTs()
      const items = await getNfts(data, tokenContract)
      setNfts(items)
      setIsLoading(false)
    })()
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
