function(properties, context) {
    
    let baseUrl = properties.url;
    if (!baseUrl || baseUrl.trim() === "" || !baseUrl.includes("http")) {
        baseUrl = context.keys["Server URL"];
    }

    if (baseUrl) {
    baseUrl = baseUrl.trim();
    	if (baseUrl.endsWith("/")) {
        	baseUrl = baseUrl.slice(0, -1);
    	}
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
    let error_log;
    try {
        sentRequest = context.request(requestOptions);
    } catch(e) {
        error = true;
        error_log = e.toString();
    }


    let resultObj = sentRequest.body;

    return {
        log: JSON.stringify(resultObj, null, 2),
        instancia: resultObj.instance?.instanceName,
        status: resultObj.instance?.status,
        apikey: resultObj.hash?.apikey,
        error: resultObj.error,
    
    };
}
