function intToHex(value) {
    const num = Number(value);
    return num.toString(16).toUpperCase().padStart(2, '0');
}

function fixZero(str, maxLength) {
    const zero = "000000000000000000000000000000000000000";
    const length = str.length;
    const diff = maxLength - length;
    let z = zero.substring(0, diff);
    z = z + str;
    return z;
}

function stringToHex(hexString) {
    let result = '';
    for (let i = 0; i < hexString.length; i++) {
        const charCode = hexString.charCodeAt(i);
        result += charCode.toString(16) + ' ';
    }
    return result.trim();
}

function getDecimalHex(value) {
    if (value === null || value === undefined) {
        return '';
    }

    const strValue = value.toString().replace(',', '.');
    const parts = strValue.split('.');
    const length = parts.length > 1 ? parts[1].length : 0;
    
    const numericValue = parseFloat(strValue.replace(/\.|,/g, ''));

    let hex = intToHex(numericValue).padStart(4, '0');

    if (hex.length === 5) {
        hex = hex.padStart(6, '0');
    } else if (hex.length === 7) {
        hex = hex.padStart(8, '0');
    }

    return intToHex(hex.length / 2) + hex + getScaleHex(length);
}

function getScaleHex(length) {
    try {
        const scaleMap = {
            0: "00",
            1: "FF",
            2: "FE",
            3: "FD",
            4: "FC",
            5: "FB",
            6: "FA"
        };
        
        return scaleMap[length] || "00";
    } catch (error) {
        return "00";
    }
}

function calCheckSum(packetData, packetLength) {
    let checkSumByte = 0x00;
    for (let i = 0; i < packetLength; i++) {
        checkSumByte ^= packetData[i];
    }
    return checkSumByte;
}

function stringToByteArray(hex) {
    hex = hex.replace(/[^0-9A-Fa-f]/g, '');

    if (hex.length % 2 !== 0) {
        throw new Error('Hex string must have an even length');
    }
    
    const byteArray = [];
    for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.substr(i, 2), 16);
        byteArray.push(byte);
    }
    
    return new Uint8Array(byteArray);
}

function genCrc(msg){
    const c = stringToByteArray(msg);
    const checksum = calCheckSum(c, c.length);
    const hexChecksum = intToHex(checksum);
    const crc = fixZero(hexChecksum, 2);
    return crc;
}

module.exports = {
    intToHex,fixZero,stringToHex,getScaleHex,getDecimalHex,calCheckSum,stringToByteArray,genCrc
};