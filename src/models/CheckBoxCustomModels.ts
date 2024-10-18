import { MouseEventHandler } from "react"

type CheckBoxCustomProps = {
	repoChecked: boolean,
	handleClick: MouseEventHandler<HTMLInputElement> | undefined,
	name: string
}

export type {
    CheckBoxCustomProps
}