import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useState } from "react"
import api from "@/utils/api"

import {Button} from "@/components/ui/button"
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react"

export default function LearningGoalCard({ ...props }) {
    const [scores, setScores] = useState({})
    const [openSnapshot, setOpenSnapshot] = useState([])
    
    const fetchScores = async (snapshotId) => {
        if (openSnapshot.includes(snapshotId)) {
            setOpenSnapshot(prev => prev.filter(id => id !== snapshotId))
            return
        }   

        try {
            const response = await api(`/subject/snapshot/${snapshotId}/scores`, "GET")
            const data = await response.json()
            
            setScores(prev => ({
                ...prev,
                [snapshotId]: data.scores
            }))
            
            setOpenSnapshot(prev => [...prev, snapshotId])

        } catch (error) {
                console.error("Error fetching scores:", error)
            }
    }

    return(
        <section className="grid grid-cols-2 items-start gap-5">
            {props.data ? props.data.map((d, index) => (
                <Card key={index}>
                    <CardTitle>
                        {props.goal.title} {d.source_type.map((type) => (
                            <p key={type.external_id}>{type.external_id} - {type.type}</p>      
                        ))}
                    </CardTitle>
                        <ul key={d.id}>
                            <li>Datum: {d.date}</li>
                        </ul>
                        <Button onClick={() => fetchScores(d.id)}>
                            {openSnapshot.includes(d.id) ? "Verberg resultaten" : "Bekijk resultaten"}
                            {openSnapshot.includes(d.id)
                            ? <IconChevronUp size={18}/>
                            : <IconChevronDown size={18}/>
                            }
                        </Button>
                        
                        {openSnapshot.includes(d.id) && scores[d.id] && (

                            <div className="mt-4">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr>
                                            <th>Taxonomieniveau</th>
                                            <th>Kennen</th>
                                            <th>Kunnen</th>
                                            <th>Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scores[d.id].map((score, i) => (
                                            <tr key={i}>
                                                <td>{score.taxonomy_level}</td>
                                                <td>{score.kennen}</td>
                                                <td>{score.kunnen}</td>
                                                <td>{score.confidence}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}    
                </Card>
            )) : null}
        </section>

    );
}