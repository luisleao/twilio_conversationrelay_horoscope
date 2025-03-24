
function decodeBase64ToJson(base64String) {
    try {
        // Decodifica Base64 para um array de bytes
        const binaryData = Uint8Array.from(atob(base64String), char => char.charCodeAt(0));

        // Converte para string UTF-8 corretamente
        const decodedText = new TextDecoder("utf-8").decode(binaryData);

        // Tenta converter a string para JSON
        const jsonObject = eval(`(${decodedText})`); // Usa `eval` porque o JSON fornecido não está entre aspas duplas

        return jsonObject;
    } catch (error) {
        console.error('NOT VALID JSON', base64String);
        return null;
        throw new Error("O texto não é um JSON válido ou a codificação está incorreta.");
    }
}

// Exemplo de uso
// const base64Data = btoa("{ memberID: 92099, memberNome: 'LUÃ\x8DS LEÃ\x83O' }");
// console.log(decodeBase64ToJson(base64Data));


function getFirstName(fullName) {
    return fullName.split(' ')[0];
}



module.exports = { decodeBase64ToJson, getFirstName };