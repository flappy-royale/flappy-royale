import * as pako from "pako"

/** Take a zipped string and turn it into an obj */
export const unzip = (bin: string) => {
    if (!bin) {
        throw new Error("No bin param passed to unzip")
    }
    let uncompressed = ""
    try {
        uncompressed = pako.inflate(bin, { to: "string" })
    } catch (error) {
        console.error("Issue unzipping")
        console.error(error)
        return undefined
    }
    let decoded = decodeURIComponent(escape(uncompressed))
    try {
        let obj = JSON.parse(decoded)
        return obj
    } catch (error) {
        console.error("Issue parsing JSON: ", decoded)
        console.error(error)
    }
}

/** Convert from a JS obj to a zipped string */
export const zippedObj = (obj: object) => {
    const str = JSON.stringify(obj)
    const data = unescape(encodeURIComponent(str))
    const zipped = pako.deflate(data, { to: "string" })
    return zipped
}
