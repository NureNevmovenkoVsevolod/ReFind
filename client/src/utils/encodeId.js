import Hashids from "hashids";
const hashids = new Hashids("Refind", 12);

export function encodeId(id) {
    return hashids.encode(id);
}

export function decodeId(encoded) {
    const [id] = hashids.decode(encoded);
    if (!id) throw new Error("Invalid ID");
    return id;
}