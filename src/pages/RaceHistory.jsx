import { useState, useEffect } from "react"
import { useKVStore } from "../context/KVStoreContext"

const RaceHistory = ({}) => {
  const { fetchRaceHistory } = useKVStore()
  const [raceHistory, setRaceHistory] = useState({})

  useEffect(() => {
    fetchRaceHistory()
      .then((history) => {
        console.log('history: ', history)
        setRaceHistory(history)
      })
      .catch((err) => {
        setRaceHistory([])
      })
  }, [])

  return (
    <div>
      hi
    </div>
  )
}

export default RaceHistory