import { EventEmitter } from "@denosaurs/event"

const BUS = new EventEmitter()

BUS.on("download-complete", (data: any) => {
    console.log("Download complete :", data.file)
})

export default BUS