/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'

import { DEFAULT_WEB3_MODAL_CONFIG, getContracts, getNfts } from '../utils/helpers'

export default function Dashboard() {
  const [nfts, setNfts] = useState([])
  const [soldNfts, setSoldNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const renderSoldItems = useMemo(
    () => (
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
    ),
    [soldNfts]
  )

  useEffect(() => {
    ;(async () => {
      const { tokenContract, marketContract } = await getContracts(DEFAULT_WEB3_MODAL_CONFIG)
      const data = await marketContract.fetchItemsCreated()
      const items = await getNfts(data, tokenContract)
      const soldItems = items.filter((item) => item.sold)
      setNfts(items)
      setSoldNfts(soldItems)
      setIsLoading(false)
    })()
  }, [])

  if (!isLoading && !nfts.length) return <h1 className="py-10 px-20 text-3xl">No assets created</h1>

  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="border shadow rounded-xl overflow-hidden">
              <img alt={nft.name} src={nft.image} className="rounded" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4">{!!soldNfts.length && renderSoldItems}</div>
    </div>
  )
}
