import React, { Component } from 'react';
import {generateRandomColor} from "../utils";

//https://stackblitz.com/edit/react-ts-arf9k6?file=index.tsx,Captcha.tsx
interface IProps {
    text: string
    width: number
    height: number
    fontSize: number
    onClick?(): void
}

interface IState { }

export default class Captcha extends Component<IProps, IState> {
    private readonly canvas: React.RefObject<HTMLCanvasElement>

    constructor(props: any) {
        super(props)
        this.canvas = React.createRef()
    }

    componentDidMount() {
        this.draw()
    }

    componentDidUpdate(prevProps: { text: string; }) {
        if (prevProps.text != this.props.text) {
            this.draw()
        }
    }

    draw() {
        const { text, width, height, fontSize }: Readonly<IProps> = this.props
        if (text) {
            const ctx = this.canvas.current?.getContext('2d')
            if (ctx) {
                ctx.clearRect(0, 0, width, height)
                ctx.font = `${fontSize}px serif`
                const letters: string[] = text.split('')
                const averageWidth: number = (width - fontSize) / letters.length
                letters.forEach((letter: string, index: number) => {
                    const x: number = averageWidth * index + fontSize / 2
                    const y: number = (height + fontSize) / 2
                    const radian: number = Math.random() < 0.5
                        ? -Math.PI / 180 * Math.random() * 15
                        : Math.PI / 180 * Math.random() * 15
                    ctx.translate(x, 0)
                    ctx.rotate(radian)
                    ctx.fillStyle = generateRandomColor()
                    ctx.fillText(letter, 0, y)
                    ctx.rotate(-radian)
                    ctx.translate(-x, 0)
                })
            }
        }
    }

    render() {
        const {width, height, onClick}: Readonly<IProps> = this.props
        return (
            <canvas
                ref={this.canvas}
                width={width}
                height={height}
                onClick={onClick}
            />
        );
    }
}
