function(properties, context) {
let baseUrl = properties.url;
    if (!baseUrl || baseUrl.trim() === "" || !baseUrl.includes("http")) {
        baseUrl = context.keys["Server URL"];
    }

    let apikey = properties.apikey;
    if (!apikey || apikey.trim() === "") {
        apikey = context.keys["Global APIKEY"];
    }
    
    let instancia = properties.instancia;
    if (!apikey || apikey.trim() === "") {
        apikey = context.keys["Instancia"];
    }

    var url = baseUrl + "/instance/delete/" + instancia + "?convert=true";
    
    let headers = {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "apikey": apikey
    };

    let requestOptions = {
        method: 'DELETE',
        headers: headers,
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

    if (sentRequest.statusCode.toString().charAt(0) !== "2") {
        error = true;
        error_log = JSON.stringify(sentRequest.body);
    } 

   

    return {
        error: error,
        log: JSON.stringify(sentRequest.body, null, 2),
        error_log: error_log,
    };






}