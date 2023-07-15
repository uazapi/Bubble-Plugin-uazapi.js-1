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

    var url = baseUrl + "/group/findGroupInfos/" + instancia + "?groupJid=" + properties.groupid;
    
    let headers = {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "uazapi": "true",
        "apikey": apikey
    };

    let requestOptions = {
        method: 'GET',
        headers: headers,
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
        grupo: resultObj,
        error: error,
        log: JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""),
        error_log: error_log,
    };






}