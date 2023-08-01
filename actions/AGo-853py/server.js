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


    var url = baseUrl + "/instance/create";
    
    let headers = {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "apikey": apikey
    };
    
    let raw = {
      "instanceName": properties.instanceName,
      "apikey": properties.apikeysenha
    };

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
        log: JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""),
        instancia: resultObj.instance?.instanceName,
        status: resultObj.instance?.status,
        apikey: resultObj.hash?.apikey,
        qrcode: resultObj.qrcode?.base64,
    	error: error,
        error_log: error_log,         
        
    };
}