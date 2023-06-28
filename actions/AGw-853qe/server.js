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
    if (!instancia || instancia.trim() === "") {
        instancia = context.keys["Instancia"];
    }
        
          var url = baseUrl + "/message/sendLocation/" + instancia;
        
        let headers = {
            "Accept": "*/*",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "apikey": apikey
        };
        
        var raw =  {
      "number": properties.number,
      "locationMessage": {
        "name": properties.name,
        "address": properties.address,
        "latitude": properties.latitude,
        "longitude": properties.longitude
      },
      "options": {
        "delay": properties.delay
      }
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
    
        if (sentRequest.statusCode.toString().charAt(0) !== "2") {
            error = true;
            error_log = JSON.stringify(sentRequest.body);
        } 
    
        let resultObj;
        try {
            resultObj = sentRequest.body;
        } catch(e) {
            error = true;
            error_log = `Error getting response body: ${e.toString()}`;
        }
    
      
    return {
    remoteJid: String(resultObj?.key?.remoteJid),
    fromMe: String(resultObj?.key?.fromMe),
    id: String(resultObj?.key?.id),
    status: String(resultObj?.status),
    error: String(error),
    log: JSON.stringify(resultObj, null, 2),
    error_log: String(error_log),
	};
    
    
    
    
    
    }