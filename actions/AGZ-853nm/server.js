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

    
    var url = baseUrl + "/instance/fetchInstances";
    
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
    return {
        error: error,
        error_log: error_log,
    };
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
        instancias: resultObj,
        error: error,
        log: JSON.stringify(resultObj, null, 2),
        error_log: error_log,
    };

}
