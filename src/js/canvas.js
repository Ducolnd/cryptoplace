"use strict";

import React from "react";
import { Image, Stage, Layer, Rect, Group } from "react-konva"
import useImage from 'use-image';

export const colors = [
    [22, 23, 26],
    [127, 6, 34],
    [214, 36, 17],
    [255, 132, 38],
    [255, 209, 0],
    [255, 255, 255],
    [255, 128, 164],
    [255, 38, 116],
    [148, 33, 106],
    [67, 0, 103,],
    [35, 73, 117,],
    [104, 174, 212],
    [191, 255, 60],
    [16, 210, 117],
    [0, 120, 153],
    [0, 40, 89],
];

/// React Components

class CanvasImage extends React.Component {
    state = {
        image: null,
        src: process.env.NETWORK == "testnet" ? "/images/testnet.png" : "/images/mainnet.png",
    };

    componentDidMount() {
        this.loadImage();

        setInterval(this.loadImage, 10000); // Reload image every 10 seconds
    }

    componentWillUnmount() {
        this.image.removeEventListener('load', this.handleLoad);
    }
    loadImage = () => {
        if (!document.hidden) { // Detect if user is active
            this.image = new window.Image();
            this.image.src = this.state.src + "?cache=" + Date.now();
            this.image.addEventListener('load', this.handleLoad);
        }
    }
    handleLoad = () => {
        this.setState({
            image: this.image
        });

        this.imageNode.getLayer().batchDraw();
    };
    render() {
        return (
            <Image
                image={this.state.image}
                ref={node => {
                    this.imageNode = node;
                }}
            />
        );
    }
}

export class Canvas extends React.Component {
    constructor(props) {
        super(props);

        this.drawing = false;
        this.mouseDownTime = 0;
        this.pos = [];

        this.state = {
            stageScale: 2,
            stageX: 0,
            stageY: 0,
            relativePos: {},
            newPixelCallback: props.newPixel,
            newDataCallback: props.newData,
        }
    }

    handleWheel = (e) => {
        const scaleBy = 0.86;
        const maxScale = 1.0;
        const minScale = 21.0;

        const stage = e.target.getStage();
        const oldScale = stage.scaleX();

        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
        };

        let newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        newScale = Math.min(Math.max(newScale, maxScale), minScale);

        this.setState({
            stageScale: newScale,
            stageX: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            stageY: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
        });

        this.state.newDataCallback({zoom: newScale});
    }

    onMouseDown = (e) => {
        if (e.evt.button === 0) { // Left mouse click
            this.mouseDownTime = Date.now();
        }
    }
    
    onMouseUp = (e) => {
        if (e.evt.button === 0) { // Left mouse click
            if ((Date.now() - this.mouseDownTime) > 100) { // It was not a click
                return;
            }
            
            let shape = e.target;
            let pos = shape.getRelativePointerPosition();

            let key = `${Math.floor(pos.x)}${Math.floor(pos.y)}`;

            this.state.newPixelCallback(pos);
            this.pos.push(`${Math.floor(pos.x)}${Math.floor(pos.y)}`);
        }
    }

    onMove = (e) => {
        let shape = e.target;
        let pos = shape.getRelativePointerPosition();

        this.state.newDataCallback({pos: pos});
    }

    render() {
        return (
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                onWheel={this.handleWheel}
                scaleX={this.state.stageScale}
                scaleY={this.state.stageScale}
                x={this.state.stageX}
                y={this.state.stageY}
                onContextMenu={(e) => {
                    e.evt.preventDefault(); // Prevent right click menu
                }}
            >
                <Layer imageSmoothingEnabled={false}>
                    <Group
                        draggable
                        onMouseDown={this.onMouseDown}
                        onMouseMove={this.onMove}
                        onMouseUp={this.onMouseUp}
                    >
                        <Rect
                            stroke="black"
                            strokeWidth={1}
                            width={256}
                            height={256}
                            listening={false}
                        />

                        <CanvasImage />

                        {this.props.pixels.map((square, i) => {
                            return <Rect
                                x={Math.floor(square.x)}
                                y={Math.floor(square.y)}
                                width={1}
                                height={1}
                                stroke="black"
                                strokeWidth={0.01}
                                fill={`rgb(${square.r},${square.g},${square.b})`}
                                key={i}
                                listening={false}
                            />
                        })}

                    </Group>
                </Layer>
            </Stage>
        )
    }
}