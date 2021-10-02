import { useState } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Image from 'next/image'

import { nftAddress, nftMarketAddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFT.market.sol/NFTMarket.json'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function CreateItem() {
  const router = useRouter()
  const [fileUrl, setFileUrl] = useState()
  const [form, setForm] = useState({ name: '', description: '', price: '' })

  const onFileInputChange = async (event) => {
    const file = event.target.files[0]
    try {
      const addedFile = await client.add(file, { progress: (prog) => console.log(`received: ${prog}`) })
      const url = `https://ipfs.infura.io/ipfs/${addedFile[0].path}`
      setFileUrl(url)
    } catch (error) {
      console.error(error)
    }
  }

  const createMarket = async () => {
    const { name, description } = form
    const isFormEmpty = Object.values(form).every((value) => !value)
    if (isFormEmpty) return
    const data = JSON.stringify({ name, description, image: fileUrl })

    try {
      const addedData = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${addedData[0].path}`
      createSale(url)
    } catch (error) {
      console.error(error)
    }
  }

  const createSale = async (url) => {
    const web3Modal = new Web3Modal()
    const walletConnection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(walletConnection)
    const signer = provider.getSigner()
    let contract = new ethers.Contract(nftAddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    const tx = await transaction.wait()
    const [event] = tx.events
    const value = event.args[2]
    const tokenId = value.toNumber()
    const price = ethers.utils.parseUnits(form.price, 'ether')
    contract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    transaction = await contract.createMarketItem(nftAddress, tokenId, price, { value: listingPrice })
    await transaction.wait()
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input placeholder="Asset Name" className="mt-8 border rounded p-4" onChange={(e) => setForm({ ...formInput, name: e.target.value })} />
        <textarea placeholder="Asset Description" className="mt-2 border rounded p-4" onChange={(e) => setForm({ ...formInput, description: e.target.value })} />
        <input placeholder="Asset Price in Eth" className="mt-2 border rounded p-4" onChange={(e) => setForm({ ...formInput, price: e.target.value })} />
        <input type="file" name="Asset" className="my-4" onChange={onFileInputChange} />
        {fileUrl && <Image alt={form?.name} className="rounded mt-4" src={fileUrl} width="350" />}
        <button className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg" onClick={createMarket}>
          Create Digital Asset
        </button>
      </div>
    </div>
  )
}
