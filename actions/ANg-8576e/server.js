function(properties, context) {
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


    var headers = {
      "Accept": "*/*",
      "Connection": "keep-alive",
      "Content-Type": "application/json",
      "uazapi": "true",
      "apikey": apikey,
    };

    var url = baseUrl + "/automate/scheduleMessage/" + instancia;
        
    // Separando as tags fornecidas pelo usuário em um array  
    let remoteJids = [];  
    if (properties.remoteJids) {
        remoteJids = properties.remoteJids.split('|').map(remoteJid => remoteJid.trim());
    }

    var raw = {
        "delete": properties.delete,
        "status": properties.status,
        "type": properties.type,
        "remoteJids": remoteJids,
        "when": properties.when,
        "delaySecMin": properties.delaySecMin,
        "delaySecMax": properties.delaySecMax,
    };

    //opcionais macro
    if(properties._id != null ) raw._id = properties._id.trim();
    if(properties.info) raw.info = properties.info.trim();

    //fluxo opcional
    if(properties.flowName) raw.flow = properties.flowName.trim();

    //mensagem opcional
    raw.message = {};
    //if(properties.command) raw.message.command = properties.command.trim();
    if(properties.text) raw.message.text = properties.text.trim();
    if(properties.urlOrBase64) raw.message.urlOrBase64 = properties.urlOrBase64.trim();
    if(properties.mediatype) raw.message.mediatype = properties.mediatype.trim();
    //if(properties.fileName) raw.message.fileName = properties.fileName.trim();
    if(properties.delay != null) raw.message.delay = properties.delay || 0;

   
    //  raw = JSON.stringify(raw);
    

      let requestOptions = {
        method: 'POST',
        headers: headers,
        body: raw,
        uri: url,
        json: true
    };

    let sentRequest;
    let error;
    error = false;
    let error_log;

 
    
    
    try {
        sentRequest = context.request(requestOptions);
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


    let resultObj;
    try {
        resultObj = sentRequest.body;
   } catch(e) {
        error = true;
        error_log = `Error getting response body: ${e.toString()}`;
    }

     
    
    return {
        envioagendado: resultObj,
        error: error,
        log: JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""),
        error_log: error_log,
    };

}