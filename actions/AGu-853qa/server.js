function(properties, context) { // adicionar async para v4
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

    var url = baseUrl + "/message/sendText/" + instancia;
    
    let headers = {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "apikey": apikey
    };
    
    var raw =  {
          "number": properties.number,
          "textMessage": {
            "text": properties.text
          },
          "options": {
            "delay": properties.delay
          }
        };

    // Adicionar "mentions" se properties.mentions for true
    if (properties.mentions === true) {
        raw.options.mentions = { "everyOne": true };
    }

    // Adicionar "quoted" se properties.quoted não estiver vazio
    if (properties.quoted && properties.quoted.trim() !== "") {
        raw.options.quoted = { key: { id: properties.quoted.trim() } };
    }
   
    
        let requestOptions = {
            method: 'POST',
            headers: headers,
            body: raw,  
            uri: url, // remover para v4
            json: true // remover para v4
        };

	
    
    let sentRequest;
    let error;
    error = false;
    let error_log;

    try {
        sentRequest = context.request(requestOptions); //remover para v4

        //v4:
        //sentRequest = await fetch(url, requestOptions);
        //let resultObj = await sentRequest.json();
   } catch(e) {
        error = true;
        error_log = e.toString();
    }

    if (sentRequest.statusCode.toString().charAt(0) !== "2") {
        error = true;
        
        return {
            error: error,
            error_log: JSON.stringify(sentRequest.body, null, 2).replace(/"_p_/g, "\""),
        }
    }   

    //remover para v4:
    let resultObj;
    try {
        resultObj = sentRequest.body;
        } catch(e) {
            error = true;
            error_log = `Error getting response body: ${e.toString()}`;
        }
    // até aqui
  
    return {
        remoteJid: resultObj?.key?.remoteJid,
        fromMe: resultObj?.key?.fromMe,
        id: resultObj?.key?.id,
        status: resultObj?.status ? resultObj?.status.toString() : undefined,
        error: error,
        log: JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""),
        error_log: error_log,
    };





}