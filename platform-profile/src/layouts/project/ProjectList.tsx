import {Card, CardHeader, CardTitle, CardContent, CardFooter} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {useEffect, useState} from "react";
import {cn} from "@/lib/utils.ts";

const alphas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

export default function ProjectList({className, ...props}: React.ComponentProps<"div">) {
   const [items, setItems] = useState<{ id: number; title: string; description: string }[]>([])

    useEffect(() => {
        const list = []
        for (let i = 0; i < alphas.length; i++) {
            list.push({
                id: i,
                title: alphas[i],
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            })
        }
        setItems(list)
    }, []);

    return (
        <div className={cn("", className)} {...props}>
            {items.map((item) => (
                <Card key={item.id}>
                    <CardHeader>
                        <CardTitle>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{item.description}</p>
                    </CardContent>
                    <CardFooter>
                        <Button>View</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
