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

    var url = baseUrl + "/chat/whatsappNumbers/" + instancia  + "?convert=true";
    
    let headers = {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "apikey": apikey
    };

    // Separando as opções fornecidas pelo usuário em um array
    let numbers = properties.numbers.split('|').map(number => number.trim());

    var raw = 
        {
          "numbers": numbers
          
        };
    
    let requestOptions = {
        method: 'POST',
        headers: headers,
        uri: url,
        body: raw,
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
            error_log: JSON.stringify(sentRequest.body),
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
        numeros: resultObj,
        error: error,
        log: JSON.stringify(resultObj, null, 2),
        error_log: error_log,
    };






}