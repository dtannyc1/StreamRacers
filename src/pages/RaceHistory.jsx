import { useState, useEffect } from "react"
import { useKVStore } from "../context/KVStoreContext"
import RaceLeaderboard from "../components/race-history/RaceLeaderboard"

const RaceHistory = ({}) => {
  const { fetchRaceHistory } = useKVStore()
  const [raceHistory, setRaceHistory] = useState([])

  useEffect(() => {
    updateRaceHistory()
  }, [])

  const updateRaceHistory = () => {
    fetchRaceHistory()
      .then((history) => {
        setRaceHistory(history)
      })
      .catch((err) => {
        setRaceHistory([])
      })
  }

  return (
    <RaceLeaderboard raceHistory={raceHistory} />
  )
}

export default RaceHistory