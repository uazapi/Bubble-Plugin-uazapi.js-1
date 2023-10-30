async function(properties, context) {
    //▶️ Enviar enquete
    
    let baseUrl = properties.url;
    if (!baseUrl || baseUrl.trim() === "" || !baseUrl.includes("http")) {
        baseUrl = context.keys["Server URL"];
    }

    if (baseUrl) {
        baseUrl = baseUrl.trim();
    }
    
    if (baseUrl && baseUrl.endsWith("/")) {
        baseUrl = baseUrl.slice(0, -1);
    }

    let apikey = properties.apikey;
    if (!apikey || apikey.trim() === "") {
        apikey = context.keys["Global APIKEY"];
    }
    
    if (apikey) {
        apikey = apikey.trim();
    }

    let instancia = properties.instancia;
    if (!instancia || instancia.trim() === "") {
        instancia = context.keys["Instancia"];
    }

    const url = `${baseUrl}/message/sendPoll/${instancia}`;
    
    // Separando as opções fornecidas pelo usuário em um array
    const values = properties.values.split('|').map(opcao => opcao.trim());

    const headers = {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "apikey": apikey
    };
    
    const raw = {
        "number": properties.number,
        "pollMessage": {
            "name": properties.name,
            "selectableCount": properties.selectableCount,
            "values": values
        }
    };

    let response;
    let error = false;
    let error_log;

    try {
        response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(raw)
        });

        if (!response.ok) {
            error = true;
            const responseBody = await response.json();
            return {
                error: error,
                error_log: JSON.stringify(responseBody, null, 2).replace(/"_p_/g, "\"")
            };
        }

    } catch (e) {
        error = true;
        error_log = e.toString();
    }

    const resultObj = await response.json();

    return {
        remoteJid: resultObj?.key?.remoteJid,
        fromMe: resultObj?.key?.fromMe,
        id: resultObj?.key?.id,
        status: resultObj?.status,
        error: error,
        log: JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""),
        error_log: error_log
    };
}
